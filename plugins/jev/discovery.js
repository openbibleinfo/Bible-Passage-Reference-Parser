import { choice } from './decisions.js';
import { overlaps } from './text.js';
import { discoveryInstructions, startPrompt, endPrompt } from './prompts.js';

// Exhaustive start eligibility, not one winner over all positions. Selecting a
// later expression cannot erase an earlier one. No local numeral/phrase grammar.
// The start questions alone, for callers that can ask them before the
// window's other inputs are final. Returns null when nothing is searchable.
export function startQuestions({ window, excluded, evidence }) {
  const tokens = window.tokens;
  const eligible = tokens.filter(t => !excluded.some(r => overlaps([t.start, t.end], r.indices)));
  if (!eligible.length) return null;
  const state = { ...evidence, tokens: tokens.map(({ id, text }) => ({ id, text })),
    search_tokens: eligible.map(({ id, text }) => ({ id, text })),
    instructions: `${discoveryInstructions}\n${startPrompt}\nEach start question is independent. START means a reference expression begins exactly here, even if its target is uncertain. NOT_START means this token does not begin one. Do not choose just one start for the window.` };
  const questions = Object.fromEntries(eligible.map(t => [`starts_at_${t.id}`, choice(
    `Does a Bible-reference expression START exactly at token ${t.id} (${JSON.stringify(t.text)})?`, {
      START: 'A complete reference expression starts at this token',
      NOT_START: 'Ordinary text, enclosing punctuation, an interior citation token, or otherwise not its start'
    })]));
  return { state, eligible, questions };
}

// Speculative end questions: one per eligible token, asked before any start is
// known, so that the chosen starts' ends are usually already answered. Each
// question is the sequential one with its option list cut at LOOKAHEAD tokens;
// an answer on the cut is re-asked in full. Windows with more eligible tokens
// than END_SPECULATION_TOKENS keep the sequential round, since every question
// carries the full end instructions and their cost grows with the window.
export const END_LOOKAHEAD = 16;
export const END_SPECULATION_TOKENS = 48;

// A start retrieved only by the floor (START below this) that encloses a
// start the model actually chose yields to it. Otherwise a sentence subject
// or verb at 0.1 would claim the span and the real start would be dropped as
// interior, leaving boundary review to repair it. Enclosing starts at or
// above this keep their span: a strong interior token is usually the book
// name or numeral of the same citation.
export const YIELDING_START = 0.2;

// End instructions are shared once in the request state, as the start
// instructions are; each question names only its own start token.
export function endState(state) {
  return { ...state, instructions: `${discoveryInstructions}\n${endPrompt}\nEach end question concerns ONE expression, identified by its start token; start_token is that token. Questions are independent.` };
}

function endQuestion(start, tokens, excluded, lookahead) {
  const nextExcluded = excluded.filter(r => r.indices[0] >= start.start).sort((a, b) => a.indices[0] - b.indices[0])[0];
  const possible = tokens.filter(t => t.id >= start.id && (!nextExcluded || t.end <= nextExcluded.indices[0]));
  const offered = lookahead ? possible.slice(0, lookahead) : possible;
  return { capped: offered.length < possible.length, question: choice(`For the ONE expression starting at token ${start.id} (${JSON.stringify(start.text)}) as start_token, choose its LAST token.`,
    Object.fromEntries(offered.map(t => [`token_${t.id}`, `End at token ${t.id}: ${t.text}`]))) };
}

export function endQuestions({ window, excluded, eligible }) {
  if (eligible.length > END_SPECULATION_TOKENS) return null;
  const questions = {}, capped = new Set();
  for (const start of eligible) {
    const planned = endQuestion(start, window.tokens, excluded, END_LOOKAHEAD);
    questions[`ends_from_${start.id}`] = planned.question;
    if (planned.capped) capped.add(start.id);
  }
  return { questions, capped };
}

const covers = (answers, questions) => answers && Object.keys(questions).every(id => Object.hasOwn(answers, id)) &&
  Object.keys(answers).length === Object.keys(questions).length;

export async function discoverWindow({ text, window, excluded, evidence, askMany,
  provider, maxSpans, issues, min_start_probability = 0.08, speculated }) {
  const tokens = window.tokens;
  const plan = startQuestions({ window, excluded, evidence });
  if (!plan) return [];
  const { state, eligible } = plan;
  const endPlan = endQuestions({ window, excluded, eligible });
  // Speculated answers are reused only when they cover exactly these questions.
  let starts, ends = null;
  if (covers(speculated?.starts, plan.questions)) {
    starts = speculated.starts;
    if (endPlan && covers(speculated.ends, endPlan.questions)) ends = speculated.ends;
  } else {
    // Starts and ends read the same state; separate requests keep each body
    // identical to its sequential form.
    const ending = endPlan ? askMany(endState(state), endPlan.questions) : null;
    ending?.catch(() => {});
    [starts, ends] = await Promise.all([askMany(state, plan.questions), ending]);
  }
  // Retrieval is deliberately broader than acceptance. A losing START option
  // can still be a useful candidate; classification and complete-target checks
  // remain responsible for whether the consumer receives a reference.
  let selected = eligible.filter(t => {
    const answer = starts[`starts_at_${t.id}`];
    return answer.choice === 'START' || (answer.probabilities.START > 0 && answer.probabilities.START >= min_start_probability);
  });
  if (selected.length > maxSpans) {
    issues.push({ indices: [window.start, window.end], reason: 'Window start candidates exceed span limit; later candidates were not resolved' });
    selected = selected.slice(0, maxSpans);
  }
  if (!selected.length) return [];
  // A speculative answer on the lookahead cut may want a longer span: ask in full.
  const usable = start => ends && !(endPlan.capped.has(start.id) && ends[`ends_from_${start.id}`].choice === Object.keys(endPlan.questions[`ends_from_${start.id}`].criteria).at(-1));
  const remaining = selected.filter(start => !usable(start));
  if (remaining.length) Object.assign(ends ??= {}, await askMany(endState(state), Object.fromEntries(remaining.map(start =>
    [`ends_from_${start.id}`, endQuestion(start, tokens, excluded, 0).question]))));
  const candidates = selected.map(start => {
    const end = ends[`ends_from_${start.id}`];
    const endId = Number(end.choice.slice(6));
    return { start, end, endId, indices: [start.start, tokens[endId].end], answer: starts[`starts_at_${start.id}`] };
  });
  const encloses = (outer, inner) => outer !== inner && outer.indices[0] <= inner.indices[0] && outer.indices[1] >= inner.indices[1];
  const yielding = candidates.filter(outer => outer.answer.probabilities.START < YIELDING_START &&
    candidates.some(inner => inner.answer.choice === 'START' && encloses(outer, inner)));
  const entries = [];
  for (const { start, end, endId, indices, answer } of candidates) {
    if (yielding.some(outer => outer.start === start)) continue;
    // A redundant interior start belongs to an already discovered complete span.
    // Contradictory crossing boundaries are exposed rather than silently repaired.
    if (entries.some(entry => entry.indices[0] <= indices[0] && entry.indices[1] >= indices[1])) continue;
    if (entries.some(entry => overlaps(entry.indices, indices))) {
      issues.push({ indices, reason: 'Discovered citation boundaries overlap inconsistently; candidate deferred' });
      continue;
    }
    entries.push({ source: provider, span: text.slice(...indices), indices,
      token_indices: [start.id, endId], discovery_source: 'window',
      decisions: { start: answer, end } });
  }
  return entries;
}

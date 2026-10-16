import { choice } from './decisions.js';
import { referenceText } from './hierarchy.js';
import { batchedQuestions } from './batching.js';

// Pool independent source-boundary checks across all source windows.
// Single-review evidence remains compatible with the existing interface.
export async function review_boundaries({ entries, text, windows, context, askMany }) {
  await batchedQuestions(windows.map(window => async (_ask, pooledAskMany) => {
    const group = entries.filter(entry => window.start <= entry.indices[0] && window.end >= entry.indices[1]);
    const pending = [];
    const tasks = group.map(entry => reviewBoundary({ entry, text, window, context,
      askMany: (evidence, questions) => new Promise((resolve, reject) => pending.push({ evidence, questions, resolve, reject })) }));
    if (!pending.length) { await Promise.all(tasks); return; }
    try {
      if (pending.length === 1) {
        pending[0].resolve(await pooledAskMany(pending[0].evidence, pending[0].questions));
      } else {
        const reviews = {}, questions = {};
        pending.forEach((item, index) => {
          const id = `review_${index}`;
          reviews[id] = { span: item.evidence.span, reference: item.evidence.reference, tokens: item.evidence.tokens };
          for (const [name, question] of Object.entries(item.questions)) {
            questions[`${id}_${name}`] = { ...question, instructions: `For ${id} only, choose the ${name === 'boundary_start' ? 'FIRST' : 'LAST'} token of its complete citation phrase, or KEEP its current boundary. Apply the shared boundary-review instructions. Token choices refer only to the tokens listed for ${id}.` };
          }
        });
        const answers = await pooledAskMany({ stage: 'boundary_review', window_text: window.text, background_context: context, reviews, instructions: pending[0].evidence.instructions }, questions);
        pending.forEach((item, index) => item.resolve(Object.fromEntries(Object.keys(item.questions)
          .map(name => [name, answers[`review_${index}_${name}`]]))));
      }
    } catch (error) {
      pending.forEach(item => item.reject(error));
      await Promise.allSettled(tasks);
      throw error;
    }
    await Promise.all(tasks);
  }), askMany);
}

// The target consumers see, even when its probability is below the discourse
// threshold. Source trimming must not promote that interpretation.
export function reviewTarget(entry) {
  return entry.canonical ?? entry.interpretations?.filter(i => i.probability > 0)
    .toSorted((a, b) => b.probability - a.probability)[0]?.reference;
}

// Build the boundary questions for a citation without dispatching them, so the
// request can share an HTTP body with the final interpretation question.
// Returns null when no side has a possible tighter token.
export function boundaryPlan({ entry, text, window, context, reference }) {
  const original = { span: entry.span, indices: [...entry.indices], token_indices: [...entry.token_indices] };
  const tokens = window.tokens.filter(t => t.start >= entry.indices[0] && t.end <= entry.indices[1]);
  const preview = value => Array.from(value).slice(0, 16).join('');
  const startCriteria = { KEEP: 'The current start already tightly bounds the citation phrase',
    UNRESOLVED: 'Cannot determine a tighter start without losing part of this citation' };
  const endCriteria = { KEEP: 'The current end already tightly bounds the citation phrase',
    UNRESOLVED: 'Cannot determine a tighter end without losing part of this citation' };
  for (const token of tokens) {
    if (token.start > entry.indices[0]) startCriteria[`token_${token.id}`] = `Start here: ${JSON.stringify(preview(text.slice(token.start, entry.indices[1])))}`;
    if (token.end < entry.indices[1]) endCriteria[`token_${token.id}`] = `End after: ${JSON.stringify(Array.from(text.slice(entry.indices[0], token.end)).slice(-16).join(''))}`;
  }
  const instructions = 'Review ONLY the source boundaries of the already resolved citation. Keep its reference unchanged. Select the smallest complete referring phrase that expresses this reference using the surrounding context. An earlier book-topic sentence supplies context; it is not part of a later chapter/verse citation. Exclude subjects, introductory requests such as read, see, or compare, verbs expressing liking/reading/discussing, and unrelated assertions. In a request to compare a named chapter, begin at the chapter phrase rather than the word compare. Retain all stated chapter/verse numbers, range endpoints, list members, direction and subdivision. Numerical extents written as words belong to the citation, including a count of initial chapters; trimming to the book name alone would lose that target extent. Exclude enclosing parentheses: "(7)" must return "7", and "(2:5)" must return "2:5". Articles belonging to the referring phrase may remain. Trim only within the current span; never expand it or choose a different citation. Choose KEEP if already tight, UNRESOLVED if uncertain. Start and end must describe the same complete phrase.';
  const questions = {};
  if (Object.keys(startCriteria).length > 2) questions.boundary_start = choice(instructions + ' Choose the FIRST token, or keep the current start.', startCriteria);
  if (Object.keys(endCriteria).length > 2) questions.boundary_end = choice(instructions + ' Choose the LAST token, or keep the current end.', endCriteria);
  if (!Object.keys(questions).length) return null;
  const evidence = { stage: 'boundary_review', window_text: window.text, background_context: context, span: entry.span,
    reference: referenceText(reference), tokens: tokens.map(({ id, text }) => ({ id, text })), instructions };
  return { evidence, questions, tokens, original };
}

// Apply answered boundary questions to a citation whose offsets still equal the plan's original offsets.
export function applyBoundary(entry, { questions, tokens, original }, requested, text) {
  Object.assign(entry.decisions, Object.fromEntries(Object.keys(questions).map(name => [name, requested[name]])));
  // Unrequested sides are fixed by the token grid, not model-scored choices.
  const keep = { choice: 'KEEP', probabilities: { KEEP: 1 } };
  const answers = { boundary_start: requested.boundary_start ?? keep, boundary_end: requested.boundary_end ?? keep };
  const selected = (answer, side) => answer.choice === 'KEEP' ? original.indices[side]
    : tokens.find(t => `token_${t.id}` === answer.choice)?.[side === 0 ? 'start' : 'end'];
  const start = selected(answers.boundary_start, 0), end = selected(answers.boundary_end, 1);
  let action = 'kept';
  if ([answers.boundary_start, answers.boundary_end].some(a => a.choice === 'UNRESOLVED')) action = 'unresolved';
  else if (start === undefined || end === undefined || start >= end) action = 'invalid';
  else if (start !== original.indices[0] || end !== original.indices[1]) {
    action = 'trimmed';
    entry.indices = [start, end];
    entry.span = text.slice(start, end);
    entry.token_indices = [tokens.find(t => t.start === start).id, tokens.find(t => t.end === end).id];
  }
  entry.boundary_review = { action, original, probability: Math.min(
    answers.boundary_start.probabilities[answers.boundary_start.choice],
    answers.boundary_end.probabilities[answers.boundary_end.choice]) };
}

// After interpretation, review only boundaries with possible tighter tokens.
export async function reviewBoundary({ entry, text, window, context, askMany, reference = reviewTarget(entry) }) {
  if (!reference) return;
  const plan = boundaryPlan({ entry, text, window, context, reference });
  if (!plan) return;
  applyBoundary(entry, plan, await askMany(plan.evidence, plan.questions), text);
}

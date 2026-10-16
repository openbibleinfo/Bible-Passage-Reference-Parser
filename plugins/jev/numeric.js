import { choice } from './decisions.js';
import { branches, chooseInterpretation, hierarchyQuestions } from './hierarchy.js';
import { parseReference } from './resolver.js';

// Address parts are inferred directly from the selected expression and context.
// Offering all valid numerical positions avoids a phrase grammar or restricted book list.
export function numericQuestions(chapters) {
  const tables = Object.values(chapters);
  // Trailing zero entries are chapters disabled by the testaments option; they are not offered.
  const chapterMaximum = Math.max(...tables.map(table => table.findLastIndex(Boolean) + 1));
  const verseMaximum = Math.max(...tables.flat());
  // A one-chapter book fixes its chapter structurally: the client answers a
  // single-option question locally, without a paid request.
  const numbers = (prefix, maximum, label) => Object.fromEntries([
    ...Array.from({ length: maximum }, (_, i) => [`${prefix}_${i + 1}`, `${label} ${i + 1}`]),
    ...(prefix === 'chapter' && maximum === 1 ? [] : [['UNRESOLVED', 'This address part is not justified or does not apply']])
  ]);
  return {
    chapter: choice('What is the target chapter number, or FIRST chapter of a range? Read the chapter written in span; otherwise inherit the governing chapter from preceding_context and supporting prose. A local chapter switch overrides an older chapter in discourse or window_reference, even if the earlier citation was not accepted as an AI target. Interpret Arabic, Roman, or English number words. Dates/times and a later independent verse number are not chapter switches. If the governing chapter is not justified choose UNRESOLVED; do not default to stale state.', numbers('chapter', chapterMaximum, 'Beginning/target chapter')),
    verse: choice('What is the target verse number, or FIRST verse of a range? Interpret the numeral (Arabic, Roman, or English number words) using the expression and context. For chapter/book-only targets or insufficient evidence choose UNRESOLVED.', numbers('verse', verseMaximum, 'Beginning/target verse')),
    end_chapter: choice('If this expression specifies a range, what is its LAST chapter number? Infer it from the complete citation and context, using the beginning chapter when the whole range stays in that chapter. For a single verse, whole chapter/book, or unspecified endpoint choose UNRESOLVED.', numbers('chapter', chapterMaximum, 'Ending chapter')),
    end_verse: choice('If this expression specifies a range, what is its LAST verse number? Interpret its ending numeral (Arabic, Roman, or English number words) from the expression and context. For a single verse, whole chapter/book, or unspecified endpoint choose UNRESOLVED.', numbers('verse', verseMaximum, 'Ending verse'))
  };
}

export function listCountQuestion() {
  const maximumMembers = 8;
  return choice('How many separate target members does span itself cite? Count requested targets, not the number of numerals. A shared book or chapter qualifier locates the members and is NOT an additional member: "verses two and seven of chapter nine" has TWO members, both in chapter nine. Count each individual verse, chapter, book, or contiguous range as ONE member. A range with several verses is one member; conjunctions joining separated verses do not fill intervening gaps. Never count another citation outside span. Choose TOO_MANY when more than eight members are specified, and UNRESOLVED if the complete list cannot be identified.', {
    ...Object.fromEntries(Array.from({ length: maximumMembers - 1 }, (_, i) => [`members_${i + 2}`, `${i + 2} separate targets`])),
    TOO_MANY: 'More than eight targets', UNRESOLVED: 'Member count or list meaning is not established'
  });
}

// Membership depends on the expression, not on nearby independent citations.
// Keep surrounding context for address inference, where it is actually needed.
export function listCountEvidence(evidence) {
  return { span: evidence.span,
    instructions: 'Count only members written in span. Book/chapter qualifiers supply shared locations, not additional targets. No other expressions are part of this list.' };
}

// Establish the target shape before asking only its applicable address parts.
async function addressAnswers({ evidence, chapters, ask, askMany, initialAnswers = {} }) {
  const hierarchy = hierarchyQuestions(chapters);
  const scope = initialAnswers.scope ?? await ask('scope', evidence, hierarchy.scope);
  const answers = { scope, ...(initialAnswers.list_count ? { list_count: initialAnswers.list_count } : {}) };
  if (!['book', 'chapter', 'chapter_range', 'verse', 'range', 'approximate'].includes(scope.choice)) return answers;
  const state = { ...evidence, target_shape: scope.choice };
  answers.book = initialAnswers.book ?? await ask('book', state, hierarchy.book);
  const candidateBooks = Object.fromEntries(branches(answers.book, 2, 0.08)
    .filter(([id]) => chapters[id]).map(([id]) => [id, chapters[id]]));
  if (scope.choice === 'book' || !Object.keys(candidateBooks).length) return answers;
  const available = numericQuestions(candidateBooks);
  const fields = scope.choice === 'chapter' ? ['chapter']
    : scope.choice === 'chapter_range' ? ['chapter', 'end_chapter']
    : ['verse', 'approximate'].includes(scope.choice) ? ['chapter', 'verse'] : ['chapter', 'verse', 'end_chapter', 'end_verse'];
  const questions = Object.fromEntries(fields.filter(id => !initialAnswers[id]).map(id => [id, available[id]]));
  if (scope.choice === 'approximate' && questions.verse) questions.verse = { ...questions.verse,
    instructions: 'Does this approximate passage explicitly identify a FIRST verse number? If so, identify that beginning verse using Arabic, Roman, or English number words. For wording such as verses 5ff or verse 5 and following, the first verse is 5. Do not invent a starting verse for vague regions or descriptions. Choose UNRESOLVED unless a beginning verse is actually supplied.' };
  if (scope.choice === 'verse' && !initialAnswers.subdivision) questions.subdivision = hierarchy.subdivision;
  const inferred = Object.keys(questions).length ? await askMany(state, questions) : {};
  for (const id of fields) answers[id] = initialAnswers[id] ?? inferred[id];
  if (initialAnswers.subdivision ?? inferred.subdivision) answers.subdivision = initialAnswers.subdivision ?? inferred.subdivision;
  return answers;
}

// Independent members share one request at each dependency level.
async function listAddressAnswers({ evidence, chapters, length, askMany }) {
  const members = Array.from({ length }, (_, i) => ({ index: i + 1, answers: {} }));
  const hierarchy = hierarchyQuestions(chapters);
  const runStage = async build => {
    const questions = {}, owners = {};
    for (const member of members) {
      for (const [field, question] of Object.entries(build(member))) {
        const name = `member_${member.index}_${field}`;
        owners[name] = { member, field };
        questions[name] = { ...question, instructions: `For member ${member.index} of ${length} ONLY, written in ${JSON.stringify(evidence.span)}. Shared book/chapter qualifiers locate members; they are not extra members. Do not take a member from another sentence or citation. ${question.instructions}` };
      }
    }
    if (!Object.keys(questions).length) return;
    const answers = await askMany({ ...evidence, list_member_count: length,
      list_members: Object.fromEntries(members.map(member => [`member_${member.index}`, {
        index: member.index, ...(member.answers.scope ? { target_shape: member.answers.scope.choice } : {})
      }])),
      instructions: `${evidence.instructions ?? ''}\nEach question identifies one member of span in written order. Keep the complete span as context. Inherit shared book/chapter and verse/chapter wording where justified. Treat an explicitly connected range as one member. Never fill gaps between separate members or copy another member's endpoint.` }, questions);
    for (const [name, answer] of Object.entries(answers)) owners[name].member.answers[owners[name].field] = answer;
  };
  // A member's book is read from the shared span and prose, not from its shape,
  // so both are asked together; books of unsupported shapes are discarded.
  await runStage(() => ({ scope: hierarchy.scope, book: hierarchy.book }));
  for (const member of members) if (!['book', 'chapter', 'chapter_range', 'verse', 'range'].includes(member.answers.scope.choice)) delete member.answers.book;
  await runStage(member => {
    const scope = member.answers.scope.choice;
    if (!member.answers.book || scope === 'book') return {};
    const candidateBooks = Object.fromEntries(branches(member.answers.book, 2, 0.08)
      .filter(([id]) => chapters[id]).map(([id]) => [id, chapters[id]]));
    if (!Object.keys(candidateBooks).length) return {};
    const available = numericQuestions(candidateBooks);
    const fields = scope === 'chapter' ? ['chapter'] : scope === 'chapter_range' ? ['chapter', 'end_chapter'] : scope === 'verse' ? ['chapter', 'verse']
      : ['chapter', 'verse', 'end_chapter', 'end_verse'];
    return Object.fromEntries(fields.map(field => [field, available[field]]));
  });
  return members.map(member => member.answers);
}

export async function resolveNumerically({ evidence, entry, chapters, existence = 'bcv', ask, askMany, initialAnswers = {}, min_interpretation_probability, alongside }) {
  evidence = { ...evidence, span: entry.span };
  initialAnswers = await addressAnswers({ evidence, chapters, ask, askMany, initialAnswers });
  const scope = initialAnswers.scope.choice;
  entry.decisions.scope = initialAnswers.scope;
  entry.scope_choice = scope;
  if (scope === 'multiple') return resolveList({ evidence, entry, chapters, existence, ask, askMany, initialAnswers, min_interpretation_probability, alongside });
  if (!['book', 'chapter', 'chapter_range', 'verse', 'range', 'approximate'].includes(scope)) {
    if (scope === 'semantic') return {
      status: 'needs_search', needs_semantic_resolution: true, interpretations: [],
      reason: 'Passage identification needs semantic evidence or a stronger model; exact boundaries are not established',
      escalation: semanticEscalation(evidence, entry)
    };
    return { status: 'unresolved', interpretations: [] };
  }
  let candidates = numericCandidates(entry, chapters, initialAnswers, false, existence);
  const unknownEndpoint = scope === 'approximate' || (scope === 'range' &&
    [initialAnswers.end_chapter, initialAnswers.end_verse].some(answer => answer?.choice === 'UNRESOLVED'));
  if (!candidates.size && unknownEndpoint && initialAnswers.verse?.choice !== 'UNRESOLVED') {
    candidates = numericCandidates(entry, chapters, initialAnswers, true, existence);
    if (candidates.size) entry.endpoint_status = 'unresolved';
  }
  if (!candidates.size) {
    if (scope === 'approximate') return {
      status: 'needs_search', needs_semantic_resolution: true, interpretations: [],
      reason: 'Passage boundaries are not established', escalation: semanticEscalation(evidence, entry)
    };
    return { status: 'unresolved', interpretations: [], reason: 'No valid complete numeric candidate from the supplied address choices' };
  }
  const result = await chooseInterpretation({ evidence, entry, candidates, scope, ask,
    min_interpretation_probability, subdivisionAnswer: initialAnswers.subdivision, alongside });
  return entry.endpoint_status === 'unresolved' ? { ...result, needs_semantic_resolution: true,
    escalation: semanticEscalation(evidence, entry) } : result;
}

function semanticEscalation(evidence, entry) {
  return { type: 'semantic_resolution', expression: entry.span, context: {
    window_text: evidence.window_text, background_context: evidence.background_context ?? '',
    preceding_context: evidence.preceding_context ?? '', following_context: evidence.following_context ?? '',
    selected_antecedent: evidence.selected_antecedent ?? null,
    accepted_references: structuredClone(evidence.explicit_references_in_window ?? []),
    discourse: structuredClone(evidence.discourse ?? {})
  } };
}

function numericCandidates(entry, chapters, initialAnswers, beginningOnly = false, existence = 'bcv') {
  const scope = initialAnswers.scope.choice;
  for (const id of ['scope', 'book', 'chapter', 'verse', 'end_chapter', 'end_verse']) if (initialAnswers[id]) entry.decisions[id] = initialAnswers[id];
  entry.scope_choice = scope;
  entry.book_probabilities = { ...initialAnswers.book.probabilities };
  const candidates = new Map();
  const add = (reference, score) => { if (parseReference(reference, chapters, existence)) candidates.set(reference, (candidates.get(reference) ?? 0) + score); };
  const numbered = (answer, prefix, width) => (answer ? branches(answer, width, 0.08) : []).map(([id, p]) => [Number(id.slice(prefix.length + 1)), p]);
  for (const [book, bp] of branches(initialAnswers.book, 2, 0.08)) {
    if (!chapters[book]) continue;
    if (scope === 'book') { add(book, bp); continue; }
    // Ordering here; existence follows the parser's strategy in add().
    for (const [chapter, cp] of numbered(initialAnswers.chapter, 'chapter', 2)) {
      if (scope === 'chapter') { add(`${book}.${chapter}`, bp * cp); continue; }
      if (scope === 'chapter_range') {
        for (const [endChapter, ecp] of numbered(initialAnswers.end_chapter, 'chapter', 2)) {
          if (endChapter < chapter) continue;
          add(chapter === endChapter ? `${book}.${chapter}` : `${book}.${chapter}-${book}.${endChapter}`, bp * cp * ecp);
        }
        continue;
      }
      for (const [verse, vp] of numbered(initialAnswers.verse, 'verse', scope === 'range' ? 1 : 3)) {
        const beginning = `${book}.${chapter}.${verse}`;
        if (scope === 'verse' || beginningOnly) { add(beginning, bp * cp * vp); continue; }
        for (const [endChapter, ecp] of numbered(initialAnswers.end_chapter, 'chapter', 1)) {
          if (endChapter < chapter) continue;
          for (const [endVerse, evp] of numbered(initialAnswers.end_verse, 'verse', 2)) {
            if (endChapter === chapter && endVerse < verse) continue;
            const ending = `${book}.${endChapter}.${endVerse}`;
            add(beginning === ending ? beginning : `${beginning}-${ending}`, bp * cp * vp * ecp * evp);
          }
        }
      }
    }
  }
  entry.candidate_paths = [...candidates].map(([reference, path_score]) => ({ reference, path_score }));
  return candidates;
}

async function resolveList({ evidence, entry, chapters, existence, ask, askMany, initialAnswers, min_interpretation_probability, alongside }) {
  entry.scope_choice = 'multiple';
  entry.decisions.scope = initialAnswers.scope;
  // The bound limits paid requests and combination growth, not the vocabulary of number words.
  const maximumCandidates = 16;
  const count = initialAnswers.list_count ?? await ask('list_count', listCountEvidence(evidence), listCountQuestion());
  entry.decisions.list_count = count;
  if (count.choice === 'TOO_MANY') return { status: 'needs_search', interpretations: [], reason: 'Disjoint list exceeds the eight-member resolution limit' };
  if (count.choice === 'UNRESOLVED') return { status: 'unresolved', interpretations: [], reason: 'Disjoint list membership is not established' };
  const length = Number(count.choice.slice(8));
  const memberAnswers = await listAddressAnswers({ evidence, chapters, length, askMany });
  let combinations = [{ references: [], score: 1 }];
  for (let index = 1; index <= length; index++) {
    const answers = memberAnswers[index - 1];
    const member = { decisions: {} };
    for (const [id, answer] of Object.entries(answers)) entry.decisions[`member_${index}_${id}`] = answer;
    if (!['book', 'chapter', 'chapter_range', 'verse', 'range'].includes(answers.scope.choice)) return {
      status: 'unresolved', interpretations: [], reason: `List member ${index} does not have a supported exact target shape`
    };
    const candidates = numericCandidates(member, chapters, answers, false, existence);
    if (!candidates.size) return { status: 'unresolved', interpretations: [], reason: `List member ${index} has no valid complete target` };
    combinations = combinations.flatMap(previous => [...candidates].map(([reference, score]) => ({
      references: [...previous.references, reference], score: previous.score * score
    }))).sort((a, b) => b.score - a.score).slice(0, maximumCandidates);
  }
  const candidates = new Map();
  for (const combination of combinations) {
    const reference = combination.references.join(',');
    candidates.set(reference, (candidates.get(reference) ?? 0) + combination.score);
  }
  entry.candidate_paths = [...candidates].map(([reference, path_score]) => ({ reference, path_score }));
  return chooseInterpretation({ evidence, entry, candidates, scope: 'multiple', ask,
    min_interpretation_probability, subdivisionAnswer: initialAnswers.subdivision, alongside });
}

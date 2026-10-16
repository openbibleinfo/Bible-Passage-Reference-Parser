import assert from 'node:assert/strict';
import { loadParser } from './parser.js';
import { FuzzyReferenceParser, JevClient } from '../../index.js';
import { referenceText } from '../../hierarchy.js';
import { tokenize } from '../../text.js';
const answer = (q, selected, probabilities) => {
  assert.ok(Object.hasOwn(q.criteria, selected), `Unavailable choice ${selected}`);
  return { type: 'choice', choice: selected, confidence: 1,
    probabilities: probabilities ?? Object.fromEntries(Object.keys(q.criteria).map(key => [key, Number(key === selected)])) };
};

// Scripted decisions test output equivalence and the actual HTTP schedule, not
// model accuracy. Rows supply deliberately perfect predictions for each stage.
export function scripted(fixture, { dependency, unresolved, review = 'ACCEPT', detectNonReferences = true, distributions = {}, subdivisions = {}, boundary = {}, ends = {} } = {}) {
  const tokens = tokenize(fixture.text);
  const rows = fixture.expected.map(row => ({ ...row,
    start: tokens.find(t => t.start === row.indices[0]).id,
    end: tokens.find(t => t.end === row.indices[1]).id }));
  const calls = [];
  const decide = (state, questions) => {
    calls.push({ state, questions, fields: Object.keys(questions).map(name => name.replace(/^task_\d+_/, '')),
      bytes: Buffer.byteLength(JSON.stringify({ state, questions })) });
    return Object.fromEntries(Object.entries(questions).map(([name, q]) => {
      const match = name.match(/^(task_\d+)_(.+)$/);
      const field = match?.[2] ?? name;
      const local = match ? { ...state, ...state.tasks[match[1]] } : state;
      let selected;
      const localText = local.window_text ?? fixture.text;
      const localTokens = tokenize(localText), offset = fixture.text.indexOf(localText);
      const localRows = offset < 0 ? [] : rows.filter(row => row.indices[0] >= offset && row.indices[1] <= offset + localText.length)
        .map(row => ({ ...row,
          start: localTokens.find(token => token.start === row.indices[0] - offset).id,
          end: localTokens.find(token => token.end === row.indices[1] - offset).id }));
      if (local.bcv_proposals) selected = local.window_text === fixture.text ? review : 'ACCEPT';
      else if (field.startsWith('starts_at_')) selected = localRows.some(row => row.start === Number(field.slice(10)) && (detectNonReferences || row.osis)) ? 'START' : 'NOT_START';
      else if (field.startsWith('ends_from_')) {
        // Speculative end questions exist for every eligible token; only genuine starts have a scripted end.
        const row = localRows.find(row => row.start === Number(field.slice(10)));
        // Non-row starts end at themselves unless the test scripts a longer span.
        const scriptedEnd = ends[Number(field.slice(10))];
        selected = row && Object.hasOwn(q.criteria, `token_${row.end}`) ? `token_${row.end}`
          : scriptedEnd !== undefined && Object.hasOwn(q.criteria, `token_${scriptedEnd}`) ? `token_${scriptedEnd}` : Object.keys(q.criteria)[0];
      }
      else if (local.stage === 'boundary_review') selected = boundary[field.replace(/^review_\d+_/, '')] ?? 'KEEP';
      else {
        const row = rows.find(row => row.span === local.span);
        assert.ok(row, `No scripted row for ${local.span}`);
        let target = row.osis;
        const member = field.match(/^member_(\d+)_(.+)$/);
        const part = member?.[2] ?? field;
        if (member) target = target.split(',')[Number(member[1]) - 1];
        const [beginning, ending] = (target ?? '').split('-');
        const [book, chapter, verse] = beginning.split('.');
        const end = ending?.split('.');
        selected = part === 'classification' ? (row.classification ?? (target ? 'BIBLE_REFERENCE' : 'NOT_A_BIBLE_REFERENCE'))
          : part === 'citation_scope' ? (row.reference_kind === 'relative' ? 'RELATIVE' : row.reference_kind === 'semantic' ? 'SEMANTIC' : row.reference_kind === 'unresolved' ? 'UNRESOLVED' : 'NUMERIC')
          : part === 'translation' ? (row.translations?.[0] || 'NONE')
          : part === 'scope' ? row.shape ?? (member ? (ending ? 'range' : verse ? 'verse' : chapter ? 'chapter' : 'book')
            : (target ?? '').includes(',') ? 'multiple' : ending ? 'range' : verse ? 'verse' : chapter ? 'chapter' : 'book')
          : part === 'antecedent' ? (dependency?.[row.span] ?? 'NONE')
          : part === 'list_count' ? ((target ?? '').includes(',') ? `members_${target.split(',').length}` : 'UNRESOLVED')
          : part === 'book' ? (unresolved?.includes(row.span) || !book ? 'UNRESOLVED' : book)
          : (part === 'chapter' || part.startsWith('chapter_')) ? `chapter_${chapter}`
          : (part === 'verse' || part.startsWith('verse_')) ? `verse_${verse}`
          : (part === 'end_chapter' || part.startsWith('end_chapter_')) ? `chapter_${end[1]}`
          : (part === 'end_verse' || part.startsWith('end_verse_')) ? `verse_${end[2]}`
          : part === 'subdivision' ? subdivisions[row.span] ?? 'whole'
          : part === 'interpretation' ? Object.entries(local.candidates).find(([, value]) => value === referenceText(target))?.[0] : undefined;
      }
      let probabilities = distributions[field];
      if (field === 'interpretation' && probabilities) probabilities = Object.fromEntries(Object.entries(probabilities)
        .map(([reference, probability]) => [reference === 'UNRESOLVED' ? reference : Object.entries(local.candidates)
          .find(([, readable]) => readable === referenceText(reference))[0], probability]));
      if (probabilities) probabilities = Object.fromEntries(Object.keys(q.criteria).map(key => [key, probabilities[key] ?? 0]));
      return [name, answer(q, selected, probabilities)];
    }));
  };
  const client = new JevClient({ api_key: 'test-key', fetch: async (_url, options) => {
    const { state, questions } = JSON.parse(options.body);
    return new Response(JSON.stringify({ answers: decide(state, questions), usage: { cost: 0 } }), { status: 200 });
  } });
  return { client, calls };
}

export async function run(fixture, options = {}) {
  const { client, calls } = scripted(fixture, options);
  const result = await new FuzzyReferenceParser({ parser: options.parser ?? await loadParser(), decisions: client,
    ...options.parserOptions }).parse(fixture.text, { context: fixture.context });
  if (fixture.expected.length) assert.ok(calls.some(call => call.fields.some(field => field.startsWith('starts_at_'))), 'Transport must use window discovery');
  return { result, calls };
}

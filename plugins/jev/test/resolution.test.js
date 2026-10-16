// Numeric address resolution: shapes, books, lists, Roman and word numbers, partial verses (src/numeric.js, src/hierarchy.js, src/partial-verses.js).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parsedEntities } from '../entities.js';
import { hierarchyQuestions, BOOKS, referenceText } from '../hierarchy.js';
import { FuzzyReferenceParser } from '../index.js';
import { numericQuestions, resolveNumerically } from '../numeric.js';
import { preserveVerseParts } from '../partial-verses.js';
import { parserChapters, parseReference } from '../resolver.js';
import { aiReference } from '../results.js';
import { expressionDiagnostics } from './support/diagnostics.js';
import { scoreCase } from './support/evaluation.js';
import { loadParser } from './support/parser.js';
import { scripted } from './support/window-client.js';

// numeric fast

function answer(question, selected, probability = 1) {
  assert.ok(Object.hasOwn(question.criteria, selected), selected);
  return { type: 'choice', choice: selected, confidence: probability,
    probabilities: Object.fromEntries(Object.keys(question.criteria).map(k => [k,
      k === selected ? probability : k === 'UNRESOLVED' ? 1 - probability : 0])) };
}
async function probe(selections, finalProbability = 1) {
  const parser = await loadParser();
  const chapters = parser.translation_info().chapters;
  const questions = { ...hierarchyQuestions(chapters), ...numericQuestions(chapters) };
  const answers = Object.fromEntries(Object.entries(questions).map(([id, q]) =>
    [id, answer(q, selections[id] ?? (id === 'subdivision' ? 'whole' : 'UNRESOLVED'))]));
  const entry = { span: 'Selected numeric expression', decisions: {} };
  const asked = [];
  const result = await resolveNumerically({ evidence: {}, entry, chapters, initialAnswers: answers,
    min_interpretation_probability: 0.9, ask: async (id, state, q) => {
      asked.push(id);
      assert.equal(id, 'interpretation');
      return answer(q, 'candidate_0', finalProbability);
    } });
  return { result, entry, asked };
}

test('flat numeric addresses discard invalid chapters, verses, reversed ranges, and missing context', async () => {
  for (const selections of [
    { scope: 'verse', book: '1Pet', chapter: 'chapter_6', verse: 'verse_9' },
    { scope: 'verse', book: '1Pet', chapter: 'chapter_2', verse: 'verse_26' },
    { scope: 'range', book: 'Rom', chapter: 'chapter_8', verse: 'verse_4', end_chapter: 'chapter_8', end_verse: 'verse_3' },
    { scope: 'range', book: 'Rom', chapter: 'chapter_8', verse: 'verse_4', end_chapter: 'chapter_7', end_verse: 'verse_5' },
    { scope: 'verse', chapter: 'chapter_8', verse: 'verse_28' }
  ]) {
    const { result, asked } = await probe(selections);
    assert.equal(result.status, 'unresolved');
    assert.equal(result.canonical, undefined);
    assert.deepEqual(asked, []);
  }
});

test('fast numeric mode verifies valid complete targets and retains the exact acceptance threshold', async () => {
  const valid = { scope: 'verse', book: '1Pet', chapter: 'chapter_2', verse: 'verse_9' };
  const resolved = await probe(valid);
  assert.equal(resolved.result.canonical, '1Pet.2.9');
  assert.deepEqual(resolved.asked, ['interpretation']);
  const uncertain = await probe(valid, 0.6);
  assert.equal(uncertain.result.status, 'ambiguous');
  assert.equal(uncertain.result.canonical, undefined);
  assert.deepEqual(uncertain.result.interpretations, [{ reference: '1Pet.2.9', probability: 0.6 }]);
  const range = await probe({ scope: 'range', book: 'John', chapter: 'chapter_6', verse: 'verse_71',
    end_chapter: 'chapter_7', end_verse: 'verse_1' });
  assert.equal(range.result.canonical, 'John.6.71-John.7.1');
});

test('fast numeric address batching does not turn semantic regions into exact references', async () => {
  const { result, asked } = await probe({ scope: 'semantic', book: 'Rom', chapter: 'chapter_8', verse: 'verse_28' });
  assert.equal(result.status, 'needs_search');
  assert.equal(result.needs_semantic_resolution, true);
  assert.equal(result.canonical, undefined);
  assert.deepEqual(asked, []);
});

async function listProbe(members, { countChoice = `members_${members.length}`, finalProbability = 1 } = {}) {
  const parser = await loadParser(), chapters = parser.translation_info().chapters;
  const initialQuestions = { ...hierarchyQuestions(chapters), ...numericQuestions(chapters) };
  const initialAnswers = Object.fromEntries(Object.entries(initialQuestions).map(([id, q]) =>
    [id, answer(q, id === 'scope' ? 'multiple' : id === 'subdivision' ? 'whole' : 'UNRESOLVED')]));
  const entry = { span: 'Several specified passages', decisions: {} }, asked = [], batches = [];
  const result = await resolveNumerically({ evidence: { window_text: entry.span }, entry, chapters, initialAnswers,
    min_interpretation_probability: 0.9,
    askMany: async (state, questions) => {
      asked.push(...Object.keys(questions));
      batches.push(Object.keys(questions));
      return Object.fromEntries(Object.entries(questions).map(([id, q]) => {
        const [, index, field] = id.match(/^member_(\d+)_(.+)$/);
        assert.match(q.instructions, new RegExp(`For member ${index} of ${members.length} ONLY`));
        return [id, answer(q, members[Number(index) - 1][field] ?? 'UNRESOLVED')];
      }));
    }, ask: async (id, state, q) => {
      asked.push(state.list_member_index ? `member_${state.list_member_index}_${id}` : id);
      const selected = state.list_member_index ? members[state.list_member_index - 1][id] ?? 'UNRESOLVED' : id === 'list_count' ? countChoice : 'candidate_0';
      return answer(q, selected, id === 'interpretation' ? finalProbability : 1);
    } });
  return { result, entry, asked, batches };
}

test('disjoint targets combine complete ranges and different books without filling gaps', async () => {
  const { result, entry, batches } = await listProbe([
    { scope: 'range', book: 'Rom', chapter: 'chapter_8', verse: 'verse_1', end_chapter: 'chapter_8', end_verse: 'verse_2' },
    { scope: 'verse', book: 'John', chapter: 'chapter_3', verse: 'verse_16' }
  ]);
  assert.equal(result.canonical, 'Rom.8.1-Rom.8.2,John.3.16');
  assert.deepEqual(batches, [['member_1_scope', 'member_1_book', 'member_2_scope', 'member_2_book'],
    ['member_1_chapter', 'member_1_verse', 'member_1_end_chapter', 'member_1_end_verse', 'member_2_chapter', 'member_2_verse']]);
  assert.equal(entry.candidate_paths.length, 1);
});

test('three list members use two shared dependency batches rather than nine member requests', async () => {
  const { result, batches } = await listProbe([4, 6, 9].map(verse => ({
    scope: 'verse', book: 'John', chapter: 'chapter_3', verse: `verse_${verse}`
  })));
  assert.equal(result.canonical, 'John.3.4,John.3.6,John.3.9');
  assert.deepEqual(batches.map(batch => batch.length), [6, 6]);
});

test('invalid or uncertain list members, unknown counts, and oversized lists never emit partial targets', async () => {
  const valid = { scope: 'verse', book: 'John', chapter: 'chapter_3', verse: 'verse_4' };
  for (const invalid of [
    { scope: 'verse', book: '1Pet', chapter: 'chapter_5', verse: 'verse_25' },
    { scope: 'verse', chapter: 'chapter_3', verse: 'verse_6' },
    { scope: 'UNRESOLVED' }
  ]) {
    const { result, asked } = await listProbe([valid, invalid]);
    assert.equal(result.status, 'unresolved');
    assert.equal(result.canonical, undefined);
    assert.ok(!asked.includes('interpretation'));
  }
  for (const countChoice of ['UNRESOLVED', 'TOO_MANY']) {
    const { result, asked } = await listProbe([], { countChoice });
    assert.equal(result.canonical, undefined);
    assert.deepEqual(asked, ['list_count']);
  }
  const { result } = await listProbe([valid, { ...valid, verse: 'verse_6' }], { finalProbability: 0.6 });
  assert.equal(result.status, 'ambiguous');
  assert.equal(result.canonical, undefined);
  assert.deepEqual(result.interpretations, [{ reference: 'John.3.4,John.3.6', probability: 0.6 }]);
});


test('an unresolved range ending preserves its valid beginning and escalates the rest', async () => {
  const { result, entry, asked } = await probe({ scope: 'range', book: 'John',
    chapter: 'chapter_18', verse: 'verse_5', end_chapter: 'chapter_18', end_verse: 'UNRESOLVED' });
  assert.equal(result.canonical, 'John.18.5');
  assert.equal(entry.endpoint_status, 'unresolved');
  assert.equal(result.needs_semantic_resolution, true);
  assert.equal(result.escalation.type, 'semantic_resolution');
  assert.deepEqual(asked, ['interpretation']);
  const resolvedEntry = { ...entry, ...result, translations: [''], indices: [0, entry.span.length] };
  assert.equal(aiReference(resolvedEntry).osis, 'John.18.5');
  const [record] = parsedEntities({ bcvMatches: [], contextMatches: [], fuzzy: [resolvedEntry], parser: await loadParser() });
  assert.equal(record.osis, 'John.18.5');
  assert.equal(record.ai.endpoint_status, 'unresolved');
  assert.equal(record.ai.escalation.type, 'semantic_resolution');
  assert.deepEqual(record.start, { b: 'John', c: 18, v: 5 });
  const missingStart = await probe({ scope: 'range', book: 'John', chapter: 'chapter_18',
    verse: 'UNRESOLVED', end_chapter: 'chapter_18', end_verse: 'UNRESOLVED' });
  assert.equal(missingStart.result.canonical, undefined);
  assert.deepEqual(missingStart.asked, []);
});

test('approximate passages retain an identified beginning without inventing an ending', async () => {
  const { result, entry } = await probe({ scope: 'approximate', book: 'John',
    chapter: 'chapter_18', verse: 'verse_5' });
  assert.equal(result.canonical, 'John.18.5');
  assert.equal(entry.endpoint_status, 'unresolved');
  assert.equal(result.needs_semantic_resolution, true);
  const vague = await probe({ scope: 'approximate', book: 'John', chapter: 'chapter_18' });
  assert.equal(vague.result.status, 'needs_search');
  assert.equal(vague.result.canonical, undefined);
});


test('chapter ranges reject reversed, missing, and nonexistent endpoints', async () => {
  for (const selections of [
    { chapter: 'chapter_11', end_chapter: 'chapter_1' },
    { chapter: 'chapter_1', end_chapter: 'chapter_51' },
    { chapter: 'UNRESOLVED', end_chapter: 'chapter_11' },
    { chapter: 'chapter_1', end_chapter: 'UNRESOLVED' }
  ]) {
    const { result, asked } = await probe({ scope: 'chapter_range', book: 'Gen', ...selections });
    assert.equal(result.status, 'unresolved');
    assert.equal(result.canonical, undefined);
    assert.deepEqual(asked, []);
  }
});

test('missing starting verses do not become partial targets from a losing verse guess', async () => {
  const parser = await loadParser(), chapters = parser.translation_info().chapters;
  const questions = { ...hierarchyQuestions(chapters), ...numericQuestions(chapters) };
  const selections = { scope: 'range', book: 'Gen', chapter: 'chapter_1', verse: 'UNRESOLVED',
    end_chapter: 'chapter_11', end_verse: 'UNRESOLVED' };
  const initialAnswers = Object.fromEntries(Object.entries(selections).map(([id, selected]) => [id, answer(questions[id], selected)]));
  initialAnswers.verse.probabilities = { ...initialAnswers.verse.probabilities, UNRESOLVED: 0.8, verse_1: 0.2 };
  const result = await resolveNumerically({ evidence: {}, entry: { span: 'selected range', decisions: {} }, chapters,
    initialAnswers, ask: () => assert.fail('No valid candidate should reach interpretation') });
  assert.equal(result.status, 'unresolved');
  assert.equal(result.canonical, undefined);
});


test('disjoint lists preserve a whole-chapter range alongside a separate verse', async () => {
  const { result, batches } = await listProbe([
    { scope: 'chapter_range', book: 'Gen', chapter: 'chapter_1', end_chapter: 'chapter_11' },
    { scope: 'verse', book: 'Gen', chapter: 'chapter_20', verse: 'verse_3' }
  ]);
  assert.equal(result.canonical, 'Gen.1-Gen.11,Gen.20.3');
  assert.deepEqual(batches[1], ['member_1_chapter', 'member_1_end_chapter', 'member_2_chapter', 'member_2_verse']);
});

test('a one-chapter book fixes its chapter without a model question', async () => {
  const { numericQuestions } = await import('../numeric.js');
  const questions = numericQuestions({ Jude: [25] });
  assert.deepEqual(Object.keys(questions.chapter.criteria), ['chapter_1']);
  assert.deepEqual(Object.keys(questions.end_chapter.criteria), ['chapter_1']);
  assert.ok(Object.hasOwn(questions.verse.criteria, 'UNRESOLVED'));
  assert.ok(Object.hasOwn(numericQuestions({ Jude: [25], Judg: [36, 23] }).chapter.criteria, 'UNRESOLVED'));
  const { run } = await import('./support/window-client.js');
  const text = 'Jude 3 is key. Compare verse 5.';
  const start = text.indexOf('verse 5');
  const { result, calls } = await run({ text, context: {}, expected: [{ span: 'verse 5', indices: [start, start + 7],
    osis: 'Jude.1.5', reference_kind: 'numeric' }] });
  assert.equal(result.osis(), 'Jude.1.3,Jude.1.5');
  assert.equal(calls.some(call => call.fields.includes('chapter')), false);
  assert.ok(calls.some(call => call.fields.includes('verse')));
  const decisions = result.parsed_entities().find(e => e.parser === 'ai').ai.decisions;
  assert.equal(decisions.chapter.choice, 'chapter_1');
  assert.equal(decisions.chapter.determined_by, 'single_allowed_choice');
});

test('ranges whose endpoints coincide collapse to a single chapter or verse', async () => {
  const chapterRange = await probe({ scope: 'chapter_range', book: 'Gen', chapter: 'chapter_3', end_chapter: 'chapter_3' });
  assert.equal(chapterRange.result.canonical, 'Gen.3');
  const verseRange = await probe({ scope: 'range', book: 'Rom', chapter: 'chapter_8', verse: 'verse_4', end_chapter: 'chapter_8', end_verse: 'verse_4' });
  assert.equal(verseRange.result.canonical, 'Rom.8.4');
  assert.deepEqual(verseRange.entry.candidate_paths.map(c => c.reference), ['Rom.8.4']);
});

// hierarchy

function responder(selections, probabilities = {}) {
  return async (id, state, question) => {
    const selected = selections[id];
    assert.ok(Object.hasOwn(question.criteria, selected), `${id}: unavailable ${selected}`);
    const distribution = probabilities[id] ?? Object.fromEntries(Object.keys(question.criteria).map(k => [k, k === selected ? 1 : 0]));
    assert.deepEqual(Object.keys(distribution).sort(), Object.keys(question.criteria).sort());
    return { type: 'choice', choice: selected, probabilities: distribution, confidence: 1 };
  };
}

async function resolve({ ask, ...options }) {
  return resolveNumerically({ ...options, ask, askMany: async (state, questions) =>
    Object.fromEntries(await Promise.all(Object.entries(questions).map(async ([id, q]) => [id, await ask(id, state, q)]))) });
}

test('numeric resolver supplies all 66 books and validates a complete verse range', async () => {
  const chapters = parserChapters(await loadParser());
  const entry = { decisions: {} };
  const selected = { scope: 'range', book: 'John', chapter: 'chapter_6', verse: 'verse_36',
    end_chapter: 'chapter_6', end_verse: 'verse_37', interpretation: 'candidate_0', subdivision: 'whole' };
  const respond = responder(selected);
  const result = await resolve({ evidence: { span: 'verses 36–37' }, entry, chapters,
    ask: async (id, state, question) => {
      if (id === 'book') assert.equal(Object.keys(question.criteria).length, 67);
      return respond(id, state, question);
    } });
  assert.equal(Object.keys(BOOKS).length, 66);
  assert.equal(result.canonical, 'John.6.36-John.6.37');
  assert.deepEqual(result.interpretations, [{ reference: 'John.6.36-John.6.37', probability: 1 }]);
});

test('competing book branches return probabilities over complete references', async () => {
  const chapters = parserChapters(await loadParser());
  const selections = { scope: 'chapter', book: 'John', chapter: 'chapter_3', interpretation: 'candidate_0', subdivision: 'whole' };
  const probabilities = { book: Object.fromEntries([...Object.keys(BOOKS), 'UNRESOLVED'].map(k => [k, k === 'John' ? 0.6 : k === 'Num' ? 0.4 : 0])),
    interpretation: { candidate_0: 0.6, candidate_1: 0.4, UNRESOLVED: 0 } };
  const result = await resolve({ evidence: { span: 'chapter 3' }, entry: { decisions: {} }, chapters,
    ask: responder(selections, probabilities) });
  assert.deepEqual(result.interpretations, [{ reference: 'John.3', probability: 0.6 }, { reference: 'Num.3', probability: 0.4 }]);
  assert.equal(result.unresolved_probability, 0);
});

test('missing book context yields unresolved without generating a reference', async () => {
  const chapters = parserChapters(await loadParser());
  const result = await resolve({ evidence: {}, entry: { decisions: {} }, chapters,
    ask: responder({ scope: 'chapter', book: 'UNRESOLVED' }) });
  assert.equal(result.status, 'unresolved');
  assert.equal(result.canonical, undefined);
});

test('range endpoint selection supports crossing a chapter boundary', async () => {
  const chapters = parserChapters(await loadParser());
  const result = await resolve({ evidence: {}, entry: { decisions: {} }, chapters,
    ask: responder({ scope: 'range', book: 'John', chapter: 'chapter_6', verse: 'verse_71',
      end_chapter: 'chapter_7', end_verse: 'verse_1', interpretation: 'candidate_0', subdivision: 'whole' }) });
  assert.equal(result.canonical, 'John.6.71-John.7.1');
});

test('the additional evaluation cases have correct offsets and numbered identities', async () => {
  const { readFile } = await import('node:fs/promises');
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/additional-cases.json', import.meta.url), 'utf8'));
  assert.equal(fixtures.length, 13);
  assert.deepEqual(fixtures.map(f => f.id), Array.from({ length: 13 }, (_, i) => 26 + i));
  for (const fixture of fixtures) for (const expected of fixture.expected) assert.equal(fixture.text.slice(...expected.indices), expected.span);
});

test('readable model reference labels round-trip through BCV to canonical OSIS', async () => {
  const { referenceText } = await import('../hierarchy.js');
  const { loadParser } = await import('./support/parser.js');
  const parser = await loadParser();
  for (const reference of ['John.6.35', '1John.3', 'Rom.8.18-Rom.8.23', 'John.6.71-John.7.1']) {
    const label = referenceText(reference);
    assert.ok(!label.includes('.'));
    assert.equal(parser.parse(label).osis(), reference);
  }
});

test('semantic descriptions and approximate regions without a start retain an escalation', async () => {
  for (const shape of ['semantic', 'approximate']) {
    const stages = [];
    const result = await resolve({
      evidence: { window_text: 'The earlier passage describes suffering.', background_context: 'Romans 8', selected_antecedent: 'Romans 8:28' },
      entry: { span: 'The earlier passage', decisions: {} }, chapters: { Rom: [31] },
      ask: async (id, state, question) => { stages.push(id); return responder({ scope: shape, book: 'UNRESOLVED' })(id, state, question); }
    });
    assert.deepEqual(stages, shape === 'semantic' ? ['scope'] : ['scope', 'book']);
    assert.equal(result.status, 'needs_search');
    assert.equal(result.needs_semantic_resolution, true);
    assert.equal(result.canonical, undefined);
    assert.equal(result.escalation.type, 'semantic_resolution');
    assert.equal(result.escalation.context.selected_antecedent, 'Romans 8:28');
  }
});


test('whole-chapter ranges ask only chapter endpoints and retain the chapter-level target', async () => {
  const chapters = parserChapters(await loadParser());
  const entry = { span: 'the first eleven chapters of Genesis', decisions: {} };
  const stages = [];
  const respond = responder({ scope: 'chapter_range', book: 'Gen', chapter: 'chapter_1',
    end_chapter: 'chapter_11', interpretation: 'candidate_0' });
  const result = await resolve({ evidence: {}, entry, chapters,
    ask: async (id, state, question) => { stages.push(id); return respond(id, state, question); } });
  assert.equal(result.canonical, 'Gen.1-Gen.11');
  assert.deepEqual(stages, ['scope', 'book', 'chapter', 'end_chapter', 'interpretation']);
  assert.equal(result.needs_semantic_resolution, undefined);
  assert.equal(entry.endpoint_status, undefined);
});


test('whole-book targets resolve without any chapter or verse questions', async () => {
  const chapters = parserChapters(await loadParser());
  const stages = [];
  const respond = responder({ scope: 'book', book: 'Gen', interpretation: 'candidate_0' });
  const result = await resolve({ evidence: {}, entry: { span: 'Genesis', decisions: {} }, chapters,
    ask: async (id, state, question) => { stages.push(id); return respond(id, state, question); } });
  assert.equal(result.canonical, 'Gen');
  assert.deepEqual(stages, ['scope', 'book', 'interpretation']);
});

test('readable references name every BCV book identifier, including additions', async () => {
  const { referenceText } = await import('../hierarchy.js');
  assert.equal(referenceText('AddEsth.1.1'), 'Additions to Esther 1:1');
  assert.equal(referenceText('AddDan.1-AddDan.2'), 'Additions to Daniel 1–Additions to Daniel 2');
  assert.equal(referenceText('Ps.151.3,Sir.1.1'), 'Psalms 151:3, Sirach (Ecclesiasticus) 1:1');
});

// numeric scope

test('fresh validation fixtures freeze ten distinct numbered cases and original source offsets', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/validation-cases.json', import.meta.url), 'utf8'));
  assert.deepEqual(fixtures.map(f => f.id), Array.from({ length: 10 }, (_, i) => 49 + i));
  for (const fixture of fixtures) {
    for (const expected of fixture.expected) assert.equal(fixture.text.slice(...expected.indices), expected.span);
    for (const explicit of fixture.expected_explicit ?? []) {
      const parser = await loadParser();
      assert.equal(parser.parse(fixture.text.slice(...explicit.indices)).osis(), explicit.osis);
    }
  }
});

test('numeric scoring requires correctly extracted and routed deferrals while retaining original gold', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/readme-cases.json', import.meta.url), 'utf8'));
  for (const id of [1, 5]) {
    const fixture = fixtures.find(f => f.id === id);
    const expected = fixture.expected[0];
    const semantic = expected.reference_kind === 'semantic';
    const result = { text: fixture.text, status: 'complete', fuzzy: [{
      span: expected.span, indices: expected.indices, status: 'needs_search',
      [semantic ? 'needs_semantic_resolution' : 'needs_relative_resolution']: true,
      escalation: { type: semantic ? 'semantic_resolution' : 'relative_resolution' }
    }] };
    const score = scoreCase(fixture, result, { resolution_scope: 'numeric' });
    assert.equal(score.passed, true);
    assert.equal(score.original_passed, false);
    assert.equal(score.original_score.passed, false);
    assert.equal(scoreCase(fixture, { ...result, fuzzy: [] }, { resolution_scope: 'numeric' }).passed, false);
    result.fuzzy[0].escalation.type = 'wrong';
    assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, false);
    assert.ok(expected.osis || expected.semantic_target);
  }
  const numbered = JSON.parse(await readFile(new URL('./fixtures/compact-cases.json', import.meta.url), 'utf8'))[0];
  const wrong = { text: numbered.text, status: 'complete', fuzzy: [{
    ...numbered.expected[0], status: 'resolved', canonical: 'Num.3.6'
  }] };
  assert.equal(scoreCase(numbered, wrong, { resolution_scope: 'numeric' }).passed, false);
});

test('an ambiguous backward pointer may be deferred as relative or semantic without guessing an exact target', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/readme-cases.json', import.meta.url), 'utf8'));
  const fixture = fixtures.find(f => f.id === 22);
  const expected = fixture.expected[0];
  for (const kind of ['relative', 'semantic']) {
    const result = { text: fixture.text, status: 'complete', fuzzy: [{
      span: expected.span, indices: expected.indices, status: 'needs_search',
      [`needs_${kind}_resolution`]: true, escalation: { type: `${kind}_resolution` }
    }] };
    const score = scoreCase(fixture, result, { resolution_scope: 'numeric' });
    assert.equal(score.passed, true);
    assert.equal(score.original_passed, false);
    result.fuzzy[0].escalation.type = 'unrecognized';
    assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, false);
    result.fuzzy = [];
    assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, false);
  }
  assert.equal(expected.osis, 'Rom.3.27-Rom.3.31');
});

// word numbers

const fixtures = JSON.parse(await readFile(new URL('./fixtures/word-number-cases.json', import.meta.url)));

test('word-number fixtures share context and distinguish a verse, a range, and disjoint verses', async () => {
  const parser = await loadParser();
  assert.deepEqual(fixtures.map(f => f.id), [74, 75, 76, 77]);
  assert.deepEqual(fixtures.map(f => f.expected[0].osis), ['John.3.4', 'John.3.4-John.3.6', 'John.3.4,John.3.6', 'John.3.4,John.3.6,John.3.9']);
  for (const fixture of fixtures) {
    assert.deepEqual(fixture.context, fixtures[0].context);
    const expected = fixture.expected[0];
    assert.equal(fixture.text.slice(...expected.indices), expected.span);
    assert.equal(parser.parse(expected.osis).osis(), expected.osis);
    assert.deepEqual(parser.parse(fixture.text).osis_and_indices(), []);
  }
});

test('disjoint verse expectations reject a filled-in range and an unsupported deferral', () => {
  const fixture = fixtures[2], expected = fixture.expected[0];
  const resultFor = (canonical, status) => ({ text: fixture.text, status: 'complete',
    fuzzy: [{ span: expected.span, indices: expected.indices, status, ...(canonical ? { canonical } : {}) }] });
  assert.equal(scoreCase(fixture, resultFor('John.3.4,John.3.6', 'resolved'), { resolution_scope: 'numeric' }).passed, true);
  assert.equal(scoreCase(fixture, resultFor('John.3.4-John.3.6', 'resolved'), { resolution_scope: 'numeric' }).passed, false);
  assert.equal(scoreCase(fixture, resultFor(undefined, 'needs_search'), { resolution_scope: 'numeric' }).passed, false);
});

test('internal subdivision metadata does not fail a correct public whole-verse target', () => {
  const fixture = fixtures[0], expected = fixture.expected[0];
  const result = { text: fixture.text, status: 'complete', fuzzy: [{
    span: expected.span, indices: expected.indices, canonical: expected.osis, status: 'resolved', subdivision: 'unspecified_part'
  }] };
  assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, true);
});

// roman

test('Roman numeral fixtures have valid complete references and exact original-string offsets', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/roman-cases.json', import.meta.url)));
  const parser = await loadParser();
  assert.deepEqual(fixtures.map(f => f.id), [...Array.from({ length: 12 }, (_, i) => i + 59), 134]);
  const roman = fixtures.find(f => f.id === 70);
  const arabic = fixtures.find(f => f.id === 69);
  assert.deepEqual(arabic.context, roman.context);
  assert.equal(arabic.text, roman.text.replace('Romans viii', 'Romans 8'));
  assert.equal(arabic.expected[0].osis, roman.expected[0].osis);
  for (const fixture of fixtures) {
    for (const row of [...fixture.expected, ...(fixture.expected_explicit ?? [])]) {
      assert.equal(fixture.text.slice(...row.indices), row.span);
      if (row.osis) assert.equal(parser.parse(row.osis).osis(), row.osis);
    }
  }
});

// list context

const listFixtures = JSON.parse(await readFile(new URL('./fixtures/context-threshold-validation-cases.json', import.meta.url)));
const localQuestions = call => Object.entries(call.questions).map(([id, question]) => {
  const task = id.match(/^(task_\d+)_(.+)$/);
  const { tasks, ...common } = call.state;
  return { field: task?.[2] ?? id, question, state: task ? { ...common, ...tasks[task[1]] } : common };
});

test('list membership excludes unrelated citations while sharing a batch with contextual antecedent inference', async () => {
  const fixture = listFixtures.find(f => f.id === 119);
  const { client, calls } = scripted(fixture);
  const result = await new FuzzyReferenceParser({ parser: await loadParser(), decisions: client }).parse(fixture.text, { context: fixture.context });
  const batch = calls.find(call => localQuestions(call).some(q => q.field === 'list_count'));
  const questions = localQuestions(batch);
  const count = questions.find(q => q.field === 'list_count');
  assert.equal(count.state.span, fixture.expected[0].span);
  assert.equal(count.state.window_text, undefined);
  assert.equal(count.state.discourse, undefined);
  assert.equal(count.state.following_context, undefined);
  assert.ok(calls.flatMap(localQuestions).some(q => q.field === 'antecedent' && q.state.window_text === fixture.text));
  const memberBook = calls.flatMap(localQuestions).find(q => q.field === 'member_1_book');
  assert.equal(memberBook.state.window_text, fixture.text);
  assert.equal(memberBook.state.discourse.current_reference, 'John 3:1');
  assert.deepEqual(result.references.map(r => r.osis), ['John.5.4,John.5.6', 'John.5.10']);
});

test('a rejected earlier target does not erase its prose context or force a stale chapter', async () => {
  const fixture = listFixtures.find(f => f.id === 119);
  const { client } = scripted(fixture);
  let checkedContext = false;
  const decisions = { decide: async (state, questions) => {
    const call = { state, questions };
    const answers = await client.decide(state, questions);
    for (const [i, [id]] of Object.entries(questions).entries()) {
      const local = localQuestions(call)[i];
      if (local.state.span === fixture.expected[0].span && local.field === 'interpretation') {
        const candidate = answers[id].choice;
        answers[id] = { type: 'choice', choice: 'UNRESOLVED', confidence: 0.2,
          probabilities: Object.fromEntries(Object.keys(questions[id].criteria).map(key => [key,
            key === 'UNRESOLVED' ? 0.6 : key === candidate ? 0.4 : 0])) };
      }
      if (local.state.span === '10' && local.field === 'chapter') {
        assert.equal(local.state.discourse.current_reference, 'John 3:1');
        assert.ok(local.state.preceding_context.includes('verses four and six of chapter five'));
        assert.ok(local.state.preceding_context.includes('8 pm on June 9, AD 31'));
        assert.ok(!local.state.preceding_context.includes('(10)'));
        assert.equal(local.state.following_context.trim(), ').');
        checkedContext = true;
      }
    }
    return answers;
  } };
  const result = await new FuzzyReferenceParser({ parser: await loadParser(), decisions }).parse(fixture.text, { context: fixture.context });
  assert.ok(checkedContext);
  assert.equal(expressionDiagnostics(result)[0].status, 'unresolved');
  assert.equal(expressionDiagnostics(result).at(-1).canonical, 'John.5.10');
});

// partial verses

function resolved(span, canonical = 'John.3.6') {
  return { span, status: 'resolved', canonical, interpretations: [{ reference: canonical, probability: 0.97 }] };
}

test('BCV verse-part preservation is opt-in and does not reinterpret prose or change Jev targets', async () => {
  const parser = await loadParser();
  const entry = resolved('verse 6a');
  preserveVerseParts(entry, parser);
  assert.equal(entry.canonical, 'John.3.6');
  for (const strategy of ['bp', 'bcp', 'bcvp']) {
    parser.set_options({ osis_compaction_strategy: strategy });
    const literal = resolved('verse 6a');
    preserveVerseParts(literal, parser);
    assert.equal(literal.canonical, 'John.3.6!a');
    assert.deepEqual(literal.interpretations, [{ reference: 'John.3.6!a', probability: 0.97 }]);
    const different = resolved('verse 7a');
    preserveVerseParts(different, parser);
    assert.equal(different.canonical, 'John.3.6');
    const prose = { ...resolved('the first half of verse 6'), subdivision: 'first_part' };
    preserveVerseParts(prose, parser);
    assert.equal(prose.canonical, 'John.3.6!a');
    const uncertain = { ...resolved('verse 6a'), status: 'ambiguous' };
    preserveVerseParts(uncertain, parser);
    assert.equal(uncertain.canonical, 'John.3.6');
  }
  const range = resolved('verses 6a–7b', 'John.3.6-John.3.7');
  preserveVerseParts(range, parser);
  assert.equal(range.canonical, 'John.3.6!a-John.3.7!b');
});

test('Jev subdivisions map independently of BCV recognition, with literal labels taking precedence', async () => {
  const parser = await loadParser({ partial_verses: true });
  for (const [subdivision, suffix] of [['first_part', '!a'], ['second_part', '!b'], ['unspecified_part', ''], ['whole', '']]) {
    // BCV cannot turn this descriptive phrase into a verse address.
    const entry = { ...resolved('the ending portion'), subdivision };
    preserveVerseParts(entry, parser);
    assert.equal(entry.canonical, `John.3.6${suffix}`);
    assert.equal(entry.interpretations[0].reference, entry.canonical);
    assert.equal(entry.interpretations[0].probability, 0.97);
  }
  const literal = { ...resolved('verse 6c'), subdivision: 'first_part' };
  preserveVerseParts(literal, parser);
  assert.equal(literal.canonical, 'John.3.6!c');
  const withoutLocalParser = { ...resolved('the ending portion'), subdivision: 'second_part' };
  preserveVerseParts(withoutLocalParser, { options: { osis_compaction_strategy: 'bcp' } });
  assert.equal(withoutLocalParser.canonical, 'John.3.6!b');
  const defaults = { ...resolved('the ending portion'), subdivision: 'second_part' };
  preserveVerseParts(defaults, await loadParser());
  assert.equal(defaults.canonical, 'John.3.6');
  for (const canonical of ['John.3', 'John.3.6-John.3.7', 'John.3.6,John.3.9']) {
    const entry = { ...resolved('the ending portion', canonical), subdivision: 'second_part' };
    preserveVerseParts(entry, parser);
    assert.equal(entry.canonical, canonical);
  }
});

test('partial explicit references validate and retain labels in BCV output', async () => {
  const parser = await loadParser({ partial_verses: true });
  const chapters = parser.translation_info().chapters;
  assert.equal(parseReference('John.3.6!a', chapters).start.versePart, 'a');
  assert.equal(parseReference('John.3!a', chapters), null);
  assert.equal(referenceText('John.3.6!a-John.3.7!b'), 'John 3:6a–John 3:7b');
  assert.equal(parser.parse('John 3:6a NIV').osis_and_indices()[0].osis, 'John.3.6!a');
});

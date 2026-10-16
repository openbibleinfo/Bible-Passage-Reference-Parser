// Compact references, parsed entities, and the evaluation scoring used by fixtures (src/results.js, src/entities.js, test/support/evaluation.js).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { aiReference } from '../results.js';
import { scoreCase } from './support/evaluation.js';

// results

test('citation and target confidence preserve distinct decisions, including zero', () => {
  const entry = { status: 'resolved', canonical: 'John.3.17', indices: [0, 8], translations: [''],
    interpretations: [{ reference: 'John.3.17', probability: 0.99 }],
    decisions: { classification: { choice: 'BIBLE_REFERENCE', probabilities: { BIBLE_REFERENCE: 0.67, NOT_A_BIBLE_REFERENCE: 0.33 } } } };
  assert.equal(aiReference(entry).citation_confidence, 0.67);
  assert.equal(aiReference(entry).target_confidence, 0.99);
  assert.equal(Object.hasOwn(aiReference(entry), 'probability'), false);
  entry.decisions.classification.probabilities.BIBLE_REFERENCE = 0;
  assert.equal(aiReference(entry).citation_confidence, 0);
  assert.equal(aiReference(entry).target_confidence, 0.99);
});

test('compact AI output exposes the most likely interpretation and alternatives sharing offsets and translations', () => {
  const entry = { status: 'ambiguous', indices: [2,3], translations: ['NIV'], interpretations: [
    { reference: 'Num.3.6', probability: 0.4 }, { reference: 'John.3.6', probability: 0.6 }
  ] };
  assert.deepEqual(aiReference(entry), { osis: 'John.3.6', indices: [2,3], translations: ['NIV'], parser: 'ai',
    target_confidence: 0.6, alternates: [{ osis: 'Num.3.6', target_confidence: 0.4 }] });
  assert.equal(entry.status, 'ambiguous');
  assert.equal(entry.interpretations[0].reference, 'Num.3.6');
  for (const status of ['unresolved','needs_search','not_a_bible_reference']) assert.equal(aiReference({ ...entry, status }), null);
  assert.equal(aiReference({ status: 'ambiguous', interpretations: [] }), null);
});

test('the extension preserves original BCV entity fields and identifies AI results using parser alone', async () => {
  const { loadParser } = await import('./support/parser.js');
  const { bcvProposals } = await import('../translations.js');
  const { parsedEntities } = await import('../entities.js');
  const parser = await loadParser();
  const bcvMatches = bcvProposals(parser, 'John 3:16 NIV', 'input').map(m => ({ ...m, review_status: 'accepted' }));
  const original = structuredClone(parser.parsed_entities());
  const fuzzy = [{ status: 'resolved', canonical: 'John.3.6!a', indices: [14,16], translations: ['NIV'],
    span: '6a', source: 'jev', versification_system: 'kjv', decisions: {},
    interpretations: [{ reference: 'John.3.6!a', probability: 0.97 }] },
    { status: 'needs_search', indices: [18,22], translations: [''], decisions: {}, span: 'above' }];
  const records = parsedEntities({ bcvMatches, contextMatches: [], fuzzy, parser });
  const { ai: review, ...native } = records[0];
  assert.deepEqual(native, original[0]);
  assert.equal(records[0].parser, undefined);
  assert.equal(review.review_status, 'accepted');
  assert.deepEqual(parser.parsed_entities(), original);
  const result = records[1];
  assert.equal(result.parser, 'ai');
  assert.equal(result.osis, 'John.3.6!a');
  assert.equal(typeof result.entity_id, 'number');
  assert.deepEqual(result.start, { b: 'John', c: 3, v: 6, p: 'a' });
  assert.deepEqual(result.end, result.start);
  assert.deepEqual(result.entities[0].valid, { valid: true, messages: {} });
  assert.deepEqual(result.entities[0].translations, [{ osis: 'NIV', translation: 'niv', system: 'kjv' }]);
  for (const key of ['type','span','canonical','versification_system']) assert.equal(Object.hasOwn(result,key), false);
  assert.equal(result.ai.system, 'kjv');
  assert.equal(records[2].osis, '');
  assert.equal(records[2].ai.status, 'needs_search');
  assert.deepEqual(records[2].entities, []);
});

test('unresolved, rejected, and deferred expressions remain in parsed entities without compact targets', async () => {
  const { loadParser } = await import('./support/parser.js');
  const { parsedEntities } = await import('../entities.js');
  const parser = await loadParser();
  const fuzzy = ['unresolved', 'not_a_bible_reference', 'needs_search'].map((status, i) => ({
    status, indices: [i * 10, i * 10 + 5], span: 'verse', translations: [''],
    decisions: { classification: { choice: 'NOT_A_BIBLE_REFERENCE', probabilities: { BIBLE_REFERENCE: 0.12, NOT_A_BIBLE_REFERENCE: 0.88 } } },
    ...(status === 'needs_search' ? { escalation: {
      type: 'semantic_resolution', expression: 'verse', context: { window_text: 'verse' }
    } } : {})
  }));
  const records = parsedEntities({ bcvMatches: [], contextMatches: [], fuzzy, parser });
  assert.equal(records.length, fuzzy.length);
  for (const [i, record] of records.entries()) {
    assert.equal(record.ai.status, fuzzy[i].status);
    assert.equal(record.citation_confidence, 0.12);
    assert.equal(Object.hasOwn(record, 'target_confidence'), false);
    assert.equal(record.osis, '');
    assert.deepEqual(record.indices, fuzzy[i].indices);
    assert.deepEqual(record.entities, []);
    assert.equal(aiReference(fuzzy[i]), null);
  }
  assert.equal(records[2].ai.escalation.type, 'semantic_resolution');
});

test('public decisions retain nonzero uncertainty without duplicate maps or explanatory boilerplate', async () => {
  const { loadParser } = await import('./support/parser.js');
  const { parsedEntities } = await import('../entities.js');
  const parser = await loadParser();
  const entry = { status: 'resolved', canonical: 'John.3.6', indices: [0,1], translations: [''],
    classification: 'BIBLE_REFERENCE', scope_choice: 'verse', book_probabilities: { John: 1, Rom: 0 },
    unresolved_probability: 0.1,
    interpretations: [{ reference: 'John.3.6', probability: 0.7 }, { reference: 'Num.3.6', probability: 0.2 },
      { reference: 'Rom.3.6', probability: 0 }],
    decisions: {
      chapter: { type: 'choice', choice: 'chapter_3', confidence: 0.6,
        probabilities: { chapter_3: 0.6, chapter_150: 0, UNRESOLVED: 0.4 } },
      interpretation: { type: 'choice', choice: 'candidate_0', confidence: 0.7,
        probabilities: { candidate_0: 0.7, candidate_1: 0.2, candidate_2: 0, UNRESOLVED: 0.1 } }
    } };
  const [record] = parsedEntities({ bcvMatches: [], contextMatches: [], fuzzy: [entry], parser });
  assert.equal(Array.isArray(record.ai.decisions), false);
  assert.deepEqual(record.ai.decisions.chapter.probabilities, { chapter_3: 0.6, UNRESOLVED: 0.4 });
  assert.equal(record.ai.decisions.interpretation.choice, 'John.3.6');
  assert.deepEqual(record.ai.decisions.interpretation.probabilities, { 'John.3.6': 0.7, 'Num.3.6': 0.2, UNRESOLVED: 0.1 });
  for (const answer of Object.values(record.ai.decisions)) assert.equal(Object.hasOwn(answer,'type'), false);
  for (const key of ['book_probabilities','classification','scope_choice','interpretations','unresolved_probability']) {
    assert.equal(Object.hasOwn(record.ai,key), false);
  }
  assert.equal(entry.decisions.chapter.probabilities.chapter_150, 0);
  assert.equal(entry.decisions.interpretation.choice, 'candidate_0');
});

test('public decisions omit address stages unused by book, chapter, or verse targets', async () => {
  const { loadParser } = await import('./support/parser.js');
  const { parsedEntities } = await import('../entities.js');
  const parser = await loadParser();
  const q = { type: 'choice', choice: 'UNRESOLVED', confidence: 1, probabilities: { UNRESOLVED: 1 } };
  for (const [scope, expected] of [['book',[]], ['chapter',['chapter']], ['verse',['chapter','verse']],
    ['range',['chapter','verse','end_chapter','end_verse']]]) {
    const entry = { status: 'unresolved', translations: [''], indices: [0,1], scope_choice: scope,
      decisions: { chapter:q, verse:q, end_chapter:q, end_verse:q } };
    const [record] = parsedEntities({ bcvMatches: [], contextMatches: [], fuzzy: [entry], parser });
    assert.deepEqual(Object.keys(record.ai.decisions), expected);
  }
});

// evaluation

const text = 'The selected text is verses 7–9.';
const fixture = { id: 1, text, expected: [{ span: 'verses 7–9', indices: [21, 31],
  osis: 'Matt.5.7-Matt.5.9', status: ['resolved'], reference_kind: 'numeric' }] };
const reference = { osis: 'Matt.5.7-Matt.5.9', translations: [''], indices: [28, 31], parser: 'ai', probability: 0.6 };
const result = { text, status: 'incomplete', references: [reference], fuzzy: [{
  span: '7–9', indices: [28, 31], status: 'ambiguous', translations: [''],
  interpretations: [{ reference: reference.osis, probability: 0.6 }]
}] };

test('correct compact output passes despite ambiguity, uncertain absence, and optional verse prefix', () => {
  const score = scoreCase(fixture, result, { resolution_scope: 'numeric' });
  assert.equal(score.passed, true);
  assert.equal(score.pipeline_status, 'incomplete');
  assert.equal(score.strict_passed, false);
  assert.equal(score.rows[0].boundaries, false);
  const reverse = { ...fixture, expected: [{ ...fixture.expected[0], span: '7–9', indices: [28, 31] }] };
  assert.equal(scoreCase(reverse, { ...result, references: [{ ...reference, indices: [21, 31] }] }).passed, true);
});

test('consumer scoring rejects missing targets, wrong primary with correct alternate, bad offsets, and prose expansion', () => {
  for (const references of [[], [{ ...reference, osis: 'Matt.5.8', alternates: [{ osis: reference.osis, probability: 0.4 }] }],
    [{ ...reference, indices: [0, 31] }], [{ ...reference, indices: [28, 33] }], [{ ...reference, indices: [-1, 31] }]]) {
    assert.equal(scoreCase(fixture, { ...result, references }).passed, false);
  }
});

test('correct retained Psalm and omitted endnote pass even with uncertain absence', () => {
  const text = 'Psalm 23:1 is the opening quotation (12).';
  const fixture = { id: 55, text, expected: [{ span: '12', indices: [36, 38], optional: true,
    status: ['not_a_bible_reference'], reference_kind: 'non_bible' }],
    expected_explicit: [{ osis: 'Ps.23.1', indices: [0, 10] }] };
  const reference = { osis: 'Ps.23.1', translations: [''], indices: [0, 10] };
  const result = { text, status: 'incomplete', references: [reference], explicit: [reference], fuzzy: [] };
  assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, true);
  assert.equal(scoreCase(fixture, { ...result, references: [] }, { resolution_scope: 'numeric' }).passed, false);
});

test('translation regression requires the identifier in the consumer output', () => {
  const [fixture] = JSON.parse(readFileSync(new URL('./fixtures/regression-cases.json', import.meta.url)));
  const explicit = { osis: 'John.3.16', indices: [0, 13], translations: ['NIV'] };
  const fuzzy = { span: 'verse 17', indices: [38, 46], status: 'resolved', canonical: 'John.3.17' };
  const reference = { osis: 'John.3.17', indices: [38, 46], translations: [''], parser: 'ai', probability: 1 };
  const result = { text: fixture.text, status: 'complete', explicit: [explicit], fuzzy: [fuzzy], references: [explicit, reference] };
  assert.equal(fixture.text.slice(...explicit.indices), 'John 3:16 NIV');
  assert.equal(fixture.text.slice(...fuzzy.indices), fuzzy.span);
  assert.equal(scoreCase(fixture, result).passed, true);
  for (const translations of [undefined, [''], ['KJV']]) {
    const score = scoreCase(fixture, { ...result, references: [{ ...explicit, translations }, reference] });
    assert.equal(score.passed, false);
    assert.equal(score.explicit_rows[0].translations, false);
    assert.equal(score.strict_passed, false);
  }
});


test('consumer scoring accepts split lists with identical targets and source extent', () => {
  const text = 'Compare chapters two through four of Genesis and verse six of chapter seven.';
  const span = 'chapters two through four of Genesis and verse six of chapter seven';
  const fixture = { id: 141, text, expected: [{ span, indices: [8, 75],
    osis: 'Gen.2-Gen.4,Gen.7.6', status: ['resolved'], reference_kind: 'numeric' }] };
  const references = [
    { osis: 'Gen.2-Gen.4', translations: [''], indices: [8, 44] },
    { osis: 'Gen.7.6', translations: [''], indices: [49, 75] }
  ];
  const result = { text, status: 'complete', references, parsed_entities: [] };
  assert.equal(text.slice(...fixture.expected[0].indices), span);
  const score = scoreCase(fixture, result);
  assert.equal(score.passed, true);
  assert.equal(score.rows[0].split_references, 2);
  for (const invalid of [references.slice(0, 1), [...references, references[1]],
    [{ ...references[0], osis: 'Gen.2-Gen.7' }, references[1]],
    [references[0], { ...references[1], osis: 'Gen.7.5' }],
    [{ ...references[0], indices: [0, 44] }, references[1]],
    [{ ...references[1], indices: references[0].indices }, { ...references[0], indices: references[1].indices }]
  ]) assert.equal(scoreCase(fixture, { ...result, references: invalid }).passed, false);
});

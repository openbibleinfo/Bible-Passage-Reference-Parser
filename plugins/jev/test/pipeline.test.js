// End-to-end parser contracts with scripted decisions: scheduling, discourse state, enabled books, a minimal parser, fixtures, and the demo.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { demo, text } from '../demo.js';
import { hierarchyQuestions, referenceText } from '../hierarchy.js';
import { FuzzyReferenceParser } from '../index.js';
import { parserChapters, parseReference } from '../resolver.js';
import { tokenize } from '../text.js';
import { translationChapters } from '../translations.js';
import { expressionDiagnostics } from './support/diagnostics.js';
import { scoreCase } from './support/evaluation.js';
import { loadParser } from './support/parser.js';
import { run, scripted } from './support/window-client.js';

// window contracts

const fixture = (text, pairs, context = { current_reference: 'John.3.1' }) => ({ text, context,
  expected: pairs.map(([span, osis, properties = {}]) => ({ span, osis,
    indices: [text.indexOf(span), text.indexOf(span) + span.length], ...properties })) });

test('rejected and unsupported spans never request address parts', async () => {
  for (const properties of [{ classification: 'NOT_A_BIBLE_REFERENCE' }, { classification: 'UNRESOLVED' }, { shape: 'UNRESOLVED' }]) {
    const { result, calls } = await run(fixture('Read verse four.', [['verse four', 'John.3.4', properties]]));
    assert.deepEqual(result.references, []);
    // Book inference shares the classification request; only address parts wait for applicability.
    assert.ok(calls.every(call => !call.fields.includes('chapter') && !call.fields.includes('verse') && !call.fields.includes('interpretation')));
  }
});

test('semantic and relative targets preserve escalation context without guessing OSIS', async () => {
  for (const reference_kind of ['relative', 'semantic']) {
    const text = reference_kind === 'relative' ? 'Read the next verse.' : 'Read the middle of the chapter.';
    const span = text.slice(5, -1);
    const { result, calls } = await run(fixture(text, [[span, 'John.3.2', { reference_kind }]]));
    assert.deepEqual(result.references, []);
    assert.equal(result.escalations[0].type, `${reference_kind}_resolution`);
    assert.equal(result.escalations[0].context.window_text, text);
    assert.deepEqual(result.escalations[0].indices, [5, text.length - 1]);
    assert.ok(calls.every(call => !call.fields.includes('chapter') && !call.fields.includes('interpretation')));
    assert.equal(result.state.current_reference, 'John.3.1');
  }
});

test('ambiguous book interpretations preserve primary OSIS and alternates without seeding discourse', async () => {
  const { result } = await run(fixture('Consider verse 6.', [['verse 6', 'John.3.6']]), {
    distributions: { book: { John: 0.6, Num: 0.4 }, interpretation: { 'John.3.6': 0.6, 'Num.3.6': 0.4 } }
  });
  assert.deepEqual(result.references[0], { osis: 'John.3.6', translations: [''], indices: [9, 16],
    parser: 'ai', citation_confidence: 1, target_confidence: 0.6, alternates: [{ osis: 'Num.3.6', target_confidence: 0.4 }] });
  assert.equal(expressionDiagnostics(result)[0].status, 'ambiguous');
  assert.equal(result.state.current_reference, 'John.3.1');
  const entity = result.parsed_entities().find(row => row.parser === 'ai');
  assert.deepEqual(entity.alternates, result.references[0].alternates);
  assert.equal(entity.ai.decisions.interpretation.choice, 'John.3.6');
  const copy = result.osis_and_indices(); copy[0].indices[0] = 999;
  assert.equal(result.references[0].indices[0], 9);
});

test('BCV mistags are removed while their source is reinterpreted with translations intact', async () => {
  const text = 'Romans 8, 28 NIV';
  const { result } = await run(fixture(text, [[text, 'Rom.8.28']]), { review: 'REOPEN', boundary: { boundary_end: 'token_3' } });
  assert.equal(result.bcv_matches[0].osis, 'Rom.8');
  assert.deepEqual(result.references, [{ osis: 'Rom.8.28', translations: ['NIV'], indices: [0, 12], parser: 'ai', citation_confidence: 1, target_confidence: 1 }]);
  assert.equal(expressionDiagnostics(result)[0].translation_association.status, 'matched');
  assert.deepEqual(expressionDiagnostics(result)[0].bcv_proposal_ids, ['input_0']);
  assert.equal(expressionDiagnostics(result)[0].versification_system, 'kjv');
  const entities = result.parsed_entities();
  assert.equal(entities.find(e => !e.parser).ai.review.choice, 'REOPEN');
  entities.find(e => e.parser === 'ai').translations[0] = 'changed';
  assert.equal(result.parsed_entities().find(e => e.parser === 'ai').translations[0], 'NIV');
});

test('translated targets validate against their associated versification', async () => {
  const text = '3 John 1, 15 NRSV', parser = await loadParser();
  parser.set_options({ versification_system: 'kjv' });
  assert.equal(parser.translation_info('kjv').chapters['3John'][0], 14);
  const { result } = await run(fixture(text, [[text, '3John.1.15']], {}), { review: 'REOPEN', parserOptions: { parser } });
  assert.equal(expressionDiagnostics(result)[0].versification_system, 'nrsv');
  assert.equal(result.references[0].osis, '3John.1.15');
  assert.deepEqual(result.references[0].translations, ['NRSV']);
});

test('partial-verse preservation is opt-in and adds no model requests', async () => {
  const counts = [];
  for (const partial_verses of [false, true]) {
    const text = 'Please read verse 6a.';
    const { result, calls } = await run(fixture(text, [['verse 6a', 'John.3.6']]), {
      parserOptions: { parser: await loadParser({ partial_verses }) }, subdivisions: { 'verse 6a': 'first_part' }
    });
    const expected = partial_verses ? 'John.3.6!a' : 'John.3.6';
    assert.equal(result.references[0].osis, expected);
    assert.deepEqual(result.references[0].indices, [12, 20]);
    assert.equal(expressionDiagnostics(result)[0].interpretations[0].reference, expected);
    counts.push(calls.length);
  }
  assert.equal(counts[0], counts[1]);
});

test('background prose and accepted context supply anchors but never return background offsets', async () => {
  const { result } = await run(fixture('Read verse four.', [['verse four', 'John.3.4']], 'This section is John chapter 3.'));
  assert.equal(result.references.length, 1);
  assert.equal(result.references[0].osis, 'John.3.4');
  assert.deepEqual(result.references[0].indices, [5, 15]);
  assert.equal(result.context_bcv_matches[0].review_status, 'accepted');
});

test('a future mechanical citation is evidence but does not become an earlier current anchor', async () => {
  const input = fixture('Read verse four. Later, Romans 8:1.', [['verse four', 'John.3.4']]);
  const { calls } = await run(input);
  const classification = calls.find(call => call.fields.includes('classification'));
  assert.equal(classification.state.discourse.current_reference, 'John 3:1');
  assert.ok(classification.state.explicit_references_in_window.some(row => row.reference === 'Romans 8:1'));
});

test('windows carry AI discourse and recent accepted BCV evidence in source order', async () => {
  const text = 'John 3:16. Read verse four.\n\nRead verse six.';
  const input = fixture(text, [['verse four', 'John.3.4'], ['verse six', 'John.3.6']]);
  const { result, calls } = await run(input, { parserOptions: { window_tokens: 4 }, dependency: {} });
  assert.deepEqual(result.references.map(row => row.osis), ['John.3.16', 'John.3.4', 'John.3.6']);
  const second = calls.find(call => call.fields.includes('classification') && call.state.span === 'verse six');
  assert.equal(second.state.discourse.current_reference, 'John 3:4');
  assert.equal(second.state.recent_bcv_matches[0].reference, 'John 3:16');
});

test('whole books, chapters, verses, and ranges request only applicable address parts', async () => {
  for (const [span, osis, fields] of [['the book of John', 'John', []], ['chapter three', 'John.3', ['chapter']],
    ['verse four', 'John.3.4', ['chapter', 'verse', 'subdivision']], ['verses four through six', 'John.3.4-John.3.6', ['chapter', 'verse', 'end_chapter', 'end_verse']]]) {
    const { result, calls } = await run(fixture(`Read ${span}.`, [[span, osis]]));
    assert.equal(result.references[0].osis, osis);
    const address = calls.flatMap(call => call.fields).filter(field => ['chapter', 'verse', 'end_chapter', 'end_verse', 'subdivision'].includes(field));
    assert.deepEqual(address, fields);
  }
});

test('rejected mechanical tags are excluded from discovery and do not seed context', async () => {
  const { result, calls } = await run(fixture('John 3:16', [], {}), { review: 'REJECT' });
  assert.deepEqual(result.references, []);
  assert.equal(result.bcv_matches[0].review_status, 'rejected');
  assert.equal(result.state.current_reference, null);
  assert.equal(calls.length, 1);
});

test('accepted citations in attributes and shared parentheses keep original source offsets', async () => {
  for (const text of ['<a title="John 3:16">click</a>', '(John 3:16; Romans 8:1; Ephesians 2:8)']) {
    const parser = await loadParser(), expected = structuredClone(parser.parse(text).osis_and_indices());
    const { result } = await run(fixture(text, [], {}));
    assert.deepEqual(result.references, expected);
  }
});

test('removed scope, strategy, and boundary switches fail before dispatch', async () => {
  const parser = await loadParser();
  const decisions = { decide() { assert.fail('Removed options must not dispatch'); } };
  for (const options of [{ resolution_scope: 'all' }, { resolution_scope: 'numeric' },
    { resolution_strategy: 'operations' }, { review_boundaries: false }, { review_boundaries: true }]) {
    assert.throws(() => new FuzzyReferenceParser({ parser, decisions, ...options }), /no longer an option/);
  }
});

test('span limits report unprocessed candidates without accepting truncated targets', async () => {
  const { result } = await run(fixture('Read verse four, then verse six.', [['verse four', 'John.3.4'], ['verse six', 'John.3.6']]), {
    parserOptions: { max_spans_per_window: 1 }
  });
  assert.equal(result.status, 'incomplete');
  assert.equal(result.references.length, 1);
  assert.equal(result.references[0].osis, 'John.3.4');
});

test('a verified target that differs from the speculated one is reviewed in the pooled end-of-parse request', async () => {
  const text = 'Numbers 3 and John 3 are both open. Now see verse 6.';
  const start = text.indexOf('see verse 6');
  const fixture = { text, context: {}, expected: [{ span: 'see verse 6', indices: [start, start + 11], osis: 'Num.3.6', reference_kind: 'numeric' }] };
  const { result, calls } = await run(fixture, { distributions: { book: { John: 0.55, Num: 0.45 } }, boundary: { boundary_start: 'token_11' } });
  const ai = result.osis_and_indices().find(r => r.parser === 'ai');
  assert.equal(ai.osis, 'Num.3.6');
  assert.equal(text.slice(...ai.indices), 'verse 6');
  const record = result.parsed_entities().find(e => e.parser === 'ai');
  assert.equal(record.ai.boundary_review.action, 'trimmed');
  // The speculative review rode with the interpretation request; the verified target differed, so a separate pooled review followed it.
  const interpretation = calls.findIndex(call => call.fields.includes('interpretation'));
  const pooled = calls.findIndex((call, i) => i > interpretation && call.state.stage === 'boundary_review');
  assert.ok(calls[interpretation].fields.includes('boundary_start'));
  assert.ok(pooled > interpretation);
});

test('an unreviewable background-context match is reported with its origin and does not stop the input', async () => {
  const context = 'John 3:16 is discussed at length in this long section of the commentary before anything else.';
  const text = 'Compare verse 17.';
  const start = text.indexOf('verse 17');
  const { result } = await run({ text, context, expected: [{ span: 'verse 17', indices: [start, start + 8], osis: 'John.3.17', reference_kind: 'numeric' }] },
    { parserOptions: { max_tokens_per_window: 6 } });
  assert.equal(result.status, 'incomplete');
  assert.deepEqual(result.issues.map(i => i.origin), ['background']);
  assert.equal(result.context_bcv_matches[0].review_status, 'unreviewed');
  assert.equal(result.osis(), 'John.3.17');
});

test('resolution evidence keeps only the eight most recent accepted mechanical citations', async () => {
  const text = 'See Genesis 1:1. See Exodus 2:2. See Leviticus 3:3. See Numbers 4:4. See Deuteronomy 5:5. See Joshua 6:6. See Judges 7:7. See Ruth 2:2. See John 3:16. Compare the seventeenth verse.';
  const start = text.indexOf('the seventeenth verse');
  const { result, calls } = await run({ text, context: {}, expected: [{ span: 'the seventeenth verse', indices: [start, start + 21], osis: 'John.3.17', reference_kind: 'numeric' }] });
  assert.equal(result.explicit.length, 9);
  const classification = calls.find(call => call.fields.includes('classification'));
  assert.equal(classification.state.recent_bcv_matches.length, 8);
  assert.equal(classification.state.recent_bcv_matches[0].reference, 'John 3:16');
  assert.equal(classification.state.discourse.recent_references.length, 8);
});

test('an unresolved citation kind leaves the expression unresolved without an escalation', async () => {
  const text = 'John 3:16 is quoted. Then the thing happens.';
  const start = text.indexOf('the thing');
  const { result } = await run({ text, context: {}, expected: [{ span: 'the thing', indices: [start, start + 9], osis: 'John.3.17', reference_kind: 'unresolved' }] });
  assert.deepEqual(result.osis_and_indices().map(r => r.osis), ['John.3.16']);
  const record = result.parsed_entities().find(e => e.parser === 'ai');
  assert.equal(record.ai.status, 'unresolved');
  assert.equal(record.ai.escalation, undefined);
  assert.deepEqual(result.escalations, []);
});

test('an approximate passage with an explicit first verse returns its beginning and escalates the extent', async () => {
  const text = 'John 3:1 opens the scene. Compare verses 5 and following.';
  const start = text.indexOf('verses 5 and following');
  const { result, calls } = await run({ text, context: {}, expected: [{ span: 'verses 5 and following', indices: [start, start + 22], osis: 'John.3.5', reference_kind: 'numeric', shape: 'approximate' }] });
  const ai = result.osis_and_indices().find(r => r.parser === 'ai');
  assert.equal(ai.osis, 'John.3.5');
  const record = result.parsed_entities().find(e => e.parser === 'ai');
  assert.equal(record.ai.endpoint_status, 'unresolved');
  assert.equal(record.ai.escalation.type, 'semantic_resolution');
  assert.equal(result.escalations[0].expression, 'verses 5 and following');
  const verse = calls.flatMap(call => Object.values(call.questions)).find(q => q.instructions.includes('approximate passage explicitly identify a FIRST verse'));
  assert.ok(verse);
  assert.ok(calls.every(call => !call.fields.includes('end_verse')));
});

// window scheduling

const fixtures = (await Promise.all(['long-cases', 'word-number-cases', 'non-bible-cases', 'html-cases', 'roman-cases', 'detection-cases']
  .map(async name => JSON.parse(await readFile(new URL(`./fixtures/${name}.json`, import.meta.url)))))).flat();

test('whole-window scheduling preserves all nine long-fixture targets in five sequential rounds', async () => {
  const fixture = fixtures.find(f => f.id === 71);
  const { result, calls } = await run(fixture);
  assert.equal(expressionDiagnostics(result).length, 7); // Includes deliberately detected non-reference checklist.
  assert.equal(result.references.length, 9);
  assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, true);
  assert.equal(result.state.current_reference, 'Rom.8.28');
  assert.equal(calls.length, 6); // Review and first-window starts are concurrent, so five sequential rounds.
  assert.equal(calls.filter(call => call.fields.includes('classification')).length, 1);
  // Classification, kind, and shape read identical evidence: one request carries all three.
  const classification = calls.find(call => call.fields.includes('classification'));
  assert.equal(classification.fields.filter(field => field === 'classification').length, 7);
  assert.equal(classification.fields.length, 35);
  assert.ok(classification.fields.includes('citation_scope') && classification.fields.includes('scope'));
  assert.ok(classification.fields.includes('antecedent') && classification.fields.includes('book'));
  // Every discovered span gets a speculative book question; the checklist control's answer is discarded.
  assert.equal(calls.find(call => call.fields.includes('book')).fields.filter(field => field === 'book').length, 7);
  assert.equal(calls.find(call => call.fields.includes('chapter')).fields.length, 19); // 5*3 plus range's four fields.
  // Boundary review needs only the likely target, so it shares the interpretation request.
  const interpretation = calls.find(call => call.fields.includes('interpretation'));
  assert.equal(interpretation.fields.filter(field => field === 'interpretation').length, 6);
  assert.ok(interpretation.fields.includes('boundary_start') || interpretation.fields.includes('boundary_end'));
  assert.equal(calls.filter(call => call.state.stage === 'boundary_review').length, 0);
  assert.ok(calls.every(call => call.bytes < 1000000));
});

test('request depth stays constant as independent citation count grows', async () => {
  const make = count => {
    const text = Array.from({ length: count }, (_, i) => `Please read verse ${i + 2}.`).join(' ');
    return { text, context: { current_reference: 'John.3.1' }, expected: Array.from({ length: count }, (_, i) => {
      const span = `verse ${i + 2}`, start = text.indexOf(span);
      return { span, indices: [start, start + span.length], osis: `John.3.${i + 2}`, reference_kind: 'numeric' };
    }) };
  };
  const one = await run(make(1));
  const many = await run(make(8));
  assert.equal(one.calls.length, 5);
  assert.equal(many.calls.length, one.calls.length);
  assert.equal(many.result.references.length, 8);
  assert.deepEqual(many.result.references.map(r => r.osis), Array.from({ length: 8 }, (_, i) => `John.3.${i + 2}`));
  assert.ok(many.calls.find(call => call.fields.includes('chapter')).fields.includes('subdivision'));
});

test('mixed lists, ranges, and citations pool all ready questions across unequal paths', async () => {
  const fixture = fixtures.find(f => f.id === 108);
  const { result, calls } = await run(fixture);
  assert.deepEqual(result.references.map(r => r.osis), fixture.expected.map(r => r.osis));
  assert.ok(calls.some(call => call.fields.includes('chapter') && call.fields.includes('list_count')));
  assert.ok(calls.some(call => call.fields.includes('interpretation') && call.fields.includes('member_1_book') && call.fields.includes('member_1_scope')));
  assert.ok(calls.some(call => call.fields.includes('member_1_chapter') && call.fields.includes('member_2_verse')));
  assert.ok(calls.some(call => call.fields.includes('boundary_start') && call.fields.some(field => field.startsWith('member_'))));
  assert.equal(calls.length, 7);
});

test('Roman, HTML, number-word, and trailing-chapter fixtures preserve source text and targets', async () => {
  for (const id of [70, 72, 73, 74, 75, 76, 77, 103]) {
    const fixture = fixtures.find(f => f.id === id);
    const { result } = await run(fixture, { review: id === 72 ? 'REOPEN' : 'ACCEPT' });
    assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, true, `Case ${id}`);
    assert.deepEqual(result.references.map(r => r.indices), fixture.expected.map(r => r.indices));
  }
});

test('list numbers, times, AD years, and dates create no resolution questions when absent', async () => {
  for (const id of [93, 94, 95, 96]) {
    const fixture = fixtures.find(f => f.id === id);
    const { result, calls } = await run(fixture, { detectNonReferences: false });
    assert.deepEqual(result.references, []);
    assert.ok(calls.every(call => !call.fields.includes('book') && !call.fields.includes('scope')));
    assert.ok(calls.length <= 3); // Context review, starts, and speculative ends; never a resolution round.
  }
});

test('a genuinely dependent citation waits for its predecessor while an unrelated target advances', async () => {
  const text = 'Read verse four, then verse six, and separately verse nine.';
  const expected = [['verse four', 'John.3.4'], ['verse six', 'John.3.6'], ['verse nine', 'John.3.9']]
    .map(([span, osis]) => ({ span, osis, indices: [text.indexOf(span), text.indexOf(span) + span.length] }));
  const { result, calls } = await run({ text, expected, context: { current_reference: 'John.3.1' } },
    { dependency: { 'verse six': 'expression_0' } });
  assert.deepEqual(result.references.map(r => r.osis), expected.map(r => r.osis));
  assert.deepEqual(expressionDiagnostics(result)[1].depends_on_indices, expected[0].indices);
  assert.equal(expressionDiagnostics(result)[1].anchor, 'John.3.4');
  const bookCalls = calls.filter(call => call.fields.includes('book'));
  // Book inference can use the prose immediately. A selected predecessor
  // supplies new evidence, so that one book is inferred again after it resolves.
  assert.deepEqual(bookCalls.map(call => call.fields.filter(field => field === 'book').length), [3, 1]);
  assert.ok(calls.findIndex(call => call.fields.includes('interpretation')) < calls.indexOf(bookCalls[1]));
  const bookName = Object.keys(bookCalls[1].questions).find(name => name === 'book' || name.endsWith('_book'));
  const task = bookName.match(/^(task_\d+)_/)?.[1];
  const bookEvidence = { ...bookCalls[1].state, ...(task ? bookCalls[1].state.tasks[task] : {}) };
  assert.equal(bookEvidence.selected_antecedent, 'John 3:4');
  // The predecessor's source-only review shares its interpretation request, so
  // the dependant's book inference follows that request rather than a review.
  const predecessorInterpretation = calls.find(call => call.fields.includes('interpretation'));
  assert.ok(predecessorInterpretation.fields.includes('boundary_start'), 'Boundary review must share the interpretation request');
  assert.equal(calls.indexOf(bookCalls[1]), calls.indexOf(predecessorInterpretation) + 1);
});

test('an unresolved predecessor never becomes a fabricated canonical anchor', async () => {
  const text = 'Read verse four, then verse six.';
  const expected = [['verse four', 'John.3.4'], ['verse six', 'John.3.6']]
    .map(([span, osis]) => ({ span, osis, indices: [text.indexOf(span), text.indexOf(span) + span.length] }));
  const { result, calls } = await run({ text, expected, context: { current_reference: 'John.3.1' } },
    { dependency: { 'verse six': 'expression_0' }, unresolved: ['verse four'] });
  assert.deepEqual(result.references, []);
  assert.equal(expressionDiagnostics(result)[1].status, 'unresolved');
  assert.equal(expressionDiagnostics(result)[1].anchor, undefined);
  assert.equal(calls.filter(call => call.fields.includes('book')).length, 1);
});

test('context and input BCV reviews are independent questions in a single HTTP request', async () => {
  const text = 'John 3:16 is quoted here. Please read verse four.';
  const span = 'verse four';
  const { result, calls } = await run({ text, context: { text: 'Our section is John 3.' },
    expected: [{ span, osis: 'John.3.4', indices: [text.indexOf(span), text.indexOf(span) + span.length] }] });
  const review = calls.find(call => call.fields.some(field => field.startsWith('match_')));
  assert.equal(review.fields.length, 2);
  assert.ok(review.state.tasks);
  assert.equal(result.explicit.length, 1);
  assert.equal(result.context_bcv_matches.length, 1);
});

test('a detected checklist control is classified without asking any target-address questions', async () => {
  const fixture = fixtures.find(f => f.id === 93);
  const { result, calls } = await run(fixture);
  assert.deepEqual(result.references, []);
  assert.ok(expressionDiagnostics(result).every(entry => entry.status === 'not_a_bible_reference'));
  assert.ok(calls.some(call => call.fields.includes('classification')));
  // Kind, shape, anchor, and book share the classification request; only address work is gated by it.
  assert.ok(calls.every(call => !call.fields.includes('chapter') && !call.fields.includes('verse') && !call.fields.includes('interpretation')));
});

test('reopened translated tags retain BCV translations and AI array shape', async () => {
  const text = 'John 3:16 NIV';
  const { result } = await run({ text, expected: [{ span: text, indices: [0, text.length], osis: 'John.3.16' }] },
    { review: 'REOPEN' });
  assert.deepEqual(result.osis_and_indices(), [{ osis: 'John.3.16', translations: ['NIV'],
    indices: [0, text.length], parser: 'ai', citation_confidence: 1, target_confidence: 1 }]);
  assert.equal(expressionDiagnostics(result)[0].translation_association.status, 'matched');
  assert.ok(result.parsed_entities().length);
});

test('original UTF-16 offsets survive supplementary characters and raw HTML', async () => {
  const text = '😀 <p>Read verse four.</p>';
  const span = 'verse four', start = text.indexOf(span);
  const { result } = await run({ text, context: { current_reference: 'John.3.1' },
    expected: [{ span, indices: [start, start + span.length], osis: 'John.3.4' }] });
  assert.deepEqual(result.references[0].indices, [start, start + span.length]);
  assert.equal(text.slice(...result.references[0].indices), span);
});

test('tag review and first-window start detection are concurrent requests unless a review disagrees', async () => {
  const text = 'John 3:16 is quoted here. Please read verse four.';
  const span = 'verse four';
  const input = { text, expected: [{ span, osis: 'John.3.4', indices: [text.indexOf(span), text.indexOf(span) + span.length] }] };
  const accepted = await run(input);
  // Review, starts, and speculative ends are dispatched before any answers; each keeps its own flat request body.
  const first = accepted.calls.slice(0, 3);
  assert.ok(first.some(call => call.fields.every(field => field.startsWith('match_'))));
  assert.ok(first.some(call => call.fields.every(field => field.startsWith('starts_at_')) && call.state.search_tokens));
  assert.ok(first.some(call => call.fields.every(field => field.startsWith('ends_from_'))));
  assert.equal(accepted.calls.filter(call => call.fields.some(field => field.startsWith('starts_at_'))).length, 1);
  assert.equal(accepted.calls.length, 6);
  assert.deepEqual(accepted.result.references.map(r => r.osis), ['John.3.16', 'John.3.4']);
  // The speculative starts assumed acceptance, so a reopened tag discards them
  // and detection is repeated with the proposal's tokens searchable.
  const reopened = await run({ ...input, expected: [{ span: 'John 3:16', osis: 'John.3.16', indices: [0, 9] }, ...input.expected] }, { review: 'REOPEN' });
  const startCalls = reopened.calls.filter(call => call.fields.some(field => field.startsWith('starts_at_')));
  assert.equal(startCalls.length, 2);
  assert.ok(!startCalls[0].fields.includes('starts_at_0') && startCalls[1].fields.includes('starts_at_0'));
  assert.equal(reopened.result.bcv_matches[0].review_status, 'reopened');
  assert.deepEqual(reopened.result.references.map(r => r.osis), ['John.3.16', 'John.3.4']);
});

// discourse state

const noDispatch = { decide() { throw new Error('Must not dispatch'); } };

test('returned state after a translation-only verse can be passed back as context', async () => {
  const text = 'Revelation 12:17 (ESV) contains verse 18 (NLT).';
  const start = text.indexOf('verse 18');
  const { result } = await run({ text, context: {}, expected: [{ span: 'verse 18', indices: [start, start + 8],
    osis: 'Rev.12.18', translations: ['NLT'], reference_kind: 'numeric' }] });
  assert.equal(result.osis_and_indices().at(-1).osis, 'Rev.12.18');
  // Discourse keeps the NLT-only verse: state applies no versification bounds.
  assert.deepEqual(result.state, { current_reference: 'Rev.12.18', recent_references: ['Rev.12.18', 'Rev.12.17'],
    active_book: 'Rev', active_chapter: 'Rev.12', active_passage: null });
  const parser = await loadParser();
  await assert.rejects(new FuzzyReferenceParser({ parser, decisions: noDispatch }).parse('Compare verse 3.', { context: result.state }),
    /Must not dispatch/);
});

test('a translation-only range followed by a default-system verse does not crash discourse', async () => {
  const text = 'Revelation 12 says much. Read verses 17 to 18 (NLT). Then compare verse 3.';
  const range = text.indexOf('verses 17 to 18'), verse = text.indexOf('verse 3');
  const { result } = await run({ text, context: {}, expected: [
    { span: 'verses 17 to 18', indices: [range, range + 15], osis: 'Rev.12.17-Rev.12.18', translations: ['NLT'], reference_kind: 'numeric' },
    { span: 'verse 3', indices: [verse, verse + 7], osis: 'Rev.12.3', reference_kind: 'numeric' }] });
  assert.equal(result.osis(), 'Rev.12,Rev.12.17-Rev.12.18,Rev.12.3');
  assert.equal(result.state.current_reference, 'Rev.12.3');
  assert.equal(result.state.active_passage, 'Rev.12.17-Rev.12.18');
});

test('a mechanical translation-only verse enters discourse like any other match', async () => {
  const { result } = await run({ text: 'Revelation 12:18 (NLT) is short.', context: {}, expected: [] });
  assert.deepEqual(result.explicit.map(r => r.osis), ['Rev.12.18']);
  assert.equal(result.state.current_reference, 'Rev.12.18');
  assert.equal(result.state.active_chapter, 'Rev.12');
});

test('candidate existence follows the parser passage_existence_strategy while books stay enabled', async () => {
  const { parserChapters, parseReference } = await import('../resolver.js');
  const parser = await loadParser();
  const expectations = {
    bcv: { 'Rev.12.18': false, 'Dan.13.1': false, 'Jude.1.30': false, 'Gen.1.1-Gen.51.1': false },
    bc: { 'Rev.12.18': true, 'Dan.13.1': false, 'Jude.1.30': true, 'Gen.1.1-Gen.51.1': false },
    b: { 'Rev.12.18': true, 'Dan.13.1': true, 'Jude.1.30': true, 'Gen.1.1-Gen.51.1': true },
    cv: { 'Rev.12.18': false, 'Dan.13.1': false, 'Jude.1.30': false, 'Gen.1.1-Gen.51.1': false }
  };
  for (const [strategy, cases] of Object.entries(expectations)) {
    parser.set_options({ passage_existence_strategy: strategy });
    const chapters = parserChapters(parser);
    for (const [osis, valid] of Object.entries(cases)) {
      assert.ok(parseReference(osis, chapters), `structure ${osis}`);
      assert.equal(Boolean(parseReference(osis, chapters, strategy)), valid, `${strategy} ${osis}`);
      // The supplied parser applies the same policy to its own mechanical matches.
      if (!osis.includes('-')) assert.equal(parser.parse(osis.replace('.', ' ').replace('.', ':')).osis(), valid ? osis : '', `BCV ${strategy} ${osis}`);
    }
    assert.equal(parseReference('Tob.1.1', chapters), null);
    assert.equal(parseReference('Gen.0.1', chapters), null);
    assert.equal(parseReference('Gen.1.0', chapters), null);
  }
  parser.set_options({ passage_existence_strategy: 'b', testaments: 'a' });
  assert.equal(parseReference('Ps.3.4', parserChapters(parser), 'b'), null);
  assert.ok(parseReference('Ps.151.4', parserChapters(parser), 'b'));
  parser.set_options({ testaments: 'on' });
  assert.equal(parseReference('Ps.151.4', parserChapters(parser), 'b'), null);
  assert.ok(parseReference('Ps.152.4', parserChapters(parser), 'b'));
});

test('a verse beyond the chapter resolves only under a relaxed verse strategy', async () => {
  const text = 'Revelation 12:17 is short. Compare verse 18.';
  const start = text.indexOf('verse 18');
  const fixture = { text, context: {}, expected: [{ span: 'verse 18', indices: [start, start + 8], osis: 'Rev.12.18', reference_kind: 'numeric' }] };
  const strict = await run(fixture);
  assert.equal(strict.result.osis(), 'Rev.12.17');
  // No existing candidate, so no interpretation question is paid for.
  assert.equal(strict.calls.some(call => call.fields.includes('interpretation')), false);
  assert.equal(strict.result.state.current_reference, 'Rev.12.17');
  const parser = await loadParser();
  parser.set_options({ passage_existence_strategy: 'bc' });
  const relaxed = await run(fixture, { parser });
  assert.equal(relaxed.result.osis(), 'Rev.12.17,Rev.12.18');
  assert.equal(relaxed.result.parsed_entities().find(e => e.parser === 'ai').end.v, 18);
  assert.equal(relaxed.result.state.current_reference, 'Rev.12.18');
});

test('caller context is checked for structure and enabled books, not versification bounds', async () => {
  const parser = await loadParser();
  const plugin = new FuzzyReferenceParser({ parser, decisions: noDispatch });
  for (const context of [{ current_reference: 'Rev.12.18' }, { active_passage: 'Dan.13.1-Dan.14.42' }, { active_chapter: 'Gen.51' }]) {
    await assert.rejects(plugin.parse('Compare verse 3.', { context }), /Must not dispatch/);
  }
  for (const context of [{ current_reference: 'Tob.1.1' }, { active_chapter: 'Gen.0' }, { current_reference: 'Rev.12.0' }, { active_passage: 'Rev.13.1-Rev.12.1' }]) {
    await assert.rejects(plugin.parse('Compare verse 3.', { context }), /Invalid context reference/);
  }
});

// book options

test('candidate and validation tables follow enabled testaments without mutating versification metadata', async () => {
  const parser = await loadParser();
  for (const [testaments, enabled, disabled] of [
    ['on', ['Gen','John'], ['Tob','Sir']],
    ['ona', ['Gen','John','Tob','Sir'], []],
    ['o', ['Gen'], ['John','Tob']],
    ['n', ['John'], ['Gen','Tob']],
    ['a', ['Tob','Sir'], ['Gen','John']]
  ]) {
    parser.set_options({ testaments });
    const chapters = parserChapters(parser);
    const candidates = hierarchyQuestions(chapters).book.criteria;
    for (const book of enabled) {
      assert.ok(candidates[book]);
      assert.ok(parseReference(`${book}.3.4`, chapters));
    }
    for (const book of disabled) {
      assert.equal(candidates[book], undefined);
      assert.equal(parseReference(`${book}.3.4`, chapters), null);
    }
    assert.ok(parser.translation_info().chapters.Tob);
  }
});

test('Psalm 151 follows apocrypha options, including apocrypha-only filtering', async () => {
  const parser = await loadParser();
  for (const testaments of ['on','ona','a']) {
    parser.set_options({ testaments });
    const chapters = parserChapters(parser);
    assert.equal(Boolean(parseReference('Ps.151.4', chapters)), testaments.includes('a'));
    assert.equal(Boolean(parseReference('Ps.3.4', chapters)), testaments.includes('o'));
    assert.equal(Boolean(parseReference('Ps.150-Ps.151', chapters)), testaments === 'ona');
    const { numericQuestions } = await import('../numeric.js');
    assert.equal(Object.hasOwn(numericQuestions({ Ps: chapters.Ps }).chapter.criteria, 'chapter_151'), testaments.includes('a'));
  }
});

test('translation-specific chapter metadata cannot reintroduce disabled books or Psalms', async () => {
  const parser = await loadParser();
  parser.set_options({ testaments: 'a' });
  const entry = { translation_association: { status: 'matched', source: 'ai', system: 'nlt' } };
  const chapters = translationChapters(entry, parser, parserChapters(parser));
  assert.equal(parseReference('Rev.12.18', chapters), null);
  assert.equal(parseReference('Ps.3.4', chapters), null);
  assert.ok(parseReference('Tob.3.4', chapters));
  assert.ok(parseReference('Ps.151.4', chapters));
});

test('disabled books in structured discourse are rejected before model requests', async () => {
  const parser = await loadParser();
  const plugin = new FuzzyReferenceParser({ parser, decisions: { decide() { throw new Error('Must not dispatch'); } } });
  await assert.rejects(plugin.parse('verse 4', { context: { active_chapter: 'Tob.3' } }), /Invalid context reference/);
});

for (const [osis, context] of [['Tob.3.4','This section discusses Tobit chapter 3.'], ['Ps.151.4','This section discusses Psalm 151.']]) {
  for (const testaments of ['on','ona']) test(`contextual ${osis} obeys testaments=${testaments} through the complete pipeline`, async () => {
    const parser = await loadParser();
    parser.set_options({ testaments });
    const text = 'Please read verse 4.';
    const fixture = { text, context, expected: [{ span: 'verse 4', indices: [12,19], osis, reference_kind: 'numeric' }] };
    const { client } = scripted(fixture, testaments === 'on' ? { unresolved: ['verse 4'] } : {});
    const result = await new FuzzyReferenceParser({ parser, decisions: client }).parse(text, { context });
    assert.deepEqual(result.osis_and_indices().map(r => r.osis), testaments === 'ona' ? [osis] : []);
  });
}

test('English Ecclesiasticus and Ecclesiastes abbreviations stay distinct with apocrypha enabled', async () => {
  const parser = await loadParser();
  for (const testaments of ['on','ona']) {
    parser.set_options({ testaments });
    assert.equal(parser.parse('Eccles. 3:4').osis(), 'Eccl.3.4');
    assert.equal(parser.parse('Ecclus. 3:4').osis(), testaments === 'ona' ? 'Sir.3.4' : '');
  }
});

test('review can reject the BCV Parser false Isaiah match in she is 2 cool', async () => {
  const parser = await loadParser();
  const text = 'she is 2 cool';
  assert.equal(parser.parse(text).osis(), 'Isa.2');
  const { client } = scripted({ text, context: {}, expected: [] }, { review: 'REJECT' });
  const result = await new FuzzyReferenceParser({ parser, decisions: client }).parse(text);
  assert.deepEqual(result.osis_and_indices(), []);
  assert.equal(result.bcv_matches[0].review_status, 'rejected');
});

// minimal parser

// The smallest parser the typings allow: parse() without parsed_entities(),
// translation_info() without aliases, and no regexps or options at all.
async function minimalParser() {
  const { chapters } = (await loadParser()).translation_info();
  return {
    parse(text) {
      const matches = [...text.matchAll(/\bJohn (\d+):(\d+)\b/g)].map(m => ({ osis: `John.${m[1]}.${m[2]}`, translations: [''], indices: [m.index, m.index + m[0].length] }));
      return { osis_and_indices: () => matches };
    },
    translation_info() { return { chapters }; }
  };
}

test('a minimal parser without entities, regexps, or options works end to end', async () => {
  const parser = await minimalParser();
  const text = 'John 3:16 is quoted here. Compare verse 17.';
  const start = text.indexOf('verse 17');
  const { result, calls } = await run({ text, context: 'Background prose with no citation.', expected: [{ span: 'verse 17', indices: [start, start + 8], osis: 'John.3.17', reference_kind: 'numeric' }] }, { parser });
  assert.deepEqual(result.osis_and_indices().map(r => r.osis), ['John.3.16', 'John.3.17']);
  const records = result.parsed_entities();
  const mechanical = records.find(r => !r.parser);
  assert.deepEqual(mechanical.entities, []);
  assert.equal(mechanical.ai.review.choice, 'ACCEPT');
  const ai = records.find(r => r.parser === 'ai');
  assert.deepEqual([ai.start, ai.end], [{ b: 'John', c: 3, v: 17 }, { b: 'John', c: 3, v: 17 }]);
  assert.equal(calls.some(call => call.fields.includes('translation')), false);
  // Without recognition patterns every book in the table is offered.
  assert.equal(Object.keys(parserChapters(parser)).length, Object.keys((await loadParser()).translation_info().chapters).length);
});

test('book identifiers outside the display tables are shown as themselves', () => {
  assert.equal(referenceText('Zzz.2.3-Zzz.2.5'), 'Zzz 2:3–Zzz 2:5');
  assert.equal(referenceText(''), '');
  assert.equal(referenceText(null), null);
});

// long

const longFixture = JSON.parse(await readFile(new URL('./fixtures/long-cases.json', import.meta.url)))[0];

test('the 1K-character longFixture fits one default window and freezes correct source offsets', async () => {
  assert.ok(longFixture.text.length >= 1000 && longFixture.text.length <= 1100);
  assert.ok(tokenize(longFixture.text).length <= 1000);
  assert.equal(longFixture.expected.filter(e => e.osis).length + longFixture.expected_explicit.length, 9);
  for (const row of [...longFixture.expected, ...longFixture.expected_explicit]) {
    assert.equal(longFixture.text.slice(...row.indices), row.span);
  }
  const parser = await loadParser();
  assert.deepEqual(parser.parse(longFixture.text).osis_and_indices().map(({ osis, indices }) => ({ osis, indices })),
    longFixture.expected_explicit.map(({ osis, indices }) => ({ osis, indices })));
});

// demo

test('demo preserves John 3:16 and resolves the continuation through 17', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/regression-cases.json', import.meta.url)));
  const fixture = fixtures.find(f => f.id === 122);
  assert.equal(text, fixture.text);
  const result = await demo({ parser: await loadParser(), decisions: scripted(fixture).client });
  assert.equal(scoreCase(fixture, result, { resolution_scope: 'numeric' }).passed, true);
  assert.equal(Object.hasOwn(result, 'timing'), false);
  assert.equal(Object.hasOwn(result, 'fuzzy'), false);
  const saved = JSON.parse(JSON.stringify({ ...result, parsed_entities: result.parsed_entities() }));
  assert.deepEqual(expressionDiagnostics(saved), expressionDiagnostics(result));
  assert.equal(scoreCase(fixture, saved, { resolution_scope: 'numeric' }).passed, true);
  assert.deepEqual(result.osis_and_indices().map(r => r.osis), ['John.3.16', 'John.3.17']);
  const continuation = result.osis_and_indices()[1];
  assert.equal(continuation.parser, 'ai');
  assert.equal(text.slice(...continuation.indices), '17');
});

// non bible

const [nonBibleFixture] = JSON.parse(await readFile(new URL('./fixtures/non-bible-cases.json', import.meta.url), 'utf8'));
test('numbered list, clock time, AD year, and calendar date controls preserve source spans', async () => {
  const controls = JSON.parse(await readFile(new URL('./fixtures/non-bible-cases.json', import.meta.url), 'utf8')).slice(1);
  assert.deepEqual(controls.map(f => f.id), [93, 94, 95, 96]);
  for (const nonBibleFixture of controls) {
    assert.equal(nonBibleFixture.expected_no_references, true);
    for (const row of nonBibleFixture.expected) assert.equal(nonBibleFixture.text.slice(...row.indices), row.span);
    const result = { text: nonBibleFixture.text, status: 'complete', fuzzy: [], references: [] };
    assert.equal(scoreCase(nonBibleFixture, result, { resolution_scope: 'numeric' }).passed, true);
    result.references.push({ osis: 'Rom.3.1', indices: nonBibleFixture.expected[0].indices, translations: [''] });
    assert.equal(scoreCase(nonBibleFixture, result, { resolution_scope: 'numeric' }).passed, false);
  }
});
test('PS4 negative control fails if the explicit Psalm 4 tag is retained', () => {
  const result = { text: nonBibleFixture.text, status: 'complete', fuzzy: [], references: [] };
  assert.equal(scoreCase(nonBibleFixture, result, { resolution_scope: 'numeric' }).passed, true);
  assert.equal(scoreCase(nonBibleFixture, { ...result, references: [{ osis: 'Ps.4', indices: [10, 13], translations: [''] }] }, { resolution_scope: 'numeric' }).passed, false);
});

// multilingual

test('multilingual gold references are valid and source offsets preserve untranslated phrases', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/multilingual-cases.json', import.meta.url), 'utf8'));
  const parser = await loadParser();
  assert.equal(fixtures.length, 9);
  for (const fixture of fixtures) {
    assert.deepEqual(fixture.context, {}, 'book context must come from the localized source itself');
    assert.equal(typeof fixture.language, 'string');
    const [expected] = fixture.expected;
    assert.equal(fixture.text.slice(...expected.indices), expected.span, fixture.name);
    assert.equal(fixture.text.indexOf(expected.span), fixture.text.lastIndexOf(expected.span), fixture.name);
    assert.equal(expected.osis, 'Rom.3.2-Rom.3.10');
    assert.equal(parser.parse('Romans 3:2-10').osis(), expected.osis);
    assert.deepEqual(expected.status, ['resolved']);
    assert.equal(expected.subdivision, 'whole');
  }
});

test('localized gold phrase boundaries are selectable, including unspaced Han and kana text', async () => {
  const { tokenize } = await import('../text.js');
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/multilingual-cases.json', import.meta.url), 'utf8'));
  for (const fixture of fixtures) {
    const tokens = tokenize(fixture.text);
    const [expected] = fixture.expected;
    assert.ok(tokens.some(t => t.start === expected.indices[0]), `${fixture.name}: start`);
    assert.ok(tokens.some(t => t.end === expected.indices[1]), `${fixture.name}: end`);
    assert.ok(tokens.length <= 1000, fixture.name);
    for (const token of tokens) assert.equal(fixture.text.slice(token.start, token.end), token.text);
  }
});

test('East Asian boundary tokens preserve supplementary Unicode and combining marks at UTF-16 offsets', async () => {
  const { tokenize } = await import('../text.js');
  const text = '😀𠀀第3章か\u3099 John’s 3:16';
  const tokens = tokenize(text, 10);
  assert.deepEqual(tokens.map(t => t.text), ['😀', '𠀀', '第', '3', '章', 'か\u3099', 'John’s', '3', ':', '16']);
  assert.deepEqual(tokens[1], { id: 1, text: '𠀀', start: 12, end: 14 });
  for (const token of tokens) assert.equal(text.slice(token.start - 10, token.end - 10), token.text);
});

test('a book mentioned as background can resolve later verses without becoming a citation anchor', async () => {
  const text = 'Obadiah is brief. Compare verse 3 with verse 17.';
  const input = fixture(text, [
    ['Obadiah', undefined, { classification: 'NOT_A_BIBLE_REFERENCE' }],
    ['verse 3', 'Obad.1.3'], ['verse 17', 'Obad.1.17']
  ], {});
  for (const lastDependency of ['expression_0', 'expression_1']) {
    const { client } = scripted(input, { dependency: { 'verse 3': 'expression_0', 'verse 17': lastDependency } });
    const recovered = [];
    const decisions = { decide(state, questions) {
      for (const [key] of Object.entries(questions)) {
        const task = key.match(/^(task_\d+)_(.+)$/);
        const field = task?.[2] ?? key;
        const evidence = task ? { ...state, ...state.tasks[task[1]] } : state;
        if (field === 'book' && evidence.unavailable_antecedent) {
          recovered.push(evidence.span);
          assert.equal(evidence.unavailable_antecedent.expression, 'Obadiah');
          assert.equal(evidence.unavailable_antecedent.status, 'not_a_bible_reference');
          assert.equal(evidence.selected_antecedent, null);
          assert.ok(evidence.preceding_context.includes('Obadiah is brief.'));
        }
      }
      return client.decide(state, questions);
    } };
    const result = await new FuzzyReferenceParser({ parser: await loadParser(), decisions }).parse(text);
    assert.deepEqual(result.references.map(r => r.osis), ['Obad.1.3', 'Obad.1.17']);
    const entries = expressionDiagnostics(result);
    assert.equal(entries[0].status, 'not_a_bible_reference');
    assert.equal(entries[1].anchor, undefined);
    assert.equal(entries[1].status, 'resolved');
    assert.equal(entries[2].anchor, lastDependency === 'expression_1' ? 'Obad.1.3' : undefined);
    assert.deepEqual(recovered, lastDependency === 'expression_0' ? ['verse 3', 'verse 17'] : ['verse 3']);
  }
});

test('a non-citation dependency cannot supply an invented book when prose gives none', async () => {
  const input = fixture('It is brief. Compare verse 3.', [
    ['It', undefined, { classification: 'NOT_A_BIBLE_REFERENCE' }], ['verse 3', 'Obad.1.3']
  ], {});
  const { result, calls } = await run(input, {
    dependency: { 'verse 3': 'expression_0' }, unresolved: ['verse 3']
  });
  assert.deepEqual(result.references, []);
  const entry = expressionDiagnostics(result)[1];
  assert.equal(entry.status, 'unresolved');
  assert.equal(entry.anchor, undefined);
  assert.equal(entry.decisions.book.choice, 'UNRESOLVED');
  assert.ok(calls.filter(call => call.fields.includes('book')).length > 1);
});


test('a later abbreviated verse can return to the original citation across an intervening comparison', async () => {
  const input = JSON.parse(await readFile(new URL('./fixtures/regression-cases.json', import.meta.url))).find(f => f.id === 221);
  const { result } = await run(input);
  assert.deepEqual(result.references.map(r => r.osis), ['John.3.16', 'John.1.1', 'John.3.17']);
  assert.equal(scoreCase(input, result, { resolution_scope: 'numeric' }).passed, true);
});

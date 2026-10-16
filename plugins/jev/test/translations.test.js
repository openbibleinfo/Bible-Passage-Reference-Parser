// Translation labels from BCV proposals and from AI association (src/translations.js).
import assert from 'node:assert/strict';
import test from 'node:test';
import { bcvProposals, associateTranslations, finalizeTranslations, applyTranslationAnswer, translationLabels, translationQuestion } from '../translations.js';
import { expressionDiagnostics } from './support/diagnostics.js';
import { loadParser } from './support/parser.js';
import { run, scripted } from './support/window-client.js';
import { FuzzyReferenceParser } from '../index.js';

// translations

test('expanded spans and competing proposals retain translation candidates without inheriting them', async () => {
  const parser = await loadParser();
  const text = 'John 3:16 NIV; Romans 8:1 KJV';
  const matches = bcvProposals(parser, text, 'input').map(m => ({ ...m, review_status: 'reopened' }));
  for (const indices of [[0,text.length], [0,14]]) {
    const entry = { indices, canonical: 'John.3.16' };
    finalizeTranslations(entry, matches, parser);
    assert.equal(entry.translation_association.status, 'uncertain');
    assert.ok(entry.translation_association.candidates.length);
    assert.equal(entry.translation_association.reason_code, indices[1] === text.length ? 'multiple_proposals' : 'expanded_span');
    assert.equal(Object.hasOwn(entry.translation_association, 'reason'), false);
    assert.deepEqual(entry.translations, ['']);
  }
  const independent = { indices: [text.length + 2, text.length + 8] };
  associateTranslations(independent, matches, parser);
  assert.equal(independent.translation_association.status, 'none');
  assert.deepEqual(independent.bcv_proposal_ids, []);
});

test('BCV translation scope can cover split citations, while invalid translated targets remain diagnostic', async () => {
  const parser = await loadParser();
  const matches = bcvProposals(parser, 'John 3:16, 18 NIV', 'input').map(m => ({ ...m, review_status: 'reopened' }));
  for (const [indices, canonical] of [[[0,9],'John.3.16'], [[11,13],'John.3.18']]) {
    const entry = { indices, canonical };
    finalizeTranslations(entry, matches, parser);
    assert.equal(entry.translation_association.status, 'matched');
    assert.deepEqual(entry.translations, ['NIV']);
  }
  const entry = { indices: [0,9], canonical: '3John.1.15' };
  finalizeTranslations(entry, matches, parser);
  assert.equal(entry.translation_association.status, 'uncertain');
  assert.equal(Object.hasOwn(entry.translation_association, 'reason'), false);
  assert.equal(entry.translation_association.reason_code, 'invalid_target');
  assert.deepEqual(entry.translations, ['']);
});

test('uncertain associations distinguish unreviewed ownership from conflicting translation systems', async () => {
  const parser = await loadParser();
  const [proposal] = bcvProposals(parser, 'John 3:16 NIV', 'input');
  const entry = { indices: [0,9] };
  associateTranslations(entry, [{ ...proposal, review_status: 'accepted' }], parser);
  assert.equal(entry.translation_association.reason_code, 'proposal_not_reopened');
  associateTranslations(entry, [{ ...proposal, review_status: 'reopened', translations: ['NIV','NRSV'], bcv_entities: [] }], parser);
  assert.equal(entry.translation_association.reason_code, 'multiple_versification_systems');
  assert.equal(Object.hasOwn(entry.translation_association, 'reason'), false);
});

test('finalizing an entry without a canonical target validates its surviving interpretations', async () => {
  const parser = await loadParser();
  const entry = { indices: [0, 8], interpretations: [{ reference: 'Rev.12.18', probability: 0.6 }, { reference: 'Rev.12.17', probability: 0.4 }],
    translation_association: { status: 'matched', source: 'ai', system: 'nlt', translations: ['NLT'], candidates: [] } };
  finalizeTranslations(entry, [], parser);
  assert.deepEqual(entry.translations, ['NLT']);
  entry.interpretations[0].reference = 'Rev.12.19';
  finalizeTranslations(entry, [], parser);
  assert.deepEqual(entry.translations, ['']);
  assert.equal(entry.translation_association.reason_code, 'invalid_target');
});

// ai translations

function fixture(label) {
  const text = `Revelation 12:17 (ESV) contains verse 18 (${label}).`;
  const start = text.indexOf('verse 18');
  return { text, context: {}, expected: [{ span: 'verse 18', indices: [start, start + 8],
    osis: 'Rev.12.18', translations: [label], reference_kind: 'numeric' }] };
}

for (const label of ['NLT', 'NRSVUE']) test(`AI ${label} association selects its versification before validating verse 18`, async () => {
  const { result, calls } = await run(fixture(label));
  const ai = result.references.find(r => r.parser === 'ai');
  assert.equal(ai.osis, 'Rev.12.18');
  assert.deepEqual(ai.translations, [label]);
  assert.deepEqual(result.references[0].translations, ['ESV']);
  assert.equal(expressionDiagnostics(result)[0].versification_system, label.toLowerCase());
  assert.equal(expressionDiagnostics(result)[0].translation_association.source, 'ai');
  const batch = calls.find(c => c.fields.includes('translation'));
  assert.ok(batch.fields.includes('scope') && batch.fields.includes('citation_scope'));
  assert.equal(calls.filter(c => c.fields.includes('translation')).length, 1);
  assert.equal(result.text.slice(...ai.indices), 'verse 18');
});

test('uncertain AI translation does not override the default verse limits or inherit ESV', async () => {
  const { result } = await run(fixture('NLT'), { distributions: { translation: { NLT: 0.49, NONE: 0.3, UNRESOLVED: 0.21 } } });
  assert.equal(result.references.some(r => r.osis === 'Rev.12.18'), false);
  assert.equal(expressionDiagnostics(result)[0].translation_association.reason_code, 'ai_translation_uncertain');
  assert.deepEqual(expressionDiagnostics(result)[0].translations, ['']);
});

test('AI translation survives boundary trimming and still rejects invalid targets', async () => {
  const parser = await loadParser();
  const entry = { indices: [0, 14], span: 'verse 18 (NLT)', decisions: {}, canonical: 'Rev.12.18' };
  applyTranslationAnswer(entry, { choice: 'NLT', probabilities: { NLT: 0.99, NONE: 0.01 } }, parser, 0.85);
  entry.indices = [0, 8]; entry.span = 'verse 18';
  finalizeTranslations(entry, [], parser);
  assert.deepEqual(entry.translations, ['NLT']);
  entry.canonical = 'Rev.12.19';
  finalizeTranslations(entry, [], parser);
  assert.equal(entry.translation_association.reason_code, 'invalid_target');
  assert.deepEqual(entry.translations, ['']);
});

test('an AI-selected label unsupported by the supplied parser stays diagnostic', () => {
  const entry = { decisions: {} };
  applyTranslationAnswer(entry, { choice: 'NLT', probabilities: { NLT: 1 } }, {
    parse() { return { osis_and_indices() { return []; } }; }
  }, 0.85);
  assert.equal(entry.translation_association.reason_code, 'unsupported_translation');
});

test('translation choices follow the supplied language module, including default-system labels', async () => {
  for (const [language_module, text, expected] of [
    ['en', 'ESV and NRSVUE', ['ESV', 'NRSVUE']],
    ['es', 'RVR1960, NTV and NVI; ESV', ['RVR1960', 'NTV', 'NVI']],
    ['fr', 'LSG21 and BDS; NLT', ['LSG21', 'BDS']],
    ['de', 'LUTHER and SCH2000; NIV', ['LUTHER', 'SCH2000']],
    ['zh', 'CUV and CNV; ESV', ['CUV', 'CNV']]
  ]) {
    const parser = await loadParser({ language_module });
    const patterns = parser.regexps.translations;
    const indexes = patterns.map(pattern => pattern.lastIndex);
    const labels = translationLabels(parser, text);
    assert.deepEqual(labels, expected);
    assert.deepEqual(Object.keys(translationQuestion(labels).criteria), [...expected, 'NONE', 'UNRESOLVED']);
    assert.deepEqual(patterns.map(pattern => pattern.lastIndex), indexes);
  }
});

test('new custom labels are offered automatically and retain their configured identifier/system', async () => {
  const parser = await loadParser();
  assert.deepEqual(translationLabels(parser, 'John 3:16, then verse 17 (MYVERSION).'), []);
  parser.add_translations({ translations: [{ text: 'MYVERSION', osis: 'CUSTOM', system: 'nlt' }] });
  const labels = translationLabels(parser, 'John 3:16, then verse 17 (MYVERSION).');
  assert.deepEqual(labels, ['MYVERSION']);
  const entry = { decisions: {}, canonical: 'Rev.12.18' };
  applyTranslationAnswer(entry, { choice: 'MYVERSION', probabilities: { MYVERSION: 1 } }, parser, 0.85);
  finalizeTranslations(entry, [], parser);
  assert.deepEqual(entry.translations, ['CUSTOM']);
  assert.equal(entry.translation_association.system, 'nlt');
});

test('citations without recognized labels need no translation question', async () => {
  const text = 'John 3:16 is a popular verse. Compare verse 17.';
  const start = text.indexOf('verse 17');
  const { calls } = await run({ text, context: {}, expected: [{ span: 'verse 17', indices: [start, start + 8],
    osis: 'John.3.17', reference_kind: 'numeric' }] });
  assert.equal(calls.some(call => call.fields.includes('translation')), false);
});

test('a label written far from the citation needs no translation question', async () => {
  const text = 'John 3:16 (NIV) is a popular verse. ' + 'The discussion continues at length here. '.repeat(3) + 'Compare verse 17.';
  const start = text.indexOf('verse 17');
  const { result, calls } = await run({ text, context: {}, expected: [{ span: 'verse 17', indices: [start, start + 8],
    osis: 'John.3.17', reference_kind: 'numeric' }] });
  assert.equal(calls.some(call => call.fields.includes('translation')), false);
  assert.deepEqual(result.osis_and_indices().map(r => r.translations), [['NIV'], ['']]);
});

test('default translation cutoff is independent of context promotion and can be overridden', async () => {
  const options = { distributions: { translation: { NLT: 0.83, NONE: 0.17 },
    interpretation: { 'Rev.12.18': 0.9, UNRESOLVED: 0.1 } } };
  const accepted = await run(fixture('NLT'), { ...options,
    parserOptions: { min_interpretation_probability: 0.95 } });
  const entry = expressionDiagnostics(accepted.result)[0];
  assert.equal(accepted.result.references.find(r => r.parser === 'ai').osis, 'Rev.12.18');
  assert.equal(entry.translation_association.status, 'matched');
  assert.equal(entry.status, 'ambiguous');
  assert.notEqual(accepted.result.state.current_reference, 'Rev.12.18');
  const rejected = await run(fixture('NLT'), { ...options,
    parserOptions: { min_interpretation_probability: 0.95, min_translation_probability: 0.85 } });
  assert.equal(rejected.result.references.some(r => r.osis === 'Rev.12.18'), false);
  assert.equal(expressionDiagnostics(rejected.result)[0].translation_association.status, 'uncertain');
});


test('default translation cutoff accepts exactly 0.5 and rejects a lower selected probability', async () => {
  for (const probability of [0.5, 0.49]) {
    const { result } = await run(fixture('NLT'), { distributions: {
      translation: { NLT: probability, NONE: 0.3, UNRESOLVED: 0.7 - probability }
    } });
    assert.equal(result.references.some(r => r.osis === 'Rev.12.18'), probability === 0.5);
  }
});

test('a complete label starting within the vicinity survives the boundary without admitting distant labels', async () => {
  const text = 'Read verse 18 as it appears in the New Living Translation (NLT).';
  const input = { text, context: { current_reference: 'Rev.12.17' }, expected: [{
    span: 'verse 18', indices: [5, 13], osis: 'Rev.12.18', translations: ['NLT'], reference_kind: 'numeric'
  }] };
  const { result, calls } = await run(input);
  assert.equal(result.references[0].osis, 'Rev.12.18');
  assert.deepEqual(result.references[0].translations, ['NLT']);
  assert.ok(calls.some(call => call.fields.includes('translation')));
  for (const gap of [48, 49]) {
    const boundaryText = 'verse 18' + ' '.repeat(gap) + 'NLT';
    const boundaryInput = { ...input, text: boundaryText,
      expected: [{ ...input.expected[0], indices: [0, 8] }] };
    const boundary = await run(boundaryInput);
    assert.equal(boundary.calls.some(call => call.fields.includes('translation')), gap === 48);
    assert.equal(boundary.result.references.some(r => r.osis === 'Rev.12.18'), gap === 48);
  }
});

test('a longer recognized label does not create a shorter nearby label from background context', async () => {
  const text = 'Read verse 18 (NRSVUE).';
  const input = { text, context: { text: 'An NRSV edition is available.', current_reference: 'Rev.12.17' },
    expected: [{ span: 'verse 18', indices: [5, 13], osis: 'Rev.12.18', translations: ['NRSVUE'], reference_kind: 'numeric' }] };
  const { client } = scripted(input);
  const offered = [];
  const decisions = { decide(state, questions) {
    for (const [key, question] of Object.entries(questions)) if (key.endsWith('translation')) {
      offered.push(Object.keys(question.criteria));
    }
    return client.decide(state, questions);
  } };
  await new FuzzyReferenceParser({ parser: await loadParser(), decisions }).parse(text, { context: input.context });
  assert.deepEqual(offered, [['NRSVUE', 'NONE', 'UNRESOLVED']]);
});


test('metadata-only translation adapters retain canonical labels whose written aliases differ', () => {
  assert.deepEqual(translationLabels({}, 'John 1:1 (MYVERSION)', [
    { indices: [0, 20], translations: ['CUSTOM'] }
  ]), ['CUSTOM']);
});

test('preceding translation instructions reach ownership inference without inheriting nearby editions', async () => {
  const examples = [
    ['In the NLT, read verse 18.', 'verse 18', 'Rev.12.18', 'NLT'],
    ['Use the NRSVUE for verse 18.', 'verse 18', 'Rev.12.18', 'NRSVUE'],
    ['The NLT Bible is on the shelf. Read verse 16.', 'verse 16', 'Rev.12.16', ''],
    ['Revelation 12:17 (NLT) is quoted above. Read verse 16 without specifying a translation.', 'verse 16', 'Rev.12.16', '']
  ];
  for (const [text, span, osis, label] of examples) {
    const start = text.indexOf(span);
    const input = { text, context: { current_reference: 'Rev.12.17' },
      expected: [{ span, indices: [start, start + span.length], osis, translations: [label], reference_kind: 'numeric' }] };
    const { client } = scripted(input);
    let asked = false;
    const decisions = { decide(state, questions) {
      for (const [key, question] of Object.entries(questions)) if (key.endsWith('translation')) {
        asked = true;
        const task = key.match(/^(task_\d+)_/);
        const evidence = task ? state.tasks[task[1]] : state;
        assert.ok(evidence.preceding_context.includes(label || 'NLT'));
        assert.match(question.instructions, /preceding_context and following_context/);
        assert.match(question.instructions, /label that belongs to an earlier or neighboring citation/);
      }
      return client.decide(state, questions);
    } };
    const result = await new FuzzyReferenceParser({ parser: await loadParser(), decisions }).parse(text, { context: input.context });
    assert.equal(asked, true);
    const reference = result.references.find(r => r.parser === 'ai');
    assert.equal(reference.osis, osis);
    assert.deepEqual(reference.translations, [label]);
  }
});

// Citation start and end discovery, including the retrieval floor and yielding starts (src/discovery.js).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { discoverWindow, YIELDING_START } from '../discovery.js';
import { tokenize } from '../text.js';
import { loadParser } from './support/parser.js';
import { run } from './support/window-client.js';

// discovery

const answer = (q, selected, probabilities) => ({ type: 'choice', choice: selected, confidence: 1,
  probabilities: probabilities ?? Object.fromEntries(Object.keys(q.criteria).map(key => [key, Number(key === selected)])) });

test('start retrieval keeps losing positive branches for downstream classification in one endpoint batch', async () => {
  const text = 'Read (17), then (18), and item (3).';
  const window = { text, start: 0, end: text.length, tokens: tokenize(text) };
  const candidates = window.tokens.filter(token => ['17', '18', '3'].includes(token.text));
  const probabilities = { '17': 0.33, '18': 0.21, '3': 0.02 };
  const calls = [];
  const entries = await discoverWindow({ text, window, excluded: [], evidence: {}, provider: 'jev', maxSpans: 64, issues: [],
    askMany: async (state, questions) => {
      calls.push(questions);
      return Object.fromEntries(Object.entries(questions).map(([name, q]) => {
        if (name.startsWith('starts_at_')) {
          const token = window.tokens[Number(name.slice(10))];
          const probability = probabilities[token.text] ?? 0;
          return [name, answer(q, 'NOT_START', { START: probability, NOT_START: 1 - probability })];
        }
        const id = Number(name.slice(10));
        return [name, answer(q, `token_${id}`)];
      }));
    } });
  // Ends are asked for every eligible token alongside the starts; only retrieved starts use them.
  assert.equal(calls.length, 2);
  const ends = calls.find(call => Object.keys(call)[0].startsWith('ends_from_'));
  assert.deepEqual(Object.keys(ends), window.tokens.map(token => `ends_from_${token.id}`));
  for (const token of candidates.slice(0, 2)) assert.ok(Object.hasOwn(ends[`ends_from_${token.id}`].criteria, `token_${token.id}`));
  assert.deepEqual(entries.map(entry => entry.span), ['17', '18']);
  assert.ok(entries.every(entry => entry.decisions.start.choice === 'NOT_START'));
  assert.deepEqual(entries.map(entry => entry.decisions.start.probabilities.START), [0.33, 0.21]);
});

test('zero-probability starts are never retrieved even with a zero retrieval floor', async () => {
  const text = 'Ordinary prose';
  const window = { text, start: 0, end: text.length, tokens: tokenize(text) };
  let calls = 0;
  const entries = await discoverWindow({ text, window, excluded: [], evidence: {}, provider: 'jev', maxSpans: 64,
    min_start_probability: 0, issues: [], askMany: async (_state, questions) => {
      calls++;
      return Object.fromEntries(Object.entries(questions).map(([name, q]) => [name, answer(q, 'NOT_START')]));
    } });
  assert.deepEqual(entries, []);
  assert.equal(calls, 2); // Starts and speculative ends; nothing further.
});

test('a speculative end on the lookahead cut is re-asked with every remaining token', async () => {
  const words = Array.from({ length: 30 }, (_, i) => `w${i}`);
  words[2] = 'verses';
  const text = words.join(' ');
  const window = { text, start: 0, end: text.length, tokens: tokenize(text) };
  const calls = [];
  const entries = await discoverWindow({ text, window, excluded: [], evidence: {}, provider: 'jev', maxSpans: 64, issues: [],
    askMany: async (_state, questions) => {
      calls.push(questions);
      return Object.fromEntries(Object.entries(questions).map(([name, q]) => {
        if (name.startsWith('starts_at_')) return [name, answer(q, name === 'starts_at_2' ? 'START' : 'NOT_START')];
        // The speculative list for token 2 is cut at 16 options; choose its last. The full list ends at token 29.
        const options = Object.keys(q.criteria);
        return [name, answer(q, options.length === 16 ? options.at(-1) : 'token_20')];
      }));
    } });
  assert.equal(calls.length, 3);
  assert.deepEqual(Object.keys(calls[2]), ['ends_from_2']);
  assert.equal(Object.keys(calls[2].ends_from_2.criteria).length, 28);
  assert.deepEqual(entries.map(entry => entry.span), [words.slice(2, 21).join(' ')]);
});

// discovery edges

// Discovery edge cases around the retrieval floor: a start kept only because
// its START probability clears min_start_probability (0.08) can enclose the
// start the model actually chose. Spans are scripted through the window client.
const fixture = (text, span, osis) => { const start = text.indexOf(span); return { text, context: {},
  expected: [{ span, indices: [start, start + span.length], osis, reference_kind: 'numeric', ...(osis.includes('-') ? { shape: 'chapter_range' } : {}) }] }; };
const ids = text => Object.fromEntries(tokenize(text).map(t => [t.text + '@' + t.start, t.id]));
const aiSpans = result => result.osis_and_indices().filter(r => r.parser === 'ai').map(r => [result.text.slice(...r.indices), r.osis]);

test('a floor-retrieved sentence subject yields to the chosen interior start', async () => {
  const text = 'This theme extends through the first eleven chapters of Genesis, which narrate much.';
  const tokens = tokenize(text);
  const genesis = tokens.find(t => t.text === 'Genesis').id;
  const { result, calls } = await run(fixture(text, 'the first eleven chapters of Genesis', 'Gen.1-Gen.11'),
    { distributions: { starts_at_0: { START: 0.12, NOT_START: 0.88 }, [`starts_at_${genesis}`]: { START: 0.98, NOT_START: 0.02 } }, ends: { 0: genesis } });
  assert.deepEqual(aiSpans(result), [['the first eleven chapters of Genesis', 'Gen.1-Gen.11']]);
  assert.deepEqual(result.issues, []);
  // The yielding candidate is never resolved, so no request carries its span.
  assert.ok(calls.every(call => !JSON.stringify(call.state).includes('"span":"This theme')));
});

test('an enclosing start at or above the yielding threshold keeps its span over a strong interior book name', async () => {
  const text = 'Read the first eleven chapters of Genesis, which narrate much.';
  const genesis = tokenize(text).find(t => t.text === 'Genesis').id;
  for (const probability of [YIELDING_START, 0.39, 0.6]) {
    const { result } = await run(fixture(text, 'the first eleven chapters of Genesis', 'Gen.1-Gen.11'),
      { distributions: { starts_at_1: { START: probability, NOT_START: 1 - probability }, [`starts_at_${genesis}`]: { START: 0.98, NOT_START: 0.02 } } });
    assert.deepEqual(aiSpans(result), [['the first eleven chapters of Genesis', 'Gen.1-Gen.11']], String(probability));
  }
});

test('a floor-retrieved start yields only to a start the model chose, not to another floor candidate', async () => {
  const text = 'This theme extends through the first eleven chapters of Genesis, which narrate much.';
  const genesis = tokenize(text).find(t => t.text === 'Genesis').id;
  const { result } = await run(fixture(text, 'This theme extends through the first eleven chapters of Genesis', 'Gen.1-Gen.11'),
    { distributions: { starts_at_0: { START: 0.12, NOT_START: 0.88 }, starts_at_4: { START: 0.3, NOT_START: 0.7 } }, ends: { 4: genesis } });
  assert.deepEqual(aiSpans(result), [['This theme extends through the first eleven chapters of Genesis', 'Gen.1-Gen.11']]);
});

test('bare numerals retrieved only by the floor survive when nothing stronger sits inside them', async () => {
  const text = 'John 3:16 is famous; 17 and 18 continue the thought.';
  const t = tokenize(text);
  const [a, b] = [t.find(x => x.text === '17').id, t.find(x => x.text === '18').id];
  const i17 = text.indexOf('17'), i18 = text.indexOf('18');
  const { result } = await run({ text, context: {}, expected: [
    { span: '17', indices: [i17, i17 + 2], osis: 'John.3.17', reference_kind: 'numeric' },
    { span: '18', indices: [i18, i18 + 2], osis: 'John.3.18', reference_kind: 'numeric' }] },
    { distributions: { [`starts_at_${a}`]: { START: 0.15, NOT_START: 0.85 }, [`starts_at_${b}`]: { START: 0.13, NOT_START: 0.87 } } });
  assert.deepEqual(aiSpans(result), [['17', 'John.3.17'], ['18', 'John.3.18']]);
});

test('after a takeover, the chosen start still suppresses its own interior tokens and junk between them', async () => {
  const text = 'This theme extends through the first eleven chapters of Genesis, which narrate much.';
  const t = tokenize(text);
  const genesis = t.find(x => x.text === 'Genesis').id, first = t.find(x => x.text === 'first').id;
  const { result, calls } = await run(fixture(text, 'the first eleven chapters of Genesis', 'Gen.1-Gen.11'),
    { distributions: { starts_at_0: { START: 0.12, NOT_START: 0.88 }, starts_at_1: { START: 0.1, NOT_START: 0.9 },
      [`starts_at_${first}`]: { START: 0.64, NOT_START: 0.36 }, [`starts_at_${genesis}`]: { START: 0.98, NOT_START: 0.02 } }, ends: { 0: genesis, 1: genesis, [first]: genesis } });
  assert.deepEqual(aiSpans(result), [['the first eleven chapters of Genesis', 'Gen.1-Gen.11']]);
  assert.deepEqual(result.issues, []);
  assert.equal(calls.filter(call => call.fields.includes('classification')).length, 1);
});

test('a floor candidate whose span crosses an established entry is exposed, not silently repaired', async () => {
  const text = 'Compare verse 17 and move on.';
  const t = tokenize(text);
  const verse = t.find(x => x.text === 'verse').id, and = t.find(x => x.text === 'and').id;
  const { result } = await run(fixture(text, 'Compare verse 17', 'John.3.17'),
    { distributions: { starts_at_0: { START: 0.1, NOT_START: 0.9 }, [`starts_at_${verse}`]: { START: 0.1, NOT_START: 0.9 } }, ends: { [verse]: and } });
  // Neither candidate was chosen, so nothing yields; "verse 17 and" crosses "Compare verse 17" and is reported.
  assert.deepEqual(aiSpans(result).map(([span]) => span), ['Compare verse 17']);
  assert.ok(result.issues.some(issue => issue.reason.includes('overlap inconsistently')));
  assert.equal(result.status, 'incomplete');
});

// detection fixtures

test('focused detection fixtures preserve literal spans and valid numeric targets', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/detection-cases.json', import.meta.url)));
  assert.deepEqual(fixtures.map(f => f.id), Array.from({ length: 12 }, (_, i) => i + 97));
  const parser = await loadParser();
  for (const fixture of fixtures) {
    for (const row of fixture.expected) {
      assert.equal(fixture.text.slice(...row.indices), row.span);
      if (row.osis && row.osis !== 'Rom') assert.equal(parser.parse(row.osis).osis(), row.osis);
    }
  }
  assert.ok(fixtures.find(f => f.id === 100).expected[0].needs_semantic_resolution);
  assert.ok(fixtures.filter(f => f.expected_no_references).every(f => f.expected.every(row => row.optional)));
});

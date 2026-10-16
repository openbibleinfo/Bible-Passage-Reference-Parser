// BCV tag review and source boundary review (src/review.js, src/boundaries.js).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reviewBoundary, review_boundaries } from '../boundaries.js';
import { JevClient } from '../decisions.js';
import { FuzzyReferenceParser } from '../index.js';
import { reviewMatchGroups } from '../review.js';
import { proseWindows } from '../text.js';
import { scoreCase } from './support/evaluation.js';
import { loadParser } from './support/parser.js';

// review

test('BCV reviews across input and context windows share one HTTP body with isolated evidence', async () => {
  const group = (text, references, origin) => ({ origin, backgroundContext: '',
    windows: proseWindows(text, 'auto', [], 1),
    matches: references.map(([span, osis]) => ({ span, osis, indices: [text.indexOf(span), text.indexOf(span) + span.length] })) });
  const groups = [group('John 3:16.\n\nRomans 8:28.', [['John 3:16', 'John.3.16'], ['Romans 8:28', 'Rom.8.28']], 'background'),
    group('Mark 4:7.\n\nLuke 2:3.', [['Mark 4:7', 'Mark.4.7'], ['Luke 2:3', 'Luke.2.3']], 'input')];
  let requests = 0;
  const client = new JevClient({ api_key: 'test-key', fetch: async (_url, options) => {
    requests++;
    const { state, questions } = JSON.parse(options.body);
    assert.equal(Object.keys(questions).length, 4);
    assert.equal(Object.keys(state.tasks).length, 4);
    const answers = Object.fromEntries(Object.entries(questions).map(([name, q]) => {
      const local = { ...state, ...state.tasks[name.match(/^(task_\d+)_/)[1]] };
      assert.equal(Object.keys(local.bcv_proposals).length, 1);
      const selected = local.window_text.includes('Romans') ? 'REOPEN' : local.window_text.includes('Luke') ? 'REJECT' : 'ACCEPT';
      return [name, { type: 'choice', choice: selected, confidence: 1,
        probabilities: Object.fromEntries(Object.keys(q.criteria).map(k => [k, Number(k === selected)])) }];
    }));
    return new Response(JSON.stringify({ answers, usage: { cost: 0 } }));
  } });
  const judgments = [];
  const results = await reviewMatchGroups({ groups, decisions: client, judgments, maxTokens: 100 });
  assert.equal(requests, 1);
  assert.deepEqual(results.map(matches => matches.map(match => match.review_status)), [['accepted', 'reopened'], ['accepted', 'rejected']]);
  assert.equal(judgments.length, 4);
});

test('unreviewed matches in oversized windows cannot silently become accepted references', async () => {
  const decisions = { async decide() { assert.fail('Oversized windows must not dispatch'); } };
  const result = await new FuzzyReferenceParser({ parser: await loadParser(), decisions, max_tokens_per_window: 2 })
    .parse('John 6:35 supplies the context.');
  assert.equal(result.status, 'incomplete');
  assert.equal(result.bcv_matches[0].review_status, 'unreviewed');
  assert.equal(result.bcv_matches[0].tag_action, 'pending_review');
  assert.deepEqual(result.references, []);
});

test('routing evaluation checks escalation separately from semantic target accuracy', async () => {
  const [fixture] = JSON.parse(await readFile(new URL('./fixtures/routing-cases.json', import.meta.url), 'utf8'));
  assert.equal(fixture.text.slice(...fixture.expected[0].indices), fixture.expected[0].span);
  const base = { text: fixture.text, status: 'complete', explicit: [], references: fixture.expected_explicit, fuzzy: [{
    span: fixture.expected[0].span, indices: fixture.expected[0].indices, status: 'needs_search'
  }] };
  assert.equal(scoreCase(fixture, base).passed, false);
  base.fuzzy[0].needs_semantic_resolution = true;
  base.fuzzy[0].escalation = { type: 'semantic_resolution' };
  const score = scoreCase(fixture, base);
  assert.equal(score.passed, true);
  assert.equal(score.rows[0].semantic_routing, true);
  assert.equal(score.rows[0].semantic_exact, null);
});

test('invalid caller context fails before any potentially billed BCV review', async () => {
  const decisions = { async decide() { assert.fail('Invalid caller context must not dispatch'); } };
  await assert.rejects(new FuzzyReferenceParser({ parser: await loadParser(), decisions })
    .parse('John 3:16 is quoted.', { context: { current_reference: 'INVALID' } }), /Invalid context reference/);
});

test('ignoring a footnote cannot conceal loss of a genuine explicit Bible citation', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/compact-cases.json', import.meta.url), 'utf8'));
  const fixture = fixtures.find(f => f.id === 42);
  const result = { text: fixture.text, status: 'complete', fuzzy: [], references: [] };
  const missing = scoreCase(fixture, result);
  assert.equal(missing.rows[0].status, true);
  assert.equal(missing.explicit_rows[0].found, false);
  assert.equal(missing.passed, false);
  result.references.push({ osis: 'John.3.16', indices: [0, 9], translations: [''] });
  assert.equal(scoreCase(fixture, result).passed, true);
});

// boundaries

const text = 'ローマ人への手紙は私の好きな聖書の書です。特に第3章の2〜10節が大好きです。';
function answer(question, selected) {
  assert.ok(Object.hasOwn(question.criteria, selected), selected);
  return { type: 'choice', choice: selected, confidence: 1,
    probabilities: Object.fromEntries(Object.keys(question.criteria).map(key => [key, Number(key === selected)])) };
}

test('independent boundary questions share one request and map back to their own citations', async () => {
  const text = 'Read verse 4; compare verse 6.';
  const windows = proseWindows(text);
  const entries = [4, 6].map(n => {
    const span = `verse ${n}`, start = text.indexOf(span), end = start + span.length;
    const tokens = windows[0].tokens.filter(t => t.start >= start && t.end <= end);
    return { span, indices: [start, end], token_indices: [tokens[0].id, tokens.at(-1).id],
      canonical: `John.3.${n}`, decisions: {} };
  });
  let requests = 0;
  await review_boundaries({ entries, text, windows, context: 'John chapter 3',
    askMany: async (state, questions) => {
      requests++;
      assert.equal(state.window_text, text);
      assert.equal(Object.keys(state.reviews).length, 2);
      assert.equal(Object.keys(questions).length, 4);
      return Object.fromEntries(Object.entries(questions).map(([name, question]) => {
        const review = state.reviews[name.split('_').slice(0, 2).join('_')];
        assert.ok(review);
        const selected = name.endsWith('start') ? `token_${review.tokens.at(-1).id}` : 'KEEP';
        return [name, answer(question, selected)];
      }));
    } });
  assert.equal(requests, 1);
  assert.deepEqual(entries.map(e => e.span), ['4', '6']);
  assert.deepEqual(entries.map(e => e.canonical), ['John.3.4', 'John.3.6']);
  assert.ok(entries.every(e => e.boundary_review.action === 'trimmed'));
  assert.ok(entries.every(e => Object.hasOwn(e.decisions, 'boundary_start') && Object.hasOwn(e.decisions, 'boundary_end')));
});

test('a pooled boundary request failure stops without retry or changing any citation', async () => {
  const text = 'Read verse 4; compare verse 6.';
  const windows = proseWindows(text);
  const entries = [4, 6].map(n => {
    const span = `verse ${n}`, start = text.indexOf(span);
    return { span, indices: [start, start + span.length], token_indices: [0, 1], canonical: `John.3.${n}`, decisions: {} };
  });
  const before = structuredClone(entries);
  let requests = 0;
  await assert.rejects(review_boundaries({ entries, text, windows, context: '', askMany: async () => {
    requests++;
    throw new Error('Provider unavailable');
  } }), /Provider unavailable/);
  assert.equal(requests, 1);
  assert.deepEqual(entries, before);
});

test('boundary reviews across windows share one body while keeping local token choices separate', async () => {
  const text = '😀 Read verse 4.\n\nCompare verse 6.';
  const windows = proseWindows(text, 'auto', [], 1);
  const entries = [4, 6].map((n, i) => {
    const span = `verse ${n}`, start = text.indexOf(span), tokens = windows[i].tokens.filter(t => t.start >= start && t.end <= start + span.length);
    return { span, indices: [start, start + span.length], token_indices: [tokens[0].id, tokens.at(-1).id], canonical: `John.3.${n}`, decisions: {} };
  });
  let requests = 0;
  await review_boundaries({ entries, text, windows, context: '', askMany: async (state, questions) => {
    requests++;
    assert.equal(Object.keys(questions).length, 4);
    return Object.fromEntries(Object.entries(questions).map(([name, q]) => {
      const local = { ...state, ...state.tasks[name.match(/^(task_\d+)_/)[1]] };
      assert.ok(local.window_text.includes(local.span));
      const selected = name.endsWith('start') ? `token_${local.tokens.at(-1).id}` : 'KEEP';
      return [name, answer(q, selected)];
    }));
  } });
  assert.equal(requests, 1);
  assert.deepEqual(entries.map(e => e.span), ['4', '6']);
  assert.deepEqual(entries.map(e => text.slice(...e.indices)), ['4', '6']);
});

test('review keeps original spans for KEEP, unresolved, or reversed boundaries', async () => {
  const source = '😀 read verses 4 through 6 now';
  const window = proseWindows(source)[0];
  const last = window.tokens.at(-1).id;
  for (const [firstChoice, lastChoice, action] of [
    ['KEEP', 'KEEP', 'kept'], ['UNRESOLVED', 'KEEP', 'unresolved'],
    [`token_${last}`, 'token_0', 'invalid']
  ]) {
    const entry = { span: source, indices: [0, source.length], token_indices: [0, last],
      canonical: 'John.3.4-John.3.6', decisions: {} };
    await reviewBoundary({ entry, text: source, window, context: '', askMany: async (_, questions) => ({
      boundary_start: answer(questions.boundary_start, firstChoice),
      boundary_end: answer(questions.boundary_end, lastChoice)
    }) });
    assert.deepEqual(entry.indices, [0, source.length]);
    assert.equal(entry.span, source);
    assert.equal(entry.boundary_review.action, action);
  }
});

test('review can trim both ends while preserving supplementary-character source offsets', async () => {
  const source = '😀 read verses 4 through 6 now', window = proseWindows(source)[0];
  const first = window.tokens.find(t => t.text === 'verses'), last = window.tokens.find(t => t.text === '6');
  const entry = { span: source, indices: [0, source.length], token_indices: [0, window.tokens.at(-1).id],
    canonical: 'John.3.4-John.3.6', decisions: {} };
  await reviewBoundary({ entry, text: source, window, context: '', askMany: async (_, questions) => ({
    boundary_start: answer(questions.boundary_start, `token_${first.id}`),
    boundary_end: answer(questions.boundary_end, `token_${last.id}`)
  }) });
  assert.equal(entry.span, 'verses 4 through 6');
  assert.deepEqual(entry.indices, [8, 26]);
  assert.equal(source.slice(...entry.indices), entry.span);
});

test('a one-token citation has no tighter token boundary and needs no review request', async () => {
  const source = '7', window = proseWindows(source)[0];
  const entry = { span: source, indices: [0, 1], token_indices: [0, 0], canonical: 'Mark.4.7', decisions: {} };
  await reviewBoundary({ entry, text: source, window, context: '', askMany: async () => { throw new Error('Needless review'); } });
  assert.deepEqual(entry.indices, [0, 1]);
  assert.deepEqual(entry.decisions, {});
  assert.equal(entry.boundary_review, undefined);
});

test('an ambiguous primary receives boundary review without promotion or changing its probabilities', async () => {
  const source = 'read verse 6', window = proseWindows(source)[0];
  const entry = { span: source, indices: [0, source.length], token_indices: [0, window.tokens.at(-1).id],
    status: 'ambiguous', interpretations: [{ reference: 'John.3.6', probability: 0.6 }, { reference: 'Num.3.6', probability: 0.4 }],
    translations: [''], decisions: {} };
  const before = structuredClone(entry.interpretations);
  let requests = 0;
  await reviewBoundary({ entry, text: source, window, context: '', askMany: async (state, questions) => {
    requests++;
    assert.equal(state.reference, 'John 3:6');
    return { boundary_start: answer(questions.boundary_start, 'token_1'), boundary_end: answer(questions.boundary_end, 'KEEP') };
  } });
  assert.equal(requests, 1);
  assert.equal(entry.span, 'verse 6');
  assert.equal(entry.status, 'ambiguous');
  assert.equal(entry.canonical, undefined);
  assert.deepEqual(entry.interpretations, before);
});

test('boundary review asks only the side that can change', async () => {
  const source = ' 7', window = proseWindows(source)[0];
  const entry = { span: source, indices: [0, 2], token_indices: [0, 0], canonical: 'Mark.4.7', decisions: {} };
  await reviewBoundary({ entry, text: source, window, context: '', askMany: async (_, questions) => {
    assert.deepEqual(Object.keys(questions), ['boundary_start']);
    return { boundary_start: answer(questions.boundary_start, 'token_0') };
  } });
  assert.deepEqual(entry.indices, [1, 2]);
  assert.equal(entry.decisions.boundary_end, undefined);
  assert.equal(entry.boundary_review.action, 'trimmed');
});

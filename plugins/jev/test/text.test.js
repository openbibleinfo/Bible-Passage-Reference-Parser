// Tokens, offsets, windows, and parenthesis trimming (src/text.js).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { FuzzyReferenceParser, JevClient } from '../index.js';
import { parseReference } from '../resolver.js';
import { tokenize, proseWindows, citationIndices, sentences } from '../text.js';
import { loadParser } from './support/parser.js';

// core

test('token offsets preserve astral characters, punctuation, and curly apostrophes', () => {
  const text = '😀 God’s word: John 3:16.';
  const tokens = tokenize(text);
  assert.equal(tokens[1].text, 'God’s');
  assert.equal(tokens[1].start, 3);
  for (const token of tokens) assert.equal(text.slice(token.start, token.end), token.text);
});

test('oversized sentences are reported incomplete and retain explicit results', async () => {
  const parser = await loadParser();
  const result = await new FuzzyReferenceParser({ review_bcv_matches: false, parser, decisions: { decide() { throw new Error('Oversized input must not dispatch'); } }, max_tokens_per_window: 2 }).parse('John 6:35 says something.');
  assert.equal(result.status, 'incomplete');
  assert.equal(result.references[0].osis, 'John.6.35');
});

test('canonical addresses validate versification bounds and ranges across chapters', async () => {
  const chapters = (await loadParser()).translation_info().chapters;
  assert.ok(parseReference('John.6.71-John.7.1', chapters));
  // Existence bounds apply only when a strategy is supplied; structure always applies.
  assert.ok(parseReference('John.6.72', chapters));
  assert.equal(parseReference('John.6.72', chapters, 'bcv'), null);
  assert.ok(parseReference('John.6.72', chapters, 'bc'));
  assert.equal(parseReference('John.22.1', chapters, 'bc'), null);
  assert.ok(parseReference('John.22.1', chapters, 'b'));
  assert.equal(parseReference('John.7.1-John.6.71', chapters), null);
  assert.equal(parseReference('John.1.0', chapters), null);
  assert.equal(parseReference('John.0.1', chapters), null);
  assert.equal(parseReference('John.3.6!a', chapters).start.versePart, 'a');
});

test('all 25 README fixtures preserve the original expected span offsets', async () => {
  const { readFile } = await import('node:fs/promises');
  const cases = JSON.parse(await readFile(new URL('./fixtures/readme-cases.json', import.meta.url), 'utf8'));
  assert.equal(cases.length, 25);
  for (const fixture of cases) for (const expected of fixture.expected) {
    assert.equal(fixture.text.slice(...expected.indices).toLowerCase(), expected.span.toLowerCase());
  }
});

test('sentence boundaries preserve BCV spans across book abbreviation punctuation', async () => {
  const { sentences } = await import('../text.js');
  const parser = await loadParser();
  const text = 'Paul writes in 1 Cor. 13:1–3. The next verse explains.';
  const explicit = parser.parse(text).osis_and_indices();
  const segments = sentences(text, explicit.map(r => r.indices));
  assert.equal(segments.length, 2);
  assert.equal(segments[0].text, 'Paul writes in 1 Cor. 13:1–3. ');
  assert.equal(segments.map(s => s.text).join(''), text);
  for (const segment of segments) for (const token of segment.tokens) assert.equal(text.slice(token.start, token.end), token.text);
});

// windowing

test('automatic windows cover raw HTML and Unicode exactly without splitting BCV proposals', () => {
  const text = '😀 Introduction. John<br>21. More discussion.\n\nCompare 1 Cor. 13:1. Closing remarks.';
  const start = text.indexOf('1 Cor.');
  const protectedSpan = [start, start + '1 Cor. 13:1'.length];
  const windows = proseWindows(text, 'auto', [protectedSpan], 6);
  assert.ok(windows.length > 1);
  assert.equal(windows.map(w => w.text).join(''), text);
  assert.equal(windows[0].start, 0);
  assert.equal(windows.at(-1).end, text.length);
  windows.forEach((w, i) => {
    if (i) assert.equal(w.start, windows[i - 1].end);
    assert.deepEqual(w.tokens.map(t => [t.text, t.start, t.end]), tokenize(w.text, w.start).map(t => [t.text, t.start, t.end]));
    assert.deepEqual(w.tokens.map(t => t.id), w.tokens.map((_, id) => id));
    assert.ok(!(protectedSpan[0] < w.end && w.end < protectedSpan[1]));
  });
});

test('automatic window target preserves an oversized sentence and small inputs', () => {
  const text = 'A single lengthy sentence with no interior punctuation whatsoever ends here.';
  assert.deepEqual(proseWindows(text, 'auto', [], 3), proseWindows(text));
  assert.deepEqual(proseWindows('John 3:16.', 'auto'), proseWindows('John 3:16.'));
  assert.deepEqual(proseWindows('', 'auto'), []);
});

test('default parser windows keep long-input request sizes bounded and retain global offsets without duplicates', async () => {
  const text = 'John 3:16. ' + 'The discussion continues with ordinary prose. '.repeat(250) + 'Romans 8:28.';
  const parser = await loadParser();
  const original = structuredClone(parser.parse(text).osis_and_indices());
  const searched = [];
  const client = new JevClient({ api_key: 'test-only-key', fetch: async (_url, options) => {
    assert.ok(Buffer.byteLength(options.body) < 1000000);
    const { state, questions } = JSON.parse(options.body);
    for (const local of state.tasks ? Object.values(state.tasks) : [state]) if (local.search_tokens) searched.push(local.window_text ?? state.window_text);
    const answers = Object.fromEntries(Object.entries(questions).map(([id, question]) => {
      const task = id.match(/^(task_\d+)_/)?.[1];
      const local = { ...state, ...(task ? state.tasks[task] : {}) };
      const field = id.replace(/^task_\d+_/, '');
      const selected = local.bcv_proposals ? 'ACCEPT' : field.startsWith('starts_at_') ? 'NOT_START' : field === 'start' ? Object.keys(question.criteria)[0] : 'NO_MORE_REFERENCES';
      return [id, { type: 'choice', choice: selected, confidence: 1,
        probabilities: Object.fromEntries(Object.keys(question.criteria).map(k => [k, k === selected ? 1 : 0])) }];
    }));
    return new Response(JSON.stringify({ answers, usage: { cost: 0 } }));
  } });
  const instance = new FuzzyReferenceParser({ parser, decisions: client });
  assert.equal(instance.window_strategy, 'auto');
  const result = await instance.parse(text);
  assert.ok(searched.length > 1);
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.references, original);
  for (const entry of result.references) assert.equal(text.slice(...entry.indices), entry.osis.startsWith('John') ? 'John 3:16' : 'Romans 8:28');
});

test('a short citation fixture crosses small windows while retaining global offsets and discourse', async () => {
  const { readFile } = await import('node:fs/promises');
  const { run } = await import('./support/window-client.js');
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/detection-cases.json', import.meta.url)));
  const fixture = fixtures.find(row => row.id === 107);
  const parser = await loadParser();
  const proposals = parser.parse(fixture.text).osis_and_indices().map(row => row.indices);
  assert.equal(fixture.text.length, 333);
  assert.equal(tokenize(fixture.text).length, 61);
  const expected = [...fixture.expected_explicit, ...fixture.expected].map(({ osis, indices }) => ({ osis, indices }));
  for (const window_tokens of [8, 12, 50]) {
    const windows = proseWindows(fixture.text, 'auto', proposals, window_tokens);
    assert.ok(windows.length > 1);
    if (window_tokens === 50) assert.deepEqual(windows.map(window => window.tokens.length), [42, 19]);
    assert.ok(windows[0].start <= fixture.expected_explicit[0].indices[0]);
    assert.ok(windows.at(-1).start <= fixture.expected[0].indices[0]);
    const { result, calls } = await run(fixture, { parserOptions: { window_strategy: 'auto', window_tokens } });
    if (window_tokens === 50) assert.equal(calls.length, 8);
    assert.deepEqual(result.references.map(({ osis, indices }) => ({ osis, indices })), expected);
    assert.equal(result.state.current_reference, 'John.3.17');
    const classification = calls.find(call => call.fields.includes('classification'));
    assert.equal(classification.state.discourse.current_reference, 'John 3:16');
    assert.equal(classification.state.recent_bcv_matches[0].reference, 'John 3:16');
    for (const row of result.references) assert.ok(fixture.text.slice(...row.indices).length);
  }
});

test('neighboring window context is source text rather than space-joined tokens', async () => {
  const { neighborText } = await import('../text.js');
  const text = 'John 3:16 is quoted. ' + 'Ordinary prose continues here. '.repeat(4) + 'Compare verse 17.';
  const windows = proseWindows(text, 'auto', [[0, 9]], 8);
  assert.ok(windows.length > 2);
  assert.equal(neighborText(windows[0], 'end'), windows[0].text);
  assert.equal(neighborText(windows[1], 'start', 2), windows[1].text.slice(0, windows[1].tokens[1].end - windows[1].start));
  assert.equal(neighborText(undefined, 'end'), '');
  const { run } = await import('./support/window-client.js');
  const start = text.indexOf('verse 17');
  const { calls } = await run({ text, context: {}, expected: [{ span: 'verse 17', indices: [start, start + 8],
    osis: 'John.3.17', reference_kind: 'numeric' }] }, { parserOptions: { window_tokens: 8 } });
  const contexts = calls.flatMap(call => [call.state, ...Object.values(call.state.tasks ?? {})])
    .flatMap(state => [state.preceding_context, state.following_context]).filter(Boolean);
  assert.ok(contexts.some(context => context.includes('John 3:16 is quoted.')));
  assert.ok(contexts.every(context => !context.includes('3 : 16')));
});

// parentheses

test('citation offsets exclude enclosing parentheses and preserve internal or separate parentheses', () => {
  for (const [source, expected] of [['(7)', '7'], ['(2:5)', '2:5'], ['（VIII:XXVIII）', 'VIII:XXVIII'],
    ['(( 7 ))', '7'], ['😀 (7)', '😀 (7)'], ['(7), (8)', '(7), (8)'], ['(7', '(7'], ['()', '()'], ['', '']]) {
    const indices = citationIndices(source, [0, source.length]);
    assert.equal(source.slice(...indices), expected);
  }
  assert.deepEqual(citationIndices('😀 (7)', [3, 6]), [4, 5]);
});

test('Hebrew-numbering fixture preserves the exact source and distinguishes default-valid and alternate addresses', async () => {
  const fixtures = JSON.parse(await readFile(new URL('./fixtures/parenthesis-cases.json', import.meta.url)));
  const fixture = fixtures.find(f => f.id === 89);
  assert.equal(fixture.text, '9:1 (8:23 in Hebrew)');
  for (const row of fixture.expected) assert.equal(fixture.text.slice(...row.indices), row.span);
  const parser = await loadParser();
  assert.equal(parser.parse('Isaiah 9:1').osis(), 'Isa.9.1');
  assert.notEqual(parser.parse('Isaiah 8:23').osis(), 'Isa.8.23');
});

test('bare chapter/verse gold allows abstention or guesses but rejects an unsupported exact book', async () => {
  const { scoreCase } = await import('./support/evaluation.js');
  const fixture = JSON.parse(await readFile(new URL('./fixtures/parenthesis-cases.json', import.meta.url))).find(f => f.id === 90);
  const score = fuzzy => scoreCase(fixture, { text: fixture.text, status: 'complete', fuzzy }, { resolution_scope: 'numeric' });
  assert.equal(score([]).passed, true);
  assert.equal(score([{ span: '1:1', indices: [0,3], status: 'ambiguous', interpretations: [
    {reference: 'Gen.1.1', probability: 0.3}, {reference: 'John.1.1', probability: 0.2}
  ] }]).passed, true);
  assert.equal(score([{ span: '1:1', indices: [0,3], status: 'resolved', canonical: 'Gen.1.1' }]).passed, false);
});

test('inherited parenthetical list with cf. verse freezes the approved source and requires Jev interpretation', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/parenthesis-cases.json', import.meta.url))).find(f => f.id === 91);
  assert.equal(fixture.text, 'John 3:16 introduces God’s love for the world. The next few verses develop the point (17, 18, 19; cf. v. 21).');
  assert.deepEqual(fixture.context, {});
  const parser = await loadParser();
  assert.deepEqual(parser.parse(fixture.text).osis_and_indices().map(({osis,indices})=>({osis,indices})),
    [{osis:'John.3.16',indices:[0,9]}]);
  for (const row of [...fixture.expected, ...fixture.expected_explicit]) assert.equal(fixture.text.slice(...row.indices), row.span);
  const numeric = fixture.expected.filter(row => row.reference_kind === 'numeric');
  assert.deepEqual(numeric.map(row=>row.indices), [[86,96],[102,107]]);
  assert.deepEqual(numeric.map(row=>row.osis), ['John.3.17,John.3.18,John.3.19','John.3.21']);
  const { scoreCase } = await import('./support/evaluation.js');
  const result = {text:fixture.text,status:'complete',references:[{osis:'John.3.16',indices:[0,9]}],
    fuzzy:numeric.map(row=>({span:row.span,indices:row.indices,status:'resolved',canonical:row.osis}))};
  const syncReferences = () => { result.references = [{osis:'John.3.16',indices:[0,9]},
    ...result.fuzzy.map(row=>({osis:row.canonical,indices:row.indices,parser:'ai'}))]; };
  syncReferences();
  assert.equal(scoreCase(fixture,result,{resolution_scope:'numeric'}).passed,true);
  result.fuzzy[0].canonical='John.3.17-John.3.19';
  syncReferences();
  assert.equal(scoreCase(fixture,result,{resolution_scope:'numeric'}).passed,true,'equivalent contiguous range is accepted');
  result.fuzzy[0].canonical='John.3.17-John.3.21';
  syncReferences();
  assert.equal(scoreCase(fixture,result,{resolution_scope:'numeric'}).passed,false,'do not fill in unrequested verse 20');
});

test('a discovered span that includes enclosing parentheses is normalized before output', async () => {
  const { run } = await import('./support/window-client.js');
  const text = 'John 3:16 matters. Also see (17) here.';
  const start = text.indexOf('(17)');
  const { result } = await run({ text, context: {}, expected: [{ span: '(17)', indices: [start, start + 4],
    osis: 'John.3.17', reference_kind: 'numeric' }] });
  const ai = result.osis_and_indices().find(r => r.parser === 'ai');
  assert.equal(ai.osis, 'John.3.17');
  assert.equal(text.slice(...ai.indices), '17');
  const record = result.parsed_entities().find(e => e.parser === 'ai');
  assert.deepEqual(record.indices, ai.indices);
  assert.equal(record.ai.token_indices[0], record.ai.token_indices[1]);
});

test('sentence cut points follow Unicode boundaries in the parser language, not a punctuation list', async () => {
  assert.deepEqual(sentences('यह पहला वाक्य है। यह दूसरा है।', [], 'hin').map(s => s.text), ['यह पहला वाक्य है। ', 'यह दूसरा है।']);
  assert.deepEqual(sentences('هل قرأت؟ نعم. انتهى', [], 'ara').map(s => s.text), ['هل قرأت؟ ', 'نعم. ', 'انتهى']);
  assert.deepEqual(sentences('創世記について話します。第2章を読んでください！次に進みます', [], 'jpn').map(s => s.text), ['創世記について話します。', '第2章を読んでください！', '次に進みます']);
  // Offsets stay exact and a protected BCV span is never cut, whatever the locale.
  const text = 'Compare 1 Cor. 13:1. Closing remarks.';
  const windows = proseWindows(text, 'auto', [[8, 19]], 1, 'eng');
  assert.throws(() => proseWindows(text, 'paragraph'), /Unknown window strategy/);
  // Whitespace between a sentence break and a paragraph break never becomes a token-less window.
  const broken = proseWindows('😀 Read verse 4.\n\nCompare verse 6.', 'auto', [], 1);
  assert.deepEqual(broken.map(w => [w.start, w.end, w.tokens.length]), [[0, 18, 5], [18, 34, 4]]);
  assert.deepEqual(proseWindows('  \n\nOnly here.  ', 'auto', [], 1).map(w => [w.start, w.end, w.tokens.length]), [[0, 16, 3]]);
  assert.deepEqual(windows.map(w => [w.text, w.start, w.end]), [['Compare 1 Cor. 13:1. ', 0, 21], ['Closing remarks.', 21, 37]]);
  const parser = await loadParser({ language_module: 'ja' });
  assert.deepEqual(parser.regexps.languages, ['jpn']);
});

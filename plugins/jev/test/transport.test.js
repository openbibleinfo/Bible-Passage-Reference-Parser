// The Jev client and question batching (src/decisions.js, src/batching.js).
import assert from 'node:assert/strict';
import test from 'node:test';
import { batchedQuestions } from '../batching.js';
import { JevClient, choice } from '../decisions.js';

// client config

const questions = { target: choice('Choose', { yes: 'Yes', no: 'No' }) };
const result = { answers: { target: { type: 'choice', choice: 'yes', confidence: 1, probabilities: { yes: 1, no: 0 } } }, usage: { input_tokens: 123, output_tokens: 20 } };

test('a custom Decisions endpoint and model use the supplied provider Bearer key', async () => {
  const client = new JevClient({ endpoint: 'https://api.typesafe.ai/v1/systemone', model: 'jev-latest', api_key: 'DIRECT_TEST_KEY',
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.typesafe.ai/v1/systemone');
      assert.equal(options.headers.Authorization, 'Bearer DIRECT_TEST_KEY');
      assert.equal(JSON.parse(options.body).model, 'jev-latest');
      return new Response(JSON.stringify(result));
    } });
  assert.equal((await client.decide({ window_text: 'Read verse 6.' }, questions)).target.choice, 'yes');
  assert.equal(Object.hasOwn(client, 'receipts'), false);
});

test('invalid endpoint/model/transport settings fail before any dispatch', () => {
  for (const config of [{ endpoint: '/relative' }, { endpoint: 'file:///tmp/test' },
    { endpoint: 'https://name:password@example.com/decisions' }, { model: '' }, { timeout_ms: 0 },
    { fetch: null }]) {
    assert.throws(() => new JevClient({ api_key: 'TEST_KEY', ...config }));
  }
});

test('Jev resolves forced choices locally and omits them from mixed requests', async () => {
  let calls = 0;
  const client = new JevClient({ api_key: 'TEST_KEY', fetch: async (_url, options) => {
    calls++;
    assert.deepEqual(Object.keys(JSON.parse(options.body).questions), ['target']);
    return new Response(JSON.stringify(result));
  } });
  const only = choice('Forced token boundary', { token_8: '8' });
  assert.equal((await client.decide({}, { only })).only.determined_by, 'single_allowed_choice');
  assert.equal(calls, 0);
  const answers = await client.decide({}, { before: only, ...questions, after: only });
  assert.equal(calls, 1);
  assert.deepEqual(Object.keys(answers), ['before', 'target', 'after']);
  assert.equal(answers.target.choice, 'yes');
  assert.equal(Object.hasOwn(client, 'receipts'), false);
});

test('production client reuses configuration without receipts, cost requirements, or lifetime limits', async () => {
  let calls = 0;
  const client = new JevClient({ api_key: 'TEST_KEY', fetch: async () => {
    calls++;
    // A compatible provider need not include usage or billing fields.
    return new Response(JSON.stringify({ answers: result.answers }));
  } });
  for (let i = 0; i < 305; i++) assert.equal((await client.decide({ id: i }, questions)).target.choice, 'yes');
  assert.equal(calls, 305);
  for (const field of ['receipts', 'max_requests', 'max_request_bytes', 'on_receipt']) assert.equal(Object.hasOwn(client, field), false);
});

test('omitted credentials follow the configured provider convention with explicit override', async () => {
  const original = { OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY, TYPESAFE_API_KEY: process.env.TYPESAFE_API_KEY };
  try {
    process.env.OPENROUTER_API_KEY = 'OPENROUTER_TEST_KEY';
    process.env.TYPESAFE_API_KEY = 'TYPESAFE_TEST_KEY';
    assert.equal(new JevClient().api_key, 'OPENROUTER_TEST_KEY');
    for (const [endpoint, expected] of [
      ['https://openrouter.ai/api/alpha/decisions', 'OPENROUTER_TEST_KEY'],
      ['https://api.typesafe.ai/v1/systemone', 'TYPESAFE_TEST_KEY']
    ]) {
      const client = new JevClient({ endpoint, fetch: async (_url, options) => {
        assert.equal(options.headers.Authorization, `Bearer ${expected}`);
        return new Response(JSON.stringify(result));
      } });
      assert.equal((await client.decide({}, questions)).target.choice, 'yes');
      assert.equal(new JevClient({ endpoint, api_key: 'EXPLICIT_TEST_KEY' }).api_key, 'EXPLICIT_TEST_KEY');
    }
    assert.throws(() => new JevClient({ api_key: '' }), /OPENROUTER_API_KEY/);
    delete process.env.OPENROUTER_API_KEY;
    assert.throws(() => new JevClient(), /Set OPENROUTER_API_KEY/);
    process.env.OPENROUTER_API_KEY = 'OPENROUTER_TEST_KEY';
    delete process.env.TYPESAFE_API_KEY;
    assert.throws(() => new JevClient({ endpoint: 'https://api.typesafe.ai/v1/systemone' }), /Set TYPESAFE_API_KEY/);
  } finally {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});


test('omitted models follow the endpoint and explicit models take precedence in requests', async () => {
  for (const [endpoint, model, expected] of [
    ['https://openrouter.ai/api/alpha/decisions', undefined, '~typesafe/jev-latest'],
    ['https://api.typesafe.ai/v1/systemone', undefined, 'jev-latest'],
    ['https://api.typesafe.ai/v1/systemone', 'jev-1.13.0', 'jev-1.13.0'],
    ['https://openrouter.ai/api/alpha/decisions', 'typesafe/jev-1.14', 'typesafe/jev-1.14'],
    ['https://openrouter.ai/api/alpha/decisions', 'typesafe/jev-1.13', 'typesafe/jev-1.13'],
    ['https://provider.example/decisions', 'custom-model', 'custom-model'],
    ['https://api.typesafe.ai.example/decisions', undefined, '~typesafe/jev-latest']
  ]) {
    const client = new JevClient({ endpoint, model, api_key: 'TEST_KEY', fetch: async (url, options) => {
      assert.equal(url, endpoint);
      assert.equal(JSON.parse(options.body).model, expected);
      return new Response(JSON.stringify(result));
    } });
    assert.equal(client.model, expected);
    assert.equal((await client.decide({}, questions)).target.choice, 'yes');
  }
});

test('incomplete, invalid, or failed responses reject without retry and scrub the key', async () => {
  const valid = result.answers.target;
  for (const [body, status, message] of [
    [{ answers: {} }, 200, /Incomplete Decisions response/],
    [{ answers: { target: { ...valid, choice: 'maybe' } } }, 200, /Invalid choice for target/],
    [{ answers: { target: { ...valid, probabilities: { yes: 0.9, no: 0.9 } } } }, 200, /Invalid probability distribution for target/],
    [{ answers: { target: { ...valid, confidence: 2 } } }, 200, /Invalid probability distribution for target/],
    [{ error: 'denied SECRET_KEY' }, 403, /Jev HTTP 403/]
  ]) {
    let requests = 0;
    const client = new JevClient({ api_key: 'SECRET_KEY', fetch: async () => { requests++; return new Response(JSON.stringify(body), { status }); } });
    await assert.rejects(client.decide({}, questions), error => message.test(error.message) && !error.message.includes('SECRET_KEY'));
    assert.equal(requests, 1);
  }
});

// batching

const question = choice('Select the value for this task.', { A: 'A', B: 'B' });

test('independent workers share each HTTP frontier and keep task evidence isolated', async () => {
  const calls = [];
  const results = await batchedQuestions(['A', 'B', 'A'].map(value => async (ask, askMany) => {
    const first = await ask('first', { window_text: 'shared prose', span: value }, question);
    const second = await askMany({ window_text: 'shared prose', span: value, first }, { second: question, third: question });
    return second.second;
  }), async (state, questions) => {
    calls.push({ state, questions });
    return Object.fromEntries(Object.keys(questions).map(name => {
      const task = name.match(/^task_\d+/)[0];
      assert.ok(questions[name].instructions.includes(`tasks.${task}`));
      return [name, state.tasks[task].span];
    }));
  });
  assert.deepEqual(results, ['A', 'B', 'A']);
  assert.deepEqual(calls.map(call => Object.keys(call.questions).length), [3, 6]);
  assert.equal(calls[0].state.window_text, 'shared prose');
  assert.ok(!Object.hasOwn(calls[0].state.tasks.task_0, 'window_text'));
});

test('hard dependencies wait without blocking unrelated work, and ready stages mix in one body', async () => {
  const calls = [];
  let complete;
  const done = new Promise(resolve => { complete = resolve; });
  await batchedQuestions([
    async ask => { await ask('first', { span: 'A' }, question); await ask('second', { span: 'A' }, question); complete(); },
    async ask => { await ask('gate', { span: 'B' }, question); await done; await ask('dependent', { span: 'B' }, question); },
    async ask => { await ask('first', { span: 'C' }, question); await ask('second', { span: 'C' }, question); await ask('third', { span: 'C' }, question); }
  ], async (_state, questions) => {
    calls.push(Object.keys(questions));
    return Object.fromEntries(Object.keys(questions).map(name => [name, 'A']));
  });
  assert.deepEqual(calls.map(call => call.length), [3, 2, 2]);
  assert.ok(calls[2].some(name => name.endsWith('_dependent')));
  assert.ok(calls[2].some(name => name.endsWith('_third')));
});

test('a failed batch rejects every waiting worker without retry or another dispatch', async () => {
  let calls = 0;
  await assert.rejects(batchedQuestions([1, 2, 3].map(() => async ask => {
    await ask('first', {}, question);
    await ask('never', {}, question);
  }), async () => { calls++; throw new Error('HTTP 503'); }), /HTTP 503/);
  assert.equal(calls, 1);
});

test('a worker error stops undispatched questions without leaving the scheduler hung', async () => {
  let calls = 0;
  await assert.rejects(batchedQuestions([
    async () => { throw new Error('Invalid worker data'); },
    async ask => { await ask('never', {}, question); }
  ], async () => { calls++; return {}; }), /Invalid worker data/);
  assert.equal(calls, 0);
});

test('an empty question set resolves locally, and questions after a failure reject without dispatch', async () => {
  let dispatches = 0;
  const seen = [];
  await assert.rejects(batchedQuestions([
    async (_ask, askMany) => { seen.push(await askMany({}, {})); await askMany({}, { a: choice('A', { x: 'x', y: 'y' }) }); },
    async (_ask, askMany) => { await new Promise(resolve => setTimeout(resolve, 5)); await askMany({}, { b: choice('B', { x: 'x', y: 'y' }) }).catch(error => { seen.push(error.message); throw error; }); }
  ], async () => { dispatches++; throw new Error('provider down'); }), /provider down/);
  assert.deepEqual(seen, [{}, 'provider down']);
  assert.equal(dispatches, 1);
});

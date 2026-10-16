export const MODEL = '~typesafe/jev-latest';
export const ENDPOINT = 'https://openrouter.ai/api/alpha/decisions';

export function choice(instructions, criteria) {
  return { type: 'choice', instructions, criteria };
}

export function validateAnswers(questions, response) {
  if (!response?.answers || Object.keys(response.answers).length !== Object.keys(questions).length) {
    throw new Error('Incomplete Decisions response');
  }
  for (const [id, question] of Object.entries(questions)) {
    const answer = response.answers[id];
    if (answer?.type !== 'choice' || !Object.hasOwn(question.criteria, answer.choice)) {
      throw new Error(`Invalid choice for ${id}`);
    }
    const probabilities = answer.probabilities;
    if (!probabilities || Object.keys(probabilities).length !== Object.keys(question.criteria).length ||
        Object.keys(question.criteria).some(k => !Number.isFinite(probabilities[k]) || probabilities[k] < 0 || probabilities[k] > 1) ||
        !Number.isFinite(answer.confidence) || answer.confidence < 0 || answer.confidence > 1 ||
        Math.abs(Object.values(probabilities).reduce((a, b) => a + b, 0) - 1) > 0.02) {
      throw new Error(`Invalid probability distribution for ${id}`);
    }
  }
  return response.answers;
}

// One HTTP call for the supplied remote questions; no implicit retries.
// Experiment accounting and logging live outside this production transport.
export class JevClient {
  constructor({ api_key, endpoint = ENDPOINT, model, fetch = globalThis.fetch, timeout_ms = 60000 } = {}) {
    let url;
    try { url = new URL(endpoint); } catch { throw new Error('endpoint must be an absolute HTTP(S) URL'); }
    if (typeof endpoint !== 'string' || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('endpoint must be an absolute HTTP(S) URL without embedded credentials');
    if (model === undefined) model = url.hostname === 'api.typesafe.ai' ? 'jev-latest' : MODEL;
    const key_env = url.hostname === 'openrouter.ai' ? 'OPENROUTER_API_KEY' : 'TYPESAFE_API_KEY';
    if (api_key === undefined) api_key = process.env[key_env];
    if (typeof api_key !== 'string' || !api_key.trim()) throw new Error(`Set ${key_env} or pass api_key`);
    if (typeof model !== 'string' || !model.trim()) throw new Error('model must be a nonempty string');
    if (!Number.isInteger(timeout_ms) || timeout_ms < 1 || typeof fetch !== 'function') throw new Error('Invalid client configuration');
    Object.assign(this, { api_key: api_key.trim(), endpoint: url.toString(), model: model.trim(), fetch, timeout_ms });
  }

  wireRequest(request) { return request; }
  responseAnswers(questions, result) { return validateAnswers(questions, result); }

  async decide(state, questions) {
    const remote = {}, local = {};
    for (const [name, q] of Object.entries(questions)) {
      if (q.type !== 'choice') throw new Error(`Unsupported question type: ${name}`);
      const options = Object.keys(q.criteria);
      if (!options.length) throw new Error(`Empty choice: ${name}`);
      if (options.length === 1) {
        // Forced by the option set, not scored by either model. No dummy option.
        local[name] = { type: 'choice', choice: options[0], confidence: 1,
          probabilities: { [options[0]]: 1 }, determined_by: 'single_allowed_choice' };
      } else remote[name] = q;
    }
    const answers = Object.keys(remote).length ? await this.dispatch(state, remote) : {};
    const ordered = Object.fromEntries(Object.keys(questions).map(name => [name, local[name] ?? answers[name]]));
    return validateAnswers(questions, { answers: ordered });
  }

  async dispatch(state, questions, { fetch = this.fetch } = {}) {
    const body = JSON.stringify(this.wireRequest({ model: this.model, state, questions }));
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST', headers: { Authorization: `Bearer ${this.api_key}`, 'Content-Type': 'application/json' },
        body, signal: AbortSignal.timeout(this.timeout_ms)
      });
      const raw = (await response.text()).replaceAll(this.api_key, '[REDACTED]');
      if (!response.ok) throw new Error(`${this.provider === 'openai' ? 'OpenAI' : 'Jev'} HTTP ${response.status}`);
      return this.responseAnswers(questions, JSON.parse(raw));
    } catch (error) {
      throw new Error(String(error.message).replaceAll(this.api_key, '[REDACTED]'), { cause: error });
    }
  }
}

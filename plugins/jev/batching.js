// Run independent resolution workers through ONE HTTP request per ready frontier.
// Workers keep their conditional logic; only their question transport is pooled.
export async function batchedQuestions(workers, dispatch) {
  let pending = [], scheduled = false, inFlight = false, failure;
  const schedule = () => {
    if (scheduled || inFlight || failure || !pending.length) return;
    scheduled = true;
    setImmediate(flush);
  };
  const flush = async () => {
    scheduled = false;
    if (failure || !pending.length) return;
    inFlight = true;
    const batch = pending;
    pending = [];
    try {
      // Factor identical context out of task-local evidence. Every question names
      // its task; local fields override common fields, never another task's fields.
      const common = {};
      for (const [key, value] of Object.entries(batch[0].evidence)) {
        if (batch.every(task => Object.hasOwn(task.evidence, key) &&
          JSON.stringify(task.evidence[key]) === JSON.stringify(value))) common[key] = value;
      }
      const tasks = {}, questions = {};
      for (const [i, task] of batch.entries()) {
        const id = `task_${i}`;
        tasks[id] = Object.fromEntries(Object.entries(task.evidence).filter(([key]) => !Object.hasOwn(common, key)));
        for (const [field, question] of Object.entries(task.questions)) {
          questions[`${id}_${field}`] = { ...question,
            instructions: `For ${id} ONLY, use common evidence plus tasks.${id} (local fields override common fields). Other tasks are separate questions, not additional evidence for this target. ${question.instructions}` };
        }
      }
      // Keep single-worker calls in their original shape for simpler diagnostics.
      const answers = batch.length === 1
        ? await dispatch(batch[0].evidence, batch[0].questions)
        : await dispatch({ ...common, tasks }, questions);
      for (const [i, task] of batch.entries()) {
        task.resolve(batch.length === 1 ? answers : Object.fromEntries(Object.keys(task.questions)
          .map(field => [field, answers[`task_${i}_${field}`]])));
      }
    } catch (error) {
      failure = error;
      for (const task of [...batch, ...pending]) task.reject(error);
      pending = [];
    } finally {
      inFlight = false;
      schedule();
    }
  };
  const results = await Promise.allSettled(workers.map(worker => {
    const askMany = (evidence, questions) => {
      if (failure) return Promise.reject(failure);
      if (!Object.keys(questions).length) return Promise.resolve({});
      return new Promise((resolve, reject) => {
        pending.push({ evidence, questions, resolve, reject });
        schedule();
      });
    };
    const ask = async (id, evidence, question) => (await askMany(evidence, { [id]: question }))[id];
    return Promise.resolve().then(() => worker(ask, askMany)).catch(error => {
      failure ??= error;
      for (const task of pending) task.reject(failure);
      pending = [];
      throw error;
    });
  }));
  const rejected = results.find(result => result.status === 'rejected');
  if (rejected) throw rejected.reason;
  return results.map(result => result.value);
}

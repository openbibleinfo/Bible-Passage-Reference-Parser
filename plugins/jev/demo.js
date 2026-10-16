import { pathToFileURL } from 'node:url';
import { FuzzyReferenceParser, JevClient } from './index.js';
import { loadParser } from './test/support/parser.js';

export const text = 'John 3:16 is a popular verse, but you should keep reading through 17.';

export async function demo({ parser, decisions } = {}) {
  const resolver = new FuzzyReferenceParser({
    parser: parser ?? await loadParser(),
    decisions: decisions ?? new JevClient({
      ...(process.env.JEV_ENDPOINT ? { endpoint: process.env.JEV_ENDPOINT } : {}),
      ...(process.env.JEV_MODEL ? { model: process.env.JEV_MODEL } : {})
    })
  });
  return resolver.parse(text);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await demo();
    console.log(JSON.stringify(result.osis_and_indices(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

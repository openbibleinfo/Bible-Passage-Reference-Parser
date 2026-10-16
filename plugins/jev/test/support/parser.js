import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Use the containing parser checkout after copying into plugins/jev, otherwise
// the installed bible-passage-reference-parser package.
export async function loadParser({ partial_verses = false, language_module = 'en' } = {}) {
  let root = null;
  let directory = dirname(fileURLToPath(import.meta.url));
  while (true) {
    try {
      await access(join(directory, 'esm/bcv_parser.js'));
      await access(join(directory, 'esm/lang/en.js'));
      root = directory;
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  const { bcv_parser: Parser } = await import(root
    ? pathToFileURL(join(root, 'esm/bcv_parser.js')).href
    : 'bible-passage-reference-parser');
  const language = await import(root
    ? pathToFileURL(join(root, `esm/lang/${language_module}.js`)).href
    : `bible-passage-reference-parser/esm/lang/${language_module}.js`);
  const parser = new Parser(language);
  parser.set_options({ osis_compaction_strategy: partial_verses ? 'bcp' : 'bc',
    sequence_combination_strategy: 'separate', book_alone_strategy: 'ignore' });
  return parser;
}

import { referenceText } from './hierarchy.js';

// Prefer BCV's literal labels; otherwise map Jev's subdivision of one verse.
// Only enrich the target already selected by Jev.
export function preserveVerseParts(entry, parser) {
  if (!['bp', 'bcp', 'bcvp'].includes(parser.options?.osis_compaction_strategy) ||
      entry.status !== 'resolved') return;
  const original = entry.canonical;
  let reference = parser.parse_with_context?.(entry.span, referenceText(original))
    .osis_and_indices().map(r => r.osis).join(',') ?? '';
  const whole = reference.split(',').map(member => member.split('-')
    .map(endpoint => endpoint.split('!')[0]).join('-')).join(',');
  if (!reference.includes('!') || whole !== original) {
    const letter = { first_part: 'a', second_part: 'b' }[entry.subdivision];
    // A range/list-level subdivision does not identify which verse to suffix.
    if (!letter || !/^[1-4]?[A-Za-z]+\.\d+\.\d+$/.test(original)) return;
    reference = `${original}!${letter}`;
  }
  entry.canonical = reference;
  for (const interpretation of entry.interpretations ?? []) {
    if (interpretation.reference === original) interpretation.reference = reference;
  }
}

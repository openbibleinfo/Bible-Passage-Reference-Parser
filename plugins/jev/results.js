// The compact API keeps BCV's array and required fields. Internal resolution
// thresholds govern discourse updates, not whether callers can see AI guesses.
export function citationConfidence(entry) {
  return entry.decisions?.classification?.probabilities?.BIBLE_REFERENCE;
}

export function aiReference(entry) {
  if (!['resolved', 'ambiguous'].includes(entry.status)) return null;
  const interpretations = (entry.interpretations ?? []).filter(i => i.probability > 0)
    .toSorted((a, b) => b.probability - a.probability);
  const osis = entry.status === 'resolved' ? entry.canonical : interpretations[0]?.reference;
  if (!osis) return null;
  const primary = interpretations.find(i => i.reference === osis);
  const alternates = interpretations.filter(i => i.reference !== osis)
    .map(({ reference, probability }) => ({ osis: reference, target_confidence: probability }));
  const citation_confidence = citationConfidence(entry);
  return { osis, translations: [...entry.translations], indices: [...entry.indices], parser: 'ai',
    ...(citation_confidence !== undefined ? { citation_confidence } : {}),
    ...(primary ? { target_confidence: primary.probability } : {}),
    ...(alternates.length ? { alternates } : {}) };
}

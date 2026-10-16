// Evaluation projection of public records, not access to parser working state.
// Saved experiments made before parsed_entities() serialization retain `fuzzy`.
function currentEscalation(entry) {
  if (!entry.escalation?.kind || entry.escalation.type) return entry;
  const { kind, ...escalation } = entry.escalation;
  return { ...entry, escalation: { ...escalation, type: kind } };
}

export function expressionDiagnostics(result) {
  const records = typeof result.parsed_entities === 'function' ? result.parsed_entities()
    : result.parsed_entities;
  if (!Array.isArray(records)) return (result.fuzzy ?? []).map(currentEscalation);
  return records.filter(record => record.parser === 'ai' && record.ai.origin === 'input').map(record => {
    const { ai } = record;
    const probabilities = ai.decisions?.interpretation?.probabilities;
    const interpretations = probabilities ? Object.entries(probabilities)
      .filter(([reference, probability]) => reference !== 'UNRESOLVED' && probability > 0)
      .map(([reference, probability]) => ({ reference, probability }))
      : record.osis ? [{ reference: record.osis, probability: record.target_confidence ?? record.probability },
        ...(record.alternates ?? []).map(alternate => ({ reference: alternate.osis, probability: alternate.target_confidence ?? alternate.probability }))] : [];
    return { ...currentEscalation(ai), span: result.text.slice(...record.indices), indices: record.indices,
      translations: record.translations, versification_system: ai.system,
      ...(ai.status === 'resolved' && record.osis ? { canonical: record.osis } : {}), interpretations };
  });
}

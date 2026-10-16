import { parseReference, parserChapters } from './resolver.js';
import { aiReference } from './results.js';

function aiPassages(entry, osis, entityId, parser) {
  if (!osis) return [];
  const chapters = parserChapters(parser, entry.versification_system ?? parser.options?.versification_system ?? 'default');
  const translations = entry.translations.filter(Boolean).map(tag => ({ osis: tag,
    translation: tag.toLowerCase(), system: parser.translation_info(tag.toLowerCase()).alias ?? entry.versification_system ?? 'default' }));
  return osis.split(',').flatMap(member => {
    const parsed = parseReference(member, chapters);
    if (!parsed) return [];
    const point = (value, last) => {
      const c = value.chapter ?? (last ? chapters[value.book].length : 1);
      return { b: value.book, c, v: value.verse ?? (last ? chapters[value.book][c - 1] ?? 999 : 1),
        ...(value.versePart ? { p: value.versePart } : {}) };
    };
    const start = point(parsed.start, false), end = point(parsed.end, true);
    return [{ osis: member, indices: [...entry.indices], translations: [...entry.translations],
      entity_id: entityId, start, end, enclosed_indices: undefined,
      entities: [{ start, end, absolute_indices: [...entry.indices], valid: { valid: true, messages: {} },
        ...(translations.length ? { translations } : {}) }] }];
  });
}

function decision(answer) {
  const { type: _type, ...result } = answer;
  return { ...result, probabilities: Object.fromEntries(Object.entries(answer.probabilities).filter(([, p]) => p > 0)) };
}

function decisionsFor(entry) {
  const decisions = Object.fromEntries(Object.entries(entry.decisions).filter(([stage]) => {
    const match = /^(member_\d+_)?(chapter|verse|end_chapter|end_verse)$/.exec(stage);
    if (!match) return true;
    const scope = entry.decisions[`${match[1] ?? ''}scope`]?.choice ?? entry.scope_choice;
    if (scope === 'book') return false;
    if (scope === 'chapter') return match[2] === 'chapter';
    if (scope === 'chapter_range') return ['chapter', 'end_chapter'].includes(match[2]);
    if (scope === 'verse') return !match[2].startsWith('end_');
    return true;
  }).map(([stage, answer]) => [stage, decision(answer)]));
  if (decisions.interpretation && entry.interpretations) {
    const final = decisions.interpretation;
    const interpretations = entry.interpretations.filter(i => i.probability > 0).toSorted((a,b) => b.probability - a.probability);
    final.choice = final.choice === 'UNRESOLVED' ? final.choice : entry.canonical ?? interpretations[0]?.reference ?? final.choice;
    final.probabilities = Object.fromEntries(interpretations.map(({ reference, probability }) => [reference, probability]));
    const unresolved = entry.decisions.interpretation.probabilities.UNRESOLVED;
    if (unresolved > 0) final.probabilities.UNRESOLVED = unresolved;
  }
  return decisions;
}

// This is the extension's view. Original BCV objects are cloned and extended;
// neither BCV's implementation nor its syntactic `type` fields are changed.
export function parsedEntities({ bcvMatches, contextMatches, fuzzy, parser }) {
  const mechanical = (matches, origin) => matches.flatMap(match => {
    const records = match.bcv_entities.length ? match.bcv_entities : [{
      osis: match.osis, indices: match.indices, translations: match.translations, entities: []
    }];
    return records.map(record => ({ ...record, ai: { origin, proposal_id: match.id,
      ...(match.review ? { review: decision(match.review) } : { review_status: match.review_status }) } }));
  });
  const input = mechanical(bcvMatches, 'input');
  const context = mechanical(contextMatches, 'context');
  let entityId = Math.max(-1, ...[...input, ...context].map(r => r.entity_id ?? -1)) + 1;
  const interpreted = fuzzy.map(entry => {
    const { span: _span, canonical: _canonical, translations: _translations, indices: _indices,
      source: _source, versification_system: system, book_probabilities: _book,
      classification: _classification, scope_choice: _scope,
      interpretations: _interpretations, unresolved_probability: _unresolved,
      decisions: _decisions, anchor, ...diagnostics } = entry;
    const compact = aiReference(entry);
    const osis = compact?.osis ?? '';
    const passages = aiPassages(entry, osis, entityId, parser);
    const record = { ...(passages.length === 1 ? passages[0] : { entities: passages }),
      osis, indices: [...entry.indices], translations: [...entry.translations], entity_id: entityId++, parser: 'ai',
      ...(entry.decisions.classification ? { citation_confidence: entry.decisions.classification.probabilities.BIBLE_REFERENCE } : {}),
      ...(compact?.target_confidence !== undefined ? { target_confidence: compact.target_confidence } : {}),
      ...(compact?.alternates ? { alternates: compact.alternates } : {}),
      ai: { origin: 'input', ...diagnostics, decisions: decisionsFor(entry),
        ...(anchor ? { anchor } : {}), ...(system ? { system } : {}) } };
    return record;
  });
  return structuredClone([...input, ...interpreted].sort((a, b) => a.indices[0] - b.indices[0]).concat(context));
}

import { overlaps } from './text.js';
import { parseReference, parserChapters } from './resolver.js';
import { choice } from './decisions.js';

// BCV supplies recognition patterns for the configured language and custom tags.
// Collect labels only; Jev decides which citation, if any, a label belongs to.
export function translationLabelSpans(parser, text, matches = []) {
  const patterns = parser.regexps?.translations;
  const labels = [];
  for (const pattern of patterns ?? []) {
    const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    for (const match of text.matchAll(regex)) if (match[0]) {
      labels.push({ label: match[0], indices: [match.index, match.index + match[0].length] });
    }
  }
  // Minimal parser adapters may expose translation metadata without patterns.
  if (!patterns) for (const match of matches) for (const label of match.translations.filter(Boolean)) {
    const source = text.slice(...match.indices).toLowerCase();
    let offset = source.indexOf(label.toLowerCase());
    // A metadata-only adapter can expose a canonical identifier rather than
    // the written alias; its proposal is the only available source extent.
    if (offset < 0) labels.push({ label, indices: [...match.indices] });
    while (offset >= 0) {
      const start = match.indices[0] + offset;
      labels.push({ label, indices: [start, start + label.length] });
      offset = source.indexOf(label.toLowerCase(), offset + label.length);
    }
  }
  return labels;
}

export function translationLabels(parser, text, matches = []) {
  return [...new Set(translationLabelSpans(parser, text, matches).map(match => match.label))];
}

export function translationQuestion(labels) {
  return choice('Which explicitly written Bible translation/version abbreviation belongs to this target expression? Inspect span, preceding_context and following_context for a label explicitly governing this expression. A label may precede the expression in the same instruction or clause (for example, “In the NLT, read verse 18” or “Use the NIV for verse 6”), follow it as a parenthetical or bare label, or be joined to it by prose such as “as rendered in the New Living Translation (NLT)”. Proximity or position alone does not establish ownership. A label can be inside the discovered span even when its closing parenthesis was omitted. These abbreviations were recognized by the supplied BCV parser, but their presence does not establish ownership. Do not inherit a label that belongs to an earlier or neighboring citation, comes only from background context, or names a version merely discussed in prose. Distinguish an explicit preceding translation instruction for this expression from a translation label attached to a different citation. Choose NONE when this expression has no attached translation label. Choose UNRESOLVED for conflicting/multiple labels, an unsupported label, or unclear ownership.', {
    ...Object.fromEntries(labels.map(label => [label, label])),
    NONE: 'No explicit translation label belongs to this expression',
    UNRESOLVED: 'Translation label or its association is unclear or unsupported'
  });
}

export function applyTranslationAnswer(entry, answer, parser, minimum) {
  entry.decisions.translation = answer;
  if (answer.choice === 'NONE') return;
  const association = { status: 'uncertain', source: 'ai', candidates: [], reason_code: 'ai_translation_uncertain' };
  entry.translation_association = association;
  if (answer.choice === 'UNRESOLVED' || answer.probabilities[answer.choice] < minimum) return;
  // Ask BCV to interpret the selected label on a safe synthetic reference.
  // Only translation metadata is retained; synthetic references/offsets never escape.
  for (const reference of ['John.1.1', 'Gen.1.1', 'Tob.1.1']) {
    const parsed = parser.parse(`${reference} (${answer.choice})`);
    const match = parsed.osis_and_indices().find(m => m.translations.some(Boolean));
    if (!match) continue;
    const systems = systemsFor({ ...match, bcv_entities: structuredClone(parsed.parsed_entities?.() ?? []) }, parser);
    if (systems.length !== 1) continue;
    Object.assign(association, { status: 'matched', translations: [...match.translations], system: systems[0] });
    delete association.reason_code;
    return;
  }
  association.reason_code = 'unsupported_translation';
}

export function bcvProposals(parser, text, origin) {
  const parsed = parser.parse(text);
  const matches = structuredClone(parsed.osis_and_indices());
  const entities = structuredClone(parsed.parsed_entities?.() ?? []);
  return matches.map((match, i) => ({ ...match, id: `${origin}_${i}`, span: text.slice(...match.indices),
    ...(origin === 'input' ? { source: 'explicit' } : {}),
    bcv_entities: entities.filter(e => e.indices?.[0] === match.indices[0] && e.indices?.[1] === match.indices[1]) }));
}

function systemsFor(match, parser) {
  const systems = new Set();
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    for (const translation of value.translations ?? []) {
      if (translation?.system) systems.add(translation.system);
    }
    for (const child of value.entities ?? []) visit(child);
  }
  match.bcv_entities.forEach(visit);
  if (!systems.size) for (const tag of match.translations.filter(Boolean)) {
    systems.add(parser.translation_info(tag.toLowerCase()).alias ?? parser.options?.versification_system ?? 'default');
  }
  return [...systems];
}

export function associateTranslations(entry, matches, parser) {
  const overlapping = matches.filter(m => overlaps(m.indices, entry.indices));
  entry.bcv_proposal_ids = overlapping.filter(m => m.review_status === 'reopened').map(m => m.id);
  const candidates = overlapping.filter(m => m.translations.some(Boolean)).map(m => ({
    proposal_id: m.id, indices: [...m.indices], translations: [...m.translations], systems: systemsFor(m, parser)
  }));
  const association = { status: candidates.length ? 'uncertain' : 'none', candidates };
  if (candidates.length) {
    const match = overlapping[0];
    if (overlapping.length === 1 && match.review_status === 'reopened' &&
        entry.indices[0] >= match.indices[0] && entry.indices[1] <= match.indices[1] && candidates[0].systems.length === 1) {
      association.status = 'matched';
    } else {
      association.reason_code = overlapping.length > 1
        ? 'multiple_proposals'
        : match.review_status !== 'reopened'
          ? 'proposal_not_reopened'
          : entry.indices[0] < match.indices[0] || entry.indices[1] > match.indices[1]
            ? 'expanded_span'
            : 'multiple_versification_systems';
    }
  }
  entry.translation_association = association;
  return association;
}

export function translationChapters(entry, parser, fallback) {
  if (entry.translation_association.status !== 'matched') return fallback;
  const system = entry.translation_association.source === 'ai'
    ? entry.translation_association.system : entry.translation_association.candidates[0].systems[0];
  entry.versification_system = system;
  return parserChapters(parser, system);
}

export function finalizeTranslations(entry, matches, parser) {
  const association = entry.translation_association?.source === 'ai'
    ? entry.translation_association : associateTranslations(entry, matches, parser);
  entry.translations = [''];
  if (association.status !== 'matched') return;
  const candidate = association.source === 'ai' ? association : association.candidates[0];
  const chapters = parserChapters(parser, association.source === 'ai' ? association.system : candidate.systems[0]);
  const targets = [...new Set([...(entry.canonical ? [entry.canonical] : []),
    ...(entry.interpretations ?? []).filter(i => i.probability > 0).map(i => i.reference)])];
  const existence = parser.options?.passage_existence_strategy ?? 'bcv';
  if (targets.some(target => target.split(',').some(member => !parseReference(member, chapters, existence)))) {
    association.status = 'uncertain';
    association.reason_code = 'invalid_target';
    return;
  }
  entry.translations = [...candidate.translations];
}

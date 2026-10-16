import { expressionDiagnostics } from './diagnostics.js';
import { overlaps } from '../../text.js';
import { aiReference } from '../../results.js';

// Only evaluation ignores cosmetic boundaries; inference uses no phrase grammar.
function normalized(span) {
  const words = span.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const cosmetic = new Set(['the', 'a', 'an', 'in', 'at', 'of', 'as', 'verse', 'verses', 'chapter', 'chapters', 'v', 'vv', 'ch', 'chs']);
  while (cosmetic.has(words[0])) words.shift();
  return words.join(' ');
}

function acceptableIndices(text, actual, expected) {
  return Array.isArray(actual) && actual.length === 2 && actual.every(Number.isInteger) &&
    actual[0] >= 0 && actual[1] <= text.length && actual[0] < actual[1] &&
    overlaps(actual, expected) && normalized(text.slice(...actual)) === normalized(text.slice(...expected));
}

function explicitRow(expected, actual) {
  return { reference: expected.osis, indices: expected.indices, found: Boolean(actual),
    ...(expected.translations === undefined ? {} : { translations:
      Array.isArray(actual?.translations) && actual.translations.length === expected.translations.length &&
      [...actual.translations].sort().every((translation, i) => translation === [...expected.translations].sort()[i]) }) };
}

// Judge the API's primary references, rather than internal resolution thresholds.
// Routing remains a contract for cases deliberately deferred from numeric scope.
function scoreConsumer(fixture, result) {
  const strict = scoreOriginal(fixture, result);
  const references = result.references ?? [
    ...(result.explicit ?? []),
    ...expressionDiagnostics(result).map(entry => aiReference({ translations: [''], ...entry })).filter(Boolean)
  ];
  const used = new Set();
  const match = (expected, targets) => {
    const index = references.findIndex((actual, i) => !used.has(i) && targets.includes(actual.osis) &&
      [expected.indices, ...(expected.indices_alternatives ?? [])].some(indices =>
        acceptableIndices(fixture.text, actual.indices, indices)));
    if (index >= 0) { used.add(index); return references[index]; }
    // A coordinated list may be extracted as one object or several. Require
    // the same ordered targets and complete source extent; never fill gaps.
    for (const target of targets.filter(target => target.includes(','))) {
      const members = target.split(',');
      for (const indices of [expected.indices, ...(expected.indices_alternatives ?? [])]) {
        const pieces = references.map((reference, index) => ({ reference, index }))
          .filter(({ reference, index }) => !used.has(index) &&
            Array.isArray(reference.indices) && reference.indices[0] >= indices[0] &&
            reference.indices[1] <= indices[1] && reference.indices[0] < reference.indices[1] &&
            reference.osis.split(',').every(member => members.includes(member)))
          .sort((a, b) => a.reference.indices[0] - b.reference.indices[0]);
        if (pieces.length < 2 || pieces.flatMap(p => p.reference.osis.split(',')).join(',') !== target) continue;
        if (pieces.some((p, i) => i && p.reference.indices[0] < pieces[i - 1].reference.indices[1])) continue;
        const extent = [pieces[0].reference.indices[0], pieces.at(-1).reference.indices[1]];
        if (!acceptableIndices(fixture.text, extent, indices)) continue;
        pieces.forEach(p => used.add(p.index));
        const translations = pieces[0].reference.translations;
        return { osis: target, indices: extent, split_references: pieces.length,
          translations: pieces.every(p => JSON.stringify(p.reference.translations) === JSON.stringify(translations)) ? translations : undefined };
      }
    }
    return undefined;
  };
  const rows = fixture.expected.map((expected, i) => {
    const row = strict.rows[i];
    if (!expected.osis) {
      const routing = expected.needs_semantic_resolution || expected.needs_relative_resolution || expected.allowed_deferred_kinds || expected.semantic_target;
      const guess = expected.status.includes('ambiguous') && expressionDiagnostics(result).find(entry =>
        entry.status === 'ambiguous' && acceptableIndices(fixture.text, entry.indices, expected.indices));
      const primary = guess && aiReference({ translations: [''], ...guess });
      const acceptedGuess = primary && match(expected, [primary.osis]);
      return { ...row, passed: routing ? (row.optional || row.found) && row.status &&
        row.semantic_exact !== false && row.semantic_routing !== false && row.relative_routing !== false && row.deferred_routing !== false :
        Boolean(acceptedGuess) || !references.some(actual => overlaps(actual.indices, expected.indices)) };
    }
    const actual = match(expected, [expected.osis, ...(expected.osis_alternatives ?? [])]);
    const omitted = expected.optional && !references.some(r => overlaps(r.indices, expected.indices));
    const translation = explicitRow(expected, actual);
    return { ...row, ...(actual?.split_references ? { split_references: actual.split_references } : {}), found: Boolean(actual), osis: actual ? true : omitted ? null : false,
      ...(expected.translations === undefined ? {} : { translations: translation.translations }),
      boundaries: actual ? actual.indices[0] === expected.indices[0] && actual.indices[1] === expected.indices[1] : null,
      passed: Boolean(actual || omitted) && (omitted || translation.translations !== false) };
  });
  const explicit_rows = (fixture.expected_explicit ?? []).map(expected =>
    explicitRow(expected, match(expected, [expected.osis])));
  // Fixtures usually specify only fuzzy additions; retained BCV context is allowed.
  const unexpected = references.filter((r, i) => !used.has(i) && !(result.explicit ?? []).some(e =>
    e.osis === r.osis && e.indices[0] === r.indices[0] && e.indices[1] === r.indices[1]));
  return { ...strict, rows, explicit_rows, unexpected, strict_passed: strict.passed,
    passed: (!fixture.expected_no_references || references.length === 0) &&
      unexpected.length === 0 && explicit_rows.every(r => r.found && r.translations !== false) && rows.every(r => r.passed) };
}

// Older saved experiments used "completed"; replay them without new model calls.
function scoreOriginal(fixture, result) {
  if (result.text !== fixture.text) throw new Error(`Test ${fixture.id}: saved result text differs from fixture`);
  const fuzzy = expressionDiagnostics(result);
  const used = new Set();
  const rows = fixture.expected.map(expected => {
    const index = fuzzy.findIndex((actual, i) => !used.has(i) && overlaps(actual.indices, expected.indices) && normalized(actual.span) === normalized(expected.span));
    const actual = fuzzy[index];
    const targets = expected.osis ? [expected.osis, ...(expected.osis_alternatives ?? [])] : [];
    if (index >= 0) used.add(index);
    // A partial reference already handled by BCV is also a successful exact resolution.
    const explicit = !actual && expected.osis ? result.explicit?.find(r => overlaps(r.indices, expected.indices) && targets.includes(r.osis)) : null;
    const found = Boolean(actual || explicit);
    const omittedRejection = !found && expected.optional;
    return { span: expected.span, found, optional: expected.optional ?? false,
      boundaries: actual ? actual.indices[0] === expected.indices[0] && actual.indices[1] === expected.indices[1] : explicit ? true : null,
      status: omittedRejection ? true : actual ? expected.status.includes(actual.status) || (expected.semantic_target && actual.status === 'resolved') : explicit ? true : false,
      anchor: expected.anchor && actual?.anchor !== undefined ? actual.anchor === expected.anchor : null,
      operation: expected.operation && actual?.operation !== undefined ? actual.operation === expected.operation : null,
      osis: expected.osis ? targets.includes(actual?.canonical ?? explicit?.osis) : null,
      subdivision: expected.subdivision ? (actual?.subdivision ?? (actual?.status === 'resolved' || explicit ? 'whole' : undefined)) === expected.subdivision : null,
      semantic_routing: expected.needs_semantic_resolution ? actual?.needs_semantic_resolution === true && actual?.escalation?.type === 'semantic_resolution' : null,
      relative_routing: expected.needs_relative_resolution ? actual?.needs_relative_resolution === true && actual?.escalation?.type === 'relative_resolution' : null,
      deferred_routing: !omittedRejection && expected.allowed_deferred_kinds ? expected.allowed_deferred_kinds.some(kind =>
        actual?.[`needs_${kind}_resolution`] === true && actual?.escalation?.type === `${kind}_resolution`) : null,
      semantic_target: expected.semantic_target ?? null,
      semantic_exact: expected.semantic_target ? (actual?.candidate_region ?? actual?.canonical) === expected.semantic_target : null,
      actual_region: actual?.candidate_region ?? actual?.scope ?? null,
      confidence: actual?.decisions?.classification?.confidence ?? null };
  });
  const unexpected = fuzzy.filter((r, i) => !used.has(i) && r.status !== 'not_a_bible_reference');
  const explicit_rows = (fixture.expected_explicit ?? []).map(expected => explicitRow(expected,
    (result.references ?? []).find(actual => actual.osis === expected.osis &&
      actual.indices[0] === expected.indices[0] && actual.indices[1] === expected.indices[1])));
  return { id: fixture.id, name: fixture.name, pipeline_status: result.status, rows, explicit_rows,
    unexpected: unexpected.map(r => ({ span: r.span, status: r.status, canonical: r.canonical })),
    passed: ['complete', 'completed'].includes(result.status) && (!fixture.expected_no_references || (result.references ?? []).length === 0) && unexpected.length === 0 && explicit_rows.every(r => r.found && r.translations !== false) && rows.every(r =>
      (r.optional || r.found) && r.status && r.anchor !== false && r.operation !== false && r.osis !== false && r.subdivision !== false && r.semantic_exact !== false && r.semantic_routing !== false && r.relative_routing !== false && r.deferred_routing !== false) };
}


// Fixture intent is labeled independently of model output. Broad gold references remain intact.
export function scoreCase(fixture, result, { resolution_scope = 'all' } = {}) {
  if (!['all', 'numeric'].includes(resolution_scope)) throw new Error('Invalid evaluation scope');
  const original = scoreConsumer(fixture, result);
  if (resolution_scope === 'all') return { ...original, resolution_scope: resolution_scope, original_passed: original.passed };
  const expected = fixture.expected.map(row => {
    if (!row.reference_kind) throw new Error('Numeric scoring requires reference_kind fixture labels');
    if (!['relative', 'semantic'].includes(row.reference_kind)) return row;
    if (row.allowed_deferred_kinds) {
      if (!Array.isArray(row.allowed_deferred_kinds) || !row.allowed_deferred_kinds.length ||
          row.allowed_deferred_kinds.some(kind => !['relative', 'semantic'].includes(kind))) throw new Error('Invalid deferred routing alternatives');
      return { span: row.span, indices: row.indices, ...(row.optional === undefined ? {} : { optional: row.optional }), status: ['needs_search'], allowed_deferred_kinds: row.allowed_deferred_kinds };
    }
    return { span: row.span, indices: row.indices, ...(row.optional === undefined ? {} : { optional: row.optional }), status: ['needs_search'],
      [row.reference_kind === 'semantic' ? 'needs_semantic_resolution' : 'needs_relative_resolution']: true };
  });
  return { ...scoreConsumer({ ...fixture, expected }, result), resolution_scope: resolution_scope,
    original_passed: original.passed, original_score: original };
}

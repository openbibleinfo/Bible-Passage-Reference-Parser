import { choice, validateAnswers } from './decisions.js';
import { proseWindows, overlaps, citationIndices, neighborText } from './text.js';
import { parseReference, parserChapters } from './resolver.js';
import { hierarchyQuestions, referenceText } from './hierarchy.js';
import { resolveNumerically, listCountQuestion, listCountEvidence } from './numeric.js';
import { review_boundaries, boundaryPlan, applyBoundary, reviewTarget } from './boundaries.js';
import { reviewPlans } from './review.js';
import { preserveVerseParts } from './partial-verses.js';
import { aiReference } from './results.js';
import { parsedEntities } from './entities.js';
import { bcvProposals, associateTranslations, translationChapters, finalizeTranslations, translationLabelSpans, translationQuestion, applyTranslationAnswer } from './translations.js';
import { resolutionInstructions, classificationPrompt, citationScopePrompt } from './prompts.js';
import { batchedQuestions } from './batching.js';
import { discoverWindow, startQuestions, endQuestions, endState } from './discovery.js';
export { JevClient } from './decisions.js';

// Characters around a citation in which an attached translation label is sought.
const LABEL_DISTANCE = 48;

function displayDiscourse(state) {
  return Object.fromEntries(Object.entries(structuredClone(state)).map(([key, value]) => [key,
    Array.isArray(value) ? value.map(referenceText) : referenceText(value)]));
}

function initialState(context, chapters) {
  const state = { current_reference: null, recent_references: [], active_book: null, active_chapter: null,
    active_passage: null, ...structuredClone(context) };
  if (!Array.isArray(state.recent_references)) throw new Error('recent_references must be an array');
  for (const value of [state.current_reference, state.active_book, state.active_chapter, state.active_passage, ...state.recent_references]) {
    if (value && !parseReference(value, chapters)) throw new Error(`Invalid context reference: ${value}`);
  }
  const reference = state.current_reference ?? state.active_passage;
  if (reference) {
    updateState(state, reference, chapters);
    // A document-level passage is not necessarily a selected verse.
    if (!context.current_reference) state.current_reference = null;
  }
  return state;
}

// Discourse holds structurally valid addresses regardless of versification,
// so returned state can always be passed back as context.
function updateState(state, reference, chapters) {
  if (reference.includes(',')) {
    for (const member of reference.split(',')) updateState(state, member, chapters);
    return;
  }
  const parsed = parseReference(reference, chapters);
  if (!parsed) return;
  state.current_reference = reference;
  state.recent_references = [reference, ...state.recent_references.filter(r => r !== reference)].slice(0, 8);
  state.active_book = parsed.start.book;
  state.active_chapter = parsed.start.chapter && parsed.start.chapter === parsed.end.chapter
    ? `${parsed.start.book}.${parsed.start.chapter}` : null;
  if (parsed.isRange) state.active_passage = reference;
  else if (state.active_passage) {
    const passage = parseReference(state.active_passage, chapters);
    if (!passage || passage.start.book !== parsed.start.book || (parsed.start.chapter &&
        (parsed.start.chapter < passage.start.chapter || parsed.start.chapter > passage.end.chapter))) state.active_passage = null;
  }
}

function discourseFrom(contextReferences, chapters) {
  const state = initialState({}, chapters);
  for (const entry of contextReferences) for (const reference of entry.osis.split(',')) updateState(state, reference, chapters);
  return state;
}

// Evidence shared by every question about one window. Explicit references and
// proposals are the reviewed input matches, or assumed-accepted proposals when
// detection is asked before review completes.
function windowEvidence({ window, windowIndex, windows, state, contextText, contextReferences, explicit, bcvMatches }) {
  const tokens = window.tokens;
  return { window_text: window.text,
    background_context: contextText, discourse: displayDiscourse(state),
    context_references: contextReferences.map(r => ({ reference: referenceText(r.osis), text: r.span })),
    preceding_context: neighborText(windows[windowIndex - 1], 'end'),
    following_context: neighborText(windows[windowIndex + 1], 'start'),
    explicit_references_in_window: explicit.filter(r => overlaps(r.indices, [window.start, window.end])).map(r => ({ reference: referenceText(r.osis), text: r.span,
      token_ids: tokens.filter(t => overlaps([t.start, t.end], r.indices)).map(t => t.id) })),
    bcv_reviewed_proposals: bcvMatches.filter(r => overlaps(r.indices, [window.start, window.end]))
      .map(r => ({ text: r.span, proposed_reference: referenceText(r.osis), review_status: r.review_status })) };
}

function anchorsFor(state, windowReference, explicit, recentExplicit, chapters) {
  const anchors = {};
  function add(id, reference, description) {
    if (reference && parseReference(reference, chapters)) anchors[id] = { reference, description };
  }
  add('window_reference', windowReference, 'Discourse reference at the beginning of this window; useful for parallel relative phrases');
  add('current_reference', state.current_reference, 'Most recently established explicit or resolved fuzzy reference');
  add('most_recent_explicit_reference', explicit, 'Most recent explicit reference preceding this span');
  add('active_chapter', state.active_chapter, 'Active chapter');
  add('active_passage', state.active_passage, 'Document or discourse passage');
  add('active_book', state.active_book, 'Active book');
  state.recent_references.forEach((r, i) => add(`recent_${i}`, r, 'A recent discourse reference; use semantics rather than simple recency'));
  recentExplicit.forEach((match, i) => match.osis.split(',').forEach((r, j) =>
    add(`bcv_recent_${i}_${j}`, r, `Earlier BCV match: ${match.span}`)));
  return anchors;
}

export class FuzzyReferenceParser {
  constructor({ parser, decisions, min_start_probability = 0.08, window_strategy = 'auto', window_tokens = 1000, max_tokens_per_window = 64000, max_spans_per_window = 64, review_bcv_matches = true, min_interpretation_probability = 0.85, min_translation_probability = 0.5, ...removed_options } = {}) {
    for (const name of ['resolution_scope', 'resolution_strategy', 'review_boundaries']) {
      if (Object.hasOwn(removed_options, name)) throw new Error(`${name} is no longer an option; numeric resolution and boundary review are always enabled`);
    }
    if (!parser?.parse || !parser?.translation_info || !decisions?.decide) throw new Error('A BCV parser and decision client are required');
    if (!Number.isFinite(min_start_probability) || min_start_probability < 0 || min_start_probability > 1 || !['auto', 'document'].includes(window_strategy) ||
        !Number.isFinite(min_translation_probability) || min_translation_probability < 0 || min_translation_probability > 1 ||
        !Number.isFinite(min_interpretation_probability) || min_interpretation_probability < 0 || min_interpretation_probability > 1 || typeof review_bcv_matches !== 'boolean' || !Number.isSafeInteger(window_tokens) || window_tokens < 1 || !Number.isSafeInteger(max_tokens_per_window) || max_tokens_per_window < 1 ||
        !Number.isInteger(max_spans_per_window) || max_spans_per_window < 1) throw new Error('Invalid pipeline limits');
    Object.assign(this, { parser, decisions, min_start_probability, window_strategy, window_tokens, max_tokens_per_window, max_spans_per_window, review_bcv_matches, min_interpretation_probability, min_translation_probability });
  }

  async parse(text, { context = {} } = {}) {
    if (typeof text !== 'string') throw new TypeError('text must be a string');
    const chapters = parserChapters(this.parser);
    const existence = this.parser.options?.passage_existence_strategy ?? 'bcv';
    const suppliedContext = typeof context === 'string' ? { text: context } : context;
    if (!suppliedContext || typeof suppliedContext !== 'object' || Array.isArray(suppliedContext)) throw new TypeError('context must be prose or a context object');
    const { text: contextText = '', ...contextState } = suppliedContext;
    if (typeof contextText !== 'string') throw new TypeError('context.text must be a string');
    // Reject invalid caller state before any potentially billed review request.
    initialState(contextState, chapters);
    const fuzzy = [], judgments = [], issues = [], unreviewed = [];
    const askMany = async (evidence, questions) => {
      const answers = validateAnswers(questions, { answers: await this.decisions.decide(structuredClone(evidence), questions) });
      for (const [id, answer] of Object.entries(answers)) judgments.push({ stage: id, answer: structuredClone(answer) });
      return answers;
    };
    const contextProposals = contextText ? bcvProposals(this.parser, contextText, 'context') : [];
    const inputProposals = bcvProposals(this.parser, text, 'input');
    const labels = translationLabelSpans(this.parser, text, inputProposals);
    // The parser's language (an ISO 639-3 code such as eng or jpn) selects the sentence-boundary locale.
    const locale = this.parser.regexps?.languages?.[0] ?? 'en';
    const windows = proseWindows(text, this.window_strategy, inputProposals.map(r => r.indices), this.window_tokens, locale);
    const contextWindows = proseWindows(contextText, this.window_strategy, contextProposals.map(r => r.indices), this.window_tokens, locale);
    const accepted = matches => matches.map(r => ({ ...r, review_status: 'accepted', tag_action: 'keep' }));
    const plans = this.review_bcv_matches ? reviewPlans({ groups: [
      { matches: contextProposals, windows: contextWindows, origin: 'background', backgroundContext: '' },
      { matches: inputProposals, windows, origin: 'input', backgroundContext: contextText }
    ], judgments, maxTokens: this.max_tokens_per_window }) : null;
    const [contextMatches, bcvMatches] = plans ? plans.map(plan => plan.reviewed) : [contextProposals, inputProposals].map(accepted);
    // Tag review and the first window's start detection are independent when
    // every proposal is accepted, which is the usual outcome. Ask the starts
    // under that assumption, concurrently with the review rather than pooled
    // into its body: detection is sensitive to presentation, so its request
    // stays identical to the one sent after a completed review. Any other
    // review outcome discards the answers and the window is discovered again.
    const reviewing = plans ? batchedQuestions(plans.flatMap(plan => plan.workers), (state, questions) => this.decisions.decide(state, questions)) : null;
    let speculatedStarts = null;
    const firstWindow = windows[0];
    if (firstWindow && firstWindow.tokens.length <= this.max_tokens_per_window) {
      const assumed = { context: accepted(contextProposals), input: accepted(inputProposals) };
      const assumedState = initialState({ ...discourseFrom(assumed.context, chapters), ...contextState }, chapters);
      const excluded = assumed.input.filter(r => overlaps(r.indices, [firstWindow.start, firstWindow.end]));
      const plan = startQuestions({ window: firstWindow, excluded,
        evidence: windowEvidence({ window: firstWindow, windowIndex: 0, windows, state: assumedState, contextText,
          contextReferences: assumed.context, explicit: assumed.input, bcvMatches: assumed.input }) });
      const endPlan = plan && endQuestions({ window: firstWindow, excluded, eligible: plan.eligible });
      const starting = plan ? askMany(plan.state, plan.questions) : null;
      const ending = endPlan ? askMany(endState(plan.state), endPlan.questions) : null;
      // Any request's failure rejects the parse; the others' outcomes are then irrelevant.
      reviewing?.catch(() => {}); starting?.catch(() => {}); ending?.catch(() => {});
      const [, starts, ends] = await Promise.all([reviewing, starting, ending]);
      if (starts && [...contextMatches, ...bcvMatches].every(r => r.review_status === 'accepted')) speculatedStarts = { starts, ends };
    } else await reviewing;
    for (const match of [...contextMatches, ...bcvMatches].filter(r => r.review_status === 'unreviewed')) {
      issues.push({ indices: match.indices, origin: contextMatches.includes(match) ? 'background' : 'input',
        reason: 'BCV proposal exceeds review window limit; not accepted' });
    }
    const explicit = bcvMatches.filter(r => r.review_status === 'accepted');
    const contextReferences = contextMatches.filter(r => r.review_status === 'accepted');
    const excludedMatches = bcvMatches.filter(r => ['accepted', 'rejected'].includes(r.review_status));
    const state = initialState({ ...discourseFrom(contextReferences, chapters), ...contextState }, chapters);
    let explicitIndex = 0, mostRecentExplicit = null;
    const recentExplicit = [];
    const applyExplicitUntil = position => {
      while (explicitIndex < explicit.length && explicit[explicitIndex].indices[1] <= position) {
        const entry = explicit[explicitIndex++];
        recentExplicit.unshift(entry);
        if (recentExplicit.length > 8) recentExplicit.pop();
        // Sequences are preserved by the parser; each canonical member enters discourse.
        for (const reference of entry.osis.split(',')) {
          updateState(state, reference, chapters);
          mostRecentExplicit = reference;
        }
      }
    };
    const normalizeCitation = entry => {
      const indices = citationIndices(text, entry.indices);
      if (indices[0] === entry.indices[0] && indices[1] === entry.indices[1]) return;
      const window = windows.find(w => w.start <= indices[0] && w.end >= indices[1]);
      const included = window.tokens.filter(t => overlaps([t.start, t.end], indices));
      entry.indices = indices;
      entry.span = text.slice(...indices);
      entry.token_indices = [included[0].id, included.at(-1).id];
    };
    const resolveEntry = async ({ entry, evidence, targetChapters,
      discourseState = state, windowReference, mostRecentExplicit, recentExplicit,
      ask, askMany, predecessors = [], alongside }) => {
      const span = entry.span;
      const dispatchMany = askMany;
      askMany = (targetEvidence, questions) => dispatchMany(targetEvidence,
        Object.fromEntries(Object.entries(questions).map(([id, question]) => [id, { ...question,
          instructions: `Target expression: ${JSON.stringify(span)}. Resolve only this expression (or its member identified below). Other citations provide context, never extra targets. ${question.instructions}` }])));
      ask = async (id, targetEvidence, question) => (await askMany(targetEvidence, { [id]: question }))[id];
      const classificationQuestion = choice(classificationPrompt, {
        BIBLE_REFERENCE: 'A Bible reference, including relative, partial, approximate, or descriptive references',
        NOT_A_BIBLE_REFERENCE: 'A book mentioned only as a topic/preference, ordinary prose, poetry, or another book; no citation expression',
        UNRESOLVED: 'Insufficient evidence to decide whether this is a Bible reference'
      });
      // A label belongs to a citation only when written with it; distant labels
      // are never inherited, so they need no question.
      // Compare complete recognized label spans; slicing the prose can clip a
      // label that starts within the allowed distance and hide it entirely.
      const nearbyLabels = [...new Set(labels.filter(label =>
        label.indices[0] <= entry.indices[1] + LABEL_DISTANCE &&
        label.indices[1] >= entry.indices[0] - LABEL_DISTANCE).map(label => label.label))];
      const antecedents = anchorsFor(discourseState, windowReference, mostRecentExplicit, recentExplicit, targetChapters);
      const antecedentQuestion = choice('Which established reference is the antecedent of this expression? For coordinated or contrasting relative phrases, consider whether they independently refer to a shared original reference. Do not automatically chain a next/previous expression from the last extracted target. Use a prior fuzzy target only when its resolved address is required. For numbered citations, explicit local book/chapter wording in preceding_context can supply the inherited parts without depending on an earlier AI interpretation. A book name used as background or topic supplies prose evidence even when that mention is not itself a citation; choose NONE rather than depending on its resolved address. Do not choose an older established anchor merely because it exists when local prose has switched the topic. Choose NONE when the expression is absolute, the antecedent is not established, or multiple anchors remain equally plausible.', {
          ...Object.fromEntries(Object.entries(antecedents).map(([id, a]) => [id, `${referenceText(a.reference)}: ${a.description}`])),
          ...Object.fromEntries(predecessors.map((job, i) => [`expression_${i}`, `Earlier extracted expression ${JSON.stringify(job.entry.span)}; select ONLY if this target requires that expression's resolved address, rather than already supplied prose/mechanical context`])),
          NONE: 'No single established antecedent is needed or justified; use the prose to resolve absolute or ambiguous references'
        });
      const citationScopeQuestion = choice(citationScopePrompt, {
        NUMERIC: 'An explicitly named entire Bible book, or a numbered location/range with explicit or inherited book/chapter',
        RELATIVE: 'An EXACT verse/chapter displacement or subdivision, or a backward pointer to an already specified exact passage in discourse',
        SEMANTIC: 'An INEXACT extent: few/several verses, a vague chapter region, unspecified section boundaries, or a content-described passage',
        UNRESOLVED: 'The kind of reference cannot be established'
      });
      // Classification and shape gate whether later answers are USED, not
      // whether they can be asked: every question here reads the discovered
      // span and its prose, so one request carries them all. Answers that the
      // classification, kind, or shape makes inapplicable are discarded.
      // Book inference does not depend on an established anchor choice; a
      // selected fuzzy dependency supplies NEW evidence later, in which case
      // its book is inferred again below.
      const { classification, antecedent: antecedentAnswer, book: bookAnswer, ...shapeAndKind } = await askMany(evidence, {
        classification: classificationQuestion,
        citation_scope: citationScopeQuestion, scope: hierarchyQuestions(targetChapters).scope,
        ...(nearbyLabels.length && entry.translation_association.status === 'none' ? { translation: translationQuestion(nearbyLabels) } : {}),
        ...(Object.keys(antecedents).length || predecessors.length ? { antecedent: antecedentQuestion } : {}),
        book: hierarchyQuestions(targetChapters).book
      });
      entry.decisions.classification = classification;
      entry.classification = classification.choice;
      fuzzy.push(entry);
      if (classification.choice === 'NOT_A_BIBLE_REFERENCE') { entry.status = 'not_a_bible_reference'; return; }
      if (classification.choice === 'UNRESOLVED') { entry.status = 'unresolved'; return; }
      if (shapeAndKind.translation) {
        applyTranslationAnswer(entry, shapeAndKind.translation, this.parser, this.min_translation_probability);
        targetChapters = translationChapters(entry, this.parser, targetChapters);
      }
      const citationScope = shapeAndKind.citation_scope;
      const targetShape = shapeAndKind.scope;
      entry.decisions.scope = targetShape;
      entry.scope_choice = targetShape.choice;
      entry.decisions.citation_scope = citationScope;
      if (citationScope.choice !== 'NUMERIC') {
        entry.status = citationScope.choice === 'UNRESOLVED' ? 'unresolved' : 'needs_search';
        entry.reason = 'Outside the numeric-citation scope; deferred for further interpretation';
        entry.needs_semantic_resolution = citationScope.choice === 'SEMANTIC';
        entry.needs_relative_resolution = citationScope.choice === 'RELATIVE';
        if (entry.needs_semantic_resolution || entry.needs_relative_resolution) entry.escalation = {
          type: entry.needs_semantic_resolution ? 'semantic_resolution' : 'relative_resolution', expression: span,
          context: { window_text: evidence.window_text, background_context: evidence.background_context,
            preceding_context: evidence.preceding_context, following_context: evidence.following_context,
            selected_antecedent: null, accepted_references: structuredClone(evidence.explicit_references_in_window),
            discourse: structuredClone(evidence.discourse) }
        };
        return;
      }
      const needsAntecedent = ['book', 'chapter', 'chapter_range', 'verse', 'range', 'multiple', 'approximate'].includes(targetShape.choice);
      const inferred = {};
      if (['book', 'chapter', 'chapter_range', 'verse', 'range', 'approximate'].includes(targetShape.choice)) inferred.book = bookAnswer;
      // A list is counted from its own expression alone. That isolated evidence
      // would turn every citation's request into the pooled task shape if asked
      // speculatively, so only an identified list pays this extra round.
      if (targetShape.choice === 'multiple') inferred.list_count = await ask('list_count', listCountEvidence(evidence), listCountQuestion());
      const antecedent = (needsAntecedent && antecedentAnswer) || { type: 'choice', choice: 'NONE', confidence: 1,
        probabilities: { NONE: 1 }, determined_by: 'single_allowed_choice' };
      entry.decisions.antecedent = antecedent;
      entry.anchor = antecedents[antecedent.choice]?.reference ?? null;
      if (antecedent.choice.startsWith('expression_')) {
        const predecessor = predecessors[Number(antecedent.choice.slice(11))];
        await predecessor.done;
        entry.depends_on_indices = [...predecessor.entry.indices];
        if (predecessor.entry.status === 'not_a_bible_reference') {
          // A topic mention has no citation address to inherit, but its original
          // prose can still establish a book. Re-infer this target independently
          // instead of discarding it or inventing an anchor for that mention.
          evidence.unavailable_antecedent = {
            expression: predecessor.entry.span, status: predecessor.entry.status,
            instruction: 'This expression is background prose, not an accepted citation, and has no resolved address. Resolve the current target independently from the original prose and other supplied context. An explicitly named governing book can still supply book context. Choose UNRESOLVED for any address part the context does not justify.'
          };
        } else if (predecessor.entry.status !== 'resolved') {
          entry.status = 'unresolved';
          entry.reason = 'The required earlier fuzzy target is unresolved';
          return;
        } else {
          entry.anchor = predecessor.entry.canonical;
        }
      }
      evidence.selected_antecedent = referenceText(entry.anchor);
      // The citation's translation is settled, so its candidates are checked for
      // existence against that versification, as the parser's own strategy does.
      // Discourse state never applies these bounds.
      Object.assign(entry, await resolveNumerically({ evidence, entry, chapters: targetChapters, existence, ask,
        min_interpretation_probability: this.min_interpretation_probability, initialAnswers: { scope: targetShape, ...(inferred.book && !antecedent.choice.startsWith('expression_') ? { book: inferred.book } : {}),
          ...(inferred.list_count ? { list_count: inferred.list_count } : {}) }, askMany, alongside }));
      return;
    };
    // Detection reads the window's own prose plus accepted mechanical context,
    // so every window is discovered now, concurrently, from explicit-only
    // discourse. Resolution below still runs window by window, carrying each
    // window's resolved references into the next. The first window's
    // detection evidence is identical either way; later windows no longer see
    // earlier windows' AI targets while detecting, only while resolving.
    const explicitDiscourseAt = position => {
      const snapshot = initialState({ ...discourseFrom(contextReferences, chapters), ...contextState }, chapters);
      for (const entry of explicit) if (entry.indices[1] <= position) for (const reference of entry.osis.split(',')) updateState(snapshot, reference, chapters);
      return snapshot;
    };
    const detections = windows.map((window, windowIndex) => {
      if (window.tokens.length > this.max_tokens_per_window) return null;
      const entries = discoverWindow({ text, window, excluded: excludedMatches.filter(r => overlaps(r.indices, [window.start, window.end])),
        evidence: windowEvidence({ window, windowIndex, windows, state: explicitDiscourseAt(window.start), contextText, contextReferences, explicit, bcvMatches }),
        askMany, provider: this.decisions.provider ?? 'jev', maxSpans: this.max_spans_per_window, issues, min_start_probability: this.min_start_probability,
        speculated: windowIndex === 0 ? speculatedStarts : null });
      // The sequential loop below reports the failure when it reaches this window.
      entries.catch(() => {});
      return entries;
    });
    for (const [windowIndex, window] of windows.entries()) {
      applyExplicitUntil(window.start);
      const windowReference = state.current_reference;
      const tokens = window.tokens;
      const localExplicit = explicit.filter(r => overlaps(r.indices, [window.start, window.end]));
      if (!detections[windowIndex]) {
        issues.push({ indices: [window.start, window.end], reason: 'Prose window exceeds token limit' });
        applyExplicitUntil(window.end);
        continue;
      }
      const windowState = structuredClone(state);
      const evidence = windowEvidence({ window, windowIndex, windows, state: windowState, contextText, contextReferences, explicit, bcvMatches });
      const entries = await detections[windowIndex];
      const jobs = entries.map(entry => {
        applyExplicitUntil(entry.indices[0]);
        associateTranslations(entry, bcvMatches, this.parser);
        if (entry.bcv_proposal_ids.length) entry.discovery_source = 'reopened_bcv';
        const before = [...(windows[windowIndex - 1]?.tokens ?? []),
          ...tokens.filter(token => token.end <= entry.indices[0])].slice(-128);
        const after = [...tokens.filter(token => token.start >= entry.indices[1]),
          ...(windows[windowIndex + 1]?.tokens ?? [])].slice(0, 128);
        return { entry, evidence: { ...evidence, span: entry.span, instructions: resolutionInstructions,
            preceding_context: before.length ? text.slice(before[0].start, entry.indices[0]) : '',
            following_context: after.length ? text.slice(entry.indices[1], after.at(-1).end) : '',
            discourse: displayDiscourse(state),
            recent_bcv_matches: recentExplicit.map(r => ({ reference: referenceText(r.osis), text: r.span })),
            window_reference: referenceText(windowReference) },
          discourseState: structuredClone(state), mostRecentExplicit, recentExplicit: [...recentExplicit],
          targetChapters: translationChapters(entry, this.parser, chapters) };
      });
      // Register predecessor promises before launching workers. Dependencies can only
      // point backward in source order, so the graph cannot form a cycle.
      for (const job of jobs) job.done = new Promise(resolve => { job.complete = resolve; });
      await batchedQuestions(jobs.map((job, i) => async (ask, askMany) => {
        // Source-boundary review needs only the likely target, so its questions
        // share the final interpretation request instead of following it.
        // A different verified target sends the citation to the pooled review below.
        let speculation;
        const alongside = reference => {
          const view = { ...job.entry };
          normalizeCitation(view);
          const plan = boundaryPlan({ entry: view, text, window, context: contextText, reference });
          const answers = plan ? askMany(plan.evidence, plan.questions) : null;
          // The interpretation question shares this request; its rejection reports the failure.
          answers?.catch(() => {});
          speculation = { reference, plan, answers };
        };
        try {
          await resolveEntry({ ...job, windowReference, ask, askMany,
            predecessors: jobs.slice(0, i), alongside });
        } finally { job.complete(); }
        if (!['resolved', 'ambiguous'].includes(job.entry.status)) return;
        if (speculation?.reference !== reviewTarget(job.entry)) { unreviewed.push(job.entry); return; }
        if (!speculation.plan) return;
        normalizeCitation(job.entry);
        applyBoundary(job.entry, speculation.plan, await speculation.answers, text);
      }), askMany);
      applyExplicitUntil(window.end);
      // Reconstruct final discourse in source order rather than completion order.
      Object.assign(state, windowState);
      for (const event of [...localExplicit.map(r => ({ ...r, canonical: r.osis })),
        ...entries.filter(r => r.status === 'resolved')].sort((a, b) => a.indices[1] - b.indices[1])) {
        updateState(state, event.canonical, chapters);
      }
    }
    applyExplicitUntil(text.length);
    for (const entry of fuzzy) normalizeCitation(entry);
    // Citations whose verified target differed from the speculated one are
    // reviewed once, pooled across windows, after all discourse is established.
    if (unreviewed.length) await review_boundaries({ entries: unreviewed, text, windows, context: contextText, askMany });
    for (const entry of fuzzy) {
      preserveVerseParts(entry, this.parser);
      finalizeTranslations(entry, bcvMatches, this.parser);
    }
    const references = [
      ...explicit.map(({ osis, translations, indices }) => ({ osis, translations, indices })),
      ...fuzzy.map(aiReference).filter(Boolean)
    ].sort((a, b) => a.indices[0] - b.indices[0] || a.indices[1] - b.indices[1]);
    const escalations = fuzzy.filter(r => r.escalation).map(r => ({ ...structuredClone(r.escalation), indices: [...r.indices] }));
    const result = { references, text, explicit, bcv_matches: bcvMatches, context_bcv_matches: contextMatches, escalations, state, judgments, status: issues.length ? 'incomplete' : 'complete', issues };
    Object.defineProperties(result, {
      osis_and_indices: { value: () => structuredClone(references) },
      parsed_entities: { value: () => parsedEntities({ bcvMatches, contextMatches, fuzzy, parser: this.parser }) },
      osis: { value: () => references.map(r => r.osis).join(',') }
    });
    return result;
  }
}

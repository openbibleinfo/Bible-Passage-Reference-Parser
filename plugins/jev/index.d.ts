export interface Reference {
  osis: string;
  /** Omitted for mechanical BCV matches, including AI-reviewed accepted matches. */
  parser?: 'ai';
  /** Probability assigned to BIBLE_REFERENCE by classification; omitted for mechanical matches. */
  citation_confidence?: number;
  /** Final address-selection probability; separate from citation classification. */
  target_confidence?: number;
  /** Alternatives share this reference's source span and translations. */
  alternates?: { osis: string; target_confidence: number }[];
  translations: string[];
  /** Half-open UTF-16 code-unit indices into the original JavaScript string. */
  indices: [number, number];
}
export interface DiscourseState {
  /** Background prose visible to Jev; offsets never refer to this text. */
  text?: string;
  current_reference?: string | null;
  recent_references?: string[];
  active_book?: string | null;
  active_chapter?: string | null;
  active_passage?: string | null;
}
export interface ChoiceQuestion {
  type: 'choice';
  instructions: string;
  criteria: Record<string, string>;
}
export interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
  /** Structural singleton choice, not a provider-evaluated probability. */
  determined_by?: 'single_allowed_choice';
}
export interface DecisionClient {
  decide(state: object, questions: Record<string, ChoiceQuestion>): Promise<Record<string, ChoiceAnswer>>;
}
export type ResolutionStatus = 'resolved' | 'ambiguous' | 'unresolved' | 'needs_search' | 'not_a_bible_reference';
export interface SemanticEscalation {
  type: 'semantic_resolution' | 'relative_resolution';
  expression: string;
  indices?: [number, number];
  context: { window_text: string; background_context: string; preceding_context: string;
    following_context: string; selected_antecedent: string | null;
    accepted_references: object[]; discourse: object };
}
export interface TranslationAssociation {
  status: 'none' | 'matched' | 'uncertain';
  /** AI-selected label metadata, independent of source offsets. Omitted for BCV proposal associations. */
  source?: 'ai';
  translations?: string[];
  system?: string;
  candidates: { proposal_id: string; indices: [number, number]; translations: string[]; systems: string[] }[];
  reason_code?: 'multiple_proposals' | 'proposal_not_reopened' | 'expanded_span' | 'multiple_versification_systems' | 'invalid_target' | 'ai_translation_uncertain' | 'unsupported_translation';
}
export interface BcvProvenance {
  id: string;
  /** Original BCV parsed_entities() records for this proposal, captured before another parse. */
  bcv_entities: unknown[];
}
export type BcvTagAction = 'keep' | 'remove_and_reinterpret' | 'remove_and_exclude' | 'pending_review';
export interface ParseResult {
  references: Reference[];
  text: string;
  explicit: (Reference & { source: 'explicit'; span: string })[];
  /** Raw BCV proposals with review outcomes; only accepted proposals enter explicit. */
  bcv_matches: (Reference & BcvProvenance & { source: 'explicit'; span: string; review_status: 'accepted' | 'reopened' | 'rejected' | 'unreviewed'; review?: ChoiceAnswer; review_uncertain?: boolean; tag_action?: BcvTagAction })[];
  context_bcv_matches: (Reference & BcvProvenance & { span: string; review_status: 'accepted' | 'reopened' | 'rejected' | 'unreviewed'; review?: ChoiceAnswer; review_uncertain?: boolean; tag_action?: BcvTagAction })[];
  /** Pending work for caller-controlled escalation; no automatic model calls. */
  escalations: SemanticEscalation[];
  state: DiscourseState;
  judgments: object[];
  status: 'complete' | 'incomplete';
  issues: { indices: [number, number]; reason: string; origin?: 'input' | 'background' }[];
  /** Most likely AI interpretations remain visible below the internal resolution threshold. */
  osis_and_indices(): Reference[];
  parsed_entities(): ParsedEntity[];
  osis(): string;
}
export type PublicChoiceAnswer = Omit<ChoiceAnswer, 'type'>;
export interface ParsedEntity extends Reference {
  entity_id?: number;
  /** Original BCV syntactic type, when present. Never identifies the parsing engine. */
  type?: string;
  start?: { b: string; c: number; v: number; p?: string };
  end?: { b: string; c: number; v: number; p?: string };
  entities: unknown[];
  ai: {
    origin: 'input' | 'context';
    proposal_id?: string;
    review_status?: string;
    review?: PublicChoiceAnswer;
    status?: ResolutionStatus;
    /** Compact target identifies the known beginning; the rest of the passage requires resolution. */
    endpoint_status?: 'unresolved';
    system?: string;
    bcv_proposal_ids?: string[];
    translation_association?: TranslationAssociation;
    decisions?: Record<string, PublicChoiceAnswer>;
    boundary_review?: { action: 'kept' | 'trimmed' | 'unresolved' | 'invalid';
      original: { span: string; indices: [number, number]; token_indices: [number, number] }; probability: number };
    escalation?: SemanticEscalation;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
export interface ExplicitParser {
  /** BCV's language-specific recognition patterns, including add_translations() registrations.
   * Enabled books are read from `books`; without it every book in the versification table is offered. */
  regexps?: { translations: RegExp[]; books?: { osis: string[] }[]; /** ISO 639-3 codes; the first selects the sentence-boundary locale for windowing. */ languages?: string[] };
  /** passage_existence_strategy governs the single existence check made when a citation's resolution completes. */
  options?: { versification_system?: string; osis_compaction_strategy?: string; testaments?: string; passage_existence_strategy?: string };
  parse(text: string): { osis_and_indices(): Reference[]; parsed_entities?(): unknown[] };
  parse_with_context?(text: string, context: string): { osis_and_indices(): Reference[] };
  translation_info(system?: string): { alias?: string; chapters: Record<string, number[]> };
}
export class FuzzyReferenceParser {
  /** Numeric resolution with automatic windowing, batched questions, and mandatory boundary review.
   * min_interpretation_probability defaults to 0.85; it controls context eligibility, not primary target visibility.
   * min_translation_probability defaults to 0.5 and controls AI translation acceptance.
   */
  constructor(options: { parser: ExplicitParser; decisions: DecisionClient; min_start_probability?: number; window_strategy?: 'auto' | 'document'; window_tokens?: number; max_tokens_per_window?: number; max_spans_per_window?: number; review_bcv_matches?: boolean; min_interpretation_probability?: number; min_translation_probability?: number });
  parse(text: string, options?: { context?: string | DiscourseState }): Promise<ParseResult>;
}
export class JevClient implements DecisionClient {
  /** Reads OPENROUTER_API_KEY for OpenRouter, otherwise TYPESAFE_API_KEY, when api_key is omitted.
   * model defaults to jev-latest for api.typesafe.ai, otherwise ~typesafe/jev-latest.
   */
  constructor(options?: { api_key?: string; endpoint?: string; model?: string; fetch?: typeof fetch; timeout_ms?: number });
  decide(state: object, questions: Record<string, ChoiceQuestion>): Promise<Record<string, ChoiceAnswer>>;
}

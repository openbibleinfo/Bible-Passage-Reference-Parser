export interface BCVParserOptions {
	// ### OSIS Output
	/*
	* `combine`:  "Matt 5, 6, 7" -> "Matt.5-Matt.7".
	* `separate`: "Matt 5, 6, 7" -> "Matt.5,Matt.6,Matt.7".
	*/
	consecutive_combination_strategy: "combine" | "separate";
	/*
	* `b`: OSIS refs get reduced to the shortest possible. "Gen.1.1-Gen.50.26" and "Gen.1-Gen.50" → "Gen", while "Gen.1.1-Gen.2.25" → "Gen.1-Gen.2".
	* `bp`: Same as `b` but preserves partial verses when they appear. "Genesis 1:1a-50:26" parses as "Gen.1.1!a-Gen.50.26", while "Genesis 1:1-50:26" still parses as "Gen".
	* `bc`: OSIS refs get reduced to complete chapters if possible, but not whole books. "Gen.1.1-Gen.50.26" → "Gen.1-Gen.50".
	* `bcp`: Same as `bc` but preserves partial verses when they appear. "Genesis 1:1a-50:26" parses as "Gen.1.1!a-Gen.50.26", while "Genesis 1:1-50:25" still parses as "Gen.1-Gen.50".
	* `bcv`: OSIS refs always include the full book, chapter, and verse. "Gen.1" → "Gen.1.1-Gen.1.31".
	* `bcvp`: Same as `bc` but preserves partial verses when they appear. "Gen 1:1a" parses as "Gen.1.1!a", while "Genesis 1:1" still parses as "Gen.1.1". In all these `p` cases, the "partial" indicator is returned exactly as it appears in the text, so non-Latin languages may have non-Latin characters after the `!` character in the OSIS ref.
	*/
	osis_compaction_strategy: "b" | "bp" | "bc" | "bcp" | "bcv" | "bcvp";
	// ### Sequence
	/*
	* `ignore`: ignore any books on their own in sequences ("Gen Is 1" -> "Isa.1").
	* `include`: any books that appear on their own get parsed according to `book_alone_strategy` ("Gen Is 1" means "Gen.1-Gen.50,Isa.1" if `book_alone_strategy` is `full` or `ignore`, or "Gen.1,Isa.1" if it's `first_chapter`).
	*/
	book_sequence_strategy: "ignore" | "include";
	/*
	* `ignore`: "Matt 99, Gen 1" sequence index starts at the valid `Gen 1`.
	* `include`: "Matt 99, Gen 1" sequence index starts at the invalid `Matt 99`.
	*/
	invalid_sequence_strategy: "ignore" | "include";
	/*
	* `combine`: sequential references in the text are combined into a single comma-separated OSIS string: "Gen 1, 3" → `"Gen.1,Gen.3"`.
	* `separate`: sequential references in the text are separated into an array of their component parts: "Gen 1, 3" → `["Gen.1", "Gen.3"]`.
	*/
	sequence_combination_strategy: "combine" | "separate";
	/*
	* `us`: commas separate sequences, periods separate chapters and verses. "Matt 1, 2. 4" → "Matt.1,Matt.2.4".
	* `eu`: periods separate sequences, commas separate chapters and verses. "Matt 1, 2. 4" → "Matt.1.2,Matt.1.4".
	*/
	punctuation_strategy: "us" | "eu";
	// ### Potentially Invalid Input
	/*
	* `ignore`: Include only valid passages in `parsed_entities()`.
	* `include`: Include invalid passages in `parsed_entities()` (they still don't have OSIS values).
	*/
	invalid_passage_strategy: "ignore" | "include";
	/*
	* `ignore`: treat non-Latin digits the same as any other character.
	* `replace`: replace non-Latin (0-9) numeric digits with Latin digits. This replacement occurs before any book substitution.
	*/
	non_latin_digits_strategy: "ignore" | "replace";
	/*
	Used in both `bcv_passage` and `bcv_parser`.
	* Include `b` in the string to validate book order ("Revelation to Genesis" is invalid).
	* Include `c` in the string to validate chapter existence. If omitted, strings like "Genesis 51" (which doesn't exist) return as valid. Omitting `c` means that looking up full books will return `999` as the end chapter: "Genesis to Exodus" → "Gen.1-Exod.999".
	* Include `v` in the string to validate verse existence. If omitted, strings like `Genesis 1:100` (which doesn't exist) return as valid. Omitting `v` means that looking up full chapters will return `999` as the end verse: "Genesis 1:2 to chapter 3" → "Gen.1.2-Gen.3.999".
	* Tested values are `b`, `bc`, `bcv`, `bv`, `c`, `cv`, `v`, and `none`. In all cases, single-chapter books still respond as single-chapter books to allow treating strings like `Obadiah 2` as `Obad.1.2`.
	*/
	passage_existence_strategy: PassageExistenceStrategy;
	// ### Context
	/*
	* `ignore`: any books that appear on their own don't get parsed as books ("Gen saw" doesn't trigger a match, but "Gen 1" does).
	* `full`: any books that appear on their own get parsed as the complete book ("Gen" means "Gen.1-Gen.50").
	* `first_chapter`: any books that appear on their own get parsed as the first chapter ("Gen" means "Gen.1").
	*/
	book_alone_strategy: "ignore" | "full" | "first_chapter",
	/*
	* `ignore`: any books that appear on their own in a range are ignored ("Matt-Mark 2" means "Mark.2").
	* `include`: any books that appear on their own in a range are included as part of the range ("Matt-Mark 2" means "Matt.1-Mark.2", while "Matt 2-Mark" means "Matt.2-Mark.16").
	*/
	book_range_strategy: "ignore" | "include";
	/*
	* `delete`: remove any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5". This is better for text extraction.
	* `include`: keep any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5.1". This is better for query parsing.
	*/
	captive_end_digits_strategy: "delete" | "include";
	// ### Testaments
	/* Set which testaments to draw books from. If the string contains an `o`, it includes the Old Testament (`Gen`-`Mal`). If it contains an `n`, it includes the New Testament (`Matt-Rev`). If it contains an `a`, it includes the Apocrypha (everything else). While some translations include books from the Apocrypha as part of the Old Testament, this parser treats them separately.
	*/
	testaments: "on" | "ona" | "oa" | "o" | "na" | "n" | "a";
	/*
	* `c`: treat references to Psalm 151 (if using the Apocrypha) as a chapter: "Psalm 151:1" -> "Ps.151.1"
	* `b`: treat references to Psalm 151 (if using the Apocrypha) as a book: "Psalm 151:1" -> "Ps151.1.1". Be aware that for ranges starting or ending in Psalm 151, you'll get two OSISes, regardless of the `sequence_combination_strategy`: "Psalms 149-151" -> "Ps.149-Ps.150,Ps151.1" Setting this option to `b` is the only way to correctly parse OSISes that treat `Ps151` as a book.
	*/
	ps151_strategy: "c" | "b";
	// ### Versification System
	/* Set via `versification_system` or `set_options` functions.
	* `default`: the default ESV-style versification. Also used in AMP.
	* `ceb`: use CEB versification, which varies mostly in the Apocrypha.
	* `kjv`: use KJV versification, with one fewer verse in 3John. Also used in NIV and NKJV.
	`nab`: use NAB versification, which generally follows the Septuagint.
	* `nlt`: use NLT versification, with one extra verse in Rev. Also used in NCV.
	* `nrsv`: use NRSV versification.
	* `vulgate`: use Vulgate (Greek) numbering for the Psalms.
	*/
	versification_system: string;
	// ### Case Sensitivity
	/*
	# Don't use this value directly; use the `set_options` function. Changing this option repeatedly will slow down execution.
	# * `none`: All matches are case-insensitive.
	# * `books`: Book names are case-sensitive. Everything else is still case-insensitive.
	# * `translations`: Translation identifiers (such as "KJV") are case-sensitive. Everything else is still case-insensitive.
	# * `books,translations`: Books and translation identifiers are case-sensitive. Everything else (such as the word "verse") is still case-insensitive.
	*/
	case_sensitive: "none" | "books" | "translations" | "books,translations";
	/* # Passage options
	* `error`: zero chapters ("Matthew 0") are invalid.
	* `upgrade`: zero chapters are upgraded to 1: "Matthew 0" -> "Matt.1".
	Unlike `zero_verse_strategy`, chapter 0 isn't allowed.
	*/
	zero_chapter_strategy: "error" | "upgrade";
	/*
	* `error`: zero verses ("Matthew 5:0") are invalid.
	* `upgrade`: zero verses are upgraded to 1: "Matthew 5:0" -> "Matt.5.1".
	* `allow`: zero verses are kept as-is: "Matthew 5:0" -> "Matt.5.0". Some traditions use 0 for Psalm titles.
	*/
	zero_verse_strategy: "error" | "upgrade" | "allow";
	/*
	* `chapter`: treat "Jude 1" as referring to the complete book of Jude: `Jude.1`. People almost always want this output when they enter this text in a search box.
	* `verse`: treat "Jude 1" as referring to the first verse in Jude: `Jude.1.1`. If you're parsing specialized text that follows a style guide, you may want to set this option.
	*/
	single_chapter_1_strategy: "chapter" | "verse";
	/*
	* `verse`: treat "Jer 33-11" as "Jer.33.11" (end before start) and "Heb 13-15" as "Heb.13.15" (end range too high).
	* `sequence`: treat them as sequences.
	*/
	end_range_digits_strategy: "verse" | "sequence";
	/*
	* `none`: Don't issue `console.warn()`.
	* `warn`: Issue a `console.warn()` message when trying to set a versification system that doesn't exist or when getting `translation_info()` that doesn't exist.
	*/
	warn_level: "none" | "warn";

	/* Grammar */
	grammar: {
		ab: RegExp,
		and: RegExp,
		c_explicit: RegExp,
		c_sep_eu: RegExp,
		c_sep_us: RegExp,
		cv_sep_weak: RegExp,
		cv_sep_eu: RegExp,
		cv_sep_us: RegExp,
		ff: RegExp,
		in_book_of: RegExp,
		next: RegExp,
		ordinal: RegExp,
		range: RegExp,
		sequence_eu: RegExp,
		sequence_us: RegExp,
		space: RegExp,
		title: RegExp,
		v_explicit: RegExp,
		// Don't set these directly; use the `punctuation_strategy` option to enable either the `us` or `eu` versions.
		c_sep: RegExp,
		cv_sep: RegExp,
		sequence: RegExp
	}
}

export type Testament = "o" | "n" | "a";

type PassageExistenceStrategy = "b" | "bc" | "bcv" | "bv" | "c" | "cv" | "v" | "none";

export interface PublicBCVParserOptions extends BCVParserOptions {
	include_apocrypha: boolean;
}

export type PartialOptions = Partial<PublicBCVParserOptions>;

export type IndicesPair = [number, number];

// A top-level entity after `bcv_passage` has processed a grammar match. Most
// entities carry `passages`; `stop` and `translation_sequence` intentionally do
// not.
export interface EntityCollection {
	absolute_indices: IndicesPair;
	original_type?: EntityType;
	passages?: Entity[];
	type: EntityType;
	value: PassageEntityInterface[] | PassageEntityInterface[][] | string | number;
}

export interface EntityCollectionArrayValue extends EntityCollection {
	value: PassageEntityInterface[] | PassageEntityInterface[][];
}

export interface Entity {
	absolute_indices?: IndicesPair;
	alternates?: Entity[];
	enclosed_absolute_indices?: IndicesPair;
	end: StartEndInterface;
	start: StartEndInterface;
	translations?: TranslationSequenceInterface[];
	type?: EntityType;
	valid: ValidInterface;
}

// Every node type the grammar or the passage processor can produce: the passage-handler names plus the few types that never get their own handler. `b_pre` is the number the matcher prepends inside a synthetic `b_range_pre` node ("1" in "1-2 Sam"); the `b_range_pre` handler reads it directly rather than dispatching it.
export type EntityType = PassageHandlerKey | "b_pre" | "title" | "translation" | "c_explicit" | "v_explicit";

// A start or end object whose book is known to exist: past the `valid` gate on the way to OSIS output, or inside the `validate_known_*_book` validators. The base interface leaves `b` optional because invalid references (`start_book_not_defined`) genuinely lack it.
export interface StartEndWithBookInterface extends StartEndInterface {
	b: string;
}

export interface StartEndInterface {
	b?: string;
	c?: number;
	extra?: string;
	p?: string;
	p_if_verse?: string;
	v?: number;
	type?: EntityType;
}

// `validate_ref` is the only producer of these objects, and it always sets `messages` (possibly to an empty object).
export interface ValidInterface {
	valid: boolean;
	messages: MessageInterface;
}

export interface MessageInterface {
	start_book_not_defined?: true;
	start_book_not_exist?: true;
	start_chapter_is_zero?: 1;
	start_chapter_not_exist?: number;
	start_chapter_not_exist_in_single_chapter_book?: 1;
	start_chapter_not_numeric?: true;
	start_chapter_1?: 1;
	start_verse_1?: 1;
	start_verse_is_zero?: 1;
	start_verse_not_exist?: number;
	start_verse_not_numeric?: true;
	end_book_before_start?: true;
	end_book_not_exist?: true;
	end_chapter_before_start?: true;
	end_chapter_is_zero?: 1;
	end_chapter_not_exist?: number;
	end_chapter_not_exist_in_single_chapter_book?: 1;
	end_chapter_not_numeric?: true;
	end_verse_before_start?: true;
	end_verse_is_zero?: 1;
	end_verse_not_exist?: number;
	end_verse_not_numeric?: true;
	translation_invalid?: TranslationSequenceInterface[];
	translation_unknown?: TranslationSequenceInterface[];
}

export interface BCVParserInterface {
	options: BCVParserOptions;
	passage: BCVPassageInterface;
	regexps: BCVRegExpsInterface;
	regexps_manager: BCVRegExpsManagerInterface;
	translations: BCVTranslationsInterface;
	translations_manager: BCVTranslationsManagerInterface;
}

export interface BCVPassageInterface {
	books: BookMatchInterface[];
	indices: IndicesInterface[];
	options: BCVParserOptions;
	translations: BCVTranslationsInterface;
	validators: BCVValidatorsInterface;

	handle_obj(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn;
	pluck(type: string, passages: PassageEntityInterface[]): PassageEntityInterface | null;
}

export interface BCVValidatorsInterface {
	validate_ref(translations: TranslationSequenceInterface[] | null | undefined, start: StartEndInterface, end?: StartEndInterface | null): ValidInterface;
	validate_start_ref(system: string, start: StartEndInterface, messages: MessageInterface): [boolean, MessageInterface];
	validate_end_ref(system: string, start: StartEndInterface, end: StartEndInterface, valid: boolean, messages: MessageInterface): [boolean, MessageInterface];
}

export interface BCVRegExpsInterface {
	all_books: BookRegExpInterface[];
	books: BookRegExpInterface[];
	control: RegExp;
	escaped_passage: RegExp;
	first: RegExp;
	match_end_split: RegExp;
	post_book: RegExp;
	pre_book: RegExp;
	pre_number_book: RegExp;
	range_and: RegExp;
	range_only: RegExp;
	second: RegExp;
	third: RegExp;
	translations: RegExp[]
	filter_books(testaments: BCVParserOptions["testaments"], case_sensitive: BCVParserOptions["case_sensitive"]): void;
	/* These are private functions.
	has_testament_overlap(testaments: BCVParserOptions["testaments"], book_testament: BCVParserOptions["testaments"]): boolean;
	get_testament_overlap(testaments: BCVParserOptions["testaments"], book: BookRegExpInterface): string[];
	*/
}

export interface BookRegExpInterface {
	extra?: string;
	osis: string[];
	regexp: RegExp;
	testament: BCVParserOptions["testaments"];
	testament_books?: { [key: string]: "o" | "n" | "a" | "oa" };
}

export interface BCVTranslationsInterface {
	aliases: {
		[key: string]: TranslationAliasInterface;
	};
	current_system: string;
	systems: {
		[key: string]: TranslationInterface;
		current: CompleteTranslationInterface;
		default: CompleteTranslationInterface;
	};
}

export type PassageReturn = [PassageEntityInterface[], ContextInterface];

export interface TranslationSequenceInterface {
	osis: string;
	translation: string;
	system: string;
}

export interface TranslationAliasInterface {
	osis?: string;
	// Every alias defines a `system`: all built-in language bundles set it explicitly, and `add_translations` normalizes user input to include it.
	system: string;
}

export interface TranslationInterface {
	system?: string;
	chapters?: { [key: string]: number[] };
	order?: { [key: string]: number };
	translation?: string;
}

export interface CompleteTranslationInterface extends TranslationInterface {
	chapters: { [key: string]: number[] };
	order: { [key: string]: number };
}

export interface PublicTranslationInterface {
	alias: string;
	books: string[];
	chapters: { [key: string]: number[] };
	order: { [key: string]: number };
	system: string;
}

export interface BookMatchInterface {
	context?: ContextInterface;
	match?: string;
	parsed: string[] | string;
	start_index?: number;
	type: "book" | "context" | "translation";
	value: string;
}

// The objects the grammar emits are the same objects that `bcv_passage` later decorates with `passages`, `start_context`, and so on--`PassageEntityInterface` describes the decorated stage. The grammar always sets `type`, `value`, and `indices`, so this view of the same objects makes them required.
export interface GrammarMatchInterface extends PassageEntityInterface {
	absolute_indices?: IndicesPair;
	indices: IndicesPair;
	type: EntityType;
	value: PassageEntityInterface[] | PassageEntityInterface[][] | string | number;
}

export type PassageHandlerKey =
	| "b"
	| "b_range"
	| "b_range_pre"
	| "b_range_start"
	| "base"
	| "bc"
	| "bc_title"
	| "bcv"
	| "bv"
	| "c"
	| "c_psalm"
	| "c_title"
	| "cb_range"
	| "context"
	| "cv"
	| "cv_psalm"
	| "ff"
	| "integer"
	| "integer_title"
	| "next_v"
	| "range"
	| "range_end_b"
	| "sequence"
	| "sequence_post_enclosed"
	| "stop"
	| "translation_sequence"
	| "v"
	| "word";

interface OsisEntityBase {
	entity_id: number;
	indices: IndicesPair;
	osis: string;
	translations: string[];
}

// A single parsed passage. `enclosed_indices` is always present as a property,
// but is undefined when the passage wasn't enclosed.
export interface OsisPassageEntityInterface extends OsisEntityBase {
	enclosed_indices: IndicesPair | undefined;
	end: StartEndInterface;
	entities: Entity[];
	is_enclosed_last?: boolean;
	start: StartEndInterface;
	type?: EntityType;
}

export interface OsisSequenceEntityInterface extends OsisPassageEntityInterface {
	enclosed_indices: IndicesPair;
}

// The combined public object returned when sequence combination is enabled.
export interface OsisEntityCollectionInterface extends OsisEntityBase {
	entities: OsisPassageEntityInterface[];
}

export type OsisEntityInterface = OsisPassageEntityInterface | OsisEntityCollectionInterface;

export interface PassageEntityInterface {
	absolute_indices?: IndicesPair;
	alternates?: Entity[];
	enclosed_absolute_indices?: IndicesPair;
	explicit_context?: "c";
	indices?: IndicesPair;
	match?: string;
	original_type?: EntityType;
	original_value?: PassageEntityInterface[] | PassageEntityInterface[][] | string | number;
	passages?: Entity[];
	partial?: string | string[] | null;
	start_context?: ContextInterface;
	start_index?: number;
	type?: EntityType;
	value?: PassageEntityInterface[] | PassageEntityInterface[][] | string | number;
}

/* The grammar guarantees the shape of `value` for each node `type`: container types like `bc` or `range` carry an array of child entities; `b`-like types carry a number (an index into the matched books, or the number itself for `integer`); `sequence` types carry one array of entities per item in the sequence. Passage handlers are dispatched by `type`, so each handler can rely on the shape for its type. */
export interface PassageEntityArrayValue extends PassageEntityInterface {
	value: PassageEntityInterface[];
}

export interface PassageEntityNumberValue extends PassageEntityInterface {
	value: number;
}

export interface PassageEntitySequenceValue extends PassageEntityInterface {
	value: PassageEntityInterface[][];
}

/* Lifecycle views of the same objects, from later in their lives. Every passage handler stamps `start_context` on entry, and every handler except `stop` and `translation_sequence` also stamps `passages` before returning. `bcv_passage` casts to these views at the boundaries where it reads back a node it just passed through a handler; `stop` and `translation_sequence` nodes never appear at those boundaries (they aren't part of any node's `value`). */
export interface ProcessedEntityInterface extends PassageEntityInterface {
	passages: Entity[];
	start_context: ContextInterface;
}

export interface ProcessedEntityArrayValue extends ProcessedEntityInterface {
	value: PassageEntityInterface[];
}

// An in-flight range node: `range()` stamps `start_context` on entry, before delegating to its helpers, so they can rely on it even though `passages` may not exist yet.
export interface RangeEntityInterface extends PassageEntityArrayValue {
	start_context: ContextInterface;
}

// The synthetic root node that `bcv_matcher` wraps around grammar output. It has no `indices` of its own; `base()` uses `match` and `start_index` to calculate the base indices for all the nodes inside it.
export interface GrammarBaseInterface extends PassageEntityArrayValue {
	match: string;
	start_index: number;
}

export interface IndicesInterface {
	start: number;
	end: number;
	index: number;
}

export interface ContextInterface {
	b?: string;
	c?: number;
	v?: number;
	translations?: TranslationSequenceInterface[];
}

export type ContextKey = "b" | "c" | "v" | "translations";

export interface AddBooksInterface {
	books: BookPattern[];
}

export interface BookPattern {
	insert_at?: string;
	osis: string[];
	regexp: RegExp;
	pre_regexp?: RegExp;
	post_regexp?: RegExp;
}

export interface BCVRegExpsManagerInterface {
	filtered_books_flags: string;
	filter_books(testaments: BCVParserOptions["testaments"], case_sensitive: BCVParserOptions["case_sensitive"]): void;
	add_books(books: AddBooksInterface): void;
}

export interface BCVTranslationsManagerInterface {
	translation_info(system?: string): PublicTranslationInterface;
	add_translations(new_translations: AddTranslationsInterface): void;
	apply_case_sensitive(case_sensitive: BCVParserOptions["case_sensitive"]): void;
}

export interface AddTranslationsInterface {
	translations: AddTranslationInterface[];
	insert_at?: "start" | "end"; // "start" is the default
	pre_regexp?: RegExp; // "" is the default
	post_regexp?: RegExp; // "(?![\p{L}\p{N}]" is the default}
	systems?: {
		[key: string]: AddTranslationVersificationInterface;
	}
}

export interface AddTranslationInterface {
	osis?: string;
	system?: string;
	text: string;
}

export interface AddTranslationVersificationInterface {
	books?: string[];
	chapters?: { [key: string]: number[] };
}

export interface TranslationDefinition {
	books?: { [key: string]: number };
	chapters?: { [key: string]: number[] };
}

export interface BCVParserConstructor {
	grammar_options: BCVParserOptions["grammar"];
	regexps: new () => BCVRegExpsInterface;
	translations: new () => BCVTranslationsInterface;
}

export interface OsisAndIndicesInterface {
	osis: string;
	indices: [number, number];
	translations: string[];
}

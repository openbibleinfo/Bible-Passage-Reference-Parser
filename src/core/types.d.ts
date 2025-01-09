export interface BCVParserOptions {
	// ### OSIS Output
	/*
	* `combine`:  "Matt 5, 6, 7" -> "Matt.5-Matt.7".
	* `separate`: "Matt 5, 6, 7" -> "Matt.5,Matt.6,Matt.7".
	*/
	consecutive_combination_strategy: "combine" | "separate";
	/*
	* `b`: OSIS refs get reduced to the shortest possible. "Gen.1.1-Gen.50.26" and "Gen.1-Gen.50" -> "Gen", while "Gen.1.1-Gen.2.25" -> "Gen.1-Gen.2".
	* `bc`: OSIS refs get reduced to complete chapters if possible, but not whole books. "Gen.1.1-Gen.50.26" -> "Gen.1-Gen.50".
	* `bcv`: OSIS refs always include the full book, chapter, and verse. "Gen.1" -> "Gen.1.1-Gen.1.31".
	*/
	osis_compaction_strategy: "b" | "bc" | "bcv";
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
	*/
	case_sensitive: "none" | "books";
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
}

type PassageExistenceStrategy = "b" | "bc" | "bcv" | "bv" | "c" | "cv" | "v" | "none";

interface PublicBCVParserOptions extends BCVParserOptions {
	include_apocrypha: boolean;
}

export type PartialOptions = Partial<PublicBCVParserOptions>;

export interface EntityCollection {
	absolute_indices: number[];
	alternates?: any;
	enclosed_indices: number[];
	end: StartEndInterface;
	entity_id: number;
	indices: number[];
	original_type?: EntityType;
	osis: string;
	passages?: Entity[];
	start: StartEndInterface;
	translations: string[];
	type: EntityType;
	value: GrammarMatchInterface[] | GrammarMatchInterface[][];
}

export interface Entity {
	absolute_indices?: number[];
	alternates?: any;
	enclosed_absolute_indices?: number[];
	end: StartEndInterface;
	start: StartEndInterface;
	translations?: TranslationSequenceInterface[];
	type?: EntityType;
	valid: ValidInterface;
}

type EntityType = "b" | "b_pre" | "b_range" | "b_range_pre" | "b_range_start" | "base" | "bc" | "bcv" | "context" | "ff" | "integer" | "range" | "range_end_b" | "sequence" | "translation_sequence";

interface StartEndInterface {
	b: string;
	c?: number;
	extra?: string;
	v?: number;
	type?: EntityType;
	original_object?: StartEndInterface;
}

export interface ValidInterface {
	valid: boolean;
	messages?: MessageInterface;
}

interface MessageInterface {
	start_book_not_defined?: true;
	start_book_not_exist?: true;
	start_chapter_is_zero?: 1;
	start_chapter_not_exist?: number;
	start_chapter_not_exist_in_single_chapter_book?: 1;
	start_chapter_not_numeric?: true;
	start_chapter_1?: 1;
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

interface BCVParserInterface {
	options: BCVParserOptions;
	passage: BCVPassageInterface;
	regexps: BCVRegExpsInterface;
	translations: BCVTranslationsInterface;
}

interface BCVPassageInterface {
	books: any[];
	indices: IndicesInterface;
	options: BCVParserOptions;
	translations: BCVTranslationsInterface;

	handle_obj(passage: GrammarMatchInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn;
}

interface BCVRegExpsInterface {
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

interface BookRegExpInterface {
	extra?: string;
	osis: string[];
	regexp: RegExp;
	testament: BCVParserOptions["testaments"];
	testament_books?: { [key: string]: "o" | "n" | "a" | "oa" };
}

interface BCVTranslationsInterface {
	aliases: {
		[key: "string"]: TranslationAliasInterface;
	};
	current_system: string;
	systems: {};
}

type PassageReturn = [PassageEntityInterface[], ContextInterface];

export interface TranslationSequenceInterface {
	osis: string;
	translation: string;
	system: string;
}

export interface TranslationAliasInterface {
	osis?: string;
	system?: string;
}

export interface TranslationInterface {
	system?: string;
	chapters?: { [key: string]: number[] };
	order?: { [key: string]: number };
	translation?: string;
}

export interface PublicTranslationInterface {
	alias: string;
	books: string[];
	chapters: { [key: string]: number[] };
	order: { [key: string]: number };
	system: string;
}

type MatchInterface = BookMatchInterface | PassageMatchInterface;

interface BookMatchInterface {
	context?: string;
	match?: string;
	parsed: string[] | string;
	start_index?: number;
	type: "book" | "context" | "translation";
	value: string;
}

interface PassageMatchInterface {
	type: "b_range_pre";
	value: string | number | PassageMatchInterface[];
	indices: number[];
}

interface GrammarMatchInterface {
	absolute_indices?: number[];
	indices?: number[];
	match?: string;
	start_index?: number;
	type: EntityType;
	value: GrammarMatchInterface[] | string | number;
}

type OsisEntityInterface = {
	enclosed_indices?: number[];
	end?: StartEndInterface;
	// TODO is there a better way to do this?
	entities: EntityCollection[] | OsisEntityInterface[] | Entity[];
	entity_id: number;
	indices: number[];
	is_enclosed_last?: boolean;
	osis: string;
	start?: StartEndInterface;
	translations: string[];
	type?: string;
}

type PassageEntityInterface = any;

interface IndicesInterface {
	start: number;
	end: number;
	index: number;
}

interface ContextInterface {
	b?: string;
	c?: number;
	v?: number;
	translations?: TranslationSequenceInterface[];
}

interface AddBooksInterface {
	books: BookPattern[];
}

interface BookPattern {
	insert_at?: string;
	osis: string[];
	regexp: regexp;
	pre_regexp?: regexp;
	post_regexp?: regexp;
}

interface BCVRegExpsManagerInterface {
	filtered_books_flags: string;
}

interface BCVTranslationsManagerInterface {

}

interface AddTranslationsInterface {
	translations: AddTranslationInterface[];
	insert_at?: "start" | "end"; // "start" is the default
	pre_regexp?: RegExp; // "" is the default
	post_regexp?: RegExp; // "(?![\p{L}\p{N}]" is the default}
	systems?: {
		[key: string]: AddTranslationVersificationInterface;
	}
}

interface AddTranslationInterface {
	osis?: string;
	system?: string;
	text: string;
}

interface AddTranslationVersificationInterface {
	books?: string[];
	chapters?: { [key: string]: number[] };
}

interface TranslationDefinition {
	books?: { [key: string]: number };
	chapters?: { [key: string]: number[] };
}

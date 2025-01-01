/*
This class takes a string and identifies Bible passage references in that string. It's designed to handle how people actually type Bible passages and tries fairly hard to make sense of dubious possibilities.

The aggressiveness is tunable, to a certain extent, using the below `options`. It's probably too aggressive for general text parsing (the "is 2" in "There is 2 much" becomes "Isa.2", for example).
*/

interface OsisAndIndicesInterface {
	osis: string;
	indices: number[];
	translations: string[]
}

interface ParsedEntityInterface {
	osis: string;
	indices: number[];
	translations: string[];
	entity_id: number;
	entities: unknown[];
}

interface BCVParserConstructor {
	grammar: unknown;
	regexps: BCVRegExpsInterface;
	translations: BCVTranslationsInterface;
}

import { BCVParserOptions, PartialOptions, EntityCollection, BCVParserInterface, PublicTranslationInterface, OsisEntityInterface, StartEndInterface, Entity, GrammarMatchInterface, BCVRegExpsInterface, BCVPassageInterface, BCVTranslationsInterface, PassagePattern } from "./types";
import bcv_matcher from "./bcv_matcher";
import bcv_options from "./bcv_options";
import bcv_passage from "./bcv_passage";
import bcv_regexps_manager from "./bcv_regexps_manager";

export class bcv_parser implements BCVParserInterface {

public passage: BCVPassageInterface = new bcv_passage();
public regexps: BCVRegExpsInterface;
public options: BCVParserOptions;
private entities: EntityCollection[] = [];
public translations: BCVTranslationsInterface;
private matcher;
private regexps_manager: BCVRegExpsManagerInterface;

constructor(lang: BCVParserConstructor | null = null) {
	// Make sure everything is kept in sync between these objects.
	this.options = new bcv_options(this);
	if (lang == null) {
		if (typeof grammar === "undefined") {
			throw(`When creating a new bcv_parser object using ES Modules, please provide a language object. For example, here's how to provide English:\nimport * as lang from "es/lang/en.js";\nconst bcv = new bcv_parser(lang);`)
		}
		this.translations = new bcv_translations();
		this.matcher = new bcv_matcher(this, grammar);
		this.regexps = new bcv_regexps();
		this.translations = new bcv_translations();
	} else {
		this.matcher = new bcv_matcher(this, lang.grammar);
		this.regexps = new lang.regexps();
		this.translations = new lang.translations();
	}
	this.passage.translations = this.translations;
	this.passage.options = this.options;
	this.regexps_manager = new bcv_regexps_manager(this);
}

// ## Parse-Related Functions
// Parse a string and prepare the object for further interrogation, depending on what's needed.
public parse(s: string): this {
	this.reset();
	// Replace any control characters already in the string.
	s = this.matcher.replace_control_characters(s);
	// Get a string representation suitable for passing to the parser.
	[s, this.passage.books] = this.matcher.match_books(s);
	// Replace potential BCVs one at a time to reduce processing time on long strings.
	[this.entities] = this.matcher.match_passages(s);
	// Allow chaining.
	return this;
}

// Parse a string and prepare the object for further interrogation, depending on what's needed. The second argument is a string that serves as the context for the first argument. If there's a valid partial match at the beginning of the first argument, then it will parse it using the supplied `context`. For example, `parse_string_with_context("verse 2", "Genesis 3").osis()` = `Gen.3.2`. You'd use this when you have some text that looks like it's a partial reference, and you already know the context.
public parse_with_context(s: string, context: string): this {
	// First parse the context.
	this.reset();
	[context, this.passage.books] = this.matcher.match_books(this.matcher.replace_control_characters(context));
	let entities;
	[entities, context] = this.matcher.match_passages(context);
	// Then parse the desired string.
	this.reset();
	// Replace any control characters already in the string.
	s = this.matcher.replace_control_characters(s);
	// Get a string representation suitable for passing to the parser.
	[s, this.passage.books] = this.matcher.match_books(s);
	this.passage.books.push({
		value: "",
		parsed: "",
		start_index: 0,
		type: "context",
		context: context
	});
	// Reconstruct the string, adding in the context. Because we've already called `match_books`, the resulting offsets will reflect the original string and not the new string.
	s = "\x1f" + (this.passage.books.length - 1) + "/9\x1f" + s;
	// Replace potential BCVs one at a time to reduce processing time on long strings.
	[this.entities] = this.matcher.match_passages(s);
	// Allow chaining.
	return this;
}

private reset(): void {
	this.entities = [];
	this.passage.books = [];
	this.passage.indices = {};
}

// ## Options-Related Functions
// Override default options.
public set_options(options: PartialOptions): this {
	// Support legacy option format.
	if (options.include_apocrypha != null) {
		// Also handles updating the necessary objects.
		this.include_apocrypha(options.include_apocrypha);
		delete options.include_apocrypha;
	}
	for (const [key, value] of Object.entries(options)) {
		// The drawback with this approach is that setting `testaments`, `versification_system`, and `case_sensitive` could regenerate `this.regexps.books` three times.
		if (typeof this.options[key as keyof BCVParserOptions] === "string") {
			// TODO: I'm not sure how to fix this Typescript error.
			this.options[key] = value;
		}
	}
	// Allow chaining.
	return this;
}

// Legacy way to indicate that the Apocrypha should be included in the list of books.
public include_apocrypha(arg: boolean): this {
	const old_value = this.options.testaments;
	let new_value = old_value;
	if (arg === true && old_value.indexOf("a") === -1) {
		// Typescript doesn't like just doing `+= "a"` here.
		new_value = new_value + "a" as BCVParserOptions["testaments"];
	// Check for `1` instead of `0` here because we don't want to end up with an empty string. There always needs to be at least one testament.
	} else if (arg === false && old_value.indexOf("a") >= 1) {
		// `a` is always at the end, so we can just remove the last character.
		new_value = new_value.slice(0, -1) as BCVParserOptions["testaments"];
	}
	if (new_value !== old_value) {
		this.options.testaments = new_value;
	}
	return this;
}

// ## Administrative Functions
// Return translation information so that we don't have to reach into semi-private objects to grab the data we need.
public translation_info(new_translation: VersificationSystem = "default"): PublicTranslationInterface {
	if (typeof new_translation !== "string" || !new_translation) {
		new_translation = "default";
	}
	// Resolve alias if applicable
	if (this.translations.aliases[new_translation]?.alias) {
		new_translation = this.translations.aliases[new_translation].alias!;
	}
	// Use "default" if there's no other fallback.
	if (this.translations.definitions[new_translation] == null) {
		if (this.options.warn_level === "warn") {
			console.warn(`Unknown translation "new_translation" in translation_info(). Using default instead.`);
		}
		new_translation = "default";
	}
	const old_translation = this.options.versification_system;
	// Switch to the new versification system if necessary. By doing it this way, we can iterate through the `current` key and ensure we always have all the data for the translation.
	this.options.versification_system = new_translation;
	const out: PublicTranslationInterface = {
		alias: new_translation,
		books: [],
		chapters: structuredClone(this.translations.definitions.current!.chapters!),
		order: structuredClone(this.translations.definitions.current!.order!)
	};
	// Populate books array based on the order defined in `order`.
	for (const [book, id] of Object.entries(out.order)) {
		out.books[id - 1] = book;
	}
	// Revert to the old versification system if it was changed to get this info.
	if (new_translation !== old_translation) {
		this.options.versification_system = old_translation;
	}
	return out;
}

// ## Output-Related Functions
// Return a single OSIS string (comma-separated) for all the references in the whole input string.
public osis(): string {
	const out: string[] = [];
	for (const osis of this.parsed_entities()) {
		if (osis.osis.length > 0) {
			out.push(osis.osis);
		}
	}
	return out.join(",");
}

// Return an array of `[OSIS, TRANSLATIONS]` for each reference (combined according to various options).
public osis_and_translations(): string[][] {
	const out: [string, string][] = [];
	for (const osis of this.parsed_entities()) {
		if (osis.osis.length > 0) {
			out.push([osis.osis, osis.translations.join(",")]);
		}
	}
	return out;
}

// Return an array of `{osis: OSIS, indices:[START, END], translations: [TRANSLATIONS]}` objects for each reference (combined according to `options`).
public osis_and_indices(): OsisAndIndicesInterface[] {
	const out: OsisAndIndicesInterface[] = [];
	for (const osis of this.parsed_entities()) {
		if (osis.osis.length > 0) {
			out.push({
				osis: osis.osis,
				translations: osis.translations,
				indices: osis.indices,
			});
		}
	}
	return out;
}

// Return all objects, probably for additional processing.
public parsed_entities(): ParsedEntityInterface[] {
	let out: OsisEntityInterface[] = [];
	this.entities.forEach((entity, entity_id) => {
		// Be sure to include any translation identifiers in the indices we report back, but only if the translation immediately follows the previous entity.
		if (
			entity.type &&
			entity.type === "translation_sequence" &&
			out.length > 0 &&
			entity_id === out[out.length - 1].entity_id + 1
			) {
			out[out.length - 1].indices[1] = entity.absolute_indices[1];
		}
		// Skip entities that don't have passages (such as `stop`).
		if (entity.passages == null) {
			return;
		}
		// Skip certain types of entities based on the configured strategy.
		if (
			(entity.type === "b" && this.options.book_alone_strategy === "ignore") ||
			(entity.type === "b_range" && this.options.book_range_strategy === "ignore") ||
			entity.type === "context"
		) {
			return;
		}
		// A given entity, even if part of a sequence, always only has one set of translations associated with it.
		let translations: string[] = [];
		let translation_alias = "";
		if (entity.passages[0].translations) {
			for (const translation of entity.passages[0].translations) {
				const translation_osis = (translation.osis && translation.osis.length > 0) ? translation.osis : "";
				if (translation_alias === "") {
					translation_alias = translation.alias;
				}
				translations.push(translation_osis);
			}
		} else {
			translations = [""];
			translation_alias = "current";
		}
		let osises = this.parse_entity_passages(entity, entity_id, translations, translation_alias);
		// Don't return an empty object if no passages are left. Skip to the next forEach iteration.
		if (osises.length === 0) {
			return;
		}
		// Combine consecutive passages if configured.
		if (osises.length > 1 && this.options.consecutive_combination_strategy === "combine") {
			osises = this.combine_consecutive_passages(osises, translation_alias);
		}
		// If sequence combination strategy is set to "separate", return each osis separately.
		if (this.options.sequence_combination_strategy === "separate") {
			out = out.concat(osises);
		} else {
			// Otherwise, combine them into a single OSIS string with comma separation.
			const strings: string[] = [];
			const last_i = osises.length - 1;
			// If the last passage is enclosed, adjust the entity's end index accordingly.
			if (osises[last_i].enclosed_indices && osises[last_i].enclosed_indices[1] >= 0) {
				entity.absolute_indices[1] = osises[last_i].enclosed_indices[1];
			}
			for (const osis of osises) {
				if (osis.osis.length > 0) {
					strings.push(osis.osis);
				}
			}
			out.push({
				osis: strings.join(","),
				indices: entity.absolute_indices,
				translations: translations,
				entity_id: entity_id,
				entities: osises
			});
		}
	});
	return out;
}

private parse_entity_passages(entity: EntityCollection, entity_id: number, translations: string[], translation_alias: string): OsisEntityInterface[] {
	const osises: OsisEntityInterface[] = [];
	const length = entity.passages!.length;
	const include_old_testament = (this.options.testaments.indexOf("o") >= 0);
	// Process each passage inside the entity
	entity.passages!.forEach((passage, i) => {
		// The `type` is usually only set in a sequence.
		if (!passage.type) {
			passage.type = entity.type;
		}
		// Handle invalid passages according to the strategies.
		if (passage.valid.valid === false) {
			if (this.options.invalid_sequence_strategy === "ignore" && entity.type === "sequence") {
				this.snap_sequence("ignore", entity, osises, i, length);
			}
			// Stop here if we're ignoring invalid passages.
			if (this.options.invalid_passage_strategy === "ignore") {
				// Skip the rest of this forEach loop.
				return;
			}
		}
		// If indicated in `this.options`, exclude stray start/end books, resetting the parent indices as needed.
		if (
			(passage.type === "b" || passage.type === "b_range") &&
			this.options.book_sequence_strategy === "ignore" &&
			entity.type === "sequence"
		) {
			this.snap_sequence("book", entity, osises, i, length);
			// Skip the rest of this forEach loop.
			return;
		}
		// If we want to exclude the Old Testament, then make sure to only include psalms if the range includes Psalm 151. These entities aren't excluded earlier because we do want to match Psalm 151 (just not the rest of the Psalms). This case only happens if `this.options.testaments` is `na`, `n`, or `a`.
		if (
				include_old_testament === false &&
				(passage.start.b === "Ps" &&
				(passage.start.c != null && passage.start.c < 151) &&
				passage.end.b === "Ps" &&
				(passage.end.c != null && passage.end.c < 151))
			) {
				return;
			}
		if (
			(passage.type === "b_range_start" || passage.type === "range_end_b") &&
			this.options.book_range_strategy === "ignore"
		) {
			this.snap_range(entity, i);
		}
		if (!passage.absolute_indices) {
			passage.absolute_indices = [...entity.absolute_indices];
		}
		osises.push({
			osis: passage.valid.valid ? this.to_osis(passage.start, passage.end, translation_alias) : "",
			type: passage.type,
			indices: passage.absolute_indices,
			translations,
			start: passage.start,
			end: passage.end,
			enclosed_indices: passage.enclosed_absolute_indices,
			entity_id,
			entities: [passage]
		});
	});
	return osises;
}

// Takes OSIS objects and converts them to OSIS strings based on compaction preferences.
private to_osis(start: StartEndInterface, end: StartEndInterface, translation: string): string {
	// If it's just a book on its own, how we deal with it depends on whether we want to return just the first chapter or the complete book.
	if (
		end.c == null && end.v == null &&
		start.c == null && start.v == null &&
		start.b === end.b &&
		this.options.book_alone_strategy === "first_chapter"
	) {
		end.c = 1;
	}
	const osis = { start: "", end: "" };
	// If no start chapter or verse, assume the first possible.
	if (start.c == null) {
		start.c = 1;
	}
	if (start.v == null) {
		start.v = 1;
	}
	// Handle Psalm 151 if the Apocrypha is included and it should be treated as a book. I.e., change the book from `Ps` to `Ps151`.
	if (
		this.options.versification_system.indexOf("a") >= 0 &&
		this.options.ps151_strategy === "b" &&
		((start.c === 151 && start.b === "Ps") || (end.c === 151 && end.b === "Ps"))
	) {
		this.fix_ps151(start, end, translation);
	}
	const chapter_array = this.passage.translations.definitions[translation]?.chapters[end.b] || this.passage.translations.definitions.current.chapters[end.b];
	// If no end chapter or verse, assume the last possible. If it's a single-chapter book, always use the first chapter for consistency with other `passage_existence_strategy` results (which do respect the single-chapter length).
	if (end.c == null) {
		if (
			this.options.passage_existence_strategy.indexOf("c") >= 0 ||
			(chapter_array && chapter_array.length === 1)
		) {
			end.c = chapter_array.length;
		} else {
			end.c = 999;
		}
	}
	if (end.v == null) {
		if (chapter_array && chapter_array[end.c! - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
			end.v = chapter_array[end.c! - 1];
		} else {
			end.v = 999;
		}
	}
	// If it's a complete book or range of complete books and we want the shortest possible OSIS, return just the book names. The `end.c` and `end.v` equaling 999 is for when the `passage_existence_strategy` sets them to 999, indicating that we should treat it as a complete book or chapter.
	if (
		this.options.osis_compaction_strategy === "b" &&
		start.c === 1 &&
		start.v === 1 &&
		(
			(end.c === 999 && end.v === 999) ||
			(
				end.c === chapter_array.length &&
				this.options.passage_existence_strategy.indexOf("c") >= 0 &&
				(
					end.v === 999 ||
					(
						end.v === chapter_array[end.c! - 1] &&
						this.options.passage_existence_strategy.indexOf("v") >= 0
					)
				)
			)
		)
	) {
		// Just return the books.
		osis.start = start.b;
		osis.end = end.b;
	}
	// If it's a complete chapter or range of complete chapters and we want a short OSIS, return just the books and chapters. We only care when `osis_compaction_strategy` isn't `bcv` (i.e., length 3) because `bcv` is always fully specified.
	else if (
		this.options.osis_compaction_strategy.length <= 2 &&
		start.v === 1 &&
		(
			end.v === 999 ||
			(
				end.v === chapter_array[end.c! - 1] &&
				this.options.passage_existence_strategy.indexOf("v") >= 0
			)
		)
	) {
		// Return just the books and chapters.
		osis.start = start.b + "." + start.c;
		osis.end = end.b + "." + end.c;
	}
	// Otherwise, return the full BCV reference.
	else {
		osis.start = start.b + "." + start.c + "." + start.v;
		osis.end = end.b + "." + end.c + "." + end.v;
	}
	// If it's the same verse ("Gen.1.1-Gen.1.1"), chapter ("Gen.1-Gen.1") or book ("Gen-Gen"), return just the start so we don't end up with an empty range.
	let out = "";
	if (osis.start === osis.end) {
		out = osis.start;
	} else {
		// Otherwise return a range.
		out = osis.start + "-" + osis.end;
	}
	if (start.extra) {
		out = start.extra + "," + out;
	}
	if (end.extra) {
		out += "," + end.extra;
	}
	return out;
}

// If we want to treat Ps151 as a book rather than a chapter, we have to do some gymnastics to make sure it returns properly.
private fix_ps151(start: StartEndInterface, end: StartEndInterface, translation: string): void {
	// First set up the versification so that we know we have all the data we need.
	const old_versification_system = this.options.versification_system;
	this.options.versification_system = translation;
	const new_versification_system = this.options.versification_system;
	if (start.c === 151 && start.b === "Ps") {
		// If the whole range is in Ps151, we can just reset both sets of books and chapters; we don't have to worry about odd ranges.
		if (end.c === 151 && end.b === "Ps") {
			start.b = "Ps151";
			start.c = 1;
			end.b = "Ps151";
			end.c = 1;
			// Otherwise, we generate the OSIS for Ps151 and then set the beginning of the range to the next book. We assume that the next book is Prov, which isn't necessarily the case. I'm not aware of a canon that doesn't place Prov after Ps, however.
		} else {
			// This is the string we're going to prepend to the final output. We made sure it's defined in `this.translation.definitions` earlier in this function.
			start.extra = this.to_osis(
				{ b: "Ps151", c: 1, v: start.v },
				{ b: "Ps151", c: 1, v: this.translations.definitions.current.chapters!["Ps151"][0] },
				translation
			);
			// Assume the next book is Proverbs.
			start.b = "Prov";
			start.c = 1;
			start.v = 1;
		}
	// We know that end is in Ps151 and start is beforehand.
	} else {
		// This is the string we're going to append to the final output.
		end.extra = this.to_osis(
			{ b: "Ps151", c: 1, v: 1 },
			{ b: "Ps151", c: 1, v: end.v },
			translation
		);
		// Set the end of the range to be the end of Ps.150, which immediately precedes Ps151.
		end.c = 150;
		end.v = this.translations.definitions.current.chapters!["Ps"][149];
	}
	if (old_versification_system !== new_versification_system) {
		this.options.versification_system = old_versification_system;
	}
}

// If we have the correct `option` set (checked before calling this function), merge passages that refer to sequential verses: Gen 1, 2 -> Gen 1-2. It works for any combination of books, chapters, and verses.
private combine_consecutive_passages(osises: any,  translation: string): any {
	const out: OsisEntityInterface[] = [];
	let prev: Partial<StartEndInterface> = {};
	const last_i = osises.length - 1;
	let enclosed_sequence_start = -1;
	let has_enclosed = false;
	osises.forEach((osis, i) => {
		if (osis.osis.length > 0) {
			const prev_i = out.length - 1;
			let is_enclosed_last = false;
			// Record the start index of the enclosed sequence for use in future iterations.
			if (osis.enclosed_indices[0] !== enclosed_sequence_start) {
				enclosed_sequence_start = osis.enclosed_indices[0];
			}
			// If we're in an enclosed sequence and it's either the last item in the sequence or the next item in the sequence isn't part of the same enclosed sequence, then we've reached the end of the enclosed sequence.
			if (
				enclosed_sequence_start >= 0 &&
				(i === last_i || osises[i + 1].enclosed_indices[0] !== osis.enclosed_indices[0])
			) {
				is_enclosed_last = true;
				// We may need to adjust the indices later.
				has_enclosed = true;
			}
			// Pretend like the previous `end` and existing `start` don't exist.
			if (this.is_verse_consecutive(prev, osis.start, translation)) {
				out[prev_i].end = osis.end;
				// Set the enclosed indices if it's last or at the end of a sequence of enclosed indices. Otherwise only extend the indices to the actual indices--e.g., `Ps 117 (118, 120)`, should only extend to after `118`.
				out[prev_i].is_enclosed_last = is_enclosed_last;
				out[prev_i].indices[1] = osis.indices[1];
				out[prev_i].enclosed_indices![1] = osis.enclosed_indices[1];
				out[prev_i].osis = this.to_osis(out[prev_i].start!, osis.end, translation);
			} else {
				out.push(osis);
			}
			prev = { b: osis.end.b, c: osis.end.c, v: osis.end.v };
		} else {
			// If there's no OSIS string, just push and reset `prev`.
			out.push(osis);
			prev = {};
		}
	});
	// If we encountered enclosed sequences, we may need to adjust indices.
	if (has_enclosed) {
		this.snap_enclosed_indices(out);
	}
	return out;
}

// If there's an enclosed reference--e.g., Ps 1 (2)--and we've combined consecutive passages in such a way that the enclosed reference is fully inside the sequence (i.e., if it starts before the enclosed sequence), then make sure the end index for the passage includes the necessary closing punctuation.
private snap_enclosed_indices(osises: OsisEntityInterface[]): OsisEntityInterface[] {
	for (const osis of osises) {
		if (osis.is_enclosed_last != null) {
			if (osis.enclosed_indices![0] < 0 && osis.is_enclosed_last) {
				osis.indices[1] = osis.enclosed_indices![1];
			}
			delete osis.is_enclosed_last;
		}
	}
	return osises;
}

/* Given two fully specified objects (complete bcvs), find whether they're sequential.
* Same book, same chapter, and next verse (e.g., Gen.1.1 followed by Gen.1.2)
* Same book, next chapter, and first verse if the previous chapter ended properly (e.g., Gen.1.31 followed by Gen.2.1)
* Next book, first chapter, and first verse if the previous book ended properly (e.g., Mal.4.6 followed by Matt.1.1)
*/
private is_verse_consecutive(prev: Partial<StartEndInterface>, check: StartEndInterface, translation: string): boolean {
	if (!prev.b) {
		return false;
	}
	// A translation doesn't always have an `order` set. If it doesn't, then use the current order.
	const translation_order = this.passage.translations.definitions[translation]?.order 
		|| this.passage.translations.definitions.current.order;
	const chapter_array = this.passage.translations.definitions[translation]?.chapters?.[prev.b] || this.passage.translations.definitions.current.chapters[prev.b];
	// Same book.
	if (prev.b === check.b) {
		// Same chapter, consecutive verse.
		if (prev.c === check.c) {
			return (prev.v! === check.v! - 1);
		} else if (check.v === 1 && prev.c === check.c! - 1) {
			// Same book, next chapter, and we're at the first verse of that chapter. Check if prev ended at the last verse of the previous chapter.
			const prev_chapter_verse_count = chapter_array[prev.c - 1];
			return (prev.v === prev_chapter_verse_count);
		}
	// Next book in order, first chapter, first verse.
	} else if (
		check.c === 1 &&
		check.v === 1 &&
		translation_order[prev.b] === translation_order[check.b] - 1
	) {
		// Check if prev ended at the last verse of the last chapter of its book.
		return (
			prev.c === chapter_array.length &&
			prev.v === chapter_array[prev.c! - 1]
		);
	}
	return false;
}

// Snap the start/end index of the range when it includes a book on its own and `this.options.book_range_strategy` is `ignore`.
private snap_range(entity: EntityCollection, passage_i: number): EntityCollection {
	// Default: if the book is at the end of the range, we want to ignore the end of the range.
	let entity_i = 0;
	let source_entity = "start";
	let type = "range_end_b";
	// If we previously went through this process (i.e., `this.parsed_entities()` was called multiple times), then restore the original type. Otherwise, the `b_range_start` logic below doesn't necessarily hold, leading to a crash.
	if (entity.original_type === "b_range_start") {
		entity.type = entity.original_type;
		delete entity.original_type;
	}
	// If the book is at the start of the range, we want to ignore the first part of the range.
	if (
		entity.type === "b_range_start" ||
		(entity.type === "sequence" && entity.passages![passage_i].type === "b_range_start")
		) {
			entity_i = 1;
			source_entity = "end";
			type = "b_range_start";
	}
	const target_entity = (source_entity === "end") ? "start" : "end";
	// Restore the original objects if they're available. We're potentially changing the main object's values in a way that would affect the outcome if we parse this same object multiple times.
	for (const obj_type of [source_entity, target_entity]) {
		if (entity.passages[passage_i][obj_type].original_object != null) {
			entity.passages[passage_i][obj_type] = entity.passages[passage_i][obj_type].original_object;
		}
	}
	// Get ready to preserve the original target object.
	const original_target = structuredClone(entity.passages[passage_i][target_entity]);
	// Rewrite either the start or the end of the range to match the opposite. In effect, we're changing it from a range to a single point.
	entity.passages[passage_i][target_entity] = structuredClone(entity.passages[passage_i][source_entity]);
	// Now preserve the original target object in the new target object.
	entity.passages[passage_i][target_entity].original_object = original_target;
	// Preserve the original source object.
	entity.passages[passage_i][source_entity].original_object = structuredClone(entity.passages[passage_i][source_entity]);
	if (entity.type === "sequence") {
		// This can be too long if a range is converted into a sequence where it ends with an open book range (`Matt 10-Rev`) that we want to ignore. At this point, the `passages` and `value` keys can get out-of-sync.
		if (passage_i >= entity.value.length) {
			passage_i = entity.value.length - 1;
		}
		// In a sequence, the `entity.value` is an array.
		const pluck = this.passage.pluck(type, entity.value[passage_i] as GrammarMatchInterface[]);
		// `pluck` can be null if we've already overwritten its `type` in a previous recursion. This process is unusual, but can happen in something like "Proverbs 31:2. Vs 10 to dan".
		if (pluck != null) {
			const temp = this.snap_range(pluck, 0);
			// Move the indices to exclude what we've omitted. We want to move it even if it isn't the last one in case there are multiple books at the end--this way it'll use the correct indices.
			if (passage_i === 0) {
				entity.absolute_indices[0] = temp.absolute_indices[0];
			} else {
				entity.absolute_indices[1] = temp.absolute_indices[1];
			}
		}
	// If it's not a sequence, change the `type` and `absolute_indices` to exclude the book we're omitting.
	} else {
		entity.original_type = entity.type;
		entity.type = (entity.value[entity_i] as GrammarMatchInterface).type;
		entity.absolute_indices = [
			(entity.value[entity_i] as GrammarMatchInterface).absolute_indices![0],
			(entity.value[entity_i] as GrammarMatchInterface).absolute_indices![1]
		];
	}
	return entity;
}

// Snap the start/end index of the entity or surrounding passages when there's a lone book or invalid item in a sequence.
private snap_sequence(type: string, entity: EntityCollection, osises: OsisEntityInterface[], i: number, length: number): void {
	const passage = entity.passages![i];
	/* If the passage is the first thing in the sequence and something is after it, snap the start index of the whole entity to the start index of the next item.

	But we only want to do this if it's followed by a book (if it's "Matt, 5", we want to be sure to include "Matt" as part of the indices and bypass this step). We can tell if that's the case if the `type` of what follows starts with `b` or if it's a `range` starting in a different book. The tricky part occurs when we have several invalid references at the start (Matt 29, 30, Acts 1)--we need to find the first value that's a book. If there's a valid item before the next book, abort.
	*/
	if (
		passage.absolute_indices![0] === entity.absolute_indices[0] &&
		i < length - 1 &&
		this.get_snap_sequence_i(entity.passages, i, length) !== i
	) {
		entity.absolute_indices[0] = entity.passages![i + 1].absolute_indices![0];
		this.remove_absolute_indices(entity.passages!, i + 1);
	}
	// If the passage is the last thing in a sequence (but not the only one), snap the entity end index to the end index of the previous valid item. To handle multiple items at the end, snap back to the last known good item if available.
	else if (passage.absolute_indices![1] === entity.absolute_indices[1] && i > 0) {
		entity.absolute_indices[1] = (osises.length > 0)
			? osises[osises.length - 1].indices[1]
			: entity.passages![i - 1].absolute_indices![1];
	}
	// Otherwise, if the next item doesn't start with a book, link the start index of the current passage to the next one because we're including the current passage as part of the next one. In "Eph. 4. Gen, Matt, 6", the `Matt, ` should be part of the `6`, but "Eph. 4. Gen, Matt, 1cor6" should exclude `Matt`.
	else if (
		type === "book" &&
		i < length - 1 &&
		!this.starts_with_book(entity.passages![i + 1])
		) {
			entity.passages![i + 1].absolute_indices![0] = passage.absolute_indices![0];
	}
}

// Identify whether there are any valid items between the current item and the next book.
private get_snap_sequence_i(passages: any, passage_i: number, length: number): number {
	for (let i = passage_i + 1; i < length; i++) {
		if (this.starts_with_book(passages[i])) {
			return i;
		}
		if (passages[i].valid.valid) {
			return passage_i;
		}
	}
	return passage_i;
}

// Given a passage, does it start with a book? It never takes a sequence as an argument.
private starts_with_book(passage: Entity): boolean {
	if (passage.type!.substring(0, 1) === "b") {
		return true;
	}
	if ((passage.type === "range" || passage.type === "ff") &&
		passage.start &&
		passage.start.type &&
		passage.start.type.substring(0, 1) === "b") {
		return true;
	}
	return false;
}

// Remove absolute indices from the given passage to the end of the sequence. We do this when we don't want to include the end of a sequence in the sequence (most likely because it's invalid or a book on its own).
private remove_absolute_indices(passages: Entity[], passage_i: number): void {
	if (passages[passage_i].enclosed_absolute_indices![0] < 0) {
		return;
	}
	const [start, end] = passages[passage_i].enclosed_absolute_indices as number[];
	const passages_length = passages.length;
	for (const passage of passages.slice(passage_i)) {
		if (passage.enclosed_absolute_indices![0] === start && passage.enclosed_absolute_indices![1] === end) {
			passage.enclosed_absolute_indices = [-1, -1];
		} else {
			break;
		}
	}
}

public add_passage_patterns(patterns: PassagePattern[]) {
	return this.regexps_manager.add_passage_patterns(patterns);
}

}

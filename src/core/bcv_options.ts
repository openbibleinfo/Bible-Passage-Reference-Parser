// This class handles the options for the `bcv_parser` and `bcv_passage` options. All properties can be changed directly by setting; `set` functions handle logic as necessary.

import { BCVParserOptions } from "./types";

export default class bcv_options implements BCVParserOptions {

private parent;
public consecutive_combination_strategy: BCVParserOptions["consecutive_combination_strategy"] = "combine";
public osis_compaction_strategy: BCVParserOptions["osis_compaction_strategy"] = "b";
public book_sequence_strategy: BCVParserOptions["book_sequence_strategy"] = "ignore";
public invalid_sequence_strategy: BCVParserOptions["invalid_sequence_strategy"] = "ignore";
public sequence_combination_strategy: BCVParserOptions["sequence_combination_strategy"] = "combine";
public invalid_passage_strategy: BCVParserOptions["invalid_passage_strategy"] = "ignore";
public non_latin_digits_strategy: BCVParserOptions["non_latin_digits_strategy"] = "ignore";
// This one is shared between `this` and `bcv_passage`.
public passage_existence_strategy: BCVParserOptions["passage_existence_strategy"] = "bcv";
public book_alone_strategy: BCVParserOptions["book_alone_strategy"] = "ignore";
public book_range_strategy: BCVParserOptions["book_range_strategy"] = "ignore";
public captive_end_digits_strategy: BCVParserOptions["captive_end_digits_strategy"] = "delete";
public ps151_strategy: BCVParserOptions["ps151_strategy"] = "c";
public zero_chapter_strategy: BCVParserOptions["zero_chapter_strategy"] = "error";
public zero_verse_strategy: BCVParserOptions["zero_verse_strategy"] = "error";
public single_chapter_1_strategy: BCVParserOptions["single_chapter_1_strategy"] = "chapter";
public end_range_digits_strategy: BCVParserOptions["end_range_digits_strategy"] = "verse";
public warn_level: BCVParserOptions["warn_level"] = "none";

constructor(parent) {
	this.parent = parent;
	this.#grammar.cv_sep = this.#grammar.cv_sep_us;
	this.#grammar.sequence = this.#grammar.sequence_us;
}

#testaments: BCVParserOptions["testaments"] = "on";
get testaments(): BCVParserOptions["testaments"] {
	return this.#testaments;
}
set testaments(filter: BCVParserOptions["testaments"]) {
	if (filter === this.#testaments || filter.length === 0) {
		return;
	}
	const filters = filter.split("");
	let out = "";
	// We know `filter` is at least one character long, so we don't need to check the length here.
	if (filters[0] === "o") {
		filters.shift();
		out += "o";
	}
	if (filters.length > 0 && filters[0] === "n") {
		filters.shift();
		out += "n";
	}
	if (filters.length > 0 && filters[0] === "a") {
		// No need to `shift` here since we're not going to do anything else with the array.
		out += "a";
	}
	if (out.length > 0 && out !== this.#testaments) {
		const new_apocrypha = out.indexOf("a") >= 0;
		const old_apocrypha = this.#testaments.indexOf("a") >= 0;
		this.#testaments = out as BCVParserOptions["testaments"];
		if (new_apocrypha !== old_apocrypha) {
			this.set_apocrypha(new_apocrypha);
		} else {
			// This is otherwise called in `this.set_apocrypha`.
			this.parent.regexps_manager.filter_books(this.#testaments, this.case_sensitive);
		}
	}
}

// Whether to use books and abbreviations from the Apocrypha. This function makes sure books from the Apocrypha are available as options and adjusts the Psalms to include Psalm 151. It takes a boolean argument: `true` to include the Apocrypha and `false` to not. Defaults to `false`.
set_apocrypha(include_apocrypha: boolean) {
	this.parent.regexps_manager.filter_books(this.#testaments, this.case_sensitive);
	for (const translation of Object.keys(this.parent.translations.systems)) {
		// Ensure the `chapters` object exists for this translation before writing to it.
		this.parent.translations.systems[translation].chapters ??= {};
		this.parent.translations.systems[translation].chapters["Ps"] ??= [ ...this.parent.translations.systems.current.chapters!["Ps"] ]
		// Add Ps 151 to the end of Psalms. The assumptions here are that Ps151 always only is one chapter long and that the initial state of `Ps` is 150 chapters.
		if (include_apocrypha === true) {
			this.parent.translations.systems[translation].chapters["Ps"][150] = this.parent.translations.systems[translation].chapters["Ps151"]?.[0] ?? this.parent.translations.systems.current.chapters["Ps151"][0];
		} else if (this.parent.translations.systems[translation].chapters?.["Ps"].length === 151) {
			// Remove Ps 151 from the end of Psalms.
			this.parent.translations.systems[translation].chapters["Ps"].pop();
		}
	}
}

public get versification_system() {
	return this.parent.translations.current_system;
}
// Use an alternate versification system. Takes a string argument; the built-in options are: `default` to use ESV-style versification and `vulgate` to use the Vulgate (Greek) Psalm numbering. English offers several other versification systems; see the Readme for details.
public set versification_system(system: string) {
	// If there's a known versification for the given translation, use that.
	if (this.parent.translations.aliases[system]?.system) {
		system = this.parent.translations.aliases[system].system;
	}
	// If there's no definition for the given system, assume the default.
	if (!this.parent.translations.systems[system]) {
		if (this.warn_level === "warn") {
			console.warn(`Unknown versification system ("${system}"). Using default instead.`)
		}
		system = "default";
	}
	if (!system || system === this.parent.translations.current_system) {
		return;
	}
	// Reset the default system so that we get into a known good state.
	if (this.parent.translations.current_system !== "default") {
		this.parent.translations.systems.current = structuredClone(this.parent.translations.systems.default);
	}
	this.parent.translations.current_system = system;
	// No need to go any further if it's being reset to the default.
	if (system === "default") {
		return;
	}
	// Update the book order if necessary. The `order` key should always contain the full order; too many things can go wrong if we try to merge the old order and the new one (e.g., what if there are conflicts about which book is the first one?).
	if (this.parent.translations.systems[system].order) {
		this.parent.translations.systems.current.order = { ...this.parent.translations.systems[system].order };
	}
	// Merge the default chapter systems with any overrides if necessary.
	if (this.parent.translations.systems[system].chapters) {
		this.parent.translations.systems.current.chapters = { ...structuredClone(this.parent.translations.systems.default.chapters), ...structuredClone(this.parent.translations.systems[system].chapters) };
	}
// Depending on the order of operations, the cloned list could be inconsistent with the current state. For example, if we called `versification_system`, we've cached 150 Psalms. If we then call `include_apocrypha(true)`, we now have 151 Psalms. If we then call `versification_system` again, we're back, incorrectly, to 150 Psalms because that's what was cached.
// TODO is this actually necessary (per comment above)? It may no longer be; keeping now in case it's needed again; would need to delete short-circuit in first line of this function: this.include_apocrypha(this.#include_apocrypha);
}

#case_sensitive: BCVParserOptions["case_sensitive"] = "none";
public get case_sensitive() {
	return this.#case_sensitive;
}
// Whether to treat books as case-sensitive. Valid values are `none` and `books`.
public set case_sensitive(arg: BCVParserOptions["case_sensitive"]) {
	if (arg === this.#case_sensitive || (arg !== "none" && arg !== "books" && arg !== "translations" && arg !== "books,translations")) {
		return;
	}
	this.#case_sensitive = arg;
	this.parent.regexps_manager.filter_books(this.testaments, arg);
	this.parent.translations_manager.apply_case_sensitive(arg);
}

#grammar: BCVParserOptions["grammar"] = {
	// No leading space. This content is returned as-is with a `bcvp` `osis_compaction_strategy`.
	ab: /^[a-e](?!\p{L})/iu,
	and: /^&/,
	c_explicit: /^[\s*]*(?:chapters?|cha?pts?\.?|chaps?\.?|ch[aps]?\.?)[\s*]*/i,
	c_sep: /^\x1f\x1f\x1f/,
	cv_sep_weak: /^(?:[\s*]*["'][\s*]*|[\s*])+/,
	cv_sep_eu: /^[\s*]*,+[\s*]*/,
	cv_sep_us: /^[\s*]*(?::+|\.(?!\s*\.\s*\.))[\s*]*/i,
	ff: /^\x1f\x1f\x1f/,
	in_book_of: /^\x1f\x1f\x1f/,
	next: /^\x1f\x1f\x1f/,
	ordinal: /^\x1f\x1f\x1f/,
	range: /^[\s*]*[\-\u2013\u2014][\s*]*/,
	sequence_eu: /^(?:[;/:&\-\u2013\u2014~\s*]|\.(?!\s*\.\s*\.))+/,
	sequence_us: /^(?:[,;/:&\-\u2013\u2014~\s*]|\.(?!\s*\.\s*\.))+/,
	space: /^[\s*]+/,
	title: /^[\s*]*title[\s*]*/i,
	v_explicit: /^[\s*]*(?:verses?|ver\.?|vss?\.?|vv?\.?)[\s*]*(?!\p{L})/iu,
	// Don't set these directly; we overwrite them with the `us` or `eu` equivalents based on the `punctuation_strategy` option.
	cv_sep: /^\x1f\x1f\x1f/,
	sequence: /^\x1f\x1f\x1f/,
};
public get grammar(): BCVParserOptions["grammar"] {
	return this.#grammar;
}
// Merges existing grammar options with new ones.
public set grammar(arg: Partial<BCVParserOptions["grammar"]>) {
	this.#grammar = { ...this.#grammar, ...arg };
	// Reset the `cv_sep` and `sequence` keys in case they were set in `arg`.
	this.punctuation_strategy = this.punctuation_strategy;
}

#punctuation_strategy: BCVParserOptions["punctuation_strategy"] = "us";
public get punctuation_strategy(): BCVParserOptions["punctuation_strategy"] {
	return this.#punctuation_strategy;
}
public set punctuation_strategy(arg: BCVParserOptions["punctuation_strategy"]) {
	if (arg !== "us" && arg !== "eu") {
		if (this.warn_level === "warn") {
			console.warn(`punctuation_strategy should be set to "us" or "eu", not: ${arg}`);
		}
		return;
	}
	this.#punctuation_strategy = arg;
	this.#grammar.c_sep = this.#grammar[`c_sep_${arg}`];
	this.#grammar.cv_sep = this.#grammar[`cv_sep_${arg}`];
	this.#grammar.sequence = this.#grammar[`sequence_${arg}`];
}


}

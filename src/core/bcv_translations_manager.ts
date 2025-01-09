import { AddTranslationInterface, AddTranslationsInterface, AddTranslationVersificationInterface, BCVParserInterface, BCVTranslationsInterface, PublicTranslationInterface, TranslationDefinition, TranslationSequenceInterface } from "./types";

export default class bcv_translations_manager {
parent;

constructor(parent: BCVParserInterface) {
	this.parent = parent;
}

public translation_info(system: string = "default"): PublicTranslationInterface {
	if (typeof system !== "string" || !system) {
		system = "default";
	}
	// Resolve versification system if applicable
	if (this.parent.translations.aliases[system]?.system) {
		system = this.parent.translations.aliases[system].system;
	}
	// Use "default" if there's no other fallback.
	if (this.parent.translations.systems[system] == null) {
		if (this.parent.options.warn_level === "warn") {
			console.warn("Unknown translation `" + new_translation + "` in translation_info(). Using default instead.");
		}
		system = "default";
	}
	const old_system = this.parent.options.versification_system;
	// Switch to the new versification system if necessary. By doing it this way, we can iterate through the `current` key and ensure we always have all the data for the translation.
	this.parent.options.versification_system = system;
	const out: PublicTranslationInterface = {
		alias: system,
		books: [],
		chapters: structuredClone(this.parent.translations.systems.current.chapters),
		order: structuredClone(this.parent.translations.systems.current.order),
		system: system,
	};
	// Populate books array based on the order defined in `order`.
	for (const [book, id] of Object.entries(out.order)) {
		out.books[id - 1] = book;
	}
	// Revert to the old versification system if it was changed to get this info.
	if (system !== old_system) {
		this.parent.options.versification_system = old_system;
	}
	return out;
}

public add_translations(new_translations: AddTranslationsInterface) {
	if (new_translations?.translations == null || !Array.isArray(new_translations.translations) || new_translations.translations.length === 0) {
		throw new Error("add_translations: A `translations array in the `translations` key should have at least one object");
	}
	const normalized_translations: BCVTranslationsInterface["aliases"] = {};
	const texts_for_regexp: string[] = [];
	// Handle versification objects in this loop. We don't want to validate aliases yet because new aliases can be created during this loop.
	for (const translation of new_translations.translations) {
		const normalized_translation = this.normalize_sent_translation_data(translation);
		const insert_key = translation.text.toLowerCase();
		// Don't replace built-in systems.
		if (insert_key === "default" || insert_key === "current") {
			throw new Error("add_translations: Can't redefine `" + insert_key + "` as a translation. This built-in translation can't be redefined");
		}
		const system = normalized_translation.system;
		// If we need to add a new system, ...
		if (
			system !== "default" &&
			this.parent.translations.systems[normalized_translation.system] == null
			) {
				// ... and the system exists in what was submitted, then add it.
				if (new_translations.systems != null && new_translations.systems[system] != null) {
					// Will throw on `default` or `current`.
					this.add_system(normalized_translation.system, new_translations.systems[system]);
				// Otherwise, throw an error
				} else {
					let valid_systems = Object.keys(this.parent.translations.systems);
					valid_systems = valid_systems.filter(system => system !== "current");
					throw new Error("add_translations: Unknown translation `system`: `" + system + "`. Valid `system`s are: `" + Object.keys(valid_systems).join("`, `") + "`. You may want to check that you included this system in `systems`");
				}
		} else if (system === "current") {
			throw new Error("add_translations: Can't use `" + system + "` as a versification system for a new translation");
		}
		// If it already exists, either earlier in this loop or globally, redefine it but throw a warning, since it's probably not what's desired.
		if (normalized_translations[insert_key] != null || this.parent.translations.aliases[insert_key] != null) {
			if (this.parent.options.warn_level === "warn") {
				console.warn("add_translations: `" + translation.text + "` already exists. You probably only want to do this if the old definition was wrong");
			}
		} else {
			// Only create a new RegExp entry if it's not redefining an existing one.
			texts_for_regexp.push(translation.text);
		}
		normalized_translations[insert_key] = normalized_translation;
	}
	if (texts_for_regexp.length > 0) {
		this.add_new_translations_regexp(texts_for_regexp, new_translations);
	}
	this.parent.translations.aliases = {...normalized_translations, ...this.parent.translations.aliases};
}

// Normalizes the translation data and ensures it's valid.
private normalize_sent_translation_data(translation: AddTranslationInterface) {
	const text = translation.text;
	// An empty string isn't OK because, for specified translations, we always want to report a translation.
	if (text == null || typeof text !== "string" || text.length === 0) {
		throw new Error("add_translations: Each translation object should contain a string `text` key with a value like \"KJV\"");
	}
	if (text.match(/^\p{N}+$/u)) {
		throw new Error("add_translations: A translation.text (`" + text + "`) can't be all numbers because then it would conflict with chapter and verse references.");
	}
	// If it's an empty string, then use the uppercased version; only the default gets to omit an OSIS.
	const osis = (typeof translation.osis === "string" && translation.osis !== "") ? translation.osis : translation.text.toUpperCase();
	const system = (typeof translation.system === "string" && translation.system.length > 0) ? translation.system : "default";
	return {
		osis,
		system
	};
}

// Create the new translation definition.
private add_system(system: string, new_system: AddTranslationVersificationInterface): void {
	if (system === "default" || system === "current") {
		throw new Error("add_translations: Can't use `" + system + "` as a versification system. This built-in system can't be redefined");
	}
	if (new_system == null || (new_system.books == null && new_system.chapters == null)) {
		throw new Error("add_translations: The system object should contain `books` key, a `chapters` key or both");
	}
	// Don't redefine existing systems. This approach saves processing time if we're dealing with a lot of duplicate systems, such as if we're importing systems for a whole language at once.
	if (this.parent.translations.systems[system] != null) {
		return;
	}
	// Make sure it exists before we start writing to it.
	const out: TranslationDefinition = {};
	// Handle books.
	if (new_system.books != null) {
		if (!Array.isArray(new_system.books) || new_system.books.length === 0) {
			throw new Error("add_translations: The `books` key in each `system` object should be an array with at least one string in it");
		}
		// Transform it from an array to an object. The array-based interface is just for developer convenience; internally, we use an object.
		out.books = this.make_system_books(new_system.books);
	}
	// Handle chapters.
	if (new_system.chapters != null) {
		if (typeof new_system.chapters !== "object" || Object.keys(new_system.chapters).length === 0) {
			throw new Error("add_translations: The `chapters` key in the each `system` object should be an object with at least one key");
		}
		// Only need to validate. If it's valid, we're not transforming anything.
		this.validate_system_chapters(new_system.chapters);
		// Clone it to ensure that the original isn't accidentally edited later.
		out.chapters = structuredClone(new_system.chapters);
	}
	// Don't define it until we're sure the translations are valid. Otherwise, a caught error could lead to an incomplete state.
	this.parent.translations.systems[system] = out;
}

private make_system_books(books: string[]): {[key: string]: number} {
	// This object contains all the books we need to define.
	const all_books = structuredClone(this.parent.translations.systems.default.order);
	const new_books: {[key: string]: number} = {};
	let book_i = 1;
	for (const book of books) {
		if (typeof book !== "string" || all_books[book] == null) {
			throw new Error("add_translations: Got an unexpected OSIS value in `books` (also check for any duplicates): " + book);
		}
		delete all_books[book];
		new_books[book] = book_i;
		book_i++;
	}
	const remaining_books = Object.keys(all_books).sort((a, b) => all_books[a] - all_books[b]);
	for (const book of remaining_books) {
		new_books[book] = book_i;
		book_i++;
	}
	return new_books;
}

private validate_system_chapters(chapters: {[key: string]: number[]; }): void {
	const all_books = this.parent.translations.systems.default.order;
	for (const [book, chapter_lengths] of Object.entries(chapters)) {
		if (all_books[book] == null) {
			throw new Error("add_translations: Unexpected book: " + book);
		}
		if (!Array.isArray(chapter_lengths) || chapter_lengths.length == 0) {
			throw new Error("add_translations: Each value in `chapters` should be an array with at least one entry containing the number of verses in each chapter. Check `" + book + "`");
		}
		// Valid verse counts fall within these limits.
		for (const verse_count of chapter_lengths) {
			if (!(typeof verse_count === "number" && verse_count >= 1 && verse_count <= 200)) {
				throw new Error("add_translations: Unexpected value in `chapters`: " + verse_count + "`. It should be a number between 1 and 200");
			}
		} 
	}
}

private add_new_translations_regexp(texts_for_regexp: string[], new_translations: AddTranslationsInterface) {
	if (texts_for_regexp.length > 1) {
		texts_for_regexp = texts_for_regexp.sort((a, b) => b.length - a.length);
	}
	const insert_at = (new_translations.insert_at === "end") ? "end" : "start";
	const pre_regexp = (new_translations?.pre_regexp instanceof RegExp) ? new_translations?.pre_regexp : {source: ""}; // Make a pretend empty RegExp; otherwise, it's `(?:)`.
	const post_regexp = (new_translations?.post_regexp instanceof RegExp) ? new_translations?.post_regexp : /(?![\p{L}\p{N}])/u;
	// RegExp.escape() would be better here, but it's not supported in ES2022. Prevent any RegExp-specific characters (with parentheses the most likely) from breaking the RegExp.
	const regexp = new RegExp(pre_regexp.source + "(" + texts_for_regexp.map((translation) => translation.replace(/([$\\.*+?()\[\]{}|^])/g, "\\$1")).join("|") + ")" + post_regexp.source, "gi");
	if (insert_at === "start") {
		this.parent.regexps.translations.unshift(regexp);
	} else {
		this.parent.regexps.translations.push(regexp);
	}
}

}
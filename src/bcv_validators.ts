// This class validates Bible references against versification systems.

import { BCVParserOptions, BCVTranslationsInterface, BCVValidatorsInterface, MessageInterface, StartEndInterface, StartEndWithBookInterface, TranslationSequenceInterface, ValidInterface } from "./types";

export default class bcv_validators implements BCVValidatorsInterface {
private options: BCVParserOptions;
private translations: BCVTranslationsInterface;

constructor(options: BCVParserOptions, translations: BCVTranslationsInterface) {
	this.options = options;
	this.translations = translations;
}

// Given a start and optional end bcv object, validate that the verse exists and is valid. It returns a `true` value for `valid` if any of the translations is valid.
public validate_ref(translations: TranslationSequenceInterface[] | null | undefined, start: StartEndInterface, end: StartEndInterface | null = null): ValidInterface {
	// If no translations are provided, assume a single translation that uses the current versification system.
	if (!translations || translations.length === 0 || !Array.isArray(translations)) {
		translations = [{
			osis: "",
			translation: "current",
			system: "current"
		}];
	}
	let valid = false;
	const messages: MessageInterface = {};
	// `translation` is a translation object, but all we care about is the string.
	for (const translation of translations) {
		// Only true if `translation` isn't the right type.
		if (!translation.system) {
			messages.translation_invalid ??= [];
			messages.translation_invalid.push(translation);
			continue;
		}
		// Not a fatal error because we assume that translations match the default unless we know differently. But we still record it because we may want to know about it later. Translations in `alternates` get generated on-demand.
		if (!this.translations.aliases[translation.system]) {
			translation.system = "current";
			messages.translation_unknown ??= [];
			messages.translation_unknown.push(translation);
		}
		let [temp_valid] = this.validate_start_ref(translation.system, start, messages);
		if (end) {
			[temp_valid] = this.validate_end_ref(translation.system, start, end, temp_valid, messages);
		}
		if (temp_valid === true) {
			valid = true;
		}
	}
	return { valid, messages };
}

// The end ref pretty much just has to be after the start ref; beyond the book, we don't require the chapter or verse to exist. This approach is useful when people get end verses wrong.
public validate_end_ref(system: string, start: StartEndInterface, end: StartEndInterface, valid: boolean, messages: MessageInterface): [boolean, MessageInterface] {
	// All keys always exist in `current`.
	const order = this.translations.systems[system]?.order || this.translations.systems.current.order;
	// Matt 0
	if (end.c === 0) {
		messages.end_chapter_is_zero = 1;
		if (this.options.zero_chapter_strategy === "error") {
			valid = false;
		} else {
			end.c = 1;
		}
	}
	// Matt 5:0
	if (end.v === 0 && !this.is_psalm_title(end)) {
		messages.end_verse_is_zero = 1;
		if (this.options.zero_verse_strategy === "error") {
			valid = false;
		} else if (this.options.zero_verse_strategy === "upgrade") {
			end.v = 1;
		}
	}
	// Matt-Mark
	if (end.b && order[end.b] != null) {
		valid = this.validate_known_end_book(system, order, start, end as StartEndWithBookInterface, valid, messages);
	// Matt 5:1-None 6
	} else {
		valid = false;
		messages.end_book_not_exist = true;
	}
	return [valid, messages];
}

// Validate when the end book is known to exist. This function makes `validate_end_ref` easier to follow.
private validate_known_end_book(system: string, order: Record<string, number>, start: StartEndInterface, end: StartEndWithBookInterface, valid: boolean, messages: MessageInterface): boolean {
	// Use the translation-specific number of chapters if it exists; otherwise, use the current versification system.
	const chapter_array = this.translations.systems[system]?.chapters?.[end.b] || this.translations.systems.current.chapters[end.b];
	// Even if the `passage_existence_strategy` doesn't include `c`, make sure to treat single-chapter books as single-chapter books.
	if (end.c == null && chapter_array.length === 1) {
		end.c = 1;
	}
	// Mark 4-Matt 5, None 4-Matt 5. The start book may be undefined; an undefined key reads as a missing entry, which the `!= null` check handles.
	if (
		order[start.b as string] != null &&
		order[start.b as string] > order[end.b]
		) {
			if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
				valid = false;
			}
			messages.end_book_before_start = true;
	}
	// Matt 5-6
	if (start.b === end.b && end.c != null) {
		// Matt-Matt 4
		start.c ??= 1;
		//Matt 5-4
		if (start.c > end.c) {
			valid = false;
			messages.end_chapter_before_start = true;
		// Matt 5:7-5:8
		} else if (start.c === end.c && end.v != null) {
			// Matt 5-5:8
			start.v ??= 1;
			// Matt 5:8-7
			if (start.v > end.v) {
				valid = false;
				messages.end_verse_before_start = true;
			}
		}
	}
	// Check if the end chapter exists.
	if (end.c != null && chapter_array[end.c - 1] == null) {
		// If it's a single-chapter book.
		if (chapter_array.length === 1) {
			messages.end_chapter_not_exist_in_single_chapter_book = 1;
		// If it's a multi-chapter book and we care that it doesn't exist.
		} else if (end.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
			messages.end_chapter_not_exist = chapter_array.length;
		}
	}
	// Check if the end verse exists.
	if (end.v != null) {
		end.c ??= chapter_array.length;
		// If the end verse is higher than the last verse in the chapter and we care that it is.
		if (
			end.v > chapter_array[end.c! - 1] &&
			this.options.passage_existence_strategy.indexOf("v") >= 0
			) {
				messages.end_verse_not_exist = chapter_array[end.c! - 1];
		}
	}
	return valid;
}

// When Psalm titles are verse 0, Psalm verse 0 is the title--a real verse, so `zero_verse_strategy` doesn't apply to it.
private is_psalm_title(ref: StartEndInterface): boolean {
	return ref.b === "Ps" && ref.v === 0 && this.options.psalm_title_strategy === 0;
}

// Validate and apply options when we know the start book is valid. This function makes `validate_start_ref` easier to follow.
private validate_known_start_book(system: string, start: StartEndWithBookInterface, messages: MessageInterface): boolean {
	// Start by assuming `valid` is `true`.
	let valid = true;
	// If no chapter is specified, assume 1.
	start.c ??= 1;
	// Use the translation-specific number of chapters if it exists; otherwise, use the current versification system.
	const chapter_array = this.translations.systems[system]?.chapters?.[start.b] || this.translations.systems.current.chapters[start.b];
	// Matt 0
	if (start.c === 0) {
		messages.start_chapter_is_zero = 1;
		if (this.options.zero_chapter_strategy === "error") {
			valid = false;
		} else {
			start.c = 1;
		}
	}
	// Matt 5:0
	if (start.v === 0 && !this.is_psalm_title(start)) {
		messages.start_verse_is_zero = 1;
		if (this.options.zero_verse_strategy === "error") {
			valid = false;
		// We can't just have `else` because `allow` is a valid `zero_verse_strategy`.
		} else if (this.options.zero_verse_strategy === "upgrade") {
			start.v = 1;
		}
	}
	// Matt 5
	if (start.c > 0 && chapter_array[start.c - 1] != null) {
		// Matt 5:10
		if (start.v != null) {
			if (
				start.v > chapter_array[start.c - 1] &&
				this.options.passage_existence_strategy.indexOf("v") >= 0
				) {
					valid = false;
					messages.start_verse_not_exist = chapter_array[start.c - 1];
			}
		// Jude 1 when wanting to treat the `1` as a verse rather than a chapter.
		} else if (
			start.c === 1 &&
			chapter_array.length === 1
			) {
				if (this.options.single_chapter_1_strategy === "verse") {
					messages.start_verse_1 = 1;
				} else {
					messages.start_chapter_1 = 1;
				}
		}
	// Matt 50
	} else {
		// If the book is single-chapter and we're referencing a different chapter.
		const chapter_array_length = chapter_array.length;
		if (
			start.c !== 1 &&
			chapter_array_length === 1
			) {
				valid = false;
				messages.start_chapter_not_exist_in_single_chapter_book = 1;
		} else if (
			start.c > 0 &&
			this.options.passage_existence_strategy.indexOf("c") >= 0
			) {
			valid = false;
			messages.start_chapter_not_exist = chapter_array_length;
		}
	}
	return valid;
}

// Make sure that the start ref exists in the given translation.
public validate_start_ref(system: string, start: StartEndInterface, messages: MessageInterface): [boolean, MessageInterface] {
	let valid = true;
	// If `order` exists, it's always fully specified; there are no gaps. `chapters` is different--it isn't always fully specified for every book, outside of `current`.
	const order = this.translations.systems[system]?.order || this.translations.systems.current.order;
	// An unusual situation in which there's no defined start book. This only happens when a `c` becomes dissociated from its `b`.
	if (!start.b) {
		// No book defined
		valid = false;
		messages.start_book_not_defined = true;
	// Matt. The book is a known book.
	} else if (order[start.b] != null) {
		valid = this.validate_known_start_book(system, start as StartEndWithBookInterface, messages);
	// None 2:1 (book doesn't exist)
	} else {
		if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
			valid = false;
		}
		messages.start_book_not_exist = true;
	}
	return [valid, messages];
}

}

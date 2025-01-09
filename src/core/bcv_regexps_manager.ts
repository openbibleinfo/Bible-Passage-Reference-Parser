import { BCVParserInterface, BCVParserOptions, BCVRegExpsInterface, BCVRegExpsManagerInterface, BookPattern, BookRegExpInterface } from "./types";

interface BookData {
	has_number_book: boolean;
	testament: BookRegExpInterface["testament"];
	testament_books: { [key: string]: BookRegExpInterface["testament_books"] };
};

export default class bcv_regexps_manager implements BCVRegExpsManagerInterface {
parent;
filtered_books_flags = "";

constructor(parent: BCVParserInterface) {
	this.parent = parent;
	// These are the default values for the parser: Old and New Testaments, and no case-sensitivity.
	this.filter_books("on", "none");
}

public filter_books(testaments: BCVParserOptions["testaments"], case_sensitive: BCVParserOptions["case_sensitive"]): void {
	// Don't regenerate everything unless we need to.
	const filtered_books_flags = testaments + "/" + case_sensitive;
	if (filtered_books_flags === this.filtered_books_flags) {
		return;
	}
	this.filtered_books_flags = filtered_books_flags;
	// Short-circuit the logic if we know we want all the books with default case-senitivity.
	if (testaments === "ona" && case_sensitive === "none") {
 		 this.parent.regexps.books = this.parent.regexps.all_books;
	}
	this.parent.regexps.books = this.parent.regexps.all_books.reduce((accum, book) => {
		// Only end up cloning it if we're altering a data structure; otherwise, use the original.
		let cloned_book: BookRegExpInterface | undefined;
		// Exclude any testments we don't want. If `testaments` is `ona`, we don't need to do any checks since we know everything will match.`
		if (testaments !== "ona" && testaments.indexOf(book.testament) === -1) {
			// This is far and away the most-likely case. It's only not 1 when there are multiple books from different testaments--for example, if you want "Jeremiah" to work for both `Jer` (Old Testament) and `EpJer` (Apocrypha).
			if (book.testament.length === 1 || book.testament_books == null) {
				return accum;
			} else if (!this.has_testament_overlap(testaments, book.testament)) {
				return accum;
			} else {
				const new_osis = this.get_testament_overlap(testaments, book);
				// An empty array should never happen since this `else` condition should only happen if there's some overlap.
				if (new_osis.length > 0) {
					cloned_book = structuredClone(book);
					cloned_book.osis = new_osis;
				} else {
					return accum;
				}
			}
		}
		// If we only want case sensitivity for books, recreate the RegExp to omit the `i` flag. Not every RegExp in the array necessarily uses the same flags. (Some don't need the `u` flag, for example.)
		if (case_sensitive === "books") {
			cloned_book ??= structuredClone(book);
			const flags = cloned_book.regexp.flags.replace("i", "");
			cloned_book.regexp = new RegExp(book.regexp.source, flags);
		}

		accum.push(cloned_book ?? book);
		return accum;
	}, [] as BookRegExpInterface[]);
}

private has_testament_overlap(testaments: BCVParserOptions["testaments"], book_testament: BCVParserOptions["testaments"]): boolean {
	// It would make more sense to create sets for each and then find the intersection, but ES2022 doesn't support it. So instead we construct a set of all the parts (which are something like `on` and `na`). If the size of the set is less than the sum of the lengths ([`o`, `n`, `a`] is shorter than `onna`), then we know there was an overlap.
	const components = new Set((testaments + book_testament).split(""));
	if (components.size < testaments.length + book_testament.length) {
		return true;
	}
	return false;
}

// Filter the `osis` array on the `book` object to include only the books that are in the relevant testaments.
private get_testament_overlap(testaments: BCVParserOptions["testaments"], book: BookRegExpInterface): string[] {
	const new_osis = book.osis.filter(osis => {
		return this.has_testament_overlap(testaments, book.testament_books[osis]);
	})
	return new_osis;
}

// Runtime pattern changes to allow adding books without regenerating the whole module.
public add_books(books): void {
	// Make sure the input is the format we're looking for.
	if (books == null || !Array.isArray(books.books)) {
		throw new Error("add_books: The argument to `add_books` should be an object with an array in `books`");
	}
	// Create arrays to merge at the end. Do it this way so all "start" `position`s are added in the order they appear in `books.books`, rather than the reverse order that would happen if we added them as we went along.
	const starts: BookRegExpInterface[] = [];
	const ends: BookRegExpInterface[] = [];
	// Go through each pattern in order. If all of them are set to appear at the start, the last one will end up first.
	for (const pattern of books.books) {
		// It's up to the caller to provide a reasonably performant and valid RegExp.
		if (pattern == null || !(pattern.regexp instanceof RegExp)) {
			throw new Error("add_books: The `regexp` property of each pattern should be a RegExp");
		}
		// Get data about the books that we'll need to add them to the list of books.
		const book_data = this.get_book_testaments(pattern);
		// Surround the pattern for consistency, or allow the caller to override them.
		const regexps = this.get_book_pattern_regexps(pattern, book_data);
		// Always default to case-insensitive and let other settings override it later.
		const regexp = new RegExp(regexps.pre_regexp.source + regexps.regexp.source + regexps.post_regexp.source, "giu");
		// Default to the start since it's likely you want your pattern to take precedence over existing ones.
		const position = (typeof pattern.insert_at === "string") ? pattern.insert_at : "start";
		// Make the required fields.
		const insert_object: BookRegExpInterface = {
			osis: pattern.osis,
			testament: book_data.testament,
			regexp
		};
		// Add the optional field if the books can appear in more than one testament.
		if (book_data.testament.length > 1) {
			insert_object.testament_books = book_data.testament_books;
		}
		// Short-circuit expensive logic if possible.
		if (position === "start") {
			starts.push(insert_object);
		} else if (position === "end") {
			ends.push(insert_object);
		} else {
			// Go through each book and find the first one that matches the desired pattern. We don't mind if we don't find one since it just goes at the end.
			let has_inserted = false;
			for (const [i, book] of this.parent.regexps.all_books.entries()) {
				if (book.osis.join(',') === position) {
					// Unlike "start" or "end", is added incrementally as we go along.
					this.parent.regexps.all_books.splice(i, 0, insert_object);
					has_inserted = true;
					break;
				}
			}
			// If there's no matching book pattern, then put it at the end to try last.
			if (has_inserted === false) {
				ends.push(insert_object);
			}
		}
	}
	// Put any at the start or end.
	if (starts.length > 0 || ends.length > 0) {
		this.parent.regexps.all_books = [...starts, ...this.parent.regexps.all_books, ...ends];
	}
	// Make sure the set of active books reflects these additions if they're relevant. Clear out the `filtered_book_flags`; since no flags have changed, `this.parent.regexps.books` otherwise wouldn't be regenerated.`
	this.filtered_books_flags = "";
	this.filter_books(this.parent.options.testaments, this.parent.options.case_sensitive);
}

// Make the regexps that will be fed back to the pattern. Ultimately we want to know what will go before and after the provided pattern.
private get_book_pattern_regexps(pattern: BookPattern, book_data: BookData) {
	let regexps = {
		pre_regexp: new RegExp(""),
		regexp: pattern.regexp,
		post_regexp: new RegExp("")
	}
	for (const regexp_type of ["pre_regexp", "post_regexp"]) {
		// If the caller didn't provide a pattern...
		if (pattern[regexp_type] == null) {
			// Get rid of the trailing `_regexp` to match the corresponding key name in `this.parent.regexps`.
			let regexp_key = (regexp_type === "pre_regexp") ? "pre_book" : "post_book";
			if (book_data.has_number_book && regexp_key === "pre_book") {
				regexp_key = "pre_number_book";
			}
			regexps[regexp_type] = this.parent.regexps[regexp_key];
		// If the caller did provide a pattern, validate it or throw an error.
		} else {
			if (pattern[regexp_type] instanceof RegExp) {
				regexps[regexp_type] = pattern[regexp_type];
			} else {
				throw new Error("add_books: The `" + regexp_type + "` property of each pattern should be a RegExp");
			}
		}
	}
	return regexps;
}

// Get data about the testaments the books are in to create RegExps for them.
private get_book_testaments(pattern: BookPattern): BookData {
	const books = pattern.osis;
	// Make sure it's the right format.
	if (!Array.isArray(books)) {
		throw new Error("add_books: The `osis` property of each pattern should be an array");
	}
	const out = {
		testament_books: {},
		has_number_book: false,
		testament: ""
	};
	// This is a lot of logic just to capture what testaments the books are in.
	const testaments = new Set();
	for (const book of books) {
		if (typeof book !== "string" || this.parent.translations.systems.default.order[book] == null) {
			throw new Error("add_books: Unknown book in pattern: " + book);
		}
		if (book in out.testament_books) {
			throw new Error("add_books: Every provided book should be unique. Duplicate: " + book);
		}
		let testament = "o";
		if (book === "Ps") {
			out.testament_books[book] = "oa";
			testaments.add("o");
			testaments.add("a");
		}
		else {
			const canonical_order = this.parent.translations.systems.default.order[book];
			// 40 = Matt, 66 = Rev.
			if (canonical_order >= 40) {
				testament = (canonical_order <= 66) ? "n" : "a";
			}
			// If it's numeric, we may want to use a different preceding RegExp pattern.
			if (/^\d/.test(book) && /\d/.test(pattern.regexp.source)) {
				out.has_number_book = true;
			}
			out.testament_books[book] = testament;
			testaments.add(testament);
		}
	}
	// The most-common case.
	if (testaments.size === 1) {
		out.testament = testaments.values().next().value;
	} else {
		// Otherwise, if there's more than one, build the string in the appropriate order.
		for (const key of ["o", "n", "a"]) {
			if (testaments.has(key)) {
				out.testament += key;
			}
		}
	}
	return out;
}

}
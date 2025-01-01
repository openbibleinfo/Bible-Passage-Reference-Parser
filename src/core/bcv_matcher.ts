// This class handles all the interactions with the grammar and producing the matches.

import { BCVParserInterface, BookMatchInterface, PassageEntityInterface, ContextInterface, GrammarMatchInterface } from "./types";

export default class bcv_matcher {
parent;
grammar;

constructor(parent: BCVParserInterface, grammar: any) {
	this.parent = parent;
	this.grammar = grammar;
}

// ## Parsing-Related Functions
// Replace control characters and spaces since we replace books with a specific character pattern. The string changes, but the length stays the same so that indices remain valid. If we want to use Latin numbers rather than non-Latin ones, replace them here.
public replace_control_characters(s: string): string {
	s = s.replace(this.parent.regexps.control, " ");
	if (this.parent.options.non_latin_digits_strategy === "replace") {
		s = s.replace(/[٠۰߀०০੦૦୦0౦೦൦๐໐༠၀႐០᠐᥆᧐᪀᪐᭐᮰᱀᱐꘠꣐꤀꧐꩐꯰０]/g, "0");
		s = s.replace(/[١۱߁१১੧૧୧௧౧೧൧๑໑༡၁႑១᠑᥇᧑᪁᪑᭑᮱᱁᱑꘡꣑꤁꧑꩑꯱１]/g, "1");
		s = s.replace(/[٢۲߂२২੨૨୨௨౨೨൨๒໒༢၂႒២᠒᥈᧒᪂᪒᭒᮲᱂᱒꘢꣒꤂꧒꩒꯲２]/g, "2");
		s = s.replace(/[٣۳߃३৩੩૩୩௩౩೩൩๓໓༣၃႓៣᠓᥉᧓᪃᪓᭓᮳᱃᱓꘣꣓꤃꧓꩓꯳３]/g, "3");
		s = s.replace(/[٤۴߄४৪੪૪୪௪౪೪൪๔໔༤၄႔៤᠔᥊᧔᪄᪔᭔᮴᱄᱔꘤꣔꤄꧔꩔꯴４]/g, "4");
		s = s.replace(/[٥۵߅५৫੫૫୫௫౫೫൫๕໕༥၅႕៥᠕᥋᧕᪅᪕᭕᮵᱅᱕꘥꣕꤅꧕꩕꯵５]/g, "5");
		s = s.replace(/[٦۶߆६৬੬૬୬௬౬೬൬๖໖༦၆႖៦᠖᥌᧖᪆᪖᭖᮶᱆᱖꘦꣖꤆꧖꩖꯶６]/g, "6");
		s = s.replace(/[٧۷߇७৭੭૭୭௭౭೭൭๗໗༧၇႗៧᠗᥍᧗᪇᪗᭗᮷᱇᱗꘧꣗꤇꧗꩗꯷７]/g, "7");
		s = s.replace(/[٨۸߈८৮੮૮୮௮౮೮൮๘໘༨၈႘៨᠘᥎᧘᪈᪘᭘᮸᱈᱘꘨꣘꤈꧘꩘꯸８]/g, "8");
		s = s.replace(/[٩۹߉९৯੯૯୯௯౯೯൯๙໙༩၉႙៩᠙᥏᧙᪉᪙᭙᮹᱉᱙꘩꣙꤉꧙꩙꯹９]/g, "9");
	}
	return s;
}

// Find and replace instances of Bible books.
public match_books(s: string): [string, BookMatchInterface[]] {
	const books: BookMatchInterface[] = [];
	// Replace all book strings
	for (const book of this.parent.regexps.books) {
		let has_replacement = false;
		// Using array concatenation instead of replacing text directly didn't offer performance improvements in tests of the approach.
		s = s.replace(book.regexp, function(_full: string, bk: string): string {
			has_replacement = true;
			// `value` contains the raw string; `book.osis` is the osis value for the book.
			books.push({
				value: bk,
				parsed: book.osis,
				type: "book"
			});
			const extra = book.extra ? `/${book.extra}` : "";
			return `\x1f${books.length - 1}${extra}\x1f`;
		});
		// If we've already replaced all possible books in the string, we don't need to check any further.
		if (has_replacement && /^[\s\x1f\d:.,;\-\u2013\u2014]+$/.test(s)) {
			break;
		}
	}
	// Replace translations.
	for (const translation_regexp of this.parent.regexps.translations) {
		s = s.replace(translation_regexp, function(match: string): string {
			books.push({
				value: match,
				parsed: match.toLowerCase(),
				type: "translation"
			});
			return `\x1e${books.length - 1}\x1e`;
		});
	}
	return [s, this.get_book_indices(books, s)];
}

// Get the string index for all the books / translations, adding the start index as a new key.
private get_book_indices(books: BookMatchInterface[], s: string): BookMatchInterface[] {
	let add_index = 0;
	// Match book or translation placeholders.
	for (const match of s.matchAll(/([\x1f\x1e])(\d+)(?:\/\d+)?\1/g)) {
		const bookIndex = parseInt(match[2], 10);
		// Keep track of the actual start index.
		books[bookIndex].start_index = match.index + add_index;
		// Add the difference between the real length of the book and what we replaced it with(`match[0]` is the placeholder string).
		add_index += books[bookIndex].value.length - match[0].length;
	}
	return books;
}

// Create an array of all the potential passage references in the string.
public match_passages(s: string): [PassageEntityInterface[], ContextInterface] {
	let entities: PassageEntityInterface[] = [];
	let post_context: ContextInterface = {};
	for (const match of s.matchAll(this.parent.regexps.escaped_passage)) {
		// * `match[0]` includes the preceding character (if any) for bounding.
		// * `match[1]` is the full match minus the character preceding the match used for bounding.
		// * `match[2]` is the book id.
		let [full, part, book_id] = match;
		const book_id_number = parseInt(book_id, 10);
		// Adjust the `index` to use the `part` offset rather than the `full` offset. We use it below for `captive_end_digits`.
		const original_part_length = part.length;
		match.index += full.length - original_part_length;
		// Clean up the end of the match to avoid unnecessary characters.
		part = this.clean_end_match(s, match, part);
		// Though Peggy doesn't have to be case-sensitive, using the case-insensitive feature involves some repeated processing. By lower-casing here, we only pay the cost once. The grammar for words like "also" is case-sensitive; we can safely lowercase ascii letters without changing indices. We don't just call .toLowerCase() because it could affect the length of the string if it contains certain characters; maintaining the indices is the most important thing.
		part = part.replace(/[A-Z]+/g, (capitals) => capitals.toLowerCase());
		// If we're in a chapter-book situation, the first character won't be a book control character, which would throw off the `start_index`.
		const start_index_adjust = part.startsWith("\x1f") ? 0 : part.split("\x1f")[0].length;
		// * `match` is important for the length and whether it contains control characters, neither of which we've changed inconsistently with the original string. The `part` may be shorter than originally matched, but that's only to remove unneeded characters at the end.
		// * `grammar` is the external PEG parser. The `this.parent.options.punctuation_strategy` determines which punctuation is used for sequences and `cv` separators.
		const passage: GrammarMatchInterface = {
			value: this.grammar.parse(part, {
				punctuation_strategy: this.parent.options.punctuation_strategy,
			}),
			type: "base",
			// The `start_index` in `this.parent.passage` always exists after being set in `match_books`.
			start_index: this.parent.passage.books[book_id_number].start_index! - start_index_adjust,
			match: part,
		};
		// Check if we are looking at a single book that might be part of a range like "1-2 Sam". If so, possibly create a book range.
		const book_parsed = this.parent.passage.books[book_id_number].parsed;
		if (
			start_index_adjust === 0 &&
			this.parent.options.book_alone_strategy === "full" &&
			this.parent.options.book_range_strategy === "include" &&
			passage.value[0].type === "b" &&
			Array.isArray(passage.value) &&
			(passage.value.length === 1 ||
				(passage.value.length > 1 && passage.value[1].type === "translation_sequence")
			) &&
			/^[234]/.test(book_parsed)
		) {
			this.create_book_range(s, passage, book_id_number);
		}
		// Handle the passage object to prevent context leakage. `handle_obj` returns an array of accumulated entities and updated post_context.
		let accum: PassageEntityInterface[] = [];
		[accum, post_context] = this.parent.passage.handle_obj(passage, [], {});
		entities = entities.concat(accum);
		// Move the next RegExp iteration to start earlier if we ended up using fewer characters than initially matched.
		const regexp_index_adjust = this.adjust_regexp_end(accum, original_part_length, part.length);
		if (regexp_index_adjust > 0) {
			this.parent.regexps.escaped_passage.lastIndex -= regexp_index_adjust;
		}
	}
	return [entities, post_context];
}

// Clean up the end of a match by removing unnecessary characters.
private clean_end_match(s: string, match: RegExpMatchArray, part: string): string {
	// Remove most three+-character digits at the end; they won't match.
	if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
		part = part.replace(/\s+\d+\s*$/, "");
	}
	// Clean up the end of the match to avoid irrelevant context.
	if (!/[\d\x1f\x1e)]$/.test(part)) {
		// Remove superfluous characters from the end of the match.
		const sub_parts = part.split(this.parent.regexps.match_end_split);
		const remove = sub_parts.pop();
		// Make sure `sub_parts` isn't the whole `part`.
		if (sub_parts.length > 0 && remove != null && remove.length > 0) {
			part = part.substring(0, part.length - remove.length);
		}
	}
	// If "captive_end_digits_strategy" is set to "delete", handle trailing digits that occur right before another word or following a translation indicator.
	if (this.parent.options.captive_end_digits_strategy === "delete") {
		// If the match ends with a space+digit and is immediately followed by a word character, ignore the space+digit: `Matt 1, 2Text`. The asterisk in the pattern match is because asterisks are surprisingly common in this situation in real text.
		const next_char_index = match.index! + part.length;
		if (s.length > next_char_index && /^\w/.test(s.charAt(next_char_index))) {
			part = part.replace(/[\s*]+\d+$/, "");
		}
		// If the match ends with a translation indicator, remove any numbers afterward. This situation generally occurs in cases like, "Ps 1:1 ESV 1 Blessed is...", where the final `1` is a verse number that's part of the text. Again, the asterisk is here because it happens often in real-life text from users.
		part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
	}
	return part;
}

// Handle the objects returned from the grammar to produce entities for further processing. We may need to adjust the `RegExp.lastIndex` if we discarded characters from the end of the match or if, after parsing, we're ignoring some of them--especially with ending parenthetical statements like "Luke 8:1-3; 24:10 (and Matthew 14:1-12 and Luke 23:7-12 for background)".
private adjust_regexp_end(accum: PassageEntityInterface[], old_length: number, new_length: number): number {
	if (accum.length > 0) {
		// If we have parsed entities, use the last one's end index to figure out how much of the matched text wasn't actually part of the final usage.
		// `accum` uses an off-by-one end index compared to the RegExp object. "and Psa3" means `lastIndex` = 8, `old_length` and `new_length` are both 4 (omitting "and " and leaving "Psa3"), and the `accum` end index is 3. We end up with 4 - 3 - 1 = 0, or no adjustment. Compare "and Psa3 and", where the last " and" is originally considered part of the regexp. In this case, `regexp_index_adjust` is 4: 8 ("Psa3 and") - 3 ("Psa3") - 1.
		return old_length - accum[accum.length - 1].indices[1] - 1;
	} else if (old_length !== new_length) {
		// If there's no `accum` but we still shortened the match, then the entire difference between old and new length was removed.
		return old_length - new_length;
	}
	return 0;
}

// If a book is on its own, check whether it's preceded by something that indicates it's a book range like "1-2 Samuel".
private create_book_range(s: string, passage: GrammarMatchInterface, book_id: number): GrammarMatchInterface | false {
	// We don't need a fourth here because these cases are for the starting book.
	const cases = [
		this.parent.regexps.first,
		this.parent.regexps.second,
		this.parent.regexps.third
	];
	// Extract the first character (which is a number) from the OSIS book name.
	const limit = parseInt(this.parent.passage.books[book_id].parsed[0].substring(0, 1), 10);
	// Iterate from 1 up to (but not including) `limit` to see if a preceding number creates a range.
	for (let i = 1; i < limit; i++) {
		// `range_and` is for "also" cases, while `range_only` is for "through" cases.
		const range_regexp = (i === limit - 1)
			? this.parent.regexps.range_and
			: this.parent.regexps.range_only;
		const match_regexp = new RegExp(String.raw`(?:^|[^\p{L}\p{N}])(${cases[i - 1]}\s*${range_regexp}\s*)\x1f${book_id}\x1f`, "iu");
		const prev = s.match(match_regexp);
		// If we found a preceding pattern (like "1-2 Sam"), transform the passage into a range.
		if (prev) {
			return this.add_book_range_object(passage, prev, i);
		}
	}
	return false;
}

// Create a synthetic object that can be parsed to show the correct result.
private add_book_range_object(passage: GrammarMatchInterface, prev: RegExpMatchArray, start_book_number: number): GrammarMatchInterface {
	const length = prev[1].length;
	// Insert a `b_range_pre` object in front of the current book to simulate something like "1-" before "2 Samuel".
	passage.value[0] = {
		type: "b_range_pre",
		value: [
			{
				type: "b_pre",
				value: start_book_number.toString(),
				indices: [prev.index!, prev.index! + length]
			},
			passage.value[0]
		],
		indices: [0, passage.value[0].indices[1] + length]
	};
	// Adjust indices of the original book object so that they reflect the new content.
	this.add_offset_to_indices(passage.value[0].value[1].indices, length);
	// These two are the most important ones; the `absolute_indices` function uses them. Because this is a `book` object, it's always defined.
	passage.start_index! -= length;
	passage.match = prev[1] + passage.match;
	// Adjust offsets for any subsequent objects. If there's only one object in `passage.value`, this code never runs.
	if (!Array.isArray(passage.value)) {
		return passage;
	}
	for (let i = 1; i < passage.value.length; i++) {
		if (!passage.value[i].value) {
			continue;
		}
		// f it's an `integer` type, `passage.value[i].value` is a scalar rather than an object, so we only need to adjust the indices for the top-level object.
		if (passage.value[i].value[0]?.indices) {
			this.add_offset_to_indices(passage.value[i].value[0].indices, length);
		}
		// Adjust this object's own indices.
		this.add_offset_to_indices(passage.value[i].indices!, length);
	}
	return passage;
}

private add_offset_to_indices(indices: number[], value_to_add: number): void {
	indices[0] += value_to_add;
	indices[1] += value_to_add;
}

}

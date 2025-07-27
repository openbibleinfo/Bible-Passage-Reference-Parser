// This class takes the output from the grammar and turns it into simpler objects for additional processing or for output.

import { BCVParserOptions, BCVTranslationsInterface, GrammarMatchInterface, BookMatchInterface, PassageEntityInterface, MessageInterface, StartEndInterface, PublicTranslationInterface, ValidInterface, TranslationInterface, PassageReturn, Entity, EntityCollection, TranslationSequenceInterface, IndicesInterface, ContextInterface } from "./types";

export default class bcv_passage {

books: BookMatchInterface[] = [];
indices: IndicesInterface[] = [];
options: BCVParserOptions;
translations: BCVTranslationsInterface;

constructor(options: BCVParserOptions, translations: BCVTranslationsInterface) {
	this.options = options;
	this.translations = translations;
}

// ## Public
// Loop through the parsed passages.
public handle_array(passages: PassageEntityInterface[], accum: PassageEntityInterface[] = [], context: ContextInterface = {}): PassageReturn {
	// `passages` is an array of passage objects.
	for (const passage of passages) {
		// The grammar can sometimes emit `null`.
		if (passage == null) {
			continue;
		}
		[accum, context] = this.handle_obj(passage, accum, context);
	}
	return [accum, context];
}

public handle_obj(passage: GrammarMatchInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	if (passage.type && typeof this[passage.type] === "function") {
		return this[passage.type](passage, accum, context);
	}
	return [accum, context];
}

// ## Types Returned from the Peggy Grammar
// These functions correspond to `type` attributes returned from the grammar. They're designed to be called multiple times if necessary.

// Handle a book on its own ("Gen").
private b(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// Clone the current context so that changes to this passage do not affect other passages.
	passage.start_context = structuredClone(context);
	// Prepare the passage object.
	passage.passages = [];
	const alternates: Entity[] = [];
	// For each parsed variation of the book's name, validate it.
	for (const b of this.books[passage.value].parsed) {
		// Validate the reference against the currently set translations.
		const valid = this.validate_ref(passage.start_context.translations, { b });
		const obj: Entity = {
			start: { b },
			end: { b },
			valid: valid
		};
		// Use the first valid book as the primary passage.
		if (passage.passages.length === 0 && valid.valid) {
			passage.passages.push(obj);
		} else {
			// If it's not valid or it's a subsequent variation, store it in `alternates` for possible reference later.
			alternates.push(obj);
		}
	}
	this.normalize_passage_and_alternates(passage, alternates);
	// Add this processed passage to the accumulated array.
	accum.push(passage);
	// Update the context to reflect the now-known book. Reset any existing context.
	context = { b: passage.passages[0].start.b };
	if (passage.start_context.translations) {
		context.translations = structuredClone(passage.start_context.translations);
	}
	return [accum, context];
}

// This is never called. It exists to make Typescript happy.
private b_pre(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return [accum, context];
}

// Handle book-only ranges ("Gen-Exod").
private b_range(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.range(passage, accum, context);
}

// Handle book-only ranges like "1-2 Samuel". It doesn't support multiple ambiguous ranges (like "1-2C"), which it probably shouldn't, anyway.
private b_range_pre(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	passage.passages = [];
	// Extract the book portion.
	const book = this.pluck("b", passage.value);
	// Call the `b` function with the extracted book. This returns a tuple: [accum, context]. The first element has the book information we're looking for.
	let end: PassageEntityInterface;
	[[end], context] = this.b(book, [], context);
	// Compute absolute indices if not already set.
	passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
	// `passage.value[0].value` is the number at the beginning of the range: `1` in `1-3 John`. In this case, the end book is 3John, so we replace the `3` in `3John` with a `1` in `start.b`. This works because this type of range only works with the same suffix, like "1-2 Sam".
	passage.passages = [{
		start: {
			b: passage.value[0].value + end.passages[0].start.b.substring(1),
			type: "b"
		},
		end: end.passages[0].end,
		valid: end.passages[0].valid
	}];
	// If we had translations in the starting context, apply them to the newly created passage.
	if (passage.start_context.translations) {
		passage.passages[0].translations = structuredClone(passage.start_context.translations);
	}
	accum.push(passage);
	return [accum, context];
}

// Handle ranges with a book as the start of the range ("Gen-Exod 2").
private b_range_start(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.range(passage, accum, context);
}

// The base (root) object in the grammar controls the base indices.
private base(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	this.indices = this.calculate_indices(passage.match, passage.start_index);
	return this.handle_array(passage.value, accum, context);
}

// Handle book-chapter ("Gen 1").
private bc(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// Clone the current context so that changes to this passage don't affect others.
	passage.start_context = structuredClone(context);
	passage.passages = [];
	// Reset the context since we have a book.
	this.reset_context(context, ["b", "c", "v"]);
	// Extract the chapter number from the passage.
	const chapter_integer = this.pluck_integer("c", passage.value);
	const c = chapter_integer.value;
	const partial = this.get_partial_verse(chapter_integer);
	let adjust_end_index_by = 0;
	const alternates: Entity[] = [];
	// Get the book value and iterate over all parsed versions of that book name.
	for (const b of this.books[this.pluck("b", passage.value).value].parsed) {
		// By default, we assume we're validating a chapter reference.
		let context_key = "c";
		// Validate the reference for the given book and chapter.
		const valid = this.validate_ref(passage.start_context.translations, { b, c });
		const obj: Entity = {
			start: { b },
			end: { b },
			valid
		};
		// If the validation suggests that this isn't really a chapter reference (e.g., single-chapter book), try interpreting `c` as a verse reference instead--i.e., as a `bv`. `start_verse_1` is only used for internal processing; it's never exposed outside of this function. A `partial` also indicates that it should be treated as a verse ("Jude 1a") even if it wouldn't normally be parsed that way.
		if (
			valid.messages?.start_chapter_not_exist_in_single_chapter_book ||
			valid.messages?.start_verse_1 ||
			(partial != null && valid.messages?.start_chapter_1)
		) {
			// Re-validate, treating `c` as a verse.
			obj.valid = this.validate_ref(passage.start_context.translations, { b, v: c });
			// With something like `Jude 2`, if it's a single-chapter book, then note that the chapter doesn't exist.
			if (valid.messages?.start_chapter_not_exist_in_single_chapter_book) {
				obj.valid.messages!.start_chapter_not_exist_in_single_chapter_book = 1;
			}
			// Since it's a single-chapter book, set the chapter to 1.
			obj.start.c = 1;
			obj.end.c = 1;
			// Now treat what was previously `c` as if it's a verse number.
			context_key = "v";
		}
		// Set the chapter (`c`) or verse (`v`) in the start object.
		obj.start[context_key] = c;
		// Fix any zero-valued chapters or verses.
		[obj.start.c, obj.start.v] = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v);
		// We don't want an undefined key hanging around the object.
		if (obj.start.v == null) {
			delete obj.start.v;
		}
		// Mirror the start chapter/verse to the end, since it's a single-chapter or single-verse reference.
		obj.end[context_key] = obj.start[context_key];
		// Define any partials for future processing.
		if (partial != null) {
			const key = (context_key === "v") ? "p" : "p_if_verse";
			obj.start[key] = partial;
			obj.end[key] = partial;
		}
		// If we haven't chosen a valid passage yet and this one is valid, choose it.
		if (passage.passages.length === 0 && obj.valid.valid) {
			if (context_key === "c" && partial != null) {
				adjust_end_index_by = partial.length * -1;
			}
			passage.passages.push(obj);
		} else {
			// Otherwise, store it as an alternate.
			alternates.push(obj);
		}
	}
	this.normalize_passage_and_alternates(passage, alternates, adjust_end_index_by);
	// Update the context to reflect the identified book/chapter/verse.
	this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
	// Add this processed passage to the accumulator.
	accum.push(passage);
	return [accum, context];
}

// Handle "Ps 3 title".
private bc_title(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// Clone the current context so that changes to this passage don't affect others.
	passage.start_context = structuredClone(context);
	// First, check to see whether we're dealing with Psalms. If not, treat it as a straight `bc`.
	const bc_pluck = this.pluck("bc", passage.value);
	let bc: EntityCollection;
	[[bc], context] = this.bc(bc_pluck, [], context);
	// Check the first two characters to handle both `Ps` and `Ps151`.
	if (bc.passages![0].start.b.substring(0, 2) !== "Ps" && bc.passages![0].alternates) {
		for (const alternate of bc.passages![0].alternates) {
			// If Psalms is one of the alternates, promote it to the primary passage and skip checking anything else--we know it's right.
			if (alternate.start.b.substring(0, 2) === "Ps") {
				bc.passages![0] = structuredClone(alternate);
				break;
			}
		}
	}
	// If it's still not Psalms, just return what we got from treating it as a `bc`.
	if (bc.passages![0].start.b.substring(0, 2) !== "Ps") {
		accum.push(bc);
		return [accum, context];
	}
	// Overwrite all other book possibilities; the presence of "title" indicates a Psalm. If the previous possibilities were `["Song", "Ps"]`, they're now just `["Ps"]`. Even if it's really `Ps151`, we want `Ps` here because other functions expect it.
	this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
	// Set the `indices` of the new `v` object to the indices of the `title`. We won't actually use these indices anywhere.
	let title = this.pluck("title", passage.value);
	// The `title` will be null if it's being reparsed from a future translation. In that case, we use a `v` object.
	if (!title) {
		title = this.pluck_integer("v", passage.value);
	}
	// Replace the second element with a `v` object representing verse 1, using the title's indices.
	passage.value[1] = {
		type: "v",
		// Let us discover later that this was originally a `title`.
		original_type: "title",
		value: [{ type: "integer", value: 1, indices: title.indices }],
		indices: title.indices
	};
	// We don't need to preserve the original `type` for reparsing; if it gets here, it'll always be a `bcv`.
	passage.type = "bcv";
	// Treat it as a standard `bcv`.
	return this.bcv(passage, accum, passage.start_context);
}

// Handle book chapter:verse ("Gen 1:1").
private bcv(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// Clone the current context so that changes to this passage don't affect others.
	passage.start_context = structuredClone(context);
	passage.passages = [];
	// Reset the full context since there's a book.
	this.reset_context(context, ["b", "c", "v"]);
	const bc = this.pluck("bc", passage.value);
	let c = this.pluck_integer("c", bc.value).value;
	const verse_integer = this.pluck_integer("v", passage.value);
	let v = verse_integer.value;
	const partial = this.get_partial_verse(verse_integer);
	const alternates: Entity[] = [];
	// Iterate over all parsed variations of the book name.
	for (const b of this.books[this.pluck("b", bc.value).value].parsed) {
		const valid = this.validate_ref(passage.start_context.translations, { b, c, v });
		[c, v] = this.fix_start_zeroes(valid, c, v);
		const obj: Entity = {
			start: { b, c, v },
			end: { b, c, v },
			valid
		};
		// Set partial verses if they exist ("Matt 5:1a").
		if (partial != null) {
			obj.start.p = partial;
			obj.end.p = partial;
		}
		// Use the first valid option. Store the others as alternates.
		if (passage.passages.length === 0 && valid.valid) {
			passage.passages.push(obj);
		} else {
			alternates.push(obj);
		}
	}
	this.normalize_passage_and_alternates(passage, alternates);
	// Update the context with the identified book/chapter/verse for future parsing.
	this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
	accum.push(passage);
	return [accum, context];
}

// Handle "Philemon verse 6." This is unusual.
private bv(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	const [b, v] = passage.value;
	// Construct a virtual BCV object with a first chapter.
	let bcv: Partial<EntityCollection> = {
		indices: passage.indices,
		value: [
			{
				type: "bc",
				value: [b, { type: "c", value: [{ type: "integer", value: 1 }] }]
			},
			v
		]
	};
	// Parse this constructed `bcv` as a standard book-chapter-verse reference.
	[[bcv], context] = this.bcv(bcv, [], context);
	// Use the parsed `bcv`'s passages for the original `bv` passage.
	passage.passages = bcv.passages;
	passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
	accum.push(passage);
	return [accum, context];
}

// Handle a chapter.
private c(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// If it's an integer, we want the value directly. If it's an actual chapter object, we want the value from the integer object inside it.
	const chapter_integer = (passage.type === "integer") ? passage : this.pluck("integer", passage.value);
	let c = chapter_integer.value;
	const partial = this.get_partial_verse(chapter_integer);
	const valid = this.validate_ref(passage.start_context.translations, { b: context.b!, c });
	// If it's a single-chapter book, then treat it as a verse even if it looks like a chapter (unless its value is `1`).
	if (!valid.valid && valid.messages?.start_chapter_not_exist_in_single_chapter_book) {
		return this.v(passage, accum, context);
	}
	// Fix any zero-value chapters if needed.
	[c] = this.fix_start_zeroes(valid, c);
	// Create a passage object representing this chapter.
	passage.passages = [{
		start: { b: context.b, c },
		end: { b: context.b, c },
		valid
	}];
	if (passage.start_context.translations) {
		passage.passages[0].translations = passage.start_context.translations;
	}
	if (partial != null) {
		passage.passages[0].start.p_if_verse = partial;
		passage.passages[0].end.p_if_verse = partial;
	}
	accum.push(passage);
	context.c = c;
	// Don't persist any verse context since the chapter resets any verse context.
	this.reset_context(context, ["v"]);
	if (passage.absolute_indices == null) {
		passage.absolute_indices = this.get_absolute_indices(passage.indices);
	}
	return [accum, context];
}

// Handle "23rd Psalm" by recasting it as a `bc`.
private c_psalm(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// We don't need to preserve the original `type` for reparsing later since it'll always turn into a `bc`.
	passage.type = "bc";
	// This string always starts with the chapter number, followed by other letters (e.g., "23rd").
	const c = parseInt(this.books[passage.value].value.match(/^\d+/)![0], 10);
	// Rebuild the passage value as a `bc`.
	passage.value = [
		{
			type: "b",
			value: passage.value,
			indices: passage.indices
		},
		{
			type: "c",
			value: [{ type: "integer", value: c, indices: passage.indices }],
			indices: passage.indices
		}
	];
	return this.bc(passage, accum, context);
}

// Handle "Ps 3, ch 4:title"
private c_title(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// If it's not a Psalm, treat it as a regular chapter. We don't convert the structure for reparsing.
	if (context.b !== "Ps") {
		// Don't change the `type` here because we're not updating the structure to match the `c` expectation if reparsing later.
		return this.c(passage.value[0], accum, context);
	}
	// For Psalms, add a `v` object and treat it as a `cv`.
	const title = this.pluck("title", passage.value);
	// Insert a verse object set to verse 1.
	passage.value[1] = {
		type: "v",
		// Preserve the title type in case we want it later.
		original_type: "title",
		value: [{ type: "integer", value: 1, indices: title.indices }],
		indices: title.indices
	};
	// Change the type to match the new parsing strategy.
	passage.type = "cv";
	// Treat it as a standard `cv`.
	return this.cv(passage, accum, passage.start_context);
}

// Handle "Chapters 1-2 from Daniel".
private cb_range(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// We don't need to preserve the original `type` for reparsing.
	passage.type = "range";
	const [b, start_c, end_c] = passage.value;
	passage.value = [{ type: "bc", value: [b, start_c], indices: passage.indices }, end_c];
	// Extend the end indices to match the entire passage length.
	end_c.indices[1] = passage.indices[1];
	return this.range(passage, accum, context);
}

// Use an object to establish context for later objects but don't otherwise use it.
private context(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context );
	passage.passages = [];
	// Copy any contextual properties from the book to the current context.
	context = Object.assign(context, this.books[passage.value].context);
	accum.push(passage);
	return [accum, context];
}

// Handle a chapter:verse.
private cv(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// Pull out the individual values.
	let c = this.pluck_integer("c", passage.value).value;
	const verse_integer = this.pluck_integer("v", passage.value);
	let v = verse_integer.value;
	const partial = this.get_partial_verse(verse_integer);
	const valid = this.validate_ref(passage.start_context.translations, { b: context.b!, c, v });
	[c, v] = this.fix_start_zeroes(valid, c, v);
	// Construct the passage object.
	passage.passages = [{
		start: { b: context.b, c, v },
		end: { b: context.b, c, v },
		valid: valid
	}];
	// Set partial verses if they exist ("Matt 5:1a").
	if (partial != null) {
		passage.passages[0].start.p = partial;
		passage.passages[0].end.p = partial;
	}
	// Do basic setup as needed.
	if (passage.start_context.translations) {
		passage.passages[0].translations = passage.start_context.translations;
	}
	passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
	context.c = c;
	context.v = v;
	accum.push(passage);
	return [accum, context];
}

// Handle "23rd Psalm verse 1" by recasting it as a `bcv`.
private cv_psalm(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// We don't need to preserve the original `type` for reparsing.
	passage.type = "bcv";
	const [c_psalm, v] = passage.value;
	// Convert "23rd Psalm" into a bc object
	const [[bc]] = this.c_psalm(c_psalm, [], passage.start_context);
	// Now we have a bc from c_psalm and a v. Combine them into a bcv.
	passage.value = [bc, v];
	return this.bcv(passage, accum, context);
}

// Handle "and following" (e.g., "Matt 1:1ff") by assuming it means to continue to the end of the current context (end of chapter if a verse is given, end of book if a chapter is given).
private ff(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// Create a virtual end to pass to `this.range`. The `999` just means to the end, since numbers that are too high snap back to the highest valid number.
	passage.value.push({
		type: "integer",
		indices: structuredClone(passage.indices),
		value: 999
	});
	[[passage], context] = this.range(passage, [], passage.start_context);
	// Set the indices to include the end of the range (the "ff").
	passage.value[0].indices = passage.value[1].indices;
	passage.value[0].absolute_indices = passage.value[1].absolute_indices;
	// Remove the virtual end so it doesn't appear in future reparsing.
	passage.value.pop();
	// Ignore any warnings that the end chapter or verse doesn't exist since "ff" is deliberately open-ended.
	for (const key of ["end_verse_not_exist", "end_chapter_not_exist"]) {
		delete passage.passages[0].valid.messages[key];
	}
	// `translations` and `absolute_indices` are handled in `this.range`, so they're not handled here.
	accum.push(passage);
	return [accum, context];
}

// Pass the integer off to whichever handler is relevant.
private integer(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	if (context.v == null) {
		return this.c(passage, accum, context);
	}
	return this.v(passage, accum, context)
}

// Handle "Ps 3-4:title" or "Acts 2:22-27. Title"
private integer_title(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// If it's not Psalms, treat it as a straight integer, ignoring the title.
	if (context.b !== "Ps") {
		return this.integer(passage.value[0], accum, context);
	}
	// Change the integer to a `c` object for passing to `this.cv`. Preserve the indices.
	passage.value[0] = {
		type: "c",
		value: [passage.value[0]],
		indices: structuredClone(passage.value[0].indices)
	};
	// Change the `title` object to a `v` object representing verse 1. Preserve the indices.
	passage.value[1].type = "v";
	passage.value[1].original_type = "title";
	passage.value[1].value = [{
		type: "integer",
		value: 1,
		indices: structuredClone(passage.value[1].value.indices)
	}];
	// We don't need to preserve the original `type` for reparsing.
	passage.type = "cv";
	return this.cv(passage, accum, passage.start_context);
}

// Handle "next verse" (e.g., in Polish, "Matt 1:1n" should be treated as "Matt 1:1-2"). It crosses chapter boundaries but not book boundaries. When given a whole chapter, it assumes the next chapter (again, not crossing book boundaries). The logic here is similar to that of `this.ff`.
private next_v(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// Create a virtual end to pass to `this.range`. Start out by just incrementing the last integer in the `passage`. The grammar should always produce at least one object in `passage` with an integer, so this `??` shouldn't be necessary.
	const prev_integer = this.pluck_last_recursively("integer", passage.value) ?? { value: 1 };
	// Add a temporary object to serve as the next verse or chapter. We set it to an integer so that we don't have to worry about whether to create a `c` or a `v`.
	passage.value.push({
		type: "integer",
		indices: passage.indices,
		value: prev_integer.value + 1
	});
	// We don't overwrite the `passage` object here the way we do in `this.ff` because the next `if` statement needs access to the original `passage`.
	let psg: PassageEntityInterface;
	[[psg], context] = this.range(passage, [], passage.start_context);
	// If it's at the end of the chapter, try the first verse of the next chapter (unless at the end of a book). Only try if the start verse is valid.
	if (
		psg.passages[0].valid.messages.end_verse_not_exist &&
		!psg.passages[0].valid.messages.start_verse_not_exist &&
		!psg.passages[0].valid.messages.start_chapter_not_exist &&
		context.c != null
	) {
		// Get rid of the previous attempt to find the next verse (from earlier in this function).
		passage.value.pop();
		// Construct a `cv` object that points to the first verse of the next chapter. The `context.c` always indicates the current chapter. The indices don't matter because we discard this entire object once we're done with it.
		passage.value.push({
			type: "cv",
			indices: passage.indices,
			value: [
				{
					type: "c",
					value: [{
						type: "integer",
						value: context.c + 1,
						indices: passage.indices
						}],
					indices: passage.indices
				},
				{
					type: "v",
					value: [{
						type: "integer",
						value: 1,
						indices: passage.indices
					}],
					indices: passage.indices
				}
			]
		});
		// Try parsing again with the adjusted "next chapter" logic.
		[[psg], context] = this.range(passage, [], passage.start_context);
	}
	// Set the indices to include the end of the range (the "n" in Polish).
	psg.value[0].indices = psg.value[1].indices;
	psg.value[0].absolute_indices = psg.value[1].absolute_indices;
	// Remove the temporary end object.
	psg.value.pop();
	// Remove warnings about non-existent end verses/chapters because "n" means we intended to go forward.
	for (const key of ["end_verse_not_exist", "end_chapter_not_exist"]) {
		delete passage.passages[0].valid.messages[key];
	}
	// `translations` and `absolute_indices` are handled in `this.range`.
	accum.push(psg);
	return [accum, context];
}

// Handle a sequence of references. This is the only function that can return more than one object in the `passage.passages` array.
private sequence(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	passage.passages = [];
	for (const obj of passage.value) {
		let psg: PassageEntityInterface;
		[[psg], context] = this.handle_array(obj, [], context);
		// There's only more than one `sub_psg` if there was a range error.
		for (const sub_psg of psg.passages) {
			// Inherit the `type` from the parent if it doesn't already exist.
			sub_psg.type ??= psg.type;
			// Add the indices so we can possibly retrieve them later, depending on our `sequence_combination_strategy`.
			sub_psg.absolute_indices ??= psg.absolute_indices;
			// Apply translations if present in the start_context.
			if (psg.start_context.translations) {
				sub_psg.translations = psg.start_context.translations;
			}
			// Save the index of any closing punctuation if the sequence ends with a `sequence_post_enclosed`.
			sub_psg.enclosed_absolute_indices = (psg.type === "sequence_post_enclosed") ? [ ...psg.absolute_indices ] : [-1, -1];
			passage.passages.push(sub_psg);
		}
	}
	// If there are no absolute_indices yet, set them now.
	if (!passage.absolute_indices) {
		// If it's `sequence_post_enclosed`, don't snap the end index; include the closing punctuation.
		if (passage.passages.length > 0 && passage.type === "sequence") {
			passage.absolute_indices = [
				passage.passages[0].absolute_indices[0],
				passage.passages[passage.passages.length - 1].absolute_indices[1]
			];
		} else {
			passage.absolute_indices = this.get_absolute_indices(passage.indices);
		}
	}
	accum.push(passage);
	return [accum, context];
}

// Handle a sequence like "Ps 119 (118)," with parentheses. We want to include the closing parenthesis in the indices if `sequence_combination_strategy` is `combine` or if there's a consecutive.
private sequence_post_enclosed(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.sequence(passage, accum, context);
}

// Handle a verse, either as part of a sequence or because someone explicitly wrote "verse".
private v(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	const verse_integer = (passage.type === "integer") ? passage : this.pluck("integer", passage.value);
	let v = verse_integer.value;
	const partial = this.get_partial_verse(verse_integer);
	// The chapter context might not be set if it follows a book in a sequence.
	const c = (context.c != null) ? context.c : 1;
	const valid = this.validate_ref(passage.start_context.translations, { b: context.b!, c, v });
	const [, fixed_v] = this.fix_start_zeroes(valid, 0, v);
	passage.passages = [{
		start: { b: context.b, c, v: fixed_v },
		end: { b: context.b, c, v: fixed_v },
		valid
	}];
	if (passage.start_context.translations) {
		passage.passages[0].translations = structuredClone(passage.start_context.translations);
	}
	if (partial != null) {
		passage.passages[0].start.p = partial;
		passage.passages[0].end.p = partial;
	}
	passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
	accum.push(passage);
	context.v = fixed_v;
	return [accum, context];
}

// ## Ranges
// Handle any type of start and end range. It doesn't directly return multiple passages, but if there's an error parsing the range, we may convert it into a sequence.
private range(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	let [start, end] = passage.value;
	// `this.handle_obj` always returns exactly one object that we're interested in.
	[[start], context] = this.handle_obj(start, [], context);
	// Treat `Matt 5-verse 6` as Matt.5.6
	if (
		end.type === "v" &&
		this.options.end_range_digits_strategy === "verse" &&
		(
			(start.type === "bc" && !start.passages?.[0]?.valid?.messages?.start_chapter_not_exist_in_single_chapter_book) ||
			start.type === "c"
		)
	) {
		// If we had to change the `type`, reflect that here.
		passage.value[0] = start;
		return this.range_change_integer_end(passage, accum);
	}
	[[end], context] = this.handle_obj(end, [], context);
	// If we had to change the start or end `type`s, make sure that's reflected in the `value`.
	passage.value = [start, end];
	// Similarly, if we had to adjust the indices, make sure they're reflected in the indices for the range.
	passage.indices = [start.indices[0], end.indices[1]];
	// We'll also need to recalculate these if they exist.
	delete passage.absolute_indices;
	// Create the prospective start and end objects that will end up in `passage.passages`.
	const start_obj: StartEndInterface = {
		b: start.passages[0].start.b,
		c: start.passages[0].start.c,
		v: start.passages[0].start.v,
		type: start.type
	};
	if (start.passages[0].start.p != null) {
		start_obj.p = start.passages[0].start.p;
	}
	if (start.passages[0].start.p_if_verse != null) {
		start_obj.p_if_verse = start.passages[0].start.p_if_verse;
	}
	const end_obj: StartEndInterface = {
		b: end.passages[0].end.b,
		c: end.passages[0].end.c,
		v: end.passages[0].end.v,
		type: end.type
	};
	if (end.passages[0].end.p != null) {
		end_obj.p = end.passages[0].end.p;
	}
	if (end.passages[0].end.p_if_verse != null) {
		end_obj.p = end.passages[0].end.p_if_verse;
	}
	if (start.passages[0].start.p_if_verse != null) {
		start_obj.p_if_verse = start.passages[0].start.p_if_verse;
	}
	// Make sure references like `Ps 20:1-0:4` don't change to `Ps 20:1-1:4`. In other words, don't upgrade zero end ranges.
	if (end.passages[0].valid.messages.start_chapter_is_zero) {
		end_obj.c = 0;
	}
	if (end.passages[0].valid.messages.start_verse_is_zero) {
		end_obj.v = 0;
	}
	const valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
	// If it's valid, sometimes we want to return the value from `this.range_handle_valid_end`, and sometimes not; it depends on what kinds of corrections we need to make.
	if (valid.valid) {
		const [return_now, return_value] = this.range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum);
		if (return_now) {
			return return_value as PassageReturn;
		}
	// If it's invalid, always return the value.
	} else {
		return this.range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum);
	}
	// We've already reset the indices to match the indices of the contained objects.
	passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
	passage.passages = [{
		start: start_obj,
		end: end_obj,
		valid
	}];
	if (passage.start_context.translations) {
		passage.passages[0].translations = structuredClone(passage.start_context.translations);
	}
	// We may need to filter out books on their own depending on the `book_alone_strategy` or the `book_range_strategy`.
	if (start_obj.type === "b") {
		passage.type = (end_obj.type === "b") ? "b_range" : "b_range_start";
	} else if (end_obj.type === "b") {
		passage.type = "range_end_b";
	}
	accum.push(passage);
	return [accum, context];
}

// For Ps 122-23, treat the 23 as 123.
private range_change_end(passage: PassageEntityInterface, accum: PassageEntityInterface[], new_end: number): PassageReturn {
	const [start, end] = passage.value;		
	// Modify `end` in-place with values from `new_end`. The `value` and `original_value` are numbers.
	if (end.type === "integer") {
		end.original_value = end.value;
		end.value = new_end;
	} else if (end.type === "v") {
		const new_obj = this.pluck("integer", end.value);
		new_obj.original_value = new_obj.value;
		new_obj.value = new_end;
	} else if (end.type === "cv") {
		// Get the chapter object and assign it (in place) the new value.
		const new_obj = this.pluck_integer("c", end.value);
		new_obj.original_value = new_obj.value;
		new_obj.value = new_end;
	}
	// Now that there's a new `end` value, reparse it as expected.
	return this.handle_obj(passage, accum, passage.start_context);	}

// For "Jer 33-11", treat the "11" as a verse.
private range_change_integer_end(passage: PassageEntityInterface, accum: PassageEntityInterface[]): PassageReturn {
	const [start, end] = passage.value;
	// We want to retain the originals beacuse a future reparsing may lead to a different outcome.
	passage.original_type ??= passage.type;
	passage.original_value ??= [start, end];
	// The `start.type` is only `bc`, `c`, or `integer`; we're just adding a `v` for the first two.
	passage.type = (start.type === "integer") ? "cv" : start.type + "v";
	// We just changed the `passage.type` to `cv`, so turn the first object into a `c` object so that it'll parse correctly.
	if (start.type === "integer") {
		passage.value[0] = {
			type: "c",
			value: [start],
			indices: start.indices
		};
	}
	// If the end was an integer, wrap it in a `v` object to match the expected `cv` or `bcv` format so that it'll parse correctly.
	if (end.type === "integer") {
		passage.value[1] = {
			type: "v",
			value: [end],
			indices: end.indices
		};
	}
	return this.handle_obj(passage, accum, passage.start_context);
}
// If a new end chapter/verse in a range may be necessary, calculate it.
private range_check_new_end(translations: TranslationSequenceInterface[], start_obj: StartEndInterface, end_obj: StartEndInterface, valid: ValidInterface): number {
	let new_end = 0;
	let type: "c" | "v";
	// See whether a digit might be omitted (e.g., Gen 22-4 = Gen 22-24; Gen 22:14-5 = Gen 22:14-15).
	if (valid.messages?.end_chapter_before_start) {
		type = "c";
	} else if (valid.messages?.end_verse_before_start) {
		type = "v";
	} else {
		return new_end;
	}
	// If we suspect a missing digit, try to guess the new end value.
	new_end = this.range_get_new_end_value(start_obj, end_obj, valid, type);
	if (new_end > 0) {
		// Validate the newly guessed end reference to ensure it's valid before committing to it.
		const obj_to_validate = {
			b: end_obj.b,
			c: end_obj.c,
			v: end_obj.v
		};
		obj_to_validate[type] = new_end;
		// If the new guess isn't valid, then don't return a suggestion.
		if (!this.validate_ref(translations, obj_to_validate).valid) {
			new_end = 0;
		}
	}
	return new_end;
}

// Handle ranges with a book as the end of the range ("Gen 2-Exod"). It's not `b_range_end` because only objects that start with an explicit book name should start with `b`.
private range_end_b(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.range(passage, accum, context);
}

// If a sequence has an end chapter/verse that's before the the start, check to see whether it can be salvaged: Gen 28-9 = Gen 28-29; Ps 101-24 = Ps 101-124. The `key` parameter is either `c` (for chapter) or `v` (for verse).
private range_get_new_end_value(start_obj: StartEndInterface, end_obj: StartEndInterface, valid: ValidInterface, key: "c" | "v"): number {
	let new_end = 0;
	// If it's `0`, we can't salvage it by adding digits.
	if (
		(key === "c" && valid.messages?.end_chapter_is_zero) ||
		(key === "v" && valid.messages?.end_verse_is_zero)) {
		return new_end;
	}
	// `54-5`, not `54-43`, `54-3`, or `54-4`. The logic here checks if incorporating the same tens digit makes sense.
	if (
		start_obj[key] >= 10 &&
		end_obj[key] < 10 &&
		start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]) {
		// Add the start tens digit to the original end value: 54-5 = 54 through 50 + 5.
		new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10);
	// 123-40, not 123-22 or 123-23; 123-4 is taken care of in the `if`.
	} else if (
		start_obj[key] >= 100 &&
		end_obj[key] < 100 &&
		start_obj[key] - 100 < end_obj[key]) {
		// Add 100 to the original end value: 100-12 = 100 through 100 + 12.
		new_end = end_obj[key] + 100;
	}
	return new_end;
}

// The range doesn't look valid, but maybe we can fix it. If not, convert it to a sequence.
private range_handle_invalid(valid: ValidInterface, passage: PassageEntityInterface, start: any, start_obj: StartEndInterface, end: any, end_obj: StartEndInterface, accum: PassageEntityInterface[]): PassageReturn {
	// Is it not valid because the end is before the start and the `end` is an `integer` (Matt 15-6) or a `cv` (Matt 15-6:2) (since anything else resets our expectations)? Only go with a `cv` if it's the chapter that's too low (to avoid doing weird things with 31:30-31:1).
	if (
		(valid.valid === false &&
			(valid.messages?.end_chapter_before_start ||
				valid.messages?.end_verse_before_start) &&
			(end.type === "integer" ||
				end.type === "v")
		) ||
		(valid.valid === false &&
			valid.messages?.end_chapter_before_start &&
				end.type === "cv")
		) {
		const new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
		// If that's the case, then reparse the current passage object after correcting the end value, which is an integer.
		if (new_end > 0) {
			return this.range_change_end(passage, accum, new_end);
		}
	}
	// If someone enters "Jer 33-11", they probably mean "Jer.33.11"; as in `this.range_handle_valid`, this may be too clever for its own good.
	if (
		this.options.end_range_digits_strategy === "verse" &&
		start_obj.v == null &&
		(end.type === "integer" || end.type === "v")
		) {
		// I don't know that `end.type` can ever be `v` here. Such a `c-v` pattern is parsed as `cv`.
		const temp_value = (end.type === "v") ? this.pluck("integer", end.value) : end.value;
		const temp_valid = this.validate_ref(passage.start_context.translations, {
			b: start_obj.b,
			c: start_obj.c,
			v: temp_value
		});
		if (temp_valid.valid) {
			return this.range_change_integer_end(passage, accum);
		}
	}
	// Otherwise, if we couldn't fix the range, then treat the range as a sequence. We want to retain the original `type` and `value` in case we need to reparse it differently later.
	passage.original_type ??= passage.type;
	passage.type = "sequence";
	// The additional arrays here are used for the sequence.
	[passage.original_value, passage.value] = [[start, end], [[start], [end]]];
	// Don't use the `context` object because we changed it in `this.range`.
	return this.sequence(passage, accum, structuredClone(passage.start_context));
}

// The range looks valid, but we should check for some special cases.
private range_handle_valid(valid: ValidInterface, passage: PassageEntityInterface, start: any, start_obj: StartEndInterface, end: any, end_obj: StartEndInterface, accum: PassageEntityInterface[]): [boolean, PassageReturn | null] {
	// If Heb 13-15, treat it as Heb 13:15. This may be too clever for its own good. We check the `passage_existence_strategy` because otherwise `Gen 49-76` becomes `Gen.49.76`.
	if (
		valid.messages?.end_chapter_not_exist &&
		this.options.end_range_digits_strategy === "verse" &&
		!start_obj.v &&
		(end.type === "integer" || end.type === "v") &&
		this.options.passage_existence_strategy.indexOf("v") >= 0) {
		const temp_value = (end.type === "v") ? this.pluck("integer", end.value) : end.value;
		const temp_valid = this.validate_ref(passage.start_context.translations, {
				b: start_obj.b,
				c: start_obj.c,
				v: temp_value
			});
		// Convert the end integer into a verse.
		if (temp_valid.valid) {
			return [true, this.range_change_integer_end(passage, accum)];
		}
	}
	// Otherwise, snap start/end chapters/verses if they're too high or low.
	this.range_validate(valid, start_obj, end_obj, passage);
	return [false, null];
}

// If the end object goes past the end of the book or chapter, snap it back to a verse that exists.
private range_validate(valid: ValidInterface, start_obj: StartEndInterface, end_obj: StartEndInterface, passage: PassageEntityInterface): void {
	// If it's valid but the end range goes too high, snap it back to the appropriate chapter or verse.
	if (
		valid.messages?.end_chapter_not_exist ||
		valid.messages?.end_chapter_not_exist_in_single_chapter_book
		) {
		// `end_chapter_not_exist` gives the highest chapter for the book. This code originally preserved the original `end_obj.c` as`end_obj.original_c`, but it's never used anywhere. If it were preserved, it would need to be deleted in `this.next_v`.
		end_obj.c = valid.messages.end_chapter_not_exist ?? valid.messages.end_chapter_not_exist_in_single_chapter_book;
		// If we've snapped it back to the last chapter and there's a verse, also snap to the end of that chapter. If we've already overshot the chapter, there's no reason to think we've gotten the verse right; Gen 50:1-51:1 = Gen 50:1-26 = Gen 50. If there's no verse, we don't need to worry about it. The `end_verse_not_exist` is set to the last verse of the chapter.
		if (end_obj.v != null) {
			end_obj.v = this.validate_ref(passage.start_context.translations, {
				b: end_obj.b,
				c: end_obj.c,
				v: 999 }).messages!.end_verse_not_exist;
			// If the range ended at, say, Exodus 41:0, make sure we're not going to change it to Exodus 41:1 at some point.
			delete valid.messages.end_verse_is_zero;
		}
	} else if (valid.messages?.end_verse_not_exist) {
		// If the end verse doesn't exist, snap to the maximum verse. Originally, `end_obj.v` was preserved `end_obj.original_v` was preserved here, but it's not necessary. If it were prserved, it would need to be deleted in `this.next_v`.
		end_obj.v = valid.messages.end_verse_not_exist;
		// Don't preserve partial verses if it's snapped back.
		delete end_obj.p;
	}
	// If a zero verse or chapter is present and not allowed, snap it to `1`. These values are always `1`.
	if (valid.messages?.end_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
		end_obj.v = valid.messages.end_verse_is_zero;
	}
	if (valid.messages?.end_chapter_is_zero) {
		end_obj.c = valid.messages.end_chapter_is_zero;
	}
	// Fix start zeroes if needed.
	[start_obj.c, start_obj.v] = this.fix_start_zeroes(valid, start_obj.c, start_obj.v);
}

// ## Stop Token
// Include it in `accum` so that it can stop backpropagation for translations. No context goes forward or backward past a `stop` token.
private stop(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = {};
	accum.push(passage);
	return [accum, {}];
}

// ## Translations
// Even a single translation ("NIV") appears as part of a translation sequence. Here we handle the sequence and apply the translations to any previous passages lacking an explicit translation: in "Matt 1, 5 ESV," both `Matt 1` and `5` get applied, but in "Matt 1 NIV, 5 ESV," NIV only applies to Matt 1, and ESV only applies to Matt 5.
private translation_sequence(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	const translations: TranslationSequenceInterface[] = [];
	// First get all the translations in the sequence; the first one is separate from the others (which may not exist).
	translations.push({
        translation: this.books[passage.value[0].value].parsed as string,
        system: "default",
        osis: ""
    });
	// Then get the rest (if they exist).
	for (const val of passage.value[1]) {
		// `val` is an array at this point.
		const translation = this.books[this.pluck("translation", val).value].parsed as string;
		// `translation` (if it exists) is the literal, lower-cased match.
		if (translation) {
			translations.push({
				translation,
				system: "default",
				osis: ""
			});
		}
	}
	// We need some metadata to do this right.
	for (const translation of translations) {
		// Do we know anything about this translation? If so, use that. If not, use the default.
		if (this.translations.aliases[translation.translation]) {
			// `system` is what we use internally to get bcv data for the translation.
			translation.system = this.translations.aliases[translation.translation].system;
			// `osis` is what we'll eventually use in output.
			translation.osis = this.translations.aliases[translation.translation].osis || translation.translation.toUpperCase();
		} else {
			// If we don't know what the correct abbreviation should be, then just upper-case what we have.
			translation.osis = translation.translation.toUpperCase();
		}
	}
	// Apply the new translations to the existing objects if there are previously parsed passages.
	if (accum.length > 0) {
		context = this.translation_sequence_apply(accum, translations);
	}
	// We may need these indices later, depending on how we want to output the data. Always recalculate them to take the new translation into account: `Rom KJV` should reflect `0, 7` here because the `translation` gets added to the `b` object.
	passage.absolute_indices = this.get_absolute_indices(passage.indices);
	// Include the `translation_sequence` object in `accum` so that we can handle any later `translation_sequence` objects without overlapping this one.
	accum.push(passage);
	// Don't carry over the translations into any later references; translations only apply backwards.
	this.reset_context(context, ["translations"]);
	return [accum, context];
}

// Go back and find the earliest already-parsed passage without a translation. We start with 0 because the below loop will never yield a 0.
private translation_sequence_apply(accum: PassageEntityInterface[], translations: TranslationSequenceInterface[]): ContextInterface {
	let use_i = 0;
	// Start with the most recent and go backward--we don't want to overlap another `translation_sequence`.
	for (let i = accum.length - 1; i >= 0; i--) {
		// With a new translation comes the possibility that a previously invalid reference will become valid, so reset it to its original type. For example, a multi-book range may be correct in a different translation because the books are in a different order.
		if (accum[i].original_type) {
			accum[i].type = accum[i].original_type;
		}
		if (accum[i].original_value) {
			accum[i].value = accum[i].original_value;
		}
		// we hit a translation sequence, and we know that the item following it is the first one we care about. Similarly, translations shouldn't propagate past a `stop` token.
		if (accum[i].type === "translation_sequence" || accum[i].type === "stop") {
			use_i = i + 1;
			break;
		}
	}
	// Include the translations in the start context. `use_i` === `accum.length` if there are two translations sequences in a row separated by, e.g., numbers ("Matt 1 ESV 2-3 NIV"). This is unusual.
	let context: ContextInterface;
	if (use_i < accum.length) {
		// Apply the translations and re-parse from `use_i`.
		accum[use_i].start_context.translations = translations;
		// The objects in `accum` are replaced in-place, so we don't need to try to merge them back. We re-parse them because the translation may cause previously valid (or invalid) references to flip the other way--if the new translation includes (or doesn't) the Deuterocanonicals, for example. We don't care about the returned accumulator, but we definitely care about the new `context`.
		[, context] = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context);
		// Use the start context from the last translation_sequence if that's all that's available.
	} else {
		context = structuredClone(accum[accum.length - 1].start_context);
	}
	return context;
}

// ## Word
// It doesn't need to be preserved in `accum` since it has no effect on parsing and we don't do anything with it.
private word(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return [accum, context];
}


// ## Utilities
// Pluck the object or value matching a type from an array.
public pluck(type: string, passages: PassageEntityInterface[]): PassageEntityInterface | GrammarMatchInterface | null {
	for (const passage of passages) {
		if (passage && passage.type && passage.type === type) {
			return passage;
		}
	}
	return null;
}

private pluck_integer(type: string, passages: PassageEntityInterface[]): PassageEntityInterface | GrammarMatchInterface | null {
	return this.pluck("integer", this.pluck(type, passages).value);
}

// Pluck the last object or value matching a type, descending as needed into objects.
private pluck_last_recursively(type: string, passages: PassageEntityInterface[]): any | null {
	for (let i = passages.length - 1; i >= 0; i--) {
		const passage = passages[i];
		// Skip null values.
		if (!passage || !passage.type) {
			continue;
		}
		// Rely on `this.pluck` if we've found a match. It expects an array.
		if (passage.type === type) {
			return this.pluck(type, [passage]);
		}
		// If `passage.type` exists, we know that `passage.value` exists.
		const value = this.pluck_last_recursively(type, passage.value);
		if (value != null) {
			return value;
		}
	}
	return null;
}

// Set available context keys.
private set_context_from_object(context: ContextInterface, keys: string[], obj: ContextInterface) {
	for (const key of keys) {
		if (obj[key] == null) {
			continue;
		}
		context[key] = obj[key]
	}
}

// Delete existing context keys if, for example, starting with a new book. Which keys are deleted depends on the caller.
private reset_context(context: ContextInterface, keys: string[]): void {
	for (const key of keys) {
		delete context[key];
	}
}

private get_partial_verse(object_with_partial: GrammarMatchInterface): string | null {
	if (object_with_partial.type !== "integer") {
		object_with_partial = this.pluck("integer", object_with_partial.value);
	}
	if (typeof object_with_partial.partial === "string") {
		return object_with_partial.partial;
	}
	return null;
}

// If the start chapter or verse is 0 and the appropriate option is set to `upgrade`, convert it to a 1.
private fix_start_zeroes(valid: ValidInterface, c: number | undefined, v: number | undefined = undefined): (number | undefined)[] {
	if (valid.messages?.start_chapter_is_zero && this.options.zero_chapter_strategy === "upgrade") {
		c = valid.messages.start_chapter_is_zero;
	}
	if (valid.messages?.start_verse_is_zero && this.options.zero_verse_strategy === "upgrade") {
		v = valid.messages.start_verse_is_zero;
	}
	return [c, v];
}

// Given a string and initial index, calculate indices for parts of the string. For example, a string that starts at index 10 might have a book that pushes it to index 12 starting at its third character.
private calculate_indices(match: string, adjust: number): IndicesInterface[] {
	// This gets switched out the first time in the loop; the first item is never a book even if a book is the first part of the string--there's an empty string before it.
	let switch_type = "book";
	const indices: IndicesInterface[] = [];
	let match_index = 0;
	if (typeof adjust !== "number") {
		adjust = parseInt(adjust, 10);
	}
	// Split on control characters.
	for (let part of match.split(/[\x1e\x1f]/)) {
		// Start off assuming it's not a book. A translation is also considered a "book" for the purposes of this loop.
		switch_type = (switch_type === "book") ? "rest" : "book";
		const part_length = part.length;
		// Empty strings don't move the index. This could happen with consecutive books.
		if (part_length === 0) {
			continue;
		}
		// If it's a book, then get the start index of the actual book, add the length of the actual string, then subtract the length of the integer id and the two surrounding characters.
		if (switch_type === "book") {
			// Remove any stray extra indicators and convert it to a number.
			const part_i = parseInt(part.replace(/\/\d+$/, ""), 10);
			// Get the length of the id + the surrounding characters. We want the `end` to be the position, not the length. If the part starts at position 0 and is one character (i.e., three characters total, or `\x1f0\x1f`), `end` should be 1, since it occupies positions 0, 1, and 2, and we want the last character to be part of the next index so that we keep track of the end. For example, with "Genesis" at start index 0, the index starting at position 6 ("s") should be 4. Keep the adjust as-is, but set it next.
			const end_index = match_index + part_length;
			if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
				indices[indices.length - 1].end = end_index;
			} else {
				indices.push({
					start: match_index,
					end: end_index,
					index: adjust
				});
			}
			// If the part is one character (three characters total) starting at `match_index` 0, we want the next `match_index` to be 3; it occupies positions 0, 1, and 2. Similarly, if it's two characters, it should be four characters total.
			match_index += part_length + 2;
			// Use the known `start_index` from the book, subtracting the current index in the match, to get the new. So if the previous `match_index` == 5 and the book's id is 0, the book's `start_index` == 10, and the book's length == 7, we want the next adjust to be 10 + 7 - 8 = 9 (the 8 is the `match_index` where the new `adjust` starts): 4(+5) = 9, 5(+5) = 10, 6(+5) = 11, 7(+5) = 12, 8(+9) = 17.
			adjust = this.books[part_i].start_index as number + this.books[part_i].value.length - match_index;
			indices.push({
				start: end_index + 1,
				end: end_index + 1,
				index: adjust
			});
		} else {
			// The `- 1` is because we want the `end` to be the position of the last character. If the part starts at position 0 and is three characters long, the `end` should be two, since it occupies positions 0, 1, and 2.
			const end_index = match_index + part_length - 1;
			if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
				indices[indices.length - 1].end = end_index;
			} else {
				indices.push({
					start: match_index,
					end: end_index,
					index: adjust
				});
			}
			match_index += part_length;
		}
	}
	return indices;
}

// Find the absolute string indices of start and end points.
private get_absolute_indices([start, end]: number[]): number[] {
	let start_out: number | null = null;
	let end_out: number | null = null;

	// `this.indices` contains the absolute indices for each range of indices in the string.
	for (const index of this.indices) {
		// If we haven't found the absolute start index yet, set it.
		if (start_out === null && index.start <= start && start <= index.end) {
			start_out = start + index.index;
		}
		// This may be in the same loop iteration as `start`. The `+ 1` matches Twitter's implementation of indices, where start is the character index and end is the character after the index. So `Gen` is `[0, 3]`.
		if (index.start <= end && end <= index.end) {
			end_out = end + index.index + 1;
			break;
		}
	}
	return [start_out as number, end_out as number];
}

// Apply common transformations at the end of handling a passage object with a book.
private normalize_passage_and_alternates(passage: PassageEntityInterface, alternates: Entity[], adjust_end_index_by: number=0): void {
	// If no valid variations were found, use the first one anyway.
	if (passage.passages.length === 0) {
		passage.passages.push(alternates.shift());
	}
	// If there are alternate interpretations, store them.
	if (alternates.length > 0) {
		passage.passages[0].alternates = alternates;
	}
	// If translations were present in the start context, apply them to the passage.
	if (passage.start_context.translations) {
		passage.passages[0].translations = passage.start_context.translations;
	}
	// Compute absolute indices if not already set or if they may need adjusting.
	if (passage.absolute_indices == null || adjust_end_index_by !== 0) {
		passage.absolute_indices = this.get_absolute_indices(passage.indices);
		if (adjust_end_index_by !== 0) {
			passage.absolute_indices[1] += adjust_end_index_by;
		}
	}
}

// ## Validators
// Given a start and optional end bcv object, validate that the verse exists and is valid. It returns a `true` value for `valid` if any of the translations is valid.
private validate_ref(translations: TranslationSequenceInterface[] | null, start: StartEndInterface, end: StartEndInterface | null = null): ValidInterface {
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
private validate_end_ref(system: string, start: StartEndInterface, end: StartEndInterface, valid: boolean, messages: MessageInterface): [boolean, MessageInterface] {
	// All keys always exist in `current`.
	const order_system = (this.translations.systems[system]?.order) ? system : "current";
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
	if (end.v === 0) {
		messages.end_verse_is_zero = 1;
		if (this.options.zero_verse_strategy === "error") {
			valid = false;
		} else if (this.options.zero_verse_strategy === "upgrade") {
			end.v = 1;
		}
	}
	// Matt-Mark
	if (end.b && this.translations.systems[order_system].order[end.b]) {
		valid = this.validate_known_end_book(system, order_system, start, end, valid, messages);
	// Matt 5:1-None 6
	} else {
		valid = false;
		messages.end_book_not_exist = true;
	}
	return [valid, messages];
}

// Validate when the end book is known to exist. This function makes `validate_end_ref` easier to follow.
private validate_known_end_book(system: string, order_system: string, start: StartEndInterface, end: StartEndInterface, valid: boolean, messages: MessageInterface) {
	// Use the translation-specific number of chapters if it exists; otherwise, use the current versification system.
	const chapter_array = this.translations.systems[system]?.chapters?.[end.b] || this.translations.systems.current.chapters[end.b];
	// Even if the `passage_existence_strategy` doesn't include `c`, make sure to treat single-chapter books as single-chapter books.
	if (end.c == null && chapter_array.length === 1) {
		end.c = 1;
	}
	// Mark 4-Matt 5, None 4-Matt 5
	if (
		this.translations.systems[order_system].order[start.b] != null &&
		this.translations.systems[order_system].order[start.b] > this.translations.systems[order_system].order[end.b]
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

// Validate and apply options when we know the start book is valid. This function makes `validate_start_ref` easier to follow.
private validate_known_start_book(system: string, start: StartEndInterface, messages: MessageInterface): boolean {
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
	if (start.v === 0) {
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
		const chapter_array_length = chapter_array.length
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
private validate_start_ref(system: string, start: StartEndInterface, messages: MessageInterface): [boolean, MessageInterface] {
	let valid = true;
	// If `order` exists, it's always fully specified; there are no gaps. `chapters` is different--it isn't always fully specified for every book, outside of `current`.
	const order_system = (this.translations.systems[system]?.order) ? system : "current";
	// An unusual situation in which there's no defined start book. This only happens when a `c` becomes dissociated from its `b`.
	if (!start.b) {
		// No book defined
		valid = false;
		messages.start_book_not_defined = true;
	// Matt. The book is a known book.
	} else if (this.translations.systems[order_system].order[start.b]) {
		valid = this.validate_known_start_book(system, start, messages);
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

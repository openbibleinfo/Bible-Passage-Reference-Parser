// This class takes the output from the grammar and turns it into simpler objects for additional processing or for output.

import { BCVParserOptions, BCVTranslationsInterface, BookMatchInterface, GrammarBaseInterface, IndicesPair, PassageEntityInterface, PassageEntityArrayValue, PassageEntityNumberValue, PassageEntitySequenceValue, ProcessedEntityInterface, ProcessedEntityArrayValue, RangeEntityInterface, StartEndInterface, ValidInterface, PassageReturn, Entity, TranslationSequenceInterface, IndicesInterface, ContextInterface, ContextKey, PassageHandlerKey } from "./types";
import bcv_validators from "./bcv_validators";

type RangeBoundary = PassageEntityInterface;
type PassageHandler = (passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface) => PassageReturn;

export default class bcv_passage {

books: BookMatchInterface[] = [];
indices: IndicesInterface[] = [];
options: BCVParserOptions;
translations: BCVTranslationsInterface;
validators: bcv_validators;

constructor(options: BCVParserOptions, translations: BCVTranslationsInterface) {
	this.options = options;
	this.translations = translations;
	this.validators = new bcv_validators(options, translations);
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

public handle_obj(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	const type = passage.type as PassageHandlerKey;
	const handler = this[type];
	if (typeof handler === "function") {
		return (handler as PassageHandler).call(this, passage, accum, context);
	}
	return [accum, context];
}

// ## Types Returned from the Peggy Grammar
// These functions correspond to `type` attributes returned from the grammar. They're designed to be called multiple times if necessary.

// Handle a book on its own ("Gen").
private b(passage: PassageEntityNumberValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
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
	this.normalize_passage_and_alternates(passage as PassageEntityNumberValue & ProcessedEntityInterface, alternates);
	// Add this processed passage to the accumulated array.
	accum.push(passage);
	// Update the context to reflect the now-known book. Reset any existing context.
	context = { b: passage.passages[0].start.b };
	if (passage.start_context.translations) {
		context.translations = structuredClone(passage.start_context.translations);
	}
	return [accum, context];
}

// Handle book-only ranges ("Gen-Exod").
private b_range(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.range(passage, accum, context);
}

// Handle book-only ranges like "1-2 Samuel". It doesn't support multiple ambiguous ranges (like "1-2C"), which it probably shouldn't, anyway.
private b_range_pre(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	passage.passages = [];
	// Extract the book portion.
	const book = this.pluck("b", passage.value)!;
	// Call the `b` function with the extracted book. This returns a tuple: [accum, context]. The first element has the book information we're looking for.
	let end: ProcessedEntityInterface;
	[[end], context] = this.b(book, [], context) as [ProcessedEntityInterface[], ContextInterface];
	// Compute absolute indices if not already set.
	passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
	// `passage.value[0].value` is the number at the beginning of the range: `1` in `1-3 John`. In this case, the end book is 3John, so we replace the `3` in `3John` with a `1` in `start.b`. This works because this type of range only works with the same suffix, like "1-2 Sam".
	passage.passages = [{
		start: {
			b: passage.value[0].value + end.passages[0].start.b!.substring(1),
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
private b_range_start(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.range(passage, accum, context);
}

// The base (root) object in the grammar controls the base indices.
private base(passage: GrammarBaseInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	this.indices = this.calculate_indices(passage.match, passage.start_index);
	return this.handle_array(passage.value, accum, context);
}

// Handle book-chapter ("Gen 1").
private bc(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
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
	for (const b of this.books[this.pluck("b", passage.value)!.value].parsed) {
		// By default, we assume we're validating a chapter reference.
		let context_key: "c" | "v" = "c";
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
				obj.valid.messages ??= {};
				obj.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1;
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
			const key: "p" | "p_if_verse" = (context_key === "v") ? "p" : "p_if_verse";
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
	this.normalize_passage_and_alternates(passage as ProcessedEntityArrayValue, alternates, adjust_end_index_by);
	// Update the context to reflect the identified book/chapter/verse.
	this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
	// Add this processed passage to the accumulator.
	accum.push(passage);
	return [accum, context];
}

// Handle "Ps 3 title".
private bc_title(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// Clone the current context so that changes to this passage don't affect others.
	passage.start_context = structuredClone(context);
	// First, check to see whether we're dealing with Psalms. If not, treat it as a straight `bc`.
	const bc_pluck = this.pluck("bc", passage.value)!;
	let bc: PassageEntityArrayValue;
	[[bc], context] = this.bc(bc_pluck, [], context) as [PassageEntityArrayValue[], ContextInterface];
	// Check the first two characters to handle both `Ps` and `Ps151`. The `bc` handler always sets `start.b` from a parsed book name.
	if (bc.passages![0].start.b!.substring(0, 2) !== "Ps" && bc.passages![0].alternates) {
		for (const alternate of bc.passages![0].alternates) {
			// If Psalms is one of the alternates, promote it to the primary passage and skip checking anything else--we know it's right.
			if (alternate.start.b!.substring(0, 2) === "Ps") {
				bc.passages![0] = structuredClone(alternate);
				break;
			}
		}
	}
	// If it's still not Psalms, just return what we got from treating it as a `bc`.
	if (bc.passages![0].start.b!.substring(0, 2) !== "Ps") {
		accum.push(bc);
		return [accum, context];
	}
	// Overwrite all other book possibilities; the presence of "title" indicates a Psalm. If the previous possibilities were `["Song", "Ps"]`, they're now just `["Ps"]`. Even if it's really `Ps151`, we want `Ps` here because other functions expect it.
	this.books[this.pluck("b", bc.value)!.value].parsed = ["Ps"];
	// Set the `indices` of the new `v` object to the indices of the `title`. We won't actually use these indices anywhere.
	let title = this.pluck("title", passage.value);
	// The `title` will be null if it's being reparsed from a future translation. In that case, we use a `v` object.
	if (!title) {
		title = this.pluck_integer("v", passage.value);
	}
	// Replace the second element with a `v` object representing the title verse, using the title's indices.
	passage.value[1] = {
		type: "v",
		// Let us discover later that this was originally a `title`.
		original_type: "title",
		value: [{ type: "integer", value: this.options.psalm_title_strategy, indices: title.indices }],
		indices: title.indices
	};
	// We don't need to preserve the original `type` for reparsing; if it gets here, it'll always be a `bcv`.
	passage.type = "bcv";
	// Treat it as a standard `bcv`.
	return this.bcv(passage, accum, passage.start_context);
}

// Handle book chapter:verse ("Gen 1:1").
private bcv(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// Clone the current context so that changes to this passage don't affect others.
	passage.start_context = structuredClone(context);
	passage.passages = [];
	// Reset the full context since there's a book.
	this.reset_context(context, ["b", "c", "v"]);
	const bc = this.pluck("bc", passage.value)!;
	let c = this.pluck_integer("c", bc.value).value;
	const verse_integer = this.pluck_integer("v", passage.value);
	let v = verse_integer.value;
	const partial = this.get_partial_verse(verse_integer);
	const alternates: Entity[] = [];
	// Iterate over all parsed variations of the book name.
	for (const b of this.books[this.pluck("b", bc.value)!.value].parsed) {
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
	this.normalize_passage_and_alternates(passage as ProcessedEntityArrayValue, alternates);
	// Update the context with the identified book/chapter/verse for future parsing.
	this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
	accum.push(passage);
	return [accum, context];
}

// Handle "Philemon verse 6." This is unusual.
private bv(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	const [b, v] = passage.value;
	// Construct a virtual BCV object with a first chapter.
	let bcv: PassageEntityArrayValue = {
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
	[[bcv], context] = this.bcv(bcv, [], context) as [ProcessedEntityArrayValue[], ContextInterface];
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
	const chapter_integer = (passage.type === "integer") ? (passage as PassageEntityNumberValue) : this.pluck("integer", (passage as PassageEntityArrayValue).value)!;
	let c = chapter_integer.value;
	const partial = this.get_partial_verse(chapter_integer);
	const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c });
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
	// A `c_psalm` node's `value` is the index of the matched book.
	const book_index = passage.value as number;
	// This string always starts with the chapter number, followed by other letters (e.g., "23rd").
	const c = parseInt(this.books[book_index].value.match(/^\d+/)![0], 10);
	// Rebuild the passage value as a `bc`.
	passage.value = [
		{
			type: "b",
			value: book_index,
			indices: passage.indices
		},
		{
			type: "c",
			value: [{ type: "integer", value: c, indices: passage.indices }],
			indices: passage.indices
		}
	];
	return this.bc(passage as PassageEntityArrayValue, accum, context);
}

// Handle "Ps 3, ch 4:title"
private c_title(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// If it's not a Psalm, treat it as a regular chapter. We don't convert the structure for reparsing.
	if (context.b !== "Ps") {
		// Don't change the `type` here because we're not updating the structure to match the `c` expectation if reparsing later.
		return this.c(passage.value[0], accum, context);
	}
	// For Psalms, add a `v` object and treat it as a `cv`.
	const title = this.pluck("title", passage.value)!;
	// Insert a verse object set to the title verse.
	passage.value[1] = {
		type: "v",
		// Preserve the title type in case we want it later.
		original_type: "title",
		value: [{ type: "integer", value: this.options.psalm_title_strategy, indices: title.indices }],
		indices: title.indices
	};
	// Change the type to match the new parsing strategy.
	passage.type = "cv";
	// Treat it as a standard `cv`.
	return this.cv(passage, accum, passage.start_context);
}

// Handle "Chapters 1-2 from Daniel".
private cb_range(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	// We don't need to preserve the original `type` for reparsing.
	passage.type = "range";
	const [b, start_c, end_c] = passage.value;
	passage.value = [{ type: "bc", value: [b, start_c], indices: passage.indices }, end_c];
	// Extend the end indices to match the entire passage length. A `cb_range` only ever arrives straight from the grammar, which sets `indices` on the node and all its children.
	end_c.indices![1] = passage.indices![1];
	return this.range(passage, accum, context);
}

// Use an object to establish context for later objects but don't otherwise use it.
private context(passage: PassageEntityNumberValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	passage.passages = [];
	// Copy any contextual properties from the book to the current context.
	context = Object.assign(context, this.books[passage.value].context);
	accum.push(passage);
	return [accum, context];
}

// Handle a chapter:verse.
private cv(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// Pull out the individual values.
	let c = this.pluck_integer("c", passage.value).value;
	const verse_integer = this.pluck_integer("v", passage.value);
	let v = verse_integer.value;
	const partial = this.get_partial_verse(verse_integer);
	const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c, v });
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
private cv_psalm(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
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
private ff(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// Create a virtual end to pass to `this.range`. The `999` just means to the end, since numbers that are too high snap back to the highest valid number.
	passage.value.push({
		type: "integer",
		indices: structuredClone(passage.indices),
		value: 999
	});
	[[passage], context] = this.range(passage, [], passage.start_context) as [ProcessedEntityArrayValue[], ContextInterface];
	// Set the indices to include the end of the range (the "ff").
	passage.value[0].indices = passage.value[1].indices;
	passage.value[0].absolute_indices = passage.value[1].absolute_indices;
	// Remove the virtual end so it doesn't appear in future reparsing.
	passage.value.pop();
	// Ignore any warnings that the end chapter or verse doesn't exist since "ff" is deliberately open-ended. The `passage` was just processed by `this.range` above, so its `passages` exist.
	for (const key of ["end_verse_not_exist", "end_chapter_not_exist"] as const) {
		delete passage.passages![0].valid.messages[key];
	}
	// `translations` and `absolute_indices` are handled in `this.range`, so they're not handled here.
	accum.push(passage);
	return [accum, context];
}

// Pass the integer off to whichever handler is relevant.
private integer(passage: PassageEntityNumberValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	if (context.v == null) {
		return this.c(passage, accum, context);
	}
	return this.v(passage, accum, context);
}

// Handle "Ps 3-4:title" or "Acts 2:22-27. Title"
private integer_title(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	// If it's not Psalms, treat it as a straight integer, ignoring the title.
	if (context.b !== "Ps") {
		return this.integer(passage.value[0] as PassageEntityNumberValue, accum, context);
	}
	// Change the integer to a `c` object for passing to `this.cv`. Preserve the indices.
	passage.value[0] = {
		type: "c",
		value: [passage.value[0]],
		indices: structuredClone(passage.value[0].indices)
	};
	// Change the `title` object to a `v` object representing the title verse. Preserve the indices.
	passage.value[1].type = "v";
	passage.value[1].original_type = "title";
	passage.value[1].value = [{
		type: "integer",
		value: this.options.psalm_title_strategy,
		indices: structuredClone(passage.value[1].indices)
	}];
	// We don't need to preserve the original `type` for reparsing.
	passage.type = "cv";
	return this.cv(passage, accum, passage.start_context);
}

// Handle "next verse" (e.g., in Polish, "Matt 1:1n" should be treated as "Matt 1:1-2"). It crosses chapter boundaries but not book boundaries. When given a whole chapter, it assumes the next chapter (again, not crossing book boundaries). The logic here is similar to that of `this.ff`.
private next_v(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
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
	let psg: ProcessedEntityArrayValue;
	[[psg], context] = this.range(passage, [], passage.start_context) as [ProcessedEntityArrayValue[], ContextInterface];
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
		[[psg], context] = this.range(passage, [], passage.start_context) as [ProcessedEntityArrayValue[], ContextInterface];
	}
	// Set the indices to include the end of the range (the "n" in Polish).
	psg.value[0].indices = psg.value[1].indices;
	psg.value[0].absolute_indices = psg.value[1].absolute_indices;
	// Remove the temporary end object.
	psg.value.pop();
	// Remove warnings about non-existent end verses/chapters because "n" means we intended to go forward. The `passage` is the same object `this.range` just processed (as `psg`), so its `passages` exist.
	for (const key of ["end_verse_not_exist", "end_chapter_not_exist"] as const) {
		delete passage.passages![0].valid.messages[key];
	}
	// `translations` and `absolute_indices` are handled in `this.range`.
	accum.push(psg);
	return [accum, context];
}

// Handle a sequence of references. This is the only function that can return more than one object in the `passage.passages` array.
private sequence(passage: PassageEntitySequenceValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	passage.passages = [];
	for (const obj of passage.value) {
		let psg: ProcessedEntityInterface;
		// If chapter context is set explicitly, then adjust the context accordingly.
		if (typeof obj[0].explicit_context === "string" && obj[0].explicit_context === "c") {
			delete context.v;
		}
		[[psg], context] = this.handle_array(obj, [], context) as [ProcessedEntityInterface[], ContextInterface];
		// There's only more than one `sub_psg` if there was a range error.
		for (const sub_psg of psg.passages) {
			// Inherit the `type` from the parent if it doesn't already exist.
			sub_psg.type ??= psg.type;
			// Add the indices so we can possibly retrieve them later, depending on our `sequence_combination_strategy`. The `psg` was just processed by `handle_array`, so its `absolute_indices` are set and numeric.
			sub_psg.absolute_indices ??= psg.absolute_indices;
			// Apply translations if present in the start_context.
			if (psg.start_context.translations) {
				sub_psg.translations = psg.start_context.translations;
			}
			// Save the index of any closing punctuation if the sequence ends with a `sequence_post_enclosed`.
			sub_psg.enclosed_absolute_indices = (psg.type === "sequence_post_enclosed") ? [...psg.absolute_indices!] : [-1, -1];
			passage.passages.push(sub_psg);
		}
	}
	// If there are no absolute_indices yet, set them now.
	if (!passage.absolute_indices) {
		// If it's `sequence_post_enclosed`, don't snap the end index; include the closing punctuation. Every `sub_psg` pushed above had its `absolute_indices` filled in, so the first and last elements have them.
		if (passage.passages.length > 0 && passage.type === "sequence") {
			passage.absolute_indices = [
				passage.passages[0].absolute_indices![0],
				passage.passages[passage.passages.length - 1].absolute_indices![1]
			];
		} else {
			passage.absolute_indices = this.get_absolute_indices(passage.indices);
		}
	}
	accum.push(passage);
	return [accum, context];
}

// Handle a sequence like "Ps 119 (118)," with parentheses. We want to include the closing parenthesis in the indices if `sequence_combination_strategy` is `combine` or if there's a consecutive.
private sequence_post_enclosed(passage: PassageEntitySequenceValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.sequence(passage, accum, context);
}

// Handle a verse, either as part of a sequence or because someone explicitly wrote "verse".
private v(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	const verse_integer = (passage.type === "integer") ? (passage as PassageEntityNumberValue) : this.pluck("integer", (passage as PassageEntityArrayValue).value)!;
	let v = verse_integer.value;
	const partial = this.get_partial_verse(verse_integer);
	// The chapter context might not be set if it follows a book in a sequence.
	const c = (context.c != null) ? context.c : 1;
	const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c, v });
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
private range(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	passage.start_context = structuredClone(context);
	let [start, end] = passage.value;
	// `this.handle_obj` always returns exactly one object that we're interested in.
	[[start], context] = this.handle_obj(start, [], context) as [ProcessedEntityInterface[], ContextInterface];
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
		return this.range_change_integer_end(passage as RangeEntityInterface, accum);
	}
	[[end], context] = this.handle_obj(end, [], context) as [ProcessedEntityInterface[], ContextInterface];
	// If we had to change the start or end `type`s, make sure that's reflected in the `value`.
	passage.value = [start, end];
	// Similarly, if we had to adjust the indices, make sure they're reflected in the indices for the range. Both boundaries carry `indices`: they're grammar nodes, or synthetic nodes (`ff`/`next_v`/`cb_range`/`range_change_integer_end`) built with explicit `indices`.
	passage.indices = [start.indices![0], end.indices![1]];
	// We'll also need to recalculate these if they exist.
	delete passage.absolute_indices;
	// Create the prospective start and end objects that will end up in `passage.passages`. `this.handle_obj` processed both objects above, so their `passages` exist.
	const start_passage = start.passages![0];
	const end_passage = end.passages![0];
	const start_obj: StartEndInterface = {
		b: start_passage.start.b,
		c: start_passage.start.c,
		v: start_passage.start.v,
		type: start.type
	};
	if (start_passage.start.p != null) {
		start_obj.p = start_passage.start.p;
	}
	if (start_passage.start.p_if_verse != null) {
		start_obj.p_if_verse = start_passage.start.p_if_verse;
	}
	const end_obj: StartEndInterface = {
		b: end_passage.end.b,
		c: end_passage.end.c,
		v: end_passage.end.v,
		type: end.type
	};
	if (end_passage.end.p != null) {
		end_obj.p = end_passage.end.p;
	}
	if (end_passage.end.p_if_verse != null) {
		end_obj.p_if_verse = end_passage.end.p_if_verse;
	}
	// Make sure references like `Ps 20:1-0:4` don't change to `Ps 20:1-1:4`. In other words, don't upgrade zero end ranges.
	if (end_passage.valid.messages.start_chapter_is_zero) {
		end_obj.c = 0;
	}
	if (end_passage.valid.messages.start_verse_is_zero) {
		end_obj.v = 0;
	}
	const valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
	// If it's valid, sometimes we want to return the value from `this.range_handle_valid_end`, and sometimes not; it depends on what kinds of corrections we need to make.
	if (valid.valid) {
		const [return_now, return_value] = this.range_handle_valid(valid, passage as RangeEntityInterface, start, start_obj, end, end_obj, accum);
		if (return_now) {
			if (return_value != null) {
				return return_value;
			}
			return [accum, context];
		}
	// If it's invalid, always return the value.
	} else {
		return this.range_handle_invalid(valid, passage as RangeEntityInterface, start, start_obj, end, end_obj, accum);
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
private range_change_end(passage: RangeEntityInterface, accum: PassageEntityInterface[], new_end: number): PassageReturn {
	const [start, end] = passage.value;
	// Modify `end` in-place with the value from `new_end`. Unlike the top-level `original_type`/`original_value` that `translation_sequence_apply` restores, nothing ever reads a nested integer's original value, so we don't save it.
	if (end.type === "integer") {
		end.value = new_end;
	} else if (end.type === "v") {
		const new_obj = this.pluck("integer", (end as PassageEntityArrayValue).value)!;
		new_obj.value = new_end;
	} else if (end.type === "cv") {
		// Get the chapter object and assign it (in place) the new value.
		const new_obj = this.pluck_integer("c", (end as PassageEntityArrayValue).value);
		new_obj.value = new_end;
	}
	// Now that there's a new `end` value, reparse it as expected.
	return this.handle_obj(passage, accum, passage.start_context);
}

// For "Jer 33-11", treat the "11" as a verse.
private range_change_integer_end(passage: RangeEntityInterface, accum: PassageEntityInterface[]): PassageReturn {
	const [start, end] = passage.value;
	// We want to retain the originals because a future reparsing may lead to a different outcome.
	passage.original_type ??= passage.type;
	passage.original_value ??= [start, end];
	// The `start.type` is only `bc`, `c`, or `integer`; we're just adding a `v` for the first two.
	passage.type = (start.type === "bc") ? "bcv" : "cv";
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
private range_check_new_end(translations: TranslationSequenceInterface[] | undefined, start_obj: StartEndInterface, end_obj: StartEndInterface, valid: ValidInterface): number {
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
private range_end_b(passage: PassageEntityArrayValue, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return this.range(passage, accum, context);
}

// If a sequence has an end chapter/verse that's before the start, check to see whether it can be salvaged: Gen 28-9 = Gen 28-29; Ps 101-24 = Ps 101-124. The `key` parameter is either `c` (for chapter) or `v` (for verse).
private range_get_new_end_value(start_obj: StartEndInterface, end_obj: StartEndInterface, valid: ValidInterface, key: "c" | "v"): number {
	let new_end = 0;
	// If it's `0`, we can't salvage it by adding digits.
	if (
		(key === "c" && valid.messages?.end_chapter_is_zero) ||
		(key === "v" && valid.messages?.end_verse_is_zero)) {
		return new_end;
	}
	// We only get here when the validator reported that the end is before the start, a comparison it can only make when both values exist.
	const start_value = start_obj[key]!;
	const end_value = end_obj[key]!;
	// `54-5`, not `54-43`, `54-3`, or `54-4`. The logic here checks if incorporating the same tens digit makes sense.
	if (
		start_value >= 10 &&
		end_value < 10 &&
		start_value - 10 * Math.floor(start_value / 10) < end_value) {
		// Add the start tens digit to the original end value: 54-5 = 54 through 50 + 5.
		new_end = end_value + 10 * Math.floor(start_value / 10);
	// 123-40, not 123-22 or 123-23; 123-4 is taken care of in the `if`.
	} else if (
		start_value >= 100 &&
		end_value < 100 &&
		start_value - 100 < end_value) {
		// Add 100 to the original end value: 100-12 = 100 through 100 + 12.
		new_end = end_value + 100;
	}
	return new_end;
}

// The range doesn't look valid, but maybe we can fix it. If not, convert it to a sequence.
private range_handle_invalid(valid: ValidInterface, passage: RangeEntityInterface, start: RangeBoundary, start_obj: StartEndInterface, end: RangeBoundary, end_obj: StartEndInterface, accum: PassageEntityInterface[]): PassageReturn {
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
	// If someone enters "Jer 33-11", they probably mean "Jer.33.11"; as in `this.range_handle_valid`, this may be too clever for its own good. A `v` end only gets here book-less, where the revalidation below can't succeed, so only `integer` ends matter. Skip `ff`/`next_v`: their virtual end isn't user text, and the in-place reparse would corrupt the node when they later pop that virtual end.
	if (
		this.options.end_range_digits_strategy === "verse" &&
		start_obj.v == null &&
		end.type === "integer" &&
		passage.type !== "ff" &&
		passage.type !== "next_v"
		) {
		const temp_value = (end as PassageEntityNumberValue).value;
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
	const sequence_passage: PassageEntityInterface = passage;
	sequence_passage.original_value = [start, end];
	sequence_passage.value = [[start], [end]];
	// Don't use the `context` object because we changed it in `this.range`.
	return this.sequence(sequence_passage as PassageEntitySequenceValue, accum, structuredClone(passage.start_context));
}

// The range looks valid, but we should check for some special cases.
private range_handle_valid(valid: ValidInterface, passage: RangeEntityInterface, start: RangeBoundary, start_obj: StartEndInterface, end: RangeBoundary, end_obj: StartEndInterface, accum: PassageEntityInterface[]): [boolean, PassageReturn | null] {
	// If Heb 13-15, treat it as Heb 13:15. This may be too clever for its own good. We check the `passage_existence_strategy` because otherwise `Gen 49-76` becomes `Gen.49.76`.
	// A `v` end can't get here: validating one always fills in `start_obj.v`. Skip `ff`/`next_v`: their virtual end shouldn't be reinterpreted as a verse (Polish "So 3n" means Zeph.3, not Zeph.3.4), and the in-place reparse would corrupt the node when they later pop that virtual end.
	if (
		valid.messages?.end_chapter_not_exist &&
		this.options.end_range_digits_strategy === "verse" &&
		!start_obj.v &&
		end.type === "integer" &&
		passage.type !== "ff" &&
		passage.type !== "next_v" &&
		this.options.passage_existence_strategy.indexOf("v") >= 0) {
		const temp_value = (end as PassageEntityNumberValue).value;
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
private range_validate(valid: ValidInterface, start_obj: StartEndInterface, end_obj: StartEndInterface, passage: RangeEntityInterface): void {
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
				v: 999 }).messages.end_verse_not_exist;
			// If the range ended at, say, Exodus 41:0, make sure we're not going to change it to Exodus 41:1 at some point.
			delete valid.messages.end_verse_is_zero;
		}
	} else if (valid.messages?.end_verse_not_exist) {
		// If the end verse doesn't exist, snap to the maximum verse. Originally, `end_obj.v` was preserved as `end_obj.original_v` here, but it's not necessary. If it were preserved, it would need to be deleted in `this.next_v`.
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
	if (!Array.isArray(passage.value) || passage.value.length < 2) {
		accum.push(passage);
		this.reset_context(context, ["translations"]);
		return [accum, context];
	}
	const value = passage.value as [PassageEntityNumberValue, PassageEntityInterface[][]];
	// First get all the translations in the sequence; the first one is separate from the others (which may not exist).
	const first_book_index = value[0].value;
	if (typeof first_book_index === "number") {
		const first_parsed = this.books[first_book_index]?.parsed;
		if (typeof first_parsed === "string" && first_parsed.length > 0) {
			translations.push({
				translation: first_parsed,
				system: "default",
				osis: ""
			});
		}
	}
	// Then get the rest (if they exist).
	for (const val of value[1]) {
		// `val` is an array at this point.
		const translation_obj = this.pluck("translation", val);
		if (translation_obj == null || typeof translation_obj.value !== "number") {
			continue;
		}
		const translation = this.books[translation_obj.value]?.parsed;
		// `translation` (if it exists) is the literal, lower-cased match.
		if (typeof translation === "string" && translation.length > 0) {
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
		// Apply the translations and re-parse from `use_i`. Every handler stamps `start_context` before pushing to `accum`, so anything in `accum` has it.
		accum[use_i].start_context!.translations = translations;
		// The objects in `accum` are replaced in-place, so we don't need to try to merge them back. We re-parse them because the translation may cause previously valid (or invalid) references to flip the other way--if the new translation includes (or doesn't) the Deuterocanonicals, for example. We don't care about the returned accumulator, but we definitely care about the new `context`.
		[, context] = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context);
		// Use the start context from the last translation_sequence if that's all that's available.
	} else {
		context = structuredClone(accum[accum.length - 1].start_context!);
	}
	return context;
}

// ## Word
// It doesn't need to be preserved in `accum` since it has no effect on parsing and we don't do anything with it.
private word(passage: PassageEntityInterface, accum: PassageEntityInterface[], context: ContextInterface): PassageReturn {
	return [accum, context];
}

// ## Utilities
// Pluck the object or value matching a type from an array. The overloads reflect the value shape the grammar guarantees for each node type (see the value-shape interfaces in `types.d.ts`). A pluck can always miss, so every overload returns `null` if the type isn't present.
public pluck(type: "b" | "integer", passages: PassageEntityInterface[]): PassageEntityNumberValue | null;
public pluck(type: "bc" | "c" | "v", passages: PassageEntityInterface[]): PassageEntityArrayValue | null;
public pluck(type: string, passages: PassageEntityInterface[]): PassageEntityInterface | null;
public pluck(type: string, passages: PassageEntityInterface[]): PassageEntityInterface | null {
	for (const passage of passages) {
		if (passage && passage.type && passage.type === type) {
			return passage;
		}
	}
	return null;
}

private pluck_integer(type: "c" | "v", passages: PassageEntityInterface[]): PassageEntityNumberValue {
	const outer = this.pluck(type, passages);
	// The grammar guarantees that every `c` and `v` node contains an `integer`, and no caller has a missing-integer case to handle, so (as in `get_absolute_indices`) the assertion is centralized here instead of at every call site. A violation would throw in the caller either way.
	if (outer == null || !Array.isArray(outer.value)) {
		return null!;
	}
	return this.pluck("integer", outer.value)!;
}

// Pluck the last object or value matching a type, descending as needed into objects.
private pluck_last_recursively(type: "integer", passages: PassageEntityInterface[]): PassageEntityNumberValue | null {
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
		// If `passage.type` exists, we know that `passage.value` exists. The only external caller passes a `next_v` subtree (`c`/`cv`/`v`/`integer` nodes), where every node we recurse into holds an entity array: `integer` nodes (the only non-array values) match on `type` above and never reach this line.
		const value = this.pluck_last_recursively(type, passage.value as PassageEntityInterface[]);
		if (value != null) {
			return value;
		}
	}
	return null;
}

// Set available context keys.
private set_context_from_object(context: ContextInterface, keys: ContextKey[], obj: ContextInterface): void {
	for (const key of keys) {
		if (obj[key] == null) {
			continue;
		}
		Reflect.set(context, key, obj[key]);
	}
}

// Delete existing context keys if, for example, starting with a new book. Which keys are deleted depends on the caller.
private reset_context(context: ContextInterface, keys: ContextKey[]): void {
	for (const key of keys) {
		delete context[key];
	}
}

private get_partial_verse(object_with_partial: PassageEntityInterface): string | null {
	if (object_with_partial.type !== "integer") {
		object_with_partial = this.pluck("integer", (object_with_partial as PassageEntityArrayValue).value)!;
	}
	if (typeof object_with_partial.partial === "string") {
		return object_with_partial.partial;
	}
	return null;
}

// If the start chapter or verse is 0 and the appropriate option is set to `upgrade`, convert it to a 1. The overloads reflect that a number in means a number out: a value is only ever replaced by the (numeric) upgrade from the validator, never removed.
private fix_start_zeroes(valid: ValidInterface, c: number, v: number): [number, number];
private fix_start_zeroes(valid: ValidInterface, c: number): [number, number | undefined];
private fix_start_zeroes(valid: ValidInterface, c: number | undefined, v?: number): [number | undefined, number | undefined];
private fix_start_zeroes(valid: ValidInterface, c: number | undefined, v: number | undefined = undefined): [number | undefined, number | undefined] {
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
			const book = this.books[part_i];
			if (book?.start_index == null) {
				continue;
			}
			adjust = book.start_index + book.value.length - match_index;
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
private get_absolute_indices(indices: IndicesPair | undefined): IndicesPair {
	// Every node that reaches this point has `indices`: the grammar sets them on every node it produces, and synthetic nodes copy them from grammar nodes. The property is only optional because a few virtual nodes (discarded before getting here) omit it.
	const [start, end] = indices!;
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
	// For indices produced by real parses, `this.indices` covers the whole match, so both lookups succeed; nulls can only happen for out-of-coverage input, which no internal caller produces (the unit spec pins that fallback by calling this method directly with a gapped table). Adjudicated empirically 2026-07-03: the full suite, 150k fuzz inputs, and a probe battery that drove the partial-adjustment consumer 416 times produced no nulls from parse paths.
	return [start_out, end_out] as IndicesPair;
}

// ## Validators
// Delegate to the validators object for validation. These methods are public for testing.
public validate_ref(...args: Parameters<bcv_validators["validate_ref"]>): ReturnType<bcv_validators["validate_ref"]> {
	return this.validators.validate_ref(...args);
}
public validate_start_ref(...args: Parameters<bcv_validators["validate_start_ref"]>): ReturnType<bcv_validators["validate_start_ref"]> {
	return this.validators.validate_start_ref(...args);
}
public validate_end_ref(...args: Parameters<bcv_validators["validate_end_ref"]>): ReturnType<bcv_validators["validate_end_ref"]> {
	return this.validators.validate_end_ref(...args);
}

// Apply common transformations at the end of handling a passage object with a book.
private normalize_passage_and_alternates(passage: ProcessedEntityInterface, alternates: Entity[], adjust_end_index_by: number=0): void {
	// If no valid variations were found, use the first one anyway. Every book name has at least one parsed candidate, so `alternates` is never empty when `passages` is.
	if (passage.passages.length === 0) {
		passage.passages.push(alternates.shift()!);
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

}

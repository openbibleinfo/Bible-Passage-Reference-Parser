"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_passage auto coverage", () => {
	function makeManager() {
		const parser = new bcv_parser(lang);
		return parser.passage;
	}

	it("covers null handling in handle_array and non-handler node types", () => {
		const manager = makeManager();
		const handleObjSpy = spyOn(manager, "handle_obj").and.returnValue([[], {}]);
		const [accum] = manager.handle_array([null, { type: "word", value: [] }], [], {});
		expect(accum).toEqual([]);
		expect(handleObjSpy).toHaveBeenCalledTimes(1);
		// Node types without a handler (like the `b_pre` inside a synthetic `b_range_pre`) pass through `handle_obj` untouched.
		const manager2 = makeManager();
		const [accum2, context2] = manager2.handle_obj({ type: "b_pre", value: "1" }, [], { b: "Gen" });
		expect(accum2).toEqual([]);
		expect(context2).toEqual({ b: "Gen" });
	});

	it("covers bc_title fallback when title is absent", () => {
		const manager = makeManager();
		manager.books = [{ parsed: ["Ps"], value: "Ps", start_index: 0 }];

		const bcResult = {
			type: "bc",
			value: [{ type: "b", value: 0 }],
			passages: [{ start: { b: "Ps" }, end: { b: "Ps" }, valid: { valid: true, messages: {} } }]
		};
		spyOn(manager, "bc").and.returnValue([[bcResult], {}]);
		const bcvReturn = [[{ type: "bcv_result" }], {}];
		const bcvSpy = spyOn(manager, "bcv").and.returnValue(bcvReturn);

		const passage = {
			type: "bc_title",
			value: [
				{ type: "bc", value: [{ type: "b", value: 0 }, { type: "c", value: [{ type: "integer", value: 3, indices: [0, 0] }] }] },
				{ type: "v", value: [{ type: "integer", value: 1, indices: [5, 5] }], indices: [5, 5] }
			],
			indices: [0, 5]
		};

		const result = manager.bc_title(passage, [], {});
		expect(result).toBe(bcvReturn);
		expect(bcvSpy).toHaveBeenCalled();
	});

	it("covers next_v fallback integer and next-chapter retry path", () => {
		const manager = makeManager();
		const passage = {
			type: "next_v",
			value: [],
			indices: [0, 2],
			passages: [{ valid: { messages: { end_verse_not_exist: 2, end_chapter_not_exist: 1 } } }]
		};
		const first = {
			value: [
				{ indices: [0, 0], absolute_indices: [0, 1] },
				{ indices: [0, 1], absolute_indices: [0, 2] }
			],
			passages: [{ valid: { messages: { end_verse_not_exist: 1 } } }]
		};
		const second = {
			value: [
				{ indices: [0, 0], absolute_indices: [0, 2] },
				{ indices: [0, 2], absolute_indices: [0, 3] }
			],
			passages: [{ valid: { messages: { end_verse_not_exist: 1, end_chapter_not_exist: 1 } } }]
		};
		const rangeSpy = spyOn(manager, "range");
		rangeSpy.and.returnValues([[first], { c: 1 }], [[second], { c: 2 }]);

		const [accum] = manager.next_v(passage, [], { b: "Gen", c: 1, v: 1 });
		expect(rangeSpy).toHaveBeenCalledTimes(2);
		expect(accum[0]).toBe(second);
	});

	it("covers range return when handler says to return now without return value", () => {
		const manager = makeManager();
		manager.options.end_range_digits_strategy = "include";
		const startOut = {
			type: "bc",
			indices: [0, 2],
			passages: [{ start: { b: "Gen", c: 1, p_if_verse: "a" }, end: { b: "Gen", c: 1 }, valid: { messages: {} } }]
		};
		const endOut = {
			type: "v",
			indices: [3, 5],
			passages: [{ start: { b: "Gen", c: 1, v: 2 }, end: { b: "Gen", c: 1, v: 2, p_if_verse: "b" }, valid: { messages: {} } }]
		};
		const handleObjSpy = spyOn(manager, "handle_obj").and.callFake((obj) => {
			if (obj.type === "bc") return [[startOut], { b: "Gen", c: 1 }];
			return [[endOut], { b: "Gen", c: 1, v: 2 }];
		});
		spyOn(manager, "validate_ref").and.returnValue({ valid: true, messages: {} });
		spyOn(manager, "range_handle_valid").and.returnValue([true, null]);

		const [accum, context] = manager.range({
			type: "range",
			value: [{ type: "bc" }, { type: "v" }],
			indices: [0, 5]
		}, [], {});

		expect(handleObjSpy).toHaveBeenCalledTimes(2);
		expect(accum).toEqual([]);
		expect(context).toEqual({ b: "Gen", c: 1, v: 2 });
	});

	it("covers range_change_end for v objects", () => {
		const manager = makeManager();
		const handleObjReturn = [[{ type: "done" }], {}];
		const handleObjSpy = spyOn(manager, "handle_obj").and.returnValue(handleObjReturn);
		const passage = {
			type: "range",
			start_context: {},
			value: [
				{ type: "bc", value: [] },
				{ type: "v", value: [{ type: "integer", value: 3, indices: [0, 0] }], indices: [0, 0] }
			]
		};
		const result = manager.range_change_end(passage, [], 9);
		expect(handleObjSpy).toHaveBeenCalled();
		expect(passage.value[1].value[0].value).toBe(9);
		expect(result).toBe(handleObjReturn);
	});

	it("covers range_check_new_end fallback when a guessed end is invalid", () => {
		const manager = makeManager();
		spyOn(manager, "range_get_new_end_value").and.returnValue(12);
		spyOn(manager, "validate_ref").and.returnValue({ valid: false, messages: {} });

		const out = manager.range_check_new_end([], { b: "Gen", c: 10 }, { b: "Gen", c: 2 }, {
			valid: false,
			messages: { end_chapter_before_start: true }
		});
		expect(out).toBe(0);
	});

	it("covers range_check_new_end verse path when no new end is found", () => {
		const manager = makeManager();
		spyOn(manager, "range_get_new_end_value").and.returnValue(0);
		const out = manager.range_check_new_end([], { b: "Gen", c: 1, v: 10 }, { b: "Gen", c: 1, v: 2 }, {
			valid: false,
			messages: { end_verse_before_start: true }
		});
		expect(out).toBe(0);
	});

	it("covers range_check_new_end early return when no before-start message exists", () => {
		const manager = makeManager();
		const out = manager.range_check_new_end([], { b: "Gen", c: 1 }, { b: "Gen", c: 1 }, {
			valid: false,
			messages: {}
		});
		expect(out).toBe(0);
	});

	it("does not reinterpret ff/next_v virtual ends as verses", () => {
		// The `next` grammar token is definable at runtime through the public `grammar` option; English has no default token. A chapter-level "next" at the last chapter of a book must snap back (Zeph.3), not become a verse (Zeph.3.4): the virtual end that `next_v` pushes is not user text, so the end-range-digits reinterpretation doesn't apply. Reinterpreting it also corrupted the node in place, which crashed the reparse in the second case (fuzzer-found; reproducible in stock Polish as "Mt 5-So 3n NIV").
		const p = new bcv_parser(lang);
		p.set_options({ grammar: { next: /^f(?![a-z0-9])/ } });
		expect(p.parse("Zeph 3f").osis()).toEqual("Zeph.3");
		expect(p.parse("Matt 5:1f").osis()).toEqual("Matt.5.1-Matt.5.2");
		p.set_options({ punctuation_strategy: "eu" });
		expect(p.parse("ze:3fNIV").osis()).toEqual("Zeph.3");
	});

	it("salvages an explicit-verse range end that's before the start verse", () => {
		// The digit-salvage path in `range_handle_invalid` handles `v`-type range ends, not just integers: the "verse 5" here becomes verse 25.
		const p = new bcv_parser(lang);
		expect(p.parse("Matt 5:22, 24-verse 5").osis()).toEqual("Matt.5.22,Matt.5.24-Matt.5.25");
	});

	it("converts a book-less explicit-verse range to a sequence instead of a verse-number range end", () => {
		// A `v`-type range end with a book-less context is the only real input that reaches the `end_range_digits_strategy` block in `range_handle_invalid` with `start_obj.v` unset (with a book, the validator fills in `start_obj.v`). It must fall through to the sequence conversion, not be recast as "chapter 5 verse 2".
		const p = new bcv_parser(lang);
		const result = p.parse_with_context("5-verse 2", "chapter 3");
		expect(result.osis()).toEqual("");
		const entity = p.entities[0].value[1][0];
		expect(entity.original_type).toEqual("range");
		expect(entity.type).toEqual("sequence");
		expect(entity.passages[0].valid.messages.start_book_not_defined).toBe(true);
	});

	it("covers translation_sequence guard and continue branches", () => {
		const manager = makeManager();
		const guardPassage = { type: "translation_sequence", value: null };
		const [guardAccum, guardContext] = manager.translation_sequence(guardPassage, [], { translations: [{ translation: "x" }] });
		expect(guardAccum[0]).toBe(guardPassage);
		expect(guardContext.translations).toBeUndefined();

		manager.books = [{ parsed: 123 }];
		const contPassage = {
			type: "translation_sequence",
			value: [
				{ value: 0 },
				[[{ type: "translation", value: "not-a-number" }]]
			],
			indices: [0, 1]
		};
		const [contAccum] = manager.translation_sequence(contPassage, [], {});
		expect(contAccum[0]).toBe(contPassage);
	});

	it("covers utility guard branches", () => {
		const manager = makeManager();
		expect(manager.pluck_integer("c", [])).toBeNull();
		expect(manager.get_partial_verse({ type: "v", value: [{ type: "integer", partial: "a", value: 1 }] })).toBe("a");

		manager.books = [{ value: "Gen" }];
		manager.calculate_indices("x\x1f0\x1f", 0);
	});
});

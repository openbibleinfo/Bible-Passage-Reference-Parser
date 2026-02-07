"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_passage auto coverage", () => {
	function makeManager() {
		const parser = new bcv_parser(lang);
		return parser.passage;
	}

	it("covers null handling in handle_array and the b_pre fallback", () => {
		const manager = makeManager();
		const handleObjSpy = spyOn(manager, "handle_obj").and.returnValue([[], {}]);
		const [accum] = manager.handle_array([null, { type: "word", value: [] }], [], {});
		expect(accum).toEqual([]);
		expect(handleObjSpy).toHaveBeenCalledTimes(1);
		expect(manager.b_pre({}, [], {})).toEqual([[], {}]);
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

	it("covers v-end handling in range_handle_invalid and range_handle_valid", () => {
		const manager = makeManager();
		const end = { type: "v", value: [{ type: "integer", value: 4 }] };
		const passage = { start_context: { translations: [] } };
		spyOn(manager, "pluck").and.returnValue({ type: "integer", value: 4 });
		spyOn(manager, "validate_ref").and.returnValue({ valid: true, messages: {} });
		const rangeChangeSpy = spyOn(manager, "range_change_integer_end").and.returnValue([[{ type: "changed" }], {}]);

		const invalidResult = manager.range_handle_invalid(
			{ valid: false, messages: {} },
			passage,
			{ type: "bc" },
			{ b: "Gen", c: 1 },
			end,
			{ b: "Gen", c: 0 },
			[]
		);
		expect(invalidResult[0][0].type).toBe("changed");

		const validResult = manager.range_handle_valid(
			{ valid: true, messages: { end_chapter_not_exist: 1 } },
			passage,
			{ type: "bc" },
			{ b: "Gen", c: 1 },
			end,
			{ b: "Gen", c: 0 },
			[]
		);
		expect(validResult[0]).toBe(true);
		expect(rangeChangeSpy).toHaveBeenCalled();
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

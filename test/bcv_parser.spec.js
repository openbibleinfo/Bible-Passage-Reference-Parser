"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_parser auto coverage", () => {
	it("covers the legacy no-lang constructor path when globals exist", () => {
		const saved = {
			grammar: globalThis.grammar,
			grammar_options: globalThis.grammar_options,
			bcv_regexps: globalThis.bcv_regexps,
			bcv_translations: globalThis.bcv_translations
		};
		try {
			globalThis.grammar = { parse: () => [] };
			globalThis.grammar_options = {};
			globalThis.bcv_regexps = class {
				constructor() {
					this.books = [];
					this.all_books = [];
					this.translations = [];
					this.escaped_passage = /$^/g;
					this.control = /$^/g;
					this.match_end_split = /$^/;
					this.first = /1/;
					this.second = /2/;
					this.third = /3/;
					this.pre_number_book = /$^/;
					this.range_and = /$^/;
					this.range_only = /$^/;
				}
			};
			globalThis.bcv_translations = class {
				constructor() {
					this.aliases = {};
					this.current_system = "default";
					this.systems = {
						current: { chapters: { Ps: [1], Ps151: [1] }, order: {} },
						default: { chapters: { Ps: [1], Ps151: [1] }, order: {} }
					};
				}
			};
			expect(() => new bcv_parser(null)).not.toThrow();
		} finally {
			globalThis.grammar = saved.grammar;
			globalThis.grammar_options = saved.grammar_options;
			globalThis.bcv_regexps = saved.bcv_regexps;
			globalThis.bcv_translations = saved.bcv_translations;
		}
	});

	it("covers guard returns in parser helpers", () => {
		const p = new bcv_parser(lang);
		expect(p.parse_entity_passages({ passages: undefined }, 0, [""], "current")).toEqual([]);
		expect(p.snap_range({ passages: [], absolute_indices: [0, 1] }, 0).absolute_indices).toEqual([0, 1]);
		expect(() => p.snap_sequence("book", { passages: [], absolute_indices: [0, 1] }, [], 0, 0)).not.toThrow();
		expect(() => p.snap_sequence("book", { passages: [{ valid: { valid: true } }], absolute_indices: [0, 1] }, [], 0, 1)).not.toThrow();
	});

	it("covers to_osis fallback chapter defaults without non-null assertions", () => {
		const p = new bcv_parser(lang);
		const end = { b: "Gen", v: null };
		Object.defineProperty(end, "c", {
			get() { return undefined; },
			set() {}
		});
		expect(p.to_osis({ b: "Gen", c: 1, v: 1 }, end, "current")).toMatch(/^Gen\./);
	});

	it("covers fix_ps151 early returns when custom systems are incomplete", () => {
		const p = new bcv_parser(lang);
		p.translations.systems.no_ps151 = {
			chapters: {
				Ps: [6]
			},
			order: p.translations.systems.current.order
		};
		expect(() => p.fix_ps151({ b: "Ps", c: 151, v: 1 }, { b: "Prov", c: 1, v: 1 }, "no_ps151")).not.toThrow();

		p.translations.systems.no_ps = {
			chapters: {
				Ps151: [7]
			},
			order: p.translations.systems.current.order
		};
		expect(() => p.fix_ps151({ b: "Ps", c: 1, v: 1 }, { b: "Ps", c: 151, v: 1 }, "no_ps")).not.toThrow();
	});

	it("covers snap_range and snap_sequence fallback branches", () => {
		const p = new bcv_parser(lang);
		const snapped = p.snap_range({
			type: "b_range",
			absolute_indices: [10, 20],
			passages: [{ start: { b: "Gen" }, end: { b: "Exod" } }],
			value: [{ type: "b", absolute_indices: undefined }]
		}, 0);
		expect(snapped.absolute_indices).toEqual([10, 20]);

		const entity_for_next = {
			passages: [
				{ absolute_indices: [0, 1], valid: { valid: true }, type: "b" },
				{ absolute_indices: undefined, valid: { valid: true }, type: "b" }
			],
			absolute_indices: [0, 2]
		};
		expect(() => p.snap_sequence("book", entity_for_next, [], 0, 2)).not.toThrow();

		const entity_for_prev = {
			passages: [
				{ absolute_indices: undefined, valid: { valid: true }, type: "range" },
				{ absolute_indices: [5, 10], valid: { valid: true }, type: "range" }
			],
			absolute_indices: [5, 10]
		};
		p.snap_sequence("book", entity_for_prev, [], 1, 2);
		expect(entity_for_prev.absolute_indices[1]).toEqual(10);
	});
});

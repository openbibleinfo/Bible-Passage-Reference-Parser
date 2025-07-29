"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

// These aren't the most readable tests, but the idea here is to reduce the amount of boilerplate.

// Possible OSIS strings
const genb = "Gen";
const gen11 = "Gen.1.1";
const gen11a = "Gen.1.1!a";
const gen1c = "Gen.1";
const gen12c = "Gen.1-Gen.2";
const gen12v = "Gen.1.1-Gen.2.25";
const gen12a = "Gen.1.1!a-Gen.2.25!a";
const genc = "Gen.1-Gen.50";
const genv = "Gen.1.1-Gen.50.26";
const gen1v = "Gen.1.1-Gen.1.31";
const gena = "Gen.1.1!a-Gen.50.26!a";
const gen1a = "Gen.1.1!a-Gen.1.31!a";
const genrb = "Gen-Rev";
const genrc = "Gen.1-Rev.22";
const genrv = "Gen.1.1-Rev.22.21";
const genarv = "Gen.1.1!a-Rev.22.21";
const genra = "Gen.1.1!a-Rev.22.21!a";

// b objects
const ogen = { b: "Gen" };
const ogena = { b: "Gen", p: "a" };
const orev = { b: "Rev" };
const oreva = { b: "Rev", p: "a" };

// bc objects
const ogen1 = { b: "Gen", c: 1 };
const ogen1a = { b: "Gen", c: 1, p: "a" };
const ogen2 = { b: "Gen", c: 2 };
const ogen2a = { b: "Gen", c: 2, p: "a" };
const ogen50 = { b: "Gen", c: 50 };
const ogen50a = { b: "Gen", c: 50, p: "a" };

// bcv objects
const ogen11 = { b: "Gen", c: 1, v: 1 };
const ogen11a = { b: "Gen", c: 1, v: 1, p: "a" };
const ogen131 = { b: "Gen", c: 1, v: 31 };
const ogen131a = { b: "Gen", c: 1, v: 31, p: "a" };
const ogen225 = { b: "Gen", c: 2, v: 25 };
const ogen225a = { b: "Gen", c: 2, v: 25, p: "a" };
const orev2221 = { b: "Rev", c: 22, v: 21 };
const orev2221a = { b: "Rev", c: 22, v: 21, p: "a" };


describe("OSIS compaction strategies", () => {
	let p = {};
	let translation = "default";
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.reset();
		translation = "default";
		p.options.book_alone_strategy = "ignore";
	});
	it("should return OSIS for b-b with various compaction strategies", () => {

		run_tests([
			["full", ogen, ogen, {b: genb, bp: genb, bc: genc, bcp: genc, bcv: genv, bcvp: genv}],
			["full", ogen, orev, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

			["first_chapter", ogen, ogen, {b: gen1c, bp: gen1c, bc: gen1c, bcp: gen1c, bcv: gen1v, bcvp: gen1v}],
			["first_chapter", ogen, orev, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

			["full", ogena, ogena, {b: genb, bp: gena, bc: genc, bcp: gena, bcv: genv, bcvp: gena}],
			["full", ogena, oreva, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],

			["first_chapter", ogena, ogena, {b: gen1c, bp: gen1a, bc: gen1c, bcp: gen1a, bcv: gen1v, bcvp: gen1a}],
			["first_chapter", ogena, oreva, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
		]);
	});
	it("should return OSIS for bc-b with various compaction strategies", () => {
		for (const book_alone_strategy of ["full", "first_chapter"]) {
			run_tests([
				[book_alone_strategy, ogen1, ogen, {b: genb, bp: genb, bc: genc, bcp: genc, bcv: genv, bcvp: genv}],
				[book_alone_strategy, ogen1, orev, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				[book_alone_strategy, ogen1a, ogena, {b: genb, bp: gena, bc: genc, bcp: gena, bcv: genv, bcvp: gena}],
				[book_alone_strategy, ogen1a, oreva, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
			]);
		}
	});
	it("should return OSIS for bcv-b with various compaction strategies", () => {
		for (const book_alone_strategy of ["full", "first_chapter"]) {
			run_tests([
				[book_alone_strategy, ogen11, ogen, {b: genb, bp: genb, bc: genc, bcp: genc, bcv: genv, bcvp: genv}],
				[book_alone_strategy, ogen11, orev, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				[book_alone_strategy, ogen11a, ogena, {b: genb, bp: gena, bc: genc, bcp: gena, bcv: genv, bcvp: gena}],
				[book_alone_strategy, ogen11a, oreva, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
			]);
		}
	});
	it("should return OSIS for b-bc with various compaction strategies", () => {
			run_tests([
				["full", ogen, ogen1, {b: gen1c, bp: gen1c, bc: gen1c, bcp: gen1c, bcv: gen1v, bcvp: gen1v}],
				["full", ogen, ogen2, {b: gen12c, bp: gen12c, bc: gen12c, bcp: gen12c, bcv: gen12v, bcvp: gen12v}],
				["full", ogen, ogen50, {b: genb, bp: genb, bc: genc, bcp: genc, bcv: genv, bcvp: genv}],
				["full", ogen, orev, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				["first_chapter", ogen, ogen, {b: gen1c, bp: gen1c, bc: gen1c, bcp: gen1c, bcv: gen1v, bcvp: gen1v}],
				["first_chapter", ogen, ogen2, {b: gen12c, bp: gen12c, bc: gen12c, bcp: gen12c, bcv: gen12v, bcvp: gen12v}],
				["first_chapter", ogen, ogen50, {b: genb, bp: genb, bc: genc, bcp: genc, bcv: genv, bcvp: genv}],
				["first_chapter", ogen, orev, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				["full", ogena, ogena, {b: genb, bp: gena, bc: genc, bcp: gena, bcv: genv, bcvp: gena}],
				["full", ogena, ogen2a, {b: gen12c, bp: gen12a, bc: gen12c, bcp: gen12a, bcv: gen12v, bcvp: gen12a}],
				["full", ogena, ogen50a, {b: genb, bp: gena, bc: genc, bcp: gena, bcv: genv, bcvp: gena}],
				["full", ogena, oreva, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],

				["first_chapter", ogena, ogena, {b: gen1c, bp: gen1a, bc: gen1c, bcp: gen1a, bcv: gen1v, bcvp: gen1a}],
				["first_chapter", ogena, ogen2a, {b: gen12c, bp: gen12a, bc: gen12c, bcp: gen12a, bcv: gen12v, bcvp: gen12a}],
				["first_chapter", ogena, ogen50a, {b: genb, bp: gena, bc: genc, bcp: gena, bcv: genv, bcvp: gena}],
				["first_chapter", ogena, oreva, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
			]);
	});
	it("should return OSIS for b-bcv with various compaction strategies", () => {
		for (const book_alone_strategy of ["full", "first_chapter"]) {
			run_tests([
				[book_alone_strategy, ogen, ogen11, {b: gen11, bp: gen11, bc: gen11, bcp: gen11, bcv: gen11, bcvp: gen11}],
				[book_alone_strategy, ogen, ogen131, {b: gen1c, bp: gen1c, bc: gen1c, bcp: gen1c, bcv: gen1v, bcvp: gen1v}],
				[book_alone_strategy, ogen, ogen225, {b: gen12c, bp: gen12c, bc: gen12c, bcp: gen12c, bcv: gen12v, bcvp: gen12v}],
				[book_alone_strategy, ogen, orev2221, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				[book_alone_strategy, ogena, ogen11a, {b: gen11, bp: gen11a, bc: gen11, bcp: gen11a, bcv: gen11, bcvp: gen11a}],
				[book_alone_strategy, ogena, ogen131a, {b: gen1c, bp: gen1a, bc: gen1c, bcp: gen1a, bcv: gen1v, bcvp: gen1a}],
				[book_alone_strategy, ogena, ogen225a, {b: gen12c, bp: gen12a, bc: gen12c, bcp: gen12a, bcv: gen12v, bcvp: gen12a}],
				[book_alone_strategy, ogena, orev2221a, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
				[book_alone_strategy, ogena, orev2221, {b: genrb, bp: genarv, bc: genrc, bcp: genarv, bcv: genrv, bcvp: genarv}],
			]);
		}
	});
	it("should return OSIS for bc-bcv with various compaction strategies", () => {
		for (const book_alone_strategy of ["full", "first_chapter"]) {
			run_tests([
				[book_alone_strategy, ogen1, ogen11, {b: gen11, bp: gen11, bc: gen11, bcp: gen11, bcv: gen11, bcvp: gen11}],
				[book_alone_strategy, ogen1, ogen131, {b: gen1c, bp: gen1c, bc: gen1c, bcp: gen1c, bcv: gen1v, bcvp: gen1v}],
				[book_alone_strategy, ogen1, ogen225, {b: gen12c, bp: gen12c, bc: gen12c, bcp: gen12c, bcv: gen12v, bcvp: gen12v}],
				[book_alone_strategy, ogen1, orev2221, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				[book_alone_strategy, ogen1a, ogen11a, {b: gen11, bp: gen11a, bc: gen11, bcp: gen11a, bcv: gen11, bcvp: gen11a}],
				[book_alone_strategy, ogen1a, ogen131a, {b: gen1c, bp: gen1a, bc: gen1c, bcp: gen1a, bcv: gen1v, bcvp: gen1a}],
				[book_alone_strategy, ogen1a, ogen225a, {b: gen12c, bp: gen12a, bc: gen12c, bcp: gen12a, bcv: gen12v, bcvp: gen12a}],
				[book_alone_strategy, ogen1a, orev2221a, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
				[book_alone_strategy, ogen1a, orev2221, {b: genrb, bp: genarv, bc: genrc, bcp: genarv, bcv: genrv, bcvp: genarv}],
			]);
		}
	});
	it("should return OSIS for bc-bcv with various compaction strategies", () => {
		for (const book_alone_strategy of ["full", "first_chapter"]) {
			run_tests([
				[book_alone_strategy, ogen11, ogen11, {b: gen11, bp: gen11, bc: gen11, bcp: gen11, bcv: gen11, bcvp: gen11}],
				[book_alone_strategy, ogen11, ogen131, {b: gen1c, bp: gen1c, bc: gen1c, bcp: gen1c, bcv: gen1v, bcvp: gen1v}],
				[book_alone_strategy, ogen11, ogen225, {b: gen12c, bp: gen12c, bc: gen12c, bcp: gen12c, bcv: gen12v, bcvp: gen12v}],
				[book_alone_strategy, ogen11, orev2221, {b: genrb, bp: genrb, bc: genrc, bcp: genrc, bcv: genrv, bcvp: genrv}],

				[book_alone_strategy, ogen11a, ogen11a, {b: gen11, bp: gen11a, bc: gen11, bcp: gen11a, bcv: gen11, bcvp: gen11a}],
				[book_alone_strategy, ogen11a, ogen131a, {b: gen1c, bp: gen1a, bc: gen1c, bcp: gen1a, bcv: gen1v, bcvp: gen1a}],
				[book_alone_strategy, ogen11a, ogen225a, {b: gen12c, bp: gen12a, bc: gen12c, bcp: gen12a, bcv: gen12v, bcvp: gen12a}],
				[book_alone_strategy, ogen11a, orev2221a, {b: genrb, bp: genra, bc: genrc, bcp: genra, bcv: genrv, bcvp: genra}],
				[book_alone_strategy, ogen11a, orev2221, {b: genrb, bp: genarv, bc: genrc, bcp: genarv, bcv: genrv, bcvp: genarv}],
			]);
		}
	});
});

describe("bcvp osis compaction strategies", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({osis_compaction_strategy: "bcvp"});
	});
	it("should handle standalones", () => {
		expect(p.parse("Jeremiah 31:31a").osis_and_indices()).toEqual([{osis: "Jer.31.31!a", translations: [""], indices: [0, 15]}]);
		expect(p.parse("Obadiah 3b").osis_and_indices()).toEqual([{osis: "Obad.1.3!b", translations: [""], indices: [0, 10]}]);
		expect(p.parse("Phm verse 2a NIV").osis_and_indices()).toEqual([{osis: "Phlm.1.2!a", translations: ["NIV"], indices: [0, 16]}]);
		expect(p.parse("Psalm 23a:6").osis_and_indices()).toEqual([{osis: "Ps.23.6", translations: [""], indices: [0, 11]}]);
		expect(p.parse("Jude 1a:6").osis_and_indices()).toEqual([{osis: "Jude.1.6", translations: [""], indices: [0, 9]}]);
		expect(p.parse("Jude 10a:6").osis_and_indices()).toEqual([]);
	});
	it("should handle ranges", () => {
		expect(p.parse("Jude 1:1b-3a").osis_and_indices()).toEqual([{osis: "Jude.1.1!b-Jude.1.3!a", translations: [""], indices: [0, 12]}])
		expect(p.parse("Jude 1b-3a").osis_and_indices()).toEqual([{osis: "Jude.1.1!b-Jude.1.3!a", translations: [""], indices: [0, 10]}])
		expect(p.parse("Jude 2b-3a").osis_and_indices()).toEqual([{osis: "Jude.1.2!b-Jude.1.3!a", translations: [""], indices: [0, 10]}])
		expect(p.parse("Jude 2b-1a").osis_and_indices()).toEqual([{osis: "Jude.1.2!b,Jude.1.1!a", translations: [""], indices: [0, 10]}])
	});
	it("should handle sequences", () => {
		expect(p.parse("Jer 33a, 22b").osis_and_indices()).toEqual([{osis: "Jer.33.1-Jer.33.26,Jer.22.1-Jer.22.30", translations: [""], indices: [0, 12]}])
		expect(p.parse("Psalm 23a:6").osis_and_indices()).toEqual([{osis: "Ps.23.6", translations: [""], indices: [0, 11]}]);
		expect(p.parse("1 Kings 21:2b-33a, 12c, ch. 14a, 15c, 22:9a").osis_and_indices()).toEqual([{osis: "1Kgs.21.2!b-1Kgs.21.29,1Kgs.21.12!c,1Kgs.14.1-1Kgs.15.34,1Kgs.22.9!a", translations: [""], indices: [0, 43]}]);
	});
});

function run_tests(tests) {
	const p = new bcv_parser(lang);
	const translation = "default";
	for (const [book_alone_strategy, start, end, expectations] of tests) {
		p.reset();
		p.options.book_alone_strategy = book_alone_strategy;
		for (const [osis_compaction_strategy, expectation] of Object.entries(expectations)) {
			p.options.osis_compaction_strategy = osis_compaction_strategy;
			expect(p.to_osis(structuredClone(start), structuredClone(end), translation)).toEqual(expectation);
		}
	}
}
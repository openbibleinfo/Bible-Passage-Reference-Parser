"use strict";
import { bcv_parser } from "../es/bcv_parser.js";
import * as lang from "../es/lang/en.js";

describe("Testament overlap", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("Should check overlaps correctly", () => {
		const conditions = [
			["ona", "ona", true],
			["ona", "on", true],
			["ona", "oa", true],
			["ona", "o", true],
			["ona", "na", true],
			["ona", "n", true],
			["ona", "a", true],
			["on", "ona", true],
			["on", "on", true],
			["on", "oa", true],
			["on", "o", true],
			["on", "na", true],
			["on", "n", true],
			["on", "a", false],
			["oa", "ona", true],
			["oa", "on", true],
			["oa", "oa", true],
			["oa", "o", true],
			["oa", "na", true],
			["oa", "n", false],
			["oa", "a", true],
			["o", "ona", true],
			["o", "on", true],
			["o", "oa", true],
			["o", "o", true],
			["o", "na", false],
			["o", "n", false],
			["o", "a", false],
			["na", "ona", true],
			["na", "on", true],
			["na", "oa", true],
			["na", "o", false],
			["na", "na", true],
			["na", "n", true],
			["na", "a", true],
			["n", "ona", true],
			["n", "on", true],
			["n", "oa", false],
			["n", "o", false],
			["n", "na", true],
			["n", "n", true],
			["n", "a", false],
			["a", "ona", true],
			["a", "on", false],
			["a", "oa", true],
			["a", "o", false],
			["a", "na", true],
			["a", "n", false],
			["a", "a", true]
		];
		for (const [testaments, book_testament, result] of conditions) {
			expect(p.regexps_manager.has_testament_overlap(testaments, book_testament)).toEqual(result);
		}
	});
	it("should filter testament overlaps correctly", () => {
		// Normally, `testament_books` is only set on objects where there's more than one possibility (i.e., it wouldn't normally be set on `o`, `n`, or `a`). This is just testing the logic in all cases.
		const book_objects = {
			ona: {
				osis: ["Mal", "Mark", "1Macc"],
				testament_books: { "Mal": "o", "Mark": "n", "1Macc": "a"}
			},
			on: {
				osis: ["Mal", "Mark"],
				testament_books: { "Mal": "o", "Mark": "n" }
			},
			oa: {
				osis: ["Mal", "1Macc"],
				testament_books: { "Mal": "o", "1Macc": "a" }
			},
			o: {
				osis: ["Mal"],
				testament_books: { "Mal": "o" }
			},
			na: {
				osis: ["Mark", "1Macc"],
				testament_books: { "Mark": "n", "1Macc": "a" }
			},
			n: {
				osis: ["Mark"],
				testament_books: { "Mark": "n" }
			},
			a: {
				osis: ["1Macc"],
				testament_books: { "1Macc": "a" }
			}
		};
		const conditions = [
			["ona", "ona", ["Mal", "Mark", "1Macc"]],
			["ona", "on", ["Mal", "Mark"]],
			["ona", "oa", ["Mal", "1Macc"]],
			["ona", "o", ["Mal"]],
			["ona", "na", ["Mark", "1Macc"]],
			["ona", "n", ["Mark"]],
			["ona", "a", ["1Macc"]],
			["on", "ona", ["Mal", "Mark"]],
			["on", "on", ["Mal", "Mark"]],
			["on", "oa", ["Mal"]],
			["on", "o", ["Mal"]],
			["on", "na", ["Mark"]],
			["on", "n", ["Mark"]],
			["on", "a", []],
			["oa", "ona", ["Mal", "1Macc"]],
			["oa", "on", ["Mal"]],
			["oa", "oa", ["Mal", "1Macc"]],
			["oa", "o", ["Mal"]],
			["oa", "na", ["1Macc"]],
			["oa", "n", []],
			["oa", "a", ["1Macc"]],
			["o", "ona", ["Mal"]],
			["o", "on", ["Mal"]],
			["o", "oa", ["Mal"]],
			["o", "o", ["Mal"]],
			["o", "na", []],
			["o", "n", []],
			["o", "a", []],
			["na", "ona", ["Mark", "1Macc"]],
			["na", "on", ["Mark"]],
			["na", "oa", ["1Macc"]],
			["na", "o", []],
			["na", "na", ["Mark", "1Macc"]],
			["na", "n", ["Mark"]],
			["na", "a", ["1Macc"]],
			["n", "ona", ["Mark"]],
			["n", "on", ["Mark"]],
			["n", "oa", []],
			["n", "o", []],
			["n", "na", ["Mark"]],
			["n", "n", ["Mark"]],
			["n", "a", []],
			["a", "ona", ["1Macc"]],
			["a", "on", []],
			["a", "oa", ["1Macc"]],
			["a", "o", []],
			["a", "na", ["1Macc"]],
			["a", "n", []],
			["a", "a", ["1Macc"]]
		];
		for (const [testaments, book_type, result] of conditions) {
			let book_object = book_objects[book_type]
			expect(p.regexps_manager.get_testament_overlap(testaments, book_object)).toEqual(result);
		}
	});
});

describe("Adjusting books", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.translations.systems.current.chapters["Ps151"] = [10]; // Increase the number of verses so we can disambiguate these tests for reporting.
	});
	it("should change what's parseable (`passage_existence_strategy = bcv`)", () => {
		const tests = {
			"ona": [
				["Psalm 151:1",	[{osis: "Ps.151.1", indices: [0, 11], translations: [""]}]],
				["Psalm 119:1",	[{osis: "Ps.119.1", indices: [0, 11], translations: [""]}]],
				["Gen 1:1",		[{osis: "Gen.1.1", indices: [0, 7], translations: [""]}]],
				["Matt 1:1",	[{osis: "Matt.1.1", indices: [0, 8], translations: [""]}]],
				["Judith 1:1",	[{osis: "Jdt.1.1", indices: [0, 10], translations: [""]}]],
				["Ps 1-150",	[{osis: "Ps.1-Ps.150", indices: [0, 8], translations: [""]}]],
				["Ps1-150,151",	[{osis: "Ps", indices: [0, 11], translations: [""]}]],
				["Ps 1-Pr 1",	[{osis: "Ps.1-Prov.1", indices: [0, 9], translations: [""]}]],
				["Ps 1-Mt 1",	[{osis: "Ps.1-Matt.1", indices: [0, 9], translations: [""]}]],
				["Ps 1-Tob 1",	[{osis: "Ps.1-Tob.1", indices: [0, 10], translations: [""]}]],
				["Gen 1-Tob 1",	[{osis: "Gen.1-Tob.1", indices: [0, 11], translations: [""]}]],
				["Gen 1-Mat 1",	[{osis: "Gen.1-Matt.1", indices: [0, 11], translations: [""]}]],
				["Mat 1-Tob 1",	[{osis: "Matt.1-Tob.1", indices: [0, 11], translations: [""]}]], // Apocrypha appears after the NT in the default.
				["Ps151-Mat 1",	[{osis: "Ps.151-Matt.1", indices: [0, 11], translations: [""]}]],
				["Ps151-Tob 1",	[{osis: "Ps.151-Tob.1", indices: [0, 11], translations: [""]}]],
			],
			"on": [
				["Psalm 151:2",	[]],
				["Psalm 119:2",	[{osis: "Ps.119.2", indices: [0, 11], translations: [""]}]],
				["Gen 1:2",		[{osis: "Gen.1.2", indices: [0, 7], translations: [""]}]],
				["Matt 1:2",	[{osis: "Matt.1.2", indices: [0, 8], translations: [""]}]],
				["Judith 1:2",	[]],
				["Ps 2-150",	[{osis: "Ps.2-Ps.150", indices: [0, 8], translations: [""]}]],
				["Ps2-150,151",	[{osis: "Ps.2-Ps.150", indices: [0, 7], translations: [""]}]],
				["Ps 2-Pr 2",	[{osis: "Ps.2-Prov.2", indices: [0, 9], translations: [""]}]],
				["Ps 2-Mt 2",	[{osis: "Ps.2-Matt.2", indices: [0, 9], translations: [""]}]],
				["Ps 2-Tob 2",	[{osis: "Ps.2", indices: [0, 4], translations: [""]}]],
				["Gen 2-Tob 2",	[{osis: "Gen.2", indices: [0, 5], translations: [""]}]],
				["Gen 2-Mat 2",	[{osis: "Gen.2-Matt.2", indices: [0, 11], translations: [""]}]],
				["Mat 2-Tob 2",	[{osis: "Matt.2", indices: [0, 5], translations: [""]}]],
				["Ps151-Mat 2",	[{osis: "Matt.2", indices: [6, 11], translations: [""]}]],
				["Ps151-Tob 2",	[]],
			],
			"oa": [
				["Psalm 151:3",	[{osis: "Ps.151.3", indices: [0, 11], translations: [""]}]],
				["Psalm 119:3",	[{osis: "Ps.119.3", indices: [0, 11], translations: [""]}]],
				["Gen 1:3",		[{osis: "Gen.1.3", indices: [0, 7], translations: [""]}]],
				["Matt 1:3",	[]],
				["Judith 1:3",	[{osis: "Jdt.1.3", indices: [0, 10], translations: [""]}]],
				["Ps 3-150",	[{osis: "Ps.3-Ps.150", indices: [0, 8], translations: [""]}]],
				["Ps3-150,151",	[{osis: "Ps.3-Ps.151", indices: [0, 11], translations: [""]}]],
				["Ps 3-Pr 3",	[{osis: "Ps.3-Prov.3", indices: [0, 9], translations: [""]}]],
				["Ps 3-Mt 3",	[{osis: "Ps.3", indices: [0, 4], translations: [""]}]],
				["Ps 3-Tob 3",	[{osis: "Ps.3-Tob.3", indices: [0, 10], translations: [""]}]],
				["Gen 3-Tob 3",	[{osis: "Gen.3-Tob.3", indices: [0, 11], translations: [""]}]],
				["Gen 3-Mat 3",	[{osis: "Gen.3", indices: [0, 5], translations: [""]}]],
				["Mat 3-Tob 3",	[{osis: "Tob.3", indices: [6, 11], translations: [""]}]],
				["Ps151-Mat 3",	[{osis: "Ps.151", indices: [0, 5], translations: [""]}]],
				["Ps151-Tob 3",	[{osis: "Ps.151-Tob.3", indices: [0, 11], translations: [""]}]],
			],
			"o": [
				["Psalm 151:4",	[]],
				["Psalm 1:4",	[{osis: "Ps.1.4", indices: [0, 9], translations: [""]}]],
				["Gen 1:4",		[{osis: "Gen.1.4", indices: [0, 7], translations: [""]}]],
				["Matt 1:4",	[]],
				["Judith 1:4",	[]],
				["Ps 4-150",	[{osis: "Ps.4-Ps.150", indices: [0, 8], translations: [""]}]],
				["Ps4-150,151",	[{osis: "Ps.4-Ps.150", indices: [0, 7], translations: [""]}]],
				["Ps 4-Pr 4",	[{osis: "Ps.4-Prov.4", indices: [0, 9], translations: [""]}]],
				["Ps 4-Mt 4",	[{osis: "Ps.4", indices: [0, 4], translations: [""]}]],
				["Ps 4-Tob 4",	[{osis: "Ps.4", indices: [0, 4], translations: [""]}]],
				["Gen 4-Tob 4",	[{osis: "Gen.4", indices: [0, 5], translations: [""]}]],
				["Gen 4-Mat 4",	[{osis: "Gen.4", indices: [0, 5], translations: [""]}]],
				["Mat 4-Tob 4",	[]],
				["Ps151-Mat 4",	[]],
				["Ps151-Tob 4",	[]],
			],
			"na": [
				["Psalm 151:5",	[{osis: "Ps.151.5", indices: [0, 11], translations: [""]}]],
				["Psalm 1:5",	[]],
				["Gen 1:5",		[]],
				["Matt 1:5",	[{osis: "Matt.1.5", indices: [0, 8], translations: [""]}]],
				["Judith 1:5",	[{osis: "Jdt.1.5", indices: [0, 10], translations: [""]}]],
				["Ps 5-150",	[]],
				["Ps5-150,151",	[{osis: "Ps.151", indices: [0, 11], translations: [""]}]],
				["Ps 5-Pr 5",	[]], // OK because the OT is excluded, though arguably Ps151 is included here. This would parse just as `Ps.5`, though.`
				["Ps 5-Mt 5",	[{osis: "Ps.5-Matt.5", indices: [0, 9], translations: [""]}]],
				["Ps 5-Tob 5",	[{osis: "Ps.5-Tob.5", indices: [0, 10], translations: [""]}]],
				["Gen 5-Tob 5",	[{osis: "Tob.5", indices: [6, 11], translations: [""]}]],
				["Gen 5-Mat 5",	[{osis: "Matt.5", indices: [6, 11], translations: [""]}]],
				["Mat 5-Tob 5",	[{osis: "Matt.5-Tob.5", indices: [0, 11], translations: [""]}]],
				["Ps151-Mat 5",	[{osis: "Ps.151-Matt.5", indices: [0, 11], translations: [""]}]],
				["Ps151-Tob 5",	[{osis: "Ps.151-Tob.5", indices: [0, 11], translations: [""]}]],
			],
			"n": [
				["Psalm 151:6",	[]],
				["Psalm 1:6",	[]],
				["Gen 1:6",		[]],
				["Matt 1:6",	[{osis: "Matt.1.6", indices: [0, 8], translations: [""]}]],
				["Judith 1:6",	[]],
				["Ps 6-150",	[]],
				["Ps6-150,151",	[]],
				["Ps 6-Pr 6",	[]],
				["Ps 6-Mt 6",	[{osis: "Matt.6", indices: [5, 9], translations: [""]}]],
				["Ps 6-Tob 6",	[]],
				["Gen 6-Tob 6",	[]],
				["Gen 6-Mat 6",	[{osis: "Matt.6", indices: [6, 11], translations: [""]}]],
				["Mat 6-Tob 6",	[{osis: "Matt.6", indices: [0, 5], translations: [""]}]],
				["Ps151-Mat 6",	[{osis: "Matt.6", indices: [6, 11], translations: [""]}]],
				["Ps151-Tob 6",	[]],
			],
			"a": [
				["Psalm 151:7",	[{osis: "Ps.151.7", indices: [0, 11], translations: [""]}]],
				["Psalm 1:7",	[]],
				["Gen 1:7",		[]],
				["Matt 1:7",	[]],
				["Judith 1:7",	[{osis: "Jdt.1.7", indices: [0, 10], translations: [""]}]],
				["Ps 7-150",	[]],
				["Ps7-150,151",	[{osis: "Ps.151", indices: [0, 11], translations: [""]}]], // 0 because the book is at 0
				["Ps 7-Pr 7",	[]],
				["Ps 7-Mt 7",	[]],
				["Ps 7-Tob 7",	[{osis: "Ps.7-Tob.7", indices: [0, 10], translations: [""]}]],
				["Gen 7-Tob 7",	[{osis: "Tob.7", indices: [6, 11], translations: [""]}]],
				["Gen 7-Mat 7",	[]],
				["Mat 7-Tob 7",	[{osis: "Tob.7", indices: [6, 11], translations: [""]}]],
				["Ps151-Mat 7",	[{osis: "Ps.151", indices: [0, 5], translations: [""]}]],
				["Ps151-Tob 7",	[{osis: "Ps.151-Tob.7", indices: [0, 11], translations: [""]}]],
			],
			"iat": [
				["Psalm 151:8",	[{osis: "Ps.151.8", indices: [0, 11], translations: [""]}]],
				["Psalm 119:8",	[{osis: "Ps.119.8", indices: [0, 11], translations: [""]}]],
				["Gen 1:8",		[{osis: "Gen.1.8", indices: [0, 7], translations: [""]}]],
				["Matt 1:8",	[{osis: "Matt.1.8", indices: [0, 8], translations: [""]}]],
				["Judith 1:8",	[{osis: "Jdt.1.8", indices: [0, 10], translations: [""]}]],
				["Ps 8-150",	[{osis: "Ps.8-Ps.150", indices: [0, 8], translations: [""]}]],
				["Ps8-150,151",	[{osis: "Ps.8-Ps.151", indices: [0, 11], translations: [""]}]],
				["Ps 8-Pr 8",	[{osis: "Ps.8-Prov.8", indices: [0, 9], translations: [""]}]],
				["Ps 8-Mt 8",	[{osis: "Ps.8-Matt.8", indices: [0, 9], translations: [""]}]],
				["Ps 8-Tob 8",	[{osis: "Ps.8-Tob.8", indices: [0, 10], translations: [""]}]],
				["Gen 8-Tob 8",	[{osis: "Gen.8-Tob.8", indices: [0, 11], translations: [""]}]],
				["Gen 8-Mat 8",	[{osis: "Gen.8-Matt.8", indices: [0, 11], translations: [""]}]],
				["Mat 8-Tob 8",	[{osis: "Matt.8-Tob.8", indices: [0, 11], translations: [""]}]],
				["Ps151-Mat 8",	[{osis: "Ps.151-Matt.8", indices: [0, 11], translations: [""]}]],
				["Ps151-Tob 8",	[{osis: "Ps.151-Tob.8", indices: [0, 11], translations: [""]}]],
			],
			"iaf": [
				["Psalm 151:9",	[]],
				["Psalm 119:9",	[{osis: "Ps.119.9", indices: [0, 11], translations: [""]}]],
				["Gen 1:9",		[{osis: "Gen.1.9", indices: [0, 7], translations: [""]}]],
				["Matt 1:9",	[{osis: "Matt.1.9", indices: [0, 8], translations: [""]}]],
				["Judith 1:9",	[]],
				["Ps 9-150",	[{osis: "Ps.9-Ps.150", indices: [0, 8], translations: [""]}]],
				["Ps9-150,151",	[{osis: "Ps.9-Ps.150", indices: [0, 7], translations: [""]}]],
				["Ps 9-Pr 9",	[{osis: "Ps.9-Prov.9", indices: [0, 9], translations: [""]}]],
				["Ps 9-Mt 9",	[{osis: "Ps.9-Matt.9", indices: [0, 9], translations: [""]}]],
				["Ps 9-Tob 9",	[{osis: "Ps.9", indices: [0, 4], translations: [""]}]],
				["Gen 9-Tob 9",	[{osis: "Gen.9", indices: [0, 5], translations: [""]}]],
				["Gen 9-Mat 9",	[{osis: "Gen.9-Matt.9", indices: [0, 11], translations: [""]}]],
				["Mat 9-Tob 9",	[{osis: "Matt.9", indices: [0, 5], translations: [""]}]],
				["Ps151-Mat 9",	[{osis: "Matt.9", indices: [6, 11], translations: [""]}]],
				["Ps151-Tob 9",	[]],
			],
		};
		p.set_options({ passage_existence_strategy: "bcv"});
		for (const [testaments, conditions] of Object.entries(tests)) {
			// Reset to default.
			p.set_options({ testaments: "on" });
			if (testaments === "iaf") {
				p.include_apocrypha(false);
			} else if (testaments === "iat") {
				p.include_apocrypha(true);
			} else {
				p.set_options({ testaments });
			}
			for (const [input, output] of conditions) {
				expect(p.parse(input).osis_and_indices()).toEqual(output);
			}
		}
	});
});

describe("Pre-book sequences", () =>{
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("should allow `number:` to precede non-numeric books", () => {
		expect(p.parse("1:Jn 5").osis()).toEqual("John.5");
		expect(p.parse("Mt1:2 Jn 5").osis()).toEqual("Matt.1.2,John.5");
		expect(p.parse("Mt1:2Jn 5").osis()).toEqual("Matt.1.2,John.5");
		expect(p.parse("Mt1:1-2Jn 5").osis()).toEqual("Matt.1.1-2John.1.5");
	});
	it("shouldn't allow `number:` to precede non-numeric books", () => {
		expect(p.parse("1.2Jn 5").osis()).toEqual("2John.1.5");
		expect(p.parse("1:2Jn 5").osis()).toEqual("");
		expect(p.parse("Matt 1:Second John 5").osis()).toEqual("Matt.1,2John.1.5");
		expect(p.parse("1:Second John 5").osis()).toEqual("2John.1.5");
		expect(p.parse("1:2 Jn 5").osis()).toEqual("John.5");
		expect(p.parse(":2Jn 5").osis()).toEqual("2John.1.5");
		expect(p.parse("12Jn 5").osis()).toEqual("");
	});
});

describe("Adding books at runtime", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("should reject bad array arguments", () => {
		expect(() => p.add_books(null)).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books("")).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books()).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books({})).toThrowMatching(add_books_throw_matcher);
	});
	it("should reject bad regexp arguments", () => {
		expect(() => p.add_books({books: [{ regexp: "" }]})).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books({books: [null]})).toThrowMatching(add_books_throw_matcher);
	});
	it("should reject bad pre/post arguments", () => {
		expect(() => p.add_books({books: [{ pre_regexp: "" }]})).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books({books: [{ post_regexp: null }]})).toThrowMatching(add_books_throw_matcher);
	});
	it("should reject bad book arguments", () => {
		expect(() => p.add_books({books: [{ regexp: /Q/, osis: ["Q"] }]})).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books({books: [{ regexp: /Q/, osis: null }]})).toThrowMatching(add_books_throw_matcher);
		expect(() => p.add_books({books: [{ regexp: /Q/, osis: [null] }]})).toThrowMatching(add_books_throw_matcher);
	});
	it("should process a non-number book", () => {
		expect(p.add_books({books: [{ regexp: /Q/, osis: ["Gen", "Matt"] }]})).toBeUndefined();
	});
	it("should get the right testaments", () => {
		expect(p.regexps_manager.get_book_testaments({osis:["Matt", "Gen"], regexp: /Q1/})).toEqual({ testament_books: {"Gen": "o", "Matt": "n"}, has_number_book: false, testament: "on" });
		expect(p.regexps_manager.get_book_testaments({osis: ["Matt", "Ps"], regexp: /Q1/})).toEqual({ testament_books: {"Ps": "oa", "Matt": "n"}, has_number_book: false, testament: "ona" });
		expect(p.regexps_manager.get_book_testaments({osis: ["2Cor"], regexp: /Q1/})).toEqual({ testament_books: {"2Cor": "n"}, has_number_book: true, testament: "n" });
		expect(p.regexps_manager.get_book_testaments({osis: ["2Cor"], regexp: /Q/})).toEqual({ testament_books: {"2Cor": "n"}, has_number_book: false, testament: "n" });
	});
	it("should get the right regexps", () => {
		expect(p.regexps_manager.get_book_pattern_regexps({ regexp: /Q/ }, { has_number_book: false})).toEqual({ pre_regexp: /(?:^|(?<=[^\p{L}]))/gu, regexp: /Q/, post_regexp: /(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/gu });
		expect(p.regexps_manager.get_book_pattern_regexps({ regexp: /Q/ }, { has_number_book: true})).toEqual({ pre_regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))/gu, regexp: /Q/, post_regexp: /(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/gu });
	});
	it("should add it to the right position", () => {
		p.set_options({ testaments: "o" });
		const original_length = p.regexps.all_books.length;
		const original_books_length = p.regexps.books.length;

		p.add_books({ books: [{ regexp: /Q1/, osis: ["Matt"] }] });
		expect(p.regexps.all_books.length).toEqual(original_length + 1);
		expect(/Q1/.test(p.regexps.all_books[0].regexp.source)).toBeTrue();
		expect(p.regexps.books.length).toEqual(original_books_length);

		p.add_books({ books: [
			{ regexp: /Q2/, osis: ["1Esd"], insert_at: "end" },
			{ regexp: /Q3/, osis: ["Ps"], insert_at: "end" }
		]});
		expect(p.regexps.all_books.length).toEqual(original_length + 3);
		expect(p.regexps.books.length).toEqual(original_books_length + 1);
		expect(/Q2/.test(p.regexps.all_books[original_length + 1].regexp.source)).toBeTrue();
		expect(/Q3/.test(p.regexps.all_books[original_length + 2].regexp.source)).toBeTrue();

		p.add_books({ books: [{ regexp: /1Cor/, osis: ["Mal"], insert_at: "Mal" }] });
		expect(p.regexps.all_books.length).toEqual(original_length + 4);
		for (const [i, book] of p.regexps.all_books.entries()) {
			if (book.osis.join(",") !== "Mal") {
				continue;
			}
			expect(/1Cor/.test(book.regexp.source)).toBeTrue();
			expect(p.regexps.all_books[i + 1].osis.join(",")).toEqual("Mal");
			break;
		}

		// This one's tricky. Because the regular `1Esd` pattern appears before this new one, if the Aprocrypha is active, it will be parsed as `1Esd`. If the Apocrypha isn't active, it'll be parsed as `Mal`.
		p.add_books({ books: [{ regexp: /1Esd/, osis: ["Mal"], insert_at: "end" }] });

		expect(p.parse("Q1 1:6").osis()).toEqual("");
		expect(p.parse("Q2 1:6").osis()).toEqual("");
		expect(p.parse("Q3 1:6").osis()).toEqual("Ps.1.6");
		expect(p.parse("1Cor 1:6").osis()).toEqual("Mal.1.6");
		expect(p.parse("1Esd 1:6").osis()).toEqual("Mal.1.6");

		p.set_options({ testaments: "ona" });
		expect(p.parse("Q1 1:6").osis()).toEqual("Matt.1.6");
		expect(p.parse("Q2 1:6").osis()).toEqual("1Esd.1.6");
		expect(p.parse("Q3 1:6").osis()).toEqual("Ps.1.6");
		expect(p.parse("1Cor 1:6").osis()).toEqual("Mal.1.6");
		expect(p.parse("1Esd 1:6").osis()).toEqual("1Esd.1.6");
	});
	it("should handle Psalm 151", () => {
		p.add_books({ books: [{ regexp: /Ps151\.1/, osis: ["Matt"] }] });
		expect(p.parse("Ps151.1.1").osis()).toEqual("Matt.1");
	});
});

function add_books_throw_matcher(e) {
	if (e.message?.match && e.message.match(/^add_books: /)) {
		return true;
	}
	return false;
}
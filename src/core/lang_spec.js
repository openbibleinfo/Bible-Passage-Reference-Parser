"use strict";
import { bcv_parser } from "../../esm/bcv_parser.js";
import * as lang from "../../esm/lang/$LANG.js";

describe("Parsing", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			osis_compaction_strategy: "b",
			sequence_combination_strategy: "combine"
		});
	});
	it("should round-trip OSIS references", () => {
		p.set_options({
			osis_compaction_strategy: "bc"
		});
		const books = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
		for (const book of books) {
			const bc = book + ".1";
			const bcv = bc + ".1";
			const bcv_range = bcv + "-" + bc + ".2";
			expect(p.parse(bc).osis()).toEqual(bc);
			expect(p.parse(bcv).osis()).toEqual(bcv);
			expect(p.parse(bcv_range).osis()).toEqual(bcv_range);
		}
	});
	it("should round-trip OSIS Apocrypha references", () => {
		p.set_options({
			osis_compaction_strategy: "bc",
			ps151_strategy: "b",
			testaments: "ona"
		});
		const books = ["Tob", "Jdt", "GkEsth", "Wis", "Sir", "Bar", "PrAzar", "Sus", "Bel", "SgThree", "EpJer", "1Macc", "2Macc", "3Macc", "4Macc", "1Esd", "2Esd", "PrMan", "Ps151"];
		for (const book of books) {
			const bc = book + ".1";
			const bcv = bc + ".1";
			const bcv_range = bcv + "-" + bc + ".2";
			expect(p.parse(bc).osis()).toEqual(bc);
			expect(p.parse(bcv).osis()).toEqual(bcv);
			expect(p.parse(bcv_range).osis()).toEqual(bcv_range);
		}
		p.set_options({
			ps151_strategy: "bc"
		});
		expect(p.parse("Ps151.1").osis()).toEqual("Ps.151");
		expect(p.parse("Ps151.1.1").osis()).toEqual("Ps.151.1");
		expect(p.parse("Ps151.1-Ps151.2").osis()).toEqual("Ps.151.1-Ps.151.2");
		p.set_options({
			testaments: "on"
		});
		for (const book of books) {
			const bc = book + ".1";
			expect(p.parse(bc).osis()).toEqual("");
		}
	});
	it("should handle a preceding character", () => {
		expect(p.parse(" Gen 1").osis()).toEqual("Gen.1");
		expect(p.parse("Matt5John3").osis()).toEqual("Matt.5,John.3");
		expect(p.parse("1Ps 1").osis()).toEqual("");
		expect(p.parse("11Sam 1").osis()).toEqual("");
	});
});

//$BOOK_TESTS

describe("Miscellaneous tests", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			book_alone_strategy: "ignore",
			book_sequence_strategy: "ignore",
			osis_compaction_strategy: "bc",
			captive_end_digits_strategy: "delete",
			testaments: "ona"
		});
	});
	it("should return the expected language", () => {
		expect(p.regexps.languages).toEqual($LANG_ISOS);
	});

//$MISC_TESTS
});

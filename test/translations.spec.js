"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("Setting translations", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("should set and then revert a translation", () => {
		expect(p.parse("3 John 15").osis_and_translations()).toEqual([["3John.1.15", ""]]);
		expect(p.parse("3 John 15 ESV, NIV").osis_and_translations()).toEqual([["3John.1.15", "ESV,NIV"]]);
		expect(p.parse("3 John 15 NIV, 3 John 15").osis_and_translations()).toEqual([["3John.1.15", ""]]);
		expect(p.parse("3 John 15 NIV").osis_and_translations()).toEqual([]);
		expect(p.parse("3 John 15").osis_and_translations()).toEqual([["3John.1.15", ""]]);
		expect(p.translations.current_system).toEqual("default");
	});
	it("should set and then revert a translation when setting a translation", () => {
		p.set_options( { versification_system: "kjv" });
		expect(p.parse("3 John 15").osis_and_translations()).toEqual([]);
		expect(p.parse("3 John 15 ESV, NIV").osis_and_translations()).toEqual([["3John.1.15", "ESV,NIV"]]);
		expect(p.parse("3 John 15 ESV, 3 John 14, 3 John 15").osis_and_translations()).toEqual([["3John.1.15", "ESV"], ["3John.1.14", ""]]);
		expect(p.parse("3 John 15 ESV").osis_and_translations()).toEqual([["3John.1.15", "ESV"]]);
		expect(p.parse("3 John 15").osis_and_translations()).toEqual([]);
		expect(p.translations.current_system).toEqual("kjv");
	});
});

describe("Adding new translations (manually)", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			book_alone_strategy: "full"
		});
		p.regexps.translations = [/\b(?:niv|comp|notrans|noalias)\b/gi];
		p.translations.aliases.comp = {
			osis: "COMP",
			system: "comp"
		};
		p.translations.aliases.notrans = {
			system: "no_translation_alias"
		};
		p.translations.systems.comp = {
			order: {
				"Matt": 1,
				"Gen": 2
			}
		};
		p.translations.systems.comp.chapters = {
			"Matt": p.translations.systems["default"].chapters.Matt,
			"Gen": p.translations.systems["default"].chapters.Gen
		};
	});
	it("should handle a nonexistent book", () => {
		expect(p.parse("Psalm 23 COMP").osis_and_translations()).toEqual([]);
		expect(p.parse("Psalms NIV").osis_and_translations()).toEqual([["Ps", "NIV"]]);
		expect(p.parse("Psalms COMP").osis_and_translations()).toEqual([]);
	});
	it("should handle reparsing when given a new translation", () => {
		expect(p.parse("Matt 2-Gen3 NIV").osis_and_translations()).toEqual([["Matt.2,Gen.3", "NIV"]]);
		expect(p.parse("Matt 2-Gen3 COMP").osis_and_translations()).toEqual([["Matt.2-Gen.3", "COMP"]]);
		expect(p.parse("Exodus 3, Matt 5 COMP").osis_and_translations()).toEqual([["Matt.5", "COMP"]]);
		expect(p.parse("Exodus 3-Matt 5 COMP").osis_and_translations()).toEqual([["Matt.5", "COMP"]]);
		expect(p.parse("Exodus 3-Matt 5 NOTRANS").osis_and_translations()).toEqual([["Exod.3-Matt.5", "NOTRANS"]]);
		expect(p.parse("Exodus 3-Matt 5 NOALIAS").osis_and_translations()).toEqual([["Exod.3-Matt.5", "NOALIAS"]]);
	});
});

describe("Adding new translations (programmatically)", () => {
	let p = {};
	const all_books = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev", "Tob", "Jdt", "GkEsth", "Wis", "Sir", "Bar", "PrAzar", "Sus", "Bel", "SgThree", "EpJer", "1Macc", "2Macc", "3Macc", "4Macc", "1Esd", "2Esd", "PrMan"];
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("should throw when given an invalid argument", () => {
		expect(() => p.add_translations()).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.add_translations("")).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.add_translations({translations:[]})).toThrowMatching(add_translations_throw_matcher);
		// Missing `text` property.
		expect(() => p.add_translations({translations:[{translation:"r", system: "r"}]})).toThrowMatching(add_translations_throw_matcher);
		// "r" doesn't exist as a versification system.
		expect(() => p.add_translations({translations:[{text:"r", system: "r"}]})).toThrowMatching(add_translations_throw_matcher);
	});
	it("should throw when given invalid versification data", () => {
		// Don't need to check that it's null; that's handled earlier.
		expect(() => p.translations_manager.add_system("ala", {})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("alb", {system: 1})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("alc", {system: "alias"})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("ald", {books: ""})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("ale", {books: []})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("alf", {chapters: ["a"]})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("alg", {chapters: {}})).toThrowMatching(add_translations_throw_matcher);
	});
	it("should throw when trying to redefine built-in systems", () => {
		expect(() => p.translations_manager.add_system("default", {books: ["Rev"]})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.add_system("current", {books: ["Rev"]})).toThrowMatching(add_translations_throw_matcher);
	});
	it("should handle valid versification system data", () => {
		expect(() => p.translations_manager.add_system("1", {books: ["Gen"]})).not.toThrow();
		// Make sure a duplicate alias isn't created.
		expect(() => p.translations_manager.add_system("1", {chapters: {"Gen": [1]}})).not.toThrow();
		expect(() => p.translations_manager.add_system("2", {chapters: {"Gen": [1]}})).not.toThrow();
	});
	it("should throw when given invalid normalized translation data", () => {
		expect(() => p.translations_manager.normalize_sent_translation_data({})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.normalize_sent_translation_data({text: null})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.normalize_sent_translation_data({text: ""})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.normalize_sent_translation_data({text: "123"})).toThrowMatching(add_translations_throw_matcher);
	});
	it("should handle valid normalized translation data", () =>{
		expect(p.translations_manager.normalize_sent_translation_data({text: "KJV"})).toEqual({osis: "KJV", system: "default"});
		expect(p.translations_manager.normalize_sent_translation_data({text: "RVR-1960", osis: "RVR60", system: "rvr60"})).toEqual({osis: "RVR60", system: "rvr60"});
		expect(p.translations_manager.normalize_sent_translation_data({text: "ESV", osis: "", system: ""})).toEqual({osis: "ESV", system: "default"});
	});
	it("should throw when given invalid versification.books", () => {
		expect(() => p.translations_manager.make_system_books([])).not.toThrow(); // handled earlier in the logic.
		expect(() => p.translations_manager.make_system_books([null])).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.make_system_books(["unknown book"])).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.make_system_books(["Gen"])).not.toThrow();
		expect(() => p.translations_manager.make_system_books(["Gen", "Gen"])).toThrowMatching(add_translations_throw_matcher);
	});
	it("should fill in versification.books", () => {
		expect(p.translations_manager.make_system_books(["Matt"])["Exod"]).toEqual(3);
		expect(Object.keys(p.translations_manager.make_system_books(["Obad", "Phlm"])).length).toEqual(84);
		expect(p.translations_manager.make_system_books(all_books)["PrMan"]).toEqual(84);
	});
	it("should throw when given invalid versification.chapters", () => {
		expect(() => p.translations_manager.validate_system_chapters({"unknown": [1]})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.validate_system_chapters({"Lev": []})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.validate_system_chapters({"Ps": [0]})).toThrowMatching(add_translations_throw_matcher);
		expect(() => p.translations_manager.validate_system_chapters({"Ps": [201]})).toThrowMatching(add_translations_throw_matcher);
	});
	it("should handle valid versification.chapters", () => {
		expect(() => p.translations_manager.validate_system_chapters({"Lev": [1]})).not.toThrow();
		expect(() => p.translations_manager.validate_system_chapters({"Matt": [5, 6], "Mark": [1, 2, 3]})).not.toThrow();
	});
	it("should add a new translation system", () => {
		p.add_translations({translations: [{"text": "D", system: "G"}], systems: { G: {books: ["Lam"]}}});
		expect(p.translations.systems["G"].books["Lam"]).toEqual(1);
		expect(p.translations.systems["G"].order).not.toBeDefined();
		// Duplicate versification. Don't redefine the system; accept the earlier one.
		p.add_translations({translations: [{"text": "M", system: "G", versification: {books: ["Jer","Lam"]}}]})
		expect(p.translations.systems["G"].books["Lam"]).toEqual(1);
		expect(p.translations.systems["G"].order).not.toBeDefined();
		// Duplicate translation `D`.
		p.add_translations({translations: [
			{"text": "D", system: "G"},
			{"text": "F", system: "E"}
			],
			systems: {
				E: {chapters: {"Lam":[8,3]}},
				G: {books: ["Jer","Lam"]}
			}
		});
		expect(p.translations.systems["G"].books["Lam"]).toEqual(1);
		expect(p.translations.systems["E"].chapters["Lam"].length).toEqual(2);
		expect(p.translations.systems["E"].books).not.toBeDefined();
	});
	it("shouldn't add unused systems", () => {
		p.add_translations({
			translations: [
				{"text": "F"}
			],
			systems: {
				E: { chapters: {"Lam":[8,3]} }
			}
		});
		expect(p.parse("Micah 2 F").osis_and_translations()).toEqual([["Mic.2", "F"]]);
		expect(p.translations.systems["F"]).not.toBeDefined();
	});
	it("shouldn't add systems without translations", () => {
		expect(() =>
		p.add_translations({
			systems: {
				F: { chapters: {"Lam":[8,3]} }
			}
		})
		).toThrowMatching(add_translations_throw_matcher);
		expect(p.parse("Micah 2 F").osis_and_translations()).toEqual([["Mic.2-Mic.7", ""]]);
		expect(p.translations.systems["F"]).not.toBeDefined();
	});
	it("should handle out-of-order additions", () => {
		//p.set_options({warn_level: "warn"});
		// The `E` doesn't throw because the second one defines it.
		p.add_translations({
			translations: [
				{"text": "F", system: "default"},
				{"text": "F", system: "E"}
			],
			systems: {
				E: { chapters: {"Lam":[8,3]} }
			}
		});
		expect(p.translations.aliases["f"].system).toEqual("E");
		// Make sure "F" isn't there twice.
		expect(/^\(F\)/.test(p.regexps.translations[0].source)).toEqual(true);

		// Here the `K` throws because it's not defined anywhere.
		expect(() => {
		p.add_translations({
			translations: [
				{"text": "H", system: "N", versification: {chapters: {"Lam":[8,3]}}},
				{"text": "I", system: "K"}
			]})
		}).toThrowMatching(add_translations_throw_matcher);


		p.add_translations(
			{translations: [
				{"text": "G", system: "E"},
				{"text": "F", system: "E", versification: {chapters: {"Lam":[8,3]}}}
			]});
		expect(p.translations.aliases["g"]).toEqual({ osis: "G", system: "E" });
		expect(p.translations.aliases["f"]).toEqual({ osis: "F", system: "E" });
		// Also no `F`.
		expect(/^\(G\)/.test(p.regexps.translations[0].source)).toEqual(true);
		expect(p.regexps.translations.length).toEqual(3);
		// Overwrite G with known system "default"
		p.add_translations({
			translations: [
				{"text": "g", system: "default"}
			]});
		// Unknown versification system K.
		expect(() => {
			p.add_translations({
				translations: [
					{"text": "M", system: "K"}
				]});
		}).toThrowMatching(add_translations_throw_matcher);
	});
	it("shouldn't let you set the system to `current`", () => {
		expect(() => p.add_translations({
			translations: [
				{"text": "R", system: "current"}
			]
		})
		).toThrowMatching(add_translations_throw_matcher);
	});
	it("should find the added translations", () => {
		expect(p.parse("Luke 2 (RVR60)").osis_and_translations()).toEqual([["Luke.2", ""]]);
		p.add_translations({
			translations: [
				{
					text: "RVR60",
					system: "kjv"
				},
				{
					text: "New International Version",
					osis: "NIV",
					system: "kjv"
				}
			]
		});
		expect(p.parse("Luke 2 (RVR60)").osis_and_translations()).toEqual([["Luke.2", "RVR60"]]);
		expect(p.parse("Luke 2 (ESV, RVR60)").osis_and_translations()).toEqual([["Luke.2", "ESV,RVR60"]]);
		expect(p.parse("Luke 2 (New International Version)").osis_and_translations()).toEqual([["Luke.2", "NIV"]]);
		expect(p.parse("Luke 2 (New International Version, RVR60)").osis_and_translations()).toEqual([["Luke.2", "NIV,RVR60"]]);
		// Doesn't exist in `kjv` versification.
		expect(p.parse("3 John 1:15 (RVR60)").osis_and_translations()).toEqual([]);
		// Arguably, these three should only be ESV. But the idea is that if it's a valid verse in one, it should be in the other, as well.
		expect(p.parse("3 John 1:15 (RVR60, ESV)").osis_and_translations()).toEqual([["3John.1.15", "RVR60,ESV"]]);
		expect(p.parse("3 John 1:15 (KJV, ESV)").osis_and_translations()).toEqual([["3John.1.15", "KJV,ESV"]]);
		expect(p.parse("3 John 1:15 (ESV and RVR60)").osis_and_translations()).toEqual([["3John.1.15", "ESV,RVR60"]]);
		expect(() => p.add_translations({translations: [{text:"RVR1960", system:"rvr60"}]})).toThrowMatching(add_translations_throw_matcher);
		p.add_translations({
			translations: [
				{
					text: "RVR1960",
					system: "rvr1960"
				}
			],
			systems: {
				rvr1960: { chapters: { Exod: [5, 6] }}
			}
		});
		expect(p.parse("Exodus 1:5 (RVR1960)").osis_and_translations()).toEqual([["Exod.1.5", "RVR1960"]]);
		// These fail because the definition doesn't include these verses or chapters.
		expect(p.parse("Exodus 1:6 (RVR1960)").osis_and_translations()).toEqual([]);
		expect(p.parse("Exodus 3 (RVR1960)").osis_and_translations()).toEqual([]);
	});
	it("should handle potentially problematic translation strings", () => {
		p.add_translations({
			translations: [
				{ text: "FF" },
				{ text: "John" },
				{ text: "RVR60" },
				{ text: "RVR" }, // subsets
				{ text: "R60" },
				{ text: "1ST", osis: "" },
				{ text: "NIV (1984)", osis: "NIV1984" }
			]
		});
		expect(p.parse("Lam 1:3 (FF)").osis_and_translations()).toEqual([["Lam.1.3", "FF"]]);
		expect(p.parse("Lam 1:3 FF").osis_and_translations()).toEqual([["Lam.1.3", "FF"]]);
		expect(p.parse("Lam 1:3ff").osis_and_translations()).toEqual([["Lam.1.3", "FF"]]);
		expect(p.parse("Lam 1:3rvr60").osis_and_translations()).toEqual([["Lam.1.3", "RVR60"]]);
		expect(p.parse("Lam 1:3rvr").osis_and_translations()).toEqual([["Lam.1.3", "RVR"]]);
		expect(p.parse("Lam 1:3r60").osis_and_translations()).toEqual([["Lam.1.3", "R60"]]);
		// Books take precedence over translations.
		expect(p.parse("John 1:3John").osis_and_translations()).toEqual([["John.1.3", ""]]);
		expect(p.parse("John 1:3 (John)").osis_and_translations()).toEqual([["John.1.3", ""]]);
		expect(p.parse("John 1:3 (1ST)").osis_and_translations()).toEqual([["John.1.3", "1ST"]]);
		// Translations take precedence over chapter/verse numbers.
		expect(p.parse("John 1:11ST").osis_and_translations()).toEqual([["John.1.1", "1ST"]]);
		expect(p.parse("John 1:11 NIV (1984)").osis_and_translations()).toEqual([["John.1.11", "NIV1984"]]);
	});
	it ("should handle `insert_at`", () => {
		p.add_translations({ insert_at: "start", translations: [{text: "ATSTART"}] });
		expect(/ATSTART/.test(p.regexps.translations[0].source)).toEqual(true);
		p.add_translations({ insert_at: "end", translations: [{text: "ATEND"}] });
		expect(/ATEND/.test(p.regexps.translations[p.regexps.translations.length - 1].source)).toEqual(true);
		// Default to start if unknown.
		p.add_translations({ insert_at: "somewhere", translations: [{text: "SOMEWHERE"}] });
		expect(/SOMEWHERE/.test(p.regexps.translations[0].source)).toEqual(true);
	});
	it("should handle pre and post regexps", () => {
		expect(p.parse("Matt2AMZ3").osis_and_translations()).toEqual([["Matt.2", ""]]);
		p.add_translations({
			translations: [
				{text: "AMZ"}
			],
			pre_regexp: /(?<=2)/,
			post_regexp: /(?=3)/
		});
		expect(p.parse("Matt2AMZ3").osis_and_translations()).toEqual([["Matt.2", "AMZ"]]);
		expect(p.parse("Matt1AMZ3").osis_and_translations()).toEqual([["Matt.1", ""]]);
		expect(p.parse("Matt2AMZ").osis_and_translations()).toEqual([["Matt.2", ""]]);
	});
});

function add_translations_throw_matcher(e) {
	if (e.message?.match && e.message.match(/^add_translations: /)) {
		return true;
	}
	return false;
}
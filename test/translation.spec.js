"use strict";
import { bcv_parser } from "../es/bcv_parser.js";
import * as lang from "../es/lang/en.js";

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
			alias: "comp"
		};
		p.translations.aliases.notrans = {
			alias: "no_translation_alias"
		};
		p.translations.definitions.comp = {
			order: {
				"Matt": 1,
				"Gen": 2
			}
		};
		p.translations.definitions.comp.chapters = {
			"Matt": p.translations.definitions["default"].chapters.Matt,
			"Gen": p.translations.definitions["default"].chapters.Gen
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

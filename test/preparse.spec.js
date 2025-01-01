"use strict";
import { bcv_parser } from "../es/bcv_parser.js";
import * as lang from "../es/lang/en.js";

describe("Instantiation", () => {
	it("should load", () => {
		expect(() => new bcv_parser(lang)).not.toThrow();
	});
	it("should require a valid argument to the constructor", () => {
		expect(() => new bcv_parser()).toThrow();
		expect(() => new bcv_parser("")).toThrow();
		expect(() => new bcv_parser({"grammar": {}, "regexps": {}, "translations": {}})).toThrowMatching((err) => /TypeError/.test(err));
	});
})

describe("Pre-parsing", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("should be defined", () => {
		expect(p).toBeDefined();
	});
	it("should have book regexps", () => {
		expect(p.regexps.books[0].osis).toEqual(["Gen"]);
		expect(p.regexps.escaped_passage).toBeDefined();
	});
	it("should reset itself", () => {
		p.unknown_property = "string";
		p.entities = [1];
		p.options.book_alone_strategy = "hi";
		p.reset();
		expect(p.unknown_property).toEqual("string");
		expect(p.entities).toEqual([]);
		expect(p.passage.books).toEqual([]);
		expect(p.passage.indices).toEqual({});
		expect(p.options.book_alone_strategy).toEqual("hi");
	});
	it("should reset itself when creating a new object", () => {
		p.unknown_property = "string";
		p.entities = [1];
		p.options.book_alone_strategy = "hi";
		p.options.nonexistent_option = "hi";
		p.passage = null;
		p = new bcv_parser(lang);
		expect(p.unknown_property).toBeUndefined();
		expect(p.entities).toEqual([]);
		expect(p.passage).toBeTruthy();
		expect(p.options.book_alone_strategy).not.toEqual("hi");
		expect(p.options.nonexistent_option).toBeUndefined();
	});
	it("should handle resetting options", () => {
		p.options.book_alone_strategy = "hi";
		p.options.nonexistent_option = "hi";
		p = new bcv_parser(lang);
		p.set_options({
			book_alone_strategy: "hi",
			nonexistent_option: "hi"
		});
		expect(p.options.book_alone_strategy).toEqual("hi");
		expect(p.options.nonexistent_option).toBeUndefined();
		p = new bcv_parser(lang);
		expect(p.options.book_alone_strategy).not.toEqual("hi");
		expect(p.options.nonexistent_option).toBeUndefined();
	});
	it("should allow setting whether to include the Apocrypha via `set_options`", () => {
		expect(p.options.testaments).toEqual("on");
		p.set_options({
			include_apocrypha: "unknown"
		});
		expect(p.options.testaments).toEqual("on");
		p.set_options({
			include_apocrypha: true
		});
		expect(p.options.testaments).toEqual("ona");
	});
	it("should allow setting whether to include the Apocrypha via `include_apocrypha()`", () => {
		expect(p.options.testaments).toEqual("on");
		p.include_apocrypha("unknown");
		expect(p.options.testaments).toEqual("on");
		p.include_apocrypha(true);
		expect(p.options.testaments).toEqual("ona");
	});
	it("shouldn't allow changing to an unknown versification system", () => {
		p.set_options({versification_system: "unknown"});
		expect(p.options.versification_system).toEqual("default");
	});
	it("should allow changing to the `vulgate` versification system and back again", () => {
		p.set_options({
			versification_system: "vulgate"
		});
		expect(p.options.versification_system).toEqual("vulgate");
		expect(p.translations.definitions["current"].chapters.Ps[118]).toEqual(7);
		expect(p.parse("Ps 118:176").osis()).toEqual("Ps.118.176");
		expect(p.parse("Ps 119:176").osis()).toEqual("");
		expect(p.parse("Ps 151:1").osis()).toEqual("");
		p.set_options({
			versification_system: "default"
		});
		expect(p.options.versification_system).toEqual("default");
		expect(p.translations.definitions["current"].chapters.Ps[118]).toEqual(176);
		expect(p.parse("Ps 118:176").osis()).toEqual("");
		expect(p.parse("Ps 119:176").osis()).toEqual("Ps.119.176");
		expect(p.parse("Ps 151:1").osis()).toEqual("");
	});
	it("should allow the `vulgate` versification system to work with the Apocrypha", () => {
		p.set_options({
			versification_system: "vulgate",
			include_apocrypha: true
		});
		expect(p.options.versification_system).toEqual("vulgate");
		expect(p.translations.definitions["current"].chapters.Ps[118]).toEqual(7);
		expect(p.parse("Ps 118:176").osis()).toEqual("Ps.118.176");
		expect(p.parse("Ps 119:176").osis()).toEqual("");
		expect(p.parse("Ps 151:1").osis()).toEqual("Ps.151.1");
		p.set_options({
			versification_system: "default"
		});
		expect(p.options.versification_system).toEqual("default");
		expect(p.translations.definitions["current"].chapters.Ps[118]).toEqual(176);
		expect(p.parse("Ps 118:176").osis()).toEqual("");
		expect(p.parse("Ps 119:176").osis()).toEqual("Ps.119.176");
		expect(p.parse("Ps 151:1").osis()).toEqual("Ps.151.1");
	});
	it("should handle inline alternate versification systems", () => {
		expect(p.parse("Matt 15 ESV, Matt 15 NIV, Matt 15").osis_and_translations()).toEqual([["Matt.15", "ESV"], ["Matt.15", "NIV"], ["Matt.15", ""]]);
		expect(p.parse("Third John 15 ESV, Third John 15 NIV, Third John 15").osis_and_translations()).toEqual([["3John.1.15", "ESV"], ["3John.1.15", ""]]);
		expect(p.parse("Third John 15 ESV, NIV, KJV").osis_and_translations()).toEqual([["3John.1.15", "ESV,NIV,KJV"]]);
		expect(p.parse("Third John 15 NIV, KJV, ESV, ").osis_and_translations()).toEqual([["3John.1.15", "NIV,KJV,ESV"]]);
		expect(p.parse("Third John 15 NIV, ESV, KJV").osis_and_translations()).toEqual([["3John.1.15", "NIV,ESV,KJV"]]);
	});
	it("should create (promote) start books based on the default translation when a translation doesn't explicitly define them", () => {
		expect(p.parse("Num 14-Deut 6 KJV").osis_and_translations()).toEqual([["Num.14-Deut.6", "KJV"]]);
		p.set_options({
			versification_system: "kjv"
		});
		expect(p.parse("Joshua 14:2-Judges 6 CEB").osis_and_translations()).toEqual([["Josh.14.2-Judg.6.40", "CEB"]]);
	});
	it("should reset versification systems properly when switching among several systems", () => {
		expect(p.parse("Ps 118:176").osis()).toEqual("");
		expect(p.parse("Ps 119:176").osis()).toEqual("Ps.119.176");
		expect(p.parse("3 John 15").osis()).toEqual("3John.1.15");
		p.set_options({
			versification_system: "vulgate"
		});
		expect(p.parse("Ps 118:176").osis()).toEqual("Ps.118.176");
		expect(p.parse("Ps 119:176").osis()).toEqual("");
		expect(p.parse("3 John 15").osis()).toEqual("3John.1.15");
		p.set_options({
			versification_system: "kjv"
		});
		expect(p.parse("Ps 118:176").osis()).toEqual("");
		expect(p.parse("Ps 119:176").osis()).toEqual("Ps.119.176");
		expect(p.parse("3 John 15").osis()).toEqual("");
	});
	it("should allow adding a new versification system manually (but don't actually do it this way)", () => {
		p.translations.definitions.new_system = {
			order: {
				Ps: 1,
				Matt: 2
			},
			chapters: {
				Ps: [3, 4, 5],
				Matt: [6, 7, 8]
			}
		};
		p.set_options({
			versification_system: "new_system"
		});
		expect(p.options.versification_system).toEqual("new_system");
		expect(p.parse("Psalm 1:3").osis()).toEqual("Ps.1.3");
		expect(p.parse("Ps 1:4").osis()).toEqual("");
		expect(p.parse("Ps 2ff").osis()).toEqual("Ps.2-Ps.3");
		expect(p.parse("Proverbs 2:3").osis()).toEqual("");
		expect(p.parse("Ps 3-Proverbs 2:3").osis()).toEqual("Ps.3");
		expect(p.parse("Ps 3\u2014Matt 2:7").osis()).toEqual("Ps.3-Matt.2");
		expect(p.parse("Ps 3-Matt 2:8").osis()).toEqual("Ps.3-Matt.2");
		expect(p.parse("Ps 3-Matt 4").osis()).toEqual("Ps.3-Matt.3");
	});
	it("should handle two translations in a row", () => {
		expect(p.parse("Matt 1,4 ESV 2-3 NIV").osis_and_indices()).toEqual([
			{
				osis: "Matt.1,Matt.4",
				translations: ["ESV"],
				indices: [0, 12]
			}, {
				osis: "Matt.2-Matt.3",
				translations: ["NIV"],
				indices: [13, 20]
			}
		]);
		expect(p.parse("3 Jn 15 ESV 15 NIV").osis_and_indices()).toEqual([
			{
				osis: "3John.1.15",
				translations: ["ESV"],
				indices: [0, 11]
			}
		]);
		expect(p.parse("3 Jn 15 NIV 15 ESV").osis_and_indices()).toEqual([
			{
				osis: "3John.1.15",
				translations: ["ESV"],
				indices: [12, 18]
			}
		]);
	});
	it("should delete the previously added new versification system when creating a new object", () => {
		p.set_options({
			versification_system: "new_system"
		});
		expect(p.translations.definitions.new_system).not.toBeDefined();
	});
	it("should handle control characters", () => {
		expect(p.matcher.replace_control_characters(" hi ").length).toEqual(4);
		const test_string = " \x1ehi\x1e \r\n \x1f0\x1f\n\r\u00a0\x00\u001e\u2014\xa0\x1f\x1f";
		const match_string = "  hi  \r\n  0 \n\r\u00a0\x00 \u2014\xa0  ";
		const replaced_string = p.matcher.replace_control_characters(test_string);
		expect(replaced_string.length).toEqual(test_string.length);
		expect(escape(replaced_string)).toEqual(escape(match_string));
	});
	it("should handle non-Latin digits when asked", () => {
		expect(p.parse("2 Peter \u0662:\u0663-\u0664").osis()).toEqual("");
		p.set_options({
			non_latin_digits_strategy: "replace"
		});
		expect(p.parse("2 Peter \u0662:\u0663-\u0664").osis()).toEqual("2Pet.2.3-2Pet.2.4");
	});
	it("should match basic books", () => {
		const [s, books] = p.matcher.match_books("Jeremiah, Genesisjer (NIV)");
		expect(books.length).toEqual(2);
		expect(books[0]).toEqual({
			value: "Jeremiah",
			parsed: ["Jer"],
			type: "book",
			start_index: 0
		});
		expect(books[1]).toEqual({
			value: "NIV",
			parsed: "niv",
			type: "translation",
			start_index: 22
		});
		expect(s).toEqual("\x1f0\x1f, Genesisjer (\x1e1\x1e)");
	});
	it("should match passage sequences", () => {
		const sequences = [["\x1f0\x1f", "R"], ["\x1f0\x1f 1:2, 3:4; see also 5:6-7 and compare cf. 8.9ff (\x1e1\x1e)", "R"], ["see \x1f0\x1f", "seeR"], ["see \"\x1f999\x1f\" ", "see R"], ["\x1f0\x1f and me.", "Rme."], ["my\x1f0\x1f and .", "my\x1f0\x1f and ."], [" \x1f0\x1f and . then \x1f1\x1f 2-3ff for\x1f1\x1f 3", "RthenRfor\x1f1\x1f 3"], ["1\x1f0\x1f2", "1\x1f0\x1f2"], ["\x1f0\x1f2\x1f1\x1f3", "R"], ["\x1f\x1f \x1fa\x1f 2", "\x1f\x1f \x1fa\x1f 2"]];
		for (let [s, post] of sequences) {
			s = s.replace(p.regexps.escaped_passage, () => "R");
			expect(s).toEqual(post);
		}
	});
	it("should handle consecutive checking", () => {
		p.reset();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 2
		}, "default")).toBeTruthy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 2
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, "default")).toBeFalsy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 3
		}, "default")).toBeFalsy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 31
		}, {
			b: "Gen",
			c: 2,
			v: 1
		}, "default")).toBeTruthy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 30
		}, {
			b: "Gen",
			c: 1,
			v: 2
		}, "default")).toBeFalsy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 31
		}, {
			b: "Gen",
			c: 1,
			v: 2
		}, "default")).toBeFalsy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 1,
			v: 31
		}, {
			b: "Gen",
			c: 2,
			v: 2
		}, "default")).toBeFalsy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 50,
			v: 26
		}, {
			b: "Exod",
			c: 1,
			v: 1
		}, "default")).toBeTruthy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 50,
			v: 25
		}, {
			b: "Exod",
			c: 1,
			v: 1
		}, "default")).toBeFalsy();
		expect(p.is_verse_consecutive({
			b: "Gen",
			c: 50,
			v: 26
		}, {
			b: "Exod",
			c: 1,
			v: 2
		}, "default")).toBeFalsy();
	});

	it("should identify being followed by a book", () => {
		p.reset();
		expect(p.starts_with_book({
			type: "bc"
		})).toBeTruthy();
		expect(p.starts_with_book({
			type: "cv"
		})).toBeFalsy();
		expect(p.starts_with_book({
			type: "range",
			start: {
				type: "bcv"
			}
		})).toBeTruthy();
		expect(p.starts_with_book({
			type: "range",
			start: {
				type: "integer"
			}
		})).toBeFalsy();
	});
	it("should turn on/off the Apocrypha using `include_apocrypha`", () => {
		p.reset();
		p.include_apocrypha(true);
		expect(p.translations.definitions["current"].chapters["Ps"][150]).toEqual(7);
		expect(p.translations.definitions["current"].order["Tob"]).toEqual(67);
		expect(p.options.testaments).toEqual("ona");
		p.include_apocrypha(false);
		expect(p.translations.definitions["current"].chapters["Ps"][150]).not.toBeDefined();
		expect(p.options.testaments).toEqual("on");
	});
	it("should turn on/off the Apocrypha using `testaments`", () => {
		p.reset();
		p.set_options({testaments: "ona"});
		expect(p.translations.definitions["current"].chapters["Ps"][150]).toEqual(7);
		expect(p.translations.definitions["current"].order["Tob"]).toEqual(67);
		expect(p.options.testaments).toEqual("ona");
		p.set_options({testaments: "oa"});
		expect(p.translations.definitions["current"].chapters["Ps"][150]).toEqual(7);
		expect(p.translations.definitions["current"].order["Tob"]).toEqual(67);
		expect(p.options.testaments).toEqual("oa");
		p.set_options({testaments: "a"});
		expect(p.translations.definitions["current"].chapters["Ps"][150]).toEqual(7);
		expect(p.translations.definitions["current"].order["Tob"]).toEqual(67);
		expect(p.options.testaments).toEqual("a");
		p.set_options({testaments: "o"});
		expect(p.translations.definitions["current"].chapters["Ps"][150]).not.toBeDefined();
		expect(p.options.testaments).toEqual("o");
	});
	it("should handle case-sensitivity", () => {
		p.reset();
		const test_string = "heb 12, ex 3, i macc2";
		expect(p.parse(test_string).osis()).toEqual("Heb.12,Exod.3");
		p.set_options({
			case_sensitive: "unknown"
		});
		expect(p.parse(test_string).osis()).toEqual("Heb.12,Exod.3");
		p.set_options({
			case_sensitive: "books"
		});
		expect(p.parse(test_string).osis()).toEqual("");
		p.set_options({
			case_sensitive: "books"
		});
		expect(p.parse(test_string).osis()).toEqual("");
		p.set_options({
			include_apocrypha: true
		});
		expect(p.parse(test_string).osis()).toEqual("");
		p.set_options({
			case_sensitive: "none"
		});
		expect(p.parse(test_string).osis()).toEqual("Heb.12,Exod.3,1Macc.2");
	});
	it("should replace ends correctly with `captive_end_digits_strategy` = `delete`", () => {
		const match = { index: 0 };
		const tests = [
			["\x1f0\x1f 3b", "\x1f0\x1f 3b"],
			["\x1f0\x1f 4b.", "\x1f0\x1f 4b"],
			["\x1f0\x1f 5chapter", "\x1f0\x1f"],
			["\x1f0\x1f 6ff. ", "\x1f0\x1f 6ff."],
			["\x1f0\x1f go", "\x1f0\x1f"],
			["\x1f0\x1f 7.", "\x1f0\x1f 7"],
			["\x1f0\x1f 8 ", "\x1f0\x1f 8"],
			["(\x1e0\x1e)", "(\x1e0\x1e)"],
			["[\x1e0\x1e]", "[\x1e0\x1e]"],
		]
		for (const [input, output] of tests) {
			expect(p.matcher.clean_end_match(input + "w", match, input)).toEqual(output);
		}
	});
	it("should replace ends correctly with `captive_end_digits_strategy` = `include`", () => {
		p.set_options({captive_end_digits_strategy: "include"});
		const match = { index: 0 };
		const tests = [
			["\x1f0\x1f 3b", "\x1f0\x1f 3b"],
			["\x1f0\x1f 4b.", "\x1f0\x1f 4b"],
			["\x1f0\x1f 5chapter", "\x1f0\x1f 5"],
			["\x1f0\x1f 6ff. ", "\x1f0\x1f 6ff."],
			["\x1f0\x1f go", "\x1f0\x1f"],
			["\x1f0\x1f 7.", "\x1f0\x1f 7"],
			["\x1f0\x1f 8 ", "\x1f0\x1f 8"],
			["(\x1e0\x1e)", "(\x1e0\x1e)"],
			["[\x1e0\x1e]", "[\x1e0\x1e]"],
		]
		for (const [input, output] of tests) {
			expect(p.matcher.clean_end_match(input, match, input)).toEqual(output);
		}
		p.set_options({captive_end_digits_strategy: "delete"});
	});
	it("should pluck null passages", () => {
		p.parse("Jonah 2");
		expect(p.passage.pluck("none", [])).toEqual(null);
		expect(p.passage.pluck("none", [
			{
				type: "b"
			}
		])).toEqual(null);
	});
	it("should handle `pluck_last_recursively` with various input", () => {
		p.parse("Jonah 3");
		expect(p.passage.pluck_last_recursively("integer", [])).toEqual(null);
		expect(p.passage.pluck_last_recursively("integer", [null])).toEqual(null);
		expect(() => {
			return p.passage.pluck_last_recursively("integer", [
				{
					type: "b"
				}
			]);
		}).toThrow();
		expect(() => {
			return p.passage.pluck_last_recursively("integer", null);
		}).toThrow();
	});
});

describe("Administrative behavior", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it("should handle `translation_info` given known inputs", () => {
		const niv = p.translation_info("niv");
		expect(niv.order["1Esd"]).toEqual(82);
		expect(niv.books[65]).toEqual("Rev");
		expect(niv.books.length).toEqual(84);
		expect(niv.chapters["3John"][0]).toEqual(14);
		expect(p.options.versification_system).toEqual("default");
		expect(niv.alias).toEqual("kjv");
		const esv = p.translation_info("esv");
		expect(esv.order["1Esd"]).toEqual(82);
		expect(esv.books[65]).toEqual("Rev");
		expect(esv.books.length).toEqual(84);
		expect(esv.chapters["3John"][0]).toEqual(15);
		expect(p.options.versification_system).toEqual("default");
		expect(esv.alias).toEqual("default");
		const nab = p.translation_info("nabre");
		expect(nab.order["1Esd"]).toEqual(18);
		expect(nab.books[65]).toEqual("Gal");
		expect(nab.books.length).toEqual(84);
		expect(nab.chapters["3John"][0]).toEqual(15);
		expect(p.options.versification_system).toEqual("default");
		expect(nab.alias).toEqual("nab");
		nab.order["Gen"] = 15;
		expect(p.translations.definitions.current.order["Gen"]).toEqual(1);
	});
	it("should handle `translation_info` given unknown inputs", () => {
		p.set_options({
			versification_system: "nab"
		});
		const array_response = p.translation_info([]);
		const null_response = p.translation_info(null);
		expect(array_response.chapters["3John"][0]).toEqual(15);
		expect(null_response.chapters["3John"][0]).toEqual(15);
	});
	it("should tell what languages the regexps are using", () => {
		expect(p.regexps.languages).toEqual(["en"]);
	});
});

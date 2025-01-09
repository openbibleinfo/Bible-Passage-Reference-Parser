"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as en from "../esm/lang/en.js";
import * as ascii from "../esm/lang/ascii.js";
import * as full from "../esm/lang/full.js";

describe("Documentation compatibility", () => {
	// The documentation uses the `bcv` variable name instead of the `p` object used in other specs.
	let bcv = {};
	beforeEach(() => {
		bcv = new bcv_parser(en);
	});
	it("should match `parse_with_context()`", () => {
		expect(bcv.parse_with_context("verse 16", "John 3").osis()).toEqual("John.3.16");
		expect(bcv.parse_with_context("chapter 2", "Hebrews").osis()).toEqual("Heb.2");
		expect(bcv.parse_with_context("my favorite chapter is chapter 2", "Hebrews").osis()).toEqual("Isa.2");
		expect(bcv.parse_with_context("verse 17", "John 3:16").osis()).toEqual("John.3.17");
		expect(bcv.parse_with_context("verse 16", "John 3 NIV").osis_and_translations()).toEqual([["John.3.16", ""]]);
	});
	it("should match `osis()`", () => {
		expect(bcv.parse("John 1").osis()).toEqual("John.1");
		expect(bcv.parse("John 3:16").osis()).toEqual("John.3.16");
		expect(bcv.parse("John 3:16 NIV").osis()).toEqual("John.3.16");
		expect(bcv.parse("John 3:16-17").osis()).toEqual("John.3.16-John.3.17");
		expect(bcv.parse("John 3:16,18").osis()).toEqual("John.3.16,John.3.18");
		expect(bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis()).toEqual("John.3.16,John.3.18,Matt.1");
	});
	it("should match `osis_and_translations()`", () => {
		expect(bcv.parse("Matt 5:6 NIV").osis_and_translations()).toEqual([["Matt.5.6", "NIV"]]);
		expect(bcv.parse("NIV: Matt 5:6").osis_and_translations()).toEqual([["Matt.5.6", ""]]);
		expect(bcv.parse("John 3:16 NIV").osis_and_translations()).toEqual([["John.3.16", "NIV"]]);
		expect(bcv.parse("John 3:16-17").osis_and_translations()).toEqual([["John.3.16-John.3.17", ""]]);
		expect(bcv.parse("John 3:16,18").osis_and_translations()).toEqual([["John.3.16,John.3.18", ""]]);
		expect(bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis_and_translations()).toEqual([["John.3.16,John.3.18", ""], ["Matt.1", "NIV,ESV"]]);
	});
	it("should match `osis_and_indices()`", () => {
		expect(bcv.parse("John 3:16 NIV").osis_and_indices()).toEqual([
			{
				"osis": "John.3.16",
				"translations": ["NIV"],
				"indices": [0, 13]
			}
		]);
		expect(bcv.parse("John 3:16-17").osis_and_indices()).toEqual([
			{
				"osis": "John.3.16-John.3.17",
				"translations": [""],
				"indices": [0, 12]
			}
		]);
		expect(bcv.parse("John 3:16,18").osis_and_indices()).toEqual([
			{
				"osis": "John.3.16,John.3.18",
				"translations": [""],
				"indices": [0, 12]
			}
		]);
		expect(bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis_and_indices()).toEqual([
			{
				"osis": "John.3.16,John.3.18",
				"translations": [""],
				"indices": [0, 12]
			}, {
				"osis": "Matt.1",
				"translations": ["NIV", "ESV"],
				"indices": [18, 38]
			}
		]);
	});
	it("should match `parsed_entities()`", () => {
		bcv.set_options({
			"invalid_passage_strategy": "include",
			"invalid_sequence_strategy": "include"
		});
		expect(bcv.parse("John 3, 99").parsed_entities()).toEqual([
			{
				"osis": "John.3",
				"indices": [0, 10],
				"translations": [""],
				"entity_id": 0,
				"entities": [
					{
						"osis": "John.3",
						"type": "bc",
						"indices": [0, 6],
						"translations": [""],
						"start": {
							"b": "John",
							"c": 3,
							"v": 1
						},
						"end": {
							"b": "John",
							"c": 3,
							"v": 36
						},
						"enclosed_indices": [-1, -1],
						"entity_id": 0,
						"entities": [
							{
								"start": {
									"b": "John",
									"c": 3,
									"v": 1
								},
								"end": {
									"b": "John",
									"c": 3,
									"v": 36
								},
								"valid": {
									"valid": true,
									"messages": {}
								},
								"type": "bc",
								"absolute_indices": [0, 6],
								"enclosed_absolute_indices": [-1, -1]
							}
						]
					}, {
						"osis": "",
						"type": "integer",
						"indices": [8, 10],
						"translations": [""],
						"start": {
							"b": "John",
							"c": 99
						},
						"end": {
							"b": "John",
							"c": 99
						},
						"enclosed_indices": [-1, -1],
						"entity_id": 0,
						"entities": [
							{
								"start": {
									"b": "John",
									"c": 99
								},
								"end": {
									"b": "John",
									"c": 99
								},
								"valid": {
									"valid": false,
									"messages": {
										"start_chapter_not_exist": 21
									}
								},
								"type": "integer",
								"absolute_indices": [8, 10],
								"enclosed_absolute_indices": [-1, -1]
							}
						]
					}
				]
			}
		]);
		expect(bcv.parse("Ph 2").parsed_entities()[0].entities[0].entities[0].alternates).toBeDefined();
	});
	it("should match `include_apocrypha()`", () => {
		expect(bcv.parse("Tobit 1").osis()).toEqual("");
		bcv.include_apocrypha(true);
		expect(bcv.parse("Tobit 1").osis()).toEqual("Tob.1");
	});
	it("should match `set_options()`", () => {
		bcv.set_options({
			"osis_compaction_strategy": "bcv"
		});
		expect(bcv.parse("Genesis 1").osis()).toEqual("Gen.1.1-Gen.1.31");
	});
	it("should handle `punctuation_strategy` examples in the documentation", () => {
		bcv.set_options({
			punctuation_strategy: "us"
		});
		expect(bcv.parse("Matt 1, 2. 4").osis()).toEqual("Matt.1,Matt.2.4");
		bcv.set_options({
			punctuation_strategy: "eu"
		});
		expect(bcv.parse("Matt 1, 2. 4").osis()).toEqual("Matt.1.2,Matt.1.4");
	});
	it("shouldn't handle multiple languages", () =>{
		expect(bcv.parse("Matthew 2, Juan 1").osis()).toEqual("Matt.2");
	});
	it("should handle `add_books", () => {
		expect(bcv.parse("Marco 1").osis()).toEqual("");
		bcv.add_books({books: [{
			osis: ["Mark"],
			regexp: /Marco|Mrc/
		}]});
		bcv.parse("Marco 1").osis(); // Mark.1
		bcv.parse("Mrc 1").osis(); // Mark.1
	});
	it("should handle add_translations", () => {
		expect(bcv.parse("Mark 1 (NIV1984)").osis_and_translations()).toEqual([["Mark.1", ""]]);
		bcv.add_translations({
			translations: [{ text: "NIV1984", system: "kjv" }]
		})
		expect(bcv.parse("Mark 1 (NIV1984)").osis_and_translations()).toEqual([["Mark.1", "NIV1984"]]);
		expect(bcv.parse("3 John 15 (NIV1984)").osis_and_translations()).toEqual([]);
		bcv.add_translations({
			translations: [{ text: "ONLYMATT", osis: "MATTHEWTRANSLATION", system: "custom1" }],
			systems: {
				custom1: {
					books: ["Matt"],
					chapters: {
						"Matt": [10]
					}
				}
			}
		});
		expect(bcv.parse("Matt 1:2 ONLYMATT").osis_and_translations()).toEqual([["Matt.1.2", "MATTHEWTRANSLATION"]]);

	});
	it("should handle `warn_level`", () => {
		const oldWarn = console.warn;
		console.warn = (msg) => { throw msg };
		bcv.set_options({ warn_level: "warn" });
		expect(() => bcv.set_options({ versification_system: "kjv"})).not.toThrow();
		expect(() => bcv.set_options({ versification_system: "unknown"})).toThrow();
		expect(() => bcv.translation_info("kjv")).not.toThrow();
		expect(() => bcv.translation_info("unknown")).toThrow();
		console.warn = oldWarn;
	});
});

describe("Full BCV parser", () => {
	it("should handle multiple languages", () =>{
		const bcv = new bcv_parser(full);
		expect(bcv.parse("Matthew 2, Juan 1").osis()).toEqual("Matt.2,John.1");
	});
});

describe("ASCII BCV parser", () => {
	it("should handle multiple languages", () =>{
		const bcv = new bcv_parser(ascii);
		expect(bcv.parse("Matthew 2, Juan 1").osis()).toEqual("Matt.2,John.1");
	});
});

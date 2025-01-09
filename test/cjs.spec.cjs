const bcv_parser = require("../cjs/en_bcv_parser.min.js").bcv_parser;

describe("Validate public API", () => {
	let p = {};
	beforeEach(() => {
		p = {};
		p = new bcv_parser();
	});

	it("should match `osis()`", () => {
		expect(p.parse("John 3:16 NIV").osis()).toEqual("John.3.16");
	});
	it("should match `osis_and_translations()`", () => {
		expect(p.parse("John 3:16 NIV").osis_and_translations()).toEqual([["John.3.16", "NIV"]]);
	});
	it("should match `osis_and_indices()`", () => {
		expect(p.parse("John 3:16 NIV").osis_and_indices()).toEqual([
			{
				"osis": "John.3.16",
				"translations": ["NIV"],
				"indices": [0, 13]
			}
		]);
	});
	it("should match `parsed_entities()`", () => {
		expect(p.parse("John 3:16 NIV").parsed_entities()).toEqual([{
			osis: "John.3.16",
			indices: [0,13],
			translations: ["NIV"],
			entity_id: 0,
			entities: [{
				osis: "John.3.16",
				type: "bcv",
				indices: [0, 9],
				enclosed_indices: undefined,
				translations: ["NIV"],
				start: {b: "John", c: 3, v: 16},
				end: {b: "John", c: 3, v: 16},
				entity_id: 0,
				entities: [{
					start: {b: "John", c: 3, v: 16},
					end: {b: "John", c: 3, v: 16},
					valid: {valid: true, messages: {}},
					translations: [{
						translation: "niv",
						system: "kjv",
						osis: "NIV"
					}],
					type: "bcv",
					absolute_indices: [0, 9]
				}]
			}]
		}]);
	});
	it("should match `include_apocrypha()`", () => {
		expect(p.parse("Tobit 1").osis()).toEqual("");
		p.include_apocrypha(true);
		expect(p.parse("Tobit 1").osis()).toEqual("Tob.1");
	});
	it("should match `set_options()`", () => {
		p.set_options({
			"osis_compaction_strategy": "bcv"
		});
		expect(p.parse("Genesis 1").osis()).toEqual("Gen.1.1-Gen.1.31");
	});
});
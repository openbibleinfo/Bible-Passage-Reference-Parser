"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_regexps_manager (auto)", () => {
	let p = {};

	beforeEach(() => {
		p = new bcv_parser(lang);
	});

	it("reuses books array when filter args are unchanged", () => {
		const before = p.regexps.books;
		p.regexps_manager.filter_books("on", "none");
		const after = p.regexps.books;
		expect(after).toBe(before);
	});

	it("falls back to end when insert_at target is unknown", () => {
		const initial_length = p.regexps.all_books.length;
		p.add_books({
			books: [
				{
					osis: ["Mark"],
					regexp: /AUTO_UNKNOWN_INSERT/,
					insert_at: "Unknown,Book"
				}
			]
		});
		expect(p.regexps.all_books.length).toEqual(initial_length + 1);
		const last = p.regexps.all_books[p.regexps.all_books.length - 1];
		expect(last.osis).toEqual(["Mark"]);
		expect(last.regexp.source.includes("AUTO_UNKNOWN_INSERT")).toBeTrue();
	});

	it("re-filters active books immediately after add_books()", () => {
		p.set_options({ testaments: "n" });
		p.add_books({
			books: [
				{ osis: ["Gen"], regexp: /AUTO_GEN/ },
				{ osis: ["Matt"], regexp: /AUTO_MATT/ }
			]
		});
		expect(p.parse("AUTO_MATT 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("AUTO_GEN 1:1").osis()).toEqual("");

		p.set_options({ testaments: "o" });
		expect(p.parse("AUTO_MATT 1:1").osis()).toEqual("");
		expect(p.parse("AUTO_GEN 1:1").osis()).toEqual("Gen.1.1");
	});

	it("rejects non-RegExp post_regexp values", () => {
		expect(() => p.add_books({
			books: [{ osis: ["Mark"], regexp: /AUTO_POST/, post_regexp: "" }]
		})).toThrowError(/add_books: The `post_regexp` property of each pattern should be a RegExp/);
	});

	it("accepts explicit pre_regexp and post_regexp overrides", () => {
		const out = p.regexps_manager.get_book_pattern_regexps(
			{ osis: ["Mark"], regexp: /AUTO_CUSTOM/, pre_regexp: /(?<=\s)/, post_regexp: /(?=\s|$)/ },
			{ has_number_book: true }
		);
		expect(out.pre_regexp.source).toEqual("(?<=\\s)");
		expect(out.regexp.source).toEqual("AUTO_CUSTOM");
		expect(out.post_regexp.source).toEqual("(?=\\s|$)");
	});

	it("rejects duplicate OSIS values in a single pattern", () => {
		expect(() => p.add_books({
			books: [{ osis: ["Gen", "Gen"], regexp: /AUTO_DUP/ }]
		})).toThrowError(/Every provided book should be unique/);
	});

	it("rejects empty OSIS arrays", () => {
		let err = null;
		try {
			p.add_books({
				books: [{ osis: [], regexp: /AUTO_EMPTY/, pre_regexp: /(?:^|(?<=\s))/, post_regexp: /(?=\s|$)/ }]
			});
		} catch (e) {
			err = e;
		}
		expect(err?.message).toMatch(/The `osis` property of each pattern should be a non-empty array/);
	});
});

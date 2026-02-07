"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_matcher auto coverage", () => {
	it("covers add_book_range_object early return for non-array passage.value", () => {
		const p = new bcv_parser(lang);
		const passage = {
			type: "base",
			match: "\x1f0\x1f",
			start_index: 10,
			value: {
				0: {
					type: "b",
					indices: [0, 3],
					value: "2Sam"
				},
				length: 1
			}
		};
		const prev = "1-".match(/(1-)/);
		const result = p.matcher.add_book_range_object(passage, prev, 1);

		expect(result).toBe(passage);
		expect(passage.match).toBe("1-\x1f0\x1f");
	});
});

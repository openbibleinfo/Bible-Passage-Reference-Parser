"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_options (auto)", () => {
	it("warns on invalid punctuation_strategy when warn_level is warn", () => {
		const p = new bcv_parser(lang);
		const original = p.options.punctuation_strategy;
		spyOn(console, "warn");

		p.set_options({ warn_level: "warn" });
		// JS callers can still pass invalid runtime values.
		p.set_options({ punctuation_strategy: "invalid" });

		expect(console.warn).toHaveBeenCalled();
		expect(p.options.punctuation_strategy).toEqual(original);
	});
});

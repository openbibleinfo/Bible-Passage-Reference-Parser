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

	it("warns on invalid testaments values when warn_level is warn", () => {
		const p = new bcv_parser(lang);
		spyOn(console, "warn");
		p.set_options({ warn_level: "warn" });

		// Out-of-order characters: only the valid ordered subset applies.
		p.set_options({ testaments: "ao" });
		expect(console.warn).toHaveBeenCalledTimes(1);
		expect(p.options.testaments).toEqual("a");

		// Entirely invalid input doesn't change the setting.
		p.set_options({ testaments: "x" });
		expect(console.warn).toHaveBeenCalledTimes(2);
		expect(p.options.testaments).toEqual("a");

		// Valid values don't warn.
		p.set_options({ testaments: "na" });
		expect(console.warn).toHaveBeenCalledTimes(2);
		expect(p.options.testaments).toEqual("na");
	});

	it("does not warn on invalid testaments values when warn_level is none", () => {
		const p = new bcv_parser(lang);
		spyOn(console, "warn");

		p.set_options({ testaments: "ao" });

		expect(console.warn).not.toHaveBeenCalled();
		expect(p.options.testaments).toEqual("a");
	});
});

"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("bcv_translations_manager auto coverage", () => {
	it("throws when trying to redefine built-in translation aliases", () => {
		const p = new bcv_parser(lang);
		expect(() => p.add_translations({ translations: [{ text: "default" }] })).toThrowError(/Can't redefine `default` as a translation/);
		expect(() => p.add_translations({ translations: [{ text: "current" }] })).toThrowError(/Can't redefine `current` as a translation/);
	});

	it("warns on duplicate translation aliases when warn_level is warn", () => {
		const p = new bcv_parser(lang);
		p.add_translations({ translations: [{ text: "T1" }] });
		p.set_options({ warn_level: "warn" });
		const warn_spy = spyOn(console, "warn");

		p.add_translations({ translations: [{ text: "T1" }] });

		expect(warn_spy).toHaveBeenCalled();
		const first_warning = warn_spy.calls.first().args[0];
		expect(first_warning).toContain("already exists");
	});
});

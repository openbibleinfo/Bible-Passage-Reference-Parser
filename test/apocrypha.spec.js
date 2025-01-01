"use strict";
import { bcv_parser } from "../es/bcv_parser.js";
import * as lang from "../es/lang/en.js";

describe("Apocrypha parsing", () => {
	let p;
	p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.options.osis_compaction_strategy = "b";
		p.options.sequence_combination_strategy = "combine";
	});
	it("should round-trip OSIS Apocrypha references", () => {
		p.set_options({
			osis_compaction_strategy: "bc",
			ps151_strategy: "b"
		});
		p.include_apocrypha(true);
		const books = ["Tob", "Jdt", "GkEsth", "Wis", "Sir", "Bar", "PrAzar", "Sus", "Bel", "SgThree", "EpJer", "1Macc", "2Macc", "3Macc", "4Macc", "1Esd", "2Esd", "PrMan", "Ps151"];
		for (const book of books) {
			const bc = book + ".1";
			const bcv = bc + ".1";
			const bcv_range = bcv + "-" + bc + ".2";
			expect(p.parse(bc).osis()).toEqual(bc);
			expect(p.parse(bcv).osis()).toEqual(bcv);
			expect(p.parse(bcv_range).osis()).toEqual(bcv_range);
		}
		p.set_options({
			ps151_strategy: "c"
		});
		expect(p.parse("Ps151.1").osis()).toEqual("Ps.151");
		expect(p.parse("Ps151.1.1").osis()).toEqual("Ps.151.1");
		expect(p.parse("Ps151.1-Ps151.2").osis()).toEqual("Ps.151.1-Ps.151.2");
		p.include_apocrypha(false);
		for (const book of books) {
			const bc = book + ".1";
			expect(p.parse(bc).osis()).toEqual("");
		}
	});
	it("should not die when turning off the Apocrypha between `parse()` and output", () => {
		p.include_apocrypha(true);
		p.parse("Epistle of Jeremiah 3 NRSV");
		expect(p.osis_and_indices()).toEqual([
			{
				osis: "EpJer.1.3",
				translations: ["NRSV"],
				indices: [0, 26]
			}
		]);
		p.set_options({ testaments: "on" });
		expect(p.osis_and_indices()).toEqual([
			{
				osis: "EpJer.1.3",
				translations: ["NRSV"],
				indices: [0, 26]
			}
		]);
		p.include_apocrypha(true);
		expect(p.osis_and_indices()).toEqual([
			{
				osis: "EpJer.1.3",
				translations: ["NRSV"],
				indices: [0, 26]
			}
		]);
		p.parse("Epistle of Jeremiah 4, Jeremiah 4 NRSV");
		expect(p.osis_and_indices()).toEqual([
			{
				osis: "EpJer.1.4,Jer.4",
				translations: ["NRSV"],
				indices: [0, 38]
			}
		]);
		p.include_apocrypha(false);
		expect(p.osis_and_indices()).toEqual([
			{
				osis: "EpJer.1.4,Jer.4",
				translations: ["NRSV"],
				indices: [0, 38]
			}
		]);
		p.include_apocrypha(true);
		expect(p.osis_and_indices()).toEqual([
			{
				osis: "EpJer.1.4,Jer.4",
				translations: ["NRSV"],
				indices: [0, 38]
			}
		]);
		p.include_apocrypha(false);
	});
	it("should handle Apocrypha ranges", () => {
		p.include_apocrypha(true);
		expect(p.parse("Rev 21-Tobit 3").osis()).toEqual("Rev.21-Tob.3");
		p.include_apocrypha(false);
	});
	it("should handle `pre_book` ranges in the Apocrypha", () => {
		p.set_options({
			book_alone_strategy: "full",
			book_range_strategy: "include",
			testaments: "ona"
		});
		expect(p.parse("1-3 Macc").osis_and_indices()).toEqual([
			{
				osis: "1Macc-3Macc",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("1 and 4 Macc").osis_and_indices()).toEqual([
			{
				osis: "4Macc",
				translations: [""],
				indices: [6, 12]
			}
		]);
		expect(p.parse("2 and 3 Macc").osis_and_indices()).toEqual([
			{
				osis: "2Macc-3Macc",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("2 and 4 Macc").osis_and_indices()).toEqual([
			{
				osis: "4Macc",
				translations: [""],
				indices: [6, 12]
			}
		]);
		expect(p.parse("1-4 Macc").osis_and_indices()).toEqual([
			{
				osis: "1Macc-4Macc",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("2-4 Macc").osis_and_indices()).toEqual([
			{
				osis: "2Macc-4Macc",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("3-3 Macc").osis_and_indices()).toEqual([
			{
				osis: "3Macc",
				translations: [""],
				indices: [2, 8]
			}
		]);
		expect(p.parse("3-4 Macc").osis_and_indices()).toEqual([
			{
				osis: "3Macc-4Macc",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("3 and 4 Macc").osis_and_indices()).toEqual([
			{
				osis: "3Macc-4Macc",
				translations: [""],
				indices: [0, 12]
			}
		]);
	});
	it("should handle Psalm 151 with the Apocrypha enabled and `ps151_strategy` = `b`", () => {
		p.set_options({
			osis_compaction_strategy: "bc",
			testaments: "ona",
			ps151_strategy: "b"
		});
		const tests = [
			["Ps 149, 151, 2", "Ps.149,Ps151.1,Ps.2"],
			["Ps 150, 151, 2", "Ps.150,Ps151.1,Ps.2"],
			["Ps 151", "Ps151.1"],
			["Ps 151:2", "Ps151.1.2"],
			["Ps 151 title", "Ps151.1.1"],
			["151st Psalm", "Ps151.1"],
			["151st Psalm, verse 2", "Ps151.1.2"],
			["Ps 119-150, 151, 2", "Ps.119-Ps.150,Ps151.1,Ps.2"],
			["Ps 151:2,3", "Ps151.1.2-Ps151.1.3"],
			["Ps 151:2,4", "Ps151.1.2,Ps151.1.4"],
			["Ps 151:2-4", "Ps151.1.2-Ps151.1.4"],
			["Ps 151, 2", "Ps151.1,Ps.2"],
			["Ps 119, 151:2, 3", "Ps.119,Ps151.1.2-Ps151.1.3"],
			["Ps 119, 151:2, 4", "Ps.119,Ps151.1.2,Ps151.1.4"],
			["Ps 119, 151 title, 3", "Ps.119,Ps151.1.1,Ps151.1.3"],
			["Job 3-Pr 3", "Job.3-Prov.3"],
			["Ps 119-151 title", "Ps.119-Ps.150,Ps151.1.1"],
			["Ps 149ff", "Ps.149-Ps.150,Ps151.1"],
			["chapters 140 to 151 from Psalms", "Ps.140-Ps.150,Ps151.1"],
			["Ps 149:2-151:3", "Ps.149.2-Ps.150.6,Ps151.1.1-Ps151.1.3"],
			["Ps 149-151", "Ps.149-Ps.150,Ps151.1"],
			["Ps 151-Proverbs 3", "Ps151.1,Prov.1-Prov.3"],
			["Ps 151:2-Proverbs 3:3", "Ps151.1.2-Ps151.1.7,Prov.1.1-Prov.3.3"],
			["Ps 150:5-151:2", "Ps.150.5-Ps.150.6,Ps151.1.1-Ps151.1.2"],
			["Ps 150:6-151:2", "Ps.150.6,Ps151.1.1-Ps151.1.2"],
			["Ps 150-151", "Ps.150,Ps151.1"],
			["Ps 150, 151", "Ps.150,Ps151.1"],
			["Ps 149-Psalm 151", "Ps.149-Ps.150,Ps151.1"],
			["1 Maccabees 3 through Ps 151, 151:3", "1Macc.3,Ps151.1,Ps151.1.3"],
			["Job 3-Ps 151", "Job.3-Ps.150,Ps151.1"],
			["Prov 3-Ps 151", "Prov.3,Ps151.1"],
			["Ps151.1", "Ps151.1"],
			["Ps151.1.3", "Ps151.1.3"],
			["Ps151.1.3-Ps151.1.4", "Ps151.1.3-Ps151.1.4"],
			["Ps151.1.3-4", "Ps151.1.3-Ps151.1.4"],
			["Ps151", "Ps151.1"],
			["Ps151.1, 3-4", "Ps151.1,Ps.3-Ps.4"],
			["Ps151, 2:3-4", "Ps151.1,Ps.2.3-Ps.2.4"],
			["Ps150. 6:3-4", "Ps.150.6,Ps.150.3-Ps.150.4"],
			["Ps151. 6:3-4", "Ps151.1.6,Ps151.1.3-Ps151.1.4"],
			["Ps151.1 verse 3-4", "Ps151.1.3-Ps151.1.4"],
			["Ps151.1:3-4", "Ps151.1.3-Ps151.1.4"],
			["Ps151.1 title", "Ps151.1.1"],
			["Ps151.1 title-3", "Ps151.1.1-Ps151.1.3"],
			["Ps151.1 2", "Ps151.1.2"],
			["Ps151.1 2-3", "Ps151.1.2-Ps151.1.3"],
			["Ps150.2-Ps151.1.3", "Ps.150.2-Ps.150.6,Ps151.1.1-Ps151.1.3"],
			["Ps150.2-Ps151.1", "Ps.150.2-Ps.150.6,Ps151.1"],
			["Ps150.2-Ps151", "Ps.150.2-Ps.150.6,Ps151.1"],
			["ps151.1.3-ps151.1.4", "Ps151.1.1,Ps151.1.3,Ps151.1.1,Ps151.1.4"],
			["ps151.1", "Ps151.1.1"],
			["psalms-39-789", "Ps.39-Ps.150,Ps151.1"]
		];
		for (const [input, output] of tests) {
			expect(p.parse(input).osis()).toEqual(output);
		}
		for (const [input, output] of tests) {
			expect(p.parse(input + " (KJV)").osis()).toEqual(output);
		}
		expect(p.parse("Ps 150 (151)").osis_and_indices()).toEqual([
			{
				osis: "Ps.150,Ps151.1",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Ps 150 (151) (KJV)").osis_and_indices()).toEqual([
			{
				osis: "Ps.150,Ps151.1",
				translations: ["KJV"],
				indices: [0, 18]
			}
		]);
	});
	it("should handle Psalm 151 with the Apocrypha enabled and `ps151_strategy` = `c` (the default)", () => {
		p.set_options({
			osis_compaction_strategy: "bc",
			testaments: "ona",
			ps151_strategy: "c"
		});
		const tests = [
			["Ps 149, 151, 2", "Ps.149,Ps.151,Ps.2"],
			["Ps 150, 151, 2", "Ps.150-Ps.151,Ps.2"],
			["Ps 151", "Ps.151"],
			["Ps 151:2", "Ps.151.2"],
			["Ps 151 title", "Ps.151.1"],
			["151st Psalm", "Ps.151"],
			["151st Psalm, verse 2", "Ps.151.2"],
			["Ps 119-150, 151, 2", "Ps.119-Ps.151,Ps.2"],
			["Ps 151:2,3", "Ps.151.2-Ps.151.3"],
			["Ps 151:2,4", "Ps.151.2,Ps.151.4"],
			["Ps 151:2-4", "Ps.151.2-Ps.151.4"],
			["Ps 151, 2", "Ps.151,Ps.2"],
			["Ps 119, 151:2, 3", "Ps.119,Ps.151.2-Ps.151.3"],
			["Ps 119, 151:2, 4", "Ps.119,Ps.151.2,Ps.151.4"],
			["Ps 119, 151 title, 3", "Ps.119,Ps.151.1,Ps.151.3"],
			["Job 3-Pr 3", "Job.3-Prov.3"],
			["Ps 119-151 title", "Ps.119.1-Ps.151.1"],
			["Ps 149ff", "Ps.149-Ps.151"],
			["chapters 140 to 151 from Psalms", "Ps.140-Ps.151"],
			["Ps 149:2-151:3", "Ps.149.2-Ps.151.3"],
			["Ps 149-151", "Ps.149-Ps.151"],
			["Ps 151-Proverbs 3", "Ps.151-Prov.3"],
			["Ps 151:2-Proverbs 3:3", "Ps.151.2-Prov.3.3"],
			["Ps 150:5-151:2", "Ps.150.5-Ps.151.2"],
			["Ps 150:6-151:2", "Ps.150.6-Ps.151.2"],
			["Ps 150-151", "Ps.150-Ps.151"],
			["Ps 150, 151", "Ps.150-Ps.151"],
			["Ps 149-Psalm 151", "Ps.149-Ps.151"],
			["1 Maccabees 3 through Ps 151, 151:3", "1Macc.3,Ps.151,Ps.151.3"],
			["Job 3-Ps 151", "Job.3-Ps.151"],
			["Prov 3-Ps 151", "Prov.3,Ps.151"],
			["Ps151.1", "Ps.151"],
			["Ps151.1.3", "Ps.151.3"],
			["Ps151.1.3-Ps151.1.4", "Ps.151.3-Ps.151.4"],
			["Ps151.1.3-4", "Ps.151.3-Ps.151.4"],
			["Ps151", "Ps.151"],
			["Ps151.1, 3-4", "Ps.151,Ps.3-Ps.4"],
			["Ps151, 2:3-4", "Ps.151,Ps.2.3-Ps.2.4"],
			["Ps150. 6:3-4", "Ps.150.6,Ps.150.3-Ps.150.4"],
			["Ps151. 6:3-4", "Ps.151.6,Ps.151.3-Ps.151.4"],
			["Ps151.1 verse 3-4", "Ps.151.3-Ps.151.4"],
			["Ps151.1:3-4", "Ps.151.3-Ps.151.4"],
			["Ps151.1 title", "Ps.151.1"],
			["Ps151.1 title-3", "Ps.151.1-Ps.151.3"],
			["Ps151.1 2", "Ps.151.2"],
			["Ps151.1 2-3", "Ps.151.2-Ps.151.3"],
			["Ps150.2-Ps151.1.3", "Ps.150.2-Ps.151.3"],
			["Ps150.2-Ps151.1", "Ps.150.2-Ps.151.7"],
			["Ps150.2-Ps151", "Ps.150.2-Ps.151.7"],
			["ps151.1.3-ps151.1.4", "Ps.151.1,Ps.151.3,Ps.151.1,Ps.151.4"],
			["ps151.1", "Ps.151.1"],
			["psalms-39-789", "Ps.39-Ps.151"]
		];
		for (const [input, output] of tests) {
			expect(p.parse(input).osis()).toEqual(output);
		}
		for (const [input, output] of tests) {
			expect(p.parse(input + " (KJV)").osis()).toEqual(output);
		}
		expect(p.parse("Ps 150 (151)").osis_and_indices()).toEqual([
			{
				osis: "Ps.150-Ps.151",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Ps 150 (151) (KJV)").osis_and_indices()).toEqual([
			{
				osis: "Ps.150-Ps.151",
				translations: ["KJV"],
				indices: [0, 18]
			}
		]);
	});
	it("should handle Psalm 151 with the Apocrypha disabled (the default)", () => {
		p.set_options({
			osis_compaction_strategy: "bc",
			testaments: "on"
		});
		const tests = [
			["Ps 149, 151, 2", "Ps.149,Ps.2"],
			["Ps 150, 151, 2", "Ps.150,Ps.2"],
			["Ps 151", ""],
			["Ps 151:2", ""],
			["Ps 151 title", ""],
			["151st Psalm", ""],
			["151st Psalm, verse 2", ""],
			["Ps 119-150, 151, 2", "Ps.119-Ps.150,Ps.2"],
			["Ps 151:2,3", ""],
			["Ps 151:2,4", ""],
			["Ps 151:2-4", ""],
			["Ps 119, 151:2, 3", "Ps.119"],
			["Ps 119, 151:2, 4", "Ps.119"],
			["Ps 119, 151 title, 3", "Ps.119"],
			["Job 3-Pr 3", "Job.3-Prov.3"],
			["Ps 119-151 title", "Ps.119-Ps.150"],
			["Ps 149ff", "Ps.149-Ps.150"],
			["chapters 140 to 151 from Psalms", "Ps.140-Ps.150"],
			["Ps 149:2-151:3", "Ps.149.2-Ps.150.6"],
			["Ps 149-151", "Ps.149-Ps.150"],
			["Ps 151-Proverbs 3", "Prov.3"],
			["Ps 151:2-Proverbs 3:3", "Prov.3.3"],
			["Ps 150:5-151:2", "Ps.150.5-Ps.150.6"],
			["Ps 150:6-151:2", "Ps.150.6"],
			["Ps 150-151", "Ps.150"],
			["Ps 150, 151", "Ps.150"],
			["Ps 149-Psalm 151", "Ps.149-Ps.150"],
			["1 Maccabees 3 through Ps 151, 151:3", ""],
			["Job 3-Ps 151", "Job.3-Ps.150"],
			["Prov 3-Ps 151", "Prov.3"],
			["Ps151.1", ""],
			["Ps151.1.3", ""],
			["Ps151.1.3-Ps151.1.4", ""],
			["Ps151.1.3-4", ""],
			["Ps151", ""],
			["Ps151.1, 3-4", ""],
			["Ps151, 2:3-4", "Ps.2.3-Ps.2.4"],
			["Ps150. 6:3-4", "Ps.150.6,Ps.150.3-Ps.150.4"],
			["Ps151. 6:3-4", ""],
			["Ps151.1 verse 3-4", ""],
			["Ps151.1:3-4", ""],
			["Ps151.1 title", ""],
			["Ps151.1 title-3", ""],
			["Ps151.1 2", ""],
			["Ps151.1 2-3", ""],
			["Ps150.2-Ps151.1.3", "Ps.150.2-Ps.150.6"],
			["Ps150.2-Ps151.1", "Ps.150.2-Ps.150.6"],
			["Ps150.2-Ps151", "Ps.150.2-Ps.150.6"],
			["psalms-39-789", "Ps.39-Ps.150"],
			["ps151.1.3-ps151.1.4", ""],
			["ps151.1", ""]
		];
		for (const [input, output] of tests) {
			expect(p.parse(input).osis()).toEqual(output);
		}
		for (const [input, output] of tests) {
			expect(p.parse(input + " (KJV)").osis()).toEqual(output);
		}
		expect(p.parse("Ps 150 (151)").osis_and_indices()).toEqual([
			{
				osis: "Ps.150",
				translations: [""],
				indices: [0, 6]
			}
		]);
		expect(p.parse("Ps 151, 2").osis_and_indices()).toEqual([
			{
				osis: "Ps.2",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Ps 150 (151) (KJV)").osis_and_indices()).toEqual([
			{
				osis: "Ps.150",
				translations: ["KJV"],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Ps 151, 2 (KJV)").osis_and_indices()).toEqual([
			{
				osis: "Ps.2",
				translations: ["KJV"],
				indices: [0, 15]
			}
		]);
	});
	it("should let the `testaments` option take precedence over `include_apocrypha()`", () => {
		p.set_options({
			testaments: "ona",
			include_apocrypha: false // conflict here
		});
		expect(p.parse("Tobit 1").osis()).toEqual("Tob.1");
		expect(p.parse("Psalm 1").osis()).toEqual("Ps.1");
		expect(p.parse("Psalm 151").osis()).toEqual("Ps.151");
		p.set_options({ ps151_strategy: "b"});
		expect(p.parse("Psalm 151").osis()).toEqual("Ps151");
		p.set_options({
			testaments: "ona",
			ps151_strategy: "c",
			include_apocrypha: true
		});
		expect(p.parse("Tobit 1").osis()).toEqual("Tob.1");
		expect(p.parse("Psalm 1").osis()).toEqual("Ps.1");
		expect(p.parse("Psalm 151").osis()).toEqual("Ps.151");
		p.set_options({ ps151_strategy: "b"});
		expect(p.parse("Psalm 151").osis()).toEqual("Ps151");
		p.set_options({
			testaments: "on",
			ps151_strategy: "c",
			include_apocrypha: false
		});
		expect(p.parse("Tobit 1").osis()).toEqual("");
		expect(p.parse("Psalm 1").osis()).toEqual("Ps.1");
		expect(p.parse("Psalm 151").osis()).toEqual("");
		p.set_options({ ps151_strategy: "b"});
		expect(p.parse("Psalm 151").osis()).toEqual("");
		p.set_options({
			testaments: "on",
			ps151_strategy: "c",
			include_apocrypha: true // conflict here
		});
		expect(p.parse("Tobit 1").osis()).toEqual("");
		expect(p.parse("Psalm 1").osis()).toEqual("Ps.1");
		expect(p.parse("Psalm 151").osis()).toEqual("");
		p.set_options({ ps151_strategy: "b"});
		expect(p.parse("Psalm 151").osis()).toEqual("");
	});
});

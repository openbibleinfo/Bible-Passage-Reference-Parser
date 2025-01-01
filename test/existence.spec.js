"use strict";
import { bcv_parser } from "../es/bcv_parser.js";
import * as lang from "../es/lang/en.js";

describe("Passage existence strategies", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			osis_compaction_strategy: "bc"
		});
	});

	function check_strategies(strategies) {
		for (const strategy of ["b", "bc", "bcv", "bv", "c", "cv", "v", "none"]) {
			if (strategies[strategy] == null) {
				continue;
			}
			p.set_options({"passage_existence_strategy": strategy});
			for (let i = 0, length = strategies.strings.length; i < length; i++) {
				const input = strategies.strings[i];
				const output = strategies[strategy][i];
				expect(p.parse(input).osis()).toEqual(output);
			}
		}
	}

	it("should handle reversed ranges", () => {
		const strategies = {
			strings: ["Exodus 4 to Genesis 2", "Exodus 8 to Genesis 2:7", "Exodus 7:7 to Genesis 2", "Exodus 5:5 to Genesis 2:6", "Mark 2-Matthew 11ff"],
			b: ["Exod.4,Gen.2", "Exod.8,Gen.2.7", "Exod.7.7,Gen.2", "Exod.5.5,Gen.2.6", "Mark.2,Matt.11-Matt.999"],
			bc: ["Exod.4,Gen.2", "Exod.8,Gen.2.7", "Exod.7.7,Gen.2", "Exod.5.5,Gen.2.6", "Mark.2,Matt.11-Matt.28"],
			bcv: ["Exod.4,Gen.2", "Exod.8,Gen.2.7", "Exod.7.7,Gen.2", "Exod.5.5,Gen.2.6", "Mark.2,Matt.11-Matt.28"],
			bv: ["Exod.4,Gen.2", "Exod.8,Gen.2.7", "Exod.7.7,Gen.2", "Exod.5.5,Gen.2.6", "Mark.2,Matt.11-Matt.999"],
			c: ["Exod.4-Gen.2", "Exod.8.1-Gen.2.7", "Exod.7.7-Gen.2.999", "Exod.5.5-Gen.2.6", "Mark.2-Matt.28"],
			cv: ["Exod.4-Gen.2", "Exod.8.1-Gen.2.7", "Exod.7.7-Gen.2.25", "Exod.5.5-Gen.2.6", "Mark.2-Matt.28"],
			v: ["Exod.4-Gen.2", "Exod.8.1-Gen.2.7", "Exod.7.7-Gen.2.25", "Exod.5.5-Gen.2.6", "Mark.2-Matt.999"],
			none: ["Exod.4-Gen.2", "Exod.8.1-Gen.2.7", "Exod.7.7-Gen.2.999", "Exod.5.5-Gen.2.6", "Mark.2-Matt.999"]
		};
		check_strategies(strategies);
	});
	it("should handle start verses not existing", () => {
		const strategies = {
			strings: ["Genesis 52", "Genesis 52:3", "Genesis 51-Exodus 5", "Genesis 51-Exodus 5:9", "Genesis 51:2-Exodus 3", "Genesis 51:2-Exodus 3:3"],
			b: ["Gen.52", "Gen.52.3", "Gen.51-Exod.5", "Gen.51.1-Exod.5.9", "Gen.51.2-Exod.3.999", "Gen.51.2-Exod.3.3"],
			bc: ["", "", "Exod.5", "Exod.5.9", "Exod.3", "Exod.3.3"],
			bcv: ["", "", "Exod.5", "Exod.5.9", "Exod.3", "Exod.3.3"],
			bv: ["Gen.52", "Gen.52.3", "Gen.51-Exod.5", "Gen.51.1-Exod.5.9", "Gen.51.2-Exod.3.22", "Gen.51.2-Exod.3.3"],
			c: ["", "", "Exod.5", "Exod.5.9", "Exod.3", "Exod.3.3"],
			cv: ["", "", "Exod.5", "Exod.5.9", "Exod.3", "Exod.3.3"],
			v: ["Gen.52", "Gen.52.3", "Gen.51-Exod.5", "Gen.51.1-Exod.5.9", "Gen.51.2-Exod.3.22", "Gen.51.2-Exod.3.3"],
			none: ["Gen.52", "Gen.52.3", "Gen.51-Exod.5", "Gen.51.1-Exod.5.9", "Gen.51.2-Exod.3.999", "Gen.51.2-Exod.3.3"]
		};
		check_strategies(strategies);
	});
	it("should handle end verses not existing", () => {
		p.set_options({
			end_range_digits_strategy: "sequence"
		});
		const strategies = {
			strings: ["Genesis 49-52", "Genesis 49-76", "Genesis 49-52:7", "Genesis 49:2-chapter 52", "Genesis 49:2-51:3"],
			b: ["Gen.49-Gen.52", "Gen.49-Gen.76", "Gen.49.1-Gen.52.7", "Gen.49.2-Gen.52.999", "Gen.49.2-Gen.51.3"],
			bc: ["Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49.2-Gen.50.999", "Gen.49.2-Gen.50.999"],
			bcv: ["Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49.2-Gen.50.26", "Gen.49.2-Gen.50.26"],
			bv: ["Gen.49-Gen.52", "Gen.49-Gen.76", "Gen.49.1-Gen.52.7", "Gen.49.2-Gen.52.999", "Gen.49.2-Gen.51.3"],
			c: ["Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49.2-Gen.50.999", "Gen.49.2-Gen.50.999"],
			cv: ["Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49-Gen.50", "Gen.49.2-Gen.50.26", "Gen.49.2-Gen.50.26"],
			v: ["Gen.49-Gen.52", "Gen.49-Gen.76", "Gen.49.1-Gen.52.7", "Gen.49.2-Gen.52.999", "Gen.49.2-Gen.51.3"],
			none: ["Gen.49-Gen.52", "Gen.49-Gen.76", "Gen.49.1-Gen.52.7", "Gen.49.2-Gen.52.999", "Gen.49.2-Gen.51.3"]
		};
		check_strategies(strategies);
	});
	it("should handle both start and end verses not existing", () => {
		const strategies = {
			strings: ["Genesis 51-52", "Genesis 51-52:4", "Genesis 51:2-chapter 52", "Genesis 51:2-52:3", "Genesis 51:2-Exodus 41", "Genesis 51:2-Exodus 41:4", "Genesis 51-Exodus 41", "Genesis 51-Exodus 41:5"],
			b: ["Gen.51-Gen.52", "Gen.51.1-Gen.52.4", "Gen.51.2-Gen.52.999", "Gen.51.2-Gen.52.3", "Gen.51.2-Exod.41.999", "Gen.51.2-Exod.41.4", "Gen.51-Exod.41", "Gen.51.1-Exod.41.5"],
			bc: ["", "", "", "", "", "", "", ""],
			bcv: ["", "", "", "", "", "", "", ""],
			bv: ["Gen.51-Gen.52", "Gen.51.1-Gen.52.4", "Gen.51.2-Gen.52.999", "Gen.51.2-Gen.52.3", "Gen.51.2-Exod.41.999", "Gen.51.2-Exod.41.4", "Gen.51-Exod.41", "Gen.51.1-Exod.41.5"],
			c: ["", "", "", "", "", "", "", ""],
			cv: ["", "", "", "", "", "", "", ""],
			v: ["Gen.51-Gen.52", "Gen.51.1-Gen.52.4", "Gen.51.2-Gen.52.999", "Gen.51.2-Gen.52.3", "Gen.51.2-Exod.41.999", "Gen.51.2-Exod.41.4", "Gen.51-Exod.41", "Gen.51.1-Exod.41.5"],
			none: ["Gen.51-Gen.52", "Gen.51.1-Gen.52.4", "Gen.51.2-Gen.52.999", "Gen.51.2-Gen.52.3", "Gen.51.2-Exod.41.999", "Gen.51.2-Exod.41.4", "Gen.51-Exod.41", "Gen.51.1-Exod.41.5"]
		};
		check_strategies(strategies);
	});
	it("should handle zero verses with a `zero_verse_strategy: error`", () => {
		p.set_options({
			zero_verse_strategy: "error"
		});
		const strategies = {
			strings: ["Exodus 6 to Genesis 2:0", "Exodus 6:5 to Genesis 2:0", "Exodus 6:0 to Genesis 2:0", "Genesis 52:0", "Genesis 49-Exodus 5:0", "Genesis 49-Exodus 41:0", "Genesis 49:3-Exodus 5:0", "Genesis 51-Exodus 5:0", "Genesis 51:0-Exodus 10", "Genesis 51:0-Exodus 3:6", "Genesis 51:2-Exodus 3:0", "Genesis 51:0-Exodus 41:0"],
			b: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "Gen.51", "Exod.10", "Exod.3.6", "Gen.51.2", ""],
			bc: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "", "Exod.10", "Exod.3.6", "", ""],
			bcv: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "", "Exod.10", "Exod.3.6", "", ""],
			bv: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "Gen.51", "Exod.10", "Exod.3.6", "Gen.51.2", ""],
			c: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "", "Exod.10", "Exod.3.6", "", ""],
			cv: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "", "Exod.10", "Exod.3.6", "", ""],
			v: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "Gen.51", "Exod.10", "Exod.3.6", "Gen.51.2", ""],
			none: ["Exod.6", "Exod.6.5", "", "", "Gen.49", "Gen.49", "Gen.49.3", "Gen.51", "Exod.10", "Exod.3.6", "Gen.51.2", ""]
		};
		check_strategies(strategies);
	});
	it("should handle zero verses with a `zero_verse_strategy: upgrade`", () => {
		p.set_options({
			zero_verse_strategy: "upgrade"
		});
		const strategies = {
			strings: ["Exodus 7 to Genesis 2:0", "Exodus 6:5 to Genesis 2:0", "Exodus 6:0 to Genesis 2:0", "Genesis 52:0", "Genesis 49-Exodus 5:0", "Genesis 49-Exodus 41:0", "Genesis 49:3-Exodus 5:0", "Genesis 51-Exodus 5:0", "Genesis 51:0-Exodus 10", "Genesis 51:0-Exodus 3:6", "Genesis 51:2-Exodus 3:0", "Genesis 51:0-Exodus 41:0"],
			b: ["Exod.7,Gen.2.1", "Exod.6.5,Gen.2.1", "Exod.6.1,Gen.2.1", "Gen.52.1", "Gen.49.1-Exod.5.1", "Gen.49.1-Exod.41.1", "Gen.49.3-Exod.5.1", "Gen.51.1-Exod.5.1", "Gen.51-Exod.10", "Gen.51.1-Exod.3.6", "Gen.51.2-Exod.3.1", "Gen.51.1-Exod.41.1"],
			bc: ["Exod.7,Gen.2.1", "Exod.6.5,Gen.2.1", "Exod.6.1,Gen.2.1", "", "Gen.49.1-Exod.5.1", "Gen.49-Exod.40", "Gen.49.3-Exod.5.1", "Exod.5.1", "Exod.10", "Exod.3.6", "Exod.3.1", ""],
			bcv: ["Exod.7,Gen.2.1", "Exod.6.5,Gen.2.1", "Exod.6.1,Gen.2.1", "", "Gen.49.1-Exod.5.1", "Gen.49-Exod.40", "Gen.49.3-Exod.5.1", "Exod.5.1", "Exod.10", "Exod.3.6", "Exod.3.1", ""],
			bv: ["Exod.7,Gen.2.1", "Exod.6.5,Gen.2.1", "Exod.6.1,Gen.2.1", "Gen.52.1", "Gen.49.1-Exod.5.1", "Gen.49.1-Exod.41.1", "Gen.49.3-Exod.5.1", "Gen.51.1-Exod.5.1", "Gen.51-Exod.10", "Gen.51.1-Exod.3.6", "Gen.51.2-Exod.3.1", "Gen.51.1-Exod.41.1"],
			c: ["Exod.7.1-Gen.2.1", "Exod.6.5-Gen.2.1", "Exod.6.1-Gen.2.1", "", "Gen.49.1-Exod.5.1", "Gen.49-Exod.40", "Gen.49.3-Exod.5.1", "Exod.5.1", "Exod.10", "Exod.3.6", "Exod.3.1", ""],
			cv: ["Exod.7.1-Gen.2.1", "Exod.6.5-Gen.2.1", "Exod.6.1-Gen.2.1", "", "Gen.49.1-Exod.5.1", "Gen.49-Exod.40", "Gen.49.3-Exod.5.1", "Exod.5.1", "Exod.10", "Exod.3.6", "Exod.3.1", ""],
			v: ["Exod.7.1-Gen.2.1", "Exod.6.5-Gen.2.1", "Exod.6.1-Gen.2.1", "Gen.52.1", "Gen.49.1-Exod.5.1", "Gen.49.1-Exod.41.1", "Gen.49.3-Exod.5.1", "Gen.51.1-Exod.5.1", "Gen.51-Exod.10", "Gen.51.1-Exod.3.6", "Gen.51.2-Exod.3.1", "Gen.51.1-Exod.41.1"],
			none: ["Exod.7.1-Gen.2.1", "Exod.6.5-Gen.2.1", "Exod.6.1-Gen.2.1", "Gen.52.1", "Gen.49.1-Exod.5.1", "Gen.49.1-Exod.41.1", "Gen.49.3-Exod.5.1", "Gen.51.1-Exod.5.1", "Gen.51-Exod.10", "Gen.51.1-Exod.3.6", "Gen.51.2-Exod.3.1", "Gen.51.1-Exod.41.1"]
		};
		check_strategies(strategies);
	});
	it("should handle zero verses with a `zero_verse_strategy: allow`", () => {
		p.set_options({
			zero_verse_strategy: "allow"
		});
		const strategies = {
			strings: ["Exodus 7 to Genesis 2:0", "Exodus 6:5 to Genesis 2:0", "Exodus 6:0 to Genesis 2:0", "Genesis 52:0", "Genesis 49-Exodus 5:0", "Genesis 49-Exodus 41:0", "Genesis 49:3-Exodus 5:0", "Genesis 51-Exodus 5:0", "Genesis 51:0-Exodus 10", "Genesis 51:0-Exodus 3:6", "Genesis 51:2-Exodus 3:0", "Genesis 51:0-Exodus 41:0"],
			b: ["Exod.7,Gen.2.0", "Exod.6.5,Gen.2.0", "Exod.6.0,Gen.2.0", "Gen.52.0", "Gen.49.1-Exod.5.0", "Gen.49.1-Exod.41.0", "Gen.49.3-Exod.5.0", "Gen.51.1-Exod.5.0", "Gen.51.0-Exod.10.999", "Gen.51.0-Exod.3.6", "Gen.51.2-Exod.3.0", "Gen.51.0-Exod.41.0"],
			bc: ["Exod.7,Gen.2.0", "Exod.6.5,Gen.2.0", "Exod.6.0,Gen.2.0", "", "Gen.49.1-Exod.5.0", "Gen.49-Exod.40", "Gen.49.3-Exod.5.0", "Exod.5.0", "Exod.10", "Exod.3.6", "Exod.3.0", ""],
			bcv: ["Exod.7,Gen.2.0", "Exod.6.5,Gen.2.0", "Exod.6.0,Gen.2.0", "", "Gen.49.1-Exod.5.0", "Gen.49-Exod.40", "Gen.49.3-Exod.5.0", "Exod.5.0", "Exod.10", "Exod.3.6", "Exod.3.0", ""],
			bv: ["Exod.7,Gen.2.0", "Exod.6.5,Gen.2.0", "Exod.6.0,Gen.2.0", "Gen.52.0", "Gen.49.1-Exod.5.0", "Gen.49.1-Exod.41.0", "Gen.49.3-Exod.5.0", "Gen.51.1-Exod.5.0", "Gen.51.0-Exod.10.29", "Gen.51.0-Exod.3.6", "Gen.51.2-Exod.3.0", "Gen.51.0-Exod.41.0"],
			c: ["Exod.7.1-Gen.2.0", "Exod.6.5-Gen.2.0", "Exod.6.0-Gen.2.0", "", "Gen.49.1-Exod.5.0", "Gen.49-Exod.40", "Gen.49.3-Exod.5.0", "Exod.5.0", "Exod.10", "Exod.3.6", "Exod.3.0", ""],
			cv: ["Exod.7.1-Gen.2.0", "Exod.6.5-Gen.2.0", "Exod.6.0-Gen.2.0", "", "Gen.49.1-Exod.5.0", "Gen.49-Exod.40", "Gen.49.3-Exod.5.0", "Exod.5.0", "Exod.10", "Exod.3.6", "Exod.3.0", ""],
			v: ["Exod.7.1-Gen.2.0", "Exod.6.5-Gen.2.0", "Exod.6.0-Gen.2.0", "Gen.52.0", "Gen.49.1-Exod.5.0", "Gen.49.1-Exod.41.0", "Gen.49.3-Exod.5.0", "Gen.51.1-Exod.5.0", "Gen.51.0-Exod.10.29", "Gen.51.0-Exod.3.6", "Gen.51.2-Exod.3.0", "Gen.51.0-Exod.41.0"],
			none: ["Exod.7.1-Gen.2.0", "Exod.6.5-Gen.2.0", "Exod.6.0-Gen.2.0", "Gen.52.0", "Gen.49.1-Exod.5.0", "Gen.49.1-Exod.41.0", "Gen.49.3-Exod.5.0", "Gen.51.1-Exod.5.0", "Gen.51.0-Exod.10.999", "Gen.51.0-Exod.3.6", "Gen.51.2-Exod.3.0", "Gen.51.0-Exod.41.0"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters with a `zero_chapter_strategy: error`", () => {
		p.set_options({
			zero_chapter_strategy: "error"
		});
		const strategies = {
			strings: ["Genesis 0-12", "Genesis 0-12:2", "Genesis 0-Exodus 2", "Genesis 0-Exodus 2:3", "Genesis 0-Exodus 0", "Genesis 0-Exodus 0:5", "Genesis 49-Exodus 0", "Genesis 49-Exodus 0:4", "Genesis 49:6-Exodus 0", "Genesis 49:5-Exodus 0:6", "Genesis 51-Exodus 0", "Genesis 51-Exodus 0:7", "Genesis 51:3-Exodus 0", "Genesis 51:4-Exodus 0:4"],
			b: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "Gen.51", "Gen.51", "Gen.51.3", "Gen.51.4"],
			bc: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "", "", "", ""],
			bcv: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "", "", "", ""],
			bv: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "Gen.51", "Gen.51", "Gen.51.3", "Gen.51.4"],
			c: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "", "", "", ""],
			cv: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "", "", "", ""],
			v: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "Gen.51", "Gen.51", "Gen.51.3", "Gen.51.4"],
			none: ["Gen.12", "Gen.12.2", "Exod.2", "Exod.2.3", "", "", "Gen.49", "Gen.49", "Gen.49.6", "Gen.49.5", "Gen.51", "Gen.51", "Gen.51.3", "Gen.51.4"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters with a `zero_chapter_strategy: upgrade`", () => {
		p.set_options({
			zero_chapter_strategy: "upgrade"
		});
		const strategies = {
			strings: ["Genesis 0-12", "Genesis 0-12:2", "Genesis 0-Exodus 2", "Genesis 0-Exodus 2:3", "Genesis 0-Exodus 0", "Genesis 0-Exodus 0:5", "Genesis 49-Exodus 0", "Genesis 49-Exodus 0:4", "Genesis 49:6-Exodus 0", "Genesis 49:5-Exodus 0:6", "Genesis 51-Exodus 0", "Genesis 51-Exodus 0:7", "Genesis 51:3-Exodus 0", "Genesis 51:4-Exodus 0:4"],
			b: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.999", "Gen.49.5-Exod.1.6", "Gen.51-Exod.1", "Gen.51.1-Exod.1.7", "Gen.51.3-Exod.1.999", "Gen.51.4-Exod.1.4"],
			bc: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.999", "Gen.49.5-Exod.1.6", "Exod.1", "Exod.1.7", "Exod.1", "Exod.1.4"],
			bcv: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.22", "Gen.49.5-Exod.1.6", "Exod.1", "Exod.1.7", "Exod.1", "Exod.1.4"],
			bv: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.22", "Gen.49.5-Exod.1.6", "Gen.51-Exod.1", "Gen.51.1-Exod.1.7", "Gen.51.3-Exod.1.22", "Gen.51.4-Exod.1.4"],
			c: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.999", "Gen.49.5-Exod.1.6", "Exod.1", "Exod.1.7", "Exod.1", "Exod.1.4"],
			cv: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.22", "Gen.49.5-Exod.1.6", "Exod.1", "Exod.1.7", "Exod.1", "Exod.1.4"],
			v: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.22", "Gen.49.5-Exod.1.6", "Gen.51-Exod.1", "Gen.51.1-Exod.1.7", "Gen.51.3-Exod.1.22", "Gen.51.4-Exod.1.4"],
			none: ["Gen.1-Gen.12", "Gen.1.1-Gen.12.2", "Gen.1-Exod.2", "Gen.1.1-Exod.2.3", "Gen.1-Exod.1", "Gen.1.1-Exod.1.5", "Gen.49-Exod.1", "Gen.49.1-Exod.1.4", "Gen.49.6-Exod.1.999", "Gen.49.5-Exod.1.6", "Gen.51-Exod.1", "Gen.51.1-Exod.1.7", "Gen.51.3-Exod.1.999", "Gen.51.4-Exod.1.4"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters and verses with a `zero_chapter_strategy: error` and `zero_verse_strategy: error`", () => {
		p.set_options({
			zero_chapter_strategy: "error",
			zero_verse_strategy: "error"
		});
		const strategies = {
			strings: ["Genesis 0-Exodus 0:0", "Genesis 0:0-Exodus 0", "Genesis 0:0-14", "Genesis 0:0-chapter 14", "Genesis 0:0-Exodus 3", "Genesis 0:0-Exodus 3:0", "Genesis 0:0-Exodus 3:2", "Genesis 0:0-Exodus 0:0", "Genesis 47-Exodus 0:0", "Genesis 48:0-Exodus 0:0", "Genesis 49:6-Exodus 0:0", "Genesis 51-Exodus 0:0", "Genesis 51:0-Exodus 0:0", "Genesis 52:5-Exodus 0:0"],
			b: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"],
			bc: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			bcv: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			bv: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"],
			c: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			cv: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			v: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"],
			none: ["", "", "", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters and verses with a `zero_chapter_strategy: error` and `zero_verse_strategy: allow`", () => {
		p.set_options({
			zero_chapter_strategy: "error",
			zero_verse_strategy: "allow"
		});
		const strategies = {
			strings: ["Genesis 0-Exodus 0:0", "Genesis 0:0-Exodus 0", "Genesis 0:0-14", "Genesis 0:0-chapter 14", "Genesis 0:0-Exodus 3", "Genesis 0:0-Exodus 3:0", "Genesis 0:0-Exodus 3:2", "Genesis 0:0-Exodus 0:0", "Genesis 47-Exodus 0:0", "Genesis 48:0-Exodus 0:0", "Genesis 49:6-Exodus 0:0", "Genesis 51-Exodus 0:0", "Genesis 51:0-Exodus 0:0", "Genesis 52:5-Exodus 0:0"],
			b: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "Gen.51", "Gen.51.0", "Gen.52.5"],
			bc: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "", "", ""],
			bcv: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "", "", ""],
			bv: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "Gen.51", "Gen.51.0", "Gen.52.5"],
			c: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "", "", ""],
			cv: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "", "", ""],
			v: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "Gen.51", "Gen.51.0", "Gen.52.5"],
			none: ["", "", "", "Gen.14", "Exod.3", "Exod.3.0", "Exod.3.2", "", "Gen.47", "Gen.48.0", "Gen.49.6", "Gen.51", "Gen.51.0", "Gen.52.5"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters and verses with a `zero_chapter_strategy: error` and `zero_verse_strategy: upgrade`", () => {
		p.set_options({
			zero_chapter_strategy: "error",
			zero_verse_strategy: "upgrade"
		});
		const strategies = {
			strings: ["Genesis 0-Exodus 0:0", "Genesis 0:0-Exodus 0", "Genesis 0:0-14", "Genesis 0:0-chapter 14", "Genesis 0:0-Exodus 3", "Genesis 0:0-Exodus 3:0", "Genesis 0:0-Exodus 3:2", "Genesis 0:0-Exodus 0:0", "Genesis 47-Exodus 0:0", "Genesis 48:0-Exodus 0:0", "Genesis 49:6-Exodus 0:0", "Genesis 51-Exodus 0:0", "Genesis 51:0-Exodus 0:0", "Genesis 52:5-Exodus 0:0"],
			b: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "Gen.51", "Gen.51.1", "Gen.52.5"],
			bc: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "", "", ""],
			bcv: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "", "", ""],
			bv: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "Gen.51", "Gen.51.1", "Gen.52.5"],
			c: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "", "", ""],
			cv: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "", "", ""],
			v: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "Gen.51", "Gen.51.1", "Gen.52.5"],
			none: ["", "", "", "Gen.14", "Exod.3", "Exod.3.1", "Exod.3.2", "", "Gen.47", "Gen.48.1", "Gen.49.6", "Gen.51", "Gen.51.1", "Gen.52.5"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters and verses with a `zero_chapter_strategy: upgrade` and `zero_verse_strategy: error`", () => {
		p.set_options({
			zero_chapter_strategy: "upgrade",
			zero_verse_strategy: "error"
		});
		p.set_options({passage_existence_strategy: "none"});
		const strategies = {
			strings: ["Genesis 0-Exodus 0:0", "Genesis 0:0-Exodus 0", "Genesis 0:0-14", "Genesis 0:0-chapter 14", "Genesis 0:0-Exodus 3", "Genesis 0:0-Exodus 3:0", "Genesis 0:0-Exodus 3:2", "Genesis 0:0-Exodus 0:0", "Genesis 47-Exodus 0:0", "Genesis 48:0-Exodus 0:0", "Genesis 49:6-Exodus 0:0", "Genesis 51-Exodus 0:0", "Genesis 51:0-Exodus 0:0", "Genesis 52:5-Exodus 0:0"],
			b: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"],
			bc: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			bcv: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			bv: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"],
			c: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			cv: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "", "", ""],
			v: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"],
			none: ["Gen.1", "Exod.1", "Gen.1.14", "Gen.14", "Exod.3", "", "Exod.3.2", "", "Gen.47", "", "Gen.49.6", "Gen.51", "", "Gen.52.5"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters and verses with a `zero_chapter_strategy: upgrade` and `zero_verse_strategy: allow`", () => {
		p.set_options({
			zero_chapter_strategy: "upgrade",
			zero_verse_strategy: "allow"
		});
		const strategies = {
			strings: ["Genesis 0-Exodus 0:0", "Genesis 0:0-Exodus 0", "Genesis 0:0-14", "Genesis 0:0-chapter 14", "Genesis 0:0-Exodus 3", "Genesis 0:0-Exodus 3:0", "Genesis 0:0-Exodus 3:2", "Genesis 0:0-Exodus 0:0", "Genesis 47-Exodus 0:0", "Genesis 48:0-Exodus 0:0", "Genesis 49:6-Exodus 0:0", "Genesis 51-Exodus 0:0", "Genesis 51:0-Exodus 0:0", "Genesis 52:5-Exodus 0:0"],
			b: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.999", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.999", "Gen.1.0-Exod.3.999", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Gen.51.1-Exod.1.0", "Gen.51.0-Exod.1.0", "Gen.52.5-Exod.1.0"],
			bc: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.999", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.999", "Gen.1.0-Exod.3.999", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Exod.1.0", "Exod.1.0", "Exod.1.0"],
			bcv: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.22", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.24", "Gen.1.0-Exod.3.22", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Exod.1.0", "Exod.1.0", "Exod.1.0"],
			bv: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.22", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.24", "Gen.1.0-Exod.3.22", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Gen.51.1-Exod.1.0", "Gen.51.0-Exod.1.0", "Gen.52.5-Exod.1.0"],
			c: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.999", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.999", "Gen.1.0-Exod.3.999", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Exod.1.0", "Exod.1.0", "Exod.1.0"],
			cv: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.22", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.24", "Gen.1.0-Exod.3.22", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Exod.1.0", "Exod.1.0", "Exod.1.0"],
			v: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.22", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.24", "Gen.1.0-Exod.3.22", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Gen.51.1-Exod.1.0", "Gen.51.0-Exod.1.0", "Gen.52.5-Exod.1.0"],
			none: ["Gen.1.1-Exod.1.0", "Gen.1.0-Exod.1.999", "Gen.1.0-Gen.1.14", "Gen.1.0-Gen.14.999", "Gen.1.0-Exod.3.999", "Gen.1.0-Exod.3.0", "Gen.1.0-Exod.3.2", "Gen.1.0-Exod.1.0", "Gen.47.1-Exod.1.0", "Gen.48.0-Exod.1.0", "Gen.49.6-Exod.1.0", "Gen.51.1-Exod.1.0", "Gen.51.0-Exod.1.0", "Gen.52.5-Exod.1.0"]
		};
		check_strategies(strategies);
	});
	it("should handle zero chapters and verses with a `zero_chapter_strategy: upgrade` and `zero_verse_strategy: upgrade`", () => {
		p.set_options({
			zero_chapter_strategy: "upgrade",
			zero_verse_strategy: "upgrade"
		});
		const strategies = {
			strings: ["Genesis 0-Exodus 0:0", "Genesis 0:0-Exodus 0", "Genesis 0:0-14", "Genesis 0:0-chapter 14", "Genesis 0:0-Exodus 3", "Genesis 0:0-Exodus 3:0", "Genesis 0:0-Exodus 3:2", "Genesis 0:0-Exodus 0:0", "Genesis 47-Exodus 0:0", "Genesis 48:0-Exodus 0:0", "Genesis 49:6-Exodus 0:0", "Genesis 51-Exodus 0:0", "Genesis 51:0-Exodus 0:0", "Genesis 52:5-Exodus 0:0"],
			b: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.52.5-Exod.1.1"],
			bc: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Exod.1.1", "Exod.1.1", "Exod.1.1"],
			bcv: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Exod.1.1", "Exod.1.1", "Exod.1.1"],
			bv: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.52.5-Exod.1.1"],
			c: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Exod.1.1", "Exod.1.1", "Exod.1.1"],
			cv: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Exod.1.1", "Exod.1.1", "Exod.1.1"],
			v: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.52.5-Exod.1.1"],
			none: ["Gen.1.1-Exod.1.1", "Gen.1-Exod.1", "Gen.1.1-Gen.1.14", "Gen.1-Gen.14", "Gen.1-Exod.3", "Gen.1.1-Exod.3.1", "Gen.1.1-Exod.3.2", "Gen.1.1-Exod.1.1", "Gen.47.1-Exod.1.1", "Gen.48.1-Exod.1.1", "Gen.49.6-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.51.1-Exod.1.1", "Gen.52.5-Exod.1.1"]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: ignore`", () => {
		p.set_options({
			book_alone_strategy: "ignore"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Genesis to Obadiah", "Obadiah to Genesis", "Genesis to Revelation (KJV)"],
			b: ["", "", "", "", ""],
			bc: ["", "", "", "", ""],
			bcv: ["", "", "", "", ""],
			bv: ["", "", "", "", ""],
			c: ["", "", "", "", ""],
			cv: ["", "", "", "", ""],
			v: ["", "", "", "", ""],
			none: ["", "", "", "", ""]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: first_chapter` and `book_sequence_strategy: ignore` and `book_range_strategy: ignore`", () => {
		p.set_options({
			book_alone_strategy: "first_chapter",
			book_sequence_strategy: "ignore",
			book_range_strategy: "ignore"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["", "", "", "", ""],
			bc: ["", "", "", "", ""],
			bcv: ["", "", "", "", ""],
			bv: ["", "", "", "", ""],
			c: ["", "", "", "", ""],
			cv: ["", "", "", "", ""],
			v: ["", "", "", "", ""],
			none: ["", "", "", "", ""]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: first_chapter`, `book_sequence_strategy: ignore` and `book_range_strategy: include`", () => {
		p.set_options({
			book_alone_strategy: "first_chapter",
			book_sequence_strategy: "ignore",
			book_range_strategy: "include"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["", "Gen.1-Exod.999", "", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			bc: ["", "Gen.1-Exod.40", "", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bcv: ["", "Gen.1-Exod.40", "", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bv: ["", "Gen.1-Exod.999", "", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			c: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			cv: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			v: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			none: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: first_chapter`, `book_sequence_strategy: include` and `book_range_strategy: ignore", () => {
		p.set_options({
			book_alone_strategy: "first_chapter",
			book_sequence_strategy: "include",
			book_range_strategy: "ignore"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["Exod.1,Gen.1", "", "Obad.1,Gen.1", "", ""],
			bc: ["Exod.1,Gen.1", "", "Obad.1,Gen.1", "", ""],
			bcv: ["Exod.1,Gen.1", "", "Obad.1,Gen.1", "", ""],
			bv: ["Exod.1,Gen.1", "", "Obad.1,Gen.1", "", ""],
			c: ["", "", "", "", ""],
			cv: ["", "", "", "", ""],
			v: ["", "", "", "", ""],
			none: ["", "", "", "", ""]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: first_chapter` and `book_sequence_strategy: include` and `book_range_strategy: include", () => {
		p.set_options({
			book_alone_strategy: "first_chapter",
			book_sequence_strategy: "include",
			book_range_strategy: "include"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["Exod.1,Gen.1", "Gen.1-Exod.999", "Obad.1,Gen.1", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			bc: ["Exod.1,Gen.1", "Gen.1-Exod.40", "Obad.1,Gen.1", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bcv: ["Exod.1,Gen.1", "Gen.1-Exod.40", "Obad.1,Gen.1", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bv: ["Exod.1,Gen.1", "Gen.1-Exod.999", "Obad.1,Gen.1", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			c: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			cv: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			v: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			none: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: full`, `book_sequence_strategy: ignore`, and `book_range_strategy: ignore`", () => {
		p.set_options({
			book_alone_strategy: "full",
			book_sequence_strategy: "ignore",
			book_range_strategy: "ignore"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["", "", "", "", ""],
			bc: ["", "", "", "", ""],
			bcv: ["", "", "", "", ""],
			bv: ["", "", "", "", ""],
			c: ["", "", "", "", ""],
			cv: ["", "", "", "", ""],
			v: ["", "", "", "", ""],
			none: ["", "", "", "", ""]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: full`, `book_sequence_strategy: ignore`, and `book_range_strategy: include`", () => {
		p.set_options({
			book_alone_strategy: "full",
			book_sequence_strategy: "ignore",
			book_range_strategy: "include"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["", "Gen.1-Exod.999", "", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			bc: ["", "Gen.1-Exod.40", "", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bcv: ["", "Gen.1-Exod.40", "", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bv: ["", "Gen.1-Exod.999", "", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			c: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			cv: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			v: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			none: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: full`, `book_sequence_strategy: include`, and `book_range_strategy: ignore`", () => {
		p.set_options({
			book_alone_strategy: "full",
			book_sequence_strategy: "include",
			book_range_strategy: "ignore"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["Exod.1-Exod.999,Gen.1-Gen.999", "", "Obad.1,Gen.1-Gen.999", "", ""],
			bc: ["Exod.1-Exod.40,Gen.1-Gen.50", "", "Obad.1,Gen.1-Gen.50", "", ""],
			bcv: ["Exod.1-Exod.40,Gen.1-Gen.50", "", "Obad.1,Gen.1-Gen.50", "", ""],
			bv: ["Exod.1-Exod.999,Gen.1-Gen.999", "", "Obad.1,Gen.1-Gen.999", "", ""],
			c: ["", "", "", "", ""],
			cv: ["", "", "", "", ""],
			v: ["", "", "", "", ""],
			none: ["", "", "", "", ""]
		};
		check_strategies(strategies);
	});
	it("should handle book-only ranges with `book_alone_strategy: full`, `book_sequence_strategy: include`, and `book_range_strategy: include`", () => {
		p.set_options({
			book_alone_strategy: "full",
			book_sequence_strategy: "include",
			book_range_strategy: "include"
		});
		const strategies = {
			strings: ["Exodus to Genesis", "Genesis to Exodus", "Obadiah to Genesis", "Genesis to Obadiah", "Genesis to Revelation (KJV)"],
			b: ["Exod.1-Exod.999,Gen.1-Gen.999", "Gen.1-Exod.999", "Obad.1,Gen.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			bc: ["Exod.1-Exod.40,Gen.1-Gen.50", "Gen.1-Exod.40", "Obad.1,Gen.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bcv: ["Exod.1-Exod.40,Gen.1-Gen.50", "Gen.1-Exod.40", "Obad.1,Gen.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			bv: ["Exod.1-Exod.999,Gen.1-Gen.999", "Gen.1-Exod.999", "Obad.1,Gen.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			c: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			cv: ["Exod.1-Gen.50", "Gen.1-Exod.40", "Obad.1-Gen.50", "Gen.1-Obad.1", "Gen.1-Rev.22"],
			v: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"],
			none: ["Exod.1-Gen.999", "Gen.1-Exod.999", "Obad.1-Gen.999", "Gen.1-Obad.1", "Gen.1-Rev.999"]
		};
		check_strategies(strategies);
	});
	it("should handle single-chapter start books", () => {
		const strategies = {
			strings: ["Obadiah 1-Malachi 5", "Obadiah 1-Malachi 5:8", "Obadiah 1:4-Malachi 5", "Obadiah 1:5-Malachi 5:8", "Obadiah 8-Malachi 5", "Obadiah 9-Malachi 5:8", "Obadiah 24-Malachi 5", "Obadiah 25-Malachi 5:8", "Obadiah 1:28-Malachi 5", "Obadiah 1:29-Malachi 5:8"],
			b: ["Obad.1-Mal.5", "Obad.1.1-Mal.5.8", "Obad.1.4-Mal.5.999", "Obad.1.5-Mal.5.8", "Obad.1.8-Mal.5.999", "Obad.1.9-Mal.5.8", "Obad.1.24-Mal.5.999", "Obad.1.25-Mal.5.8", "Obad.1.28-Mal.5.999", "Obad.1.29-Mal.5.8"],
			bc: ["Obad.1-Mal.4", "Obad.1-Mal.4", "Obad.1.4-Mal.4.999", "Obad.1.5-Mal.4.999", "Obad.1.8-Mal.4.999", "Obad.1.9-Mal.4.999", "Obad.1.24-Mal.4.999", "Obad.1.25-Mal.4.999", "Obad.1.28-Mal.4.999", "Obad.1.29-Mal.4.999"],
			bcv: ["Obad.1-Mal.4", "Obad.1-Mal.4", "Obad.1.4-Mal.4.6", "Obad.1.5-Mal.4.6", "Obad.1.8-Mal.4.6", "Obad.1.9-Mal.4.6", "", "", "", ""],
			bv: ["Obad.1-Mal.5", "Obad.1.1-Mal.5.8", "Obad.1.4-Mal.5.999", "Obad.1.5-Mal.5.8", "Obad.1.8-Mal.5.999", "Obad.1.9-Mal.5.8", "Mal.5", "Mal.5.8", "Mal.5", "Mal.5.8"],
			c: ["Obad.1-Mal.4", "Obad.1-Mal.4", "Obad.1.4-Mal.4.999", "Obad.1.5-Mal.4.999", "Obad.1.8-Mal.4.999", "Obad.1.9-Mal.4.999", "Obad.1.24-Mal.4.999", "Obad.1.25-Mal.4.999", "Obad.1.28-Mal.4.999", "Obad.1.29-Mal.4.999"],
			cv: ["Obad.1-Mal.4", "Obad.1-Mal.4", "Obad.1.4-Mal.4.6", "Obad.1.5-Mal.4.6", "Obad.1.8-Mal.4.6", "Obad.1.9-Mal.4.6", "", "", "", ""],
			v: ["Obad.1-Mal.5", "Obad.1.1-Mal.5.8", "Obad.1.4-Mal.5.999", "Obad.1.5-Mal.5.8", "Obad.1.8-Mal.5.999", "Obad.1.9-Mal.5.8", "Mal.5", "Mal.5.8", "Mal.5", "Mal.5.8"],
			none: ["Obad.1-Mal.5", "Obad.1.1-Mal.5.8", "Obad.1.4-Mal.5.999", "Obad.1.5-Mal.5.8", "Obad.1.8-Mal.5.999", "Obad.1.9-Mal.5.8", "Obad.1.24-Mal.5.999", "Obad.1.25-Mal.5.8", "Obad.1.28-Mal.5.999", "Obad.1.29-Mal.5.8"]
		};
		check_strategies(strategies);
	});
	it("should handle single-chapter end books", () => {
		const strategies = {
			strings: ["Genesis 49-Obadiah 1", "Genesis 49-Obadiah 32", "Genesis 49-Obadiah 1:1", "Genesis 49-Obadiah 1:33", "Genesis 49-Obadiah 34:1", "Genesis 49:2-Obadiah 1", "Genesis 49:3-Obadiah 35", "Genesis 49:4-Obadiah 1:1", "Genesis 49:5-Obadiah 1:36", "Genesis 49:6-Obadiah 37:1", "Genesis 51-Obadiah 1", "Genesis 51-Obadiah 38", "Genesis 51-Obadiah 1:1", "Genesis 51-Obadiah 1:39", "Genesis 51-Obadiah 40:1", "Genesis 51:2-Obadiah 1", "Genesis 51:3-Obadiah 41", "Genesis 51:4-Obadiah 1:1", "Genesis 51:5-Obadiah 1:42", "Genesis 51:6-Obadiah 43:1"],
			b: ["Gen.49-Obad.1", "Gen.49.1-Obad.1.32", "Gen.49.1-Obad.1.1", "Gen.49.1-Obad.1.33", "Gen.49-Obad.1", "Gen.49.2-Obad.1.999", "Gen.49.3-Obad.1.35", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.36", "Gen.49.6-Obad.1.999", "Gen.51-Obad.1", "Gen.51.1-Obad.1.38", "Gen.51.1-Obad.1.1", "Gen.51.1-Obad.1.39", "Gen.51-Obad.1", "Gen.51.2-Obad.1.999", "Gen.51.3-Obad.1.41", "Gen.51.4-Obad.1.1", "Gen.51.5-Obad.1.42", "Gen.51.6-Obad.1.999"],
			bc: ["Gen.49-Obad.1", "Gen.49.1-Obad.1.32", "Gen.49.1-Obad.1.1", "Gen.49.1-Obad.1.33", "Gen.49-Obad.1", "Gen.49.2-Obad.1.999", "Gen.49.3-Obad.1.35", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.36", "Gen.49.6-Obad.1.999", "Obad.1", "Obad.1.38", "Obad.1.1", "Obad.1.39", "", "Obad.1", "Obad.1.41", "Obad.1.1", "Obad.1.42", ""],
			bcv: ["Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.1-Obad.1.1", "Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.2-Obad.1.21", "Gen.49.3-Obad.1.21", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.21", "Gen.49.6-Obad.1.21", "Obad.1", "", "Obad.1.1", "", "", "Obad.1", "", "Obad.1.1", "", ""],
			bv: ["Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.1-Obad.1.1", "Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.2-Obad.1.21", "Gen.49.3-Obad.1.21", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.21", "Gen.49.6-Obad.1.21", "Gen.51-Obad.1", "Gen.51-Obad.1", "Gen.51.1-Obad.1.1", "Gen.51-Obad.1", "Gen.51-Obad.1", "Gen.51.2-Obad.1.21", "Gen.51.3-Obad.1.21", "Gen.51.4-Obad.1.1", "Gen.51.5-Obad.1.21", "Gen.51.6-Obad.1.21"],
			c: ["Gen.49-Obad.1", "Gen.49.1-Obad.1.32", "Gen.49.1-Obad.1.1", "Gen.49.1-Obad.1.33", "Gen.49-Obad.1", "Gen.49.2-Obad.1.999", "Gen.49.3-Obad.1.35", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.36", "Gen.49.6-Obad.1.999", "Obad.1", "Obad.1.38", "Obad.1.1", "Obad.1.39", "", "Obad.1", "Obad.1.41", "Obad.1.1", "Obad.1.42", ""],
			cv: ["Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.1-Obad.1.1", "Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.2-Obad.1.21", "Gen.49.3-Obad.1.21", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.21", "Gen.49.6-Obad.1.21", "Obad.1", "", "Obad.1.1", "", "", "Obad.1", "", "Obad.1.1", "", ""],
			v: ["Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.1-Obad.1.1", "Gen.49-Obad.1", "Gen.49-Obad.1", "Gen.49.2-Obad.1.21", "Gen.49.3-Obad.1.21", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.21", "Gen.49.6-Obad.1.21", "Gen.51-Obad.1", "Gen.51-Obad.1", "Gen.51.1-Obad.1.1", "Gen.51-Obad.1", "Gen.51-Obad.1", "Gen.51.2-Obad.1.21", "Gen.51.3-Obad.1.21", "Gen.51.4-Obad.1.1", "Gen.51.5-Obad.1.21", "Gen.51.6-Obad.1.21"],
			none: ["Gen.49-Obad.1", "Gen.49.1-Obad.1.32", "Gen.49.1-Obad.1.1", "Gen.49.1-Obad.1.33", "Gen.49-Obad.1", "Gen.49.2-Obad.1.999", "Gen.49.3-Obad.1.35", "Gen.49.4-Obad.1.1", "Gen.49.5-Obad.1.36", "Gen.49.6-Obad.1.999", "Gen.51-Obad.1", "Gen.51.1-Obad.1.38", "Gen.51.1-Obad.1.1", "Gen.51.1-Obad.1.39", "Gen.51-Obad.1", "Gen.51.2-Obad.1.999", "Gen.51.3-Obad.1.41", "Gen.51.4-Obad.1.1", "Gen.51.5-Obad.1.42", "Gen.51.6-Obad.1.999"]
		};
		check_strategies(strategies);
	});

	/*
	xit("should handle ...template", () => {
		// p.set_options({});
		const strategies = {
			strings:	["",	"",	"",	"",	],
			b:			["",			"",			"",			],
			bc:			["",			"",			"",			],
			bcv:		["",			"",			"",			],
			bv:			["",			"",			"",			],
			c:			["",			"",			"",			],
			cv:			["",			"",			"",			],
			v:			["",			"",			"",			],
			none:		["",			"",			"",			]
		}
		check_strategies(strategies);
	});
	*/
	it("should handle full books with `passage_existence_strategy = b`", () => {
		p.set_options({
			osis_compaction_strategy: "b",
			book_alone_strategy: "full"
		}, p.set_options({
			passage_existence_strategy: "b"
		}));
		expect(p.parse("Genesis").osis()).toEqual("Gen");
		expect(p.parse("Genesis 1-50").osis()).toEqual("Gen.1-Gen.50");
		expect(p.parse("Genesis 1-50:26").osis()).toEqual("Gen.1.1-Gen.50.26");
		expect(p.parse("Genesis 1-50:998").osis()).toEqual("Gen.1.1-Gen.50.998");
		expect(p.parse("Genesis 1-50:999").osis()).toEqual("Gen.1-Gen.50");
	});
	it("should handle full books with `passage_existence_strategy = bc`", () => {
		p.set_options({
			osis_compaction_strategy: "b",
			book_alone_strategy: "full",
			passage_existence_strategy: "bc"
		});
		expect(p.parse("Genesis").osis()).toEqual("Gen");
		expect(p.parse("Genesis 1-50").osis()).toEqual("Gen");
		expect(p.parse("Genesis 1-50:26").osis()).toEqual("Gen.1.1-Gen.50.26");
		expect(p.parse("Genesis 1-50:998").osis()).toEqual("Gen.1.1-Gen.50.998");
		expect(p.parse("Genesis 1-50:999").osis()).toEqual("Gen");
	});
	it("should handle full single-chapter books with `passage_existence_strategy = b`", () => {
		p.set_options({
			osis_compaction_strategy: "b",
			book_alone_strategy: "full",
			passage_existence_strategy: "b"
		});
		expect(p.parse("Jude").osis()).toEqual("Jude.1");
		expect(p.parse("Jude 1-25").osis()).toEqual("Jude.1.1-Jude.1.25");
		expect(p.parse("Jude 1:1-26").osis()).toEqual("Jude.1.1-Jude.1.26");
		expect(p.parse("Jude 1-998").osis()).toEqual("Jude.1.1-Jude.1.998");
		expect(p.parse("Jude 1:1-998").osis()).toEqual("Jude.1.1-Jude.1.998");
		expect(p.parse("Jude 1:1-999").osis()).toEqual("Jude.1");
		expect(p.parse("Jude 1-2:2").osis()).toEqual("Jude.1");
		expect(p.parse("Jude 1-50:999").osis()).toEqual("Jude.1");
	});
	it("should handle full single-chapter books with `passage_existence_strategy = bc`", () => {
		p.set_options({
			osis_compaction_strategy: "b",
			book_alone_strategy: "full",
			passage_existence_strategy: "bc"
		});
		expect(p.parse("Jude").osis()).toEqual("Jude");
		expect(p.parse("Jude 1-25").osis()).toEqual("Jude.1.1-Jude.1.25");
		expect(p.parse("Jude 1:1-26").osis()).toEqual("Jude.1.1-Jude.1.26");
		expect(p.parse("Jude 1-998").osis()).toEqual("Jude.1.1-Jude.1.998");
		expect(p.parse("Jude 1:1-998").osis()).toEqual("Jude.1.1-Jude.1.998");
		expect(p.parse("Jude 1:1-999").osis()).toEqual("Jude");
		expect(p.parse("Jude 1-2:2").osis()).toEqual("Jude");
		expect(p.parse("Jude 1-50:999").osis()).toEqual("Jude");
	});
});

"use strict";
import { bcv_parser } from "../es/bcv_parser.js";
import * as lang from "../es/lang/en.js";

describe("OSIS parsing strategies", () => {
	let p = {};
	let translation = "default";
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.reset();
		translation = "default";
		p.options.book_alone_strategy = "ignore";
	});
	it("should return OSIS for b-b with various parsing strategies", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen-Rev");
		p.options.book_alone_strategy = "first_chapter";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen-Rev");
		p.options.book_alone_strategy = "full";
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1-Gen.50");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1-Rev.22");
		p.options.book_alone_strategy = "first_chapter";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1-Rev.22");
		p.options.book_alone_strategy = "full";
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1.1-Gen.50.26");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1.1-Rev.22.21");
		p.options.book_alone_strategy = "first_chapter";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1.1-Gen.1.31");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1.1-Rev.22.21");
	});
	it("should return OSIS for bc-b with various parsing strategies", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen-Rev");
		p.options.book_alone_strategy = "first_chapter";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen-Rev");
		p.options.book_alone_strategy = "full";
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1-Gen.50");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1-Rev.22");
		p.options.book_alone_strategy = "first_chapter";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1-Gen.50");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1-Rev.22");
		p.options.book_alone_strategy = "full";
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1.1-Gen.50.26");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1.1-Rev.22.21");
		p.options.book_alone_strategy = "first_chapter";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1.1-Gen.50.26");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1.1-Rev.22.21");
	});
	it("should return OSIS for bcv-b with various parsing strategies", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen-Rev");
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1-Gen.50");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1-Rev.22");
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen"
		}, translation)).toEqual("Gen.1.1-Gen.50.26");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Rev"
		}, translation)).toEqual("Gen.1.1-Rev.22.21");
	});
	it("should return OSIS for b-bc with various parsing strategies", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 1
		}, translation)).toEqual("Gen.1-Rev.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 22
		}, translation)).toEqual("Gen-Rev");
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 1
		}, translation)).toEqual("Gen.1-Rev.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 22
		}, translation)).toEqual("Gen.1-Rev.22");
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1
		}, translation)).toEqual("Gen.1.1-Gen.1.31");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2
		}, translation)).toEqual("Gen.1.1-Gen.2.25");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.20");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 22
		}, translation)).toEqual("Gen.1.1-Rev.22.21");
	});
	it("should return OSIS for b-bcv with various parsing strategies", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2,
			v: 1
		}, translation)).toEqual("Gen.1.1-Gen.2.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1.1-Gen.1.31");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1.1-Gen.2.25");
		expect(p.to_osis({
			b: "Gen"
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
	});
	it("should return OSIS for bcs", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 2,
			v: 1
		}, translation)).toEqual("Gen.1.1-Gen.2.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1.1-Gen.1.31");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1.1-Gen.2.25");
		expect(p.to_osis({
			b: "Gen",
			c: 1
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
	});
	it("should return OSIS for bcvs", () => {
		p.options.osis_compaction_strategy = "b";
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 2,
			v: 1
		}, translation)).toEqual("Gen.1.1-Gen.2.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
		p.options.osis_compaction_strategy = "bc";
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1-Gen.2");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
		p.options.osis_compaction_strategy = "bcv";
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 1,
			v: 31
		}, translation)).toEqual("Gen.1.1-Gen.1.31");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Gen",
			c: 2,
			v: 25
		}, translation)).toEqual("Gen.1.1-Gen.2.25");
		expect(p.to_osis({
			b: "Gen",
			c: 1,
			v: 1
		}, {
			b: "Rev",
			c: 1,
			v: 1
		}, translation)).toEqual("Gen.1.1-Rev.1.1");
	});
});

describe("Basic passage parsing", () => {
	let p = {};
	let psg = {};
	const translation_obj = {
		translation: "default",
		osis: "",
		system: "default"
	};
	beforeEach(() => {
		p = new bcv_parser(lang);
		psg = p.passage;
	});
	it("should handle start indices", () => {
		psg.books = [
			{
				start_index: 0,
				value: "Genesis"
			}, {
				start_index: 12,
				value: "N"
			}
		];
		expect(psg.calculate_indices("\x1f0\x1f 2:3", 0)).toEqual([
			{
				start: 0,
				end: 1,
				index: 0
			}, {
				start: 2,
				end: 6,
				index: 4
			}
		]);
		expect(psg.calculate_indices("\x1f0\x1f 2:3-\x1e1\x1e 5", 0)).toEqual([
			{
				start: 0,
				end: 1,
				index: 0
			}, {
				start: 2,
				end: 9,
				index: 4
			}, {
				start: 10,
				end: 12,
				index: 2
			}
		]);
		psg.books = [
			{
				start_index: 3,
				value: "Genesis"
			}, {
				start_index: 15,
				value: "N"
			}
		];
		expect(psg.calculate_indices("pre\x1f0\x1f 2:3", "0")).toEqual([
			{
				start: 0,
				end: 4,
				index: 0
			}, {
				start: 5,
				end: 9,
				index: 4
			}
		]);
		expect(psg.calculate_indices("pre\x1f0\x1f 2:3-\x1e1\x1e 5", 0)).toEqual([
			{
				start: 0,
				end: 4,
				index: 0
			}, {
				start: 5,
				end: 12,
				index: 4
			}, {
				start: 13,
				end: 15,
				index: 2
			}
		]);
		psg.books = [
			{
				start_index: 8,
				value: "Genesis"
			}, {
				start_index: 15,
				value: "Exodus"
			}
		];
		expect(psg.calculate_indices("\x1f0\x1f\x1f1\x1f 6", "08")).toEqual([
			{
				start: 0,
				end: 1,
				index: 8
			}, {
				start: 2,
				end: 4,
				index: 12
			}, {
				start: 5,
				end: 7,
				index: 15
			}
		]);
	});
	it("should match absolute indices", () => {
		psg.indices = [
			{
				start: 1,
				end: 2,
				index: 1
			}, {
				start: 3,
				end: 4,
				index: 6
			}
		];
		expect(psg.get_absolute_indices([1, 2])).toEqual([2, 4]);
		expect(psg.get_absolute_indices([2, 3])).toEqual([3, 10]);
		expect(psg.get_absolute_indices([0, 4])).toEqual([null, 11]);
		expect(psg.get_absolute_indices([3, 5])).toEqual([9, null]);
	});
	it("should validate refs with starts only", () => {
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 1
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(null, {
			b: "gen",
			c: 1
		})).toEqual({
			valid: false,
			messages: {
				start_book_not_exist: true
			}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 51
		})).toEqual({
			valid: false,
			messages: {
				start_chapter_not_exist: 50
			}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 0
		})).toEqual({
			valid: false,
			messages: {
				start_chapter_is_zero: 1
			}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 1,
			v: "31"
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 1,
			v: 0
		})).toEqual({
			valid: false,
			messages: {
				start_verse_is_zero: 1
			}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 1,
			v: 32
		})).toEqual({
			valid: false,
			messages: {
				start_verse_not_exist: 31
			}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: "none"
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(null, {
			b: "Gen",
			c: 1,
			v: "none"
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(null, {
			b: "Phlm",
			c: 2
		})).toEqual({
			valid: false,
			messages: {
				start_chapter_not_exist_in_single_chapter_book: 1
			}
		});
	});
	it("should validate refs with starts and ends", () => {
		expect(psg.validate_ref(null, {
			b: "Matt"
		}, {
			b: "Phlm"
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(null, {
			b: "Matt"
		}, {
			b: "Matt"
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(null, {
			b: "Matt"
		}, {
			b: "Mal"
		})).toEqual({
			valid: false,
			messages: {
				end_book_before_start: true
			}
		});
		expect(psg.validate_ref(null, {
			b: "Matt",
			c: "five"
		}, {
			b: "Phlm",
			c: "one"
		})).toEqual({
			valid: true,
			messages: {
				end_chapter_not_exist_in_single_chapter_book: 1
			}
		});
		expect(psg.validate_ref(null, {
			b: "Matt",
			c: 5,
			v: "six"
		}, {
			b: "Phlm",
			c: 2
		})).toEqual({
			valid: true,
			messages: {
				end_chapter_not_exist_in_single_chapter_book: 1
			}
		});
		expect(psg.validate_ref(null, {
			b: "Matt",
			c: 50,
			v: 12
		}, {
			b: "Matt",
			c: 2
		})).toEqual({
			valid: false,
			messages: {
				start_chapter_not_exist: 28,
				end_chapter_before_start: true
			}
		});
	});
	it("should validate start refs", () => {
		expect(psg.validate_start_ref("default", {
			b: "Matt"
		}, {})).toEqual([true, {}]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: 5
		}, {})).toEqual([true, {}]);
		expect(psg.validate_start_ref("default", {}, {})).toEqual([
			false, {
				start_book_not_defined: true
			}
		]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: "five"
		}, {})).toEqual([
			true, {}
		]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: 5,
			v: 10
		}, {})).toEqual([true, {}]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: 5,
			v: "ten"
		}, {})).toEqual([
			true, {}
		]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: "five",
			v: "ten"
		}, {})).toEqual([
			true, {}
		]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			v: 10
		}, {})).toEqual([true, {}]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			v: "ten"
		}, {})).toEqual([
			true, {}
		]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: 5,
			v: 100
		}, {})).toEqual([
			false, {
				start_verse_not_exist: 48
			}
		]);
		expect(psg.validate_start_ref("default", {
			b: "Matt",
			c: 100,
			v: 100
		}, {})).toEqual([
			false, {
				start_chapter_not_exist: 28
			}
		]);
		expect(psg.validate_start_ref("default", {
			b: "None",
			c: 2,
			v: 1
		}, {})).toEqual([
			false, {
				start_book_not_exist: true
			}
		]);
	});
	it("should validate end refs", () => {
		expect(psg.validate_end_ref("default", {
			b: "Matt"
		}, {
			b: "Mark"
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Mark"
		}, {
			b: "Matt"
		}, true, {})).toEqual([
			false, {
				end_book_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {}, {}, {}, {}, {})).toEqual([
			false, {
				end_book_not_exist: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Mark",
			c: 4
		}, {
			b: "Matt",
			c: 5
		}, true, {})).toEqual([
			false, {
				end_book_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "None",
			c: 5
		}, {
			b: "Mark",
			c: 4
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_ref(null, {
			b: "None",
			c: 5
		}, {
			b: "Mark",
			c: 4
		})).toEqual({
			valid: false,
			messages: {
				start_book_not_exist: true
			}
		});
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5
		}, {
			b: "Matt",
			c: 6
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 10
		}, {
			b: "Matt",
			c: 4,
			v: 10
		}, true, {})).toEqual([
			false, {
				end_chapter_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt"
		}, {
			b: "Matt",
			c: 4
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 1
		}, {
			b: "Matt",
			c: 0
		}, true, {})).toEqual([
			false, {
				end_chapter_is_zero: 1,
				end_chapter_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt"
		}, {
			b: "Matt",
			c: 0
		}, true, {})).toEqual([
			false, {
				end_chapter_is_zero: 1,
				end_chapter_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 2
		}, {
			b: "Matt",
			c: "four"
		}, true, {})).toEqual([
			true, {}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5
		}, {
			b: "Matt",
			c: 5,
			v: 4
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 4
		}, {
			b: "Matt",
			c: 5,
			v: 4
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 4
		}, {
			b: "Matt",
			c: 5,
			v: 6
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 4
		}, {
			b: "Matt",
			c: 5,
			v: 1000
		}, true, {})).toEqual([
			true, {
				end_verse_not_exist: 48
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 4
		}, {
			b: "Matt",
			c: 5,
			v: 3
		}, true, {})).toEqual([
			false, {
				end_verse_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 7
		}, {
			b: "Matt",
			c: 5,
			v: "eight"
		}, true, {})).toEqual([
			true, {}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: "seven"
		}, {
			b: "Matt",
			c: 5,
			v: "eight"
		}, true, {})).toEqual([
			false, {
				end_verse_before_start: true
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: 7
		}, {
			b: "Matt",
			c: 5,
			v: 100
		}, true, {})).toEqual([
			true, {
				end_verse_not_exist: 48
			}
		]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: 5,
			v: "seven"
		}, {
			b: "Matt",
			c: 5,
			v: 8
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: "four",
			v: "seven"
		}, {
			b: "Matt",
			c: 5,
			v: 8
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt",
			c: null,
			v: 7
		}, {
			b: "Matt",
			c: null,
			v: 8
		}, true, {})).toEqual([true, {}]);
		expect(psg.validate_end_ref("default", {
			b: "Matt"
		}, {
			b: "Exod",
			c: "one",
			v: "two"
		}, true, {})).toEqual([
			false, {
				end_book_before_start: true			}
		]);
	});
	it("should handle translations", () => {
		expect(psg.validate_ref([
			{
				translation: "default",
				osis: "",
				system: "default"
			}, {
				translation: "niv",
				system: "default"
			}
		], {
			b: "1Pet",
			c: 3
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref([
			{
				no_key: "none"
			}
		], {
			b: "Obad",
			c: 1
		})).toEqual({
			valid: false,
			messages: { translation_invalid: [ { no_key: "none"} ] }
		});
		expect(psg.validate_ref(null, {
			b: "Obad",
			c: 1,
			"translations": null
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref("12", {
			b: "Obad",
			c: 1
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref(12, {
			b: "Obad",
			c: 1
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(psg.validate_ref([12], {
			b: "Obad",
			c: 1
		})).toEqual({
			valid: false,
			messages: {
				translation_invalid: [12]
			}
		});
		expect(psg.validate_ref([], {
			b: "Obad",
			c: 1
		})).toEqual({
			valid: true,
			messages: {}
		});
		expect(() => {
			psg.validate_ref([null], {
				b: "Obad",
				c: 1
			});
		}).toThrow();
	});
	it("should handle bvs posing as bcs", () => {
		psg.books = [];
		psg.books[0] = {
			parsed: ["Phlm"]
		};
		expect(psg.bc({
			absolute_indices: [0, 6],
			value: [
				{
					type: "b",
					absolute_indices: [0, 3],
					value: 0
				}, {
					type: "c",
					absolute_indices: [5, 6],
					value: [
						{
							type: "integer",
							absolute_indices: [5, 6],
							value: 2
						}
					]
				}
			]
		}, [], {
			b: "Gen",
			c: 6,
			v: 6
		})).toEqual([
			[
				{
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							absolute_indices: [0, 3],
							value: 0
						}, {
							type: "c",
							absolute_indices: [5, 6],
							value: [
								{
									type: "integer",
									absolute_indices: [5, 6],
									value: 2
								}
							]
						}
					],
					start_context: {
						b: "Gen",
						c: 6,
						v: 6
					},
					passages: [
						{
							start: {
								b: "Phlm",
								c: 1,
								v: 2
							},
							end: {
								b: "Phlm",
								c: 1,
								v: 2
							},
							valid: {
								valid: true,
								messages: {
									start_chapter_not_exist_in_single_chapter_book: 1
								}
							}
						}
					]
				}
			], {
				b: "Phlm",
				c: 1,
				v: 2
			}
		]);
		expect(psg.bc({
			absolute_indices: [0, 6],
			value: [
				{
					type: "b",
					absolute_indices: [0, 3],
					value: 0
				}, {
					type: "c",
					absolute_indices: [5, 6],
					value: [
						{
							type: "integer",
							absolute_indices: [5, 6],
							value: 7
						}
					]
				}
			]
		}, [], {
			b: "Gen",
			c: 6,
			v: 6
		})).toEqual([
			[
				{
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							absolute_indices: [0, 3],
							value: 0
						}, {
							type: "c",
							absolute_indices: [5, 6],
							value: [
								{
									type: "integer",
									absolute_indices: [5, 6],
									value: 7
								}
							]
						}
					],
					start_context: {
						b: "Gen",
						c: 6,
						v: 6
					},
					passages: [
						{
							start: {
								b: "Phlm",
								c: 1,
								v: 7
							},
							end: {
								b: "Phlm",
								c: 1,
								v: 7
							},
							valid: {
								valid: true,
								messages: {
									start_chapter_not_exist_in_single_chapter_book: 1
								}
							}
						}
					]
				}
			], {
				b: "Phlm",
				c: 1,
				v: 7
			}
		]);
		psg.books[0] = {
			parsed: ["Phlm", "Phil"]
		};
		expect(psg.bc({
			absolute_indices: [0, 6],
			value: [
				{
					type: "b",
					value: 0
				}, {
					type: "c",
					value: [
						{
							type: "integer",
							value: 2
						}
					]
				}
			]
		}, [], {
			translations: [
				{
					translation: "niv",
					osis: "NIV",
					system: "default"
				}, {
					translation: "kjv",
					osis: "KJV",
					system: "default"
				}
			]
		})).toEqual([
			[
				{
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							value: 0
						}, {
							type: "c",
							value: [
								{
									type: "integer",
									value: 2
								}
							]
						}
					],
					start_context: {
						translations: [
							{
								translation: "niv",
								osis: "NIV",
								system: "default"
							}, {
								translation: "kjv",
								osis: "KJV",
								system: "default"
							}
						]
					},
					passages: [
						{
							start: {
								b: "Phlm",
								c: 1,
								v: 2
							},
							end: {
								b: "Phlm",
								c: 1,
								v: 2
							},
							valid: {
								valid: true,
								messages: {
									start_chapter_not_exist_in_single_chapter_book: 1
								}
							},
							alternates: [
								{
									start: {
										b: "Phil",
										c: 2
									},
									end: {
										b: "Phil",
										c: 2
									},
									valid: {
										valid: true,
										messages: {}
									}
								}
							],
							translations: [
								{
									translation: "niv",
									osis: "NIV",
									system: "default"
								}, {
									translation: "kjv",
									osis: "KJV",
									system: "default"
								}
							]
						}
					]
				}
			], {
				b: "Phlm",
				c: 1,
				v: 2,
				translations: [
					{
						translation: "niv",
						osis: "NIV",
						system: "default"
					}, {
						translation: "kjv",
						osis: "KJV",
						system: "default"
					}
				]
			}
		]);
		expect(psg.bc({
			absolute_indices: [0, 6],
			value: [
				{
					type: "b",
					value: 0
				}, {
					type: "c",
					value: [
						{
							type: "integer",
							value: 7
						}
					]
				}
			]
		}, [], {
			translations: [
				{
					translation: "niv",
					osis: "NIV",
					system: "default"
				}, {
					translation: "kjv",
					osis: "KJV",
					system: "default"
				}
			]
		})).toEqual([
			[
				{
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							value: 0
						}, {
							type: "c",
							value: [
								{
									type: "integer",
									value: 7
								}
							]
						}
					],
					start_context: {
						translations: [
							{
								translation: "niv",
								osis: "NIV",
								system: "default"
							}, {
								translation: "kjv",
								osis: "KJV",
								system: "default"
							}
						]
					},
					passages: [
						{
							start: {
								b: "Phlm",
								c: 1,
								v: 7
							},
							end: {
								b: "Phlm",
								c: 1,
								v: 7
							},
							valid: {
								valid: true,
								messages: {
									start_chapter_not_exist_in_single_chapter_book: 1
								}
							},
							alternates: [
								{
									start: {
										b: "Phil",
										c: 7
									},
									end: {
										b: "Phil",
										c: 7
									},
									valid: {
										valid: false,
										messages: {
											start_chapter_not_exist: 4
										}
									}
								}
							],
							translations: [
								{
									translation: "niv",
									osis: "NIV",
									system: "default"
								}, {
									translation: "kjv",
									osis: "KJV",
									system: "default"
								}
							]
						}
					]
				}
			], {
				b: "Phlm",
				c: 1,
				v: 7,
				translations: [
					{
						translation: "niv",
						osis: "NIV",
						system: "default"
					}, {
						translation: "kjv",
						osis: "KJV",
						system: "default"
					}
				]
			}
		]);
		psg.books[0] = {
			parsed: ["Phil", "Phlm"]
		};
		expect(psg.bc({
			absolute_indices: [0, 6],
			value: [
				{
					type: "b",
					absolute_indices: [0, 3],
					value: 0
				}, {
					type: "c",
					value: [
						{
							type: "integer",
							absolute_indices: [5, 6],
							value: 2
						}
					]
				}
			]
		}, [], {})).toEqual([
			[
				{
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							absolute_indices: [0, 3],
							value: 0
						}, {
							type: "c",
							value: [
								{
									type: "integer",
									absolute_indices: [5, 6],
									value: 2
								}
							]
						}
					],
					start_context: {},
					passages: [
						{
							start: {
								b: "Phil",
								c: 2
							},
							end: {
								b: "Phil",
								c: 2
							},
							valid: {
								valid: true,
								messages: {}
							},
							alternates: [
								{
									start: {
										b: "Phlm",
										c: 1,
										v: 2
									},
									end: {
										b: "Phlm",
										c: 1,
										v: 2
									},
									valid: {
										valid: true,
										messages: {
											start_chapter_not_exist_in_single_chapter_book: 1
										}
									}
								}
							]
						}
					]
				}
			], {
				b: "Phil",
				c: 2
			}
		]);
		expect(psg.bc({
			absolute_indices: [0, 6],
			value: [
				{
					type: "b",
					absolute_indices: [0, 3],
					value: 0
				}, {
					type: "c",
					absolute_indices: [5, 6],
					value: [
						{
							type: "integer",
							absolute_indices: [5, 6],
							value: 7
						}
					]
				}
			]
		}, [], {
			b: "Gen",
			c: 6,
			v: 6
		})).toEqual([
			[
				{
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							absolute_indices: [0, 3],
							value: 0
						}, {
							type: "c",
							absolute_indices: [5, 6],
							value: [
								{
									type: "integer",
									absolute_indices: [5, 6],
									value: 7
								}
							]
						}
					],
					start_context: {
						b: "Gen",
						c: 6,
						v: 6
					},
					passages: [
						{
							start: {
								b: "Phlm",
								c: 1,
								v: 7
							},
							end: {
								b: "Phlm",
								c: 1,
								v: 7
							},
							valid: {
								valid: true,
								messages: {
									start_chapter_not_exist_in_single_chapter_book: 1
								}
							},
							alternates: [
								{
									start: {
										b: "Phil",
										c: 7
									},
									end: {
										b: "Phil",
										c: 7
									},
									valid: {
										valid: false,
										messages: {
											start_chapter_not_exist: 4
										}
									}
								}
							]
						}
					]
				}
			], {
				b: "Phlm",
				c: 1,
				v: 7
			}
		]);
	});
	it("should handle `bc_title`s", () => {
		psg.books = [{}];
		psg.books[0].parsed = ["Phil", "Phlm", "Ps"];
		expect(psg.bc_title({
			type: "bc_title",
			indices: [0, 10],
			absolute_indices: [0, 12],
			value: [
				{
					type: "bc",
					absolute_indices: [0, 6],
					value: [
						{
							type: "b",
							absolute_indices: [0, 5],
							value: 0
						}, {
							type: "c",
							absolute_indices: [5, 6],
							value: [
								{
									type: "integer",
									absolute_indices: [5, 6],
									value: 7
								}
							]
						}
					]
				}, {
					type: "title",
					value: ["title"],
					indices: [5, 9]
				}
			]
		}, [], {})).toEqual([
			[
				{
					type: "bcv",
					indices: [0, 10],
					absolute_indices: [0, 12],
					value: [
						{
							type: "bc",
							absolute_indices: [0, 6],
							value: [
								{
									type: "b",
									absolute_indices: [0, 5],
									value: 0
								}, {
									type: "c",
									absolute_indices: [5, 6],
									value: [
										{
											type: "integer",
											absolute_indices: [5, 6],
											value: 7
										}
									]
								}
							],
							start_context: {},
							passages: [
								{
									start: {
										b: "Ps",
										c: 7
									},
									end: {
										b: "Ps",
										c: 7
									},
									valid: {
										valid: true,
										messages: {}
									}
								}
							]
						}, {
							type: "v",
							original_type: "title",
							value: [
								{
									type: "integer",
									value: 1,
									indices: [5, 9]
								}
							],
							indices: [5, 9]
						}
					],
					start_context: {},
					passages: [
						{
							start: {
								b: "Ps",
								c: 7,
								v: 1
							},
							end: {
								b: "Ps",
								c: 7,
								v: 1
							},
							valid: {
								valid: true,
								messages: {}
							}
						}
					]
				}
			], {
				b: "Ps",
				c: 7,
				v: 1
			}
		]);
	});
	it("should adjust `RegExp.lastIndex` correctly", () => {
		expect(p.matcher.adjust_regexp_end([], 10, 10)).toEqual(0);
		expect(p.matcher.adjust_regexp_end([], 10, 9)).toEqual(1);
		expect(p.matcher.adjust_regexp_end([
			{}, {
				indices: [0, 5]
			}
		], 10, 10)).toEqual(4);
		expect(p.matcher.adjust_regexp_end([
			{}, {
				indices: [0, 9]
			}
		], 10, 10)).toEqual(0);
	});
	it("should handle `next_v` correctly", () => {
		p.parse("Gen 1:2a");
		let passage = {
			"type": "next_v",
			"value": [
				{
					"type": "bcv",
					"value": [
						{
							"type": "bc",
							"value": [
								{
									"type": "b",
									"value": 0,
									"indices": [0, 2]
								}, {
									"type": "c",
									"value": [
										{
											"type": "integer",
											"value": 1,
											"indices": [4, 4]
										}
									],
									"indices": [4, 4]
								}
							],
							"indices": [0, 4]
						}, {
							"type": "v",
							"value": [
								{
									"type": "integer",
									"value": 2,
									"indices": [6, 6]
								}
							],
							"indices": [6, 6]
						}
					],
					"indices": [0, 7]
				}
			],
			"indices": [0, 7]
		};
		let [out, context] = p.passage.next_v(passage, [], {});
		expect(context).toEqual({
			b: "Gen",
			c: 1,
			v: 3
		});
		expect(out[0].absolute_indices).toEqual([0, 8]);
		p.parse("Gen 6f");
		passage = {
			"type": "next_v",
			"value": [
				{
					"type": "bc",
					"value": [
						{
							"type": "b",
							"value": 0,
							"indices": [0, 2]
						}, {
							"type": "c",
							"value": [
								{
									"type": "integer",
									"value": 6,
									"indices": [4, 4]
								}
							],
							"indices": [4, 4]
						}
					],
					"indices": [0, 4]
				}
			],
			"indices": [0, 5]
		};
		[out, context] = p.passage.next_v(passage, [], {});
		expect(context).toEqual({
			b: "Gen",
			c: 7
		});
		expect(out[0].absolute_indices).toEqual([0, 6]);
	});
});

describe("Parsing with context", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.options.osis_compaction_strategy = "b";
		p.options.sequence_combination_strategy = "combine";
	});
	it("should handle book context", () => {
		expect(p.parse_with_context("2", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 1]
			}
		]);
		expect(p.parse_with_context("2:3", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.2.3",
				translations: [""],
				indices: [0, 3]
			}
		]);
		expect(p.parse_with_context("2ff", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.50",
				translations: [""],
				indices: [0, 3]
			}
		]);
		expect(p.parse_with_context("verse 2", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.2",
				translations: [""],
				indices: [0, 7]
			}
		]);
		expect(p.parse_with_context("ch. 2-10", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.10",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse_with_context("chapter 6", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.6",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse_with_context("and 6 KJV", "Gen").osis_and_indices()).toEqual([
			{
				osis: "Gen.6",
				translations: ["KJV"],
				indices: [4, 9]
			}
		]);
	});
	it("should handle chapter context", () => {
		expect(p.parse_with_context("2", "Gen 1").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 1]
			}
		]);
		expect(p.parse_with_context("2:3", "Gen 1").osis_and_indices()).toEqual([
			{
				osis: "Gen.2.3",
				translations: [""],
				indices: [0, 3]
			}
		]);
		expect(p.parse_with_context("2ff", "Gen 1").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.50",
				translations: [""],
				indices: [0, 3]
			}
		]);
		expect(p.parse_with_context("verse 16", "John 3").osis_and_indices()).toEqual([
			{
				osis: "John.3.16",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse_with_context("ch. 2-10", "Gen 8").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.10",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse_with_context("chapter 6", "Gen 1").osis_and_indices()).toEqual([
			{
				osis: "Gen.6",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse_with_context("and 6 KJV", "Gen 5").osis_and_indices()).toEqual([
			{
				osis: "Gen.6",
				translations: ["KJV"],
				indices: [4, 9]
			}
		]);
		expect(p.parse_with_context("verse 2", "Genesis 3").osis()).toEqual("Gen.3.2");
	});
	it("should handle verse context", () => {
		expect(p.parse_with_context("2", "Gen 1:5").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.2",
				translations: [""],
				indices: [0, 1]
			}
		]);
		expect(p.parse_with_context("2:3", "Gen 1:6").osis_and_indices()).toEqual([
			{
				osis: "Gen.2.3",
				translations: [""],
				indices: [0, 3]
			}
		]);
		expect(p.parse_with_context("2ff", "Gen 1:8").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.2-Gen.1.31",
				translations: [""],
				indices: [0, 3]
			}
		]);
		expect(p.parse_with_context("verse 16", "John 3:2").osis_and_indices()).toEqual([
			{
				osis: "John.3.16",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse_with_context("ch. 2-10", "Gen 1:5").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.10",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse_with_context("chapter 6", "Gen 1:7").osis_and_indices()).toEqual([
			{
				osis: "Gen.6",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse_with_context("and 6 KJV", "Gen 17:5").osis_and_indices()).toEqual([
			{
				osis: "Gen.17.6",
				translations: ["KJV"],
				indices: [4, 9]
			}
		]);
	});
	it("should handle sequences", () => {
		expect(p.parse_with_context("19-80,4,5,20:6-10", "Gen 17:5").osis_and_indices()).toEqual([
			{
				osis: "Gen.17.19-Gen.17.27,Gen.17.4-Gen.17.5,Gen.20.6-Gen.20.10",
				translations: [""],
				indices: [0, 17]
			}
		]);
		expect(p.parse_with_context("19:2-80,4,5,20:6-10", "Gen 17:5").osis_and_indices()).toEqual([
			{
				osis: "Gen.19.2-Gen.19.38,Gen.19.4-Gen.19.5,Gen.20.6-Gen.20.10",
				translations: [""],
				indices: [0, 19]
			}
		]);
	});
	it("should handle translations", () => {
		expect(p.parse_with_context("15", "3 John 14 NIV").osis_and_indices()).toEqual([
			{
				osis: "3John.1.15",
				translations: [""],
				indices: [0, 2]
			}
		]);
		expect(p.parse_with_context("15 NIV", "3 John 14 NIV").osis_and_indices()).toEqual([]);
	});
	it("should handle unusual cases", () => {
		expect(p.parse_with_context("-16", "Gen 14").osis_and_indices()).toEqual([
			{
				osis: "Gen.16",
				translations: [""],
				indices: [1, 3]
			}
		]);
		expect(p.parse_with_context("Exodus 22", "Gen 14").osis_and_indices()).toEqual([
			{
				osis: "Exod.22",
				translations: [""],
				indices: [0, 9]
			}
		]);
	});
	it("should handle lack of context", () => {
		expect(p.parse_with_context("16", "none").osis_and_indices()).toEqual([]);
		expect(() => {
			p.parse_with_context("16", null).osis_and_indices();
		}).toThrow();
		expect(p.parse_with_context("chapter 22", "see").osis_and_indices()).toEqual([]);
	});
	it("should not find matches in a few places", () => {
		expect(p.parse_with_context("ff", "Gen 17").osis_and_indices()).toEqual([]);
		expect(p.parse_with_context("a", "Gen 17:4").osis_and_indices()).toEqual([]);
		expect(p.parse_with_context("and", "Gen 17:5").osis_and_indices()).toEqual([]);
	});
});

describe("Parsing", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			osis_compaction_strategy: "b",
			sequence_combination_strategy: "combine"
		});
	});
	it("should handle books", () => {
		p.options.book_alone_strategy = "full";
		expect(p.parse("Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen",
				indices: [0, 7],
				translations: [""]
			}
		]);
		expect(p.parse("1\u00a0Cor").osis_and_indices()).toEqual([
			{
				osis: "1Cor",
				indices: [0, 5],
				translations: [""]
			}
		]);
	});
	it("should handle bcs", () => {
		expect(p.parse("Genesis ch 3 (NIV, ESV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.3",
				translations: ["NIV", "ESV"],
				indices: [0, 23]
			}
		]);
		expect(p.parse("Genesis 1:2-ch 7").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.2-Gen.7.24",
				translations: [""],
				indices: [0, 16]
			}
		]);
		expect(p.parse("and Gen 1 5, Jere 2-3 see my Genesis ch 6 (NIV, ESV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.5,Jer.2-Jer.3",
				translations: [""],
				indices: [4, 21]
			}, {
				osis: "Gen.6",
				translations: ["NIV", "ESV"],
				indices: [29, 52]
			}
		]);
		expect(p.parse("Jer.5.ESV").osis_and_indices()).toEqual([
			{
				osis: "Jer.5",
				indices: [0, 9],
				translations: ["ESV"]
			}
		]);
		expect(p.parse("Matt 1 ESV, Matt 2 NIV").osis_and_indices()).toEqual([
			{
				osis: "Matt.1",
				indices: [0, 10],
				translations: ["ESV"]
			}, {
				osis: "Matt.2",
				indices: [12, 22],
				translations: ["NIV"]
			}
		]);
		expect(p.parse("Matt 1 1st to see").osis_and_indices()).toEqual([
			{
				osis: "Matt.1",
				indices: [0, 6],
				translations: [""]
			}
		]);
	});
	it("should handle bvs", () => {
		expect(p.parse("Genesis verse 2").osis()).toEqual("Gen.1.2");
		expect(p.parse("Philemon verse 3").osis()).toEqual("Phlm.1.3");
		expect(p.parse("Philemon 4").osis()).toEqual("Phlm.1.4");
		expect(p.parse("Philemon 5-6").osis()).toEqual("Phlm.1.5-Phlm.1.6");
		expect(p.parse("Genesis verse 7-8").osis()).toEqual("Gen.1.7-Gen.1.8");
		expect(p.parse("Philemon verse9- Philemon verse 10").osis()).toEqual("Phlm.1.9-Phlm.1.10");
		expect(p.parse("Philemon verse 11, Philemon verse 12").osis()).toEqual("Phlm.1.11-Phlm.1.12");
		expect(p.parse("Genesis 13a").osis()).toEqual("Gen.13");
	});
	it("should handle ranges", () => {
		expect(p.parse("Genesis 1-2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.2",
				translations: [""],
				indices: [0, 11]
			}
		]);
		expect(p.parse("Genesis 1-2 ESV, NIV").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.2",
				translations: ["ESV", "NIV"],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Genesis 1-2 [ESV, NIV]").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.2",
				translations: ["ESV", "NIV"],
				indices: [0, 22]
			}
		]);
		expect(p.parse("(Genesis 1-2 (ESV, NIV))").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.2",
				translations: ["ESV", "NIV"],
				indices: [1, 23]
			}
		]);
		expect(p.parse("Genesis 1-Jeremiah 2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Jer.2",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Genesis 1-Jeremiah 2:5").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.1-Jer.2.5",
				translations: [""],
				indices: [0, 22]
			}
		]);
		expect(p.parse("Genesis 1-Jeremiah 2:100").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Jer.2",
				translations: [""],
				indices: [0, 24]
			}
		]);
		expect(p.parse("Genesis 1-1:2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.1-Gen.1.2",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Genesis 1-2:1").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.1-Gen.2.1",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Genesis 1-2:100").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.2",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Philemon 1").osis_and_indices()).toEqual([
			{
				osis: "Phlm",
				translations: [""],
				indices: [0, 10]
			}
		]);
		expect(p.parse("Philemon 1-10").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.1-Phlm.1.10",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Philemon 2-10").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.2-Phlm.1.10",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Philemon 1-1:10").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.1-Phlm.1.10",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Philemon 2-100").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.2-Phlm.1.25",
				translations: [""],
				indices: [0, 14]
			}
		]);
		expect(p.parse("Philemon 1-68").osis_and_indices()).toEqual([
			{
				osis: "Phlm",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Genesis 2-Philemon 2").osis_and_indices()).toEqual([
			{
				osis: "Gen.2.1-Phlm.1.2",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Genesis 2-Philemon 1").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Phlm.1",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Genesis 1:2-Philemon 2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1.2-Phlm.1.2",
				translations: [""],
				indices: [0, 22]
			}
		]);
		expect(p.parse("Philemon 2-Hebrews 2").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.2-Heb.2.18",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Philem 1-Hebrews 2").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1-Heb.2",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("jo 1-2").osis_and_indices()).toEqual([
			{
				osis: "John.1-John.2",
				translations: [""],
				indices: [0, 6]
			}
		]);
		expect(p.parse("Jeremiah 2-Genesis 1").osis_and_indices()).toEqual([
			{
				osis: "Jer.2,Gen.1",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Genesis 51-Jeremiah 6").osis_and_indices()).toEqual([
			{
				osis: "Jer.6",
				translations: [""],
				indices: [11, 21]
			}
		]);
		expect(p.parse("Devotions: John 10:22-42  vs 27 \"My sheep hear my voice").osis_and_indices()).toEqual([
			{
				osis: "John.10.22-John.21.25",
				translations: [""],
				indices: [11, 31]
			}
		]);
	});
	it("should match integers correctly", () => {
		expect(p.parse("Zechariah 2").osis()).toEqual("Zech.2");
		expect(p.parse("Zechariah 12").osis()).toEqual("Zech.12");
		expect(p.parse("Zechariah 12").osis()).toEqual("Zech.12");
		expect(p.parse("Zechariah 120").osis()).toEqual("");
		expect(p.parse("Zechariah 1000").osis()).toEqual("");
		expect(p.parse("Zechariah 1,000").osis()).toEqual("");
		expect(p.parse("Zechariah 12,000").osis()).toEqual("");
		expect(p.parse("Zechariah 120,000").osis()).toEqual("");
	});
	it("should handle book ranges with an `ignore` `book_sequence_strategy` and an `ignore` `book_range_strategy`", () => {
		p.options.book_alone_strategy = "ignore";
		p.options.book_sequence_strategy = "ignore";
		p.options.book_range_strategy = "ignore";
		expect(p.parse("Gen-Jeremiah").osis()).toEqual("");
		expect(p.parse("Genesis 1-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen.1",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Genesis 2-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Jeremiah-Isaiah").osis()).toEqual("");
		expect(p.parse("Genesis-Philemon").osis()).toEqual("");
		expect(p.parse("Genesis-Philemon 1").osis_and_indices()).toEqual([
			{
				osis: "Phlm",
				translations: [""],
				indices: [8, 18]
			}
		]);
		expect(p.parse("Genesis 1-Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.1",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Genesis 2-Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Genesis 2-Philemon").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Genesis-Philemon 2").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.2",
				translations: [""],
				indices: [8, 18]
			}
		]);
		expect(p.parse("Luke-Acts").osis()).toEqual("");
		expect(p.parse("Gen-Exodus 2 (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Exod.2",
				translations: ["NIV"],
				indices: [4, 18]
			}
		]);
		expect(p.parse("Gen 2-Exodus (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: ["NIV"],
				indices: [0, 18]
			}
		]);
	});
	it("should handle book ranges with an `ignore` `book_sequence_strategy` and an `include` `book_range_strategy`", () => {
		p.options.book_alone_strategy = "ignore";
		p.options.book_sequence_strategy = "ignore";
		p.options.book_range_strategy = "include";
		expect(p.parse("Gen-Jeremiah").osis()).toEqual("Gen-Jer");
		expect(p.parse("Genesis 1-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen-Jer",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Genesis 2-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Jer.52",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Jeremiah-Isaiah").osis()).toEqual("");
		expect(p.parse("Genesis-Philemon").osis_and_indices()).toEqual([
			{
				osis: "Gen-Phlm",
				translations: [""],
				indices: [0, 16]
			}
		]);
		expect(p.parse("Genesis-Philemon 1").osis()).toEqual("Gen-Phlm");
		expect(p.parse("Genesis 1-Genesis").osis()).toEqual("Gen");
		expect(p.parse("Genesis 2-Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.50",
				translations: [""],
				indices: [0, 17]
			}
		]);
		expect(p.parse("Genesis 2-Philemon").osis()).toEqual("Gen.2-Phlm.1");
		expect(p.parse("Genesis-Philemon 2").osis()).toEqual("Gen.1.1-Phlm.1.2");
		expect(p.parse("Luke-Acts").osis()).toEqual("Luke-Acts");
		expect(p.parse("Gen-Exodus 2 (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Exod.2",
				translations: ["NIV"],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Gen 2-Exodus (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Exod.40",
				translations: ["NIV"],
				indices: [0, 18]
			}
		]);
	});
	it("should handle book ranges with an `include` `book_sequence_strategy` and an `ignore` `book_range_strategy`", () => {
		p.options.book_alone_strategy = "full";
		p.options.book_sequence_strategy = "include";
		p.options.book_range_strategy = "ignore";
		expect(p.parse("Gen-Jeremiah").osis()).toEqual("");
		expect(p.parse("Genesis 1-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen.1",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Genesis 2-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Jeremiah-Isaiah").osis()).toEqual("Jer,Isa");
		expect(p.parse("Genesis-Philemon").osis_and_indices()).toEqual([]);
		expect(p.parse("Genesis-Philemon 1").osis()).toEqual("Phlm");
		expect(p.parse("Genesis 1-Genesis").osis()).toEqual("Gen.1");
		expect(p.parse("Genesis 2-Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Genesis 2-Philemon").osis()).toEqual("Gen.2");
		expect(p.parse("Genesis-Philemon 2").osis()).toEqual("Phlm.1.2");
		expect(p.parse("Luke-Acts").osis()).toEqual("");
		expect(p.parse("Gen-Exodus 2 (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Exod.2",
				translations: ["NIV"],
				indices: [4, 18]
			}
		]);
		expect(p.parse("Gen 2-Exodus (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.2",
				translations: ["NIV"],
				indices: [0, 18]
			}
		]);
	});
	it("should handle book ranges with an `include` `book_sequence_strategy` and an `include` `book_range_strategy`", () => {
		p.options.book_alone_strategy = "full";
		p.options.book_sequence_strategy = "include";
		p.options.book_range_strategy = "include";
		expect(p.parse("Gen-Jeremiah").osis()).toEqual("Gen-Jer");
		expect(p.parse("Genesis 1-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen-Jer",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Genesis 2-Jeremiah").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Jer.52",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Jeremiah-Isaiah").osis()).toEqual("Jer,Isa");
		expect(p.parse("Genesis-Philemon").osis_and_indices()).toEqual([
			{
				osis: "Gen-Phlm",
				translations: [""],
				indices: [0, 16]
			}
		]);
		expect(p.parse("Genesis-Philemon 1").osis()).toEqual("Gen-Phlm");
		expect(p.parse("Genesis 1-Genesis").osis()).toEqual("Gen");
		expect(p.parse("Genesis 2-Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Gen.50",
				translations: [""],
				indices: [0, 17]
			}
		]);
		expect(p.parse("Genesis 2-Philemon").osis()).toEqual("Gen.2-Phlm.1");
		expect(p.parse("Genesis-Philemon 2").osis()).toEqual("Gen.1.1-Phlm.1.2");
		expect(p.parse("Luke-Acts").osis()).toEqual("Luke-Acts");
		expect(p.parse("Gen-Exodus 2 (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Exod.2",
				translations: ["NIV"],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Gen 2-Exodus (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Gen.2-Exod.40",
				translations: ["NIV"],
				indices: [0, 18]
			}
		]);
	});
	it("should handle sequences", () => {
		expect(p.parse("Genesis 1, 2, 3, 4").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.4",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Genesis 1-3, Jer 2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3,Jer.2",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Genesis 1-3, Philemon 1").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3,Phlm",
				translations: [""],
				indices: [0, 23]
			}
		]);
		expect(p.parse("Genesis 1-3, Philemon 1-2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3,Phlm.1.1-Phlm.1.2",
				translations: [""],
				indices: [0, 25]
			}
		]);
		expect(p.parse("Matt 5:2 John 2").osis()).toEqual("Matt.5.2,John.2");
	});
	it("should handle a `separate` `sequence_combination_strategy`", () => {
		p.options.sequence_combination_strategy = "separate";
		expect(p.parse("Genesis 1-3, Jer 2").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3",
				translations: [""],
				indices: [0, 11]
			}, {
				osis: "Jer.2",
				translations: [""],
				indices: [13, 18]
			}
		]);
		expect(p.parse("Genesis 1-3, Jer 2 skip Phlm 3,4").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3",
				translations: [""],
				indices: [0, 11]
			}, {
				osis: "Jer.2",
				translations: [""],
				indices: [13, 18]
			}, {
				osis: "Phlm.1.3-Phlm.1.4",
				translations: [""],
				indices: [24, 32]
			}
		]);
		expect(p.parse("Eph. 4. Gen, Matt, 6").osis_and_indices()).toEqual([
			{
				osis: "Eph.4",
				indices: [0, 6],
				translations: [""]
			}, {
				osis: "Matt.6",
				indices: [13, 20],
				translations: [""]
			}
		]);
		expect(p.parse("Eph. 4. Gen, Matt, 1cor6-7").osis_and_indices()).toEqual([
			{
				osis: "Eph.4",
				indices: [0, 6],
				translations: [""]
			}, {
				osis: "1Cor.6-1Cor.7",
				indices: [19, 26],
				translations: [""]
			}
		]);
		expect(p.parse("Eph. 4. Gen, Matt, 1cor, 6-7").osis_and_indices()).toEqual([
			{
				osis: "Eph.4",
				indices: [0, 6],
				translations: [""]
			}, {
				osis: "1Cor.6-1Cor.7",
				indices: [19, 28],
				translations: [""]
			}
		]);
		expect(p.parse("Matt 1: 98, 99, 2, 97, 8 John 3:2").osis_and_indices()).toEqual([
			{
				osis: "Matt.1.2",
				indices: [16, 17],
				translations: [""]
			}, {
				osis: "Matt.1.8",
				indices: [23, 24],
				translations: [""]
			}, {
				osis: "John.3.2",
				indices: [25, 33],
				translations: [""]
			}
		]);
		expect(p.parse("Jdg 12:11 break Judges 99,2,KJV").osis_and_indices()).toEqual([
			{
				osis: "Judg.12.11",
				indices: [0, 9],
				translations: [""]
			}, {
				osis: "Judg.2",
				indices: [26, 31],
				translations: ["KJV"]
			}
		]);
	});
	it("should handle an `ignore` `book_sequence_strategy`", () => {
		p.options.book_alone_strategy = "ignore";
		p.options.book_sequence_strategy = "ignore";
		expect(p.parse("This is Isaiah 23:10. Also Isaiah 1:2.").osis_and_indices()).toEqual([
			{
				osis: "Isa.23.10,Isa.1.2",
				translations: [""],
				indices: [8, 37]
			}
		]);
		expect(p.parse("This is Isaiah 23:10. Also Isaiah 1:2 is good.").osis_and_indices()).toEqual([
			{
				osis: "Isa.23.10,Isa.1.2",
				translations: [""],
				indices: [8, 37]
			}
		]);
		expect(p.parse("This is Isaiah 23:10. Genesis Isaiah 1:2 is good.").osis_and_indices()).toEqual([
			{
				osis: "Isa.23.10,Isa.1.2",
				translations: [""],
				indices: [8, 40]
			}
		]);
		expect(p.parse("Genesis, Exodus").osis_and_indices()).toEqual([]);
		expect(p.parse("Isaiah 41:10 is my").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("Isaiah 41:10 ha ha ha").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10",
				indices: [0, 12],
				translations: [""]
			}
		]);
	});
	it("should handle an `include` `book_sequence_strategy` with a `first_chapter` book_alone_strategy`", () => {
		p.options.book_alone_strategy = "first_chapter";
		p.options.book_sequence_strategy = "include";
		expect(p.parse("This is Isaiah 23:10. Also Isaiah 1:2.").osis_and_indices()).toEqual([
			{
				osis: "Isa.1,Isa.23.10,Isa.1.2",
				translations: [""],
				indices: [5, 37]
			}
		]);
		expect(p.parse("This is Isaiah 23:10. Also Isaiah 1:2 is good.").osis_and_indices()).toEqual([
			{
				osis: "Isa.1,Isa.23.10,Isa.1.2,Isa.1",
				translations: [""],
				indices: [5, 40]
			}
		]);
		expect(p.parse("This is Isaiah 23:10. Genesis Isaiah 1:2 is good.").osis_and_indices()).toEqual([
			{
				osis: "Isa.1,Isa.23.10,Gen.1,Isa.1.2,Isa.1",
				translations: [""],
				indices: [5, 43]
			}
		]);
		expect(p.parse("Genesis, Exodus").osis_and_indices()).toEqual([
			{
				osis: "Gen.1,Exod.1",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Isaiah 41:10 is my").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10,Isa.1",
				indices: [0, 15],
				translations: [""]
			}
		]);
		expect(p.parse("Isaiah 41:10 ha ha ha").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10,Hab.1,Hab.1,Hab.1",
				indices: [0, 21],
				translations: [""]
			}
		]);
	});
	it("should handle an `include` `book_sequence_strategy` with a `full` book_alone_strategy`", () => {
		p.options.book_alone_strategy = "full";
		p.options.book_sequence_strategy = "include";
		expect(p.parse("This is Isaiah 23:10. Also Isaiah 1:2.").osis_and_indices()).toEqual([
			{
				osis: "Isa,Isa.23.10,Isa.1.2",
				translations: [""],
				indices: [5, 37]
			}
		]);
		expect(p.parse("This is Isaiah 23:10. Also Isaiah 1:2 is good.").osis_and_indices()).toEqual([
			{
				osis: "Isa,Isa.23.10,Isa.1.2,Isa",
				translations: [""],
				indices: [5, 40]
			}
		]);
		expect(p.parse("This is Isaiah 23:10. Genesis Isaiah 1:2 is good.").osis_and_indices()).toEqual([
			{
				osis: "Isa,Isa.23.10,Gen,Isa.1.2,Isa",
				translations: [""],
				indices: [5, 43]
			}
		]);
		expect(p.parse("Genesis, Exodus").osis_and_indices()).toEqual([
			{
				osis: "Gen-Exod",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Isaiah 41:10 is my").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10,Isa",
				indices: [0, 15],
				translations: [""]
			}
		]);
		expect(p.parse("Isaiah 41:10 ha ha ha").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10,Hab,Hab,Hab",
				indices: [0, 21],
				translations: [""]
			}
		]);
	});
	it("should handle `case_sensitive` correctly with `include_apocrypha: true`", () => {
		p.include_apocrypha(false);
		expect(p.parse("Tobit 1").osis()).toEqual("");
		expect(p.parse("sus 1").osis()).toEqual("");
		p.set_options({
			case_sensitive: "books"
		});
		p.include_apocrypha(true);
		expect(p.parse("Tobit 1").osis()).toEqual("Tob.1");
		expect(p.parse("sus 1").osis()).toEqual("");
		p.set_options({
			case_sensitive: "none"
		});
		expect(p.parse("Tobit 1").osis()).toEqual("Tob.1");
		expect(p.parse("sus 1").osis()).toEqual("Sus");
	});
	it("should handle cbs", () => {
		expect(p.parse("Chapter 1 of Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.1",
				indices: [0, 20],
				translations: [""]
			}
		]);
		expect(p.parse("Chapter 1 of Genesis 15").osis()).toEqual("Gen.1,Gen.15");
		expect(p.parse("Chapter 1 of Genesis verse 16").osis()).toEqual("Gen.1.16");
		expect(p.parse("Chapter 1 of Genesis, verse 17").osis()).toEqual("Gen.1.17");
		expect(p.parse("Chapter 1 of Genesis, verses 18-19").osis()).toEqual("Gen.1.18-Gen.1.19");
		expect(p.parse("Chapter 1 of Genesis, verses 18-19:4").osis()).toEqual("Gen.1.18-Gen.19.4");
		expect(p.parse("Genesis chapter 3 of Mark").osis()).toEqual("Gen.3");
		expect(p.parse("1st ch. of Mark").osis()).toEqual("Mark.1");
		expect(p.parse("20nd ch. of the book of Luke").osis()).toEqual("Luke.20");
		expect(p.parse("119th chapter of the book of Psalms verses 23-25").osis()).toEqual("Ps.119.23-Ps.119.25");
		expect(p.parse("119 th ch. of the book of Psalms").osis()).toEqual("");
		expect(p.parse("4th chapter of Galatians, 1-6 ").osis()).toEqual("Gal.4,Gal");
	});
	it("should handle cb ranges", () => {
		expect(p.parse("Chapters 1-3 of Genesis").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3",
				indices: [0, 23],
				translations: [""]
			}
		]);
		expect(p.parse("Chapters 1-4 of Genesis 15").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.4,Gen.15",
				indices: [0, 26],
				translations: [""]
			}
		]);
		expect(p.parse("Chs. 1 to 5 of Genesis verse 16").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.5,Gen.5.16",
				indices: [0, 31],
				translations: [""]
			}
		]);
		expect(p.parse("Ch. 1 through 6 of Genesis, verse 17").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.6,Gen.6.17",
				indices: [0, 36],
				translations: [""]
			}
		]);
		expect(p.parse("Chapters 1-7 of Genesis, vv. 18-19").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.7,Gen.7.18-Gen.7.19",
				indices: [0, 34],
				translations: [""]
			}
		]);
		expect(p.parse("Chapters 1-8 of Genesis, verses 18-19:4").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.8,Gen.8.18-Gen.19.4",
				indices: [0, 39],
				translations: [""]
			}
		]);
		expect(p.parse("Genesis chapters 3-4 of Mark").osis_and_indices()).toEqual([
			{
				osis: "Gen.3-Gen.4",
				indices: [0, 20],
				translations: [""]
			}
		]);
	});
	it("should handle c_psalms (\"23rd Psalm\")", () => {
		expect(p.parse("23rd Psalm").osis_and_indices()).toEqual([
			{
				osis: "Ps.23",
				indices: [0, 10],
				translations: [""]
			}
		]);
		expect(p.parse("150th Psalm").osis()).toEqual("Ps.150");
		expect(p.parse("1stPsalm").osis()).toEqual("Ps.1");
		expect(p.parse("11th Psalm").osis()).toEqual("Ps.11");
		expect(p.parse("11st Psalm").osis()).toEqual("");
		expect(p.parse("101th Psalm").osis()).toEqual("");
		expect(p.parse("101st Psalm").osis()).toEqual("Ps.101");
		expect(p.parse("111th Psalm").osis()).toEqual("Ps.111");
		expect(p.parse("111st Psalm").osis()).toEqual("");
		expect(p.parse("121st Psalm").osis()).toEqual("Ps.121");
		expect(p.parse("122st Psalm").osis()).toEqual("");
		expect(p.parse("122th Psalm").osis()).toEqual("");
		expect(p.parse("113st Psalm").osis()).toEqual("");
		expect(p.parse("113rd Psalm").osis()).toEqual("");
		expect(p.parse("113th Psalm").osis()).toEqual("Ps.113");
		expect(p.parse("103th Psalm").osis()).toEqual("");
		expect(p.parse("103rd Psalm").osis()).toEqual("Ps.103");
		expect(p.parse("122 nd Psalm").osis()).toEqual("Ps.122");
		expect(p.parse("23rd Psalm, 122 nd Psalm").osis()).toEqual("Ps.23,Ps.122");
		expect(p.parse("23rd Psalm, 2 122 nd Psalm").osis()).toEqual("Ps.23,Ps.2,Ps.122");
		expect(p.parse("23rd Psalm vv.3-4, 1st Psalm v3").osis()).toEqual("Ps.23.3-Ps.23.4,Ps.1.3");
		expect(p.parse("23rd Psalm vv.3-4, 1st Psalmverse 3").osis()).toEqual("Ps.23.3-Ps.23.4");
		expect(p.parse("23rd Psalm, verse 6").osis()).toEqual("Ps.23.6");
		expect(p.parse("23rd Psalm, verses 2-3").osis()).toEqual("Ps.23.2-Ps.23.3");
		expect(p.parse("23rd Psalm, verses 2 and 4").osis()).toEqual("Ps.23.2,Ps.23.4");
	});
	it("should handle translation sequences", () => {
		p.parse("Genesis 5 (NIV, ESV, KJV, NIRV, NAS)");
		expect(p.entities.length).toEqual(2);
		expect(p.entities[0].passages[0].translations.length).toEqual(5);
		expect(p.osis_and_translations()).toEqual([["Gen.5", "NIV,ESV,KJV,NIRV,NASB"]]);
		p.parse("Jer 1 NIV, Genesis 50, TNIV, Ge 6");
		expect(p.entities.length).toEqual(5);
		expect(p.entities[0].passages[0].translations[0].osis).toEqual("NIV");
		expect(p.entities[2].passages[0].translations[0].osis).toEqual("TNIV");
		expect(p.entities[4].passages[0].translations).not.toBeDefined();
		expect(p.osis_and_translations()).toEqual([["Jer.1", "NIV"], ["Gen.50", "TNIV"], ["Gen.6", ""]]);
		expect(p.parse("Matt 1 ESV 2-3 NIV").osis_and_translations()).toEqual([["Matt.1", "ESV"], ["Matt.2-Matt.3", "NIV"]]);
		p.set_options({
			book_alone_strategy: "full"
		});
		expect(p.parse("Rom amp A 2 amp 3").parsed_entities()).toEqual([
			{
				osis: "Rom",
				indices: [0, 7],
				translations: ["AMP"],
				entity_id: 0,
				entities: [
					{
						osis: "Rom",
						type: "b",
						indices: [0, 3],
						translations: ["AMP"],
						start: {
							b: "Rom",
							c: 1,
							v: 1
						},
						end: {
							b: "Rom",
							c: 16,
							v: 27
						},
						enclosed_indices: undefined,
						entity_id: 0,
						entities: [
							{
								start: {
									b: "Rom",
									c: 1,
									v: 1
								},
								end: {
									b: "Rom",
									c: 16,
									v: 27
								},
								valid: {
									valid: true,
									messages: {}
								},
								translations: [
									{
										translation: "amp",
										system: "default",
										osis: "AMP"
									}
								],
								type: "b",
								absolute_indices: [0, 3]
							}
						]
					}
				]
			}
		]);
/*		expect(p.parse("Matthew 3:1 NIV 12 7:1").osis_and_indices()).toEqual([
			{
				osis: "Matt.3.1",
				translations: ["NIV"],
				indices: [0, 15]
			}, {
				osis: "Matt.3.12",
				translations: [""],
				indices: [16, 18]
			}, {
				osis: "Matt.7.1",
				translations: [""],
				indices: [19, 22]
			}
		]);
*/	});
	it("should handle translations preceded by various bcv types", () => {
		p.set_options({
			book_alone_strategy: "full",
			book_range_strategy: "include"
		});
		expect(p.parse("Psalm 3:title (ESV)").osis_and_indices()).toEqual([
			{
				osis: "Ps.3.1",
				translations: ["ESV"],
				indices: [0, 19]
			}
		]);
		expect(p.parse("1-2 John (ESV)").osis_and_indices()).toEqual([
			{
				osis: "1John-2John",
				translations: ["ESV"],
				indices: [0, 14]
			}
		]);
		expect(p.parse("23rd Psalm (ESV)").osis_and_indices()).toEqual([
			{
				osis: "Ps.23",
				translations: ["ESV"],
				indices: [0, 16]
			}
		]);
		expect(p.parse("23rd Psalm ESV").osis_and_indices()).toEqual([
			{
				osis: "Ps.23",
				translations: ["ESV"],
				indices: [0, 14]
			}
		]);
		expect(p.parse("1-2 Thess (NASB, TNIV )3").osis_and_indices()).toEqual([
			{
				osis: "1Thess-2Thess",
				translations: ["NASB", "TNIV"],
				indices: [0, 23]
			}, {
				osis: "2Thess.3",
				translations: [""],
				indices: [23, 24]
			}
		]);
		expect(p.parse("1-2 Thess (NASB, TNIV )43").osis_and_indices()).toEqual([
			{
				osis: "1Thess-2Thess",
				translations: ["NASB", "TNIV"],
				indices: [0, 23]
			}
		]);
	});
	it("should check ends before start", () => {
		p.reset();
		const psg = p.passage;
		expect(psg.range_get_new_end_value({
			"c": 105
		}, {
			"c": 6
		}, {
			messages: {}
		}, "c")).toEqual(106);
		expect(psg.range_get_new_end_value({
			"c": 105
		}, {
			"c": 106
		}, {
			messages: {}
		}, "c")).toEqual(0);
		expect(psg.range_get_new_end_value({
			"c": 110
		}, {
			"c": 11
		}, {
			messages: {}
		}, "c")).toEqual(111);
		expect(psg.range_get_new_end_value({
			"c": 110
		}, {
			"c": 20
		}, {
			messages: {}
		}, "c")).toEqual(120);
		expect(psg.range_get_new_end_value({
			"c": 111
		}, {
			"c": 10
		}, {
			messages: {}
		}, "c")).toEqual(0);
		expect(psg.range_get_new_end_value({
			"c": 111
		}, {
			"c": 2
		}, {
			messages: {}
		}, "c")).toEqual(112);
		expect(psg.range_get_new_end_value({
			"c": 111
		}, {
			"c": 0
		}, {
			messages: {}
		}, "c")).toEqual(0);
		expect(psg.range_get_new_end_value({
			"c": 11
		}, {
			"c": 4
		}, {
			messages: {}
		}, "c")).toEqual(14);
		expect(psg.range_get_new_end_value({
			"c": 3
		}, {
			"c": 2
		}, {
			messages: {}
		}, "c")).toEqual(0);
		expect(psg.range_get_new_end_value({
			"c": 100
		}, {
			"c": 9
		}, {
			messages: {}
		}, "c")).toEqual(109);
		expect(psg.range_get_new_end_value({
			"c": 100
		}, {
			"c": 19
		}, {
			messages: {}
		}, "c")).toEqual(119);
		expect(psg.range_get_new_end_value({
			"c": 102
		}, {
			"c": 24
		}, {
			messages: {}
		}, "c")).toEqual(124);
		expect(psg.range_get_new_end_value({
			"c": 105
		}, {
			"c": 104
		}, {
			messages: {}
		}, "c")).toEqual(0);
	});
	it("should handle ends before starts (ints)", () => {
		expect(p.parse("Ps 121, 22").osis_and_indices()[0].osis).toEqual("Ps.121,Ps.22");
		expect(p.parse("Ps 121-22").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.122");
		expect(p.parse("Ps 121-2").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.122");
		expect(p.parse("Psalm 121-Gen 2").osis_and_indices()[0].osis).toEqual("Ps.121,Gen.2");
		expect(p.parse("genisis 50-49").osis_and_indices()[0].osis).toEqual("Gen.50,Gen.49");
		expect(p.parse("Gen 28-9").osis_and_indices()[0].osis).toEqual("Gen.28-Gen.29");
		expect(p.parse("Gen 28:1-51:100").osis_and_indices()[0].osis).toEqual("Gen.28-Gen.50");
		expect(p.parse("Gen 28:1-51:1").osis_and_indices()[0].osis).toEqual("Gen.28-Gen.50");
		expect(p.parse("Gen 28-0").osis_and_indices()[0].osis).toEqual("Gen.28");
		expect(p.parse("Gen 1:16-7").osis_and_indices()[0].osis).toEqual("Gen.1.16-Gen.1.17");
		expect(p.parse("ps119 170-1").osis_and_indices()[0].osis).toEqual("Ps.119.170-Ps.119.171");
		expect(p.parse("phlm 1:12-3").osis_and_indices()[0].osis).toEqual("Phlm.1.12-Phlm.1.13");
		expect(p.parse("phlm 12-3").osis_and_indices()[0].osis).toEqual("Phlm.1.12-Phlm.1.13");
	});
	it("should handle ends before starts (cvs)", () => {
		expect(p.parse("Ps 121-22:4").osis_and_indices()[0].osis).toEqual("Ps.121.1-Ps.122.4");
		expect(p.parse("Ps 121-6:4").osis_and_indices()[0].osis).toEqual("Ps.121.1-Ps.126.4");
		expect(p.parse("Ps 121-36:4").osis_and_indices()[0].osis).toEqual("Ps.121.1-Ps.136.4");
		expect(p.parse("Ps 21-0:4").osis_and_indices()[0].osis).toEqual("Ps.21");
		expect(p.parse("Proverbs 31:30-31:1").osis()).toEqual("Prov.31.30,Prov.31.1");
		expect(p.parse("Proverbs 31:30-1:1").osis()).toEqual("Prov.31.30,Prov.1.1");
		expect(p.parse("Proverbs 31:30-30:1").osis()).toEqual("Prov.31.30,Prov.30.1");
		expect(p.parse("Ps 21:2-1:4").osis_and_indices()[0].osis).toEqual("Ps.21.2,Ps.1.4");
		expect(p.parse("Ps 21:6-1:4").osis_and_indices()[0].osis).toEqual("Ps.21.6,Ps.1.4");
		expect(p.parse("Ps 22:6-1:4").osis_and_indices()[0].osis).toEqual("Ps.22.6,Ps.1.4");
		expect(p.parse("Ps 21:6-2:4").osis_and_indices()[0].osis).toEqual("Ps.21.6-Ps.22.4");
		expect(p.parse("Ps 21:6-19:4,3:5").osis_and_indices()[0].osis).toEqual("Ps.21.6,Ps.19.4,Ps.3.5");
	});
	it("should handle ends before starts (verses)", () => {
		expect(p.parse("Ps 119:125-24a").osis_and_indices()[0].osis).toEqual("Ps.119.125,Ps.119.24");
		expect(p.parse("Ps 119:125-4a").osis_and_indices()[0].osis).toEqual("Ps.119.125,Ps.119.4");
		expect(p.parse("Ps 119:125-26a").osis_and_indices()[0].osis).toEqual("Ps.119.125-Ps.119.126");
		expect(p.parse("Ps 119:125-6a").osis_and_indices()[0].osis).toEqual("Ps.119.125-Ps.119.126");
		expect(p.parse("Ps 119:16-4a").osis_and_indices()[0].osis).toEqual("Ps.119.16,Ps.119.4");
		expect(p.parse("Ps 119:16-7a").osis_and_indices()[0].osis).toEqual("Ps.119.16-Ps.119.17");
		expect(p.parse("Ps 119:6-4a,3:5").osis_and_indices()[0].osis).toEqual("Ps.119.6,Ps.119.4,Ps.3.5");
		expect(p.parse("Ps 119:6-7a,3:5").osis_and_indices()[0].osis).toEqual("Ps.119.6-Ps.119.7,Ps.3.5");
	});
	it("should handle ffs", () => {
		expect(p.parse("Gen5ff").osis_and_indices()).toEqual([
			{
				osis: "Gen.5-Gen.50",
				translations: [""],
				indices: [0, 6]
			}
		]);
		expect(p.parse("Gen 6ff").osis_and_indices()).toEqual([
			{
				osis: "Gen.6-Gen.50",
				translations: [""],
				indices: [0, 7]
			}
		]);
		expect(p.parse("Ps 121ff").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.150");
		expect(p.parse("Ps 121:1ff .").osis_and_indices()[0].osis).toEqual("Ps.121");
		expect(p.parse("Ps 121:2f.").osis_and_indices()[0].osis).toEqual("Ps.121.2-Ps.121.8");
		expect(p.parse("ge 1 ff").osis_and_indices()[0].osis).toEqual("Gen");
		expect(p.parse("Phm 1ff").osis_and_indices()[0].osis).toEqual("Phlm");
		expect(p.parse("Phm 1:1ff").osis_and_indices()[0].osis).toEqual("Phlm");
		expect(p.parse("Phm 1:2ff").osis_and_indices()[0].osis).toEqual("Phlm.1.2-Phlm.1.25");
		expect(p.parse("Phm 2ff").osis_and_indices()[0].osis).toEqual("Phlm.1.2-Phlm.1.25");
		expect(p.parse("Phm v. 3ff").osis_and_indices()[0].osis).toEqual("Phlm.1.3-Phlm.1.25");
		expect(p.parse("ge 50f").osis_and_indices()[0]).toEqual({
			osis: "Gen.50",
			indices: [0, 6],
			translations: [""]
		});
		expect(p.parse("ge 50:60ff").osis_and_indices()[0]).toEqual(void 0);
		expect(p.parse("Ps 121-2ff").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.150");
		expect(p.parse("Ps 121-122:3ff").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.122");
		expect(p.parse("Phm 1-4ff").osis_and_indices()[0].osis).toEqual("Phlm");
		expect(p.parse("Phm 1:1-4 ff").osis_and_indices()[0].osis).toEqual("Phlm");
		expect(p.parse("Phm 1:2-4ff").osis_and_indices()[0].osis).toEqual("Phlm.1.2-Phlm.1.25");
		expect(p.parse("Phm 2-4ff").osis_and_indices()[0].osis).toEqual("Phlm.1.2-Phlm.1.25");
		expect(p.parse("ge 50-50f").osis_and_indices()[0]).toEqual({
			osis: "Gen.50",
			indices: [0, 9],
			translations: [""]
		});
		expect(p.parse("Ps 121ff-2ff").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.150,Ps.2-Ps.150");
		expect(p.parse("Ps 121ff-122:3ff").osis_and_indices()[0].osis).toEqual("Ps.121-Ps.150,Ps.122.3-Ps.122.9");
		expect(p.parse("Phm 1ff-4ff").osis_and_indices()[0].osis).toEqual("Phlm,Phlm.1.4-Phlm.1.25");
		expect(p.parse("Phm 1:1ff-4ff").osis_and_indices()[0].osis).toEqual("Phlm,Phlm.1.4-Phlm.1.25");
		expect(p.parse("Phm 1:2ff-4ff").osis_and_indices()[0].osis).toEqual("Phlm.1.2-Phlm.1.25,Phlm.1.4-Phlm.1.25");
		expect(p.parse("Phm 2ff-4ff").osis_and_indices()[0].osis).toEqual("Phlm.1.2-Phlm.1.25,Phlm.1.4-Phlm.1.25");
		expect(p.parse("ge 50f-50f").osis_and_indices()[0]).toEqual({
			osis: "Gen.50,Gen.50",
			indices: [0, 10],
			translations: [""]
		});
		expect(p.parse("ge 50:1 forever").osis_and_indices()[0]).toEqual({
			osis: "Gen.50.1",
			indices: [0, 7],
			translations: [""]
		});
		expect(p.parse("ge 50:1 fa").osis_and_indices()[0]).toEqual({
			osis: "Gen.50.1",
			indices: [0, 7],
			translations: [""]
		});
		expect(p.parse("so f").osis_and_indices()).toEqual([]);
		expect(p.parse("and 1 COR 11: 5 FF.").osis_and_indices()).toEqual([
			{
				osis: "1Cor.11.5-1Cor.11.34",
				indices: [4, 19],
				translations: [""]
			}
		]);
		expect(p.parse("and 1 COR 11: 5 FF").osis_and_indices()).toEqual([
			{
				osis: "1Cor.11.5-1Cor.11.34",
				indices: [4, 18],
				translations: [""]
			}
		]);
		expect(p.parse("Eccl 10:2-99ff").osis_and_indices()).toEqual([
			{
				osis: "Eccl.10.2-Eccl.10.20",
				indices: [0, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Eccl 10:21ff").osis_and_indices()).toEqual([]);
	});
	it("should handle zeroes as errors", () => {
		p.options.zero_chapter_strategy = "error";
		p.options.zero_verse_strategy = "error";
		expect(p.parse("Hosea 2:0").osis()).toEqual("");
		expect(p.parse("Hosea 0:2").osis()).toEqual("");
		expect(p.parse("Hosea 2:2-3:0").osis()).toEqual("Hos.2.2");
		expect(p.parse("Hosea 2:0-3:0").osis()).toEqual("");
		expect(p.parse("Hosea 2, 0").osis()).toEqual("Hos.2");
		expect(p.parse("Hosea 2-0").osis()).toEqual("Hos.2");
		expect(p.parse("Hosea 2:2, 0").osis()).toEqual("Hos.2.2");
		expect(p.parse("Phlm 0:2").osis()).toEqual("");
		expect(p.parse("Phlm 0").osis()).toEqual("");
		expect(p.parse("Phlm 0-0").osis()).toEqual("");
	});
	it("should handle zeroes as chapter upgrades", () => {
		p.options.zero_chapter_strategy = "upgrade";
		expect(p.parse("Hosea 2:0").osis()).toEqual("");
		expect(p.parse("Hosea 0:2").osis()).toEqual("Hos.1.2");
		expect(p.parse("Hosea 2:2-3:0").osis()).toEqual("Hos.2.2");
		expect(p.parse("Hosea 2:0-3:0").osis()).toEqual("");
		expect(p.parse("Hosea 2, 0").osis()).toEqual("Hos.2,Hos.1");
		expect(p.parse("Hosea 2-0").osis()).toEqual("Hos.2,Hos.1");
		expect(p.parse("Hosea 2:2, 0").osis()).toEqual("Hos.2.2");
		expect(p.parse("Phlm 0:2").osis()).toEqual("Phlm.1.2");
		expect(p.parse("Phlm 0").osis()).toEqual("Phlm");
		expect(p.parse("Phlm 0-0").osis()).toEqual("Phlm");
	});
	it("should handle zeroes as verse upgrades", () => {
		p.set_options({
			zero_verse_strategy: "upgrade"
		});
		expect(p.parse("Hosea 2:0").osis()).toEqual("Hos.2.1");
		expect(p.parse("Hosea 0:2").osis()).toEqual("");
		expect(p.parse("Hosea 2:2-3:0").osis()).toEqual("Hos.2.2-Hos.3.1");
		expect(p.parse("Hosea 2:0-3:0").osis()).toEqual("Hos.2.1-Hos.3.1");
		expect(p.parse("Hosea 2, 0").osis()).toEqual("Hos.2");
		expect(p.parse("Hosea 2-0").osis()).toEqual("Hos.2.1");
		expect(p.parse("Hosea 2:2, 0").osis()).toEqual("Hos.2.2,Hos.2.1");
		expect(p.parse("Phlm 0:2").osis()).toEqual("");
		expect(p.parse("Phlm 0").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Phlm 0-0").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Ps 20:1-0:4").osis()).toEqual("Ps.20.1");
	});
	it("should handle zeroes as allowed verses", () => {
		p.set_options({
			zero_verse_strategy: "allow"
		});
		expect(p.parse("Hosea 2:0").osis()).toEqual("Hos.2.0");
		expect(p.parse("Hosea 0:2").osis()).toEqual("");
		expect(p.parse("Hosea 2:2-3:0").osis()).toEqual("Hos.2.2-Hos.3.0");
		expect(p.parse("Hosea 2:0-3:0").osis()).toEqual("Hos.2.0-Hos.3.0");
		expect(p.parse("Hosea 2, 0").osis()).toEqual("Hos.2");
		expect(p.parse("Hosea 2-0").osis()).toEqual("Hos.2.0");
		expect(p.parse("Hosea 2:2, 0").osis()).toEqual("Hos.2.2,Hos.2.0");
		expect(p.parse("Phlm 0:2").osis()).toEqual("");
		expect(p.parse("Phlm 0").osis()).toEqual("Phlm.1.0");
		expect(p.parse("Phlm 0-0").osis()).toEqual("Phlm.1.0");
		expect(p.parse("Ps 20:1-0:4").osis()).toEqual("Ps.20.1");
	});
	it("should handle zeroes as both upgrades", () => {
		p.options.zero_chapter_strategy = "upgrade";
		p.options.zero_verse_strategy = "upgrade";
		expect(p.parse("Hosea 2:0").osis()).toEqual("Hos.2.1");
		expect(p.parse("Hosea 0:2").osis()).toEqual("Hos.1.2");
		expect(p.parse("Hosea 2:2-3:0").osis()).toEqual("Hos.2.2-Hos.3.1");
		expect(p.parse("Hosea 2:0-3:0").osis()).toEqual("Hos.2.1-Hos.3.1");
		expect(p.parse("Hosea 2, 0").osis()).toEqual("Hos.2,Hos.1");
		expect(p.parse("Hosea 2-0").osis()).toEqual("Hos.2.1");
		expect(p.parse("Hosea 2:2, 0").osis()).toEqual("Hos.2.2,Hos.2.1");
		expect(p.parse("Phlm 0:2").osis()).toEqual("Phlm.1.2");
		expect(p.parse("Phlm 0").osis()).toEqual("Phlm");
		expect(p.parse("Phlm 0-0").osis()).toEqual("Phlm");
		expect(p.parse("Ps 20:1-0:4").osis()).toEqual("Ps.20.1,Ps.1.4");
		expect(p.parse("John 1:10-0").osis()).toEqual("John.1.10,John.1.1");
	});
	it("should handle zeroes as chapter upgrade and allowed verse", () => {
		p.options.zero_chapter_strategy = "upgrade";
		p.options.zero_verse_strategy = "allow";
		expect(p.parse("Hosea 2:0").osis()).toEqual("Hos.2.0");
		expect(p.parse("Hosea 0:2").osis()).toEqual("Hos.1.2");
		expect(p.parse("Hosea 2:2-3:0").osis()).toEqual("Hos.2.2-Hos.3.0");
		expect(p.parse("Hosea 2:0-3:0").osis()).toEqual("Hos.2.0-Hos.3.0");
		expect(p.parse("Hosea 2, 0").osis()).toEqual("Hos.2,Hos.1");
		expect(p.parse("Hosea 2-0").osis()).toEqual("Hos.2.0");
		expect(p.parse("Hosea 2:2, 0").osis()).toEqual("Hos.2.2,Hos.2.0");
		expect(p.parse("Phlm 0:2").osis()).toEqual("Phlm.1.2");
		expect(p.parse("Phlm 0").osis()).toEqual("Phlm");
		expect(p.parse("Phlm 0-0").osis()).toEqual("Phlm");
		expect(p.parse("Ps 20:1-0:4").osis()).toEqual("Ps.20.1,Ps.1.4");
	});
	it("should handle a `delete` `captive_end_digits_strategy`", () => {
		p.options.book_alone_strategy = "ignore";
		p.options.captive_end_digits_strategy = "delete";
		expect(p.parse("Rev 2").osis()).toEqual("Rev.2");
		expect(p.parse("Rev 2a").osis()).toEqual("Rev.2");
		expect(p.parse("Rev 2, 3a").osis()).toEqual("Rev.2,Rev.2.3");
		expect(p.parse("Rev 2- 3ab").osis()).toEqual("Rev.2");
		expect(p.parse("Rev 2:1 - 3a").osis()).toEqual("Rev.2.1-Rev.2.3");
		expect(p.parse("Rev 2:1 - 3 * a").osis_and_indices()).toEqual([
			{
				osis: "Rev.2.1-Rev.2.3",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Rev 2:1-3 4a").osis()).toEqual("Rev.2.1-Rev.2.4");
		expect(p.parse("Rev 2:1-2Hi").osis()).toEqual("Rev.2.1-Rev.2.2");
		expect(p.parse("Rev 2:1-2 3Hi").osis()).toEqual("Rev.2.1-Rev.2.2");
		expect(p.parse("Rev 2:1-2 Matt 3Hi").osis()).toEqual("Rev.2.1-Rev.2.2");
		expect(p.parse("Rev 2:1-3 NIV 2 for").osis()).toEqual("Rev.2.1-Rev.2.3");
		expect(p.parse("Rev 2:1-4 NIV 2 to").osis()).toEqual("Rev.2.1-Rev.2.4");
		expect(p.parse("Rev 2:1-4 NIV 2m").osis()).toEqual("Rev.2.1-Rev.2.4");
		expect(p.parse("Rev 2:1-3 NIV*2*").osis()).toEqual("Rev.2.1-Rev.2.3");
		p.options.book_alone_strategy = "include";
		expect(p.parse("Rev 2:1-2 Matt 3Hi").osis()).toEqual("Rev.2.1-Rev.2.2");
	});
	it("should handle an `include` `captive_end_digits_strategy`", () => {
		p.options.captive_end_digits_strategy = "include";
		expect(p.parse("Rev 2").osis()).toEqual("Rev.2");
		expect(p.parse("Rev 2a").osis()).toEqual("Rev.2");
		expect(p.parse("Rev 2, 3a").osis()).toEqual("Rev.2,Rev.2.3");
		expect(p.parse("Rev 2- 3ab").osis()).toEqual("Rev.2-Rev.3");
		expect(p.parse("Rev 2:1 - 3a").osis()).toEqual("Rev.2.1-Rev.2.3");
		expect(p.parse("Rev 2:1 - 3 * a").osis_and_indices()).toEqual([
			{
				osis: "Rev.2.1-Rev.2.3",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Rev 2:1-3 4a").osis()).toEqual("Rev.2.1-Rev.2.4");
		expect(p.parse("Rev 2:1-2Hi").osis()).toEqual("Rev.2.1-Rev.2.2");
		expect(p.parse("Rev 2:1-3 4Hi").osis()).toEqual("Rev.2.1-Rev.2.4");
		expect(p.parse("Rev 2:1-2 Matt 3Hi").osis()).toEqual("Rev.2.1-Rev.2.2,Matt.3");
	});
	it("should handle a `verse` `end_range_digits_strategy`", () => {
		p.options.end_range_digits_strategy = "verse";
		expect(p.parse("Jer 33-11").osis()).toEqual("Jer.33.11");
		expect(p.parse("Heb 13-15").osis()).toEqual("Heb.13.15");
		expect(p.parse("Jer 33-11a").osis()).toEqual("Jer.33.11");
		expect(p.parse("Heb 13-15a").osis()).toEqual("Heb.13.15");
		expect(p.parse("Gal 5-22a").osis()).toEqual("Gal.5.22");
		expect(p.parse("Matt 5- verse 6").osis()).toEqual("Matt.5.6");
		expect(p.parse("Phm 7-8").osis()).toEqual("Phlm.1.7-Phlm.1.8");
		expect(p.parse("Phm 8-7").osis()).toEqual("Phlm.1.8,Phlm.1.7");
		expect(p.parse("Phm 7 to verse 6").osis()).toEqual("Phlm.1.7,Phlm.1.6");
		expect(p.parse("Phm 17 to verse 0").osis()).toEqual("Phlm.1.17");
		expect(p.parse("Phil 2, verse 3:1").osis()).toEqual("Phil.2.1-Phil.3.1");
		expect(p.parse("Phil 2, verse 4:1").osis()).toEqual("Phil.2,Phil.4.1");
		expect(p.parse("Phil 2 to verse 3:1").osis()).toEqual("Phil.2.1-Phil.3.1");
		expect(p.parse("Phil 2 to verse 1:1").osis()).toEqual("Phil.2,Phil.1.1");
	});
	it("should handle a `sequence` `end_range_digits_strategy`", () => {
		p.options.end_range_digits_strategy = "sequence";
		expect(p.parse("Jer 33-11").osis()).toEqual("Jer.33,Jer.11");
		expect(p.parse("Heb 13-15").osis()).toEqual("Heb.13");
		expect(p.parse("Jer 33-11a").osis()).toEqual("Jer.33.1-Jer.33.11");
		expect(p.parse("Heb 13-15a").osis()).toEqual("Heb.13.1-Heb.13.15");
		expect(p.parse("Gal 5-22a").osis()).toEqual("Gal.5.1-Gal.5.22");
		expect(p.parse("Matt 5- verse 6").osis()).toEqual("Matt.5.6");
		expect(p.parse("Phm 8-7").osis()).toEqual("Phlm.1.8,Phlm.1.7");
		expect(p.parse("Phm 7 to verse 6").osis()).toEqual("Phlm.1.7,Phlm.1.6");
		expect(p.parse("Phm 17 to verse 0").osis()).toEqual("Phlm.1.17");
		expect(p.parse("Phil 2, verse 3:1").osis()).toEqual("Phil.2.1-Phil.3.1");
		expect(p.parse("Phil 2, verse 4:1").osis()).toEqual("Phil.2,Phil.4.1");
		expect(p.parse("Phil 2 to verse 3:1").osis()).toEqual("Phil.2.1-Phil.3.1");
		expect(p.parse("Phil 2 to verse 1:1").osis()).toEqual("Phil.2,Phil.1.1");
	});
	it("should handle no matches", () => {
		expect(p.parse("Nothing").osis()).toEqual("");
	});
	it("should handle `bcv_range` hyphens", () => {
		expect(p.parse("1 John-2-3-4").osis_and_indices()).toEqual([
			{
				osis: "1John.2.3-1John.2.4",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("Matt-5-6-7").osis()).toEqual("Matt.5.6-Matt.5.7");
	});
	it("should handle a `combine` `consecutive_combination_strategy`", () => {
		p.set_options({
			consecutive_combination_strategy: "combine"
		});
		expect(p.parse("Genesis 12, 50, NIV, 6 split Matt 4, 5, 6:1-50, ch 8 ESV, MATT 10").osis_and_translations()).toEqual([["Gen.12,Gen.50", "NIV"], ["Gen.6", ""], ["Matt.4-Matt.6,Matt.8", "ESV"], ["Matt.10", ""]]);
		expect(p.parse("Rev 2:1, 2, 3 4Hi").osis()).toEqual("Rev.2.1-Rev.2.3");
	});
	it("should handle a `separate` `consecutive_combination_strategy`", () => {
		p.set_options({
			consecutive_combination_strategy: "separate",
			book_sequence_strategy: "full"
		});
		expect(p.parse("Genesis 12, 50, NIV, 6 split Matt 4, 5, 6:1-50, ch 8 ESV, MATT 10").osis_and_translations()).toEqual([["Gen.12,Gen.50", "NIV"], ["Gen.6", ""], ["Matt.4,Matt.5,Matt.6,Matt.8", "ESV"], ["Matt.10", ""]]);
		expect(p.parse("Philemon verse 11, Philemon verse 12").osis()).toEqual("Phlm.1.11,Phlm.1.12");
		expect(p.parse("Genesis 1, 2, 3, 4").osis_and_indices()).toEqual([
			{
				osis: "Gen.1,Gen.2,Gen.3,Gen.4",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Genesis 1-3, Jer 2 skip Phlm 3,4").osis_and_indices()).toEqual([
			{
				osis: "Gen.1-Gen.3,Jer.2",
				translations: [""],
				indices: [0, 18]
			}, {
				osis: "Phlm.1.3,Phlm.1.4",
				translations: [""],
				indices: [24, 32]
			}
		]);
		expect(p.parse("Genesis, Exodus").osis_and_indices()).toEqual([
			{
				osis: "Gen,Exod",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Rev 2:1-3 4a").osis()).toEqual("Rev.2.1-Rev.2.3,Rev.2.4");
		expect(p.parse("Rev 2:1, 2, 3 4Hi").osis()).toEqual("Rev.2.1,Rev.2.2,Rev.2.3");
		expect(p.parse("Reading and reflecting on Philippians 1 & 2. ").osis()).toEqual("Phil.1,Phil.2");
		expect(p.parse("  john 3:16 i memorized it when i was 5.  now i like john 3:16-18..  vs 17 and 18 go with it too. they kinda help/clarify vs 16.").osis()).toEqual("John.3.16,John.3.16-John.3.18,John.3.17,John.3.18");
		expect(p.parse("Matt 4:8/9.").osis()).toEqual("Matt.4.8,Matt.4.9");
		expect(p.parse("Second Reading - Gen 22:1-2, 9a, 10-13, 15-18 ...   ").osis()).toEqual("Gen.22.1-Gen.22.2,Gen.22.9,Gen.22.10-Gen.22.13,Gen.22.15-Gen.22.18");
		expect(p.parse("John 3:16~17").osis()).toEqual("John.3.16,John.3.17");
		expect(p.parse("Proverbs 15, Mark 7,8 and 9").osis()).toEqual("Prov.15,Mark.7,Mark.8,Mark.9");
		expect(p.parse("-Job 32:21-22-Col 3:25-Deut 10:17-Ja 2:1-4-Lev 19:15-Rom 2:9-11-Acts 10:34-35-Dt 1:17").osis()).toEqual("Job.32.21-Job.32.22,Col.3.25,Deut.10.17,Jas.2.1-Jas.2.4,Lev.19.15-Rom.2.9,Rom.2.11,Acts.10.34,Acts.10.35,Deut.1.17");
		expect(p.parse("1John3v21,22; 1John5v14,15").osis()).toEqual("1John.3.21,1John.3.22,1John.5.14,1John.5.15");
		expect(p.parse("Deuteronomy 6,7Ecclesiastes 2John 19").osis()).toEqual("Deut.6,Deut.7,Eccl");
		expect(p.parse("Jas 1:26,27. Vs 26- bridle.").osis()).toEqual("Jas.1.26,Jas.1.27,Jas.1.26");
		expect(p.parse("1 Corinthians 4-7 and 8.").osis()).toEqual("1Cor.4-1Cor.7,1Cor.8");
		expect(p.parse("Mark3.4.5.6.7.8.9.10.11").osis()).toEqual("Mark.3.4,Mark.5.6,Mark.7.8,Mark.9.10,Mark.9.11");
		expect(p.parse("Deut 28 - v66-67 is a real").osis()).toEqual("Deut.28.66-Deut.28.67,Isa");
	});
	it("should handle a `combine` `consecutive_combination_strategy` and a `separate` `sequence_combination_strategy`", () => {
		p.set_options({
			consecutive_combination_strategy: "combine",
			sequence_combination_strategy: "separate"
		});
		expect(p.parse("2 Chronicles 32:32,33").osis()).toEqual("2Chr.32.32-2Chr.32.33");
		expect(p.parse("2 Chronicles 31, 32").osis()).toEqual("2Chr.31-2Chr.32");
		expect(p.parse("Isa 7:14 (Matt 1:23); 9:1, 2 (Matt 4:15, 16); 22:1").osis()).toEqual("Isa.7.14,Matt.1.23,Matt.9.1-Matt.9.2,Matt.4.15-Matt.4.16,Matt.22.1");
	});
	it("should handle a `separate` `consecutive_combination_strategy` and a `combine` `sequence_combination_strategy`", () => {
		p.set_options({
			consecutive_combination_strategy: "separate",
			sequence_combination_strategy: "combine"
		});
		expect(p.parse("2 Chronicles 32:32,33").osis()).toEqual("2Chr.32.32,2Chr.32.33");
		expect(p.parse("2 Chronicles 31, 32").osis()).toEqual("2Chr.31,2Chr.32");
		expect(p.parse("Isa 7:14 (Matt 1:23); 9:1, 2 (Matt 4:15, 16); 22:1").osis()).toEqual("Isa.7.14,Matt.1.23,Matt.9.1,Matt.9.2,Matt.4.15,Matt.4.16,Matt.22.1");
	});
	it("should handle B,C,V as a special case", () => {
		expect(p.parse("Matt, 5, 6").osis_and_indices()).toEqual([
			{
				osis: "Matt.5.6",
				indices: [0, 10],
				translations: [""]
			}
		]);
		expect(p.parse("Matt,5,6, 7, 8").osis_and_indices()).toEqual([
			{
				osis: "Matt.5.6-Matt.5.8",
				indices: [0, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Matt, 5, 6, 9, 10,").osis_and_indices()).toEqual([
			{
				osis: "Matt.5.6,Matt.5.9-Matt.5.10",
				indices: [0, 17],
				translations: [""]
			}
		]);
		expect(p.parse("Matt, 5, 6:1").osis_and_indices()).toEqual([
			{
				osis: "Matt.5.1-Matt.6.1",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("Matt, 5, 7:1").osis_and_indices()).toEqual([
			{
				osis: "Matt.5,Matt.7.1",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("Matt, 7:12, 6:3").osis_and_indices()).toEqual([
			{
				osis: "Matt.7.12,Matt.6.3",
				indices: [0, 15],
				translations: [""]
			}
		]);
		expect(p.parse("John Matt, 7,12, 6:3 Mark").osis_and_indices()).toEqual([
			{
				osis: "Matt.7.12,Matt.6.3",
				indices: [5, 20],
				translations: [""]
			}
		]);
		expect(p.parse("Matt, 5").osis_and_indices()).toEqual([
			{
				osis: "Matt.5",
				indices: [0, 7],
				translations: [""]
			}
		]);
		expect(p.parse("John 2-3, Gen, Matt, 5").osis_and_indices()).toEqual([
			{
				osis: "John.2-John.3,Matt.5",
				indices: [0, 22],
				translations: [""]
			}
		]);
		expect(p.parse("John 2-3, Gen, Matt, 5, 6").osis_and_indices()).toEqual([
			{
				osis: "John.2-John.3,Matt.5.6",
				indices: [0, 25],
				translations: [""]
			}
		]);
	});
	it("should handle an `include` `invalid_sequence_strategy", () => {
		p.set_options({
			invalid_sequence_strategy: "include"
		});
		expect(p.parse("Gen 99, Ha 2").osis_and_indices()).toEqual([
			{
				osis: "Hab.2",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Genesis 51-Jeremiah 6").osis_and_indices()).toEqual([
			{
				osis: "Jer.6",
				translations: [""],
				indices: [0, 21]
			}
		]);
		expect(p.parse("Genesis 51, 50").osis_and_indices()).toEqual([
			{
				osis: "Gen.50",
				translations: [""],
				indices: [0, 14]
			}
		]);
		expect(p.parse("Mk 2, Genesis 51, 50, 51, 47").osis_and_indices()).toEqual([
			{
				osis: "Mark.2,Gen.50,Gen.47",
				translations: [""],
				indices: [0, 28]
			}
		]);
		expect(p.parse("Is 67 Mk 2, Genesis 51, 47, Hebrews 51, 7:1").osis_and_indices()).toEqual([
			{
				osis: "Mark.2,Gen.47,Heb.7.1",
				translations: [""],
				indices: [0, 43]
			}
		]);
	});
	it("should handle an `ignore` `invalid_sequence_strategy", () => {
		p.set_options({
			invalid_sequence_strategy: "ignore"
		});
		expect(p.parse("Gen 99, Ha 2").osis_and_indices()).toEqual([
			{
				osis: "Hab.2",
				translations: [""],
				indices: [8, 12]
			}
		]);
		expect(p.parse("Genesis 51, 50").osis_and_indices()).toEqual([
			{
				osis: "Gen.50",
				translations: [""],
				indices: [0, 14]
			}
		]);
		expect(p.parse("Mk 2, Genesis 51, 50, 51, 47").osis_and_indices()).toEqual([
			{
				osis: "Mark.2,Gen.50,Gen.47",
				translations: [""],
				indices: [0, 28]
			}
		]);
		expect(p.parse("Is 67 Mk 2, Genesis 51, 47, Hebrews 51, 7:1").osis_and_indices()).toEqual([
			{
				osis: "Mark.2,Gen.47,Heb.7.1",
				translations: [""],
				indices: [6, 43]
			}
		]);
	});
	it("should handle an `include` `invalid_passage_strategy`", () => {
		p.set_options({
			invalid_passage_strategy: "include"
		});
		expect(p.parse("ge 50:60ff").parsed_entities()[0].entities[0].entities[0].valid.messages).toEqual({
			start_verse_not_exist: 26
		});
		expect(p.parse("ge 51:1").osis_and_indices()).toEqual([]);
		expect(p.parse("matt 29-34").osis_and_translations()).toEqual([]);
		expect(p.parse("heb 0:6").osis()).toEqual("");
		expect(p.parse("1 Kings 45, 12:3").osis_and_translations()).toEqual([["1Kgs.12.3", ""]]);
		expect(p.parse("ha 67").parsed_entities()[0].entities).toEqual([
			{
				osis: "",
				type: "bc",
				indices: [0, 5],
				translations: [""],
				start: {
					b: "Hab",
					c: 67
				},
				end: {
					b: "Hab",
					c: 67
				},
				entity_id: 0,
				enclosed_indices: void 0,
				entities: [
					{
						start: {
							b: "Hab",
							c: 67
						},
						end: {
							b: "Hab",
							c: 67
						},
						valid: {
							valid: false,
							messages: {
								start_chapter_not_exist: 3
							}
						},
						alternates: [
							{
								start: {
									b: "Hag",
									c: 67
								},
								end: {
									b: "Hag",
									c: 67
								},
								valid: {
									valid: false,
									messages: {
										start_chapter_not_exist: 2
									}
								}
							}
						],
						type: "bc",
						absolute_indices: [0, 5]
					}
				]
			}
		]);
	});
	it("should handle `pre_book` ranges", () => {
		p.set_options({
			book_alone_strategy: "full"
		});
		p.set_options({
			book_sequence_strategy: "ignore"
		});
		p.set_options({
			book_range_strategy: "include"
		});
		expect(p.parse("1-2 Sam").osis_and_indices()).toEqual([
			{
				osis: "1Sam-2Sam",
				translations: [""],
				indices: [0, 7]
			}
		]);
		expect(p.parse("2-3 John").osis_and_indices()).toEqual([
			{
				osis: "2John-3John",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("First through Third John").osis_and_indices()).toEqual([
			{
				osis: "1John-3John",
				translations: [""],
				indices: [0, 24]
			}
		]);
		expect(p.parse("1-2 Sam 3").osis_and_indices()).toEqual([
			{
				osis: "2Sam.3",
				translations: [""],
				indices: [2, 9]
			}
		]);
		expect(p.parse("Ruth 1-2 Sam").osis_and_indices()).toEqual([
			{
				osis: "Ruth-2Sam",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Ruth 1-2 Chr").osis_and_indices()).toEqual([
			{
				osis: "Ruth-2Chr",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Joel 1-2 Chr").osis_and_indices()).toEqual([
			{
				osis: "Joel.1",
				translations: [""],
				indices: [0, 6]
			}
		]);
		expect(p.parse("1-2 Sam, 1-2 Kings, Ruth 3, 1-3 John").osis_and_indices()).toEqual([
			{
				osis: "2Sam-2Kgs,Ruth.3,Ruth-3John",
				translations: [""],
				indices: [2, 36]
			}
		]);
		expect(p.parse("1-2 Sam, 1-2 Chronicles, Ruth 3, 1-3 John").osis_and_indices()).toEqual([
			{
				osis: "2Sam-2Chr,Ruth.3,Ruth-3John",
				translations: [""],
				indices: [2, 41]
			}
		]);
		expect(p.parse("Ez 2. Then 1-3 John (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Ezek.2",
				translations: [""],
				indices: [0, 4]
			}, {
				osis: "1John-3John",
				translations: ["NIV"],
				indices: [11, 25]
			}
		]);
		expect(p.parse("1-3 John").osis_and_indices()).toEqual([
			{
				osis: "1John-3John",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("3-3 John").osis_and_indices()).toEqual([
			{
				osis: "3John",
				translations: [""],
				indices: [2, 8]
			}
		]);
		expect(p.parse("1 and 3 John").osis_and_indices()).toEqual([
			{
				osis: "3John",
				translations: [""],
				indices: [6, 12]
			}
		]);
		expect(p.parse("Mark 2. Then 1-3 John (NIV), Revelation 6").osis_and_indices()).toEqual([
			{
				osis: "Mark.2",
				translations: [""],
				indices: [0, 6]
			}, {
				osis: "1John-3John",
				translations: ["NIV"],
				indices: [13, 27]
			}, {
				osis: "Rev.6",
				translations: [""],
				indices: [29, 41]
			}
		]);
		expect(p.parse("Phil 2:4; 1 and 2 Timothy").osis_and_indices()).toEqual([
			{
				osis: "Phil.2.4,Phil.2.1",
				translations: [""],
				indices: [0, 11]
			}
		]);
		expect(p.parse("Phil 2:4; 1-2 Timothy").osis_and_indices()).toEqual([
			{
				osis: "Phil.2.4,Phil.2-2Tim.4",
				translations: [""],
				indices: [0, 21]
			}
		]);
	});
	it("should handle `pre_book` ranges with an `include` `book_sequence_strategy`", () => {
		p.set_options({
			book_alone_strategy: "full"
		});
		p.set_options({
			book_range_strategy: "include"
		});
		p.set_options({
			book_sequence_strategy: "include"
		});
		expect(p.parse("1-2 Sam").osis_and_indices()).toEqual([
			{
				osis: "1Sam-2Sam",
				translations: [""],
				indices: [0, 7]
			}
		]);
		expect(p.parse("2-3 John").osis_and_indices()).toEqual([
			{
				osis: "2John-3John",
				translations: [""],
				indices: [0, 8]
			}
		]);
		expect(p.parse("First through Third John").osis_and_indices()).toEqual([
			{
				osis: "1John-3John",
				translations: [""],
				indices: [0, 24]
			}
		]);
		expect(p.parse("1-2 Sam 3").osis_and_indices()).toEqual([
			{
				osis: "2Sam.3",
				translations: [""],
				indices: [2, 9]
			}
		]);
		expect(p.parse("Numbers 1-2 Sam").osis_and_indices()).toEqual([
			{
				osis: "Num-2Sam",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Ruth 1-2 Sam").osis_and_indices()).toEqual([
			{
				osis: "Ruth-2Sam",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Ruth 1-2 Chr").osis_and_indices()).toEqual([
			{
				osis: "Ruth-2Chr",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Joel 1-2 Chr").osis_and_indices()).toEqual([
			{
				osis: "Joel.1,2Chr",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Ez 2. Then 1-3 John (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Ezek.2",
				translations: [""],
				indices: [0, 4]
			}, {
				osis: "1John-3John",
				translations: ["NIV"],
				indices: [11, 25]
			}
		]);
		expect(p.parse("Mark 2. Then 1-3 John (NIV), Revelation 6").osis_and_indices()).toEqual([
			{
				osis: "Mark.2",
				translations: [""],
				indices: [0, 6]
			}, {
				osis: "1John-3John",
				translations: ["NIV"],
				indices: [13, 27]
			}, {
				osis: "Rev.6",
				translations: [""],
				indices: [29, 41]
			}
		]);
		expect(p.parse("1-2 Sam, 1-2 Kings, Ruth 3, 1-3 John").osis_and_indices()).toEqual([
			{
				osis: "2Sam,2Sam-2Kgs,Ruth.3,Ruth-3John",
				translations: [""],
				indices: [2, 36]
			}
		]);
		expect(p.parse("1-2 Sam, 1-2 Chronicles, Ruth 3, 1-3 John").osis_and_indices()).toEqual([
			{
				osis: "2Sam,2Sam-2Chr,Ruth.3,Ruth-3John",
				translations: [""],
				indices: [2, 41]
			}
		]);
	});
	it("should handle Psalm titles", () => {
		expect(p.parse("Ps 3:2, ch 119 title, ch23").osis()).toEqual("Ps.3.2,Ps.119.1,Ps.23");
		expect(p.parse("Ps 3, Title, 4, 6-7 title").osis()).toEqual("Ps.3.1,Ps.3.4,Ps.3.6-Ps.7.1");
		expect(p.parse("Ps 3title4").osis()).toEqual("Ps.3.1,Ps.3.4");
		expect(p.parse("Ps 3title-4").osis()).toEqual("Ps.3.1-Ps.3.4");
		expect(p.parse("Ps 3title-ch 4").osis()).toEqual("Ps.3-Ps.4");
		expect(p.parse("Ps 76 titles").osis_and_indices()).toEqual([
			{
				osis: "Ps.76",
				translations: [""],
				indices: [0, 5]
			}
		]);
		expect(p.parse("Ps 76 titles, 4").osis_and_indices()).toEqual([
			{
				osis: "Ps.76",
				translations: [""],
				indices: [0, 5]
			}
		]);
		expect(p.parse("Ps 76 titles, 4, 3 John 2").osis_and_indices()).toEqual([
			{
				osis: "Ps.76",
				translations: [""],
				indices: [0, 5]
			}, {
				osis: "3John.1.2",
				translations: [""],
				indices: [17, 25]
			}
		]);
		expect(p.parse("Ps 76 titles-3").osis_and_indices()).toEqual([
			{
				osis: "Ps.76",
				translations: [""],
				indices: [0, 5]
			}
		]);
		expect(p.parse("Ps 3:TITLE, 4 TITLE, 5: TITLE NIV").osis()).toEqual("Ps.3.1,Ps.4.1,Ps.5.1");
		expect(p.parse("Jo 3, title, 4 NIV").osis()).toEqual("John.3-John.4");
		expect(p.parse("Jo 3, title, 4, Ps 2, 3title.").osis_and_indices()).toEqual([
			{
				osis: "John.3-John.4,Ps.2.1-Ps.3.1",
				translations: [""],
				indices: [0, 28]
			}
		]);
		expect(p.parse("Jo 3, title - 4, Ps 2 title - 3title").osis_and_indices()).toEqual([
			{
				osis: "John.3-John.4,Ps.2.1-Ps.3.1",
				translations: [""],
				indices: [0, 36]
			}
		]);
		expect(p.parse("Acts 2:22, 27. Title").osis_and_indices()).toEqual([
			{
				osis: "Acts.2.22,Acts.2.27",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Acts 2:22-27. Title").osis_and_indices()).toEqual([
			{
				osis: "Acts.2.22-Acts.2.27",
				translations: [""],
				indices: [0, 12]
			}
		]);
		expect(p.parse("Acts 2:22, ch 27. Title").osis_and_indices()).toEqual([
			{
				osis: "Acts.2.22,Acts.27",
				translations: [""],
				indices: [0, 16]
			}
		]);
		expect(p.parse("Philemon 3, 1. Title").osis_and_indices()).toEqual([
			{
				osis: "Phlm.1.3,Phlm.1.1",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("Ps 1;70:title ").osis()).toEqual("Ps.1,Ps.70.1");
		expect(p.parse("2 Timothy 1-10 Title: Encouragement").osis_and_indices()).toEqual([
			{
				osis: "2Tim.1.10",
				translations: [""],
				indices: [0, 14]
			}
		]);
		expect(p.parse("Ps 3:title=").osis()).toEqual("Ps.3.1");
		expect(p.parse("Ps 3:title and").osis()).toEqual("Ps.3.1");
		expect(p.parse("Matt 3:4a title and").osis_and_indices()).toEqual([
			{
				osis: "Matt.3.4",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("Matt 3:4a and.").osis_and_indices()).toEqual([
			{
				osis: "Matt.3.4",
				translations: [""],
				indices: [0, 9]
			}
		]);
		expect(p.parse("1st Thessalonaians 37 title - vs. 722 II Choranthians 141").osis()).toEqual("");
		expect(p.parse("Psalms - chapter 128 title MSG").osis()).toEqual("Ps.128.1");
		expect(p.parse("John 137 chapts. 153 title NKJV").osis_and_indices()).toEqual([]);
	});
	it("should handle parentheses with a `combine` `sequence_combination_strategy`", () => {
		expect(p.parse("Ps 117 (118,119, and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.120",
				translations: [""],
				indices: [0, 25]
			}
		]);
		expect(p.parse("Ps 117 (118, and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.118,Ps.120",
				translations: [""],
				indices: [0, 21]
			}
		]);
		expect(p.parse("Ps 117 (119, and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117,Ps.119-Ps.120",
				translations: [""],
				indices: [0, 21]
			}
		]);
		expect(p.parse("Ps 117(118)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.118",
				translations: [""],
				indices: [0, 11]
			}
		]);
		expect(p.parse("Ps 119:1, 5 (118:1-2, 4)").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1,Ps.119.5,Ps.118.1-Ps.118.2,Ps.118.4",
				translations: [""],
				indices: [0, 24]
			}
		]);
		expect(p.parse("Ps 119:1, ( 2 )").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1-Ps.119.2",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Ps 119:1, ( 2 ), Matt 5:6 (and 7)").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1-Ps.119.2,Matt.5.6-Matt.5.7",
				translations: [""],
				indices: [0, 33]
			}
		]);
		expect(p.parse("Acts 19:24, 38 (2)").osis_and_indices()).toEqual([
			{
				osis: "Acts.19.24,Acts.19.38,Acts.19.2",
				translations: [""],
				indices: [0, 18]
			}
		]);
		expect(p.parse("Hab 1:3 (cf. v. 2 )").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3,Hab.1.2",
				translations: [""],
				indices: [0, 19]
			}
		]);
		expect(p.parse("(Hab 1:3 cf. v. 2)").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3,Hab.1.2",
				translations: [""],
				indices: [1, 17]
			}
		]);
		expect(p.parse("(Hab 1:3 cf. v. 2)(NIV)").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3,Hab.1.2",
				translations: ["NIV"],
				indices: [1, 23]
			}
		]);
		expect(p.parse("Exodus 12:1-4 (5-10) 11-14").osis_and_indices()).toEqual([
			{
				osis: "Exod.12.1-Exod.12.14",
				translations: [""],
				indices: [0, 26]
			}
		]);
		expect(p.parse("(Lu 22:32; Rv 3:2) (Jn 17:3) (Jude 3-19)").osis_and_indices()).toEqual([
			{
				osis: "Luke.22.32,Rev.3.2",
				translations: [""],
				indices: [1, 17]
			}, {
				osis: "John.17.3",
				translations: [""],
				indices: [20, 27]
			}, {
				osis: "Jude.1.3-Jude.1.19",
				translations: [""],
				indices: [30, 39]
			}
		]);
	});
	it("should handle parentheses with a `separate` `sequence_combination_strategy`", () => {
		p.set_options({
			sequence_combination_strategy: "separate"
		});
		expect(p.parse("Ps 117 (118,119, and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.120",
				translations: [""],
				indices: [0, 25]
			}
		]);
		expect(p.parse("Ps 117 (118, and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.118",
				translations: [""],
				indices: [0, 11]
			}, {
				osis: "Ps.120",
				translations: [""],
				indices: [17, 20]
			}
		]);
		expect(p.parse("Ps 117 (119, and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117",
				translations: [""],
				indices: [0, 6]
			}, {
				osis: "Ps.119-Ps.120",
				translations: [""],
				indices: [8, 20]
			}
		]);
		expect(p.parse("Ps 117(118)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.118",
				translations: [""],
				indices: [0, 11]
			}
		]);
		expect(p.parse("Ps 119:1, 5 (118:1-2, 4)").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1",
				translations: [""],
				indices: [0, 8]
			}, {
				osis: "Ps.119.5",
				translations: [""],
				indices: [10, 11]
			}, {
				osis: "Ps.118.1-Ps.118.2",
				translations: [""],
				indices: [13, 20]
			}, {
				osis: "Ps.118.4",
				translations: [""],
				indices: [22, 23]
			}
		]);
		expect(p.parse("Ps 119:1, ( 2 )").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1-Ps.119.2",
				translations: [""],
				indices: [0, 15]
			}
		]);
		expect(p.parse("Acts 19:24, 38 (2)").osis_and_indices()).toEqual([
			{
				osis: "Acts.19.24",
				translations: [""],
				indices: [0, 10]
			}, {
				osis: "Acts.19.38",
				translations: [""],
				indices: [12, 14]
			}, {
				osis: "Acts.19.2",
				translations: [""],
				indices: [16, 17]
			}
		]);
		expect(p.parse("Ps 119:1, ( 2 ), Matt 5:6 and 7").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1-Ps.119.2",
				translations: [""],
				indices: [0, 15]
			}, {
				osis: "Matt.5.6-Matt.5.7",
				translations: [""],
				indices: [17, 31]
			}
		]);
		expect(p.parse("Ps 119:1, ( 2 ), Matt 5:6 (and 7)").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1-Ps.119.2",
				translations: [""],
				indices: [0, 15]
			}, {
				osis: "Matt.5.6-Matt.5.7",
				translations: [""],
				indices: [17, 33]
			}
		]);
		expect(p.parse("Ps 119:1, ( 2, cf. 6-10 ), Matt 5:6 (and 7)").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.1-Ps.119.2",
				translations: [""],
				indices: [0, 13]
			}, {
				osis: "Ps.119.6-Ps.119.10",
				translations: [""],
				indices: [19, 23]
			}, {
				osis: "Matt.5.6-Matt.5.7",
				translations: [""],
				indices: [27, 43]
			}
		]);
		expect(p.parse("Hab 1:3 (cf. v. 2 )").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3",
				translations: [""],
				indices: [0, 7]
			}, {
				osis: "Hab.1.2",
				translations: [""],
				indices: [13, 17]
			}
		]);
		expect(p.parse("Hab 1:3 (cf. v. 2 )(NIV)").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3",
				translations: ["NIV"],
				indices: [0, 7]
			}, {
				osis: "Hab.1.2",
				translations: ["NIV"],
				indices: [13, 24]
			}
		]);
		expect(p.parse("Exodus 12:1-4 (5-10) 11-14").osis_and_indices()).toEqual([
			{
				osis: "Exod.12.1-Exod.12.14",
				translations: [""],
				indices: [0, 26]
			}
		]);
		expect(p.parse("(Lu 22:32; Rv 3:2) (Jn 17:3) (Jude 3-19)").osis_and_indices()).toEqual([
			{
				osis: "Luke.22.32",
				translations: [""],
				indices: [1, 9]
			}, {
				osis: "Rev.3.2",
				translations: [""],
				indices: [11, 17]
			}, {
				osis: "John.17.3",
				translations: [""],
				indices: [20, 27]
			}, {
				osis: "Jude.1.3-Jude.1.19",
				translations: [""],
				indices: [30, 39]
			}
		]);
	});
	it("should handle nested parentheses with a `combine` `sequence_combination_strategy`", () => {
		expect(p.parse("Ps 117 (118,(119), and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.120",
				translations: [""],
				indices: [0, 27]
			}
		]);
		expect(p.parse("(Hab 2:3 cf. (ch. (2)) (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Hab.2.3",
				translations: [""],
				indices: [1, 8]
			}
		]);
		expect(p.parse("(Hab 1:3 cf. (v. ((2)))(NIV)").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3",
				translations: [""],
				indices: [1, 8]
			}
		]);
	});
	it("should handle nested parentheses with a `separate` `sequence_combination_strategy`", () => {
		p.set_options({
			sequence_combination_strategy: "separate"
		});
		expect(p.parse("Ps 117 (118,(119), and 120)").osis_and_indices()).toEqual([
			{
				osis: "Ps.117-Ps.120",
				translations: [""],
				indices: [0, 27]
			}
		]);
		expect(p.parse("(Hab 2:3 cf. (ch. (2)) (NIV)").osis_and_indices()).toEqual([
			{
				osis: "Hab.2.3",
				translations: [""],
				indices: [1, 8]
			}
		]);
		expect(p.parse("(Hab 1:3 cf. (v. ((2)))(NIV)").osis_and_indices()).toEqual([
			{
				osis: "Hab.1.3",
				translations: [""],
				indices: [1, 8]
			}
		]);
	});
	it("should handle parentheses with a lone start book", () => {
		expect(p.parse("Matt (Mark Luke 1:1)").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.1",
				indices: [11, 19],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark Luke 1:2) John").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.2",
				indices: [11, 19],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark Luke 1:3, John)").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.3",
				indices: [11, 19],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark Luke 1:4, John) Acts").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.4",
				indices: [11, 19],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark Luke 1:5, John Acts 1)").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.5,Acts.1",
				indices: [11, 32],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark Luke 1:6, John Acts 1) Rom").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.6,Acts.1",
				indices: [11, 32],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark Luke 1:7, John Acts 1, Rom) 1Cor").osis_and_indices()).toEqual([
			{
				osis: "Luke.1.7,Acts.1",
				indices: [11, 32],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark 1:1)").osis_and_indices()).toEqual([
			{
				osis: "Mark.1.1",
				indices: [6, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark 1:2) Luke").osis_and_indices()).toEqual([
			{
				osis: "Mark.1.2",
				indices: [6, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark 1:3 Luke)").osis_and_indices()).toEqual([
			{
				osis: "Mark.1.3",
				indices: [6, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark 1:4 Luke John 1:1)").osis_and_indices()).toEqual([
			{
				osis: "Mark.1.4,John.1.1",
				indices: [6, 28],
				translations: [""]
			}
		]);
		expect(p.parse("Matt (Mark 1:5 Luke John 1:1) Acts").osis_and_indices()).toEqual([
			{
				osis: "Mark.1.5,John.1.1",
				indices: [6, 28],
				translations: [""]
			}
		]);
	});
	it("should round-trip OSIS references", () => {
		p.set_options({
			osis_compaction_strategy: "bc"
		});
		const books = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
		for (const book of books) {
			const bc = book + ".1";
			const bcv = bc + ".1";
			const bcv_range = bcv + "-" + bc + ".2";
			expect(p.parse(bc).osis()).toEqual(bc);
			expect(p.parse(bcv).osis()).toEqual(bcv);
			expect(p.parse(bcv_range).osis()).toEqual(bcv_range);
		}
	});
	it("should handle books preceded by `\\w`", () => {
		expect(p.parse("1Matt2").osis_and_indices()).toEqual([]);
		expect(p.parse("1 Matt2").osis_and_indices()).toEqual([
			{
				osis: "Matt.2",
				translations: [""],
				indices: [2, 7]
			}
		]);
		expect(p.parse("1Matt2John1").osis_and_indices()).toEqual([]);
		expect(p.parse("1 Matt2John1").osis_and_indices()).toEqual([
			{
				osis: "2John",
				translations: [""],
				indices: [6, 12]
			}
		]);
		expect(p.parse("1 Matt2Phlm3").osis_and_indices()).toEqual([
			{
				osis: "Matt.2,Phlm.1.3",
				translations: [""],
				indices: [2, 12]
			}
		]);
		expect(p.parse("1Matt2-4Phlm3").osis_and_indices()).toEqual([]);
		expect(p.parse("1 Matt2-4John3").osis_and_indices()).toEqual([
			{
				osis: "Matt.2-Matt.4,John.3",
				translations: [""],
				indices: [2, 14]
			}
		]);
		expect(p.parse("1John1:2John2").osis_and_indices()).toEqual([
			{
				osis: "1John.1.2,John.2",
				translations: [""],
				indices: [0, 13]
			}
		]);
		expect(p.parse("1John21John2").osis_and_indices()).toEqual([
			{
				osis: "John.2",
				translations: [""],
				indices: [7, 12]
			}
		]);
	});
	it("should handle alternate names for books", () => {
		expect(p.parse("1 Kingdoms 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("2 Kingdoms 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Third Kingdoms 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("4th Kingdoms 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("paralipomenon 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("2 Paralipomenon 1:1").osis()).toEqual("2Chr.1.1");
	});
	it("should handle translations with different book orders when setting the `versification_system` manually", () => {
		p.include_apocrypha(true);
		const tests = [["Genesis 1 to Exodus 2", "Gen.1-Exod.2", "Gen.1-Exod.2"], ["1 Esdras 1 to Tobit 2", "1Esd.1,Tob.2", "1Esd.1-Tob.2"], ["2 Esdras 3\u2014Tobit 5", "2Esd.3,Tob.5", "2Esd.3-Tob.5"]];
		for (const [query, kjv, nab] of tests) {
			p.set_options({
				versification_system: "default"
			});
			expect(p.parse("" + query).osis()).toEqual(kjv);
			p.set_options({
				versification_system: "nab"
			});
			expect(p.parse("" + query).osis()).toEqual(nab);
		}
	});
	it("should handle translations with different book orders in parsed strings", () => {
		p.include_apocrypha(true);
		const tests = [["Genesis 1 to Exodus 2", "Gen.1-Exod.2", "Gen.1-Exod.2"], ["1 Esdras 1 to Tobit 2", "1Esd.1,Tob.2", "1Esd.1-Tob.2"], ["2 Esdras 3\u2014Tobit 5", "2Esd.3,Tob.5", "2Esd.3-Tob.5"]];
		for (const [query, kjv, nab] of tests) {
			expect(p.parse(query + " KJV").osis()).toEqual(kjv);
			expect(p.parse(query + " NAB").osis()).toEqual(nab);
		}
	});
	it("should handle long strings", () => {
		const strings = [];
		for (let i = 1; i <= 1001; i++) {
			strings.push("John.1");
		}
		const string = strings.join(",");
		expect(p.parse(string).osis()).toEqual(string);
		expect(p.parse("Ps 1,Ps 1,Ps 1,Ps 1,Ps 1,Ps 1,Ps 1,Ps 1,Ps 1,Ps 1,Psalm 1").osis()).toEqual("Ps.1,Ps.1,Ps.1,Ps.1,Ps.1,Ps.1,Ps.1,Ps.1,Ps.1,Ps.1,Ps.1");
	});
	it("should handle weird invalid ranges", () => {
		p.set_options({
			book_alone_strategy: "first_chapter",
			book_sequence_strategy: "include",
			book_range_strategy: "include"
		});
		expect(p.parse("Ti 8- Nu 9- Ma 10- Re").osis()).toEqual("Num.9,Matt.10-Rev.22");
		expect(p.parse("EX34 9PH to CO7").osis()).toEqual("Exod.34.9,Phil-Col");
		expect(p.parse("Proverbs 31:2. Vs 10 to dan").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10-Dan.12.13",
				translations: [""],
				indices: [0, 27]
			}
		]);
		expect(p.parse("Proverbs 31:2. Vs 10 to dan. Is a good").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10-Dan.12.13,Isa.1",
				translations: [""],
				indices: [0, 31]
			}
		]);
		expect(p.parse("Proverbs 31:2. Vs 10 to dan. Is a (NIV) good").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10-Dan.12.13,Isa.1",
				translations: ["NIV"],
				indices: [0, 39]
			}
		]);
		expect(p.parse("Proverbs 31:2. Vs 10 to dan (NIV). Is a good").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10-Dan.12.13",
				translations: ["NIV"],
				indices: [0, 33]
			}, {
				osis: "Isa.1",
				translations: [""],
				indices: [35, 37]
			}
		]);
		p.set_options({
			book_alone_strategy: "ignore",
			book_sequence_strategy: "ignore",
			book_range_strategy: "ignore"
		});
		expect(p.parse("Ti 8- Nu 9- Ma 10- Re").osis()).toEqual("Num.9,Matt.10");
		expect(p.parse("EX34 9PH to CO7").osis()).toEqual("Exod.34.9,Col.4");
		expect(p.parse("Proverbs 31:2. Vs 10 to dan").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Proverbs 31:2. Vs 10 to dan. Is a good").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10",
				translations: [""],
				indices: [0, 20]
			}
		]);
		expect(p.parse("Proverbs 31:2. Vs 10 to dan. Is a (NIV) good").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10",
				translations: ["NIV"],
				indices: [0, 39]
			}
		]);
		expect(p.parse("Proverbs 31:2. Vs 10 to dan (NIV). Is a (NIV) good").osis_and_indices()).toEqual([
			{
				osis: "Prov.31.2,Prov.31.10",
				translations: ["NIV"],
				indices: [0, 33]
			}
		]);
	});
	it("should handle ambiguous books", () => {
		expect(p.parse("Ph 80").osis()).toEqual("");
		expect(p.parse("Ph 1:4").osis()).toEqual("Phil.1.4");
		expect(p.parse("Ph 80 KJV").osis_and_translations()).toEqual([]);
		expect(p.parse("Ph 1:4 KJV").osis_and_translations()).toEqual([["Phil.1.4", "KJV"]]);
		expect(p.parse_with_context("Ph 1:4 KJV", "Mark 2:3 NIV").osis_and_translations()).toEqual([["Phil.1.4", "KJV"]]);
		expect(p.parse_with_context("Ph 1:5", "Mark 2:3 NIV").osis_and_translations()).toEqual([["Phil.1.5", ""]]);
		expect(p.parse("Ph 1:6, Ma 1:1 NIV").osis_and_translations()).toEqual([["Phil.1.6,Matt.1.1", "NIV"]]);
		expect(p.parse("Ph 1:7 ESV, Ma 1:2 NIV").osis_and_translations()).toEqual([["Phil.1.7", "ESV"], ["Matt.1.2", "NIV"]]);
		expect(p.parse("Ph 3 ESV, Ma 3 NIV").osis_and_translations()).toEqual([["Phil.3", "ESV"], ["Matt.3", "NIV"]]);
	});
	it("should handle `single_chapter_1_strategy`", () => {
		p.set_options({
			book_range_strategy: "include"
		});
		expect(p.parse("Jude 1").osis()).toEqual("Jude");
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Jude 1-2").osis()).toEqual("Jude.1.1-Jude.1.2");
		expect(p.parse("Jude 1:1-4").osis()).toEqual("Jude.1.1-Jude.1.4");
		expect(p.parse("Titus 2-Philemon 1").osis()).toEqual("Titus.2-Phlm.1");
		expect(p.parse("Titus 3-Philemon").osis()).toEqual("Titus.3-Phlm.1");
		p.set_options({
			single_chapter_1_strategy: "verse"
		});
		expect(p.parse("Jude 1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Jude 1-2").osis()).toEqual("Jude.1.1-Jude.1.2");
		expect(p.parse("Jude 1:1-4").osis()).toEqual("Jude.1.1-Jude.1.4");
		expect(p.parse("Titus 2-Philemon 1").osis()).toEqual("Titus.2.1-Phlm.1.1");
		expect(p.parse("Titus 3-Philemon").osis()).toEqual("Titus.3-Phlm.1");
	});
	it("should handle a `punctuation_strategy` switch", () => {
		expect(p.parse("Matt 1, 2. 3").osis()).toEqual("Matt.1,Matt.2.3");
		p.set_options({
			punctuation_strategy: "eu"
		});
		expect(p.options.punctuation_strategy).toEqual("eu");
		expect(p.parse("Matt 2, 3. 4").osis()).toEqual("Matt.2.3-Matt.2.4");
		p.set_options({
			punctuation_strategy: "unknown"
		});
		expect(p.options.punctuation_strategy).toEqual("unknown");
		expect(p.parse("Matt 3, 4. 5").osis()).toEqual("Matt.3,Matt.4.5");
		p.set_options({
			punctuation_strategy: "us"
		});
		expect(p.options.punctuation_strategy).toEqual("us");
		expect(p.parse("Matt 4, 5. 6 NIV, 7").osis()).toEqual("Matt.4,Matt.5.6,Matt.5.7");
		p.set_options({
			punctuation_strategy: "unknown"
		});
		expect(p.options.punctuation_strategy).toEqual("unknown");
		expect(p.parse("Matt 5, 6. 7").osis()).toEqual("Matt.5,Matt.6.7");
	});
});

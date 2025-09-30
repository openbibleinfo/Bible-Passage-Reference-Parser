"use strict";
import { bcv_parser } from "../../esm/bcv_parser.js";
import * as lang from "../../esm/lang/mk.js";

describe("Parsing", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			osis_compaction_strategy: "b",
			sequence_combination_strategy: "combine"
		});
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
	it("should round-trip OSIS Apocrypha references", () => {
		p.set_options({
			osis_compaction_strategy: "bc",
			ps151_strategy: "b",
			testaments: "ona"
		});
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
			ps151_strategy: "bc"
		});
		expect(p.parse("Ps151.1").osis()).toEqual("Ps.151");
		expect(p.parse("Ps151.1.1").osis()).toEqual("Ps.151.1");
		expect(p.parse("Ps151.1-Ps151.2").osis()).toEqual("Ps.151.1-Ps.151.2");
		p.set_options({
			testaments: "on"
		});
		for (const book of books) {
			const bc = book + ".1";
			expect(p.parse(bc).osis()).toEqual("");
		}
	});
	it("should handle a preceding character", () => {
		expect(p.parse(" Gen 1").osis()).toEqual("Gen.1");
		expect(p.parse("Matt5John3").osis()).toEqual("Matt.5,John.3");
		expect(p.parse("1Ps 1").osis()).toEqual("");
		expect(p.parse("11Sam 1").osis()).toEqual("");
	});
});

describe("Localized book Gen (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Gen (mk)", () => {
		expect(p.parse("Прва книга Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Прво книга Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1. книга Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I. книга Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1 книга Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I книга Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Прва Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Прво Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1. Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I. Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Настанување 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1 Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I Мојсеева 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Битие 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ПРВА КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ПРВО КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1 КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ПРВА МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ПРВО МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1. МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I. МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("НАСТАНУВАЊЕ 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("1 МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("I МОЈСЕЕВА 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("БИТИЕ 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1");
	});
});
describe("Localized book Exod (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Exod (mk)", () => {
		expect(p.parse("Втора книга Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Второ книга Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II. книга Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2. книга Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II книга Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2 книга Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Втора Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Второ Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II. Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2. Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2 Мојсеева 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Излез 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("ВТОРА КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("ВТОРО КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2 КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("ВТОРА МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("ВТОРО МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II. МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2. МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("II МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("2 МОЈСЕЕВА 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("ИЗЛЕЗ 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1");
	});
});
describe("Localized book Bel (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Bel (mk)", () => {
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1");
	});
});
describe("Localized book Lev (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Lev (mk)", () => {
		expect(p.parse("Трета книга Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Трето книга Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III. книга Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III книга Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3. книга Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3 книга Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Левитска книга 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Трета Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Трето Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III. Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3. Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3 Мојсеева 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Левитска 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Левит 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ТРЕТА КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ТРЕТО КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3 КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ЛЕВИТСКА КНИГА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ТРЕТА МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ТРЕТО МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III. МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("III МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3. МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("3 МОЈСЕЕВА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ЛЕВИТСКА 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("ЛЕВИТ 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1");
	});
});
describe("Localized book Num (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Num (mk)", () => {
		expect(p.parse("Четврта книга Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV. книга Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4. книга Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV книга Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4 книга Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("Четврта Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV. Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4. Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4 Мојсеева 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("Броеви 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("ЧЕТВРТА КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4 КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("ЧЕТВРТА МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV. МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4. МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("IV МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("4 МОЈСЕЕВА 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("БРОЕВИ 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1");
	});
});
describe("Localized book Sir (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Sir (mk)", () => {
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1");
	});
});
describe("Localized book Wis (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Wis (mk)", () => {
		expect(p.parse("Книга Мудрост Соломонова 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1");
	});
});
describe("Localized book Lam (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Lam (mk)", () => {
		expect(p.parse("Плачот на Еремија 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Плач на Еремиин 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Плач Еремиин 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("ПЛАЧОТ НА ЕРЕМИЈА 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("ПЛАЧ НА ЕРЕМИИН 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("ПЛАЧ ЕРЕМИИН 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1");
	});
});
describe("Localized book EpJer (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: EpJer (mk)", () => {
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1");
	});
});
describe("Localized book Rev (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Rev (mk)", () => {
		expect(p.parse("Откровение 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("ОТКРОВЕНИЕ 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1");
	});
});
describe("Localized book PrMan (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: PrMan (mk)", () => {
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1");
	});
});
describe("Localized book Deut (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Deut (mk)", () => {
		expect(p.parse("Петта книга Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5. книга Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V. книга Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5 книга Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V книга Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Повторени закони 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Петта Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Второзаконие 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5. Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V. Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5 Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V Мојсеева 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("ПЕТТА КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V. КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5 КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V КНИГА МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("ПОВТОРЕНИ ЗАКОНИ 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("ПЕТТА МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("ВТОРОЗАКОНИЕ 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5. МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V. МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("5 МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("V МОЈСЕЕВА 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1");
	});
});
describe("Localized book Josh (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Josh (mk)", () => {
		expect(p.parse("Книга на Исус Невин 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Исус Навин 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Јешуа 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Јошуа 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("КНИГА НА ИСУС НЕВИН 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("ИСУС НАВИН 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("ЈЕШУА 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("ЈОШУА 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1");
	});
});
describe("Localized book Judg (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Judg (mk)", () => {
		expect(p.parse("Книга на израелеви судии 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Судии 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("КНИГА НА ИЗРАЕЛЕВИ СУДИИ 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("СУДИИ 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1");
	});
});
describe("Localized book Ruth (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ruth (mk)", () => {
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("Рута 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("Рут 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("РУТА 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("РУТ 1:1").osis()).toEqual("Ruth.1.1");
	});
});
describe("Localized book 1Esd (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Esd (mk)", () => {
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1");
	});
});
describe("Localized book 2Esd (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Esd (mk)", () => {
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1");
	});
});
describe("Localized book Isa (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Isa (mk)", () => {
		expect(p.parse("Исаија 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Исаја 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ИСАИЈА 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ИСАЈА 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1");
	});
});
describe("Localized book 2Sam (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Sam (mk)", () => {
		expect(p.parse("Втора книга Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Второ книга Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. книга Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. книга Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II книга Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 книга Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Втора Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Втора Самуилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Второ Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Второ Самуилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. Самуилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. Самуилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II Самуилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Втора Самуил 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("Второ Самуил 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 Самоилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 Самуилова 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. Самуил 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. Самуил 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II Самуил 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 Самуил 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРА КНИГА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРО КНИГА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. КНИГА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. КНИГА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II КНИГА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 КНИГА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРА САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРА САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРО САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРО САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРА САМУИЛ 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("ВТОРО САМУИЛ 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 САМОИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II. САМУИЛ 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. САМУИЛ 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II САМУИЛ 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 САМУИЛ 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1");
	});
});
describe("Localized book 1Sam (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Sam (mk)", () => {
		expect(p.parse("Прва книга Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прво книга Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. книга Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. книга Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 книга Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I книга Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прва Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прва Самуилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прво Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прво Самуилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. Самуилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. Самуилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 Самуилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I Самоилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I Самуилова 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прва Самуил 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("Прво Самуил 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. Самуил 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. Самуил 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 Самуил 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I Самуил 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВА КНИГА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВО КНИГА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. КНИГА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. КНИГА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 КНИГА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I КНИГА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВА САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВА САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВО САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВО САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I САМОИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВА САМУИЛ 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("ПРВО САМУИЛ 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. САМУИЛ 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I. САМУИЛ 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 САМУИЛ 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I САМУИЛ 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1");
	});
});
describe("Localized book 2Kgs (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Kgs (mk)", () => {
		expect(p.parse("Втора книга за царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Второ книга за царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. книга за царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. книга за царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II книга за царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Втора книга царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Второ книга царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 книга за царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. книга царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Втора книга цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Второ книга цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. книга царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II книга царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 книга царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. книга цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. книга цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II книга цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 книга цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Втора Царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Второ Царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. Царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Втора Цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("Второ Цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. Царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II Царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 Царевите 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. Цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. Цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II Цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 Цареви 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРА КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРО КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРА КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРО КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРА КНИГА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРО КНИГА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. КНИГА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. КНИГА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II КНИГА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 КНИГА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРА ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРО ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРА ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("ВТОРО ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 ЦАРЕВИТЕ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II. ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 ЦАРЕВИ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1");
	});
});
describe("Localized book 1Kgs (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Kgs (mk)", () => {
		expect(p.parse("Прва книга за царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прво книга за царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. книга за царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. книга за царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 книга за царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I книга за царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прва книга царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прво книга царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. книга царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. книга царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прва книга цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прво книга цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 книга царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I книга царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. книга цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. книга цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 книга цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I книга цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прва Царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прво Царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. Царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. Царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прва Цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("Прво Цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 Царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I Царевите 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. Цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. Цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 Цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I Цареви 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВА КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВО КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I КНИГА ЗА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВА КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВО КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВА КНИГА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВО КНИГА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I КНИГА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. КНИГА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. КНИГА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 КНИГА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I КНИГА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВА ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВО ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВА ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("ПРВО ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I ЦАРЕВИТЕ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I. ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I ЦАРЕВИ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1");
	});
});
describe("Localized book 2Chr (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Chr (mk)", () => {
		expect(p.parse("Втора книга летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("Второ книга летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II. книга летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2. книга летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II книга летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 книга летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("Втора Летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("Второ Летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II. Летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2. Летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II Летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 Летописи 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("ВТОРА КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("ВТОРО КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II. КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2. КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("ВТОРА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("ВТОРО ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II. ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2. ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1");
	});
});
describe("Localized book 1Chr (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Chr (mk)", () => {
		expect(p.parse("Прва книга летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("Прво книга летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1. книга летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I. книга летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 книга летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I книга летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("Прва Летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("Прво Летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1. Летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I. Летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 Летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I Летописи 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("ПРВА КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("ПРВО КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1. КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I. КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I КНИГА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("ПРВА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("ПРВО ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1. ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I. ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1");
	});
});
describe("Localized book Ezra (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ezra (mk)", () => {
		expect(p.parse("Ездра 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("Езра 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("ЕЗДРА 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("ЕЗРА 1:1").osis()).toEqual("Ezra.1.1");
	});
});
describe("Localized book Neh (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Neh (mk)", () => {
		expect(p.parse("Нехемија 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Неемија 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("НЕХЕМИЈА 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("НЕЕМИЈА 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1");
	});
});
describe("Localized book GkEsth (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: GkEsth (mk)", () => {
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1");
	});
});
describe("Localized book Esth (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Esth (mk)", () => {
		expect(p.parse("Естира 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("Естер 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ЕСТИРА 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ЕСТЕР 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1");
	});
});
describe("Localized book Job (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Job (mk)", () => {
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("Јов 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("ЈОВ 1:1").osis()).toEqual("Job.1.1");
	});
});
describe("Localized book Ps (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ps (mk)", () => {
		expect(p.parse("Псалми 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("ПСАЛМИ 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1");
	});
});
describe("Localized book PrAzar (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: PrAzar (mk)", () => {
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1");
	});
});
describe("Localized book Prov (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Prov (mk)", () => {
		expect(p.parse("Мудри изреки 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Пословици 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Изреки 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("МУДРИ ИЗРЕКИ 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("ПОСЛОВИЦИ 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("ИЗРЕКИ 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1");
	});
});
describe("Localized book Eccl (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Eccl (mk)", () => {
		expect(p.parse("Проповедник 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("ПРОПОВЕДНИК 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1");
	});
});
describe("Localized book SgThree (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: SgThree (mk)", () => {
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1");
	});
});
describe("Localized book Song (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Song (mk)", () => {
		expect(p.parse("Песната над песните 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Песната на Соломон 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Песна над песните 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Песна на Соломон 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("ПЕСНАТА НАД ПЕСНИТЕ 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("ПЕСНАТА НА СОЛОМОН 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("ПЕСНА НАД ПЕСНИТЕ 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("ПЕСНА НА СОЛОМОН 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1");
	});
});
describe("Localized book Jer (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jer (mk)", () => {
		expect(p.parse("Еремија 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("ЕРЕМИЈА 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1");
	});
});
describe("Localized book Ezek (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ezek (mk)", () => {
		expect(p.parse("Езекиел 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("ЕЗЕКИЕЛ 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1");
	});
});
describe("Localized book Dan (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Dan (mk)", () => {
		expect(p.parse("Даниел 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("Данил 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("ДАНИЕЛ 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("ДАНИЛ 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1");
	});
});
describe("Localized book Hos (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hos (mk)", () => {
		expect(p.parse("Осија 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("Хошеа 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ОСИЈА 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ХОШЕА 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1");
	});
});
describe("Localized book Joel (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Joel (mk)", () => {
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Јоел 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Јоил 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("ЈОЕЛ 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("ЈОИЛ 1:1").osis()).toEqual("Joel.1.1");
	});
});
describe("Localized book Amos (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Amos (mk)", () => {
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("Амос 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("АМОС 1:1").osis()).toEqual("Amos.1.1");
	});
});
describe("Localized book Obad (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Obad (mk)", () => {
		expect(p.parse("Овадија 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("Авдиј 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ОВАДИЈА 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("АВДИЈ 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1");
	});
});
describe("Localized book Jonah (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jonah (mk)", () => {
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("Јона 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("ЈОНА 1:1").osis()).toEqual("Jonah.1.1");
	});
});
describe("Localized book Mic (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mic (mk)", () => {
		expect(p.parse("Михеј 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Миха 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("МИХЕЈ 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("МИХА 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1");
	});
});
describe("Localized book Nah (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Nah (mk)", () => {
		expect(p.parse("Наум 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("НАУМ 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1");
	});
});
describe("Localized book Hab (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hab (mk)", () => {
		expect(p.parse("Хабакук 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("Хавакук 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ХАБАКУК 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ХАВАКУК 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1");
	});
});
describe("Localized book Zeph (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Zeph (mk)", () => {
		expect(p.parse("Сефанија 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("Софонија 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("СЕФАНИЈА 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("СОФОНИЈА 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1");
	});
});
describe("Localized book Hag (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hag (mk)", () => {
		expect(p.parse("Хагај 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Агеј 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("ХАГАЈ 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("АГЕЈ 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1");
	});
});
describe("Localized book Zech (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Zech (mk)", () => {
		expect(p.parse("Захарија 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ЗАХАРИЈА 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1");
	});
});
describe("Localized book Mal (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mal (mk)", () => {
		expect(p.parse("Малахија 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("МАЛАХИЈА 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1");
	});
});
describe("Localized book Matt (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Matt (mk)", () => {
		expect(p.parse("Евангелието според Матеј 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Евангелие според Матеј 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Матеј 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("ЕВАНГЕЛИЕТО СПОРЕД МАТЕЈ 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("ЕВАНГЕЛИЕ СПОРЕД МАТЕЈ 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("МАТЕЈ 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1");
	});
});
describe("Localized book Mark (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mark (mk)", () => {
		expect(p.parse("Евангелието според Марко 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Евангелие според Марко 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Марко 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("ЕВАНГЕЛИЕТО СПОРЕД МАРКО 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("ЕВАНГЕЛИЕ СПОРЕД МАРКО 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("МАРКО 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1");
	});
});
describe("Localized book Luke (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Luke (mk)", () => {
		expect(p.parse("Евангелието според Лука 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Евангелие според Лука 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Лука 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("ЕВАНГЕЛИЕТО СПОРЕД ЛУКА 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("ЕВАНГЕЛИЕ СПОРЕД ЛУКА 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("ЛУКА 1:1").osis()).toEqual("Luke.1.1");
	});
});
describe("Localized book 1John (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1John (mk)", () => {
		expect(p.parse("Прва послание на апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прво послание на апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. послание на апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. послание на апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 послание на апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I послание на апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прва писмо од апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прво писмо од апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. писмо од апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. писмо од апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 писмо од апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I писмо од апостол Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прва Јованово 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прво Јованово 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. Јованово 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. Јованово 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Јованово 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I Јованово 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прва Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Прво Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I Јован 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВА ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВО ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВА ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВО ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВА ЈОВАНОВО 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВО ЈОВАНОВО 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. ЈОВАНОВО 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. ЈОВАНОВО 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 ЈОВАНОВО 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I ЈОВАНОВО 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВА ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("ПРВО ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I. ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I ЈОВАН 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1");
	});
});
describe("Localized book 2John (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2John (mk)", () => {
		expect(p.parse("Втора послание на апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Второ послание на апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. послание на апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. послание на апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II послание на апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Втора писмо од апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Второ писмо од апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 послание на апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. писмо од апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. писмо од апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II писмо од апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 писмо од апостол Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Втора Јованово 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Второ Јованово 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. Јованово 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. Јованово 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II Јованово 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Втора Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("Второ Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Јованово 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Јован 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРА ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРА ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРО ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРА ЈОВАНОВО 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРО ЈОВАНОВО 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. ЈОВАНОВО 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. ЈОВАНОВО 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II ЈОВАНОВО 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРА ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("ВТОРО ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 ЈОВАНОВО 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II. ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 ЈОВАН 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1");
	});
});
describe("Localized book 3John (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 3John (mk)", () => {
		expect(p.parse("Трета послание на апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трето послание на апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. послание на апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III послание на апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. послание на апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трета писмо од апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трето писмо од апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 послание на апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. писмо од апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III писмо од апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. писмо од апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 писмо од апостол Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трета Јованово 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трето Јованово 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. Јованово 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III Јованово 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. Јованово 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трета Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Трето Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Јованово 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Јован 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТА ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТО ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТА ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТО ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 ПОСЛАНИЕ НА АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 ПИСМО ОД АПОСТОЛ ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТА ЈОВАНОВО 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТО ЈОВАНОВО 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. ЈОВАНОВО 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III ЈОВАНОВО 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. ЈОВАНОВО 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТА ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("ТРЕТО ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 ЈОВАНОВО 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III. ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 ЈОВАН 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1");
	});
});
describe("Localized book John (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: John (mk)", () => {
		expect(p.parse("Евангелието според Јован 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Евангелие според Јован 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Јован 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("ЕВАНГЕЛИЕТО СПОРЕД ЈОВАН 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("ЕВАНГЕЛИЕ СПОРЕД ЈОВАН 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("ЈОВАН 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1");
	});
});
describe("Localized book Acts (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Acts (mk)", () => {
		expect(p.parse("Дела на светите апостоли 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Дела на апостолите 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Дела апостолски 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Дела Ап 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Дела 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ДЕЛА НА СВЕТИТЕ АПОСТОЛИ 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ДЕЛА НА АПОСТОЛИТЕ 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ДЕЛА АПОСТОЛСКИ 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ДЕЛА АП 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ДЕЛА 1:1").osis()).toEqual("Acts.1.1");
	});
});
describe("Localized book Rom (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Rom (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до христијаните во Рим 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Римјаните 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Римјани 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО РИМ 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("РИМЈАНИТЕ 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("РИМЈАНИ 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1");
	});
});
describe("Localized book 2Cor (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Cor (mk)", () => {
		expect(p.parse("Втора писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Втора Коринтјаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ Коринтјаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Втора Коринканите 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Втора Коринќаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ Коринканите 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ Коринќаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. Коринтјаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Втора Коринтјани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ Коринтјани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. Коринтјаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Коринтјаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. Коринканите 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. Коринќаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Втора Коринкани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Втора Коринќани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ Коринкани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Второ Коринќани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Коринтјаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. Коринканите 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. Коринќаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Коринканите 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Коринќаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. Коринтјани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Коринканите 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Коринќаните 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. Коринтјани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Коринтјани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. Коринкани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. Коринќани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Коринтјани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. Коринкани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. Коринќани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Коринкани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Коринќани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Коринкани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Коринќани 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА КОРИНТЈАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО КОРИНТЈАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА КОРИНКАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА КОРИНЌАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО КОРИНКАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО КОРИНЌАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. КОРИНТЈАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА КОРИНТЈАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО КОРИНТЈАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. КОРИНТЈАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II КОРИНТЈАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. КОРИНКАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. КОРИНЌАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА КОРИНКАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРА КОРИНЌАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО КОРИНКАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("ВТОРО КОРИНЌАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 КОРИНТЈАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. КОРИНКАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. КОРИНЌАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II КОРИНКАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II КОРИНЌАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. КОРИНТЈАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 КОРИНКАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 КОРИНЌАНИТЕ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. КОРИНТЈАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II КОРИНТЈАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. КОРИНКАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II. КОРИНЌАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 КОРИНТЈАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. КОРИНКАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. КОРИНЌАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II КОРИНКАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II КОРИНЌАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 КОРИНКАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 КОРИНЌАНИ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1");
	});
});
describe("Localized book 1Cor (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Cor (mk)", () => {
		expect(p.parse("Прва писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I писмо од апостол Павле до христијаните во Коринт 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прва Коринтјаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво Коринтјаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прва Коринканите 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прва Коринќаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво Коринканите 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво Коринќаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. Коринтјаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. Коринтјаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прва Коринтјани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво Коринтјани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Коринтјаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. Коринканите 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. Коринќаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Коринтјаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. Коринканите 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. Коринќаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прва Коринкани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прва Коринќани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво Коринкани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("Прво Коринќани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Коринканите 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Коринќаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. Коринтјани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Коринканите 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Коринќаните 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. Коринтјани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Коринтјани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. Коринкани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. Коринќани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Коринтјани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. Коринкани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. Коринќани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Коринкани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Коринќани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Коринкани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Коринќани 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОРИНТ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА КОРИНТЈАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО КОРИНТЈАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА КОРИНКАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА КОРИНЌАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО КОРИНКАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО КОРИНЌАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. КОРИНТЈАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. КОРИНТЈАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА КОРИНТЈАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО КОРИНТЈАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 КОРИНТЈАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. КОРИНКАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. КОРИНЌАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I КОРИНТЈАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. КОРИНКАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. КОРИНЌАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА КОРИНКАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВА КОРИНЌАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО КОРИНКАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("ПРВО КОРИНЌАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 КОРИНКАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 КОРИНЌАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. КОРИНТЈАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I КОРИНКАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I КОРИНЌАНИТЕ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. КОРИНТЈАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 КОРИНТЈАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. КОРИНКАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. КОРИНЌАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I КОРИНТЈАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. КОРИНКАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I. КОРИНЌАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 КОРИНКАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 КОРИНЌАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I КОРИНКАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I КОРИНЌАНИ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1");
	});
});
describe("Localized book Gal (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Gal (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до христијаните во Галатија 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Галатјаните 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Галатјани 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Галатите 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО ГАЛАТИЈА 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("ГАЛАТЈАНИТЕ 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("ГАЛАТЈАНИ 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("ГАЛАТИТЕ 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1");
	});
});
describe("Localized book Eph (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Eph (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до христијаните во Ефес 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Ефесјаните 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Ефешаните 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Ефесјани 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО ЕФЕС 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("ЕФЕСЈАНИТЕ 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("ЕФЕШАНИТЕ 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("ЕФЕСЈАНИ 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1");
	});
});
describe("Localized book Phil (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Phil (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до христијаните во Филипи 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Филипјаните 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Филипјани 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО ФИЛИПИ 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("ФИЛИПЈАНИТЕ 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("ФИЛИПЈАНИ 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1");
	});
});
describe("Localized book Col (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Col (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до христијаните во Колос 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Колосјаните 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Колошаните 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Колосјани 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО КОЛОС 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("КОЛОСЈАНИТЕ 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("КОЛОШАНИТЕ 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("КОЛОСЈАНИ 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1");
	});
});
describe("Localized book 2Thess (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Thess (mk)", () => {
		expect(p.parse("Втора писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Второ писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Втора Солунјаните 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Второ Солунјаните 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. Солунјаните 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Втора Солунците 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Втора Солунјани 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Второ Солунците 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("Второ Солунјани 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. Солунјаните 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II Солунјаните 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Солунјаните 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. Солунците 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. Солунјани 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. Солунците 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. Солунјани 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II Солунците 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II Солунјани 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Солунците 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Солунјани 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРА ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРО ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРА СОЛУНЈАНИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРО СОЛУНЈАНИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. СОЛУНЈАНИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРА СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРА СОЛУНЈАНИ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРО СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("ВТОРО СОЛУНЈАНИ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. СОЛУНЈАНИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II СОЛУНЈАНИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 СОЛУНЈАНИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II. СОЛУНЈАНИ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. СОЛУНЈАНИ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II СОЛУНЈАНИ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 СОЛУНЈАНИ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1");
	});
});
describe("Localized book 1Thess (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Thess (mk)", () => {
		expect(p.parse("Прва писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прво писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I писмо од апостол Павле до христијаните во Солун 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прва Солунјаните 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прво Солунјаните 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. Солунјаните 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. Солунјаните 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прва Солунците 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прва Солунјани 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прво Солунците 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("Прво Солунјани 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Солунјаните 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I Солунјаните 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. Солунците 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. Солунјани 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. Солунците 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. Солунјани 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Солунците 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Солунјани 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I Солунците 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I Солунјани 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВА ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВО ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ХРИСТИЈАНИТЕ ВО СОЛУН 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВА СОЛУНЈАНИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВО СОЛУНЈАНИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. СОЛУНЈАНИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. СОЛУНЈАНИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВА СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВА СОЛУНЈАНИ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВО СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("ПРВО СОЛУНЈАНИ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 СОЛУНЈАНИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I СОЛУНЈАНИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. СОЛУНЈАНИ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I. СОЛУНЈАНИ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 СОЛУНЈАНИ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I СОЛУНЈАНИ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1");
	});
});
describe("Localized book 2Tim (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Tim (mk)", () => {
		expect(p.parse("Втора писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("Второ писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II. писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("Втора Тимотеева 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("Второ Тимотеева 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II. Тимотеева 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("Втора Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("Второ Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. Тимотеева 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II Тимотеева 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 Тимотеева 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II. Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 Тимотеј 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("ВТОРА ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("ВТОРО ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("ВТОРА ТИМОТЕЕВА 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("ВТОРО ТИМОТЕЕВА 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II. ТИМОТЕЕВА 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("ВТОРА ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("ВТОРО ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. ТИМОТЕЕВА 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II ТИМОТЕЕВА 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 ТИМОТЕЕВА 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II. ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 ТИМОТЕЈ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1");
	});
});
describe("Localized book 1Tim (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Tim (mk)", () => {
		expect(p.parse("Прва писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("Прво писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I. писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I писмо од апостол Павле до Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("Прва Тимотеева 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("Прво Тимотеева 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. Тимотеева 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I. Тимотеева 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("Прва Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("Прво Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 Тимотеева 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I Тимотеева 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I. Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I Тимотеј 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("ПРВА ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("ПРВО ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I. ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("ПРВА ТИМОТЕЕВА 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("ПРВО ТИМОТЕЕВА 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. ТИМОТЕЕВА 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I. ТИМОТЕЕВА 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("ПРВА ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("ПРВО ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 ТИМОТЕЕВА 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I ТИМОТЕЕВА 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I. ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I ТИМОТЕЈ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1");
	});
});
describe("Localized book Titus (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Titus (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до Тит 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Тит 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ТИТ 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("ТИТ 1:1").osis()).toEqual("Titus.1.1");
	});
});
describe("Localized book Phlm (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Phlm (mk)", () => {
		expect(p.parse("Писмо од апостол Павле до Филемон 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Филемон 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Филимон 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ПАВЛЕ ДО ФИЛЕМОН 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("ФИЛЕМОН 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("ФИЛИМОН 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1");
	});
});
describe("Localized book Heb (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Heb (mk)", () => {
		expect(p.parse("Писмо до Евреите 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Евреите 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Евреи 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("ПИСМО ДО ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("ЕВРЕИ 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1");
	});
});
describe("Localized book Jas (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jas (mk)", () => {
		expect(p.parse("Послание на апостол Јаков 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Писмо од апостол Јаков 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Јаков 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("ПОСЛАНИЕ НА АПОСТОЛ ЈАКОВ 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ЈАКОВ 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("ЈАКОВ 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1");
	});
});
describe("Localized book 2Pet (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Pet (mk)", () => {
		expect(p.parse("Втора послание на апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Второ послание на апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. послание на апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. послание на апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II послание на апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Втора писмо од апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Второ писмо од апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 послание на апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. писмо од апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. писмо од апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II писмо од апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 писмо од апостол Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Втора Петрово 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Второ Петрово 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. Петрово 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Втора Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("Второ Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. Петрово 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II Петрово 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 Петрово 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 Петар 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРА ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРА ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРО ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРА ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРО ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРА ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("ВТОРО ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II. ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 ПЕТАР 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1");
	});
});
describe("Localized book 1Pet (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Pet (mk)", () => {
		expect(p.parse("Прва послание на апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прво послание на апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. послание на апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. послание на апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 послание на апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I послание на апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прва писмо од апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прво писмо од апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. писмо од апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. писмо од апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 писмо од апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I писмо од апостол Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прва Петрово 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прво Петрово 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. Петрово 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. Петрово 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прва Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("Прво Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 Петрово 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I Петрово 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I Петар 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВА ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВО ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I ПОСЛАНИЕ НА АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВА ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВО ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I ПИСМО ОД АПОСТОЛ ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВА ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВО ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВА ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("ПРВО ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I. ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I ПЕТАР 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1");
	});
});
describe("Localized book Jude (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jude (mk)", () => {
		expect(p.parse("Послание на апостол Јуда 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Писмо од апостол Јуда 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Јуда 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("ПОСЛАНИЕ НА АПОСТОЛ ЈУДА 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("ПИСМО ОД АПОСТОЛ ЈУДА 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("ЈУДА 1:1").osis()).toEqual("Jude.1.1");
	});
});
describe("Localized book Tob (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Tob (mk)", () => {
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1");
	});
});
describe("Localized book Jdt (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jdt (mk)", () => {
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1");
	});
});
describe("Localized book Bar (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Bar (mk)", () => {
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1");
	});
});
describe("Localized book Sus (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Sus (mk)", () => {
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1");
	});
});
describe("Localized book 2Macc (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Macc (mk)", () => {
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1");
	});
});
describe("Localized book 3Macc (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 3Macc (mk)", () => {
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1");
	});
});
describe("Localized book 4Macc (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 4Macc (mk)", () => {
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1");
	});
});
describe("Localized book 1Macc (mk)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Macc (mk)", () => {
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1");
	});
});

describe("Miscellaneous tests", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({
			book_alone_strategy: "ignore",
			book_sequence_strategy: "ignore",
			osis_compaction_strategy: "bc",
			captive_end_digits_strategy: "delete",
			testaments: "ona"
		});
	});
	it("should return the expected language", () => {
		expect(p.regexps.languages).toEqual(["mk"]);
	});

	it("should handle ranges (mk)", () => {
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual("Titus.1.1-Titus.1.2");
		expect(p.parse("Matt 1-2").osis()).toEqual("Matt.1-Matt.2");
		expect(p.parse("Phlm 2 - 3").osis()).toEqual("Phlm.1.2-Phlm.1.3");
	});
	it("should handle chapters (mk)", () => {
		expect(p.parse("Titus 1:1, глави 2").osis()).toEqual("Titus.1.1,Titus.2");
		expect(p.parse("Matt 3:4 ГЛАВИ 6").osis()).toEqual("Matt.3.4,Matt.6");
		expect(p.parse("Titus 1:1, глава 2").osis()).toEqual("Titus.1.1,Titus.2");
		expect(p.parse("Matt 3:4 ГЛАВА 6").osis()).toEqual("Matt.3.4,Matt.6");
	});
	it("should handle verses (mk)", () => {
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm VERSE 6").osis()).toEqual("Phlm.1.6");
	});
	it("should handle 'and' (mk)", () => {
		expect(p.parse("Exod 1:1 и 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 И 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
	});
	it("should handle titles (mk)", () => {
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1");
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1");
	});
	it("should handle 'ff' (mk)", () => {
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11");
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11");
	});
	it("should handle translations (mk)", () => {
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual([["Lev.1", "ERV"]]);
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual([["Lev.1", "ERV"]]);
	});
	it("should handle book ranges (mk)", () => {
		p.set_options({ book_alone_strategy: "full", book_range_strategy: "include" });
		expect(p.parse("Прва - Трета  Јован").osis()).toEqual("1John.1-3John.1");
	});
	it("should handle boundaries (mk)", () => {
		p.set_options({ book_alone_strategy: "full" });
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual("Matt.1-Matt.28");
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual("Matt.1.1");
	});
});

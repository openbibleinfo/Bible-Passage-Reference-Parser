"use strict";
import { bcv_parser } from "../../esm/bcv_parser.js";
import * as lang from "../../esm/lang/id.js";

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

describe("Localized book Gen (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Gen (id)", () => {
		expect(p.parse("Kejadian 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Kejd 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Kej 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("KEJADIAN 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("KEJD 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("KEJ 1:1").osis()).toEqual("Gen.1.1");
	});
});
describe("Localized book Exod (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Exod (id)", () => {
		expect(p.parse("Keluaran 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Kelr 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Kel 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("KELUARAN 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("KELR 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("KEL 1:1").osis()).toEqual("Exod.1.1");
	});
});
describe("Localized book Bel (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Bel (id)", () => {
		expect(p.parse("Dewa Bel dan Naga Babel 1:1").osis()).toEqual("Bel.1.1");
		expect(p.parse("Bel dan Naga 1:1").osis()).toEqual("Bel.1.1");
		expect(p.parse("Dewa Bel 1:1").osis()).toEqual("Bel.1.1");
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1");
	});
});
describe("Localized book Lev (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Lev (id)", () => {
		expect(p.parse("Imamat Orang Lewi 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Imamat 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Imt 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Im 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("IMAMAT ORANG LEWI 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("IMAMAT 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("IMT 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("IM 1:1").osis()).toEqual("Lev.1.1");
	});
});
describe("Localized book Num (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Num (id)", () => {
		expect(p.parse("Bilangan 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("Bil 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("BILANGAN 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("BIL 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1");
	});
});
describe("Localized book Sir (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Sir (id)", () => {
		expect(p.parse("Eklesiastikus 1:1").osis()).toEqual("Sir.1.1");
		expect(p.parse("Sirakh 1:1").osis()).toEqual("Sir.1.1");
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1");
	});
});
describe("Localized book Wis (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Wis (id)", () => {
		expect(p.parse("Kebijaksanaan Salomo 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Hikmat Salomo 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Kebijaksanaan 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Kebij Salomo 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Keb 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1");
	});
});
describe("Localized book Lam (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Lam (id)", () => {
		expect(p.parse("Nudub Yermia 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Ratapan 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Ratap 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Rat 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("NUDUB YERMIA 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("RATAPAN 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("RATAP 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("RAT 1:1").osis()).toEqual("Lam.1.1");
	});
});
describe("Localized book EpJer (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: EpJer (id)", () => {
		expect(p.parse("Surat Yeremia 1:1").osis()).toEqual("EpJer.1.1");
		expect(p.parse("Sur Yer 1:1").osis()).toEqual("EpJer.1.1");
		expect(p.parse("SurYer 1:1").osis()).toEqual("EpJer.1.1");
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1");
	});
});
describe("Localized book Rev (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Rev (id)", () => {
		expect(p.parse("Wahyu 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Wahy 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Wah 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Why 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("WAHYU 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("WAHY 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("WAH 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("WHY 1:1").osis()).toEqual("Rev.1.1");
	});
});
describe("Localized book PrMan (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: PrMan (id)", () => {
		expect(p.parse("Doa Manasye 1:1").osis()).toEqual("PrMan.1.1");
		expect(p.parse("Doa Man 1:1").osis()).toEqual("PrMan.1.1");
		expect(p.parse("Manasye 1:1").osis()).toEqual("PrMan.1.1");
		expect(p.parse("DoaMan 1:1").osis()).toEqual("PrMan.1.1");
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1");
	});
});
describe("Localized book Deut (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Deut (id)", () => {
		expect(p.parse("Ulangan 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Ul 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("ULANGAN 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("UL 1:1").osis()).toEqual("Deut.1.1");
	});
});
describe("Localized book Josh (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Josh (id)", () => {
		expect(p.parse("Yosua 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Yusak 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Yos 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("YOSUA 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("YUSAK 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("YOS 1:1").osis()).toEqual("Josh.1.1");
	});
});
describe("Localized book Judg (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Judg (id)", () => {
		expect(p.parse("Hakim-hakim 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Hak.-hak. 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Hak-hak. 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Hak.-hak 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Hak-hak 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Hak 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Hkm 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HAKIM-HAKIM 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HAK.-HAK. 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HAK-HAK. 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HAK.-HAK 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HAK-HAK 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HAK 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("HKM 1:1").osis()).toEqual("Judg.1.1");
	});
});
describe("Localized book Ruth (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ruth (id)", () => {
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("Rt 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("RT 1:1").osis()).toEqual("Ruth.1.1");
	});
});
describe("Localized book 1Esd (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Esd (id)", () => {
		expect(p.parse("Esdras Yunani 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("Ezra Yunani 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("1. Esdras 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("1 Esdras 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("3 Esdras 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("1 Esd 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("I Esd 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1");
	});
});
describe("Localized book 2Esd (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Esd (id)", () => {
		expect(p.parse("Esdras Latin 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("Ezra Latin 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("2 Esdras 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("4 Esdras 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("II Esd 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("2 Esd 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1");
	});
});
describe("Localized book Isa (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Isa (id)", () => {
		expect(p.parse("Yesaya 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Yes 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Ys 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("YESAYA 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("YES 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("YS 1:1").osis()).toEqual("Isa.1.1");
	});
});
describe("Localized book 2Sam (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Sam (id)", () => {
		expect(p.parse("Semuel Yang Kedua 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II Sam 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2Sa 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("SEMUEL YANG KEDUA 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("II SAM 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2SA 1:1").osis()).toEqual("2Sam.1.1");
	});
});
describe("Localized book 1Sam (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Sam (id)", () => {
		expect(p.parse("Semuel Yang Pertama 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I Sam 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1Sa 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("SEMUEL YANG PERTAMA 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("I SAM 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1SA 1:1").osis()).toEqual("1Sam.1.1");
	});
});
describe("Localized book 2Kgs (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Kgs (id)", () => {
		expect(p.parse("Raja-raja Yang Kedua 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. Raja-raja 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 Raja-raja 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II Raj 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 Raj 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2Raj 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2Rj 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("RAJA-RAJA YANG KEDUA 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2. RAJA-RAJA 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 RAJA-RAJA 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("II RAJ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 RAJ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2RAJ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2RJ 1:1").osis()).toEqual("2Kgs.1.1");
	});
});
describe("Localized book 1Kgs (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Kgs (id)", () => {
		expect(p.parse("Raja-raja Yang Pertama 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. Raja-raja 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 Raja-raja 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 Raj 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I Raj 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1Raj 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1Rj 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("RAJA-RAJA YANG PERTAMA 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1. RAJA-RAJA 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 RAJA-RAJA 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 RAJ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("I RAJ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1RAJ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1RJ 1:1").osis()).toEqual("1Kgs.1.1");
	});
});
describe("Localized book 2Chr (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Chr (id)", () => {
		expect(p.parse("Tawarikh Yang Kedua 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2. Tawarikh 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 Tawarikh 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 Tawh 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II Taw 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 Taw 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2Taw 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("TAWARIKH YANG KEDUA 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2. TAWARIKH 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 TAWARIKH 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 TAWH 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("II TAW 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 TAW 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2TAW 1:1").osis()).toEqual("2Chr.1.1");
	});
});
describe("Localized book 1Chr (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Chr (id)", () => {
		expect(p.parse("Tawarikh Yang Pertama 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1. Tawarikh 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 Tawarikh 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 Tawh 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 Taw 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I Taw 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1Taw 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("TAWARIKH YANG PERTAMA 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1. TAWARIKH 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 TAWARIKH 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 TAWH 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 TAW 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("I TAW 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1TAW 1:1").osis()).toEqual("1Chr.1.1");
	});
});
describe("Localized book Neh (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Neh (id)", () => {
		expect(p.parse("Nehemia 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Nehemya 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("2 Ezra 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Nehm 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEHEMIA 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEHEMYA 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("2 EZRA 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEHM 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1");
	});
});
describe("Localized book Ezra (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ezra (id)", () => {
		expect(p.parse("1 Ezra 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("Ezr 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("1 EZRA 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("EZR 1:1").osis()).toEqual("Ezra.1.1");
	});
});
describe("Localized book GkEsth (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: GkEsth (id)", () => {
		expect(p.parse("Ester Yunani 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("Est. Yunani 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("Est Yunani 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("Ester Grik 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("Est Yun 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("EstYun 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1");
	});
});
describe("Localized book Esth (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Esth (id)", () => {
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1");
	});
});
describe("Localized book Job (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Job (id)", () => {
		expect(p.parse("Ayub 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("Ayb 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("Ay 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("AYUB 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("AYB 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("AY 1:1").osis()).toEqual("Job.1.1");
	});
});
describe("Localized book Ps (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ps (id)", () => {
		expect(p.parse("Mazmur 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("Mzm 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("MAZMUR 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("MZM 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1");
	});
});
describe("Localized book PrAzar (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: PrAzar (id)", () => {
		expect(p.parse("Doa Azarya 1:1").osis()).toEqual("PrAzar.1.1");
		expect(p.parse("Doa Azar 1:1").osis()).toEqual("PrAzar.1.1");
		expect(p.parse("Azarya 1:1").osis()).toEqual("PrAzar.1.1");
		expect(p.parse("Doa Az 1:1").osis()).toEqual("PrAzar.1.1");
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1");
		expect(p.parse("DoaAz 1:1").osis()).toEqual("PrAzar.1.1");
	});
});
describe("Localized book Prov (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Prov (id)", () => {
		expect(p.parse("Surat Amsal Sulaiman 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Amsal 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Ams 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("SURAT AMSAL SULAIMAN 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("AMSAL 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("AMS 1:1").osis()).toEqual("Prov.1.1");
	});
});
describe("Localized book Eccl (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Eccl (id)", () => {
		expect(p.parse("Pengkhotbah 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Alkhatib 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Pengkh 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Pkhth 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Pkhb 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Pkh 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("PENGKHOTBAH 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("ALKHATIB 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("PENGKH 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("PKHTH 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("PKHB 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("PKH 1:1").osis()).toEqual("Eccl.1.1");
	});
});
describe("Localized book SgThree (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: SgThree (id)", () => {
		expect(p.parse("Lagu Pujian Ketiga Pemuda 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("Lagu 3 Pemuda 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("Lagu Pemuda 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("Tiga Pemuda 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("3 Pemuda 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("LagPuj 1:1").osis()).toEqual("SgThree.1.1");
	});
});
describe("Localized book Song (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Song (id)", () => {
		expect(p.parse("Syirul-asyar Sulaiman 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Kidung Agung 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Kid Ag 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Kidung 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("KidA 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Kid 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("SYIRUL-ASYAR SULAIMAN 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("KIDUNG AGUNG 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("KID AG 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("KIDUNG 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("KIDA 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("KID 1:1").osis()).toEqual("Song.1.1");
	});
});
describe("Localized book Jer (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jer (id)", () => {
		expect(p.parse("Yeremia 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Yermia 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Yer 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Yr 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("YEREMIA 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("YERMIA 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("YER 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("YR 1:1").osis()).toEqual("Jer.1.1");
	});
});
describe("Localized book Ezek (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ezek (id)", () => {
		expect(p.parse("Yehezkiel 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("Yeh 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("Yez 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("YEHEZKIEL 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("YEH 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("YEZ 1:1").osis()).toEqual("Ezek.1.1");
	});
});
describe("Localized book Dan (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Dan (id)", () => {
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("Dn 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("DN 1:1").osis()).toEqual("Dan.1.1");
	});
});
describe("Localized book Hos (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hos (id)", () => {
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("Ho 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("HO 1:1").osis()).toEqual("Hos.1.1");
	});
});
describe("Localized book Joel (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Joel (id)", () => {
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Yoel 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Yoël 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Yl 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("YOEL 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("YOËL 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("YL 1:1").osis()).toEqual("Joel.1.1");
	});
});
describe("Localized book Amos (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Amos (id)", () => {
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("Amo 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("AMO 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1");
	});
});
describe("Localized book Obad (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Obad (id)", () => {
		expect(p.parse("Obaja 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("Ob 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("OBAJA 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("OB 1:1").osis()).toEqual("Obad.1.1");
	});
});
describe("Localized book Jonah (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jonah (id)", () => {
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("Yunus 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("Yun 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("Yn 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("YUNUS 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("YUN 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("YN 1:1").osis()).toEqual("Jonah.1.1");
	});
});
describe("Localized book Mic (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mic (id)", () => {
		expect(p.parse("Mikha 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mik 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mkh 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mi 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MIKHA 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MIK 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MKH 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MI 1:1").osis()).toEqual("Mic.1.1");
	});
});
describe("Localized book Nah (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Nah (id)", () => {
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("Nh 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("NH 1:1").osis()).toEqual("Nah.1.1");
	});
});
describe("Localized book Hab (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hab (id)", () => {
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("Hbk 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("HBK 1:1").osis()).toEqual("Hab.1.1");
	});
});
describe("Localized book Zeph (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Zeph (id)", () => {
		expect(p.parse("Zefanya 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("Zef 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("ZEFANYA 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("ZEF 1:1").osis()).toEqual("Zeph.1.1");
	});
});
describe("Localized book Hag (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hag (id)", () => {
		expect(p.parse("Hagai 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Hajai 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Hg 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("HAGAI 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("HAJAI 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("HG 1:1").osis()).toEqual("Hag.1.1");
	});
});
describe("Localized book Zech (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Zech (id)", () => {
		expect(p.parse("Zakharia 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Zakaria 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Zak 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Za 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZAKHARIA 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZAKARIA 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZAK 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZA 1:1").osis()).toEqual("Zech.1.1");
	});
});
describe("Localized book Mal (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mal (id)", () => {
		expect(p.parse("Maleakhi 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("Maleaki 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("Ml 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("MALEAKHI 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("MALEAKI 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("ML 1:1").osis()).toEqual("Mal.1.1");
	});
});
describe("Localized book Matt (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Matt (id)", () => {
		expect(p.parse("Matius 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MATIUS 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1");
	});
});
describe("Localized book Mark (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mark (id)", () => {
		expect(p.parse("Markus 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mar 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mrk 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mr 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MARKUS 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MAR 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MRK 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MR 1:1").osis()).toEqual("Mark.1.1");
	});
});
describe("Localized book Luke (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Luke (id)", () => {
		expect(p.parse("Lukas 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Luk 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Lk 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LUKAS 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LUK 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LK 1:1").osis()).toEqual("Luke.1.1");
	});
});
describe("Localized book 1John (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1John (id)", () => {
		expect(p.parse("1. Yohanes 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Yohanes 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Yahya 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Yhn 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Yoh 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I Yoh 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1Yoh 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. YOHANES 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 YOHANES 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 YAHYA 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 YHN 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 YOH 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("I YOH 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1YOH 1:1").osis()).toEqual("1John.1.1");
	});
});
describe("Localized book 2John (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2John (id)", () => {
		expect(p.parse("2. Yohanes 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Yohanes 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Yahya 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II Yoh 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Yhn 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Yoh 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2Yoh 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2. YOHANES 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 YOHANES 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 YAHYA 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("II YOH 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 YHN 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 YOH 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2YOH 1:1").osis()).toEqual("2John.1.1");
	});
});
describe("Localized book 3John (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 3John (id)", () => {
		expect(p.parse("3. Yohanes 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Yohanes 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Yahya 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III Yoh 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Yhn 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Yoh 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3Yoh 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. YOHANES 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 YOHANES 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 YAHYA 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("III YOH 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 YHN 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 YOH 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3YOH 1:1").osis()).toEqual("3John.1.1");
	});
});
describe("Localized book John (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: John (id)", () => {
		expect(p.parse("Yohanes 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Yahya 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Yohs 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Yoh 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("YOHANES 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("YAHYA 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("YOHS 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("YOH 1:1").osis()).toEqual("John.1.1");
	});
});
describe("Localized book Acts (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Acts (id)", () => {
		expect(p.parse("Kisah Rasul-rasul 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Kisah Para Rasul 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Kis Para Rasul 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Kisah 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KisR 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Kis 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KISAH RASUL-RASUL 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KISAH PARA RASUL 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KIS PARA RASUL 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KISAH 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KISR 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("KIS 1:1").osis()).toEqual("Acts.1.1");
	});
});
describe("Localized book Rom (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Rom (id)", () => {
		expect(p.parse("Roma 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Rum 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Rm 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ROMA 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("RUM 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("RM 1:1").osis()).toEqual("Rom.1.1");
	});
});
describe("Localized book 2Cor (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Cor (id)", () => {
		expect(p.parse("2. Korintus 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Korintus 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II Kor 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Ko 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2Kor 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2. KORINTUS 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 KORINTUS 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("II KOR 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 KO 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2KOR 1:1").osis()).toEqual("2Cor.1.1");
	});
});
describe("Localized book 1Cor (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Cor (id)", () => {
		expect(p.parse("1. Korintus 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Korintus 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I Kor 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Ko 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1Kor 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1. KORINTUS 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 KORINTUS 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("I KOR 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 KO 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1KOR 1:1").osis()).toEqual("1Cor.1.1");
	});
});
describe("Localized book Gal (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Gal (id)", () => {
		expect(p.parse("Galatia 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("GALATIA 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1");
	});
});
describe("Localized book Eph (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Eph (id)", () => {
		expect(p.parse("Efesus 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Epesus 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Efs 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EFESUS 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EPESUS 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EFS 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1");
	});
});
describe("Localized book Phil (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Phil (id)", () => {
		expect(p.parse("Filipi 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Pilipi 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Fili 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Flp 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("FILIPI 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("PILIPI 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("FILI 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("FLP 1:1").osis()).toEqual("Phil.1.1");
	});
});
describe("Localized book Col (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Col (id)", () => {
		expect(p.parse("Kolose 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Kolos 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("KOLOSE 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("KOLOS 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1");
	});
});
describe("Localized book 2Thess (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Thess (id)", () => {
		expect(p.parse("2. Tesalonika 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Tesalonika 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Tesl 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II Tes 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Tes 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2. TESALONIKA 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 TESALONIKA 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 TESL 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("II TES 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 TES 1:1").osis()).toEqual("2Thess.1.1");
	});
});
describe("Localized book 1Thess (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Thess (id)", () => {
		expect(p.parse("1. Tesalonika 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Tesalonika 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Tesl 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Tes 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I Tes 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1. TESALONIKA 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 TESALONIKA 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 TESL 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 TES 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("I TES 1:1").osis()).toEqual("1Thess.1.1");
	});
});
describe("Localized book 2Tim (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Tim (id)", () => {
		expect(p.parse("2. Timotius 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 Timotius 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II Tim 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 Tm 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2. TIMOTIUS 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 TIMOTIUS 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("II TIM 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 TM 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1");
	});
});
describe("Localized book 1Tim (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Tim (id)", () => {
		expect(p.parse("1. Timotius 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 Timotius 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I Tim 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 Tm 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1. TIMOTIUS 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 TIMOTIUS 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("I TIM 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 TM 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1");
	});
});
describe("Localized book Titus (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Titus (id)", () => {
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Ti 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TI 1:1").osis()).toEqual("Titus.1.1");
	});
});
describe("Localized book Phlm (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Phlm (id)", () => {
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Pilemon 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Flmn 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Flm 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("PILEMON 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("FLMN 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("FLM 1:1").osis()).toEqual("Phlm.1.1");
	});
});
describe("Localized book Heb (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Heb (id)", () => {
		expect(p.parse("Ibrani 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Ibrn 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Ibr 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("IBRANI 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("IBRN 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("IBR 1:1").osis()).toEqual("Heb.1.1");
	});
});
describe("Localized book Jas (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jas (id)", () => {
		expect(p.parse("Yakobus 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Yakub 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Yak 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Yk 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("YAKOBUS 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("YAKUB 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("YAK 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("YK 1:1").osis()).toEqual("Jas.1.1");
	});
});
describe("Localized book 2Pet (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Pet (id)", () => {
		expect(p.parse("2. Petrus 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 Petrus 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II Pet 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 Pet 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 Ptr 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2. PETRUS 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 PETRUS 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("II PET 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 PET 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 PTR 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1");
	});
});
describe("Localized book 1Pet (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Pet (id)", () => {
		expect(p.parse("1. Petrus 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 Petrus 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 Pet 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 Ptr 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I Pet 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1. PETRUS 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 PETRUS 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 PET 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 PTR 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("I PET 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1");
	});
});
describe("Localized book Jude (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jude (id)", () => {
		expect(p.parse("Yehuda 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Yudas 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Yds 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Yud 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("YEHUDA 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("YUDAS 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("YDS 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("YUD 1:1").osis()).toEqual("Jude.1.1");
	});
});
describe("Localized book Tob (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Tob (id)", () => {
		expect(p.parse("Tobit 1:1").osis()).toEqual("Tob.1.1");
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1");
	});
});
describe("Localized book Jdt (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jdt (id)", () => {
		expect(p.parse("Yudit 1:1").osis()).toEqual("Jdt.1.1");
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1");
		expect(p.parse("Ydt 1:1").osis()).toEqual("Jdt.1.1");
	});
});
describe("Localized book Bar (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Bar (id)", () => {
		expect(p.parse("Barukh 1:1").osis()).toEqual("Bar.1.1");
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1");
		expect(p.parse("Br 1:1").osis()).toEqual("Bar.1.1");
	});
});
describe("Localized book Sus (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Sus (id)", () => {
		expect(p.parse("Susana 1:1").osis()).toEqual("Sus.1.1");
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1");
	});
});
describe("Localized book 2Macc (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Macc (id)", () => {
		expect(p.parse("2 Makabe 1:1").osis()).toEqual("2Macc.1.1");
		expect(p.parse("II Mak 1:1").osis()).toEqual("2Macc.1.1");
		expect(p.parse("2 Mak 1:1").osis()).toEqual("2Macc.1.1");
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1");
	});
});
describe("Localized book 3Macc (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 3Macc (id)", () => {
		expect(p.parse("3 Makabe 1:1").osis()).toEqual("3Macc.1.1");
		expect(p.parse("III Mak 1:1").osis()).toEqual("3Macc.1.1");
		expect(p.parse("3 Mak 1:1").osis()).toEqual("3Macc.1.1");
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1");
	});
});
describe("Localized book 4Macc (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 4Macc (id)", () => {
		expect(p.parse("4 Makabe 1:1").osis()).toEqual("4Macc.1.1");
		expect(p.parse("IV Mak 1:1").osis()).toEqual("4Macc.1.1");
		expect(p.parse("4 Mak 1:1").osis()).toEqual("4Macc.1.1");
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1");
	});
});
describe("Localized book 1Macc (id)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Macc (id)", () => {
		expect(p.parse("1. Makabe 1:1").osis()).toEqual("1Macc.1.1");
		expect(p.parse("1 Makabe 1:1").osis()).toEqual("1Macc.1.1");
		expect(p.parse("1 Mak 1:1").osis()).toEqual("1Macc.1.1");
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1");
		expect(p.parse("I Mak 1:1").osis()).toEqual("1Macc.1.1");
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
		expect(p.regexps.languages).toEqual(["id"]);
	});

	it("should handle ranges (id)", () => {
		expect(p.parse("Titus 1:1 sampai 2").osis()).toEqual("Titus.1.1-Titus.1.2");
		expect(p.parse("Matt 1sampai2").osis()).toEqual("Matt.1-Matt.2");
		expect(p.parse("Phlm 2 SAMPAI 3").osis()).toEqual("Phlm.1.2-Phlm.1.3");
	});
	it("should handle chapters (id)", () => {
		expect(p.parse("Titus 1:1, pasal 2").osis()).toEqual("Titus.1.1,Titus.2");
		expect(p.parse("Matt 3:4 PASAL 6").osis()).toEqual("Matt.3.4,Matt.6");
	});
	it("should handle verses (id)", () => {
		expect(p.parse("Exod 1:1 ayat 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm AYAT 6").osis()).toEqual("Phlm.1.6");
	});
	it("should handle 'and' (id)", () => {
		expect(p.parse("Exod 1:1 bandingkan 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 BANDINGKAN 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
		expect(p.parse("Exod 1:1 lih. 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 LIH. 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
		expect(p.parse("Exod 1:1 lih 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 LIH 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
		expect(p.parse("Exod 1:1 bdk. 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 BDK. 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
		expect(p.parse("Exod 1:1 bdk 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 BDK 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
	});
	it("should handle titles (id)", () => {
		expect(p.parse("Ps 3 judul, 4:2, 5:judul").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1");
		expect(p.parse("PS 3 JUDUL, 4:2, 5:JUDUL").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1");
	});
	it("should handle 'ff' (id)", () => {
		expect(p.parse("Rev 3dst, 4:2dst").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11");
		expect(p.parse("REV 3 DST, 4:2 DST").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11");
	});
	it("should handle translations (id)", () => {
		expect(p.parse("Lev 1 (AMD)").osis_and_translations()).toEqual([["Lev.1", "AMD"]]);
		expect(p.parse("lev 1 amd").osis_and_translations()).toEqual([["Lev.1", "AMD"]]);
		expect(p.parse("Lev 1 (TB)").osis_and_translations()).toEqual([["Lev.1", "TB"]]);
		expect(p.parse("lev 1 tb").osis_and_translations()).toEqual([["Lev.1", "TB"]]);
		expect(p.parse("Lev 1 (TSI)").osis_and_translations()).toEqual([["Lev.1", "TSI"]]);
		expect(p.parse("lev 1 tsi").osis_and_translations()).toEqual([["Lev.1", "TSI"]]);
	});
	it("should handle book ranges (id)", () => {
		p.set_options({ book_alone_strategy: "full", book_range_strategy: "include" });
		expect(p.parse("1 sampai 3  Yohanes").osis()).toEqual("1John.1-3John.1");
	});
	it("should handle boundaries (id)", () => {
		p.set_options({ book_alone_strategy: "full" });
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual("Matt.1-Matt.28");
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual("Matt.1.1");
	});
});

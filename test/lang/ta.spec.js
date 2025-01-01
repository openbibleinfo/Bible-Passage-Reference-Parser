"use strict";
import { bcv_parser } from "../../es/bcv_parser.js";
import * as lang from "../../es/lang/ta.js";

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

describe("Localized book Gen (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Gen (ta)", () => {
		expect(p.parse("தொடக்க நூல் 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Ātiyākamam 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ஆதியாகமம் 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("தொநூ 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ஆதி 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("தொடக்க நூல் 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ĀTIYĀKAMAM 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ஆதியாகமம் 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("தொநூ 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1");
		expect(p.parse("ஆதி 1:1").osis()).toEqual("Gen.1.1");
	});
});
describe("Localized book Exod (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Exod (ta)", () => {
		expect(p.parse("விடுதலைப் பயணம் 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Yāttirākamam 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("யாத்திராகமம் 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("யாத் 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("விப 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("விடுதலைப் பயணம் 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("YĀTTIRĀKAMAM 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("யாத்திராகமம் 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("யாத் 1:1").osis()).toEqual("Exod.1.1");
		expect(p.parse("விப 1:1").osis()).toEqual("Exod.1.1");
	});
});
describe("Localized book Bel (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Bel (ta)", () => {
		expect(p.parse("பேல் தெய்வமும் அரக்கப்பாம்பும் என்பவையாகும் 1:1").osis()).toEqual("Bel.1.1");
		expect(p.parse("பேல் தெய்வமும் அரக்கப்பாம்பும் 1:1").osis()).toEqual("Bel.1.1");
		expect(p.parse("பேல் 1:1").osis()).toEqual("Bel.1.1");
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1");
	});
});
describe("Localized book Lev (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Lev (ta)", () => {
		expect(p.parse("Lēviyarākamam 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("லேவியராகமம் 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("லேவியர் 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("லேவி 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("LĒVIYARĀKAMAM 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("லேவியராகமம் 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("லேவியர் 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("லேவி 1:1").osis()).toEqual("Lev.1.1");
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1");
	});
});
describe("Localized book Num (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Num (ta)", () => {
		expect(p.parse("Eṇṇākamam 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("எண்ணாகமம் 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("எண்ணிக்கை 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("எண் 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("EṆṆĀKAMAM 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("எண்ணாகமம் 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("எண்ணிக்கை 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1");
		expect(p.parse("எண் 1:1").osis()).toEqual("Num.1.1");
	});
});
describe("Localized book Sir (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Sir (ta)", () => {
		expect(p.parse("சீராக்கின் ஞானம் 1:1").osis()).toEqual("Sir.1.1");
		expect(p.parse("சீராக் ஆகமம் 1:1").osis()).toEqual("Sir.1.1");
		expect(p.parse("சீஞா 1:1").osis()).toEqual("Sir.1.1");
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1");
	});
});
describe("Localized book Wis (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Wis (ta)", () => {
		expect(p.parse("சாலமோனின் ஞானம் 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("ஞானாகமம் 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("சாஞா 1:1").osis()).toEqual("Wis.1.1");
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1");
	});
});
describe("Localized book Lam (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Lam (ta)", () => {
		expect(p.parse("எரேமியாவின் புலம்பல் 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Pulampal 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("புலம்பல் 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("புலம் 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("புல 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("எரேமியாவின் புலம்பல் 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("PULAMPAL 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("புலம்பல் 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("புலம் 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1");
		expect(p.parse("புல 1:1").osis()).toEqual("Lam.1.1");
	});
});
describe("Localized book EpJer (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: EpJer (ta)", () => {
		expect(p.parse("அவை இளைஞர் மூவரின் பாடல் 1:1").osis()).toEqual("EpJer.1.1");
		expect(p.parse("எரேமியாவின் கடிதம் 1:1").osis()).toEqual("EpJer.1.1");
		expect(p.parse("எரேமியாவின் மடல் 1:1").osis()).toEqual("EpJer.1.1");
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1");
	});
});
describe("Localized book Rev (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Rev (ta)", () => {
		expect(p.parse("யோவானுக்கு வெளிப்படுத்தின விசேஷம் 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Veḷippaṭuttiṉa Vicēṭaṅkaḷ 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("வெளிப்படுத்தின விசேடங்கள் 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Veḷippaṭuttiṉa 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("திருவெளிப்பாடு 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("திவெ 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("வெளி 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("யோவானுக்கு வெளிப்படுத்தின விசேஷம் 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("VEḶIPPAṬUTTIṈA VICĒṬAṄKAḶ 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("வெளிப்படுத்தின விசேடங்கள் 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("VEḶIPPAṬUTTIṈA 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("திருவெளிப்பாடு 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("திவெ 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("வெளி 1:1").osis()).toEqual("Rev.1.1");
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1");
	});
});
describe("Localized book PrMan (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: PrMan (ta)", () => {
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1");
	});
});
describe("Localized book Deut (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Deut (ta)", () => {
		expect(p.parse("இணைச் சட்டம் 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Upākamam 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("உபாகமம் 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("உபா 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("இச 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("இணைச் சட்டம் 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("UPĀKAMAM 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("உபாகமம் 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("உபா 1:1").osis()).toEqual("Deut.1.1");
		expect(p.parse("இச 1:1").osis()).toEqual("Deut.1.1");
	});
});
describe("Localized book Josh (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Josh (ta)", () => {
		expect(p.parse("யோசுவாவின் புத்தகம் 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Yōcuvā 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("யோசுவா 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("யோசு 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("யோசுவாவின் புத்தகம் 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("YŌCUVĀ 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("யோசுவா 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1");
		expect(p.parse("யோசு 1:1").osis()).toEqual("Josh.1.1");
	});
});
describe("Localized book Judg (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Judg (ta)", () => {
		expect(p.parse("நியாயாதிபதிகளின் புத்தகம் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியாயாதிபதிகள் ஆகமம் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நீதித் தலைவர்கள் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Niyāyātipatikaḷ 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியாயாதிபதிகள் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நீதிபதிகள் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியா 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நீத 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியாயாதிபதிகளின் புத்தகம் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியாயாதிபதிகள் ஆகமம் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நீதித் தலைவர்கள் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("NIYĀYĀTIPATIKAḶ 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியாயாதிபதிகள் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நீதிபதிகள் 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நியா 1:1").osis()).toEqual("Judg.1.1");
		expect(p.parse("நீத 1:1").osis()).toEqual("Judg.1.1");
	});
});
describe("Localized book Ruth (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ruth (ta)", () => {
		expect(p.parse("ரூத்தின் சரித்திரம் 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("ரூத்து 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("ரூத் 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("Rūt 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("ரூத்தின் சரித்திரம் 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("ரூத்து 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("ரூத் 1:1").osis()).toEqual("Ruth.1.1");
		expect(p.parse("RŪT 1:1").osis()).toEqual("Ruth.1.1");
	});
});
describe("Localized book 1Esd (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Esd (ta)", () => {
		expect(p.parse("1 எஸ்திராஸ் 1:1").osis()).toEqual("1Esd.1.1");
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1");
	});
});
describe("Localized book 2Esd (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Esd (ta)", () => {
		expect(p.parse("2 எஸ்திராஸ் 1:1").osis()).toEqual("2Esd.1.1");
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1");
	});
});
describe("Localized book Isa (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Isa (ta)", () => {
		expect(p.parse("ஏசாயா தீர்க்கதரிசியின் புத்தகம் 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Ecāyā 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("எசாயா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ஏசாயா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("எசா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ஏசா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ஏசாயா தீர்க்கதரிசியின் புத்தகம் 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ECĀYĀ 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("எசாயா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ஏசாயா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("எசா 1:1").osis()).toEqual("Isa.1.1");
		expect(p.parse("ஏசா 1:1").osis()).toEqual("Isa.1.1");
	});
});
describe("Localized book 2Sam (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Sam (ta)", () => {
		expect(p.parse("சாமுவேலின் இரண்டாம் புத்தகம் 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 சாமுவேல் 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 Cāmuvēl 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 அரசுகள் 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 சாமு 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("சாமுவேலின் இரண்டாம் புத்தகம் 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 சாமுவேல் 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 CĀMUVĒL 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 அரசுகள் 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2 சாமு 1:1").osis()).toEqual("2Sam.1.1");
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1");
	});
});
describe("Localized book 1Sam (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Sam (ta)", () => {
		expect(p.parse("சாமுவேலின் முதலாம் புத்தகம் 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 சாமுவேல் 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 Cāmuvēl 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 அரசுகள் 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 சாமு 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("சாமுவேலின் முதலாம் புத்தகம் 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 சாமுவேல் 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 CĀMUVĒL 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 அரசுகள் 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1 சாமு 1:1").osis()).toEqual("1Sam.1.1");
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1");
	});
});
describe("Localized book 2Kgs (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Kgs (ta)", () => {
		expect(p.parse("இராஜாக்களின் இரண்டாம் புத்தகம் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 இராஜாக்கள் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 Irājākkaḷ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 அரசர்கள் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("4 அரசுகள் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 இராஜா 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 இரா 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 அர 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("இராஜாக்களின் இரண்டாம் புத்தகம் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 இராஜாக்கள் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 IRĀJĀKKAḶ 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 அரசர்கள் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("4 அரசுகள் 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 இராஜா 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 இரா 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2 அர 1:1").osis()).toEqual("2Kgs.1.1");
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1");
	});
});
describe("Localized book 1Kgs (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Kgs (ta)", () => {
		expect(p.parse("இராஜாக்களின் முதலாம் புத்தகம் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 இராஜாக்கள் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 Irājākkaḷ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 அரசர்கள் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("3 அரசுகள் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 இராஜா 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 இரா 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 அர 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("இராஜாக்களின் முதலாம் புத்தகம் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 இராஜாக்கள் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 IRĀJĀKKAḶ 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 அரசர்கள் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("3 அரசுகள் 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 இராஜா 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 இரா 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1 அர 1:1").osis()).toEqual("1Kgs.1.1");
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1");
	});
});
describe("Localized book 2Chr (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Chr (ta)", () => {
		expect(p.parse("நாளாகமத்தின் இரண்டாம் புத்தகம் 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 குறிப்பேடு 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 Nāḷākamam 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 நாளாகமம் 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 குறி 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 நாளா 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("நாளாகமத்தின் இரண்டாம் புத்தகம் 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 குறிப்பேடு 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 NĀḶĀKAMAM 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 நாளாகமம் 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 குறி 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2 நாளா 1:1").osis()).toEqual("2Chr.1.1");
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1");
	});
});
describe("Localized book 1Chr (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Chr (ta)", () => {
		expect(p.parse("நாளாகமத்தின் முதலாம் புத்தகம் 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 குறிப்பேடு 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 Nāḷākamam 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 நாளாகமம் 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 குறி 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 நாளா 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("நாளாகமத்தின் முதலாம் புத்தகம் 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 குறிப்பேடு 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 NĀḶĀKAMAM 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 நாளாகமம் 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 குறி 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1 நாளா 1:1").osis()).toEqual("1Chr.1.1");
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1");
	});
});
describe("Localized book Ezra (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ezra (ta)", () => {
		expect(p.parse("எஸ்றாவின் புத்தகம் 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("எஸ்ரா 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("எஸ்றா 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("Esṛā 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("எஸ்றாவின் புத்தகம் 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("எஸ்ரா 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("எஸ்றா 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("ESṚĀ 1:1").osis()).toEqual("Ezra.1.1");
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1");
	});
});
describe("Localized book Neh (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Neh (ta)", () => {
		expect(p.parse("நெகேமியாவின் புத்தகம் 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Nekēmiyā 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("நெகேமியா 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("நெகே 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("நெகேமியாவின் புத்தகம் 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEKĒMIYĀ 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("நெகேமியா 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("நெகே 1:1").osis()).toEqual("Neh.1.1");
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1");
	});
});
describe("Localized book GkEsth (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: GkEsth (ta)", () => {
		expect(p.parse("எஸ்தர் \(கிரேக்கம்\) 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("எஸ்தர் \(கி\) 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("எஸ்தர் (கி) 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("எஸ் \(கி\) 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("எஸ் (கி) 1:1").osis()).toEqual("GkEsth.1.1");
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1");
	});
});
describe("Localized book Esth (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Esth (ta)", () => {
		expect(p.parse("எஸ்தரின் சரித்திரம் 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("எஸ்தர் 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("Estar 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("எஸ் 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("எஸ்தரின் சரித்திரம் 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("எஸ்தர் 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ESTAR 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1");
		expect(p.parse("எஸ் 1:1").osis()).toEqual("Esth.1.1");
	});
});
describe("Localized book Job (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Job (ta)", () => {
		expect(p.parse("யோபுடைய சரித்திரம் 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("Yōpu 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("யோபு 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("யோபுடைய சரித்திரம் 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("YŌPU 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("யோபு 1:1").osis()).toEqual("Job.1.1");
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1");
	});
});
describe("Localized book SgThree (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: SgThree (ta)", () => {
		expect(p.parse("இளைஞர் மூவரின் பாடல் 1:1").osis()).toEqual("SgThree.1.1");
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1");
	});
});
describe("Localized book Song (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Song (ta)", () => {
		expect(p.parse("சாலொமோனின் உன்னதப்பாட்டு 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("இனிமைமிகு பாடல் 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்னத சங்கீதம் 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்னதப்பாட்டு 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Uṉṉatappāṭṭu 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்னத பாட்டு 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்ன 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("இபா 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("சாலொமோனின் உன்னதப்பாட்டு 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("இனிமைமிகு பாடல் 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்னத சங்கீதம் 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்னதப்பாட்டு 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("UṈṈATAPPĀṬṬU 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்னத பாட்டு 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("உன்ன 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("இபா 1:1").osis()).toEqual("Song.1.1");
	});
});
describe("Localized book Ps (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ps (ta)", () => {
		expect(p.parse("சங்கீத புத்தகம் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("திருப்பாடல்கள் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீதங்கள் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("திருப்பாடல் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("Caṅkītam 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீதம் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சஙகீதம் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீ 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("திபா 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீத புத்தகம் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("திருப்பாடல்கள் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீதங்கள் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("திருப்பாடல் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("CAṄKĪTAM 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீதம் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சஙகீதம் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங்கீ 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("திபா 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("சங் 1:1").osis()).toEqual("Ps.1.1");
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1");
	});
});
describe("Localized book PrAzar (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: PrAzar (ta)", () => {
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1");
		expect(p.parse("அசரியா 1:1").osis()).toEqual("PrAzar.1.1");
	});
});
describe("Localized book Prov (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Prov (ta)", () => {
		expect(p.parse("பழமொழி ஆகமம் 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Nītimoḻikaḷ 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("நீதிமொழிகள் 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("நீதி 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("நீமொ 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("பழமொழி ஆகமம் 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("NĪTIMOḺIKAḶ 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("நீதிமொழிகள் 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("நீதி 1:1").osis()).toEqual("Prov.1.1");
		expect(p.parse("நீமொ 1:1").osis()).toEqual("Prov.1.1");
	});
});
describe("Localized book Eccl (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Eccl (ta)", () => {
		expect(p.parse("சங்கத் திருவுரை ஆகமம் 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("சபை உரையாளர் 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Piracaṅki 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("பிரசங்கி 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("பிரச 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("சஉ 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("சங்கத் திருவுரை ஆகமம் 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("சபை உரையாளர் 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("PIRACAṄKI 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("பிரசங்கி 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("பிரச 1:1").osis()).toEqual("Eccl.1.1");
		expect(p.parse("சஉ 1:1").osis()).toEqual("Eccl.1.1");
	});
});
describe("Localized book Jer (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jer (ta)", () => {
		expect(p.parse("எரேமியா தீர்க்கதரிசியின் புத்தகம் 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Erēmiyā 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("எரேமியா 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("ஏரேமியா 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("எரே 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("ஏரே 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("எரேமியா தீர்க்கதரிசியின் புத்தகம் 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("ERĒMIYĀ 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("எரேமியா 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("ஏரேமியா 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("எரே 1:1").osis()).toEqual("Jer.1.1");
		expect(p.parse("ஏரே 1:1").osis()).toEqual("Jer.1.1");
	});
});
describe("Localized book Ezek (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Ezek (ta)", () => {
		expect(p.parse("எசேக்கியேல் தீர்க்கதரிசியின் புத்தகம் 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("எசேக்கியேல் 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("Ecēkkiyēl 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("எசே 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("எசேக்கியேல் தீர்க்கதரிசியின் புத்தகம் 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("எசேக்கியேல் 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("ECĒKKIYĒL 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1");
		expect(p.parse("எசே 1:1").osis()).toEqual("Ezek.1.1");
	});
});
describe("Localized book Dan (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Dan (ta)", () => {
		expect(p.parse("தானியேலின் புத்தகம் 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("தானியேல் 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("Tāṉiyēl 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("தானி 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("தானியேலின் புத்தகம் 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("தானியேல் 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("TĀṈIYĒL 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("தானி 1:1").osis()).toEqual("Dan.1.1");
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1");
	});
});
describe("Localized book Hos (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hos (ta)", () => {
		expect(p.parse("Ōciyā 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஒசேயா 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசியா 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசேயா 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசி 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசே 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ŌCIYĀ 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஒசேயா 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசியா 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசேயா 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசி 1:1").osis()).toEqual("Hos.1.1");
		expect(p.parse("ஓசே 1:1").osis()).toEqual("Hos.1.1");
	});
});
describe("Localized book Joel (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Joel (ta)", () => {
		expect(p.parse("யோவேல் 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Yōvēl 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("யோவே 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("யோவேல் 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("YŌVĒL 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1");
		expect(p.parse("யோவே 1:1").osis()).toEqual("Joel.1.1");
	});
});
describe("Localized book Amos (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Amos (ta)", () => {
		expect(p.parse("ஆமோஸ் 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("Āmōs 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("ஆமோ 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("ஆமோஸ் 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("ĀMŌS 1:1").osis()).toEqual("Amos.1.1");
		expect(p.parse("ஆமோ 1:1").osis()).toEqual("Amos.1.1");
	});
});
describe("Localized book Obad (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Obad (ta)", () => {
		expect(p.parse("Opatiyā 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ஒபதியா 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ஒபதி 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ஒப 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("OPATIYĀ 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ஒபதியா 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ஒபதி 1:1").osis()).toEqual("Obad.1.1");
		expect(p.parse("ஒப 1:1").osis()).toEqual("Obad.1.1");
	});
});
describe("Localized book Jonah (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jonah (ta)", () => {
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("Yōṉā 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("யோனா 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("YŌṈĀ 1:1").osis()).toEqual("Jonah.1.1");
		expect(p.parse("யோனா 1:1").osis()).toEqual("Jonah.1.1");
	});
});
describe("Localized book Mic (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mic (ta)", () => {
		expect(p.parse("மீக்கா 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mīkā 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("மீகா 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("மீக் 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("மீக்கா 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MĪKĀ 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("மீகா 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("மீக் 1:1").osis()).toEqual("Mic.1.1");
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1");
	});
});
describe("Localized book Nah (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Nah (ta)", () => {
		expect(p.parse("நாகூம் 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("Nākūm 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("நாகூ 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("நாகூம் 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("NĀKŪM 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("நாகூ 1:1").osis()).toEqual("Nah.1.1");
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1");
	});
});
describe("Localized book Hab (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hab (ta)", () => {
		expect(p.parse("அபக்கூக்கு 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("Āpakūk 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ஆபகூக் 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("அப 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ஆப 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("அபக்கூக்கு 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ĀPAKŪK 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ஆபகூக் 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("அப 1:1").osis()).toEqual("Hab.1.1");
		expect(p.parse("ஆப 1:1").osis()).toEqual("Hab.1.1");
	});
});
describe("Localized book Zeph (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Zeph (ta)", () => {
		expect(p.parse("Ceppaṉiyā 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("செப்பனியா 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("செப் 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("CEPPAṈIYĀ 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("செப்பனியா 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1");
		expect(p.parse("செப் 1:1").osis()).toEqual("Zeph.1.1");
	});
});
describe("Localized book Hag (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Hag (ta)", () => {
		expect(p.parse("ஆகாய் 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Ākāy 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("ஆகா 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("ஆகாய் 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("ĀKĀY 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1");
		expect(p.parse("ஆகா 1:1").osis()).toEqual("Hag.1.1");
	});
});
describe("Localized book Zech (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Zech (ta)", () => {
		expect(p.parse("செக்கரியா 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Cakariyā 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("சகரியா 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("சகரி 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("செக் 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("செக்கரியா 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("CAKARIYĀ 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("சகரியா 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("சகரி 1:1").osis()).toEqual("Zech.1.1");
		expect(p.parse("செக் 1:1").osis()).toEqual("Zech.1.1");
	});
});
describe("Localized book Mal (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mal (ta)", () => {
		expect(p.parse("எபிரேயம் 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("Malkiyā 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மலாக்கி 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மல்கியா 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மல்கி 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மலா 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("எபிரேயம் 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("MALKIYĀ 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மலாக்கி 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மல்கியா 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மல்கி 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1");
		expect(p.parse("மலா 1:1").osis()).toEqual("Mal.1.1");
	});
});
describe("Localized book Matt (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Matt (ta)", () => {
		expect(p.parse("மத்தேயு எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு எழுதிய நற்செய்தி 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு நற்செய்தி 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Mattēyu Naṛceyti 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Mattēyu 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத் 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு எழுதிய நற்செய்தி 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு நற்செய்தி 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MATTĒYU NAṚCEYTI 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MATTĒYU 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத்தேயு 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1");
		expect(p.parse("மத் 1:1").osis()).toEqual("Matt.1.1");
	});
});
describe("Localized book Mark (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Mark (ta)", () => {
		expect(p.parse("மாற்கு எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு எழுதிய நற்செய்தி 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு நற்செய்தி 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Māṛku Naṛceyti 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Māṛku 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற் 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு எழுதிய நற்செய்தி 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு நற்செய்தி 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MĀṚKU NAṚCEYTI 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற்கு 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MĀṚKU 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1");
		expect(p.parse("மாற் 1:1").osis()).toEqual("Mark.1.1");
	});
});
describe("Localized book Luke (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Luke (ta)", () => {
		expect(p.parse("லூக்கா எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா எழுதிய நற்செய்தி 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா நற்செய்தி 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Lūkkā Naṛceyti 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Lūkkā 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக் 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூ 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா எழுதிய நற்செய்தி 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா நற்செய்தி 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LŪKKĀ NAṚCEYTI 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக்கா 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LŪKKĀ 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூக் 1:1").osis()).toEqual("Luke.1.1");
		expect(p.parse("லூ 1:1").osis()).toEqual("Luke.1.1");
	});
});
describe("Localized book 1John (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1John (ta)", () => {
		expect(p.parse("Yōvaṉ Eḻutiya Mutalāvatu Nirupam 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவன் எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவான் எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவான் எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவான் முதல் திருமுகம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("Mutalāvatu யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("முதலாவது யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 அருளப்பர் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 Yōvaṉ 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 யோவா 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 யோ 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("YŌVAṈ EḺUTIYA MUTALĀVATU NIRUPAM 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவன் எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவான் எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவான் எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("யோவான் முதல் திருமுகம் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("MUTALĀVATU யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("முதலாவது யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 அருளப்பர் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1. யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 யோவான் 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 YŌVAṈ 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 யோவா 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1");
		expect(p.parse("1 யோ 1:1").osis()).toEqual("1John.1.1");
	});
});
describe("Localized book 2John (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2John (ta)", () => {
		expect(p.parse("Yōvaṉ Eḻutiya Iraṇṭāvatu Nirupam 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவான் எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவன் எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவான் எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவான் இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 அருளப்பர் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 யோவான் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 Yōvaṉ 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 யோவா 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 யோ 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("YŌVAṈ EḺUTIYA IRAṆṬĀVATU NIRUPAM 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவான் எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவன் எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவான் எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("யோவான் இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 அருளப்பர் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 யோவான் 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 YŌVAṈ 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 யோவா 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1");
		expect(p.parse("2 யோ 1:1").osis()).toEqual("2John.1.1");
	});
});
describe("Localized book 3John (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 3John (ta)", () => {
		expect(p.parse("யோவான் எழுதிய முன்றாம் திருமுகம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Yōvaṉ Eḻutiya Mūṉṛāvatu Nirupam 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவன் எழுதிய மூன்றாவது நிருபம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவான் எழுதிய மூன்றாம் கடிதம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவான் மூன்றாம் திருமுகம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("Mūṉṛāvatu யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("மூன்றாவது யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("முன்றாம் யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 அருளப்பர் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 Yōvaṉ 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 யோவா 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 யோ 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவான் எழுதிய முன்றாம் திருமுகம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("YŌVAṈ EḺUTIYA MŪṈṚĀVATU NIRUPAM 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவன் எழுதிய மூன்றாவது நிருபம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவான் எழுதிய மூன்றாம் கடிதம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("யோவான் மூன்றாம் திருமுகம் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("MŪṈṚĀVATU யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("மூன்றாவது யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("முன்றாம் யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 அருளப்பர் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3. யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 யோவான் 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 YŌVAṈ 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 யோவா 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1");
		expect(p.parse("3 யோ 1:1").osis()).toEqual("3John.1.1");
	});
});
describe("Localized book John (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: John (ta)", () => {
		expect(p.parse("யோவான் எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் எழுதிய நற்செய்தி 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("அருளப்பர் நற்செய்தி 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் நற்செய்தி 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Yōvāṉ Naṛceyti 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("Yōvāṉ 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவா 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் எழுதிய சுவிசேஷம் 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் எழுதிய நற்செய்தி 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("அருளப்பர் நற்செய்தி 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் நற்செய்தி 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("YŌVĀṈ NAṚCEYTI 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவான் 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("YŌVĀṈ 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோவா 1:1").osis()).toEqual("John.1.1");
	});
});
describe("Localized book Acts (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Acts (ta)", () => {
		expect(p.parse("அப்போஸ்தலருடைய நடபடிகள் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("திருத்தூதர் பணிகள் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Appōstalar Paṇi 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போஸ்தலர் பணி 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போஸ்தலர் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போ 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("திப 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போஸ்தலருடைய நடபடிகள் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("திருத்தூதர் பணிகள் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("APPŌSTALAR PAṆI 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போஸ்தலர் பணி 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போஸ்தலர் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப்போ 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("அப் 1:1").osis()).toEqual("Acts.1.1");
		expect(p.parse("திப 1:1").osis()).toEqual("Acts.1.1");
	});
});
describe("Localized book Rom (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Rom (ta)", () => {
		expect(p.parse("ரோமாபுரியாருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோமையருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Urōmarukku Eḻutiya Nirupam 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோமருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Urōmarukku 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோமையர் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ரோமர் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோ 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ரோமாபுரியாருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோமையருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("URŌMARUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோமருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("URŌMARUKKU 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோமையர் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ரோமர் 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1");
		expect(p.parse("உரோ 1:1").osis()).toEqual("Rom.1.1");
	});
});
describe("Localized book 2Cor (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Cor (ta)", () => {
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாவது திருமுகம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("Korintiyarukku Eḻutiya Iraṇṭāvatu Nirupam 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 Korintiyarukku 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 கொரிந்தியர் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 கொரி 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 கொ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாவது திருமுகம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("KORINTIYARUKKU EḺUTIYA IRAṆṬĀVATU NIRUPAM 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 KORINTIYARUKKU 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 கொரிந்தியர் 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 கொரி 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2 கொ 1:1").osis()).toEqual("2Cor.1.1");
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1");
	});
});
describe("Localized book 1Cor (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Cor (ta)", () => {
		expect(p.parse("Korintiyarukku Eḻutiya Mutalāvatu Nirupam 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதலாவது திருமுகம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதலாம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 Korintiyarukku 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 கொரிந்தியர் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 கொரி 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 கொ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("KORINTIYARUKKU EḺUTIYA MUTALĀVATU NIRUPAM 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதலாவது திருமுகம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("கொரிந்தியருக்கு எழுதிய முதலாம் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 KORINTIYARUKKU 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 கொரிந்தியர் 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 கொரி 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1 கொ 1:1").osis()).toEqual("1Cor.1.1");
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1");
	});
});
describe("Localized book Gal (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Gal (ta)", () => {
		expect(p.parse("கலாத்தியருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Kalāttiyarukku Eḻutiya Nirupam 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Kalāttiyarukku 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியர் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலா 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("KALĀTTIYARUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("KALĀTTIYARUKKU 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத்தியர் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலாத் 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1");
		expect(p.parse("கலா 1:1").osis()).toEqual("Gal.1.1");
	});
});
describe("Localized book Eph (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Eph (ta)", () => {
		expect(p.parse("எபேசியருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Epēciyarukku Eḻutiya Nirupam 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Epēciyarukku 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியர் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசி 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபே 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EPĒCIYARUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EPĒCIYARUKKU 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசியர் 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபேசி 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1");
		expect(p.parse("எபே 1:1").osis()).toEqual("Eph.1.1");
	});
});
describe("Localized book Phil (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Phil (ta)", () => {
		expect(p.parse("பிலிப்பியருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Pilippiyarukku Eḻutiya Nirupam 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Pilippiyarukku 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியர் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலி 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("PILIPPIYARUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("PILIPPIYARUKKU 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப்பியர் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலிப் 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1");
		expect(p.parse("பிலி 1:1").osis()).toEqual("Phil.1.1");
	});
});
describe("Localized book Col (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Col (ta)", () => {
		expect(p.parse("கொலோசையருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Kolōceyarukku Eḻutiya Nirupam 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசெயருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசெயருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Kolōceyarukku 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசெயர் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசையர் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோ 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசையருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("KOLŌCEYARUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசெயருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசெயருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("KOLŌCEYARUKKU 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசெயர் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோசையர் 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("கொலோ 1:1").osis()).toEqual("Col.1.1");
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1");
	});
});
describe("Localized book 2Thess (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Thess (ta)", () => {
		expect(p.parse("Tecalōṉikkiyarukku Eḻutiya Iraṇṭāvatu Nirupam 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கருக்கு எழுதிய இரண்டாவது திருமுகம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கியருக்கு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கருக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கேயருக்கு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 Tecalōṉikkiyarukku 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெசலோனிக்கேயர் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெசலோனிக்கர் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெசலோ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெச 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("TECALŌṈIKKIYARUKKU EḺUTIYA IRAṆṬĀVATU NIRUPAM 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கருக்கு எழுதிய இரண்டாவது திருமுகம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கியருக்கு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கருக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("தெசலோனிக்கேயருக்கு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 TECALŌṈIKKIYARUKKU 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெசலோனிக்கேயர் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெசலோனிக்கர் 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெசலோ 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1");
		expect(p.parse("2 தெச 1:1").osis()).toEqual("2Thess.1.1");
	});
});
describe("Localized book 1Thess (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Thess (ta)", () => {
		expect(p.parse("Tecalōṉikkiyarukku Eḻutiya Mutalāvatu Nirupam 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("தெசலோனிக்கியருக்கு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("தெசலோனிக்கேயருக்கு எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("தெசலோனிக்கருக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 Tecalōṉikkiyarukku 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெசலோனிக்கேயர் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெசலோனிக்கர் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெசலோ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெச 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("TECALŌṈIKKIYARUKKU EḺUTIYA MUTALĀVATU NIRUPAM 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("தெசலோனிக்கியருக்கு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("தெசலோனிக்கேயருக்கு எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("தெசலோனிக்கருக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 TECALŌṈIKKIYARUKKU 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெசலோனிக்கேயர் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெசலோனிக்கர் 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெசலோ 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1");
		expect(p.parse("1 தெச 1:1").osis()).toEqual("1Thess.1.1");
	});
});
describe("Localized book 2Tim (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Tim (ta)", () => {
		expect(p.parse("திமொத்தேயுவுக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("திமோத்தேயுவுக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("Tīmōttēyuvukku Eḻutiya Iraṇṭāvatu Nirupam 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 Tīmōttēyuvukku 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 திமொத்தேயு 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 தீமோத்தேயு 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 தீமோத் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 திமொ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("திமொத்தேயுவுக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("திமோத்தேயுவுக்கு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("TĪMŌTTĒYUVUKKU EḺUTIYA IRAṆṬĀVATU NIRUPAM 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 TĪMŌTTĒYUVUKKU 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 திமொத்தேயு 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 தீமோத்தேயு 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 தீமோத் 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2 திமொ 1:1").osis()).toEqual("2Tim.1.1");
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1");
	});
});
describe("Localized book 1Tim (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Tim (ta)", () => {
		expect(p.parse("Tīmōttēyuvukku Eḻutiya Mutalāvatu Nirupam 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("திமொத்தேயுவுக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("திமோத்தேயுவுக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 Tīmōttēyuvukku 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 திமொத்தேயு 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 தீமோத்தேயு 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 தீமோத் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 திமொ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("TĪMŌTTĒYUVUKKU EḺUTIYA MUTALĀVATU NIRUPAM 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("திமொத்தேயுவுக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("திமோத்தேயுவுக்கு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("தீமோத்தேயுவுக்கு எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 TĪMŌTTĒYUVUKKU 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 திமொத்தேயு 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 தீமோத்தேயு 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 தீமோத் 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1 திமொ 1:1").osis()).toEqual("1Tim.1.1");
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1");
	});
});
describe("Localized book Titus (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Titus (ta)", () => {
		expect(p.parse("தீத்துவுக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துவுக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Tīttuvukku Eḻutiya Nirupam 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துவுக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Tīttuvukku 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்து 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துவுக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துவுக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TĪTTUVUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்துவுக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TĪTTUVUKKU 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத்து 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1");
		expect(p.parse("தீத் 1:1").osis()).toEqual("Titus.1.1");
	});
});
describe("Localized book Phlm (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Phlm (ta)", () => {
		expect(p.parse("பிலமோனுக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Pilēmōṉukku Eḻutiya Nirupam 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலேமோனுக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலேமோனுக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Pilēmōṉukku 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலேமோன் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலமோன் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலே 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பில 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலமோனுக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("PILĒMŌṈUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலேமோனுக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலேமோனுக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("PILĒMŌṈUKKU 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலேமோன் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலமோன் 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பிலே 1:1").osis()).toEqual("Phlm.1.1");
		expect(p.parse("பில 1:1").osis()).toEqual("Phlm.1.1");
	});
});
describe("Localized book Heb (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Heb (ta)", () => {
		expect(p.parse("எபிரேயருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Epireyarukku Eḻutiya Nirupam 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரெயருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரேயருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Epireyarukku 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரேயர் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரே 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபி 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரேயருக்கு எழுதிய திருமுகம் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("EPIREYARUKKU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரெயருக்கு எழுதிய நிருபம் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரேயருக்கு எழுதிய கடிதம் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("EPIREYARUKKU 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரேயர் 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபிரே 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1");
		expect(p.parse("எபி 1:1").osis()).toEqual("Heb.1.1");
	});
});
describe("Localized book Jas (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jas (ta)", () => {
		expect(p.parse("யாக்கோபு எழுதிய திருமுகம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Yākkōpu Eḻutiya Nirupam 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு எழுதிய நிருபம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு எழுதிய கடிதம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாகப்பர் திருமுகம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு திருமுகம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Yākkōpu 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு எழுதிய திருமுகம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("YĀKKŌPU EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு எழுதிய நிருபம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு எழுதிய கடிதம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாகப்பர் திருமுகம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு திருமுகம் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக்கோபு 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("YĀKKŌPU 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("யாக் 1:1").osis()).toEqual("Jas.1.1");
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1");
	});
});
describe("Localized book 2Pet (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Pet (ta)", () => {
		expect(p.parse("Pēturu Eḻutiya Iraṇṭāvatu Nirupam 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 இராயப்பர் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 Pēturu 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 பேதுரு 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 பேது 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("PĒTURU EḺUTIYA IRAṆṬĀVATU NIRUPAM 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய இரண்டாவது நிருபம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய இரண்டாம் கடிதம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("பேதுரு இரண்டாம் திருமுகம் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 இராயப்பர் 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 PĒTURU 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 பேதுரு 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2 பேது 1:1").osis()).toEqual("2Pet.1.1");
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1");
	});
});
describe("Localized book 1Pet (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Pet (ta)", () => {
		expect(p.parse("Pēturu Eḻutiya Mutalāvatu Nirupam 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு முதல் திருமுகம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 இராயப்பர் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 Pēturu 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 பேதுரு 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 பேது 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("PĒTURU EḺUTIYA MUTALĀVATU NIRUPAM 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய முதலாவது நிருபம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய முதல் திருமுகம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு எழுதிய முதலாம் கடிதம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("பேதுரு முதல் திருமுகம் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 இராயப்பர் 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 PĒTURU 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 பேதுரு 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1 பேது 1:1").osis()).toEqual("1Pet.1.1");
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1");
	});
});
describe("Localized book Jude (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jude (ta)", () => {
		expect(p.parse("Yūtā Eḻutiya Nirupam 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா எழுதிய நிருபம் 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா எழுதிய கடிதம் 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா திருமுகம் 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("Yūtā 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("YŪTĀ EḺUTIYA NIRUPAM 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா எழுதிய நிருபம் 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா எழுதிய கடிதம் 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா திருமுகம் 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("YŪTĀ 1:1").osis()).toEqual("Jude.1.1");
		expect(p.parse("யூதா 1:1").osis()).toEqual("Jude.1.1");
	});
});
describe("Localized book Tob (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Tob (ta)", () => {
		expect(p.parse("தொபியாசு ஆகமம் 1:1").osis()).toEqual("Tob.1.1");
		expect(p.parse("தோபித்து 1:1").osis()).toEqual("Tob.1.1");
		expect(p.parse("தோபி 1:1").osis()).toEqual("Tob.1.1");
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1");
	});
});
describe("Localized book Jdt (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Jdt (ta)", () => {
		expect(p.parse("யூதித்து 1:1").osis()).toEqual("Jdt.1.1");
		expect(p.parse("யூதி 1:1").osis()).toEqual("Jdt.1.1");
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1");
	});
});
describe("Localized book Bar (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Bar (ta)", () => {
		expect(p.parse("பாரூக்கு 1:1").osis()).toEqual("Bar.1.1");
		expect(p.parse("பாரூ 1:1").osis()).toEqual("Bar.1.1");
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1");
	});
});
describe("Localized book Sus (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Sus (ta)", () => {
		expect(p.parse("சூசன்னா 1:1").osis()).toEqual("Sus.1.1");
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1");
	});
});
describe("Localized book 2Macc (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 2Macc (ta)", () => {
		expect(p.parse("2 மக்கபேயர் 1:1").osis()).toEqual("2Macc.1.1");
		expect(p.parse("2 மக் 1:1").osis()).toEqual("2Macc.1.1");
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1");
	});
});
describe("Localized book 3Macc (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 3Macc (ta)", () => {
		expect(p.parse("3 மக்கபேயர் 1:1").osis()).toEqual("3Macc.1.1");
		expect(p.parse("3 மக் 1:1").osis()).toEqual("3Macc.1.1");
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1");
	});
});
describe("Localized book 4Macc (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 4Macc (ta)", () => {
		expect(p.parse("4 மக்கபேயர் 1:1").osis()).toEqual("4Macc.1.1");
		expect(p.parse("4 மக் 1:1").osis()).toEqual("4Macc.1.1");
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1");
	});
});
describe("Localized book 1Macc (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: 1Macc (ta)", () => {
		expect(p.parse("1 மக்கபேயர் 1:1").osis()).toEqual("1Macc.1.1");
		expect(p.parse("1 மக் 1:1").osis()).toEqual("1Macc.1.1");
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1");
	});
});
describe("Localized book John,Josh,Joel,Jonah (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: John,Josh,Joel,Jonah (ta)", () => {
		expect(p.parse("யோ 1:1").osis()).toEqual("John.1.1");
		expect(p.parse("யோ 1:1").osis()).toEqual("John.1.1");
	});
});
describe("Localized book Song, (ta)", () => {
	let p = {}
	beforeEach(() => {
		p = new bcv_parser(lang);
		p.set_options({ book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete", testaments: "ona" });
	});
	it("should handle book: Song, (ta)", () => {
		expect(p.parse("பாடல் 1:1").osis()).toEqual("Song.1.1");
		expect(p.parse("பாடல் 1:1").osis()).toEqual("Song.1.1");
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
		expect(p.regexps.languages).toEqual(["ta"]);
	});

	it("should handle ranges (ta)", () => {
		expect(p.parse("Titus 1:1 to 2").osis()).toEqual("Titus.1.1-Titus.1.2");
		expect(p.parse("Matt 1to2").osis()).toEqual("Matt.1-Matt.2");
		expect(p.parse("Phlm 2 TO 3").osis()).toEqual("Phlm.1.2-Phlm.1.3");
	});
	it("should handle chapters (ta)", () => {
		expect(p.parse("Titus 1:1, அதிகாரம் 2").osis()).toEqual("Titus.1.1,Titus.2");
		expect(p.parse("Matt 3:4 அதிகாரம் 6").osis()).toEqual("Matt.3.4,Matt.6");
		expect(p.parse("Titus 1:1, அதி 2").osis()).toEqual("Titus.1.1,Titus.2");
		expect(p.parse("Matt 3:4 அதி 6").osis()).toEqual("Matt.3.4,Matt.6");
	});
	it("should handle verses (ta)", () => {
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm VERSE 6").osis()).toEqual("Phlm.1.6");
	});
	it("should handle 'and' (ta)", () => {
		expect(p.parse("Exod 1:1 மற்றும் 3").osis()).toEqual("Exod.1.1,Exod.1.3");
		expect(p.parse("Phlm 2 மற்றும் 6").osis()).toEqual("Phlm.1.2,Phlm.1.6");
	});
	it("should handle titles (ta)", () => {
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1");
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1");
	});
	it("should handle 'ff' (ta)", () => {
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11");
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11");
	});
	it("should handle translations (ta)", () => {
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual([["Lev.1", "ERV"]]);
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual([["Lev.1", "ERV"]]);
	});
	it("should handle book ranges (ta)", () => {
		p.set_options({ book_alone_strategy: "full", book_range_strategy: "include" });
		expect(p.parse("முதலாவது to முன்றாம்  யோவான்").osis()).toEqual("1John.1-3John.1");
	});
	it("should handle boundaries (ta)", () => {
		p.set_options({ book_alone_strategy: "full" });
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual("Matt.1-Matt.28");
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual("Matt.1.1");
	});
});

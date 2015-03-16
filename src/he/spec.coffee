bcv_parser = require("../../js/he_bcv_parser.js").bcv_parser

describe "Parsing", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.options.osis_compaction_strategy = "b"
		p.options.sequence_combination_strategy = "combine"

	it "should round-trip OSIS references", ->
		p.set_options osis_compaction_strategy: "bc"
		books = ["Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam","1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job","Ps","Prov","Eccl","Song","Isa","Jer","Lam","Ezek","Dan","Hos","Joel","Amos","Obad","Jonah","Mic","Nah","Hab","Zeph","Hag","Zech","Mal","Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb","Jas","1Pet","2Pet","1John","2John","3John","Jude","Rev"]
		for book in books
			bc = book + ".1"
			bcv = bc + ".1"
			bcv_range = bcv + "-" + bc + ".2"
			expect(p.parse(bc).osis()).toEqual bc
			expect(p.parse(bcv).osis()).toEqual bcv
			expect(p.parse(bcv_range).osis()).toEqual bcv_range

	it "should round-trip OSIS Apocrypha references", ->
		p.set_options osis_compaction_strategy: "bc", ps151_strategy: "b"
		p.include_apocrypha true
		books = ["Tob","Jdt","GkEsth","Wis","Sir","Bar","PrAzar","Sus","Bel","SgThree","EpJer","1Macc","2Macc","3Macc","4Macc","1Esd","2Esd","PrMan","Ps151"]
		for book in books
			bc = book + ".1"
			bcv = bc + ".1"
			bcv_range = bcv + "-" + bc + ".2"
			expect(p.parse(bc).osis()).toEqual bc
			expect(p.parse(bcv).osis()).toEqual bcv
			expect(p.parse(bcv_range).osis()).toEqual bcv_range
		p.set_options ps151_strategy: "bc"
		expect(p.parse("Ps151.1").osis()).toEqual "Ps.151"
		expect(p.parse("Ps151.1.1").osis()).toEqual "Ps.151.1"
		expect(p.parse("Ps151.1-Ps151.2").osis()).toEqual "Ps.151.1-Ps.151.2"
		p.include_apocrypha false
		for book in books
			bc = book + ".1"
			expect(p.parse(bc).osis()).toEqual ""

	it "should handle a preceding character", ->
		expect(p.parse(" Gen 1").osis()).toEqual "Gen.1"
		expect(p.parse("Matt5John3").osis()).toEqual "Matt.5,John.3"
		expect(p.parse("1Ps 1").osis()).toEqual ""
		expect(p.parse("11Sam 1").osis()).toEqual ""

describe "Localized book Gen (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (he)", ->
		`
		expect(p.parse("בראשית 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("בריאה 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("בראשית 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("בריאה 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (he)", ->
		`
		expect(p.parse("יציאת מצרים 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("יציאה 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("שמות 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("יציאת מצרים 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("יציאה 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("שמות 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (he)", ->
		`
		expect(p.parse("בל והדרקון 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("התנין בבבל 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (he)", ->
		`
		expect(p.parse("ספר הלוויים 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ויקרא 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ספר הלוויים 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ויקרא 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (he)", ->
		`
		expect(p.parse("במדבר 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("מניין 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ספירה 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("במדבר 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("מניין 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ספירה 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (he)", ->
		`
		expect(p.parse("משלי בן סירא 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("משלי בן-סירא 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("ספר בן סירא 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (he)", ->
		`
		expect(p.parse("חכמת שלמה 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (he)", ->
		`
		expect(p.parse("קינות 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("איכה 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("קינות 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("איכה 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (he)", ->
		`
		expect(p.parse("איגרת ירמיהו 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (he)", ->
		`
		expect(p.parse("חזון יוחנן 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ההתגלות 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("התגלות 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("חזון יוחנן 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ההתגלות 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("התגלות 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (he)", ->
		`
		expect(p.parse("תפילת מנשה 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (he)", ->
		`
		expect(p.parse("משנה תורה 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("דברים 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("משנה תורה 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("דברים 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (he)", ->
		`
		expect(p.parse("יהושע 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("יהושע 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (he)", ->
		`
		expect(p.parse("שופטים 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("שופטים 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (he)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("רות 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("רות 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (he)", ->
		`
		expect(p.parse("חזון עזרא 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (he)", ->
		`
		expect(p.parse("עזרא החיצוני 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (he)", ->
		`
		expect(p.parse("ישעיהו 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ישעיה 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ישעה 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ישעיהו 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ישעיה 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ישעה 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (he)", ->
		`
		expect(p.parse("שמואל ב' 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("שמואל ב’ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("שמואל ב 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("שמואל ב' 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("שמואל ב’ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("שמואל ב 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (he)", ->
		`
		expect(p.parse("שמואל א' 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("שמואל א’ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("שמואל א 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("שמואל א' 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("שמואל א’ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("שמואל א 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (he)", ->
		`
		expect(p.parse("מלכים ב' 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("מלכים ב’ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("מלכים ב 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("מלכים ב' 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("מלכים ב’ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("מלכים ב 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (he)", ->
		`
		expect(p.parse("מלכים א' 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("מלכים א’ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("מלכים א 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("מלכים א' 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("מלכים א’ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("מלכים א 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (he)", ->
		`
		expect(p.parse("דברי הימים ב' 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("דברי הימים ב’ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("דברי הימים ב 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("דברי הימים ב' 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("דברי הימים ב’ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("דברי הימים ב 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (he)", ->
		`
		expect(p.parse("דברי הימים א' 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("דברי הימים א’ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("דברי הימים א 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("דברי הימים א' 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("דברי הימים א’ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("דברי הימים א 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (he)", ->
		`
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("עזרא 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("עזרא 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (he)", ->
		`
		expect(p.parse("נחמיה 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("נחמיה 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (he)", ->
		`
		expect(p.parse("תוספות למגילת אסתר 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (he)", ->
		`
		expect(p.parse("אסתר, כולל פרקים גנוזים 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("אסתר 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אסתר, כולל פרקים גנוזים 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("אסתר 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (he)", ->
		`
		expect(p.parse("איוב 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("איוב 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (he)", ->
		`
		expect(p.parse("מזמורים 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("תהילים 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("מזמורים 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("תהילים 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (he)", ->
		`
		expect(p.parse("תפילת עזריה בתוך הכבשן 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("תפילת עזריה 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (he)", ->
		`
		expect(p.parse("פתגמים 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("משלים 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("משלי 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("פתגמים 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("משלים 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("משלי 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (he)", ->
		`
		expect(p.parse("המקהיל 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("המרצה 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("קהלת 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("המקהיל 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("המרצה 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("קהלת 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (he)", ->
		`
		expect(p.parse("שירת שלושת הנערים בכבשן 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (he)", ->
		`
		expect(p.parse("שיר השירים 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("שירי שלמה 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("שיר השירים 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("שירי שלמה 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (he)", ->
		`
		expect(p.parse("ירמיהו 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ירמיה 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ירמיהו 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ירמיה 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (he)", ->
		`
		expect(p.parse("יחזקאל 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("יחזקאל 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (he)", ->
		`
		expect(p.parse("דניאל 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("דניאל 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (he)", ->
		`
		expect(p.parse("הושע 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("הושע 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (he)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("יואל 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("יואל 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (he)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("עמוס 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("עמוס 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (he)", ->
		`
		expect(p.parse("עובדיה 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("עבדיה 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("עובדיה 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("עבדיה 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (he)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("יונה 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("יונה 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (he)", ->
		`
		expect(p.parse("מיכה 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("מיכה 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (he)", ->
		`
		expect(p.parse("נחום 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("נחום 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (he)", ->
		`
		expect(p.parse("חבקוק 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("חבקוק 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (he)", ->
		`
		expect(p.parse("צפניה 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("צפניה 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (he)", ->
		`
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("חגי 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("חגי 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (he)", ->
		`
		expect(p.parse("זכריה 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("זכריה 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (he)", ->
		`
		expect(p.parse("מלאכי 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("מלאכי 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (he)", ->
		`
		expect(p.parse("הבשורה הקדושה על-פי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("הבשורה על פי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("הבשורה על-פי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("הבשורה לפי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("הבשורה הקדושה על-פי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("הבשורה על פי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("הבשורה על-פי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("הבשורה לפי מתי 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (he)", ->
		`
		expect(p.parse("הבשורה על פי מרקוס 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("הבשורה על-פי מרקוס 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("הבשורה על פי מרקוס 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("הבשורה על-פי מרקוס 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (he)", ->
		`
		expect(p.parse("הבשורה על-פי לוקאס 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("הבשורה על פי לוקס 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("הבשורה על-פי לוקס 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("הבשורה על-פי לוקאס 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("הבשורה על פי לוקס 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("הבשורה על-פי לוקס 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (he)", ->
		`
		expect(p.parse("אגרתו הראשונה של יוחנן השלי 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("איגרת יוחנן הראשונה 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרתו הראשונה של יוחנן השלי 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("איגרת יוחנן הראשונה 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (he)", ->
		`
		expect(p.parse("אגרתו השנייה של יוחנן השליח 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("איגרת יוחנן השנייה 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרתו השנייה של יוחנן השליח 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("איגרת יוחנן השנייה 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (he)", ->
		`
		expect(p.parse("אגרתו השלישית של יוחנן השלי 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("איגרת יוחנן השלישית 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרתו השלישית של יוחנן השלי 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("איגרת יוחנן השלישית 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (he)", ->
		`
		expect(p.parse("הבשורה על פי יוחנן 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("הבשורה על-פי יוחנן 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("הבשורה על פי יוחנן 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("הבשורה על-פי יוחנן 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (he)", ->
		`
		expect(p.parse("מעשי השליחים 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("מעשי השליחים 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (he)", ->
		`
		expect(p.parse("אגרת פולוס השליח אל-הרומיים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("האיגרת אל הרומאים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("אל הרומאים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("אל הרומים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השליח אל-הרומיים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("האיגרת אל הרומאים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("אל הרומאים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("אל הרומים 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (he)", ->
		`
		expect(p.parse("אגרת פולוס השנייה אל-הקורינ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("האיגרת השנייה אל הקורינתים 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("השנייה אל הקורינתים 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השנייה אל-הקורינ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("האיגרת השנייה אל הקורינתים 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("השנייה אל הקורינתים 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (he)", ->
		`
		expect(p.parse("אגרת פולוס הראשונה אל-הקורי 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("האיגרת הראשונה אל הקורינתים 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("הראשונה אל הקורינתים 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס הראשונה אל-הקורי 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("האיגרת הראשונה אל הקורינתים 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("הראשונה אל הקורינתים 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (he)", ->
		`
		expect(p.parse("אגרת פולוס השליח אל-הגלטים 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("האיגרת אל הגלטים 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("אל הגלטים 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השליח אל-הגלטים 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("האיגרת אל הגלטים 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("אל הגלטים 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (he)", ->
		`
		expect(p.parse("אגרת פולוס השליח אל-האפסים 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("האיגרת אל האפסים 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("אל האפסים 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השליח אל-האפסים 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("האיגרת אל האפסים 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("אל האפסים 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (he)", ->
		`
		expect(p.parse("אגרת פולוס השליח אל-הפיליפי 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("האיגרת אל הפיליפים 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("אל הפיליפים 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השליח אל-הפיליפי 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("האיגרת אל הפיליפים 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("אל הפיליפים 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (he)", ->
		`
		expect(p.parse("אגרת פולוס השליח אל-הקולוסי 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("האיגרת אל הקולוסים 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("אל הקולוסים 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השליח אל-הקולוסי 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("האיגרת אל הקולוסים 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("אל הקולוסים 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (he)", ->
		`
		expect(p.parse("אגרת פולוס השנייה אל-התסלונ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("האיגרת השנייה אל התסלוניקים 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("השנייה אל התסלוניקים 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השנייה אל-התסלונ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("האיגרת השנייה אל התסלוניקים 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("השנייה אל התסלוניקים 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (he)", ->
		`
		expect(p.parse("האיגרת הראשונה אל התסלוניקים 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("אגרת פולוס הראשונה אל-התסלו 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("הראשונה אל התסלוניקים 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("האיגרת הראשונה אל התסלוניקים 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("אגרת פולוס הראשונה אל-התסלו 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("הראשונה אל התסלוניקים 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (he)", ->
		`
		expect(p.parse("אגרת פולוס השנייה אל-טימותי 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("האיגרת השנייה אל טימותיוס 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("השנייה אל טימותיאוס 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("השנייה אל טימותיוס 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס השנייה אל-טימותי 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("האיגרת השנייה אל טימותיוס 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("השנייה אל טימותיאוס 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("השנייה אל טימותיוס 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (he)", ->
		`
		expect(p.parse("אגרת פולוס הראשונה אל-טימות 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("האיגרת הראשונה אל טימותיוס 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("הראשונה אל טימותיאוס 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("הראשונה אל טימותיוס 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס הראשונה אל-טימות 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("האיגרת הראשונה אל טימותיוס 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("הראשונה אל טימותיאוס 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("הראשונה אל טימותיוס 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (he)", ->
		`
		expect(p.parse("אגרת פולוס אל-טיטוס 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("האיגרת אל טיטוס 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("אל טיטוס 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס אל-טיטוס 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("האיגרת אל טיטוס 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("אל טיטוס 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (he)", ->
		`
		expect(p.parse("אגרת פולוס אל-פילימון 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("האיגרת אל פילימון 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("אל פילימון 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרת פולוס אל-פילימון 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("האיגרת אל פילימון 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("אל פילימון 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (he)", ->
		`
		expect(p.parse("האיגרת אל העברים 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("האגרת אל-העברים 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("אל העברים 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("האיגרת אל העברים 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("האגרת אל-העברים 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("אל העברים 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (he)", ->
		`
		expect(p.parse("איגרת יעקב 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("אגרת יעקב 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("איגרת יעקב 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("אגרת יעקב 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (he)", ->
		`
		expect(p.parse("אגרתו השנייה של פטרוס השליח 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("איגרת פטרוס השנייה 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרתו השנייה של פטרוס השליח 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("איגרת פטרוס השנייה 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (he)", ->
		`
		expect(p.parse("אגרתו הראשונה של פטרוס השלי 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("איגרת פטרוס הראשונה 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("אגרתו הראשונה של פטרוס השלי 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("איגרת פטרוס הראשונה 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (he)", ->
		`
		expect(p.parse("איגרת יהודה 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("אגרת יהודה 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("איגרת יהודה 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("אגרת יהודה 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (he)", ->
		`
		expect(p.parse("טוביה 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (he)", ->
		`
		expect(p.parse("יהודית 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (he)", ->
		`
		expect(p.parse("ספר ברוך 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("ברוך 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (he)", ->
		`
		expect(p.parse("שושנה 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (he)", ->
		`
		expect(p.parse("ספר מקבים ב' 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("ספר מקבים ב’ 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("חשמונאים ב' 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("חשמונאים ב’ 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("מקבים ב 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (he)", ->
		`
		expect(p.parse("ספר מקבים ג' 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("ספר מקבים ג’ 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("חשמונאים ג' 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("חשמונאים ג’ 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("מקבים ג 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (he)", ->
		`
		expect(p.parse("ספר מקבים ד' 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("ספר מקבים ד’ 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("חשמונאים ד' 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("חשמונאים ד’ 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("מקבים ד 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (he)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (he)", ->
		`
		expect(p.parse("ספר מקבים א' 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("ספר מקבים א’ 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("חשמונאים א' 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("חשמונאים א’ 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("מקבים א 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (he)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (he)", ->
		expect(p.parse("Titus 1:1, פרקים 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 פרקים 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, פרק 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 פרק 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (he)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (he)", ->
		expect(p.parse("Exod 1:1 and 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 AND 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (he)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (he)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (he)", ->
		expect(p.parse("Lev 1 (WLC)").osis_and_translations()).toEqual [["Lev.1", "WLC"]]
		expect(p.parse("lev 1 wlc").osis_and_translations()).toEqual [["Lev.1", "WLC"]]
	it "should handle boundaries (he)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

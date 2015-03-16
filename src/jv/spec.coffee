bcv_parser = require("../../js/jv_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (jv)", ->
		`
		expect(p.parse("Purwaning Dumadi 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PURWANING DUMADI 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (jv)", ->
		`
		expect(p.parse("Pangentasan 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PANGENTASAN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (jv)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (jv)", ->
		`
		expect(p.parse("Kaimaman 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KAIMAMAN 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (jv)", ->
		`
		expect(p.parse("Wilangan 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("WILANGAN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (jv)", ->
		`
		expect(p.parse("Kitab Yesus bin Sirakh 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirakh 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (jv)", ->
		`
		expect(p.parse("Kawicaksanan Salomo 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Kawicaksanan 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (jv)", ->
		`
		expect(p.parse("Kidung Pangadhuh 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Kidung Pasambat 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIDUNG PANGADHUH 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("KIDUNG PASAMBAT 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (jv)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (jv)", ->
		`
		expect(p.parse("Kitab Wahyu 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Pamedaran 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Wahyu 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KITAB WAHYU 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("PAMEDARAN 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("WAHYU 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (jv)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (jv)", ->
		`
		expect(p.parse("Pangandharing Toret 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Andharaning Toret 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Andharaning Torèt 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PANGANDHARING TORET 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ANDHARANING TORET 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ANDHARANING TORÈT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (jv)", ->
		`
		expect(p.parse("Yosua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Yusak 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOSUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("YUSAK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (jv)", ->
		`
		expect(p.parse("Para Hakim 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PARA HAKIM 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (jv)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (jv)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (jv)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (jv)", ->
		`
		expect(p.parse("Yesaya 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Yésaya 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YESAYA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("YÉSAYA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (jv)", ->
		`
		expect(p.parse("II. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (jv)", ->
		`
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (jv)", ->
		`
		expect(p.parse("II. Para Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Para Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Para Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Para Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. PARA RAJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. PARA RAJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II PARA RAJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 PARA RAJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (jv)", ->
		`
		expect(p.parse("1. Para Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Para Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Para Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Para Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. PARA RAJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. PARA RAJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 PARA RAJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I PARA RAJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (jv)", ->
		`
		expect(p.parse("II. Babad 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Babad 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Babad 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Babad 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. BABAD 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. BABAD 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II BABAD 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 BABAD 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (jv)", ->
		`
		expect(p.parse("1. Babad 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Babad 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Babad 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Babad 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. BABAD 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. BABAD 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 BABAD 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I BABAD 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (jv)", ->
		`
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (jv)", ->
		`
		expect(p.parse("Nehemia 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemya 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMYA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (jv)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (jv)", ->
		`
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (jv)", ->
		`
		expect(p.parse("Ayub 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AYUB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (jv)", ->
		`
		expect(p.parse("Masmur 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Jabur 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Zabur 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MASMUR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("JABUR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ZABUR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (jv)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (jv)", ->
		`
		expect(p.parse("Wulang Bebasan 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("WULANG BEBASAN 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (jv)", ->
		`
		expect(p.parse("Juru Kotbah 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kohelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JURU KOTBAH 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KOHELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (jv)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (jv)", ->
		`
		expect(p.parse("Musthikaning Kidung 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Kidung Agung 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MUSTHIKANING KIDUNG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("KIDUNG AGUNG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (jv)", ->
		`
		expect(p.parse("Yeremia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Yerémia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Yéremia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Yérémia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YEREMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("YERÉMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("YÉREMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("YÉRÉMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (jv)", ->
		`
		expect(p.parse("Yeheskiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yehezkiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yehezkièl 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yehèzkiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yehèzkièl 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yéhezkiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yéhezkièl 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yéhèzkiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yéhèzkièl 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YEHESKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YEHEZKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YEHEZKIÈL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YEHÈZKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YEHÈZKIÈL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YÉHEZKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YÉHEZKIÈL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YÉHÈZKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YÉHÈZKIÈL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (jv)", ->
		`
		expect(p.parse("Dhaniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Danièl 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DHANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANIÈL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (jv)", ->
		`
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (jv)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Yoel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("YOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (jv)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (jv)", ->
		`
		expect(p.parse("Obaja 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBAJA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (jv)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Yunus 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("YUNUS 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (jv)", ->
		`
		expect(p.parse("Mikha 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIKHA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (jv)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (jv)", ->
		`
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (jv)", ->
		`
		expect(p.parse("Zefanya 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZEFANYA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (jv)", ->
		`
		expect(p.parse("Hagai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (jv)", ->
		`
		expect(p.parse("Zakharia 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZAKHARIA 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (jv)", ->
		`
		expect(p.parse("Maleakhi 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALEAKHI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (jv)", ->
		`
		expect(p.parse("Injil Matius 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mateus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matius 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matéus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("INJIL MATIUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATEUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATIUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATÉUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (jv)", ->
		`
		expect(p.parse("Injil Markus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Markus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("INJIL MARKUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (jv)", ->
		`
		expect(p.parse("Injil Lukas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("INJIL LUKAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (jv)", ->
		`
		expect(p.parse("1. Yohanes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Yokanan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Yohanes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Yokanan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Yohanes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Yokanan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Yohanes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Yokanan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. YOHANES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. YOKANAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. YOHANES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. YOKANAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 YOHANES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 YOKANAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I YOHANES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I YOKANAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (jv)", ->
		`
		expect(p.parse("II. Yohanes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Yokanan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Yohanes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Yokanan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Yohanes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Yokanan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Yohanes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Yokanan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. YOHANES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. YOKANAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. YOHANES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. YOKANAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II YOHANES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II YOKANAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 YOHANES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 YOKANAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (jv)", ->
		`
		expect(p.parse("III. Yohanes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Yokanan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Yohanes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Yokanan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Yohanes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Yokanan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Yohanes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Yokanan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("III. YOHANES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. YOKANAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III YOHANES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III YOKANAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. YOHANES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. YOKANAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 YOHANES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 YOKANAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (jv)", ->
		`
		expect(p.parse("Injil Yohanes 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Yohanes 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Yokanan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("INJIL YOHANES 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("YOHANES 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("YOKANAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (jv)", ->
		`
		expect(p.parse("Lelakone Para Rasul 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Para Rasul 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LELAKONE PARA RASUL 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("PARA RASUL 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (jv)", ->
		`
		expect(p.parse("Layang Paulus Roma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Roma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rum 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG PAULUS ROMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RUM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (jv)", ->
		`
		expect(p.parse("II. Korintus 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintus 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintus 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinta 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintus 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinta 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinta 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinta 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. KORINTUS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTUS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTUS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTUS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (jv)", ->
		`
		expect(p.parse("1. Korintus 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintus 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintus 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinta 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintus 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinta 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinta 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinta 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. KORINTUS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTUS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTUS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTUS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (jv)", ->
		`
		expect(p.parse("Layang Paulus Galatia 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galasia 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatia 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galati 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG PAULUS GALATIA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALASIA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATIA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATI 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (jv)", ->
		`
		expect(p.parse("Layang Paulus Efesus 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efesus 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efese 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efése 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG PAULUS EFESUS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESUS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESE 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFÉSE 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (jv)", ->
		`
		expect(p.parse("Layang Paulus Filipi 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filipi 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG PAULUS FILIPI 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPI 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (jv)", ->
		`
		expect(p.parse("Layang Paulus Kolose 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Layang Paulus Kolosé 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolose 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolosé 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG PAULUS KOLOSE 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("LAYANG PAULUS KOLOSÉ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSE 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSÉ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (jv)", ->
		`
		expect(p.parse("II. Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tèsalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tèsalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tèsalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tèsalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TÈSALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TÈSALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TÈSALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TÈSALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (jv)", ->
		`
		expect(p.parse("1. Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tèsalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tèsalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tèsalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tèsalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TÈSALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TÈSALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TÈSALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TÈSALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (jv)", ->
		`
		expect(p.parse("II. Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timotius 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timotius 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timotius 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timotius 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTIUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTIUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTIUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTIUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (jv)", ->
		`
		expect(p.parse("1. Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timotius 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timotius 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timotius 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timotius 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTIUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTIUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTIUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTIUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (jv)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (jv)", ->
		`
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (jv)", ->
		`
		expect(p.parse("Layang Ibrani 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Ibrani 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG IBRANI 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("IBRANI 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (jv)", ->
		`
		expect(p.parse("Layang Yakobus 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Yakobus 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG YAKOBUS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("YAKOBUS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (jv)", ->
		`
		expect(p.parse("II. Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pétrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pétrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pétrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pétrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PÉTRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PÉTRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PÉTRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PÉTRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (jv)", ->
		`
		expect(p.parse("1. Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pétrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pétrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pétrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pétrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PÉTRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PÉTRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PÉTRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PÉTRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (jv)", ->
		`
		expect(p.parse("Layang Yudas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Yudas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAYANG YUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("YUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (jv)", ->
		`
		expect(p.parse("Tobias 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobit 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (jv)", ->
		`
		expect(p.parse("Kitab Yudit 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judith 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Yudit 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (jv)", ->
		`
		expect(p.parse("Kitab Barukh 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Barukh 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (jv)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (jv)", ->
		`
		expect(p.parse("II. Makabe 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Makabe 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Makabe 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Makabe 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (jv)", ->
		`
		expect(p.parse("III. Makabe 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Makabe 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Makabe 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Makabe 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (jv)", ->
		`
		expect(p.parse("IV. Makabe 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Makabe 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Makabe 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Makabe 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (jv)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (jv)", ->
		`
		expect(p.parse("1. Makabe 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Makabe 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Makabe 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Makabe 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (jv)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (jv)", ->
		expect(p.parse("Titus 1:1, bab 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 BAB 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, pasal 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 PASAL 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (jv)", ->
		expect(p.parse("Exod 1:1 ayat 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm AYAT 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (jv)", ->
		expect(p.parse("Exod 1:1 & 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 & 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (jv)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (jv)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (jv)", ->
		expect(p.parse("Lev 1 (JVNT)").osis_and_translations()).toEqual [["Lev.1", "JVNT"]]
		expect(p.parse("lev 1 jvnt").osis_and_translations()).toEqual [["Lev.1", "JVNT"]]
	it "should handle book ranges (jv)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("I - III  Yohanes").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (jv)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

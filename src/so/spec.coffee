bcv_parser = require("../../js/so_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (so)", ->
		`
		expect(p.parse("Bilowgii 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Bil 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BILOWGII 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("BIL 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (so)", ->
		`
		expect(p.parse("Baxniintii 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Bax 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BAXNIINTII 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("BAX 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (so)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (so)", ->
		`
		expect(p.parse("Laawiyiintii 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Laaw 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAAWIYIINTII 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LAAW 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (so)", ->
		`
		expect(p.parse("Tirintii 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Tir 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIRINTII 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("TIR 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (so)", ->
		`
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (so)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (so)", ->
		`
		expect(p.parse("Baroorashadii Yeremyaah 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Baroorashadii 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Baroor 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BAROORASHADII YEREMYAAH 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("BAROORASHADII 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("BAROOR 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (so)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (so)", ->
		`
		expect(p.parse("Muujintii 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Muuj 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MUUJINTII 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("MUUJ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (so)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (so)", ->
		`
		expect(p.parse("Sharciga Kunoqoshadiisa 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Sharci 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SHARCIGA KUNOQOSHADIISA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("SHARCI 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (so)", ->
		`
		expect(p.parse("Yashuuca 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Yash 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YASHUUCA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("YASH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (so)", ->
		`
		expect(p.parse("Xaakinnada 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Xaak 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("XAAKINNADA 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("XAAK 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (so)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruud 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUUD 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (so)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (so)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (so)", ->
		`
		expect(p.parse("Ishacyaah 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ish 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ISHACYAAH 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISH 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (so)", ->
		`
		expect(p.parse("Samuu'eel Labaad 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Samuu’eel Labaad 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuu'eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuu’eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuu'eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuu’eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuu'eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuu’eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuu'eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuu’eel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAMUU'EEL LABAAD 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SAMUU’EEL LABAAD 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUU'EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUU’EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUU'EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUU’EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUU'EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUU’EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUU'EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUU’EEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (so)", ->
		`
		expect(p.parse("Samuu'eel Kowaad 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Samuu’eel Kowaad 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuu'eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuu’eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuu'eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuu’eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuu'eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuu’eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuu'eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuu’eel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAMUU'EEL KOWAAD 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("SAMUU’EEL KOWAAD 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUU'EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUU’EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUU'EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUU’EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUU'EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUU’EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUU'EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUU’EEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (so)", ->
		`
		expect(p.parse("Boqorradii Labaad 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Boqorradii 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Boqorradii 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Boqorradii 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Boqorradii 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Boq 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Boq 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Boq 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Boq 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BOQORRADII LABAAD 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. BOQORRADII 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. BOQORRADII 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II BOQORRADII 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 BOQORRADII 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. BOQ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. BOQ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II BOQ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 BOQ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (so)", ->
		`
		expect(p.parse("Boqorradii Kowaad 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Boqorradii 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Boqorradii 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Boqorradii 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Boqorradii 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Boq 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Boq 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Boq 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Boq 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BOQORRADII KOWAAD 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. BOQORRADII 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. BOQORRADII 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 BOQORRADII 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I BOQORRADII 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. BOQ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. BOQ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 BOQ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I BOQ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (so)", ->
		`
		expect(p.parse("Taariikhdii Labaad 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Taariikhdii 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Taariikhdii 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Taariikhdii 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Taariikhdii 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Taar 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Taar 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Taar 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Taar 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TAARIIKHDII LABAAD 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. TAARIIKHDII 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. TAARIIKHDII 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II TAARIIKHDII 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 TAARIIKHDII 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. TAAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. TAAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II TAAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 TAAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (so)", ->
		`
		expect(p.parse("Taariikhdii Kowaad 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Taariikhdii 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Taariikhdii 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Taariikhdii 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Taariikhdii 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Taar 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Taar 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Taar 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Taar 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TAARIIKHDII KOWAAD 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. TAARIIKHDII 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. TAARIIKHDII 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 TAARIIKHDII 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I TAARIIKHDII 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. TAAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. TAAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 TAAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I TAAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (so)", ->
		`
		expect(p.parse("Cesraa 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Cesr 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ces 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CESRAA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("CESR 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("CES 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (so)", ->
		`
		expect(p.parse("Nexemyaah 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nex 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEXEMYAAH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEX 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (so)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (so)", ->
		`
		expect(p.parse("Esteer 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTEER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (so)", ->
		`
		expect(p.parse("Ayuub 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Ayu 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AYUUB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("AYU 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (so)", ->
		`
		expect(p.parse("Sabuurradii 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sabuur 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sab 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SABUURRADII 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SABUUR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SAB 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (so)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (so)", ->
		`
		expect(p.parse("Maahmaahyadii 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Maah 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MAAHMAAHYADII 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("MAAH 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (so)", ->
		`
		expect(p.parse("Wacdiyahii 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Wacdiyaha 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Wac 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("WACDIYAHII 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("WACDIYAHA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("WAC 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (so)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (so)", ->
		`
		expect(p.parse("Gabaygii Sulaymaan 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Gabaygii 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Gab 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GABAYGII SULAYMAAN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("GABAYGII 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("GAB 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (so)", ->
		`
		expect(p.parse("Yeremyaah 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Yer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YEREMYAAH 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("YER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (so)", ->
		`
		expect(p.parse("Yexesqeel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Yex 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YEXESQEEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("YEX 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (so)", ->
		`
		expect(p.parse("Daanyeel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Daan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DAANYEEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (so)", ->
		`
		expect(p.parse("Hoosheeca 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hoosh 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOOSHEECA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOOSH 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (so)", ->
		`
		expect(p.parse("Yoo'eel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Yoo’eel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Yool 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOO'EEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("YOO’EEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("YOOL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (so)", ->
		`
		expect(p.parse("Caamoos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Caam 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CAAMOOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("CAAM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (so)", ->
		`
		expect(p.parse("Cobadyaah 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Cobad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Cob 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("COBADYAAH 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("COBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("COB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (so)", ->
		`
		expect(p.parse("Yoonis 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Yoon 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOONIS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("YOON 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (so)", ->
		`
		expect(p.parse("Miikaah 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miik 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIIKAAH 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIIK 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (so)", ->
		`
		expect(p.parse("Naxuum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nax 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAXUUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAX 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (so)", ->
		`
		expect(p.parse("Xabaquuq 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Xab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("XABAQUUQ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("XAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (so)", ->
		`
		expect(p.parse("Sefanyaah 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sef 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEFANYAAH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (so)", ->
		`
		expect(p.parse("Xaggay 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Xagg 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Xag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("XAGGAY 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("XAGG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("XAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (so)", ->
		`
		expect(p.parse("Sekaryaah 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Sek 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEKARYAAH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("SEK 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (so)", ->
		`
		expect(p.parse("Malaakii 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAAKII 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (so)", ->
		`
		expect(p.parse("Matayos 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MATAYOS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (so)", ->
		`
		expect(p.parse("Markos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mar 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MARKOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MAR 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (so)", ->
		`
		expect(p.parse("Luukos 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luuk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LUUKOS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUUK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (so)", ->
		`
		expect(p.parse("Yooxanaa Kowaad 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Yooxanaa 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Yooxanaa 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Yooxanaa 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Yooxanaa 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Yoox 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Yoox 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Yoox 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Yoox 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOOXANAA KOWAAD 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. YOOXANAA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. YOOXANAA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 YOOXANAA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I YOOXANAA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. YOOX 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. YOOX 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 YOOX 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I YOOX 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (so)", ->
		`
		expect(p.parse("Yooxanaa Labaad 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Yooxanaa 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Yooxanaa 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Yooxanaa 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Yooxanaa 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Yoox 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Yoox 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Yoox 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Yoox 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOOXANAA LABAAD 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. YOOXANAA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. YOOXANAA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II YOOXANAA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 YOOXANAA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. YOOX 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. YOOX 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II YOOX 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 YOOX 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (so)", ->
		`
		expect(p.parse("Yooxanaa Saddexaad 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Yooxanaa 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Yooxanaa 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Yooxanaa 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Yooxanaa 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Yoox 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Yoox 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Yoox 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Yoox 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOOXANAA SADDEXAAD 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. YOOXANAA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III YOOXANAA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. YOOXANAA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 YOOXANAA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. YOOX 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III YOOX 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. YOOX 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 YOOX 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (so)", ->
		`
		expect(p.parse("Yooxanaa 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Yoox 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOOXANAA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("YOOX 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (so)", ->
		`
		expect(p.parse("Falimaha Rasuullada 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Fal 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FALIMAHA RASUULLADA 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("FAL 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (so)", ->
		`
		expect(p.parse("Rooma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Room 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROOMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROOM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (so)", ->
		`
		expect(p.parse("Korintos Labaad 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintos 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintos 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintos 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintos 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KORINTOS LABAAD 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (so)", ->
		`
		expect(p.parse("Korintos Kowaad 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintos 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintos 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintos 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintos 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KORINTOS KOWAAD 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (so)", ->
		`
		expect(p.parse("Galatiya 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALATIYA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (so)", ->
		`
		expect(p.parse("Efesos 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EFESOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (so)", ->
		`
		expect(p.parse("Filiboy 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILIBOY 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (so)", ->
		`
		expect(p.parse("Kolosay 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KOLOSAY 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (so)", ->
		`
		expect(p.parse("Tesoloniika Labaad 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesaloniika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesaloniika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesaloniika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesaloniika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tes 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TESOLONIIKA LABAAD 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONIIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONIIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONIIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONIIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TES 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (so)", ->
		`
		expect(p.parse("Tesoloniika Kowaad 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesaloniika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesaloniika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesaloniika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesaloniika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tes 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TESOLONIIKA KOWAAD 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONIIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONIIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONIIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONIIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TES 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (so)", ->
		`
		expect(p.parse("Timoteyos Labaad 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteyos 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteyos 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteyos 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteyos 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIMOTEYOS LABAAD 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEYOS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEYOS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEYOS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEYOS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (so)", ->
		`
		expect(p.parse("Timoteyos Kowaad 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteyos 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteyos 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteyos 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteyos 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIMOTEYOS KOWAAD 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEYOS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEYOS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEYOS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEYOS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (so)", ->
		`
		expect(p.parse("Tiitos 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tiit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIITOS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (so)", ->
		`
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flmn 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLMN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (so)", ->
		`
		expect(p.parse("Cibraaniyada 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Cib 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CIBRAANIYADA 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("CIB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (so)", ->
		`
		expect(p.parse("Yacquub 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Yacq 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Yac 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YACQUUB 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("YACQ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("YAC 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (so)", ->
		`
		expect(p.parse("Butros Labaad 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Butros 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Butros 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Butros 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Butros 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. But 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. But 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II But 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 But 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BUTROS LABAAD 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. BUTROS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. BUTROS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II BUTROS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 BUTROS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. BUT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. BUT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II BUT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 BUT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (so)", ->
		`
		expect(p.parse("Butros Kowaad 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Butros 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Butros 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Butros 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Butros 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. But 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. But 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 But 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I But 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BUTROS KOWAAD 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. BUTROS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. BUTROS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 BUTROS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I BUTROS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. BUT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. BUT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 BUT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I BUT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (so)", ->
		`
		expect(p.parse("Yuudas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Yuud 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YUUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("YUUD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (so)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (so)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (so)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (so)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (so)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (so)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (so)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (so)", ->
		`
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book Jonah,Joel (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah,Joel (so)", ->
		`
		expect(p.parse("Yoo 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOO 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Phil,Phlm (so)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil,Phlm (so)", ->
		`
		expect(p.parse("Fi 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FI 1:1").osis()).toEqual("Phil.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (so)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (so)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (so)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (so)", ->
		expect(p.parse("Exod 1:1 iyo 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 IYO 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (so)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (so)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (so)", ->
		expect(p.parse("Lev 1 (SIMK)").osis_and_translations()).toEqual [["Lev.1", "SIMK"]]
		expect(p.parse("lev 1 simk").osis_and_translations()).toEqual [["Lev.1", "SIMK"]]
	it "should handle book ranges (so)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("1 - 3  Yooxanaa").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (so)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

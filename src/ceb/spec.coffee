bcv_parser = require("../../js/ceb_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (ceb)", ->
		`
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Henesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("HENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (ceb)", ->
		`
		expect(p.parse("Eksodo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exo 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EKSODO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXO 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (ceb)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (ceb)", ->
		`
		expect(p.parse("Leviticus 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lebitiko 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LEVITICUS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEBITIKO 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (ceb)", ->
		`
		expect(p.parse("Mga Numeros 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Mga Numero 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numeros 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numero 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA NUMEROS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("MGA NUMERO 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMEROS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMERO 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (ceb)", ->
		`
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (ceb)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (ceb)", ->
		`
		expect(p.parse("Mga Pagbangotan 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Pagbangotan 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA PAGBANGOTAN 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PAGBANGOTAN 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (ceb)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (ceb)", ->
		`
		expect(p.parse("Gipadayag 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIPADAYAG 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (ceb)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (ceb)", ->
		`
		expect(p.parse("Deuteronomio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dyuteronomyo 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deu 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEUTERONOMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DYUTERONOMYO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEU 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (ceb)", ->
		`
		expect(p.parse("Josue 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josué 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jos 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOSUE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSUÉ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOS 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (ceb)", ->
		`
		expect(p.parse("Mga Maghuhukom 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Maghuhukom 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA MAGHUHUKOM 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("MAGHUHUKOM 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (ceb)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (ceb)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (ceb)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (ceb)", ->
		`
		expect(p.parse("Isaias 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isaías 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ISAIAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISAÍAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (ceb)", ->
		`
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (ceb)", ->
		`
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (ceb)", ->
		`
		expect(p.parse("2. Mga Hari 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Mga Hari 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Hari 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Hari 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. MGA HARI 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 MGA HARI 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. HARI 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 HARI 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (ceb)", ->
		`
		expect(p.parse("1. Mga Hari 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Mga Hari 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Hari 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Hari 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. MGA HARI 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 MGA HARI 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. HARI 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 HARI 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (ceb)", ->
		`
		expect(p.parse("2. Mga Cronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Mga Cronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Mga Kronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Mga Kronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Mga Cronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Mga Cronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Mga Kronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Mga Kronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Cronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Cronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kronica 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kronika 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. MGA CRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. MGA CRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. MGA KRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. MGA KRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 MGA CRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 MGA CRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 MGA KRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 MGA KRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. CRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. CRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONICA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONIKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (ceb)", ->
		`
		expect(p.parse("1. Mga Cronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Mga Cronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Mga Kronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Mga Kronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Mga Cronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Mga Cronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Mga Kronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Mga Kronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Cronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Cronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kronica 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kronika 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. MGA CRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. MGA CRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. MGA KRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. MGA KRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 MGA CRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 MGA CRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 MGA KRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 MGA KRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. CRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. CRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONICA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONIKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (ceb)", ->
		`
		expect(p.parse("Esdras 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezr 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESDRAS 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZR 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (ceb)", ->
		`
		expect(p.parse("Nehemias 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemías 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIAS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMÍAS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (ceb)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (ceb)", ->
		`
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (ceb)", ->
		`
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (ceb)", ->
		`
		expect(p.parse("Mga Salmo 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Salmo 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sal 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA SALMO 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SALMO 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SAL 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (ceb)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (ceb)", ->
		`
		expect(p.parse("Mga Panultihon 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Panultihon 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA PANULTIHON 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PANULTIHON 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (ceb)", ->
		`
		expect(p.parse("Eklesyastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Magwawali 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kaalam 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EKLESYASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("MAGWAWALI 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KAALAM 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (ceb)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (ceb)", ->
		`
		expect(p.parse("Awit sa mga Awit 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Awit ni Solomon 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Awit 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AWIT SA MGA AWIT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("AWIT NI SOLOMON 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("AWIT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (ceb)", ->
		`
		expect(p.parse("Jeremias 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremías 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMÍAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (ceb)", ->
		`
		expect(p.parse("Ezequiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezekiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZEQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (ceb)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (ceb)", ->
		`
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Oseas 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OSEAS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (ceb)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (ceb)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amós 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMÓS 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (ceb)", ->
		`
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdías 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadia 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDÍAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADIA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (ceb)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonás 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONÁS 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (ceb)", ->
		`
		expect(p.parse("Miqueas 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mika 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mik 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIQUEAS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIKA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIK 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (ceb)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (ceb)", ->
		`
		expect(p.parse("Habacuc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABACUC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (ceb)", ->
		`
		expect(p.parse("Sofonias 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofonías 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zefania 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SOFONIAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONÍAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEFANIA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (ceb)", ->
		`
		expect(p.parse("Hageo 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ageo 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGEO 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AGEO 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (ceb)", ->
		`
		expect(p.parse("Zacarias 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zacarías 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZACARIAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACARÍAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (ceb)", ->
		`
		expect(p.parse("Malaquias 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malaquías 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malakias 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAQUIAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALAQUÍAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALAKIAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (ceb)", ->
		`
		expect(p.parse("Sulat ni San Mateo 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mateo 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SULAT NI SAN MATEO 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATEO 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (ceb)", ->
		`
		expect(p.parse("Sulat ni San Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SULAT NI SAN MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (ceb)", ->
		`
		expect(p.parse("Sulat ni San Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lu 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SULAT NI SAN LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LU 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (ceb)", ->
		`
		expect(p.parse("1. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jn 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (ceb)", ->
		`
		expect(p.parse("2. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jn 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (ceb)", ->
		`
		expect(p.parse("3. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jn 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("3. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (ceb)", ->
		`
		expect(p.parse("Sulat ni San Juan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Juan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jn 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SULAT NI SAN JUAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JUAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (ceb)", ->
		`
		expect(p.parse("Buhat sa mga Apostoles 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Ang Mga Binuhatan 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Binuhatan 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Bin 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BUHAT SA MGA APOSTOLES 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ANG MGA BINUHATAN 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("BINUHATAN 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("BIN 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (ceb)", ->
		`
		expect(p.parse("Mga Taga-Roma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Roma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA TAGA-ROMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (ceb)", ->
		`
		expect(p.parse("2. Mga Taga-Corinto 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Mga Taga-Corinto 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Taga-Corinto 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Taga-Corinto 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinto 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinto 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Co 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. MGA TAGA-CORINTO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 MGA TAGA-CORINTO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. TAGA-CORINTO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 TAGA-CORINTO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (ceb)", ->
		`
		expect(p.parse("1. Mga Taga-Corinto 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Mga Taga-Corinto 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Taga-Corinto 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Taga-Corinto 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinto 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinto 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Co 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. MGA TAGA-CORINTO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 MGA TAGA-CORINTO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. TAGA-CORINTO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 TAGA-CORINTO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (ceb)", ->
		`
		expect(p.parse("Mga Taga-Galacia 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Taga-Galacia 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galacia 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA TAGA-GALACIA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("TAGA-GALACIA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALACIA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (ceb)", ->
		`
		expect(p.parse("Mga Taga-Efeso 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Mga Taga-Éfeso 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Taga-Efeso 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Taga-Éfeso 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efeso 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Éfeso 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA TAGA-EFESO 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("MGA TAGA-ÉFESO 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("TAGA-EFESO 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("TAGA-ÉFESO 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESO 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ÉFESO 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (ceb)", ->
		`
		expect(p.parse("Mga Taga-Filipos 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Taga-Filipos 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filipos 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA TAGA-FILIPOS 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("TAGA-FILIPOS 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPOS 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (ceb)", ->
		`
		expect(p.parse("Mga Taga-Colosas 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Taga-Colosas 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Colosas 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA TAGA-COLOSAS 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("TAGA-COLOSAS 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COLOSAS 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (ceb)", ->
		`
		expect(p.parse("2. Mga Taga-Tesalonica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Mga Taga-Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Mga Taga-Tesalónica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Mga Taga-Tesalónika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Mga Taga-Tesalonica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Mga Taga-Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Mga Taga-Tesalónica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Mga Taga-Tesalónika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Taga-Tesalonica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Taga-Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Taga-Tesalónica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Taga-Tesalónika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Taga-Tesalonica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Taga-Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Taga-Tesalónica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Taga-Tesalónika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalónica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalónika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalónica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalónika 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. MGA TAGA-TESALONICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. MGA TAGA-TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. MGA TAGA-TESALÓNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. MGA TAGA-TESALÓNIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 MGA TAGA-TESALONICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 MGA TAGA-TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 MGA TAGA-TESALÓNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 MGA TAGA-TESALÓNIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TAGA-TESALONICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TAGA-TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TAGA-TESALÓNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TAGA-TESALÓNIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TAGA-TESALONICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TAGA-TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TAGA-TESALÓNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TAGA-TESALÓNIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALÓNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALÓNIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALÓNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALÓNIKA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (ceb)", ->
		`
		expect(p.parse("1. Mga Taga-Tesalonica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Mga Taga-Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Mga Taga-Tesalónica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Mga Taga-Tesalónika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Mga Taga-Tesalonica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Mga Taga-Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Mga Taga-Tesalónica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Mga Taga-Tesalónika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Taga-Tesalonica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Taga-Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Taga-Tesalónica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Taga-Tesalónika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Taga-Tesalonica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Taga-Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Taga-Tesalónica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Taga-Tesalónika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalónica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalónika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalónica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalónika 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. MGA TAGA-TESALONICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. MGA TAGA-TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. MGA TAGA-TESALÓNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. MGA TAGA-TESALÓNIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 MGA TAGA-TESALONICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 MGA TAGA-TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 MGA TAGA-TESALÓNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 MGA TAGA-TESALÓNIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TAGA-TESALONICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TAGA-TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TAGA-TESALÓNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TAGA-TESALÓNIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TAGA-TESALONICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TAGA-TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TAGA-TESALÓNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TAGA-TESALÓNIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALÓNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALÓNIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALÓNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALÓNIKA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (ceb)", ->
		`
		expect(p.parse("2. Kang Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Kang Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. KANG TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 KANG TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (ceb)", ->
		`
		expect(p.parse("1. Kang Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Kang Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. KANG TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 KANG TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (ceb)", ->
		`
		expect(p.parse("Kang Tito 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tito 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KANG TITO 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITO 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (ceb)", ->
		`
		expect(p.parse("Kang Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Kang Filemón 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemón 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KANG FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("KANG FILEMÓN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMÓN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (ceb)", ->
		`
		expect(p.parse("Mga Hebrohanon 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebreohanon 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Mga Ebreo 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MGA HEBROHANON 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREOHANON 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("MGA EBREO 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (ceb)", ->
		`
		expect(p.parse("Santiago 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jacobo 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SANTIAGO 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JACOBO 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (ceb)", ->
		`
		expect(p.parse("2. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (ceb)", ->
		`
		expect(p.parse("1. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (ceb)", ->
		`
		expect(p.parse("Judas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (ceb)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (ceb)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (ceb)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (ceb)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (ceb)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (ceb)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (ceb)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (ceb)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (ceb)", ->
		`
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (ceb)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (ceb)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (ceb)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (ceb)", ->
		expect(p.parse("Exod 1:1 ug 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 UG 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 og 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 OG 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (ceb)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (ceb)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (ceb)", ->
		expect(p.parse("Lev 1 (APSD)").osis_and_translations()).toEqual [["Lev.1", "APSD"]]
		expect(p.parse("lev 1 apsd").osis_and_translations()).toEqual [["Lev.1", "APSD"]]
	it "should handle book ranges (ceb)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("1 - 3  Juan").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (ceb)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

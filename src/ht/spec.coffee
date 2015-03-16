bcv_parser = require("../../js/ht_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (ht)", ->
		`
		expect(p.parse("liv Konmansman an 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Konmansman 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Jenez 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Jenèz 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Jen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV KONMANSMAN AN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("KONMANSMAN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("JENEZ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("JENÈZ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("JEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (ht)", ->
		`
		expect(p.parse("liv delivrans lan 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Delivrans 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Egzod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Egzòd 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Egz 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV DELIVRANS LAN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DELIVRANS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EGZOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EGZÒD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EGZ 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Lev (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (ht)", ->
		`
		expect(p.parse("liv Prensip lavi nan Bondye 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Levitik 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV PRENSIP LAVI NAN BONDYE 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVITIK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (ht)", ->
		`
		expect(p.parse("liv Resansman an 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Resansman 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Nonb 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Res 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV RESANSMAN AN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("RESANSMAN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NONB 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("RES 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (ht)", ->
		`
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (ht)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (ht)", ->
		`
		expect(p.parse("Chante pou plenn So lavil Jerizalem 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Chante pou plenn So lavil Jerizalèm 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Chante pou plenn Sò lavil Jerizalem 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Chante pou plenn Sò lavil Jerizalèm 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamantasyon 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plenn 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Pl 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CHANTE POU PLENN SO LAVIL JERIZALEM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("CHANTE POU PLENN SO LAVIL JERIZALÈM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("CHANTE POU PLENN SÒ LAVIL JERIZALEM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("CHANTE POU PLENN SÒ LAVIL JERIZALÈM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMANTASYON 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLENN 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PL 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (ht)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (ht)", ->
		`
		expect(p.parse("Revelasyon 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apokalips 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("REVELASYON 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOKALIPS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (ht)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (ht)", ->
		`
		expect(p.parse("Dezyem liv Lalwa a 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dezyèm liv Lalwa a 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deteronom 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deteronòm 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Detewonom 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Detewonòm 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Det 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM LIV LALWA A 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEZYÈM LIV LALWA A 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DETERONOM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DETERONÒM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DETEWONOM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DETEWONÒM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DET 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (ht)", ->
		`
		expect(p.parse("Liv Jozye a 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jozye 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Joz 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV JOZYE A 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZYE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZ 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (ht)", ->
		`
		expect(p.parse("Liv Chef yo 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Liv Chèf yo 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Jij 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV CHEF YO 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("LIV CHÈF YO 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JIJ 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (ht)", ->
		`
		expect(p.parse("Liv Rit la 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rit 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV RIT LA 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RIT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (ht)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (ht)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (ht)", ->
		`
		expect(p.parse("Liv Ezayi a 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ezayi 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ez 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV EZAYI A 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("EZAYI 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("EZ 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (ht)", ->
		`
		expect(p.parse("Dezyem liv Samyel la 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyem liv Samyèl la 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyèm liv Samyel la 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyèm liv Samyèl la 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyem Samyel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyem Samyèl 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyèm Samyel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Dezyèm Samyèl 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samyel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samyèl 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samyel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samyèl 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samyel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samyèl 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samyel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samyèl 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM LIV SAMYEL LA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYEM LIV SAMYÈL LA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYÈM LIV SAMYEL LA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYÈM LIV SAMYÈL LA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYEM SAMYEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYEM SAMYÈL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYÈM SAMYEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DEZYÈM SAMYÈL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMYEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMYÈL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMYEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMYÈL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMYEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMYÈL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMYEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMYÈL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (ht)", ->
		`
		expect(p.parse("Premye liv Samyel la 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Premye liv Samyèl la 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Premye Samyel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Premye Samyèl 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samyel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samyèl 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samyel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samyèl 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samyel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samyèl 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samyel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samyèl 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE LIV SAMYEL LA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PREMYE LIV SAMYÈL LA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PREMYE SAMYEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PREMYE SAMYÈL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMYEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMYÈL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMYEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMYÈL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMYEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMYÈL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMYEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMYÈL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (ht)", ->
		`
		expect(p.parse("Dezyem liv Wa yo 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Dezyèm liv Wa yo 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Dezyem Wa 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Dezyèm Wa 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Wa 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Wa 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Wa 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Wa 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM LIV WA YO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DEZYÈM LIV WA YO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DEZYEM WA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DEZYÈM WA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. WA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. WA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II WA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 WA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (ht)", ->
		`
		expect(p.parse("Premye liv Wa yo 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Premye Wa 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Wa 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Wa 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Wa 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Wa 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE LIV WA YO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PREMYE WA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. WA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. WA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 WA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I WA 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (ht)", ->
		`
		expect(p.parse("Dezyem liv Kwonik la 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Dezyèm liv Kwonik la 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Dezyem Kwonik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Dezyèm Kwonik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Dezyem Istwa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Dezyèm Istwa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kwonik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kwonik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kwonik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Istwa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kwonik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Istwa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Istwa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Istwa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Ist 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM LIV KWONIK LA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DEZYÈM LIV KWONIK LA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DEZYEM KWONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DEZYÈM KWONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DEZYEM ISTWA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DEZYÈM ISTWA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KWONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KWONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KWONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. ISTWA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KWONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ISTWA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II ISTWA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ISTWA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 IST 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (ht)", ->
		`
		expect(p.parse("Premye liv Kwonik la 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Premye Kwonik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Premye Istwa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kwonik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kwonik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kwonik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Istwa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kwonik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Istwa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Istwa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Istwa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Ist 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE LIV KWONIK LA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PREMYE KWONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PREMYE ISTWA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KWONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KWONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KWONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ISTWA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KWONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. ISTWA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ISTWA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I ISTWA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 IST 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (ht)", ->
		`
		expect(p.parse("Liv Esdras la 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esdras 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esd 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV ESDRAS LA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESDRAS 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESD 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (ht)", ->
		`
		expect(p.parse("Liv Neyemi an 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neyemi 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neemi 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Ne 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV NEYEMI AN 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEYEMI 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEEMI 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NE 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (ht)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (ht)", ->
		`
		expect(p.parse("Liv Este a 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Liv Estè a 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Este 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Estè 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV ESTE A 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("LIV ESTÈ A 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTE 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTÈ 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (ht)", ->
		`
		expect(p.parse("Liv Job la 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Liv Jòb la 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Jòb 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV JOB LA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("LIV JÒB LA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JÒB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (ht)", ->
		`
		expect(p.parse("Liv Som yo 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Liv Sòm yo 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Som 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sòm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV SOM YO 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("LIV SÒM YO 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SOM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SÒM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (ht)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (ht)", ->
		`
		expect(p.parse("Liv Pwoveb yo 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Liv Pwovèb yo 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pwoveb 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pwovèb 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pw 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV PWOVEB YO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("LIV PWOVÈB YO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PWOVEB 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PWOVÈB 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PW 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (ht)", ->
		`
		expect(p.parse("Eklezyas - Liv Filozof la 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eklezyas - Liv Filozòf la 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Liv Filozof la 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Liv Filozòf la 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eklezyas 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Filozof 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Filozòf 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ekl 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EKLEZYAS - LIV FILOZOF LA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("EKLEZYAS - LIV FILOZÒF LA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("LIV FILOZOF LA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("LIV FILOZÒF LA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("EKLEZYAS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("FILOZOF 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("FILOZÒF 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("EKL 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (ht)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (ht)", ->
		`
		expect(p.parse("Kantid de Kantik 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pi bel Chante a 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pi bèl Chante a 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Chante Salomon 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Chante 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KANTID DE KANTIK 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PI BEL CHANTE A 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PI BÈL CHANTE A 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CHANTE SALOMON 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CHANTE 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (ht)", ->
		`
		expect(p.parse("Liv Jeremi an 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremi 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV JEREMI AN 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMI 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (ht)", ->
		`
		expect(p.parse("Liv Ezekyel la 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Liv Ezekyèl la 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezekyel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezekyèl 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eze 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV EZEKYEL LA 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("LIV EZEKYÈL LA 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEKYEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEKYÈL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZE 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (ht)", ->
		`
		expect(p.parse("Liv Danyel la 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Liv Danyèl la 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Danyel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Danyèl 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV DANYEL LA 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("LIV DANYÈL LA 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANYEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANYÈL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (ht)", ->
		`
		expect(p.parse("Liv Oze a 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Oze 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV OZE A 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OZE 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (ht)", ->
		`
		expect(p.parse("Liv Jowel la 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Liv Jowèl la 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jowel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jowèl 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV JOWEL LA 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("LIV JOWÈL LA 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOWEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOWÈL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (ht)", ->
		`
		expect(p.parse("Liv Amos la 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Liv Amòs la 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amòs 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV AMOS LA 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("LIV AMÒS LA 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMÒS 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (ht)", ->
		`
		expect(p.parse("Liv Abdyas la 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdyas 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abd 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV ABDYAS LA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDYAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (ht)", ->
		`
		expect(p.parse("Liv Jonas la 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV JONAS LA 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (ht)", ->
		`
		expect(p.parse("Liv Miche a 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miche 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV MICHE A 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICHE 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (ht)", ->
		`
		expect(p.parse("Liv Nawoum lan 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nawoum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nawoun 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Naw 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV NAWOUM LAN 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAWOUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAWOUN 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAW 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (ht)", ->
		`
		expect(p.parse("Liv Abakik la 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Abakouk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Abakik 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Abak 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV ABAKIK LA 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ABAKOUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ABAKIK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ABAK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (ht)", ->
		`
		expect(p.parse("Liv Sofoni an 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofoni 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sof 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV SOFONI AN 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONI 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (ht)", ->
		`
		expect(p.parse("Liv Aje a 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Aje 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV AJE A 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AJE 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (ht)", ->
		`
		expect(p.parse("Liv Zakari a 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zakari 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zak 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV ZAKARI A 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZAKARI 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZAK 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (ht)", ->
		`
		expect(p.parse("Liv Malachi a 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malachi 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIV MALACHI A 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALACHI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (ht)", ->
		`
		expect(p.parse("Matye 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MATYE 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (ht)", ->
		`
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mak 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MAK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (ht)", ->
		`
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lik 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LIK 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (ht)", ->
		`
		expect(p.parse("Premye Jan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Jan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Jan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Jan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jn 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE JAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (ht)", ->
		`
		expect(p.parse("Dezyem Jan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Dezyèm Jan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Jan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Jan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Jan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jn 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM JAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DEZYÈM JAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (ht)", ->
		`
		expect(p.parse("III Jan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jn 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("III JAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (ht)", ->
		`
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jn 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (ht)", ->
		`
		expect(p.parse("Aksyon apot yo 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Aksyon apòt yo 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Travay apot yo 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Travay apòt yo 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Akdezapot 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Akdèzapot 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Travay 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Tr 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AKSYON APOT YO 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AKSYON APÒT YO 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("TRAVAY APOT YO 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("TRAVAY APÒT YO 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AKDEZAPOT 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AKDÈZAPOT 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("TRAVAY 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("TR 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (ht)", ->
		`
		expect(p.parse("Romen 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Ròm 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROMEN 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÒM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (ht)", ->
		`
		expect(p.parse("Dezyem Korentyen 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Dezyèm Korentyen 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Dezyem Korint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Dezyèm Korint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korentyen 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korentyen 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korentyen 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korentyen 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM KORENTYEN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DEZYÈM KORENTYEN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DEZYEM KORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DEZYÈM KORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORENTYEN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORENTYEN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORENTYEN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORENTYEN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (ht)", ->
		`
		expect(p.parse("Premye Korentyen 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Premye Korint 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korentyen 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korentyen 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korentyen 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korentyen 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korint 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korint 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korint 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korint 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE KORENTYEN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PREMYE KORINT 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORENTYEN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORENTYEN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORENTYEN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORENTYEN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINT 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINT 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINT 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINT 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (ht)", ->
		`
		expect(p.parse("Galasyen 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galasi 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALASYEN 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALASI 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (ht)", ->
		`
		expect(p.parse("Efezyen 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efez 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efèz 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EFEZYEN 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFÈZ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (ht)", ->
		`
		expect(p.parse("Filipyen 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filip 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILIPYEN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIP 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (ht)", ->
		`
		expect(p.parse("Kolosyen 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolos 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolòs 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KOLOSYEN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOS 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLÒS 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (ht)", ->
		`
		expect(p.parse("Dezyem Tesalonikyen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Dezyèm Tesalonikyen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Dezyem Tesalonik 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Dezyèm Tesalonik 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonikyen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonikyen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonikyen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonikyen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonik 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonik 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonik 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonik 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tes 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM TESALONIKYEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DEZYÈM TESALONIKYEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DEZYEM TESALONIK 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DEZYÈM TESALONIK 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONIKYEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONIKYEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONIKYEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONIKYEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONIK 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONIK 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONIK 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONIK 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TES 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (ht)", ->
		`
		expect(p.parse("Premye Tesalonikyen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Premye Tesalonik 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonikyen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonikyen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonikyen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonikyen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonik 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonik 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonik 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonik 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tes 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE TESALONIKYEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PREMYE TESALONIK 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONIKYEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONIKYEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONIKYEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONIKYEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONIK 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONIK 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONIK 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONIK 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TES 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (ht)", ->
		`
		expect(p.parse("Dezyem Timote 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Dezyèm Timote 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timote 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timote 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timote 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timote 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM TIMOTE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DEZYÈM TIMOTE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (ht)", ->
		`
		expect(p.parse("Premye Timote 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timote 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timote 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timote 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timote 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE TIMOTE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (ht)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (ht)", ->
		`
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (ht)", ->
		`
		expect(p.parse("Ebre 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Eb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EBRE 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("EB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (ht)", ->
		`
		expect(p.parse("Jak 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JAK 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (ht)", ->
		`
		expect(p.parse("Dezyem Pie 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyem Piè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyem Pye 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyem Pyè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyèm Pie 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyèm Piè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyèm Pye 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Dezyèm Pyè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pie 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Piè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pye 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pyè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pie 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Piè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pye 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pyè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pie 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Piè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pye 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pyè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pie 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Piè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pye 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pyè 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEZYEM PIE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYEM PIÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYEM PYE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYEM PYÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYÈM PIE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYÈM PIÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYÈM PYE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DEZYÈM PYÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PIE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PIÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PYE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PYÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PIE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PIÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PYE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PYÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PIE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PIÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PYE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PYÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PIE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PIÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PYE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PYÈ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (ht)", ->
		`
		expect(p.parse("Premye Pie 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Premye Piè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Premye Pye 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Premye Pyè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pie 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Piè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pye 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pyè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pie 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Piè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pye 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pyè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pie 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Piè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pye 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pyè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pie 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Piè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pye 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pyè 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREMYE PIE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PREMYE PIÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PREMYE PYE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PREMYE PYÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PIE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PIÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PYE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PYÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PIE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PIÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PYE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PYÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PIE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PIÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PYE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PYÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PIE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PIÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PYE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PYÈ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (ht)", ->
		`
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jid 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JID 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (ht)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (ht)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (ht)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (ht)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book Bel (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (ht)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book 2Macc (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (ht)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (ht)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (ht)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (ht)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (ht)", ->
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

	it "should handle ranges (ht)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (ht)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (ht)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (ht)", ->
		expect(p.parse("Exod 1:1 and 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 AND 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (ht)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (ht)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (ht)", ->
		expect(p.parse("Lev 1 (HCV)").osis_and_translations()).toEqual [["Lev.1", "HCV"]]
		expect(p.parse("lev 1 hcv").osis_and_translations()).toEqual [["Lev.1", "HCV"]]
	it "should handle book ranges (ht)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Premye - 3  Jan").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (ht)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

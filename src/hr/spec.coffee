bcv_parser = require("../../js/hr_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (hr)", ->
		`
		expect(p.parse("Knjiga Postanka 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Postanak 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Post 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA POSTANKA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("POSTANAK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("POST 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (hr)", ->
		`
		expect(p.parse("Knjiga Izlaska 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Egzodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Izlazak 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Izl 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA IZLASKA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EGZODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("IZLAZAK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("IZL 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (hr)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (hr)", ->
		`
		expect(p.parse("Levitski zakonik 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LEVITSKI ZAKONIK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (hr)", ->
		`
		expect(p.parse("Knjiga Brojeva 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Brojevi 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Br 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA BROJEVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("BROJEVI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("BR 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (hr)", ->
		`
		expect(p.parse("Knjiga Sirahova 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (hr)", ->
		`
		expect(p.parse("Knjiga Mudrosti 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Mudr 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (hr)", ->
		`
		expect(p.parse("Jeremijine tuzaljke 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremijine tužaljke 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentacije 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Tuzaljke 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Tužaljke 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Tuz 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Tuž 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIJINE TUZALJKE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIJINE TUŽALJKE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTACIJE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("TUZALJKE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("TUŽALJKE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("TUZ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("TUŽ 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (hr)", ->
		`
		expect(p.parse("Pismo Jeremije proroka 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Jeremijino pismo 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (hr)", ->
		`
		expect(p.parse("Otkrivenje Ivanovo 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apokalipsa 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Otkrivenje 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Otk 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OTKRIVENJE IVANOVO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOKALIPSA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OTKRIVENJE 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OTK 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (hr)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (hr)", ->
		`
		expect(p.parse("Ponovljeni zakon 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Pnz 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PONOVLJENI ZAKON 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PNZ 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (hr)", ->
		`
		expect(p.parse("Josua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jošua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Js 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jš 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOSUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOŠUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JS 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JŠ 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (hr)", ->
		`
		expect(p.parse("Knjiga o Sucima 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Suci 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA O SUCIMA 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("SUCI 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (hr)", ->
		`
		expect(p.parse("Knjiga o Ruti 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruta 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA O RUTI 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTA 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (hr)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (hr)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (hr)", ->
		`
		expect(p.parse("Izaija 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Iz 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("IZAIJA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZ 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (hr)", ->
		`
		expect(p.parse("Druga Samuelova knjiga 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druga knjiga o Samuelu 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druga Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUGA SAMUELOVA KNJIGA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUGA KNJIGA O SAMUELU 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUGA SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (hr)", ->
		`
		expect(p.parse("Prva Samuelova knjiga 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prva knjiga o Samuelu 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prva Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA SAMUELOVA KNJIGA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVA KNJIGA O SAMUELU 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVA SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (hr)", ->
		`
		expect(p.parse("Druga knjiga o Kraljevima 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druga Kraljevima 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kraljevima 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kraljevima 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kraljevima 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kraljevima 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kr 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUGA KNJIGA O KRALJEVIMA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUGA KRALJEVIMA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KRALJEVIMA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KRALJEVIMA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KRALJEVIMA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRALJEVIMA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KR 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (hr)", ->
		`
		expect(p.parse("Prva knjiga o Kraljevima 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva Kraljevima 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kraljevima 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kraljevima 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kraljevima 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kraljevima 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kr 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNJIGA O KRALJEVIMA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KRALJEVIMA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KRALJEVIMA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KRALJEVIMA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRALJEVIMA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KRALJEVIMA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KR 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (hr)", ->
		`
		expect(p.parse("Druga knjiga Ljetopisa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druga Ljetopisa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Ljetopisa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Ljetopisa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Ljetopisa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Ljetopisa 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Ljet 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUGA KNJIGA LJETOPISA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUGA LJETOPISA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. LJETOPISA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. LJETOPISA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II LJETOPISA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 LJETOPISA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 LJET 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (hr)", ->
		`
		expect(p.parse("Prva knjiga Ljetopisa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva Ljetopisa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Ljetopisa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Ljetopisa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Ljetopisa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Ljetopisa 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Ljet 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNJIGA LJETOPISA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA LJETOPISA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. LJETOPISA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. LJETOPISA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 LJETOPISA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I LJETOPISA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 LJET 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (hr)", ->
		`
		expect(p.parse("Knjiga Ezrina 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezr 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA EZRINA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZR 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (hr)", ->
		`
		expect(p.parse("Knjiga Nehemijina 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemija 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA NEHEMIJINA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIJA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (hr)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (hr)", ->
		`
		expect(p.parse("Estera 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTERA 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (hr)", ->
		`
		expect(p.parse("Knjiga o Jobu 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNJIGA O JOBU 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (hr)", ->
		`
		expect(p.parse("Psalam 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalme 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalmi 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PSALAM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALME 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALMI 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (hr)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (hr)", ->
		`
		expect(p.parse("Mudre izreke 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Poslovice 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Izr 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MUDRE IZREKE 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("POSLOVICE 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("IZR 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (hr)", ->
		`
		expect(p.parse("Propovjednik 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kohelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Prop 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPOVJEDNIK 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KOHELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PROP 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (hr)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (hr)", ->
		`
		expect(p.parse("Pjesma nad pjesmama 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pj 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PJESMA NAD PJESMAMA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PJ 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (hr)", ->
		`
		expect(p.parse("Jeremija 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jr 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIJA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JR 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (hr)", ->
		`
		expect(p.parse("Ezekiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ez 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZEKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (hr)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dn 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (hr)", ->
		`
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hošea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hoš 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOŠEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOŠ 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (hr)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jl 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (hr)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (hr)", ->
		`
		expect(p.parse("Obadija 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ob 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADIJA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (hr)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jona 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jon 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONA 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JON 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (hr)", ->
		`
		expect(p.parse("Mihej 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mih 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIHEJ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIH 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (hr)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (hr)", ->
		`
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (hr)", ->
		`
		expect(p.parse("Sefanija 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofonije 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sef 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEFANIJA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONIJE 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (hr)", ->
		`
		expect(p.parse("Hagaj 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hagej 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Agej 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGAJ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGEJ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AGEJ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (hr)", ->
		`
		expect(p.parse("Zaharija 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zah 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZAHARIJA 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZAH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (hr)", ->
		`
		expect(p.parse("Malahija 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAHIJA 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (hr)", ->
		`
		expect(p.parse("Jevanđelje po Mateju 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanðelje po Mateju 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanđelje po Mateju 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matej 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEVANĐELJE PO MATEJU 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANÐELJE PO MATEJU 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANĐELJE PO MATEJU 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATEJ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (hr)", ->
		`
		expect(p.parse("Jevanđelje po Marku 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Evanðelje po Marku 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Evanđelje po Marku 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marko 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEVANĐELJE PO MARKU 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("EVANÐELJE PO MARKU 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("EVANĐELJE PO MARKU 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKO 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (hr)", ->
		`
		expect(p.parse("Jevanđelje po Luki 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanðelje po Luki 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanđelje po Luki 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luka 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEVANĐELJE PO LUKI 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANÐELJE PO LUKI 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANĐELJE PO LUKI 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (hr)", ->
		`
		expect(p.parse("Prva Ivanova Poslanica 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prva Ivanova poslanica 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Ivanova Poslanica 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Ivanova Poslanica 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Ivanova Poslanica 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Ivanova Poslanica 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prva Ivanova 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Ivanova 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Ivanova 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Ivanova 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Ivanova 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Iv 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA IVANOVA POSLANICA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVA IVANOVA POSLANICA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. IVANOVA POSLANICA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. IVANOVA POSLANICA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 IVANOVA POSLANICA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I IVANOVA POSLANICA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVA IVANOVA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. IVANOVA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. IVANOVA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 IVANOVA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I IVANOVA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 IV 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (hr)", ->
		`
		expect(p.parse("Druga Ivanova Poslanica 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druga Ivanova poslanica 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Ivanova Poslanica 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Ivanova Poslanica 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Ivanova Poslanica 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Ivanova Poslanica 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druga Ivanova 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Ivanova 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Ivanova 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Ivanova 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Ivanova 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Iv 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUGA IVANOVA POSLANICA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUGA IVANOVA POSLANICA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. IVANOVA POSLANICA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. IVANOVA POSLANICA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II IVANOVA POSLANICA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 IVANOVA POSLANICA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUGA IVANOVA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. IVANOVA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. IVANOVA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II IVANOVA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 IVANOVA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 IV 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (hr)", ->
		`
		expect(p.parse("Treca Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treca Ivanova poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treæa Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treæa Ivanova poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treća Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treća Ivanova poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Ivanova Poslanica 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treca Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treæa Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treća Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Ivanova 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Iv 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TRECA IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRECA IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TREÆA IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TREÆA IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TREĆA IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TREĆA IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 IVANOVA POSLANICA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRECA IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TREÆA IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TREĆA IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 IVANOVA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 IV 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (hr)", ->
		`
		expect(p.parse("Jevanđelje po Ivanu 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Evanðelje po Ivanu 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Evanđelje po Ivanu 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Ivan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Iv 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEVANĐELJE PO IVANU 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EVANÐELJE PO IVANU 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EVANĐELJE PO IVANU 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("IVAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("IV 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (hr)", ->
		`
		expect(p.parse("Djela apostolska 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Dj 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DJELA APOSTOLSKA 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("DJ 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Rimljanima 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Poslanica Rimljanima 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rimljanima 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rim 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA RIMLJANIMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("POSLANICA RIMLJANIMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RIMLJANIMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RIM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (hr)", ->
		`
		expect(p.parse("Pavlova druga poslanica Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Pavlova druga poslanica Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga Korincanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga Korinćanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga poslanica Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga poslanica Korinæanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga poslanica Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korincanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinćanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korincanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinćanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korincanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinćanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korincanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinćanima Poslanica 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druga Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korincanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinćanima 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA DRUGA POSLANICA KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("PAVLOVA DRUGA POSLANICA KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA KORINCANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA KORINĆANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA POSLANICA KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA POSLANICA KORINÆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA POSLANICA KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINCANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINĆANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINCANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINĆANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINCANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINĆANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINCANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINĆANIMA POSLANICA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUGA KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINCANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINĆANIMA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (hr)", ->
		`
		expect(p.parse("Pavlova prva poslanica Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Pavlova prva poslanica Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korincanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korinćanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva poslanica Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva poslanica Korinæanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva poslanica Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korincanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinćanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korincanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinćanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korincanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinćanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korincanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinćanima Poslanica 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korincanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinćanima 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA PRVA POSLANICA KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PAVLOVA PRVA POSLANICA KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINCANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINĆANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA POSLANICA KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA POSLANICA KORINÆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA POSLANICA KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINCANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINĆANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINCANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINĆANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINCANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINĆANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINCANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINĆANIMA POSLANICA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINCANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINĆANIMA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Galacanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Pavlova poslanica Galaćanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Poslanica Galacanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Poslanica Galaæanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Poslanica Galaćanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galacanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galaćanima 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA GALACANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("PAVLOVA POSLANICA GALAĆANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("POSLANICA GALACANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("POSLANICA GALAÆANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("POSLANICA GALAĆANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALACANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALAĆANIMA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Efezanima 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Pavlova poslanica Efežanima 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Poslanica Efezanima 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Poslanica Efežanima 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efezanima 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efežanima 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA EFEZANIMA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("PAVLOVA POSLANICA EFEŽANIMA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("POSLANICA EFEZANIMA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("POSLANICA EFEŽANIMA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZANIMA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEŽANIMA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Filipljanima 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Poslanica Filipljanima 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filipljanima 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA FILIPLJANIMA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("POSLANICA FILIPLJANIMA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPLJANIMA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Kolosanima 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Pavlova poslanica Kološanima 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Poslanica Kolosanima 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Poslanica Kološanima 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolosanima 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kološanima 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA KOLOSANIMA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("PAVLOVA POSLANICA KOLOŠANIMA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("POSLANICA KOLOSANIMA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("POSLANICA KOLOŠANIMA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSANIMA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOŠANIMA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (hr)", ->
		`
		expect(p.parse("Pavlova druga poslanica Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druga Solunjanima Poslanica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druga poslanica Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solunjanima Poslanica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solunjanima Poslanica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solunjanima Poslanica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solunjanima Poslanica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druga Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solunjanima 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Sol 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA DRUGA POSLANICA SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUGA SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUGA POSLANICA SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUGA SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLUNJANIMA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOL 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (hr)", ->
		`
		expect(p.parse("Pavlova prva poslanica Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solunjanima Poslanica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva poslanica Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solunjanima Poslanica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solunjanima Poslanica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solunjanima Poslanica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solunjanima Poslanica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solunjanima 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Sol 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA PRVA POSLANICA SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA POSLANICA SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLUNJANIMA POSLANICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLUNJANIMA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOL 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (hr)", ->
		`
		expect(p.parse("Pavlova druga poslanica Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druga Timoteju Poslanica 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druga poslanica Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteju Poslanica 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteju Poslanica 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteju Poslanica 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteju Poslanica 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druga Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteju 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA DRUGA POSLANICA TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUGA TIMOTEJU POSLANICA 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUGA POSLANICA TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEJU POSLANICA 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEJU POSLANICA 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEJU POSLANICA 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEJU POSLANICA 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUGA TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEJU 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (hr)", ->
		`
		expect(p.parse("Pavlova prva poslanica Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prva Timoteju Poslanica 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prva poslanica Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteju Poslanica 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteju Poslanica 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteju Poslanica 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteju Poslanica 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prva Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteju 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA PRVA POSLANICA TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVA TIMOTEJU POSLANICA 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVA POSLANICA TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEJU POSLANICA 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEJU POSLANICA 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEJU POSLANICA 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEJU POSLANICA 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVA TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEJU 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Titu 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Poslanica Titu 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titu 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA TITU 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("POSLANICA TITU 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITU 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Filemonu 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Poslanica Filemonu 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemonu 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA FILEMONU 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("POSLANICA FILEMONU 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMONU 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (hr)", ->
		`
		expect(p.parse("Pavlova poslanica Hebrejima 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Poslanica Hebrejima 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrejima 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PAVLOVA POSLANICA HEBREJIMA 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("POSLANICA HEBREJIMA 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREJIMA 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (hr)", ->
		`
		expect(p.parse("Jakovljeva poslanica 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jakovljeva 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jak 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JAKOVLJEVA POSLANICA 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAKOVLJEVA 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAK 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (hr)", ->
		`
		expect(p.parse("Druga Petrova Poslanica 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druga Petrova poslanica 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Petrova Poslanica 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petrova Poslanica 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petrova Poslanica 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petrova Poslanica 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druga Petrova 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Petrova 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petrova 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petrova 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petrova 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pt 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUGA PETROVA POSLANICA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUGA PETROVA POSLANICA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PETROVA POSLANICA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETROVA POSLANICA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETROVA POSLANICA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETROVA POSLANICA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUGA PETROVA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PETROVA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETROVA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETROVA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETROVA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (hr)", ->
		`
		expect(p.parse("Prva Petrova Poslanica 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prva Petrova poslanica 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Petrova Poslanica 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petrova Poslanica 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petrova Poslanica 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petrova Poslanica 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prva Petrova 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Petrova 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petrova 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petrova 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petrova 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pt 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA PETROVA POSLANICA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVA PETROVA POSLANICA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PETROVA POSLANICA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETROVA POSLANICA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETROVA POSLANICA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETROVA POSLANICA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVA PETROVA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PETROVA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETROVA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETROVA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETROVA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (hr)", ->
		`
		expect(p.parse("Poslanica Jude apostola 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judina poslanica 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judina 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jd 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("POSLANICA JUDE APOSTOLA 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDINA POSLANICA 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDINA 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (hr)", ->
		`
		expect(p.parse("Tobija 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (hr)", ->
		`
		expect(p.parse("Judita 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (hr)", ->
		`
		expect(p.parse("Baruh 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (hr)", ->
		`
		expect(p.parse("Suzana 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Suz 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (hr)", ->
		`
		expect(p.parse("Druga knjiga o Makabejcima 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (hr)", ->
		`
		expect(p.parse("Treca knjiga o Makabejcima 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Treća knjiga o Makabejcima 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (hr)", ->
		`
		expect(p.parse("4 Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (hr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (hr)", ->
		`
		expect(p.parse("Prva knjiga o Makabejcima 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (hr)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (hr)", ->
		expect(p.parse("Titus 1:1, poglavlja 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 POGLAVLJA 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, poglavlje 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 POGLAVLJE 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, glava 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 GLAVA 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (hr)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (hr)", ->
		expect(p.parse("Exod 1:1 i 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 I 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (hr)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (hr)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (hr)", ->
		expect(p.parse("Lev 1 (CKK)").osis_and_translations()).toEqual [["Lev.1", "CKK"]]
		expect(p.parse("lev 1 ckk").osis_and_translations()).toEqual [["Lev.1", "CKK"]]
	it "should handle book ranges (hr)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Prva - Treæa  Ivanova").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (hr)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

bcv_parser = require("../../js/fi_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (fi)", ->
		`
		expect(p.parse("Ensimmainen Mooseksen kirja 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Ensimmäinen Mooseksen kirja 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Ensimmainen Mooseksen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Ensimmäinen Mooseksen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mooseksen kirja 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mooseksen kirja 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mooseksen kirja 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mooseksen kirja 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mooseksen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mooseksen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mooseksen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mooseksen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Moos 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN MOOSEKSEN KIRJA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ENSIMMÄINEN MOOSEKSEN KIRJA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ENSIMMAINEN MOOSEKSEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ENSIMMÄINEN MOOSEKSEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOOSEKSEN KIRJA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOOSEKSEN KIRJA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOOSEKSEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOOSEKSEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOOSEKSEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOOSEKSEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOOS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (fi)", ->
		`
		expect(p.parse("Toinen Mooseksen kirja 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mooseksen kirja 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mooseksen kirja 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mooseksen kirja 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mooseksen kirja 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Toinen Mooseksen 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mooseksen 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mooseksen 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mooseksen 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mooseksen 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Moos 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN MOOSEKSEN KIRJA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOOSEKSEN KIRJA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOOSEKSEN KIRJA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("TOINEN MOOSEKSEN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOOSEKSEN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOOSEKSEN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOOSEKSEN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOOSEKSEN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOOS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (fi)", ->
		`
		expect(p.parse("Bel ja lohikaarme 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel ja lohikaärme 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel ja lohikäarme 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel ja lohikäärme 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (fi)", ->
		`
		expect(p.parse("Kolmas Mooseksen kirja 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mooseksen kirja 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mooseksen kirja 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mooseksen kirja 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mooseksen kirja 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Kolmas Mooseksen 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mooseksen 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mooseksen 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mooseksen 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mooseksen 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Moos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KOLMAS MOOSEKSEN KIRJA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOOSEKSEN KIRJA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOOSEKSEN KIRJA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("KOLMAS MOOSEKSEN 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOOSEKSEN 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOOSEKSEN 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOOSEKSEN 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOOSEKSEN 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (fi)", ->
		`
		expect(p.parse("Neljas Mooseksen kirja 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Neljäs Mooseksen kirja 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mooseksen kirja 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mooseksen kirja 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mooseksen kirja 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mooseksen kirja 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Neljas Mooseksen 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Neljäs Mooseksen 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mooseksen 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mooseksen 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mooseksen 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mooseksen 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Moos 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NELJAS MOOSEKSEN KIRJA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NELJÄS MOOSEKSEN KIRJA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOOSEKSEN KIRJA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOOSEKSEN KIRJA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NELJAS MOOSEKSEN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NELJÄS MOOSEKSEN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOOSEKSEN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOOSEKSEN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOOSEKSEN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOOSEKSEN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOOS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (fi)", ->
		`
		expect(p.parse("Jeesus Siirakin kirja 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Jesus Siirakin kirja 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Siirakin kirja 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirakin kirja 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Siirakin 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirakin 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (fi)", ->
		`
		expect(p.parse("Salomon viisaus 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Viisauden kirja 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Viis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (fi)", ->
		`
		expect(p.parse("Valitusvirret 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Valit 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VALITUSVIRRET 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("VALIT 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (fi)", ->
		`
		expect(p.parse("Jeremian kirje 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (fi)", ->
		`
		expect(p.parse("Johanneksen ilmestys 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Ilmestyskirja 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Ilmestys 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Ilm 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOHANNEKSEN ILMESTYS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ILMESTYSKIRJA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ILMESTYS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ILM 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (fi)", ->
		`
		expect(p.parse("Manassen rukouksen 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Man ru 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (fi)", ->
		`
		expect(p.parse("Viides Mooseksen kirja 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mooseksen kirja 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mooseksen kirja 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mooseksen kirja 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mooseksen kirja 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Viides Mooseksen 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mooseksen 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mooseksen 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mooseksen 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mooseksen 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Moos 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VIIDES MOOSEKSEN KIRJA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOOSEKSEN KIRJA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOOSEKSEN KIRJA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOOSEKSEN KIRJA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("VIIDES MOOSEKSEN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOOSEKSEN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOOSEKSEN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOOSEKSEN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOOSEKSEN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOOS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (fi)", ->
		`
		expect(p.parse("Joosuan kirja 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Joosuan 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Joos 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOOSUAN KIRJA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOOSUAN 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOOS 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (fi)", ->
		`
		expect(p.parse("Tuomarien kirja 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Tuomarien 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Tuom 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TUOMARIEN KIRJA 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("TUOMARIEN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("TUOM 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (fi)", ->
		`
		expect(p.parse("Ruutin kirja 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruutin 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruut 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUUTIN KIRJA 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUUTIN 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUUT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (fi)", ->
		`
		expect(p.parse("Ensimmainen Esra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Ensimmäinen Esra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Es 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (fi)", ->
		`
		expect(p.parse("Toinen Esra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Es 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (fi)", ->
		`
		expect(p.parse("Jesajan kirja 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Jesajan 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Jes 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JESAJAN KIRJA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("JESAJAN 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("JES 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (fi)", ->
		`
		expect(p.parse("Toinen Samuelin kirja 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuelin kirja 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuelin kirja 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuelin kirja 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuelin kirja 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Toinen Samuelin 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuelin 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuelin 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuelin 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuelin 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN SAMUELIN KIRJA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUELIN KIRJA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUELIN KIRJA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUELIN KIRJA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUELIN KIRJA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("TOINEN SAMUELIN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUELIN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUELIN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUELIN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUELIN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (fi)", ->
		`
		expect(p.parse("Ensimmainen Samuelin kirja 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Ensimmäinen Samuelin kirja 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Ensimmainen Samuelin 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Ensimmäinen Samuelin 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuelin kirja 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuelin kirja 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuelin kirja 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuelin kirja 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuelin 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuelin 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuelin 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuelin 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN SAMUELIN KIRJA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ENSIMMÄINEN SAMUELIN KIRJA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ENSIMMAINEN SAMUELIN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ENSIMMÄINEN SAMUELIN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUELIN KIRJA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUELIN KIRJA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUELIN KIRJA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUELIN KIRJA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUELIN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUELIN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUELIN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUELIN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (fi)", ->
		`
		expect(p.parse("Toinen Kuninkaiden kirja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kuninkaiden kirja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kuninkaiden kirja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kuninkaiden kirja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kuninkaiden kirja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Toinen Kuninkaiden 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kuninkaiden 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kuninkaiden 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kuninkaiden 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kuninkaiden 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kun 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN KUNINKAIDEN KIRJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KUNINKAIDEN KIRJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KUNINKAIDEN KIRJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KUNINKAIDEN KIRJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KUNINKAIDEN KIRJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("TOINEN KUNINKAIDEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KUNINKAIDEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KUNINKAIDEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KUNINKAIDEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KUNINKAIDEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KUN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (fi)", ->
		`
		expect(p.parse("Ensimmainen Kuninkaiden kirja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Ensimmäinen Kuninkaiden kirja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Ensimmainen Kuninkaiden 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Ensimmäinen Kuninkaiden 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kuninkaiden kirja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kuninkaiden kirja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kuninkaiden kirja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kuninkaiden kirja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kuninkaiden 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kuninkaiden 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kuninkaiden 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kuninkaiden 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kun 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN KUNINKAIDEN KIRJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ENSIMMÄINEN KUNINKAIDEN KIRJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ENSIMMAINEN KUNINKAIDEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ENSIMMÄINEN KUNINKAIDEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KUNINKAIDEN KIRJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KUNINKAIDEN KIRJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KUNINKAIDEN KIRJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KUNINKAIDEN KIRJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KUNINKAIDEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KUNINKAIDEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KUNINKAIDEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KUNINKAIDEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KUN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (fi)", ->
		`
		expect(p.parse("Toinen Aikakirja 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Aikakirja 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Aikakirja 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Aikakirja 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Aikakirja 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Aikak 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Aik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN AIKAKIRJA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. AIKAKIRJA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. AIKAKIRJA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II AIKAKIRJA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 AIKAKIRJA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 AIKAK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 AIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (fi)", ->
		`
		expect(p.parse("Ensimmainen Aikakirja 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Ensimmäinen Aikakirja 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Aikakirja 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Aikakirja 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Aikakirja 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Aikakirja 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Aikak 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Aik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN AIKAKIRJA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ENSIMMÄINEN AIKAKIRJA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. AIKAKIRJA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. AIKAKIRJA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 AIKAKIRJA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I AIKAKIRJA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 AIKAK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 AIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (fi)", ->
		`
		expect(p.parse("Esran kirja 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esran 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esr 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESRAN KIRJA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESRAN 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESR 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (fi)", ->
		`
		expect(p.parse("Nehemian kirja 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemian 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIAN KIRJA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIAN 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (fi)", ->
		`
		expect(p.parse("Kreikkalainen Esterin kirja 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Kreikkalainen Esterin 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Kr. Est 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Kr Est 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (fi)", ->
		`
		expect(p.parse("Esterin kirja 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esterin 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTERIN KIRJA 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTERIN 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (fi)", ->
		`
		expect(p.parse("Jobin kirja 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Jobin 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOBIN KIRJA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOBIN 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (fi)", ->
		`
		expect(p.parse("Psalmien kirja 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalmien 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalmit 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalmi 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PSALMIEN KIRJA 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALMIEN 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALMIT 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALMI 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (fi)", ->
		`
		expect(p.parse("Asarjan rukous 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Asar ru 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (fi)", ->
		`
		expect(p.parse("Sananlaskujen kirja 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Sananlaskujen 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Sananlaskut 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Sananl 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Snl 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SANANLASKUJEN KIRJA 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("SANANLASKUJEN 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("SANANLASKUT 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("SANANL 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("SNL 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (fi)", ->
		`
		expect(p.parse("Saarnaajan kirja 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Saarnaajan 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Saarnaaja 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Saarn 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Saar 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAARNAAJAN KIRJA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("SAARNAAJAN 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("SAARNAAJA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("SAARN 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("SAAR 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (fi)", ->
		`
		expect(p.parse("Kolmen nuoren miehen ollessa tulisessa patsissa 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen nuoren miehen ollessa tulisessa patsissä 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen nuoren miehen ollessa tulisessa pätsissa 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen nuoren miehen ollessa tulisessa pätsissä 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen miehen kiitosvirsi tulessa 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen miehen kiitosvirsi 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen nuoren miehen 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Kolmen miehen 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (fi)", ->
		`
		expect(p.parse("Laulujen laulu 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Korkea veisu 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Laul. l 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Laul l 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAULUJEN LAULU 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("KORKEA VEISU 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("LAUL. L 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("LAUL L 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (fi)", ->
		`
		expect(p.parse("Jeremian kirja 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremian 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIAN KIRJA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMIAN 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (fi)", ->
		`
		expect(p.parse("Hesekielin kirja 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Hesekielin 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Hes 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HESEKIELIN KIRJA 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("HESEKIELIN 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("HES 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (fi)", ->
		`
		expect(p.parse("Danielin kirja 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Danielin 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIELIN KIRJA 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANIELIN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (fi)", ->
		`
		expect(p.parse("Hoosean kirja 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hoosean 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hoos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOOSEAN KIRJA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOOSEAN 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (fi)", ->
		`
		expect(p.parse("Joelin kirja 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joelin 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOELIN KIRJA 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOELIN 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (fi)", ->
		`
		expect(p.parse("Aamoksen kirja 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Aamoksen 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Aam 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AAMOKSEN KIRJA 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AAMOKSEN 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AAM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (fi)", ->
		`
		expect(p.parse("Obadjan kirja 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadjan 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadj 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ob 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADJAN KIRJA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADJAN 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADJ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (fi)", ->
		`
		expect(p.parse("Joonan kirja 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Joonan 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Joona 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Joon 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOONAN KIRJA 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JOONAN 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JOONA 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JOON 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (fi)", ->
		`
		expect(p.parse("Miikan kirja 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miikan 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miika 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miik 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIIKAN KIRJA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIIKAN 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIIKA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIIK 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (fi)", ->
		`
		expect(p.parse("Nahumin kirja 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahumin 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUMIN KIRJA 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHUMIN 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (fi)", ->
		`
		expect(p.parse("Habakukin kirja 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habakukin 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKUKIN KIRJA 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABAKUKIN 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (fi)", ->
		`
		expect(p.parse("Sefanjan kirja 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sefanjan 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sef 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEFANJAN KIRJA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEFANJAN 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (fi)", ->
		`
		expect(p.parse("Haggain kirja 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Haggain 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hagg 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGGAIN KIRJA 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGGAIN 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (fi)", ->
		`
		expect(p.parse("Sakarjan kirja 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Sakarjan 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Sak 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAKARJAN KIRJA 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("SAKARJAN 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("SAK 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (fi)", ->
		`
		expect(p.parse("Malakian kirja 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malakian 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAKIAN KIRJA 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALAKIAN 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (fi)", ->
		`
		expect(p.parse("Evankeliumi Matteuksen mukaan 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matteuksen evankeliumi 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matteuksen 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANKELIUMI MATTEUKSEN MUKAAN 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTEUKSEN EVANKELIUMI 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTEUKSEN 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (fi)", ->
		`
		expect(p.parse("Evankeliumi Markuksen mukaan 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Markuksen evankeliumi 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Markuksen 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANKELIUMI MARKUKSEN MUKAAN 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKUKSEN EVANKELIUMI 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKUKSEN 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (fi)", ->
		`
		expect(p.parse("Evankeliumi Luukkaan mukaan 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luukkaan evankeliumi 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luukkaan 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luuk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANKELIUMI LUUKKAAN MUKAAN 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUUKKAAN EVANKELIUMI 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUUKKAAN 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUUK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (fi)", ->
		`
		expect(p.parse("Ensimmainen Johanneksen kirje 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Ensimmäinen Johanneksen kirje 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Ensimmainen Johanneksen 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Ensimmäinen Johanneksen 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Johanneksen kirje 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Johanneksen kirje 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Johanneksen kirje 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Johanneksen kirje 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Johanneksen 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Johanneksen 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Johanneksen 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Johanneksen 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN JOHANNEKSEN KIRJE 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ENSIMMÄINEN JOHANNEKSEN KIRJE 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ENSIMMAINEN JOHANNEKSEN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ENSIMMÄINEN JOHANNEKSEN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOHANNEKSEN KIRJE 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOHANNEKSEN KIRJE 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOHANNEKSEN KIRJE 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOHANNEKSEN KIRJE 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOHANNEKSEN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOHANNEKSEN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOHANNEKSEN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOHANNEKSEN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (fi)", ->
		`
		expect(p.parse("Toinen Johanneksen kirje 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Johanneksen kirje 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Johanneksen kirje 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Johanneksen kirje 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Johanneksen kirje 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Toinen Johanneksen 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Johanneksen 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Johanneksen 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Johanneksen 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Johanneksen 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Toinen Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN JOHANNEKSEN KIRJE 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOHANNEKSEN KIRJE 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOHANNEKSEN KIRJE 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOHANNEKSEN KIRJE 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOHANNEKSEN KIRJE 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("TOINEN JOHANNEKSEN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOHANNEKSEN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOHANNEKSEN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOHANNEKSEN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOHANNEKSEN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("TOINEN JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (fi)", ->
		`
		expect(p.parse("Kolmas Johanneksen kirje 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Johanneksen kirje 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Johanneksen kirje 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Johanneksen kirje 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Johanneksen kirje 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Kolmas Johanneksen 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Johanneksen 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Johanneksen 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Johanneksen 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Johanneksen 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KOLMAS JOHANNEKSEN KIRJE 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOHANNEKSEN KIRJE 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOHANNEKSEN KIRJE 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOHANNEKSEN KIRJE 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOHANNEKSEN KIRJE 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("KOLMAS JOHANNEKSEN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOHANNEKSEN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOHANNEKSEN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOHANNEKSEN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOHANNEKSEN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (fi)", ->
		`
		expect(p.parse("Evankeliumi Johanneksen mukaan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Johanneksen evankeliumi 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Johanneksen 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Joh 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANKELIUMI JOHANNEKSEN MUKAAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHANNEKSEN EVANKELIUMI 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHANNEKSEN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOH 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (fi)", ->
		`
		expect(p.parse("Apostolien teot 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Ap. t 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Ap t 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Ap.t 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Teot 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Apt 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("APOSTOLIEN TEOT 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AP. T 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AP T 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AP.T 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("TEOT 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("APT 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (fi)", ->
		`
		expect(p.parse("Kirje roomalaisille 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Roomalaiskirje 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Roomalaisille 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Room 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE ROOMALAISILLE 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROOMALAISKIRJE 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROOMALAISILLE 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROOM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (fi)", ->
		`
		expect(p.parse("Toinen Kirje korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Kirje korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Kirje korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Kirje korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kirje korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Toinen Korinttolaiskirje 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Toinen Korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinttolaiskirje 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinttolaiskirje 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinttolaiskirje 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinttolaiskirje 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinttilaisille 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TOINEN KORINTTOLAISKIRJE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TOINEN KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTTOLAISKIRJE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTTOLAISKIRJE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTTOLAISKIRJE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTTOLAISKIRJE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTTILAISILLE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (fi)", ->
		`
		expect(p.parse("Ensimmainen Kirje korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Ensimmäinen Kirje korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Ensimmainen Korinttolaiskirje 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Ensimmäinen Korinttolaiskirje 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Ensimmainen Korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Ensimmäinen Korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Kirje korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Kirje korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kirje korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Kirje korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinttolaiskirje 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinttolaiskirje 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinttolaiskirje 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinttolaiskirje 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinttilaisille 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ENSIMMÄINEN KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ENSIMMAINEN KORINTTOLAISKIRJE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ENSIMMÄINEN KORINTTOLAISKIRJE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ENSIMMAINEN KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ENSIMMÄINEN KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KIRJE KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTTOLAISKIRJE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTTOLAISKIRJE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTTOLAISKIRJE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTTOLAISKIRJE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTTILAISILLE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (fi)", ->
		`
		expect(p.parse("Kirje galatalaisille 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatalaisille 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatalaiskirj 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE GALATALAISILLE 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATALAISILLE 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATALAISKIRJ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (fi)", ->
		`
		expect(p.parse("Kirje efesolaisille 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efesolaiskirje 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efesolaisille 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE EFESOLAISILLE 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESOLAISKIRJE 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESOLAISILLE 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (fi)", ->
		`
		expect(p.parse("Kirje filippilaisille 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Kirje filippiläisille 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippilaiskirje 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippiläiskirje 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippilaisille 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippiläisille 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE FILIPPILAISILLE 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("KIRJE FILIPPILÄISILLE 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPILAISKIRJE 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPILÄISKIRJE 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPILAISILLE 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPILÄISILLE 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (fi)", ->
		`
		expect(p.parse("Kirje kolossalaisille 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolossalaiskirje 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolossalaisille 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE KOLOSSALAISILLE 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSSALAISKIRJE 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSSALAISILLE 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (fi)", ->
		`
		expect(p.parse("Toinen Kirje tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Kirje tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Kirje tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Kirje tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Kirje tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Toinen Tessalonikalaiskirje 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Toinen Tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tessalonikalaiskirje 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tessalonikalaiskirje 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tessalonikalaiskirje 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tessalonikalaiskirje 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tessalonikalaisille 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("TOINEN TESSALONIKALAISKIRJE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("TOINEN TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESSALONIKALAISKIRJE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESSALONIKALAISKIRJE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESSALONIKALAISKIRJE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESSALONIKALAISKIRJE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESSALONIKALAISILLE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (fi)", ->
		`
		expect(p.parse("Ensimmainen Kirje tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Ensimmäinen Kirje tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Ensimmainen Tessalonikalaiskirje 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Ensimmäinen Tessalonikalaiskirje 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Ensimmainen Tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Ensimmäinen Tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Kirje tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Kirje tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Kirje tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Kirje tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tessalonikalaiskirje 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tessalonikalaiskirje 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tessalonikalaiskirje 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tessalonikalaiskirje 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tessalonikalaisille 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ENSIMMÄINEN KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ENSIMMAINEN TESSALONIKALAISKIRJE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ENSIMMÄINEN TESSALONIKALAISKIRJE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ENSIMMAINEN TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ENSIMMÄINEN TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I KIRJE TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESSALONIKALAISKIRJE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESSALONIKALAISKIRJE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESSALONIKALAISKIRJE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESSALONIKALAISKIRJE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESSALONIKALAISILLE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (fi)", ->
		`
		expect(p.parse("Toinen Kirje Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Kirje Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Kirje Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Kirje Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Kirje Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Toinen Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Toinen Timoteuskirje 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteuskirje 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteuskirje 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteuskirje 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteukselle 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteuskirje 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TOINEN TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TOINEN TIMOTEUSKIRJE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEUSKIRJE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEUSKIRJE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEUSKIRJE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEUKSELLE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEUSKIRJE 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (fi)", ->
		`
		expect(p.parse("Ensimmainen Kirje Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Ensimmäinen Kirje Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Ensimmainen Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Ensimmainen Timoteuskirje 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Ensimmäinen Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Ensimmäinen Timoteuskirje 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Kirje Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Kirje Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Kirje Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Kirje Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteuskirje 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteuskirje 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteuskirje 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteukselle 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteuskirje 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ENSIMMÄINEN KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ENSIMMAINEN TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ENSIMMAINEN TIMOTEUSKIRJE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ENSIMMÄINEN TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ENSIMMÄINEN TIMOTEUSKIRJE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I KIRJE TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEUSKIRJE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEUSKIRJE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEUSKIRJE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEUKSELLE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEUSKIRJE 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (fi)", ->
		`
		expect(p.parse("Kirje Titukselle 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titukselle 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE TITUKSELLE 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUKSELLE 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (fi)", ->
		`
		expect(p.parse("Kirje Filemonille 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemonille 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE FILEMONILLE 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMONILLE 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (fi)", ->
		`
		expect(p.parse("Kirje hebrealaisille 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Kirje heprealaisille 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heprealaiskirje 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heprealaisille 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebr 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hepr 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KIRJE HEBREALAISILLE 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("KIRJE HEPREALAISILLE 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEPREALAISKIRJE 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEPREALAISILLE 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBR 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEPR 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (fi)", ->
		`
		expect(p.parse("Jaakobin kirje 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jaakobin 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jaak 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JAAKOBIN KIRJE 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAAKOBIN 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAAK 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (fi)", ->
		`
		expect(p.parse("Toinen Pietarin kirje 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pietarin kirje 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pietarin kirje 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pietarin kirje 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pietarin kirje 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Toinen Pietarin 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pietarin 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pietarin 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pietarin 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pietarin 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Piet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TOINEN PIETARIN KIRJE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PIETARIN KIRJE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PIETARIN KIRJE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PIETARIN KIRJE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PIETARIN KIRJE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("TOINEN PIETARIN 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PIETARIN 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PIETARIN 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PIETARIN 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PIETARIN 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PIET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (fi)", ->
		`
		expect(p.parse("Ensimmainen Pietarin kirje 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Ensimmäinen Pietarin kirje 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Ensimmainen Pietarin 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Ensimmäinen Pietarin 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pietarin kirje 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pietarin kirje 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pietarin kirje 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pietarin kirje 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pietarin 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pietarin 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pietarin 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pietarin 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Piet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ENSIMMAINEN PIETARIN KIRJE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ENSIMMÄINEN PIETARIN KIRJE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ENSIMMAINEN PIETARIN 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ENSIMMÄINEN PIETARIN 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PIETARIN KIRJE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PIETARIN KIRJE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PIETARIN KIRJE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PIETARIN KIRJE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PIETARIN 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PIETARIN 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PIETARIN 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PIETARIN 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PIET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (fi)", ->
		`
		expect(p.parse("Juudaksen kirje 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Juudaksen 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Juud 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUUDAKSEN KIRJE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUUDAKSEN 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUUD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (fi)", ->
		`
		expect(p.parse("Tobiaan kirja 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobitin kirja 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobian kirja 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobiaan 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobitin 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobian 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (fi)", ->
		`
		expect(p.parse("Juditin kirja 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Juditin 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (fi)", ->
		`
		expect(p.parse("Baarukin kirja 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Barukin kirja 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Baarukin 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Barukin 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (fi)", ->
		`
		expect(p.parse("Susanna ja vanhimmat 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Susanna 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (fi)", ->
		`
		expect(p.parse("Toinen makkabilaiskirja 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. makkabilaiskirja 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. makkabilaiskirja 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II makkabilaiskirja 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 makkabilaiskirja 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 makk 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (fi)", ->
		`
		expect(p.parse("Kolmas makkabilaiskirja 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. makkabilaiskirja 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III makkabilaiskirja 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. makkabilaiskirja 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 makkabilaiskirja 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 makk 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (fi)", ->
		`
		expect(p.parse("Neljas makkabilaiskirja 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Neljäs makkabilaiskirja 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. makkabilaiskirja 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. makkabilaiskirja 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV makkabilaiskirja 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 makkabilaiskirja 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 makk 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (fi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (fi)", ->
		`
		expect(p.parse("Ensimmainen makkabilaiskirja 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Ensimmäinen makkabilaiskirja 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. makkabilaiskirja 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. makkabilaiskirja 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 makkabilaiskirja 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I makkabilaiskirja 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 makk 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (fi)", ->
		expect(p.parse("Titus 1:1 – 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1–2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 – 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (fi)", ->
		expect(p.parse("Titus 1:1, luku 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 LUKU 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, luvut 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 LUVUT 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, luvun 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 LUVUN 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (fi)", ->
		expect(p.parse("Exod 1:1 jakeet 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm JAKEET 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 jakeissa 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm JAKEISSA 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (fi)", ->
		expect(p.parse("Exod 1:1 ja 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 JA 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 vrt 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 VRT 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (fi)", ->
		expect(p.parse("Ps 3 johdannolla, 4:2, 5:johdannolla").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 JOHDANNOLLA, 4:2, 5:JOHDANNOLLA").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (fi)", ->
		expect(p.parse("Rev 3ss, 4:2ss").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 SS, 4:2 SS").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (fi)", ->
		expect(p.parse("Lev 1 (R1933)").osis_and_translations()).toEqual [["Lev.1", "R1933"]]
		expect(p.parse("lev 1 r1933").osis_and_translations()).toEqual [["Lev.1", "R1933"]]
		expect(p.parse("Lev 1 (R1992)").osis_and_translations()).toEqual [["Lev.1", "R1992"]]
		expect(p.parse("lev 1 r1992").osis_and_translations()).toEqual [["Lev.1", "R1992"]]
	it "should handle book ranges (fi)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Ensimmäinen – Kolmas  Johanneksen").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (fi)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

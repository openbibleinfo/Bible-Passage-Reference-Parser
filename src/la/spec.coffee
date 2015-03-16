bcv_parser = require("../../js/la_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (la)", ->
		`
		expect(p.parse("Liber Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (la)", ->
		`
		expect(p.parse("Liber Exodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Ex 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER EXODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EX 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (la)", ->
		`
		expect(p.parse("Histoia Beli et draconis 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel et draconis 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (la)", ->
		`
		expect(p.parse("Liber Leviticus 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Leviticus 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER LEVITICUS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVITICUS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (la)", ->
		`
		expect(p.parse("Liber Numeri 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numeri 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER NUMERI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMERI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (la)", ->
		`
		expect(p.parse("Oratio Iesu filii Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Liber Ecclesiasticus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Ecclesiasticus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Ecclus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (la)", ->
		`
		expect(p.parse("Sapientia Salomonis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Liber Sapientiae 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sapientia 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sapient 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sap 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (la)", ->
		`
		expect(p.parse("Lamentationes 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAMENTATIONES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (la)", ->
		`
		expect(p.parse("Oratio Ieremiae 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Or. Ier 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Or Ier 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (la)", ->
		`
		expect(p.parse("Apocalypsis Ioannis Apostoli 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalypsis Ioannis 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalypsis 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apoc 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Ap 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("APOCALYPSIS IOANNIS APOSTOLI 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALYPSIS IOANNIS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALYPSIS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOC 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("AP 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (la)", ->
		`
		expect(p.parse("Oratio regis Manassae 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Oratio Manassae 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Or. Man 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Or Man 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (la)", ->
		`
		expect(p.parse("Liber Deuteronomii 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronomium 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER DEUTERONOMII 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONOMIUM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (la)", ->
		`
		expect(p.parse("Liber Iosue 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Iosue 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Ios 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER IOSUE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("IOSUE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("IOS 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (la)", ->
		`
		expect(p.parse("Liber Iudicum 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Iudicum 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Iud 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER IUDICUM 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("IUDICUM 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("IUD 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (la)", ->
		`
		expect(p.parse("Liber Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ru 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RU 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (la)", ->
		`
		expect(p.parse("Liber Esdrae I 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Liber I Esdrae 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esdrae 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esdrae 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esdrae 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esdra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esdrae 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esdra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esdra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esdra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (la)", ->
		`
		expect(p.parse("Liber Esdrae II 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Liber II Esdrae 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esdrae 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esdrae 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esdrae 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esdra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esdrae 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esdra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esdra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esdra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (la)", ->
		`
		expect(p.parse("Liber Isaiae 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isaias 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER ISAIAE 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISAIAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (la)", ->
		`
		expect(p.parse("Liber II Samuelis 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Regnorum 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuelis 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Regnorum 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuelis 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Regnorum 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuelis 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Samuelis II 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Regnorum 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuelis 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER II SAMUELIS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. REGNORUM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUELIS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. REGNORUM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUELIS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II REGNORUM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUELIS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SAMUELIS II 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 REGNORUM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUELIS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (la)", ->
		`
		expect(p.parse("Liber I Samuelis 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Regnorum 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuelis 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Regnorum 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuelis 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Regnorum 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuelis 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Regnorum 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuelis 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Samuelis I 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER I SAMUELIS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. REGNORUM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUELIS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. REGNORUM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUELIS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 REGNORUM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUELIS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I REGNORUM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUELIS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("SAMUELIS I 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (la)", ->
		`
		expect(p.parse("Liber II Regum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Regnorum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Regnorum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Regnorum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Regnorum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Regum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Regum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Regum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Regum II 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Regum 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Reg 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Reg 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Reg 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Reg 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER II REGUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. REGNORUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. REGNORUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV REGNORUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 REGNORUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. REGUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. REGUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II REGUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("REGUM II 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REGUM 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. REG 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. REG 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II REG 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REG 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (la)", ->
		`
		expect(p.parse("III. Regnorum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Liber I Regum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Regnorum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Regnorum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Regnorum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Regum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Regum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Regum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Regum 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Regum I 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Reg 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Reg 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Reg 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Reg 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("III. REGNORUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("LIBER I REGUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III REGNORUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. REGNORUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 REGNORUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. REGUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. REGUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REGUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I REGUM 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("REGUM I 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. REG 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. REG 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REG 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I REG 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (la)", ->
		`
		expect(p.parse("Liber II Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Paralipomenon II 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Par 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Par 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Par 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Par 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER II PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("PARALIPOMENON II 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. PAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. PAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II PAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 PAR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (la)", ->
		`
		expect(p.parse("Liber I Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Paralipomenon I 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Par 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Par 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Par 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Par 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER I PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PARALIPOMENON I 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. PAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. PAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 PAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I PAR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (la)", ->
		`
		expect(p.parse("Liber Esdrae 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esdrae 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esdra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esdr 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esd 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER ESDRAE 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESDRAE 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESDRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESDR 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESD 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (la)", ->
		`
		expect(p.parse("Liber Nehemiae 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemiae 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER NEHEMIAE 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIAE 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (la)", ->
		`
		expect(p.parse("Esther graeca 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Graeca Esther 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (la)", ->
		`
		expect(p.parse("Liber Esther 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esther 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER ESTHER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTHER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (la)", ->
		`
		expect(p.parse("Liber Iob 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Iob 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER IOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("IOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (la)", ->
		`
		expect(p.parse("Liber Psalmorum 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalmus 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalmi 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psa 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER PSALMORUM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALMUS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALMI 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSA 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (la)", ->
		`
		expect(p.parse("Oratio Azariae 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Or. Azar 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Or Azar 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (la)", ->
		`
		expect(p.parse("Liber Proverbiorum 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Proverbia 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pro 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER PROVERBIORUM 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROVERBIA 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRO 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (la)", ->
		`
		expect(p.parse("Liber Ecclesiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Liber Qoelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ec 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Qo 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER ECCLESIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("LIBER QOELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("EC 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("QO 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (la)", ->
		`
		expect(p.parse("Hymnus trium puerorum 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (la)", ->
		`
		expect(p.parse("Canticum Canticorum 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cant. Cantic 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cant Cantic 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Can 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CANTICUM CANTICORUM 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANT. CANTIC 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANT CANTIC 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CAN 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (la)", ->
		`
		expect(p.parse("Liber Ieremiae 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Ieremias 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Ier 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIBER IEREMIAE 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("IEREMIAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("IER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (la)", ->
		`
		expect(p.parse("Prophetia Ezechielis 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezechiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eze 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA EZECHIELIS 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZECHIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZE 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (la)", ->
		`
		expect(p.parse("Prophetia Danielis 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA DANIELIS 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (la)", ->
		`
		expect(p.parse("Prophetia Osee 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Osee 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Os 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA OSEE 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OSEE 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (la)", ->
		`
		expect(p.parse("Prophetia Ioel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Ioel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA IOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("IOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (la)", ->
		`
		expect(p.parse("Prophetia Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (la)", ->
		`
		expect(p.parse("Prophetia Abdiae 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abd 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA ABDIAE 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (la)", ->
		`
		expect(p.parse("Prophetia Ionae 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Ionas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Iona 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA IONAE 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("IONAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("IONA 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (la)", ->
		`
		expect(p.parse("Prophetia Michaeae 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Michaeas 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA MICHAEAE 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICHAEAS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (la)", ->
		`
		expect(p.parse("Prophetia Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (la)", ->
		`
		expect(p.parse("Prophetia Habacuc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habacuc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA HABACUC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABACUC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (la)", ->
		`
		expect(p.parse("Prophetia Sophoniae 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sophonias 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Soph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA SOPHONIAE 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOPHONIAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (la)", ->
		`
		expect(p.parse("Prophetia Aggaei 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Aggaeus 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA AGGAEI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AGGAEUS 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (la)", ->
		`
		expect(p.parse("Prophetia Zachariae 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zacharias 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zac 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA ZACHARIAE 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACHARIAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZAC 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (la)", ->
		`
		expect(p.parse("Prophetia Malachiae 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malachias 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROPHETIA MALACHIAE 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALACHIAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (la)", ->
		`
		expect(p.parse("Evangelium secundum Matthaeum 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matthaeus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIUM SECUNDUM MATTHAEUM 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTHAEUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (la)", ->
		`
		expect(p.parse("Evangelium secundum Marcum 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marcus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mc 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIUM SECUNDUM MARCUM 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARCUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MC 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (la)", ->
		`
		expect(p.parse("Evangelium secundum Lucam 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lu 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIUM SECUNDUM LUCAM 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LU 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (la)", ->
		`
		expect(p.parse("Epistula I Ioannis 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Epistula Ioannis I 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Ioannis 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Ioannis 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Ioannis 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Ioannis 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Ioannis I 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. In 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. In 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 In 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I In 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA I IOANNIS 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("EPISTULA IOANNIS I 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. IOANNIS 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. IOANNIS 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 IOANNIS 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I IOANNIS 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("IOANNIS I 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. IN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. IN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 IN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I IN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (la)", ->
		`
		expect(p.parse("Epistula II Ioannis 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Epistula Ioannis II 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Ioannis 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Ioannis 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Ioannis 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Ioannis II 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Ioannis 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. In 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. In 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II In 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 In 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA II IOANNIS 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("EPISTULA IOANNIS II 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. IOANNIS 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. IOANNIS 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II IOANNIS 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("IOANNIS II 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 IOANNIS 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. IN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. IN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II IN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 IN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (la)", ->
		`
		expect(p.parse("Epistula III Ioannis 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Epistula Ioannis III 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Ioannis 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Ioannis 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Ioannis III 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Ioannis 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Ioannis 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. In 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III In 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. In 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 In 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA III IOANNIS 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("EPISTULA IOANNIS III 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. IOANNIS 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III IOANNIS 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("IOANNIS III 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. IOANNIS 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 IOANNIS 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. IN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III IN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. IN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 IN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (la)", ->
		`
		expect(p.parse("Evangelium secundum Ioannem 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Ioannes 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Ioan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("In 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIUM SECUNDUM IOANNEM 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("IOANNES 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("IOAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("IN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (la)", ->
		`
		expect(p.parse("Actus Apostolorum 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Actus 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ACTUS APOSTOLORUM 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTUS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (la)", ->
		`
		expect(p.parse("Epistula ad Romanos 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ad Romanos 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Romanos 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD ROMANOS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("AD ROMANOS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMANOS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (la)", ->
		`
		expect(p.parse("Epistula II ad Corinthios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Epistula ad Corinthios II 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ad Corinthios II 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corinthios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinthios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Corinthios II 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corinthios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinthios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA II AD CORINTHIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("EPISTULA AD CORINTHIOS II 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("AD CORINTHIOS II 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTHIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTHIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("CORINTHIOS II 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTHIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTHIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (la)", ->
		`
		expect(p.parse("Epistula I ad Corinthios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Epistula ad Corinthios I 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ad Corinthios I 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinthios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corinthios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinthios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Corinthios I 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corinthios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA I AD CORINTHIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EPISTULA AD CORINTHIOS I 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("AD CORINTHIOS I 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTHIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTHIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTHIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("CORINTHIOS I 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTHIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (la)", ->
		`
		expect(p.parse("Epistula ad Galatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ad Galatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD GALATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("AD GALATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (la)", ->
		`
		expect(p.parse("Epistula ad Ephesios 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ad Ephesios 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ephesios 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD EPHESIOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("AD EPHESIOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPHESIOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (la)", ->
		`
		expect(p.parse("Epistula ad Philippenses 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ad Philippenses 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Philippenses 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD PHILIPPENSES 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("AD PHILIPPENSES 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHILIPPENSES 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (la)", ->
		`
		expect(p.parse("Epistula ad Colossenses 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ad Colossenses 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Colossenses 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD COLOSSENSES 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("AD COLOSSENSES 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COLOSSENSES 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (la)", ->
		`
		expect(p.parse("Epistula II ad Thessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Epistula ad Thessalonicenses II 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ad Thessalonicenses II 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Thessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Thessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Thessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Thessalonicenses II 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Th 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Th 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Th 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Th 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA II AD THESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("EPISTULA AD THESSALONICENSES II 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("AD THESSALONICENSES II 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. THESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. THESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II THESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("THESSALONICENSES II 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TH 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TH 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TH 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TH 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (la)", ->
		`
		expect(p.parse("Epistula I ad Thessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Epistula ad Thessalonicenses I 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ad Thessalonicenses I 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Thessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Thessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Thessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Thessalonicenses I 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Th 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Th 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Th 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Th 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA I AD THESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("EPISTULA AD THESSALONICENSES I 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("AD THESSALONICENSES I 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. THESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. THESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I THESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("THESSALONICENSES I 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TH 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TH 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TH 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TH 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (la)", ->
		`
		expect(p.parse("Epistula II ad Timotheum 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Epistula ad Timotheum II 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ad Timotheum II 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timotheum 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timotheum 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timotheum 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Timotheum II 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timotheum 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Ti 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tm 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Ti 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tm 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Ti 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tm 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Ti 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tm 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA II AD TIMOTHEUM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("EPISTULA AD TIMOTHEUM II 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("AD TIMOTHEUM II 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTHEUM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTHEUM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTHEUM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TIMOTHEUM II 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTHEUM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (la)", ->
		`
		expect(p.parse("Epistula I ad Timotheum 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Epistula ad Timotheum I 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ad Timotheum I 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timotheum 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timotheum 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timotheum 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timotheum 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Timotheum I 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Ti 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tm 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Ti 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tm 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Ti 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tm 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Ti 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tm 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA I AD TIMOTHEUM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("EPISTULA AD TIMOTHEUM I 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("AD TIMOTHEUM I 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTHEUM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTHEUM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTHEUM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTHEUM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("TIMOTHEUM I 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (la)", ->
		`
		expect(p.parse("Epistula ad Titum 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ad Titum 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titum 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD TITUM 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("AD TITUM 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUM 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (la)", ->
		`
		expect(p.parse("Epistulam ad Philemonem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Epistula ad Philemonem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ad Philemonem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Philemonem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phmn 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULAM AD PHILEMONEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("EPISTULA AD PHILEMONEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("AD PHILEMONEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHILEMONEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHMN 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (la)", ->
		`
		expect(p.parse("Epistula ad Hebraeos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ad Hebraeos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebraeos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebr 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA AD HEBRAEOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("AD HEBRAEOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRAEOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBR 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (la)", ->
		`
		expect(p.parse("Epistula Iacobi 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Iacobi 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA IACOBI 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("IACOBI 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (la)", ->
		`
		expect(p.parse("Epistula II Petri 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Epistula Petri II 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Petri 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petri 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petri 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Petri II 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petri 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA II PETRI 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("EPISTULA PETRI II 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PETRI 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETRI 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETRI 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("PETRI II 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETRI 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (la)", ->
		`
		expect(p.parse("Epistula I Petri 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Epistula Petri I 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Petri 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petri 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petri 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petri 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Petri I 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA I PETRI 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("EPISTULA PETRI I 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PETRI 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETRI 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETRI 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETRI 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PETRI I 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (la)", ->
		`
		expect(p.parse("Epistula Iudae 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Iudae 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EPISTULA IUDAE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("IUDAE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (la)", ->
		`
		expect(p.parse("Liber Thobis 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Liber Tobiae 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobiae 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobias 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tho 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (la)", ->
		`
		expect(p.parse("Liber Iudith 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Iudith 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Idt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (la)", ->
		`
		expect(p.parse("Liber Baruch 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Baruch 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (la)", ->
		`
		expect(p.parse("Historia Susannae 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Susannae 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Susanna 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (la)", ->
		`
		expect(p.parse("Liber II Maccabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Liber Maccabaeorum II 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Machabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Machabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Machabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Machabaeorum II 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Machabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabaeorum 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Mac 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Mac 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Mac 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mac 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (la)", ->
		`
		expect(p.parse("Liber III Maccabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Liber Maccabaeorum III 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Machabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Machabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Machabaeorum III 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Machabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Machabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabaeorum 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Mac 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Mac 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Mac 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mac 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (la)", ->
		`
		expect(p.parse("Liber IV Maccabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Liber Maccabaeorum IV 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Machabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Machabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Machabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Machabaeorum IV 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Machabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabaeorum 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Mac 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Mac 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Mac 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mac 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (la)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (la)", ->
		`
		expect(p.parse("Liber I Maccabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Liber Maccabaeorum I 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Machabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Machabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Machabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Machabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Machabaeorum I 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabaeorum 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Mac 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Mac 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mac 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Mac 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (la)", ->
		expect(p.parse("Titus 1:1 ad 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1ad2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 AD 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (la)", ->
		expect(p.parse("Titus 1:1, caput 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPUT 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, cap. 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAP. 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, cap 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAP 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (la)", ->
		expect(p.parse("Exod 1:1 versus 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSUS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vers. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERS. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vers 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 ver. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VER. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 ver 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VER 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 v. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm V. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 v 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm V 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (la)", ->
		expect(p.parse("Exod 1:1 et 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ET 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (la)", ->
		expect(p.parse("Ps 3 titulus, 4:2, 5:titulus").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITULUS, 4:2, 5:TITULUS").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (la)", ->
		expect(p.parse("Rev 3et sequentes, 4:2et sequentes").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 ET SEQUENTES, 4:2 ET SEQUENTES").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("Rev 3et seq., 4:2et seq.").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 ET SEQ., 4:2 ET SEQ.").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("Rev 3et seq, 4:2et seq").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 ET SEQ, 4:2 ET SEQ").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (la)", ->
		expect(p.parse("Lev 1 (VULG)").osis_and_translations()).toEqual [["Lev.1", "VULG"]]
		expect(p.parse("lev 1 vulg").osis_and_translations()).toEqual [["Lev.1", "VULG"]]
		expect(p.parse("Lev 1 (VG)").osis_and_translations()).toEqual [["Lev.1", "VG"]]
		expect(p.parse("lev 1 vg").osis_and_translations()).toEqual [["Lev.1", "VG"]]
	it "should handle book ranges (la)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("I ad III  Ioannis").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (la)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

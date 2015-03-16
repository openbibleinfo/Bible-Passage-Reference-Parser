bcv_parser = require("../../js/hi_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (hi)", ->
		`
		expect(p.parse("उत्पत्ति 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Utpaati 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("उत्पाति 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("उत्पत्ति 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("UTPAATI 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("उत्पाति 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (hi)", ->
		`
		expect(p.parse("Nirgaman 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("निर्गमन 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NIRGAMAN 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("निर्गमन 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (hi)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (hi)", ->
		`
		expect(p.parse("Laaivyavyavastha 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्य्व्य्वस्था 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्यव्यवस्था 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्यव्यवस्थ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्यवस्था 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्य 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAAIVYAVYAVASTHA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्य्व्य्वस्था 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्यव्यवस्था 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्यव्यवस्थ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्यवस्था 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("लैव्य 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (hi)", ->
		`
		expect(p.parse("Ginatee 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("गिनती 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GINATEE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("गिनती 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (hi)", ->
		`
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (hi)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (hi)", ->
		`
		expect(p.parse("Vilapageet 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("विलापगीत 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("विलापगेत 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("विलाप 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VILAPAGEET 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("विलापगीत 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("विलापगेत 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("विलाप 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (hi)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (hi)", ->
		`
		expect(p.parse("Prakashaitavakya 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्रकाशित-वाक्‍य 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्रकाशित वाक्य 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्रकाशितवाक्य 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्र. व 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्र व 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRAKASHAITAVAKYA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्रकाशित-वाक्‍य 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्रकाशित वाक्य 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्रकाशितवाक्य 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्र. व 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("प्र व 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (hi)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (hi)", ->
		`
		expect(p.parse("Vyavasthaavivaran 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्यवस्था विवरण 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्य्वस्थाविवरन 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्यवस्थाविवरण 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्यवस्था 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VYAVASTHAAVIVARAN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्यवस्था विवरण 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्य्वस्थाविवरन 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्यवस्थाविवरण 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("व्यवस्था 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (hi)", ->
		`
		expect(p.parse("Yahoshoo 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("यहोशु 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("यहोशू 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YAHOSHOO 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("यहोशु 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("यहोशू 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (hi)", ->
		`
		expect(p.parse("न्यायिय का विर्तान्त 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("न्यायियों 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Nyayiyon 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("न्यायिय का विर्तान्त 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("न्यायियों 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("NYAYIYON 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (hi)", ->
		`
		expect(p.parse("Root 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("रुत 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("रूत 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROOT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("रुत 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("रूत 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (hi)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (hi)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (hi)", ->
		`
		expect(p.parse("yashaayaah 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("यशायाह 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("यशाया 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("यशा 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YASHAAYAAH 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("यशायाह 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("यशाया 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("यशा 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (hi)", ->
		`
		expect(p.parse("शमुऐयल की 2री पुस्तक 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("शमुऐयल की २री पुस्तक 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Shamooael 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Shamooael 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. शमूएल 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 शमूएल 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. शमू 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 शमू 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
	it "should handle non-Latin digits in book: 2Sam (hi)", ->
		p.set_options non_latin_digits_strategy: "replace"
		`
		expect(p.parse("शमुऐयल की 2री पुस्तक 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("शमुऐयल की २री पुस्तक 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Shamooael 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Shamooael 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. शमूएल 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 शमूएल 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. शमू 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 शमू 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("शमुऐयल की 2री पुस्तक 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("शमुऐयल की २री पुस्तक 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SHAMOOAEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SHAMOOAEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. शमूएल 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 शमूएल 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. शमू 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 शमू 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (hi)", ->
		`
		expect(p.parse("शमुऐल की 1ली पुस्तक 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("शमुऐल की १ली पुस्तक 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Shamooael 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Shamooael 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. शमूएल 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 शमूएल 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. शमू 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 शमू 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
	it "should handle non-Latin digits in book: 1Sam (hi)", ->
		p.set_options non_latin_digits_strategy: "replace"
		`
		expect(p.parse("शमुऐल की 1ली पुस्तक 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("शमुऐल की १ली पुस्तक 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Shamooael 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Shamooael 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. शमूएल 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 शमूएल 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. शमू 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 शमू 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("शमुऐल की 1ली पुस्तक 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("शमुऐल की १ली पुस्तक 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SHAMOOAEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SHAMOOAEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. शमूएल 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 शमूएल 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. शमू 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 शमू 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (hi)", ->
		`
		expect(p.parse("राजाओ का विर्तान्त 2रा भाग 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("राजाओ का विर्तान्त २रा भाग 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. राजाओं 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 राजाओं 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. राजा 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 राजा 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
	it "should handle non-Latin digits in book: 2Kgs (hi)", ->
		p.set_options non_latin_digits_strategy: "replace"
		`
		expect(p.parse("राजाओ का विर्तान्त 2रा भाग 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("राजाओ का विर्तान्त २रा भाग 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. राजाओं 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 राजाओं 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. राजा 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Raja 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 राजा 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("राजाओ का विर्तान्त 2रा भाग 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("राजाओ का विर्तान्त २रा भाग 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. राजाओं 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 राजाओं 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. RAJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. राजा 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RAJA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 राजा 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (hi)", ->
		`
		expect(p.parse("राजाओ का विर्तान्त 1ला भाग् 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("राजाओ का विर्तान्त १ला भाग् 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. राजाओं 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 राजाओं 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. राजा 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 राजा 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
	it "should handle non-Latin digits in book: 1Kgs (hi)", ->
		p.set_options non_latin_digits_strategy: "replace"
		`
		expect(p.parse("राजाओ का विर्तान्त 1ला भाग् 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("राजाओ का विर्तान्त १ला भाग् 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. राजाओं 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 राजाओं 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. राजा 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Raja 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 राजा 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("राजाओ का विर्तान्त 1ला भाग् 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("राजाओ का विर्तान्त १ला भाग् 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. राजाओं 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 राजाओं 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. RAJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. राजा 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RAJA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 राजा 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (hi)", ->
		`
		expect(p.parse("इतिहास 2रा भाग 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("इतिहास २रा भाग 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Itihas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. इतिहास 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Itihas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 इतिहास 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. इति 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 इति 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
	it "should handle non-Latin digits in book: 2Chr (hi)", ->
		p.set_options non_latin_digits_strategy: "replace"
		`
		expect(p.parse("इतिहास 2रा भाग 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("इतिहास २रा भाग 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Itihas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. इतिहास 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Itihas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 इतिहास 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. इति 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 इति 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("इतिहास 2रा भाग 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("इतिहास २रा भाग 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ITIHAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. इतिहास 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ITIHAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 इतिहास 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. इति 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 इति 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (hi)", ->
		`
		expect(p.parse("इतिहास 1ला भाग 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("इतिहास १ला भाग 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Itihas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. इतिहास 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Itihas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 इतिहास 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. इति 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 इति 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
	it "should handle non-Latin digits in book: 1Chr (hi)", ->
		p.set_options non_latin_digits_strategy: "replace"
		`
		expect(p.parse("इतिहास 1ला भाग 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("इतिहास १ला भाग 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Itihas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. इतिहास 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Itihas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 इतिहास 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. इति 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 इति 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("इतिहास 1ला भाग 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("इतिहास १ला भाग 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ITIHAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. इतिहास 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ITIHAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 इतिहास 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. इति 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 इति 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (hi)", ->
		`
		expect(p.parse("Aejra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("एज्रा 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AEJRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("एज्रा 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (hi)", ->
		`
		expect(p.parse("न्हेम्याह 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nahemyah 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("नहेमायाह 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("नहेम्याह 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("नहेमा 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("न्हेम्याह 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NAHEMYAH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("नहेमायाह 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("नहेम्याह 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("नहेमा 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (hi)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (hi)", ->
		`
		expect(p.parse("Aester 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("एस्तेर 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ऐस्तेर 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AESTER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("एस्तेर 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ऐस्तेर 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (hi)", ->
		`
		expect(p.parse("Ayyoob 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("अय्यूब 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("अययुब 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AYYOOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("अय्यूब 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("अययुब 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (hi)", ->
		`
		expect(p.parse("भजन-सहिन्ता 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("भजन संहिता 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Bhjan 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("भजन 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("भजन-सहिन्ता 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("भजन संहिता 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("BHJAN 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("भजन 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (hi)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (hi)", ->
		`
		expect(p.parse("Neetivachan 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीति वचन 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीतिबचन 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीतिवचन 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीति 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEETIVACHAN 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीति वचन 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीतिबचन 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीतिवचन 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("नीति 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (hi)", ->
		`
		expect(p.parse("Sabhopadeshak 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("सभोपदेशक 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("सभो 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SABHOPADESHAK 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("सभोपदेशक 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("सभो 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (hi)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (hi)", ->
		`
		expect(p.parse("Reshthageet 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("स्रेस्ट गीत 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("श्रेष्ठगीत 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("श्रेष्ठ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RESHTHAGEET 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("स्रेस्ट गीत 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("श्रेष्ठगीत 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("श्रेष्ठ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (hi)", ->
		`
		expect(p.parse("Yirmayah 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("यिर्मयाह 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("यिर्म 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YIRMAYAH 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("यिर्मयाह 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("यिर्म 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (hi)", ->
		`
		expect(p.parse("Yahejakel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("यहेजकेल 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("यहेज 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YAHEJAKEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("यहेजकेल 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("यहेज 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (hi)", ->
		`
		expect(p.parse("Daaniyyel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("दानिय्येल 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("दानिय्यल 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("दानि 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DAANIYYEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("दानिय्येल 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("दानिय्यल 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("दानि 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (hi)", ->
		`
		expect(p.parse("Hosho 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("होशे 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOSHO 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("होशे 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (hi)", ->
		`
		expect(p.parse("Yoael 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("योएल 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YOAEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("योएल 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (hi)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("आमोस 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("आमोस 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (hi)", ->
		`
		expect(p.parse("Obadhah 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबद्दाह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबद्याह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबेधाह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबधाह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओब 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADHAH 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबद्दाह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबद्याह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबेधाह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओबधाह 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ओब 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (hi)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Yona 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("योना 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("YONA 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("योना 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (hi)", ->
		`
		expect(p.parse("Meeka 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("मीका 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MEEKA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("मीका 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (hi)", ->
		`
		expect(p.parse("Nahoom 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("नहूम 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHOOM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("नहूम 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (hi)", ->
		`
		expect(p.parse("Habakkook 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("हबक्कूक 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("हबक 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKKOOK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("हबक्कूक 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("हबक 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (hi)", ->
		`
		expect(p.parse("Sapanyah 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("सपन्याह 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("सपन 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAPANYAH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("सपन्याह 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("सपन 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (hi)", ->
		`
		expect(p.parse("Haggaai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("हाग्गे 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("हाग्गै 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGGAAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("हाग्गे 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("हाग्गै 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (hi)", ->
		`
		expect(p.parse("Jakaryah 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("जकयार्ह 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("जकर्याह 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JAKARYAH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("जकयार्ह 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("जकर्याह 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (hi)", ->
		`
		expect(p.parse("Malakee 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("मलाकी 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAKEE 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("मलाकी 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (hi)", ->
		`
		expect(p.parse("Mattee 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("मत्ती 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MATTEE 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("मत्ती 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (hi)", ->
		`
		expect(p.parse("Marakus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("मरकुस 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MARAKUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("मरकुस 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (hi)", ->
		`
		expect(p.parse("Looka 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("लूका 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LOOKA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("लूका 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (hi)", ->
		`
		expect(p.parse("1. Yoohanna 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Yoohanna 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. युहत्रा 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. यूहन्ना 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 युहत्रा 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 यूहन्ना 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. YOOHANNA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 YOOHANNA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. युहत्रा 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. यूहन्ना 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 युहत्रा 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 यूहन्ना 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (hi)", ->
		`
		expect(p.parse("2. Yoohanna 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Yoohanna 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. युहत्रा 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. यूहन्ना 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 युहत्रा 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 यूहन्ना 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. YOOHANNA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 YOOHANNA 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. युहत्रा 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. यूहन्ना 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 युहत्रा 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 यूहन्ना 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (hi)", ->
		`
		expect(p.parse("3. Yoohanna 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Yoohanna 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. युहत्रा 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. यूहन्ना 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 युहत्रा 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 यूहन्ना 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("3. YOOHANNA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 YOOHANNA 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. युहत्रा 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. यूहन्ना 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 युहत्रा 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 यूहन्ना 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (hi)", ->
		`
		expect(p.parse("Yuhanna 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("युहत्रा 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("यूहन्ना 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YUHANNA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("युहत्रा 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("यूहन्ना 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (hi)", ->
		`
		expect(p.parse("प्रेरितों के कामों 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Praeriton Ke Kam 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्रेरितों के काम 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("मसीह-दूत 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्र. क 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्र क 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्र.क 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्रक 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("प्रेरितों के कामों 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("PRAERITON KE KAM 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्रेरितों के काम 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("मसीह-दूत 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्र. क 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्र क 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्र.क 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("प्रक 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (hi)", ->
		`
		expect(p.parse("Romiyon 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("रोमियों 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("रोमियो 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("रोमी 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROMIYON 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("रोमियों 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("रोमियो 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("रोमी 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (hi)", ->
		`
		expect(p.parse("2. Kurinthiayon 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्यि़यों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kurinthiayon 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्यि़यों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्थियो 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्थियो 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कोरिन्‍थी 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कोरिन्‍थी 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्थ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्थ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. KURINTHIAYON 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्यि़यों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KURINTHIAYON 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्यि़यों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्थियो 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरन्थियों 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्थियो 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कोरिन्‍थी 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कोरिन्‍थी 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. कुरिन्थ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 कुरिन्थ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (hi)", ->
		`
		expect(p.parse("1. Kurinthiayon 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्यि़यों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kurinthiayon 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्यि़यों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्थियो 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्थियो 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कोरिन्‍थी 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कोरिन्‍थी 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्थ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्थ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. KURINTHIAYON 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्यि़यों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KURINTHIAYON 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्यि़यों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्थियो 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरन्थियों 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्थियो 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कोरिन्‍थी 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कोरिन्‍थी 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. कुरिन्थ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 कुरिन्थ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (hi)", ->
		`
		expect(p.parse("Galatiyon 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलातियों 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलतियों 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलाति 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलाती 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALATIYON 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलातियों 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलतियों 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलाति 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("गलाती 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (hi)", ->
		`
		expect(p.parse("Iafisiyon 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("इफिसियों 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("इफिसि 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("इफिसी 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("IAFISIYON 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("इफिसियों 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("इफिसि 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("इफिसी 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (hi)", ->
		`
		expect(p.parse("Filippaiyon 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("फिलिप्पियों 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("फिलिप्‍पी 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("फिलिप्पि 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILIPPAIYON 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("फिलिप्पियों 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("फिलिप्‍पी 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("फिलिप्पि 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (hi)", ->
		`
		expect(p.parse("Kulussaiyon 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("कुलुस्सियों 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("कुलुस्‍सी 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("कुलुस्सि 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KULUSSAIYON 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("कुलुस्सियों 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("कुलुस्‍सी 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("कुलुस्सि 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (hi)", ->
		`
		expect(p.parse("2. Thaissaluneekiyon 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thaissaluneekiyon 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. थिस्सलुनीकियों 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 थिस्सलुनीकियों 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. थिसलुनिकी 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 थिसलुनिकी 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. थिस्स 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 थिस्स 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. THAISSALUNEEKIYON 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THAISSALUNEEKIYON 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. थिस्सलुनीकियों 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 थिस्सलुनीकियों 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. थिसलुनिकी 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 थिसलुनिकी 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. थिस्स 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 थिस्स 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (hi)", ->
		`
		expect(p.parse("1. Thaissaluneekiyon 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thaissaluneekiyon 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. थिस्सलुनीकियों 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 थिस्सलुनीकियों 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. थिसलुनिकी 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 थिसलुनिकी 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. थिस्स 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 थिस्स 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. THAISSALUNEEKIYON 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THAISSALUNEEKIYON 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. थिस्सलुनीकियों 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 थिस्सलुनीकियों 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. थिसलुनिकी 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 थिसलुनिकी 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. थिस्स 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 थिस्स 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (hi)", ->
		`
		expect(p.parse("2. Teemuathaiyus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Teemuathaiyus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तीमुाथैयुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तीमुाथैयुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तिमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तीमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तिमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तीमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तीम 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तीम 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. TEEMUATHAIYUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TEEMUATHAIYUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तीमुाथैयुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तीमुाथैयुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तिमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तीमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तिमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तीमुथियुस 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. तीम 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 तीम 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (hi)", ->
		`
		expect(p.parse("1. Teemuathaiyus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Teemuathaiyus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तीमुाथैयुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तीमुाथैयुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तिमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तीमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तिमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तीमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तीम 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तीम 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. TEEMUATHAIYUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TEEMUATHAIYUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तीमुाथैयुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तीमुाथैयुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तिमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तीमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तिमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तीमुथियुस 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. तीम 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 तीम 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (hi)", ->
		`
		expect(p.parse("Teetus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("तीतुस 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TEETUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("तीतुस 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (hi)", ->
		`
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("फिलेमोन 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("फले 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("फिलेमोन 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("फले 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (hi)", ->
		`
		expect(p.parse("Ibraaaniyon 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("इब्रानियों 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("इब्रानि 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("इब्रानी 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("IBRAAANIYON 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("इब्रानियों 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("इब्रानि 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("इब्रानी 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (hi)", ->
		`
		expect(p.parse("Yakoob 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("याकूब 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YAKOOB 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("याकूब 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (hi)", ->
		`
		expect(p.parse("2. Pataras 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pataras 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. पत्रुस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 पत्रुस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. पतरस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 पतरस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. पतर 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 पतर 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("2. PATARAS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PATARAS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. पत्रुस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 पत्रुस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. पतरस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 पतरस 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. पतर 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 पतर 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (hi)", ->
		`
		expect(p.parse("1. Pataras 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pataras 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. पत्रुस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 पत्रुस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. पतरस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 पतरस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. पतर 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 पतर 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. PATARAS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PATARAS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. पत्रुस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 पत्रुस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. पतरस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 पतरस 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. पतर 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 पतर 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (hi)", ->
		`
		expect(p.parse("Yahooda 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("यहूदा 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YAHOODA 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("यहूदा 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (hi)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (hi)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (hi)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (hi)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (hi)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (hi)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (hi)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (hi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (hi)", ->
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

	it "should handle ranges (hi)", ->
		expect(p.parse("Titus 1:1 to 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1to2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 TO 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (hi)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (hi)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (hi)", ->
		expect(p.parse("Exod 1:1 and 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 AND 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (hi)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (hi)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (hi)", ->
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
	it "should handle book ranges (hi)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("1 to 3  Yoohanna").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (hi)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

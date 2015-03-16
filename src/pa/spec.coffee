bcv_parser = require("../../js/pa_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (pa)", ->
		`
		expect(p.parse("utpat 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ਉਤਪਤ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("UTPAT 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ਉਤਪਤ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (pa)", ->
		`
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("kūč 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ਕੂਚ 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("KŪČ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ਕੂਚ 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (pa)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (pa)", ->
		`
		expect(p.parse("levīāṃ dī potʰī 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ਲੇਵੀਆਂ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("levīāṃ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ਲੇਵੀਆਂ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LEVĪĀṂ DĪ POTʰĪ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ਲੇਵੀਆਂ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVĪĀṂ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ਲੇਵੀਆਂ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (pa)", ->
		`
		expect(p.parse("giṇtī 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ਗਿਣਤੀ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIṆTĪ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ਗਿਣਤੀ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (pa)", ->
		`
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (pa)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (pa)", ->
		`
		expect(p.parse("virlāp 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ਵਿਰਲਾਪ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VIRLĀP 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ਵਿਰਲਾਪ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (pa)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (pa)", ->
		`
		expect(p.parse("yūhãnā de prakāš dī potʰī 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੇ ਪਰਕਾਸ਼ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("yūhãnā de prakāš 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ਪਰਕਾਸ਼ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YŪHÃNĀ DE PRAKĀŠ DĪ POTʰĪ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੇ ਪਰਕਾਸ਼ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("YŪHÃNĀ DE PRAKĀŠ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ਪਰਕਾਸ਼ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (pa)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (pa)", ->
		`
		expect(p.parse("bivastʰā sār 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ਬਿਵਸਥਾ ਸਾਰ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ਬਿਵਸਥਾ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BIVASTʰĀ SĀR 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ਬਿਵਸਥਾ ਸਾਰ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ਬਿਵਸਥਾ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (pa)", ->
		`
		expect(p.parse("yahošuā 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ਯਹੋਸ਼ੁਆ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YAHOŠUĀ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ਯਹੋਸ਼ੁਆ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (pa)", ->
		`
		expect(p.parse("niāīāṃ dī potʰī 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("ਨਿਆਂਈਆਂ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("ਨਿਆਈਆਂ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("niāīāṃ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NIĀĪĀṂ DĪ POTʰĪ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("ਨਿਆਂਈਆਂ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("ਨਿਆਈਆਂ ਦੀ ਪੋਥੀ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("NIĀĪĀṂ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (pa)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("rūtʰ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("ਰੂਥ 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RŪTʰ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("ਰੂਥ 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (pa)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (pa)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (pa)", ->
		`
		expect(p.parse("yasāyāh 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ਯਾਸਾਯਾਹ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ਯਸਾਯਾਹ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ਯਸਾ 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YASĀYĀH 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ਯਾਸਾਯਾਹ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ਯਸਾਯਾਹ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ਯਸਾ 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (pa)", ->
		`
		expect(p.parse("samūel dī dūjī potʰī 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ਸਮੂਏਲ ਦੀ ਦੂਜੀ ਪੋਥੀ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 samūel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ਸਮੂਏਲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAMŪEL DĪ DŪJĪ POTʰĪ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ਸਮੂਏਲ ਦੀ ਦੂਜੀ ਪੋਥੀ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMŪEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ਸਮੂਏਲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (pa)", ->
		`
		expect(p.parse("samūel dī pahilī potʰī 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ਸਮੂਏਲ ਦੀ ਪਹਿਲੀ ਪੋਥੀ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 samūel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ਸਮੂਏਲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAMŪEL DĪ PAHILĪ POTʰĪ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ਸਮੂਏਲ ਦੀ ਪਹਿਲੀ ਪੋਥੀ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMŪEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ਸਮੂਏਲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (pa)", ->
		`
		expect(p.parse("rājiāṃ dī dūjī potʰī 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ਰਾਜਿਆਂ ਦੀ ਦੂਜੀ ਪੋਥੀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 rājiāṃ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ਰਾਜਿਆਂ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RĀJIĀṂ DĪ DŪJĪ POTʰĪ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ਰਾਜਿਆਂ ਦੀ ਦੂਜੀ ਪੋਥੀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RĀJIĀṂ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ਰਾਜਿਆਂ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (pa)", ->
		`
		expect(p.parse("rājiāṃ dī pahilī potʰī 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ਰਾਜਿਆਂ ਦੀ ਪਹਿਲੀ ਪੋਥੀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 rājiāṃ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ਰਾਜਿਆਂ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RĀJIĀṂ DĪ PAHILĪ POTʰĪ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ਰਾਜਿਆਂ ਦੀ ਪਹਿਲੀ ਪੋਥੀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RĀJIĀṂ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ਰਾਜਿਆਂ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (pa)", ->
		`
		expect(p.parse("itahās dī dūjī potʰī 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ਇਤਹਾਸ ਦੀ ਦੂਜੀ ਪੋਥੀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 itahās 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ਇਤਹਾਸ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ITAHĀS DĪ DŪJĪ POTʰĪ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ਇਤਹਾਸ ਦੀ ਦੂਜੀ ਪੋਥੀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ITAHĀS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ਇਤਹਾਸ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (pa)", ->
		`
		expect(p.parse("itahās dī pahilī potʰī 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ਇਤਹਾਸ ਦੀ ਪਹਿਲੀ ਪੋਥੀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 itahās 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ਇਤਹਾਸ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ITAHĀS DĪ PAHILĪ POTʰĪ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ਇਤਹਾਸ ਦੀ ਪਹਿਲੀ ਪੋਥੀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ITAHĀS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ਇਤਹਾਸ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (pa)", ->
		`
		expect(p.parse("ਅਜ਼ਰਾ 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("azrā 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ਅਜ਼ਰਾ 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("AZRĀ 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (pa)", ->
		`
		expect(p.parse("nahamyāh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("ਨਹਮਯਾਹ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHAMYĀH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("ਨਹਮਯਾਹ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (pa)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (pa)", ->
		`
		expect(p.parse("astar 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ਅਸਤਰ 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ASTAR 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ਅਸਤਰ 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (pa)", ->
		`
		expect(p.parse("ayyūb 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ਅੱਯੂਬ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ਅਯੂਬ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AYYŪB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ਅੱਯੂਬ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ਅਯੂਬ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (pa)", ->
		`
		expect(p.parse("zabūr 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ਜ਼ਬੂਰ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ਜਬੂਰ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZABŪR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ਜ਼ਬੂਰ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ਜਬੂਰ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (pa)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (pa)", ->
		`
		expect(p.parse("kahāutāṃ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ਕਹਾਉਂਤਾ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ਕਹਾਉਤਾਂ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KAHĀUTĀṂ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ਕਹਾਉਂਤਾ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ਕਹਾਉਤਾਂ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (pa)", ->
		`
		expect(p.parse("upadešak 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ਉਪਦੇਸ਼ਕ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("UPADEŠAK 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ਉਪਦੇਸ਼ਕ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (pa)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (pa)", ->
		`
		expect(p.parse("salemān dā gīt 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ਸਲੇਮਾਨ ਦਾ ਗੀਤ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SALEMĀN DĀ GĪT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ਸਲੇਮਾਨ ਦਾ ਗੀਤ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (pa)", ->
		`
		expect(p.parse("yirmiyāh 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ਯਿਰਮਿਯਾਹ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YIRMIYĀH 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ਯਿਰਮਿਯਾਹ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (pa)", ->
		`
		expect(p.parse("ਹਿਜ਼ਕੀਏਲ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("hizkīel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ਹਿਜ਼ਕੀਏਲ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("HIZKĪEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (pa)", ->
		`
		expect(p.parse("dānīel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ਦਾਨੀਏਲ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DĀNĪEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ਦਾਨੀਏਲ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (pa)", ->
		`
		expect(p.parse("ਹੋਸ਼ੇਆ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("hošeā 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ਹੋਸ਼ੇਆ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOŠEĀ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (pa)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("yoel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ਜੋਏਲ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ਯੋਏਲ 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("YOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ਜੋਏਲ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ਯੋਏਲ 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (pa)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("āmos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ਆਮੋਸ 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ĀMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ਆਮੋਸ 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (pa)", ->
		`
		expect(p.parse("obadyāh 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ਓਬਦਯਾਹ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADYĀH 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ਓਬਦਯਾਹ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (pa)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("yūnāh 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ਯੂਨਾਹ 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("YŪNĀH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ਯੂਨਾਹ 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (pa)", ->
		`
		expect(p.parse("mīkāh 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ਮੀਕਾਹ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MĪKĀH 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ਮੀਕਾਹ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (pa)", ->
		`
		expect(p.parse("nahūm 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("ਨਹੂਮ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHŪM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("ਨਹੂਮ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (pa)", ->
		`
		expect(p.parse("habakkūk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ਹਬਕੱੂਕ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ਹਬੱਕੂਕ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ਹਬਕੂਕ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKKŪK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ਹਬਕੱੂਕ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ਹਬੱਕੂਕ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ਹਬਕੂਕ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (pa)", ->
		`
		expect(p.parse("safanyāh 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ਸਫ਼ਨਯਾਹ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAFANYĀH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ਸਫ਼ਨਯਾਹ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (pa)", ->
		`
		expect(p.parse("hajjaī 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("ਹੱਜਈ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAJJAĪ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("ਹੱਜਈ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (pa)", ->
		`
		expect(p.parse("zakaryāh 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ਜ਼ਕਰਜਾਹ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ਜ਼ਕਰਯਾਹ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ਜਕਰਯਾਹ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZAKARYĀH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ਜ਼ਕਰਜਾਹ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ਜ਼ਕਰਯਾਹ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ਜਕਰਯਾਹ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (pa)", ->
		`
		expect(p.parse("malākī 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ਮਲਾਕੀ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALĀKĪ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ਮਲਾਕੀ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (pa)", ->
		`
		expect(p.parse("mattī dī ĩjīl 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ਮੱਤੀ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("mattī 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ਮੱਤੀ 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MATTĪ DĪ ĨJĪL 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ਮੱਤੀ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTĪ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ਮੱਤੀ 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (pa)", ->
		`
		expect(p.parse("markus dī ĩjīl 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ਮਰਕੁਸ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("markus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ਮਰਕੁਸ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MARKUS DĪ ĨJĪL 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ਮਰਕੁਸ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ਮਰਕੁਸ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (pa)", ->
		`
		expect(p.parse("ਲੂਕਾ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("lūkā dī ĩjīl 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("lūkā 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ਲੂਕਾ 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ਲੂਕਾ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LŪKĀ DĪ ĨJĪL 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LŪKĀ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ਲੂਕਾ 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (pa)", ->
		`
		expect(p.parse("yūhãnā dī pahilī pattrī 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 yūhãnā 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ਯੂਹੰਨਾ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YŪHÃNĀ DĪ PAHILĪ PATTRĪ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 YŪHÃNĀ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ਯੂਹੰਨਾ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (pa)", ->
		`
		expect(p.parse("yūhãnā dī dūjī pattrī 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 yūhãnā 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ਯੂਹੰਨਾ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YŪHÃNĀ DĪ DŪJĪ PATTRĪ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 YŪHÃNĀ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ਯੂਹੰਨਾ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (pa)", ->
		`
		expect(p.parse("yūhãnā dī tījī pattrī 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਤੀਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 yūhãnā 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ਯੂਹੰਨਾ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YŪHÃNĀ DĪ TĪJĪ PATTRĪ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਤੀਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 YŪHÃNĀ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ਯੂਹੰਨਾ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (pa)", ->
		`
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("yūhãnā dī ĩjīl 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ਯੂਹਾਂਨਾ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("yūhãnā 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ਯੂਹੰਨਾ ਦੀ ਇੰਜੀਲ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("YŪHÃNĀ DĪ ĨJĪL 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ਯੂਹਾਂਨਾ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("YŪHÃNĀ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ਯੂਹੰਨਾ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (pa)", ->
		`
		expect(p.parse("rasūlāṃ de kartabb 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ਰਸੂਲਾਂ ਦੇ ਕਰਤੱਬ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RASŪLĀṂ DE KARTABB 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ਰਸੂਲਾਂ ਦੇ ਕਰਤੱਬ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (pa)", ->
		`
		expect(p.parse("romīāṃ nū̃ pattrī 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ਰੋਮੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ਰੋਮੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("romīāṃ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ਰੋਮੀਆਂ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROMĪĀṂ NŪ̃ PATTRĪ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ਰੋਮੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ਰੋਮੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMĪĀṂ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ਰੋਮੀਆਂ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (pa)", ->
		`
		expect(p.parse("kurĩtʰīāṃ nū̃ dūjī pattrī 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ਕੁਰਿੰਥੀਆਂ ਨੂੰ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 ਕੁਰਿੰਥੀਆਂ ਨੂੰ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 kurĩtʰīāṃ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 ਕੁਰਿੰਥੀਆਂ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KURĨTʰĪĀṂ NŪ̃ DŪJĪ PATTRĪ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ਕੁਰਿੰਥੀਆਂ ਨੂੰ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 ਕੁਰਿੰਥੀਆਂ ਨੂੰ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KURĨTʰĪĀṂ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 ਕੁਰਿੰਥੀਆਂ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (pa)", ->
		`
		expect(p.parse("kurĩtʰīāṃ nū̃ pahilī pattrī 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ਕੁਰਿੰਥੀਆਂ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 ਕੁਰਿੰਥੀਆਂ ਨੂੰ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ਕੁਰਿੰਥੀਆਂ ਨੂੰ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 kurĩtʰīāṃ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 ਕੁਰਿੰਥੀਆਂ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KURĨTʰĪĀṂ NŪ̃ PAHILĪ PATTRĪ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ਕੁਰਿੰਥੀਆਂ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 ਕੁਰਿੰਥੀਆਂ ਨੂੰ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ਕੁਰਿੰਥੀਆਂ ਨੂੰ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KURĨTʰĪĀṂ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 ਕੁਰਿੰਥੀਆਂ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (pa)", ->
		`
		expect(p.parse("galātīāṃ nū̃ pattrī 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ਗਲਾਤੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ਗਲਾਤੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("galātīāṃ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALĀTĪĀṂ NŪ̃ PATTRĪ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ਗਲਾਤੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ਗਲਾਤੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALĀTĪĀṂ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (pa)", ->
		`
		expect(p.parse("afasīāṃ nū̃ pattrī 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ਅਫ਼ਸੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ਅਫ਼ਸੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("afasīāṃ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AFASĪĀṂ NŪ̃ PATTRĪ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ਅਫ਼ਸੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ਅਫ਼ਸੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("AFASĪĀṂ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (pa)", ->
		`
		expect(p.parse("ਫ਼ਿਲਿੱਪੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("filippīāṃ nū̃ pattrī 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ਫ਼ਿਲਿੱਪੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("filippīāṃ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ਫ਼ਿਲਿੱਪੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPĪĀṂ NŪ̃ PATTRĪ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ਫ਼ਿਲਿੱਪੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPĪĀṂ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (pa)", ->
		`
		expect(p.parse("kulussīāṃ nū̃ pattrī 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ਕੁਲੁੱਸੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ਕੁਲੁੱਸੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("kulussīāṃ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KULUSSĪĀṂ NŪ̃ PATTRĪ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ਕੁਲੁੱਸੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ਕੁਲੁੱਸੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KULUSSĪĀṂ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (pa)", ->
		`
		expect(p.parse("tʰassalunīkīāṃ nū̃ dūjī pattrī 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 tʰassalunīkīāṃ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TʰASSALUNĪKĪĀṂ NŪ̃ DŪJĪ PATTRĪ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TʰASSALUNĪKĪĀṂ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (pa)", ->
		`
		expect(p.parse("tʰassalunīkīāṃ nū̃ pahilī pattrī 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ਥਸੱਲੁਨੀਕੀਆਂ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 tʰassalunīkīāṃ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TʰASSALUNĪKĪĀṂ NŪ̃ PAHILĪ PATTRĪ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ਥਸੱਲੁਨੀਕੀਆਂ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 ਥੱਸਲੁਨੀਕੀਆਂ ਨੂੰ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TʰASSALUNĪKĪĀṂ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (pa)", ->
		`
		expect(p.parse("timotʰius nū̃ dūjī pattrī 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ਤਿਮੋਥਿਉਸ ਨੂੰ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ਤਿਮੋਥਿਉਸ ਨੂੰ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 timotʰius 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIMOTʰIUS NŪ̃ DŪJĪ PATTRĪ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ਤਿਮੋਥਿਉਸ ਨੂੰ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ਤਿਮੋਥਿਉਸ ਨੂੰ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTʰIUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (pa)", ->
		`
		expect(p.parse("timotʰius nū̃ pahilī pattrī 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ਤਿਮੋਥਿਉਸ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ਤਿਮੋਥਿਉਸ ਨੂੰ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 timotʰius 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIMOTʰIUS NŪ̃ PAHILĪ PATTRĪ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ਤਿਮੋਥਿਉਸ ਨੂੰ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ਤਿਮੋਥਿਉਸ ਨੂੰ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTʰIUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (pa)", ->
		`
		expect(p.parse("tītus nū̃ pattrī 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ਤੀਤੁਸ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ਤੀਤੁਸ ਨੂੰ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("tītus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ਤੀਤੁਸ 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TĪTUS NŪ̃ PATTRĪ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ਤੀਤੁਸ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ਤੀਤੁਸ ਨੂੰ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TĪTUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ਤੀਤੁਸ 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (pa)", ->
		`
		expect(p.parse("pʰilemon nū̃ pattrī 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ਫ਼ਿਲੇਮੋਨ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ਫਿਲੇਮੋਨ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ਫ਼ਿਲੇਮੋਨ ਨੂੰ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("pʰilemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PʰILEMON NŪ̃ PATTRĪ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ਫ਼ਿਲੇਮੋਨ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ਫਿਲੇਮੋਨ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ਫ਼ਿਲੇਮੋਨ ਨੂੰ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PʰILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (pa)", ->
		`
		expect(p.parse("ibrānīāṃ nū̃ pattrī 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ਇਬਰਾਨੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ਇਬਰਾਨੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ibrānīāṃ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("IBRĀNĪĀṂ NŪ̃ PATTRĪ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ਇਬਰਾਨੀਆਂ ਨੂੰ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ਇਬਰਾਨੀਆਂ ਨੂੰ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("IBRĀNĪĀṂ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (pa)", ->
		`
		expect(p.parse("yākūb dī pattrī 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ਯਾਕੂਬ ਦੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("yākūb 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ਯਾਕੂਬ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YĀKŪB DĪ PATTRĪ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ਯਾਕੂਬ ਦੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("YĀKŪB 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ਯਾਕੂਬ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (pa)", ->
		`
		expect(p.parse("patras dī dūjī pattrī 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ਪਤਰਸ ਦੀ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 patras 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ਪਤਰਸ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PATRAS DĪ DŪJĪ PATTRĪ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ਪਤਰਸ ਦੀ ਦੂਜੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PATRAS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ਪਤਰਸ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (pa)", ->
		`
		expect(p.parse("patras dī pahilī pattrī 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ਪਤਰਸ ਦੀ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 patras 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ਪਤਰਸ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PATRAS DĪ PAHILĪ PATTRĪ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ਪਤਰਸ ਦੀ ਪਹਿਲੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PATRAS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ਪਤਰਸ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (pa)", ->
		`
		expect(p.parse("yahūdāh dī pattrī 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ਯਹੂਦਾਹ ਦੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("yahūdāh 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ਯਹੂਦਾਹ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("YAHŪDĀH DĪ PATTRĪ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ਯਹੂਦਾਹ ਦੀ ਪੱਤ੍ਰੀ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("YAHŪDĀH 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ਯਹੂਦਾਹ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (pa)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (pa)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (pa)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (pa)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (pa)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (pa)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (pa)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (pa)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (pa)", ->
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

	it "should handle ranges (pa)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (pa)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (pa)", ->
		expect(p.parse("Exod 1:1 ਪਦ 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm ਪਦ 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (pa)", ->
		expect(p.parse("Exod 1:1 ਜਾਂ 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ਜਾਂ 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (pa)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (pa)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (pa)", ->
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
	it "should handle boundaries (pa)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

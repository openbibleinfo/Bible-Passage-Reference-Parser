bcv_parser = require("../../js/nl_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (nl)", ->
		`
		expect(p.parse("Eerste Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1e. Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Beresjiet 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1e Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mozes 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gn 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1E. MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("BERESJIET 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1E MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOZES 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (nl)", ->
		`
		expect(p.parse("Tweede Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2e. Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2e Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mozes 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Sjemot 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Ex 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2E. MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2E MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOZES 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("SJEMOT 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EX 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (nl)", ->
		`
		expect(p.parse("Bel en de draak 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (nl)", ->
		`
		expect(p.parse("Derde Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3e. Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Leviticus 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3e Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mozes 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Vajikra 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Wajikra 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lv 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DERDE MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3E. MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVITICUS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3E MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOZES 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("VAJIKRA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("WAJIKRA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (nl)", ->
		`
		expect(p.parse("Vierde Mozes 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mozes 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mozes 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Bamidbar 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Bemidbar 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mozes 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mozes 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numberi 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numeri 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Nu 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VIERDE MOZES 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOZES 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOZES 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("BAMIDBAR 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("BEMIDBAR 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOZES 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOZES 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMBERI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMERI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NU 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (nl)", ->
		`
		expect(p.parse("Wijsheid van Jozua Ben Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Wijsheid van Jezus Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Wijsheid van Ben Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Ecclesiasticus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Jezus Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirach 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (nl)", ->
		`
		expect(p.parse("De wijsheid van Salomo 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Het boek der wijsheid 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wijsheid van Salomo 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wijsheid 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (nl)", ->
		`
		expect(p.parse("Klaagliederen 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Klaagl 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Kl 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KLAAGLIEDEREN 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("KLAAGL 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("KL 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (nl)", ->
		`
		expect(p.parse("Brief van Jeremia 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (nl)", ->
		`
		expect(p.parse("Openbaring van Johannes 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Openbaringen 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Openbaring 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalyps 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Openb 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apc 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apk 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Op 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OPENBARING VAN JOHANNES 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPENBARINGEN 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPENBARING 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALYPS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPENB 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APC 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APK 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OP 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (nl)", ->
		`
		expect(p.parse("Manasse 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Man 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (nl)", ->
		`
		expect(p.parse("Deuteronomium 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Vijfde Mozes 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mozes 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dewariem 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mozes 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mozes 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mozes 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dt 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEUTERONOMIUM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("VIJFDE MOZES 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOZES 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEWARIEM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOZES 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOZES 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOZES 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (nl)", ->
		`
		expect(p.parse("Jozua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Joz 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOZUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZ 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (nl)", ->
		`
		expect(p.parse("Richteren 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Rechters 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Richtere 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Recht 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Richt 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Re 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RICHTEREN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("RECHTERS 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("RICHTERE 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("RECHT 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("RICHT 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("RE 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (nl)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rt 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (nl)", ->
		`
		expect(p.parse("Eerste Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Derde Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Eerste Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("III. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1e. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3e. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Derde Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("III Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1e Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3e Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("III. Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1e. Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3 Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3e. Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("III Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1e Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3. Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3e Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("3 Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezra 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (nl)", ->
		`
		expect(p.parse("Tweede Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Vierde Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Tweede Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Vierde Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2e. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("IV. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2e Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("4. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("IV Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2e. Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("4 Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("IV. Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2e Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("4. Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("IV Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("4 Ezra 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (nl)", ->
		`
		expect(p.parse("Jesaja 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Jes 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Js 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JESAJA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("JES 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("JS 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (nl)", ->
		`
		expect(p.parse("Tweede Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Tweede Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2e. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2e. Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Tweede Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2e Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2e Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Samuel II 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuël 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2e. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2e Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("TWEEDE SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2E. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2E. SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("TWEEDE SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2E SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2E SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SAMUEL II 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUËL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2E. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2E SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (nl)", ->
		`
		expect(p.parse("Eerste Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Eerste Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1e. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1e. Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Eerste Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1e Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1e Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuël 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Samuel I 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1e. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1e Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("EERSTE SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1E. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1E. SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("EERSTE SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1E SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1E SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUËL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("SAMUEL I 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1E. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1E SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (nl)", ->
		`
		expect(p.parse("Tweede Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2e. Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2e Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Koningen 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Tweede Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Tweede Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2e. Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2e Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2e. Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2e Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Ko 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2E. KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2E KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KONINGEN 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("TWEEDE KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("TWEEDE KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2E. KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2E KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2E. KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2E KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KO 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (nl)", ->
		`
		expect(p.parse("Eerste Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1e. Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1e Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Eerste Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Koningen 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Eerste Ko 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1e. Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1e Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1e. Ko 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Ko 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1e Ko 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Ko 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Ko 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Ko 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1E. KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1E KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("EERSTE KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KONINGEN 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("EERSTE KO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1E. KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1E KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1E. KO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1E KO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KO 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KO 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (nl)", ->
		`
		expect(p.parse("Tweede Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2e. Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2e Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kronieken 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Tweede Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2e. Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2e Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kr 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2E. KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2E KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONIEKEN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("TWEEDE KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2E. KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2E KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (nl)", ->
		`
		expect(p.parse("Eerste Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1e. Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1e Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Eerste Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kronieken 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1e. Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1e Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kr 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1E. KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1E KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("EERSTE KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRONIEKEN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1E. KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1E KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (nl)", ->
		`
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezr 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZR 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (nl)", ->
		`
		expect(p.parse("Nehemia 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (nl)", ->
		`
		expect(p.parse("Ester \(Grieks\) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester (Grieks) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester (Gr.) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester (Gr) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Est gr 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (nl)", ->
		`
		expect(p.parse("Esther 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTHER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (nl)", ->
		`
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (nl)", ->
		`
		expect(p.parse("Psalmen 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Psalm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PSALMEN 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PSALM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (nl)", ->
		`
		expect(p.parse("Gebed van Azarja 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (nl)", ->
		`
		expect(p.parse("Spreuken 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Spr 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SPREUKEN 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("SPR 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (nl)", ->
		`
		expect(p.parse("Koheleth 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Prediker 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Qoheleth 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kohelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Qohelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Pred 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Pr 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KOHELETH 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PREDIKER 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("QOHELETH 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KOHELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("QOHELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PRED 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PR 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (nl)", ->
		`
		expect(p.parse("Gezang der drie mannen in het vuur 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Lied van de drie jongemannen 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (nl)", ->
		`
		expect(p.parse("Canticum canticorum 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Hooglied 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Hoogl 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Hl 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CANTICUM CANTICORUM 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("HOOGLIED 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("HOOGL 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("HL 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (nl)", ->
		`
		expect(p.parse("Jeremia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jr 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JR 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (nl)", ->
		`
		expect(p.parse("Ezechiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezechiël 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezech 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZECHIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZECHIËL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZECH 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (nl)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Daniël 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Da 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANIËL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DA 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (nl)", ->
		`
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (nl)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joël 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jl 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOËL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (nl)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (nl)", ->
		`
		expect(p.parse("Obadja 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ob 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADJA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (nl)", ->
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
describe "Localized book Mic (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (nl)", ->
		`
		expect(p.parse("Micha 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mica 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mi 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MICHA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MI 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (nl)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (nl)", ->
		`
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (nl)", ->
		`
		expect(p.parse("Sefanja 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zefanja 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sef 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zef 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEFANJA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEFANJA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEF 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (nl)", ->
		`
		expect(p.parse("Haggai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Haggaï 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hagg 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGGAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGGAÏ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (nl)", ->
		`
		expect(p.parse("Zacharia 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zach 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZACHARIA 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (nl)", ->
		`
		expect(p.parse("Maleachi 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALEACHI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (nl)", ->
		`
		expect(p.parse("Evangelie volgens Matteus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evangelie volgens Matteüs 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mattheus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mattheüs 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matthéus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matthéüs 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matteus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matteüs 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matth 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIE VOLGENS MATTEUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANGELIE VOLGENS MATTEÜS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTHEUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTHEÜS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTHÉUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTHÉÜS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTEUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTEÜS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATTH 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (nl)", ->
		`
		expect(p.parse("Evangelie volgens Marcus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Evangelie volgens Markus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marcus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Markus 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIE VOLGENS MARCUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("EVANGELIE VOLGENS MARKUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARCUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKUS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (nl)", ->
		`
		expect(p.parse("Evangelie volgens Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evangelie volgens Lukas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luk 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIE VOLGENS LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANGELIE VOLGENS LUKAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUK 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (nl)", ->
		`
		expect(p.parse("Eerste Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1e. Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1e Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Eerste Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Johannes 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1e. Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1e Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Joh 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1E. JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1E JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("EERSTE JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOHANNES 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1E. JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1E JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOH 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (nl)", ->
		`
		expect(p.parse("Tweede Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2e. Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2e Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Johannes 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Tweede Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2e. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2e Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2E. JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2E JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOHANNES 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("TWEEDE JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2E. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2E JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (nl)", ->
		`
		expect(p.parse("Derde Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3e. Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3e Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Johannes 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Derde Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3e. Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3e Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DERDE JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3E. JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3E JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOHANNES 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("DERDE JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3E. JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3E JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (nl)", ->
		`
		expect(p.parse("Evangelie volgens Johannes 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Johannes 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Joh 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANGELIE VOLGENS JOHANNES 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHANNES 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOH 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (nl)", ->
		`
		expect(p.parse("Handelingen van de apostelen 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Handelingen der apostelen 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Handelingen 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hand 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hnd 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HANDELINGEN VAN DE APOSTELEN 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HANDELINGEN DER APOSTELEN 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HANDELINGEN 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HAND 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HND 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (nl)", ->
		`
		expect(p.parse("Romeinenbrief 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Romeinen 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROMEINENBRIEF 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMEINEN 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (nl)", ->
		`
		expect(p.parse("Tweede Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinthiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinthiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinthier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinthiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintiers 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintiërs 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintier 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintiër 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinthe 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Tweede Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2e Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTHIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTHIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTHIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTHIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTIERS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTIËRS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTIER 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTIËR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTHE 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("TWEEDE KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2E KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (nl)", ->
		`
		expect(p.parse("Eerste Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinthiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinthiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinthier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinthiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintiers 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintiërs 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintier 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintiër 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Eerste Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinthe 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1e Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTHIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTHIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTHIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTHIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTIERS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTIËRS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTIER 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTIËR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("EERSTE KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTHE 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1E KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (nl)", ->
		`
		expect(p.parse("Galatenbrief 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galaten 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALATENBRIEF 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATEN 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (nl)", ->
		`
		expect(p.parse("Efeziers 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efeziërs 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efez 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EFEZIERS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZIËRS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (nl)", ->
		`
		expect(p.parse("Filippenzen 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filip 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILIPPENZEN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIP 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (nl)", ->
		`
		expect(p.parse("Colossenzen 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolossenzen 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("COLOSSENZEN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSSENZEN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (nl)", ->
		`
		expect(p.parse("Tweede Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Tweede Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e. Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e. Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tessalonicenzen 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Tweede Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Tweede Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Tweede Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e. Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e. Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e. Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2e Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tes 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("TWEEDE TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E. THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E. TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESSALONICENZEN 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("TWEEDE THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("TWEEDE TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("TWEEDE TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E. THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E. TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E. TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2E TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TES 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (nl)", ->
		`
		expect(p.parse("Eerste Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Eerste Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e. Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e. Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Thessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tessalonicenzen 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Eerste Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Eerste Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Eerste Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e. Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e. Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e. Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1e Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tes 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("EERSTE TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E. THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E. TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I THESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESSALONICENZEN 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("EERSTE THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("EERSTE TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("EERSTE TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E. THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E. TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E. TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1E TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TES 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (nl)", ->
		`
		expect(p.parse("Tweede Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Tweede Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Tweede Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Tweede Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e. Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e. Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e. Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e. Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timotheus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timotheüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteus 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteüs 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Tweede Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2e Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TWEEDE TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TWEEDE TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TWEEDE TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E. TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E. TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E. TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E. TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTHEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEUS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEÜS 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("TWEEDE TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2E TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (nl)", ->
		`
		expect(p.parse("Eerste Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Eerste Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Eerste Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Eerste Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e. Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e. Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e. Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e. Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timotheus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timotheüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Eerste Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteus 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteüs 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1e Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("EERSTE TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("EERSTE TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("EERSTE TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E. TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E. TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E. TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E. TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTHEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("EERSTE TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEUS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEÜS 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1E TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (nl)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (nl)", ->
		`
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filémon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Film 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILÉMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (nl)", ->
		`
		expect(p.parse("Hebreeen 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebreeën 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebr 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HEBREEEN 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREEËN 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBR 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (nl)", ->
		`
		expect(p.parse("Jakobus 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jak 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JAKOBUS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAK 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (nl)", ->
		`
		expect(p.parse("Tweede Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Tweede Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2e. Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Tweede Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2e Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petrus 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2e. Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2e Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2e. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petr 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2e Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pe 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TWEEDE PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("TWEEDE PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2E. PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("TWEEDE PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2E PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETRUS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2E. PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2E PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2E. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETR 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2E PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (nl)", ->
		`
		expect(p.parse("Eerste Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Eerste Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1e. Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Eerste Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1e Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1e. Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petrus 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1e Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1e. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1e Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petr 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pe 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EERSTE PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("EERSTE PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1E. PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("EERSTE PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1E PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1E. PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETRUS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1E PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1E. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1E PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETR 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (nl)", ->
		`
		expect(p.parse("Judas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (nl)", ->
		`
		expect(p.parse("Tobias 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobías 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobia 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobit 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobía 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (nl)", ->
		`
		expect(p.parse("Judith 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judit 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (nl)", ->
		`
		expect(p.parse("Baruch 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (nl)", ->
		`
		expect(p.parse("Susanna 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (nl)", ->
		`
		expect(p.parse("Tweede Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Tweede Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2e. Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2e. Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2e Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2e Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Makkabeeen 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Makkabeeën 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Tweede Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2e. Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2e Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (nl)", ->
		`
		expect(p.parse("Derde Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Derde Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3e. Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3e. Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3e Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3e Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Makkabeeen 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Makkabeeën 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Derde Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3e. Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3e Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (nl)", ->
		`
		expect(p.parse("Vierde Makkabeeen 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Vierde Makkabeeën 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Makkabeeen 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Makkabeeën 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Makkabeeen 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Makkabeeën 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Makkabeeen 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Makkabeeën 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Makkabeeen 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Makkabeeën 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Vierde Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (nl)", ->
		`
		expect(p.parse("Eerste Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Eerste Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1e. Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1e. Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1e Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1e Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Makkabeeen 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Makkabeeën 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Eerste Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1e. Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1e Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Mak 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book Ezek,Ezra (nl)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek,Ezra (nl)", ->
		`
		expect(p.parse("Ez 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (nl)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (nl)", ->
		expect(p.parse("Titus 1:1, hoofdstukken 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 HOOFDSTUKKEN 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, hoofdstuk 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 HOOFDSTUK 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (nl)", ->
		expect(p.parse("Exod 1:1 verzen 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERZEN 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vers 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vs. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VS. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vs 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 v. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm V. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 v 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm V 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (nl)", ->
		expect(p.parse("Exod 1:1 en 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 EN 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 vgl 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 VGL 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 zie ook 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ZIE OOK 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (nl)", ->
		expect(p.parse("Ps 3 opschrift, 4:2, 5:opschrift").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 OPSCHRIFT, 4:2, 5:OPSCHRIFT").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (nl)", ->
		expect(p.parse("Rev 3en volgende verzen, 4:2en volgende verzen").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 EN VOLGENDE VERZEN, 4:2 EN VOLGENDE VERZEN").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (nl)", ->
		expect(p.parse("Lev 1 (GNB96)").osis_and_translations()).toEqual [["Lev.1", "GNB96"]]
		expect(p.parse("lev 1 gnb96").osis_and_translations()).toEqual [["Lev.1", "GNB96"]]
		expect(p.parse("Lev 1 (NBG51)").osis_and_translations()).toEqual [["Lev.1", "NBG51"]]
		expect(p.parse("lev 1 nbg51").osis_and_translations()).toEqual [["Lev.1", "NBG51"]]
		expect(p.parse("Lev 1 (NBV)").osis_and_translations()).toEqual [["Lev.1", "NBV"]]
		expect(p.parse("lev 1 nbv").osis_and_translations()).toEqual [["Lev.1", "NBV"]]
		expect(p.parse("Lev 1 (SV)").osis_and_translations()).toEqual [["Lev.1", "SV"]]
		expect(p.parse("lev 1 sv").osis_and_translations()).toEqual [["Lev.1", "SV"]]
		expect(p.parse("Lev 1 (SV77)").osis_and_translations()).toEqual [["Lev.1", "SV77"]]
		expect(p.parse("lev 1 sv77").osis_and_translations()).toEqual [["Lev.1", "SV77"]]
		expect(p.parse("Lev 1 (WV95)").osis_and_translations()).toEqual [["Lev.1", "WV95"]]
		expect(p.parse("lev 1 wv95").osis_and_translations()).toEqual [["Lev.1", "WV95"]]
		expect(p.parse("Lev 1 (NB)").osis_and_translations()).toEqual [["Lev.1", "NB"]]
		expect(p.parse("lev 1 nb").osis_and_translations()).toEqual [["Lev.1", "NB"]]
	it "should handle book ranges (nl)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Eerste - Derde  Joh").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (nl)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

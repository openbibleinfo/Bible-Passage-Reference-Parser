bcv_parser = require("../../js/zh_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (zh)", ->
		`
		expect(p.parse("《创世记》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世紀》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世記》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《创世记 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世紀 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世記 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创世记》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世紀》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世記》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《创》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创世记 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世紀 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世記 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《创 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《创世记》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世紀》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世記》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《创世记 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世紀 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創世記 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创世记》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世紀》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世記》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《创》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创世记 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世紀 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創世記 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《创 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("《創 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創》 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("创 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("創 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (zh)", ->
		`
		expect(p.parse("《出埃及記》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及记》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及記 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及记 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出谷紀》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及記》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及记》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出谷紀 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及記 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及记 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出谷紀》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出谷紀 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《出埃及記》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及记》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及記 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及记 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出谷紀》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及記》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及记》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出埃及 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出谷紀 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及記 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及记 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出谷紀》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出埃及 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出谷紀 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("《出 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出》 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("出 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (zh)", ->
		`
		expect(p.parse("《Bel》 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel》 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("《Bel 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (zh)", ->
		`
		expect(p.parse("《利未記》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利未记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利末记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《肋未紀》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利未記 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利未记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利末记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《肋未紀 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未記》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利末记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("肋未紀》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未記 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利末记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("肋未紀 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《利未記》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利未记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利末记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《肋未紀》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利未記 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利未记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利末记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《肋未紀 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未記》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利末记》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("肋未紀》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未記 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利未记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利末记 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("肋未紀 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("《利 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利》 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("利 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (zh)", ->
		`
		expect(p.parse("《戶籍紀》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民数记》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民數記》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《戶籍紀 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民数记 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民數記 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("戶籍紀》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民数记》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民數記》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("戶籍紀 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民数记 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民數記 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《戶籍紀》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民数记》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民數記》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《戶籍紀 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民数记 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民數記 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("戶籍紀》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民数记》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民數記》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("戶籍紀 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民数记 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民數記 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("《民 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民》 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("民 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (zh)", ->
		`
		expect(p.parse("《德訓篇》 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("《德訓篇 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("德訓篇》 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("德訓篇 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (zh)", ->
		`
		expect(p.parse("《智慧篇》 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("《智慧篇 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("智慧篇》 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("智慧篇 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Rev (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (zh)", ->
		`
		expect(p.parse("《若望默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《若望默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("若望默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启示录》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啓示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("若望默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启示录 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啓示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启示录》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啓示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启示录 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啓示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《若望默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《若望默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("若望默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启示录》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啓示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("若望默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启示录 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啓示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启示录》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啓示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("默示錄》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启示录 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啓示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("默示錄 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《启 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("《啟 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟》 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("启 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("啟 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (zh)", ->
		`
		expect(p.parse("《PrMan》 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan》 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("《PrMan 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (zh)", ->
		`
		expect(p.parse("《申命紀》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命記》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命记》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命紀 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命記 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命记 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命紀》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命記》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命记》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命紀 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命記 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命记 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《申命紀》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命記》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命记》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命紀 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命記 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申命记 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命紀》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命記》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命记》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命紀 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命記 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申命记 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("《申 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申》 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("申 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Judg (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (zh)", ->
		`
		expect(p.parse("《士师记》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士師記》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《民長紀》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士师记 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士師記 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《民長紀 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士师记》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士師記》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("民長紀》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士师记 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士師記 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("民長紀 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《士师记》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士師記》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《民長紀》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士师记 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士師記 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《民長紀 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士师记》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士師記》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("民長紀》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士师记 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士師記 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("民長紀 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("《士 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士》 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("士 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (zh)", ->
		`
		expect(p.parse("《盧德傳》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得記》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得记》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《盧德傳 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得記 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得记 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("盧德傳》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得記》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得记》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《得》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("盧德傳 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得記 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得记 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《得 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("得》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("得 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《盧德傳》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得記》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得记》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《盧德傳 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得記 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《路得记 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("盧德傳》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得記》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得记》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《得》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("盧德傳 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得記 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("路得记 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("《得 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("得》 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("得 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (zh)", ->
		`
		expect(p.parse("《1Esd》 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd》 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("《1Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (zh)", ->
		`
		expect(p.parse("《2Esd》 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd》 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("《2Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (zh)", ->
		`
		expect(p.parse("《以賽亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以賽亞書》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以赛亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《依撒意亞》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以賽亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以賽亞書 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以赛亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《依撒意亞 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亞書》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以赛亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("依撒意亞》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亞書 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以赛亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("依撒意亞 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《賽》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《赛》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《賽 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《赛 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("賽》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("赛》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("賽 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("赛 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《以賽亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以賽亞書》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以赛亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《依撒意亞》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以賽亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以賽亞書 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《以赛亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《依撒意亞 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亞書》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以赛亚书》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("依撒意亞》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以賽亞書 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("以赛亚书 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("依撒意亞 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《賽》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《赛》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《賽 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("《赛 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("賽》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("赛》 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("賽 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("赛 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (zh)", ->
		`
		expect(p.parse("《撒慕爾紀下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳記下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳记下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒慕爾紀下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳記下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳记下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒慕爾紀下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳記下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳记下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒慕爾紀下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳記下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳记下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒下 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《撒慕爾紀下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳記下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳记下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒慕爾紀下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳記下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒母耳记下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒慕爾紀下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳記下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳记下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒慕爾紀下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳記下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒母耳记下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("《撒下 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒下》 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("撒下 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (zh)", ->
		`
		expect(p.parse("《撒慕爾紀上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳記上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳记上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒慕爾紀上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳記上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳记上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒慕爾紀上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳記上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳记上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒慕爾紀上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳記上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳记上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒上 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《撒慕爾紀上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳記上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳记上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒慕爾紀上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳記上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒母耳记上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒慕爾紀上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳記上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳记上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒慕爾紀上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳記上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒母耳记上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("《撒上 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒上》 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("撒上 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (zh)", ->
		`
		expect(p.parse("《列王紀下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王纪下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王记下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王紀下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王纪下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王记下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王紀下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王纪下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王记下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《王下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王紀下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王纪下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王记下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《王下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("王下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("王下 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《列王紀下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王纪下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王记下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王紀下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王纪下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《列王记下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王紀下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王纪下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王记下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《王下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王紀下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王纪下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("列王记下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("《王下 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("王下》 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("王下 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (zh)", ->
		`
		expect(p.parse("《列王紀上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王纪上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王记上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王紀上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王纪上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王记上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王紀上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王纪上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王记上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《王上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王紀上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王纪上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王记上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《王上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("王上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("王上 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《列王紀上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王纪上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王记上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王紀上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王纪上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《列王记上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王紀上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王纪上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王记上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《王上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王紀上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王纪上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("列王记上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("《王上 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("王上》 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("王上 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (zh)", ->
		`
		expect(p.parse("《历代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《歷代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《編年紀下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《历代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《歷代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《編年紀下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("历代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("歷代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("編年紀下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《代下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("历代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("歷代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("編年紀下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《代下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("代下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("代下 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《历代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《歷代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《編年紀下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《历代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《歷代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《編年紀下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("历代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("歷代志下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("編年紀下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《代下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("历代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("歷代志下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("編年紀下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("《代下 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("代下》 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("代下 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (zh)", ->
		`
		expect(p.parse("《历代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《歷代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《編年紀上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《历代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《歷代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《編年紀上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("历代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("歷代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("編年紀上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《代上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("历代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("歷代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("編年紀上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《代上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("代上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("代上 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《历代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《歷代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《編年紀上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《历代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《歷代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《編年紀上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("历代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("歷代志上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("編年紀上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《代上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("历代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("歷代志上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("編年紀上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("《代上 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("代上》 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("代上 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (zh)", ->
		`
		expect(p.parse("《厄斯德拉上》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉記》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉记》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《厄斯德拉上 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("厄斯德拉上》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉記 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉记 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉記》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉记》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("厄斯德拉上 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉記 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉记 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《拉》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《拉 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("拉》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("拉 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《厄斯德拉上》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉記》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉记》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《厄斯德拉上 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("厄斯德拉上》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉記 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《以斯拉记 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉記》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉记》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("厄斯德拉上 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉記 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("以斯拉记 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《拉》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("《拉 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("拉》 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("拉 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (zh)", ->
		`
		expect(p.parse("《厄斯德拉下》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《厄斯德拉下 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米記》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米记》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("厄斯德拉下》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米記 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米记 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("厄斯德拉下 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米記》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米记》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米記 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米记 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《厄斯德拉下》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《厄斯德拉下 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米記》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米记》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("厄斯德拉下》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米記 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼希米记 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("厄斯德拉下 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米記》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米记》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米記 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼希米记 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("《尼 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼》 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("尼 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book Amos (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (zh)", ->
		`
		expect(p.parse("《阿摩司书》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《阿摩司書》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《亞毛斯》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《阿摩司书 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《阿摩司書 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司书》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司書》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《亞毛斯 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("亞毛斯》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司书 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司書 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《摩》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("亞毛斯 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《摩 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("摩》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("摩 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《阿摩司书》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《阿摩司書》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《亞毛斯》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《阿摩司书 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《阿摩司書 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司书》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司書》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《亞毛斯 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("亞毛斯》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司书 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("阿摩司書 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《摩》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("亞毛斯 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("《摩 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("摩》 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("摩 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Job (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (zh)", ->
		`
		expect(p.parse("《約伯傳》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《約伯記》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《约伯记》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《約伯傳 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《約伯記 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《约伯记 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯傳》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯記》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("约伯记》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《伯》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯傳 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯記 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("约伯记 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《伯 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("伯》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("伯 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《約伯傳》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《約伯記》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《约伯记》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《約伯傳 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《約伯記 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《约伯记 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯傳》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯記》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("约伯记》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《伯》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯傳 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("約伯記 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("约伯记 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("《伯 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("伯》 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("伯 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (zh)", ->
		`
		expect(p.parse("《聖詠集》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《聖詠集 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("聖詠集》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("聖詠集 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《聖詠集》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《聖詠集 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("聖詠集》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("聖詠集 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗篇》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《詩 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("《诗 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗》 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗篇 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("詩 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("诗 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (zh)", ->
		`
		expect(p.parse("《PrAzar》 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar》 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("《PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (zh)", ->
		`
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴言》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴言 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴言》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴言 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴言》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴言 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴言》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("《箴 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴》 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴言 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("箴 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book SgThree (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (zh)", ->
		`
		expect(p.parse("《SgThree》 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree》 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("《SgThree 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Lam (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (zh)", ->
		`
		expect(p.parse("《耶利米哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《耶利米哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《連同哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("耶利米哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《連同哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("耶利米哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("連同哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("連同哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《哀》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《哀 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("哀》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("哀 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《耶利米哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《耶利米哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《連同哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("耶利米哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《連同哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("耶利米哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("連同哀歌》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("連同哀歌 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《哀》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("《哀 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("哀》 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("哀 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book Song (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (zh)", ->
		`
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《雅歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《雅歌 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("雅歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《歌 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("雅歌 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("歌 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《雅歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《雅歌 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("雅歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("《歌 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("歌》 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("雅歌 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("歌 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book EpJer (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (zh)", ->
		`
		expect(p.parse("《EpJer》 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer》 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("《EpJer 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Jer (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (zh)", ->
		`
		expect(p.parse("《耶利米书》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶利米書》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶肋米亞》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶利米书 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶利米書 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶肋米亞 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米书》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米書》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶肋米亞》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米书 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米書 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶肋米亞 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《耶利米书》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶利米書》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶肋米亞》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶利米书 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶利米書 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶肋米亞 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米书》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米書》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶肋米亞》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米书 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶利米書 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶肋米亞 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("《耶 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶》 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("耶 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (zh)", ->
		`
		expect(p.parse("《以西結书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西結書》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西结书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《厄則克耳》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西結书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西結書 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西结书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《厄則克耳 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結書》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西结书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("厄則克耳》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結書 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西结书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("厄則克耳 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《結》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《结》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《結 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《结 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("結》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("结》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("結 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("结 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《以西結书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西結書》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西结书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《厄則克耳》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西結书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西結書 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《以西结书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《厄則克耳 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結書》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西结书》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("厄則克耳》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西結書 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("以西结书 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("厄則克耳 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《結》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《结》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《結 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("《结 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("結》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("结》 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("結 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("结 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (zh)", ->
		`
		expect(p.parse("《但以理书》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但以理書》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但以理书 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但以理書 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《達尼爾》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理书》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理書》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《達尼爾 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理书 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理書 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("達尼爾》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("達尼爾 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《但以理书》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但以理書》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但以理书 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但以理書 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《達尼爾》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理书》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理書》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《達尼爾 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理书 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但以理書 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("達尼爾》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("達尼爾 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("《但 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但》 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("但 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (zh)", ->
		`
		expect(p.parse("《何西阿书》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何西阿書》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何西阿书 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何西阿書 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《歐瑟亞》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿书》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿書》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《歐瑟亞 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿书 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿書 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("歐瑟亞》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("歐瑟亞 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《何西阿书》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何西阿書》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何西阿书 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何西阿書 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《歐瑟亞》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿书》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿書》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《歐瑟亞 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿书 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何西阿書 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("歐瑟亞》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("歐瑟亞 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("《何 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何》 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("何 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (zh)", ->
		`
		expect(p.parse("《岳厄爾》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《約珥書》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约珥书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约饵书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《岳厄爾 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《約珥書 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约珥书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约饵书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("岳厄爾》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("約珥書》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约珥书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约饵书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《珥》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("岳厄爾 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("約珥書 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约珥书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约饵书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《珥 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("珥》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("珥 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《岳厄爾》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《約珥書》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约珥书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约饵书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《岳厄爾 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《約珥書 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约珥书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《约饵书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("岳厄爾》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("約珥書》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约珥书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约饵书》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《珥》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("岳厄爾 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("約珥書 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约珥书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("约饵书 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("《珥 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("珥》 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("珥 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Obad (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (zh)", ->
		`
		expect(p.parse("《俄巴底亚书》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄巴底亞書》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《亞北底亞》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄巴底亚书 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄巴底亞書 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亚书》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亞書》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《亞北底亞 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("亞北底亞》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亚书 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亞書 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("亞北底亞 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《俄巴底亚书》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄巴底亞書》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《亞北底亞》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄巴底亚书 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄巴底亞書 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亚书》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亞書》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《亞北底亞 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("亞北底亞》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亚书 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄巴底亞書 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("亞北底亞 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("《俄 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄》 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("俄 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (zh)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約拿書》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《约拿书》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約拿書 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約納》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《约拿书 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約拿書》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("约拿书》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《拿》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約納 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約拿書 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約納》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("约拿书 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《拿 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("拿》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約納 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("拿 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約拿書》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《约拿书》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約拿書 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約納》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《约拿书 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約拿書》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("约拿书》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《拿》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《約納 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約拿書 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約納》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("约拿书 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("《拿 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("拿》 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("約納 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("拿 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (zh)", ->
		`
		expect(p.parse("《弥迦书》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌迦書》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《米該亞》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《弥迦书 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌迦書 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《米該亞 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥迦书》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌迦書》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("米該亞》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《弥》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥迦书 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌迦書 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("米該亞 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《弥 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《弥迦书》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌迦書》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《米該亞》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《弥迦书 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌迦書 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《米該亞 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥迦书》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌迦書》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("米該亞》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《弥》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥迦书 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌迦書 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("米該亞 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《弥 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("《彌 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌》 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("弥 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("彌 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (zh)", ->
		`
		expect(p.parse("《那鴻书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鴻書》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鸿书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《納鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鴻书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鴻書 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鸿书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻書》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鸿书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《納鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鸿》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("納鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻書 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鸿书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鸿 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("納鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鸿》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鸿 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《那鴻书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鴻書》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鸿书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《納鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鴻书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鴻書 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《那鸿书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻書》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鸿书》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《納鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鸿》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("納鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鴻書 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("那鸿书 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("《鸿 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("納鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鴻》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鸿》 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鴻 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("鸿 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (zh)", ->
		`
		expect(p.parse("《哈巴谷书》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷書》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷书 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷書 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷书》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷書》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷书 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷書 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《哈巴谷书》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷書》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷书 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷書 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷书》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷書》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈巴谷 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷书 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷書 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈巴谷 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("《哈 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈》 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("哈 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (zh)", ->
		`
		expect(p.parse("《索福尼亞》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅书》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅書》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《索福尼亞 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅书 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅書 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("索福尼亞》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅书》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅書》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("索福尼亞 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅书 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅書 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《番》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《番 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("番》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("番 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《索福尼亞》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅书》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅書》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《索福尼亞 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅书 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《西番雅書 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("索福尼亞》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅书》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅書》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("索福尼亞 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅书 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("西番雅書 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《番》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("《番 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("番》 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("番 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (zh)", ->
		`
		expect(p.parse("《哈該书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈該書》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈该书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈蓋》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈該书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈該書 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈该书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該書》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈该书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈蓋 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《該》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《该》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈蓋》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該書 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈该书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《該 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《该 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈蓋 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("該》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("该》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("該 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("该 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《哈該书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈該書》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈该书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈蓋》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈該书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈該書 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈该书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該書》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈该书》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《哈蓋 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《該》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《该》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈蓋》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈該書 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈该书 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《該 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("《该 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("哈蓋 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("該》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("该》 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("該 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("该 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Mal (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (zh)", ->
		`
		expect(p.parse("《玛拉基书》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基亞》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基書》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛拉基》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛拉基书 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基亞 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基書 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基书》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基亞》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基書》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛拉基 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基书 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基亞 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基書 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《玛拉基书》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基亞》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基書》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛拉基》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛拉基书 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基亞 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪拉基書 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基书》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基亞》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基書》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛拉基 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基书 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基亞 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪拉基書 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛拉基 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《玛 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("《瑪 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪》 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("玛 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("瑪 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Gal (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (zh)", ->
		`
		expect(p.parse("《加拉太书》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加拉太書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《戛拉提亞》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《迦拉達書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加拉太书 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加拉太書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《戛拉提亞 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《迦拉達書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太书》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("戛拉提亞》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("迦拉達書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太书 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("戛拉提亞 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("迦拉達書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《加拉太书》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加拉太書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《戛拉提亞》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《迦拉達書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加拉太书 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加拉太書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《戛拉提亞 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《迦拉達書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太书》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("戛拉提亞》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("迦拉達書》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太书 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加拉太書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("戛拉提亞 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("迦拉達書 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("《加 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加》 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("加 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Zech (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (zh)", ->
		`
		expect(p.parse("《撒加利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亚书》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《匝加利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒加利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亚书 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒加利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亚书》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《匝加利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("匝加利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒加利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亚书 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("匝加利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亚》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亚 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亚》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亚 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亞 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《撒加利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亚书》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《匝加利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒加利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亚书 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒加利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亚书》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞書》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《匝加利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《撒迦利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("匝加利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒加利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亚书 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞書 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("匝加利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("撒迦利亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亚》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亚 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("《亞 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亚》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亞》 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亚 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("亞 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Matt (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (zh)", ->
		`
		expect(p.parse("《瑪竇福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《馬太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《马太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《瑪特斐》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《瑪竇福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《馬太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《马太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪竇福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("馬太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("马太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《瑪特斐 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪特斐》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪竇福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("馬太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("马太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《太》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪特斐 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《太 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("太》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("太 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《瑪竇福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《馬太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《马太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《瑪特斐》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《瑪竇福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《馬太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《马太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪竇福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("馬太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("马太福音》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《瑪特斐 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪特斐》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪竇福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("馬太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("马太福音 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《太》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("瑪特斐 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("《太 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("太》 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("太 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (zh)", ->
		`
		expect(p.parse("《馬爾谷福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《馬可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《馬爾谷福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《马可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬爾谷福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《瑪爾克》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《馬可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《马可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬爾谷福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("马可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《瑪爾克 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("瑪爾克》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("马可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《可》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("瑪爾克 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《可 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("可》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("可 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《馬爾谷福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《馬可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《馬爾谷福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《马可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬爾谷福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《瑪爾克》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《馬可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《马可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬爾谷福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("马可福音》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《瑪爾克 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("瑪爾克》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("馬可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("马可福音 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《可》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("瑪爾克 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("《可 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("可》 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("可 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (zh)", ->
		`
		expect(p.parse("《路加福音》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《路加福音 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路加福音》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《魯喀》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路加福音 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《路》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《魯喀 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("魯喀》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《路 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("魯喀 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《路加福音》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《路加福音 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路加福音》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《魯喀》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路加福音 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《路》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《魯喀 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("魯喀》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("《路 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路》 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("魯喀 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("路 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (zh)", ->
		`
		expect(p.parse("《伊望第一》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰壹書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰一书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰壹书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《若望一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《伊望第一 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰壹書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰一书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰壹书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《若望一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("伊望第一》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰壹書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰一书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰壹书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("若望一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("伊望第一 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰壹書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰一书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰壹书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("若望一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約壹 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约壹 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約壹 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约壹 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《伊望第一》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰壹書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰一书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰壹书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《若望一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《伊望第一 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約翰壹書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰一书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约翰壹书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《若望一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("伊望第一》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰壹書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰一书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰壹书》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("若望一書》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("伊望第一 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約翰壹書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰一书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约翰壹书 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("若望一書 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《約壹 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("《约壹 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约壹》 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("約壹 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("约壹 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (zh)", ->
		`
		expect(p.parse("《伊望第二》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰貳書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰二书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰贰书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《若望二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《伊望第二 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰貳書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰二书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰贰书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《若望二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("伊望第二》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰貳書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰二书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰贰书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("若望二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約貳》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约贰》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("伊望第二 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰貳書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰二书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰贰书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("若望二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約貳 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约贰 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約貳》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约贰》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約貳 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约贰 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《伊望第二》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰貳書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰二书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰贰书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《若望二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《伊望第二 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約翰貳書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰二书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约翰贰书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《若望二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("伊望第二》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰貳書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰二书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰贰书》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("若望二書》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約貳》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约贰》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("伊望第二 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約翰貳書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰二书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约翰贰书 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("若望二書 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《約貳 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("《约贰 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約貳》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约贰》 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("約貳 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("约贰 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (zh)", ->
		`
		expect(p.parse("《伊望第三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰參書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰三书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰叁书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《若望三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《伊望第三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰參書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰三书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰叁书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《若望三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("伊望第三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰參書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰三书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰叁书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("若望三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("伊望第三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰參書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰三书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰叁书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("若望三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约三 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《伊望第三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰參書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰三书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰叁书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《若望三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《伊望第三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約翰參書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰三书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约翰叁书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《若望三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("伊望第三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰參書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰三书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰叁书》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("若望三書》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("伊望第三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約翰參書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰三书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约翰叁书 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("若望三書 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《約三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("《约三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约三》 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("約三 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("约三 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (zh)", ->
		`
		expect(p.parse("《約翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《若望福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《約翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《若望福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("若望福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《伊望》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("若望福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《伊望 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《約》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("伊望》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《約 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("伊望 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《約翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《若望福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《約翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《若望福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约翰福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("若望福音》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《伊望》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约翰福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("若望福音 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《伊望 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《約》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("伊望》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《約 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("《约 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("伊望 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约》 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("約 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("约 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Rom (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (zh)", ->
		`
		expect(p.parse("《羅爾瑪書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗马书》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅爾瑪書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅馬書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅爾瑪書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗马书 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅馬書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗马书》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅爾瑪書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅馬書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗马书 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅馬書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《羅爾瑪書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗马书》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅爾瑪書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅馬書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅爾瑪書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗马书 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅馬書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗马书》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅爾瑪書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅馬書》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗马书 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅馬書 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《罗 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("《羅 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅》 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("罗 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("羅 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (zh)", ->
		`
		expect(p.parse("《哥林多后书》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《哥林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《格林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《歌林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《适凌爾福後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《哥林多后书 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《哥林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《格林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《歌林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《适凌爾福後 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多后书》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("格林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("歌林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("适凌爾福後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多后书 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("格林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("歌林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("适凌爾福後 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林后》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林后 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林後 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林后》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林后 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林後 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《哥林多后书》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《哥林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《格林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《歌林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《适凌爾福後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《哥林多后书 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《哥林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《格林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《歌林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《适凌爾福後 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多后书》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("格林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("歌林多後書》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("适凌爾福後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多后书 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("哥林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("格林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("歌林多後書 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("适凌爾福後 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林后》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林后 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("《林後 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林后》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林後》 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林后 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("林後 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (zh)", ->
		`
		expect(p.parse("《哥林多前书》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《哥林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《格林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《歌林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《适凌爾福前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《哥林多前书 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《哥林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《格林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《歌林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《适凌爾福前 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前书》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("格林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("歌林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("适凌爾福前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前书 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("格林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("歌林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("适凌爾福前 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《林前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《林前 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("林前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("林前 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《哥林多前书》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《哥林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《格林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《歌林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《适凌爾福前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《哥林多前书 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《哥林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《格林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《歌林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《适凌爾福前 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前书》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("格林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("歌林多前書》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("适凌爾福前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前书 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("哥林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("格林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("歌林多前書 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("适凌爾福前 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《林前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("《林前 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("林前》 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("林前 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Eph (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (zh)", ->
		`
		expect(p.parse("《以弗所书》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《以弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《厄弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《以弗所书 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《以弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《厄弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《耶斐斯》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所书》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("厄弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《耶斐斯 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所书 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("厄弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("耶斐斯》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《弗》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("耶斐斯 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《弗 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("弗》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("弗 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《以弗所书》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《以弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《厄弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《以弗所书 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《以弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《厄弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《耶斐斯》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所书》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("厄弗所書》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《耶斐斯 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所书 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("以弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("厄弗所書 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("耶斐斯》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《弗》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("耶斐斯 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("《弗 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("弗》 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("弗 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (zh)", ->
		`
		expect(p.parse("《斐理伯書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比书》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《斐理伯書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《肥利批》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比书 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("斐理伯書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比书》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《肥利批 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("斐理伯書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("肥利批》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比书 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("肥利批 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《斐理伯書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比书》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《斐理伯書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《肥利批》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比书 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓立比書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("斐理伯書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比书》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比書》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《肥利批 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("斐理伯書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("肥利批》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比书 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓立比書 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("肥利批 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("《腓 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓》 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("腓 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (zh)", ->
		`
		expect(p.parse("《哥羅森書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌罗西书》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌羅西書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《哥羅森書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌罗西书 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌羅西書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《适羅斯》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("哥羅森書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌罗西书》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌羅西書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《适羅斯 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("哥羅森書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌罗西书 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌羅西書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("适羅斯》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《西》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("适羅斯 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《西 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("西》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("西 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《哥羅森書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌罗西书》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌羅西書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《哥羅森書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌罗西书 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《歌羅西書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《适羅斯》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("哥羅森書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌罗西书》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌羅西書》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《适羅斯 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("哥羅森書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌罗西书 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("歌羅西書 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("适羅斯》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《西》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("适羅斯 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("《西 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("西》 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("西 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book GkEsth (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (zh)", ->
		`
		expect(p.parse("《GkEsth》 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth》 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("《GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (zh)", ->
		`
		expect(p.parse("《艾斯德爾傳》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖記》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖记》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《艾斯德爾傳 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("艾斯德爾傳》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖記 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖记 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖記》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖记》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("艾斯德爾傳 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖記 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖记 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《斯》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《斯 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("斯》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("斯 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《艾斯德爾傳》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖記》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖记》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《艾斯德爾傳 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("艾斯德爾傳》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖記 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《以斯帖记 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖記》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖记》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("艾斯德爾傳 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖記 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("以斯帖记 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《斯》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("《斯 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("斯》 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("斯 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Acts (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (zh)", ->
		`
		expect(p.parse("《宗徒大事錄》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行传》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行傳》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《宗徒大事錄 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《宗徒行實》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒大事錄》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行传 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行傳 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《宗徒行實 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行传》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行傳》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒大事錄 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒行實》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行传 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行傳 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒行實 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《徒》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《徒 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("徒》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("徒 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《宗徒大事錄》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行传》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行傳》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《宗徒大事錄 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《宗徒行實》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒大事錄》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行传 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《使徒行傳 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《宗徒行實 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行传》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行傳》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒大事錄 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒行實》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行传 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("使徒行傳 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("宗徒行實 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《徒》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("《徒 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("徒》 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("徒 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Tob (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (zh)", ->
		`
		expect(p.parse("《多俾亞傳》 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("《多俾亞傳 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("多俾亞傳》 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("多俾亞傳 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (zh)", ->
		`
		expect(p.parse("《友弟德傳》 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("《友弟德傳 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("友弟德傳》 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("友弟德傳 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Eccl (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (zh)", ->
		`
		expect(p.parse("《传道书》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳道書》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《訓道篇》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《传道书 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳道書 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《訓道篇 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传道书》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳道書》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("訓道篇》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《传》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传道书 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳道書 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("訓道篇 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《传 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《传道书》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳道書》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《訓道篇》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《传道书 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳道書 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《訓道篇 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传道书》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳道書》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("訓道篇》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《传》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传道书 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳道書 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("訓道篇 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《传 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("《傳 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳》 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("传 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("傳 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book 2Thess (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (zh)", ->
		`
		expect(p.parse("《帖撒罗尼迦后书》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖撒羅尼迦後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖撒罗尼迦后书 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖撒羅尼迦後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《得撒洛尼後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒罗尼迦后书》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒羅尼迦後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《得撒洛尼後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒罗尼迦后书 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒羅尼迦後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("得撒洛尼後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("得撒洛尼後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《莎倫後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖后》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《莎倫後 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("莎倫後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖后 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖後 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖后》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("莎倫後 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖后 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖後 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《帖撒罗尼迦后书》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖撒羅尼迦後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖撒罗尼迦后书 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖撒羅尼迦後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《得撒洛尼後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒罗尼迦后书》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒羅尼迦後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《得撒洛尼後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒罗尼迦后书 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖撒羅尼迦後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("得撒洛尼後書》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("得撒洛尼後書 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《莎倫後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖后》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《莎倫後 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("莎倫後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖后 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("《帖後 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖后》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖後》 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("莎倫後 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖后 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("帖後 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (zh)", ->
		`
		expect(p.parse("《帖撒罗尼迦前书》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖撒羅尼迦前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖撒罗尼迦前书 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖撒羅尼迦前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《得撒洛尼前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒罗尼迦前书》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒羅尼迦前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《得撒洛尼前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒罗尼迦前书 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒羅尼迦前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("得撒洛尼前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("得撒洛尼前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《莎倫前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《莎倫前 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("莎倫前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖前 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("莎倫前 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖前 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《帖撒罗尼迦前书》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖撒羅尼迦前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖撒罗尼迦前书 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖撒羅尼迦前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《得撒洛尼前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒罗尼迦前书》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒羅尼迦前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《得撒洛尼前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒罗尼迦前书 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖撒羅尼迦前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("得撒洛尼前書》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("得撒洛尼前書 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《莎倫前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《莎倫前 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("莎倫前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("《帖前 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖前》 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("莎倫前 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("帖前 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (zh)", ->
		`
		expect(p.parse("《弟茂德後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太后书》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《弟茂德後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太后书 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩斐後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("弟茂德後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太后书》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩斐後 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("弟茂德後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太后书 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩斐後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提后》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩斐後 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提后 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提後 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提后》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提后 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提後 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《弟茂德後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太后书》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《弟茂德後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太后书 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩太後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩斐後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("弟茂德後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太后书》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太後書》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提摩斐後 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("弟茂德後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太后书 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩太後書 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩斐後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提后》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提摩斐後 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提后 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("《提後 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提后》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提後》 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提后 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("提後 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (zh)", ->
		`
		expect(p.parse("《弟茂德前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前书》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《弟茂德前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前书 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩斐前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("弟茂德前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前书》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩斐前 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("弟茂德前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前书 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩斐前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩斐前 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提前 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提前 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《弟茂德前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前书》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《弟茂德前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前书 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩太前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩斐前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("弟茂德前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前书》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前書》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提摩斐前 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("弟茂德前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前书 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩太前書 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩斐前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提摩斐前 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("《提前 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提前》 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("提前 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (zh)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《弟鐸書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多书》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提特書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《弟鐸書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多书 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提特書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("弟鐸書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多书》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提特書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《多》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("弟鐸書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多书 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提特書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《多 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("多》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("多 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《弟鐸書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多书》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提特書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《弟鐸書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多书 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提多書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《提特書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("弟鐸書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多书》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提特書》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《多》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("弟鐸書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多书 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提多書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("提特書 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("《多 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("多》 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("多 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (zh)", ->
		`
		expect(p.parse("《腓利門書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《腓利门书》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《費肋孟書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《肥利孟》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《腓利門書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《腓利门书 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《費肋孟書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利門書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利门书》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("費肋孟書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《肥利孟 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("肥利孟》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利門書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利门书 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("費肋孟書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《門》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《门》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("肥利孟 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《門 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《门 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("門》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("门》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("門 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("门 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《腓利門書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《腓利门书》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《費肋孟書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《肥利孟》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《腓利門書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《腓利门书 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《費肋孟書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利門書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利门书》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("費肋孟書》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《肥利孟 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("肥利孟》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利門書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("腓利门书 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("費肋孟書 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《門》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《门》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("肥利孟 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《門 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("《门 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("門》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("门》 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("門 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("门 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (zh)", ->
		`
		expect(p.parse("《希伯來书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯來書》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯来书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《耶烏雷爾》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯來书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯來書 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯来书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《耶烏雷爾 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來書》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯来书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("耶烏雷爾》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來書 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯来书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("耶烏雷爾 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《來》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《来》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《來 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《来 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("來》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("来》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("來 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("来 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《希伯來书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯來書》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯来书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《耶烏雷爾》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯來书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯來書 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《希伯来书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《耶烏雷爾 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來書》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯来书》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("耶烏雷爾》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯來書 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("希伯来书 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("耶烏雷爾 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《來》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《来》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《來 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("《来 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("來》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("来》 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("來 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("来 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (zh)", ->
		`
		expect(p.parse("《雅各伯書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《亞适烏》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各书》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各伯書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各伯書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《亞适烏 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各书 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("亞适烏》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各书》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各伯書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("亞适烏 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各书 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《雅各伯書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《亞适烏》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各书》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各伯書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各伯書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《亞适烏 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各书 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅各書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("亞适烏》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各书》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各伯書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各書》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("亞适烏 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各书 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅各書 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("《雅 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅》 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("雅 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (zh)", ->
		`
		expect(p.parse("《伯多祿後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《伯多祿後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得后书》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《撇特爾後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("伯多祿後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得后书 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《撇特爾後 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("伯多祿後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得后书》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("撇特爾後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼后》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得后书 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("撇特爾後 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼后 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼後 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼后》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼后 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼後 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《伯多祿後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《伯多祿後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得后书》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《撇特爾後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("伯多祿後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得后书 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼得後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《撇特爾後 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("伯多祿後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得后书》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得後書》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("撇特爾後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼后》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得后书 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼得後書 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("撇特爾後 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼后 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("《彼後 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼后》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼後》 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼后 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("彼後 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (zh)", ->
		`
		expect(p.parse("《伯多祿前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《伯多祿前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前书》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《撇特爾前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("伯多祿前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前书 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《撇特爾前 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("伯多祿前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前书》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("撇特爾前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前书 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("撇特爾前 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼前 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼前 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《伯多祿前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《伯多祿前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前书》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《撇特爾前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("伯多祿前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前书 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼得前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《撇特爾前 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("伯多祿前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前书》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前書》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("撇特爾前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前书 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼得前書 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("撇特爾前 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("《彼前 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼前》 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("彼前 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (zh)", ->
		`
		expect(p.parse("《伊屋達》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹大书》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶大書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶達書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《伊屋達 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹大书 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶大書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶達書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("伊屋達》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹大书》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶大書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶達書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("伊屋達 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹大书 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶大書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶達書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《伊屋達》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹大书》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶大書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶達書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《伊屋達 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹大书 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶大書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶達書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("伊屋達》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹大书》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶大書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶達書》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("伊屋達 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹大书 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶大書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶達書 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《犹 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("《猶 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶》 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("犹 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("猶 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Bar (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (zh)", ->
		`
		expect(p.parse("《巴路克》 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("《巴路克 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("巴路克》 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("巴路克 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (zh)", ->
		`
		expect(p.parse("《Sus》 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus》 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("《Sus 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (zh)", ->
		`
		expect(p.parse("《瑪加伯下》 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("《瑪加伯下 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("瑪加伯下》 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("瑪加伯下 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (zh)", ->
		`
		expect(p.parse("《3Macc》 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc》 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("《3Macc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (zh)", ->
		`
		expect(p.parse("《4Macc》 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc》 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("《4Macc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (zh)", ->
		`
		expect(p.parse("《瑪加伯上》 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("《瑪加伯上 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("瑪加伯上》 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("瑪加伯上 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book Josh (zh)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (zh)", ->
		`
		expect(p.parse("《約書亞記》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《约书亚记》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《若蘇厄書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《約書亞記 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《约书亚记 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《若蘇厄書 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("約書亞記》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("约书亚记》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("若蘇厄書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("約書亞記 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("约书亚记 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("若蘇厄書 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《书》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《书 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《書 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("书》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("书 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("書 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("《約書亞記》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《约书亚记》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《若蘇厄書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《約書亞記 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《约书亚记 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《若蘇厄書 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("約書亞記》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("约书亚记》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("若蘇厄書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("約書亞記 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("约书亚记 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("若蘇厄書 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《书》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《书 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("《書 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("书》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("書》 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("书 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("書 1:1").osis()).toEqual("Josh.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (zh)", ->
		expect(p.parse("Titus 1:1 ～ 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1～2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 ～ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
		expect(p.parse("Titus 1:1 ~ 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1~2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 ~ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (zh)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (zh)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (zh)", ->
		expect(p.parse("Exod 1:1 ； 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ； 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 ， 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ， 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 參 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 參 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 、 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 、 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (zh)", ->
		expect(p.parse("Ps 3 篇, 4:2, 5:篇").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 篇, 4:2, 5:篇").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (zh)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (zh)", ->
		expect(p.parse("Lev 1 (CUV)").osis_and_translations()).toEqual [["Lev.1", "CUV"]]
		expect(p.parse("lev 1 cuv").osis_and_translations()).toEqual [["Lev.1", "CUV"]]
		expect(p.parse("Lev 1 (CNV)").osis_and_translations()).toEqual [["Lev.1", "CNV"]]
		expect(p.parse("lev 1 cnv").osis_and_translations()).toEqual [["Lev.1", "CNV"]]
		expect(p.parse("Lev 1 (CUVMP)").osis_and_translations()).toEqual [["Lev.1", "CUVMP"]]
		expect(p.parse("lev 1 cuvmp").osis_and_translations()).toEqual [["Lev.1", "CUVMP"]]
	it "should handle boundaries (zh)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

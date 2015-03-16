bcv_parser = require("../../js/sr_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (sr)", ->
		`
		expect(p.parse("Прва Мојсијева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Мојсијева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Мојсијева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Мојсијева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Мојсијева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Прва Мојс 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Мојс 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Мојс 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Постање 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Мојс 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Мојс 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Пост 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА МОЈСИЈЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. МОЈСИЈЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. МОЈСИЈЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 МОЈСИЈЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I МОЈСИЈЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ПРВА МОЈС 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. МОЈС 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. МОЈС 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ПОСТАЊЕ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 МОЈС 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I МОЈС 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ПОСТ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (sr)", ->
		`
		expect(p.parse("Друга Мојсијева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Мојсијева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Мојсијева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Мојсијева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Мојсијева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Друга Мојс 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Мојс 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Мојс 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Мојс 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Егзодус 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Излазак 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Мојс 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Изл 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА МОЈСИЈЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. МОЈСИЈЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. МОЈСИЈЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II МОЈСИЈЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 МОЈСИЈЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ДРУГА МОЈС 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. МОЈС 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. МОЈС 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II МОЈС 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ЕГЗОДУС 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ИЗЛАЗАК 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 МОЈС 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ИЗЛ 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (sr)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (sr)", ->
		`
		expect(p.parse("Трећом Мојсијева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Трећа Мојсијева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Мојсијева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Мојсијева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Мојсијева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Мојсијева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Трећом Мојс 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Трећа Мојс 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Мојс 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Мојс 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Левитска 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Мојс 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Мојс 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Лев 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ТРЕЋОМ МОЈСИЈЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ТРЕЋА МОЈСИЈЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. МОЈСИЈЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III МОЈСИЈЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. МОЈСИЈЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 МОЈСИЈЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ТРЕЋОМ МОЈС 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ТРЕЋА МОЈС 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. МОЈС 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III МОЈС 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ЛЕВИТСКА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. МОЈС 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 МОЈС 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ЛЕВ 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (sr)", ->
		`
		expect(p.parse("Четврта Мојсијева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Мојсијева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Мојсијева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Мојсијева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Четврта Мојс 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Мојсијева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Мојс 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Мојс 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Мојс 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Бројеви 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Мојс 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Бр 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЧЕТВРТА МОЈСИЈЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. МОЈСИЈЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. МОЈСИЈЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV МОЈСИЈЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ЧЕТВРТА МОЈС 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 МОЈСИЈЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. МОЈС 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. МОЈС 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV МОЈС 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("БРОЈЕВИ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 МОЈС 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("БР 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (sr)", ->
		`
		expect(p.parse("Премудрости Исуса сина Сирахова 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Еклезијастикус 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Сирина 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("ИсС 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Сир 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (sr)", ->
		`
		expect(p.parse("Премудорсти Соломонове 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Мудрости Соломонове 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Мудрости 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Прем Сол 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (sr)", ->
		`
		expect(p.parse("Плач Јеремијин 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плач 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЛАЧ ЈЕРЕМИЈИН 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (sr)", ->
		`
		expect(p.parse("Посланица Јеремијина 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Писма Јеремије 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (sr)", ->
		`
		expect(p.parse("Откривење Јованово 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровење Јованово 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откривење 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Отк 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОТКРИВЕЊЕ ЈОВАНОВО 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕЊЕ ЈОВАНОВО 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРИВЕЊЕ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТК 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (sr)", ->
		`
		expect(p.parse("Молитва Манасијина 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (sr)", ->
		`
		expect(p.parse("Поновљени закони 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Пета Мојсијева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Мојсијева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Мојсијева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Мојсијева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Мојсијева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Пета Мојс 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Мојс 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Мојс 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Мојс 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Мојс 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Понз 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОНОВЉЕНИ ЗАКОНИ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ПЕТА МОЈСИЈЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. МОЈСИЈЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. МОЈСИЈЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 МОЈСИЈЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V МОЈСИЈЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ПЕТА МОЈС 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. МОЈС 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. МОЈС 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 МОЈС 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V МОЈС 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ПОНЗ 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (sr)", ->
		`
		expect(p.parse("Исус Навин 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИНав 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ИСУС НАВИН 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИНАВ 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (sr)", ->
		`
		expect(p.parse("Судија 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Судије 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Суд 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("СУДИЈА 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("СУДИЈЕ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("СУД 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (sr)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Рута 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Рут 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("РУТА 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("РУТ 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (sr)", ->
		`
		expect(p.parse("Прва Јездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Прва Ездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Јездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Јездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Јездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Јездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ездрина 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Јез 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (sr)", ->
		`
		expect(p.parse("Друга Јездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Друга Ездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Јездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Јездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Јездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Јездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ездрина 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Јез 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (sr)", ->
		`
		expect(p.parse("Исаија 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ис 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ИСАИЈА 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ИС 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (sr)", ->
		`
		expect(p.parse("Друга Самуилова 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Друга краљевима 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Самуилова 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. краљевима 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Самуилова 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. краљевима 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Самуилова 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II краљевима 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Самуилова 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 краљевима 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Сам 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ДРУГА КРАЉЕВИМА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. КРАЉЕВИМА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. КРАЉЕВИМА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II КРАЉЕВИМА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 САМУИЛОВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 КРАЉЕВИМА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 САМ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (sr)", ->
		`
		expect(p.parse("Прва Самуилова 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Прва краљевима 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Самуилова 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. краљевима 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Самуилова 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. краљевима 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Самуилова 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 краљевима 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Самуилова 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I краљевима 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Сам 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ПРВА КРАЉЕВИМА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. КРАЉЕВИМА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. КРАЉЕВИМА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 КРАЉЕВИМА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I САМУИЛОВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I КРАЉЕВИМА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 САМ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (sr)", ->
		`
		expect(p.parse("Четврта краљевства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Четврта краљевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Друга о царевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. о царевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. краљевства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. о царевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. краљевства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II о царевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV краљевства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. краљевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Друга краљева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 о царевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 краљевства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. краљевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV краљевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Друга Царева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 краљевима 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. краљева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. краљева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II краљева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Царева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 краљева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Царева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Царева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Царева 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Цар 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЧЕТВРТА КРАЉЕВСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ЧЕТВРТА КРАЉЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ДРУГА О ЦАРЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. О ЦАРЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. КРАЉЕВСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. О ЦАРЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. КРАЉЕВСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II О ЦАРЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV КРАЉЕВСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. КРАЉЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ДРУГА КРАЉЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 О ЦАРЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 КРАЉЕВСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. КРАЉЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV КРАЉЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ДРУГА ЦАРЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 КРАЉЕВИМА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. КРАЉЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. КРАЉЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II КРАЉЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. ЦАРЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 КРАЉЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. ЦАРЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II ЦАРЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ЦАРЕВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ЦАР 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (sr)", ->
		`
		expect(p.parse("Трећом краљевства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трећа краљевства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трећом краљевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. краљевства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Прва о царевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трећа краљевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III краљевства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. краљевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. о царевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. краљевства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. о царевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III краљевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 о царевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 краљевства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. краљевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I о царевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Прва краљева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 краљевима 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Прва Царева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. краљева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. краљева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 краљева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Царева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I краљева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Царева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Царева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Царева 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Цар 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ТРЕЋОМ КРАЉЕВСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕЋА КРАЉЕВСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕЋОМ КРАЉЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. КРАЉЕВСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ПРВА О ЦАРЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕЋА КРАЉЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III КРАЉЕВСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. КРАЉЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. О ЦАРЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. КРАЉЕВСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. О ЦАРЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III КРАЉЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 О ЦАРЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 КРАЉЕВСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. КРАЉЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I О ЦАРЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ПРВА КРАЉЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 КРАЉЕВИМА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ПРВА ЦАРЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. КРАЉЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. КРАЉЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 КРАЉЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. ЦАРЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I КРАЉЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. ЦАРЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ЦАРЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I ЦАРЕВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ЦАР 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (sr)", ->
		`
		expect(p.parse("Друга Паралипоменону 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Паралипоменону 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Паралипоменону 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Паралипоменону 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Паралипоменону 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Друга дневника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Друга хроника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. дневника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. дневника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II дневника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. хроника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Дневника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 дневника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. хроника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II хроника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 хроника 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 хрон 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Дн 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ДРУГА ДНЕВНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ДРУГА ХРОНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. ДНЕВНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ДНЕВНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II ДНЕВНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. ХРОНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ДНЕВНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ДНЕВНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ХРОНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II ХРОНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ХРОНИКА 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ХРОН 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ДН 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (sr)", ->
		`
		expect(p.parse("Прва Паралипоменону 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Паралипоменону 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Паралипоменону 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Паралипоменону 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Паралипоменону 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Прва дневника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Прва хроника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. дневника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. дневника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Дневника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 дневника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. хроника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I дневника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. хроника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 хроника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I хроника 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 хрон 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Дн 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I ПАРАЛИПОМЕНОНУ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПРВА ДНЕВНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПРВА ХРОНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ДНЕВНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. ДНЕВНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ДНЕВНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ДНЕВНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ХРОНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I ДНЕВНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. ХРОНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ХРОНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I ХРОНИКА 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ХРОН 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ДН 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (sr)", ->
		`
		expect(p.parse("Јездра 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Езрина 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Езр 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕЗДРА 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ЕЗРИНА 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ЕЗР 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (sr)", ->
		`
		expect(p.parse("Немија 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Нем 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("НЕМИЈА 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("НЕМ 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (sr)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (sr)", ->
		`
		expect(p.parse("Јестира 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Естер 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Јест 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕСТИРА 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ЕСТЕР 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ЈЕСТ 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (sr)", ->
		`
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Јов 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ЈОВ 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (sr)", ->
		`
		expect(p.parse("Псалми Давидови 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Псалам 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Псалми 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Пс 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПСАЛМИ ДАВИДОВИ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ПСАЛАМ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ПСАЛМИ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ПС 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (sr)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (sr)", ->
		`
		expect(p.parse("Приче Соломонове 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Приче Соломунове 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Изреке 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Пр 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРИЧЕ СОЛОМОНОВЕ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ПРИЧЕ СОЛОМУНОВЕ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ИЗРЕКЕ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ПР 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (sr)", ->
		`
		expect(p.parse("Проповедник 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Проп 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРОПОВЕДНИК 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ПРОП 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (sr)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (sr)", ->
		`
		expect(p.parse("Песма над песмама 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Песма Соломонова 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Пнп 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЕСМА НАД ПЕСМАМА 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ПЕСМА СОЛОМОНОВА 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ПНП 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (sr)", ->
		`
		expect(p.parse("Јеремија 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Јер 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕРЕМИЈА 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ЈЕР 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (sr)", ->
		`
		expect(p.parse("Језекиљ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Јез 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕЗЕКИЉ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ЈЕЗ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (sr)", ->
		`
		expect(p.parse("Данило 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Дан 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДАНИЛО 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ДАН 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (sr)", ->
		`
		expect(p.parse("Осија 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Хошеа 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ос 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОСИЈА 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ХОШЕА 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ОС 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (sr)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Јоил 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Јоиљ 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ЈОИЛ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ЈОИЉ 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (sr)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Амос 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Ам 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("АМОС 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("АМ 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (sr)", ->
		`
		expect(p.parse("Авдија 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Авдије 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Авд 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("АВДИЈА 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("АВДИЈЕ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("АВД 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (sr)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Јона 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ЈОНА 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (sr)", ->
		`
		expect(p.parse("Михеј 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Мих 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("МИХЕЈ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("МИХ 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (sr)", ->
		`
		expect(p.parse("Наум 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("НАУМ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (sr)", ->
		`
		expect(p.parse("Авакум 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Ав 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("АВАКУМ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("АВ 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (sr)", ->
		`
		expect(p.parse("Софонија 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Софоније 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Соф 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("СОФОНИЈА 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("СОФОНИЈЕ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("СОФ 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (sr)", ->
		`
		expect(p.parse("Агеј 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Аг 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("АГЕЈ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("АГ 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (sr)", ->
		`
		expect(p.parse("Захарија 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Зах 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЗАХАРИЈА 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ЗАХ 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (sr)", ->
		`
		expect(p.parse("Малахија 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Мал 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("МАЛАХИЈА 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("МАЛ 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (sr)", ->
		`
		expect(p.parse("Јеванђеље по Матеју 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Еванђеље по Матеју 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Матеја 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Матеј 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Мт 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕВАНЂЕЉЕ ПО МАТЕЈУ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ЕВАНЂЕЉЕ ПО МАТЕЈУ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("МАТЕЈА 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("МАТЕЈ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("МТ 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book 2Macc (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (sr)", ->
		`
		expect(p.parse("Друга Макабејаца 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Друга Макавејска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Макабејаца 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Макавејска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Друга Макавеја 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Макабејаца 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Макавејска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Макабејаца 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Макавејска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Макабејаца 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Макавејска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Макавеја 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Макавеја 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Макавеја 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Макавеја 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Мк 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (sr)", ->
		`
		expect(p.parse("Трећом Макабејаца 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трећом Макавејска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трећа Макабејаца 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трећа Макавејска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Макабејаца 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Макавејска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трећом Макавеја 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Макабејаца 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Макавејска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трећа Макавеја 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Макабејаца 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Макавејска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Макавеја 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Макабејаца 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Макавејска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Макавеја 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Макавеја 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Макавеја 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Мк 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (sr)", ->
		`
		expect(p.parse("Четврта Макабејаца 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Четврта Макавејска 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Четврта Макавеја 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Макабејаца 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Макавејска 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Макабејаца 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Макавејска 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Макабејаца 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Макавејска 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Макабејаца 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Макавејска 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Макавеја 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Макавеја 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Макавеја 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Макавеја 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Мк 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (sr)", ->
		`
		expect(p.parse("Прва Макабејаца 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Прва Макавејска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Макабејаца 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Макавејска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Макабејаца 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Макавејска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Прва Макавеја 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Макабејаца 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Макавејска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Макабејаца 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Макавејска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Макавеја 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Макавеја 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Макавеја 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Макавеја 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Мк 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book Mark (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (sr)", ->
		`
		expect(p.parse("Јеванђеље по Марку 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Еванђеље по Марку 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Маркo 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Марко 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Мк 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕВАНЂЕЉЕ ПО МАРКУ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ЕВАНЂЕЉЕ ПО МАРКУ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("МАРКO 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("МАРКО 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("МК 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (sr)", ->
		`
		expect(p.parse("Јеванђеље по Луки 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Еванђеље по Луки 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Лукa 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Лука 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Лк 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕВАНЂЕЉЕ ПО ЛУКИ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ЕВАНЂЕЉЕ ПО ЛУКИ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ЛУКA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ЛУКА 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ЛК 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (sr)", ->
		`
		expect(p.parse("Прва посланица Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. посланица Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. посланица Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 посланица Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I посланица Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Прва Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Јованова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Јн 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПРВА ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I ЈОВАНОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ЈН 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (sr)", ->
		`
		expect(p.parse("Друга посланица Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. посланица Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. посланица Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II посланица Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 посланица Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Друга Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Јованова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Јн 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ДРУГА ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ЈОВАНОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ЈН 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (sr)", ->
		`
		expect(p.parse("Трећом посланица Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трећа посланица Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. посланица Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III посланица Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. посланица Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 посланица Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трећом Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трећа Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Јованова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Јн 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ТРЕЋОМ ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕЋА ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ПОСЛАНИЦА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕЋОМ ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕЋА ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ЈОВАНОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ЈН 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (sr)", ->
		`
		expect(p.parse("Јеванђеље по Јовану 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Еванђеље по Јовану 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Јован 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Јн 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЈЕВАНЂЕЉЕ ПО ЈОВАНУ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ЕВАНЂЕЉЕ ПО ЈОВАНУ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ЈОВАН 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ЈН 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (sr)", ->
		`
		expect(p.parse("Дела Апостолска 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Дела 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Дап 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДЕЛА АПОСТОЛСКА 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДЕЛА 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДАП 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (sr)", ->
		`
		expect(p.parse("Посланица Римљанима 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Римљанима 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Рим 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА РИМЉАНИМА 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("РИМЉАНИМА 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("РИМ 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (sr)", ->
		`
		expect(p.parse("Друга посланица Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. посланица Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. посланица Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II посланица Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 посланица Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Друга Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Коринћанима 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Кор 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ДРУГА КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 КОРИНЋАНИМА 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 КОР 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (sr)", ->
		`
		expect(p.parse("Прва посланица Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. посланица Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. посланица Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 посланица Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I посланица Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Прва Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Коринћанима 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Кор 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I ПОСЛАНИЦА КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПРВА КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I КОРИНЋАНИМА 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 КОР 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (sr)", ->
		`
		expect(p.parse("Посланица Галаћанима 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Посланица Галатима 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Галаћанима 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Галатима 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Гал 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ГАЛАЋАНИМА 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ПОСЛАНИЦА ГАЛАТИМА 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ГАЛАЋАНИМА 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ГАЛАТИМА 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ГАЛ 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (sr)", ->
		`
		expect(p.parse("Посланица Ефесцима 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ефесцима 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Еф 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ЕФЕСЦИМА 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ЕФЕСЦИМА 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ЕФ 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (sr)", ->
		`
		expect(p.parse("Посланица Филипљанима 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Филипљанима 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Флп 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ФИЛИПЉАНИМА 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ФИЛИПЉАНИМА 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ФЛП 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (sr)", ->
		`
		expect(p.parse("Посланица Колошанима 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Колошанима 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Кол 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА КОЛОШАНИМА 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("КОЛОШАНИМА 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("КОЛ 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (sr)", ->
		`
		expect(p.parse("Друга посланица Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. посланица Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. посланица Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II посланица Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 посланица Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Друга Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Солуњанима 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Сол 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ДРУГА СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 СОЛУЊАНИМА 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 СОЛ 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (sr)", ->
		`
		expect(p.parse("Прва посланица Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. посланица Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. посланица Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 посланица Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I посланица Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Прва Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Солуњанима 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Сол 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I ПОСЛАНИЦА СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПРВА СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I СОЛУЊАНИМА 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 СОЛ 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (sr)", ->
		`
		expect(p.parse("Друга посланица Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. посланица Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. посланица Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II посланица Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 посланица Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Друга Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Тимотеју 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Тим 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ДРУГА ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ТИМОТЕЈУ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ТИМ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (sr)", ->
		`
		expect(p.parse("Прва посланица Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. посланица Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. посланица Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 посланица Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I посланица Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Прва Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Тимотеју 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Тим 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I ПОСЛАНИЦА ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПРВА ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I ТИМОТЕЈУ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ТИМ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (sr)", ->
		`
		expect(p.parse("Посланица Титу 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Титу 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Тит 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ТИТУ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ТИТУ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ТИТ 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (sr)", ->
		`
		expect(p.parse("Посланица Филимону 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Филимону 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Фил 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ФИЛИМОНУ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ФИЛИМОНУ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ФИЛ 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (sr)", ->
		`
		expect(p.parse("Посланица Јеврејима 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Јеврејима 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Јев 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ЈЕВРЕЈИМА 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ЈЕВРЕЈИМА 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ЈЕВ 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (sr)", ->
		`
		expect(p.parse("Посланица Јаковљева 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Јаковљева 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Јаковова 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Јаков 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Јак 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ЈАКОВЉЕВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ЈАКОВЉЕВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ЈАКОВОВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ЈАКОВ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ЈАК 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (sr)", ->
		`
		expect(p.parse("Друга посланица Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. посланица Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. посланица Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II посланица Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 посланица Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Друга Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Петрова 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Петр 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Пет 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДРУГА ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ДРУГА ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТРОВА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (sr)", ->
		`
		expect(p.parse("Прва посланица Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. посланица Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. посланица Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 посланица Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I посланица Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Прва Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Петрова 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Петр 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Пет 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПРВА ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I ПОСЛАНИЦА ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПРВА ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I ПЕТРОВА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (sr)", ->
		`
		expect(p.parse("Посланица Јудина 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Јаковљевог 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Јудина 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Јуде 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Јд 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЦА ЈУДИНА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ЈАКОВЉЕВОГ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ЈУДИНА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ЈУДЕ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ЈД 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (sr)", ->
		`
		expect(p.parse("Књига Товијина 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Тобија 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Товит 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Тов 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (sr)", ->
		`
		expect(p.parse("Књига о Јудити 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Јудита 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Јуд 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (sr)", ->
		`
		expect(p.parse("Барух 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Варух 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Вар 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (sr)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (sr)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (sr)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (sr)", ->
		expect(p.parse("Titus 1:1, поглавља 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 ПОГЛАВЉА 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, глава 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 ГЛАВА 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (sr)", ->
		expect(p.parse("Exod 1:1 стихови 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm СТИХОВИ 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 стих 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm СТИХ 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (sr)", ->
		expect(p.parse("Exod 1:1 и 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 И 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (sr)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (sr)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (sr)", ->
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
	it "should handle book ranges (sr)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Прва - Трећом  Јованова").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (sr)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

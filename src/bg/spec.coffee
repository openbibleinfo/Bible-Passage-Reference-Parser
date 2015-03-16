bcv_parser = require("../../js/bg_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (bg)", ->
		`
		expect(p.parse("Първа книга Моисеева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Първа Моисеева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Моисеева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Моисеева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Моисеева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Моисеева 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Битие 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Бит 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВА КНИГА МОИСЕЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ПЪРВА МОИСЕЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. МОИСЕЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. МОИСЕЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 МОИСЕЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I МОИСЕЕВА 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("БИТИЕ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("БИТ 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (bg)", ->
		`
		expect(p.parse("Втора книга Моисеева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Втора Моисеева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Моисеева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Моисеева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Моисеева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Моисеева 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Изход 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Изх 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРА КНИГА МОИСЕЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ВТОРА МОИСЕЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. МОИСЕЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. МОИСЕЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II МОИСЕЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 МОИСЕЕВА 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ИЗХОД 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ИЗХ 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (bg)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Бел 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (bg)", ->
		`
		expect(p.parse("Трета книга Моисеева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Трето Моисеева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Моисеева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Моисеева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Моисеева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Моисеева 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Левит 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Лев 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ТРЕТА КНИГА МОИСЕЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ТРЕТО МОИСЕЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. МОИСЕЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III МОИСЕЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. МОИСЕЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 МОИСЕЕВА 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ЛЕВИТ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ЛЕВ 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (bg)", ->
		`
		expect(p.parse("Четвърта книга Моисеева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Четвърта Моисеева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Моисеева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Моисеева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Моисеева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Моисеева 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Числа 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Чис 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЧЕТВЪРТА КНИГА МОИСЕЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ЧЕТВЪРТА МОИСЕЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. МОИСЕЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. МОИСЕЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV МОИСЕЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 МОИСЕЕВА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ЧИСЛА 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ЧИС 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (bg)", ->
		`
		expect(p.parse("Книга Премъдрост на Иисуса, син Сирахов 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Премъдрост на Иисус, син Сирахов 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Книга на Сирах 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Сирахов 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (bg)", ->
		`
		expect(p.parse("Книга Премъдрост Соломонова 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Премъдрост Соломонова 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Книга на мъдростта 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Премъдрост 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (bg)", ->
		`
		expect(p.parse("Книга Плач Иеремиев 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плачът на Иеремия 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плачът на Йеремия 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плачът на Еремия 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плач Иеремиев 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плач Еремиев 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П. Иер 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П. Йер 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П Иер 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П Йер 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Плач 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА ПЛАЧ ИЕРЕМИЕВ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧЪТ НА ИЕРЕМИЯ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧЪТ НА ЙЕРЕМИЯ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧЪТ НА ЕРЕМИЯ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧ ИЕРЕМИЕВ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧ ЕРЕМИЕВ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П. ИЕР 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П. ЙЕР 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П ИЕР 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("П ЙЕР 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ПЛАЧ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (bg)", ->
		`
		expect(p.parse("Послание на Иеремия 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (bg)", ->
		`
		expect(p.parse("Откровение на св. Иоана Богослова 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровение на св Иоана Богослова 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровението на Иоан 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровението на Йоан 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровение на Иоан 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровение на Йоан 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Апокалипсис 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откровение 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Откр 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОТКРОВЕНИЕ НА СВ. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕНИЕ НА СВ ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕНИЕТО НА ИОАН 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕНИЕТО НА ЙОАН 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕНИЕ НА ИОАН 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕНИЕ НА ЙОАН 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("АПОКАЛИПСИС 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКРОВЕНИЕ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ОТКР 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (bg)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (bg)", ->
		`
		expect(p.parse("Пета книга Моисеева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Второзаконие 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Моисеева 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Второзак 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Вт 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЕТА КНИГА МОИСЕЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ВТОРОЗАКОНИЕ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 МОИСЕЕВА 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ВТОРОЗАК 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ВТ 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (bg)", ->
		`
		expect(p.parse("Книга на Исус Навиев 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Книга Иисус Навин 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Иисус Навин 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Исус Навиев 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Исус Навин 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Ис. Нав 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Ис Нав 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("И. Н 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("И Н 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ИСУС НАВИЕВ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("КНИГА ИИСУС НАВИН 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИИСУС НАВИН 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИСУС НАВИЕВ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИСУС НАВИН 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИС. НАВ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ИС НАВ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("И. Н 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("И Н 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (bg)", ->
		`
		expect(p.parse("Книга Съдии Израилеви 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Книга на съдиите 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Съдии Израилеви 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Съдии 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Съд 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА СЪДИИ ИЗРАИЛЕВИ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("КНИГА НА СЪДИИТЕ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("СЪДИИ ИЗРАИЛЕВИ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("СЪДИИ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("СЪД 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (bg)", ->
		`
		expect(p.parse("Книга Рут 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Рут 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА РУТ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("РУТ 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (bg)", ->
		`
		expect(p.parse("Първа книга на Ездра 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Първа Ездра 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ездра 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ездра 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ездра 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ездра 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (bg)", ->
		`
		expect(p.parse("Втора книга на Ездра 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Втора Ездра 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ездра 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ездра 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ездра 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ездра 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (bg)", ->
		`
		expect(p.parse("Книга на пророк Исаия 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Исаия 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Исая 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ис 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ИСАИЯ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ИСАИЯ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ИСАЯ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ИС 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (bg)", ->
		`
		expect(p.parse("Втора Книга на царете 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Втора книга на Самуил 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Книга на царете 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Втора книга Царства 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Книга на царете 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Книга на царете 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Книга на царете 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Втора Царства 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Втора Самуил 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Царства 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Царства 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Царства 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Самуил 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Втора Царе 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Царства 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Самуил 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Самуил 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Самуил 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Царе 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Царе 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Царе 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Царе 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Ц 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРА КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ВТОРА КНИГА НА САМУИЛ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ВТОРА КНИГА ЦАРСТВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ВТОРА ЦАРСТВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ВТОРА САМУИЛ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. ЦАРСТВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. ЦАРСТВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II ЦАРСТВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. САМУИЛ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ВТОРА ЦАРЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ЦАРСТВА 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. САМУИЛ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II САМУИЛ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 САМУИЛ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. ЦАРЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. ЦАРЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II ЦАРЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ЦАРЕ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Ц 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (bg)", ->
		`
		expect(p.parse("Първа Книга на царете 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Първа книга на Самуил 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Първа книга Царства 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Книга на царете 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Книга на царете 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Книга на царете 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Книга на царете 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Първа Царства 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Първа Самуил 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Царства 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Царства 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Първа Царе 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Царства 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Самуил 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Царства 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Самуил 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Самуил 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Самуил 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Царе 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Царе 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Царе 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Царе 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Ц 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВА КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ПЪРВА КНИГА НА САМУИЛ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ПЪРВА КНИГА ЦАРСТВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ПЪРВА ЦАРСТВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ПЪРВА САМУИЛ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. ЦАРСТВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. ЦАРСТВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ПЪРВА ЦАРЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ЦАРСТВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. САМУИЛ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I ЦАРСТВА 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. САМУИЛ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 САМУИЛ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I САМУИЛ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. ЦАРЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. ЦАРЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ЦАРЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I ЦАРЕ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Ц 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (bg)", ->
		`
		expect(p.parse("Четвърта Книга на царете 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Четвърта книга на царете 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Четвърта книга Царства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Книга на царете 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Книга на царете 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Книга на царете 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Книга на царете 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Четвърта Царства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Четвърта Царе 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Царства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Царства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Царства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Царства 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Царе 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Царе 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Царе 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Царе 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Ц 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЧЕТВЪРТА КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ЧЕТВЪРТА КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ЧЕТВЪРТА КНИГА ЦАРСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ЧЕТВЪРТА ЦАРСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ЧЕТВЪРТА ЦАРЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. ЦАРСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. ЦАРСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV ЦАРСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 ЦАРСТВА 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. ЦАРЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. ЦАРЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV ЦАРЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 ЦАРЕ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Ц 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (bg)", ->
		`
		expect(p.parse("Трета книга на царете 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трето Книга на царете 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Книга на царете 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Книга на царете 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трета книга Царства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Книга на царете 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Книга на царете 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трето Царства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Царства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Царства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Царства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Трето Царе 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Царства 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Царе 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Царе 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Царе 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Царе 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Ц 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ТРЕТА КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕТО КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕТА КНИГА ЦАРСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 КНИГА НА ЦАРЕТЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕТО ЦАРСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. ЦАРСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III ЦАРСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. ЦАРСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ТРЕТО ЦАРЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 ЦАРСТВА 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. ЦАРЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III ЦАРЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. ЦАРЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 ЦАРЕ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Ц 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (bg)", ->
		`
		expect(p.parse("или Втора книга Паралипоменон 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Втора Книга на летописите 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Втора книга Паралипоменон 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Втора книга на летописите 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Книга на летописите 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Книга на летописите 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Книга на летописите 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Книга на летописите 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Втора Летописи 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Летописи 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Летописи 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Летописи 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Летописи 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Втора Лет 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Лет 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Лет 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Лет 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Лет 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ИЛИ ВТОРА КНИГА ПАРАЛИПОМЕНОН 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ВТОРА КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ВТОРА КНИГА ПАРАЛИПОМЕНОН 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ВТОРА КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ВТОРА ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ЛЕТОПИСИ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ВТОРА ЛЕТ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. ЛЕТ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ЛЕТ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II ЛЕТ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ЛЕТ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (bg)", ->
		`
		expect(p.parse("или Първа книга Паралипоменон 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Първа Книга на летописите 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Първа книга Паралипоменон 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Първа книга на летописите 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Книга на летописите 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Книга на летописите 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Книга на летописите 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Книга на летописите 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Първа Летописи 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Летописи 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Летописи 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Летописи 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Летописи 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Първа Лет 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Лет 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Лет 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Лет 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Лет 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ИЛИ ПЪРВА КНИГА ПАРАЛИПОМЕНОН 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПЪРВА КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПЪРВА КНИГА ПАРАЛИПОМЕНОН 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПЪРВА КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I КНИГА НА ЛЕТОПИСИТЕ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПЪРВА ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I ЛЕТОПИСИ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ПЪРВА ЛЕТ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ЛЕТ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. ЛЕТ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ЛЕТ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I ЛЕТ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (bg)", ->
		`
		expect(p.parse("Книга на Ездра 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ездра 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Езд 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ЕЗДРА 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ЕЗДРА 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ЕЗД 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (bg)", ->
		`
		expect(p.parse("Книга на Неемия 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Неемия 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Неем 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА НЕЕМИЯ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("НЕЕМИЯ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("НЕЕМ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (bg)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (bg)", ->
		`
		expect(p.parse("Книга Естир 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Естир 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Ест 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА ЕСТИР 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ЕСТИР 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ЕСТ 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (bg)", ->
		`
		expect(p.parse("Книга на Иова 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Книга на Иов 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Книга на Йов 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Иов 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Йов 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ИОВА 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("КНИГА НА ИОВ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("КНИГА НА ЙОВ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ИОВ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ЙОВ 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (bg)", ->
		`
		expect(p.parse("Псалтир 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Псалми 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Псалом 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Пс 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПСАЛТИР 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ПСАЛМИ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ПСАЛОМ 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ПС 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (bg)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (bg)", ->
		`
		expect(p.parse("Книга Притчи Соломонови 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Притчи Соломонови 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Притчи 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Пр 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА ПРИТЧИ СОЛОМОНОВИ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ПРИТЧИ СОЛОМОНОВИ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ПРИТЧИ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ПР 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (bg)", ->
		`
		expect(p.parse("Книга на Еклисиаста или Проповедника 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Проповедника 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Еклисиаста 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Еклесиаст 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Еклисиаст 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Екл 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ЕКЛИСИАСТА ИЛИ ПРОПОВЕДНИКА 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ПРОПОВЕДНИКА 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ЕКЛИСИАСТА 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ЕКЛЕСИАСТ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ЕКЛИСИАСТ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ЕКЛ 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (bg)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (bg)", ->
		`
		expect(p.parse("Книга Песен на Песните, от Соломона 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Песен на песните 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("П. П 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("П П 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Пес 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА ПЕСЕН НА ПЕСНИТЕ, ОТ СОЛОМОНА 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ПЕСЕН НА ПЕСНИТЕ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("П. П 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("П П 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ПЕС 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (bg)", ->
		`
		expect(p.parse("Книга на пророк Иеремия 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Книга на пророк Йеремия 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Книга на пророк Еремия 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Иеремия 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Йеремия 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Еремия 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Иер 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Йер 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Ер 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ИЕРЕМИЯ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("КНИГА НА ПРОРОК ЙЕРЕМИЯ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("КНИГА НА ПРОРОК ЕРЕМИЯ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ИЕРЕМИЯ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ЙЕРЕМИЯ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ЕРЕМИЯ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ИЕР 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ЙЕР 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ЕР 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (bg)", ->
		`
		expect(p.parse("Книга на пророк Иезекииля 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Книга на пророк Езекиил 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Иезекииля 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Иезекиил 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Йезекиил 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Езекиил 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Езекил 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Езек 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Иез 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Йез 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ИЕЗЕКИИЛЯ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("КНИГА НА ПРОРОК ЕЗЕКИИЛ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ИЕЗЕКИИЛЯ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ИЕЗЕКИИЛ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ЙЕЗЕКИИЛ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ЕЗЕКИИЛ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ЕЗЕКИЛ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ЕЗЕК 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ИЕЗ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ЙЕЗ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (bg)", ->
		`
		expect(p.parse("Книга на пророк Даниила 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Книга на пророк Даниил 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Даниила 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Данаил 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Даниил 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Дан 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ДАНИИЛА 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("КНИГА НА ПРОРОК ДАНИИЛ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ДАНИИЛА 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ДАНАИЛ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ДАНИИЛ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ДАН 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (bg)", ->
		`
		expect(p.parse("Книга на пророк Осия 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Осия 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ос 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ОСИЯ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ОСИЯ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ОС 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (bg)", ->
		`
		expect(p.parse("Книга на пророк Иоиля 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Книга на пророк Иоил 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Иоиля 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Иоил 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Йоил 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ИОИЛЯ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("КНИГА НА ПРОРОК ИОИЛ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ИОИЛЯ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ИОИЛ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ЙОИЛ 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (bg)", ->
		`
		expect(p.parse("Книга на пророк Амоса 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Книга на пророк Амос 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Амоса 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Амос 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Ам 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК АМОСА 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("КНИГА НА ПРОРОК АМОС 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("АМОСА 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("АМОС 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("АМ 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (bg)", ->
		`
		expect(p.parse("Книга на пророк Авдии 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Книга на пророк Авдий 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Авдии 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Авдий 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Авд 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК АВДИИ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("КНИГА НА ПРОРОК АВДИЙ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("АВДИИ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("АВДИЙ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("АВД 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (bg)", ->
		`
		expect(p.parse("Книга на пророк Иона 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Иона 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Йона 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Ион 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Йон 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ИОНА 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ИОНА 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ЙОНА 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ИОН 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ЙОН 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (bg)", ->
		`
		expect(p.parse("Книга на пророк Михеи 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Книга на пророк Михей 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Михеи 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Михей 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Мих 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК МИХЕИ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("КНИГА НА ПРОРОК МИХЕЙ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("МИХЕИ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("МИХЕЙ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("МИХ 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (bg)", ->
		`
		expect(p.parse("Книга на пророк Наума 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Книга на пророк Наум 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Наума 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Наум 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК НАУМА 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("КНИГА НА ПРОРОК НАУМ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("НАУМА 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("НАУМ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (bg)", ->
		`
		expect(p.parse("Книга на пророк Авакума 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Книга на пророк Авакум 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Авакума 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Авакум 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Авак 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Ав 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК АВАКУМА 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("КНИГА НА ПРОРОК АВАКУМ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("АВАКУМА 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("АВАКУМ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("АВАК 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("АВ 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (bg)", ->
		`
		expect(p.parse("Книга на пророк Софония 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Софонии 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Софоний 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Софония 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Соф 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК СОФОНИЯ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("СОФОНИИ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("СОФОНИЙ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("СОФОНИЯ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("СОФ 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (bg)", ->
		`
		expect(p.parse("Книга на пророк Агеи 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Книга на пророк Агей 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Агеи 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Агей 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Аг 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК АГЕИ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("КНИГА НА ПРОРОК АГЕЙ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("АГЕИ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("АГЕЙ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("АГ 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (bg)", ->
		`
		expect(p.parse("Книга на пророк Захария 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Захария 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Зах 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК ЗАХАРИЯ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ЗАХАРИЯ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ЗАХ 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (bg)", ->
		`
		expect(p.parse("Книга на пророк Малахия 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Малахия 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Мал 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("КНИГА НА ПРОРОК МАЛАХИЯ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("МАЛАХИЯ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("МАЛ 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (bg)", ->
		`
		expect(p.parse("От Матея свето Евангелие 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Евангелие от Матеи 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Евангелие от Матей 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("От Матея 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Матеи 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Матей 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Мат 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОТ МАТЕЯ СВЕТО ЕВАНГЕЛИЕ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ЕВАНГЕЛИЕ ОТ МАТЕИ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ЕВАНГЕЛИЕ ОТ МАТЕЙ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ОТ МАТЕЯ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("МАТЕИ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("МАТЕЙ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("МАТ 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (bg)", ->
		`
		expect(p.parse("От Марка свето Евангелие 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Евангелие от Марко 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("От Марка 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Марко 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Марк 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОТ МАРКА СВЕТО ЕВАНГЕЛИЕ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ЕВАНГЕЛИЕ ОТ МАРКО 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ОТ МАРКА 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("МАРКО 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("МАРК 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (bg)", ->
		`
		expect(p.parse("От Лука свето Евангелие 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Евангелие от Лука 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("От Лука 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Лука 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОТ ЛУКА СВЕТО ЕВАНГЕЛИЕ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ЕВАНГЕЛИЕ ОТ ЛУКА 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ОТ ЛУКА 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ЛУКА 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (bg)", ->
		`
		expect(p.parse("Първо съборно послание на св. ап. Иоана Богослова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първо съборно послание на св ап. Иоана Богослова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първо съборно послание на св. ап Иоана Богослова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първо съборно послание на св ап Иоана Богослова 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първо послание на Иоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първо послание на Йоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първа Иоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първа Йоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Иоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Йоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Иоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Йоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първа Иоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Първа Йоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Иоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Йоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Иоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Йоаново 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Иоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Йоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Иоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Йоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Иоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Йоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Иоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Йоан 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ АП. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ. АП ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ АП ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА ИОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА ЙОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВА ИОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВА ЙОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ИОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ЙОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. ИОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. ЙОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВА ИОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ПЪРВА ЙОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ИОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ЙОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I ИОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I ЙОАНОВО 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ИОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ЙОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. ИОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. ЙОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ИОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ЙОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I ИОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I ЙОАН 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (bg)", ->
		`
		expect(p.parse("Второ съборно послание на св. ап. Иоана Богослова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Второ съборно послание на св ап. Иоана Богослова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Второ съборно послание на св. ап Иоана Богослова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Второ съборно послание на св ап Иоана Богослова 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Второ послание на Иоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Второ послание на Йоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Втора Иоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Втора Йоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Иоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Йоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Иоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Йоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Иоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Йоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Втора Иоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Втора Йоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Иоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Йоаново 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Иоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Йоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Иоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Йоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Иоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Йоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Иоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Йоан 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ АП. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ. АП ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ АП ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА ИОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА ЙОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРА ИОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРА ЙОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. ИОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. ЙОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ИОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ЙОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II ИОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II ЙОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРА ИОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ВТОРА ЙОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ИОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ЙОАНОВО 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. ИОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. ЙОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ИОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ЙОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II ИОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II ЙОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ИОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ЙОАН 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (bg)", ->
		`
		expect(p.parse("Трето съборно послание на св. ап. Иоана Богослова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето съборно послание на св ап. Иоана Богослова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето съборно послание на св. ап Иоана Богослова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето съборно послание на св ап Иоана Богослова 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето послание на Иоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето послание на Йоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето Иоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето Йоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Иоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Йоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Иоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Йоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Иоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Йоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето Иоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Трето Йоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Иоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Йоаново 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Иоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Йоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Иоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Йоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Иоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Йоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Иоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Йоан 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ТРЕТО СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО СЪБОРНО ПОСЛАНИЕ НА СВ АП. ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО СЪБОРНО ПОСЛАНИЕ НА СВ. АП ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО СЪБОРНО ПОСЛАНИЕ НА СВ АП ИОАНА БОГОСЛОВА 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО ПОСЛАНИЕ НА ИОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО ПОСЛАНИЕ НА ЙОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО ИОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО ЙОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. ИОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. ЙОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III ИОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III ЙОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ИОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ЙОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО ИОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ТРЕТО ЙОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ИОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ЙОАНОВО 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. ИОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. ЙОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III ИОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III ЙОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ИОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ЙОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ИОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ЙОАН 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (bg)", ->
		`
		expect(p.parse("От Иоана свето Евангелие 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Евангелие от Иоан 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Евангелие от Йоан 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("От Иоана 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Иоан 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Йоан 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ОТ ИОАНА СВЕТО ЕВАНГЕЛИЕ 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ЕВАНГЕЛИЕ ОТ ИОАН 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ЕВАНГЕЛИЕ ОТ ЙОАН 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ОТ ИОАНА 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ИОАН 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ЙОАН 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (bg)", ->
		`
		expect(p.parse("Деяния на светите Апостоли 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Деянията на апостолите 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Деяния на апостолите 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Апостол 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Деяния 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Д. А 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Дела 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Деян 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Д А 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ДЕЯНИЯ НА СВЕТИТЕ АПОСТОЛИ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДЕЯНИЯТА НА АПОСТОЛИТЕ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДЕЯНИЯ НА АПОСТОЛИТЕ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("АПОСТОЛ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДЕЯНИЯ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Д. А 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДЕЛА 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ДЕЯН 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Д А 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Римляни 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Послание на св ап. Павла до Римляни 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Послание на св. ап Павла до Римляни 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Послание на св ап Павла до Римляни 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Послание към римляните 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("римляните 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Римляни 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Римл 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Рим 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО РИМЛЯНИ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО РИМЛЯНИ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО РИМЛЯНИ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО РИМЛЯНИ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ РИМЛЯНИТЕ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("РИМЛЯНИТЕ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("РИМЛЯНИ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("РИМЛ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("РИМ 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (bg)", ->
		`
		expect(p.parse("Второ послание на св. ап. Павла до Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Второ послание на св ап. Павла до Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Второ послание на св. ап Павла до Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Второ послание на св ап Павла до Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Второ послание към коринтяните 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Втора Коринтяните 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Коринтяните 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Втора Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Коринтяните 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Коринтяните 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Коринтяните 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Коринтяни 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Втора Кор 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Кор 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Кор 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Кор 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Кор 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ АП ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ КЪМ КОРИНТЯНИТЕ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРА КОРИНТЯНИТЕ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. КОРИНТЯНИТЕ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРА КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. КОРИНТЯНИТЕ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II КОРИНТЯНИТЕ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 КОРИНТЯНИТЕ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 КОРИНТЯНИ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ВТОРА КОР 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. КОР 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. КОР 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II КОР 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 КОР 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (bg)", ->
		`
		expect(p.parse("Първо послание на св. ап. Павла до Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първо послание на св ап. Павла до Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първо послание на св. ап Павла до Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първо послание на св ап Павла до Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първо послание към коринтяните 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първа Коринтяните 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първа Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Коринтяните 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Коринтяните 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Коринтяните 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Коринтяните 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Коринтяни 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Първа Кор 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Кор 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Кор 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Кор 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Кор 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ АП ПАВЛА ДО КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ КЪМ КОРИНТЯНИТЕ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВА КОРИНТЯНИТЕ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВА КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. КОРИНТЯНИТЕ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. КОРИНТЯНИТЕ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 КОРИНТЯНИТЕ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I КОРИНТЯНИТЕ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I КОРИНТЯНИ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ПЪРВА КОР 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. КОР 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. КОР 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 КОР 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I КОР 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Галатяни 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Послание на св ап. Павла до Галатяни 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Послание на св. ап Павла до Галатяни 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Послание на св ап Павла до Галатяни 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Послание към галатяните 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Галатяните 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Галатяни 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Гал 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ГАЛАТЯНИ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ГАЛАТЯНИ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ГАЛАТЯНИ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ГАЛАТЯНИ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ ГАЛАТЯНИТЕ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ГАЛАТЯНИТЕ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ГАЛАТЯНИ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ГАЛ 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Ефесяни 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Послание на св ап. Павла до Ефесяни 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Послание на св. ап Павла до Ефесяни 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Послание на св ап Павла до Ефесяни 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Послание към ефесяните 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ефесяните 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ефесяни 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Еф 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ЕФЕСЯНИ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ЕФЕСЯНИ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ЕФЕСЯНИ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ЕФЕСЯНИ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ ЕФЕСЯНИТЕ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ЕФЕСЯНИТЕ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ЕФЕСЯНИ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ЕФ 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Филипяни 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Послание на св ап. Павла до Филипяни 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Послание на св. ап Павла до Филипяни 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Послание на св ап Павла до Филипяни 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Послание към филипяните 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Филипяните 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Филипяни 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Фил 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ФИЛИПЯНИ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ФИЛИПЯНИ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ФИЛИПЯНИ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ФИЛИПЯНИ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ ФИЛИПЯНИТЕ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ФИЛИПЯНИТЕ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ФИЛИПЯНИ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ФИЛ 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Колосяни 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Послание на св ап. Павла до Колосяни 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Послание на св. ап Павла до Колосяни 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Послание на св ап Павла до Колосяни 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Послание към колосяните 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Колосяните 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Колосяни 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Кол 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО КОЛОСЯНИ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО КОЛОСЯНИ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО КОЛОСЯНИ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО КОЛОСЯНИ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ КОЛОСЯНИТЕ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("КОЛОСЯНИТЕ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("КОЛОСЯНИ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("КОЛ 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (bg)", ->
		`
		expect(p.parse("Второ послание на св. ап. Павла до Солуняни 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Второ послание на св ап. Павла до Солуняни 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Второ послание на св. ап Павла до Солуняни 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Второ послание на св ап Павла до Солуняни 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Второ послание към солунците 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Втора Солунците 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Солунците 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Втора Солунци 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Солунците 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Солунците 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Солунците 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Солунци 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Солунци 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Солунци 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Солунци 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Втора Сол 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Сол 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Сол 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Сол 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Сол 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ АП ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ КЪМ СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРА СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРА СОЛУНЦИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 СОЛУНЦИТЕ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. СОЛУНЦИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. СОЛУНЦИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II СОЛУНЦИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 СОЛУНЦИ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ВТОРА СОЛ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. СОЛ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. СОЛ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II СОЛ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 СОЛ 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (bg)", ->
		`
		expect(p.parse("Първо послание на св. ап. Павла до Солуняни 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първо послание на св ап. Павла до Солуняни 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първо послание на св. ап Павла до Солуняни 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първо послание на св ап Павла до Солуняни 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първо послание към солунците 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първа Солунците 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първа Солунци 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Солунците 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Солунците 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Солунците 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Солунците 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Солунци 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Солунци 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Солунци 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Солунци 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Първа Сол 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Сол 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Сол 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Сол 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Сол 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ АП ПАВЛА ДО СОЛУНЯНИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ КЪМ СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВА СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВА СОЛУНЦИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I СОЛУНЦИТЕ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. СОЛУНЦИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. СОЛУНЦИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 СОЛУНЦИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I СОЛУНЦИ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ПЪРВА СОЛ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. СОЛ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. СОЛ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 СОЛ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I СОЛ 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (bg)", ->
		`
		expect(p.parse("Второ послание на св. ап. Павла до Тимотея 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Второ послание на св ап. Павла до Тимотея 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Второ послание на св. ап Павла до Тимотея 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Второ послание на св ап Павла до Тимотея 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Второ послание към Тимотеи 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Второ послание към Тимотей 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Втора Тимотеи 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Втора Тимотей 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Тимотеи 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Тимотей 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Тимотеи 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Тимотей 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Тимотеи 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Тимотей 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Тимотеи 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Тимотей 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Втора Тим 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Тим 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Тим 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Тим 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Тим 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ КЪМ ТИМОТЕИ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ КЪМ ТИМОТЕЙ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРА ТИМОТЕИ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРА ТИМОТЕЙ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. ТИМОТЕИ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. ТИМОТЕЙ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ТИМОТЕИ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ТИМОТЕЙ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II ТИМОТЕИ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II ТИМОТЕЙ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ТИМОТЕИ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ТИМОТЕЙ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ВТОРА ТИМ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. ТИМ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ТИМ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II ТИМ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ТИМ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (bg)", ->
		`
		expect(p.parse("Първо послание на св. ап. Павла до Тимотея 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първо послание на св ап. Павла до Тимотея 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първо послание на св. ап Павла до Тимотея 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първо послание на св ап Павла до Тимотея 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първо послание към Тимотеи 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първо послание към Тимотей 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първа Тимотеи 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първа Тимотей 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Тимотеи 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Тимотей 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Тимотеи 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Тимотей 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Тимотеи 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Тимотей 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Тимотеи 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Тимотей 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Първа Тим 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Тим 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Тим 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Тим 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Тим 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ТИМОТЕЯ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ КЪМ ТИМОТЕИ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ КЪМ ТИМОТЕЙ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВА ТИМОТЕИ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВА ТИМОТЕЙ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ТИМОТЕИ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ТИМОТЕЙ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. ТИМОТЕИ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. ТИМОТЕЙ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ТИМОТЕИ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ТИМОТЕЙ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I ТИМОТЕИ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I ТИМОТЕЙ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ПЪРВА ТИМ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ТИМ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. ТИМ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ТИМ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I ТИМ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Тита 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Послание на св ап. Павла до Тита 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Послание на св. ап Павла до Тита 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Послание на св ап Павла до Тита 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Послание към Тит 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Тит 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ТИТА 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ТИТА 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ТИТА 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ТИТА 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ ТИТ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ТИТ 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Филимона 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Послание на св ап. Павла до Филимона 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Послание на св. ап Павла до Филимона 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Послание на св ап Павла до Филимона 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Послание към Филимон 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Филимон 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Филим 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ФИЛИМОНА 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ФИЛИМОНА 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ФИЛИМОНА 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ФИЛИМОНА 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ ФИЛИМОН 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ФИЛИМОН 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ФИЛИМ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (bg)", ->
		`
		expect(p.parse("Послание на св. ап. Павла до Евреите 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Послание на св ап. Павла до Евреите 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Послание на св. ап Павла до Евреите 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Послание на св ап Павла до Евреите 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Послание към евреите 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Евреите 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Евреи 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Евр 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП. ПАВЛА ДО ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП. ПАВЛА ДО ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ. АП ПАВЛА ДО ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ПОСЛАНИЕ НА СВ АП ПАВЛА ДО ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ПОСЛАНИЕ КЪМ ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ЕВРЕИТЕ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ЕВРЕИ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ЕВР 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (bg)", ->
		`
		expect(p.parse("Съборно послание на св. ап. Иакова 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Съборно послание на св ап. Иакова 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Съборно послание на св. ап Иакова 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Съборно послание на св ап Иакова 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Послание на Яков 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Яков 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Як 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ИАКОВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ АП. ИАКОВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ. АП ИАКОВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ АП ИАКОВА 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ПОСЛАНИЕ НА ЯКОВ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ЯКОВ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ЯК 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (bg)", ->
		`
		expect(p.parse("Второ съборно послание на св. ап. Петра 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Второ съборно послание на св ап. Петра 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Второ съборно послание на св. ап Петра 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Второ съборно послание на св ап Петра 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Второ послание на Петър 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Втора Петрово 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Петрово 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Втора Петър 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Петрово 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Петрово 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Втора Петр 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Петрово 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Петър 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Втора Пет 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Петър 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Петър 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Петр 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Петър 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Петр 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Петр 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Пет 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Петр 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Пет 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Пет 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Пет 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ПЕТРА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ АП. ПЕТРА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ. АП ПЕТРА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРО СЪБОРНО ПОСЛАНИЕ НА СВ АП ПЕТРА 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРО ПОСЛАНИЕ НА ПЕТЪР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРА ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРА ПЕТЪР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРА ПЕТР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТРОВО 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. ПЕТЪР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ВТОРА ПЕТ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ПЕТЪР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II ПЕТЪР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. ПЕТР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТЪР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ПЕТР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II ПЕТР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. ПЕТ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТР 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ПЕТ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II ПЕТ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ПЕТ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (bg)", ->
		`
		expect(p.parse("Първо съборно послание на св. ап. Петра 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първо съборно послание на св ап. Петра 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първо съборно послание на св. ап Петра 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първо съборно послание на св ап Петра 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първо послание на Петър 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първа Петрово 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първа Петър 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Петрово 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Петрово 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първа Петр 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Петрово 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Петрово 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Първа Пет 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Петър 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Петър 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Петър 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Петр 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Петър 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Петр 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Петр 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Пет 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Петр 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Пет 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Пет 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Пет 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ПЕТРА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ АП. ПЕТРА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ. АП ПЕТРА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВО СЪБОРНО ПОСЛАНИЕ НА СВ АП ПЕТРА 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВО ПОСЛАНИЕ НА ПЕТЪР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВА ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВА ПЕТЪР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВА ПЕТР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I ПЕТРОВО 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ПЪРВА ПЕТ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ПЕТЪР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. ПЕТЪР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТЪР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ПЕТР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I ПЕТЪР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. ПЕТР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ПЕТ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I ПЕТР 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. ПЕТ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ПЕТ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I ПЕТ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (bg)", ->
		`
		expect(p.parse("Съборно послание на св. ап. Иуда 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Съборно послание на св ап. Иуда 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Съборно послание на св. ап Иуда 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Съборно послание на св ап Иуда 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Послание на Юда 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Юда 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ. АП. ИУДА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ АП. ИУДА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ. АП ИУДА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("СЪБОРНО ПОСЛАНИЕ НА СВ АП ИУДА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ПОСЛАНИЕ НА ЮДА 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ЮДА 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (bg)", ->
		`
		expect(p.parse("Книга на Товита 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Книга за Тобия 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Книга на Товит 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Товита 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Тобия 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Товит 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (bg)", ->
		`
		expect(p.parse("Книга за Юдита 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Книга Иудит 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Иудит 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (bg)", ->
		`
		expect(p.parse("Книга на пророк Варуха 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Книга на Барух 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Варуха 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Варух 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (bg)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Сус 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (bg)", ->
		`
		expect(p.parse("Втора книга на Макавеите 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Втора книга Макавеиска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Втора книга Макавейска 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Втора Макавеи 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Макавеи 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Макавеи 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Макавеи 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Макавеи 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (bg)", ->
		`
		expect(p.parse("Трето книга на Макавеите 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трета книга Макавеиска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трета книга Макавейска 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Трето Макавеи 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Макавеи 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Макавеи 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Макавеи 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Макавеи 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (bg)", ->
		`
		expect(p.parse("Четвърта книга на Макавеите 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Четвърта Макавеи 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Макавеи 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Макавеи 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Макавеи 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Макавеи 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (bg)", ->
		`
		expect(p.parse("Първа книга на Макавеите 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Първа книга Макавеиска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Първа книга Макавейска 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Първа Макавеи 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Макавеи 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Макавеи 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Макавеи 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Макавеи 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book Ezek,Ezra (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek,Ezra (bg)", ->
		`
		expect(p.parse("Ез 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ЕЗ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Hab,Obad (bg)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab,Obad (bg)", ->
		`
		expect(p.parse("Ав 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("АВ 1:1").osis()).toEqual("Hab.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (bg)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (bg)", ->
		expect(p.parse("Titus 1:1, глава 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 ГЛАВА 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, глави 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 ГЛАВИ 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, гл 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 ГЛ 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (bg)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (bg)", ->
		expect(p.parse("Exod 1:1 и 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 И 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (bg)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (bg)", ->
		expect(p.parse("Rev 3и сл, 4:2и сл").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 И СЛ, 4:2 И СЛ").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (bg)", ->
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("Lev 1 (BPB)").osis_and_translations()).toEqual [["Lev.1", "BPB"]]
		expect(p.parse("lev 1 bpb").osis_and_translations()).toEqual [["Lev.1", "BPB"]]
	it "should handle book ranges (bg)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Първа - Трето  Йоаново").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Първа - Трето  Иоаново").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (bg)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

bcv_parser = require("../../js/ar_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (ar)", ->
		`
		expect(p.parse("سفر التكوين 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("التكوين 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ﺗﻜﻮﻳﻦ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("تك 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر التكوين 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("التكوين 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ﺗﻜﻮﻳﻦ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("تك 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (ar)", ->
		`
		expect(p.parse("سفر الخروج 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("الخروج 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("خر 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر الخروج 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("الخروج 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("خر 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (ar)", ->
		`
		expect(p.parse("بل والتنين 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (ar)", ->
		`
		expect(p.parse("سفر اللاويين 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("اللاويين 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("الأحبار 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ﺍﻟﻼﻭﻳﻲ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("أح 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("لا 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر اللاويين 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("اللاويين 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("الأحبار 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ﺍﻟﻼﻭﻳﻲ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("أح 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("لا 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (ar)", ->
		`
		expect(p.parse("سفر العدد 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("العدد 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("عد 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر العدد 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("العدد 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("عد 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (ar)", ->
		`
		expect(p.parse("سفر ابن سيراخ 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("يشوع بن سيراخ 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("سيراخ 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("سي 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (ar)", ->
		`
		expect(p.parse("حكمة سليمان 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("سفر الحكمة 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("الحكمة 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("حك 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (ar)", ->
		`
		expect(p.parse("سفر مراثي إرميا 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("مراثي إرميا 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("المراثي 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("مرا 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر مراثي إرميا 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("مراثي إرميا 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("المراثي 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("مرا 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (ar)", ->
		`
		expect(p.parse("رسالة إرميا 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book PrMan (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (ar)", ->
		`
		expect(p.parse("صلاة منسى 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (ar)", ->
		`
		expect(p.parse("تثنية الإشتراع 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("سفر التثنية 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("تَثنِيَة 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("التثنية 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("تث 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("تثنية الإشتراع 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("سفر التثنية 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("تَثنِيَة 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("التثنية 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("تث 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (ar)", ->
		`
		expect(p.parse("سفر يشوع 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("يشوع 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("يش 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر يشوع 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("يشوع 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("يش 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (ar)", ->
		`
		expect(p.parse("سفر القضاة 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("القضاة 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("قض 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر القضاة 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("القضاة 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("قض 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (ar)", ->
		`
		expect(p.parse("سفر راعوث 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("راعوث 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("را 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر راعوث 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("راعوث 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("را 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (ar)", ->
		`
		expect(p.parse("إسدراس الأول 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (ar)", ->
		`
		expect(p.parse("إسدراس الثاني 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (ar)", ->
		`
		expect(p.parse("سفر إشعياء 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("إشَعْياء 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ﺃﺷﻌﻴﺎء 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("إشعيا 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("اش 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر إشعياء 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("إشَعْياء 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ﺃﺷﻌﻴﺎء 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("إشعيا 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("اش 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (ar)", ->
		`
		expect(p.parse("سفر صموئيل الثاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("الممالك الثاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("صموئيل الثّاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("صموئيل الثاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 صموئيل 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 صم 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر صموئيل الثاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("الممالك الثاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("صموئيل الثّاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("صموئيل الثاني 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 صموئيل 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 صم 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (ar)", ->
		`
		expect(p.parse("سفر صموئيل الأول 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("الممالك الأول 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("صموئيل الأول 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ﺻﻤﻮﺋﻴﻞ ﺍﻷﻭﻝ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 صموئيل 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 صم 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر صموئيل الأول 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("الممالك الأول 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("صموئيل الأول 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ﺻﻤﻮﺋﻴﻞ ﺍﻷﻭﻝ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 صموئيل 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 صم 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (ar)", ->
		`
		expect(p.parse("سفر الملوك الثاني 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("الممالك الرابع 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ﺍﻟﻤﻠﻮﻙ ﺍﻟﺜﺎﻧﻲ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 الملوك 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 مل 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر الملوك الثاني 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("الممالك الرابع 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ﺍﻟﻤﻠﻮﻙ ﺍﻟﺜﺎﻧﻲ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 الملوك 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 مل 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (ar)", ->
		`
		expect(p.parse("سفر الملوك الأول 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("الممالك الثالث 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("الملوك الأول 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ﺍﻟﻤﻠﻮﻙ ﺍﻷﻭ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 الملوك 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 مل 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر الملوك الأول 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("الممالك الثالث 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("الملوك الأول 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ﺍﻟﻤﻠﻮﻙ ﺍﻷﻭ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 الملوك 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 مل 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (ar)", ->
		`
		expect(p.parse("سفر أخبار الأيام الثاني 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("أخبار الأيام الثاني 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ﺃﺧﺒﺎﺭ ﺍﻷﻳﺎﻡ ﺍﻟﺜﺎﻥ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("الأخبار 2 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 أخ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر أخبار الأيام الثاني 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("أخبار الأيام الثاني 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ﺃﺧﺒﺎﺭ ﺍﻷﻳﺎﻡ ﺍﻟﺜﺎﻥ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("الأخبار 2 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 أخ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (ar)", ->
		`
		expect(p.parse("سفر أخبار الأيام الأول 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("أخبار الأيام الأول 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ﺃﺧﺒﺎﺭ ﺍﻷﻳﺎﻡ ﺍﻷ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("الأخبار 1 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 أخ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر أخبار الأيام الأول 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("أخبار الأيام الأول 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ﺃﺧﺒﺎﺭ ﺍﻷﻳﺎﻡ ﺍﻷ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("الأخبار 1 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 أخ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (ar)", ->
		`
		expect(p.parse("سفر عزرا 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("عزرا 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("عـز 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر عزرا 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("عزرا 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("عـز 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (ar)", ->
		`
		expect(p.parse("سفر نحميا 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("نحميا 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("نح 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر نحميا 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("نحميا 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("نح 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (ar)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (ar)", ->
		`
		expect(p.parse("سفر أستير 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("أستير 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("أس 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر أستير 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("أستير 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("أس 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (ar)", ->
		`
		expect(p.parse("سفر أيوب 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("أيوب 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("أي 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر أيوب 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("أيوب 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("أي 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (ar)", ->
		`
		expect(p.parse("سفر المزامير 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("المَزمُور 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("المزامير 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("المزمور 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("مزمور 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("مز 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر المزامير 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("المَزمُور 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("المزامير 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("المزمور 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("مزمور 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("مز 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (ar)", ->
		`
		expect(p.parse("صلاة عزريا 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (ar)", ->
		`
		expect(p.parse("سفر الأمثال 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("الأمثال 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("أمثال 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ﺃﻣﺜﺎﻝ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("مثل 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ام 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر الأمثال 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("الأمثال 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("أمثال 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ﺃﻣﺜﺎﻝ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("مثل 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("ام 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (ar)", ->
		`
		expect(p.parse("سفر الجامعة 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("الجامعة 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("جا 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر الجامعة 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("الجامعة 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("جا 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (ar)", ->
		`
		expect(p.parse("أنشودة الأطفال الثلاثة 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (ar)", ->
		`
		expect(p.parse("سفر نشيد الأنشاد 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("نشيد الأناشيد 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ﻧﺸﻴﺪ ﺍﻷﻧﺸﺎ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("نش 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر نشيد الأنشاد 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("نشيد الأناشيد 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("ﻧﺸﻴﺪ ﺍﻷﻧﺸﺎ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("نش 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (ar)", ->
		`
		expect(p.parse("سفر إرميا 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ﺃﺭﻣﻴﺎء 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("أرميا 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("إرميا 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ار 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر إرميا 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ﺃﺭﻣﻴﺎء 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("أرميا 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("إرميا 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ار 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (ar)", ->
		`
		expect(p.parse("سفر حزقيال 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("حزقيال 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("حز 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر حزقيال 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("حزقيال 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("حز 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (ar)", ->
		`
		expect(p.parse("سفر دانيال 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("دانيال 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("دا 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر دانيال 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("دانيال 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("دا 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (ar)", ->
		`
		expect(p.parse("سفر هوشع 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("هوشع 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("هو 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر هوشع 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("هوشع 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("هو 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (ar)", ->
		`
		expect(p.parse("سفر يوئيل 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("يوئيل 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("يوء 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر يوئيل 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("يوئيل 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("يوء 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (ar)", ->
		`
		expect(p.parse("سفر عاموس 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("عاموس 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("عا 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر عاموس 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("عاموس 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("عا 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (ar)", ->
		`
		expect(p.parse("سفر عوبديا 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("عوبديا 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("عو 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر عوبديا 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("عوبديا 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("عو 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (ar)", ->
		`
		expect(p.parse("سفر يونان 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("يونان 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("يون 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر يونان 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("يونان 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("يون 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (ar)", ->
		`
		expect(p.parse("سفر ميخا 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ميخا 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("مي 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر ميخا 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ميخا 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("مي 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (ar)", ->
		`
		expect(p.parse("سفر ناحوم 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("ناحوم 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("نحوم 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("نحو 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("نا 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر ناحوم 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("ناحوم 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("نحوم 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("نحو 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("نا 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (ar)", ->
		`
		expect(p.parse("سفر حبقوق 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("حبقوق 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("حب 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر حبقوق 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("حبقوق 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("حب 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (ar)", ->
		`
		expect(p.parse("سفر صفنيا 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("صفنيا 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("صف 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر صفنيا 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("صفنيا 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("صف 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (ar)", ->
		`
		expect(p.parse("سفر حجي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حجَّي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حجاي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حجي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حج 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر حجي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حجَّي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حجاي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حجي 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("حج 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (ar)", ->
		`
		expect(p.parse("زَكَرِيّا 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("سفر زكريا 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("زكريا 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("زك 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("زَكَرِيّا 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("سفر زكريا 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("زكريا 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("زك 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (ar)", ->
		`
		expect(p.parse("سفر ملاخي 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ملاخي 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ملا 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ﻣﻼﺥ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("مل 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر ملاخي 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ملاخي 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ملا 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ﻣﻼﺥ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("مل 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (ar)", ->
		`
		expect(p.parse("إنجيل متى 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("متى 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("مت 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("إنجيل متى 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("متى 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("مت 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (ar)", ->
		`
		expect(p.parse("إنجيل مرقس 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("مرقس 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("مر 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("إنجيل مرقس 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("مرقس 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("مر 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (ar)", ->
		`
		expect(p.parse("إنجيل لوقا 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("لوقا 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("لو 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("إنجيل لوقا 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("لوقا 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("لو 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (ar)", ->
		`
		expect(p.parse("رسالة القديس يوحنا الأولى 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("رسالة يوحنا الأولى 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("رسالة يوحنا 1 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("يوحنا الأولى 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ﻳﻮﺣﻨﺎ ﺍﻻﻭﻝ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 يو 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة القديس يوحنا الأولى 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("رسالة يوحنا الأولى 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("رسالة يوحنا 1 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("يوحنا الأولى 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ﻳﻮﺣﻨﺎ ﺍﻻﻭﻝ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 يو 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (ar)", ->
		`
		expect(p.parse("رسالة القديس يوحنا الثانية 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("رسالة يوحنا الثانية 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("رسالة يوحنا 2 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("يوحنا الثانية 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 يو 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة القديس يوحنا الثانية 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("رسالة يوحنا الثانية 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("رسالة يوحنا 2 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("يوحنا الثانية 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 يو 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (ar)", ->
		`
		expect(p.parse("رسالة القديس يوحنا الثالثة 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("رسالة يوحنا الثالثة 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("رسالة يوحنا 3 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("يوحنا الثالثة 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 يو 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة القديس يوحنا الثالثة 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("رسالة يوحنا الثالثة 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("رسالة يوحنا 3 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("يوحنا الثالثة 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 يو 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book Rev (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (ar)", ->
		`
		expect(p.parse("رؤيا يوحنا 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ﻳﻮﺣﻨﺎ ﺭﺅﻳﺎ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("الرؤيــا 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("رؤ 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رؤيا يوحنا 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ﻳﻮﺣﻨﺎ ﺭﺅﻳﺎ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("الرؤيــا 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("رؤ 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book John (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (ar)", ->
		`
		expect(p.parse("إنجيل يوحنا 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("يوحنا 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("يو 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("إنجيل يوحنا 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("يوحنا 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("يو 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (ar)", ->
		`
		expect(p.parse("سفر أعمال الرسل 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("أعمال الرسل 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ﺍﻋﻤﺎﻝ ﺍﻟﺮﺳﻞ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("اع 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("سفر أعمال الرسل 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("أعمال الرسل 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ﺍﻋﻤﺎﻝ ﺍﻟﺮﺳﻞ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("اع 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى أهل رومية 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("الرسالة إلى أهل رومية 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("رسالة روما 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ﺭﻭﻣﻴﺔ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("روم 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("رو 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى أهل رومية 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("الرسالة إلى أهل رومية 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("رسالة روما 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ﺭﻭﻣﻴﺔ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("روم 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("رو 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول الثانية إلى أهل كورنثوس 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("الرسالة الثانية إلى أهل كورنثوس 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("كورنثوس الثانية 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 قور 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2كو 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول الثانية إلى أهل كورنثوس 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("الرسالة الثانية إلى أهل كورنثوس 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("كورنثوس الثانية 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 قور 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2كو 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول الأولى إلى أهل كورنثوس 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("الرسالة الأولى إلى أهل كورنثوس 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("كورنثوس الأولى 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ﻛﻮﺭﻧﺜﻮﺱ ﺍﻻﻭﻝ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 قور 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1كو 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول الأولى إلى أهل كورنثوس 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("الرسالة الأولى إلى أهل كورنثوس 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("كورنثوس الأولى 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ﻛﻮﺭﻧﺜﻮﺱ ﺍﻻﻭﻝ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 قور 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1كو 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى أهل غلاطية 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("الرسالة إلى أهل غلاطية 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("رسالة غلاطية 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ﻏﻼﻃﻲ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("غل 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى أهل غلاطية 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("الرسالة إلى أهل غلاطية 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("رسالة غلاطية 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ﻏﻼﻃﻲ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("غل 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى أهل أفسس 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("الرسالة إلى أهل أفسس 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("رسالة أفسس 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ﺃﻓﺴﺲ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("أف 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى أهل أفسس 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("الرسالة إلى أهل أفسس 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("رسالة أفسس 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ﺃﻓﺴﺲ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("أف 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى أهل فيلبي 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("الرسالة إلى أهل فيلبي 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("رسالة فيلبي 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ﻓﻴﻠﻴﺒﻲ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("فل 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("في 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى أهل فيلبي 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("الرسالة إلى أهل فيلبي 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("رسالة فيلبي 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ﻓﻴﻠﻴﺒﻲ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("فل 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("في 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى أهل كولوسي 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("الرسالة إلى أهل كولوسي 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("رسالة كولوسي 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ﻛﻮﻟﻮﺳﻲ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("قول 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("كو 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى أهل كولوسي 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("الرسالة إلى أهل كولوسي 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("رسالة كولوسي 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("ﻛﻮﻟﻮﺳﻲ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("قول 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("كو 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول الثانية إلى أهل تسالونيكي 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("الرسالة الثانية إلى أهل تسالونيكي 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("رسالة تسالونيكي الثانية 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ﺍﻟﺜﺎﻧﻴﺔ ﺗﺴﺎﻟﻮﻧﻴﻜﻲ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 تس 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول الثانية إلى أهل تسالونيكي 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("الرسالة الثانية إلى أهل تسالونيكي 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("رسالة تسالونيكي الثانية 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ﺍﻟﺜﺎﻧﻴﺔ ﺗﺴﺎﻟﻮﻧﻴﻜﻲ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 تس 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول الأولى إلى أهل تسالونيكي 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("الرسالة الأولى إلى أهل تسالونيكي 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("رسالة تسالونيكي الأولى 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ﺍﻻﻭﻝ ﺗﺴﺎﻟﻮﻧﻴﻜﻲ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 تس 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول الأولى إلى أهل تسالونيكي 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("الرسالة الأولى إلى أهل تسالونيكي 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("رسالة تسالونيكي الأولى 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ﺍﻻﻭﻝ ﺗﺴﺎﻟﻮﻧﻴﻜﻲ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 تس 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول الثانية إلى تيموثاوس 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("الرسالة الثانية إلى تيموثاوس 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("تيموثاوس الثانية 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ﺍﻟﺜﺎﻧﻴﺔ ﺗﻴﻤﻮﺛﺎﻭﺱ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 طيم 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول الثانية إلى تيموثاوس 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("الرسالة الثانية إلى تيموثاوس 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("تيموثاوس الثانية 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ﺍﻟﺜﺎﻧﻴﺔ ﺗﻴﻤﻮﺛﺎﻭﺱ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 طيم 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول الأولى إلى تيموثاوس 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("الرسالة الأولى إلى تيموثاوس 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("تيموثاوس الأولى 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ﺍﻻﻭﻝ ﺗﻴﻤﻮﺛﺎﻭﺱ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 طيم 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول الأولى إلى تيموثاوس 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("الرسالة الأولى إلى تيموثاوس 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("تيموثاوس الأولى 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ﺍﻻﻭﻝ ﺗﻴﻤﻮﺛﺎﻭﺱ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 طيم 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى تيطس 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("الرسالة إلى تيطس 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("طيطس 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ﺗﻴﻄﺲ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("تي 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("طي 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى تيطس 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("الرسالة إلى تيطس 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("طيطس 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ﺗﻴﻄﺲ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("تي 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("طي 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (ar)", ->
		`
		expect(p.parse("رسالة بولس الرسول إلى فليمون 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("الرسالة إلى فليمون 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("فليمون 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("فيل 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ف 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة بولس الرسول إلى فليمون 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("الرسالة إلى فليمون 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("فليمون 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("فيل 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ف 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (ar)", ->
		`
		expect(p.parse("الرسالة إلى العبرانيين 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("العبرانيين 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("عب 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("الرسالة إلى العبرانيين 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("العبرانيين 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("عب 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (ar)", ->
		`
		expect(p.parse("رسالة القديس يعقوب 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("رسالة يعقوب 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("يعقوب 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("يع 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة القديس يعقوب 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("رسالة يعقوب 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("يعقوب 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("يع 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (ar)", ->
		`
		expect(p.parse("رسالة القديس بطرس الثانية 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("رسالة بطرس الثانية 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("بطرس الثانية 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("رسالة بطرس 2 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 بط 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2بط 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة القديس بطرس الثانية 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("رسالة بطرس الثانية 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("بطرس الثانية 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("رسالة بطرس 2 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 بط 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2بط 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (ar)", ->
		`
		expect(p.parse("رسالة القديس بطرس الأولى 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("رسالة بطرس الأولى 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("رسالة بطرس 1 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("بطرس الأولى 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 بط 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1بط 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالة القديس بطرس الأولى 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("رسالة بطرس الأولى 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("رسالة بطرس 1 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("بطرس الأولى 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 بط 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1بط 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (ar)", ->
		`
		expect(p.parse("رسالى القديس يهوذا 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("رسالة يهوذا 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("يهوذا 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("يهو 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("يه 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("رسالى القديس يهوذا 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("رسالة يهوذا 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("يهوذا 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("يهو 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("يه 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (ar)", ->
		`
		expect(p.parse("سفر طوبيا 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("طوبيا 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("طو 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (ar)", ->
		`
		expect(p.parse("سفر يهوديت 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("يهوديت 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("يـه 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (ar)", ->
		`
		expect(p.parse("سفر باروخ 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("باروك 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("با 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (ar)", ->
		`
		expect(p.parse("كتاب سوزانا 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("سوزانا 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (ar)", ->
		`
		expect(p.parse("سفر المكابين الثاني 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("المكابين الثاني 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 المكابيين 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 مك 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (ar)", ->
		`
		expect(p.parse("المكابين الثالث 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (ar)", ->
		`
		expect(p.parse("المكابين الرابع 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (ar)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (ar)", ->
		`
		expect(p.parse("سفر المكابين الأول 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("المكابين الأول 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 المكابيين 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 مك 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (ar)", ->
		expect(p.parse("Titus 1:1 to 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1to2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 TO 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (ar)", ->
		expect(p.parse("Titus 1:1, فصل 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 فصل 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (ar)", ->
		expect(p.parse("Exod 1:1 آية 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm آية 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (ar)", ->
		expect(p.parse("Exod 1:1 ، 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ، 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (ar)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (ar)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (ar)", ->
		expect(p.parse("Lev 1 (ALAB)").osis_and_translations()).toEqual [["Lev.1", "ALAB"]]
		expect(p.parse("lev 1 alab").osis_and_translations()).toEqual [["Lev.1", "ALAB"]]
		expect(p.parse("Lev 1 (VD)").osis_and_translations()).toEqual [["Lev.1", "VD"]]
		expect(p.parse("lev 1 vd").osis_and_translations()).toEqual [["Lev.1", "VD"]]
	it "should handle boundaries (ar)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

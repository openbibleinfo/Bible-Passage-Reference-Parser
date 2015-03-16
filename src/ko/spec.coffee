bcv_parser = require("../../js/ko_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (ko)", ->
		`
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("창세기 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("창세 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("창 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("창세기 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("창세 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("창 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (ko)", ->
		`
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("출애굽기 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("탈출기 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("탈출 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("출 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("출애굽기 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("탈출기 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("탈출 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("출 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (ko)", ->
		`
		expect(p.parse("벨과 뱀 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("벨과 용 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Num (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (ko)", ->
		`
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("민수기 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("민수 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("민 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("민수기 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("민수 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("민 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (ko)", ->
		`
		expect(p.parse("벤시라크의 지혜 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("벤시리크의 지혜 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("벤시라의 지혜 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("벤시라크 지혜 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("벤시라 지혜 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("집회서 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("집회 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (ko)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("지혜서 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("지혜 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (ko)", ->
		`
		expect(p.parse("예레미야 애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("예레미아애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("예레미야애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("애 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("예레미야 애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("예레미아애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("예레미야애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("애가 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("애 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (ko)", ->
		`
		expect(p.parse("예레미야의 편지 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (ko)", ->
		`
		expect(p.parse("요한 계시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("요한 묵시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("요한계시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("요한묵시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("묵시 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("요한 계시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("요한 묵시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("요한계시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("요한묵시록 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("묵시 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (ko)", ->
		`
		expect(p.parse("므나쎄의 기도 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (ko)", ->
		`
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("신명기 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("신명 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("신 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("신명기 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("신명 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("신 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (ko)", ->
		`
		expect(p.parse("여호수아기 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("여호수아 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("여호 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("수 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("여호수아기 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("여호수아 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("여호 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("수 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (ko)", ->
		`
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("사사기 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("판관기 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("판관 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("삿 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("사사기 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("판관기 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("판관 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("삿 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (ko)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("룻기 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("룻 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("룻기 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("룻 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (ko)", ->
		`
		expect(p.parse("에스드라 1서 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (ko)", ->
		`
		expect(p.parse("에스드라 2서 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (ko)", ->
		`
		expect(p.parse("이사야서 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("이사야 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("이사 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("사 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("이사야서 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("이사야 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("이사 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("사 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (ko)", ->
		`
		expect(p.parse("사무엘기 하권 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("사무엘 하 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("사무엘기하 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("사무엘하 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2사무 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("삼하 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("사무엘기 하권 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("사무엘 하 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("사무엘기하 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("사무엘하 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2사무 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("삼하 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (ko)", ->
		`
		expect(p.parse("사무엘기 상권 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("사무엘 상 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("사무엘기상 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("사무엘상 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1사무 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("삼상 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("사무엘기 상권 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("사무엘 상 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("사무엘기상 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("사무엘상 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1사무 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("삼상 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (ko)", ->
		`
		expect(p.parse("열왕기 하권 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("열왕기 하 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("열왕기하 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2열왕 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("왕하 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("열왕기 하권 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("열왕기 하 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("열왕기하 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2열왕 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("왕하 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (ko)", ->
		`
		expect(p.parse("열왕기 상권 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("열왕기 상 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("열왕기상 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1열왕 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("왕상 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("열왕기 상권 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("열왕기 상 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("열왕기상 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1열왕 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("왕상 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (ko)", ->
		`
		expect(p.parse("역대기 하권 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("역대기 하 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("역대지하 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2역대 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("역대하 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("대하 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("역대기 하권 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("역대기 하 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("역대지하 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2역대 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("역대하 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("대하 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (ko)", ->
		`
		expect(p.parse("역대기 상권 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("역대기 상 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("역대지상 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1역대 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("역대상 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("대상 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("역대기 상권 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("역대기 상 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("역대지상 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1역대 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("역대상 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("대상 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book GkEsth (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (ko)", ->
		`
		expect(p.parse("에스겔 추가본 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("에스텔 추가본 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (ko)", ->
		`
		expect(p.parse("에스테르기 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스더기 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스더 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스텔 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("에스테르기 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스더기 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스더 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스텔 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에스 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("에 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Neh (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (ko)", ->
		`
		expect(p.parse("느헤미야기 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느헤미아 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느헤미야 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느헤 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("느헤미야기 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느헤미아 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느헤미야 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느헤 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("느 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book Job (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (ko)", ->
		`
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("욥기 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("욥 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("욥기 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("욥 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (ko)", ->
		`
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("시편 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("시 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("시편 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("시 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (ko)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (ko)", ->
		`
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("잠언 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("잠 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("잠언 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("잠 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Acts (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (ko)", ->
		`
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("사도행전 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("사도 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("사도행전 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("사도 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Eccl (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (ko)", ->
		`
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("전도서 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("코헬렛 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("코헬 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("전 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("전도서 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("코헬렛 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("코헬 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("전 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (ko)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Jer (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (ko)", ->
		`
		expect(p.parse("예레미야서 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("예레미아 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("예레미야 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("예레 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("렘 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("예레미야서 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("예레미아 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("예레미야 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("예레 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("렘 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Phlm (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (ko)", ->
		`
		expect(p.parse("필레몬에게 보낸 서간 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("빌레몬서 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("필레몬서 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("필레 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("필레몬에게 보낸 서간 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("빌레몬서 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("필레몬서 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("필레 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Lev (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (ko)", ->
		`
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("레위기 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("레위 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("레 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("레위기 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("레위 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("레 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Ezek (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (ko)", ->
		`
		expect(p.parse("에제키엘서 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에스겔서 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에제키엘 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에스겔 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에제 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("겔 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("에제키엘서 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에스겔서 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에제키엘 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에스겔 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("에제 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("겔 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (ko)", ->
		`
		expect(p.parse("다니엘서 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("다니엘 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("다니 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("단 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("다니엘서 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("다니엘 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("다니 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("단 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (ko)", ->
		`
		expect(p.parse("호세아서 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("호세아 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("호세 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("호 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("호세아서 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("호세아 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("호세 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("호 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (ko)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("요엘서 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("요엘 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("욜 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("요엘서 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("요엘 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("욜 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (ko)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("아모스서 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("아모스 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("아모 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("암 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("아모스서 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("아모스 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("아모 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("암 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Ezra (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (ko)", ->
		`
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에스라기 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에즈라기 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에스라 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에즈라 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에즈 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("스 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에스라기 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에즈라기 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에스라 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에즈라 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("에즈 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("스 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Obad (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (ko)", ->
		`
		expect(p.parse("오바드야서 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바댜서 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바디야 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바댜 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("옵 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("오바드야서 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바댜서 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바디야 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바댜 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("오바 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("옵 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (ko)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("요나서 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("요나 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("욘 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("요나서 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("요나 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("욘 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (ko)", ->
		`
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미가서 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미카서 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미가 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미카 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미가서 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미카서 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미가 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미카 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("미 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Sus (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (ko)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("수산나 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book Nah (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (ko)", ->
		`
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("나훔서 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("나훔 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("나 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("나훔서 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("나훔 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("나 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (ko)", ->
		`
		expect(p.parse("하바쿡서 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하박국서 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하바꾹 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하박국 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하바 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("합 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("하바쿡서 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하박국서 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하바꾹 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하박국 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("하바 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("합 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (ko)", ->
		`
		expect(p.parse("스바니야서 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바냐서 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바니야 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바냐 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("습 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("스바니야서 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바냐서 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바니야 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바냐 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("스바 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("습 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (ko)", ->
		`
		expect(p.parse("하까이서 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("학개서 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("하까 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("하깨 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("학개 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("학 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("하까이서 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("학개서 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("하까 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("하깨 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("학개 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("학 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (ko)", ->
		`
		expect(p.parse("즈카르야서 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("스가랴서 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("즈가리야 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("스가랴 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("즈카 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("슥 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("즈카르야서 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("스가랴서 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("즈가리야 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("스가랴 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("즈카 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("슥 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (ko)", ->
		`
		expect(p.parse("말라기서 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말라키서 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말라기 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말라 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("말라기서 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말라키서 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말라기 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말라 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("말 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Gal (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (ko)", ->
		`
		expect(p.parse("갈라티아 신자들에게 보낸 서간 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("갈라디아서 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("갈라 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("갈라티아 신자들에게 보낸 서간 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("갈라디아서 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("갈라 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Song (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (ko)", ->
		`
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("아가 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("아 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("아가 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("아 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Matt (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (ko)", ->
		`
		expect(p.parse("마태오 복음서 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태오 복음 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태복음서 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태복음 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("마태오 복음서 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태오 복음 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태복음서 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태복음 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("마태 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (ko)", ->
		`
		expect(p.parse("마르코 복음서 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마르코 복음 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마가복음서 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마가복음 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마가 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마르 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("마르코 복음서 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마르코 복음 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마가복음서 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마가복음 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마가 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("마르 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (ko)", ->
		`
		expect(p.parse("루카 복음서 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("누가복음서 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("루카 복음 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("누가복음 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("누가 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("루카 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("루카 복음서 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("누가복음서 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("루카 복음 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("누가복음 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("누가 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("루카 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (ko)", ->
		`
		expect(p.parse("요한의 첫째 서간 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("요한1서 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("요한일서 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1요한 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("요한의 첫째 서간 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("요한1서 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("요한일서 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1요한 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (ko)", ->
		`
		expect(p.parse("요한의 둘째 서간 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("요한2서 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("요한이서 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2요한 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("요한의 둘째 서간 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("요한2서 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("요한이서 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2요한 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (ko)", ->
		`
		expect(p.parse("요한의 셋째 서간 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("요한3서 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("요한삼서 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3요한 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("요한의 셋째 서간 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("요한3서 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("요한삼서 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3요한 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (ko)", ->
		`
		expect(p.parse("요한 복음서 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한 복음 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한복음서 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한복음 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("요한 복음서 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한 복음 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한복음서 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한복음 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("요한 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Rom (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (ko)", ->
		`
		expect(p.parse("로마 신자들에게 보낸 서간 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("로마서 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("로마 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("로마 신자들에게 보낸 서간 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("로마서 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("로마 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (ko)", ->
		`
		expect(p.parse("코린토 신자들에게 보낸 둘째 서간 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("고린도2서 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("고린도후서 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("코린토2서 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2코린 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("코린토 신자들에게 보낸 둘째 서간 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("고린도2서 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("고린도후서 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("코린토2서 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2코린 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (ko)", ->
		`
		expect(p.parse("코린토 신자들에게 보낸 첫째 서간 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("고린도1서 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("고린도전서 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("코린토1서 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1코린 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("코린토 신자들에게 보낸 첫째 서간 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("고린도1서 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("고린도전서 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("코린토1서 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1코린 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Eph (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (ko)", ->
		`
		expect(p.parse("에페소 신자들에게 보낸 서간 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("에베소서 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("에페소서 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("에페 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("에페소 신자들에게 보낸 서간 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("에베소서 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("에페소서 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("에페 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (ko)", ->
		`
		expect(p.parse("필리피 신자들에게 보낸 서간 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("빌립보서 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("필리피서 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("필리 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("필리피 신자들에게 보낸 서간 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("빌립보서 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("필리피서 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("필리 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (ko)", ->
		`
		expect(p.parse("콜로새 신자들에게 보낸 서간 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("골로새서 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("콜로새서 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("콜로 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("콜로새 신자들에게 보낸 서간 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("골로새서 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("콜로새서 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("콜로 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (ko)", ->
		`
		expect(p.parse("테살로니카 신자들에게 보낸 둘째 서간 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("데살로니가2서 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("데살로니가후서 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("테살로니카2서 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2테살 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("테살로니카 신자들에게 보낸 둘째 서간 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("데살로니가2서 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("데살로니가후서 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("테살로니카2서 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2테살 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (ko)", ->
		`
		expect(p.parse("테살로니카 신자들에게 보낸 첫째 서간 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("데살로니가1서 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("데살로니가전서 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("테살로니카1서 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1테살 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("테살로니카 신자들에게 보낸 첫째 서간 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("데살로니가1서 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("데살로니가전서 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("테살로니카1서 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1테살 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (ko)", ->
		`
		expect(p.parse("티모테오에게 보낸 둘째 서간 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("티모테오2서 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("디모데2서 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("디모데후서 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2티모 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("티모테오에게 보낸 둘째 서간 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("티모테오2서 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("디모데2서 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("디모데후서 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2티모 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (ko)", ->
		`
		expect(p.parse("티모테오에게 보낸 첫째 서간 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("티모테오1서 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("디모데1서 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1티모 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("티모테오에게 보낸 첫째 서간 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("티모테오1서 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("디모데1서 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1티모 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (ko)", ->
		`
		expect(p.parse("티토에게 보낸 서간 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("디도서 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("티토서 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("티토 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("티토에게 보낸 서간 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("디도서 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("티토서 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("티토 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Heb (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (ko)", ->
		`
		expect(p.parse("히브리인들에게 보낸 서간 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("히브리서 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("히브 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("히브리인들에게 보낸 서간 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("히브리서 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("히브 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (ko)", ->
		`
		expect(p.parse("야고보 서간 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("야고보서 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("야고 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("야고보 서간 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("야고보서 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("야고 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (ko)", ->
		`
		expect(p.parse("베드로의 둘째 서간 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("베드로2서 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("베드로후서 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2베드 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("베드로의 둘째 서간 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("베드로2서 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("베드로후서 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2베드 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (ko)", ->
		`
		expect(p.parse("베드로의 첫째 서간 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("베드로1서 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("베드로전서 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1베드 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("베드로의 첫째 서간 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("베드로1서 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("베드로전서 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1베드 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (ko)", ->
		`
		expect(p.parse("유다 서간 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("유다서 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("유다 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("유다 서간 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("유다서 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("유다 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (ko)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("토비트 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("토빗기 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("토빗 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (ko)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("유딧기 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("유딧 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (ko)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("바룩서 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("바룩 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book 2Macc (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (ko)", ->
		`
		expect(p.parse("마카베오기 하권 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("마카베오하 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2마카 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (ko)", ->
		`
		expect(p.parse("마카베오 3서 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3마카 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (ko)", ->
		`
		expect(p.parse("마카베오 4서 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4마카 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (ko)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (ko)", ->
		`
		expect(p.parse("마카베오기 상권 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("마카베오상 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1마카 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (ko)", ->
		expect(p.parse("Titus 1:1 ～ 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1～2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 ～ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
		expect(p.parse("Titus 1:1 ~ 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1~2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 ~ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (ko)", ->
		expect(p.parse("Titus 1:1, 장 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 장 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (ko)", ->
		expect(p.parse("Exod 1:1 절 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 절 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (ko)", ->
		expect(p.parse("Exod 1:1 and 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 AND 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (ko)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (ko)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (ko)", ->
		expect(p.parse("Lev 1 (KLB)").osis_and_translations()).toEqual [["Lev.1", "KLB"]]
		expect(p.parse("lev 1 klb").osis_and_translations()).toEqual [["Lev.1", "KLB"]]
	it "should handle boundaries (ko)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

bcv_parser = require("../../js/vi_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (vi)", ->
		`
		expect(p.parse("Sáng thế ký 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Sáng Thế 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Sáng 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SÁNG THẾ KÝ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("SÁNG THẾ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("SÁNG 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (vi)", ->
		`
		expect(p.parse("Xuất Ê-díp-tô ký 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Xuất Ai Cập Ký 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Xuất Ai-cập 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Xuất Hành 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Xuất 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("XUẤT Ê-DÍP-TÔ KÝ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("XUẤT AI CẬP KÝ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("XUẤT AI-CẬP 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("XUẤT HÀNH 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("XUẤT 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (vi)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Phlm (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (vi)", ->
		`
		expect(p.parse("Phi-lê-môn 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Philêmon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phi-lê 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PHI-LÊ-MÔN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHILÊMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHI-LÊ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Lev (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (vi)", ->
		`
		expect(p.parse("Lê-vi ký 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lê-vi 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lê 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LÊ-VI KÝ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LÊ-VI 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LÊ 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (vi)", ->
		`
		expect(p.parse("Dân số ký 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Dân Số 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Dân 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DÂN SỐ KÝ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("DÂN SỐ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("DÂN 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (vi)", ->
		`
		expect(p.parse("Huấn Ca 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (vi)", ->
		`
		expect(p.parse("Khôn Ngoan 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (vi)", ->
		`
		expect(p.parse("Ca thương 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Ai Ca 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Ai 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CA THƯƠNG 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("AI CA 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("AI 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (vi)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (vi)", ->
		`
		expect(p.parse("Khải Huyền của John 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Khải Huyền 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Khải thị 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Khải 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KHẢI HUYỀN CỦA JOHN 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("KHẢI HUYỀN 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("KHẢI THỊ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("KHẢI 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (vi)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (vi)", ->
		`
		expect(p.parse("Phục truyền luật lệ ký 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Phục Truyền Luật Lệ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Phục Truyền 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Đệ nhị luật 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Phục 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PHỤC TRUYỀN LUẬT LỆ KÝ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PHỤC TRUYỀN LUẬT LỆ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PHỤC TRUYỀN 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ĐỆ NHỊ LUẬT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PHỤC 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Joel (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (vi)", ->
		`
		expect(p.parse("Giô-ên 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIÔ-ÊN 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Jonah (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (vi)", ->
		`
		expect(p.parse("Giô-na 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIÔ-NA 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Nah (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (vi)", ->
		`
		expect(p.parse("Na-hum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Na-hâm 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Na 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NA-HUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NA-HÂM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NA 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Josh (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (vi)", ->
		`
		expect(p.parse("Giô-sua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Giô-suê 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Joshua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Giôs 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Gsua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Giô 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIÔ-SUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("GIÔ-SUÊ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSHUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("GIÔS 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("GSUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("GIÔ 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (vi)", ->
		`
		expect(p.parse("Các Thủ lãnh 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Các quan xét 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Thẩm phán 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Thủ lãnh 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Quan án 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Quan 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Thủ 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CÁC THỦ LÃNH 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("CÁC QUAN XÉT 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("THẨM PHÁN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("THỦ LÃNH 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("QUAN ÁN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("QUAN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("THỦ 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (vi)", ->
		`
		expect(p.parse("Ru-tơ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ru 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RU-TƠ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RU 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (vi)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (vi)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (vi)", ->
		`
		expect(p.parse("I-sa-gia 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("I-sai-a 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isaiah 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ê-sai 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("I-sa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("I-SA-GIA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("I-SAI-A 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISAIAH 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Ê-SAI 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("I-SA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (vi)", ->
		`
		expect(p.parse("II. Sa-mu-ên 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sa-mu-ên 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sa-mu-ên 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sa-mu-ên 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Sa 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sa 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sa 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sa 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. SA-MU-ÊN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SA-MU-ÊN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SA-MU-ÊN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SA-MU-ÊN 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (vi)", ->
		`
		expect(p.parse("1. Sa-mu-ên 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sa-mu-ên 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sa-mu-ên 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sa-mu-ên 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Sa 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sa 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sa 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sa 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. SA-MU-ÊN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SA-MU-ÊN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SA-MU-ÊN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SA-MU-ÊN 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SA 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (vi)", ->
		`
		expect(p.parse("II. Các Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Các Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Các Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Các Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Vua 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. CÁC VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. CÁC VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II CÁC VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 CÁC VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 VUA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (vi)", ->
		`
		expect(p.parse("1. Các Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Các Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Các Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Các Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Vua 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. CÁC VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. CÁC VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 CÁC VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I CÁC VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I VUA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (vi)", ->
		`
		expect(p.parse("II. Sử biên niên 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Sử biên niên 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Sử biên niên 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Sử biên niên 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Lịch sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Lịch sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Lịch sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II.  Sử Ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Lịch sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.  Sử Ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II  Sử Ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Sử ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2  Sử Ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Sử ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Sử ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Sử ký 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Sử 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. SỬ BIÊN NIÊN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. SỬ BIÊN NIÊN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II SỬ BIÊN NIÊN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 SỬ BIÊN NIÊN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. LỊCH SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. LỊCH SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II LỊCH SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II.  SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 LỊCH SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.  SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II  SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2  SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 SỬ KÝ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 SỬ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (vi)", ->
		`
		expect(p.parse("1. Sử biên niên 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Sử biên niên 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Sử biên niên 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Sử biên niên 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Lịch sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Lịch sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Lịch sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Lịch sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Sử Ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Sử ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Sử Ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Sử ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Sử Ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Sử ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Sử Ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Sử ký 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Sử 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Sử 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. SỬ BIÊN NIÊN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. SỬ BIÊN NIÊN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 SỬ BIÊN NIÊN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I SỬ BIÊN NIÊN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. LỊCH SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. LỊCH SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 LỊCH SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I LỊCH SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I SỬ KÝ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 SỬ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I SỬ 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (vi)", ->
		`
		expect(p.parse("E-xơ-ra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ê-xơ-ra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Étra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Êxra 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("E-XƠ-RA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ê-XƠ-RA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ÉTRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ÊXRA 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (vi)", ->
		`
		expect(p.parse("Nê-hê-mi-a 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nê-hê-mi 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nơkhemia 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nê 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NÊ-HÊ-MI-A 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NÊ-HÊ-MI 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NƠKHEMIA 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NÊ 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (vi)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (vi)", ->
		`
		expect(p.parse("Ê-xơ-tê 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esther 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("Ê-XƠ-TÊ 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTHER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (vi)", ->
		`
		expect(p.parse("Gióp 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIÓP 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Rom (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (vi)", ->
		`
		expect(p.parse("La-mã 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rô-ma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rôma 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LA-MÃ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÔ-MA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÔMA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book Mal (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (vi)", ->
		`
		expect(p.parse("Ma-la-chi 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Ma-la-ki 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malachi 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MA-LA-CHI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MA-LA-KI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALACHI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (vi)", ->
		`
		expect(p.parse("Ma-thi-ơ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mátthêu 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Ma 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MA-THI-Ơ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MÁTTHÊU 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MA 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Ps (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (vi)", ->
		`
		expect(p.parse("Thánh vịnh 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Thi Thiên 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Thánh Thi 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Thi 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("THÁNH VỊNH 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("THI THIÊN 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("THÁNH THI 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("THI 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (vi)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (vi)", ->
		`
		expect(p.parse("Châm ngôn 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Châm 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CHÂM NGÔN 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("CHÂM 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (vi)", ->
		`
		expect(p.parse("Truyền đạo 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Giáo huấn 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Giảng Sư 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Giáo 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TRUYỀN ĐẠO 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("GIÁO HUẤN 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("GIẢNG SƯ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("GIÁO 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (vi)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (vi)", ->
		`
		expect(p.parse("Diễm ca 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Tình ca 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Nhã ca 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Tình 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DIỄM CA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("TÌNH CA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("NHÃ CA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("TÌNH 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (vi)", ->
		`
		expect(p.parse("Giê-rê-mi-a 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Giê-rê-mi 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremiah 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Giê 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIÊ-RÊ-MI-A 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("GIÊ-RÊ-MI 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMIAH 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("GIÊ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (vi)", ->
		`
		expect(p.parse("Ê-xê-chi-ên 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ê-xê-chiên 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ê-xê-ki-ên 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezekiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ê-xê 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("Ê-XÊ-CHI-ÊN 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ê-XÊ-CHIÊN 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ê-XÊ-KI-ÊN 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ê-XÊ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (vi)", ->
		`
		expect(p.parse("Ða-ni-ên 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Đa-ni-ên 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Đa-niên 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Đanien 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Đa 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ÐA-NI-ÊN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ĐA-NI-ÊN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ĐA-NIÊN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ĐANIEN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ĐA 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (vi)", ->
		`
		expect(p.parse("Hô-sê-a 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ô-sê 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HÔ-SÊ-A 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ô-SÊ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Amos (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (vi)", ->
		`
		expect(p.parse("A-mốt 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("A-MỐT 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (vi)", ->
		`
		expect(p.parse("Ô-ba-đi-a 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadiah 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Áp-đia 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Áp 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("Ô-BA-ĐI-A 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADIAH 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ÁP-ĐIA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ÁP 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Mic (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (vi)", ->
		`
		expect(p.parse("Mi-chê 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mi-ca 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Micah 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mi 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MI-CHÊ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MI-CA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICAH 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MI 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Hag (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (vi)", ->
		`
		expect(p.parse("Ha-gai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Haggai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("A-gai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("A-ghê 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HA-GAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGGAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("A-GAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("A-GHÊ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Hab (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (vi)", ->
		`
		expect(p.parse("Ha-ba-cúc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habakkuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Ha 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HA-BA-CÚC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABAKKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HA 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (vi)", ->
		`
		expect(p.parse("Sô-phô-ni-a 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Xê-pha-ni-a 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sô-phô-ni 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Xô-phô-ni 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zephaniah 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Xô 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SÔ-PHÔ-NI-A 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("XÊ-PHA-NI-A 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SÔ-PHÔ-NI 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("XÔ-PHÔ-NI 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPHANIAH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("XÔ 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Zech (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (vi)", ->
		`
		expect(p.parse("Xa-cha-ri-a 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Xê-ca-ri-a 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Xa-cha-ri 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zechariah 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Xa 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("XA-CHA-RI-A 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("XÊ-CA-RI-A 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("XA-CHA-RI 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECHARIAH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("XA 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mark (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (vi)", ->
		`
		expect(p.parse("Máccô 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mác 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MÁCCÔ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MÁC 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (vi)", ->
		`
		expect(p.parse("Lu-ca 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luca 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lu 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LU-CA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUCA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LU 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (vi)", ->
		`
		expect(p.parse("1. Gioan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Giăng 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Gioan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Giăng 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Gioan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Giăng 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Gioan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Giăng 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Gi 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Gi 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Gi 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Gi 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. GIOAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. GIĂNG 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. GIOAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. GIĂNG 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 GIOAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 GIĂNG 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I GIOAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I GIĂNG 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. GI 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. GI 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 GI 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I GI 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (vi)", ->
		`
		expect(p.parse("II. Gioan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Giăng 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Gioan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Giăng 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Gioan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Giăng 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Gioan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Giăng 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Gi 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Gi 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Gi 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Gi 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. GIOAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. GIĂNG 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. GIOAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. GIĂNG 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II GIOAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II GIĂNG 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 GIOAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 GIĂNG 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. GI 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. GI 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II GI 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 GI 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (vi)", ->
		`
		expect(p.parse("III. Gioan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Giăng 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Gioan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Giăng 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Gioan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Giăng 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Gioan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Giăng 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Gi 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Gi 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Gi 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Gi 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("III. GIOAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. GIĂNG 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III GIOAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III GIĂNG 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. GIOAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. GIĂNG 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 GIOAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 GIĂNG 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. GI 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III GI 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. GI 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 GI 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (vi)", ->
		`
		expect(p.parse("Gioan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Giăng 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Gg 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Gi 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIOAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("GIĂNG 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("GG 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("GI 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (vi)", ->
		`
		expect(p.parse("Công vụ các Sứ đồ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Công vụ Tông đồ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Công Vụ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Sứ đồ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Công 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CÔNG VỤ CÁC SỨ ĐỒ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("CÔNG VỤ TÔNG ĐỒ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("CÔNG VỤ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("SỨ ĐỒ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("CÔNG 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book 2Cor (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (vi)", ->
		`
		expect(p.parse("II. Cô-rinh-tô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Cô-rinh-tô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Cô-rinh-tô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cô-rinh-tô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Cô-rinh 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Côrintô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Cô-rinh 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Côrintô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Cô-rinh 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Côrintô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cô-rinh 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Côrintô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Cô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Cô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Cô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cô 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. CÔ-RINH-TÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CÔ-RINH-TÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CÔ-RINH-TÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CÔ-RINH-TÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CÔ-RINH 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CÔRINTÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CÔ-RINH 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CÔRINTÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CÔ-RINH 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CÔRINTÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CÔ-RINH 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CÔRINTÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CÔ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (vi)", ->
		`
		expect(p.parse("1. Cô-rinh-tô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Cô-rinh-tô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cô-rinh-tô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Cô-rinh-tô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Cô-rinh 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Côrintô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Cô-rinh 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Côrintô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cô-rinh 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Côrintô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Cô-rinh 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Côrintô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Cô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Cô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cô 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Cô 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. CÔ-RINH-TÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CÔ-RINH-TÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CÔ-RINH-TÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CÔ-RINH-TÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CÔ-RINH 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CÔRINTÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CÔ-RINH 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CÔRINTÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CÔ-RINH 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CÔRINTÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CÔ-RINH 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CÔRINTÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CÔ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CÔ 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (vi)", ->
		`
		expect(p.parse("Ga-la-ti 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galát 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GA-LA-TI 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALÁT 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (vi)", ->
		`
		expect(p.parse("Ê-phê-sô 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Êphêsô 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Êph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("Ê-PHÊ-SÔ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ÊPHÊSÔ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ÊPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (vi)", ->
		`
		expect(p.parse("Philípphê 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phi-líp 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PHILÍPPHÊ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHI-LÍP 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (vi)", ->
		`
		expect(p.parse("Cô-lô-se 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Côlôxê 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Côl 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CÔ-LÔ-SE 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("CÔLÔXÊ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("CÔL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (vi)", ->
		`
		expect(p.parse("II. Thê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Thê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Thê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tê-sa-lô-ni-ca 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Thêxalônica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Thêxalônica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Thêxalônica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thêxalônica 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tê 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tê 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tê 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tê 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. THÊXALÔNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. THÊXALÔNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II THÊXALÔNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THÊXALÔNICA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TÊ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TÊ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TÊ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TÊ 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (vi)", ->
		`
		expect(p.parse("1. Thê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Thê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Thê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tê-sa-lô-ni-ca 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Thêxalônica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Thêxalônica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thêxalônica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Thêxalônica 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tê 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tê 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tê 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tê 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I THÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TÊ-SA-LÔ-NI-CA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. THÊXALÔNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. THÊXALÔNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THÊXALÔNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I THÊXALÔNICA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TÊ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TÊ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TÊ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TÊ 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (vi)", ->
		`
		expect(p.parse("II. Ti-mô-thê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Ti-mô-thê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Ti-mô-thê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Ti-mô-thê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timôthê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timôthê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timôthê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timôthê 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. TI-MÔ-THÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TI-MÔ-THÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TI-MÔ-THÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TI-MÔ-THÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMÔTHÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMÔTHÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMÔTHÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMÔTHÊ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (vi)", ->
		`
		expect(p.parse("1. Ti-mô-thê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Ti-mô-thê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Ti-mô-thê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Ti-mô-thê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timôthê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timôthê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timôthê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timôthê 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. TI-MÔ-THÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TI-MÔ-THÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TI-MÔ-THÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TI-MÔ-THÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMÔTHÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMÔTHÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMÔTHÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMÔTHÊ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (vi)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titô 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tích 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tít 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITÔ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍCH 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Heb (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (vi)", ->
		`
		expect(p.parse("Hê-bơ-rơ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Do Thái 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hê 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HÊ-BƠ-RƠ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("DO THÁI 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HÊ 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (vi)", ->
		`
		expect(p.parse("Giacôbê 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Gia-cơ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIACÔBÊ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("GIA-CƠ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (vi)", ->
		`
		expect(p.parse("II. Phi-e-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Phi-e-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Phi-e-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Phia-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Phi-e-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Phia-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Phia-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Phi-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Phê-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Phia-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Phi-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Phê-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Phi-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Phê-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Phêrô 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Phi-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Phê-rơ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Phêrô 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Phêrô 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Phia 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Phêrô 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Phia 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Phia 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Phia 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("II. PHI-E-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PHI-E-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PHI-E-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PHIA-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PHI-E-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PHIA-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PHIA-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PHI-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PHÊ-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PHIA-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PHI-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PHÊ-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PHI-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PHÊ-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PHÊRÔ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PHI-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PHÊ-RƠ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PHÊRÔ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PHÊRÔ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PHIA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PHÊRÔ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PHIA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PHIA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PHIA 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (vi)", ->
		`
		expect(p.parse("1. Phi-e-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Phi-e-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Phi-e-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Phia-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Phi-e-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Phia-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Phia-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Phi-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Phê-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Phia-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Phi-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Phê-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Phi-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Phê-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Phêrô 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Phi-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Phê-rơ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Phêrô 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Phêrô 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Phia 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Phêrô 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Phia 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Phia 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Phia 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("1. PHI-E-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PHI-E-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PHI-E-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PHIA-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PHI-E-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PHIA-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PHIA-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PHI-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PHÊ-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PHIA-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PHI-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PHÊ-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PHI-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PHÊ-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PHÊRÔ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PHI-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PHÊ-RƠ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PHÊRÔ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PHÊRÔ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PHIA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PHÊRÔ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PHIA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PHIA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PHIA 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (vi)", ->
		`
		expect(p.parse("Giu-đe 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Giuđa 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GIU-ĐE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("GIUĐA 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (vi)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (vi)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (vi)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (vi)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (vi)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (vi)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (vi)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (vi)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (vi)", ->
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

	it "should handle ranges (vi)", ->
		expect(p.parse("Titus 1:1 to 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1to2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 TO 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (vi)", ->
		expect(p.parse("Titus 1:1, chương 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHƯƠNG 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (vi)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (vi)", ->
		expect(p.parse("Exod 1:1 và 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 VÀ 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (vi)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (vi)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (vi)", ->
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("Lev 1 (1934)").osis_and_translations()).toEqual [["Lev.1", "1934"]]
		expect(p.parse("lev 1 1934").osis_and_translations()).toEqual [["Lev.1", "1934"]]
	it "should handle book ranges (vi)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("I to III  Gioan").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (vi)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

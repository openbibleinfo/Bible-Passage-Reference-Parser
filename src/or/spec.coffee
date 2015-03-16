bcv_parser = require("../../js/or_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (or)", ->
		`
		expect(p.parse("ଆଦିପୁସ୍ତକ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ଆଦି 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଆଦିପୁସ୍ତକ 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("ଆଦି 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (or)", ->
		`
		expect(p.parse("ଯାତ୍ରା ପୁସ୍ତକ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ଯାତ୍ରାପୁସ୍ତକ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ଯାତ୍ରା 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯାତ୍ରା ପୁସ୍ତକ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ଯାତ୍ରାପୁସ୍ତକ 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ଯାତ୍ରା 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (or)", ->
		`
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (or)", ->
		`
		expect(p.parse("ଲେବୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ଲେବୀୟ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଲେବୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ଲେବୀୟ 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (or)", ->
		`
		expect(p.parse("ଗଣନା ପୁସ୍ତକ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ଗଣନା 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଗଣନା ପୁସ୍ତକ 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ଗଣନା 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (or)", ->
		`
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (or)", ->
		`
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (or)", ->
		`
		expect(p.parse("ଯିରିମିୟଙ୍କ ବିଳାପ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିରିମିୟଙ୍କ ବିଳାପ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (or)", ->
		`
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (or)", ->
		`
		expect(p.parse("ଯୋହନଙ୍କ ପ୍ରତି ପ୍ରକାଶିତ ବାକ୍ୟ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୋହନଙ୍କ ପ୍ରତି ପ୍ରକାଶିତ ବାକ୍ୟ 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (or)", ->
		`
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (or)", ->
		`
		expect(p.parse("ଦ୍ୱିତୀୟ ବିବରଣୀ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ବିବରଣ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ବିବରଣି 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଦ୍ୱିତୀୟ ବିବରଣୀ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ବିବରଣ 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("ବିବରଣି 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (or)", ->
		`
		expect(p.parse("ଯିହୋଶୂୟଙ୍କର ପୁସ୍ତକ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ଯିହୋଶୂୟଙ୍କର 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିହୋଶୂୟଙ୍କର ପୁସ୍ତକ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("ଯିହୋଶୂୟଙ୍କର 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (or)", ->
		`
		expect(p.parse("ବିଗ୍ଭରକର୍ତ୍ତାମାନଙ୍କ ବିବରଣ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ବିଗ୍ଭରକର୍ତ୍ତାମାନଙ୍କ ବିବରଣ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (or)", ->
		`
		expect(p.parse("ଋତର ବିବରଣ ପୁସ୍ତକ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଋତର ବିବରଣ ପୁସ୍ତକ 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (or)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (or)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (or)", ->
		`
		expect(p.parse("ଯିଶାଇୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କର ପୁସ୍ତକ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ଯାଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ଯିଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ଯୀଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ୟଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ୟିଶାୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିଶାଇୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କର ପୁସ୍ତକ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ଯାଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ଯିଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ଯୀଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ୟଶାଇୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ୟିଶାୟ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (or)", ->
		`
		expect(p.parse("ଶାମୁୟେଲଙ୍କ ଦ୍ୱିତୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଶାମୁୟେଲଙ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଶାମୁୟେଲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. ଶାମୁୟେଲଙ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ଶାମୁୟେଲଙ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. ଶାମୁୟେଲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ଶାମୁୟେଲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଶାମୁୟେଲଙ୍କ ଦ୍ୱିତୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଶାମୁୟେଲଙ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଶାମୁୟେଲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. ଶାମୁୟେଲଙ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ଶାମୁୟେଲଙ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. ଶାମୁୟେଲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 ଶାମୁୟେଲ 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (or)", ->
		`
		expect(p.parse("ଶାମୁୟେଲଙ୍କ ପ୍ରଥମ ପୁସ୍ତକ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ପ୍ରଥମ ଶାମୁୟେଲଙ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ପ୍ରଥମ ଶାମୁୟେଲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. ଶାମୁୟେଲଙ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ଶାମୁୟେଲଙ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. ଶାମୁୟେଲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ଶାମୁୟେଲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଶାମୁୟେଲଙ୍କ ପ୍ରଥମ ପୁସ୍ତକ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ପ୍ରଥମ ଶାମୁୟେଲଙ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("ପ୍ରଥମ ଶାମୁୟେଲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. ଶାମୁୟେଲଙ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ଶାମୁୟେଲଙ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. ଶାମୁୟେଲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 ଶାମୁୟେଲ 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (or)", ->
		`
		expect(p.parse("ରାଜାବଳୀର ଦ୍ୱିତୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ରାଜାବଳୀର 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ରାଜାବଳୀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. ରାଜାବଳୀର 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ରାଜାବଳୀର 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. ରାଜାବଳୀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ରାଜାବଳୀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ରାଜାବଳୀର ଦ୍ୱିତୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ରାଜାବଳୀର 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ରାଜାବଳୀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. ରାଜାବଳୀର 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ରାଜାବଳୀର 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. ରାଜାବଳୀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 ରାଜାବଳୀ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (or)", ->
		`
		expect(p.parse("ରାଜାବଳୀର ପ୍ରଥମ ପୁସ୍ତକ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ପ୍ରଥମ ରାଜାବଳୀର 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ପ୍ରଥମ ରାଜାବଳୀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. ରାଜାବଳୀର 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ରାଜାବଳୀର 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. ରାଜାବଳୀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ରାଜାବଳୀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ରାଜାବଳୀର ପ୍ରଥମ ପୁସ୍ତକ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ପ୍ରଥମ ରାଜାବଳୀର 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("ପ୍ରଥମ ରାଜାବଳୀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. ରାଜାବଳୀର 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ରାଜାବଳୀର 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. ରାଜାବଳୀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 ରାଜାବଳୀ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (or)", ->
		`
		expect(p.parse("ବଂଶାବଳୀର ଦ୍ୱିତୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ବଂଶାବଳୀର 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ବଂଶାବଳୀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ବଂଶାବଳୀର 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ବଂଶାବଳୀର 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ବଂଶାବଳୀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ବଂଶାବଳୀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ବଂଶାବଳୀର ଦ୍ୱିତୀୟ ପୁସ୍ତକ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ବଂଶାବଳୀର 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ବଂଶାବଳୀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ବଂଶାବଳୀର 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ବଂଶାବଳୀର 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. ବଂଶାବଳୀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 ବଂଶାବଳୀ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (or)", ->
		`
		expect(p.parse("ବଂଶାବଳୀର ପ୍ରଥମ ପୁସ୍ତକ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ପ୍ରଥମ ବଂଶାବଳୀର 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ପ୍ରଥମ ବଂଶାବଳୀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ବଂଶାବଳୀର 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ବଂଶାବଳୀର 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ବଂଶାବଳୀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ବଂଶାବଳୀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ବଂଶାବଳୀର ପ୍ରଥମ ପୁସ୍ତକ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ପ୍ରଥମ ବଂଶାବଳୀର 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("ପ୍ରଥମ ବଂଶାବଳୀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ବଂଶାବଳୀର 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ବଂଶାବଳୀର 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. ବଂଶାବଳୀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 ବଂଶାବଳୀ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (or)", ->
		`
		expect(p.parse("ଏଜ୍ରା 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଏଜ୍ରା 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (or)", ->
		`
		expect(p.parse("ନିହିମିୟାଙ୍କର ପୁସ୍ତକ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("ନିହିମିୟାଙ୍କର 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ନିହିମିୟାଙ୍କର ପୁସ୍ତକ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("ନିହିମିୟାଙ୍କର 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (or)", ->
		`
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (or)", ->
		`
		expect(p.parse("ଏଷ୍ଟର ବିବରଣ 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଏଷ୍ଟର ବିବରଣ 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (or)", ->
		`
		expect(p.parse("ଆୟୁବ ପୁସ୍ତକ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ଆୟୁବ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଆୟୁବ ପୁସ୍ତକ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("ଆୟୁବ 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (or)", ->
		`
		expect(p.parse("ଗୀତିସଂହିତା 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ଗାତସଂହିତା 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ଗୀତସଂହିତା 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଗୀତିସଂହିତା 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ଗାତସଂହିତା 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ଗୀତସଂହିତା 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (or)", ->
		`
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (or)", ->
		`
		expect(p.parse("ହିତୋପଦେଶ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ହିତୋପଦେଶ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (or)", ->
		`
		expect(p.parse("ଉପଦେଶକ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଉପଦେଶକ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (or)", ->
		`
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (or)", ->
		`
		expect(p.parse("ପରମଗୀତ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ପରମଗୀତ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (or)", ->
		`
		expect(p.parse("ଯିରିମିୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ଯିରିମିୟ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିରିମିୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("ଯିରିମିୟ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (or)", ->
		`
		expect(p.parse("ଯିହିଜିକଲ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ଯିହିଜିକଲ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିହିଜିକଲ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ଯିହିଜିକଲ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (or)", ->
		`
		expect(p.parse("ଦାନିୟେଲଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ଦାନିୟେଲଙ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଦାନିୟେଲଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("ଦାନିୟେଲଙ 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (or)", ->
		`
		expect(p.parse("ହୋଶେୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ହୋଶହେ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ହୋଶେୟ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ହୋଶେୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ହୋଶହେ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("ହୋଶେୟ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (or)", ->
		`
		expect(p.parse("ଯୋୟେଲ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ଯୋୟେଲ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୋୟେଲ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("ଯୋୟେଲ 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (or)", ->
		`
		expect(p.parse("ଆମୋଷ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ଆମୋଷ 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଆମୋଷ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ଆମୋଷ 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (or)", ->
		`
		expect(p.parse("ଓବଦିଅ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ଓବଦିଅ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଓବଦିଅ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ଓବଦିଅ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (or)", ->
		`
		expect(p.parse("ଯୂନସ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ଯୂନସ 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୂନସ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("ଯୂନସ 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (or)", ->
		`
		expect(p.parse("ମୀଖା ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ମିଖା 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ମୀଖା 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ମୀଖା ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ମିଖା 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("ମୀଖା 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (or)", ->
		`
		expect(p.parse("ନାହୂମ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("ନାହୂମ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ନାହୂମ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("ନାହୂମ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (or)", ->
		`
		expect(p.parse("ହବ‌କ୍‌କୂକ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ହବ‌କ୍‌କୂକ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ହବକୁକ୍ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ହବକୂକ୍ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ହବ‌କ୍‌କୂକ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ହବ‌କ୍‌କୂକ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ହବକୁକ୍ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ହବକୂକ୍ 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (or)", ->
		`
		expect(p.parse("ସିଫନିୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ସିଫନିୟ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ସିଫନିୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ସିଫନିୟ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (or)", ->
		`
		expect(p.parse("ହାଗୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("ହାଗୟ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ହାଗୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("ହାଗୟ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (or)", ->
		`
		expect(p.parse("ଯିଖରିୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ଯିଖରିୟ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିଖରିୟ ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ଯିଖରିୟ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (or)", ->
		`
		expect(p.parse("ମଲାଖି ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ମଲାଖି 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ମଲାଖି ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ ପୁସ୍ତକ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ମଲାଖି 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (or)", ->
		`
		expect(p.parse("ମାଥିଉ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ମାଥିଉ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ମାଥିଉ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("ମାଥିଉ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (or)", ->
		`
		expect(p.parse("ମାର୍କ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ମାର୍କ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ମାର୍କ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("ମାର୍କ 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (or)", ->
		`
		expect(p.parse("ଲୂକ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ଲୂକ 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଲୂକ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("ଲୂକ 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (or)", ->
		`
		expect(p.parse("ଯୋହନଙ୍କ ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ପ୍ରଥମ ଯୋହନଙ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ଯୋହନଙ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ଯୋହନଙ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୋହନଙ୍କ ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("ପ୍ରଥମ ଯୋହନଙ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. ଯୋହନଙ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 ଯୋହନଙ 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (or)", ->
		`
		expect(p.parse("ଯୋହନଙ୍କ ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଯୋହନଙ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ଯୋହନଙ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ଯୋହନଙ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୋହନଙ୍କ ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଯୋହନଙ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. ଯୋହନଙ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 ଯୋହନଙ 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (or)", ->
		`
		expect(p.parse("ଯୋହନଙ୍କ ତୃତୀୟ ପତ୍ର 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ତୃତୀୟ ଯୋହନଙ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ଯୋହନଙ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ଯୋହନଙ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୋହନଙ୍କ ତୃତୀୟ ପତ୍ର 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ତୃତୀୟ ଯୋହନଙ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. ଯୋହନଙ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 ଯୋହନଙ 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (or)", ->
		`
		expect(p.parse("ଯୋହନ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ଯୋହନ 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯୋହନ ଲିଖିତ ସୁସମାଗ୍ଭର 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("ଯୋହନ 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (or)", ->
		`
		expect(p.parse("ପ୍ରେରିତମାନଙ୍କ କାର୍ଯ୍ୟର ବିବରଣ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ପ୍ରେରିତ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ପ୍ରେରିତମାନଙ୍କ କାର୍ଯ୍ୟର ବିବରଣ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ପ୍ରେରିତ 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (or)", ->
		`
		expect(p.parse("ରୋମୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ରୋମୀୟଙ୍କ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ରୋମୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ରୋମୀୟଙ୍କ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (or)", ->
		`
		expect(p.parse("କରିନ୍ଥୀୟଙ୍କ ପ୍ରତି ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ କରିନ୍ଥୀୟ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. କରିନ୍ଥୀୟ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 କରିନ୍ଥୀୟ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("କରିନ୍ଥୀୟଙ୍କ ପ୍ରତି ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ କରିନ୍ଥୀୟ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. କରିନ୍ଥୀୟ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 କରିନ୍ଥୀୟ 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (or)", ->
		`
		expect(p.parse("କରିନ୍ଥୀୟଙ୍କ ପ୍ରତି ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ପ୍ରଥମ କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ପ୍ରଥମ କରିନ୍ଥୀୟ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. କରିନ୍ଥୀୟ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 କରିନ୍ଥୀୟ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("କରିନ୍ଥୀୟଙ୍କ ପ୍ରତି ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ପ୍ରଥମ କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("ପ୍ରଥମ କରିନ୍ଥୀୟ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 କରିନ୍ଥୀୟଙ୍କ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. କରିନ୍ଥୀୟ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 କରିନ୍ଥୀୟ 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (or)", ->
		`
		expect(p.parse("ଗାଲାତୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ଗାଲାତୀୟଙ୍କ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଗାଲାତୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("ଗାଲାତୀୟଙ୍କ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (or)", ->
		`
		expect(p.parse("ଏଫିସୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ଏଫିସୀୟଙ୍କ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଏଫିସୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("ଏଫିସୀୟଙ୍କ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (or)", ->
		`
		expect(p.parse("ଫିଲି‌ପ୍‌ପୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ଫିଲି‌ପ୍‌ପୀୟଙ୍କ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଫିଲି‌ପ୍‌ପୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("ଫିଲି‌ପ୍‌ପୀୟଙ୍କ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (or)", ->
		`
		expect(p.parse("କଲସୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("କଲସୀୟଙ୍କ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("କଲସୀୟଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("କଲସୀୟଙ୍କ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (or)", ->
		`
		expect(p.parse("ଥେସଲନୀକୀୟଙ୍କ ପ୍ରତି ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଥେସଲନୀକୀୟଙ୍କ ପ୍ରତି ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (or)", ->
		`
		expect(p.parse("ଥେସଲନୀକୀୟଙ୍କ ପ୍ରତି ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ପ୍ରଥମ ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଥେସଲନୀକୀୟଙ୍କ ପ୍ରତି ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("ପ୍ରଥମ ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 ଥେସଲନୀକୀୟଙ 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (or)", ->
		`
		expect(p.parse("ତୀମଥିଙ୍କ ପ୍ରତି ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ତୀମଥିଙ୍କ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ତୀମଥିଙ୍କ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ତୀମଥିଙ୍କ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ତୀମଥିଙ୍କ ପ୍ରତି ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ତୀମଥିଙ୍କ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. ତୀମଥିଙ୍କ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 ତୀମଥିଙ୍କ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (or)", ->
		`
		expect(p.parse("ତୀମଥିଙ୍କ ପ୍ରତି ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ପ୍ରଥମ ତୀମଥିଙ୍କ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ତୀମଥିଙ୍କ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ତୀମଥିଙ୍କ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ତୀମଥିଙ୍କ ପ୍ରତି ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("ପ୍ରଥମ ତୀମଥିଙ୍କ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. ତୀମଥିଙ୍କ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 ତୀମଥିଙ୍କ 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (or)", ->
		`
		expect(p.parse("ତୀତସଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ତୀତସଙ୍କ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ତୀତସଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("ତୀତସଙ୍କ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (or)", ->
		`
		expect(p.parse("ଫିଲୀମୋନଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ଫିଲୀମୋନଙ୍କ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଫିଲୀମୋନଙ୍କ ପ୍ରତି ପତ୍ର 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("ଫିଲୀମୋନଙ୍କ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (or)", ->
		`
		expect(p.parse("ଏବ୍ରୀ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଏବ୍ରୀ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (or)", ->
		`
		expect(p.parse("ଯାକୁବଙ୍କ ପତ୍ର 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ଯାକୁବଙ୍କ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯାକୁବଙ୍କ ପତ୍ର 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ଯାକୁବଙ୍କ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (or)", ->
		`
		expect(p.parse("ପିତରଙ୍କ ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ପିତରଙ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ପିତରଙ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ପିତରଙ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ପିତରଙ୍କ ଦ୍ୱିତୀୟ ପତ୍ର 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("ଦ୍ୱିତୀୟ ପିତରଙ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. ପିତରଙ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 ପିତରଙ 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (or)", ->
		`
		expect(p.parse("ପିତରଙ୍କ ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ପ୍ରଥମ ପିତରଙ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ପିତରଙ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ପିତରଙ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ପିତରଙ୍କ ପ୍ରଥମ ପତ୍ର 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("ପ୍ରଥମ ପିତରଙ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. ପିତରଙ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 ପିତରଙ 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (or)", ->
		`
		expect(p.parse("ଯିହୂଦାଙ୍କ ପତ୍ର 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ଯିହୂଦାଙ୍କ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ଯିହୂଦାଙ୍କ ପତ୍ର 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("ଯିହୂଦାଙ୍କ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (or)", ->
		`
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (or)", ->
		`
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (or)", ->
		`
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (or)", ->
		`
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (or)", ->
		`
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (or)", ->
		`
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (or)", ->
		`
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (or)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (or)", ->
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

	it "should handle ranges (or)", ->
		expect(p.parse("Titus 1:1 ଠାରୁ 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1ଠାରୁ2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 ଠାରୁ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (or)", ->
		expect(p.parse("Titus 1:1, chapter 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CHAPTER 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (or)", ->
		expect(p.parse("Exod 1:1 verse 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSE 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (or)", ->
		expect(p.parse("Exod 1:1 and 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 AND 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (or)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (or)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (or)", ->
		expect(p.parse("Lev 1 (ERV)").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
		expect(p.parse("lev 1 erv").osis_and_translations()).toEqual [["Lev.1", "ERV"]]
	it "should handle book ranges (or)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("ପ୍ରଥମ ଠାରୁ ତୃତୀୟ  ଯୋହନଙ").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (or)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

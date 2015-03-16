bcv_parser = require("../../js/is_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (is)", ->
		`
		expect(p.parse("Fyrsta bok Mose 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta bok Móse 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta bók Mose 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta bók Móse 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta Mosebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta Mosebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta Mósebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Fyrsta Mósebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mosebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mosebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mósebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mósebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mosebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mosebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mósebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mósebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mosebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mosebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mósebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mósebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mosebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mosebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mósebok 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mósebók 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mos 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mós 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mos 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mós 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mos 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mós 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mos 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mós 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1Mós 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRSTA BOK MOSE 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA BOK MÓSE 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA BÓK MOSE 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA BÓK MÓSE 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA MOSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA MOSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA MÓSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("FYRSTA MÓSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MÓSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MÓSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MÓSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MÓSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MÓSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MÓSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MÓSEBOK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MÓSEBÓK 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MÓS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MÓS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MÓS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MÓS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1MÓS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (is)", ->
		`
		expect(p.parse("Onnur bok Mose 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur bok Móse 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur bók Mose 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur bók Móse 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur bok Mose 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur bok Móse 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur bók Mose 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur bók Móse 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur Mosebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur Mosebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur Mósebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Onnur Mósebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur Mosebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur Mosebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur Mósebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Önnur Mósebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mosebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mosebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mósebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mósebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mosebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mosebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mósebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mósebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mosebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mosebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mósebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mósebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mosebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mosebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mósebok 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mósebók 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mos 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mós 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mos 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mós 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mos 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mós 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mos 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mós 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2Mós 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ONNUR BOK MOSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR BOK MÓSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR BÓK MOSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR BÓK MÓSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR BOK MOSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR BOK MÓSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR BÓK MOSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR BÓK MÓSE 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR MOSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR MOSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR MÓSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ONNUR MÓSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR MOSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR MOSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR MÓSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÖNNUR MÓSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MÓSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MÓSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MÓSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MÓSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MÓSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MÓSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MÓSEBOK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MÓSEBÓK 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MÓS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MÓS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MÓS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MÓS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2MÓS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (is)", ->
		`
		expect(p.parse("Bel og drekinn 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (is)", ->
		`
		expect(p.parse("Þriðja bok Mose 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja bok Móse 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja bók Mose 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja bók Móse 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja Mosebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja Mosebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja Mósebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Þriðja Mósebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mosebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mosebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mósebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mósebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mosebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mosebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mósebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mósebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mosebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mosebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mósebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mósebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mosebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mosebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mósebok 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mósebók 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Leviticus 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mós 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mós 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mós 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mós 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3Mós 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ÞRIÐJA BOK MOSE 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA BOK MÓSE 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA BÓK MOSE 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA BÓK MÓSE 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA MOSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA MOSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA MÓSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("ÞRIÐJA MÓSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MÓSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MÓSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MÓSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MÓSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MÓSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MÓSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MÓSEBOK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MÓSEBÓK 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVITICUS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MÓS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MÓS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MÓS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MÓS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3MÓS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (is)", ->
		`
		expect(p.parse("Fjorða bok Mose 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða bok Móse 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða bók Mose 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða bók Móse 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða bok Mose 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða bok Móse 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða bók Mose 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða bók Móse 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða Mosebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða Mosebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða Mósebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjorða Mósebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða Mosebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða Mosebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða Mósebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Fjórða Mósebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mosebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mosebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mósebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mósebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mosebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mosebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mósebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mósebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mosebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mosebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mósebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mósebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mosebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mosebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mósebok 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mósebók 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mos 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mós 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mos 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mós 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mos 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mós 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numeri 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mos 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mós 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4Mós 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FJORÐA BOK MOSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA BOK MÓSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA BÓK MOSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA BÓK MÓSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA BOK MOSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA BOK MÓSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA BÓK MOSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA BÓK MÓSE 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA MOSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA MOSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA MÓSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJORÐA MÓSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA MOSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA MOSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA MÓSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("FJÓRÐA MÓSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MÓSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MÓSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MÓSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MÓSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MÓSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MÓSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MÓSEBOK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MÓSEBÓK 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MÓS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MÓS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MÓS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMERI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MÓS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4MÓS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (is)", ->
		`
		expect(p.parse("Siraksbok 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Siraksbók 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Síraksbok 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Síraksbók 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sír 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (is)", ->
		`
		expect(p.parse("Speki Salomons 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Speki Salómons 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("SSal 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (is)", ->
		`
		expect(p.parse("Harmljoðin 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Harmljóðin 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Hlj 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HARMLJOÐIN 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("HARMLJÓÐIN 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("HLJ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (is)", ->
		`
		expect(p.parse("Bref Jeremia 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Bref Jeremía 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Bréf Jeremia 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Bréf Jeremía 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("BJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (is)", ->
		`
		expect(p.parse("Opinberunarbok Johannesar 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberunarbok Jóhannesar 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberunarbók Johannesar 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberunarbók Jóhannesar 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberun Johannesar 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberun Jóhannesar 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberunarbokin 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opinberunarbókin 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Opb 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OPINBERUNARBOK JOHANNESAR 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUNARBOK JÓHANNESAR 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUNARBÓK JOHANNESAR 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUNARBÓK JÓHANNESAR 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUN JOHANNESAR 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUN JÓHANNESAR 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUNARBOKIN 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPINBERUNARBÓKIN 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("OPB 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (is)", ->
		`
		expect(p.parse("Bæn Manasse 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("BMn 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (is)", ->
		`
		expect(p.parse("Fimmta bok Mose 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta bok Móse 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta bók Mose 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta bók Móse 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta Mosebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta Mosebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta Mósebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Fimmta Mósebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronomium 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mosebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mosebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mósebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mósebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mosebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mosebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mósebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mósebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mosebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mosebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mósebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mósebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mosebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mosebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mósebok 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mósebók 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mos 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mós 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mos 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mós 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mos 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mós 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mos 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mós 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5Mós 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FIMMTA BOK MOSE 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA BOK MÓSE 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA BÓK MOSE 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA BÓK MÓSE 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA MOSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA MOSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA MÓSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("FIMMTA MÓSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONOMIUM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MÓSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MÓSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MÓSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MÓSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MÓSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MÓSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MÓSEBOK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MÓSEBÓK 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MÓS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MÓS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MÓS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MÓS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5MÓS 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (is)", ->
		`
		expect(p.parse("Josuabok 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josuabók 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josúabok 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josúabók 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jósuabok 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jósuabók 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jósúabok 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jósúabók 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jos 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jós 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOSUABOK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSUABÓK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSÚABOK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSÚABÓK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓSUABOK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓSUABÓK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓSÚABOK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓSÚABÓK 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOS 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓS 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (is)", ->
		`
		expect(p.parse("Domarabokin 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Domarabókin 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Dómarabokin 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Dómarabókin 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Domarabok 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Domarabók 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Dómarabok 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Dómarabók 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Dom 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Dóm 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DOMARABOKIN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DOMARABÓKIN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DÓMARABOKIN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DÓMARABÓKIN 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DOMARABOK 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DOMARABÓK 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DÓMARABOK 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DÓMARABÓK 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DOM 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("DÓM 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (is)", ->
		`
		expect(p.parse("Rutarbok 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rutarbók 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTARBOK 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTARBÓK 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (is)", ->
		`
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (is)", ->
		`
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (is)", ->
		`
		expect(p.parse("Jesaja 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Jes 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JESAJA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("JES 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (is)", ->
		`
		expect(p.parse("Siðari Samuelsbok 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Siðari Samuelsbók 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Siðari Samúelsbok 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Siðari Samúelsbók 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Síðari Samuelsbok 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Síðari Samuelsbók 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Síðari Samúelsbok 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Síðari Samúelsbók 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARI SAMUELSBOK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SIÐARI SAMUELSBÓK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SIÐARI SAMÚELSBOK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SIÐARI SAMÚELSBÓK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SÍÐARI SAMUELSBOK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SÍÐARI SAMUELSBÓK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SÍÐARI SAMÚELSBOK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SÍÐARI SAMÚELSBÓK 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (is)", ->
		`
		expect(p.parse("Fyrri Samuelsbok 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Fyrri Samuelsbók 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Fyrri Samúelsbok 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Fyrri Samúelsbók 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRI SAMUELSBOK 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("FYRRI SAMUELSBÓK 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("FYRRI SAMÚELSBOK 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("FYRRI SAMÚELSBÓK 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (is)", ->
		`
		expect(p.parse("Siðari bok konunganna 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Siðari bók konunganna 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Síðari bok konunganna 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Síðari bók konunganna 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Siðari Konungabok 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Siðari Konungabók 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Síðari Konungabok 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Síðari Konungabók 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Síðari konungabók 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kon 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARI BOK KONUNGANNA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SIÐARI BÓK KONUNGANNA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SÍÐARI BOK KONUNGANNA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SÍÐARI BÓK KONUNGANNA 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SIÐARI KONUNGABOK 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SIÐARI KONUNGABÓK 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SÍÐARI KONUNGABOK 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SÍÐARI KONUNGABÓK 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SÍÐARI KONUNGABÓK 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KON 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (is)", ->
		`
		expect(p.parse("Fyrri bok konunganna 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Fyrri bók konunganna 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Fyrri Konungabok 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Fyrri Konungabók 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Fyrri konungabók 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kon 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRI BOK KONUNGANNA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("FYRRI BÓK KONUNGANNA 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("FYRRI KONUNGABOK 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("FYRRI KONUNGABÓK 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("FYRRI KONUNGABÓK 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KON 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (is)", ->
		`
		expect(p.parse("Siðari Kronikubok 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Siðari Kronikubók 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Siðari Kroníkubok 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Siðari Kroníkubók 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Síðari Kronikubok 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Síðari Kronikubók 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Síðari Kroníkubok 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Síðari Kroníkubók 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Síðari kroníkubók 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARI KRONIKUBOK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SIÐARI KRONIKUBÓK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SIÐARI KRONÍKUBOK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SIÐARI KRONÍKUBÓK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SÍÐARI KRONIKUBOK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SÍÐARI KRONIKUBÓK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SÍÐARI KRONÍKUBOK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SÍÐARI KRONÍKUBÓK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SÍÐARI KRONÍKUBÓK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (is)", ->
		`
		expect(p.parse("Fyrri Kronikubok 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Fyrri Kronikubók 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Fyrri Kroníkubok 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Fyrri Kroníkubók 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Fyrri kroníkubók 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRI KRONIKUBOK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("FYRRI KRONIKUBÓK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("FYRRI KRONÍKUBOK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("FYRRI KRONÍKUBÓK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("FYRRI KRONÍKUBÓK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (is)", ->
		`
		expect(p.parse("Esrabok 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esrabók 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esr 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESRABOK 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESRABÓK 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESR 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (is)", ->
		`
		expect(p.parse("Nehemiabok 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemiabók 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemíabok 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemíabók 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIABOK 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIABÓK 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMÍABOK 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMÍABÓK 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (is)", ->
		`
		expect(p.parse("Esterarbok hin griska 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Esterarbok hin gríska 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Esterarbók hin griska 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Esterarbók hin gríska 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (is)", ->
		`
		expect(p.parse("Esterarbok 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esterarbók 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTERARBOK 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTERARBÓK 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (is)", ->
		`
		expect(p.parse("Jobsbok 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Jobsbók 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOBSBOK 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOBSBÓK 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (is)", ->
		`
		expect(p.parse("Salmarnir 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sálmarnir 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Slm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SALMARNIR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SÁLMARNIR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SLM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (is)", ->
		`
		expect(p.parse("Bæn Asarja 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (is)", ->
		`
		expect(p.parse("Orðskviðirnir 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Okv 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ORÐSKVIÐIRNIR 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("OKV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (is)", ->
		`
		expect(p.parse("Predikarinn 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Prédikarinn 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Pred 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Préd 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PREDIKARINN 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PRÉDIKARINN 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PRED 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("PRÉD 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (is)", ->
		`
		expect(p.parse("Lofsongur ungmennanna þriggja 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Lofsöngur ungmennanna þriggja 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (is)", ->
		`
		expect(p.parse("Ljoðaljoðin 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Ljoðaljóðin 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Ljóðaljoðin 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Ljóðaljóðin 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Ljl 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LJOÐALJOÐIN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("LJOÐALJÓÐIN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("LJÓÐALJOÐIN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("LJÓÐALJÓÐIN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("LJL 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (is)", ->
		`
		expect(p.parse("Jeremia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremía 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMÍA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (is)", ->
		`
		expect(p.parse("Esekiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Esekíel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Esk 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESEKIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ESEKÍEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("ESK 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (is)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Daníel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DANÍEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (is)", ->
		`
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hósea 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hós 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HÓSEA 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HÓS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (is)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jóel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jl 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JÓEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (is)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (is)", ->
		`
		expect(p.parse("Obadia 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadía 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Óbadia 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Óbadía 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ob 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ób 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADIA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADÍA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ÓBADIA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ÓBADÍA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OB 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ÓB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (is)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jónas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jon 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jón 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JÓNAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JON 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JÓN 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (is)", ->
		`
		expect(p.parse("Mika 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Míka 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mik 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mík 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIKA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MÍKA 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIK 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MÍK 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (is)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahúm 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHÚM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (is)", ->
		`
		expect(p.parse("Habakkuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (is)", ->
		`
		expect(p.parse("Sefania 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sefanía 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sef 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEFANIA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEFANÍA 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SEF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (is)", ->
		`
		expect(p.parse("Haggai 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Haggaí 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGGAI 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGGAÍ 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (is)", ->
		`
		expect(p.parse("Sakaria 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Sakaría 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Sak 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAKARIA 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("SAKARÍA 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("SAK 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (is)", ->
		`
		expect(p.parse("Malaki 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malakí 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAKI 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALAKÍ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (is)", ->
		`
		expect(p.parse("Matteusarguðspjall 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MATTEUSARGUÐSPJALL 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (is)", ->
		`
		expect(p.parse("Markusarguðspjall 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Markúsarguðspjall 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mrk 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MARKUSARGUÐSPJALL 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKÚSARGUÐSPJALL 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MRK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (is)", ->
		`
		expect(p.parse("Lukasarguðspjall 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lúkasarguðspjall 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luk 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lúk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LUKASARGUÐSPJALL 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LÚKASARGUÐSPJALL 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUK 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LÚK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (is)", ->
		`
		expect(p.parse("Fyrsta bref Johannesar hið almenna 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bref Jóhannesar hið almenna 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bréf Johannesar hið almenna 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bréf Jóhannesar hið almenna 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bref Johannesar 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bref Jóhannesar 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bréf Johannesar 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta bréf Jóhannesar 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta Johannesarbref 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta Johannesarbréf 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta Jóhannesarbref 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Fyrsta Jóhannesarbréf 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Jóh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Jóh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jóh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Joh 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Jóh 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRSTA BREF JOHANNESAR HIÐ ALMENNA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BREF JÓHANNESAR HIÐ ALMENNA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BRÉF JOHANNESAR HIÐ ALMENNA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BRÉF JÓHANNESAR HIÐ ALMENNA 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BREF JOHANNESAR 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BREF JÓHANNESAR 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BRÉF JOHANNESAR 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA BRÉF JÓHANNESAR 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA JOHANNESARBREF 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA JOHANNESARBRÉF 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA JÓHANNESARBREF 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("FYRSTA JÓHANNESARBRÉF 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JÓH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JÓH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JÓH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOH 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JÓH 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (is)", ->
		`
		expect(p.parse("Annað bref Johannesar 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað bref Jóhannesar 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað bréf Johannesar 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað bréf Jóhannesar 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað Johannesarbref 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað Johannesarbréf 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað Jóhannesarbref 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Annað Jóhannesarbréf 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Jóh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Jóh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Jóh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Joh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jóh 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ANNAÐ BREF JOHANNESAR 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ BREF JÓHANNESAR 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ BRÉF JOHANNESAR 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ BRÉF JÓHANNESAR 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ JOHANNESARBREF 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ JOHANNESARBRÉF 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ JÓHANNESARBREF 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("ANNAÐ JÓHANNESARBRÉF 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JÓH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JÓH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JÓH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JÓH 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (is)", ->
		`
		expect(p.parse("Þriðja bref Johannesar 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja bref Jóhannesar 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja bréf Johannesar 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja bréf Jóhannesar 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja Johannesarbref 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja Johannesarbréf 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja Jóhannesarbref 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Þriðja Jóhannesarbréf 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Jóh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Jóh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Jóh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Joh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jóh 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ÞRIÐJA BREF JOHANNESAR 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA BREF JÓHANNESAR 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA BRÉF JOHANNESAR 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA BRÉF JÓHANNESAR 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA JOHANNESARBREF 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA JOHANNESARBRÉF 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA JÓHANNESARBREF 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("ÞRIÐJA JÓHANNESARBRÉF 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JÓH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JÓH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JÓH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JÓH 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (is)", ->
		`
		expect(p.parse("Johannesarguðspjall 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jóhannesarguðspjall 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Joh 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jóh 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOHANNESARGUÐSPJALL 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JÓHANNESARGUÐSPJALL 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOH 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JÓH 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (is)", ->
		`
		expect(p.parse("Postulasagan 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Post 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("POSTULASAGAN 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("POST 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (is)", ->
		`
		expect(p.parse("Bref Pals til Romverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bref Pals til Rómverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bref Páls til Romverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bref Páls til Rómverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bréf Pals til Romverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bréf Pals til Rómverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bréf Páls til Romverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Bréf Páls til Rómverja 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Romverjabrefið 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Romverjabréfið 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rómverjabrefið 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rómverjabréfið 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Róm 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL ROMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BREF PALS TIL RÓMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BREF PÁLS TIL ROMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BREF PÁLS TIL RÓMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BRÉF PALS TIL ROMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BRÉF PALS TIL RÓMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BRÉF PÁLS TIL ROMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("BRÉF PÁLS TIL RÓMVERJA 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMVERJABREFIÐ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMVERJABRÉFIÐ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÓMVERJABREFIÐ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÓMVERJABRÉFIÐ 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÓM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (is)", ->
		`
		expect(p.parse("Siðara bref Pals til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bref Páls til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bréf Pals til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bréf Páls til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bref Pals til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bref Páls til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bréf Pals til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bréf Páls til Korintumanna 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bref Pals til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bref Páls til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bréf Pals til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara bréf Páls til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bref Pals til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bref Páls til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bréf Pals til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara bréf Páls til Kori 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara Korintubref 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara Korintubréf 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara Kórintubref 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Siðara Kórintubréf 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara Korintubref 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara Korintubréf 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara Kórintubref 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Síðara Kórintubréf 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARA BREF PALS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL KORINTUMANNA 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL KORI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA KORINTUBREF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA KORINTUBRÉF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA KÓRINTUBREF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SIÐARA KÓRINTUBRÉF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA KORINTUBREF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA KORINTUBRÉF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA KÓRINTUBREF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SÍÐARA KÓRINTUBRÉF 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (is)", ->
		`
		expect(p.parse("Fyrra bref Pals til Korintumanna 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bref Páls til Korintumanna 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bréf Pals til Korintumanna 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bréf Páls til Korintumanna 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bref Pals til Korin 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bref Páls til Korin 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bréf Pals til Korin 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra bréf Páls til Korin 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra Korintubref 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Fyrra Korintubréf 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRA BREF PALS TIL KORINTUMANNA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL KORINTUMANNA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL KORINTUMANNA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL KORINTUMANNA 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BREF PALS TIL KORIN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL KORIN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL KORIN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL KORIN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA KORINTUBREF 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("FYRRA KORINTUBRÉF 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (is)", ->
		`
		expect(p.parse("Bref Pals til Galatamanna 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Bref Páls til Galatamanna 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Bréf Pals til Galatamanna 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Bréf Páls til Galatamanna 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatabrefið 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatabréfið 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL GALATAMANNA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("BREF PÁLS TIL GALATAMANNA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("BRÉF PALS TIL GALATAMANNA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("BRÉF PÁLS TIL GALATAMANNA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATABREFIÐ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATABRÉFIÐ 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (is)", ->
		`
		expect(p.parse("Bref Pals til Efesusmanna 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Bref Páls til Efesusmanna 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Bréf Pals til Efesusmanna 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Bréf Páls til Efesusmanna 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efesusbrefið 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efesusbréfið 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL EFESUSMANNA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("BREF PÁLS TIL EFESUSMANNA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("BRÉF PALS TIL EFESUSMANNA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("BRÉF PÁLS TIL EFESUSMANNA 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESUSBREFIÐ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFESUSBRÉFIÐ 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (is)", ->
		`
		expect(p.parse("Bref Pals til Filippimanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Pals til Filippímanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Páls til Filippimanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Páls til Filippímanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Pals til Filippimanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Pals til Filippímanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Páls til Filippimanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Páls til Filippímanna 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Pals til Filippimann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Pals til Filippímann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Páls til Filippimann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bref Páls til Filippímann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Pals til Filippimann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Pals til Filippímann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Páls til Filippimann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Bréf Páls til Filippímann 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippibrefið 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippibréfið 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippíbrefið 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filippíbréfið 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL FILIPPIMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PALS TIL FILIPPÍMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PÁLS TIL FILIPPIMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PÁLS TIL FILIPPÍMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PALS TIL FILIPPIMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PALS TIL FILIPPÍMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PÁLS TIL FILIPPIMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PÁLS TIL FILIPPÍMANNA 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PALS TIL FILIPPIMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PALS TIL FILIPPÍMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PÁLS TIL FILIPPIMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BREF PÁLS TIL FILIPPÍMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PALS TIL FILIPPIMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PALS TIL FILIPPÍMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PÁLS TIL FILIPPIMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("BRÉF PÁLS TIL FILIPPÍMANN 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPIBREFIÐ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPIBRÉFIÐ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPÍBREFIÐ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPPÍBRÉFIÐ 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (is)", ->
		`
		expect(p.parse("Bref Pals til Kolossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Pals til Kólossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Páls til Kolossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Páls til Kólossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Pals til Kolossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Pals til Kólossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Páls til Kolossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Páls til Kólossumanna 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Pals til Kolossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Pals til Kólossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Páls til Kolossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bref Páls til Kólossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Pals til Kolossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Pals til Kólossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Páls til Kolossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Bréf Páls til Kólossumann 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolossubrefið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolossubréfið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolussubrefið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolussubréfið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kólossubrefið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kólossubréfið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kólussubrefið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kólussubréfið 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kól 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL KOLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PALS TIL KÓLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PÁLS TIL KOLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PÁLS TIL KÓLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PALS TIL KOLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PALS TIL KÓLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PÁLS TIL KOLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PÁLS TIL KÓLOSSUMANNA 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PALS TIL KOLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PALS TIL KÓLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PÁLS TIL KOLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BREF PÁLS TIL KÓLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PALS TIL KOLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PALS TIL KÓLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PÁLS TIL KOLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("BRÉF PÁLS TIL KÓLOSSUMANN 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSSUBREFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSSUBRÉFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLUSSUBREFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLUSSUBRÉFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KÓLOSSUBREFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KÓLOSSUBRÉFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KÓLUSSUBREFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KÓLUSSUBRÉFIÐ 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KÓL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (is)", ->
		`
		expect(p.parse("Siðara bref Pals til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bref Pals til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bref Páls til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bref Páls til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bréf Pals til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bréf Pals til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bréf Páls til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bréf Páls til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bref Pals til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bref Pals til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bref Páls til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bref Páls til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bréf Pals til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bréf Pals til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bréf Páls til Þessalonikumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bréf Páls til Þessaloníkumanna 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bref Pals til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bref Páls til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bréf Pals til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara bréf Páls til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bref Pals til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bref Páls til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bréf Pals til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara bréf Páls til Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara Þessalonikubref 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara Þessalonikubréf 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara Þessaloníkubref 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Siðara Þessaloníkubréf 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara Þessalonikubref 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara Þessalonikubréf 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara Þessaloníkubref 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Síðara Þessaloníkubréf 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Þess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARA BREF PALS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA ÞESSALONIKUBREF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA ÞESSALONIKUBRÉF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA ÞESSALONÍKUBREF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SIÐARA ÞESSALONÍKUBRÉF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA ÞESSALONIKUBREF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA ÞESSALONIKUBRÉF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA ÞESSALONÍKUBREF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SÍÐARA ÞESSALONÍKUBRÉF 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 ÞESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (is)", ->
		`
		expect(p.parse("Fyrra bref Pals til Þessalonikumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bref Pals til Þessaloníkumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bref Páls til Þessalonikumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bref Páls til Þessaloníkumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bréf Pals til Þessalonikumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bréf Pals til Þessaloníkumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bréf Páls til Þessalonikumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bréf Páls til Þessaloníkumanna 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bref Pals til Þessa 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bref Páls til Þessa 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bréf Pals til Þessa 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra bréf Páls til Þessa 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra Þessalonikubref 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra Þessalonikubréf 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra Þessaloníkubref 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Fyrra Þessaloníkubréf 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Þess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Þess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Þess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Þess 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRA BREF PALS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BREF PALS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL ÞESSALONIKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL ÞESSALONÍKUMANNA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BREF PALS TIL ÞESSA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL ÞESSA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL ÞESSA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL ÞESSA 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA ÞESSALONIKUBREF 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA ÞESSALONIKUBRÉF 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA ÞESSALONÍKUBREF 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("FYRRA ÞESSALONÍKUBRÉF 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. ÞESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. ÞESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 ÞESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I ÞESS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (is)", ->
		`
		expect(p.parse("Siðara bref Pals til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Timoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Timóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Tímoteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Tímóteusar 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Pals til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bref Páls til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Pals til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara bréf Páls til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Pals til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bref Páls til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Pals til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Timo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Timó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Tímo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara bréf Páls til Tímó 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Timoteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Timoteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Timóteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Timóteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Tímoteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Tímoteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Tímóteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Siðara Tímóteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Timoteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Timoteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Timóteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Timóteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Tímoteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Tímoteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Tímóteusarbref 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Síðara Tímóteusarbréf 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Tím 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Tím 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Tím 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tím 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARA BREF PALS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TIMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TIMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TÍMOTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PALS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BREF PÁLS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PALS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA BRÉF PÁLS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PALS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BREF PÁLS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PALS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TIMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TIMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TÍMO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA BRÉF PÁLS TIL TÍMÓ 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TIMOTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TIMOTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TIMÓTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TIMÓTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TÍMOTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TÍMOTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TÍMÓTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SIÐARA TÍMÓTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TIMOTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TIMOTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TIMÓTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TIMÓTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TÍMOTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TÍMOTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TÍMÓTEUSARBREF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SÍÐARA TÍMÓTEUSARBRÉF 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TÍM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TÍM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TÍM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TÍM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (is)", ->
		`
		expect(p.parse("Fyrra bref Pals til Timoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Timóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Tímoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Tímóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Timoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Timóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Tímoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Tímóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Timoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Timóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Tímoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Tímóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Timoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Timóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Tímoteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Tímóteusar 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Timot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Timót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Tímot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Pals til Tímót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Timot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Timót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Tímot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bref Páls til Tímót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Timot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Timót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Tímot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Pals til Tímót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Timot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Timót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Tímot 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra bréf Páls til Tímót 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Timoteusarbref 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Timoteusarbréf 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Timóteusarbref 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Timóteusarbréf 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Tímoteusarbref 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Tímoteusarbréf 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Tímóteusarbref 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Fyrra Tímóteusarbréf 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Tím 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Tím 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tím 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Tím 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRA BREF PALS TIL TIMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TIMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TÍMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TIMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TIMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TÍMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TIMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TIMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TÍMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TIMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TIMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TÍMOTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TÍMÓTEUSAR 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TIMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TIMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TÍMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PALS TIL TÍMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TIMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TIMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TÍMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BREF PÁLS TIL TÍMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TIMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TIMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TÍMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PALS TIL TÍMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TIMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TIMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TÍMOT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA BRÉF PÁLS TIL TÍMÓT 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TIMOTEUSARBREF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TIMOTEUSARBRÉF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TIMÓTEUSARBREF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TIMÓTEUSARBRÉF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TÍMOTEUSARBREF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TÍMOTEUSARBRÉF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TÍMÓTEUSARBREF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("FYRRA TÍMÓTEUSARBRÉF 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TÍM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TÍM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TÍM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TÍM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (is)", ->
		`
		expect(p.parse("Bref Pals til Titusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bref Pals til Títusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bref Páls til Titusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bref Páls til Títusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bréf Pals til Titusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bréf Pals til Títusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bréf Páls til Titusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Bréf Páls til Títusar 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titusarbrefið 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titusarbréfið 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Títusarbrefið 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Títusarbréfið 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titusarbref 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titusarbréf 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Títusarbref 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Títusarbréf 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tít 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL TITUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BREF PALS TIL TÍTUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BREF PÁLS TIL TITUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BREF PÁLS TIL TÍTUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BRÉF PALS TIL TITUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BRÉF PALS TIL TÍTUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BRÉF PÁLS TIL TITUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("BRÉF PÁLS TIL TÍTUSAR 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUSARBREFIÐ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUSARBRÉFIÐ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍTUSARBREFIÐ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍTUSARBRÉFIÐ 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUSARBREF 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUSARBRÉF 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍTUSARBREF 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍTUSARBRÉF 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (is)", ->
		`
		expect(p.parse("Bref Pals til Filemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bref Pals til Fílemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bref Páls til Filemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bref Páls til Fílemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bréf Pals til Filemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bréf Pals til Fílemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bréf Páls til Filemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Bréf Páls til Fílemons 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemonsbrefið 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemonsbréfið 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Fílemonsbrefið 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Fílemonsbréfið 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Film 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Fílm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREF PALS TIL FILEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BREF PALS TIL FÍLEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BREF PÁLS TIL FILEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BREF PÁLS TIL FÍLEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BRÉF PALS TIL FILEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BRÉF PALS TIL FÍLEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BRÉF PÁLS TIL FILEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("BRÉF PÁLS TIL FÍLEMONS 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMONSBREFIÐ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMONSBRÉFIÐ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FÍLEMONSBREFIÐ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FÍLEMONSBRÉFIÐ 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FÍLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (is)", ->
		`
		expect(p.parse("Brefið til Hebrea 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Bréfið til Hebrea 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebreabrefið 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebreabréfið 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("BREFIÐ TIL HEBREA 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("BRÉFIÐ TIL HEBREA 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREABREFIÐ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREABRÉFIÐ 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (is)", ->
		`
		expect(p.parse("Hið almenna bref Jakobs 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Hið almenna bréf Jakobs 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jakobsbrefið 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jakobsbréfið 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jak 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HIÐ ALMENNA BREF JAKOBS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("HIÐ ALMENNA BRÉF JAKOBS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAKOBSBREFIÐ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAKOBSBRÉFIÐ 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAK 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (is)", ->
		`
		expect(p.parse("Siðara almenna bref Peturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara almenna bref Péturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara almenna bréf Peturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara almenna bréf Péturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara almenna bref Peturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara almenna bref Péturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara almenna bréf Peturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara almenna bréf Péturs 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara Petursbref 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara Petursbréf 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara Pétursbref 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Siðara Pétursbréf 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara Petursbref 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara Petursbréf 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara Pétursbref 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Síðara Pétursbréf 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pét 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pét 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pét 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pét 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SIÐARA ALMENNA BREF PETURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA ALMENNA BREF PÉTURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA ALMENNA BRÉF PETURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA ALMENNA BRÉF PÉTURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA ALMENNA BREF PETURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA ALMENNA BREF PÉTURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA ALMENNA BRÉF PETURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA ALMENNA BRÉF PÉTURS 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA PETURSBREF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA PETURSBRÉF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA PÉTURSBREF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SIÐARA PÉTURSBRÉF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA PETURSBREF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA PETURSBRÉF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA PÉTURSBREF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SÍÐARA PÉTURSBRÉF 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PÉT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PÉT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PÉT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PÉT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (is)", ->
		`
		expect(p.parse("Fyrra almenna bref Peturs 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra almenna bref Péturs 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra almenna bréf Peturs 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra almenna bréf Péturs 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra Petursbref 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra Petursbréf 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra Pétursbref 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Fyrra Pétursbréf 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pét 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pét 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pét 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pét 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FYRRA ALMENNA BREF PETURS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA ALMENNA BREF PÉTURS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA ALMENNA BRÉF PETURS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA ALMENNA BRÉF PÉTURS 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA PETURSBREF 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA PETURSBRÉF 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA PÉTURSBREF 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("FYRRA PÉTURSBRÉF 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PÉT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PÉT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PÉT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PÉT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (is)", ->
		`
		expect(p.parse("Hið almenna bref Judasar 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Hið almenna bref Júdasar 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Hið almenna bréf Judasar 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Hið almenna bréf Júdasar 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judasarbrefið 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judasarbréfið 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júdasarbrefið 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júdasarbréfið 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judasarbref 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judasarbréf 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júdasarbref 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júdasarbréf 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júd 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HIÐ ALMENNA BREF JUDASAR 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("HIÐ ALMENNA BREF JÚDASAR 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("HIÐ ALMENNA BRÉF JUDASAR 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("HIÐ ALMENNA BRÉF JÚDASAR 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDASARBREFIÐ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDASARBRÉFIÐ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚDASARBREFIÐ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚDASARBRÉFIÐ 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDASARBREF 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDASARBRÉF 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚDASARBREF 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚDASARBRÉF 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUD 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (is)", ->
		`
		expect(p.parse("Tobitsbok 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobitsbók 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobítsbok 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobítsbók 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tóbitsbok 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tóbitsbók 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tóbítsbok 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tóbítsbók 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (is)", ->
		`
		expect(p.parse("Juditarbok 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Juditarbók 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judítarbok 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judítarbók 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Júditarbok 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Júditarbók 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Júdítarbok 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Júdítarbók 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Júdt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (is)", ->
		`
		expect(p.parse("Baruksbok 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Baruksbók 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Barúksbok 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Barúksbók 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (is)", ->
		`
		expect(p.parse("Susanna 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Súsanna 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (is)", ->
		`
		expect(p.parse("Onnur Makkabeabok 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Onnur Makkabeabók 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Önnur Makkabeabok 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Önnur Makkabeabók 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Makk 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Makk 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Makk 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Makk 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (is)", ->
		`
		expect(p.parse("Þriðja Makkabeabok 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Þriðja Makkabeabók 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Makk 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Makk 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Makk 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Makk 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (is)", ->
		`
		expect(p.parse("Fjorða Makkabeabok 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Fjorða Makkabeabók 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Fjórða Makkabeabok 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Fjórða Makkabeabók 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Makk 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Makk 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Makk 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Makk 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (is)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (is)", ->
		`
		expect(p.parse("Fyrsta Makkabeabok 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Fyrsta Makkabeabók 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Makk 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Makk 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Makk 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Makk 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (is)", ->
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (is)", ->
		expect(p.parse("Titus 1:1, kafli 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAFLI 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kafla 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAFLA 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kapítuli 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAPÍTULI 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kapituli 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAPITULI 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (is)", ->
		expect(p.parse("Exod 1:1 vers 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERS 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (is)", ->
		expect(p.parse("Exod 1:1 og 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 OG 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (is)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (is)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (is)", ->
		expect(p.parse("Lev 1 (B20)").osis_and_translations()).toEqual [["Lev.1", "B20"]]
		expect(p.parse("lev 1 b20").osis_and_translations()).toEqual [["Lev.1", "B20"]]
	it "should handle book ranges (is)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("1 - 3  Jóh").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("1 - 3  Joh").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (is)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

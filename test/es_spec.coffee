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
		p.set_options osis_compaction_strategy: "bc"
		p.include_apocrypha true
		books = ["Tob","Jdt","GkEsth","Wis","Sir","Bar","PrAzar","Sus","Bel","SgThree","EpJer","1Macc","2Macc","3Macc","4Macc","1Esd","2Esd","PrMan"]
		for book in books
			bc = book + ".1"
			bcv = bc + ".1"
			bcv_range = bcv + "-" + bc + ".2"
			expect(p.parse(bc).osis()).toEqual bc
			expect(p.parse(bcv).osis()).toEqual bcv
			expect(p.parse(bcv_range).osis()).toEqual bcv_range
		p.include_apocrypha false
		for book in books
			bc = book + ".1"
			expect(p.parse(bc).osis()).toEqual ""

describe "Spanish parsing", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.options.book_alone_strategy = "ignore"
		p.options.book_sequence_strategy = "ignore"
		p.options.osis_compaction_strategy = "bc"
		p.options.captive_end_digits_strategy = "delete"

	it "should handle chapters", ->
		expect(p.parse("Mateo 2:1, CAPÍTULO 6").osis()).toEqual "Matt.2.1,Matt.6"
		expect(p.parse("Mateo 3:1, CAPITULO 6").osis()).toEqual "Matt.3.1,Matt.6"
		expect(p.parse("Mateo 4:1, capítulo 6").osis()).toEqual "Matt.4.1,Matt.6"

	it "should handle explicit verse references", ->
		expect(p.parse("Fil 2, VERSÍCULO 6").osis()).toEqual "Phil.2.6"
		expect(p.parse("Luc 1 vers. 6").osis()).toEqual "Luke.1.6"

	it "should handle Psalm titles", ->
		expect(p.parse("Sal 33:tÍtulo").osis()).toEqual "Ps.33.1"
		expect(p.parse("Salmo 120 TÍT 3, 6 título").osis()).toEqual "Ps.120.1,Ps.120.3,Ps.6.1"
		expect(p.parse("Salmo 12 tít.").osis()).toEqual "Ps.12.1"

	it "should handle ranges", ->
		expect(p.parse("Cant. 2:3 á 3:4").osis()).toEqual "Song.2.3-Song.3.4"

	it "should handle sequences", ->
		expect(p.parse("Tito 1 y 3").osis()).toEqual "Titus.1,Titus.3"

	it "should handle ordinals", ->
		expect(p.parse("1º corintios 2").osis()).toEqual "1Cor.2"
		expect(p.parse("3.º Juan 2").osis()).toEqual "3John.1.2"

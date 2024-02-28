bcv_parser = require("../../js/de_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (de)", ->
		`
		expect(p.parse("Ersten Buch Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Ersten Buch Mose 1:1'")
		expect(p.parse("Erster Buch Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Erster Buch Mose 1:1'")
		expect(p.parse("Erstes Buch Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Erstes Buch Mose 1:1'")
		expect(p.parse("Erste Buch Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Erste Buch Mose 1:1'")
		expect(p.parse("1. Buch Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. Buch Mose 1:1'")
		expect(p.parse("1 Buch Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 Buch Mose 1:1'")
		expect(p.parse("Ersten Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Ersten Mose 1:1'")
		expect(p.parse("Erster Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Erster Mose 1:1'")
		expect(p.parse("Erstes Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Erstes Mose 1:1'")
		expect(p.parse("Erste Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Erste Mose 1:1'")
		expect(p.parse("1. Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. Mose 1:1'")
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Genesis 1:1'")
		expect(p.parse("1 Mose 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 Mose 1:1'")
		expect(p.parse("1. Mos 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. Mos 1:1'")
		expect(p.parse("1 Mos 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 Mos 1:1'")
		expect(p.parse("1. Mo 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. Mo 1:1'")
		expect(p.parse("1 Mo 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 Mo 1:1'")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Gen 1:1'")
		expect(p.parse("Gn 1:1").osis()).toEqual("Gen.1.1", "parsing: 'Gn 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN BUCH MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTEN BUCH MOSE 1:1'")
		expect(p.parse("ERSTER BUCH MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTER BUCH MOSE 1:1'")
		expect(p.parse("ERSTES BUCH MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTES BUCH MOSE 1:1'")
		expect(p.parse("ERSTE BUCH MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTE BUCH MOSE 1:1'")
		expect(p.parse("1. BUCH MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. BUCH MOSE 1:1'")
		expect(p.parse("1 BUCH MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 BUCH MOSE 1:1'")
		expect(p.parse("ERSTEN MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTEN MOSE 1:1'")
		expect(p.parse("ERSTER MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTER MOSE 1:1'")
		expect(p.parse("ERSTES MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTES MOSE 1:1'")
		expect(p.parse("ERSTE MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: 'ERSTE MOSE 1:1'")
		expect(p.parse("1. MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. MOSE 1:1'")
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1", "parsing: 'GENESIS 1:1'")
		expect(p.parse("1 MOSE 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 MOSE 1:1'")
		expect(p.parse("1. MOS 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. MOS 1:1'")
		expect(p.parse("1 MOS 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 MOS 1:1'")
		expect(p.parse("1. MO 1:1").osis()).toEqual("Gen.1.1", "parsing: '1. MO 1:1'")
		expect(p.parse("1 MO 1:1").osis()).toEqual("Gen.1.1", "parsing: '1 MO 1:1'")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1", "parsing: 'GEN 1:1'")
		expect(p.parse("GN 1:1").osis()).toEqual("Gen.1.1", "parsing: 'GN 1:1'")
		`
		true
describe "Localized book Exod (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (de)", ->
		`
		expect(p.parse("Zweiten Buch Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweiten Buch Mose 1:1'")
		expect(p.parse("Zweiter Buch Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweiter Buch Mose 1:1'")
		expect(p.parse("Zweites Buch Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweites Buch Mose 1:1'")
		expect(p.parse("Zweite Buch Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweite Buch Mose 1:1'")
		expect(p.parse("2. Buch Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. Buch Mose 1:1'")
		expect(p.parse("Zweiten Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweiten Mose 1:1'")
		expect(p.parse("Zweiter Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweiter Mose 1:1'")
		expect(p.parse("Zweites Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweites Mose 1:1'")
		expect(p.parse("2 Buch Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 Buch Mose 1:1'")
		expect(p.parse("Zweite Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Zweite Mose 1:1'")
		expect(p.parse("2. Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. Mose 1:1'")
		expect(p.parse("2 Mose 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 Mose 1:1'")
		expect(p.parse("2. Mos 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. Mos 1:1'")
		expect(p.parse("Exodus 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Exodus 1:1'")
		expect(p.parse("2 Mos 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 Mos 1:1'")
		expect(p.parse("2. Mo 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. Mo 1:1'")
		expect(p.parse("2 Mo 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 Mo 1:1'")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Exod 1:1'")
		expect(p.parse("Ex 1:1").osis()).toEqual("Exod.1.1", "parsing: 'Ex 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN BUCH MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITEN BUCH MOSE 1:1'")
		expect(p.parse("ZWEITER BUCH MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITER BUCH MOSE 1:1'")
		expect(p.parse("ZWEITES BUCH MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITES BUCH MOSE 1:1'")
		expect(p.parse("ZWEITE BUCH MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITE BUCH MOSE 1:1'")
		expect(p.parse("2. BUCH MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. BUCH MOSE 1:1'")
		expect(p.parse("ZWEITEN MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITEN MOSE 1:1'")
		expect(p.parse("ZWEITER MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITER MOSE 1:1'")
		expect(p.parse("ZWEITES MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITES MOSE 1:1'")
		expect(p.parse("2 BUCH MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 BUCH MOSE 1:1'")
		expect(p.parse("ZWEITE MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: 'ZWEITE MOSE 1:1'")
		expect(p.parse("2. MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. MOSE 1:1'")
		expect(p.parse("2 MOSE 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 MOSE 1:1'")
		expect(p.parse("2. MOS 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. MOS 1:1'")
		expect(p.parse("EXODUS 1:1").osis()).toEqual("Exod.1.1", "parsing: 'EXODUS 1:1'")
		expect(p.parse("2 MOS 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 MOS 1:1'")
		expect(p.parse("2. MO 1:1").osis()).toEqual("Exod.1.1", "parsing: '2. MO 1:1'")
		expect(p.parse("2 MO 1:1").osis()).toEqual("Exod.1.1", "parsing: '2 MO 1:1'")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1", "parsing: 'EXOD 1:1'")
		expect(p.parse("EX 1:1").osis()).toEqual("Exod.1.1", "parsing: 'EX 1:1'")
		`
		true
describe "Localized book Bel (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (de)", ->
		`
		expect(p.parse("Bel und Vom Drachen 1:1").osis()).toEqual("Bel.1.1", "parsing: 'Bel und Vom Drachen 1:1'")
		expect(p.parse("Bel und der Drache 1:1").osis()).toEqual("Bel.1.1", "parsing: 'Bel und der Drache 1:1'")
		expect(p.parse("Bel und de Drache 1:1").osis()).toEqual("Bel.1.1", "parsing: 'Bel und de Drache 1:1'")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1", "parsing: 'Bel 1:1'")
		`
		true
describe "Localized book Lev (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (de)", ->
		`
		expect(p.parse("Dritten Buch Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Dritten Buch Mose 1:1'")
		expect(p.parse("Dritter Buch Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Dritter Buch Mose 1:1'")
		expect(p.parse("Drittes Buch Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Drittes Buch Mose 1:1'")
		expect(p.parse("Dritte Buch Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Dritte Buch Mose 1:1'")
		expect(p.parse("3. Buch Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. Buch Mose 1:1'")
		expect(p.parse("Dritten Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Dritten Mose 1:1'")
		expect(p.parse("Dritter Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Dritter Mose 1:1'")
		expect(p.parse("Drittes Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Drittes Mose 1:1'")
		expect(p.parse("3 Buch Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 Buch Mose 1:1'")
		expect(p.parse("Dritte Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Dritte Mose 1:1'")
		expect(p.parse("Levitikus 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Levitikus 1:1'")
		expect(p.parse("3. Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. Mose 1:1'")
		expect(p.parse("3 Mose 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 Mose 1:1'")
		expect(p.parse("3. Mos 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. Mos 1:1'")
		expect(p.parse("3 Mos 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 Mos 1:1'")
		expect(p.parse("3. Mo 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. Mo 1:1'")
		expect(p.parse("3 Mo 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 Mo 1:1'")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Lev 1:1'")
		expect(p.parse("Lv 1:1").osis()).toEqual("Lev.1.1", "parsing: 'Lv 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DRITTEN BUCH MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTEN BUCH MOSE 1:1'")
		expect(p.parse("DRITTER BUCH MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTER BUCH MOSE 1:1'")
		expect(p.parse("DRITTES BUCH MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTES BUCH MOSE 1:1'")
		expect(p.parse("DRITTE BUCH MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTE BUCH MOSE 1:1'")
		expect(p.parse("3. BUCH MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. BUCH MOSE 1:1'")
		expect(p.parse("DRITTEN MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTEN MOSE 1:1'")
		expect(p.parse("DRITTER MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTER MOSE 1:1'")
		expect(p.parse("DRITTES MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTES MOSE 1:1'")
		expect(p.parse("3 BUCH MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 BUCH MOSE 1:1'")
		expect(p.parse("DRITTE MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: 'DRITTE MOSE 1:1'")
		expect(p.parse("LEVITIKUS 1:1").osis()).toEqual("Lev.1.1", "parsing: 'LEVITIKUS 1:1'")
		expect(p.parse("3. MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. MOSE 1:1'")
		expect(p.parse("3 MOSE 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 MOSE 1:1'")
		expect(p.parse("3. MOS 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. MOS 1:1'")
		expect(p.parse("3 MOS 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 MOS 1:1'")
		expect(p.parse("3. MO 1:1").osis()).toEqual("Lev.1.1", "parsing: '3. MO 1:1'")
		expect(p.parse("3 MO 1:1").osis()).toEqual("Lev.1.1", "parsing: '3 MO 1:1'")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1", "parsing: 'LEV 1:1'")
		expect(p.parse("LV 1:1").osis()).toEqual("Lev.1.1", "parsing: 'LV 1:1'")
		`
		true
describe "Localized book Num (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (de)", ->
		`
		expect(p.parse("Vierten Buch Mose 1:1").osis()).toEqual("Num.1.1", "parsing: 'Vierten Buch Mose 1:1'")
		expect(p.parse("Viertes Buch Mose 1:1").osis()).toEqual("Num.1.1", "parsing: 'Viertes Buch Mose 1:1'")
		expect(p.parse("Vierte Buch Mose 1:1").osis()).toEqual("Num.1.1", "parsing: 'Vierte Buch Mose 1:1'")
		expect(p.parse("4. Buch Mose 1:1").osis()).toEqual("Num.1.1", "parsing: '4. Buch Mose 1:1'")
		expect(p.parse("Vierten Mose 1:1").osis()).toEqual("Num.1.1", "parsing: 'Vierten Mose 1:1'")
		expect(p.parse("Viertes Mose 1:1").osis()).toEqual("Num.1.1", "parsing: 'Viertes Mose 1:1'")
		expect(p.parse("4 Buch Mose 1:1").osis()).toEqual("Num.1.1", "parsing: '4 Buch Mose 1:1'")
		expect(p.parse("Vierte Mose 1:1").osis()).toEqual("Num.1.1", "parsing: 'Vierte Mose 1:1'")
		expect(p.parse("4. Mose 1:1").osis()).toEqual("Num.1.1", "parsing: '4. Mose 1:1'")
		expect(p.parse("4 Mose 1:1").osis()).toEqual("Num.1.1", "parsing: '4 Mose 1:1'")
		expect(p.parse("4. Mos 1:1").osis()).toEqual("Num.1.1", "parsing: '4. Mos 1:1'")
		expect(p.parse("Numeri 1:1").osis()).toEqual("Num.1.1", "parsing: 'Numeri 1:1'")
		expect(p.parse("4 Mos 1:1").osis()).toEqual("Num.1.1", "parsing: '4 Mos 1:1'")
		expect(p.parse("4. Mo 1:1").osis()).toEqual("Num.1.1", "parsing: '4. Mo 1:1'")
		expect(p.parse("4 Mo 1:1").osis()).toEqual("Num.1.1", "parsing: '4 Mo 1:1'")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1", "parsing: 'Num 1:1'")
		expect(p.parse("Nm 1:1").osis()).toEqual("Num.1.1", "parsing: 'Nm 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("VIERTEN BUCH MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: 'VIERTEN BUCH MOSE 1:1'")
		expect(p.parse("VIERTES BUCH MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: 'VIERTES BUCH MOSE 1:1'")
		expect(p.parse("VIERTE BUCH MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: 'VIERTE BUCH MOSE 1:1'")
		expect(p.parse("4. BUCH MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: '4. BUCH MOSE 1:1'")
		expect(p.parse("VIERTEN MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: 'VIERTEN MOSE 1:1'")
		expect(p.parse("VIERTES MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: 'VIERTES MOSE 1:1'")
		expect(p.parse("4 BUCH MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: '4 BUCH MOSE 1:1'")
		expect(p.parse("VIERTE MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: 'VIERTE MOSE 1:1'")
		expect(p.parse("4. MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: '4. MOSE 1:1'")
		expect(p.parse("4 MOSE 1:1").osis()).toEqual("Num.1.1", "parsing: '4 MOSE 1:1'")
		expect(p.parse("4. MOS 1:1").osis()).toEqual("Num.1.1", "parsing: '4. MOS 1:1'")
		expect(p.parse("NUMERI 1:1").osis()).toEqual("Num.1.1", "parsing: 'NUMERI 1:1'")
		expect(p.parse("4 MOS 1:1").osis()).toEqual("Num.1.1", "parsing: '4 MOS 1:1'")
		expect(p.parse("4. MO 1:1").osis()).toEqual("Num.1.1", "parsing: '4. MO 1:1'")
		expect(p.parse("4 MO 1:1").osis()).toEqual("Num.1.1", "parsing: '4 MO 1:1'")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1", "parsing: 'NUM 1:1'")
		expect(p.parse("NM 1:1").osis()).toEqual("Num.1.1", "parsing: 'NM 1:1'")
		`
		true
describe "Localized book Sir (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (de)", ->
		`
		expect(p.parse("Ecclesiasticus 1:1").osis()).toEqual("Sir.1.1", "parsing: 'Ecclesiasticus 1:1'")
		expect(p.parse("Jesus Sirach 1:1").osis()).toEqual("Sir.1.1", "parsing: 'Jesus Sirach 1:1'")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1", "parsing: 'Sir 1:1'")
		`
		true
describe "Localized book Wis (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (de)", ->
		`
		expect(p.parse("Weisheit Salomos 1:1").osis()).toEqual("Wis.1.1", "parsing: 'Weisheit Salomos 1:1'")
		expect(p.parse("Weisheit 1:1").osis()).toEqual("Wis.1.1", "parsing: 'Weisheit 1:1'")
		expect(p.parse("Weish 1:1").osis()).toEqual("Wis.1.1", "parsing: 'Weish 1:1'")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1", "parsing: 'Wis 1:1'")
		`
		true
describe "Localized book Lam (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (de)", ->
		`
		expect(p.parse("Klagelieder Jeremias 1:1").osis()).toEqual("Lam.1.1", "parsing: 'Klagelieder Jeremias 1:1'")
		expect(p.parse("Klagelieder 1:1").osis()).toEqual("Lam.1.1", "parsing: 'Klagelieder 1:1'")
		expect(p.parse("Klag 1:1").osis()).toEqual("Lam.1.1", "parsing: 'Klag 1:1'")
		expect(p.parse("Klgl 1:1").osis()).toEqual("Lam.1.1", "parsing: 'Klgl 1:1'")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1", "parsing: 'Lam 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("KLAGELIEDER JEREMIAS 1:1").osis()).toEqual("Lam.1.1", "parsing: 'KLAGELIEDER JEREMIAS 1:1'")
		expect(p.parse("KLAGELIEDER 1:1").osis()).toEqual("Lam.1.1", "parsing: 'KLAGELIEDER 1:1'")
		expect(p.parse("KLAG 1:1").osis()).toEqual("Lam.1.1", "parsing: 'KLAG 1:1'")
		expect(p.parse("KLGL 1:1").osis()).toEqual("Lam.1.1", "parsing: 'KLGL 1:1'")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1", "parsing: 'LAM 1:1'")
		`
		true
describe "Localized book EpJer (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (de)", ->
		`
		expect(p.parse("Brief des Jeremia 1:1").osis()).toEqual("EpJer.1.1", "parsing: 'Brief des Jeremia 1:1'")
		expect(p.parse("Br Jer 1:1").osis()).toEqual("EpJer.1.1", "parsing: 'Br Jer 1:1'")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1", "parsing: 'EpJer 1:1'")
		`
		true
describe "Localized book Rev (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (de)", ->
		`
		expect(p.parse("Offenbarung 1:1").osis()).toEqual("Rev.1.1", "parsing: 'Offenbarung 1:1'")
		expect(p.parse("Offb 1:1").osis()).toEqual("Rev.1.1", "parsing: 'Offb 1:1'")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1", "parsing: 'Rev 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("OFFENBARUNG 1:1").osis()).toEqual("Rev.1.1", "parsing: 'OFFENBARUNG 1:1'")
		expect(p.parse("OFFB 1:1").osis()).toEqual("Rev.1.1", "parsing: 'OFFB 1:1'")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1", "parsing: 'REV 1:1'")
		`
		true
describe "Localized book PrMan (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (de)", ->
		`
		expect(p.parse("Das Gebet des Manasse 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Das Gebet des Manasse 1:1'")
		expect(p.parse("Das Gebet Manasses 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Das Gebet Manasses 1:1'")
		expect(p.parse("Gebet des Manasse 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Gebet des Manasse 1:1'")
		expect(p.parse("Gebet Manasses 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Gebet Manasses 1:1'")
		expect(p.parse("Gebet Manasse 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Gebet Manasse 1:1'")
		expect(p.parse("Geb Man 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Geb Man 1:1'")
		expect(p.parse("Or Man 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'Or Man 1:1'")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1", "parsing: 'PrMan 1:1'")
		`
		true
describe "Localized book Deut (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (de)", ->
		`
		expect(p.parse("Funftes Buch Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Funftes Buch Mose 1:1'")
		expect(p.parse("Fünftes Buch Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Fünftes Buch Mose 1:1'")
		expect(p.parse("Deuteronomium 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Deuteronomium 1:1'")
		expect(p.parse("5. Buch Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. Buch Mose 1:1'")
		expect(p.parse("Funftes Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Funftes Mose 1:1'")
		expect(p.parse("Fünftes Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Fünftes Mose 1:1'")
		expect(p.parse("5 Buch Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 Buch Mose 1:1'")
		expect(p.parse("5. Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. Mose 1:1'")
		expect(p.parse("5 Mose 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 Mose 1:1'")
		expect(p.parse("5. Mos 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. Mos 1:1'")
		expect(p.parse("5 Mos 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 Mos 1:1'")
		expect(p.parse("5. Mo 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. Mo 1:1'")
		expect(p.parse("5 Mo 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 Mo 1:1'")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Deut 1:1'")
		expect(p.parse("Dtn 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Dtn 1:1'")
		expect(p.parse("Dt 1:1").osis()).toEqual("Deut.1.1", "parsing: 'Dt 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("FUNFTES BUCH MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: 'FUNFTES BUCH MOSE 1:1'")
		expect(p.parse("FÜNFTES BUCH MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: 'FÜNFTES BUCH MOSE 1:1'")
		expect(p.parse("DEUTERONOMIUM 1:1").osis()).toEqual("Deut.1.1", "parsing: 'DEUTERONOMIUM 1:1'")
		expect(p.parse("5. BUCH MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. BUCH MOSE 1:1'")
		expect(p.parse("FUNFTES MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: 'FUNFTES MOSE 1:1'")
		expect(p.parse("FÜNFTES MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: 'FÜNFTES MOSE 1:1'")
		expect(p.parse("5 BUCH MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 BUCH MOSE 1:1'")
		expect(p.parse("5. MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. MOSE 1:1'")
		expect(p.parse("5 MOSE 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 MOSE 1:1'")
		expect(p.parse("5. MOS 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. MOS 1:1'")
		expect(p.parse("5 MOS 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 MOS 1:1'")
		expect(p.parse("5. MO 1:1").osis()).toEqual("Deut.1.1", "parsing: '5. MO 1:1'")
		expect(p.parse("5 MO 1:1").osis()).toEqual("Deut.1.1", "parsing: '5 MO 1:1'")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1", "parsing: 'DEUT 1:1'")
		expect(p.parse("DTN 1:1").osis()).toEqual("Deut.1.1", "parsing: 'DTN 1:1'")
		expect(p.parse("DT 1:1").osis()).toEqual("Deut.1.1", "parsing: 'DT 1:1'")
		`
		true
describe "Localized book Josh (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (de)", ->
		`
		expect(p.parse("Josua 1:1").osis()).toEqual("Josh.1.1", "parsing: 'Josua 1:1'")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1", "parsing: 'Josh 1:1'")
		expect(p.parse("Jos 1:1").osis()).toEqual("Josh.1.1", "parsing: 'Jos 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("JOSUA 1:1").osis()).toEqual("Josh.1.1", "parsing: 'JOSUA 1:1'")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1", "parsing: 'JOSH 1:1'")
		expect(p.parse("JOS 1:1").osis()).toEqual("Josh.1.1", "parsing: 'JOS 1:1'")
		`
		true
describe "Localized book Judg (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (de)", ->
		`
		expect(p.parse("Richter 1:1").osis()).toEqual("Judg.1.1", "parsing: 'Richter 1:1'")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1", "parsing: 'Judg 1:1'")
		expect(p.parse("Rich 1:1").osis()).toEqual("Judg.1.1", "parsing: 'Rich 1:1'")
		expect(p.parse("Ri 1:1").osis()).toEqual("Judg.1.1", "parsing: 'Ri 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("RICHTER 1:1").osis()).toEqual("Judg.1.1", "parsing: 'RICHTER 1:1'")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1", "parsing: 'JUDG 1:1'")
		expect(p.parse("RICH 1:1").osis()).toEqual("Judg.1.1", "parsing: 'RICH 1:1'")
		expect(p.parse("RI 1:1").osis()).toEqual("Judg.1.1", "parsing: 'RI 1:1'")
		`
		true
describe "Localized book Ruth (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (de)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1", "parsing: 'Ruth 1:1'")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1", "parsing: 'Rut 1:1'")
		expect(p.parse("Ru 1:1").osis()).toEqual("Ruth.1.1", "parsing: 'Ru 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1", "parsing: 'RUTH 1:1'")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1", "parsing: 'RUT 1:1'")
		expect(p.parse("RU 1:1").osis()).toEqual("Ruth.1.1", "parsing: 'RU 1:1'")
		`
		true
describe "Localized book 1Esd (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (de)", ->
		`
		expect(p.parse("Ersten Esdra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Ersten Esdra 1:1'")
		expect(p.parse("Erster Esdra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Erster Esdra 1:1'")
		expect(p.parse("Erstes Esdra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Erstes Esdra 1:1'")
		expect(p.parse("Erste Esdra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Erste Esdra 1:1'")
		expect(p.parse("Ersten Esra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Ersten Esra 1:1'")
		expect(p.parse("Erster Esra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Erster Esra 1:1'")
		expect(p.parse("Erstes Esra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Erstes Esra 1:1'")
		expect(p.parse("Erste Esra 1:1").osis()).toEqual("1Esd.1.1", "parsing: 'Erste Esra 1:1'")
		expect(p.parse("1. Esdra 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1. Esdra 1:1'")
		expect(p.parse("1 Esdra 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1 Esdra 1:1'")
		expect(p.parse("1. Esdr 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1. Esdr 1:1'")
		expect(p.parse("1. Esra 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1. Esra 1:1'")
		expect(p.parse("1 Esdr 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1 Esdr 1:1'")
		expect(p.parse("1 Esra 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1 Esra 1:1'")
		expect(p.parse("1. Esr 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1. Esr 1:1'")
		expect(p.parse("1 Esr 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1 Esr 1:1'")
		expect(p.parse("1. Es 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1. Es 1:1'")
		expect(p.parse("1 Es 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1 Es 1:1'")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1", "parsing: '1Esd 1:1'")
		`
		true
describe "Localized book 2Esd (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (de)", ->
		`
		expect(p.parse("Zweiten Esdra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweiten Esdra 1:1'")
		expect(p.parse("Zweiter Esdra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweiter Esdra 1:1'")
		expect(p.parse("Zweites Esdra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweites Esdra 1:1'")
		expect(p.parse("Zweite Esdra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweite Esdra 1:1'")
		expect(p.parse("Zweiten Esra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweiten Esra 1:1'")
		expect(p.parse("Zweiter Esra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweiter Esra 1:1'")
		expect(p.parse("Zweites Esra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweites Esra 1:1'")
		expect(p.parse("Zweite Esra 1:1").osis()).toEqual("2Esd.1.1", "parsing: 'Zweite Esra 1:1'")
		expect(p.parse("2. Esdra 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2. Esdra 1:1'")
		expect(p.parse("2 Esdra 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2 Esdra 1:1'")
		expect(p.parse("2. Esdr 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2. Esdr 1:1'")
		expect(p.parse("2. Esra 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2. Esra 1:1'")
		expect(p.parse("2 Esdr 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2 Esdr 1:1'")
		expect(p.parse("2 Esra 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2 Esra 1:1'")
		expect(p.parse("2. Esr 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2. Esr 1:1'")
		expect(p.parse("2 Esr 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2 Esr 1:1'")
		expect(p.parse("2. Es 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2. Es 1:1'")
		expect(p.parse("2 Es 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2 Es 1:1'")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1", "parsing: '2Esd 1:1'")
		`
		true
describe "Localized book Isa (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (de)", ->
		`
		expect(p.parse("Isaias 1:1").osis()).toEqual("Isa.1.1", "parsing: 'Isaias 1:1'")
		expect(p.parse("Jesaja 1:1").osis()).toEqual("Isa.1.1", "parsing: 'Jesaja 1:1'")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1", "parsing: 'Isa 1:1'")
		expect(p.parse("Jes 1:1").osis()).toEqual("Isa.1.1", "parsing: 'Jes 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ISAIAS 1:1").osis()).toEqual("Isa.1.1", "parsing: 'ISAIAS 1:1'")
		expect(p.parse("JESAJA 1:1").osis()).toEqual("Isa.1.1", "parsing: 'JESAJA 1:1'")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1", "parsing: 'ISA 1:1'")
		expect(p.parse("JES 1:1").osis()).toEqual("Isa.1.1", "parsing: 'JES 1:1'")
		`
		true
describe "Localized book 2Sam (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (de)", ->
		`
		expect(p.parse("Zweiten Samuel 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'Zweiten Samuel 1:1'")
		expect(p.parse("Zweiter Samuel 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'Zweiter Samuel 1:1'")
		expect(p.parse("Zweites Samuel 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'Zweites Samuel 1:1'")
		expect(p.parse("Zweite Samuel 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'Zweite Samuel 1:1'")
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2. Samuel 1:1'")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2 Samuel 1:1'")
		expect(p.parse("2. Sam 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2. Sam 1:1'")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2 Sam 1:1'")
		expect(p.parse("2. Sa 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2. Sa 1:1'")
		expect(p.parse("2 Sa 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2 Sa 1:1'")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2Sam 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN SAMUEL 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'ZWEITEN SAMUEL 1:1'")
		expect(p.parse("ZWEITER SAMUEL 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'ZWEITER SAMUEL 1:1'")
		expect(p.parse("ZWEITES SAMUEL 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'ZWEITES SAMUEL 1:1'")
		expect(p.parse("ZWEITE SAMUEL 1:1").osis()).toEqual("2Sam.1.1", "parsing: 'ZWEITE SAMUEL 1:1'")
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2. SAMUEL 1:1'")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2 SAMUEL 1:1'")
		expect(p.parse("2. SAM 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2. SAM 1:1'")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2 SAM 1:1'")
		expect(p.parse("2. SA 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2. SA 1:1'")
		expect(p.parse("2 SA 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2 SA 1:1'")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1", "parsing: '2SAM 1:1'")
		`
		true
describe "Localized book 1Sam (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (de)", ->
		`
		expect(p.parse("Ersten Samuel 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'Ersten Samuel 1:1'")
		expect(p.parse("Erster Samuel 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'Erster Samuel 1:1'")
		expect(p.parse("Erstes Samuel 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'Erstes Samuel 1:1'")
		expect(p.parse("Erste Samuel 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'Erste Samuel 1:1'")
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1. Samuel 1:1'")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1 Samuel 1:1'")
		expect(p.parse("1. Sam 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1. Sam 1:1'")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1 Sam 1:1'")
		expect(p.parse("1. Sa 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1. Sa 1:1'")
		expect(p.parse("1 Sa 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1 Sa 1:1'")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1Sam 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN SAMUEL 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'ERSTEN SAMUEL 1:1'")
		expect(p.parse("ERSTER SAMUEL 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'ERSTER SAMUEL 1:1'")
		expect(p.parse("ERSTES SAMUEL 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'ERSTES SAMUEL 1:1'")
		expect(p.parse("ERSTE SAMUEL 1:1").osis()).toEqual("1Sam.1.1", "parsing: 'ERSTE SAMUEL 1:1'")
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1. SAMUEL 1:1'")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1 SAMUEL 1:1'")
		expect(p.parse("1. SAM 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1. SAM 1:1'")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1 SAM 1:1'")
		expect(p.parse("1. SA 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1. SA 1:1'")
		expect(p.parse("1 SA 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1 SA 1:1'")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1", "parsing: '1SAM 1:1'")
		`
		true
describe "Localized book 2Kgs (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (de)", ->
		`
		expect(p.parse("Zweiten Koenige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweiten Koenige 1:1'")
		expect(p.parse("Zweiter Koenige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweiter Koenige 1:1'")
		expect(p.parse("Zweites Koenige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweites Koenige 1:1'")
		expect(p.parse("Zweite Koenige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweite Koenige 1:1'")
		expect(p.parse("Zweiten Konige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweiten Konige 1:1'")
		expect(p.parse("Zweiten Könige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweiten Könige 1:1'")
		expect(p.parse("Zweiter Konige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweiter Konige 1:1'")
		expect(p.parse("Zweiter Könige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweiter Könige 1:1'")
		expect(p.parse("Zweites Konige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweites Konige 1:1'")
		expect(p.parse("Zweites Könige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweites Könige 1:1'")
		expect(p.parse("Zweite Konige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweite Konige 1:1'")
		expect(p.parse("Zweite Könige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'Zweite Könige 1:1'")
		expect(p.parse("2. Koenige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Koenige 1:1'")
		expect(p.parse("2 Koenige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Koenige 1:1'")
		expect(p.parse("2. Konige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Konige 1:1'")
		expect(p.parse("2. Könige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Könige 1:1'")
		expect(p.parse("2 Konige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Konige 1:1'")
		expect(p.parse("2 Könige 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Könige 1:1'")
		expect(p.parse("2. Koen 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Koen 1:1'")
		expect(p.parse("2 Koen 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Koen 1:1'")
		expect(p.parse("2. Kng 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Kng 1:1'")
		expect(p.parse("2. Koe 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Koe 1:1'")
		expect(p.parse("2. Kon 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Kon 1:1'")
		expect(p.parse("2. Kön 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Kön 1:1'")
		expect(p.parse("2 Kng 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Kng 1:1'")
		expect(p.parse("2 Koe 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Koe 1:1'")
		expect(p.parse("2 Kon 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Kon 1:1'")
		expect(p.parse("2 Kön 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Kön 1:1'")
		expect(p.parse("2. Ko 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Ko 1:1'")
		expect(p.parse("2. Kö 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. Kö 1:1'")
		expect(p.parse("2 Ko 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Ko 1:1'")
		expect(p.parse("2 Kö 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 Kö 1:1'")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2Kgs 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN KOENIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITEN KOENIGE 1:1'")
		expect(p.parse("ZWEITER KOENIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITER KOENIGE 1:1'")
		expect(p.parse("ZWEITES KOENIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITES KOENIGE 1:1'")
		expect(p.parse("ZWEITE KOENIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITE KOENIGE 1:1'")
		expect(p.parse("ZWEITEN KONIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITEN KONIGE 1:1'")
		expect(p.parse("ZWEITEN KÖNIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITEN KÖNIGE 1:1'")
		expect(p.parse("ZWEITER KONIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITER KONIGE 1:1'")
		expect(p.parse("ZWEITER KÖNIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITER KÖNIGE 1:1'")
		expect(p.parse("ZWEITES KONIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITES KONIGE 1:1'")
		expect(p.parse("ZWEITES KÖNIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITES KÖNIGE 1:1'")
		expect(p.parse("ZWEITE KONIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITE KONIGE 1:1'")
		expect(p.parse("ZWEITE KÖNIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: 'ZWEITE KÖNIGE 1:1'")
		expect(p.parse("2. KOENIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KOENIGE 1:1'")
		expect(p.parse("2 KOENIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KOENIGE 1:1'")
		expect(p.parse("2. KONIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KONIGE 1:1'")
		expect(p.parse("2. KÖNIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KÖNIGE 1:1'")
		expect(p.parse("2 KONIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KONIGE 1:1'")
		expect(p.parse("2 KÖNIGE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KÖNIGE 1:1'")
		expect(p.parse("2. KOEN 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KOEN 1:1'")
		expect(p.parse("2 KOEN 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KOEN 1:1'")
		expect(p.parse("2. KNG 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KNG 1:1'")
		expect(p.parse("2. KOE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KOE 1:1'")
		expect(p.parse("2. KON 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KON 1:1'")
		expect(p.parse("2. KÖN 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KÖN 1:1'")
		expect(p.parse("2 KNG 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KNG 1:1'")
		expect(p.parse("2 KOE 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KOE 1:1'")
		expect(p.parse("2 KON 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KON 1:1'")
		expect(p.parse("2 KÖN 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KÖN 1:1'")
		expect(p.parse("2. KO 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KO 1:1'")
		expect(p.parse("2. KÖ 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2. KÖ 1:1'")
		expect(p.parse("2 KO 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KO 1:1'")
		expect(p.parse("2 KÖ 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2 KÖ 1:1'")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1", "parsing: '2KGS 1:1'")
		`
		true
describe "Localized book 1Kgs (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (de)", ->
		`
		expect(p.parse("Ersten Koenige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Ersten Koenige 1:1'")
		expect(p.parse("Erster Koenige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erster Koenige 1:1'")
		expect(p.parse("Erstes Koenige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erstes Koenige 1:1'")
		expect(p.parse("Erste Koenige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erste Koenige 1:1'")
		expect(p.parse("Ersten Konige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Ersten Konige 1:1'")
		expect(p.parse("Ersten Könige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Ersten Könige 1:1'")
		expect(p.parse("Erster Konige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erster Konige 1:1'")
		expect(p.parse("Erster Könige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erster Könige 1:1'")
		expect(p.parse("Erstes Konige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erstes Konige 1:1'")
		expect(p.parse("Erstes Könige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erstes Könige 1:1'")
		expect(p.parse("Erste Konige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erste Konige 1:1'")
		expect(p.parse("Erste Könige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'Erste Könige 1:1'")
		expect(p.parse("1. Koenige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Koenige 1:1'")
		expect(p.parse("1 Koenige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Koenige 1:1'")
		expect(p.parse("1. Konige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Konige 1:1'")
		expect(p.parse("1. Könige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Könige 1:1'")
		expect(p.parse("1 Konige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Konige 1:1'")
		expect(p.parse("1 Könige 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Könige 1:1'")
		expect(p.parse("1. Koen 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Koen 1:1'")
		expect(p.parse("1 Koen 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Koen 1:1'")
		expect(p.parse("1. Kng 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Kng 1:1'")
		expect(p.parse("1. Koe 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Koe 1:1'")
		expect(p.parse("1. Kon 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Kon 1:1'")
		expect(p.parse("1. Kön 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Kön 1:1'")
		expect(p.parse("1 Kng 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Kng 1:1'")
		expect(p.parse("1 Koe 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Koe 1:1'")
		expect(p.parse("1 Kon 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Kon 1:1'")
		expect(p.parse("1 Kön 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Kön 1:1'")
		expect(p.parse("1. Ko 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Ko 1:1'")
		expect(p.parse("1. Kö 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. Kö 1:1'")
		expect(p.parse("1 Ko 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Ko 1:1'")
		expect(p.parse("1 Kö 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 Kö 1:1'")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1Kgs 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN KOENIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTEN KOENIGE 1:1'")
		expect(p.parse("ERSTER KOENIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTER KOENIGE 1:1'")
		expect(p.parse("ERSTES KOENIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTES KOENIGE 1:1'")
		expect(p.parse("ERSTE KOENIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTE KOENIGE 1:1'")
		expect(p.parse("ERSTEN KONIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTEN KONIGE 1:1'")
		expect(p.parse("ERSTEN KÖNIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTEN KÖNIGE 1:1'")
		expect(p.parse("ERSTER KONIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTER KONIGE 1:1'")
		expect(p.parse("ERSTER KÖNIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTER KÖNIGE 1:1'")
		expect(p.parse("ERSTES KONIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTES KONIGE 1:1'")
		expect(p.parse("ERSTES KÖNIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTES KÖNIGE 1:1'")
		expect(p.parse("ERSTE KONIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTE KONIGE 1:1'")
		expect(p.parse("ERSTE KÖNIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: 'ERSTE KÖNIGE 1:1'")
		expect(p.parse("1. KOENIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KOENIGE 1:1'")
		expect(p.parse("1 KOENIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KOENIGE 1:1'")
		expect(p.parse("1. KONIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KONIGE 1:1'")
		expect(p.parse("1. KÖNIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KÖNIGE 1:1'")
		expect(p.parse("1 KONIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KONIGE 1:1'")
		expect(p.parse("1 KÖNIGE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KÖNIGE 1:1'")
		expect(p.parse("1. KOEN 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KOEN 1:1'")
		expect(p.parse("1 KOEN 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KOEN 1:1'")
		expect(p.parse("1. KNG 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KNG 1:1'")
		expect(p.parse("1. KOE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KOE 1:1'")
		expect(p.parse("1. KON 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KON 1:1'")
		expect(p.parse("1. KÖN 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KÖN 1:1'")
		expect(p.parse("1 KNG 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KNG 1:1'")
		expect(p.parse("1 KOE 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KOE 1:1'")
		expect(p.parse("1 KON 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KON 1:1'")
		expect(p.parse("1 KÖN 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KÖN 1:1'")
		expect(p.parse("1. KO 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KO 1:1'")
		expect(p.parse("1. KÖ 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1. KÖ 1:1'")
		expect(p.parse("1 KO 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KO 1:1'")
		expect(p.parse("1 KÖ 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1 KÖ 1:1'")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1", "parsing: '1KGS 1:1'")
		`
		true
describe "Localized book 2Chr (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (de)", ->
		`
		expect(p.parse("Zweiten Chronik 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'Zweiten Chronik 1:1'")
		expect(p.parse("Zweiter Chronik 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'Zweiter Chronik 1:1'")
		expect(p.parse("Zweites Chronik 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'Zweites Chronik 1:1'")
		expect(p.parse("Zweite Chronik 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'Zweite Chronik 1:1'")
		expect(p.parse("2. Chronik 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2. Chronik 1:1'")
		expect(p.parse("2 Chronik 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2 Chronik 1:1'")
		expect(p.parse("2. Chron 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2. Chron 1:1'")
		expect(p.parse("2 Chron 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2 Chron 1:1'")
		expect(p.parse("2. Chr 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2. Chr 1:1'")
		expect(p.parse("2 Chr 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2 Chr 1:1'")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2Chr 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN CHRONIK 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'ZWEITEN CHRONIK 1:1'")
		expect(p.parse("ZWEITER CHRONIK 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'ZWEITER CHRONIK 1:1'")
		expect(p.parse("ZWEITES CHRONIK 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'ZWEITES CHRONIK 1:1'")
		expect(p.parse("ZWEITE CHRONIK 1:1").osis()).toEqual("2Chr.1.1", "parsing: 'ZWEITE CHRONIK 1:1'")
		expect(p.parse("2. CHRONIK 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2. CHRONIK 1:1'")
		expect(p.parse("2 CHRONIK 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2 CHRONIK 1:1'")
		expect(p.parse("2. CHRON 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2. CHRON 1:1'")
		expect(p.parse("2 CHRON 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2 CHRON 1:1'")
		expect(p.parse("2. CHR 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2. CHR 1:1'")
		expect(p.parse("2 CHR 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2 CHR 1:1'")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1", "parsing: '2CHR 1:1'")
		`
		true
describe "Localized book 1Chr (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (de)", ->
		`
		expect(p.parse("Ersten Chronik 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'Ersten Chronik 1:1'")
		expect(p.parse("Erster Chronik 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'Erster Chronik 1:1'")
		expect(p.parse("Erstes Chronik 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'Erstes Chronik 1:1'")
		expect(p.parse("Erste Chronik 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'Erste Chronik 1:1'")
		expect(p.parse("1. Chronik 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1. Chronik 1:1'")
		expect(p.parse("1 Chronik 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1 Chronik 1:1'")
		expect(p.parse("1. Chron 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1. Chron 1:1'")
		expect(p.parse("1 Chron 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1 Chron 1:1'")
		expect(p.parse("1. Chr 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1. Chr 1:1'")
		expect(p.parse("1 Chr 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1 Chr 1:1'")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1Chr 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN CHRONIK 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'ERSTEN CHRONIK 1:1'")
		expect(p.parse("ERSTER CHRONIK 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'ERSTER CHRONIK 1:1'")
		expect(p.parse("ERSTES CHRONIK 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'ERSTES CHRONIK 1:1'")
		expect(p.parse("ERSTE CHRONIK 1:1").osis()).toEqual("1Chr.1.1", "parsing: 'ERSTE CHRONIK 1:1'")
		expect(p.parse("1. CHRONIK 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1. CHRONIK 1:1'")
		expect(p.parse("1 CHRONIK 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1 CHRONIK 1:1'")
		expect(p.parse("1. CHRON 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1. CHRON 1:1'")
		expect(p.parse("1 CHRON 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1 CHRON 1:1'")
		expect(p.parse("1. CHR 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1. CHR 1:1'")
		expect(p.parse("1 CHR 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1 CHR 1:1'")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1", "parsing: '1CHR 1:1'")
		`
		true
describe "Localized book Ezra (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (de)", ->
		`
		expect(p.parse("Esra 1:1").osis()).toEqual("Ezra.1.1", "parsing: 'Esra 1:1'")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1", "parsing: 'Ezra 1:1'")
		expect(p.parse("Esr 1:1").osis()).toEqual("Ezra.1.1", "parsing: 'Esr 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ESRA 1:1").osis()).toEqual("Ezra.1.1", "parsing: 'ESRA 1:1'")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1", "parsing: 'EZRA 1:1'")
		expect(p.parse("ESR 1:1").osis()).toEqual("Ezra.1.1", "parsing: 'ESR 1:1'")
		`
		true
describe "Localized book Neh (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (de)", ->
		`
		expect(p.parse("Nehemia 1:1").osis()).toEqual("Neh.1.1", "parsing: 'Nehemia 1:1'")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1", "parsing: 'Neh 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIA 1:1").osis()).toEqual("Neh.1.1", "parsing: 'NEHEMIA 1:1'")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1", "parsing: 'NEH 1:1'")
		`
		true
describe "Localized book GkEsth (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (de)", ->
		`
		expect(p.parse("Ester \(Griechisch\) 1:1").osis()).toEqual("GkEsth.1.1", "parsing: 'Ester \(Griechisch\) 1:1'")
		expect(p.parse("Ester (Griechisch) 1:1").osis()).toEqual("GkEsth.1.1", "parsing: 'Ester (Griechisch) 1:1'")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1", "parsing: 'GkEsth 1:1'")
		expect(p.parse("Gr Est 1:1").osis()).toEqual("GkEsth.1.1", "parsing: 'Gr Est 1:1'")
		`
		true
describe "Localized book Esth (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (de)", ->
		`
		expect(p.parse("Esther 1:1").osis()).toEqual("Esth.1.1", "parsing: 'Esther 1:1'")
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1", "parsing: 'Ester 1:1'")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1", "parsing: 'Esth 1:1'")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1", "parsing: 'Est 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ESTHER 1:1").osis()).toEqual("Esth.1.1", "parsing: 'ESTHER 1:1'")
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1", "parsing: 'ESTER 1:1'")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1", "parsing: 'ESTH 1:1'")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1", "parsing: 'EST 1:1'")
		`
		true
describe "Localized book Job (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (de)", ->
		`
		expect(p.parse("Hiob 1:1").osis()).toEqual("Job.1.1", "parsing: 'Hiob 1:1'")
		expect(p.parse("Ijob 1:1").osis()).toEqual("Job.1.1", "parsing: 'Ijob 1:1'")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1", "parsing: 'Job 1:1'")
		expect(p.parse("Hi 1:1").osis()).toEqual("Job.1.1", "parsing: 'Hi 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("HIOB 1:1").osis()).toEqual("Job.1.1", "parsing: 'HIOB 1:1'")
		expect(p.parse("IJOB 1:1").osis()).toEqual("Job.1.1", "parsing: 'IJOB 1:1'")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1", "parsing: 'JOB 1:1'")
		expect(p.parse("HI 1:1").osis()).toEqual("Job.1.1", "parsing: 'HI 1:1'")
		`
		true
describe "Localized book Ps (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (de)", ->
		`
		expect(p.parse("Psalmen 1:1").osis()).toEqual("Ps.1.1", "parsing: 'Psalmen 1:1'")
		expect(p.parse("Psalm 1:1").osis()).toEqual("Ps.1.1", "parsing: 'Psalm 1:1'")
		expect(p.parse("Pslm 1:1").osis()).toEqual("Ps.1.1", "parsing: 'Pslm 1:1'")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1", "parsing: 'Ps 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("PSALMEN 1:1").osis()).toEqual("Ps.1.1", "parsing: 'PSALMEN 1:1'")
		expect(p.parse("PSALM 1:1").osis()).toEqual("Ps.1.1", "parsing: 'PSALM 1:1'")
		expect(p.parse("PSLM 1:1").osis()).toEqual("Ps.1.1", "parsing: 'PSLM 1:1'")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1", "parsing: 'PS 1:1'")
		`
		true
describe "Localized book PrAzar (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (de)", ->
		`
		expect(p.parse("Das Gebet des Asarja 1:1").osis()).toEqual("PrAzar.1.1", "parsing: 'Das Gebet des Asarja 1:1'")
		expect(p.parse("Das Gebet Asarjas 1:1").osis()).toEqual("PrAzar.1.1", "parsing: 'Das Gebet Asarjas 1:1'")
		expect(p.parse("Gebet des Asarja 1:1").osis()).toEqual("PrAzar.1.1", "parsing: 'Gebet des Asarja 1:1'")
		expect(p.parse("Gebet Asarjas 1:1").osis()).toEqual("PrAzar.1.1", "parsing: 'Gebet Asarjas 1:1'")
		expect(p.parse("Geb As 1:1").osis()).toEqual("PrAzar.1.1", "parsing: 'Geb As 1:1'")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1", "parsing: 'PrAzar 1:1'")
		`
		true
describe "Localized book Prov (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (de)", ->
		`
		expect(p.parse("Sprichwoerter 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Sprichwoerter 1:1'")
		expect(p.parse("Sprichworter 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Sprichworter 1:1'")
		expect(p.parse("Sprichwörter 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Sprichwörter 1:1'")
		expect(p.parse("Sprueche 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Sprueche 1:1'")
		expect(p.parse("Spruche 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Spruche 1:1'")
		expect(p.parse("Sprüche 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Sprüche 1:1'")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Prov 1:1'")
		expect(p.parse("Spr 1:1").osis()).toEqual("Prov.1.1", "parsing: 'Spr 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("SPRICHWOERTER 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPRICHWOERTER 1:1'")
		expect(p.parse("SPRICHWORTER 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPRICHWORTER 1:1'")
		expect(p.parse("SPRICHWÖRTER 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPRICHWÖRTER 1:1'")
		expect(p.parse("SPRUECHE 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPRUECHE 1:1'")
		expect(p.parse("SPRUCHE 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPRUCHE 1:1'")
		expect(p.parse("SPRÜCHE 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPRÜCHE 1:1'")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1", "parsing: 'PROV 1:1'")
		expect(p.parse("SPR 1:1").osis()).toEqual("Prov.1.1", "parsing: 'SPR 1:1'")
		`
		true
describe "Localized book Eccl (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (de)", ->
		`
		expect(p.parse("Ecclesiastes 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Ecclesiastes 1:1'")
		expect(p.parse("Ekklesiastes 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Ekklesiastes 1:1'")
		expect(p.parse("Prediger 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Prediger 1:1'")
		expect(p.parse("Kohelet 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Kohelet 1:1'")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Eccl 1:1'")
		expect(p.parse("Pred 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Pred 1:1'")
		expect(p.parse("Koh 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'Koh 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ECCLESIASTES 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'ECCLESIASTES 1:1'")
		expect(p.parse("EKKLESIASTES 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'EKKLESIASTES 1:1'")
		expect(p.parse("PREDIGER 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'PREDIGER 1:1'")
		expect(p.parse("KOHELET 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'KOHELET 1:1'")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'ECCL 1:1'")
		expect(p.parse("PRED 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'PRED 1:1'")
		expect(p.parse("KOH 1:1").osis()).toEqual("Eccl.1.1", "parsing: 'KOH 1:1'")
		`
		true
describe "Localized book SgThree (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (de)", ->
		`
		expect(p.parse("Gesang der drei Maenner im Feuerofen 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei Maenner im Feuerofen 1:1'")
		expect(p.parse("Gesang der drei Manner im Feuerofen 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei Manner im Feuerofen 1:1'")
		expect(p.parse("Gesang der drei Männer im Feuerofen 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei Männer im Feuerofen 1:1'")
		expect(p.parse("Gesang der drei im Feuerofen 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei im Feuerofen 1:1'")
		expect(p.parse("Gesang der drei Maenner 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei Maenner 1:1'")
		expect(p.parse("Gesang der drei Manner 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei Manner 1:1'")
		expect(p.parse("Gesang der drei Männer 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei Männer 1:1'")
		expect(p.parse("Gesang der Drei 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der Drei 1:1'")
		expect(p.parse("Gesang der drei 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'Gesang der drei 1:1'")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'SgThree 1:1'")
		expect(p.parse("L3J 1:1").osis()).toEqual("SgThree.1.1", "parsing: 'L3J 1:1'")
		`
		true
describe "Localized book Song (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (de)", ->
		`
		expect(p.parse("Hoheslied Salomonis 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hoheslied Salomonis 1:1'")
		expect(p.parse("Hohelied Salomonis 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hohelied Salomonis 1:1'")
		expect(p.parse("Hoheslied Salomos 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hoheslied Salomos 1:1'")
		expect(p.parse("Hohelied Salomos 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hohelied Salomos 1:1'")
		expect(p.parse("Hohes Lied 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hohes Lied 1:1'")
		expect(p.parse("Hoheslied 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hoheslied 1:1'")
		expect(p.parse("Hohelied 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hohelied 1:1'")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1", "parsing: 'Song 1:1'")
		expect(p.parse("Hld 1:1").osis()).toEqual("Song.1.1", "parsing: 'Hld 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("HOHESLIED SALOMONIS 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHESLIED SALOMONIS 1:1'")
		expect(p.parse("HOHELIED SALOMONIS 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHELIED SALOMONIS 1:1'")
		expect(p.parse("HOHESLIED SALOMOS 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHESLIED SALOMOS 1:1'")
		expect(p.parse("HOHELIED SALOMOS 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHELIED SALOMOS 1:1'")
		expect(p.parse("HOHES LIED 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHES LIED 1:1'")
		expect(p.parse("HOHESLIED 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHESLIED 1:1'")
		expect(p.parse("HOHELIED 1:1").osis()).toEqual("Song.1.1", "parsing: 'HOHELIED 1:1'")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1", "parsing: 'SONG 1:1'")
		expect(p.parse("HLD 1:1").osis()).toEqual("Song.1.1", "parsing: 'HLD 1:1'")
		`
		true
describe "Localized book Jer (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (de)", ->
		`
		expect(p.parse("Jeremias 1:1").osis()).toEqual("Jer.1.1", "parsing: 'Jeremias 1:1'")
		expect(p.parse("Jeremia 1:1").osis()).toEqual("Jer.1.1", "parsing: 'Jeremia 1:1'")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1", "parsing: 'Jer 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIAS 1:1").osis()).toEqual("Jer.1.1", "parsing: 'JEREMIAS 1:1'")
		expect(p.parse("JEREMIA 1:1").osis()).toEqual("Jer.1.1", "parsing: 'JEREMIA 1:1'")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1", "parsing: 'JER 1:1'")
		`
		true
describe "Localized book Ezek (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (de)", ->
		`
		expect(p.parse("Ezechiel 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'Ezechiel 1:1'")
		expect(p.parse("Hesekiel 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'Hesekiel 1:1'")
		expect(p.parse("Hesek 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'Hesek 1:1'")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'Ezek 1:1'")
		expect(p.parse("Hes 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'Hes 1:1'")
		expect(p.parse("Ez 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'Ez 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("EZECHIEL 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'EZECHIEL 1:1'")
		expect(p.parse("HESEKIEL 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'HESEKIEL 1:1'")
		expect(p.parse("HESEK 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'HESEK 1:1'")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'EZEK 1:1'")
		expect(p.parse("HES 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'HES 1:1'")
		expect(p.parse("EZ 1:1").osis()).toEqual("Ezek.1.1", "parsing: 'EZ 1:1'")
		`
		true
describe "Localized book Dan (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (de)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1", "parsing: 'Daniel 1:1'")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1", "parsing: 'Dan 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1", "parsing: 'DANIEL 1:1'")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1", "parsing: 'DAN 1:1'")
		`
		true
describe "Localized book Hos (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (de)", ->
		`
		expect(p.parse("Hosea 1:1").osis()).toEqual("Hos.1.1", "parsing: 'Hosea 1:1'")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1", "parsing: 'Hos 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("HOSEA 1:1").osis()).toEqual("Hos.1.1", "parsing: 'HOSEA 1:1'")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1", "parsing: 'HOS 1:1'")
		`
		true
describe "Localized book Joel (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (de)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1", "parsing: 'Joel 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1", "parsing: 'JOEL 1:1'")
		`
		true
describe "Localized book Amos (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (de)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1", "parsing: 'Amos 1:1'")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1", "parsing: 'Am 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1", "parsing: 'AMOS 1:1'")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1", "parsing: 'AM 1:1'")
		`
		true
describe "Localized book Obad (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (de)", ->
		`
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1", "parsing: 'Abdias 1:1'")
		expect(p.parse("Obadja 1:1").osis()).toEqual("Obad.1.1", "parsing: 'Obadja 1:1'")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1", "parsing: 'Obad 1:1'")
		expect(p.parse("Obd 1:1").osis()).toEqual("Obad.1.1", "parsing: 'Obd 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1", "parsing: 'ABDIAS 1:1'")
		expect(p.parse("OBADJA 1:1").osis()).toEqual("Obad.1.1", "parsing: 'OBADJA 1:1'")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1", "parsing: 'OBAD 1:1'")
		expect(p.parse("OBD 1:1").osis()).toEqual("Obad.1.1", "parsing: 'OBD 1:1'")
		`
		true
describe "Localized book Jonah (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (de)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1", "parsing: 'Jonah 1:1'")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1", "parsing: 'Jonas 1:1'")
		expect(p.parse("Jona 1:1").osis()).toEqual("Jonah.1.1", "parsing: 'Jona 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1", "parsing: 'JONAH 1:1'")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1", "parsing: 'JONAS 1:1'")
		expect(p.parse("JONA 1:1").osis()).toEqual("Jonah.1.1", "parsing: 'JONA 1:1'")
		`
		true
describe "Localized book Mic (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (de)", ->
		`
		expect(p.parse("Michaeas 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Michaeas 1:1'")
		expect(p.parse("Michaas 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Michaas 1:1'")
		expect(p.parse("Michäas 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Michäas 1:1'")
		expect(p.parse("Micha 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Micha 1:1'")
		expect(p.parse("Mich 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Mich 1:1'")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Mic 1:1'")
		expect(p.parse("Mi 1:1").osis()).toEqual("Mic.1.1", "parsing: 'Mi 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("MICHAEAS 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MICHAEAS 1:1'")
		expect(p.parse("MICHAAS 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MICHAAS 1:1'")
		expect(p.parse("MICHÄAS 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MICHÄAS 1:1'")
		expect(p.parse("MICHA 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MICHA 1:1'")
		expect(p.parse("MICH 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MICH 1:1'")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MIC 1:1'")
		expect(p.parse("MI 1:1").osis()).toEqual("Mic.1.1", "parsing: 'MI 1:1'")
		`
		true
describe "Localized book Nah (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (de)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1", "parsing: 'Nahum 1:1'")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1", "parsing: 'Nah 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1", "parsing: 'NAHUM 1:1'")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1", "parsing: 'NAH 1:1'")
		`
		true
describe "Localized book Hab (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (de)", ->
		`
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1", "parsing: 'Habakuk 1:1'")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1", "parsing: 'Hab 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1", "parsing: 'HABAKUK 1:1'")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1", "parsing: 'HAB 1:1'")
		`
		true
describe "Localized book Zeph (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (de)", ->
		`
		expect(p.parse("Zephanja 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'Zephanja 1:1'")
		expect(p.parse("Zefanja 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'Zefanja 1:1'")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'Zeph 1:1'")
		expect(p.parse("Zef 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'Zef 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZEPHANJA 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'ZEPHANJA 1:1'")
		expect(p.parse("ZEFANJA 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'ZEFANJA 1:1'")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'ZEPH 1:1'")
		expect(p.parse("ZEF 1:1").osis()).toEqual("Zeph.1.1", "parsing: 'ZEF 1:1'")
		`
		true
describe "Localized book Hag (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (de)", ->
		`
		expect(p.parse("Haggai 1:1").osis()).toEqual("Hag.1.1", "parsing: 'Haggai 1:1'")
		expect(p.parse("Hagg 1:1").osis()).toEqual("Hag.1.1", "parsing: 'Hagg 1:1'")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1", "parsing: 'Hag 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("HAGGAI 1:1").osis()).toEqual("Hag.1.1", "parsing: 'HAGGAI 1:1'")
		expect(p.parse("HAGG 1:1").osis()).toEqual("Hag.1.1", "parsing: 'HAGG 1:1'")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1", "parsing: 'HAG 1:1'")
		`
		true
describe "Localized book Zech (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (de)", ->
		`
		expect(p.parse("Zacharias 1:1").osis()).toEqual("Zech.1.1", "parsing: 'Zacharias 1:1'")
		expect(p.parse("Sacharja 1:1").osis()).toEqual("Zech.1.1", "parsing: 'Sacharja 1:1'")
		expect(p.parse("Sach 1:1").osis()).toEqual("Zech.1.1", "parsing: 'Sach 1:1'")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1", "parsing: 'Zech 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZACHARIAS 1:1").osis()).toEqual("Zech.1.1", "parsing: 'ZACHARIAS 1:1'")
		expect(p.parse("SACHARJA 1:1").osis()).toEqual("Zech.1.1", "parsing: 'SACHARJA 1:1'")
		expect(p.parse("SACH 1:1").osis()).toEqual("Zech.1.1", "parsing: 'SACH 1:1'")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1", "parsing: 'ZECH 1:1'")
		`
		true
describe "Localized book Mal (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (de)", ->
		`
		expect(p.parse("Malachias 1:1").osis()).toEqual("Mal.1.1", "parsing: 'Malachias 1:1'")
		expect(p.parse("Maleachi 1:1").osis()).toEqual("Mal.1.1", "parsing: 'Maleachi 1:1'")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1", "parsing: 'Mal 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("MALACHIAS 1:1").osis()).toEqual("Mal.1.1", "parsing: 'MALACHIAS 1:1'")
		expect(p.parse("MALEACHI 1:1").osis()).toEqual("Mal.1.1", "parsing: 'MALEACHI 1:1'")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1", "parsing: 'MAL 1:1'")
		`
		true
describe "Localized book Matt (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (de)", ->
		`
		expect(p.parse("Das Evangelium nach Matthaeus 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Das Evangelium nach Matthaeus 1:1'")
		expect(p.parse("Das Evangelium nach Matthaus 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Das Evangelium nach Matthaus 1:1'")
		expect(p.parse("Das Evangelium nach Matthäus 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Das Evangelium nach Matthäus 1:1'")
		expect(p.parse(" Evangelium nach Matthaeus 1:1").osis()).toEqual("Matt.1.1", "parsing: ' Evangelium nach Matthaeus 1:1'")
		expect(p.parse(" Evangelium nach Matthaus 1:1").osis()).toEqual("Matt.1.1", "parsing: ' Evangelium nach Matthaus 1:1'")
		expect(p.parse(" Evangelium nach Matthäus 1:1").osis()).toEqual("Matt.1.1", "parsing: ' Evangelium nach Matthäus 1:1'")
		expect(p.parse("Matthaeusevangelium 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matthaeusevangelium 1:1'")
		expect(p.parse("Matthausevangelium 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matthausevangelium 1:1'")
		expect(p.parse("Matthäusevangelium 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matthäusevangelium 1:1'")
		expect(p.parse("Matthaeus 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matthaeus 1:1'")
		expect(p.parse("Matthaus 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matthaus 1:1'")
		expect(p.parse("Matthäus 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matthäus 1:1'")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Matt 1:1'")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1", "parsing: 'Mt 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DAS EVANGELIUM NACH MATTHAEUS 1:1").osis()).toEqual("Matt.1.1", "parsing: 'DAS EVANGELIUM NACH MATTHAEUS 1:1'")
		expect(p.parse("DAS EVANGELIUM NACH MATTHAUS 1:1").osis()).toEqual("Matt.1.1", "parsing: 'DAS EVANGELIUM NACH MATTHAUS 1:1'")
		expect(p.parse("DAS EVANGELIUM NACH MATTHÄUS 1:1").osis()).toEqual("Matt.1.1", "parsing: 'DAS EVANGELIUM NACH MATTHÄUS 1:1'")
		expect(p.parse(" EVANGELIUM NACH MATTHAEUS 1:1").osis()).toEqual("Matt.1.1", "parsing: ' EVANGELIUM NACH MATTHAEUS 1:1'")
		expect(p.parse(" EVANGELIUM NACH MATTHAUS 1:1").osis()).toEqual("Matt.1.1", "parsing: ' EVANGELIUM NACH MATTHAUS 1:1'")
		expect(p.parse(" EVANGELIUM NACH MATTHÄUS 1:1").osis()).toEqual("Matt.1.1", "parsing: ' EVANGELIUM NACH MATTHÄUS 1:1'")
		expect(p.parse("MATTHAEUSEVANGELIUM 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATTHAEUSEVANGELIUM 1:1'")
		expect(p.parse("MATTHAUSEVANGELIUM 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATTHAUSEVANGELIUM 1:1'")
		expect(p.parse("MATTHÄUSEVANGELIUM 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATTHÄUSEVANGELIUM 1:1'")
		expect(p.parse("MATTHAEUS 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATTHAEUS 1:1'")
		expect(p.parse("MATTHAUS 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATTHAUS 1:1'")
		expect(p.parse("MATTHÄUS 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATTHÄUS 1:1'")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MATT 1:1'")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1", "parsing: 'MT 1:1'")
		`
		true
describe "Localized book Mark (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (de)", ->
		`
		expect(p.parse("Das Evangelium nach Markus 1:1").osis()).toEqual("Mark.1.1", "parsing: 'Das Evangelium nach Markus 1:1'")
		expect(p.parse(" Evangelium nach Markus 1:1").osis()).toEqual("Mark.1.1", "parsing: ' Evangelium nach Markus 1:1'")
		expect(p.parse("Markusevangelium 1:1").osis()).toEqual("Mark.1.1", "parsing: 'Markusevangelium 1:1'")
		expect(p.parse("Markus 1:1").osis()).toEqual("Mark.1.1", "parsing: 'Markus 1:1'")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1", "parsing: 'Mark 1:1'")
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1", "parsing: 'Mk 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DAS EVANGELIUM NACH MARKUS 1:1").osis()).toEqual("Mark.1.1", "parsing: 'DAS EVANGELIUM NACH MARKUS 1:1'")
		expect(p.parse(" EVANGELIUM NACH MARKUS 1:1").osis()).toEqual("Mark.1.1", "parsing: ' EVANGELIUM NACH MARKUS 1:1'")
		expect(p.parse("MARKUSEVANGELIUM 1:1").osis()).toEqual("Mark.1.1", "parsing: 'MARKUSEVANGELIUM 1:1'")
		expect(p.parse("MARKUS 1:1").osis()).toEqual("Mark.1.1", "parsing: 'MARKUS 1:1'")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1", "parsing: 'MARK 1:1'")
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1", "parsing: 'MK 1:1'")
		`
		true
describe "Localized book Luke (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (de)", ->
		`
		expect(p.parse("Das Evangelium nach Lukas 1:1").osis()).toEqual("Luke.1.1", "parsing: 'Das Evangelium nach Lukas 1:1'")
		expect(p.parse(" Evangelium nach Lukas 1:1").osis()).toEqual("Luke.1.1", "parsing: ' Evangelium nach Lukas 1:1'")
		expect(p.parse("Lukasevangelium 1:1").osis()).toEqual("Luke.1.1", "parsing: 'Lukasevangelium 1:1'")
		expect(p.parse("Lukas 1:1").osis()).toEqual("Luke.1.1", "parsing: 'Lukas 1:1'")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1", "parsing: 'Luke 1:1'")
		expect(p.parse("Luk 1:1").osis()).toEqual("Luke.1.1", "parsing: 'Luk 1:1'")
		expect(p.parse("Lk 1:1").osis()).toEqual("Luke.1.1", "parsing: 'Lk 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DAS EVANGELIUM NACH LUKAS 1:1").osis()).toEqual("Luke.1.1", "parsing: 'DAS EVANGELIUM NACH LUKAS 1:1'")
		expect(p.parse(" EVANGELIUM NACH LUKAS 1:1").osis()).toEqual("Luke.1.1", "parsing: ' EVANGELIUM NACH LUKAS 1:1'")
		expect(p.parse("LUKASEVANGELIUM 1:1").osis()).toEqual("Luke.1.1", "parsing: 'LUKASEVANGELIUM 1:1'")
		expect(p.parse("LUKAS 1:1").osis()).toEqual("Luke.1.1", "parsing: 'LUKAS 1:1'")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1", "parsing: 'LUKE 1:1'")
		expect(p.parse("LUK 1:1").osis()).toEqual("Luke.1.1", "parsing: 'LUK 1:1'")
		expect(p.parse("LK 1:1").osis()).toEqual("Luke.1.1", "parsing: 'LK 1:1'")
		`
		true
describe "Localized book 1John (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (de)", ->
		`
		expect(p.parse("Ersten Johannes 1:1").osis()).toEqual("1John.1.1", "parsing: 'Ersten Johannes 1:1'")
		expect(p.parse("Erster Johannes 1:1").osis()).toEqual("1John.1.1", "parsing: 'Erster Johannes 1:1'")
		expect(p.parse("Erstes Johannes 1:1").osis()).toEqual("1John.1.1", "parsing: 'Erstes Johannes 1:1'")
		expect(p.parse("Erste Johannes 1:1").osis()).toEqual("1John.1.1", "parsing: 'Erste Johannes 1:1'")
		expect(p.parse("1. Johannes 1:1").osis()).toEqual("1John.1.1", "parsing: '1. Johannes 1:1'")
		expect(p.parse("1 Johannes 1:1").osis()).toEqual("1John.1.1", "parsing: '1 Johannes 1:1'")
		expect(p.parse("1. Joh 1:1").osis()).toEqual("1John.1.1", "parsing: '1. Joh 1:1'")
		expect(p.parse("1 Joh 1:1").osis()).toEqual("1John.1.1", "parsing: '1 Joh 1:1'")
		expect(p.parse("1. Jo 1:1").osis()).toEqual("1John.1.1", "parsing: '1. Jo 1:1'")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1", "parsing: '1John 1:1'")
		expect(p.parse("1 Jo 1:1").osis()).toEqual("1John.1.1", "parsing: '1 Jo 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN JOHANNES 1:1").osis()).toEqual("1John.1.1", "parsing: 'ERSTEN JOHANNES 1:1'")
		expect(p.parse("ERSTER JOHANNES 1:1").osis()).toEqual("1John.1.1", "parsing: 'ERSTER JOHANNES 1:1'")
		expect(p.parse("ERSTES JOHANNES 1:1").osis()).toEqual("1John.1.1", "parsing: 'ERSTES JOHANNES 1:1'")
		expect(p.parse("ERSTE JOHANNES 1:1").osis()).toEqual("1John.1.1", "parsing: 'ERSTE JOHANNES 1:1'")
		expect(p.parse("1. JOHANNES 1:1").osis()).toEqual("1John.1.1", "parsing: '1. JOHANNES 1:1'")
		expect(p.parse("1 JOHANNES 1:1").osis()).toEqual("1John.1.1", "parsing: '1 JOHANNES 1:1'")
		expect(p.parse("1. JOH 1:1").osis()).toEqual("1John.1.1", "parsing: '1. JOH 1:1'")
		expect(p.parse("1 JOH 1:1").osis()).toEqual("1John.1.1", "parsing: '1 JOH 1:1'")
		expect(p.parse("1. JO 1:1").osis()).toEqual("1John.1.1", "parsing: '1. JO 1:1'")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1", "parsing: '1JOHN 1:1'")
		expect(p.parse("1 JO 1:1").osis()).toEqual("1John.1.1", "parsing: '1 JO 1:1'")
		`
		true
describe "Localized book 2John (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (de)", ->
		`
		expect(p.parse("Zweiten Johannes 1:1").osis()).toEqual("2John.1.1", "parsing: 'Zweiten Johannes 1:1'")
		expect(p.parse("Zweiter Johannes 1:1").osis()).toEqual("2John.1.1", "parsing: 'Zweiter Johannes 1:1'")
		expect(p.parse("Zweites Johannes 1:1").osis()).toEqual("2John.1.1", "parsing: 'Zweites Johannes 1:1'")
		expect(p.parse("Zweite Johannes 1:1").osis()).toEqual("2John.1.1", "parsing: 'Zweite Johannes 1:1'")
		expect(p.parse("2. Johannes 1:1").osis()).toEqual("2John.1.1", "parsing: '2. Johannes 1:1'")
		expect(p.parse("2 Johannes 1:1").osis()).toEqual("2John.1.1", "parsing: '2 Johannes 1:1'")
		expect(p.parse("2. Joh 1:1").osis()).toEqual("2John.1.1", "parsing: '2. Joh 1:1'")
		expect(p.parse("2 Joh 1:1").osis()).toEqual("2John.1.1", "parsing: '2 Joh 1:1'")
		expect(p.parse("2. Jo 1:1").osis()).toEqual("2John.1.1", "parsing: '2. Jo 1:1'")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1", "parsing: '2John 1:1'")
		expect(p.parse("2 Jo 1:1").osis()).toEqual("2John.1.1", "parsing: '2 Jo 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN JOHANNES 1:1").osis()).toEqual("2John.1.1", "parsing: 'ZWEITEN JOHANNES 1:1'")
		expect(p.parse("ZWEITER JOHANNES 1:1").osis()).toEqual("2John.1.1", "parsing: 'ZWEITER JOHANNES 1:1'")
		expect(p.parse("ZWEITES JOHANNES 1:1").osis()).toEqual("2John.1.1", "parsing: 'ZWEITES JOHANNES 1:1'")
		expect(p.parse("ZWEITE JOHANNES 1:1").osis()).toEqual("2John.1.1", "parsing: 'ZWEITE JOHANNES 1:1'")
		expect(p.parse("2. JOHANNES 1:1").osis()).toEqual("2John.1.1", "parsing: '2. JOHANNES 1:1'")
		expect(p.parse("2 JOHANNES 1:1").osis()).toEqual("2John.1.1", "parsing: '2 JOHANNES 1:1'")
		expect(p.parse("2. JOH 1:1").osis()).toEqual("2John.1.1", "parsing: '2. JOH 1:1'")
		expect(p.parse("2 JOH 1:1").osis()).toEqual("2John.1.1", "parsing: '2 JOH 1:1'")
		expect(p.parse("2. JO 1:1").osis()).toEqual("2John.1.1", "parsing: '2. JO 1:1'")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1", "parsing: '2JOHN 1:1'")
		expect(p.parse("2 JO 1:1").osis()).toEqual("2John.1.1", "parsing: '2 JO 1:1'")
		`
		true
describe "Localized book 3John (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (de)", ->
		`
		expect(p.parse("Dritten Johannes 1:1").osis()).toEqual("3John.1.1", "parsing: 'Dritten Johannes 1:1'")
		expect(p.parse("Dritter Johannes 1:1").osis()).toEqual("3John.1.1", "parsing: 'Dritter Johannes 1:1'")
		expect(p.parse("Drittes Johannes 1:1").osis()).toEqual("3John.1.1", "parsing: 'Drittes Johannes 1:1'")
		expect(p.parse("Dritte Johannes 1:1").osis()).toEqual("3John.1.1", "parsing: 'Dritte Johannes 1:1'")
		expect(p.parse("3. Johannes 1:1").osis()).toEqual("3John.1.1", "parsing: '3. Johannes 1:1'")
		expect(p.parse("3 Johannes 1:1").osis()).toEqual("3John.1.1", "parsing: '3 Johannes 1:1'")
		expect(p.parse("3. Joh 1:1").osis()).toEqual("3John.1.1", "parsing: '3. Joh 1:1'")
		expect(p.parse("3 Joh 1:1").osis()).toEqual("3John.1.1", "parsing: '3 Joh 1:1'")
		expect(p.parse("3. Jo 1:1").osis()).toEqual("3John.1.1", "parsing: '3. Jo 1:1'")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1", "parsing: '3John 1:1'")
		expect(p.parse("3 Jo 1:1").osis()).toEqual("3John.1.1", "parsing: '3 Jo 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DRITTEN JOHANNES 1:1").osis()).toEqual("3John.1.1", "parsing: 'DRITTEN JOHANNES 1:1'")
		expect(p.parse("DRITTER JOHANNES 1:1").osis()).toEqual("3John.1.1", "parsing: 'DRITTER JOHANNES 1:1'")
		expect(p.parse("DRITTES JOHANNES 1:1").osis()).toEqual("3John.1.1", "parsing: 'DRITTES JOHANNES 1:1'")
		expect(p.parse("DRITTE JOHANNES 1:1").osis()).toEqual("3John.1.1", "parsing: 'DRITTE JOHANNES 1:1'")
		expect(p.parse("3. JOHANNES 1:1").osis()).toEqual("3John.1.1", "parsing: '3. JOHANNES 1:1'")
		expect(p.parse("3 JOHANNES 1:1").osis()).toEqual("3John.1.1", "parsing: '3 JOHANNES 1:1'")
		expect(p.parse("3. JOH 1:1").osis()).toEqual("3John.1.1", "parsing: '3. JOH 1:1'")
		expect(p.parse("3 JOH 1:1").osis()).toEqual("3John.1.1", "parsing: '3 JOH 1:1'")
		expect(p.parse("3. JO 1:1").osis()).toEqual("3John.1.1", "parsing: '3. JO 1:1'")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1", "parsing: '3JOHN 1:1'")
		expect(p.parse("3 JO 1:1").osis()).toEqual("3John.1.1", "parsing: '3 JO 1:1'")
		`
		true
describe "Localized book John (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (de)", ->
		`
		expect(p.parse("Das Evangelium nach Johannes 1:1").osis()).toEqual("John.1.1", "parsing: 'Das Evangelium nach Johannes 1:1'")
		expect(p.parse(" Evangelium nach Johannes 1:1").osis()).toEqual("John.1.1", "parsing: ' Evangelium nach Johannes 1:1'")
		expect(p.parse("Johannesevangelium 1:1").osis()).toEqual("John.1.1", "parsing: 'Johannesevangelium 1:1'")
		expect(p.parse("Johannes 1:1").osis()).toEqual("John.1.1", "parsing: 'Johannes 1:1'")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1", "parsing: 'John 1:1'")
		expect(p.parse("Joh 1:1").osis()).toEqual("John.1.1", "parsing: 'Joh 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("DAS EVANGELIUM NACH JOHANNES 1:1").osis()).toEqual("John.1.1", "parsing: 'DAS EVANGELIUM NACH JOHANNES 1:1'")
		expect(p.parse(" EVANGELIUM NACH JOHANNES 1:1").osis()).toEqual("John.1.1", "parsing: ' EVANGELIUM NACH JOHANNES 1:1'")
		expect(p.parse("JOHANNESEVANGELIUM 1:1").osis()).toEqual("John.1.1", "parsing: 'JOHANNESEVANGELIUM 1:1'")
		expect(p.parse("JOHANNES 1:1").osis()).toEqual("John.1.1", "parsing: 'JOHANNES 1:1'")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1", "parsing: 'JOHN 1:1'")
		expect(p.parse("JOH 1:1").osis()).toEqual("John.1.1", "parsing: 'JOH 1:1'")
		`
		true
describe "Localized book Acts (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (de)", ->
		`
		expect(p.parse("Apostelgeschichte 1:1").osis()).toEqual("Acts.1.1", "parsing: 'Apostelgeschichte 1:1'")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1", "parsing: 'Acts 1:1'")
		expect(p.parse("Apg 1:1").osis()).toEqual("Acts.1.1", "parsing: 'Apg 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("APOSTELGESCHICHTE 1:1").osis()).toEqual("Acts.1.1", "parsing: 'APOSTELGESCHICHTE 1:1'")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1", "parsing: 'ACTS 1:1'")
		expect(p.parse("APG 1:1").osis()).toEqual("Acts.1.1", "parsing: 'APG 1:1'")
		`
		true
describe "Localized book Rom (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (de)", ->
		`
		expect(p.parse("Roemer 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Roemer 1:1'")
		expect(p.parse("Romer 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Romer 1:1'")
		expect(p.parse("Römer 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Römer 1:1'")
		expect(p.parse("Roem 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Roem 1:1'")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Rom 1:1'")
		expect(p.parse("Röm 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Röm 1:1'")
		expect(p.parse("Rm 1:1").osis()).toEqual("Rom.1.1", "parsing: 'Rm 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ROEMER 1:1").osis()).toEqual("Rom.1.1", "parsing: 'ROEMER 1:1'")
		expect(p.parse("ROMER 1:1").osis()).toEqual("Rom.1.1", "parsing: 'ROMER 1:1'")
		expect(p.parse("RÖMER 1:1").osis()).toEqual("Rom.1.1", "parsing: 'RÖMER 1:1'")
		expect(p.parse("ROEM 1:1").osis()).toEqual("Rom.1.1", "parsing: 'ROEM 1:1'")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1", "parsing: 'ROM 1:1'")
		expect(p.parse("RÖM 1:1").osis()).toEqual("Rom.1.1", "parsing: 'RÖM 1:1'")
		expect(p.parse("RM 1:1").osis()).toEqual("Rom.1.1", "parsing: 'RM 1:1'")
		`
		true
describe "Localized book 2Cor (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (de)", ->
		`
		expect(p.parse("Zweiten Korinther 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'Zweiten Korinther 1:1'")
		expect(p.parse("Zweiter Korinther 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'Zweiter Korinther 1:1'")
		expect(p.parse("Zweites Korinther 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'Zweites Korinther 1:1'")
		expect(p.parse("Zweite Korinther 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'Zweite Korinther 1:1'")
		expect(p.parse("2. Korinther 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2. Korinther 1:1'")
		expect(p.parse("2 Korinther 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2 Korinther 1:1'")
		expect(p.parse("2. Kor 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2. Kor 1:1'")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2 Kor 1:1'")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2Cor 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN KORINTHER 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'ZWEITEN KORINTHER 1:1'")
		expect(p.parse("ZWEITER KORINTHER 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'ZWEITER KORINTHER 1:1'")
		expect(p.parse("ZWEITES KORINTHER 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'ZWEITES KORINTHER 1:1'")
		expect(p.parse("ZWEITE KORINTHER 1:1").osis()).toEqual("2Cor.1.1", "parsing: 'ZWEITE KORINTHER 1:1'")
		expect(p.parse("2. KORINTHER 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2. KORINTHER 1:1'")
		expect(p.parse("2 KORINTHER 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2 KORINTHER 1:1'")
		expect(p.parse("2. KOR 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2. KOR 1:1'")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2 KOR 1:1'")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1", "parsing: '2COR 1:1'")
		`
		true
describe "Localized book 1Cor (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (de)", ->
		`
		expect(p.parse("Ersten Korinther 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'Ersten Korinther 1:1'")
		expect(p.parse("Erster Korinther 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'Erster Korinther 1:1'")
		expect(p.parse("Erstes Korinther 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'Erstes Korinther 1:1'")
		expect(p.parse("Erste Korinther 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'Erste Korinther 1:1'")
		expect(p.parse("1. Korinther 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1. Korinther 1:1'")
		expect(p.parse("1 Korinther 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1 Korinther 1:1'")
		expect(p.parse("1. Kor 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1. Kor 1:1'")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1 Kor 1:1'")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1Cor 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN KORINTHER 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'ERSTEN KORINTHER 1:1'")
		expect(p.parse("ERSTER KORINTHER 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'ERSTER KORINTHER 1:1'")
		expect(p.parse("ERSTES KORINTHER 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'ERSTES KORINTHER 1:1'")
		expect(p.parse("ERSTE KORINTHER 1:1").osis()).toEqual("1Cor.1.1", "parsing: 'ERSTE KORINTHER 1:1'")
		expect(p.parse("1. KORINTHER 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1. KORINTHER 1:1'")
		expect(p.parse("1 KORINTHER 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1 KORINTHER 1:1'")
		expect(p.parse("1. KOR 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1. KOR 1:1'")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1 KOR 1:1'")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1", "parsing: '1COR 1:1'")
		`
		true
describe "Localized book Gal (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (de)", ->
		`
		expect(p.parse("Galater 1:1").osis()).toEqual("Gal.1.1", "parsing: 'Galater 1:1'")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1", "parsing: 'Gal 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("GALATER 1:1").osis()).toEqual("Gal.1.1", "parsing: 'GALATER 1:1'")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1", "parsing: 'GAL 1:1'")
		`
		true
describe "Localized book Eph (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (de)", ->
		`
		expect(p.parse("Epheser 1:1").osis()).toEqual("Eph.1.1", "parsing: 'Epheser 1:1'")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1", "parsing: 'Eph 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("EPHESER 1:1").osis()).toEqual("Eph.1.1", "parsing: 'EPHESER 1:1'")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1", "parsing: 'EPH 1:1'")
		`
		true
describe "Localized book Phil (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (de)", ->
		`
		expect(p.parse("Philipper 1:1").osis()).toEqual("Phil.1.1", "parsing: 'Philipper 1:1'")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1", "parsing: 'Phil 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("PHILIPPER 1:1").osis()).toEqual("Phil.1.1", "parsing: 'PHILIPPER 1:1'")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1", "parsing: 'PHIL 1:1'")
		`
		true
describe "Localized book Col (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (de)", ->
		`
		expect(p.parse("Kolosser 1:1").osis()).toEqual("Col.1.1", "parsing: 'Kolosser 1:1'")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1", "parsing: 'Col 1:1'")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1", "parsing: 'Kol 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("KOLOSSER 1:1").osis()).toEqual("Col.1.1", "parsing: 'KOLOSSER 1:1'")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1", "parsing: 'COL 1:1'")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1", "parsing: 'KOL 1:1'")
		`
		true
describe "Localized book 2Thess (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (de)", ->
		`
		expect(p.parse("Zweiten Thessalonicher 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'Zweiten Thessalonicher 1:1'")
		expect(p.parse("Zweiter Thessalonicher 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'Zweiter Thessalonicher 1:1'")
		expect(p.parse("Zweites Thessalonicher 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'Zweites Thessalonicher 1:1'")
		expect(p.parse("Zweite Thessalonicher 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'Zweite Thessalonicher 1:1'")
		expect(p.parse("2. Thessalonicher 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2. Thessalonicher 1:1'")
		expect(p.parse("2 Thessalonicher 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2 Thessalonicher 1:1'")
		expect(p.parse("2. Thess 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2. Thess 1:1'")
		expect(p.parse("2 Thess 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2 Thess 1:1'")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2Thess 1:1'")
		expect(p.parse("2. Th 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2. Th 1:1'")
		expect(p.parse("2 Th 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2 Th 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN THESSALONICHER 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'ZWEITEN THESSALONICHER 1:1'")
		expect(p.parse("ZWEITER THESSALONICHER 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'ZWEITER THESSALONICHER 1:1'")
		expect(p.parse("ZWEITES THESSALONICHER 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'ZWEITES THESSALONICHER 1:1'")
		expect(p.parse("ZWEITE THESSALONICHER 1:1").osis()).toEqual("2Thess.1.1", "parsing: 'ZWEITE THESSALONICHER 1:1'")
		expect(p.parse("2. THESSALONICHER 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2. THESSALONICHER 1:1'")
		expect(p.parse("2 THESSALONICHER 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2 THESSALONICHER 1:1'")
		expect(p.parse("2. THESS 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2. THESS 1:1'")
		expect(p.parse("2 THESS 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2 THESS 1:1'")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2THESS 1:1'")
		expect(p.parse("2. TH 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2. TH 1:1'")
		expect(p.parse("2 TH 1:1").osis()).toEqual("2Thess.1.1", "parsing: '2 TH 1:1'")
		`
		true
describe "Localized book 1Thess (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (de)", ->
		`
		expect(p.parse("Ersten Thessalonicher 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'Ersten Thessalonicher 1:1'")
		expect(p.parse("Erster Thessalonicher 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'Erster Thessalonicher 1:1'")
		expect(p.parse("Erstes Thessalonicher 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'Erstes Thessalonicher 1:1'")
		expect(p.parse("Erste Thessalonicher 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'Erste Thessalonicher 1:1'")
		expect(p.parse("1. Thessalonicher 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1. Thessalonicher 1:1'")
		expect(p.parse("1 Thessalonicher 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1 Thessalonicher 1:1'")
		expect(p.parse("1. Thess 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1. Thess 1:1'")
		expect(p.parse("1 Thess 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1 Thess 1:1'")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1Thess 1:1'")
		expect(p.parse("1. Th 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1. Th 1:1'")
		expect(p.parse("1 Th 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1 Th 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN THESSALONICHER 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'ERSTEN THESSALONICHER 1:1'")
		expect(p.parse("ERSTER THESSALONICHER 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'ERSTER THESSALONICHER 1:1'")
		expect(p.parse("ERSTES THESSALONICHER 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'ERSTES THESSALONICHER 1:1'")
		expect(p.parse("ERSTE THESSALONICHER 1:1").osis()).toEqual("1Thess.1.1", "parsing: 'ERSTE THESSALONICHER 1:1'")
		expect(p.parse("1. THESSALONICHER 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1. THESSALONICHER 1:1'")
		expect(p.parse("1 THESSALONICHER 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1 THESSALONICHER 1:1'")
		expect(p.parse("1. THESS 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1. THESS 1:1'")
		expect(p.parse("1 THESS 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1 THESS 1:1'")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1THESS 1:1'")
		expect(p.parse("1. TH 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1. TH 1:1'")
		expect(p.parse("1 TH 1:1").osis()).toEqual("1Thess.1.1", "parsing: '1 TH 1:1'")
		`
		true
describe "Localized book 2Tim (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (de)", ->
		`
		expect(p.parse("Zweiten Timotheus 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'Zweiten Timotheus 1:1'")
		expect(p.parse("Zweiter Timotheus 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'Zweiter Timotheus 1:1'")
		expect(p.parse("Zweites Timotheus 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'Zweites Timotheus 1:1'")
		expect(p.parse("Zweite Timotheus 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'Zweite Timotheus 1:1'")
		expect(p.parse("2. Timotheus 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2. Timotheus 1:1'")
		expect(p.parse("2 Timotheus 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2 Timotheus 1:1'")
		expect(p.parse("2. Tim 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2. Tim 1:1'")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2 Tim 1:1'")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2Tim 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'ZWEITEN TIMOTHEUS 1:1'")
		expect(p.parse("ZWEITER TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'ZWEITER TIMOTHEUS 1:1'")
		expect(p.parse("ZWEITES TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'ZWEITES TIMOTHEUS 1:1'")
		expect(p.parse("ZWEITE TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1", "parsing: 'ZWEITE TIMOTHEUS 1:1'")
		expect(p.parse("2. TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2. TIMOTHEUS 1:1'")
		expect(p.parse("2 TIMOTHEUS 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2 TIMOTHEUS 1:1'")
		expect(p.parse("2. TIM 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2. TIM 1:1'")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2 TIM 1:1'")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1", "parsing: '2TIM 1:1'")
		`
		true
describe "Localized book 1Tim (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (de)", ->
		`
		expect(p.parse("Ersten Timotheus 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'Ersten Timotheus 1:1'")
		expect(p.parse("Erster Timotheus 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'Erster Timotheus 1:1'")
		expect(p.parse("Erstes Timotheus 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'Erstes Timotheus 1:1'")
		expect(p.parse("Erste Timotheus 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'Erste Timotheus 1:1'")
		expect(p.parse("1. Timotheus 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1. Timotheus 1:1'")
		expect(p.parse("1 Timotheus 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1 Timotheus 1:1'")
		expect(p.parse("1. Tim 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1. Tim 1:1'")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1 Tim 1:1'")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1Tim 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'ERSTEN TIMOTHEUS 1:1'")
		expect(p.parse("ERSTER TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'ERSTER TIMOTHEUS 1:1'")
		expect(p.parse("ERSTES TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'ERSTES TIMOTHEUS 1:1'")
		expect(p.parse("ERSTE TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1", "parsing: 'ERSTE TIMOTHEUS 1:1'")
		expect(p.parse("1. TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1. TIMOTHEUS 1:1'")
		expect(p.parse("1 TIMOTHEUS 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1 TIMOTHEUS 1:1'")
		expect(p.parse("1. TIM 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1. TIM 1:1'")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1 TIM 1:1'")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1", "parsing: '1TIM 1:1'")
		`
		true
describe "Localized book Titus (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (de)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1", "parsing: 'Titus 1:1'")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1", "parsing: 'Tit 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1", "parsing: 'TITUS 1:1'")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1", "parsing: 'TIT 1:1'")
		`
		true
describe "Localized book Phlm (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (de)", ->
		`
		expect(p.parse("Philemon 1:1").osis()).toEqual("Phlm.1.1", "parsing: 'Philemon 1:1'")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1", "parsing: 'Phlm 1:1'")
		expect(p.parse("Phm 1:1").osis()).toEqual("Phlm.1.1", "parsing: 'Phm 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("PHILEMON 1:1").osis()).toEqual("Phlm.1.1", "parsing: 'PHILEMON 1:1'")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1", "parsing: 'PHLM 1:1'")
		expect(p.parse("PHM 1:1").osis()).toEqual("Phlm.1.1", "parsing: 'PHM 1:1'")
		`
		true
describe "Localized book Heb (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (de)", ->
		`
		expect(p.parse("Hebraeer 1:1").osis()).toEqual("Heb.1.1", "parsing: 'Hebraeer 1:1'")
		expect(p.parse("Hebraer 1:1").osis()).toEqual("Heb.1.1", "parsing: 'Hebraer 1:1'")
		expect(p.parse("Hebräer 1:1").osis()).toEqual("Heb.1.1", "parsing: 'Hebräer 1:1'")
		expect(p.parse("Hebr 1:1").osis()).toEqual("Heb.1.1", "parsing: 'Hebr 1:1'")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1", "parsing: 'Heb 1:1'")
		expect(p.parse("Hb 1:1").osis()).toEqual("Heb.1.1", "parsing: 'Hb 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("HEBRAEER 1:1").osis()).toEqual("Heb.1.1", "parsing: 'HEBRAEER 1:1'")
		expect(p.parse("HEBRAER 1:1").osis()).toEqual("Heb.1.1", "parsing: 'HEBRAER 1:1'")
		expect(p.parse("HEBRÄER 1:1").osis()).toEqual("Heb.1.1", "parsing: 'HEBRÄER 1:1'")
		expect(p.parse("HEBR 1:1").osis()).toEqual("Heb.1.1", "parsing: 'HEBR 1:1'")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1", "parsing: 'HEB 1:1'")
		expect(p.parse("HB 1:1").osis()).toEqual("Heb.1.1", "parsing: 'HB 1:1'")
		`
		true
describe "Localized book Jas (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (de)", ->
		`
		expect(p.parse("Jakobusbrief 1:1").osis()).toEqual("Jas.1.1", "parsing: 'Jakobusbrief 1:1'")
		expect(p.parse("Jakobus 1:1").osis()).toEqual("Jas.1.1", "parsing: 'Jakobus 1:1'")
		expect(p.parse("Jak 1:1").osis()).toEqual("Jas.1.1", "parsing: 'Jak 1:1'")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1", "parsing: 'Jas 1:1'")
		expect(p.parse("Jk 1:1").osis()).toEqual("Jas.1.1", "parsing: 'Jk 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("JAKOBUSBRIEF 1:1").osis()).toEqual("Jas.1.1", "parsing: 'JAKOBUSBRIEF 1:1'")
		expect(p.parse("JAKOBUS 1:1").osis()).toEqual("Jas.1.1", "parsing: 'JAKOBUS 1:1'")
		expect(p.parse("JAK 1:1").osis()).toEqual("Jas.1.1", "parsing: 'JAK 1:1'")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1", "parsing: 'JAS 1:1'")
		expect(p.parse("JK 1:1").osis()).toEqual("Jas.1.1", "parsing: 'JK 1:1'")
		`
		true
describe "Localized book 2Pet (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (de)", ->
		`
		expect(p.parse("Zweiten Petrus 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'Zweiten Petrus 1:1'")
		expect(p.parse("Zweiter Petrus 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'Zweiter Petrus 1:1'")
		expect(p.parse("Zweites Petrus 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'Zweites Petrus 1:1'")
		expect(p.parse("Zweite Petrus 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'Zweite Petrus 1:1'")
		expect(p.parse("2. Petrus 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. Petrus 1:1'")
		expect(p.parse("2 Petrus 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 Petrus 1:1'")
		expect(p.parse("2. Petr 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. Petr 1:1'")
		expect(p.parse("2 Petr 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 Petr 1:1'")
		expect(p.parse("2. Pet 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. Pet 1:1'")
		expect(p.parse("2 Pet 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 Pet 1:1'")
		expect(p.parse("2. Pt 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. Pt 1:1'")
		expect(p.parse("2 Pt 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 Pt 1:1'")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2Pet 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ZWEITEN PETRUS 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'ZWEITEN PETRUS 1:1'")
		expect(p.parse("ZWEITER PETRUS 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'ZWEITER PETRUS 1:1'")
		expect(p.parse("ZWEITES PETRUS 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'ZWEITES PETRUS 1:1'")
		expect(p.parse("ZWEITE PETRUS 1:1").osis()).toEqual("2Pet.1.1", "parsing: 'ZWEITE PETRUS 1:1'")
		expect(p.parse("2. PETRUS 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. PETRUS 1:1'")
		expect(p.parse("2 PETRUS 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 PETRUS 1:1'")
		expect(p.parse("2. PETR 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. PETR 1:1'")
		expect(p.parse("2 PETR 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 PETR 1:1'")
		expect(p.parse("2. PET 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. PET 1:1'")
		expect(p.parse("2 PET 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 PET 1:1'")
		expect(p.parse("2. PT 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2. PT 1:1'")
		expect(p.parse("2 PT 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2 PT 1:1'")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1", "parsing: '2PET 1:1'")
		`
		true
describe "Localized book 1Pet (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (de)", ->
		`
		expect(p.parse("Ersten Petrus 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'Ersten Petrus 1:1'")
		expect(p.parse("Erster Petrus 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'Erster Petrus 1:1'")
		expect(p.parse("Erstes Petrus 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'Erstes Petrus 1:1'")
		expect(p.parse("Erste Petrus 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'Erste Petrus 1:1'")
		expect(p.parse("1. Petrus 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. Petrus 1:1'")
		expect(p.parse("1 Petrus 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 Petrus 1:1'")
		expect(p.parse("1. Petr 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. Petr 1:1'")
		expect(p.parse("1 Petr 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 Petr 1:1'")
		expect(p.parse("1. Pet 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. Pet 1:1'")
		expect(p.parse("1 Pet 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 Pet 1:1'")
		expect(p.parse("1. Pt 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. Pt 1:1'")
		expect(p.parse("1 Pt 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 Pt 1:1'")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1Pet 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("ERSTEN PETRUS 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'ERSTEN PETRUS 1:1'")
		expect(p.parse("ERSTER PETRUS 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'ERSTER PETRUS 1:1'")
		expect(p.parse("ERSTES PETRUS 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'ERSTES PETRUS 1:1'")
		expect(p.parse("ERSTE PETRUS 1:1").osis()).toEqual("1Pet.1.1", "parsing: 'ERSTE PETRUS 1:1'")
		expect(p.parse("1. PETRUS 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. PETRUS 1:1'")
		expect(p.parse("1 PETRUS 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 PETRUS 1:1'")
		expect(p.parse("1. PETR 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. PETR 1:1'")
		expect(p.parse("1 PETR 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 PETR 1:1'")
		expect(p.parse("1. PET 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. PET 1:1'")
		expect(p.parse("1 PET 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 PET 1:1'")
		expect(p.parse("1. PT 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1. PT 1:1'")
		expect(p.parse("1 PT 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1 PT 1:1'")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1", "parsing: '1PET 1:1'")
		`
		true
describe "Localized book Jude (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (de)", ->
		`
		expect(p.parse("Judas 1:1").osis()).toEqual("Jude.1.1", "parsing: 'Judas 1:1'")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1", "parsing: 'Jude 1:1'")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jude.1.1", "parsing: 'Jud 1:1'")
		p.include_apocrypha(false)
		expect(p.parse("JUDAS 1:1").osis()).toEqual("Jude.1.1", "parsing: 'JUDAS 1:1'")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1", "parsing: 'JUDE 1:1'")
		expect(p.parse("JUD 1:1").osis()).toEqual("Jude.1.1", "parsing: 'JUD 1:1'")
		`
		true
describe "Localized book Tob (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (de)", ->
		`
		expect(p.parse("Tobias 1:1").osis()).toEqual("Tob.1.1", "parsing: 'Tobias 1:1'")
		expect(p.parse("Tobit 1:1").osis()).toEqual("Tob.1.1", "parsing: 'Tobit 1:1'")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1", "parsing: 'Tob 1:1'")
		`
		true
describe "Localized book Jdt (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (de)", ->
		`
		expect(p.parse("Judit 1:1").osis()).toEqual("Jdt.1.1", "parsing: 'Judit 1:1'")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1", "parsing: 'Jdt 1:1'")
		`
		true
describe "Localized book Bar (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (de)", ->
		`
		expect(p.parse("Baruch 1:1").osis()).toEqual("Bar.1.1", "parsing: 'Baruch 1:1'")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1", "parsing: 'Bar 1:1'")
		`
		true
describe "Localized book Sus (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (de)", ->
		`
		expect(p.parse("Susanna 1:1").osis()).toEqual("Sus.1.1", "parsing: 'Susanna 1:1'")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1", "parsing: 'Sus 1:1'")
		`
		true
describe "Localized book 2Macc (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (de)", ->
		`
		expect(p.parse("Zweiten Makkabaeer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweiten Makkabaeer 1:1'")
		expect(p.parse("Zweiter Makkabaeer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweiter Makkabaeer 1:1'")
		expect(p.parse("Zweites Makkabaeer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweites Makkabaeer 1:1'")
		expect(p.parse("Zweite Makkabaeer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweite Makkabaeer 1:1'")
		expect(p.parse("Zweiten Makkabaer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweiten Makkabaer 1:1'")
		expect(p.parse("Zweiten Makkabäer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweiten Makkabäer 1:1'")
		expect(p.parse("Zweiter Makkabaer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweiter Makkabaer 1:1'")
		expect(p.parse("Zweiter Makkabäer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweiter Makkabäer 1:1'")
		expect(p.parse("Zweites Makkabaer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweites Makkabaer 1:1'")
		expect(p.parse("Zweites Makkabäer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweites Makkabäer 1:1'")
		expect(p.parse("Zweite Makkabaer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweite Makkabaer 1:1'")
		expect(p.parse("Zweite Makkabäer 1:1").osis()).toEqual("2Macc.1.1", "parsing: 'Zweite Makkabäer 1:1'")
		expect(p.parse("2. Makkabaeer 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2. Makkabaeer 1:1'")
		expect(p.parse("2 Makkabaeer 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2 Makkabaeer 1:1'")
		expect(p.parse("2. Makkabaer 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2. Makkabaer 1:1'")
		expect(p.parse("2. Makkabäer 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2. Makkabäer 1:1'")
		expect(p.parse("2 Makkabaer 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2 Makkabaer 1:1'")
		expect(p.parse("2 Makkabäer 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2 Makkabäer 1:1'")
		expect(p.parse("2. Makk 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2. Makk 1:1'")
		expect(p.parse("2 Makk 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2 Makk 1:1'")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1", "parsing: '2Macc 1:1'")
		`
		true
describe "Localized book 3Macc (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (de)", ->
		`
		expect(p.parse("Dritten Makkabaeer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritten Makkabaeer 1:1'")
		expect(p.parse("Dritter Makkabaeer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritter Makkabaeer 1:1'")
		expect(p.parse("Drittes Makkabaeer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Drittes Makkabaeer 1:1'")
		expect(p.parse("Dritte Makkabaeer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritte Makkabaeer 1:1'")
		expect(p.parse("Dritten Makkabaer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritten Makkabaer 1:1'")
		expect(p.parse("Dritten Makkabäer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritten Makkabäer 1:1'")
		expect(p.parse("Dritter Makkabaer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritter Makkabaer 1:1'")
		expect(p.parse("Dritter Makkabäer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritter Makkabäer 1:1'")
		expect(p.parse("Drittes Makkabaer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Drittes Makkabaer 1:1'")
		expect(p.parse("Drittes Makkabäer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Drittes Makkabäer 1:1'")
		expect(p.parse("Dritte Makkabaer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritte Makkabaer 1:1'")
		expect(p.parse("Dritte Makkabäer 1:1").osis()).toEqual("3Macc.1.1", "parsing: 'Dritte Makkabäer 1:1'")
		expect(p.parse("3. Makkabaeer 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3. Makkabaeer 1:1'")
		expect(p.parse("3 Makkabaeer 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3 Makkabaeer 1:1'")
		expect(p.parse("3. Makkabaer 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3. Makkabaer 1:1'")
		expect(p.parse("3. Makkabäer 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3. Makkabäer 1:1'")
		expect(p.parse("3 Makkabaer 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3 Makkabaer 1:1'")
		expect(p.parse("3 Makkabäer 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3 Makkabäer 1:1'")
		expect(p.parse("3. Makk 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3. Makk 1:1'")
		expect(p.parse("3 Makk 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3 Makk 1:1'")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1", "parsing: '3Macc 1:1'")
		`
		true
describe "Localized book 4Macc (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (de)", ->
		`
		expect(p.parse("Vierten Makkabaeer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Vierten Makkabaeer 1:1'")
		expect(p.parse("Viertes Makkabaeer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Viertes Makkabaeer 1:1'")
		expect(p.parse("Vierte Makkabaeer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Vierte Makkabaeer 1:1'")
		expect(p.parse("Vierten Makkabaer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Vierten Makkabaer 1:1'")
		expect(p.parse("Vierten Makkabäer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Vierten Makkabäer 1:1'")
		expect(p.parse("Viertes Makkabaer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Viertes Makkabaer 1:1'")
		expect(p.parse("Viertes Makkabäer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Viertes Makkabäer 1:1'")
		expect(p.parse("Vierte Makkabaer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Vierte Makkabaer 1:1'")
		expect(p.parse("Vierte Makkabäer 1:1").osis()).toEqual("4Macc.1.1", "parsing: 'Vierte Makkabäer 1:1'")
		expect(p.parse("4. Makkabaeer 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4. Makkabaeer 1:1'")
		expect(p.parse("4 Makkabaeer 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4 Makkabaeer 1:1'")
		expect(p.parse("4. Makkabaer 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4. Makkabaer 1:1'")
		expect(p.parse("4. Makkabäer 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4. Makkabäer 1:1'")
		expect(p.parse("4 Makkabaer 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4 Makkabaer 1:1'")
		expect(p.parse("4 Makkabäer 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4 Makkabäer 1:1'")
		expect(p.parse("4. Makk 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4. Makk 1:1'")
		expect(p.parse("4 Makk 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4 Makk 1:1'")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1", "parsing: '4Macc 1:1'")
		`
		true
describe "Localized book 1Macc (de)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (de)", ->
		`
		expect(p.parse("Ersten Makkabaeer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Ersten Makkabaeer 1:1'")
		expect(p.parse("Erster Makkabaeer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erster Makkabaeer 1:1'")
		expect(p.parse("Erstes Makkabaeer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erstes Makkabaeer 1:1'")
		expect(p.parse("Erste Makkabaeer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erste Makkabaeer 1:1'")
		expect(p.parse("Ersten Makkabaer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Ersten Makkabaer 1:1'")
		expect(p.parse("Ersten Makkabäer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Ersten Makkabäer 1:1'")
		expect(p.parse("Erster Makkabaer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erster Makkabaer 1:1'")
		expect(p.parse("Erster Makkabäer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erster Makkabäer 1:1'")
		expect(p.parse("Erstes Makkabaer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erstes Makkabaer 1:1'")
		expect(p.parse("Erstes Makkabäer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erstes Makkabäer 1:1'")
		expect(p.parse("Erste Makkabaer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erste Makkabaer 1:1'")
		expect(p.parse("Erste Makkabäer 1:1").osis()).toEqual("1Macc.1.1", "parsing: 'Erste Makkabäer 1:1'")
		expect(p.parse("1. Makkabaeer 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1. Makkabaeer 1:1'")
		expect(p.parse("1 Makkabaeer 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1 Makkabaeer 1:1'")
		expect(p.parse("1. Makkabaer 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1. Makkabaer 1:1'")
		expect(p.parse("1. Makkabäer 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1. Makkabäer 1:1'")
		expect(p.parse("1 Makkabaer 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1 Makkabaer 1:1'")
		expect(p.parse("1 Makkabäer 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1 Makkabäer 1:1'")
		expect(p.parse("1. Makk 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1. Makk 1:1'")
		expect(p.parse("1 Makk 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1 Makk 1:1'")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1", "parsing: '1Macc 1:1'")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should return the expected language", ->
		expect(p.languages).toEqual ["de"]

	it "should handle ranges (de)", ->
		expect(p.parse("Titus 1:1 bis 2").osis()).toEqual("Titus.1.1-Titus.1.2", "parsing: 'Titus 1:1 bis 2'")
		expect(p.parse("Matt 1bis2").osis()).toEqual("Matt.1-Matt.2", "parsing: 'Matt 1bis2'")
		expect(p.parse("Phlm 2 BIS 3").osis()).toEqual("Phlm.1.2-Phlm.1.3", "parsing: 'Phlm 2 BIS 3'")
	it "should handle chapters (de)", ->
		expect(p.parse("Titus 1:1, Kapiteln 2").osis()).toEqual("Titus.1.1,Titus.2", "parsing: 'Titus 1:1, Kapiteln 2'")
		expect(p.parse("Matt 3:4 KAPITELN 6").osis()).toEqual("Matt.3.4,Matt.6", "parsing: 'Matt 3:4 KAPITELN 6'")
		expect(p.parse("Titus 1:1, Kapiteln 2").osis()).toEqual("Titus.1.1,Titus.2", "parsing: 'Titus 1:1, Kapiteln 2'")
		expect(p.parse("Matt 3:4 KAPITELN 6").osis()).toEqual("Matt.3.4,Matt.6", "parsing: 'Matt 3:4 KAPITELN 6'")
		expect(p.parse("Titus 1:1, Kapitel 2").osis()).toEqual("Titus.1.1,Titus.2", "parsing: 'Titus 1:1, Kapitel 2'")
		expect(p.parse("Matt 3:4 KAPITEL 6").osis()).toEqual("Matt.3.4,Matt.6", "parsing: 'Matt 3:4 KAPITEL 6'")
		expect(p.parse("Titus 1:1, Kap. 2").osis()).toEqual("Titus.1.1,Titus.2", "parsing: 'Titus 1:1, Kap. 2'")
		expect(p.parse("Matt 3:4 KAP. 6").osis()).toEqual("Matt.3.4,Matt.6", "parsing: 'Matt 3:4 KAP. 6'")
		expect(p.parse("Titus 1:1, Kap 2").osis()).toEqual("Titus.1.1,Titus.2", "parsing: 'Titus 1:1, Kap 2'")
		expect(p.parse("Matt 3:4 KAP 6").osis()).toEqual("Matt.3.4,Matt.6", "parsing: 'Matt 3:4 KAP 6'")
	it "should handle verses (de)", ->
		expect(p.parse("Exod 1:1 Versen 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Versen 3'")
		expect(p.parse("Phlm VERSEN 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VERSEN 6'")
		expect(p.parse("Exod 1:1 Verses 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Verses 3'")
		expect(p.parse("Phlm VERSES 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VERSES 6'")
		expect(p.parse("Exod 1:1 Verse 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Verse 3'")
		expect(p.parse("Phlm VERSE 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VERSE 6'")
		expect(p.parse("Exod 1:1 Vers. 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Vers. 3'")
		expect(p.parse("Phlm VERS. 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VERS. 6'")
		expect(p.parse("Exod 1:1 Vers 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Vers 3'")
		expect(p.parse("Phlm VERS 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VERS 6'")
		expect(p.parse("Exod 1:1 Vers 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Vers 3'")
		expect(p.parse("Phlm VERS 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VERS 6'")
		expect(p.parse("Exod 1:1 Vs. 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Vs. 3'")
		expect(p.parse("Phlm VS. 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VS. 6'")
		expect(p.parse("Exod 1:1 Vs 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 Vs 3'")
		expect(p.parse("Phlm VS 6").osis()).toEqual("Phlm.1.6", "parsing: 'Phlm VS 6'")
	it "should handle 'and' (de)", ->
		expect(p.parse("Exod 1:1 und siehe auch 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 und siehe auch 3'")
		expect(p.parse("Phlm 2 UND SIEHE AUCH 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 UND SIEHE AUCH 6'")
		expect(p.parse("Exod 1:1 und siehe 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 und siehe 3'")
		expect(p.parse("Phlm 2 UND SIEHE 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 UND SIEHE 6'")
		expect(p.parse("Exod 1:1 und auch 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 und auch 3'")
		expect(p.parse("Phlm 2 UND AUCH 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 UND AUCH 6'")
		expect(p.parse("Exod 1:1 sowie auch 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 sowie auch 3'")
		expect(p.parse("Phlm 2 SOWIE AUCH 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 SOWIE AUCH 6'")
		expect(p.parse("Exod 1:1 siehe auch 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 siehe auch 3'")
		expect(p.parse("Phlm 2 SIEHE AUCH 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 SIEHE AUCH 6'")
		expect(p.parse("Exod 1:1 siehe 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 siehe 3'")
		expect(p.parse("Phlm 2 SIEHE 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 SIEHE 6'")
		expect(p.parse("Exod 1:1 sowie 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 sowie 3'")
		expect(p.parse("Phlm 2 SOWIE 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 SOWIE 6'")
		expect(p.parse("Exod 1:1 und 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 und 3'")
		expect(p.parse("Phlm 2 UND 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 UND 6'")
		expect(p.parse("Exod 1:1 u. 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 u. 3'")
		expect(p.parse("Phlm 2 U. 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 U. 6'")
		expect(p.parse("Exod 1:1 u 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 u 3'")
		expect(p.parse("Phlm 2 U 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 U 6'")
		expect(p.parse("Exod 1:1 & 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 & 3'")
		expect(p.parse("Phlm 2 & 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 & 6'")
		expect(p.parse("Exod 1:1 vgl. 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 vgl. 3'")
		expect(p.parse("Phlm 2 VGL. 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 VGL. 6'")
		expect(p.parse("Exod 1:1 vgl 3").osis()).toEqual("Exod.1.1,Exod.1.3", "parsing: 'Exod 1:1 vgl 3'")
		expect(p.parse("Phlm 2 VGL 6").osis()).toEqual("Phlm.1.2,Phlm.1.6", "parsing: 'Phlm 2 VGL 6'")
	it "should handle titles (de)", ->
		expect(p.parse("Ps 3 Titel, 4:2, 5:Titel").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1", "parsing: 'Ps 3 Titel, 4:2, 5:Titel'")
		expect(p.parse("PS 3 TITEL, 4:2, 5:TITEL").osis()).toEqual("Ps.3.1,Ps.4.2,Ps.5.1", "parsing: 'PS 3 TITEL, 4:2, 5:TITEL'")
	it "should handle 'ff' (de)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11", "parsing: 'Rev 3ff, 4:2ff'")
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual("Rev.3-Rev.22,Rev.4.2-Rev.4.11", "parsing: 'REV 3 FF, 4:2 FF'")
	it "should handle 'next' (de)", ->
		expect(p.parse("Rev 3:1f, 4:2f").osis()).toEqual("Rev.3.1-Rev.3.2,Rev.4.2-Rev.4.3", "parsing: 'Rev 3:1f, 4:2f'")
		expect(p.parse("REV 3 F, 4:2 F").osis()).toEqual("Rev.3-Rev.4,Rev.4.2-Rev.4.3", "parsing: 'REV 3 F, 4:2 F'")
		expect(p.parse("Jude 1f, 2f").osis()).toEqual("Jude.1.1-Jude.1.2,Jude.1.2-Jude.1.3", "parsing: 'Jude 1f, 2f'")
		expect(p.parse("Gen 1:31f").osis()).toEqual("Gen.1.31-Gen.2.1", "parsing: 'Gen 1:31f'")
		expect(p.parse("Gen 1:2-31f").osis()).toEqual("Gen.1.2-Gen.2.1", "parsing: 'Gen 1:2-31f'")
		expect(p.parse("Gen 1:2f-30").osis()).toEqual("Gen.1.2-Gen.1.3,Gen.1.30", "parsing: 'Gen 1:2f-30'")
		expect(p.parse("Gen 50f, Gen 50:26f").osis()).toEqual("Gen.50,Gen.50.26", "parsing: 'Gen 50f, Gen 50:26f'")
		expect(p.parse("Gen 1:32f, Gen 51f").osis()).toEqual("", "parsing: 'Gen 1:32f, Gen 51f'")
	it "should handle translations (de)", ->
		expect(p.parse("Lev 1 (ELB)").osis_and_translations()).toEqual [["Lev.1", "ELB"]]
		expect(p.parse("lev 1 elb").osis_and_translations()).toEqual [["Lev.1", "ELB"]]
		expect(p.parse("Lev 1 (HFA)").osis_and_translations()).toEqual [["Lev.1", "HFA"]]
		expect(p.parse("lev 1 hfa").osis_and_translations()).toEqual [["Lev.1", "HFA"]]
		expect(p.parse("Lev 1 (LUTH1545)").osis_and_translations()).toEqual [["Lev.1", "LUTH1545"]]
		expect(p.parse("lev 1 luth1545").osis_and_translations()).toEqual [["Lev.1", "LUTH1545"]]
		expect(p.parse("Lev 1 (LUTHER)").osis_and_translations()).toEqual [["Lev.1", "LUTHER"]]
		expect(p.parse("lev 1 luther").osis_and_translations()).toEqual [["Lev.1", "LUTHER"]]
		expect(p.parse("Lev 1 (SCH1950)").osis_and_translations()).toEqual [["Lev.1", "SCH1950"]]
		expect(p.parse("lev 1 sch1950").osis_and_translations()).toEqual [["Lev.1", "SCH1950"]]
		expect(p.parse("Lev 1 (SCH2000)").osis_and_translations()).toEqual [["Lev.1", "SCH2000"]]
		expect(p.parse("lev 1 sch2000").osis_and_translations()).toEqual [["Lev.1", "SCH2000"]]
	it "should handle book ranges (de)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Ersten bis Dritten  Johannes").osis()).toEqual("1John.1-3John.1", "parsing: 'Ersten bis Dritten  Johannes'")
	it "should handle boundaries (de)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual("Matt.1-Matt.28", "parsing: '\u2014Matt\u2014'")
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual("Matt.1.1", "parsing: '\u201cMatt 1:1\u201d'")

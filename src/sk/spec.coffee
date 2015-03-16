bcv_parser = require("../../js/sk_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (sk)", ->
		`
		expect(p.parse("Prva kniha Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva kniha Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva kniha Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva kniha Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá kniha Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá kniha Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá kniha Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá kniha Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy list Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy list Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy list Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy list Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý list Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý list Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý list Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý list Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Kniha stvorenia 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k. Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k. Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k. Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k. Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prva Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvy Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvá Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Prvý Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 k Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K. stvorenia 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Kniha povodu 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Kniha pôvodu 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mojzisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mojzišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mojžisova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I Mojžišova 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K stvorenia 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K. povodu 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K. pôvodu 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K povodu 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K pôvodu 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Genezis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 M 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gn 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA KNIHA MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ KNIHA MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ KNIHA MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY LIST MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY LIST MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY LIST MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY LIST MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ LIST MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ LIST MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ LIST MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ LIST MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("KNIHA STVORENIA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K. MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K. MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K. MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K. MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVA MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVY MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÁ MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("PRVÝ MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 K MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1. MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I. MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K. STVORENIA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("KNIHA POVODU 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("KNIHA PÔVODU 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOJZISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOJZIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOJŽISOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("I MOJŽIŠOVA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K STVORENIA 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K. POVODU 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K. PÔVODU 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K POVODU 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("K PÔVODU 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GENEZIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("1 M 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (sk)", ->
		`
		expect(p.parse("Druha kniha Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha kniha Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha kniha Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha kniha Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá kniha Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá kniha Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá kniha Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá kniha Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy list Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy list Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy list Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy list Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý list Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý list Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý list Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý list Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druha Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhy Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhá Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Druhý Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k. Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k. Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k. Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k. Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 k Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mojzisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mojzišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mojžisova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 Mojžišova 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exodus 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 M 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Ex 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA KNIHA MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ KNIHA MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ KNIHA MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY LIST MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY LIST MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY LIST MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY LIST MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ LIST MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ LIST MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ LIST MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ LIST MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHA MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHY MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÁ MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("DRUHÝ MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K. MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K. MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K. MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K. MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 K MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II. MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2. MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("II MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOJZISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOJZIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOJŽISOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 MOJŽIŠOVA 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXODUS 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("2 M 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EX 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (sk)", ->
		`
		expect(p.parse("Bel a drak 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bél a drak 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bél 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (sk)", ->
		`
		expect(p.parse("Tretia kniha Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia kniha Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia kniha Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia kniha Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretia Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Treti Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Treti Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Treti Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Treti Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretí Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretí Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretí Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Tretí Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k. Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k. Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k. Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k. Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 k Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mojzisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mojzišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mojžisova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 Mojžišova 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Levitikus 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 M 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lv 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TRETIA KNIHA MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA KNIHA MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETIA MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETI MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETI MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETI MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETI MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETÍ MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETÍ MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETÍ MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("TRETÍ MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K. MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K. MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K. MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K. MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III. MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 K MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("III MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3. MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOJZISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOJZIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOJŽISOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 MOJŽIŠOVA 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVITIKUS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("3 M 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (sk)", ->
		`
		expect(p.parse("Stvrta kniha Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta kniha Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta kniha Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta kniha Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá kniha Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá kniha Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá kniha Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá kniha Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta kniha Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta kniha Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta kniha Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta kniha Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá kniha Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá kniha Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá kniha Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá kniha Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrta Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Stvrtá Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrta Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Štvrtá Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k. Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k. Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k. Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k. Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 k Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mojzisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mojzišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mojžisova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 Mojžišova 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Numeri 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 M 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Nm 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("STVRTA KNIHA MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA KNIHA MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ KNIHA MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ KNIHA MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA KNIHA MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA KNIHA MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTA MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("STVRTÁ MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTA MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("ŠTVRTÁ MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K. MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K. MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K. MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K. MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 K MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV. MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4. MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("IV MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOJZISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOJZIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOJŽISOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 MOJŽIŠOVA 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUMERI 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("4 M 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NM 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (sk)", ->
		`
		expect(p.parse("Kniha Sirachovho syna 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Kniha Ekleziastikus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K. Sirachovho syna 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Kniha Sirachovcova 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K Sirachovho syna 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K. Ekleziastikus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Kniha Sirachovca 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K Ekleziastikus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K. Sirachovcova 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K Sirachovcova 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K. Sirachovca 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("K Sirachovca 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirachovcova 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirachovec 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (sk)", ->
		`
		expect(p.parse("Mudrosti 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Múdrosti 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Mudrost 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Mudrosť 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Múdrost 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Múdrosť 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Mud 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Múd 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (sk)", ->
		`
		expect(p.parse("Jeremiasov Plac 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiasov Plač 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiašov Plac 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiašov Plač 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiásov Plac 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiásov Plač 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiášov Plac 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Jeremiášov Plač 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plac Jeremiasov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plac Jeremiašov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plac Jeremiásov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plac Jeremiášov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plač Jeremiasov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plač Jeremiašov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plač Jeremiásov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plač Jeremiášov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Kniha narekov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Kniha nárekov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K. narekov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K. nárekov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K narekov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K nárekov 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Zalospevy 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Žalospevy 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Nareky 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Náreky 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Zalosp 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Žalosp 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plac 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Plač 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Nar 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Nár 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIASOV PLAC 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIASOV PLAČ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIAŠOV PLAC 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIAŠOV PLAČ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIÁSOV PLAC 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIÁSOV PLAČ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIÁŠOV PLAC 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("JEREMIÁŠOV PLAČ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAC JEREMIASOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAC JEREMIAŠOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAC JEREMIÁSOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAC JEREMIÁŠOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAČ JEREMIASOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAČ JEREMIAŠOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAČ JEREMIÁSOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAČ JEREMIÁŠOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("KNIHA NAREKOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("KNIHA NÁREKOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K. NAREKOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K. NÁREKOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K NAREKOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("K NÁREKOV 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ZALOSPEVY 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ŽALOSPEVY 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("NAREKY 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("NÁREKY 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ZALOSP 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("ŽALOSP 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAC 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("PLAČ 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("NAR 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("NÁR 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (sk)", ->
		`
		expect(p.parse("Jeremiasov list 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Jeremiašov list 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Jeremiásov list 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Jeremiášov list 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (sk)", ->
		`
		expect(p.parse("Zjavenie Apostola Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie Apostola Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie Apoštola Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie Apoštola Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie svateho Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie svateho Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie svatého Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie svatého Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie sväteho Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie sväteho Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie svätého Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie svätého Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie Jana 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie Jána 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apokalypsa 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjavenie 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjav 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zjv 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Zj 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZJAVENIE APOSTOLA JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE APOSTOLA JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE APOŠTOLA JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE APOŠTOLA JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVATEHO JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVATEHO JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVATÉHO JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVATÉHO JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVÄTEHO JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVÄTEHO JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVÄTÉHO JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE SVÄTÉHO JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE JANA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE JÁNA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOKALYPSA 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAVENIE 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJAV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("ZJ 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (sk)", ->
		`
		expect(p.parse("Manasesova modlitba 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (sk)", ->
		`
		expect(p.parse("Piata kniha Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata kniha Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata kniha Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata kniha Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Piata Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k. Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k. Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k. Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k. Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 k Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronomium 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronómium 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mojzisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mojzišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mojžisova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V Mojžišova 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 M 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dt 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PIATA KNIHA MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA KNIHA MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA KNIHA MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA KNIHA MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("PIATA MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K. MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K. MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K. MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K. MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 K MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONOMIUM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONÓMIUM 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5. MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V. MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOJZISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOJZIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOJŽISOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("V MOJŽIŠOVA 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("5 M 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (sk)", ->
		`
		expect(p.parse("Josuova 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jozuova 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jošuova 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Józuova 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Iosua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jozua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jozue 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jošua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Józua 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Joz 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOSUOVA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZUOVA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOŠUOVA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓZUOVA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("IOSUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZUE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOŠUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JÓZUA 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOZ 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (sk)", ->
		`
		expect(p.parse("K. sudcov 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("K sudcov 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Sudcovia 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Sudcov 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Sdc 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Sud 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("K. SUDCOV 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("K SUDCOV 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("SUDCOVIA 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("SUDCOV 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("SDC 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("SUD 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (sk)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rút 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RÚT 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (sk)", ->
		`
		expect(p.parse("Prva kniha Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva kniha Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá kniha Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy list Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý list Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k. Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdrasova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdrašova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdrásova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdrášova 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prva Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvy Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvá Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Prvý Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 k Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdraš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdrás 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Ezdráš 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (sk)", ->
		`
		expect(p.parse("Druha kniha Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha kniha Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá kniha Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy list Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý list Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druha Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhy Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhá Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Druhý Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdrasova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdrašova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdrásova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdrášova 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k. Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 k Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdraš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdrás 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Ezdráš 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (sk)", ->
		`
		expect(p.parse("Izaias 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izaiaš 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izaiás 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izaiáš 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izajas 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izajaš 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izajás 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Izajáš 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Iz 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("IZAIAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAIAŠ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAIÁS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAIÁŠ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAJAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAJAŠ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAJÁS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZAJÁŠ 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IZ 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (sk)", ->
		`
		expect(p.parse("Druha kniha Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druhá kniha Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druhy list Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druhý list Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druha Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druhy Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druhá Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Druhý Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 k. Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 k Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuelova 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHÁ KNIHA SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHY LIST SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHÝ LIST SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHA SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHY SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHÁ SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("DRUHÝ SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 K. SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 K SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUELOVA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (sk)", ->
		`
		expect(p.parse("Prva kniha Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prvá kniha Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prvy list Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prvý list Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 k. Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prva Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prvy Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prvá Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Prvý Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 k Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuelova 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVÁ KNIHA SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVY LIST SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVÝ LIST SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 K. SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVA SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVY SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVÁ SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRVÝ SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 K SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUELOVA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (sk)", ->
		`
		expect(p.parse("Stvrta kniha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta kniha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta kniha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta kniha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá kniha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá kniha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá kniha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá kniha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta kniha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta kniha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta kniha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta kniha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá kniha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá kniha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá kniha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá kniha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha kniha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha kniha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha kniha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha kniha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá kniha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá kniha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá kniha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá kniha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy list Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy list Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy list Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy list Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý list Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý list Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý list Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý list Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrta Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Stvrtá Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrta Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Štvrtá Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druha Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhy Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhá Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Druhý Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k. Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k. Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k. Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k. Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k. Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k. Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k. Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k. Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 k Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 k Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Kralov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Kraľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Králov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Kráľov 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Krl 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Krľ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Kr 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("STVRTA KNIHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KNIHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KNIHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KNIHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KNIHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KNIHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KNIHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KNIHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KNIHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KNIHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KNIHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KNIHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KNIHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KNIHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KNIHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KNIHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KNIHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KNIHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KNIHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KNIHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KNIHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY LIST KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY LIST KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY LIST KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY LIST KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ LIST KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ LIST KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ LIST KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ LIST KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("STVRTÁ KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("ŠTVRTÁ KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHA KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHY KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÁ KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("DRUHÝ KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K. KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K. KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K. KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K. KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K. KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K. KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K. KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K. KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 K KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 K KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 KRALOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 KRAĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 KRÁLOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 KRÁĽOV 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRL 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KRĽ 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 KR 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (sk)", ->
		`
		expect(p.parse("Tretia kniha Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia kniha Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia kniha Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia kniha Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva kniha Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva kniha Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva kniha Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva kniha Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá kniha Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá kniha Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá kniha Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá kniha Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy list Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy list Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy list Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy list Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý list Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý list Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý list Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý list Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretia Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Treti Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Treti Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Treti Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Treti Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretí Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretí Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretí Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Tretí Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k. Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k. Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k. Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k. Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k. Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k. Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k. Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k. Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prva Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvy Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvá Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Prvý Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 k Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 k Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kralov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kraľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Králov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Kráľov 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Krl 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Krľ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Kr 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TRETIA KNIHA KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KNIHA KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KNIHA KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KNIHA KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KNIHA KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KNIHA KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KNIHA KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KNIHA KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KNIHA KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KNIHA KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KNIHA KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KNIHA KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY LIST KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY LIST KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY LIST KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY LIST KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ LIST KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ LIST KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ LIST KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ LIST KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETIA KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETI KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETI KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETI KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETI KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETÍ KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETÍ KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETÍ KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TRETÍ KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K. KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K. KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K. KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K. KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K. KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K. KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K. KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K. KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVA KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVY KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÁ KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRVÝ KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 K KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 K KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KRALOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KRAĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KRÁLOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I KRÁĽOV 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRL 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KRĽ 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 KR 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (sk)", ->
		`
		expect(p.parse("Druha kniha Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá kniha Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy list Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý list Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha kniha Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha kniha Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá kniha Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá kniha Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy list Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy list Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý list Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý list Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k. Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha kniha Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha kniha Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá kniha Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá kniha Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy list Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy list Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý list Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý list Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Paralipomenon 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k. Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k. Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druha Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhy Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhá Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Druhý Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k. Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k. Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kronicka 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kronická 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 k Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kronik 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kroník 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Kron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Krn 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KNIHA PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY LIST PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ LIST PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KNIHA KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KNIHA KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KNIHA KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KNIHA KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY LIST KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY LIST KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ LIST KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ LIST KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K. PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KNIHA KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KNIHA KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KNIHA KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KNIHA KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY LIST KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY LIST KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ LIST KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ LIST KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 PARALIPOMENON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K. KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K. KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHA KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHY KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÁ KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("DRUHÝ KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K. KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K. KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONICKA 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONICKÁ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 K KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONIK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRONÍK 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 KRN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (sk)", ->
		`
		expect(p.parse("Prva kniha Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá kniha Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy list Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý list Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva kniha Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva kniha Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá kniha Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá kniha Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k. Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy list Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy list Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý list Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý list Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva kniha Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva kniha Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá kniha Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá kniha Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy list Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy list Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý list Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý list Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Paralipomenon 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k. Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k. Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k. Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k. Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prva Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvy Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvá Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Prvý Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 k Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kronicka 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kronická 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kronik 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Kroník 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Kron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Krn 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KNIHA PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY LIST PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ LIST PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KNIHA KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KNIHA KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KNIHA KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KNIHA KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K. PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY LIST KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY LIST KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ LIST KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ LIST KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KNIHA KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KNIHA KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KNIHA KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KNIHA KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY LIST KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY LIST KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ LIST KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ LIST KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I PARALIPOMENON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K. KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K. KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K. KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K. KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVA KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVY KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÁ KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRVÝ KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 K KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRONICKA 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRONICKÁ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRONIK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I KRONÍK 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 KRN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (sk)", ->
		`
		expect(p.parse("Ezdras 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezdraš 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezdrás 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezdráš 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezd 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZDRAS 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZDRAŠ 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZDRÁS 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZDRÁŠ 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZD 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (sk)", ->
		`
		expect(p.parse("Nehemias 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemiaš 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemiás 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemiáš 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIAS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIAŠ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIÁS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMIÁŠ 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (sk)", ->
		`
		expect(p.parse("Grecke casti knihy Ester 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Grecke časti knihy Ester 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Grécke casti knihy Ester 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Grécke časti knihy Ester 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester gr. 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester gr 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (sk)", ->
		`
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (sk)", ->
		`
		expect(p.parse("Kniha Jobova 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Kniha Jóbova 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K. Jobova 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K. Jóbova 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K Jobova 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K Jóbova 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Jób 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNIHA JOBOVA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("KNIHA JÓBOVA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K. JOBOVA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K. JÓBOVA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K JOBOVA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("K JÓBOVA 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JÓB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (sk)", ->
		`
		expect(p.parse("Kniha zalmov 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Kniha žalmov 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K. zalmov 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K. žalmov 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K zalmov 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K žalmov 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Zaltar 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Zaltár 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Žaltar 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Žaltár 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Zalmy 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Žalmy 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Zalm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Žalm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Z 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ž 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNIHA ZALMOV 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("KNIHA ŽALMOV 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K. ZALMOV 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K. ŽALMOV 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K ZALMOV 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("K ŽALMOV 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ZALTAR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ZALTÁR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ŽALTAR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ŽALTÁR 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ZALMY 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ŽALMY 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ZALM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("ŽALM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Z 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ž 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (sk)", ->
		`
		expect(p.parse("Azarjasova modlitba 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Azarjašova modlitba 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Azarjásova modlitba 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Azarjášova modlitba 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (sk)", ->
		`
		expect(p.parse("Kniha prislovi 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Kniha prisloví 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Kniha príslovi 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Kniha prísloví 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. prislovi 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. prisloví 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. príslovi 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. prísloví 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K prislovi 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K prisloví 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K príslovi 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K prísloví 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prislovia 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Príslovia 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pris 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prís 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pr 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KNIHA PRISLOVI 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("KNIHA PRISLOVÍ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("KNIHA PRÍSLOVI 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("KNIHA PRÍSLOVÍ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. PRISLOVI 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. PRISLOVÍ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. PRÍSLOVI 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K. PRÍSLOVÍ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K PRISLOVI 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K PRISLOVÍ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K PRÍSLOVI 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("K PRÍSLOVÍ 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRISLOVIA 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRÍSLOVIA 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRIS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRÍS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PR 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (sk)", ->
		`
		expect(p.parse("Kohelet — Kazatel 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kohelet — Kazateľ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kniha kazatelova 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kniha kazateľova 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K. kazatelova 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K. kazateľova 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K kazatelova 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K kazateľova 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ekleziastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kazatel 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kazateľ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kohelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Kaz 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Koh 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("KOHELET — KAZATEL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KOHELET — KAZATEĽ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KNIHA KAZATELOVA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KNIHA KAZATEĽOVA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K. KAZATELOVA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K. KAZATEĽOVA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K KAZATELOVA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("K KAZATEĽOVA 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("EKLEZIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KAZATEL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KAZATEĽ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KOHELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KAZ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("KOH 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (sk)", ->
		`
		expect(p.parse("Traja mladenci v rozpalenej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Traja mladenci v rozpálenej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Traja mládenci v rozpalenej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Traja mládenci v rozpálenej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Piesen mladencov v ohnivej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Piesen mládencov v ohnivej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Pieseň mladencov v ohnivej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Pieseň mládencov v ohnivej peci 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (sk)", ->
		`
		expect(p.parse("Velpiesen Salamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpiesen Salamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpiesen Šalamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpiesen Šalamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpieseň Salamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpieseň Salamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpieseň Šalamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpieseň Šalamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpiesen Salamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpiesen Salamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpiesen Šalamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpiesen Šalamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpieseň Salamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpieseň Salamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpieseň Šalamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpieseň Šalamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen Salamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen Salamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen Šalamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen Šalamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň Salamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň Salamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň Šalamunova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň Šalamúnova 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen piesni 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen piesní 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň piesni 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň piesní 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpiesen 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velpieseň 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpiesen 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľpieseň 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Piesen 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pieseň 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Pies 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Velp 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Veľp 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Vlp 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Vľp 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PŠ 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("VELPIESEN SALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEN SALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEN ŠALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEN ŠALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEŇ SALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEŇ SALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEŇ ŠALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEŇ ŠALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEN SALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEN SALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEN ŠALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEN ŠALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEŇ SALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEŇ SALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEŇ ŠALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEŇ ŠALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN SALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN SALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN ŠALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN ŠALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ SALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ SALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ ŠALAMUNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ ŠALAMÚNOVA 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN PIESNI 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN PIESNÍ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ PIESNI 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ PIESNÍ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELPIESEŇ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽPIESEŇ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIESEŇ 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PIES 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VELP 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VEĽP 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VLP 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("VĽP 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("PŠ 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (sk)", ->
		`
		expect(p.parse("Jeremias 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremiaš 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremiás 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremiáš 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMIAŠ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMIÁS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMIÁŠ 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (sk)", ->
		`
		expect(p.parse("Ezechiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ez 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZECHIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (sk)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (sk)", ->
		`
		expect(p.parse("Hozeas 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hozeaš 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hozeás 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hozeáš 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ozeas 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ozeaš 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ozeás 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Ozeáš 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Oz 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HOZEAS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOZEAŠ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOZEÁS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOZEÁŠ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OZEAS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OZEAŠ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OZEÁS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OZEÁŠ 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OZ 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (sk)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (sk)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Ámos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Ám 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ÁMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("ÁM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (sk)", ->
		`
		expect(p.parse("Obadias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadiaš 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadiás 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obadiáš 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obedias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obediaš 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obediás 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obediáš 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdiaš 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdiás 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdiáš 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abd 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADIAŠ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADIÁS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBADIÁŠ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBEDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBEDIAŠ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBEDIÁS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBEDIÁŠ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIAŠ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIÁS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIÁŠ 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABD 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (sk)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonaš 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonás 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonáš 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jon 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAŠ 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONÁS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONÁŠ 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JON 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (sk)", ->
		`
		expect(p.parse("Micheas 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Micheaš 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Micheás 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Micheáš 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mich 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MICHEAS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICHEAŠ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICHEÁS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICHEÁŠ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MICH 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (sk)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Náhum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NÁHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (sk)", ->
		`
		expect(p.parse("Habakuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Abakuk 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Ab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABAKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("ABAKUK 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("AB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (sk)", ->
		`
		expect(p.parse("Sofonias 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofoniaš 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofoniás 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofoniáš 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sof 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SOFONIAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONIAŠ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONIÁS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONIÁŠ 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (sk)", ->
		`
		expect(p.parse("Haggeus 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Aggeus 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ageus 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGGEUS 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AGGEUS 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AGEUS 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (sk)", ->
		`
		expect(p.parse("Zacharias 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zachariaš 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zachariás 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zachariáš 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zach 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZACHARIAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACHARIAŠ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACHARIÁS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACHARIÁŠ 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (sk)", ->
		`
		expect(p.parse("Malachias 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malachiaš 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malachiás 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malachiáš 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALACHIAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALACHIAŠ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALACHIÁS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALACHIÁŠ 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (sk)", ->
		`
		expect(p.parse("Evanjelium Podla Matusa 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podla Matuša 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podla Matúsa 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podla Matúša 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podľa Matusa 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podľa Matuša 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podľa Matúsa 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evanjelium Podľa Matúša 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matusa 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matuša 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matúsa 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matúša 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matuš 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matús 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matúš 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANJELIUM PODLA MATUSA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODLA MATUŠA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODLA MATÚSA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODLA MATÚŠA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODĽA MATUSA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODĽA MATUŠA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODĽA MATÚSA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANJELIUM PODĽA MATÚŠA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATUSA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATUŠA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATÚSA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATÚŠA 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATUŠ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATÚS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATÚŠ 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Mark (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (sk)", ->
		`
		expect(p.parse("Evanjelium Podla Marka 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Evanjelium Podľa Marka 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marek 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marka 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mk 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANJELIUM PODLA MARKA 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("EVANJELIUM PODĽA MARKA 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MAREK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARKA 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MK 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (sk)", ->
		`
		expect(p.parse("Evanjelium Podla Lukasa 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podla Lukaša 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podla Lukása 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podla Lukáša 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podľa Lukasa 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podľa Lukaša 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podľa Lukása 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evanjelium Podľa Lukáša 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukasa 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukaša 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukása 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukáša 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukaš 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukás 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lukáš 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lk 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANJELIUM PODLA LUKASA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODLA LUKAŠA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODLA LUKÁSA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODLA LUKÁŠA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODĽA LUKASA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODĽA LUKAŠA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODĽA LUKÁSA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANJELIUM PODĽA LUKÁŠA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKASA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKAŠA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKÁSA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKÁŠA 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKAŠ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKÁS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKÁŠ 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LK 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (sk)", ->
		`
		expect(p.parse("Prva kniha Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prva kniha Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvá kniha Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvá kniha Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvy Janov list 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvy Jánov list 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvy list Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvy list Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvý Janov list 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvý Jánov list 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvý list Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvý list Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 k. Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 k. Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prva Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prva Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvy Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvy Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvá Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvá Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvý Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Prvý Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 k Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 k Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Janov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Jánov 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jn 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 J 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVA KNIHA JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÁ KNIHA JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÁ KNIHA JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVY JANOV LIST 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVY JÁNOV LIST 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVY LIST JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVY LIST JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÝ JANOV LIST 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÝ JÁNOV LIST 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÝ LIST JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÝ LIST JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 K. JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 K. JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVA JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVA JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVY JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVY JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÁ JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÁ JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÝ JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRVÝ JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 K JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 K JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JANOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JÁNOV 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 J 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (sk)", ->
		`
		expect(p.parse("Druha kniha Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druha kniha Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhá kniha Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhá kniha Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhy Janov list 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhy Jánov list 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhy list Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhy list Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhý Janov list 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhý Jánov list 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhý list Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhý list Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druha Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druha Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhy Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhy Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhá Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhá Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhý Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Druhý Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 k. Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 k. Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 k Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 k Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Janov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jánov 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jn 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 J 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHA KNIHA JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÁ KNIHA JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÁ KNIHA JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHY JANOV LIST 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHY JÁNOV LIST 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHY LIST JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHY LIST JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÝ JANOV LIST 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÝ JÁNOV LIST 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÝ LIST JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÝ LIST JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHA JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHA JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHY JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHY JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÁ JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÁ JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÝ JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("DRUHÝ JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 K. JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 K. JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 K JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 K JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JANOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JÁNOV 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 J 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (sk)", ->
		`
		expect(p.parse("Tretia kniha Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretia kniha Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treti Janov list 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treti Jánov list 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretí Janov list 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretí Jánov list 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretia Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretia Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treti Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Treti Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretí Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tretí Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 k. Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 k. Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 k Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 k Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Janov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jánov 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jn 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 J 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TRETIA KNIHA JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETIA KNIHA JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETI JANOV LIST 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETI JÁNOV LIST 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETÍ JANOV LIST 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETÍ JÁNOV LIST 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETIA JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETIA JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETI JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETI JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETÍ JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TRETÍ JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 K. JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 K. JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 K JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 K JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JANOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JÁNOV 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 J 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (sk)", ->
		`
		expect(p.parse("Evanjelium Podla Jana 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Evanjelium Podla Jána 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Evanjelium Podľa Jana 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Evanjelium Podľa Jána 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jana 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jána 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Ján 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jn 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EVANJELIUM PODLA JANA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EVANJELIUM PODLA JÁNA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EVANJELIUM PODĽA JANA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EVANJELIUM PODĽA JÁNA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JANA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JÁNA 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JÁN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (sk)", ->
		`
		expect(p.parse("Skutky apostolov 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Skutky apoštolov 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Skutky 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Sk 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SKUTKY APOSTOLOV 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("SKUTKY APOŠTOLOV 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("SKUTKY 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("SK 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (sk)", ->
		`
		expect(p.parse("List Rimanom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rimanom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rimskym 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rímskym 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rim 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST RIMANOM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RIMANOM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RIMSKYM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RÍMSKYM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RIM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (sk)", ->
		`
		expect(p.parse("Druha kniha Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha kniha Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha kniha Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha kniha Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá kniha Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá kniha Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá kniha Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá kniha Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy list Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy list Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy list Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy list Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý list Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý list Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý list Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý list Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druha Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhy Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhá Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Druhý Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k. Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k. Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k. Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k. Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 k Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintskym 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korintským 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Korinťanom 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Kor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KNIHA KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KNIHA KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KNIHA KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KNIHA KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KNIHA KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KNIHA KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KNIHA KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY LIST KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY LIST KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY LIST KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY LIST KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ LIST KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ LIST KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ LIST KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ LIST KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHA KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHY KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÁ KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("DRUHÝ KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K. KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K. KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K. KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K. KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 K KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTSKYM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINTSKÝM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KORINŤANOM 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 KOR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (sk)", ->
		`
		expect(p.parse("Prva kniha Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva kniha Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva kniha Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva kniha Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá kniha Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá kniha Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá kniha Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá kniha Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy list Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy list Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy list Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy list Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý list Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý list Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý list Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý list Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k. Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k. Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k. Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k. Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prva Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvy Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvá Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Prvý Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 k Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintskym 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korintským 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Korinťanom 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Kor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KNIHA KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KNIHA KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KNIHA KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KNIHA KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KNIHA KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KNIHA KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KNIHA KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY LIST KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY LIST KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY LIST KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY LIST KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ LIST KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ LIST KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ LIST KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ LIST KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K. KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K. KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K. KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K. KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVA KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVY KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÁ KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRVÝ KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 K KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTSKYM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINTSKÝM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I KORINŤANOM 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 KOR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (sk)", ->
		`
		expect(p.parse("List Galatanom 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("List Galaťanom 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatanom 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatskym 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galatským 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galaťanom 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Ga 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST GALATANOM 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("LIST GALAŤANOM 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATANOM 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATSKYM 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALATSKÝM 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALAŤANOM 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GA 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (sk)", ->
		`
		expect(p.parse("List Efezanom 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efezanom 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efezskym 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efezským 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST EFEZANOM 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZANOM 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZSKYM 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFEZSKÝM 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (sk)", ->
		`
		expect(p.parse("List Filipanom 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filipanom 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filipskym 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filipským 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Flp 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST FILIPANOM 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPANOM 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPSKYM 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIPSKÝM 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FLP 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (sk)", ->
		`
		expect(p.parse("List Kolosanom 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolosenskym 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolosenským 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kolosanom 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Kol 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST KOLOSANOM 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSENSKYM 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSENSKÝM 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOLOSANOM 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("KOL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (sk)", ->
		`
		expect(p.parse("Druha kniha Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha kniha Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá kniha Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy list Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý list Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonicanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesaloničanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druha Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhy Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhá Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Druhý Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonickym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonickým 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k. Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 k Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Soluncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solunčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solúncanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solúnčanom 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solunskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Solúnskym 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Sol 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tes 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA KNIHA SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ KNIHA SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY LIST SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ LIST SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONICANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONIČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHA SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHY SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÁ SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("DRUHÝ SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONICKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONICKÝM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K. SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 K SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLUNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLUNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLÚNCANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLÚNČANOM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLUNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOLÚNSKYM 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 SOL 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TES 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (sk)", ->
		`
		expect(p.parse("Prva kniha Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva kniha Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá kniha Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy list Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý list Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonicanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesaloničanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k. Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonickym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonickým 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prva Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvy Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvá Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Prvý Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 k Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Soluncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solunčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solúncanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solúnčanom 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solunskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Solúnskym 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Sol 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tes 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA KNIHA SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ KNIHA SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY LIST SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ LIST SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONICANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONIČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K. SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONICKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONICKÝM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVA SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVY SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÁ SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRVÝ SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 K SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLUNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLUNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLÚNCANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLÚNČANOM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLUNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I SOLÚNSKYM 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 SOL 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TES 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (sk)", ->
		`
		expect(p.parse("Druha kniha Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhá kniha Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druha kniha Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhy list Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhá kniha Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhý list Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhy list Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhý list Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druha Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhy Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhá Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhý Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 k. Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druha Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhy Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhá Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Druhý Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 k Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 k. Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 k Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timotejovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteovi 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÁ KNIHA TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHA KNIHA TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHY LIST TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÁ KNIHA TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÝ LIST TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHY LIST TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÝ LIST TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHA TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHY TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÁ TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÝ TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 K. TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHA TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHY TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÁ TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("DRUHÝ TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 K TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 K. TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 K TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEJOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEOVI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (sk)", ->
		`
		expect(p.parse("Prva kniha Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvá kniha Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prva kniha Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvy list Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvá kniha Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvý list Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvy list Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvý list Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 k. Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prva Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvy Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvá Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvý Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 k Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 k. Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prva Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvy Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvá Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Prvý Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 k Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timotejovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteovi 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÁ KNIHA TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVA KNIHA TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVY LIST TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÁ KNIHA TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÝ LIST TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVY LIST TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÝ LIST TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 K. TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVA TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVY TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÁ TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÝ TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 K TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 K. TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVA TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVY TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÁ TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRVÝ TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 K TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEJOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEOVI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (sk)", ->
		`
		expect(p.parse("List Titovi 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("List Títovi 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titovi 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Títovi 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tít 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST TITOVI 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("LIST TÍTOVI 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITOVI 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍTOVI 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TÍT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (sk)", ->
		`
		expect(p.parse("List Filemonovi 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("List Filemónovi 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemonovi 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flm 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST FILEMONOVI 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("LIST FILEMÓNOVI 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMONOVI 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLM 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (sk)", ->
		`
		expect(p.parse("List Hebrejom 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrejom 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Zidom 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Židom 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebr 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Zid 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Žid 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LIST HEBREJOM 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREJOM 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ZIDOM 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ŽIDOM 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBR 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ZID 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("ŽID 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (sk)", ->
		`
		expect(p.parse("Jakubov List 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jakubov 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jak 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jk 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JAKUBOV LIST 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAKUBOV 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAK 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JK 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (sk)", ->
		`
		expect(p.parse("Druha kniha Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhá kniha Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhy Petrov list 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhy list Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhý Petrov list 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhý list Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druha Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhy Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhá Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Druhý Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 k. Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 k Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Petrov 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pt 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DRUHA KNIHA PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHÁ KNIHA PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHY PETROV LIST 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHY LIST PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHÝ PETROV LIST 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHÝ LIST PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHA PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHY PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHÁ PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("DRUHÝ PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 K. PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 K PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PETROV 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PT 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (sk)", ->
		`
		expect(p.parse("Prva kniha Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvá kniha Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvy Petrov list 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvy list Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvý Petrov list 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvý list Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 k. Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prva Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvy Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvá Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Prvý Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 k Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Petrov 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pt 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRVA KNIHA PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVÁ KNIHA PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVY PETROV LIST 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVY LIST PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVÝ PETROV LIST 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVÝ LIST PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 K. PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVA PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVY PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVÁ PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRVÝ PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 K PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PETROV 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PT 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (sk)", ->
		`
		expect(p.parse("Judov List 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júdov List 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judov 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júdov 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Júd 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUDOV LIST 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚDOV LIST 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDOV 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚDOV 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUD 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JÚD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (sk)", ->
		`
		expect(p.parse("Tobias 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobiaš 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobiás 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobiáš 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (sk)", ->
		`
		expect(p.parse("Kniha Juditina 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("K. Juditina 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("K Juditina 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judita 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judit 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (sk)", ->
		`
		expect(p.parse("Proroctvo Baruchovo 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Baruch 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (sk)", ->
		`
		expect(p.parse("Zuzana 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Zuzane 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book 2Macc (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (sk)", ->
		`
		expect(p.parse("Druha kniha Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhá kniha Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druha kniha Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhy list Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhá kniha Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhý list Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhy list Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhý list Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druha Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhy Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhá Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhý Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 k. Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druha Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhy Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhá Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Druhý Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 k Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 k. Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 k Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Machabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Makabejcov 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mach 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mak 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (sk)", ->
		`
		expect(p.parse("Tretia kniha Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tretia Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Treti Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tretí Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 k. Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 k Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Machabejcov 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mach 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mak 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (sk)", ->
		`
		expect(p.parse("Stvrta kniha Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Stvrtá kniha Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Štvrta kniha Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Štvrtá kniha Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Stvrta Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Stvrtá Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Štvrta Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Štvrtá Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 k. Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 k Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Machabejcov 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mach 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mak 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (sk)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (sk)", ->
		`
		expect(p.parse("Prva kniha Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvá kniha Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvy list Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvý list Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 k. Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prva Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvy Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvá Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvý Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 k Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prva Makabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Prvá Makabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Machabejcov 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mach 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mak 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (sk)", ->
		expect(p.parse("Titus 1:1 až 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1až2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 AŽ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
		expect(p.parse("Titus 1:1 az 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1az2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 AZ 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
		expect(p.parse("Titus 1:1 - 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1-2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 - 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (sk)", ->
		expect(p.parse("Titus 1:1, kapitoly 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAPITOLY 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kapitole 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAPITOLE 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kapitolu 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAPITOLU 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kapitol 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAPITOL 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, hlavy 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 HLAVY 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kap. 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAP. 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, kap 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 KAP 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (sk)", ->
		expect(p.parse("Exod 1:1 veršov 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERŠOV 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 versov 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSOV 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (sk)", ->
		expect(p.parse("Exod 1:1 porov 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 POROV 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 pozri 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 POZRI 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 alebo 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 ALEBO 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
		expect(p.parse("Exod 1:1 a 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 A 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (sk)", ->
		expect(p.parse("Ps 3 title, 4:2, 5:title").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITLE, 4:2, 5:TITLE").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (sk)", ->
		expect(p.parse("Rev 3ff, 4:2ff").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 FF, 4:2 FF").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (sk)", ->
		expect(p.parse("Lev 1 (SEB)").osis_and_translations()).toEqual [["Lev.1", "SEB"]]
		expect(p.parse("lev 1 seb").osis_and_translations()).toEqual [["Lev.1", "SEB"]]
	it "should handle book ranges (sk)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Prvá kniha až Tretia kniha  Jánov").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Prvá kniha az Tretia kniha  Jánov").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Prvá kniha - Tretia kniha  Jánov").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Prvá kniha až Tretia kniha  Janov").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Prvá kniha az Tretia kniha  Janov").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Prvá kniha - Tretia kniha  Janov").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (sk)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

bcv_parser = require("../../js/es_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (es)", ->
		`
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Génesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gén 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Ge 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gn 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gé 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÉNESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÉN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GE 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÉ 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (es)", ->
		`
		expect(p.parse("Exodo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Éxodo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Éxod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exd 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Éxd 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Éxo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Ex 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Éx 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EXODO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÉXODO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÉXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÉXD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÉXO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EX 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÉX 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (es)", ->
		`
		expect(p.parse("Bel y el Serpiente 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel y el Dragon 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel y el Dragón 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (es)", ->
		`
		expect(p.parse("Levitico 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Levítico 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lv 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LEVITICO 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVÍTICO 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (es)", ->
		`
		expect(p.parse("Numeros 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Números 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Num 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Núm 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Nm 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Nu 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("Nú 1:1").osis()).toEqual("Num.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NUMEROS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NÚMEROS 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NUM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NÚM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NM 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NU 1:1").osis()).toEqual("Num.1.1")
		expect(p.parse("NÚ 1:1").osis()).toEqual("Num.1.1")
		`
		true
describe "Localized book Sir (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (es)", ->
		`
		expect(p.parse("Eclesiastico 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Eclesiástico 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Siracides 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirácides 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Siracida 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirácida 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Ecclus 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirac 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirác 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Si 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (es)", ->
		`
		expect(p.parse("Sabiduria 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sabiduría 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sab 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sb 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (es)", ->
		`
		expect(p.parse("Lamentaciones 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamintaciones 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentacione 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamintacione 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("La 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lm 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAMENTACIONES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMINTACIONES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTACIONE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMINTACIONE 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LA 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (es)", ->
		`
		expect(p.parse("La Carta de Jeremias 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("La Carta de Jeremías 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Carta de Jeremias 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Carta de Jeremías 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Carta Jeremias 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Carta Jeremías 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Carta Jer 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (es)", ->
		`
		expect(p.parse("El Apocalipsis 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipsis 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apoc 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Ap 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EL APOCALIPSIS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSIS 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOC 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("AP 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (es)", ->
		`
		expect(p.parse("La Oracion de Manases 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("La Oracion de Manasés 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("La Oración de Manases 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("La Oración de Manasés 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Oracion de Manases 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Oracion de Manasés 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Oración de Manases 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Oración de Manasés 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Or. Man 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Or Man 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (es)", ->
		`
		expect(p.parse("Deuteronomio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deutoronomio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dueteronomio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronmio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deutoronmio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deutronomio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deutronmio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deu 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dt 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEUTERONOMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTORONOMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DUETERONOMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTORONMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTRONOMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTRONMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEU 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (es)", ->
		`
		expect(p.parse("Josue 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josué 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jos 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOSUE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSUÉ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOS 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (es)", ->
		`
		expect(p.parse("Jueces 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Juec 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Jue 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Jc 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUECES 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUEC 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUE 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JC 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (es)", ->
		`
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rt 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ru 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RU 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 1Esd (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (es)", ->
		`
		expect(p.parse("Primero Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Primer Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1.o. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1.º. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1.o Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1.º Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1o. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1º. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1o Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1º Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esdr 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book 2Esd (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (es)", ->
		`
		expect(p.parse("Segundo Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2.o. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2.º. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2.o Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2.º Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2o. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2º. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2o Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2º Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esdr 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book Isa (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (es)", ->
		`
		expect(p.parse("Isaias 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isaías 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Isa 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("Is 1:1").osis()).toEqual("Isa.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ISAIAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISAÍAS 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("ISA 1:1").osis()).toEqual("Isa.1.1")
		expect(p.parse("IS 1:1").osis()).toEqual("Isa.1.1")
		`
		true
describe "Localized book 2Sam (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (es)", ->
		`
		expect(p.parse("Segundo Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.o. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.º. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.o Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.º Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2o. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2º. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2o Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2º Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sa 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sm 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.O. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.º. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.O SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2.º SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2O. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2º. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2O SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2º SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (es)", ->
		`
		expect(p.parse("Primero Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Primer Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.o. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.º. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.o Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.º Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1o. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1º. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1o Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1º Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sa 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sm 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRIMER SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.O. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.º. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.O SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1.º SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1O. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1º. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1O SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1º SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (es)", ->
		`
		expect(p.parse("Segundo Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.o. Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.º. Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.o Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.º Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2o. Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2º. Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2o Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2º Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Reyes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Rees 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Reye 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Reys 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Ryes 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Ree 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Res 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Rey 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Rye 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Rys 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Re 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Rs 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Ry 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 R 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.O. REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.º. REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.O REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2.º REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2O. REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2º. REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2O REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2º REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REYE 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REYS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RYES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REE 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RES 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REY 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RYE 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RYS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RE 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RY 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 R 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (es)", ->
		`
		expect(p.parse("Primero Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Primer Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.o. Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.º. Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.o Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.º Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1o. Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1º. Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1o Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1º Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Reyes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Rees 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Reye 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Reys 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Ryes 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Ree 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Res 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Rey 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Rye 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Rys 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Re 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Rs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Ry 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 R 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRIMER REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.O. REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.º. REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.O REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1.º REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1O. REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1º. REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1O REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1º REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I REYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REYE 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REYS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RYES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REE 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RES 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REY 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RYE 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RYS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RE 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RY 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 R 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (es)", ->
		`
		expect(p.parse("Segundo Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Segundo Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.o. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.o. Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º. Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.o Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.o Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o. Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º. Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Crónicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Crón 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cró 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cr 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SEGUNDO CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.O. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.O. CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º. CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.O CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.O CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2.º CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O. CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º. CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2º CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRÓNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRÓN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRÓ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (es)", ->
		`
		expect(p.parse("Primero Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Primero Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Primer Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Primer Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.o. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.o. Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º. Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.o Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.o Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o. Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º. Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Crónicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Crón 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cró 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cr 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRIMERO CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRIMER CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRIMER CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.O. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.O. CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º. CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.O CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.O CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1.º CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O. CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º. CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1º CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I CRÓNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRÓN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRÓ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (es)", ->
		`
		expect(p.parse("Esdras 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esdr 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Ezra 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("Esd 1:1").osis()).toEqual("Ezra.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESDRAS 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESDR 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("EZRA 1:1").osis()).toEqual("Ezra.1.1")
		expect(p.parse("ESD 1:1").osis()).toEqual("Ezra.1.1")
		`
		true
describe "Localized book Neh (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (es)", ->
		`
		expect(p.parse("Nehemias 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Nehemías 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Ne 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEHEMIAS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEHEMÍAS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NE 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (es)", ->
		`
		expect(p.parse("Ester (Griego) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester (griego) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester Griego 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester griego 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Est Gr 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (es)", ->
		`
		expect(p.parse("Ester 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Esth 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Est 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("Es 1:1").osis()).toEqual("Esth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ESTER 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ESTH 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("EST 1:1").osis()).toEqual("Esth.1.1")
		expect(p.parse("ES 1:1").osis()).toEqual("Esth.1.1")
		`
		true
describe "Localized book Job (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (es)", ->
		`
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Jb 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JB 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book Ps (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (es)", ->
		`
		expect(p.parse("Salmos 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Salmo 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Salm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sal 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Slm 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sl 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SALMOS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SALMO 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SALM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SAL 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SLM 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SL 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book PrAzar (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (es)", ->
		`
		expect(p.parse("Cantico de Azarias 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Cantico de Azarías 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Cántico de Azarias 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Cántico de Azarías 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Oracion de Azarias 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Oracion de Azarías 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Oración de Azarias 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Oración de Azarías 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Azarias 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Azarías 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Or Azar 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Or Az 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Prov (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (es)", ->
		`
		expect(p.parse("Probverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Porverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Preverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Proberbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Proverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Poverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Preverbio 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Provebios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Proverbio 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prverbio 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prvbos 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prvbo 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prvbs 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prvb 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pro 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prv 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pr 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pv 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROBVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PORVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PREVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROBERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("POVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PREVERBIO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROVEBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROVERBIO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRVERBIO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRVBOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRVBO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRVBS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRVB 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PR 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (es)", ->
		`
		expect(p.parse("Ecclesiastices 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiasticés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiasties 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiastiés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiastices 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiasticés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiasties 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiastiés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessaité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclessiité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiastés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiistes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiistés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesaité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecclesiité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiaste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiasté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiates 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiatés 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiiste 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiisté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiites 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiités 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessaité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclessiité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesaité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiate 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiaté 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiite 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eclesiité 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccles 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecles 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecc 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ec 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Qo 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ECCLESIASTICES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTICÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTIES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTIÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTICES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTICÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTIES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTIÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSAITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESSIITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIISTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIISTÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESAITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLESIITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIASTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIATES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIATÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIISTE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIISTÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIITES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIITÉS 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSAITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESSIITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESAITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIATE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIATÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIITE 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLESIITÉ 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCLES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECLES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECC 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("EC 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("QO 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (es)", ->
		`
		expect(p.parse("El Canto de los Tres Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los Tres Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los Tres Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los Tres Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los Tres Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los Tres Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los Tres Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los Tres Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los Tres Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los Tres Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los Tres Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los Tres Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los 3 Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los 3 Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los 3 Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los 3 Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los 3 Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los 3 Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los 3 Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Canto de los 3 Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los 3 Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los 3 Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los 3 Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("El Himno de los 3 Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los Tres Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los Tres Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los Tres Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los Tres Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jovenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jóvenes Hebreos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jovenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jovenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jóvenes Judios 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jóvenes Judíos 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jovenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los Tres Jóvenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los Tres Jovenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los Tres Jóvenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jovenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Canto de los 3 Jóvenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jovenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Himno de los 3 Jóvenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Tres Jovenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Tres Jóvenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("3 Jovenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("3 Jóvenes 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Ct 3 Jo 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Ct 3 Jó 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (es)", ->
		`
		expect(p.parse("El Cantar de los Cantares 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantare de los Cantares 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantar de los Cantares 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantares 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cant 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Can 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cnt 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Ct 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EL CANTAR DE LOS CANTARES 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTARE DE LOS CANTARES 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTAR DE LOS CANTARES 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTARES 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CAN 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CNT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CT 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (es)", ->
		`
		expect(p.parse("Jeremias 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremías 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremia 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jeremía 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jere 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jr 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMÍAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMIA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JEREMÍA 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JERE 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JR 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (es)", ->
		`
		expect(p.parse("Ezeequiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezeiquiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eziequiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eziiquiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezeequel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezeiquel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezequial 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezequiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eziequel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eziiquel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eziquiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezequel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eziquel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezequ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezeq 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eze 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezq 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ez 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZEEQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEIQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZIEQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZIIQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEEQUEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEIQUEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEQUIAL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZIEQUEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZIIQUEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZIQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEQUEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZIQUEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEQU 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEQ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZE 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZQ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (es)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Da 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dl 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dn 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DA 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (es)", ->
		`
		expect(p.parse("Oseas 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Os 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OSEAS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (es)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Joe 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jl 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JOE 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (es)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amós 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amo 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Ams 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amó 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMÓS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMO 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMÓ 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (es)", ->
		`
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdías 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abd 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ab 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDÍAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("AB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (es)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonás 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jns 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jon 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONÁS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JNS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JON 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (es)", ->
		`
		expect(p.parse("Miqueas 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miq 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mi 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mq 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIQUEAS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIQ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MI 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MQ 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (es)", ->
		`
		expect(p.parse("Nahum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahúm 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahu 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nahú 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Na 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nh 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAHUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHÚM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHU 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAHÚ 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NA 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NH 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (es)", ->
		`
		expect(p.parse("Habbacac 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habbacuc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habacac 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habacuc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABBACAC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABBACUC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABACAC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABACUC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (es)", ->
		`
		expect(p.parse("Sofonias 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sofonías 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sof 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sf 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("So 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SOFONIAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOFONÍAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOF 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SF 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SO 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (es)", ->
		`
		expect(p.parse("Haggeo 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hageo 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ageo 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hg 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HAGGEO 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAGEO 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AGEO 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (es)", ->
		`
		expect(p.parse("Zacarias 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zacarías 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zacar 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zac 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Za 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZACARIAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACARÍAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZACAR 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZAC 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZA 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (es)", ->
		`
		expect(p.parse("Malaquias 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malaquías 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Malaqu 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mala 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Ml 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAQUIAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALAQUÍAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALAQU 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MALA 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ML 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (es)", ->
		`
		expect(p.parse("El Evangelio de Mateo 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Evangelio de Mateo 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("San Mateo 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mateo 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EL EVANGELIO DE MATEO 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("EVANGELIO DE MATEO 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("SAN MATEO 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATEO 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book 2Macc (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (es)", ->
		`
		expect(p.parse("Segundo Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabbeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o. Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º. Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabbeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabbeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabeeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.o Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2.º Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º. Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabbeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabeeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabeos 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Maccabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2º Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabeo 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mac 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 M 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (es)", ->
		`
		expect(p.parse("Tercero Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercero Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Tercer Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabbeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o. Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º. Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabbeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabbeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabeeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.o Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3.º Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º. Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabbeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabeeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabeos 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Maccabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3º Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabeo 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mac 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 M 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (es)", ->
		`
		expect(p.parse("Cuarto Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Cuarto Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabbeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o. Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º. Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabbeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabbeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabeeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.o Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4.º Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º. Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabbeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabeeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabeos 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Maccabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4º Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabeo 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mac 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 M 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book 1Macc (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (es)", ->
		`
		expect(p.parse("Primero Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primero Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primer Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o. Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º. Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabbeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.o Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1.º Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º. Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabbeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabbeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabeeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1º Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabbeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabeeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabeos 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Maccabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabeo 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mac 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 M 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book Mark (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (es)", ->
		`
		expect(p.parse("El Evangelio de Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Evangelio de Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("San Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mrcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Marc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mar 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mrc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mr 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EL EVANGELIO DE MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("EVANGELIO DE MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("SAN MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MRCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MAR 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MRC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MR 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (es)", ->
		`
		expect(p.parse("El Evangelio de Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Evangelio de Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("San Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lu 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EL EVANGELIO DE LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("EVANGELIO DE LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("SAN LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LU 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (es)", ->
		`
		expect(p.parse("Primero San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primero Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primer Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I San Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I San Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I San Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I San Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o. Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.o Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Jaan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Jaun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Juan 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Juun 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jn 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMERO JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMER JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I SAN JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I SAN JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I SAN JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I SAN JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O. JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º. JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.O JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1.º JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º. JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1º JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JAAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JAUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JUAN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JUUN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JN 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (es)", ->
		`
		expect(p.parse("Segundo San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 San Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 San Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 San Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 San Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o. Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.o Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jaan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jaun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Juan 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Juun 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jn 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 SAN JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 SAN JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 SAN JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 SAN JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O. JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º. JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.O JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2.º JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º. JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2º JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JAAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JAUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JUAN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JUUN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JN 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (es)", ->
		`
		expect(p.parse("Tercero San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercero Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Tercer Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 San Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 San Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 San Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 San Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o. Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.o Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jaan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jaun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Juan 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Juun 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jn 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TERCERO SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCERO JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCER JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 SAN JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 SAN JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 SAN JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 SAN JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O. JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º. JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.O JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3.º JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º. JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3º JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JAAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JAUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JUAN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JUUN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JN 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (es)", ->
		`
		expect(p.parse("El Evangelio de Jaan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("El Evangelio de Jaun 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("El Evangelio de Juan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("El Evangelio de Juun 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("San Juan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jaan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jaun 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Juan 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Juun 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jn 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EL EVANGELIO DE JAAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EL EVANGELIO DE JAUN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EL EVANGELIO DE JUAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("EL EVANGELIO DE JUUN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("SAN JUAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JAAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JAUN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JUAN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JUUN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JN 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (es)", ->
		`
		expect(p.parse("Los Hechos de los Apostoles 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Los Hechos de los Apóstoles 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hechos de los Apostoles 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hechos de los Apóstoles 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Los Hechos 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hechos 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hech 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hch 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hec 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Hc 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LOS HECHOS DE LOS APOSTOLES 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("LOS HECHOS DE LOS APÓSTOLES 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HECHOS DE LOS APOSTOLES 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HECHOS DE LOS APÓSTOLES 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("LOS HECHOS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HECHOS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HECH 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HCH 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HEC 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("HC 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (es)", ->
		`
		expect(p.parse("Romanos 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Romano 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rmns 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Roms 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rmn 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rms 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Ros 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rm 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Ro 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROMANOS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMANO 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RMNS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROMS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RMN 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RMS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RO 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (es)", ->
		`
		expect(p.parse("Segundo Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.o. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.º. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.o Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.º Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2o. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2º. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2o Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2º Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corinti 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corini 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corint 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corin 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Co 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.O. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.º. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.O CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2.º CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2O. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2º. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2O CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2º CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINI 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINT 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORIN 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (es)", ->
		`
		expect(p.parse("Primero Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Primer Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.o. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.º. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.o Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.º Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1o. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1º. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1o Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1º Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corinti 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corini 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corint 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corin 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Co 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRIMER CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.O. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.º. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.O CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1.º CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1O. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1º. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1O CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1º CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTI 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINI 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINT 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORIN 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (es)", ->
		`
		expect(p.parse("Galatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gálatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Galat 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gálat 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gál 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Ga 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gá 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GÁLATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GALAT 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GÁLAT 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GÁL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GA 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GÁ 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (es)", ->
		`
		expect(p.parse("Efesios 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efes 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EFESIOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFES 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (es)", ->
		`
		expect(p.parse("Filipenses 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Filip 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fili 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Flp 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILIPENSES 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILIP 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FILI 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FLP 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (es)", ->
		`
		expect(p.parse("Colosenses 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Colos 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("COLOSENSES 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COLOS 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (es)", ->
		`
		expect(p.parse("Segundo Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Segundo Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Segundo Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Segundo Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o. Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o. Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o. Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o. Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o. Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o. Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.o Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o. Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o. Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonisenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonicense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tesalonisense 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tes 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Ts 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SEGUNDO TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SEGUNDO TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SEGUNDO TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O. TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O. TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O. TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O. TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º. TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O. TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O. TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.O TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2.º TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O. TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O. TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º. TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONISENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2º TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONICENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESALONISENSE 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (es)", ->
		`
		expect(p.parse("Primero Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primero Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primer Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primer Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primero Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primero Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primer Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primer Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o. Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o. Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o. Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o. Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o. Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o. Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.o Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o. Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o. Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonisenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonicense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tesalonisense 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tes 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Ts 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMERO TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMER TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMER TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMERO TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMERO TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMER TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMER TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O. TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O. TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O. TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O. TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º. TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O. TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O. TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.O TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1.º TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O. TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O. TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º. TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1º TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONISENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONICENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESALONISENSE 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (es)", ->
		`
		expect(p.parse("Segundo Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.o. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.º. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.o Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.º Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2o. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2º. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2o Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2º Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Ti 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tm 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.O. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.º. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.O TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2.º TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2O. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2º. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2O TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2º TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (es)", ->
		`
		expect(p.parse("Primero Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Primer Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.o. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.º. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.o Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.º Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1o. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1º. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1o Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1º Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Ti 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tm 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRIMER TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.O. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.º. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.O TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1.º TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1O. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1º. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1O TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1º TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (es)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tito 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Ti 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tt 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITO 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TI 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (es)", ->
		`
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemón 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filem 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flmn 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Fmn 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMÓN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLMN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FMN 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (es)", ->
		`
		expect(p.parse("Hebeees 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebeeos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebeers 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebeoes 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebeoos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebeors 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heberes 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heberos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heberrs 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboees 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboeos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboers 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebooes 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebooos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboors 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebores 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboros 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heborrs 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrees 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebreos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrers 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebroes 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebroos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrors 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrres 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrros 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrrrs 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebees 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebeos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebers 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboes 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heboos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebors 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebreo 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebres 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebros 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrrs 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebes 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebos 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebrs 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Hebr 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("He 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HEBEEES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEEOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEERS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEOES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEOOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEORS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBERES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEROS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBERRS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOEES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOEOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOERS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOOES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOOOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOORS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBORES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOROS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBORRS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRERS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBROES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBROOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRORS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRRES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRROS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRRRS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBEOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBERS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBORS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBREO 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBROS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRRS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBES 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBOS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBRS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEBR 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HE 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (es)", ->
		`
		expect(p.parse("Santiago 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Sant 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Stg 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("St 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SANTIAGO 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("SANT 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("STG 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("ST 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (es)", ->
		`
		expect(p.parse("Segundo San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.o. San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º. San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.o San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2o. San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º. San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Segundo Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2o San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 San Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.o. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.o Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2o. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2o Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Ped 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pd 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pe 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 P 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDO SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.O. SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º. SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.O SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2O. SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º. SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SEGUNDO PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2O SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 SAN PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.O. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.O PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2.º PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2O. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2O PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2º PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PED 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PD 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 P 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (es)", ->
		`
		expect(p.parse("Primero San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Primer San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.o. San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º. San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.o San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1o. San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º. San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Primero Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1o San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Primer Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I San Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.o. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.o Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1o. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1o Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Ped 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pd 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pe 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 P 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMERO SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRIMER SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.O. SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º. SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.O SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1O. SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º. SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRIMERO PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1O SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRIMER PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I SAN PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.O. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.O PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1.º PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1O. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1O PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1º PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PED 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PD 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 P 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (es)", ->
		`
		expect(p.parse("San Judas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Judas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jdas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jd 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SAN JUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUD 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (es)", ->
		`
		expect(p.parse("Tobit 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobi 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tobt 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tb 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (es)", ->
		`
		expect(p.parse("Judit 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdit 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Judt 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (es)", ->
		`
		expect(p.parse("Baruc 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Ba 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (es)", ->
		`
		expect(p.parse("Susana 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true
describe "Localized book Hab,Hag (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab,Hag (es)", ->
		`
		expect(p.parse("Ha 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HA 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Heb,Hab (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb,Hab (es)", ->
		`
		expect(p.parse("Hb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jonah,Job,Josh,Joel (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah,Job,Josh,Joel (es)", ->
		`
		expect(p.parse("Jo 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JO 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Jude,Judg (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude,Judg (es)", ->
		`
		expect(p.parse("Ju 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JU 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Matt,Mark,Mal (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt,Mark,Mal (es)", ->
		`
		expect(p.parse("Ma 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MA 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book Phil,Phlm (es)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil,Phlm (es)", ->
		`
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (es)", ->
		expect(p.parse("Titus 1:1 á 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1á2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 Á 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (es)", ->
		expect(p.parse("Titus 1:1, capítulos 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPÍTULOS 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, capitulos 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPITULOS 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, capítulo 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPÍTULO 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, capitulo 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPITULO 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, caps. 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPS. 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, caps 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAPS 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, cap. 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAP. 6").osis()).toEqual "Matt.3.4,Matt.6"
		expect(p.parse("Titus 1:1, cap 2").osis()).toEqual "Titus.1.1,Titus.2"
		expect(p.parse("Matt 3:4 CAP 6").osis()).toEqual "Matt.3.4,Matt.6"
	it "should handle verses (es)", ->
		expect(p.parse("Exod 1:1 versículos 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSÍCULOS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 versiculos 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSICULOS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 versículo 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSÍCULO 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 versiculo 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERSICULO 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vers. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERS. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vers 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VERS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 ver. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VER. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 ver 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VER 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vss. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VSS. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vss 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VSS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vs. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VS. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vs 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VS 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vv. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VV. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 vv 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm VV 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 v. 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm V. 6").osis()).toEqual "Phlm.1.6"
		expect(p.parse("Exod 1:1 v 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm V 6").osis()).toEqual "Phlm.1.6"
	it "should handle 'and' (es)", ->
		expect(p.parse("Exod 1:1 y 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 Y 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (es)", ->
		expect(p.parse("Ps 3 subtítulo, 4:2, 5:subtítulo").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 SUBTÍTULO, 4:2, 5:SUBTÍTULO").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("Ps 3 subtitulo, 4:2, 5:subtitulo").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 SUBTITULO, 4:2, 5:SUBTITULO").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("Ps 3 título, 4:2, 5:título").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TÍTULO, 4:2, 5:TÍTULO").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("Ps 3 titulo, 4:2, 5:titulo").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITULO, 4:2, 5:TITULO").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("Ps 3 tít, 4:2, 5:tít").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TÍT, 4:2, 5:TÍT").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (es)", ->
		expect(p.parse("Rev 3y siguientes, 4:2y siguientes").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 Y SIGUIENTES, 4:2 Y SIGUIENTES").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("Rev 3y sig, 4:2y sig").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 Y SIG, 4:2 Y SIG").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (es)", ->
		expect(p.parse("Lev 1 (DHH)").osis_and_translations()).toEqual [["Lev.1", "DHH"]]
		expect(p.parse("lev 1 dhh").osis_and_translations()).toEqual [["Lev.1", "DHH"]]
		expect(p.parse("Lev 1 (LBLA)").osis_and_translations()).toEqual [["Lev.1", "LBLA"]]
		expect(p.parse("lev 1 lbla").osis_and_translations()).toEqual [["Lev.1", "LBLA"]]
		expect(p.parse("Lev 1 (NBLH)").osis_and_translations()).toEqual [["Lev.1", "NBLH"]]
		expect(p.parse("lev 1 nblh").osis_and_translations()).toEqual [["Lev.1", "NBLH"]]
		expect(p.parse("Lev 1 (NTV)").osis_and_translations()).toEqual [["Lev.1", "NTV"]]
		expect(p.parse("lev 1 ntv").osis_and_translations()).toEqual [["Lev.1", "NTV"]]
		expect(p.parse("Lev 1 (NVI)").osis_and_translations()).toEqual [["Lev.1", "NVI"]]
		expect(p.parse("lev 1 nvi").osis_and_translations()).toEqual [["Lev.1", "NVI"]]
		expect(p.parse("Lev 1 (RVR1960)").osis_and_translations()).toEqual [["Lev.1", "RVR1960"]]
		expect(p.parse("lev 1 rvr1960").osis_and_translations()).toEqual [["Lev.1", "RVR1960"]]
		expect(p.parse("Lev 1 (RVR)").osis_and_translations()).toEqual [["Lev.1", "RVR"]]
		expect(p.parse("lev 1 rvr").osis_and_translations()).toEqual [["Lev.1", "RVR"]]
		expect(p.parse("Lev 1 (TLA)").osis_and_translations()).toEqual [["Lev.1", "TLA"]]
		expect(p.parse("lev 1 tla").osis_and_translations()).toEqual [["Lev.1", "TLA"]]
	it "should handle book ranges (es)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("1.º á 3.º  San Jaan").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("1.º á 3.º  San Jaun").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("1.º á 3.º  San Juan").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("1.º á 3.º  San Juun").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (es)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

bcv_parser = require("../../js/pt_bcv_parser.js").bcv_parser

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

describe "Localized book Gen (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gen (pt)", ->
		`
		expect(p.parse("Genesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Génesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gênesis 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gen 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gén 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("Gên 1:1").osis()).toEqual("Gen.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GENESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÉNESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÊNESIS 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GEN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÉN 1:1").osis()).toEqual("Gen.1.1")
		expect(p.parse("GÊN 1:1").osis()).toEqual("Gen.1.1")
		`
		true
describe "Localized book Exod (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Exod (pt)", ->
		`
		expect(p.parse("Exodo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Éxodo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Êxodo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Êxod 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exd 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Exo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Êxd 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Êxo 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Ex 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("Êx 1:1").osis()).toEqual("Exod.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EXODO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÉXODO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÊXODO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÊXOD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EXO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÊXD 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÊXO 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("EX 1:1").osis()).toEqual("Exod.1.1")
		expect(p.parse("ÊX 1:1").osis()).toEqual("Exod.1.1")
		`
		true
describe "Localized book Bel (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bel (pt)", ->
		`
		expect(p.parse("Bel e o Dragao 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel e o Dragão 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel e o dragao 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel e o dragão 1:1").osis()).toEqual("Bel.1.1")
		expect(p.parse("Bel 1:1").osis()).toEqual("Bel.1.1")
		`
		true
describe "Localized book Lev (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lev (pt)", ->
		`
		expect(p.parse("Leviticos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Levíticos 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Levitico 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Levítico 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lev 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Le 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("Lv 1:1").osis()).toEqual("Lev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LEVITICOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVÍTICOS 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVITICO 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEVÍTICO 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LEV 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LE 1:1").osis()).toEqual("Lev.1.1")
		expect(p.parse("LV 1:1").osis()).toEqual("Lev.1.1")
		`
		true
describe "Localized book Num (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Num (pt)", ->
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
describe "Localized book Sir (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sir (pt)", ->
		`
		expect(p.parse("Eclesiastico 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Eclesiástico 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Siracida 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sirácida 1:1").osis()).toEqual("Sir.1.1")
		expect(p.parse("Sir 1:1").osis()).toEqual("Sir.1.1")
		`
		true
describe "Localized book Wis (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Wis (pt)", ->
		`
		expect(p.parse("Sabedoria de Salomao 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sabedoria de Salomão 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sabedoria 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sab 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Wis 1:1").osis()).toEqual("Wis.1.1")
		expect(p.parse("Sb 1:1").osis()).toEqual("Wis.1.1")
		`
		true
describe "Localized book Lam (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Lam (pt)", ->
		`
		expect(p.parse("Lamentacoes de Jeremias 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentacôes de Jeremias 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentacões de Jeremias 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentaçoes de Jeremias 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentaçôes de Jeremias 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentações de Jeremias 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentacoes 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentacões 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentaçoes 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lamentações 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("Lam 1:1").osis()).toEqual("Lam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LAMENTACOES DE JEREMIAS 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTACÔES DE JEREMIAS 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTACÕES DE JEREMIAS 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTAÇOES DE JEREMIAS 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTAÇÔES DE JEREMIAS 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTAÇÕES DE JEREMIAS 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTACOES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTACÕES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTAÇOES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAMENTAÇÕES 1:1").osis()).toEqual("Lam.1.1")
		expect(p.parse("LAM 1:1").osis()).toEqual("Lam.1.1")
		`
		true
describe "Localized book EpJer (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: EpJer (pt)", ->
		`
		expect(p.parse("Carta de Jeremias 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Cart. Jer 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("Cart Jer 1:1").osis()).toEqual("EpJer.1.1")
		expect(p.parse("EpJer 1:1").osis()).toEqual("EpJer.1.1")
		`
		true
describe "Localized book Rev (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rev (pt)", ->
		`
		expect(p.parse("Apocalipse de Sao Joao 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipse de Sao João 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipse de São Joao 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipse de São João 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipse de Joao 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipse de João 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apocalipse 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apoc 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Apc 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Rev 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("Ap 1:1").osis()).toEqual("Rev.1.1")
		p.include_apocrypha(false)
		expect(p.parse("APOCALIPSE DE SAO JOAO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSE DE SAO JOÃO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSE DE SÃO JOAO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSE DE SÃO JOÃO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSE DE JOAO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSE DE JOÃO 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOCALIPSE 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APOC 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("APC 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("REV 1:1").osis()).toEqual("Rev.1.1")
		expect(p.parse("AP 1:1").osis()).toEqual("Rev.1.1")
		`
		true
describe "Localized book PrMan (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrMan (pt)", ->
		`
		expect(p.parse("Prece de Manasses 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Prece de Manassés 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("Pr Man 1:1").osis()).toEqual("PrMan.1.1")
		expect(p.parse("PrMan 1:1").osis()).toEqual("PrMan.1.1")
		`
		true
describe "Localized book Deut (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Deut (pt)", ->
		`
		expect(p.parse("Deuteronomio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronómio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deuteronômio 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deut 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Deu 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("Dt 1:1").osis()).toEqual("Deut.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DEUTERONOMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONÓMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUTERONÔMIO 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEUT 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DEU 1:1").osis()).toEqual("Deut.1.1")
		expect(p.parse("DT 1:1").osis()).toEqual("Deut.1.1")
		`
		true
describe "Localized book Josh (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Josh (pt)", ->
		`
		expect(p.parse("Josue 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josué 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Josh 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Jos 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("Js 1:1").osis()).toEqual("Josh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOSUE 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSUÉ 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOSH 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JOS 1:1").osis()).toEqual("Josh.1.1")
		expect(p.parse("JS 1:1").osis()).toEqual("Josh.1.1")
		`
		true
describe "Localized book Judg (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Judg (pt)", ->
		`
		expect(p.parse("Juizes 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Juízes 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Judg 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Juiz 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Juíz 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("Jz 1:1").osis()).toEqual("Judg.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUIZES 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUÍZES 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUDG 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUIZ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JUÍZ 1:1").osis()).toEqual("Judg.1.1")
		expect(p.parse("JZ 1:1").osis()).toEqual("Judg.1.1")
		`
		true
describe "Localized book Ruth (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ruth (pt)", ->
		`
		expect(p.parse("Rute 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ruth 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rut 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Rt 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("Ru 1:1").osis()).toEqual("Ruth.1.1")
		p.include_apocrypha(false)
		expect(p.parse("RUTE 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUTH 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RUT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RT 1:1").osis()).toEqual("Ruth.1.1")
		expect(p.parse("RU 1:1").osis()).toEqual("Ruth.1.1")
		`
		true
describe "Localized book 2Esd (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Esd (pt)", ->
		`
		expect(p.parse("Segunda Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("Segundo Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2a. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2o. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2. Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2a Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2o Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("II Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esdras 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Esd 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2 Es 1:1").osis()).toEqual("2Esd.1.1")
		expect(p.parse("2Esd 1:1").osis()).toEqual("2Esd.1.1")
		`
		true
describe "Localized book 1Esd (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Esd (pt)", ->
		`
		expect(p.parse("Primeira Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("Primeiro Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1a. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1o. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1a Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1o Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I. Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("I Esdras 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Esd 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1 Es 1:1").osis()).toEqual("1Esd.1.1")
		expect(p.parse("1Esd 1:1").osis()).toEqual("1Esd.1.1")
		`
		true
describe "Localized book Isa (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Isa (pt)", ->
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
describe "Localized book 2Sam (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Sam (pt)", ->
		`
		expect(p.parse("Segunda Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Segunda Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Segundo Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("Segundo Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2a. Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2a. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2o. Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2o. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2a Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2a Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2o Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2o Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Reinos 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Samuel 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sa 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 Sm 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2Sam 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SEGUNDA SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SEGUNDO REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("SEGUNDO SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2A. REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2A. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2O. REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2O. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2. SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2A REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2A SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2O REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2O SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("II SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 REINOS 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAMUEL 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SA 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 SM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2SAM 1:1").osis()).toEqual("2Sam.1.1")
		expect(p.parse("2 S 1:1").osis()).toEqual("2Sam.1.1")
		`
		true
describe "Localized book 1Sam (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Sam (pt)", ->
		`
		expect(p.parse("Primeira Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Primeira Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Primeiro Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("Primeiro Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1a. Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1a. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1o. Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1o. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1a Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1a Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1o Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1o Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Reinos 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I Samuel 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sa 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 Sm 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1Sam 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRIMEIRA SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRIMEIRO REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("PRIMEIRO SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1A. REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1A. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1O. REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1O. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1A REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1A SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1O REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1O SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I. SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I REINOS 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("I SAMUEL 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SA 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 SM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1SAM 1:1").osis()).toEqual("1Sam.1.1")
		expect(p.parse("1 S 1:1").osis()).toEqual("1Sam.1.1")
		`
		true
describe "Localized book 2Kgs (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Kgs (pt)", ->
		`
		expect(p.parse("Quarta Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Quarto Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Segunda Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("Segundo Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4a. Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4o. Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4a Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4o Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2a. Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2o. Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 Reinos 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2a Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2o Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Reis 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 Re 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2Kgs 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 R 1:1").osis()).toEqual("2Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("QUARTA REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("QUARTO REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SEGUNDA REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("SEGUNDO REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4A. REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4O. REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV. REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4. REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4A REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4O REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("IV REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2A. REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2O. REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("4 REINOS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II. REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2. REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2A REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2O REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("II REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 REIS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 RE 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2KGS 1:1").osis()).toEqual("2Kgs.1.1")
		expect(p.parse("2 R 1:1").osis()).toEqual("2Kgs.1.1")
		`
		true
describe "Localized book 1Kgs (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Kgs (pt)", ->
		`
		expect(p.parse("Terceira Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Terceiro Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Primeira Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("Primeiro Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3a. Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3o. Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3a Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3o Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1a. Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1o. Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 Reinos 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1a Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1o Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I Reis 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 Re 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1Kgs 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 R 1:1").osis()).toEqual("1Kgs.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TERCEIRA REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("TERCEIRO REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRIMEIRA REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("PRIMEIRO REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III. REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3A. REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3O. REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("III REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3. REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3A REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3O REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1A. REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1O. REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("3 REINOS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1. REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1A REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1O REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I. REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("I REIS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 RE 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1KGS 1:1").osis()).toEqual("1Kgs.1.1")
		expect(p.parse("1 R 1:1").osis()).toEqual("1Kgs.1.1")
		`
		true
describe "Localized book 2Chr (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Chr (pt)", ->
		`
		expect(p.parse("Segunda Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Segunda Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Segundo Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("Segundo Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2a. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2a. Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o. Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2a Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2a Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2o Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cronicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Crônicas 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cron 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Crôn 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cro 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Crô 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 Cr 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2Chr 1:1").osis()).toEqual("2Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SEGUNDA CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SEGUNDO CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("SEGUNDO CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2A. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2A. CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O. CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II. CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2. CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2A CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2A CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2O CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("II CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRONICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRÔNICAS 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRON 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRÔN 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRO 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CRÔ 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2 CR 1:1").osis()).toEqual("2Chr.1.1")
		expect(p.parse("2CHR 1:1").osis()).toEqual("2Chr.1.1")
		`
		true
describe "Localized book 1Chr (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Chr (pt)", ->
		`
		expect(p.parse("Primeira Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Primeira Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Primeiro Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("Primeiro Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1a. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1a. Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o. Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1a Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1a Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1o Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Cronicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I Crônicas 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cron 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Crôn 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cro 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Crô 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 Cr 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1Chr 1:1").osis()).toEqual("1Chr.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRIMEIRA CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRIMEIRO CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("PRIMEIRO CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1A. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1A. CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O. CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1. CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1A CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1A CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1O CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I. CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I CRONICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("I CRÔNICAS 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRON 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRÔN 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRO 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CRÔ 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1 CR 1:1").osis()).toEqual("1Chr.1.1")
		expect(p.parse("1CHR 1:1").osis()).toEqual("1Chr.1.1")
		`
		true
describe "Localized book Ezra (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezra (pt)", ->
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
describe "Localized book Neh (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Neh (pt)", ->
		`
		expect(p.parse("Neemias 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Neh 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("Ne 1:1").osis()).toEqual("Neh.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NEEMIAS 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NEH 1:1").osis()).toEqual("Neh.1.1")
		expect(p.parse("NE 1:1").osis()).toEqual("Neh.1.1")
		`
		true
describe "Localized book GkEsth (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: GkEsth (pt)", ->
		`
		expect(p.parse("Ester (Grega) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester (grega) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester Grega 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Ester grega 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Est \(Gr\) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("Est (Gr) 1:1").osis()).toEqual("GkEsth.1.1")
		expect(p.parse("GkEsth 1:1").osis()).toEqual("GkEsth.1.1")
		`
		true
describe "Localized book Esth (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Esth (pt)", ->
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
describe "Localized book Job (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Job (pt)", ->
		`
		expect(p.parse("Job 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("Jó 1:1").osis()).toEqual("Job.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOB 1:1").osis()).toEqual("Job.1.1")
		expect(p.parse("JÓ 1:1").osis()).toEqual("Job.1.1")
		`
		true
describe "Localized book PrAzar (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: PrAzar (pt)", ->
		`
		expect(p.parse("Salmo de Azarias 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("Sal Azar 1:1").osis()).toEqual("PrAzar.1.1")
		expect(p.parse("PrAzar 1:1").osis()).toEqual("PrAzar.1.1")
		`
		true
describe "Localized book Ps (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ps (pt)", ->
		`
		expect(p.parse("Salmos 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Salmo 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sal 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Ps 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("Sl 1:1").osis()).toEqual("Ps.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SALMOS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SALMO 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SAL 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("PS 1:1").osis()).toEqual("Ps.1.1")
		expect(p.parse("SL 1:1").osis()).toEqual("Ps.1.1")
		`
		true
describe "Localized book Prov (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Prov (pt)", ->
		`
		expect(p.parse("Proverbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Provérbios 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prov 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pro 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Prv 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pr 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("Pv 1:1").osis()).toEqual("Prov.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PROVERBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROVÉRBIOS 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PROV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRO 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PRV 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PR 1:1").osis()).toEqual("Prov.1.1")
		expect(p.parse("PV 1:1").osis()).toEqual("Prov.1.1")
		`
		true
describe "Localized book Eccl (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eccl (pt)", ->
		`
		expect(p.parse("Eclesiastes 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Coelet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Coélet 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Eccl 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("Ecl 1:1").osis()).toEqual("Eccl.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ECLESIASTES 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("COELET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("COÉLET 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECCL 1:1").osis()).toEqual("Eccl.1.1")
		expect(p.parse("ECL 1:1").osis()).toEqual("Eccl.1.1")
		`
		true
describe "Localized book SgThree (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: SgThree (pt)", ->
		`
		expect(p.parse("Cantico dos Tres Jovens 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Cantico dos Três Jovens 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Cântico dos Tres Jovens 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Cântico dos Três Jovens 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Cantico dos 3 Jovens 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("Cântico dos 3 Jovens 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("SgThree 1:1").osis()).toEqual("SgThree.1.1")
		expect(p.parse("C3J 1:1").osis()).toEqual("SgThree.1.1")
		`
		true
describe "Localized book Song (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Song (pt)", ->
		`
		expect(p.parse("Canticos dos Canticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Canticos dos Cânticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cânticos dos Canticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cânticos dos Cânticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantico dos Canticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantico dos Cânticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cântico dos Canticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cântico dos Cânticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantares de Salomao 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantares de Salomão 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantico Superlativo 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cântico Superlativo 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantico de Salomao 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantico de Salomão 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cântico de Salomao 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cântico de Salomão 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cantares 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Canticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cânticos 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cant 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cânt 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Song 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Cnt 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("Ct 1:1").osis()).toEqual("Song.1.1")
		p.include_apocrypha(false)
		expect(p.parse("CANTICOS DOS CANTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICOS DOS CÂNTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICOS DOS CANTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICOS DOS CÂNTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICO DOS CANTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICO DOS CÂNTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICO DOS CANTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICO DOS CÂNTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTARES DE SALOMAO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTARES DE SALOMÃO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICO SUPERLATIVO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICO SUPERLATIVO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICO DE SALOMAO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICO DE SALOMÃO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICO DE SALOMAO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICO DE SALOMÃO 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTARES 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNTICOS 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CANT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CÂNT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("SONG 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CNT 1:1").osis()).toEqual("Song.1.1")
		expect(p.parse("CT 1:1").osis()).toEqual("Song.1.1")
		`
		true
describe "Localized book Jer (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jer (pt)", ->
		`
		expect(p.parse("Jeremias 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jer 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Je 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("Jr 1:1").osis()).toEqual("Jer.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JEREMIAS 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JER 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JE 1:1").osis()).toEqual("Jer.1.1")
		expect(p.parse("JR 1:1").osis()).toEqual("Jer.1.1")
		`
		true
describe "Localized book Ezek (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Ezek (pt)", ->
		`
		expect(p.parse("Ezequiel 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezek 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ezeq 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Eze 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("Ez 1:1").osis()).toEqual("Ezek.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EZEQUIEL 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEK 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZEQ 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZE 1:1").osis()).toEqual("Ezek.1.1")
		expect(p.parse("EZ 1:1").osis()).toEqual("Ezek.1.1")
		`
		true
describe "Localized book Dan (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Dan (pt)", ->
		`
		expect(p.parse("Daniel 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dan 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Da 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("Dn 1:1").osis()).toEqual("Dan.1.1")
		p.include_apocrypha(false)
		expect(p.parse("DANIEL 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DAN 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DA 1:1").osis()).toEqual("Dan.1.1")
		expect(p.parse("DN 1:1").osis()).toEqual("Dan.1.1")
		`
		true
describe "Localized book Hos (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hos (pt)", ->
		`
		expect(p.parse("Oseias 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Oséias 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Hos 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("Os 1:1").osis()).toEqual("Hos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OSEIAS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OSÉIAS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("HOS 1:1").osis()).toEqual("Hos.1.1")
		expect(p.parse("OS 1:1").osis()).toEqual("Hos.1.1")
		`
		true
describe "Localized book Joel (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Joel (pt)", ->
		`
		expect(p.parse("Joel 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("Jl 1:1").osis()).toEqual("Joel.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOEL 1:1").osis()).toEqual("Joel.1.1")
		expect(p.parse("JL 1:1").osis()).toEqual("Joel.1.1")
		`
		true
describe "Localized book Amos (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Amos (pt)", ->
		`
		expect(p.parse("Amos 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Amós 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("Am 1:1").osis()).toEqual("Amos.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AMOS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AMÓS 1:1").osis()).toEqual("Amos.1.1")
		expect(p.parse("AM 1:1").osis()).toEqual("Amos.1.1")
		`
		true
describe "Localized book Obad (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Obad (pt)", ->
		`
		expect(p.parse("Obadias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abdias 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obad 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Abd 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Oba 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Obd 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("Ob 1:1").osis()).toEqual("Obad.1.1")
		p.include_apocrypha(false)
		expect(p.parse("OBADIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABDIAS 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBAD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("ABD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBA 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OBD 1:1").osis()).toEqual("Obad.1.1")
		expect(p.parse("OB 1:1").osis()).toEqual("Obad.1.1")
		`
		true
describe "Localized book Jonah (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jonah (pt)", ->
		`
		expect(p.parse("Jonah 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jonas 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jon 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("Jn 1:1").osis()).toEqual("Jonah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JONAH 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JONAS 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JON 1:1").osis()).toEqual("Jonah.1.1")
		expect(p.parse("JN 1:1").osis()).toEqual("Jonah.1.1")
		`
		true
describe "Localized book Mic (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mic (pt)", ->
		`
		expect(p.parse("Miqueias 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miquéias 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mic 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Miq 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("Mq 1:1").osis()).toEqual("Mic.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MIQUEIAS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIQUÉIAS 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIC 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MIQ 1:1").osis()).toEqual("Mic.1.1")
		expect(p.parse("MQ 1:1").osis()).toEqual("Mic.1.1")
		`
		true
describe "Localized book Nah (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Nah (pt)", ->
		`
		expect(p.parse("Naum 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Nah 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("Na 1:1").osis()).toEqual("Nah.1.1")
		p.include_apocrypha(false)
		expect(p.parse("NAUM 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NAH 1:1").osis()).toEqual("Nah.1.1")
		expect(p.parse("NA 1:1").osis()).toEqual("Nah.1.1")
		`
		true
describe "Localized book Hab (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hab (pt)", ->
		`
		expect(p.parse("Habacuque 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Habacuc 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("Hab 1:1").osis()).toEqual("Hab.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HABACUQUE 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HABACUC 1:1").osis()).toEqual("Hab.1.1")
		expect(p.parse("HAB 1:1").osis()).toEqual("Hab.1.1")
		`
		true
describe "Localized book Zeph (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zeph (pt)", ->
		`
		expect(p.parse("Sofonias 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Zeph 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sof 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("Sf 1:1").osis()).toEqual("Zeph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SOFONIAS 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("ZEPH 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SOF 1:1").osis()).toEqual("Zeph.1.1")
		expect(p.parse("SF 1:1").osis()).toEqual("Zeph.1.1")
		`
		true
describe "Localized book Hag (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Hag (pt)", ->
		`
		expect(p.parse("Ageu 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Hag 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("Ag 1:1").osis()).toEqual("Hag.1.1")
		p.include_apocrypha(false)
		expect(p.parse("AGEU 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("HAG 1:1").osis()).toEqual("Hag.1.1")
		expect(p.parse("AG 1:1").osis()).toEqual("Hag.1.1")
		`
		true
describe "Localized book Zech (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Zech (pt)", ->
		`
		expect(p.parse("Zacarias 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zech 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zac 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("Zc 1:1").osis()).toEqual("Zech.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ZACARIAS 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZECH 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZAC 1:1").osis()).toEqual("Zech.1.1")
		expect(p.parse("ZC 1:1").osis()).toEqual("Zech.1.1")
		`
		true
describe "Localized book Mal (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mal (pt)", ->
		`
		expect(p.parse("Malaquias 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Mal 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("Ml 1:1").osis()).toEqual("Mal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MALAQUIAS 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("MAL 1:1").osis()).toEqual("Mal.1.1")
		expect(p.parse("ML 1:1").osis()).toEqual("Mal.1.1")
		`
		true
describe "Localized book Matt (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Matt (pt)", ->
		`
		expect(p.parse("Mateus 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Matt 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mat 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("Mt 1:1").osis()).toEqual("Matt.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MATEUS 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MATT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MAT 1:1").osis()).toEqual("Matt.1.1")
		expect(p.parse("MT 1:1").osis()).toEqual("Matt.1.1")
		`
		true
describe "Localized book 1Macc (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Macc (pt)", ->
		`
		expect(p.parse("Primeira Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("Primeiro Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1a. Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o. Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1. Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1a Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1o Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I. Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("I Macabeus 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mac 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1Macc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 Mc 1:1").osis()).toEqual("1Macc.1.1")
		expect(p.parse("1 M 1:1").osis()).toEqual("1Macc.1.1")
		`
		true
describe "Localized book 2Macc (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Macc (pt)", ->
		`
		expect(p.parse("Segunda Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("Segundo Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2a. Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o. Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II. Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2. Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2a Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2o Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("II Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Macabeus 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mac 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2Macc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 Mc 1:1").osis()).toEqual("2Macc.1.1")
		expect(p.parse("2 M 1:1").osis()).toEqual("2Macc.1.1")
		`
		true
describe "Localized book 3Macc (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3Macc (pt)", ->
		`
		expect(p.parse("Terceira Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("Terceiro Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III. Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3a. Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o. Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("III Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3. Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3a Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3o Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Macabeus 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mac 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3Macc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 Mc 1:1").osis()).toEqual("3Macc.1.1")
		expect(p.parse("3 M 1:1").osis()).toEqual("3Macc.1.1")
		`
		true
describe "Localized book 4Macc (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 4Macc (pt)", ->
		`
		expect(p.parse("Quarta Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("Quarto Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4a. Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o. Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV. Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4. Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4a Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4o Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("IV Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Macabeus 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mac 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4Macc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 Mc 1:1").osis()).toEqual("4Macc.1.1")
		expect(p.parse("4 M 1:1").osis()).toEqual("4Macc.1.1")
		`
		true
describe "Localized book Mark (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Mark (pt)", ->
		`
		expect(p.parse("Marcos 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mark 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mrc 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("Mc 1:1").osis()).toEqual("Mark.1.1")
		p.include_apocrypha(false)
		expect(p.parse("MARCOS 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MARK 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MRC 1:1").osis()).toEqual("Mark.1.1")
		expect(p.parse("MC 1:1").osis()).toEqual("Mark.1.1")
		`
		true
describe "Localized book Luke (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Luke (pt)", ->
		`
		expect(p.parse("Lucas 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luke 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Luc 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("Lc 1:1").osis()).toEqual("Luke.1.1")
		p.include_apocrypha(false)
		expect(p.parse("LUCAS 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUKE 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LUC 1:1").osis()).toEqual("Luke.1.1")
		expect(p.parse("LC 1:1").osis()).toEqual("Luke.1.1")
		`
		true
describe "Localized book 1John (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1John (pt)", ->
		`
		expect(p.parse("Primeira Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primeira João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primeiro Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("Primeiro João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1a. Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1a. João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o. João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1a Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1a João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1o João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I Joao 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I João 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1John 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 Jo 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 J 1:1").osis()).toEqual("1John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMEIRA JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMEIRO JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("PRIMEIRO JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1A. JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1A. JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O. JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1. JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1A JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1A JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1O JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I. JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOAO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("I JOÃO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1JOHN 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 JO 1:1").osis()).toEqual("1John.1.1")
		expect(p.parse("1 J 1:1").osis()).toEqual("1John.1.1")
		`
		true
describe "Localized book 2John (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2John (pt)", ->
		`
		expect(p.parse("Segunda Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segunda João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("Segundo João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2a. Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2a. João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o. João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2a Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2a João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2o João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Joao 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 João 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2John 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 Jo 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 J 1:1").osis()).toEqual("2John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDA JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("SEGUNDO JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2A. JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2A. JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O. JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II. JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2. JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2A JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2A JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2O JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("II JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOAO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JOÃO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2JOHN 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 JO 1:1").osis()).toEqual("2John.1.1")
		expect(p.parse("2 J 1:1").osis()).toEqual("2John.1.1")
		`
		true
describe "Localized book 3John (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 3John (pt)", ->
		`
		expect(p.parse("Terceira Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Terceira João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Terceiro Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("Terceiro João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3a. Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3a. João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o. João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3a Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3a João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3o João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Joao 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 João 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3John 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 Jo 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 J 1:1").osis()).toEqual("3John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TERCEIRA JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCEIRA JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCEIRO JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("TERCEIRO JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III. JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3A. JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3A. JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O. JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("III JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3. JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3A JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3A JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3O JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOAO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JOÃO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3JOHN 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 JO 1:1").osis()).toEqual("3John.1.1")
		expect(p.parse("3 J 1:1").osis()).toEqual("3John.1.1")
		`
		true
describe "Localized book John (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: John (pt)", ->
		`
		expect(p.parse("Joao 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("John 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("João 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("Jo 1:1").osis()).toEqual("John.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JOAO 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOHN 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JOÃO 1:1").osis()).toEqual("John.1.1")
		expect(p.parse("JO 1:1").osis()).toEqual("John.1.1")
		`
		true
describe "Localized book Acts (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Acts (pt)", ->
		`
		expect(p.parse("Atos dos Apostolos 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Atos dos Apóstolos 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Acts 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("Atos 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("At 1:1").osis()).toEqual("Acts.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ATOS DOS APOSTOLOS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ATOS DOS APÓSTOLOS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ACTS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("ATOS 1:1").osis()).toEqual("Acts.1.1")
		expect(p.parse("AT 1:1").osis()).toEqual("Acts.1.1")
		`
		true
describe "Localized book Rom (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Rom (pt)", ->
		`
		expect(p.parse("Romanos 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rom 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Rm 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("Ro 1:1").osis()).toEqual("Rom.1.1")
		p.include_apocrypha(false)
		expect(p.parse("ROMANOS 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("ROM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RM 1:1").osis()).toEqual("Rom.1.1")
		expect(p.parse("RO 1:1").osis()).toEqual("Rom.1.1")
		`
		true
describe "Localized book 2Cor (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Cor (pt)", ->
		`
		expect(p.parse("Segunda Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Segunda Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Segundo Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("Segundo Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2a. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2a. Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2o. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2o. Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2a Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2a Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2o Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2o Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Corintios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Coríntios 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Cor 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 Co 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2Cor 1:1").osis()).toEqual("2Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SEGUNDA CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SEGUNDO CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("SEGUNDO CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2A. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2A. CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2O. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2O. CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II. CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2. CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2A CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2A CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2O CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2O CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("II CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORINTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CORÍNTIOS 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 COR 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2 CO 1:1").osis()).toEqual("2Cor.1.1")
		expect(p.parse("2COR 1:1").osis()).toEqual("2Cor.1.1")
		`
		true
describe "Localized book 1Cor (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Cor (pt)", ->
		`
		expect(p.parse("Primeira Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Primeira Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Primeiro Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("Primeiro Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1a. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1a. Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1o. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1o. Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1a Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1a Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1o Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1o Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Corintios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I Coríntios 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Cor 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 Co 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1Cor 1:1").osis()).toEqual("1Cor.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRIMEIRA CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRIMEIRO CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("PRIMEIRO CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1A. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1A. CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1O. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1O. CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1. CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1A CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1A CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1O CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1O CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I. CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORINTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("I CORÍNTIOS 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 COR 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1 CO 1:1").osis()).toEqual("1Cor.1.1")
		expect(p.parse("1COR 1:1").osis()).toEqual("1Cor.1.1")
		`
		true
describe "Localized book Gal (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Gal (pt)", ->
		`
		expect(p.parse("Galatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gálatas 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gal 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("Gál 1:1").osis()).toEqual("Gal.1.1")
		p.include_apocrypha(false)
		expect(p.parse("GALATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GÁLATAS 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GAL 1:1").osis()).toEqual("Gal.1.1")
		expect(p.parse("GÁL 1:1").osis()).toEqual("Gal.1.1")
		`
		true
describe "Localized book Eph (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Eph (pt)", ->
		`
		expect(p.parse("Efesios 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Efésios 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Eph 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("Ef 1:1").osis()).toEqual("Eph.1.1")
		p.include_apocrypha(false)
		expect(p.parse("EFESIOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EFÉSIOS 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EPH 1:1").osis()).toEqual("Eph.1.1")
		expect(p.parse("EF 1:1").osis()).toEqual("Eph.1.1")
		`
		true
describe "Localized book Phil (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phil (pt)", ->
		`
		expect(p.parse("Filipenses 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Phil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fil 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("Fl 1:1").osis()).toEqual("Phil.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILIPENSES 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("PHIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FIL 1:1").osis()).toEqual("Phil.1.1")
		expect(p.parse("FL 1:1").osis()).toEqual("Phil.1.1")
		`
		true
describe "Localized book Col (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Col (pt)", ->
		`
		expect(p.parse("Colossenses 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Col 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("Cl 1:1").osis()).toEqual("Col.1.1")
		p.include_apocrypha(false)
		expect(p.parse("COLOSSENSES 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("COL 1:1").osis()).toEqual("Col.1.1")
		expect(p.parse("CL 1:1").osis()).toEqual("Col.1.1")
		`
		true
describe "Localized book 2Thess (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Thess (pt)", ->
		`
		expect(p.parse("Segunda Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("Segundo Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2a. Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o. Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2a Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2o Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tessalonicenses 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Tess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2Thess 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 Ts 1:1").osis()).toEqual("2Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("SEGUNDO TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2A. TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O. TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II. TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2. TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2A TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2O TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("II TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESSALONICENSES 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2THESS 1:1").osis()).toEqual("2Thess.1.1")
		expect(p.parse("2 TS 1:1").osis()).toEqual("2Thess.1.1")
		`
		true
describe "Localized book 1Thess (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Thess (pt)", ->
		`
		expect(p.parse("Primeira Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("Primeiro Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1a. Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o. Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1a Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1o Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I Tessalonicenses 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Tess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1Thess 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 Ts 1:1").osis()).toEqual("1Thess.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("PRIMEIRO TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1A. TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O. TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1. TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1A TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1O TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I. TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("I TESSALONICENSES 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1THESS 1:1").osis()).toEqual("1Thess.1.1")
		expect(p.parse("1 TS 1:1").osis()).toEqual("1Thess.1.1")
		`
		true
describe "Localized book 2Tim (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Tim (pt)", ->
		`
		expect(p.parse("Segunda Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Segunda Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Segundo Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("Segundo Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2a. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2a. Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2o. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2o. Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2a Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2a Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2o Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2o Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timoteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Timóteo 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Tim 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 Ti 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2Tim 1:1").osis()).toEqual("2Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SEGUNDA TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SEGUNDO TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("SEGUNDO TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2A. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2A. TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2O. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2O. TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II. TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2. TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2A TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2A TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2O TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2O TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("II TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMOTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIMÓTEO 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TIM 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2 TI 1:1").osis()).toEqual("2Tim.1.1")
		expect(p.parse("2TIM 1:1").osis()).toEqual("2Tim.1.1")
		`
		true
describe "Localized book 1Tim (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Tim (pt)", ->
		`
		expect(p.parse("Primeira Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Primeira Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Primeiro Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("Primeiro Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1a. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1a. Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1o. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1o. Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1a Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1a Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1o Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1o Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timoteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I Timóteo 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Tim 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 Ti 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1Tim 1:1").osis()).toEqual("1Tim.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRIMEIRA TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRIMEIRO TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("PRIMEIRO TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1A. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1A. TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1O. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1O. TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1. TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1A TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1A TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1O TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1O TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I. TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMOTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("I TIMÓTEO 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TIM 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1 TI 1:1").osis()).toEqual("1Tim.1.1")
		expect(p.parse("1TIM 1:1").osis()).toEqual("1Tim.1.1")
		`
		true
describe "Localized book Titus (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Titus (pt)", ->
		`
		expect(p.parse("Titus 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tito 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("Tit 1:1").osis()).toEqual("Titus.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TITUS 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TITO 1:1").osis()).toEqual("Titus.1.1")
		expect(p.parse("TIT 1:1").osis()).toEqual("Titus.1.1")
		`
		true
describe "Localized book Phlm (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Phlm (pt)", ->
		`
		expect(p.parse("Filemom 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filemon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Filémon 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flmn 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Phlm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Flm 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("Fmn 1:1").osis()).toEqual("Phlm.1.1")
		p.include_apocrypha(false)
		expect(p.parse("FILEMOM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILEMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FILÉMON 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLMN 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("PHLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FLM 1:1").osis()).toEqual("Phlm.1.1")
		expect(p.parse("FMN 1:1").osis()).toEqual("Phlm.1.1")
		`
		true
describe "Localized book Heb (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Heb (pt)", ->
		`
		expect(p.parse("Hebreus 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("Heb 1:1").osis()).toEqual("Heb.1.1")
		p.include_apocrypha(false)
		expect(p.parse("HEBREUS 1:1").osis()).toEqual("Heb.1.1")
		expect(p.parse("HEB 1:1").osis()).toEqual("Heb.1.1")
		`
		true
describe "Localized book Jas (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jas (pt)", ->
		`
		expect(p.parse("Tiago 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Jas 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("Tg 1:1").osis()).toEqual("Jas.1.1")
		p.include_apocrypha(false)
		expect(p.parse("TIAGO 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("JAS 1:1").osis()).toEqual("Jas.1.1")
		expect(p.parse("TG 1:1").osis()).toEqual("Jas.1.1")
		`
		true
describe "Localized book 2Pet (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 2Pet (pt)", ->
		`
		expect(p.parse("Segunda Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("Segundo Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2a. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2o. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2a Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2o Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pedro 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Ped 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 Pe 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2Pet 1:1").osis()).toEqual("2Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("SEGUNDA PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("SEGUNDO PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2A. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2O. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2. PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2A PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2O PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("II PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PEDRO 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PED 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2 PE 1:1").osis()).toEqual("2Pet.1.1")
		expect(p.parse("2PET 1:1").osis()).toEqual("2Pet.1.1")
		`
		true
describe "Localized book 1Pet (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: 1Pet (pt)", ->
		`
		expect(p.parse("Primeira Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("Primeiro Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1a. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1o. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1a Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1o Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I Pedro 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Ped 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 Pe 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1Pet 1:1").osis()).toEqual("1Pet.1.1")
		p.include_apocrypha(false)
		expect(p.parse("PRIMEIRA PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("PRIMEIRO PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1A. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1O. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1A PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1O PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I. PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("I PEDRO 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PED 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1 PE 1:1").osis()).toEqual("1Pet.1.1")
		expect(p.parse("1PET 1:1").osis()).toEqual("1Pet.1.1")
		`
		true
describe "Localized book Jude (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jude (pt)", ->
		`
		expect(p.parse("Judas 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jude 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("Jud 1:1").osis()).toEqual("Jude.1.1")
		p.include_apocrypha(false)
		expect(p.parse("JUDAS 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUDE 1:1").osis()).toEqual("Jude.1.1")
		expect(p.parse("JUD 1:1").osis()).toEqual("Jude.1.1")
		`
		true
describe "Localized book Tob (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Tob (pt)", ->
		`
		expect(p.parse("Tobias 1:1").osis()).toEqual("Tob.1.1")
		expect(p.parse("Tob 1:1").osis()).toEqual("Tob.1.1")
		`
		true
describe "Localized book Jdt (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Jdt (pt)", ->
		`
		expect(p.parse("Judite 1:1").osis()).toEqual("Jdt.1.1")
		expect(p.parse("Jdt 1:1").osis()).toEqual("Jdt.1.1")
		`
		true
describe "Localized book Bar (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Bar (pt)", ->
		`
		expect(p.parse("Baruque 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Baruc 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Baruk 1:1").osis()).toEqual("Bar.1.1")
		expect(p.parse("Bar 1:1").osis()).toEqual("Bar.1.1")
		`
		true
describe "Localized book Sus (pt)", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore",book_sequence_strategy: "ignore",osis_compaction_strategy: "bc",captive_end_digits_strategy: "delete"
		p.include_apocrypha true
	it "should handle book: Sus (pt)", ->
		`
		expect(p.parse("Historia de Susana 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("História de Susana 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Susana 1:1").osis()).toEqual("Sus.1.1")
		expect(p.parse("Sus 1:1").osis()).toEqual("Sus.1.1")
		`
		true

describe "Miscellaneous tests", ->
	p = {}
	beforeEach ->
		p = new bcv_parser
		p.set_options book_alone_strategy: "ignore", book_sequence_strategy: "ignore", osis_compaction_strategy: "bc", captive_end_digits_strategy: "delete"
		p.include_apocrypha true

	it "should handle ranges (pt)", ->
		expect(p.parse("Titus 1:1 á 2").osis()).toEqual "Titus.1.1-Titus.1.2"
		expect(p.parse("Matt 1á2").osis()).toEqual "Matt.1-Matt.2"
		expect(p.parse("Phlm 2 Á 3").osis()).toEqual "Phlm.1.2-Phlm.1.3"
	it "should handle chapters (pt)", ->
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
	it "should handle verses (pt)", ->
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
	it "should handle 'and' (pt)", ->
		expect(p.parse("Exod 1:1 e 3").osis()).toEqual "Exod.1.1,Exod.1.3"
		expect(p.parse("Phlm 2 E 6").osis()).toEqual "Phlm.1.2,Phlm.1.6"
	it "should handle titles (pt)", ->
		expect(p.parse("Ps 3 título, 4:2, 5:título").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TÍTULO, 4:2, 5:TÍTULO").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("Ps 3 titulo, 4:2, 5:titulo").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
		expect(p.parse("PS 3 TITULO, 4:2, 5:TITULO").osis()).toEqual "Ps.3.1,Ps.4.2,Ps.5.1"
	it "should handle 'ff' (pt)", ->
		expect(p.parse("Rev 3e sig., 4:2e sig.").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 E SIG., 4:2 E SIG.").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("Rev 3e sig, 4:2e sig").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
		expect(p.parse("REV 3 E SIG, 4:2 E SIG").osis()).toEqual "Rev.3-Rev.22,Rev.4.2-Rev.4.11"
	it "should handle translations (pt)", ->
		expect(p.parse("Lev 1 (NVI)").osis_and_translations()).toEqual [["Lev.1", "NVI"]]
		expect(p.parse("lev 1 nvi").osis_and_translations()).toEqual [["Lev.1", "NVI"]]
		expect(p.parse("Lev 1 (JFA)").osis_and_translations()).toEqual [["Lev.1", "JFA"]]
		expect(p.parse("lev 1 jfa").osis_and_translations()).toEqual [["Lev.1", "JFA"]]
		expect(p.parse("Lev 1 (BPT)").osis_and_translations()).toEqual [["Lev.1", "BPT"]]
		expect(p.parse("lev 1 bpt").osis_and_translations()).toEqual [["Lev.1", "BPT"]]
	it "should handle book ranges (pt)", ->
		p.set_options {book_alone_strategy: "full", book_range_strategy: "include"}
		expect(p.parse("Primeira á Terceira  João").osis()).toEqual "1John.1-3John.1"
		expect(p.parse("Primeira á Terceira  Joao").osis()).toEqual "1John.1-3John.1"
	it "should handle boundaries (pt)", ->
		p.set_options {book_alone_strategy: "full"}
		expect(p.parse("\u2014Matt\u2014").osis()).toEqual "Matt.1-Matt.28"
		expect(p.parse("\u201cMatt 1:1\u201d").osis()).toEqual "Matt.1.1"

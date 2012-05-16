bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\w\x1f\x1e] )	#beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
		(
			(?:	# inverted book/chapter (cb)
				  (?: (?: cap[íi]tulo | cap ) s? \s*
					\d+ \s* (?: [\u2013\u2014\-] | to | á ) \s* \d+ \s*
					(?: en | de ) (?: \s+ el \s+ libro \s+ de )? \s* )
				| (?: (?: cap[íi]tulo | cap ) s? \s*
					\d+ \s*
					(?: en | de ) (?: \s+ el \s+ libro \s+ de )? \s* )
				| (?: \d+ (?: th | nd | st ) \s*
					(?: cap[íi]tulo | cap ) \s* #no plurals here since it's a single chapter
					(?: en | de ) (?: \s+ el \s+ libro \s+ de )? \s* )
			)?
			\x1f(\d+)(?:/[a-z])?\x1f					#book
				(?:
				    cap (?: [íi] tulo )? s?		#chapter words
				  | /p\x1f								#special Psalm chapter
				  | [\d.:,;\x1e\x1f&\(\)\[\]/"'\*=~\-\u2013\u2014\s\u00a0]	#punctuation; grammar parser doesn't allow \s character class, but we do post-processing on the grammar file to allow it; the \u00a0 is for IE
				  | [a-e] (?! \w )						#a-e allows 1:1a
				  | ff?\b
				  | y (?! [a-z] )
				  | tít (?:ulo)? (?! [a-z] )						#could be followed by a number
				  | to
				  | á
				  | v (?:ers[íi]culos?|ers?|ss?|v)?				#verse words
				  | $									#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* tít (?:ulo | \.)?
	| \d+ \W* ff? (?: [\s\u00a0*]* \.)?
	| \d+ [\s\u00a0*]* [a-e] (?! \w )
	| \x1e (?: [\s\u00a0*]* [)\]] )?
	| [\d\x1f]+
	///gi
bcv_parser::regexps.space = "[\\s\\u00a0]"
bcv_parser::regexps.control = /[\x1e\x1f]/g

bcv_parser::regexps.first = "(?:1\\.?[ºo]|1|I|Primero?)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2\\.?[ºo]|2|II|Segundo)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3\\.?[ºo]|3|III|Tercero?)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.gospel = "(?:(?:The[.\\s\\u00a0-]*)?Gospel[.\\s\\u00a0-]?(?:of[.\\s\\u00a0-]*|according[\\s\\u00a0-]*?to[.\\s\\u00a0-]*)(?:[.\\s\\u00a0-]*?(?:Saint|St)[.\\s\\u00a0-]*)?|(?:(?:Saint|St)[.\\s\\u00a0-]*))?"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|and|through|to)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|through|to)"
# Each book regexp should return two parenthesized objects: an optional preliminary character and the book itself.
bcv_parser::regexps.books = [
	osis: ["Gen"]
	regexp: ///(\d|\b)(
		G[ée]nesis | G[ée]n | G[en]
		)(?:\b|(?=\d))///gi
,
	osis: ["Exod"]
	regexp: ///(\d|\b)(
		[ÉE]xodo | [ÉE]xo?d?
		)(?:\b|(?=\d))///gi
,
	osis: ["Lev"]
	regexp: ///(\d|\b)(
		Lev[íi]tico | Le?v
		)(?:\b|(?=\d))///gi
,
	osis: ["Num"]
	regexp: ///(\d|\b)(
		N[úu]meros | N[úu]m? | Nm
		)(?:\b|(?=\d))///gi
,
	osis: ["Deut"]
	regexp: ///(\d|\b)(
		D
		(?:
			  eut[eo]?rono?mio
			| ueteronomio
			| eut?
			| uet
			| t
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Josh"]
	regexp: ///(\d|\b)(
		Josu[ée] | Josh?
		)(?:\b|(?=\d))///gi
,
	osis: ["Judg"]
	regexp: ///(\d|\b)(
		Jueces | Juec? | Judg
		)(?:\b|(?=\d))///gi
,
	osis: ["Ruth"]
	regexp: ///(\d|\b)(
		Ruth | Rut | R[ut]
		)(?:\b|(?=\d))///gi
,
	osis: ["Isa"]
	regexp: ///(\d|\b)(
		Isa[íi]as | Isa?
		)(?:\b|(?=\d))///gi
,
	osis: ["2Sam"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second}
		(?:
			  Samu[ae]l[ls]?
			| Sam
			| Sma
			| S[am]?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["1Sam"]
	regexp: ///(\b)(
		  (?: #{bcv_parser::regexps.first} )? Samu[ae]l[ls]?
		| #{bcv_parser::regexps.first}
		  (?:
			  Sam
			| Sma
			| S[am]?
		  )
		)(?:\b|(?=\d))///gi
,
	osis: ["2Kgs"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second} Re?y?e?s? | 2Kgs
		)(?:\b|(?=\d))///gi
,
	osis: ["1Kgs"]
	regexp: ///(\b)(
		  (?: #{bcv_parser::regexps.first} )? Reyes
		| #{bcv_parser::regexps.first} Re?y?e?s?
		| 1Kgs
		)(?:\b|(?=\d))///gi
,
	osis: ["2Chr"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second} (?: Cr[óo]nicas | Cr[óo]n? | Chr | Cr )
		)(?:\b|(?=\d))///gi
,
	osis: ["1Chr"]
	regexp: ///(\b)(
		  (?:#{bcv_parser::regexps.first} )? Cr[óo]nicas
		| #{bcv_parser::regexps.first} (?: Cr[óo]n? | Chr | Cr )
		)(?:\b|(?=\d))///gi
,
	osis: ["Ezra"]
	regexp: ///(\d|\b)(
		Esdras | Ezra | Esd
		)(?:\b|(?=\d))///gi
,
	osis: ["Neh"]
	regexp: ///(\d|\b)(
		Nehem[íi]as | Neh?
		)(?:\b|(?=\d))///gi
,
	osis: ["Esth"]
	regexp: ///(\d|\b)(
		E
		(?:
			  ster
			| sth?
			| s
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Job"]
	regexp: ///(\d|\b)(
		Jo?b
		)(?:\b|(?=\d))///gi
,
	osis: ["Ps"]
	extra: "p"
	regexp: ///(\b)((?:
		  (?: (?: 1 [02-5] | [2-9] )? (?: 1 #{bcv_parser::regexps.space}* st | 2 #{bcv_parser::regexps.space}* nd | 3 #{bcv_parser::regexps.space}* rd ) ) # Allow 151st Psalm
		| 1? 1 [123] #{bcv_parser::regexps.space}* th
		| (?: 150 | 1 [0-4] [04-9] | [1-9] [04-9] | [4-9] )  #{bcv_parser::regexps.space}* th
		)
		#{bcv_parser::regexps.space}* Salmo
		)\b///gi
,
	osis: ["Ps"]
	regexp: ///(\d|\b)(
		Salmos? | Salm? | Ps
		)(?:\b|(?=\d))///gi
,
	osis: ["Prov"]
	regexp: ///(\d|\b)(
		  P
		  (?:
			  r[eo]?verbios?
			| robv?erbios
			| or?verbios
			| rovebios
			| rvbo?s?
			| ro?v?
			| v
		  )
		| Oroverbs
		)(?:\b|(?=\d))///gi
,
	osis: ["Eccl"]
	regexp: ///(\d|\b)(
		E
		(?:
			  cc?less?[ia]{1,4}s?t[ée]s?
			| cc?lesiastic?[ée]s
			| cc?les
			| ccl?
			| cl?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Song"]
	regexp: ///(\d|\b)(
		  (?: El #{bcv_parser::regexps.space}* )? Cantare #{bcv_parser::regexps.space}* de #{bcv_parser::regexps.space}* los #{bcv_parser::regexps.space}* Cantares | Cantares | Cant? | Cnt | Song
		)(?:\b|(?=\d))///gi
,
	osis: ["Jer"]
	regexp: ///(\d|\b)(
		  Jer
		  (?:
			  em[íi]as?
			| e?
		  )
		| J[er]
		)(?:\b|(?=\d))///gi
,
	osis: ["Lam"]
	regexp: ///(\d|\b)(
		L
		(?:
			  am[ei]ntaciones?
			| am?
			| m
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Ezek"]
	regexp: ///(\d|\b)(
		E
		(?:
			  [zx][ei]{1,2}qui?el
			| zequial
			| zequ?
			| zek
			| z[eq]?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Dan"]
	regexp: ///(\d|\b)(
		D
		(?:
			  aniel
			| a?n
			| [al]
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Hos"]
	regexp: ///(\d|\b)(
		Oseas | Hos | Os
		)(?:\b|(?=\d))///gi
,
	osis: ["Joel"]
	regexp: ///(\d|\b)(
		J
		(?:
		  	  oel?
			| l
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Amos"]
	regexp: ///(\d|\b)(
		Am[óo]?s?
		)(?:\b|(?=\d))///gi
,
	osis: ["Obad"]
	regexp: ///(\d|\b)(
		Abd[íi]as | Obad | Abd?
		)(?:\b|(?=\d))///gi
,
	osis: ["Jonah"]
	regexp: ///(\d|\b)(
		J
		(?:
			  on[áa][hs]
			| on
			| ns
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Mic"]
	regexp: ///(\d|\b)(
		Miqueas | Mi[cq]?
		)(?:\b|(?=\d))///gi
,
	osis: ["Nah"]
	regexp: ///(\d|\b)(
		N
		(?:
			  ah[úu]m?
			| ah?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Hab"]
	regexp: ///(\d|\b)(
		H
		(?:
			  abb?ac[au]c
			| abc?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Zeph"]
	regexp: ///(\d|\b)(
		Sofon[íi]as | So?f | Zeph
		)(?:\b|(?=\d))///gi
,
	osis: ["Hag"]
	regexp: ///(\d|\b)(
		Hageo | Hag
		)(?:\b|(?=\d))///gi
,
	osis: ["Zech"]
	regexp: ///(\d|\b)(
		Zacar[íi]as | Zacar | Zac | Zech
		)(?:\b|(?=\d))///gi
,
	osis: ["Mal"]
	regexp: ///(\d|\b)(
		Malaqu[íi]as | Malaqu | Mala?
		)(?:\b|(?=\d))///gi
,
	osis: ["Matt"]
	regexp: ///(\d|\b)(
		#{bcv_parser::regexps.gospel}
		(?:
			  Mateo
			| Matt?
			| Mt
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Mark"]
	regexp: ///(\d|\b)(
		#{bcv_parser::regexps.gospel}
		M
		(?:
		  	  a?rcos
			| ark
		  	| rc?
		  	| c
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Luke"]
	regexp: ///(\d|\b)(
		#{bcv_parser::regexps.gospel}
		L
		(?:
		  	  ucas
		  	| uke
		  	| uc?
			| c
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["1John"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.first}
		J
		(?:
		  	  [ua][ua]n
			| ohn
			| n
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["2John"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second}
		J
		(?:
		  	  [ua][ua]n
			| ohn
			| n
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["3John"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.third}
		J
		(?:
		  	  [ua][ua]n
			| ohn
			| n
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["John"]
	regexp: ///([04-9]|\b)(
		#{bcv_parser::regexps.gospel}
		J
		(?:
		  	  [ua][ua]n
			| ohn
			| n
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Acts"]
	regexp: ///(\d|\b)(
		Hechos | Acts | He?ch?
		)(?:\b|(?=\d))///gi
,
	osis: ["Rom"]
	regexp: ///(\d|\b)(
		R
		(?:
			  omanos?
			| pmanos
			| oamnos
			| om?s?
			| mn?s?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["2Cor"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second}
		C
		(?:
			  orintios
			| orint?i?
			| or?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["1Cor"]
	regexp: ///(\b)(
		  (?: #{bcv_parser::regexps.first} )? Corintios
		| #{bcv_parser::regexps.first} C
		  (?:
			  orintios
			| orint?i?
			| or?
		  )
		)(?:\b|(?=\d))///gi
,
	osis: ["Gal"]
	regexp: ///(\d|\b)(
		G[áa]latas | G[áa]lat | G[áa]l
		)(?:\b|(?=\d))///gi
,
	osis: ["Eph"]
	regexp: ///(\d|\b)(
		Efesios | Efes | Eph | Ef
		)(?:\b|(?=\d))///gi
,
	osis: ["Phil"]
	regexp: ///(\d|\b)(
		Filipenses | Filip? | Phil | Fil
		)(?:\b|(?=\d))///gi
,
	osis: ["Col"]
	regexp: ///(\d|\b)(
		Colosenses | Colos | Col
		)(?:\b|(?=\d))///gi
,
	osis: ["2Thess"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second} T
		(?:
			  esalonicenses
			| hess
			| e?s
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["1Thess"]
	regexp: ///(\b)(
		(?: #{bcv_parser::regexps.first} )? Tesalonicenses
		| #{bcv_parser::regexps.first} T
			(?:
				  hess
				| e?s
			)
		)(?:\b|(?=\d))///gi
,
	osis: ["2Tim"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second} T
		(?:
			  imoteo
			| omoteo
			| im?
			| m
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["1Tim"]
	regexp: ///(\b)(
		  (?: #{bcv_parser::regexps.first} )? Timoteo
		| #{bcv_parser::regexps.first} T
			(?:
				  imoteo
				| omoteo
				| im?
				| m
			)
		)(?:\b|(?=\d))///gi
,
	osis: ["Titus"]
	regexp: ///(\d|\b)(
		T
		(?:
			  ito
			| itus
			| it?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Phlm"]
	regexp: ///(\d|\b)(
		Filem[óo]n | Phlm | Flmn?
		)(?:\b|(?=\d))///gi
,
	osis: ["Heb"]
	regexp: ///(\d|\b)(
		H
		(?:
			  eb[reo]{1,3}s
			| ebreo
			| ebr
			| eb?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["Jas"]
	regexp: ///(\d|\b)(
		Santiago | Sant | Stg | Jas
		)(?:\b|(?=\d))///gi
,
	osis: ["2Pet"]
	regexp: ///(\b)(
		#{bcv_parser::regexps.second} P
		(?:
			  edro
			| e[dt]
			| e?
		)
		)(?:\b|(?=\d))///gi
,
	osis: ["1Pet"]
	regexp: ///(\b)(
		  (?: #{bcv_parser::regexps.first} )? Pedro
		| #{bcv_parser::regexps.first} P
			(?:
				  e[dt]
				| e?
			)
		)(?:\b|(?=\d))///gi
,
	osis: ["Jude"]
	regexp: ///(\d|\b)(
		Ju?das | Jude? | Jd
		)(?:\b|(?=\d))///gi
,
	osis: ["Rev"]
	regexp: ///(\d|\b)(
		Apocalipsis | Apoc | Rev | Ap
		)(?:\b|(?=\d))///gi
,
	osis: ["Hab", "Hag"]
	regexp: ///(\d|\b)(
		Ha
		)(?:\b|(?=\d))///gi
,
	osis: ["Heb", "Hab"]
	regexp: ///(\d|\b)(
		Hb
		)(?:\b|(?=\d))///gi
,
	osis: ["Jonah", "Job", "Joel"]
	regexp: ///(\d|\b)(
		Jo
		)(?:\b|(?=\d))///gi
,
	osis: ["Jude", "Judg"]
	regexp: ///(\d|\b)(
		Ju
		)(?:\b|(?=\d))///gi
,
	osis: ["Matt", "Mark", "Mal"]
	regexp: ///(\d|\b)(
		Ma
		)(?:\b|(?=\d))///gi
,
	osis: ["Phil", "Phlm"]
	regexp: ///(\d|\b)(
		Fil
		)(?:\b|(?=\d))///gi
]
bcv_parser::regexps.apocrypha = [
	osis: ["Tob"]
	apocrypha: true
	regexp: ///(\d|\b)(
		Tobi?t?
		)(?:\b|(?=d))///gi
,
	osis: ["Jdt"]
	apocrypha: true
	regexp: ///(\d|\b)(
		Ju?di?t
		)(?:\b|(?=d))///gi
,
	osis: ["GkEsth"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  Ester #{bcv_parser::regexps.space}* \(?Griego\)?
		| GkEsth
		)(?:\b|(?=d))///gi
,
	osis: ["Wis"]
	apocrypha: true
	regexp: ///(\d|\b)(
		Sabidur[íi]a | Wis | Sab
		)(?:\b|(?=d))///gi
,
	osis: ["Sir"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  Sir[áa]cida
		| Sir[áa]c
		| Sir
		| Eclesi[áa]stico
		| Ecclus
		)(?:\b|(?=d))///gi
,
	osis: ["Bar"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  Baruc
		| Bar
		)(?:\b|(?=d))///gi
,
	osis: ["PrAzar"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  (?: Oraci[óo]n | Cántico ) de Azar[íi]as
		| Azar[íi]as
		| PrAzar
		)(?:\b|(?=d))///gi
,
	osis: ["Sus"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  Susana
		| Sus
		)(?:\b|(?=d))///gi
,
	osis: ["Bel"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  Bel #{bcv_parser::regexps.space}* (?: y | & ) #{bcv_parser::regexps.space}* (?: (?: el | la ) #{bcv_parser::regexps.space}* )? (?: Drag[óo]n | Serpiente )
		| Bel
		)(?:\b|(?=d))///gi
,
	osis: ["SgThree"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  Canto #{bcv_parser::regexps.space}* de #{bcv_parser::regexps.space}* los #{bcv_parser::regexps.space}* (?: Tres | 3 ) #{bcv_parser::regexps.space}* J[óo]venes (?: #{bcv_parser::regexps.space}* Jud[íi]os | #{bcv_parser::regexps.space}* Hebreos )?
		| (?: Tres | 3 ) J[óo]venes
		| SgThree
		)(?:\b|(?=d))///gi
,
	osis: ["EpJer"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  (?: La #{bcv_parser::regexps.space}* )? Carta #{bcv_parser::regexps.space}* (?: de #{bcv_parser::regexps.space}* )? Jerem[íi]as
		| EpJer
		)(?:\b|(?=d))///gi
,
	osis: ["2Macc"]
	apocrypha: true
	regexp: ///(\b)(
		  #{bcv_parser::regexps.second} Mac{1,3} (?: ab{1,3} e{1,3} os? )?
		| 2 #{bcv_parser::regexps.space}* Mc
		)(?:\b|(?=d))///gi
,
	osis: ["3Macc"]
	apocrypha: true
	regexp: ///(\b)(
		  #{bcv_parser::regexps.third} Mac{1,3} (?: ab{1,3} e{1,3} os? )?
		| 3 #{bcv_parser::regexps.space}* Mc
		)(?:\b|(?=d))///gi
,
	osis: ["4Macc"]
	apocrypha: true
	regexp: ///(\b)(
		  (?: 4 \.? [ºo] | 4 | IV | Cuarto ) \.?#{bcv_parser::regexps.space}* Mac{1,3} (?: ab{1,3} e{1,3} os? )?
		| 4 #{bcv_parser::regexps.space}* Mc
		)(?:\b|(?=d))///gi
,
	osis: ["1Macc"]
	apocrypha: true
	regexp: ///(\b)(
		  (?: #{bcv_parser::regexps.first} )? Macabeos
		| #{bcv_parser::regexps.first} Mac{1,3} (?: ab{1,3} e{1,3} os? )?
		| 1 #{bcv_parser::regexps.space}* Mc
		)(?:\b|(?=d))///gi
,
	osis: ["1Esd"]
	apocrypha: true
	regexp: ///(\b)(
		  #{bcv_parser::regexps.first} Esdras
		| 1 #{bcv_parser::regexps.space}* Esdr?
		)(?:\b|(?=d))///gi
,
	osis: ["2Esd"]
	apocrypha: true
	regexp: ///(\b)(
		  #{bcv_parser::regexps.second} Esdras
		| 2 #{bcv_parser::regexps.space}* Esdr?
		)(?:\b|(?=d))///gi
,
	osis: ["PrMan"]
	apocrypha: true
	regexp: ///(\d|\b)(
		  (?: La #{bcv_parser::regexps.space}* )? Oraci[óo]n #{bcv_parser::regexps.space}* (?: de #{bcv_parser::regexps.space}*)? Manas[ée]s
		| PrMan
		)(?:\b|(?=d))///gi
]
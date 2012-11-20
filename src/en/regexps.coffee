bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\w\x1f\x1e] )	#beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
		(
			(?:	# inverted book/chapter (cb)
				  (?: ch (?: apters? | a?pts?\.? | a?p?s?\.? )? \s*
					\d+ \s* (?: [\u2013\u2014\-] | through | thru | to) \s* \d+ \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )?\s* )
				| (?: ch (?: apters? | a?pts?\.? | a?p?s?\.? )? \s*
					\d+ \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )?\s* )
				| (?: \d+ (?: th | nd | st ) \s*
					ch (?: apter | a?pt\.? | a?p?\.? )? \s* #no plurals here since it's a single chapter
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )? \s* )
			)?
			\x1f(\d+)(?:/[a-z])?\x1f					#book
				(?:
				    c (?:f|ompare
				  	  | h (?:apters?|a?pts?|a?p?s?)		#chapter words
				  	  )
				  | a (?:nd|lso)						#combiners
				  | /p\x1f								#special Psalm chapter
				  | [\d.:,;\x1e\x1f&\(\)\[\]/"'\*=~\-\u2013\u2014\s\xa0]	#punctuation; grammar parser doesn't allow \s character class, but we do post-processing on the grammar file to allow it; the \xa0 is for IE
				  | [a-e] (?! \w )						#a-e allows 1:1a
				  | ff?\b
				  | see
				  | title (?! [a-z] )						#could be followed by a number
				  | thr (?:ough|u)
				  | to
				  | v (?:erses?|er|ss?|v)?				#verse words
				  | $									#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* title
	| \d+ \W* ff? (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]] )?
	| [\d\x1f]+
	///gi
bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.control = /[\x1e\x1f]/g

bcv_parser::regexps.first = "(?:1st|1|I|First)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2nd|2|II|Second)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3rd|3|III|Third)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.fourth = "(?:4th|4|IV|Fourth)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.gospel = "(?:(?:The[.\\s\\xa0-]*)?Gospel[.\\s\\xa0-]?(?:of[.\\s\\xa0-]*|according[\\s\\xa0-]*?to[.\\s\\xa0-]*)(?:[.\\s\\xa0-]*?(?:Saint|St)[.\\s\\xa0-]*)?|(?:(?:Saint|St)[.\\s\\xa0-]*))?"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|and|through|to)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|through|to)"
# Each book regexp should return two parenthesized objects: an optional preliminary character and the book itself.
bcv_parser::regexps.get_books = (include_apocrypha) ->
	books = [
		osis: ["Gen"]
		regexp: ///(\d|\b)(
			  Ge
			  (?:
			  	  nn?[ei][ei]?s[eiu]s
				| nn?[es]is
				| nes[ei]
				| n
			  )
			| G[en]
			)(?:\b|(?=\d))///gi
	,
		osis: ["Exod"]
		regexp: ///(\d|\b)(
			Ex
			(?:
				  od[ui]s
				| od[se]
				| od
				| [do]?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Lev"]
		regexp: ///(\d|\b)(
			L
			(?:
				  [ei]v[ei]t[ei]?cus
				| evi
				| ev
				| [ev]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Num"]
		regexp: ///(\d|\b)(
			N
			(?:
				  umbers?
				| umb?
				| [um]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Deut"]
		regexp: ///(\d|\b)(
			D
			(?:
				  eut[eo]?rono?my
				| ueteronomy
				| eut?
				| uet
				| t
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Josh"]
		regexp: ///(\d|\b)(
			J
			(?:
				  ou?sh?ua
				| o?sh
				| os
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Judg"]
		regexp: ///(\d|\b)(
			J
			(?:
				  udges
				| udg
				| d?gs?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Ruth"]
		regexp: ///(\d|\b)(
			R
			(?:
				  uth?
				| th
				| u
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Isa"]
		regexp: ///(\d|\b)(
			I
			(?:
				  saiah
				| sais?ha?
				| s[ai]{2,}ha?
				| s[is]ah
				| sa[hi]?
				| sa?
				| a
			)
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
				| Kingdoms
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
				| Kingdoms
			  )
			)(?:\b|(?=\d))///gi
	,
		osis: ["2Kgs"]
		regexp: ///(\b)(
			  #{bcv_parser::regexps.second} Ki?n?g?s?
			| #{bcv_parser::regexps.fourth} Kingdoms
			)(?:\b|(?=\d))///gi
	,
		osis: ["1Kgs"]
		regexp: ///(\b)(
			  (?: #{bcv_parser::regexps.first} )? K (?: i?ngs | in | gs )
			| #{bcv_parser::regexps.first} Ki?n?g?s?
			| #{bcv_parser::regexps.third} Kingdoms
			)(?:\b|(?=\d))///gi
	,
		osis: ["2Chr"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.second}
			  (?:
				  Ch?o?ron[io]cles?
				| Chronicals
				| Chro?n?
				| Cron
				| Paralipomenon
			  )
			|
			  # 2-Ch can also overlap with something like "Gen 1:2-Ch 7", which should be Gen.1.2-Gen.7. The non-digits ("II", etc.) are unlikely to be combined with such a short abbreviation
			  2 #{bcv_parser::regexps.space}* Ch
			)(?:\b|(?=\d))///gi
	,
		osis: ["1Chr"]
		regexp: ///(\b)(
			  (?:#{bcv_parser::regexps.first} )?
				(?:
					  Ch?o?ron[io]cles?
					| Chronicals
					| Paralipomenon
				)
			| #{bcv_parser::regexps.first}
			  (?:
				  Chro?n?
				| Cron
			  )
			| 1 #{bcv_parser::regexps.space}* Ch

			)(?:\b|(?=\d))///gi
	,
		osis: ["Ezra"]
		regexp: ///(\d|\b)(
			E
			(?:
				  zra?
				| sra
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Neh"]
		regexp: ///(\d|\b)(
			N
			(?:
				  eh[ei]m[ai]{1,3}h
				| eh?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  Greek #{bcv_parser::regexps.space}* Esther
			| Esther #{bcv_parser::regexps.space}* \(Greek\)
			| G (?: ree )? k #{bcv_parser::regexps.space}* Esth?
			)(?:\b|(?=d))///gi
	,
		osis: ["Esth"]
		regexp: ///(\d|\b)(
			E
			(?:
				  sth?er
				| sth?
				| s
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Job"]
		regexp: ///(\d|\b)(
			Jo?b
			)(?:\b|(?=\d))///gi
		###
	,
		osis: ["Ps151"]
		apocrypha: true
		extra: "p"
		regexp: ///(\b)(
			  151 #{bcv_parser::regexps.space}* st #{bcv_parser::regexps.space}* Psalm
			)\b///gi
		###
	,
		osis: ["Ps"]
		extra: "p"
		regexp: ///(\b)((?:
			  (?: (?: 1 [02-5] | [2-9] )? (?: 1 #{bcv_parser::regexps.space}* st | 2 #{bcv_parser::regexps.space}* nd | 3 #{bcv_parser::regexps.space}* rd ) ) # Allow 151st Psalm
			| 1? 1 [123] #{bcv_parser::regexps.space}* th
			| (?: 150 | 1 [0-4] [04-9] | [1-9] [04-9] | [4-9] )  #{bcv_parser::regexps.space}* th
			)
			#{bcv_parser::regexps.space}* Psalm
			)\b///gi
		###
	,
		osis: ["Ps151"]
		apocrypha: true
		regexp: ///(\d|\b)(
			P
			(?:
				  s[alm]{2,4}s?
				| a[slm]{3,4}s?
				| l[sam]{2,4}s?
				| s[as]?m?
			) #{bcv_parser::regexps.space}* 151
			)\b///gi
		###
	,
		osis: ["Ps"]
		regexp: ///(\d|\b)(
			P
			(?:
				  s[alm]{2,4}s?
				| a[slm]{3,4}s?
				| l[sam]{2,4}s?
				| s[as]?m?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Prov"]
		regexp: ///(\d|\b)(
			  P
			  (?:
				  r[eo]?verbs?
				| robv?erbs
				| or?verbs
				| rovebs
				| rvbs?
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
				  cc?less?[ia]{1,4}s?tes?
				| cclesiastic?es
				| ccles
				| ccl?
				| cl?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  (?: The #{bcv_parser::regexps.space}* )? Song #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* (?:the #{bcv_parser::regexps.space}* )? (?: 3 | Three ) #{bcv_parser::regexps.space}* (?: Holy #{bcv_parser::regexps.space}* Children | Young #{bcv_parser::regexps.space}* Men | Youths | Jews )
			| S \.?#{bcv_parser::regexps.space}* (?: of )? #{bcv_parser::regexps.space}* (?: Three | Th | 3 ) \.?#{bcv_parser::regexps.space}* (?: Ch | Y )
			| So?n?gThree
			)(?:\b|(?=d))///gi
	,
		osis: ["Song"]
		regexp: ///(\d|\b)(
			  (?:The #{bcv_parser::regexps.space}*)? Songs? #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* (?: S[ao]lom[ao]ns? | Songs? )
			| (?:
					S
					(?:
						  n?gs?
						| ongs?
						| #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* S
						| o?S
						| o[ln]?
					)
			  )
			)(?:\b|(?=\d))///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  (?: The #{bcv_parser::regexps.space}* )? (?: Ep(?:istle)? | Let(?:ter) ) \.?#{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* Jeremiah
			| EpJer
			)(?:\b|(?=d))///gi
	,
		osis: ["Jer"]
		regexp: ///(\d|\b)(
			  Jer
			  (?:
				  emaiah
				| [ae]maih
				| [ae]miha
				| [aei]mi[ai]h
				| [ei]mi?ah
				| [ai]mih
				| [ae]mia
				| [am][im]ah
				| emi[he]?
				| e?
			  )
			| J[er]
			)(?:\b|(?=\d))///gi
	,
		osis: ["Lam"]
		regexp: ///(\d|\b)(
			L
			(?:
				  am[ei]ntations?
				| am?
				| m
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Ezek"]
		regexp: ///(\d|\b)(
			E
			(?:
				  [zx][ei]{1,2}ki?el
				| zekial
				| zek
				| z[ek]
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
			H
			(?:
				  osea
				| o?s
				| os?
			)
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
			Amo?s?
			)(?:\b|(?=\d))///gi
	,
		osis: ["Obad"]
		regexp: ///(\d|\b)(
			O
			(?:
				  badiah?
				| bidah
				| ba?d?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Jonah"]
		regexp: ///(\d|\b)(
			J
			(?:
				  onah
				| on
				| nh
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Mic"]
		regexp: ///(\d|\b)(
			M
			(?:
				  ich?ah?
				| ic?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Nah"]
		regexp: ///(\d|\b)(
			N
			(?:
				  ahum?
				| ah?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Hab"]
		regexp: ///(\d|\b)(
			H
			(?:
				  abb?akk?[au]kk?
				| abk?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Zeph"]
		regexp: ///(\d|\b)(
			Z
			(?:
				  ephana?iah?
				| e?ph?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Hag"]
		regexp: ///(\d|\b)(
			H
			(?:
				  agg?ai
				| aggia[ih]
				| a?gg?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Zech"]
		regexp: ///(\d|\b)(
			Z
			(?:
				  [ae]ch[ae]r[ai]{1,2}h
				| ach?
				| e?ch?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Mal"]
		regexp: ///(\d|\b)(
			M
			(?:
				  alachi?
				| alichi
				| alaci
				| al
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Matt"]
		regexp: ///(\d|\b)(
			#{bcv_parser::regexps.gospel}
			M
			(?:
			  	  at[th]{1,3}i?ew
				| atthwe
				| a?tt?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Mark"]
		regexp: ///(\d|\b)(
			#{bcv_parser::regexps.gospel}
			M
			(?:
			  	  a?rk?
				| k
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Luke"]
		regexp: ///(\d|\b)(
			#{bcv_parser::regexps.gospel}
			L
			(?:
			  	  uke?
				| [uk]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["1John"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.first}
			J
			(?:
			  	  o?phn
				| [ho][ho]n
				| onh
				| ohm
				| hn
				| o[hn]? #Jon is OK here because it's prepended by a number
				| [hn]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["2John"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.second}
			J
			(?:
			  	  o?phn
				| [ho][ho]n
				| onh
				| ohm
				| hn
				| o[hn]? #Jon is OK here because it's prepended by a number
				| [hn]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["3John"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.third}
			J
			(?:
			  	  o?phn
				| [ho][ho]n
				| onh
				| ohm
				| hn
				| o[hn]? #Jon is OK here because it's prepended by a number
				| [hn]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["John"]
		regexp: ///([04-9]|\b)(
			#{bcv_parser::regexps.gospel}
			J
			(?:
			  	  o?phn
				| [ho][ho]n
				| onh
				| ohm
				| hn
				| oh
				| [hn]
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Acts"]
		regexp: ///(\d|\b)(
			A
			(?:
				cts #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* the #{bcv_parser::regexps.space}* Apostles
				| cts*
				| ct?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Rom"]
		regexp: ///(\d|\b)(
			R
			(?:
				  omans?
				| pmans
				| oamns
				| omands
				| omasn
				| om?s?
				| mn?s?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["2Cor"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.second} C
			(?:
				  h?orr?[in]{1,3}th[aio]{1,3}ns
				| orin[ai]?th[ai]{1,3}n[aio]{0,3}s
				| orinti[ao]ns
				| orinthian
				| orthians?
				| orint?h?
				| orth
				| or?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["1Cor"]
		regexp: ///(\b)(
			  (?: #{bcv_parser::regexps.first} )? C
				(?:
					  h?orr?[in]{1,3}th[aio]{1,3}ns
					| orin[ai]?th[ai]{1,3}n[aio]{0,3}s
					| orinti[ao]ns
				)
			| #{bcv_parser::regexps.first} C
			  (?:
				  orinthian
				| orthians?
				| orint?h?
				| orth
				| or?
			  )
			)(?:\b|(?=\d))///gi
	,
		osis: ["Gal"]
		regexp: ///(\d|\b)(
			G
			(?:
				  alatians?
				| all?at[aino]{1,4}s
				| alat?
				| al?
				| l
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Eph"]
		regexp: ///(\d|\b)(
			E
			(?:
				  phesians?
				| phi?sians?
				| phesains?
				| sphesians
				| pehesians
				| h?pesians
				| phesiand
				| phesions
				| alat?
				| phe?s?
				| ph?
				| hp
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Phil"]
		regexp: ///(\d|\b)(
			P
			(?:
				  hil{1,}i?p{1,}[aei]{1,3}ns?
				| hi?li?p{0,2}
				| hil?
				| hp
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Col"]
		regexp: ///(\d|\b)(
			C
			(?:
				  [ao]ll?[ao]ss?i[ao]ns
				| olossi?ans?
				| ol?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["2Thess"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.second} T
			(?:
				  hess?[aeo]lon[ieaoc]{1,4}ns?
				| he?s{1,3}
				| h
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["1Thess"]
		regexp: ///(\b)(
			(?: #{bcv_parser::regexps.first} )? Thess?[aeo]lon[ieaoc]{1,4}ns?
			| #{bcv_parser::regexps.first} T
				(?:
					  he?s{1,3}
					| h
				)
			)(?:\b|(?=\d))///gi
	,
		osis: ["2Tim"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.second} T
			(?:
				  imothy?
				| himoth?y
				| omothy
				| imoty
				| im?
				| m
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["1Tim"]
		regexp: ///(\b)(
			  (?: #{bcv_parser::regexps.first} )? Timothy?
			| #{bcv_parser::regexps.first} T
				(?:
				  himoth?y
				| omothy
				| imoty
				| im?
				| m
				)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Titus"]
		regexp: ///(\d|\b)(
			T
			(?:
				  itus
				| it?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Phlm"]
		regexp: ///(\d|\b)(
			Ph
			(?:
				  ilemon
				| l?mn?
				| ilem?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Heb"]
		regexp: ///(\d|\b)(
			H
			(?:
				  eb[rew]{1,3}s
				| [ew]{0,2}brew{1,2}s
				| ebrew
				| eb
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Jas"]
		regexp: ///(\d|\b)(
			J
			(?:
				  ames?
				| a[ms]?
				| ms?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["2Pet"]
		regexp: ///(\b)(
			#{bcv_parser::regexps.second} P
			(?:
				  eter?
				| e?t?r?
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["1Pet"]
		regexp: ///(\b)(
			  (?: #{bcv_parser::regexps.first} )? Peter
			| #{bcv_parser::regexps.first} P
				(?:
				  eter?
				| e?t?r?
				)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Jude"]
		regexp: ///(\d|\b)(
			Ju?de
			)(?:\b|(?=\d))///gi
	,
		osis: ["Rev"]
		regexp: ///(\d|\b)(
			R
			(?:
				  ev[aeo]?lations?
				| evel
				| e?v
				| e
			)
			)(?:\b|(?=\d))///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  Tobi?t?
			| Tb
			)(?:\b|(?=d))///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(\d|\b)(
			Ju?di?th?
			)(?:\b|(?=d))///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  (?: The #{bcv_parser::regexps.space}*) Wisd? (?: om )? #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* Solomon
			| Wisdom
			| Wisd?
			)(?:\b|(?=d))///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  Sirach
			| Sir
			| Eccl[eu]siasticus
			| Ecclus
			| Eccs
			| (?: The #{bcv_parser::regexps.space}* ) Wisdom #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* Jesus #{bcv_parser::regexps.space}* (?: Son #{bcv_parser::regexps.space}* of | ben ) #{bcv_parser::regexps.space}* Sirach
			)(?:\b|(?=d))///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  Baruch
			| Bar
			)(?:\b|(?=d))///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  (?: The #{bcv_parser::regexps.space}* )? Pr (?: ayers? )? #{bcv_parser::regexps.space}* of #{bcv_parser::regexps.space}* Azariah?
			| Azariah?
			| PrAza?r
			)(?:\b|(?=d))///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  Susannah?
			| Shoshana
			| Sus
			)(?:\b|(?=d))///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(\d|\b)(
			  Bel #{bcv_parser::regexps.space}* (?: and | & ) #{bcv_parser::regexps.space}* (?: the #{bcv_parser::regexps.space}* )? (?: Dragon | Serpent | Snake )
			| Bel
			)(?:\b|(?=d))///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(\b)(
			  #{bcv_parser::regexps.second} Mac{1,3} (?: ab{1,3} e{1,3} s? )?
			| 2 #{bcv_parser::regexps.space}* Mc
			)(?:\b|(?=d))///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(\b)(
			  #{bcv_parser::regexps.third} Mac{1,3} (?: ab{1,3} e{1,3} s? )?
			| 3 #{bcv_parser::regexps.space}* Mc
			)(?:\b|(?=d))///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(\b)(
			  #{bcv_parser::regexps.fourth} #{bcv_parser::regexps.space}* Mac{1,3} (?: ab{1,3} e{1,3} s? )?
			| 4 #{bcv_parser::regexps.space}* Mc
			)(?:\b|(?=d))///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(\b)(
			  (?: #{bcv_parser::regexps.first} )? Mac{1,3}ab{1,3} e{1,3} s?
			| #{bcv_parser::regexps.first} Mac{1,3}
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
			(?: (?: The #{bcv_parser::regexps.space}*) Pr (?: ayers? )? #{bcv_parser::regexps.space}* (?: of #{bcv_parser::regexps.space}* )? M[ae]n{1,2}[ae]s{1,2}[ae]h
			)
			| PrMan
			)(?:\b|(?=d))///gi
	,
		osis: ["Ezek", "Ezra"]
		regexp: ///(\d|\b)(
			Ez
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
		osis: ["John", "Jonah", "Job", "Josh", "Joel"]
		regexp: ///(\d|\b)(
			Jo
			)(?:\b|(?=\d))///gi
	,
		osis: ["Jude", "Judg"]
		regexp: ///(\d|\b)(
			Jd
			)(?:\b|(?=\d))///gi
	,
		osis: ["Jude", "Judg"]
		regexp: ///(\d|\b)(
			Jud
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
			Ph
			)(?:\b|(?=\d))///gi
	,
		osis: ["Zeph", "Zech"]
		regexp: ///(\d|\b)(
			Ze
			)(?:\b|(?=\d))///gi
	]
	# Short-circuit the look if we know we want all the books.
	return books if include_apocrypha is true
	# Filter out books in the Apocrypha if we don't want them. `Array.map` isn't supported below IE9.
	out = []
	for book in books
		continue if book.apocrypha? and book.apocrypha is true
		out.push book
	out

# Default to not using the Apocrypha
bcv_parser::regexps.books = bcv_parser::regexps.get_books false
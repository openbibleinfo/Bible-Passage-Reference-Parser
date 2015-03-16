bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
		(
			# Start inverted book/chapter (cb)
			(?:
				  (?: ch (?: apters? | a?pts?\.? | a?p?s?\.? )? \s*
					\d+ \s* (?: [\u2013\u2014\-] | through | thru | to) \s* \d+ \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )?\s* )
				| (?: ch (?: apters? | a?pts?\.? | a?p?s?\.? )? \s*
					\d+ \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )?\s* )
				| (?: \d+ (?: th | nd | st ) \s*
					ch (?: apter | a?pt\.? | a?p?\.? )? \s* #no plurals here since it's a single chapter
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )? \s* )
			)? # End inverted book/chapter (cb)
			\x1f(\d+)(?:/\d+)?\x1f		#book
				(?:
				    /\d+\x1f				#special Psalm chapters
				  | [\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014]
				  | johdannolla (?! [a-z] )		#could be followed by a number
				  | ja(?![a-z]) | jakeissa | jakeet | luvut | luvun | luku | vrt | ss | –
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* johdannolla
	| \d \W* ss (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Ensimm[äa]inen|1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Toinen|2|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Kolmas|3|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:ja(?![a-z])|vrt)|–)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|–)"
# Each book regexp should return two parenthesized objects: an optional preliminary character and the book itself.
bcv_parser::regexps.get_books = (include_apocrypha, case_sensitive) ->
	books = [
		osis: ["Ps"]
		apocrypha: true
		extra: "2"
		regexp: ///(\b)( # Don't match a preceding \d like usual because we only want to match a valid OSIS, which will never have a preceding digit.
			Ps151
			# Always follwed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
			)(?=\.1)///g # Case-sensitive because we only want to match a valid OSIS.
	,
		osis: ["Gen"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|I(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|1(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Moos(?:eksen(?:[\s\xa0]*kirja)?)?)|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|II(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|2(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Moos(?:eksen(?:[\s\xa0]*kirja)?)?)|Exod)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*ja[\s\xa0]*lohik[aä](?:[aä]rme))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kolmas[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|III(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|3(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Moos(?:eksen(?:[\s\xa0]*kirja)?)?)|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:IV(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|4(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Moos(?:eksen(?:[\s\xa0]*kirja)?)?)|N(?:elj(?:[aä]s[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|um))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Je(?:esus[\s\xa0]*Siirakin[\s\xa0]*kirja|sus[\s\xa0]*Siirakin[\s\xa0]*kirja)|Si(?:irakin(?:[\s\xa0]*kirja)?|r(?:akin(?:[\s\xa0]*kirja)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Salomon[\s\xa0]*viisaus|Viis(?:auden[\s\xa0]*kirja)?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Valit(?:usvirret)?|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremian[\s\xa0]*kirje|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Johanneksen[\s\xa0]*ilmestys|Ilm(?:estys(?:kirja)?)?|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Man(?:assen[\s\xa0]*rukouksen|[\s\xa0]*ru)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:V(?:iides[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?)|5(?:\.[\s\xa0]*Mooseksen(?:[\s\xa0]*kirja)?|[\s\xa0]*Moos(?:eksen(?:[\s\xa0]*kirja)?)?)|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jo(?:os(?:uan(?:[\s\xa0]*kirja)?)?|sh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|Tuom(?:arien(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ru(?:th|ut(?:in(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		1Esd|(?:Ensimm[aä]inen[\s\xa0]*Esra|I(?:\.[\s\xa0]*Esra|[\s\xa0]*Esra)|1(?:\.[\s\xa0]*Esra|[\s\xa0]*Es(?:ra)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		2Esd|(?:Toinen[\s\xa0]*Esra|II(?:\.[\s\xa0]*Esra|[\s\xa0]*Esra)|2(?:\.[\s\xa0]*Esra|[\s\xa0]*Es(?:ra)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isa|Jes(?:ajan(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?|II(?:\.[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?|[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?)|2(?:\.[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?|[\s\xa0]*Sam(?:uelin(?:[\s\xa0]*kirja)?)?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?)|I(?:\.[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?|[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?)|1(?:\.[\s\xa0]*Samuelin(?:[\s\xa0]*kirja)?|[\s\xa0]*Sam(?:uelin(?:[\s\xa0]*kirja)?)?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?|II(?:\.[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?|[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?)|2(?:\.[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?|[\s\xa0]*Kun(?:inkaiden(?:[\s\xa0]*kirja)?)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?)|I(?:\.[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?|[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?)|1(?:\.[\s\xa0]*Kuninkaiden(?:[\s\xa0]*kirja)?|[\s\xa0]*Kun(?:inkaiden(?:[\s\xa0]*kirja)?)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*Aikakirja|II(?:\.[\s\xa0]*Aikakirja|[\s\xa0]*Aikakirja)|2(?:\.[\s\xa0]*Aikakirja|[\s\xa0]*Aik(?:ak(?:irja)?)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm[aä]inen[\s\xa0]*Aikakirja|I(?:\.[\s\xa0]*Aikakirja|[\s\xa0]*Aikakirja)|1(?:\.[\s\xa0]*Aikakirja|[\s\xa0]*Aik(?:ak(?:irja)?)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:zra|sr(?:a(?:n(?:[\s\xa0]*kirja)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:emian(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:GkEsth|Kr(?:eikkalainen[\s\xa0]*Esterin(?:[\s\xa0]*kirja)?|\.[\s\xa0]*Est|[\s\xa0]*Est))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:erin(?:[\s\xa0]*kirja)?|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Job(?:in(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ps(?:almi(?:en(?:[\s\xa0]*kirja)?|t)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Asar(?:jan[\s\xa0]*rukous|[\s\xa0]*ru)|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prov|S(?:ananl(?:asku(?:jen(?:[\s\xa0]*kirja)?|t))?|nl))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|Saar(?:n(?:aaja(?:n(?:[\s\xa0]*kirja)?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kolmen[\s\xa0]*(?:nuoren[\s\xa0]*miehen(?:[\s\xa0]*ollessa[\s\xa0]*tulisessa[\s\xa0]*p[aä]tsiss[aä])?|miehen(?:[\s\xa0]*kiitosvirsi(?:[\s\xa0]*tulessa)?)?)|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Korkea[\s\xa0]*veisu|Laul(?:ujen[\s\xa0]*laulu|\.[\s\xa0]*l|[\s\xa0]*l)|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jer(?:emian(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ezek|Hes(?:ekielin(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Dan(?:ielin(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ho(?:os(?:ean(?:[\s\xa0]*kirja)?)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Joel(?:in(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		A(?:mos|am(?:oksen(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ob(?:ad(?:j(?:an(?:[\s\xa0]*kirja)?)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jo(?:nah|on(?:a(?:n(?:[\s\xa0]*kirja)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:ik(?:a(?:n(?:[\s\xa0]*kirja)?)?)?|c)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Nah(?:umin(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:akukin(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|Sef(?:anjan(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hag(?:g(?:ain(?:[\s\xa0]*kirja)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zech|Sak(?:arjan(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:akian(?:[\s\xa0]*kirja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evankeliumi[\s\xa0]*Matteuksen[\s\xa0]*mukaan|Matt(?:euksen(?:[\s\xa0]*evankeliumi)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evankeliumi[\s\xa0]*Markuksen[\s\xa0]*mukaan|Mark(?:uksen(?:[\s\xa0]*evankeliumi)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evankeliumi[\s\xa0]*Luukkaan[\s\xa0]*mukaan|Lu(?:ke|uk(?:kaan(?:[\s\xa0]*evankeliumi)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		1John|(?:Ensimm(?:[aä]inen[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?)|I(?:\.[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?|[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?)|1(?:\.[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?|[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		2John|(?:Toinen[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?|II(?:\.[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?|[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?)|2(?:\.[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?|[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		3John|(?:Kolmas[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?|III(?:\.[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?|[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?)|3(?:\.[\s\xa0]*Johanneksen(?:[\s\xa0]*kirje)?|[\s\xa0]*Joh(?:anneksen(?:[\s\xa0]*kirje)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evankeliumi[\s\xa0]*Johanneksen[\s\xa0]*mukaan|Joh(?:anneksen(?:[\s\xa0]*evankeliumi)?|n)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Teot|A(?:cts|p(?:ostolien[\s\xa0]*teot|[\s\xa0]*t|\.(?:[\s\xa0]*t|t)|t)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*roomalaisille|Ro(?:om(?:alais(?:kirje|ille))?|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille))|II(?:\.[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille))|[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille)))|2(?:\.[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille))|[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|or(?:intt(?:olaiskirje|ilaisille))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille)))|I(?:\.[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille))|[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille)))|1(?:\.[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|orintt(?:olaiskirje|ilaisille))|[\s\xa0]*K(?:irje[\s\xa0]*korinttilaisille|or(?:intt(?:olaiskirje|ilaisille))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*galatalaisille|Gal(?:atalais(?:ille|kirj))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*efesolaisille|E(?:ph|f(?:esolais(?:kirje|ille))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*filippil[aä]isille|Phil|Fil(?:ippil(?:[aä]is(?:kirje|ille)))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Col|K(?:irje[\s\xa0]*kolossalaisille|ol(?:ossalais(?:kirje|ille))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille))|II(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille))|[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille)))|2(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille))|[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tess(?:alonikalais(?:kirje|ille))?)|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille)))|I(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille))|[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille)))|1(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tessalonikalais(?:kirje|ille))|[\s\xa0]*(?:Kirje[\s\xa0]*tessalonikalaisille|Tess(?:alonikalais(?:kirje|ille))?)|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje))|II(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje))|[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje)))|2(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje))|[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Tim(?:oteu(?:kselle|skirje))?)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje)))|I(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje))|[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje)))|1(?:\.[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Timoteu(?:kselle|skirje))|[\s\xa0]*(?:Kirje[\s\xa0]*Timoteukselle|Tim(?:oteu(?:kselle|skirje))?)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*Titukselle|Tit(?:u(?:kselle|s))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*Filemonille|Filem(?:onille)?|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kirje[\s\xa0]*he[bp]realaisille|He(?:pr(?:ealais(?:kirje|ille))?|br?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ja(?:ak(?:obin(?:[\s\xa0]*kirje)?)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?|II(?:\.[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?|[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?)|2(?:\.[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?|[\s\xa0]*Piet(?:arin(?:[\s\xa0]*kirje)?)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm(?:[aä]inen[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?)|I(?:\.[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?|[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?)|1(?:\.[\s\xa0]*Pietarin(?:[\s\xa0]*kirje)?|[\s\xa0]*Piet(?:arin(?:[\s\xa0]*kirje)?)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ju(?:de|ud(?:aksen(?:[\s\xa0]*kirje)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tob(?:i(?:tin(?:[\s\xa0]*kirja)?|a(?:an(?:[\s\xa0]*kirja)?|n(?:[\s\xa0]*kirja)?)))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:dt|ud(?:itin(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ba(?:arukin(?:[\s\xa0]*kirja)?|r(?:ukin(?:[\s\xa0]*kirja)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sus(?:anna(?:[\s\xa0]*ja[\s\xa0]*vanhimmat)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Toinen[\s\xa0]*makkabilaiskirja|II(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makkabilaiskirja)|2(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makk(?:abilaiskirja)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kolmas[\s\xa0]*makkabilaiskirja|III(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makkabilaiskirja)|3(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makk(?:abilaiskirja)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Nelj[aä]s[\s\xa0]*makkabilaiskirja|IV(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makkabilaiskirja)|4(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makk(?:abilaiskirja)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ensimm[aä]inen[\s\xa0]*makkabilaiskirja|I(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makkabilaiskirja)|1(?:\.[\s\xa0]*makkabilaiskirja|[\s\xa0]*makk(?:abilaiskirja)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	]
	# Short-circuit the look if we know we want all the books.
	return books if include_apocrypha is true and case_sensitive is "none"
	# Filter out books in the Apocrypha if we don't want them. `Array.map` isn't supported below IE9.
	out = []
	for book in books
		continue if include_apocrypha is false and book.apocrypha? and book.apocrypha is true
		if case_sensitive is "books"
			book.regexp = new RegExp book.regexp.source, "g"
		out.push book
	out

# Default to not using the Apocrypha
bcv_parser::regexps.books = bcv_parser::regexps.get_books false, "none"

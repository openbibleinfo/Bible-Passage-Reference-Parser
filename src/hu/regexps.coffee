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
				  | c[íi]m (?! [a-z] )		#could be followed by a number
				  | fejezet[ée]ben | versekre | fejezet | k[öo]v | versek | [ée]s | v[öo] | vagy | vers | fej | kk
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* c[íi]m
	| \d \W* kk (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Els[őo]|1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:M[áa]sodik|2|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Harmadik|3|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:[ée]s|v[öo]|vagy)|k[öo]v)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|k[öo]v)"
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
		(?:Els[oő][\s\xa0]*M(?:[oó]zes)|I(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M[oó]zes)|M[oó]zes[\s\xa0]*I|1(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M(?:(?:[oó]z(?:es)?)|z))|Gen|Ter(?:emt[eé]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M[oó]zes)|M(?:[aá]sodik[\s\xa0]*M(?:[oó]zes)|[oó]zes[\s\xa0]*II)|2(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M(?:(?:[oó]z(?:es)?)|z))|Exod|Kiv(?:onul[aá]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		B(?:a[aá]l[\s\xa0]*(?:[eé]s[\s\xa0]*a[\s\xa0]*s(?:[aá]rk(?:[aá]ny)))|[eé]l[\s\xa0]*(?:[eé]s[\s\xa0]*a[\s\xa0]*s(?:[aá]rk(?:[aá]ny))))|B(?:[eé]l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Harmadik[\s\xa0]*M[oó]zes|III(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M[oó]zes)|M[oó]zes[\s\xa0]*III|3(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M(?:(?:[oó]z(?:es)?)|z))|Lev(?:it[aá]k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:IV(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M[oó]zes)|M[oó]zes[\s\xa0]*IV|4(?:\.[\s\xa0]*M[oó]zes|[\s\xa0]*M(?:(?:[oó]z(?:es)?)|z))|Sz(?:[aá]m(?:ok)?)|Num)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Salamon[\s\xa0]*b[oö]lcsess(?:[eé]ge)|B[oö]lcs(?:ess(?:[eé]g)?)|Wis)|B(?:[oö]lcs)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremi(?:[aá]s[\s\xa0]*sir(?:almai)?)|Siral(?:m(?:ak)?)?|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sir(?:[aá]k[\s\xa0]*fia)|(?:Ecclesiasticus|Sir[aá]k[\s\xa0]*b(?:[oö]lcsess(?:[eé]ge))?)|Sir
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremi[aá]s[\s\xa0]*levele|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Apokalipszis|J(?:[aá]nos[\s\xa0]*jelen(?:[eé]sei)|el(?:en[eé]sek)?)|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Manass(?:[eé][\s\xa0]*im(?:[aá]ds(?:[aá]ga))|ze[\s\xa0]*im[aá]ja)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*t(?:[oö]rv(?:[eé]nyk(?:[oö]nyv)))|[oó]zes[\s\xa0]*(?:(?:[oö]t(?:[oö]dik[\s\xa0]*k(?:[oö]nyve))|V))|T[oö]rv)|5[\s\xa0]*M(?:(?:[oó]z(?:es)?)|z)|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:o(?:sh|zs(?:u[eé])?)|ózs(?:u[eé])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|B(?:[ií]r(?:[aá]k)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ruth?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:E(?:ls[oő][\s\xa0]*Ezd(?:r(?:[aá]s)?)|zdr[aá]s[\s\xa0]*I)|I(?:\.[\s\xa0]*Ezd(?:r[aá]s)?|[\s\xa0]*Ezd(?:r[aá]s)?)|1(?:\.[\s\xa0]*Ezd(?:r[aá]s)?|[\s\xa0]*Ezd(?:r[aá]s)?|Esd))|Els(?:[oő][\s\xa0]*Ezd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M[aá]sodik[\s\xa0]*Ezd(?:r(?:[aá]s)?)|Ezdr[aá]s[\s\xa0]*II|II(?:\.[\s\xa0]*Ezd(?:r[aá]s)?|[\s\xa0]*Ezd(?:r[aá]s)?)|2(?:\.[\s\xa0]*Ezd(?:r[aá]s)?|[\s\xa0]*Ezd(?:r[aá]s)?|Esd))|M(?:[aá]sodik[\s\xa0]*Ezd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[EÉ](?:sai(?:[aá]s|zs(?:ai[aá]s)?))|I(?:sa|z(?:aj[aá]s)?))|[EÉ]zs(?:ai(?:[aá]s)?)|(?:[EÉ]zs)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*S(?:[aá]m(?:uel)?))|S[aá]muel[\s\xa0]*II|II(?:\.[\s\xa0]*S(?:[aá]m(?:uel)?)|[\s\xa0]*S(?:[aá]m(?:uel)?))|2(?:\.[\s\xa0]*S(?:[aá]m(?:uel)?)|[\s\xa0]*S(?:[aá]m(?:uel)?)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Els(?:[oő][\s\xa0]*S(?:[aá]m(?:uel)?))|S[aá]muel[\s\xa0]*I|I(?:\.[\s\xa0]*S(?:[aá]m(?:uel)?)|[\s\xa0]*S(?:[aá]m(?:uel)?))|1(?:\.[\s\xa0]*S(?:[aá]m(?:uel)?)|[\s\xa0]*S(?:[aá]m(?:uel)?)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kir[aá]lyok[\s\xa0]*II|M(?:[aá]sodik[\s\xa0]*Kir(?:[aá]lyok)?)|II(?:\.[\s\xa0]*Kir(?:[aá]lyok)?|[\s\xa0]*Kir(?:[aá]lyok)?)|2(?:\.[\s\xa0]*Kir(?:[aá]lyok)?|[\s\xa0]*Kir(?:[aá]lyok)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kir[aá]lyok[\s\xa0]*I|Els(?:[oő][\s\xa0]*Kir(?:[aá]lyok)?)|I(?:\.[\s\xa0]*Kir(?:[aá]lyok)?|[\s\xa0]*Kir(?:[aá]lyok)?)|1(?:\.[\s\xa0]*Kir(?:[aá]lyok)?|[\s\xa0]*Kir(?:[aá]lyok)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*Kr(?:[oó]n(?:ika)?))|Kr[oó]nik(?:[aá]k[\s\xa0]*II)|II(?:\.[\s\xa0]*Kr(?:[oó]n(?:ika)?)|[\s\xa0]*Kr(?:[oó]n(?:ika)?))|2(?:\.[\s\xa0]*Kr(?:[oó]n(?:ika)?)|[\s\xa0]*Kr(?:[oó]n(?:ika)?)|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kr[oó]nik(?:[aá]k[\s\xa0]*I)|Els(?:[oő][\s\xa0]*Kr(?:[oó]n(?:ika)?))|I(?:\.[\s\xa0]*Kr(?:[oó]n(?:ika)?)|[\s\xa0]*Kr(?:[oó]n(?:ika)?))|1(?:\.[\s\xa0]*Kr(?:[oó]n(?:ika)?)|[\s\xa0]*Kr(?:[oó]n(?:ika)?)|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:ra|sd(?:r[aá]s)?|d)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:emi[aá]s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eszter[\s\xa0]*k[oö]nyv(?:[eé]nek[\s\xa0]*kieg(?:[eé]sz(?:[ií]t(?:[eé]se))))|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Es(?:th|zt(?:er)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:[oó]b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zsolt(?:[aá]rok)?|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Az[aá]ri(?:[aá]s[\s\xa0]*im(?:[aá](?:ds(?:[aá]ga|ja))))|PrAzar)|Az[aá]ri(?:[aá]s[\s\xa0]*im(?:[aá]ja))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		P(?:[eé]ld(?:abesz(?:[eé]dek)?)|rov)|P(?:[eé]ld)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|Pr[eé]d(?:ik(?:[aá]tor)?))|Pr(?:[eé]d)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H[aá]rom[\s\xa0]*fiatalember[\s\xa0]*(?:[eé]neke)|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:alamon[\s\xa0]*[eé]neke|ong)|[EÉ]n(?:ekek[\s\xa0]*(?:[eé]neke)?))|(?:[EÉ]n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jer(?:emi[aá]s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:ékiel|ek(?:iel)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:[aá]n(?:iel)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H[oó]s(?:e(?:[aá]s)?)|Oz(?:e[aá]s)?)|H(?:[oó]s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ó[eé]l|o(?:[eé]l)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[AÁ]m(?:osz?|ós)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad|Abd(?:i[aá]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:on(?:a[hs]|ás)?|ón(?:[aá]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:c|k(?:e[aá]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:[aá]h(?:um)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:ak(?:kuk|uk))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:ofoni[aá]s|z(?:efani[aá]s|of(?:oni[aá]s)?))|Z(?:of[oó]ni(?:[aá]s)|eph))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag(?:g(?:eus|ai))?|Ag(?:geus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ech|ak(?:ari[aá]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:aki[aá]s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:at[eté]|át[eé]|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:[aá]rk|k)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:uk(?:[aá]cs|e)|k)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Els[oő][\s\xa0]*J(?:(?:[aá]nos|n))|J[aá]nos[\s\xa0]*I|1(?:\.[\s\xa0]*J(?:[aá]nos|n)|John|[\s\xa0]*J(?:[aá]nos|n))|I(?:\.[\s\xa0]*J(?:[aá]nos|n)|[\s\xa0]*J(?:[aá]nos|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M[aá]sodik[\s\xa0]*J(?:(?:[aá]nos|n))|J[aá]nos[\s\xa0]*II|II(?:\.[\s\xa0]*J(?:[aá]nos|n)|[\s\xa0]*J(?:[aá]nos|n))|2(?:\.[\s\xa0]*J(?:[aá]nos|n)|John|[\s\xa0]*J(?:[aá]nos|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Harmadik[\s\xa0]*J(?:[aá]nos|n)|J[aá]nos[\s\xa0]*III|III(?:\.[\s\xa0]*J(?:[aá]nos|n)|[\s\xa0]*J(?:[aá]nos|n))|3(?:\.[\s\xa0]*J(?:[aá]nos|n)|John|[\s\xa0]*J(?:[aá]nos|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:[aá]nos|ohn|n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Cselekedetek|A(?:z[\s\xa0]*(?:apostolok[\s\xa0]*cselekedetei|ApCsel)|p(?:ostolok(?:[\s\xa0]*cselekedetei)?|\.[\s\xa0]*Csel|[\s\xa0]*Csel|Csel)|cts))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:[oó]m(?:a(?:iakhoz)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?)|II(?:\.[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?|[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?)|2(?:\.[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?|[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Els(?:[oő][\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?)|I(?:\.[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?|[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?)|1(?:\.[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?|[\s\xa0]*Kor(?:int(?:hus(?:iakhoz)?|usi))?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Gal(?:at(?:ákhoz|a(?:khoz)?))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:ph(?:eszosziakhoz)?|f(?:ézusiakhoz|ezus(?:iakhoz)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil(?:ippibeliekhez)?|F(?:lippiekhez|il(?:ippi(?:ekhez)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Col|Kol(?:oss(?:z(?:ébeliekhez|e(?:beliekhez|ieknek))|(?:[eé](?:iakhoz)?)))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?))|II(?:\.[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?)|[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?))|2(?:\.[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?)|[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?)|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Els(?:[oő][\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?))|I(?:\.[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?)|[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?))|1(?:\.[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?)|[\s\xa0]*T(?:hessz(?:alonika(?:iakhoz)?)?|essz(?:alonika(?:iakhoz)?)?)|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?)|II(?:\.[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?|[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?)|2(?:\.[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?|[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Els(?:[oő][\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?)|I(?:\.[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?|[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?)|1(?:\.[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?|[\s\xa0]*Tim(?:[oó]t(?:heosz|eus(?:hoz|nak)?))?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tit(?:us(?:hoz|z(?:hoz)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filem(?:on(?:hoz)?)?|Ph(?:ilemonhoz|lm))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Zsid[oó]khoz[\s\xa0]*(?:[ií]rt[\s\xa0]*lev(?:[eé]l))|(?:Zsid(?:[oó]k(?:hoz)?)?|H(?:éber[\s\xa0]*lev[eé]l|eb(?:er[\s\xa0]*lev[eé]l)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ja(?:k(?:ab)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:[aá]sodik[\s\xa0]*P(?:[eé]t(?:er)?))|II(?:\.[\s\xa0]*P(?:[eé]t(?:er)?)|[\s\xa0]*P(?:[eé]t(?:er)?))|2(?:\.[\s\xa0]*P(?:[eé]t(?:er)?)|[\s\xa0]*P(?:[eé]t(?:er)?)|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Els(?:[oő][\s\xa0]*P(?:[eé]t(?:er)?))|I(?:\.[\s\xa0]*P(?:[eé]t(?:er)?)|[\s\xa0]*P(?:[eé]t(?:er)?))|1(?:\.[\s\xa0]*P(?:[eé]t(?:er)?)|[\s\xa0]*P(?:[eé]t(?:er)?)|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ud(?:[aá]s|e)?|úd(?:[aá]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T[oó]b(?:i(?:[aá]s)?)|T(?:[oó]b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:udit|dt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		B(?:[aá]r(?:uk)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zsuz(?:s(?:anna(?:[\s\xa0]*[eé]s[\s\xa0]*a[\s\xa0]*v(?:[eé]nek))?)?)?|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:M(?:a(?:kkabeusok[\s\xa0]*II|sodik[\s\xa0]*Mak(?:kabeusok)?)|ásodik[\s\xa0]*Mak(?:kabeusok)?)|II(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?)|2(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Makkabeusok[\s\xa0]*III|Harmadik[\s\xa0]*Mak(?:kabeusok)?|III(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?)|3(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Makkabeusok[\s\xa0]*IV|IV(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?)|4(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Makkabeusok[\s\xa0]*I|Els(?:[oő][\s\xa0]*Mak(?:kabeusok)?)|1(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?|Macc)|I(?:\.[\s\xa0]*Mak(?:kabeusok)?|[\s\xa0]*Mak(?:kabeusok)?))
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

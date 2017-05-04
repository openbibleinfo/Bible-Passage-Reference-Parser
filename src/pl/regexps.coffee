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
				  | [\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014]
				  | tytuł (?! [a-z] )		#could be followed by a number
				  | rozdział[óo]w | werset[óo]w | rozdziały | rozdział | n(?![n]) | wersety | werset | rozdz | oraz | wers | por | rr | nn | do | r | i | w
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* tytuł
	| \d \W* n(?![n]) (?: [\s\xa0*]* \.)?
	| \d \W* nn (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Pierwsza|Pierwsze|Pierwszy|1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Druga|Drugi|2|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Trzecia|Trzeci|3|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:oraz|por|i)|do)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|do)"
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
		(?:[1I][\s\xa0]*Moj[zż](?:eszowa)?)|(?:[1I][\s\xa0]*Ks(?:\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|i[eę]g[ai][\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Rodzaju|Genezis|Ro?dz|I[\s\xa0]*Moj|1[\s\xa0]*Moj|1[\s\xa0]*M|Gen|[1I]\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|i[eę]g[ai][\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż]eszowa|[zż]))|Pierwsz[aey][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|i[eę]g[ai][\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż]eszowa|[zż])))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Moj[zż](?:eszowa)?|Exodus|2[\s\xa0]*Moj|II[\s\xa0]*Moj[zż](?:eszowa)?)|(?:Ks(?:\.[\s\xa0]*Wyj[sś]|[\s\xa0]*Wyj[sś]|i[eę]g[ai][\s\xa0]*Wyj[sś])cia|Exod|Wj|2[\s\xa0]*M|Wyj|II[\s\xa0]*Moj|Ex|(?:II|2)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|(?:II|2)\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż]))|Drug[ai][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż])))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Opowiadaniem[\s\xa0]*o[\s\xa0]*Belu[\s\xa0]*i[\s\xa0]*w[eę][zż]u|Bel(?:a[\s\xa0]*i[\s\xa0]*w[eę][zż]a)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:III[\s\xa0]*Moj[zż]|3[\s\xa0]*Moj[zż])eszowa)|(?:K(?:ap[lł]|p[lł])|Lev|3[\s\xa0]*Moj[zż]|III[\s\xa0]*Moj[zż]|3[\s\xa0]*M(?:oj)?|III[\s\xa0]*Moj|Ks(?:\.[\s\xa0]*Kapła[nń]|[\s\xa0]*Kapła[nń]|i[eę]g[ai][\s\xa0]*Kapła[nń])ska|(?:III|3)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|(?:III|3)\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż]))|Trzeci(?:a[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż]))|[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż]))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:IV[\s\xa0]*Moj[zż]|4[\s\xa0]*Moj[zż])eszowa)|(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Liczb|Num|Lb|4[\s\xa0]*Moj[zż]|IV[\s\xa0]*Moj[zż]|4[\s\xa0]*M(?:oj)?|IV[\s\xa0]*Moj|(?:IV|4)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|(?:IV|4)\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż]))|Czwarta[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż])))|(?:Liczb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Syracha)|(?:Ekl(?:ezjastyka|i)|S[iy]r|Eklezjastyk|M[aą]dro[sś][cć][\s\xa0]*Syracha)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*M[aą]dro[sś]|[\s\xa0]*M[aą]dro[sś]|i[eę]g[ai][\s\xa0]*M[aą]dro[sś])ci|Wis|M(?:[aą]dr(?:o[sś][cć][\s\xa0]*Salomona)?|dr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Treny(?:[\s\xa0]*Jeremiasza)?)|(?:L(?:a(?:m(?:entacje(?:[\s\xa0]*Jeremiasza)?)?)?|m)|Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Lamentacji|Tr)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Jeremiasza|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Modlitwa[\s\xa0]*Manassesa|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:[5V][\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])|5[\s\xa0]*Moj[zż]|V[\s\xa0]*Moj[zż])e|[5V]\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])e|Moj[zż]e)|Pi[aą]ta[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])e|Moj[zż]e))szowa|5[\s\xa0]*Moj[zż]|V[\s\xa0]*Moj[zż]|5[\s\xa0]*M(?:oj)?|V[\s\xa0]*Moj|[5V]\.[\s\xa0]*Moj[zż]|Pi[aą]ta[\s\xa0]*Moj[zż]|(?:Deu|Pw)t|Ks(?:\.[\s\xa0]*Powt(?:[o\xF3]rzonego)?|[\s\xa0]*Powt(?:[o\xF3]rzonego)?|i[eę]g[ai][\s\xa0]*Powt(?:[o\xF3]rzonego)?)[\s\xa0]*Prawa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Jozuego|Jo(?:zuego|sh|z))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*S[eę]dzi[o\xF3]|[\s\xa0]*S[eę]dzi[o\xF3]|i[eę]g[ai][\s\xa0]*S[eę]dzi[o\xF3])w|S[eę]?dz|Judg)|(?:S[eę]dzi[o\xF3]w)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*Rut(?:hy)?|[\s\xa0]*Rut(?:hy)?|i[eę]g[ai][\s\xa0]*Rut(?:hy)?)|R(?:uth|t|ut?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasza|1Esd|[1I]\.[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasza|Pierwsz[aey][\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasza)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasza|2Esd|(?:II|2)\.[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasza|Drug[ai][\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasza)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Izajasza|I(?:zajasza|sa|z))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Samuelowa)|(?:2(?:[\s\xa0]*Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)a|(?:[\s\xa0]*Sa?|Sa)m|[\s\xa0]*Sa)|II[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)|Samuelow)a|(?:II|2)\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)|Samuelow)a|Drug[ai][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)|Samuelow)a)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Samuelowa)|(?:1(?:[\s\xa0]*Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)a|(?:[\s\xa0]*Sa?|Sa)m|[\s\xa0]*Sa)|I[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)|Samuelow)a|[1I]\.[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)|Samuelow)a|Pierwsz[aey][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Samuel(?:ow)?|[\s\xa0]*Samuel(?:ow)?|i[eę]g[ai][\s\xa0]*Samuel(?:ow)?)|Samuelow)a)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Kr[o\xF3]lewska)|(?:2(?:[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w|[\s\xa0]*Kr[o\xF3]?l|Kgs)|II[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w|(?:II|2)\.[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w|Drug[ai][\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w|(?:II[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])|2[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])|(?:II|2)\.[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])|Drug[ai][\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]))lewska|(?:(?:II|2)\.|II|Drug[ai])[\s\xa0]*Kr[o\xF3]lewska|(?:IV|4)[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])lewska|(?:IV|4)\.[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])lewska|Czwarta[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])lewska)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:(?:III|3)\.[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|(?:III|3)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|Trzeci(?:a[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?))[\s\xa0]*Kr[o\xF3]|1[\s\xa0]*Kr[o\xF3])lewska|1(?:[\s\xa0]*Kr[o\xF3]l|[\s\xa0]*Krl|Kgs)|1[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska))|I[\s\xa0]*K(?:s(?:\.[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska))|r[o\xF3]lewska)|[1I]\.[\s\xa0]*K(?:s(?:\.[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska))|r[o\xF3]lewska)|Pierwsz[aey][\s\xa0]*K(?:s(?:\.[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|[\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska)|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l(?:[o\xF3]w|ewska))|r[o\xF3]lewska))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Kronik)|(?:2(?:[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Kronik|[\s\xa0]*Kro?n|Chr)|II[\s\xa0]*K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*K)?ronik|(?:II|2)\.[\s\xa0]*K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*K)?ronik|Drug[ai][\s\xa0]*K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*K)?ronik)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Kronik)|(?:1(?:[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Kronik|[\s\xa0]*Kro?n|Chr)|I[\s\xa0]*K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*K)?ronik|[1I]\.[\s\xa0]*K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*K)?ronik|Pierwsz[aey][\s\xa0]*K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*K)?ronik)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez(?:drasz|r)a)|(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ezdrasza|Ez(?:d?r|d))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Nehemiasza|Ne(?:hemiasza|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Estery|Est(?:ery|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*(?:Ij|J|Hi)|[\s\xa0]*(?:Ij|J|Hi)|i[eę]g[ai][\s\xa0]*(?:Ij|J|Hi))oba|(?:Hi|J)ob|Hi)|(?:(?:Hi|J)oba)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*Psalm[o\xF3]|[\s\xa0]*Psalm[o\xF3]|i[eę]g[ai][\s\xa0]*Psalm[o\xF3])w|Ps(?:almy|alm)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:ie[sś][nń][\s\xa0]*Azariasza|rAzar)|Modlitw[aą][\s\xa0]*Azariasza)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*Przy(?:powie[sś]ci[\s\xa0]*Salomona|sł[o\xF3]w)|[\s\xa0]*Przy(?:powie[sś]ci[\s\xa0]*Salomona|sł[o\xF3]w)|i[eę]g[ai][\s\xa0]*Przy(?:powie[sś]ci[\s\xa0]*Salomona|sł[o\xF3]w))|Pr(?:zypowie[sś]ci[\s\xa0]*Salomonowych|ov|z(?:yp?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:s(?:\.[\s\xa0]*(?:K(?:aznodziei[\s\xa0]*Salomon|ohelet)|Eklezjastes)|[\s\xa0]*(?:K(?:aznodziei[\s\xa0]*Salomon|ohelet)|Eklezjastes)|i[eę]g[ai][\s\xa0]*(?:K(?:aznodziei[\s\xa0]*Salomon|ohelet)|Eklezjastes))a|aznodziei[\s\xa0]*Salomonowego|ohelet|azn|oh)|E(?:cc|k)l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pie[sś](?:n(?:i[aą][\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3]|[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3])|ń[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3])w|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:ie[sś][nń][\s\xa0]*(?:nad[\s\xa0]*Pie[sś]niami|Salomona)|NP|np)|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Jeremiasza|J(?:eremiasza|e?r))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ezechiela|Ez(?:echiela|ek|e)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Daniela|D(?:aniela|an?|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ozeasza|Ozeasza|Hos|Oz)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Joela|J(?:oela|l)|Joel|Proroctwo[\s\xa0]*Ioelowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Amosa|Am(?:osa|os)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Abdiasza|Abdiasza|Obad|Ab|Proroctwo[\s\xa0]*Abdyaszowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Jonasza|Jona(?:sza|h)|Jon|Proroctwo[\s\xa0]*Ionaszowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Micheasza|Mi(?:cheasza|ch?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Nahuma|Na(?:huma|ch)|Nah?|Proroctwo[\s\xa0]*Nahumowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ha|Ha|A)bakuka|Hab?|Proroctwo[\s\xa0]*Abakukowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Sofoniasza|Sofoniasza|Zeph|Sof?|Proroctwo[\s\xa0]*Sofoniaszowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Aggeusza|Aggeusza|Hag|Ag|Proroctwo[\s\xa0]*Aggieuszowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zachariasza)|(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Zachariasza|Z(?:[ae]ch|a))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Malachiasza|M(?:alachiasza|l)|Mal|Proroctwo[\s\xa0]*Malachyaszowe)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*[sś]w\.?|g[\s\xa0]*[sś]w\.?)[\s\xa0]*)?Mateusza|[\s\xa0]*Mat(?:eusza)?|\.[\s\xa0]*Mateusza)|M(?:at(?:eusza|t)|t|at(?:eusz)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*[sś]w\.?|g[\s\xa0]*[sś]w\.?)[\s\xa0]*)?Marka|[\s\xa0]*Mar(?:ka)?|\.[\s\xa0]*Marka)|M(?:ar(?:ek|ka)|k|ark?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*[sś]w\.?|g[\s\xa0]*[sś]w\.?)[\s\xa0]*)?Łukasza|[\s\xa0]*Łuk(?:asza)?|\.[\s\xa0]*Łukasza)|Ł(?:ukasza|k)|L(?:uke|k)|Łuk(?:asz)?|Luk)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dz(?:iej(?:e(?:[\s\xa0]*Apostolskie|[\s\xa0]*Apost)?|ach[\s\xa0]*Apostolskich)|[\s\xa0]*Ap)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Objawienie[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jana)|(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Apokalipsy|Obj|Rev|Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Objawienia|Ap(?:okalipsa[\s\xa0]*(?:[SŚ]wi[eę]tego|[sś]w\.|[sś]w)[\s\xa0]*Jana)?)|(?:Apokalipsa|Objawienie)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*J(?:ana|n)|John|[\s\xa0]*J(?:an)?|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jana)|I[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana|[1I]\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana|Pierwsz[aey][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*J(?:ana|n)|John|[\s\xa0]*J(?:an)?|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jana)|II[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana|(?:II|2)\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana|Drug[ai][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:[\s\xa0]*J(?:ana|n)|John|[\s\xa0]*J(?:an)?|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jana)|III[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana|(?:III|3)\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?Jana|Trzeci(?:a[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?)?)Jana)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*[sś]w\.?|g[\s\xa0]*[sś]w\.?)[\s\xa0]*)?Jana|[\s\xa0]*Jana?|\.[\s\xa0]*Jana)|J(?:(?:oh)?n|ana|an)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rzymian)|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Rzymian|R(?:(?:zy|o)m|z))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Koryntian)|(?:2(?:[\s\xa0]*Korynt[o\xF3]w|Cor|[\s\xa0]*Kor|[\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|II[\s\xa0]*(?:Korynt(?:[o\xF3]w|ian)|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|(?:II|2)\.[\s\xa0]*(?:Korynt(?:[o\xF3]w|ian)|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|Drug[ai][\s\xa0]*(?:Korynt(?:[o\xF3]w|ian)|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Koryntian)|(?:1(?:[\s\xa0]*Korynt[o\xF3]w|Cor|[\s\xa0]*Kor|[\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|I[\s\xa0]*(?:Korynt(?:[o\xF3]w|ian)|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|[1I]\.[\s\xa0]*(?:Korynt(?:[o\xF3]w|ian)|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|Pierwsz[aey][\s\xa0]*(?:Korynt(?:[o\xF3]w|ian)|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Galacjan)|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Galacjan|do[\s\xa0]*Gala(?:t[o\xF3]w|cjan))|Ga(?:lat[o\xF3]w|l)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Efez[o\xF3]w)|(?:List[\s\xa0]*(?:[SŚ]wi[eę]tego[\s\xa0]*Pawła[\s\xa0]*Apostoła[\s\xa0]*do[\s\xa0]*Efez[o\xF3]w|(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Efezjan)|E(?:fezjan|ph|f(?:ez)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filipian)|(?:F(?:ilipens[o\xF3]w|lp)|Phil|F(?:il(?:ip)?|l)|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Filipian)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kolosan)|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Kolosan|Kolosens[o\xF3]w|Col|Kol)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Tesaloniczan)|(?:2(?:[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|[\s\xa0]*Tesalonicens[o\xF3]w|Thess|[\s\xa0]*Tes)|II[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Tesalonic(?:ens[o\xF3]w|zan))|(?:II|2)\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Tesalonic(?:ens[o\xF3]w|zan))|Drug[ai][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Tesalonic(?:ens[o\xF3]w|zan)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Tesaloniczan)|(?:1(?:[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|[\s\xa0]*Tesalonicens[o\xF3]w|Thess|[\s\xa0]*Tes)|I[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Tesalonic(?:ens[o\xF3]w|zan))|[1I]\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Tesalonic(?:ens[o\xF3]w|zan))|Pierwsz[aey][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Tesalonic(?:ens[o\xF3]w|zan)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Tymoteusza)|(?:2(?:[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|(?:[\s\xa0]*Ty?|Ti)m)|II[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*)?Tymoteusza|(?:II|2)\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*)?Tymoteusza|Drug[ai][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*)?Tymoteusza)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Tymoteusza)|(?:I[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|Tym(?:oteusza)?)|1(?:[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|(?:[\s\xa0]*Ty?|Ti)m)|[1I]\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|Tym(?:oteusza)?)|Pierwsz[aey][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|Tym(?:oteusza)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tytusa)|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tytusa|T(?:itus|y?t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filemona)|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Filemona|(?:F(?:ile|l)|Phl)m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Hebrajczyk[o\xF3]|[ZŻ]yd[o\xF3])w)|(?:List[\s\xa0]*do[\s\xa0]*(?:Hebrajczyk[o\xF3]|[ZŻ]yd[o\xF3])w|[ZŻ]yd|He?br|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jakuba)|(?:List[\s\xa0]*(?:powszechny[\s\xa0]*[SŚ]wi[eę]tego[\s\xa0]*Iakuba[\s\xa0]*Apostoł|(?:[sś]w\.?[\s\xa0]*)?Jakub)a|J(?:a[ks]|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Piotra|Pet))|(?:2[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|P(?:iotr)?)|II[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Piotra?)|(?:II|2)\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Piotra?)|Drug[ai][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Piotra?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Piotra|Pet))|(?:1[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|P(?:iotr)?)|I[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Piotra?)|[1I]\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Piotra?)|Pierwsz[aey][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Piotra?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:powszechny[\s\xa0]*[SŚ]wi[eę]tego[\s\xa0]*Iudasa[\s\xa0]*Apostoła|(?:[sś]w\.?[\s\xa0]*)?Judy)|J(?:ud[ey]|d|ud))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:\.[\s\xa0]*Tobi(?:asz|t)|[\s\xa0]*Tobi(?:asz|t)|i[eę]g[ai][\s\xa0]*Tobi(?:asz|t))a|To?b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Judyty|J(?:udyty|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Barucha|Ba(?:rucha|r)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Opowiadaniem[\s\xa0]*o[\s\xa0]*Zuzannie|Zuzanna|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|[\s\xa0]*Ma?ch|Macc)|II[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|(?:II|2)\.[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|Drug[ai][\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|[\s\xa0]*Ma?ch|Macc)|III[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|(?:III|3)\.[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|Trzeci(?:a[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?)[\s\xa0]*Machabejska)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:4(?:[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|[\s\xa0]*Ma?ch|Macc)|IV[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|(?:IV|4)\.[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|Czwarta[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|[\s\xa0]*Ma?ch|Macc)|I[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|[1I]\.[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|Pierwsz[aey][\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
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

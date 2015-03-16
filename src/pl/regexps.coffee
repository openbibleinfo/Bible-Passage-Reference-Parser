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
				  | tytuł (?! [a-z] )		#could be followed by a number
				  | rozdział[óo]w | werset[óo]w | rozdziały | rozdział | wersety | werset | rozdz | oraz | wers | por | rr | nn | do | r | n | i | w
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* tytuł
	| \d \W* (?:nn|n) (?: [\s\xa0*]* \.)?
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
		(?:Pierwsz[aey][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)))|\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?)))|Ks(?:i[eę]g(?:[ai][\s\xa0]*Rodzaju)|\.[\s\xa0]*Rodzaju|[\s\xa0]*Rodzaju)|I(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)))|\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)))|\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?)?))|1(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)))|\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)))|\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|M(?:oj(?:[zż](?:eszowa)?)?)?))|Gen(?:ezis)?|R(?:odz|dz))|(?:[1I](?:\.[\s\xa0]*Ksi(?:[eę]g(?:[ai][\s\xa0]*Moy(?:[zż]eszowe))|[\s\xa0]*Ksi[eę]g(?:[ai][\s\xa0]*Moy(?:[zż]eszowe))))|Pierwsz[aey][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Moy(?:[zż]eszowe))|\.[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?))))|(?:[1I][\s\xa0]*Ksi(?:[eę]g(?:[ai][\s\xa0]*Moy(?:[zż]eszowe)))|Pierwsz[aey][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?))))|Pierwsz[aey][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moy(?:[zż]eszowe|[\s\xa0]*Mo(?:j[zż]eszowa|y[zż]eszowe))|Moj(?:[zż](?:eszowa)?)))|Pierwsz[aey][\s\xa0]*(?:Ks[\s\xa0]*Mo(?:j(?:[zż]eszowa|y[zż]eszowe)|Moj(?:[zż](?:eszowa)?)))|Pierwsz[aey][\s\xa0]*(?:Ks[\s\xa0]*Moy(?:[zż]eszowe|Moj(?:[zż](?:eszowa)?)))|Pierwsz(?:[aey][\s\xa0]*Moj(?:[zż](?:eszowa)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug[ai][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)))|Ks(?:i[eę]g(?:[ai][\s\xa0]*Wyj(?:[sś]cia))|\.[\s\xa0]*Wyj[sś]cia|[\s\xa0]*Wyj[sś]cia)|II(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)?))|2(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|M(?:oj(?:[zż](?:eszowa)?)?)?))|Ex(?:od(?:us)?)?|W(?:yj|j))|Drug[ai][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj(?:[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)))|Drug[ai][\s\xa0]*(?:Ks[\s\xa0]*Moj(?:[zż]eszowa|Moj(?:[zż](?:eszowa)?)))|Drug(?:[ai][\s\xa0]*Moj(?:[zż](?:eszowa)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Opowiadaniem[\s\xa0]*o[\s\xa0]*Belu[\s\xa0]*i[\s\xa0]*w[eę](?:[zż]u)|Bel(?:a[\s\xa0]*i[\s\xa0]*w[eę](?:[zż]a))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Trzeci(?:a[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)))|III(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)?))|3(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|M(?:oj(?:[zż](?:eszowa)?)?)?))|K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kapła(?:[nń]ska))|\.[\s\xa0]*Kapła[nń]ska|[\s\xa0]*Kapła[nń]ska)|ap[lł]|p[lł])|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Czwarta[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|Ks(?:i[eę]g(?:[ai][\s\xa0]*Liczb)|\.[\s\xa0]*Liczb|[\s\xa0]*Liczb)|IV(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)?))|4(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|M(?:oj(?:[zż](?:eszowa)?)?)?))|Num|Lb)|Liczb
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M[aą]dro(?:[sś](?:[cć][\s\xa0]*Syracha))|Ekl(?:ezjastyka?|i)|S(?:ir|yr(?:acha)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*M(?:[aą]dro(?:[sś]ci)))|\.[\s\xa0]*M[aą]dro(?:[sś]ci)|[\s\xa0]*M[aą]dro(?:[sś]ci))|M(?:[aą]dr(?:o(?:[sś](?:[cć][\s\xa0]*Salomona))?)|dr)|Wis)|M(?:[aą]dr)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Lamentacji)|\.[\s\xa0]*Lamentacji|[\s\xa0]*Lamentacji)|L(?:a(?:m(?:entacje(?:[\s\xa0]*Jeremiasza)?)?)?|m)|Tr(?:eny(?:[\s\xa0]*Jeremiasza)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Jeremiasza|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Modlitwa[\s\xa0]*Manassesa|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Powt(?:(?:[oó]rzonego[\s\xa0]*Prawa|[\s\xa0]*Prawa)))|\.[\s\xa0]*Powt(?:[oó]rzonego[\s\xa0]*Prawa|[\s\xa0]*Prawa)|[\s\xa0]*Powt(?:[oó]rzonego[\s\xa0]*Prawa|[\s\xa0]*Prawa))|V(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)?))|Deut|5(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?))|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|M(?:oj(?:[zż](?:eszowa)?)?)?))|P(?:i[aą]ta[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Moj(?:[zż]eszowa))|\.[\s\xa0]*Moj[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)))|wt))|Pi[aą]ta[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj(?:[zż]eszowa|[\s\xa0]*Moj[zż]eszowa)|Moj(?:[zż](?:eszowa)?)))|Pi[aą]ta[\s\xa0]*(?:Ks[\s\xa0]*Moj(?:[zż]eszowa|Moj(?:[zż](?:eszowa)?)))|Pi(?:[aą]ta[\s\xa0]*Moj(?:[zż](?:eszowa)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Jozuego)|\.[\s\xa0]*Jozuego|[\s\xa0]*Jozuego)|Jo(?:sh|z(?:uego)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*S(?:[eę]dzi(?:[oó]w)))|\.[\s\xa0]*S[eę]dzi(?:[oó]w)|[\s\xa0]*S[eę]dzi(?:[oó]w))|Judg|S(?:[eę]dz|dz))|S[eę]dzi(?:[óo]w)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Rut(?:hy)?))|\.[\s\xa0]*Rut(?:hy)?|[\s\xa0]*Rut(?:hy)?)|R(?:t|u(?:th?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz[aey][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza))|I(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza))|1(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza)|Esd))|Pierwsz(?:[aey][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug[ai][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza))|II(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza))|2(?:\.[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza)|Esd))|Drug(?:[ai][\s\xa0]*(?:Ks(?:\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ezdrasza))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Izajasza)|\.[\s\xa0]*Izajasza|[\s\xa0]*Izajasza)|I(?:sa|z(?:ajasza)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug(?:[ai][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa))|II(?:\.[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa)|[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa))|2(?:\.[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa)|[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|S(?:a(?:m(?:uelowa)?)?|m))|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz(?:[aey][\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa))|I(?:\.[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa)|[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa))|1(?:\.[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|Samuelowa)|[\s\xa0]*(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Samuel(?:owa|a)))|\.[\s\xa0]*Samuel(?:owa|a)|[\s\xa0]*Samuel(?:owa|a))|S(?:a(?:m(?:uelowa)?)?|m))|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Czwarta[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska)|Drug[ai][\s\xa0]*K(?:r(?:[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w)))))|4(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska))|I(?:V(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska))|I(?:\.[\s\xa0]*K(?:r[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|[\s\xa0]*K(?:r[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))))|2(?:\.[\s\xa0]*K(?:r[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|[\s\xa0]*K(?:s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w)))|r(?:(?:[oó]l(?:ewska)?)|l))|Kgs))|Drug(?:[ai][\s\xa0]*Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Trzeci(?:a[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska))|Pierwsz[aey][\s\xa0]*K(?:r(?:[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w)))))|3(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska))|I(?:II(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]lewska))|\.[\s\xa0]*Kr[oó]lewska|[\s\xa0]*Kr[oó]lewska))|\.[\s\xa0]*K(?:r[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|[\s\xa0]*K(?:r[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w)))))|1(?:\.[\s\xa0]*K(?:r[oó]lewska|s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|[\s\xa0]*K(?:s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w)))|r(?:(?:[oó]l(?:ewska)?)|l))|Kgs))|Pierwsz(?:[aey][\s\xa0]*Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))|\.[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))|[\s\xa0]*Kr(?:[oó]l(?:ewska|[oó]w))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug[ai][\s\xa0]*K(?:s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik))|II(?:\.[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik)|[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik))|2(?:\.[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik)|[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|r(?:on(?:ik)?|n))|Chr))|Drug(?:[ai][\s\xa0]*K(?:s(?:\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz[aey][\s\xa0]*K(?:s(?:i(?:[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik))|I(?:\.[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik)|[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik))|1(?:\.[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik)|[\s\xa0]*K(?:s(?:i[eę]g(?:[ai][\s\xa0]*Kronik)|\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|r(?:on(?:ik)?|n))|Chr))|Pierwsz(?:[aey][\s\xa0]*K(?:s(?:\.[\s\xa0]*Kronik|[\s\xa0]*Kronik)|ronik))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezdrasza)|\.[\s\xa0]*Ezdrasza|[\s\xa0]*Ezdrasza)|Ez(?:d(?:r(?:asza)?)?|ra?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Nehemiasza)|\.[\s\xa0]*Nehemiasza|[\s\xa0]*Nehemiasza)|Ne(?:h(?:emiasza)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		GkEsth
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Estery)|\.[\s\xa0]*Estery|[\s\xa0]*Estery)|Est(?:ery|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*(?:Hioba|Ijoba|Joba)))|\.[\s\xa0]*(?:Hioba|Ijoba|Joba)|[\s\xa0]*(?:Hioba|Ijoba|Joba))|Job|Hi(?:ob)?)|(?:Hioba|Joba)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Psalm(?:[oó]w))|\.[\s\xa0]*Psalm[oó]w|[\s\xa0]*Psalm[oó]w)|Ps(?:almy?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Modlitw[aą][\s\xa0]*Azariasza|P(?:ie[sś](?:[nń][\s\xa0]*Azariasza)|rAzar))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Przy(?:powie(?:[sś]ci[\s\xa0]*Salomona|sł[oó]w)))|\.[\s\xa0]*Przy(?:powie[sś]ci[\s\xa0]*Salomona|sł[oó]w)|[\s\xa0]*Przy(?:powie[sś]ci[\s\xa0]*Salomona|sł[oó]w))|Pr(?:ov|z(?:y(?:p(?:owie[sś]ci[\s\xa0]*Salomonowych)?)?)?)?)|Ksi[eę]g(?:[ai][\s\xa0]*Przysł(?:[oó]w))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:ccl|kl)|K(?:s(?:i(?:[eę]g(?:[ai][\s\xa0]*(?:Eklezjastesa|K(?:aznodziei[\s\xa0]*Salomona|oheleta))))|\.[\s\xa0]*(?:Eklezjastesa|K(?:aznodziei[\s\xa0]*Salomona|oheleta))|[\s\xa0]*(?:Eklezjastesa|K(?:aznodziei[\s\xa0]*Salomona|oheleta)))|azn(?:odziei[\s\xa0]*Salomonowego)?|oh(?:elet)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pie[sś](?:n(?:i(?:[aą][\s\xa0]*trzech[\s\xa0]*młodzie(?:[nń]c(?:[oó]w))|[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c(?:[oó]w))|ń[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c(?:[oó]w)))|SgThree)|Pie[sś](?:[nń][\s\xa0]*trzech[\s\xa0]*młodzie(?:[nń]c(?:[oó]w)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|P(?:ie[sś](?:[nń][\s\xa0]*(?:nad[\s\xa0]*Pie(?:[sś]niami|Salomona)))|NP|np))|Pie[sś](?:[nń][\s\xa0]*Salomona)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Jeremiasza)|\.[\s\xa0]*Jeremiasza|[\s\xa0]*Jeremiasza)|J(?:er(?:emiasza)?|r))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ezechiela)|\.[\s\xa0]*Ezechiela|[\s\xa0]*Ezechiela)|Ez(?:e(?:chiela|k)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Daniela)|\.[\s\xa0]*Daniela|[\s\xa0]*Daniela)|D(?:a(?:n(?:iela)?)?|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Ozeasza)|\.[\s\xa0]*Ozeasza|[\s\xa0]*Ozeasza)|Hos|Oz(?:easza)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Ioelowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Joela)|\.[\s\xa0]*Joela|[\s\xa0]*Joela)|J(?:oela?|l))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Amosa)|\.[\s\xa0]*Amosa|[\s\xa0]*Amosa)|Am(?:osa?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Abdyaszowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Abdiasza)|\.[\s\xa0]*Abdiasza|[\s\xa0]*Abdiasza)|Obad|Ab(?:diasza)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Ionaszowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Jonasza)|\.[\s\xa0]*Jonasza|[\s\xa0]*Jonasza)|Jon(?:a(?:sza|h))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Micheasza)|\.[\s\xa0]*Micheasza|[\s\xa0]*Micheasza)|Mi(?:c(?:h(?:easza)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Nahumowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Nahuma)|\.[\s\xa0]*Nahuma|[\s\xa0]*Nahuma)|Na(?:ch|h(?:uma)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Abakukowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Habakuka)|\.[\s\xa0]*Habakuka|[\s\xa0]*Habakuka)|Abakuka|Ha(?:b(?:akuka)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Sofoniaszowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Sofoniasza)|\.[\s\xa0]*Sofoniasza|[\s\xa0]*Sofoniasza)|Zeph|So(?:f(?:oniasza)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Aggieuszowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Aggeusza)|\.[\s\xa0]*Aggeusza|[\s\xa0]*Aggeusza)|Hag|Ag(?:geusza)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Zachariasza)|\.[\s\xa0]*Zachariasza|[\s\xa0]*Zachariasza)|Z(?:ech|a(?:ch(?:ariasza)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctwo[\s\xa0]*Malachyaszowe|Ks(?:i[eę]g(?:[ai][\s\xa0]*Malachiasza)|\.[\s\xa0]*Malachiasza|[\s\xa0]*Malachiasza)|M(?:al(?:achiasza)?|l))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Mateusza|[\s\xa0]*Mateusza))|g[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Mateusza|[\s\xa0]*Mateusza)))|Mateusza)|\.[\s\xa0]*Mateusza|[\s\xa0]*Mat(?:eusza)?)|M(?:at(?:eusz|t)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Marka|[\s\xa0]*Marka))|g[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Marka|[\s\xa0]*Marka)))|Marka)|\.[\s\xa0]*Marka|[\s\xa0]*Mar(?:ka)?)|M(?:ar(?:ek|k)?|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Łukasza|[\s\xa0]*Łukasza))|g[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Łukasza|[\s\xa0]*Łukasza)))|Łukasza)|\.[\s\xa0]*Łukasza|[\s\xa0]*Łuk(?:asza)?)|L(?:uke?|k)|Ł(?:uk(?:asz)?|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|Dz(?:iej(?:ach[\s\xa0]*Apostolskich|e(?:[\s\xa0]*Apost(?:olskie)?)?)|[\s\xa0]*Ap)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*(?:Apokalipsy|Objawienia)))|\.[\s\xa0]*(?:Apokalipsy|Objawienia)|[\s\xa0]*(?:Apokalipsy|Objawienia))|Obj(?:awienie[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana))?|Rev|Ap(?:okalipsa[\s\xa0]*(?:[SŚ]wi(?:[eę]tego[\s\xa0]*Jana)|(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))))?)|(?:Objawienie|Apokalipsa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz(?:[aey][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana))|I(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana))|1(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|John|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|J(?:ana?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug(?:[ai][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana))|II(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana))|2(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|John|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|J(?:ana?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Trzeci(?:a[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana))|III(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana))|3(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|Jana)|John|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|Jana)|J(?:ana?|n)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ew(?:angelia[\s\xa0]*(?:w(?:edług[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana))|g[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Jana|[\s\xa0]*Jana)))|Jana)|\.[\s\xa0]*Jana|[\s\xa0]*Jana?)|J(?:ohn|an|n)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Rzymian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Rzymian))|do[\s\xa0]*Rzymian)|R(?:om|z(?:ym(?:ian)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug(?:[ai][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w)))|II(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w))|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w)))|2(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w))|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Kor(?:ynt(?:ian|[oó]w))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz(?:[aey][\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w)))|I(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w))|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w)))|1(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Korynt(?:ian|[oó]w))|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian))|list[\s\xa0]*do[\s\xa0]*Koryntian|Kor(?:ynt(?:ian|[oó]w))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Galacjan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Galacjan))|do[\s\xa0]*Gala(?:cjan|t[oó]w))|Ga(?:l(?:a(?:cjan|t[oó]w))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:[SŚ]wi(?:[eę]tego[\s\xa0]*Pawła[\s\xa0]*Apostoła[\s\xa0]*do[\s\xa0]*Efez(?:[oó]w))|(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Efezjan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Efezjan))|do[\s\xa0]*Efezjan)|E(?:ph|f(?:ez(?:jan|[oó]w)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Filipian|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Filipian))|do[\s\xa0]*Filipian)|Phil|F(?:il(?:ip(?:ens[oó]w|ian)?)?|lp?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Kolosan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Kolosan))|do[\s\xa0]*Kolosan)|Col|Kol(?:os(?:ens[oó]w|an))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug(?:[ai][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan)))|II(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan))|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan)))|2(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan))|Thess|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tes(?:alonic(?:ens[oó]w|zan))?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz(?:[aey][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan)))|I(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan))|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan)))|1(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tesalonic(?:ens[oó]w|zan))|Thess|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tesaloniczan))|do[\s\xa0]*Tesaloniczan)|Tes(?:alonic(?:ens[oó]w|zan))?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug(?:[ai][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tymoteusza))|II(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tymoteusza)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tymoteusza))|2(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tymoteusza)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|T(?:ym(?:oteusza)?|m))|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz(?:[aey][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tym(?:oteusza)?))|I(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tym(?:oteusza)?)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tym(?:oteusza)?))|1(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|Tym(?:oteusza)?)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tymoteusza))|do[\s\xa0]*Tymoteusza)|T(?:ym(?:oteusza)?|m))|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tytusa|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Tytusa))|do[\s\xa0]*Tytusa)|T(?:itus|yt(?:usa)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Filemona|[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Filemona))|do[\s\xa0]*Filemona)|Phlm|F(?:ilem(?:ona)?|lm))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*do[\s\xa0]*(?:Hebrajczyk[oó]w|[ZŻ]yd(?:[oó]w))|H(?:br|eb(?:r(?:ajczyk[oó]w)?)?)|(?:[ZŻ]yd(?:[oó]w)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:powszechny[\s\xa0]*[SŚ]wi(?:[eę]tego[\s\xa0]*Iakuba[\s\xa0]*Apostoła)|(?:[sś]w(?:\.[\s\xa0]*Jakuba|[\s\xa0]*Jakuba))|Jakuba)|J(?:a(?:k(?:uba)?|s)|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug(?:[ai][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?))|II(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?))|2(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?)|Pet|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|P(?:iotra?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz(?:[aey][\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?))|I(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?)|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?))|1(?:\.[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|Piotra?)|Pet|[\s\xa0]*(?:List[\s\xa0]*(?:(?:[sś]w(?:\.[\s\xa0]*Piotra|[\s\xa0]*Piotra))|Piotra)|P(?:iotra?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:powszechny[\s\xa0]*[SŚ]wi(?:[eę]tego[\s\xa0]*Iudasa[\s\xa0]*Apostoła)|(?:[sś]w(?:\.[\s\xa0]*Judy|[\s\xa0]*Judy))|Judy)|J(?:ud[ey]?|d))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Tobi(?:asza|ta)))|\.[\s\xa0]*Tobi(?:asza|ta)|[\s\xa0]*Tobi(?:asza|ta))|T(?:ob|b))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Judyty)|\.[\s\xa0]*Judyty|[\s\xa0]*Judyty)|J(?:udyty|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Barucha)|\.[\s\xa0]*Barucha|[\s\xa0]*Barucha)|Ba(?:r(?:ucha)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Opowiadaniem[\s\xa0]*o[\s\xa0]*Zuzannie|Zuzanna|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Drug[ai][\s\xa0]*Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|II(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|2(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|M(?:ach|ch))|Macc))|Drug(?:[ai][\s\xa0]*Ks(?:\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Trzeci(?:a[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|III(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|3(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|M(?:ach|ch))|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Czwarta[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|IV(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|4(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|M(?:ach|ch))|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Pierwsz[aey][\s\xa0]*Ks(?:i(?:[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|I(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))|1(?:\.[\s\xa0]*Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|[\s\xa0]*(?:Ks(?:i[eę]g(?:[ai][\s\xa0]*Machabejska)|\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska)|M(?:ach|ch))|Macc))|Pierwsz(?:[aey][\s\xa0]*Ks(?:\.[\s\xa0]*Machabejska|[\s\xa0]*Machabejska))
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

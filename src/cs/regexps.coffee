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
				  | titul (?! [a-z] )		#could be followed by a number
				  | kapitola | kapitoly | ver[šs]e | kapitol | kap | srv | ff | - | a
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* titul
	| \d \W* ff (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Prvn[íi]|1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Druh[áa]|Druh[ýy]|2|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:T[řr]et[íi]|3|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:a|srv)|-)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|-)"
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
		(?:[1I][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|G(?:enesis|n|en)|[1I]\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|Prvn[i\xED][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|Ex(?:odus|od)?|(?:II|2)\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|Druh[ay\xE1\xFD][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B[e\xE9]l(?:[\s\xa0]*a[\s\xa0]*drak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:III|3)[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|L(?:eviti(?:cusi|kus)|v|ev(?:iticus)?)|(?:III|3)\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|T[rř]et[i\xED][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:IV|4)[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|Nu(?:meri|m)?|(?:IV|4)\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|[CČ]tvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S[i\xED]rachovec|Ecclesiasticus|S[i\xED]r|Kniha[\s\xa0]*S[i\xED]rachovcova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*(?:moudrost[i\xED]|Moudrosti)|Wis|M(?:oudrost(?:[\s\xa0]*[SŠ]alomounova)?|dr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pl(?:[a\xE1][cč][\s\xa0]*Jerem[ij][a\xE1][sš][uů]v)?|Kniha[\s\xa0]*n[a\xE1][rř]k[uů]|Lam)|(?:Pl[a\xE1][cč])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Jeremj[a\xE1][sš][uů]v|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zj(?:even(?:i(?:[\s\xa0]*(?:svat[e\xE9]ho[\s\xa0]*Jana|Janovo))?|\xED(?:[\s\xa0]*Janovo)?))?|Kniha[\s\xa0]*Zjeven[i\xED]|Rev|Apokalypsa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Modlitbu[\s\xa0]*Manasse|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[5V][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|D(?:euteronomium|t|eut)|[5V]\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova|P[a\xE1]t[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:o(?:z(?:ue)?|sh)|z))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:oudc[uů]|dc?)|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:\xFA?t|uth?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*Ezdr[a\xE1][sš]|1Esd|[1I]\.[\s\xa0]*Ezdr[a\xE1][sš]|Prvn[i\xED][\s\xa0]*Ezdr[a\xE1][sš])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*Ezdr[a\xE1][sš]|2Esd|(?:II|2)\.[\s\xa0]*Ezdr[a\xE1][sš]|Druh[ay\xE1\xFD][\s\xa0]*Ezdr[a\xE1][sš])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:I(?:z(?:a[ij][a\xE1][sš])?|sa))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:II|2)\.|II|2|Druh[ay\xE1\xFD])[\s\xa0]*Samuelova)|(?:(?:II|2)[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:amuel|am)?)|2Sam|(?:II|2)\.[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:amuel|am)?)|Druh[ay\xE1\xFD][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:amuel|am)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:Prvn[i\xED]|[1I]\.|[1I])[\s\xa0]*Samuelova)|(?:[1I][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:amuel|am)?)|1Sam|[1I]\.[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:amuel|am)?)|Prvn[i\xED][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:amuel|am)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*(?:Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]l)?|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1])|2Kgs|(?:II|2)\.[\s\xa0]*(?:Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]l)?|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1])|Druh[ay\xE1\xFD][\s\xa0]*(?:Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]l)?|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*(?:Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]l)?|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1])|1Kgs|[1I]\.[\s\xa0]*(?:Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]l)?|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1])|Prvn[i\xED][\s\xa0]*(?:Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]l)?|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*(?:Letopis[uů]|Kronik|kniha[\s\xa0]*kronik|Pa(?:ralipomenon)?)|2Chr|(?:II|2)\.[\s\xa0]*(?:Letopis[uů]|Kronik|kniha[\s\xa0]*kronik|Pa(?:ralipomenon)?)|Druh[ay\xE1\xFD][\s\xa0]*(?:Letopis[uů]|Kronik|kniha[\s\xa0]*kronik|Pa(?:ralipomenon)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*(?:Letopis[uů]|Kronik|kniha[\s\xa0]*kronik|Pa(?:ralipomenon)?)|1Chr|[1I]\.[\s\xa0]*(?:Letopis[uů]|Kronik|kniha[\s\xa0]*kronik|Pa(?:ralipomenon)?)|Prvn[i\xED][\s\xa0]*(?:Letopis[uů]|Kronik|kniha[\s\xa0]*kronik|Pa(?:ralipomenon)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez(?:d(?:r[a\xE1][sš])?|ra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Neh(?:em[ij][a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ester[\s\xa0]*(?:[rř]eck[e\xE9][\s\xa0]*(?:[cč][a\xE1]sti|dodatky)|\(řeck\xE9[\s\xa0]*(?:č\xE1sti|dodatky)\))|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:er|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J[o\xF3]?b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ZŽ]almy)|(?:Kniha[\s\xa0]*[zž]alm[uů]|[ZŽ]alm|Ps|[ZŽ])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Azarj[a\xE1][sš]ova[\s\xa0]*modlitba|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:r(?:[i\xED]s(?:lov[i\xED][\s\xa0]*[SŠ]alomounova)?|ov)?|ř(?:[i\xED]s(?:lov[i\xED][\s\xa0]*[SŠ]alomounova)?)?))|(?:P[rř][i\xED]slov[i\xED])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:az(?:atel)?|ohelet)|Eccl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P[i\xED]se[nň][\s\xa0]*ml[a\xE1]denc[uů][\s\xa0]*v[\s\xa0]*ho[rř][i\xED]c[i\xED][\s\xa0]*peci|T[rř]i[\s\xa0]*mu[zž]i[\s\xa0]*v[\s\xa0]*rozp[a\xE1]len[e\xE9][\s\xa0]*peci|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P[i\xED]s(?:e[nň][\s\xa0]*(?:p[i\xED]sn[i\xED]|[SŠ]alamounova))?|Song)|(?:P[i\xED]se[nň])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:er(?:em[ij][a\xE1][sš])?|r))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez(?:e(?:chiel|k))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Da(?:n(?:iel)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Oz(?:e[a\xE1][sš])?|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:(?:\xF3e)?l|o(?:el)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Am(?:os)?|\xC1mos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Abd(?:i(?:j[a\xE1][sš]|[a\xE1][sš]))?|Obad(?:j[a\xE1][sš]|j[a\xE1])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jon(?:\xE1[sš]|a[hsš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mi(?:c(?:h(?:[ae][a\xE1][sš])?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Na(?:h(?:um)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ab(?:aku)?k|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:ofon[ij][a\xE1][sš]|f)|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ag(?:geus|eus)?|Hag)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Z(?:a(?:char[ij][a\xE1][sš])?|ech))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:achi[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:at(?:ou[sš]ovo[\s\xa0]*evangelium|t)|t|at(?:ou[sš])?)|Evangelium[\s\xa0]*podle[\s\xa0]*Matou[sš]e)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:ar(?:kovo[\s\xa0]*evangelium|ek)|k|ark)|Evangelium[\s\xa0]*podle[\s\xa0]*Marka)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:uk(?:[a\xE1][sš]ovo[\s\xa0]*evangelium|e)|k|uk[a\xE1][sš])?|Evangelium[\s\xa0]*podle[\s\xa0]*Luk[a\xE1][sš]e)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*Jan[uů]v|1John|[1I]\.[\s\xa0]*Jan[uů]v|Prvn[i\xED][\s\xa0]*Jan[uů]v)|(?:[1I]\.[\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v)|[1I][\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v)|Prvn[i\xED][\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*Jan[uů]v|2John|(?:II|2)\.[\s\xa0]*Jan[uů]v|Druh[ay\xE1\xFD][\s\xa0]*Jan[uů]v)|(?:(?:II|2)\.[\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v)|(?:II|2)[\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v)|Druh[ay\xE1\xFD][\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:III|3)[\s\xa0]*Jan[uů]v|3John|(?:III|3)\.[\s\xa0]*Jan[uů]v|T[rř]et[i\xED][\s\xa0]*Jan[uů]v)|(?:(?:III|3)\.[\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v)|(?:III|3)[\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v)|T[rř]et[i\xED][\s\xa0]*(?:J(?:anova|an)?|list[\s\xa0]*Jan[uů]v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:anovo[\s\xa0]*evangelium|ohn|an)?|Evangelium[\s\xa0]*podle[\s\xa0]*Jana)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sk(?:utky(?:[\s\xa0]*apo[sš]tol(?:sk[e\xE9]|[u\xFCů]))?)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:R[io\xED]|Ř[i\xED])m|[RŘ]|List[\s\xa0]*[RŘ][i\xED]man[uů]m)|(?:[RŘ][i\xED]man[uů]m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Korintsk[y\xFD]m)|(?:II[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|K(?:orintsk[y\xFD]m)?)|2[\s\xa0]*list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|2(?:[CK]|[\s\xa0]*K)or|IIK|2[\s\xa0]*?K|(?:II|2)\.(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|K(?:orintsk[y\xFD]m)?)|K)|Druh[ay\xE1\xFD](?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|K(?:orintsk[y\xFD]m)?)|K))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|K(?:orintsk[y\xFD]m|or)?)|1(?:Cor|K)|IK|[1I]\.(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|K(?:orintsk[y\xFD]m|or)?)|K)|Prvn[i\xED](?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[y\xFD]|sk[y\xFD])m|K(?:orintsk[y\xFD]m|or)?)|K))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ga(?:latsk[y\xFD]m|l)?|List[\s\xa0]*Galatsk[y\xFD]m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Ef(?:ez(?:sk[y\xFD]|an[uů])|\xE9zsk[y\xFD])m|E(?:fez?sk[y\xFD]m|ph|f))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filipsk[y\xFD]m|Phil|Fp|Filipensk[y\xFD]m|List[\s\xa0]*Filipsk[y\xFD]m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kolosan[uů]m)|(?:Kolos(?:sens|ens)?k[y\xFD]m|Kol?|Col|List[\s\xa0]*Kolos(?:k[y\xFD]|an[uů])m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:II|2)\.[\s\xa0]*Tesalonick[y\xFD]|(?:II|2)[\s\xa0]*Tesalonick[y\xFD]|Druh[ay\xE1\xFD][\s\xa0]*Tesalonick[y\xFD])m)|(?:(?:II|2)[\s\xa0]*(?:list[\s\xa0]*(?:Solu[nň]sk[y\xFD]|Tesalonick[y\xFD])m|(?:Tessalonicen|Solu[nň])sk[y\xFD]m|Sol|Te)|2Thess|(?:II|2)\.[\s\xa0]*(?:list[\s\xa0]*(?:Solu[nň]sk[y\xFD]|Tesalonick[y\xFD])m|(?:Tessalonicen|Solu[nň])sk[y\xFD]m|Sol|Te)|Druh[ay\xE1\xFD][\s\xa0]*(?:list[\s\xa0]*(?:Solu[nň]sk[y\xFD]|Tesalonick[y\xFD])m|(?:Tessalonicen|Solu[nň])sk[y\xFD]m|Sol|Te))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[1I]\.[\s\xa0]*Tesalonick[y\xFD]|[1I][\s\xa0]*Tesalonick[y\xFD]|Prvn[i\xED][\s\xa0]*Tesalonick[y\xFD])m)|(?:[1I][\s\xa0]*(?:list[\s\xa0]*(?:Solu[nň]sk[y\xFD]|Tesalonick[y\xFD])m|(?:Tessalonicen|Solu[nň])sk[y\xFD]m|Sol|Te)|1Thess|[1I]\.[\s\xa0]*(?:list[\s\xa0]*(?:Solu[nň]sk[y\xFD]|Tesalonick[y\xFD])m|(?:Tessalonicen|Solu[nň])sk[y\xFD]m|Sol|Te)|Prvn[i\xED][\s\xa0]*(?:list[\s\xa0]*(?:Solu[nň]sk[y\xFD]|Tesalonick[y\xFD])m|(?:Tessalonicen|Solu[nň])sk[y\xFD]m|Sol|Te))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:II|2)\.[\s\xa0]*Timotej?|(?:II|2)[\s\xa0]*Timotej?|Druh[ay\xE1\xFD][\s\xa0]*Timotej?)ovi)|(?:(?:II|2)[\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|etej)ovi|T(?:imoteus|m|im))|2Tim|(?:II|2)\.[\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|etej)ovi|T(?:imoteus|m|im))|Druh[ay\xE1\xFD][\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|etej)ovi|T(?:imoteus|m|im)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[1I]\.[\s\xa0]*Timotej?|[1I][\s\xa0]*Timotej?|Prvn[i\xED][\s\xa0]*Timotej?)ovi)|(?:[1I][\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|ete)ovi|T(?:imoteus|m|im))|1Tim|[1I]\.[\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|ete)ovi|T(?:imoteus|m|im))|Prvn[i\xED][\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|ete)ovi|T(?:imoteus|m|im)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Titovi)|(?:T(?:itus|t|it)|List[\s\xa0]*Titovi)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filemonovi)|(?:F(?:ilemon|l?m)|Phlm|List[\s\xa0]*Filemonovi)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hebrej[uů]m)|(?:List[\s\xa0]*(?:Hebrej[uů]|[ZŽ]id[uů])m|[ZŽ]id[uů]m|[ZŽ]d|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jakub[uů]v)|(?:J(?:a(?:kub|s)|k|ak)|List[\s\xa0]*Jakub[uů]v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*Petr[uů]v|2Pet|(?:II|2)\.[\s\xa0]*Petr[uů]v|Druh[ay\xE1\xFD][\s\xa0]*Petr[uů]v)|(?:(?:II|2)\.[\s\xa0]*(?:P(?:etrova|t|etr)?|list[\s\xa0]*Petr[uů]v)|(?:II|2)[\s\xa0]*(?:P(?:etrova|t|etr)?|list[\s\xa0]*Petr[uů]v)|Druh[ay\xE1\xFD][\s\xa0]*(?:P(?:etrova|t|etr)?|list[\s\xa0]*Petr[uů]v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*Petr[uů]v|1Pet|[1I]\.[\s\xa0]*Petr[uů]v|Prvn[i\xED][\s\xa0]*Petr[uů]v)|(?:[1I]\.[\s\xa0]*(?:P(?:etrova|t|etr)?|list[\s\xa0]*Petr[uů]v)|[1I][\s\xa0]*(?:P(?:etrova|t|etr)?|list[\s\xa0]*Petr[uů]v)|Prvn[i\xED][\s\xa0]*(?:P(?:etrova|t|etr)?|list[\s\xa0]*Petr[uů]v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jud[uů]v)|(?:J(?:ud(?:[ae]|ova)|d|u)|List[\s\xa0]*Jud[uů]v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:ob(?:i(?:[a\xE1][sš]|t|j[a\xE1][sš]))?|\xF3bi(?:j[a\xE1][sš]|t)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:[u\xFA]d(?:it)?|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B(?:[a\xE1]ru(?:ch|k)|[a\xE1]r)|Kniha[\s\xa0]*B[a\xE1]ru(?:ch|k)ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zuz(?:ana)?|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II|2)[\s\xa0]*Mak(?:abejsk[a\xE1])?|2Macc|(?:II|2)\.[\s\xa0]*Mak(?:abejsk[a\xE1])?|Druh[ay\xE1\xFD][\s\xa0]*Mak(?:abejsk[a\xE1])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:III|3)[\s\xa0]*Mak(?:abejsk[a\xE1])?|3Macc|(?:III|3)\.[\s\xa0]*Mak(?:abejsk[a\xE1])?|T[rř]et[i\xED][\s\xa0]*Mak(?:abejsk[a\xE1])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:IV|4)[\s\xa0]*Mak(?:abejsk[a\xE1])?|4Macc|(?:IV|4)\.[\s\xa0]*Mak(?:abejsk[a\xE1])?|[CČ]tvrt[a\xE1][\s\xa0]*Mak(?:abejsk[a\xE1])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[1I][\s\xa0]*Mak(?:abejsk[a\xE1])?|1Macc|[1I]\.[\s\xa0]*Mak(?:abejsk[a\xE1])?|Prvn[i\xED][\s\xa0]*Mak(?:abejsk[a\xE1])?)
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

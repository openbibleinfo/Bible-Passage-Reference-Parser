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
		(?:Prvn[ií][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|[1I](?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))))|G(?:en(?:esis)?|n))|(?:Prvn[ií][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova)))|[1I](?:\.[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))))|[1I][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|[1I][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|II(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|2(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|Ex(?:od(?:us)?)?)|Druh[ayáý][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		B(?:[eé]l(?:[\s\xa0]*a[\s\xa0]*drak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:T[rř]et(?:[ií][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))))|III(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|3(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|L(?:ev(?:iti(?:cusi?|kus))?|v))|T[rř]et(?:[ií][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[CČ]tvrt(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))))|IV(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|4(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|Nu(?:m(?:eri)?)?)|[CČ]tvrt(?:[aá][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*S[ií]rachovcova|Ecclesiasticus|S(?:[ií]r(?:achovec)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*(?:Moudrosti|moudrost[ií])|M(?:oudrost(?:[\s\xa0]*[SŠ]alomounova)?|dr)|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*n[aá](?:[rř]k[uů])|Lam|Pl[aá](?:[cč][\s\xa0]*Jerem(?:[ij](?:[aá](?:[sš](?:[uů]v)))))?)|Pl|Pl(?:[aá][cč])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Jeremj[aá](?:[sš](?:[uů]v))|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*Zjeven[ií]|Apokalypsa|Rev|Zj(?:even(?:i(?:[\s\xa0]*(?:svat[eé]ho[\s\xa0]*Jana|Janovo))?|í(?:[\s\xa0]*Janovo)?))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Modlitbu[\s\xa0]*Manasse|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:P[aá]t(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))))|[5V](?:\.[\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova)))))|D(?:eut(?:eronomium)?|t))|(?:P[aá]t(?:[aá][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))))|[5V](?:\.[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))))|[5V][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova))|Moj[zž](?:[ií](?:[sš]ova))))|[5V][\s\xa0]*Moj(?:[zž](?:[ií](?:[sš]ova)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:o(?:sh|z(?:ue)?)|z)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|S(?:oudc[uů]|dc?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:uth?|út|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn[ií][\s\xa0]*Ezdr(?:[aá][sš])|I(?:\.[\s\xa0]*Ezdr[aá][sš]|[\s\xa0]*Ezdr[aá][sš])|1(?:\.[\s\xa0]*Ezdr[aá][sš]|[\s\xa0]*Ezdr[aá][sš]|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*Ezdr(?:[aá][sš])|II(?:\.[\s\xa0]*Ezdr[aá][sš]|[\s\xa0]*Ezdr[aá][sš])|2(?:\.[\s\xa0]*Ezdr[aá][sš]|[\s\xa0]*Ezdr[aá][sš]|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		I(?:sa|z(?:a[ij](?:[aá][sš]))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[ayáý][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?))|II(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?)|[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?))|2(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?)|Sam|[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn(?:[ií][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?))|1(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?)|Sam|[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?))|I(?:\.[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?)|[\s\xa0]*(?:kniha[\s\xa0]*Samuelova|S(?:am(?:uel(?:ova)?)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*(?:kniha[\s\xa0]*kr(?:[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?))|II(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)|[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?))|2(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)|[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)|Kgs))|Druh(?:[ayáý][\s\xa0]*Kr(?:[aá]l(?:ovsk[aá])?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn[ií][\s\xa0]*(?:kniha[\s\xa0]*kr(?:[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?))|1(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)|[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)|Kgs)|I(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)|[\s\xa0]*(?:kniha[\s\xa0]*kr[aá]lovsk[aá]|Kr(?:[aá]l(?:ovsk[aá])?)?)))|Prvn(?:[ií][\s\xa0]*Kr(?:[aá]l(?:ovsk[aá])?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[ayáý][\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?))|II(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)|[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?))|2(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)|[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn(?:[ií][\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?))|1(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)|[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)|Chr)|I(?:\.[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)|[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopis[uů]|Kronik|Pa(?:ralipomenon)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:ra|d(?:r[aá][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:em[ij](?:[aá][sš]))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ester[\s\xa0]*(?:\(řecké[\s\xa0]*(?:dodatky\)|části\))|(?:[rř]eck(?:[eé][\s\xa0]*(?:dodatky|[cč](?:[aá]sti)))))|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:er|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:[oó]b|b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*[zž]alm[uů]|Ps|(?:[ZŽ](?:almy?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Azarj[aá](?:[sš]ova[\s\xa0]*modlitba)|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Pr[ií]slov(?:[ií][\s\xa0]*(?:[SŠ]alomounova))|P(?:r(?:[ií]s|ov)?|ř[ií]s(?:lov(?:[ií][\s\xa0]*(?:[SŠ]alomounova))?)?)|Př|P[řr](?:[íi]slov[íi])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|K(?:ohelet|az(?:atel)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P[ií]se(?:[nň][\s\xa0]*ml(?:[aá]denc(?:[uů][\s\xa0]*v[\s\xa0]*ho(?:[rř](?:[ií]c(?:[ií][\s\xa0]*peci))))))|T[rř]i[\s\xa0]*mu(?:[zž]i[\s\xa0]*v[\s\xa0]*rozp(?:[aá]len(?:[eé][\s\xa0]*peci)))|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|P[ií]s(?:e(?:[nň][\s\xa0]*(?:(?:[SŠ]alamounova|p[ií]sn[ií])))?))|P(?:[ií]s)|P(?:[íi]se[nň])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:er(?:em[ij](?:[aá][sš]))?|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:e(?:chiel|k))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Da(?:n(?:iel)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hos|Oz(?:e[aá][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:óel|l|o(?:el)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ámos|Am(?:os)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad(?:j[aá][sš]?)?|Abd(?:i(?:j[aá][sš]|[aá][sš]))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jon(?:a[hsš]|á[sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mich[ae](?:[aá][sš])|Mi(?:ch?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Na(?:h(?:um)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ab(?:akuk|k)|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|S(?:ofon[ij](?:[aá][sš])|f))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag|Ag(?:geus|eus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ech|a(?:char[ij](?:[aá][sš]))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:achi[aá][sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*podle[\s\xa0]*Matou[sš]e|M(?:at(?:ou(?:[sš](?:ovo[\s\xa0]*evangelium)?)|t)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*podle[\s\xa0]*Marka|M(?:ar(?:ek|k(?:ovo[\s\xa0]*evangelium)?)|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*podle[\s\xa0]*Luk[aá](?:[sš]e)|L(?:uk(?:(?:[aá](?:[sš](?:ovo[\s\xa0]*evangelium)?))|e)|k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn[ií][\s\xa0]*(?:list[\s\xa0]*Jan(?:[uů]v|J(?:an(?:ova|[uů]v)?)?))|1(?:John|\.[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)|[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?))|I(?:\.[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)|[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)))|Prvn(?:[ií][\s\xa0]*J(?:an(?:ova|[uů]v)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*(?:list[\s\xa0]*Jan(?:[uů]v|J(?:an(?:ova|[uů]v)?)?))|II(?:\.[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)|[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?))|2(?:John|\.[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)|[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)))|Druh(?:[ayáý][\s\xa0]*J(?:an(?:ova|[uů]v)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:T[rř]et(?:[ií][\s\xa0]*(?:list[\s\xa0]*Jan(?:[uů]v|J(?:an(?:ova|[uů]v)?)?)))|III(?:\.[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)|[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?))|3(?:John|\.[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)|[\s\xa0]*(?:list[\s\xa0]*Jan[uů]v|J(?:an(?:ova|[uů]v)?)?)))|T(?:[rř]et(?:[ií][\s\xa0]*J(?:an(?:ova|[uů]v)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*podle[\s\xa0]*Jana|J(?:ohn|an(?:ovo[\s\xa0]*evangelium)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|Sk(?:utky(?:[\s\xa0]*apo(?:[sš]tol(?:sk[eé]|[uů])))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*[RŘ](?:[ií]man(?:[uů]m))|R(?:[ioí]m)?|Ř(?:[ií]m)?)|[ŘR](?:[ií]man(?:[uů]m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		Druh[ayáý][\s\xa0]*Korintsk(?:[yý]m)|(?:Druh[ayáý](?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk(?:[yý]m|sk[yý]m)|K)|K))|II(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:orintsk[yý]m)?)|\.(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:orintsk[yý]m)?)|K)|K)|2(?:Cor|[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:or(?:intsk[yý]m)?)?)|\.(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:orintsk[yý]m)?)|K)|K(?:or)?))|Druh[ayáý](?:[\s\xa0]*list[\s\xa0]*Korinsk(?:[yý]m|K))|Druh(?:[ayáý]K)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		Prvn[ií][\s\xa0]*Kor(?:intsk(?:[yý]m)?)|Prvn(?:[ií][\s\xa0]*Kor)|(?:Prvn[ií](?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk(?:[yý]m|sk[yý]m)|K)|K))|1(?:Cor|[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:or(?:intsk[yý]m)?)?)|\.(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:or(?:intsk[yý]m)?)?)|K)|K)|I(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:or(?:intsk[yý]m)?)?)|\.(?:[\s\xa0]*(?:list[\s\xa0]*Korin(?:tsk[yý]m|sk[yý]m)|K(?:or(?:intsk[yý]m)?)?)|K)|K))|Prvn[ií](?:[\s\xa0]*list[\s\xa0]*Korinsk(?:[yý]m|K))|Prvn(?:[ií]K)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Galatsk[yý]m|Ga(?:l(?:atsk[yý]m)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Ef(?:ez(?:an[uů]m|sk[yý]m)|ézsk[yý]m)|E(?:ph|f(?:e(?:zsk[yý]m|sk[yý]m))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Filipsk[yý]m|Phil|F(?:ilip(?:ensk[yý]m|sk[yý]m)|p))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Kolos(?:an[uů]m|k[yý]m)|Col|Ko(?:l(?:os(?:sensk[yý]m|ensk[yý]m|an[uů]m|k[yý]m))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick(?:[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))|II(?:\.[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?)|[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))|2(?:Thess|\.[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?)|[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?)))|Druh[ayáý][\s\xa0]*(?:Sol(?:u(?:[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))|Druh(?:[ayáý][\s\xa0]*(?:Sol|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn[ií][\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick(?:[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))|1(?:Thess|\.[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?)|[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))|I(?:\.[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?)|[\s\xa0]*(?:list[\s\xa0]*(?:Tesalonick[yý]m|Solu[nň]sk(?:[yý]m))|Sol(?:u[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?)))|Prvn[ií][\s\xa0]*(?:Sol(?:u(?:[nň]sk(?:[yý]m))?|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))|Prvn(?:[ií][\s\xa0]*(?:Sol|Te(?:s(?:salonicensk[yý]m|alonick[yý]m))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*(?:list[\s\xa0]*Tim(?:[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m)))|II(?:\.[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))|[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m)))|2(?:\.[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))|[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))|Tim))|Druh(?:[ayáý][\s\xa0]*T(?:im(?:ote(?:ovi|us))?|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn[ií][\s\xa0]*(?:list[\s\xa0]*Tim(?:[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m)))|1(?:\.[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))|[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))|Tim)|I(?:\.[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))|[\s\xa0]*(?:list[\s\xa0]*Tim[eo]teovi|T(?:im(?:ote(?:ovi|us))?|m))))|Prvn(?:[ií][\s\xa0]*T(?:im(?:ote(?:ovi|us))?|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Titovi|T(?:it(?:ovi|us)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Filemonovi|Phlm|F(?:ilemon(?:ovi)?|lm|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*(?:Hebrej[uů]m|[ZŽ]id(?:[uů]m))|Heb(?:rej[uů]m)?|[ZŽ](?:id(?:[uů]m|d)))|(?:[ZŽ]d)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Jakub[uů]v|J(?:a(?:k(?:ub)?|s)|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh[ayáý][\s\xa0]*(?:list[\s\xa0]*Petr(?:[uů]v|P(?:etr(?:ova|[uů]v)?|t)?))|II(?:\.[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?)|[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?))|2(?:\.[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?)|Pet|[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?)))|Druh(?:[ayáý][\s\xa0]*P(?:etr(?:ova|[uů]v)?|t)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn[ií][\s\xa0]*(?:list[\s\xa0]*Petr(?:[uů]v|P(?:etr(?:ova|[uů]v)?|t)?))|1(?:\.[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?)|Pet|[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?))|I(?:\.[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?)|[\s\xa0]*(?:list[\s\xa0]*Petr[uů]v|P(?:etr(?:ova|[uů]v)?|t)?)))|Prvn(?:[ií][\s\xa0]*P(?:etr(?:ova|[uů]v)?|t)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Jud[uů]v|J(?:d|u(?:d(?:ova|[ae]))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:óbi(?:j[aá][sš]|t)|ob(?:i(?:j[aá][sš]|[aá][sš]|t))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:dt|(?:[uú]d(?:it)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kniha[\s\xa0]*B(?:[aá]ru(?:chova|kova))|B(?:[aá]r(?:u(?:ch|k))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sus|Zuz(?:ana)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[ayáý][\s\xa0]*Mak(?:abejsk[aá])?)|II(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?)|2(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:T(?:[rř]et(?:[ií][\s\xa0]*Mak(?:abejsk[aá])?))|III(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?)|3(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[CČ]tvrt(?:[aá][\s\xa0]*Mak(?:abejsk[aá])?))|IV(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?)|4(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prvn(?:[ií][\s\xa0]*Mak(?:abejsk[aá])?)|1(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?|Macc)|I(?:\.[\s\xa0]*Mak(?:abejsk[aá])?|[\s\xa0]*Mak(?:abejsk[aá])?))
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

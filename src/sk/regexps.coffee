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
				  | title (?! [a-z] )		#could be followed by a number
				  | ver[šs]ov | kapitoly | kapitole | kapitolu | kapitol | hlavy | a[žz] | porov | pozri | alebo | kap | ff | - | a
				  | [b-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* title
	| \d \W* ff (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [b-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Prv[áa]#{bcv_parser::regexps.space}+kniha|Prv[ýy]#{bcv_parser::regexps.space}+list|Prv[áa]|Prv[ýy]|1#{bcv_parser::regexps.space}+k|I|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Druh[áa]#{bcv_parser::regexps.space}+kniha|Druh[ýy]#{bcv_parser::regexps.space}+list|Druh[áa]|Druh[ýy]|2#{bcv_parser::regexps.space}+k|II|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Tretia#{bcv_parser::regexps.space}+kniha|Tretia|Tret[íi]|3#{bcv_parser::regexps.space}+k|III|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:porov|pozri|alebo|a)|(?:a[žz]|-))"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|(?:a[žz]|-))"
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
		(?:1[\s\xa0]*Moj[zž]i[sš]ova)|(?:K(?:\.[\s\xa0]*p[o\xF4]|[\s\xa0]*p[o\xF4]|niha[\s\xa0]*p[o\xF4])vodu|G(?:enezis|n)|1[\s\xa0]*M|Gen|K(?:niha|\.)?[\s\xa0]*stvorenia|(?:1[\s\xa0]*k|I)[\s\xa0]*Moj[zž]i[sš]ova|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Moj[zž]i[sš]ova|Prv(?:[y\xFD][\s\xa0]*list[\s\xa0]*Moj[zž]i[sš]|[y\xFD][\s\xa0]*Moj[zž]i[sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Moj[zž]i[sš]))ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Moj[zž]i[sš]ova|Exodus)|(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Moj[zž]i[sš]|[y\xFD][\s\xa0]*Moj[zž]i[sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Moj[zž]i[sš]))ova|(?:2[\s\xa0]*k|II)[\s\xa0]*Moj[zž]i[sš]ova|Exod|2[\s\xa0]*M|Ex|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Moj[zž]i[sš]ova)
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
		(?:3[\s\xa0]*Moj[zž]i[sš]ova)|(?:(?:3[\s\xa0]*k|III)[\s\xa0]*Moj[zž]i[sš]ova|L(?:evitikus|v)|3[\s\xa0]*M|Lev|(?:3(?:[\s\xa0]*k)?|III)\.[\s\xa0]*Moj[zž]i[sš]ova|Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Moj[zž]i[sš])|[\s\xa0]*Moj[zž]i[sš])|\xED[\s\xa0]*Moj[zž]i[sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:4[\s\xa0]*Moj[zž]i[sš]ova)|(?:(?:4[\s\xa0]*k|IV)[\s\xa0]*Moj[zž]i[sš]ova|N(?:umeri|m)|4[\s\xa0]*M|Num|(?:4(?:[\s\xa0]*k)?|IV)\.[\s\xa0]*Moj[zž]i[sš]ova|[SŠ]tvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Moj[zž]i[sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:\.[\s\xa0]*(?:Sirachov(?:c(?:ov)?|ho[\s\xa0]*syn)a|Ekleziastikus)|[\s\xa0]*(?:Sirachov(?:c(?:ov)?|ho[\s\xa0]*syn)a|Ekleziastikus)|niha[\s\xa0]*(?:Sirachov(?:c(?:ov)?|ho[\s\xa0]*syn)a|Ekleziastikus))|Sir(?:achovcova|achovec)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M[u\xFA]d(?:ros(?:ti?|ť))?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:\.[\s\xa0]*n[a\xE1]|[\s\xa0]*n[a\xE1]|niha[\s\xa0]*n[a\xE1])rekov|N[a\xE1]reky|Lam|[ZŽ]alospevy|Pla[cč][\s\xa0]*Jeremi[a\xE1][sš]ov|[ZŽ]alosp|N[a\xE1]r|Jeremi[a\xE1][sš]ov[\s\xa0]*Pla[cč])|(?:Pla[cč])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremi[a\xE1][sš]ov[\s\xa0]*list|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zj(?:av(?:enie(?:[\s\xa0]*(?:sv[a\xE4]t[e\xE9]ho[\s\xa0]*J[a\xE1]|J[a\xE1]|Apo[sš]tola[\s\xa0]*J[a\xE1])na)?)?|v)?|Apokalypsa|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Manasesova[\s\xa0]*modlitba|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:5[\s\xa0]*Moj[zž]i[sš]ova)|(?:D(?:euteron[o\xF3]mium|t)|5[\s\xa0]*M|Deut|(?:5[\s\xa0]*k|V)[\s\xa0]*Moj[zž]i[sš]ova|(?:5(?:[\s\xa0]*k)?|V)\.[\s\xa0]*Moj[zž]i[sš]ova|Piata[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Moj[zž]i[sš])ova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:o(?:z(?:u[ae]|uova)?|šu(?:ov)?a|s(?:u(?:ov)?a|h))|\xF3zu(?:ov)?a)|Iosua)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:udcovia|dc)|Judg|Sud(?:cov)?|K\.?[\s\xa0]*sudcov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:\xFAt|uth?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|[y\xFD][\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|Ezdr[a\xE1][sš](?:ova)?))|(?:1[\s\xa0]*k|I)[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|1(?:[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|Esd)|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|[y\xFD][\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|Ezdr[a\xE1][sš](?:ova)?))|(?:2[\s\xa0]*k|II)[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|2(?:[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?|Esd)|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Ezdr[a\xE1][sš](?:ova)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:I(?:z(?:a[ij][a\xE1][sš])?|sa))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Samuelova)|(?:(?:2[\s\xa0]*k|II)[\s\xa0]*Samuelova|2(?:[\s\xa0]*?Sam|[\s\xa0]*S)|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Samuelova|Druh(?:(?:[y\xFD][\s\xa0]*list|[y\xFD])[\s\xa0]*|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*)?)Samuelova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Samuelova)|(?:(?:1[\s\xa0]*k|I)[\s\xa0]*Samuelova|1(?:[\s\xa0]*?Sam|[\s\xa0]*S)|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Samuelova|Prv(?:(?:[y\xFD][\s\xa0]*list|[y\xFD])[\s\xa0]*|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*)?)Samuelova)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Kr[a\xE1][lľ]ov|[\s\xa0]*Kr[lľ]|Kgs|[\s\xa0]*Kr)|(?:Druh[y\xFD]|4)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:I[IV]|4[\s\xa0]*k|2[\s\xa0]*k)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:(?:I[IV]|4[\s\xa0]*k|4|2(?:[\s\xa0]*k)?)\.|Druh[y\xFD][\s\xa0]*list)[\s\xa0]*Kr[a\xE1][lľ]ov|Druh[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Kr[a\xE1][lľ]|Kr[a\xE1][lľ])ov|[SŠ]tvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Kr[a\xE1][lľ]|Kr[a\xE1][lľ])ov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Kr[a\xE1][lľ]ov|[\s\xa0]*Kr[lľ]|Kgs|[\s\xa0]*Kr)|(?:Prv[y\xFD]|3)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:3[\s\xa0]*k|III|I|1[\s\xa0]*k)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:(?:3[\s\xa0]*k|III|[3I]|1(?:[\s\xa0]*k)?)\.|Prv[y\xFD][\s\xa0]*list)[\s\xa0]*Kr[a\xE1][lľ]ov|Prv[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Kr[a\xE1][lľ]|Kr[a\xE1][lľ])ov|Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*Kr[a\xE1][lľ]|Kr[a\xE1][lľ])|[\s\xa0]*Kr[a\xE1][lľ])|\xED[\s\xa0]*Kr[a\xE1][lľ])ov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|[y\xFD][\s\xa0]*Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|[y\xFD][\s\xa0]*Paralipomenon|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon))|2(?:[\s\xa0]*Kroni(?:ck[a\xE1]|k)|[\s\xa0]*Kron\xEDk|[\s\xa0]*Krn|Chr|[\s\xa0]*Kron|[\s\xa0]*Paralipomenon)|(?:2[\s\xa0]*k|II)[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:[y\xFD][\s\xa0]*list[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|[y\xFD][\s\xa0]*Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|[y\xFD][\s\xa0]*Paralipomenon|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon))|1(?:[\s\xa0]*Kroni(?:ck[a\xE1]|k)|[\s\xa0]*Kron\xEDk|[\s\xa0]*Krn|Chr|[\s\xa0]*Kron|[\s\xa0]*Paralipomenon)|(?:1[\s\xa0]*k|I)[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez(?:d(?:r[a\xE1][sš])?|ra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Neh(?:emi[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:G(?:r[e\xE9]cke[\s\xa0]*[cč]asti[\s\xa0]*knihy[\s\xa0]*Ester|kEsth)|Ester[\s\xa0]*gr)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:er|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:\.[\s\xa0]*J[o\xF3]|[\s\xa0]*J[o\xF3]|niha[\s\xa0]*J[o\xF3])bova|J[o\xF3]b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ZŽ]al(?:t[a\xE1]r|my)|Ps|[ZŽ](?:alm)?|K(?:\.[\s\xa0]*[zž]|[\s\xa0]*[zž]|niha[\s\xa0]*[zž])almov)
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
		(?:K(?:\.[\s\xa0]*pr[i\xED]slov[i\xED]|[\s\xa0]*pr[i\xED]slov[i\xED]|niha[\s\xa0]*pr[i\xED]slov[i\xED])|Pr(?:[i\xED]slovia|ov|[i\xED]s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kazate[lľ])|(?:K(?:[\s\xa0]*kazate[lľ]ova|az|\.[\s\xa0]*kazate[lľ]ova|niha[\s\xa0]*kazate[lľ]ova|oh(?:elet(?:[\s\xa0]*—[\s\xa0]*Kazate[lľ])?)?)|E(?:kleziastes|ccl))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Piese[nň][\s\xa0]*ml[a\xE1]dencov[\s\xa0]*v[\s\xa0]*ohnivej[\s\xa0]*peci|SgThree|Traja[\s\xa0]*ml[a\xE1]denci[\s\xa0]*v[\s\xa0]*rozp[a\xE1]lenej[\s\xa0]*peci)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Piese[nň][\s\xa0]*[SŠ]alam[u\xFA]nova)|(?:V(?:e[lľ]p(?:iese[nň][\s\xa0]*[SŠ]alam[u\xFA]nova)?|[lľ]p)|P(?:iese[nň][\s\xa0]*piesn[i\xED]|Š)|Song|Pies)|(?:Ve[lľ]piese[nň]|Piese[nň])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jer(?:emi[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez(?:e(?:chiel|k))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dan(?:iel)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ho(?:ze[a\xE1][sš]|s)|Oz(?:e[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[A\xC1]m(?:os)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ob(?:ad(?:i[a\xE1][sš])?|edi[a\xE1][sš])|Abd(?:i[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jon(?:\xE1[sš]|a[hsš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mic(?:h(?:e[a\xE1][sš])?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:N(?:ah(?:um)?|\xE1hum))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab(?:akuk)?|Ab(?:akuk)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sof(?:oni[a\xE1][sš])?|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ag(?:geus|eus)?|Hag(?:geus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Z(?:ach(?:ari[a\xE1][sš])?|ech))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:achi[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:at(?:[u\xFA][sš]a|t)|t|at[u\xFA][sš])|Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*Mat[u\xFA][sš]a)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*Marka|M(?:ar(?:ek|ka)|k|ark))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:uk(?:[a\xE1][sš]a|e)|k|uk[a\xE1][sš])|Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*Luk[a\xE1][sš]a)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*J[a\xE1]nov)|(?:Prv(?:[y\xFD][\s\xa0]*J[a\xE1]nov[\s\xa0]*list|[y\xFD][\s\xa0]*list[\s\xa0]*J[a\xE1]nov|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*J[a\xE1]|J[a\xE1])nov)|(?:1[\s\xa0]*k|I)[\s\xa0]*J[a\xE1]nov|1(?:(?:Joh|[\s\xa0]*J)n|[\s\xa0]*J)|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*J[a\xE1]nov)|(?:Prv[y\xFD][\s\xa0]*J[a\xE1]nov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*J[a\xE1]nov)|(?:Druh(?:[y\xFD][\s\xa0]*J[a\xE1]nov[\s\xa0]*list|[y\xFD][\s\xa0]*list[\s\xa0]*J[a\xE1]nov|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*J[a\xE1]|J[a\xE1])nov)|(?:2[\s\xa0]*k|II)[\s\xa0]*J[a\xE1]nov|2(?:(?:Joh|[\s\xa0]*J)n|[\s\xa0]*J)|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*J[a\xE1]nov)|(?:Druh[y\xFD][\s\xa0]*J[a\xE1]nov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3[\s\xa0]*J[a\xE1]nov)|(?:Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*J[a\xE1]|J[a\xE1])nov|[\s\xa0]*J[a\xE1]nov[\s\xa0]*list)|\xED[\s\xa0]*J[a\xE1]nov[\s\xa0]*list)|(?:3[\s\xa0]*k|III)[\s\xa0]*J[a\xE1]nov|3(?:(?:Joh|[\s\xa0]*J)n|[\s\xa0]*J)|(?:3(?:[\s\xa0]*k)?|III)\.[\s\xa0]*J[a\xE1]nov)|(?:Tret[i\xED][\s\xa0]*J[a\xE1]nov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:(?:oh)?n|[a\xE1]na|[a\xE1]n)|Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*J[a\xE1]na)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sk(?:utky(?:[\s\xa0]*apo[sš]tolov)?)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rimanom)|(?:(?:R(?:\xEDmsky|o|imsky|i)|List[\s\xa0]*Rimano)m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)|[y\xFD][\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)|Korin(?:t(?:sk[y\xFD]|ano)|ťano)))m|2(?:[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)m|(?:[\s\xa0]*K|C)or)|(?:2[\s\xa0]*k|II)[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)m|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:[y\xFD][\s\xa0]*list[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)|[y\xFD][\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)|Korin(?:t(?:sk[y\xFD]|ano)|ťano)))m|1(?:[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)m|(?:[\s\xa0]*K|C)or)|(?:1[\s\xa0]*k|I)[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)m|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Korin(?:t(?:sk[y\xFD]|ano)|ťano)m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Gala[tť]anom)|(?:Ga(?:latsk[y\xFD]m|l)?|List[\s\xa0]*Gala[tť]anom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Efezanom)|(?:E(?:fezsk[y\xFD]m|ph|f)|List[\s\xa0]*Efezanom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filipsk[y\xFD]m|Phil|Flp|Filipanom|List[\s\xa0]*Filipanom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kolosanom)|(?:Kolosensk[y\xFD]m|[CK]ol|List[\s\xa0]*Kolosanom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))m)|(?:Druh(?:[y\xFD][\s\xa0]*Sol[u\xFA]n[cč]ano|[y\xFD][\s\xa0]*Sol[u\xFA]nsky|[y\xFD][\s\xa0]*Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|[y\xFD][\s\xa0]*list[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))|Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky)))m|(?:2[\s\xa0]*k|II)[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))m|2(?:[\s\xa0]*(?:Sol|Tes)|Thess)|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))m)|(?:Prv(?:[y\xFD][\s\xa0]*Sol[u\xFA]n[cč]ano|[y\xFD][\s\xa0]*Sol[u\xFA]nsky|[y\xFD][\s\xa0]*Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|[y\xFD][\s\xa0]*list[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))|Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky)))m|(?:1[\s\xa0]*k|I)[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))m|1(?:[\s\xa0]*(?:Sol|Tes)|Thess)|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*(?:Tesaloni(?:c(?:k[y\xFD]|ano)|čano)|Sol(?:[u\xFA]n[cč]ano|[u\xFA]nsky))m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Timotej?|[y\xFD][\s\xa0]*Timotej?|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Timotej?|Timotej?))ovi|2(?:[\s\xa0]*Timotej?ovi|[\s\xa0]*?Tim)|(?:2[\s\xa0]*k|II)[\s\xa0]*Timotej?ovi|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Timotej?ovi)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:[y\xFD][\s\xa0]*list[\s\xa0]*Timotej?|[y\xFD][\s\xa0]*Timotej?|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Timotej?|Timotej?))ovi|1(?:[\s\xa0]*Timotej?ovi|[\s\xa0]*?Tim)|(?:1[\s\xa0]*k|I)[\s\xa0]*Timotej?ovi|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Timotej?ovi)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:it(?:ovi|us)|\xEDtovi))|(?:List[\s\xa0]*T[i\xED]tovi|T[i\xED]t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filemonovi)|(?:List[\s\xa0]*Filem[o\xF3]novi|(?:F(?:ile|l)|Phl)m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Hebrej|[ZŽ]id)om)|(?:[ZŽ]id|Hebr|Heb|List[\s\xa0]*Hebrejom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:a(?:k(?:ubov(?:[\s\xa0]*List)?)?|s)|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[y\xFD][\s\xa0]*Petrov[\s\xa0]*list|[y\xFD][\s\xa0]*Petrov|[y\xFD][\s\xa0]*list[\s\xa0]*Petrov|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*)?Petrov)|2(?:(?:[\s\xa0]*P|Pe)t|[\s\xa0]*Petrov)|(?:2[\s\xa0]*k|II)[\s\xa0]*Petrov|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Petrov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:[y\xFD][\s\xa0]*Petrov[\s\xa0]*list|[y\xFD][\s\xa0]*Petrov|[y\xFD][\s\xa0]*list[\s\xa0]*Petrov|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*)?Petrov)|1(?:(?:[\s\xa0]*P|Pe)t|[\s\xa0]*Petrov)|(?:1[\s\xa0]*k|I)[\s\xa0]*Petrov|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Petrov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:\xFAd(?:ov(?:[\s\xa0]*List)?)?|ud(?:ov(?:[\s\xa0]*List)?|e)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tob(?:i[a\xE1][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:niha|\.)?[\s\xa0]*Juditina|J(?:udita|dt|udit))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctvo[\s\xa0]*Baruchovo|Bar(?:uch)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zuzan[ae]|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Ma(?:ch|k)abejcov|[\s\xa0]*Ma(?:ch|k)|Macc)|(?:2[\s\xa0]*k|II)[\s\xa0]*Ma(?:ch|k)abejcov|(?:2(?:[\s\xa0]*k)?|II)\.[\s\xa0]*Ma(?:ch|k)abejcov|Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ma(?:ch|k)|[y\xFD][\s\xa0]*Ma(?:ch|k)|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ma(?:ch|k)|Ma(?:ch|k)))abejcov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3[\s\xa0]*Machabejcov)|(?:(?:3[\s\xa0]*k|III)[\s\xa0]*Machabejcov|3(?:[\s\xa0]*Ma(?:ch|k)|Macc)|(?:3(?:[\s\xa0]*k)?|III)\.[\s\xa0]*Machabejcov|Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|[\s\xa0]*)|\xED[\s\xa0]*)Machabejcov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:4[\s\xa0]*Machabejcov)|(?:(?:4[\s\xa0]*k|IV)[\s\xa0]*Machabejcov|4(?:[\s\xa0]*Ma(?:ch|k)|Macc)|(?:4(?:[\s\xa0]*k)?|IV)\.[\s\xa0]*Machabejcov|[SŠ]tvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*)?Machabejcov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Machabejcov)|(?:Prv(?:[a\xE1][\s\xa0]*(?:Ma(?:ch|k)|kniha[\s\xa0]*Mach)|(?:[y\xFD][\s\xa0]*list|[y\xFD])[\s\xa0]*Mach)abejcov|(?:1[\s\xa0]*k|I)[\s\xa0]*Machabejcov|1(?:[\s\xa0]*Ma(?:ch|k)|Macc)|(?:1(?:[\s\xa0]*k)?|I)\.[\s\xa0]*Machabejcov)
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

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
		(?:Prv(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova)))|[yý][\s\xa0]*(?:list[\s\xa0]*Moj(?:[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova))))|I(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|K(?:niha[\s\xa0]*(?:stvorenia|p[oô]vodu)|\.[\s\xa0]*(?:stvorenia|p[oô]vodu)|[\s\xa0]*(?:stvorenia|p[oô]vodu))|1(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|M(?:oj[zž]i(?:[sš]ova))?))|G(?:en(?:ezis)?|n))|Prv[ayáý][\s\xa0]*Moj(?:[zž]i(?:[sš]ova))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova)))|[yý][\s\xa0]*(?:list[\s\xa0]*Moj(?:[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova))))|II(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|2(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|M(?:oj[zž]i(?:[sš]ova))?))|Ex(?:od(?:us)?)?)|Druh[ayáý][\s\xa0]*Moj(?:[zž]i(?:[sš]ova))
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
		(?:Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova))|[\s\xa0]*Moj[zž]i(?:[sš]ova))|í[\s\xa0]*Moj[zž]i(?:[sš]ova))|III(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|3(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|M(?:oj[zž]i(?:[sš]ova))?))|L(?:ev(?:itikus)?|v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[SŠ]tvrt(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Moj(?:[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova))))|IV(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|4(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|M(?:oj[zž]i(?:[sš]ova))?))|N(?:um(?:eri)?|m))|[SŠ]tvrt(?:[aá][\s\xa0]*Moj(?:[zž]i(?:[sš]ova)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:niha[\s\xa0]*(?:Ekleziastikus|Sirachov(?:ho[\s\xa0]*syna|c(?:ova|a)))|\.[\s\xa0]*(?:Ekleziastikus|Sirachov(?:ho[\s\xa0]*syna|c(?:ova|a)))|[\s\xa0]*(?:Ekleziastikus|Sirachov(?:ho[\s\xa0]*syna|c(?:ova|a))))|Sir(?:achov(?:cova|ec))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:[uú]d(?:ros(?:ti?|ť))?)|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremi[aá](?:[sš]ov[\s\xa0]*Pla[cč])|Pla[cč][\s\xa0]*Jeremi(?:[aá](?:[sš]ov))|K(?:niha[\s\xa0]*n[aá]rekov|\.[\s\xa0]*n[aá]rekov|[\s\xa0]*n[aá]rekov)|(?:[ZŽ]alosp(?:evy)?)|Lam|N(?:[aá]r(?:eky)?))|Pla[čc]
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremi[aá](?:[sš]ov[\s\xa0]*list)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Apokalypsa|Rev|Zj(?:av(?:enie(?:[\s\xa0]*(?:Apo[sš]tola[\s\xa0]*J(?:[aá]na)|sv[aä]t(?:[eé]ho[\s\xa0]*J(?:[aá]na))|J[aá]na))?)?|v)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Manasesova[\s\xa0]*modlitba|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Piata[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i(?:[sš]ova)|Moj[zž]i(?:[sš]ova))|V(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|5(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Moj[zž]i(?:[sš]ova)|[\s\xa0]*Moj[zž]i(?:[sš]ova))|M(?:oj[zž]i(?:[sš]ova))?))|D(?:eut(?:eron[oó]mium)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Iosua|J(?:ózu(?:ova|a)|o(?:šu(?:ova|a)|s(?:u(?:ova|a)|h)|z(?:u(?:ova|[ae]))?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:\.[\s\xa0]*sudcov|[\s\xa0]*sudcov)|Judg|S(?:dc|ud(?:cov(?:ia)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:uth?|út)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|Ezdr(?:[aá](?:[sš](?:ova)?))))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|Ezdr(?:[aá](?:[sš](?:ova)?)))))|I(?:\.[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?)))|1(?:\.[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|[\s\xa0]*(?:k(?:\.[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?)))|Ezdr(?:[aá](?:[sš](?:ova)?)))|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|Ezdr(?:[aá](?:[sš](?:ova)?))))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|Ezdr(?:[aá](?:[sš](?:ova)?)))))|II(?:\.[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?)))|2(?:\.[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|[\s\xa0]*(?:k(?:\.[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?))|[\s\xa0]*Ezdr(?:[aá](?:[sš](?:ova)?)))|Ezdr(?:[aá](?:[sš](?:ova)?)))|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		I(?:sa|z(?:a[ij](?:[aá][sš]))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|Samuelova))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Samuelova|Samuelova)))|II(?:\.[\s\xa0]*Samuelova|[\s\xa0]*Samuelova)|2(?:\.[\s\xa0]*Samuelova|Sam|[\s\xa0]*(?:k(?:\.[\s\xa0]*Samuelova|[\s\xa0]*Samuelova)|S(?:am(?:uelova)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Samuelova|Samuelova))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Samuelova|Samuelova)))|I(?:\.[\s\xa0]*Samuelova|[\s\xa0]*Samuelova)|1(?:\.[\s\xa0]*Samuelova|Sam|[\s\xa0]*(?:k(?:\.[\s\xa0]*Samuelova|[\s\xa0]*Samuelova)|S(?:am(?:uelova)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[SŠ]tvrt(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Kr(?:[aá](?:[lľ]ov)|Kr[aá](?:[lľ]ov))))|Druh(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Kr(?:[aá](?:[lľ]ov)|Kr[aá](?:[lľ]ov)))|[yý][\s\xa0]*(?:list[\s\xa0]*Kr(?:[aá](?:[lľ]ov)|Kr[aá](?:[lľ]ov))))|I[IV](?:\.[\s\xa0]*Kr(?:[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov)))|4(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov))|Kr[aá](?:[lľ]ov)))|2(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov))|Kr(?:[aá](?:[lľ]ov)|[lľ])?)|Kgs))|(?:[SŠ]tvrt(?:[aá][\s\xa0]*Kr(?:[aá](?:[lľ]ov)))|Druh[ayáý][\s\xa0]*Kr(?:[aá](?:[lľ]ov))|I[IV][\s\xa0]*Kr(?:[aá](?:[lľ]ov)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*Kr[aá](?:[lľ]ov)|Kr[aá](?:[lľ]ov))|[\s\xa0]*Kr[aá](?:[lľ]ov))|í[\s\xa0]*Kr[aá](?:[lľ]ov))|Prv(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Kr(?:[aá](?:[lľ]ov)|Kr[aá](?:[lľ]ov)))|[yý][\s\xa0]*(?:list[\s\xa0]*Kr(?:[aá](?:[lľ]ov)|Kr[aá](?:[lľ]ov))))|3(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov))|Kr[aá](?:[lľ]ov)))|I(?:II(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov))|\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov))|1(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Kr[aá](?:[lľ]ov)|[\s\xa0]*Kr[aá](?:[lľ]ov))|Kr(?:[aá](?:[lľ]ov)|[lľ])?)|Kgs))|Prv[ayáý][\s\xa0]*Kr(?:[aá](?:[lľ]ov))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:Paralipomenon|kniha[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|Kron(?:i(?:ck[aá]|k)|ík)))|(?:[yý][\s\xa0]*(?:Paralipomenon|list[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|Kron(?:i(?:ck[aá]|k)|ík))))|II(?:\.[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík)))|2(?:\.[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[\s\xa0]*(?:Paralipomenon|k(?:\.[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík)))|Kr(?:on(?:i(?:ck[aá]|k)|ík)?|n))|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:Paralipomenon|kniha[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|Kron(?:i(?:ck[aá]|k)|ík)))|(?:[yý][\s\xa0]*(?:Paralipomenon|list[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|Kron(?:i(?:ck[aá]|k)|ík))))|I(?:\.[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík)))|1(?:\.[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[\s\xa0]*(?:Paralipomenon|k(?:\.[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[\s\xa0]*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík)))|Kr(?:on(?:i(?:ck[aá]|k)|ík)?|n))|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:ra|d(?:r[aá][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:emi[aá][sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ester[\s\xa0]*gr|G(?:r[eé]cke[\s\xa0]*(?:[cč]asti[\s\xa0]*knihy[\s\xa0]*Ester)|kEsth))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:er|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:niha[\s\xa0]*J[oó]bova|\.[\s\xa0]*J[oó]bova|[\s\xa0]*J[oó]bova)|J[oó]b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ZŽ]almy?)|(?:K(?:niha[\s\xa0]*[zž]almov|\.[\s\xa0]*[zž]almov|[\s\xa0]*[zž]almov)|Ps|[ZŽ](?:alt(?:[aá]r)?))|[ZŽ]
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
		(?:K(?:niha[\s\xa0]*pr[ií]slov[ií]|\.[\s\xa0]*pr[ií]slov[ií]|[\s\xa0]*pr[ií]slov[ií])|Pr(?:(?:[ií]s(?:lovia)?)|ov)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:kleziastes|ccl)|K(?:niha[\s\xa0]*kazate[lľ]ova|\.[\s\xa0]*kazate[lľ]ova|[\s\xa0]*kazate[lľ]ova|az(?:ate[lľ])?|oh(?:elet(?:[\s\xa0]*—[\s\xa0]*Kazate[lľ])?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Traja[\s\xa0]*ml[aá]denci[\s\xa0]*v[\s\xa0]*rozp(?:[aá]lenej[\s\xa0]*peci)|Piese[nň][\s\xa0]*ml(?:[aá]dencov[\s\xa0]*v[\s\xa0]*ohnivej[\s\xa0]*peci)|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|V(?:e[lľ]p(?:iese(?:[nň][\s\xa0]*(?:[SŠ]alam(?:[uú]nova)))?)|[lľ]p)|P(?:ies(?:e[nň][\s\xa0]*(?:(?:[SŠ]alam(?:[uú]nova)|piesn[ií])))?|Š))|Ve(?:[lľ]p)|(?:Ve[ľl]piese[nň]|Piese[nň])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jer(?:emi[aá][sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:e(?:chiel|k))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Dan(?:iel)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ho(?:ze[aá][sš]|s)|Oz(?:e[aá][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Joel
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[AÁ]m(?:os)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ob(?:edi[aá][sš]|ad(?:i[aá][sš])?)|Abd(?:i[aá][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jon(?:a[hsš]|á[sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mic(?:h(?:e[aá][sš])?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:áhum|ah(?:um)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab(?:akuk)?|Ab(?:akuk)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|Sof(?:oni[aá][sš])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag(?:geus)?|Ag(?:geus|eus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ach(?:ari[aá][sš])?|ech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:achi[aá][sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*Mat(?:[uú](?:[sš]a))|M(?:at(?:[uú](?:[sš]a?)|t)|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*Marka|M(?:ar(?:ek|ka?)|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*Luk(?:[aá](?:[sš]a))|L(?:uk(?:[aá](?:[sš]a?)|e)|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:[yý][\s\xa0]*(?:J(?:[aá]nov[\s\xa0]*list|list[\s\xa0]*J[aá]nov))|[aá][\s\xa0]*(?:kniha[\s\xa0]*J(?:[aá]nov|J[aá]nov)))|I(?:\.[\s\xa0]*J[aá]nov|[\s\xa0]*J[aá]nov)|1(?:\.[\s\xa0]*J[aá]nov|John|[\s\xa0]*(?:k(?:\.[\s\xa0]*J[aá]nov|[\s\xa0]*J[aá]nov)|J(?:[aá]nov|n)?)))|Prv(?:[yý][\s\xa0]*list[\s\xa0]*J(?:[aá]nov)|[aá][\s\xa0]*J(?:[aá]nov))|Prv[yý][\s\xa0]*J(?:[aá]nov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:[yý][\s\xa0]*(?:J(?:[aá]nov[\s\xa0]*list|list[\s\xa0]*J[aá]nov))|[aá][\s\xa0]*(?:kniha[\s\xa0]*J(?:[aá]nov|J[aá]nov)))|II(?:\.[\s\xa0]*J[aá]nov|[\s\xa0]*J[aá]nov)|2(?:\.[\s\xa0]*J[aá]nov|John|[\s\xa0]*(?:k(?:\.[\s\xa0]*J[aá]nov|[\s\xa0]*J[aá]nov)|J(?:[aá]nov|n)?)))|Druh(?:[yý][\s\xa0]*list[\s\xa0]*J(?:[aá]nov)|[aá][\s\xa0]*J(?:[aá]nov))|Druh[yý][\s\xa0]*J(?:[áa]nov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tret(?:í[\s\xa0]*J[aá]nov[\s\xa0]*list|i(?:[\s\xa0]*J[aá]nov[\s\xa0]*list|a[\s\xa0]*(?:kniha[\s\xa0]*J[aá]nov|J[aá]nov)))|III(?:\.[\s\xa0]*J[aá]nov|[\s\xa0]*J[aá]nov)|3(?:\.[\s\xa0]*J[aá]nov|John|[\s\xa0]*(?:k(?:\.[\s\xa0]*J[aá]nov|[\s\xa0]*J[aá]nov)|J(?:[aá]nov|n)?)))|Tret[íi][\s\xa0]*J(?:[áa]nov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evanjelium[\s\xa0]*Pod[lľ]a[\s\xa0]*J(?:[aá]na)|J(?:ohn|[aá]na?|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|Sk(?:utky(?:[\s\xa0]*apo[sš]tolov)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Rimanom|R(?:ímskym|im(?:anom|skym)?|om))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|Korin(?:t(?:anom|sk[yý]m)|ťanom)))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|Korin(?:t(?:anom|sk[yý]m)|ťanom))))|II(?:\.[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom))|2(?:\.[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom))|Kor(?:in(?:t(?:anom|sk[yý]m)|ťanom))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|Korin(?:t(?:anom|sk[yý]m)|ťanom)))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|Korin(?:t(?:anom|sk[yý]m)|ťanom))))|I(?:\.[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom))|1(?:\.[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom)|[\s\xa0]*Korin(?:t(?:anom|sk[yý]m)|ťanom))|Kor(?:in(?:t(?:anom|sk[yý]m)|ťanom))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Gala[tť]anom|Ga(?:l(?:a(?:t(?:anom|sk[yý]m)|ťanom))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Efezanom|E(?:ph|f(?:ez(?:anom|sk[yý]m))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Filipanom|Phil|F(?:ilip(?:anom|sk[yý]m)|lp))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Kolosanom|Col|Kol(?:os(?:ensk[yý]m|anom))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym))))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))))|II(?:\.[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym))))|2(?:\.[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|Thess|[\s\xa0]*(?:k(?:\.[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym))))|Sol[uú]n(?:(?:[cč]anom|skym))?|Tes(?:aloni(?:čanom|c(?:anom|k[yý]m)))?)))|2[\s\xa0]*Sol
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym))))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))))|I(?:\.[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym))))|1(?:\.[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|Thess|[\s\xa0]*(?:k(?:\.[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym)))|[\s\xa0]*(?:Tesaloni(?:čanom|c(?:anom|k[yý]m))|Sol[uú]n(?:(?:[cč]anom|skym))))|Sol[uú]n(?:(?:[cč]anom|skym))?|Tes(?:aloni(?:čanom|c(?:anom|k[yý]m)))?)))|1[\s\xa0]*Sol
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Timote(?:jovi|ovi)|Timote(?:jovi|ovi)))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Timote(?:jovi|ovi)|Timote(?:jovi|ovi))))|II(?:\.[\s\xa0]*Timote(?:jovi|ovi)|[\s\xa0]*Timote(?:jovi|ovi))|2(?:\.[\s\xa0]*Timote(?:jovi|ovi)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Timote(?:jovi|ovi)|[\s\xa0]*Timote(?:jovi|ovi))|Tim(?:ote(?:jovi|ovi))?)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Timote(?:jovi|ovi)|Timote(?:jovi|ovi)))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Timote(?:jovi|ovi)|Timote(?:jovi|ovi))))|I(?:\.[\s\xa0]*Timote(?:jovi|ovi)|[\s\xa0]*Timote(?:jovi|ovi))|1(?:\.[\s\xa0]*Timote(?:jovi|ovi)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Timote(?:jovi|ovi)|[\s\xa0]*Timote(?:jovi|ovi))|Tim(?:ote(?:jovi|ovi))?)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*T[ií]tovi|T(?:it(?:ovi|us)?|ít(?:ovi)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Filem[oó]novi|Phlm|F(?:ilem(?:onovi)?|lm))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:List[\s\xa0]*Hebrejom|Heb(?:r(?:ejom)?)?|(?:[ZŽ]id(?:om)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:a(?:k(?:ubov(?:[\s\xa0]*List)?)?|s)|k)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Petrov|Petrov))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Petrov|Petrov(?:[\s\xa0]*list)?)))|II(?:\.[\s\xa0]*Petrov|[\s\xa0]*Petrov)|2(?:\.[\s\xa0]*Petrov|[\s\xa0]*(?:k(?:\.[\s\xa0]*Petrov|[\s\xa0]*Petrov)|P(?:etrov|t))|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Petrov|Petrov))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Petrov|Petrov(?:[\s\xa0]*list)?)))|I(?:\.[\s\xa0]*Petrov|[\s\xa0]*Petrov)|1(?:\.[\s\xa0]*Petrov|[\s\xa0]*(?:k(?:\.[\s\xa0]*Petrov|[\s\xa0]*Petrov)|P(?:etrov|t))|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ud(?:ov(?:[\s\xa0]*List)?|e)?|úd(?:ov(?:[\s\xa0]*List)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tob(?:i[aá][sš])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:K(?:niha[\s\xa0]*Juditina|\.[\s\xa0]*Juditina|[\s\xa0]*Juditina)|J(?:udita?|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Proroctvo[\s\xa0]*Baruchovo|Bar(?:uch)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zuzan[ae]|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Druh(?:(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Ma(?:chabejcov|kabejcov)|Ma(?:chabejcov|kabejcov)))|(?:[yý][\s\xa0]*(?:list[\s\xa0]*Ma(?:chabejcov|kabejcov)|Ma(?:chabejcov|kabejcov))))|II(?:\.[\s\xa0]*Ma(?:chabejcov|kabejcov)|[\s\xa0]*Ma(?:chabejcov|kabejcov))|2(?:\.[\s\xa0]*Ma(?:chabejcov|kabejcov)|[\s\xa0]*(?:k(?:\.[\s\xa0]*Ma(?:chabejcov|kabejcov)|[\s\xa0]*Ma(?:chabejcov|kabejcov))|Ma(?:ch(?:abejcov)?|k(?:abejcov)?))|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tret(?:i(?:a[\s\xa0]*(?:kniha[\s\xa0]*Machabejcov|Machabejcov)|[\s\xa0]*Machabejcov)|í[\s\xa0]*Machabejcov)|III(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*Machabejcov)|3(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*(?:k(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*Machabejcov)|Ma(?:ch(?:abejcov)?|k))|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[SŠ]tvrt(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Machabejcov|Machabejcov)))|IV(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*Machabejcov)|4(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*(?:k(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*Machabejcov)|Ma(?:ch(?:abejcov)?|k))|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Prv(?:(?:[yý][\s\xa0]*(?:list[\s\xa0]*Machabejcov|Machabejcov))|(?:[aá][\s\xa0]*(?:kniha[\s\xa0]*Machabejcov|Ma(?:chabejcov|kabejcov))))|I(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*Machabejcov)|1(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*(?:k(?:\.[\s\xa0]*Machabejcov|[\s\xa0]*Machabejcov)|Ma(?:ch(?:abejcov)?|k))|Macc))
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

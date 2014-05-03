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
				  | see#{bcv_parser::regexps.space}+also | ff(?![a-z0-9]) | f(?![a-z0-9]) | chapters | chapter | through | compare | chapts | verses | chpts | chapt | chaps | verse | chap | thru | also | chp | chs | cha | and | see | ver | vss | ch | to | cf | vs | vv | v
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* title
	| \d+ \W* (?:ff(?![a-z0-9])|f(?![a-z0-9])) (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:1st|1|I|First)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2nd|2|II|Second)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3rd|3|III|Third)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:and|compare|cf|see#{bcv_parser::regexps.space}+also|also|see)|(?:through|thru|to))"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|(?:through|thru|to))"
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
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		G(?:n|e(?:n(?:i(?:[ei]s(?:[eiu]s)|s[eiu]s)|sis|n(?:e(?:is(?:[uie]s)?|es[iue]s|s[eiu]s)|i(?:[ei]s(?:[eiu]s)|s[uie]s)|sis)|e(?:is(?:[ieu]s)?|es[iue]s|s(?:[ei]s?|us)))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ex(?:o(?:d(?:[ui]s|[se])?)?|d)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*(?:and[\s\xa0]*(?:S(?:erpent|nake)|Dragon|the[\s\xa0]*(?:S(?:erpent|nake)|Dragon))|&[\s\xa0]*(?:S(?:erpent|nake)|Dragon|the[\s\xa0]*(?:S(?:erpent|nake)|Dragon))))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:e(?:v(?:i(?:t(?:cus|[ie]cus))?|et(?:cus|[ei]cus))?)?|iv(?:[ie]t(?:cus|[ie]cus))|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:u(?:m(?:b(?:ers?)?)?)?|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ben[\s\xa0]*Sira|The[\s\xa0]*Wisdom[\s\xa0]*of[\s\xa0]*Jesus(?:[\s\xa0]*(?:Son[\s\xa0]*of[\s\xa0]*Sirach|ben[\s\xa0]*Sirach)|,[\s\xa0]*Son[\s\xa0]*of[\s\xa0]*Sirach)|Wisdom[\s\xa0]*of[\s\xa0]*Jesus(?:[\s\xa0]*(?:Son[\s\xa0]*of[\s\xa0]*Sirach|ben[\s\xa0]*Sirach)|,[\s\xa0]*Son[\s\xa0]*of[\s\xa0]*Sirach)|Sir(?:ach)?|Ecc(?:l(?:us(?:iasticus)?|esiasticus)|s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wis(?:[\s\xa0]*of[\s\xa0]*Solomon|om[\s\xa0]*of[\s\xa0]*Solomon|d(?:[\s\xa0]*of[\s\xa0]*Solomon|om(?:[\s\xa0]*of[\s\xa0]*Solomon)?)?)?|The[\s\xa0]*Wis(?:[\s\xa0]*of[\s\xa0]*Solomon|om[\s\xa0]*of[\s\xa0]*Solomon|d(?:[\s\xa0]*of[\s\xa0]*Solomon|om[\s\xa0]*of[\s\xa0]*Solomon)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:a(?:m(?:[ie]ntations?)?)?|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Let(?:[\s\xa0]*of[\s\xa0]*Jeremiah|\.[\s\xa0]*of[\s\xa0]*Jeremiah|ter[\s\xa0]*of[\s\xa0]*Jeremiah)|The[\s\xa0]*(?:Ep(?:[\s\xa0]*of[\s\xa0]*Jeremiah|\.[\s\xa0]*of[\s\xa0]*Jeremiah|istle[\s\xa0]*of[\s\xa0]*Jeremiah)|Let(?:[\s\xa0]*of[\s\xa0]*Jeremiah|\.[\s\xa0]*of[\s\xa0]*Jeremiah|ter[\s\xa0]*of[\s\xa0]*Jeremiah))|Ep(?:\.[\s\xa0]*of[\s\xa0]*Jeremiah|istle[\s\xa0]*of[\s\xa0]*Jerem(?:iah|y)|Jer|[\s\xa0]*(?:of[\s\xa0]*Jeremiah|Jer)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:e(?:v(?:el(?:ations?)?|[oa]lations?|lations?)?)?|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Pr(?:ayer(?:s[\s\xa0]*(?:Manasseh|of[\s\xa0]*Manasseh)|[\s\xa0]*(?:Manasseh|of[\s\xa0]*Manasseh))|[\s\xa0]*(?:Manasseh|of[\s\xa0]*Manasseh))|Pr(?:ayer(?:s[\s\xa0]*(?:Manasseh|of[\s\xa0]*Manasseh)|[\s\xa0]*(?:Manasseh|of[\s\xa0]*Manasseh))|[\s\xa0]*(?:Man(?:asseh)?|of[\s\xa0]*Manasseh)|Man))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:t|e(?:et(?:ron(?:omy|my)|(?:[oe]ron(?:omy|my)))|u(?:t(?:ron(?:omy|my)|(?:[eo]ron(?:omy|my)))?)?)|u(?:et(?:ron(?:omy|my)|(?:[eo]ron(?:omy|my)))?|ut(?:ron(?:omy|my)|(?:[eo]ron(?:omy|my)))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:sh|o(?:s(?:h(?:ua)?|ua)?|us(?:hua|ua)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:gs?|udg(?:es)?|dgs?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:th?|u(?:th?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*Esd(?:r(?:as)?)?|I(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)|1(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?|Esd|st(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?|nd(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)|Esd)|Second[\s\xa0]*Esd(?:r(?:as)?)?|II(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		I(?:s(?:i(?:[ia](?:(?:[ia](?:(?:[ia]ha?|ha?))|ha?))|ha)|a(?:a(?:[ai](?:(?:[ai]ha?|ha?))|ha?)|i(?:[ai](?:(?:[ia]ha?|ha?))|sha?|ha?)?|ha?)?|sah)?|a)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[ls]?)?)?|ma?))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[sl]?)?)?|ma?)))|Second[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|2(?:[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[sl]?)?)?|ma?)?)|nd(?:[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[sl]?)?)?|ma?))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[sl]?)?)?|ma?))|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)?)|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[ls]?)?)?|ma?))|st(?:[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[ls]?)?)?|ma?))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)))|Sam)|I(?:[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[sl]?)?)?|ma?))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[sl]?)?)?|ma?)))|First[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ea]l[sl]?)?)?|ma?)))|Samu(?:[ae]l[ls]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fourth[\s\xa0]*Kingdoms|I(?:I(?:[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?|\.[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?)|V(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms))|Second[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?|2(?:nd(?:[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?|\.[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?)|Kgs|[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?|\.[\s\xa0]*K(?:n(?:gs?|s)?|i(?:n(?:gs?|s)?|gs?|s)?|gs?|s)?)|4(?:th(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:rd(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|I(?:[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?|II(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|\.[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?)|Third[\s\xa0]*Kingdoms|1(?:[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?|Kgs|\.[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?|st(?:[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?|\.[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?))|First[\s\xa0]*K(?:n(?:gs?|s)?|gs?|i(?:n(?:gs?|s)?|gs?)?|s)?)|K(?:gs|in(?:gs)?|ngs)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*(?:C(?:ron(?:[oi]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[io]cles?)?|oron[io]cles?)|Paralipomenon)|\.[\s\xa0]*(?:C(?:ron(?:[io]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[io]cles?)|oron[io]cles?)|Paralipomenon)|nd(?:\.[\s\xa0]*(?:C(?:ron(?:[io]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[io]cles?)|oron[io]cles?)|Paralipomenon)|[\s\xa0]*(?:C(?:ron(?:[oi]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[oi]cles?)|oron[oi]cles?)|Paralipomenon))|Chr)|II(?:\.[\s\xa0]*(?:C(?:ron(?:[io]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[oi]cles?)|oron[oi]cles?)|Paralipomenon)|[\s\xa0]*(?:C(?:ron(?:[oi]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[oi]cles?)|oron[oi]cles?)|Paralipomenon))|Second[\s\xa0]*(?:C(?:ron(?:[io]cles?)?|h(?:r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?|oron[io]cles?)|oron[oi]cles?)|Paralipomenon))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:\.[\s\xa0]*(?:C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)|ron(?:[io]cles?)?|oron[io]cles?)|Paralipomenon)|[\s\xa0]*(?:C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)|ron(?:[io]cles?)?|oron[oi]cles?)|Paralipomenon))|Choronicle|1(?:\.[\s\xa0]*(?:C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)|ron(?:[io]cles?)?|oron[oi]cles?)|Paralipomenon)|Chr|[\s\xa0]*(?:Paralipomenon|C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)?|ron(?:[oi]cles?)?|oron[io]cles?))|st(?:\.[\s\xa0]*(?:C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)|ron(?:[io]cles?)?|oron[io]cles?)|Paralipomenon)|[\s\xa0]*(?:C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)|ron(?:[io]cles?)?|oron[io]cles?)|Paralipomenon)))|First[\s\xa0]*(?:C(?:h(?:oron(?:ocles?|icles)|r(?:o(?:n(?:ocles?|ic(?:les?|als))?)?|n)?)|ron(?:[io]cles?)?|oron[oi]cles?)|Paralipomenon))|(?:C(?:ron[io]cles?|h(?:oron(?:ocles?|icles)|ron(?:ocles?|ic(?:les?|als)))|oron[oi]cles?)|Paralipomenon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:zra?|sra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ne(?:h(?:(?:[ie]m(?:i(?:h|i(?:[ai]h|h)|a(?:[ai]h|h)?)|a(?:h|[ai](?:(?:[ia]h|h)))))|amiah?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:G(?:k(?:Esth|[\s\xa0]*Esth?)|r(?:[\s\xa0]*Esth?|eek[\s\xa0]*Est(?:h(?:er)?)?))|Esther[\s\xa0]*\(Greek\))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Es(?:t(?:h(?:er|r)?|er)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:b|ob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		extra: "1"
		regexp: ///(\b)((?:
			  (?: (?: 1 [02-5] | [2-9] )? (?: 1 #{bcv_parser::regexps.space}* st | 2 #{bcv_parser::regexps.space}* nd | 3 #{bcv_parser::regexps.space}* rd ) ) # Allow 151st Psalm
			| 1? 1 [123] #{bcv_parser::regexps.space}* th
			| (?: 150 | 1 [0-4] [04-9] | [1-9] [04-9] | [4-9] )  #{bcv_parser::regexps.space}* th
			)
			#{bcv_parser::regexps.space}* Psalm
			)\b///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:s(?:l(?:a(?:ms?|lms?)?|m(?:as|[ms])?)|sm?|m(?:ls?|m|a(?:l(?:ms?|s)?)?)?|a(?:a(?:ms|a|lms?)|m(?:ms?|as|l(?:ms?|[sa])?|s)?|l(?:m(?:[mal]s?|s)?|a(?:ms?|s)?|s|lms?)?)?)?|l(?:ms|s(?:s(?:s(?:ss?)?)?|ms?|a(?:ms?)?)|a(?:m(?:as|s)?|as?|s(?:m(?:as?|s)?|s)?))|a(?:m[sl]s|l(?:[lm]s|sms?)|s(?:ss|m(?:ls|s)|lms?)))|Salms?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Azariah?|The[\s\xa0]*Pr(?:[\s\xa0]*of[\s\xa0]*Azariah?|ayer(?:s[\s\xa0]*of[\s\xa0]*Azariah?|[\s\xa0]*of[\s\xa0]*Azariah?))|Pr(?:[\s\xa0]*(?:Azar|of[\s\xa0]*Azariah?)|Az(?:ar|r)|ayer(?:s[\s\xa0]*of[\s\xa0]*Azariah?|[\s\xa0]*of[\s\xa0]*Azariah?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Oroverbs|P(?:o(?:rverbs|verbs)|v|r(?:o(?:b(?:verbs|erbs)|v(?:e(?:bs|rbs?))?)?|v(?:erbs?|bs?)?|everbs?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ec(?:l(?:es(?:i(?:stes|a(?:tes|stes?|iastes))|sia(?:tes|stes)))?|c(?:l(?:es(?:s(?:aistes|ia(?:tes|stes))|a(?:stes|i(?:tes|stes|astes))|i(?:a(?:i(?:stes|astes)|st(?:es?|ies)?|tes?|a(?:tes|stes))|tes|stes|iastes))?)?)?)?|Qo(?:h(?:eleth)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:3[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)|Three[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)|the[\s\xa0]*(?:3[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)|Three[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)))|S(?:[\s\xa0]*(?:of[\s\xa0]*(?:3(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))|Th(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y)|ree(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))))|3(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))|Th(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y)|ree(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))))|ong[\s\xa0]*Three|g(?:Three|[\s\xa0]*Thr(?:ee)?)|\.[\s\xa0]*(?:of[\s\xa0]*(?:3(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))|Th(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y)|ree(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))))|3(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))|Th(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y)|ree(?:[\s\xa0]*(?:Ch|Y)|\.[\s\xa0]*(?:Ch|Y))))|ng[\s\xa0]*Three))|Song[\s\xa0]*of[\s\xa0]*(?:3[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)|Three[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)|the[\s\xa0]*(?:3[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)|Three[\s\xa0]*(?:You(?:ng[\s\xa0]*Men|ths)|Holy[\s\xa0]*Children|Jews)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:o[Sln]?|gs?|ngs?|[\s\xa0]*of[\s\xa0]*S|S)|The[\s\xa0]*Song(?:s[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[oa]ns?|ngs?)|alom[oa]ns?)|[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?)))|Song(?:s(?:[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))?|[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[oa]ns?|ngs?)|alom[oa]ns?))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:r|e(?:r(?:im(?:ah|i(?:[ia]h|h))|m[mi]ah|e(?:m(?:i(?:ih|ah?|e|ha?)?|a(?:h|i(?:ah|h))))?|a(?:m(?:a(?:ih|h)|i(?:ih|ah?|ha?))|iah))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:z(?:e(?:(?:[ie]k(?:el|iel))|k(?:el|i[ae]l)?)?|i(?:(?:[ie]k(?:el|iel))|k(?:el|iel))|k)|x(?:[ei](?:(?:[ie]k(?:el|iel))|k(?:el|iel))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:a(?:n(?:i[ae]l)?)?|[nl])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:o(?:s(?:ea)?)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:l|oel?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Am(?:os?|s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ob(?:idah|a(?:d(?:iah?)?)?|d)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:nh|on(?:ah)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:c(?:ah?|hah?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Na(?:h(?:um?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:bak(?:[ua]kk?|k[ua]kk?)|ak(?:[ua]kk?|k[au]kk?)|k)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:e(?:p(?:h(?:an(?:aiah?|iah?))?)?|faniah?)|ph?|a(?:phaniah?|faniah?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:gg?|ag(?:ai|g(?:ai|ia[hi])?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ch?|e(?:kariah?|c(?:h(?:[ae]r(?:i(?:ih|ah?|h)|a(?:[ia]h|h)))?)?)|a(?:kariah|c(?:h(?:[ae]r(?:i(?:ih|ah?|h)|a(?:[ai]h|h)))?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:ichi|ac(?:hi?|i))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mtt|The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[ht](?:iew|ew))|ew))))?|t)|S(?:aint[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|t(?:\.[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[ht](?:iew|ew))|ew))))?|t)|[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t))))|of[\s\xa0]*(?:M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|S(?:aint[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|t(?:\.[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t))))))|(?:M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[ht](?:iew|ew))|ew))))?|t)|S(?:aint[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[ht](?:iew|ew))|ew))))?|t)|t(?:\.[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t)))|Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|S(?:aint[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|t(?:\.[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t))))|of[\s\xa0]*(?:M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|S(?:aint[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[ht](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[ht](?:iew|ew))|ew))))?|t)|t(?:\.[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:iew|ew))|ew))))?|t)|[\s\xa0]*M(?:at(?:t(?:iew|t(?:iew|h(?:iew|ew)|ew)|ew|h(?:iew|(?:[th](?:iew|ew))|ew|we)|we)?|h(?:iew|ew|(?:[th](?:iew|(?:[ht](?:iew|ew))|ew))))?|t))))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:M(?:rk?|ark?|k)|S(?:aint[\s\xa0]*M(?:rk?|ark?|k)|t(?:\.[\s\xa0]*M(?:rk?|ark?|k)|[\s\xa0]*M(?:rk?|ark?|k))))|of[\s\xa0]*(?:M(?:rk?|ark?|k)|S(?:aint[\s\xa0]*M(?:rk?|ark?|k)|t(?:\.[\s\xa0]*M(?:rk?|ark?|k)|[\s\xa0]*M(?:rk?|ark?|k)))))|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:M(?:rk?|ark?|k)|S(?:aint[\s\xa0]*M(?:rk?|ark?|k)|t(?:\.[\s\xa0]*M(?:rk?|ark?|k)|[\s\xa0]*M(?:rk?|ark?|k))))|of[\s\xa0]*(?:M(?:rk?|ark?|k)|S(?:aint[\s\xa0]*M(?:rk?|ark?|k)|t(?:\.[\s\xa0]*M(?:rk?|ark?|k)|[\s\xa0]*M(?:rk?|ark?|k)))))|M(?:rk?|ark?|k)|S(?:aint[\s\xa0]*M(?:rk?|ark?|k)|t(?:\.[\s\xa0]*M(?:rk?|ark?|k)|[\s\xa0]*M(?:rk?|ark?|k))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		The[\s\xa0]*Gospel[\s\xa0]*(?:of[\s\xa0]*(?:S(?:aint[\s\xa0]*L(?:u(?:ke?)?|k)|t(?:[\s\xa0]*L(?:u(?:ke?)?|k)|\.[\s\xa0]*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k))|according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*L(?:u(?:ke?)?|k)|t(?:[\s\xa0]*L(?:u(?:ke?)?|k)|\.[\s\xa0]*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k)))|(?:S(?:aint[\s\xa0]*L(?:u(?:ke?)?|k)|t(?:[\s\xa0]*L(?:u(?:ke?)?|k)|\.[\s\xa0]*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k)|Gospel[\s\xa0]*(?:of[\s\xa0]*(?:S(?:aint[\s\xa0]*L(?:u(?:ke?)?|k)|t(?:[\s\xa0]*L(?:u(?:ke?)?|k)|\.[\s\xa0]*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k))|according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*L(?:u(?:ke?)?|k)|t(?:[\s\xa0]*L(?:u(?:ke?)?|k)|\.[\s\xa0]*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[oh]n|n)?))|1(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[oh]n|n)?)|John|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[oh]n|n)?)|st(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[oh]n|n)?)|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?)))|First[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[ho]n|n)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[ho]n|n)?)|nd(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[oh]n|n)?)|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?))|John|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?))|II(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[ho]n|n)?))|Second[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[oh]n|n)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[oh]n|n)?)|rd(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?))|John|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[oh]n|n)?))|III(?:[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[nm]?)?|n|h(?:[ho]n|n)?))|Third[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)?|n|h(?:[ho]n|n)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		The[\s\xa0]*Gospel[\s\xa0]*(?:of[\s\xa0]*(?:S(?:t(?:[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[oh]n|n)?))|aint[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[ho]n|n)?))|J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?))|according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?))|aint[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[ho]n|n)?))|J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[oh]n|n)?)))|(?:S(?:t(?:[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?)|\.[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?))|aint[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?))|Gospel[\s\xa0]*(?:of[\s\xa0]*(?:S(?:t(?:[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[oh]n|n)?)|\.[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[oh]n|n)?))|aint[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?))|J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?))|according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?)|\.[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[nm]?)|h(?:[oh]n|n)?))|aint[\s\xa0]*J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?))|J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[oh]n|n)?)))|J(?:phn|n|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Acts[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Apostles|Ac(?:t(?:s(?:ss?|[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Apostles)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:pmans|m(?:ns?|s)?|o(?:amns|s|m(?:s|a(?:n(?:ds|s)?|sn))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:nd(?:[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ai]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|\.[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ia]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?))|[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ia]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|Cor|\.[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ai]ns)|ons))?|i[ao]ns)?|[na]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?))|II(?:[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ia]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|\.[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ai]ns)|ons))?|i[oa]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?))|Second[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ai]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ai]ns)|ons))?|i[oa]ns)?|[na]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|I(?:[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ai]ns)|ons))?|i[oa]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|\.[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ai]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?))|1(?:st(?:[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ia]ns)|ons))?|i[ao]ns)?|[na]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|\.[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ia]ns)|ons))?|i[ao]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?))|[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ai]ns)|ons))?|i[oa]ns)?|[an]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)|Cor|\.[\s\xa0]*C(?:hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians))|o(?:r(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[ao]s|s)?|[ai]ns)|ons))?|i[ao]ns)?|[na]thians)?|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|anthians|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains))|th(?:ians?)?)?)?)))|C(?:or(?:i(?:n(?:ith(?:i(?:nas|ans)|a(?:ns|ins))|t(?:h(?:a(?:i(?:ns|ans)|ns)|o(?:ians|ans)|i(?:ians|n(?:as|s)|a(?:n(?:[oa]s|s)?|[ia]ns)|ons))|i[oa]ns)|[na]thians)|th(?:oans|a(?:ns|ins)|i(?:ians|ns|ans))|inthi(?:ians|ans))|n(?:i(?:nth(?:ians|a(?:ns|ins))|th(?:ians|a(?:i(?:ns|ans)|ns)))|th(?:ains|i(?:ians|ns|ans)))|ri(?:th(?:ians|ains)|nth(?:ians|ains)))|hor(?:anthians|nthians|i(?:nth(?:i(?:ns|ans)|ains)|thians)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		G(?:a(?:l(?:a(?:t(?:o(?:ns|ans)|ns|a(?:ns|s|i(?:ns|[oa]ns)|[ao]ns)|i(?:o(?:n(?:[an]s|s)|s|ans)|a(?:n(?:[ai]s|s)?|s|[ia]ns)|n(?:a(?:ns|s)|s)|i(?:ns|[ao]ns)))?)?|lati(?:ns|[ao]ns))?)?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:sphesians|p(?:e(?:hesians|sians)|h(?:e(?:s(?:ains?|i(?:an[ds]?|ons))?)?|s(?:ians?)?|isians?)?)?|hp(?:[ei]sians)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:l(?:pp?|ip(?:ians|p(?:ians)?)?)|p|i(?:l(?:p(?:eans|i(?:ns|ans?)|a(?:n|ins)|p(?:pians|i(?:ians|ans?))?)?|l(?:l(?:ip(?:pians|i(?:ians|ans?))|p(?:ians|pians))|p(?:pians?|i(?:ans?|ens)|ans)|i(?:p(?:a(?:i(?:ns?|ans)|ns?)|i(?:ians|e(?:ns|ans)|ns|a(?:ns?|[ia]ns))|p(?:pians|a(?:ns|ins)|i(?:[ie]ans|a(?:ns?|ins)|ns)|eans?)|eans?)?)?)|i(?:p(?:a(?:i(?:ns?|ans)|ns?)|e(?:ns|ans)|i(?:ians|ns|ans?|ens)|p(?:a(?:i(?:ns|ans)|ns?)|i(?:ians|ns?|a(?:ns?|[ia]ns)|ens)|pians?|eans?)?)?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		C(?:al(?:l(?:asi[oa]ns|os(?:sians|i[oa]ns))|[ao]s(?:si(?:[ao]ns|i[oa]ns)))|o(?:l(?:os(?:s(?:i(?:ans?|ons)|ans)?|i[oa]ns)|l[oa]si(?:[oa]ns)|as(?:si[oa]ns|i[oa]ns))?)?)|Cal[ao]si(?:[oa]ns)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[ao](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|\.[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[ao](?:ns?|ans))|ns|ions|ens|c(?:i[ea]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?)|2(?:nd(?:[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ea]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|\.[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[ao](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?)|[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ea]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|\.[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|Thess)|Second[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ea]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|\.[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[ao](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?)|1(?:[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|\.[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[ao](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|Thess|st(?:[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ea]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?|\.[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ic]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ae]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?))|First[\s\xa0]*Th(?:s(?:ss?)?|es(?:elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|s(?:al(?:on(?:eans|a(?:i(?:ns?|ans)|ns)|o(?:ians|ans)|i(?:(?:[oa](?:ns?|ans))|ns|ions|ens|c(?:i[ea]ns|ans))|ciens)|lonians)|elon(?:ains|ians?)|oloni(?:ns|ans?)|s)?)?)?)|Thes(?:s(?:elon(?:ains|ians?)|oloni(?:ns|ans?)|al(?:lonians|on(?:eans|a(?:i(?:ns?|ans)|ns)|i(?:(?:[ao](?:ns?|ans))|ns|ions|c(?:i[ea]ns|ans))|o(?:ians|ans)|ciens)))|elon(?:ains|ians?)|olonians?|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|\.[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m))|2(?:Tim|[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|nd(?:[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|\.[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m))|\.[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m))|Second[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:Tim|[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|\.[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|st(?:[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|\.[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)))|I(?:[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m)|\.[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m))|First[\s\xa0]*T(?:omothy|i(?:m(?:ot(?:hy?|y))?)?|himot(?:hy|y)|m))|Timothy?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ti(?:t(?:us)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:ile(?:m(?:on)?)?|mn?|l(?:[ei]mon|mn?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:brew(?:ws|s)|w(?:brew(?:ws|s)|(?:[we]brew(?:ws|s)))|e(?:b(?:e(?:rws|w[ewr]s)|r(?:e(?:s|w(?:ws|s)?)|rws|w(?:es|s)|s)|w(?:ers|res))?|(?:[we]brew(?:ws|s))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:a(?:m(?:es?)?|s)?|ms?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|\.[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?)|2(?:[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|nd(?:[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|\.[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?)|Pet|\.[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?)|Second[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|Pet|\.[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|st(?:[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|\.[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?))|I(?:[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?|\.[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?)|First[\s\xa0]*P(?:tr?|e(?:t(?:er?|r)?|r)?)?)|Peter
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ude|de)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:ob(?:i(?:as|t)?|t)?|b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:d(?:th?|ith?)|ud(?:th?|ith?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		B(?:ar(?:uch)?|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		S(?:hoshana|us(?:annah?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:nd(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|Macc|\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*M(?:a(?:c(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)?|c))|Second[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|II(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:III(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|Third[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|3(?:[\s\xa0]*M(?:ac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|c)|rd(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|Macc|\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:IV(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|Fourth[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|4(?:[\s\xa0]*M(?:ac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|c)|Macc|th(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|I(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|1(?:st(?:\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[se]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)|Macc|\.[\s\xa0]*Mac(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[se]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[es]?|e(?:e[es]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?|[\s\xa0]*M(?:a(?:c(?:c(?:c(?:ab(?:b(?:e[es]?|be)|e(?:e[es]?|s)?))?|ab(?:e(?:e(?:es?|s)?|s)?|b(?:be[se]?|e(?:e[se]?|s)?)))?|ab(?:b(?:be(?:e[se]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?))?)?|c)))|Maccabees
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek", "Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab", "Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ha
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb", "Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hb
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John", "Jonah", "Job", "Josh", "Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jo
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude", "Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:d|ud?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt", "Mark", "Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ma
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil", "Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph", "Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ze
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
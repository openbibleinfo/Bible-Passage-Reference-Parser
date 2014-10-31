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
		G(?:e(?:n(?:i(?:[ei]s(?:[eiu]s)|s[eiu]s)|n(?:i(?:[ei]s(?:[eiu]s)|s[eiu]s)|e(?:es[eiu]s|s[eiu]s|is(?:[eiu]s)?)|sis)|e(?:es[eiu]s|is(?:[eiu]s)?|s(?:us|[ei]s?))|sis)?)?|n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ex(?:d|o(?:d(?:[iu]s|[es])?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*(?:and[\s\xa0]*(?:the[\s\xa0]*(?:Dragon|S(?:erpent|nake))|Dragon|S(?:erpent|nake))|&[\s\xa0]*(?:the[\s\xa0]*(?:Dragon|S(?:erpent|nake))|Dragon|S(?:erpent|nake))))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:iv[ei]t(?:(?:[ei]cus|cus))|e(?:v(?:et(?:[ei]cus|cus)|i(?:t(?:[ei]cus|cus))?)?)?|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:m|u(?:m(?:b(?:ers?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Wisdom[\s\xa0]*of[\s\xa0]*Jesus(?:,[\s\xa0]*Son[\s\xa0]*of[\s\xa0]*Sirach|[\s\xa0]*(?:Son[\s\xa0]*of[\s\xa0]*Sirach|ben[\s\xa0]*Sirach))|Wisdom[\s\xa0]*of[\s\xa0]*Jesus(?:,[\s\xa0]*Son[\s\xa0]*of[\s\xa0]*Sirach|[\s\xa0]*(?:Son[\s\xa0]*of[\s\xa0]*Sirach|ben[\s\xa0]*Sirach))|Ben[\s\xa0]*Sira|Ecc(?:l(?:esiasticus|us(?:iasticus)?)|s)|Sir(?:ach)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Wis(?:om[\s\xa0]*of[\s\xa0]*Solomon|d(?:om[\s\xa0]*of[\s\xa0]*Solomon|[\s\xa0]*of[\s\xa0]*Solomon)|[\s\xa0]*of[\s\xa0]*Solomon)|Wis(?:om[\s\xa0]*of[\s\xa0]*Solomon|[\s\xa0]*of[\s\xa0]*Solomon|d(?:[\s\xa0]*of[\s\xa0]*Solomon|om(?:[\s\xa0]*of[\s\xa0]*Solomon)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:a(?:m(?:[ei]ntations?)?)?|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*(?:Let(?:ter[\s\xa0]*of[\s\xa0]*Jeremiah|\.[\s\xa0]*of[\s\xa0]*Jeremiah|[\s\xa0]*of[\s\xa0]*Jeremiah)|Ep(?:istle[\s\xa0]*of[\s\xa0]*Jeremiah|\.[\s\xa0]*of[\s\xa0]*Jeremiah|[\s\xa0]*of[\s\xa0]*Jeremiah))|Let(?:ter[\s\xa0]*of[\s\xa0]*Jeremiah|\.[\s\xa0]*of[\s\xa0]*Jeremiah|[\s\xa0]*of[\s\xa0]*Jeremiah)|Ep(?:istle[\s\xa0]*of[\s\xa0]*Jerem(?:iah|y)|\.[\s\xa0]*of[\s\xa0]*Jeremiah|[\s\xa0]*(?:of[\s\xa0]*Jeremiah|Jer)|Jer))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:e(?:v(?:[ao]lations?|lations?|el(?:ations?)?)?)?|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Pr(?:ayer(?:s[\s\xa0]*(?:of[\s\xa0]*Manasseh|Manasseh)|[\s\xa0]*(?:of[\s\xa0]*Manasseh|Manasseh))|[\s\xa0]*(?:of[\s\xa0]*Manasseh|Manasseh))|Pr(?:ayer(?:s[\s\xa0]*(?:of[\s\xa0]*Manasseh|Manasseh)|[\s\xa0]*(?:of[\s\xa0]*Manasseh|Manasseh))|[\s\xa0]*(?:of[\s\xa0]*Manasseh|Man(?:asseh)?)|Man))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:u(?:ut(?:(?:[eo]ron(?:omy|my))|ron(?:omy|my))|et(?:(?:[eo]ron(?:omy|my))|ron(?:omy|my))?)|e(?:et(?:(?:[eo]ron(?:omy|my))|ron(?:omy|my))|u(?:t(?:(?:[eo]ron(?:omy|my))|ron(?:omy|my))?)?)|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:o(?:us(?:hua|ua)|s(?:ua|h(?:ua)?)?)|sh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:udg(?:es)?|dgs?|gs?)
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
		(?:First[\s\xa0]*Esd(?:r(?:as)?)?|I(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)|1(?:st(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)|\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*Esd(?:r(?:as)?)?|II(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)|2(?:nd(?:\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?)|\.[\s\xa0]*Esd(?:r(?:as)?)?|[\s\xa0]*Esd(?:r(?:as)?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		I(?:a|s(?:i(?:[ai](?:(?:[ai](?:(?:[ai]ha?|ha?))|ha?))|ha)|sah|a(?:a(?:[ai](?:(?:[ai]ha?|ha?))|ha?)|ha?|i(?:[ai](?:(?:[ai]ha?|ha?))|sha?|ha?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|II(?:\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)))|2(?:nd(?:\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|Sam|[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|I(?:\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)))|1(?:st(?:\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)))|\.[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?))|Sam|[\s\xa0]*(?:Kingdoms|S(?:a(?:m(?:u[ae]l[ls]?)?)?|ma?)?)))|Samu(?:[ae]l[sl]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fourth[\s\xa0]*Kingdoms|4(?:th(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|Second[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?|I(?:V(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|I(?:\.[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?|[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?))|2(?:nd(?:\.[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?|[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?)|\.[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?|Kgs|[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?|s)?|n(?:gs?|s)?|s)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Third[\s\xa0]*Kingdoms|3(?:rd(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|First[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?|1(?:st(?:\.[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?|[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?)|\.[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?|Kgs|[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?)|I(?:II(?:\.[\s\xa0]*Kingdoms|[\s\xa0]*Kingdoms)|\.[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?|[\s\xa0]*K(?:gs?|i(?:gs?|n(?:gs?|s)?)?|n(?:gs?|s)?|s)?))|K(?:gs|in(?:gs)?|ngs)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|II(?:\.[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?))))|2(?:nd(?:\.[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?))))|\.[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron[io]cles?|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)?))|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Choronicle|First[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|I(?:\.[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?))))|1(?:st(?:\.[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?))))|\.[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)))|[\s\xa0]*(?:Paralipomenon|C(?:oron[io]cles?|ron(?:[io]cles?)?|h(?:oron(?:icles|ocles?)|r(?:n|o(?:n(?:ic(?:als|les?)|ocles?)?)?)?)?))|Chr))|(?:Paralipomenon|C(?:oron[oi]cles?|ron[oi]cles?|h(?:oron(?:icles|ocles?)|ron(?:ocles?|ic(?:als|les?)))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:sra|zra?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh[ei]mi(?:i(?:(?:[ai]h|h)|a(?:[ai]h|h)?|h))|Neh[ei]mi(?:a(?:(?:[ai]h|h)?|h))|Neh(?:[ei]mih)|Ne(?:h(?:amiah?|[ei]ma(?:(?:[ai](?:(?:[ai]h|h))|h)))?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esther[\s\xa0]*\(Greek\)|G(?:k(?:[\s\xa0]*Esth?|Esth)|r(?:eek[\s\xa0]*Est(?:h(?:er)?)?|[\s\xa0]*Esth?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Es(?:t(?:er|h(?:er|r)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ob|b)
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
		(?:Salms?|P(?:a(?:l(?:[lm]s|sms?)|m[ls]s|s(?:lms?|m(?:ls|s)|ss))|l(?:a(?:as?|m(?:as|s)?|s(?:m(?:as?|s)?|s)?)|ms|s(?:a(?:ms?)?|ms?|s(?:s(?:ss?)?)?))|s(?:l(?:a(?:lms?|ms?)?|m(?:as|[ms])?)|a(?:a(?:lms?|ms|a)|l(?:lms?|a(?:ms?|s)?|m(?:[alm]s?|s)?|s)?|m(?:as|l(?:[as]|ms?)?|ms?|s)?)?|m(?:a(?:l(?:ms?|s)?)?|ls?|m)?|sm?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Pr(?:ayer(?:s[\s\xa0]*of[\s\xa0]*Azariah?|[\s\xa0]*of[\s\xa0]*Azariah?)|[\s\xa0]*of[\s\xa0]*Azariah?)|Azariah?|Pr(?:ayer(?:s[\s\xa0]*of[\s\xa0]*Azariah?|[\s\xa0]*of[\s\xa0]*Azariah?)|[\s\xa0]*(?:of[\s\xa0]*Azariah?|Azar)|Az(?:ar|r)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Oroverbs|P(?:o(?:rverbs|verbs)|r(?:everbs?|o(?:b(?:verbs|erbs)|v(?:e(?:bs|rbs?))?)?|v(?:erbs?|bs?)?)?|v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ec(?:c(?:l(?:es(?:s(?:aistes|ia(?:stes|tes))|a(?:i(?:astes|stes|tes)|stes)|i(?:iastes|stes|a(?:i(?:astes|stes)|a(?:stes|tes)|st(?:ies|es?)?|tes?)|tes))?)?)?|l(?:es(?:sia(?:stes|tes)|i(?:a(?:iastes|stes?|tes)|stes)))?)?|Qo(?:h(?:eleth)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Children|You(?:ng[\s\xa0]*Men|ths)|Jews)|the[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Children|You(?:ng[\s\xa0]*Men|ths)|Jews)|3[\s\xa0]*(?:Holy[\s\xa0]*Children|You(?:ng[\s\xa0]*Men|ths)|Jews))|3[\s\xa0]*(?:Holy[\s\xa0]*Children|You(?:ng[\s\xa0]*Men|ths)|Jews))|S(?:ong[\s\xa0]*Three|ng[\s\xa0]*Three|\.[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|g(?:Three|[\s\xa0]*Thr(?:ee)?)|[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))))|Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Children|You(?:ths|ng[\s\xa0]*Men)|Jews)|3[\s\xa0]*(?:Holy[\s\xa0]*Children|Jews|You(?:ths|ng[\s\xa0]*Men)))|Three[\s\xa0]*(?:You(?:ths|ng[\s\xa0]*Men)|Jews|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:Jews|Holy[\s\xa0]*Children|You(?:ths|ng[\s\xa0]*Men)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Song(?:s[\s\xa0]*of[\s\xa0]*S(?:alom[ao]ns?|o(?:lom[ao]ns?|ngs?))|[\s\xa0]*of[\s\xa0]*S(?:alom[ao]ns?|o(?:lom[ao]ns?|ngs?)))|S(?:[\s\xa0]*of[\s\xa0]*S|ngs?|S|gs?|o[Sln]?))|Song(?:s(?:[\s\xa0]*of[\s\xa0]*S(?:alom[oa]ns?|o(?:ngs?|lom[ao]ns?)))?|[\s\xa0]*of[\s\xa0]*S(?:alom[ao]ns?|o(?:ngs?|lom[ao]ns?)))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:e(?:r(?:a(?:iah|m(?:a(?:ih|h)|i(?:ih|ah?|ha?)))|im(?:ah|i(?:[ai]h|h))|m[im]ah|e(?:m(?:a(?:i(?:ah|h)|h)|i(?:ih|ah?|e|ha?)?))?)?)?|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:x(?:[ei](?:(?:[ei]k(?:iel|el))|k(?:iel|el)))|z(?:i(?:(?:[ei]k(?:iel|el))|k(?:iel|el))|e(?:(?:[ei]k(?:iel|el))|k(?:i[ae]l|el)?)?|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:a(?:n(?:i[ae]l)?)?|[ln])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:o(?:s(?:ea)?)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:oel?|l)
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
		Mi(?:c(?:hah?|ah?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Na(?:h(?:um?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:bak(?:k[au]kk?|[au]kk?)|ak(?:k[au]kk?|[au]kk?)|k)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:a(?:phaniah?|faniah?)|e(?:faniah?|p(?:h(?:an(?:aiah?|iah?))?)?)|ph?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:ag(?:ai|g(?:ia[hi]|ai)?)?|gg?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z[ae]ch(?:[ae]ra(?:(?:[ai]h|h)))|Z(?:a(?:kariah|c(?:h(?:[ae]ri(?:ih|ah?|h))?)?)|e(?:kariah?|c(?:h(?:[ae]ri(?:ih|ah?|h))?)?)|ch?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:ichi|ac(?:hi?|i))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)|t(?:\.[\s\xa0]*M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)|[\s\xa0]*M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)))|M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t))|of[\s\xa0]*(?:S(?:aint[\s\xa0]*M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)|t(?:\.[\s\xa0]*M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)|[\s\xa0]*M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)))|M(?:at(?:h(?:(?:[ht](?:(?:[ht](?:iew|ew))|iew|ew))|iew|ew)|t(?:h(?:(?:[ht](?:iew|ew))|iew|ew|we)|iew|t(?:h(?:iew|ew)|iew|ew)|ew|we)?)?|t)))|Mtt)|(?:M(?:t|at(?:h(?:ew|(?:[th](?:ew|(?:[th](?:ew|iew))|iew))|iew)|t(?:iew|ew|t(?:iew|h(?:iew|ew)|ew)|we|h(?:ew|(?:[th](?:iew|ew))|iew|we))?)?)|Gospel[\s\xa0]*(?:of[\s\xa0]*(?:M(?:t|at(?:t(?:ew|we|h(?:(?:[ht](?:ew|iew))|iew|ew|we)|t(?:iew|ew|h(?:ew|iew))|iew)?|h(?:iew|ew|(?:[ht](?:ew|(?:[th](?:iew|ew))|iew))))?)|S(?:aint[\s\xa0]*M(?:t|at(?:t(?:we|iew|h(?:iew|ew|(?:[th](?:iew|ew))|we)|ew|t(?:iew|h(?:ew|iew)|ew))?|h(?:iew|ew|(?:[th](?:iew|ew|(?:[ht](?:iew|ew))))))?)|t(?:\.[\s\xa0]*M(?:t|at(?:h(?:iew|ew|(?:[ht](?:ew|(?:[ht](?:iew|ew))|iew)))|t(?:iew|we|ew|h(?:ew|we|(?:[th](?:iew|ew))|iew)|t(?:iew|h(?:ew|iew)|ew))?)?)|[\s\xa0]*M(?:t|at(?:h(?:iew|ew|(?:[ht](?:ew|iew|(?:[th](?:ew|iew)))))|t(?:ew|iew|t(?:h(?:ew|iew)|ew|iew)|we|h(?:we|ew|iew|(?:[ht](?:iew|ew))))?)?))))|according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:t|at(?:h(?:iew|ew|(?:[th](?:iew|(?:[ht](?:iew|ew))|ew)))|t(?:iew|ew|we|h(?:(?:[th](?:ew|iew))|ew|we|iew)|t(?:iew|ew|h(?:ew|iew)))?)?)|[\s\xa0]*M(?:t|at(?:h(?:ew|(?:[th](?:(?:[th](?:ew|iew))|ew|iew))|iew)|t(?:iew|t(?:ew|iew|h(?:ew|iew))|ew|h(?:ew|iew|(?:[ht](?:iew|ew))|we)|we)?)?))|aint[\s\xa0]*M(?:t|at(?:t(?:iew|t(?:ew|iew|h(?:ew|iew))|we|h(?:we|iew|(?:[th](?:iew|ew))|ew)|ew)?|h(?:iew|ew|(?:[ht](?:iew|(?:[th](?:ew|iew))|ew))))?))|M(?:t|at(?:h(?:ew|iew|(?:[ht](?:ew|iew|(?:[ht](?:iew|ew)))))|t(?:ew|iew|h(?:ew|(?:[th](?:ew|iew))|iew|we)|t(?:iew|ew|h(?:iew|ew))|we)?)?)))|S(?:aint[\s\xa0]*M(?:t|at(?:h(?:iew|ew|(?:[ht](?:iew|ew|(?:[ht](?:iew|ew)))))|t(?:iew|t(?:ew|iew|h(?:ew|iew))|we|h(?:(?:[ht](?:iew|ew))|ew|iew|we)|ew)?)?)|t(?:\.[\s\xa0]*M(?:t|at(?:h(?:ew|(?:[ht](?:(?:[ht](?:ew|iew))|iew|ew))|iew)|t(?:ew|we|iew|t(?:ew|iew|h(?:iew|ew))|h(?:ew|(?:[ht](?:iew|ew))|iew|we))?)?)|[\s\xa0]*M(?:t|at(?:h(?:ew|(?:[ht](?:ew|(?:[ht](?:ew|iew))|iew))|iew)|t(?:ew|iew|we|t(?:ew|h(?:iew|ew)|iew)|h(?:iew|we|(?:[ht](?:iew|ew))|ew))?)?))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*M(?:ark?|k|rk?)|t(?:\.[\s\xa0]*M(?:ark?|k|rk?)|[\s\xa0]*M(?:ark?|k|rk?)))|M(?:ark?|k|rk?))|of[\s\xa0]*(?:S(?:aint[\s\xa0]*M(?:ark?|k|rk?)|t(?:\.[\s\xa0]*M(?:ark?|k|rk?)|[\s\xa0]*M(?:ark?|k|rk?)))|M(?:ark?|k|rk?)))|(?:M(?:k|ark?|rk?)|S(?:aint[\s\xa0]*M(?:k|ark?|rk?)|t(?:[\s\xa0]*M(?:rk?|ark?|k)|\.[\s\xa0]*M(?:k|rk?|ark?)))|Gospel[\s\xa0]*(?:of[\s\xa0]*(?:M(?:ark?|rk?|k)|S(?:aint[\s\xa0]*M(?:k|ark?|rk?)|t(?:[\s\xa0]*M(?:rk?|ark?|k)|\.[\s\xa0]*M(?:k|rk?|ark?))))|according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*M(?:k|rk?|ark?)|t(?:\.[\s\xa0]*M(?:ark?|rk?|k)|[\s\xa0]*M(?:ark?|k|rk?)))|M(?:k|ark?|rk?))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*L(?:k|u(?:ke?)?)|t(?:\.[\s\xa0]*L(?:k|u(?:ke?)?)|[\s\xa0]*L(?:k|u(?:ke?)?)))|L(?:k|u(?:ke?)?))|of[\s\xa0]*(?:S(?:aint[\s\xa0]*L(?:k|u(?:ke?)?)|t(?:\.[\s\xa0]*L(?:k|u(?:ke?)?)|[\s\xa0]*L(?:k|u(?:ke?)?)))|L(?:k|u(?:ke?)?)))|(?:L(?:k|u(?:ke?)?)|S(?:aint[\s\xa0]*L(?:k|u(?:ke?)?)|t(?:\.[\s\xa0]*L(?:k|u(?:ke?)?)|[\s\xa0]*L(?:u(?:ke?)?|k)))|Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:L(?:k|u(?:ke?)?)|S(?:aint[\s\xa0]*L(?:k|u(?:ke?)?)|t(?:\.[\s\xa0]*L(?:u(?:ke?)?|k)|[\s\xa0]*L(?:u(?:ke?)?|k))))|of[\s\xa0]*(?:L(?:k|u(?:ke?)?)|S(?:aint[\s\xa0]*L(?:k|u(?:ke?)?)|t(?:\.[\s\xa0]*L(?:k|u(?:ke?)?)|[\s\xa0]*L(?:k|u(?:ke?)?))))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|1(?:st(?:\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?))|\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|John|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?))|I(?:\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|II(?:\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?))|2(?:nd(?:\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?))|\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|John|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Third[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|III(?:\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?))|3(?:rd(?:\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?))|\.[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)|John|[\s\xa0]*J(?:phn|h(?:[ho]n|n)?|n|o(?:phn|nh|on|h[mn]?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:aint[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)|t(?:\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)|[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)))|J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n))|of[\s\xa0]*(?:S(?:aint[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)|t(?:\.[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)|[\s\xa0]*J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)))|J(?:phn|o(?:phn|nh|on|h[mn]?)|h(?:[ho]n|n)?|n)))|(?:J(?:h(?:[oh]n|n)?|n|phn|o(?:nh|phn|h[nm]?|on))|Gospel[\s\xa0]*(?:of[\s\xa0]*(?:S(?:aint[\s\xa0]*J(?:phn|n|h(?:n|[ho]n)?|o(?:nh|phn|h[mn]?|on))|t(?:[\s\xa0]*J(?:n|o(?:nh|on|h[nm]?|phn)|h(?:n|[ho]n)?|phn)|\.[\s\xa0]*J(?:phn|h(?:n|[oh]n)?|o(?:h[mn]?|on|nh|phn)|n)))|J(?:phn|n|h(?:[oh]n|n)?|o(?:nh|h[nm]?|on|phn)))|according[\s\xa0]*to[\s\xa0]*(?:J(?:n|phn|h(?:n|[ho]n)?|o(?:h[mn]?|phn|nh|on))|S(?:aint[\s\xa0]*J(?:phn|o(?:phn|nh|h[nm]?|on)|h(?:n|[ho]n)?|n)|t(?:[\s\xa0]*J(?:n|h(?:n|[oh]n)?|phn|o(?:nh|on|h[nm]?|phn))|\.[\s\xa0]*J(?:phn|n|h(?:[oh]n|n)?|o(?:on|phn|h[nm]?|nh))))))|S(?:aint[\s\xa0]*J(?:n|phn|o(?:nh|on|h[nm]?|phn)|h(?:[oh]n|n)?)|t(?:[\s\xa0]*J(?:o(?:nh|on|phn|h[nm]?)|n|h(?:[oh]n|n)?|phn)|\.[\s\xa0]*J(?:phn|n|o(?:on|nh|h[mn]?|phn)|h(?:n|[ho]n)?))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Acts[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Apostles|Ac(?:t(?:s(?:[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Apostles|ss?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:pmans|m(?:ns?|s)?|o(?:amns|m(?:a(?:sn|n(?:ds|s)?)|s)?|s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|II(?:\.[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?))|2(?:nd(?:\.[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?))|\.[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|1(?:st(?:\.[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?))|\.[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|Cor)|I(?:\.[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)|[\s\xa0]*C(?:hor(?:anthians|i(?:nth(?:ains|i(?:ans|ns))|thians)|nthians)|o(?:r(?:anthians|ri(?:nth(?:ains|ians)|th(?:ains|ians))|n(?:i(?:nth(?:ians|a(?:ins|ns))|th(?:ians|a(?:i(?:ans|ns)|ns)))|th(?:ains|i(?:ians|ans|ns)))|i(?:inthi(?:ians|ans)|th(?:oans|a(?:ins|ns)|i(?:ians|ans|ns))|n(?:[an]thians|ith(?:i(?:ans|nas)|a(?:ins|ns))|t(?:i[ao]ns|h(?:o(?:ians|ans)|a(?:i(?:ans|ns)|ns)|i(?:ians|ons|a(?:[ai]ns|n(?:[ao]s|s)?)|n(?:as|s)))?)?)?)|th(?:ians?)?)?)?)))|C(?:hor(?:nthians|anthians|i(?:thians|nth(?:i(?:ans|ns)|ains)))|or(?:n(?:th(?:ains|i(?:ans|ns|ians))|i(?:th(?:ians|a(?:ns|i(?:ns|ans)))|nth(?:ians|a(?:ins|ns))))|ri(?:th(?:ians|ains)|nth(?:ains|ians))|i(?:th(?:a(?:ns|ins)|oans|i(?:ns|ians|ans))|inthi(?:ans|ians)|n(?:[an]thians|ith(?:a(?:ins|ns)|i(?:nas|ans))|t(?:i[ao]ns|h(?:o(?:ans|ians)|i(?:ians|a(?:[ia]ns|n(?:s|[oa]s)?)|n(?:s|as)|ons)|a(?:ns|i(?:ns|ans))))))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		G(?:a(?:l(?:lati(?:[ao]ns|ns)|a(?:t(?:i(?:i(?:[ao]ns|ns)|a(?:[ai]ns|n(?:[ai]s|s)?|s)|n(?:a(?:ns|s)|s)|o(?:ans|n(?:[an]s|s)|s))|o(?:ans|ns)|a(?:[ao]ns|i(?:[ao]ns|ns)|ns|s)|ns)?)?)?)?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:sphesians|hp(?:[ei]sians)?|p(?:e(?:hesians|sians)|h(?:isians?|e(?:s(?:ains?|i(?:ons|an[ds]?))?)?|s(?:ians?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:l(?:ip(?:ians|p(?:ians)?)?|pp?)|i(?:l(?:l(?:l(?:ip(?:pians|i(?:ians|ans?))|p(?:pians|ians))|p(?:pians?|ans|i(?:ens|ans?))|i(?:p(?:p(?:pians|a(?:ins|ns)|eans?|i(?:[ei]ans|a(?:ins|ns?)|ns))|eans?|i(?:ians|e(?:ans|ns)|a(?:[ai]ns|ns?)|ns)|a(?:i(?:ans|ns?)|ns?))?)?)|i(?:p(?:e(?:ans|ns)|i(?:ians|ens|ans?|ns)|a(?:i(?:ans|ns?)|ns?)|p(?:pians?|eans?|a(?:i(?:ans|ns)|ns?)|i(?:ians|ens|a(?:[ai]ns|ns?)|ns?))?)?)?|p(?:eans|i(?:ans?|ns)|a(?:ins|n)|p(?:pians|i(?:ians|ans?))?)?)?)?|p)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		C(?:al(?:l(?:asi[ao]ns|os(?:sians|i[ao]ns))|[ao]s(?:si(?:[ao]ns|i[ao]ns)))|o(?:l(?:l[ao]si(?:[ao]ns)|as(?:si[ao]ns|i[ao]ns)|os(?:i[ao]ns|s(?:ans|i(?:ons|ans?))?))?)?)|Cal[ao]si(?:[ao]ns)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|II(?:\.[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?)|2(?:Thess|nd(?:\.[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?)|\.[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|1(?:Thess|st(?:\.[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?)|\.[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?)|I(?:\.[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?|[\s\xa0]*Th(?:es(?:al(?:lonians|oni(?:[ci]ans|ons|ans?|ns))|elon(?:ains|ians?)|olonians?|s(?:al(?:lonians|on(?:ciens|eans|o(?:ians|ans)|a(?:i(?:ans|ns?)|ns)|i(?:c(?:i[ae]ns|ans)|ions|ens|(?:[ao](?:ans|ns?))|ns)))|elon(?:ains|ians?)|oloni(?:ans?|ns)|s)?)?|s(?:ss?)?)?))|Thes(?:elon(?:ians?|ains)|al(?:oni(?:[ci]ans|ns|ans?|ons)|lonians)|olonians?|s(?:oloni(?:ans?|ns)|elon(?:ains|ians?)|al(?:lonians|on(?:o(?:ans|ians)|eans|a(?:i(?:ans|ns?)|ns)|ciens|i(?:ions|(?:[ao](?:ans|ns?))|ns|c(?:i[ae]ns|ans))))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|II(?:\.[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m))|2(?:nd(?:\.[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m))|\.[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|1(?:st(?:\.[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m))|\.[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|Tim)|I(?:\.[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)|[\s\xa0]*T(?:himot(?:hy|y)|omothy|i(?:m(?:ot(?:hy?|y))?)?|m)))|Timothy?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ti(?:t(?:us)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:ile(?:m(?:on)?)?|l(?:[ei]mon|mn?)|mn?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:w(?:(?:[ew]brew(?:ws|s))|brew(?:ws|s))|brew(?:ws|s)|e(?:(?:[ew]brew(?:ws|s))|b(?:e(?:rws|w[erw]s)|w(?:ers|res)|r(?:rws|e(?:s|w(?:ws|s)?)|w(?:es|s)|s))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:a(?:m(?:es?)?|s)?|ms?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Second[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|II(?:\.[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?)|2(?:nd(?:\.[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?)|\.[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|Pet|[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|1(?:st(?:\.[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?)|\.[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|Pet|[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?)|I(?:\.[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?|[\s\xa0]*P(?:e(?:r|t(?:er?|r)?)?|tr?)?))|Peter
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
		J(?:ud(?:ith?|th?)|d(?:ith?|th?))
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
		(?:Second[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|II(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|2(?:nd(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|Macc|[\s\xa0]*M(?:a(?:c(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)?|c)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Third[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|III(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|3(?:rd(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|Macc|[\s\xa0]*M(?:ac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|c)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fourth[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|IV(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|4(?:th(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|Macc|[\s\xa0]*M(?:ac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|c)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:First[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|I(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|1(?:st(?:\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)|\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?|Macc|[\s\xa0]*M(?:a(?:c(?:ab(?:b(?:be(?:e[es]?|s)?|e(?:e(?:es?|s)?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be[es]?|e(?:e[es]?|s)?)|e(?:e(?:es?|s)?|s)?)|c(?:ab(?:b(?:be|e[es]?)|e(?:e[es]?|s)?))?)?)?)?|c)))|Maccabees
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
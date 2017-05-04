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
				  | see#{bcv_parser::regexps.space}+also | ff(?![a-z0-9]) | f(?![a-z0-9]) | chapters | chapter | through | compare | chapts | verses | chpts | chapt | chaps | verse | chap | thru | also | chp | chs | cha | and | see | ver | vss | ch | to | cf | vs | vv | v
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* title
	| \d \W* (?:ff(?![a-z0-9])|f(?![a-z0-9])) (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
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
		(?:Genes[ei]s)|(?:G(?:e(?:n(?:n(?:e(?:is(?:[eiu]s)?|s[eiu]s|es[eiu]s)|(?:i[ei]s[eiu]|is[eiu]|si)s)|(?:eis[eiu]|esu|si)s|es[ei]|eis|is[eiu]s|(?:i[ei]|ee)s[eiu]s)?)?|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ex(?:o(?:d(?:[iu]s|[es])?)?|d)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bel(?:[\s\xa0]*(?:and[\s\xa0]*(?:the[\s\xa0]*(?:S(?:erpent|nake)|Dragon)|S(?:erpent|nake)|Dragon)|&[\s\xa0]*(?:the[\s\xa0]*(?:S(?:erpent|nake)|Dragon)|S(?:erpent|nake)|Dragon)))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:e(?:v(?:it[ei]?cus|i|et[ei]?cus)?)?|iv[ei]t[ei]?cus|v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:N(?:u(?:m(?:b(?:ers?)?)?)?|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sirach)|(?:Wisdom[\s\xa0]*of[\s\xa0]*Jesus(?:[\s\xa0]*(?:Son[\s\xa0]*of|ben)|,[\s\xa0]*Son[\s\xa0]*of)[\s\xa0]*Sirach|Ecc(?:l[eu]siasticu)?s|Ben[\s\xa0]*Sira|Sir|Ecclus|The[\s\xa0]*Wisdom[\s\xa0]*of[\s\xa0]*Jesus(?:[\s\xa0]*(?:Son[\s\xa0]*of|ben)|,[\s\xa0]*Son[\s\xa0]*of)[\s\xa0]*Sirach)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wis(?:(?:d(?:om)?)?[\s\xa0]*of[\s\xa0]*Solomon|d(?:om)?|om[\s\xa0]*of[\s\xa0]*Solomon)?|The[\s\xa0]*Wis(?:d(?:om)?|om)?[\s\xa0]*of[\s\xa0]*Solomon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:a(?:m(?:[ei]ntations?)?)?|m))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ep(?:istle[\s\xa0]*of[\s\xa0]*Jeremy|[\s\xa0]*?Jer|istle[\s\xa0]*of[\s\xa0]*Jeremiah|[\s\xa0]*of[\s\xa0]*Jeremiah)|Let[\s\xa0]*of[\s\xa0]*Jeremiah|(?:Let(?:ter|\.)|Ep\.)[\s\xa0]*of[\s\xa0]*Jeremiah|The[\s\xa0]*(?:Ep(?:istle|\.)?|Let(?:ter|\.)?)[\s\xa0]*of[\s\xa0]*Jeremiah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:e(?:v(?:elations?|el|lations?|[ao]lations?)?)?|v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pr(?:ayer(?:s[\s\xa0]*(?:of[\s\xa0]*)?|[\s\xa0]*(?:of[\s\xa0]*)?)Manasseh|[\s\xa0]*Manasseh|[\s\xa0]*?Man|[\s\xa0]*of[\s\xa0]*Manasseh)|The[\s\xa0]*Pr(?:ayer(?:s[\s\xa0]*(?:of[\s\xa0]*)?|[\s\xa0]*(?:of[\s\xa0]*)?)|[\s\xa0]*(?:of[\s\xa0]*)?)Manasseh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Duet[eo]rono?my)|(?:D(?:e(?:u(?:t[eo]rono?my|trono?my|t)?|et(?:[eo]rono?|rono?)my)|uut(?:[eo]rono?|rono?)my|uetrono?my|(?:ue)?t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:o(?:s(?:h?ua|h)?|ush?ua)|sh))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:udg(?:es)?|d?gs|d?g))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:u(?:th?)?|th?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1(?:st)?|I)[\s\xa0]*Esd(?:r(?:as)?)?|1Esd|(?:1(?:st)?|I)\.[\s\xa0]*Esd(?:r(?:as)?)?|First[\s\xa0]*Esd(?:r(?:as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2(?:nd)?|II)[\s\xa0]*Esd(?:r(?:as)?)?|2Esd|(?:2(?:nd)?|II)\.[\s\xa0]*Esd(?:r(?:as)?)?|Second[\s\xa0]*Esd(?:r(?:as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isaisha?)|(?:I(?:s(?:a(?:a(?:[ai](?:[ai]ha?|ha?)|ha?)|i[ai](?:[ai]ha?|ha?)|i?ha?|i)?|i[ai](?:[ai](?:[ai]ha?|ha?)|ha?)|iha|sah)?|a))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2(?:nd)?|II)\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|(?:2(?:nd)?|II)[\s\xa0]*S(?:amu[ae]l[ls]|ma)|Second[\s\xa0]*S(?:amu[ae]l[ls]|ma))|(?:2(?:[\s\xa0]*Samu[ae]l|(?:[\s\xa0]*S|Sa)m|[\s\xa0]*S(?:am?)?|[\s\xa0]*Kingdoms)|(?:2nd|II)[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|(?:2(?:nd)?|II)\.[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|Second[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1st(?:\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|[\s\xa0]*S(?:amu[ae]l[ls]|ma)))|(?:1(?:st(?:\.[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms))|\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|[\s\xa0]*S(?:amu[ae]l[ls]|ma))|(?:First|I\.)[\s\xa0]*S(?:amu[ae]l[ls]|ma)|I[\s\xa0]*S(?:amu[ae]l[ls]|ma))|(?:1(?:[\s\xa0]*Samu[ae]l|(?:[\s\xa0]*S|Sa)m|[\s\xa0]*S(?:am?)?|[\s\xa0]*Kingdoms)|I[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|[1I]\.[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|First[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms))|(?:Samu[ae]l[ls]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:Second|2\.)[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2nd(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|II(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?))s|(?:Second|2\.)[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2nd(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|II(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|2Kgs|(?:4(?:th)?|IV)[\s\xa0]*Kingdoms|(?:4(?:th)?|IV)\.[\s\xa0]*Kingdoms|Fourth[\s\xa0]*Kingdoms)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:1(?:st)?\.|First)[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?|1(?:st)?[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?|I(?:\.[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?))s|(?:1(?:st)?\.|First)[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|1(?:st)?[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|I(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|1Kgs|(?:3(?:rd)?|III)[\s\xa0]*Kingdoms|(?:3(?:rd)?|III)\.[\s\xa0]*Kingdoms|Third[\s\xa0]*Kingdoms)|(?:K(?:in(?:gs)?|n?gs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2[\s\xa0]*C(?:h(?:oron[io]|ron[io])|ron[io])|(?:2nd|II)[\s\xa0]*Chrono|(?:2(?:nd)?|II)\.[\s\xa0]*Chrono|Second[\s\xa0]*Chrono)cles)|(?:(?:2nd|II)[\s\xa0]*(?:C(?:h(?:r(?:on(?:icals|ocle)|n|onicles)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oron[io]cle)|ron(?:[io]cle)?|oron[io]cle)|Paralipomenon)|2(?:[\s\xa0]*C(?:h(?:oron[io]|rono)|ron[io])cle|[\s\xa0]*Chronicle|[\s\xa0]*Chrn|Chr|[\s\xa0]*Chronicals|[\s\xa0]*Coron[io]cles|[\s\xa0]*C(?:h(?:r(?:on?)?)?|ron|oron[io]cle)|[\s\xa0]*Paralipomenon)|(?:2(?:nd)?|II)\.[\s\xa0]*(?:C(?:h(?:r(?:on(?:icals|ocle)|n|onicles)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oron[io]cle)|ron(?:[io]cle)?|oron[io]cle)|Paralipomenon)|Second[\s\xa0]*(?:C(?:h(?:r(?:on(?:icals|ocle)|n|onicles)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oron[io]cle)|ron(?:[io]cle)?|oron[io]cle)|Paralipomenon))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1[\s\xa0]*Ch(?:orono|roni)|(?:1st|I)[\s\xa0]*Chrono|(?:1(?:st)?|I)\.[\s\xa0]*Chrono|First[\s\xa0]*Chrono)cles)|(?:1(?:[\s\xa0]*Chronicle|[\s\xa0]*Chrn|Chr)|(?:1[\s\xa0]*Chorono|Choroni)cle|1[\s\xa0]*C(?:ron[io]|hrono|oron[io])cles|1[\s\xa0]*Chronicals|1[\s\xa0]*Choronicles|1[\s\xa0]*C(?:(?:ron[io]|hrono|oron[io])cle|h(?:r(?:on?)?)?|ron)|1[\s\xa0]*Paralipomenon|(?:1st|I)[\s\xa0]*(?:C(?:h(?:r(?:onocle|n|onicles|onicals)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oronocle)|(?:oron[io]|ron[io])cle|ron)|Paralipomenon)|(?:1(?:st)?|I)\.[\s\xa0]*(?:C(?:h(?:r(?:onocle|n|onicles|onicals)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oronocle)|(?:oron[io]|ron[io])cle|ron)|Paralipomenon)|First[\s\xa0]*(?:C(?:h(?:r(?:onocle|n|onicles|onicals)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oronocle)|(?:oron[io]|ron[io])cle|ron)|Paralipomenon))|(?:C(?:(?:h(?:ron(?:ic(?:al|le)|ocle)|oron[io]cle)|(?:oron[io]|ron[io])cle)s|(?:h(?:ron[io]|orono)|oron[io]|ron[io])cle)|Paralipomenon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:zra?|sra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ne(?:h(?:[ei]m(?:i(?:a[ai]h|a?h|a|i[ai]?h)|a(?:[ai][ai]?)?h)|amiah|amia)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:G(?:r(?:eek[\s\xa0]*Esther|[\s\xa0]*Esth)|k[\s\xa0]*?Esth|r(?:eek[\s\xa0]*Esth?|[\s\xa0]*Est)|k[\s\xa0]*Est)|Esther[\s\xa0]*\(Greek\))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Es(?:t(?:h(?:er|r)?|er)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jo?b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
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
		(?:Psmals)|(?:Ps(?:a(?:(?:lm[alm]|mm)s?|(?:l[al]|ml)ms?|alms?)|(?:m(?:alm|l)|lam)s?|mal|lalms?))|(?:Psal[am]s?)|(?:Psals?)|(?:P(?:s(?:l(?:m[ms]|a)|m[am]|sm|a(?:m(?:l[as]|s)|aa))|asms|(?:a(?:s(?:ml|s)|m[ls]|l[lm])|s(?:a(?:am|ma)|lma))s|s(?:a(?:ml?)?|m|s|lm)?|a(?:ls|sl)ms?|l(?:a(?:s(?:m(?:as?|s)?|s)?|m(?:a?s)?|as?)|s(?:a?m|sss)s?|s(?:ss?|a)|ms))|Salms?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pr(?:[\s\xa0]*Aza|Aza?)r|Azariah?|Pr[\s\xa0]*of[\s\xa0]*Azariah?|Prayer(?:s[\s\xa0]*of[\s\xa0]*Azariah?|[\s\xa0]*of[\s\xa0]*Azariah?)|The[\s\xa0]*Pr(?:ayer(?:s[\s\xa0]*of[\s\xa0]*Azariah?|[\s\xa0]*of[\s\xa0]*Azariah?)|[\s\xa0]*of[\s\xa0]*Azariah?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prover?bs)|(?:Prverbs)|(?:P(?:r(?:(?:ever|v)bs|verb|everb|vb|v|o(?:bv?erbs|verb|v)?)?|or?verbs|v)|Oroverbs)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ec(?:les(?:i(?:a(?:ias|s)?|s)|sias?)t|clesia(?:sti?|t))es)|(?:Ec(?:c(?:l(?:es(?:i(?:a(?:s?te|st|ates|astes|ia?stes)|(?:ias|s)?tes)|(?:ai?|sia)stes|(?:sia|ai)tes|(?:aia|sai)stes)?)?)?|lesiaste|l)?|Qo(?:heleth|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S(?:[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|(?:g[\s\xa0]*?|ng[\s\xa0]*|ong[\s\xa0]*)Three|\.[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|g[\s\xa0]*Thr)|The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children))|Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)))|(?:Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children))|Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Song(?:s[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?)|[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))|S(?:o[Sln]|S|[\s\xa0]*of[\s\xa0]*S|o|n?gs?))|(?:Song(?:s(?:[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))?|[\s\xa0]*of[\s\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:e(?:r(?:(?:im(?:i[ai]|a)|m[im]a|a(?:m[ai]i|ia))h|(?:ama|imi)h|amiha|amiah|amia|amih|e(?:m(?:i(?:ha|e|ah|a|h|ih)?|a(?:ia?)?h))?)?)?|r))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eze[ei]ki?el)|(?:E(?:z(?:ek(?:i[ae]|e)l|ek?|k|i(?:[ei]ki?|ki?)el)|x[ei](?:[ei]ki?|ki?)el))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:D(?:a(?:n(?:i[ae]l)?)?|[ln]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H(?:o(?:s(?:ea)?)?|s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:oel?|l))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Am(?:os?|s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ob(?:a(?:d(?:iah?)?)?|idah|d)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:on(?:ah)?|nh))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mi(?:c(?:hah?|ah?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Na(?:h(?:um?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab(?:ak(?:k[au]kk?|[au]kk?)|k|bak(?:k[au]kk?|[au]kk?))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Z(?:e(?:p(?:h(?:an(?:aiah?|iah?))?)?|faniah?)|a(?:ph|f)aniah?|ph?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H(?:ag(?:g(?:ia[hi]|ai)?|ai)?|gg?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Z(?:ec(?:h(?:[ae]r(?:i(?:a?h|a|ih)|a[ai]?h))?)?|(?:ekaria|c)h|ekaria|c|a(?:c(?:h(?:[ae]r(?:i(?:a?h|a|ih)|a[ai]?h))?)?|kariah)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:ac(?:hi?|i)|ichi)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i)))ew)|(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt[ht]?|[\s\xa0]*Matt[ht]?)|aint[\s\xa0]*Matt[ht]?)|Matt[ht]?)|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt[ht]?|[\s\xa0]*Matt[ht]?)|aint[\s\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))|Mtt)|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i)))ew)|(?:(?:S(?:t(?:\.[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\s\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))ew)|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt[ht]?|[\s\xa0]*Matt[ht]?)|aint[\s\xa0]*Matt[ht]?)|Matt[ht]?)|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*Matt[ht]?|[\s\xa0]*Matt[ht]?)|aint[\s\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))))|(?:(?:S(?:t(?:\.[\s\xa0]*Matt[ht]?|[\s\xa0]*Matt[ht]?)|aint[\s\xa0]*Matt[ht]?)|Matt[ht]?)ew)|(?:S(?:t(?:\.[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\s\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))|(?:M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:rk?|k|ark?)|[\s\xa0]*M(?:rk?|k|ark?))|aint[\s\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:rk?|k|ark?)|[\s\xa0]*M(?:rk?|k|ark?))|aint[\s\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))))|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:rk?|k|ark?)|[\s\xa0]*M(?:rk?|k|ark?))|aint[\s\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*M(?:rk?|k|ark?)|[\s\xa0]*M(?:rk?|k|ark?))|aint[\s\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?)))|S(?:t(?:\.[\s\xa0]*M(?:rk?|k|ark?)|[\s\xa0]*M(?:rk?|k|ark?))|aint[\s\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*L(?:u(?:ke?)?|k)|[\s\xa0]*L(?:u(?:ke?)?|k))|aint[\s\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*L(?:u(?:ke?)?|k)|[\s\xa0]*L(?:u(?:ke?)?|k))|aint[\s\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))))|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*L(?:u(?:ke?)?|k)|[\s\xa0]*L(?:u(?:ke?)?|k))|aint[\s\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*L(?:u(?:ke?)?|k)|[\s\xa0]*L(?:u(?:ke?)?|k))|aint[\s\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k)))|S(?:t(?:\.[\s\xa0]*L(?:u(?:ke?)?|k)|[\s\xa0]*L(?:u(?:ke?)?|k))|aint[\s\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1(?:st)?|I)[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|1John|(?:1(?:st)?|I)\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|First[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2(?:nd)?|II)[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|2John|(?:2(?:nd)?|II)\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|Second[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:3(?:rd)?|III)[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|3John|(?:3(?:rd)?|III)\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|Third[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:The[\s\xa0]*Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))))|(?:Gospel[\s\xa0]*(?:according[\s\xa0]*to[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\s\xa0]*(?:S(?:t(?:\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)))|S(?:t(?:\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Actsss)|(?:Actss)|(?:Ac(?:ts[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Apostles|ts?)?|The[\s\xa0]*Acts[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Apostles)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:o(?:m(?:a(?:n(?:ds|s)?|sn)|s)?|amns|s)?|m(?:n?s|n)?|pmans))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:2(?:nd)?|II)\.[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|(?:2(?:nd)?|II)[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|Second[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian))s)|(?:(?:(?:2(?:nd)?|II)\.[\s\xa0]*Corin(?:itha|thai)|(?:2(?:nd)?|II)[\s\xa0]*Corin(?:itha|thai)|Second[\s\xa0]*Corin(?:itha|thai))ns)|(?:(?:(?:2(?:nd)?|II)\.|2(?:nd)?|II|Second)[\s\xa0]*Corinthans)|(?:(?:2(?:nd)?|II)[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|2Cor|(?:2(?:nd)?|II)\.[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|Second[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:1(?:st)?|I)\.[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|(?:1(?:st)?|I)[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|First[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian))s)|(?:(?:(?:1(?:st)?|I)\.[\s\xa0]*Corin(?:itha|thai)|(?:1(?:st)?|I)[\s\xa0]*Corin(?:itha|thai)|First[\s\xa0]*Corin(?:itha|thai))ns)|(?:(?:(?:1(?:st)?|I)\.|1(?:st)?|I|First)[\s\xa0]*Corinthans)|(?:(?:1(?:st)?|I)[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|1Cor|(?:1(?:st)?|I)\.[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|First[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns))|(?:C(?:or(?:i(?:(?:n(?:th(?:i(?:an[ao]|na)|ai?n)|ith(?:ina|an))|th[ai]n)s|nthi(?:a?ns|an)|(?:n(?:t(?:h(?:i(?:a[ai]|o)|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:rin?tha|ntha)i|nthia|ninthai|nithaia|n(?:intha|thi|ithai?)|(?:(?:nin?|rin?)th|nthi)ia)ns)|hor(?:inth(?:ai|ia|i)|(?:a?n|i)thia)ns))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:G(?:a(?:l(?:a(?:t(?:(?:i(?:on[an]|nan|an[ai])|o?n)s|i(?:na?|on?|an?)s|ian|(?:i(?:a[ai]|oa)|oa)ns|ii[ao]?ns|a(?:[ao]n|n|i[ao]?n)?s)?)?|lati[ao]?ns)?)?|l))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eph(?:es(?:i(?:an[ds]|ons)|ains)|i?sians))|(?:E(?:p(?:h(?:es(?:ai|ia)|i?sia)n|h(?:es?|s)?|e(?:he)?sians)?|hp(?:[ei]sians)?|sphesians))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ph(?:il(?:ip(?:p(?:(?:i(?:a[ai]|ia|e)|(?:pi|e)a)n|ia?n|a(?:ia?)?n)|(?:i(?:[ae]|ia)?|ea?|a(?:ia?)?)n)s|p(?:(?:(?:pii|e|ppi)a|pia|ai)ns|an|ia?ns))|l(?:ipp?ians|pp)))|(?:Ph(?:i(?:l(?:l(?:i(?:p(?:(?:ai?|ia|ea)ns|(?:ai?|ia|ea)n|ie?ns|(?:i(?:a[ai]|ea)|aia|iia)ns|p(?:i(?:(?:[ei]a)?ns|a(?:ins|ns?))|(?:pia|ai)ns|eans?|ans))?)?|(?:l(?:ipi|p|i?pp)ia|p(?:ie|a))ns|(?:li|p)?pians|(?:li|p)?pian)|(?:ip(?:p(?:i?a|i|ea|pia)|ai?|ia)|pp?ia)n|i(?:pp?)?|pp?)?)?|(?:l(?:ip)?|li)?p))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Colossians)|(?:Colossian)|(?:C(?:o(?:l(?:(?:[ao]|as|l[ao])si[ao]|oss(?:io|a))ns|l(?:oss)?)?|al(?:l(?:os(?:i[ao]|sia)|asi[ao])|(?:[ao]s|[ao])si[ao])ns))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:2(?:nd)?|II)\.|2(?:nd)?|II|Second)[\s\xa0]*Thsss)|(?:(?:2(?:nd)?|II)[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|2Thess|(?:2(?:nd)?|II)\.[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|Second[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:1(?:st)?|I)\.|1(?:st)?|I|First)[\s\xa0]*Thsss)|(?:(?:1(?:st)?|I)[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|1Thess|(?:1(?:st)?|I)\.[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|First[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?)|(?:Thes(?:s(?:al(?:on(?:i(?:[ao]ns|[ao]n|ns|(?:[ao]a|io)ns|c(?:i[ae]|a)ns)|(?:cie|ea|oi?a|aia)ns|a(?:ins?|ns))|lonians)|[eo]lonians|[eo]lonian|olonins|elonains)|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:2(?:nd)?|II)\.[\s\xa0]*Timoth?|(?:2(?:nd)?|II)[\s\xa0]*Timoth?|Second[\s\xa0]*Timoth?)y)|(?:(?:2(?:nd)?|II)[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|2Tim|(?:2(?:nd)?|II)\.[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|Second[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:(?:1(?:st)?|I)\.[\s\xa0]*Timoth?|(?:1(?:st)?|I)[\s\xa0]*Timoth?|First[\s\xa0]*Timoth?)y)|(?:(?:1(?:st)?|I)[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|1Tim|(?:1(?:st)?|I)\.[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|First[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y))|(?:Timothy?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ti(?:t(?:us)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ph(?:l?mn|l?m|l[ei]mon|ile(?:m(?:on)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H(?:e(?:b(?:(?:w(?:er|re)|ew[erw]|erw|r(?:rw|we|eww))s|r(?:ew?|w)?s|rew)?|[ew]breww?s)|(?:w[ew]breww?|w?breww?)s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:a(?:m(?:es?)?|s)?|ms?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2(?:nd)?|II)[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|2Pet|(?:2(?:nd)?|II)\.[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|Second[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1(?:st)?|I)[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|1Pet|(?:1(?:st)?|I)\.[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|First[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?)|(?:Peter)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ju?de)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:ob(?:i(?:as|t)?|t)?|b))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:ud(?:ith?|th?)|d(?:ith?|th?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B(?:ar(?:uch)?|r))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:us(?:annah|anna)?|hoshana))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2(?:nd)?|II)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:2(?:nd)?|II)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|Second[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:2(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c|[\s\xa0]*Ma)|(?:2nd|II)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:2(?:nd)?|II)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|Second[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:3(?:rd)?|III)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:3(?:rd)?|III)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|Third[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:3(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c)|(?:3rd|III)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:3(?:rd)?|III)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|Third[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:4(?:th)?|IV)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:4(?:th)?|IV)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|Fourth[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:4(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c)|(?:4th|IV)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:4(?:th)?|IV)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|Fourth[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1(?:st)?|I)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:1(?:st)?|I)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|First[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:1(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c|[\s\xa0]*Ma)|(?:1st|I)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:1(?:st)?|I)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|First[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?)|(?:Maccabees)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek", "Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab", "Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ha)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb", "Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John", "Jonah", "Job", "Josh", "Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude", "Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:ud?|d))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt", "Mark", "Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ma)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil", "Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph", "Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ze)
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

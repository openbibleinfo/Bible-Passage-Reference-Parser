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
				  | (?:subt[íi]tulo|t[íi]tulo|tít) (?! [a-z] )		#could be followed by a number
				  | y#{bcv_parser::regexps.space}+siguientes | y(?!#{bcv_parser::regexps.space}+sig) | y#{bcv_parser::regexps.space}+sig | vers[íi]culos | cap[íi]tulos | vers[íi]culo | cap[íi]tulo | caps | vers | cap | ver | vss | vs | vv | á | v
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* (?:subt[íi]tulo|t[íi]tulo|tít)
	| \d \W* (?:y#{bcv_parser::regexps.space}+siguientes|y#{bcv_parser::regexps.space}+sig) (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:1\.?[ºo]|1|I|Primero?)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2\.?[ºo]|2|II|Segundo)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3\.?[ºo]|3|III|Tercero?)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|y(?!#{bcv_parser::regexps.space}+sig)|á)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|á)"
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
		G(?:(?:[eé](?:n(?:esis)?)?)|n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[EÉ]x(?:d|o(?:do?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*y[\s\xa0]*el[\s\xa0]*(?:Serpiente|Drag[oó]n))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:ev(?:[ií]tico)?|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:m|(?:[uú](?:m(?:eros)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ec(?:lesi[aá]stico|clus)|Si(?:r(?:[aá]c(?:id(?:es|a))?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wis|S(?:ab(?:idur[ií]a)?|b))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:a(?:m(?:[ei]ntaciones?)?)?|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:La[\s\xa0]*Carta[\s\xa0]*de[\s\xa0]*Jerem[ií]as|Carta[\s\xa0]*(?:de[\s\xa0]*Jerem[ií]as|Jer(?:em[ií]as)?)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:El[\s\xa0]*Apocalipsis|Rev|Ap(?:oc(?:alipsis)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:La[\s\xa0]*Oraci[oó]n[\s\xa0]*de[\s\xa0]*Manas(?:[eé]s)|Or(?:aci[oó]n[\s\xa0]*de[\s\xa0]*Manas(?:[eé]s)|\.[\s\xa0]*Man|[\s\xa0]*Man)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:ueteronomio|eu(?:t(?:(?:[eo]ron(?:omio|mio))|ron(?:omio|mio))?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jos(?:u[eé]|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:u(?:dg|e(?:c(?:es)?)?)|c)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:t|u(?:th?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Esdras|[\s\xa0]*Esdras)|I(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|[\s\xa0]*Esdras)|(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|[\s\xa0]*Esd(?:r(?:as)?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Esdras|II(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|[\s\xa0]*Esdras)|(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|[\s\xa0]*Esd(?:r(?:as)?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Is(?:a(?:[ií]as)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Samuel|II(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|[\s\xa0]*Samuel)|(?:[oº](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|Sam|[\s\xa0]*S(?:a(?:m(?:uel)?)?|m)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Samuel|[\s\xa0]*Samuel)|I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|[\s\xa0]*Samuel)|(?:[oº](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|Sam|[\s\xa0]*S(?:a(?:m(?:uel)?)?|m)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Reyes|II(?:\.[\s\xa0]*Reyes|[\s\xa0]*Reyes)|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*Reyes|[\s\xa0]*Reyes))|[\s\xa0]*Reyes)|(?:[oº](?:\.[\s\xa0]*Reyes|[\s\xa0]*Reyes))|Kgs|[\s\xa0]*R(?:e(?:es?|s|y(?:es?|s)?)?|s|y(?:es?|s)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Reyes|[\s\xa0]*Reyes)|I(?:\.[\s\xa0]*Reyes|[\s\xa0]*Reyes)|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Reyes|[\s\xa0]*Reyes))|[\s\xa0]*Reyes)|(?:[oº](?:\.[\s\xa0]*Reyes|[\s\xa0]*Reyes))|Kgs|[\s\xa0]*R(?:e(?:es?|s|y(?:es?|s)?)?|s|y(?:es?|s)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Cr[oó]nicas|II(?:\.[\s\xa0]*Cr[oó]nicas|[\s\xa0]*Cr[oó]nicas)|2(?:\.(?:[oº](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|[\s\xa0]*Cr[oó]nicas)|[oº](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|[\s\xa0]*Cr(?:[oó](?:n(?:icas)?)?)?|Chr))|2(?:\.[oº][\s\xa0]*Cr(?:[oó]nicas)|[oº][\s\xa0]*Cr(?:[oó]nicas))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Cr[oó]nicas|[\s\xa0]*Cr[oó]nicas)|I(?:\.[\s\xa0]*Cr[oó]nicas|[\s\xa0]*Cr[oó]nicas)|1(?:\.(?:[oº](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|[\s\xa0]*Cr[oó]nicas)|[oº](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|[\s\xa0]*Cr(?:[oó](?:n(?:icas)?)?)?|Chr))|1(?:\.[oº][\s\xa0]*Cr(?:[oó]nicas)|[oº][\s\xa0]*Cr(?:[oó]nicas))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:zra|sd(?:r(?:as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ne(?:h(?:em[ií]as)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:er[\s\xa0]*(?:\([Gg]riego\)|[Gg]riego)|[\s\xa0]*Gr)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Es(?:t(?:er|h)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ob|b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ps|S(?:al(?:m(?:os?)?)?|lm?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:C[aá]ntico[\s\xa0]*de[\s\xa0]*Azar(?:[ií]as)|Azar[ií]as|PrAzar|Or(?:aci[oó]n[\s\xa0]*de[\s\xa0]*Azar(?:[ií]as)|[\s\xa0]*Az(?:ar)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		P(?:o(?:rverbios|verbios)|r(?:everbios?|o(?:b(?:verbios|erbios)|v(?:e(?:bios|rbios?))?)?|v(?:erbios?|b(?:os?|s)?)?)?|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ec(?:cles(?:s[ai](?:[ai]t(?:[eé]s?))|a[ai]t(?:[eé]s?))|les(?:s[ai](?:[ai]t(?:[eé]s?))|a[ai]t(?:[eé]s?)))|(?:Ec(?:c(?:l(?:es(?:s[ai](?:[ai]st(?:[eé]s?))|a[ai]st(?:[eé]s?)|i(?:a(?:st(?:i(?:c[eé]s|[eé]s)|[eé]s?)|t[eé]s?)|i(?:st[eé]s?|t[eé]s?)))?)?)?|l(?:es(?:s[ai](?:[ai]st(?:[eé]s?))|a[ai]st(?:[eé]s?)|i(?:a(?:st(?:i(?:c[eé]s|[eé]s)|[eé]s?)|t[eé]s?)|i(?:st[eé]s?|t[eé]s?)))?)?)?|Qo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:El[\s\xa0]*(?:Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J(?:[oó]venes[\s\xa0]*(?:Hebreos|Jud[ií]os))|3[\s\xa0]*J(?:[oó]venes[\s\xa0]*(?:Hebreos|Jud[ií]os)))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J(?:[oó]venes[\s\xa0]*(?:Hebreos|Jud[ií]os))|3[\s\xa0]*J(?:[oó]venes[\s\xa0]*(?:Hebreos|Jud[ií]os))))|Ct[\s\xa0]*3[\s\xa0]*J[oó]|SgThree)|(?:Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J(?:[oó]venes(?:[\s\xa0]*(?:Hebreos|Jud[íi]os))?)|3[\s\xa0]*J(?:[óo]venes(?:[\s\xa0]*(?:Hebreos|Jud[íi]os))?))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J[oó]venes(?:[\s\xa0]*Jud(?:[íi]os)?)|3[\s\xa0]*J(?:[oó]venes(?:[\s\xa0]*(?:Hebreos|Jud[íi]os))?))|Tres[\s\xa0]*J[oó]venes|3[\s\xa0]*J[óo]venes)|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Tres[\s\xa0]*J(?:[oó]venes)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:El[\s\xa0]*Cantar[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Cantares|Song|C(?:an(?:t(?:ar(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Cantares|e(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Cantares|s)))?)?|nt|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:er(?:e(?:m[ií]as?)?)?|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:i(?:(?:[ei]qu(?:iel|el))|qu(?:iel|el))|e(?:(?:[ei]qu(?:iel|el))|k|q(?:u(?:i[ae]l|el)?)?)?|q)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:a(?:n(?:iel)?)?|[ln])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hos|Os(?:eas)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:oel?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Am(?:[oó]s?|s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad|Ab(?:d(?:[ií]as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ns|on(?:a[hs]|ás)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:i(?:c|q(?:ueas)?)?|q)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:a(?:h(?:[uú]m?)?)?|h)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:bac[au]c|ac[au]c|c)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|S(?:f|o(?:f(?:on[ií]as)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ag(?:eo)?|H(?:ag(?:geo|eo)?|g))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ech|a(?:c(?:ar(?:[ií]as)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:al(?:a(?:qu(?:[ií]as)?)?)?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:l[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*Mateo|vangelio[\s\xa0]*de[\s\xa0]*Mateo)|San[\s\xa0]*Mateo|M(?:at(?:eo|t)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|II(?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|Macc|[\s\xa0]*M(?:ac(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?))|c(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?)))?)?|c)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tercer(?:o[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|III(?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|3(?:\.(?:(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|Macc|[\s\xa0]*M(?:ac(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?))|c(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?)))?)?|c)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Cuarto[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|IV(?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|4(?:\.(?:(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|Macc|[\s\xa0]*M(?:ac(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?))|c(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?)))?)?|c)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|I(?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?))))|(?:[oº](?:\.[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))|[\s\xa0]*Mac(?:cab(?:be(?:eos?|os?)|e(?:eos?|os?))|ab(?:be(?:eos?|os?)|e(?:eos?|os?)))))|Macc|[\s\xa0]*M(?:ac(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?))|c(?:ab(?:be(?:eos?|os?)|e(?:eos?|os?)))?)?|c)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:l[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*Marcos|vangelio[\s\xa0]*de[\s\xa0]*Marcos)|San[\s\xa0]*Marcos|M(?:ar(?:c(?:os)?|k)?|c|r(?:c(?:os)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:l[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*Lucas|vangelio[\s\xa0]*de[\s\xa0]*Lucas)|San[\s\xa0]*Lucas|L(?:c|u(?:ke|c(?:as)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|I(?:\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|1(?:\.(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|John|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J(?:[au](?:[au]n)|n))))|1(?:\.[oº](?:\.[\s\xa0]*J(?:[au](?:[au]n)|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[oº](?:\.[\s\xa0]*J(?:[au](?:[au]n)|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))))|1(?:\.[oº][\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n)))|[oº][\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))))|1(?:\.[oº][\s\xa0]*J(?:[au](?:[au]n))|[oº][\s\xa0]*J(?:[au](?:[au]n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|II(?:\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|2(?:\.(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|John|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J(?:[au](?:[au]n)|n))))|2(?:\.[oº](?:\.[\s\xa0]*J(?:[au](?:[au]n)|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[oº](?:\.[\s\xa0]*J(?:[au](?:[au]n)|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))))|2(?:\.[oº][\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n)))|[oº][\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))))|2(?:\.[oº][\s\xa0]*J(?:[au](?:[au]n))|[oº][\s\xa0]*J(?:[au](?:[au]n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tercer(?:o[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|III(?:\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|3(?:\.(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))|[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|John|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J(?:[au](?:[au]n)|n))))|3(?:\.[oº](?:\.[\s\xa0]*J(?:[au](?:[au]n)|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[oº](?:\.[\s\xa0]*J(?:[au](?:[au]n)|[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))))|3(?:\.[oº][\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n)))|[oº][\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[au](?:[au]n))))|3(?:\.[oº][\s\xa0]*J(?:[au](?:[au]n))|[oº][\s\xa0]*J(?:[au](?:[au]n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:El[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*J[au](?:[au]n)|San[\s\xa0]*Juan|J(?:[au](?:[au]n)|ohn|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Los[\s\xa0]*Hechos(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Ap[oó]stoles)?|Acts|H(?:ec(?:h(?:os(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Ap[oó]stoles)?)?)?|ch?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:m(?:ns?|s)?|o(?:m(?:anos?|s)?|s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Corintios|II(?:\.[\s\xa0]*Corintios|[\s\xa0]*Corintios)|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*Corintios|[\s\xa0]*Corintios))|[\s\xa0]*Corintios)|(?:[oº](?:\.[\s\xa0]*Corintios|[\s\xa0]*Corintios))|[\s\xa0]*Co(?:r(?:in(?:i|t(?:i(?:os)?)?)?)?)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Corintios|[\s\xa0]*Corintios)|I(?:\.[\s\xa0]*Corintios|[\s\xa0]*Corintios)|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Corintios|[\s\xa0]*Corintios))|[\s\xa0]*Corintios)|(?:[oº](?:\.[\s\xa0]*Corintios|[\s\xa0]*Corintios))|[\s\xa0]*Co(?:r(?:in(?:i|t(?:i(?:os)?)?)?)?)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		G(?:[aá](?:l(?:at(?:as)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:ph|f(?:es(?:ios)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil|F(?:il(?:i(?:p(?:enses)?)?)?|lp))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Col(?:os(?:enses)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Tesaloni[cs]enses?|II(?:\.[\s\xa0]*Tesaloni[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?)|2(?:\.(?:[oº](?:\.[\s\xa0]*Tesaloni(?:[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?))|[\s\xa0]*Tesaloni[cs]enses?)|[oº](?:\.[\s\xa0]*Tesaloni(?:[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?))|Thess|[\s\xa0]*T(?:hess|es(?:aloni[cs]enses?)?|s)))|2(?:\.[oº][\s\xa0]*Tesaloni(?:[cs]enses?)|[oº][\s\xa0]*Tesaloni(?:[cs]enses?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Tesaloni[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?)|I(?:\.[\s\xa0]*Tesaloni[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?)|1(?:\.(?:[oº](?:\.[\s\xa0]*Tesaloni(?:[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?))|[\s\xa0]*Tesaloni[cs]enses?)|[oº](?:\.[\s\xa0]*Tesaloni(?:[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?))|Thess|[\s\xa0]*T(?:hess|es(?:aloni[cs]enses?)?|s)))|1(?:\.[oº][\s\xa0]*Tesaloni(?:[cs]enses?)|[oº][\s\xa0]*Tesaloni(?:[cs]enses?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Timoteo|II(?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo)|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|[\s\xa0]*Timoteo)|(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|[\s\xa0]*T(?:i(?:m(?:oteo)?)?|m)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*Timoteo|[\s\xa0]*Timoteo)|I(?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo)|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|[\s\xa0]*Timoteo)|(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|[\s\xa0]*T(?:i(?:m(?:oteo)?)?|m)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:i(?:t(?:us|o)?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phlm|F(?:ilem(?:[oó]n)?|lmn?|mn))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		He(?:b(?:[eo](?:(?:[eor](?:(?:[eor]s|s))|s))|r(?:e(?:[er]s|os?|s)|[or](?:(?:[eor]s|s))|s)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jas|S(?:ant(?:iago)?|tg?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|II(?:\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|2(?:\.(?:(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|Pet|[\s\xa0]*(?:San[\s\xa0]*Pedro|P(?:d|e(?:d(?:ro)?)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:o[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|I(?:\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|1(?:\.(?:(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|(?:[oº](?:\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|Pet|[\s\xa0]*(?:San[\s\xa0]*Pedro|P(?:d|e(?:d(?:ro)?)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:San[\s\xa0]*Judas|J(?:ud(?:as|e)?|d(?:as)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:ob(?:it?|t)?|b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ud(?:it|t)|d(?:it|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ba(?:r(?:uc)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sus(?:ana)?
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
		osis: ["Jonah", "Job", "Josh", "Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jo
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude", "Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ju
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt", "Mark", "Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ma
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil", "Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Fil
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

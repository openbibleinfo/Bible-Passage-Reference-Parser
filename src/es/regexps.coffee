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
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* (?:subt[íi]tulo|t[íi]tulo|tít)
	| \d+ \W* (?:y#{bcv_parser::regexps.space}+siguientes|y#{bcv_parser::regexps.space}+sig) (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
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
		G(?:n|(?:[ée](?:n(?:esis)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[EÉ]x(?:o(?:do?)?|d)?)
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
		N(?:(?:[úu](?:m(?:eros)?)?)|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sir(?:[aá]c(?:id(?:es|a))?)?|Ec(?:clus|lesi[aá]stico))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sab(?:idur[íi]a)?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:a(?:m(?:[ie]ntaciones?)?)?|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:La[\s\xa0]*Carta[\s\xa0]*de[\s\xa0]*Jerem[ií]as|Carta[\s\xa0]*(?:Jer(?:em[ií]as)?|de[\s\xa0]*Jerem[íi]as)|EpJer)
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
		(?:Or(?:[\s\xa0]*Man|aci[óo]n[\s\xa0]*de[\s\xa0]*Manas(?:[ée]s)|\.[\s\xa0]*Man)|PrMan|La[\s\xa0]*Oraci[óo]n[\s\xa0]*de[\s\xa0]*Manas(?:[ée]s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:ueteronomio|eu(?:t(?:ron(?:omio|mio)|(?:[oe]ron(?:omio|mio)))?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jos(?:u[eé]|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ju(?:dg|e(?:c(?:es)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:u(?:th?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Esd(?:r(?:as)?)?|\.(?:[\s\xa0]*Esdras|(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)))|Esd|(?:[ºo](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)))|Primer(?:o[\s\xa0]*Esdras|[\s\xa0]*Esdras)|I(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Esd(?:r(?:as)?)?|\.(?:[\s\xa0]*Esdras|(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)))|Esd|(?:[oº](?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)))|II(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|Segundo[\s\xa0]*Esdras)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Is(?:a(?:[ií]as)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:\.(?:(?:[ºo](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|[\s\xa0]*Samuel)|[\s\xa0]*S(?:a(?:m(?:uel)?)?|m)?|(?:[ºo](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|Sam)|II(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|Segundo[\s\xa0]*Samuel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:\.(?:(?:[oº](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|[\s\xa0]*Samuel)|[\s\xa0]*S(?:a(?:m(?:uel)?)?|m)?|(?:[ºo](?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|Sam)|Primer(?:o[\s\xa0]*Samuel|[\s\xa0]*Samuel)|I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:[\s\xa0]*Reyes|\.[\s\xa0]*Reyes)|Segundo[\s\xa0]*Reyes|2(?:(?:[oº](?:[\s\xa0]*Reyes|\.[\s\xa0]*Reyes))|\.(?:[\s\xa0]*Reyes|(?:[oº](?:[\s\xa0]*Reyes|\.[\s\xa0]*Reyes)))|[\s\xa0]*R(?:y(?:es?|s)?|s|e(?:y(?:es?|s)?|es?|s)?)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*Reyes|\.[\s\xa0]*Reyes)|1(?:(?:[oº](?:[\s\xa0]*Reyes|\.[\s\xa0]*Reyes))|\.(?:[\s\xa0]*Reyes|(?:[oº](?:[\s\xa0]*Reyes|\.[\s\xa0]*Reyes)))|[\s\xa0]*R(?:y(?:es?|s)?|s|e(?:y(?:es?|s)?|es?|s)?)?|Kgs)|Primer(?:[\s\xa0]*Reyes|o[\s\xa0]*Reyes))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:\.(?:[ºo](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|[\s\xa0]*Cr[óo]nicas)|[oº](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|Chr|[\s\xa0]*Cr(?:[óo](?:n(?:icas)?)?)?)|II(?:\.[\s\xa0]*Cr[óo]nicas|[\s\xa0]*Cr[oó]nicas)|Segundo[\s\xa0]*Cr[oó]nicas)|2(?:\.[ºo][\s\xa0]*Cr(?:[oó]nicas)|[oº][\s\xa0]*Cr(?:[oó]nicas))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:\.[\s\xa0]*Cr[oó]nicas|[\s\xa0]*Cr[oó]nicas)|1(?:\.(?:[ºo](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|[\s\xa0]*Cr[oó]nicas)|[ºo](?:\.[\s\xa0]*Cr(?:[oó]nicas|[\s\xa0]*Cr[oó]nicas))|Chr|[\s\xa0]*Cr(?:[óo](?:n(?:icas)?)?)?)|Primer(?:o[\s\xa0]*Cr[oó]nicas|[\s\xa0]*Cr[óo]nicas))|1(?:\.[ºo][\s\xa0]*Cr(?:[oó]nicas)|[ºo][\s\xa0]*Cr(?:[oó]nicas))
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
		(?:Est(?:er[\s\xa0]*(?:[Gg]riego|\([gG]riego\))|[\s\xa0]*Gr)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Es(?:t(?:er|h)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:b|ob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ps|S(?:lm?|al(?:m(?:os?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:C[aá]ntico[\s\xa0]*de[\s\xa0]*Azar(?:[íi]as)|Azar[ií]as|Or(?:[\s\xa0]*Az(?:ar)?|aci[óo]n[\s\xa0]*de[\s\xa0]*Azar(?:[ií]as))|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		P(?:r(?:everbios?|v(?:erbios?|b(?:os?|s)?)?|o(?:v(?:e(?:bios|rbios?))?|b(?:erbios|verbios))?)?|o(?:verbios|rverbios)|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ec(?:les(?:s[ai](?:[ia]st(?:[ée]s?))|a[ai]st(?:[ée]s?))|cles(?:s[ia](?:[ia]st(?:[eé]s?))|a[ai]st(?:[ée]s?)))|Ec(?:c(?:l(?:es(?:a[ia]t(?:[eé]s?)|i(?:a(?:t[ée]s?|st(?:i(?:[eé]s|c[ée]s)|[eé]s?))|i(?:t[eé]s?|st[eé]s?))|s[ia](?:[ia]t(?:[eé]s?)))?)?)?|l(?:es(?:a[ia]t(?:[eé]s?)|i(?:a(?:t[ée]s?|st(?:i(?:[eé]s|c[eé]s)|[eé]s?))|i(?:t[eé]s?|st[ée]s?))|s[ia](?:[ai]t(?:[ée]s?)))?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:SgThree|Ct[\s\xa0]*3[\s\xa0]*J[óo]|El[\s\xa0]*(?:Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J(?:[oó]venes[\s\xa0]*(?:Hebreos|Jud[íi]os))|3[\s\xa0]*J(?:[oó]venes[\s\xa0]*(?:Hebreos|Jud[ií]os)))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J(?:[óo]venes[\s\xa0]*(?:Hebreos|Jud[íi]os))|3[\s\xa0]*J(?:[óo]venes[\s\xa0]*(?:Hebreos|Jud[íi]os)))))|(?:Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:3[\s\xa0]*J(?:[oó]venes(?:[\s\xa0]*(?:Hebreos|Jud[íi]os))?)|Tres[\s\xa0]*J[oó]venes(?:[\s\xa0]*Jud(?:[ií]os)?))|Tres[\s\xa0]*J[oó]venes|3[\s\xa0]*J[óo]venes|Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:3[\s\xa0]*J(?:[óo]venes(?:[\s\xa0]*(?:Hebreos|Jud[íi]os))?)|Tres[\s\xa0]*J(?:[oó]venes(?:[\s\xa0]*(?:Hebreos|Jud[íi]os))?)))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Tres[\s\xa0]*J(?:[oó]venes)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|El[\s\xa0]*Cantar[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Cantares|C(?:nt|t|an(?:t(?:ar(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Cantares|e(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Cantares|s)))?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jer(?:e(?:m[íi]as?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez(?:e(?:(?:[ie]qu(?:el|iel))|q(?:u(?:el|i[ea]l)?)?|k)?|q|i(?:(?:[ei]qu(?:el|iel))|qu(?:el|iel)))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:a(?:n(?:iel)?)?|[nl])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Os(?:eas)?|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:l|oel?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Am(?:[oó]s?|s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad|Ab(?:d(?:[íi]as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:on(?:ás|a[hs])?|ns)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:i(?:c|q(?:ueas)?)?|q)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:h|a(?:h(?:[uú]m?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:ac[ua]c|bac[au]c|c)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:of(?:on[ií]as)?|f)|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H(?:ag(?:eo|geo)?|g)|Ag(?:eo)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ac(?:ar(?:[ií]as)?)?|ech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:a(?:qu(?:[íi]as)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:at(?:eo|t)?|t)|San[\s\xa0]*Mateo|E(?:vangelio[\s\xa0]*de[\s\xa0]*Mateo|l[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*Mateo))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|II(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?))))|2(?:Macc|(?:[oº](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))|[\s\xa0]*M(?:ac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|c(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?)))?)?|c)?|\.(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|(?:[oº](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?))))))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tercer(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|o[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?))))|3(?:Macc|(?:[ºo](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))|[\s\xa0]*M(?:ac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|c(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?)))?)?|c)?|\.(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|(?:[oº](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))))|III(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Cuarto[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|4(?:Macc|(?:[ºo](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))|[\s\xa0]*M(?:ac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|c(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?)))?)?|c)?|\.(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|(?:[oº](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))))|IV(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|o[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?))))|I(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?))))|1(?:Macc|(?:[ºo](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))))|[\s\xa0]*M(?:ac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|c(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?)))?)?|c)?|\.(?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|(?:[oº](?:[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?)))|\.[\s\xa0]*Mac(?:ab(?:e(?:os?|eos?)|be(?:os?|eos?))|cab(?:e(?:os?|eos?)|be(?:os?|eos?))))))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:l[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*Marcos|vangelio[\s\xa0]*de[\s\xa0]*Marcos)|San[\s\xa0]*Marcos|M(?:r(?:c(?:os)?)?|c|ar(?:k|c(?:os)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:l[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*Lucas|vangelio[\s\xa0]*de[\s\xa0]*Lucas)|San[\s\xa0]*Lucas|L(?:u(?:c(?:as)?|ke)?|c))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Primer(?:[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[au](?:[ua]n))|o[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[au]n)|J[au](?:[ua]n)))|I(?:[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[ua](?:[au]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[ua]n)))|1(?:John|\.(?:[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[ua](?:[ua]n))|[oº](?:[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[ua]n)|J[ua](?:[ua]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n)))))|[ºo](?:[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[au]n)|J[ua](?:[ua]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[au]n)|J[au](?:[au]n))))|[\s\xa0]*(?:J(?:[au](?:[au]n)|n)|San[\s\xa0]*J[au](?:[ua]n))))|1(?:\.[oº](?:[\s\xa0]*J(?:[ua](?:[ua]n)|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))))|[ºo](?:[\s\xa0]*J(?:[ua](?:[ua]n)|\.[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[au]n)|J[au](?:[au]n)))))|1(?:\.[ºo]\.[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[ua]n)|J[ua](?:[au]n)))|[oº]\.[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[ua]n)|J[ua](?:[ua]n))))|1(?:\.[ºo]\.[\s\xa0]*J(?:[ua](?:[au]n))|[oº]\.[\s\xa0]*J(?:[ua](?:[ua]n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[au](?:[au]n))|II(?:[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[au](?:[ua]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[au](?:[au]n)))|2(?:John|\.(?:[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[ua](?:[au]n))|[ºo](?:[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[ua]n)|J[ua](?:[ua]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[au](?:[au]n)))))|[oº](?:[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[au]n)|J[au](?:[au]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[ua](?:[au]n))))|[\s\xa0]*(?:J(?:[ua](?:[ua]n)|n)|San[\s\xa0]*J[au](?:[au]n))))|2(?:\.[ºo](?:[\s\xa0]*J(?:[ua](?:[ua]n)|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[au](?:[au]n))))|[oº](?:[\s\xa0]*J(?:[au](?:[au]n)|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[au]n)|J[ua](?:[au]n)))))|2(?:\.[oº]\.[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[au]n)|J[au](?:[au]n)))|[oº]\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[ua](?:[au]n))))|2(?:\.[oº]\.[\s\xa0]*J(?:[au](?:[au]n))|[oº]\.[\s\xa0]*J(?:[ua](?:[au]n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tercer(?:[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[ua](?:[au]n))|o[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[ua](?:[ua]n)))|III(?:[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[ua]n)|J[au](?:[au]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[ua](?:[ua]n)))|3(?:John|\.(?:[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[au](?:[ua]n))|[ºo](?:[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[ua](?:[au]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[au](?:[ua]n)))))|[ºo](?:[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[au]n)|J[au](?:[au]n))|\.[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[au]n)|J[ua](?:[ua]n))))|[\s\xa0]*(?:J(?:[ua](?:[ua]n)|n)|San[\s\xa0]*J[au](?:[au]n))))|3(?:\.[ºo](?:[\s\xa0]*J(?:[ua](?:[au]n)|\.[\s\xa0]*(?:San[\s\xa0]*J[au](?:[ua]n)|J[au](?:[ua]n))))|[ºo](?:[\s\xa0]*J(?:[au](?:[au]n)|\.[\s\xa0]*(?:San[\s\xa0]*J[ua](?:[au]n)|J[ua](?:[ua]n)))))|3(?:\.[oº]\.[\s\xa0]*(?:San[\s\xa0]*J(?:[au](?:[au]n)|J[ua](?:[au]n)))|[oº]\.[\s\xa0]*(?:San[\s\xa0]*J(?:[ua](?:[au]n)|J[au](?:[ua]n))))|3(?:\.[oº]\.[\s\xa0]*J(?:[ua](?:[au]n))|[oº]\.[\s\xa0]*J(?:[au](?:[ua]n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:ohn|[au](?:[au]n)|n)|El[\s\xa0]*Evangelio[\s\xa0]*de[\s\xa0]*J[ua](?:[au]n)|San[\s\xa0]*Juan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Los[\s\xa0]*Hechos(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Ap[oó]stoles)?|H(?:ch?|ec(?:h(?:os(?:[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Ap[óo]stoles)?)?)?)|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:m(?:ns?|s)?|o(?:m(?:anos?|s)?|s)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Co(?:r(?:in(?:t(?:i(?:os)?)?|i)?)?)?|(?:[oº](?:[\s\xa0]*Corintios|\.[\s\xa0]*Corintios))|\.(?:(?:[ºo](?:[\s\xa0]*Corintios|\.[\s\xa0]*Corintios))|[\s\xa0]*Corintios)|Cor)|II(?:[\s\xa0]*Corintios|\.[\s\xa0]*Corintios)|Segundo[\s\xa0]*Corintios)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Co(?:r(?:in(?:t(?:i(?:os)?)?|i)?)?)?|(?:[oº](?:[\s\xa0]*Corintios|\.[\s\xa0]*Corintios))|\.(?:(?:[ºo](?:[\s\xa0]*Corintios|\.[\s\xa0]*Corintios))|[\s\xa0]*Corintios)|Cor)|I(?:[\s\xa0]*Corintios|\.[\s\xa0]*Corintios)|Primer(?:[\s\xa0]*Corintios|o[\s\xa0]*Corintios))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		G(?:[aá]l(?:at(?:as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:ph|f(?:es(?:ios)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil|Fil(?:i(?:p(?:enses)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Col(?:os(?:enses)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*Tesaloni[cs]enses?|2(?:[\s\xa0]*T(?:es(?:aloni[cs]enses?)?|hess|s)|\.(?:[\s\xa0]*Tesaloni[cs]enses?|[oº](?:\.[\s\xa0]*Tesaloni(?:[sc]enses?|[\s\xa0]*Tesaloni[cs]enses?)))|Thess|[oº](?:\.[\s\xa0]*Tesaloni(?:[sc]enses?|[\s\xa0]*Tesaloni[sc]enses?)))|II(?:\.[\s\xa0]*Tesaloni[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?))|2(?:\.[oº][\s\xa0]*Tesaloni(?:[cs]enses?)|[oº][\s\xa0]*Tesaloni(?:[sc]enses?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*T(?:es(?:aloni[sc]enses?)?|hess|s)|\.(?:[\s\xa0]*Tesaloni[sc]enses?|[oº](?:\.[\s\xa0]*Tesaloni(?:[sc]enses?|[\s\xa0]*Tesaloni[cs]enses?)))|Thess|[ºo](?:\.[\s\xa0]*Tesaloni(?:[sc]enses?|[\s\xa0]*Tesaloni[cs]enses?)))|I(?:\.[\s\xa0]*Tesaloni[cs]enses?|[\s\xa0]*Tesaloni[cs]enses?)|Primer(?:o[\s\xa0]*Tesaloni[sc]enses?|[\s\xa0]*Tesaloni[sc]enses?))|1(?:\.[oº][\s\xa0]*Tesaloni(?:[cs]enses?)|[ºo][\s\xa0]*Tesaloni(?:[cs]enses?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:Tim|(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|\.(?:(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|[\s\xa0]*Timoteo)|[\s\xa0]*T(?:i(?:m(?:oteo)?)?|m))|II(?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo)|Segundo[\s\xa0]*Timoteo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:Tim|(?:[ºo](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|\.(?:(?:[oº](?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))|[\s\xa0]*Timoteo)|[\s\xa0]*T(?:i(?:m(?:oteo)?)?|m))|I(?:\.[\s\xa0]*Timoteo|[\s\xa0]*Timoteo)|Primer(?:o[\s\xa0]*Timoteo|[\s\xa0]*Timoteo))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ti(?:t(?:us|o)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:F(?:lmn?|mn|ilem(?:[óo]n)?)|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		He(?:b(?:r(?:e(?:os?|[er]s|s)|[or](?:(?:[ore]s|s))|s)?|[eo](?:(?:[eor](?:(?:[oer]s|s))|s)))?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jas|S(?:tg|ant(?:iago)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Segundo[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|II(?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|2(?:(?:[ºo](?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|[\s\xa0]*(?:San[\s\xa0]*Pedro|P(?:e(?:d(?:ro)?)?|d)?)|Pet|\.(?:(?:[ºo](?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|Primer(?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|o[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))|1(?:(?:[oº](?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|[\s\xa0]*(?:San[\s\xa0]*Pedro|P(?:e(?:d(?:ro)?)?|d)?)|Pet|\.(?:(?:[ºo](?:[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)|\.[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro)))|[\s\xa0]*(?:San[\s\xa0]*Pedro|Pedro))))
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
		Tob(?:it?|t)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:d(?:it|t)|ud(?:it|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bar(?:uc)?
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
		continue if book.apocrypha? and book.apocrypha is true
		if case_sensitive is "books"
			book.regexp = new RegExp book.regexp.source, "g"
		out.push book
	out

# Default to not using the Apocrypha
bcv_parser::regexps.books = bcv_parser::regexps.get_books false, "none"
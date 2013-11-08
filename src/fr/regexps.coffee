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
				  | titre (?! [a-z] )		#could be followed by a number
				  | et(?!#{bcv_parser::regexps.space}+suivant) | et#{bcv_parser::regexps.space}+suivant | chapitres | chapitre | comparer | versets | verset | chap | vers | chs | ver | ch | vv | á | v
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* titre
	| \d+ \W* et#{bcv_parser::regexps.space}+suivant (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Premi[èe]res?|Premiers?|1[èe]?re|1er|1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Deuxi[èe]mes?|2[èe]me|2d?e?|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Troisi[èe]mes?|3[èe]me|3e?|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:et(?!#{bcv_parser::regexps.space}+suivant)|comparer)|á)"
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
		G(?:e(?:n(?:[èe]se)?)?|n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ex(?:o(?:de?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*et[\s\xa0]*le[\s\xa0]*(?:[dD]ragon|[sS]erpent))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:(?:[ée](?:v(?:itique)?)?)|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:o(?:m(?:b(?:res)?)?)?|um|[mb])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:La[\s\xa0]*Sagesse[\s\xa0]*de[\s\xa0]*Ben[\s\xa0]*Sira|Eccl[eé]siastique|S(?:agesse[\s\xa0]*de[\s\xa0]*Ben[\s\xa0]*Sira|i(?:r(?:acide)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wis|S(?:agesse(?:[\s\xa0]*de[\s\xa0]*Salomon)?|g))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		La(?:m(?:entations(?:[\s\xa0]*de[\s\xa0]*J[eé]r(?:[ée]mie))?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ep(?:\.[\s\xa0]*J(?:[eé]r(?:[ée]mie)?)|Jer|[\s\xa0]*J(?:[eé]r(?:[ée]mie)?)|[iî]tre[\s\xa0]*de[\s\xa0]*J(?:[eé]r(?:[eé]mie)))|Ép(?:\.[\s\xa0]*J(?:[eé]r(?:[eé]mie)?)|[\s\xa0]*J(?:[ée]r(?:[ée]mie)?)|[îi]tre[\s\xa0]*de[\s\xa0]*J(?:[eé]r(?:[ée]mie))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ap(?:o(?:c(?:alypse(?:[\s\xa0]*de[\s\xa0]*Jean)?)?)?|c)?|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pr(?:\.[\s\xa0]*Man(?:ass[ée])?|i[eè]re[\s\xa0]*de[\s\xa0]*Manass[ée]|[\s\xa0]*Man(?:ass[ée])?|Man)|La[\s\xa0]*Pri[eè]re[\s\xa0]*de[\s\xa0]*Manass[ée])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:eu(?:t(?:[ée]ronome)?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jos(?:u[eé]|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:u(?:dg|g(?:es)?)|g)
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
		(?:1(?:\.[\s\xa0]*Esdras|re(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|[\s\xa0]*Es(?:d(?:r(?:as)?)?)?|Esd|er(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|ère(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|I(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|Premi(?:er(?:s[\s\xa0]*Esdras|[\s\xa0]*Esdras)|ère(?:s[\s\xa0]*Esdras|[\s\xa0]*Esdras)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:s[\s\xa0]*Esdras|[\s\xa0]*Esdras)|II(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|2(?:\.[\s\xa0]*Esdras|d(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras|e(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|[\s\xa0]*Es(?:d(?:r(?:as)?)?)?|Esd|e(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|ème(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ÉIE]s(?:a(?:[iï]e)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*S(?:a(?:m(?:uel)?)?)?|\.[\s\xa0]*Samuel|d(?:\.[\s\xa0]*Samuel|e(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|[\s\xa0]*Samuel)|e(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|ème(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|Sam)|Deuxième(?:s[\s\xa0]*Samuel|[\s\xa0]*Samuel)|II(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|Premi(?:er(?:s[\s\xa0]*Samuel|[\s\xa0]*Samuel)|ère(?:s[\s\xa0]*Samuel|[\s\xa0]*Samuel))|1(?:[\s\xa0]*S(?:a(?:m(?:uel)?)?)?|\.[\s\xa0]*Samuel|re(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|er(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|Sam|ère(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:[\s\xa0]*Rois|s[\s\xa0]*Rois)|2(?:d(?:e(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois)|[\s\xa0]*Rois|\.[\s\xa0]*Rois)|ème(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois)|e(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois)|Kgs|[\s\xa0]*R(?:ois)?|\.[\s\xa0]*Rois)|II(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:re(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois)|ère(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois)|er(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois)|Kgs|[\s\xa0]*R(?:ois)?|\.[\s\xa0]*Rois)|Premi(?:er(?:[\s\xa0]*Rois|s[\s\xa0]*Rois)|ère(?:[\s\xa0]*Rois|s[\s\xa0]*Rois))|I(?:[\s\xa0]*Rois|\.[\s\xa0]*Rois))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|2(?:d(?:\.[\s\xa0]*Chroniques|e(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|[\s\xa0]*Chroniques)|ème(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|\.[\s\xa0]*Chroniques|[\s\xa0]*Ch(?:r(?:o(?:n(?:iques)?)?)?)?|e(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|Chr)|II(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:\.[\s\xa0]*Chroniques|re(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|ère(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|[\s\xa0]*Ch(?:r(?:o(?:n(?:iques)?)?)?)?|Chr|er(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques))|Premi(?:er(?:s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|ère(?:s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques))|I(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:zra|sd(?:r(?:as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:[ée](?:h(?:[eé]mie)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esth(?:[\s\xa0]*[Gg]r|er[\s\xa0]*(?:(?:[gG]r(?:ec)?)|\([gG]rec\)))|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:h(?:er)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:b|ob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ps(?:a(?:u(?:mes?)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:La[\s\xa0]*Pri[èe]re[\s\xa0]*d(?:['’]Azaria[hs])|Pr(?:Azar|\.[\s\xa0]*Azar|[\s\xa0]*Azar|i[èe]re[\s\xa0]*d(?:['’]Azaria[hs])))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Pr(?:o(?:v(?:erbes)?)?|v)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Qoheleth?|Ec(?:cl(?:[eé]s(?:iaste)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:SgThree|C(?:antique[\s\xa0]*des[\s\xa0]*(?:3[\s\xa0]*Enfants|Trois[\s\xa0]*Enfants)|t[\s\xa0]*3[\s\xa0]*E))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|C(?:a(?:ntique(?:s|[\s\xa0]*des[\s\xa0]*[Cc]antiques)?)?|nt|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:(?:[ée](?:r(?:[ée]m(?:ie)?)?)?)|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Éz(?:[ée]ch(?:iel)?)|Ez(?:é(?:ch(?:iel)?)?|e(?:k|ch(?:iel)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Da(?:n(?:iel)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Os(?:[eé]e)?|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:o[eë]l?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Am(?:os?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad|Ab(?:d(?:ias)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jon(?:a[hs])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:c(?:h(?:[eé]e)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Na(?:h(?:um)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ha(?:b(?:a(?:k(?:uk)?|c(?:uc)?))?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:So(?:ph(?:onie)?)?|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag|Ag(?:g(?:[ée]e)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:a(?:c(?:c(?:h(?:arie)?)?|h(?:arie)?)?|h)?|ech|c)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:al(?:ch?|ac(?:h(?:ie)?)?)?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:at(?:t(?:h(?:ieu)?)?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:[cr]|ar[ck]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:u(?:c|ke)?|c)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|Premi(?:er(?:s[\s\xa0]*Jean|[\s\xa0]*Jean)|ère(?:s[\s\xa0]*Jean|[\s\xa0]*Jean))|1(?:ère(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|John|re(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|[\s\xa0]*J(?:n|ean)|er(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:s[\s\xa0]*Jean|[\s\xa0]*Jean)|2(?:d(?:e(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|[\s\xa0]*Jean)|e(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|John|[\s\xa0]*J(?:n|ean)|ème(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean))|II(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:e(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|John|[\s\xa0]*J(?:n|ean)|ème(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean))|III(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|Troisième(?:s[\s\xa0]*Jean|[\s\xa0]*Jean))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ohn|n|ean)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ac(?:t(?:es(?:[\s\xa0]*des[\s\xa0]*Ap[ôo]tres)?|s)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:o(?:m(?:ains)?)?|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|II(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|2(?:d(?:e(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|ème(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|e(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|Cor|\.[\s\xa0]*Corinthiens|[\s\xa0]*Co(?:r(?:inthiens)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:er(?:s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|ère(?:s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens))|I(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|1(?:re(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|ère(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|er(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|Cor|\.[\s\xa0]*Corinthiens|[\s\xa0]*Co(?:r(?:inthiens)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		G(?:a(?:l(?:ates)?)?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[EÉ]p(?:h(?:[eé](?:s(?:iens)?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:il(?:ippiens)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Col(?:ossiens)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|s[\s\xa0]*Thes(?:aloniciens|saloniciens))|II(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|2(?:[\s\xa0]*Th(?:es(?:aloniciens|s(?:aloniciens)?)?)?|d(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|e(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|e(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|Thess|ème(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|\.[\s\xa0]*Thes(?:aloniciens|saloniciens)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|Premi(?:ère(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|s[\s\xa0]*Thes(?:aloniciens|saloniciens))|er(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|s[\s\xa0]*Thes(?:aloniciens|saloniciens)))|1(?:er(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|[\s\xa0]*Th(?:es(?:aloniciens|s(?:aloniciens)?)?)?|Thess|\.[\s\xa0]*Thes(?:aloniciens|saloniciens)|re(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))|ère(?:[\s\xa0]*Thes(?:aloniciens|saloniciens)|\.[\s\xa0]*Thes(?:aloniciens|saloniciens))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxième(?:[\s\xa0]*Timoth[ée]e|s[\s\xa0]*Timoth[ée]e)|2(?:[\s\xa0]*Ti(?:m(?:oth[eé]e)?)?|Tim|d(?:[\s\xa0]*Timoth[ée]e|e(?:[\s\xa0]*Timoth[ée]e|\.[\s\xa0]*Timoth[ée]e)|\.[\s\xa0]*Timoth[ée]e)|e(?:[\s\xa0]*Timoth[ée]e|\.[\s\xa0]*Timoth[eé]e)|ème(?:[\s\xa0]*Timoth[ée]e|\.[\s\xa0]*Timoth[ée]e)|\.[\s\xa0]*Timoth[ée]e)|II(?:[\s\xa0]*Timoth[eé]e|\.[\s\xa0]*Timoth[eé]e))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*Timoth[eé]e|\.[\s\xa0]*Timoth[ée]e)|Premi(?:ère(?:[\s\xa0]*Timoth[ée]e|s[\s\xa0]*Timoth[eé]e)|er(?:[\s\xa0]*Timoth[eé]e|s[\s\xa0]*Timoth[ée]e))|1(?:[\s\xa0]*Ti(?:m(?:oth[eé]e)?)?|er(?:[\s\xa0]*Timoth[eé]e|\.[\s\xa0]*Timoth[ée]e)|Tim|re(?:[\s\xa0]*Timoth[eé]e|\.[\s\xa0]*Timoth[eé]e)|\.[\s\xa0]*Timoth[eé]e|ère(?:[\s\xa0]*Timoth[eé]e|\.[\s\xa0]*Timoth[ée]e)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tit(?:us|e)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:lm|m|il[ée]mon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:[eé](?:b(?:r(?:eux)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ja(?:c(?:q(?:ues)?)?|s|ques)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:d(?:e(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|e(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|ème(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|Pet|[\s\xa0]*P(?:i(?:erre)?)?|\.[\s\xa0]*Pierre)|Deuxième(?:[\s\xa0]*Pierre|s[\s\xa0]*Pierre)|II(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:er(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|Pet|re(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|[\s\xa0]*P(?:i(?:erre)?)?|ère(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|\.[\s\xa0]*Pierre)|I(?:[\s\xa0]*Pierre|\.[\s\xa0]*Pierre)|Premi(?:ère(?:[\s\xa0]*Pierre|s[\s\xa0]*Pierre)|er(?:[\s\xa0]*Pierre|s[\s\xa0]*Pierre)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jude?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:ob(?:ie)?|b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:udith|dt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ba(?:r(?:uch)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Su(?:[zs](?:anne(?:[\s\xa0]*(?:au[\s\xa0]*bain|et[\s\xa0]*les[\s\xa0]*(?:vieillards|deux[\s\xa0]*vieillards)))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:d(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[eé]es|e(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[eé]es))|[\s\xa0]*M(?:acc(?:ab[ée]es)?)?|\.[\s\xa0]*Maccab[ée]es|e(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es)|ème(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|Macc)|Deuxième(?:s[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|II(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:III(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[eé]es)|Troisième(?:s[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es)|3(?:[\s\xa0]*M(?:acc(?:ab[ée]es)?)?|\.[\s\xa0]*Maccab[ée]es|e(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|ème(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:IV(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es)|Quatrième(?:s[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|4(?:[\s\xa0]*M(?:acc(?:ab[ée]es)?)?|\.[\s\xa0]*Maccab[ée]es|e(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|ème(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:er(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|[\s\xa0]*M(?:acc(?:ab[eé]es)?)?|\.[\s\xa0]*Maccab[ée]es|Macc|re(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|ère(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es))|I(?:\.[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es)|Premi(?:ère(?:s[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[ée]es)|er(?:s[\s\xa0]*Maccab[ée]es|[\s\xa0]*Maccab[ée]es)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah", "Job", "Josh", "Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jo
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg", "Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ju
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil", "Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Phl?
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
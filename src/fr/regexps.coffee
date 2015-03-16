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
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* titre
	| \d \W* et#{bcv_parser::regexps.space}+suivant (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
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
		G(?:e(?:n(?:[eè]se)?)?|n)
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
		Bel(?:[\s\xa0]*et[\s\xa0]*le[\s\xa0]*(?:[Ss]erpent|[Dd]ragon))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:(?:[eé](?:v(?:itique)?)?)|v)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:um|[bm]|o(?:m(?:b(?:res)?)?)?)
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
		La(?:m(?:entations(?:[\s\xa0]*de[\s\xa0]*J[eé]r(?:[eé]mie))?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ép(?:[iî]tre[\s\xa0]*de[\s\xa0]*J(?:[eé]r(?:[eé]mie))|\.[\s\xa0]*J(?:[eé]r(?:[eé]mie)?)|[\s\xa0]*J(?:[eé]r(?:[eé]mie)?))|Ep(?:[iî]tre[\s\xa0]*de[\s\xa0]*J(?:[eé]r(?:[eé]mie))|\.[\s\xa0]*J(?:[eé]r(?:[eé]mie)?)|[\s\xa0]*J(?:[eé]r(?:[eé]mie)?)|Jer))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rev|Ap(?:c|o(?:c(?:alypse(?:[\s\xa0]*de[\s\xa0]*Jean)?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:La[\s\xa0]*Pri[eè]re[\s\xa0]*de[\s\xa0]*Manass[eé]|Pr(?:i[eè]re[\s\xa0]*de[\s\xa0]*Manass[eé]|\.[\s\xa0]*Man(?:ass[eé])?|[\s\xa0]*Man(?:ass[eé])?|Man))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:eu(?:t(?:[eé]ronome)?)?|t)
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
		R(?:t|u(?:th?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Esdras|[\s\xa0]*Esdras)|er(?:e(?:s[\s\xa0]*Esdras|[\s\xa0]*Esdras)|s[\s\xa0]*Esdras|[\s\xa0]*Esdras))|I(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|1(?:ère(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|er(?:\.[\s\xa0]*Esdras|e(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|[\s\xa0]*Esdras)|re(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|\.[\s\xa0]*Esdras|[\s\xa0]*Es(?:d(?:r(?:as)?)?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Esdras|[\s\xa0]*Esdras))|II(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|2(?:ème(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|\.[\s\xa0]*Esdras|d(?:\.[\s\xa0]*Esdras|e(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|[\s\xa0]*Esdras)|e(?:me(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|[\s\xa0]*Es(?:d(?:r(?:as)?)?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[EIÉ]s(?:a(?:[iï]e)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Samuel|[\s\xa0]*Samuel))|II(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|2(?:ème(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|\.[\s\xa0]*Samuel|d(?:\.[\s\xa0]*Samuel|e(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|[\s\xa0]*Samuel)|e(?:me(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|Sam|[\s\xa0]*S(?:a(?:m(?:uel)?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Samuel|[\s\xa0]*Samuel)|er(?:e(?:s[\s\xa0]*Samuel|[\s\xa0]*Samuel)|s[\s\xa0]*Samuel|[\s\xa0]*Samuel))|I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|1(?:ère(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|er(?:\.[\s\xa0]*Samuel|e(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|[\s\xa0]*Samuel)|re(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|\.[\s\xa0]*Samuel|Sam|[\s\xa0]*S(?:a(?:m(?:uel)?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Rois|[\s\xa0]*Rois))|II(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|2(?:ème(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|\.[\s\xa0]*Rois|d(?:\.[\s\xa0]*Rois|e(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|[\s\xa0]*Rois)|e(?:me(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|\.[\s\xa0]*Rois|[\s\xa0]*Rois)|Kgs|[\s\xa0]*R(?:ois)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Rois|[\s\xa0]*Rois)|er(?:e(?:s[\s\xa0]*Rois|[\s\xa0]*Rois)|s[\s\xa0]*Rois|[\s\xa0]*Rois))|I(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|1(?:ère(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|er(?:\.[\s\xa0]*Rois|e(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|[\s\xa0]*Rois)|re(?:\.[\s\xa0]*Rois|[\s\xa0]*Rois)|\.[\s\xa0]*Rois|Kgs|[\s\xa0]*R(?:ois)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques))|II(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|2(?:ème(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|\.[\s\xa0]*Chroniques|d(?:\.[\s\xa0]*Chroniques|e(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|[\s\xa0]*Chroniques)|e(?:me(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|[\s\xa0]*Ch(?:r(?:o(?:n(?:iques)?)?)?)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|er(?:e(?:s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|s[\s\xa0]*Chroniques|[\s\xa0]*Chroniques))|I(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|1(?:ère(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|er(?:\.[\s\xa0]*Chroniques|e(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|[\s\xa0]*Chroniques)|re(?:\.[\s\xa0]*Chroniques|[\s\xa0]*Chroniques)|\.[\s\xa0]*Chroniques|[\s\xa0]*Ch(?:r(?:o(?:n(?:iques)?)?)?)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:zra|sd(?:r(?:as)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		N(?:[eé](?:h(?:[eé]mie)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esth(?:er[\s\xa0]*(?:\([Gg]rec\)|(?:[Gg]r(?:ec)?))|[\s\xa0]*[Gg]r)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:h(?:er)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ob|b)
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
		(?:La[\s\xa0]*Pri[eè]re[\s\xa0]*d(?:['’]Azaria[hs])|Pr(?:i[eè]re[\s\xa0]*d(?:['’]Azaria[hs])|\.[\s\xa0]*Azar|[\s\xa0]*Azar|Azar))
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
		(?:SgThree|C(?:antique[\s\xa0]*des[\s\xa0]*(?:Trois[\s\xa0]*Enfants|3[\s\xa0]*Enfants)|t[\s\xa0]*3[\s\xa0]*E))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|C(?:nt|a(?:ntique(?:[\s\xa0]*des[\s\xa0]*[Cc]antiques|s)?)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:(?:[eé](?:r(?:[eé]m(?:ie)?)?)?)|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Éz(?:[eé]ch(?:iel)?)|Ez(?:e(?:ch(?:iel)?|k)?|é(?:ch(?:iel)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Da(?:n(?:iel)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hos|Os(?:[eé]e)?)
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
		Ha(?:b(?:a(?:c(?:uc)?|k(?:uk)?))?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|So(?:ph(?:onie)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag|Ag(?:g(?:[eé]e)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ech|a(?:c(?:c(?:h(?:arie)?)?|h(?:arie)?)?|h)?|c)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:al(?:ac(?:h(?:ie)?)?|ch?)?|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:at(?:t(?:h(?:ieu)?)?)?|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:ar[ck]?|[cr])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:c|u(?:ke|c)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Jean|[\s\xa0]*Jean)|er(?:e(?:s[\s\xa0]*Jean|[\s\xa0]*Jean)|s[\s\xa0]*Jean|[\s\xa0]*Jean))|I(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|1(?:ère(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|er(?:\.[\s\xa0]*Jean|e(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|[\s\xa0]*Jean)|re(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|John|[\s\xa0]*J(?:ean|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Jean|[\s\xa0]*Jean))|II(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|2(?:ème(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|d(?:\.[\s\xa0]*Jean|e(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|[\s\xa0]*Jean)|e(?:me(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|[\s\xa0]*Jean)|John|[\s\xa0]*J(?:ean|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Troisi(?:[eè]me(?:s[\s\xa0]*Jean|[\s\xa0]*Jean))|III(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|3(?:ème(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|e(?:me(?:\.[\s\xa0]*Jean|[\s\xa0]*Jean)|\.[\s\xa0]*Jean|[\s\xa0]*Jean)|John|[\s\xa0]*J(?:ean|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:ean|ohn|n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ac(?:t(?:es(?:[\s\xa0]*des[\s\xa0]*Ap[oô]tres)?|s)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:m|o(?:m(?:ains)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens))|II(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|2(?:ème(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|\.[\s\xa0]*Corinthiens|d(?:\.[\s\xa0]*Corinthiens|e(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|[\s\xa0]*Corinthiens)|e(?:me(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|[\s\xa0]*Co(?:r(?:inthiens)?)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|er(?:e(?:s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|s[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens))|I(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|1(?:ère(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|er(?:\.[\s\xa0]*Corinthiens|e(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|[\s\xa0]*Corinthiens)|re(?:\.[\s\xa0]*Corinthiens|[\s\xa0]*Corinthiens)|\.[\s\xa0]*Corinthiens|[\s\xa0]*Co(?:r(?:inthiens)?)?|Cor))
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
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens)))|II(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|2(?:ème(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|d(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|e(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|[\s\xa0]*Thes(?:saloniciens|aloniciens))|e(?:me(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|Thess|[\s\xa0]*Th(?:es(?:aloniciens|s(?:aloniciens)?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|er(?:e(?:s[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|s[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens)))|I(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|1(?:ère(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|er(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|e(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|[\s\xa0]*Thes(?:saloniciens|aloniciens))|re(?:\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|[\s\xa0]*Thes(?:saloniciens|aloniciens))|\.[\s\xa0]*Thes(?:saloniciens|aloniciens)|Thess|[\s\xa0]*Th(?:es(?:aloniciens|s(?:aloniciens)?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi[eè]me(?:s[\s\xa0]*Timoth(?:[eé]e|[\s\xa0]*Timoth[eé]e))|II(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|2(?:ème(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|\.[\s\xa0]*Timoth[eé]e|d(?:\.[\s\xa0]*Timoth[eé]e|e(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|[\s\xa0]*Timoth[eé]e)|e(?:me(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|[\s\xa0]*Ti(?:m(?:oth[eé]e)?)?|Tim))|Deuxi[eè]me[\s\xa0]*Timoth(?:[eé]e)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|er(?:e(?:s[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|s[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e))|I(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|1(?:ère(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|er(?:\.[\s\xa0]*Timoth[eé]e|e(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|[\s\xa0]*Timoth[eé]e)|re(?:\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Timoth[eé]e)|\.[\s\xa0]*Timoth[eé]e|[\s\xa0]*Ti(?:m(?:oth[eé]e)?)?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tit(?:us|e)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ph(?:il[eé]mon|lm|m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		H(?:[eé](?:b(?:r(?:eux)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ja(?:ques|c(?:q(?:ues)?)?|s)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi(?:[eè]me(?:s[\s\xa0]*Pierre|[\s\xa0]*Pierre))|II(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|2(?:ème(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|\.[\s\xa0]*Pierre|d(?:\.[\s\xa0]*Pierre|e(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|[\s\xa0]*Pierre)|e(?:me(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|Pet|[\s\xa0]*P(?:i(?:erre)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Pierre|[\s\xa0]*Pierre)|er(?:e(?:s[\s\xa0]*Pierre|[\s\xa0]*Pierre)|s[\s\xa0]*Pierre|[\s\xa0]*Pierre))|I(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|1(?:ère(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|er(?:\.[\s\xa0]*Pierre|e(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|[\s\xa0]*Pierre)|re(?:\.[\s\xa0]*Pierre|[\s\xa0]*Pierre)|\.[\s\xa0]*Pierre|Pet|[\s\xa0]*P(?:i(?:erre)?)?))
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
		Su(?:[sz](?:anne(?:[\s\xa0]*(?:et[\s\xa0]*les[\s\xa0]*(?:deux[\s\xa0]*vieillards|vieillards)|au[\s\xa0]*bain))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Deuxi[eè]me(?:s[\s\xa0]*Maccab(?:[eé]es|[\s\xa0]*Maccab[eé]es))|II(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|2(?:ème(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|d(?:\.[\s\xa0]*Maccab[eé]es|e(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|[\s\xa0]*Maccab[eé]es)|e(?:me(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|Macc|[\s\xa0]*M(?:acc(?:ab[eé]es)?)?))|Deuxi[eè]me[\s\xa0]*Maccab(?:[eé]es)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Troisi[eè]me(?:s[\s\xa0]*Maccab(?:[eé]es|[\s\xa0]*Maccab[eé]es))|III(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|3(?:ème(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|e(?:me(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|Macc|[\s\xa0]*M(?:acc(?:ab[eé]es)?)?))|Troisi[eè]me[\s\xa0]*Maccab(?:[eé]es)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Quatri[eè]me(?:s[\s\xa0]*Maccab(?:[eé]es|[\s\xa0]*Maccab[eé]es))|IV(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|4(?:ème(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|e(?:me(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|Macc|[\s\xa0]*M(?:acc(?:ab[eé]es)?)?))|Quatri[eè]me[\s\xa0]*Maccab(?:[eé]es)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Premi(?:ère(?:s[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|er(?:e(?:s[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|s[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es))|I(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|1(?:ère(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|er(?:\.[\s\xa0]*Maccab[eé]es|e(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|[\s\xa0]*Maccab[eé]es)|re(?:\.[\s\xa0]*Maccab[eé]es|[\s\xa0]*Maccab[eé]es)|\.[\s\xa0]*Maccab[eé]es|Macc|[\s\xa0]*M(?:acc(?:ab[eé]es)?)?))
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
		continue if include_apocrypha is false and book.apocrypha? and book.apocrypha is true
		if case_sensitive is "books"
			book.regexp = new RegExp book.regexp.source, "g"
		out.push book
	out

# Default to not using the Apocrypha
bcv_parser::regexps.books = bcv_parser::regexps.get_books false, "none"

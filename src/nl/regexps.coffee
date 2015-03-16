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
				  | opschrift (?! [a-z] )		#could be followed by a number
				  | en#{bcv_parser::regexps.space}+volgende#{bcv_parser::regexps.space}+verzen | zie#{bcv_parser::regexps.space}+ook | hoofdstukken | hoofdstuk | verzen | vers | vgl | en | vs | - | v
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* opschrift
	| \d \W* en#{bcv_parser::regexps.space}+volgende#{bcv_parser::regexps.space}+verzen (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Eerste|1e|I|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Tweede|2e|II|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Derde|3e|III|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:en|vgl|zie#{bcv_parser::regexps.space}+ook)|-)"
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
		(?:Eerste[\s\xa0]*Mozes|Beresjiet|1(?:\.[\s\xa0]*Mozes|e(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|[\s\xa0]*Mozes)|I(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|G(?:en(?:esis)?|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Mozes|II(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|2(?:\.[\s\xa0]*Mozes|e(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|[\s\xa0]*Mozes)|Sjemot|Ex(?:od(?:us)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*en[\s\xa0]*de[\s\xa0]*draak)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Derde[\s\xa0]*Mozes|III(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|3(?:\.[\s\xa0]*Mozes|e(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|[\s\xa0]*Mozes)|[VW]ajikra|L(?:ev(?:iticus)?|v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Vierde[\s\xa0]*Mozes|B[ae]midbar|IV(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|4(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|Nu(?:m(?:beri|eri)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wijsheid[\s\xa0]*van[\s\xa0]*(?:J(?:ozua[\s\xa0]*Ben[\s\xa0]*Sirach|ezus[\s\xa0]*Sirach)|Ben[\s\xa0]*Sirach)|Ecclesiasticus|Jezus[\s\xa0]*Sirach|Sir(?:ach)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:De[\s\xa0]*wijsheid[\s\xa0]*van[\s\xa0]*Salomo|Het[\s\xa0]*boek[\s\xa0]*der[\s\xa0]*wijsheid|Wi(?:jsheid(?:[\s\xa0]*van[\s\xa0]*Salomo)?|s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lam|Kl(?:aagl(?:iederen)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Brief[\s\xa0]*van[\s\xa0]*Jeremia|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ap(?:ocalyps|[ck])|Rev|Op(?:enb(?:aring(?:[\s\xa0]*van[\s\xa0]*Johannes|en)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:PrMan|Man(?:asse)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:5(?:\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|V(?:ijfde[\s\xa0]*Mozes|\.[\s\xa0]*Mozes|[\s\xa0]*Mozes)|D(?:e(?:wariem|ut(?:eronomium)?)|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jo(?:sh|z(?:ua)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|R(?:icht(?:eren?)?|e(?:cht(?:ers)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		R(?:uth|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*E(?:sdras|zra)|Derde[\s\xa0]*E(?:sdras|zra)|3(?:\.[\s\xa0]*E(?:sdras|zra)|e(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|[\s\xa0]*E(?:sdras|zra))|I(?:II(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|1(?:\.[\s\xa0]*E(?:sdras|zra)|e(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|[\s\xa0]*E(?:sdras|zra)|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*E(?:sdras|zra)|Vierde[\s\xa0]*E(?:sdras|zra)|I(?:[IV](?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra)))|4(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|2(?:\.[\s\xa0]*E(?:sdras|zra)|e(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|[\s\xa0]*E(?:sdras|zra)|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isa|J(?:es(?:aja)?|s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Sam(?:u[eë]l)?|Samuel[\s\xa0]*II|II(?:\.[\s\xa0]*Sam(?:u[eë]l)?|[\s\xa0]*Sam(?:u[eë]l)?)|2(?:\.[\s\xa0]*Sam(?:u[eë]l)?|e(?:\.[\s\xa0]*Sam(?:u[eë]l)?|[\s\xa0]*Sam(?:u[eë]l)?)|Sam|[\s\xa0]*S(?:am(?:u[eë]l)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*Sam(?:u[eë]l)?|Samuel[\s\xa0]*I|I(?:\.[\s\xa0]*Sam(?:u[eë]l)?|[\s\xa0]*Sam(?:u[eë]l)?)|1(?:\.[\s\xa0]*Sam(?:u[eë]l)?|e(?:\.[\s\xa0]*Sam(?:u[eë]l)?|[\s\xa0]*Sam(?:u[eë]l)?)|Sam|[\s\xa0]*S(?:am(?:u[eë]l)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Ko(?:n(?:ingen)?)?|II(?:\.[\s\xa0]*Ko(?:n(?:ingen)?)?|[\s\xa0]*Ko(?:n(?:ingen)?)?)|2(?:\.[\s\xa0]*Ko(?:n(?:ingen)?)?|e(?:\.[\s\xa0]*Ko(?:n(?:ingen)?)?|[\s\xa0]*Ko(?:n(?:ingen)?)?)|[\s\xa0]*Ko(?:n(?:ingen)?)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*Ko(?:n(?:ingen)?)?|1(?:\.[\s\xa0]*Ko(?:n(?:ingen)?)?|e(?:\.[\s\xa0]*Ko(?:n(?:ingen)?)?|[\s\xa0]*Ko(?:n(?:ingen)?)?)|[\s\xa0]*Ko(?:n(?:ingen)?)?|Kgs)|I(?:\.[\s\xa0]*Ko(?:n(?:ingen)?)?|[\s\xa0]*Ko(?:n(?:ingen)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Kron(?:ieken)?|II(?:\.[\s\xa0]*Kron(?:ieken)?|[\s\xa0]*Kron(?:ieken)?)|2(?:\.[\s\xa0]*Kron(?:ieken)?|e(?:\.[\s\xa0]*Kron(?:ieken)?|[\s\xa0]*Kron(?:ieken)?)|[\s\xa0]*Kr(?:on(?:ieken)?)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*Kron(?:ieken)?|I(?:\.[\s\xa0]*Kron(?:ieken)?|[\s\xa0]*Kron(?:ieken)?)|1(?:\.[\s\xa0]*Kron(?:ieken)?|e(?:\.[\s\xa0]*Kron(?:ieken)?|[\s\xa0]*Kron(?:ieken)?)|[\s\xa0]*Kr(?:on(?:ieken)?)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ezra?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:emia)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:er[\s\xa0]*\(Gr(?:ieks\)|\.\)|\))|[\s\xa0]*gr)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:er|h(?:er)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Job
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ps(?:alm(?:en)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Gebed[\s\xa0]*van[\s\xa0]*Azarja|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prov|Spr(?:euken)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[KQ]oheleth?|Eccl|Pr(?:ed(?:iker)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Gezang[\s\xa0]*der[\s\xa0]*drie[\s\xa0]*mannen[\s\xa0]*in[\s\xa0]*het[\s\xa0]*vuur|Lied[\s\xa0]*van[\s\xa0]*de[\s\xa0]*drie[\s\xa0]*jongemannen|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Canticum[\s\xa0]*canticorum|Song|H(?:oogl(?:ied)?|l))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:er(?:emia)?|r)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Eze(?:ch(?:i[eë]l)?|k)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Da(?:n(?:i[eë]l)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hos(?:ea)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:o[eë]l|l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Am(?:os)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ob(?:ad(?:ja)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jon(?:ah?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:c(?:ha|a)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Nah(?:um)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:akuk)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sef(?:anja)?|Ze(?:ph|f(?:anja)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hag(?:g(?:a[iï])?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Z(?:ach(?:aria)?|ech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:eachi)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Matth[eé](?:[uü]s)|(?:Evangelie[\s\xa0]*volgens[\s\xa0]*Matte[uü]s|M(?:at(?:t(?:e[uü]s|h)?)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelie[\s\xa0]*volgens[\s\xa0]*Mar[ck]us|M(?:ar(?:[ck](?:us)?)|[ck]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelie[\s\xa0]*volgens[\s\xa0]*Lu[ck]as|L(?:u(?:c(?:as)?|k(?:as|e)?)|[ck]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		1John|(?:Eerste[\s\xa0]*Joh(?:annes)?|1(?:\.[\s\xa0]*Joh(?:annes)?|e(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|[\s\xa0]*Joh(?:annes)?)|I(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		2John|(?:Tweede[\s\xa0]*Joh(?:annes)?|II(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|2(?:\.[\s\xa0]*Joh(?:annes)?|e(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|[\s\xa0]*Joh(?:annes)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		3John|(?:Derde[\s\xa0]*Joh(?:annes)?|III(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|3(?:\.[\s\xa0]*Joh(?:annes)?|e(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|[\s\xa0]*Joh(?:annes)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelie[\s\xa0]*volgens[\s\xa0]*Johannes|Joh(?:annes|n)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|H(?:and(?:elingen(?:[\s\xa0]*(?:van[\s\xa0]*de[\s\xa0]*apostelen|der[\s\xa0]*apostelen))?)?|nd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Rom(?:einen(?:brief)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|II(?:\.[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?))|2(?:\.[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|e(?:\.[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?))|[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|I(?:\.[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?))|1(?:\.[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|e(?:\.[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?))|[\s\xa0]*(?:Corint(?:i[eë]rs?|h(?:i[eë]rs?|e))|Kor(?:int(?:i[eë]rs?|h(?:i[eë]rs?|e)))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Gal(?:aten(?:brief)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:ph|f(?:ez(?:i[eë]rs)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil|Fil(?:ip(?:penzen)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[CK]ol(?:ossenzen)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|II(?:\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?))|2(?:\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|Thess|e(?:\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?))|[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|1(?:\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|Thess|e(?:\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?))|[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?))|I(?:\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|II(?:\.[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?)|2(?:\.[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|e(?:\.[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?)|[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|I(?:\.[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?)|1(?:\.[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|e(?:\.[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?)|[\s\xa0]*Tim(?:ot(?:he[uü]s|e[uü]s))?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tit(?:us)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Fil(?:émon|em(?:on)?|m)|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Heb(?:r(?:ee[eë]n)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ja(?:k(?:obus)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Pet(?:r(?:us)?)?|II(?:\.[\s\xa0]*Pet(?:r(?:us)?)?|[\s\xa0]*Pet(?:r(?:us)?)?)|2(?:\.[\s\xa0]*Pet(?:r(?:us)?)?|e(?:\.[\s\xa0]*Pet(?:r(?:us)?)?|[\s\xa0]*Pet(?:r(?:us)?)?)|[\s\xa0]*Pe(?:t(?:r(?:us)?)?)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*Pet(?:r(?:us)?)?|I(?:\.[\s\xa0]*Pet(?:r(?:us)?)?|[\s\xa0]*Pet(?:r(?:us)?)?)|1(?:\.[\s\xa0]*Pet(?:r(?:us)?)?|e(?:\.[\s\xa0]*Pet(?:r(?:us)?)?|[\s\xa0]*Pet(?:r(?:us)?)?)|[\s\xa0]*Pe(?:t(?:r(?:us)?)?)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jud(?:as|e)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tob(?:i(?:as?|t)|ías?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		J(?:udith?|dt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bar(?:uch)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sus(?:anna)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tweede[\s\xa0]*Mak(?:kabee[eë]n)?|II(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?)|2(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|e(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?)|[\s\xa0]*Mak(?:kabee[eë]n)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Derde[\s\xa0]*Mak(?:kabee[eë]n)?|III(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?)|3(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|e(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?)|[\s\xa0]*Mak(?:kabee[eë]n)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Vierde[\s\xa0]*Mak(?:kabee[eë]n)?|IV(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?)|4(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Eerste[\s\xa0]*Mak(?:kabee[eë]n)?|1(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|e(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?)|[\s\xa0]*Mak(?:kabee[eë]n)?|Macc)|I(?:\.[\s\xa0]*Mak(?:kabee[eë]n)?|[\s\xa0]*Mak(?:kabee[eë]n)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek", "Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ez
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

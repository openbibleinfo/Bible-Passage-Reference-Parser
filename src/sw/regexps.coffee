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
				  | mistari | sura | hadi | taz | ff | na
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* title
	| \d \W* ff (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Kwanza|I|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Pili|II|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Tatu|III|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:taz|na)|hadi)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|hadi)"
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
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Musa|Gen|Mwa(?:nzo)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Exod|K(?:itabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Musa|ut(?:oka)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Danieli[\s\xa0]*na[\s\xa0]*Makuhani[\s\xa0]*wa[\s\xa0]*Beli|Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Tatu[\s\xa0]*cha[\s\xa0]*Musa|Mambo[\s\xa0]*ya[\s\xa0]*Walawi|L(?:aw|ev)|Wal(?:awi)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Nne[\s\xa0]*cha[\s\xa0]*Musa|Hes(?:abu)?|Num)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sira?|Y(?:oshua[\s\xa0]*bin[\s\xa0]*Sira|bS))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hek(?:ima(?:[\s\xa0]*ya[\s\xa0]*Solomoni)?)?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lam|Mao(?:mbolezo(?:[\s\xa0]*ya[\s\xa0]*Yeremia)?)?|Omb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*ya[\s\xa0]*Yeremia|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rev|Uf(?:u(?:nu(?:a[\s\xa0]*wa[\s\xa0]*Yohana|o(?:[\s\xa0]*wa[\s\xa0]*Yohan[ae])?))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		PrMan
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Deut|K(?:itabu[\s\xa0]*cha[\s\xa0]*Tano[\s\xa0]*cha[\s\xa0]*Musa|um(?:b(?:ukumbu(?:[\s\xa0]*la[\s\xa0]*(?:Sheria|Torati))?)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Josh|Yos(?:hua)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|Waam(?:uzi)?|Amu)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Ruth[iu]|Rut(?:h[iu]?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Ezra|wanza[\s\xa0]*Ezra)|I(?:\.[\s\xa0]*Ezra|[\s\xa0]*Ezra)|1(?:\.[\s\xa0]*Ezra|[\s\xa0]*Ezra|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Ezra|Pili[\s\xa0]*Ezra|II(?:\.[\s\xa0]*Ezra|[\s\xa0]*Ezra)|2(?:\.[\s\xa0]*Ezra|[\s\xa0]*Ezra|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Is(?:a(?:ya)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Samueli|Samueli[\s\xa0]*II|Pili[\s\xa0]*Sam(?:[uw]eli)?|II(?:\.[\s\xa0]*Sam(?:[uw]eli)?|[\s\xa0]*Sam(?:[uw]eli)?)|2(?:\.[\s\xa0]*Sam(?:[uw]eli)?|[\s\xa0]*Sam(?:[uw]eli)?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Samueli|wanza[\s\xa0]*Sam(?:[uw]eli)?)|Samueli[\s\xa0]*I|I(?:\.[\s\xa0]*Sam(?:[uw]eli)?|[\s\xa0]*Sam(?:[uw]eli)?)|1(?:\.[\s\xa0]*Sam(?:[uw]eli)?|[\s\xa0]*Sam(?:[uw]eli)?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Wafalme|Wafalme[\s\xa0]*II|Pili[\s\xa0]*(?:Wafalme|Fal)|II(?:\.[\s\xa0]*(?:Wafalme|Fal)|[\s\xa0]*(?:Wafalme|Fal))|2(?:\.[\s\xa0]*(?:Wafalme|Fal)|[\s\xa0]*(?:Wafalme|Fal)|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Wafalme|wanza[\s\xa0]*(?:Wafalme|Fal))|Wafalme[\s\xa0]*I|I(?:\.[\s\xa0]*(?:Wafalme|Fal)|[\s\xa0]*(?:Wafalme|Fal))|1(?:\.[\s\xa0]*(?:Wafalme|Fal)|[\s\xa0]*(?:Wafalme|Fal)|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati[\s\xa0]*II|Pili[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|II(?:\.[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya))|2(?:\.[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati[\s\xa0]*I|Kwanza[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|I(?:\.[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya))|1(?:\.[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|[\s\xa0]*(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Nya)|Chr))
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
		GkEsth
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:er|a|h(?:er)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*(?:Ayubu|Yobu)|Ayu(?:bu)?|Job|Yobu?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zab(?:uri)?|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		PrAzar
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prov|M(?:eth(?:ali)?|it(?:h(?:ali)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|Mhu(?:biri)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wimbo[\s\xa0]*wa[\s\xa0]*Vijana[\s\xa0]*Watatu|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|Wim(?:bo[\s\xa0]*(?:Ulio[\s\xa0]*Bora|Bora))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jer|Yer(?:emia)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Eze(?:k(?:ieli)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Dan(?:ieli)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hos(?:ea)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|Yoe(?:li)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Amo(?:si?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ob(?:a(?:d(?:ia)?)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|Yona?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:c|ka?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Nah(?:umu?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:akuki)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|Sef(?:ania)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hag(?:ai)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ze(?:ch|k(?:aria)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:aki)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Injili[\s\xa0]*ya[\s\xa0]*Mathayo|M(?:at(?:ayo|h(?:ayo)?|t)?|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Injili[\s\xa0]*ya[\s\xa0]*Marko|M(?:arko?|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Injili[\s\xa0]*ya[\s\xa0]*Luka|L(?:uk[ae]|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*wa[\s\xa0]*Yohane|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*ya[\s\xa0]*Yohane|Kwanza[\s\xa0]*Yoh(?:an[ae])?|Yohane[\s\xa0]*I|1(?:\.[\s\xa0]*Yoh(?:an[ae])?|[\s\xa0]*Yoh(?:an[ae])?|John)|I(?:\.[\s\xa0]*Yoh(?:an[ae])?|[\s\xa0]*Yoh(?:an[ae])?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*wa[\s\xa0]*Yohane|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*ya[\s\xa0]*Yohane|Yohane[\s\xa0]*II|Pili[\s\xa0]*Yoh(?:an[ae])?|II(?:\.[\s\xa0]*Yoh(?:an[ae])?|[\s\xa0]*Yoh(?:an[ae])?)|2(?:\.[\s\xa0]*Yoh(?:an[ae])?|[\s\xa0]*Yoh(?:an[ae])?|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Tatu[\s\xa0]*wa[\s\xa0]*Yohane|Barua[\s\xa0]*ya[\s\xa0]*Tatu[\s\xa0]*ya[\s\xa0]*Yohane|Yohane[\s\xa0]*III|Tatu[\s\xa0]*Yoh(?:an[ae])?|III(?:\.[\s\xa0]*Yoh(?:an[ae])?|[\s\xa0]*Yoh(?:an[ae])?)|3(?:\.[\s\xa0]*Yoh(?:an[ae])?|[\s\xa0]*Yoh(?:an[ae])?|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Injili[\s\xa0]*ya[\s\xa0]*Yohan[ae]|John|Yoh(?:an[ae])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|M(?:atendo(?:[\s\xa0]*ya[\s\xa0]*Mitume)?|do))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*kwa[\s\xa0]*Waroma|War(?:aka[\s\xa0]*kwa[\s\xa0]*War(?:oma|umi)|oma|umi)|R[ou]m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wakorintho|Wa(?:raka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wakorint(?:ho|o)|korintho[\s\xa0]*II)|Pili[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|II(?:\.[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|[\s\xa0]*(?:Wakorint(?:ho|o)|Kor))|2(?:\.[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wakorintho|Wa(?:raka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wakorint(?:ho|o)|korintho[\s\xa0]*I)|Kwanza[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|I(?:\.[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|[\s\xa0]*(?:Wakorint(?:ho|o)|Kor))|1(?:\.[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|[\s\xa0]*(?:Wakorint(?:ho|o)|Kor)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*kwa[\s\xa0]*Wagalatia|Wagalatia|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*kwa[\s\xa0]*Waefeso|Wa(?:raka[\s\xa0]*kwa[\s\xa0]*Waefeso|efeso)|E(?:ph|fe?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*kwa[\s\xa0]*Wafilipi|Wa(?:raka[\s\xa0]*kwa[\s\xa0]*Wafilipi|filipi)|Phil|F(?:il|lp))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*kwa[\s\xa0]*Wakolosai|Wa(?:raka[\s\xa0]*kwa[\s\xa0]*Wakolosai|kolosai)|[CK]ol)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wathesalonike|Wa(?:raka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wathesalonik[ei]|thesalonike[\s\xa0]*II)|Pili[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)|II(?:\.[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)|[\s\xa0]*(?:Wathesalonike|Th(?:es?)?))|2(?:Thess|\.[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)|[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wathesalonike|Wa(?:raka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wathesalonik[ei]|thesalonike[\s\xa0]*I)|Kwanza[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)|1(?:Thess|\.[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)|[\s\xa0]*(?:Wathesalonike|Th(?:es?)?))|I(?:\.[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)|[\s\xa0]*(?:Wathesalonike|Th(?:es?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Timotheo|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Timotheo|Timotheo[\s\xa0]*II|Pili[\s\xa0]*Tim(?:otheo)?|II(?:\.[\s\xa0]*Tim(?:otheo)?|[\s\xa0]*Tim(?:otheo)?)|2(?:\.[\s\xa0]*Tim(?:otheo)?|[\s\xa0]*Tim(?:otheo)?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Timotheo|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Timotheo|Kwanza[\s\xa0]*Tim(?:otheo)?|Timotheo[\s\xa0]*I|I(?:\.[\s\xa0]*Tim(?:otheo)?|[\s\xa0]*Tim(?:otheo)?)|1(?:\.[\s\xa0]*Tim(?:otheo)?|[\s\xa0]*Tim(?:otheo)?|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Waraka[\s\xa0]*kwa[\s\xa0]*Tito|Barua[\s\xa0]*kwa[\s\xa0]*Tito|Tit(?:us|o)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Waraka[\s\xa0]*kwa[\s\xa0]*Filemoni|Barua[\s\xa0]*kwa[\s\xa0]*Filemoni|Phlm|F(?:il(?:emoni|m)|lm))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*kwa[\s\xa0]*Waebrania|Wa(?:raka[\s\xa0]*kwa[\s\xa0]*Waebrania|ebrania)|Heb|Ebr?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Yakobo|Barua[\s\xa0]*ya[\s\xa0]*Yakobo|Jas|Yak(?:obo)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*wa[\s\xa0]*Petro|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*ya[\s\xa0]*Petro|P(?:etro[\s\xa0]*II|ili[\s\xa0]*Pet(?:ro)?)|II(?:\.[\s\xa0]*Pet(?:ro)?|[\s\xa0]*Pet(?:ro)?)|2(?:\.[\s\xa0]*Pet(?:ro)?|[\s\xa0]*Pet(?:ro)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*wa[\s\xa0]*Petro|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*ya[\s\xa0]*Petro|Kwanza[\s\xa0]*Pet(?:ro)?|Petro[\s\xa0]*I|I(?:\.[\s\xa0]*Pet(?:ro)?|[\s\xa0]*Pet(?:ro)?)|1(?:\.[\s\xa0]*Pet(?:ro)?|[\s\xa0]*Pet(?:ro)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Barua[\s\xa0]*ya[\s\xa0]*Yuda|Jude|Yuda?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tob(?:iti)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Yud(?:it(?:hi?|i)?|t)|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bar(?:uku?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sus(?:ana)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*II|Wamakabayo[\s\xa0]*II|Pili[\s\xa0]*(?:Wamakabayo|Mak)|II(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak))|2(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*III|Wamakabayo[\s\xa0]*III|Tatu[\s\xa0]*(?:Wamakabayo|Mak)|III(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak))|3(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*IV|Wamakabayo[\s\xa0]*IV|Nne[\s\xa0]*(?:Wamakabayo|Mak)|IV(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak))|4(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Wamakabayo[\s\xa0]*I|K(?:itabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*I|wanza[\s\xa0]*(?:Wamakabayo|Mak))|1(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak)|Macc)|I(?:\.[\s\xa0]*(?:Wamakabayo|Mak)|[\s\xa0]*(?:Wamakabayo|Mak)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John", "Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Yn
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

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
				  | titulus (?! [a-z] )		#could be followed by a number
				  | et#{bcv_parser::regexps.space}+sequentes | et#{bcv_parser::regexps.space}+seq | versus | caput | vers | cap | ver | ad | et | v
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* titulus
	| \d+ \W* (?:et#{bcv_parser::regexps.space}+sequentes|et#{bcv_parser::regexps.space}+seq) (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:I|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:II|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:III|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|et|ad)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|ad)"
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
		(?:Gen(?:esis)?|Liber[\s\xa0]*Genesis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Exodus|Ex(?:od(?:us)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Histoia[\s\xa0]*Beli[\s\xa0]*et[\s\xa0]*draconis|Bel(?:[\s\xa0]*et[\s\xa0]*draconis)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		L(?:ev(?:iticus)?|iber[\s\xa0]*Leviticus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Numeri|Num(?:eri)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Oratio[\s\xa0]*Iesu[\s\xa0]*filii[\s\xa0]*Sirach|Liber[\s\xa0]*Ecclesiasticus|Sir(?:ach)?|Eccl(?:esiasticus|us))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Sapientiae|Wis|Sap(?:ient(?:ia(?:[\s\xa0]*Salomonis)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Lam(?:entationes)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Or(?:atio[\s\xa0]*Ieremiae|\.[\s\xa0]*Ier|[\s\xa0]*Ier)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ap(?:oc(?:alypsis(?:[\s\xa0]*Ioannis(?:[\s\xa0]*Apostoli)?)?)?)?|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:PrMan|Or(?:[\s\xa0]*Man|atio[\s\xa0]*(?:regis[\s\xa0]*Manassae|Manassae)|\.[\s\xa0]*Man))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Deuteronomii|Deut(?:eronomium)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Josh|Liber[\s\xa0]*Iosue|Ios(?:ue)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Iudicum|Iud(?:icum)?|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Ruth|Ru(?:th?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*(?:I[\s\xa0]*Esdrae|Esdrae[\s\xa0]*I)|I(?:\.[\s\xa0]*Esd(?:rae?)?|[\s\xa0]*Esd(?:rae?)?)|1(?:\.[\s\xa0]*Esd(?:rae?)?|Esd|[\s\xa0]*Esd(?:rae?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:II(?:\.[\s\xa0]*Esd(?:rae?)?|[\s\xa0]*Esd(?:rae?)?)|Liber[\s\xa0]*(?:II[\s\xa0]*Esdrae|Esdrae[\s\xa0]*II)|2(?:\.[\s\xa0]*Esd(?:rae?)?|Esd|[\s\xa0]*Esd(?:rae?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isa(?:ias)?|Liber[\s\xa0]*Isaiae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*II[\s\xa0]*Samuelis|Samuelis[\s\xa0]*II|II(?:\.[\s\xa0]*(?:Sam(?:uelis)?|Regnorum)|[\s\xa0]*(?:Sam(?:uelis)?|Regnorum))|2(?:\.[\s\xa0]*(?:Sam(?:uelis)?|Regnorum)|[\s\xa0]*(?:Sam(?:uelis)?|Regnorum)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:\.[\s\xa0]*(?:Sam(?:uelis)?|Regnorum)|[\s\xa0]*(?:Sam(?:uelis)?|Regnorum))|Samuelis[\s\xa0]*I|Liber[\s\xa0]*I[\s\xa0]*Samuelis|1(?:\.[\s\xa0]*(?:Sam(?:uelis)?|Regnorum)|[\s\xa0]*(?:Sam(?:uelis)?|Regnorum)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Regum[\s\xa0]*II|4(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|2(?:Kgs|[\s\xa0]*Reg(?:um)?|\.[\s\xa0]*Reg(?:um)?)|Liber[\s\xa0]*II[\s\xa0]*Regum|I(?:V(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|I(?:[\s\xa0]*Reg(?:um)?|\.[\s\xa0]*Reg(?:um)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|1(?:Kgs|[\s\xa0]*Reg(?:um)?|\.[\s\xa0]*Reg(?:um)?)|I(?:II(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|[\s\xa0]*Reg(?:um)?|\.[\s\xa0]*Reg(?:um)?)|Regum[\s\xa0]*I|Liber[\s\xa0]*I[\s\xa0]*Regum)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*II[\s\xa0]*Paralipomenon|Paralipomenon[\s\xa0]*II|II(?:[\s\xa0]*Par(?:alipomenon)?|\.[\s\xa0]*Par(?:alipomenon)?)|2(?:[\s\xa0]*Par(?:alipomenon)?|\.[\s\xa0]*Par(?:alipomenon)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:[\s\xa0]*Par(?:alipomenon)?|\.[\s\xa0]*Par(?:alipomenon)?)|Liber[\s\xa0]*I[\s\xa0]*Paralipomenon|1(?:[\s\xa0]*Par(?:alipomenon)?|\.[\s\xa0]*Par(?:alipomenon)?|Chr)|Paralipomenon[\s\xa0]*I)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:zra|sd(?:r(?:ae?)?)?)|Liber[\s\xa0]*Esdrae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Nehemiae|Neh(?:emiae)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esther[\s\xa0]*graeca|G(?:kEsth|raeca[\s\xa0]*Esther))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Esther|Est(?:h(?:er)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[JI]ob|Liber[\s\xa0]*Iob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Psalmorum|Ps(?:a(?:lm(?:us|i))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Or(?:\.[\s\xa0]*Azar|[\s\xa0]*Azar|atio[\s\xa0]*Azariae)|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Proverbiorum|Pro(?:v(?:erbia)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ec(?:cl(?:esiastes)?)?|Qo|Liber[\s\xa0]*(?:Qoelet|Ecclesiastes))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hymnus[\s\xa0]*trium[\s\xa0]*puerorum|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|Can(?:t(?:\.[\s\xa0]*Cantic|[\s\xa0]*Cantic|icum[\s\xa0]*Canticorum))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jer|Ier(?:emias)?|Liber[\s\xa0]*Ieremiae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Ezechielis|Eze(?:k|chiel)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dan(?:iel)?|Prophetia[\s\xa0]*Danielis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Os(?:ee)?|Prophetia[\s\xa0]*Osee|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[JI]oel|Prophetia[\s\xa0]*Ioel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Amos|Amos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Abd(?:ias)?|Obad|Prophetia[\s\xa0]*Abdiae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Ionae|Ionas?|Jonah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Michaeae|Mic(?:haeas)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Nah(?:um)?|Prophetia[\s\xa0]*Nahum)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Habacuc|Hab(?:acuc)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Soph(?:onias)?|Zeph|Prophetia[\s\xa0]*Sophoniae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Aggaei|Hag|Ag(?:gaeus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Zachariae|Z(?:ac(?:harias)?|ech))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:achias)?|Prophetia[\s\xa0]*Malachiae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Matt(?:haeus)?|Evangelium[\s\xa0]*secundum[\s\xa0]*Matthaeum)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*secundum[\s\xa0]*Marcum|M(?:ar(?:c(?:us)?|k)|c))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*secundum[\s\xa0]*Lucam|L(?:u(?:c(?:as)?|ke)?|c))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*I(?:oannis[\s\xa0]*I|[\s\xa0]*Ioannis)|I(?:\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n)|oannis[\s\xa0]*I)|1(?:John|\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:I(?:\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n))|oannis[\s\xa0]*II)|Epistula[\s\xa0]*I(?:I[\s\xa0]*Ioannis|oannis[\s\xa0]*II)|2(?:John|\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:John|\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n))|Epistula[\s\xa0]*I(?:oannis[\s\xa0]*III|II[\s\xa0]*Ioannis)|I(?:oannis[\s\xa0]*III|II(?:\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:I(?:oan(?:nes)?|n)|Evangelium[\s\xa0]*secundum[\s\xa0]*Ioannem|John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Act(?:s|us(?:[\s\xa0]*Apostolorum)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Romanos|Rom(?:anos)?|ad[\s\xa0]*Romanos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:II[\s\xa0]*ad[\s\xa0]*Corinthios|ad[\s\xa0]*Corinthios[\s\xa0]*II)|ad[\s\xa0]*Corinthios[\s\xa0]*II|2(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?|Cor)|II(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?)|Corinthios[\s\xa0]*II)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:ad[\s\xa0]*Corinthios[\s\xa0]*I|I[\s\xa0]*ad[\s\xa0]*Corinthios)|ad[\s\xa0]*Corinthios[\s\xa0]*I|I(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?)|Corinthios[\s\xa0]*I|1(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Gal(?:atas)?|ad[\s\xa0]*Galatas|Epistula[\s\xa0]*ad[\s\xa0]*Galatas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ad[\s\xa0]*Ephesios|Ep(?:h(?:esios)?|istula[\s\xa0]*ad[\s\xa0]*Ephesios))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil(?:ippenses)?|Epistula[\s\xa0]*ad[\s\xa0]*Philippenses|ad[\s\xa0]*Philippenses)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Col(?:ossenses)?|Epistula[\s\xa0]*ad[\s\xa0]*Colossenses|ad[\s\xa0]*Colossenses)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:ad[\s\xa0]*Thessalonicenses[\s\xa0]*II|II(?:[\s\xa0]*Th(?:ess(?:alonicenses)?)?|\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?)|2(?:[\s\xa0]*Th(?:ess(?:alonicenses)?)?|Thess|\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?)|Epistula[\s\xa0]*(?:ad[\s\xa0]*Thessalonicenses[\s\xa0]*II|II[\s\xa0]*ad[\s\xa0]*Thessalonicenses)|Thessalonicenses[\s\xa0]*II)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Th(?:ess(?:alonicenses)?)?|Thess|\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?)|Epistula[\s\xa0]*(?:ad[\s\xa0]*Thessalonicenses[\s\xa0]*I|I[\s\xa0]*ad[\s\xa0]*Thessalonicenses)|I(?:[\s\xa0]*Th(?:ess(?:alonicenses)?)?|\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?)|ad[\s\xa0]*Thessalonicenses[\s\xa0]*I|Thessalonicenses[\s\xa0]*I)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:ad[\s\xa0]*Timotheum[\s\xa0]*II|II[\s\xa0]*ad[\s\xa0]*Timotheum)|II(?:\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m))|2(?:Tim|\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)))|(?:ad[\s\xa0]*Timotheum[\s\xa0]*II|Timotheum[\s\xa0]*II)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m))|Epistula[\s\xa0]*(?:ad[\s\xa0]*Timotheum[\s\xa0]*I|I[\s\xa0]*ad[\s\xa0]*Timotheum)|1(?:Tim|\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)))|(?:ad[\s\xa0]*Timotheum[\s\xa0]*I|Timotheum[\s\xa0]*I)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tit(?:u[sm])?|Epistula[\s\xa0]*ad[\s\xa0]*Titum|ad[\s\xa0]*Titum)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ph(?:lm|mn|ilemonem)|ad[\s\xa0]*Philemonem|Epistula(?:[\s\xa0]*ad[\s\xa0]*Philemonem|m[\s\xa0]*ad[\s\xa0]*Philemonem))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ad[\s\xa0]*Hebraeos|Epistula[\s\xa0]*ad[\s\xa0]*Hebraeos|Heb(?:r(?:aeos)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Iacobi|Jas|Epistula[\s\xa0]*Iacobi)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:Petri[\s\xa0]*II|II[\s\xa0]*Petri)|II(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?)|2(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?|Pet)|Petri[\s\xa0]*II)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?|Pet)|I(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?)|Petri[\s\xa0]*I|Epistula[\s\xa0]*(?:I[\s\xa0]*Petri|Petri[\s\xa0]*I))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jude|Iudae|Epistula[\s\xa0]*Iudae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*T(?:hobis|obiae)|T(?:ob(?:ia[se])?|ho))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:I(?:udith|dt)|Jdt|Liber[\s\xa0]*Iudith)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Baruch|Bar(?:uch)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sus(?:annae?)?|Historia[\s\xa0]*Susannae)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Machabaeorum[\s\xa0]*II|2(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?|Macc)|Liber[\s\xa0]*(?:Maccabaeorum[\s\xa0]*II|II[\s\xa0]*Maccabaeorum)|II(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?|Macc)|Liber[\s\xa0]*(?:Maccabaeorum[\s\xa0]*III|III[\s\xa0]*Maccabaeorum)|Machabaeorum[\s\xa0]*III|III(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:IV(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?)|4(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?|Macc)|Liber[\s\xa0]*(?:Maccabaeorum[\s\xa0]*IV|IV[\s\xa0]*Maccabaeorum)|Machabaeorum[\s\xa0]*IV)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?|Macc)|I(?:[\s\xa0]*Mac(?:abaeorum|habaeorum)?|\.[\s\xa0]*Mac(?:abaeorum|habaeorum)?)|Machabaeorum[\s\xa0]*I|Liber[\s\xa0]*(?:Maccabaeorum[\s\xa0]*I|I[\s\xa0]*Maccabaeorum))
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
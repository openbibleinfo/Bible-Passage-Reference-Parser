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
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* titulus
	| \d \W* (?:et#{bcv_parser::regexps.space}+sequentes|et#{bcv_parser::regexps.space}+seq) (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
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
		(?:Liber[\s\xa0]*Genesis|Gen(?:esis)?)
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
		L(?:iber[\s\xa0]*Leviticus|ev(?:iticus)?)
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
		(?:Oratio[\s\xa0]*Iesu[\s\xa0]*filii[\s\xa0]*Sirach|Liber[\s\xa0]*Ecclesiasticus|Eccl(?:esiasticus|us)|Sir(?:ach)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Sapientiae|Sap(?:ient(?:ia(?:[\s\xa0]*Salomonis)?)?)?|Wis)
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
		(?:Rev|Ap(?:oc(?:alypsis(?:[\s\xa0]*Ioannis(?:[\s\xa0]*Apostoli)?)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Or(?:atio[\s\xa0]*(?:regis[\s\xa0]*Manassae|Manassae)|\.[\s\xa0]*Man|[\s\xa0]*Man)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Deuteronomii|Deut(?:eronomium)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Iosue|Josh|Ios(?:ue)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Iudicum|Judg|Iud(?:icum)?)
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
		(?:Liber[\s\xa0]*(?:Esdrae[\s\xa0]*I|I[\s\xa0]*Esdrae)|I(?:\.[\s\xa0]*Esd(?:rae?)?|[\s\xa0]*Esd(?:rae?)?)|1(?:\.[\s\xa0]*Esd(?:rae?)?|[\s\xa0]*Esd(?:rae?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*(?:Esdrae[\s\xa0]*II|II[\s\xa0]*Esdrae)|II(?:\.[\s\xa0]*Esd(?:rae?)?|[\s\xa0]*Esd(?:rae?)?)|2(?:\.[\s\xa0]*Esd(?:rae?)?|[\s\xa0]*Esd(?:rae?)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Isaiae|Isa(?:ias)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*II[\s\xa0]*Samuelis|Samuelis[\s\xa0]*II|II(?:\.[\s\xa0]*(?:Regnorum|Sam(?:uelis)?)|[\s\xa0]*(?:Regnorum|Sam(?:uelis)?))|2(?:\.[\s\xa0]*(?:Regnorum|Sam(?:uelis)?)|[\s\xa0]*(?:Regnorum|Sam(?:uelis)?)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*I[\s\xa0]*Samuelis|Samuelis[\s\xa0]*I|I(?:\.[\s\xa0]*(?:Regnorum|Sam(?:uelis)?)|[\s\xa0]*(?:Regnorum|Sam(?:uelis)?))|1(?:\.[\s\xa0]*(?:Regnorum|Sam(?:uelis)?)|[\s\xa0]*(?:Regnorum|Sam(?:uelis)?)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*II[\s\xa0]*Regum|4(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|Regum[\s\xa0]*II|I(?:V(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|I(?:\.[\s\xa0]*Reg(?:um)?|[\s\xa0]*Reg(?:um)?))|2(?:\.[\s\xa0]*Reg(?:um)?|[\s\xa0]*Reg(?:um)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*I[\s\xa0]*Regum|3(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|Regum[\s\xa0]*I|I(?:II(?:\.[\s\xa0]*Regnorum|[\s\xa0]*Regnorum)|\.[\s\xa0]*Reg(?:um)?|[\s\xa0]*Reg(?:um)?)|1(?:\.[\s\xa0]*Reg(?:um)?|[\s\xa0]*Reg(?:um)?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*II[\s\xa0]*Paralipomenon|Paralipomenon[\s\xa0]*II|II(?:\.[\s\xa0]*Par(?:alipomenon)?|[\s\xa0]*Par(?:alipomenon)?)|2(?:\.[\s\xa0]*Par(?:alipomenon)?|[\s\xa0]*Par(?:alipomenon)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Liber[\s\xa0]*I[\s\xa0]*Paralipomenon|Paralipomenon[\s\xa0]*I|I(?:\.[\s\xa0]*Par(?:alipomenon)?|[\s\xa0]*Par(?:alipomenon)?)|1(?:\.[\s\xa0]*Par(?:alipomenon)?|[\s\xa0]*Par(?:alipomenon)?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Esdrae|E(?:zra|sd(?:r(?:ae?)?)?))
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
		(?:Esther[\s\xa0]*graeca|G(?:raeca[\s\xa0]*Esther|kEsth))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Esther|Est(?:h(?:er)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Iob|[IJ]ob)
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
		(?:Or(?:atio[\s\xa0]*Azariae|\.[\s\xa0]*Azar|[\s\xa0]*Azar)|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Proverbiorum|Pro(?:v(?:erbia)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*(?:Ecclesiastes|Qoelet)|Ec(?:cl(?:esiastes)?)?|Qo)
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
		(?:Song|Can(?:t(?:icum[\s\xa0]*Canticorum|\.[\s\xa0]*Cantic|[\s\xa0]*Cantic))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Ieremiae|Ier(?:emias)?|Jer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Ezechielis|Eze(?:chiel|k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Danielis|Dan(?:iel)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Osee|Hos|Os(?:ee)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Ioel|[IJ]oel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Amos|Amos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Abdiae|Obad|Abd(?:ias)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Ionae|Jonah|Ionas?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Michaeae|Mic(?:haeas)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Nahum|Nah(?:um)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Habacuc|Hab(?:acuc)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Sophoniae|Soph(?:onias)?|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Aggaei|Hag|Ag(?:gaeus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Zachariae|Z(?:ech|ac(?:harias)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prophetia[\s\xa0]*Malachiae|Mal(?:achias)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*secundum[\s\xa0]*Matthaeum|Matt(?:haeus)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*secundum[\s\xa0]*Marcum|M(?:ar(?:c(?:us)?|k)|c))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*secundum[\s\xa0]*Lucam|L(?:c|u(?:ke|c(?:as)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*I(?:[\s\xa0]*Ioannis|oannis[\s\xa0]*I)|1(?:\.[\s\xa0]*I(?:oannis|n)|John|[\s\xa0]*I(?:oannis|n))|I(?:oannis[\s\xa0]*I|\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*I(?:I[\s\xa0]*Ioannis|oannis[\s\xa0]*II)|I(?:oannis[\s\xa0]*II|I(?:\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n)))|2(?:\.[\s\xa0]*I(?:oannis|n)|John|[\s\xa0]*I(?:oannis|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*I(?:II[\s\xa0]*Ioannis|oannis[\s\xa0]*III)|I(?:oannis[\s\xa0]*III|II(?:\.[\s\xa0]*I(?:oannis|n)|[\s\xa0]*I(?:oannis|n)))|3(?:\.[\s\xa0]*I(?:oannis|n)|John|[\s\xa0]*I(?:oannis|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Evangelium[\s\xa0]*secundum[\s\xa0]*Ioannem|John|I(?:oan(?:nes)?|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Act(?:us(?:[\s\xa0]*Apostolorum)?|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Romanos|ad[\s\xa0]*Romanos|Rom(?:anos)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:II[\s\xa0]*ad[\s\xa0]*Corinthios|ad[\s\xa0]*Corinthios[\s\xa0]*II)|ad[\s\xa0]*Corinthios[\s\xa0]*II|Corinthios[\s\xa0]*II|II(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?)|2(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:I[\s\xa0]*ad[\s\xa0]*Corinthios|ad[\s\xa0]*Corinthios[\s\xa0]*I)|ad[\s\xa0]*Corinthios[\s\xa0]*I|Corinthios[\s\xa0]*I|I(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?)|1(?:\.[\s\xa0]*Cor(?:inthios)?|[\s\xa0]*Cor(?:inthios)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Galatas|ad[\s\xa0]*Galatas|Gal(?:atas)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ad[\s\xa0]*Ephesios|Ep(?:istula[\s\xa0]*ad[\s\xa0]*Ephesios|h(?:esios)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Philippenses|ad[\s\xa0]*Philippenses|Phil(?:ippenses)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Colossenses|ad[\s\xa0]*Colossenses|Col(?:ossenses)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:II[\s\xa0]*ad[\s\xa0]*Thessalonicenses|ad[\s\xa0]*Thessalonicenses[\s\xa0]*II)|ad[\s\xa0]*Thessalonicenses[\s\xa0]*II|Thessalonicenses[\s\xa0]*II|II(?:\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?|[\s\xa0]*Th(?:ess(?:alonicenses)?)?)|2(?:Thess|\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?|[\s\xa0]*Th(?:ess(?:alonicenses)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:I[\s\xa0]*ad[\s\xa0]*Thessalonicenses|ad[\s\xa0]*Thessalonicenses[\s\xa0]*I)|ad[\s\xa0]*Thessalonicenses[\s\xa0]*I|Thessalonicenses[\s\xa0]*I|1(?:Thess|\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?|[\s\xa0]*Th(?:ess(?:alonicenses)?)?)|I(?:\.[\s\xa0]*Th(?:ess(?:alonicenses)?)?|[\s\xa0]*Th(?:ess(?:alonicenses)?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:II[\s\xa0]*ad[\s\xa0]*Timotheum|ad[\s\xa0]*Timotheum[\s\xa0]*II)|II(?:\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m))|2(?:\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|Tim))|(?:ad[\s\xa0]*Timotheum[\s\xa0]*II|Timotheum[\s\xa0]*II)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:I[\s\xa0]*ad[\s\xa0]*Timotheum|ad[\s\xa0]*Timotheum[\s\xa0]*I)|1(?:\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|Tim)|I(?:\.[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)|[\s\xa0]*T(?:i(?:m(?:otheum)?)?|m)))|(?:ad[\s\xa0]*Timotheum[\s\xa0]*I|Timotheum[\s\xa0]*I)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Titum|ad[\s\xa0]*Titum|Tit(?:u[ms])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula(?:m[\s\xa0]*ad[\s\xa0]*Philemonem|[\s\xa0]*ad[\s\xa0]*Philemonem)|ad[\s\xa0]*Philemonem|Ph(?:ilemonem|lm|mn))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*ad[\s\xa0]*Hebraeos|ad[\s\xa0]*Hebraeos|Heb(?:r(?:aeos)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*Iacobi|Iacobi|Jas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:II[\s\xa0]*Petri|Petri[\s\xa0]*II)|Petri[\s\xa0]*II|II(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?)|2(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Epistula[\s\xa0]*(?:I[\s\xa0]*Petri|Petri[\s\xa0]*I)|Petri[\s\xa0]*I|I(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?)|1(?:\.[\s\xa0]*Pet(?:ri)?|[\s\xa0]*Pet(?:ri)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epistula[\s\xa0]*Iudae|Iudae|Jude)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*T(?:hobis|obiae)|T(?:ho|ob(?:ia[es])?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Liber[\s\xa0]*Iudith|I(?:udith|dt)|Jdt)
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
		(?:Historia[\s\xa0]*Susannae|Sus(?:annae?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		2Macc|(?:Liber[\s\xa0]*(?:II[\s\xa0]*Maccabaeorum|Maccabaeorum[\s\xa0]*II)|Machabaeorum[\s\xa0]*II|II(?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?)|2(?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		3Macc|(?:Liber[\s\xa0]*(?:III[\s\xa0]*Maccabaeorum|Maccabaeorum[\s\xa0]*III)|Machabaeorum[\s\xa0]*III|III(?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?)|3(?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		4Macc|(?:Liber[\s\xa0]*(?:IV[\s\xa0]*Maccabaeorum|Maccabaeorum[\s\xa0]*IV)|Machabaeorum[\s\xa0]*IV|IV(?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?)|4(?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		1Macc|(?:Liber[\s\xa0]*(?:I[\s\xa0]*Maccabaeorum|Maccabaeorum[\s\xa0]*I)|Machabaeorum[\s\xa0]*I|(?:[1I](?:\.[\s\xa0]*Mac(?:habaeorum|abaeorum)?|[\s\xa0]*Mac(?:habaeorum|abaeorum)?)))
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

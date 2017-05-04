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
				  | (?:titik|pamagat) (?! [a-z] )		#could be followed by a number
				  | kapitulo | talatang | pangkat | pang | kap | tal | at | k | -
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* (?:titik|pamagat)
	| \d \W* k (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:Unang|Una|1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:Ikalawang|2|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:Ikatlong|3|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|at|-)"
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
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Gen(?:esis)?|Henesis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ex(?:o(?:d(?:us|o)?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bel(?:[\s\xa0]*at[\s\xa0]*ang[\s\xa0]*Dragon)?|Si[\s\xa0]*Bel[\s\xa0]*at[\s\xa0]*ang[\s\xa0]*Dragon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Le(?:b(?:iti(?:kus|co))?|v(?:itico)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B(?:[ae]midbar|il)|Num|Blg|Mga[\s\xa0]*Bilang)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:c(?:clesiastic(?:us|o)|lesiastico)|k(?:kles[iy]|les[iy])astik(?:us|o))|Sir(?:a(?:c(?:id[ae]s|h)|k(?:id[ae]s|h))|\xE1(?:[ck]id[ae]s|[ck]h))|Sir(?:a(?:k(?:id[ae])?|cid[ae])|\xE1[ck]id[ae]|\xE1[ck])?|Karunungan[\s\xa0]*ng[\s\xa0]*Anak[\s\xa0]*ni[\s\xa0]*Sirac|Ang[\s\xa0]*Karunungan[\s\xa0]*ni[\s\xa0]*Jesus,?[\s\xa0]*Anak[\s\xa0]*ni[\s\xa0]*Sirac)|(?:Sirac)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Panaghoy)|(?:Mga[\s\xa0]*Lamentasyon|Panag|Lam|Mga[\s\xa0]*Panaghoy|Aklat[\s\xa0]*ng[\s\xa0]*Pa(?:nan|gt)aghoy)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Li(?:[\s\xa0]*ni|h)[\s\xa0]*|Ep)Jer|Liham[\s\xa0]*ni[\s\xa0]*Jeremias|Ang[\s\xa0]*Liham[\s\xa0]*ni[\s\xa0]*Jeremias)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pahayag[\s\xa0]*kay[\s\xa0]*Juan)|(?:Apo[ck](?:alipsis(?:[\s\xa0]*ni[\s\xa0]*Juan)?)?|Pahayag|Rev|Pah|Rebelasyon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dasal[\s\xa0]*ni[\s\xa0]*Manases|PrMan|Dalangin[\s\xa0]*ni[\s\xa0]*Manases|Panalangin[\s\xa0]*ni[\s\xa0]*Manases|Ang[\s\xa0]*Panalangin[\s\xa0]*ni[\s\xa0]*Manases)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:D(?:e(?:ut(?:eronom(?:i(?:y[ao]|[ao])?|y?a))?|yuteronomyo)|i?yuteronomyo|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jos(?:h(?:ua)?|u[e\xE9])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hukom)|(?:Mga[\s\xa0]*Hukom|Judg|Huk)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ruth?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Esdras)|(?:1(?:[\s\xa0]*?Esd|[\s\xa0]*Ezra)|I[\s\xa0]*E(?:sdras|zra)|[1I]\.[\s\xa0]*E(?:sdras|zra)|Una(?:ng[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Esdras)|(?:I(?:I(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|kalawang[\s\xa0]*E(?:sdras|zra))|2(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*?Esd|[\s\xa0]*Ezra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Is(?:a(?:[i\xED]a[hs]?)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Samuel|[\s\xa0]*?Sam|\.[\s\xa0]*Samuel)|I(?:kalawang|I\.?)[\s\xa0]*Samuel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Samuel|[\s\xa0]*?Sam)|I[\s\xa0]*Samuel|[1I]\.[\s\xa0]*Samuel|Una(?:ng)?[\s\xa0]*Samuel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Hari)|(?:I(?:I[\s\xa0]*(?:Mga[\s\xa0]*)?|V\.?[\s\xa0]*Mga[\s\xa0]*|I\.[\s\xa0]*(?:Mga[\s\xa0]*)?|ka(?:lawang[\s\xa0]*(?:Mga[\s\xa0]*)?|apat[\s\xa0]*Mga[\s\xa0]*))Hari|(?:[24]|4\.)[\s\xa0]*Mga[\s\xa0]*Hari|2(?:[\s\xa0]*Ha|Kgs)|2\.[\s\xa0]*(?:Mga[\s\xa0]*)?Hari)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Hari)|(?:(?:Unang|1\.|Una)[\s\xa0]*Hari|1(?:[\s\xa0]*Ha|Kgs)|(?:Unang|1\.|Una|1)[\s\xa0]*Mga[\s\xa0]*Hari|3[\s\xa0]*Mga[\s\xa0]*Hari|3\.[\s\xa0]*Mga[\s\xa0]*Hari|I(?:\.?[\s\xa0]*Mga|\.|II[\s\xa0]*Mga|II\.[\s\xa0]*Mga|katlong[\s\xa0]*Mga)?[\s\xa0]*Hari)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:I(?:\.[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno)|[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno))|kalawang[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno))|2(?:[\s\xa0]*Kronik(?:el|a)|Chr|[\s\xa0]*Chronicle|[\s\xa0]*Cronica|[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik)a|[\s\xa0]*Cron?|[\s\xa0]*Paralipomeno|\.[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Kronik(?:el|a)|Chr|[\s\xa0]*Chronicle|[\s\xa0]*Cronica|[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik)a|[\s\xa0]*Cron?|[\s\xa0]*Paralipomeno)|I[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno)|[1I]\.[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno)|Una(?:ng[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno)|[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Cronica|Mga[\s\xa0]*(?:Cronic|Kronik)a|Paralipomeno)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:sdras|zra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Neh(?:em[i\xED]a[hs])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:er[\s\xa0]*(?:\(Gr(?:iy?|y)?ego\)|Gr(?:iy?|y)?ego)|g)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:h(?:er)?|er)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Aw(?:it[\s\xa0]*ng[\s\xa0]*(?:Tatlong[\s\xa0]*(?:B(?:anal[\s\xa0]*na[\s\xa0]*Kabataan|inata)|Kabataan(?:g[\s\xa0]*Banal)?)|3[\s\xa0]*Kabataan)|[\s\xa0]*ng[\s\xa0]*3[\s\xa0]*Kab)|Tatlong[\s\xa0]*Kabataan|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ang[\s\xa0]*Awit[\s\xa0]*n(?:i[\s\xa0]*S[ao]lom[o\xF3]n|g[\s\xa0]*mga[\s\xa0]*Awit))|(?:A(?:w(?:it[\s\xa0]*n(?:i[\s\xa0]*S[ao]lom[o\xF3]n|g[\s\xa0]*mga[\s\xa0]*Awit)|[\s\xa0]*ni[\s\xa0]*S)|\.?[\s\xa0]*ng[\s\xa0]*A)|Kantik(?:ul)?o|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*(?:Salmo|Awit)|Awit|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Karunungan[\s\xa0]*ni[\s\xa0]*S[ao]lom[o\xF3]n)|(?:Karunungan|Kar|Wis|S[ao]lom[o\xF3]n|Ang[\s\xa0]*Karunungan[\s\xa0]*ni[\s\xa0]*S[ao]lom[o\xF3]n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:analangin[\s\xa0]*ni[\s\xa0]*Azarias|rAzar)|Ang[\s\xa0]*Panalangin[\s\xa0]*ni[\s\xa0]*Azarias)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kawikaan|Prov|Kaw|Mga[\s\xa0]*Kawikaan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mangangaral)|(?:E(?:c(?:l(?:es[iy]ast[e\xE9]|is[iy]aste)|clesiaste)|kl(?:es[iy]ast[e\xE9]|is[iy]aste))s|Kohelet|Manga|Ec(?:cl)?|Ang[\s\xa0]*Mangangaral)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jeremia[hs])|(?:H[ei]r[ei]m[iy]as|Jer|Sulat[\s\xa0]*ni[\s\xa0]*Jeremias|Aklat[\s\xa0]*ni[\s\xa0]*Jeremia[hs])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:ze(?:k[iy]el|k|quiel)?|sek[iy]el))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dan(?:iel)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Os(?:e(?:ia[hs]|a[hs])|ei?a)?|Hos(?:e(?:ias?|as?))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|Yole)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Am[o\xF3]s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Oba(?:d(?:ia[hs])?)?|Abd[i\xED]as)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jon(?:[a\xE1][hs]?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mi(?:k(?:a[hs]|a|ieas|ey?as)?|c(?:ah|a)?|queas))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Nah(?:[u\xFA]m)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab(?:a(?:kk?uk|cuc))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ze(?:p(?:h(?:ania[hs])?|anias)|f(?:anias)?)|S(?:(?:ofon[i\xED]|e[fp]ani)as|e[fp]ania))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag(?:g(?:ai|eo)|ai|eo)?|Ag(?:g?eo|ai))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Z(?:ac(?:ar[i\xED]as)?|ech(?:ariah)?)|Sacar[i\xED]as)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:a(?:qu[i\xED]as|kias|chi))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:a(?:buting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*)?Mateo|t(?:eo|t)?)|t)|Ebanghelyo[\s\xa0]*(?:ni[\s\xa0]*(?:San[\s\xa0]*)?|ayon[\s\xa0]*kay[\s\xa0]*)Mateo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:a(?:buting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Mar[ck]|Mar[ck])os|r(?:kos|k|cos)?)|c)|Ebanghelyo[\s\xa0]*(?:ni[\s\xa0]*(?:San[\s\xa0]*Mar[ck]|Mar[ck])|ayon[\s\xa0]*kay[\s\xa0]*Marc)os)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ebanghelyo[\s\xa0]*ni[\s\xa0]*San[\s\xa0]*Lu[ck]as|Lu(?:[ck]as|ke|c)?|Ebanghelyo[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Lu[ck]|Lu[ck])as|Mabuting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Lu[ck]|Lu[ck])as)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1(?:Joh|[\s\xa0]*J|[\s\xa0]*Jua)|I[\s\xa0]*Jua|[1I]\.[\s\xa0]*Jua|Una(?:ng)?[\s\xa0]*Jua)n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:2(?:Joh|[\s\xa0]*J|[\s\xa0]*Jua|\.[\s\xa0]*Jua)|I(?:kalawang|I\.?)[\s\xa0]*Jua)n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:3(?:Joh|[\s\xa0]*J|[\s\xa0]*Jua|\.[\s\xa0]*Jua)|I(?:katlong|II\.?)[\s\xa0]*Jua)n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Ebanghelyo[\s\xa0]*ni[\s\xa0]*San[\s\xa0]*Jua|J(?:oh|ua)?|Ebanghelyo[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*)?Jua|Mabuting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*)?Jua)n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:ga[\s\xa0]*Gawa(?:[\s\xa0]*ng[\s\xa0]*mga[\s\xa0]*A(?:postoles|lagad)|in|[\s\xa0]*ng[\s\xa0]*mga[\s\xa0]*Apostol)?|abuting[\s\xa0]*Balita[\s\xa0]*(?:ayon[\s\xa0]*sa|ng)[\s\xa0]*Espiritu[\s\xa0]*Santo)|(?:Gawa[\s\xa0]*ng[\s\xa0]*Apostole|Act)s|G(?:awa[\s\xa0]*ng[\s\xa0]*mga[\s\xa0]*Apostol|w)|Gawa|Ebanghelyo[\s\xa0]*ng[\s\xa0]*Espiritu[\s\xa0]*Santo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*?|[\s\xa0]*)|Taga\-?[\s\xa0]*)?Roma|Rom?|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Romano)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Corinti?o)|(?:I(?:ka(?:lawang[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*Corint|[CK]orinti?)|[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?|\-?[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?)|I(?:(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Corint|(?:\.[\s\xa0]*[CK]|[\s\xa0]*[CK])orinti?))o|2(?:(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Corinto|[\s\xa0]*?Cor|(?:\.[\s\xa0]*[CK]|[\s\xa0]*K)orinti?o)|SECOND[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Corinti?o)|(?:(?:Una[\s\xa0]*Mga[\s\xa0]*Taga\-?|1[\s\xa0]*Mga[\s\xa0]*Taga\-?|(?:Unang|1\.)[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Corinto|1[\s\xa0]*?Cor|(?:(?:Unang|1\.)[\s\xa0]*[CK]|Una[\s\xa0]*[CK]|1[\s\xa0]*K)orinti?o|(?:Unang|1\.|Una)[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o|I(?:(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Corint|(?:\.[\s\xa0]*[CK]|[\s\xa0]*[CK])orinti?|\.?[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?|ka(?:\-?[\s\xa0]*1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?|[\s\xa0]*1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?))o)|(?:1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Galacia)|(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*Galasya|Ga(?:lasyano|l)?|Mga[\s\xa0]*Taga\-?[\s\xa0]*Galacia|Mga[\s\xa0]*Taga\-?Galacia|Taga[\s\xa0]*Galacia|Taga\-?[\s\xa0]*Galacia|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*(?:taga[\s\xa0]*)?Galacia)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*Taga\-?Efeso|E(?:ph|f)|Mga[\s\xa0]*Taga\-?[\s\xa0]*E[fp]esi?o|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*E[fp]esi?o)|(?:(?:Taga(?:\-?[\s\xa0]*E[fp]esi?|[\s\xa0]*E[fp]esi?)|Mga[\s\xa0]*E[fp]esi?|E[fp]esi?)o)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filipos|Phil|Pilipos|Taga\-?[\s\xa0]*[FP]ilipos|Mga[\s\xa0]*Taga(?:\-?(?:[\s\xa0]*[FP]|F)|[\s\xa0]*[FP])ilipos|Mga[\s\xa0]*Pilipyano|Fil|Mga[\s\xa0]*Pilipense|Mga[\s\xa0]*Filipense|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*(?:Pilip(?:ense|yano)|Filipense))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Mga[\s\xa0]*Taga(?:\-?(?:[\s\xa0]*[CK]|C)|[\s\xa0]*[CK])|Taga\-?[\s\xa0]*C|K|C)olosas|Col?|Mga[\s\xa0]*[CK]olon?sense|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*[CK]olon?sense)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2(?:[\s\xa0]*Tesalonika|Thess))|(?:I(?:I(?:\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka))|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka)))|kalawang[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka)))|2(?:[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|T(?:esalonica|hes|esalonicense|esalonisense|es))|\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Tesalonika|Thess))|(?:1[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|T(?:esalonica|hes|esalonicense|esalonisense|es))|I[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka))|[1I]\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka))|Una(?:ng[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka))|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])a|esaloni[cs]ense)|Tesaloni(?:c(?:ense|a)|sense|ka))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:I(?:\.[\s\xa0]*(?:Kay[\s\xa0]*)?|[\s\xa0]*(?:Kay[\s\xa0]*)?)|kalawang[\s\xa0]*(?:Kay[\s\xa0]*)?)Timoteo|2(?:[\s\xa0]*Timoteo|[\s\xa0]*?Tim|[\s\xa0]*Kay[\s\xa0]*Timoteo|\.[\s\xa0]*(?:Kay[\s\xa0]*)?Timoteo))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Timoteo|[\s\xa0]*?Tim|[\s\xa0]*Kay[\s\xa0]*Timoteo)|I[\s\xa0]*(?:Kay[\s\xa0]*)?Timoteo|[1I]\.[\s\xa0]*(?:Kay[\s\xa0]*)?Timoteo|Una(?:ng[\s\xa0]*(?:Kay[\s\xa0]*)?|[\s\xa0]*(?:Kay[\s\xa0]*)?)Timoteo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tit(?:us|o)?|Kay[\s\xa0]*Tito)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filemon)|(?:(?:F(?:ile|l)|Phl)m|Kay[\s\xa0]*Filemon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*(?:He|E)breo|Heb(?:reo)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:San(?:t(?:iago)?)?|Ja(?:cobo|s))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2[\s\xa0]*Pedro)|(?:I(?:kalawang|I\.?)[\s\xa0]*Pedro|2(?:[\s\xa0]*Ped|Pet|\.[\s\xa0]*Pedro))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1[\s\xa0]*Pedro)|(?:1(?:[\s\xa0]*Ped|Pet)|I[\s\xa0]*Pedro|[1I]\.[\s\xa0]*Pedro|Una(?:ng)?[\s\xa0]*Pedro)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judas)|(?:Ju(?:de|d)?|Hudas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:ob(?:i(?:as|t)|\xEDas)?|b))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:udith?|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bar(?:u[ck]h?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:u(?:sana|s)?|i[\s\xa0]*Susana))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:I(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|kalawang[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|2(?:[\s\xa0]*Macabeos|[\s\xa0]*Mcb|Macc|[\s\xa0]*Macabeo|[\s\xa0]*Mga[\s\xa0]*Macabeo|\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:II(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|katlong[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|3(?:[\s\xa0]*Macabeos|[\s\xa0]*Mcb|Macc|[\s\xa0]*Macabeo|[\s\xa0]*Mga[\s\xa0]*Macabeo|\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:V(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|kaapat[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|4(?:[\s\xa0]*Macabeos|[\s\xa0]*Mcb|Macc|[\s\xa0]*Macabeo|[\s\xa0]*Mga[\s\xa0]*Macabeo|\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1(?:[\s\xa0]*Macabeos|[\s\xa0]*Mcb|Macc|[\s\xa0]*Macabeo|[\s\xa0]*Mga[\s\xa0]*Macabeo)|I[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[1I]\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|Una(?:ng[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek", "Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ez)
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

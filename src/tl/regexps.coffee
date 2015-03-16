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
				  | talatang | chapter | at | k | -
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* title
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
		(?:Henesis|Gen(?:esis)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Exo(?:d(?:us|o)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Si[\s\xa0]*Bel[\s\xa0]*at[\s\xa0]*ang[\s\xa0]*Dragon|Bel(?:[\s\xa0]*at[\s\xa0]*ang[\s\xa0]*Dragon)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Le(?:b(?:iti(?:kus|co))?|v(?:itico)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*Bilang|B(?:[ae]midbar|il)|Num)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sirá[ck]id(?:[ae]s?)|(?:Ang[\s\xa0]*Karunungan[\s\xa0]*ni[\s\xa0]*Jesus(?:,[\s\xa0]*Anak[\s\xa0]*ni[\s\xa0]*Sirac|[\s\xa0]*Anak[\s\xa0]*ni[\s\xa0]*Sirac)|Karunungan[\s\xa0]*ng[\s\xa0]*Anak[\s\xa0]*ni[\s\xa0]*Sirac|E(?:c(?:clesiastic(?:us|o)|lesiastico)|k(?:kles(?:[iy]astik(?:us|o))|les(?:[iy]astik(?:us|o))))|Sir(?:a(?:c(?:id[ae]s?|h)|k(?:id[ae]s?|h)?)|á[ck]h?)?)|Sirac
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Aklat[\s\xa0]*ng[\s\xa0]*Pa(?:nanaghoy|gtaghoy)|Mga[\s\xa0]*(?:Lamentasyon|Panaghoy)|Panag(?:hoy)?|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ang[\s\xa0]*Liham[\s\xa0]*ni[\s\xa0]*Jeremias|Lih(?:am[\s\xa0]*ni[\s\xa0]*Jeremias|[\s\xa0]*Jer)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Apo(?:[ck]alipsis(?:[\s\xa0]*ni[\s\xa0]*Juan)?)|Pah(?:ayag(?:[\s\xa0]*kay[\s\xa0]*Juan)?)?|Re(?:belasyon|v))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ang[\s\xa0]*Panalangin[\s\xa0]*ni[\s\xa0]*Manases|Da(?:langin[\s\xa0]*ni[\s\xa0]*Manases|sal[\s\xa0]*ni[\s\xa0]*Manases)|P(?:analangin[\s\xa0]*ni[\s\xa0]*Manases|rMan))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		D(?:iyuteronomyo|yuteronomyo|e(?:yuteronomyo|ut(?:eronom(?:ya|a|i(?:y[ao]|[ao])?))?)|t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jos(?:u[eé]|h(?:ua)?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*Hukom|Judg|Huk(?:om)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ruth?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|I(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra))|1(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:zra|sd(?:ras)?)|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*E(?:sdras|zra)|I(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:sdras|zra)))|2(?:\.[\s\xa0]*E(?:sdras|zra)|[\s\xa0]*E(?:zra|sd(?:ras)?)|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Isa(?:[ií]a[hs]?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*Samuel|I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|2(?:\.[\s\xa0]*Samuel|[\s\xa0]*Sam(?:uel)?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*Samuel|[\s\xa0]*Samuel)|I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|1(?:\.[\s\xa0]*Samuel|[\s\xa0]*Sam(?:uel)?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:4(?:\.[\s\xa0]*Mga[\s\xa0]*Hari|[\s\xa0]*Mga[\s\xa0]*Hari)|I(?:ka(?:apat[\s\xa0]*Mga[\s\xa0]*Hari|lawang[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari))|V(?:\.[\s\xa0]*Mga[\s\xa0]*Hari|[\s\xa0]*Mga[\s\xa0]*Hari)|I(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari)|[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari)))|2(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari)|[\s\xa0]*(?:Mga[\s\xa0]*Hari|Ha(?:ri)?)|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3(?:\.[\s\xa0]*Mga[\s\xa0]*Hari|[\s\xa0]*Mga[\s\xa0]*Hari)|Una(?:ng[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari)|[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari))|I(?:katlong[\s\xa0]*Mga[\s\xa0]*Hari|II(?:\.[\s\xa0]*Mga[\s\xa0]*Hari|[\s\xa0]*Mga[\s\xa0]*Hari)|\.[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari)|[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari))|1(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Hari|Hari)|[\s\xa0]*(?:Mga[\s\xa0]*Hari|Ha(?:ri)?)|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))|I(?:\.[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))|[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))))|2(?:\.[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))|[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|Kronik(?:el|a)|C(?:hronicle|ro(?:nica)?))|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))|[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a)))|I(?:\.[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))|[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a)))|1(?:\.[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|C(?:hronicle|ronica)|Kronik(?:el|a))|[\s\xa0]*(?:Paralipomeno|Mga[\s\xa0]*(?:Cronica|Kronika)|Kronik(?:el|a)|C(?:hronicle|ro(?:nica)?))|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:sdras|z(?:ra)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:em[ií]a[hs])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:GkEsth|Est(?:er[\s\xa0]*(?:\(Gr(?:i(?:yego\)|ego\))|yego\)|ego\))|Gr(?:i(?:yego|ego)|yego|ego))|g))
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
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tatlong[\s\xa0]*Kabataan|Aw(?:it[\s\xa0]*ng[\s\xa0]*(?:Tatlong[\s\xa0]*(?:Kabataan(?:g[\s\xa0]*Banal)?|B(?:anal[\s\xa0]*na[\s\xa0]*Kabataan|inata))|3[\s\xa0]*Kabataan)|[\s\xa0]*ng[\s\xa0]*3[\s\xa0]*Kab)|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:A(?:ng[\s\xa0]*Awit[\s\xa0]*n(?:g[\s\xa0]*mga[\s\xa0]*Awit|i[\s\xa0]*S[ao]lom(?:[oó]n))|w(?:it[\s\xa0]*n(?:g[\s\xa0]*mga[\s\xa0]*Awit|i[\s\xa0]*S[ao]lom(?:[oó]n))|[\s\xa0]*ni[\s\xa0]*S))|Kantik(?:ulo|o)|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*(?:Salmo|Awit)|Awit|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ang[\s\xa0]*Karunungan[\s\xa0]*ni[\s\xa0]*S[ao]lom(?:[oó]n)|S[ao]lom(?:[oó]n)|Kar(?:unungan(?:[\s\xa0]*ni[\s\xa0]*S[ao]lom(?:[oó]n))?)?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ang[\s\xa0]*Panalangin[\s\xa0]*ni[\s\xa0]*Azarias|P(?:analangin[\s\xa0]*ni[\s\xa0]*Azarias|rAzar))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*Kawikaan|Prov|Kaw(?:ikaan)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ang[\s\xa0]*Mangangaral|Kohelet|Manga(?:ngaral)?|E(?:kl(?:es[iy]ast(?:[eé]s)|is[iy]astes)|c(?:l(?:es[iy]ast(?:[eé]s)|is[iy]astes)|cl(?:esiastes)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Aklat[\s\xa0]*ni[\s\xa0]*Jeremia[hs]|Sulat[\s\xa0]*ni[\s\xa0]*Jeremias|H[ei]r(?:[ei]m(?:[iy]as))|Jer(?:emia[hs])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:sek[iy]el|ze(?:quiel|k(?:[iy]el)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Dan(?:iel)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ose(?:ia[hs]?|a[hs]?)|Hos(?:e(?:ias?|as?))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|Yole)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Am(?:[oó]s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Abd[ií]as|Oba(?:d(?:ia[hs])?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jon(?:[aá][hs]?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mi(?:queas|c(?:ah?)?|k(?:ieas|e(?:yas|as)|a[hs]?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Nah(?:[uú]m)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:a(?:cuc|k(?:kuk|uk)))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:ofon[ií]as|e[fp]anias?)|Ze(?:p(?:anias|h(?:ania[hs])?)|f(?:anias)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ag(?:geo|ai|eo)|Hag(?:g(?:ai|eo)|ai|eo)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sacar[ií]as|Z(?:ech(?:ariah)?|ac(?:ar[ií]as)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:a(?:qu[ií]as|kias|chi))?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ebanghelyo[\s\xa0]*(?:ayon[\s\xa0]*kay[\s\xa0]*Mateo|ni[\s\xa0]*(?:San[\s\xa0]*Mateo|Mateo))|M(?:a(?:buting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Mateo|Mateo)|t(?:eo|t))|t))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ebanghelyo[\s\xa0]*(?:ayon[\s\xa0]*kay[\s\xa0]*Marcos|ni[\s\xa0]*(?:San[\s\xa0]*Mar[ck]os|Mar[ck]os))|M(?:a(?:buting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Mar[ck]os|Mar[ck]os)|r(?:cos|k(?:os)?))|c))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mabuting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Lu[ck]as|Lu[ck]as)|Ebanghelyo[\s\xa0]*(?:ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Lu[ck]as|Lu[ck]as)|ni[\s\xa0]*San[\s\xa0]*Lu[ck]as)|Lu(?:cas|k(?:as|e))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*Juan|[\s\xa0]*Juan)|I(?:\.[\s\xa0]*Juan|[\s\xa0]*Juan)|1(?:\.[\s\xa0]*Juan|John|[\s\xa0]*J(?:uan|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*Juan|I(?:\.[\s\xa0]*Juan|[\s\xa0]*Juan))|2(?:\.[\s\xa0]*Juan|John|[\s\xa0]*J(?:uan|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:katlong[\s\xa0]*Juan|II(?:\.[\s\xa0]*Juan|[\s\xa0]*Juan))|3(?:\.[\s\xa0]*Juan|John|[\s\xa0]*J(?:uan|n)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mabuting[\s\xa0]*Balita[\s\xa0]*ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Juan|Juan)|Ebanghelyo[\s\xa0]*(?:ayon[\s\xa0]*kay[\s\xa0]*(?:San[\s\xa0]*Juan|Juan)|ni[\s\xa0]*San[\s\xa0]*Juan)|J(?:ohn|uan|n))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ebanghelyo[\s\xa0]*ng[\s\xa0]*Espiritu[\s\xa0]*Santo|M(?:abuting[\s\xa0]*Balita[\s\xa0]*(?:ayon[\s\xa0]*sa[\s\xa0]*Espiritu[\s\xa0]*Santo|ng[\s\xa0]*Espiritu[\s\xa0]*Santo)|ga[\s\xa0]*Gawa(?:[\s\xa0]*ng[\s\xa0]*mga[\s\xa0]*A(?:postol(?:es)?|lagad)|in)?)|Acts|G(?:awa(?:[\s\xa0]*ng[\s\xa0]*(?:mga[\s\xa0]*Apostol|Apostoles))?|w))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Romano|Mga[\s\xa0]*Taga(?:[\s\xa0]*Roma|-?(?:[\s\xa0]*Roma|Roma))|Taga(?:-?[\s\xa0]*Roma|[\s\xa0]*Roma)|Ro(?:ma?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:SECOND[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|I(?:ka(?:-?[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|lawang[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o))))|I(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o)))|[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o)))))|2(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o)))|[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|Korint(?:io|o)|Cor(?:int(?:io|o))?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o)))|[\s\xa0]*(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o))))|I(?:ka(?:-?[\s\xa0]*1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|[\s\xa0]*1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o))|\.[\s\xa0]*(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o)))|[\s\xa0]*(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o))))|1(?:\.[\s\xa0]*(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)|Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|(?:[CK]orint(?:io|o)))|[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:-?[\s\xa0]*Corinto|[\s\xa0]*Corinto)|Korint(?:io|o)|Cor(?:int(?:io|o))?)|Cor))|1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corint(?:io|o)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*(?:taga[\s\xa0]*Galacia|Galacia)|Mga[\s\xa0]*Taga(?:[\s\xa0]*Gala(?:cia|sya)|-?(?:[\s\xa0]*Gala(?:cia|sya)|Galacia))|Taga(?:-?[\s\xa0]*Galacia|[\s\xa0]*Galacia)|Ga(?:l(?:asyano)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*E(?:[fp]es(?:io|o))|Mga[\s\xa0]*Taga(?:[\s\xa0]*E(?:[fp]es(?:io|o))|-?(?:[\s\xa0]*E(?:[fp]es(?:io|o))|Efeso))|E(?:ph|f))|(?:Taga(?:-?[\s\xa0]*E(?:[pf]es(?:io|o))|[\s\xa0]*E(?:[fp]es(?:io|o)))|Mga[\s\xa0]*E(?:[pf]es(?:io|o)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*(?:Filipense|Pilip(?:ense|yano))|Mga[\s\xa0]*(?:Taga(?:[\s\xa0]*[FP]ilipos|-?(?:[\s\xa0]*[FP]ilipos|Filipos))|Filipense|Pilip(?:ense|yano))|Taga(?:-?[\s\xa0]*[FP]ilipos|[\s\xa0]*[FP]ilipos)|Phil|Fil)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*(?:[CK]olo(?:nsense|sense))|Mga[\s\xa0]*(?:Taga(?:[\s\xa0]*[CK]olosas|-?(?:[\s\xa0]*[CK]olosas|Colosas))|(?:[CK]olo(?:nsense|sense)))|Taga(?:-?[\s\xa0]*Colosas|[\s\xa0]*Colosas)|Col?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))|I(?:\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))))|2(?:\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))|Thess|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|T(?:hes|es(?:aloni(?:sense|c(?:ense|a)|ka))?))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka)))|I(?:\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka)))|1(?:\.[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|Tesaloni(?:sense|c(?:ense|a)|ka))|Thess|[\s\xa0]*(?:Mga[\s\xa0]*T(?:aga(?:-?[\s\xa0]*Tesaloni[ck]a|[\s\xa0]*Tesaloni[ck]a)|esaloni[cs]ense)|T(?:hes|es(?:aloni(?:sense|c(?:ense|a)|ka))?))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)|I(?:\.[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)|[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)))|2(?:\.[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)|[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Tim(?:oteo)?)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)|[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo))|I(?:\.[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)|[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo))|1(?:\.[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Timoteo)|[\s\xa0]*(?:Kay[\s\xa0]*Timoteo|Tim(?:oteo)?)|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kay[\s\xa0]*Tito|Tit(?:us|o))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kay[\s\xa0]*Filemon|Filem(?:on)?|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mga[\s\xa0]*(?:Hebreo|Ebreo)|Heb(?:reo)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ja(?:cobo|s)|San(?:tiago)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*Pedro|I(?:\.[\s\xa0]*Pedro|[\s\xa0]*Pedro))|2(?:\.[\s\xa0]*Pedro|[\s\xa0]*Ped(?:ro)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*Pedro|[\s\xa0]*Pedro)|I(?:\.[\s\xa0]*Pedro|[\s\xa0]*Pedro)|1(?:\.[\s\xa0]*Pedro|[\s\xa0]*Ped(?:ro)?|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hudas|Ju(?:d(?:as|e))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:ob(?:ías|i(?:as|t))?|b)
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
		Bar(?:u[ck]h?)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		S(?:i[\s\xa0]*Susana|u(?:s(?:ana)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kalawang[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|I(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))|2(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?|cb)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:katlong[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|II(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))|3(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?|cb)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:I(?:kaapat[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|V(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)))|4(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?|cb)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Una(?:ng[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|I(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?))|1(?:\.[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?)|[\s\xa0]*M(?:ga[\s\xa0]*Macabeo|acabeos?|cb)|Macc))
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

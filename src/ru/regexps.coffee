bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | надписаниях (?! [a-z] )		#could be followed by a number
				  | и#{bcv_parser::regexps.space}+далее | главы | стихи | глав | стих | гл | — | и
				  | [аб] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* надписаниях
	| \d \W* и#{bcv_parser::regexps.space}+далее (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [аб] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ]"

bcv_parser::regexps.first = "(?:1-?я|1-?е|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2-?я|2-?е|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3-?я|3-?е|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|и|—)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|—)"
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
		(?:Бытие|Gen|Начало|Быт|Нач|Книга[\s\xa0]*Бытия)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Исход)|(?:Книга[\s\xa0]*Исход|Exod|Исх)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Бел(?:[\s\xa0]*и[\s\xa0]*Дракон|е)|Bel|Бел|Виле[\s\xa0]*и[\s\xa0]*драконе)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Левит)|(?:Книга[\s\xa0]*Левит|Lev|Лев)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Числа|Num|Чис|Книга[\s\xa0]*Чисел)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Сирахова)|(?:Премудрост(?:и[\s\xa0]*Иисуса,[\s\xa0]*сына[\s\xa0]*Сирахов|ь[\s\xa0]*Сирах)а|Ekkleziastik|Sir|Сир)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Прем(?:удрости[\s\xa0]*Соломона)?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Плач(?:[\s\xa0]*Иеремии)?|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Послание[\s\xa0]*Иеремии|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Отк(?:р(?:овение)?)?|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Молитва[\s\xa0]*Манассии|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Втор(?:озаконие)?|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Иешуа)|(?:И(?:исус[\s\xa0]*Навин|еш)|Навин|Josh|Нав|Иисуса[\s\xa0]*Навина|Книга[\s\xa0]*Иисуса[\s\xa0]*Навина)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*Суде[ий](?:[\s\xa0]*Израилевых)?|Суд(?:е[ий]|ьи)|Judg|Суд)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ру(?:фь|т)|Ruth|Руф|Книга[\s\xa0]*Руфи)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2(?:[\s\xa0]*Езд(?:ры)?|\.[\s\xa0]*Ездры|[ея]\.?[\s\xa0]*Ездры|\-?[ея]\.?[\s\xa0]*Ездры)|1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:3(?:[\s\xa0]*Езд(?:ры)?|\.[\s\xa0]*Ездры|[ея]\.?[\s\xa0]*Ездры|\-?[ея]\.?[\s\xa0]*Ездры)|2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Исаи[ия]|Isa|Ис(?:аи)?|Книга[\s\xa0]*пророка[\s\xa0]*Исаии)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2[\s\xa0]*Царств)|(?:2(?:[ея](?:\.[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств)|[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств))|\.[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств)|[\s\xa0]*Самуила|[\s\xa0]*Цар|Sam|[\s\xa0]*Книга[\s\xa0]*Царств|\-?[ея](?:\.[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств)|[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1[\s\xa0]*Царств)|(?:1(?:[ея](?:\.[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств)|[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств))|\.[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств)|[\s\xa0]*Самуила|[\s\xa0]*Цар|Sam|[\s\xa0]*Книга[\s\xa0]*Царств|\-?[ея](?:\.[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств)|[\s\xa0]*(?:Самуила|Царств|Книга[\s\xa0]*Царств))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:4(?:[\s\xa0]*(?:Книга[\s\xa0]*Царств|Цар(?:ств)?)|\.[\s\xa0]*(?:Книга[\s\xa0]*)?Царств|[ея](?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)Царств|\-?[ея](?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)Царств)|2(?:[ея](?:\.[\s\xa0]*Царе[ий]|[\s\xa0]*Царе[ий])|[\s\xa0]*Царе[ий]|Kgs|\.[\s\xa0]*Царе[ий]|\-?[ея](?:\.[\s\xa0]*Царе[ий]|[\s\xa0]*Царе[ий])))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:3(?:[\s\xa0]*(?:Книга[\s\xa0]*Царств|Цар(?:ств)?)|\.[\s\xa0]*(?:Книга[\s\xa0]*)?Царств|[ея](?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)Царств|\-?[ея](?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)Царств)|1(?:[ея](?:\.[\s\xa0]*Царе[ий]|[\s\xa0]*Царе[ий])|[\s\xa0]*Царе[ий]|Kgs|\.[\s\xa0]*Царе[ий]|\-?[ея](?:\.[\s\xa0]*Царе[ий]|[\s\xa0]*Царе[ий])))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2[\s\xa0]*Паралипоменон)|(?:2(?:[ея](?:\.[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон)|[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон))|\.[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон)|[\s\xa0]*Пар|Chr|[\s\xa0]*Хроник|[\s\xa0]*Летопись|[\s\xa0]*Лет|[\s\xa0]*Книга[\s\xa0]*Паралипоменон|\-?[ея](?:\.[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон)|[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1[\s\xa0]*Паралипоменон)|(?:1(?:[ея](?:\.[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон)|[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон))|\.[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон)|[\s\xa0]*Пар|Chr|[\s\xa0]*Хроник|[\s\xa0]*Летопись|[\s\xa0]*Лет|[\s\xa0]*Книга[\s\xa0]*Паралипоменон|\-?[ея](?:\.[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон)|[\s\xa0]*(?:Летопись|Хроник|Паралипоменон|Книга[\s\xa0]*Паралипоменон))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:Уза[ий]р|Ezra|Ездр[аы]|1[\s\xa0]*Езд|Езд|Книга[\s\xa0]*Ездры|Первая[\s\xa0]*Ездры)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Нееми[ия]|Neh|Неем|Книга[\s\xa0]*Неемии)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Дополнения[\s\xa0]*к[\s\xa0]*Есфири|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Есфирь|Esth|Есф|Книга[\s\xa0]*Есфири)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Job|Аюб|Иова|Иов|Книга[\s\xa0]*Иова)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Пс(?:ал(?:мы|ом|тирь)?)?|Забур|Ps|Заб)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Молитва[\s\xa0]*Азария|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Мудрые[\s\xa0]*изречения|Притчи|Prov|Пр(?:ит)?|Мудр|Книга[\s\xa0]*притче[ий][\s\xa0]*Соломоновых)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Екклесиаст|Eccl|Размышления|Разм|Екк|Книга[\s\xa0]*Екклесиаста)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Молитва[\s\xa0]*святых[\s\xa0]*тре|Песнь[\s\xa0]*тр[её])х[\s\xa0]*отроков|SgThree|Благодарственная[\s\xa0]*песнь[\s\xa0]*отроков)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Песн(?:ь(?:[\s\xa0]*(?:Сул(?:а[ий]мо|е[ий]ма)|песне[ий][\s\xa0]*Соломо)на)?|и[\s\xa0]*Песне[ий])?|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Иеремии|Иереми[ия]|Jer|Иер)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Езекиил|Ezek|Иезекиил[ья]|Езек|Иез|Книга[\s\xa0]*пророка[\s\xa0]*Иезекииля)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Д(?:ани(?:ила|ял)|они[её]л)|Dan|Д(?:ан(?:иил)?|он)|Книга[\s\xa0]*пророка[\s\xa0]*Даниила)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Осии|Оси[ия]|Hos|Ос)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Иоиля|Иоил[ья]|Joel|Иоил)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Амоса|Amos|Ам(?:ос)?|Книга[\s\xa0]*пророка[\s\xa0]*Амоса)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Авдия|Авди[ийя]|Obad|Авд)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ион[аы]|Юнус|Jonah|Книга[\s\xa0]*пророка[\s\xa0]*Ионы)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Михея|Михе[ийя]|Mic|Мих)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Наума|Наума|Nah|Наум)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Аввакума)|(?:Книга[\s\xa0]*пророка[\s\xa0]*Аввакума|Аввакум|Hab|Авв)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Софонии|Софони[ия]|Zeph|Соф)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Аггея|Агге[ийя]|Hag|Агг)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:За(?:хари[ия]|кария)|Zech|За[кх]|Книга[\s\xa0]*пророка[\s\xa0]*Захарии)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Книга[\s\xa0]*пророка[\s\xa0]*Малахии|Малахи[ия]|Mal|Мал)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Матфея)|(?:М(?:ат(?:а[ий]|то)|[тф])|Matt|Мат|От[\s\xa0]*Матфея|Евангелие[\s\xa0]*от[\s\xa0]*Матфея)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:М(?:[кр]|арка)|Mark|Марк|От[\s\xa0]*Марка|Евангелие[\s\xa0]*от[\s\xa0]*Марка)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Л(?:ук[аио]|к)|Luke|От[\s\xa0]*Луки|Евангелие[\s\xa0]*от[\s\xa0]*Луки)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1(?:John|[\s\xa0]*Ин|[\s\xa0]*Иохана|[\s\xa0]*Иоанна|[\s\xa0]*послание[\s\xa0]*Иоанна|\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))на|[ея](?:\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))|[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха)))на|\-?[ея](?:\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))|[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха)))на))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2(?:John|[\s\xa0]*Ин|[\s\xa0]*Иохана|[\s\xa0]*Иоанна|[\s\xa0]*послание[\s\xa0]*Иоанна|\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))на|[ея](?:\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))|[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха)))на|\-?[ея](?:\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))|[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха)))на))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:3(?:John|[\s\xa0]*Ин|[\s\xa0]*Иохана|[\s\xa0]*Иоанна|[\s\xa0]*послание[\s\xa0]*Иоанна|\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))на|[ея](?:\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))|[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха)))на|\-?[ея](?:\.[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха))|[\s\xa0]*(?:послание[\s\xa0]*Иоан|Ио(?:ан|ха)))на))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:И(?:оха)?н|John|Иоанна|От[\s\xa0]*Иоанна|Евангелие[\s\xa0]*от[\s\xa0]*Иоанна)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Деян(?:ия)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Римлянам|Rom|Рим|К[\s\xa0]*Римлянам|Послание[\s\xa0]*к[\s\xa0]*Римлянам)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2(?:[\s\xa0]*Коринфянам|[\s\xa0]*Кор|Cor|[\s\xa0]*к[\s\xa0]*Коринфянам|\.[\s\xa0]*(?:к[\s\xa0]*)?Коринфянам|[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*)?|[\s\xa0]*(?:к[\s\xa0]*)?)Коринфянам|\-?[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*)?|[\s\xa0]*(?:к[\s\xa0]*)?)Коринфянам))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1(?:[\s\xa0]*Коринфянам|[\s\xa0]*Кор|Cor|[\s\xa0]*к[\s\xa0]*Коринфянам|\.[\s\xa0]*(?:к[\s\xa0]*)?Коринфянам|[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*)?|[\s\xa0]*(?:к[\s\xa0]*)?)Коринфянам|\-?[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*)?|[\s\xa0]*(?:к[\s\xa0]*)?)Коринфянам))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Галатам)|(?:Послание[\s\xa0]*к[\s\xa0]*Галатам|К[\s\xa0]*Галатам|Gal|Гал)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ЕЭ]фесянам|[ЕЭ]ф|Eph|К[\s\xa0]*Ефесянам|Послание[\s\xa0]*к[\s\xa0]*Ефесянам)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Филиппи[ий]цам|Phil|Флп|Фил|К[\s\xa0]*Филиппи[ий]цам|Послание[\s\xa0]*к[\s\xa0]*Филиппи[ий]цам)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Колоссянам|Col|Кол|К[\s\xa0]*Колоссянам|Послание[\s\xa0]*к[\s\xa0]*Колоссянам)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2(?:[\s\xa0]*Фессалоники[ий]цам|Thess|[\s\xa0]*Фес|[\s\xa0]*к[\s\xa0]*Фессалоники[ий]цам|\.[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий])цам|[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий])|[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий]))цам|\-?[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий])|[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий]))цам))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1(?:[\s\xa0]*Фессалоники[ий]цам|Thess|[\s\xa0]*Фес|[\s\xa0]*к[\s\xa0]*Фессалоники[ий]цам|\.[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий])цам|[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий])|[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий]))цам|\-?[ея](?:\.[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий])|[\s\xa0]*(?:к[\s\xa0]*Фессалоники[ий]|Фессалоники[ий]))цам))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2[\s\xa0]*Тимофею)|(?:2(?:[ея](?:\.[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф)|[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф))ею|[\s\xa0]*Тиметею|[\s\xa0]*Тим|Tim|[\s\xa0]*к[\s\xa0]*Тимофею|\.[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф)ею|\-?[ея](?:\.[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф)|[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф))ею))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1[\s\xa0]*Тимофею)|(?:1(?:[ея](?:\.[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф)|[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф))ею|[\s\xa0]*Тиметею|[\s\xa0]*Тим|Tim|[\s\xa0]*к[\s\xa0]*Тимофею|\.[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф)ею|\-?[ея](?:\.[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф)|[\s\xa0]*(?:Тим(?:ет|оф)|к[\s\xa0]*Тимоф))ею))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Titus|Титу|Тит|К[\s\xa0]*Титу|Послание[\s\xa0]*к[\s\xa0]*Титу)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phlm|Флм|Филимону|К[\s\xa0]*Филимону|Послание[\s\xa0]*к[\s\xa0]*Филимону)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Евреям)|(?:Послание[\s\xa0]*к[\s\xa0]*Евреям|К[\s\xa0]*Евреям|Heb|Евр)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Иакова)|(?:Послание[\s\xa0]*Иакова|Jas|Иак|Якуб)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2[\s\xa0]*Пет(?:рус|ир)а)|(?:2[\s\xa0]*Петра)|(?:2(?:[ея](?:\.[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр)|[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр))а|\.[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр)а|[\s\xa0]*послание[\s\xa0]*Петра|[\s\xa0]*Пет|Pet|\-?[ея](?:\.[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр)|[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр))а))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1[\s\xa0]*Пет(?:рус|ир)а)|(?:1[\s\xa0]*Петра)|(?:1(?:[ея](?:\.[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр)|[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр))а|\.[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр)а|[\s\xa0]*послание[\s\xa0]*Петра|[\s\xa0]*Пет|Pet|\-?[ея](?:\.[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр)|[\s\xa0]*(?:Пет(?:р(?:ус)?|ир)|послание[\s\xa0]*Петр))а))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Иуд[аы]|Jude|Иуд|Послание[\s\xa0]*Иуды)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Тов(?:ита)?|Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Юди(?:фь)?|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Варуха)|(?:Книга[\s\xa0]*(?:пророка[\s\xa0]*Вару́|Вару)ха|Bar|Вар|Бару́ха)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:С(?:казанию[\s\xa0]*о[\s\xa0]*Сусанне[\s\xa0]*и[\s\xa0]*Данииле|усанна(?:[\s\xa0]*и[\s\xa0]*старцы)?)|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:2(?:[\s\xa0]*Маккавеев|Macc|\.[\s\xa0]*Маккавеев|[ея]\.?[\s\xa0]*Маккавеев|\-?[ея]\.?[\s\xa0]*Маккавеев|[\s\xa0]*Макк)|Вторая[\s\xa0]*книга[\s\xa0]*Маккаве[ий]ская)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:3(?:[\s\xa0]*Маккавеев|Macc|\.[\s\xa0]*Маккавеев|[ея]\.?[\s\xa0]*Маккавеев|\-?[ея]\.?[\s\xa0]*Маккавеев|[\s\xa0]*Макк)|Третья[\s\xa0]*книга[\s\xa0]*Маккаве[ий]ская)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:4(?:[\s\xa0]*Маккавеев|[\s\xa0]*Макк|Macc|\.[\s\xa0]*Маккавеев|[ея]\.?[\s\xa0]*Маккавеев|\-?[ея]\.?[\s\xa0]*Маккавеев))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zЀ-ҁ҃-҇Ҋ-ԧⷠ-ⷿꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ])(
		(?:1(?:[\s\xa0]*Маккавеев|Macc|\.[\s\xa0]*Маккавеев|[ея]\.?[\s\xa0]*Маккавеев|\-?[ея]\.?[\s\xa0]*Маккавеев|[\s\xa0]*Макк)|Первая[\s\xa0]*книга[\s\xa0]*Маккаве[ий]ская)
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

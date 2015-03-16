bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-z] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | 篇 (?! [a-z] )		#could be followed by a number
				  | chapter | verse | ff | ～ | ~ | ； | ， | 參 | 、
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* 篇
	| \d \W* ff (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^\\x1f]"

bcv_parser::regexps.first = "第一\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "第二\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "第三\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:；|，|參|、)|(?:～|~))"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|(?:～|~))"
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
		(?:Gen|《(?:创(?:世记》|》)|創(?:世[紀記]》|》)))|(?:《(?:創(?:世[紀記])?|创(?:世记)?)|创(?:世记》?|》)?|創(?:世[紀記]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Exod|《出(?:埃及(?:[記记]》|》)|谷紀》|》))|(?:《出(?:埃及[記记]?|谷紀)?|出(?:埃及(?:[記记]》?|》)?|谷紀》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《Bel》?|Bel》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lev|《(?:肋未紀》|利(?:未[記记]》|末记》|》)))|(?:肋未紀》?|《(?:肋未紀|利(?:未[记記]|末记)?)|利(?:未[记記]》?|末记》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Num|戶籍紀》?|《(?:戶籍紀》?|民(?:数记》?|數記》?|》)?)|民(?:数记》?|數記》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《德訓篇》?|Sir|德訓篇》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《智慧篇》?|Wis|智慧篇》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rev|《(?:若望默示錄》|[啓默]示錄》|启(?:示录》|》)|啟(?:示錄》|》)))|(?:若望默示錄》?|[啓默]示錄》?|《(?:若望默示錄|[默啓]示錄|啟(?:示錄)?|启(?:示录)?)|啟(?:示錄》?|》)?|启(?:示录》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《PrMan》?|PrMan》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Deut|《申(?:命[紀記记]》?|》)?|申(?:命[紀記记]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|民長紀》?|《(?:民長紀》?|士(?:师记》?|師記》?|》)?)|士(?:师记》?|師記》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ruth|盧德傳》?|路得[記记]》?|《(?:盧德傳》?|路得[記记]》?|得》?)|得》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:《1Esd》?|1Esd》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:《2Esd》?|2Esd》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isa|《(?:以(?:賽(?:亚书》|亞書》)|赛亚书》)|依撒意亞》|[賽赛]》))|(?:依撒意亞》?|以(?:赛亚书》?|賽(?:亞書》?|亚书》?))|《(?:依撒意亞|以(?:赛亚书|賽(?:亚书|亞書))|[賽赛])|[賽赛]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Sam|《撒(?:慕爾紀下》?|母耳[記记]下》?|下》?)|撒(?:慕爾紀下》?|母耳[記记]下》?|下》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Sam|《撒(?:慕爾紀上》?|母耳[記记]上》?|上》?)|撒(?:慕爾紀上》?|母耳[記记]上》?|上》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Kgs|列王[紀纪记]下》?|《(?:列王[紀纪记]下》?|王下》?)|王下》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Kgs|列王[紀纪记]上》?|《(?:列王[紀纪记]上》?|王上》?)|王上》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Chr|[历歷]代志下》?|編年紀下》?|《(?:[历歷]代志下》?|編年紀下》?|代下》?)|代下》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Chr|[历歷]代志上》?|編年紀上》?|《(?:[历歷]代志上》?|編年紀上》?|代上》?)|代上》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:厄斯德拉上》?|Ezra|以斯拉[記记]》?|《(?:厄斯德拉上》?|以斯拉[記记]》?|拉》?)|拉》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:厄斯德拉下》?|Neh|《(?:厄斯德拉下》?|尼(?:希米[記记]》?|》)?)|尼(?:希米[記记]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Amos|阿摩司[书書]》?|亞毛斯》?|《(?:阿摩司[书書]》?|亞毛斯》?|摩》?)|摩》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Job|約伯[傳記]》?|约伯记》?|《(?:約伯[傳記]》?|约伯记》?|伯》?)|伯》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:聖詠集》|(?:[詩诗](?:篇》|》)))|Ps)|(?:聖詠集》?|《(?:聖詠集|[詩诗]篇?)|(?:[詩诗](?:》|篇》?)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《PrAzar》?|PrAzar》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prov|《箴(?:》|言》?)?|箴(?:》|言》?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《SgThree》?|SgThree》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:耶利米哀歌》?|連同哀歌》?|Lam|《(?:耶利米哀歌》?|連同哀歌》?|哀》?)|哀》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|《(?:雅歌》?|歌》?)|雅歌》?|歌》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《EpJer》?|EpJer》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jer|《耶(?:利米[书書]》?|肋米亞》?|》)?|耶(?:利米[书書]》?|肋米亞》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ezek|《(?:以西(?:結[书書]》|结书》)|厄則克耳》|[結结]》))|(?:以西(?:結[书書]》?|结书》?)|厄則克耳》?|《(?:以西(?:结书|結[书書])|厄則克耳|[結结])|[结結]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dan|達尼爾》?|《(?:達尼爾》?|但(?:以理[书書]》?|》)?)|但(?:以理[书書]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hos|歐瑟亞》?|《(?:歐瑟亞》?|何(?:西阿[书書]》?|》)?)|何(?:西阿[书書]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|《(?:岳厄爾》|約珥書》|约[珥饵]书》|珥》))|(?:約珥書》?|约[珥饵]书》?|岳厄爾》?|《(?:約珥書|约[珥饵]书|岳厄爾|珥)|珥》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad|亞北底亞》?|《(?:亞北底亞》?|俄(?:巴底(?:亚书》?|亞書》?)|》)?)|俄(?:巴底(?:亚书》?|亞書》?)|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|约拿书》?|《(?:约拿书》?|約(?:拿書》?|納》?)|拿》?)|約(?:拿書》?|納》?)|拿》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mic|《(?:米該亞》|弥(?:迦书》|》)|彌(?:迦書》|》)))|(?:米該亞》?|《(?:米該亞|弥(?:迦书)?|彌(?:迦書)?)|弥(?:迦书》?|》)?|彌(?:迦書》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Nah|《(?:那(?:鴻[书書]》|鸿书》)|納鴻》|[鴻鸿]》))|(?:那(?:鸿书》?|鴻[书書]》?)|納鴻》?|《(?:那(?:鸿书|鴻[書书])|納鴻|[鸿鴻])|[鸿鴻]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab|《哈(?:巴谷(?:》|[书書]》?)?|》)?|哈(?:巴谷(?:》|[书書]》?)?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|索福尼亞》?|西番雅[书書]》?|《(?:索福尼亞》?|西番雅[书書]》?|番》?)|番》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag|《(?:哈(?:該[书書]》|该书》|蓋》)|[該该]》))|(?:哈(?:該[书書]》?|该书》?|蓋》?)|《(?:哈(?:该书|該[書书]|蓋)|[该該])|[該该]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal|《(?:玛(?:拉基(?:书》|》)|》)|瑪(?:拉基[亞書]》|》)))|(?:《(?:玛(?:拉基书?)?|瑪(?:拉基[書亞])?)|瑪(?:拉基[亞書]》?|》)?|玛(?:拉基(?:》|书》?)?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Gal|《(?:戛拉提亞》|迦拉達書》|加(?:拉太[书書]》|》)))|(?:戛拉提亞》?|迦拉達書》?|《(?:迦拉達書|戛拉提亞|加(?:拉太[書书])?)|加(?:拉太[書书]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zech|《(?:匝加利亞》|撒(?:加利亞書》|迦利(?:亚书》|亞(?:書》|》)))|[亚亞]》))|(?:撒(?:加利亞書》?|迦利(?:亚书》?|亞(?:書》?|》)?))|匝加利亞》?|《(?:撒(?:加利亞書|迦利(?:亚书|亞書?))|匝加利亞|[亞亚])|[亞亚]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Matt|《(?:[馬马]太福音》|瑪(?:竇福音》|特斐》)|太》))|(?:[馬马]太福音》?|瑪(?:竇福音》?|特斐》?)|《(?:[马馬]太福音|瑪(?:竇福音|特斐)|太)|太》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mark|《(?:馬(?:爾谷福音》|可福音》)|马可福音》|瑪爾克》|可》))|(?:马可福音》?|馬(?:爾谷福音》?|可福音》?)|瑪爾克》?|《(?:馬(?:爾谷福音|可福音)|马可福音|瑪爾克|可)|可》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Luke|《(?:魯喀》?|路(?:加福音》?|》)?)|魯喀》?|路(?:加福音》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1John|《(?:伊望第一》|若望一書》|約(?:翰[一壹]書》|壹》)|约(?:翰[一壹]书》|壹》)))|(?:若望一書》?|伊望第一》?|《(?:若望一書|伊望第一|約(?:翰[一壹]書|壹)|约(?:翰[壹一]书|壹))|约(?:翰[一壹]书》?|壹》?)|約(?:翰[一壹]書》?|壹》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2John|《(?:伊望第二》|若望二書》|約(?:翰[二貳]書》|貳》)|约(?:翰[二贰]书》|贰》)))|(?:若望二書》?|伊望第二》?|《(?:伊望第二|若望二書|约(?:翰[二贰]书|贰)|約(?:翰[貳二]書|貳))|约(?:翰[二贰]书》?|贰》?)|約(?:翰[貳二]書》?|貳》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:3John|《(?:伊望第三》|若望三書》|約(?:翰[三參]書》|三》)|约(?:翰[三叁]书》|三》)))|(?:若望三書》?|伊望第三》?|《(?:伊望第三|若望三書|約(?:翰[參三]書|三)|约(?:翰[叁三]书|三))|約(?:翰[三參]書》?|三》?)|约(?:翰[三叁]书》?|三》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:John|《(?:若望福音》|伊望》|(?:[約约](?:翰福音》|》))))|(?:若望福音》?|《(?:若望福音|伊望|(?:[约約](?:翰福音)?))|伊望》?|(?:[约約](?:翰福音》?|》)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rom|《(?:罗(?:马书》|》)|羅(?:爾瑪書》|馬書》|》)))|(?:《(?:罗(?:马书)?|羅(?:爾瑪書|馬書)?)|罗(?:马书》?|》)?|羅(?:爾瑪書》?|馬書》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Cor|《(?:哥林多(?:后书》|後書》)|[格歌]林多後書》|适凌爾福後》|林[后後]》))|(?:[歌格]林多後書》?|哥林多(?:后书》?|後書》?)|适凌爾福後》?|《(?:[格歌]林多後書|适凌爾福後|哥林多(?:后书|後書)|林[後后])|林[後后]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Cor|《(?:哥林多前[书書]》|[格歌]林多前書》|适凌爾福前》|林前》))|(?:哥林多前[書书]》?|适凌爾福前》?|[格歌]林多前書》?|《(?:[歌格]林多前書|哥林多前[書书]|适凌爾福前|林前)|林前》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eph|《(?:以弗所[书書]》|厄弗所書》|耶斐斯》|弗》))|(?:厄弗所書》?|以弗所[書书]》?|耶斐斯》?|《(?:厄弗所書|以弗所[书書]|耶斐斯|弗)|弗》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil|《(?:斐理伯書》|肥利批》|腓(?:立比[书書]》|》)))|(?:斐理伯書》?|肥利批》?|《(?:斐理伯書|肥利批|腓(?:立比[書书])?)|腓(?:立比[書书]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Col|《(?:哥羅森書》|歌(?:罗西书》|羅西書》)|适羅斯》|西》))|(?:歌(?:羅西書》?|罗西书》?)|哥羅森書》?|适羅斯》?|《(?:哥羅森書|歌(?:羅西書|罗西书)|适羅斯|西)|西》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《GkEsth》?|GkEsth》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:艾斯德爾傳》?|Esth|以斯帖[記记]》?|《(?:艾斯德爾傳》?|以斯帖[記记]》?|斯》?)|斯》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|《(?:使徒行[传傳]》|宗徒(?:大事錄》|行實》)|徒》))|(?:宗徒(?:大事錄》?|行實》?)|使徒行[传傳]》?|《(?:宗徒(?:大事錄|行實)|使徒行[传傳]|徒)|徒》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《多俾亞傳》?|多俾亞傳》?|Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《友弟德傳》?|友弟德傳》?|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|《(?:訓道篇》|传(?:道书》|》)|傳(?:道書》|》)))|(?:訓道篇》?|《(?:訓道篇|传(?:道书)?|傳(?:道書)?)|傳(?:道書》?|》)?|传(?:道书》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Thess|《(?:得撒洛尼後書》|莎倫後》|帖(?:撒(?:罗尼迦后书》|羅尼迦後書》)|[后後]》)))|(?:得撒洛尼後書》?|莎倫後》?|《(?:得撒洛尼後書|莎倫後|帖(?:撒(?:羅尼迦後書|罗尼迦后书)|[後后]))|帖(?:撒(?:罗尼迦后书》?|羅尼迦後書》?)|[后後]》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Thess|《(?:得撒洛尼前書》|莎倫前》|帖(?:撒(?:罗尼迦前书》|羅尼迦前書》)|前》)))|(?:得撒洛尼前書》?|《(?:得撒洛尼前書|莎倫前|帖(?:撒(?:罗尼迦前书|羅尼迦前書)|前))|莎倫前》?|帖(?:撒(?:羅尼迦前書》?|罗尼迦前书》?)|前》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Tim|《(?:弟茂德後書》|提(?:摩(?:太(?:后书》|後書》)|斐後》)|[后後]》)))|(?:弟茂德後書》?|《(?:弟茂德後書|提(?:摩(?:太(?:后书|後書)|斐後)|[后後]))|提(?:摩(?:太(?:後書》?|后书》?)|斐後》?)|[后後]》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Tim|《(?:弟茂德前書》|提(?:摩(?:太前[书書]》|斐前》)|前》)))|(?:弟茂德前書》?|《(?:弟茂德前書|提(?:摩(?:太前[书書]|斐前)|前))|提(?:摩(?:太前[書书]》?|斐前》?)|前》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Titus|《(?:弟鐸書》|提(?:多[书書]》|特書》)|多》))|(?:弟鐸書》?|提(?:多[書书]》?|特書》?)|《(?:提(?:特書|多[书書])|弟鐸書|多)|多》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phlm|《(?:腓利(?:門書》|门书》)|費肋孟書》|肥利孟》|[門门]》))|(?:費肋孟書》?|腓利(?:門書》?|门书》?)|肥利孟》?|《(?:費肋孟書|腓利(?:门书|門書)|肥利孟|[门門])|[門门]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Heb|《(?:希伯(?:來[书書]》|来书》)|耶烏雷爾》|[來来]》))|(?:耶烏雷爾》?|希伯(?:来书》?|來[书書]》?)|《(?:耶烏雷爾|希伯(?:來[书書]|来书)|[來来])|[来來]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jas|《(?:亞适烏》|雅(?:各(?:伯書》|[书書]》)|》)))|(?:亞适烏》?|《(?:亞适烏|雅(?:各(?:伯書|[书書]))?)|雅(?:各(?:伯書》?|[書书]》?)|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Pet|《(?:伯多祿後書》|撇特爾後》|彼(?:得(?:后书》|後書》)|[后後]》)))|(?:伯多祿後書》?|撇特爾後》?|《(?:伯多祿後書|撇特爾後|彼(?:得(?:後書|后书)|[後后]))|彼(?:得(?:後書》?|后书》?)|[后後]》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Pet|《(?:伯多祿前書》|撇特爾前》|彼(?:得前[书書]》|前》)))|(?:伯多祿前書》?|撇特爾前》?|《(?:伯多祿前書|撇特爾前|彼(?:得前[书書]|前))|彼(?:得前[書书]》?|前》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jude|《(?:伊屋達》|犹(?:大书》|》)|猶(?:[大達]書》|》)))|(?:伊屋達》?|《(?:伊屋達|犹(?:大书)?|猶(?:[達大]書)?)|犹(?:大书》?|》)?|猶(?:[大達]書》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《巴路克》?|Bar|巴路克》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《Sus》?|Sus》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Macc|《瑪加伯下》?|瑪加伯下》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:《3Macc》?|3Macc》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:《4Macc》?|4Macc》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Macc|《瑪加伯上》?|瑪加伯上》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Josh|《(?:約書亞記》|约书亚记》|若蘇厄書》|[书書]》))|(?:約書亞記》?|约书亚记》?|若蘇厄書》?|《(?:約書亞記|若蘇厄書|约书亚记|[書书])|[書书]》?)
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

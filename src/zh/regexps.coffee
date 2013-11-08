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
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* 篇
	| \d+ \W* ff (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
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
		(?:《(?:創(?:世[紀記]》?|》)?|创(?:世记》?|》)?)|創(?:世[記紀]》|》)|创(?:世记》|》)|Gen)|(?:创(?:世记)?|創(?:世[記紀])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Exod|《出(?:埃及(?:[記记]》?|》)?|谷紀》?|》)?|出(?:埃及(?:[記记]》|》)|谷紀》|》))|出(?:谷紀|埃及[記记]?)?
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
		(?:利(?:末记》|》|未[記记]》)|《(?:肋未紀》?|利(?:末记》?|》|未[记記]》?)?)|肋未紀》|Lev)|(?:肋未紀|利(?:未[记記]|末记)?)
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
		(?:德訓篇》?|Sir|《德訓篇》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:智慧篇》?|《智慧篇》?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:啟(?:》|示錄》)|若望默示錄》|《(?:啟(?:》|示錄》?)?|启(?:示录》?|》)?|[默啓]示錄》?|若望默示錄》?)|启(?:示录》|》)|Rev|[默啓]示錄》)|(?:启(?:示录)?|[啓默]示錄|啟(?:示錄)?|若望默示錄)
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
		(?:申(?:命[紀记記]》?|》)?|《申(?:命[记紀記]》?|》)?|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:士(?:师记》?|師記》?|》)?|《(?:士(?:师记》?|師記》?|》)?|民長紀》?)|民長紀》?|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:盧德傳》?|得》?|《(?:盧德傳》?|得》?|路得[記记]》?)|Ruth|路得[记記]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Esd》?|《1Esd》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Esd》?|《2Esd》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[賽赛]》|以(?:賽(?:亞書》|亚书》)|赛亚书》)|Isa|《(?:[赛賽]》?|以(?:賽(?:亞書》?|亚书》?)|赛亚书》?)|依撒意亞》?)|依撒意亞》)|(?:以(?:賽(?:亚书|亞書)|赛亚书)|[賽赛]|依撒意亞)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:撒(?:慕爾紀下》?|下》?|母耳[记記]下》?)|2Sam|《撒(?:慕爾紀下》?|下》?|母耳[記记]下》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:撒(?:母耳[記记]上》?|上》?|慕爾紀上》?)|《撒(?:母耳[记記]上》?|上》?|慕爾紀上》?)|1Sam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:王下》?|2Kgs|《(?:王下》?|列王[记纪紀]下》?)|列王[纪紀记]下》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:王上》?|列王[紀记纪]上》?|1Kgs|《(?:王上》?|列王[紀纪记]上》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:代下》?|2Chr|《(?:代下》?|[历歷]代志下》?|編年紀下》?)|[历歷]代志下》?|編年紀下》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:代上》?|1Chr|[历歷]代志上》?|編年紀上》?|《(?:代上》?|[歷历]代志上》?|編年紀上》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:厄斯德拉上》?|拉》?|以斯拉[記记]》?)|厄斯德拉上》?|拉》?|以斯拉[记記]》?|Ezra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:尼(?:希米[記记]》?|》)?|厄斯德拉下》?)|尼(?:希米[記记]》?|》)?|厄斯德拉下》?|Neh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:摩》?|阿摩司[书書]》?|亞毛斯》?)|摩》?|阿摩司[书書]》?|Amos|亞毛斯》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:伯》?|约伯记》?|約伯[傳記]》?)|伯》?|约伯记》?|Job|約伯[傳記]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:[诗詩](?:篇》|》))|Ps|《(?:(?:[诗詩](?:篇》?|》)?)|聖詠集》?)|聖詠集》)|(?:聖詠集|[诗詩]篇?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:PrAzar》?|《PrAzar》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:箴(?:言》?|》)?|《箴(?:言》?|》)?|Prov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:SgThree》?|《SgThree》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:哀》?|連同哀歌》?|耶利米哀歌》?|Lam|《(?:哀》?|連同哀歌》?|耶利米哀歌》?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:雅歌》?|歌》?)|雅歌》?|Song|歌》?)
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
		(?:Jer|耶(?:利米[書书]》?|肋米亞》?|》)?|《耶(?:利米[書书]》?|肋米亞》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[結结]》|《(?:[结結]》?|以西(?:結[書书]》?|结书》?)|厄則克耳》?)|以西(?:結[書书]》|结书》)|厄則克耳》|Ezek)|(?:厄則克耳|以西(?:结书|結[書书])|[結结])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:達尼爾》?|Dan|《(?:達尼爾》?|但(?:以理[書书]》?|》)?)|但(?:以理[書书]》?|》)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:歐瑟亞》?|何(?:西阿[書书]》?|》)?|Hos|《(?:歐瑟亞》?|何(?:西阿[书書]》?|》)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:珥》|《(?:珥》?|岳厄爾》?|約珥書》?|约[珥饵]书》?)|岳厄爾》|Joel|約珥書》|约[珥饵]书》)|(?:约[珥饵]书|約珥書|岳厄爾|珥)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:俄(?:巴底(?:亞書》?|亚书》?)|》)?|Obad|《(?:俄(?:巴底(?:亞書》?|亚书》?)|》)?|亞北底亞》?)|亞北底亞》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:拿》?|《(?:拿》?|約(?:納》?|拿書》?)|约拿书》?)|Jonah|約(?:納》?|拿書》?)|约拿书》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:彌(?:迦書》|》)|《(?:彌(?:迦書》?|》)?|弥(?:》|迦书》?)?|米該亞》?)|Mic|弥(?:》|迦书》)|米該亞》)|(?:弥(?:迦书)?|彌(?:迦書)?|米該亞)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[鸿鴻]》|那(?:鴻[書书]》|鸿书》)|《(?:那(?:鴻[书書]》?|鸿书》?)|[鸿鴻]》?|納鴻》?)|納鴻》|Nah)|(?:納鴻|[鸿鴻]|那(?:鸿书|鴻[書书]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《哈(?:巴谷(?:[书書]》?|》)?|》)?|哈(?:巴谷(?:[書书]》?|》)?|》)?|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:西番雅[书書]》?|番》?|索福尼亞》?|《(?:西番雅[书書]》?|番》?|索福尼亞》?)|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[該该]》|哈(?:蓋》|該[書书]》|该书》)|《(?:[该該]》?|哈(?:蓋》?|該[书書]》?|该书》?))|Hag)|(?:哈(?:该书|蓋|該[书書])|[該该])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:玛(?:拉基(?:书》|》)|》)|瑪(?:拉基[書亞]》|》)|Mal|《(?:瑪(?:拉基[亞書]》?|》)?|玛(?:拉基(?:书》?|》)?|》)?))|(?:玛(?:拉基书?)?|瑪(?:拉基[書亞])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:迦拉達書》|加(?:拉太[書书]》|》)|《(?:加(?:拉太[书書]》?|》)?|戛拉提亞》?|迦拉達書》?)|戛拉提亞》|Gal)|(?:加(?:拉太[書书])?|迦拉達書|戛拉提亞)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[亞亚]》|Zech|《(?:撒(?:迦利(?:亞(?:書》?|》)?|亚书》?)|加利亞書》?)|[亚亞]》?|匝加利亞》?)|匝加利亞》|撒(?:迦利(?:亞(?:書》|》)|亚书》)|加利亞書》))|(?:匝加利亞|撒(?:迦利(?:亚书|亞書?)|加利亞書)|[亚亞])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:太》|[馬马]太福音》|《(?:太》?|[馬马]太福音》?|瑪(?:特斐》?|竇福音》?))|Matt|瑪(?:特斐》|竇福音》))|(?:[馬马]太福音|瑪(?:特斐|竇福音)|太)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:可》|马可福音》|Mark|《(?:可》?|马可福音》?|瑪爾克》?|馬(?:爾谷福音》?|可福音》?))|瑪爾克》|馬(?:爾谷福音》|可福音》))|(?:马可福音|瑪爾克|可|馬(?:爾谷福音|可福音))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:路(?:》|加福音》?)?|魯喀》?)|Luke|路(?:》|加福音》?)?|魯喀》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:伊望第一》|约(?:壹》|翰[一壹]书》)|《(?:約(?:壹》?|翰[壹一]書》?)|若望一書》?|约(?:壹》?|翰[一壹]书》?)|伊望第一》?)|約(?:翰[一壹]書》|壹》)|1John|若望一書》)|(?:约(?:翰[壹一]书|壹)|若望一書|伊望第一|約(?:翰[壹一]書|壹))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:《(?:約(?:翰[貳二]書》?|貳》?)|若望二書》?|伊望第二》?|约(?:贰》?|翰[贰二]书》?))|伊望第二》|约(?:翰[二贰]书》|贰》)|約(?:貳》|翰[二貳]書》)|若望二書》|2John)|(?:若望二書|伊望第二|約(?:翰[二貳]書|貳)|约(?:翰[二贰]书|贰))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:伊望第三》|约(?:三》|翰[三叁]书》)|若望三書》|《(?:约(?:三》?|翰[三叁]书》?)|若望三書》?|約(?:三》?|翰[參三]書》?)|伊望第三》?)|3John|約(?:三》|翰[參三]書》))|(?:約(?:翰[三參]書|三)|若望三書|伊望第三|约(?:翰[三叁]书|三))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:伊望》?|若望福音》?|(?:[约約](?:》|翰福音》?)?))|John|伊望》|若望福音》|(?:[约約](?:》|翰福音》)))|(?:(?:[約约](?:翰福音)?)|伊望|若望福音)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rom|《(?:羅(?:馬書》?|》|爾瑪書》?)?|罗(?:》|马书》?)?)|羅(?:馬書》|》|爾瑪書》)|罗(?:》|马书》))|(?:罗(?:马书)?|羅(?:爾瑪書|馬書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Cor|《(?:林[後后]》?|适凌爾福後》?|哥林多(?:後書》?|后书》?)|[歌格]林多後書》?)|适凌爾福後》|林[后後]》|[歌格]林多後書》|哥林多(?:後書》|后书》))|(?:哥林多(?:后书|後書)|[歌格]林多後書|适凌爾福後|林[后後])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Cor|林前》|适凌爾福前》|哥林多前[书書]》|《(?:[歌格]林多前書》?|哥林多前[書书]》?|林前》?|适凌爾福前》?)|[歌格]林多前書》)|(?:[歌格]林多前書|林前|适凌爾福前|哥林多前[书書])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eph|弗》|耶斐斯》|以弗所[书書]》|厄弗所書》|《(?:弗》?|厄弗所書》?|耶斐斯》?|以弗所[书書]》?))|(?:厄弗所書|以弗所[书書]|弗|耶斐斯)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:腓(?:立比[書书]》?|》)?|斐理伯書》?|肥利批》?)|斐理伯書》|Phil|腓(?:》|立比[书書]》)|肥利批》)|(?:斐理伯書|肥利批|腓(?:立比[書书])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:西》|Col|哥羅森書》|歌(?:羅西書》|罗西书》)|适羅斯》|《(?:哥羅森書》?|西》?|歌(?:羅西書》?|罗西书》?)|适羅斯》?))|(?:适羅斯|哥羅森書|歌(?:羅西書|罗西书)|西)
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
		(?:艾斯德爾傳》?|斯》?|Esth|《(?:艾斯德爾傳》?|斯》?|以斯帖[记記]》?)|以斯帖[记記]》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:徒》|使徒行[傳传]》|《(?:宗徒(?:大事錄》?|行實》?)|使徒行[传傳]》?|徒》?)|宗徒(?:大事錄》|行實》)|Acts)|(?:宗徒(?:行實|大事錄)|使徒行[传傳]|徒)
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
		(?:《(?:傳(?:道書》?|》)?|訓道篇》?|传(?:》|道书》?)?)|傳(?:道書》|》)|訓道篇》|Eccl|传(?:》|道书》))|(?:訓道篇|传(?:道书)?|傳(?:道書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:莎倫後》|《(?:得撒洛尼後書》?|帖(?:[後后]》?|撒(?:罗尼迦后书》?|羅尼迦後書》?))|莎倫後》?)|帖(?:[後后]》|撒(?:罗尼迦后书》|羅尼迦後書》))|2Thess|得撒洛尼後書》)|(?:莎倫後|帖(?:撒(?:羅尼迦後書|罗尼迦后书)|[後后])|得撒洛尼後書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:帖(?:前》|撒(?:羅尼迦前書》|罗尼迦前书》))|1Thess|《(?:莎倫前》?|帖(?:前》?|撒(?:羅尼迦前書》?|罗尼迦前书》?))|得撒洛尼前書》?)|得撒洛尼前書》|莎倫前》)|(?:莎倫前|帖(?:撒(?:罗尼迦前书|羅尼迦前書)|前)|得撒洛尼前書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:2Tim|弟茂德後書》|《(?:弟茂德後書》?|提(?:摩(?:斐後》?|太(?:後書》?|后书》?))|[後后]》?))|提(?:[后後]》|摩(?:斐後》|太(?:後書》|后书》))))|(?:提(?:摩(?:太(?:后书|後書)|斐後)|[後后])|弟茂德後書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:1Tim|弟茂德前書》|《(?:弟茂德前書》?|提(?:前》?|摩(?:斐前》?|太前[書书]》?)))|提(?:前》|摩(?:斐前》|太前[书書]》)))|(?:提(?:摩(?:斐前|太前[书書])|前)|弟茂德前書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Titus|多》|弟鐸書》|提(?:特書》|多[書书]》)|《(?:多》?|弟鐸書》?|提(?:特書》?|多[书書]》?)))|(?:提(?:特書|多[书書])|多|弟鐸書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:[門门]》?|腓利(?:門書》?|门书》?)|肥利孟》?|費肋孟書》?)|[门門]》|腓利(?:門書》|门书》)|肥利孟》|費肋孟書》|Phlm)|(?:肥利孟|腓利(?:门书|門書)|[門门]|費肋孟書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Heb|[來来]》|耶烏雷爾》|希伯(?:來[書书]》|来书》)|《(?:[来來]》?|耶烏雷爾》?|希伯(?:來[書书]》?|来书》?)))|(?:耶烏雷爾|[來来]|希伯(?:来书|來[書书]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:雅(?:》|各(?:[书書]》|伯書》))|《(?:雅(?:各(?:[書书]》?|伯書》?)|》)?|亞适烏》?)|Jas|亞适烏》)|(?:雅(?:各(?:伯書|[書书]))?|亞适烏)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:彼(?:[后後]》|得(?:後書》|后书》))|2Pet|伯多祿後書》|《(?:撇特爾後》?|伯多祿後書》?|彼(?:[后後]》?|得(?:後書》?|后书》?)))|撇特爾後》)|(?:彼(?:得(?:后书|後書)|[後后])|伯多祿後書|撇特爾後)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9\\x1f])(
		(?:彼(?:前》|得前[书書]》)|《(?:彼(?:前》?|得前[書书]》?)|伯多祿前書》?|撇特爾前》?)|1Pet|伯多祿前書》|撇特爾前》)|(?:撇特爾前|伯多祿前書|彼(?:得前[書书]|前))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:《(?:猶(?:[大達]書》?|》)?|犹(?:》|大书》?)?|伊屋達》?)|Jude|猶(?:[達大]書》|》)|犹(?:》|大书》)|伊屋達》)|(?:犹(?:大书)?|猶(?:[大達]書)?|伊屋達)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:巴路克》?|《巴路克》?|Bar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sus》?|《Sus》?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		(?:《瑪加伯下》?|瑪加伯下》?|2Macc)
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
		(?:《瑪加伯上》?|瑪加伯上》?|1Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[書书]》|Josh|約書亞記》|约书亚记》|若蘇厄書》|《(?:[书書]》?|約書亞記》?|若蘇厄書》?|约书亚记》?))|(?:[書书]|約書亞記|约书亚记|若蘇厄書)
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
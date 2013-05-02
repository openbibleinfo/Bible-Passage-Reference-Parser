bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-z] )	#beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
		(
			\x1f(\d+)(?:/[a-z])?\x1f		#book
				(?:
				  | /[pq]\x1f					#special Psalm chapters
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
		extra: "q"
		regexp: ///(\b)( # Don't match a preceding \d like usual because we only want to match a valid OSIS, which will never have a preceding digit.
			Ps151
			# Always follwed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
			)(?=\.1)///g # Case-sensitive because we only want to match a valid OSIS.
	,
		osis: ["Gen"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?創世紀》? | 《?创世记》? | 《?創世記》? | 《?創》? | 《?创》? | Gen
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?出埃及記》? | 《?出埃及记》? | 《?出埃及》? | 《?出谷紀》? | Exod | 《?出》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Bel[\s ]*and[\s ]*the[\s ]*Dragon》? | Bel
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?肋未紀》? | 《?利未记》? | 《?利未記》? | 《?利末记》? | Lev | 《?利》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?戶籍紀》? | 《?民数记》? | 《?民數記》? | Num | 《?民》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?德訓篇》? | Sir
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?智慧篇》? | Wis
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?若望默示錄》? | 《?默示錄》? | 《?启示录》? | 《?啟示錄》? | 《?啓示錄》? | 《?啟》? | 《?启》? | Rev
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Prayer[\s ]*of[\s ]*Manasseh》? | PrMan
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?申命紀》? | 《?申命记》? | 《?申命記》? | Deut | 《?申》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?民長紀》? | 《?士師記》? | 《?士师记》? | Judg | 《?士》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?路得记》? | 《?路得記》? | 《?盧德傳》? | Ruth | 《?得》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		《?1[\s ]*Esdras》? | 1Esd
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		《?2[\s ]*Esdras》? | 2Esd
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?以賽亚书》? | 《?依撒意亞》? | 《?以賽亞書》? | 《?以赛亚书》? | 《?賽》? | Isa | 《?赛》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9\\x1f])(
		《?撒母耳記下》? | 《?撒慕爾紀下》? | 《?撒母耳记下》? | 《?撒下》? | 2Sam
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9\\x1f])(
		《?撒母耳记上》? | 《?撒母耳記上》? | 《?撒慕爾紀上》? | 1Sam | 《?撒上》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9\\x1f])(
		《?列王记下》? | 《?列王紀下》? | 《?列王纪下》? | 《?王下》? | 2Kgs
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9\\x1f])(
		《?列王紀上》? | 《?列王纪上》? | 《?列王记上》? | 1Kgs | 《?王上》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9\\x1f])(
		《?历代志下》? | 《?編年紀下》? | 《?歷代志下》? | 2Chr | 《?代下》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9\\x1f])(
		《?历代志上》? | 《?編年紀上》? | 《?歷代志上》? | 1Chr | 《?代上》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?厄斯德拉上》? | 《?以斯拉記》? | 《?以斯拉记》? | Ezra | 《?拉》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?厄斯德拉下》? | 《?尼希米記》? | 《?尼希米记》? | 《?尼》? | Neh
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?阿摩司书》? | 《?阿摩司書》? | 《?亞毛斯》? | Amos | 《?摩》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?约伯记》? | 《?約伯記》? | 《?約伯傳》? | Job | 《?伯》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?聖詠集》? | 《?詩篇》? | 《?诗篇》? | 《?詩》? | 《?诗》? | Ps
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Prayer[\s ]*of[\s ]*Azariah》? | PrAzar
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?箴言》? | Prov | 《?箴》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Song[\s ]*of[\s ]*the[\s ]*Three[\s ]*Young[\s ]*Men》? | SgThree
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?耶利米哀歌》? | 《?連同哀歌》? | Lam | 《?哀》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?雅歌》? | Song | 《?歌》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Epistle[\s ]*of[\s ]*Jeremiah》? | EpJer
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?耶利米书》? | 《?耶肋米亞》? | 《?耶利米書》? | 《?耶》? | Jer
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?以西结书》? | 《?以西結書》? | 《?厄則克耳》? | 《?以西結书》? | Ezek | 《?結》? | 《?结》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?但以理书》? | 《?但以理書》? | 《?達尼爾》? | 《?但》? | Dan
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?何西阿書》? | 《?何西阿书》? | 《?歐瑟亞》? | 《?何》? | Hos
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?岳厄爾》? | 《?約珥書》? | 《?约饵书》? | 《?约珥书》? | Joel | 《?珥》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?俄巴底亞書》? | 《?俄巴底亚书》? | 《?亞北底亞》? | Obad | 《?俄》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jonah | 《?約拿書》? | 《?约拿书》? | 《?約納》? | 《?拿》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?彌迦書》? | 《?弥迦书》? | 《?米該亞》? | Mic | 《?彌》? | 《?弥》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?那鴻書》? | 《?那鸿书》? | 《?那鴻书》? | 《?納鴻》? | Nah | 《?鴻》? | 《?鸿》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?哈巴谷書》? | 《?哈巴谷书》? | 《?哈巴谷》? | Hab | 《?哈》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?索福尼亞》? | 《?西番雅書》? | 《?西番雅书》? | Zeph | 《?番》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?哈該書》? | 《?哈该书》? | 《?哈該书》? | 《?哈蓋》? | Hag | 《?该》? | 《?該》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?瑪拉基書》? | 《?瑪拉基亞》? | 《?玛拉基书》? | 《?玛拉基》? | 《?瑪》? | 《?玛》? | Mal
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?加拉太书》? | 《?戛拉提亞》? | 《?加拉太書》? | 《?迦拉達書》? | 《?加》? | Gal
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?撒加利亞書》? | 《?撒迦利亞書》? | 《?撒迦利亚书》? | 《?撒迦利亞》? | 《?匝加利亞》? | Zech | 《?亚》? | 《?亞》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?马太福音》? | 《?馬太福音》? | 《?瑪竇福音》? | 《?瑪特斐》? | Matt | 《?太》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?馬爾谷福音》? | 《?馬可福音》? | 《?马可福音》? | 《?瑪爾克》? | Mark | 《?可》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?路加福音》? | 《?魯喀》? | Luke | 《?路》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9\\x1f])(
		《?約翰一書》? | 《?约翰一书》? | 《?約翰壹書》? | 《?若望一書》? | 《?伊望第一》? | 《?约翰壹书》? | 1John | 《?約壹》? | 《?约壹》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9\\x1f])(
		《?約翰二書》? | 《?若望二書》? | 《?约翰二书》? | 《?约翰贰书》? | 《?伊望第二》? | 《?約翰貳書》? | 2John | 《?约贰》? | 《?約貳》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9\\x1f])(
		《?約翰三書》? | 《?约翰叁书》? | 《?约翰三书》? | 《?伊望第三》? | 《?若望三書》? | 《?約翰參書》? | 3John | 《?约三》? | 《?約三》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?約翰福音》? | 《?若望福音》? | 《?约翰福音》? | 《?伊望》? | John | 《?約》? | 《?约》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?羅爾瑪書》? | 《?罗马书》? | 《?羅馬書》? | 《?罗》? | 《?羅》? | Rom
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9\\x1f])(
		《?哥林多后书》? | 《?歌林多後書》? | 《?适凌爾福後》? | 《?格林多後書》? | 《?哥林多後書》? | 《?林后》? | 2Cor | 《?林後》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9\\x1f])(
		《?歌林多前書》? | 《?适凌爾福前》? | 《?哥林多前書》? | 《?哥林多前书》? | 《?格林多前書》? | 1Cor | 《?林前》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?以弗所書》? | 《?厄弗所書》? | 《?以弗所书》? | 《?耶斐斯》? | 《?弗》? | Eph
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?斐理伯書》? | 《?腓立比書》? | 《?腓立比书》? | 《?肥利批》? | Phil | 《?腓》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?歌羅西書》? | 《?歌罗西书》? | 《?哥羅森書》? | 《?适羅斯》? | 《?西》? | Col
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Greek[\s ]*Esther》? | GkEsth
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?艾斯德爾傳》? | 《?以斯帖記》? | 《?以斯帖记》? | Esth | 《?斯》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?宗徒大事錄》? | 《?使徒行傳》? | 《?使徒行传》? | 《?宗徒行實》? | Acts | 《?徒》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?多俾亞傳》? | Tob
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?友弟德傳》? | Jdt
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?訓道篇》? | 《?傳道書》? | 《?传道书》? | Eccl | 《?傳》? | 《?传》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9\\x1f])(
		《?帖撒羅尼迦後書》? | 《?帖撒罗尼迦后书》? | 《?得撒洛尼後書》? | 2Thess | 《?莎倫後》? | 《?帖后》? | 《?帖後》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9\\x1f])(
		《?帖撒羅尼迦前書》? | 《?帖撒罗尼迦前书》? | 《?得撒洛尼前書》? | 1Thess | 《?莎倫前》? | 《?帖前》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9\\x1f])(
		《?提摩太後書》? | 《?弟茂德後書》? | 《?提摩太后书》? | 《?提摩斐後》? | 《?提後》? | 2Tim | 《?提后》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9\\x1f])(
		《?提摩太前書》? | 《?提摩太前书》? | 《?弟茂德前書》? | 《?提摩斐前》? | 《?提前》? | 1Tim
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?提特書》? | 《?弟鐸書》? | 《?提多書》? | Titus | 《?提多书》? | 《?多》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?腓利門書》? | 《?費肋孟書》? | 《?腓利门书》? | 《?肥利孟》? | Phlm | 《?门》? | 《?門》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?希伯來書》? | 《?希伯來书》? | 《?耶烏雷爾》? | 《?希伯来书》? | 《?來》? | 《?来》? | Heb
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?雅各伯書》? | 《?亞适烏》? | 《?雅各書》? | 《?雅各书》? | 《?雅》? | Jas
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9\\x1f])(
		《?伯多祿後書》? | 《?撇特爾後》? | 《?彼得後書》? | 《?彼得后书》? | 2Pet | 《?彼後》? | 《?彼后》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9\\x1f])(
		《?伯多祿前書》? | 《?撇特爾前》? | 《?彼得前書》? | 《?彼得前书》? | 《?彼前》? | 1Pet
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?犹大书》? | 《?猶達書》? | 《?猶大書》? | 《?伊屋達》? | Jude | 《?猶》? | 《?犹》?
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?巴路克》? | Bar
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?Susanna》? | Sus
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		《?瑪加伯下》? | 2Macc
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		《?3[\s ]*Maccabees》? | 3Macc
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		《?4[\s ]*Maccabees》? | 4Macc
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9\\x1f])(
		《?瑪加伯上》? | 1Macc
			)(?:(?=[\s.\d])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		《?約書亞記》? | 《?若蘇厄書》? | 《?约书亚记》? | Josh | 《?書》? | 《?书》?
			)(?:(?=[\s.\d])|$)///gi
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
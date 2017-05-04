bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | title (?! [a-z] )		#could be followed by a number
				  | and | ff | 章 | ～ | ~ | 節
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
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎]"

bcv_parser::regexps.first = "一\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "二\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "三\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|and|(?:～|~))"
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
		(?:創(?:世記|世)?|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:出(?:エ[シジ][フプ]ト記?)?|Exod)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ヘベ]ルと[竜龍]|Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:レ(?:[ヒビ]記|[ヒビ])|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:民(?:数記|数)?|Num)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:シラ(?:フの子イイススの知恵書|書（集会の書）|書)?|[ヘベ]ン・シラの(?:智慧|知恵)|Sir|集会の書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:知恵の書)|(?:ソロモンの(?:知恵書|智慧)|Wis|知恵|知)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lam|哀歌|哀|エレミヤの哀歌)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エレミヤ(?:の(?:手紙|書翰)|・手)|EpJer|イエレミヤの達書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヨハネの[默黙]示録|Rev|黙示録)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:マナセの(?:祈[り禱]|いのり)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:申(?:命記|命)?|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヨシュア記?|Josh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:士(?:師記|師)?|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ruth|ルツ記?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:エ[スズ](?:[トド]ラ第一巻|ラ第一書)|1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:エ[スズ](?:[トド]ラ第二巻|ラ第二書)|2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:イ[サザ]ヤ書?|Isa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:サムエル(?:記[Ⅱ下]|下|後書|[\s\xa0]*2)|Ⅱサムエル|2Sam|列王記第二巻)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:サムエル(?:記[Ⅰ上]|上|前書|[\s\xa0]*1)|Ⅰサムエル|1Sam|列王記第一巻)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:列(?:王(?:記(?:[Ⅱ下]|第四巻)|紀略?下|[\s\xa0]*2)|下)|2Kgs|Ⅱ列王)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:列(?:王(?:記(?:[Ⅰ上]|第三巻)|紀略?上|[\s\xa0]*1)|上)|1Kgs|Ⅰ列王)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:歴(?:代(?:誌(?:[Ⅱ下]|[\s\xa0]*2)|史下|志略?下)|下)|2Chr|Ⅱ歴代)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:歴(?:代(?:誌(?:[Ⅰ上]|[\s\xa0]*1)|史上|志略?上)|上)|1Chr|Ⅰ歴代)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エ(?:[スズ]ラ[書記]|[スズ]ラ)|Ezra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ネヘミヤ(?:[\s\xa0]*記|記)?|Neh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エステル(?:書殘篇|記補遺)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エステル(?:[書記]|[\s\xa0]*記)?|Esth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヨ[フブ](?:[\s\xa0]*記|記)?|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:詩(?:篇(?:\/聖詠)?|編)?|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ア[サザ]ルヤの祈り|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:箴言(?:[\s\xa0]*知恵の泉)?|Prov|格言の書|格)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:コヘレト(?:の(?:こと[はば]|言葉))?|Eccl|傳道之書|伝道者?の書|伝道者の)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:三(?:人の若者の賛|童兒の)歌|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:諸歌の|雅)歌|雅|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヱレミヤ記|Jer|エレミヤ書?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エ[セゼ]キエル書?|Ezek)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[タダ]ニエル書?|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ホセア(?:しょ|書)?|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|ヨエル書|ヨエル|よえるしょ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:アモス(?:しょ|書)?|Amos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:オ[ハバ](?:[テデ](?:ヤ(?:しょ|書)?|ア書))?|Obad)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヨナ(?:しょ|書)?|Jonah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ミカ(?:しょ|書)?|Mic)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ナホム(?:しょ|書)?|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ハ[ハバ]クク(?:しょ|書)?|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[セゼ](?:ファ(?:ニ(?:ヤ(?:しょ|書)|ア書?))?|[ハパ]ニヤ書|[ハパ]ニヤ)|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ハ[カガ]イ(?:しょ|書)?|Hag)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[セゼ]カリヤ(?:しょ|書)?|Zech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:マラ(?:キ書?)?|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:マタイ(?:[伝書]|福音書|[の傳]福音書|による福音書)?|Matt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:マルコ(?:[伝書]|福音書|[の傳]福音書|による福音書)?|Mark)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ルカ(?:[伝書]|福音書|[の傳]福音書|による福音書)?|Luke)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:ヨハネの(?:第一の(?:手紙|書)|手紙[Ⅰ一])|(?:Ⅰ[\s\xa0]*|一)ヨハネ|1John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:ヨハネの(?:第二の(?:手紙|書)|手紙[Ⅱ二])|(?:Ⅱ[\s\xa0]*|二)ヨハネ|2John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:ヨハネの(?:第三の(?:手紙|書)|手紙[Ⅲ三])|(?:Ⅲ[\s\xa0]*|三)ヨハネ|3John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヨハネ(?:[の傳]福音書|福音書|伝|による福音書)?|John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:使徒(?:行[伝傳録]|書|言行録|の働き)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ロ(?:ーマ(?:人への手紙|人へ|書|の信徒への手紙)?|マ人への書)|Rom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:コリント(?:人への(?:手紙[Ⅱ二]|後の書|第二の手紙)|[\s\xa0]*2|後書|の信徒への手紙二)|Ⅱ[\s\xa0]*コリント人へ|2Cor)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:コリント(?:人への(?:手紙[Ⅰ一]|前の書|第一の手紙)|[\s\xa0]*1|前書|の信徒への手紙一)|Ⅰ[\s\xa0]*コリント人へ|1Cor)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[カガ]ラテヤ人への手紙)|(?:[カガ]ラテヤ(?:(?:人への)?書|人へ|の信徒への手紙)?|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エ[ヘペ]ソ人への手紙)|(?:エ(?:フェソ(?:の信徒への手紙|人への手紙|書)?|[ヘペ]ソ(?:人への)?書|[ヘペ]ソ人へ)|Eph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ヒピ]リ[ヒピ]人への手紙)|(?:[ヒピ]リ[ヒピ](?:人への)?書|Phil|[ヒピ]リ[ヒピ]人へ|フィリ[ヒピ](?:の信徒への手紙|人への手紙|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:コロサイ人への手紙)|(?:コロサイ(?:(?:人への)?書|人へ|の信徒への手紙)?|Col)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テサロニケ(?:人への(?:手紙[Ⅱ二]|後の書|第二の手紙)|[\s\xa0]*2|後書|の信徒への手紙二)|Ⅱ[\s\xa0]*テサロニケ人へ|2Thess)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テサロニケ(?:人への(?:手紙[Ⅰ一]|前の書|第一の手紙)|[\s\xa0]*1|前書|の信徒への手紙一)|Ⅰ[\s\xa0]*テサロニケ人へ|1Thess)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テモテ(?:への(?:手紙[Ⅱ二]|後の書)|[\s\xa0]*2|後書|ヘの第二の手紙)|2Tim|二テモテ|Ⅱ[\s\xa0]*テモテへ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テモテ(?:への(?:手紙[Ⅰ一]|前の書)|[\s\xa0]*1|前書|ヘの第一の手紙)|1Tim|一テモテ|Ⅰ[\s\xa0]*テモテへ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:テ(?:トス(?:への(?:て[かが]み|手紙|書)|ヘの手紙|書|へ)?|ィトに達する書)|Titus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ヒピ]レモンへの手紙)|(?:[ヒピ]レモン(?:への)?書|Phlm|[ヒピ]レモンへ|[ヒピ]レモンヘの手紙|フィレモン(?:への手紙|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヘ[フブ]ル人への手紙)|(?:ヘ[フブ](?:ル(?:(?:人への)?書|人へ)|ライ(?:人への手紙|書)?)|へ[フブ]ル人への手紙|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヤコ[フブ](?:の?書|の手紙|からの手紙)?|Jas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:[ヘペ](?:テロの(?:後の書|手紙Ⅱ|第二の手紙)|トロ(?:の手紙二|[\s\xa0]*2|の第二の手紙))|二[ヘペ]トロ|2Pet|Ⅱ[\s\xa0]*[ヘペ]テロ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:[ヘペ](?:テロの(?:前の書|手紙Ⅰ|第一の手紙)|トロ(?:の手紙一|[\s\xa0]*1|の第一の手紙))|一[ヘペ]トロ|1Pet|Ⅰ[\s\xa0]*[ヘペ]テロ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ユ[タダ](?:の手紙|の書|からの手紙)?|Jude)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ト[ヒビ]ト[書記]?|Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ユ[テデ](?:ィト記?|ト書)|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ハバ]ルク書|Bar|[ハバ]ルク|ワルフの預言書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ス[サザ]ンナ(?:物語)?|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:マカ(?:[ハバ]イ(?:記[2下]|下|[\s\xa0]*2)|[ヒビ]ー第二書)|2Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:マカ(?:[ハバ]イ[\s\xa0記]*3|[ヒビ]ー第三書)|3Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:マカ(?:[ハバ]イ[\s\xa0記]*4|[ヒビ]ー第四書)|4Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:マカ(?:[ハバ]イ(?:記[1上]|上|[\s\xa0]*1)|[ヒビ]ー第一書)|1Macc)
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

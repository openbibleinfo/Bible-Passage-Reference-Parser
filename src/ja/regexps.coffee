bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎] )	#beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
		(
			\x1f(\d+)(?:/[a-z])?\x1f		#book
				(?:
				  | /[pq]\x1f					#special Psalm chapters
				  | [\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014]
				  | title (?! [a-z] )		#could be followed by a number
				  | and | ff | 章 | ～ | ~ | 節
				  | [a-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* title
	| \d+ \W* ff (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* [a-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
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
		extra: "q"
		regexp: ///(\b)( # Don't match a preceding \d like usual because we only want to match a valid OSIS, which will never have a preceding digit.
			Ps151
			# Always follwed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
			)(?=\.1)///g # Case-sensitive because we only want to match a valid OSIS.
	,
		osis: ["Gen"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		創世記 | Gen | 創
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		出エ[ジシ][プフ]ト記 | Exod | 出
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		[ベヘ]ルと竜 | [ベヘ]ルと龍 | Bel
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Lev | レ[ビヒ]記 | レ[ビヒ]
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Num | 民数記 | 民
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		シラフの子イイススの知恵書 | シラ書（集会の書） | [ベヘ]ン・シラの智慧 | [ベヘ]ン・シラの知恵 | 集会の書 | シラ書 | Sir | シラ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ソロモンの知恵書 | ソロモンの智慧 | 知恵の書 | Wis | 知恵 | 知
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エレミヤの哀歌 | Lam | 哀歌 | 哀
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		イエレミヤの達書 | エレミヤの手紙 | エレミヤの書翰 | エレミヤ・手 | EpJer
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ヨハネの默示録 | ヨハネの黙示録 | 黙示録 | Rev
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		マナセのいのり | マナセの祈禱 | マナセの祈り | PrMan
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Deut | 申命記 | 申
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ヨシュア記 | Josh | ヨシュア
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Judg | 士師記 | 士師 | 士
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ruth | ルツ記 | ルツ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		エ[ズス][ドト]ラ第一巻 | エ[ズス]ラ第一書 | 1Esd
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		エ[ズス][ドト]ラ第二巻 | エ[ズス]ラ第二書 | 2Esd
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		イ[ザサ]ヤ書 | イ[ザサ]ヤ | Isa
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		サムエル記下 | 列王記第二巻 | サムエル後書 | サムエル[\s ]*2 | サムエル下 | 2Sam
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		サムエル記上 | 列王記第一巻 | サムエル[\s ]*1 | サムエル前書 | サムエル上 | 1Sam
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		列王記第四巻 | 列王紀略下 | 列王紀下 | 列王記下 | 2Kgs | 列王[\s ]*2 | 列下
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		列王記第三巻 | 列王紀略上 | 列王紀上 | 列王記上 | 列王[\s ]*1 | 1Kgs | 列上
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		歴代志略下 | 歴代誌[\s ]*2 | 歴代史下 | 歴代志下 | 2Chr | 歴代誌下 | 歴下
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		歴代志略上 | 歴代誌[\s ]*1 | 歴代誌上 | 1Chr | 歴代史上 | 歴代志上 | 歴上
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エ[ズス]ラ書 | エ[ズス]ラ記 | Ezra | エ[ズス]ラ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ネヘミヤ記 | ネヘミヤ | Neh
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エステル記補遺 | エステル書殘篇 | GkEsth
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エステル記 | エステル書 | エステル | Esth
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ヨ[ブフ]記 | Job | ヨ[ブフ]
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		詩篇/聖詠 | Ps | 詩篇 | 詩編 | 詩
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ア[ザサ]ルヤの祈り | PrAzar
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		格言の書 | Prov | 箴言 | 格
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		コヘレトのこと[ばは] | コヘレトの言葉 | 傳道之書 | コヘレト | Eccl | 伝道の書
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		三人の若者の賛歌 | SgThree | 三童兒の歌
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		諸歌の歌 | Song | 雅歌 | 雅
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エレミヤ書 | ヱレミヤ記 | エレミヤ | Jer
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エ[ゼセ]キエル書 | エ[ゼセ]キエル | Ezek
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		[ダタ]ニエル書 | [ダタ]ニエル | Dan
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ホセアしょ | ホセア書 | Hos | ホセア
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		よえるしょ | Joel | ヨエル書 | ヨエル
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		アモスしょ | アモス書 | Amos | アモス
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		オ[バハ][デテ]ヤしょ | オ[バハ][デテ]ア書 | オ[バハ][デテ]ヤ書 | オ[バハ][デテ]ヤ | Obad | オ[バハ]
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jonah | ヨナしょ | ヨナ書 | ヨナ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ミカしょ | ミカ書 | Mic | ミカ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ナホムしょ | ナホム書 | ナホム | Nah
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ハ[バハ]ククしょ | ハ[バハ]クク書 | ハ[バハ]クク | Hab
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		[ゼセ]ファニヤしょ | [ゼセ]ファニヤ書 | [ゼセ]ファニア書 | [ゼセ]ファニア | [ゼセ][パハ]ニヤ書 | Zeph | [ゼセ]ファ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ハ[ガカ]イしょ | ハ[ガカ]イ書 | Hag | ハ[ガカ]イ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		[ゼセ]カリヤしょ | [ゼセ]カリヤ書 | Zech | [ゼセ]カリヤ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		マラキ書 | マラキ | Mal | マラ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		マタイによる福音書 | マタイ傳福音書 | マタイ福音書 | マタイ伝 | Matt | マタイ書
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		マルコによる福音書 | マルコ傳福音書 | マルコ福音書 | マルコ伝 | マルコ書 | Mark
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ルカによる福音書 | ルカ傳福音書 | ルカ福音書 | Luke | ルカ伝 | ルカ書 | ルカ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		ヨハネの第一の手紙 | ヨハネの第一の書 | ヨハネの手紙一 | 1John | ヨハネ[\s ]*1 | 一ヨハネ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		ヨハネの第二の手紙 | ヨハネの第二の書 | ヨハネの手紙二 | 2John | ヨハネ[\s ]*2 | 二ヨハネ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		ヨハネの第三の手紙 | ヨハネの第三の書 | ヨハネの手紙三 | 3John | ヨハネ[\s ]*3 | 三ヨハネ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ヨハネによる福音書 | ヨハネ傳福音書 | ヨハネ福音書 | ヨハネ伝 | John
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		使徒言行録 | 使徒行傳 | 使徒行伝 | 使徒行録 | Acts | 使徒書 | 使徒
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ローマの信徒への手紙 | ローマ人への手紙 | ロマ人への書 | ローマ書 | ローマ | Rom
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		コリントの信徒への手紙二 | コリント人への第二の手紙 | コリント人への手紙二 | コリント人への後の書 | コリント[\s ]*2 | コリント後書 | 2Cor
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		コリントの信徒への手紙一 | コリント人への第一の手紙 | コリント人への手紙一 | コリント人への前の書 | コリント前書 | コリント[\s ]*1 | 1Cor
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		[ガカ]ラテヤの信徒への手紙 | [ガカ]ラテヤ人への手紙 | [ガカ]ラテヤ人への書 | [ガカ]ラテヤ書 | [ガカ]ラテヤ | Gal
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		エフェソの信徒への手紙 | エフェソ人への手紙 | エ[ペヘ]ソ人への手紙 | エ[ペヘ]ソ人への書 | エフェソ書 | エ[ペヘ]ソ書 | エフェソ | Eph
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		フィリ[ピヒ]の信徒への手紙 | フィリ[ピヒ]人への手紙 | [ピヒ]リ[ピヒ]人への手紙 | [ピヒ]リ[ピヒ]人への書 | フィリ[ピヒ]書 | Phil | フィリ[ピヒ] | [ピヒ]リ[ピヒ]書
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		コロサイの信徒への手紙 | コロサイ人への手紙 | コロサイ人への書 | コロサイ書 | コロサイ | Col
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		テサロニケの信徒への手紙二 | テサロニケ人への第二の手紙 | テサロニケ人への手紙二 | テサロニケ人への後の書 | テサロニケ[\s ]*2 | テサロニケ後書 | 2Thess
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		テサロニケ人への第一の手紙 | テサロニケの信徒への手紙一 | テサロニケ人への手紙一 | テサロニケ人への前の書 | テサロニケ[\s ]*1 | テサロニケ前書 | 1Thess
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		テモテヘの第二の手紙 | テモテへの手紙二 | テモテへの後の書 | テモテ後書 | テモテ[\s ]*2 | 二テモテ | 2Tim
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		テモテヘの第一の手紙 | テモテへの手紙一 | テモテへの前の書 | テモテ前書 | テモテ[\s ]*1 | 一テモテ | 1Tim
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		テトスへのて[がか]み | ティトに達する書 | テトスヘの手紙 | テトスへの手紙 | テトスへの書 | Titus | テトス書 | テトス
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		フィレモンへの手紙 | [ピヒ]レモンヘの手紙 | [ピヒ]レモンへの手紙 | [ピヒ]レモンへの書 | フィレモン書 | [ピヒ]レモン書 | フィレモン | Phlm
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ヘ[ブフ]ライ人への手紙 | ヘ[ブフ]ル人への手紙 | ヘ[ブフ]ル人への書 | ヘ[ブフ]ライ書 | ヘ[ブフ]ライ | ヘ[ブフ]ル書 | Heb
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ヤコ[ブフ]からの手紙 | ヤコ[ブフ]の手紙 | ヤコ[ブフ]の書 | ヤコ[ブフ]書 | ヤコ[ブフ] | Jas
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		[ペヘ]テロの第二の手紙 | [ペヘ]トロの第二の手紙 | [ペヘ]トロの手紙二 | [ペヘ]テロの後の書 | [ペヘ]トロ[\s ]*2 | 2Pet | 二[ペヘ]トロ
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		[ペヘ]テロの第一の手紙 | [ペヘ]トロの第一の手紙 | [ペヘ]トロの手紙一 | [ペヘ]テロの前の書 | [ペヘ]トロ[\s ]*1 | 一[ペヘ]トロ | 1Pet
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ユ[ダタ]からの手紙 | ユ[ダタ]の手紙 | ユ[ダタ]の書 | Jude | ユ[ダタ]
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ト[ビヒ]ト書 | ト[ビヒ]ト記 | Tob | ト[ビヒ]ト
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ユ[デテ]ィト記 | ユ[デテ]ィト | ユ[デテ]ト書 | Jdt
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ワルフの預言書 | [バハ]ルク書 | Bar | [バハ]ルク
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		ス[ザサ]ンナ物語 | ス[ザサ]ンナ | Sus
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		マカ[ビヒ]ー第二書 | マカ[バハ]イ[\s ]*2 | マカ[バハ]イ記下 | マカ[バハ]イ記2 | マカ[バハ]イ下 | 2Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		マカ[ビヒ]ー第三書 | マカ[バハ]イ記3 | マカ[バハ]イ[\s ]*3 | 3Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		マカ[ビヒ]ー第四書 | マカ[バハ]イ記4 | マカ[バハ]イ[\s ]*4 | 4Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		マカ[ビヒ]ー第一書 | マカ[バハ]イ[\s ]*1 | マカ[バハ]イ記上 | マカ[バハ]イ記1 | 1Macc | マカ[バハ]イ上
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
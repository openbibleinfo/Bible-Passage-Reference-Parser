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
				  | [\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014]
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
		(?:Gen|創(?:世記)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Exod|出(?:エ[シジ](?:[フプ]ト記))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ヘベ]ルと[竜龍]|Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lev|レ[ヒビ]記?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Num|民(?:数記)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:[ヘベ]ン・シラの(?:智慧|知恵))|集会の書|Sir|シラ(?:フの子イイススの知恵書|書(?:（集会の書）)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ソロモンの(?:知恵書|智慧)|Wis|知(?:恵(?:の書)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エレミヤの哀歌|Lam|哀歌?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:イエレミヤの達書|エレミヤ(?:の(?:手紙|書翰)|・手)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヨハネの[默黙]示録|Rev|黙示録)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:マナセの(?:いのり|祈[り禱])|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Deut|申(?:命記)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Josh|ヨシュア記?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|士(?:師記?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ruth|ルツ記?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:エ[スズ](?:(?:[トド]ラ第一巻|ラ第一書))|1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:エ[スズ](?:(?:[トド]ラ第二巻|ラ第二書))|2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isa|イ[サザ]ヤ書?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:列王記第二巻|サムエル(?:[\s\xa0]*2|後書|記下|下)|2Sam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:列王記第一巻|サムエル(?:[\s\xa0]*1|前書|記上|上)|1Sam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:2Kgs|列(?:王(?:[\s\xa0]*2|紀(?:略下|下)|記(?:第四巻|下))|下))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:1Kgs|列(?:王(?:[\s\xa0]*1|紀(?:略上|上)|記(?:第三巻|上))|上))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:2Chr|歴(?:代(?:史下|志(?:略下|下)|誌(?:[\s\xa0]*2|下))|下))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:1Chr|歴(?:代(?:史上|志(?:略上|上)|誌(?:[\s\xa0]*1|上))|上))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ezra|エ[スズ]ラ[書記]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ネヘミヤ記?|Neh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エステル(?:書殘篇|記補遺)|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esth|エステル[書記]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Job|ヨ[フブ]記?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ps|詩(?:篇(?:/聖詠)?|編)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ア[サザ]ルヤの祈り|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prov|箴言|格(?:言の書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|コヘレト(?:の(?:こと[はば]|言葉))?|伝道の書|傳道之書)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:SgThree|三(?:人の若者の賛歌|童兒の歌))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|諸歌の歌|雅歌?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヱレミヤ記|エレミヤ書?|Jer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エ[セゼ]キエル書?|Ezek)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[タダ]ニエル書?|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hos|ホセア(?:しょ|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:よえるしょ|Joel|ヨエル書?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Amos|アモス(?:しょ|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Obad|オ(?:[ハバ](?:[テデ](?:ア書|ヤ(?:しょ|書)?))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|ヨナ(?:しょ|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mic|ミカ(?:しょ|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Nah|ナホム(?:しょ|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ハ(?:[ハバ]クク(?:しょ|書)?)|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|[セゼ](?:(?:[ハパ]ニヤ書|ファ(?:ニ(?:ヤ(?:しょ|書)|ア書?))?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag|ハ(?:[カガ]イ(?:しょ|書)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zech|(?:[セゼ]カリヤ(?:しょ|書)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal|マラ(?:キ書?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Matt|マタイ(?:による福音書|傳福音書|福音書|[伝書]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mark|マルコ(?:による福音書|傳福音書|福音書|[伝書]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Luke|ルカ(?:による福音書|傳福音書|福音書|[伝書])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:1John|ヨハネ(?:の(?:第一の(?:手紙|書)|手紙一)|[\s\xa0]*1)|一ヨハネ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:2John|ヨハネ(?:の(?:第二の(?:手紙|書)|手紙二)|[\s\xa0]*2)|二ヨハネ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:3John|ヨハネ(?:の(?:第三の(?:手紙|書)|手紙三)|[\s\xa0]*3)|三ヨハネ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:John|ヨハネ(?:による福音書|傳福音書|福音書|伝))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|使徒(?:言行録|行[伝傳録]|書)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rom|ロ(?:マ人への書|ーマ(?:の信徒への手紙|人への手紙|書)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:コリント(?:の信徒への手紙二|人への(?:第二の手紙|後の書|手紙二)|[\s\xa0]*2|後書)|2Cor)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:コリント(?:の信徒への手紙一|人への(?:第一の手紙|前の書|手紙一)|[\s\xa0]*1|前書)|1Cor)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:[カガ]ラテヤ(?:の信徒への手紙|人への(?:手紙|書)|書)?)|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:エ(?:フェソ(?:の信徒への手紙|人への手紙|書)?|(?:[ヘペ]ソ(?:人への(?:手紙|書)|書)))|Eph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil|(?:[ヒピ]リ(?:[ヒピ](?:人への(?:手紙|書)|書)))|フィリ(?:[ヒピ](?:の信徒への手紙|人への手紙|書)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:コロサイ(?:の信徒への手紙|人への(?:手紙|書)|書)?|Col)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テサロニケ(?:の信徒への手紙二|人への(?:第二の手紙|後の書|手紙二)|[\s\xa0]*2|後書)|2Thess)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テサロニケ(?:の信徒への手紙一|人への(?:第一の手紙|前の書|手紙一)|[\s\xa0]*1|前書)|1Thess)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テモテ(?:ヘの第二の手紙|への(?:後の書|手紙二)|[\s\xa0]*2|後書)|2Tim|二テモテ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:テモテ(?:ヘの第一の手紙|への(?:前の書|手紙一)|[\s\xa0]*1|前書)|1Tim|一テモテ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Titus|テ(?:ィトに達する書|トス(?:ヘの手紙|への(?:て[かが]み|手紙|書)|書)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:[ヒピ]レモン(?:ヘの手紙|への(?:手紙|書)|書))|フィレモン(?:への手紙|書)?|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ヘ(?:[フブ](?:ライ(?:人への手紙|書)?|ル(?:人への(?:手紙|書)|書)))|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jas|ヤコ(?:[フブ](?:からの手紙|の(?:手紙|書)|書)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:(?:[ヘペ](?:テロの(?:第二の手紙|後の書)|トロ(?:の(?:第二の手紙|手紙二)|[\s\xa0]*2)))|2Pet|二[ヘペ]トロ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:(?:[ヘペ](?:テロの(?:第一の手紙|前の書)|トロ(?:の(?:第一の手紙|手紙一)|[\s\xa0]*1)))|1Pet|一[ヘペ]トロ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jude|ユ(?:[タダ](?:からの手紙|の(?:手紙|書))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tob|ト[ヒビ]ト[書記]?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ユ(?:[テデ](?:ィト記?|ト書))|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ワルフの預言書|Bar|[ハバ]ルク書?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ス(?:[サザ]ンナ(?:物語)?)|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:2Macc|マカ(?:[ヒビ]ー第二書|(?:[ハバ]イ(?:[\s\xa0]*2|記[2下]|下))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:マカ(?:[ヒビ]ー第三書|[ハバ]イ(?:[\s\xa0記]*3))|3Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:マカ(?:[ヒビ]ー第四書|[ハバ]イ(?:[\s\xa0記]*4))|4Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ豈-舘並-龎])(
		(?:1Macc|マカ(?:[ヒビ]ー第一書|(?:[ハバ]イ(?:[\s\xa0]*1|記[1上]|上))))
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

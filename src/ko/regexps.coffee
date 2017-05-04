bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | and | ff | 장 | ～ | ~ | 절
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
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎]"

bcv_parser::regexps.first = "1\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "2\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "3\\.?#{bcv_parser::regexps.space}*"
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
		(?:창(?:세기|세)?|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:출애굽|탈출)기|탈?출|Exod)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:벨과[\s\xa0]*[뱀용]|Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:민(?:수기|수)?|Num)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:벤시(?:라(?:크의?|의)?|리크의)[\s\xa0]*지혜|Sir|집회서|집회)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:지혜서?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:예레미(?:야[\s\xa0]*?|아)애가|Lam|애가|애)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:예레미야의[\s\xa0]*편지|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:요한(?:[\s\xa0]*[계묵]|[계묵])시록|묵시|계|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:므나쎄의[\s\xa0]*기도|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:신(?:명기|명)?|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:여호(?:수아기?)?|Josh|수)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:판관기|삿|사사기|판관|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ruth|룻기?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:에스드라[\s\xa0]*1서|1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:에스드라[\s\xa0]*2서|2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:이사(?:야서?)?|Isa|사)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:사무엘(?:기(?:[\s\xa0]*하권|하)|[\s\xa0]*?하)|2(?:Sam|사무)|삼하)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:사무엘(?:기(?:[\s\xa0]*상권|상)|[\s\xa0]*?상)|1(?:Sam|사무)|삼상)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:2(?:Kgs|열왕)|왕하|열왕기(?:[\s\xa0]*하권?|하))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:1(?:Kgs|열왕)|왕상|열왕기(?:[\s\xa0]*상권?|상))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:역대(?:기[\s\xa0]*하권?|지?하)|2(?:Chr|역대)|대하)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:역대(?:기[\s\xa0]*상권?|지?상)|1(?:Chr|역대)|대상)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:에스[겔텔][\s\xa0]*추가본|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:에(?:스(?:더기|텔|더|테르기)?)?|Esth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:느(?:헤(?:미(?:야기?|아))?)?|Neh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Job|욥기?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:시편?|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Prov|잠언?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:사도행전|행|사도|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:전도서|코헬렛|코헬|전|Eccl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:예레(?:미(?:야서?|아))?|Jer|렘)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:필레(?:몬(?:에게[\s\xa0]*보낸[\s\xa0]*서간|서))?|빌레몬서|본|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:레(?:위기|위)?|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:에(?:제(?:키엘서?)?|스겔서?)|Ezek|겔)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:다니(?:엘서?)?|Dan|단)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:호(?:세(?:아서?)?)?|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:요엘서|욜|요엘|Joel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:아모스서|암|아모스?|Amos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:에[스즈]라기)|(?:에[스즈]라|스|에즈|Ezra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:오바(?:댜서|디야|댜|드야서)?|Obad|옵)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:요나서|욘|요나|Jonah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:미(?:[가카]서|[가카])?|Mic)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sus|수산나)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:나(?:훔서|훔)?|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:하(?:바(?:쿡서|꾹)?|박국서?)|Hab|합)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:스바(?:니야서?|냐서?)?|Zeph|습)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:하(?:까(?:이서)?|깨)|Hag|학개서|학개?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:즈(?:카(?:르야서)?|가리야)|스가랴서|슥|Zech|스가랴)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:말(?:라(?:기서?|키서)?)?|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:갈(?:라(?:티아[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*서간|디아서)?)?|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|아가?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:마(?:태(?:오[\s\xa0]*복음서?|복음서?)?)?|Matt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:마(?:르(?:코[\s\xa0]*복음서?)?|가(?:복음서?)?)|Mark|막)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:누가복음서?)|(?:루카(?:[\s\xa0]*복음서?)?|Luke|누가|눅)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:요(?:한(?:의[\s\xa0]*첫째[\s\xa0]*서간|[1일]서)|일)|1(?:John|요한))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:요(?:한(?:의[\s\xa0]*둘째[\s\xa0]*서간|[2이]서)|이)|2(?:John|요한))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:요(?:한(?:의[\s\xa0]*셋째[\s\xa0]*서간|[3삼]서)|삼)|3(?:John|요한))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:요(?:한(?:[\s\xa0]*복음서?|복음서?)?)?|John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:로마(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*서간|서)?|Rom|롬)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:코린토(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*둘째[\s\xa0]*서간|2서)|2(?:Cor|코린)|고후|고린도[2후]서)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:코린토(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*첫째[\s\xa0]*서간|1서)|1(?:Cor|코린)|고전|고린도[1전]서)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:에(?:페(?:소(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*서간|서))?|베소서)|Eph|엡)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:필리(?:피(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*서간|서))?|Phil|빌립보서|빌)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:콜로(?:새(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*서간|서))?|골로새서|Col|골)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:2(?:Thess|테살)|살후|데살로니가[2후]서|테살로니카(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*둘째[\s\xa0]*서간|2서))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:1(?:Thess|테살)|살전|데살로니가[1전]서|테살로니카(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*첫째[\s\xa0]*서간|1서))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:2(?:Tim|티모)|딤후|디모데[2후]서|티모테오(?:에게[\s\xa0]*보낸[\s\xa0]*둘째[\s\xa0]*서간|2서))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:1(?:Tim|티모)|딤전|디모데[1전]서|티모테오(?:에게[\s\xa0]*보낸[\s\xa0]*첫째[\s\xa0]*서간|1서))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:티토(?:에게[\s\xa0]*보낸[\s\xa0]*서간|서)?|Titus|디도서|딛)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:히(?:브(?:리(?:인들에게[\s\xa0]*보낸[\s\xa0]*서간|서))?)?|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:야고(?:보(?:[\s\xa0]*서간|서))?|Jas|약)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:베드로(?:의[\s\xa0]*둘째[\s\xa0]*서간|[2후]서)|2(?:Pet|베드)|벧후)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:베드로(?:의[\s\xa0]*첫째[\s\xa0]*서간|[1전]서)|1(?:Pet|베드)|벧전)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:유(?:다(?:[\s\xa0]*서간|서)?)?|Jude)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:토(?:비트|빗기|빗)|Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:유딧기?|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:바룩서?|Bar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:마카베오(?:기[\s\xa0]*하권|하)|2(?:Macc|마카))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:3(?:Macc|마카)|마카베오[\s\xa0]*3서)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:4(?:Macc|마카)|마카베오[\s\xa0]*4서)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-Ɀ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꜣ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ가-힯豈-舘並-龎])(
		(?:마카베오(?:기[\s\xa0]*상권|상)|1(?:Macc|마카))
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

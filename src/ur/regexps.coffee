bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | ابواب | آیات | باب | آیت | ff | تا | ، | ؛ | ۔
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
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ]"

bcv_parser::regexps.first = "(?:اوّل|[۱1]|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:دوم|[۲2]|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:تیسرا|[۳3]|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|(?:،|؛|۔)|تا)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|تا)"
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
		(?:پ(?:یدا[ئی]|يدائ|َیدای)ش|Gen|pīdāyiš)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:خ(?:ُرُ|ر)وج|ḫurūj|Exod)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:احبار|Lev|iḥbār)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:گِ?نتی|Num|gintī)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sir)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:nūḥ\xE2|Lam|نَ?وحہ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ی(?:ُو(?:[\s\xa0]*حنّا[\s\xa0]*عارِف[\s\xa0]*کا[\s\xa0]*مُ|حنا[\s\xa0]*عارف[\s\xa0]*کا[\s\xa0]*م)|و[\s\xa0]*حنا[\s\xa0]*عارف[\s\xa0]*کا[\s\xa0]*م)کاشفہ|مکاشفہ|Rev|مُکاشفہ|yūḥannā[\s\xa0]*ʿārif[\s\xa0]*kā[\s\xa0]*mukāšaf\xE2)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ا(?:ِستِثنا|ستثناء)|Deut|استثنا|istis̱nā)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:یشُ?وع|Josh|yašūʿ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ق(?:ضا[ةہۃ]|ُضاۃ)|Judg|qużāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:رُ?وت|rūt|Ruth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ی(?:سع|عس)یاہ|Isa|yasaʿyāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:[\s\xa0]*samūʾīl|Sam|۔سموایل|[\s\xa0]*سموئیل|\-?سموئیل)|(?:2\.|۲)(?:[\s\xa0\-?]*سموئ|۔سموا)یل|دوم(?:[\s\xa0\-?]*سموئ|۔سموا)یل)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:(?:\-?سموئ|۔سموا)یل|[\s\xa0]*samūʾīl|Sam|[\s\xa0]*سموئ[يی]ل)|(?:1\.|۱)(?:(?:\-?سموئ|۔سموا)ی|[\s\xa0]*سموئ[يی])ل|اوّل(?:(?:\-?سموئ|۔سموا)ی|[\s\xa0]*سموئ[يی])ل)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:[\s\xa0]*salāṭīn|Kgs|[\s\xa0۔]*سلاطین|\-?سلاطِین)|(?:2\.|۲)(?:[\s\xa0۔]*سلاط|\-?سلاطِ)ین|دوم(?:[\s\xa0۔]*سلاط|\-?سلاطِ)ین)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:[\s\xa0]*salāṭīn|Kgs|[\s\xa0۔]*سلاطین|\-?سلاطِین)|(?:1\.|۱)(?:[\s\xa0۔]*سلاط|\-?سلاطِ)ین|اوّل(?:[\s\xa0۔]*سلاط|\-?سلاطِ)ین)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:(?:[\s\xa0]*تو[\s\xa0]*|۔تو)اریخ|[\s\xa0]*tavārīḫ|Chr|\-?[\s\xa0]*توارِیخ)|(?:2\.|۲)(?:(?:[\s\xa0]*تو[\s\xa0]*|۔تو)ار|\-?[\s\xa0]*توارِ)یخ|دوم(?:(?:[\s\xa0]*تو[\s\xa0]*|۔تو)ار|\-?[\s\xa0]*توارِ)یخ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:[\s\xa0]*tavārīḫ|Chr|[\s\xa0۔]*تواریخ|\-?توارِیخ)|(?:1\.|۱)(?:[\s\xa0۔]*توار|\-?توارِ)یخ|اوّل(?:[\s\xa0۔]*توار|\-?توارِ)یخ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:عز[\s\xa0]*?را|Ezra|ʿizrā)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:نحمیاہ|Neh|niḥimyāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esth|آستر|ایستر|āstar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ای(?:ُّ|ّ)?وب|(?:ayyū|Jo)b)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:زبُ?ور|Ps|زبُو|zabūr)
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
		(?:اَ?مثال|Prov|ams̱āl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|vāʿẓ|واعِ?ظ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:غزلُ?[\s\xa0]*الغزلات|Song|ġazalu[\s\xa0]*l\-?ġazalāt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:یرمِ?یاہ|Jer|yirmayāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ح(?:زقی[\s\xa0‌]*|ِزقی[\s\xa0]*)ایل|ḥiziqīʾīl|Ezek)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:دانی(?:[\s\xa0‌]*ای|ا)ل|dānīʾīl|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ہو(?:سیع(?:َِ)?|[\s\xa0]*سیعاہ)|hūsīʿ|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:yōʾī|Joe)l|یُ?وایل)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:ʿāmō|Amo)s|عامُ?وس)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:عبدیاہ|Obad|ʿabadiyāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ی(?:ُوناہ|ونس)|Jonah|yūnas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:mīkāh|Mic|مِ?یکاہ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:نا(?:[\s\xa0]*حُ|حُ?)وم|nāḥūm|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:حبق(?:ُّ|ّ)?وق|Hab|ḥabaqqūq)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:صفنیاہ|Zeph|ṣafaniyāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:حج(?:يّ|ی|َّی)|Hag|ḥajjai)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:زکریاہ?|Zech|zakariyāh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:malākī)|(?:ملاکی|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:mattī[\s\xa0]*kī[\s\xa0]*injīl)|(?:مت(?:ّی(?:[\s\xa0]*کی[\s\xa0]*انجیل)?|ی(?:[\s\xa0]*کی[\s\xa0]*انجیل)?)|Matt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:مرقُ?س[\s\xa0]*کی[\s\xa0]*انجیل|Mark|مرقس|marqus[\s\xa0]*kī[\s\xa0]*injīl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ل(?:ُوقا(?:[\s\xa0]*کی[\s\xa0]*انجیل)?|وقا(?:[\s\xa0]*کی[\s\xa0]*انجیل)?)|lūqā[\s\xa0]*kī[\s\xa0]*injīl|Luke)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:2\.|۲)(?:\-?یُوحنّ|۔یوحن|[\s\xa0]*یُ?وحنّ)ا|2(?:۔یوحنا|John|\-?یُوحنّا|[\s\xa0]*یُ?وحنّا)|دوم(?:\-?یُوحنّ|۔یوحن|[\s\xa0]*یُ?وحنّ)ا|ی(?:وحن(?:ا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام|ّا[\s\xa0]*کا[\s\xa0]*دوسرا)|ُوحنّا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام)[\s\xa0]*خط|yūḥannā[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:3\.|۳)(?:\-?یُوحنّ|۔یوحن|[\s\xa0]*یُ?وحنّ)ا|3(?:۔یوحنا|John|\-?یُوحنّا|[\s\xa0]*یُ?وحنّا)|تیسرا(?:\-?یُوحنّ|۔یوحن|[\s\xa0]*یُ?وحنّ)ا|ی(?:وحن(?:ّا[\s\xa0]*کا[\s\xa0]*(?:تیسرا|3\.|۳|3)|ا[\s\xa0]*کا[\s\xa0]*تیسرا[\s\xa0]*عام)|ُوحنّا[\s\xa0]*کا[\s\xa0]*تیسرا[\s\xa0]*عام)[\s\xa0]*خط|yūḥannā[\s\xa0]*kā[\s\xa0]*tīsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:1\.|۱)(?:\-?یُوحنّ|۔یوحن|[\s\xa0]*یُ?وحنّ)ا|1(?:۔یوحنا|John|\-?یُوحنّا|[\s\xa0]*یُ?وحنّا)|اوّل(?:\-?یُوحنّ|۔یوحن|[\s\xa0]*یُ?وحنّ)ا|ی(?:وحنّ?|ُوحنّ)ا[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عام[\s\xa0]*خط|yūḥannā[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ی(?:ُوحنّ|وحن)ا[\s\xa0]*کی[\s\xa0]*انجیل|John|ی(?:ُوحنّ|وحن)ا|yūḥannā[\s\xa0]*kī[\s\xa0]*injīl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:اعمال|Acts|اَعمال|یوحنا[\s\xa0]*کے[\s\xa0]*اعمال|رسُ?ولوں[\s\xa0]*کے[\s\xa0]*اعمال|رسولوں|rasūlōṅ[\s\xa0]*ke[\s\xa0]*aʿmāl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ر(?:ومیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسول[\s\xa0]*)?کا[\s\xa0]*خط)?|ُومِیوں)|rōmiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Rom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:[\s\xa0]*کرنتھ(?:ِیُ|ی)وں|Cor|۔کرنتھیوں|[\s\xa0]*کُرنتھِیوں|\-?کُرِنتھِیوں)|(?:2\.|۲)(?:[\s\xa0]*کرنتھ(?:ِیُ|ی)|۔کرنتھی|[\s\xa0]*کُرنتھِی|\-?کُرِنتھِی)وں|دوم(?:[\s\xa0]*کرنتھ(?:ِیُ|ی)|۔کرنتھی|[\s\xa0]*کُرنتھِی|\-?کُرِنتھِی)وں|kurintʰiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|ک(?:رنتھ(?:ِیُوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|یوں[\s\xa0]*کے[\s\xa0]*نام)|ُرِنتھِیوں[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:[\s\xa0]*کرنتھِیُوں|Cor|۔کرنتھیوں|[\s\xa0]*کُرنتھِیوں|\-?کُرِنتھِیوں)|(?:1\.|۱)(?:[\s\xa0]*کرنتھِیُ|۔کرنتھی|[\s\xa0]*کُرنتھِی|\-?کُرِنتھِی)وں|اوّل(?:[\s\xa0]*کرنتھِیُ|۔کرنتھی|[\s\xa0]*کُرنتھِی|\-?کُرِنتھِی)وں|kurintʰiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|ک(?:رنتھ(?:ِیُوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|یوں[\s\xa0]*کے[\s\xa0]*نام)|ُرِنتھِیوں[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:گلت(?:یوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولُس[\s\xa0]*رسول[\s\xa0]*)?کا[\s\xa0]*خط)?|ِیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|galatiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ا(?:فسیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پو[\s\xa0]*لس[\s\xa0]*رسول[\s\xa0]*)?کا[\s\xa0]*خط)?|ِف(?:ِسِیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط|سِ?یوں))|ifisiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Eph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ف(?:ِل(?:ِپ(?:ّیُوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پو[\s\xa0]*لس[\s\xa0]*رسُول[\s\xa0]*کا[\s\xa0]*خط)?|ِّیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)|پّیوں)|لپیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|filippiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Phil)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ک(?:ُل(?:ِسّیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولُس[\s\xa0]*رسُول[\s\xa0]*کا[\s\xa0]*خط)?|ُسِّیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط|س[ِّ]یوں)|لسیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|kulussiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Col)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:(?:[\s\xa0]*تھسّ|۔تھس)لنیکیوں|[\s\xa0]*تھسلنیکوں|Thess|[\s\xa0]*تھِسلُنیکیوں|\-?تھِسّلُنیکیوں)|(?:2\.|۲)(?:(?:[\s\xa0]*تھسّ|۔تھس)لنیکی|[\s\xa0]*تھسلنیک|[\s\xa0]*تھِسلُنیکی|\-?تھِسّلُنیکی)وں|دوم(?:(?:[\s\xa0]*تھسّ|۔تھس)لنیکی|[\s\xa0]*تھسلنیک|[\s\xa0]*تھِسلُنیکی|\-?تھِسّلُنیکی)وں|tʰissalunīkiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|تھ(?:سلنیک(?:وں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پو[\s\xa0]*لس[\s\xa0]*رسول[\s\xa0]*کا|یوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*)|ِسّلُنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*)دوسرا[\s\xa0]*خط)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:(?:[\s\xa0]*تھسّ|۔تھس)لنیکیوں|Thess|[\s\xa0]*تھِسلُنیکیوں|\-?تھِسّلُنیکیوں)|(?:1\.|۱)(?:(?:[\s\xa0]*تھسّ|۔تھس)ل|[\s\xa0]*تھِسلُ|\-?تھِسّلُ)نیکیوں|اوّل(?:(?:[\s\xa0]*تھسّ|۔تھس)ل|[\s\xa0]*تھِسلُ|\-?تھِسّلُ)نیکیوں|tʰissalunīkiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|تھ(?:س(?:ّلنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|لنیکیوں[\s\xa0]*کے[\s\xa0]*نام)|ِسّلُنیکیوں[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:2\.|۲)(?:[\s\xa0]*ت(?:ی(?:ِمُتھِیُ|مِتھُی)|ِیمُتھِیُ)|\-?تِیمُتھِیُ|۔تیمتھی)س|2(?:[\s\xa0]*ت(?:ی(?:ِمُتھِیُ|مِتھُی)|ِیمُتھِیُ)س|\-?تِیمُتھِیُس|۔تیمتھیس|Tim)|دوم(?:[\s\xa0]*ت(?:ی(?:ِمُتھِیُ|مِتھُی)|ِیمُتھِیُ)|\-?تِیمُتھِیُ|۔تیمتھی)س|tīmutʰiyus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|ت(?:ی(?:ِمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|متھیس[\s\xa0]*کے[\s\xa0]*نام)|ِیمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:1\.|۱)(?:[\s\xa0]*ت(?:ِیمُتھِیُ|یمِتھُی)|\-?تِیمُتھِیُ|۔تیمتھی)س|1(?:\-?تِیمُتھِیُس|۔تیمتھیس|Tim|[\s\xa0]*ت(?:ِیمُتھِیُ|یمِتھُی)س)|اوّل(?:[\s\xa0]*ت(?:ِیمُتھِیُ|یمِتھُی)|\-?تِیمُتھِیُ|۔تیمتھی)س|tīmutʰiyus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|ت(?:ِیمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولُس[\s\xa0]*رسول[\s\xa0]*)?|یمتھیس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*)کا[\s\xa0]*پہلا[\s\xa0]*خط)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ط(?:ِطُس(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسُول[\s\xa0]*)?کا[\s\xa0]*خط)?|طس(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|ṭiṭus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Titus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ف(?:لیمون(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسُول[\s\xa0]*)?کا[\s\xa0]*خط)?|ِلیمون(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|filēmōn[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ع(?:برانیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسول[\s\xa0]*)?کا[\s\xa0]*خط)?|ِبرانیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|ʿibrāniyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:یعق(?:وب[\s\xa0]*کا[\s\xa0]*عا[\s\xa0]*?|ُوب[\s\xa0]*کا[\s\xa0]*عا)م[\s\xa0]*خط|يعقوب|Jas|یعقُ?وب|yaʿqūb[\s\xa0]*kā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:2\.|۲)(?:[\-?۔]پطر|[\s\xa0]*پطر[\s\xa0]*?)س|2(?:[\-?۔]پطرس|Pet|[\s\xa0]*پطر[\s\xa0]*?س)|دوم(?:[\-?۔]پطر|[\s\xa0]*پطر[\s\xa0]*?)س|پطرس[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام[\s\xa0]*خط|paṭras[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:1\.|۱)(?:[\-?۔]پطر|[\s\xa0]*پطر[\s\xa0]*?)س|1(?:[\-?۔]پطرس|Pet|[\s\xa0]*پطر[\s\xa0]*?س)|اوّل(?:[\-?۔]پطر|[\s\xa0]*پطر[\s\xa0]*?)س|پطر(?:[\s\xa0]*س[\s\xa0]*کاپہلا[\s\xa0]*عا[\s\xa0]*|س[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عا)م[\s\xa0]*خط|paṭras[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:یہُ?وداہ[\s\xa0]*کا[\s\xa0]*عام[\s\xa0]*خط|Jude|یہُ?وداہ|yahūdāh[\s\xa0]*kā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:3Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:4Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1Macc)
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

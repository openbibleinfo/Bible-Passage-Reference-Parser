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
				  | [\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014]
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
		(?:pīdāyiš|پ(?:َیدایش|يدائش|یدا[ئی]ش)|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ḫurūj|Exod|خ(?:ُرُوج|روج))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:iḥbār|احبار|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:gintī|گ(?:ِنتی|نتی)|Num)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sir
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Wis
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:nūḥâ|ن(?:َوحہ|وحہ)|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		EpJer
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yūḥannā[\s\xa0]*ʿārif[\s\xa0]*kā[\s\xa0]*mukāšafâ|ی(?:و[\s\xa0]*حنا[\s\xa0]*عارف[\s\xa0]*کا[\s\xa0]*مکاشفہ|ُو(?:[\s\xa0]*حنّا[\s\xa0]*عارِف[\s\xa0]*کا[\s\xa0]*مُکاشفہ|حنا[\s\xa0]*عارف[\s\xa0]*کا[\s\xa0]*مکاشفہ))|م(?:ُکاشفہ|کاشفہ)|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		PrMan
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:istis̱nā|ا(?:ِستِثنا|ستثناء?)|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yašūʿ|Josh|یش(?:ُوع|وع))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:qużāh|Judg|ق(?:ُضاۃ|ضا[ةہۃ]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ruth|rūt|ر(?:ُوت|وت))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		1Esd
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		2Esd
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yasaʿyāh|ی(?:سعیاہ|عسیاہ)|Isa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:دوم(?:[\s\xa0\-?]*سموئیل|۔سموایل)|۲(?:[\s\xa0\-?]*سموئیل|۔سموایل)|2(?:\.(?:[\s\xa0\-?]*سموئیل|۔سموایل)|[\s\xa0]*(?:samūʾīl|سموئیل)|-?سموئیل|۔سموایل|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:اوّل(?:[\s\xa0]*سموئ[يی]ل|-?سموئیل|۔سموایل)|۱(?:[\s\xa0]*سموئ[يی]ل|-?سموئیل|۔سموایل)|1(?:\.(?:[\s\xa0]*سموئ[يی]ل|-?سموئیل|۔سموایل)|[\s\xa0]*(?:samūʾīl|سموئ[يی]ل)|-?سموئیل|۔سموایل|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:دوم(?:-?سلاطِین|[\s\xa0۔]*سلاطین)|۲(?:-?سلاطِین|[\s\xa0۔]*سلاطین)|2(?:-?سلاطِین|\.(?:-?سلاطِین|[\s\xa0۔]*سلاطین)|[\s\xa0]*(?:salāṭīn|سلاطین)|۔سلاطین|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:اوّل(?:-?سلاطِین|[\s\xa0۔]*سلاطین)|۱(?:-?سلاطِین|[\s\xa0۔]*سلاطین)|1(?:-?سلاطِین|\.(?:-?سلاطِین|[\s\xa0۔]*سلاطین)|[\s\xa0]*(?:salāṭīn|سلاطین)|۔سلاطین|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:دوم(?:-?[\s\xa0]*توارِیخ|[\s\xa0]*تو[\s\xa0]*اریخ|۔تواریخ)|۲(?:-?[\s\xa0]*توارِیخ|[\s\xa0]*تو[\s\xa0]*اریخ|۔تواریخ)|2(?:-?[\s\xa0]*توارِیخ|[\s\xa0]*(?:tavārīḫ|تو[\s\xa0]*اریخ)|\.(?:-?[\s\xa0]*توارِیخ|[\s\xa0]*تو[\s\xa0]*اریخ|۔تواریخ)|۔تواریخ|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:اوّل(?:-?توارِیخ|[\s\xa0۔]*تواریخ)|۱(?:-?توارِیخ|[\s\xa0۔]*تواریخ)|1(?:-?توارِیخ|\.(?:-?توارِیخ|[\s\xa0۔]*تواریخ)|[\s\xa0]*(?:tavārīḫ|تواریخ)|۔تواریخ|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ʿizrā|Ezra|عز(?:[\s\xa0]*را|را))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:niḥimyāh|نحمیاہ|Neh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		GkEsth
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:āstar|ایستر|Esth|آستر)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ayyūb|ای(?:ُّوب|ّوب|وب)|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:zabūr|زب(?:ور|ُور?)|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		PrAzar
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ams̱āl|ا(?:َمثال|مثال)|Prov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|vāʿẓ|واع(?:ِظ|ظ))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		SgThree
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ġazalu[\s\xa0]*l-?ġazalāt|غزل(?:ُ[\s\xa0]*الغزلات|[\s\xa0]*الغزلات)|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yirmayāh|یرم(?:ِیاہ|یاہ)|Jer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ḥiziqīʾīl|ح(?:ِزقی[\s\xa0]*ایل|زقی[\s\xa0‌]*ایل)|Ezek)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:dānīʾīl|دانی(?:[\s\xa0‌]*ایل|ال)|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:hūsīʿ|ہو(?:[\s\xa0]*سیعاہ|سیع(?:َِ)?)|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yōʾīl|ی(?:ُوایل|وایل)|Joel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ʿāmōs|عام(?:ُوس|وس)|Amos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ʿabadiyāh|عبدیاہ|Obad)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|yūnas|ی(?:ُوناہ|ونس))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:mīkāh|م(?:ِیکاہ|یکاہ)|Mic)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:nāḥūm|نا(?:[\s\xa0]*حُوم|ح(?:ُوم|وم))|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ḥabaqqūq|حبق(?:ُّوق|ّوق|وق)|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ṣafaniyāh|صفنیاہ|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ḥajjai|Hag|حج(?:َّی|يّ|ی))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:zakariyāh|زکریاہ?|Zech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:malākī|ملاکی|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:mattī[\s\xa0]*kī[\s\xa0]*injīl|Matt|مت(?:ّی(?:[\s\xa0]*کی[\s\xa0]*انجیل)?|ی(?:[\s\xa0]*کی[\s\xa0]*انجیل)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:marqus[\s\xa0]*kī[\s\xa0]*injīl|Mark|مرق(?:ُس[\s\xa0]*کی[\s\xa0]*انجیل|س(?:[\s\xa0]*کی[\s\xa0]*انجیل)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:lūqā[\s\xa0]*kī[\s\xa0]*injīl|Luke|ل(?:ُوقا(?:[\s\xa0]*کی[\s\xa0]*انجیل)?|وقا(?:[\s\xa0]*کی[\s\xa0]*انجیل)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:yūḥannā[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|ی(?:ُوحنّا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام[\s\xa0]*خط|وحن(?:ا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام[\s\xa0]*خط|ّا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط))|دوم(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|۲(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|2(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|\.(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|۔یوحنا|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:yūḥannā[\s\xa0]*kā[\s\xa0]*tīsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|ی(?:ُوحنّا[\s\xa0]*کا[\s\xa0]*تیسرا[\s\xa0]*عام[\s\xa0]*خط|وحن(?:ا[\s\xa0]*کا[\s\xa0]*تیسرا[\s\xa0]*عام[\s\xa0]*خط|ّا[\s\xa0]*کا[\s\xa0]*(?:تیسرا[\s\xa0]*خط|3(?:\.[\s\xa0]*خط|[\s\xa0]*خط)|۳[\s\xa0]*خط)))|تیسرا(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|۳(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|3(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|\.(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|۔یوحنا|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:yūḥannā[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|ی(?:ُوحنّا[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عام[\s\xa0]*خط|وحن(?:ّا[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عام[\s\xa0]*خط|ا[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عام[\s\xa0]*خط))|اوّل(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|۱(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|1(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|\.(?:-?یُوحنّا|[\s\xa0]*ی(?:ُوحنّا|وحنّا)|۔یوحنا)|۔یوحنا|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yūḥannā[\s\xa0]*kī[\s\xa0]*injīl|ی(?:ُوحنّا(?:[\s\xa0]*کی[\s\xa0]*انجیل)?|وحنا(?:[\s\xa0]*کی[\s\xa0]*انجیل)?)|John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:rasūlōṅ[\s\xa0]*ke[\s\xa0]*aʿmāl|یوحنا[\s\xa0]*کے[\s\xa0]*اعمال|رس(?:ُولوں[\s\xa0]*کے[\s\xa0]*اعمال|ولوں(?:[\s\xa0]*کے[\s\xa0]*اعمال)?)|ا(?:َعمال|عمال)|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:rōmiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|ر(?:ُومِیوں|ومیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*خط|کا[\s\xa0]*خط))?)|Rom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:kurintʰiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|ک(?:ُرِنتھِیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|رنتھ(?:ِیُوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|یوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط))|دوم(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:ُرنتھِیوں|رنتھ(?:ِیُوں|یوں))|۔کرنتھیوں)|۲(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:ُرنتھِیوں|رنتھ(?:ِیُوں|یوں))|۔کرنتھیوں)|2(?:-?کُرِنتھِیوں|\.(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:ُرنتھِیوں|رنتھ(?:ِیُوں|یوں))|۔کرنتھیوں)|[\s\xa0]*ک(?:ُرنتھِیوں|رنتھ(?:ِیُوں|یوں))|۔کرنتھیوں|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:kurintʰiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|ک(?:ُرِنتھِیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|رنتھ(?:ِیُوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|یوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط))|اوّل(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:رنتھِیُوں|ُرنتھِیوں)|۔کرنتھیوں)|۱(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:رنتھِیُوں|ُرنتھِیوں)|۔کرنتھیوں)|1(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:رنتھِیُوں|ُرنتھِیوں)|\.(?:-?کُرِنتھِیوں|[\s\xa0]*ک(?:رنتھِیُوں|ُرنتھِیوں)|۔کرنتھیوں)|۔کرنتھیوں|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:galatiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|گلت(?:ِیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?|یوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولُس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*خط|کا[\s\xa0]*خط))?)|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ifisiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|ا(?:ِف(?:ِسِیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط|س(?:ِیوں|یوں))|فسیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پو[\s\xa0]*لس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*خط|کا[\s\xa0]*خط))?)|Eph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:filippiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|ف(?:ِل(?:ِپ(?:ِّیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط|ّیُوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پو[\s\xa0]*لس[\s\xa0]*رسُول[\s\xa0]*کا[\s\xa0]*خط)?)|پّیوں)|لپیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|Phil)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:kulussiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|ک(?:ُل(?:ُسِّیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط|ِسّیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولُس[\s\xa0]*رسُول[\s\xa0]*کا[\s\xa0]*خط)?|س[ِّ]یوں)|لسیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?)|Col)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:tʰissalunīkiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|تھ(?:ِسّلُنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|سلنیک(?:وں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پو[\s\xa0]*لس[\s\xa0]*رسول[\s\xa0]*کادوسرا[\s\xa0]*خط|یوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط))|دوم(?:-?تھِسّلُنیکیوں|۔تھسلنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|س(?:ّلنیکیوں|لنیکوں)))|۲(?:-?تھِسّلُنیکیوں|۔تھسلنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|س(?:ّلنیکیوں|لنیکوں)))|2(?:-?تھِسّلُنیکیوں|\.(?:-?تھِسّلُنیکیوں|۔تھسلنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|س(?:ّلنیکیوں|لنیکوں)))|۔تھسلنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|س(?:ّلنیکیوں|لنیکوں))|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:tʰissalunīkiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|تھ(?:ِسّلُنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|س(?:ّلنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|لنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط))|اوّل(?:-?تھِسّلُنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|سّلنیکیوں)|۔تھسلنیکیوں)|۱(?:-?تھِسّلُنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|سّلنیکیوں)|۔تھسلنیکیوں)|1(?:-?تھِسّلُنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|سّلنیکیوں)|\.(?:-?تھِسّلُنیکیوں|[\s\xa0]*تھ(?:ِسلُنیکیوں|سّلنیکیوں)|۔تھسلنیکیوں)|۔تھسلنیکیوں|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:tīmutʰiyus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|ت(?:ِیمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|ی(?:ِمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|متھیس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط))|دوم(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|ی(?:ِمُتھِیُس|مِتھُیس))|۔تیمتھیس)|۲(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|ی(?:ِمُتھِیُس|مِتھُیس))|۔تیمتھیس)|2(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|ی(?:ِمُتھِیُس|مِتھُیس))|\.(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|ی(?:ِمُتھِیُس|مِتھُیس))|۔تیمتھیس)|۔تیمتھیس|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:tīmutʰiyus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|ت(?:ِیمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولُس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|کا[\s\xa0]*پہلا[\s\xa0]*خط)|یمتھیس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط)|اوّل(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|یمِتھُیس)|۔تیمتھیس)|۱(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|یمِتھُیس)|۔تیمتھیس)|1(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|یمِتھُیس)|\.(?:-?تِیمُتھِیُس|[\s\xa0]*ت(?:ِیمُتھِیُس|یمِتھُیس)|۔تیمتھیس)|۔تیمتھیس|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ṭiṭus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|Titus|ط(?:ِطُس(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسُول[\s\xa0]*کا[\s\xa0]*خط|کا[\s\xa0]*خط))?|طس(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:filēmōn[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|ف(?:ِلیمون(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?|لیمون(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسُول[\s\xa0]*کا[\s\xa0]*خط|کا[\s\xa0]*خط))?)|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ʿibrāniyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*ḫaṭ|ع(?:ِبرانیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*خط)?|برانیوں(?:[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولس[\s\xa0]*رسول[\s\xa0]*کا[\s\xa0]*خط|کا[\s\xa0]*خط))?)|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yaʿqūb[\s\xa0]*kā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|يعقوب|یعق(?:ُوب(?:[\s\xa0]*کا[\s\xa0]*عام[\s\xa0]*خط)?|وب(?:[\s\xa0]*کا[\s\xa0]*عا(?:[\s\xa0]*م[\s\xa0]*خط|م[\s\xa0]*خط))?)|Jas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:paṭras[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|پطرس[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام[\s\xa0]*خط|دوم(?:[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس)|۲(?:[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس)|2(?:\.(?:[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس)|[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:paṭras[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|پطر(?:[\s\xa0]*س[\s\xa0]*کاپہلا[\s\xa0]*عا[\s\xa0]*م[\s\xa0]*خط|س[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عام[\s\xa0]*خط)|اوّل(?:[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس)|۱(?:[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس)|1(?:\.(?:[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس)|[\s\xa0]*پطر(?:[\s\xa0]*س|س)|[\-?۔]پطرس|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yahūdāh[\s\xa0]*kā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|یہ(?:ُوداہ(?:[\s\xa0]*کا[\s\xa0]*عام[\s\xa0]*خط)?|وداہ(?:[\s\xa0]*کا[\s\xa0]*عام[\s\xa0]*خط)?)|Jude)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tob
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Jdt
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bar
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Sus
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		2Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		3Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		4Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		1Macc
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

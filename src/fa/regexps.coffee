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
				  | ابواب | فصول | آیات | آیات | باب | فصل | آیت | آیه | ff | تا | ، | ؛ | ۔
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

bcv_parser::regexps.first = "(?:I|یکم|یک|اول|[۱1]|1|Yekom|Yek|Avval)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:II|دو|دوم|[۲2]|2|Do|Dovvom)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:III|سه|سوم|[۳3]|3|Seh|Sevom)\\.?#{bcv_parser::regexps.space}*"
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
		(?:P(?:ida(?:ayishe|(?:iy[ei]|aye|ye|i)sh)|ed(?:a(?:i(?:y(?:ishe|eshh?)|sh)|ayesh)|yesh))|pedāyesh|پ(?:یدا(?:(?:یى|ىی)ش|ي(?:یش|شه)|ی[ثسشچژ]|ىش|ش)|يدا(?:ي(?:یش|شه)|یش))|پ(?:ید(?:ايش|ای?)?|يدايش)|pedāy?|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:khorojī)|(?:Kh(?:or(?:o(?:ou?j|j(?:eh?|y)?)|uj)|(?:aroo|r(?:o[ou]|aw))j)|khor(?:ro|j)|khorr|خر(?:و(?:ُج|ج[هی]|[دچژ])|وو[جچژ]|ا(?:و[جچژ]|ج)|ُ?ج)|خر(?:وج?)?|Exod)|(?:khoroj)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bel(?:[\s\xa0]*and[\s\xa0]*the[\s\xa0]*Dragon)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:leviy)|(?:L(?:a(?:v(?:vyi|[ay]y|i)|w(?:ya|[ae]y|i)|awi)an|ev)|ل(?:ا(?:و(?:ی(?:ان[نهی]|[ای]ان|ین|ت)|يان)|(?:و[ئو]|ؤ)یان|[ءئ]ویان)|ویان)|ل(?:او(?:یان)?|وی)|lawiān|lawiy|lawi?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:adadiān)|(?:adad[iī])|(?:E['’]edaad|A(?:['’](?:edaa|daa?)d|eda(?:d[ad]|ad)|dad)|اع(?:د(?:داد|ا(?:د[دهی]|[او]د|[تذز]))|ت?اد)|E['’]daad|اعد(?:اد?|د)?|Eadad|عداد|Num)|(?:adad)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sir(?:ach)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Wis(?:dom)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:مراثی[\s\xa0]*اِرمیاء[هى])|(?:Marathieh)|(?:Marath(?:i(?:[\s\xa0]*(?:Irm(?:['’]ya(?:ah)?|i(?:yah|aa)|e(?:yah|ia)|(?:iy?|ey)a)|Er(?:y(?:aiyah|aiya|(?:iah|ah|ei)a|i?aah|i?aa|ah?)|m(?:['’]ya(?:ah)?|i(?:yah|aa)|e(?:yah|ia)|(?:iy?|ey)a)))|(?:yya|eya|ye|a)h|yaah|yya|eya|yah|(?:['’]y|y['’])a|y[ay]|ey?|ye|['’]i|a)|['’]iya|['’]iy)|مرا(?:ث(?:ی(?:[\s\xa0]*(?:ا(?:ِرم(?:ی(?:ا(?:ئ[هی]|[ءاهى])|[\s\xa0]*ی[اه]|ی[اه]|[هى])|ي(?:اا|ه)|[\s\xa0]*یا)|رم(?:ی(?:ا(?:ئ?ه|ءی)|[هى])|(?:ی|ي)?[\s\xa0]*یا|یی[اه]|يا))|ی(?:ی[ئاه]|[اهى]))|یئ[\s\xa0]*یی|ئ(?:[\s\xa0]*ی[اهی]|ه)|(?:ى[\s\xa0]*ی|ائ)[هی]|ی[\s\xa0]*ی[اه]|اء?ه|ی(?:ئه|[اه])|ه[اه]|ىه)|ئیه|ي[هى]|ى)|ته?ی)|مرا(?:ث(?:ی(?:[\s\xa0]*(?:ا(?:ِرم[يی]|رمی)ا|یی)|اء?|ه)|ئی|ي|ئ)?)?|marzīyeh|āheng|Lam|āh)|(?:Marathiy?|مراثی(?:یئ|[ئى])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ep(?:istle[\s\xa0]*of[\s\xa0]*Jeremiah|[\s\xa0]*?Jer))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:m(?:ukash(?:efi[ei]|feha|fea)|akashfeha))|(?:m(?:uk(?:ashefi?ah|aashfe(?:vo|hi?|a)|ashef(?:i?a|i)|(?:ashafe|shafa)h|ashaafi|aashefa|a(?:sh(?:afo|efe)|ashfa)|shafe|ashfe)|ak(?:a(?:sh(?:e(?:f(?:i(?:ah|[ei])|o)|ef)|a(?:f(?:eh|[io])|afi)|fe[ai]|hfe)|a(?:sh(?:fe(?:vo|hi?|a)|efa)|ashfe)|sh(?:efia|fe)|hshfe)|shaf(?:ah|e)|(?:sha|hs)afe))|Maka(?:shef(?:e[hiy]|iy|a[ah]|y)|ashf(?:[ei]y|a[ah]))|Makashephi|Maka(?:shef(?:e|i|a)?|ashf(?:[ei]|a)?)|Mikashefe|Mekaashfe|م(?:ک(?:اشف(?:یه|يه|ه[اهؤی]|ةٔ|ات|[ىہ])|شفا?ه)|كاشفه)|yūhannā|vāhyūnn|مک(?:ا(?:ش(?:ف(?:ی|ه|ة|ا)?)?)?|ش)|vāh(?:y(?:ūn?)?)?|Rev)|(?:maka(?:shef(?:ah?|[ei])|ashfa))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pr(?:ayer[\s\xa0]*of[\s\xa0]*Manasseh|[\s\xa0]*?Man))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:es(?:sniyeh|n(?:iyeh?|(?:i[ae]|a)h|yeh))|asnieh)|tsniyeh|ت(?:ثن(?:ی(?:ه[اهی]|[او])|ئ?ه)|[سص]نیه)|تث(?:ن(?:یه?)?)?|Deut|tsn?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:yūsh['’](?:ai|ā)|Y(?:o(?:wshua|sh(?:uah|u['’]a|['’]ua|ua|a))|ushu?a)|yūsh['’]a|یو(?:وش[اع]|ش(?:ع[عهوی]|[ئهوی]ع|ا))|یوشع?|Josh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Da(?:v(?:aran(?:an|e)?|(?:oo)?ran)|w(?:oo|a)ran)|داو(?:[او]ر(?:انه|ن)|ر(?:(?:را)?ن|ا(?:ن[نه]|ان)))|داو(?:[او]ران|ر(?:ان)?)?|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:rūth?ī|R(?:oot[eh]?|ut[hi]?)|rūth|ر(?:و(?:ت[تـهی]|[ثط])|ۆت)|روت)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:[\s\xa0]*Esd(?:ras)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:[\s\xa0]*Esd(?:ras)?|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Ey?shayaa)|(?:I(?:yshaiyah|s(?:haiyah|a))|E(?:ysh(?:(?:eya['’]?|['’]y)a|a(?:y(?:yah|a)|iyah|['’](?:yaa?|iya)|[iy]ya|aya))|sh(?:(?:eya['’]?|['’]y)a|a(?:y(?:yah|a)|iyah|['’](?:yaa?|iya)|[iy]ya|aya)))|ا(?:ش(?:ع(?:یا(?:[\s\xa0]*[يی]ا|[ءئاه])|ي(?:ا(?:[\s\xa0]*[يی]ا|[ءئاه])|[\s\xa0]*یا|[هی]ا|ى)|[\s\xa0]*یاه|ی[\s\xa0]*یا|ی[هی]ا|ی[آى])|[\s\xa0]*?3یا)|(?:[\s\xa0ِ]*شع|یش)یا)|Iy?shayaa|(?:Ay?shai|I(?:ysha['’]|sha['’]))ya|Iy?shaya|esh['’](?:āyā|a)|Ay?shaya|ا(?:شع(?:[\s\xa0]*یا|ی[هی]|ي[هی])|یش)|esh['’]ā|īshiā|īsh)|(?:اشع(?:[يی]ا?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:dovvom[\s\xa0]*samu['’]ī|2Sam(?:w[ei]|u['w’])i|2Samu[ei])l|Do(?:vom(?:[\s\xa0]*Sam(?:o(?:w(?:ey|i)|ue|ei)|(?:w[ei]|u['w’])i|u[ei])l|Sam(?:o(?:w(?:ey|i)|ue|ei)l|(?:(?:w[ei]|u['w’])i|u[ei])l)?)|[\s\xa0]*?sam(?:o(?:w(?:ey|i)|ue|ei)|(?:w[ei]|u['w’])i|u[ei])l)|دو(?:م(?:[\s\xa0]*سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل))|[\s\xa0]*سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل))|دو(?:م(?:[\s\xa0]*سموئیل|س(?:موئیل)?)|[\s\xa0]*?سموئیل)|2[\s\xa0]*Sam(?:o(?:w(?:ey|i)|ue|ei)|(?:w[ei]|u['w’])i|u[ei])l|2[\s\xa0]*سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|۲[\s\xa0]*سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|2Samo(?:w(?:ey|i)|ue|ei)l|2[\s\xa0]*سموئیل|۲[\s\xa0]*سموئیل|(?:[2۲]سموائ|۲سم(?:وء|ؤ)|2سم(?:وء|ؤ)|[2۲]سمئو)یل|[2۲]سموئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل)|[2۲]سموئیل|(?:[2۲]سموی|[2۲]سموا)یل|dovvoms|[2۲]سمویل|۲(?:sā?mu|سامو)|2(?:sā?mu|سامو)|۲(?:سمو?|sm)|2(?:سمو?|sm)|2Sam)|(?:Dovom(?:[\s\xa0]*sam(?:o(?:w(?:ey|i)|ei|ue)|(?:w[ei]|u['w’])i|u[ei])|sam(?:o(?:w(?:ey|i)|ei|ue)|(?:w[ei]|u['w’])i|u[ei]))l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Avval(?:[\s\xa0]*Sam(?:o(?:w(?:ey|i)|ue|ei)|(?:w[ei]|u['w’])i|u[ei])l|Sam(?:o(?:w(?:ey|i)|ue|ei)l|(?:(?:w[ei]|u['w’])i|u[ei])l)?)|(?:avval[\s\xa0]*samu['’]ī|1Sam(?:w[ei]|u['w’])i|1Samu[ei])l|(?:Yek[\s\xa0]*?s|1[\s\xa0]*S)am(?:o(?:w(?:ey|i)|ue|ei)|(?:w[ei]|u['w’])i|u[ei])l|اول(?:[\s\xa0]*سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل))|اول(?:[\s\xa0]*سموئیل|س(?:موئیل)?)|(?:یک|۱)[\s\xa0]*سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|(?:یک|۱)[\s\xa0]*سموئیل|(?:یک|1[\s\xa0]*)سم(?:و(?:(?:ائ|[ای]|ء)?یل|ئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل))|(?:ئو|ؤ)یل)|1Samo(?:w(?:ey|i)|ue|ei)l|(?:یک|1[\s\xa0]*)سموئیل|(?:[1۱]سموائ|۱سم(?:وء|ؤ)|1سم(?:وء|ؤ)|[1۱]سمئو)یل|[1۱]سموئ(?:یل[ہی]|(?:یی|ي)ل|ئیل|ل)|[1۱]سموئیل|(?:[1۱]سموی|[1۱]سموا)یل|[1۱]سمویل|avvals|۱(?:sā?mu|سامو)|1(?:sā?mu|سامو)|۱(?:سمو?|sm)|1(?:سمو?|sm)|1Sam)|(?:Avval(?:[\s\xa0]*sam(?:o(?:w(?:ey|i)|ei|ue)|(?:w[ei]|u['w’])i|u[ei])|sam(?:o(?:w(?:ey|i)|ei|ue)|(?:w[ei]|u['w’])i|u[ei]))l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Do(?:vom(?:[\s\xa0]*Pad(?:eshah(?:na|[ao])|ishaha|shah[ao])n|Pad(?:eshah(?:na|[ao])|ishaha|shah[ao])n|Kgs)|[\s\xa0]*?pad(?:eshah(?:na|[ao])|ishaha|shah[ao])n)|(?:دو(?:م[\s\xa0]*|[\s\xa0]*)?|۲[\s\xa0]*)پادش(?:اه(?:اا?)?|ها)ن|2[\s\xa0]*?Pad(?:eshah(?:na|[ao])|ishaha|shah[ao])n|دومپادش(?:اه(?:اا?)?|ها)ن|(?:دو(?:م[\s\xa0]*|[\s\xa0]*)?|۲[\s\xa0]*)پادشاها|2(?:[\s\xa0]*پادش(?:اه(?:اا?)?|ها)ن|پادشاه(?:اا?)?ن|پادشهان|pādsh)|دومپادشاها|۲(?:پادشاه(?:اا?)?ن|پادشهان|pādsh)|2(?:[\s\xa0]*پادشاها|پادشاها|پا(?:دش?)?|pād?)|۲پادشاها|۲پا(?:دش?)?|دومپ|۲pād?|2Kgs)|(?:Dovom(?:[\s\xa0]*pad(?:eshah(?:na|[ao])|ishaha|shah[ao])|pad(?:eshah(?:na|[ao])|ishaha|shah[ao]))n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Avval(?:[\s\xa0]*Pad(?:eshah(?:na|[ao])|ishaha|shah[ao])n|Pad(?:eshah(?:na|[ao])|ishaha|shah[ao])n|Kgs)|(?:Yek[\s\xa0]*?p|1[\s\xa0]*?P)ad(?:eshah(?:na|[ao])|ishaha|shah[ao])n|(?:اول[\s\xa0]*|(?:یک|۱)[\s\xa0]*|یک)پادش(?:اه(?:اا?)?|ها)ن|اولپادش(?:اه(?:اا?)?|ها)ن|(?:اول[\s\xa0]*|(?:یک|۱)[\s\xa0]*|یک)پادشاها|1(?:[\s\xa0]*پادش(?:اه(?:اا?)?|ها)ن|پادشاه(?:اا?)?ن|پادشهان|pādsh)|اولپادشاها|۱(?:پادشاه(?:اا?)?ن|پادشهان|pādsh)|1(?:[\s\xa0]*پادشاها|پادشاها|پا(?:دش?)?|pād?)|۱پادشاها|۱پا(?:دش?)?|اولپ|۱pād?|1Kgs)|(?:Avval(?:[\s\xa0]*pad(?:eshah(?:na|[ao])|ishaha|shah[ao])|pad(?:eshah(?:na|[ao])|ishaha|shah[ao]))n)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:dovvom(?:[\s\xa0]*tawārikh|t)|(?:Do(?:vom(?:[\s\xa0]*Towar[iy]|Towar[iy])|(?:[\s\xa0]*t|T)owar[iy])|2[\s\xa0]*?Towar[iy])kh|(?:Do(?:vom(?:[\s\xa0]*T(?:aw|o)|T(?:aw|o))|(?:[\s\xa0]*t|T)(?:aw|o))|2[\s\xa0]*?T(?:aw|o))arikh|(?:Do(?:vom[\s\xa0]*?T|[\s\xa0]*t|T)|2[\s\xa0]*?T)owrikh|دو(?:م(?:[\s\xa0]*توار(?:ی(?:که|خ)|ي?خ)|توار(?:ی(?:که|خ)|ي?خ))|[\s\xa0]*توار(?:ی(?:که|خ)|ي?خ)|توار(?:ی(?:که|خ)|ي?خ))|دو(?:م(?:[\s\xa0]*تواریک|ت(?:واریک)?)|[\s\xa0]*?تواریک)|2[\s\xa0]*توار(?:ی(?:که|خ)|ي?خ)|۲[\s\xa0]*توار(?:ی(?:که|خ)|ي?خ)|2[\s\xa0]*تواریک|۲[\s\xa0]*تواریک|[2۲]تواریکه|DovomChr|[2۲]تواریک|۲(?:towāri|تواری?خ)|2(?:t(?:owāri|awā)|تواری?خ)|[2۲]تواريخ|۲(?:tow(?:ār)?|تواری?|تو)|2(?:tow(?:ār)?|تو(?:ا(?:ری?)?)?)|2Chr)|(?:Dovom[\s\xa0]*t(?:awari|o(?:w(?:ar[iy]|ri)|ari))kh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:avval[\s\xa0]*tawārikh|Avval(?:[\s\xa0]*T(?:o(?:w(?:ar[iy]|ri)|ari)|awari)kh|T(?:o(?:w(?:ar[iy]|ri)|ari)|awari)kh|Chr)|(?:Yek[\s\xa0]*?t|1[\s\xa0]*?T)(?:o(?:w(?:ar[iy]|ri)|ari)|awari)kh|اول(?:[\s\xa0]*توار(?:ی(?:که|خ)|ي?خ)|توار(?:ی(?:که|خ)|ي?خ))|اول(?:[\s\xa0]*تواریک|ت(?:واریک)?)|(?:یک|۱)[\s\xa0]*توار(?:ی(?:که|خ)|ي?خ)|(?:یک|۱)[\s\xa0]*تواریک|(?:یک|1[\s\xa0]*)توار(?:ی(?:که|خ)|ي?خ)|(?:یک|1[\s\xa0]*)تواریک|[1۱]تواریکه|[1۱]تواریک|۱(?:towāri|تواری?خ)|1(?:t(?:owāri|awā)|تواری?خ)|[1۱]تواريخ|۱(?:tow(?:ār)?|تواری?|تو)|1(?:tow(?:ār)?|تو(?:ا(?:ری?)?)?)|avvalt|1Chr)|(?:Avval(?:[\s\xa0]*t(?:awari|o(?:w(?:ar[iy]|ri)|ari))|t(?:awari|o(?:w(?:ar[iy]|ri)|ari)))kh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:عزرای)|(?:ع(?:ِ(?:[\s\xa0]*(?:زر(?:اء?|ه)|ذرا)|زر(?:اء?|ه)|ذرا)|[\s\xa0]*(?:زر(?:اء?|ه)|ذرا)|زراء?|زره|ذرا|زر)|[EI]zra(?:[\s\xa0]*[ah]|[ah])|ezrāy|ezrā?)|(?:[EI]zra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ن(?:ِ(?:ح(?:ِمی(?:ّ[اه]|ا[ءهً])|(?:ِم[\s\xa0]*|م)یا)|[\s\xa0]*حِمیا)|حمی[اه])|N(?:eh(?:e(?:em[iy]|m[iy])a|im[iy]a)?|ihemia)|ن(?:ِحِمیا?|حمی?)|nīm(?:iān|ī)|nīmiā)|(?:نِحِم)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:G(?:reek[\s\xa0]*Esther|k(?:[\s\xa0]*?Esth|[\s\xa0]*Est)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ا(?:ِ(?:س(?:تره|(?:ت[ـَ]|[طٹ])ر)|[\s\xa0]*ستر)|ست(?:ره|ِر))|esterh|Est(?:her|eh?r|h?r|h)|ا(?:ِستر|ستر?)|ester|ast)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ا(?:یو(?:ُبی|ب[هَی]|پ)|یُوُ?ب|ِ(?:یوُ?|و)ب|(?:[\s\xa0]*ی|ی[\s\xa0ـوّ]*)وب)|Eiyoob|A(?:y(?:(?:y(?:o[ou]|u)|[ou]u)b|obe|ub)|i(?:yoo|o?u)b)|ای(?:و(?:ُب|ب)?|ّ)|ayūbi|(?:Iyo|E(?:yy|io)|Ey)ub|ayūb?|[آئ]یوب|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mazmore)|(?:M(?:az(?:am(?:u(?:r(?:ah|e)|['hou’]r|r)|o(?:ure|re|or|r))|mur(?:ah|e)|(?:[\s\xa0]*?moo|mu['hou’])r|moure|[\s\xa0]*?mor|mur)|(?:iz(?:a?moo|[\s\xa0]*moo|a?mu)|ez(?:[\s\xa0]*moo|a?mu))r)|م(?:(?:(?:ِزمو|َزمو?)ُ|[َِ]زمو|ظمو)ر|ز(?:م(?:(?:ُور|[مَّ]و|ُُ|ُ)ر|و(?:ُ[رو]ر|ر[ره]|[وَ]ر))|(?:امی|[\s\xa0ز]*مو)ر))|mazmūrī|مز(?:م(?:ُور|و(?:ُر|ر)?|ُ)?|ا)|mazm(?:ūr)?|zabūr|زبور|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pr(?:ayer[\s\xa0]*of[\s\xa0]*Azariah|[\s\xa0]*?Azar))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:a['’]mthāli|Am(?:th(?:a(?:l(?:eh|[ls])|[ae]l)|el)|[\s\xa0]*(?:thal[es]?|sale?)|thale?|saa?l)|a['’]mthāl?|ام(?:ث(?:ل(?:اء?ل|[\s\xa0]*ل|[له])|(?:ـا|اا|ال|آ)ل)|صا?ل)|امث(?:لاء?|ال|ا)?|hikmāt|hikmā?|amsāl|Prov)|(?:امثل)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:kolliyāt|jāme['’]eh|Jam(?:a(?:['’]a[ht]|ih)|[\s\xa0]*aeh|['’]a[ht]|[3a]ah)|Jam(?:(?:a['’]|['’]|[3a])a|[\s\xa0]*ae)|جام(?:ـعه|ع(?:ه[ـهی]|[\s\xa0ـی]*ه|[اۀہ])|[هہ]ع)|جام(?:عه)?|jām(?:e['’])?|کلیات|Eccl)|(?:جامع)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:ong[\s\xa0]*of[\s\xa0]*the[\s\xa0]*Three[\s\xa0]*Young[\s\xa0]*Men|gThree))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ghaz(?:l(?:[\s\xa0]*Ghazalhaaa?|Ghazalhaa)|alGhazalhaa))|(?:Ghaz(?:al(?:(?:_Ghazal_ha|(?:\-?Ghazal\-?|_Ghazal\-?|Ghazal[\s\xa0\x2D_]*)h|\-?Ghazalh)a|[\s\xa0]*Ghazal(?:haaa?|_haa?|[\s\xa0\x2D]*?ha)|_Ghazalhaa?)|l(?:(?:_Ghazal_ha|(?:[\s\xa0]*Ghazal\-?|\-?Ghazal\-?|_Ghazal\-?|Ghazal[\x2D_])h|(?:[\s\xa0]*|\-?)?Ghazalh)a|[\s\xa0]*Ghazal_haa?|_Ghazalhaa?))|غزل(?:ۀ[\s\xa0]*غزل(?:ۀ[\s\xa0]*)?ها|[\s\xa0]*غزل[\s\xa0]*?هاا|[\s\xa0]*غزلۀ[\s\xa0]*ها|غزل[\s\xa0]*هاا|[\s\xa0‌]*غزل‌ها|غزلها|یات)|غزل(?:[\s\xa0]*غزل[\s\xa0]*?ها|غزل[\s\xa0]*ها|[غی])|s(?:olomon|hīr(?:āy|i))|s(?:hīrā?|ol)|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:اِرمیا(?:ها|ء[هى]))|(?:ا(?:ِر(?:م(?:ی(?:ا(?:[\s\xa0]*[يی]ا|ئه|[ءاهى])|[\s\xa0]*ی[اه]|ها|ی[اه]|ى)|يا[ءا]|[\s\xa0ي]*یا)|[\s\xa0]*(?:می|3)ا)|رمی(?:ا[ءاه]|ی[اه]|[هى])|(?:ر[\s\xa0]*|[\s\xa0]*ر)میا)|Irm['’]yaaha|[EY]rm(?:['’](?:ya(?:a(?:ha?)?)?|iah)|e(?:ya[ah]h|ia)|eiyah|eya[ah]?|i[ay]ah|ia['’]h|iaha?|i[ay]a)|Irme(?:ya[ah]h|ia)|Irm(?:eiy|['’]i)ah|Irmeya[ah]?|yirm(?:īyā|iy)|Irmi[ay]ah|Irmia['’]h|Irmiaha?|yirmīy?|ا(?:ِرم(?:يا|یه)|رم(?:یا?)?)|Irm['’]ya|Irmi[ay]a|Jer)|(?:اِرمیا|[EIY]rmia)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ح(?:ِز(?:ق(?:ی(?:ی(?:ائ?له|ل)|ا(?:ل(?:له|[هی])|[\s\xa0اي]*ل)|ائله|ئال|لی|ئل)|ال)|کیالله|کیائله|کی(?:ا?لی|ئل)|(?:ِقیا|ک(?:ی(?:یا|اي)|ا)|کیئا)ل)|ز(?:کی(?:ا[ئي]|ئ)|قیا[ئي]|[قک]ییا|قیئا|کیا|قیا?|قیئ)ل)|Hiz(?:q(?:iy(?:a(?:lha|ha?l|['’]l)|['’]aa?l)|iya[aei]lh?|iyalh?|eya[ei]?l)|kiya(?:[ei]lh?|lh?))|ح(?:ِز(?:قی(?:یائ?|ائ|ا)?|کی(?:ائ|ا)?)ل|زقی?)|hazqiāl|hazqīl|hazqī?|Ezek)|(?:حِزقیا)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:دان(?:ی(?:ا(?:ئل(?:له|[هی])|لله|يل|لی)|ئلله|یال|ئلی|لی|یل)|ي(?:ا(?:ئل(?:له|[هی])|لله|يل|لی)|ئلله|یال|ئلی|لی|یل))|Dan(?:i(?:y(?:a(?:[ei]lh?|h?l)|el)|el)|y(?:a(?:[ei]lh?|h?l)|el))?|دان(?:یائ?ل|ي(?:ائ?|ئ)ل|یئل|یل?)?|dāniāl|dānīl|dānī?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:hosh['’]ai?)|(?:H(?:os(?:h(?:ae(?:ah)?|e(?:ah|a)?))?|ush(?:(?:ae|ea)h|ae?|ea?))|هوش(?:ع(?:یی|لل|عه|ه)|[ئا]عع|؏(?:عع|ه)|ع(?:ی|ل|ع)?|[ئا]ع|؏ع?)?)|(?:hosh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:یو(?:ئ(?:ی(?:یل(?:یہ|[ـلهہ])|ل(?:ی[هہی]|[ـلهہ])|ئل[لی])|ئی(?:یلـ?|ل[ـلهی]?)|ی(?:یلی?|لی?|ئل)|ل)?|(?:وئی[لی]|وئی|ی)ل)|Y(?:o(?:o(?:['’](?:i[ei]|ei?)|e[ai]|ae|e|i)|ei)|uoi)l|yū['’]īli|yū['’]īl|Jo(?:e[ai]|['a’]e)l|Joel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:عام(?:و(?:و(?:و(?:وسہ|س(?:یی|سس|[هہ])|س(?:ی|س)?)|س(?:س(?:یی|[هہ])?|ی[ہی]|ی|[ـهہ])?)|س(?:ییہ|سیی|سی|یہ|س[سه]|ی|س|[ـهہ])?)|س)?|A(?:amo(?:oo?se|use|s[es]|es)|mo(?:(?:oo|u)s|ose|se))|A(?:amo(?:oo?)?|mo)s|āmūsī|ām(?:ūs)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ع(?:ُوب(?:َدیاء?|دیا)|وب(?:َد(?:ِیاء?|ی(?:ا[ءىيہی]|[آه])|یا?|يا)|دیا[هىيہی]|(?:دِ|اد)یا|د(?:یا?)?)?)|O(?:b(?:ad(?:i(?:ye|y?a)|eya|ya)h|edia)|[ou]bad[iy]a)|Obad(?:iy?a|eya|ya)?|obd(?:ay|i)yā|obd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ی(?:و(?:ون(?:یی?|[او])?س|ن(?:سسی|اسی|(?:ی[ای]|[وُ])س|یس|س[ـهہی]|[شص]))|ُونا?س)|Y(?:o(?:on(?:ess?|[ai]s)|(?:un[ai]|nu)s)|un[ai]s)|Jonas[es]|Jo(?:una|on[ai]|ni)s|Jonahs?|Jonas|یون(?:سس|اس|س)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:م(?:ی(?:ک(?:ا(?:ه(?:ی[هی]|ئی|[ءةـوِہ])|ہ[ئاهوی]|ئ[هہ]|[ءاِ]ه|[ةۂی])|ه)|كاه)|ي[كک]اه)|mīkhāyā|M(?:i(?:k(?:a(?:hah|aha?|h)?|ha)|c(?:aha?)?)|y(?:kaha?|cah))|mīkhāy?|میک(?:اه?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ن(?:اح(?:و(?:م(?:ی(?:ی(?:یه|[ءئه])|ائ[هہ]|ہ[ئاه]|ئی|ہ|ئ|ی|[ءةهۂ])?|ائ[هہ]|وو|ہ[ئاه]|ئی|و|ا|ہ|ئ|[ءةـهۂ])?|وم)?|م)?|حوم)|Na(?:h(?:u(?:mme|um)|ou?m)|ah(?:ou?|u)m)|nāhūmi|nāhūm?|Nah(?:um)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ح(?:َب(?:َق(?:و(?:ق(?:ی(?:ی(?:یه|[ءئه])|ائ[هہ]|ہ[ئاه]|ئی|ہ|ئ|ی|[ءةهۂ])?|ائ[هہ]|وو|ہ[ئاه]|ئی|و|ا|ہ|ئ|[ءةـهۂ])?|وق|ک)|ق)|قوق)|بق(?:وق|و)?)|Hab(?:ba(?:(?:kk|c)uc|[ck]ook|ku[ck])|a(?:k(?:k(?:ook|u[ck])|ook|u[ck])|c(?:ook|uc)))|habaqūq|habaqū?|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ص(?:َف(?:َنی(?:ا(?:ئ[ءةهہۂی]|ء[ءةہۂی]|[ةهہۂ])|ہ[ءةہۂ]|ۂ)|انیا)|فنیا)|Ze(?:ph(?:an(?:iah?|aya))?|fan(?:iah?|aya|ya))|ص(?:َفَنی(?:اء?|ہ)|فنی?)|zofanj(?:īy|ā)|zof(?:anjī)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:حَجَّیہ?ئہ)|(?:ح(?:َج(?:َّی(?:ہ(?:ئ[ةۀۂ]|[ءةۀۂ])?|اء|ئ[ةۀۂ]|[ءة])?|ّی)|ج(?:ییی|یی?|ّی|ا))|hajj(?:īyy|ā)|hajjīy?|Hag(?:g(?:a[iy]|[iy])|a[iy]|i)|Hag)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:زکریا(?:ئ[ہۂ](?:ئہ|ء)?|[ہۂ](?:ئہ|ء)?))|(?:زکریا(?:ئ[ۀۃ](?:ئہ|ء)|[ۀۃ](?:ئہ|ء)|[ءه])|Z(?:e(?:(?:ch|k)ariah|(?:ch|k)aria|kariya|ch)|akari(?:yy?a|ah?))|zej(?:arīyā|ār)|زکر(?:ی(?:ا(?:ئ[ۀۃ]|[ۀۃ])?)?)?|zejarī)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal['’]aaki)|(?:mal['’](?:ākh[iī]|a)|M(?:a(?:la(?:aki[ei]?|ke[ey]|chi|ki[ei]?)|alaki[ei]?)|[ei]laki)|م(?:َل(?:اک(?:یی|[ىيے])|کي|كی)|ل(?:اکیه|ک[ىیے]))|م(?:َل(?:اکی|ك)|لا(?:کی?)?))|(?:Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:mattā['’]ūsi)|(?:mattā['’]ūs)|(?:M(?:a(?:t(?:['’](?:t(?:hi(?:ya)?|ee|[iy])|yi)|t(?:h(?:e(?:ei|[ai])|[iy])|i[ei]|e[ey]|y)|t(?:hee|i)?|h[iy]|ai)|at(?:t(?:ey|i)|hai))|itthy|ettie|itti|etty)|م(?:َت(?:ّ(?:تی|[ىيی])|ی[هی]|تی|ي)|ت(?:ایی|تی|ّی|[ىيی])|ت(?:ای|ت)))|(?:mattā)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mar(?:q(?:oosee|uss)|c(?:o(?:os(?:ee?)?|u?s)|use?)|q(?:oo|u)s|k(?:us|o)s|(?:koo|q(?:uo|ou))s|qose?|k(?:us)?)|م(?:َر(?:ق(?:ُ(?:وس|سه)|و[سص]|سه|ص)|[كک]ُس)|ر(?:(?:ق(?:ُو|ّ)|ك)س|ق(?:وس|سی|ُس|ص)|کس))|mārqūsi|م(?:َرقُ?س|ر(?:ق(?:و|س)?|ک))|mārqūs?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:o(?:oqa(?:at?|h)?|[kq]aa[ht]|[kq]a)|u(?:k(?:aah|a|e)|qa(?:at?|h)?))|لو(?:ق(?:ا(?:ءه|[تهی])|[آةهىی])|[كک](?:ا[ءه]|ة))|لو(?:ق(?:اء?)?|[كک]ا)|lūqān|lūqā?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Avval(?:[\s\xa0]*(?:Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|یو(?:[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|[حه]ناء?))|Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|یو[حه]ناء?|John)|avv(?:al[\s\xa0]*yohannā|lyo)|(?:Yek[\s\xa0]*?|اول|[1۱])Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|(?:اول|[1۱])[\s\xa0]*(?:Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|یو(?:[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|[حه]ناء?))|(?:اولیو[حه]|[1۱]یوه)ن(?:ا(?:ءه|[ته])|[آةهىی])|یک[\s\xa0]*?یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|(?:اولیو[حه]|[1۱]یوه)ناء?|یک[\s\xa0]*?یو[حه]ناء?|[1۱]یوحنا(?:ءه|[ته])|[1۱]یوحناء?|۱(?:یوحن[آةهىی]|yohn)|1(?:یوحن[آةهىی]|yohn)|۱(?:یو(?:حن?)?|yoh?)|1(?:یو(?:حن?)?|yoh?)|اولیو|1John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Do(?:vom(?:[\s\xa0]*(?:Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|یو(?:[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|[حه]ناء?))|Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|یو[حه]ناء?|John)|[\s\xa0]*?Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?)))|dovvom(?:[\s\xa0]*yohannā|yo)|(?:دوم|[2۲])[\s\xa0]*(?:Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|یو(?:[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|[حه]ناء?))|(?:دوم|[2۲])Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|(?:دومیو[حه]|[2۲]یوه)ن(?:ا(?:ءه|[ته])|[آةهىی])|دو[\s\xa0]*?یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|(?:دومیو[حه]|[2۲]یوه)ناء?|دو[\s\xa0]*?یو[حه]ناء?|[2۲]یوحنا(?:ءه|[ته])|[2۲]یوحناء?|۲(?:یوحن[آةهىی]|yohn)|2(?:یوحن[آةهىی]|yohn)|۲(?:یو(?:حن?)?|yoh?)|2(?:یو(?:حن?)?|yoh?)|دومیو|2John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Se(?:vom(?:[\s\xa0]*Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?)))|h(?:[\s\xa0]*Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?)))|[\s\xa0]*Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?)))|sevvom(?:[\s\xa0]*yohannā|yo)|س(?:وم[\s\xa0]*|ه[\s\xa0]*?)یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|(?:۳[\s\xa0]*?|3[\s\xa0]*?)Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|س(?:وم[\s\xa0]*|ه[\s\xa0]*?)یو[حه]ناء?|(?:سومیو[حه]|۳یوه)ن(?:ا(?:ءه|[ته])|[آةهىی])|(?:سومیو[حه]|۳یوه)ناء?|۳[\s\xa0]*یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|3(?:[\s\xa0]*یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|یوحنا(?:ءه|[ته])|یوهن(?:ا(?:ءه|[ته])|[آةهىی])|یوحن[آةهىی]|[Jy]ohn)|۳[\s\xa0]*یو[حه]ناء?|3(?:[\s\xa0]*یو[حه]ناء?|یوحناء?|یوهناء?|یو(?:حن?)?|yoh?)|۳(?:یوحنا(?:ءه|[ته])|یوحن[آةهىی]|yohn)|۳یوحناء?|سومیو|۳یو(?:حن?)?|۳yoh?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y(?:o(?:ohan(?:a(?:ah)?|na)|han(?:nah?|a(?:ah)?))|uhan(?:nah?|a(?:ah)?))|yohannān|yo(?:hannā)?|یو(?:هن(?:اءه|ا[ته]|[آةهىی])|حن(?:ا(?:ءه|[تهی])|[آةهىی]))|یو(?:هناء?|ح(?:ن(?:اء?)?)?)|John)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:A(?:maal(?:\-?e\-?|[\s\xa0]*(?:e[\s\xa0]*)?)Rusuleen|['’]ma(?:l(?:\-?e\-?Rusul(?:een|an)?|[\s\xa0]*e[\s\xa0]*Rusul(?:een|an)?|e)|al(?:\-?e\-?|[\s\xa0]*e[\s\xa0]*)Rusul)|maal(?:\-?e\-?|[\s\xa0]*(?:e[\s\xa0]*)?)Rusulan|mal\-?e\-?Rusul(?:een|an)?|mal[\s\xa0]*e[\s\xa0]*Rusul(?:een|an)?|ma(?:ale|l[ei])|cts)|اعم(?:ال(?:[\s\xa0]*(?:الرسولی|رسول[ای])ن|ی[\s\xa0]*رسولان|ها)|ل(?:[\s\xa0]*رسولان|ها|ی))|اعم(?:ال[\s\xa0]*الرسول)?|a['’]mālī|عما?لها|a['’]m(?:āl)?|عما?لی|عما?ل)|(?:A(?:['’]maa?|maa?)l|اعم(?:الی?|ل))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:روم(?:ی(?:[او]ن(?:ی(?:ان)?|ها|ان|ه|ن)?)?|ي(?:ون[هی]|ان[هی])|يان)?|R(?:o(?:om(?:i(?:ya|[au])|ea)|m(?:i[au]|ya))|umi(?:ya|[au]))n|rūm(?:iān)?ī|rūm(?:iān)?|Rom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:[2۲]qrnt)|(?:[2۲]qrn)|(?:Do(?:vom(?:[\s\xa0]*(?:(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians))|(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians)|Cor)|[\s\xa0]*(?:(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians))|(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians))|دو(?:م(?:[\s\xa0]*قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان))|[\s\xa0]*قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان))|2[\s\xa0]*?Qorint(?:h(?:iy?a|yu)|iy?a|yu)n|2[\s\xa0]*Corint(?:h(?:ians?)?|ians)|دو(?:م(?:[\s\xa0]*قرنتی[او]ن(?:ه|ی)?|ق(?:رنتی[او]ن(?:ه|ی)?)?)|[\s\xa0]*قرنتی[او]ن(?:ه|ی)?|قرنتی[او]ن(?:ه|ی)?)|2[\s\xa0]*قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|۲[\s\xa0]*قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|2[\s\xa0]*?Korinth?ian|2Corint(?:h(?:ians?)?|ians)|[2۲]قرنتی[او]ن(?:یان|ها|ان|ن)|2[\s\xa0]*قرنتی[او]ن(?:ه|ی)?|۲[\s\xa0]*قرنتی[او]ن(?:ه|ی)?|[2۲]قرنتی[او]ن(?:ه|ی)?|[2۲]قرنتيان|۲قر(?:نت?)?|2قر(?:نت?)?|2Cor|[2۲]qr)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:[1۱]qrnt)|(?:[1۱]qrn)|(?:Avval(?:[\s\xa0]*(?:(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians))|(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians)|Cor)|Yek[\s\xa0]*(?:(?:Qorint(?:h(?:iy?a|yu)|iy?a|yu)|Korinth?ia)n|Corint(?:h(?:ians?)?|ians))|اول(?:[\s\xa0]*قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان))|(?:Yek|1[\s\xa0]*?)Qorint(?:h(?:iy?a|yu)|iy?a|yu)n|(?:Yek|1[\s\xa0]*)Corint(?:h(?:ians?)?|ians)|(?:یک|۱)[\s\xa0]*قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|(?:Yek|1[\s\xa0]*?)Korinth?ian|اول(?:[\s\xa0]*قرنتی[او]ن(?:ه|ی)?|ق(?:رنتی[او]ن(?:ه|ی)?)?)|(?:یک|1[\s\xa0]*)قرنت(?:ی[او]ن(?:یان|ها|ان|ن)|يان)|1Corint(?:h(?:ians?)?|ians)|(?:یک|۱)[\s\xa0]*قرنتی[او]ن(?:ه|ی)?|[1۱]قرنتی[او]ن(?:یان|ها|ان|ن)|(?:یک|1[\s\xa0]*)قرنتی[او]ن(?:ه|ی)?|[1۱]قرنتی[او]ن(?:ه|ی)?|[1۱]قرنتيان|۱قر(?:نت?)?|1قر(?:نت?)?|1Cor|[1۱]qr)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:G(?:al(?:ati(?:y(?:un(?:ians)?|an(?:ian)?s)|ans?))?|halati(?:y[au]|a)n)|غل(?:اطی(?:[او]ن(?:یان|ان|[نه])|ها)|طی(?:[او]ن(?:یان|ان|[نه])|ها))|ghalātiān|غل(?:ا(?:ط(?:ی(?:[او]ن|ه)?)?)?|طی(?:[او]ن|ه))|ghalātī|ghalāt?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Af(?:is(?:i(?:s(?:i(?:y(?:anians|un)|an)|y(?:ani|un))|yunians|yani|(?:yyu|a)n|yun)|siyunians|siyun|(?:siya|yoo)n|yani)|es(?:isyani|(?:si(?:sia|y[ou])|i(?:s(?:iya|yu)|(?:yy)?a)|iyoo)n|isyan))|ا(?:َفِسسی[او]نه|ف(?:ِس(?:سی[او]ن[نه]|ی[او]ن[نه])|س(?:سی[او]ن|ی[او]ن|و)))|ا(?:َفِسسیان|ف(?:ِس(?:سی[او]|ی[او])ن|س))|Ephesians|Eph(?:esian)?|afss?iyān|afso|afs)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filip(?:i(?:yanians|ans?)|y(?:unians|ans|un))|ف(?:یل(?:یپی(?:[او]ن(?:یان|ان|[نه])|ها)|پیان)|لیپیان)|Philippians|Philipians|fīlīpp(?:iān|ī)|ف(?:یل(?:یپی(?:[او]ن|ه)|پی?)?|لیپ)|fīlīp|Phil)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kol(?:us(?:i(?:y(?:un(?:ians)?|anians)|ans?)|yans)|osi(?:yu|a)n)|ک(?:ول(?:ُس(?:ی(?:[او]ن(?:یان|ان|[نه])|ها)|سیان)|سیان|و)|لُسیان)|Colossiyans|Colossians|کول(?:ُسی(?:[او]ن|ه)|سی)?|kūlsiān|kūl(?:ow|sī)|kūl|Col)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2tsln?)|(?:Do(?:vom(?:[\s\xa0]*T(?:hes(?:saloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|alonikian)|essaloni(?:k(?:ians|ee)|ci)|(?:essaloni(?:ke)?|salonici)ans|essalonikian|essaloni[ck]yan|esalonikian|essalonikan|essalonika|salonikian|salonikee|saloniki)|T(?:hessaloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|essaloni(?:k(?:ians|ee)|ci)|(?:essaloni(?:ke)?|salonici)ans|essalonikian|essaloni[ck]yan|h?esalonikian|essalonikan|essalonika|salonikian|salonikee|saloniki|hess))|[\s\xa0]*?Thes(?:saloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|alonikian)|[\s\xa0]*?Tessalonikians|(?:[\s\xa0]*?Tessalonike|[\s\xa0]*?Tessaloni|[\s\xa0]*?Tsalonici)ans|[\s\xa0]*?Tessalonikian|[\s\xa0]*?tessalonikyan|[\s\xa0]*?Tessalonikee|[\s\xa0]*?Tesalonikian|[\s\xa0]*?Tessalonikan|[\s\xa0]*?Tessalonika|[\s\xa0]*?Tessalonici|[\s\xa0]*?Tsalonikian|[\s\xa0]*?Tsalonikee|[\s\xa0]*?Tsaloniki)|(?:dovvom[\s\xa0]*tsālūnīkiā|2Tsalonikia)n|2[\s\xa0]*T(?:hes(?:saloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|alonikian)|essaloni(?:k(?:ians|ee)|ci)|(?:essaloni(?:ke)?|salonici)ans|essalonikian|essaloni[ck]yan|esalonikian|essalonikan|essalonika|salonikian|salonikee|saloniki)|(?:دوم|۲)[\s\xa0]*تسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|2Thessaloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|(?:دوم|۲)[\s\xa0]*تسالون(?:یکی|يک[يی])ان|دو(?:[\s\xa0]*تسالون(?:یکی|يکي)|تسالون(?:یکی|يکي))انه|(?:دوم|۲)تسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|2Tessaloni(?:k(?:ians|ee)|ci)|2T(?:essaloni(?:ke)?|salonici)ans|دو(?:[\s\xa0]*تسالون(?:یکی|يکي)|تسالون(?:یکی|يکي))ان|(?:دوم|۲)تسالون(?:یکی|يک[يی])ان|2Tessalonikian|(?:دو(?:[\s\xa0]*تسالون(?:یکي|يکی)|تسالون(?:یکي|يکی))ا|۲تسل)ن|2(?:[\s\xa0]*تسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|تسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|تسلن|tsā)|2Tessaloni[ck]yan|2Th?esalonikian|2(?:[\s\xa0]*تسالون(?:یکی|يک[يی])ان|تسالون(?:یکی|يک[يی])ان|تس(?:ل|ا)?|ts)|(?:2Tessalonika|۲tsl)n|2Tessalonika|2Tsalonikee|2Tsaloniki|dovvomts|2Thess|دومتس|۲تسل|۲tsl|۲(?:ts|تس))|(?:Do(?:vom(?:[\s\xa0]*tessalonik[iy]|tessalonik[iy])|[\s\xa0]*?tessaloniki)an)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1tsln)|(?:Avval(?:[\s\xa0]*T(?:hes(?:saloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|alonikian)|essaloni(?:k(?:ians|ee)|ci)|(?:essaloni(?:ke)?|salonici)ans|essalonikian|essaloni[ck]yan|esalonikian|essalonikan|essalonika|salonikian|salonikee|saloniki)|T(?:hessaloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|essaloni(?:k(?:ians|ee)|ci)|(?:essaloni(?:ke)?|salonici)ans|essalonikian|essaloni[ck]yan|h?esalonikian|essalonikan|essalonika|salonikian|salonikee|saloniki|hess))|Yek[\s\xa0]*?Thes(?:saloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|alonikian)|Yek[\s\xa0]*?Tessalonikians|(?:Yek(?:[\s\xa0]*?Tessalonike|[\s\xa0]*?Tessaloni)|(?:Yek[\s\xa0]*?|1)Tsalonici|1Tessaloni(?:ke)?)ans|Yek[\s\xa0]*?Tessalonikian|(?:Yek[\s\xa0]*?tessalonik|1Tessaloni[ck])yan|1[\s\xa0]*T(?:hes(?:saloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|alonikian)|essaloni(?:k(?:ians|ee)|ci)|(?:essaloni(?:ke)?|salonici)ans|essalonikian|essaloni[ck]yan|esalonikian|essalonikan|essalonika|salonikian|salonikee|saloniki)|(?:اول[\s\xa0]*|۱)تسالونیکیان[هی]|(?:اول[\s\xa0]*|۱)تسالونيک(?:یانی|يانه)|Yek[\s\xa0]*?Tessalonikee|(?:avval[\s\xa0]*tsālūnīkā|(?:Yek[\s\xa0]*?|1)Tsalonikia)n|(?:Yek[\s\xa0]*?T|1Th|1T)esalonikian|(?:Yek[\s\xa0]*?Tessalonika|1Tessalonika|۱tsl)n|1Thessaloni(?:(?:k[ei])?ans|ci(?:ans)?|kan?)|(?:اول[\s\xa0]*|۱)تسالونیکیان|(?:اول[\s\xa0]*|۱)تسالونيک[يی]ان|Yek[\s\xa0]*?Tessalonika|(?:(?:(?:اول[\s\xa0]*|۱)تسالونیکي|یک(?:[\s\xa0]*تسالون(?:یکي|يکی)|تسالون(?:یکي|يکی)))ا|(?:اول[\s\xa0]*|۱)تسالونیکا|۱تسل)ن|یک(?:[\s\xa0]*تسالون(?:یکی|يکي)|تسالون(?:یکی|يکي))انه|اولتسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|Yek[\s\xa0]*?Tessalonici|1Tessaloni(?:k(?:ians|ee)|ci)|یک(?:[\s\xa0]*تسالون(?:یکی|يکي)|تسالون(?:یکی|يکي))ان|اولتسالون(?:یکی|يک[يی])ان|1Tessalonikian|۱[\s\xa0]*تسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|1(?:[\s\xa0]*تسالون(?:یک(?:یان[هی]|يان)|يک(?:یانی|يانه))|تسالونیکیان[هی]|تسالونيک(?:یانی|يانه)|تسالونیکيان|تسالونیکان|تسلن|ts[lā])|(?:Yek[\s\xa0]*?|1)Tsalonikee|۱[\s\xa0]*تسالون(?:یکی|يک[يی])ان|1(?:[\s\xa0]*تسالون(?:یکی|يک[يی])ان|تسالونیکیان|تسالونيک[يی]ان|تس(?:ل|ا)?|ts)|(?:Yek[\s\xa0]*?|1)Tsaloniki|1Tessalonika|avvalts|1Thess|اولتس|۱تسل|۱tsl|۱(?:ts|تس))|(?:(?:Avval(?:[\s\xa0]*tessalonik[iy]|tessalonik[iy])|Yek[\s\xa0]*?tessaloniki)an)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:dovvom(?:[\s\xa0]*tīmutā['’]ūs|tī)|(?:Do(?:vomTimot(?:h(?:a(?:i?o|eu)|eu)|eo?u|aio|ao)|Timot(?:ha?eu|hao|e[ou]))|2Timot(?:h(?:a(?:i?o|eu)|eu)|eo?u|aio|ao))s|دو(?:م(?:تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه|(?:ئاؤ|ی[ؤو])س|یئوس)|[\s\xa0]*تیموتائوس)|تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه|(?:ئاؤ|ی[ؤو])س|یئوس))|DovomTimot(?:eos|hy)|دو(?:متی(?:موت(?:ا(?:ئو|ؤ)|ئو)س)?|تیموت(?:ا(?:ئو|ؤ)|ئو)س)|DovomTim(?:oteo)?|[2۲]تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|۲[\s\xa0]*تیموتائوس|[2۲]تیموت(?:ا(?:ئو|ؤ)|ئو)س|[2۲]تیموت(?:ئاؤ|ی[ؤو])س|[2۲]تیموتیئوس|2Timot(?:eos|hy)|2Tim(?:oteo)?|۲(?:tīmt|تیمت)|2(?:tīmt|تیمت)|۲(?:tīm?|تیم?)|2(?:tīm?|تیم?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:(?:avval[\s\xa0]*tīmutā['’]ū|YekTimot(?:hao|e[ou]))s|Avval(?:Tim(?:ot(?:h(?:a(?:i?o|eu)s|eus|y)|(?:eo?u|aio|ao)s|eos?))?|stTimothy)|اول(?:تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه|(?:ئاؤ|ی[ؤو])س|یئوس)|[\s\xa0]*تیموتائوس)|YekTimotha?eus|اولتی(?:موت(?:ا(?:ئو|ؤ)|ئو)س)?|یکتیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|یکتیموت(?:ا(?:ئو|ؤ)|ئو)س|[1۱]تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|(?:یکتیموت(?:ئاؤ|ی[ؤو])|[1۱]تیموت(?:ئاؤ|ی[ؤو]))س|(?:یک|[1۱])تیموتیئوس|۱[\s\xa0]*تیموتائوس|1Tim(?:ot(?:h(?:a(?:i?o|eu)s|eus|y)|(?:eo?u|aio|ao)s|eos?))?|[1۱]تیموت(?:ا(?:ئو|ؤ)|ئو)س|1stTimothy|avvaltī|۱(?:tīmt|تیمت)|1(?:tīmt|تیمت)|۱(?:tīm?|تیم?)|1(?:tīm?|تیم?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ت(?:یتوش[هی]?|يتوش))|(?:T(?:a[iy]t(?:o[ou]|u)|yto?u|it(?:oo|u))s|ت(?:ی(?:تو[ثسص][هی]|طس)|یت(?:و[ثسص]?)?|يتو[سص]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Filimon[ain])|(?:ف(?:یل(?:یمون(?:ی[ةی]|اء|[ئتهى])|مون(?:ی[ةی]|اء|[ئتهى]))|ل(?:یمون|م))|Ph(?:ilemon[ain]|lm)|Phil(?:emo[ou]|mo?u|imo)n|Filim(?:o(?:unt|onn?|un|n)|un)|ف(?:یل(?:یمون(?:ی|ا)?|مون(?:ی|ا)?)|لیم?)|Philemon|fīlīmoni|fīlīm(?:on)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Ibraaniyaa|Ebra(?:ni(?:y(?:aa|[ou])|aa|[ou])|ani(?:yu|[eo]))|Hebrania|ebrāniā)n|(?:Ebr(?:a(?:an(?:iya|y)|n(?:i(?:yy|e)|ee))|(?:ee|i)ani)|(?:Hebrani|Ibraan)y|Hebraani|Ibrani)an|Abraan(?:i(?:yaa|[ao])|ya)n|عبر(?:ان(?:ی(?:ا(?:ن(?:ات|[تدزسـهڈی])|ئن)|ونه|[آهی]ن)|يان)|ی)|Ibraanians|Ibraaniyan|Ebra(?:anians|niy?an)|عبر(?:انی(?:انا?|ون)?)?|Ebr(?:a(?:an(?:ian)?|n(?:iya)?)|eean)|ebr(?:ānī|i)|ebr|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ya(?:aq(?:oob(?:ey|i)?|ubi?)|q(?:o(?:ob(?:e[ehy]|i)|ub)|ub(?:e[eh]|i)|(?:oo|u)b))|یعقو(?:ب(?:ته|ا[ءت]|[ئهىی])|پ[هی])|ya['’]qūbi|یعق(?:و(?:ب(?:ت|ا)?|پ)?)?|ya['’]qūb|ya['’]qū|Jas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Do(?:vom(?:[\s\xa0]*P(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)|P(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|et(?:ers|er)?))|[\s\xa0]*?p(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?))|(?:dovvom[\s\xa0]*pe|[2۲]p)trus|دو(?:م(?:[\s\xa0]*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی]))|[\s\xa0]*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی]))|دو(?:م(?:[\s\xa0]*پطر(?:س(?:سا?)?|ص)|پط(?:ر(?:س(?:سا?)?|ص))?)|[\s\xa0]*پطر(?:س(?:سا?)?|ص)|پطر(?:س(?:سا?)?|ص))|2[\s\xa0]*P(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)|2[\s\xa0]*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|۲[\s\xa0]*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|2Pat(?:r(?:is(?:si?)?|asa|as|us)|aris)|2[\s\xa0]*پطر(?:س(?:سا?)?|ص)|۲[\s\xa0]*پطر(?:س(?:سا?)?|ص)|[2۲]پطرس(?:س(?:اه|[ئهىی])|[ئاهىی])|dovvompt|[2۲]پطرس(?:سا?)?|2Peters|2Peter|[2۲]پطرص[ئاسهىی]|[2۲]پطرص|۲(?:ptr?|پطر)|2(?:ptr?|پطر?)|2Pet|[2۲]پت)|(?:Dovom(?:[\s\xa0]*p(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)|p(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:Avval(?:[\s\xa0]*P(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)|P(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|et(?:ers|er)?))|(?:avval[\s\xa0]*pe|[1۱]p)trus|(?:Yek[\s\xa0]*?p|1[\s\xa0]*P)(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)|اول(?:[\s\xa0]*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی]))|اول(?:[\s\xa0]*پطر(?:س(?:سا?)?|ص)|پط(?:ر(?:س(?:سا?)?|ص))?)|(?:یک|۱)[\s\xa0]*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|(?:یک|۱)[\s\xa0]*پطر(?:س(?:سا?)?|ص)|(?:یک|1[\s\xa0]*)پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|1Pat(?:r(?:is(?:si?)?|asa|as|us)|aris)|(?:یک|1[\s\xa0]*)پطر(?:س(?:سا?)?|ص)|[1۱]پطرس(?:س(?:اه|[ئهىی])|[ئاهىی])|[1۱]پطرس(?:سا?)?|avvalpt|1Peters|1Peter|[1۱]پطرص[ئاسهىی]|[1۱]پطرص|۱(?:ptr?|پطر)|1(?:ptr?|پطر?)|1Pet|[1۱]پت)|(?:Avval(?:[\s\xa0]*p(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)|p(?:at(?:r(?:is(?:si?)?|asa|as|us)|aris)|eters?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y(?:eh(?:udaa?h|ood(?:eh|aa)|(?:oo|u)da)|ah(?:uda(?:ah?|h)?|oodah?))|ی(?:ہود(?:ا(?:ءه|[ته])|[آةهىی])|هو(?:د(?:ا(?:ءه|[ته])|[آةهىی])|ذ))|y(?:ahūdān|ūdā)|ی(?:ہوداء?|هو(?:داء?)?)|y(?:ahū(?:dā)?|ūd)|Jude)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Tob(?:it)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:udith|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bar(?:uch)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sus(?:annah)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:2(?:[\s\xa0]*M(?:acc(?:abees)?|c)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:3(?:[\s\xa0]*M(?:acc(?:abees)?|c)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:4(?:[\s\xa0]*M(?:acc(?:abees)?|c)|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])(
		(?:1(?:[\s\xa0]*M(?:acc(?:abees)?|c)|Macc))
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

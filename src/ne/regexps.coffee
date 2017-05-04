bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | chapter | verse | and | ff | -
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
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ]"

bcv_parser::regexps.first = "1\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "2\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "3\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|and|-)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|-)"
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
		(?:utpattiko[\s\xa0]*pustak|Gen|utpattiko|उत्पत्ति(?:को(?:[\s\xa0]*पुस्तक)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:प्रस्थानको[\s\xa0]*पुस्तक|Exod|प्रस्थान(?:को)?|prastʰ[aā]nko(?:[\s\xa0]*pustak)?)
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
		(?:lev[iī]har[uū]ko(?:[\s\xa0]*pustak)?)|(?:लेव(?:ी(?:हरूको(?:[\s\xa0]*पुस्तक)?)?|ि)|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:गन्तीको[\s\xa0]*पुस्तक|Num|गन्ती(?:को)?|gant[iī]ko(?:[\s\xa0]*pustak)?)
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
		(?:यर्मियाको[\s\xa0]*विलाप|विलाप|Lam|yarmiy[aā]ko[\s\xa0]*vil[aā]p)
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
		(?:y[uū]hann[aā]l[aā][iī][\s\xa0]*bʰaeko[\s\xa0]*prak[aā][sš]|यूहन्नालाई[\s\xa0]*भएको[\s\xa0]*प्रकाश|Rev)|(?:प्रकाश)
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
		(?:व्य(?:वस्थाको[\s\xa0]*पुस्तक|ावस्था)|Deut|व्यवस्था(?:को)?|vyavastʰ[aā]ko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यहोशूको[\s\xa0]*पुस्तक|Josh|यहोशू(?:को)?|yaho[sš][uū]ko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:न्यायकर्त(?:्त)?ाहरूको[\s\xa0]*पुस्तक|Judg|न्यायकर्ता|ny[aā]yakartt[aā]har[uū]ko[\s\xa0]*pustak)|(?:ny[aā]yakartt[aā]har[uū]ko|न्यायकर्त्ताहरूको)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:रूथको[\s\xa0]*पुस्तक|Ruth|रूथ(?:को)?|r[uū]tʰko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:य(?:शैयाको[\s\xa0]*पुस्तक|ेशैया)|Isa|यशैया(?:को)?|ya[sš]əiy[aā]ko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:श(?:मूएलको|ामुएल)|[sš]am[uū]elko)|Sam|\.[\s\xa0]*(?:श(?:मूएलको|ामुएल)|[sš]am[uū]elko)|\.?[\s\xa0]*शमूएल)|शमूएलको[\s\xa0]*दोस्रो[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:श(?:मूएलको|ामुएल)|[sš]am[uū]elko)|Sam|\.[\s\xa0]*(?:श(?:मूएलको|ामुएल)|[sš]am[uū]elko))|[sš]am[uū]elko[\s\xa0]*pustak|1\.?[\s\xa0]*शमूएल|शमूएलको[\s\xa0]*पहिलो[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:r[aā]ǳ[aā]har[uū]ko|राजाहरूको)|Kgs|\.[\s\xa0]*(?:r[aā]ǳ[aā]har[uū]ko|राजाहरूको)|\.?[\s\xa0]*राजा)|राजाहरूको[\s\xa0]*दोस्रो[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:r[aā]ǳ[aā]har[uū]ko|राजाहरूको)|Kgs|\.[\s\xa0]*(?:r[aā]ǳ[aā]har[uū]ko|राजाहरूको))|r[aā]ǳ[aā]har[uū]ko[\s\xa0]*pustak|1\.?[\s\xa0]*राजा|राजाहरूक[\s\xa0]*पहिल[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:itih[aā]sko|इतिहासको)|Chr|\.[\s\xa0]*(?:itih[aā]sko|इतिहासको)|\.?[\s\xa0]*इतिहास)|इतिहासको[\s\xa0]*दोस्रो[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:itih[aā]sko|इतिहासको)|Chr|\.[\s\xa0]*(?:itih[aā]sko|इतिहासको))|itih[aā]sko[\s\xa0]*pustak|1\.?[\s\xa0]*इतिहास|इतिहासको[\s\xa0]*पहिलो[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:एज्रा(?:को(?:[\s\xa0]*पुस्तक)?)?|eǳr[aā]ko|Ezra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:नहेम्याहको[\s\xa0]*पुस्तक|Neh|नहेम्याह(?:को)?|nahemy[aā]hko(?:[\s\xa0]*pustak)?)
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
		(?:एस्तरको[\s\xa0]*पुस्तक|Esth|एस्तर(?:को)?|estarko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ayy[uū]bko[\s\xa0]*pustak|Job|ayy[uū]bko|अय्यूब(?:को(?:[\s\xa0]*पुस्तक)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:भजनसं?ग्रह|Ps|भजन|bʰaǳansa[mṃ]grah)
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
		(?:हितोपदेशको[\s\xa0]*पुस्तक|Prov|हितोपदेश(?:को)?|hitopade[sš]ko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:उपदेशकको[\s\xa0]*पुस्तक|Eccl|उपदेशक(?:को)?|upade[sš]akko(?:[\s\xa0]*pustak)?)
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
		(?:sulem[aā]nko[\s\xa0]*[sš]re[sṣ][tṭ]ʰag[iī]t|सुलेमानको[\s\xa0]*श्रेष्ठगीत|Song)|(?:श्रेष्ठगीत)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यर्मियाको[\s\xa0]*पुस्तक|Jer|यर्मिया(?:को)?|yarmiy[aā]ko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:इजकिएल(?:को[\s\xa0]*पुस्तक|को)?|Ezek|iǳakielko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:daniyalko(?:[\s\xa0]*pustak)?)|(?:दानियलको[\s\xa0]*पुस्तक|Dan|दानियल(?:को)?|dāniyalko(?:[\s\xa0]*pustak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:होशे(?:को[\s\xa0]*पुस्तक)?|ho[sš]e|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:योएल(?:को[\s\xa0]*पुस्तक)?|[Jy]oel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:आमोस(?:को[\s\xa0]*पुस्तक)?|[Aaā]mos|अमोस)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ओबदिया(?:को[\s\xa0]*पुस्तक)?|obadiy[aā]|Obad)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:योना(?:को[\s\xa0]*पुस्तक)?|yon[aā]|Jonah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:म(?:ीका(?:को[\s\xa0]*पुस्तक)?|िका)|m[iī]k[aā]|Mic)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:नहूम(?:को[\s\xa0]*पुस्तक)?|nah[uū]m|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:हबकूक(?:को[\s\xa0]*पुस्तक)?|habak[uū]k|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:सपन्याह(?:को[\s\xa0]*पुस्तक)?|(?:sapany[aā]|Zep)h)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:हाग्गै(?:को[\s\xa0]*पुस्तक)?|h[aā]ggəi|Hag)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:जकरिया(?:को[\s\xa0]*पुस्तक)?|jakariy[aā]|Zech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:मल(?:ाकी(?:को[\s\xa0]*पुस्तक)?|की)|mal[aā]k[iī]|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:matt[iī]le(?:[\s\xa0]*lekʰeko[\s\xa0]*susm[aā]c[aā]r)?)|(?:मत्त(?:ी(?:ले(?:[\s\xa0]*लेखेको[\s\xa0]*सुसमाचार)?|को[\s\xa0]*सुसमाचार)?|ि)|Matt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:mark[uū]sle(?:[\s\xa0]*lekʰeko[\s\xa0]*susm[aā]c[aā]r)?)|(?:मर्क(?:ू(?:स(?:ले(?:[\s\xa0]*लेखेको[\s\xa0]*सुसमाचार)?|को[\s\xa0]*सुसमाचार)?|श)|ुस)|र्मकस|Mark|र्मकूस)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ल(?:ूका(?:ले[\s\xa0]*लेखे)?को[\s\xa0]*सुसमाचार|ुका)|Luke|लूका|l[uū]k[aā]le[\s\xa0]*lekʰeko[\s\xa0]*susm[aā]c[aā]r)|(?:l[uū]k[aā]le|लूकाले)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:y[uū]hann[aā]ko|यूहन्नाको)|John|\.[\s\xa0]*(?:y[uū]hann[aā]ko|यूहन्नाको))|यूहन्नाको[\s\xa0]*पहिलो[\s\xa0]*पत्र|1\.?[\s\xa0]*यूहन्ना|y[uū]hann[aā]ko[\s\xa0]*pahilo[\s\xa0]*patra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:y[uū]hann[aā]ko|यूहन्नाको)|John|\.[\s\xa0]*(?:y[uū]hann[aā]ko|यूहन्नाको))|y[uū]hann[aā]ko[\s\xa0]*dostro[\s\xa0]*patra|2\.?[\s\xa0]*यूहन्ना|यूहन्नाको[\s\xa0]*दोस्(?:त्)?रो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:3(?:[\s\xa0]*(?:y[uū]hann[aā]ko|यूहन्नाको)|John|\.[\s\xa0]*(?:y[uū]hann[aā]ko|यूहन्नाको))|y[uū]hann[aā]ko[\s\xa0]*testro[\s\xa0]*patra|3\.?[\s\xa0]*यूहन्ना|यूहन्नाको[\s\xa0]*तेस्(?:त्)?रो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:य(?:ूह(?:न(?:्ना(?:ले[\s\xa0]*लेखे)?को[\s\xa0]*सुसमाचार|ा)|ान्ना)|(?:हू|ुह)न्ना)|John|यूहन्ना|y[uū]hann[aā]le[\s\xa0]*lekʰeko[\s\xa0]*susm[aā]c[aā]r)|(?:y[uū]hann[aā]le|यूहन्नाले)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:प्रेरितहरूका[\s\xa0]*काम|Acts|प्रेरित|prerithar[uū]k[aā][\s\xa0]*k[aā]m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:rom[iī]har[uū]l[aā][iī][\s\xa0]*patra|Rom|रोमी(?:हरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?)|(?:rom[iī]har[uū]l[aā][iī]|रोमीहरूलाई)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:korintʰ[iī]har[uū]l[aā][iī]|कोरिन्थीहरूलाई)|Cor|\.[\s\xa0]*(?:korintʰ[iī]har[uū]l[aā][iī]|कोरिन्थीहरूलाई))|korintʰ[iī]har[uū]l[aā][iī][\s\xa0]*dostro[\s\xa0]*patra|2\.?[\s\xa0]*कोरिन्थी|कोरिन्थीहरूलाई[\s\xa0]*(?:पावलको[\s\xa0]*दोस|दोस्त)्रो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:korintʰ[iī]har[uū]l[aā][iī]|कोरिन्थीहरूलाई)|Cor|\.[\s\xa0]*(?:korintʰ[iī]har[uū]l[aā][iī]|कोरिन्थीहरूलाई))|korintʰ[iī]har[uū]l[aā][iī][\s\xa0]*pahilo[\s\xa0]*patra|1\.?[\s\xa0]*कोरिन्थी|कोरिन्थीहरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?हिलो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:gal[aā]t[iī]har[uū]l[aā][iī][\s\xa0]*patra|Gal|गलाती(?:हरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?)|(?:gal[aā]t[iī]har[uū]l[aā][iī]|गलातीहरूलाई)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:epʰis[iī]har[uū]l[aā][iī][\s\xa0]*patra|Eph|एफिसी(?:हरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?)|(?:epʰis[iī]har[uū]l[aā][iī]|एफिसीहरूलाई)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:pʰilipp[iī]har[uū]l[aā][iī][\s\xa0]*patra|Phil|फिलिप्पी(?:हरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?)|(?:pʰilipp[iī]har[uū]l[aā][iī]|फिलिप्पीहरूलाई)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:kalass[iī]har[uū]l[aā][iī][\s\xa0]*patra|Col|कलस्सी(?:हरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?)|(?:kalass[iī]har[uū]l[aā][iī]|कलस्सीहरूलाई)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:tʰissalonik[iī]har[uū]l[aā][iī]|थिस्सलोनिकीहरूलाई)|Thess|\.[\s\xa0]*(?:tʰissalonik[iī]har[uū]l[aā][iī]|थिस्सलोनिकीहरूलाई))|tʰissalonik[iī]har[uū]l[aā][iī][\s\xa0]*dostro[\s\xa0]*patra|2\.?[\s\xa0]*थिस्सलोनिकी|थिस्सलोनिकीहरूलाई[\s\xa0]*(?:पावलको[\s\xa0]*दोस|दोस्त)्रो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:tʰissalonik[iī]har[uū]l[aā][iī]|थिस्सलोनिकीहरूलाई)|Thess|\.[\s\xa0]*(?:tʰissalonik[iī]har[uū]l[aā][iī]|थिस्सलोनिकीहरूलाई))|tʰissalonik[iī]har[uū]l[aā][iī][\s\xa0]*pahilo[\s\xa0]*patra|1\.?[\s\xa0]*थिस्सलोनिकी|थिस्सलोनिकीहरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?हिलो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:timotʰ[iī]l[aā][iī]|तिमोथीलाई)|Tim|\.[\s\xa0]*(?:timotʰ[iī]l[aā][iī]|तिमोथीलाई))|timotʰ[iī]l[aā][iī][\s\xa0]*dostro[\s\xa0]*patra|2\.?[\s\xa0]*तिमोथी|तिमोथीलाई[\s\xa0]*(?:पावलको[\s\xa0]*दोस|दोस्त)्रो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:timotʰ[iī]l[aā][iī]|तिमोथीलाई)|Tim|\.[\s\xa0]*(?:timotʰ[iī]l[aā][iī]|तिमोथीलाई))|timotʰ[iī]l[aā][iī][\s\xa0]*pahilo[\s\xa0]*patra|1\.?[\s\xa0]*तिमोथी|तिमोथीलाई(?:र्[\s\xa0]*पावलको)?[\s\xa0]*पहिलो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:तीतस(?:लाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?|t[iī]tasl[aā][iī][\s\xa0]*patra|Titus)|(?:t[iī]tasl[aā][iī]|तीतसलाई)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:pʰilemonl[aā][iī][\s\xa0]*patra|Phlm|pʰilemonl[aā][iī]|फिलेमोन(?:लाई(?:[\s\xa0]*प(?:ावलको[\s\xa0]*प)?त्र)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:हिब्रूहरूको[\s\xa0]*निम्ति[\s\xa0]*पत्र|Heb|हिब्रू(?:हरूको[\s\xa0]*निम्ति)?|hibr[uū]har[uū]ko[\s\xa0]*nimti(?:[\s\xa0]*patra)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:याकूबको[\s\xa0]*पत्र|Jas|याकूब(?:को)?|y[aā]k[uū]bko(?:[\s\xa0]*patra)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:पत्रुसको|patrusko)|Pet|\.[\s\xa0]*(?:पत्रुसको|patrusko))|patrusko[\s\xa0]*dostro[\s\xa0]*patra|2\.?[\s\xa0]*पत्रुस|पत्रुसको[\s\xa0]*दोस्(?:त्)?रो[\s\xa0]*पत्र)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:पत्रुसको|patrusko)|Pet|\.[\s\xa0]*(?:पत्रुसको|patrusko))|पत्रुसको[\s\xa0]*पहिलो[\s\xa0]*पत्र|1\.?[\s\xa0]*पत्रुस|patrusko[\s\xa0]*pahilo[\s\xa0]*patra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यहूदाको[\s\xa0]*पत्र|Jude|यहूदा(?:को)?|yah[uū]d[aā]ko(?:[\s\xa0]*patra)?)
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
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:2Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:3Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
		(?:4Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ])(
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

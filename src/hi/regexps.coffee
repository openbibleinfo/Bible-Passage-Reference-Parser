bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | chapter | verse | and | ff | to
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
bcv_parser::regexps.pre_book = "[^A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ]"

bcv_parser::regexps.first = "1\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "2\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "3\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|and|to)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|to)"
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
		(?:उत्प(?:त्|ा)ति|Utpaati|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:निर्गमन|Exod|Nirgaman)
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
		(?:लैव्य(?:(?:व(?:्यव)?|्व्य्व)स्था|व्यवस्थ)?|L(?:aaivyavyavastha|ev))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:गिनती|Num|Ginatee)
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
		(?:विलापग[ीे]त|Lam|विलाप|Vilapageet)
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
		(?:प्र(?:काशित(?:[\s\xa0]*?वाक्|\-?वाक्‍)य|\.?[\s\xa0]*व)|Rev|Prakashaitavakya)
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
		(?:व्य(?:वस्था[\s\xa0]*?विवरण|्वस्थाविवरन)|Deut|व्यवस्था|Vyavasthaavivaran)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यहोश[ुू]|Josh|Yahoshoo)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:न्यायिय(?:[\s\xa0]*का[\s\xa0]*विर्तान्त|ों)|Nyayiyon|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:oot|uth)|र[ुू]त)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यशायाह)|(?:यशाया|Isa|यशा|yashaayaah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:Shamooael|शमूएल)|Sam|\.[\s\xa0]*(?:Shamooael|शमूएल)|\.?[\s\xa0]*शमू)|शमुऐयल[\s\xa0]*की[\s\xa0]*[2२]री[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:Shamooael|शमूएल)|Sam|\.[\s\xa0]*(?:Shamooael|शमूएल)|\.?[\s\xa0]*शमू)|शमुऐल[\s\xa0]*की[\s\xa0]*[1१]ली[\s\xa0]*पुस्तक)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:राजाओं|Raja)|Kgs|\.[\s\xa0]*(?:राजाओं|Raja)|\.?[\s\xa0]*राजा)|राजाओ[\s\xa0]*का[\s\xa0]*विर्तान्त[\s\xa0]*[2२]रा[\s\xa0]*भाग)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:राजाओं|Raja)|Kgs|\.[\s\xa0]*(?:राजाओं|Raja)|\.?[\s\xa0]*राजा)|राजाओ[\s\xa0]*का[\s\xa0]*विर्तान्त[\s\xa0]*[1१]ला[\s\xa0]*भाग्)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:Itihas|इतिहास)|Chr|\.[\s\xa0]*(?:Itihas|इतिहास)|\.?[\s\xa0]*इति)|इतिहास[\s\xa0]*[2२]रा[\s\xa0]*भाग)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:Itihas|इतिहास)|Chr|\.[\s\xa0]*(?:Itihas|इतिहास)|\.?[\s\xa0]*इति)|इतिहास[\s\xa0]*[1१]ला[\s\xa0]*भाग)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:एज्रा|Ezra|Aejra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:न(?:हेम(?:ा(?:याह)?|्याह)|्हेम्याह)|N(?:ahemya|e)h)
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
		(?:[एऐ]स्तेर|Esth|Aester)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:अय(?:्यू|यु)ब|Job|Ayyoob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:भजन(?:\-?सहिन्ता|[\s\xa0]*संहिता)?|Bhjan|Ps)
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
		(?:नीति(?:[बव]|[\s\xa0]*व)चन|Prov|नीति|Neetivachan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:सभोपदेशक|Eccl|सभो|Sabhopadeshak)
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
		(?:श्रेष्ठगीत|Song|स्रेस्ट[\s\xa0]*गीत|श्रेष्ठ|Reshthageet)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यिर्मयाह|Jer|यिर्म|Yirmayah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यहेजकेल|Ezek|यहेज|Yahejakel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Da(?:aniyyel|n)|दानि(?:य्ये?ल)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hos(?:ho)?|होशे)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|योएल|Yoael)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Amos|आमोस)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ओब(?:(?:द्[दय]|े?ध)ाह)?|Obad(?:hah)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Yona|योना|Jonah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:eeka|ic)|मीका)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Nah(?:oom)?|नहूम)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab(?:akkook)?|हबक(?:्कूक)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:सपन(?:्याह)?|Zeph|Sapanyah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag(?:gaai)?|हाग्ग[ेै])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:जक(?:यार्|र्या)ह|Zech|Jakaryah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:akee)?|मलाकी)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Matt(?:ee)?|मत्ती)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mar(?:akus|k)|मरकुस)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:ooka|uke)|लूका)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:य(?:ुहत्र|ूहन्न)ा|Yoohanna)|John|\.[\s\xa0]*(?:य(?:ुहत्र|ूहन्न)ा|Yoohanna)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:य(?:ुहत्र|ूहन्न)ा|Yoohanna)|John|\.[\s\xa0]*(?:य(?:ुहत्र|ूहन्न)ा|Yoohanna)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:3(?:[\s\xa0]*(?:य(?:ुहत्र|ूहन्न)ा|Yoohanna)|John|\.[\s\xa0]*(?:य(?:ुहत्र|ूहन्न)ा|Yoohanna)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:य(?:ुहत्र|ूहन्न)ा|John|Yuhanna)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:प्र(?:ेरितों[\s\xa0]*के[\s\xa0]*काम(?:ों)?|(?:\.[\s\xa0]*?|[\s\xa0]*)?क)|Praeriton[\s\xa0]*Ke[\s\xa0]*Kam|मसीह\-?दूत|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:रोम(?:ियों|ी|ियो)|Rom(?:iyon)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:क(?:ुर(?:िन्(?:यि़|थि)|न्थि)यों|ोरिन्‍थी|ुरिन्थ(?:ियो)?)|Kurinthiayon)|Cor|\.[\s\xa0]*(?:क(?:ुर(?:िन्(?:यि़|थि)|न्थि)यों|ोरिन्‍थी|ुरिन्थ(?:ियो)?)|Kurinthiayon)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:क(?:ुर(?:िन्(?:यि़|थि)|न्थि)यों|ोरिन्‍थी|ुरिन्थ(?:ियो)?)|Kurinthiayon)|Cor|\.[\s\xa0]*(?:क(?:ुर(?:िन्(?:यि़|थि)|न्थि)यों|ोरिन्‍थी|ुरिन्थ(?:ियो)?)|Kurinthiayon)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:गल(?:ात(?:ियों|ी)|तियों|ाति)|Gal(?:atiyon)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:इफिस(?:ियों|ी)|Eph|इफिसि|Iafisiyon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:फिलिप्(?:पियों|‍पी)|Phil|फिलिप्पि|Filippaiyon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:कुलुस्(?:सियों|‍सी)|Col|कुलुस्सि|Kulussaiyon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:थिस(?:्सलुनीकियों|लुनिकी|्स)|Thaissaluneekiyon)|Thess|\.[\s\xa0]*(?:थिस(?:्सलुनीकियों|लुनिकी|्स)|Thaissaluneekiyon)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:थिस(?:्सलुनीकियों|लुनिकी|्स)|Thaissaluneekiyon)|Thess|\.[\s\xa0]*(?:थिस(?:्सलुनीकियों|लुनिकी|्स)|Thaissaluneekiyon)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:त(?:(?:ीमु(?:ाथै|थि)|िमुथि)युस|ीम)|Teemuathaiyus)|Tim|\.[\s\xa0]*(?:त(?:(?:ीमु(?:ाथै|थि)|िमुथि)युस|ीम)|Teemuathaiyus)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:त(?:(?:ीमु(?:ाथै|थि)|िमुथि)युस|ीम)|Teemuathaiyus)|Tim|\.[\s\xa0]*(?:त(?:(?:ीमु(?:ाथै|थि)|िमुथि)युस|ीम)|Teemuathaiyus)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:ee|i)tus|तीतुस)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:फ(?:िलेमोन|ले)|Phlm|Filemon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:इब्रान(?:ियों|ी)|Heb|इब्रानि|Ibraaaniyon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:याकूब|Jas|Yakoob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2(?:[\s\xa0]*(?:पत(?:(?:्रु|र)स|र)|Pataras)|Pet|\.[\s\xa0]*(?:पत(?:(?:्रु|र)स|र)|Pataras)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:1(?:[\s\xa0]*(?:पत(?:(?:्रु|र)स|र)|Pataras)|Pet|\.[\s\xa0]*(?:पत(?:(?:्रु|र)स|र)|Pataras)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:यहूदा|Jude|Yahooda)
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
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:2Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:3Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
		(?:4Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿ꣠-ꣷꣻ])(
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

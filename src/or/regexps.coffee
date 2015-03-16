bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | chapter | verse | ଠାରୁ | and | ff
				  | [ଖ] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* title
	| \d \W* ff (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [ଖ] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ]"

bcv_parser::regexps.first = "(?:ପ୍ରଥମ|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:ଦ୍ୱିତୀୟ|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:ତୃତୀୟ|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|and|ଠାରୁ)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|ଠାରୁ)"
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
		(?:Gen|ଆଦି(?:ପୁସ୍ତକ)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯାତ୍ରା(?:[\s\xa0]*ପୁସ୍ତକ|ପୁସ୍ତକ)?|Exod)
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
		(?:ଲେବୀୟ(?:[\s\xa0]*ପୁସ୍ତକ)?|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଗଣନା(?:[\s\xa0]*ପୁସ୍ତକ)?|Num)
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
		(?:ଯିରିମିୟଙ୍କ[\s\xa0]*ବିଳାପ|Lam)
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
		(?:ଯୋହନଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରକାଶିତ[\s\xa0]*ବାକ୍ୟ|Rev)
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
		(?:ଦ୍ୱିତୀୟ[\s\xa0]*ବିବରଣୀ?|ବିବରଣି|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯିହୋଶୂୟଙ୍କର(?:[\s\xa0]*ପୁସ୍ତକ)?|Josh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ବିଗ୍ଭରକର୍ତ୍ତାମାନଙ୍କ[\s\xa0]*ବିବରଣ|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଋତର[\s\xa0]*ବିବରଣ[\s\xa0]*ପୁସ୍ତକ|Ruth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		1Esd
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		2Esd
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯ(?:[ାୀ]ଶାଇୟ|ିଶାଇୟ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କର[\s\xa0]*ପୁସ୍ତକ)?)|ୟ(?:ଶାଇୟ|ିଶାୟ)|Isa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଶାମୁୟେଲଙ୍କ[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପୁସ୍ତକ|ଦ୍ୱିତୀୟ[\s\xa0]*ଶାମୁୟେଲଙ?|2(?:\.[\s\xa0]*ଶାମୁୟେଲଙ?|[\s\xa0]*ଶାମୁୟେଲଙ?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଶାମୁୟେଲଙ୍କ[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପୁସ୍ତକ|ପ୍ରଥମ[\s\xa0]*ଶାମୁୟେଲଙ?|1(?:\.[\s\xa0]*ଶାମୁୟେଲଙ?|[\s\xa0]*ଶାମୁୟେଲଙ?|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ରାଜାବଳୀର[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପୁସ୍ତକ|ଦ୍ୱିତୀୟ[\s\xa0]*ରାଜାବଳୀର?|2(?:\.[\s\xa0]*ରାଜାବଳୀର?|[\s\xa0]*ରାଜାବଳୀର?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ରାଜାବଳୀର[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପୁସ୍ତକ|ପ୍ରଥମ[\s\xa0]*ରାଜାବଳୀର?|1(?:\.[\s\xa0]*ରାଜାବଳୀର?|[\s\xa0]*ରାଜାବଳୀର?|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ବଂଶାବଳୀର[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପୁସ୍ତକ|ଦ୍ୱିତୀୟ[\s\xa0]*ବଂଶାବଳୀର?|2(?:\.[\s\xa0]*ବଂଶାବଳୀର?|[\s\xa0]*ବଂଶାବଳୀର?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ବଂଶାବଳୀର[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପୁସ୍ତକ|ପ୍ରଥମ[\s\xa0]*ବଂଶାବଳୀର?|1(?:\.[\s\xa0]*ବଂଶାବଳୀର?|[\s\xa0]*ବଂଶାବଳୀର?|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଏଜ୍ରା|Ezra)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ନିହିମିୟାଙ୍କର(?:[\s\xa0]*ପୁସ୍ତକ)?|Neh)
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
		(?:ଏଷ୍ଟର[\s\xa0]*ବିବରଣ|Esth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଆୟୁବ(?:[\s\xa0]*ପୁସ୍ତକ)?|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଗ(?:ାତସଂହିତା|ୀତ(?:ିସଂହିତା|ସଂହିତା))|Ps)
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
		(?:ହିତୋପଦେଶ|Prov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଉପଦେଶକ|Eccl)
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
		(?:ପରମଗୀତ|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯିରିମିୟ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Jer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯିହିଜିକଲ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Ezek)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଦାନିୟେଲଙ(?:୍କ[\s\xa0]*ପୁସ୍ତକ)?|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ହୋଶ(?:ହେ|େୟ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?)|Hos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯୋୟେଲ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Joel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Amos|ଆମୋଷ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଓବଦିଅ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Obad)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|ଯୂନସ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ମ(?:ିଖା|ୀଖା(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?)|Mic)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ନାହୂମ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ହବ(?:‌କ୍‌କୂକ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|କ[ୁୂ]କ୍)|Hab)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ସିଫନିୟ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ହାଗୟ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Hag)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯିଖରିୟ(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Zech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ମଲାଖି(?:[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)?|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ମାଥିଉ(?:[\s\xa0]*ଲିଖିତ[\s\xa0]*ସୁସମାଗ୍ଭର)?|Matt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ମାର୍କ(?:[\s\xa0]*ଲିଖିତ[\s\xa0]*ସୁସମାଗ୍ଭର)?|Mark)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Luke|ଲୂକ(?:[\s\xa0]*ଲିଖିତ[\s\xa0]*ସୁସମାଗ୍ଭର)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଯୋହନଙ୍କ[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ପ୍ରଥମ[\s\xa0]*ଯୋହନଙ|1(?:\.[\s\xa0]*ଯୋହନଙ|[\s\xa0]*ଯୋହନଙ|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଯୋହନଙ୍କ[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|ଦ୍ୱିତୀୟ[\s\xa0]*ଯୋହନଙ|2(?:\.[\s\xa0]*ଯୋହନଙ|[\s\xa0]*ଯୋହନଙ|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଯୋହନଙ୍କ[\s\xa0]*ତୃତୀୟ[\s\xa0]*ପତ୍ର|ତୃତୀୟ[\s\xa0]*ଯୋହନଙ|3(?:\.[\s\xa0]*ଯୋହନଙ|[\s\xa0]*ଯୋହନଙ|John))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:John|ଯୋହନ(?:[\s\xa0]*ଲିଖିତ[\s\xa0]*ସୁସମାଗ୍ଭର)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ପ୍ରେରିତ(?:ମାନଙ୍କ[\s\xa0]*କାର୍ଯ୍ୟର[\s\xa0]*ବିବରଣ)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ରୋମୀୟଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Rom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:କରିନ୍ଥୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|ଦ୍ୱିତୀୟ[\s\xa0]*କରିନ୍ଥୀୟ(?:ଙ୍କ)?|2(?:\.[\s\xa0]*କରିନ୍ଥୀୟ(?:ଙ୍କ)?|[\s\xa0]*କରିନ୍ଥୀୟ(?:ଙ୍କ)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:କରିନ୍ଥୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ପ୍ରଥମ[\s\xa0]*କରିନ୍ଥୀୟ(?:ଙ୍କ)?|1(?:\.[\s\xa0]*କରିନ୍ଥୀୟ(?:ଙ୍କ)?|[\s\xa0]*କରିନ୍ଥୀୟ(?:ଙ୍କ)?|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଗାଲାତୀୟଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Gal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଏଫିସୀୟଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Eph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଫିଲି‌ପ୍‌ପୀୟଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Phil)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:କଲସୀୟଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Col)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଥେସଲନୀକୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|ଦ୍ୱିତୀୟ[\s\xa0]*ଥେସଲନୀକୀୟଙ|2(?:\.[\s\xa0]*ଥେସଲନୀକୀୟଙ|[\s\xa0]*ଥେସଲନୀକୀୟଙ|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ଥେସଲନୀକୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ପ୍ରଥମ[\s\xa0]*ଥେସଲନୀକୀୟଙ|1(?:\.[\s\xa0]*ଥେସଲନୀକୀୟଙ|[\s\xa0]*ଥେସଲନୀକୀୟଙ|Thess))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ତୀମଥିଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|ଦ୍ୱିତୀୟ[\s\xa0]*ତୀମଥିଙ୍କ|2(?:\.[\s\xa0]*ତୀମଥିଙ୍କ|[\s\xa0]*ତୀମଥିଙ୍କ|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ତୀମଥିଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ପ୍ରଥମ[\s\xa0]*ତୀମଥିଙ୍କ|1(?:\.[\s\xa0]*ତୀମଥିଙ୍କ|[\s\xa0]*ତୀମଥିଙ୍କ|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ତୀତସଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Titus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଫିଲୀମୋନଙ୍କ(?:[\s\xa0]*ପ୍ରତି[\s\xa0]*ପତ୍ର)?|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଏବ୍ରୀ|Heb)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯାକୁବଙ୍କ(?:[\s\xa0]*ପତ୍ର)?|Jas)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ପିତରଙ୍କ[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|ଦ୍ୱିତୀୟ[\s\xa0]*ପିତରଙ|2(?:\.[\s\xa0]*ପିତରଙ|[\s\xa0]*ପିତରଙ|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		(?:ପ(?:ିତରଙ୍କ[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|୍ରଥମ[\s\xa0]*ପିତରଙ)|1(?:\.[\s\xa0]*ପିତରଙ|[\s\xa0]*ପିତରଙ|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ଯିହୂଦାଙ୍କ(?:[\s\xa0]*ପତ୍ର)?|Jude)
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
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		2Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		3Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
		4Macc
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱ])(
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

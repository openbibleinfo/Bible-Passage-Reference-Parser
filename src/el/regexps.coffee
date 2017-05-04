bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | (?:ο#{bcv_parser::regexps.space}+τ[ίι]τλος|ο#{bcv_parser::regexps.space}+τ[ίι]τλοσ|τ[ίι]τλος|τ[ίι]τλοσ) (?! [a-z] )		#could be followed by a number
				  | και#{bcv_parser::regexps.space}+μετ[άα] | κεφ[άα]λαιον | κεφ[άα]λαια | κεφ[άα]λαιο | στ[ίι]χος | στ[ίι]χοι | στ[ίι]χοσ | κεφ | και | -
				  | [α-ε] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* (?:ο#{bcv_parser::regexps.space}+τ[ίι]τλος|ο#{bcv_parser::regexps.space}+τ[ίι]τλοσ|τ[ίι]τλος|τ[ίι]τλοσ)
	| \d \W* και#{bcv_parser::regexps.space}+μετ[άα] (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [α-ε] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "Α['’΄ʹʹ]\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "Β['’΄ʹʹ]\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "Γ['’΄ʹʹ]\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|και|-)"
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
		(?:Γ(?:ε(?:ν(?:εσ(?:ις|η))?)?|έν(?:εσ(?:ις|η))?)|Gen)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εξοδος)|(?:[ΕἜ]ξ|Exod|Έξοδος)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Β(?:ηλ(?:[\s\xa0]*και[\s\xa0]*Δρ[άα]κων)?|ὴλ)|Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Λε(?:υ(?:[ιϊ]τ(?:ικ[οό]ν?)?)?)?|Lev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Αρ(?:ιθ(?:μο[ίι])?)?|Num|Ἀρ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Σ(?:οφ[ίι]α[\s\xa0]*Σ(?:ειρ[άα]|ιρα)|ειρ[άα])χ|Sir)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Σοφ(?:[ίι]α(?:[\s\xa0]*Σ(?:ολ(?:ομ[ωώ]ντος)?|αλωμ[ωώ]ντος))?)?|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Θρ(?:[ήη]νοι(?:[\s\xa0]*Ιερεμ[ίι]ου)?)?|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Επιστολ(?:η[\s\xa0]*Ιερεμ[ίι]ου|[ηὴ][\s\xa0]*᾿Ιερ|ή[\s\xa0]*Ιερεμ[ίι]ου)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Απ(?:οκ(?:αλ(?:υψ(?:εις|η)|ύψεις)|αλυψις[\s\xa0]*Ιω[άα]ννου|άλυψ(?:ις[\s\xa0]*Ιω[άα]ννου|η))?)?|Rev|᾿Απ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Πρ(?:οσευχ[ήη][\s\xa0]*Μανασσ[ήη]|[\s\xa0]*Μαν)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Δε(?:υτ(?:ερ(?:ον[οό]μιον?)?)?)?|Deut)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ιη(?:σ(?:ο[υύ]ς[\s\xa0]*του[\s\xa0]*Ναυ[ήη]|[\s\xa0]*Ναυ[ήη]?))?|Josh|Ἰη)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Κρ(?:ιτ(?:[έε]ς|α[ίι])?)?|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Ρου|῾Ρ)θ|Ruth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρας|1Esd|Α['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρ?|[ΈΕ]σδρας[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρας|2Esd|Β['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρ?|[ΈΕ]σδρας[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Η(?:ΣΑ(?:Ϊ́|Ί|Ί?)ΑΣ|σ(?:α[ΐι]ας)?)|Isa|Ἠσ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*Σαμου[ήη]λ|2Sam|Β['ʹʹ΄’][\s\xa0]*Σαμ|Βασιλει[ωώ]ν[\s\xa0]*Β['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Σαμου[ήη]λ[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*Σαμου[ήη]λ|1Sam|Α['ʹʹ΄’][\s\xa0]*Σαμ|Βασιλει[ωώ]ν[\s\xa0]*Α['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Σαμου[ήη]λ[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*Βασιλ[έε]ων|2Kgs|Β['ʹʹ΄’][\s\xa0]*Βασ?|Βασιλει[ωώ]ν[\s\xa0]*Δ['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Βασιλ[έε]ων[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*Βασιλ[έε]ων|1Kgs|Α['ʹʹ΄’][\s\xa0]*Βασ?|Βασιλει[ωώ]ν[\s\xa0]*Γ['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Βασιλ[έε]ων[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*(?:Χρονικ[ωώ]ν|Παρ)|2Chr|Β['ʹʹ΄’][\s\xa0]*(?:Χρ(?:ον)?|Πα)|Παραλειπομ[έε]νων[\s\xa0]*Β['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Χρονικ[ωώ]ν[\s\xa0]*Β['ʹʹ΄’])|(?:Χρονικ[ωώ]ν[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*(?:Χρονικ[ωώ]ν|Παρ)|1Chr|Α['ʹʹ΄’][\s\xa0]*(?:Χρ(?:ον)?|Πα)|Παραλειπομ[έε]νων[\s\xa0]*Α['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Χρονικ[ωώ]ν[\s\xa0]*Α['ʹʹ΄’])|(?:Χρονικ[ωώ]ν[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εσδρας)|(?:[ΕἜ]σ|Ezra|Έσδρας)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Νε(?:εμ[ίι]ας)?|Neh)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εσθ[ήη]ρ[\s\xa0]*στα[\s\xa0]*ελληνικ[άα]|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εσθ(?:[ήη]ρ)?|Esth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Ι[ωώ]?|Ἰ)β|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ψα(?:λμ(?:ο(?:[ίι](?:[\s\xa0]*του[\s\xa0]*Δαυ[ίι]δ)?|ς)|ός))?|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Πρ(?:οσευχ[ήη][\s\xa0]*Αζαρ[ίι]ου|[\s\xa0]*Αζαρ)|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Π(?:αροιμ[ίι](?:αι|ες)|ρμ)|Prov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εκ(?:κλησιαστ[ήη]ς)?|Eccl|Ἐκ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[ΎΥ]μνος[\s\xa0]*των[\s\xa0]*Τρι[ωώ]ν[\s\xa0]*Πα[ίι]δων|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ασμα[\s\xa0]*Ασμ[άα]των|Song|Ἆσ|Ασ|Άσμα[\s\xa0]*Ασμ[άα]των)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ιε(?:ρεμ[ίι]ας)?|Jer|Ἰε)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ιεζ(?:εκ(?:ι[ήη]λ)?|κ)?|Ezek|᾿Ιζ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Δ(?:α(?:ν(?:ι[ήη]λ)?)?|ν)|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ωσ(?:η[έε])?|Hos|Ὠσ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:(?:Ι(?:ω[ήη])?|Ἰ)λ|Joel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Αμ[ωώ]ς|Ἀμ|Αμ|Amos)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Οβδ[ίι]ας|Obad|Ἀβδ|Αβδ(?:ιο[υύ])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ι(?:ων[άα]ς|ν)|Ἰν|Jonah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Μ(?:ΙΧΑ(?:Ϊ́|Ί|Ί?)ΑΣ|ιχα[ΐίι]ας|χ)|Mic)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Να(?:ο[υύ]μ)?|Nah)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Α(?:β(?:βακο[υύ]μ)?|μβακο[υύ]μ)|Hab|Ἀβ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Σ(?:οφον[ίι]ας|φν)|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Αγ(?:γα[ίι]ος)?|Hag|Ἀγ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ζ(?:α(?:χ(?:αρ[ίι]ας)?)?|χ)|Zech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Μα(?:λ(?:αχ[ίι]ας)?)?|Mal)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Μ(?:ατθα[ίι]ος|θ)|Matt|Ματθ|Κατ[άα][\s\xa0]*Ματθα[ίι]ον)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Μ(?:[άα]ρκος|ρ)|Mark|Μ[άα]ρκ|Κατ[άα][\s\xa0]*Μ[άα]ρκον)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Λ(?:ουκ[άα]ς|κ)|Luke|Λουκ|Κατ[άα][\s\xa0]*Λουκ[άα]ν)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*(?:Ιω[άα]ννη|᾿Ιω)|1John|Α['ʹʹ΄’][\s\xa0]*Ιω|Ιω[άα]ννου[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*(?:Ιω[άα]ννη|᾿Ιω)|2John|Β['ʹʹ΄’][\s\xa0]*Ιω|Ιω[άα]ννου[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Γ['ʹʹ΄’][\s\xa0]*(?:Ιω[άα]ννη|᾿Ιω)|3John|Γ['ʹʹ΄’][\s\xa0]*Ιω|Ιω[άα]ννου[\s\xa0]*Γ['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ιω[άα]ννης|John|Ἰω|Ιω(?:[άα]ν)?|Κατ[άα][\s\xa0]*Ιω[άα]ννην)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Πρ(?:[άα]ξ(?:εις(?:[\s\xa0]*των[\s\xa0]*Αποστ[οό]λων)?)?|ξ)|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ρωμα[ίι]ους)|(?:Προς[\s\xa0]*Ρωμα[ίι]ους|Ρωμ|῾Ρω|Rom)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*Κορινθ[ίι]ους|2Cor|Β['ʹʹ΄’][\s\xa0]*Κορ?|Προς[\s\xa0]*Κορινθ[ίι]ους[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*Κορινθ[ίι]ους|1Cor|Α['ʹʹ΄’][\s\xa0]*Κορ?|Προς[\s\xa0]*Κορινθ[ίι]ους[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Γαλ[άα]τες|Γαλ?|Gal|Προς[\s\xa0]*Γαλ[άα]τας)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εφεσ[ίι]ους|Eph|᾿Εφ|Εφ|Προς[\s\xa0]*Εφεσ[ίι]ους)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Φιλιππησ[ίι]ους|Phil|Φι|Προς[\s\xa0]*Φιλιππησ[ίι]ους)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Κολοσσαε[ίι]ς|Col|Κλ|Κολ|Προς[\s\xa0]*Κολοσσαε[ίι]ς)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*Θεσσαλονικε[ίι]ς|2Thess|Β['ʹʹ΄’][\s\xa0]*Θεσ?|Προς[\s\xa0]*Θεσσαλονικε[ίι]ς[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*Θεσσαλονικε[ίι]ς|1Thess|Α['ʹʹ΄’][\s\xa0]*Θεσ?|Προς[\s\xa0]*Θεσσαλονικε[ίι]ς[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*Τιμ[οό]θεο|2Tim|Β['ʹʹ΄’][\s\xa0]*Τιμ?|Προς[\s\xa0]*Τιμ[οό]θεον[\s\xa0]*Β['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*Τιμ[οό]θεο|1Tim|Α['ʹʹ΄’][\s\xa0]*Τιμ?|Προς[\s\xa0]*Τιμ[οό]θεον[\s\xa0]*Α['ʹʹ΄’])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Τ(?:[ίι]το|τ)|Titus|Τ[ίι]τ|Προς[\s\xa0]*Τ[ίι]τον)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Φιλ[ήη]μονα|Phlm|Φλμ|Προς[\s\xa0]*Φιλ[ήη]μονα)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Εβρα[ίι]ους)|(?:Προς[\s\xa0]*Εβρα[ίι]ους|Εβρ|Ἑβ|Heb|Εβ)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ιακ[ωώ]βου|Jas|᾿Ια)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Β['ʹʹ΄’][\s\xa0]*Π[έε](?:τ(?:ρ(?:ου)?)?)?|Π[έε]τρου[\s\xa0]*Β['ʹʹ΄’]|2Pet)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Α['ʹʹ΄’][\s\xa0]*Π[έε](?:τ(?:ρ(?:ου)?)?)?|Π[έε]τρου[\s\xa0]*Α['ʹʹ΄’]|1Pet)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jude|᾿Ιδ|Ιο[υύ]δα)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Τωβ(?:[ίι]τ)?|Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ι(?:ουδ[ίι]|δ)θ|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Β(?:αρ(?:ο[υύ]χ)?|ρ)|Bar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Σ(?:ουσ(?:[άα]ννα)?|ωσ[άα]ννα)|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Μακκαβα[ίι]ων[\s\xa0]*Β['ʹʹ΄’]|2Macc|Β['ʹʹ΄’][\s\xa0]*Μακκ(?:αβα[ίι]ων)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Μακκαβα[ίι]ων[\s\xa0]*Γ['ʹʹ΄’]|3Macc|Γ['ʹʹ΄’][\s\xa0]*Μακκ(?:αβα[ίι]ων)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Μακκαβα[ίι]ων[\s\xa0]*Δ['ʹʹ΄’]|4Macc|Δ['ʹʹ΄’][\s\xa0]*Μακκ(?:αβα[ίι]ων)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-Ͽ᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Μακκαβα[ίι]ων[\s\xa0]*Α['ʹʹ΄’]|1Macc|Α['ʹʹ΄’][\s\xa0]*Μακκ(?:αβα[ίι]ων)?)
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

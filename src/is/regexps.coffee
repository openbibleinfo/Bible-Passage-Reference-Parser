bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | kap[íi]tuli | kafli | kafla | vers | ff | og | -
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
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:1|I)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2|II)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3|III)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|og|-)"
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
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:1(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|I(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3]))seb[o\xF3]k|(?:Genesi|1M\xF3)s|I[\s\xa0]*M[o\xF3]s|Gen|I\.[\s\xa0]*M[o\xF3]s|1(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])s|Fyrsta[\s\xa0]*(?:b[o\xF3]k[\s\xa0]*M[o\xF3]se|M[o\xF3]seb[o\xF3]k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:II(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|2(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3]))seb[o\xF3]k|(?:2M\xF3|Exodu)s|2[\s\xa0]*M[o\xF3]s|Exod|2\.[\s\xa0]*M[o\xF3]s|II(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])s|[O\xD6]nnur[\s\xa0]*(?:b[o\xF3]k[\s\xa0]*M[o\xF3]se|M[o\xF3]seb[o\xF3]k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bel(?:[\s\xa0]*og[\s\xa0]*drekinn)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:III(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|3(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3]))seb[o\xF3]k|(?:Leviticu|3M\xF3)s|3[\s\xa0]*M[o\xF3]s|Lev|3\.[\s\xa0]*M[o\xF3]s|III(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])s|\xDEri\xF0ja[\s\xa0]*(?:b[o\xF3]k[\s\xa0]*M[o\xF3]se|M[o\xF3]seb[o\xF3]k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:IV(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|4(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3]))seb[o\xF3]k|4M\xF3s|Numeri|4[\s\xa0]*M[o\xF3]s|Num|4\.[\s\xa0]*M[o\xF3]s|IV(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])s|Fj[o\xF3]r\xF0a[\s\xa0]*(?:b[o\xF3]k[\s\xa0]*M[o\xF3]se|M[o\xF3]seb[o\xF3]k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S[i\xED]r(?:aksb[o\xF3]k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:peki[\s\xa0]*Sal[o\xF3]mons|Sal)|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H(?:armlj[o\xF3]\xF0in|lj)|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B(?:r[e\xE9]f[\s\xa0]*Jerem[i\xED]a|Jer)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Op(?:inberun(?:arb[o\xF3]k(?:[\s\xa0]*J[o\xF3]hannesar|in)|[\s\xa0]*J[o\xF3]hannesar)|b)|Rev)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B(?:\xE6n[\s\xa0]*Manasse|Mn)|PrMan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:5(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|V(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3]))seb[o\xF3]k|Deuteronomium|5M\xF3s|(?:5(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|V(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3]))s|Deut|Fimmta[\s\xa0]*(?:b[o\xF3]k[\s\xa0]*M[o\xF3]se|M[o\xF3]seb[o\xF3]k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:\xF3s(?:[u\xFA]ab[o\xF3]k)?|os(?:[u\xFA]ab[o\xF3]k|h)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:D[o\xF3]m(?:arab[o\xF3]k(?:in)?)?|Judg)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rut(?:arb[o\xF3]k|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jes(?:aja)?|Isa)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S[i\xED]\xF0ari[\s\xa0]*Sam[u\xFA]elsb[o\xF3]k|(?:2(?:\.[\s\xa0]*|[\s\xa0]*)?|II\.?[\s\xa0]*)Sam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrri[\s\xa0]*Sam[u\xFA]elsb[o\xF3]k|(?:1(?:\.[\s\xa0]*|[\s\xa0]*)?|I\.?[\s\xa0]*)Sam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S(?:\xED\xF0ari[\s\xa0]*(?:(?:Konungab[o\xF3]|konungab\xF3)k|b[o\xF3]k[\s\xa0]*konunganna)|i\xF0ari[\s\xa0]*(?:b[o\xF3]k[\s\xa0]*konunganna|Konungab[o\xF3]k))|2(?:[\s\xa0]*Kon|Kgs|\.[\s\xa0]*Kon)|II\.?[\s\xa0]*Kon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrri[\s\xa0]*(?:(?:Konungab[o\xF3]|konungab\xF3)k|b[o\xF3]k[\s\xa0]*konunganna)|1(?:[\s\xa0]*Kon|Kgs|\.[\s\xa0]*Kon)|I\.?[\s\xa0]*Kon)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S(?:\xED\xF0ari[\s\xa0]*(?:Kron[i\xED]kub[o\xF3]|kron\xEDkub\xF3)|i\xF0ari[\s\xa0]*Kron[i\xED]kub[o\xF3])k|2(?:[\s\xa0]*Kro|Chr|\.[\s\xa0]*Kro)|II\.?[\s\xa0]*Kro)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrri[\s\xa0]*(?:Kron[i\xED]kub[o\xF3]|kron\xEDkub\xF3)k|1(?:[\s\xa0]*Kro|Chr|\.[\s\xa0]*Kro)|I\.?[\s\xa0]*Kro)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:sr(?:ab[o\xF3]k)?|zra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Neh(?:em[i\xED]ab[o\xF3]k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Esterarb[o\xF3]k[\s\xa0]*hin[\s\xa0]*gr[i\xED]ska|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:erarb[o\xF3]k|h)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Job(?:sb[o\xF3]k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:[a\xE1]lmarnir|lm)|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B\xE6n[\s\xa0]*Asarja|PrAzar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:O(?:r\xF0skvi\xF0irnir|kv)|Prov)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Pr[e\xE9]d(?:ikarinn)?|Eccl)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lofs[o\xF6]ngur[\s\xa0]*ungmennanna[\s\xa0]*\xFEriggja|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Lj(?:[o\xF3]\xF0alj[o\xF3]\xF0in|l)|Song)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jer(?:em[i\xED]a)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:s(?:ek[i\xED]el|k)|zek))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Dan(?:[i\xED]el)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:H[o\xF3]s(?:ea)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:[o\xF3]e)?l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Am(?:os)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ob(?:ad(?:[i\xED]a)?)?|\xD3b(?:ad[i\xED]a)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:on(?:a[hs])?|\xF3n(?:as)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:i(?:ka?|c)|\xEDka?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Nah(?:[u\xFA]m)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hab(?:akkuk)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sef(?:an[i\xED]a)?|Zeph)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hag(?:ga[i\xED])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Sak(?:ar[i\xED]a)?|Zech)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mal(?:ak[i\xED])?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Matt(?:eusargu\xF0spjall)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:ark(?:[u\xFA]sargu\xF0spjall)?|rk))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:\xFAk(?:asargu\xF0spjall)?|uk(?:asargu\xF0spjall|e)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:1John)|(?:Fyrsta[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar[\s\xa0]*hi\xF0[\s\xa0]*almenna|J[o\xF3]hannesarbr[e\xE9]f)|[1I](?:\.[\s\xa0]*J[o\xF3]|[\s\xa0]*J[o\xF3])h)|(?:Fyrsta[\s\xa0]*br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:2John)|(?:Anna\xF0[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar|J[o\xF3]hannesarbr[e\xE9]f)|(?:II(?:\.[\s\xa0]*J[o\xF3]|[\s\xa0]*J[o\xF3])|2(?:\.[\s\xa0]*J[o\xF3]|[\s\xa0]*J[o\xF3]))h)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:3John)|(?:\xDEri\xF0ja[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar|J[o\xF3]hannesarbr[e\xE9]f)|(?:III(?:\.[\s\xa0]*J[o\xF3]|[\s\xa0]*J[o\xF3])|3(?:\.[\s\xa0]*J[o\xF3]|[\s\xa0]*J[o\xF3]))h)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:\xF3h(?:annesargu\xF0spjall)?|oh(?:annesargu\xF0spjall|n)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Post(?:ulasagan)?|Acts)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:R(?:[o\xF3]mverjabr[e\xE9]fi\xF0|[o\xF3]m)|Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*R[o\xF3]mverja)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S[i\xED]\xF0ara[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Kori(?:ntumanna)?|K[o\xF3]rintubr[e\xE9]f)|(?:2(?:[\s\xa0]*K|C|\.[\s\xa0]*K)|II\.?[\s\xa0]*K)or)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrra[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Korin(?:tumanna)?|Korintubr[e\xE9]f)|(?:1(?:[\s\xa0]*K|C|\.[\s\xa0]*K)|I\.?[\s\xa0]*K)or)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Galatamanna|Gal(?:atabr[e\xE9]fi\xF0)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Efesusmanna|E(?:fesusbr[e\xE9]fi\xF0|ph|f))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Filipp[i\xED]manna?|Filipp[i\xED]br[e\xE9]fi\xF0|Phil|Fil)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*K[o\xF3]lossumanna?|K[o\xF3]l[ou]ssubr[e\xE9]fi\xF0|Col|K[o\xF3]l)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S[i\xED]\xF0ara[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*\xDEess(?:alon[i\xED]kumanna)?|\xDEessalon[i\xED]kubr[e\xE9]f)|(?:2(?:[\s\xa0]*\xDE|Th|\.[\s\xa0]*\xDE)|II\.?[\s\xa0]*\xDE)ess)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrra[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*\xDEessa(?:lon[i\xED]kumanna)?|\xDEessalon[i\xED]kubr[e\xE9]f)|(?:1(?:[\s\xa0]*\xDE|Th|\.[\s\xa0]*\xDE)|I\.?[\s\xa0]*\xDE)ess)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S[i\xED]\xF0ara[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]m[o\xF3](?:teusar)?|T[i\xED]m[o\xF3]teusarbr[e\xE9]f)|(?:2(?:[\s\xa0]*T[i\xED]|Ti|\.[\s\xa0]*T[i\xED])|II(?:\.[\s\xa0]*T[i\xED]|[\s\xa0]*T[i\xED]))m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrra[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]m[o\xF3]t(?:eusar)?|T[i\xED]m[o\xF3]teusarbr[e\xE9]f)|(?:1(?:[\s\xa0]*T[i\xED]|Ti|\.[\s\xa0]*T[i\xED])|I(?:\.[\s\xa0]*T[i\xED]|[\s\xa0]*T[i\xED]))m)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T[i\xED]tusarbr[e\xE9]fi\xF0)|(?:T(?:(?:\xEDtusarbr[e\xE9]|itusarbr[e\xE9])f|it(?:us)?|\xEDt)|Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]tusar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*F[i\xED]lemons|F[i\xED]l(?:emonsbr[e\xE9]fi\xF0|m)|Phlm)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Br[e\xE9]fi\xF0[\s\xa0]*til[\s\xa0]*Hebrea|Heb(?:reabr[e\xE9]fi\xF0)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Hi\xF0[\s\xa0]*almenna[\s\xa0]*br[e\xE9]f[\s\xa0]*Jakobs|Ja(?:kobsbr[e\xE9]fi\xF0|s|k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:S[i\xED]\xF0ara[\s\xa0]*(?:almenna[\s\xa0]*br[e\xE9]f[\s\xa0]*P[e\xE9]turs|P[e\xE9]tursbr[e\xE9]f)|(?:2(?:[\s\xa0]*P[e\xE9]|Pe|\.[\s\xa0]*P[e\xE9])|II(?:\.[\s\xa0]*P[e\xE9]|[\s\xa0]*P[e\xE9]))t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrra[\s\xa0]*(?:almenna[\s\xa0]*br[e\xE9]f[\s\xa0]*P[e\xE9]turs|P[e\xE9]tursbr[e\xE9]f)|(?:1(?:[\s\xa0]*P[e\xE9]|Pe|\.[\s\xa0]*P[e\xE9])|I(?:\.[\s\xa0]*P[e\xE9]|[\s\xa0]*P[e\xE9]))t)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:ud(?:asarbr[e\xE9]fi\xF0|e)|\xFAdasarbr[e\xE9]fi\xF0|\xFAd(?:asarbr[e\xE9]f)?|ud(?:asarbr[e\xE9]f)?)|Hi\xF0[\s\xa0]*almenna[\s\xa0]*br[e\xE9]f[\s\xa0]*J[u\xFA]dasar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:ob(?:[i\xED]tsb[o\xF3]k)?|\xF3b[i\xED]tsb[o\xF3]k))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:J(?:[u\xFA]d(?:[i\xED]tarb[o\xF3]k|t)|dt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Bar(?:[u\xFA]ksb[o\xF3]k)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S(?:us(?:anna)?|\xFAsanna))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:[O\xD6]nnur[\s\xa0]*Makkabeab[o\xF3]k|(?:II\.?|2\.?)[\s\xa0]*Makk|2Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:\xDEri\xF0ja[\s\xa0]*Makkabeab[o\xF3]k|(?:III\.?|3\.?)[\s\xa0]*Makk|3Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fj[o\xF3]r\xF0a[\s\xa0]*Makkabeab[o\xF3]k|(?:IV\.?|4\.?)[\s\xa0]*Makk|4Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Fyrsta[\s\xa0]*Makkabeab[o\xF3]k|(?:1\.?|I\.?)[\s\xa0]*Makk|1Macc)
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

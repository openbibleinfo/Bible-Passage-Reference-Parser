bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | [^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ] )	# Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
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
				  | அதிகாரம் | மற்றும் | verse | அதி | ff | to
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
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:முதலாவது|Mutal[āa]vatu|1)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:இரண்டாம|இரண்டாவது|Ira[ṇn][ṭt][āa]vatu|2)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:முன்றாம்|மூன்றாவது|M[ūu][ṉn][ṛr][āa]vatu|3)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|மற்றும்|to)"
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
		(?:[AĀ]tiy(?:[aā]kamam)|தொ(?:டக்க[\s\xa0]*நூல்|நூ)|Gen|ஆதி(?:யாகமம்)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y[aā]ttir(?:[aā]kamam)|Exod|யாத்(?:திராகமம்)?|வி(?:டுதலைப்[\s\xa0]*பயணம்|ப))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:பேல்(?:[\s\xa0]*தெய்வமும்[\s\xa0]*அரக்கப்பாம்பும்(?:[\s\xa0]*என்பவையாகும்)?)?|Bel)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:லேவி(?:யர(?:ாகமம்|்))?|L(?:ēviyar[aā]kamam|ev(?:iyar[aā]kamam)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E[nṇ](?:[nṇ](?:[aā]kamam))|Num|எண்(?:ண(?:ாகமம்|ிக்கை))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:சீ(?:ராக்(?:கின்[\s\xa0]*ஞானம்|[\s\xa0]*ஆகமம்)|ஞா)|Sir)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ஞானாகமம்|சா(?:லமோனின்[\s\xa0]*ஞானம்|ஞா)|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:எரேமியாவின்[\s\xa0]*புலம்பல்|Pulampal|Lam|புல(?:ம்(?:பல்)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:அவை[\s\xa0]*இளைஞர்[\s\xa0]*மூவரின்[\s\xa0]*பாடல்|எரேமியாவின்[\s\xa0]*(?:கடிதம்|மடல்)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:யோவானுக்கு[\s\xa0]*வெளிப்படுத்தின[\s\xa0]*விசேஷம்|Ve[lḷ]ippa(?:[tṭ]utti(?:[nṉ]a[\s\xa0]*Vic(?:[eē](?:[tṭ]a(?:[nṅ]ka[lḷ])))))|தி(?:ருவெளிப்பாடு|வெ)|வெளி(?:ப்படுத்தின[\s\xa0]*விசேடங்கள்)?|Rev)|Ve[lḷ]ippa(?:[tṭ]utti(?:[ṉn]a))
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
		(?:Up[aā]kamam|Deut|உபா(?:கமம்)?|இ(?:ணைச்[\s\xa0]*சட்டம்|ச))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y[oō]cuv[aā]|Josh|யோசு(?:வா(?:வின்[\s\xa0]*புத்தகம்)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Niy[aā]y(?:[aā]tipatika[lḷ])|Judg|ந(?:ியா(?:யாதிபதிகள(?:ின்[\s\xa0]*புத்தகம்|்(?:[\s\xa0]*ஆகமம்)?))?|ீத(?:ி(?:த்[\s\xa0]*தலைவர்கள்|பதிகள்))?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:ரூத்(?:த(?:ின்[\s\xa0]*சரித்திரம்|ு))?|R(?:uth?|ūt))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		1(?:[\s\xa0]*எஸ்திராஸ்|Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		2(?:[\s\xa0]*எஸ்திராஸ்|Esd)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ec[aā]y[aā]|Isa|எசா(?:யா)?|ஏசா(?:யா(?:[\s\xa0]*தீர்க்கதரிசியின்[\s\xa0]*புத்தகம்)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:சாமுவேலின்[\s\xa0]*இரண்டாம்[\s\xa0]*புத்தகம்|2(?:[\s\xa0]*(?:C[aā]muv(?:[eē]l)|அரசுகள்|சாமு(?:வேல்)?)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:சாமுவேலின்[\s\xa0]*முதலாம்[\s\xa0]*புத்தகம்|1(?:[\s\xa0]*(?:C[aā]muv(?:[eē]l)|அரசுகள்|சாமு(?:வேல்)?)|Sam))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:இராஜாக்களின்[\s\xa0]*இரண்டாம்[\s\xa0]*புத்தகம்|4[\s\xa0]*அரசுகள்|2(?:[\s\xa0]*(?:Ir[aā]j(?:[aā]kka[lḷ])|இரா(?:ஜா(?:க்கள்)?)?|அர(?:சர்கள்)?)|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:இராஜாக்களின்[\s\xa0]*முதலாம்[\s\xa0]*புத்தகம்|3[\s\xa0]*அரசுகள்|1(?:[\s\xa0]*(?:Ir[aā]j(?:[aā]kka[lḷ])|இரா(?:ஜா(?:க்கள்)?)?|அர(?:சர்கள்)?)|Kgs))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:நாளாகமத்தின்[\s\xa0]*இரண்டாம்[\s\xa0]*புத்தகம்|2(?:[\s\xa0]*(?:N[aā](?:[lḷ](?:[aā]kamam))|குறி(?:ப்பேடு)?|நாளா(?:கமம்)?)|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:நாளாகமத்தின்[\s\xa0]*முதலாம்[\s\xa0]*புத்தகம்|1(?:[\s\xa0]*(?:N[aā](?:[lḷ](?:[aā]kamam))|குறி(?:ப்பேடு)?|நாளா(?:கமம்)?)|Chr))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:எஸ்(?:ரா|றா(?:வின்[\s\xa0]*புத்தகம்)?)|E(?:s[rṛ][aā]|zra))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:நெகே(?:மியா(?:வின்[\s\xa0]*புத்தகம்)?)?|Ne(?:k[eē]miy[aā]|h))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:எஸ்(?:தர்[\s\xa0]*\(கி(?:ரேக்கம்\)|\))|[\s\xa0]*\(கி\))|GkEsth)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Est(?:ar|h)|எஸ்(?:தர(?:ின்[\s\xa0]*சரித்திரம்|்))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y[oō]pu|யோபு(?:டைய[\s\xa0]*சரித்திரம்)?|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:இளைஞர்[\s\xa0]*மூவரின்[\s\xa0]*பாடல்|SgThree)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:சாலொமோனின்[\s\xa0]*உன்னதப்பாட்டு|U[nṉ](?:[nṉ]atapp(?:[aā](?:[tṭ](?:[tṭ]u))))|Song|உன்ன(?:த[\s\xa0]*(?:சங்கீதம்|பாட்டு))?|இ(?:னிமைமிகு[\s\xa0]*பாடல்|பா))|(?:உன்னதப்பாட்டு|பாடல்)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ca[nṅ]k(?:[iī]tam)|தி(?:ருப்பாடல்(?:கள்)?|பா)|சங(?:கீதம்|்(?:கீ(?:த(?:[\s\xa0]*புத்தகம்|ங்கள்|ம்))?)?)|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:PrAzar|அசரியா)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:பழமொழி[\s\xa0]*ஆகமம்|N[iī]timo(?:[lḻ]ika[lḷ])|Prov|நீ(?:தி(?:மொழிகள்)?|மொ))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Piraca[nṅ]ki|Eccl|பிரச(?:ங்கி)?|ச(?:ங்கத்[\s\xa0]*திருவுரை[\s\xa0]*ஆகமம்|பை[\s\xa0]*உரையாளர்|உ))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Er[eē]miy[aā]|Jer|எரே(?:மியா(?:[\s\xa0]*தீர்க்கதரிசியின்[\s\xa0]*புத்தகம்)?)?|ஏரே(?:மியா)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:E(?:c[eē]kkiy(?:[eē]l)|zek)|எசே(?:க்கியேல்(?:[\s\xa0]*தீர்க்கதரிசியின்[\s\xa0]*புத்தகம்)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T[aā](?:[nṉ]iy(?:[eē]l))|தானி(?:யேல(?:ின்[\s\xa0]*புத்தகம்|்))?|Dan)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[OŌ]ciy[aā]|ஒசேயா|Hos|ஓச(?:[ிே](?:யா)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y[oō]v(?:[eē]l)|Joel|யோவே(?:ல்)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[AĀ]m(?:[oō]s)|ஆமோ(?:ஸ்)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:O(?:patiy[aā]|bad)|ஒப(?:தி(?:யா)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|Y[oō](?:[nṉ][aā])|யோனா)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:மீக(?:ா|்(?:கா)?)|M(?:īk[aā]|i(?:k[aā]|c)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:நாகூ(?:ம்)?|N(?:āk[uū]m|a(?:k[uū]m|h)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[AĀ]pak(?:[uū]k)|Hab|அப(?:க்கூக்கு)?|ஆப(?:கூக்)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ceppa[nṉ]iy[aā]|Zeph|செப்(?:பனியா)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[AĀ]k(?:[aā]y)|Hag|ஆகா(?:ய்)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Cakariy[aā]|Zech|ச(?:கரி(?:யா)?|ெக்(?:கரியா)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:எபிரேயம்|Mal(?:kiy[aā])?|மல(?:்கி(?:யா)?|ா(?:க்கி)?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Matt[eē]yu(?:[\s\xa0]*Na(?:[rṛ]ceyti)?)?|மத்(?:தேயு(?:[\s\xa0]*(?:எழுதிய[\s\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி))?)?)|Matt
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M(?:ā[rṛ]ku(?:[\s\xa0]*Na(?:[rṛ]ceyti)?)|a(?:ṛku(?:[\s\xa0]*Na[rṛ]ceyti)?|rk(?:u(?:[\s\xa0]*Na[rṛ]ceyti)?)?))|மாற்(?:கு(?:[\s\xa0]*(?:எழுதிய[\s\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி))?)?)|Mā(?:[rṛ]ku)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:L(?:ūkk[aā](?:[\s\xa0]*Na(?:[rṛ]ceyti)?)|uk(?:k[aā](?:[\s\xa0]*Na(?:[rṛ]ceyti)?)|e))|லூ(?:க்(?:கா(?:[\s\xa0]*(?:எழுதிய[\s\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி))?)?)?)|L(?:[uū]kk[aā])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Y[oō]va(?:[nṉ][\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Mutal(?:[aā]vatu[\s\xa0]*Nirupam)))|யோவ(?:ன்[\s\xa0]*எழுதிய[\s\xa0]*முதலாவது[\s\xa0]*நிருபம்|ான்[\s\xa0]*(?:எழுதிய[\s\xa0]*முதல(?:்[\s\xa0]*திருமுகம்|ாம்[\s\xa0]*கடிதம்)|முதல்[\s\xa0]*திருமுகம்))|Mutal[aā]vatu[\s\xa0]*யோவான்|முதலாவது[\s\xa0]*யோவான்|1(?:\.[\s\xa0]*யோவான்|John|[\s\xa0]*(?:அருளப்பர்|Y[oō]va[nṉ]|யோ(?:வா(?:ன்)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Y[oō]va(?:[nṉ][\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Ira(?:[nṇ](?:[tṭ](?:[aā]vatu[\s\xa0]*Nirupam)))))|யோவ(?:ன்[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாவது[\s\xa0]*நிருபம்|ான்[\s\xa0]*(?:எழுதிய[\s\xa0]*இரண்டாம்[\s\xa0]*(?:திருமுகம்|கடிதம்)|இரண்டாம்[\s\xa0]*திருமுகம்))|2(?:John|[\s\xa0]*(?:அருளப்பர்|Y[oō]va[nṉ]|யோ(?:வா(?:ன்)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Y[oō]va(?:[nṉ][\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*M(?:[uū](?:[nṉ](?:[rṛ](?:[aā]vatu[\s\xa0]*Nirupam))))))|யோவ(?:ன்[\s\xa0]*எழுதிய[\s\xa0]*மூன்றாவது[\s\xa0]*நிருபம்|ான்[\s\xa0]*(?:எழுதிய[\s\xa0]*ம(?:ுன்றாம்[\s\xa0]*திருமுகம்|ூன்றாம்[\s\xa0]*கடிதம்)|மூன்றாம்[\s\xa0]*திருமுகம்))|M[uū](?:[nṉ](?:[rṛ](?:[aā]vatu[\s\xa0]*யோவான்)))|ம(?:ூன்றாவது[\s\xa0]*யோவான்|ுன்றாம்[\s\xa0]*யோவான்)|3(?:\.[\s\xa0]*யோவான்|John|[\s\xa0]*(?:அருளப்பர்|Y[oō]va[nṉ]|யோ(?:வா(?:ன்)?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:அருளப்பர்[\s\xa0]*நற்செய்தி|Y[oō]v(?:[aā](?:[nṉ][\s\xa0]*Na(?:[rṛ]ceyti)))|John|யோவா(?:ன்[\s\xa0]*(?:எழுதிய[\s\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி))?)|(?:யோவான்|Y[ōo]v(?:[āa][nṉ]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:A(?:pp[oō]stalar[\s\xa0]*Pa(?:[nṇ]i)|cts)|அப்(?:போ(?:ஸ்தலர(?:ுடைய[\s\xa0]*நடபடிகள்|்(?:[\s\xa0]*பணி)?))?)?|தி(?:ருத்தூதர்[\s\xa0]*பணிகள்|ப))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ur[oō]marukku(?:[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)?)|ரோம(?:ாபுரியாருக்கு[\s\xa0]*எழுதிய[\s\xa0]*கடிதம்|ர்)|Rom|உரோ(?:ம(?:ருக்கு[\s\xa0]*எழுதிய[\s\xa0]*நிருபம்|ையர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*திருமுகம்|்)))?)|Ur(?:[oō]marukku)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Korintiyarukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira(?:[nṇ](?:[tṭ](?:[aā]vatu[\s\xa0]*Nirupam)))|கொரிந்தியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டா(?:வது[\s\xa0]*(?:திருமுகம்|நிருபம்)|ம்[\s\xa0]*(?:திருமுகம்|கடிதம்))|2(?:[\s\xa0]*(?:Korintiyarukku|கொ(?:ரி(?:ந்தியர்)?)?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Korintiyarukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal(?:[aā]vatu[\s\xa0]*Nirupam)|கொரிந்தியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதல(?:்[\s\xa0]*திருமுகம்|ா(?:வது[\s\xa0]*(?:திருமுகம்|நிருபம்)|ம்))|1(?:[\s\xa0]*(?:Korintiyarukku|கொ(?:ரி(?:ந்தியர்)?)?)|Cor))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kal[aā]ttiyarukku(?:[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)?)|Gal|கலா(?:த்(?:தியர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:திருமுகம்|நிருபம்|கடிதம்)|்))?)?)|Kal(?:[aā]ttiyarukku)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ep(?:[eē]ciyarukku(?:[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)?)|h)|எபே(?:சி(?:யர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:திருமுகம்|நிருபம்|கடிதம்)|்))?)?)|Ep(?:[eē]ciyarukku)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:ilippiyarukku(?:[\s\xa0]*E[lḻ]utiya[\s\xa0]*Nirupam)?|hil)|பிலி(?:ப்(?:பியர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:திருமுகம்|நிருபம்|கடிதம்)|்))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Kol[oō]ceyarukku(?:[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)?)|கொலோ(?:ச(?:ெயர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:நிருபம்|கடிதம்)|்)|ையர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*திருமுகம்|்)))?|Col)|Kol(?:[oō]ceyarukku)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tecal[oō](?:[nṉ]ikkiyarukku[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Ira(?:[nṇ](?:[tṭ](?:[aā]vatu[\s\xa0]*Nirupam)))))|தெசலோனிக்க(?:ியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாவது[\s\xa0]*நிருபம்|ருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டா(?:வது[\s\xa0]*திருமுகம்|ம்[\s\xa0]*திருமுகம்)|ேயருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாம்[\s\xa0]*கடிதம்)|2(?:Thess|[\s\xa0]*(?:Tecal[oō](?:[nṉ]ikkiyarukku)|தெச(?:லோ(?:னிக்க(?:ேயர்|ர்))?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Tecal[oō](?:[nṉ]ikkiyarukku[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Mutal(?:[aā]vatu[\s\xa0]*Nirupam)))|தெசலோனிக்க(?:ியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதலாவது[\s\xa0]*நிருபம்|ேயருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதலாம்[\s\xa0]*கடிதம்|ருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதல்[\s\xa0]*திருமுகம்)|1(?:Thess|[\s\xa0]*(?:Tecal[oō](?:[nṉ]ikkiyarukku)|தெச(?:லோ(?:னிக்க(?:ேயர்|ர்))?)?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:T[iī]m(?:[oō]tt(?:[eē]yuvukku[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Ira(?:[nṇ](?:[tṭ](?:[aā]vatu[\s\xa0]*Nirupam))))))|த(?:ிம[ொோ]த்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாம்[\s\xa0]*திருமுகம்|ீமோத்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டா(?:வது[\s\xa0]*நிருபம்|ம்[\s\xa0]*கடிதம்))|2(?:[\s\xa0]*(?:T[iī]m(?:[oō]tt(?:[eē]yuvukku))|த(?:ீமோத்(?:தேயு)?|ிமொ(?:த்தேயு)?))|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:T[iī]m(?:[oō]tt(?:[eē]yuvukku[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Mutal(?:[aā]vatu[\s\xa0]*Nirupam))))|த(?:ிம[ொோ]த்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதல்[\s\xa0]*திருமுகம்|ீமோத்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதலா(?:வது[\s\xa0]*நிருபம்|ம்[\s\xa0]*கடிதம்))|1(?:[\s\xa0]*(?:T[iī]m(?:[oō]tt(?:[eē]yuvukku))|த(?:ீமோத்(?:தேயு)?|ிமொ(?:த்தேயு)?))|Tim))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:T(?:īttuvukku(?:[\s\xa0]*E[lḻ]utiya[\s\xa0]*Nirupam)?|it(?:tuvukku(?:[\s\xa0]*E[lḻ]utiya[\s\xa0]*Nirupam)?|us))|தீத்(?:து(?:க்கு[\s\xa0]*எழுதிய[\s\xa0]*திருமுகம்|வுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:திருமுகம்|நிருபம்|கடிதம்))?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:P(?:il[eē]m(?:[oō](?:[nṉ]ukku[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)))|hlm)|பில(?:மோன(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*திருமுகம்|்)|ே(?:மோன(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:நிருபம்|கடிதம்)|்))?)?)|Pil[eē]m(?:[ōo](?:[ṉn]ukku))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Epireyarukku(?:[\s\xa0]*E[lḻ]utiya[\s\xa0]*Nirupam)?|Heb|எபி(?:ர(?:ெயருக்கு[\s\xa0]*எழுதிய[\s\xa0]*நிருபம்|ே(?:யர(?:ுக்கு[\s\xa0]*எழுதிய[\s\xa0]*(?:திருமுகம்|கடிதம்)|்))?))?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Y[aā]kk(?:[oō]pu(?:[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)?))|யாக(?:ப்பர்[\s\xa0]*திருமுகம்|்(?:கோபு(?:[\s\xa0]*(?:எழுதிய[\s\xa0]*(?:திருமுகம்|நிருபம்|கடிதம்)|திருமுகம்))?)?)|Jas)|Y[aā]kk(?:[oō]pu)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:P[eē]turu[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Ira(?:[nṇ](?:[tṭ](?:[aā]vatu[\s\xa0]*Nirupam))))|பேதுரு[\s\xa0]*(?:எழுதிய[\s\xa0]*இரண்டா(?:வது[\s\xa0]*நிருபம்|ம்[\s\xa0]*(?:திருமுகம்|கடிதம்))|இரண்டாம்[\s\xa0]*திருமுகம்)|2(?:[\s\xa0]*(?:இராயப்பர்|P[eē]turu|பேது(?:ரு)?)|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:P[eē]turu[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Mutal(?:[aā]vatu[\s\xa0]*Nirupam))|பேதுரு[\s\xa0]*(?:எழுதிய[\s\xa0]*முதல(?:்[\s\xa0]*திருமுகம்|ா(?:வது[\s\xa0]*நிருபம்|ம்[\s\xa0]*கடிதம்))|முதல்[\s\xa0]*திருமுகம்)|1(?:[\s\xa0]*(?:இராயப்பர்|P[eē]turu|பேது(?:ரு)?)|Pet))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jude|Y[uū]t(?:[aā](?:[\s\xa0]*E(?:[lḻ]utiya[\s\xa0]*Nirupam)?))|யூதா(?:[\s\xa0]*(?:எழுதிய[\s\xa0]*(?:நிருபம்|கடிதம்)|திருமுகம்))?)|Y(?:[uū]t[aā])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:த(?:ொபியாசு[\s\xa0]*ஆகமம்|ோபி(?:த்து)?)|Tob)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:யூதி(?:த்து)?|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:பாரூ(?:க்கு)?|Bar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:சூசன்னா|Sus)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		2(?:[\s\xa0]*மக்(?:கபேயர்)?|Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		3(?:[\s\xa0]*மக்(?:கபேயர்)?|Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		4(?:[\s\xa0]*மக்(?:கபேயர்)?|Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		1(?:[\s\xa0]*மக்(?:கபேயர்)?|Macc)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John", "Josh", "Joel", "Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		யோ
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

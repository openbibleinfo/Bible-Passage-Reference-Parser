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
				  | [\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014]
				  | ba[şs]l[ıi]k (?! [a-z] )		#could be followed by a number
				  | a\.?#{bcv_parser::regexps.space}+ayeti | baplar | ayet | bap | ile | bp | vs | vd | ve
				  | [b-e] (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
bcv_parser::regexps.match_end_split = ///
	  \d \W* ba[şs]l[ıi]k
	| \d \W* (?:vs|vd) (?: [\s\xa0*]* \.)?
	| \d [\s\xa0*]* [b-e] (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]"

bcv_parser::regexps.first = "(?:1|I|Bir(inci)?|[[İI]i]lk)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "(?:2|II|[[İI]i]ki|[[İI]i]kinci)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "(?:3|III|[ÜU][çc]([üu]nc[üu])?)\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|ve|ile)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|ile)"
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
		(?:Te(?:sn[Iİı]ye|kv[Iİı]n)|Gen|Yar(?:at[Iİı]l(?:[Iİı][sş]))?)|(?:Yarat(?:[ıİI]li[şs]|il[iıİI][şs])|Te(?:sniye|kvin))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Exod"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:M[Iİı]s(?:[Iİı]r(?:(?:['’]dan[\s\xa0]*(?:[CÇ](?:[Iİı]k(?:[Iİı][sş])))|dan[\s\xa0]*[CÇ](?:[Iİı]k(?:[Iİı][sş])))))|Exod|[CÇ](?:[Iİı]k))|(?:M(?:[ıIİ]s(?:(?:[İıI]r(?:(?:['’]dan[\s\xa0]*(?:[ÇC](?:(?:[ıİI]ki[sş]|ik[ıIiİ][sş])))|dan[\s\xa0]*[ÇC](?:(?:[İıI]ki[sş]|ik[iİıI][şs]))))|ir(?:[’']dan[\s\xa0]*(?:[ÇC](?:[iıIİ]k(?:[ıİIi][şs])))|dan[\s\xa0]*[CÇ](?:[Iİiı]k(?:[ıİIi][şs])))))|is[İIıi]r(?:(?:['’]dan[\s\xa0]*(?:[ÇC](?:[iİıI]k(?:[İıiI][sş])))|dan[\s\xa0]*[ÇC](?:[ıiİI]k(?:[iİIı][sş])))))|[CÇ](?:(?:[İıI]k(?:[İıIi][sş])|ik(?:[iİIı][sş])?)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bel"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bel(?:[\s\xa0]*ve[\s\xa0]*Ejderha)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Lev[Iiİı]l(?:[Iiİı]ler)?|Lev
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Num"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[CÇ](?:[oö]lde[\s\xa0]*Say(?:[Iİı]m))|Num|Say(?:[Iİı]lar)?)|(?:[CÇ](?:[öo]lde[\s\xa0]*Sayim)|Sayilar)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sir"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		S(?:[Iİı]rak|ir(?:ak)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Wis"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:B[Iiİı]lgelik|Wis)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Lam"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:A(?:[gğ](?:[Iiİı](?:tlar)?))|Lam)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["EpJer"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Yeremya(?:['’]n(?:[Iiİı]n[\s\xa0]*Mektubu)|n[Iiİı]n[\s\xa0]*Mektubu)|EpJer)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rev"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Rev|Va(?:h(?:[Iiİı]y)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrMan"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mana[sş](?:[sş]e(?:(?:['’]n(?:[Iİı]n[\s\xa0]*Duas[Iİı])|n[Iİı]n[\s\xa0]*Duas[Iİı])))|PrMan)|Mana(?:[sş](?:[sş]e(?:(?:['’]n(?:in[\s\xa0]*Duas[Iıiİ]|[ıIİ]n[\s\xa0]*Duasi))|n(?:[Iıİ]n[\s\xa0]*Duasi|in[\s\xa0]*Duas[İıIi]))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Deut"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Deut|Yas(?:a(?:['’]n(?:[Iİı]n[\s\xa0]*Tekrar[Iİı])|n[Iİı]n[\s\xa0]*Tekrar[Iİı]))?)|Yasa(?:['’]n(?:(?:[Iıİ]n[\s\xa0]*Tekrari|in[\s\xa0]*Tekrar[Iiİı]))|n(?:[İıI]n[\s\xa0]*Tekrari|in[\s\xa0]*Tekrar[Iİiı]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Josh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Josh|Y(?:e[sş]u|[sş]u))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Judg"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Judg|Hak(?:[Iiİı]mler)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ruth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ruth?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Esdras|[\s\xa0]*Esdras)|[iİ]lk[\s\xa0]*Esdras|I(?:lk[\s\xa0]*Esdras|\.[\s\xa0]*Esdras|[\s\xa0]*Esdras)|1(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Esd"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[iİ]ki(?:nci[\s\xa0]*Esdras|[\s\xa0]*Esdras))|I(?:ki(?:nci[\s\xa0]*Esdras|[\s\xa0]*Esdras)|I(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras))|2(?:\.[\s\xa0]*Esdras|[\s\xa0]*Esdras|Esd))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Isa"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Isa|Y(?:e[sş]aya|[sş]a))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[iİ]ki(?:nci[\s\xa0]*Samuel|[\s\xa0]*Samuel))|I(?:ki(?:nci[\s\xa0]*Samuel|[\s\xa0]*Samuel)|I(?:\.[\s\xa0]*Samuel|[\s\xa0]*Samuel))|2(?:[\s\xa0]*Samuel|\.(?:[\s\xa0]*Samuel|\?[\s\xa0]*Sa)|\?[\s\xa0]*Sa|Sam?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Sam"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Samuel|[\s\xa0]*Samuel)|[iİ]lk[\s\xa0]*Samuel|I(?:lk[\s\xa0]*Samuel|\.[\s\xa0]*Samuel|[\s\xa0]*Samuel)|1(?:[\s\xa0]*Samuel|\.(?:[\s\xa0]*Samuel|\?[\s\xa0]*Sa)|\?[\s\xa0]*Sa|Sam?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[iİ]ki(?:nci[\s\xa0]*Krallar|[\s\xa0]*Krallar))|I(?:ki(?:nci[\s\xa0]*Krallar|[\s\xa0]*Krallar)|I(?:\.[\s\xa0]*Krallar|[\s\xa0]*Krallar))|2(?:[\s\xa0]*Krallar|\.(?:[\s\xa0]*Krallar|\?[\s\xa0]*Kr)|\?[\s\xa0]*Kr|K(?:gs|r)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Kgs"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Krallar|[\s\xa0]*Krallar)|[iİ]lk[\s\xa0]*Krallar|I(?:lk[\s\xa0]*Krallar|\.[\s\xa0]*Krallar|[\s\xa0]*Krallar)|1(?:[\s\xa0]*Krallar|\.(?:[\s\xa0]*Krallar|\?[\s\xa0]*Kr)|\?[\s\xa0]*Kr|K(?:gs|r)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:İki(?:nci[\s\xa0]*Tar[Iİı]hler|[\s\xa0]*Tar[Iİı]hler)|I(?:ki(?:nci[\s\xa0]*Tar[Iİı]hler|[\s\xa0]*Tar[Iİı]hler)|I(?:\.[\s\xa0]*Tar[Iİı]hler|[\s\xa0]*Tar[Iİı]hler))|2(?:[\s\xa0]*Tar[Iİı]hler|\.(?:[\s\xa0]*Tar[Iİı]hler|\?[\s\xa0]*Ta)|\?[\s\xa0]*Ta|Chr|Ta))|(?:İki(?:nci[\s\xa0]*Tarihler|[\s\xa0]*Tarihler)|iki(?:nci[\s\xa0]*Tar[İıiI]hler|[\s\xa0]*Tar[iıIİ]hler)|I(?:ki(?:nci[\s\xa0]*Tarihler|[\s\xa0]*Tarihler)|I(?:\.[\s\xa0]*Tarihler|[\s\xa0]*Tarihler))|2(?:\.[\s\xa0]*Tarihler|[\s\xa0]*Tarihler))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Chr"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Tar[Iİı]hler|[\s\xa0]*Tar[Iİı]hler)|İlk[\s\xa0]*Tar[Iİı]hler|I(?:lk[\s\xa0]*Tar[Iİı]hler|\.[\s\xa0]*Tar[Iİı]hler|[\s\xa0]*Tar[Iİı]hler)|1(?:[\s\xa0]*Tar[Iİı]hler|\.(?:[\s\xa0]*Tar[Iİı]hler|\?[\s\xa0]*Ta)|\?[\s\xa0]*Ta|Chr|Ta))|(?:İlk[\s\xa0]*Tarihler|Bir(?:inci[\s\xa0]*Tarihler|[\s\xa0]*Tarihler)|ilk[\s\xa0]*Tar[ıiİI]hler|1(?:\.[\s\xa0]*Tarihler|[\s\xa0]*Tarihler)|I(?:lk[\s\xa0]*Tarihler|\.[\s\xa0]*Tarihler|[\s\xa0]*Tarihler))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezra"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ezra?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Neh"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Neh(?:emya)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["GkEsth"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Yunanca[\s\xa0]*Ester|G(?:rek[cç]e[\s\xa0]*Ester|kEsth))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Esth"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Est(?:er|h)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Job"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ey[uü]p?|Job)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ps"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Mez(?:mur(?:lar)?)?|Ps)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["PrAzar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Azarya(?:['’]n(?:[Iİı]n[\s\xa0]*Duas[Iİı])|n[Iİı]n[\s\xa0]*Duas[Iİı])|PrAzar)|Azarya(?:['’]n(?:(?:[Iİı]n[\s\xa0]*Duasi|in[\s\xa0]*Duas[İıiI]))|n(?:[Iıİ]n[\s\xa0]*Duasi|in[\s\xa0]*Duas[İıiI]))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Prov"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:S[uü]leyman(?:(?:['’](?:[Iİı]n[\s\xa0]*(?:(?:[OÖ]zdey(?:[Iİı](?:[sş]ler[Iİı]))|Meseller[Iİı])))|[Iİı]n[\s\xa0]*(?:(?:[OÖ]zdey(?:[Iİı](?:[sş]ler[Iİı]))|Meseller[Iİı]))))|Meseller|Prov|[OÖ]zd)|S[uü]leyman(?:(?:['’](?:(?:[Iİı]n[\s\xa0]*(?:(?:[OÖ]zdey(?:(?:[Iİı](?:[sş]leri)|i[şs]ler[iİıI]))|Meselleri))|in[\s\xa0]*(?:[ÖO]zdey(?:[İiıI](?:[şs]ler[İIıi]))|Meseller[iıIİ])))|[İıI]n[\s\xa0]*(?:(?:[ÖO]zdey(?:(?:[ıİI](?:[şs]leri)|i[sş]ler[İıIi]))|Meselleri))|in[\s\xa0]*(?:[OÖ]zdey(?:[İiıI](?:[sş]ler[iIıİ]))|Meseller[Iiıİ])))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eccl"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Eccl|Va[Iiİı]z?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["SgThree"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:[UÜ](?:[cç][\s\xa0]*Gen(?:[cç][\s\xa0]*Adam(?:[Iİı]n[\s\xa0]*Ezg(?:[Iİı]s[Iİı]))))|SgThree)|[UÜ](?:[çc][\s\xa0]*Gen(?:[çc][\s\xa0]*Adam(?:(?:[İIı]n[\s\xa0]*Ezg(?:(?:[ıİI]si|is[iIİı]))|in[\s\xa0]*Ezg[ıIiİ]s[İIıi]))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Song"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Song|Ezg[Iİı]ler[\s\xa0]*Ezg(?:[Iİı]s[Iİı])?)|Ezg|Ezg(?:[İIı]ler[\s\xa0]*Ezg(?:(?:[ıİI]si|is[İıiI]))|iler[\s\xa0]*Ezg[Iıİi]s[iıİI])
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jer"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jer|Yer(?:emya)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Ezek"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Ezek|Hez(?:ek[Iiİı]el)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Dan"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Dan(?:[Iiİı]el)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ho(?:s(?:ea)?|ş)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Joel"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Joel|Yoel?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Amos"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Amos?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Obad"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		O(?:bad|va(?:dya)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jonah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jonah|Yun(?:us)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mic"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		M(?:[Iİı]ka?|i(?:c|ka?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Nah"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Nah(?:um)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hab"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hab(?:akkuk)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zeph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Zeph|Sef(?:anya)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Hag"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Hag(?:ay)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Zech"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Ze(?:ch|k(?:er[Iiİı]ya)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Mal(?:ak[Iiİı])?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Matt"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Matta['’](?:a[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Matta['’](?:n(?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Matta['’](?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili))|Mat(?:t(?:a(?:[uı]n[\s\xa0]*(?:[Iİ]ncili)|[İI]n(?:[\s\xa0]*(?:[Iİ]ncili|cili))|a[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|['’]ya[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil))|ya[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)))?)?|Matta(?:[Iİ]ncili)|Matta['’](?:a[\s\xa0]*G(?:[öo]re[\s\xa0]*incil|n[ıuIİ]n[\s\xa0]*incili|[İıuI]n[\s\xa0]*incili))|Matta['’](?:n(?:[ıuIİ]n[\s\xa0]*incili|[İıuI]n[\s\xa0]*incili))|Matta['’](?:[İıuI]n[\s\xa0]*incili)|Matta(?:['’]ya[\s\xa0]*G(?:[öo]re[\s\xa0]*incil)|n[ıIuİ]n[\s\xa0]*incili|[İıuI]n[\s\xa0]*incili|ya[\s\xa0]*G[öo]re[\s\xa0]*incil|a[\s\xa0]*G[oö]re[\s\xa0]*incil|incili)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Mark"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Markos['’](?:a[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Markos['’](?:n(?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Markos['’](?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili))|Mar(?:k(?:os(?:[uı]n[\s\xa0]*(?:[Iİ]ncili)|[İI]n(?:[\s\xa0]*(?:[Iİ]ncili|cili))|a[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|['’]ya[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil))|ya[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)))?)?|Markos(?:[Iİ]ncili)|Markos['’](?:a[\s\xa0]*G(?:[öo]re[\s\xa0]*incil|n[uIıİ]n[\s\xa0]*incili|[Iİıu]n[\s\xa0]*incili))|Markos['’](?:n(?:[uIıİ]n[\s\xa0]*incili|[Iİıu]n[\s\xa0]*incili))|Markos['’](?:[Iİıu]n[\s\xa0]*incili)|Markos(?:['’]ya[\s\xa0]*G(?:[oö]re[\s\xa0]*incil)|n[Iİıu]n[\s\xa0]*incili|[İıuI]n[\s\xa0]*incili|ya[\s\xa0]*G[oö]re[\s\xa0]*incil|a[\s\xa0]*G[oö]re[\s\xa0]*incil|incili)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Luke"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Luka['’](?:a[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Luka['’](?:n(?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Luka['’](?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili))|Luk(?:a(?:[uı]n[\s\xa0]*(?:[Iİ]ncili)|[İI]n(?:[\s\xa0]*(?:[Iİ]ncili|cili))|a[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|['’]ya[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil))|ya[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil))|e)?|Luka(?:[Iİ]ncili)|Luka['’](?:a[\s\xa0]*G(?:[oö]re[\s\xa0]*incil|n[İıuI]n[\s\xa0]*incili|[ıIuİ]n[\s\xa0]*incili))|Luka['’](?:n(?:[İıuI]n[\s\xa0]*incili|[ıIuİ]n[\s\xa0]*incili))|Luka['’](?:[ıIuİ]n[\s\xa0]*incili)|Luka(?:['’]ya[\s\xa0]*G(?:[oö]re[\s\xa0]*incil)|n[uIİı]n[\s\xa0]*incili|[İıuI]n[\s\xa0]*incili|ya[\s\xa0]*G[oö]re[\s\xa0]*incil|a[\s\xa0]*G[öo]re[\s\xa0]*incil|incili)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Yuhanna|[\s\xa0]*Yuhanna)|[iİ]lk[\s\xa0]*Yuhanna|I(?:lk[\s\xa0]*Yuhanna|\.[\s\xa0]*Yuhanna|[\s\xa0]*Yuhanna)|1(?:[\s\xa0]*Yuhanna|\.(?:[\s\xa0]*Yuhanna|\?[\s\xa0]*Yu)|\?[\s\xa0]*Yu|John|Yu))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[iİ]ki(?:nci[\s\xa0]*Yuhanna|[\s\xa0]*Yuhanna))|I(?:ki(?:nci[\s\xa0]*Yuhanna|[\s\xa0]*Yuhanna)|I(?:\.[\s\xa0]*Yuhanna|[\s\xa0]*Yuhanna))|2(?:[\s\xa0]*Yuhanna|\.(?:[\s\xa0]*Yuhanna|\?[\s\xa0]*Yu)|\?[\s\xa0]*Yu|John|Yu))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3John"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:III(?:\.[\s\xa0]*Yuhanna|[\s\xa0]*Yuhanna)|[UÜ](?:[cç](?:(?:[uü]nc(?:[uü][\s\xa0]*Yuhanna)|[\s\xa0]*Yuhanna)))|3(?:[\s\xa0]*Yuhanna|\.(?:[\s\xa0]*Yuhanna|\?[\s\xa0]*Yu)|\?[\s\xa0]*Yu|John|Yu))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["John"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Yuhanna['’](?:a[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Yuhanna['’](?:n(?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)))|Yuhanna['’](?:[Iuİı]n[\s\xa0]*(?:[Iİ]ncili))|(?:John|Yu(?:h(?:anna(?:[uı]n[\s\xa0]*(?:[Iİ]ncili)|[İI]n(?:[\s\xa0]*(?:[Iİ]ncili|cili))|a[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)|n[Iuİı]n[\s\xa0]*(?:[Iİ]ncili)|['’]ya[\s\xa0]*G(?:[oö]re[\s\xa0]*(?:[Iİ]ncil))|ya[\s\xa0]*G[oö]re[\s\xa0]*(?:[Iİ]ncil)))?)?)|Yuhanna(?:[Iİ]ncili)|Yuhanna[’'](?:a[\s\xa0]*G(?:[oö]re[\s\xa0]*incil|n[uıIİ]n[\s\xa0]*incili|[uıİI]n[\s\xa0]*incili))|Yuhanna[’'](?:n(?:[uıIİ]n[\s\xa0]*incili|[uıİI]n[\s\xa0]*incili))|Yuhanna[’'](?:[uıİI]n[\s\xa0]*incili)|Yuhanna(?:['’]ya[\s\xa0]*G(?:[öo]re[\s\xa0]*incil)|n[Iİuı]n[\s\xa0]*incili|[İıuI]n[\s\xa0]*incili|ya[\s\xa0]*G[öo]re[\s\xa0]*incil|a[\s\xa0]*G[oö]re[\s\xa0]*incil|incili)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Acts"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Acts|El[cç](?:[Iİı]ler(?:[Iİı]n[\s\xa0]*(?:[Iİı](?:[sş]ler[Iİı])))?))|El[cç]|El[çc](?:(?:[İıI]ler(?:(?:[İIı]n[\s\xa0]*(?:(?:[İıI](?:[sş]leri)|i[şs]ler[ıiIİ]))|in[\s\xa0]*[iİıI](?:[sş]ler[Iiıİ])))|iler[iıIİ]n[\s\xa0]*(?:[iİIı](?:[şs]ler[İIıi]))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Rom"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Rom(?:al[Iiİı]lar)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:İki(?:nci[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler)))|I(?:ki(?:nci[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler)))|I(?:\.[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))))|2(?:[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|\.(?:[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|\?[\s\xa0]*Ko)|\?[\s\xa0]*Ko|Cor|Ko))|(?:İki(?:nci[\s\xa0]*Kor(?:[ıIİ]ntliler|int(?:oslular|l[iİıI]ler))|[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[iIıİ]ler)))|iki(?:nci[\s\xa0]*Kor(?:[ıiIİ]nt(?:oslular|l[iİIı]ler))|[\s\xa0]*Kor(?:[İiıI]nt(?:oslular|l[ıİiI]ler)))|I(?:ki(?:nci[\s\xa0]*Kor(?:[Iıİ]ntliler|int(?:oslular|l[ıIİi]ler))|[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[İıIi]ler)))|I(?:\.[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[iıİI]ler))|[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[iIıİ]ler))))|2(?:\.[\s\xa0]*Kor(?:[Iıİ]ntliler|int(?:oslular|l[iIİı]ler))|[\s\xa0]*Kor(?:[Iİı]ntliler|int(?:oslular|l[iıIİ]ler))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Cor"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler)))|İlk[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|I(?:lk[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|\.[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler)))|1(?:[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|\.(?:[\s\xa0]*Kor(?:[Iİı]nt(?:oslular|l[Iİı]ler))|\?[\s\xa0]*Ko)|\?[\s\xa0]*Ko|Cor|Ko))|(?:İlk[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[Iıİi]ler))|Bir(?:inci[\s\xa0]*Kor(?:[İIı]ntliler|int(?:oslular|l[ıİiI]ler))|[\s\xa0]*Kor(?:[İIı]ntliler|int(?:oslular|l[ıİIi]ler)))|ilk[\s\xa0]*Kor(?:[İIıi]nt(?:oslular|l[İiıI]ler))|I(?:lk[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[iİıI]ler))|\.[\s\xa0]*Kor(?:[Iİı]ntliler|int(?:oslular|l[iİıI]ler))|[\s\xa0]*Kor(?:[ıİI]ntliler|int(?:oslular|l[İiIı]ler)))|1(?:\.[\s\xa0]*Kor(?:[ıIİ]ntliler|int(?:oslular|l[İiıI]ler))|[\s\xa0]*Kor(?:[İıI]ntliler|int(?:oslular|l[ıIİi]ler))))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Gal"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Gal(?:atyal[Iiİı]lar)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Eph"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		E(?:ph|f(?:e(?:sl[Iiİı]ler)?)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phil"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phil|F(?:[Iİı]l(?:[Iİı]p(?:[Iİı]l(?:[Iİı]ler)))|lp))|F(?:[İIı]l(?:(?:[ıİI]p(?:(?:[ıIİ]liler|il[İIıi]ler))|ip[iıIİ]l(?:[ıİIi]ler)))|il[iİıI]p(?:[Iİiı]l(?:[ıiIİ]ler)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Col"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Col|Kol(?:osel[Iiİı]ler)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:İki(?:nci[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler))|I(?:ki(?:nci[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler))|I(?:\.[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)))|2(?:[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|\.(?:[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|\?[\s\xa0]*Se)|Thess|\?[\s\xa0]*Se|Se))|(?:iki(?:nci[\s\xa0]*Selan[ıiIİ]kl(?:[Iıiİ]ler)|[\s\xa0]*Selan[ıiİI]kl(?:[İiıI]ler))|İki(?:nci[\s\xa0]*Selan(?:[Iİı]kliler|ikl[Iıİi]ler)|[\s\xa0]*Selan(?:[İIı]kliler|ikl[iIİı]ler))|I(?:ki(?:nci[\s\xa0]*Selan(?:[İIı]kliler|ikl[iIİı]ler)|[\s\xa0]*Selan(?:[ıİI]kliler|ikl[ıiİI]ler))|I(?:\.[\s\xa0]*Selan(?:[ıIİ]kliler|ikl[ıiİI]ler)|[\s\xa0]*Selan(?:[ıIİ]kliler|ikl[İiıI]ler)))|2(?:\.[\s\xa0]*Selan(?:[İıI]kliler|ikl[iıIİ]ler)|[\s\xa0]*Selan(?:[ıİI]kliler|ikl[iIıİ]ler)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Thess"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler))|İlk[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|I(?:lk[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|\.[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler))|1(?:[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|\.(?:[\s\xa0]*Selan[Iİı]kl(?:[Iİı]ler)|\?[\s\xa0]*Se)|Thess|\?[\s\xa0]*Se|Se))|(?:İlk[\s\xa0]*Selan(?:[Iıİ]kliler|ikl[İıIi]ler)|ilk[\s\xa0]*Selan[Iİıi]kl(?:[ıiIİ]ler)|Bir(?:inci[\s\xa0]*Selan(?:[Iıİ]kliler|ikl[İiIı]ler)|[\s\xa0]*Selan(?:[Iİı]kliler|ikl[Iİiı]ler))|1(?:\.[\s\xa0]*Selan(?:[ıİI]kliler|ikl[İıIi]ler)|[\s\xa0]*Selan(?:[İıI]kliler|ikl[ıIİi]ler))|I(?:lk[\s\xa0]*Selan(?:[Iİı]kliler|ikl[Iİıi]ler)|\.[\s\xa0]*Selan(?:[İIı]kliler|ikl[Iİıi]ler)|[\s\xa0]*Selan(?:[İIı]kliler|ikl[iİIı]ler)))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:İki(?:nci[\s\xa0]*T[Iİı]moteos|[\s\xa0]*T[Iİı]moteos)|I(?:ki(?:nci[\s\xa0]*T[Iİı]moteos|[\s\xa0]*T[Iİı]moteos)|I(?:\.[\s\xa0]*T[Iİı]moteos|[\s\xa0]*T[Iİı]moteos))|2(?:[\s\xa0]*T[Iİı]moteos|\.(?:[\s\xa0]*T[Iİı]moteos|\?[\s\xa0]*T[Iİı])|\?[\s\xa0]*T[Iİı]|Tim?))|(?:İki(?:nci[\s\xa0]*Timoteos|[\s\xa0]*Timoteos)|iki(?:nci[\s\xa0]*T[Iiİı]moteos|[\s\xa0]*T[ıiİI]moteos)|I(?:ki(?:nci[\s\xa0]*Timoteos|[\s\xa0]*Timoteos)|I(?:\.[\s\xa0]*Timoteos|[\s\xa0]*Timoteos))|2(?:[\s\xa0]*Timoteos|\.(?:[\s\xa0]*Timoteos|\?[\s\xa0]*Ti)|\?[\s\xa0]*Ti))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Tim"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*T[Iİı]moteos|[\s\xa0]*T[Iİı]moteos)|İlk[\s\xa0]*T[Iİı]moteos|I(?:lk[\s\xa0]*T[Iİı]moteos|\.[\s\xa0]*T[Iİı]moteos|[\s\xa0]*T[Iİı]moteos)|1(?:[\s\xa0]*T[Iİı]moteos|\.(?:[\s\xa0]*T[Iİı]moteos|\?[\s\xa0]*T[Iİı])|\?[\s\xa0]*T[Iİı]|Tim?))|(?:Bir(?:inci[\s\xa0]*Timoteos|[\s\xa0]*Timoteos)|İlk[\s\xa0]*Timoteos|ilk[\s\xa0]*T[ıİIi]moteos|I(?:lk[\s\xa0]*Timoteos|\.[\s\xa0]*Timoteos|[\s\xa0]*Timoteos)|1(?:[\s\xa0]*Timoteos|\.(?:[\s\xa0]*Timoteos|\?[\s\xa0]*Ti)|\?[\s\xa0]*Ti))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Titus"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		T(?:[Iiİı]t(?:us)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Phlm"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Phlm|F(?:[Iiİı]l(?:[Iiİı]mon)|lm))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Heb"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Heb|[Iİı]br(?:an(?:[Iİı]ler)?))|(?:[Iİı]br)|(?:[Iİı]braniler|ibr(?:an[iıİI]ler)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jas"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jas|Yak(?:up)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[iİ]ki(?:nci[\s\xa0]*Petrus|[\s\xa0]*Petrus))|I(?:ki(?:nci[\s\xa0]*Petrus|[\s\xa0]*Petrus)|I(?:\.[\s\xa0]*Petrus|[\s\xa0]*Petrus))|2(?:[\s\xa0]*Petrus|\.(?:[\s\xa0]*Petrus|\?[\s\xa0]*Pe)|\?[\s\xa0]*Pe|Pet?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Pet"]
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Petrus|[\s\xa0]*Petrus)|[iİ]lk[\s\xa0]*Petrus|I(?:lk[\s\xa0]*Petrus|\.[\s\xa0]*Petrus|[\s\xa0]*Petrus)|1(?:[\s\xa0]*Petrus|\.(?:[\s\xa0]*Petrus|\?[\s\xa0]*Pe)|\?[\s\xa0]*Pe|Pet?))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jude"]
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Jude|Yah(?:uda)?)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Tob"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Tob(?:[Iiİı]t)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Jdt"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		(?:Yud[Iiİı]t|Jdt)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Bar"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Bar(?:uk)?
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["Sus"]
		apocrypha: true
		regexp: ///(^|#{bcv_parser::regexps.pre_book})(
		Su(?:zanna|s)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["2Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:(?:[iİ]ki(?:nci[\s\xa0]*Makabeler|[\s\xa0]*Makabeler))|I(?:ki(?:nci[\s\xa0]*Makabeler|[\s\xa0]*Makabeler)|I(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler))|2(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["3Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:III(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler)|[UÜ](?:[cç](?:(?:[uü]nc(?:[uü][\s\xa0]*Makabeler)|[\s\xa0]*Makabeler)))|3(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler|Macc))
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["4Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:D[oö]r(?:d(?:[uü]nc(?:[uü][\s\xa0]*Makabeler)|t[\s\xa0]*Makabeler))|IV(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler)|4(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler|Macc))|D(?:[oö]rt[\s\xa0]*Makabeler)
			)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]/"'\*=~\-\u2013\u2014])|$)///gi
	,
		osis: ["1Macc"]
		apocrypha: true
		regexp: ///(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(
		(?:Bir(?:inci[\s\xa0]*Makabeler|[\s\xa0]*Makabeler)|[iİ]lk[\s\xa0]*Makabeler|I(?:lk[\s\xa0]*Makabeler|\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler)|1(?:\.[\s\xa0]*Makabeler|[\s\xa0]*Makabeler|Macc))
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

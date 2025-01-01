// build/bcv_regexps.ts
var bcv_regexps = class {
  constructor() {
    this.books = [];
    this.languages = ["ar", "bg", "ceb", "cs", "cy", "da", "de", "el", "en", "es", "fa", "fi", "fr", "he", "hi", "hr", "ht", "hu", "id", "is", "it", "ja", "jv", "ko", "la", "mk", "mr", "ne", "nl", "no", "or", "pa", "pl", "pt", "ro", "ru", "sk", "so", "sq", "sr", "sv", "sw", "ta", "th", "tl", "uk", "ur", "vi", "wal", "zh"];
    this.translations = [/(?:N(?:RSVUE|ABRE|ASB|IV|[EL]T)|N(?:RSV|A[BS])|HCSB|(?:N(?:IR|KJ)|AS|E[RS]|KJ|RS)V|TNIV|AMP|CE[BV]|LXX|MSG|CSB)\b/gi];
    // Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`.
    // Start with an inverted book/chapter (cb). The last one doesn't allow plural since it's a single chapter.
    // Then move onto a book, which is the anchor for everything.
    // The `/\d+\x1f` is for special Psalm chapters.
    // The `title` has `[a-z]` instead of `\w` because it could be followed by a number.
    // [a-e] allows `1:1a`.
    this.escaped_passage = /(?:^|[^\x1e\x1f\p{L}\p{N}])((?:(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:[\u2013\u2014\-]|through|thru|to)\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:\d+(?:th|nd|st)\s*ch(?:apter|a?pt\.?|a?p?\.?)?\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*))?\x1f(\d+)(?:\/\d+)?\x1f(?:\/\d+\x1f|[\d\s.:,;\x1e\x1f&\(\)（）\[\]\\/"'\*=~\-–—]|title(?![a-z])|ff(?![a-z0-9])|f(?![a-z0-9])|see\s+also|chapters|chapter|through|compare|chapts|verses|chpts|chapt|chaps|verse|chap|thru|also|chp|chs|cha|and|see|ver|vss|ch|to|cf|vs|vv|v|[a-e](?!\w)|$)+)/giu;
    // These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff. \uff09 is a full-width closing parenthesis.
    this.match_end_split = /\d\W*title|\d\W*(?:ff(?![a-z0-9])|f(?![a-z0-9]))(?:[\s*]*\.)?|\d[\s*]*[a-e](?!\w)|\x1e(?:[\s*]*[)\]\uff09])?|[\d\x1f]/gi;
    this.control = /[\x1e\x1f]/g;
    // These are needed for ranges outside of this class.
    this.first = String.raw`(?:1st|1|I|First)\.?\s*`;
    this.second = String.raw`(?:2nd|2|II|Second)\.?\s*`;
    this.third = String.raw`(?:3rd|3|III|Third)\.?\s*`;
    this.range_and = String.raw`(?:[&\u2013\u2014-]|(?:and|compare|cf|see\s+also|also|see)|(?:through|thru|to))`;
    this.range_only = String.raw`(?:[\u2013\u2014-]|(?:through|thru|to))`;
    this.pre_book = /(?:^|(?<=[^\p{L}]))/gu;
    this.pre_number_book = /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))/gu;
    this.post_book = /(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/gu;
    // Each book regexp should return one parenthesized object: the book string.
    this.all_books = [
      {
        osis: ["Ps"],
        testament: "a",
        extra: "2",
        // We only want to match a valid OSIS, so we can use a regular `\b` condition. It's always followed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
        regexp: /\b(Ps151)(?=\.1\b)/g
        // It's case-sensitive because we only want to match a valid OSIS. No `u` flag is necessary because we're not doing anything that requires it.
      },
      {
        osis: ["Gen"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Ensimm[aä]inen\s*Mooseksen\s*kirj|K(?:itabu\s*cha\s*Kwanza\s*cha\s*Mus|n(?:iha\s*stvoreni|jiga\s*Postank)|\.?\s*stvoreni)|(?:Pierwsz[aey]\s*K|1\.?\s*K)s(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|(?:Prvn[ií]\s*k|1\.\s*k)niha\s*Moj[zž][ií][sš]ov|(?:Prv(?:[aá]\s*kniha\s*Moj[zž]i|[yý]\s*(?:list\s*Moj[zž]i|Moj[zž]i)|[aá]\s*Moj[zž]i)|1\s*k(?:\.\s*Moj[zž]i|\s*Moj[zž]i)|1\.\s*Mojz[ií]|1\s*Mojz[ií])[sš]ov|I(?:\.\s*(?:Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|kniha\s*Moj[zž][ií][sš]ov|Moj[zż]eszow|Mojz[ií][sš]ov|Mojž[ií][sš]ov)|\s*Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|\s*kniha\s*Moj[zž][ií][sš]ov|\s*Moj[zż]eszow|\s*Mojz[ií][sš]ov|\s*Mojž[ií][sš]ov)|(?:(?:(?:Pierwsz[aey]\s*Moj[zż]|1\s*Mojż)|1\s*Mojz)e|1\.\s*Moj[zż]e)szow|(?:1\.\s*Moo|I\.?\s*Moo)seksen\s*kirj|1\s*kniha\s*Moj[zž][ií][sš]ov|1\s*Mooseksen\s*kirj|Prvn[ií]\s*Moj[zž][ií][sš]ov|1\.?\s*Mojž[ií][sš]ov|Zanafill|Facere|Buttj)a|(?:(?:Pierwsz[aey]\s*K|1\.?\s*K)s(?:i[eę]g[ai]\s*Moy[zż]eszow|\.\s*Moy[zż]eszow|\s*Moy[zż]eszow)|I(?:\.\s*Ks(?:i[eę]g[ai]\s*Moy[zż]eszow|\.\s*Moy[zż]eszow|\s*Moy[zż]eszow)|\s*Ks(?:i[eę]g[ai]\s*Moy[zż]eszow|\.\s*Moy[zż]eszow|\s*Moy[zż]eszow))|P(?:edai|idaa)yish)e|Ensimm[aä]inen\s*Mooseksen|1-?(?:ше|[ае])\.\s*книга\s*Мо[ий]сеева|П(?:(?:ърв(?:(?:а\s*книга|о)|а)\s*Мои|рв[ао]\s*книга\s*Мој)сеева|ерш[ае]\s*книга\s*Мо[ий]сеева|рва\s*Мојсијева|остање)|1-?(?:ше|[ае])\s*книга\s*Мо[ий]сеева|(?:1\.?\s*книга\s*Мо[ийј]|I(?:\.\s*(?:книга\s*Мо[ийј]|Мои)|\s*(?:книга\s*Мо[ийј]|Мои))|1\.?\s*Мои)сеева|liv\s*Konmansman\s*an|उत्प(?:त(?:्तिको\s*पुस्तक|ि)|ाति)|(?:utpattiko\s*pusta|1\.?\s*Mosebó|Postana)k|(?:Purwaning\s*Dumad|Bilowgi)i|Erste(?:[nrs]\s*(?:Buch\s*)?Mose|\s*(?:Buch\s*)?Mose)|(?:F[oö]rsta\s*Moseboke|1\.?\s*Moseboke)n|(?:Fyrsta\s*b[oó]k\s*M[oó]|Genè)se|F(?:[oö]rsta\s*Mosebok|ørste\s*Mos)|K(?:s(?:i[eę]g[ai]\s*Rodzaj|\.?\s*Rodzaj)u|niha\s*p[oô]vodu|\.\s*p[oô]vodu|\s*p[oô]vodu|ejd)|F(?:ørste\s*Mosebo[gk]|yrsta\s*M[oó]seb[oó]k)|Pierwsz[aey]\s*Moj[zż]|Liber\s*Genesis|(?:1\.\s*Moo|I\.?\s*Moo)seksen|(?:1\.?\s*Мој|I\.?\s*Мој)сијева|1\.?\s*Buch\s*Mose|Doomettaabaa|(?:E(?:erste\s*Mo|ls[oő]\s*M[oó])ze|Gen(?:n(?:e(?:(?:is[eiu]|s[eiu])|es[eiu])|i(?:[ei]s[eiu]|s[eiu]))|e(?:(?:is[eiu]|(?:su|zi))|es[eiu])|i(?:[ei]s[eiu]|s[eiu]))|1e\.\s*Moze|Teremt[eé]|(?:1\.\s*M[oó]z|I(?:\.\s*M[oó]z|\s*M[oó]z))e|1e\s*Moze|1(?:\s*M[oó]ze|Mó))s|1\s*Mooseksen|Sáng\s*(?:thế\s*ký|Thế)|Настанување|தொ(?:டக்க\s*நூல்|நூ)|Книга\s*Бытия|سفر\s*التكوين|1\.?\s*Mosebok|उत्पत्ति(?:को)?|1(?:\.\s*Mosebog|\s*M(?:osebog|z))|Pedaiyeshh|(?:1\.?\s*Móse|I(?:\.\s*M[oó]se|\s*M[oó]se))b[oó]k|Ātiyākamam|K(?:onmansm|ejadi)an|P(?:edaiyesh|ost)|utpat(?:ti(?:ko)?)?|П(?:рва\s*Мојс?|ост)|P(?:ed(?:aa)?ye|ida(?:iy[ei]|aye|ye))sh|Beresjiet|ଆଦିପୁସ୍ତକ|ஆதியாகமம்|p(?:edāyesh|īdāyiš)|G(?:(?:(?:e(?:n(?:neis|es[ei]|eis)?)?|é)|én)|ên)|1(?:\.\s*Mo(?:se?)?|\s*(?:(?:M(?:o(?:(?:os)?|z)|óz)|М)|Mose?))|1\.\s*Moj[zż]|I(?:\.\s*M(?:o(?:j[zż]|s)|ós)|\s*M(?:o(?:j(?:z?|ż)|s)|ós))|(?:1\.?\s*Мој|I\.?\s*Мој)с?|G(?:ene(?:s(?:[ei]s|a)|za)|n)|M(?:[oó]zes\s*I|wanzo)|Γ(?:ενεσ(?:ις|η)|ένεσ(?:ις|η))|P[ei]daish|پ(?:یدا(?:يشه|(?:ی[ثسشچژ]|ىش|ش))|يدايشه|(?:یدا(?:(?:یى|ىی|ئ)|يی)|يدا(?:يی|[ئی]))ش|َیدایش)|Utpaati|Genn?sis|(?:G[éê]|He)nesis|التكوين|1\s*Mojz|1\s*Mojż|1\.\s*Mós|پ(?:ید(?:ايش|(?:ای?)?)|يدايش)|Начало|ปฐ(?:มกาล|ก)|בר(?:אשית|יאה)|1\s*Moj|1\s*Mós|pedāy?|Jen[eè]z|《(?:创(?:世记)?》|創(?:世[紀記]》|》))|Б[иы]тие|ﺗﻜﻮﻳﻦ|Буття|Sáng|《(?:创(?:世记)?|創(?:世[紀記])?)|Ro?dz|(?:創世[紀記]|创世记)》|ਉਤਪਤ|Hen|Jen|Kej|Mwa|Ter|Zan|Γ(?:εν?|έν)|Б(?:у|[иы])т|Нач|創世[紀記]|创世记|ଆଦି|ஆதி|창세기|Буг|創世?|창세?|創》|تك|创》|创))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Exod"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:K(?:itabu\s*cha\s*Pili\s*cha\s*Mus|s(?:i[eę]g[ai]\s*Wyj[sś]ci|\.\s*Wyj[sś]ci|\s*Wyj[sś]ci)|njiga\s*Izlask|essaaba|utok)|(?:Drug[ai]\s*K|II\.?\s*K)s(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|(?:Druh(?:[aá]|[yý])\s*k|II\.?\s*k)niha\s*Moj[zž][ií][sš]ov|(?:Druh[yý]\s*list\s*Moj[zž]i|II\.\s*Mojz[ií]|II\s*Mojz[ií])[sš]ov|2(?:\.\s*(?:Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|kniha\s*Moj[zž][ií][sš]ov|Moj[zż]eszow|Mojz[ií][sš]ov|Mojž[ií][sš]ov)|\s*Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|\s*kniha\s*Moj[zž][ií][sš]ov|\s*(?:k(?:\.\s*Moj[zž]i|\s*Moj[zž]i)|Mojz[ií])[sš]ov|\s*Moj[zż]eszow|\s*Mojž[ií][sš]ov)|(?:(?:(?:Drug[ai]\s*Moj[zż]|II\s*Mojż)|II\s*Mojz)e|II\.\s*Moj[zż]e)szow|Druh(?:[aá]|[yý])\s*Moj[zž][ií][sš]ov|II\.?\s*Mojž[ií][sš]ov|Ie[sşș]ire|Dalj)a|T(?:oinen\s*Mooseksen\s*kirja|weede\s*Mozes)|(?:Втор(?:а\s*(?:книга\s*Мо[иј]|Мои)|о\s*(?:книга\s*Мој|Мои))|II\.?\s*книга\s*Мо[ийј]|2(?:\.\s*(?:книга\s*Мо[ийј]|Мои)|\s*(?:книга\s*Мо[ийј]|Мои))|II\.?\s*Мои)сеева|2-?(?:ге|[ае])\.\s*книга\s*Мо[ий]сеева|Друг(?:а\s*(?:книга\s*Мо[ий]сеева|Мојсијева)|е\s*книга\s*Мо[ий]сеева)|(?:II\.?\s*Moo|2\.\s*Moo)seksen\s*kirja|2-?(?:ге|[ае])\s*книга\s*Мо[ий]сеева|2\s*Mooseksen\s*kirja|(?:prastʰ[aā]nko\s*pusta|An(?:dre|nen)\s*Mosebo|2\.?\s*Mosebó|Izlaza)k|(?:Zweite(?:[nrs]\s*(?:Buch\s*)?Mo|\s*(?:Buch\s*)?Mo)|2\.?\s*Buch\s*Mo)se|liv\s*delivrans\s*lan|प्रस्थान(?:को(?:\s*पुस्तक)?)?|Toinen\s*Mooseksen|Xuất\s*(?:Ê-?díp-?tô\s*ký|Ai\s*Cập\s*Ký|Ai-?cập|Hành)|விடுதலைப்\s*பயணம்|(?:Andra\s*Mosebok|2\.?\s*Mosebok)en|[OÖ]nnur\s*(?:b[oó]k\s*M[oó]se|M[oó]seb[oó]k)|And(?:r(?:a\s*Mosebok|e\s*Mos)|en\s*Mos)|(?:II\.?\s*Moo|2\.\s*Moo)seksen|Anden\s*Mosebog|M[aá]sodik\s*M[oó]zes|(?:II\.?\s*Мој|2\.?\s*Мој)сијева|ଯାତ୍ରା\s*?ପୁସ୍ତକ|(?:Liber\s*Exodu|Delivran|Kivonul[aá]|E(?:gzodu|xodi)|2(?:\s*M[oó]ze|Mó)|Ecsodu)s|யாத்திராகமம்|Yāttirākamam|2\s*Mooseksen|יציא(?:ת\s*מצרים|ה)|(?:(?:II\.?\s*Mos|II\.?\s*Mós)e|2\.?\s*Móse)b[oó]k|(?:Pangentas|Keluar|Nirgam)an|Книга\s*Исход|Drug[ai]\s*Moj[zż]|2\.?\s*Mosebok|prastʰ[aā]nko|Друга\s*Мојс?|Baxniintii|2(?:\.\s*Mosebog|\s*M(?:osebog|z))|سفر\s*الخروج|(?:II\.?\s*Moz|II\.?\s*Móz|2\.\s*M[oó]z)es|2e\.\s*Mozes|II\.\s*Moj[zż]|(?:II\.?\s*Мој|2\.?\s*Мој)с?|K(?:horo(?:j(?:eh|y)|oj)|elr)|M[oó]zes\s*II|(?:Kh(?:or(?:oo)?u|aroo|r(?:aw|o[ou]))|Wy)j|2e\s*Mozes|K(?:horoje?|e(?:ss|l)|iv|ut)|II\s*Mojz|II\s*Mojż|II\.?\s*Mos|II\.?\s*Mós|2(?:\.\s*M(?:o(?:se?|j[zż])?|ós)|\s*(?:(?:(?:(?:(?:M(?:o(?:(?:os|j)?|z)|óz)|М)|Mose?)|Mojz)|Mojż)|Mós))|k(?:hor(?:ojī|ro|j)|ūč)|Изл(?:азак|ез)|Егзодус|निर्गमन|II\s*Moj|khor(?:oj|r)|निर्गम|ଯାତ୍ରା|E(?:x(?:od(?:u[ls]|[eos])|d)|ksod[io]|sodo)|出(?:エ[シジ][フプ]ト記|》)|Sjemot|《出(?:(?:埃及[記记]|(?:埃及)?)|谷紀)》|Εξοδος|Έξοδος|nirgam|خُرُوج|الخروج|E(?:gz(?:od)?|x(?:od?)?|kso?|cs)|出(?:エ[シジ][フプ]ト)?|《出(?:埃及[記记]|埃及|谷紀)?|خر(?:و(?:ج[هی]|[دچژ])|وو[جچژ]|ا(?:و[جچژ]|ج)|ج)|Egzòd|Vy[hȟ]id|[ÉÊ]xodo|出埃及[記记]》|ḫurūj|خرو?ُج|(?:Вихі|И[зс]хо)д|خر(?:وج?)?|[ÉÊ]xod|Xuất|出埃及[記记]|யாத்|출애굽기|出埃及》|出谷紀》|שמות|อพยพ|Bax|Dal|Izl|[ÉÊ]xo?|Вих|И(?:з[лх]|сх)|出埃及|出谷紀|อพย|[ÉÊ]xd|탈출기|ਕੂਚ|விப|Εξ|탈출|Wj|Ἔξ|출))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bel"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Istoria\s*(?:omor[aâ]rii\s*balaurului\s*[sş]i\s*a\s*sf[aă]r[aâ]m[aă]rii\s*lui\s*Bel|Balaurului)|பேல்\s*தெய்வமும்\s*அரக்கப்பாம்பும்\s*என்பவையாகும்|பேல்(?:\s*தெய்வமும்\s*அரக்கப்பாம்பும்)?|Danieli\s*na\s*Makuhani\s*wa\s*Beli|Opowiadaniem\s*o\s*Belu\s*i\s*w[eę][zż]u|Histoia\s*Beli\s*et\s*draconis|Dewa\s*Bel\s*dan\s*Naga\s*Babel|Bel\s*og\s*dragen\s*i\s*Babylon|Si\s*Bel\s*(?:at|ug)\s*ang\s*Dragon|B(?:el(?:(?:(?:\s*(?:(?:and|&)\s*(?:the\s*)?Serpent|(?:y\s*el\s*Serpient|(?:and|&)\s*(?:the\s*)?Snak|ja\s*lohik[aä][aä]rm)e|und\s*der?\s*Drache|e(?:t\s*le\s*[Ss]erpent|\s*(?:il\s*Drago|o\s*[Dd]rag[aã]o))|a['’]r\s*Ddraig)|\s*dan\s*Naga|a\s*i\s*w[eę][zż]a|》)|\s*en\s*de\s*draak)|\s*a\s*drak)|a[aá]l\s*[eé]s\s*a\s*s[aá]rk[aá]ny|el\s*es\s*a\s*s[aá]rk[aá]ny|(?:el\s*é|él\s*[eé])s\s*a\s*s[aá]rk[aá]ny|él\s*a\s*drak)|Bel\s*(?:und\s*Vom\s*Drache|o(?:ch\s*Ormgud|g\s*(?:Drag|drak))e|y\s*el\s*Drag[oó]|og\s*drekin)n|Bel\s*(?:(?:and|&)\s*(?:the\s*)?D|et\s*le\s*[Dd])ragon|Bel\s*at\s*ang\s*Dragon|Bel\s*[sș]i\s*dragonul|Bel\s*et\s*draconis|Β(?:ηλ\s*και\s*Δρ[άα]κων|ὴλ)|Вил(?:е\s*и\s*драконе|\s*и\s*змеят)|Бел(?:\s*(?:и\s*Д|і\s*д)ракон|е)|בל\s*והדרקון|התנין\s*בבבל|بل\s*والتنين|Dewa\s*Bel|《Bel》|《Bel|벨과\s*[뱀용]|[ヘベ]ルと[竜龍]|B[eé]l|Βηλ|Бел|Вил))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:ослан(?:(?:ня\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Филимона|апостола\s*Павла\s*до\s*Филимона|до\s*Фили(?:пі[ий]ців|мона))|ие\s*на\s*св\.?\s*ап\.\s*Павла\s*до\s*Филимона|ие\s*на\s*св\.?\s*ап\s*Павла\s*до\s*Филимона|и(?:е\s*к|ца)\s*Филимону)|ие\s*към\s*Филимон)|исмо\s*од\s*апостол\s*Павле\s*до\s*Филемон)|Poslannja\s*apostola\s*Pavla\s*do\s*Fylymona|ف(?:لیمون\s*کے\s*نام\s*پولس\s*رسُول\s*کا\s*خط|ِلیمون\s*کے\s*نام\s*کا\s*خط|لیمون\s*کے\s*نام\s*کا\s*خط|یل(?:یمون(?:اء|ی[ةی]|[ئتهى])|مون(?:اء|ی[ةی]|[ئتهى]))|لم|يل)|பில(?:மோன(?:ுக்கு\s*எழுதிய\s*திருமுகம)?்|(?:ேமோனுக்கு\s*எழுதிய\s*(?:நிருப|கடித)ம|ேமோன)்)|رسالة\s*بولس\s*الرسول\s*إلى\s*فليمون|P(?:ilēmōṉukku\s*Eḻutiya\s*Nirupa|hilemone)m|P(?:avlova\s*poslanica\s*Filemonu|oslanica\s*Filemonu|h(?:ilemon(?:hoz|[ain])|l?mn)|ilm)|L(?:ist\s*(?:[sś]w\.?\s*Pawła\s*do\s*Filemona|do\s*Filemona)|ettera\s*a\s*Filemone)|(?:Paulus(?:'\s*Brev\s*ti|’\s*[Bb]rev\s*ti)l|Till|Kay)\s*Filemon|Epistulam?\s*ad\s*Philemonem|Br(?:e(?:f\s*P[aá]ls\s*til\s*F[ií]lemons|vet\s*till?\s*Filemon)|éf\s*P[aá]ls\s*til\s*F[ií]lemons)|फिलेमोनलाई\s*पावलको\s*पत्र|पौलाचे\s*फिलेमोनाला\s*पत्र|f(?:ilēmōn\s*ke\s*nām\s*kā\s*ḫaṭ|īlīmoni)|ଫିଲୀମୋନଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|אגרת\s*פולוס\s*אל-?פילימון|pʰilemon\s*nū̃\s*pattrī|Waraka\s*kwa\s*Filemoni|ਫ਼?ਿਲੇਮੋਨ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|Barua\s*kwa\s*Filemoni|الرسالة\s*إلى\s*فليمون|pʰilemon(?:l[aā][iī]\s*patr|[aā]l[aā]\s*patr)a|(?:Kirje\s*)?Filemonille|האיגרת\s*אל\s*פילימון|(?:List\s*Filem[oó]nov|Filemonov)i|फिलेमोनलाई\s*पत्र|फिलेमोनाला\s*पत्र|F(?:il(?:emonsbr[eé]fið|(?:emo(?:n(?:brevet|it|[aeu])|m)|imo(?:unt|n[ain])|m))|íl(?:emonsbr[eé]fið|m))|ad\s*Philemonem|Προς\s*Φιλ[ήη]μονα|ਫ਼ਿਲੇਮੋਨ\s*ਨੂੰ|(?:Kang\s*Filem[oó]|Phi(?:-?lê-?mô|l(?:emo[ou]|mo?u))|Fil(?:emó|imu))n|P(?:ilēmōṉukku|h(?:i(?:le(?:m(?:on)?)?|-?lê)|l?m))|pʰilemon(?:l[aā][iī]|[aā]l[aā])?|필레몬(?:에게\s*보낸\s*서간|서)|До\s*Филимона|फिलेमोन(?:ा(?:ला)?|लाई)?|ଫିଲୀମୋନଙ୍କ|Filemonhoz|אל\s*פילימון|К\s*Филимону|F(?:ilimoon|lm|m)n|Pilimoona|フィレモン(?:への手紙|書)|Fi(?:l(?:em(?:oni?)?|im(?:ou?n)?))?|ف(?:یل(?:یمون(?:ا|ی)?|مون(?:ا|ی)?)|ِلیمون|لی(?:م(?:ون)?)?)?|F(?:ilimoon|lm|m)|Ф(?:илимон[ау]|лм)|फ(?:़िलेमोन|ले)|Filèmone|[ヒピ]レモンへの手紙|[ヒピ]レモンヘの手紙|(?:P(?:h(?:il[iéê]|l[ei])|ile)|Filé)mon|Φιλ[ήη]μονα|Филим(?:он)?|fīlīm(?:on)?|ฟ(?:ีเลโมน|ม)|[ヒピ]レモン(?:への)?書|Филемон|(?:《?腓利门书|《?肥利孟|《[門门]|[門门])》|《?腓利門書》|《?費肋孟書》|فليمون|[ヒピ]レモンへ?|《?腓利门书|《?腓利門書|《?費肋孟書|フィレモン|பிலே?|《?肥利孟|빌레몬서|Φλμ|필레|《[門门]|[門门]|본))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lev"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:liv\s*Prensip\s*lavi\s*nan\s*Bondy|L[eé]vitiqu)e|T(?:rzeci(?:a\s*(?:Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|Moj[zż]eszow)|\s*(?:Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|Moj[zż]eszow))a|retia\s*(?:kniha\s*Moj[zž]i|Moj[zž]i)[sš]ova|reti\s*(?:kniha\s*Moj[zž][ií][sš]ova|Moj[zž][ií][sš]ova)|retí\s*(?:kniha\s*Moj[zž][ií][sš]ova|Moj[zž][ií][sš]ova)|řet[ií]\s*(?:kniha\s*Moj[zž][ií][sš]ova|Moj[zž][ií][sš]ova)|redje\s*Mosebo(?:ken|g))|(?:K(?:itabu\s*cha\s*Tatu\s*cha\s*Mus|s(?:i[eę]g[ai]\s*Kapła[nń]sk|\.\s*Kapła[nń]sk|\s*Kapła[nń]sk))|(?:Kolmas\s*Moo|III\.?\s*Moo)seksen\s*kirj|(?:III\.?\s*K|3\.?\s*K)s(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|3\.?\s*Mooseksen\s*kirj|Laaivyavyavasth|(?:III\.?\s*Mojze|(?:III\.?\s*Mojż|3\.?\s*Mojż)e|3\.?\s*Mojze)szow|Wogaaba|Wajikr|Vajikr)a|(?:III\.?\s*k|3\.\s*k)niha\s*Moj[zž][ií][sš]ova|3-?(?:тє|[ае])\.\s*книга\s*Мо[ий]сеева|Тре(?:т(?:(?:а\s*(?:книга\s*Мо[иј]|Мои)|о\s*Мои)сеева|[яє]\s*книга\s*Мо[ий]сеева)|ћ(?:ом|а)\s*Мојсијева)|(?:III\.?\s*к|3\.?\s*к)нига\s*Мо[ий]сеева|3-?(?:тє|[ае])\s*книга\s*Мо[ий]сеева|(?:Imamat\s*Orang\s*Le|Wala)wi|3\s*kniha\s*Moj[zž][ií][sš]ova|(?:lev(?:ihar[uū]ko\s*pusta|īhar[uū]ko\s*pusta)|Levit(?:ski\s*zakoni|[aá])|3\.?\s*Mosebó)k|(?:Dritte(?:[nrs]\s*(?:Buch\s*)?Mo|\s*(?:Buch\s*)?Mo)|3\.?\s*Buch\s*Mo)se|(?:Kolmas\s*Moo|III\.?\s*Moo)seksen|ल(?:ेव(?:ी(?:हरूको\s*पुस्तक|य)|ि)|ैव्य(?:्व्य्व|व(?:्यव)?)स्था)|l(?:e(?:v(?:īāṃ\s*dī\s*potʰī|iy)|w[iī]y)|awiy)|M(?:ambo\s*ya\s*Walawi|[oó]zes\s*III)|(?:L(?:i(?:ber\s*Levitic|(?:v[ei]t[ei]c|v[ei]tc))u|(?:(?:(?:ebitik|ev[ei]tc)|ev(?:ite|et[ei])c)|efitic)u)|3(?:\s*M[oó]ze|Mó))s|Þriðja\s*(?:b[oó]k\s*M[oó]se|M[oó]seb[oó]k)|Tr(?:edje\s*Mos(?:ebok)?|zeci(?:a\s*Moj[zż]|\s*Moj[zż]))|(?:III(?:\.\s*Mojz[ií]|\s*Mojz[ií])|3\s*k\.\s*Moj[zž]i|3\s*k\s*Moj[zž]i|3(?:\.\s*Mojz[ií]|\s*Mojz[ií]))[sš]ova|(?:III\.?\s*Mojž|3\.?\s*Mojž)[ií][sš]ova|Harmadik\s*M[oó]zes|Левитска\s*книга|(?:III\.?\s*Мој|3\.?\s*Мој)сијева|ਲੇਵੀਆਂ\s*ਦੀ\s*ਪੋਥੀ|L(?:ēviyarākamam|e(?:v(?:iticu(?:si|l)|(?:itik[eë]|y)t|iti(?:co|ku)s|íticos)|biti[ck]o)|ê-?vi\s*ký|v)|3e\.?\s*Moseboken|(?:III\.?\s*Мои|3\.?\s*Мои)сеева|3(?:\.\s*M(?:o(?:oseksen|se?|jz)?|ós)|\s*(?:(?:Mooseksen|(?:(?:(?:M(?:o(?:(?:os|j)?|z)|óz)|М)|Mose?)|Mojz))|Mós))|ल(?:ैव्य(?:व्यवस्थ)?|ेवी(?:हरूको)?)|L(?:aawiyiinti|ê\s*V)i|3\.?\s*Mosebo(?:ken|g)|ଲେବୀୟ\s*ପୁସ୍ତକ|(?:(?:III\.?\s*Mos|III\.?\s*Mós)e|3\.?\s*Móse)b[oó]k|سفر\s*اللاويين|3e\.?\s*Mosebok|Трећ(?:ом\s*Мојс?|а\s*Мојс?)|லேவியர(?:ாகமம)?்|Derde\s*Mozes|Книга\s*Левит|ספר\s*הלוויים|l(?:ev(?:ihar[uū]ko|ī(?:har[uū]ko|āṃ))|awi?)|3\.?\s*Mosebok|(?:III\.?\s*Moz|III\.?\s*Móz|3(?:e\.?\s*Moz|\.\s*M[oó]z))es|L(?:e(?:v(?:i(?:ti(?:c(?:us)?|k))?|iti(?:co|ku)|ítico)?|b|f)?|ê(?:-?vi)?|aa?w|év?)|III\.\s*Mojz|III\.?\s*Mojż|(?:III\.?\s*Мој|3\.?\s*Мој)с?|Λευ[ιϊ]τικ[οό]ν|III\s*Mojz|III\.?\s*Mos|III\.?\s*Mós|Λε(?:υ(?:[ιϊ]τ(?:ικ[οό])?)?)?|Лев(?:ит(?:ска)?)?|(?:(?:(?:La(?:v(?:vyi|[ay]y|i)|w(?:ya|i)|w[ae]y)|Laawi)|Kaimam)a|lawiā)n|اللاويين|เลวีนิติ|III\s*Moj|3\.?\s*Mojż|لاوی(?:ان[نهی]|ین|ت)|ا(?:لأ)?حبار|ل(?:ا(?:و(?:ی[ای]ا|يا)|(?:و[ئو]|ؤ)یا|[ءئ]ویا)|ویا)ن|Imamat|ل(?:ا(?:و(?:یان)?)?|وی)|ਲੇਵੀਆਂ|ﺍﻟﻼﻭﻳﻲ|ଲେବୀୟ|iḥbār|(?:《利(?:未[記记]|末记)|利(?:未[記记]|末记))》|《?肋未紀》|ויקרא|《利(?:未[記记]|末记)|《?肋未紀|லேவி|K(?:ap[lł]|p[lł])|3\s*Mz|W(?:al|og)|利(?:未[記记]|末记)|Imt|레위기|《利》|レ[ヒビ]記|ลนต|레위?|《利|レ[ヒビ]|أح|利》))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Втор[ао]\s*писмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Солу|(?:II\.?\s*пи|2\.?\s*пи)смо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Солу|2-?е\.?\s*Солуня)н|T(?:e(?:calōṉikkiyarukku\s*Eḻutiya\s*Iraṇṭāvatu\s*Nirupam|soloniika\s*Labaad)|weede\s*Th?essalonicenzen)|2-?(?:ге|а)\.\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|фессалонікі[ий]ців|до\s*солунян|Солуньці|Солунян)|Друг(?:а\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|(?:(?:(?:(?:(?:посланица\s*)?Солуњанима|Солуньці)|фессалонікі[ий]ців)|Солунян)|до\s*солунян))|е\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|фессалонікі[ий]ців|до\s*солунян|Солуньці|Солунян))|Втор(?:о\s*(?:послание\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Солуняни|\s*ап\.?\s*Павла\s*до\s*Солуняни)|към\s*солунците)|Солунците|Солун(?:ја|я)ни)|а\s*Солунците|а\s*Солун(?:ја|я)ни)|2-?е\.?\s*послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|2-?(?:ге|а)\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|фессалонікі[ий]ців|до\s*солунян|Солуньці|Солунян)|رسالة\s*بولس\s*الرسول\s*الثانية\s*إلى\s*أهل\s*تسالونيكي|தெசலோனிக்க(?:(?:ருக்கு\s*எழுதிய\s*இரண்டா(?:வது|ம்)\s*திருமுக|ேயருக்கு\s*எழுதிய\s*இரண்டாம்\s*கடித)|ியருக்கு\s*எழுதிய\s*இரண்டாவது\s*நிருப)ம்|(?:D(?:ru(?:he\s*poslannja\s*apostola\s*Pavla\s*do\s*solunj|g(?:a\s*(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tesalonicz|do\s*Tesalonicz)|Tesalonicz)|i\s*(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tesalonicz|do\s*Tesalonicz)|Tesalonicz)))a|o(?:(?:(?:vom(?:\s*Tessaloni[ck]y|Tessaloni[ck]y)|vom\s*Thesaloniki|vom(?:Th?|\s*T)esaloniki|\s*Th?esaloniki|Th?esaloniki)|(?:(?:vom\s*?Ts|Ts)|\s*Ts)aloniki)a|(?:vom\s*?t|\s*t|t)essalonik[iy]a))|(?:(?:II\.?\s*L|2\.?\s*L)ist\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tesalonicz|do\s*Tesalonicz)|II\.?\s*Tesalonicz|2(?:\s*T(?:(?:es(?:saloni[ck]y|aloniki)|hesaloniki)|esalonicz)|\.\s*Tesalonicz)|2Tessaloni[ck]y|2Th?esaloniki)a|2(?:(?:\.?\s*Thaissaluneekiyo|\s*Tsalonikia)|Tsalonikia)|dovvom\s*tsālūnīkiā)n|(?:II\.?\s*по|2\.?\s*по)слання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|(?:Paulus(?:'\s*Andet\s*Brev\s*til\s*The|’\s*(?:Andet\s*Brev\s*til\s*Th|andre\s*brev\s*til\s*t)e)ssalonikern|Toinen\s*(?:Kirje\s*tessalonikalaisill|Tessalonikalais(?:kirj|ill))|(?:II\.?\s*K|2\.?\s*K)irje\s*tessalonikalaisill|I(?:kalawang\s*(?:Mga\s*Tesaloni[cs]ens|Tesaloni[cs]ens)|I\.?\s*Mga\s*Tesaloni[cs]ens)|II\.?\s*Tessalonikalaiskirj|2\.\s*Tessalonikalaiskirj|(?:II\.?\s*Tessalonik|2\.?\s*Tessalonik)alaisill|2\s*Tessalonikalaiskirj|Naa77antto\s*Tasalonqq|2\.?\s*Mga\s*Tesaloni[cs]ens|And(?:re|en)\s*Tessalonikern|2(?:\s*[ei]\.?\s*Thesalonikasv|\.\s*(?:T(?:essalonikern|hesalonikasv)|Selanikasv)|\s*T(?:essalonikern|hesalonikasv)|\s*[ei]\.?\s*Selanikasv|\s*Selanikasv)|Do(?:(?:vom\s*?Ts|Ts)|\s*Ts)alonike|2\s*Tsalonike|2Tsalonike)e|تھ(?:سلنیک(?:وں\s*کے\s*نام\s*پو\s*لس\s*رسول\s*کا|یوں\s*کے\s*نام\s*کا\s*)|ِسّلُنیکیوں\s*کے\s*نام\s*کا\s*)دوسرا\s*خط|(?:S[ií]ðara\s*br[eé]f\s*P[aá]ls\s*til\s*Þessalon[ií]kumann|Pavlova\s*druga\s*poslanica\s*Solunjanim|I(?:kalawang\s*(?:Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|Tesalonik)|I\.?\s*Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|I(?:\.\s*T(?:esaloni|èsalon)ik|\s*T(?:esaloni|èsalon)ik))|Druga\s*(?:Solunjanima\s*Poslanic|poslanica\s*Solunjanim)|(?:II\.?\s*Solunj|2\.?\s*Solunj)anima\s*Poslanic|2(?:\.\s*Mga\s*Taga-?\s*|\s*Mga\s*Taga-?\s*)Tesaloni[ck]|2(?:\.\s*(?:Mga\s*Taga-?Tesal[oó]|T(?:aga-?Tesal[oó]|esaló))|\s*(?:Mga\s*Taga-?Tesal[oó]|T(?:aga-?Tesal[oó]|esaló)))ni[ck]|(?:II(?:\.\s*Th?ê-?sa-?lô-?ni-?|\s*Th?ê-?sa-?lô-?ni-?)|(?:2\.?\s*Thê|2\.?\s*Tê)-?sa-?lô-?ni-?)c|(?:II\.?\s*Thêxalô|2\.?\s*Thêxalô)nic|(?:2\.?\s*Tesaloni|2\.?\s*Tèsalon)ik)a|थिस्सलोनिकीहरूलाई\s*(?:पावलको\s*दोस|दोस्त)्रो\s*पत्र|tʰ(?:issal(?:unīkiyōṅ\s*ke\s*nām\s*kā\s*dūsrā\s*ḫaṭ|onik[iī]har[uū]l[aā][iī]\s*dostro\s*patra)|essalan[iī]k[aā]kar[aā][mṃ]s\s*dusre\s*patra|assalunīkīāṃ\s*nū̃\s*dūjī\s*pattrī)|الرسالة\s*الثانية\s*إلى\s*أهل\s*تسالونيكي|पौलाचे\s*थेस्सलनीकाकरांस\s*दुसरे\s*पत्र|S(?:e(?:cond(?:(?:a\s*lettera\s*ai|o)\s*Tessalonicesi|a\s*Tessalonicesi|\s*Thesss)|gundo\s*Tesaloni[cs]enses|cond\s*Th(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)s)|[ií]ðara\s*Þessalon[ií]kubr[eé]f)|Waraka\s*wa\s*Pili\s*kwa\s*Wathesalonik[ei]|Barua\s*ya\s*Pili\s*kwa\s*Wathesalonike|Epistula\s*(?:II\s*ad\s*Thessalonicenses|ad\s*Thessalonicenses\s*II)|אגרת\s*פולוס\s*השנייה\s*אל-?התסלוניקים|ଥେସଲନୀକୀୟଙ୍କ\s*ପ୍ରତି\s*ଦ୍ୱିତୀୟ\s*ପତ୍ର|אגרת\s*פולוס\s*השנייה\s*אל-?התסלונ|M[aá]sodik\s*Th?esszalonikaiakhoz|ה(?:איגרת\s*השנייה\s*אל\s*|שנייה\s*אל[\s*-])התסלוניקים|ਥੱਸਲੁਨੀਕੀਆਂ\s*ਨੂੰ\s*ਦੂਜੀ\s*ਪੱਤ੍ਰੀ|थेस्सलनीकाकरांस\s*दुसरे\s*पत्र|S(?:[ií]ðara\s*br[eé]f\s*P[aá]ls\s*til\s*Þess|e(?:gundo\s*Tesaloni[cs]ense|cond\s*Th(?:(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)|(?:ess?|s)?)))|And(?:r(?:a\s*Th?essalonikerbrevet|e\s*tessalonikerbrev)|e[nt]\s*Thessalonikerbrev)|(?:Druh(?:[aá]\s*kniha\s*Tesaloni(?:c(?:ano|k[yý])|čano)|[yý]\s*(?:list\s*(?:Tesaloni(?:c(?:ano|k[yý])|čano)|Sol(?:un[cč]|ún[cč])ano|Solúnsky|Solu[nň]sk[yý])|(?:Tessalonicensk|Solu[nň]sk)[yý]|Tesaloni(?:c(?:ano|k[yý])|čano)|Sol(?:un[cč]|ún[cč])ano|Solúnsky)|(?:(?:[aá]\s*list\s*Tesalonic|(?:[aá]\s*Tessalonicen|[aá]\s*list\s*Solu[nň])s)k|[aá]\s*Solu[nň]sk)[yý]|(?:(?:[aá]\s*kniha\s*Sol[uú]|[aá]\s*Solú)n[cč]|[aá]\s*Solun[cč])ano|(?:[aá]\s*kniha\s*Sol[uú]|[aá]\s*Solú)nsky|[aá]\s*Tesaloni(?:c(?:ano|k[yý])|čano))|(?:(?:(?:II\.?\s*l|2\.?\s*l)ist\s*Tesalonic|II\.?\s*Soluns|2\.?\s*Soluns)k|II(?:\.\s*Tes(?:salonicens|alonic)k|\s*Tes(?:salonicens|alonic)k)|(?:(?:2\.?\s*Tessalonicens|2\s*Tesalonic)|2\.\s*Tesalonic)k|(?:(?:II\.?\s*l|2\.?\s*l)ist\s*Solu[nň]|II\.?\s*Soluň|2\.?\s*Soluň)sk)[yý]|2\s*k\.?\s*Tesaloni(?:c(?:ano|k[yý])|čano)|(?:II\.?\s*Tesalonican|2\.?\s*Tesalonican)o|(?:II(?:\.\s*(?:Tesalonič|Solun[cč])|\s*(?:Tesalonič|Solun[cč]))|2\.?\s*Tesalonič|(?:2\s*k\.\s*Sol[uú]|II\.?\s*Solú|2\s*k\s*Sol[uú]|2\.?\s*Solú)n[cč]|2\.?\s*Solun[cč])ano|(?:2\s*k\.\s*Sol[uú]|II\.?\s*Solú|2\s*k\s*Sol[uú]|2\.?\s*Solú)nsky)m|(?:(?:(?:Deuxi[eè]me(?:s\s*Thess?alonic|\s*Thess?alonic)|2(?:(?:eme|de?)|ème)\.\s*Thess?alonic|2(?:(?:eme|de?)|ème)\s*Thess?alonic|II\.?\s*Thessalonc|2e\.?\s*Thesalonic|2\.?\s*Thessalonc)ie|Do(?:vom\s*Thessaloni(?:ci)?a|vom\s*?Tessalonikea|vomThessaloni(?:ci)?a|vom\s*?Tessalonia|\s*T(?:hessaloni(?:ci)?a|essaloni(?:ke)?a)|T(?:hessaloni(?:ci)?a|essaloni(?:ke)?a))|(?:Do(?:vom(?:\s*Thessalonik[ei]|Thessalonik[ei])|\s*Thessalonik[ei]|Thessalonik[ei])|(?:II\.?\s*Thessalono|2\.?\s*Thessalono)i|2(?:\s*Thes(?:salon(?:iki|e)|alonii)|\.\s*Thes(?:salone|alonii))|II(?:\.\s*Thes(?:salone|alonii)|\s*Thes(?:salone|alonii))|2Thessalonik[ei])a|(?:II\.?\s*Thessalonici|2\.\s*Thessalonici)[ae]|(?:2e\.?\s*Thessalonici|II\.?\s*Thesalonici|2\.?\s*Thesalonici)e|II(?:\.\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o))|\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o)))|(?:II\.?\s*Thessalonio|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)i|2\.?\s*Thessalonio)a|(?:II\.?\s*Thessalonii|2\.?\s*Thessalonii)o|(?:Do(?:(?:vom\s*?Ts|Ts)|\s*Ts)alonic|2\s*?Tsalonic)ia|(?:II(?:\.\s*Thess?all|\s*Thess?all)|2(?:\.\s*Thess?all|\s*Thess?all))onia|2(?:\s*T(?:hes(?:saloni(?:c(?:i[ae]|a)|kea|e)|alonio)|essaloni(?:ke)?a)|\.\s*Thes(?:saloni(?:ca|e)|alonio))|2\.?\s*Thessaloniaa|(?:II\.?\s*Thessalono|2\.?\s*Thessalono)a|2\.?\s*Thesalonica|2Thessaloni(?:ci)?a|2Tessalonikea|2Tessalonia)n|Second\s*Thes(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|s?elonain|s(?:alon[ai]n|olonin)|alonin)|2(?:(?:(?:\s*(?:tʰessalan[iī]k[aā]kar[aā][mṃ]|Thess?alonin)|\.\s*Thess?alonin)|\s*Tessalonicense)|\.\s*Tessalonicense)|2nd\.?\s*Thes(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|s?elonain|s(?:alon[ai]n|olonin)|alonin)|II(?:\.\s*(?:T(?:essalonicense|hess?alonin)|Þes)|\s*(?:T(?:essalonicense|hess?alonin)|Þes))|(?:II(?:\.\s*Thess?e|\s*Thess?e)|2(?:\.\s*Thess?e|\s*Thess?e))lonain|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)n|(?:II\.?\s*Thesso|2\.?\s*Thesso)lonin|dovvomt|2\.?\s*Þes)s|(?:II\.?\s*по|2\.?\s*по)сланица\s*Солуњанима|(?:II(?:\.\s*Th?essz|\s*Th?essz)|2(?:\.\s*Th?essz|\s*Th?essz))alonikaiakhoz|(?:Segundo|2o\.?)\s*Tessalonicenses|(?:Segunda|2a\.?)\s*Tessalonicenses|رسالة\s*تسالونيكي\s*الثانية|2(?:(?:\.\s*(?:tʰissalonik[iī]har[uū]l[aā][iī]|थ(?:िस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|ेस्सलोनिकेयुस)|Thesss)|(?:-?е\.?\s*к|\.?\s*к)\s*Фессалоники[ий]цам|(?:-?я|[ея])(?:\.\s*(?:к\s*Фессалоники[ий]цам|Фессалоники[ий]цам)|\s*(?:к\s*Фессалоники[ий]цам|Фессалоники[ий]цам))|\s*tʰissalonik[iī]har[uū]l[aā][iī]|\s*(?:T(?:e(?:calōṉikkiyarukku|s(?:saloni(?:k(?:an|ee)|ci)|alonika|l))|hesss|as)|ਥੱਸਲੁਨੀਕੀਆਂ\s*ਨੂੰ|tʰassalunīkīāṃ|ธส)|(?:-?е\.?\s*Ф|\.\s*Ф)ессалоники[ий]цам|\s*थिस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|\s*थेस्सलनीकाकरांस|\s*Фессалоники[ий]цам|\s*थेस्सलोनिकेयुस|(?:\.\s*เธ[ซส]|\s*เธ[ซส])ะโลนิกา|ธสะโลนิกา|テサロニケ|tsā|테살)|تسلن)|2\.?\s*Thessalonikerbrevet|Zweite(?:[nrs])?\s*Thessalonicher|ad\s*Thessalonicenses\s*II|M[aá]sodik\s*T(?:hessz(?:alonika)?|essz(?:alonika)?)|2\.?\s*Tessalonikerbrevet|Προς\s*Θεσσαλονικε(?:ις\s*Β['ʹʹ΄’]|ίς\s*Β['ʹʹ΄’])|2(?:(?:\.\s*(?:T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|e(?:s(?:s(?:aloniker)?)?)?)|थिस्स(?:लोनिकी)?)|\s*Thessalonikerbrev|\s*(?:T(?:h(?:e(?:s(?:s(?:alonici)?)?)?)?|e(?:s(?:s(?:alonika)?|alonik)?)?|s)|தெச(?:லோ)?|Фес)|\s*Tessaloniker|\s*थिस्स(?:लोनिकी)?|e\.?\s*Thess|تسا?|ts)|تسل)|Προς\s*Θεσσαλονικεις\s*Β|I(?:kalawang\s*Tesalonica|I(?:\.\s*(?:T(?:esaloni(?:ceni|ka)|hesss)|Солуняни)|\s*(?:T(?:esaloni(?:ceni|ka)|hesss)|Солуняни)))|D(?:rug(?:a\s*Tesalonicens[oó]w|i\s*Tesalonicens[oó]w)|o(?:vom\s*Thessalonikan|vom\s*?Tessalonikee|vom\s*?Tessalonikan|vomThessalonikan|vom\s*?Tessalonici|\s*T(?:hessalonikan|essalonik(?:ee|an))|T(?:hessalonikan|essalonik(?:ee|an))))|(?:(?:Do(?:vom\s*?Tessaloniki|\s*Tessaloniki|Tessaloniki)|(?:II(?:\.\s*Thess?e|\s*Thess?e)|2(?:\.\s*Thess?e|\s*Thess?e))loni|2\s*?Tessaloniki)an|II(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|2nd\.?\s*Th(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)|2\.?\s*Tesalonicense|(?:II\.?\s*Thessalonio|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)i|2\.?\s*Thessalonio)n|(?:II\.?\s*Thesso|2\.?\s*Thesso)lonian|2\.?\s*Thessalonian|(?:II\.?\s*Theso|2\.?\s*Theso)lonian|2\.?\s*Thesalonian|Pili\s*The|(?:II\.?\s*Ths|2\.?\s*Ths)s)s|(?:II(?:\.\s*T(?:hessalonicenz|es(?:salonicenz|aloniky))|\s*T(?:hessalonicenz|es(?:salonicenz|aloniky)))|2\.?\s*Thessalonicenz|Dezy[eè]m\s*Tesaloniky|2(?:(?:\.\s*Tessalonicenz|\s*Tes(?:salonicenz|aloniky))|\.\s*Tesaloniky))en|2e\.?\s*Thessalonicenzen|(?:2(?:-?е\.?\s*ф|\.?\s*ф)|II\.?\s*ф)ессалонікі[ий]ців|테살로니카(?:\s*신자들에게\s*보낸\s*둘째\s*서간|2서)|(?:II\.?\s*Thessalonicens|2\.?\s*Thessalonicens)es|(?:Do(?:vom\s*?Tessaloniki|\s*Tessaloniki|Tessaloniki)|(?:II(?:\.\s*Thess?e|\s*Thess?e)|2(?:\.\s*Thess?e|\s*Thess?e))loni|2\s*?Tessaloniki)an|2(?:\.[oº]|º)\.?\s*Tesaloni[cs]enses|2\.?\s*tessalonikerbrev|2e\.?\s*Tessalonicenzen|Thessalonicenses\s*II|D(?:o(?:vom\s*Thessaloni(?:ci|ka)|vom\s*?Tessalonika|vomThessaloni(?:ci|ka)|vom\s*?Tsaloniki|\s*T(?:hessaloni(?:ci|ka)|essalonika|saloniki)|T(?:hessaloni(?:ci|ka)|essalonika|saloniki)|vomThess)|ru(?:ga\s*Solunjanima|h(?:[aá]\s*Sol|[yý]\s*(?:Sol|Te)|[aá]\s*Te))|ezy[eè]m\s*Tesalonik)|2(?:\.[oº]|º)\.?\s*Tesaloni[cs]ense|And(?:re\s*Tess(?:aloniker)?|en\s*Thess)|(?:II(?:\.\s*Tesalonicens[oó]|\s*Tesalonicens[oó])|2(?:\.\s*Tesalonicens[oó]|\s*Tesalonicens[oó]))w|(?:II\.?\s*Tesalonis|2\.?\s*Tesalonis)enses|2o\.\s*Tesaloni[cs]enses|(?:Pili\s*W|II\.?\s*W|2\.?\s*W)athesalonike|ଦ୍ୱିତୀୟ\s*ଥେସଲନୀକୀୟଙ|II(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|2nd\.?\s*Th(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)|(?:II\.?\s*Tesalonis|2\.?\s*Tesalonis)ense|2o\.\s*Tesaloni[cs]ense|(?:II(?:\.\s*Th?essz|\s*Th?essz)|2(?:\.\s*Th?essz|\s*Th?essz))(?:alonika)?|(?:II\.?\s*Tessalonices|2\.?\s*Tessalonices|Do\s*?Tessalonic)i|2°\.\s*Tessalonicesi|2o\s*Tesaloni[cs]enses|(?:II(?:\.\s*Thess?aloniai|\s*Thess?aloniai)|(?:2\.?\s*Thessalonia|2\.?\s*Thesalonia)i)d|دو(?:م(?:-?تھِسّلُنیکیوں|\s*تسالون(?:يکیانی|یکیان[هی])|\s*تھِسلُنیکیوں|تسالون(?:يکیانی|یکیان[هی])|(?:\s*تھسّ|۔تھس)لنیکیوں|\s*تھسلنیکوں)|م\s*?تسالونيکيانه|م\s*?تسالونیکيان|\s*تسالون(?:يک(?:يانه|یان)|یک(?:یانه|يان))|تسالون(?:يک(?:يانه|یان)|یک(?:یانه|يان)))|2\.?\s*Thessalonicher|ﺍﻟﺜﺎﻧﻴﺔ\s*ﺗﺴﺎﻟﻮﻧﻴﻜﻲ|2\.?\s*Tesalonicense|(?:II\.?\s*Thessalonio|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)i|2\.?\s*Thessalonio)n|(?:II\.?\s*Thesso|2\.?\s*Thesso)lonian|2o\s*Tesaloni[cs]ense|Β['ʹʹ΄’]\s*Θεσσαλονικε[ίι]ς|2°\s*Tessalonicesi|(?:2\.|۲)-?تھِسّلُنیکیوں|Wathesalonike\s*II|2\s*தெசலோனிக்க(?:ேய)?ர்|(?:II\.?\s*Solunj|2\.?\s*Solunj)anima|2\.?\s*Thessalonian|(?:II\.?\s*Theso|2\.?\s*Theso)lonian|دو(?:م(?:\s*تسالون[يی]کیان|تس(?:الون[يی]کیان)?)|م\s*?تسالونيکيان|\s*تسالون(?:يکي|یکی)ان|تسالون(?:يکي|یکی)ان)|2\.\s*Tesaloni(?:ceni|ka)|(?:2(?:\s*Thessalonika|tsl)|2Tessalonika|۲tsl)n|(?:2\.?\s*تھ|۲\s*تھ)ِسلُنیکیوں|2-?تھِسّلُنیکیوں|(?:2(?:-?е\.?\s*д|\.?\s*д)|II\.?\s*д)о\s*солунян|II(?:\.\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?|ê)|Сол(?:унян)?|Sol)|\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?|ê)|Сол(?:унян)?|Sol))|2(?:\s*Thessalonika|tsl)|2\.?\s*Thesalonian|2\s*Tesaloniceni|2Thessalonikan|(?:2\s*|۲)تسالون(?:يکیانی|یکیان[هی])|۲\s*تسالون(?:يکیانی|یکیان[هی])|(?:(?:2\.?\s*تھ|۲\s*تھ)سّ|(?:2\.?۔|۲۔)تھس)لنیکیوں|(?:(?:(?:2\s*|۲)|2)|۲\s*)تسالونيکيانه|(?:II\.?\s*Солуњ|2\.?\s*Солуњ)анима|2\.\s*Tesaloni(?:ca|k)|2Thessaloni(?:ci|ka)|(?:2\s*|۲)تسالون[يی]کیان|۲\s*تسالون[يی]کیان|(?:(?:(?:2\s*|۲)|2)|۲\s*)تسالونيکيان|Втор(?:а\s*Сол(?:унци)?|о\s*Сол(?:унци)?)|2Tessalonikee|2تسالون(?:يکیانی|یکیان[هی])|(?:(?:(?:2\s*|۲)|2)|۲\s*)تسالونیکيان|(?:II\.?\s*Солунц|2\.?\s*Солунц)ите|(?:II\.?\s*Солунј|2\.?\s*Солунј)ани|2-?е\.?\s*Солуньці|テサロニケ(?:人への(?:第二の手紙|後の書|手紙[Ⅱ二])|の信徒への手紙二|\s*2|後書)|2\.?\s*ଥେସଲନୀକୀୟଙ|2\s*Tesalonica|2Tessalonika|Tweede\s*T(?:hess|ess?)|2تسالون[يی]کیان|2Tessalonici|(?:2\.?\s*تھ|۲\s*تھ)سلنیکوں|(?:II\.?\s*Солунь|2\.?\s*Солунь)ці|2\s*Tsaloniki|(?:II\.?\s*Солунц|2\.?\s*Солунц)и|2\.?\s*Солуняни|2nd\.?\s*Thesss|2\.?\s*Сол(?:унян)?|2Tsaloniki|2nd\.?\s*Th(?:ess?|s)?|Друга\s*Сол|(?:《帖(?:撒罗尼迦后书|[后後])|帖(?:撒罗尼迦后书|[后後])|《?莎倫後)》|《?帖撒羅尼迦後書》|Ⅱ\s*テサロニケ人へ|Pili\s*The|(?:II\.?\s*Ths|2\.?\s*Ths)s|2e\.?\s*Tess|《帖(?:撒罗尼迦后书|[后後])|《?帖撒羅尼迦後書|《?得撒洛尼後書》|Pili\s*Th|II\.?\s*Ths|2e\.?\s*Tes|帖(?:撒罗尼迦后书|[后後])|《?得撒洛尼後書|데살로니가[2후]서|2\.?\s*Sol|2Thess|Β['ʹʹ΄’]\s*Θεσ?|2\.?\s*Ths|2\.?\s*Tê|۲تسلن|۲(?:تسل?|ts)|۲tsl|2\s*تس|《?莎倫後|살후))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:П(?:рв[ао]\s*писмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Солун|ерш[ае]\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|фессалонікі[ий]ців|до\s*солунян|Солуньці|Солунян)|ърв(?:о\s*(?:послание\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Солуняни|\s*ап\.?\s*Павла\s*до\s*Солуняни)|към\s*солунците)|Солун(?:ците|яни))|а\s*Солун(?:ците|яни))|рва\s*(?:посланица\s*)?Солуњанима|рв[ао]\s*Солунците|рв[ао]\s*Солунјани)|(?:(?:1\.?\s*пи|I\.?\s*пи)смо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Солу|1-?е\.?\s*Солуня)н|Te(?:calōṉikkiyarukku\s*Eḻutiya\s*Mutalāvatu\s*Nirupam|soloniika\s*Kowaad)|1-?(?:ше|а)\.\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|фессалонікі[ий]ців|до\s*солунян|Солуньці|Солунян)|1-?е\.?\s*послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|1-?(?:ше|а)\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|фессалонікі[ий]ців|до\s*солунян|Солуньці|Солунян)|(?:P(?:er[sš]e\s*poslannja\s*apostola\s*Pavla\s*do\s*solunj|ierwsz[aey]\s*(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tesalonicz|do\s*Tesalonicz)|Tesalonicz))|(?:1\.?\s*L|I\.?\s*L)ist\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tesalonicz|do\s*Tesalonicz)|Avval(?:\s*Tessaloni[ck]y|Tessaloni[ck]y)|Avval\s*Thesaloniki|(?:Avval(?:Th?|\s*T)esa|1Th?esa)loniki|1(?:\s*T(?:(?:es(?:saloni[ck]y|aloniki)|hesaloniki)|esalonicz)|\.\s*Tesalonicz)|I\.?\s*Tesalonicz|1Tessaloni[ck]y)an|رسالة\s*(?:بولس\s*الرسول\s*الأولى\s*إلى\s*أهل\s*تسالونيكي|تسالونيكي\s*الأولى)|தெசலோனிக்க(?:ியருக்கு\s*எழுதிய\s*முதலாவது\s*நிருப|(?:ேயருக்கு\s*எழுதிய\s*முதலாம்\s*கடித|ருக்கு\s*எழுதிய\s*முதல்\s*திருமுக))ம்|(?:1\.?\s*посланн|I\.?\s*посланн)я\s*(?:св\.?\s*апостола\s*Павла\s*до\s*солунян|апостола\s*Павла\s*до\s*солунян|до\s*(?:(?:фессалонікі[ий]ців|салонікі[ий]ців)|солунян))|(?:Paulus(?:(?:'\s*Første|'\s*1\.?)\s*Brev\s*til\s*Thessalonikern|’\s*(?:Første\s*Brev\s*til\s*Th|(?:(?:første\s*brev\s*til\s*t|1\s*Brev\s*til\s*Th)|1\.\s*Brev\s*til\s*Th))essalonikern)|Ensimm[aä]inen\s*(?:Kirje\s*tessalonikalaisill|Tessalonikalais(?:kirj|ill))|(?:1\.?\s*K|I\.?\s*K)irje\s*tessalonikalaisill|1\.\s*Tessalonikalaiskirj|I\.?\s*Tessalonikalaiskirj|Una(?:ng\s*(?:Mga\s*Tesaloni[cs]ens|Tesaloni[cs]ens)|\s*(?:Mga\s*Tesaloni[cs]ens|Tesaloni[cs]ens))|1\s*Tessalonikalaiskirj|(?:1\.?\s*Tessalonik|I\.?\s*Tessalonik)alaisill|Første\s*Tessalonikern|1\.?\s*Mga\s*Tesaloni[cs]ens|I\.?\s*Mga\s*Tesaloni[cs]ens|1(?:\s*[ei]\.?\s*Thesalonikasv|\.\s*(?:T(?:essalonikern|hesalonikasv)|Selanikasv)|\s*T(?:essalonikern|hesalonikasv)|\s*[ei]\.?\s*Selanikasv|\s*Selanikasv)|Koiro\s*Tasalonqq|(?:Avval\s*?Ts|1Ts)alonike|Yek\s*?Tsalonike|1\s*Tsalonike)e|تھ(?:س(?:ّلنیکیوں\s*کے\s*نام\s*پولس\s*رسول|لنیکیوں\s*کے\s*نام)|ِسّلُنیکیوں\s*کے\s*نام)\s*کا\s*پہلا\s*خط|(?:Fyrra\s*br[eé]f\s*P[aá]ls\s*til\s*Þessalon[ií]kumann|P(?:avlova\s*prva\s*poslanica\s*Solunjanim|rva\s*(?:Solunjanima\s*Poslanic|poslanica\s*Solunjanim))|Una(?:ng\s*(?:Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|Tesalonik)|\s*(?:Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|Tesalonik))|(?:1\.?\s*Solunj|I\.?\s*Solunj)anima\s*Poslanic|1(?:\.\s*Mga\s*Taga-?\s*|\s*Mga\s*Taga-?\s*)Tesaloni[ck]|I\.?\s*Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|1(?:\.\s*(?:Mga\s*Taga-?Tesal[oó]|T(?:aga-?Tesal[oó]|esaló))|\s*(?:Mga\s*Taga-?Tesal[oó]|T(?:aga-?Tesal[oó]|esaló)))ni[ck]|(?:(?:1\.?\s*Thê|1\.?\s*Tê)-?sa-?lô-?ni-?|I(?:\.\s*Th?ê-?sa-?lô-?ni-?|\s*Th?ê-?sa-?lô-?ni-?))c|(?:1\.?\s*Tesaloni|1\.?\s*Tèsalon)ik|I(?:\.\s*T(?:esaloni|èsalon)ik|\s*T(?:esaloni|èsalon)ik)|(?:1\.?\s*Thêxalô|I\.?\s*Thêxalô)nic)a|tʰ(?:issal(?:unīkiyōṅ\s*ke\s*nām\s*kā\s*pahlā\s*ḫaṭ|onik[iī]har[uū]l[aā][iī]\s*pahilo\s*patra)|assalunīkīāṃ\s*nū̃\s*pahilī\s*pattrī|essalan[iī]k[aā]kar[aā][mṃ]s\s*pahile\s*patra)|थिस्सलोनिकीहरूलाई\s*प(?:ावलको\s*प)?हिलो\s*पत्र|Wa(?:raka\s*wa\s*Kwanza\s*kwa\s*Wathesalonik[ei]|thesalonike\s*I)|Barua\s*ya\s*Kwanza\s*kwa\s*Wathesalonike|पौलाचे\s*थेस्सलनीकाकरांस\s*पहिले\s*पत्र|الرسالة\s*الأولى\s*إلى\s*أهل\s*تسالونيكي|אגרת\s*פולוס\s*הראשונה\s*אל-?התסלוניקים|(?:Prim(?:(?:a\s*lettera\s*ai|o)|a)\s*Tessalonices|1°\.\s*Tessalonices|1\.?\s*Tessalonices|I\.?\s*Tessalonices|1°\s*Tessalonices)i|(?:Epistula\s*I\s*ad\s*Thessalonicense|(?:Primeir[ao]\s*T|1a\.?\s*T)essalonicense|1(?:(?:(?:\s*(?:tʰessalan[iī]k[aā]kar[aā][mṃ]|Thess?alonin)|\.\s*Thess?alonin)|\s*Tessalonicense)|\.\s*Tessalonicense)|(?:1\.?\s*Thessalonicens|I\.?\s*Thessalonicens)e|1o\.?\s*Tessalonicense|I(?:\.\s*(?:T(?:essalonicense|hess?alonin)|Þes)|\s*(?:T(?:essalonicense|hess?alonin)|Þes))|First\s*Thessalonin|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)n|(?:First\s*Thesso|1st\.\s*Thesso|1st\s*Thesso|1\.?\s*Thesso|I\.?\s*Thesso)lonin|1st\.\s*Thessalonin|(?:First|1st\.?)\s*Thesalonin|1st\s*Thessalonin|Thes(?:s(?:alon[ai]n|olonin)|alonin)|1\.?\s*Þes|avvalt)s|(?:(?:Epistula\s*)?ad\s*)?Thessalonicenses\s*I|ଥେସଲନୀକୀୟଙ୍କ\s*ପ୍ରତି\s*ପ୍ରଥମ\s*ପତ୍ର|ה(?:איגרת\s*ה)?ראשונה\s*אל\s*התסלוניקים|ਥ(?:ਸੱ|ੱਸ)ਲੁਨੀਕੀਆਂ\s*ਨੂੰ\s*ਪਹਿਲੀ\s*ਪੱਤ੍ਰੀ|אגרת\s*פולוס\s*הראשונה\s*אל-?התסלו|F(?:[oö]rsta\s*Th?essalonikerbrevet|ørste\s*(?:Th|t)essalonikerbrev|yrra\s*Þessalon[ií]kubr[eé]f|irst\s*Thesss)|थेस्सलनीकाकरांस\s*पहिले\s*पत्र|F(?:yrra\s*br[eé]f\s*P[aá]ls\s*til\s*Þessa|ørste\s*T(?:ess(?:aloniker)?|hess)|irst\s*Th(?:ess?|s)?)|(?:(?:Premi(?:er(?:e(?:s\s*Thess?alonic|\s*Thess?alonic)|(?:s\s*Thess?alonic|\s*Thess?alonic))|ère(?:s\s*Thess?alonic|\s*Thess?alonic))|1(?:(?:ere?|re)|ère)\.\s*Thess?alonic|First\s*Thessalonc|1(?:(?:ere?|re)|ère)\s*Thess?alonic|1st\.\s*Thessalonc|1st\s*Thessalonc|1\.?\s*Thessalonc|I\.?\s*Thessalonc)ie|(?:First\s*Thessalonici|1st\.\s*Thessalonici|1st\s*Thessalonici|1\.\s*Thessalonici|I\.?\s*Thessalonici)[ae]|First\s*Thessaloni(?:ca|e)|(?:First\s*Thessaloni[ao]|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)i|1st\.\s*Thessaloni[ao]|1st\s*Thessaloni[ao]|1\.?\s*Thessalonio|I\.?\s*Thessalonio)a|(?:First\s*Thessalonii|1st\.\s*Thessalonii|1st\s*Thessalonii|1\.?\s*Thessalonii|I\.?\s*Thessalonii)o|(?:Avval\s*?Tessalonike|1Tessalonike)a|(?:(?:First\s*Thessalono|1st\.\s*Thessalono|1st\s*Thessalono|1\.?\s*Thessalono|I\.?\s*Thessalono)i|(?:(?:First\s*Thessall|1st\.\s*Thessall|(?:First|1st\.?)\s*Thesall|1st\s*Thessall|1(?:\.\s*Thess?all|\s*Thess?all)|I(?:\.\s*Thess?all|\s*Thess?all))on|Thess?allon)i|First\s*Thessalone|(?:First|1st\.?)\s*Thesaloni[ci]|1st\.\s*Thessalone|(?:Avval\s*?Ts|1Ts)alonici|1(?:\s*Thes(?:salon(?:iki|e)|alonii)|\.\s*Thes(?:salone|alonii))|1st\s*Thessalone|I(?:\.\s*Thes(?:salone|alonii)|\s*Thes(?:salone|alonii))|Thes(?:salon(?:oi|e)|aloni[ci])|1\s*Tsalonici)a|1st\.\s*Thessaloni(?:ca|e)|(?:First\s*Thessalono|1st\.\s*Thessalono|1st\s*Thessalono|1\.?\s*Thessalono|I\.?\s*Thessalono)a|(?:First\s*Thess?e|1st\.\s*Thess?e|1st\s*Thess?e|1(?:\.\s*Thess?e|\s*Thess?e)|I(?:\.\s*Thess?e|\s*Thess?e))lonai|1st\s*Thessaloni(?:ca|e)|Avval\s*?Tessalonia|(?:First|1st\.?)\s*Thesalonio|1(?:\s*T(?:hes(?:saloni(?:c(?:i[ae]|a)|kea|e)|alonio)|essaloni(?:ke)?a)|\.\s*Thes(?:saloni(?:ca|e)|alonio))|1\.?\s*Thessaloniaa|I(?:\.\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o))|\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o)))|(?:1\.?\s*Thesalonici|I\.?\s*Thesalonici)e|1\.?\s*Thesalonica|Thes(?:s(?:alon(?:i(?:c(?:i[ae]|a)|[ao]a|io)|aia|cie|oa)|elonai)|alonio|elonai)|1Tessalonia)ns|E(?:ls[oő]\s*Th?esszalonikaiakhoz|rste(?:[nrs])?\s*Thessalonicher)|(?:Prv(?:[aá]\s*kniha\s*(?:Tesaloni(?:c(?:ano|k[yý])|čano)|Sol[uú]n[cč]ano|Sol[uú]nsky)|n[ií]\s*(?:list\s*(?:Tesalonic|Solu[nň]s)k|(?:(?:Tessalonicens|Solu[nň]s)|Tesalonic)k)[yý]|[yý]\s*(?:list\s*(?:Tesaloni(?:c(?:ano|k[yý])|čano)|Sol[uú]n[cč]ano|Sol[uú]nsky)|Tesaloni(?:c(?:ano|k[yý])|čano)|Sol[uú]n[cč]ano|Sol[uú]nsky)|[aá]\s*Tesaloni(?:c(?:ano|k[yý])|čano)|(?:a\s*Sol(?:un[cč]|ún[cč])|á\s*Sol[uú]n[cč])ano|a\s*Sol[uú]nsky|á\s*Sol[uú]nsky)|(?:(?:1\.?\s*l|I\.?\s*l)ist\s*(?:Tesalonic|Solu[nň]s)k|(?:(?:1\.?\s*Tessalonicens|1\s*Tesalonic)|1\.\s*Tesalonic)k|I(?:\.\s*Tes(?:salonicens|alonic)k|\s*Tes(?:salonicens|alonic)k)|(?:1\.?\s*Soluns|I\.?\s*Soluns|(?:1\.?\s*Soluň|I\.?\s*Soluň)s)k)[yý]|1\s*k\.\s*(?:Tesaloni(?:c(?:ano|k[yý])|čano)|Sol[uú]n[cč]ano|Sol[uú]nsky)|1\s*k\s*(?:Tesaloni(?:c(?:ano|k[yý])|čano)|Sol[uú]n[cč]ano|Sol[uú]nsky)|(?:1\.?\s*Tesalonican|I\.?\s*Tesalonican)o|(?:1\.?\s*Tesalonič|I(?:\.\s*(?:Tesalonič|Solun[cč])|\s*(?:Tesalonič|Solun[cč]))|1\.?\s*Solun[cč]|(?:1\.?\s*Solú|I\.?\s*Solú)n[cč])ano|(?:1\.?\s*Solú|I\.?\s*Solú)nsky)m|Pierwsz[aey]\s*Tesalonicens[oó]w|(?:Eerste\s*Th?essalonicenze|1\.?\s*Thaissaluneekiyo|1e\.\s*Th?essalonicenze|(?:1\.?\s*Thessalonicenz|I(?:\.\s*T(?:hessalonicenz|es(?:salonicenz|aloniky))|\s*T(?:hessalonicenz|es(?:salonicenz|aloniky)))|Premye\s*Tesaloniky|1(?:(?:\.\s*Tessalonicenz|\s*Tes(?:salonicenz|aloniky))|\.\s*Tesaloniky))e|1e\s*Th?essalonicenze|(?:Avval\s*?Ts|1Ts)alonikia|avval\s*tsālūnīkā|1\s*Tsalonikia)n|(?:1\.?\s*послани|I\.?\s*послани)ца\s*Солуњанима|1(?:(?:(?:\.\s*(?:tʰissalonik[iī]har[uū]l[aā][iī]|थ(?:िस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|ेस्सलोनि)|เธ[ซส]ะโลนิกา|Thesss)|(?:-?е\.?\s*к|\.?\s*к)\s*Фессалоники[ий]цам|(?:-?я|[ея])(?:\.\s*(?:к\s*Фессалоники[ий]цам|Фессалоники[ий]цам)|\s*(?:к\s*Фессалоники[ий]цам|Фессалоники[ий]цам))|\s*tʰissalonik[iī]har[uū]l[aā][iī]|\s*(?:T(?:e(?:calōṉikkiyarukku|s(?:saloni(?:k(?:an|ee)|ci)|alonika|l))|hesss|as)|थेस्सलनीकाकरांस|ਥੱਸਲੁਨੀਕੀਆਂ\s*ਨੂੰ|tʰassalunīkīāṃ|ธส)|(?:-?е\.?\s*Ф|\.\s*Ф)ессалоники[ий]цам|\s*थिस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|\s*Фессалоники[ий]цам|\s*เธ[ซส]ะโลนิกา|\s*थेस्सलोनि|テサロニケ|tsā|테살)|\s*Tesaloniceni)|\.\s*Tesaloni(?:ceni|ka))|1\.?\s*Thessalonikerbrevet|(?:1(?:\.\s*Th?essz|\s*Th?essz)|I(?:\.\s*Th?essz|\s*Th?essz))alonikaiakhoz|(?:Primer(?:o\s*Tesaloni[cs]ense|\s*Tesaloni[cs]ense)|1(?:\.[oº]|º)\.\s*Tesaloni[cs]ense|(?:First\s*Thessaloni[ao]|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)i|1st\.\s*Thessaloni[ao]|1st\s*Thessaloni[ao]|1\.?\s*Thessalonio|I\.?\s*Thessalonio)n|1o\.?\s*Tesaloni[cs]ense|1(?:\.[oº]|º)\s*Tesaloni[cs]ense|1\.?\s*Tesalonicense|I(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|(?:1\.?\s*Tesalonis|I\.?\s*Tesalonis)ense|1\.?\s*Thessalonian|1\.?\s*Thesalonian|Thessalon(?:ain|i[ao]n)|First\s*Thss|Kwanza\s*The|1st\.\s*Thss|1st\s*Thss|(?:1\.?\s*Ths|I\.?\s*Ths)s)s|Primer(?:o\s*Tesaloni[cs]ense|\s*Tesaloni[cs]ense)|1\.?\s*Tessalonikerbrevet|Avval\s*Thessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|Προς\s*Θεσσαλονικε(?:ις\s*Α['ʹʹ΄’]|ίς\s*Α['ʹʹ΄’])|1(?:(?:(?:(?:\.\s*(?:T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|e(?:s(?:s(?:aloniker)?)?)?)|थ(?:िस्स(?:लोनिकी)?|ेस्स))|\s*Thessalonikerbrev|\s*(?:T(?:h(?:e(?:s(?:s(?:alonici)?)?)?)?|e(?:s(?:s(?:alonika)?|alonik)?)?|s)|தெச(?:லோ)?|थेस्स|Фес)|\s*Tessaloniker|\s*थिस्स(?:लोनिकी)?|تسا?|ts)|\s*Tesalonica)|\.\s*Tesaloni(?:ca|k))|\.?\s*Tê)|Προς\s*Θεσσαλονικεις\s*Α|(?:Avval\s*?Tessaloniki|(?:First\s*Thess?e|1st\.\s*Thess?e|1st\s*Thess?e|1(?:\.\s*Thess?e|\s*Thess?e)|I(?:\.\s*Thess?e|\s*Thess?e))loni|(?:First\s*Theso|1st\.\s*Theso|1st\s*Theso|1\.?\s*Theso|I\.?\s*Theso)loni|1\s*?Tessaloniki|Thes(?:se|[eo])loni)ans|(?:Avval|1)Thessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|(?:1(?:-?е\.?\s*ф|\.?\s*ф)|I\.?\s*ф)ессалонікі[ий]ців|테살로니카(?:\s*신자들에게\s*보낸\s*첫째\s*서간|1서)|(?:Kwanza\s*W|1\.?\s*W|I\.?\s*W)athesalonike|(?:Avval\s*?Tessaloniki|(?:First\s*Thess?e|1st\.\s*Thess?e|1st\s*Thess?e|1(?:\.\s*Thess?e|\s*Thess?e)|I(?:\.\s*Thess?e|\s*Thess?e))loni|(?:First\s*Theso|1st\.\s*Theso|1st\s*Theso|1\.?\s*Theso|I\.?\s*Theso)loni|1\s*?Tessaloniki|Thes(?:se|[eo])loni)an|1\.?\s*tessalonikerbrev|(?:(?:(?:First\s*Thesso|1st\.\s*Thesso|1st\s*Thesso|1\.?\s*Thesso|I\.?\s*Thesso)|(?:First|1st\.?)\s*Thesa)lonia|Thes(?:so|a)lonia)ns|Avval\s*?tessalonik[iy]an|Yek(?:\s*T(?:hessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|essaloni(?:(?:k(?:ians|ee)|ci)|kan)|(?:essaloni(?:ke)?a|salonicia)ns)|T(?:hessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|essaloni(?:(?:k(?:ians|ee)|ci)|kan)|(?:essaloni(?:ke)?a|salonicia)ns)|(?:\s*Th?esaloniki|Th?esaloniki)an|\s*?tessalonik[iy]an|\s*?Tsalonikian)|E(?:ls[oő]\s*T(?:hessz(?:alonika)?|essz(?:alonika)?)|erste\s*T(?:hess|ess?))|1(?:\.[oº]|º)\.\s*Tesaloni[cs]ense|(?:First\s*Thessaloni[ao]|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)i|1st\.\s*Thessaloni[ao]|1st\s*Thessaloni[ao]|1\.?\s*Thessalonio|I\.?\s*Thessalonio)n|(?:(?:(?:First\s*Thesso|1st\.\s*Thesso|1st\s*Thesso|1\.?\s*Thesso|I\.?\s*Thesso)|(?:First|1st\.?)\s*Thesa)lonia|Thes(?:so|a)lonia)n|Avval\s*Thessaloni(?:ci|ka)|او(?:ّل(?:-?تھِسّلُ|(?:\s*تھِسلُ|(?:\s*تھسّ|۔تھس)ل))نیکیوں|ل(?:\s*تسالون(?:یکیان[هی]|يکیانی)|تسالون(?:یکیان[هی]|يکیانی)))|(?:Avval\s*?Tessalonike|1Tessalonike)e|(?:Avval\s*?Tessalonika|1(?:\s*Thessalonika|tsl)|1Tessalonika|۱tsl)n|1o\.?\s*Tesaloni[cs]ense|1(?:\.[oº]|º)\s*Tesaloni[cs]ense|Avval\s*?Tessalonika|(?:Avval|1)Thessaloni(?:ci|ka)|Yek(?:\s*T(?:essalonikian|hessaloni(?:ci|ka)|essalonika|saloniki)|T(?:essalonikian|hessaloni(?:ci|ka)|essalonika|saloniki))|(?:1(?:\.\s*Tesalonicens[oó]|\s*Tesalonicens[oó])|I(?:\.\s*Tesalonicens[oó]|\s*Tesalonicens[oó]))w|Avval\s*?Tessalonici|1\.?\s*Thessalonicher|Pr(?:v(?:a\s*Solunjanima|n[ií]\s*(?:Sol|Te))|emye\s*Tesalonik)|(?:1(?:\.\s*Th?essz|\s*Th?essz)|I(?:\.\s*Th?essz|\s*Th?essz))(?:alonika)?|1\.?\s*Tesalonicense|I(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|(?:1\.?\s*Tesalonis|I\.?\s*Tesalonis)ense|Α['ʹʹ΄’]\s*Θεσσαλονικε[ίι]ς|(?:1\.|۱)-?تھِسّلُنیکیوں|(?:(?:1\.?\s*Thessalonia|1\.?\s*Thesalonia)i|I(?:\.\s*Thess?aloniai|\s*Thess?aloniai))d|Una(?:ng)?\s*Tesalonica|(?:اول\s*?تسالونيکي|(?:(?:[1۱]\s*|1)|۱)تسالونيکي)انه|ପ୍ରଥମ\s*ଥେସଲନୀକୀୟଙ|1\s*தெசலோனிக்க(?:ேய)?ர்|اول(?:\s*تسالون[يی]کیان|تس(?:(?:الونیکیان)?|الونيکیان))|(?:Avval\s*?Ts|1Ts)aloniki|1\.?\s*Thessalonian|(?:اول\s*?تسالونيکي|(?:(?:[1۱]\s*|1)|۱)تسالونيکي)ان|I(?:\.\s*(?:T(?:esaloni(?:ceni|ka)|hesss)|Солуняни)|\s*(?:T(?:esaloni(?:ceni|ka)|hesss)|Солуняни))|(?:1\.|[1۱])\s*تھِسلُنیکیوں|1-?تھِسّلُنیکیوں|(?:1(?:-?е\.?\s*д|\.?\s*д)|I\.?\s*д)о\s*солунян|(?:اول\s*?تسالونیکي|(?:(?:[1۱]\s*|1)|۱)تسالونیکي)ان|یک(?:\s*تسالون(?:يک(?:يانه|یان)|یک(?:یانه|يان))|تسالون(?:يک(?:يانه|یان)|یک(?:یانه|يان)))|(?:1\.?\s*Solunj|I\.?\s*Solunj)anima|1\.?\s*Thesalonian|1(?:\s*Thessalonika|tsl)|یک(?:\s*تسالون(?:يکي|یکی)ان|تسالون(?:يکي|یکی)ان)|[1۱]\s*تسالونیکیان[هی]|[1۱]\s*تسالونيکیانی|(?:1\.\s*تھسّ|(?:(?:1\.?۔|۱۔)تھس|[1۱]\s*تھسّ))لنیکیوں|(?:اول\s*|[1۱])تسالونیکان|ﺍﻻﻭﻝ\s*ﺗﺴﺎﻟﻮﻧﻴﻜﻲ|I(?:\.\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?|ê)|Сол(?:унян)?|Sol)|\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?|ê)|Сол(?:унян)?|Sol))|[1۱]\s*تسالونیکیان|[1۱]\s*تسالونيکیان|П(?:ърв(?:а\s*Сол(?:унци)?|о\s*Сол(?:унци)?)|рва\s*Сол)|1تسالون(?:یکیان[هی]|يکیانی)|۱تسالون(?:یکیان[هی]|يکیانی)|(?:1\.?\s*Солуњ|I\.?\s*Солуњ)анима|1-?е\.?\s*Солуньці|テサロニケ(?:人への(?:第一の手紙|前の書|手紙[Ⅰ一])|の信徒への手紙一|\s*1|前書)|1\.?\s*ଥେସଲନୀକୀୟଙ|1تسالون[يی]کیان|۱تسالون[يی]کیان|Thessalon(?:ain|i[ao]n)|1Tessalonika|1Tessalonici|(?:1\.?\s*Солунц|I\.?\s*Солунц)ите|(?:1\.?\s*Солунј|I\.?\s*Солунј)ани|1\s*Tsaloniki|1\.?\s*Солуняни|1st\.\s*Thesss|(?:1\.?\s*Солунь|I\.?\s*Солунь)ці|1\.?\s*Сол(?:унян)?|1st\.\s*Th(?:ess?|s)?|AvvalThess|First\s*Thss|Kwanza\s*The|(?:1\.?\s*Солунц|I\.?\s*Солунц)и|1st\s*Thesss|1st\s*Th(?:ess?|s)?|Kwanza\s*Th|1e\.\s*T(?:hess|ess?)|1st\.\s*Thss|(?:《帖(?:撒罗尼迦前书|前)|帖(?:撒罗尼迦前书|前)|《?莎倫前)》|《?帖撒羅尼迦前書》|Ⅰ\s*テサロニケ人へ|1e\s*T(?:hess|ess?)|1st\s*Thss|《帖(?:撒罗尼迦前书|前)|《?帖撒羅尼迦前書|《?得撒洛尼前書》|(?:1\.?\s*Ths|I\.?\s*Ths)s|帖(?:撒罗尼迦前书|前)|《?得撒洛尼前書|데살로니가[1전]서|1\.?\s*Sol|1\.?\s*Ths|I\.?\s*Ths|Α['ʹʹ΄’]\s*Θεσ?|1Thess|1تسلن|۱تسلن|1تسل|۱(?:تسل?|ts)|1\s*تس|۱tsl|《?莎倫前|살전))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:இராஜாக்களின்\s*இரண்டாம்\s*புத்தகம்|(?:Kawotu\s*Maxaafaa\s*Naa77anttuwa|D(?:ruga\s*(?:knjiga\s*o\s*)?Kraljevim|ezy[eè]m\s*W)|Toinen\s*Kuninkaiden\s*kirj|S(?:iðari\s*b[oó]k\s*konungann|íðari\s*b[oó]k\s*konungann)|II\.?\s*Kuninkaiden\s*kirj|Raja-?raja\s*Yang\s*Kedu|2\.?\s*Kuninkaiden\s*kirj|(?:II\.?\s*Kralj|2\.?\s*Kralj)evim|(?:II\.?\s*Para\s*Ra|(?:(?:2\.?\s*Raja-?r|2\s*Para\s*R)|2\.\s*Para\s*R)a)j|(?:II(?:\.\s*(?:Các\s*)?V|\s*(?:Các\s*)?V)|2\.?\s*Các\s*V|2\.?\s*V)u)a|(?:Kitabu\s*cha\s*Pili\s*cha\s*Wafalm|2\s*[ei]\.?\s*Mbret[eë]rv|4(?:\s*[ei]\.?\s*Mbret[eë]rv|\.\s*Mbret[eë]rv|\s*Mbret[eë]rv)|2\.\s*Mbret[eë]rv|Pili\s*Wafalm|2(?:\s*Mbret[eë]rv|\.?\s*Konig)|(?:II\.?\s*Waf|2\.?\s*Waf)alm|Second[ao]\s*R|2°\.\s*R|2°\s*R)e|राजा(?:ओ\s*का\s*विर्तान्त\s*[2२]रा\s*भाग|हरूको\s*दोस्रो\s*पुस्तक)|F(?:jerde\s*Kongerigernes\s*Bog|ourth\s*Kingdoms)|C(?:artea\s*(?:a\s*patra|IV)\s*a\s*Regilor|zwarta\s*Ks(?:i[eę]g[ai]\s*Kr[oó]lewska|\.\s*Kr[oó]lewska|\s*Kr[oó]lewska))|Четв(?:ърт(?:а\s*(?:(?:книга\s*на\s*царете|Цар(?:ства|е))|Книга\s*на\s*царете)|о\s*(?:Книга\s*на\s*царете|Цар(?:ства|е)))|ърта\s*книга\s*Царства|рта\s*краљев(?:ств|им)а|ерта\s*Царів)|(?:Втор[ао]\s*книга\s*за\s*цареви|(?:II\.?\s*книга\s*з|2\.?\s*книга\s*з)а\s*цареви)те|ରାଜାବଳୀର\s*ଦ୍ୱିତୀୟ\s*ପୁସ୍ତକ|(?:Drug(?:a\s*Ks(?:i[eę]g[ai]\s*Kr[oó]le|\.\s*Kr[oó]le|\s*Kr[oó]le)|i\s*Ks(?:i[eę]g[ai]\s*Kr[oó]le|\.\s*Kr[oó]le|\s*Kr[oó]le))|(?:II\.?\s*Ks|2\.?\s*Ks)(?:i[eę]g[ai]\s*Kr[oó]le|\.\s*Kr[oó]le|\s*Kr[oó]le)|2\s*Kr[oó]le)wska|(?:Друга\s*(?:Књига\s*)?о\s*цареви|(?:(?:II\.?\s*К|2\.?\s*К)њига\s*о|(?:II\.?\s*о|2\.?\s*о))\s*цареви)ма|D(?:ru(?:h(?:[aá]\s*kniha\s*kr[aá]lovsk[aá]|[yý]\s*(?:kniha\s*kr[aá]lovsk[aá]|Kr[aá]lovsk[aá])|[aá]\s*Kr[aá]lovsk[aá])|g(?:a\s*Ks(?:i[eę]g[ai]\s*Kr[oó]l[oó]w|\.\s*Kr[oó]l[oó]w|\s*Kr[oó]l[oó]w)|i\s*Ks(?:i[eę]g[ai]\s*Kr[oó]l[oó]w|\.\s*Kr[oó]l[oó]w|\s*Kr[oó]l[oó]w)))|ezy[eè]m\s*liv\s*Wa\s*yo)|4\.?\s*Kongerigernes\s*Bog|(?:IV\.?\s*Ks|4\.?\s*Ks)(?:i[eę]g[ai]\s*Kr[oó]lewska|\.\s*Kr[oó]lewska|\s*Kr[oó]lewska)|rājiāṃ\s*dī\s*dūjī\s*potʰī|(?:II\.?\s*k|2\.\s*k)niha\s*kr[aá]lovsk[aá]|(?:Stvrt[aá]\s*(?:kniha\s*Kr[aá][lľ]o|Kr[aá][lľ]o)|Štvrt[aá]\s*(?:kniha\s*Kr[aá][lľ]o|Kr[aá][lľ]o)|Druh[aá]\s*kniha\s*Kr[aá][lľ]o|(?:Druh[yý]\s*list|[24]\s*k\.)\s*Kr[aá][lľ]o|(?:Druh(?:[aá]\s*Kr[aá]ľ|[yý]\s*Kr[aá]ľ)|II\.?\s*Kraľ|(?:II\.?\s*Krá|2\.?\s*Krá)ľ|2\.?\s*Kraľ)o|(?:IV\.?\s*Kr|4\.?\s*Kr)[aá][lľ]o|[24]\s*k\s*Kr[aá][lľ]o)v|IV\.?\s*Книга\s*на\s*царете|δυτικ[οό]ς\s*Βασιλ[έε]ων\s*Β['ʹʹ΄’]|ਰਾਜਿਆਂ\s*ਦੀ\s*ਦੂਜੀ\s*ਪੋਥੀ|T(?:oinen\s*Kuninkaiden|weede\s*Kon?)|I(?:ka(?:lawang\s*(?:Mga\s*)?|apat\s*Mga\s*)Hari|I(?:\.\s*(?:Boqorradi|[IÎ]mp[aă]ra[tţ])|\s*Boqorradi|\s*[IÎ]mp[aă]ra[tţ])i|(?:I\.?\s*M|V\.?\s*M)ga\s*Hari|I(?:\.\s*(?:Царев[аи]|Regi|Kis)|\s*(?:Царев[аи]|(?:Regi|(?:Raj|Kis))))|V(?:\.\s*(?:Regi|Царе)|\s*(?:Regi|Царе))|I\.?\s*Hari)|Andra\s*K(?:on)?ungaboken|4\.?\s*Книга\s*на\s*царете|2\s*kniha\s*kr[aá]lovsk[aá]|(?:II\.?\s*Ks|2\.?\s*Ks)(?:i[eę]g[ai]\s*Kr[oó]l[oó]w|\.\s*Kr[oó]l[oó]w|\s*Kr[oó]l[oó]w)|(?:Do(?:(?:vom(?:\s*[Pp]|[Pp])|p)ad(?:eshahna|eshah[ao]|ishaha|shah[ao])|\s*pad(?:eshahna|eshah[ao]|ishaha|shah[ao]))|2(?:\s*(?:Pad(?:eshahna|eshah[ao]|ishaha|shah[ao])|salāṭī)|Pad(?:eshahna|eshah[ao]|ishaha|shah[ao])))n|S(?:iðari\s*Konungab[oó]|íðari\s*(?:Konungab[oó]|konungabó))k|Boqorradii\s*Labaad|(?:4(?:(?:(?:-?[ея](?:\.\s*(?:Книга\s*)?Царст|\s*(?:Книга\s*)?Царст)|[ея](?:\.\s*(?:Книга\s*)?Царст|\s*(?:Книга\s*)?Царст)|\.?\s*Книга\s*Царст)|\s*Царі)|\.\s*Царі)|IV\.?\s*Царі)в|(?:2-?(?:ге|а)\.\s*(?:книга\s*)?ц|Друг(?:а\s*(?:книга\s*)?ц|е\s*(?:книга\s*)?ц)|2-?е\.?\s*книга\s*ц|2-?(?:ге|а)\s*(?:книга\s*)?ц|II(?:\.\s*(?:книга\s*)?ц|\s*(?:книга\s*)?ц)|2\.?\s*книга\s*ц|2(?:-?е\.?\s*ц|\.?\s*ц))арів|سفر\s*الملوك\s*الثاني|M[aá]sodik\s*Kir[aá]lyok|II\s*a\s*[IÎ]mp[aă]ra[tţ]ilor|ଦ୍ୱିତୀୟ\s*ରାଜାବଳୀର|II\.?\s*Kuninkaiden|Четвърт(?:а\s*Цар(?:ств)?|о\s*Цар(?:ств)?)|ଦ୍ୱିତୀୟ\s*ରାଜାବଳୀ|2(?:(?:\.\s*(?:พ(?:งศ์กษัตริย์|กษ)|राजा(?:हरूको|ओं)|Kongebo[gk]|Царе[ий])|\s*พ(?:งศ์กษัตริย์|กษ)|\s*(?:Irājākkaḷ|r(?:ā(?:jiāṃ|ǳe)|aǳe)|الملوك|ਰਾਜਿਆਂ|R(?:ey?s|y?s)|राजे|Kr[lľ]|مل)|\s*राजा(?:हरूको|ओं)|\s*Kongebo[gk]|-?е\.?\s*Царе[ий]|(?:-?я|[ея])(?:\.\s*Царе[ий]|\s*Царе[ий])|\s*Царе[ий]|Rj|열왕)|Raj)|(?:Tweede\s*Konin|(?:(?:II\.?\s*Konin|2\.?\s*Konin)|2e\.?\s*Konin))gen|2\.?\s*Konungaboken|Zweite(?:[nrs]\s*K(?:(?:oe|ö)|o)nige|\s*K(?:(?:oe|ö)|o)nige)|(?:II(?:\.\s*Brenh?inoed|\s*Brenh?inoed)|2\.\s*Brenh?inoed|2\s*Brenh?inoed)d|(?:Druga\s*Kr[oó]|II(?:\.\s*Kr[oó]|\s*Kr[oó])|2\.\s*Kr[oó])lewska|Drugi\s*Kr[oó]lewska|2\.?\s*Kuninkaiden|Andre\s*Kongebok|Liber\s*II\s*Regum|(?:(?:Deuxi[eè]mes?\s*Ro|2(?:(?:eme|de?)|ème)\.\s*Ro|2(?:(?:eme|de?)|ème)\s*Ro|II\.?\s*Ro|2e\.?\s*Ro|2\.?\s*Ro)i|Segund(?:o\s*Re(?:ye|i)|a\s*Rei)|Quart[ao]\s*Reino|(?:2(?:(?:\.[oº]|º)\.?\s*Rey|\.\s*Rey)|II\.?\s*Rey)e|(?:IV\.?\s*Rei|4\.?\s*Rei)no|4[ao]\.\s*Reino|2o\.\s*Re(?:ye|i)|4[ao]\s*Reino|II\.?\s*Rei|DovomKg|2a\.\s*Rei|2o\s*Re(?:ye|i)|2\.?\s*Rei|2a\s*Rei|2Kg)s|Anden\s*Kongebog|(?:IV\.?\s*к|4\.?\s*к)раљев(?:ств|им)а|الممالك\s*الرابع|(?:2(?:(?:\.\s*Boqorradi|\s*(?:Boqorradi|Har))|\s*Imp[aă]ra[tţ])|2(?:\.\s*[IÎ]|\s*Î)mp[aă]ra[tţ])i|(?:(?:II\.?\s*Kralo|2\.?\s*Kralo)|(?:II\.?\s*Krá|2\.?\s*Krá)lo)vsk[aá]|2(?:\.\s*r[aā]ǳ[aā]har[uū]k|\s*r(?:aǳ[aā]|āǳ[aā])har[uū]k)o|دو(?:(?:م\s*)?پادش(?:اه(?:اان|ا?ن)|هان)|مپادش(?:اه(?:اان|ا?ن)|هان)|\s*پادش(?:اه(?:اان|ا?ن)|هان)|م(?:-?سلاطِ|[\s*۔]سلاط)ین)|2\.\s*Kungaboken|4th\.\s*Kingdoms|(?:Друга\s*(?:краљ|Цар)е|(?:II\.?\s*кр|2\.?\s*кр)аље)ва|ﺍﻟﻤﻠﻮﻙ\s*ﺍﻟﺜﺎﻧﻲ|Druh(?:[aá]\s*Kr(?:[aá]l(?:ov)?)?|[yý]\s*Kr(?:[aá]l(?:ov)?)?)|Second\s*K(?:i?ng?s|(?:i?g|i?)s)|2\s*Kungaboken|(?:II\.?\s*Kir|2\.?\s*Kir)[aá]lyok|(?:IV\.?\s*Regnor|4\.?\s*Regnor)um|(?:IV\.?\s*Ki|4\.?\s*Ki)ngdoms|4th\s*Kingdoms|Втор[ао]\s*Цареви|Βασιλει[ωώ]ν\s*Δ['ʹʹ΄’]|(?:2\s*(?:இராஜாக|அரசர)்|4\s*அரசு)கள்|Second\s*K(?:i?ng?|i?g|i)?|دو(?:(?:م\s*)?پادشاها|مپ(?:ادشاها)?|\s*پادشاها)|M[aá]sodik\s*Kir|(?:2\.?\s*Mg|4\.?\s*Mg)a\s*Hari|Β['ʹʹ΄’]\s*Βασιλ[έε]ων|[2۲]\s*پادش(?:اه(?:اان|ا?ن)|هان)|Kir[aá]lyok\s*II|2-?(?:ге|а)\.\s*Cariv|Друг[ае]\s*Cariv|(?:IV\.?\s*Царс|4\.?\s*Царс)тва|2\.?\s*ରାଜାବଳୀର|(?:II\.?\s*Kralo|2\.?\s*Kralo)v|(?:II\.?\s*Krá|2\.?\s*Krá)l(?:ov)?|And(?:en|re)\s*Kong|(?:IV\.?\s*Царс|4\.?\s*Царс)тв|2\.?\s*ରାଜାବଳୀ|2nd\.?\s*K(?:i?ng?s|(?:i?g|i?)s)|(?:(?:(?:2\.|۲)-?سلاطِ|(?:(?:(?:2\.?\s*س|۲\s*س)|(?:2\.?۔|۲۔)س)لاط|2-?سلاطِ))ی|[2۲]پادشاهاا)ن|(?:Wafalme|Regum)\s*II|2(?:\.\s*K(?:oe|ö)ni|\s*K(?:oe|ö)ni)ge|2-?е\.?\s*Cariv|2-?(?:ге|а)\s*Cariv|दुसरे\s*राजे|2nd\.?\s*K(?:i?ng?|i?g|i)?|[2۲]\s*پادشاها|Друга\s*Цар|2\.?\s*Царев[аи]|(?:II(?:\.\s*Ki?n|\s*Ki?n)|2\.?\s*Kin|2\.?\s*Kn)g?s|[2۲]پادشاها?ن|(?:II\.?\s*Regu|2\.?\s*Regu)m|(?:II\.?\s*Ca|2\.?\s*Ca)riv|I(?:I(?:\.\s*(?:K(?:r(?:al)?|i)|Reg?|Boq|[IÎ]mp|Цар|Wa)|\s*(?:(?:(?:K(?:r(?:al)?|i?)|Reg?)|Wa)|Boq)|\s*[IÎ]mp|\s*Цар)|V\.?\s*Цар)|(?:II(?:\.\s*Ki?n|\s*Ki?n)|2\.?\s*Kin|2\.?\s*Kn)g?|[2۲]پادشاها|Pili\s*Fal|(?:II(?:\.\s*Ki?g|\s*Ki?g)|2(?:\s*(?:R(?:ey?e|ye)|Kg)|\.\s*Kg)|2\.?\s*Kig)s|[2۲]پادشهان|מלכים\s*ב['’]|2(?:\s*(?:(?:இரா(?:ஜா)?|K(?:r(?:[oó]l)?|ung?)|Bren|R(?:aj|ey|y)?|Ha|Mb|அர)|Ko(?:ng?)?)|\.\s*(?:K(?:o(?:ng?)?|(?:oe|ö)n?)|Raja|राजा|Цар)|\s*K(?:oe|ö)n?|\s*Raja|\s*राजा|\s*Цар)|2\.\s*Kr(?:al)?|II(?:\.\s*Ki?g|\s*Ki?g)|II\.?\s*Kon?|2e\.?\s*Kon?|II\.?\s*Kir|מלכים\s*ב|2\.?\s*Regi|4\.?\s*Regi|4\.\s*Царе|2\.\s*Hari|(?:II\.?\s*F|2\.?\s*F)al|2\s*Kral|2\.?\s*Reg|2\.\s*Boq|2(?:\.\s*[IÎ]|\s*Î)mp|4\.\s*Цар|2(?:\s*(?:R(?:ey?e|ye)|Kg)|\.\s*Kg)|2\.?\s*Kig|Β['ʹʹ΄’]\s*Βασ?|2\.?\s*Kir|2\.?\s*Kis|4\s*Царе|2pādsh|۲pādsh|列(?:王(?:記(?:第四巻|[Ⅱ下])|紀略下|\s*2)|下)|《(?:列王[紀纪记]下》|王下》)|열왕기(?:\s*하권|하)|2\.?\s*Ki|2\.?\s*Wa|2\s*Boq|2\s*Imp|4\s*Цар|2پا(?:دش?)?|۲(?:پا(?:دش?)?|pād?)|《(?:列王[紀纪记]下|王下)|열왕기\s*하|2\s*Kaw|列王紀下》|(?:列王[纪记]|王)下》|2pād?|列王紀下|(?:列王[纪记]|王)下|4\s*Ц|Ⅱ列王|왕하))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:K(?:itabu\s*cha\s*Kwanza\s*ch|wanz)a\s*Wafalm|1\s*[ei]\.?\s*Mbret[eë]rv|3(?:\s*[ei]\.?\s*Mbret[eë]rv|\.\s*Mbret[eë]rv|\s*Mbret[eë]rv)|Erste(?:[nrs]\s*K(?:(?:oe|ö)|o)nig|\s*K(?:(?:oe|ö)|o)nig)|1\.\s*Mbret[eë]rv|1\s*Mbret[eë]rv|(?:1\.?\s*Waf|I\.?\s*Waf)alm|1(?:\.\s*K(?:oe|ö)ni|\s*K(?:oe|ö)ni)g|1\.?\s*Konig)e|(?:Ensimm[aä]inen\s*Kuninkaiden\s*kirj|Kawotu\s*Maxaafaa\s*Koiruwa|Pr(?:va\s*(?:knjiga\s*o\s*)?Kraljevim|emye\s*W)|Raja-?raja\s*Yang\s*Pertam|Fyrri\s*b[oó]k\s*konungann|1\.?\s*Kuninkaiden\s*kirj|I\.?\s*Kuninkaiden\s*kirj|(?:1\.?\s*Kralj|I\.?\s*Kralj)evim|(?:(?:(?:1\.?\s*Raja-?r|1\s*Para\s*R)|1\.\s*Para\s*R)a|I\.?\s*Para\s*Ra)j|(?:1\.?\s*Các\s*V|1\.?\s*V)u|I(?:\.\s*(?:Các\s*)?Vu|\s*(?:Các\s*)?Vu))a|இராஜாக்களின்\s*முதலாம்\s*புத்தகம்|राजा(?:ओ\s*का\s*विर्तान्त\s*[1१]ला\s*भाग्|हरूक\s*पहिल\s*पुस्तक)|(?:Pierwsz[aey]\s*Ks(?:i[eę]g[ai]\s*Kr[oó]le|\.\s*Kr[oó]le|\s*Kr[oó]le)|(?:1\.?\s*Ks|I\.?\s*Ks)(?:i[eę]g[ai]\s*Kr[oó]le|\.\s*Kr[oó]le|\s*Kr[oó]le)|1\s*Kr[oó]le)wska|T(?:r(?:edje\s*Kongerigernes\s*Bog|zeci(?:a\s*Ks(?:i[eę]g[ai]\s*Kr[oó]lewska|\.\s*Kr[oó]lewska|\s*Kr[oó]lewska)|\s*Ks(?:i[eę]g[ai]\s*Kr[oó]lewska|\.\s*Kr[oó]lewska|\s*Kr[oó]lewska)))|erceir[ao]\s*Reinos|hird\s*Kingdoms)|Cartea\s*(?:a\s*treia|III)\s*a\s*Regilor|E(?:nsimm[aä]inen\s*Kuninkaiden|erste\s*Kon?|ls[oő]\s*Kir)|P(?:ierwsz[aey]\s*Ks(?:i[eę]g[ai]\s*Kr[oó]l[oó]w|\.\s*Kr[oó]l[oó]w|\s*Kr[oó]l[oó]w)|r(?:vn[ií]\s*(?:kniha\s*kr[aá]lovsk[aá]|Kr[aá]lovsk[aá])|emye\s*liv\s*Wa\s*yo|im[ao]\s*Re))|(?:Прв[ао]\s*книга\s*за\s*цареви|(?:1\.?\s*книга\s*з|I\.?\s*книга\s*з)а\s*цареви)те|r(?:ā(?:jiāṃ\s*dī\s*pahilī\s*potʰī|ǳ[aā]har[uū]ko\s*pustak)|aǳ[aā]har[uū]ko\s*pustak)|(?:III\.?\s*Ks|3\.?\s*Ks)(?:i[eę]g[ai]\s*Kr[oó]lewska|\.\s*Kr[oó]lewska|\s*Kr[oó]lewska)|(?:Прва\s*(?:Књига\s*)?о\s*цареви|(?:(?:1\.?\s*К|I\.?\s*К)њига\s*о|(?:1\.?\s*о|I\.?\s*о))\s*цареви)ма|Тре(?:т(?:(?:а\s*(?:(?:книга\s*на\s*царете|Цар(?:ства|е))|Книга\s*на\s*царете)|о\s*(?:Книга\s*на\s*царете|Цар(?:ства|е))|[яє]\s*Царів)|а\s*книга\s*Царства)|ћ(?:ом\s*краљев(?:ств|им)а|а\s*краљев(?:ств|им)а))|ରାଜାବଳୀର\s*ପ୍ରଥମ\s*ପୁସ୍ତକ|3\.?\s*Kongerigernes\s*Bog|III\.?\s*Книга\s*на\s*царете|ਰਾਜਿਆਂ\s*ਦੀ\s*ਪਹਿਲੀ\s*ਪੋਥੀ|(?:(?:F[oö]rsta\s*K(?:on)?ungabok|(?:1\.?\s*Konu|1\.?\s*Ku)ngabok)e|Eerste\s*Koninge|1e\.\s*Koninge|1\.?\s*Koninge|I\.?\s*Koninge|1e\s*Koninge|1\s*salāṭī)n|(?:Tret(?:(?:ia\s*kniha|í)\s*Kr[aá][lľ]o|i(?:a\s*Kr[aá][lľ]o|\s*Kr[aá][lľ]o))|(?:Prva\s*kniha|Prvá\s*kniha|Prv[yý]\s*list|[13]\s*k\.)\s*Kr[aá][lľ]o|(?:Prva\s*Kral|(?:Prva\s*Kraľ|1\.\s*Kr[aá]ľ|I(?:\.\s*Kr[aá]ľ|\s*Kr[aá]ľ)|1\s*Kr[aá]ľ))o|Prva\s*Krá[lľ]o|(?:III\.?\s*Kr|3\.?\s*Kr)[aá][lľ]o|Prv(?:[yý]\s*K|á\s*K)r[aá][lľ]o|[13]\s*k\s*Kr[aá][lľ]o)v|δυτικ[οό]ς\s*Βασιλ[έε]ων\s*Α['ʹʹ΄’]|(?:1\.\s*k|I\.?\s*k)niha\s*kr[aá]lovsk[aá]|Pierwsz[aey]\s*Kr[oó]lewska|3\.?\s*Книга\s*на\s*царете|1\s*kniha\s*kr[aá]lovsk[aá]|I(?:katlong\s*M|II\.?\s*M|\.?\s*M)ga\s*Hari|(?:Avval(?:\s*[Pp]|[Pp])|1P)ad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n|Boqorradii\s*Kowaad|(?:3(?:-?е\.?\s*Книга\s*Царст|(?:-?я|[ея])(?:\.\s*(?:Книга\s*)?Царст|\s*(?:Книга\s*)?Царст)|\.?\s*Книга\s*Царст|-?е\.?\s*Царст|-?е\.?\s*Царі|\.?\s*Царі)|III\.?\s*Царі)в|(?:1-?(?:ше|а)\.\s*(?:книга\s*)?ц|Перш[ае]\s*(?:книга\s*)?ц|1-?е\.?\s*книга\s*ц|1-?(?:ше|а)\s*(?:книга\s*)?ц|1\.?\s*книга\s*ц|I(?:\.\s*(?:книга\s*)?ц|\s*(?:книга\s*)?ц)|1(?:-?е\.?\s*ц|\.?\s*ц))арів|(?:1\.?\s*Ks|I\.?\s*Ks)(?:i[eę]g[ai]\s*Kr[oó]l[oó]w|\.\s*Kr[oó]l[oó]w|\s*Kr[oó]l[oó]w)|(?:Fyrri\s*(?:Konungab[oó]|konungabó)|Els[oő]\s*Kir[aá]lyo|(?:1\.?\s*Kir|I\.?\s*Kir)[aá]lyo)k|سفر\s*الملوك\s*الأول|1(?:(?:\.\s*(?:พ(?:งศ์กษัตริย์|กษ)|राजा(?:हरूको|ओं)|Царе[ий])|\s*พ(?:งศ์กษัตริย์|กษ)|\s*(?:Irājākkaḷ|r(?:ā(?:jiāṃ|ǳe)|aǳe)|الملوك|ਰਾਜਿਆਂ|R(?:ey?s|y?s)|राजे|Kr[lľ])|\s*राजा(?:हरूको|ओं)|-?е\.?\s*Царе[ий]|(?:-?я|[ея])(?:\.\s*Царе[ий]|\s*Царе[ий])|\s*Царе[ий]|Rj|열왕)|Raj)|F(?:ørste\s*Kongebo[gk]|irst\s*K(?:i?ng?s|(?:i?g)?s))|Yek(?:\s*pad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n|pad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n)|(?:III\.?\s*к|3\.?\s*к)раљев(?:ств|им)а|I\s*a\s*[IÎ]mp[aă]ra[tţ]ilor|1\.?\s*Kuninkaiden|I\.?\s*Kuninkaiden|Una(?:ng\s*(?:Mga\s*)?Hari|\s*(?:Mga\s*)?Hari)|الممالك\s*الثالث|(?:Pr(?:emi(?:eres?\s*Roi|ères?\s*Roi|ers?\s*Roi)|imero?\s*Reye|imeir[ao]\s*Rei)|(?:III\.?\s*Ki|3\.?\s*Ki)ngdom|3rd\.\s*Kingdom|3rd\s*Kingdom|1(?:\.[oº]|º)\.\s*Reye|1(?:(?:ere?|re)|ère)\.\s*Roi|(?:1(?:o\.?\s*Rey|\.\s*Rey)|I\.?\s*Rey)e|1(?:\.[oº]|º)\s*Reye|1(?:(?:ere?|re)|ère)\s*Roi|1(?:o\.?\s*Rei|\.?\s*Rei)|AvvalKg|(?:1a\.\s*Re|1\.?\s*Ro|I\.?\s*Ro|1a\s*Re)i|I\.?\s*Rei|K(?:in)?g|(?:1K|Kn)g)s|(?:1\.\s*Brenh?inoed|I(?:\.\s*Brenh?inoed|\s*Brenh?inoed)|1\s*Brenh?inoed)d|ପ୍ରଥମ\s*ରାଜାବଳୀର|ପ୍ରଥମ\s*ରାଜାବଳୀ|1(?:\.\s*r[aā]ǳ[aā]har[uū]k|\s*r(?:aǳ[aā]|āǳ[aā])har[uū]k)o|(?:1(?:(?:\.\s*Boqorradi|\s*(?:Boqorradi|Har))|\s*Imp[aă]ra[tţ])|I(?:\.\s*(?:Boqorradi|[IÎ]mp[aă]ra[tţ])|\s*Boqorradi|\s*[IÎ]mp[aă]ra[tţ])|1(?:\.\s*[IÎ]|\s*Î)mp[aă]ra[tţ])i|1\s*Pad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n|(?:III\.?\s*Regnor|3\.?\s*Regnor)um|Liber\s*I\s*Regum|اول\s*پادش(?:اه(?:اان|ا?ن)|هان)|Трет(?:а\s*Цар(?:ств)?|о\s*Цар(?:ств)?)|(?:1\.\s*Kr[aá]lovs|I(?:\.\s*Kr[aá]lovs|\s*Kr[aá]lovs)|1\s*Kr[aá]lovs)k[aá]|(?:1\.\s*Kr[oó]|I(?:\.\s*Kr[oó]|\s*Kr[oó]))lewska|(?:III\.?\s*Царс|3\.?\s*Царс)тва|(?:Прва\s*кр|(?:1\.?\s*кр|I\.?\s*кр))аљева|(?:اوّل(?:-?سلاطِ|[\s*۔]سلاط)ی|(?:(?:1\.|۱)-?سلاطِ|(?:(?:(?:1\.?\s*س|۱\s*س)|(?:1\.?۔|۱۔)س)لاط|1-?سلاطِ))ی|[1۱]پادشاهاا)ن|اولپادش(?:اه(?:اان|ا?ن)|هان)|یک(?:\s*پادش(?:اه(?:اان|ا?ن)|هان)|پادش(?:اه(?:اان|ا?ن)|هان))|الملوك\s*الأول|Βασιλει[ωώ]ν\s*Γ['ʹʹ΄’]|(?:1\s*(?:இராஜாக|அரசர)்|3\s*அரசு)கள்|F(?:ørste\s*Kong|irst\s*K(?:i?ng?|i?g|i)?)|(?:III\.?\s*Царс|3\.?\s*Царс)тв|اول\s*پادشاها|1\.?\s*Kongebo[gk]|(?:1\.?\s*Mg|3\.?\s*Mg)a\s*Hari|Α['ʹʹ΄’]\s*Βασιλ[έε]ων|(?:III\.?\s*Rei|3\.?\s*Rei)nos|1-?(?:ше|а)\.\s*Cariv|П(?:рв(?:а\s*Царев[аи]|о\s*Цареви)|ерш[ае]\s*Cariv)|3-?(?:тє|а)\.\s*Царів|[1۱]\s*پادش(?:اه(?:اان|ا?ن)|هان)|1\.?\s*ରାଜାବଳୀର|Prvn[ií]\s*Kr(?:[aá]l)?|اولپادشاها|یک\s*?پادشاها|1\.?\s*ରାଜାବଳୀ|Kwanza\s*Fal|1st\.\s*K(?:i?ng?s|(?:i?g)?s)|(?:Kir[aá]lyok|Regum)\s*I|3[ao]\.\s*Reinos|1-?е\.?\s*Cariv|1-?(?:ше|а)\s*Cariv|3-?(?:тє|а)\s*Царів|पहिले\s*राजे|ﺍﻟﻤﻠﻮﻙ\s*ﺍﻷﻭ|1(?:(?:\.\s*Kr(?:alov|ál(?:ov)?|al)?|(?:(?:\s*Kralov|(?:(?:\s*(?:(?:(?:இரா(?:ஜா)?|K(?:r(?:[oó]l)?|ung?)|Bren|R(?:aj|ey|y)?|Ha|Mb|அர)|Ki)|Kon?)|\.\s*(?:K(?:(?:oe|ö)n?|on?|i)|Raja|राजा|Цар)|\s*K(?:oe|ö)n?|\s*Raja|\s*राजा|\s*Цар)|\s*Kral))|\s*Král(?:ov)?))|\.?\s*Reg)|I(?:\.\s*(?:Kr(?:alov|ál(?:ov)?|al)?|Reg?|Boq|[IÎ]mp|Wa)|\s*(?:(?:(?:K(?:r(?:alov|ál(?:ov)?|al)?)?|Reg?)|Wa)|Boq)|\s*[IÎ]mp)|1st\.\s*K(?:i?ng?|i?g|i)?|[1۱]\s*پادشاها|III\.?\s*Regi|III\.?\s*Царе|1st\s*K(?:i?ng?s|(?:i?g)?s)|Wafalme\s*I|3[ao]\s*Reinos|1\.?\s*Царев[аи]|I\.?\s*Царев[аи]|[1۱]پادشاها?ن|III\.?\s*Цар|1st\s*K(?:i?ng?|i?g|i)?|Прва\s*Цар|[1۱]پادشاها|(?:1(?:\.\s*Ki?n|\s*Ki?n)|I(?:\.\s*Ki?n|\s*Ki?n))g?s|(?:1\.?\s*Regu|I\.?\s*Regu)m|מלכים\s*א['’]|(?:1\.?\s*Ca|I\.?\s*Ca)riv|[1۱]پادشهان|(?:1(?:\.\s*Ki?n|\s*Ki?n)|I(?:\.\s*Ki?n|\s*Ki?n))g?|1\.?\s*Kong|1e\.\s*Kon?|מלכים\s*א|1\.?\s*Regi|I(?:\.\s*Regi|\s*R(?:egi|aj))|3(?:\.\s*(?:Regi|Царе)|\s*(?:Regi|Царе))|(?:1(?:\s*(?:(?:R(?:ey?e|ye)|Kg)|Kig)|\.\s*Ki?g)|I(?:\.\s*Ki?g|\s*Ki?g))s|(?:1\.\s*H|I\.?\s*H)ari|1\.\s*Boq|1(?:\.\s*[IÎ]|\s*Î)mp|3(?:\.\s*Цар|\s*Ц(?:ар)?)|1(?:\s*(?:(?:R(?:ey?e|ye)|Kg)|Kig)|\.\s*Ki?g)|I(?:\.\s*Ki?g|\s*Ki?g)|1\.?\s*Kir|I\.?\s*Kir|I\.?\s*Kon?|1e\s*Kon?|Α['ʹʹ΄’]\s*Βασ?|I\.?\s*Цар|(?:1\.?\s*F|I\.?\s*F)al|1pādsh|۱pādsh|列(?:王(?:記(?:第三巻|[Ⅰ上])|紀略上|\s*1)|上)|1°\.\s*Re|《(?:列王[紀纪记]上》|王上》)|열왕기(?:\s*상권|상)|1\.?\s*Wa|1\s*Boq|1\s*Imp|1پا(?:دش?)?|۱(?:پا(?:دش?)?|pād?)|《(?:列王[紀纪记]上|王上)|열왕기\s*상|1°\s*Re|1\s*Kaw|列王紀上》|(?:列王[纪记]|王)上》|1pād?|اولپ|列王紀上|(?:列王[纪记]|王)上|1\s*مل|Kin|Ⅰ列王|왕상))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["EpJer"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:அவை\s*இளைஞர்\s*மூவரின்\s*பாடல்|The\s*(?:(?:Ep(?:istle|\.)|Ep)\s*of\s*Jeremiah|Let(?:ter|\.?)\s*of\s*Jeremiah)|Pismo\s*Jeremije\s*proroka|Ang\s*Liham\s*ni\s*Jeremias|П(?:о(?:слани(?:ца\s*Јеремијина|е\s*(?:на\s*[ИЙ]еремия|Иеремии))|ел\.?\s*Иер|с(?:\.\s*[ИЙ]|\s*[ИЙ])ер)|исма\s*Јеремије)|(?:La\s*Carta\s*de\s*Jerem[ií]|Carta\s*(?:de\s*Jerem[ií]|Jerem[ií]))as|(?:(?:Epistola\s*lui\s*I|Brief\s*(?:des|van)\s*J|Barua\s*ya\s*Y|Surat\s*Y)eremi|L(?:ettera\s*di\s*Geremi|lythyr\s*Jeremei|ist\s*Jeremiasz)|Br[eé]f\s*Jerem[ií])a|Epistle\s*of\s*Jeremiah|Let(?:ter)?\s*of\s*Jeremiah|எரேமியாவின்\s*கடிதம்|Epistle\s*of\s*Jeremy|Epitre\s*de\s*J[eé]r[eé]mie|Epître\s*de\s*J[eé]r[eé]mie|Ép(?:[iî]tre\s*de\s*J[eé]r[eé]mie|(?:\.\s*J[eé]r[eé]|\s*J[eé]r[eé])mie)|Liham\s*ni\s*Jeremias|Επιστολ(?:η\s*Ιερεμ[ίι]ου|ή\s*Ιερεμ[ίι]ου|[ηὴ]\s*᾿Ιερ)|Jeremi(?:jino\s*pismo|asov\s*list|ašov\s*list|á[sš]ov\s*list)|Let\.\s*of\s*Jeremiah|எரேமியாவின்\s*மடல்|List\s*Jeremj[aá][sš][uů]v|(?:Jeremi(?:a(?:s\s*level|n\s*kirj)|ás\s*level)|Oratio\s*Ieremia)e|Ep\.?\s*of\s*Jeremiah|Послання\s*Єремі[ії]|Jeremias(?:['’]\s*B|\s*b)rev|איגרת\s*ירמיהו|Ep\.?\s*J[eé]r[eé]mie|Лист\s*Єремі[ії]|رسالة\s*إرميا|Carta\s*Jer|(?:Li\s*ni|Sul)\s*Jer|Cart\.?\s*Jer|예레미야의\s*편지|イエレミヤの達書|Ep\.?\s*J[eé]r|Ép(?:\.\s*J[eé]r|\s*J[eé]r)|(?:Or\.?\s*I|Sur\s*?Y|Let-?g|BJ)er|(?:Lih|Br)\s*Jer|《EpJer》|エレミヤ(?:の(?:手紙|書翰)|・手)|《EpJer|Jer\s*?br|EpJer》|EpJer))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Marathi\s*(?:Er(?:yah|mia)|Irmia)|مراث(?:ی\s*ا(?:(?:رم[يی]|رم)|ِرم)\s*یا|ي\s*إرميا))|مراثی\s*ارميا|(?:C(?:hante\s*pou\s*plenn\s*S[oò]\s*lavil\s*Jerizal[eè]m|a\s*thương)|(?:(?:Pl(?:angerile\s*(?:profetu)?lui\s*I|ângerile\s*(?:profetu)?lui\s*I)|Maombolezo\s*ya\s*Y)eremi|Lamentacje\s*Jeremiasz|Ermmaasa\s*Zilaassa|Treny\s*Jeremiasz|Marathi(?:\s*(?:Er(?:yi?ah|m(?:ei|ia))|Irm(?:ei|ia))|y['’]|['’]y)|Marathi\s*Eryei|Klagovisorn|Nudub\s*Yermi)a|L(?:am(?:enta(?:(?:(?:(?:c[oõ]es\s*de\s*Jeremia|tione)|côes\s*de\s*Jeremia)s|ç(?:[oõ]|ô)es\s*de\s*Jeremias)|ciones)|inta(?:cione|tion)s)|m)|(?:Baroorashadii\s*Yeremyaa|Galarnad\s*Jeremia|Kidung\s*Pangadhu|Marathi(?:\s*(?:Erm['’]yaa|Irm['’]yaa)|yaa))h|(?:Lamenta(?:tions\s*de\s*J[eé]r[eé]mi|cij)|Klagesangen)e|K(?:lagelieder\s*Jeremias|niha\s*n[aá](?:rk[uů]|řk[uů]))|எரேமியாவின்\s*புலம்பல்|(?:Aklat\s*ng\s*Pa(?:nan|gt)agho|Mga\s*Panagho|Panagho|N[aá]rek)y|Jeremi(?:jine\s*tu[zž]aljke|[aá](?:s(?:\s*siralmai|ov\s*Pla[cč])|šov\s*Pla[cč]))|Книга\s*Плач\s*Иеремиев|П(?:лач(?:ът\s*на\s*(?:[ИЙ]е|Е)ремия|от\s*на\s*Еремија|\s*(?:на\s*Еремиин|Јеремијин|Иеремии|Еремиин|Єремі[ії]))|\.\s*[ИЙ]ер|\s*[ИЙ]ер)|(?:Ks(?:i[eę]g[ai]\s*Lamentacj|\.?\s*Lamentacj)|Lamentazion)i|Marath(?:i(?:\s*(?:(?:Eryaiya|Eryi?aa)h|Erm[ei]yah|Irm[ei]yah)|(?:(?:ey)?a|y(?:ya|e))h|(?:ya|e)h|['’]i)|['’]iya)|ଯିରିମିୟଙ୍କ\s*ବିଳାପ|Ma(?:rath(?:i(?:\s*(?:Er(?:y(?:aiya|(?:i?aa|a))|m(?:[ei]|['’])ya)|Irm(?:[ei]|['’])ya)|(?:ey)?a|y(?:ya|e)|ey|y(?:a|y)?|e)?|['’]iy)|o(?:mbolezo)?)|P(?:l(?:a[cč]\s*Jeremi[aá][sš][ouů]v|a[cč]\s*Jeremj[aá][sš][uů]v|á[cč]\s*Jerem[ij][aá][sš][uů]v|a[cč]\s*Jeremi[iï])|ulampal)|(?:Mga\s*(?:Pagbangota|Lamentasyo)|Klaagliedere|Pagbangota|Lamantasyo|Harmlj[oó]ði|Plen)n|Θρ[ήη]νοι\s*Ιερεμ[ίι]ου|(?:Kidung\s*Pasamba|V(?:a(?:litusvirr|jtim)|ilapage)e)t|yarmiy[aā]ko\s*vil[aā]p|سفر\s*مراثي\s*إرميا|यर्मियाको\s*विलाप|مرا(?:ث(?:ی(?:\s*(?:ا(?:ِرم(?:ی(?:ا(?:ء[هى]|ئ[هی]|[اهى])|\s*ی[اه]|ی[اه]|[هى])|ي(?:اا|ه))|رمی(?:(?:ائ?ه|[هى])|ی[اه]))|ی(?:ی[ئاه]|[اهى]))|ئ(?:\s*ی[اهی]|ه)|(?:ى\s*ی|ائ)[هی]|ی\s*ی[اه]|اء?ه|ی(?:ئه|[اه])|ه[اه]|ىه)|ئیه|ي[هى]|ى)|ثی(?:\s*ارمیاء|یئ\s*ی)ی|ته?ی)|บทเพลงคร่ำครวญ|Baroor(?:ashadii)?|مرا(?:ث(?:ی(?:\s*(?:ا(?:ِرم(?:یاء?|يا)|رمیا)|یی)|اء?|یئ|ئ|ه|ى)?|ئی|ئ|ي)?)?|K(?:niha\s*n[aá]reko|(?:\.\s*n[aá]re|\s*n[aá]re)ko)v|Плач\s*(?:Ие|Е)ремиев|Lam(?:enta(?:tions?|c[oõ]es|ç[oõ]es)|entacione|inta(?:cione|tion))?|Jeremi[aá]s\s*sir|เพลงคร่ำครวญ|Kl(?:a(?:g(?:e(?:lieder|s))?|agl))?|Lamentacje|[ZŽ]alospevy|P(?:l(?:ang(?:eri)?|âng(?:eri)?|a[cč]|á[cč])?|a(?:na)?g)|Galar(?:nad)?|Плач(?:\s*Иер)?|Siralmak|wil[aā]pg[iī]t|marzīyeh|Tu[zž]aljke|विलापग[ीे]त|புலம்பல்|Ratapan|المراثي|《?耶利米哀歌》|예레미(?:야\s*?애가|아애가)|エレミヤの哀歌|Θρ(?:[ήη]νοι)?|Siralm?|[ZŽ]alosp|《?耶利米哀歌|virlāp|《?連同哀歌》|ਵਿਰਲਾਪ|T(?:r(?:eny)?|u[zž])|Rat(?:ap)?|Va(?:lit|j)|புல(?:ம்)?|विलाप|《?連同哀歌|Ai\s*Ca|نَ?وحہ|קינות|āheng|Klgl|ErmZ|nūḥâ|איכה|N[aá]r|Hlj|Omb|พคค|《哀》|āh|《哀|哀[》歌]|애가|哀|애))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Num"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:Czwarta\s*K|4\.?\s*K)s(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|Kitabu\s*cha\s*Nne\s*cha\s*Mus|(?:Nelj[aä]s\s*Moo|4\.\s*Moo)seksen\s*kirj|IV(?:\.\s*(?:Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|Mooseksen\s*kirj|Moj[zż]eszow)|\s*Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|\s*Mooseksen\s*kirj|\s*Moj[zż]eszow)|(?:(?:(?:Czwarta\s*Moj[zż]|4\s*Mojż)|4\s*Mojz)e|4\.\s*Moj[zż]e)szow|4\s*Mooseksen\s*kirj|Qoodaaba|Cysl|Čysl)a|Ч(?:етв(?:(?:(?:ърт(?:(?:а\s*книга|о)|а)\s*Мои|рта\s*книга\s*Мој)се|рта\s*Мојсиј)ева|ерта\s*книга\s*Мо[ий]сеева)|исла)|(?:Ctvrt[aá]\s*(?:kniha\s*Moj[zž][ií]|Moj[zž][ií])|Čtvrt[aá]\s*(?:kniha\s*Moj[zž][ií]|Moj[zž][ií])|(?:IV\.?\s*k|4\.\s*k)niha\s*Moj[zž][ií]|4\s*kniha\s*Moj[zž][ií]|IV(?:\.\s*Mojz[ií]|\s*Mojz[ií])|(?:IV\.?\s*Mojž|4\.?\s*Mojž)[ií]|4(?:\.\s*Mojz[ií]|\s*Mojz[ií]))[sš]ova|Stvrt[aá]\s*(?:kniha\s*Moj[zž]i[sš]ova|Moj[zž]i[sš]ova)|Štvrt[aá]\s*(?:kniha\s*Moj[zž]i[sš]ova|Moj[zž]i[sš]ova)|(?:IV\.?\s*к|4\.?\s*к)нига\s*Мо[ий]сеева|Vier(?:te(?:[ns]\s*(?:Buch\s*)?Mose|\s*(?:Buch\s*)?Mose)|de\s*Mozes)|(?:Nelj[aä]s\s*Moo|4\.\s*Moo)seksen|(?:Fj[aä]rde\s*Moseboke|4\.?\s*Moseboke|Bilanga|adadiā)n|liv\s*Resansman\s*an|Fj[oó]rða\s*b[oó]k\s*M[oó]se|Fj(?:[aä]rde\s*Mosebok|erde\s*Mos)|(?:gant[iī]ko\s*pusta|4\.?\s*Mosebó|Sz[aá]mo)k|Fj(?:erde\s*Mosebo[gk]|[oó]rða\s*M[oó]seb[oó]k)|ग(?:न्तीको\s*पुस्तक|िनती|णना)|Knjiga\s*Brojeva|4\s*k\.\s*Moj[zž]i[sš]ova|IV(?:\.\s*M(?:o(?:(?:oseksen|j[zż])|s)|ós)|\s*M(?:o(?:(?:oseksen|j(?:z?|ż))|s)|ós))|(?:IV\.?\s*Мој|4\.?\s*Мој)сијева|4\s*k\s*Moj[zž]i[sš]ova|Czwarta\s*Moj[zż]|Ч(?:етврта\s*Мојс?|исл?)|(?:Liber\s*Numer|Brojev)i|(?:IV\.?\s*Мои|4\.?\s*Мои)сеева|Ks(?:i[eę]g[ai]\s*Liczb|\.?\s*Liczb)|4\.?\s*Buch\s*Mose|4\s*Mooseksen|M(?:ga\s*(?:Numeros|Bilang)|[oó]zes\s*IV)|(?:IV(?:\.\s*M[oó]se|\s*M[oó]se)|4\.?\s*Móse)b[oó]k|ଗଣନା\s*ପୁସ୍ତକ|Книга\s*Чисел|Mga\s*Numero|4\.?\s*Mosebok|4(?:\.\s*Mosebog|\s*M(?:osebog|z))|ก(?:ันดารวิถี|ดว)|Dân\s*(?:số\s*ký|Số)|E(?:ṇṇākamam|['’]e?daad|adad)|எண்ண(?:ாகமம்|ிக்கை)|(?:IV(?:\.\s*M[oó]z|\s*M[oó]z)|4\.\s*Moz|4\.\s*Móz|Nombr)es|(?:Resansm|Wilang)an|سفر\s*العدد|(?:IV\.?\s*Мој|4\.?\s*Мој)с?|B[ae]midbar|Tirintii|4(?:\.\s*Mo(?:se?)?|\s*(?:(?:M(?:o(?:(?:os)?|z)|óz)|М)|Mose?))|4\.\s*Moj[zż]|gant[iī]ko|गन्ती(?:को)?|N(?:um(?:ber[is]|erii|rat)|[bm])|Αριθμο[ίι]|Број?еви|A['’]edaad|Numeros|Ginatee|(?:Número|4(?:\s*M[oó]ze|Mó))s|N(?:u(?:m(?:b(?:er)?|eri)?)?|o(?:mb?)?|úm?)|Bil(?:ang)?|4\s*Mojz|4\s*Mojż|4\.\s*Mós|Numero|A(?:edad[ad]|['’]dad)|A(?:e|['’])daad|Hesabu|g(?:a(?:nan[aā]|ṇan[aā])|i[nṇ]tī)|اعدا(?:د[دهی]|[تذز])|(?:اع(?:د(?:ا[او]|دا)|تا|ا)|عدا)د|adadi?|4\s*Moj|4\s*Mós|اعد(?:اد?|د)?|adadī|Liczb|گِ?نتی|(?:《民(?:数记|數記)|民(?:数记|數記))》|《?戶籍紀》|במדבר|מניין|ספירה|ਗਿਣਤੀ|العدد|Sz[aá]m|Αρ(?:ιθ)?|《民(?:数记|數記)|《?戶籍紀|ଗଣନା|Adad|Nonb|Res|Tir|Dân|எண்|民(?:数记|數記)|Qod|民(?:数記|》)|민수기|《民》|Blg|民数?|민수?|Бр|عد|《民|Lb|Ἀρ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sus"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Su(?:s(?:anne\s*(?:et\s*les\s*(?:deux\s*)?vieillards|au\s*bain)|(?:an(?:na(?:\s*(?:ja\s*vanhimma|i\s*bade)t|[eh])|a)|》))|zan(?:ne\s*(?:et\s*les\s*(?:deux\s*)?vieillards|au\s*bain)|a))|С(?:казанию\s*о\s*Сусанне\s*и\s*Данииле|усан(?:на\s*и\s*старцы|а))|Fortellingen\s*om\s*Susanna|Opowiadaniem\s*o\s*Zuzannie|Z(?:suzsanna\s*[eé]s\s*a\s*v[eé]nek|uzan[ae])|(?:Hist[oó]ria\s*de\s*Susa|S(?:i\s*Sus|hosh)a)na|Storia\s*di\s*Susanna|Historia\s*Susannae|Istoria\s*Susanei|كتاب\s*سوزانا|Z(?:suz(?:s(?:anna)?)?|uz)|Σ(?:ουσ[άα]ννα|ωσ[άα]ννα)|Su(?:s(?:anna)?|sanne|z(?:anne)?)?|Сус(?:анна)?|Susanei|சூசன்னா|Zuzanna|S[wú]sanna|ス[サザ]ンナ物語|سوزانا|《Sus》|שושנה|《Sus|Σουσ|ス[サザ]ンナ|수산나))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sir"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Cartea\s*[iî]n[tţ]elepciunii\s*lui\s*Isus,\s*fiul\s*lui\s*Sirah|Книга\s*Премъдрост\s*на\s*Иисуса,\s*син\s*Сирахов|Ang\s*Karunungan\s*ni\s*Jesus,?\s*Anak\s*ni\s*Sirac|(?:The\s*Wisdom\s*of\s*Jesus(?:,\s*Son\s*of|\s*(?:Son\s*of|ben))\s*Sirac|Wisdom\s*of\s*Jesus(?:,\s*Son\s*of|\s*(?:Son\s*of|ben))\s*Sirac|(?:Wijsheid\s*van\s*(?:Jozua\s*)?Ben|(?:Wijsheid\s*van\s*)?Jezus|Oratio\s*Iesu\s*filii)\s*Sirac|Kitab\s*Yesus\s*bin\s*Sirak|Jesus\s*Sirac)h|Прем(?:удр(?:(?:ост(?:и\s*Иисуса,\s*сына\s*Сирахов|ь\s*Сирах)|ости\s*Исуса\s*сина\s*Сирахов)|ість\s*Ісуса,\s*сина\s*Сирахов)а|ъдрост\s*на\s*Иисус,\s*син\s*Сирахов)|Karunungan\s*ng\s*Anak\s*ni\s*Sirac|Jesu(?:\s*Siraks\s*sønns\s*visdom|s\s*Syraks\s*vishet)|L(?:a\s*Sagesse\s*de\s*Ben\s*Sira|iber\s*Ecclesiasticus)|(?:Jee?sus\s*Siirakin\s*kirj|K(?:n(?:iha\s*S(?:irachov(?:ho\s*syn|cov)|írachovcov)|jiga\s*Sirahov)|\.?\s*Sirachovho\s*syn|\.?\s*Sirachovcov)|M[aą]dro[sś][cć]\s*Syrach|Sii?rakin\s*kirj|Sirachovcov|Sir[aá]k\s*fi|Huấn\s*C|Syrach)a|S(?:apienza\s*di\s*Siracid|ir(?:(?:ak\s*b[oö]lcsess[eé]g|ák\s*b[oö]lcsess[eé]g)|àcid))e|K(?:niha|\.?)\s*Ekleziastikus|Sagesse\s*de\s*Ben\s*Sira|S(?:apienza\s*di\s*Sirach|ir(?:a(?:k(?:(?:s\s*Bog|h)|id[ae]s)|cid[ae]s)|á(?:c(?:id[ae]s|h)|k(?:id[ae]s|h)))|yrak)|K(?:niha|\.?)\s*Sirachovca|சீ(?:ராக்(?:கின்\s*ஞான|\s*ஆகம)ம்|ஞா)|Yoshua\s*bin\s*Sira|E(?:c(?:c(?:l(?:esiasti(?:c(?:u[ls]|o)|que)|ésiastique)|s)|lesi[aá]stico)|k(?:kle(?:s[iy]astiko|ziastik)|l(?:(?:ezjastyka|i)|es[iy]astiko)))|Екле(?:зијастикус|сіаст)|Ek(?:kles[iy]astiku|les[iy]astiku)s|Ecclusiasticus|Книга\s*на\s*Сирах|シラフの子イイススの知恵書|سفر\s*ابن\s*سيراخ|يشوع\s*بن\s*سيراخ|Σ(?:οφ[ίι]α\s*Σ(?:ειρ[άα]χ|ιραχ)|ειρ[άα]χ)|משלי\s*בן[\s*-]סירא|(?:Книга\s*Сирах|Бен\s*Сирах|Сирин)а|E(?:klezjastyk|cclus)|ספר\s*בן\s*סירא|(?:Ecleziasti|S[ií]rachove)c|S(?:iraks(?:\s*bo|b[oó])|íraksb[oó])k|シラ書（集会の書）|S(?:i(?:r(?:akid[ae]|acid[ae]|á(?:c(?:id[ae])?|k(?:id[ae])?)|a(?:ch?|k)?)?|irakin|rakin)?|yr|ír)|Сирах(?:ов)?а|벤시(?:(?:라크?의\s*|라크?\s*)|리크의\s*)지혜|Ben\s*Sira|บุตรสิรา|[ヘベ]ン・シラの(?:智慧|知恵)|Сир(?:ах(?:ов)?)?|《德訓篇》|سيراخ|《德訓篇|德訓篇》|集会の書|シラ書?|德訓篇|YbS|ИсС|집회서|سي|집회))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrMan"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(Man\s*ru|(?:Orazione\s*di\s*Manasse\s*Re\s*di\s*Giuda|Rug[aă]ciunea\s*(?:rege)?lui\s*Manase|Ang\s*Panalangin\s*ni\s*Manases|The\s*Pr(?:ayer(?:s\s*(?:of\s*)?Manasseh|\s*(?:of\s*)?Manasseh)|\s*(?:of\s*)?Manasseh)|(?:Oratio\s*(?:regis\s*)?Manassa|(?:Doa\s*)?Manasy)e|(?:(?:(?:Das\s*Gebet\s*des|Modlitbu|Bæn)|Preghiera\s*di)\s*Manas|G(?:ebet\s*des|weddi)\s*Manas)se|(?:La\s*Oraci[oó]n\s*de\s*Manas[eé]|Oraci[oó]n\s*de\s*Manas[eé]|Prece\s*de\s*Manass[eé])s|Panalangin\s*ni\s*Manases|М(?:олитва(?:та\s*на\s*Манасия|\s*Манас(?:ијина|сии))|анасия|\.?\s*Ман)|La\s*Pri[eè]re\s*de\s*Manass[eé]|Orazione\s*di\s*Manasse|M(?:anas(?:esova\s*modlitb|s(?:e\s*im[aá]ds[aá]g|é\s*im[aá]ds[aá]g|ze\s*im[aá]j))|odlitwa\s*Manasses)a|Prayer(?:s\s*(?:of\s*)?Manasseh|\s*(?:of\s*)?Manasseh)|Dalangin\s*ni\s*Manases|(?:Manasse(?:n\s*rukoukse|s(?:\s*(?:b(?:øn|[oö])|Bø)|’\s*b[oö])|\s*b[oö])|BM)n|Das\s*Gebet\s*Manasses|Pri[eè]re\s*de\s*Manass[eé]|Πρ(?:οσευχ[ήη]\s*Μανασσ[ήη]|\s*Μαν)|Dasal\s*ni\s*Manases|Geb(?:et\s*Manasses|\s*Man)|Pr\s*of\s*Manasseh|Gebet\s*Manasse|Pr\s*Manass(?:eh|é)|Pr\.\s*Manass[eé]|Pr(?:\s*Man(?:asse)?|\.\s*Man)|תפילת\s*מנשה|صلاة\s*منسى|Man(?:ass?e)?|Doa\s*Man|Or\.?\s*Man|《PrMan》|マナセの(?:いのり|祈[り禱])|므나쎄의\s*기도|《PrMan|DoaMan|PrMan》|PrMan))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Acts"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:M(?:ga\s*Gawa\s*ng\s*mga\s*Alagad|atendo\s*ya\s*Mitume)|Dz\s*Ap)|(?:Mabuting\s*Balita\s*ayon\s*sa\s*Espiritu\s*Santo|Mabuting\s*Balita\s*ng\s*Espiritu\s*Santo|Yesuusi\s*Kiittidoogeetu\s*Oosuwaa|(?:Handelingen\s*(?:van\s*de|der)\s*apostele|A(?:ctau['’]r\s*Apostolio|maal(?:\s*(?:e\s*)?|-?e-?)Rusula|['’]mal(?:\s*e\s*|-?e-?)Rusula|mal\s*e\s*Rusula|mal-?e-?Rusula)|A(?:ma(?:(?:al(?:\s*(?:e\s*)?|-?e-?)Rusule|l\s*e\s*Rusule)|l-?e-?Rusule)|['’]mal(?:\s*e\s*|-?e-?)Rusule)e|Mga\s*Gawai)n|ପ୍ରେରିତମାନଙ୍କ\s*କାର୍ଯ୍ୟର\s*ବିବରଣ|Ebanghelyo\s*ng\s*Espiritu\s*Santo|Los\s*Hechos\s*de\s*los\s*Ap[oó]stoles|Dijannja\s*svjaty[hȟ]\s*apostoliv|Д(?:е(?:яния(?:\s*на\s*(?:светите\s*Апостоли|апостолите)|та\s*на\s*апостолите)|ла\s*(?:(?:на\s*светите\s*апостоли|Апостолска)|на\s*апостолите))|і(?:яння\s*Святих\s*А|[ії]\s*(?:святих\s*а|А))постолів|\.?\s*А|ап)|A(?:z\s*apostolok\s*cselekedetei|postolok\s*cselekedetei|(?:tti\s*degli\s*Apostol|ppōstalar\s*Paṇ)i|ctsss|ma(?:ale|l[ei])|['’]male|p(?:\.(?:\s*t|[Gt])|\s*t|[Ggt]))|(?:Mga\s*Gawa\s*ng\s*mga\s*Apostole|Atos\s*dos\s*Ap[oó]stolo)s|(?:The\s*)?Acts\s*of\s*the\s*Apostles|Mga\s*Gawa(?:\s*ng\s*mga\s*Apostol)?|அப்போஸ்தலருடைய\s*நடபடிகள்|Hechos\s*de\s*los\s*Ap[oó]stoles|(?:Buhat\s*sa\s*mga|Gawa\s*ng)\s*Apostoles|Dziejach\s*Apostolskich|Apostlenes\s*(?:gj|G)erninger|Πρ(?:άξεις\s*των\s*Αποστ[οό]λων|αξεις\s*(?:των\s*Αποστ[οό]λων|Αποστολων)|ξ)|(?:Apost(?:lenes-?gjerning|elg(?:jerningen|eschicht))|Dzieje\s*Apostolski)e|प्र(?:े(?:षितांचीं?\s*कृत्यें|रित(?:ों\s*के\s*कामों|हरूका\s*काम))|\.\s*?क|\s*?क)|प्रे(?:षितांचीं\s*कृत्ये|रि(?:त(?:ों\s*के\s*काम)?)?)|Fapte(?:le)?\s*Apostolilor|pre(?:[sš]it[aā][mṃ]c[iī][mṃ]\s*kr̥tye[mṃ]|rithar[uū]k[aā]\s*k[aā]m)|(?:Gawa\s*ng\s*mga\s*Aposto|(?:Lelakone|Kis(?:ah)?)\s*Para\s*Rasu|Kisah\s*Rasul-?rasu|A['’]maal(?:\s*e\s*|-?e-?)Rusu|Para\s*Rasu|A(?:z\s*ApC|p(?:\.\s*|\s*?)C)se)l|(?:Falimaha\s*Rasuullad|Apostlag[aä]rningarn|Djela\s*apostolsk)a|Veprat\s*e\s*[Aa]postujve|ก(?:ิจการ(?:​ของ​|ของ)อัครทูต|จ)|தி(?:ருத்தூதர்\s*பணிகள்|ப)|rasūl(?:āṃ\s*de\s*kartabb|ōṅ\s*ke\s*aʿmāl)|Skutky\s*apo[sš]tol(?:sk[eé]|ov|[uüů])|C(?:ông\s*(?:vụ\s*(?:các\s*Sứ|Tông)\s*đồ|Vụ)|selekedetek)|Actes\s*des\s*Ap[oô]tres|(?:Ang\s*Mga\s*)?Binuhatan|(?:Actus\s*Apostoloru|Praeriton\s*Ke\s*Ka)m|(?:(?:رسُولوں\s*کے\s*ا|(?:رسولوں\s*کے\s*ا|اَ))|یوحنا\s*کے\s*ا)عمال|A(?:postolien\s*te|kd[eè]zap)ot|அப்போஸ்தலர்\s*பணி|سفر\s*أعمال\s*الرسل|ਰਸੂਲਾਂ\s*ਦੇ\s*ਕਰਤੱਬ|اعم(?:ال(?:\s*(?:الرسولین|رسول[ای]ن)|ی\s*رسولان)|ل(?:\s*رسولان|ی))|(?:Aksyon\s*ap[oò]t\s*y|Travay\s*ap[oò]t\s*y|M(?:aten)?d)o|A(?:['’]ma(?:l(?:\s*e\s*Rusul|-?e-?Rusul)?|al)|mal\s*e\s*Rusul|mal-?e-?Rusul|postolok|c(?:t(?:au?|ss?|es|us)?)?|maa?l|t(?:os|ti))|D(?:z(?:ieje(?:\s*Apost)?)?|j)|اع(?:م(?:ال(?:\s*الرسول|ی)?|ل)?)?|Postulasagan|מעשי\s*השליחים|H(?:and(?:elingen)?|ech?|c)|அப்(?:போ(?:ஸ்தலர்)?)?|أعمال\s*الرسل|ﺍﻋﻤﺎﻝ\s*ﺍﻟﺮﺳﻞ|Los\s*Hechos|G(?:erninger|w)|Mga\s*Buhat|मसीह-?दूत|Fa(?:p(?:t(?:e(?:le)?)?)?|l)|Д(?:е(?:ла(?:\s*Ап)?|ян(?:ия)?)|і(?:ян(?:ня)?|[ії]))|Πρ(?:άξ(?:εις)?|αξ(?:εις)?)|ପ୍ରେରିତ|اعما?لها|使徒(?:の活動記録|の働き|言行録|行[伝録]|書)|《?宗徒(?:大事錄|行實)》|Sk(?:utky)?|Vep(?:rat)?|Travay|กิจการ|Hechos|رسولوں|《?宗徒(?:大事錄|行實)|a['’]mālī|عم(?:ال(?:ها|ی)|ل(?:ها|ی))|(?:《(?:使徒行[传傳]|徒)|使徒行[传傳]|徒)》|Kis(?:ah)?|a['’]m(?:āl)?|《(?:使徒行[传傳]|徒)|F(?:\.?\s*Ap|\.?A)|Sứ\s*đồ|Gawa|Công|عما?ل|使徒行[传傳]|KisR|Teot|사도행전|B(?:in|uh)|H(?:ch|nd)|Osu|使徒|사도|徒|행))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rev"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Apo(?:(?:cal(?:ipsa\s*lui\s*Io|ypse\s*de\s*Je)|calipsis\s*ni\s*Ju)|kalipsis\s*ni\s*Ju)an|(?:О(?:(?:(?:ткровение\s*на\s*св\.?\s*Ио|б['’]явлення\s*св(?:\.\s*[ИЙ]|\s*[ИЙ])о)|б['’]явлення\s*(?:св\.?\s*І|І)в)|дкровення\s*Ів)ана\s*Богослова|யோவானுக்கு\s*வெளிப்படுத்தின\s*விசேஷம்|(?:yoh[aā]n[aā]l[aā]\s*ǳʰ[aā]lele\s*p|p)raka[tṭ][iī]kara[nṇ]|(?:Apocal(?:ypsis\s*Ioannis\s*Apostol|isse\s*di\s*Giovann)|J[aá]nos\s*jelen[eé]se|M(?:akasheph|uujinti))i|(?:Ob['’]javlennja\s*Ivana\s*Bohoslov|Apokalipsa\s*[SŚ]wi[eę]tego\s*Jan|Z(?:j(?:avenie\s*(?:Apo[sš]tola\s*J[aá]|sv[aä]t[eé]ho\s*J[aá]|J[aá])n|eveni\s*svat[eé]ho\s*Jan)|bules)|(?:Apokalipsa\s*[sś]w\.|Objawienie\s*[sś]w\.)\s*Jan|(?:Apokalipsa\s*[sś]w\s*|Objawienie\s*[sś]w\s*)Jan|Ks(?:i[eę]g[ai]\s*Objawieni|\.?\s*Objawieni)|(?:Ufunua\s*wa\s*Yoh|Objawienie\s*J)an|Prakashaitavaky|Ilmestyskirj|Ajjuuta)a|ଯୋହନଙ୍କ\s*ପ୍ରତି\s*ପ୍ରକାଶିତ\s*ବାକ୍ୟ|O(?:p(?:inberun(?:arb[oó]k\s*|\s*)J[oó]hannesar|b)|ffb)|y(?:ū(?:(?:(?:hãnā\s*de\s*prakāš\s*dī\s*potʰī|ḥannā\s*ʿārif\s*kā\s*mukāšafâ)|hannāl[aā][iī]\s*bʰaeko\s*prak[aā][sš])|hannal[aā][iī]\s*bʰaeko\s*prak[aā][sš])|uhann[aā]l[aā][iī]\s*bʰaeko\s*prak[aā][sš])|Veḷippaṭuttiṉa\s*Vicēṭaṅkaḷ|ی(?:ُو(?:\s*حنّا\s*عارِف\s*کا\s*مُ|حنا\s*عارف\s*کا\s*م)کاشفہ|و\s*حنا\s*عارف\s*کا\s*مکاشفہ)|य(?:ोहानाला\s*झालेले\s*प्रकटीकरण|ूहन्नालाई\s*भएको\s*प्रकाश)|வெளிப்படுத்தின\s*விசேடங்கள்|ਯੂਹੰਨਾ\s*ਦੇ\s*ਪਰਕਾਸ਼\s*ਦੀ\s*ਪੋਥੀ|(?:Openbaring\s*van\s*Johanne|Johanne(?:ksen\s*ilmesty|s\s*apokalyp)|Apo[ck]alipsi)s|(?:Apocalipse\s*de\s*(?:S[aã]o\s*Jo[aã]|Jo[aã])|Otkrivenje\s*Ivanov|Zjeven[ií]\s*Janov)o|(?:Johannes\s*Uppenbarels|Rivelazion)e|(?:Joh(?:annes['’]\s*(?:[AÅ]b|[aå]p)enbarin|s(?:\.\s*[AÅ]|\s*[AÅ])benbarin)|Offenbarun)g|О(?:ткр(?:ове(?:ние(?:то\s*на\s*[ИЙ]оан|\s*на\s*[ИЙ]оан)|ње\s*Јованово)|ивење\s*Јованово)|дкриттє)|Ap(?:o(?:c(?:al(?:yps(?:is(?:\s*Ioannis)?)?|i[ps]se))?|k(?:alipsa?)?)?)?|(?:(?:Johannesapokalyps|Abenbaringsbog|Aabenbaring)e|Uppenbarelseboke|Op(?:inberunarb[oó]ki|enbaringe)|Pa(?:hayag\s*kay\s*Ju|medar)a|Apenbaring(?:sbok)?e|Å(?:benbaring(?:sbog)?e|penbaring(?:sbok)?e)|Abenbaringe|Apokalypse|Re[bv]elasyo)n|K(?:hải\s*(?:Huyền\s*của\s*John|thị)|s(?:i[eę]g[ai]\s*Apokalipsy|\.?\s*Apokalipsy)|niha\s*Zjeven[ií]|itab\s*Wahyu)|Αποκ(?:άλυψ(?:ις\s*Ιω[άα]ννου|η)|αλ(?:υψ(?:(?:ις\s*Ιω[άα]ννου|η)|εις)|ύψεις))|yūh(?:ãnā\s*de\s*prakāš|annā)|Ufunuo\s*wa\s*Yohan[ae]|प्र(?:काश(?:ित(?:-?वाक्‍|\s*?वाक्)य|न)|\.?\s*व)|Відкриття\s*Івана|Veḷippaṭuttiṉa|தி(?:ருவெளிப்பாடு|வெ)|El\s*Apocalipsis|ਪਰਕਾਸ਼\s*ਦੀ\s*ਪੋਥੀ|Apokalipszis|Апок(?:(?:а́|[aá])лі|ал[iíиі])псис|R(?:ev(?:e?|[ao])lations|v)|m(?:ak(?:(?:(?:(?:(?:ashefi(?:ah|[ei])|(?:(?:(?:(?:a(?:(?:aa|h)s|sh)h|hsa)fe|ash(?:fe[ai]|af[io]|e(?:ef|f[eo]))|shaafe)|ashaafi)|ashefah))|ashfeha)|aash(?:f(?:e(?:hi|vo|a)|a)|efa))|ashafeh)|shaf(?:ah|e))|uk(?:a(?:(?:sh(?:(?:ef(?:i(?:ah|[ei])|ah|e)|a(?:afi|fo)|fea)|feha)|ash(?:f(?:e(?:hi|vo|a)|a)|efa))|shafeh)|shaf(?:ah|e)))|O(?:p(?:enb(?:aring)?)?|bj(?:awienie)?|tk(?:rivenje)?)|R(?:ev(?:elation|[ao]lation|lation|el)?|iv)|Apenbaring|Å(?:p(?:enbaring)?|b)|О(?:б(?:['’]явлення)?|тк(?:р(?:овение|ивење)?)?)|Khải(?:\s*Huyền)?|m(?:aka(?:sh(?:efia?|(?:efa|fe))|ashfeh)|uka(?:sh(?:ef(?:ia?|a)|fe)|ashfeh))|A(?:p(?:o(?:cal(?:ypse|ipsa)|kalypsa)|[ck])|ju)|Datguddiad|Maka(?:ashfa[ah]|ashf[ei]y|shef(?:a[ah]|e[hiy]|iy|y))|رؤيا\s*يوحنا|חזון\s*יוחנן|ﻳﻮﺣﻨﺎ\s*ﺭﺅﻳﺎ|M(?:aka(?:ashf(?:a?|[ei])|shef(?:a|e|i)?)|uuj)|Jelen[eé]sek|Gipadayag|M(?:ikashe|ekaash)fe|प्रकटीकरण|Z(?:j(?:av(?:enie)?|even[ií])?|bu?)|Ilm(?:estys)?|الرؤيــا|Dat(?:gudd)?|Pah(?:ayag)?|vāhyūnn|م(?:ک(?:اشف(?:ات|ةٔ|ه[اهؤی]|یه|[ىہ])|شفه)|ک(?:اشفي|شفا)ه|كاشفه)|הה?תגלות|《?若望默示錄》|ヨハネの[默黙]示録|مُکاشفہ|U(?:f(?:u(?:nuo)?)?|pp)|vāh(?:y(?:ūn?)?)?|مک(?:ا(?:ش(?:ف(?:ا|ة|ه|ی)?)?)?|ش)|प्रकाश?|《?若望默示錄|ว(?:ิวรณ์|ว)|요한(?:\s*[계묵]시록|[계묵]시록)|Wahyu|《?启示录》|《?啟示錄》|(?:《[啓默]|[啓默])示錄》|Wahy?|Gipa|Απ(?:οκ)?|வெளி|《?启示录|《?啟示錄|(?:《[啓默]|[啓默])示錄|Jel|Zjv|Why|《[启啟]》|᾿Απ|黙示録|رؤ|《[启啟]|启》|啟》|묵시|启|啟|계))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrAzar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:(?:Ang\s*)?Panalangin\s*ni\s*Azari|Das\s*Gebet\s*Asarj|Salmo\s*de\s*Azari|Gweddi\s*Asari|Gebet\s*Asarj|Azarí)as|The\s*Pr(?:ayers?\s*of\s*Azariah|\s*of\s*Azariah)|תפילת\s*עזריה\s*בתוך\s*הכבשן|The\s*Pr(?:ayers?\s*of\s*Azaria|\s*of\s*Azaria)|Rug[aă]ciunea\s*lui\s*Azaria|(?:(?:Das\s*)?Gebet\s*des\s*Asarj|Az(?:ar(?:(?:(?:j(?:a[sš]ova\s*modlitb|á[sš]ova\s*modlitb)|y)|ias\s*im[aá](?:ds[aá]g|j))|iás\s*im[aá](?:ds[aá]g|j))|ári[aá]s\s*im[aá](?:ds[aá]g|j))|Modlitw[aą]\s*Azariasz|Gebed\s*van\s*Azarj|Pie[sś][nń]\s*Azariasz|Doa\s*Azary|Bæn\s*Asarj)a|М(?:олитва(?:та\s*на\s*Азария|\s*Азар(?:і[ії]|ия))|\.?\s*Аза)|La\s*Pri[eè]re\s*d['’]Azaria[hs]|Preghiera\s*di\s*Azaria|Prayers?\s*of\s*Azariah|Oraci[oó]n\s*de\s*Azar[ií]as|C[aá]ntico\s*de\s*Azar[ií]as|Prayers?\s*of\s*Azaria|Πρ(?:οσευχ[ήη]\s*Αζαρ[ίι]ου|\s*Αζαρ)|Pri[eè]re\s*d['’]Azaria[hs]|Oratio\s*Azariae|(?:Asarjan\s*rukou|Geb\s*A)s|Pr\s*of\s*Azariah|Pr\s*of\s*Azaria|A(?:sar(?:ias’\s*b[oö]n|jas(?:\s*b(?:øn|[oö])n|’\s*b[oö]n)|ias\s*b[oö]n|\s*ru)|zarjas\s*[Bb]øn|zariah)|תפילת\s*עזריה|صلاة\s*عزريا|Doa\s*Az(?:ar)?|[OP]r\.\s*Azar|Sal\s*Azar|《PrAzar》|Azarias?|《PrAzar|Or\s*Azar|Pr\s*Azar|PrAzar》|ア[サザ]ルヤの祈り|PrAzar|அசரியா|Or\s*Az|DoaAz|PrAzr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["SgThree"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(Gesang\s*der\s*drei\s*M(?:(?:ae|ä)|a)nner\s*im\s*Feuerofen|Gesang\s*der\s*drei\s*(?:im\s*Feuerofen|M(?:(?:ae|ä)|a)nner)|(?:Kolmen\s*(?:nuoren\s*miehen\s*ollessa\s*tulisessa\s*p[aä]tsiss[aä]|miehen\s*kiitosvirsi\s*tulessa)|(?:Cantico\s*dei\s*tre\s*giovani\s*nella\s*fornac|S(?:on|n?)g\s*Thre)e|El\s*(?:Canto\s*de\s*los\s*(?:Tres\s*J[oó]venes\s*(?:Hebre|Jud[ií])os|3\s*J[oó]venes\s*(?:Hebre|Jud[ií])os)|Himno\s*de\s*los\s*(?:Tres\s*J[oó]venes\s*(?:Hebre|Jud[ií])os|3\s*J[oó]venes\s*(?:Hebre|Jud[ií])os))|T(?:he\s*Song\s*of\s*(?:the\s*(?:Three\s*(?:Holy\s*Childr|Young\s*M)en|3\s*(?:Holy\s*Childr|Young\s*M)en)|Three\s*(?:Holy\s*Childr|Young\s*M)en|3\s*(?:Holy\s*Childr|Young\s*M)en)|atlong\s*Kabataan)|Gezang\s*der\s*drie\s*mannen\s*in\s*het\s*vuur|Awit\s*ng\s*(?:Tatlong\s*Banal\s*na|3)\s*Kabataan|(?:Canto\s*de\s*los\s*(?:Tres|3)\s*J[oó]venes\s*|Himno\s*de\s*los\s*3\s*J[oó]venes\s*)(?:Hebre|Jud[ií])os|(?:Awit\s*sa\s*Tulo\s*ka\s*Batan-?ong\s*Lalak|(?:C[aâ]ntarea\s*celor\s*trei\s*t|3\s*t)iner|Cantico\s*dei\s*tre\s*fanciull|C[aâ]ntarea\s*celor\s*trei\s*evre|Gesang\s*der\s*[Dd]re|Trei\s*tiner)i|(?:Traja\s*ml[aá]denci\s*v\s*rozp[aá]lenej|T(?:ri\s*mu[zž]i\s*v\s*rozp[aá]len[eé]|ři\s*mu[zž]i\s*v\s*rozp[aá]len[eé]))\s*peci|Himno\s*de\s*los\s*Tres\s*J[oó]venes\s*Jud[ií]os|Aw(?:it\s*(?:ng\s*Tatlong\s*Kabataang\s*Banal|sa\s*3)|\s*ng\s*3\s*Kab)|Song\s*of\s*(?:the\s*(?:Three\s*(?:Holy\s*Childr|Young\s*M)en|3\s*(?:Holy\s*Childr|Young\s*M)en)|Three\s*(?:Holy\s*Childr|Young\s*M)en|3\s*(?:Holy\s*Childr|Young\s*M)en)|P(?:iese[nň]\s*ml[aá]dencov\s*v\s*ohnivej\s*peci|ise[nň]\s*ml[aá]denc[uů]\s*v\s*ho[rř][ií]c[ií]\s*peci|íse[nň]\s*ml[aá]denc[uů]\s*v\s*ho[rř][ií]c[ií]\s*peci|ie(?:s(?:ni[aą]|ń)\s*trzech\s*młodzie[nń]c[oó]w|ś(?:(?:ni[aą]|ń)\s*trzech\s*młodzie[nń]c[oó]w|n\s*trzech\s*młodzie[nń]c[oó]w)|sn\s*trzech\s*młodzie[nń]c[oó]w))|Благодарственная\s*песнь\s*отроков|(?:Lofs[oö]ngur\s*ungmennanna\s*þriggj|Lagu\s*Pujian\s*Ketiga\s*Pemud|Awit\s*ng\s*Tatlong\s*Binat|Lagu\s*3\s*Pemud|Lagu\s*Pemud|Tiga\s*Pemud|3\s*Pemud)a|Lied\s*van\s*de\s*drie\s*jongemannen|(?:T(?:he\s*Song\s*of\s*(?:the\s*(?:Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|res\s*J[oó]vene)|C(?:anti(?:que\s*des\s*(?:Trois|3)\s*Enfant|co\s*dos\s*(?:Tr[eê]s\s*Joven|3\s*Joven))|ântico\s*dos\s*(?:Tr[eê]s\s*Joven|3\s*Joven))|Song\s*of\s*(?:the\s*(?:Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|3\s*J[oó]vene)s|(?:Молитва\s*святых\s*тре|Песнь\s*тр[её])х\s*отроков|П(?:есента\s*на\s*тримата\s*младежи|\.?\s*Мл)|De\s*(?:tre\s*mennenes\s*sang\s*føyer|tre\s*m[aä]nnens\s*lovs[aå]ng|tre\s*mænds\s*lovsang|Tre\s*Mænds\s*Lovsang|tre\s*menns\s*sang)|Kolmen\s*(?:miehen(?:\s*kiitosvirsi)?|nuoren\s*miehen)|Canto\s*de\s*los\s*(?:Tres|3)\s*J[oó]venes|Himno\s*de\s*los\s*(?:Tres\s*J[oó]venes|3\s*J[oó]venes)|Awit\s*ng\s*Tatlong\s*Kabataan|H(?:[aá]rom\s*fiatalember\s*[eé]neke|ymnus\s*trium\s*puerorum)|שירת\s*שלושת\s*הנערים\s*בכבשן|Wimbo\s*wa\s*Vijana\s*Watatu|[ΎΥ]μνος\s*των\s*Τρι[ωώ]ν\s*Πα[ίι]δων|أنشودة\s*الأطفال\s*الثلاثة|இளைஞர்\s*மூவரின்\s*பாடல்|Пісня\s*трьох\s*отроків|C(?:(?:an\s*y\s*Tri\s*Ll?anc|ân\s*y\s*Tri\s*Ll?anc|t\s*3\s*(?:J[oó]|E))|3J)|S(?:\.\s*(?:of\s*(?:Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|\s*(?:of\s*(?:Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))))|《SgThree》|《SgThree|SgThree》|三(?:人の若者の賛|童兒の)歌|SgThree|Sg\s*Thr|L(?:agPuj|3J)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:2-?(?:ге|а)\.\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|послання\s*апостола\s*Петра|послання\s*Петра|Петр(?:ово|а))|Друг(?:а\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|(?:послання\s*апостола\s*Петра|(?:(?:посланица\s*Петрова|Петр(?:ов[ао]|а))|послання\s*Петра)))|е\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|послання\s*апостола\s*Петра|послання\s*Петра|Петр(?:ово|а)))|(?:2(?:-?е\.?\s*с|\.?\s*с)|II\.?\s*с)оборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|2-?(?:ге|а)\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|послання\s*апостола\s*Петра|послання\s*Петра|Петр(?:ово|а))|(?:Второ\s*съборно\s*послание\s*на\s*св\.?\s*ап\.|2(?:-?е\.?\s*послание|(?:-?я|[ея])\.?\s*послание))\s*Петра|Второ\s*съборно\s*послание\s*на\s*св\.?\s*ап\s*Петра|Pēturu\s*Eḻutiya\s*Iraṇṭāvatu\s*Nirupam|பேதுரு\s*(?:எழுதிய\s*இரண்டா(?:ம்\s*(?:திருமுக|கடித)|வது\s*நிருப)ம்|இரண்டாம்\s*திருமுகம்)|Втор(?:(?:(?:а\s*послание\s*на\s*апостол\s*Пета|а\s*Пет[аъ])|а\s*писмо\s*од\s*апостол\s*Пета)р|о\s*(?:п(?:ослание\s*на\s*(?:апостол\s*Пета|Петъ)|исмо\s*од\s*апостол\s*Пета)р|Пет[аъ]р))|(?:(?:Dru(?:he\s*poslannja\s*apostola\s*Pe|g(?:a\s*List\s*(?:[sś]w\.?\s*Pio|Pio)|i\s*List\s*(?:[sś]w\.?\s*Pio|Pio)))|(?:II\.?\s*L|2\.?\s*L)ist\s*(?:[sś]w\.?\s*Pio|Pio))tr|Druga\s*Petrova\s*[Pp]oslanic|(?:II\.?\s*Petrova\s*P|2\.?\s*Petrova\s*P)oslanic|p(?:atrusko\s*dostro|etr[aā]ce[mṃ]\s*dusre)\s*patr)a|(?:II\.?\s*послание\s*н|2\.?\s*послание\s*н)а\s*апостол\s*Петар|(?:2(?:-?е\.?\s*посланн|\.?\s*посланн)|II\.?\s*посланн)я\s*апостола\s*Петра|א(?:גרתו\s*השנייה\s*של\s*פטרוס\s*השליח|יגרת\s*פטרוס\s*השנייה)|(?:S[ií]ðara\s*almenna\s*br[eé]f\s*P[eé]tur|Do(?:vom(?:\s*[Pp]at(?:ari|ru)|Pat(?:ari|ru)|pat(?:ari|ru))|\s*?pat(?:ari|ru))|Tweede\s*Petru|2(?:\.\s*Patara|\s*(?:Patar[ai]|patra))|II\.?\s*Butro|(?:2(?:e\.?\s*Pe|p)|۲p)tru|2\.?\s*Butro|2\s*Patru|2Pat(?:ari|ru))s|(?:II\.?\s*пи|2\.?\s*пи)смо\s*од\s*апостол\s*Петар|(?:Second(?:(?:a\s*lettera\s*di|o)|a)\s*Pi|2°\.?\s*Pi)etro|(?:رسالة\s*القديس\s*)?بطرس\s*الثانية|pa(?:ṭras\s*kā\s*dūsrā\s*ʿām\s*ḫaṭ|tras\s*dī\s*dūjī\s*pattrī)|Waraka\s*wa\s*Pili\s*wa\s*Petro|Naa77antto\s*PHeexiroosa|Barua\s*ya\s*Pili\s*ya\s*Petro|प(?:(?:त्रुसको\s*दोस्(?:त्)?रो|ौलाचें\s*दुसरे)|ेत्राचें\s*दुसरे)\s*पत्र|Toinen\s*Pietarin\s*kirje|(?:(?:II\.?\s*посланиц|2\.?\s*посланиц)а\s*Петров|2(?:(?:-?е\.?\s*Петру|\.?\s*Петру)с|(?:-?я|[ея])\.?\s*Петрус))а|پطرس\s*کا\s*دوسرا\s*عام\s*خط|ପିତରଙ୍କ\s*ଦ୍ୱିତୀୟ\s*ପତ୍ର|(?:(?:2(?:-?е\.?\s*посланн|\.?\s*посланн)|II\.?\s*посланн)я\s*П|2\.?\s*послание\s*П)етра|ਪਤਰਸ\s*ਦੀ\s*ਦੂਜੀ\s*ਪੱਤ੍ਰੀ|(?:Druh(?:[aá]\s*(?:kniha\s*Petro|list\s*Petr[uů]|Petr[uů])|[yý]\s*(?:list\s*Petr[ouů]|Petr[uů]))|(?:II\.?\s*l|2\.?\s*l)ist\s*Petr[uů]|2\s*k\.\s*Petro|II\.?\s*Petrů|2\s*k\s*Petro|2\.?\s*Petrů)v|And(?:r(?:a\s*Petrusbrevet|e\s*Petersbrev)|e[nt]\s*Petersbrev)|(?:II\.?\s*Pieta|2\.?\s*Pieta)rin\s*kirje|رسالة\s*بطرس\s*الثانية|S(?:[ií]ðara\s*P[eé]tursbr[eé]f|econd\s*P(?:(?:ete|t)r|et?r))|(?:Peters\s*Andet\s*B|Pet(?:rus\s*andra|ers\s*andre)\s*b)rev|(?:Druh[yý]\s*Petrov\s*lis|2(?:(?:\s*[ei]\.?\s*Pj|\s*Pj)|\.\s*Pj)etri|dovvomp)t|Π(?:ετρου\s*(?:Επιστολη\s*Β|Β['ʹʹ΄’])|έτρου\s*Β['ʹʹ΄’])|Epistula\s*(?:II\s*Petri|Petri\s*II)|(?:Segund(?:o\s*(?:San\s*)?Ped|a\s*Ped)|(?:(?:(?:Ikalawang|2a\.)|2a)|(?:II\.?\s*S|2\.?\s*S)an)\s*Ped|2(?:\.[oº]|[oº])\.\s*(?:San\s*)?Ped|2(?:\.[oº]|[oº])\s*(?:San\s*)?Ped)ro|(?:Deuxi[eè]mes?\s*Pierr|2(?:(?:eme|de?)|ème)\.\s*Pierr|2(?:(?:eme|de?)|ème)\s*Pierr|(?:II\.?\s*Pier|2\.?\s*Pier)r|2e\.?\s*Pierr|2\s*PH)e|T(?:oinen\s*Pietarin|weede\s*Petr?)|2\.?\s*Petrusbrevet|D(?:o(?:vom(?:\s*[Pp](?:atrissi|eters)|P(?:atrissi|eters)|p(?:atrissi|eters))|\s*?p(?:atrissi|eters))|o(?:vom(?:\s*[Pp]atras|[Pp]atras)|\s*?patras)a|ru(?:h(?:[yý]\s*P(?:etrova|t)|[aá]\s*Pt)|h[aá]\s*Petrova|g[ai]\s*Piotra)|ezy[eè]m\s*P[iy][eè])|Zweite(?:[nrs])?\s*Petrus|D(?:o(?:(?:vom(?:\s*[Pp](?:atriss?|eter)|P(?:atriss?|et(?:er)?)|p(?:atriss?|eter))|\s*?p(?:atriss?|eter))|(?:vom(?:\s*[Pp]atras|[Pp]atras)|\s*?patras))|ru(?:g(?:a\s*P(?:etrova|iotr)|i\s*Piotr)|h(?:(?:[yý]\s*P(?:etr(?:ov)?)?|[aá]\s*P(?:etr)?)|[aá]\s*Petrov)))|2\.?\s*Petersbrev|M[aá]sodik\s*P[eé]ter|Butros\s*Labaad|dovvom\s*petrus|(?:Втор[ао]\s*Петро|2-?е\.?\s*Петро)во|ଦ୍ୱିତୀୟ\s*ପିତରଙ|And(?:re\s*Pet(?:ers?)?|en\s*Pet(?:er)?)|(?:II\.?\s*Pieta|2\.?\s*Pieta)rin|II(?:\.\s*P(?:h(?:(?:i(?:-?e|a)-?|i-?)rơ|ê(?:-?rơ|rô))|e(?:tr(?:u[sv]|i)|dro|r)|iè)|\s*P(?:h(?:(?:i(?:-?e|a)-?|i-?)rơ|ê(?:-?rơ|rô))|e(?:tr(?:u[sv]|i)|dro|r)|iè))|رسالة\s*بطرس\s*2|השנייה\s*פטרוס|II(?:\.\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|hia|ie|ét)?|But|Пет)|\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|hia|ie|ét)?|But|Пет))|Second\s*P(?:ete|et?|t)?|M[aá]sodik\s*P[eé]t|2(?:(?:(?:(?:\s*(?:(?:(?:(?:(?:(?:पेत्राचें|petr[aā]ce[mṃ]|P(?:ēturu|er|iè|d)|பேதுரு|ਪਤਰਸ|ปต)|Petr(?:uv|i))|Петра)|पत(?:्रुसको|रस))|पेतरॉस)|เปโตร)|\.\s*(?:प(?:त(?:्रुसको|रस)|ेतरॉस)|Pe(?:tr(?:uv|i)|r)|Петра|เปโตร|پطرس)|-?е\.?\s*Петра|(?:-?я|[ея])\.?\s*Петра|پت|베드)|\s*Pedro)|\.\s*Pedro)|\.\s*Piè)|2\.?\s*Ph(?:(?:i(?:-?e|a)-?|i-?)rơ|ê(?:-?rơ|rô))|دو(?:م(?:(?:(?:\s*پطرس(?:س(?:اه|[ئهىی])|[ئاهىی])|(?:\s*پطر\s*|[-۔]پطر)س)|\s*پطرص[ئاسهىی])|پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی]))|\s*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی]))|II\.?\s*Петр(?:ов[ао]|а)|2(?:-?е\.?\s*Пети|(?:-?я|[ея])\.?\s*Пети|\.?\s*Пети)ра|(?:2(?:(?:\.\s*patrusk|\s*(?:patrusk|Pietr))|\.\s*Pietr)|II\.?\s*Pietr|Pili\s*Petr)o|2\s*இராயப்பர்|2\.?\s*Petro(?:va?)?|دو(?:م(?:(?:(?:\s*پطرس(?:سا?)?|پط)|\s*پطرص)|پطر(?:س(?:سا?)?|ص))|\s*پطر(?:س(?:سا?)?|ص)|پطر(?:س(?:سا?)?|ص))|Втор(?:а\s*Петр?|о\s*Петр?)|Друга\s*Петр?|2\s*Patrissi|(?:II\.?\s*Pio|2\.?\s*Pio)tra|2nd\.?\s*P(?:(?:ete|t)r|et?r)|(?:II\.?\s*Pétr|2\.?\s*Pétr)us|베드로(?:의\s*둘째\s*서간|[2후]서)|2\.?\s*Петров[ао]|2(?:\.\s*(?:P(?:e(?:t(?:r(?:us?)?|e)?)?)?|पत(?:्रुस|र)|Петр?)|\s*(?:(?:(?:Pet(?:r(?:us?)?|e)?|(?:पेत्र|P(?:i(?:et?)?|ed?|je?)?|பேது))|Петр?)|पत(?:्रुस|र))|پط)|2\s*Patriss?|(?:II\.?\s*Pio|2\.?\s*Pio)tr|2nd\.?\s*P(?:ete|et?|t)?|2\.?\s*Peters?|2Patrissi|2\s*?Patrasa|(?:II(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|2\.?\s*Pt)r|Β['ʹʹ΄’]\s*Π[έε]τρου|(?:(?:2\s*|[2۲])|۲\s*)پطرس(?:س(?:اه|[ئهىی])|[ئاهىی])|(?:II\.?\s*Péte|2\.?\s*Péte)r|[ヘペ](?:トロ(?:の第二の手紙|(?:の手紙二|\s*2))|テロの(?:第二の手紙|後の書|手紙Ⅱ))|(?:II(?:\.\s*Пет[аъ]|\s*Пет[аъ])|2(?:\.\s*Пет[аъ]|\s*Пет[аъ]))р|2Patriss?|2\s*?Patras|Pili\s*Pet|II(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|(?:2(?:e\.?\s*Pe|p)|۲p)tr?|(?:(?:2\s*|[2۲])|۲\s*)پطرس(?:سا?)?|Πετρου\s*Β|II\.?\s*Петр|(?:2\.?|۲)\s*پطر\s*س|Petr[io]\s*II|2\.?\s*ପିତରଙ|2\.\s*Pedr|2\.?\s*Phia|Β['ʹʹ΄’]\s*Π[έε](?:τρ?)?|2Peters|(?:II\.?\s*Py|2\.?\s*Py)[eè]|(?:2(?:\.[-۔]|۔)|۲[-۔])پطرس|(?:(?:2\s*|[2۲])|۲\s*)پطرص[ئاسهىی]|《?伯多祿後書》|2\s*Pedr|2\.\s*Pie|2\.?\s*Pét|2\.?\s*But|2Peter|(?:(?:2\s*|[2۲])|۲\s*)پطرص|《?伯多祿後書|2-?پطرس|(?:《彼(?:得后书|[后後])|《?撇特爾後|彼(?:得后书|[后後]))》|《?彼得後書》|2\.?\s*Pt|《彼(?:得后书|[后後])|《?撇特爾後|《?彼得後書|Ⅱ\s*[ヘペ]テロ|2پطر|۲پطر|2Pet|彼(?:得后书|[后後])|二[ヘペ]トロ|2[ヘペ]テロ|2\s*?بط|۲پت|벧후))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:1-?(?:ше|а)\.\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|послання\s*апостола\s*Петра|послання\s*Петра|Петр(?:ово|а))|П(?:ерш[ае]\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|послання\s*апостола\s*Петра|послання\s*Петра|Петр(?:ово|а))|ърво\s*съборно\s*послание\s*на\s*св\.?\s*ап\.\s*Петра|ърво\s*съборно\s*послание\s*на\s*св\.?\s*ап\s*Петра|рв(?:(?:а\s*послание\s*на\s*апостол\s*|а\s*(?:писмо\s*од\s*апостол\s*)?)Пета|о\s*(?:п(?:ослание\s*на|исмо\s*од)\s*апостол\s*Пета|Пета))р|ърв(?:о\s*(?:послание\s*на\s*)?Петър|а\s*Петър)|рва\s*посланица\s*Петрова|(?:ърв[ао]\s*Петро|рво\s*Петро)во|рва\s*Петров[ао])|(?:1(?:-?е\.?\s*с|\.?\s*с)|I\.?\s*с)оборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|1-?(?:ше|а)\s*(?:соборне\s*послання\s*(?:св\.?\s*апостола\s*Петра|(?:апостола\s*)?Петра)|послання\s*апостола\s*Петра|послання\s*Петра|Петр(?:ово|а))|P(?:ēturu\s*Eḻutiya\s*Mutalāvatu\s*Nirupam|r(?:emye\s*P[iy][eè]|vn[ií]\s*Pt))|(?:P(?:er[sš]e\s*poslannja\s*apostola\s*Pe|ierwsz[aey]\s*List\s*(?:[sś]w\.?\s*Pio|Pio))|(?:1\.?\s*L|I\.?\s*L)ist\s*(?:[sś]w\.?\s*Pio|Pio))tra|பேதுரு\s*(?:எழுதிய\s*முதல(?:ா(?:வது\s*நிருப|ம்\s*கடித)|்\s*திருமுக)ம்|முதல்\s*திருமுகம்)|(?:1\.?\s*послание\s*на\s*апостол\s*Пета|I\.?\s*послание\s*на\s*апостол\s*Пета|(?:1\.?\s*пи|I\.?\s*пи)смо\s*од\s*апостол\s*Пета|1(?:\.\s*Пет[аъ]|\s*Пет[аъ])|I(?:\.\s*Пет[аъ]|\s*Пет[аъ]))р|(?:1(?:-?е\.?\s*посланн|\.?\s*посланн)|I\.?\s*посланн)я\s*апостола\s*Петра|א(?:גרתו\s*הראשונה\s*של\s*פטרוס\s*השליח|יגרת\s*פטרוס\s*הראשונה)|אגרתו\s*הראשונה\s*של\s*פטרוס\s*השלי|E(?:nsimm[aä]inen\s*Pietarin\s*kirje|pistula\s*(?:I\s*Petri|Petri\s*I)|ls[oő]\s*P[eé]ter)|(?:Fyrra\s*almenna\s*br[eé]f\s*P[eé]tur|E(?:erste\s*Petru|rste(?:[nrs])?\s*Petru)|avval\s*petru|1(?:\.\s*Patara|\s*(?:Patar[ai]|patra))|1e\.\s*Petru|1\.?\s*Butro|I\.?\s*Butro|1e\s*Petru|(?:1\.?\s*Pétr|I\.?\s*Pétr)u|1\s*Patru|[1۱]ptru)s|Waraka\s*wa\s*Kwanza\s*wa\s*Petro|رسالة\s*(?:القديس\s*بطرس\s*الأولى|بطرس\s*(?:الأولى|1))|Barua\s*ya\s*Kwanza\s*ya\s*Petro|p(?:a(?:(?:tras\s*dī\s*pahilī\s*pattrī|ṭras\s*kā\s*pahlā\s*ʿām\s*ḫaṭ)|trusko\s*pahilo\s*patra)|etr[aā]ce[mṃ]\s*pahile\s*patra)|(?:Prim(?:(?:a\s*lettera\s*di|o)|a)\s*Pi|1°\.?\s*Pi)etro|(?:Prv(?:a\s*Petrova\s*[Pp]oslanic|n[ií]\s*Petrov)|(?:1\.?\s*Petrova\s*P|I\.?\s*Petrova\s*P)oslanic|Koiro\s*PHeexiroos)a|E(?:nsimm[aä]inen\s*Pietarin|erste\s*Petr?|ls[oő]\s*P[eé]t)|(?:1\.?\s*посланица\s*Петров|I\.?\s*посланица\s*Петров|1(?:(?:-?е\.?\s*Петру|\.?\s*Петру)с|(?:-?я|[ея])\.?\s*Петрус))а|پطر(?:\s*س\s*کاپہلا\s*عا\s*|س\s*کا\s*پہلا\s*عا)م\s*خط|प(?:ेत्राचें?\s*पहिले\s*पत्र|त्रुसको\s*पहिलो\s*पत्र)|ਪਤਰਸ\s*ਦੀ\s*ਪਹਿਲੀ\s*ਪੱਤ੍ਰੀ|(?:F[oö]rsta\s*Petrusbreve|Prv[yý]\s*Petrov\s*lis|1\.?\s*Petrusbreve|1(?:(?:\s*[ei]\.?\s*Pj|\s*Pj)|\.\s*Pj)etri)t|(?:(?:1(?:-?е\.?\s*посланн|\.?\s*посланн)|I\.?\s*посланн)я\s*П|1\.?\s*послание\s*П)етра|1(?:-?е\.?\s*послание|(?:-?я|[ея])\.?\s*послание)\s*Петра|Pet(?:ers\s*(?:(?:Første|1\.?)\s*B|første\s*b)|rus\s*f[oö]rsta\s*b)rev|ପ(?:ିତରଙ୍କ\s*ପ୍ରଥମ\s*ପତ୍ର|୍ରଥମ\s*ପିତରଙ)|(?:Prv(?:n[ií]\s*(?:list\s*Petr[uů]|Petr[uů])|[aá]\s*kniha\s*Petro|[yý]\s*list\s*Petro|á\s*Petro)|(?:1\.?\s*l|I\.?\s*l)ist\s*Petr[uů]|1\s*k\.\s*Petro|1\s*k\s*Petro|1\.?\s*Petrů|I\.?\s*Petrů)v|F(?:ørste\s*Petersbrev|yrra\s*P[eé]tursbr[eé]f|irst\s*P(?:(?:ete|t)r|et?r))|(?:1\.?\s*Pieta|I\.?\s*Pieta)rin\s*kirje|Π(?:ετρου\s*(?:Επιστολη\s*Α|Α['ʹʹ΄’])|έτρου\s*Α['ʹʹ΄’])|(?:(?:(?:Prime(?:ro?\s*San|ir[ao])|1(?:\.[oº]|[oº])\.\s*San|1(?:\.[oº]|[oº])\s*San|(?:1\.?\s*S|I\.?\s*S)an|1a\.)\s*P|(?:(?:Primero?\s*P|(?:1(?:\.[oº]|[oº])\.\s*|1(?:\.[oº]|[oº])\s*)P)|1a\s*P))ed|Una(?:ng)?\s*Ped)ro|(?:Premi(?:eres?\s*Pierr|ères?\s*Pierr|ers?\s*Pierr)|1(?:(?:ere?|re)|ère)\.\s*Pierr|1(?:(?:ere?|re)|ère)\s*Pierr|(?:1\.?\s*Pier|I\.?\s*Pier)r|1\s*PH)e|(?:Pierwsz[aey]\s*Piotr|(?:1\.?\s*Pio|I\.?\s*Pio)tr)a|Pierwsz[aey]\s*Piotr|Avval(?:\s*[Pp]|p)(?:at(?:r(?:(?:issi|asa)|us)|aris)|eters)|F(?:ørste\s*Pet(?:ers?)?|irst\s*P(?:ete|et?|t)?)|Avval(?:\s*[Pp]|p)(?:atr(?:iss?|as)|eter)|1\.?\s*Petersbrev|(?:Avval|1)Pat(?:r(?:(?:issi|asa)|us)|aris)|Butros\s*Kowaad|הראשונה\s*פטרוס|P(?:rv(?:a\s*Petrova?|[yý]\s*Petrov|n[ií]\s*P(?:etr)?)|eter)|(?:Avval|1)Patr(?:iss?|as)|Yek(?:\s*p(?:at(?:r(?:(?:issi|asa)|us)|aris)|eters)|p(?:at(?:r(?:(?:issi|asa)|us)|aris)|eters))|1-?е\.?\s*Петрово|(?:Kwanza\s*Petr|1(?:(?:\.\s*patrusk|\s*(?:patrusk|Pietr))|\.\s*Pietr)|I\.?\s*Pietr)o|(?:1\.?\s*Pieta|I\.?\s*Pieta)rin|Yek(?:\s*p(?:atr(?:iss?|as)|eter)|p(?:atr(?:iss?|as)|eter))|1(?:(?:(?:(?:\s*(?:(?:(?:(?:(?:(?:पेत्राचें|petr[aā]ce[mṃ]|P(?:ēturu|er|iè|d)|பேதுரு|ਪਤਰਸ|ปต)|Petr(?:uv|i))|Петра)|पत(?:्रुसको|रस))|पेतरॉस)|เปโตร)|\.\s*(?:प(?:त(?:्रुसको|रस)|ेतरॉस)|Pe(?:tr(?:uv|i)|r)|Петра|เปโตร)|-?е\.?\s*Петра|(?:-?я|[ея])\.?\s*Петра|پت|베드)|\s*Pedro)|\.\s*Pedro)|\.\s*Piè)|1\.?\s*Ph(?:(?:i(?:-?e|a)-?|i-?)rơ|ê(?:-?rơ|rô))|I(?:\.\s*(?:P(?:h(?:(?:i(?:-?e|a)-?|i-?)rơ|ê(?:-?rơ|rô))|e(?:tr(?:u[sv]|i)|dro|r)|iè)|Петра)|\s*(?:P(?:h(?:(?:i(?:-?e|a)-?|i-?)rơ|ê(?:-?rơ|rô))|e(?:tr(?:u[sv]|i)|dro|r)|iè)|Петра))|(?:Avval|1)Peters|اول\s*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|1(?:-?е\.?\s*Пети|(?:-?я|[ея])\.?\s*Пети|\.?\s*Пети)ра|بطرس\s*الأولى|1\s*இராயப்பர்|1\.?\s*Petro(?:va?)?|I(?:\.\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|hia|ie|ét)?|Петр?|But)|\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|hia|ie|ét)?|Петр?|But))|(?:Avval|1)Peter|Kwanza\s*Pet|اول\s*پطر(?:س(?:سا?)?|ص)|П(?:ърв(?:а\s*Петр?|о\s*Петр?)|рва\s*Петр?)|1st\.\s*P(?:(?:ete|t)r|et?r)|1\s*Patr(?:issi|asa)|اوّل(?:\s*پطر\s*?|[-۔]پطر)س|اولپطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|یک(?:\s*پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی])|پطر(?:س(?:س(?:اه|[ئهىی])|[ئاهىی])|ص[ئاسهىی]))|베드로(?:의\s*첫째\s*서간|[1전]서)|(?:1\.?\s*Петро|I\.?\s*Петро)в[ао]|1(?:\.\s*(?:P(?:e(?:t(?:r(?:us?)?|e)?)?)?|पत(?:्रुस|र)|Петр?)|\s*(?:(?:(?:Pet(?:r(?:us?)?|e)?|(?:पेत्र|P(?:i(?:et?)?|ed?|je?)?|பேது))|Петр?)|पत(?:्रुस|र))|پط)|1st\.\s*P(?:ete|et?|t)?|1\.?\s*Peters?|1\s*Patr(?:iss?|as)|اولپطر(?:س(?:سا?)?|ص)|یک(?:\s*پطر(?:س(?:سا?)?|ص)|پطر(?:س(?:سا?)?|ص))|1st\s*P(?:(?:ete|t)r|et?r)|Α['ʹʹ΄’]\s*Π[έε]τρου|[ヘペ](?:トロ(?:の第一の手紙|(?:の手紙一|\s*1))|テロの(?:第一の手紙|前の書|手紙Ⅰ))|(?:1\s*?پطرس|۱\s*?پطرس)(?:س(?:اه|[ئهىی])|[ئاهىی])|1st\s*P(?:ete|et?|t)?|AvvalPet|1e\.\s*Petr?|(?:1\.?\s*Pio|I\.?\s*Pio)tr|(?:1\s*?پطرس|۱\s*?پطرس)(?:سا?)?|Πετρου\s*Α|(?:I(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|1\.?\s*Pt)r|(?:1\.?\s*Péte|I\.?\s*Péte)r|(?:1\.|[1۱])\s*پطر\s*س|1\.?\s*ପିତରଙ|1\.\s*Pedr|1\.?\s*Phia|I(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|1e\s*Petr?|Α['ʹʹ΄’]\s*Π[έε](?:τρ?)?|avvalpt|Petr[io]\s*I|1\.\s*پطرس|(?:1(?:\.[-۔]|۔)|۱[-۔])پطرس|(?:1\s*?پطرص|۱\s*?پطرص)[ئاسهىی]|《?伯多祿前書》|1\s*Pedr|1\.\s*Pie|1\.?\s*Pét|1\.?\s*But|1\s*?پطرص|۱\s*?پطرص|《?伯多祿前書|(?:1\.?\s*Py|I\.?\s*Py)[eè]|1-?پطرس|(?:《彼(?:得前[书書]|前)|《?撇特爾前|彼(?:得前[书書]|前))》|1\.?\s*Pt|اولپط|《彼(?:得前[书書]|前)|《?撇特爾前|Ⅰ\s*[ヘペ]テロ|1پطر|۱پطر|1Pet|[1۱]ptr?|彼(?:得前[书書]|前)|一[ヘペ]トロ|1[ヘペ]テロ|1\s*?بط|۱پت|벧전))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rom"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:исмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Рим|ослан(?:(?:ня\s*(?:св\.?\s*апостола\s*Павла\s*до\s*римлян|(?:апостола\s*Павла\s*)?до\s*римлян)|и(?:е\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Римляни|\s*ап\.?\s*Павла\s*до\s*Римляни)|към\s*римляните)|ца\s*Римљанима))|ие\s*к\s*Римлянам))|P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*rymljan|ica\s*Rimljanima)|a(?:vlova\s*poslanica\s*Rimljanima|ulus(?:'\s*Brev\s*til\s*Romerne|’\s*(?:Brev\s*til\s*R|brev\s*til\s*r)omerne)))|رسالة\s*بولس\s*الرسول\s*إلى\s*أهل\s*رومية|ரோம(?:ாபுரியாருக்கு\s*எழுதிய\s*கடிதம|ர)்|ر(?:وم(?:ی(?:و(?:ں\s*کے\s*نام\s*(?:پولس\s*رسول\s*)?کا\s*خط|ن(?:ی?ان|ها|ن))|ان(?:ی?ان|ها|ن))|ي(?:ان[هی]|ون[هی]))|سالة\s*روما|ُومِیوں)|உரோம(?:ையருக்கு\s*எழுதிய\s*திருமுக|ருக்கு\s*எழுதிய\s*நிருப)ம்|א(?:גרת\s*פולוס\s*השליח\s*אל-?הרומי|ל\s*הרומא)ים|Urōmarukku\s*Eḻutiya\s*Nirupam|(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Rzymi|do\s*Rzymi)|R(?:oomiy|zymi|umiy|omy))an|(?:Br[eé]f\s*P[aá]ls\s*til\s*R[oó]mverj|rom(?:īhar[uū]l[aā][iī]\s*patr|ihar[uū]l[aā][iī]\s*patr|kar[aā][mṃ]s\s*patr)|Rôm)a|रोमीहरूलाई\s*पावलको\s*पत्र|r(?:ōmiyōṅ\s*ke\s*nām\s*kā\s*ḫaṭ|omīāṃ\s*nū̃\s*pattrī|ūm(?:iān)?ī)|الرسالة\s*إلى\s*أهل\s*رومية|पौलाचे\s*रोमकरांस\s*पत्र|Epistula\s*ad\s*Romanos|Sulat\s*sa\s*mga\s*Romano|(?:Kirje\s*roomalaisill|Ro(?:(?:omalaiskirj|m(?:ak[eë]v|ern))|omalaisill))e|ରୋମୀୟଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|(?:(?:(?:Layang\s*Paulus\s*|Taga-?\s*)R|Mga\s*Taga(?:-?\s*?R|\s*R))o|War(?:aka\s*kwa\s*War)?o|Barua\s*kwa\s*Waro|Rô-?)ma|Lettera\s*ai\s*Romani|War(?:aka\s*kwa\s*War)?umi|ਰੋਮੀਆਂ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|האיגרת\s*אל\s*הרומאים|रोमीहरूलाई\s*पत्र|R(?:omverjabr[eé]fið|óm(?:verjabr[eé]fið|aiakhoz)|o(?:m(?:e(?:inenbrief|rbrevet|n)|arbrevet|an(?:os|[is])|s)|s)|hufeiniaid|omaiakhoz|(?:oe|ö)mer|mn?s)|로마(?:\s*신자들에게\s*보낸\s*서간|서)|Προς\s*Ρωμα[ίι]ους|रोमकरांस\s*पत्र|(?:List\s*(?:R(?:iman[ouů]|íman[uů])|Ř[ií]man[uů])|R(?:(?:imsky|ímsky|ò)|iman[ouů])|(?:Ríma|Ř[ií]ma)n[uů])m|r(?:om(?:īhar[uū]l[aā][iī]|ihar[uū]l[aā][iī]|kar[aā][mṃ]s|īāṃ)|ūm(?:iān)?)|रोम(?:ी(?:हरूलाई)?|करांस|ियो)?|Urōmarukku|ਰੋਮੀਆਂ(?:\s*ਨੂੰ)?|ロ(?:ーマ(?:の信徒への手紙|人への手紙|書)|マ人への書)|ad\s*Romanos|Rimljanima|אל\s*הרומיים|(?:К\s*)?Римлянам|אל\s*הרומים|До\s*римлян|Римјаните|римляните|Римљанима|R(?:o(?:m(?:e(?:inen|r)|a(?:no?)?)?|om(?:a|e)?)?|z(?:ym)?|huf|óma?|(?:oe|ö)m|mn?|im|um|ím)|ରୋମୀୟଙ୍କ|रोम(?:कंरास|ियों)|உரோமையர்|Ρωμα[ίι]ους|رو(?:م(?:ی(?:ان(?:ه|ی)?|و(?:ن(?:ه|ی)?|ں))?|يان)?)?|Рим(?:јани|л(?:ян)?)?|Римляни|R(?:o(?:ma(?:nd|in)|amn)|pman)s|R(?:o(?:(?:m(?:i(?:yo|[au])|as)|omea)|omi[au])|umi[au])n|《(?:羅(?:爾瑪書|(?:馬書)?)》|罗(?:马书)?》)|《(?:羅(?:爾瑪書|馬書)?|罗(?:马书)?)|ローマ(?:人へ)?|La-?mã|羅(?:爾瑪書|(?:馬書)?)》|ﺭﻭﻣﻴﺔ|羅(?:爾瑪書|馬書)?|罗马书》|Ř(?:[ií]m)?|Ρωμ|罗马书|உரோ|῾Ρω|โรม|로마|罗》|รม|罗|롬))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Song"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Песнь\s*Сул(?:а[ий]мона|е[ий]мана)|Tình\s*ca|Kid\s*Ag)|(?:Книга\s*П(?:есен\s*на\s*Песните,\s*от|існі\s*Пісень)\s*Соломона|Пісня\s*над\s*піснями\s*Соломона|E(?:l\s*Cantar\s*de\s*los\s*Cantares|nekek\s*[eé]neke)|சாலொமோனின்\s*உன்னதப்பாட்டு|Cantare?\s*de\s*los\s*Cantares|Cantique\s*des\s*[Cc]antiques|T(?:he\s*Song(?:s\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns)|\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns))|ình)|(?:(?:Syirul-?asyar\s*Sulaim|H(?:oga\s*vis|öga\s*[Vv]is))a|C(?:(?:an(?:tarea\s*lui|iad)|ântarea\s*lui)\s*So|hante\s*Sa)lomo|Gabaygii\s*Sulaymaa|Lj[oó]ðalj[oó]ði|Hø[jy]sange)n|(?:C(?:anticos?\s*dos\s*C[aâ]ntico|ântico(?:s\s*dos\s*C[aâ]ntico|\s*dos\s*C[aâ]ntico))|Ho(?:hes?lied\s*Salomoni|j))s|Песнь\s*песне[ий]\s*Соломона|The\s*Song(?:s\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n))|(?:Ve[lľ]piese[nň]\s*[SŠ]alam[uú]nov|P(?:jesma\s*nad\s*pjesmam|i\s*bèl\s*Chante\s*)|Ghaz(?:al(?:_Ghazal(?:_ha|-?h)|(?:(?:\s*Ghazal[\s*-]|-?Ghazal-?|Ghazal[\s*-_])|-?Ghazal)h)|l_Ghazal(?:_ha|-?h)|(?:l(?:(?:\s*Ghazal-?|Ghazal[-_])|-?Ghazal-?)|l-?Ghazal)h)|P(?:ise[nň]\s*[SŠ]alamou|íse[nň]\s*[SŠ]alamou)nov|Piese[nň]\s*[SŠ]alam[uú]nov|Wimbo\s*(?:Ulio\s*)?Bor|Siiquwaa\s*Saba|Pie(?:s[nń]\s*Salomo|ś[nń]\s*Salomo)n|g[iī]tratn)a|(?:s(?:ulem[aā]nko\s*[sš]re[sṣ][tṭ]ʰag[iī]|alemān\s*dā\s*gī)|A(?:ng\s*Awit\s*ng|wit\s*(?:sa|ng))\s*mga\s*Awi|Reshthagee|Cn)t|स(?:ुलेमानको\s*श्रेष्ठ|्रेस्ट\s*)गीत|C(?:ant(?:i(?:cum\s*[Cc]anticorum|ques)|\.\s*Cantic|\s*Cantic|ari)|antarea\s*cantarilor|antarea\s*C[aâ]nt[aă]rilor|ântar(?:ea\s*C[aâ]nt[aă]rilor|i)|t)|C(?:ant(?:ico\s*dei\s*[Cc]antic|ăr)|ântăr)i|P(?:i(?:snja\s*nad\s*pisnjamy|e(?:s[nń]\s*nad\s*Pie[sś]niami|ś[nń]\s*nad\s*Pie[sś]niami))|iese[nň]\s*piesn[ií]|ise[nň]\s*p[ií]sn[ií]|íse[nň]\s*p[ií]sn[ií]|NP|Š)|C(?:ant(?:(?:ares\s*de\s*Salom[aã]|ico\s*de\s*Salom[aã])|ico\s*Superlativ)|ântico\s*(?:Superlativ|de\s*Salom[aã]))o|П(?:ес(?:на(?:та)?\s*над\s*песните|(?:(?:ната\s*на\s*Соломо|\s*на\s*пес)|\.\s*на\s*пес)н|ен\s*на\s*песните)|есни\s*Песне[ий]|існ(?:я\s*Пісне[ий]|і\s*Пісень)|\.?\s*П|нп)|A(?:ng\s*Awit\s*ni\s*S[ao]lom[oó]n|wit\s*ni\s*S[ao]lom[oó]n|\.?\s*ng\s*A|w\s*ni\s*S)|(?:Cantico\s*di\s*Salomon|Kantiku\s*i\s*Kantik[eë]v)e|Musthikaning\s*Kidung|П(?:існ(?:я\s*над\s*піснями)?|ес(?:нь?)?)|H(?:o(?:he(?:s(?:lied\s*Salomos|\s*Lied)|lied\s*Salomos)|oglied|ga(?:\s*V|v))|ögav|ld)|Ghaz(?:al(?:(?:\s*Ghazalha|(?:\s*Ghazal_|Ghazal)h)|_Ghazalh)aa|(?:(?:l\s*Ghazalha|l(?:\s*Ghazal_|Ghazal)h)|l_Ghazalh)aa)|Songs\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns)|Песма\s*(?:над\s*песмам|Соломонов)а|G(?:haz(?:al(?:\s*Ghazalhaa?|(?:\s*Ghazal_|Ghazal)ha|_Ghazalha)|l\s*Ghazalhaa?|l(?:\s*Ghazal_|Ghazal)ha|l_Ghazalha)|ab(?:aygii)?)|Songs\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|K(?:anti(?:d\s*de\s*Kantik|k(?:ul)?o)|idA)|Song\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns)|Salomo(?:ns\s*Høj|s\s*(?:Høi|høy))sang|ġazalu\s*l-?ġazalāt|سفر\s*نشيد\s*الأنشاد|Song\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|இனிமைமிகு\s*பாடல்|உன்னத\s*சங்கீதம்|(?:Laulujen\s*laul|Korkea\s*veis|Caniada)u|Salamon\s*[eé]neke|Црковни\s*химни|نشيد\s*الأناشيد|ਸਲੇਮਾਨ\s*ਦਾ\s*ਗੀਤ|உன்னதப்பாட்டு|غزل(?:ۀ?\s*غزلۀ\s*ها|ُ\s*الغزلات|\s*غزل\s*?هاا|\s*الغزلات|غزل\s*هاا|(?:ۀ\s*)?غزلها|‌غزل‌ها|یات)|Énekek\s*[eé]neke|Kidung\s*Agung|Uṉṉatappāṭṭu|[ΆΑ]σμα\s*Ασμ[άα]των|உன்னத\s*பாட்டு|เพลง(?:ซา|โซ)โลมอน|غزل(?:\s*غزل\s*?ها|غزل\s*ها|[غی])|שיר(?:\s*השירים|י\s*שלמה)|ﻧﺸﻴﺪ\s*ﺍﻷﻧﺸﺎ|श्रेष्ठगीत|H(?:o(?:hes?lied|ogl)|oga\s*v|öga(?:\s*V)?|ø[jy]s|l)|Ve[lľ]p(?:iese[nň])?|C(?:an(?:(?:t(?:ares|i(?:que|co))?)?|ticos)|ânt(?:icos)?|hante)|श्रेष्ठ|L(?:aul\.?\s*l|jl)|Diễm\s*ca|솔로몬의\s*노래|गीतरत्न|P(?:i(?:es(?:e[nň])?|s)|ise[nň]|ís(?:e[nň])?|j)|K(?:id(?:ung)?|ant)|shīr(?:āy|i)|S\s*of\s*S|Nhã\s*ca|ପରମଗୀତ|shīrā?|So(?:ng?)?|உன்ன|Sn?gs|《?雅歌》|諸歌の歌|Wim|Sn?g|《?雅歌|S(?:o?S|iq)|Pnp|V[lľ]p|《歌》|இபா|พซม|Én|نش|《歌|아가|Ἆσ|歌》|아))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Prov"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(امثل\s*ل|(?:Книга\s*(?:При(?:повісте[ий]\s*Соломонови|казок\s*Соломонови)х|притче[ий]\s*Соломоновых|Притчи\s*Соломонови)|(?:Ks(?:i[eę]g[ai]\s*Przypowie[sś]ci\s*Salomon|\.\s*Przypowie[sś]ci\s*Salomon|\s*Przypowie[sś]ci\s*Salomon)|P(?:r[ií]slovi\s*[SŠ]alomounov|r[ií]sloví\s*[SŠ]alomounov|ř[ií]slov[ií]\s*[SŠ]alomounov)|Sananlaskujen\s*kirj)a|P(?:r(?:zypowie[sś]ci\s*Salomonowych|(?:overbi|vb)os|everb(?:io)?s|overb(?:e?s|ia)|[ií]slovia|verb(?:io)?s|vbs)|robverbs|roberbs|or?verbs|rovebs|wov[eè]b|v)|Приповісте[ий]\s*соломонових|(?:(?:P(?:(?:roverb|ild)ele\s*lui\s*Solom|anultih)|Mga\s*Panultih)o|(?:Ordspr[aå]ksbo|Spreu)ke|Diarh?ebio|Châm\s*ngô)n|(?:Surat\s*Amsal\s*Sulaim|(?:Mga\s*)?Kawika|Neetivach)an|L(?:i(?:ber\s*Proverbiorum|v\s*Pwov[eè]b\s*yo)|e(?:emiso|m))|hi(?:topade[sš]ko\s*pustak|kmāt)|हितोपदेशको\s*पुस्तक|Притчи\s*Соломонови|Ordsprogenes\s*Bog|S(?:a(?:lomos\s*Ordsprog|nanlaskut)|prichw(?:(?:oe|ö)|o)rter)|(?:Salomos\s*Ordspr[aå]|P[eé]ldabesz[eé]de)k|При(?:че\s*Солом[оу]нове|тчі\s*Соломона|пові(?:док|сті)|казок)|Мудрые\s*изречения|K(?:s(?:i[eę]g[ai]\s*Przysł[oó]w|\.\s*Przysł[oó]w|\s*Przysł[oó]w)|niha\s*pr[ií]slov[ií]|\.\s*pr[ií]slov[ií]|\s*pr[ií]slov[ií])|Wulang\s*Bebasan|S(?:ananl(?:askujen)?|pr)|M(?:(?:aahmaahyadi|ithal)|ethal)i|(?:Orðskviðirni|Iz)r|Fjal[eë]t\s*e\s*urta|(?:Mudre\s*izrek|Ordspr[aå]ken|Poslovic|Spr(?:(?:ue|ü)|u)ch)e|பழமொழி\s*ஆகமம்|Ords(?:p(?:rogene)?)?|hi(?:topade[sš]ko|kmā?)|Пр(?:и(?:повісте[ий]|т(?:ч(?:и|і)?)?)?)?|P(?:(?:robver|(?:rov(?:ér|e)|rober))bio|or?verbio)s|Nītimoḻikaḷ|नीति(?:सूत्रें|(?:\s*व|[बव])चन)|سفر\s*الأمثال|நீதிமொழிகள்|P(?:r(?:o(?:v(?:erb(?:e(?:le)?|i)?)?)?|(?:overbi|vb)o|everb(?:io)?|[ií]s(?:lovi)?|verb(?:io)?|z(?:yp?)?|vb?)?|r[ií]sloví|ř(?:[ií]s(?:lov[ií])?)?|[eé]ld|an|w)|नीति(?:सूत्रे)?|हितोपदेश(?:को)?|Prypovisti|Π(?:αροιμ[ίι](?:αι|ες)|ρμ)|n[iī]tis[uū]tre|П(?:ословиц|риказк)и|O(?:roverbs|kv)|Am(?:\s*(?:thal[es]|sale)|thal(?:eh|[ls])|sal)|a(?:['’]mthāli|ms̱?āl)|kahāutāṃ|ହିତୋପଦେଶ|Am(?:\s*(?:th|s)al|thale?)|a['’]mthāl?|箴(?:言(?:\s*知恵の泉|》)|》)|ام(?:ث(?:ل(?:اء?ل|[له])|الل)|صل)|(?:Am(?:th(?:a[ae]|e)|saa)|Sn)l|ส(?:ุภาษิต|ภษ)|الأمثال|ਕਹਾਉ(?:ਂਤਾ|ਤਾਂ)|ام(?:ث(?:ل(?:اء?)?|ال|ا)?)?|Изрек[еи]|פתגמים|(?:ام(?:ث(?:اا|آ)|صا)|مث)ل|امثـال|(?:اَ|أ)مثال|משלים|ﺃﻣﺜﺎﻝ|M(?:aah|ith|eth|it)|Diar|Châm|Мудр|משלי|நீதி|格言の書|《箴言?》|நீமொ|Kaw|《箴言?|箴言?|잠언|格|잠))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Wis"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Cartea\s*[iî]n[tţ]elepciunii\s*lui\s*Solomon|Книга\s*(?:Прем(?:ъдрост\s*Соломонов|удрості\s*Соломон)а|Мудрост\s*Соломонова|на\s*мъдростта|Мудрости)|(?:Ang\s*Karunungan\s*ni\s*S[ao]lom[oó]|Karunungan\s*ni\s*S[ao]lom[oó]|Khôn\s*Ngoa|S[ao]lomó)n|[IÎ]n[tț]elepciunea\s*lui\s*Solomon|Прем(?:удорсти\s*Соломонове|ъдрост\s*на\s*Соломон|\s*Сол)|De\s*wijsheid\s*van\s*Salomo|Het\s*boek\s*der\s*wijsheid|(?:The\s*Wis(?:d?om|d?)\s*of|Doethineb|Wis(?:d(?:om)?\s*|\s*)of|Wisom\s*of)\s*Solomon|Премъдрост\s*Соломонова|(?:M(?:oudrost\s*[SŠ]alomounov|[aą]dro[sś][cć]\s*Salomon)|Sabidur[ií])a|Sa(?:pienza\s*di\s*Salomon|lamon\s*b[oö]lcsess[eé]g)e|Sabedoria\s*de\s*Salom[aã]o|K(?:ebij(?:aksanaan)?\s*|awicaksanan\s*)Salomo|Cartea\s*[IÎ]n[tț]elepciunii|Премудр(?:ости|ість)\s*Соломона|S(?:a(?:pientia\s*Salomoni|lomon\s*viisau)|peki\s*Sal[oó]mon)s|Мудрости\s*Соломонове|Wijsheid\s*van\s*Salomo|(?:Hekima\s*ya\s*Solomon|K(?:s(?:i[eę]g[ai]\s*M[aą]dro[sś]c|\.\s*M[aą]dro[sś]c|\s*M[aą]dro[sś]c)|n(?:iha\s*Mo|jiga\s*M)udrost))i|Sagesse\s*de\s*Salomon|Kaalam\s*ni\s*Solomon|Weisheit\s*Salomos|Σοφ[ίι]α\s*Σ(?:ολομ[ωώ]ντος|αλωμ[ωώ]ντος)|Liber\s*Sapientiae|K(?:niha\s*moudrost[ií]|lm\s*Sol)|Vi(?:isauden\s*kirja|s(?:domm|het)ens\s*bok)|சாலமோனின்\s*ஞானம்|S(?:alomos\s*(?:Visdom|vishet)|b)|Visdommens\s*Bog|K(?:eb(?:ijaksanaan)?|a(?:wicaksanan|r(?:unungan)?))|Hikmat\s*Salomo|حكمة\s*سليمان|Прем(?:ъдрост)?|B[oö]lcsess[eé]g|سفر\s*الحكمة|Sa(?:b(?:edoria)?|p(?:ien(?:t(?:ia)?|za))?|gesse|lomon)|Vi(?:s(?:d(?:ommen)?|h(?:eten)?)|is)|Σοφ(?:[ίι]α(?:\s*Σολ)?)?|חכמת\s*שלמה|M(?:oudrost|ud(?:rost|r?)|úd(?:rost)?|[aą]dr)|W(?:i(?:jsheid|s(?:d(?:om)?)?)|eish(?:eit)?)|Муд(?:рости)?|M(?:udros(?:ti|ť)|údros(?:ti|ť)|dr)|ソロモンの(?:知恵書|智慧)|ஞானாகமம்|ปรีชาญาณ|Hek(?:ima)?|الحكمة|B[oö]lcs|《智慧篇》|《智慧篇|SSal|சாஞா|智慧篇》|知恵の書|智慧篇|지혜서|知恵?|حك|지혜))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Joel"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:ଯୋୟେଲ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:(?:на\s*пророк|пророка)\s*Иоиля|на\s*пророк\s*Иоил)|нига\s*(?:пророка\s*[ИЙ]оі|[ИЙ]оі)ла|њига\s*пророка\s*Јоила)|Pro(?:roctwo\s*Ioelowe|phetia\s*Ioel)|योएलको\s*पुस्तक|Joelin\s*kirja|(?:Ks(?:i[eę]g[ai]\s*Joe|\.?\s*Joe)|Yuu77ee)la|Liv\s*Jow[eè]l\s*la|J(?:o(?:el(?:s\s*(?:Bog|bok)|a)|ël)|l)|سفر\s*يوئيل|یو(?:ئ(?:ی(?:یل(?:یہ|[ـلهہ])|ل(?:ی[هہی]|[ـلهہ])|ئل[لی])|ئی(?:یلـ|ل[ـلهی])|ل)|وئیلل)|یو(?:ئ(?:ی(?:یلی?|لی?|ئل)|ئیی?ل)?|وئیل)|(?:Y(?:o(?:o(?:['’]e[ei]|e[ai]|i)|ei|ë)|uoi|ōvē)|Yoo['’]i[ei]|J(?:o(?:e[ai]|w[eè]|[iéï])|ó[eé])|yōʾī|Io[ei])l|ی(?:و(?:(?:وئی)?ی|ای)|ُوای)ل|Jo(?:e(?:l(?:in?)?)?|ë)|Y(?:oo(?:['’]e|e?)l|l)|Giô-?ên|yū['’]īli|யோவேல்|(?:Yoo?a|Jo['a’]|yo)el|(?:Gioel|Y(?:ol|u7))e|yū['’]īl|ଯୋୟେଲ|Yoeli|Иоил[ья]|Ио[ії](?:ла|н)|Йо(?:[ії](?:ла|н)|ил)|(?:《?岳厄爾|《?約珥書|《?珥)》|《?约[珥饵]书》|โยเอล|よえるしょ|يوئيل|Gioe|Yoel|Иоил|Ио[ії]л|Йо[ії]л|《?岳厄爾|《?約珥書|《?约[珥饵]书|योएल|யோவே|Ј(?:ои[лљ]|л)|(?:Ιω[ήη]|Ἰ)λ|Јоел|יואל|ヨエル書|[ਜਯ]ੋਏਲ|Yoe|ヨエル|يوء|요엘서|ยอล|요엘|《?珥|Ιλ|욜))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["GkEsth"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Est(?:er\s*enligt\s*den\s*grekiska\s*texte|Yu)n|Книга\s*Естир\s*\(според\s*Септуагинта\)|Es(?:zter\s*k[oö]nyv[eé]nek\s*kieg[eé]sz[ií]t[eé]se|t(?:er\s*(?:[rř]eck[eé]\s*dodatky|Gri?yego|Gr(?:iego|(?:eg[ao]|ik))|gr(?:ieg|ec)o|\(Gr\))|er\s*[rř]eck[eé]\s*[cč][aá]sti|er\s*Yunani|her\s*[Gg]rec|\.\s*Yunani|\s*Yunani|g))|Kr(?:eikkalainen\s*Esterin\s*kirja|\.?\s*Est)|Естир\s*\(според\s*Септуагинта\)|G(?:r(?:(?:ecke\s*[cč]asti\s*knihy\s*Ester|écke\s*[cč]asti\s*knihy\s*Ester|(?:aeca|eek)\s*Esther)|\s*Esth)|k\s*Esth)|Den\s*greske\s*Ester-?bok(?:en|a)|(?:Est(?:er\s*\((?:versione\s*greca|řecké\s*(?:dodatky|části)|Gr(?:(?:ie(?:chisch|ks)|eg[ao])|iego)|Gri?yego|gr(?:ieg|ec)o|grega)|her\s*\((?:Gre(?:ek|c)|grec)|\s*\(Gr)|எஸ்(?:தர்\s*\(கிரேக்கம்|\s*\(கி))\)|Kreikkalainen\s*Esterin|Est(?:er(?:arb[oó]k\s*hin\s*gr[ií]sk|\s*greg)|her\s*graec)a|Дополнения\s*к\s*Есфири|Εσθ[ήη]ρ\s*στα\s*ελληνικ[άα]|תוספות\s*למגילת\s*אסתר|எஸ்தர்\s*\(கி\)|G(?:r(?:eek\s*Esth?|\s*Est)|k\s*Est)|Est(?:her\s*[Gg]r|er\s*[Gg]r|\s*Yun)|Ест\.?\s*Септ|《GkEsth》|《GkEsth|Est(?:h\s*[Gg]|\s*[Gg])r|GkEsth》|에스[겔텔]\s*추가본|エステル(?:書殘篇|記補遺)|GkEsth|GrEst))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ଯୂନସ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*Иона|пророка\s*(?:Ион[иы]|Йони))|њига\s*пророка\s*Јоне)|Pro(?:roctwo\s*Ionaszow|phetia\s*Iona)e|(?:Ks(?:i[eę]g[ai]\s*Jonasz|\.?\s*Jonasz)|Jo(?:onan\s*kirj|nasz)|Yoonaas|Gi(?:ô-?|o)n)a|योनाको\s*पुस्तक|Liv\s*Jonas\s*la|J(?:o(?:n(?:a(?:s(?:['’]\s*Bog|[es])|s?\s*bok|š)|á[hsš])|onas)|n[hs])|سفر\s*يونان|(?:Yoones|Jonah)s|ی(?:و(?:ون(?:یی?س|(?:[او])?س)|ن(?:سسی|اسی|س[ـهہی]|یس|[شص])|ن(?:ی[ای]|[وُ])س)|ُون(?:ا[سہ]|س))|J(?:o(?:onan?|n(?:as?|á)?)|ón)|Yoones|Y(?:o(?:onas|na)|ōṉā|n)|(?:Y(?:o(?:oni|un[ai]|nu)|un[aiu])|J(?:o(?:o?ni|una)|ón[aá]))s|โยนาห์|Jonah|یون(?:سس|اس|س)?|Ionas|y(?:ūn(?:as|āh)|on[aā])|Ι(?:ων[άα]ς|ν)|(?:《?約(?:拿書|納)|《?拿)》|《?约拿书》|ਯੂਨਾਹ|يونان|Yoo?n|Iona|《?約(?:拿書|納)|《?约拿书|योना|ଯୂନସ|Јона|Ион[аиы]|Йон[аи]|ヨナ(?:しょ|書)|Юнус|יונה|யோனா|Gio|Јон|Ион|Йон|يون|요나서|ยนา|ヨナ|요나|《?拿|Ἰν|욘))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Nah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:نا\s*حُوم|Na-?h[uâ]m)|(?:ନାହୂମ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*Наума?|пророка\s*Наума)|њига\s*пророка\s*Наума)|Pro(?:roctwo\s*Nahumowe|phetia\s*Nahum)|Liv\s*Nawoum\s*lan|Nahumin\s*kirja|Ks(?:i[eę]g[ai]\s*Nahuma|\.?\s*Nahuma)|नहूमको\s*पुस्तक|N(?:a(?:h(?:um(?:s\s*(?:Bog|bok)|[au])|om|úm)|wou[mn]|ahom|ch)|h)|ن(?:اح(?:وم(?:ی(?:ی(?:یه|[ءئه])|ائ[هہ]|ئی|ہ[ئاه]|[ءةهۂ])|ائ[هہ]|وو|ئی|ہ[ئاه]|[ءةـهۂ])|م)|حوم)|سفر\s*ناحوم|Naahooma|N(?:a(?:h(?:u(?:m(?:in?)?)?|o|ú)?|w|x)?|áh)|ن(?:ا(?:ح(?:و(?:م(?:ی(?:ئ|ہ|ی)?|ا|و|ئ|ہ)?)?)?)?|حو)|(?:N(?:(?:a(?:aho?u|h(?:o[ou]|uu)|u)|áhu)|ākū)|n(?:ah[uū]|āḥū))m|Nahumme|nāhūmi|நாகூம்|Naxuum|ناحووم|ناحُوم|nāhūm?|ନାହୂମ|Ναο[υύ]μ|น(?:าฮู|ฮ)ม|ナホム(?:しょ|書)|《?那(?:鴻[书書]|鸿书)》|Наума|《?那(?:鴻[书書]|鸿书)|नहूम|நாகூ|Наум|נחום|(?:《?納鴻|《[鴻鸿]|[鴻鸿])》|ਨਹੂਮ|ナホム|《?納鴻|나훔서|나훔?|Να|《[鴻鸿]|Нм|[鴻鸿]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(Første\s*Johannes'\s*Brev|(?:П(?:(?:ърво\s*съборно\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Иоана\s*Богослов|\s*ап\.?\s*Иоана\s*Богослов)|рва\s*посланица\s*Јованов)а|ерш[ае]\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанна|(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))ана|[ИЙ]оаново|Іоанна|Іоана)|рв(?:а\s*п(?:ослание\s*на|исмо\s*од)\s*апостол\s*Јов|о\s*п(?:ослание\s*на|исмо\s*од)\s*апостол\s*Јов)ан|ърво\s*послание\s*на\s*[ИЙ]оан|рва\s*Ј(?:ованов[ао]|н)|(?:рво\s*Јовано|ърв(?:а\s*[ИЙ]оано|о\s*[ИЙ]оано))во)|1-?(?:ше|а)\.\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанна|(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))ана|[ИЙ]оаново|Іоанна|Іоана)|(?:1(?:-?е\.?\s*с|\.?\s*с)|I\.?\s*с)оборне\s*послання\s*св\.?\s*апостола\s*Іоанна|1-?(?:ше|а)\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанна|(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))ана|[ИЙ]оаново|Іоанна|Іоана)|(?:Fyrsta\s*br[eé]f\s*J[oó]hannesar\s*hið\s*almenn|(?:P(?:er[sš]e\s*poslannja\s*apostola\s*Iva|ierwsz[aey]\s*(?:List\s*(?:[sś]w\.?\s*J|J)|J)a)|(?:1\.?\s*L|I\.?\s*L)ist\s*(?:[sś]w\.?\s*J|J)a)n|Prv(?:a\s*Ivanova\s*[Pp]oslanic|n[ií]\s*Janov)|(?:1\.?\s*Ivanova\s*P|I\.?\s*Ivanova\s*P)oslanic|Koiro\s*Yohaannis|Avval\s*Yoohann|(?:AvvalY|Yek\s*?Y|۱\s*?Y)oohann|اول\s*?Yoohann|1\.?\s*Yooxana|I\.?\s*Yooxana|1\.\s*Yoohann|1\s*Yoohann|1Yoohann|1\s*Yahy)a|Y(?:ōvaṉ\s*Eḻutiya\s*Mutalāvatu\s*Nirupam|o(?:oxanaa\s*Kowaad|hane\s*I))|(?:Ensimm[aä]inen\s*Johanneksen\s*kirj|(?:1\.?\s*Johannek|I\.?\s*Johannek)sen\s*kirj)e|யோவ(?:ான்\s*(?:எழுதிய\s*முதல(?:்\s*திருமுக|ாம்\s*கடித)|முதல்\s*திருமுக)|ன்\s*எழுதிய\s*முதலாவது\s*நிருப)ம்|(?:(?:1\.?\s*послание\s*на|(?:1\.?\s*пи|I\.?\s*пи)смо\s*од)|I\.?\s*послание\s*на)\s*апостол\s*Јован|(?:(?:1(?:-?е\.?\s*посланн|\.?\s*посланн)|I\.?\s*посланн)я\s*апостола\s*Ів|(?:(?:(?:1(?:-?е\.?\s*П|\.?\s*П)|I\.?\s*П)ослання\s*І[во]|1(?:-?е\.?\s*Иох|(?:-?я|[ея])\.?\s*Иох|\.?\s*Иох)|(?:1(?:-?е\.?\s*І|\.\s*І)|I\.?\s*І)в)|1\s*Ів))ана|א(?:גרתו\s*הראשונה\s*של\s*יוחנן\s*השליח|יגרת\s*יוחנן\s*הראשונה)|אגרתו\s*הראשונה\s*של\s*יוחנן\s*השלי|Waraka\s*wa\s*Kwanza\s*wa\s*Yohane|Prim(?:(?:a\s*lettera\s*di|o)\s*Giovanni|a\s*Giovanni|eir[ao]\s*Jo[aã]o)|(?:رسالة\s*القديس\s*)?يوحنا\s*الأولى|Barua\s*ya\s*Kwanza\s*ya\s*Yohane|y(?:ū(?:ḥannā\s*kā\s*pahlā\s*ʿām\s*ḫaṭ|h(?:ãnā\s*dī\s*pahilī\s*pattrī|ann[aā]ko\s*pahilo\s*patra))|oh[aā]n[aā]ce[mṃ]\s*pahile\s*patra|uhann[aā]ko\s*pahilo\s*patra)|E(?:nsimm[aä]inen\s*Johanneksen|erste\s*Joh)|F(?:yrsta\s*br[eé]f\s*J[oó]hannesar|ørste\s*Joh(?:annes)?|irst\s*J(?:oh?|h))|ی(?:ُوحنّا\s*کا\s*پہلا\s*عام\s*خط|وحنّا\s*کا\s*پہلا\s*عام\s*خط|وحنا\s*کا\s*پہلا\s*عام\s*خط|ک(?:\s*یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])))|ਯੂਹੰਨਾ\s*ਦੀ\s*ਪਹਿਲੀ\s*ਪੱਤ੍ਰੀ|Johannes(?:’\s*første\s*b|\s*f[oö]rsta\s*b)rev|(?:Johannes(?:'\s*(?:Første|1\.)|’\s*(?:Første|1\.))|1(?:\.\s*Johannes['’]|\s*Johannes['’]))\s*Brev|F(?:ørste\s*Johannes(?:’\s*B|b)rev|yrsta\s*J[oó]hannesarbr[eé]f|[oö]rsta\s*Johannesbrevet|irst\s*J(?:oh[mn]|h?n))|(?:(?:1\.?\s*посланиц|I\.?\s*посланиц)а\s*Јованов|1(?:-?е\.?\s*Иоанн|\.?\s*Иоанн)|(?:1(?:-?е\.?\s*І|\.\s*І)|I\.?\s*І)оанн|1\s*Іоанн)а|1(?:(?:-?е\.?\s*послани|\.?\s*послани)е\s*И|(?:-?я|[ея])\.?\s*послание\s*И)оанна|य(?:ूहन्नाको\s*पहिलो|ोहानाचें\s*पहिले)\s*पत्र|E(?:pistula\s*I\s*Ioannis|(?:erste\s*Johanne|rste(?:[nrs])?\s*Johanne|ls[oő]\s*J[aá]no)s|ls[oő]\s*Jn)|(?:(?:Epistula\s*)?Ioannis|J[aá]nos)\s*I|Ιω(?:αννου\s*(?:Επιστολη\s*Α|Α['ʹʹ΄’])|άννου\s*Α['ʹʹ΄’])|رسالة\s*يوحنا\s*الأولى|ଯୋହନଙ୍କ\s*ପ୍ରଥମ\s*ପତ୍ର|(?:1(?:\.\s*(?:Johannesbreve|Gjoni)|\s*(?:Johannesbreve|Gjoni)|\s*[ei]\.?\s*Gjoni)|Prv[yý]\s*J[aá]nov\s*lis)t|(?:Mutalāvatu\s*யோவான|முதலாவது\s*யோவான|1(?:\s*(?:அருளப்பர|யோவான)|\.\s*யோவான))்|(?:Prv(?:n[ií]\s*(?:list\s*Jan[uů]|Jan[uů])|[aá]\s*kniha\s*J[aá]no|[yý]\s*list\s*J[aá]no|[aá]\s*J[aá]no)|(?:1\.?\s*l|I\.?\s*l)ist\s*Jan[uů]|1\s*k\.\s*J[aá]no|1\s*k\s*J[aá]no|1\.?\s*Jan[uů]|I(?:\.\s*Jan[uů]|\s*Jan[uů]))v|Johannes['’]\s*1\s*Brev|(?:Primer(?:o\s*(?:San\s*J[au][au]|J[au][au])|\s*(?:San\s*J[au][au]|J[au][au]))|(?:Prem(?:i(?:eres?\s*Je|ères?\s*Je|ers?\s*Je)|ye\s*J)|1\.?\s*Yokan|I(?:\.\s*(?:Yokan|Je)|\s*(?:Yokan|Je))|1(?:(?:ere?|re)|ère)\.\s*Je|1(?:(?:ere?|re)|ère)\s*Je|1\.?\s*Je)a|1(?:\.[oº]|º)\.\s*(?:San\s*J[au][au]|J[au][au])|(?:1(?:o\.?\s*S|\.?\s*S)|I\.?\s*S)an\s*J[au][au]|1(?:\.[oº]|º)\s*(?:San\s*J[au][au]|J[au][au])|First\s*J(?:h[ho]|oo)|Una(?:ng)?\s*Jua|1st\.\s*J(?:h[ho]|oo)|1\.?\s*Gioa|I(?:\.\s*(?:Gioa|J(?:oo|a[au]))|\s*(?:Gioa|J(?:oo|a[au])))|(?:1(?:o(?:\.\s*J[au]|\s*J[au])|\.?\s*Ju)|I\.?\s*Ju)[au]|1st\s*J(?:h[ho]|oo)|1(?:\.\s*Joo|\s*(?:Joo|Yh))|1\.?\s*Ja[au]|(?:1\.?\s*Jh|I\.?\s*Jh)[ho])n|1(?:\.\s*(?:J(?:o(?:h(?:annes(?:brev)?)?)?)?|यूहन्ना|Иоан)|\s*(?:(?:(?:J(?:o(?:h(?:annes(?:brev)?)?)?)?|(?:योहान|யோ(?:வா)?|Yoh|Gj|Iv|Ів))|Иоан)|यूहन्ना)|Yoh)|Avval\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|(?:1\.?\s*Johannek|I\.?\s*Johannek)sen|(?:AvvalY|Yek\s*?Y|۱\s*?Y)(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Avval\s*Y(?:o(?:ohana|hann?a)|uhann?a)|avval\s*yohannā|Kwanza\s*Yohan[ae]|او(?:ل(?:\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|ّل(?:(?:\s*یُوحنّ|(?:\s*یوحنّ|۔یوحن))|-?یُوحنّ)ا)|(?:Avval\s*?|اول\s*)یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|رسالة\s*يوحنا\s*1|הראשונה\s*יוחנן|Prv(?:a\s*Ivanova|[yý]\s*J[aá]nov|n[ií]\s*J(?:an)?)|(?:AvvalY|Yek\s*?Y|۱\s*?Y)(?:o(?:ohana|hann?a)|uhann?a)|(?:Avval\s*?|اول\s*)یو[حه]ناء?|1(?:\.\s*(?:य(?:ूहन्नाको|ुहत्रा|ोहन)|ยอห์น|J(?:oh[mn]|n))|\s*(?:(?:(?:(?:(?:yoh[aā]n[aā]ce[mṃ]|योह(?:ानाच|न)|ਯੂਹੰਨਾ|Yōvaṉ|Gv|In|Ин|Йн|يو|ยน)|J(?:oh[mn]|n))|युहत्रा)|यूहन्नाको)|ยอห์น)|요한)|1e\.?\s*Johannes|(?:1(?:\.\s*(?:y[uū]hann[aā]k|Jo[aã])|\s*(?:(?:yūhann[aā]k|Jo[aã])|yuhann[aā]k))|I(?:\.\s*Jo[aã]|\s*Jo[aã])|avvly)o|1°\.\s*Giovanni|(?:1(?:(?:-?е\.?\s*Иоано|\.?\s*Иоано)|\s*Йоано)|(?:1\.\s*Й|I(?:\.\s*[ИЙ]|\s*[ИЙ]))оано)во|1-?е\.?\s*Йоаново|اول(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a)|یو)|I(?:\.\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|áno[sv]|n)|Yohan(?:es|a)|Giăng|In)|\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|áno[sv]|n)|Yohan(?:es|a)|Giăng|In))|(?:1\.?\s*Giov|I\.?\s*Giov)anni|1°\s*Giovanni|(?:First\s*Jo?p|1st\.\s*Jo?p|1st\s*Jo?p|1(?:\.\s*Jo?p|\s*Jo?p)|I(?:\.\s*Jo?p|\s*Jo?p))hn|(?:1\s*Yoo?|1Yoo)hanaah|(?:1\.?\s*Ј|I\.?\s*Ј)(?:ованов[ао]|н)|1(?:-?я|[ея])\.?\s*Иоанна|ପ୍ରଥମ\s*ଯୋହନଙ|1\.\s*I(?:vanova|oan)|I(?:\.\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Gi)|\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Gi))|Kwanza\s*Yoh|П(?:рв[ао]\s*Јован|ърв(?:а\s*[ИЙ]оан|о\s*[ИЙ]оан))|1\.\s*Yohan(?:es|a)|(?:1\.?\s*Ioann|I\.?\s*Ioann)is|(?:First\s*Jon|1st\.\s*Jon|1st\s*Jon|1(?:\.\s*J(?:on|ó)|\s*J(?:on|ó))|I(?:\.\s*J(?:on|ó)|\s*J(?:on|ó)))h|1\s*Yohannah|1\s*?Yuhan[an]ah|(?:1\.|[1۱])\s*یُوحنّا|(?:1\.|۱)-?یُوحنّا|(?:1(?:-?е\.?\s*І|\.\s*І)|I\.?\s*І)оана|(?:اولیو[حه]|1\s*?یوه|۱\s*?یوه)ن(?:ا(?:ءه|[ته])|[آةهىی])|ﻳﻮﺣﻨﺎ\s*ﺍﻻﻭﻝ|1\s*Ivanova|1\.\s*Yoh(?:ane)?|(?:1\s*Yoo?|1Yoo)hana|1\s*Yohanna|1\s*?Yuhann?a|(?:اولیو[حه]|1\s*?یوه|۱\s*?یوه)ناء?|یک(?:\s*یو[حه]ناء?|یو[حه]ناء?)|Ιωαννου\s*Α|1\.?\s*Jan(?:o(?:va|s)|a)|1\s*Yohanes|요(?:한(?:의\s*첫째\s*서간|[1일]서)|일)|1st\.\s*J(?:oh[mn]|h?n)|Α['ʹʹ΄’]\s*(?:Ιω[άα]ννη|᾿Ιω)|AvvalJohn|1Yohan[an]ah|1\.\s*یوحنّا|1-?یُوحنّا|(?:1\s*?یوحنا|۱\s*?یوحنا)(?:ءه|[ته])|ヨハネの(?:第一の(?:手紙|書)|手紙[Ⅰ一])|1\.?\s*Jan(?:ov)?|1\s*Yohane|1st\.\s*J(?:oh?|h)|1Yohann?a|(?:1\.?\s*Ј|I\.?\s*Ј)ован|(?:1\s*?یوحنا|۱\s*?یوحنا)ء?|1\.?\s*Jáno[sv]|1\.?\s*Giăng|1\s*yūhãnā|1o\.?\s*Jo[aã]o|1a\.\s*Jo[aã]o|1st\s*J(?:oh[mn]|h?n)|(?:[1۱]\s*یوحنّ|(?:1\.?۔|۱۔)یوحن)ا|1\.?\s*ଯୋହନଙ|1\.?\s*Yoox|1e\.\s*Joh|1st\s*J(?:oh?|h)|(?:1\.\s*Й|I(?:\.\s*[ИЙ]|\s*[ИЙ]))оан|1\s*یوحن[آةهىی]|۱(?:\s*یوحن[آةهىی]|یوحن[آةهىی]|yohn)|1a\s*Jo[aã]o|1\s*Іоана|1\s*Ioan|1e\s*Joh|1\s*Йоан|1یوحن[آةهىی]|(?:1\.?\s*Jh|I\.?\s*Jh)n|(?:《(?:约(?:翰[一壹]书|壹)|約壹)|《?伊望第一|约(?:翰[一壹]书|壹)|約壹)》|(?:《約翰[一壹]|約翰[一壹])書》|《?若望一書》|1\.?\s*Gi|1یو(?:حن?)?|۱(?:یو(?:حن?)?|yoh?)|1\.?\s*Jh|I\.?\s*Jh|Α['ʹʹ΄’]\s*Ιω|《(?:约(?:翰[一壹]书|壹)|約壹)|《?伊望第一|(?:《約翰[一壹]|約翰[一壹])書|《?若望一書|1\.\s*In|1yohn|1John|Ⅰ\s*ヨハネ|1yoh?|约(?:翰[一壹]书|壹)|1ヨハネ|一ヨハネ|約壹))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Второ\s*съборно\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Иоана\s*Богослов|\s*ап\.?\s*Иоана\s*Богослов)|2-?(?:ге|а)\.\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанн|(?:(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))а|Іоан)н)|Друг(?:а\s*соборне\s*послання\s*св\.?\s*апостола\s*Іоанн|е\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанн|(?:(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))а|Іоан)н)|(?:(?:а\s*послання\s*апостола\s*Ів|а\s*(?:Послання\s*І[во]|Ів))а|а\s*Іоан)н)|(?:2(?:-?е\.?\s*с|\.?\s*с)|II\.?\s*с)оборне\s*послання\s*св\.?\s*апостола\s*Іоанн|2-?(?:ге|а)\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанн|(?:(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))а|Іоан)н)|(?:(?:2(?:-?е\.?\s*посланн|\.?\s*посланн)|II\.?\s*посланн)я\s*апостола\s*Ів|(?:(?:(?:2(?:-?е\.?\s*П|\.?\s*П)|II\.?\s*П)ослання\s*І[во]|2(?:-?е\.?\s*Иох|(?:-?я|[ея])\.?\s*Иох|\.?\s*Иох)|(?:2(?:-?е\.?\s*І|\.\s*І)|II\.?\s*І)в)|2\s*Ів))ан|(?:Друга\s*(?:посланица\s*)?Јован|(?:II\.?\s*посланиц|2\.?\s*посланиц)а\s*Јован)ов|2(?:(?:-?е\.?\s*послани|\.?\s*послани)е\s*И|(?:-?я|[ея])\.?\s*послание\s*И)оанн|2(?:(?:-?е\.?\s*Иоанн|\.?\s*Иоанн)|\s*Іоанн)|(?:2(?:-?е\.?\s*І|\.\s*І)|II\.?\s*І)оанн|2(?:-?я|[ея])\.?\s*Иоанн)а|Y(?:ōvaṉ\s*Eḻutiya\s*Iraṇṭāvatu\s*Nirupam|ooxanaa\s*Labaad)|யோவ(?:ான்\s*(?:எழுதிய\s*இரண்டாம்\s*(?:திருமுக|கடித)|இரண்டாம்\s*திருமுக)|ன்\s*எழுதிய\s*இரண்டாவது\s*நிருப)ம்|Втор(?:а\s*послание\s*на\s*апостол\s*Јован|о\s*(?:п(?:(?:ослание\s*на\s*апостол\s*Јов|ослание\s*на\s*[ИЙ]о)|исмо\s*од\s*апостол\s*Јов)ан|(?:Јов|[ИЙ]о)аново)|а\s*писмо\s*од\s*апостол\s*Јован|(?:а\s*Јов|а\s*[ИЙ]о)аново)|(?:Dru(?:he\s*poslannja\s*apostola\s*Ivan|g(?:a\s*(?:(?:Ivanova\s*[Pp]oslanic|Jan)|List\s*(?:[sś]w\.?\s*Jan|Jan))|i\s*(?:List\s*(?:[sś]w\.?\s*Jan|Jan)|Jan)))|(?:II\.?\s*Ivanova\s*P|2\.?\s*Ivanova\s*P)oslanic|Naa77antto\s*Yohaannis|(?:II\.?\s*L|2\.?\s*L)ist\s*(?:[sś]w\.?\s*Jan|Jan)|(?:Do(?:vom\s*?Y|\s*?Y)|۲Y)oohann|II\.?\s*Yooxana|دوم\s*?Yoohann|2\.?\s*Yooxana|2\.\s*Yoohann|2\s*Yoohann|۲\s*Yoohann|2Yoohann|2\s*Yahy)a|(?:II\.?\s*послание\s*н|2\.?\s*послание\s*н)а\s*апостол\s*Јован|Se(?:cond(?:(?:a\s*lettera\s*di|o)\s*Giovanni|a\s*Giovanni|\s*J(?:oh[mn]|h?n))|gund(?:o\s*(?:San\s*J[au][au]n|Jo[aã]o|J[au][au]n)|a\s*Jo[aã]o)|cond\s*J(?:o?ph|h[ho]|oo)n)|א(?:גרתו\s*השנייה\s*של\s*יוחנן\s*השליח|יגרת\s*יוחנן\s*השנייה)|(?:II\.?\s*пи|2\.?\s*пи)смо\s*од\s*апостол\s*Јован|(?:رسالة\s*القديس\s*)?يوحنا\s*الثانية|y(?:ū(?:ḥannā\s*kā\s*dūsrā\s*ʿām\s*ḫaṭ|h(?:ann[aā]ko\s*dostro\s*patra|ãnā\s*dī\s*dūjī\s*pattrī))|uhann[aā]ko\s*dostro\s*patra|oh[aā]n[aā]ce[mṃ]\s*dusre\s*patra)|(?:Toinen\s*Johannek|(?:II\.?\s*Johannek|2\.?\s*Johannek))sen\s*kirje|Waraka\s*wa\s*Pili\s*wa\s*Yohane|Barua\s*ya\s*Pili\s*ya\s*Yohane|ی(?:ُوحنّا\s*کا\s*دوسرا\s*عام|وحن(?:ا\s*کا\s*دوسرا\s*عام|ّا\s*کا\s*دوسرا))\s*خط|य(?:ूहन्नाको\s*दोस्(?:त्)?रो\s*पत्र|ोहानाचें\s*दुसरे\s*पत्र)|An(?:nað\s*(?:br[eé]f\s*J[oó]hannesar|J[oó]hannesarbr[eé]f)|d(?:e(?:n\s*Johannes(?:['’]\s*B|b)|t\s*Johannesb)rev|ra\s*Johannesbrevet))|ਯੂਹੰਨਾ\s*ਦੀ\s*ਦੂਜੀ\s*ਪੱਤ੍ਰੀ|(?:Johannes['’]\s*Andet|2(?:\.\s*Johannes['’]|\s*Johannes['’]))\s*Brev|Johannes(?:’\s*andre|\s*andra)\s*brev|ଯୋହନଙ୍କ\s*ଦ୍ୱିତୀୟ\s*ପତ୍ର|Epistula\s*I(?:I\s*Ioannis|oannis\s*II)|رسالة\s*يوحنا\s*الثانية|T(?:oinen\s*Joh(?:anneksen)?|weede\s*Joh)|Ιω(?:αννου\s*(?:Επιστολη\s*Β|Β['ʹʹ΄’])|άννου\s*Β['ʹʹ΄’])|(?:Druh(?:[aá]\s*(?:kniha\s*J[aá]|Já)no|[aá]\s*(?:list\s*Jan[uů]|Jan[uů])|[yý]\s*(?:list\s*J(?:an[ouů]|áno)|Jan[uů]))|(?:II\.?\s*l|2\.?\s*l)ist\s*Jan[uů]|2\s*k(?:\.\s*J[aá]|\s*J[aá])no|II(?:\.\s*Jan[uů]|\s*Jan[uů])|2\.?\s*Jan[uů])v|(?:2(?:\.\s*(?:Johannesbreve|Gjoni)|\s*(?:Johannesbreve|Gjoni)|\s*[ei]\.?\s*Gjoni)|Druh[yý]\s*J[aá]nov\s*lis)t|(?:Zweite(?:[nrs])?\s*Johanne|(?:Tweede\s*Jo|(?:Andre\s*Jo|2e\.?\s*Jo))hanne|M[aá]sodik\s*J[aá]no)s|Послання\s*до\s*Тита|2(?:\.\s*(?:J(?:o(?:h(?:annes(?:brev)?)?)?)?|यूहन्ना|Иоан)|\s*(?:(?:(?:J(?:o(?:h(?:annes(?:brev)?)?)?)?|(?:योहान|யோ(?:வா)?|Yoh|Gj|Iv|Ів))|Иоан)|यूहन्ना)|Yoh)|(?:II\.?\s*Johannek|2\.?\s*Johannek)sen|(?:Do(?:vom\s*?Y|\s*?Y)|۲Y)(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Anden\s*Joh(?:annes)?|dovvom\s*yohannā|(?:(?:I(?:kalawang\s*Ju|I(?:\.\s*(?:Yokan|Je)|\s*(?:Yokan|Je)))|2\.?\s*Yokan|2(?:e\.?\s*Je|\.?\s*Je))a|De(?:uxi[eè]mes?\s*Jea|zy[eè]m\s*Ja)|2(?:(?:eme|de?)|ème)\.\s*Jea|2nd\.?\s*J(?:o?ph|h[ho]|oo)|II(?:\.\s*(?:Gioa|J(?:oo|a[au]))|\s*(?:Gioa|J(?:oo|a[au])))|2(?:(?:eme|de?)|ème)\s*Jea|(?:II(?:\.\s*Jo?p|\s*Jo?p)|DovomJo|2(?:\.\s*Jo?p|\s*Jo?p)|2Jo)h|2\.?\s*Gioa|(?:II\.?\s*Jh|2\.?\s*Jh)[ho]|2(?:\.\s*Joo|\s*(?:Joo|Yh))|2\.?\s*Ja[au])n|Dru(?:ga\s*Ivanova|h(?:[aá]\s*J(?:an(?:ov)?)?|[yý]\s*J(?:an(?:ov)?|ánov)?))|(?:Do(?:vom\s*?Y|\s*?Y)|۲Y)(?:o(?:ohana|hann?a)|uhann?a)|(?:2(?:(?:\.[oº]|º)\.?\s*S|\.?\s*S)|II\.?\s*S)an\s*J[au][au]n|Dovom\s*?یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|دو(?:م(?:(?:\s*(?:Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|یوحن[آةهىی])|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|\s*یُوحنّا|-?یُوحنّا|(?:\s*یوحنّ|۔یوحن)ا)|\s*یوحنا(?:ءه|[ته]))|م(?:\s*یوه|یو[حه])ن(?:ا(?:ءه|[ته])|[آةهىی])|\s*یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی]))|(?:2-?(?:ге|а)\.\s*[ИЙ]оано|Друг(?:а\s*[ИЙ]оано|е\s*[ИЙ]оано)|2(?:-?е\.?\s*Иоано|\.?\s*Иоано)|2-?е\.?\s*Йоано|2-?(?:ге|а)\s*[ИЙ]оано)во|رسالة\s*يوحنا\s*2|ଦ୍ୱିତୀୟ\s*ଯୋହନଙ|Dovom\s*?یو[حه]ناء?|2(?:\.\s*(?:य(?:ूहन्नाको|ुहत्रा|ोहन)|ยอห์น|J(?:oh[mn]|n))|\s*(?:(?:(?:(?:(?:yoh[aā]n[aā]ce[mṃ]|योह(?:ानाच|न)|ਯੂਹੰਨਾ|Yōvaṉ|Gv|In|Ин|Йн|يو|ยน)|J(?:oh[mn]|n))|युहत्रा)|यूहन्नाको)|ยอห์น)|요한)|II(?:\.\s*(?:J(?:oh(?:annes|[mn])|an(?:os|a)|áno[sv]|n)|Ј(?:ованов[ао]|н)|Yohan(?:es|a)|Giăng|In)|\s*(?:J(?:oh(?:annes|[mn])|an(?:os|a)|áno[sv]|n)|Ј(?:ованов[ао]|н)|Yohan(?:es|a)|Giăng|In))|Druh(?:[aá]|[yý])\s*Janova|(?:II\.?\s*Giov|2\.?\s*Giov)anni|2°\.\s*Giovanni|(?:2(?:\.\s*(?:y[uū]hann[aā]k|Jo[aã])|\s*(?:(?:yūhann[aā]k|Jo[aã])|yuhann[aā]k))|II(?:\.\s*Jo[aã]|\s*Jo[aã])|dovvomy)o|2o\.\s*(?:San\s*J[au][au]n|Jo[aã]o|J[au][au]n)|השנייה\s*יוחנן|II(?:\.\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|Јован|J(?:oh?|an)?|Gi)|\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|Јован|J(?:oh?|an)?|Gi))|دو(?:م(?:(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a)|یو)|\s*یوحناء?)|م(?:\s*یوه|یو[حه])ناء?|\s*یو[حه]ناء?|یو[حه]ناء?)|Втор(?:(?:а\s*Јов|а\s*[ИЙ]о)ан|о\s*(?:Јов|[ИЙ]о)ан)|2\.?\s*Ј(?:ованов[ао]|н)|Pili\s*Yohan[ae]|2°\s*Giovanni|2o\s*(?:San\s*J[au][au]n|Jo[aã]o|J[au][au]n)|(?:Second\s*Jon|2nd\.?\s*Jon|II(?:\.\s*J(?:on|ó)|\s*J(?:on|ó))|2(?:\.\s*J(?:on|ó)|\s*J(?:on|ó)))h|(?:2\s*Yoo?|2Yoo)hanaah|۲\s*(?:Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|یوحن[آةهىی])|2-?(?:ге|а)\.\s*Іоана|Друг(?:а\s*(?:Іоана|Јн)|е\s*Іоана)|(?:II\.?\s*Ioann|2\.?\s*Ioann)is|(?:(?:II(?:\.\s*[ИЙ]|\s*[ИЙ])|2\.\s*Й)|2\s*Й)оаново|2\s*(?:அருளப்பர|யோவான)்|2\.\s*I(?:vanova|oan)|Second\s*J(?:oh?|h)|2\.\s*Yohan(?:es|a)|(?:II\.?\s*Janov|2\.?\s*Janov)a|M[aá]sodik\s*Jn|2\s*Yohannah|2\s*?Yuhan[an]ah|(?:2\.?|۲)\s*یُوحنّا|(?:2\.|۲)-?یُوحنّا|(?:2(?:-?е\.?\s*І|\.\s*І)|II\.?\s*І)оана|2-?(?:ге|а)\s*Іоана|Ioannis\s*II|2\s*Ivanova|2\.\s*Yoh(?:ane)?|II\.?\s*Janov|Andre\s*Joh|(?:2\s*Yoo?|2Yoo)hana|2\s*Yohanna|2\s*?Yuhann?a|۲\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Ιωαννου\s*Β|2\s*Yohanes|요(?:한(?:의\s*둘째\s*서간|[2이]서)|이)|Β['ʹʹ΄’]\s*(?:Ιω[άα]ννη|᾿Ιω)|2nd\.?\s*J(?:oh[mn]|h?n)|2(?:\.[oº]|º)\.?\s*J[au][au]n|2Yohan[an]ah|2\.\s*یوحنّا|2-?یُوحنّا|(?:(?:2\s*|[2۲])|۲\s*)یوحنا(?:ءه|[ته])|(?:(?:2\s*|[2۲])|۲\s*)یوهن(?:ا(?:ءه|[ته])|[آةهىی])|Yohane\s*II|ヨハネの(?:第二の(?:手紙|書)|手紙[Ⅱ二])|2\s*Yohane|2\.?\s*Јован|2\.?\s*Janov|Pili\s*Yoh|2nd\.?\s*J(?:oh?|h)|2Yohann?a|(?:(?:2\s*|[2۲])|۲\s*)یوحناء?|(?:(?:2\s*|[2۲])|۲\s*)یوهناء?|(?:(?:II(?:\.\s*[ИЙ]|\s*[ИЙ])|2\.\s*Й)|2\s*Й)оан|2\.?\s*Jan(?:os|a)|2\.?\s*Jáno[sv]|2\.?\s*Giăng|2\s*yūhãnā|2a\.?\s*Jo[aã]o|(?:II\.?\s*Ju|2\.?\s*Ju)[au]n|(?:[2۲]\s*یوحنّ|(?:2\.?۔|۲۔)یوحن)ا|J[aá]nos\s*II|2\.?\s*ଯୋହନଙ|2\.?\s*Yoox|2e\.?\s*Joh|(?:II\.?\s*Jh|2\.?\s*Jh)n|2\s*یوحن[آةهىی]|2\s*Іоана|2\.?\s*Jan|2\s*Ioan|II\.?\s*Jh|2یوحن[آةهىی]|۲(?:یوحن[آةهىی]|yohn)|(?:《(?:约(?:翰[二贰]书|贰)|約[貳贰])|《?伊望第二|约(?:翰[二贰]书|贰)|約[貳贰])》|(?:《約翰[二貳]|約翰[二貳])書》|《?若望二書》|2\.?\s*Gi|2یو(?:حن?)?|۲(?:یو(?:حن?)?|yoh?)|Β['ʹʹ΄’]\s*Ιω|2\.?\s*Jh|《(?:约(?:翰[二贰]书|贰)|約[貳贰])|《?伊望第二|(?:《約翰[二貳]|約翰[二貳])書|《?若望二書|2\.\s*In|2yohn|Ⅱ\s*ヨハネ|2yoh?|约(?:翰[二贰]书|贰)|2ヨハネ|二ヨハネ|約[貳贰]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Тре(?:т(?:о\s*съборно\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Иоана\s*Богослов|\s*ап\.?\s*Иоана\s*Богослов)а|[яє]\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанна|(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))ана|[ИЙ]оаново|Іоанна|Іоана)|а\s*п(?:ослание\s*на|исмо\s*од)\s*апостол\s*Јован|о\s*п(?:(?:ослание\s*на\s*апостол\s*Јов|ослание\s*на\s*[ИЙ]о)|исмо\s*од\s*апостол\s*Јов)ан|(?:(?:а\s*Јов|а\s*[ИЙ]о)ано|о\s*(?:Јов|[ИЙ]о)ано)во)|ћ(?:ом\s*(?:посланица\s*)?Јован|а\s*(?:посланица\s*)?Јован)ова|ћ(?:ом|а)\s*Јн)|3-?(?:тє|а)\.\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанна|(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))ана|[ИЙ]оаново|Іоанна|Іоана)|(?:3(?:-?е\.?\s*с|\.?\s*с)|III\.?\s*с)оборне\s*послання\s*св\.?\s*апостола\s*Іоанна|3-?(?:тє|а)\s*(?:соборне\s*послання\s*св\.?\s*апостола\s*Іоанна|(?:послання\s*апостола\s*Ів|(?:Послання\s*І[во]|Ів))ана|[ИЙ]оаново|Іоанна|Іоана)|யோவ(?:ான்\s*(?:எழுதிய\s*ம(?:ுன்றாம்\s*திருமுக|ூன்றாம்\s*கடித)|மூன்றாம்\s*திருமுக)|ன்\s*எழுதிய\s*மூன்றாவது\s*நிருப)ம்|Y(?:ōvaṉ\s*Eḻutiya\s*Mūṉṛāvatu\s*Nirupam|ooxanaa\s*Saddexaad)|(?:T(?:r(?:e(?:tje\s*poslannja\s*apostola\s*Ivan|[cæć]a\s*Ivanova\s*[Pp]oslanic)|zeci(?:a\s*(?:List\s*(?:[sś]w\.?\s*Jan|Jan)|Jan)|\s*(?:List\s*(?:[sś]w\.?\s*Jan|Jan)|Jan)))|řet[ií]\s*Janov)|(?:III\.?\s*Ivanova\s*P|3\.?\s*Ivanova\s*P)oslanic|Hezzantto\s*Yohaannis|(?:III\.?\s*L|3\.?\s*L)ist\s*(?:[sś]w\.?\s*Jan|Jan)|Se(?:vom\s*?Yoohann|h\s*?Yoohann|\s*?Yoohann)|III\.?\s*Yooxana|3\.?\s*Yooxana|3\.\s*Yoohann|3\s*Yoohann|۳\s*?Yoohann|3Yoohann|3\s*Yahy)a|(?:III\.?\s*послание\s*н|3\.?\s*послание\s*н)а\s*апостол\s*Јован|(?:(?:3(?:-?е\.?\s*посланн|\.?\s*посланн)|III\.?\s*посланн)я\s*апостола\s*Ів|(?:(?:(?:3(?:-?е\.?\s*П|\.?\s*П)|III\.?\s*П)ослання\s*І[во]|3(?:-?е\.?\s*Иох|(?:-?я|[ея])\.?\s*Иох|\.?\s*Иох)|(?:3(?:-?е\.?\s*І|\.\s*І)|III\.?\s*І)в)|3\s*Ів))ана|א(?:גרתו\s*השלישית\s*של\s*יוחנן\s*השליח|יגרת\s*יוחנן\s*השלישית)|אגרתו\s*השלישית\s*של\s*יוחנן\s*השלי|(?:III\.?\s*пи|3\.?\s*пи)смо\s*од\s*апостол\s*Јован|(?:رسالة\s*القديس\s*)?يوحنا\s*الثالثة|T(?:er(?:z(?:(?:a\s*lettera\s*di|o)|a)\s*Giovanni|cer(?:o\s*(?:San\s*J[au][au]n|J[au][au]n)|\s*(?:San\s*J[au][au]n|J[au][au]n)))|re(?:dje\s*Johannesbrevet|t(?:i\s*J[aá]nov\s*lis|í\s*J[aá]nov\s*lis)t|t[ií]\s*Janova)|(?:roisi[eè]mes?\s*Jea|hird\s*J(?:o?ph|h[ho]|oo))n|atu\s*Yohan[ae]|hird\s*J(?:oh[mn]|h?n))|y(?:ū(?:ḥannā\s*kā\s*tīsrā\s*ʿām\s*ḫaṭ|h(?:ann[aā]ko\s*testro\s*patra|ãnā\s*dī\s*tījī\s*pattrī))|uhann[aā]ko\s*testro\s*patra|oh[aā]n[aā]ce[mṃ]\s*tisre\s*patra)|(?:Kolmas\s*Johannek|(?:III\.?\s*Johannek|3\.?\s*Johannek))sen\s*kirje|Waraka\s*wa\s*Tatu\s*wa\s*Yohane|(?:(?:III\.?\s*посланиц|3\.?\s*посланиц)а\s*Јованов|3(?:-?е\.?\s*Иоанн|\.?\s*Иоанн)|(?:3(?:-?е\.?\s*І|\.\s*І)|III\.?\s*І)оанн|3\s*Іоанн)а|Barua\s*ya\s*Tatu\s*ya\s*Yohane|ی(?:ُوحنّا\s*کا\s*تیسرا\s*عام|(?:وحنا\s*کا\s*تیسرا\s*عام|(?:وحنّا\s*کا\s*(?:تیسرا|3\.|۳)|وحنّا\s*کا\s*3)))\s*خط|य(?:ूहन्नाको\s*तेस्(?:त्)?रो\s*पत्र|ोहानाचें\s*तिसरे\s*पत्र)|Þriðja\s*(?:br[eé]f\s*J[oó]hannesar|J[oó]hannesarbr[eé]f)|(?:Tredje\s*Johannes['’]|3\.?\s*Johannes['’])\s*Brev|Johannes(?:(?:(?:(?:'\s*Tredje|'\s*3\.?)\s*B|’\s*(?:Tredje|3\.?)\s*B)|’\s*tredje\s*b)|\s*tredje\s*b)rev|ਯੂਹੰਨਾ\s*ਦੀ\s*ਤੀਜੀ\s*ਪੱਤ੍ਰੀ|3(?:(?:-?е\.?\s*послани|\.?\s*послани)е\s*И|(?:-?я|[ея])\.?\s*послание\s*И)оанна|Epistula\s*I(?:II\s*Ioannis|oannis\s*III)|T(?:re(?:dje\s*Joh(?:annes(?:brev)?)?|[cæć]a\s*Ivanova|t(?:i\s*J(?:an(?:ov)?|ánov)?|í\s*J(?:an(?:ov)?|ánov)?))|hird\s*J(?:oh?|h)|řet[ií]\s*J(?:an)?|atu\s*Yoh)|رسالة\s*يوحنا\s*الثالثة|Kolmas\s*Johanneksen|3(?:e\.?\s*Johannesbreve|(?:(?:\s*[ei]\.?\s*Gj|\s*Gj)|\.\s*Gj)oni)t|(?:T(?:ret(?:i(?:a\s*(?:kniha\s*J[aá]no|J[aá]no)|\s*Jan[uů])|í\s*Jan[uů])|ret[ií]\s*list\s*Jan[uů]|řet[ií]\s*(?:list\s*Jan[uů]|Jan[uů]))|(?:III\.?\s*l|3\.?\s*l)ist\s*Jan[uů]|III(?:\.\s*Jan[uů]|\s*Jan[uů])|3\s*k\.\s*J[aá]no|3\s*k\s*J[aá]no|3\.?\s*Jan[uů])v|Ιω(?:αννου\s*(?:Επιστολη\s*Γ|Γ['ʹʹ΄’])|άννου\s*Γ['ʹʹ΄’])|ଯୋହନଙ୍କ\s*ତୃତୀୟ\s*ପତ୍ର|3\.?\s*Johannesbrevet|(?:III\.?\s*Johannek|3\.?\s*Johannek)sen|(?:D(?:ritte(?:[nrs])?\s*Johanne|erde\s*Johanne)|Harmadik\s*J[aá]no)s|(?:Mūṉṛāvatu\s*யோவான|ம(?:ூன்றாவது|ுன்றாம்)\s*யோவான|3(?:\s*(?:அருளப்பர|யோவான)|\.\s*யோவான))்|3\.?\s*Johannes(?:brev)?|Se(?:vom(?:\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|h(?:\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|sevvom(?:\s*yohannā|yo)|Se(?:vom(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|h(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|III(?:\.\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|áno[sv]|n)|Ј(?:ованов[ао]|н)|Yohan(?:es|a)|Giăng|In)|\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|áno[sv]|n)|Ј(?:ованов[ао]|н)|Yohan(?:es|a)|Giăng|In))|(?:(?:I(?:katlong\s*Ju|II(?:\.\s*(?:Yokan|Je)|\s*(?:Yokan|Je)))|3\.?\s*Yokan|3(?:e\.?\s*Je|\.?\s*Je))a|III(?:\.\s*(?:Gioa|J(?:oo|a[au]))|\s*(?:Gioa|J(?:oo|a[au])))|3[eè]me\.\s*Jea|(?:III(?:\.\s*Jo?p|\s*Jo?p)|3(?:\.\s*Jo?p|\s*Jo?p|Jo))h|3rd\.\s*J(?:o?ph|h[ho]|oo)|3[eè]me\s*Jea|(?:III\.?\s*Jh|3\.?\s*Jh)[ho]|3rd\s*J(?:o?ph|h[ho]|oo)|3\.?\s*Gioa|3(?:\.\s*Joo|\s*(?:Joo|Yh))|3\.?\s*Ja[au])n|(?:III\.?\s*S|3(?:o\.?\s*S|\.?\s*S))an\s*J[au][au]n|3(?:\.[oº]|º)\.\s*(?:San\s*J[au][au]n|J[au][au]n)|(?:III\.?\s*Giov|3\.?\s*Giov)anni|(?:Terceir[ao]\s*Jo[aã]|3(?:\.\s*(?:y[uū]hann[aā]k|Jo[aã])|\s*(?:(?:yūhann[aā]k|Jo[aã])|yuhann[aā]k))|III(?:\.\s*Jo[aã]|\s*Jo[aã])|3o\.?\s*Jo[aã]|3a\.\s*Jo[aã]|3a\s*Jo[aã])o|تیسرا(?:(?:\s*یُوحنّ|(?:\s*یوحنّ|۔یوحن))|-?یُوحنّ)ا|رسالة\s*يوحنا\s*3|השלישית\s*יוחנן|3(?:(?:(?:e(?:\.\s*Joh(?:annes)?|\s*Joh(?:annes)?)|\.\s*(?:यूहन्ना|Иоан|J(?:oh?)?)|\s*(?:यूहन्ना|(?:(?:(?:योहान|யோ(?:வா)?|Yoh|Gj|Iv|Ів)|J(?:oh?)?)|Иоан))|Yoh)|yoh?)|یو(?:حن?)?)|III(?:\.\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Јован|Gi)|\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Јован|Gi))|3(?:(?:(?:(?:\.\s*(?:य(?:ूहन्नाको|ुहत्रा|ोहन)|ยอห์น|J(?:oh[mn]|n))|\s*(?:(?:(?:(?:(?:yoh[aā]n[aā]ce[mṃ]|योह(?:ानाच|न)|ਯੂਹੰਨਾ|Yōvaṉ|Gv|In|Ин|Йн|يو|ยน)|J(?:oh[mn]|n))|युहत्रा)|यूहन्नाको)|ยอห์น)|요한)|yohn)|یوحن[آةهىی])|\s*یوحن[آةهىی])|3(?:\.[oº]|º)\s*(?:San\s*J[au][au]n|J[au][au]n)|3°\.\s*Giovanni|(?:3(?:-?е\.?\s*Иоано|\.?\s*Иоано)|(?:(?:III(?:\.\s*[ИЙ]|\s*[ИЙ])|3\.\s*Й)|3\s*Й)оано)во|3-?е\.?\s*Йоаново|(?:III\.?\s*Ioann|3\.?\s*Ioann)is|Трет(?:(?:а\s*Јов|а\s*[ИЙ]о)ан|о\s*(?:Јов|[ИЙ]о)ан)|3\.?\s*Ј(?:ованов[ао]|н)|3°\s*Giovanni|(?:3\s*Yoo?|3Yoo)hanaah|۳\s*?Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|س(?:وم\s*یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|ومیو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|ه(?:\s*یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])|یو[حه]ن(?:ا(?:ءه|[ته])|[آةهىی])))|Harmadik\s*Jn|3(?:-?я|[ея])\.?\s*Иоанна|Ioannis\s*III|ତୃତୀୟ\s*ଯୋହନଙ|3\.\s*I(?:vanova|oan)|س(?:وم\s*یو[حه]ناء?|ومیو[حه]ناء?|ه(?:\s*یو[حه]ناء?|یو[حه]ناء?)|ومیو)|3\.\s*Yohan(?:es|a)|(?:Third\s*Jon|III(?:\.\s*J(?:on|ó)|\s*J(?:on|ó))|3rd\.\s*Jon|3rd\s*Jon|3(?:\.\s*J(?:on|ó)|\s*J(?:on|ó)))h|3\s*Yohannah|3\s*?Yuhan[an]ah|(?:3(?:-?е\.?\s*І|\.\s*І)|III\.?\s*І)оана|Yohane\s*III|(?:3\.|[3۳])\s*یُوحنّا|(?:3\.|۳)-?یُوحنّا|3\s*Ivanova|3\.\s*Yoh(?:ane)?|(?:3\s*Yoo?|3Yoo)hana|3\s*Yohanna|3\s*?Yuhann?a|۳\s*?Y(?:o(?:ohana|hann?a)|uhann?a)|Derde\s*Joh|(?:(?:III(?:\.\s*[ИЙ]|\s*[ИЙ])|3\.\s*Й)|3\s*Й)оан|Ιωαννου\s*Γ|3\.?\s*Jan(?:o(?:va|s)|a)|3\s*Yohanes|요(?:한(?:의\s*셋째\s*서간|[3삼]서)|삼)|3rd\.\s*J(?:oh[mn]|h?n)|(?:III\.?\s*Ju|3(?:o(?:\.\s*J[au]|\s*J[au])|\.?\s*Ju))[au]n|3Yohan[an]ah|Γ['ʹʹ΄’]\s*(?:Ιω[άα]ννη|᾿Ιω)|(?:3\s*?یوحنا|۳\s*?یوحنا)(?:ءه|[ته])|(?:3\s*?یوه|۳\s*?یوه)ن(?:ا(?:ءه|[ته])|[آةهىی])|J[aá]nos\s*III|ヨハネの(?:第三の(?:手紙|書)|手紙[Ⅲ三])|3\.\s*یوحنّا|3-?یُوحنّا|3\.?\s*Jan(?:ov)?|3\s*Yohane|3\.?\s*Јован|3rd\.\s*J(?:oh?|h)|3Yohann?a|(?:3\s*?یوحنا|۳\s*?یوحنا)ء?|(?:3\s*?یوه|۳\s*?یوه)ناء?|3\.?\s*Jáno[sv]|3\.?\s*Giăng|(?:III\.?\s*Jh|3\.?\s*Jh)n|3rd\s*J(?:oh[mn]|h?n)|3\s*yūhãnā|(?:[3۳]\s*یوحنّ|(?:3\.?۔|۳۔)یوحن)ا|3\.?\s*ଯୋହନଙ|3\.?\s*Yoox|III\.?\s*Jh|3rd\s*J(?:oh?|h)|۳(?:\s*یوحن[آةهىی]|یوحن[آةهىی]|yohn)|3\s*Іоана|3\s*Ioan|(?:《(?:约(?:翰[三叁]书|[三叁])|約[三叁])|《?伊望第三|约(?:翰[三叁]书|[三叁])|約[三叁])》|(?:《約翰[三參]|約翰[三參])書》|《?若望三書》|۳(?:یو(?:حن?)?|yoh?)|3\.?\s*Gi|3\.?\s*Jh|Γ['ʹʹ΄’]\s*Ιω|《(?:约(?:翰[三叁]书|[三叁])|約[三叁])|《?伊望第三|(?:《約翰[三參]|約翰[三參])書|《?若望三書|3\.\s*In|Ⅲ\s*ヨハネ|约(?:翰[三叁]书|[三叁])|3ヨハネ|三ヨハネ|約[三叁]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo))|of\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo)))|yoh(?:an[aā]ne\s*lihilele\s*[sŝ]ubʰavartam[aā]|ān[aā]ne\s*lihilele\s*[sŝ]ubʰavartam[aā])|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo))|of\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo)))|El\s*Evangelio\s*de\s*J[au][au]|Saint\s*J(?:o?ph|h[ho]|oo)|St\.\s*J(?:o?ph|h[ho]|oo)|St\s*J(?:o?ph|h[ho]|oo)|Gioa|Jo?ph|J(?:oo|a[au]|ea)|Ju[au]|Jh[ho])n|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n))|of\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n)))|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h)|of\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h))|Mabuting\s*Balita\s*ayon\s*kay\s*(?:San\s*)?Juan|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n))|of\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n)))|(?:Evankeliumi\s*Johanneksen\s*muka|Yokan|Iv)an|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h)|of\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h))|य(?:ोह(?:ानाने\s*लिहिलेले\s*शुभवर्तमा)?न|ूहन(?:्ना(?:ले\s*लेखे)?को\s*सुसमाचार|ा)|(?:ूहा|हू)न्ना|ुह(?:त्र|न्न)ा)|Das\s*Evangelium\s*nach\s*Johannes|Ebanghelyo\s*ayon\s*kay\s*(?:San\s*)?Juan|E(?:van(?:gelium\s*secundum\s*Ioannem|gelium\s*podle\s*Jana|jelium\s*Pod[lľ]a\s*J[aá]na|[ðđ]elje\s*po\s*Ivanu)|(?:(?:w(?:angelia\s*w(?:edług\s*[sś]w\.|g\s*[sś]w\.)|\.)\s*|(?:wangelia\s*w(?:edług\s*[sś]w\s*|g\s*[sś]w\s*)|wangelia\s*))|w\s*)Jana)|y(?:uhann[aā]le\s*lekʰeko\s*susm[aā]c[aā]r|ū(?:h(?:ann[aā]le\s*lekʰeko\s*susm[aā]c[aā]r|ãnā\s*dī\s*ĩjīl)|ḥannā\s*kī\s*injīl)|ohannān)|Evangelie(?:\s*volgens|t\s*etter)\s*Johannes|От\s*Иоана\s*свето\s*Евангелие|Evangelium\s*nach\s*Johannes|Еван(?:гелие(?:то\s*според\s*Јов|\s*(?:според\s*Јов|от\s*Йо))ан|ђеље\s*по\s*Јовану)|யோவான்\s*எழுதிய\s*சுவிசேஷம்|(?:Johanneksen\s*evankelium|Yōvāṉ\s*Naṛceyt|Gjon)i|Vangelo\s*di\s*(?:San\s*)?Giovanni|Євангелі(?:я\s*від\s*(?:св\.?\s*І|І)вана|є\s*від\s*(?:св(?:\.\s*[ИЙ]оана|\s*[ИЙ]оана)|Івана))|யோவான்\s*(?:எழுதிய\s*)?நற்செய்தி|(?:Ebanghelyo|Sulat)\s*ni\s*San\s*Juan|Jevanhelije\s*vid\s*Ivana|ଯୋହନ\s*ଲିଖିତ\s*ସୁସମାଗ୍ଭର|Jevanđelje\s*po\s*Ivanu|J(?:ohann(?:is\s*|es)|anovo\s*)evangelium|J[oó]hannesarguðspjall|Јеванђеље\s*по\s*Јовану|(?:Евангелие\s*от\s*|(?:От\s*)?)Иоанна|அருளப்பர்\s*நற்செய்தி|พระวรสารนักบุญจอห์น|Johannesevangeliet|הבשורה\s*על[\s*-]פי\s*יוחנן|Евангелие\s*от\s*Иоан|Ungjilli\s*i\s*Gjonit|Injili\s*ya\s*Yohan[ae]|ی(?:ُوحنّا\s*کی\s*انجیل|و(?:حنا\s*کی\s*انجیل|(?:حن(?:اءه|(?:ا[تهی]|[آةهىی]))|هن(?:ا(?:ءه|[ته])|[آةهىی]))))|ਯੂਹ(?:ੰਨਾ\s*ਦੀ\s*ਇੰਜੀਲ|ਾਂਨਾ)|Injil\s*Yohanes|Κατ[άα]\s*Ιω[άα]ννην|J(?:oh(?:anne(?:ksen|s))?|án|óh)|إنجيل\s*يوحنا|Y(?:o(?:haannis|o(?:xana|hann))|ahy)a|Saint\s*J(?:o(?:h[mn]|nh)|h?n)|y(?:uhann[aā]le|ūh(?:ann[aā]le|ãnā)|oh(?:an[aā]ne|ān[aā]ne|annā))|य(?:ूहन्ना(?:ले)?|ोहान(?:ाने)?)|Saint\s*Jo?h|ヨハネ(?:による福音書|[の傳]福音書|福音書|伝)|(?:Y(?:oo?hana|uhana)a|Jon)h|(?:Від\s*І[во]|Іо)ана|От\s*Иоана|Y(?:oh(?:annah|(?:ane)?s)|uhannah)|St\.\s*J(?:o(?:h[mn]|nh)|h?n)|Giovanni|San\s*Juan|Y(?:o(?:(?:o?hana|(?:h(?:ane)?|ox))|hanna)|uhann?a|ōvāṉ)|ی(?:ُوحنّا|و(?:ح(?:ناء|(?:نا?)?)|هناء?))|St\.\s*Jo?h|Ιω[άα]ννης|St\s*J(?:o(?:h[mn]|nh)|h?n)|Ioannes|Ew\s*Jan|யோவா(?:ன்)?|St\s*Jo?h|ਯੂਹੰਨਾ|요한\s*?복음서|(?:《[約约]翰|约翰|約翰)福音》|《?若望福音》|요(?:한(?:\s*복음|복음)?)?|(?:《[約约]翰|约翰|約翰)福音|《?若望福音|G(?:iăng|[gv])|J(?:an(?:os|a)|o(?:h[mn]|[aã]o)|ána|n)|И(?:оана|н)|Й(?:оана|н)|يوحنا|János|Иохан|Јован|יוחנן|Івана|ยอห์น|Ioan|Ιω(?:[άα]ν)?|Иоан|Йоан|ଯୋହନ|《?伊望》|G(?:jo|i)|ヨハネ|《?伊望|《[約约]》|Jhn|(?:Јв|`[ИЙ])н|Ів|يو|《[約约]|Jh|Ін|Јн|Ἰω|ย[นฮ]|约》|約》|约))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Josh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:К(?:нига\s*(?:(?:(?:на\s*Исус\s*Н(?:авиев|евин)|Иисус\s*Навин|Єгошу[ії])|Иисуса\s*Навина)|Ісуса\s*Навина)|њига\s*Исуса\s*Навина)|யோசுவாவின்\s*புத்தகம்|ଯିହୋଶୂୟଙ୍କର(?:\s*ପୁସ୍ତକ)?|Ιησ(?:ο[υύ]ς\s*του\s*Ναυ[ήη]|\s*Ναυ[ήη])|y(?:a(?:ho(?:s[uū]ko\s*pustak|š(?:u(?:ko\s*pustak|ā)|ūko\s*pustak)|saw[aā]|ŝaw[aā])|šūʿ)|ūsh['’](?:ai|ā))|Ks(?:i[eę]g[ai]\s*Jozuego|\.?\s*Jozuego)|यहोश(?:ूको\s*पुस्तक|वा|ु)|(?:J(?:(?:o(?:osuan\s*kirj|shu|usu)|o[sz]uov|ošuov|ózuov)|oushu)|Y(?:ashuuc|o(?:s(?:hu['’]|u)|sh['’]u|wshu)|ushu))a|(?:Ии|І)суса\s*Навина|Li(?:ber\s*Iosue|v\s*Jozye\s*a)|(?:Ии|І)сус\s*Навин|(?:И(?:сус\s*Навие|На)|Ии?с\.\s*На|Ии?с\s*На|І\.?\s*На)в|J(?:o(?:s(?:vas\s*Bog|u(?:ah|[eé]))|zu(?:eu|a))|ozsu[eé]|óz(?:su[eé]|ua)|ošua|š)|Josvabogen|I(?:osu(?:a\s*Navi|e)|sus\s*Navyn)|Исус\s*Навин|(?:J(?:os(?:(?:vas\s*bo|uab[oó])|úab[oó])|ós[uú]ab[oó])|Yusa)k|J(?:o(?:(?:s(?:va(?:bog|s)?|ua|h)?|os(?:uan)?|z(?:ue)?)|zs)|óz?s)|y(?:aho(?:s[uū]ko|š[uū]ko)|ūsh['’]a)|(?:Yahosho|Jozueg)o|سفر\s*يشوع|Ιη(?:σ\s*Ναυ)?|यहोशू(?:को)?|G(?:i(?:ô(?:-?su[aê]|s)|osu[eèé])|su[aê])|Y(?:osh(?:uah|a)|ōcuvā|aasu|usha)|ਯਹੋਸ਼ੁਆ|Y(?:os(?:hua)?|ash)|யோசு(?:வா)?|(?:《?約書亞記|《?约书亚记|《[书書]|书)》|《?若蘇厄書》|โยชูวา|Єгошу[ії]|Ios(?:ua)?|《?約書亞記|《?约书亚记|《?若蘇厄書|یو(?:ش(?:ع[عهوی]|ا)|وش[اع])|여호수아기|יהושע|Jozye|ヨシュア記|(?:ی(?:وش[ئهوی]|شو)|يشو)ع|یشُوع|Навин|(?:Иешу|Ј[ео]шу)а|یوشع?|여호(?:수아)?|ヨシュア|G(?:iô|s)|Иеш|Нав|Jsh|ยชว|Js|Єг|يش|《[书書]|Ἰη|書》|书|수))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:K(?:itabu\s*cha\s*Kwanza\s*ch|wanz)a\s*Ez|Ensimm[aä]inen\s*Es|Erste(?:[nrs])?\s*Esd|F[oö]rsta\s*Es|Eerste\s*Ez|(?:III\.?\s*Ez|3\.?\s*Ez)d|(?:Unang|1e\.)\s*Ez|Derde\s*Ez|3e\.?\s*Ez|(?:Una|1e)\s*Ez)r|P(?:ierwsz[aey]\s*(?:Ks(?:i[eę]g[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|Ezdrasz)|rv(?:[aá]\s*kniha\s*Ezdr[aá][sš]ov|[yý]\s*(?:list\s*Ezdr[aá][sš]ov|Ezdr[aá][sš]ov)|[aá]\s*Ezdr[aá][sš]ov))|(?:1\.?\s*K|I\.?\s*K)s(?:i[eę]g[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|1\s*k\.\s*Ezdr[aá][sš]ov|1\s*k\s*Ezdr[aá][sš]ov|(?:1\.?\s*Ezdraso|I\.?\s*Ezdraso)v|(?:1\.?\s*Ezdraš|I\.?\s*Ezdraš)ov|(?:1\.?\s*Ezdrá|I\.?\s*Ezdrá)[sš]ov|1\.?\s*Ez(?:drasz|r)|I(?:\.\s*E(?:z(?:drasz|r)|sr)|\s*E(?:z(?:drasz|r)|sr))|Erste(?:[nrs])?\s*Esr|Første\s*Esr|(?:III\.?\s*Ez|3\.?\s*Ez)r|3°\.\s*Esdr|3(?:e\.?\s*Esr|\.?\s*Esr)|3°\s*Esdr)a|П(?:ърв(?:(?:а\s*книга\s*на|о)|а)\s*Ездра|рва\s*(?:Је|Е)здрина|ерш[ае]\s*Ездр[аи])|Pr(?:v(?:[aá]\s*kniha\s*Ezdr[aá][sš]|[yý]\s*(?:list\s*Ezdr[aá][sš]|Ezdr[aá][sš])|[aá]\s*Ezdr[aá][sš])|im[ao]\s*Esdra)|Pr(?:emi(?:eres?\s*Esdras|ères?\s*Esdras|ers?\s*Esdras)|ime(?:ir[ao]|ro)\s*Esdras|imer\s*Esdras|im[ao]\s*Esdras|vn[ií]\s*Ezdr[aá][sš]|im[ao]\s*Ésdras)|(?:Første\s*Esdras|(?:1\.?\s*Esdras|3\.?\s*Esdras))bog|T(?:redje\s*Es(?:drasbog|ra)|erz[ao]\s*Esdra)|Liber\s*(?:Esdrae\s*I|I\s*Esdrae)|F(?:ørste\s*Esdras|irst\s*Esdr?)|E(?:sdra(?:s\s*Yunani|\s*greco)|zra\s*Yunani)|(?:(?:Eerste|(?:(?:Unang|1e\.)|(?:Una|1e)))|Derde)\s*Esdras|(?:First\s*Esdra|Els[oő]\s*Ezdr[aá]|1st\.\s*Esdra|1st\s*Esdra)s|1(?:(?:(?:(?:ere|\.[oº]|[aoº])|er)|re)|ère)\.\s*Esdras|إسدراس\s*الأول|1\s*k\.\s*Ezdr[aá][sš]|1(?:(?:\s*(?:(?:எஸ்திராஸ்|Ездра)|Es(?:drae|ra))|\.\s*Es(?:drae|ra))|\.\s*Ездра)|III\.?\s*Esdras|1(?:(?:(?:(?:ere|\.[oº]|[aoº])|er)|re)|ère)\s*Esdras|1-?(?:ше|[ае])\.\s*Ездр[аи]|(?:1\.\s*Ј|I\.?\s*Ј)ездрина|III\.?\s*Esdra|1\s*k\s*Ezdr[aá][sš]|2(?:-?[ея]\.?\s*Ездры|[ея]\.?\s*Ездры|\.?\s*Ездры)|1°\.\s*Esdras|3e\.?\s*Esdras|(?:1°\.\s*É|1\.?\s*É|I\.?\s*É|1°\s*É)sdras|1-?(?:ше|[ае])\s*Ездр[аи]|(?:1\.?\s*Ездрин|I\.?\s*Ездрин)а|1\s*Јездрина|1\.?\s*Ezd(?:ras?)?|I(?:\.\s*(?:E(?:zd(?:ras?)?|sd(?:ra?)?)|Ездри)|\s*(?:E(?:zd(?:ras?)?|sd(?:ra?)?)|Ездри))|1st\.\s*Esdr?|1\.?\s*Esdras|3\.?\s*Esdras|1°\.\s*Esdra|1\.?\s*Ezdraš|I\.?\s*Ezdraš|(?:1\.?\s*Ezdrá|I\.?\s*Ezdrá)[sš]|I(?:\.\s*(?:Esdra[es]|Ездра)|\s*(?:Esdra[es]|Ездра))|Α['ʹʹ΄’]\s*[ΈΕ]σδρας|1°\s*Esdras|[ΈΕ]σδρας\s*Α['ʹʹ΄’]|חזון\s*עזרא|1(?:\.\s*Es(?:d(?:ra?)?|r)?|\s*(?:Es(?:d(?:ra?)?|r)?|(?:Ездр|Јез)))|1\.\s*Ездри|3\.?\s*Esdra|Els[oő]\s*Ezd|1st\s*Esdr?|1°\s*Esdra|Ezdr[aá]s\s*I|1\s*Ездри|Α['ʹʹ΄’]\s*[ΈΕ]σδρ?|에스드라\s*1서|エ[スズ](?:[トド]ラ第一巻|ラ第一書)|《1Esd》|《1Esd|2\s*Езд|1Esd》|1Esd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Kitabu\s*cha\s*Pili\s*cha\s*Ezra|(?:Dru(?:h(?:[aá]\s*kniha\s*Ezdr[aá][sš]ov|[yý]\s*(?:list\s*Ezdr[aá][sš]ov|Ezdr[aá][sš]ov)|[aá]\s*Ezdr[aá][sš]ov)|g[ai]\s*(?:Ks(?:i[eę]g[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|Ezdrasz))|(?:II\.?\s*K|2\.?\s*K)s(?:i[eę]g[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|2\s*k\.\s*Ezdr[aá][sš]ov|(?:II\.?\s*Ezdraso|2\.?\s*Ezdraso)v|(?:II\.?\s*Ezdraš|2\.?\s*Ezdraš)ov|(?:II\.?\s*Ezdrá|2\.?\s*Ezdrá)[sš]ov|2\s*k\s*Ezdr[aá][sš]ov|II(?:\.\s*E(?:z(?:drasz|r)|sr)|\s*E(?:z(?:drasz|r)|sr))|Zweite(?:[nrs])?\s*Esr|2\.?\s*Ez(?:drasz|r)|Fjerde\s*Esr|Andre\s*Esr|(?:IV\.?\s*Ez|4\.?\s*Ez)r|4\.?\s*Esr)a|(?:Втор(?:а\s*книга\s*на|о)|III\.)\s*Ездра|Druh(?:[aá]\s*kniha\s*Ezdr[aá][sš]|[yý]\s*(?:list\s*Ezdr[aá][sš]|Ezdr[aá][sš])|[aá]\s*Ezdr[aá][sš])|2-?(?:ге|[ае])\.\s*(?:книга\s*Ездри|Ездр[аи])|Друг(?:а\s*(?:книга\s*Ездри|Ездра)|е\s*(?:книга\s*Ездри|Ездр[аи]))|Fjerde\s*Esdrasbog|(?:(?:(?:(?:Ikalawang|2e\.)|2e)|Tweede)|Vierde)\s*Esdras|Deuxi[eè]mes?\s*Esdras|2-?(?:ге|[ае])\s*(?:книга\s*Ездри|Ездр[аи])|Anden\s*Esdrasbog|Liber\s*(?:Esdrae\s*II|II\s*Esdrae)|(?:II\.?\s*к|2\.?\s*к)нига\s*Ездри|Second[ao]\s*Esdras|(?:M[aá]sodik\s*Ezdr[aá]|(?:Second\s*|2nd\.?\s*)Esdra)s|(?:Second[ao]\s*É|II\.?\s*É|2°\.\s*É|2\.?\s*É|2°\s*É)sdras|(?:Segund[ao]|2(?:(?:eme|(?:(?:\.[oº]|de|[aoº])|d))|ème)\.)\s*Esdras|(?:Друга\s*(?:Је|Е)здрин|(?:(?:II\.?\s*Ј|2\.\s*Ј)е|(?:(?:(?:II\.?\s*Е|2\.\s*Е)|2\s*Е)|2\s*Је))здрин)а|(?:(?:Ikalawang|2e\.)\s*Ez|Zweite(?:[nrs])?\s*Esd|Quart[ao]\s*Esd|(?:(?:Fj[aä]rde|Andra)|Toinen)\s*Es|Tweede\s*Ez|Vierde\s*Ez|(?:IV\.?\s*Ez|4\.?\s*Ez)d|4°\.\s*Esd|4°\s*Esd|2e\s*Ez)ra|Second(?:[ao]\s*Esdra|\s*Esdr?)|إسدراس\s*الثاني|E(?:sdras|zra)\s*Latin|(?:2\.?\s*Esdrasb|4\.?\s*Esdrasb)og|Andre\s*Esdras|עזרא\s*החיצוני|M[aá]sodik\s*Ezd|2\s*k\.\s*Ezdr[aá][sš]|Друга\s*Ездри|2(?:\s*(?:(?:எஸ்திராஸ்|Ездра)|Es(?:drae|ra))|\.\s*Es(?:drae|ra))|2(?:(?:eme|(?:(?:\.[oº]|de|[aoº])|d))|ème)\s*Esdras|Втора\s*Ездра|Трет[ао]\s*Ездра|II(?:\.\s*E(?:zd(?:ras?)?|sd(?:ra?)?)|\s*E(?:zd(?:ras?)?|sd(?:ra?)?))|II\.?\s*Ezdraš|(?:II\.?\s*Ezdrá|2\.?\s*Ezdrá)[sš]|2\s*k\s*Ezdr[aá][sš]|II(?:\.\s*Esdra[es]|\s*Esdra[es])|3(?:-?[ея]\.?\s*Ездры|[ея]\.?\s*Ездры|\.\s*Ездр[аы]|\s*Ездр[аы])|IV\.?\s*Esdras|2°\.\s*Esdras|2(?:\.?\s*Esdras|(?:\.\s*Es(?:d(?:ra?)?|r)?|\s*(?:Es(?:d(?:ra?)?|r)?|(?:Ездр|Јез))))|4(?:\.\s*Esdras?|\s*Esdras?)|2\.?\s*Ezd(?:ras?)?|2nd\.?\s*Esdr?|IV\.?\s*Esdra|2°\.\s*Esdra|2\.?\s*Ezdraš|(?:II\.?\s*Е|2\.\s*Е)здри|2°\s*Esdras|Β['ʹʹ΄’]\s*[ΈΕ]σδρας|Ezdr[aá]s\s*II|[ΈΕ]σδρας\s*Β['ʹʹ΄’]|(?:II\.?\s*Е|2\.\s*Е)здра|III\s*Ездра|Pili\s*Ezra|2°\s*Esdra|Β['ʹʹ΄’]\s*[ΈΕ]σδρ?|2\s*Ездри|에스드라\s*2서|エ[スズ](?:[トド]ラ第二巻|ラ第二書)|3\s*Ездр?|《2Esd》|《2Esd|2Esd》|2Esd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Isa"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:ஏசாயா\s*தீர்க்கதரிசியின்\s*புத்தகம்|ଯ(?:ିଶାଇୟ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କର\s*ପୁସ୍ତକ|[ାୀ]ଶାଇୟ)|К(?:нига\s*(?:на\s*пророк\s*Исаия|пророка\s*(?:Исаии|Іса[ії])|Іса[ий][ії])|њига\s*пророка\s*Исаије)|ya(?:səiy[aā]ko\s*pustak|šəiy[aā]ko\s*pustak|s(?:(?:haayaa|(?:aʿ|ā)yā)h|ay[aā])|ŝay[aā])|(?:Ks(?:i[eę]g[ai]\s*Izajasz|\.?\s*Izajasz)|Jesa(?:jan\s*kirj|i)|E(?:ysheya['’]|s(?:heya['’]|ei))|(?:E(?:ysh(?:a(?:['’]i|a)|['’])|sh(?:a(?:['’]i|a)|['’]))|I(?:ysha['’]|sha['’])|Y[eé]sa)y|I(?:(?:s(?:i(?:yaas|h)|a[jy])|za(?:jasz|ij)|-?sai-?)|-?sa-?gi)|A(?:yshai?y|shai?y))a|य(?:श(?:(?:ैयाको\s*पुस्तक|ायाह)|या)|ेशैया)|Li(?:ber\s*Isaiae|v\s*Ezayi\s*a)|E(?:s(?:a(?:jas['’]\s*Bog|ie)|h(?:a(?:[iy]yah|['’]yaa|yaa)|eyaa))|ysh(?:a(?:[iy]yah|['’]yaa|yaa)|eyaa))|Jesajabok(?:en|a)|(?:Esaias['’]|Jesajas)\s*bok|سفر\s*إشعياء|ya(?:səiy[aā]ko|šəiy[aā]ko)|I(?:yshaiy|s(?:haiy|s))ah|Ishacyaah|E(?:ysha(?:(?:[iy])?|['’])ya|s(?:ha(?:(?:[iy])?|['’])ya|a(?:i(?:as)?|jas)?))|Is(?:ai(?:a[ai]|s)h|aii(?:[ai])?h|aa(?:[ai](?:[ai])?h|h)|i[ai](?:[ai](?:[ai])?h|h)|a(?:ia?h|h))a|Iy?shayaa|ا(?:شع(?:يا\s*[يی]|یا\s*[يی])|ش(?:ع[يی]\s*|\s*3|3)ی|[\s*ِ]شعی|یشی)ا|إشَعْياء|Is(?:ai(?:a[ai]|s)h|aii(?:[ai])?h|aa(?:[ai](?:[ai])?h|h)|i[ai](?:[ai](?:[ai])?h|h)|a(?:ia?h|h))|Iy?shaya|Jes(?:ajan?)?|यश(?:ैया(?:को)?|ा(?:या?)?)|Ezsai[aá]s|É(?:zsai[aá]s|sai[aá]s|saie)|Η(?:ΣΑ(?:Ϊ́|[ΊΙ])ΑΣ|σα[ΐι]ας)|اشع(?:\s*یاه|ي(?:ا[ءئاه]|ى)|ي[هی]ا|ی(?:ا[ءئاه]|[هی]ا|[آى]))|esh['’](?:āyā|a)|ਯਾ?ਸਾਯਾਹ|อ(?:ิสยาห์|สย)|I(?:z(?:ajas)?|s(?:a(?:ia?|ía)?|iy|h)?|-?sa)|ا(?:ش(?:ع(?:\s*یا|يا|ي[هی]|ی(?:ا|[هی])?|ي)?)?|یش)|ଯିଶାଇୟ|I(?:sa(?:i(?:as|e)|ía[hs])|za(?:i[aá][sš]|j(?:aš|á[sš]))|a)|Esaiás|Иса(?:и?ја|и[ия]|я)|ישע(?:יהו|ה)|ی(?:سع|عس)یاہ|(?:《?以(?:賽(?:亞書|亚书)|赛亚书)|《[賽赛]|[賽赛])》|《?依撒意亞》|ﺃﺷﻌﻴﺎء|esh['’]ā|ישעיה|ஏசா(?:யா)?|《?以(?:賽(?:亞書|亚书)|赛亚书)|《?依撒意亞|(?:Ecāy|īshi)ā|Ezayi|Ê-?sai|எசாயா|إشعيا|(?:[EI]|É)saïe|ୟିଶାୟ|ୟଶାଇୟ|Ис(?:аи?)?|Іса[яії]|이사야서|イ[サザ]ヤ書|Yes|Ezs|É(?:sa?|zs)|īsh|이사야?|ਯਸਾ|எசா|イ[サザ]ヤ|Ησ|Іс|《[賽赛]|Ys|Ἠσ|[賽赛]|사))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:S(?:ameela\s*Maxaafaa\s*Naa77anttuwa|emuel\s*Yang\s*Kedu)|D(?:ru(?:g(?:a\s*(?:Samuelo(?:va\s*knjig|w)|Ks(?:i[eę]g[ai]\s*Samuelow|\.?\s*Samuelow))|i\s*(?:Ks(?:i[eę]g[ai]\s*Samuelow|\.?\s*Samuelow)|Samuelow))|h(?:(?:[aá]\s*kniha|[aá])\s*Samuelov|[yý]\s*(?:kniha\s*|(?:list\s*)?)Samuelov))|ezy[eè]m\s*liv\s*Samy[eè]l\s*l)|(?:II\.?\s*Ks|2\.?\s*Ks)(?:i[eę]g[ai]\s*Samuelow|\.?\s*Samuelow)|(?:II\.?\s*k|2\.\s*k)niha\s*Samuelov|2\s*kniha\s*Samuelov|2\s*k\.\s*Samuelov|II(?:\.\s*Samuelo[vw]|\s*Samuelo[vw])|2\s*k\s*Samuelov|2\.?\s*Samuelo[vw])a|சாமுவேலின்\s*இரண்டாம்\s*புத்தகம்|Kitabu\s*cha\s*Pili\s*cha\s*Samueli|ଶାମୁୟେଲଙ୍କ\s*ଦ୍ୱିତୀୟ\s*ପୁସ୍ତକ|And(?:en\s*(?:Kongerigernes\s*B|Samuelsb)og|ra\s*Samuelsboken)|Cartea\s*(?:a\s*doua\s*a\s*Regilor|II\s*a\s*(?:lui\s*Samuel|Regilor))|Drug(?:a\s*(?:knjiga\s*o\s*Samuelu|Ks(?:i[eę]g[ai]\s*Samuela|\.?\s*Samuela))|i\s*Ks(?:i[eę]g[ai]\s*Samuela|\.?\s*Samuela))|Toinen\s*Samuelin\s*kirja|Втор(?:а\s*(?:книга\s*на\s*)?Самуил|а\s*Книга\s*на\s*царете|о\s*(?:Книга\s*на\s*царете|Цар(?:ства|е)|Самуил)|а\s*Цар(?:ства|е))|(?:(?:Втор[ао]\s*книга\s*Само|II\.?\s*книга\s*Само|2\.?\s*книга\s*Само)|(?:II\.?\s*Књ|2\.?\s*Књ)ига\s*Саму)илова|2-?(?:ге|а)\.\s*(?:книга\s*Саму[ії]лова|(?:Книга\s*Саму[ії]л|Саму[ії]лов)а)|Друг(?:(?:а\s*(?:Књига\s*)?Самуилов|(?:а\s*(?:Книга\s*Саму[ії]л|краљевим)|а\s*Саму[ії]лов))а|а\s*книга\s*Саму[ії]лова|е\s*(?:книга\s*Саму[ії]лова|(?:Книга\s*Саму[ії]л|Саму[ії]лов)а))|शम(?:ूएलको\s*दोस्रो|ुऐयल\s*की\s*[2२]री)\s*पुस्तक|2\.?\s*Kongerigernes\s*Bog|2-?е\.?\s*книга\s*Саму[ії]лова|2-?(?:ге|а)\s*(?:книга\s*Саму[ії]лова|(?:Книга\s*Саму[ії]л|Саму[ії]лов)а)|samūel\s*dī\s*dūjī\s*potʰī|(?:II\.?\s*Книга\s*н|2\.?\s*Книга\s*н)а\s*царете|(?:Втора\s*книга\s*Царст|(?:2(?:-?е(?:\.\s*Саму[ії]|\s*Саму[ії])|\.\s*Саму[ії]|\s*Саму[ії])|II(?:\.\s*Саму[иії]|\s*Саму[иії]))ло|2\.?\s*Самуило)ва|(?:II\.?\s*книга\s*Саму|2\.?\s*книга\s*Саму)[ії]лова|(?:II\.?\s*Ks|2\.?\s*Ks)(?:i[eę]g[ai]\s*Samuela|\.?\s*Samuela)|(?:II\.?\s*Samuelin|2\.?\s*Samuelin)\s*kirja|(?:(?:2(?:-?е\.?\s*Книга\s*С|\.?\s*Книга\s*С)|II\.?\s*Книга\s*С)аму[ії]л|(?:II\.?\s*кр|2\.?\s*кр)аљевим|2(?:-?е\.?\s*Самуи|(?:-?я|[ея])\.?\s*Самуи)л)а|δυτικ[οό]ς\s*Σαμου[ήη]λ\s*Β['ʹʹ΄’]|ਸਮੂਏਲ\s*ਦੀ\s*ਦੂਜੀ\s*ਪੋਥੀ|2(?:(?:-?е(?:\.\s*(?:Книга\s*)?Ц|\s*(?:Книга\s*)?Ц)|\.?\s*Книга\s*Ц)арств|(?:-?я|[ея])(?:\.\s*(?:Книга\s*)?Царств|\s*(?:Книга\s*)?Царств)|\s*(?:(?:(?:(?:(?:(?:(?:(?:[ei]\.?\s*Samuelit|ਸਮੂਏਲ)|Samuel(?:sbog|i[st]|[el]))|Самуила)|samūelko)|samuelko)|šam[uū]elko)|शमूएलको)|ซ(?:ามูเอล|มอ))|\.\s*(?:Samuel(?:sbog|i[st]|[el])|[sš]am[uū]elko|Самуила|शमूएलको|ซ(?:ามูเอล|มอ))|사무)|S(?:[ií]ðari\s*Sam[uú]elsb[oó]k|amuu['’]eel\s*Labaad|econd(?:[ao]\s*Samuele|\s*S(?:amu[ae]l[ls]|ma))|amuelis\s*II|amueli?\s*II|ámuel\s*II)|Liber\s*II\s*Samuelis|سفر\s*صموئيل\s*الثاني|Andre\s*Samuelsbok|(?:Ikalawang|Deuxi[eè]mes|Zweite[nrs]|2(?:(?:eme|(?:(?:\.[oº]|de|º)|d))|ème)\.)\s*Samuel|ଦ୍ୱିତୀୟ\s*ଶାମୁୟେଲଙ|D(?:ru(?:ga\s*Samuelova|h(?:[aá]\s*S(?:am(?:uel)?)?|[yý]\s*S(?:am(?:uel)?)?))|ovomSam)|T(?:oinen\s*Samuelin|weede\s*Sam)|ଦ୍ୱିତୀୟ\s*ଶାମୁୟେଲ|(?:2\.?\s*Samuelsboke|II\.?\s*Sa-?mu-?ê|2\.?\s*Sa-?mu-?ê)n|(?:Se(?:cond\s*Kingdom|gund[ao]\s*Reino)|(?:2nd\.?\s*Ki|(?:II\.?\s*Ki|2\.?\s*Ki))ngdom|(?:II\.?\s*Rei|2\.?\s*Rei)no|2[ao]\.\s*Reino|2[ao]\s*Reino)s|(?:Deuxi[eè]me\s*|Zweite\s*|2(?:(?:eme|(?:(?:\.[oº]|de|º)|d))|ème)\s*)Samuel|(?:D(?:o(?:(?:vom(?:\s*[Ss]|s)|s)am(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei])|vomSam(?:ow(?:ey|i)|u[ei])|vomSam(?:u['w’]|oe)i|vomSamw[ei]i|\s*sam(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei]))|ezy[eè]m\s*Samy[eè])|dovvom\s*samu['’]ī|Tweede\s*Samu[eë]|2-?(?:ге|а)\.\s*Samu[iï]|Друг(?:а\s*Samu[iï]|е\s*Samu[iï])|2-?е\.?\s*Samu[iï]|2-?(?:ге|а)\s*Samu[iï]|II(?:\.\s*Samu[iëï]|\s*Samu[iëï])|2\s*?Samow(?:ey|i)|(?:II\.?\s*Samy|2\.?\s*Samy)[eè]|2e\.\s*Samu[eë]|2(?:\s*(?:Sam(?:wei|u[iëï])|Cāmuvē)|\.\s*Samu[iëï])|(?:2(?:\s*Sam(?:u['w’]|wi)|Samu['w’])|2\s*?Samoe)i|2\s*samūʾī|2e\s*Samu[eë]|2Samw[ei]i|2Samu[ei])l|(?:M[aá]sodik\s*S[aá]mu|II(?:\.\s*Samuu['’]e|\s*Samuu['’]e)|Do(?:(?:(?:vom(?:\s*[Ss]|s)|s)|vomS)|\s*s)amou|2(?:\.\s*Shamooa|\s*(?:Shamooa|[sŝ]amuw))|2\.?\s*Samuu['’]e|(?:II\.?\s*Sá|2\.?\s*Sá)mu|2\s*?Samou)el|(?:Segund[ao]\s*S|(?:2[ao]\.\s*|2[ao]\s*)S)amuel|صموئيل\s*الثّاني|الممالك\s*الثاني|2(?:\.\s*(?:S(?:a(?:m(?:uel(?:s(?:bok)?|i)?)?)?)?|Сам(?:уил)?|शमू(?:एल)?)|\s*Samuel(?:s(?:bok)?|i)?|\s*(?:samūel|சாமு|S(?:am?)?|صم|Ц)|\s*Сам(?:уил)?|\s*शमू(?:एल)?|Sa)|Second\s*S(?:a(?:m(?:u[ae]l)?)?|m)|صموئيل\s*الثاني|And(?:en\s*Sam(?:uel)?|re\s*Sam(?:uel)?)|II\.?\s*Samuelin|Втор(?:а\s*Цар(?:ств)?|о\s*Цар(?:ств)?)|2-?(?:ге|а)\.\s*Саму[ії]л|Друг(?:а\s*Саму[ії]л|е\s*Саму[ії]л|а\s*Сам)|II(?:\.\s*(?:Samuel(?:is|[els])|Regnorum|Царе)|\s*(?:Samuel(?:is|[els])|Regnorum|Царе))|2nd\.?\s*S(?:amu[ae]l[ls]|ma)|(?:Pili\s*Sam[uw]|II\.?\s*Samw|2\.\s*Samw)eli|Βασιλει[ωώ]ν\s*Β['ʹʹ΄’]|दुसरे\s*शमुवेल|II(?:\.\s*(?:S(?:a(?:m(?:ueli?)?)?)?|Сам)|\s*(?:S(?:a(?:m(?:ueli?)?)?)?|Сам))|2nd\.?\s*S(?:a(?:m(?:u[ae]l)?)?|m)|2\.?\s*Samuelin|M[aá]sodik\s*S[aá]m|(?:2(?:-?е(?:\.\s*Саму[ії]|\s*Саму[ії])|\.\s*Саму[ії]|\s*Саму[ії])|II(?:\.\s*Саму[иії]|\s*Саму[иії]))л|2-?(?:ге|а)\s*Саму[ії]л|2\.?\s*Regnorum|دو(?:م?\s*سم(?:و(?:ئ(?:یل[ہی]|ل)|یل)|و(?:ئ(?:یی|ي)|یی|ای)ل|(?:و(?:ئئ|ائ|ء)|ؤ)یل|ئویل)|م(?:-?سموئ|۔سموا)یل|مسم(?:و(?:ئ(?:یل[ہی]|ل)|یل)|و(?:ئ(?:یی|ي)|یی|ای)ل|(?:و(?:ئئ|ائ|ء)|ؤ)یل|ئویل)|سم(?:و(?:ئ(?:یل[ہی]|ل)|یل)|و(?:ئ(?:یی|ي)|یی|ای)ل|(?:و(?:ئئ|ائ|ء)|ؤ)یل|ئویل))|(?:II\.?\s*Samua|2\.?\s*Samua)l[ls]|2°\.\s*Samuele|(?:II\.?\s*Царс|2\.?\s*Царс)тва|(?:II\.?\s*Regi|2\.?\s*Regi)lor|2\.?\s*ଶାମୁୟେଲଙ|دو(?:م?\s*سموئیل|مس(?:موئیل)?|سموئیل)|(?:II\.?\s*Samua|2\.?\s*Samua)l|(?:II\.?\s*Царс|2\.?\s*Царс)тв|2\.?\s*ଶାମୁୟେଲ|2°\s*Samuele|Β['ʹʹ΄’]\s*Σαμου[ήη]λ|2\s*(?:சாமுவேல|அரசுகள)்|(?:2(?:\.\s*|-?)سموئ|(?:2\.|۲)-?سموئ|(?:2\.?۔|۲۔)سموا|[2۲]سموئئ|[2۲]سموائ|2سم(?:وء|ؤ)|۲سم(?:وء|ؤ))یل|2\s*سم(?:و(?:ئ(?:یل[ہی]|ل)|یل)|و(?:ئ(?:یی|ي)|یی|ای)ل|(?:و(?:ئئ|ائ|ء)|ؤ)یل|ئویل)|۲\s*سم(?:و(?:ئ(?:یل[ہی]|ل)|یل)|و(?:ئ(?:یی|ي)|یی|ای)ل|(?:و(?:ئئ|ائ|ء)|ؤ)یل|ئویل)|2\s*Samweli|2\.?\s*शामुएल|Pili\s*Sam|2\s*سموئیل|۲\s*سموئیل|[2۲]سموئ(?:یل[ہی]|ل)|(?:2\s*صموئي|[2۲]سموئ(?:یی|ي)|[2۲]سمویی|[2۲]سموای)ل|שמואל\s*ב['’]|2\s*शमुवेल|[2۲]سموئیل|2e\.\s*Sam|(?:II\.?\s*Sá|2\.?\s*Sá)m|שמואל\s*ב|2\.\s*Царе|dovvoms|[2۲]سمئویل|(?:II\.?\s*Sm|2\.?\s*Sm)a|《撒(?:(?:慕爾紀)?下》|母耳[記记]下》)|사무엘(?:기(?:\s*하권|하)|\s*?하)|II\.?\s*Sm|《撒(?:(?:慕爾紀)?下|母耳[記记]下)|2e\s*Sam|Β['ʹʹ΄’]\s*Σαμ|2\s*Царе|[2۲]سمویل|撒(?:(?:慕爾紀)?下》|母耳[記记]下》)|サムエル(?:\s*2|後書|記[Ⅱ下]|下)|列王記第二巻|2\.?\s*Sm|撒(?:(?:慕爾紀)?下|母耳[記记]下)|2سامو|۲(?:سامو|smu)|[2۲]sāmu|Ⅱサムエル|2سمو?|۲(?:سمو?|sm)|2Sam|2smu|2sm|삼하))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:K(?:itabu\s*cha\s*Kwanza\s*cha\s*Samu|wanza\s*Sam[uw])eli|சாமுவேலின்\s*முதலாம்\s*புத்தகம்|Ensimm[aä]inen\s*Samuelin\s*kirja|(?:S(?:ameela\s*Maxaafaa\s*Koiruwa|emuel\s*Yang\s*Pertam)|P(?:ierwsz[aey]\s*(?:Ks(?:i[eę]g[ai]\s*Samuelow|\.?\s*Samuelow)|Samuelow)|r(?:v(?:a\s*Samuelova\s*knjig|(?:(?:n[ií]\s*k|a\s*k)|á\s*k)niha\s*Samuelov|[yý]\s*(?:list\s*)?Samuelov|n[ií]\s*Samuelov|á\s*Samuelov)|emye\s*liv\s*Samy[eè]l\s*l))|(?:1\.?\s*Ks|I\.?\s*Ks)(?:i[eę]g[ai]\s*Samuelow|\.?\s*Samuelow)|(?:(?:1\.\s*k|I\.?\s*k)niha|1\s*k(?:niha|\.))\s*Samuelov|1\s*k\s*Samuelov|1\.?\s*Samuelo[vw]|I(?:\.\s*Samuelo[vw]|\s*Samuelo[vw]))a|F(?:ørste\s*(?:Kongerigernes\s*Bog|Samuelsbo[gk])|[oö]rsta\s*Samuelsboken|irst\s*S(?:amu[ae]l[ls]|ma))|P(?:ierwsz[aey]\s*Ks(?:i[eę]g[ai]\s*Samuela|\.?\s*Samuela)|r(?:va\s*knjiga\s*o\s*Samuelu|im[ao]\s*Samuele))|ଶାମୁୟେଲଙ୍କ\s*ପ୍ରଥମ\s*ପୁସ୍ତକ|samūel\s*dī\s*pahilī\s*potʰī|Cartea\s*(?:[iî]nt[aâ]i\s*a\s*Regilor|I\s*a\s*(?:lui\s*Samuel|Regilor))|(?:1-?(?:ше|а)\.\s*(?:книга\s*Саму[ії]ло|Саму[ії]ло)|1-?е\.?\s*книга\s*Саму[ії]ло|1-?(?:ше|а)\s*(?:книга\s*Саму[ії]ло|Саму[ії]ло)|(?:1\.?\s*книга\s*Само|I\.?\s*книга\s*Само|(?:1\.?\s*Књ|I\.?\s*Књ)ига\s*Саму)ило|(?:1\.?\s*книга\s*Саму|I\.?\s*книга\s*Саму)[ії]ло|(?:1(?:-?е(?:\.\s*Саму[ії]|\s*Саму[ії])|\.\s*Саму[ії]|\s*Саму[ії])|I(?:\.\s*Саму[иії]|\s*Саму[иії]))ло|1\.?\s*Самуило)ва|П(?:(?:(?:ерш[ае]\s*(?:книга\s*Саму[ії]ло|Саму[ії]ло)|(?:рв(?:а\s*(?:Књига\s*Саму|книга\s*Само)|о\s*книга\s*Само)и|рва\s*Самуи)ло)в|(?:ерш[ае]\s*Книга\s*Саму[ії]л|рва\s*краљевим))а|ърв(?:а\s*(?:книга\s*на\s*)?Самуил|а\s*Книга\s*на\s*царете|о\s*(?:Книга\s*на\s*царете|Цар(?:ства|е)|Самуил)|а\s*(?:книга\s*Царства|Цар(?:ства|е)))|рво\s*Самуил)|E(?:nsimm[aä]inen\s*Samuelin|erste\s*Sam|ls[oő]\s*S[aá]m)|1\.?\s*Kongerigernes\s*Bog|शम(?:ूएलको\s*पहिलो|ुऐल\s*की\s*[1१]ली)\s*पुस्तक|(?:1-?(?:ше|а)\.\s*Книга\s*Саму[ії]л|(?:1(?:-?е\.?\s*Книга\s*С|\.?\s*Книга\s*С)|I\.?\s*Книга\s*С)аму[ії]л|1-?(?:ше|а)\s*Книга\s*Саму[ії]л|(?:1\.?\s*кр|I\.?\s*кр)аљевим|1(?:-?е\.?\s*Самуи|(?:-?я|[ея])\.?\s*Самуи)л)а|ਸਮੂਏਲ\s*ਦੀ\s*ਪਹਿਲੀ\s*ਪੋਥੀ|(?:1\.?\s*Книга\s*н|I\.?\s*Книга\s*н)а\s*царете|δυτικ[οό]ς\s*Σαμου[ήη]λ\s*Α['ʹʹ΄’]|1(?:(?:-?е(?:\.\s*(?:Книга\s*)?Ц|\s*(?:Книга\s*)?Ц)|\.?\s*Книга\s*Ц)арств|(?:-?я|[ея])(?:\.\s*(?:Книга\s*)?Царств|\s*(?:Книга\s*)?Царств)|\s*(?:(?:(?:(?:(?:(?:(?:(?:[ei]\.?\s*Samuelit|ਸਮੂਏਲ)|Samuel(?:sbog|i[st]|[el]))|Самуила)|samūelko)|samuelko)|šam[uū]elko)|शमूएलको)|ซ(?:ามูเอล|มอ))|\.\s*(?:Samuel(?:sbog|i[st]|[el])|[sš]am[uū]elko|Самуила|शमूएलको|ซ(?:ามูเอล|มอ))|사무)|(?:1\.?\s*Ks|I\.?\s*Ks)(?:i[eę]g[ai]\s*Samuela|\.?\s*Samuela)|(?:1\.?\s*Samuelin|I\.?\s*Samuelin)\s*kirja|S(?:amu(?:u['’]eel\s*Kowaad|el[ls])|amuelis\s*I|amueli?\s*I|ámuel\s*I)|Liber\s*I\s*Samuelis|Fyrri\s*Sam[uú]elsb[oó]k|(?:Pr(?:emi(?:ere?|ère)s|imero)|Erste[nrs]|1(?:(?:(?:(?:ere|\.[oº]|º)|er)|re)|ère)\.|Unang)\s*Samuel|سفر\s*صموئيل\s*الأول|(?:1\.?\s*Samuelsboke|1\.?\s*Sa-?mu-?ê|I\.?\s*Sa-?mu-?ê)n|(?:Primeir[ao]\s*Reino|First\s*Kingdom|1st\.\s*Kingdom|1st\s*Kingdom|(?:1\.?\s*Ki|I\.?\s*Ki)ngdom|(?:1[ao]\.\s*Rei|(?:(?:1\.?\s*Rei|I\.?\s*Rei)|1[ao]\s*Rei))no)s|samūelko\s*pustak|samuelko\s*pustak|šam[uū]elko\s*pustak|(?:Primeir[ao]\s*S|(?:1[ao]\.\s*|1[ao]\s*)S)amuel|(?:Pr(?:emi(?:ere?|ère)\s*|imer\s*)|Erste\s*|1(?:(?:(?:(?:ere|\.[oº]|º)|er)|re)|ère)\s*|Una\s*)Samuel|Prv(?:a\s*Samuelova|n[ií]\s*S(?:am(?:uel)?)?)|F(?:ørste\s*Sam(?:uels?)?|irst\s*S(?:a(?:m(?:u[ae]l)?)?|m))|(?:Avval(?:\s*[Ss]|s)am(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei])|avval\s*samu['’]ī|Premye\s*Samy[eè]|Eerste\s*Samu[eë]|(?:Avval|1\s*?)Samow(?:ey|i)|(?:(?:Avval|1)Samu['w’]|(?:Avval|1\s*?)Samoe|1\s*Sam(?:u['w’]|wi))i|(?:Avval|1)Samw[ei]i|Yek(?:\s*sam(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei])|sam(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei]))|1-?(?:ше|а)\.\s*Samu[iï]|Перш[ае]\s*Samu[iï]|(?:Avval|1)Samu[ei]|1-?е\.?\s*Samu[iï]|1-?(?:ше|а)\s*Samu[iï]|1e\.\s*Samu[eë]|1(?:\s*(?:Sam(?:wei|u[iëï])|Cāmuvē)|\.\s*Samu[iëï])|I(?:\.\s*Samu[iëï]|\s*Samu[iëï])|1\s*samūʾī|(?:1\.?\s*Samy|I\.?\s*Samy)[eè]|1e\s*Samu[eë])l|ପ୍ରଥମ\s*ଶାମୁୟେଲଙ|1(?:\.\s*(?:S(?:a(?:m(?:uel(?:s(?:bok)?|i)?)?)?)?|Сам(?:уил)?|शमू(?:एल)?)|\s*Samuel(?:s(?:bok)?|i)?|\s*(?:samūel|சாமு|S(?:am?)?|صم|Ц)|\s*Сам(?:уил)?|\s*शमू(?:एल)?|Sa)|ପ୍ରଥମ\s*ଶାମୁୟେଲ|(?:Avval(?:\s*[Ss]|s)amou|1(?:\.\s*Shamooa|\s*(?:Shamooa|[sŝ]amuw))|1\.?\s*Samuu['’]e|I(?:\.\s*Samuu['’]e|\s*Samuu['’]e)|(?:Avval|1\s*?)Samou|Els[oő]\s*S[aá]mu|Yek\s*?samou|(?:1\.?\s*Sá|I\.?\s*Sá)mu)el|الممالك\s*الأول|1-?(?:ше|а)\.\s*Саму[ії]л|П(?:ерш[ае]\s*Саму[ії]л|ърв(?:а\s*Цар(?:ств)?|о\s*Цар(?:ств)?)|рва\s*Сам(?:уил)?)|1st\.\s*S(?:amu[ae]l[ls]|ma)|صموئيل\s*الأول|Βασιλει[ωώ]ν\s*Α['ʹʹ΄’]|पहिले\s*शमुवेल|1\.?\s*Samuelin|I\.?\s*Samuelin|1st\.\s*S(?:a(?:m(?:u[ae]l)?)?|m)|(?:1(?:-?е(?:\.\s*Саму[ії]|\s*Саму[ії])|\.\s*Саму[ії]|\s*Саму[ії])|I(?:\.\s*Саму[иії]|\s*Саму[иії]))л|1-?(?:ше|а)\s*Саму[ії]л|1\.?\s*Regnorum|I(?:\.\s*(?:Samuel(?:is|[els])|Regnorum|Царе)|\s*(?:Samuel(?:is|[els])|Regnorum|Царе))|1°\.\s*Samuele|1st\s*S(?:amu[ae]l[ls]|ma)|(?:اول|۱)\s*سمو(?:ئ(?:یل[ہی]|ل)|یل)|(?:اوّل\s*سموئ[يی]|(?:اوّل(?:-?سموئ|۔سموا)|(?:1\.|۱)-?سموئ|(?:1\.?۔|۱۔)سموا|1-?سموئ|[1۱]سموئئ|[1۱]سموائ|1سم(?:وء|ؤ)|۱سم(?:وء|ؤ))ی|(?:اول|۱)\s*سم(?:و(?:ئ(?:یی|ي)|یی|ای)|(?:و(?:ئئ|ائ|ء)|ؤ)ی|ئوی)|اولسم(?:و(?:ئ(?:یی|ي)|یی|ای)|(?:و(?:ئئ|ائ|ء)|ؤ)ی|ئوی)|یک(?:\s*سم(?:و(?:ئ(?:یی|ي)|یی|ای)|(?:و(?:ئئ|ائ|ء)|ؤ)ی|ئوی)|سم(?:و(?:ئ(?:یی|ي)|یی|ای)|(?:و(?:ئئ|ائ|ء)|ؤ)ی|ئوی))|1(?:\.\s*سموئ[يی]|\s*صموئي)|1\s*سم(?:و(?:ئ(?:یی|ي)|یی|ای)|(?:و(?:ئئ|ائ|ء)|ؤ)ی|ئوی)|[1۱]سموئ(?:یی|ي)|[1۱]سمویی|[1۱]سموای|[1۱]سمئوی)ل|ﺻﻤﻮﺋﻴﻞ\s*ﺍﻷﻭﻝ|1\.?\s*ଶାମୁୟେଲଙ|I(?:\.\s*(?:S(?:a(?:m(?:ueli?)?)?)?|Сам)|\s*(?:S(?:a(?:m(?:ueli?)?)?)?|Сам))|1st\s*S(?:a(?:m(?:u[ae]l)?)?|m)|Kwanza\s*Sam|(?:اول|۱)\s*سموئیل|1\.?\s*ଶାମୁୟେଲ|1°\s*Samuele|(?:1\.?\s*Samua|I\.?\s*Samua|Samua)l[ls]|(?:1\.\s*Samw|I\.?\s*Samw)eli|Α['ʹʹ΄’]\s*Σαμου[ήη]λ|اولسمو(?:ئ(?:یل[ہی]|ل)|یل)|یک(?:\s*سمو(?:ئ(?:یل[ہی]|ل)|یل)|سمو(?:ئ(?:یل[ہی]|ل)|یل))|(?:1\.?\s*Царс|I\.?\s*Царс)тва|(?:1\.?\s*Regi|I\.?\s*Regi)lor|1\s*(?:சாமுவேல|அரசுகள)்|(?:1\.?\s*Samua|I\.?\s*Samua|Samua)l|اولسموئیل|یک\s*?سموئیل|(?:1\.?\s*Царс|I\.?\s*Царс)тв|1\s*Samweli|1\s*سمو(?:ئ(?:یل[ہی]|ل)|یل)|1\.?\s*शामुएल|AvvalSam|1\s*سموئیل|שמואל\s*א['’]|[1۱]سموئ(?:یل[ہی]|ل)|1\s*शमुवेल|1e\.\s*Sam|שמואל\s*א|[1۱]سموئیل|1\.\s*Царе|《撒(?:(?:慕爾紀)?上》|母耳[記记]上》)|사무엘(?:기(?:\s*상권|상)|\s*?상)|Samuel|(?:1\.?\s*Sá|I\.?\s*Sá)m|1e\s*Sam|《撒(?:(?:慕爾紀)?上|母耳[記记]上)|Α['ʹʹ΄’]\s*Σαμ|1\s*Царе|avvals|(?:1\.?\s*Sm|I\.?\s*Sm)a|撒(?:(?:慕爾紀)?上》|母耳[記记]上》)|[1۱]سمویل|サムエル(?:\s*1|前書|記[Ⅰ上]|上)|列王記第一巻|1\.?\s*Sm|I\.?\s*Sm|撒(?:(?:慕爾紀)?上|母耳[記记]上)|1سامو|۱(?:سامو|smu)|[1۱]sāmu|Ⅰサムエル|1سمو?|۱(?:سمو?|sm)|1Sam|اولس|1smu|1sm|삼상))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Hanidabaa\s*Odiya\s*Naa77antto\s*Maxaafaa|நாளாகமத்தின்\s*இரண்டாம்\s*புத்தகம்|или\s*Втора\s*книга\s*Паралипоменон|(?:Cartea\s*a\s*doua\s*Paralipomen|D(?:ruga\s*(?:knjiga\s*)?Ljetopis|ezy[eè]m\s*(?:liv\s*Kwonik\s*l|Istw))|I(?:kalawang\s*(?:Mga\s*)?Cronic|I\.?\s*Mga\s*Cronic)|I(?:kalawang\s*Mg|I\.?\s*Mg)a\s*Kronik|T(?:awarikh\s*Yang\s*Kedu|oinen\s*Aikakirj)|M(?:asodik\s*Kr[oó]nik|ásodik\s*Kr[oó]nik)|2(?:\.\s*(?:Mga\s*[CK]roni[ck]|Cronik)|\s*(?:Mga\s*[CK]roni[ck]|(?:Cronik|(?:Istw|Ny))))|(?:II\.?\s*Lj|2\.\s*Lj)etopis|(?:II\.?\s*A|2\.\s*A)ikakirj|2\s*Ljetopis|2\s*Aikakirj|(?:II\.?\s*Kró|2\.?\s*Kró)nik|II\.?\s*Istw|2\.\s*Istw|Pili\s*Ny|(?:II\.?\s*N|2\.\s*N)y)a|Втор(?:а\s*(?:(?:книга\s*на\s*летописите|(?:книга\s*летописи|(?:Летописи|Парал)))|Книга\s*на\s*летописите)|о\s*(?:Книга\s*на\s*летописите|книга\s*летописи|Летописи|Парал))|(?:Druh(?:[aá]\s*kniha|[yý]\s*list)\s*P|Second\s*P|2\s*k\.?\s*P|2nd\.?\s*P)aralipomenon|(?:Втора\s*книга\s*П|2(?:\.?\s*Книга\s*П|-?е\.?\s*П|(?:-?я|[ея])\.?\s*П))аралипоменон|2(?:-?е\.?\s*К|(?:-?я|[ея])\.?\s*К)нига\s*Паралипоменон|II\.?\s*Книга\s*на\s*летописите|سفر\s*أخبار\s*الأيام\s*الثاني|ବଂଶାବଳୀର\s*ଦ୍ୱିତୀୟ\s*ପୁସ୍ତକ|I(?:kalawang\s*(?:Paralipomeno|Kronik(?:el|a))|I(?:\.\s*(?:Paralipomen(?:on|a)|Kronika|Lịch\s*sử|\s*Sử\s*Ký|Sử\s*ký|Chrn)|\s*(?:(?:(?:(?:(?:(?:Paralipomen(?:on|a)|Taw)|Chrn)|Kronika)|Lịch\s*sử)|Sử\s*ký)|\s*Sử\s*Ký))|I\.?\s*Kronikel)|2\.?\s*Книга\s*на\s*летописите|Liber\s*II\s*Paralipomenon|इतिहास(?:को\s*दोस्रो\s*पुस्तक|\s*[2२]रा\s*भाग)|Pili\s*Mambo\s*ya\s*Nyakati|D(?:ruh(?:[aá]\s*kniha\s*Kroni(?:ck[aá]|k)|[yý]\s*(?:list\s*Kroni(?:ck[aá]|k)|Letopis[uů]|Kroni(?:ck[aá]|k))|[aá]\s*Letopis[uů]|[aá]\s*Kroni(?:ck[aá]|k))|o(?:(?:vom(?:\s*[Tt]|T)|T)(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|\s*t(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|vomChr))|(?:II\.?\s*Ma|2\.?\s*Ma)mbo\s*ya\s*Nyakati|(?:Deuxi[eè]mes?\s*Chronique|2(?:(?:eme|de?)|ème)\.\s*Chronique|2(?:(?:eme|de?)|ème)\s*Chronique|2nd\.?\s*Chronical|(?:II\.?\s*Chroniq|2\.?\s*Chroniq)ue|2e\.?\s*Chronique|(?:II\.?\s*Chronic|2\.?\s*Chronic)al|2\s*itahā)s|Друг(?:а\s*(?:Књига\s*дневника|дневника|хроника|Днв)|а\s*Паралипоменону|а\s*книга\s*хроніки|е\s*(?:книга\s*хроніки|Літопису|[HȞ]roniky|Хроніка)|а\s*Літопису|а\s*[HȞ]roniky|а\s*Хроніка)|itahās\s*dī\s*dūjī\s*potʰī|(?:Ikalawang\s*Chronicl|2(?:(?:\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\s*Kronika)|\.\s*Kronika)v)e|Mambo\s*ya\s*Nyakati\s*II|(?:Dru(?:g(?:a\s*Ks(?:i[eę]g[ai]\s*K|\.?\s*K)|i\s*Ks(?:i[eę]g[ai]\s*K|\.?\s*K))|h(?:[aá]|[yý])\s*kniha\s*k)|(?:II\.?\s*Ks|2\.?\s*Ks)(?:i[eę]g[ai]\s*K|\.?\s*K)|(?:(?:II\.?\s*k|2\.\s*k)|2\s*k)niha\s*k)ronik|2-?(?:ге|а)\.\s*(?:книга\s*хроніки|Літопису|[HȞ]roniky|Хроніка)|Druh(?:[aá]|[yý])\s*Paralipomenon|δυτικ[οό]ς\s*Χρονικ[ωώ]ν\s*Β['ʹʹ΄’]|أخبار\s*الأيام\s*الثاني|2-?(?:ге|а)\.\s*(?:книга\s*х|Х)ронік|Друг(?:а\s*(?:книга\s*хронік|(?:Хронік|Дн))|е\s*(?:книга\s*х|Х)ронік)|Se(?:cond(?:(?:\s*C(?:h?oron[io]cles|hr(?:onicles|n)|(?:hrono|ron[io])cles)|[ao]\s*Cronache)|\s*Chronicals)|gund(?:a\s*Cr[oô]nicas|o\s*Cr[oóô]nicas))|Taariikhdii\s*Labaad|(?:Druh(?:(?:[aá]\s*kniha|[aá])\s*Kroní|[yý]\s*(?:list\s*)?Kroní)|S(?:iðari\s*Kron[ií]kub[oó]|íðari\s*(?:Kron[ií]kub[oó]|kroníkubó))|Andre\s*Krønikebo|2\s*k\.\s*Kroní|II\.?\s*Kroní|2\s*k\s*Kroní|2\.?\s*Kroní)k|(?:II\.?\s*Књ|2\.?\s*Књ)ига\s*дневника|II\.?\s*Паралипоменону|2-?е\.?\s*книга\s*хроніки|2-?(?:ге|а)\s*(?:книга\s*хроніки|Літопису|[HȞ]roniky|Хроніка)|(?:II\.?\s*книга\s*л|2\.?\s*книга\s*л)етописи|(?:(?:Andra\s*Kr[oö]nikebo|2\.?\s*Kronikebo|2\.\s*Krönikebo|2\s*Krönikebo|II\.?\s*Kronie|2\.?\s*Kronie)ke|II\.?\s*Sử\s*biên\s*niê|Tweede\s*Kronieke|2\.?\s*Sử\s*biên\s*niê|2e\.?\s*Kronieke|Anden\s*Kro)n|ਇਤਹਾਸ\s*ਦੀ\s*ਦੂਜੀ\s*ਪੋਥੀ|Second\s*C(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)|2-?е\.?\s*книга\s*хронік|2-?(?:ге|а)\s*(?:книга\s*х|Х)ронік|2(?:\.\s*(?:Паралипоменону|Kr(?:ønikebo[gk]|oni(?:kel|ca))|Летопис[иь]|इतिहासको|พ(?:งศาวดาร|ศด)|Chr(?:onik|n))|\s*Паралипоменону|-?е\.?\s*Летопись|(?:-?я|[ея])(?:\.\s*(?:Летопись|Хроник)|\s*(?:Летопись|Хроник))|\s*(?:குறிப்பேடு|Nāḷākamam|tavārīḫ|ਇਤਹਾਸ|Tawh|HanO|Krn|Днв)|\s*Krønikebo[gk]|(?:-?е\.?\s*Хрони|\.?\s*Хрони)к|\s*Kroni(?:kel|ca)|\s*Летопис[иь]|\s*इतिहासको|\s*พ(?:งศาวดาร|ศด)|\s*Chr(?:onik|n)|tawā|역대)|(?:II\.?\s*книга\s*х|2\.?\s*книга\s*х)роніки|Παραλειπομ[έε]νων\s*Β['ʹʹ΄’]|ﺃﺧﺒﺎﺭ\s*ﺍﻷﻳﺎﻡ\s*ﺍﻟﺜﺎﻥ|2(?:\.\s*(?:Парал(?:ипоменон)?|Kr(?:o(?:n(?:ika?)?)?|øn?)|इति(?:हास)?|C(?:hr(?:on?)?|ron)|Лет)|\s*Парал(?:ипоменон)?|\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\s*Kro(?:n(?:ika?)?)?|\s*(?:itih[aā]s|Aik(?:ak)?|C(?:r(?:[óô]n?|o)?|h)|Krön|Ljet|хрон|குறி|நாளா|Ist|Taw|Пар|Дн|Хр)|\s*इति(?:हास)?|\s*Chr(?:on?)?|\s*Cron|\s*Krøn?|\s*Лет|Taw|توا?)|II(?:\.\s*(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?)|Kro(?:n(?:ik)?)?|Парал|Taar|Sử)|\s*(?:(?:(?:(?:(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?))|Kro(?:n(?:ik)?)?)|Sử)|Taar)|Парал))|(?:II\.?\s*книга\s*х|2\.?\s*книга\s*х)ронік|2\.?\s*Paralipomen(?:on|a)|Anden\s*Krønikebog|2nd\.?\s*C(?:h?oron[io]cles|hr(?:onicles|n)|(?:hrono|ron[io])cles)|(?:Paralipomenon|Kr[oó]nik[aá]k)\s*II|ଦ୍ୱିତୀୟ\s*ବଂଶାବଳୀର|2\.?\s*Pa(?:r(?:alipomeno)?)?|2nd\.?\s*C(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)|ଦ୍ୱିତୀୟ\s*ବଂଶାବଳୀ|(?:dovvom\s*tawā|2\s*?Tawa|2\s*?Toa)rikh|(?:II\.?\s*Taariikhdi|2\.?\s*Taariikhdi)i|(?:II(?:\.\s*Ch?o|\s*Ch?o)|2(?:\.\s*Ch?o|\s*Ch?o))ron[io]cles|Zweite(?:[nrs])?\s*Chronik|(?:II(?:\.\s*Ch?o|\s*Ch?o)|2(?:\.\s*Ch?o|\s*Ch?o))ron[io]cle|(?:II\.?\s*Cronicilo|2\.?\s*Cronicilo)r|(?:II\.?\s*Chronic|2\.?\s*Chronic)les|(?:II(?:\.\s*Ch?rono|\s*Ch?rono)|2(?:\.\s*Ch?rono|\s*Ch?rono))cles|(?:II\.?\s*Chronic|2\.?\s*Chronic)le|(?:II(?:\.\s*Ch?rono|\s*Ch?rono)|2(?:\.\s*Ch?rono|\s*Ch?rono))cle|2\s*k\.\s*Kroni(?:ck[aá]|k)|(?:II(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a))|2\.?\s*Cronic(?:le|a))s|(?:2(?:(?:\.[oº]|º)(?:\.\s*Cr[oó]|\s*Cr[oó])|\.\s*Cr[óô])|II(?:\.\s*Cr[óô]|\s*Cr[óô])|2a\.\s*Cr[oô]|2a\s*Cr[oô])nicas|(?:D(?:ezy[eè]m\s*Kw|rug[ai]\s*Kr)|II\.?\s*Kw|2\.?\s*Kw)onik|(?:2(?:-?е\.?\s*Лі|\.?\s*Лі)|II\.?\s*Лі)топису|(?:(?:2-?(?:ге|а)\.\s*х|(?:(?:2-?е\.?\s*х|(?:(?:II\.?\s*х|2\.\s*х)|2\s*х))|2-?(?:ге|а)\s*х))ронік|Друг[ае]\s*хронік)и|דברי\s*הימים\s*ב['’]|II(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a))|M(?:asodik\s*Kr[oó]n|ásodik\s*Kr[oó]n)|דברי\s*הימים\s*ב|(?:II\.?\s*Le|2\.?\s*Le)topis[uů]|II\.?\s*Kronick[aá]|2\s*k\s*Kroni(?:ck[aá]|k)|دو(?:م(?:-?\s*توارِ|(?:\s*تو\s*|۔تو)ار)یخ|م\s*توار(?:ی(?:که|خ)|ي?خ)|متوار(?:ی(?:که|خ)|ي?خ)|\s*توار(?:ی(?:که|خ)|ي?خ)|توار(?:ی(?:که|خ)|ي?خ))|(?:II\.?\s*Crona|2\.?\s*Crona)che|2°\.\s*Cronache|2o\.\s*Cr[oóô]nicas|(?:II\.?\s*д|2\.?\s*д)невника|(?:2(?:-?е(?:\.\s*[HȞ]|\s*[HȞ])|\.\s*[HȞ]|\s*Ȟ)|II(?:\.\s*[HȞ]|\s*[HȞ]))roniky|2(?:-?е\.?\s*Хроні|\.?\s*Хроні)ка|II\.?\s*Летописи|दुसरे\s*इतिहास|2\.?\s*Cronic(?:le|a)|Tweede\s*Kron|2(?:-?е\.?\s*Хроні|\.?\s*Хроні)к|2(?:\.\s*itih[aā]sk|\s*itih[aā]sk)o|2\.\s*Tawarikh|2\.?\s*Kronick[aá]|Β['ʹʹ΄’]\s*(?:Χρονικ[ωώ]ν|Παρ)|(?:(?:2\.|۲)-?\s*توارِی|(?:(?:2\.?|۲)\s*تو\s*|(?:2\.?۔|۲۔)تو)اری|2-?\s*توارِی|2(?:تواري|\s*أ)|۲تواري)خ|2°\s*Cronache|2o\s*Cr[oóô]nicas|(?:(?:II\.?\s*х|2\.\s*х)|2\s*х)роника|II\.?\s*Хроніка|Χρονικ[ωώ]ν\s*Β['ʹʹ΄’]|2\.?\s*ବଂଶାବଳୀର|2\.?\s*Cronic[il]|Druh(?:[aá]\s*Kron|[yý]\s*(?:Kron|Pa)|[aá]\s*Pa)|دو(?:م(?:(?:\s*تواریک|ت)|تواریک)|\s*تواریک|تواریک)|And(?:en\s*Krøn|re\s*Krøn?)|II\.?\s*Хронік|2\.?\s*ବଂଶାବଳୀ|2\.\s*Lịch\s*sử|2\s*?Towar[iy]kh|2\s*Cr[óô]nicas|2\s*Дневника|2\s*நாளாகமம்|Втор[ао]\s*Лет|2\s*Lịch\s*sử|2\.?\s*\s*Sử\s*Ký|2\s*?Towrikh|[2۲]\s*توار(?:ی(?:که|خ)|ي?خ)|2\.?\s*Itihas|(?:II\.?\s*Bab|2\.?\s*Bab)ad|2\s*Hroniky|الأخبار\s*2|[2۲]\s*تواریک|2e\.?\s*Kron|(?:II\.?\s*Kró|2\.?\s*Kró)n|2\.?\s*Sử\s*ký|[2۲]تواریکه|2\.?\s*Taar|Β['ʹʹ΄’]\s*(?:Χρ(?:ον)?|Πα)|[2۲]تواریک|II\.?\s*Лет|2towāri|2تواری?خ|۲(?:towāri|تواری?خ)|dovvomt|(?:II\.?\s*Д|2\.\s*Д)нв|2tow(?:ār)?|2تواری?|۲(?:tow(?:ār)?|تو(?:اری?)?)|(?:II\.?\s*Д|2\.\s*Д)н|역대(?:기\s*하권|지?하)|(?:《?歷代志|《?历代志|《?代)下》|《?編年紀下》|2\.?\s*Sử|역대기\s*하|(?:《?歷代志|《?历代志|《?代)下|《?編年紀下|歴(?:代(?:志略?下|誌[Ⅱ下]|史下)|下)|歴代誌\s*2|2Chr|《?歷下》|《?歷下|Ⅱ歴代|대하))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Hanidabaa\s*Odiyaa\s*Koiro\s*Maxaafaa|или\s*Първа\s*книга\s*Паралипоменон|நாளாகமத்தின்\s*முதலாம்\s*புத்தகம்|П(?:ърв(?:а\s*(?:(?:книга\s*на\s*летописите|Парал)|Книга\s*на\s*летописите)|о\s*(?:Книга\s*на\s*летописите|Парал))|рва\s*(?:Књига\s*дневника|дневника|хроника|Днв)|(?:рв(?:а\s*(?:книга\s*л|Л)ето|о\s*(?:книга\s*л|Л)ето)пис|ърв[ао]\s*Летопис)и|рва\s*Паралипоменону|ерш[ае]\s*(?:книга\s*хроніки|Літопису|[HȞ]roniky|Хроніка|хроніки))|(?:Cartea\s*[iî]nt[aâ]i\s*Paralipomen|Pr(?:va\s*(?:knjiga\s*)?Ljetopis|emye\s*(?:liv\s*Kwonik\s*l|Istw))|Ensimm[aä]inen\s*Aikakirj|Tawarikh\s*Yang\s*Pertam|Una(?:ng\s*(?:Mga\s*(?:Cronic|Kronik)|Cronic)|\s*(?:Mga\s*(?:Cronic|Kronik)|Cronic))|1(?:\.\s*(?:Mga\s*[CK]roni[ck]|Cronik)|\s*(?:Mga\s*[CK]roni[ck]|(?:Cronik|(?:Istw|Ny))))|I\.?\s*Mga\s*(?:Cronic|Kronik)|(?:1\.\s*Lj|I\.?\s*Lj)etopis|(?:1\.\s*A|I\.?\s*A)ikakirj|(?:Els[oő]\s*Kr[oó]ni|(?:1\.?\s*Kró|I\.?\s*Kró)ni)k|1\s*Ljetopis|1\s*Aikakirj|Kwanza\s*Ny|1\.\s*Istw|I\.?\s*Istw|(?:1\.\s*N|I\.?\s*N)y)a|(?:Първа\s*книга\s*П|1\.?\s*Книга\s*П|1(?:-?е\.?\s*П|(?:-?я|[ея])\.?\s*П))аралипоменон|(?:Prv(?:(?:[aá]\s*kniha|[aá])\s*P|[yý]\s*(?:list\s*)?P)|First\s*P|1\s*k\.?\s*P|1st\.\s*P|1st\s*P)aralipomenon|1(?:-?е\.?\s*К|(?:-?я|[ея])\.?\s*К)нига\s*Паралипоменон|Kwanza\s*Mambo\s*ya\s*Nyakati|1\.?\s*Книга\s*на\s*летописите|I\.?\s*Книга\s*на\s*летописите|(?:(?:P(?:ierwsz[aey]\s*Ks(?:i[eę]g[ai]\s*K|\.?\s*K)|rvn[ií]\s*kniha\s*k)|(?:1\.?\s*Ks|I\.?\s*Ks)(?:i[eę]g[ai]\s*K|\.?\s*K)|(?:(?:1\.\s*k|I\.?\s*k)|1\s*k)niha\s*k)roni|Prv(?:[aá]\s*kniha\s*Kroní|[yý]\s*(?:list\s*)?Kroní|n[ií]\s*Kroni|[aá]\s*Kroní)|Fyrri\s*(?:Kron[ií]kub[oó]|kroníkubó)|(?:P(?:ierwsz[aey]\s*Kr|remye\s*Kw)|1\.?\s*Kw|I\.?\s*Kw)oni|Erste(?:[nrs])?\s*Chroni|1\s*k\.\s*Kroní|1\s*k\s*Kroní|1\.?\s*Kroní|I\.?\s*Kroní)k|it(?:ahās\s*dī\s*pahilī\s*potʰī|ih[aā]sko\s*pustak)|سفر\s*أخبار\s*الأيام\s*الأول|Liber\s*I\s*Paralipomenon|इतिहास(?:को\s*पहिलो\s*पुस्तक|\s*[1१]ला\s*भाग)|ବଂଶାବଳୀର\s*ପ୍ରଥମ\s*ପୁସ୍ତକ|(?:Premi(?:eres?\s*Chroniqu|ères?\s*Chroniqu|ers?\s*Chroniqu)|(?:1(?:(?:ere?|re)|ère)\.\s*Chroniq|(?:1(?:(?:ere?|re)|ère)\s*Chroniq|(?:1\.?\s*Chroniq|I\.?\s*Chroniq)))u)es|Prv(?:[aá]\s*kniha\s*Kroni(?:ck[aá]|k)|[yý]\s*(?:list\s*Kroni(?:ck[aá]|k)|Kroni(?:ck[aá]|k))|n[ií]\s*Letopis[uů]|[aá]\s*Kroni(?:ck[aá]|k))|(?:1\.?\s*Ma|I\.?\s*Ma)mbo\s*ya\s*Nyakati|1-?(?:ше|а)\.\s*(?:книга\s*хроніки|Літопису|[HȞ]roniky|Хроніка|хроніки)|(?:F(?:[oö]rsta\s*Kr[oö]nikeboke|ørste\s*Kro)|(?:Eerste\s*Kronie|1e\.\s*Kronie|1\.?\s*Kronie|I\.?\s*Kronie|1e\s*Kronie)ke|1\.?\s*Sử\s*biên\s*niê|I\.?\s*Sử\s*biên\s*niê|1\.?\s*Kronikeboke|1\.\s*Krönikeboke|1\s*Krönikeboke)n|Prvn[ií]\s*Paralipomenon|δυτικ[οό]ς\s*Χρονικ[ωώ]ν\s*Α['ʹʹ΄’]|ਇਤਹਾਸ\s*ਦੀ\s*ਪਹਿਲੀ\s*ਪੋਥੀ|1-?(?:ше|а)\.\s*(?:книга\s*х|Х)ронік|П(?:ерш[ае]\s*(?:книга\s*х|Х)ронік|ърв[ао]\s*Лет|рва\s*Дн)|Una(?:ng\s*(?:Paralipomeno|Chronicle|Kronik(?:el|a))|\s*(?:Paralipomeno|Chronicle|Kronik(?:el|a)))|1-?е\.?\s*книга\s*хроніки|1-?(?:ше|а)\s*(?:книга\s*хроніки|Літопису|[HȞ]roniky|Хроніка|хроніки)|Mambo\s*ya\s*Nyakati\s*I|Taariikhdii\s*Kowaad|أخبار\s*الأيام\s*الأول|1-?е\.?\s*книга\s*хронік|1-?(?:ше|а)\s*(?:книга\s*х|Х)ронік|1(?:\.\s*(?:Паралипоменону|Kroni(?:kel|ca)|Летопис[иь]|इतिहासको|พ(?:งศาวดาร|ศด)|Chr(?:onik|n))|\s*Паралипоменону|-?е\.?\s*Летопись|(?:-?я|[ея])(?:\.\s*(?:Летопись|Хроник)|\s*(?:Летопись|Хроник))|\s*(?:குறிப்பேடு|Nāḷākamam|tavārīḫ|ਇਤਹਾਸ|Tawh|HanO|Krn|Днв)|(?:-?е\.?\s*Хрони|\.?\s*Хрони)к|\s*Kroni(?:kel|ca)|\s*Летопис[иь]|\s*इतिहासको|\s*พ(?:งศาวดาร|ศด)|\s*Chr(?:onik|n)|tawā|역대)|(?:Prime(?:ir[ao]\s*Cr[oô]nica|r(?:o\s*Cr[oó]|\s*Cr[oó])nica)|(?:1(?:\.[oº]|º)\.\s*Cr[oó]|1(?:o(?:\.\s*Cr[oóô]|\s*Cr[oóô])|\.\s*Cr[óô])|1(?:\.[oº]|º)\s*Cr[oó]|I(?:\.\s*Cr[óô]|\s*Cr[óô]))nica|(?:1\.?\s*Chronic|I\.?\s*Chronic)al|1a\.\s*Cr[oô]nica|1a\s*Cr[oô]nica|1\s*Cr[óô]nica|Chronical|1\.?\s*Itiha|1\s*itahā)s|F(?:irst\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|ørste\s*Krønikebo[gk])|(?:1\.?\s*Књ|I\.?\s*Књ)ига\s*дневника|(?:(?:1\.?\s*книга\s*л|I\.?\s*книга\s*л)е|I\.?\s*Ле)тописи|I\.?\s*Паралипоменону|Παραλειπομ[έε]νων\s*Α['ʹʹ΄’]|1(?:\.\s*(?:Парал(?:ипоменон)?|Kro(?:n(?:ika?)?)?|इति(?:हास)?|C(?:hr(?:on?)?|ron)|Лет)|\s*Парал(?:ипоменон)?|\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\s*Kro(?:n(?:ika?)?)?|\s*(?:itih[aā]s|Aik(?:ak)?|C(?:r(?:[óô]n?|o)?|h)|Krön|Ljet|хрон|குறி|நாளா|Ist|Taw|Пар|Дн|Хр)|\s*इति(?:हास)?|\s*Chr(?:on?)?|\s*Cron|\s*Лет|Taw|توا?)|F(?:irst\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|ørste\s*Krøn?)|1\.?\s*Paralipomen(?:on|a)|I(?:\.\s*(?:Paralipomen(?:on|a)|Kronika|Lịch\s*sử|Sử\s*[Kk]ý|Chrn)|\s*(?:(?:(?:(?:(?:Paralipomen(?:on|a)|Taw)|Chrn)|Kronika)|Sử\s*[Kk]ý)|Lịch\s*sử))|1st\.\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|(?:1\.?\s*книга\s*х|I\.?\s*книга\s*х)роніки|1\.?\s*Pa(?:r(?:alipomeno)?)?|I(?:\.\s*(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?)|Kro(?:n(?:ik)?)?|Парал|Taar|Sử)|\s*(?:(?:(?:(?:(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?))|Kro(?:n(?:ik)?)?)|Sử)|Taar)|Парал))|1st\.\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|(?:1\.?\s*книга\s*х|I\.?\s*книга\s*х)ронік|1st\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|Paralipomenon\s*I|1st\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|(?:1\.?\s*Cho|I\.?\s*Cho)ronicles|(?:(?:1\.?\s*Cho|I\.?\s*Cho)rono|1(?:\.\s*Ch?rono|\s*Ch?rono)|I(?:\.\s*Ch?rono|\s*Ch?rono)|Chrono)cles|(?:1\.?\s*Taariikhdi|I\.?\s*Taariikhdi)i|(?:avval\s*tawā|1\s*?Tawa|1\s*?Toa)rikh|Avval(?:\s*[Tt]|[Tt])(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|(?:1(?:(?:\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\s*Kronika)|\.\s*Kronika)v|Prim[ao]\s*Cronach|1°\.\s*Cronach|(?:1\.?\s*Crona|I\.?\s*Crona)ch|1°\s*Cronach)e|ପ୍ରଥମ\s*ବଂଶାବଳୀର|ﺃﺧﺒﺎﺭ\s*ﺍﻷﻳﺎﻡ\s*ﺍﻷ|P(?:aralipomenon|rvn[ií]\s*(?:Kron|Pa))|(?:(?:1\.?\s*Cho|I\.?\s*Cho)rono|1(?:\.\s*Ch?rono|\s*Ch?rono)|I(?:\.\s*Ch?rono|\s*Ch?rono)|Chrono)cle|ପ୍ରଥମ\s*ବଂଶାବଳୀ|(?:1\.?\s*Cronicilo|I\.?\s*Cronicilo)r|1\s*k\.\s*Kroni(?:ck[aá]|k)|(?:(?:1\.?\s*Chronic|I\.?\s*Chronic)|Chronic)les|(?:1\.?\s*Co|I\.?\s*Co|Ch?o)ron[io]cles|1\.?\s*Krønikebo[gk]|(?:1(?:-?е\.?\s*Лі|\.?\s*Лі)|I\.?\s*Лі)топису|דברי\s*הימים\s*א['’]|(?:(?:1\.?\s*Chronic|I\.?\s*Chronic)|Chronic)le|(?:1\.?\s*Co|I\.?\s*Co|Ch?o)ron[io]cle|דברי\s*הימים\s*א|1\s*k\s*Kroni(?:ck[aá]|k)|(?:1\.?\s*Cronic(?:le|a)|I(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a)))s|Yek(?:\s*t(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|t(?:(?:(?:owar[iy]|owri)|oari)|awari)kh)|(?:1(?:-?е(?:\.\s*[HȞ]|\s*[HȞ])|\.\s*[HȞ]|\s*Ȟ)|I(?:\.\s*[HȞ]|\s*[HȞ]))roniky|1(?:-?е\.?\s*Хроні|\.?\s*Хроні)ка|1-?е\.?\s*хроніки|(?:اوّل(?:-?توارِ|[\s*۔]توار)ی|(?:1\.|۱)-?توارِی|(?:1\.\s*|(?:1\.?۔|۱۔))تواری|1-?توارِی|1(?:تواري|\s*أ)|۱تواري)خ|पहिले\s*इतिहास|E(?:erste\s*Kron|ls[oő]\s*Kr[oó]n)|1\.?\s*Cronic(?:le|a)|I(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a))|1(?:-?е\.?\s*Хроні|\.?\s*Хроні)к|(?:1\.?\s*Le|I\.?\s*Le)topis[uů]|1\.?\s*Kronick[aá]|I\.?\s*Kronick[aá]|Α['ʹʹ΄’]\s*(?:Χρονικ[ωώ]ν|Παρ)|1\.\s*Tawarikh|I\.?\s*Kronikel|1(?:\.\s*itih[aā]sk|\s*itih[aā]sk)o|(?:1\.?\s*д|I\.?\s*д)невника|(?:اول|۱)\s*توار(?:ی(?:که|خ)|ي?خ)|Χρονικ[ωώ]ν\s*Α['ʹʹ΄’]|1\.?\s*ବଂଶାବଳୀର|1\.?\s*Cronic[il]|(?:اول|۱)\s*تواریک|1\.?\s*ବଂଶାବଳୀ|1\.\s*Lịch\s*sử|1\s*?Towar[iy]kh|(?:1\.?\s*хрони|I\.?\s*хрони)ка|1\s*Дневника|I\.?\s*Хроніка|(?:1\.?\s*хроні|I\.?\s*хроні)ки|اولتوار(?:ی(?:که|خ)|ي?خ)|یک(?:\s*توار(?:ی(?:که|خ)|ي?خ)|توار(?:ی(?:که|خ)|ي?خ))|Kr[oó]nik[aá]k\s*I|1\s*நாளாகமம்|I\.?\s*Хронік|اولتواریک|یک\s*?تواریک|1\s*Lịch\s*sử|الأخبار\s*1|Cron[io]cles|1\s*?Towrikh|1\s*Hroniky|1\s*توار(?:ی(?:که|خ)|ي?خ)|1e\.\s*Kron|Cron[io]cle|1\s*تواریک|1\.?\s*Sử\s*[Kk]ý|AvvalChr|[1۱]تواریکه|(?:1\.?\s*Bab|I\.?\s*Bab)ad|1\.?\s*Taar|Α['ʹʹ΄’]\s*(?:Χρ(?:ον)?|Πα)|(?:1\.?\s*Kró|I\.?\s*Kró)n|1e\s*Kron|1\.?\s*Krøn?|[1۱]تواریک|1towāri|1تواری?خ|۱(?:towāri|تواری?خ)|1tow(?:ār)?|1تواری?|۱(?:tow(?:ār)?|تو(?:اری?)?)|I\.?\s*Лет|avvalt|역대(?:기\s*상권|지?상)|(?:《?歷代志|《?历代志|《?代)上》|《?編年紀上》|(?:1\.\s*Д|I\.?\s*Д)нв|1\.?\s*Sử|역대기\s*상|(?:《?歷代志|《?历代志|《?代)上|《?編年紀上|(?:1\.\s*Д|I\.?\s*Д)н|歴(?:代(?:志略?上|誌[Ⅰ上]|史上)|上)|歴代誌\s*1|اولت|1Chr|《?歷上》|《?歷上|Ⅰ歴代|대상))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(Ezra\s*[ah]|(?:எஸ்(?:றாவின்\s*புத்தகம்|ரா)|(?:K(?:s(?:i[eę]g[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|njiga\s*Ezrin)|E(?:sran\s*kirj|zdrasz)|(?:[EÊ]-?xơ-?|Aej)r|Cesra|Étr)a|एज्राको\s*पुस्तक|Книга\s*(?:на\s*Ездра|Ез(?:др[иы]|ри))|Li(?:v\s*Esdras\s*la|ber\s*Esdrae)|Первая\s*Ездры|E(?:s(?:ra(?:s\s*bok|b[oó]k)|dra[es])|z(?:ra(?:s\s*Bog|[ah])|sdr[aá]s|dr(?:aš|á[sš]))|d)|سفر\s*عزرا|(?:Језд|Ез)рина|एज्रा(?:को)?|ع(?:ِ(?:\s*زر(?:اء|ه)|زر(?:اء|ه))|\s*زر(?:اء|ه)|زر(?:ا[ءی]|ه)|ـز)|《?厄斯德拉上》|E(?:z(?:d(?:r(?:as?)?)?|ra?|sd)|s(?:d(?:ra?)?|r(?:a(?:n|s)?)?))|ع(?:ِ\s*?زرا|\s*زرا|زرا?)|《?厄斯德拉上|e(?:ǳr[aā]ko|zrāy|dzr[aā])|Izra(?:\s*[ah]|[ah])|Јездра|Εσδρας|Έσδρας|ع(?:ِ\s*?ذ|ز\s*|\s*ذ|ذ)را|(?:《?以斯拉[記记]|《拉)》|எஸ்றா|《?以斯拉[記记]|Izira|Ез(?:др[аиы]|ра)|ʿizrā|1\s*Езд|Уза[ий]р|ਅਜ਼ਰਾ|ଏଜ୍ରା|เอสรา|Єздри|Cesr?|e(?:zrā?|ǳr[aā])|Izra|Izir|Ез(?:ри?|д)|Језд|Êxra|에[스즈]라기|Esṛā|azrā|עזרא|エ[スズ]ラ[書記]|Êxr|Єзд|에(?:즈라?|스라)|エ[スズ]ラ|อสร|Εσ|《拉|Ἔσ|拉》|스))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ruth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ரூத்த(?:ின்\s*சரித்திரம்|ு)|K(?:itabu\s*cha\s*Ruth[iu]|njiga\s*o\s*Ruti|s(?:i[eę]g[ai]\s*Ruthy|\.?\s*Ruthy))|ଋତର\s*ବିବରଣ\s*ପୁସ୍ତକ|r(?:ūt(?:ʰko\s*pustak|h?ī)|utʰko\s*pustak)|र(?:ू(?:थको\s*पुस्तक|त)|ुत)|Ruutin\s*kirja|К(?:њига\s*о\s*Рути|нига\s*Ру(?:фи|т))|Ks(?:i[eę]g[ai]\s*Rut|\.?\s*Rut)|Li(?:ber\s*Ruth|v\s*Rit\s*la)|R(?:u(?:t(?:h(?:s\s*Bog|[iu])|[ei])|-?tơ|ud)|oot[eh]|th|[iúū]t)|سفر\s*راعوث|Rut(?:arb[oó]|s\s*bo)k|R(?:u(?:ut(?:in)?|t(?:a|h|s)?)?|oot|t)|r(?:ūt(?:ʰ(?:ko)?|h?)|utʰ(?:ko)?)|น(?:างรู|ร)ธ|रूथ(?:को)?|Uruto|(?:《?盧德傳|《?得)》|《?路得[記记]》|راعوث|《?盧德傳|《?路得[記记]|ரூத்|ر(?:و(?:ت[تـهی]|[ثط])|ُوت|ۆت)|Ру(?:та|фь)|Ρουθ|Uru|ر(?:وت|ا)|Ру[тф]|רות|ルツ記|῾Ρθ|ਰੂਥ|ルツ|《?得|룻기|룻))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Neh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:நெகேமியாவின்\s*புத்தகம்|ନିହିମିୟାଙ୍କର(?:\s*ପୁସ୍ତକ)?|n(?:ahemy[aā]hko\s*pustak|ahamyāh|iḥimyāh|īm(?:iān|ī))|K(?:s(?:i[eę]g[ai]\s*Nehemiasz|\.?\s*Nehemiasz)|njiga\s*Nehemijin)a|न(?:हेम(?:्याहको\s*पुस्तक|ायाह)|्हेम्याह)|К(?:нига\s*(?:на\s*Неемия|Неем(?:ии|і[ії]))|њига\s*Немијина)|N(?:e(?:h(?:e(?:m(?:i(?:a(?:n\s*kirj|sz)|j)|y)|em[iy])|imy)|emij)|ê-?hê-?mi-?|ahimiya|ehemei|ơkhemi|ihemi)a|Li(?:ber\s*Nehemiae|v\s*Neyemi\s*an)|Ne(?:h(?:em(?:i(?:(?:a(?:s’\s*Bog|[ehš])|[eh])|á[sš])|j(?:aš|á[sš])|ía[hs])|amiah|em(?:ii|a[ai])h|im(?:(?:a[ai]|a)h|i(?:a?|i)h)|emah|m)|kēmiyā|emias|yemi)|Nehem(?:jas\s*bo|iab[oó]|íab[oó])k|n(?:ahemy[aā](?:hko)?|īmiā)|नहेम(?:्या(?:ह(?:को)?)?|ा)|N(?:e(?:h(?:emia[ai]|em(?:ii|a[ai])[ai]|im(?:a[ai][ai]|i(?:a[ai]|i[ai])))|xemyaa)|ahemya)h|سفر\s*نحميا|N(?:e(?:h(?:em(?:ia(?:n|s)?|jas?)|amia|imia)?|em(?:ia?)?|x)?|ê(?:-?hê-?mi)?|ahi|éh?)|நெகே(?:மியா)?|ن(?:ِحِمی(?:ا[ءهً]|ّ[اه])|حمی(?:اہ|ه))|ن(?:ِ(?:ح(?:ِم\s*|م)|\s*حِم)ی|حمي)ا|Не(?:хе|е?)мија|เนหะมีย์|ن(?:ِحِم(?:یا?)?|ح(?:م(?:یا?)?)?)|Νεεμ[ίι]ας|N(?:ehémi|éh[eé]mi)e|《?厄斯德拉下》|《?厄斯德拉下|Неем(?:и[ия]|і[яії])|ネヘミヤ\s*?記|(?:《尼希米[記记]|尼希米[記记])》|ਨਹਮਯਾਹ|Неємі[ії]|《尼希米[記记]|느헤미(?:야[기서]|아)|נחמיה|느(?:헤(?:미야)?)?|Не(?:е?|є)м|ネヘミヤ|尼希米[記记]|《尼》|นหม|Νε|《尼|尼》|尼))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Esth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:אסתר,\s*כולל\s*פרקים\s*גנוזים|எஸ்தர(?:ின்\s*சரித்திரம)?்|К(?:њига\s*о\s*Јестири|нига\s*Ес(?:фири|(?:т[еи]|фі)р))|est(?:arko\s*pustak|erh)|एस्तरको\s*पुस्तक|Ks(?:i[eę]g[ai]\s*Estery|\.?\s*Estery)|Esterin\s*kirja|Li(?:ber\s*Esther|v\s*Est[eè]\s*a)|ଏଷ୍ଟର\s*ବିବରଣ|E(?:st(?:er(?:s\s*Bog|ei|y)|ar|hr|[rè])|t)|Ester(?:arb[oó]|s\s*bo)k|سفر\s*أستير|เอสเธอร์|Es(?:t(?:e(?:r(?:in|a|s)?)?|a|h)?|zt)?|est(?:arko|er)|एस्तर(?:को)?|Asttiro|Јестира|Ê-?xơ-?tê|《?艾斯德爾傳》|《?艾斯德爾傳|Ес(?:тира|фирь)|اِ?ستره|(?:Es(?:t(?:e[eh]|he)|zte)|asta|āsta)r|Aester|エステル(?:\s*記|[書記])|(?:《?以斯帖[記记]|《?斯)》|(?:ا(?:ِس(?:ت[ـَ]|[طٹ])|ستِ)|(?:ا(?:ِ\s*|ی)|آ)ست)ر|एस्तेर|ऐस्तेर|Ес(?:т(?:ир)?|ф)|ا(?:ِستر|ستر?)|《?以斯帖[記记]|에스(?:테르기|더[기서]|텔)|Εσθ[ήη]ρ|أستير|Ес(?:те|фі)р|Јест?|אסתר|エステル|ਅਸਤਰ|Ast|ast|에(?:스더?)?|Εσθ|எஸ்|อสธ|أس|《?斯))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Job"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:யோபுடைய\s*சரித்திரம்|K(?:itabu\s*cha\s*(?:Ayu|Yo)bu|njiga\s*o\s*Jobu)|अय(?:्यूबको\s*पुस्तक|युब)|ay(?:y[uū]bko\s*pustak|ūbi)|К(?:нига\s*(?:(?:на\s*(?:Иова|Йов)|[ІИЙ]ова)|на\s*Иов)|њига\s*о\s*Јову)|(?:K(?:s(?:i[eę]g[ai]\s*(?:(?:Hi|J)|Ij)ob|\.\s*(?:(?:Hi|J)|Ij)ob|\s*(?:(?:Hi|J)|Ij)ob)|niha\s*J[oó]bov|\.\s*J[oó]bov|\s*J[oó]bov)|Jobin\s*kirj|Iyyoob)a|ଆୟୁବ\s*ପୁସ୍ତକ|Li(?:v\s*J[oò]b\s*la|ber\s*Iob)|अय्यूब(?:को)?|J(?:o(?:b(?:s\s*Bog|a)|v)|ób|b)|Jobs(?:\s*bo|b[oó])k|سفر\s*أيوب|ay(?:y(?:ūb(?:ko)?|ubko)|ūb?)|G(?:i(?:obbe|óp)|b)|ا(?:ی(?:و(?:ُبی|ب[هَی]|پ)|ُوب)|ِیوب)|(?:A(?:y(?:y(?:o[ou]|u)|[ou]u)|iu)|Iyou|Aiou|E(?:yy?|io)u|Jò)b|(?:Aiyo|Eiyo|Ij|[iī]y)ob|(?:ا(?:ی(?:ُوُ|[وّ]و)|ِ(?:یوُ|و))|أيو)ب|(?:ای(?:ُّ|[\s*ـ])|(?:ا\s*|[آئ])ی)وب|J(?:ob(?:in?|s)?|ó)|ای(?:و(?:ُب|ب)?|ّ)|Ay(?:obe|b)|Hiob[ai]|Ayubu|(?:《?約伯[傳記]|《伯)》|《?约伯记》|ਅੱ?ਯੂਬ|Hi(?:ob)?|Ayub|《?約伯[傳記]|《?约伯记|ଆୟୁବ|யோபு|I(?:yob|o[bv])|Yobu|ヨ[フブ]\s*?記|Yōpu|איוב|[इई]योब|Іова|[ИЙ]ова|Ayu?|Yob|[ИЙ]ов|(?:Ι[ωώ]|Ἰ)β|Аюб|โยบ|Јов|أي|ヨ[フブ]|《伯|욥기|Ιβ|伯》|욥))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mal"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(mal'(?:ākh[iī]|a)|(?:ମଲାଖି\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|Pro(?:roctwo\s*Malachyaszow|phetia\s*Malachia)e|К(?:нига\s*(?:на\s*пророк\s*Малахия|пророка\s*Малах(?:ии|і[ії])|Малахі[ії])|њига\s*пророка\s*Малахије)|Ks(?:i[eę]g[ai]\s*Malachiasza|\.?\s*Malachiasza)|मल(?:ा(?:कीको\s*पुस्तक|खी)|की)|(?:M(?:ala(?:kian\s*kirj|chiasz|[hȟ]ij)|ikiyaas)|Liv\s*Malachi\s*)a|M(?:a(?:l(?:(?:a(?:k(?:i(?:as’\s*Bog|s\s*bok|[ei])|e[ey]|í)|c(?:hi(?:aš|á[sš]|e)|i)|qu[ií]as|kiás)|eaki|kiyā|ch)|aaki[ei])|alaki[ei])|a(?:-?la-?(?:ch|k)|leak?h|l(?:ea|i)ch)i|(?:al['’]a|el)aki|ilaki|l)|Ma(?:l(?:(?:a(?:c(?:h(?:i(?:as?)?)?)?|ki(?:a(?:n|s)?)?|qu)?|c)?|aaki)|alaki)|سفر\s*ملاخي|Μαλαχ[ίι]ας|mal(?:’(?:ākh[iī]|a)|[aā]kʰ[iī]|[aā]k[iī])|Малах(?:и(?:ја|[ия])|і[яії])|எபிரேயம்|م(?:َل(?:اک(?:یی|[ىيے])|كی)|ل(?:اکیه|ک[ىیے]))|மல(?:ாக்கி|்கியா)|م(?:َل(?:اکی|ك)|ل(?:ا(?:کی?)?)?)|《(?:玛(?:拉基书》|(?:拉基)?》)|瑪(?:拉基[亞書]》|》))|ม(?:าลาคี|ลค)|《(?:玛(?:拉基书|(?:拉基)?)|瑪(?:拉基[亞書])?)|மல(?:்கி|ா)|मलाकी|ମଲାଖି|玛拉基书》|瑪(?:拉基[亞書]》|》)|מלאכי|ਮਲਾਕੀ|م(?:لاخ|َلک)ي|玛拉基书|瑪(?:拉基[亞書])?|말라[기키]서|玛(?:拉基)?》|マラキ書|말(?:라기?)?|Μαλ?|Мал|玛(?:拉基)?|マラキ?|ﻣﻼﺥ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t))|of\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t))|of\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?)|of\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?))|(?:(?:(?:Mabuting\s*Balita\s*ayon\s*kay\s*S|S(?:ulat\s*ni\s*S)?)an|Mabuting\s*Balita\s*ayon\s*kay)\s*Ma|E(?:(?:(?:banghelyo\s*(?:ayon\s*kay|ni\s*San)|banghelyo\s*ni)|vangelio\s*de)|l\s*Evangelio\s*de)\s*Ma)teo|matt(?:ay[aā]ne\s*lihilele\s*[sŝ]ubʰavartam[aā]n|īle\s*lekʰeko\s*susm[aā]c[aā]r|ile\s*lekʰeko\s*susm[aā]c[aā]r|ī\s*(?:kī\s*in|dī\s*ĩ)jīl|ā['’]ūsi)|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?)|of\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?))|Evangelium\s*secundum\s*Matthaeum|Evankeliumi\s*Matteuksen\s*mukaan|(?:E(?:w(?:angelia\s*(?:w(?:edług\s*[sś]w\.?\s*Mateusz|g\s*[sś]w\.?\s*Mateusz)|Mateusz)|\.?\s*Mateusz)|vanjelium\s*Pod[lľ]a\s*Mat[uú][sš])|Ma(?:atiyoos|t['’]thiy))a|Das\s*Evangelium\s*nach\s*Matth(?:(?:ae|ä)|a)us|मत्त(?:याने\s*लिहिलेले\s*शुभवर्तमान|ी(?:ले\s*लेखे)?को\s*सुसमाचार|ियाह)|(?:Evangelie\s*volgens\s*Matte[uü]|Mat(?:(?:t(?:he[uü]|eü)|éu)|thé[uü]))s|Evangelium\s*nach\s*Matth(?:(?:ae|ä)|a)us|மத்தேயு\s*(?:எழுதிய\s*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|От\s*Матея\s*свето\s*Евангелие|(?:Evangelium\s*podle\s*Matou[sš]|M(?:at(?:th?w|['’]te|y)|etti))e|(?:Evangeliet\s*etter\s*Matte|Injil\s*Mati|Mati)us|Евангелие(?:то\s*според\s*Матеј|\s*(?:според\s*Матеј|от\s*Мате[ий]))|Євангелі(?:є\s*від\s*св\.?\s*Матвія|я\s*від\s*(?:св\.?\s*Матвія|Матвія)|є\s*від\s*Мат(?:ві|е)я)|Ευαγγελιον\s*Κατα\s*Μαθθαιον|Jevan(?:helije\s*vid\s*Matvija|đelje\s*po\s*Mateju)|הבשורה\s*(?:הקדושה\s*על-?|(?:על[\s*-]|ל))פי\s*מתי|M(?:a(?:t(?:t(?:euksen\s*evankelium|ēyu\s*Naṛceyt)|['’]y)i|t(?:t(?:h(?:ie[uw]|e[aiw]|y)|i(?:ew|i)|e[eowy]|y)|eusza|a(?:yos|i)|[uú][sš]a|['’]t[iy]|e[ijo]|hy)|-?thi-?ơ|at(?:ha|t)i)|aattey|itt(?:hy|i)|etty|át[eé]|t[ht])|ମାଥିଉ\s*ଲିଖିତ\s*ସୁସମାଗ୍ଭର|Vangelo\s*di\s*(?:San\s*)?Matteo|พระวรสารนักบุญแม็ทธิว|Mat(?:ou[sš]ovo\s*evangeli|(?:th(?:(?:ae|ä)|a)use|tei\s*e)vangeli)um|Evan[ðđ]elje\s*po\s*Mateju|(?:Евангелие\s*от\s*|(?:От\s*)?)Матфея|Јеванђеље\s*по\s*Матеју|Matteusarguðspjall|Matt(?:(?:hæ|e)|æ)usevangeliet|Еванђеље\s*по\s*Матеју|Ungjilli\s*i\s*Mateut|(?:Injili\s*ya\s*)?Mathayo|Saint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|م(?:ت(?:ّی\s*کی\s*انجیل|ی\s*کی\s*انجیل|ایی|تی|[ىي])|َت(?:ّ(?:تی|[ىيی])|تی|ی[هی]|ي))|ਮੱਤੀ\s*ਦੀ\s*ਇੰਜੀਲ|St\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|Κατ[άα]\s*Μα[θτ]θα[ίι]ον|St\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|M(?:at(?:t(?:eu(?:ksen|s)|h(?:(?:ae|ä)us|aus|æus|i)?|ēyu|ie?)?|eusz|['’]thi|e(?:us?)?|ayo|ou[sš]|hi?|[uú][sš]|é)?|t)|Saint\s*Matt?|Від\s*Матвія|matt(?:ay[aā]ne|ā(?:['’]ūs)?|īle|ile|ī)|マタイ(?:による福音書|[の傳]福音書|福音書|[伝書])|Matt(?:h[ht]|th)i?ew|Math[ht](?:[ht]i?ew|i?ew)|إنجيل\s*متى|От\s*Матея|मत्त(?:य(?:ाने)?|ी(?:ले)?|ि)|St\.\s*Matt?|Μ(?:α(?:τθα[ίι]ος|θθα[ίι]ος)|θ)|Mattheei|Matttiew|Matthee|மத்(?:தேயு)?|St\s*Matt?|마태(?:오\s*)?복음서|Mat(?:hi?e|tte)w|Mátthêu|마(?:태(?:오\s*복음|복음)?)?|Ew\s*Mat|М(?:ат(?:е(?:ја|[ий])|то)|[тф])|《?瑪竇福音》|(?:《[馬马]|[馬马])太福音》|Матвія|มัทธิว|Мат(?:еј)?|《?瑪竇福音|(?:《[馬马]|[馬马])太福音|ମାଥିଉ|(?:《?瑪特斐|《太)》|Мата[ий]|Ματθ|مت(?:ای|ّی|ت|ی)?|ਮੱਤੀ|《?瑪特斐|マタイ|מתי|《太|มธ|太》))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ps"],
        testament: "oa",
        testament_books: { "Ps": "oa" },
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ψαλμ(?:ο(?:[ίι]\s*του\s*Δαυ[ίι]δ|ς)|ός)|Li(?:bri\s*i\s*Psalmeve|v\s*S[oò]m\s*yo)|Ca(?:rtea\s*Psalmilor|ṅkītam)|Псал(?:м(?:и\s*Давидови|ы)|тирь|[ао]м)|(?:Liber\s*Psalmoru|S[oò]|Mz)m|சங(?:்கீத(?:\s*புத்தக)?|கீத)ம்|स्त(?:्र)?ोत्रसंहिता|P(?:s(?:a(?:(?:l(?:m(?:i(?:en\s*kirja|[it])|a[su]|e[nt]|u[ls]|[sy])|s)|m(?:l[as]|s)|aa)|las)|m(?:als|m)|lm[ms])|la(?:sm?s|ms)|(?:s(?:a(?:ma|am)|lma)|l(?:ama|m))s|a(?:s(?:(?:ml|s)|m)s|(?:l[lm]|m[ls])s))|K(?:s(?:i[eę]g[ai]\s*Psalm[oó]w|\.\s*Psalm[oó]w|\s*Psalm[oó]w)|niha\s*[zž]alm(?:ov|[uů])|(?:\.\s*[zž]almo|\s*[zž]almo)v)|தி(?:ருப்பாடல்கள்|பா)|S(?:alm(?:e(?:rnes\s*Bog|nes\s*bok)|os|au|[is])|lm)|stotrasa[mṃ]hit[aā]|bʰaǳansa[mṃ]grah|Книга\s*Псалмів|سفر\s*المزامير|திருப்பாடல்|Sabuurradii|சங்கீதங்கள்|भजन-?सहिन्ता|(?:Thánh\s*vịn|Maza?mura)h|भजन\s*संहिता|ଗ(?:ୀତି?ସଂହିତା|ାତସଂହିତା)|Zsolt[aá]rok|Thánh\s*Thi|(?:Psaltare|Thi\s*Thiê)n|भजनसं?ग्रह|Mga\s*Salmo|Maza?moure|(?:S[aá]lmarni|M(?:az(?:\s*moo|am(?:oo|u['hou’])|m(?:oo|u['hou’]))|iza?mu)|M(?:eza?m|asm)u|Zalt[aá]|Žalt[aá]|Jabu|zabū)r|(?:الم(?:َزمُ|زم)و|م(?:ز(?:م(?:و(?:ُو|[وَ])|ُُ)|امی)|َزموُ|ِزموُ|َزمُ)|م(?:زم[مَّ]|(?:ز[\s*ز]|ظ)م)و|زبو)ر|เพลงสดุดี|P(?:s(?:a(?:l(?:m(?:i(?:en)?|a|e)?)?|ml?|u)?|ala|m(?:al?)?|l[am])?|l(?:a(?:sm?|m)|s(?:ss?|a)))|S(?:a(?:l(?:m(?:e(?:nes?|rne)?|o)?)?|buur)|l)|Maz(?:am[ou]re|\s*mor|m[ou]re)|(?:Mga\s*)?Awit|Псалти́р|M(?:ez\s*mo|iz(?:a?|\s*)mo)or|المزامير|Maz(?:am[ou]r|m[ou]r)?|Пс(?:ал(?:тир|ми)?)?|स्तोत्र|P(?:s(?:a(?:(?:lm[lm]|ml?m|ume)|lam)|m(?:alm|l)|lam)|l(?:a(?:sm)?a|s(?:sss|a?m))|s(?:a[al]l|lal)m|a(?:ls|sl)m)s|mazmūrī|مزم(?:وُ|ُو)رر|מזמורים|Псалмів|P(?:s(?:a(?:(?:lm[lm]|ml?m|ume)|lam)|m(?:alm|l)|lam)|l(?:a(?:sm)?a|s(?:sss|a?m))|s(?:a[al]l|lal)m|a(?:ls|sl)m)|mazm(?:ūr)?|Ψα(?:λμο[ίι])?|مزم(?:وُ|ُو)ر|Z(?:aburi|l)|م(?:زم(?:ور[ره]|ُر)|َزمور|ِزمور)|תהילים|Z(?:ab(?:ur)?|solt)?|مز(?:م(?:ور?|ُ)?|ا)?|சங்(?:கீ)?|Zalmy|Ž(?:almy|l)|詩(?:篇(?:\/聖詠|》)|[》編])|Bhjan|Забур|زبُور|《?聖詠集》|ਜ਼?ਬੂਰ|สดุดี|Zalm|Ž(?:alm)?|زبُو|《?聖詠集|Pssm|(?:《[詩诗]篇|诗篇)》|Pss|Thi|Заб|भजन|《[詩诗]篇|《[詩诗]》|สดด|詩篇?|《[詩诗]|诗篇|시편|诗》|시|诗))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eccl"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:К(?:нига\s*(?:на\s*Еклисиаста\s*или\s*Проповедник|Екклесиаст)а|њига\s*проповедникова|нига\s*Екк?лезіястова|оге́лет)|(?:K(?:s(?:i[eę]g[ai]\s*(?:K(?:aznodziei\s*Salomon|ohelet)|Eklezjastes)|\.\s*(?:K(?:aznodziei\s*Salomon|ohelet)|Eklezjastes)|\s*(?:K(?:aznodziei\s*Salomon|ohelet)|Eklezjastes))|niha\s*kazate[lľ]ov|\.\s*kazate[lľ]ov|\s*kazate[lľ]ov)|Saarnaajan\s*kirj|Eranchcha)a|Eklezyas\s*-?\s*Liv\s*Filoz[oò]f\s*la|Kaznodziei\s*Salomonowego|ச(?:ங்கத்\s*திருவுரை\s*ஆகமம்|பை\s*உரையாளர்|உ)|Li(?:ber\s*(?:Ecclesiastes|Qoelet)|v\s*Filoz[oò]f\s*la)|K(?:ohelet(?:\s*—\s*Kazate[lľ]|h)|a(?:zate[lľ]|alam))|upade(?:[sš]akko\s*pust|ŝ)ak|(?:Pr(?:(?:edikantens\s*bo|opovjedni)|edikarens\s*bo)|Forkynnerens\s*bo)k|P(?:r(?:ædikerens\s*Bog|edikerens|edikator|edikátor|édik[aá]tor|e(?:gethw|dige)r|ad)|khb)|A(?:ng\s*Mangangaral|lkhatib)|उपदेशकको\s*पुस्तक|E(?:cc?lesiastic[eé]|c(?:clesiasti[eé]|lesiasti[eé])|clesyast[eé]|kles[iy]ast[eé])s|Eccles(?:ia?ia|aia)stes|Ec(?:cless[ai][ai](?:st[eé]|t[eé])|clesiast[eé]|cles[ai]ist[eé]|clesaa(?:st[eé]|t[eé])|les(?:s[ai][ai](?:st[eé]|t[eé])|i(?:a(?:st[eé]|t[eé])|i(?:st[eé]|t[eé]))|a[ai](?:st[eé]|t[eé]))|cles(?:ait|i[ai]t)[eé])s|Pr(?:edikar(?:boke|in)|édikarin)n|Sabhopadeshak|Ec(?:cles(?:i(?:a[ai]s|s)|as)|lesis)tes|E(?:cl(?:esiai|is[iy])|kl(?:ezi|is[iy]))astes|Екклезіястова|Ec(?:cless[ai][ai](?:st[eé]|t[eé])|clesiast[eé]|cles[ai]ist[eé]|clesaa(?:st[eé]|t[eé])|les(?:s[ai][ai](?:st[eé]|t[eé])|i(?:a(?:st[eé]|t[eé])|i(?:st[eé]|t[eé]))|a[ai](?:st[eé]|t[eé]))|cles(?:ait|i[ai]t)[eé])|Εκκλησιαστ[ήη]ς|Проповедника|Ec(?:clesiastu|le[sz]iastu)l|Ecclesi(?:aa)?tes|Ekklesiastes|Проповідника|Еклезіястова|Fork(?:ynneren)?|Про(?:п(?:оведник)?)?|Ecclésiaste|Pengkhotbah|J(?:uru\s*Kotbah|am(?:(?:(?:\s*ae|[3a]a)h|(?:a['’]|['’])a[ht])|aih))|Екклезіяста|Mangangaral|Размышления|(?:Ekklezijas|kolliyā)t|سفر\s*الجامعة|E(?:c(?:c(?:l(?:es(?:iast)?|és)?)?|l(?:e(?:ziast|s))?)?|kl(?:ezyas)?|ra)|P(?:r(?:e(?:d(?:iker(?:en)?)?|g)|æd(?:ikeren)?|op|éd)|engkh|kh)|Predikaren|Saar(?:n(?:aajan?)?)?|Ек(?:к(?:л(?:езіяст)?)?|л)|upade[sš]ak(?:ko)?|(?:P(?:redikues|iracaṅk)|M(?:agwawal|hubir))i|Wacdiyah(?:ii|a)|Еклисиаста|ป(?:ัญญาจารย์|ญจ)|Truyền\s*đạo|Ек(?:кле(?:зі|си)|леси)аст|Еклисиаст|Gi(?:áo\s*huấn|ảng\s*Sư)|उपदेशक(?:को)?|Qoheleth|பிரசங்கி|コヘレトの(?:こと[はば]|言葉)|सभोपदेशक|K(?:oh(?:elet)?|azn?)|Qohelet|Filoz[oò]f|(?:jāme['’]e|Pkht)h|(?:Qo(?:hè|[eè])|Co[eé])let|الجامعة|ਉਪਦੇਸ਼ਕ|Jam(?:\s*ae|(?:a['’]|['’])a|[3a]a)|جام(?:ع(?:ه[ـهی]|[اۀہ])|ع[\s*ـی]ه|ـعه|[هہ]ع)|המ(?:קהיל|רצה)|ଉପଦେଶକ|M(?:anga|hu)|jām(?:e['’])?|جا(?:م(?:عه?)?)?|واعِ?ظ|(?:《(?:传道书|傳道書)|傳道書|传道书)》|《?訓道篇》|کلیات|伝道者?の書|Giáo|Разм|《(?:传道书|傳道書)|《?訓道篇|பிரச|コヘレト|伝道者の|vāʿẓ|קהלת|傳道之書|Qoh?|Wac|सभो|傳道書|传道书|전도서|《[传傳]》|코헬렛|Εκ|《[传傳]|코헬|傳》|Ἐκ|传》|傳|전|传))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(ح(?:زقی\s*ای|ِزقیا\s*)ل|(?:எசேக்கியேல்\s*தீர்க்கதரிசியின்\s*புத்தகம்|ଯିହିଜିକଲ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*(?:Иезекииля|Езекиил)|(?:пророка\s*Иезекии|пророка\s*Єзекі[ії])ля)|нига\s*Пророка\s*Езеки[ії]ла|њига\s*пророка\s*Језекиља)|Prophetia\s*Ezechielis|iǳakielko\s*pustak|Hesekielin\s*kirja|(?:Ks(?:i[eę]g[ai]\s*Ezechie|\.?\s*Ezechie)|Hizqqee)la|इजकिएलको\s*पुस्तक|Liv\s*Ezeky[eè]l\s*la|E(?:z(?:e(?:kiel(?:s’?\s*Bog|i)|chiel[ae])|[kq])|sk)|(?:He|E)sekiels\s*bok|எசே(?:க்கியேல்)?|Ê-?xê-?(?:chi-?|ki-?)ên|H(?:es(?:ek(?:iel(?:in)?)?)?|iz(?:kiya[ei]l|qiya(?:lh?|[aei]l)|kiyal)?)|Hiz(?:(?:kiya[ei]|kiya)lh|q(?:iy(?:a(?:(?:lha|[aei]lh)|hl)|['’]al)|eyal))|ح(?:ِز(?:قیی?ائله|قی(?:(?:الله|(?:(?:(?:ال[هی]|یل)|لی)|ئل))|یاله)|کی(?:ا(?:ل(?:له|ی)|ئله)|لی|ئل))|ز(?:(?:قیا?ل|کیال)|قیئل))|(?:Hizq(?:iy(?:a(?:ha|['’])|['’]aa)|eya[ei])|E(?:cēkkiyē|ze(?:chië|qu(?:i[ae]|e)|k(?:ia|e))|z(?:e[ei]qu|i(?:(?:[ei])?qu|(?:[ei])?k)|e[ei]k)e|x[ei](?:[ei])?ke)|Y(?:eh(?:ezki[eè]|èzki[eè])|éh[eè]zki[eè])|(?:E(?:z(?:e[ei]qu|i(?:(?:[ei])?qu|(?:[ei])?k)|e[ei]k)i|x[ei](?:[ei])?ki|sek[yí]|zeci)|Yexesqe|(?:Yehes|Ezé)ki|Hezechi|Iezechi|Ezéchi|Éz[eé]chi|hizkī|Eseci)e|Yahejake|yahe(?:dz|ǳ)ke|Ezeky[eè]|hazqiā)l|سفر\s*حزقيال|ح(?:ِز(?:قیی?ائل|قی(?:یال|(?:ال?|ل))|کی(?:ائ?ل|ل))|ز(?:قی?)?)|iǳakielko|Иезекиил[ья]|Jezeki[iï]l['’]|ḥiziqīʾīl|ح(?:ِز(?:ق(?:(?:ی(?:\s*ای|ا[اي])|ا)|یئا)|ک(?:ی(?:ئا|اي)|ا))|ز(?:(?:قیا[ئيی]|کی(?:ا[ئي]|ئ))|قیئا))ل|เอเสเคียล|E(?:z(?:e(?:c(?:h(?:iel)?)?|k(?:iel)?|qu?)?|é)|sek(?:iel)?)|Иез(?:екиил)?|इजकिएल(?:को)?|ଯିହିଜିକଲ|Єзекі[ії]л[аья]|Ιεζ(?:εκι[ήη]λ|κ)|यहेज्?केल|ح(?:ِز(?:کی|ِق)ی|ز(?:ق(?:یی|ي)|کیی))ال|ਹਿਜ਼ਕੀਏਲ|Йезекиил|Езеки[ії]ла|Језекиљ|Езеки[еи]л|hazqīl|Езекил|יחזקאל|(?:《?以西(?:結[书書]|结书)|《[結结]|[結结])》|《?厄則克耳》|エ[セゼ]キエル書|hazqī?|Ezéch|Éz[eé]ch|Ιεζ(?:εκ)?|《?以西(?:結[书書]|结书)|《?厄則克耳|エ[セゼ]キエル|에(?:제키엘|스겔)서|Esec|Ê-?xê|에(?:제(?:키엘)?|스겔)|Езек|यहेज|Ye[hx]|Јез|Йез|Yez|᾿Ιζ|อสค|Єз|《[結结]|[結结]|겔))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:ହୋଶ(?:େୟ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|ହେ)|К(?:нига\s*(?:на\s*пророк\s*Осия|пророка\s*Ос(?:ии|і[ії]))|њига\s*пророка\s*Осије)|Ks(?:i[eę]g[ai]\s*Ozeasza|\.?\s*Ozeasza)|Prophetia\s*Osee|(?:H(?:oosean\s*kirj|(?:o(?:os(?:heec|e7)|še)|ô-?sê-?))|Liv\s*Oze\s*|O(?:zeasz|sij))a|होशे(?:को\s*पुस्तक|य)|H(?:os(?:eas(?:’\s*Bog|\s*bok)|h(?:aeah|o))|oseias|osheah|ush(?:ae|ea)h|óseas|s)|ہو(?:\s*سیعاہ|سیعَِ)|سفر\s*هوشع|โฮเชยาห์|H(?:o(?:(?:os(?:ean|h)?|s(?:eas?|hae)?|š)?|seia)|oshea?|ush(?:ae?|ea?)|ós(?:ea)?)|h(?:o(?:s(?:h['’]ai|ey)|šeā|ŝey)|ūsīʿ)|ho(?:s(?:h(?:['’]a)?|e)|še)|โฮเชยา|H[oó]seás|Hoze[aá][sš]|O(?:s(?:e(?:ia[hs]|a[hs]|e)|é(?:ias|e))|ze(?:aš|á[sš]))|هوش(?:ع(?:ع?ه|لل|یی)|؏عع|[ئا]عع|؏ه)|(?:《何西阿[书書]|何西阿[书書])》|ਹੋਸ਼ੇਆ|O(?:s(?:ei?a)?|z(?:e(?:as)?)?)|هو(?:ش(?:ع(?:ع|ل|ی)?|؏ع|[ئا]ع|؏)?)?|《何西阿[书書]|ہوسیع|ହୋଶେୟ|Ōciyā|ホセア(?:しょ|書)|《?歐瑟亞》|Осија|Хошеа|ஓச[ிே]யா|ஒசேயா|何西阿[书書]|《?歐瑟亞|होशे|호세아서|Ωση[έε]|Ос(?:и[ия]|і[яії])|Ô-?sê|הושע|호(?:세아?)?|ஓச[ிே]|ホセア|《何》|ฮชย|Ωσ|Ос|《何|Ὠσ|何》|何))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Obad"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ଓବଦିଅ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*Авди[ий]|пророка\s*(?:Авд[иі]|Овді)я)|њига\s*пророка\s*Авдије)|Pro(?:roctwo\s*Abdyaszow|phetia\s*Abdia)e|ओब(?:द(?:ियाको\s*पुस्तक|्याह)|द्दाह|ेधाह|धाह)|(?:Ks(?:i[eę]g[ai]\s*Abdiasz|\.?\s*Abdiasz)|O(?:ba(?:d(?:jan\s*kirj|ij|ei|í)|j)|[ou]bad[iy])|Ô-?ba-?đi-?|Abdiasz|Ovadi|Áp-?đi|Óbad[ií])a|Liv\s*Abdyas\s*la|O(?:b(?:ad(?:ia(?:s['’]\s*Bog|[hš])|ja(?:s\s*bok|š)|iyah|eyah|yah)|adjá[sš]|adiá[sš]|edi(?:a[sš]|á[sš])|d)|vdij)|سفر\s*عوبديا|ع(?:وبَدِیاء|ُوبَدیاء|وب(?:َدی(?:ا[ءىيہی]|[آه])|دیا[هىيہی])|بدیاہ)|(?:Cobadyaa|Obadiye|Ob(?:adh|id)a)h|ʿabadiyāh|ع(?:و(?:بَدِیا|(?:ب(?:َدیا?|د(?:یا?)?)?)?)|ُوبَدیا)|Abd(?:diyyu|iaš|[yí]as)|โอบาดี[ยห]์|Ob(?:a(?:d(?:j(?:a(?:n|s)?)?|ias?|iya|eya|ya)?)?|adjá|edia)?|Abdi(?:j[aá]|á)[sš]|Opatiyā|ob(?:d(?:ay|i)yā|ad(?:iy|ʰ)[aā])|Ов(?:адија|ді[ийя])|obadyāh|(?:《俄巴底(?:亚书|亞書)|俄巴底(?:亚书|亞書))》|ع(?:وبَ?دي|وب(?:دِ|اد)ی|ُوبدی)ا|Ab(?:d(?:i(?:as?)?)?)?|ओब(?:द[ि्]या|धा)?|《俄巴底(?:亚书|亞書)|Αβδιο[υύ]|Авди(?:ј[ае]|[ийя])|ஒபதியா|オ[ハバ][テデ](?:ヤ(?:しょ|書)|ア書)|עו?בדיה|Οβδ[ίι]ας|《?亞北底亞》|ਓਬਦਯਾਹ|Cob(?:ad)?|Авд(?:иј)?|俄巴底(?:亚书|亞書)|《?亞北底亞|ଓବଦିଅ|오바(?:드야서|댜서|디야)|Avdie|Авдія|ஒப(?:தி)?|オ[ハバ](?:[テデ]ヤ)?|obd|Овд?|Αβδ|오바댜?|《俄》|Ἀβδ|อบด|Áp|Ób|《俄|俄》|俄|옵))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hag"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ହାଗୟ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|Pro(?:roctwo\s*Aggieuszowe|phetia\s*Aggaei)|К(?:нига\s*(?:на\s*пророк\s*Аге[ий]|пророка\s*(?:Агге|Огі)я|Огія)|њига\s*пророка\s*Агеја)|Ks(?:i[eę]g[ai]\s*Aggeusza|\.?\s*Aggeusza)|हाग्ग(?:ैको\s*पुस्तक|[ये])|(?:Haggain\s*kirj|Liv\s*Aje\s*|Aggeusz)a|H(?:ag(?:g(?:a(?:is\s*bok|js\s*Bog|[yíï])|ia[hi]|e(?:us|o)|y)|a[ijy]|e[jo]|i)|gg)|ح(?:َج(?:َّی(?:ہ?ئ[ةۀ-ۂ]|ہ[ءةۀۂ]|اء|[ءة])|ّی)|ج(?:(?:ییی|َّ[يی]|اي|يّ)|ّی))|H(?:ag(?:g(?:a(?:in?|j)?|i)?)?|g)|ح(?:َجَّیہ?|ج(?:یی?|ا|ي)?)|A(?:ggaeus|(?:g(?:ge[eo]|e(?:us|[jo])|heu)|-?ghê))|Αγγα[ίι]ος|hajj(?:īyy|aī|ā)|سفر\s*حجي|(?:Haggaa|h[aā]ggə|Ha(?:-?g|j)a|ḥajja|A-?ga)i|Ag(?:g(?:eus)?|eu)?|hajjīy?|हाग्गै|(?:Xagga|h[aā]gga)y|ฮ(?:ักกัย|กก)|Агге[ийя]|《?哈(?:(?:該[书書]|蓋)|该书)》|ஆகாய்|ハ[カガ]イ(?:しょ|書)|Хагај|A(?:ggé|j)e|Xagg?|《?哈(?:該[书書]|该书|蓋)|ହାଗୟ|Ohij|Аге[ийј]|Огі[ийя]|Ākāy|하(?:까이서|깨)|ਹੱਜਈ|Оґія|Агг?|ஆகா|ハ[カガ]イ|학개서|חגי|(?:《[該该]|[該该])》|학개?|Αγ|Ог|《[該该]|하까|Ἀγ|[該该]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hab"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ହବକ(?:୍କୂକ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|[ୁୂ]କ୍)|К(?:нига\s*(?:(?:на\s*пророк\s*Авакума?|пророка\s*Авакума)|пророка\s*Аввакума)|њига\s*пророка\s*Авакума)|Pro(?:roctwo\s*Abakukowe|phetia\s*Habacuc)|(?:Habakukin\s*kirj|Ks(?:i[eę]g[ai]\s*Habakuk|\.?\s*Habakuk)|I(?:rmbbaaqoom|mb))a|हबक(?:ूकको\s*पुस्त|्कू)क|Hab(?:a(?:k(?:ku(?:k(?:s\s*Bog|k)|c)|u(?:k[aku]|c))|cuc)|bak(?:k(?:akk|u(?:kk|c))|akk|u(?:kk|c))|akk?akk|[ck])|(?:H(?:ab(?:a(?:k(?:k(?:uks\s*b|o)|o)|co)o|ba[ck]oo|acku)|b)|habak(?:k[uū]|[uū])|Abak(?:ou|i))k|Liv\s*Abakik\s*la|ح(?:َبَق(?:و(?:ق(?:ی(?:ی(?:یه|[ءئه])|ائ[هہ]|ئی|ہ[ئاه]|[ءةهۂ])|ائ[هہ]|وو|ئی|ہ[ئاه]|[ءةـهۂ])|ک)|ق)|بقوق)|அபக்கூக்கு|Hab(?:a(?:k(?:uk(?:in?)?|kuk)?|c)|bak(?:k[au]k|[au]k)|akk?ak)?|ح(?:َبَقوق(?:ی(?:ئ|ہ|ی)?|ا|و|ئ|ہ)?|ب(?:قو?)?)|Ha(?:-?ba-?cú|b(?:bac[au]|aca))c|Habacuque|سفر\s*حبقوق|Α(?:ββακο[υύ]μ|μβακο[υύ]μ)|(?:Xabaqu|Habaq)uq|ḥabaqqūq|(?:Habac|Aba)cuc|حَبَقووق|Аввакума|Аваккума|ହବକ୍କୂକ|Аввакум|A(?:b(?:akuka|k)|va[ck]um)|habaqūq|ฮ(?:าบากุ|บ)ก|Ха[бв]акук|ح(?:بقُ?ّ|َبق)وق|Авакума|Abak(?:uk)?|habaqū?|हबक(?:्कू|ूक)?|Авакум|ஆபகூக்|《哈(?:巴谷(?:[书書])?》|》)|Āpakūk|ハ[ハバ]クク(?:しょ|書)|ਹਬ(?:ਕੱ?|ੱਕ)ੂਕ|《哈(?:巴谷[书書]?)?|哈(?:巴谷(?:[书書])?》|》)|חבקוק|Ав(?:ак|в)?|哈(?:巴谷[书書]?)?|ハ[ハバ]クク|하(?:바(?:쿡서|꾹)|박국서)|Xab|하(?:박국|바)|Авк|Αβ|அப|ஆப|Ἀβ|합))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mic"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ମ(?:ୀଖା\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|ିଖା)|К(?:нига\s*(?:на\s*пророк\s*Михе[ий]|пророка\s*М[иі]хея)|њига\s*пророка\s*Михеја)|Prophetia\s*Michaeae|Ks(?:i[eę]g[ai]\s*Micheasza|\.?\s*Micheasza)|म(?:ी(?:काको\s*पुस्तक|खा)|िका)|(?:M(?:i(?:ikan\s*kirj|lkkiyaas|cheasz|hei|kh)|eek)|Liv\s*Miche\s*)a|M(?:i(?:k(?:as\s*(?:Bog|bok)|eas)|(?:ch(?:ae|ä)|k(?:ey|ie))as|qu(?:ei?|éi)as|c(?:h(?:a[aá][sš]|e(?:aš|á[sš]|e)|ah)|as)|keás|-?c(?:hê|a)|hej)|(?:i(?:kah|ika)a|k)h|ikaaha|(?:icah|ík)a|y(?:kaha|cah|[hȟ]ej)|īkā|q)|Μ(?:ΙΧΑ(?:Ϊ́|[ΊΙ])ΑΣ|ιχα[ΐίι]ας|χ)|سفر\s*ميخا|M(?:i(?:c(?:h(?:e(?:as?)?|a)?|a)?|ik(?:an?)?|k(?:a(?:h|s)?|ea)?|lk|h|q)|ikaah|icah|ykah|ík)|m(?:īk(?:hāyā|āh|ʰ[aā]|a)|ik(?:ʰ[aā]|[aā]))|م(?:ی(?:ک(?:ا(?:ه(?:ئی|ی[هی]|[ءةـوِہ])|ہ[ئاهوی]|ئ[هہ]|[ةۂی])|ه)|کا[ءاِ]ه|كاه)|ِیکاہ|ي[كک]اه)|mīk(?:hāy?|ā)|ม(?:ีคาห์|คา)|மீக(?:்க)?ா|Michée|م(?:یک(?:ا(?:ه|ہ)?)?|ي)|Мих(?:е[ийяј]|а)|(?:《(?:弥迦书|彌迦書)|弥迦书|彌迦書)》|《?米該亞》|ਮੀਕਾਹ|Міхея|《(?:弥迦书|彌迦書)|《?米該亞|मीका|ମୀଖା|மீக்|ミカ(?:しょ|書)|מיכה|ميخا|М[иі]х|弥迦书|彌迦書|미[가카]서|《[弥彌]》|미[가카]?|《[弥彌]|ミカ|弥》|彌》|弥|彌))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zech"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ଯିଖରିୟ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*Захария|пророка\s*Захарии|пророка\s*Захарія|Захарі[ії])|њига\s*пророка\s*Захарије)|Prophetia\s*Zachariae|Ks(?:i[eę]g[ai]\s*Zachariasza|\.?\s*Zachariasza)|ज(?:क(?:र(?:ियाको\s*पुस्तक|्याह)|यार्ह)|ख[रऱ]्या)|(?:S(?:a(?:kar(?:jan\s*kirj|í)|charj)|echarei)|Z(?:a(?:k(?:kaariyaas|ariyy)|chariasz)|ekariy)|Liv\s*Zakari\s*|X(?:a-?ch|ê-?c)a-?ri-?|Za(?:cc|kh)ari)a|Z(?:a(?:(?:(?:kari(?:a(?:s['’]\s*Bog|h)|ya)|char(?:i(?:(?:a[hš]|[eh])|á[sš])|j[aá][sš])|harij?a|ȟarij)|charah)|cher[ai]h)|(?:acheria|c)h|e(?:ch[ae]riah|ch[ae]r[ai]h|kariah))|Sa(?:kar(?:ja(?:boken|s\s*bok)|ias)|car[ií]as)|เศคาริยาห์|Xa(?:-?cha-?ri)?|Z(?:a(?:c(?:h(?:arias?)?|ch?|ar)?|k(?:ari(?:as?)?|k)?|h(?:arij)?)?|acheria|e(?:c(?:h[ae]ria|h?)|k(?:aria)?)|c)|زکریا(?:ئ[ۀ-ۃ](?:ئہ|ء)|[ۀ-ۃ](?:ئہ|ء)|[ءه])|(?:Z(?:ach(?:ar(?:ii|a[ai])|er(?:a[ai]|ii))|ech[ae]r(?:a[ai]|ii))|zakari?yā)h|Sekaryaah|ச(?:ெக்)?கரியா|زَكَرِيّا|سفر\s*زكريا|Zaccharie|S(?:a(?:k(?:ar(?:jan?|ia))?|ch)|e(?:ch|k))|Zakariás|Zacar[ií]as|Ζ(?:αχαρ[ίι]ας|χ)|Захар(?:и(?:ја|[ия])|і[ийяії])|Jakaryah|jak(?:ariy[aā]|ʰary[aā])|zejarīyā|Cakariyā|ز(?:کر(?:ی(?:ا(?:ئ[ۀ-ۃ]|[ۀ-ۃ])?)?)?|ك)|《?撒(?:(?:迦利(?:亞書|亚书)|迦利亞)|加利亞書)》|ਜ(?:਼ਕਰ[ਜਯ]ਾਹ|ਕਰਯਾਹ)|Закария|zejarī|《?撒(?:迦利(?:(?:亞書|亚书)|亞)|加利亞書)|जकरिया|ଯିଖରିୟ|[セゼ]カリヤ(?:しょ|書)|(?:《?匝加利亞|《[亚亞]|[亚亞])》|《?匝加利亞|zejār|즈(?:카르야서|가리야)|זכריה|زكريا|ச(?:கரி|ெக்)|[セゼ]カリヤ|스가랴서|Ζαχ?|За[кх]|스가랴|ศคย|즈카|《[亚亞]|[亚亞]|슥))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zeph"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ସିଫନିୟ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*Софония|пророка\s*Софон(?:ии|і[ії]))|њига\s*пророка\s*Софоније)|Pro(?:roctwo\s*Sofoniaszow|phetia\s*Sophonia)e|Ks(?:i[eę]g[ai]\s*Sofoniasza|\.?\s*Sofoniasza)|स(?:पन्याहको\s*पुस्तक|फन्या)|(?:S(?:efan(?:jan\s*kirj|ij|í)|ô-?phô-?ni-?|ofon(?:iasz|aas))|Xê-?pha-?ni-?|Ze(?:phan(?:ay|j)|fan(?:ay|[jy]))|Seffanei|[TŢȚ]efani)a|Sefanias['’]\s*Bog|Z(?:e(?:fania(?:s’\s*Bog|h)|phania[hs])|ephanaiah|a(?:ph|f)aniah|epanias|of[oó]ni[aá]s|ph)|Liv\s*Sofoni\s*an|S(?:e(?:fanjas\s*bok|p(?:anias|h))|o(?:fon(?:i(?:(?:aš|j[ae]|e)|á[sš])|j[aá][sš])|phonie)|f)|S(?:ô-?phô-?ni|e(?:f(?:an(?:ias?|jan?)|f)?|pania)|o(?:f(?:o(?:ni(?:as?)?)?)?|ph)|zof)|Z(?:ephanaia|e(?:f(?:anias?)?|p(?:h(?:an(?:ia)?)?)?)|a(?:ph|f)ania|p)|So(?:phoni|foní)as|Sz(?:ofo|efa)ni[aá]s|Xô-?phô-?ni|ص(?:َفَنی(?:ا(?:ء[ءةہۂی]|ئ[ءةهہۂی]|[ةهہۂ])|ہ[ءةہۂ]|ۂ)|فنیاہ)|Ceppaṉiyā|செப்பனியா|(?:S(?:efanya|apany)a|sapany[aā])h|ṣafaniyāh|سفر\s*صفنيا|เศฟันยาห์|ص(?:َفَنی(?:اء?|ہ)|ف(?:ن(?:یا?)?)?)|zofanj(?:īy|ā)|Σ(?:οφον[ίι]ας|φν)|С(?:офон(?:и(?:ј[ае]|[ийя])|і[яії])|ефанија)|sapʰany[aā]|safanyāh|zof(?:anjī)?|सपन(?:्याह)?|[セゼ](?:ファニ(?:ヤ(?:しょ|書)|ア書)|[ハパ]ニヤ書)|ص(?:َفانی|فني)ا|ਸਫ਼ਨਯਾਹ|ସିଫନିୟ|(?:《?索福尼亞|《?番)》|《?西番雅[书書]》|[セゼ](?:ファ(?:ニア)?|[ハパ]ニヤ)|《?索福尼亞|《?西番雅[书書]|스바(?:니야|냐)서|צפניה|스바(?:니야|냐)?|செப்|[TŢȚ]ef|Соф|ศฟย|Xô|《?番|습))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Luke"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Lu-?ca|(?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k))|of\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k)))|Mabuting\s*Balita\s*ayon\s*kay\s*(?:San\s*Lu[ck]as|Lu[ck]as)|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?)|of\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k))|of\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?)|of\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?))|l(?:ūk(?:āne\s*lihilele\s*[sŝ]ubʰavartam[aā]|ane\s*lihilele\s*[sŝ]ubʰavartam[aā])|uk[aā]ne\s*lihilele\s*[sŝ]ubʰavartam[aā])n|Ebanghelyo\s*ayon\s*kay\s*(?:San\s*Lu[ck]as|Lu[ck]as)|(?:E(?:w(?:angelia\s*(?:w(?:edług\s*[sś]w\.?\s*Łukasz|g\s*[sś]w\.?\s*Łukasz)|Łukasz)|\.?\s*Łukasz)|vanjelium\s*Pod[lľ]a\s*Luk[aá][sš])|Injili\s*ya\s*Luk|L(?:uqaas|luk|ook))a|Evan(?:keliumi\s*Luukkaan\s*mukaan|gelium\s*(?:secundum\s*Lucam|podle\s*Luk[aá][sš]e))|ल(?:ूक(?:ा(?:ने\s*लिहिलेले\s*शुभवर्तमान|(?:ले\s*लेखे)?को\s*सुसमाचार)|ॉ)|ुका)|(?:Das\s*Evangelium\s*nach\s*Luk|Evangeliet\s*etter\s*Luk|E(?:l\s*E)?vangelio\s*de\s*Luc|Evangelium\s*nach\s*Luk|S(?:ulat\s*ni\s*S)?an\s*Luc|Injil\s*Luk)as|l(?:ū(?:(?:kāle\s*lekʰeko\s*susm[aā]c[aā]r|(?:qā(?:\s*kī\s*injīl|n)|kā\s*dī\s*ĩjīl))|kale\s*lekʰeko\s*susm[aā]c[aā]r)|uk[aā]le\s*lekʰeko\s*susm[aā]c[aā]r)|லூக்கா\s*(?:எழுதிய\s*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|От\s*Лук(?:а\s*свето\s*Евангелие|и)|Evangelie\s*volgens\s*Lu[ck]as|Ebanghelyo\s*ni\s*San\s*Lu[ck]as|Евангелие(?:то\s*според\s*Лука|\s*(?:според\s*Лука|от\s*Лук[аи]))|Євангелі(?:я\s*від\s*(?:св\.?\s*Луки|Луки)|є\s*від\s*(?:св\.?\s*Луки|Лу\s*?ки))|L(?:uukkaan\s*evankelium|ūkkā\s*Naṛceyt)i|Jevan(?:helije\s*vid\s*Luky|đelje\s*po\s*Luki)|Luk(?:(?:(?:asovo\s*|as\s*?)|ašovo\s*)evangeliu|á[sš]ovo\s*evangeliu)m|ଲୂକ\s*ଲିଖିତ\s*ସୁସମାଗ୍ଭର|Vangelo\s*di\s*(?:San\s*)?Luca|הבשורה\s*על(?:-?פי\s*לוקא?ס|\s*פי\s*לוקס)|Evan[ðđ]elje\s*po\s*Luki|(?:Јеванђеље\s*по|Еванђеље\s*по|Від)\s*Луки|พระวรสารนักบุญลูค|L[uú]kasarguðspjall|(?:Ungjilli\s*i\s*Luk[eë]|Lu(?:k[aá]c|uko))s|L(?:u(?:k(?:a(?:sevangeliet|ah)|aša|á[sš]a|e)|qa(?:at|h)|cas)|o(?:oqa(?:at|h)|[kq]aa[ht])|ik|[ck])|ل(?:ُوقا\s*کی\s*انجیل|و(?:قا\s*کی\s*انجیل|(?:ق(?:ا(?:ءه|[تهی])|[آةهىی])|[كک](?:ا[ءه]|ة))))|ਲੂਕਾ\s*ਦੀ\s*ਇੰਜੀਲ|Κατ[άα]\s*Λουκ[άα]ν|Saint\s*L(?:uke|k)|إنجيل\s*لوقا|Saint\s*Luk?|L(?:u(?:uk(?:kaan)?|k(?:a(?:sa?)?|aš|á[sš])?|q(?:aa?)?|ca?)?|o(?:oqaa?|[kq]a)|ūkkā|lu|úk)?|ルカ(?:による福音書|[の傳]福音書|福音書|[伝書])|St\.\s*L(?:uke|k)|От\s*Лука|St\.\s*Luk?|Ł(?:ukasza|k)|St\s*L(?:uke|k)|Łuk(?:asz)?|l(?:ū(?:(?:(?:kāle|(?:qā?|kā))|kāne)|ka[ln]e)|uk[aā][ln]e)|லூ(?:க்(?:கா)?)?|Ew\s*Łuk|लूक(?:ा(?:ने|ले)?)?|St\s*Luk?|Λ(?:ουκ[άα]ς|κ)|《?路加福音》|루카\s*복음서|ل(?:و(?:ق(?:اء?)?|[كک]ا)?|ُوقا)|《?路加福音|루카(?:\s*복음)?|누가복음서|Λουκ|누가복음|ਲੂਕਾ|Л(?:ук[aаио]|к)|ล(?:ูกา|ก)|《?魯喀》|לוקס|Лук|《?魯喀|ଲୂକ|《路》|《路|ルカ|누가|路》|路|눅))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jer"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:எரேமியா\s*தீர்க்கதரிசியின்\s*புத்தகம்|ଯିରିମିୟ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*(?:[ИЙ]е|Е)ремия|пророка\s*(?:Иеремии|Єремі[ії]))|њига\s*пророка\s*Јеремије)|Ks(?:i[eę]g[ai]\s*Jeremiasza|\.?\s*Jeremiasza)|Aklat\s*ni\s*Jeremia[hs]|Sulat\s*ni\s*Jeremias|y(?:armiy[aā]ko\s*pustak|irm(?:iyāh|ay(?:āh|a)|īyā))|य(?:र्मियाको\s*पुस्तक|िर्मयाह)|(?:Jeremi(?:a(?:n\s*kirj|sz)|j)|Giê-?rê-?mi-?|Irm['’]yaah|Jeremei|Ermmaas|Geremi|Y(?:(?:ere?|eré)mi|ér[eé]mi))a|Li(?:ber\s*Ieremiae|v\s*Jeremi\s*an)|J(?:er(?:em(?:i(?:a(?:s['’]\s*Bog|[hš])|e)|ai?h|iá[sš]|j[aá][sš])|amah|imih)|r)|Jeremias\s*bok|เยเรมีย(?:าห)?์|G(?:iê(?:-?rê-?mi)?|er)|y(?:armiy[aā]ko|irm(?:ayā|iy|īy?))|य(?:र्मिया(?:को)?|िर्म(?:या)?)|(?:Yrm['’]yaah|Erm['’]yaah|Jer[ae]mih)a|(?:Jer(?:em(?:aia|ii)|am[ai]i|im(?:i[ai]|a))|(?:Y(?:eremya|irmay)|[EY]rmeiy|Jer(?:ai|m[im])|Yrm['’]i|Erm['’]i)a|Irm(?:eiya|ia['’]|['’]ia)|[EY]rmia['’])h|ا(?:ِر(?:م(?:یا\s*[يی]|يی)|\s*3)|ِر(?:\s*م|م\s*)ی|ر\s*می|\s*رمی)ا|سفر\s*إرميا|J(?:e(?:(?:r(?:e(?:m(?:i(?:a(?:n|s)?)?)?)?)?)?|rém)|é(?:r(?:[eé]m)?)?)|Yrm['’]yaah|Erm['’]yaah|Jeremías|I(?:eremias|rm(?:iah|ei)a)|Ιερεμ[ίι]ας|ا(?:ِرم(?:ی(?:ا(?:ء[هى]|ئه|[اى])|ا?ها|\s*ی[اه]|ی[اه]|ى)|يا[ءا])|رمی(?:(?:ا[ءاه]|[هى])|ی[اه]))|(?:Jeramia|[EY]rmeya[ah]|Irm(?:eya[ah]|i[ay]a)|[EY]rmi[ay]a)h|Јеремија|H[ei]r[ei]m[iy]as|ਯਿਰਮਿਯਾਹ|Yrm['’]yaa?|Erm(?:['’]yaa?)?|Jeremía|Jer[ae]mih|I(?:er(?:emia)?|rm(?:iah?|eya|['’]ya))|ا(?:ِرم(?:ی(?:اء?|ا?ه)|يا)|ر(?:م(?:یا?)?)?)|Jeramia|[EY]rmeya[ah]|Irm(?:eya[ah]|i[ay]a)|எரே(?:மியா)?|ଯିରିମିୟ|Erēmiyā|[EY]rmiaha|Еремија|Иереми[ия]|ஏரேமியா|یرمِ?یاہ|J(?:erémi|ér[eé]mi)e|Йеремия|[EY]rmiah?|[EY]rmeya|[EY]rmi[ay]a|[EY]rmeia|Єремі[яії]|Еремия|《耶(?:(?:利米[书書])?|肋米亞)》|ירמיהו|ﺃﺭﻣﻴﺎء|《耶(?:利米[书書]|肋米亞)?|ירמיה|耶(?:(?:利米[书書])?|肋米亞)》|예레미(?:야서|아)|エレミヤ書|ヱレミヤ記|[أإ]رميا|耶(?:利米[书書]|肋米亞)?|예레(?:미야)?|エレミヤ|Ye?r|Јер|Иер|Йер|ஏரே|ยรม|Ιε|Єр|Ер|Gr|Ἰε|렘))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Втор(?:а\s*писмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Коринт|о\s*(?:п(?:исмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Коринт|ослание\s*към\s*коринтяните)|(?:Коринтя|Корин[кќ]а)ните)|(?:а\s*Коринтя|а\s*Корин[кќ]а)ните)|(?:II\.?\s*пи|2\.?\s*пи)смо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Коринт|(?:Второ\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Коринт|\s*ап\.?\s*Павла\s*до\s*Коринт)|2-?е\.?\s*Коринт)яни|D(?:(?:(?:ru(?:he\s*poslannja\s*apostola\s*Pavla\s*do\s*korynfj|g[ai]\s*Korynti)|rug(?:a\s*(?:List\s*[sś]w\.?\s*Pawła\s*do\s*Korynt|list\s*do\s*Korynt)|i\s*(?:List\s*[sś]w\.?\s*Pawła\s*do\s*Korynt|list\s*do\s*Korynt))i)a|o(?:(?:(?:vom)?\s*|(?:vom)?)Qorint(?:h(?:iy?a|yu)|iy?a|yu)|(?:(?:vom)?\s*|(?:vom)?)Korinth?ia))n|ezy[eè]m\s*Korentyen|ru(?:g(?:a\s*Korynt[oó]w|i\s*Korynt[oó]w)|h(?:[aá]|[yý])K))|கொரிந்தியருக்கு\s*எழுதிய\s*இரண்டா(?:வது\s*(?:திருமுக|நிருப)ம்|ம்\s*(?:திருமுக|கடித)ம்)|Korint(?:iyarukku\s*Eḻutiya\s*Iraṇṭāvatu\s*Nirupam|os\s*Labaad)|2-?(?:ге|а)\.\s*(?:послання\s*апостола\s*Павла\s*до\s*коринфян|(?:Послання\s*до\s*Коринт|(?:до\s*)?коринт|Коринф)ян|Коринтяни)|Друг(?:а\s*послання\s*апостола\s*Павла\s*до\s*коринфян|е\s*(?:послання\s*апостола\s*Павла\s*до\s*коринфян|(?:Послання\s*до\s*Коринт|(?:до\s*)?коринт|Коринф)ян|Коринтяни)|а\s*(?:(?:посланица\s*)?Коринћанима|Коринтяни)|(?:а\s*Послання\s*до\s*Коринт|а\s*(?:до\s*)?коринт|а\s*Коринф)ян)|رسالة\s*بولس\s*الرسول\s*الثانية\s*إلى\s*أهل\s*كورنثوس|2-?е\.?\s*послання\s*апостола\s*Павла\s*до\s*коринфян|2-?(?:ге|а)\s*(?:послання\s*апостола\s*Павла\s*до\s*коринфян|(?:Послання\s*до\s*Коринт|(?:до\s*)?коринт|Коринф)ян|Коринтяни)|(?:II\.?\s*по|2\.?\s*по)слання\s*апостола\s*Павла\s*до\s*коринфян|ک(?:رنتھ(?:ِیُوں\s*کے\s*نام\s*پولس\s*رسول|یوں\s*کے\s*نام)|ُرِنتھِیوں\s*کے\s*نام)\s*کا\s*دوسرا\s*خط|(?:Pavlova\s*druga\s*poslanica\s*Korin[cć]anim|S[ií]ðara\s*br[eé]f\s*P[aá]ls\s*til\s*Korintumann|Druga\s*Korin[cć]anima\s*Poslanic|Druga\s*poslanica\s*Korin[cæć]anim|(?:II(?:\.\s*Korin[cć]|\s*Korin[cć])|2(?:\.\s*Korin[cć]|\s*Korin[cć]))anima\s*Poslanic|Naa77antto\s*Qoronttoos)a|(?:Paulus(?:'\s*Andet\s*Brev\s*til\s*Korinth|’\s*(?:Andet\s*Brev\s*til\s*Korinth|andre\s*brev\s*til\s*korint))ern|(?:II\.?\s*Korintt|2\.?\s*Korintt)olaiskirj|And(?:re\s*Korinti|en\s*Korint)ern|2(?:\s*(?:[ei](?:\.\s*Korin?t|\s*Korin?t)|Korit)asv|\.\s*Kori(?:nt(?:i?ern|asv)|tasv)|\s*Korinti?ern|\s*Korintasv))e|कोरिन्थीहरूलाई\s*(?:पावलको\s*दोस|दोस्त)्रो\s*पत्र|(?:(?:(?:(?:(?:II\.?\s*L|2\.?\s*L)ist\s*[sś]w\.?\s*Pawła\s*do\s*Korynt|(?:II\.?\s*list\s*d|2\.?\s*list\s*d)o\s*Korynt)|(?:II\.?\s*Kory|2\.?\s*Kory)nt)i|2Korinth?i)a|2(?:\.\s*Kurinthiayo|\s*K(?:urinthiayo|orinth?ia))|2\s*Qorint(?:h(?:iy?a|yu)|iy?a|yu)|2Qorint(?:h(?:iy?a|yu)|iy?a|yu))n|k(?:ur(?:intʰiyōṅ\s*ke\s*nām\s*kā\s*dūsrā\s*ḫaṭ|ĩtʰīāṃ\s*nū̃\s*dūjī\s*pattrī)|orintʰ[iī]har[uū]l[aā][iī]\s*dostro\s*patra|ari[mṃ]tʰkar[aā][mṃ]s\s*dusre\s*patra)|الرسالة\s*الثانية\s*إلى\s*أهل\s*كورنثوس|କରିନ୍ଥୀୟଙ୍କ\s*ପ୍ରତି\s*ଦ୍ୱିତୀୟ\s*ପତ୍ର|T(?:oinen\s*K(?:irje\s*korinttilaisill|orintt(?:olaiskirj|ilaisill))e|weede\s*(?:Korint(?:h?i[eë]rs|he)|Corint(?:h?i[eë]rs|he)))|(?:Waraka\s*wa\s*Pili\s*kwa\s*Wakorinth|Ika-?\s*2\s*Sulat\s*sa\s*mga\s*Corinti|SECOND\s*Sulat\s*sa\s*mga\s*Corinti|I(?:kalawang\s*Mga\s*Taga-?\s*Corint|I\.?\s*Mga\s*Taga-?\s*Corint)|(?:2(?:\.\s*(?:Mga\s*Taga-?\s*|Taga-?)|\s*(?:Mga\s*Taga-?\s*|Taga-?))C|2\.?\s*Mga\s*Taga-?C)orint|Ikalawang\s*[CK]orinti|(?:Pili\s*W|II\.?\s*W|2\.?\s*W)akorinth)o|אגרת\s*פולוס\s*השנייה\s*אל-?הקור(?:נתים|ינ)|Waraka\s*wa\s*Pili\s*kwa\s*Wakorinto|Barua\s*ya\s*Pili\s*kwa\s*Wakorintho|पौलाचे\s*करिंथकरांस\s*दूसरे\s*पत्र|Ika-?\s*2\s*Sulat\s*sa\s*mga\s*Corinto|S(?:ECOND\s*Sulat\s*sa\s*mga\s*Corinto|econd\s*Corinthia?ns|[ií]ðara\s*K[oó]rintubr[eé]f)|(?:II\.?\s*Ki|2\.?\s*Ki)rje\s*korinttilaisille|(?:Second(?:(?:a\s*lettera\s*ai|o)|a)\s*Corinz|II(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:ti?en|z))|2(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:(?:tien|z)|ten))|2°\.\s*Corinz|2°\s*Corinz)i|ה(?:איגרת\s*השנייה\s*אל\s*הקורי|שנייה\s*אל\s*הקורי?)נתים|S(?:[ií]ðara\s*br[eé]f\s*P[aá]ls\s*til\s*Kori|econd\s*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?|th)?)?)|(?:II\.?\s*по|2\.?\s*по)сланица\s*Коринћанима|(?:(?:2(?:-?е\.?\s*П|\.?\s*П)|II\.?\s*П)ослання\s*до\s*Коринт|(?:(?:2(?:-?е\.?\s*д|\.?\s*д)|II\.?\s*д)о\s*к|II\.?\s*к)оринт|2(?:-?е\.?\s*ко|\.?\s*ко)ринт|II\.?\s*Коринф)ян|Epistula\s*(?:II\s*ad\s*Corinthios|ad\s*Corinthios\s*II)|ਕੁਰਿੰਥੀਆਂ\s*ਨੂੰ\s*ਦੂਜੀ\s*ਪੱਤ੍ਰੀ|M[aá]sodik\s*Korint(?:husiakhoz|usi)|And(?:r(?:a\s*Korint(?:h?i|h?)erbrevet|e\s*korinterbrev)|(?:e[nt]\s*Korinth|en\s*Korint)erbrev)|(?:Druh(?:(?:[aá]\s*kniha|[aá])\s*Korintsk[yý]|(?:[aá]\s*kniha|[aá])\s*Korintano|(?:[aá]\s*kniha|[aá])\s*Korinťano|[aá]\s*list\s*Korint?sk[yý]|[yý]\s*(?:list\s*Korin(?:tsk[yý]|tano|ťano|sk[yý])|Korin(?:t(?:sk[yý]|ano)|ťano)))|(?:(?:II\.?\s*list\s*K|2\.?\s*list\s*K)orint?s|II\.?\s*Korints|2\.?\s*Korints)k[yý]|2\s*k\.?\s*Korintsk[yý]|2\s*k\.?\s*Korintano|(?:2\s*k\.?\s*Korinť|II\.?\s*Korinť|2\.?\s*Korinť)ano|(?:II\.?\s*Korintan|2\.?\s*Korintan)o)m|(?:(?:Deuxi[eè]mes?\s*Corinthie|2(?:(?:eme|de?)|ème)\.\s*Corinthie|II(?:\.\s*Corint(?:hia|i)a|\s*Corint(?:hia|i)a)|2(?:(?:eme|de?)|ème)\s*Corinthie|(?:II\.?\s*Corini|2\.\s*Corini)thia|(?:II\.?\s*Corii|2\.?\s*Corii)nthia|(?:(?:(?:II\.?\s*Corini|2\.\s*Corini)|2\s*Corini)t|(?:II\.?\s*Corit|2\.?\s*Corit))hai|(?:II\.?\s*Corn|2\.?\s*Corn)(?:inthai|thia)|(?:(?:II\.?\s*Corintha|2\.?\s*Corintha)|(?:II\.?\s*Corn|2\.?\s*Corn)itha)ia|(?:(?:II\.?\s*Corr|2\.?\s*Corr)in?tha|(?:II\.?\s*Corn|2\.?\s*Corn)tha)i|2\.\s*Corint(?:hia|i)a|(?:II\.?\s*Corintho|2\.?\s*Corintho)a|2\s*Corint(?:hia|i)a|2\s*Corinithia|(?:II\.?\s*Corit|2\.?\s*Corit)hia)n|Second\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)an|or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)n|orin[an]thian|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)n|or(?:in|ni)thain|oranthian)|2nd\.?\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)an|or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)n|orin[an]thian|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)n|or(?:in|ni)thain|oranthian)|(?:(?:II\.?\s*Corii|2\.?\s*Corii)nthii|II\.?\s*Corinthii|Do(?:(?:vom)?\s*|(?:vom)?)Corinti|(?:II\.?\s*Corintho|2\.?\s*Corintho)i|(?:II\.?\s*Corn|2\.?\s*Corn)(?:in?thi|thii)|(?:II\.?\s*Corr|2\.?\s*Corr)in?thi|2\.?\s*Corinthii|(?:II\.?\s*Corit|2\.?\s*Corit)hii|(?:II\.?\s*Corit|2\.?\s*Corit)ho|2Corinti)an|II(?:\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|\s*Corint(?:hi(?:(?:ai|e)|o)n|ion))|(?:II\.?\s*Corinthian|2\.?\s*Corinthian)[ao]|(?:II\.?\s*Corini|2\.\s*Corini)thina|(?:II(?:\.\s*Corin[an]|\s*Corin[an])|2(?:\.\s*Corin[an]|\s*Corin[an]))thian|(?:II\.?\s*Ch|2\.?\s*Ch)or(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)n|2\s*kari[mṃ]tʰkar[aā][mṃ]|2e\.?\s*Corinthien|2\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|(?:II\.?\s*Corinthin|2\.?\s*Corinthin)a|(?:(?:(?:II\.?\s*Corini|2\.\s*Corini)|2\s*Corini)t|(?:II\.?\s*Corit|2\.?\s*Corit))han|(?:II\.?\s*Corn|2\.?\s*Corn)(?:in?than|thin)|(?:(?:II\.?\s*Corintha|2\.?\s*Corintha)|(?:II\.?\s*Corn|2\.?\s*Corn)itha)in|(?:II\.?\s*Cora|2\.?\s*Cora)nthian|2\s*Corinthi(?:(?:ai|e)|o)n|2\s*Corinithina|(?:II\.?\s*Corintha|2\.?\s*Corintha)n|(?:II\.?\s*Corit|2\.?\s*Corit)hin|2\s*Corintion)s|करिंथकरांस\s*दुसरे\s*पत्र|(?:II\.?\s*Korintt|2\.?\s*Korintt)ilaisille|2(?:\.\s*Korinth?ierb|\s*Korinth?ierb)revet|(?:II\.?\s*Korinthu|2\.?\s*Korinthu)siakhoz|ଦ୍ୱିତୀୟ\s*କରିନ୍ଥୀୟଙ୍କ|2(?:(?:\.\s*(?:korintʰ[iī]har[uū]l[aā][iī]|क(?:ोरिन्(?:थ(?:ीहरूलाई|ॉस)|‍थी)|ुर(?:िन्(?:यि़|थि)|न्थि)यों)|Korint(?:hiers|i(?:ers|o))|โครินธ์)|\s*(?:(?:(?:(?:(?:korintʰ[iī]har[uū]l[aā][iī]|(?:(?:(?:Korinti(?:yarukku|o)|ਕੁਰਿੰਥੀਆਂ\s*ਨੂੰ|kurĩtʰīāṃ|Corinto|قور|ค[ธร])|Korinthiers)|Korintiers))|करिंथकरांस)|कोरिन्(?:थ(?:ीहरूलाई|ॉस)|‍थी))|कुर(?:िन्(?:यि़|थि)|न्थि)यों)|โครินธ์)|(?:-?е\.?\s*к\s*|\.?\s*к\s*)Коринфянам|(?:-?я|[ея])(?:\.\s*(?:к\s*)?Коринфянам|\s*(?:к\s*)?Коринфянам)|(?:-?е\.?\s*Коринфяна|\.?\s*Коринфяна)м|e\.?\s*Corinthe|コリント|كو|코린)|qrnt)|(?:2(?:\.\s*Korinth?erbreve|\s*Korinth?erbreve)|Dezy[eè]m\s*Korin)t|코린토(?:\s*신자들에게\s*보낸\s*둘째\s*서간|2서)|Προς\s*Κορινθ(?:ιους\s*Β['ʹʹ΄’]|ίους\s*Β['ʹʹ΄’])|D(?:ru(?:ga\s*Korin[cć]anima|h(?:[aá]|[yý])\s*K)|ovomCor)|Tweede\s*(?:Kor(?:inth?i[eë]r)?|Corinth?i[eë]r)|M[aá]sodik\s*Kor(?:inthus)?|Προς\s*Κορινθιους\s*Β|Ikalawang\s*[CK]orinto|(?:(?:Do(?:(?:vom)?\s*|(?:vom)?)Corinth|2Corinth)ian|Second\s*Corthian|2e\.?\s*Corinthier|II(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|2\.\s*Corinth?ier|2nd\.?\s*Corthian|2\s*Corinthier|(?:II\.?\s*Cort|2\.?\s*Cort)hian|2\s*Corintier|2\.?\s*Korinto)s|Zweite(?:[nrs])?\s*Korinther|(?:Segund[ao]\s*Cor[ií]nt|(?:2(?:(?:(?:\.[oº]|º)\.?\s*Cori|\s*Corí)|\.\s*Corí)|II\.?\s*Corí)nt|2[ao]\.\s*Cor[ií]nt|2[ao]\s*Cor[ií]nt)ios|2(?:(?:(?:\.\s*(?:Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|erbrev|ier|er|a)?)?|क(?:ुरिन्थ(?:ियो)?|ोरि(?:न्थी)?)|Кор)|\s*Korinthe(?:r(?:brev)?)?|\s*Korinterbrev|-?е\.?\s*Коринфян|\s*Korinthier|\s*कुरिन्थ(?:ियो)?|\s*(?:ਕੁਰਿੰਥੀਆਂ|Co(?:r(?:in(?:ti?|i)?)?)?|Kor(?:int)?|கொ(?:ரி)?|Qor)|\s*Korintier|\.?\s*Коринфян|\s*Korinter|\s*कोरि(?:न्थी)?|\s*Korinta|\s*Кор|Kor)|qrn?)|قر(?:نت?)?)|(?:Do(?:(?:vom)?\s*|(?:vom)?)Corinth|2Corinth)ian|ଦ୍ୱିତୀୟ\s*କରିନ୍ଥୀୟ|2nd\.?\s*Corinthia?ns|(?:Втор[ао]\s*Коринтја|(?:II\.?\s*Коринт|2\.?\s*Коринт)ја)ни|ad\s*Corinthios\s*II|(?:II(?:\.\s*Korin[cć]|\s*Korin[cć])|2(?:\.\s*Korin[cć]|\s*Korin[cć]))anima|2nd\.?\s*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?|th)?)?|Second\s*Corthian|Втор(?:а\s*Кор(?:интяни)?|о\s*Кор(?:интяни)?)|II(?:\.\s*(?:C(?:orint(?:h(?:i(?:aid|os)|e)|ios|o)|ô(?:-?rinh-?|rin)tô)|Korint(?:usi|he|io))|\s*(?:C(?:orint(?:h(?:i(?:aid|os)|e)|ios|o)|ô(?:-?rinh-?|rin)tô)|Korint(?:usi|he|io)))|دو(?:م(?:(?:-?کُرِنتھِی|(?:(?:\s*کرنتھ(?:ِیُ|ی)|۔کرنتھی)|\s*کُرنتھِی))وں|قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان))|(?:م\s*)?قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|\s*قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان))|2\.?\s*korinterbrev|(?:II\.?\s*Corinthian|2\.?\s*Corinthian)s|(?:2(?:(?:(?:e\.?\s*Corinthië|\.\s*Korinth?ië|\s*(?:Korinth?ië|Corintië))|\s*Corinthië)|\.\s*Corinth?ië)|II(?:\.\s*(?:Corinth?ië|Korinti[eë])|\s*(?:Corinth?ië|Korinti[eë])))rs|(?:II\.?\s*Korinthi|2e\.?\s*Corinti)[eë]rs|2e\.?\s*Korint(?:h?i[eë]rs|he)|(?:II\.?\s*Коринт|2\.?\s*Коринт)яните|(?:II(?:\.\s*Корин[кќ]|\s*Корин[кќ])|2(?:\.\s*Корин[кќ]|\s*Корин[кќ]))аните|(?:II\.?\s*Коринћ|2\.?\s*Коринћ)анима|كورنثوس\s*الثانية|II\.?\s*Corinthian|2e\.?\s*Corinthier|II(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|(?:2(?:(?:(?:e\.?\s*Corinthië|\.\s*Korinth?ië|\s*(?:Korinth?ië|Corintië))|\s*Corinthië)|\.\s*Corinth?ië)|II(?:\.\s*(?:Corinth?ië|Korinti[eë])|\s*(?:Corinth?ië|Korinti[eë])))r|(?:II\.?\s*Korinthi|2e\.?\s*Corinti)[eë]r|2e\.?\s*Korinth?i[eë]r|2\.\s*C(?:orint(?:h(?:i(?:aid|os)|e)|ios|o)|ô(?:-?rinh-?|rin)tô)|(?:2\.|۲)-?کُرِنتھِیوں|(?:II\.?\s*Corinthin|2\.?\s*Corinthin)s|(?:Pili\s*W|II\.?\s*W|2\.?\s*W)akorinto|(?:Andre\s*Korinte|Pili\s*Ko)r|2\.?\s*କରିନ୍ଥୀୟଙ୍କ|2\.?\s*Corinthian|Do(?:(?:vom)?\s*|(?:vom)?)Corinth|2\.\s*Corinth?ier|2nd\.?\s*Corthian|(?:II\.?\s*Korinthu|2\.?\s*Korinthu)s|(?:II\.?\s*Коринт|2\.?\s*Коринт)яни|2\s*Corinth(?:i(?:aid|os)|e)|(?:II\.?\s*Kore|2\.?\s*Kore)ntyen|Β['ʹʹ΄’]\s*Κορινθ[ίι]ους|(?:2\.?\s*کرنتھ(?:ِیُ|ی)|۲\s*کرنتھ(?:ِیُ|ی))وں|(?:2\.?\s*ک|۲\s*ک)ُرنتھِیوں|2-?کُرِنتھِیوں|Wakorintho\s*II|Corinthios\s*II|2\s*கொரிந்தியர்|II(?:\.\s*(?:C(?:o(?:r(?:in(?:t(?:io|h)?)?)?)?|ô(?:-?rinh)?)|Kor(?:int(?:us|a)?)?|Кор)|\s*(?:C(?:o(?:r(?:in(?:t(?:io|h)?)?)?)?|ô(?:-?rinh)?)|Kor(?:int(?:us|a)?)?|Кор))|دو(?:(?:م\s*)?قرنتی[او]ن(?:ه|ی)?|مق(?:رنتی[او]ن(?:ه|ی)?)?|\s*قرنتی[او]ن(?:ه|ی)?)|2\s*Corinthier|(?:II\.?\s*Cort|2\.?\s*Cort)hian|2\s*Cô(?:-?rinh-?|rin)tô|2\.?\s*Korintusi|(?:II\.?\s*Kory|2\.?\s*Kory)nt[oó]w|2\s*قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|۲\s*قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|コリント(?:人への(?:第二の手紙|後の書|手紙[Ⅱ二])|の信徒への手紙二|\s*2|後書)|2\.\s*C(?:o(?:r(?:in(?:t(?:io|h)?)?)?)?|ô(?:-?rinh)?)|2\.?\s*Korintus|2\s*Corintier|2\.?\s*କରିନ୍ଥୀୟ|2\s*Corintios|(?:2\.?۔|۲۔)کرنتھیوں|[2۲]قرنتی[او]ن(?:ی?ان|ها|ن)|2\s*Corintio|2\s*قرنتی[او]ن(?:ه|ی)?|۲\s*قرنتی[او]ن(?:ه|ی)?|2\.?\s*Korinto|2\s*Corinth|2\s*Cô(?:-?rinh)?|[2۲]قرنتی[او]ن(?:ه|ی)?|And(?:en|re)\s*Kor|(?:II\.?\s*Cort|2\.?\s*Cort)h|Друга\s*Кор|2Corinth|[2۲]قرنتيان|Ⅱ\s*コリント人へ|2e\.?\s*Kor|(?:《?哥林多后书|《?哥林多後書|(?:《[格歌]|[格歌])林多後書|《林[后後]|林[后後])》|《?适凌爾福後》|Β['ʹʹ΄’]\s*Κορ?|《?哥林多后书|《?哥林多後書|(?:《[格歌]|[格歌])林多後書|《?适凌爾福後|۲(?:قر(?:نت?)?|qrn?)|۲qrnt|고린도[2후]서|2Cor|《林[后後]|林[后後]|고후))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:П(?:рв(?:а\s*(?:писмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Коринт|(?:посланица\s*)?Коринћанима)|о\s*писмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Коринт)|ърво\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Коринт|\s*ап\.?\s*Павла\s*до\s*Коринт)яни|ерш[ае]\s*(?:послання\s*апостола\s*Павла\s*до\s*коринфян|(?:Послання\s*до\s*Коринт|(?:до\s*)?коринт|Коринф)ян|Коринтяни)|ърв(?:о\s*(?:послание\s*към\s*к|К)оринтяните|а\s*Коринтяните)|рв(?:а\s*Корин[кќ]а|о\s*Корин[кќ]а)ните|рв[ао]\s*Коринтјани)|(?:1\.?\s*пи|I\.?\s*пи)смо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Коринт|(?:(?:P(?:er[sš]e\s*poslannja\s*apostola\s*Pavla\s*do\s*korynfj|ierwsz[aey]\s*Korynti)|(?:Pierwsz[aey]\s*(?:List\s*[sś]w\.?\s*Pawła\s*do\s*Korynt|list\s*do\s*Korynt)|(?:1\.?\s*L|I\.?\s*L)ist\s*[sś]w\.?\s*Pawła\s*do\s*Korynt|(?:1\.?\s*list\s*d|I\.?\s*list\s*d)o\s*Korynt)i|Avval\s*?Korinth?i|(?:1\.?\s*Kory|I\.?\s*Kory)nti|1Korinth?i)a|Premye\s*Korentye|1(?:\.\s*Kurinthiayo|\s*K(?:urinthiayo|orinth?ia))|(?:1\.?\s*Kore|I\.?\s*Kore)ntye)n|K(?:orint(?:iyarukku\s*Eḻutiya\s*Mutalāvatu\s*Nirupam|os\s*Kowaad)|wanza\s*Kor)|1-?(?:ше|а)\.\s*(?:послання\s*апостола\s*Павла\s*до\s*коринфян|(?:Послання\s*до\s*Коринт|(?:до\s*)?коринт|Коринф)ян|Коринтяни)|கொரிந்தியருக்கு\s*எழுதிய\s*முதல(?:(?:ாவது\s*திருமுக|ா(?:வது\s*நிருப)?)|்\s*திருமுக)ம்|1-?е\.?\s*послання\s*апостола\s*Павла\s*до\s*коринфян|1-?(?:ше|а)\s*(?:послання\s*апостола\s*Павла\s*до\s*коринфян|(?:Послання\s*до\s*Коринт|(?:до\s*)?коринт|Коринф)ян|Коринтяни)|رسالة\s*بولس\s*الرسول\s*الأولى\s*إلى\s*أهل\s*كورنثوس|(?:1\.?\s*посланн|I\.?\s*посланн)я\s*апостола\s*Павла\s*до\s*коринфян|ک(?:رنتھ(?:ِیُوں\s*کے\s*نام\s*پولس\s*رسول|یوں\s*کے\s*نام)|ُرِنتھِیوں\s*کے\s*نام)\s*کا\s*پہلا\s*خط|Paulus(?:(?:'\s*Første|'\s*1\.?)\s*Brev\s*til\s*Korinth|’\s*(?:Første\s*Brev\s*til\s*Korinth|første\s*brev\s*til\s*korint|1\.\s*Brev\s*til\s*Korinth|1\s*Brev\s*til\s*Korinth))erne|(?:Ensimm[aä]inen\s*K(?:irje\s*korinttilaisill|orintt(?:olaiskirj|ilaisill))|(?:1\.?\s*Ki|I\.?\s*Ki)rje\s*korinttilaisill|(?:1\.?\s*Korintt|I\.?\s*Korintt)olaiskirj|(?:1\.?\s*Korintt|I\.?\s*Korintt)ilaisill|1(?:\s*(?:[ei](?:\.\s*Korin?t|\s*Korin?t)|Korit)asv|\.\s*Kori(?:nt(?:i?ern|asv)|tasv)|\s*Korinti?ern|\s*Korintasv))e|(?:P(?:avlova\s*prva\s*poslanica\s*Korin[cć]anim|rva\s*Korin[cć]anima\s*Poslanic|rva\s*poslanica\s*Korin[cæć]anim)|Fyrra\s*br[eé]f\s*P[aá]ls\s*til\s*Korintumann|(?:1(?:\.\s*Korin[cć]|\s*Korin[cć])|I(?:\.\s*Korin[cć]|\s*Korin[cć]))anima\s*Poslanic|Koiro\s*Qoronttoos)a|कोरिन्थीहरूलाई\s*प(?:ावलको\s*प)?हिलो\s*पत्र|k(?:ur(?:intʰiyōṅ\s*ke\s*nām\s*kā\s*pahlā\s*ḫaṭ|ĩtʰīāṃ\s*nū̃\s*pahilī\s*pattrī)|orintʰ[iī]har[uū]l[aā][iī]\s*pahilo\s*patra|ari[mṃ]tʰkar[aā][mṃ]s\s*pahile\s*patra)|(?:Waraka\s*wa\s*Kwanza\s*kwa\s*Wakorinth|(?:I(?:ka-?\s*1\s*S|\.?\s*S)|1\.?\s*S)ulat\s*sa\s*mga\s*Corinti|Una(?:ng\s*(?:Sulat\s*sa\s*mga\s*Corinti|Mga\s*Taga-?\s*Corint|[CK]orinti)|\s*(?:Sulat\s*sa\s*mga\s*Corinti|Mga\s*Taga-?\s*Corint|[CK]orinti))|(?:1(?:\.\s*(?:Mga\s*Taga-?\s*|Taga-?)|\s*(?:Mga\s*Taga-?\s*|Taga-?))C|1\.?\s*Mga\s*Taga-?C)orint|I\.?\s*Mga\s*Taga-?\s*Corint|(?:Kwanza\s*W|1\.?\s*W|I\.?\s*W)akorinth)o|Waraka\s*wa\s*Kwanza\s*kwa\s*Wakorinto|Barua\s*ya\s*Kwanza\s*kwa\s*Wakorintho|אגרת\s*פולוס\s*הראשונה\s*אל-?הקור(?:נתים|י)|الرسالة\s*الأولى\s*إلى\s*أهل\s*كورنثوس|पौलाचे\s*करिंथकरांस\s*पहिले\s*पत्र|କରିନ୍ଥୀୟଙ୍କ\s*ପ୍ରତି\s*ପ୍ରଥମ\s*ପତ୍ର|(?:I(?:ka-?\s*1\s*S|\.?\s*S)|1\.?\s*S)ulat\s*sa\s*mga\s*Corinto|ה(?:איגרת\s*הראשונה\s*אל\s*הקורי|ראשונה\s*אל\s*הקורי?)נתים|Una(?:ng\s*(?:Sulat\s*sa\s*mga\s*C|[CK])orinto|\s*(?:Sulat\s*sa\s*mga\s*C|[CK])orinto)|ਕੁਰਿੰਥੀਆਂ\s*ਨੂੰ\s*ਪਹਿਲੀ\s*ਪੱਤ੍ਰੀ|F(?:yrra\s*br[eé]f\s*P[aá]ls\s*til\s*Korin|ørste\s*Kor(?:inter)?|irst\s*Co(?:r(?:in(?:th?)?)?)?)|(?:(?:1(?:-?е\.?\s*П|\.?\s*П)|I\.?\s*П)ослання\s*до\s*Коринт|(?:(?:1(?:-?е\.?\s*д|\.?\s*д)|I\.?\s*д)о\s*к|I\.?\s*к)оринт|1(?:-?е\.?\s*ко|\.?\s*ко)ринт|I\.?\s*Коринф)ян|(?:Prim(?:(?:a\s*lettera\s*ai|o)|a)\s*Corinz|1(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:(?:tien|z)|ten))|I(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:ti?en|z))|1°\.\s*Corinz|1°\s*Corinz)i|(?:Epistula\s*I\s*ad\s*Corinthio|(?:Prime(?:ir[ao]\s*Cor[ií]nt|ro?\s*Corint)|(?:1(?:\.[oº]|º)\.\s*Cori|1(?:\.[oº]|º)\s*Cori|1\.?\s*Corí|I\.?\s*Corí)nt|1[ao]\.\s*Cor[ií]nt|1[ao]\s*Cor[ií]nt)io|(?:First|1st\.?)\s*Corinthian[ao]|(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)thina|(?:First\s*Corinthin|1st\.\s*Corinthin|1st\s*Corinthin|1\.?\s*Corinthin|I\.?\s*Corinthin)a|(?:(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)t|(?:(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)|1\s*Corinit))han|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)(?:in?than|thin)|(?:(?:First\s*Corintha|1st\.\s*Corintha|1st\s*Corintha|1\.?\s*Corintha|I\.?\s*Corintha)|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)itha)in|(?:First\s*Ch|1st\.\s*Ch|1st\s*Ch|1\.?\s*Ch|I\.?\s*Ch)orinthin|(?:First\s*Corintha|1st\.\s*Corintha|1st\s*Corintha|1\.?\s*Corintha|I\.?\s*Corintha)n|1(?:\s*(?:(?:kari[mṃ]tʰkar[aā][mṃ]|Corinthi(?:(?:ai|e)|o)n)|Corintion)|\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion))|I(?:\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|\s*Corint(?:hi(?:(?:ai|e)|o)n|ion))|(?:1\.?\s*Corinthian|I\.?\s*Corinthian)[ao]|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)hin|1\s*Corinithina|C(?:or(?:i(?:(?:n(?:thi(?:an[ao]|na|on)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|or(?:in|ni)thain|horinthin))s|(?:Epistula\s*)?ad\s*Corinthios\s*I|(?:1\.?\s*послани|I\.?\s*послани)ца\s*Коринћанима|F(?:[oö]rsta\s*Korint(?:h?i|h?)erbrevet|ørste\s*(?:Korint(?:herbrev|(?:erbrev|i?erne))|korinterbrev)|yrra\s*Korintubr[eé]f)|(?:Prv(?:n[ií]\s*(?:list\s*Korint?s|Korints)k[yý]|[aá]\s*kniha\s*Korin(?:t(?:sk[yý]|ano)|ťano)|[yý]\s*(?:list\s*Korin(?:t(?:sk[yý]|ano)|ťano)|Korin(?:t(?:sk[yý]|ano)|ťano))|a\s*Korintsk[yý]|a\s*Korintano|a\s*Korinťano|á\s*Korin(?:t(?:sk[yý]|ano)|ťano))|(?:(?:1\.?\s*list\s*K|I\.?\s*list\s*K)orint?s|1\.?\s*Korints|I\.?\s*Korints)k[yý]|1\s*k\.\s*Korin(?:t(?:sk[yý]|ano)|ťano)|1\s*k\s*Korin(?:t(?:sk[yý]|ano)|ťano)|(?:1\.?\s*Korintan|I\.?\s*Korintan)o|(?:1\.?\s*Korinť|I\.?\s*Korinť)ano)m|(?:Premi(?:eres?\s*Corinthie|ères?\s*Corinthie|ers?\s*Corinthie)|(?:First|1st\.?)\s*Corinthia[ai]|(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)thia|(?:First\s*Corii|1st\.\s*Corii|1st\s*Corii|1\.?\s*Corii|I\.?\s*Corii)nthia|(?:(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)t|(?:(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)|1\s*Corinit))hai|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)(?:inthai|thia)|(?:(?:First\s*Corintha|1st\.\s*Corintha|1st\s*Corintha|1\.?\s*Corintha|I\.?\s*Corintha)|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)itha)ia|(?:(?:First\s*Corr|1st\.\s*Corr|1st\s*Corr|1\.?\s*Corr|I\.?\s*Corr)in?tha|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)tha)i|(?:First\s*Ch|1st\.\s*Ch|1st\s*Ch|1\.?\s*Ch|I\.?\s*Ch)orinth(?:ia|ai)|1(?:(?:ere?|re)|ère)\.\s*Corinthie|First\s*Corinthio|(?:First\s*Corintho|1st\.\s*Corintho|1st\s*Corintho|1\.?\s*Corintho|I\.?\s*Corintho)a|1(?:(?:ere?|re)|ère)\s*Corinthie|1st\.\s*Corinthio|(?:First|1st\.?)\s*Corinti[ao]|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)hia|1\.\s*Corint(?:hia|i)a|I(?:\.\s*Corint(?:hia|i)a|\s*Corint(?:hia|i)a)|1st\s*Corinthio|1\s*Corint(?:hia|i)a|1\s*Corinithia|C(?:or(?:i(?:(?:n(?:(?:t(?:hia[ai]|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i|horinth(?:ia|ai)))ns|करिंथकरांस\s*पहिले\s*पत्र|E(?:ls[oő]\s*Korint(?:husiakhoz|usi)|erste\s*[CK]orinthe)|1(?:\.\s*Korinth?ierb|\s*Korinth?ierb)revet|(?:(?:First\s*Corii|1st\.\s*Corii|1st\s*Corii|1\.?\s*Corii|I\.?\s*Corii)nthii|First\s*Corinthii|(?:First\s*Corintho|1st\.\s*Corintho|1st\s*Corintho|1\.?\s*Corintho|I\.?\s*Corintho)i|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)(?:in?thi|thii)|(?:First\s*Corr|1st\.\s*Corr|1st\s*Corr|1\.?\s*Corr|I\.?\s*Corr)in?thi|(?:First\s*Corin[an]|1st\.\s*Corin[an]|1st\s*Corin[an]|1(?:\.\s*Corin[an]|\s*Corin[an])|I(?:\.\s*Corin[an]|\s*Corin[an]))thi|(?:First\s*Ch|1st\.\s*Ch|1st\s*Ch|1\.?\s*Ch|I\.?\s*Ch)or(?:an|[in])thi|1st\.\s*Corinthii|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)hii|(?:First\s*Cora|1st\.\s*Cora|1st\s*Cora|1\.?\s*Cora|I\.?\s*Cora)nthi|1st\s*Corinthii|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)ho|1\.?\s*Corinthii|I\.?\s*Corinthii|C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)|orin[an]thi|hor(?:an|[in])thi))ans|1(?:(?:(?:(?:(?:\.\s*(?:korintʰ[iī]har[uū]l[aā][iī]|क(?:ोरिन्(?:थ(?:ीहरूलाई|ॉस)|‍थी)|ुर(?:िन्(?:यि़|थि)|न्थि)यों)|Korint(?:hiers|i(?:ers|o))|โครินธ์)|\s*(?:(?:(?:(?:(?:korintʰ[iī]har[uū]l[aā][iī]|(?:(?:(?:Korinti(?:yarukku|o)|ਕੁਰਿੰਥੀਆਂ\s*ਨੂੰ|kurĩtʰīāṃ|Corinto|قور|ค[ธร])|Korinthiers)|Korintiers))|कुर(?:िन्(?:यि़|थि)|न्थि)यों)|करिंथकरांस)|कोरिन्(?:थ(?:ीहरूलाई|ॉस)|‍थी))|โครินธ์)|(?:-?е\.?\s*к\s*|\.?\s*к\s*)Коринфянам|(?:-?я|[ея])(?:\.\s*(?:к\s*)?Коринфянам|\s*(?:к\s*)?Коринфянам)|(?:-?е\.?\s*Коринфяна|\.?\s*Коринфяна)м|コリント|كو|코린)|\s*Corinth(?:i(?:aid|os)|e))|\s*Corintios)|\s*Cô(?:-?rinh-?|rin)tô)|\.\s*C(?:orint(?:h(?:i(?:aid|os)|e)|ios|o)|ô(?:-?rinh-?|rin)tô))|(?:1\.?\s*Korinthu|I\.?\s*Korinthu)siakhoz|(?:1(?:\.\s*Korinth?erbreve|\s*Korinth?erbreve)|Premye\s*Korin)t|(?:Eerste\s*(?:Korinth?i[eë]r|Corinth?i[eë]r)|1e\.\s*(?:Korinth?i[eë]r|Corinth?i[eë]r)|1(?:\.\s*Corinth?ier|(?:(?:\s*Corinthier|\.?\s*Korinto)|\s*Corintier))|I(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|(?:1(?:(?:(?:\.\s*Korinth?ië|\s*(?:Korinth?ië|Corintië))|\s*Corinthië)|\.\s*Corinth?ië)|I(?:\.\s*(?:Corinth?ië|Korinti[eë])|\s*(?:Corinth?ië|Korinti[eë])))r|I\.?\s*Korinthi[eë]r|1e\s*(?:Korinth?i[eë]r|Corinth?i[eë]r))s|코린토(?:\s*신자들에게\s*보낸\s*첫째\s*서간|1서)|Προς\s*Κορινθ(?:ιους\s*Α['ʹʹ΄’]|ίους\s*Α['ʹʹ΄’])|Eerste\s*(?:Korinth?i[eë]r|Corinth?i[eë]r)|Προς\s*Κορινθιους\s*Α|P(?:ierwsz[aey]\s*Korynt[oó]w|rvn[ií]K)|(?:First|1st\.?)\s*Corinthians|Avval\s*Corinth?ians|(?:Avval\s*|(?:Avval|1))Qorint(?:h(?:iy?a|yu)n|(?:iy?a|yu)n)|ପ୍ରଥମ\s*କରିନ୍ଥୀୟଙ୍କ|1(?:(?:(?:(?:(?:\.\s*(?:Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|erbrev|ier|er|a)?)?|क(?:ुरिन्थ(?:ियो)?|ोरिन्थी)|Кор)|\s*Korinthe(?:r(?:brev)?)?|\s*Korinterbrev|-?е\.?\s*Коринфян|\s*Korinthier|\s*कुरिन्थ(?:ियो)?|\s*(?:ਕੁਰਿੰਥੀਆਂ|Co(?:r(?:in(?:ti?|i)?)?)?|Kor(?:int)?|கொ(?:ரி)?|Qor)|\s*Korintier|\.?\s*Коринфян|\s*Korinter|\s*कोरिन्थी|\s*Korinta|\s*Кор|Kor)|\s*Corinth)|\s*Corintio)|\s*Cô(?:-?rinh)?)|\.\s*C(?:o(?:r(?:in(?:t(?:io|h)?)?)?)?|ô(?:-?rinh)?))|Prv(?:a\s*Korin[cć]anima|n[ií]\s*K(?:or)?)|(?:First|1st\.?)\s*Corinthian|Avval\s*Corinth(?:ian)?|اوّل(?:-?کُرِنتھِی|(?:(?:\s*کرنتھِیُ|۔کرنتھی)|\s*کُرنتھِی))وں|(?:First\s*Corinthin|1st\.\s*Corinthin|1st\s*Corinthin|1\.?\s*Corinthin|I\.?\s*Corinthin)s|Erste(?:[nrs])?\s*Korinther|(?:Avval|1)Corinth?ians|(?:Kwanza\s*W|1\.?\s*W|I\.?\s*W)akorinto|(?:Avval|1)Corinth(?:ian)?|П(?:ърв(?:а\s*Кор(?:интяни)?|о\s*Кор(?:интяни)?)|рва\s*Кор)|1\.?\s*korinterbrev|(?:First\s*Cort|(?:1st\.\s*Cort|(?:1st\s*Cort|(?:1\.?\s*Cort|I\.?\s*Cort))))hians|Yek(?:\s*Corinth?ians|\s*?Qorint(?:h(?:iy?a|yu)n|(?:iy?a|yu)n)|Corinth?ians|\s*?Korinth?ian)|(?:1(?:\.\s*Korin[cć]|\s*Korin[cć])|I(?:\.\s*Korin[cć]|\s*Korin[cć]))anima|E(?:ls[oő]\s*Kor(?:inthus)?|erste\s*Kor)|1e\.\s*(?:Korinth?i[eë]r|Corinth?i[eë]r)|(?:First\s*Cort|(?:1st\.\s*Cort|(?:1st\s*Cort|(?:1\.?\s*Cort|I\.?\s*Cort))))h(?:ian)?|Yek(?:\s*Corinth(?:ian)?|Corinth(?:ian)?)|ପ୍ରଥମ\s*କରିନ୍ଥୀୟ|I(?:\.\s*(?:C(?:orint(?:h(?:i(?:aid|os)|e)|ios|o)|ô(?:-?rinh-?|rin)tô)|Korint(?:usi|he|io))|\s*(?:C(?:orint(?:h(?:i(?:aid|os)|e)|ios|o)|ô(?:-?rinh-?|rin)tô)|Korint(?:usi|he|io)))|(?:1\.|۱)-?کُرِنتھِیوں|(?:1\.?\s*Corinthian|I\.?\s*Corinthian)s|(?:1\.?\s*Коринћ|I\.?\s*Коринћ)анима|(?:1\.?\s*Коринтя|I\.?\s*Коринтя)ните|(?:1(?:\.\s*Корин[кќ]|\s*Корин[кќ])|I(?:\.\s*Корин[кќ]|\s*Корин[кќ]))аните|1-?е\.?\s*Коринтяни|اول\s*قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|كورنثوس\s*الأولى|1\.?\s*କରିନ୍ଥୀୟଙ୍କ|1\.?\s*Corinthian|I\.?\s*Corinthian|1(?:\.\s*Corinth?ier|(?:(?:\s*Corinthier|\.?\s*Korinto)|\s*Corintier))|I(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|(?:1(?:(?:(?:\.\s*Korinth?ië|\s*(?:Korinth?ië|Corintië))|\s*Corinthië)|\.\s*Corinth?ië)|I(?:\.\s*(?:Corinth?ië|Korinti[eë])|\s*(?:Corinth?ië|Korinti[eë])))r|I\.?\s*Korinthi[eë]r|1e\s*(?:Korinth?i[eë]r|Corinth?i[eë]r)|ਕੁਰਿੰਥੀਆਂ\s*ਨੂੰ|Α['ʹʹ΄’]\s*Κορινθ[ίι]ους|(?:1\.?\s*ک|۱\s*ک)رنتھِیُوں|(?:1\.?\s*ک|۱\s*ک)ُرنتھِیوں|1-?کُرِنتھِیوں|1\s*Qorint(?:h(?:iy?a|yu)n|(?:iy?a|yu)n)|(?:1\.?\s*Коринтј|I\.?\s*Коринтј)ани|(?:اول|1\s*)قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|یک(?:\s*قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان))|1\s*கொரிந்தியர்|(?:1\.?\s*Korinthu|I\.?\s*Korinthu)s|1st\.\s*Co(?:r(?:in(?:th?)?)?)?|(?:1\.?\s*Коринтя|I\.?\s*Коринтя)ни|اول\s*قرنتی[او]ن(?:ه|ی)?|1\.?\s*Korintusi|1e\.\s*[CK]orinthe|コリント(?:人への(?:第一の手紙|前の書|手紙[Ⅰ一])|の信徒への手紙一|\s*1|前書)|(?:Corinthios|Wakorintho)\s*I|۱\s*قرنت(?:ی[او]ن(?:ی?ان|ها|ن)|يان)|ﻛﻮﺭﻧﺜﻮﺱ\s*ﺍﻻﻭﻝ|1\.?\s*Korintus|I(?:\.\s*(?:C(?:o(?:r(?:in(?:t(?:io|h)?)?)?)?|ô(?:-?rinh)?)|Kor(?:int(?:us|a)?)?|Кор)|\s*(?:C(?:o(?:r(?:in(?:t(?:io|h)?)?)?)?|ô(?:-?rinh)?)|Kor(?:int(?:us|a)?)?|Кор))|1st\s*Co(?:r(?:in(?:th?)?)?)?|(?:اول|1\s*)قرنتی[او]ن(?:ه|ی)?|یک(?:\s*قرنتی[او]ن(?:ه|ی)?|قرنتی[او]ن(?:ه|ی)?)|1\.?\s*କରିନ୍ଥୀୟ|(?:1\.?\s*Kory|I\.?\s*Kory)nt[oó]w|1e\s*[CK]orinthe|(?:1\.?۔|۱۔)کرنتھیوں|Corinthia?ns|[1۱]قرنتی[او]ن(?:ی?ان|ها|ن)|Corinthian|۱\s*قرنتی[او]ن(?:ه|ی)?|[1۱]قرنتی[او]ن(?:ه|ی)?|AvvalCor|[1۱]قرنتيان|Ⅰ\s*コリント人へ|1e\.\s*Kor|(?:《?哥林多前[书書]|(?:《[格歌]|[格歌])林多前書)》|《?适凌爾福前》|1e\s*Kor|Α['ʹʹ΄’]\s*Κορ?|《?哥林多前[书書]|(?:《[格歌]|[格歌])林多前書|《?适凌爾福前|1قر(?:نت?)?|۱(?:قر(?:نت?)?|qrn?)|1qrnt|۱qrnt|고린도[1전]서|1qrn?|1Cor|اولق|《?林前》|《?林前|고전))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Gal"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ga-?la-?ti|(?:П(?:исмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Галатија|о(?:слання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*г|(?:апостола\s*Павла\s*)?до\s*г)алатів|слание\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Галатяни|\s*ап\.?\s*Павла\s*до\s*Галатяни)|к(?:ъм\s*галатяните|\s*Галатам))|\s*слання\s*до\s*Галатів)|осланица\s*Гала(?:ћан|т)има)|P(?:oslannja\s*apostola\s*Pavla\s*do\s*halativ|aulus(?:'\s*Brev\s*til\s*Galaterne|’\s*(?:Brev\s*til\s*G|brev\s*til\s*g)alaterne))|رسالة\s*بولس\s*الرسول\s*إلى\s*أهل\s*غلاطية|கலாத்தியர(?:ுக்கு\s*எழுதிய\s*(?:திருமுக|(?:நிருப|கடித))ம்|்)|گلت(?:یوں\s*کے\s*نام\s*(?:پولُس\s*رسول\s*)?|ِیوں\s*کے\s*نام\s*)کا\s*خط|Kalāttiyarukku\s*Eḻutiya\s*Nirupam|(?:P(?:avlova\s*poslanica\s*Gala[cć]anim|oslanica\s*Gala[cæć]anim)|Br(?:ef\s*P[aá]ls\s*til\s*Galatamann|éf\s*P[aá]ls\s*til\s*Galatamann)|gal(?:at[iī]har[uū]l[aā][iī]\s*patr|āt(?:īhar[uū]l[aā][iī]\s*patr|ihar[uū]l[aā][iī]\s*patr)|at(?:ikar[aā][mṃ]s|īkar[aā][mṃ]s)\s*patr)|Mga\s*Taga-?\s*Galasy|Gala(?:atiya|ci)|Galacanim|Galaćanim)a|L(?:ist\s*(?:[sś]w\.?\s*Pawła\s*do\s*Galacjan|do\s*Gala(?:cjan|t[oó]w))|ettera\s*ai\s*Galati)|אגרת\s*פולוס\s*השליח\s*אל-?הגלטים|Sulat\s*sa\s*mga\s*(?:taga\s*)?Galacia|g(?:al(?:atiyōṅ\s*ke\s*nām\s*kā\s*ḫaṭ|ātīāṃ\s*nū̃\s*pattrī)|halātī)|गलातीहरूलाई\s*पावलको\s*पत्र|الرسالة\s*إلى\s*أهل\s*غلاطية|(?:Layang\s*Paulus\s*Galat|Barua\s*kwa\s*Wagalat|Mga\s*Taga-?\s*Galac|Wagalat)ia|ଗାଲାତୀୟଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|पौलाचे\s*गलतीकरांस\s*पत्र|(?:Kirje\s*galatalaisill|Galat(?:alaisill|(?:asv|ern)))e|Brevet\s*til\s*Galaterne|Epistula\s*ad\s*Galatas|ਗਲਾਤੀਆਂ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|갈라(?:티아\s*신자들에게\s*보낸\s*서간|디아서)|(?:Mga\s*)?Taga-?Galacia|האיגרת\s*אל\s*הגלטים|गलातीहरूलाई\s*पत्र|Kalāttiyarukku|G(?:al(?:a(?:t(?:a(?:laiskirj|br[eé]fið|ns)|e(?:n(?:brief|i)|s)|i(?:yans|a(?:n?s|id)|na?s|on?s)|akhoz|ákhoz|ow)|s(?:yano|ia))|(?:aterbref?ve|á)t)|l)|(?:List\s*Gala(?:t(?:sk[yý]|ano)|ťano)|Gala(?:t(?:ano|sk[yý])|ťano))m|गलतीकरांस\s*पत्र|g(?:al(?:at[iī]har[uū]l[aā][iī]|āt(?:ī(?:har[uū]l[aā][iī]|āṃ)|ihar[uū]l[aā][iī])|at(?:ikar[aā][mṃ]s|īkar[aā][mṃ]s))|halāt?)|G(?:al(?:at(?:i(?:y[au]nia|[ao]a)|a[ao]|oa)n|at(?:i(?:a(?:n[ai]|in)|nan|on[an])|on|n)|at[ai]i(?:[ao])?n|lati(?:[ao])?n)|álata)s|Taga-?\s*Galacia|Προς\s*Γαλ[άα]τας|رسالة\s*غلاطية|गल(?:ात(?:ी(?:हरूलाई)?|ि)|तीकरांस)|ਗਲਾਤੀਆਂ\s*ਨੂੰ|[カガ]ラテヤ(?:の信徒への手紙|人への手紙|(?:人への)?書)|ଗାଲାତୀୟଙ୍କ|غل(?:اطی[او]ن(?:یان|ان|[نه])|طی(?:[او]ن(?:یان|ان|[نه])|ها)|اطیها)|(?:G(?:halati(?:y[au]|a)|ala(?:tiyo|sye))|ghalātiā)n|ad\s*Galatas|Галат(?:ян)?ите|До\s*галатів|Гала(?:ћан|т)има|G(?:a(?:l(?:a(?:t(?:i(?:y(?:un|a)|an?)?|as?|e[nr])?|si)?)?)?|á(?:l(?:at)?)?)|אל\s*הגלטים|К\s*Галатам|Галатјани|Гал(?:атяни)?|ก(?:าลาเทีย|ท)|Galacjan|गल(?:ातिय(?:ों|ा)|तियों)|غل(?:اطی[او]ن|اطیه|طی(?:[او]ن|ه)|ا(?:طی?)?)?|گلتِ?یوں|Galatów|Γαλ[άα]τες|Галатам|Галатів|[カガ]ラテヤ(?:人へ)?|(?:《加拉太[书書]|《?戛拉提亞|加拉太[书書])》|《?迦拉達書》|Gàlati|கலா(?:த்)?|《加拉太[书書]|《?戛拉提亞|《?迦拉達書|加拉太[书書]|ﻏﻼﻃﻲ|Γαλ?|《加》|갈라?|《加|加》|加))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eph"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:исмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Ефес|о(?:слання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*е|(?:апостола\s*Павла\s*)?до\s*е)фесян|слани(?:е\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Ефесяни|\s*ап\.?\s*Павла\s*до\s*Ефесяни)|к(?:ъм\s*ефесяните|\s*Ефесянам))|ца\s*Ефесцима)|\s*слан\s*ня\s*до\s*Єфесян))|L(?:ist\s*(?:[SŚ]wi[eę]tego\s*Pawła\s*Apostoła\s*do\s*Efez[oó]w|Ef(?:ezan[ouů]m|ezsk[yý]m|ézsk[yý]m))|ayang\s*Paulus\s*Efesus|ettera\s*agli\s*Efesini)|P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*efesjan|ica\s*Efe[zž]anima)|a(?:vlova\s*poslanica\s*Efe[zž]anima|ulus(?:'\s*Brev\s*til\s*Efeserne|’\s*(?:Brev\s*til\s*E|brev\s*til\s*e)feserne)))|ا(?:ف(?:سیوں\s*کے\s*نام\s*پو\s*لس\s*رسول\s*کا\s*خط|(?:سیوں\s*کے\s*نام\s*کا\s*خط|(?:ِس(?:سی[او]ن[نه]|ی[او]ن[نه])|س(?:سی[او]ن|یون|یان|و))))|ِف(?:ِسِیوں\s*کے\s*نام\s*کا\s*خط|سِ?یوں)|َفِسسی[او]نه)|رسالة\s*(?:بولس\s*الرسول\s*إلى\s*أهل\s*)?أفسس|எபேசியர(?:ுக்கு\s*எழுதிய\s*(?:திருமுக|(?:நிருப|கடித))ம்|்)|E(?:pēciyarukku\s*Eḻutiya\s*Nirupa|fezano)m|אגרת\s*פולוס\s*השליח\s*אל\s*האפסיים|א(?:גרת\s*פולוס\s*השליח\s*אל-?|ל\s*)האפסים|List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Efez|do\s*Efez)jan|(?:Br[eé]f\s*P[aá]ls\s*til\s*Efesusmann|epʰis[iī]har[uū]l[aā][iī]\s*patr|ipʰiskar[aā][mṃ]s\s*patr|Efisoon)a|एफिसीहरूलाई\s*पावलको\s*पत्र|ifisiyōṅ\s*ke\s*nām\s*kā\s*ḫaṭ|पौलाचे\s*इफिसकरांस\s*पत्र|(?:E(?:pistula\s*ad\s*Ephesio|(?:(?:p(?:hesion|esu)|fezi[eë]r)|fésio))|Afis(?:i(?:siya|yu)|siyu)nian|ad\s*Ephesio|E(?:(?:pehe|hp[ei])|sphe)sian|(?:Ep(?:(?:hesie|esia)|hésie)|Éph[eé]sie)n)s|الرسالة\s*إلى\s*أهل\s*أفسس|ଏଫିସୀୟଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|Sulat\s*sa\s*mga\s*E[fp]esi?o|(?:Kirje\s*efesolaisill|Efes(?:(?:olaiskirj|ian[eë]v|ern)|olaisill))e|af(?:asīāṃ\s*nū̃\s*pattrī|so)|(?:(?:Waraka\s*kwa\s*Wae|(?:(?:(?:Mga\s*)?Taga-?[EÉ]|Wae)|É))|Barua\s*kwa\s*Wae)feso|ਅਫ਼ਸੀਆਂ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|(?:Mga\s*)?Taga-?\s*E[fp]esi?o|ה(?:איגרת\s*אל\s*האפס|שליח\s*אל\s*האפסי)ים|एफिसीहरूलाई\s*पत्र|E(?:p(?:h(?:es(?:(?:zosziakhoz|i(?:a(?:n[ds]|id)|os)|er)|ains)|isians|sians)|esi?o)|f(?:(?:(?:(?:(?:(?:es(?:ierbrevet|erbrevet|usbr[eé]fið|os)|ése|s)|fesiaid)|èz)|ezusiakhoz)|ézusiakhoz)|esios))|에(?:페소(?:\s*신자들에게\s*보낸\s*서간|서)|베소서)|इफिसकरांस\s*पत्र|epʰis[iī]har[uū]l[aā][iī]|Προς\s*Εφεσ[ίι]ους|E(?:p(?:ēciyarukku|h(?:e(?:s(?:ian)?)?|esain|isian|sian|s)?)?|f(?:(?:e(?:s(?:us|e|o)?|z(?:us)?)?|is|f)?|esio)|hp)|ipʰiskar[aā][mṃ]s|एफिसी(?:हरूलाई)?|ਅਫ਼ਸੀਆਂ\s*ਨੂੰ|エ(?:フェソ(?:の信徒への手紙|人への手紙|書)|[ヘペ]ソ人への手紙|[ヘペ]ソ(?:人への)?書)|Afesisyani|Afis(?:is?ya|ya)ni|Mga\s*E[fp]esi?o|(?:Af(?:is(?:i(?:s(?:i(?:yu|a)|yu)|yyu|a)|siya)|es(?:i(?:syu|a)|siy[ou]))|Af(?:esi|is)yoo|Iafisiyo|afss?iyā|Efezye)n|(?:Afes(?:i(?:si|y)y|sisi)|Efezj)an|К\s*Ефесянам|ا(?:َفِسسیان|ف(?:ِس(?:سی[او]ن|ی[او]ن)|س(?:یوں)?))|Af(?:esisyan|iss?iyun)|इफिस(?:करांस|ि)|ଏଫିସୀୟଙ୍କ|Efezanima|Efežanima|Ефесяните|Ефешаните|До\s*ефесян|Ê(?:-?phê-?|phê)sô|Efezsk[yý]m|इफ(?:िस(?:ियों|ी)|़ेसॉस)|Εφεσ[ίι]ους|Ефесцима|Ефесянам|Эфесянам|Ефесјани|af(?:asīāṃ|s)|Еф(?:есяни?)?|Efesk[yý]m|Efes[ei]ni|เอเฟซัส|(?:《?以弗所[书書]|《?耶斐斯|《?弗)》|《?厄弗所書》|Efez[oó]w|Ephés?|Ép(?:h(?:[eé]s?)?)?|எபே(?:சி)?|エ(?:[ヘペ]ソ(?:人へ)?|フェソ)|《?以弗所[书書]|《?厄弗所書|《?耶斐斯|ﺃﻓﺴﺲ|Êph|᾿Εφ|Εφ|Эф|에페|《?弗|Єф|أف|อฟ|엡))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Col"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:исмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Колос|ослан(?:ня\s*(?:св\.?\s*апостола\s*Павла\s*до\s*колосян|(?:апостола\s*Павла\s*до\s*к|до\s*К)олосян)|и(?:е\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Колосяни|\s*ап\.?\s*Павла\s*до\s*Колосяни)|к(?:ъм\s*колосяните|\s*Колоссянам))|ца\s*Колошанима)))|P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*kolosjan|ica\s*Kolo[sš]anima)|avlova\s*poslanica\s*Kolo[sš]anima)|ک(?:ُل(?:ِسّیوں\s*کے\s*نام\s*پولُس\s*رسُول\s*کا\s*خط|ُسِّیوں\s*کے\s*نام\s*کا\s*خط|س[ِّ]یوں)|لسیوں\s*کے\s*نام\s*کا\s*خط|ولُسی[او]نیان|ول(?:ُسی[او]نا|سیا)ن|ول(?:ُسی(?:[او]ن[نه]|ها)|و)|ولُسسیان|لُسیان)|رسالة\s*بولس\s*الرسول\s*إلى\s*أهل\s*كولوسي|கொலோச(?:ையர(?:ுக்கு\s*எழுதிய\s*திருமுகம)?்|(?:ெயருக்கு\s*எழுதிய\s*(?:நிருப|கடித)ம|ெயர)்)|(?:Paulus(?:’\s*(?:Brev\s*til\s*Kolossen|brev\s*til\s*kolos)|'\s*Brev\s*til\s*Kolossen)sern|K(?:irje\s*kolossalaisill|olos(?:(?:s(?:alaiskirj|ern)|ian[eë]v)|salaisill)))e|(?:Kol(?:ōceyarukku\s*Eḻutiya\s*Nirupa|osan[ouů])|Kolos(?:sens|(?:ens)?)k[yý])m|אגרת\s*פולוס\s*השליח\s*אל-?הקולוסים|אגרת\s*פולוס\s*השליח\s*אל-?הקולוסי|B(?:r[eé]f\s*P[aá]ls\s*til\s*K[oó]lossumanna|arua\s*kwa\s*Wakolosai)|Br[eé]f\s*P[aá]ls\s*til\s*K[oó]lossumann|List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Kolos|do\s*Kolos)an|k(?:uluss(?:iyōṅ\s*ke\s*nām\s*kā\s*ḫaṭ|īāṃ\s*nū̃\s*pattrī)|ūl(?:ow|sī))|कलस्सीहरूलाई\s*पावलको\s*पत्र|Sulat\s*sa\s*mga\s*[CK]olon?sense|Epistula\s*ad\s*Colossenses|पौलाचे\s*कलस्सैकरांस\s*पत्र|الرسالة\s*إلى\s*أهل\s*كولوسي|L(?:ayang\s*Paulus\s*Kolos[eé]|ist\s*Kolos(?:an[ouů]m|k[yý]m))|(?:Lettera\s*ai\s*)?Colossesi|Waraka\s*kwa\s*Wakolosai|(?:kalass(?:aikar[aā][mṃ]s\s*patr|[iī]har[uū]l[aā][iī]\s*patr)|Qolasiyaas)a|ਕੁਲੁੱਸੀਆਂ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|କଲସୀୟଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|האיגרת\s*אל\s*הקולוסים|K(?:ol(?:(?:(?:os(?:s(?:e(?:nser(?:brevet|ne)|rbrevet)|z(?:e(?:beliekhez|ieknek)|ébeliekhez)|[eé]iakhoz)|a[sy]|é)|usians)|ossubr[eé]fið)|ussubr[eé]fið)|ól[ou]ssubr[eé]fið)|(?:Mga\s*Taga(?:-?(?:\s*[CK]olosa|Colosa)|\s*[CK]olosa)|Kol(?:us(?:iy[au]ni|y)an|ò)|Taga(?:-?\s*?C|\s*C)olosa|C(?:olossiy|allossi)an|C(?:olos(?:s(?:i[eo]|a)|io)|(?:olass?|oll[ao]s)i[ao]|al(?:(?:[ao]s|[ao])si[ao]|l(?:asi[ao]|osi[ao])))n|Colos(?:ian|a))s|कलस्सीहरूलाई\s*पत्र|कलस्सैकरांस\s*पत्र|콜로새(?:\s*신자들에게\s*보낸\s*서간|서)|Προς\s*Κολ(?:ασσαεις|οσσαε[ίι]ς)|k(?:alass(?:aikar[aā][mṃ]s|[iī]har[uū]l[aā][iī])|ulussīāṃ|ūl)|Mga\s*[CK]olon?sense|ad\s*Colossenses|K(?:o(?:l(?:ōceyarukku|os(?:s(?:e(?:nsern|r)?|é)|ian|an|e)?|usi(?:yu|a)n)?)?|ól)|ਕੁਲੁੱਸੀਆਂ\s*ਨੂੰ|क(?:लस्स(?:ी(?:हरूलाई)?|ैकरांस)|ुलुस्सि|ोलो)|К\s*Колоссянам|رسالة\s*كولوسي|क(?:ुलुस्(?:सियों|‍सी)|ोलोस्सॉय|लसैकरांस)|コロサイ(?:の信徒への手紙|人への手紙|(?:人への)?書)|(?:Colossenze|K(?:olos(?:(?:senz|y)e|iyu)|ulussaiyo)|kūlsiā)n|Coloss?enses|אל\s*הקולוסים|До\s*колоссян|C(?:(?:olos(?:siaid|iaid|eni)|ôlôxê|l)|olossians)|Kolosens[oó]w|Kolosanima|Kološanima|Κολοσσαε[ίι]ς|Колошанима|Колоссянам|Коло(?:ся|ша)ните|C(?:olossian|(?:o(?:l(?:oss?)?)?|ôl))|ک(?:ُلِسّیوں|ول(?:ُسی(?:[او]ن|ه)|سی)?|لسیوں)|Wakolosai|Колосјани|Кол(?:ос(?:яни?|сян))?|କଲସୀୟଙ୍କ|Cô-?lô-?se|コロサイ(?:人へ)?|《?哥羅森書》|《?歌(?:罗西书|羅西書)》|โคโลสี|ﻛﻮﻟﻮﺳﻲ|《?哥羅森書|《?歌(?:罗西书|羅西書)|(?:《?适羅斯|《?西)》|கொலோ|《?适羅斯|골로새서|Qol|Κολ|قول|콜로|《?西|Κλ|كو|คส|골))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2\.?\s*Ti-?mô-?thê|(?:2-?(?:ге|а)\.\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|Тимо(?:те[ий]|фі[юя]))|Друг(?:а\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|(?:(?:посланица\s*Тимотеју|Тимоте(?:ју|[ий]))|Тимофі[юя]))|е\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|Тимо(?:те[ий]|фі[юя])))|2-?е\.?\s*послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|2-?(?:ге|а)\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|Тимо(?:те[ий]|фі[юя]))|Второ\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Тимот|\s*ап\.?\s*Павла\s*до\s*Тимот)ея|(?:II\.?\s*по|2\.?\s*по)слання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|(?:Dru(?:he\s*poslannja\s*apostola\s*Pavla\s*do\s*Tymofij|g(?:a\s*(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tymoteusz|do\s*Tymoteusz)|T(?:imoteju\s*Poslanic|ymoteusz))|i\s*(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tymoteusz|do\s*Tymoteusz)|Tymoteusz)))|(?:II\.?\s*L|2\.?\s*L)ist\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tymoteusz|do\s*Tymoteusz)|Naa77antto\s*Ximootiyoos|(?:II\.?\s*Timoteju|2\.?\s*Timoteju)\s*Poslanic|(?:II\.?\s*Ty|2\.\s*Ty)moteusz|2\s*Tymoteusz)a|த(?:ிம[ொோ]த்தேயுவுக்கு\s*எழுதிய\s*இரண்டாம்\s*திருமுகம்|ீமோத்தேயுவுக்கு\s*எழுதிய\s*இரண்டா(?:வது\s*நிருப|ம்\s*கடித)ம்)|(?:Tīmōttēyuvukku\s*Eḻutiya\s*Iraṇṭāvatu\s*Nirupa|II\.?\s*Tí|2(?:\.\s*Tí|\s*(?:Tí|Xi)))m|ت(?:یِمُتھِیُس\s*کے\s*نام\s*پولس\s*رسول\s*کا\s*دوسرا\s*خط|ِیمُتھِیُس\s*کے\s*نام\s*کا\s*دوسرا\s*خط|یمتھیس\s*کے\s*نام\s*کا\s*دوسرا\s*خط|يموثاوس\s*الثانية)|Втор(?:а\s*(?:писмо\s*од\s*апостол\s*Павле\s*до\s*Тимотеј|Тимоте[ийј])|о\s*(?:писмо\s*од\s*апостол\s*Павле\s*до\s*Тимотеј|Тимоте[ийј]))|رسالة\s*بولس\s*الرسول\s*الثانية\s*إلى\s*تيموثاوس|(?:II\.?\s*пи|2\.?\s*пи)смо\s*од\s*апостол\s*Павле\s*до\s*Тимотеј|Pavlova\s*druga\s*poslanica\s*Timoteju|Paulus['’]\s*Andet\s*Brev\s*til\s*Timotheus|S(?:[ií]ðara\s*(?:br[eé]f\s*P[aá]ls\s*til\s*T[ií]m[oó]teusar|T[ií]m[oó]teusarbr[eé]f)|econd\s*T(?:himothy|imoth?y|himoty|omothy|m))|Paulus’\s*andre\s*brev\s*til\s*Timoteus|t(?:īm(?:utʰiyus\s*ke\s*nām\s*kā\s*dūsrā\s*ḫaṭ|atʰtʰ[aā]l[aā]\s*dusre\s*patra)|imotʰius\s*nū̃\s*dūjī\s*pattrī|imotʰ(?:il[aā][iī]\s*dostro|īl[aā][iī]\s*dostro)\s*patra|imatʰtʰ[aā]l[aā]\s*dusre\s*patra)|אגרת\s*פולוס\s*השנייה\s*אל-?טימותיוס|الرسالة\s*الثانية\s*إلى\s*تيموثاوس|तिमोथीलाई\s*(?:पावलको\s*दोस|दोस्त)्रो\s*पत्र|אגרת\s*פולוס\s*השנייה\s*אל-?טימותי|Waraka\s*wa\s*Pili\s*kwa\s*Timotheo|पौलाचे\s*तीमथ्थाला\s*दुसरे\s*पत्र|ତୀମଥିଙ୍କ\s*ପ୍ରତି\s*ଦ୍ୱିତୀୟ\s*ପତ୍ର|T(?:oinen\s*(?:Kirje\s*Timoteuksell|Timoteu(?:skirj|ksell))e|imoteyos\s*Labaad)|(?:Второ\s*послание\s*към\s*Тимот|2-?е\.?\s*Тимот)е[ий]|Barua\s*ya\s*Pili\s*kwa\s*Timotheo|S(?:[ií]ðara\s*br[eé]f\s*P[aá]ls\s*til\s*T[ií]m[oó]|econd\s*Ti(?:m(?:oth)?)?)|(?:Se(?:cond(?:(?:a\s*lettera\s*a|o)|a)\s*Timot|gund[ao]\s*Tim[oó]t)|(?:(?:I(?:kalawang\s*Ka|I\.?\s*Ka)y|2(?:\.\s*Ka(?:ng|y)|\s*Ka(?:ng|y)|(?:\.[oº]|[°º])\.))\s*|(?:Ikalawang\s*|2(?:\.[oº]|[°º])\s*))Timot|2[ao]\.\s*Tim[oó]t|2[ao]\s*Tim[oó]t)eo|ה(?:איגרת\s*השנייה\s*אל\s*טימותי|שנייה\s*אל\s*טימותיא?)וס|Druga\s*poslanica\s*Timoteju|Epistula\s*(?:II\s*ad\s*Timotheum|ad\s*Timotheum\s*II)|ਤਿਮੋਥਿਉਸ\s*ਨੂੰ\s*ਦੂਜੀ\s*ਪੱਤ੍ਰੀ|(?:II\.?\s*Ki|2\.?\s*Ki)rje\s*Timoteukselle|D(?:ruh(?:(?:[aá]\s*kniha|[aá])\s*Timotejovi|(?:[aá]\s*kniha|[aá])\s*Timoteovi|[aá]\s*list\s*Tim(?:otej?|etej)ovi|[yý]\s*(?:list\s*Tim(?:otej?|etej)ovi|T(?:imotejovi|(?:imoteovi|m)))|[aá]\s*Tm)|ovomTimot(?:eos|hy))|(?:II\.?\s*по|2\.?\s*по)сланица\s*Тимотеју|And(?:r(?:a\s*Timot(?:heo|eu)sbrevet|e\s*Timoteusbrev)|(?:e[nt]\s*Timotheusb|en\s*Timoteusb)rev)|तीमथ्थाला\s*दुसरे\s*पत्र|(?:II\.?\s*l|2\.?\s*l)ist\s*Tim(?:otej?|etej)ovi|M[aá]sodik\s*Tim[oó]t(?:eus(?:nak|hoz)|heosz)|2\.?\s*Timotheosbrevet|(?:De(?:uxi[eè]me(?:s\s*Timoth[eé]|\s*Timoth[eé])|zy[eè]m\s*Timot)|(?:II\.?\s*Timoteusk|2\.?\s*Timoteusk)irj|2(?:(?:eme|de?)|ème)\.\s*Timoth[eé]|2(?:(?:eme|de?)|ème)\s*Timoth[eé]|2(?:e\.?\s*Timothé|\.?\s*Timothé)|II\.?\s*Timothé)e|2(?:\.\s*Timoteusbreve|\s*(?:Timoteusbreve|[ei]\.?\s*Timoteu))t|(?:II\.?\s*Timoteuk|2\.?\s*Timoteuk)selle|Zweite(?:[nrs])?\s*Timotheus|M[aá]sodik\s*Tim(?:[oó]teus)?|2\s*Tīmōttēyuvukku|2\.?\s*Timotheusbrev|(?:dovvom\s*tīmutā['’]ū|Tweede\s*Timot(?:he[uü]|e[uü])|D(?:o(?:vomTimot(?:haio|eo?u|hao|ai?o)|Timot(?:hao|e[ou]))|ruh(?:[aá]|[yý])\s*Timoteu)|2(?:e(?:\.\s*Timothe[uü]|\s*Timothe[uü])|\.\s*Timoth?eü|\s*(?:timotʰiu|Timoth?eü))|II(?:\.\s*Timoth?eü|\s*Timoth?eü)|(?:II\.?\s*Timotey|2\.?\s*Timotey)o|2e\.?\s*Timote[uü]|2Timot(?:haio|eo?u|hao|ai?o))s|(?:2(?:\.\s*T(?:eemuathaiy|imoti)|\s*T(?:eemuathaiy|imoti))|Do(?:vomTimotha?e|Timotha?e)|II\.?\s*Timoti|2Timotha?e)us|Προς\s*Τιμ(?:οθεον\s*Β['ʹʹ΄’]|όθεον\s*Β['ʹʹ΄’])|ଦ୍ୱିତୀୟ\s*ତୀମଥିଙ୍କ|ﺍﻟﺜﺎﻧﻴﺔ\s*ﺗﻴﻤﻮﺛﺎﻭﺱ|2(?:(?:\.\s*(?:Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:eo)?))?)?|त(?:िमोथी|ीम)|Тим)|\s*(?:(?:(?:Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:eo)?))?)?|(?:த(?:ீமோத்|ிமொ)|Tym|तीम))|Тим)|तिमोथी)|e\.?\s*Tim)|\.?\s*Timoteo)|Προς\s*Τιμοθεον\s*Β|2\s*k\.?\s*Timotejovi|(?:II\.?\s*Timoteusn|2\.?\s*Timoteusn)ak|(?:II\.?\s*Timóteu|2\.?\s*Timóteu)snak|(?:(?:II\.?\s*Timoteush|2\.?\s*Timoteush)o|(?:II\.?\s*Timóteu|2\.?\s*Timóteu)sho|II\.?\s*Timotheos)z|티모테오(?:에게\s*보낸\s*둘째\s*서간|2서)|ad\s*Timotheum\s*II|(?:دو(?:م(?:(?:\s*تیِمُتھِیُ|\s*تِیمُتھِیُ|-?تِیمُتھِیُ|(?:\s*تیمِتھُ|۔تیمتھ)ی)|تیموت(?:ئاؤ|ی[ؤو]))|تیموت(?:ئاؤ|ی[ؤو]))|(?:2\.?|۲)\s*تیِمُتھِیُ|(?:2\.?|۲)\s*تِیمُتھِیُ|(?:2\.|۲)-?تِیمُتھِیُ|2-?تِیمُتھِیُ|(?:(?:(?:2\.\s*تیمِتھُ|(?:2\.?۔|۲۔)تیمتھ)|2\s*تیمِتھُ)|۲\s*تیمِتھُ)ی|[2۲]تیموت(?:ئاؤ|ی[ؤو]))س|D(?:ru(?:ga\s*Timoteju|h(?:[aá]|[yý])\s*Tim)|ovomTim(?:oteo)?)|And(?:en\s*Tim(?:oteus)?|re\s*Tim(?:oteus)?)|2(?:\s*(?:(?:(?:(?:(?:(?:(?:(?:ਤਿਮੋਥਿਉਸ\s*ਨੂੰ|t(?:imatʰtʰ[aā]l[aā]|īmatʰtʰ[aā]l[aā])|த(?:ிமொ|ீமோ)த்தேயு|तीमथ्थाला|طيم|Tm|ทธ)|Timot(?:h(?:e(?:osz|um|e)|y)|e(?:ut|i)|y))|तीमुाथैयुस)|तीमुथियुस)|तिम(?:ोथ(?:ीलाई|ियॉस)|ुथियुस))|timotʰil[aā][iī])|timotʰīl[aā][iī])|ทิโมธี)|\.\s*(?:T(?:imot(?:h(?:e(?:osz|um|e)|y)|e(?:ut|i)|y)|m)|त(?:ीमु(?:ाथै|थि)युस|िम(?:ोथ(?:ीलाई|ियॉस)|ुथियुस))|timotʰ[iī]l[aā][iī]|ทิโมธี)|e\.?\s*Timothee|티모)|(?:II\.?\s*Timotejo|2\s*k\.?\s*Timoteo|2\.?\s*Timotejo)vi|(?:II\.?\s*Timóth|2\.?\s*Timóth)eosz|2(?:-?(?:е\.?\s*к\s*Тимофе|я(?:\.\s*(?:к\s*Тимоф|Тим(?:ет|оф))е|\s*(?:к\s*Тимоф|Тим(?:ет|оф))е)|е\.?\s*Тимофе|е\.?\s*Тимете)|[ея](?:\.\s*(?:к\s*Тимоф|Тим(?:ет|оф))е|\s*(?:к\s*Тимоф|Тим(?:ет|оф))е)|(?:\.?\s*к\s*Тимоф|(?:\.?\s*Тимоф|\.?\s*Тимет))е)ю|II(?:\.\s*(?:T(?:i(?:m(?:(?:ot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|óteo)|ôthê)|-?mô-?thê)|m)|Тимоте(?:ју|[ий]))|\s*(?:T(?:i(?:m(?:(?:ot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|óteo)|ôthê)|-?mô-?thê)|m)|Тимоте(?:ју|[ий])))|(?:II\.?\s*Timoteov|2\.?\s*Timoteov)i|2nd\.?\s*T(?:himothy|imoth?y|himoty|omothy|m)|دو(?:متیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه))|Pili\s*Timotheo|(?:دو(?:م(?:\s*تیموتا|تیموتی)|تیموتی)ئ|(?:[2۲]\s*تیموتا|[2۲]تیموتی)ئ)وس|II(?:\.\s*(?:Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|Тим(?:отеј)?)|\s*(?:Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|Тим(?:отеј)?))|II\.?\s*Timoteju|2\.?\s*Timotheus|دو(?:متی(?:موت(?:ا(?:ئو|ؤ)س|ئوس))?|تیموت(?:ا(?:ئو|ؤ)س|ئوس))|(?:II\.?\s*Timóteu|2\.?\s*Timóteu)s|(?:II\.?\s*Th|2\.?\s*Th)imothy|2(?:-?е\.?\s*Тимофі|\.?\s*Тимофі)[юя]|Timotheum\s*II|2\.?\s*Timoteju|2nd\.?\s*Ti(?:m(?:oth)?)?|2\.?\s*Тимоте(?:ју|[ий])|(?:II\.?\s*Th|2\.?\s*Th)imoty|(?:II\.?\s*To|2\.?\s*To)mothy|[2۲]تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|II\.?\s*Тимофі[юя]|Timotheo\s*II|2\.?\s*ତୀମଥିଙ୍କ|2\.?\s*Тимотеј|Tweede\s*Tim|[2۲]تیموت(?:ا(?:ئو|ؤ)س|ئوس)|2\.?\s*Timóteo|2\.?\s*Timôthê|Β['ʹʹ΄’]\s*Τιμ[οό]θεο|テモテ(?:ヘの第二の手紙|への(?:後の書|手紙[Ⅱ二])|\s*2|後書)|Втор[ао]\s*Тим|Друга\s*Тим|2Timot(?:eos|hy)|2Tim(?:oteo)?|Pili\s*Tim|dovvomtī|(?:《提(?:摩(?:太后书|斐後)|[后後])|提(?:摩(?:太后书|斐後)|[后後]))》|《?提摩太後書》|《?弟茂德後書》|Β['ʹʹ΄’]\s*Τιμ?|《提(?:摩(?:太后书|斐後)|[后後])|《?提摩太後書|《?弟茂德後書|Ⅱ\s*テモテへ|提(?:摩(?:太后书|斐後)|[后後])|2tīmt|2تیمت|۲(?:tīmt|تیمت)|디모데[2후]서|2tīm?|2تیم?|۲(?:tīm?|تیم?)|2テモテ|二テモテ|딤후))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1\.?\s*Ti-?mô-?thê|(?:1-?(?:ше|а)\.\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|Тимо(?:те[ий]|фі[юя]))|П(?:ерш[ае]\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|Тимо(?:те[ий]|фі[юя]))|ърво\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Тимот|\s*ап\.?\s*Павла\s*до\s*Тимот)ея|рв(?:а\s*(?:писмо\s*од\s*апостол\s*Павле\s*до\s*Тимотеј|(?:посланица\s*)?Тимотеју)|о\s*(?:писмо\s*од\s*апостол\s*Павле\s*до\s*)?Тимотеј)|ърв(?:о\s*(?:послание\s*към\s*)?Тимот|а\s*Тимот)е[ий])|1-?е\.?\s*послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|1-?(?:ше|а)\s*(?:послання\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|Тимо(?:те[ий]|фі[юя]))|(?:P(?:er[sš]e\s*poslannja\s*apostola\s*Pavla\s*do\s*Tymofij|ierwsz[aey]\s*(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tymoteusz|do\s*Tymoteusz)|Tymoteusz)|rva\s*Timoteju\s*Poslanic)|(?:1\.?\s*L|I\.?\s*L)ist\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tymoteusz|do\s*Tymoteusz)|(?:1\.?\s*Timotej|I\.?\s*Timotej)u\s*Poslanic|Koiro\s*Ximootiyoos|(?:1\.?\s*Ty|I\.?\s*Ty)moteusz)a|(?:Tīmōttēyuvukku\s*Eḻutiya\s*Mutalāvatu\s*Nirupa|1(?:\.\s*Tí|\s*(?:Tí|Xi))|I\.?\s*Tí)m|(?:1\.?\s*посланн|I\.?\s*посланн)я\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тимофія|апостола\s*Павла\s*до\s*Тимофія|до\s*Тимотея|до\s*Тимофія|Тимофію)|ت(?:ِیمُتھِیُس\s*کے\s*نام\s*(?:پولُس\s*رسول\s*)?کا\s*پہلا\s*خط|یمتھیس\s*کے\s*نام\s*کا\s*پہلا\s*خط|يموثاوس\s*الأولى)|த(?:ீமோத்தேயுவுக்கு\s*எழுதிய\s*முதலா(?:வது\s*நிருப|ம்\s*கடித)ம்|ிம[ொோ]த்தேயுவுக்கு\s*எழுதிய\s*முதல்\s*திருமுகம்)|رسالة\s*بولس\s*الرسول\s*الأولى\s*إلى\s*تيموثاوس|(?:1\.?\s*пи|I\.?\s*пи)смо\s*од\s*апостол\s*Павле\s*до\s*Тимотеј|(?:Paulus(?:(?:'\s*Første|'\s*1\.?)\s*Brev\s*til\s*Timothe|’\s*(?:Første\s*Brev\s*til\s*Timoth|(?:(?:første\s*brev\s*til\s*Timot|1\s*Brev\s*til\s*Timoth)|1\.\s*Brev\s*til\s*Timoth))e)|1(?:\.\s*T(?:eemuathaiy|imoti)|\s*T(?:eemuathaiy|imoti))|Erste[nrs]\s*Timothe|AvvalTimotha?e|Erste\s*Timothe|I\.?\s*Timoti|1Timotha?e)us|(?:Ensimm[aä]inen\s*(?:Kirje\s*Timoteuksell|Timoteu(?:skirj|ksell))|(?:1\.?\s*Ki|I\.?\s*Ki)rje\s*Timoteuksell|(?:1\.?\s*Timoteusk|I\.?\s*Timoteusk)irj|(?:1\.?\s*Timoteuk|I\.?\s*Timoteuk)sell|1\.?\s*Timothé|I\.?\s*Timothé)e|P(?:avlova\s*prva\s*poslanica\s*Timoteju|r(?:va\s*poslanica\s*Timoteju|(?:v(?:n[ií]\s*list\s*Timotej?ovi|[aá]\s*kniha\s*Timotej?ovi|n[ií]\s*(?:list\s*Timete|Timotej)ovi|[yý]\s*(?:list\s*Timotej?ovi|Timotej?ovi)|(?:n[ií]\s*Timoteo|a\s*Timotej?o)vi|á\s*Timotej?ovi|n[ií]\s*Tm)|em(?:i(?:er(?:e(?:s\s*Timoth[eé]e|\s*Timoth[eé]e)|(?:s\s*Timoth[eé]e|\s*Timoth[eé]e))|ère(?:s\s*Timoth[eé]e|\s*Timoth[eé]e))|ye\s*Timote))))|F(?:yrra\s*(?:br[eé]f\s*P[aá]ls\s*til\s*T[ií]m[oó]teusar|T[ií]m[oó]teusarbr[eé]f)|[oö]rsta\s*Timot(?:heo|eu)sbrevet|ørste\s*Timoth?eusbrev|irst\s*T(?:himothy|imoth?y|himoty|omothy|m))|t(?:īm(?:utʰiyus\s*ke\s*nām\s*kā\s*pahlā\s*ḫaṭ|atʰtʰ[aā]l[aā]\s*pahile\s*patra)|imotʰius\s*nū̃\s*pahilī\s*pattrī|imatʰtʰ[aā]l[aā]\s*pahile\s*patra|imotʰ(?:il[aā][iī]\s*pahilo|īl[aā][iī]\s*pahilo)\s*patra)|אגרת\s*פולוס\s*הראשונה\s*אל-?טימותיוס|Waraka\s*wa\s*Kwanza\s*kwa\s*Timotheo|तिमोथीलाई(?:र्\s*पावलको)?\s*पहिलो\s*पत्र|Barua\s*ya\s*Kwanza\s*kwa\s*Timotheo|אגרת\s*פולוס\s*הראשונה\s*אל-?טימות|الرسالة\s*الأولى\s*إلى\s*تيموثاوس|पौलाचे\s*तीमथ्याला\s*पहिले\s*पत्र|ה(?:איגרת\s*הראשונה\s*אל\s*טימותי|ראשונה\s*אל\s*טימותיא)וס|F(?:yrra\s*br[eé]f\s*P[aá]ls\s*til\s*T[ií]m[oó]t|ørste\s*Tim(?:oteus)?|irst\s*Ti(?:m(?:oth)?)?)|ਤਿਮੋਥਿਉਸ\s*ਨੂੰ\s*ਪਹਿਲੀ\s*ਪੱਤ੍ਰੀ|ତୀମଥିଙ୍କ\s*ପ୍ରତି\s*ପ୍ରଥମ\s*ପତ୍ର|E(?:pistula\s*I\s*ad\s*Timotheum|ls[oő]\s*Tim[oó]t(?:eus(?:nak|hoz)|heosz))|Epistula\s*ad\s*Timotheum\s*I|(?:(?:(?:(?:Prim(?:a\s*lettera\s*a|ero|o)|1(?:\.\s*Ka(?:ng|y)|\s*Ka(?:ng|y)|(?:\.[oº]|[°º])\.))\s*Timo|(?:(?:(?:Primeir[ao]\s*Tim[oó]|1[ao]\.\s*Tim[oó]|1[ao]\s*Tim[oó])|Prima\s*Timo)|(?:Primer\s*|1(?:\.[oº]|[°º])\s*)Timo))|I\.?\s*Kay\s*Timo)t|Una(?:ng\s*(?:Kay\s*)?Timot|\s*(?:Kay\s*)?Timot))eo|(?:1\.?\s*послани|I\.?\s*послани)ца\s*Тимотеју|तीमथ्थाला\s*पहिले\s*पत्र|הראשונה\s*אל\s*טימותיוס|1\.?\s*Timotheosbrevet|(?:1\.?\s*l|I\.?\s*l)ist\s*Timotej?ovi|1(?:\.\s*Timoteusbreve|\s*(?:Timoteusbreve|[ei]\.?\s*Timoteu))t|(?:1\.?\s*l|I\.?\s*l)ist\s*Timeteovi|Timot(?:eyos\s*Kowaad|hy)|1\.?\s*Timotheusbrev|1\s*Tīmōttēyuvukku|(?:Eerste\s*Timot(?:he[uü]|e[uü])|AvvalTimot(?:haio|eo?u|hao|ai?o)|avval\s*tīmutā['’]ū|Prvn[ií]\s*Timoteu|1e\.\s*Timot(?:he[uü]|e[uü])|1(?:\.\s*Timoth?eü|\s*(?:timotʰiu|Timoth?eü))|I(?:\.\s*Timoth?eü|\s*Timoth?eü)|(?:1\.?\s*Timotey|I\.?\s*Timotey)o|1e\s*Timot(?:he[uü]|e[uü])|1Timot(?:haio|eo?u|hao|ai?o))s|Προς\s*Τιμ(?:οθεον\s*Α['ʹʹ΄’]|όθεον\s*Α['ʹʹ΄’])|(?:اوّل(?:\s*تِیمُتھِیُ|-?تِیمُتھِیُ|(?:\s*تیمِتھُ|۔تیمتھ)ی)|(?:1\.|[1۱])\s*تِیمُتھِیُ|(?:1\.|۱)-?تِیمُتھِیُ|1-?تِیمُتھِیُ|(?:1\.\s*تیمِتھُ|(?:[1۱]\s*تیمِتھُ|(?:1\.?۔|۱۔)تیمتھ))ی|اولتیموت(?:ئاؤ|ی[ؤو])|یکتیموت(?:ئاؤ|ی[ؤو])|[1۱]تیموت(?:ئاؤ|ی[ؤو]))س|1(?:(?:\.\s*(?:Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:eo)?))?)?|त(?:िमो(?:थी)?|ीम)|Тим)|\s*(?:(?:(?:Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:eo)?))?)?|(?:த(?:ீமோத்|ிமொ)|तीम))|Тим)|तिमो(?:थी)?))|\.?\s*Timoteo)|Προς\s*Τιμοθεον\s*Α|1\s*k\.\s*Timotej?ovi|티모테오(?:에게\s*보낸\s*첫째\s*서간|1서)|Kwanza\s*Timotheo|1(?:\s*(?:(?:(?:(?:(?:(?:(?:(?:ਤਿਮੋਥਿਉਸ\s*ਨੂੰ|t(?:imatʰtʰ[aā]l[aā]|īmatʰtʰ[aā]l[aā])|த(?:ிமொ|ீமோ)த்தேயு|तीमथ्[थय]ाला|طيم|Tm|ทธ)|Timot(?:h(?:e(?:osz|um|e)|y)|e(?:ut|i)|y))|तीमुाथैयुस)|तीमुथियुस)|तिम(?:ोथ(?:ीलाई|ियॉस)|ुथियुस))|timotʰil[aā][iī])|timotʰīl[aā][iī])|ทิโมธี)|\.\s*(?:T(?:imot(?:h(?:e(?:osz|um|e)|y)|e(?:ut|i)|y)|m)|त(?:ीमु(?:ाथै|थि)युस|िम(?:ोथ(?:ीलाई|ियॉस)|ुथियुस))|timotʰ[iī]l[aā][iī]|ทิโมธี)|티모)|(?:1\.?\s*Timoteusn|I\.?\s*Timoteusn)ak|(?:1\.?\s*Timóteu|I\.?\s*Timóteu)snak|(?:(?:1\.?\s*Timoteush|I\.?\s*Timoteush)o|(?:1\.?\s*Timóteu|I\.?\s*Timóteu)sho|I\.?\s*Timotheos)z|(?:AvvalstTi|1\.?\s*To|I\.?\s*To|1stTi)mothy|1\s*k\s*Timotej?ovi|1(?:(?:ere?|re)|ère)\.\s*Timoth[eé]e|ad\s*Timotheum\s*I|1(?:-?(?:е\.?\s*к\s*Тимофе|я(?:\.\s*(?:к\s*Тимоф|Тим(?:ет|оф))е|\s*(?:к\s*Тимоф|Тим(?:ет|оф))е)|е\.?\s*Тимофе|е\.?\s*Тимете)|[ея](?:\.\s*(?:к\s*Тимоф|Тим(?:ет|оф))е|\s*(?:к\s*Тимоф|Тим(?:ет|оф))е)|(?:\.?\s*к\s*Тимоф|(?:\.?\s*Тимоф|\.?\s*Тимет))е)ю|ପ୍ରଥମ\s*ତୀମଥିଙ୍କ|E(?:ls[oő]\s*Tim(?:[oó]teus)?|erste\s*Tim)|P(?:rv(?:a\s*Timoteju|n[ií]\s*Tim)|ierwsz[aey]\s*Tym)|AvvalTimot(?:eos|hy)|(?:1\.?\s*Timóth|I\.?\s*Timóth)eosz|1st\.\s*T(?:himothy|imoth?y|himoty|omothy|m)|(?:1\.?\s*Timotej|I\.?\s*Timotej)ovi|1(?:(?:ere?|re)|ère)\s*Timoth[eé]e|YekTimot(?:h(?:a?eu|ao)s|e[ou]s)|اولتیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|ﺍﻻﻭﻝ\s*ﺗﻴﻤﻮﺛﺎﻭﺱ|(?:(?:(?:(?:اول|[1۱])\s*تیموتا|[1۱]تیموتی)|اولتیموتی)|یکتیموتی)ئوس|AvvalTim(?:oteo)?|1\.?\s*Timotheus|П(?:рва\s*Тим(?:отеј)?|ърв[ао]\s*Тим)|اولتیموت(?:ا(?:ئو|ؤ)س|ئوس)|I(?:\.\s*(?:T(?:i(?:m(?:(?:ot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|óteo)|ôthê)|-?mô-?thê)|m)|Тимоте[ий])|\s*(?:T(?:i(?:m(?:(?:ot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|óteo)|ôthê)|-?mô-?thê)|m)|Тимоте[ий]))|1st\s*T(?:himothy|imoth?y|himoty|omothy|m)|(?:1\.?\s*Timoteov|I\.?\s*Timoteov)i|1-?е\.?\s*Тимоте[ий]|1(?:-?е\.?\s*Тимофі|\.?\s*Тимофі)[юя]|یکتیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|I(?:\.\s*(?:Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|Тим)|\s*(?:Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|Тим))|(?:1\.?\s*Timóteu|I\.?\s*Timóteu)s|1st\.\s*Ti(?:m(?:oth)?)?|(?:1\.?\s*Timotej|I\.?\s*Timotej)u|یکتیموت(?:ا(?:ئو|ؤ)س|ئوس)|(?:1\.?\s*Th|I\.?\s*Th)imothy|Timotheum\s*I|(?:1\.?\s*Тимотеј|I\.?\s*Тимотеј)у|[1۱]تیموت(?:ا(?:ئ(?:وس[هی]|س)|ؤسی)|ئوسه)|1\.?\s*ତୀମଥିଙ୍କ|1st\s*Ti(?:m(?:oth)?)?|Kwanza\s*Tim|1\.?\s*Тимотеј|I\.?\s*Тимотеј|[1۱]تیموت(?:ا(?:ئو|ؤ)س|ئوس)|1\.?\s*Timóteo|1\.?\s*Timôthê|1\.?\s*Тимоте[ий]|(?:1\.?\s*Th|I\.?\s*Th)imoty|Timotheo\s*I|Α['ʹʹ΄’]\s*Τιμ[οό]θεο|テモテ(?:ヘの第一の手紙|への(?:前の書|手紙[Ⅰ一])|\s*1|前書)|I\.?\s*Тимофі[юя]|1Timot(?:eos|hy)|1Tim(?:oteo)?|1e\.\s*Tim|(?:《提(?:摩(?:太前[书書]|斐前)|前)|提(?:摩(?:太前[书書]|斐前)|前))》|《?弟茂德前書》|avvaltī|Timoth|1e\s*Tim|(?:1\.?\s*Ty|I\.?\s*Ty)m|Α['ʹʹ΄’]\s*Τιμ?|《提(?:摩(?:太前[书書]|斐前)|前)|《?弟茂德前書|Ⅰ\s*テモテへ|اولتی|提(?:摩(?:太前[书書]|斐前)|前)|1tīmt|1تیمت|۱(?:tīmt|تیمت)|디모데[1전]서|1tīm?|1تیم?|۱(?:tīm?|تیم?)|1テモテ|一テモテ|딤전))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Deut"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Ks(?:i[eę]g[ai]\s*Powt(?:[oó]rzonego)?\s*Pra|\.\s*Powt(?:[oó]rzonego)?\s*Pra|\s*Powt(?:[oó]rzonego)?\s*Pra)w|(?:Pi[aą]ta\s*K|5\.?\s*K)s(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|V(?:iides\s*Mooseksen\s*kirj|\.\s*(?:Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|kniha\s*Moj[zž][ií][sš]ov|Moj[zż]eszow|Mojz[ií][sš]ov|Mojž[ií][sš]ov)|\s*Ks(?:i[eę]g[ai]\s*Moj[zż]eszow|\.\s*Moj[zż]eszow|\s*Moj[zż]eszow)|\.?\s*Mooseksen\s*kirj|\s*kniha\s*Moj[zž][ií][sš]ov|\s*Moj[zż]eszow|\s*Mojz[ií][sš]ov|\s*Mojž[ií][sš]ov)|(?:Piata\s*(?:kniha\s*Moj[zž]i|Moj[zž]i)|5\s*k(?:\.\s*Moj[zž]i|\s*Moj[zž]i)|5\.\s*Mojz[ií]|5\s*Mojz[ií])[sš]ov|Kumbukumbu\s*la\s*Sheri|(?:P(?:at[aá]\s*k|át[aá]\s*k)|5\.\s*k)niha\s*Moj[zž][ií][sš]ov|Dezy[eè]m\s*liv\s*Lalwa\s*|5\.\s*Mooseksen\s*kirj|5\s*kniha\s*Moj[zž][ií][sš]ov|5\s*Mooseksen\s*kirj|Zaarettido\s*Woga|(?:(?:(?:Piata|5)\s*Mojz|(?:Pi(?:ata\s*Mojż|ąta\s*Moj[zż])|5\s*Mojż))e|5\.\s*Moj[zż]e)szow|P(?:at[aá]\s*M|át[aá]\s*M)oj[zž][ií][sš]ov|5\.?\s*Mojž[ií][sš]ov)a|Kitabu\s*cha\s*Tano\s*cha\s*Musa|Sharciga\s*Kunoqoshadiisa|P(?:hục\s*(?:truyền\s*luật\s*lệ\s*ký|Truyền\s*Luật\s*Lệ)|ovtorennja\s*Zakonu|nz)|Kumbukumbu\s*la\s*Torati|M(?:[aá]sodik\s*t[oö]rv[eé]nyk[oö]nyv|[oó]zes\s*V|T[oö]rv)|П(?:ет(?:та\s*книга\s*Мој|а\s*книга\s*Мои)сеева|['’]ята\s*книга\s*Мо[ий]сеева|о(?:вт(?:(?:орення|\.?)\s*Закону|орени\s*закони)|н(?:овљени\s*закони|з))|ета\s*Мојсијева)|(?:M[oó]zes\s*[oö]t[oö]dik\s*k[oö]nyv|Deutéronom)e|(?:P(?:angandharing\s*Tore|w)|Andharaning\s*Tor[eè])t|Li(?:ber\s*Deuteronomii|gji\s*i\s*(?:P[eë]rt[eë]rir[eë]|përtërirë)|P)|vyavastʰ[aā]ko\s*pustak|(?:Vyavasthaavivara|Ponovljeni\s*zako|Ulanga)n|F(?:[uü]nftes\s*(?:Buch\s*)?Mose|emte\s*Mosebo(?:ken|g)|immta\s*b[oó]k\s*M[oó]se)|व्य(?:वस्था(?:को\s*पुस्तक|\s*विवरण|विवरण)|्वस्थाविवरन|ावस्था)|เฉลย(?:​ธรรม​|ธรรม)บัญญัติ|V(?:iides\s*Mooseksen|\.?\s*Mooseksen|\.\s*M(?:o(?:j[zż]|s)|ós)|\s*M(?:o(?:j(?:z?|ż)|s)|ós))|ت(?:ثن(?:(?:ية\s*الإشتراع|ی(?:ه[اهی]|[او])|ه)|ئه)|[سص]نیه)|(?:Fimmta\s*M[oó]seb[oó]|5\.?\s*Mosebó|(?:5\.?\s*Móse|V(?:\.\s*M[oó]se|\s*M[oó]se))b[oó])k|ଦ୍ୱିତୀୟ\s*ବିବରଣୀ|Femte\s*Mos(?:ebok)?|ଦ୍ୱିତୀୟ\s*ବିବରଣ|D(?:euteron(?:om(?:i(?:y[ao]|[ao])|ya|ul|[ae])|ómio)|e?yuteronomyo|iyuteronomyo|(?:(?:(?:euteronôm|eut(?:e?|o)ronm)|euto?ronom)|ueteronom)io|euto?ronomy|eet(?:[eo]rono?my|rono?my)|u(?:eterono?my|etorono?my|ut(?:[eo]rono?my|rono?my)|etrono?my)|eut(?:e?|o)ronmy|tn)|De(?:uteron[oó]miu|te[rw]on[oò]|warie)m|Δευτερον[οό]μιον|Δε(?:υτ(?:ερ(?:ον[οό]μιο)?)?)?|5\.\s*Mooseksen|Второзакон(?:ие|ня)|V(?:ijfde|\.?)\s*Mozes|(?:(?:5\.\s*М|V\.?\s*М)|5\s*М)ојсијева|5\.?\s*Mosebo(?:ken|g)|5\.?\s*Buch\s*Mose|இணைச்\s*சட்டம்|bivastʰā\s*sār|D(?:e(?:u(?:t(?:eronom(?:i|y)?)?)?|t)?|uet|t)|P(?:hục(?:\s*Truyền)?|iata\s*Mojz)|5\s*Mooseksen|vyavastʰ[aā]ko|Đệ\s*nhị\s*luật|سفر\s*التثنية|Kum(?:b(?:ukumbu)?)?|Pi(?:ata\s*Mojż|ąta\s*Moj[zż])|5\.?\s*Mosebok|व्यवस्था(?:को)?|5\s*Моисеева|ਬਿਵਸਥਾ\s*ਸਾਰ|П(?:ета\s*Мојс?|овт)|T(?:(?:es(?:sniy|ni?y)e|esn(?:i[ae]|a))|asnie)h|משנה\s*תורה|Вт(?:ор(?:озак)?)?|Upākamam|5\.\s*Mozes|istis̱nā|ا(?:ِستِثنا|ستثناء)|تَثنِيَة|5(?:\.\s*Mo(?:se?)?|\s*(?:(?:M(?:o(?:os)?|oz|óz)?|М)|Mose?))|5\.\s*Moj[zż]|(?:5\.\s*М|V\.?\s*М)ојс?|5(?:\s*M[oó]ze|Mó)s|tsniyeh|உபாகமம்|التثنية|5\s*Mojz|5\s*Mojż|5\.\s*Mós|Sharci|5\s*Мојс?|استثنا|ਬਿਵਸਥਾ|anuw[aā]d|अनुवाद|ବିବରଣି|تث(?:ن(?:یه?)?)?|5\s*Moj|5\s*Mós|《申(?:命[紀記记]》|》)|דברים|《申(?:命[紀記记])?|5\s*Mz|ZarW|申命[紀記记]》|tsn?|申命[紀記记]|உபா|신명기|ฉธบ|Ul|申命?|신명?|申》|இச))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Titus"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:ослан(?:(?:ня\s*(?:св\.?\s*апостола\s*Павла\s*до\s*Тита|апостола\s*Павла\s*до\s*Тита)|ие\s*на\s*св\.?\s*ап\.\s*Павла\s*до\s*Тита|ие\s*на\s*св\.?\s*ап\s*Павла\s*до\s*Тита|\s*ня\s*до\s*Тита|и(?:е\s*к|ца)\s*Титу)|ие\s*към\s*Тит)|исмо\s*од\s*апостол\s*Павле\s*до\s*Тит)|P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*Tyta|ica\s*Titu)|a(?:ulus(?:'\s*Brev\s*til\s*Titus|’\s*[Bb]rev\s*til\s*Titus)|vlova\s*poslanica\s*Titu))|ط(?:ِطُس\s*کے\s*نام\s*(?:پولس\s*رسُول\s*)?کا\s*خط|طس\s*کے\s*نام\s*کا\s*خط)|தீத்து(?:(?:வுக்கு\s*எழுதிய\s*திருமுக|வுக்கு\s*எழுதிய\s*(?:நிருப|கடித))|க்கு\s*எழுதிய\s*திருமுக)ம்|Tīttuvukku\s*Eḻutiya\s*Nirupam|رسالة\s*بولس\s*الرسول\s*إلى\s*تيطس|(?:List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Tytus|do\s*Tytus)|t(?:itasl[aā][iī]\s*patr|īt(?:asl[aā][iī]\s*patr|al[aā]\s*patr|āl[aā]\s*patr)|ital[aā]\s*patr|itāl[aā]\s*patr))a|Br(?:ef\s*P[aá]ls\s*til\s*T[ií]tusar|éf\s*P[aá]ls\s*til\s*T[ií]tusar)|אגרת\s*פולוס\s*אל-?טיטוס|ṭiṭus\s*ke\s*nām\s*kā\s*ḫaṭ|तीतसलाई\s*पावलको\s*पत्र|ତୀତସଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|पौलाचे\s*तीताला\s*पत्र|Brevet\s*till\s*Titus|Epistula\s*ad\s*Titum|tītus\s*nū̃\s*pattrī|Kirje\s*Titukselle|Brevet\s*til\s*Titus|ਤੀਤੁਸ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|الرسالة\s*إلى\s*تيطس|Waraka\s*kwa\s*Tito|האיגרת\s*אל\s*טיטוס|Lettera\s*a\s*Tito|Barua\s*kwa\s*Tito|T(?:itusarbr[eé]fið|í(?:tusarbr[eé]fið|ch)|i(?:t(?:u(?:s(?:brevet|z?hoz)|m)|it|[eô])|itu)|ytusa|t)|तीतसलाई\s*पत्र|T(?:itusarbr[eé]f|ít(?:usarbr[eé]f)?|īttuvukku|i(?:t(?:u(?:sz?)?|i|o)?|it)|yt(?:us)?)|List\s*T[ií]tovi|तीताला\s*पत्र|티토(?:에게\s*보낸\s*서간|서)|Titukselle|Προς\s*Τ[ίι]τον|ਤੀਤੁਸ(?:\s*ਨੂੰ)?|Ka(?:ng|y)\s*Tito|t(?:it(?:a(?:sl[aā][iī]|l[aā])|āl[aā])|īt(?:asl[aā][iī]|al[aā]|āl[aā]|us))|テ(?:トス(?:への(?:て[かが]み|書)|への手紙|ヘの手紙|書)|ィトに達する書)|ad\s*Titum|אל\s*טיטוס|तीत(?:स(?:लाई)?|ाला)|ତୀତସଙ୍କ|T(?:a[iy]t(?:o[ou]|u)|i(?:to|it)o)s|До\s*Тита|தீத்(?:து)?|ت(?:یتو[ثس-ص][هی]|يتو[س-ص])|Titovi|Títovi|Tytous|Teetus|К\s*Титу|ت(?:یت(?:و[ثس-ص]?)?|ي)|ط(?:ِطُس|طس|ي)|ท(?:ิตัส|ต)|《?弟鐸書》|《?提(?:多[书書]|特書)》|तीत[ुॉ]स|テトスへ?|《?弟鐸書|《?提(?:多[书書]|特書)|Τ(?:[ίι]το|τ)|Тит[ау]|ﺗﻴﻄﺲ|(?:تی|طي)طس|Τ[ίι]τ|Тит|《?多》|디도서|티토|《?多|딛))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Heb"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:ослан(?:и(?:е\s*(?:на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Евреите|\s*ап\.?\s*Павла\s*до\s*Евреите)|к(?:ъм\s*евреите|\s*Евреям))|ца\s*Јеврејима)|\s*ня\s*до\s*Євре[ії]в|ня\s*до\s*євре[ії]в)|исмо\s*до\s*Евреите)|ع(?:بر(?:انیوں\s*کے\s*نام\s*پولس\s*رسول\s*کا\s*خط|(?:انیوں\s*کے\s*نام\s*کا\s*خط|(?:انی(?:ان(?:ات|[تدزسـهڈی])|ونه)|ی)))|ِبرانیوں\s*کے\s*نام\s*کا\s*خط)|எபிர(?:(?:ேயருக்கு\s*எழுதிய\s*(?:திருமுக|கடித)ம|ேயர)|ெயருக்கு\s*எழுதிய\s*நிருபம)்|(?:Epireyarukku\s*Eḻutiya\s*Nirupa|Hebrej[ouů]|Zid[ouů]|Žid[ouů])m|P(?:avlova\s*poslanica\s*Hebrejima|oslan(?:nja\s*do\s*jevre[iï]v|ica\s*Hebrejima))|ʿibrāniyōṅ\s*ke\s*nām\s*kā\s*ḫaṭ|हिब्रूहरूको\s*निम्ति\s*पत्र|(?:hibr[uū]har[uū]ko\s*nimti\s*patr|Waraka\s*kwa\s*Waebrani|B(?:arua\s*kwa\s*Waebrani|r[eé]fið\s*til\s*Hebre)|ibr[iī]\s*lok[aā][mṃ]s\s*patr|Cibraaniyad|Waebrani)a|ال(?:رسالة\s*إلى\s*ال)?عبرانيين|L(?:ist\s*(?:do\s*(?:Hebrajczyk[oó]w|[ZŻ]yd[oó]w)|Hebrej[ouů]m|[ZŽ]id[uů]m)|ettera\s*agli\s*Ebrei|ayang\s*Ibrani)|(?:Epistula\s*)?ad\s*Hebraeos|(?:Brevet\s*til\s*(?:hebre|Hebræ)ern|He(?:prealaiskirj|br(?:e(?:njv|ern)|æern))|Ibraaw)e|Kirje\s*he[bp]realaisille|Z(?:sid[oó]khoz\s*[ií]rt\s*lev[eé]l|d)|ibrānīāṃ\s*nū̃\s*pattrī|ਇਬਰਾਨੀਆਂ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|हिब्रू(?:हरूको\s*निम्ति)?|hibr[uū]har[uū]ko\s*nimti|इब्री\s*लोकांस\s*पत्र|הא(?:יגרת\s*אל[\s*-]העברים|גרת\s*אל-?העברים)|Mga\s*(?:Hebr(?:ohanon|eo)|Ebreo)|Heprealaisille|H(?:eb(?:r(?:[eæ]erbrevet|éerbrevet|e(?:a(?:br[eé]fið|id)|(?:(?:o?|w)|e)s|u[sx])|aeer|aer|äer|rs|ws|s)|er?s|(?:ro|e[eo])s|o(?:[eor])?s)|ê-?bơ-?rơ|e[ew]brews|w(?:[ew])?brews|ébreux|brews)|히브리(?:인들에게\s*보낸\s*서간|서)|Προς\s*Εβρα[ίι]ους|E(?:pireyarukku|b(?:r(?:a(?:an(?:ian)?|n(?:iya)?)|e(?:ean)?)?)?|vr)|इब्री\s*लोकांस|ਇਬਰਾਨੀਆਂ\s*ਨੂੰ|Hebrajczyk[oó]w|ibr[iī]\s*lok[aā][mṃ]s|Heber\s*lev[eé]l|Héber\s*lev[eé]l|(?:Ibra(?:aniya|ni)a|(?:Ebr(?:(?:a(?:an(?:iya|y)|n(?:i(?:yy|e)|ee))|eeani)|iani)|Hebra(?:niy|ani)|Ibraany)a|Abraan(?:(?:iya|y)a|i[ao])|Ebra(?:ni(?:y(?:aa|[ou])|[ou])|ani(?:yu|[eo]))|Hebr(?:ania|ee[eë])|Ebraniaa|ebrāniā)n|Ibraaaniyon|Hebreohanon|Ebr(?:a(?:anians|niyan)|ei)|Ibr(?:aaniya)?n|(?:Ibraanian|H(?:e[ew]breww|w(?:[ew])?breww|eb(?:r(?:e(?:ww|r)|aeo|r[eorw]|we)|e(?:r[eorw]|w[erw])|(?:ro|e[eo])[eor]|o[eor][eor]|w(?:er|re))|breww))s|इब्रान(?:ियों|ी)|Zsid(?:[oó]k(?:hoz)?)?|ع(?:ب(?:ر(?:انی(?:انا?|و[نں])?)?)?|ِبرانیوں)|ヘ[フブ](?:ライ(?:人への手紙|書)|ル(?:人への(?:手紙|書)|書))|Hebrejima|عبران(?:ی(?:ائ|[آهی])|يا)ن|אל\s*העברים|Јеврејима|До\s*євре[ії]в|ibrānīāṃ|Ebranian|へ[フブ]ル人への手紙|Εβρα[ίι]ους|К\s*Евреям|इब्र(?:ानि|ी)|(?:Do\s*Thá|Evre)i|Евреите|H(?:e(?:b(?:r(?:e[ow])?)?|pr)?|é(?:br?)?|br|ê)|Ibr(?:a(?:ni)?)?|ebr(?:ānī|i)|Євре[ії]в|(?:《?希伯(?:來[书書]|来书)|《[來来]|[來来])》|《?耶烏雷爾》|Евреям|Євр(?:е[ії])?|Евр(?:еи)?|எபி(?:ரே)?|ヘ[フブ](?:ル人へ|ライ)|《?希伯(?:來[书書]|来书)|《?耶烏雷爾|ฮ(?:ีบรู|บ)|(?:Zyd[oó]|Żyd[oó])w|ଏବ୍ରୀ|Cib|ebr|Zid|Žid|Zyd|Żyd|Εβρ?|Јев|へ[フブ]ル|히브?|《[來来]|Žd|Ἑβ|[來来]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:П(?:исмо\s*од\s*апостол\s*Павле\s*до\s*христијаните\s*во\s*Филипи|ослан(?:ня\s*(?:св(?:\.\s*апостола\s*Павла\s*до\s*филип['’]ян|\s*апостола\s*Павла\s*до\s*филип['’]ян)|апостола\s*Павла\s*до\s*филип['’]ян|до\s*(?:Філіп['’]ян|филип['’]ян))|и(?:е\s*к(?:ъм\s*филипяните|\s*Филиппи[ий]цам)|ца\s*Филипљанима))|ослание\s*на\s*св(?:\.\s*ап\.?\s*Павла\s*до\s*Филипян|\s*ап\.?\s*Павла\s*до\s*Филипян)и)|Poslannja\s*apostola\s*Pavla\s*do\s*fylyp['’]jan|ف(?:ِل(?:ِپ(?:ّیُوں\s*کے\s*نام\s*پو\s*لس\s*رسُول|ِّیوں\s*کے\s*نام)\s*کا\s*خط|پّیوں)|لپیوں\s*کے\s*نام\s*کا\s*خط|یل(?:یپی(?:[او]ن(?:یان|ان|[نه])|ها)|پیان)|لیپیان|ي)|பிலிப்பியர(?:ுக்கு\s*எழுதிய\s*(?:திருமுக|(?:நிருப|கடித))ம்|்)|رسالة\s*بولس\s*الرسول\s*إلى\s*أهل\s*فيلبي|(?:Pilippiyarukku\s*Eḻutiya\s*Nirupa|Filipano)m|(?:P(?:avlova\s*poslanica\s*Filipljanim|oslanica\s*Filipljanim|iliphphisiyuus)|Filipljanim)a|א(?:גרת\s*פולוס\s*השליח\s*אל-?|ל\s*)הפיליפיים|אגרת\s*פולוס\s*השליח\s*אל-?הפיליפי|(?:Paulus(?:'\s*Brev\s*til\s*Filippern|’\s*(?:Brev\s*til\s*F|brev\s*til\s*f)ilippern)|Kirje\s*filippil[aä]isill|Filip(?:(?:p(?:il[aä]iskirj|ern)|ian[eë]v)|pensern)|Filippil[aä]isill)e|List\s*(?:[sś]w\.?\s*Pawła\s*do\s*Filipian|do\s*Filipian|Filip(?:anom|sk[yý]m))|B(?:r[eé]f\s*P[aá]ls\s*til\s*Filipp[ií]manna|arua\s*kwa\s*Wafilipi)|फिलिप्पीहरूलाई\s*पावलको\s*पत्र|Br[eé]f\s*P[aá]ls\s*til\s*Filipp[ií]mann|पौलाचे\s*फिलिप्पैकरांस\s*पत्र|f(?:ilipp(?:iyōṅ\s*ke\s*nām\s*kā\s*ḫaṭ|īāṃ\s*nū̃\s*pattrī)|īlīppī)|Epistula\s*ad\s*Philippenses|ଫିଲିପ୍ପୀୟଙ୍କ\s*ପ୍ରତି\s*ପତ୍ର|Sulat\s*sa\s*mga\s*(?:Filipense|Pilip(?:ense|yano))|pʰilipp(?:aikar[aā][mṃ]s\s*patra|[iī]har[uū]l[aā][iī]\s*patra)|الرسالة\s*إلى\s*أهل\s*فيلبي|ਫ਼ਿਲਿੱਪੀਆਂ\s*ਨੂੰ\s*ਪੱਤ੍ਰੀ|(?:Lettera\s*ai\s*)?Filippesi|(?:Layang\s*Paulus\s*F|Waf)ilipi|Waraka\s*kwa\s*Wafilipi|फिलिप्पीहरूलाई\s*पत्र|האיגרת\s*אל\s*הפיליפים|फिलिप्पैकरांस\s*पत्र|P(?:h(?:i(?:l(?:ip(?:p(?:ibeliekhez|er)|iaid)|(?:ipppi|(?:ippe|pi))ans|l(?:(?:ip(?:pian|ai?n|ian)|(?:ipp?ea|pp?ia)n)|lipian)s|ip(?:pian|(?:(?:p[ai]n|ian)|ai?n))s|ppians|ípphê|pan)|-?líp)|lpp|p)|il(?:ipi|p))|(?:Mga\s*Taga(?:-?(?:\s*[FP]ilipo|Filipo)|\s*[FP]ilipo)|Filip(?:iya|yu)nian|P(?:h(?:il(?:l(?:ip(?:pi?ai|aia|i(?:a[ai]|ea))|p(?:ie|a))|ippia[ai]|ip(?:pai|e)a|ipp?ie|ipaia|pai)n|il(?:l(?:ip(?:(?:pi[ei]|ii)|ppi)|l(?:ip[ip]i|pp?i))|ipp?ii|ppii|pppi|pe)an|il(?:(?:ip(?:pai|e)|i?pi)n|lip(?:ie?n|p[ai]n))|lipp?ian)|ilipo)|Taga(?:-?(?:\s*[FP]ilipo|Filipo)|\s*[FP]ilipo)|Filip(?:(?:ense|o)|yan))s|Προς\s*Φιλιππησ[ίι]ους|pʰilipp(?:aikar[aā][mṃ]s|[iī]har[uū]l[aā][iī])|필리피(?:\s*신자들에게\s*보낸\s*서간|서)|ad\s*Philippenses|P(?:ilippiyarukku|h(?:i(?:l(?:(?:ipppi|(?:ippe|pi))an|l(?:i(?:p(?:pian|ai?n|ian)|p?)|(?:ipp?ea|pp?ia)n|lipian)|ip(?:pian|(?:(?:p[ai]n|ian)|ai?n))|ppian|i(?:pp?)?|pp?)?)?|l(?:ipp?|p)))|फिलिप्प(?:ी(?:हरूलाई)?|ैकरांस|ि)|ਫ਼ਿਲਿੱਪੀਆਂ\s*ਨੂੰ|F(?:(?:(?:ili(?:p(?:p(?:erbrevet|ibr[eé]fið|íbr[eé]fið)|en(?:s[oó]w|i)|ians)|boy)|l?p)|ilippiekhez)|lippiekhez)|Mga\s*Filipense|Mga\s*Pilip(?:ense|yano)|К\s*Филиппи[ий]цам|ଫିଲିପ୍ପୀୟଙ୍କ|Philippenses|Φιλιππησ[ίι]ους|フィリ[ヒピ](?:の信徒への手紙|人への手紙|書)|Filipensk[yý]m|(?:Filip(?:p(?:enze|aiyo)|ye)|fīlīppiā)n|אל\s*הפיליפים|फ(?:िलिप्(?:पियों|‍पी)|़िलिप्पॉय)|До\s*филип['’]ян|Филипљанима|Филиппи[ий]цам|Филип(?:ја|я)ните|رسالة\s*فيلبي|ف(?:ِلِپّیُوں|یل(?:یپی(?:[او]ن|ه)|پی?)?|ل(?:پیوں|یپ)?)|Фил(?:ип(?:јани|['’]ян|яни))?|f(?:ilippīāṃ|īlīp)|Ф(?:илип['’]яни|лп)|Filipsk[yý]m|F(?:(?:il(?:i(?:p(?:i(?:an)?|pi)?)?)?|l)|ilipyun)|[ヒピ]リ[ヒピ]人への手紙|ฟ(?:ีลิปปี|ป)|[ヒピ]リ[ヒピ](?:人への)?書|பிலி(?:ப்)?|(?:《腓立比[书書]|腓立比[书書]|《?肥利批)》|《?斐理伯書》|ﻓﻴﻠﻴﺒﻲ|[ヒピ]リ[ヒピ](?:人へ)?|《腓立比[书書]|《?斐理伯書|フィリ[ヒピ]|腓立比[书書]|《?肥利批|빌립보서|《腓》|Φι|《腓|필리|腓》|빌|腓))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Dan"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:К(?:нига\s*(?:на\s*пророк\s*Даниила?|пророка\s*Дани[иії]ла)|њига\s*пророка\s*Данила)|தானியேல(?:ின்\s*புத்தகம)?்|Prophetia\s*Danielis|ଦାନିୟେଲଙ୍କ\s*ପୁସ୍ତକ|d(?:ān(?:iyalko\s*pustak|īl)|aniyalko\s*pustak)|दान(?:िय(?:लको\s*पुस्तक|्ये?ल)|ीएल्र)|Danielin\s*kirja|(?:Ks(?:i[eę]g[ai]\s*Danie|\.?\s*Danie)|Daanee)la|Liv\s*Dany[eè]l\s*la|D(?:an(?:iel(?:s\s*Bog|[ae])|iya(?:[ei]lh|l)|ya(?:[ei]lh|l)|e)|[ln])|Daniels\s*bok|سفر\s*دانيال|d(?:ān(?:iyalko|ī?)|aniyalko)|دان(?:یائل(?:له|[هی])|ي(?:ا(?:ئل(?:له|[هی])|ل(?:له|ی))|ئل(?:له|ی)|لی|یل)|ی[ئا]لله|(?:ی[ئا]|ی)لی|ییل)|(?:D(?:a(?:an(?:iyy|ye)|ní)|hani|áni)e|Dan(?:i(?:yah|(?:ye|[aèë]))|y(?:ah|[eièï]))|d(?:ān(?:ī(?:ʾī|e)|i[eā])|an[iī]e))l|D(?:a(?:n(?:iel(?:in?)?|iya[ei]l|ya[ei]l)?|an)?|án)|दान(?:ि(?:यल(?:को)?)?|ीएल)|ଦାନିୟେଲଙ|Đa-?ni-?ên|Ða-?ni-?ên|دان(?:ی(?:(?:\s*ای|ا[يی])|یا)|ي(?:اي|یا))ل|دا(?:ن(?:یائل|ي(?:ائ?ل|ئل)|ی[ئا]ل|یل?)?)?|ด(?:าเนีย|น)ล|Đa(?:-?niê|nie)n|Tāṉiyēl|Дани[иії]ла?|Δ(?:ανι[ήη]λ|ν)|Д(?:анило|ан(?:и[ея]|аи)л|они[её]л)|(?:《但以理[书書]|但以理[书書])》|ਦਾਨੀਏਲ|Д(?:ан(?:ил)?|он)|《但以理[书書]|《?達尼爾》|דניאל|[タダ]ニエル書|但以理[书書]|《?達尼爾|தானி|[タダ]ニエル|다니엘서|Δαν?|다니엘?|《但》|Đa|《但|但》|但|단))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Judas(?:'\s*B|\s*b)rev|(?:(?:List\s*powszechny\s*[SŚ]wi[eę]tego\s*Iudasa\s*Apostoł|Judina\s*poslanic|Lettera\s*di\s*Giud|yah(?:ūd(?:ā(?:ce[mṃ]\s*patr|ko\s*patr)|a(?:ce[mṃ]\s*patr|ko\s*patr))|ud[aā](?:ce[mṃ]\s*patr|ko\s*patr))|Barua\s*ya\s*Yud|Yihuda|Giu[dđ])a|С(?:оборне\s*послання\s*(?:св\.?\s*апостола\s*Юди|Юди)|ъборно\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Иуда|\s*ап\.?\s*Иуда))|Hið\s*almenna\s*br[eé]f\s*J[uú]dasar|П(?:ослание\s*на|исмо\s*од)\s*апостол\s*Јуда|Poslan(?:ica\s*Jude\s*apostola|nja\s*apostola\s*Judy)|Послання\s*апостола\s*Юди|Y(?:ūtā\s*Eḻutiya\s*Nirupam|ah(?:udaa?|ooda)h|eh(?:udaa?h|ood(?:aa|eh))|udas)|யூதா\s*(?:எழுதிய\s*(?:நிருப|கடித)ம்|திருமுகம்)|y(?:ahūdā(?:h\s*(?:kā\s*ʿām\s*ḫaṭ|dī\s*pattrī)|n)|ūdā)|رسال(?:ى\s*القديس|ة)\s*يهوذا|ی(?:ہ(?:ُوداہ\s*کا\s*عام\s*خط|ود(?:اہ\s*کا\s*عام\s*خط|(?:ا(?:ءه|[ته])|[آةهىی])))|هو(?:داءه|(?:د(?:ا[ته]|[آةهىی])|ذ)))|ਯਹੂਦਾਹ\s*ਦੀ\s*ਪੱਤ੍ਰੀ|(?:Посланица\s*)?Јудина|(?:Juudaksen\s*kirj|Giu-?đ)e|Послание\s*на\s*Юда|Ιο(?:υδα\s*Επιστολη|ύδα)|Epistula\s*Iudae|ଯିହୂଦାଙ୍କ\s*ପତ୍ର|J(?:ud(?:as\s*epistel|ova|[ey])|udasarbr[eé]fið|úd(?:asarbr[eé]fið|ov\s*List)|udasbrevet|udov\s*List|de|id)|यहूदा(?:चें\s*पत्र|को\s*पत्र|ह)|List\s*[sś]w\.\s*Judy|Послание\s*Иуды|Послання\s*(?:Іу|Ю)ди|Layang\s*Yudas|List\s*[sś]w\s*Judy|J(?:(?:u(?:dasarbr[eé]f|(?:ud(?:aksen)?|d(?:ina|as?|ov)))|úd(?:as(?:arbr[eé]f)?|ov)?)|wd)|Jud(?:as’\s*[Bb]re|[uů])v|אי?גרת\s*יהודה|Ј(?:аковљевог|уд[ае]|д)|List\s*Jud(?:[uů]v|y)|y(?:ah(?:ū(?:(?:dāce[mṃ]|(?:dāko|(?:dāh?)?))|da(?:ce[mṃ]|ko))|ud[aā](?:ce[mṃ]|ko))|ūd)|ଯିହୂଦାଙ୍କ|San\s*Judas|यहूदा(?:चें|को)?|Y(?:ah(?:udaa?|ooda)|eh(?:oo|u)da|u(?:da?|ud)|ihu|ūtā)|ی(?:ہ(?:ُوداہ|ودا(?:ء?|ہ))|هو(?:داء|(?:دا)?))|ユ[タダ](?:からの手紙|の(?:手紙|書))|ਯਹੂਦਾਹ|(?:Y(?:uuda|d)|J(?:(?:udá|údá|da)|wda))s|Ιουδα|유다(?:\s*서간|서)|Iudae|Hudas|(?:《(?:犹大书|猶[大達]書)|犹大书|猶[大達]書)》|《?伊屋達》|יהודה|يهوذا|Iuda|《(?:犹大书|猶[大達]書)|《?伊屋達|யூதா|Иуд[аы]|ย(?:ูดา|ด)|Јуд|يهو?|Иуд|犹大书|猶[大達]書|Юда|Іуд|《[犹猶]》|᾿Ιδ|유다?|Юд|《[犹猶]|ユ[タダ]|Gd|犹》|猶》|犹|猶))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Se(?:cond(?:o\s*(?:libro\s*dei\s*)?Maccabei|\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|a\s*Maccabei)|gund(?:o\s*Mac(?:(?:cab(?:bee?os|ee?os)|abbee?os|abee?os)|abeus)|a\s*Macabeus)|cond\s*Mac(?:cabeee|abb?eee)s)|(?:Drug(?:a\s*(?:knjiga\s*o\s*Makabejcim|Ks(?:i[eę]g[ai]\s*Machabejsk|\.?\s*Machabejsk))|i\s*Ks(?:i[eę]g[ai]\s*Machabejsk|\.?\s*Machabejsk))|(?:II\.?\s*K|2\.?\s*K)s(?:i[eę]g[ai]\s*Machabejsk|\.?\s*Machabejsk))a|Втор(?:а(?:(?:я\s*книга\s*Маккаве[ий]ская|\s*книга\s*на\s*Макавеите)|\s*Макавеи)|о\s*Макавеи)|Kitabu\s*cha\s*Wamakabayo\s*II|Druh(?:[aá]\s*kniha\s*Ma(?:ch|k)abejcov|[yý]\s*(?:list\s*Ma(?:ch|k)abejcov|Ma(?:chabejcov|kabej(?:sk[aá]|cov)))|[aá]\s*Machabejcov|[aá]\s*Makabejsk[aá]|[aá]\s*Makabejcov)|T(?:oinen\s*makkabilaiskirja|weede\s*Makkabee[eë]n)|(?:Втора\s*книга\s*Макаве[ий]с|(?:II\.?\s*Макавеј|2\.?\s*Макавеј)с)ка|(?:I(?:kalawang\s*Mg|I\.?\s*Mg)a\s*Macabe|2\.?\s*Mga\s*Macabe)o|Liber\s*II\s*Maccabaeorum|(?:Liber\s*Maccabaeorum|Ma(?:chabaeorum|kkabeusok))\s*II|(?:Andra\s*Mackab[eé]erboke|2(?:\.\s*Mackab[eé]erboke|(?:\s*Mackab[eé]erboke|(?:\.\s*Makkabee[eë]|\s*Makkabee[eë]))))n|(?:II\.?\s*m|2\.\s*m)akkabilaiskirja|2-?(?:ге|а)\.\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|Друг(?:а\s*книга\s*Макаве[ії]в|е\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|а\s*Мака(?:веј(?:ск)?|бејац)а|а\s*Макаве[ії]в)|(?:Deuxi[eè]me(?:s\s*Maccab[eé]e|\s*Maccab[eé]e)|2(?:(?:eme|de?)|ème)\.\s*Maccab[eé]e|2(?:(?:eme|de?)|ème)\s*Maccab[eé]e|(?:II\.?\s*Maccabé|2\.?\s*Maccabé)e|2e\.?\s*Maccab[eé]e|II\.?\s*Macabeu|2o\.\s*Macabeu|2\.?\s*Macabeu|2o\s*Macabeu)s|(?:M[aá]sodik\s*Makkabeuso|(?:Andre\s*Makkabeer|2\.?\s*Makkabeer)bo|(?:II\.?\s*Makkabeu|2\.?\s*Makkabeu)so|Pili\s*Ma)k|(?:2(?:-?е\.?\s*к|\.?\s*к)|II\.?\s*к)нига\s*Макаве[ії]в|2-?(?:ге|а)\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|سفر\s*المكابين\s*الثاني|Se(?:gundo\s*Mac(?:cab(?:bee?o|ee?o)|abbee?o|abee?o)|cond\s*Mac(?:(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|(?:cabeee|abb?eee)))|Anden\s*Makkabæerbog|Ikalawang\s*Macabeos|2\s*makkabilaiskirja|Zweite(?:[nrs]\s*Makkab(?:aee?|äe)r|\s*Makkab(?:aee?|äe)r)|Ikalawang\s*Macabeo|[OÖ]nnur\s*Makkabeab[oó]k|2\s*k\.\s*Ma(?:ch|k)abejcov|2(?:\.[oº]|º)\.?\s*Maccab(?:bee?os|ee?os)|(?:II(?:\.\s*Mach?aba|\s*Mach?aba)|(?:2\.\s*Macha|(?:2\.?\s*Maca|2\s*Macha))ba)eorum|2(?:\.[oº]|º)\.?\s*Maccab(?:bee?o|ee?o)|Pili\s*Wamakabayo|(?:II\.?\s*Machabe|2\.?\s*Machabe)jcov|2\s*k\s*Ma(?:ch|k)abejcov|2\.?\s*Makkabæerbog|2nd\.?\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|(?:II(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|2nd\.?\s*Mac(?:cabeee|abb?eee)|2\.?\s*Maccab(?:bee?o|eo)|2\.?\s*Maccabee[eo]|2\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))s|2(?:\.[oº]|º)\.?\s*Macab(?:bee?os|ee?os)|2o\.\s*Mac(?:cab(?:bee?os|ee?os)|abbee?os|abee?os)|المكابين\s*الثاني|2nd\.?\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|II(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|2nd\.?\s*Mac(?:cabeee|abb?eee)|2(?:\.[oº]|º)\.?\s*Macab(?:bee?o|ee?o)|2o\.\s*Mac(?:cab(?:bee?o|ee?o)|abbee?o|abee?o)|II(?:\.\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи)|\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи))|(?:II\.?\s*W|2\.?\s*W)amakabayo|(?:II\.?\s*Makabej|2\.?\s*Makabej)sk[aá]|(?:II\.?\s*Makabej|2\.?\s*Makabej)cov|(?:II\.?\s*Maccc|2\.?\s*Maccc)abbbe|(?:(?:II\.?\s*Maccc|2\.?\s*Maccc)abb|(?:II\.?\s*Maccabbb|2\.?\s*Maccabbb))e[es]|(?:II\.?\s*Maccc|2\.?\s*Maccc)abe(?:e[es]|s)|(?:II\.?\s*Macabbb|2\.?\s*Macabbb)e(?:e[es]|s)|2o\s*Mac(?:cab(?:bee?os|ee?os)|abbee?os|abee?os)|II\.?\s*Makkabee[eë]n|2e\.?\s*Makkabee[eë]n|(?:II\.?\s*Макаб|2\.?\s*Макаб)ејаца|(?:2(?:(?:(?:-?е\.?\s*Макк|\.\s*Макк)|\s*Макк)авее|(?:-?я|[ея])\.?\s*Маккавее)|II(?:\.\s*Макаве[ії]|\s*Макаве[ії])|2\.?\s*Макаве[ії])в|II(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|(?:(?:II\.?\s*Maccc|2\.?\s*Maccc)abb|(?:II\.?\s*Maccabbb|2\.?\s*Maccabbb))e|(?:II\.?\s*Maccc|2\.?\s*Maccc)abee?|(?:II\.?\s*Macabbb|2\.?\s*Macabbb)ee?|2\.?\s*Maccab(?:bee?o|eo)|2o\s*Mac(?:cab(?:bee?o|ee?o)|abbee?o|abee?o)|2\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|Β['ʹʹ΄’]\s*Μακκαβα[ίι]ων|2\.?\s*Makkabaeer|Wamakabayo\s*II|Μακκαβα[ίι]ων\s*Β['ʹʹ΄’]|2-?е\.?\s*Макаве[ії]в|2\.?\s*Macc(?:ab(?:bee?|e))?|2\.?\s*Maccabee[eo]|2\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|2\.?\s*Maccabees|2\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|2°\.\s*Maccabei|2a\.\s*Macabeus|2\.?\s*Makkabaer|2\.?\s*Makkabäer|ספר\s*מקבים\s*ב['’]|(?:II\.?\s*Макавеј|2\.?\s*Макавеј)а|2\.?\s*Maccabee|2\.?\s*Macab(?:bee?|ee?)|M[aá]sodik\s*Mak|2(?:\s*(?:மக்கபேயர்|المكابيين|Mc[bh]|Мк|مك)|\.\s*มัคคาบี|\s*มัคคาบี|Macc|마카)|2°\s*Maccabei|2a\s*Macabeus|חשמונאים\s*ב['’]|And(?:en|re)\s*Makk|Tweede\s*Mak|2\.?\s*Макавеи|2\.?\s*Makabe|Druh(?:[aá]|[yý])\s*Mak|II\.?\s*Maccc|2\.?\s*Maccc|마카베오(?:기\s*하권|하)|2(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:a(?:c(?:h|k)?)?|c)?|makk|Макк?|மக்)|Makk?))|2e\.?\s*Mak|Β['ʹʹ΄’]\s*Μακκ|מקבים\s*ב|マカ(?:[ヒビ]ー第二書|[ハバ]イ(?:\s*2|記[2下]|下))|《瑪加伯下》|《瑪加伯下|瑪加伯下》|瑪加伯下))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Tr(?:e[cć]a\s*knjiga\s*o\s*Makabejcim|zeci(?:a\s*Ks(?:i[eę]g[ai]\s*Machabejsk|\.?\s*Machabejsk)|\s*Ks(?:i[eę]g[ai]\s*Machabejsk|\.?\s*Machabejsk)))|(?:III\.?\s*K|3\.?\s*K)s(?:i[eę]g[ai]\s*Machabejsk|\.?\s*Machabejsk))a|K(?:itabu\s*cha\s*Wamakabayo\s*III|olmas\s*makkabilaiskirja)|Тре(?:т(?:ья\s*книга\s*Маккаве[ий]ская|о\s*(?:книга\s*на\s*Макавеите|Макавеи)|[яє]\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|а\s*Макавеи)|та\s*книга\s*Макаве[ий]ска|ћ(?:ом\s*Мака(?:веј(?:ск)?|бејац)а|а\s*Мака(?:веј(?:ск)?|бејац)а))|T(?:re(?:t(?:(?:ia\s*(?:kniha\s*)?Mac|i\s*Mac)|í\s*Mac)habejcov|dje\s*Makkabæerbog)|er(?:z(?:o\s*(?:libro\s*dei\s*)?Maccabei|a\s*Maccabei)|ce(?:r(?:o\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os))|\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os)))|ir[ao]\s*Macabeus))|roisi[eè]me(?:s\s*Maccab[eé]e|\s*Maccab[eé]e)s|hird\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|ret[ií]\s*Makabejsk[aá]|řet[ií]\s*Makabejsk[aá]|hird\s*Mac(?:cabeee|abb?eee)s|atu\s*Wamakabayo)|Liber\s*III\s*Maccabaeorum|(?:Liber\s*Maccabaeorum|Ma(?:chabaeorum|kkabeusok))\s*III|(?:Tredje\s*Mackab[eé]erboke|3(?:e\.?\s*Mack|\.\s*Mack)ab[eé]erboke|3(?:\s*Mackab[eé]erboke|(?:\.\s*Makkabee[eë]|\s*Makkabee[eë])))n|(?:III\.?\s*m|3\.\s*m)akkabilaiskirja|(?:I(?:katlong\s*Mg|II\.?\s*Mg)a\s*Macabe|3\.?\s*Mga\s*Macabe)o|(?:Harmadik\s*Makkabeuso|(?:Tredje\s*Makkabeer|3\.?\s*Makkabeer)bo|(?:III\.?\s*Makkabeu|3\.?\s*Makkabeu)so|Tatu\s*Ma)k|3-?(?:тє|а)\.\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|(?:3(?:-?е\.?\s*к|\.?\s*к)|III\.?\s*к)нига\s*Макаве[ії]в|3-?(?:тє|а)\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|T(?:ercer(?:o\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o)))|hird\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|hird\s*Mac(?:cabeee|abb?eee)|redje\s*Makk|ret[ií]\s*Mak|řet[ií]\s*Mak)|D(?:ritte(?:[nrs]\s*Makkab(?:aee?|äe)r|\s*Makkab(?:aee?|äe)r)|erde\s*Makkabee[eë]n)|Þriðja\s*Makkabeab[oó]k|3\s*makkabilaiskirja|(?:Ikatlong\s*Macabe|3o\.?\s*Macabee)os|(?:III(?:\.\s*Mach?aba|\s*Mach?aba)|(?:3\.\s*Macha|(?:3\.?\s*Maca|3\s*Macha))ba)eorum|(?:Ikatlong\s*Macabe|3o\.?\s*Macabee)o|(?:III\.?\s*Machabe|3\.?\s*Machabe)jcov|3\s*k\.?\s*Machabejcov|(?:III(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|3rd\.\s*Mac(?:cabeee|abb?eee)|3\.?\s*Maccab(?:bee?o|eo)|3rd\s*Mac(?:cabeee|abb?eee)|3\.?\s*Maccabee[eo]|3\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|3o\.?\s*Macabeo)s|3(?:\.[oº]|º)\.\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os))|III(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|3(?:\.[oº]|º)\.\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|III(?:\.\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи)|\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи))|(?:III\.?\s*W|3\.?\s*W)amakabayo|(?:III\.?\s*Maccc|3\.?\s*Maccc)abbbe|(?:(?:III\.?\s*Maccc|3\.?\s*Maccc)abb|(?:III\.?\s*Maccabbb|3\.?\s*Maccabbb))e[es]|(?:III\.?\s*Maccc|3\.?\s*Maccc)abe(?:e[es]|s)|(?:III\.?\s*Macabbb|3\.?\s*Macabbb)e(?:e[es]|s)|3rd\.\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|3\.?\s*Makkabæerbog|(?:III\.?\s*Makabej|3\.?\s*Makabej)sk[aá]|3o\.?\s*Maccab(?:bee?os|ee?os)|3(?:\.[oº]|º)\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os))|(?:3[eè]me\.\s*Maccab[eé]e|(?:III\.?\s*Maccabé|3\.?\s*Maccabé)e|3[eè]me\s*Maccab[eé]e|III\.?\s*Macabeu|3e\.?\s*Maccab[eé]e|3o\.?\s*Macabeu|3\.?\s*Macabeu)s|III\.?\s*Makkabee[eë]n|(?:III\.?\s*Макавеј|3\.?\s*Макавеј)ска|(?:III\.?\s*Макаб|3\.?\s*Макаб)ејаца|المكابين\s*الثالث|III(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|(?:(?:III\.?\s*Maccc|3\.?\s*Maccc)abb|(?:III\.?\s*Maccabbb|3\.?\s*Maccabbb))e|(?:III\.?\s*Maccc|3\.?\s*Maccc)abee?|(?:III\.?\s*Macabbb|3\.?\s*Macabbb)ee?|3rd\.\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|3rd\.\s*Mac(?:cabeee|abb?eee)|3o\.?\s*Maccab(?:bee?o|ee?o)|3(?:\.[oº]|º)\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|3rd\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|3o\.?\s*Macabbee?os|3e\.?\s*Makkabee[eë]n|Wamakabayo\s*III|(?:3(?:(?:(?:-?е\.?\s*Макк|\.\s*Макк)|\s*Макк)авее|(?:-?я|[ея])\.?\s*Маккавее)|III(?:\.\s*Макаве[ії]|\s*Макаве[ії])|3\.?\s*Макаве[ії])в|3rd\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|3\.?\s*Maccab(?:bee?o|eo)|3rd\s*Mac(?:cabeee|abb?eee)|3o\.?\s*Macabbee?o|3\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|3\.?\s*Makkabaeer|Γ['ʹʹ΄’]\s*Μακκαβα[ίι]ων|Μακκαβα[ίι]ων\s*Γ['ʹʹ΄’]|3-?е\.?\s*Макаве[ії]в|(?:III\.?\s*Макавеј|3\.?\s*Макавеј)а|3\.?\s*Macc(?:ab(?:bee?|e))?|3\.?\s*Maccabee[eo]|3\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|Harmadik\s*Mak|3\.?\s*Maccabees|3\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|3a\.\s*Macabeus|3°\.\s*Maccabei|3\.?\s*Makkabaer|3\.?\s*Makkabäer|ספר\s*מקבים\s*ג['’]|3\.?\s*Maccabee|3\.?\s*Macab(?:bee?|ee?)|3o\.?\s*Macabeo|3(?:\s*(?:(?:மக்கபேயர்|Mc[bh]|Мк)|มัคคาบี)|\.\s*มัคคาบี|마카)|3a\s*Macabeus|3°\s*Maccabei|חשמונאים\s*ג['’]|III\.?\s*Maccc|3\.?\s*Макавеи|3\.?\s*Makabe|Derde\s*Mak|3\.?\s*Maccc|3(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:ac(?:h|k)?|c)?|makk|Макк?|மக்)|Makk?))|3e\.?\s*Mak|Γ['ʹʹ΄’]\s*Μακκ|《3Macc》|מקבים\s*ג|マカ(?:[ヒビ]ー第三書|[ハバ]イ[\s*記]3)|마카베오\s*3서|《3Macc|3Macc》|3Macc))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["4Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Четв(?:ърт(?:а\s*(?:книга\s*на\s*Макавеите|Макавеи)|о\s*Макавеи)|ерта\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|рта\s*Мака(?:веј(?:ск)?|бејац)а)|Czwarta\s*Ks(?:i[eę]g[ai]\s*Machabejska|\.?\s*Machabejska)|Qua(?:rt(?:o\s*(?:libro\s*dei\s*)?Maccabei|a\s*Maccabei)|tri[eè]me(?:s\s*Maccab[eé]es|\s*Maccab[eé]es)|rt[ao]\s*Macabeus)|[SŠ]tvrt[aá]\s*(?:kniha\s*)?Machabejcov|Kitabu\s*cha\s*Wamakabayo\s*IV|(?:Nelj[aä]s\s*makkabilaiskirj|(?:(?:IV\.?\s*m|4\.\s*m)|4\s*m)akkabilaiskirj)a|(?:IV\.?\s*K|4\.?\s*K)s(?:i[eę]g[ai]\s*Machabejska|\.?\s*Machabejska)|(?:Fj[aä]rde\s*Mackab[eé]erboke|4(?:\.\s*Mackab[eé]erboke|(?:\s*Mackab[eé]erboke|(?:\.\s*Makkabee[eë]|\s*Makkabee[eë]))))n|Liber\s*IV\s*Maccabaeorum|(?:Liber\s*Maccabaeorum|Ma(?:chabaeorum|kkabeusok))\s*IV|(?:I(?:kaapat\s*Mg|V\.?\s*Mg)a\s*Macabe|4\.?\s*Mga\s*Macabe)o|F(?:j(?:erde\s*Makkab(?:æerbog|eerbok)|[oó]rða\s*Makkabeab[oó]k)|ourth\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s))))|(?:Cuarto\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|(?:Ikaapat\s*Macabe|4o\.?\s*Macabee)o|4(?:\.[oº]|º)\.\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|IV(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|4o\.?\s*Maccab(?:bee?o|ee?o)|4(?:\.[oº]|º)\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|4\.?\s*Maccab(?:bee?o|eo)|4o\.?\s*Macabbee?o|4\.?\s*Maccabee[eo]|4\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|4o\.?\s*Macabeo)s|Vier(?:te(?:[ns]\s*Makkab(?:aee?|äe)r|\s*Makkab(?:aee?|äe)r)|de\s*Makkabee[eë]n)|(?:IV\.?\s*к|4\.?\s*к)нига\s*Макаве[ії]в|Cuarto\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|Ctvrt[aá]\s*Makabejsk[aá]|Čtvrt[aá]\s*Makabejsk[aá]|F(?:ourth\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|jerde\s*Makk)|4\s*k\.\s*Machabejcov|(?:IV(?:\.\s*Mach?aba|\s*Mach?aba)|(?:4\.\s*Macha|(?:4\.?\s*Maca|4\s*Macha))ba)eorum|(?:Ikaapat\s*Macabe|4o\.?\s*Macabee)o|4(?:\.[oº]|º)\.\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|4th\.\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|4\.?\s*Makkabæerbog|(?:(?:IV\.?\s*Makkabeus|4\.?\s*Makkabeus)o|4\.?\s*Makkabeerbo|Nne\s*Ma)k|4(?:e(?:me)?|ème)\.\s*Maccab[eé]es|(?:IV\.?\s*Machabe|4\.?\s*Machabe)jcov|4\s*k\s*Machabejcov|المكابين\s*الرابع|IV(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|4o\.?\s*Maccab(?:bee?o|ee?o)|4(?:\.[oº]|º)\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|4th\.\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|IV(?:\.\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи)|\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи))|(?:IV\.?\s*W|4\.?\s*W)amakabayo|Nne\s*Wamakabayo|(?:IV\.?\s*Maccc|4\.?\s*Maccc)abbbe|(?:(?:IV\.?\s*Maccc|4\.?\s*Maccc)abb|(?:IV\.?\s*Maccabbb|4\.?\s*Maccabbb))e[es]|(?:IV\.?\s*Maccc|4\.?\s*Maccc)abe(?:e[es]|s)|(?:IV\.?\s*Macabbb|4\.?\s*Macabbb)e(?:e[es]|s)|4th\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|IV\.?\s*Makkabee[eë]n|(?:IV\.?\s*Makabej|4\.?\s*Makabej)sk[aá]|4(?:e(?:me)?|ème)\s*Maccab[eé]es|(?:IV\.?\s*Макавеј|4\.?\s*Макавеј)ска|(?:IV\.?\s*Макаб|4\.?\s*Макаб)ејаца|(?:4(?:-?[ея]\.?\s*Маккавее|[ея]\.?\s*Маккавее|\.?\s*Маккавее)|IV(?:\.\s*Макаве[ії]|\s*Макаве[ії])|4\.?\s*Макаве[ії])в|IV(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|4\.?\s*Maccab(?:bee?o|eo)|4o\.?\s*Macabbee?o|(?:(?:IV\.?\s*Maccc|4\.?\s*Maccc)abb|(?:IV\.?\s*Maccabbb|4\.?\s*Maccabbb))e|(?:IV\.?\s*Maccc|4\.?\s*Maccc)abee?|(?:IV\.?\s*Macabbb|4\.?\s*Macabbb)ee?|4th\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|4\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|4\.?\s*Makkabaeer|Δ['ʹʹ΄’]\s*Μακκαβα[ίι]ων|(?:IV\.?\s*Maccabé|4\.?\s*Maccabé)es|Wamakabayo\s*IV|Μακκαβα[ίι]ων\s*Δ['ʹʹ΄’]|4\.?\s*Macc(?:ab(?:bee?|e))?|4\.?\s*Maccabee[eo]|4\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|4\.?\s*Maccabees|4\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|4\.?\s*Makkabaer|4\.?\s*Makkabäer|4°\.\s*Maccabei|(?:4o\.?\s*Macabeu|IV\.?\s*Macabeu|4a\.?\s*Macabeu|4\.?\s*Macabeu)s|ספר\s*מקבים\s*ד['’]|(?:IV\.?\s*Макавеј|4\.?\s*Макавеј)а|4\.?\s*Maccabee|4\.?\s*Macab(?:bee?|ee?)|4o\.?\s*Macabeo|4(?:\s*(?:(?:மக்கபேயர்|Mc[bh]|Мк)|มัคคาบี)|\.\s*มัคคาบี|마카)|4°\s*Maccabei|חשמונאים\s*ד['’]|Vierde\s*Mak|Ctvrt[aá]\s*Mak|Čtvrt[aá]\s*Mak|4\.?\s*Макавеи|4\.?\s*Makabe|IV\.?\s*Maccc|4\.?\s*Maccc|4(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:ac(?:h|k)?|c)?|makk|Макк?|மக்)|Makk?))|Δ['ʹʹ΄’]\s*Μακκ|《4Macc》|מקבים\s*ד|マカ(?:[ヒビ]ー第四書|[ハバ]イ[\s*記]4)|마카베오\s*4서|《4Macc|4Macc》|4Macc))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Ensimm[aä]inen\s*makkabilaiskirj|(?:(?:1\.\s*m|I\.?\s*m)|1\s*m)akkabilaiskirj)a|P(?:ierwsz[aey]\s*Ks(?:i[eę]g[ai]\s*Machabejska|\.?\s*Machabejska)|r(?:va\s*knjiga\s*o\s*Makabejcima|(?:im(?:o\s*(?:libro\s*dei\s*)?Maccabei|a\s*Maccabei)|v(?:[aá]\s*kniha\s*Machabejcov|[yý]\s*(?:list\s*)?Machabejcov|n[ií]\s*Makabejsk[aá]|[aá]\s*Machabejcov|[aá]\s*Makabejcov)|emi(?:er(?:e(?:s\s*Maccab[eé]es|\s*Maccab[eé]es)|(?:s\s*Maccab[eé]es|\s*Maccab[eé]es))|ère(?:s\s*Maccab[eé]es|\s*Maccab[eé]es))|imeir[ao]\s*Macabeus)))|П(?:ер(?:вая\s*книга\s*Маккаве[ий]ская|ш[ае]\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в))|ърв(?:а\s*(?:книга\s*(?:на\s*Макавеите|Макаве[ий]ска)|Макавеи)|о\s*Макавеи)|(?:рва\s*Мака(?:бејац|веј)|рва\s*Макавејск)а)|(?:(?:Kitabu\s*cha\s*)?Wamakabayo|Makkabeusok)\s*I|F(?:[oö]rsta\s*Mackab[eé]erboken|ørste\s*Makkabæerbog|irst\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s)))|(?:1\.?\s*K|I\.?\s*K)s(?:i[eę]g[ai]\s*Machabejska|\.?\s*Machabejska)|Liber\s*(?:I\s*Maccabaeorum|Maccabaeorum\s*I)|1-?(?:ше|а)\.\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|(?:F(?:ørste\s*Makkabeerbo|yrsta\s*Makkabeab[oó])|(?:(?:Els[oő]\s*Makkabeus|(?:1\.?\s*Makkabeu|I\.?\s*Makkabeu)s)|1\.?\s*Makkabeerb)o)k|(?:Primer(?:o\s*Mac(?:cabb?ee|abb?ee)|\s*Mac(?:cabb?ee|abb?ee))|1(?:\.[oº]|º)\.\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Maccabb?ee|1(?:\.[oº]|º)\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Macabbee|1o\.?\s*Macabee)os|(?:1(?:-?е\.?\s*к|\.?\s*к)|I\.?\s*к)нига\s*Макаве[ії]в|1-?(?:ше|а)\s*(?:книга\s*Макаве[ії]в|Макаве[ії]в)|(?:Primer(?:o\s*Mac(?:cabb?ee|abb?ee)|\s*Mac(?:cabb?ee|abb?ee))|1(?:\.[oº]|º)\.\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Maccabb?ee|1(?:\.[oº]|º)\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Macabbee|1o\.?\s*Macabee)o|(?:Primer(?:o\s*Mac(?:cabb?eo|abb?eo)|\s*Mac(?:cabb?eo|abb?eo))|First\s*Mac(?:cabeee|abb?eee)|1st\.\s*Mac(?:cabeee|abb?eee)|1(?:\.[oº]|º)\.\s*Mac(?:cabb?eo|abb?eo)|1\.?\s*Maccab(?:bee?o|eo)|I(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|1st\s*Mac(?:cabeee|abb?eee)|1o\.?\s*Maccabb?eo|1(?:\.[oº]|º)\s*Mac(?:cabb?eo|abb?eo)|1\.?\s*Maccabee[eo]|1\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|1o\.?\s*Macabbeo|1o\.?\s*Macabeo)s|سفر\s*المكابين\s*الأول|Primer(?:o\s*Mac(?:cabb?eo|abb?eo)|\s*Mac(?:cabb?eo|abb?eo))|Erste(?:[nrs]\s*Makkab(?:aee?|äe)r|\s*Makkab(?:aee?|äe)r)|(?:Eerste\s*Makkabee[eë]|1e\.\s*Makkabee[eë]|1(?:\.\s*Makkabee[eë]|\s*Makkabee[eë])|I\.?\s*Makkabee[eë]|1e\s*Makkabee[eë])n|1\.\s*Mackab[eé]erboken|(?:Kwanza\s*W|(?:1\.?\s*W|I\.?\s*W))amakabayo|Una(?:ng\s*M(?:ga\s*Macabeo|acabeos)|\s*M(?:ga\s*Macabeo|acabeos))|1\s*Mackab[eé]erboken|1\s*k\.\s*Machabejcov|F(?:irst\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|ørste\s*Makk)|First\s*Mac(?:cabeee|abb?eee)|1st\.\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|1\.?\s*Makkabæerbog|1\s*k\s*Machabejcov|1(?:(?:ere?|re)|ère)\.\s*Maccab[eé]es|(?:(?:1\.\s*Macha|(?:1\.?\s*Maca|1\s*Macha))ba|I(?:\.\s*Mach?aba|\s*Mach?aba))eorum|1st\.\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|1st\.\s*Mac(?:cabeee|abb?eee)|1(?:\.[oº]|º)\.\s*Mac(?:cabb?eo|abb?eo)|1st\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|(?:1\.?\s*Machabe|I\.?\s*Machabe)jcov|1(?:(?:ere?|re)|ère)\s*Maccab[eé]es|(?:1\.?\s*Mg|I\.?\s*Mg)a\s*Macabeo|Machabaeorum\s*I|(?:1(?:(?:(?:-?е\.?\s*Макк|\.\s*Макк)|\s*Макк)авее|(?:-?я|[ея])\.?\s*Маккавее)|1\.?\s*Макаве[ії]|I(?:\.\s*Макаве[ії]|\s*Макаве[ії]))в|المكابين\s*الأول|1st\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|1\.?\s*Maccab(?:bee?o|eo)|I(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|1st\s*Mac(?:cabeee|abb?eee)|1o\.?\s*Maccabb?eo|1(?:\.[oº]|º)\s*Mac(?:cabb?eo|abb?eo)|Una(?:ng)?\s*Macabeo|1\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|I(?:\.\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи)|\s*(?:Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|Макавеи))|1\.?\s*Makkabaeer|(?:1\.?\s*Maccc|I\.?\s*Maccc)abbbe|(?:(?:1\.?\s*Maccc|I\.?\s*Maccc)abb|(?:1\.?\s*Maccabbb|I\.?\s*Maccabbb))e[es]|(?:1\.?\s*Maccc|I\.?\s*Maccc)abe(?:e[es]|s)|(?:1\.?\s*Macabbb|I\.?\s*Macabbb)e(?:e[es]|s)|(?:1\.?\s*Makabej|I\.?\s*Makabej)sk[aá]|Α['ʹʹ΄’]\s*Μακκαβα[ίι]ων|Μακκαβα[ίι]ων\s*Α['ʹʹ΄’]|(?:1\.?\s*Макаб|I\.?\s*Макаб)ејаца|(?:1\.?\s*Макавеј|I\.?\s*Макавеј)ска|1-?е\.?\s*Макаве[ії]в|1\.?\s*Macc(?:ab(?:bee?|e))?|I(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|(?:(?:1\.?\s*Maccc|I\.?\s*Maccc)abb|(?:1\.?\s*Maccabbb|I\.?\s*Maccabbb))e|(?:1\.?\s*Maccc|I\.?\s*Maccc)abee?|(?:1\.?\s*Macabbb|I\.?\s*Macabbb)ee?|1\.?\s*Maccabee[eo]|1\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|1o\.?\s*Macabbeo|1\.?\s*Maccabees|1\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|1\.?\s*Makkabaer|1\.?\s*Makkabäer|1°\.\s*Maccabei|(?:1o\.?\s*Macabeu|1a\.\s*Macabeu|1\.?\s*Macabeu|I\.?\s*Macabeu|1a\s*Macabeu)s|(?:1\.?\s*Maccabé|I\.?\s*Maccabé|Maccabe)es|ספר\s*מקבים\s*א['’]|1\.?\s*Maccabee|1\.?\s*Macab(?:bee?|ee?)|1o\.?\s*Macabeo|1(?:\s*(?:மக்கபேயர்|المكابيين|Mc[bh]|Мк|مك)|\.\s*มัคคาบี|\s*มัคคาบี|Macc|마카)|1°\s*Maccabei|חשמונאים\s*א['’]|(?:1\.?\s*Макавеј|I\.?\s*Макавеј)а|E(?:erste\s*Mak|ls[oő]\s*Mak)|1\.?\s*Макавеи|Kwanza\s*Mak|1\.?\s*Makabe|Prvn[ií]\s*Mak|1\.?\s*Maccc|I\.?\s*Maccc|마카베오(?:기\s*상권|상)|1(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:a(?:c(?:h|k)?)?|c)?|makk|Макк?|மக்)|Makk?))|1e\.\s*Mak|Α['ʹʹ΄’]\s*Μακκ|מקבים\s*א|マカ(?:[ヒビ]ー第一書|[ハバ]イ(?:\s*1|記[1上]|上))|1e\s*Mak|《瑪加伯上》|《瑪加伯上|瑪加伯上》|瑪加伯上))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Judg"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Thủ\s*lãnh|(?:ந(?:ியாயாதிபதிகள(?:ின்\s*புத்தக|்\s*ஆகம)ம்|ீதி(?:த்\s*தலைவர்|பதி)கள்)|ବିଗ୍ଭରକର୍ତ୍ତାମାନଙ୍କ\s*ବିବରଣ|n(?:y[aā]yakartt[aā]har[uū]ko\s*pustak|iāīāṃ\s*dī\s*potʰī)|К(?:нига\s*(?:на\s*(?:израелеви\s*судии|съдиите)|С(?:уд(?:е[ий]\s*Израилевых|дів)|ъдии\s*Израилеви))|њига\s*о\s*судијама)|न्याय(?:कर्त(?:्त)?ाहरूको\s*पुस्तक|िय(?:\s*का\s*विर्तान्त|ों))|n(?:y[aā]yakartt[aā]har[uū]ko|iāīāṃ)|न्यायकर्त(?:्ताहरूको|ा)|(?:Tuomarien\s*kirj|Xaakinnad|Sudcovi|Da(?:annat|n))a|K(?:n(?:jiga\s*o\s*Sucima|yha\s*Suddiv)|s(?:i[eę]g[ai]\s*S[eę]dzi[oó]w|\.\s*S[eę]dzi[oó]w|\s*S[eę]dzi[oó]w)|\.?\s*sudcov)|N(?:iyāyātipatikaḷ|yayiyon)|С(?:ъдии\s*Израилев|удь)и|ਨਿਆਂ?ਈਆਂ\s*ਦੀ\s*ਪੋਥੀ|ந(?:ியா(?:யாதிபதிகள்)?|ீத)|(?:M(?:ga\s*(?:Maghuh|H)uko|aghuhuko)|Hakim-?haki|Para\s*Haki|H(?:uko|k))m|Li(?:ber\s*Iudicum|v\s*Ch[eè]f\s*yo)|(?:Dommernes\s*bo|B(?:ír[aá]|ir[aá]))k|Các\s*(?:quan\s*xét|Thủ\s*lãnh)|Книга\s*Суде[ий]|J(?:udecatorii|dgs|gs|ij|[cz])|(?:D(?:om(?:merbog|arbok)e|omarab[oó]ki|ómarab[oó]ki|a(?:(?:v(?:aran|r)|voor)a|w(?:oo|a)ra))|Thẩm\s*phá|Quan\s*á)n|ผู้วินิจฉัย|J(?:u(?:decatori|ec|dg|[ií]z|e|g)|d?g)|(?:Judecător|Giudic|Suc)i|سفر\s*القضاة|D(?:om(?:mer(?:nes?)?)?|omarab[oó]k|óm(?:arab[oó]k)?|avaran)|Tuom(?:arien)?|R(?:ichteren|echters)|Gjyqtar[eë]t|R(?:ich(?:t(?:ere?)?)?|echt)|Davarane|داو(?:[او]ر(?:انه|ن)|ر(?:ان[نه]|اان|ران|ن))|Hak\.?-?hak|داو(?:[او]ران|ر(?:ان)?)?|Barnwyr|Waamuzi|S[eę]dzi[oó]w|Iudicum|S(?:ud(?:cov)?|[eę]dz|d)|S(?:oudc[uů]|d[cz])|Ju(?:(?:ec|dg|g)|[ií]z)es|Κριτ(?:α[ίι]|[έε]ς)|Суд(?:и(?:ј[ае]|и)|е[ий])|שופטים|शास्ते|القضاة|Суддів|С(?:ъд(?:ии)?|уд)|ق(?:ُضاۃ|ضا[ةہۃ])|[sŝ][aā]ste|(?:《士(?:师记|師記)|士(?:師記|师记))》|《?民長紀》|qużāh|B(?:arn|ír)|Quan|Waam|Xaak|Κρ(?:ιτ)?|《士(?:师记|師記)|《?民長紀|Gjy|H[au]k|Iud|Mag|士(?:師記|师记)|Amu|Gdc|Thủ|《士》|판관기|วนฉ|사사기|士師?|قض|《士|판관|士》|삿))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mark"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:Mabuting\s*Balita\s*ayon\s*kay\s*(?:San\s*Mar[ck]|Mar[ck])o|E(?:(?:(?:banghelyo\s*ayon\s*kay\s*Marc|banghelyo\s*ni\s*(?:San\s*Mar[ck]|Mar[ck]))|vangelio\s*de\s*Marc)|l\s*Evangelio\s*de\s*Marc)o|S(?:ulat\s*ni\s*S)?an\s*Marco|M(?:ar(?:cou|koo|q(?:ou|uo))|rco))s|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k)|of\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k))|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r)|of\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r))|m(?:ark[aā]ne\s*lihilele\s*[sŝ]ubʰavartam[aā]n|ār(?:k[aā]ne\s*lihilele\s*[sŝ]ubʰavartam[aā]n|qūsi)|ar(?:k(?:(?:usle\s*lekʰeko\s*susm[aā]c[aā]r|ūsle\s*lekʰeko\s*susm[aā]c[aā]r)|us\s*dī\s*ĩjīl)|qus\s*kī\s*injīl))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k)|of\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r)|of\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r))|Evankeliumi\s*Markuksen\s*mukaan|म(?:ार(?:्काने\s*लिहिलेले\s*शुभवर्तमान|क)|र्कू(?:स(?:ले\s*लेखे)?को\s*सुसमाचार|श))|Evangelium\s*secundum\s*Marcum|E(?:w(?:angelia\s*w(?:edług\s*[sś]w\.|g\s*[sś]w\.)|\.)|van(?:gelium\s*podle|jelium\s*Pod[lľ]a))\s*Marka|Das\s*Evangelium\s*nach\s*Markus|Ewangelia\s*w(?:edług\s*[sś]w\s*|g\s*[sś]w\s*)Marka|От\s*Марка\s*свето\s*Евангелие|Evangelie\s*volgens\s*Mar[ck]us|Евангелие(?:то\s*според\s*Марко|\s*(?:според\s*Марко|от\s*Марк[ао]))|மாற்கு\s*(?:எழுதிய\s*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|Evangeliet\s*etter\s*Markus|Євангелі[яє]\s*від\s*(?:св\.?\s*Марка|Марка)|Evangelium\s*nach\s*Markus|M(?:arkuksen\s*evankeliumi|āṛku\s*Naṛceyti|ar(?:c(?:oose|us)e|q(?:o(?:ose|s)e|uss)|k(?:uss|os|a)|cos)|arek|á(?:ccô|rk)|rk|[ck])|ମାର୍କ\s*ଲିଖିତ\s*ସୁସମାଗ୍ଭର|Jevan(?:helije\s*vid\s*Marka|đelje\s*po\s*Marku)|Vangelo\s*di\s*(?:San\s*)?Marco|พระวรสารนักบุญมาร์ค|Mark(?:ovo|us)\s*evangelium|Evan[ðđ]elje\s*po\s*Marku|הבשורה\s*על[\s*-]פי\s*מרקוס|Јеванђеље\s*по\s*Марку|Mark[uú]sarguðspjall|Ungjilli\s*i\s*Markut|Еванђеље\s*по\s*Марку|Markusevangelium|Markusevangeliet|Injili\s*ya\s*Marko|Ewangelia\s*Marka|م(?:ر(?:ق(?:ُس\s*کی\s*انجیل|س\s*کی\s*انجیل|سی|ص)|(?:قو|ک)س)|َرق(?:ُسه|و[سص]|سه|ص))|ਮਰਕੁਸ\s*ਦੀ\s*ਇੰਜੀਲ|Injil\s*Markus|Κατ[άα]\s*Μ[άα]ρκον|Saint\s*M(?:ar|r?)k|إنجيل\s*مرقس|M(?:ar(?:k(?:u(?:ksen|s)?|o)?|c(?:oose|us)|c(?:o(?:os)?|u)?|q(?:oo?s|us)?)?|āṛku|rc?|ác)|Saint\s*Ma?r|マルコ(?:による福音書|[の傳]福音書|福音書|[伝書])|(?:Marqqoos|Ew\s*Mark)a|Від\s*Марка|m(?:ark(?:us(?:le)?|ūsle)|ark[aā]ne|ār(?:k[aā]ne|qūs?))|म(?:ार्क(?:ाने)?|र्कूस(?:ले)?)|От\s*Марка|St\.\s*M(?:ar|r?)k|St\.\s*Ma?r|마(?:르코\s*|가)복음서|《?馬(?:爾谷|可)福音》|St\s*M(?:ar|r?)k|م(?:َر(?:قُو|[كک]ُ)|ر(?:ق(?:ُو|ّ)|ك))س|Marakus|م(?:َرقُ?س|ر(?:ق(?:ُس|س)?|قو|ک)?)|Ew\s*Mar|마(?:르(?:코\s*복음)?|가(?:복음)?)|மாற்(?:கு)?|《?馬(?:爾谷|可)福音|St\s*Ma?r|Μ(?:[άα]ρκος|ρ)|ม(?:าระโ)?ก|《?马可福音》|मर्?कुस|र्मकू?स|《?马可福音|ਮਰਕੁਸ|ମାର୍କ|М(?:арк[oао]|[кр])|(?:《?瑪爾克|《?可)》|מרקוס|Μ[άα]ρκ|Марк|《?瑪爾克|マルコ|《?可|막))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jas"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:List\s*(?:powszechny\s*[SŚ]wi[eę]tego\s*Iakuba\s*Apostoł|[sś]w\.?\s*Jakub)|Jakovljeva\s*poslanic|y(?:akob[aā]ce[mṃ]\s*patr|āk(?:ob[aā]ce[mṃ]\s*patr|[uū]bko\s*patr)|ak[uū]bko\s*patr))a|С(?:оборне\s*послання\s*(?:св\.?\s*апостола\s*Я|Я)кова|ъборно\s*послание\s*на\s*св(?:\.\s*ап\.?\s*Иакова|\s*ап\.?\s*Иакова))|யாக(?:(?:்கோபு\s*(?:எழுதிய\s*)?திருமுக|்கோபு\s*எழுதிய\s*(?:நிருப|கடித))|ப்பர்\s*திருமுக)ம்|Poslannja\s*apostola\s*Jakova|П(?:ослание\s*на\s*(?:апостол\s*Ја|Я)|исмо\s*од\s*апостол\s*Ја)ков|Y(?:ākkōpu\s*Eḻutiya\s*Nirupam|a(?:aqoob(?:ey|[ai])|q(?:o(?:ob(?:e[ehy]|i)|ub)|ub(?:e[eh]|i))|(?:cquu|k(?:oo|u))b|kobo)|k)|Hið\s*almenna\s*br[eé]f\s*Jakobs|Послання\s*(?:апостола\s*)?Якова|(?:Посланица\s*Јаковље|Јаковље|(?:Јаков|Иак)о)ва|(?:Lettera\s*di\s*Giacom|(?:Sant|T)iag|Giacom)o|رسالة\s*(?:القديس\s*)?يعقوب|y(?:a(?:ʿqūb\s*kā\s*ʿām\s*ḫaṭ|['’]qūbi)|ākūb\s*dī\s*pattrī)|یعق(?:و(?:ب\s*کا\s*عا\s*م\s*خط|(?:ب\s*کا\s*عام\s*خط|(?:ب(?:ا[ءت]|ته|[ئهىی])|پ[هی])))|ُوب\s*کا\s*عام\s*خط)|Ιακ(?:ωβου\s*Επιστολη|ώβου)|Waraka\s*wa\s*Yakobo|Epistula\s*Iacobi|ਯਾਕੂਬ\s*ਦੀ\s*ਪੱਤ੍ਰੀ|Barua\s*ya\s*Yakobo|Послание\s*Иакова|J(?:a(?:k(?:ob(?:(?:s(?:\s*epistel|br[eé]fið)|usbrief|it)|sbrevet)|ub(?:ov\s*List|a))|akobin\s*kirje|s)|(?:ame|m)s|k)|याक(?:(?:ोबाचें|ूबको)\s*पत्र|़ोब)|(?:Layang\s*Yakobu|Ja(?:c?que|cobu)|Yakobu)s|ଯାକୁବଙ୍କ\s*ପତ୍ର|List\s*Jakub(?:[uů]v|a)|Jak(?:obs\s*[Bb]re|ub[uů])v|J(?:a(?:k(?:o(?:vljeva|b(?:us|i|s)?)|ub(?:ov)?)?|ak(?:obin)?|cq?|m)?|ame|m)|אי?גרת\s*יעקב|y(?:akob[aā]ce[mṃ]|āk(?:ob[aā]ce[mṃ]|[uū]bko|ūb)|ak[uū]bko|a['’]qūb?)|याक(?:ोब(?:ाचें)?|ूब(?:को)?)|யாக்(?:கோபு)?|ଯାକୁବଙ୍କ|ヤコ[フブ](?:からの手紙|の手紙|の?書)|Y(?:a(?:aqoob|q(?:oob|ub)?|cq?|k)|ākkōpu)|Ιακωβου|G(?:ia(?:côbê|-?cơ)|[cm])|(?:Yaaqu|Iaco)bi|(?:Yaaqu|Iaco)b|یعق(?:و(?:ب(?:ا|ت)?|پ)?|ُوب)?|Jacobo|야고보(?:\s*서간|서)|(?:《雅各(?:伯書|[书書])|雅各(?:伯書|[书書]))》|Јак(?:ов)?|《雅各(?:伯書|[书書])|ਯਾਕੂਬ|Jakab|Ia(?:cov|go)|Як(?:ова|уб)|ย(?:ากอบ|[กบ])|《?亞适烏》|يعقوب|S(?:ant?|t)|Як(?:ов)?|雅各(?:伯書|[书書])|《?亞适烏|יעקב|Ia[cg]|Иак|ヤコ[フブ]|Stg|《雅》|᾿Ια|يع|《雅|야고|Tg|雅》|雅|약))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Amos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:ଆମୋଷ\s*ଭବିଷ୍ୟଦ୍ବକ୍ତାଙ୍କ\s*ପୁସ୍ତକ|К(?:нига\s*(?:на\s*пророк\s*Амоса?|пророка\s*Амоса)|њига\s*пророка\s*Амоса)|(?:Aamoksen\s*kirj|Ks(?:i[eę]g[ai]\s*Amos|\.?\s*Amos))a|Prophetia\s*Amos|आमोसको\s*पुस्तक|Liv\s*Am[oò]s\s*la|A(?:m(?:(?:o(?:s(?:['’]\s*(?:Bog|bok)|[aeiz])|xa)|ós|s)|oose)|amo(?:oo?se|use|s[es])|-?mốt)|عام(?:و(?:و(?:س(?:س(?:یی|[هہ])|ی[ہی]|[ـهہ])|و(?:س(?:سس|یی|[هہ])|وسہ))|س(?:(?:سیی|(?:س[سه]|یہ|[ـهہ]))|ییہ))|س)|سفر\s*عاموس|A(?:am(?:o(?:ksen|oo?s|s))?|m(?:o(?:s|x)?|ó)?)|عا(?:م(?:و(?:و(?:وس(?:س|ی)?|س(?:س|ی)?)|س(?:سی|(?:س|ی)?)))?)?|Caamoos|《?阿摩司[书書]》|(?:A(?:m(?:o(?:oo|u)|ò)|amoe)|ʿāmō|Ámó|āmo|Āmō)s|عامُوس|《?阿摩司[书書]|Ámosz|āmūsī|ஆமோஸ்|อ(?:าโ)?มส|アモス(?:しょ|書)|(?:《?亞毛斯|《?摩)》|Амоса|Ám(?:os)?|ām(?:ūs)?|Caam|आमोस|ଆମୋଷ|《?亞毛斯|Амос|Αμ[ωώ]ς|아모스서|עמוס|अमोस|ਆਮੋਸ|amos|아모스?|ஆமோ|アモス|Αμ|Ам|《?摩|Ἀμ|암))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Tob"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Cartea\s*lui\s*Tobit|Ks(?:i[eę]g[ai]\s*Tobi(?:asz|t)a|\.\s*Tobi(?:asz|t)a|\s*Tobi(?:asz|t)a)|К(?:нига\s*(?:(?:(?:на\s*Товита|за\s*Тобия)|на\s*Товит)|Товита)|њига\s*Товијина)|த(?:ொபியாசு\s*ஆகமம்|ோபித்து)|Tobi(?:aa?n|tin)\s*kirja|Liber\s*T(?:hobis|obiae)|T(?:obi(?:as['’]\s*b|ts\s*b)ok|ob(?:i(?:ts\s*Bog|ja[sš]|olo|a[eš]|e)|ías|t)|obitsb[oó]k|obítsb[oó]k|ób(?:i(?:tsb[oó]k|j[aá][sš])|ítsb[oó]k)|obij?á[sš]|ho|b)|سفر\s*طوبيا|T(?:ob(?:i(?:aa?n|t(?:in?)?|as?|ja)?|ía)?|ób(?:it)?)|Tóbi[aá]s|《多俾亞傳》|Товита|Тобија|《多俾亞傳|Товит|Τωβ[ίι]τ|Тобия|טוביה|โทบิต|多俾亞傳》|طوبيا|தோபி|多俾亞傳|ト[ヒビ]ト[書記]|Τωβ|Тов|ト[ヒビ]ト|토(?:빗기|비트)|طو|토빗))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jdt"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:K(?:niha\s*Juditina|s(?:i[eę]g[ai]\s*Judyty|\.?\s*Judyty)|itab\s*Yudit|\.\s*Juditina|\s*Juditina)|К(?:нига\s*(?:(?:за\s*Юдита|Иудит)|Юдити)|њига\s*о\s*Јудити)|(?:Juditin\s*kirj|Giuditt)a|Liber\s*Iudith|J(?:ud(?:it(?:s\s*Bog|[eh])|th)|udits\s*bok|uditarb[oó]k|udítarb[oó]k|úd(?:itarb[oó]k|ítarb[oó]k|t)|di?th)|سفر\s*يهوديت|யூதித்து|J(?:ud(?:it(?:in|a)?|t)|údit|di?t)|Yud(?:ith?i|t)|Yudith?|Iudit[ah]|Ι(?:ουδ[ίι]θ|δθ)|Judyty|יהודית|《友弟德傳》|يهوديت|Јудита|《友弟德傳|Юди(?:ти|фь)|ユ[テデ](?:ィト記|ト書)|ยูดิธ|友弟德傳》|Иудит|Юдит?|யூதி|ユ[テデ]ィト|友弟德傳|يـه|유딧기|(?:[GI]|Y)dt|유딧))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Книга\s*(?:(?:на\s*пророк\s*)?Варуха|пророка\s*Вару́ха|на\s*Барух)|Proroctvo\s*Baruchovo|K(?:niha\s*B[aá]ru(?:ch|k)ova|s(?:i[eę]g[ai]\s*Baruch|\.?\s*Baruch)a)|Baa?rukin\s*kirja|(?:Kitab\s*Baruk|Báruc)h|Liber\s*Baruch|พระธรรมบารุค|B(?:ar(?:u(?:(?:(?:k(?:s\s*Bog|[hu])|cha|que|h)|ks\s*bok)|ksb[oó]k)|úksb[oó]k)|áruk|r)|سفر\s*باروخ|B(?:a(?:arukin|rukin|r(?:u(?:ch?|k))?)?|ár)|பாரூக்கு|ספר\s*ברוך|ワルフの預言書|Бару́ха|Β(?:αρο[υύ]χ|ρ)|Варуха|Вар(?:ух)?|باروك|Барух|《巴路克》|บารุค|பாரூ|《巴路克|[ハバ]ルク書|巴路克》|ברוך|Βαρ|[ハバ]ルク|巴路克|바룩서|با|바룩))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:1(?:\s*(?:(?:Цар|Ks)|Re)|\.\s*(?:Ks|Re))|I(?:\.\s*K[is]|\s*K[is])))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:II\.?\s*Ks|2(?:\s*(?:Цар|Re)|\.\s*Re)|2\.?\s*Ks))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Acts"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Апостол|At))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek", "Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ez|Ез))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(拉)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hab", "Hag"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ha)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Heb", "Hab"],
        testament: "on",
        testament_books: { "Hab": "o", "Heb": "n" },
        regexp: /(?:^|(?<=[^\p{L}]))(Hb)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Job"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(伯)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Jan|yo|ИН|約))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John", "Jonah", "Job", "Josh", "Joel"],
        testament: "on",
        testament_books: { "Job": "o", "Joel": "o", "John": "n", "Jonah": "o", "Josh": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(Jo)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John", "Josh", "Joel", "Jonah"],
        testament: "on",
        testament_books: { "Joel": "o", "John": "n", "Jonah": "o", "Josh": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(யோ)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Yun)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah", "Joel"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Yoo)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Josh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(書)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude", "Judg"],
        testament: "on",
        testament_books: { "Jude": "n", "Judg": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:ud?|d))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Judg"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Bir)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(La)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lev"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Im|利))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(太)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt", "Mark", "Mal"],
        testament: "on",
        testament_books: { "Mal": "o", "Mark": "n", "Matt": "n" },
        regexp: /(?:^|(?<=[^\p{L}]))(Ma)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mic"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Mi)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil", "Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Phl?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rev"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Re)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rom"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(R)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Song"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:So(?:ngs|l)|பாடல்|Hoga|Ασ|歌))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Titus"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ti)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zeph", "Zech"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ze)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      }
    ];
  }
};

// build/bcv_translations.ts
var bcv_translations = class {
  constructor() {
    this.aliases = {
      asv: { alias: "kjv" },
      ceb: { alias: "ceb" },
      csb: { alias: "csb" },
      hcsb: { alias: "csb" },
      kjv: { alias: "kjv" },
      lxx: { alias: "nab" },
      nab: { alias: "nab" },
      nabre: { alias: "nab" },
      nas: { alias: "default", osis: "NASB" },
      net: { alias: "csb" },
      nirv: { alias: "kjv" },
      niv: { alias: "kjv" },
      nkjv: { alias: "kjv" },
      nlt: { alias: "nlt" },
      nrsv: { alias: "nrsv" },
      nrsvue: { alias: "nrsvue" },
      tniv: { alias: "kjv" },
      // `current` reflects whatever versification system is active. By default, it matches `default`. It's always fully specified.
      current: { alias: "current", osis: "" },
      // `default` is the fully specified default versification system (matching ESV).
      default: { alias: "default", osis: "" }
    };
    this.current_system = "default";
    this.definitions = {
      current: {},
      default: {
        order: {
          "Gen": 1,
          "Exod": 2,
          "Lev": 3,
          "Num": 4,
          "Deut": 5,
          "Josh": 6,
          "Judg": 7,
          "Ruth": 8,
          "1Sam": 9,
          "2Sam": 10,
          "1Kgs": 11,
          "2Kgs": 12,
          "1Chr": 13,
          "2Chr": 14,
          "Ezra": 15,
          "Neh": 16,
          "Esth": 17,
          "Job": 18,
          "Ps": 19,
          "Prov": 20,
          "Eccl": 21,
          "Song": 22,
          "Isa": 23,
          "Jer": 24,
          "Lam": 25,
          "Ezek": 26,
          "Dan": 27,
          "Hos": 28,
          "Joel": 29,
          "Amos": 30,
          "Obad": 31,
          "Jonah": 32,
          "Mic": 33,
          "Nah": 34,
          "Hab": 35,
          "Zeph": 36,
          "Hag": 37,
          "Zech": 38,
          "Mal": 39,
          "Matt": 40,
          "Mark": 41,
          "Luke": 42,
          "John": 43,
          "Acts": 44,
          "Rom": 45,
          "1Cor": 46,
          "2Cor": 47,
          "Gal": 48,
          "Eph": 49,
          "Phil": 50,
          "Col": 51,
          "1Thess": 52,
          "2Thess": 53,
          "1Tim": 54,
          "2Tim": 55,
          "Titus": 56,
          "Phlm": 57,
          "Heb": 58,
          "Jas": 59,
          "1Pet": 60,
          "2Pet": 61,
          "1John": 62,
          "2John": 63,
          "3John": 64,
          "Jude": 65,
          "Rev": 66,
          "Tob": 67,
          "Jdt": 68,
          "GkEsth": 69,
          "Wis": 70,
          "Sir": 71,
          "Bar": 72,
          "PrAzar": 73,
          "Sus": 74,
          "Bel": 75,
          "SgThree": 76,
          "EpJer": 77,
          "1Macc": 78,
          "2Macc": 79,
          "3Macc": 80,
          "4Macc": 81,
          "1Esd": 82,
          "2Esd": 83,
          "PrMan": 84
        },
        chapters: {
          "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
          "Exod": [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
          "Lev": [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
          "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
          "Deut": [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
          "Josh": [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
          "Judg": [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
          "Ruth": [22, 23, 18, 22],
          "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
          "2Sam": [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
          "1Kgs": [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
          "2Kgs": [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
          "1Chr": [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
          "2Chr": [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
          "Ezra": [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
          "Neh": [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
          "Esth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
          "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
          "Ps": [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
          "Prov": [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
          "Eccl": [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
          "Song": [17, 17, 11, 16, 16, 13, 13, 14],
          "Isa": [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
          "Jer": [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
          "Lam": [22, 22, 66, 22, 22],
          "Ezek": [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
          "Dan": [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
          "Hos": [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
          "Joel": [20, 32, 21],
          "Amos": [15, 16, 15, 13, 27, 14, 17, 14, 15],
          "Obad": [21],
          "Jonah": [17, 10, 10, 11],
          "Mic": [16, 13, 12, 13, 15, 16, 20],
          "Nah": [15, 13, 19],
          "Hab": [17, 20, 19],
          "Zeph": [18, 15, 20],
          "Hag": [15, 23],
          "Zech": [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
          "Mal": [14, 17, 18, 6],
          "Matt": [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
          "Mark": [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
          "Luke": [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
          "John": [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
          "Acts": [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
          "Rom": [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
          "1Cor": [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
          "Gal": [24, 21, 29, 31, 26, 18],
          "Eph": [23, 22, 21, 32, 33, 24],
          "Phil": [30, 30, 21, 23],
          "Col": [29, 23, 25, 18],
          "1Thess": [10, 20, 13, 18, 28],
          "2Thess": [12, 17, 18],
          "1Tim": [20, 15, 16, 16, 25, 21],
          "2Tim": [18, 26, 17, 22],
          "Titus": [16, 15, 15],
          "Phlm": [25],
          "Heb": [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
          "Jas": [27, 26, 18, 17, 20],
          "1Pet": [25, 25, 22, 19, 14],
          "2Pet": [21, 22, 18],
          "1John": [10, 29, 24, 21, 21],
          "2John": [13],
          "3John": [15],
          "Jude": [25],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 17, 15],
          "Jdt": [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25],
          "GkEsth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 13, 12, 6, 18, 19, 16, 24],
          "Wis": [16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31, 19, 29, 21, 25, 22],
          "Sir": [30, 18, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 34, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
          "Bar": [22, 35, 37, 37, 9],
          "PrAzar": [68],
          "Sus": [64],
          "Bel": [42],
          "SgThree": [39],
          "EpJer": [73],
          "1Macc": [64, 70, 60, 61, 68, 63, 50, 32, 73, 89, 74, 53, 53, 49, 41, 24],
          "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 45, 26, 46, 39],
          "3Macc": [29, 33, 30, 21, 51, 41, 23],
          "4Macc": [35, 24, 21, 26, 38, 35, 23, 29, 32, 21, 27, 19, 27, 20, 32, 25, 24, 24],
          "1Esd": [58, 30, 24, 63, 73, 34, 15, 96, 55],
          "2Esd": [40, 48, 36, 52, 56, 59, 70, 63, 47, 59, 46, 51, 58, 48, 63, 78],
          "PrMan": [15],
          "Ps151": [7]
          // Never actually a book; we add this to Psalms if needed.
        }
      },
      vulgate: {
        chapters: {
          "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 32, 25],
          "Exod": [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 36],
          "Lev": [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 45, 34],
          "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 34, 15, 34, 45, 41, 50, 13, 32, 22, 30, 35, 41, 30, 25, 18, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
          "Josh": [18, 24, 17, 25, 16, 27, 26, 35, 27, 44, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 43, 34, 16, 33],
          "Judg": [36, 23, 31, 24, 32, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 24],
          "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 43, 15, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
          "1Kgs": [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
          "1Chr": [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 46, 40, 14, 17, 29, 43, 27, 17, 19, 7, 30, 19, 32, 31, 31, 32, 34, 21, 30],
          "Neh": [11, 20, 31, 23, 19, 19, 73, 18, 38, 39, 36, 46, 31],
          "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 23, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 35, 28, 25, 16],
          "Ps": [6, 13, 9, 10, 13, 11, 18, 10, 39, 8, 9, 6, 7, 5, 10, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 26, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 13, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 26, 9, 10, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 11, 9, 14, 9, 6],
          "Eccl": [18, 26, 22, 17, 19, 11, 30, 17, 18, 20, 10, 14],
          "Song": [16, 17, 11, 16, 17, 12, 13, 14],
          "Jer": [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 20, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
          "Ezek": [28, 9, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
          "Dan": [21, 49, 100, 34, 31, 28, 28, 27, 27, 21, 45, 13, 65, 42],
          "Hos": [11, 24, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 15, 10],
          "Amos": [15, 16, 15, 13, 27, 15, 17, 14, 14],
          "Jonah": [16, 11, 10, 11],
          "Mic": [16, 13, 12, 13, 14, 16, 20],
          "Hag": [14, 24],
          "Matt": [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 26, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
          "Mark": [45, 28, 35, 40, 43, 56, 37, 39, 49, 52, 33, 44, 37, 72, 47, 20],
          "John": [51, 25, 36, 54, 47, 72, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
          "Acts": [26, 47, 26, 37, 42, 15, 59, 40, 43, 48, 30, 25, 52, 27, 41, 40, 34, 28, 40, 38, 40, 30, 35, 27, 27, 32, 44, 31],
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [25, 23, 25, 23, 28, 22, 20, 24, 12, 13, 21, 22, 23, 17],
          "Jdt": [12, 18, 15, 17, 29, 21, 25, 34, 19, 20, 21, 20, 31, 18, 15, 31],
          "Wis": [16, 25, 19, 20, 24, 27, 30, 21, 19, 21, 27, 27, 19, 31, 19, 29, 20, 25, 20],
          "Sir": [40, 23, 34, 36, 18, 37, 40, 22, 25, 34, 36, 19, 32, 27, 22, 31, 31, 33, 28, 33, 31, 33, 38, 47, 36, 28, 33, 30, 35, 27, 42, 28, 33, 31, 26, 28, 34, 39, 41, 32, 28, 26, 37, 27, 31, 23, 31, 28, 19, 31, 38, 13],
          "Bar": [22, 35, 38, 37, 9, 72],
          "1Macc": [67, 70, 60, 61, 68, 63, 50, 32, 73, 89, 74, 54, 54, 49, 41, 24],
          "2Macc": [36, 33, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 40]
        }
      },
      ceb: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 18, 15],
          "PrAzar": [67],
          "EpJer": [72],
          "1Esd": [55, 26, 24, 63, 71, 33, 15, 92, 55],
          "2Esd": [40, 48, 36, 52, 56, 59, 140, 63, 47, 60, 46, 51, 58, 48, 63, 78]
        }
      },
      csb: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
        }
      },
      kjv: {
        chapters: {
          "3John": [14]
        }
      },
      nab: {
        order: {
          "Gen": 1,
          "Exod": 2,
          "Lev": 3,
          "Num": 4,
          "Deut": 5,
          "Josh": 6,
          "Judg": 7,
          "Ruth": 8,
          "1Sam": 9,
          "2Sam": 10,
          "1Kgs": 11,
          "2Kgs": 12,
          "1Chr": 13,
          "2Chr": 14,
          "PrMan": 15,
          "Ezra": 16,
          "Neh": 17,
          "1Esd": 18,
          "2Esd": 19,
          "Tob": 20,
          "Jdt": 21,
          "Esth": 22,
          "GkEsth": 23,
          "1Macc": 24,
          "2Macc": 25,
          "3Macc": 26,
          "4Macc": 27,
          "Job": 28,
          "Ps": 29,
          "Prov": 30,
          "Eccl": 31,
          "Song": 32,
          "Wis": 33,
          "Sir": 34,
          "Isa": 35,
          "Jer": 36,
          "Lam": 37,
          "Bar": 38,
          "EpJer": 39,
          "Ezek": 40,
          "Dan": 41,
          "PrAzar": 42,
          "Sus": 43,
          "Bel": 44,
          "SgThree": 45,
          "Hos": 46,
          "Joel": 47,
          "Amos": 48,
          "Obad": 49,
          "Jonah": 50,
          "Mic": 51,
          "Nah": 52,
          "Hab": 53,
          "Zeph": 54,
          "Hag": 55,
          "Zech": 56,
          "Mal": 57,
          "Matt": 58,
          "Mark": 59,
          "Luke": 60,
          "John": 61,
          "Acts": 62,
          "Rom": 63,
          "1Cor": 64,
          "2Cor": 65,
          "Gal": 66,
          "Eph": 67,
          "Phil": 68,
          "Col": 69,
          "1Thess": 70,
          "2Thess": 71,
          "1Tim": 72,
          "2Tim": 73,
          "Titus": 74,
          "Phlm": 75,
          "Heb": 76,
          "Jas": 77,
          "1Pet": 78,
          "2Pet": 79,
          "1John": 80,
          "2John": 81,
          "3John": 82,
          "Jude": 83,
          "Rev": 84
        },
        chapters: {
          "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 54, 33, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
          "Exod": [22, 25, 22, 31, 23, 30, 29, 28, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 37, 30, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
          "Lev": [17, 16, 17, 35, 26, 23, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
          "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 35, 28, 32, 22, 29, 35, 41, 30, 25, 19, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
          "Deut": [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 31, 19, 29, 23, 22, 20, 22, 21, 20, 23, 29, 26, 22, 19, 19, 26, 69, 28, 20, 30, 52, 29, 12],
          "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
          "2Sam": [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
          "1Kgs": [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
          "2Kgs": [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
          "1Chr": [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
          "2Chr": [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
          "Neh": [11, 20, 38, 17, 19, 19, 72, 18, 37, 40, 36, 47, 31],
          "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 32, 26, 17],
          "Ps": [6, 11, 9, 9, 13, 11, 18, 10, 21, 18, 7, 9, 6, 7, 5, 11, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 27, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 14, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 20, 14, 9, 6],
          "Eccl": [18, 26, 22, 17, 19, 12, 29, 17, 18, 20, 10, 14],
          "Song": [17, 17, 11, 16, 16, 12, 14, 14],
          "Isa": [31, 22, 26, 6, 30, 13, 25, 23, 20, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 11, 25, 24],
          "Jer": [19, 37, 25, 31, 31, 30, 34, 23, 25, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
          "Ezek": [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 44, 37, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
          "Dan": [21, 49, 100, 34, 30, 29, 28, 27, 27, 21, 45, 13, 64, 42],
          "Hos": [9, 25, 5, 19, 15, 11, 16, 14, 17, 15, 11, 15, 15, 10],
          "Joel": [20, 27, 5, 21],
          "Jonah": [16, 11, 10, 11],
          "Mic": [16, 13, 12, 14, 14, 16, 20],
          "Nah": [14, 14, 19],
          "Zech": [17, 17, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
          "Mal": [14, 17, 24],
          "Acts": [26, 47, 26, 37, 42, 15, 60, 40, 43, 49, 30, 25, 52, 28, 41, 40, 34, 28, 40, 38, 40, 30, 35, 27, 27, 32, 44, 31],
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 17, 21, 6, 13, 18, 22, 18, 15],
          "Sir": [30, 18, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 33, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
          "Bar": [22, 35, 38, 37, 9, 72],
          "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 39]
        }
      },
      nlt: {
        chapters: {
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
        }
      },
      nrsv: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
        }
      },
      nrsvue: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 18, 15],
          "Bar": [22, 35, 38, 37, 9],
          "PrAzar": [67],
          "EpJer": [72],
          "1Esd": [55, 25, 23, 63, 70, 33, 15, 92, 55]
        }
      }
    };
    this.definitions.current = structuredClone(this.definitions.default);
  }
};

// build/bcv_grammar.js
function peg$subclass(child, parent) {
  function C() {
    this.constructor = child;
  }
  C.prototype = parent.prototype;
  child.prototype = new C();
}
function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}
peg$subclass(peg$SyntaxError, Error);
function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) {
    return str;
  }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}
peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, " ");
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = last - s.column || 1;
      str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};
peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return '"' + literalEscape(expectation.text) + '"';
    },
    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
      });
      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },
    any: function() {
      return "any character";
    },
    end: function() {
      return "end of input";
    },
    other: function(expectation) {
      return expectation.description;
    }
  };
  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }
  function literalEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
      return "\\x" + hex(ch);
    });
  }
  function classEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
      return "\\x" + hex(ch);
    });
  }
  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }
  function describeExpected(expected2) {
    var descriptions = expected2.map(describeExpectation);
    var i, j;
    descriptions.sort();
    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }
    switch (descriptions.length) {
      case 1:
        return descriptions[0];
      case 2:
        return descriptions[0] + " or " + descriptions[1];
      default:
        return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
    }
  }
  function describeFound(found2) {
    return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
  }
  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};
function peg$parse(input, options) {
  options = options !== void 0 ? options : {};
  var peg$FAILED = {};
  var peg$source = options.grammarSource;
  var peg$startRuleFunctions = { start: peg$parsestart };
  var peg$startRuleFunction = peg$parsestart;
  var peg$c0 = "(";
  var peg$c1 = ")";
  var peg$c2 = "";
  var peg$c3 = "/";
  var peg$c4 = ",";
  var peg$c5 = ".";
  var peg$c6 = "-";
  var peg$c7 = "th";
  var peg$c8 = "nd";
  var peg$c9 = "st";
  var peg$c10 = "/1";
  var peg$c11 = "ff";
  var peg$c12 = "f";
  var peg$c13 = "/9";
  var peg$c14 = "/2";
  var peg$c15 = ".1";
  var peg$c16 = "ch";
  var peg$c17 = "apters";
  var peg$c18 = "apter";
  var peg$c19 = "apts";
  var peg$c20 = "pts";
  var peg$c21 = "apt";
  var peg$c22 = "aps";
  var peg$c23 = "ap";
  var peg$c24 = "p";
  var peg$c25 = "s";
  var peg$c26 = "a";
  var peg$c27 = "v";
  var peg$c28 = "erses";
  var peg$c29 = "erse";
  var peg$c30 = "er";
  var peg$c31 = "ss";
  var peg$c32 = ":";
  var peg$c33 = "and";
  var peg$c34 = "compare";
  var peg$c35 = "cf";
  var peg$c36 = "see";
  var peg$c37 = "also";
  var peg$c38 = "through";
  var peg$c39 = "thru";
  var peg$c40 = "to";
  var peg$c41 = "title";
  var peg$c42 = "from";
  var peg$c43 = "of";
  var peg$c44 = "in";
  var peg$c45 = "the";
  var peg$c46 = "book";
  var peg$c47 = "";
  var peg$c48 = ",000";
  var peg$r0 = /^[1-8]/;
  var peg$r1 = /^[a-z0-9]/;
  var peg$r2 = /^[a-z]/;
  var peg$r3 = /^[0-9]/;
  var peg$r4 = /^[a-e]/;
  var peg$r5 = /^["']/;
  var peg$r6 = /^[,;\/:&\-\u2013\u2014~]/;
  var peg$r7 = /^[\-\u2013\u2014]/;
  var peg$r8 = /^[([]/;
  var peg$r9 = /^[)\]]/;
  var peg$r10 = /^[^\x1F\x1E([]/;
  var peg$r11 = /^[\s*]/;
  var peg$e0 = peg$literalExpectation("(", false);
  var peg$e1 = peg$literalExpectation(")", false);
  var peg$e2 = peg$literalExpectation("", false);
  var peg$e3 = peg$literalExpectation("/", false);
  var peg$e4 = peg$classExpectation([["1", "8"]], false, false);
  var peg$e5 = peg$literalExpectation(",", false);
  var peg$e6 = peg$literalExpectation(".", false);
  var peg$e7 = peg$literalExpectation("-", false);
  var peg$e8 = peg$literalExpectation("th", false);
  var peg$e9 = peg$literalExpectation("nd", false);
  var peg$e10 = peg$literalExpectation("st", false);
  var peg$e11 = peg$literalExpectation("/1", false);
  var peg$e12 = peg$literalExpectation("ff", false);
  var peg$e13 = peg$classExpectation([["a", "z"], ["0", "9"]], false, false);
  var peg$e14 = peg$literalExpectation("f", false);
  var peg$e15 = peg$classExpectation([["a", "z"]], false, false);
  var peg$e16 = peg$literalExpectation("/9", false);
  var peg$e17 = peg$literalExpectation("/2", false);
  var peg$e18 = peg$literalExpectation(".1", false);
  var peg$e19 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e20 = peg$classExpectation([["a", "e"]], false, false);
  var peg$e21 = peg$literalExpectation("ch", false);
  var peg$e22 = peg$literalExpectation("apters", false);
  var peg$e23 = peg$literalExpectation("apter", false);
  var peg$e24 = peg$literalExpectation("apts", false);
  var peg$e25 = peg$literalExpectation("pts", false);
  var peg$e26 = peg$literalExpectation("apt", false);
  var peg$e27 = peg$literalExpectation("aps", false);
  var peg$e28 = peg$literalExpectation("ap", false);
  var peg$e29 = peg$literalExpectation("p", false);
  var peg$e30 = peg$literalExpectation("s", false);
  var peg$e31 = peg$literalExpectation("a", false);
  var peg$e32 = peg$literalExpectation("v", false);
  var peg$e33 = peg$literalExpectation("erses", false);
  var peg$e34 = peg$literalExpectation("erse", false);
  var peg$e35 = peg$literalExpectation("er", false);
  var peg$e36 = peg$literalExpectation("ss", false);
  var peg$e37 = peg$literalExpectation(":", false);
  var peg$e38 = peg$classExpectation(['"', "'"], false, false);
  var peg$e39 = peg$classExpectation([",", ";", "/", ":", "&", "-", "–", "—", "~"], false, false);
  var peg$e40 = peg$literalExpectation("and", false);
  var peg$e41 = peg$literalExpectation("compare", false);
  var peg$e42 = peg$literalExpectation("cf", false);
  var peg$e43 = peg$literalExpectation("see", false);
  var peg$e44 = peg$literalExpectation("also", false);
  var peg$e45 = peg$classExpectation(["-", "–", "—"], false, false);
  var peg$e46 = peg$literalExpectation("through", false);
  var peg$e47 = peg$literalExpectation("thru", false);
  var peg$e48 = peg$literalExpectation("to", false);
  var peg$e49 = peg$literalExpectation("title", false);
  var peg$e50 = peg$literalExpectation("from", false);
  var peg$e51 = peg$literalExpectation("of", false);
  var peg$e52 = peg$literalExpectation("in", false);
  var peg$e53 = peg$literalExpectation("the", false);
  var peg$e54 = peg$literalExpectation("book", false);
  var peg$e55 = peg$classExpectation(["(", "["], false, false);
  var peg$e56 = peg$classExpectation([")", "]"], false, false);
  var peg$e57 = peg$literalExpectation("", false);
  var peg$e58 = peg$literalExpectation(",000", false);
  var peg$e59 = peg$classExpectation(["", "", "(", "["], true, false);
  var peg$e60 = peg$classExpectation([" ", "	", "\r", "\n", " ", "*"], false, false);
  var peg$f0 = function(val_1, val_2) {
    val_2.unshift([val_1]);
    var r = range();
    return { "type": "sequence", "value": val_2, "indices": [r.start, r.end - 1] };
  };
  var peg$f1 = function(val_1, val_2) {
    if (typeof val_2 === "undefined") val_2 = [];
    val_2.unshift([val_1]);
    var r = range();
    return { "type": "sequence_post_enclosed", "value": val_2, "indices": [r.start, r.end - 1] };
  };
  var peg$f2 = function(val_1, val_2) {
    if (val_1.length && val_1.length === 2) val_1 = val_1[0];
    var r = range();
    return { "type": "range", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f3 = function(val) {
    var r = range();
    return { "type": "b", "value": val.value, "indices": [r.start, r.end - 1] };
  };
  var peg$f4 = function(val_1, val_2) {
    var r = range();
    return { "type": "bc", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f5 = function(val_1, val_2) {
    var r = range();
    return { "type": "bc", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f6 = function(val_1, val_2) {
    var r = range();
    return { "type": "bc_title", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f7 = function(val_1, val_2) {
    var r = range();
    return { "type": "bcv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f8 = function(val_1, val_2) {
    var r = range();
    return { "type": "bcv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f9 = function(val_1, val_2) {
    var r = range();
    return { "type": "bcv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f10 = function(val_1, val_2, val_3, val_4) {
    var r = range();
    return { "type": "range", "value": [{ "type": "bcv", "value": [{ "type": "bc", "value": [val_1, val_2], "indices": [val_1.indices[0], val_2.indices[1]] }, val_3], "indices": [val_1.indices[0], val_3.indices[1]] }, val_4], "indices": [r.start, r.end - 1] };
  };
  var peg$f11 = function(val_1, val_2) {
    var r = range();
    return { "type": "bv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f12 = function(val_1, val_2) {
    var r = range();
    return { "type": "bc", "value": [val_2, val_1], "indices": [r.start, r.end - 1] };
  };
  var peg$f13 = function(val_1, val_2, val_3) {
    var r = range();
    return { "type": "cb_range", "value": [val_3, val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f14 = function(val_1, val_2) {
    var r = range();
    return { "type": "bcv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f15 = function(val_1, val_2) {
    var r = range();
    return { "type": "bc", "value": [val_2, val_1], "indices": [r.start, r.end - 1] };
  };
  var peg$f16 = function(val_1, val_2) {
    var r = range();
    return { "type": "bcv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f17 = function(val) {
    var r = range();
    return { "type": "c_psalm", "value": val.value, "indices": [r.start, r.end - 1] };
  };
  var peg$f18 = function(val_1, val_2) {
    var r = range();
    return { "type": "cv_psalm", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f19 = function(val_1, val_2) {
    var r = range();
    return { "type": "c_title", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f20 = function(val_1, val_2) {
    var r = range();
    return { "type": "cv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f21 = function(val_1, val_2) {
    var r = range();
    return { "type": "cv", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f22 = function(val) {
    var r = range();
    return { "type": "c", "value": [val], "indices": [r.start, r.end - 1] };
  };
  var peg$f23 = function(val_1) {
    var r = range();
    return { "type": "ff", "value": [val_1], "indices": [r.start, r.end - 1] };
  };
  var peg$f24 = function(val_1, val_2) {
    var r = range();
    return { "type": "integer_title", "value": [val_1, val_2], "indices": [r.start, r.end - 1] };
  };
  var peg$f25 = function(val) {
    var r = range();
    return { "type": "context", "value": val.value, "indices": [r.start, r.end - 1] };
  };
  var peg$f26 = function(val) {
    var r = range();
    return { "type": "b", "value": val.value, "indices": [r.start, r.end - 1] };
  };
  var peg$f27 = function(val) {
    var r = range();
    return { "type": "bc", "value": [val, { "type": "c", "value": [{ "type": "integer", "value": 151, "indices": [r.end - 2, r.end - 1] }], "indices": [r.end - 2, r.end - 1] }], "indices": [r.start, r.end - 1] };
  };
  var peg$f28 = function(val_1, val_2) {
    var r = range();
    return { "type": "bcv", "value": [val_1, { "type": "v", "value": [val_2], "indices": [val_2.indices[0], val_2.indices[1]] }], "indices": [r.start, r.end - 1] };
  };
  var peg$f29 = function(val_1, val_2) {
    var r = range();
    return { "type": "v", "value": [val_1], "letter": val_2, "indices": [r.start, r.end - 1] };
  };
  var peg$f30 = function(val) {
    var r = range();
    return { "type": "v", "value": [val], "indices": [r.start, r.end - 1] };
  };
  var peg$f31 = function() {
    return { "type": "c_explicit" };
  };
  var peg$f32 = function() {
    return { "type": "v_explicit" };
  };
  var peg$f33 = function() {
    return "";
  };
  var peg$f34 = function(val) {
    var r = range();
    return { type: "title", value: [val], "indices": [r.start, r.end - 1] };
  };
  var peg$f35 = function(val) {
    var r = range();
    return { "type": "translation_sequence", "value": val, "indices": [r.start, r.end - 1] };
  };
  var peg$f36 = function(val) {
    var r = range();
    return { "type": "translation_sequence", "value": val, "indices": [r.start, r.end - 1] };
  };
  var peg$f37 = function(val) {
    var r = range();
    return { "type": "translation", "value": val.value, "indices": [r.start, r.end - 1] };
  };
  var peg$f38 = function(val) {
    var r = range();
    return { "type": "integer", "value": parseInt(val.join(""), 10), "indices": [r.start, r.end - 1] };
  };
  var peg$f39 = function(val) {
    var r = range();
    return { "type": "integer", "value": parseInt(val.join(""), 10), "indices": [r.start, r.end - 1] };
  };
  var peg$f40 = function(val) {
    var r = range();
    return { "type": "word", "value": val.join(""), "indices": [r.start, r.end - 1] };
  };
  var peg$f41 = function(val) {
    var r = range();
    return { "type": "stop", "value": val, "indices": [r.start, r.end - 1] };
  };
  var peg$currPos = options.peg$currPos | 0;
  var peg$savedPos = peg$currPos;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = peg$currPos;
  var peg$maxFailExpected = options.peg$maxFailExpected || [];
  var peg$silentFails = options.peg$silentFails | 0;
  var peg$result;
  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  if ("punctuation_strategy" in options && options.punctuation_strategy === "eu") {
    peg$parsecv_sep = peg$parseeu_cv_sep;
    peg$r6 = /^[;\/:&\-\u2013\u2014~]/;
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function offset() {
    return peg$savedPos;
  }
  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function expected(description, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location2
    );
  }
  function error(message, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message, location2);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts, inverted, ignoreCase };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;
    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {
        }
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset2) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);
    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset2 && peg$source && typeof peg$source.offset === "function") {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }
  function peg$fail(expected2) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected2);
  }
  function peg$buildSimpleError(message, location2) {
    return new peg$SyntaxError(message, null, null, location2);
  }
  function peg$buildStructuredError(expected2, found, location2) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected2, found),
      expected2,
      found,
      location2
    );
  }
  function peg$parsestart() {
    var s0, s1;
    s0 = [];
    s1 = peg$parsebcv_hyphen_range();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesequence();
      if (s1 === peg$FAILED) {
        s1 = peg$parsecb_range();
        if (s1 === peg$FAILED) {
          s1 = peg$parserange();
          if (s1 === peg$FAILED) {
            s1 = peg$parseff();
            if (s1 === peg$FAILED) {
              s1 = peg$parsebcv_comma();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebc_title();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseps151_bcv();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebcv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebcv_weak();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseps151_bc();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsebc();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsecv_psalm();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsebv();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsec_psalm();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parseb();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsecbv();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecbv_ordinal();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecb();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecb_ordinal();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsetranslation_sequence_enclosed();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsetranslation_sequence();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsesequence_sep();
                                                if (s1 === peg$FAILED) {
                                                  s1 = peg$parsec_title();
                                                  if (s1 === peg$FAILED) {
                                                    s1 = peg$parseinteger_title();
                                                    if (s1 === peg$FAILED) {
                                                      s1 = peg$parsecv();
                                                      if (s1 === peg$FAILED) {
                                                        s1 = peg$parsecv_weak();
                                                        if (s1 === peg$FAILED) {
                                                          s1 = peg$parsev_letter();
                                                          if (s1 === peg$FAILED) {
                                                            s1 = peg$parseinteger();
                                                            if (s1 === peg$FAILED) {
                                                              s1 = peg$parsec();
                                                              if (s1 === peg$FAILED) {
                                                                s1 = peg$parsev();
                                                                if (s1 === peg$FAILED) {
                                                                  s1 = peg$parseword();
                                                                  if (s1 === peg$FAILED) {
                                                                    s1 = peg$parseword_parenthesis();
                                                                    if (s1 === peg$FAILED) {
                                                                      s1 = peg$parsecontext();
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsebcv_hyphen_range();
        if (s1 === peg$FAILED) {
          s1 = peg$parsesequence();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecb_range();
            if (s1 === peg$FAILED) {
              s1 = peg$parserange();
              if (s1 === peg$FAILED) {
                s1 = peg$parseff();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsebcv_comma();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebc_title();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseps151_bcv();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsebcv();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsebcv_weak();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parseps151_bc();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsebc();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsecv_psalm();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsebv();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsec_psalm();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parseb();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecbv();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecbv_ordinal();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecb();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsecb_ordinal();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsetranslation_sequence_enclosed();
                                                if (s1 === peg$FAILED) {
                                                  s1 = peg$parsetranslation_sequence();
                                                  if (s1 === peg$FAILED) {
                                                    s1 = peg$parsesequence_sep();
                                                    if (s1 === peg$FAILED) {
                                                      s1 = peg$parsec_title();
                                                      if (s1 === peg$FAILED) {
                                                        s1 = peg$parseinteger_title();
                                                        if (s1 === peg$FAILED) {
                                                          s1 = peg$parsecv();
                                                          if (s1 === peg$FAILED) {
                                                            s1 = peg$parsecv_weak();
                                                            if (s1 === peg$FAILED) {
                                                              s1 = peg$parsev_letter();
                                                              if (s1 === peg$FAILED) {
                                                                s1 = peg$parseinteger();
                                                                if (s1 === peg$FAILED) {
                                                                  s1 = peg$parsec();
                                                                  if (s1 === peg$FAILED) {
                                                                    s1 = peg$parsev();
                                                                    if (s1 === peg$FAILED) {
                                                                      s1 = peg$parseword();
                                                                      if (s1 === peg$FAILED) {
                                                                        s1 = peg$parseword_parenthesis();
                                                                        if (s1 === peg$FAILED) {
                                                                          s1 = peg$parsecontext();
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecb_range();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_hyphen_range();
      if (s1 === peg$FAILED) {
        s1 = peg$parserange();
        if (s1 === peg$FAILED) {
          s1 = peg$parseff();
          if (s1 === peg$FAILED) {
            s1 = peg$parsebcv_comma();
            if (s1 === peg$FAILED) {
              s1 = peg$parsebc_title();
              if (s1 === peg$FAILED) {
                s1 = peg$parseps151_bcv();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsebcv();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebcv_weak();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseps151_bc();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsebc();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsecv_psalm();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsebv();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsec_psalm();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parseb();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsecbv();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsecbv_ordinal();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecb();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecb_ordinal();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecontext();
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsesequence_sep();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      s5 = peg$parsesequence_post();
      if (s5 !== peg$FAILED) {
        s4 = [s4, s5];
        s3 = s4;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsesequence_sep();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parsesequence_post();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f0(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence_post_enclosed() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parsesequence_sep();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      s4 = peg$parsesequence_post();
      if (s4 !== peg$FAILED) {
        s5 = [];
        s6 = peg$currPos;
        s7 = peg$parsesequence_sep();
        if (s7 === peg$FAILED) {
          s7 = null;
        }
        s8 = peg$parsesequence_post();
        if (s8 !== peg$FAILED) {
          s7 = [s7, s8];
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          s6 = peg$currPos;
          s7 = peg$parsesequence_sep();
          if (s7 === peg$FAILED) {
            s7 = null;
          }
          s8 = peg$parsesequence_post();
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        }
        s6 = peg$parsesp();
        if (input.charCodeAt(peg$currPos) === 41) {
          s7 = peg$c1;
          peg$currPos++;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        if (s7 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f1(s4, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence_post() {
    var s0;
    s0 = peg$parsesequence_post_enclosed();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecb_range();
      if (s0 === peg$FAILED) {
        s0 = peg$parsebcv_hyphen_range();
        if (s0 === peg$FAILED) {
          s0 = peg$parserange();
          if (s0 === peg$FAILED) {
            s0 = peg$parseff();
            if (s0 === peg$FAILED) {
              s0 = peg$parsebcv_comma();
              if (s0 === peg$FAILED) {
                s0 = peg$parsebc_title();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseps151_bcv();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsebcv();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsebcv_weak();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseps151_bc();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parsebc();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parsecv_psalm();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parsebv();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parsec_psalm();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parseb();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parsecbv();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parsecbv_ordinal();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsecb();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parsecb_ordinal();
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$parsec_title();
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$parseinteger_title();
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$parsecv();
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$parsecv_weak();
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$parsev_letter();
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$parseinteger();
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$parsec();
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$parsev();
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parserange() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsebcv_comma();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc_title();
      if (s1 === peg$FAILED) {
        s1 = peg$parseps151_bcv();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebcv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsebcv_weak();
            if (s1 === peg$FAILED) {
              s1 = peg$parseps151_bc();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebc();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsecv_psalm();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$currPos;
                      s2 = peg$parseb();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$currPos;
                        peg$silentFails++;
                        s4 = peg$currPos;
                        s5 = peg$parserange_sep();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsebcv_comma();
                          if (s6 === peg$FAILED) {
                            s6 = peg$parsebc_title();
                            if (s6 === peg$FAILED) {
                              s6 = peg$parseps151_bcv();
                              if (s6 === peg$FAILED) {
                                s6 = peg$parsebcv();
                                if (s6 === peg$FAILED) {
                                  s6 = peg$parsebcv_weak();
                                  if (s6 === peg$FAILED) {
                                    s6 = peg$parseps151_bc();
                                    if (s6 === peg$FAILED) {
                                      s6 = peg$parsebc();
                                      if (s6 === peg$FAILED) {
                                        s6 = peg$parsebv();
                                        if (s6 === peg$FAILED) {
                                          s6 = peg$parseb();
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                          if (s6 !== peg$FAILED) {
                            s5 = [s5, s6];
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                        peg$silentFails--;
                        if (s4 !== peg$FAILED) {
                          peg$currPos = s3;
                          s3 = void 0;
                        } else {
                          s3 = peg$FAILED;
                        }
                        if (s3 !== peg$FAILED) {
                          s2 = [s2, s3];
                          s1 = s2;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsecbv();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsecbv_ordinal();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsec_psalm();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsecb();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsecb_ordinal();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsec_title();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parseinteger_title();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecv();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecv_weak();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsev_letter();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parseinteger();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsec();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsev();
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parserange_sep();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseff();
        if (s3 === peg$FAILED) {
          s3 = peg$parsebcv_comma();
          if (s3 === peg$FAILED) {
            s3 = peg$parsebc_title();
            if (s3 === peg$FAILED) {
              s3 = peg$parseps151_bcv();
              if (s3 === peg$FAILED) {
                s3 = peg$parsebcv();
                if (s3 === peg$FAILED) {
                  s3 = peg$parsebcv_weak();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parseps151_bc();
                    if (s3 === peg$FAILED) {
                      s3 = peg$parsebc();
                      if (s3 === peg$FAILED) {
                        s3 = peg$parsecv_psalm();
                        if (s3 === peg$FAILED) {
                          s3 = peg$parsebv();
                          if (s3 === peg$FAILED) {
                            s3 = peg$parseb();
                            if (s3 === peg$FAILED) {
                              s3 = peg$parsecbv();
                              if (s3 === peg$FAILED) {
                                s3 = peg$parsecbv_ordinal();
                                if (s3 === peg$FAILED) {
                                  s3 = peg$parsec_psalm();
                                  if (s3 === peg$FAILED) {
                                    s3 = peg$parsecb();
                                    if (s3 === peg$FAILED) {
                                      s3 = peg$parsecb_ordinal();
                                      if (s3 === peg$FAILED) {
                                        s3 = peg$parsec_title();
                                        if (s3 === peg$FAILED) {
                                          s3 = peg$parseinteger_title();
                                          if (s3 === peg$FAILED) {
                                            s3 = peg$parsecv();
                                            if (s3 === peg$FAILED) {
                                              s3 = peg$parsev_letter();
                                              if (s3 === peg$FAILED) {
                                                s3 = peg$parseinteger();
                                                if (s3 === peg$FAILED) {
                                                  s3 = peg$parsecv_weak();
                                                  if (s3 === peg$FAILED) {
                                                    s3 = peg$parsec();
                                                    if (s3 === peg$FAILED) {
                                                      s3 = peg$parsev();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f2(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseb() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 47) {
          s4 = peg$c3;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e3);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = input.charAt(peg$currPos);
          if (peg$r0.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e4);
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (input.charCodeAt(peg$currPos) === 31) {
          s4 = peg$c2;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e2);
          }
        }
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f3(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$currPos;
        s6 = peg$parsec();
        if (s6 !== peg$FAILED) {
          s7 = peg$parsecv_sep();
          if (s7 !== peg$FAILED) {
            s8 = peg$parsev();
            if (s8 !== peg$FAILED) {
              s6 = [s6, s7, s8];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        peg$silentFails--;
        if (s5 !== peg$FAILED) {
          peg$currPos = s4;
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = [];
        s3 = peg$parsecv_sep();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsecv_sep();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = [];
          s3 = peg$parsecv_sep_weak();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parsecv_sep_weak();
            }
          } else {
            s2 = peg$FAILED;
          }
          if (s2 === peg$FAILED) {
            s2 = [];
            s3 = peg$parserange_sep();
            if (s3 !== peg$FAILED) {
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parserange_sep();
              }
            } else {
              s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
              s2 = peg$parsesp();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsec();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f4(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc_comma() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      if (input.charCodeAt(peg$currPos) === 44) {
        s3 = peg$c4;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e5);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesp();
        s5 = peg$parsec();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f5(s1, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc_title() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsetitle();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f6(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s4 = peg$c5;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsev();
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecv();
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parsecv_sep();
        if (s4 === peg$FAILED) {
          s4 = peg$parsesequence_sep();
        }
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parsecv_sep();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev_letter();
          if (s4 === peg$FAILED) {
            s4 = peg$parsev();
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f7(s1, s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_weak() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecv_sep_weak();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsev_letter();
        if (s3 === peg$FAILED) {
          s3 = peg$parsev();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$currPos;
          s6 = peg$parsecv_sep();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsev();
            if (s7 !== peg$FAILED) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f8(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_comma() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$parsebc_comma();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      if (input.charCodeAt(peg$currPos) === 44) {
        s3 = peg$c4;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e5);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesp();
        s5 = peg$parsev_letter();
        if (s5 === peg$FAILED) {
          s5 = peg$parsev();
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$currPos;
          peg$silentFails++;
          s7 = peg$currPos;
          s8 = peg$parsecv_sep();
          if (s8 !== peg$FAILED) {
            s9 = peg$parsev();
            if (s9 !== peg$FAILED) {
              s8 = [s8, s9];
              s7 = s8;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
          peg$silentFails--;
          if (s7 === peg$FAILED) {
            s6 = void 0;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f9(s1, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_hyphen_range() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c6;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parsespace();
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsec();
      if (s3 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s4 = peg$c6;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsev();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s6 = peg$c6;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e7);
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parsev();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f10(s1, s3, s5, s7);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebv() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsecv_sep();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsecv_sep();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = [];
        s3 = peg$parsecv_sep_weak();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsecv_sep_weak();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = [];
          s3 = peg$parserange_sep();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parserange_sep();
            }
          } else {
            s2 = peg$FAILED;
          }
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            s3 = [];
            s4 = peg$parsesequence_sep();
            if (s4 !== peg$FAILED) {
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parsesequence_sep();
              }
            } else {
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$parsev_explicit();
              peg$silentFails--;
              if (s5 !== peg$FAILED) {
                peg$currPos = s4;
                s4 = void 0;
              } else {
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
              s2 = peg$parsesp();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsev_letter();
        if (s3 === peg$FAILED) {
          s3 = peg$parsev();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f11(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsein_book_of();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        s4 = peg$parseb();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f12(s2, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb_range() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        s3 = peg$parserange_sep();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsec();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsein_book_of();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            s6 = peg$parseb();
            if (s6 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f13(s2, s4, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecbv() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f14(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb_ordinal() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsec();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c7) {
        s2 = peg$c7;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e8);
        }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c8) {
          s2 = peg$c8;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e9);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c9) {
            s2 = peg$c9;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e10);
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsec_explicit();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsein_book_of();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseb();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f15(s1, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecbv_ordinal() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecb_ordinal();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f16(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_psalm() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c10) {
          s3 = peg$c10;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e11);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f17(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_psalm() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_psalm();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f18(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_title() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetitle();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f19(s2, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parsec();
    if (s2 !== peg$FAILED) {
      s3 = peg$currPos;
      peg$silentFails++;
      s4 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s5 = peg$c5;
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parsev_explicit();
        if (s6 !== peg$FAILED) {
          s7 = peg$parsev();
          if (s7 !== peg$FAILED) {
            s5 = [s5, s6, s7];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      peg$silentFails--;
      if (s4 === peg$FAILED) {
        s3 = void 0;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        s5 = peg$parsecv_sep();
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        s6 = peg$parsev_explicit();
        if (s6 !== peg$FAILED) {
          s5 = [s5, s6];
          s4 = s5;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 === peg$FAILED) {
          s4 = peg$parsecv_sep();
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsev_letter();
          if (s5 === peg$FAILED) {
            s5 = peg$parsev();
          }
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f20(s2, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_weak() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parsec();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecv_sep_weak();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsev_letter();
        if (s3 === peg$FAILED) {
          s3 = peg$parsev();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$currPos;
          s6 = peg$parsecv_sep();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsev();
            if (s7 !== peg$FAILED) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f21(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f22(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseff() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsebcv();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_weak();
      if (s1 === peg$FAILED) {
        s1 = peg$parsebc();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecv();
            if (s1 === peg$FAILED) {
              s1 = peg$parsecv_weak();
              if (s1 === peg$FAILED) {
                s1 = peg$parseinteger();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsec();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsev();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c11) {
        s4 = peg$c11;
        peg$currPos += 2;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e12);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        peg$silentFails++;
        s6 = input.charAt(peg$currPos);
        if (peg$r1.test(s6)) {
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e13);
          }
        }
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 102) {
          s4 = peg$c12;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e14);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$currPos;
          peg$silentFails++;
          s6 = input.charAt(peg$currPos);
          if (peg$r1.test(s6)) {
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e13);
            }
          }
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = void 0;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseabbrev();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$currPos;
        peg$silentFails++;
        s6 = input.charAt(peg$currPos);
        if (peg$r2.test(s6)) {
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e15);
          }
        }
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f23(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseinteger_title() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseinteger();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsetitle();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f24(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecontext() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c13) {
          s3 = peg$c13;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e16);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f25(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_b() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c14) {
          s3 = peg$c14;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e17);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f26(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_bc() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parseps151_b();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c15) {
        s2 = peg$c15;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e18);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = input.charAt(peg$currPos);
        if (peg$r3.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e19);
          }
        }
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f27(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_bcv() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c5;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseinteger();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f28(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsev_letter() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c11) {
        s6 = peg$c11;
        peg$currPos += 2;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e12);
        }
      }
      if (s6 !== peg$FAILED) {
        s7 = peg$currPos;
        peg$silentFails++;
        s8 = input.charAt(peg$currPos);
        if (peg$r1.test(s8)) {
          peg$currPos++;
        } else {
          s8 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e13);
          }
        }
        peg$silentFails--;
        if (s8 === peg$FAILED) {
          s7 = void 0;
        } else {
          peg$currPos = s7;
          s7 = peg$FAILED;
        }
        if (s7 !== peg$FAILED) {
          s6 = [s6, s7];
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      if (s5 === peg$FAILED) {
        s5 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 102) {
          s6 = peg$c12;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e14);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$currPos;
          peg$silentFails++;
          s8 = input.charAt(peg$currPos);
          if (peg$r1.test(s8)) {
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e13);
            }
          }
          peg$silentFails--;
          if (s8 === peg$FAILED) {
            s7 = void 0;
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = input.charAt(peg$currPos);
        if (peg$r4.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e20);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$currPos;
          peg$silentFails++;
          s7 = input.charAt(peg$currPos);
          if (peg$r2.test(s7)) {
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e15);
            }
          }
          peg$silentFails--;
          if (s7 === peg$FAILED) {
            s6 = void 0;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f29(s2, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsev() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f30(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_explicit() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c16) {
      s3 = peg$c16;
      peg$currPos += 2;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e21);
      }
    }
    if (s3 !== peg$FAILED) {
      if (input.substr(peg$currPos, 6) === peg$c17) {
        s4 = peg$c17;
        peg$currPos += 6;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e22);
        }
      }
      if (s4 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c18) {
          s4 = peg$c18;
          peg$currPos += 5;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e23);
          }
        }
        if (s4 === peg$FAILED) {
          s4 = peg$currPos;
          if (input.substr(peg$currPos, 4) === peg$c19) {
            s5 = peg$c19;
            peg$currPos += 4;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e24);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parseabbrev();
            if (s6 === peg$FAILED) {
              s6 = null;
            }
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c20) {
              s5 = peg$c20;
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e25);
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseabbrev();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c21) {
                s5 = peg$c21;
                peg$currPos += 3;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e26);
                }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseabbrev();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              if (s4 === peg$FAILED) {
                s4 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c22) {
                  s5 = peg$c22;
                  peg$currPos += 3;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e27);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseabbrev();
                  if (s6 === peg$FAILED) {
                    s6 = null;
                  }
                  s5 = [s5, s6];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
                if (s4 === peg$FAILED) {
                  s4 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c23) {
                    s5 = peg$c23;
                    peg$currPos += 2;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e28);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseabbrev();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    s5 = [s5, s6];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                  if (s4 === peg$FAILED) {
                    s4 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 112) {
                      s5 = peg$c24;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e29);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseabbrev();
                      if (s6 === peg$FAILED) {
                        s6 = null;
                      }
                      s5 = [s5, s6];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                    if (s4 === peg$FAILED) {
                      s4 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 115) {
                        s5 = peg$c25;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e30);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parseabbrev();
                        if (s6 === peg$FAILED) {
                          s6 = null;
                        }
                        s5 = [s5, s6];
                        s4 = s5;
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                      if (s4 === peg$FAILED) {
                        s4 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 97) {
                          s5 = peg$c26;
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e31);
                          }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parseabbrev();
                          if (s6 === peg$FAILED) {
                            s6 = null;
                          }
                          s5 = [s5, s6];
                          s4 = s5;
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                        if (s4 === peg$FAILED) {
                          s4 = peg$parseabbrev();
                          if (s4 === peg$FAILED) {
                            s4 = null;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      peg$savedPos = s0;
      s0 = peg$f31();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsev_explicit() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 118) {
      s3 = peg$c27;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e32);
      }
    }
    if (s3 !== peg$FAILED) {
      if (input.substr(peg$currPos, 5) === peg$c28) {
        s4 = peg$c28;
        peg$currPos += 5;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e33);
        }
      }
      if (s4 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c29) {
          s4 = peg$c29;
          peg$currPos += 4;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e34);
          }
        }
        if (s4 === peg$FAILED) {
          s4 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c30) {
            s5 = peg$c30;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e35);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parseabbrev();
            if (s6 === peg$FAILED) {
              s6 = null;
            }
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c31) {
              s5 = peg$c31;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e36);
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseabbrev();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 115) {
                s5 = peg$c25;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e30);
                }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseabbrev();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              if (s4 === peg$FAILED) {
                s4 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 118) {
                  s5 = peg$c27;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseabbrev();
                  if (s6 === peg$FAILED) {
                    s6 = null;
                  }
                  s5 = [s5, s6];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
                if (s4 === peg$FAILED) {
                  s4 = peg$parseabbrev();
                  if (s4 === peg$FAILED) {
                    s4 = null;
                  }
                }
              }
            }
          }
        }
      }
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$currPos;
      peg$silentFails++;
      s4 = input.charAt(peg$currPos);
      if (peg$r2.test(s4)) {
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e15);
        }
      }
      peg$silentFails--;
      if (s4 === peg$FAILED) {
        s3 = void 0;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesp();
        peg$savedPos = s0;
        s0 = peg$f32();
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_sep() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = [];
    if (input.charCodeAt(peg$currPos) === 58) {
      s3 = peg$c32;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e37);
      }
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        if (input.charCodeAt(peg$currPos) === 58) {
          s3 = peg$c32;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e37);
          }
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 === peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c5;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$currPos;
        s6 = peg$parsesp();
        if (input.charCodeAt(peg$currPos) === 46) {
          s7 = peg$c5;
          peg$currPos++;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s7 !== peg$FAILED) {
          s8 = peg$parsesp();
          if (input.charCodeAt(peg$currPos) === 46) {
            s9 = peg$c5;
            peg$currPos++;
          } else {
            s9 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s9 !== peg$FAILED) {
            s6 = [s6, s7, s8, s9];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_sep_weak() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = input.charAt(peg$currPos);
    if (peg$r5.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e38);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsespace();
    }
    return s0;
  }
  function peg$parsesequence_sep() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r6.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e39);
      }
    }
    if (s2 === peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c5;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$currPos;
        s6 = peg$parsesp();
        if (input.charCodeAt(peg$currPos) === 46) {
          s7 = peg$c5;
          peg$currPos++;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s7 !== peg$FAILED) {
          s8 = peg$parsesp();
          if (input.charCodeAt(peg$currPos) === 46) {
            s9 = peg$c5;
            peg$currPos++;
          } else {
            s9 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s9 !== peg$FAILED) {
            s6 = [s6, s7, s8, s9];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c33) {
          s2 = peg$c33;
          peg$currPos += 3;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e40);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c34) {
            s2 = peg$c34;
            peg$currPos += 7;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e41);
            }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c35) {
              s3 = peg$c35;
              peg$currPos += 2;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e42);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseabbrev();
              if (s4 === peg$FAILED) {
                s4 = null;
              }
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
              s2 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c36) {
                s3 = peg$c36;
                peg$currPos += 3;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e43);
                }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsespace();
                if (s4 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 4) === peg$c37) {
                    s5 = peg$c37;
                    peg$currPos += 4;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e44);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s3 = [s3, s4, s5];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c37) {
                  s2 = peg$c37;
                  peg$currPos += 4;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e44);
                  }
                }
                if (s2 === peg$FAILED) {
                  if (input.substr(peg$currPos, 3) === peg$c36) {
                    s2 = peg$c36;
                    peg$currPos += 3;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e43);
                    }
                  }
                  if (s2 === peg$FAILED) {
                    s2 = peg$parsespace();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r6.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e39);
          }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 46) {
            s3 = peg$c5;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$currPos;
            s6 = peg$parsesp();
            if (input.charCodeAt(peg$currPos) === 46) {
              s7 = peg$c5;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e6);
              }
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$parsesp();
              if (input.charCodeAt(peg$currPos) === 46) {
                s9 = peg$c5;
                peg$currPos++;
              } else {
                s9 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e6);
                }
              }
              if (s9 !== peg$FAILED) {
                s6 = [s6, s7, s8, s9];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c33) {
              s2 = peg$c33;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e40);
              }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 7) === peg$c34) {
                s2 = peg$c34;
                peg$currPos += 7;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e41);
                }
              }
              if (s2 === peg$FAILED) {
                s2 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c35) {
                  s3 = peg$c35;
                  peg$currPos += 2;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e42);
                  }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseabbrev();
                  if (s4 === peg$FAILED) {
                    s4 = null;
                  }
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 === peg$FAILED) {
                  s2 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c36) {
                    s3 = peg$c36;
                    peg$currPos += 3;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e43);
                    }
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsespace();
                    if (s4 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 4) === peg$c37) {
                        s5 = peg$c37;
                        peg$currPos += 4;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e44);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s3 = [s3, s4, s5];
                        s2 = s3;
                      } else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                  if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c37) {
                      s2 = peg$c37;
                      peg$currPos += 4;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e44);
                      }
                    }
                    if (s2 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c36) {
                        s2 = peg$c36;
                        peg$currPos += 3;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e43);
                        }
                      }
                      if (s2 === peg$FAILED) {
                        s2 = peg$parsespace();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f33();
    }
    s0 = s1;
    return s0;
  }
  function peg$parserange_sep() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = [];
    s3 = peg$currPos;
    s4 = input.charAt(peg$currPos);
    if (peg$r7.test(s4)) {
      peg$currPos++;
    } else {
      s4 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e45);
      }
    }
    if (s4 !== peg$FAILED) {
      s5 = peg$parsesp();
      s4 = [s4, s5];
      s3 = s4;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 === peg$FAILED) {
      s3 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c38) {
        s4 = peg$c38;
        peg$currPos += 7;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e46);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesp();
        s4 = [s4, s5];
        s3 = s4;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        s3 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c39) {
          s4 = peg$c39;
          peg$currPos += 4;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e47);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesp();
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c40) {
            s4 = peg$c40;
            peg$currPos += 2;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e48);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsesp();
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      }
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = input.charAt(peg$currPos);
        if (peg$r7.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e45);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesp();
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$currPos;
          if (input.substr(peg$currPos, 7) === peg$c38) {
            s4 = peg$c38;
            peg$currPos += 7;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e46);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsesp();
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c39) {
              s4 = peg$c39;
              peg$currPos += 4;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e47);
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesp();
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
              s3 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c40) {
                s4 = peg$c40;
                peg$currPos += 2;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e48);
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsesp();
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
          }
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = [s1, s2];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetitle() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsecv_sep();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesequence_sep();
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (input.substr(peg$currPos, 5) === peg$c41) {
      s2 = peg$c41;
      peg$currPos += 5;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e49);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f34(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsein_book_of() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    if (input.substr(peg$currPos, 4) === peg$c42) {
      s2 = peg$c42;
      peg$currPos += 4;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e50);
      }
    }
    if (s2 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c43) {
        s2 = peg$c43;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e51);
        }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c44) {
          s2 = peg$c44;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e52);
          }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s4 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c45) {
        s5 = peg$c45;
        peg$currPos += 3;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e53);
        }
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parsesp();
        if (input.substr(peg$currPos, 4) === peg$c46) {
          s7 = peg$c46;
          peg$currPos += 4;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e54);
          }
        }
        if (s7 !== peg$FAILED) {
          s8 = peg$parsesp();
          if (input.substr(peg$currPos, 2) === peg$c43) {
            s9 = peg$c43;
            peg$currPos += 2;
          } else {
            s9 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e51);
            }
          }
          if (s9 !== peg$FAILED) {
            s10 = peg$parsesp();
            s5 = [s5, s6, s7, s8, s9, s10];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      s1 = [s1, s2, s3, s4];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseabbrev() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    if (input.charCodeAt(peg$currPos) === 46) {
      s2 = peg$c5;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$currPos;
      peg$silentFails++;
      s4 = peg$currPos;
      s5 = peg$parsesp();
      if (input.charCodeAt(peg$currPos) === 46) {
        s6 = peg$c5;
        peg$currPos++;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s6 !== peg$FAILED) {
        s7 = peg$parsesp();
        if (input.charCodeAt(peg$currPos) === 46) {
          s8 = peg$c5;
          peg$currPos++;
        } else {
          s8 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s8 !== peg$FAILED) {
          s5 = [s5, s6, s7, s8];
          s4 = s5;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      peg$silentFails--;
      if (s4 === peg$FAILED) {
        s3 = void 0;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s1 = [s1, s2, s3];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseeu_cv_sep() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    if (input.charCodeAt(peg$currPos) === 44) {
      s2 = peg$c4;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e5);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation_sequence_enclosed() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = input.charAt(peg$currPos);
    if (peg$r8.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e55);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s4 = peg$currPos;
      s5 = peg$parsetranslation();
      if (s5 !== peg$FAILED) {
        s6 = [];
        s7 = peg$currPos;
        s8 = peg$parsesequence_sep();
        if (s8 !== peg$FAILED) {
          s9 = peg$parsetranslation();
          if (s9 !== peg$FAILED) {
            s8 = [s8, s9];
            s7 = s8;
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
        } else {
          peg$currPos = s7;
          s7 = peg$FAILED;
        }
        while (s7 !== peg$FAILED) {
          s6.push(s7);
          s7 = peg$currPos;
          s8 = peg$parsesequence_sep();
          if (s8 !== peg$FAILED) {
            s9 = peg$parsetranslation();
            if (s9 !== peg$FAILED) {
              s8 = [s8, s9];
              s7 = s8;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
        }
        s5 = [s5, s6];
        s4 = s5;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesp();
        s6 = input.charAt(peg$currPos);
        if (peg$r9.test(s6)) {
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e56);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f35(s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation_sequence() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 44) {
      s3 = peg$c4;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e5);
      }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parsesp();
      s3 = [s3, s4];
      s2 = s3;
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = peg$currPos;
    s4 = peg$parsetranslation();
    if (s4 !== peg$FAILED) {
      s5 = [];
      s6 = peg$currPos;
      s7 = peg$parsesequence_sep();
      if (s7 !== peg$FAILED) {
        s8 = peg$parsetranslation();
        if (s8 !== peg$FAILED) {
          s7 = [s7, s8];
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      } else {
        peg$currPos = s6;
        s6 = peg$FAILED;
      }
      while (s6 !== peg$FAILED) {
        s5.push(s6);
        s6 = peg$currPos;
        s7 = peg$parsesequence_sep();
        if (s7 !== peg$FAILED) {
          s8 = peg$parsetranslation();
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      }
      s4 = [s4, s5];
      s3 = s4;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f36(s3);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 30) {
      s1 = peg$c47;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e57);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 30) {
          s3 = peg$c47;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e57);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f37(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseinteger() {
    var res;
    if (res = /^[0-9]{1,3}(?!\d|,000)/.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      var r = range();
      return { "type": "integer", "value": parseInt(res[0], 10), "indices": [r.start, r.end - 1] };
    } else {
      return peg$FAILED;
    }
  }
  function peg$parseany_integer() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r3.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e19);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r3.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e19);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f39(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseword() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r10.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e59);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r10.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e59);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f40(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseword_parenthesis() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r8.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e55);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f41(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsesp() {
    var s0;
    s0 = peg$parsespace();
    if (s0 === peg$FAILED) {
      s0 = null;
    }
    return s0;
  }
  function peg$parsespace() {
    var res;
    if (res = /^[\s*]+/.exec(input.substring(peg$currPos))) {
      peg$currPos += res[0].length;
      return [];
    }
    return peg$FAILED;
  }
  peg$result = peg$startRuleFunction();
  if (options.peg$library) {
    return (
      /** @type {any} */
      {
        peg$result,
        peg$currPos,
        peg$FAILED,
        peg$maxFailExpected,
        peg$maxFailPos
      }
    );
  }
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

// build/lang_bundle.ts
var regexps = bcv_regexps;
var translations = bcv_translations;
var grammar = { parse: peg$parse };
export {
  grammar,
  regexps,
  translations
};

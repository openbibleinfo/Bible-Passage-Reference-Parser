// build/bcv_regexps.ts
var bcv_regexps = class {
  constructor() {
    this.books = [];
    this.languages = ["en"];
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
        regexp: /(?:^|(?<=[^\p{L}]))(G(?:en(?:n(?:(?:eis[eiu]|si)s|ees[eiu]s|i(?:[ei]s[eiu]s|s[eiu]s)|es[eiu]s)|(?:e(?:is[eiu]|su)|si)s|ees[eiu]s|i(?:[ei]s[eiu]s|s[eiu]s)|es[ei]s)|e(?:n(?:neis|es[ei]|eis)?)?|n))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Exod"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ex(?:o(?:d(?:[iu]s|[es])?)?|d)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bel"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(Bel(?:\s*(?:and\s*(?:the\s*(?:S(?:erpent|nake)|Dragon)|S(?:erpent|nake)|Dragon)|&\s*(?:the\s*(?:S(?:erpent|nake)|Dragon)|S(?:erpent|nake)|Dragon)))?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lev"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(L(?:evit(?:[ei])?cus|evet(?:[ei])?cus|iv[ei]t(?:[ei])?cus|e(?:vi?)?|v))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Num"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(N(?:u(?:m(?:b(?:ers?)?)?)?|m))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sir"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Wisdom\s*of\s*Jesus(?:,\s*Son\s*of|\s*(?:Son\s*of|ben))\s*Sirach|Wisdom\s*of\s*Jesus(?:,\s*Son\s*of|\s*(?:Son\s*of|ben))\s*Sirach|Ecc(?:l[eu]siasticus|s)|Ben\s*Sira|Ecclus|Sirach|Sir))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Wis"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Wis(?:d?om|d?)\s*of\s*Solomon|Wis(?:d(?:om)?\s*|\s*)of\s*Solomon|Wisom\s*of\s*Solomon|Wis(?:d(?:om)?)?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(L(?:am[ei]ntations|a(?:m(?:[ei]ntation)?)?|m))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["EpJer"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*(?:(?:Ep(?:istle|\.)|Ep)\s*of\s*Jeremiah|Let(?:ter|\.?)\s*of\s*Jeremiah)|Ep(?:(?:(?:istle\s*of\s*Jeremiah|(?:istle\s*of\s*Jeremy|\s*?Jer))|\s*of\s*Jeremiah)|\.\s*of\s*Jeremiah)|Let(?:ter|\.?)\s*of\s*Jeremiah))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rev"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(R(?:ev(?:e?|[ao])lations|e(?:v(?:elation|[ao]lation|lation|el)?)?|v))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrMan"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Pr(?:ayer(?:s\s*(?:of\s*)?Manasseh|\s*(?:of\s*)?Manasseh)|\s*(?:of\s*)?Manasseh)|Prayer(?:s\s*(?:of\s*)?Manasseh|\s*(?:of\s*)?Manasseh)|Pr\s*of\s*Manasseh|Pr\s*Manasseh|Pr\s*?Man))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Deut"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(D(?:eut[eo]rono?my|eet(?:[eo]rono?my|rono?my)|u(?:et[eo]rono?my|ut(?:[eo]rono?my|rono?my)|et(?:rono?my)?)|eutrono?my|eut?|t))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Josh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:o(?:(?:ush?ua|sh?ua)|sh?)|sh))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Judg"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:udg(?:es)?|d?gs|d?g))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ruth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(R(?:u(?:th?)?|th?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:First\s*Esd(?:r(?:as)?)?|(?:(?:1st|I)|1)\.\s*Esd(?:r(?:as)?)?|(?:(?:1st|I)|1)\s*Esd(?:r(?:as)?)?|1Esd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*Esd(?:r(?:as)?)?|(?:2(?:nd)?|II)\.\s*Esd(?:r(?:as)?)?|(?:2(?:nd)?|II)\s*Esd(?:r(?:as)?)?|2Esd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Isa"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(I(?:s(?:ai[ai](?:[ai])?ha|aa(?:[ai](?:[ai])?ha|ha)|i(?:[ai](?:[ai](?:[ai])?ha|ha)|ha)|ai[ai](?:[ai])?h|aa(?:[ai](?:[ai])?h|h)|i[ai](?:[ai](?:[ai])?h|h)|(?:aish|ai?h)a|aish|ai?h|sah|ai?)?|a))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*(?:Kingdoms|S(?:(?:amu[ae]l[ls]|ma)|(?:a(?:m(?:u[ae]l)?)?|m)))|(?:2(?:nd)?|II)\.\s*(?:Kingdoms|S(?:(?:amu[ae]l[ls]|ma)|(?:a(?:m(?:u[ae]l)?)?|m)))|(?:2nd|II)\s*(?:Kingdoms|S(?:(?:amu[ae]l[ls]|ma)|(?:a(?:m(?:u[ae]l)?)?|m)))|2(?:\s*Kingdoms|(?:(?:(?:\s*Samu[ae]l[ls]|Sam)|\s*Sma)|\s*S(?:(?:a(?:m(?:u[ae]l)?)?)?|m)))))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:First\s*(?:Kingdoms|S(?:(?:amu[ae]l[ls]|ma)|(?:a(?:m(?:u[ae]l)?)?|m)))|(?:(?:1st|I)|1)\.\s*(?:Kingdoms|S(?:(?:amu[ae]l[ls]|ma)|(?:a(?:m(?:u[ae]l)?)?|m)))|(?:1st|I)\s*(?:Kingdoms|S(?:(?:amu[ae]l[ls]|ma)|(?:a(?:m(?:u[ae]l)?)?|m)))|1\s*Kingdoms|1\s*Samu[ae]l[ls]|1\s*Sa(?:m(?:u[ae]l)?)?|Samu[ae]l[ls]|Samu[ae]l|1\s*Sma|1\s*Sm|1Sam|1\s*S))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Fourth\s*Kingdoms|(?:4(?:th)?\.|IV\.)\s*Kingdoms|Second\s*K(?:i?ng?s|(?:i?g|i?)s)|(?:4(?:th)?\s*|IV\s*)Kingdoms|Second\s*K(?:i?ng?|i?g|i)?|(?:2(?:nd)?|II)\.\s*K(?:i?ng?s|(?:i?g|i?)s)|(?:2(?:nd)?|II)\.\s*K(?:i?ng?|i?g|i)?|(?:2(?:nd)?|II)\s*K(?:i?ng?s|(?:i?g|i?)s)|(?:2(?:nd)?|II)\s*K(?:i?ng?|i?g|i)?|2Kgs))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Third\s*Kingdoms|(?:III\.|3(?:rd)?\.)\s*Kingdoms|(?:III\s*|3(?:rd)?\s*)Kingdoms|First\s*K(?:i?ng?s|(?:i?g)?s)|First\s*K(?:i?ng?|i?g|i)?|(?:1(?:st)?\.|I\.)\s*K(?:i?ng?s|(?:i?g)?s)|(?:1(?:st)?\.|I\.)\s*K(?:i?ng?|i?g|i)?|(?:1(?:st)?\s*|I\s*)K(?:i?ng?s|(?:i?g)?s)|(?:1(?:st)?\s*|I\s*)K(?:i?ng?|i?g|i)?|(?:K(?:(?:in)?|n)g|1Kg)s|Kin))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*(?:Paralipomenon|C(?:(?:h?oron[io]cles|hr(?:(?:onicals|n)|onicles)|(?:hrono|ron[io])cles)|(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)))|(?:2(?:nd)?|II)\.\s*(?:Paralipomenon|C(?:(?:h?oron[io]cles|hr(?:(?:onicals|n)|onicles)|(?:hrono|ron[io])cles)|(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)))|(?:2nd|II)\s*(?:Paralipomenon|C(?:(?:h?oron[io]cles|hr(?:(?:onicals|n)|onicles)|(?:hrono|ron[io])cles)|(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)))|2\s*Paralipomenon|2\s*Ch?oron[io]cles|2\s*Ch?oron[io]cle|2(?:(?:\s*Chr(?:onicals|n)|Chr)|\s*Chronicles)|2\s*C(?:hrono|ron[io])cles|2\s*C(?:hronicle|(?:h(?:r(?:on?)?)?|ron))|2\s*C(?:hrono|ron[io])cle))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:First\s*|(?:(?:(?:1st|I)|1)\.\s*|(?:(?:1st|I)\s*|(?:1\s*)?)))Paralipomenon|First\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|First\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|(?:(?:1st|I)|1)\.\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|(?:(?:1st|I)|1)\.\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|(?:1st|I)\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|(?:1st|I)\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|1\s*Choronicles|(?:(?:1\s*Cho|(?:1\s*)?Ch)rono|1\s*Cron[io])cles|(?:(?:1\s*Cho|(?:1\s*)?Ch)rono|1\s*Cron[io])cle|(?:1\s*)?Chronicals|(?:1\s*)?Chronicles|(?:1\s*Co|Ch?o)ron[io]cles|(?:1\s*)?Chronicle|(?:1\s*Co|Ch?o)ron[io]cle|Cron[io]cles|Cron[io]cle|1\s*C(?:h(?:r(?:on?)?)?|ron)|1(?:\s*Chrn|Chr)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(E(?:zra?|sra))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Neh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ne(?:h(?:[ei]m(?:a[ai](?:[ai])?h|i(?:a[ai]h|i(?:[ai])?h|a?h|a)|ah)|amiah|amia)?)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["GkEsth"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Esther\s*\(Greek\)|G(?:(?:r(?:eek\s*Esther|\s*Esth)|k\s*?Esth)|(?:r(?:eek\s*Esth?|\s*Est)|k\s*Est))))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Esth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Es(?:t(?:h?er|hr|h)?)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Job"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Jo?b)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ps"],
        testament: "oa",
        testament_books: { "Ps": "oa" },
        extra: "1",
        // Allow Psalm 151 here and remove it later if it's irrelevant. That avoids cases like `151st Psalm verse 2` turning into `Ps.1.2`.
        regexp: /\b((?:(?:(?:1[02-5]|[2-9])?(?:1\s*st|2\s*nd|3\s*rd))|1?1[123]\s*th|(?:150|1[0-4][04-9]|[1-9][04-9]|[4-9])\s*th)\s*Psalm)\b/gi
        // no need for `u`
      },
      {
        osis: ["Ps"],
        testament: "oa",
        testament_books: { "Ps": "oa" },
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:s(?:a(?:(?:lm[alm]|ml?m)|lam)|m(?:alm|l)|lam)|l(?:a(?:sm)?a|s(?:sss|a?m)))s?|P(?:s(?:a[al]l|lal)|a(?:ls|sl))ms?|P(?:(?:s(?:a(?:(?:lm?s|m(?:l[as]|s)|aa)|las)|m(?:als|m)|lm[ms]|sm)|la(?:sm?s|ms)|(?:s(?:a(?:ma|am)|lma)|l(?:ama|m))s|a(?:s(?:(?:ml|s)|m)s|(?:l[lm]|m[ls])s))|(?:s(?:a(?:lm?|ml?)?|ala|m(?:al?)?|l[am]|s)?|l(?:a(?:sm?|m)|s(?:ss?|a))))|Salms?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrAzar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Pr(?:ayer(?:s\s*of\s*Azariah?|\s*of\s*Azariah?)|\s*of\s*Azariah?)|Prayer(?:s\s*of\s*Azariah?|\s*of\s*Azariah?)|Pr\s*of\s*Azariah?|Pr(?:\s*Aza|Aza?)r|Azariah?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Prov"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:rob|o)verbs|P(?:(?:(?:(?:r(?:(?:(?:over|v)|ver)|ever)bs|v)|r(?:overb|everb|verb|ov?|vb|v)?)|rovebs)|roberbs)|Porverbs|Oroverbs))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eccl"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ec(?:(?:(?:(?:cles(?:i?aia|sai)s|cles(?:i(?:ai)?s|ai?s)|clesiias)t|(?:cles(?:i(?:asti|t)|ait)|clesias?t))es|clesiaas?tes|clessias?tes|les(?:(?:i(?:aia)?s|ias?)tes|sias?tes))|(?:clesiaste|c(?:l(?:es(?:iast)?)?)?|clesiate|l(?:esiaste)?)?)|Qo(?:h(?:eleth)?)?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["SgThree"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:The\s*Song\s*of\s*(?:the\s*(?:Three\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s)|3\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s))|Three\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s)|3\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s))|S(?:ong\s*of\s*(?:the\s*(?:Three\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s)|3\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s))|Three\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s)|3\s*(?:Holy\s*Children|Young\s*Men|(?:Youth|Jew)s))|(?:(?:\.\s*(?:of\s*(?:Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|\s*(?:of\s*(?:Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|ong\s*Three|(?:ng\s*|g)Three|g\s*Three)|g\s*Thr))))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Song"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Song(?:s\s*of\s*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?)|\s*of\s*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))|Songs?\s*of\s*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?)|S(?:(?:\s*of\s*S|o[Sl]|S)|o(?:n(?:gs?)?)?)|Sn?gs?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jer"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:er(?:(?:em(?:aia|ii)|am[ai]i|im(?:i[ai]|a))h|em(?:(?:(?:ai?h|ie)|iah)|iha)|am(?:i(?:ah|ha)|ah)|imih|aiah|m[im]ah)|e(?:r(?:emia|emih|ami[ah]|e(?:mi)?)?)?|r))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(E(?:ze[ei]ki?el|zi(?:[ei]ki?el|ki?el)|x[ei](?:[ei]ki?el|ki?el)|zek(?:i[ae]|e)l|z(?:ek?|k)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Dan"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(D(?:ani[ae]l|an?|[ln]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(H(?:osea|os?|s))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Joel"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:oel?|l))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Amos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Am(?:o?s|o)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Obad"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ob(?:adiah|a(?:d(?:ia)?)?|idah|d)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:on(?:ah)?|nh))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mic"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Mi(?:c(?:hah?|ah?)?)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Nah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Na(?:h(?:um?)?)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hab"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Hab(?:bak(?:k[au]kk?|[au]kk?)|ak(?:k[au]kk?|[au]kk?)|k)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zeph"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Z(?:ephanaiah?|ephaniah?|a(?:phaniah?|faniah?)|efaniah?|eph?|ph?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hag"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(H(?:ag(?:gia[hi]|g?ai|g)?|gg?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zech"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Z(?:a(?:(?:ch[ae]r(?:(?:a[ai]|a)h|ii?h)|kariah)|ch?)|(?:ach[ae]ria|c)h?|e(?:c(?:h[ae]r(?:(?:a[ai]|a)h|ii?h)|h?)|ch[ae]riah?|kariah?)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mal"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Mal(?:ach?i|ichi|ach)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t))|of\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t))|of\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew|t)?|tt?)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mark"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:ark?|rk?|k)|t(?:\.\s*M(?:ark?|rk?|k)|\s*M(?:ark?|rk?|k)))|M(?:ark?|rk?|k))|of\s*(?:S(?:aint\s*M(?:ark?|rk?|k)|t(?:\.\s*M(?:ark?|rk?|k)|\s*M(?:ark?|rk?|k)))|M(?:ark?|rk?|k)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:ark?|rk?|k)|t(?:\.\s*M(?:ark?|rk?|k)|\s*M(?:ark?|rk?|k)))|M(?:ark?|rk?|k))|of\s*(?:S(?:aint\s*M(?:ark?|rk?|k)|t(?:\.\s*M(?:ark?|rk?|k)|\s*M(?:ark?|rk?|k)))|M(?:ark?|rk?|k)))|S(?:aint\s*M(?:ark?|rk?|k)|t(?:\.\s*M(?:ark?|rk?|k)|\s*M(?:ark?|rk?|k)))|M(?:ark?|rk?|k)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Luke"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*L(?:u(?:ke?)?|k)|t(?:\.\s*L(?:u(?:ke?)?|k)|\s*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k))|of\s*(?:S(?:aint\s*L(?:u(?:ke?)?|k)|t(?:\.\s*L(?:u(?:ke?)?|k)|\s*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*L(?:u(?:ke?)?|k)|t(?:\.\s*L(?:u(?:ke?)?|k)|\s*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k))|of\s*(?:S(?:aint\s*L(?:u(?:ke?)?|k)|t(?:\.\s*L(?:u(?:ke?)?|k)|\s*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k)))|S(?:aint\s*L(?:u(?:ke?)?|k)|t(?:\.\s*L(?:u(?:ke?)?|k)|\s*L(?:u(?:ke?)?|k)))|L(?:u(?:ke?)?|k)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:First\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|(?:(?:1st|I)|1)\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|(?:(?:1st|I)|1)\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|1John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|(?:2(?:nd)?|II)\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|(?:2(?:nd)?|II)\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|2John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Third\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|(?:3(?:rd)?|III)\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|(?:3(?:rd)?|III)\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|oh?|h?n|h)|3John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|t(?:\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n))|of\s*(?:S(?:aint\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|t(?:\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|t(?:\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n))|of\s*(?:S(?:aint\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|t(?:\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|S(?:aint\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|t(?:\.\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)|\s*J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))|J(?:o?phn|o(?:h[mn]|nh)|(?:h[ho]|oo)n|o?h|h?n)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Acts"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Acts\s*of\s*the\s*Apostles|Ac(?:ts\s*of\s*the\s*Apostles|(?:tsss|(?:t(?:ss?)?)?))))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rom"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(R(?:omands|o(?:m(?:a(?:ns|sn)|s)|s)|oamns|pmans|o(?:m(?:an)?)?|mn?s|mn?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)ans|(?:or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|or(?:in|ni)thain)s|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)ns|orin[an]thians|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)ns|o(?:r(?:inthia?ns|thians)|(?:r(?:in(?:t(?:h(?:ian)?)?)?|th(?:ian)?)?)?)|oranthians)|(?:2(?:nd)?|II)\.\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)ans|(?:or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|or(?:in|ni)thain)s|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)ns|orin[an]thians|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)ns|o(?:r(?:inthia?ns|thians)|(?:r(?:in(?:t(?:h(?:ian)?)?)?|th(?:ian)?)?)?)|oranthians)|(?:2(?:nd)?|II)\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)ans|(?:or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|or(?:in|ni)thain)s|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)ns|orin[an]thians|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)ns|o(?:r(?:inthia?ns|thians)|(?:r(?:in(?:t(?:h(?:ian)?)?)?|th(?:ian)?)?)?)|oranthians)|2Cor))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Coriinthii|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthii|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthoi|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corn(?:in?thi|thii)|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corrin?thi|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corithii|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Coritho)ans|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthi(?:an[ao]|na)|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinithina|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corin|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Cor)ithan|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corn(?:in?than|thin)|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corin|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corni)thain|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthan|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corithin)s|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthi(?:a[ai]|o)|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinithia|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Coriinthia|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corin|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Cor)ithai|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corn(?:inthai|thia)|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corin|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corni)thaia|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corrin?tha|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corntha)i|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthoa|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinti[ao]|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corithia)ns|(?:First\s*Corin[an]|(?:(?:1st|I)|1)\.\s*Corin[an]|(?:(?:1st|I)|1)\s*Corin[an])thians|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Chor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)ns|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthia?ns|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Coranthians|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Corinthian|First\s*Corthians|First\s*Co(?:r(?:th(?:ian)?|in(?:th?)?)?)?|(?:(?:1st|I)|1)\.\s*Corthians|(?:(?:1st|I)|1)\.\s*Co(?:r(?:th(?:ian)?|in(?:th?)?)?)?|(?:(?:1st|I)|1)\s*Corthians|C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)ans|(?:or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|or(?:in|ni)thain)s|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)ns|orin[an]thians|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)ns|orinthi(?:a?ns|an))|(?:(?:1st|I)|1)\s*Co(?:r(?:th(?:ian)?|in(?:th?)?)?)?|1Cor))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Gal"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(G(?:al(?:at(?:i(?:an[ai]|nan|on[an])|a?n|on)s|at(?:i(?:a[ai]|oa)|a[ao]|oa)ns|at[ai]i(?:[ao])?ns|lati(?:[ao])?ns|at(?:i(?:an?s|na?s|on?s)|as))|a(?:l(?:a(?:t(?:ian)?)?)?)?|l))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eph"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(E(?:pehesians|sphesians|ph(?:es(?:ian[ds]|ains)|isians|sians)|phesions|hp[ei]sians|p(?:h(?:e(?:s(?:ian)?)?|esain|isian|sian|s)?)?|pesians|hp))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ph(?:il(?:l(?:ip(?:pi?ai|aia|i(?:a[ai]|ea))|p(?:ie|a))|ippia[ai]|ip(?:pai|e)a|ipp?ie|ipaia|pai)ns|il(?:l(?:ip(?:(?:pi[ei]|ii)|ppi)|l(?:ip[ip]i|pp?i))|ipp?ii|ppii|pppi|pe)ans|il(?:(?:ipppi|(?:ippe|i?pi))ans|l(?:(?:ip(?:pian|ai?n|ian)|(?:ipp?ea|pp?ia)n)|lipian)s|ip(?:pian|(?:p[ai]n|ai?n))s|ppians|pan)|i(?:l(?:(?:ipppi|(?:ippe|i?pi))an|l(?:i(?:p(?:pian|ai?n|ian)|p?)|(?:ipp?ea|pp?ia)n|lipian)|ip(?:pian|(?:p[ai]n|ai?n))|ppian|i(?:pp?)?|pp?)?)?|il(?:(?:ip(?:pai|e)|i?pi)n|lip(?:ie?n|p[ai]n))s|l(?:ip(?:p?ians|p)?|pp?)|p))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Col"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(C(?:al(?:l(?:os(?:sia|i[ao])ns|asi[ao]ns)|(?:[ao]s|[ao])si[ao]ns)|o(?:lossians|(?:l(?:oss(?:ian)?)?)?)|(?:oloss(?:io|a)|(?:(?:olas|ol[ao])|oll[ao])si[ao])ns))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*Th(?:es(?:(?:(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|(?:(?:s(?:alon[ai]n|olonin)|alonin)|s))|s?elonain)s|salon(?:ain|i[ao]n)s?|(?:so|a)lonians?|s?elonians?|olonians?|s)?|sss?|s)?|(?:2(?:nd)?|II)\.\s*Th(?:es(?:(?:(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|(?:(?:s(?:alon[ai]n|olonin)|alonin)|s))|s?elonain)s|salon(?:ain|i[ao]n)s?|(?:so|a)lonians?|s?elonians?|olonians?|s)?|sss?|s)?|(?:2(?:nd)?|II)\s*Th(?:es(?:(?:(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|(?:(?:s(?:alon[ai]n|olonin)|alonin)|s))|s?elonain)s|salon(?:ain|i[ao]n)s?|(?:so|a)lonians?|s?elonians?|olonians?|s)?|sss?|s)?|2Thess))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonic(?:i[ae]|a)|(?:First\s*Thessaloni[ao]|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonai|(?:(?:1st|I)|1)\.\s*Thessaloni[ao]|(?:(?:1st|I)|1)\s*Thessaloni[ao])a|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessaloniio|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessaloncie|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonoi|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalone|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thesaloni[ci])a|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thes|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*The)sallonia|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonie|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonoa|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thesalonio)n|(?:First\s*Thess?e|(?:(?:1st|I)|1)\.\s*Thess?e|(?:(?:1st|I)|1)\s*Thess?e)lonain|First\s*Thessalonin|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonan|(?:(?:1st|I)|1)\.\s*Thessalonin|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thesalonin|(?:(?:1st|I)|1)\s*Thessalonin|1Thes)s|(?:(?:(?:(?:First\s*Thessaloni[ao]|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonai|(?:(?:1st|I)|1)\.\s*Thessaloni[ao]|(?:(?:1st|I)|1)\s*Thessaloni[ao])n|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thss)|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thess)|(?:(?:First\s*Thess?e|(?:(?:1st|I)|1)\.\s*Thess?e|(?:(?:1st|I)|1)\s*Thess?e)|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thesa|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Theso))lonian)s|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessoloni(?:ans?|ns)|(?:First\s*Thessaloni[ao]|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thessalonai|(?:(?:1st|I)|1)\.\s*Thessaloni[ao]|(?:(?:1st|I)|1)\s*Thessaloni[ao])n|(?:(?:First\s*Thess?e|(?:(?:1st|I)|1)\.\s*Thess?e|(?:(?:1st|I)|1)\s*Thess?e)|(?:(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thesa|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Theso))lonian|Thes(?:s(?:(?:al(?:on(?:i(?:c(?:i[ae]|a)|[ao]a|io)|aia|cie|oa)|on(?:oi|e)a|lonia)n|elonain|alon[ai]n)s|(?:alon(?:ain|i[ao]n)|elonian)s|oloni(?:ans?|ns)|alon(?:ain|i[ao]n)|elonian)|(?:(?:(?:aloni[ci]a|allonia|alonio)|aloni)|elonai)ns|(?:[ao]|e)lonians|(?:[ao]|e)lonian)|First\s*Th(?:ess?|s)?|(?:(?:1st|I)|1)\.\s*Th(?:ess?|s)?|(?:First|(?:(?:(?:1st|I)|1)\.|(?:(?:1st|I)|1)))\s*Thss|(?:(?:1st|I)|1)\s*Th(?:ess?|s)?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*T(?:himothy|imoth?y|himoty|omothy|i(?:m(?:oth)?)?|m)|(?:2(?:nd)?|II)\.\s*T(?:himothy|imoth?y|himoty|omothy|i(?:m(?:oth)?)?|m)|(?:2(?:nd)?|II)\s*T(?:himothy|imoth?y|himoty|omothy|i(?:m(?:oth)?)?|m)|2Tim))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:First\s*T(?:himothy|imoth?y|himoty|omothy|i(?:m(?:oth)?)?|m)|(?:(?:1st|I)|1)\.\s*T(?:himothy|imoth?y|himoty|omothy|i(?:m(?:oth)?)?|m)|(?:(?:1st|I)|1)\s*T(?:himothy|imoth?y|himoty|omothy|i(?:m(?:oth)?)?|m)|Timothy|Timoth|1Tim))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Titus"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ti(?:t(?:us)?)?)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ph(?:ile(?:m(?:on)?)?|l[ei]mon|l?mn|l?m))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Heb"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(H(?:e[ew]breww?s|w(?:[ew]breww?s|breww?s)|eb(?:r(?:(?:eww|we)|rw)|e(?:rw|w[erw])|w(?:er|re))s|eb(?:r(?:ew?s|ws|s)|(?:rew)?)|breww?s))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jas"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:(?:ame|m)s?|a(?:m?|s)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*P(?:(?:ete|t)r?|et?r|et?)?|(?:2(?:nd)?|II)\.\s*P(?:(?:ete|t)r?|et?r|et?)?|(?:2(?:nd)?|II)\s*P(?:(?:ete|t)r?|et?r|et?)?|2Pet))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:First\s*P(?:(?:ete|t)r?|et?r|et?)?|(?:(?:1st|I)|1)\.\s*P(?:(?:ete|t)r?|et?r|et?)?|(?:(?:1st|I)|1)\s*P(?:(?:ete|t)r?|et?r|et?)?|Peter|1Pet))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ju?de)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Tob"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(T(?:ob(?:i(?:as|t)|i|t)?|b))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jdt"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:ud(?:ith?|th?)|d(?:ith?|th?)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(B(?:ar(?:uch)?|r))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sus"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(S(?:us(?:annah|(?:anna)?)|hoshana))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:2(?:nd)?|II)\.\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:2nd|II)\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|2(?:\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:(?:Mac|\s*M)c|\s*Ma))))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Third\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:3(?:rd)?|III)\.\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:3rd|III)\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|3(?:\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:Mac|\s*M)c)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["4Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Fourth\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:4(?:th)?|IV)\.\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:4th|IV)\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|4(?:\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|e|s)?|ab(?:b(?:e(?:(?:ee?s|s)|(?:ee?)?)|be(?:e[es]|e|s)?)|e(?:(?:ee?s|s)|(?:ee?)?))|cabe(?:ee?)?|c(?:ca|ab)bbe|cc?)?|(?:Mac|\s*M)c)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:First\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|First\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|(?:(?:1st|I)|1)\.\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|(?:(?:1st|I)|1)\.\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|(?:1st|I)\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|(?:1st|I)\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|1(?:\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|(?:Mac|\s*M)c)|1\s*Ma(?:c(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?)?|Maccabees))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek", "Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ez)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
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
        osis: ["John", "Jonah", "Job", "Josh", "Joel"],
        testament: "on",
        testament_books: { "Job": "o", "Joel": "o", "John": "n", "Jonah": "o", "Josh": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(Jo)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude", "Judg"],
        testament: "on",
        testament_books: { "Jude": "n", "Judg": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:ud?|d))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt", "Mark", "Mal"],
        testament: "on",
        testament_books: { "Mal": "o", "Mark": "n", "Matt": "n" },
        regexp: /(?:^|(?<=[^\p{L}]))(Ma)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil", "Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ph)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
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

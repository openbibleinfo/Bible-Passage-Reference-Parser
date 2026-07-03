var bcv_regexps = class {
  constructor() {
    this.books = [];
    this.languages = ["ita"];
    this.translations = [/(?:N(?:R(?:1994|2006)|D)|CEI|LND|NR)\b/gi];
    this.first = /(?:Primo\.?\s*|Prima\.?\s*|1°\.?\s*|1\.?\s*|I\.?\s*)/;
    this.second = /(?:Secondo\.?\s*|Seconda\.?\s*|2°\.?\s*|2\.?\s*|II\.?\s*)/;
    this.third = /(?:Terzo\.?\s*|Terza\.?\s*|3°\.?\s*|3\.?\s*|III\.?\s*)/;
    this.range_and = /(?:[&\u2013\u2014-]|(?:vedi\s*anche\.?\s*|vedi\.?\s*|cfr\.?\s*|e\.?\s*)|al\.?\s*)/;
    this.range_only = /(?:[\u2013\u2014-]|al\.?\s*)/;
    this.match_end_split = /\d\W*(?:titolo)|\d\W*(?:(?:ss|\x2c\s*ecc|ecc))(?:[\s*]*\.)?|\d[\s*]*(?:(?:a|b|c|d))|\x1e(?:[\s*]*[)\]\uff09])?|[\d\x1f]/gi;
    this.control = /[\x1e\x1f]/g;
    this.escaped_passage = /(?:^|[^\x1e\x1f\p{L}\p{N}])((?:(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:[\u2013\u2014\-]|through|thru|to)\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:\d+(?:th|nd|st)\s*ch(?:apter|a?pt\.?|a?p?\.?)?\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*))?\x1f(\d+)(?:\/\d+)?\x1f(?:\/\d+\x1f|[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—]|titolo\.?\s*(?![a-z])|(?:(?:c(?:ap(?:itol[io]|p)?|c)\.?\s*)|(?:versetto\.?\s*|versetti\.?\s*|versi\.?\s*|vv\.?\s*|vv\.?\s*|v\.?\s*(?!\p{L}))|(?:(?:,\s*ecc|ecc|ss)\.?\s*)|(?:(?:vedi(?:\s*anche)?|cfr|e)\.?\s*)|(?:al\.?\s*))|(?:[a-d]\.?\s*)(?!\w)|$)+)/giu;
    this.pre_book = /(?:^|(?<=[^\p{L}]))/gu;
    this.pre_number_book = /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))/gu;
    this.post_book = /(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/gu;
    this.all_books = [
          {
            osis: ["Ps"],
            testament: "a",
            extra: "2",
            regexp: /\b(Ps151)(?=\.1\b)/g
          },
          {
            osis: ["Gen"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Ge(?:n(?:esi)?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Exod"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(E(?:s(?:odo)?|xod))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Bel"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(Bel(?:\s*e\s*il\s*Drago)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Lev"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(L(?:evitico|ev?|v))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Num"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(N(?:u(?:m(?:eri)?)?|m))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sir"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:S(?:(?:apienza\s*di\s*Sirac(?:ide|h)|ir[aà]cide)|ir)|Ecclesiastico))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Wis"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Sap(?:ienza\s*di\s*Salomone|(?:ienza)?)|Wis))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Lam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(La(?:m(?:entazioni)?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["EpJer"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Let(?:tera\s*di\s*Geremia|-ger)|EpJer))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Rev"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ap(?:ocalisse\s*di\s*Giovanni|(?:ocalisse)?)|R(?:iv(?:elazione)?|ev)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["PrMan"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Orazione\s*di\s*Manasse(?:\s*Re\s*di\s*Giuda)?|Pr(?:eghiera\s*di\s*Manasse|Man)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Deut"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(D(?:euteronomio|e(?:ut)?|t))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Josh"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:iosu[eèé]|s)|Josh))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Judg"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:iudici|dc)|Judg))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ruth"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(R(?:u(?:th?)?|t))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao](?:\.\s*[EÉ]sdras|\s*[EÉ]sdras)|(?:1°|I)(?:\.\s*[EÉ]sdras|\s*[EÉ]sdras)|1(?:\.\s*[EÉ]sdras|\s*[EÉ]sdras)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao](?:\.\s*[EÉ]sdras|\s*[EÉ]sdras)|(?:2°|II)(?:\.\s*[EÉ]sdras|\s*[EÉ]sdras)|2(?:\.\s*[EÉ]sdras|\s*[EÉ]sdras)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Esdra\s*greco|1(?:(?:\s*Esdra|Esd)|\s*Esd)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Esd(?:ra)?|Esd))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Esdra|(?:1°|I)\.?\s*Esdra|1\.?\s*Esdra))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Terz[ao]\.?\s*Esdra|(?:III|3°)\.?\s*Esdra|3\.?\s*Esdra))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Quart[ao]\.?\s*Esdra|(?:4°|IV)\.?\s*Esdra|4\.?\s*Esdra))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Esdra|(?:2°|II)\.?\s*Esdra|2\.?\s*Esdra))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ezra"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Esdra)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Isa"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Is(?:a(?:ia)?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Samuele|(?:1°|I)\.?\s*Samuele|1\.?\s*Samuele))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Samuele|(?:2°|II)\.?\s*Samuele|2\.?\s*Samuele))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*S(?:amuele|(?:am)?)|Sam))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*S(?:amuele|(?:am)?)|Sam))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Re|(?:1°|I)\.?\s*Re|1\.?\s*Re))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Re|(?:2°|II)\.?\s*Re|2\.?\s*Re))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Re?|Kgs))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*Re?|Kgs))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Cronache|(?:1°|I)\.?\s*Cronache|1\.?\s*Cronache))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Cronache|(?:2°|II)\.?\s*Cronache|2\.?\s*Cronache))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Cr(?:onache)?|Chr))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*Cr(?:onache)?|Chr))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ezra"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(E(?:zra|s?d))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Neh"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Ne(?:emia|h)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["GkEsth"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ester\s*(?:\((?:versione\s*greca|greco)\)|greco)|GkEsth))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Esth"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(E(?:st(?:er|h)?|t))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Job"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:iobbe|b)|Job))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ps"],
            testament: "oa",
            testament_books: { Ps: "oa" },
            extra: "1",
            regexp: /(?:^|(?<=[^\p{L}]))((?:(?:1(?:5[01]|[6-9])\s*|15?\s*)º|(?:1[0-4]|[2-9])(?:[0-9])?\s*º)\s*Salmo)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ps"],
            testament: "oa",
            testament_books: { Ps: "oa" },
            regexp: /(?:^|(?<=[^\p{L}]))((?:S(?:al(?:m[io])?|l)|Ps))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["PrAzar"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(Pr(?:eghiera\s*di\s*Azaria|Azar))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Prov"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Pr(?:ov(?:erbi)?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Eccl"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ec(?:clesiaste|(?:cl?)?)|Qo(?:(?:h[eè]|[eè])let)?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["SgThree"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Cantico\s*dei\s*tre\s*(?:giovani\s*nella\s*fornace|fanciulli)|SgThree))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Song"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:C(?:(?:antico\s*d(?:ei\s*[Cc]antici|i\s*Salomone)|t)|a(?:ntico)?)|Song))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jer"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Jer(?:emiah)?|G(?:(?:eremia|r)|er)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ezek"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Ez(?:e(?:chiele|k))?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Dan"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(D(?:aniele|an?|n))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Hos"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Os(?:ea)?|Hos))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Joel"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:(?:ioele|l)|ioe)|Joel))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Amos"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Am(?:os)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Obad"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:O(?:vadia|bad)|Abdia|Ab?d))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jonah"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:(?:iona|n)|io)|Jonah))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mic"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Mi(?:c(?:hea)?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Nah"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Na(?:h?um|h)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Hab"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:A(?:(?:bacu)?c|b)|Hab))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Zeph"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:So(?:fonia|f?)|Zeph))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Hag"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ag(?:geo)?|Hag))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Zech"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Z(?:accaria|ech|ac?|c))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mal"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(M(?:al(?:achia)?|l))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Matt"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Vangelo\s*di(?:(?:\s*San)?\.\s*|\s*(?:San\s*)?)Matteo)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Matt"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Matteo)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Matt"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(M(?:at)?t)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mark"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Vangelo\s*di(?:(?:\s*San)?\.\s*|\s*(?:San\s*)?)Marco)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mark"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Marco)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mark"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(M(?:ark|[cr]))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Luke"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Vangelo\s*di(?:(?:\s*San)?\.\s*|\s*(?:San\s*)?)Luca)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Luke"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Luca)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Luke"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(L(?:u(?:ke)?|c))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prima\s*lettera\s*di\s*Giovanni|1(?:\s*Giovanni|(?:John|\s*Gv))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Seconda\s*lettera\s*di\s*Giovanni|2(?:\s*Giovanni|(?:John|\s*Gv))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Terza\s*lettera\s*di\s*Giovanni|3(?:\s*Giovanni|(?:John|\s*Gv))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Giovanni|(?:1°|I)\.?\s*Giovanni|1\.?\s*Giovanni))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Giovanni|(?:2°|II)\.?\s*Giovanni|2\.?\s*Giovanni))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Terz[ao]\.?\s*Giovanni|(?:III|3°)\.?\s*Giovanni|3\.?\s*Giovanni))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Vangelo\s*di(?:(?:\s*San)?\.\s*|\s*(?:San\s*)?)Giovanni)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(Giovanni)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:John|Gv))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Acts"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(A(?:t(?:ti\s*degli\s*Apostoli|(?:ti)?)|cts))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Rom"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*ai\s*Romani|R(?:omani|(?:om?|m))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Corinzi|(?:1°|I)\.?\s*Corinzi|1\.?\s*Corinzi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Corinzi|(?:2°|II)\.?\s*Corinzi|2\.?\s*Corinzi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Seconda\s*lettera\s*ai\s*Corinzi|2(?:\s*Corinzi|(?:\s*Cor?|Cor))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prima\s*lettera\s*ai\s*Corinzi|1(?:\s*Corinzi|(?:\s*Cor?|Cor))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Gal"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*ai\s*Galati|G(?:a(?:lati|l?)|àlati)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Eph"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*agli\s*Efesini|E(?:fesini|(?:ph|f))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Phil"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*ai\s*Filippesi|Filippesi|(?:(?:Phi|F)|Fi)l))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Col"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*ai\s*Colossesi|Colossesi|Co?l))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Tessalonicesi|(?:1°|I)\.?\s*Tessalonicesi|1\.?\s*Tessalonicesi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Tessalonicesi|(?:2°|II)\.?\s*Tessalonicesi|2\.?\s*Tessalonicesi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Seconda\s*lettera\s*ai\s*Tessalonicesi|2(?:\s*Tessalonicesi|(?:(?:Thes|\s*T)s|\s*Te))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prima\s*lettera\s*ai\s*Tessalonicesi|1(?:\s*Tessalonicesi|(?:(?:Thes|\s*T)s|\s*Te))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Timoteo|(?:1°|I)\.?\s*Timoteo|1\.?\s*Timoteo))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Timoteo|(?:2°|II)\.?\s*Timoteo|2\.?\s*Timoteo))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Seconda\s*lettera\s*a\s*Timoteo|2(?:\s*Timoteo|(?:\s*Tim?|(?:\s*T|Ti)m))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prima\s*lettera\s*a\s*Timoteo|1(?:\s*Timoteo|(?:\s*Tim?|(?:\s*T|Ti)m))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Titus"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*a\s*Tito|T(?:it(?:us|o)|t)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Phlm"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*a\s*Filemone|Fil[eè]mone|(?:Phl|F)m|Fi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Heb"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*agli\s*Ebrei|Ebrei|(?:He|E)b))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jas"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*di\s*Giacomo|Giacomo|Jas|G[cm]))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Pietro|(?:1°|I)\.?\s*Pietro|1\.?\s*Pietro))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Pietro|(?:2°|II)\.?\s*Pietro|2\.?\s*Pietro))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Seconda\s*lettera\s*di\s*Pietro|2(?:\s*Pietro|(?:(?:\s*P|Pe)t|\s*P))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prima\s*lettera\s*di\s*Pietro|1(?:\s*Pietro|(?:(?:\s*P|Pe)t|\s*P))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jude"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Lettera\s*di\s*Giuda|Giuda|Jude|Gd))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Tob"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(T(?:ob(?:i(?:olo|a)?)?|b))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jdt"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:iuditta|dt)|Jdt))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Bar"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(Bar(?:uch?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sus"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(S(?:toria\s*di\s*Susanna|us(?:anna)?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prim[ao]\.?\s*Maccabei|(?:1°|I)\.?\s*Maccabei|1\.?\s*Maccabei))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Second[ao]\.?\s*Maccabei|(?:2°|II)\.?\s*Maccabei|2\.?\s*Maccabei))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Terz[ao]\.?\s*Maccabei|(?:III|3°)\.?\s*Maccabei|3\.?\s*Maccabei))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["4Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Quart[ao]\.?\s*Maccabei|(?:4°|IV)\.?\s*Maccabei|4\.?\s*Maccabei))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Secondo\s*libro\s*dei\s*Maccabei|2\s*Maccabei|2(?:\s*Ma|Mac)c))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Terzo\s*libro\s*dei\s*Maccabei|3\s*Maccabei|3(?:\s*Ma|Mac)c))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["4Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Quarto\s*libro\s*dei\s*Maccabei|4\s*Maccabei|4(?:\s*Ma|Mac)c))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Primo\s*libro\s*dei\s*Maccabei|1\s*Maccabei|1(?:\s*Ma|Mac)c))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["AddEsth"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(A(?:ggiunte\s*a\s*Ester|ddEsth))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          }
        ];
  }
};

var bcv_translations = class {
  constructor() {
    this.aliases = { current: { system: "current", osis: "" }, default: { system: "default", osis: "" } };
    this.current_system = "default";
    this.systems = {
          current: {},
          default: {
            order: {
              Gen: 1,
              Exod: 2,
              Lev: 3,
              Num: 4,
              Deut: 5,
              Josh: 6,
              Judg: 7,
              Ruth: 8,
              "1Sam": 9,
              "2Sam": 10,
              "1Kgs": 11,
              "2Kgs": 12,
              "1Chr": 13,
              "2Chr": 14,
              Ezra: 15,
              Neh: 16,
              Esth: 17,
              Job: 18,
              Ps: 19,
              Prov: 20,
              Eccl: 21,
              Song: 22,
              Isa: 23,
              Jer: 24,
              Lam: 25,
              Ezek: 26,
              Dan: 27,
              Hos: 28,
              Joel: 29,
              Amos: 30,
              Obad: 31,
              Jonah: 32,
              Mic: 33,
              Nah: 34,
              Hab: 35,
              Zeph: 36,
              Hag: 37,
              Zech: 38,
              Mal: 39,
              Matt: 40,
              Mark: 41,
              Luke: 42,
              John: 43,
              Acts: 44,
              Rom: 45,
              "1Cor": 46,
              "2Cor": 47,
              Gal: 48,
              Eph: 49,
              Phil: 50,
              Col: 51,
              "1Thess": 52,
              "2Thess": 53,
              "1Tim": 54,
              "2Tim": 55,
              Titus: 56,
              Phlm: 57,
              Heb: 58,
              Jas: 59,
              "1Pet": 60,
              "2Pet": 61,
              "1John": 62,
              "2John": 63,
              "3John": 64,
              Jude: 65,
              Rev: 66,
              Tob: 67,
              Jdt: 68,
              GkEsth: 69,
              Wis: 70,
              Sir: 71,
              Bar: 72,
              PrAzar: 73,
              Sus: 74,
              Bel: 75,
              SgThree: 76,
              EpJer: 77,
              "1Macc": 78,
              "2Macc": 79,
              "3Macc": 80,
              "4Macc": 81,
              "1Esd": 82,
              "2Esd": 83,
              PrMan: 84
            },
            chapters: {
              Gen: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
              Exod: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
              Lev: [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
              Num: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
              Deut: [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
              Josh: [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
              Judg: [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
              Ruth: [22, 23, 18, 22],
              "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
              "2Sam": [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
              "1Kgs": [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
              "2Kgs": [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
              "1Chr": [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
              "2Chr": [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
              Ezra: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
              Neh: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
              Esth: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
              Job: [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
              Ps: [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
              Prov: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
              Eccl: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
              Song: [17, 17, 11, 16, 16, 13, 13, 14],
              Isa: [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
              Jer: [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
              Lam: [22, 22, 66, 22, 22],
              Ezek: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
              Dan: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
              Hos: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
              Joel: [20, 32, 21],
              Amos: [15, 16, 15, 13, 27, 14, 17, 14, 15],
              Obad: [21],
              Jonah: [17, 10, 10, 11],
              Mic: [16, 13, 12, 13, 15, 16, 20],
              Nah: [15, 13, 19],
              Hab: [17, 20, 19],
              Zeph: [18, 15, 20],
              Hag: [15, 23],
              Zech: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
              Mal: [14, 17, 18, 6],
              Matt: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
              Mark: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
              Luke: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
              John: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
              Acts: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
              Rom: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
              "1Cor": [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
              "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
              Gal: [24, 21, 29, 31, 26, 18],
              Eph: [23, 22, 21, 32, 33, 24],
              Phil: [30, 30, 21, 23],
              Col: [29, 23, 25, 18],
              "1Thess": [10, 20, 13, 18, 28],
              "2Thess": [12, 17, 18],
              "1Tim": [20, 15, 16, 16, 25, 21],
              "2Tim": [18, 26, 17, 22],
              Titus: [16, 15, 15],
              Phlm: [25],
              Heb: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
              Jas: [27, 26, 18, 17, 20],
              "1Pet": [25, 25, 22, 19, 14],
              "2Pet": [21, 22, 18],
              "1John": [10, 29, 24, 21, 21],
              "2John": [13],
              "3John": [15],
              Jude: [25],
              Rev: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
              Tob: [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 17, 15],
              Jdt: [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25],
              GkEsth: [22, 23, 15, 17, 14, 14, 10, 17, 32, 13, 12, 6, 18, 19, 16, 24],
              Wis: [16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31, 19, 29, 21, 25, 22],
              Sir: [30, 18, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 34, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
              Bar: [22, 35, 37, 37, 9],
              PrAzar: [68],
              Sus: [64],
              Bel: [42],
              SgThree: [39],
              EpJer: [73],
              "1Macc": [64, 70, 60, 61, 68, 63, 50, 32, 73, 89, 74, 53, 53, 49, 41, 24],
              "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 45, 26, 46, 39],
              "3Macc": [29, 33, 30, 21, 51, 41, 23],
              "4Macc": [35, 24, 21, 26, 38, 35, 23, 29, 32, 21, 27, 19, 27, 20, 32, 25, 24, 24],
              "1Esd": [58, 30, 24, 63, 73, 34, 15, 96, 55],
              "2Esd": [40, 48, 36, 52, 56, 59, 70, 63, 47, 59, 46, 51, 58, 48, 63, 78],
              PrMan: [15],
              Ps151: [7]
            }
          }
        };
    this.systems.current = structuredClone(this.systems.default);
  }
};

var bcv_grammar_options_default = {
  ab: /^(?:(?:a|b|c|d))(?!\p{L})/iu,
  and: /^(?:(?:(?:(?:vedi(?:\s+anche)?|cfr|e)\.?\s*)|&))/i,
  c_explicit: /^[\s*]*(?:(?:c(?:ap(?:itol[io]|p)?|c)\.?\s*))[\s*]*/i,
  c_sep_eu: /^\x1f\x1f\x1f/i,
  c_sep_us: /^\x1f\x1f\x1f/i,
  cv_sep_weak: /^(?:[\s*]*["'][\s*]*|[\s*])+/i,
  cv_sep_eu: /^[\s*]*,+[\s*]*/i,
  cv_sep_us: /^[\s*]*(?::+|\.(?!\s*\.\s*\.))[\s*]*/i,
  ff: /^[\s*]*(?:(?:(?:,\s+ecc|ecc|ss)\.?\s*))(?![\p{L}\p{N}])(?:\.(?!\s*\.))?/iu,
  in_book_of: /^[\s*]*(?:from|of|in)[\s*]*(?:the[\s*]*book[\s*]*of[\s*]*)?/i,
  next: /^(?:\x1f\x1f\x1f)/i,
  ordinal: /^(?:th|st|nd|rd)/i,
  range: /^[\s*]*(?:[\-–—]|(?:al\.?\s*))+[\s*]*/i,
  sequence_eu: /^(?:[;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|(?:(?:vedi(?:\s+anche)?|cfr|e)\.?\s*))+/i,
  sequence_us: /^(?:[,;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|(?:(?:vedi(?:\s+anche)?|cfr|e)\.?\s*))+/i,
  space: /^[\s*]+/,
  title: /^[\s*]*(?:(?:titolo\.?\s*))(?!\p{L})[\s*]*/iu,
  v_explicit: /^[\s*]*(?:(?:versetto\.?\s*|versetti\.?\s*|versi\.?\s*|vv\.?\s*|vv\.?\s*|vv\.?\s*|v\.?\s*(?!\p{L})))[\s*]*(?!\p{L})/iu
};
var regexps = bcv_regexps;
var translations = bcv_translations;
var grammar_options = bcv_grammar_options_default;
export {
  grammar_options,
  regexps,
  translations
};
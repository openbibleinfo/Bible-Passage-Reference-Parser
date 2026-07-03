var bcv_regexps = class {
  constructor() {
    this.books = [];
    this.languages = ["slk"];
    this.translations = [/SEB\b/gi];
    this.first = /(?:Prvá\s*kniha\.?\s*|Prva\s*kniha\.?\s*|Prvý\s*list\.?\s*|Prvy\s*list\.?\s*|Prvá\.?\s*|Prva\.?\s*|Prvý\.?\s*|Prvy\.?\s*|1\s*k\.?\s*|I\.?\s*|1\.?\s*)/;
    this.second = /(?:Druhá\s*kniha\.?\s*|Druha\s*kniha\.?\s*|Druhý\s*list\.?\s*|Druhy\s*list\.?\s*|Druhá\.?\s*|Druha\.?\s*|Druhý\.?\s*|Druhy\.?\s*|2\s*k\.?\s*|II\.?\s*|2\.?\s*)/;
    this.third = /(?:Tretia\s*kniha\.?\s*|Tretia\.?\s*|Tretí\.?\s*|Treti\.?\s*|3\s*k\.?\s*|III\.?\s*|3\.?\s*)/;
    this.range_and = /(?:[&\u2013\u2014-]|(?:porov\.?\s*|pozri\.?\s*|alebo\.?\s*|a\.?\s*(?!\p{L}))|(?:až\.?\s*|az\.?\s*|\x2d\.?\s*))/;
    this.range_only = /(?:[\u2013\u2014-]|(?:až\.?\s*|az\.?\s*|\x2d\.?\s*))/;
    this.match_end_split = /\d\W*(?:title)|\d\W*(?:ff)(?:[\s*]*\.)?|\d[\s*]*(?:(?:b|c|d|e))|\x1e(?:[\s*]*[)\]\uff09])?|[\d\x1f]/gi;
    this.control = /[\x1e\x1f]/g;
    this.escaped_passage = /(?:^|[^\x1e\x1f\p{L}\p{N}])((?:(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:[\u2013\u2014\-]|through|thru|to)\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:\d+(?:th|nd|st)\s*ch(?:apter|a?pt\.?|a?p?\.?)?\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*))?\x1f(\d+)(?:\/\d+)?\x1f(?:\/\d+\x1f|[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—]|title\.?\s*(?![a-z])|(?:(?:(?:kap(?:itol[euy]|(?:itol)?)|hlavy)\.?\s*)|(?:ver[sš]ov\.?\s*)|(?:ff\.?\s*)|(?:porov\.?\s*|pozri\.?\s*|alebo\.?\s*|a\.?\s*(?!\p{L}))|(?:(?:a[zž]|-)\.?\s*))|(?:[b-e]\.?\s*)(?!\w)|$)+)/giu;
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
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*(?:stvorenia|p[oô]vodu)|\s*(?:stvorenia|p[oô]vodu))|\.\s*(?:stvorenia|p[oô]vodu)|\s*(?:stvorenia|p[oô]vodu)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Gen"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*Moj[zž]i[sš]ova|[aá]\s*kniha\s*Moj[zž]i[sš]ova|[yý](?:(?:\s*list)?\.\s*Moj[zž]i[sš]ova|\s*(?:list\s*Moj[zž]i[sš]ova|Moj[zž]i[sš]ova))|[aá]\s*Moj[zž]i[sš]ova)|(?:(?:1\s*k|I)|1)\.\s*Moj[zž]i[sš]ova|(?:1\s*k|I)\s*Moj[zž]i[sš]ova|1\s*Moj[zž]i[sš]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Exod"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*Moj[zž]i[sš]ova|[aá]\s*kniha\s*Moj[zž]i[sš]ova|[yý](?:(?:\s*list)?\.\s*Moj[zž]i[sš]ova|\s*(?:list\s*Moj[zž]i[sš]ova|Moj[zž]i[sš]ova))|[aá]\s*Moj[zž]i[sš]ova)|(?:(?:2\s*k|II)|2)\.\s*Moj[zž]i[sš]ova|(?:2\s*k|II)\s*Moj[zž]i[sš]ova|2\s*Moj[zž]i[sš]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Lev"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Tret(?:(?:ia\s*kniha|í)(?:\.\s*Moj[zž]i[sš]ova|\s*Moj[zž]i[sš]ova)|ia?\.\s*Moj[zž]i[sš]ova|i(?:a\s*Moj[zž]i[sš]ova|\s*Moj[zž]i[sš]ova))|(?:3\s*k|III)(?:\.\s*Moj[zž]i[sš]ova|\s*Moj[zž]i[sš]ova)|3(?:\.\s*Moj[zž]i[sš]ova|\s*Moj[zž]i[sš]ova)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Num"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:[SŠ]tvrt[aá](?:(?:\s*kniha)?\.\s*Moj[zž]i[sš]ova|\s*(?:kniha\s*Moj[zž]i[sš]ova|Moj[zž]i[sš]ova))|(?:(?:4\s*k|IV)|4)\.\s*Moj[zž]i[sš]ova|(?:4\s*k|IV)\s*Moj[zž]i[sš]ova|4\s*Moj[zž]i[sš]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Deut"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Piata(?:(?:\s*kniha)?\.\s*Moj[zž]i[sš]ova|\s*(?:kniha\s*Moj[zž]i[sš]ova|Moj[zž]i[sš]ova))|(?:(?:5\s*k|V)|5)\.\s*Moj[zž]i[sš]ova|(?:5\s*k|V)\s*Moj[zž]i[sš]ova|5\s*Moj[zž]i[sš]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Gen"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:(?:enezis|n)|en)|1\s*M))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Exod"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ex(?:odus|(?:od)?)|2\s*M))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Bel"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(B[eé]l(?:\s*a\s*drak)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Lev"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:L(?:(?:evitikus|v)|ev)|3\s*M))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Num"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:N(?:(?:umeri|m)|um)|4\s*M))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sir"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha\.?\s*Sirachovcova|\.?\s*Sirachovcova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sir"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(Sirachovcova)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sir"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*(?:Sirachov(?:ho\s*syn|c)a|Ekleziastikus)|\s*(?:Sirachov(?:ho\s*syn|c)a|Ekleziastikus))|\.\s*(?:Sirachov(?:ho\s*syn|c)a|Ekleziastikus)|\s*(?:Sirachov(?:ho\s*syn|c)a|Ekleziastikus)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sir"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(Sir(?:achovec)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Wis"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:M(?:[uú]dros(?:ti|ť)|[uú]d(?:rost)?)|Wis))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Lam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*n[aá]rekov|\s*n[aá]rekov)|\.\s*n[aá]rekov|\s*n[aá]rekov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Lam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Pla[cč]\s*Jeremi[aá][sš]ov|Jeremi[aá][sš]ov\s*Pla[cč]|[ZŽ]alospevy|[ZŽ]alosp|N[aá]reky|Pla[cč]|N[aá]r|Lam))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["EpJer"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Jeremi[aá][sš]ov\s*list|EpJer))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Rev"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Zjavenie\s*(?:Apo[sš]tola\s*J[aá]n|sv[aä]t[eé]ho\s*J[aá]n|J[aá]n)a|Apokalypsa|Zj(?:av(?:enie)?)?|(?:Zj|Re)v))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["PrMan"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Manasesova\s*modlitba|PrMan))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Deut"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:D(?:(?:euteron[oó]mium|t)|eut)|5\s*M))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Josh"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:J(?:(?:o[sz]|oš)|óz)uova|J(?:(?:o(?:(?:(?:zu[ae]|sh)|sua)|šua)|ózua)|oz)|Iosua))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Judg"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:K\.?\s*sudcov|S(?:udcovia|dc)|Sud(?:cov)?|Judg))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ruth"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(R(?:uth?|út))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*Ezdr[aá][sš]ova|[aá]\s*kniha\s*Ezdr[aá][sš]ova|[yý](?:(?:\s*list)?\.\s*Ezdr[aá][sš]ova|\s*(?:list\s*Ezdr[aá][sš]ova|Ezdr[aá][sš]ova))|[aá]\s*Ezdr[aá][sš]ova)|(?:(?:1\s*k|I)|1)\.\s*Ezdr[aá][sš]ova|(?:1\s*k|I)\s*Ezdr[aá][sš]ova|1\s*Ezdr[aá][sš]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*Ezdr[aá][sš]ova|[aá]\s*kniha\s*Ezdr[aá][sš]ova|[yý](?:(?:\s*list)?\.\s*Ezdr[aá][sš]ova|\s*(?:list\s*Ezdr[aá][sš]ova|Ezdr[aá][sš]ova))|[aá]\s*Ezdr[aá][sš]ova)|(?:(?:2\s*k|II)|2)\.\s*Ezdr[aá][sš]ova|(?:2\s*k|II)\s*Ezdr[aá][sš]ova|2\s*Ezdr[aá][sš]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*Ezdr[aá][sš]|Esd))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Ezdr[aá][sš]|Esd))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*Ezdr[aá][sš]|[aá]\s*kniha\s*Ezdr[aá][sš]|[yý](?:(?:\s*list)?\.\s*Ezdr[aá][sš]|\s*(?:list\s*Ezdr[aá][sš]|Ezdr[aá][sš]))|[aá]\s*Ezdr[aá][sš])|(?:(?:1\s*k|I)|1)\.\s*Ezdr[aá][sš]|(?:1\s*k|I)\s*Ezdr[aá][sš]|1\s*Ezdr[aá][sš]))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Esd"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*Ezdr[aá][sš]|[aá]\s*kniha\s*Ezdr[aá][sš]|[yý](?:(?:\s*list)?\.\s*Ezdr[aá][sš]|\s*(?:list\s*Ezdr[aá][sš]|Ezdr[aá][sš]))|[aá]\s*Ezdr[aá][sš])|(?:(?:2\s*k|II)|2)\.\s*Ezdr[aá][sš]|(?:2\s*k|II)\s*Ezdr[aá][sš]|2\s*Ezdr[aá][sš]))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ezra"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Ezdr[aá][sš])(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Isa"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(I(?:z(?:a[ij][aá][sš])?|sa))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Samuelova|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Samuelova)|(?:(?:(?:1\s*k|I)|1)\.|(?:(?:1\s*k|I)|1))\s*Samuelova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Samuelova|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Samuelova)|(?:(?:(?:2\s*k|II)|2)\.|(?:(?:2\s*k|II)|2))\s*Samuelova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*S(?:amuelova|(?:am)?)|Sam))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Sam"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*S(?:amuelova|(?:am)?)|Sam))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*Kr[aá][lľ]ov|[aá]\s*kniha\s*Kr[aá][lľ]ov|[yý](?:(?:\s*list)?\.\s*Kr[aá][lľ]ov|\s*(?:list\s*Kr[aá][lľ]ov|Kr[aá][lľ]ov))|[aá]\s*Kr[aá][lľ]ov)|(?:(?:1\s*k|I)|1)\.\s*Kr[aá][lľ]ov|(?:1\s*k|I)\s*Kr[aá][lľ]ov|1\s*Kr[aá][lľ]ov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Tret(?:(?:ia\s*kniha|í)(?:\.\s*Kr[aá][lľ]ov|\s*Kr[aá][lľ]ov)|ia?\.\s*Kr[aá][lľ]ov|i(?:a\s*Kr[aá][lľ]ov|\s*Kr[aá][lľ]ov))|(?:3\s*k|III)(?:\.\s*Kr[aá][lľ]ov|\s*Kr[aá][lľ]ov)|3(?:\.\s*Kr[aá][lľ]ov|\s*Kr[aá][lľ]ov)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:[SŠ]tvrt[aá](?:(?:\s*kniha)?\.\s*Kr[aá][lľ]ov|\s*(?:kniha\s*Kr[aá][lľ]ov|Kr[aá][lľ]ov))|(?:(?:4\s*k|IV)|4)\.\s*Kr[aá][lľ]ov|(?:4\s*k|IV)\s*Kr[aá][lľ]ov|4\s*Kr[aá][lľ]ov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*Kr[aá][lľ]ov|[aá]\s*kniha\s*Kr[aá][lľ]ov|[yý](?:(?:\s*list)?\.\s*Kr[aá][lľ]ov|\s*(?:list\s*Kr[aá][lľ]ov|Kr[aá][lľ]ov))|[aá]\s*Kr[aá][lľ]ov)|(?:(?:2\s*k|II)|2)\.\s*Kr[aá][lľ]ov|(?:2\s*k|II)\s*Kr[aá][lľ]ov|2\s*Kr[aá][lľ]ov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Kr(?:(?:[aá][lľ]ov|[lľ]))?|Kgs))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Kgs"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*Kr(?:(?:[aá][lľ]ov|[lľ]))?|Kgs))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[aá]\s*kniha\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[yý](?:(?:\s*list)?\.\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|\s*(?:list\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))))|[aá]\s*Paralipomenon|[aá]\s*Kron(?:i(?:ck[aá]|k)|ík))|(?:(?:1\s*k|I)|1)\.\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|(?:1\s*k|I)\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|1\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[aá]\s*kniha\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|[yý](?:(?:\s*list)?\.\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|\s*(?:list\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))))|[aá]\s*Paralipomenon|[aá]\s*Kron(?:i(?:ck[aá]|k)|ík))|(?:(?:2\s*k|II)|2)\.\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|(?:2\s*k|II)\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))|2\s*(?:Paralipomenon|Kron(?:i(?:ck[aá]|k)|ík))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Kr(?:on(?:[ií]k)?|n)|Chr))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Chr"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*Kr(?:on(?:[ií]k)?|n)|Chr))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ezra"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Ez(?:ra|d))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Neh"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Neh(?:emi[aá][sš])?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["GkEsth"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:G(?:r[eé]cke\s*[cč]asti\s*knihy\s*Ester|kEsth)|Ester\s*\(gr\.?\)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Esth"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Est(?:er|h)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Job"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*J[oó]bova|\s*J[oó]bova)|\.\s*J[oó]bova|\s*J[oó]bova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Job"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(J[oó]b)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ps"],
            testament: "oa",
            testament_books: { Ps: "oa" },
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*[zž]almov|\s*[zž]almov)|\.\s*[zž]almov|\s*[zž]almov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ps"],
            testament: "oa",
            testament_books: { Ps: "oa" },
            regexp: /(?:^|(?<=[^\p{L}]))((?:[ZŽ](?:al(?:t[aá]r|my?))?|Ps))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["PrAzar"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Azarj[aá][sš]ova\s*modlitba|PrAzar))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Prov"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*pr[ií]slov[ií]|\s*pr[ií]slov[ií])|\.\s*pr[ií]slov[ií]|\s*pr[ií]slov[ií]))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Prov"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Pr(?:[ií]s(?:lovia)?|ov)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Eccl"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha(?:\.\s*kazate[lľ]ova|\s*kazate[lľ]ova)|\.\s*kazate[lľ]ova|\s*kazate[lľ]ova))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Eccl"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:K(?:(?:ohelet\s*—\s*Kazate[lľ]|azate[lľ])|(?:oh(?:elet)?|az))|E(?:kleziastes|ccl)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["SgThree"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Traja\s*ml[aá]denci\s*v\s*rozp[aá]lenej\s*peci|Piese[nň]\s*ml[aá]dencov\s*v\s*ohnivej\s*peci|SgThree))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Song"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:PŠ|(?:Ve[lľ]piese[nň]\s*[SŠ]alam[uú]nova|Piese[nň]\s*(?:[SŠ]alam[uú]nova|piesn[ií])|Ve[lľ]p(?:iese[nň])?|Pies(?:e[nň])?|Song|V[lľ]p)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jer"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Jer(?:emi[aá][sš])?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Ezek"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Ez(?:e(?:chiel|k))?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Dan"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Dan(?:iel)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Hos"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ho(?:ze[aá][sš]|s)|Oz(?:e[aá][sš])?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Joel"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Joel)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Amos"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))([AÁ]m(?:os)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Obad"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Ob(?:ad(?:i[aá][sš])?|edi[aá][sš])|Abd(?:i[aá][sš])?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jonah"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Jon(?:a[hsš]|á[sš])?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mic"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Mic(?:h(?:e[aá][sš])?)?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Nah"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(N(?:ah(?:um)?|áhum))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Hab"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Hab(?:akuk)?|Ab(?:akuk)?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Zeph"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Sof(?:oni[aá][sš])?|Zeph))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Hag"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Hag(?:geus)?|Ag(?:geus|(?:eus)?)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Zech"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Z(?:ach(?:ari[aá][sš])?|ech))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mal"],
            testament: "o",
            regexp: /(?:^|(?<=[^\p{L}]))(Mal(?:achi[aá][sš])?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Matt"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Evanjelium\s*Pod[lľ]a\s*Mat[uú][sš]a|M(?:(?:at(?:[uú][sš]a|t)|t)|at[uú][sš])))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Mark"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Evanjelium\s*Pod[lľ]a\s*Marka|M(?:(?:ar(?:ka|ek)|k)|ark)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Luke"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Evanjelium\s*Pod[lľ]a\s*Luk[aá][sš]a|L(?:(?:uk(?:[aá][sš]a|e)|k)|uk[aá][sš])))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv[yý]\s*J[aá]nov\s*list|1(?:(?:\s*J(?:[aá]nov|n)|John)|\s*J)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh[yý]\s*J[aá]nov\s*list|2(?:(?:\s*J(?:[aá]nov|n)|John)|\s*J)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Tret[ií]\s*J[aá]nov\s*list|3(?:(?:\s*J(?:[aá]nov|n)|John)|\s*J)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*J[aá]nov|[aá]\s*kniha\s*J[aá]nov|[yý](?:(?:\s*list)?\.\s*J[aá]nov|\s*(?:list\s*J[aá]nov|J[aá]nov))|[aá]\s*J[aá]nov)|(?:(?:1\s*k|I)|1)\.\s*J[aá]nov|(?:1\s*k|I)\s*J[aá]nov|1\s*J[aá]nov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*J[aá]nov|[aá]\s*kniha\s*J[aá]nov|[yý](?:(?:\s*list)?\.\s*J[aá]nov|\s*(?:list\s*J[aá]nov|J[aá]nov))|[aá]\s*J[aá]nov)|(?:(?:2\s*k|II)|2)\.\s*J[aá]nov|(?:2\s*k|II)\s*J[aá]nov|2\s*J[aá]nov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Tret(?:(?:ia\s*kniha|í)(?:\.\s*J[aá]nov|\s*J[aá]nov)|ia?\.\s*J[aá]nov|i(?:a\s*J[aá]nov|\s*J[aá]nov))|(?:3\s*k|III)(?:\.\s*J[aá]nov|\s*J[aá]nov)|3(?:\.\s*J[aá]nov|\s*J[aá]nov)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["John"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Evanjelium\s*Pod[lľ]a\s*J[aá]na|J(?:(?:(?:oh)?n|[aá]na)|[aá]n)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Acts"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Sk(?:utky\s*apo[sš]tolov|(?:utky)?)|Acts))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Rom"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Rimano|(?:(?:R(?:imsky|ímsky|o)|Ri)|Rimano))m)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|[aá]\s*kniha\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|[yý](?:(?:\s*list)?\.\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|\s*(?:list\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|Korin(?:(?:tsk[yý]|tano)|ťano)m))|[aá]\s*Korin(?:(?:tsk[yý]|tano)|ťano)m)|(?:(?:1\s*k|I)|1)\.\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|(?:1\s*k|I)\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|1\s*Korin(?:(?:tsk[yý]|tano)|ťano)m))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|[aá]\s*kniha\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|[yý](?:(?:\s*list)?\.\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|\s*(?:list\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|Korin(?:(?:tsk[yý]|tano)|ťano)m))|[aá]\s*Korin(?:(?:tsk[yý]|tano)|ťano)m)|(?:(?:2\s*k|II)|2)\.\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|(?:2\s*k|II)\s*Korin(?:(?:tsk[yý]|tano)|ťano)m|2\s*Korin(?:(?:tsk[yý]|tano)|ťano)m))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\s*Kor(?:in[tť]anom)?|Cor))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Cor"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\s*Kor(?:in[tť]anom)?|Cor))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Gal"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Gala[tť]anom|Galatsk[yý]m|Galatanom|Galaťanom|Gal?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Eph"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Efezanom|Efezsk[yý]m|Efezanom|E(?:ph|f)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Phil"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Filipanom|Filipsk[yý]m|Filipanom|Phil|Flp))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Col"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Kolosanom|Kolosensk[yý]m|Kolosanom|[CK]ol))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|[aá]\s*kniha\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|[yý](?:(?:\s*list)?\.\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|\s*list\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|\s*Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:\s*Sol[uú]n[cč]ano|\s*Sol[uú]nsky)m)|[aá]\s*Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:[aá]\s*Sol[uú]n[cč]ano|[aá]\s*Sol[uú]nsky)m)|(?:(?:1\s*k|I)|1)\.\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|(?:1\s*k|I)\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|1\s*Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:1\s*Sol[uú]n[cč]ano|1\s*Sol[uú]nsky)m))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|[aá]\s*kniha\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|[yý](?:(?:\s*list)?\.\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|\s*list\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|\s*Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:\s*Sol[uú]n[cč]ano|\s*Sol[uú]nsky)m)|[aá]\s*Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:[aá]\s*Sol[uú]n[cč]ano|[aá]\s*Sol[uú]nsky)m)|(?:(?:2\s*k|II)|2)\.\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|(?:2\s*k|II)\s*(?:Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:Sol[uú]n[cč]ano|Sol[uú]nsky)m)|2\s*Tesaloni(?:(?:cano|ck[yý])|čano)m|(?:2\s*Sol[uú]n[cč]ano|2\s*Sol[uú]nsky)m))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\.\s*Sol[uú]n[cč]anom|\s*Sol[uú]n[cč]anom|(?:Thes|\s*Te)s|\s*Sol))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Thess"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\.\s*Sol[uú]n[cč]anom|\s*Sol[uú]n[cč]anom|(?:Thes|\s*Te)s|\s*Sol))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:[aá]\s*kniha|[aá])\.\s*Timotej?ovi|[aá]\s*kniha\s*Timotej?ovi|[yý](?:(?:\s*list)?\.\s*Timotej?ovi|\s*(?:list\s*Timotej?ovi|Timotej?ovi))|[aá]\s*Timotej?ovi)|(?:(?:1\s*k|I)|1)\.\s*Timotej?ovi|(?:1\s*k|I)\s*Timotej?ovi|1\s*Timotej?ovi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:[aá]\s*kniha|[aá])\.\s*Timotej?ovi|[aá]\s*kniha\s*Timotej?ovi|[yý](?:(?:\s*list)?\.\s*Timotej?ovi|\s*(?:list\s*Timotej?ovi|Timotej?ovi))|[aá]\s*Timotej?ovi)|(?:(?:2\s*k|II)|2)\.\s*Timotej?ovi|(?:2\s*k|II)\s*Timotej?ovi|2\s*Timotej?ovi))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\.\s*Timotejovi|\s*Timotejovi|\s*?Tim))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Tim"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(1(?:\.\s*Timotejovi|\s*Timotejovi|\s*?Tim))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Titus"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*T[ií]tovi|T[ií]tovi|T(?:itus|[ií]t)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Phlm"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Filem[oó]novi|Filemonovi|(?:File|(?:Ph|F)l)m))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Heb"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))((?:List\s*Hebrejom|Hebrejom|[ZŽ]idom|Hebr?|[ZŽ]id))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jas"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(J(?:a(?:kubov\s*List|k(?:ubov)?|s)|k))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv[yý]\s*Petrov\s*list|1(?:\s*P(?:etrov|t)|Pet)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh[yý]\s*Petrov\s*list|2(?:\s*P(?:etrov|t)|Pet)))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Petrov|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Petrov)|(?:(?:(?:1\s*k|I)|1)\.|(?:(?:1\s*k|I)|1))\s*Petrov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Pet"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Petrov|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Petrov)|(?:(?:(?:2\s*k|II)|2)\.|(?:(?:2\s*k|II)|2))\s*Petrov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jude"],
            testament: "n",
            regexp: /(?:^|(?<=[^\p{L}]))(J(?:ud(?:ov(?:\s*List)?|e?)|úd(?:ov(?:\s*List)?)?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Tob"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(Tob(?:i[aá][sš])?)(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jdt"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(K(?:niha\.?\s*Juditina|\.?\s*Juditina))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Jdt"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))(J(?:udita?|dt))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Bar"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Proroctvo\s*Baruchovo|Bar(?:uch)?))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["Sus"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}]))((?:Zuzan[ae]|Sus))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Machabejcov|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Machabejcov)|(?:(?:(?:1\s*k|I)|1)\.|(?:(?:1\s*k|I)|1))\s*Machabejcov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Machabejcov|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Machabejcov)|(?:(?:(?:2\s*k|II)|2)\.|(?:(?:2\s*k|II)|2))\s*Machabejcov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Tret(?:(?:ia\s*kniha|í)\.?\s*Machabejcov|(?:ia?\.|ia?)\s*Machabejcov)|(?:3\s*k|III)\.?\s*Machabejcov|3\.?\s*Machabejcov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["4Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:[SŠ]tvrt[aá](?:(?:\s*kniha)?\.\s*|\s*(?:kniha\s*)?)Machabejcov|(?:(?:(?:4\s*k|IV)|4)\.|(?:(?:4\s*k|IV)|4))\s*Machabejcov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Druh(?:(?:(?:[aá]\s*kniha|[aá])\.|(?:[aá]\s*kniha|[aá]))\s*Makabejcov|[yý](?:(?:\s*list)?\.\s*|\s*(?:list\s*)?)Makabejcov)|(?:(?:(?:2\s*k|II)|2)\.|(?:(?:2\s*k|II)|2))\s*Makabejcov))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["2Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(2(?:\.\s*Machabejcov|\s*Machabejcov|\s*Mach|\s*Mak|Macc))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["3Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(3(?:\.\s*Machabejcov|\s*Machabejcov|\s*Mach|\s*Mak|Macc))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["4Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(4(?:\.\s*Machabejcov|\s*Machabejcov|\s*Mach|\s*Mak|Macc))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
          },
          {
            osis: ["1Macc"],
            testament: "a",
            regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Prv[aá]\s*Makabejcov|1(?:\.\s*Machabejcov|(?:\s*Machabejcov|(?:\s*Mach|(?:\s*Mak|Macc))))))(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/giu
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
  ab: /^(?:(?:b|c|d|e))(?!\p{L})/iu,
  and: /^(?:(?:(?:porov\.?\s*|pozri\.?\s*|alebo\.?\s*|a\.?\s*(?!\p{L}))|&))/i,
  c_explicit: /^[\s*]*(?:(?:(?:kap(?:itol[euy]|(?:itol)?)|hlavy)\.?\s*))[\s*]*/i,
  c_sep_eu: /^\x1f\x1f\x1f/i,
  c_sep_us: /^\x1f\x1f\x1f/i,
  cv_sep_weak: /^(?:[\s*]*["'][\s*]*|[\s*])+/i,
  cv_sep_eu: /^[\s*]*,+[\s*]*/i,
  cv_sep_us: /^[\s*]*(?::+|\.(?!\s*\.\s*\.))[\s*]*/i,
  ff: /^[\s*]*(?:(?:ff\.?\s*))(?![\p{L}\p{N}])(?:\.(?!\s*\.))?/iu,
  in_book_of: /^[\s*]*(?:from|of|in)[\s*]*(?:the[\s*]*book[\s*]*of[\s*]*)?/i,
  next: /^(?:\x1f\x1f\x1f)/i,
  ordinal: /^(?:th|st|nd|rd)/i,
  range: /^[\s*]*(?:[\-–—]|(?:(?:a[zž]|-)\.?\s*))+[\s*]*/i,
  sequence_eu: /^(?:[;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|(?:porov\.?\s*|pozri\.?\s*|alebo\.?\s*|a\.?\s*(?!\p{L})))+/i,
  sequence_us: /^(?:[,;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|(?:porov\.?\s*|pozri\.?\s*|alebo\.?\s*|a\.?\s*(?!\p{L})))+/i,
  space: /^[\s*]+/,
  title: /^[\s*]*(?:(?:title\.?\s*))(?!\p{L})[\s*]*/iu,
  v_explicit: /^[\s*]*(?:(?:ver[sš]ov\.?\s*))[\s*]*(?!\p{L})/iu
};
var regexps = bcv_regexps;
var translations = bcv_translations;
var grammar_options = bcv_grammar_options_default;
export {
  grammar_options,
  regexps,
  translations
};
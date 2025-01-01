// build/bcv_matcher.ts
var bcv_matcher = class {
  constructor(parent, grammar2) {
    this.parent = parent;
    this.grammar = grammar2;
  }
  // ## Parsing-Related Functions
  // Replace control characters and spaces since we replace books with a specific character pattern. The string changes, but the length stays the same so that indices remain valid. If we want to use Latin numbers rather than non-Latin ones, replace them here.
  replace_control_characters(s) {
    s = s.replace(this.parent.regexps.control, " ");
    if (this.parent.options.non_latin_digits_strategy === "replace") {
      s = s.replace(/[٠۰߀०০੦૦୦0౦೦൦๐໐༠၀႐០᠐᥆᧐᪀᪐᭐᮰᱀᱐꘠꣐꤀꧐꩐꯰０]/g, "0");
      s = s.replace(/[١۱߁१১੧૧୧௧౧೧൧๑໑༡၁႑១᠑᥇᧑᪁᪑᭑᮱᱁᱑꘡꣑꤁꧑꩑꯱１]/g, "1");
      s = s.replace(/[٢۲߂२২੨૨୨௨౨೨൨๒໒༢၂႒២᠒᥈᧒᪂᪒᭒᮲᱂᱒꘢꣒꤂꧒꩒꯲２]/g, "2");
      s = s.replace(/[٣۳߃३৩੩૩୩௩౩೩൩๓໓༣၃႓៣᠓᥉᧓᪃᪓᭓᮳᱃᱓꘣꣓꤃꧓꩓꯳３]/g, "3");
      s = s.replace(/[٤۴߄४৪੪૪୪௪౪೪൪๔໔༤၄႔៤᠔᥊᧔᪄᪔᭔᮴᱄᱔꘤꣔꤄꧔꩔꯴４]/g, "4");
      s = s.replace(/[٥۵߅५৫੫૫୫௫౫೫൫๕໕༥၅႕៥᠕᥋᧕᪅᪕᭕᮵᱅᱕꘥꣕꤅꧕꩕꯵５]/g, "5");
      s = s.replace(/[٦۶߆६৬੬૬୬௬౬೬൬๖໖༦၆႖៦᠖᥌᧖᪆᪖᭖᮶᱆᱖꘦꣖꤆꧖꩖꯶６]/g, "6");
      s = s.replace(/[٧۷߇७৭੭૭୭௭౭೭൭๗໗༧၇႗៧᠗᥍᧗᪇᪗᭗᮷᱇᱗꘧꣗꤇꧗꩗꯷７]/g, "7");
      s = s.replace(/[٨۸߈८৮੮૮୮௮౮೮൮๘໘༨၈႘៨᠘᥎᧘᪈᪘᭘᮸᱈᱘꘨꣘꤈꧘꩘꯸８]/g, "8");
      s = s.replace(/[٩۹߉९৯੯૯୯௯౯೯൯๙໙༩၉႙៩᠙᥏᧙᪉᪙᭙᮹᱉᱙꘩꣙꤉꧙꩙꯹９]/g, "9");
    }
    return s;
  }
  // Find and replace instances of Bible books.
  match_books(s) {
    const books = [];
    for (const book of this.parent.regexps.books) {
      let has_replacement = false;
      s = s.replace(book.regexp, function(_full, bk) {
        has_replacement = true;
        books.push({
          value: bk,
          parsed: book.osis,
          type: "book"
        });
        const extra = book.extra ? `/${book.extra}` : "";
        return `${books.length - 1}${extra}`;
      });
      if (has_replacement && /^[\s\x1f\d:.,;\-\u2013\u2014]+$/.test(s)) {
        break;
      }
    }
    for (const translation_regexp of this.parent.regexps.translations) {
      s = s.replace(translation_regexp, function(match) {
        books.push({
          value: match,
          parsed: match.toLowerCase(),
          type: "translation"
        });
        return `${books.length - 1}`;
      });
    }
    return [s, this.get_book_indices(books, s)];
  }
  // Get the string index for all the books / translations, adding the start index as a new key.
  get_book_indices(books, s) {
    let add_index = 0;
    for (const match of s.matchAll(/([\x1f\x1e])(\d+)(?:\/\d+)?\1/g)) {
      const bookIndex = parseInt(match[2], 10);
      books[bookIndex].start_index = match.index + add_index;
      add_index += books[bookIndex].value.length - match[0].length;
    }
    return books;
  }
  // Create an array of all the potential passage references in the string.
  match_passages(s) {
    let entities = [];
    let post_context = {};
    for (const match of s.matchAll(this.parent.regexps.escaped_passage)) {
      let [full, part, book_id] = match;
      const book_id_number = parseInt(book_id, 10);
      const original_part_length = part.length;
      match.index += full.length - original_part_length;
      part = this.clean_end_match(s, match, part);
      part = part.replace(/[A-Z]+/g, (capitals) => capitals.toLowerCase());
      const start_index_adjust = part.startsWith("") ? 0 : part.split("")[0].length;
      const passage = {
        value: this.grammar.parse(part, {
          punctuation_strategy: this.parent.options.punctuation_strategy
        }),
        type: "base",
        // The `start_index` in `this.parent.passage` always exists after being set in `match_books`.
        start_index: this.parent.passage.books[book_id_number].start_index - start_index_adjust,
        match: part
      };
      const book_parsed = this.parent.passage.books[book_id_number].parsed;
      if (start_index_adjust === 0 && this.parent.options.book_alone_strategy === "full" && this.parent.options.book_range_strategy === "include" && passage.value[0].type === "b" && Array.isArray(passage.value) && (passage.value.length === 1 || passage.value.length > 1 && passage.value[1].type === "translation_sequence") && /^[234]/.test(book_parsed)) {
        this.create_book_range(s, passage, book_id_number);
      }
      let accum = [];
      [accum, post_context] = this.parent.passage.handle_obj(passage, [], {});
      entities = entities.concat(accum);
      const regexp_index_adjust = this.adjust_regexp_end(accum, original_part_length, part.length);
      if (regexp_index_adjust > 0) {
        this.parent.regexps.escaped_passage.lastIndex -= regexp_index_adjust;
      }
    }
    return [entities, post_context];
  }
  // Clean up the end of a match by removing unnecessary characters.
  clean_end_match(s, match, part) {
    if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
      part = part.replace(/\s+\d+\s*$/, "");
    }
    if (!/[\d\x1f\x1e)]$/.test(part)) {
      const sub_parts = part.split(this.parent.regexps.match_end_split);
      const remove = sub_parts.pop();
      if (sub_parts.length > 0 && remove != null && remove.length > 0) {
        part = part.substring(0, part.length - remove.length);
      }
    }
    if (this.parent.options.captive_end_digits_strategy === "delete") {
      const next_char_index = match.index + part.length;
      if (s.length > next_char_index && /^\w/.test(s.charAt(next_char_index))) {
        part = part.replace(/[\s*]+\d+$/, "");
      }
      part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
    }
    return part;
  }
  // Handle the objects returned from the grammar to produce entities for further processing. We may need to adjust the `RegExp.lastIndex` if we discarded characters from the end of the match or if, after parsing, we're ignoring some of them--especially with ending parenthetical statements like "Luke 8:1-3; 24:10 (and Matthew 14:1-12 and Luke 23:7-12 for background)".
  adjust_regexp_end(accum, old_length, new_length) {
    if (accum.length > 0) {
      return old_length - accum[accum.length - 1].indices[1] - 1;
    } else if (old_length !== new_length) {
      return old_length - new_length;
    }
    return 0;
  }
  // If a book is on its own, check whether it's preceded by something that indicates it's a book range like "1-2 Samuel".
  create_book_range(s, passage, book_id) {
    const cases = [
      this.parent.regexps.first,
      this.parent.regexps.second,
      this.parent.regexps.third
    ];
    const limit = parseInt(this.parent.passage.books[book_id].parsed[0].substring(0, 1), 10);
    for (let i = 1; i < limit; i++) {
      const range_regexp = i === limit - 1 ? this.parent.regexps.range_and : this.parent.regexps.range_only;
      const match_regexp = new RegExp(String.raw`(?:^|[^\p{L}\p{N}])(${cases[i - 1]}\s*${range_regexp}\s*)\x1f${book_id}\x1f`, "iu");
      const prev = s.match(match_regexp);
      if (prev) {
        return this.add_book_range_object(passage, prev, i);
      }
    }
    return false;
  }
  // Create a synthetic object that can be parsed to show the correct result.
  add_book_range_object(passage, prev, start_book_number) {
    const length = prev[1].length;
    passage.value[0] = {
      type: "b_range_pre",
      value: [
        {
          type: "b_pre",
          value: start_book_number.toString(),
          indices: [prev.index, prev.index + length]
        },
        passage.value[0]
      ],
      indices: [0, passage.value[0].indices[1] + length]
    };
    this.add_offset_to_indices(passage.value[0].value[1].indices, length);
    passage.start_index -= length;
    passage.match = prev[1] + passage.match;
    if (!Array.isArray(passage.value)) {
      return passage;
    }
    for (let i = 1; i < passage.value.length; i++) {
      if (!passage.value[i].value) {
        continue;
      }
      if (passage.value[i].value[0]?.indices) {
        this.add_offset_to_indices(passage.value[i].value[0].indices, length);
      }
      this.add_offset_to_indices(passage.value[i].indices, length);
    }
    return passage;
  }
  add_offset_to_indices(indices, value_to_add) {
    indices[0] += value_to_add;
    indices[1] += value_to_add;
  }
};

// build/bcv_options.ts
var bcv_options = class {
  constructor(parent) {
    this.consecutive_combination_strategy = "combine";
    this.osis_compaction_strategy = "b";
    this.book_sequence_strategy = "ignore";
    this.invalid_sequence_strategy = "ignore";
    this.sequence_combination_strategy = "combine";
    this.punctuation_strategy = "us";
    this.invalid_passage_strategy = "ignore";
    this.non_latin_digits_strategy = "ignore";
    // This one is shared between `this` and `bcv_passage`.
    this.passage_existence_strategy = "bcv";
    this.book_alone_strategy = "ignore";
    this.book_range_strategy = "ignore";
    this.captive_end_digits_strategy = "delete";
    this.ps151_strategy = "c";
    this.zero_chapter_strategy = "error";
    this.zero_verse_strategy = "error";
    this.single_chapter_1_strategy = "chapter";
    this.end_range_digits_strategy = "verse";
    this.warn_level = "none";
    this.#testaments = "on";
    this.#case_sensitive = "none";
    this.parent = parent;
  }
  #testaments;
  get testaments() {
    return this.#testaments;
  }
  set testaments(filter) {
    if (filter === this.#testaments || filter.length === 0) {
      return;
    }
    const filters = filter.split("");
    let out = "";
    if (filters[0] === "o") {
      filters.shift();
      out += "o";
    }
    if (filters.length > 0 && filters[0] === "n") {
      filters.shift();
      out += "n";
    }
    if (filters.length > 0 && filters[0] === "a") {
      out += "a";
    }
    if (out.length > 0 && out !== this.#testaments) {
      const new_apocrypha = out.indexOf("a") >= 0;
      const old_apocrypha = this.#testaments.indexOf("a") >= 0;
      this.#testaments = out;
      if (new_apocrypha !== old_apocrypha) {
        this.set_apocrypha(new_apocrypha);
      } else {
        this.parent.regexps_manager.filter_books(this.#testaments, this.case_sensitive);
      }
    }
  }
  // Whether to use books and abbreviations from the Apocrypha. This function makes sure books from the Apocrypha are available as options and adjusts the Psalms to include Psalm 151. It takes a boolean argument: `true` to include the Apocrypha and `false` to not. Defaults to `false`.
  set_apocrypha(include_apocrypha) {
    this.parent.regexps_manager.filter_books(this.#testaments, this.case_sensitive);
    for (const translation of Object.keys(this.parent.translations.definitions)) {
      this.parent.translations.definitions[translation].chapters ??= {};
      this.parent.translations.definitions[translation].chapters["Ps"] ??= [...this.parent.translations.definitions.current.chapters["Ps"]];
      if (include_apocrypha === true) {
        this.parent.translations.definitions[translation].chapters["Ps"][150] = this.parent.translations.definitions[translation].chapters["Ps151"]?.[0] ?? this.parent.translations.definitions.current.chapters["Ps151"][0];
      } else if (this.parent.translations.definitions[translation].chapters?.["Ps"].length === 151) {
        this.parent.translations.definitions[translation].chapters["Ps"].pop();
      }
    }
  }
  get versification_system() {
    return this.parent.translations.current_system;
  }
  // Use an alternate versification system. Takes a string argument; the built-in options are: `default` to use ESV-style versification and `vulgate` to use the Vulgate (Greek) Psalm numbering. English offers several other versification systems; see the Readme for details.
  set versification_system(system) {
    if (this.parent.translations.aliases[system]?.alias) {
      system = this.parent.translations.aliases[system].alias;
    }
    if (!this.parent.translations.definitions[system]) {
      if (this.warn_level === "warn") {
        console.warn(`Unknown versification system ("${system}"). Using default instead.`);
      }
      system = "default";
    }
    if (!system || system === this.parent.translations.current_system) {
      return;
    }
    if (this.parent.translations.current_system !== "default") {
      this.parent.translations.definitions.current = structuredClone(this.parent.translations.definitions.default);
    }
    this.parent.translations.current_system = system;
    if (system === "default") {
      return;
    }
    if (this.parent.translations.definitions[system].order) {
      this.parent.translations.definitions.current.order = { ...this.parent.translations.definitions[system].order };
    }
    if (this.parent.translations.definitions[system].chapters) {
      this.parent.translations.definitions.current.chapters = { ...structuredClone(this.parent.translations.definitions.default.chapters), ...structuredClone(this.parent.translations.definitions[system].chapters) };
    }
  }
  #case_sensitive;
  get case_sensitive() {
    return this.#case_sensitive;
  }
  // Whether to treat books as case-sensitive. Valid values are `none` and `books`.
  set case_sensitive(arg) {
    if (arg === this.#case_sensitive || arg !== "none" && arg !== "books") {
      return;
    }
    this.#case_sensitive = arg;
    this.parent.regexps_manager.filter_books(this.testaments, arg);
  }
};

// build/bcv_passage.ts
var bcv_passage = class {
  constructor() {
    this.books = [];
    this.indices = [];
    // Initialized by `bcv_parser`.
    this.translations = {};
  }
  // ## Public
  // Loop through the parsed passages.
  handle_array(passages, accum = [], context = {}) {
    for (const passage of passages) {
      if (passage == null) {
        continue;
      }
      [accum, context] = this.handle_obj(passage, accum, context);
    }
    return [accum, context];
  }
  handle_obj(passage, accum, context) {
    if (passage.type && typeof this[passage.type] === "function") {
      return this[passage.type](passage, accum, context);
    }
    return [accum, context];
  }
  // ## Types Returned from the Peggy Grammar
  // These functions correspond to `type` attributes returned from the grammar. They're designed to be called multiple times if necessary.
  // Handle a book on its own ("Gen").
  b(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    const alternates = [];
    for (const b of this.books[passage.value].parsed) {
      const valid = this.validate_ref(passage.start_context.translations, { b });
      const obj = {
        start: { b },
        end: { b },
        valid
      };
      if (passage.passages.length === 0 && valid.valid) {
        passage.passages.push(obj);
      } else {
        alternates.push(obj);
      }
    }
    this.normalize_passage_and_alternates(passage, alternates);
    accum.push(passage);
    context = { b: passage.passages[0].start.b };
    if (passage.start_context.translations) {
      context.translations = structuredClone(passage.start_context.translations);
    }
    return [accum, context];
  }
  // This is never called. It exists to make Typescript happy.
  b_pre(passage, accum, context) {
    return [accum, context];
  }
  // Handle book-only ranges ("Gen-Exod").
  b_range(passage, accum, context) {
    return this.range(passage, accum, context);
  }
  // Handle book-only ranges like "1-2 Samuel". It doesn't support multiple ambiguous ranges (like "1-2C"), which it probably shouldn't, anyway.
  b_range_pre(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    const book = this.pluck("b", passage.value);
    let end;
    [[end], context] = this.b(book, [], context);
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    passage.passages = [{
      start: {
        b: passage.value[0].value + end.passages[0].start.b.substring(1),
        type: "b"
      },
      end: end.passages[0].end,
      valid: end.passages[0].valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = structuredClone(passage.start_context.translations);
    }
    accum.push(passage);
    return [accum, context];
  }
  // Handle ranges with a book as the start of the range ("Gen-Exod 2").
  b_range_start(passage, accum, context) {
    return this.range(passage, accum, context);
  }
  // The base (root) object in the grammar controls the base indices.
  base(passage, accum, context) {
    this.indices = this.calculate_indices(passage.match, passage.start_index);
    return this.handle_array(passage.value, accum, context);
  }
  // Handle book-chapter ("Gen 1").
  bc(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    this.reset_context(context, ["b", "c", "v"]);
    const c = this.pluck("c", passage.value).value;
    const alternates = [];
    for (const b of this.books[this.pluck("b", passage.value).value].parsed) {
      let context_key = "c";
      const valid = this.validate_ref(passage.start_context.translations, { b, c });
      const obj = {
        start: { b },
        end: { b },
        valid
      };
      if (valid.messages?.start_chapter_not_exist_in_single_chapter_book || valid.messages?.start_chapter_1) {
        obj.valid = this.validate_ref(passage.start_context.translations, { b, v: c });
        if (valid.messages?.start_chapter_not_exist_in_single_chapter_book) {
          obj.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1;
        }
        obj.start.c = 1;
        obj.end.c = 1;
        context_key = "v";
      }
      obj.start[context_key] = c;
      [obj.start.c, obj.start.v] = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v);
      if (obj.start.v == null) {
        delete obj.start.v;
      }
      obj.end[context_key] = obj.start[context_key];
      if (passage.passages.length === 0 && obj.valid.valid) {
        passage.passages.push(obj);
      } else {
        alternates.push(obj);
      }
    }
    this.normalize_passage_and_alternates(passage, alternates);
    this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
    accum.push(passage);
    return [accum, context];
  }
  // Handle "Ps 3 title".
  bc_title(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const bc_pluck = this.pluck("bc", passage.value);
    let bc;
    [[bc], context] = this.bc(bc_pluck, [], context);
    if (bc.passages[0].start.b.substring(0, 2) !== "Ps" && bc.passages[0].alternates) {
      for (const alternate of bc.passages[0].alternates) {
        if (alternate.start.b.substring(0, 2) === "Ps") {
          bc.passages[0] = structuredClone(alternate);
          break;
        }
      }
    }
    if (bc.passages[0].start.b.substring(0, 2) !== "Ps") {
      accum.push(bc);
      return [accum, context];
    }
    this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
    let title = this.pluck("title", passage.value);
    if (!title) {
      title = this.pluck("v", passage.value);
    }
    passage.value[1] = {
      type: "v",
      // Let us discover later that this was originally a `title`.
      original_type: "title",
      value: [{ type: "integer", value: 1, indices: title.indices }],
      indices: title.indices
    };
    passage.type = "bcv";
    return this.bcv(passage, accum, passage.start_context);
  }
  // Handle book chapter:verse ("Gen 1:1").
  bcv(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    this.reset_context(context, ["b", "c", "v"]);
    const bc = this.pluck("bc", passage.value);
    let c = this.pluck("c", bc.value).value;
    let v = this.pluck("v", passage.value).value;
    const alternates = [];
    for (const b of this.books[this.pluck("b", bc.value).value].parsed) {
      const valid = this.validate_ref(passage.start_context.translations, { b, c, v });
      [c, v] = this.fix_start_zeroes(valid, c, v);
      const obj = {
        start: { b, c, v },
        end: { b, c, v },
        valid
      };
      if (passage.passages.length === 0 && valid.valid) {
        passage.passages.push(obj);
      } else {
        alternates.push(obj);
      }
    }
    this.normalize_passage_and_alternates(passage, alternates);
    this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
    accum.push(passage);
    return [accum, context];
  }
  // Handle "Philemon verse 6." This is unusual.
  bv(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const [b, v] = passage.value;
    let bcv = {
      indices: passage.indices,
      value: [
        {
          type: "bc",
          value: [b, { type: "c", value: [{ type: "integer", value: 1 }] }]
        },
        v
      ]
    };
    [[bcv], context] = this.bcv(bcv, [], context);
    passage.passages = bcv.passages;
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    accum.push(passage);
    return [accum, context];
  }
  // Handle a chapter.
  c(passage, accum, context) {
    passage.start_context = structuredClone(context);
    let c = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
    const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c });
    if (!valid.valid && valid.messages?.start_chapter_not_exist_in_single_chapter_book) {
      return this.v(passage, accum, context);
    }
    [c] = this.fix_start_zeroes(valid, c);
    passage.passages = [{
      start: { b: context.b, c },
      end: { b: context.b, c },
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = passage.start_context.translations;
    }
    accum.push(passage);
    context.c = c;
    this.reset_context(context, ["v"]);
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    return [accum, context];
  }
  // Handle "23rd Psalm" by recasting it as a `bc`.
  c_psalm(passage, accum, context) {
    passage.type = "bc";
    const c = parseInt(this.books[passage.value].value.match(/^\d+/)[0], 10);
    passage.value = [
      {
        type: "b",
        value: passage.value,
        indices: passage.indices
      },
      {
        type: "c",
        value: [{ type: "integer", value: c, indices: passage.indices }],
        indices: passage.indices
      }
    ];
    return this.bc(passage, accum, context);
  }
  // Handle "Ps 3, ch 4:title"
  c_title(passage, accum, context) {
    passage.start_context = structuredClone(context);
    if (context.b !== "Ps") {
      return this.c(passage.value[0], accum, context);
    }
    const title = this.pluck("title", passage.value);
    passage.value[1] = {
      type: "v",
      // Preserve the title type in case we want it later.
      original_type: "title",
      value: [{ type: "integer", value: 1, indices: title.indices }],
      indices: title.indices
    };
    passage.type = "cv";
    return this.cv(passage, accum, passage.start_context);
  }
  // Handle "Chapters 1-2 from Daniel".
  cb_range(passage, accum, context) {
    passage.type = "range";
    const [b, start_c, end_c] = passage.value;
    passage.value = [{ type: "bc", value: [b, start_c], indices: passage.indices }, end_c];
    end_c.indices[1] = passage.indices[1];
    return this.range(passage, accum, context);
  }
  // Use an object to establish context for later objects but don't otherwise use it.
  context(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    context = Object.assign(context, this.books[passage.value].context);
    accum.push(passage);
    return [accum, context];
  }
  // Handle a chapter:verse.
  cv(passage, accum, context) {
    passage.start_context = structuredClone(context);
    let c = this.pluck("c", passage.value).value;
    let v = this.pluck("v", passage.value).value;
    const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c, v });
    [c, v] = this.fix_start_zeroes(valid, c, v);
    passage.passages = [{
      start: { b: context.b, c, v },
      end: { b: context.b, c, v },
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = passage.start_context.translations;
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    context.c = c;
    context.v = v;
    accum.push(passage);
    return [accum, context];
  }
  // Handle "23rd Psalm verse 1" by recasting it as a `bcv`.
  cv_psalm(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.type = "bcv";
    const [c_psalm, v] = passage.value;
    const [[bc]] = this.c_psalm(c_psalm, [], passage.start_context);
    passage.value = [bc, v];
    return this.bcv(passage, accum, context);
  }
  // Handle "and following" (e.g., "Matt 1:1ff") by assuming it means to continue to the end of the current context (end of chapter if a verse is given, end of book if a chapter is given).
  ff(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.value.push({
      type: "integer",
      indices: structuredClone(passage.indices),
      value: 999
    });
    [[passage], context] = this.range(passage, [], passage.start_context);
    passage.value[0].indices = passage.value[1].indices;
    passage.value[0].absolute_indices = passage.value[1].absolute_indices;
    passage.value.pop();
    for (const key of ["end_verse_not_exist", "end_chapter_not_exist"]) {
      delete passage.passages[0].valid.messages[key];
    }
    accum.push(passage);
    return [accum, context];
  }
  // Pass the integer off to whichever handler is relevant.
  integer(passage, accum, context) {
    if (context.v == null) {
      return this.c(passage, accum, context);
    }
    return this.v(passage, accum, context);
  }
  // Handle "Ps 3-4:title" or "Acts 2:22-27. Title"
  integer_title(passage, accum, context) {
    passage.start_context = structuredClone(context);
    if (context.b !== "Ps") {
      return this.integer(passage.value[0], accum, context);
    }
    passage.value[0] = {
      type: "c",
      value: [passage.value[0]],
      indices: structuredClone(passage.value[0].indices)
    };
    passage.value[1].type = "v";
    passage.value[1].original_type = "title";
    passage.value[1].value = [{
      type: "integer",
      value: 1,
      indices: structuredClone(passage.value[1].value.indices)
    }];
    passage.type = "cv";
    return this.cv(passage, accum, passage.start_context);
  }
  // Handle "next verse" (e.g., in Polish, "Matt 1:1n" should be treated as "Matt 1:1-2"). It crosses chapter boundaries but not book boundaries. When given a whole chapter, it assumes the next chapter (again, not crossing book boundaries). The logic here is similar to that of `this.ff`.
  next_v(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const prev_integer = this.pluck_last_recursively("integer", passage.value) ?? { value: 1 };
    passage.value.push({
      type: "integer",
      indices: passage.indices,
      value: prev_integer.value + 1
    });
    let psg;
    [[psg], context] = this.range(passage, [], passage.start_context);
    if (psg.passages[0].valid.messages.end_verse_not_exist && !psg.passages[0].valid.messages.start_verse_not_exist && !psg.passages[0].valid.messages.start_chapter_not_exist && context.c != null) {
      passage.value.pop();
      passage.value.push({
        type: "cv",
        indices: passage.indices,
        value: [
          {
            type: "c",
            value: [{
              type: "integer",
              value: context.c + 1,
              indices: passage.indices
            }],
            indices: passage.indices
          },
          {
            type: "v",
            value: [{
              type: "integer",
              value: 1,
              indices: passage.indices
            }],
            indices: passage.indices
          }
        ]
      });
      [[psg], context] = this.range(passage, [], passage.start_context);
    }
    psg.value[0].indices = psg.value[1].indices;
    psg.value[0].absolute_indices = psg.value[1].absolute_indices;
    psg.value.pop();
    for (const key of ["end_verse_not_exist", "end_chapter_not_exist"]) {
      delete passage.passages[0].valid.messages[key];
    }
    accum.push(psg);
    return [accum, context];
  }
  // Handle a sequence of references. This is the only function that can return more than one object in the `passage.passages` array.
  sequence(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    for (const obj of passage.value) {
      let psg;
      [[psg], context] = this.handle_array(obj, [], context);
      for (const sub_psg of psg.passages) {
        sub_psg.type ??= psg.type;
        sub_psg.absolute_indices ??= psg.absolute_indices;
        if (psg.start_context.translations) {
          sub_psg.translations = psg.start_context.translations;
        }
        sub_psg.enclosed_absolute_indices = psg.type === "sequence_post_enclosed" ? [...psg.absolute_indices] : [-1, -1];
        passage.passages.push(sub_psg);
      }
    }
    if (!passage.absolute_indices) {
      if (passage.passages.length > 0 && passage.type === "sequence") {
        passage.absolute_indices = [
          passage.passages[0].absolute_indices[0],
          passage.passages[passage.passages.length - 1].absolute_indices[1]
        ];
      } else {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
    }
    accum.push(passage);
    return [accum, context];
  }
  // Handle a sequence like "Ps 119 (118)," with parentheses. We want to include the closing parenthesis in the indices if `sequence_combination_strategy` is `combine` or if there's a consecutive.
  sequence_post_enclosed(passage, accum, context) {
    return this.sequence(passage, accum, context);
  }
  // Handle a verse, either as part of a sequence or because someone explicitly wrote "verse".
  v(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const v = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
    const c = context.c != null ? context.c : 1;
    const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c, v });
    const [, fixed_v] = this.fix_start_zeroes(valid, 0, v);
    passage.passages = [{
      start: { b: context.b, c, v: fixed_v },
      end: { b: context.b, c, v: fixed_v },
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = structuredClone(passage.start_context.translations);
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    accum.push(passage);
    context.v = fixed_v;
    return [accum, context];
  }
  // ## Ranges
  // Handle any type of start and end range. It doesn't directly return multiple passages, but if there's an error parsing the range, we may convert it into a sequence.
  range(passage, accum, context) {
    passage.start_context = structuredClone(context);
    let [start, end] = passage.value;
    [[start], context] = this.handle_obj(start, [], context);
    if (end.type === "v" && this.options.end_range_digits_strategy === "verse" && (start.type === "bc" && !start.passages?.[0]?.valid?.messages?.start_chapter_not_exist_in_single_chapter_book || start.type === "c")) {
      passage.value[0] = start;
      return this.range_change_integer_end(passage, accum);
    }
    [[end], context] = this.handle_obj(end, [], context);
    passage.value = [start, end];
    passage.indices = [start.indices[0], end.indices[1]];
    delete passage.absolute_indices;
    const start_obj = {
      b: start.passages[0].start.b,
      c: start.passages[0].start.c,
      v: start.passages[0].start.v,
      type: start.type
    };
    const end_obj = {
      b: end.passages[0].end.b,
      c: end.passages[0].end.c,
      v: end.passages[0].end.v,
      type: end.type
    };
    if (end.passages[0].valid.messages.start_chapter_is_zero) {
      end_obj.c = 0;
    }
    if (end.passages[0].valid.messages.start_verse_is_zero) {
      end_obj.v = 0;
    }
    const valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
    if (valid.valid) {
      const [return_now, return_value] = this.range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum);
      if (return_now) {
        return return_value;
      }
    } else {
      return this.range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum);
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    passage.passages = [{
      start: start_obj,
      end: end_obj,
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = structuredClone(passage.start_context.translations);
    }
    if (start_obj.type === "b") {
      passage.type = end_obj.type === "b" ? "b_range" : "b_range_start";
    } else if (end_obj.type === "b") {
      passage.type = "range_end_b";
    }
    accum.push(passage);
    return [accum, context];
  }
  // For Ps 122-23, treat the 23 as 123.
  range_change_end(passage, accum, new_end) {
    const [start, end] = passage.value;
    if (end.type === "integer") {
      end.original_value = end.value;
      end.value = new_end;
    } else if (end.type === "v") {
      const new_obj = this.pluck("integer", end.value);
      new_obj.original_value = new_obj.value;
      new_obj.value = new_end;
    } else if (end.type === "cv") {
      const new_obj = this.pluck("c", end.value);
      new_obj.original_value = new_obj.value;
      new_obj.value = new_end;
    }
    return this.handle_obj(passage, accum, passage.start_context);
  }
  // For "Jer 33-11", treat the "11" as a verse.
  range_change_integer_end(passage, accum) {
    const [start, end] = passage.value;
    passage.original_type ??= passage.type;
    passage.original_value ??= [start, end];
    passage.type = start.type === "integer" ? "cv" : start.type + "v";
    if (start.type === "integer") {
      passage.value[0] = {
        type: "c",
        value: [start],
        indices: start.indices
      };
    }
    if (end.type === "integer") {
      passage.value[1] = {
        type: "v",
        value: [end],
        indices: end.indices
      };
    }
    return this.handle_obj(passage, accum, passage.start_context);
  }
  // If a new end chapter/verse in a range may be necessary, calculate it.
  range_check_new_end(translations, start_obj, end_obj, valid) {
    let new_end = 0;
    let type;
    if (valid.messages?.end_chapter_before_start) {
      type = "c";
    } else if (valid.messages?.end_verse_before_start) {
      type = "v";
    } else {
      return new_end;
    }
    new_end = this.range_get_new_end_value(start_obj, end_obj, valid, type);
    if (new_end > 0) {
      const obj_to_validate = {
        b: end_obj.b,
        c: end_obj.c,
        v: end_obj.v
      };
      obj_to_validate[type] = new_end;
      if (!this.validate_ref(translations, obj_to_validate).valid) {
        new_end = 0;
      }
    }
    return new_end;
  }
  // Handle ranges with a book as the end of the range ("Gen 2-Exod"). It's not `b_range_end` because only objects that start with an explicit book name should start with `b`.
  range_end_b(passage, accum, context) {
    return this.range(passage, accum, context);
  }
  // If a sequence has an end chapter/verse that's before the the start, check to see whether it can be salvaged: Gen 28-9 = Gen 28-29; Ps 101-24 = Ps 101-124. The `key` parameter is either `c` (for chapter) or `v` (for verse).
  range_get_new_end_value(start_obj, end_obj, valid, key) {
    let new_end = 0;
    if (key === "c" && valid.messages?.end_chapter_is_zero || key === "v" && valid.messages?.end_verse_is_zero) {
      return new_end;
    }
    if (start_obj[key] >= 10 && end_obj[key] < 10 && start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]) {
      new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10);
    } else if (start_obj[key] >= 100 && end_obj[key] < 100 && start_obj[key] - 100 < end_obj[key]) {
      new_end = end_obj[key] + 100;
    }
    return new_end;
  }
  // The range doesn't look valid, but maybe we can fix it. If not, convert it to a sequence.
  range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum) {
    if (valid.valid === false && (valid.messages?.end_chapter_before_start || valid.messages?.end_verse_before_start) && (end.type === "integer" || end.type === "v") || valid.valid === false && valid.messages?.end_chapter_before_start && end.type === "cv") {
      const new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
      if (new_end > 0) {
        return this.range_change_end(passage, accum, new_end);
      }
    }
    if (this.options.end_range_digits_strategy === "verse" && start_obj.v == null && (end.type === "integer" || end.type === "v")) {
      const temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
      const temp_valid = this.validate_ref(passage.start_context.translations, {
        b: start_obj.b,
        c: start_obj.c,
        v: temp_value
      });
      if (temp_valid.valid) {
        return this.range_change_integer_end(passage, accum);
      }
    }
    passage.original_type ??= passage.type;
    passage.type = "sequence";
    [passage.original_value, passage.value] = [[start, end], [[start], [end]]];
    return this.sequence(passage, accum, structuredClone(passage.start_context));
  }
  // The range looks valid, but we should check for some special cases.
  range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum) {
    if (valid.messages?.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && !start_obj.v && (end.type === "integer" || end.type === "v") && this.options.passage_existence_strategy.indexOf("v") >= 0) {
      const temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
      const temp_valid = this.validate_ref(passage.start_context.translations, {
        b: start_obj.b,
        c: start_obj.c,
        v: temp_value
      });
      if (temp_valid.valid) {
        return [true, this.range_change_integer_end(passage, accum)];
      }
    }
    this.range_validate(valid, start_obj, end_obj, passage);
    return [false, null];
  }
  // If the end object goes past the end of the book or chapter, snap it back to a verse that exists.
  range_validate(valid, start_obj, end_obj, passage) {
    if (valid.messages?.end_chapter_not_exist || valid.messages?.end_chapter_not_exist_in_single_chapter_book) {
      end_obj.c = valid.messages.end_chapter_not_exist ?? valid.messages.end_chapter_not_exist_in_single_chapter_book;
      if (end_obj.v != null) {
        end_obj.v = this.validate_ref(passage.start_context.translations, {
          b: end_obj.b,
          c: end_obj.c,
          v: 999
        }).messages.end_verse_not_exist;
        delete valid.messages.end_verse_is_zero;
      }
    } else if (valid.messages?.end_verse_not_exist) {
      end_obj.v = valid.messages.end_verse_not_exist;
    }
    if (valid.messages?.end_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
      end_obj.v = valid.messages.end_verse_is_zero;
    }
    if (valid.messages?.end_chapter_is_zero) {
      end_obj.c = valid.messages.end_chapter_is_zero;
    }
    [start_obj.c, start_obj.v] = this.fix_start_zeroes(valid, start_obj.c, start_obj.v);
  }
  // ## Stop Token
  // Include it in `accum` so that it can stop backpropagation for translations. No context goes forward or backward past a `stop` token.
  stop(passage, accum, context) {
    passage.start_context = {};
    accum.push(passage);
    return [accum, {}];
  }
  // ## Translations
  // Even a single translation ("NIV") appears as part of a translation sequence. Here we handle the sequence and apply the translations to any previous passages lacking an explicit translation: in "Matt 1, 5 ESV," both `Matt 1` and `5` get applied, but in "Matt 1 NIV, 5 ESV," NIV only applies to Matt 1, and ESV only applies to Matt 5.
  translation_sequence(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const translations = [];
    translations.push({
      translation: this.books[passage.value[0].value].parsed,
      alias: "default",
      osis: ""
    });
    for (const val of passage.value[1]) {
      const translation = this.books[this.pluck("translation", val).value].parsed;
      if (translation) {
        translations.push({
          translation,
          alias: "default",
          osis: ""
        });
      }
    }
    for (const translation of translations) {
      if (this.translations.aliases[translation.translation]) {
        translation.alias = this.translations.aliases[translation.translation].alias;
        translation.osis = this.translations.aliases[translation.translation].osis || translation.translation.toUpperCase();
      } else {
        translation.osis = translation.translation.toUpperCase();
      }
    }
    if (accum.length > 0) {
      context = this.translation_sequence_apply(accum, translations);
    }
    passage.absolute_indices = this.get_absolute_indices(passage.indices);
    accum.push(passage);
    this.reset_context(context, ["translations"]);
    return [accum, context];
  }
  // Go back and find the earliest already-parsed passage without a translation. We start with 0 because the below loop will never yield a 0.
  translation_sequence_apply(accum, translations) {
    let use_i = 0;
    for (let i = accum.length - 1; i >= 0; i--) {
      if (accum[i].original_type) {
        accum[i].type = accum[i].original_type;
      }
      if (accum[i].original_value) {
        accum[i].value = accum[i].original_value;
      }
      if (accum[i].type === "translation_sequence" || accum[i].type === "stop") {
        use_i = i + 1;
        break;
      }
    }
    let context;
    if (use_i < accum.length) {
      accum[use_i].start_context.translations = translations;
      [, context] = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context);
    } else {
      context = structuredClone(accum[accum.length - 1].start_context);
    }
    return context;
  }
  // ## Word
  // It doesn't need to be preserved in `accum` since it has no effect on parsing and we don't do anything with it.
  word(passage, accum, context) {
    return [accum, context];
  }
  // ## Utilities
  // Pluck the object or value matching a type from an array.
  pluck(type, passages) {
    for (const passage of passages) {
      if (passage && passage.type && passage.type === type) {
        if (type === "c" || type === "v") {
          return this.pluck("integer", passage.value);
        }
        return passage;
      }
    }
    return null;
  }
  // Pluck the last object or value matching a type, descending as needed into objects.
  pluck_last_recursively(type, passages) {
    for (let i = passages.length - 1; i >= 0; i--) {
      const passage = passages[i];
      if (!passage || !passage.type) {
        continue;
      }
      if (passage.type === type) {
        return this.pluck(type, [passage]);
      }
      const value = this.pluck_last_recursively(type, passage.value);
      if (value != null) {
        return value;
      }
    }
    return null;
  }
  // Set available context keys.
  set_context_from_object(context, keys, obj) {
    for (const key of keys) {
      if (obj[key] == null) {
        continue;
      }
      context[key] = obj[key];
    }
  }
  // Delete existing context keys if, for example, starting with a new book. Which keys are deleted depends on the caller.
  reset_context(context, keys) {
    for (const key of keys) {
      delete context[key];
    }
  }
  // If the start chapter or verse is 0 and the appropriate option is set to `upgrade`, convert it to a 1.
  fix_start_zeroes(valid, c, v = void 0) {
    if (valid.messages?.start_chapter_is_zero && this.options.zero_chapter_strategy === "upgrade") {
      c = valid.messages.start_chapter_is_zero;
    }
    if (valid.messages?.start_verse_is_zero && this.options.zero_verse_strategy === "upgrade") {
      v = valid.messages.start_verse_is_zero;
    }
    return [c, v];
  }
  // Given a string and initial index, calculate indices for parts of the string. For example, a string that starts at index 10 might have a book that pushes it to index 12 starting at its third character.
  calculate_indices(match, adjust) {
    let switch_type = "book";
    const indices = [];
    let match_index = 0;
    if (typeof adjust !== "number") {
      adjust = parseInt(adjust, 10);
    }
    for (let part of match.split(/[\x1e\x1f]/)) {
      switch_type = switch_type === "book" ? "rest" : "book";
      const part_length = part.length;
      if (part_length === 0) {
        continue;
      }
      if (switch_type === "book") {
        const part_i = parseInt(part.replace(/\/\d+$/, ""), 10);
        const end_index = match_index + part_length;
        if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
          indices[indices.length - 1].end = end_index;
        } else {
          indices.push({
            start: match_index,
            end: end_index,
            index: adjust
          });
        }
        match_index += part_length + 2;
        adjust = this.books[part_i].start_index + this.books[part_i].value.length - match_index;
        indices.push({
          start: end_index + 1,
          end: end_index + 1,
          index: adjust
        });
      } else {
        const end_index = match_index + part_length - 1;
        if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
          indices[indices.length - 1].end = end_index;
        } else {
          indices.push({
            start: match_index,
            end: end_index,
            index: adjust
          });
        }
        match_index += part_length;
      }
    }
    return indices;
  }
  // Find the absolute string indices of start and end points.
  get_absolute_indices([start, end]) {
    let start_out = null;
    let end_out = null;
    for (const index of this.indices) {
      if (start_out === null && index.start <= start && start <= index.end) {
        start_out = start + index.index;
      }
      if (index.start <= end && end <= index.end) {
        end_out = end + index.index + 1;
        break;
      }
    }
    return [start_out, end_out];
  }
  // Apply common transformations at the end of handling a passage object with a book.
  normalize_passage_and_alternates(passage, alternates) {
    if (passage.passages.length === 0) {
      passage.passages.push(alternates.shift());
    }
    if (alternates.length > 0) {
      passage.passages[0].alternates = alternates;
    }
    if (passage.start_context.translations) {
      passage.passages[0].translations = passage.start_context.translations;
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
  }
  // ## Validators
  // Given a start and optional end bcv object, validate that the verse exists and is valid. It returns a `true` value for `valid` if any of the translations is valid.
  validate_ref(translations, start, end = null) {
    if (!translations || translations.length === 0 || !Array.isArray(translations)) {
      translations = [{
        alias: "current",
        osis: "",
        translation: "current"
      }];
    }
    let valid = false;
    const messages = {};
    for (const translation of translations) {
      if (!translation.alias) {
        messages.translation_invalid ??= [];
        messages.translation_invalid.push(translation);
        continue;
      }
      if (!this.translations.aliases[translation.alias]) {
        translation.alias = "current";
        messages.translation_unknown ??= [];
        messages.translation_unknown.push(translation);
      }
      let [temp_valid] = this.validate_start_ref(translation.alias, start, messages);
      if (end) {
        [temp_valid] = this.validate_end_ref(translation.alias, start, end, temp_valid, messages);
      }
      if (temp_valid === true) {
        valid = true;
      }
    }
    return { valid, messages };
  }
  // The end ref pretty much just has to be after the start ref; beyond the book, we don't require the chapter or verse to exist. This approach is useful when people get end verses wrong.
  validate_end_ref(translation, start, end, valid, messages) {
    const translation_order = this.translations.definitions[translation]?.order ? translation : "current";
    if (end.c === 0) {
      messages.end_chapter_is_zero = 1;
      if (this.options.zero_chapter_strategy === "error") {
        valid = false;
      } else {
        end.c = 1;
      }
    }
    if (end.v === 0) {
      messages.end_verse_is_zero = 1;
      if (this.options.zero_verse_strategy === "error") {
        valid = false;
      } else if (this.options.zero_verse_strategy === "upgrade") {
        end.v = 1;
      }
    }
    if (end.b && this.translations.definitions[translation_order].order[end.b]) {
      valid = this.validate_known_end_book(translation, translation_order, start, end, valid, messages);
    } else {
      valid = false;
      messages.end_book_not_exist = true;
    }
    return [valid, messages];
  }
  // Validate when the end book is known to exist. This function makes `validate_end_ref` easier to follow.
  validate_known_end_book(translation, translation_order, start, end, valid, messages) {
    const chapter_array = this.translations.definitions[translation]?.chapters?.[end.b] || this.translations.definitions.current.chapters[end.b];
    if (end.c == null && chapter_array.length === 1) {
      end.c = 1;
    }
    if (this.translations.definitions[translation_order].order[start.b] != null && this.translations.definitions[translation_order].order[start.b] > this.translations.definitions[translation_order].order[end.b]) {
      if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
        valid = false;
      }
      messages.end_book_before_start = true;
    }
    if (start.b === end.b && end.c != null) {
      start.c ??= 1;
      if (start.c > end.c) {
        valid = false;
        messages.end_chapter_before_start = true;
      } else if (start.c === end.c && end.v != null) {
        start.v ??= 1;
        if (start.v > end.v) {
          valid = false;
          messages.end_verse_before_start = true;
        }
      }
    }
    if (end.c != null && chapter_array[end.c - 1] == null) {
      if (chapter_array.length === 1) {
        messages.end_chapter_not_exist_in_single_chapter_book = 1;
      } else if (end.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
        messages.end_chapter_not_exist = chapter_array.length;
      }
    }
    if (end.v != null) {
      end.c ??= chapter_array.length;
      if (end.v > chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
        messages.end_verse_not_exist = chapter_array[end.c - 1];
      }
    }
    return valid;
  }
  // Validate and apply options when we know the start book is valid. This function makes `validate_start_ref` easier to follow.
  validate_known_start_book(translation, start, messages) {
    let valid = true;
    start.c ??= 1;
    const chapter_array = this.translations.definitions[translation]?.chapters?.[start.b] || this.translations.definitions.current.chapters[start.b];
    if (start.c === 0) {
      messages.start_chapter_is_zero = 1;
      if (this.options.zero_chapter_strategy === "error") {
        valid = false;
      } else {
        start.c = 1;
      }
    }
    if (start.v === 0) {
      messages.start_verse_is_zero = 1;
      if (this.options.zero_verse_strategy === "error") {
        valid = false;
      } else if (this.options.zero_verse_strategy === "upgrade") {
        start.v = 1;
      }
    }
    if (start.c > 0 && chapter_array[start.c - 1] != null) {
      if (start.v != null) {
        if (start.v > chapter_array[start.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
          valid = false;
          messages.start_verse_not_exist = chapter_array[start.c - 1];
        }
      } else if (start.c === 1 && this.options.single_chapter_1_strategy === "verse" && chapter_array.length === 1) {
        messages.start_chapter_1 = 1;
      }
    } else {
      const chapter_array_length = chapter_array.length;
      if (start.c !== 1 && chapter_array_length === 1) {
        valid = false;
        messages.start_chapter_not_exist_in_single_chapter_book = 1;
      } else if (start.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
        valid = false;
        messages.start_chapter_not_exist = chapter_array_length;
      }
    }
    return valid;
  }
  // Make sure that the start ref exists in the given translation.
  validate_start_ref(translation, start, messages) {
    let valid = true;
    const translation_order = this.translations.definitions[translation]?.order ? translation : "current";
    if (!start.b) {
      valid = false;
      messages.start_book_not_defined = true;
    } else if (this.translations.definitions[translation_order].order[start.b]) {
      valid = this.validate_known_start_book(translation, start, messages);
    } else {
      if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
        valid = false;
      }
      messages.start_book_not_exist = true;
    }
    return [valid, messages];
  }
};

// build/bcv_regexps_manager.ts
var bcv_regexps_manager = class {
  constructor(parent) {
    this.filtered_books_flags = "";
    this.parent = parent;
    this.filter_books("on", "none");
  }
  filter_books(testaments, case_sensitive) {
    const filtered_books_flags = testaments + "/" + case_sensitive;
    if (filtered_books_flags === this.filtered_books_flags) {
      return;
    }
    this.filtered_books_flags = filtered_books_flags;
    if (testaments === "ona" && case_sensitive === "none") {
      this.parent.regexps.books = this.parent.regexps.all_books;
    }
    this.parent.regexps.books = this.parent.regexps.all_books.reduce((accum, book) => {
      let cloned_book;
      if (testaments !== "ona" && testaments.indexOf(book.testament) === -1) {
        if (book.testament.length === 1 || book.testament_books == null) {
          return accum;
        } else if (!this.has_testament_overlap(testaments, book.testament)) {
          return accum;
        } else {
          const new_osis = this.get_testament_overlap(testaments, book);
          if (new_osis.length > 0) {
            cloned_book = structuredClone(book);
            cloned_book.osis = new_osis;
          } else {
            return accum;
          }
        }
      }
      if (case_sensitive === "books") {
        cloned_book ??= structuredClone(book);
        const flags = cloned_book.regexp.flags.replace("i", "");
        cloned_book.regexp = new RegExp(book.regexp.source, flags);
      }
      accum.push(cloned_book ?? book);
      return accum;
    }, []);
  }
  has_testament_overlap(testaments, book_testament) {
    const components = new Set((testaments + book_testament).split(""));
    if (components.size < testaments.length + book_testament.length) {
      return true;
    }
    return false;
  }
  // Filter the `osis` array on the `book` object to include only the books that are in the relevant testaments.
  get_testament_overlap(testaments, book) {
    const new_osis = book.osis.filter((osis) => {
      return this.has_testament_overlap(testaments, book.testament_books[osis]);
    });
    return new_osis;
  }
  // Runtime pattern changes to allow adding books without regenerating the whole module.
  add_passage_patterns(patterns) {
    if (!Array.isArray(patterns)) {
      throw "In `add_passage_patterns()`, the argument to `add_passage_patterns` should be an array.";
    }
    for (const pattern of patterns) {
      if (pattern == null || !(pattern.regexp instanceof RegExp)) {
        throw "In `add_passage_patterns()`, the `regexp` property of each pattern should be a RegExp.";
      }
      const book_data = this.get_passage_book_testaments(pattern);
      const regexps = this.get_passage_pattern_regexps(pattern, book_data);
      const regexp = new RegExp(regexps.pre_regexp.source + regexps.regexp.source + regexps.post_regexp.source, "giu");
      const position = typeof pattern.insert_at === "string" ? pattern.insert_at : "start";
      const insert_object = {
        osis: pattern.osis,
        testament: book_data.testament,
        regexp
      };
      if (book_data.testament.length > 1) {
        insert_object.testament_books = book_data.testament_books;
      }
      if (position === "start") {
        this.parent.regexps.all_books.unshift(insert_object);
      } else if (position === "end") {
        this.parent.regexps.all_books.push(insert_object);
      } else {
        let has_inserted = false;
        for (const [i, book] of this.parent.regexps.all_books.entries()) {
          if (book.osis.join(",") === position) {
            this.parent.regexps.all_books.splice(i, 0, insert_object);
            has_inserted = true;
            break;
          }
        }
        if (has_inserted === false) {
          this.parent.regexps.all_books.push(insert_object);
        }
      }
    }
    this.filtered_books_flags = "";
    this.filter_books(this.parent.options.testaments, this.parent.options.case_sensitive);
  }
  // Make the regexps that will be fed back to the pattern. Ultimately we want to know what will go before and after the provided pattern.
  get_passage_pattern_regexps(pattern, book_data) {
    let regexps = {
      pre_regexp: new RegExp(""),
      regexp: pattern.regexp,
      post_regexp: new RegExp("")
    };
    for (const regexp_type of ["pre_regexp", "post_regexp"]) {
      if (pattern[regexp_type] == null) {
        let regexp_key = regexp_type === "pre_regexp" ? "pre_book" : "post_book";
        if (book_data.has_number_book && regexp_key === "pre_book") {
          regexp_key = "pre_number_book";
        }
        regexps[regexp_type] = this.parent.regexps[regexp_key];
      } else {
        if (pattern[regexp_type] instanceof RegExp) {
          regexps[regexp_type] = pattern[regexp_type];
        } else {
          throw "In `add_passage_patterns()`, the `" + regexp_type + "` property of each pattern should be a RegExp.";
        }
      }
    }
    return regexps;
  }
  // Get data about the testaments the books are in to create RegExps for them.
  get_passage_book_testaments(pattern) {
    const books = pattern.osis;
    if (!Array.isArray(books)) {
      throw "In `add_passage_patterns()`, the `osis` property of each pattern should be an array.";
    }
    const out = {
      testament_books: {},
      has_number_book: false,
      testament: ""
    };
    const testaments = /* @__PURE__ */ new Set();
    for (const book of books) {
      if (typeof book !== "string" || this.parent.translations.definitions.default.order[book] == null) {
        throw "In `add_passage_patterns()`, unknown book in pattern: " + book;
      }
      if (book in out.testament_books) {
        throw "In `add_passage_patterns()`, every provided book should be unique. Duplicate: " + book;
      }
      let testament = "o";
      if (book === "Ps") {
        out.testament_books[book] = "oa";
        testaments.add("o");
        testaments.add("a");
      } else {
        const canonical_order = this.parent.translations.definitions.default.order[book];
        if (canonical_order >= 40) {
          testament = canonical_order <= 66 ? "n" : "a";
        }
        if (/^\d/.test(book) && /\d/.test(pattern.regexp.source)) {
          out.has_number_book = true;
        }
        out.testament_books[book] = testament;
        testaments.add(testament);
      }
    }
    if (testaments.size === 1) {
      out.testament = testaments.values().next().value;
    } else {
      for (const key of ["o", "n", "a"]) {
        if (testaments.has(key)) {
          out.testament += key;
        }
      }
    }
    return out;
  }
};

// build/bcv_parser.ts
var bcv_parser = class {
  constructor(lang = null) {
    this.passage = new bcv_passage();
    this.entities = [];
    this.options = new bcv_options(this);
    if (lang == null) {
      if (typeof grammar === "undefined") {
        throw `When creating a new bcv_parser object using ES Modules, please provide a language object. For example, here's how to provide English:
import * as lang from "es/lang/en.js";
const bcv = new bcv_parser(lang);`;
      }
      this.translations = new bcv_translations();
      this.matcher = new bcv_matcher(this, grammar);
      this.regexps = new bcv_regexps();
      this.translations = new bcv_translations();
    } else {
      this.matcher = new bcv_matcher(this, lang.grammar);
      this.regexps = new lang.regexps();
      this.translations = new lang.translations();
    }
    this.passage.translations = this.translations;
    this.passage.options = this.options;
    this.regexps_manager = new bcv_regexps_manager(this);
  }
  // ## Parse-Related Functions
  // Parse a string and prepare the object for further interrogation, depending on what's needed.
  parse(s) {
    this.reset();
    s = this.matcher.replace_control_characters(s);
    [s, this.passage.books] = this.matcher.match_books(s);
    [this.entities] = this.matcher.match_passages(s);
    return this;
  }
  // Parse a string and prepare the object for further interrogation, depending on what's needed. The second argument is a string that serves as the context for the first argument. If there's a valid partial match at the beginning of the first argument, then it will parse it using the supplied `context`. For example, `parse_string_with_context("verse 2", "Genesis 3").osis()` = `Gen.3.2`. You'd use this when you have some text that looks like it's a partial reference, and you already know the context.
  parse_with_context(s, context) {
    this.reset();
    [context, this.passage.books] = this.matcher.match_books(this.matcher.replace_control_characters(context));
    let entities;
    [entities, context] = this.matcher.match_passages(context);
    this.reset();
    s = this.matcher.replace_control_characters(s);
    [s, this.passage.books] = this.matcher.match_books(s);
    this.passage.books.push({
      value: "",
      parsed: "",
      start_index: 0,
      type: "context",
      context
    });
    s = "" + (this.passage.books.length - 1) + "/9" + s;
    [this.entities] = this.matcher.match_passages(s);
    return this;
  }
  reset() {
    this.entities = [];
    this.passage.books = [];
    this.passage.indices = {};
  }
  // ## Options-Related Functions
  // Override default options.
  set_options(options) {
    if (options.include_apocrypha != null) {
      this.include_apocrypha(options.include_apocrypha);
      delete options.include_apocrypha;
    }
    for (const [key, value] of Object.entries(options)) {
      if (typeof this.options[key] === "string") {
        this.options[key] = value;
      }
    }
    return this;
  }
  // Legacy way to indicate that the Apocrypha should be included in the list of books.
  include_apocrypha(arg) {
    const old_value = this.options.testaments;
    let new_value = old_value;
    if (arg === true && old_value.indexOf("a") === -1) {
      new_value = new_value + "a";
    } else if (arg === false && old_value.indexOf("a") >= 1) {
      new_value = new_value.slice(0, -1);
    }
    if (new_value !== old_value) {
      this.options.testaments = new_value;
    }
    return this;
  }
  // ## Administrative Functions
  // Return translation information so that we don't have to reach into semi-private objects to grab the data we need.
  translation_info(new_translation = "default") {
    if (typeof new_translation !== "string" || !new_translation) {
      new_translation = "default";
    }
    if (this.translations.aliases[new_translation]?.alias) {
      new_translation = this.translations.aliases[new_translation].alias;
    }
    if (this.translations.definitions[new_translation] == null) {
      if (this.options.warn_level === "warn") {
        console.warn(`Unknown translation "new_translation" in translation_info(). Using default instead.`);
      }
      new_translation = "default";
    }
    const old_translation = this.options.versification_system;
    this.options.versification_system = new_translation;
    const out = {
      alias: new_translation,
      books: [],
      chapters: structuredClone(this.translations.definitions.current.chapters),
      order: structuredClone(this.translations.definitions.current.order)
    };
    for (const [book, id] of Object.entries(out.order)) {
      out.books[id - 1] = book;
    }
    if (new_translation !== old_translation) {
      this.options.versification_system = old_translation;
    }
    return out;
  }
  // ## Output-Related Functions
  // Return a single OSIS string (comma-separated) for all the references in the whole input string.
  osis() {
    const out = [];
    for (const osis of this.parsed_entities()) {
      if (osis.osis.length > 0) {
        out.push(osis.osis);
      }
    }
    return out.join(",");
  }
  // Return an array of `[OSIS, TRANSLATIONS]` for each reference (combined according to various options).
  osis_and_translations() {
    const out = [];
    for (const osis of this.parsed_entities()) {
      if (osis.osis.length > 0) {
        out.push([osis.osis, osis.translations.join(",")]);
      }
    }
    return out;
  }
  // Return an array of `{osis: OSIS, indices:[START, END], translations: [TRANSLATIONS]}` objects for each reference (combined according to `options`).
  osis_and_indices() {
    const out = [];
    for (const osis of this.parsed_entities()) {
      if (osis.osis.length > 0) {
        out.push({
          osis: osis.osis,
          translations: osis.translations,
          indices: osis.indices
        });
      }
    }
    return out;
  }
  // Return all objects, probably for additional processing.
  parsed_entities() {
    let out = [];
    this.entities.forEach((entity, entity_id) => {
      if (entity.type && entity.type === "translation_sequence" && out.length > 0 && entity_id === out[out.length - 1].entity_id + 1) {
        out[out.length - 1].indices[1] = entity.absolute_indices[1];
      }
      if (entity.passages == null) {
        return;
      }
      if (entity.type === "b" && this.options.book_alone_strategy === "ignore" || entity.type === "b_range" && this.options.book_range_strategy === "ignore" || entity.type === "context") {
        return;
      }
      let translations = [];
      let translation_alias = "";
      if (entity.passages[0].translations) {
        for (const translation of entity.passages[0].translations) {
          const translation_osis = translation.osis && translation.osis.length > 0 ? translation.osis : "";
          if (translation_alias === "") {
            translation_alias = translation.alias;
          }
          translations.push(translation_osis);
        }
      } else {
        translations = [""];
        translation_alias = "current";
      }
      let osises = this.parse_entity_passages(entity, entity_id, translations, translation_alias);
      if (osises.length === 0) {
        return;
      }
      if (osises.length > 1 && this.options.consecutive_combination_strategy === "combine") {
        osises = this.combine_consecutive_passages(osises, translation_alias);
      }
      if (this.options.sequence_combination_strategy === "separate") {
        out = out.concat(osises);
      } else {
        const strings = [];
        const last_i = osises.length - 1;
        if (osises[last_i].enclosed_indices && osises[last_i].enclosed_indices[1] >= 0) {
          entity.absolute_indices[1] = osises[last_i].enclosed_indices[1];
        }
        for (const osis of osises) {
          if (osis.osis.length > 0) {
            strings.push(osis.osis);
          }
        }
        out.push({
          osis: strings.join(","),
          indices: entity.absolute_indices,
          translations,
          entity_id,
          entities: osises
        });
      }
    });
    return out;
  }
  parse_entity_passages(entity, entity_id, translations, translation_alias) {
    const osises = [];
    const length = entity.passages.length;
    const include_old_testament = this.options.testaments.indexOf("o") >= 0;
    entity.passages.forEach((passage, i) => {
      if (!passage.type) {
        passage.type = entity.type;
      }
      if (passage.valid.valid === false) {
        if (this.options.invalid_sequence_strategy === "ignore" && entity.type === "sequence") {
          this.snap_sequence("ignore", entity, osises, i, length);
        }
        if (this.options.invalid_passage_strategy === "ignore") {
          return;
        }
      }
      if ((passage.type === "b" || passage.type === "b_range") && this.options.book_sequence_strategy === "ignore" && entity.type === "sequence") {
        this.snap_sequence("book", entity, osises, i, length);
        return;
      }
      if (include_old_testament === false && (passage.start.b === "Ps" && (passage.start.c != null && passage.start.c < 151) && passage.end.b === "Ps" && (passage.end.c != null && passage.end.c < 151))) {
        return;
      }
      if ((passage.type === "b_range_start" || passage.type === "range_end_b") && this.options.book_range_strategy === "ignore") {
        this.snap_range(entity, i);
      }
      if (!passage.absolute_indices) {
        passage.absolute_indices = [...entity.absolute_indices];
      }
      osises.push({
        osis: passage.valid.valid ? this.to_osis(passage.start, passage.end, translation_alias) : "",
        type: passage.type,
        indices: passage.absolute_indices,
        translations,
        start: passage.start,
        end: passage.end,
        enclosed_indices: passage.enclosed_absolute_indices,
        entity_id,
        entities: [passage]
      });
    });
    return osises;
  }
  // Takes OSIS objects and converts them to OSIS strings based on compaction preferences.
  to_osis(start, end, translation) {
    if (end.c == null && end.v == null && start.c == null && start.v == null && start.b === end.b && this.options.book_alone_strategy === "first_chapter") {
      end.c = 1;
    }
    const osis = { start: "", end: "" };
    if (start.c == null) {
      start.c = 1;
    }
    if (start.v == null) {
      start.v = 1;
    }
    if (this.options.versification_system.indexOf("a") >= 0 && this.options.ps151_strategy === "b" && (start.c === 151 && start.b === "Ps" || end.c === 151 && end.b === "Ps")) {
      this.fix_ps151(start, end, translation);
    }
    const chapter_array = this.passage.translations.definitions[translation]?.chapters[end.b] || this.passage.translations.definitions.current.chapters[end.b];
    if (end.c == null) {
      if (this.options.passage_existence_strategy.indexOf("c") >= 0 || chapter_array && chapter_array.length === 1) {
        end.c = chapter_array.length;
      } else {
        end.c = 999;
      }
    }
    if (end.v == null) {
      if (chapter_array && chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
        end.v = chapter_array[end.c - 1];
      } else {
        end.v = 999;
      }
    }
    if (this.options.osis_compaction_strategy === "b" && start.c === 1 && start.v === 1 && (end.c === 999 && end.v === 999 || end.c === chapter_array.length && this.options.passage_existence_strategy.indexOf("c") >= 0 && (end.v === 999 || end.v === chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0))) {
      osis.start = start.b;
      osis.end = end.b;
    } else if (this.options.osis_compaction_strategy.length <= 2 && start.v === 1 && (end.v === 999 || end.v === chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0)) {
      osis.start = start.b + "." + start.c;
      osis.end = end.b + "." + end.c;
    } else {
      osis.start = start.b + "." + start.c + "." + start.v;
      osis.end = end.b + "." + end.c + "." + end.v;
    }
    let out = "";
    if (osis.start === osis.end) {
      out = osis.start;
    } else {
      out = osis.start + "-" + osis.end;
    }
    if (start.extra) {
      out = start.extra + "," + out;
    }
    if (end.extra) {
      out += "," + end.extra;
    }
    return out;
  }
  // If we want to treat Ps151 as a book rather than a chapter, we have to do some gymnastics to make sure it returns properly.
  fix_ps151(start, end, translation) {
    const old_versification_system = this.options.versification_system;
    this.options.versification_system = translation;
    const new_versification_system = this.options.versification_system;
    if (start.c === 151 && start.b === "Ps") {
      if (end.c === 151 && end.b === "Ps") {
        start.b = "Ps151";
        start.c = 1;
        end.b = "Ps151";
        end.c = 1;
      } else {
        start.extra = this.to_osis(
          { b: "Ps151", c: 1, v: start.v },
          { b: "Ps151", c: 1, v: this.translations.definitions.current.chapters["Ps151"][0] },
          translation
        );
        start.b = "Prov";
        start.c = 1;
        start.v = 1;
      }
    } else {
      end.extra = this.to_osis(
        { b: "Ps151", c: 1, v: 1 },
        { b: "Ps151", c: 1, v: end.v },
        translation
      );
      end.c = 150;
      end.v = this.translations.definitions.current.chapters["Ps"][149];
    }
    if (old_versification_system !== new_versification_system) {
      this.options.versification_system = old_versification_system;
    }
  }
  // If we have the correct `option` set (checked before calling this function), merge passages that refer to sequential verses: Gen 1, 2 -> Gen 1-2. It works for any combination of books, chapters, and verses.
  combine_consecutive_passages(osises, translation) {
    const out = [];
    let prev = {};
    const last_i = osises.length - 1;
    let enclosed_sequence_start = -1;
    let has_enclosed = false;
    osises.forEach((osis, i) => {
      if (osis.osis.length > 0) {
        const prev_i = out.length - 1;
        let is_enclosed_last = false;
        if (osis.enclosed_indices[0] !== enclosed_sequence_start) {
          enclosed_sequence_start = osis.enclosed_indices[0];
        }
        if (enclosed_sequence_start >= 0 && (i === last_i || osises[i + 1].enclosed_indices[0] !== osis.enclosed_indices[0])) {
          is_enclosed_last = true;
          has_enclosed = true;
        }
        if (this.is_verse_consecutive(prev, osis.start, translation)) {
          out[prev_i].end = osis.end;
          out[prev_i].is_enclosed_last = is_enclosed_last;
          out[prev_i].indices[1] = osis.indices[1];
          out[prev_i].enclosed_indices[1] = osis.enclosed_indices[1];
          out[prev_i].osis = this.to_osis(out[prev_i].start, osis.end, translation);
        } else {
          out.push(osis);
        }
        prev = { b: osis.end.b, c: osis.end.c, v: osis.end.v };
      } else {
        out.push(osis);
        prev = {};
      }
    });
    if (has_enclosed) {
      this.snap_enclosed_indices(out);
    }
    return out;
  }
  // If there's an enclosed reference--e.g., Ps 1 (2)--and we've combined consecutive passages in such a way that the enclosed reference is fully inside the sequence (i.e., if it starts before the enclosed sequence), then make sure the end index for the passage includes the necessary closing punctuation.
  snap_enclosed_indices(osises) {
    for (const osis of osises) {
      if (osis.is_enclosed_last != null) {
        if (osis.enclosed_indices[0] < 0 && osis.is_enclosed_last) {
          osis.indices[1] = osis.enclosed_indices[1];
        }
        delete osis.is_enclosed_last;
      }
    }
    return osises;
  }
  /* Given two fully specified objects (complete bcvs), find whether they're sequential.
  * Same book, same chapter, and next verse (e.g., Gen.1.1 followed by Gen.1.2)
  * Same book, next chapter, and first verse if the previous chapter ended properly (e.g., Gen.1.31 followed by Gen.2.1)
  * Next book, first chapter, and first verse if the previous book ended properly (e.g., Mal.4.6 followed by Matt.1.1)
  */
  is_verse_consecutive(prev, check, translation) {
    if (!prev.b) {
      return false;
    }
    const translation_order = this.passage.translations.definitions[translation]?.order || this.passage.translations.definitions.current.order;
    const chapter_array = this.passage.translations.definitions[translation]?.chapters?.[prev.b] || this.passage.translations.definitions.current.chapters[prev.b];
    if (prev.b === check.b) {
      if (prev.c === check.c) {
        return prev.v === check.v - 1;
      } else if (check.v === 1 && prev.c === check.c - 1) {
        const prev_chapter_verse_count = chapter_array[prev.c - 1];
        return prev.v === prev_chapter_verse_count;
      }
    } else if (check.c === 1 && check.v === 1 && translation_order[prev.b] === translation_order[check.b] - 1) {
      return prev.c === chapter_array.length && prev.v === chapter_array[prev.c - 1];
    }
    return false;
  }
  // Snap the start/end index of the range when it includes a book on its own and `this.options.book_range_strategy` is `ignore`.
  snap_range(entity, passage_i) {
    let entity_i = 0;
    let source_entity = "start";
    let type = "range_end_b";
    if (entity.original_type === "b_range_start") {
      entity.type = entity.original_type;
      delete entity.original_type;
    }
    if (entity.type === "b_range_start" || entity.type === "sequence" && entity.passages[passage_i].type === "b_range_start") {
      entity_i = 1;
      source_entity = "end";
      type = "b_range_start";
    }
    const target_entity = source_entity === "end" ? "start" : "end";
    for (const obj_type of [source_entity, target_entity]) {
      if (entity.passages[passage_i][obj_type].original_object != null) {
        entity.passages[passage_i][obj_type] = entity.passages[passage_i][obj_type].original_object;
      }
    }
    const original_target = structuredClone(entity.passages[passage_i][target_entity]);
    entity.passages[passage_i][target_entity] = structuredClone(entity.passages[passage_i][source_entity]);
    entity.passages[passage_i][target_entity].original_object = original_target;
    entity.passages[passage_i][source_entity].original_object = structuredClone(entity.passages[passage_i][source_entity]);
    if (entity.type === "sequence") {
      if (passage_i >= entity.value.length) {
        passage_i = entity.value.length - 1;
      }
      const pluck = this.passage.pluck(type, entity.value[passage_i]);
      if (pluck != null) {
        const temp = this.snap_range(pluck, 0);
        if (passage_i === 0) {
          entity.absolute_indices[0] = temp.absolute_indices[0];
        } else {
          entity.absolute_indices[1] = temp.absolute_indices[1];
        }
      }
    } else {
      entity.original_type = entity.type;
      entity.type = entity.value[entity_i].type;
      entity.absolute_indices = [
        entity.value[entity_i].absolute_indices[0],
        entity.value[entity_i].absolute_indices[1]
      ];
    }
    return entity;
  }
  // Snap the start/end index of the entity or surrounding passages when there's a lone book or invalid item in a sequence.
  snap_sequence(type, entity, osises, i, length) {
    const passage = entity.passages[i];
    if (passage.absolute_indices[0] === entity.absolute_indices[0] && i < length - 1 && this.get_snap_sequence_i(entity.passages, i, length) !== i) {
      entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0];
      this.remove_absolute_indices(entity.passages, i + 1);
    } else if (passage.absolute_indices[1] === entity.absolute_indices[1] && i > 0) {
      entity.absolute_indices[1] = osises.length > 0 ? osises[osises.length - 1].indices[1] : entity.passages[i - 1].absolute_indices[1];
    } else if (type === "book" && i < length - 1 && !this.starts_with_book(entity.passages[i + 1])) {
      entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0];
    }
  }
  // Identify whether there are any valid items between the current item and the next book.
  get_snap_sequence_i(passages, passage_i, length) {
    for (let i = passage_i + 1; i < length; i++) {
      if (this.starts_with_book(passages[i])) {
        return i;
      }
      if (passages[i].valid.valid) {
        return passage_i;
      }
    }
    return passage_i;
  }
  // Given a passage, does it start with a book? It never takes a sequence as an argument.
  starts_with_book(passage) {
    if (passage.type.substring(0, 1) === "b") {
      return true;
    }
    if ((passage.type === "range" || passage.type === "ff") && passage.start && passage.start.type && passage.start.type.substring(0, 1) === "b") {
      return true;
    }
    return false;
  }
  // Remove absolute indices from the given passage to the end of the sequence. We do this when we don't want to include the end of a sequence in the sequence (most likely because it's invalid or a book on its own).
  remove_absolute_indices(passages, passage_i) {
    if (passages[passage_i].enclosed_absolute_indices[0] < 0) {
      return;
    }
    const [start, end] = passages[passage_i].enclosed_absolute_indices;
    const passages_length = passages.length;
    for (const passage of passages.slice(passage_i)) {
      if (passage.enclosed_absolute_indices[0] === start && passage.enclosed_absolute_indices[1] === end) {
        passage.enclosed_absolute_indices = [-1, -1];
      } else {
        break;
      }
    }
  }
  add_passage_patterns(patterns) {
    return this.regexps_manager.add_passage_patterns(patterns);
  }
};
export {
  bcv_parser
};

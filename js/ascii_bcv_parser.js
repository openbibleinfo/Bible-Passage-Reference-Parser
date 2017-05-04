(function() {
  var bcv_parser, bcv_passage, bcv_utils, root,
    hasProp = {}.hasOwnProperty;

  root = this;

  bcv_parser = (function() {
    bcv_parser.prototype.s = "";

    bcv_parser.prototype.entities = [];

    bcv_parser.prototype.passage = null;

    bcv_parser.prototype.regexps = {};

    bcv_parser.prototype.options = {
      consecutive_combination_strategy: "combine",
      osis_compaction_strategy: "b",
      book_sequence_strategy: "ignore",
      invalid_sequence_strategy: "ignore",
      sequence_combination_strategy: "combine",
      punctuation_strategy: "us",
      invalid_passage_strategy: "ignore",
      non_latin_digits_strategy: "ignore",
      passage_existence_strategy: "bcv",
      zero_chapter_strategy: "error",
      zero_verse_strategy: "error",
      single_chapter_1_strategy: "chapter",
      book_alone_strategy: "ignore",
      book_range_strategy: "ignore",
      captive_end_digits_strategy: "delete",
      end_range_digits_strategy: "verse",
      include_apocrypha: false,
      ps151_strategy: "c",
      versification_system: "default",
      case_sensitive: "none"
    };

    function bcv_parser() {
      var key, ref, val;
      this.options = {};
      ref = bcv_parser.prototype.options;
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        val = ref[key];
        this.options[key] = val;
      }
      this.versification_system(this.options.versification_system);
    }

    bcv_parser.prototype.parse = function(s) {
      var ref;
      this.reset();
      this.s = s;
      s = this.replace_control_characters(s);
      ref = this.match_books(s), s = ref[0], this.passage.books = ref[1];
      this.entities = this.match_passages(s)[0];
      return this;
    };

    bcv_parser.prototype.parse_with_context = function(s, context) {
      var entities, ref, ref1, ref2;
      this.reset();
      ref = this.match_books(this.replace_control_characters(context)), context = ref[0], this.passage.books = ref[1];
      ref1 = this.match_passages(context), entities = ref1[0], context = ref1[1];
      this.reset();
      this.s = s;
      s = this.replace_control_characters(s);
      ref2 = this.match_books(s), s = ref2[0], this.passage.books = ref2[1];
      this.passage.books.push({
        value: "",
        parsed: [],
        start_index: 0,
        type: "context",
        context: context
      });
      s = "\x1f" + (this.passage.books.length - 1) + "/9\x1f" + s;
      this.entities = this.match_passages(s)[0];
      return this;
    };

    bcv_parser.prototype.reset = function() {
      this.s = "";
      this.entities = [];
      if (this.passage) {
        this.passage.books = [];
        return this.passage.indices = {};
      } else {
        this.passage = new bcv_passage;
        this.passage.options = this.options;
        return this.passage.translations = this.translations;
      }
    };

    bcv_parser.prototype.set_options = function(options) {
      var key, val;
      for (key in options) {
        if (!hasProp.call(options, key)) continue;
        val = options[key];
        if (key === "include_apocrypha" || key === "versification_system" || key === "case_sensitive") {
          this[key](val);
        } else {
          this.options[key] = val;
        }
      }
      return this;
    };

    bcv_parser.prototype.include_apocrypha = function(arg) {
      var base, base1, ref, translation, verse_count;
      if (!((arg != null) && (arg === true || arg === false))) {
        return this;
      }
      this.options.include_apocrypha = arg;
      this.regexps.books = this.regexps.get_books(arg, this.options.case_sensitive);
      ref = this.translations;
      for (translation in ref) {
        if (!hasProp.call(ref, translation)) continue;
        if (translation === "aliases" || translation === "alternates") {
          continue;
        }
        if ((base = this.translations[translation]).chapters == null) {
          base.chapters = {};
        }
        if ((base1 = this.translations[translation].chapters)["Ps"] == null) {
          base1["Ps"] = bcv_utils.shallow_clone_array(this.translations["default"].chapters["Ps"]);
        }
        if (arg === true) {
          if (this.translations[translation].chapters["Ps151"] != null) {
            verse_count = this.translations[translation].chapters["Ps151"][0];
          } else {
            verse_count = this.translations["default"].chapters["Ps151"][0];
          }
          this.translations[translation].chapters["Ps"][150] = verse_count;
        } else {
          if (this.translations[translation].chapters["Ps"].length === 151) {
            this.translations[translation].chapters["Ps"].pop();
          }
        }
      }
      return this;
    };

    bcv_parser.prototype.versification_system = function(system) {
      var base, base1, base2, book, chapter_list, ref, ref1;
      if (!((system != null) && (this.translations[system] != null))) {
        return this;
      }
      if (this.translations.alternates["default"] != null) {
        if (system === "default") {
          if (this.translations.alternates["default"].order != null) {
            this.translations["default"].order = bcv_utils.shallow_clone(this.translations.alternates["default"].order);
          }
          ref = this.translations.alternates["default"].chapters;
          for (book in ref) {
            if (!hasProp.call(ref, book)) continue;
            chapter_list = ref[book];
            this.translations["default"].chapters[book] = bcv_utils.shallow_clone_array(chapter_list);
          }
        } else {
          this.versification_system("default");
        }
      }
      if ((base = this.translations.alternates)["default"] == null) {
        base["default"] = {
          order: null,
          chapters: {}
        };
      }
      if (system !== "default" && (this.translations[system].order != null)) {
        if ((base1 = this.translations.alternates["default"]).order == null) {
          base1.order = bcv_utils.shallow_clone(this.translations["default"].order);
        }
        this.translations["default"].order = bcv_utils.shallow_clone(this.translations[system].order);
      }
      if (system !== "default" && (this.translations[system].chapters != null)) {
        ref1 = this.translations[system].chapters;
        for (book in ref1) {
          if (!hasProp.call(ref1, book)) continue;
          chapter_list = ref1[book];
          if ((base2 = this.translations.alternates["default"].chapters)[book] == null) {
            base2[book] = bcv_utils.shallow_clone_array(this.translations["default"].chapters[book]);
          }
          this.translations["default"].chapters[book] = bcv_utils.shallow_clone_array(chapter_list);
        }
      }
      this.options.versification_system = system;
      this.include_apocrypha(this.options.include_apocrypha);
      return this;
    };

    bcv_parser.prototype.case_sensitive = function(arg) {
      if (!((arg != null) && (arg === "none" || arg === "books"))) {
        return this;
      }
      if (arg === this.options.case_sensitive) {
        return this;
      }
      this.options.case_sensitive = arg;
      this.regexps.books = this.regexps.get_books(this.options.include_apocrypha, arg);
      return this;
    };

    bcv_parser.prototype.translation_info = function(new_translation) {
      var book, chapter_list, id, old_translation, out, ref, ref1, ref2;
      if (new_translation == null) {
        new_translation = "default";
      }
      if ((new_translation != null) && (((ref = this.translations.aliases[new_translation]) != null ? ref.alias : void 0) != null)) {
        new_translation = this.translations.aliases[new_translation].alias;
      }
      if (!((new_translation != null) && (this.translations[new_translation] != null))) {
        new_translation = "default";
      }
      old_translation = this.options.versification_system;
      if (new_translation !== old_translation) {
        this.versification_system(new_translation);
      }
      out = {
        alias: new_translation,
        books: [],
        chapters: {},
        order: bcv_utils.shallow_clone(this.translations["default"].order)
      };
      ref1 = this.translations["default"].chapters;
      for (book in ref1) {
        if (!hasProp.call(ref1, book)) continue;
        chapter_list = ref1[book];
        out.chapters[book] = bcv_utils.shallow_clone_array(chapter_list);
      }
      ref2 = out.order;
      for (book in ref2) {
        if (!hasProp.call(ref2, book)) continue;
        id = ref2[book];
        out.books[id - 1] = book;
      }
      if (new_translation !== old_translation) {
        this.versification_system(old_translation);
      }
      return out;
    };

    bcv_parser.prototype.replace_control_characters = function(s) {
      s = s.replace(this.regexps.control, " ");
      if (this.options.non_latin_digits_strategy === "replace") {
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
    };

    bcv_parser.prototype.match_books = function(s) {
      var book, books, has_replacement, k, len, ref;
      books = [];
      ref = this.regexps.books;
      for (k = 0, len = ref.length; k < len; k++) {
        book = ref[k];
        has_replacement = false;
        s = s.replace(book.regexp, function(full, prev, bk) {
          var extra;
          has_replacement = true;
          books.push({
            value: bk,
            parsed: book.osis,
            type: "book"
          });
          extra = book.extra != null ? "/" + book.extra : "";
          return prev + "\x1f" + (books.length - 1) + extra + "\x1f";
        });
        if (has_replacement === true && /^[\s\x1f\d:.,;\-\u2013\u2014]+$/.test(s)) {
          break;
        }
      }
      s = s.replace(this.regexps.translations, function(match) {
        books.push({
          value: match,
          parsed: match.toLowerCase(),
          type: "translation"
        });
        return "\x1e" + (books.length - 1) + "\x1e";
      });
      return [s, this.get_book_indices(books, s)];
    };

    bcv_parser.prototype.get_book_indices = function(books, s) {
      var add_index, match, re;
      add_index = 0;
      re = /([\x1f\x1e])(\d+)(?:\/\d+)?\1/g;
      while (match = re.exec(s)) {
        books[match[2]].start_index = match.index + add_index;
        add_index += books[match[2]].value.length - match[0].length;
      }
      return books;
    };

    bcv_parser.prototype.match_passages = function(s) {
      var accum, book_id, entities, full, match, next_char, original_part_length, part, passage, post_context, ref, regexp_index_adjust, start_index_adjust;
      entities = [];
      post_context = {};
      while (match = this.regexps.escaped_passage.exec(s)) {
        full = match[0], part = match[1], book_id = match[2];
        original_part_length = part.length;
        match.index += full.length - original_part_length;
        if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
          part = part.replace(/\s+\d+\s*$/, "");
        }
        if (!/[\d\x1f\x1e)]$/.test(part)) {
          part = this.replace_match_end(part);
        }
        if (this.options.captive_end_digits_strategy === "delete") {
          next_char = match.index + part.length;
          if (s.length > next_char && /^\w/.test(s.substr(next_char, 1))) {
            part = part.replace(/[\s*]+\d+$/, "");
          }
          part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
        }
        part = part.replace(/[A-Z]+/g, function(capitals) {
          return capitals.toLowerCase();
        });
        start_index_adjust = part.substr(0, 1) === "\x1f" ? 0 : part.split("\x1f")[0].length;
        passage = {
          value: grammar.parse(part, {
            punctuation_strategy: this.options.punctuation_strategy
          }),
          type: "base",
          start_index: this.passage.books[book_id].start_index - start_index_adjust,
          match: part
        };
        if (this.options.book_alone_strategy === "full" && this.options.book_range_strategy === "include" && passage.value[0].type === "b" && (passage.value.length === 1 || (passage.value.length > 1 && passage.value[1].type === "translation_sequence")) && start_index_adjust === 0 && (this.passage.books[book_id].parsed.length === 1 || (this.passage.books[book_id].parsed.length > 1 && this.passage.books[book_id].parsed[1].type === "translation")) && /^[234]/.test(this.passage.books[book_id].parsed[0])) {
          this.create_book_range(s, passage, book_id);
        }
        ref = this.passage.handle_obj(passage), accum = ref[0], post_context = ref[1];
        entities = entities.concat(accum);
        regexp_index_adjust = this.adjust_regexp_end(accum, original_part_length, part.length);
        if (regexp_index_adjust > 0) {
          this.regexps.escaped_passage.lastIndex -= regexp_index_adjust;
        }
      }
      return [entities, post_context];
    };

    bcv_parser.prototype.adjust_regexp_end = function(accum, old_length, new_length) {
      var regexp_index_adjust;
      regexp_index_adjust = 0;
      if (accum.length > 0) {
        regexp_index_adjust = old_length - accum[accum.length - 1].indices[1] - 1;
      } else if (old_length !== new_length) {
        regexp_index_adjust = old_length - new_length;
      }
      return regexp_index_adjust;
    };

    bcv_parser.prototype.replace_match_end = function(part) {
      var match, remove;
      remove = part.length;
      while (match = this.regexps.match_end_split.exec(part)) {
        remove = match.index + match[0].length;
      }
      if (remove < part.length) {
        part = part.substr(0, remove);
      }
      return part;
    };

    bcv_parser.prototype.create_book_range = function(s, passage, book_id) {
      var cases, i, k, limit, prev, range_regexp, ref;
      cases = [bcv_parser.prototype.regexps.first, bcv_parser.prototype.regexps.second, bcv_parser.prototype.regexps.third];
      limit = parseInt(this.passage.books[book_id].parsed[0].substr(0, 1), 10);
      for (i = k = 1, ref = limit; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
        range_regexp = i === limit - 1 ? bcv_parser.prototype.regexps.range_and : bcv_parser.prototype.regexps.range_only;
        prev = s.match(RegExp("(?:^|\\W)(" + cases[i - 1] + "\\s*" + range_regexp + "\\s*)\\x1f" + book_id + "\\x1f", "i"));
        if (prev != null) {
          return this.add_book_range_object(passage, prev, i);
        }
      }
      return false;
    };

    bcv_parser.prototype.add_book_range_object = function(passage, prev, start_book_number) {
      var i, k, length, ref, ref1, results;
      length = prev[1].length;
      passage.value[0] = {
        type: "b_range_pre",
        value: [
          {
            type: "b_pre",
            value: start_book_number.toString(),
            indices: [prev.index, prev.index + length]
          }, passage.value[0]
        ],
        indices: [0, passage.value[0].indices[1] + length]
      };
      passage.value[0].value[1].indices[0] += length;
      passage.value[0].value[1].indices[1] += length;
      passage.start_index -= length;
      passage.match = prev[1] + passage.match;
      if (passage.value.length === 1) {
        return;
      }
      results = [];
      for (i = k = 1, ref = passage.value.length; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
        if (passage.value[i].value == null) {
          continue;
        }
        if (((ref1 = passage.value[i].value[0]) != null ? ref1.indices : void 0) != null) {
          passage.value[i].value[0].indices[0] += length;
          passage.value[i].value[0].indices[1] += length;
        }
        passage.value[i].indices[0] += length;
        results.push(passage.value[i].indices[1] += length);
      }
      return results;
    };

    bcv_parser.prototype.osis = function() {
      var k, len, osis, out, ref;
      out = [];
      ref = this.parsed_entities();
      for (k = 0, len = ref.length; k < len; k++) {
        osis = ref[k];
        if (osis.osis.length > 0) {
          out.push(osis.osis);
        }
      }
      return out.join(",");
    };

    bcv_parser.prototype.osis_and_translations = function() {
      var k, len, osis, out, ref;
      out = [];
      ref = this.parsed_entities();
      for (k = 0, len = ref.length; k < len; k++) {
        osis = ref[k];
        if (osis.osis.length > 0) {
          out.push([osis.osis, osis.translations.join(",")]);
        }
      }
      return out;
    };

    bcv_parser.prototype.osis_and_indices = function() {
      var k, len, osis, out, ref;
      out = [];
      ref = this.parsed_entities();
      for (k = 0, len = ref.length; k < len; k++) {
        osis = ref[k];
        if (osis.osis.length > 0) {
          out.push({
            osis: osis.osis,
            translations: osis.translations,
            indices: osis.indices
          });
        }
      }
      return out;
    };

    bcv_parser.prototype.parsed_entities = function() {
      var entity, entity_id, i, k, l, last_i, len, len1, length, m, n, osis, osises, out, passage, ref, ref1, ref2, ref3, strings, translation, translation_alias, translation_osis, translations;
      out = [];
      for (entity_id = k = 0, ref = this.entities.length; 0 <= ref ? k < ref : k > ref; entity_id = 0 <= ref ? ++k : --k) {
        entity = this.entities[entity_id];
        if (entity.type && entity.type === "translation_sequence" && out.length > 0 && entity_id === out[out.length - 1].entity_id + 1) {
          out[out.length - 1].indices[1] = entity.absolute_indices[1];
        }
        if (entity.passages == null) {
          continue;
        }
        if ((entity.type === "b" && this.options.book_alone_strategy === "ignore") || (entity.type === "b_range" && this.options.book_range_strategy === "ignore") || entity.type === "context") {
          continue;
        }
        translations = [];
        translation_alias = null;
        if (entity.passages[0].translations != null) {
          ref1 = entity.passages[0].translations;
          for (l = 0, len = ref1.length; l < len; l++) {
            translation = ref1[l];
            translation_osis = ((ref2 = translation.osis) != null ? ref2.length : void 0) > 0 ? translation.osis : "";
            if (translation_alias == null) {
              translation_alias = translation.alias;
            }
            translations.push(translation_osis);
          }
        } else {
          translations = [""];
          translation_alias = "default";
        }
        osises = [];
        length = entity.passages.length;
        for (i = m = 0, ref3 = length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
          passage = entity.passages[i];
          if (passage.type == null) {
            passage.type = entity.type;
          }
          if (passage.valid.valid === false) {
            if (this.options.invalid_sequence_strategy === "ignore" && entity.type === "sequence") {
              this.snap_sequence("ignore", entity, osises, i, length);
            }
            if (this.options.invalid_passage_strategy === "ignore") {
              continue;
            }
          }
          if ((passage.type === "b" || passage.type === "b_range") && this.options.book_sequence_strategy === "ignore" && entity.type === "sequence") {
            this.snap_sequence("book", entity, osises, i, length);
            continue;
          }
          if ((passage.type === "b_range_start" || passage.type === "range_end_b") && this.options.book_range_strategy === "ignore") {
            this.snap_range(entity, i);
          }
          if (passage.absolute_indices == null) {
            passage.absolute_indices = entity.absolute_indices;
          }
          osises.push({
            osis: passage.valid.valid ? this.to_osis(passage.start, passage.end, translation_alias) : "",
            type: passage.type,
            indices: passage.absolute_indices,
            translations: translations,
            start: passage.start,
            end: passage.end,
            enclosed_indices: passage.enclosed_absolute_indices,
            entity_id: entity_id,
            entities: [passage]
          });
        }
        if (osises.length === 0) {
          continue;
        }
        if (osises.length > 1 && this.options.consecutive_combination_strategy === "combine") {
          osises = this.combine_consecutive_passages(osises, translation_alias);
        }
        if (this.options.sequence_combination_strategy === "separate") {
          out = out.concat(osises);
        } else {
          strings = [];
          last_i = osises.length - 1;
          if ((osises[last_i].enclosed_indices != null) && osises[last_i].enclosed_indices[1] >= 0) {
            entity.absolute_indices[1] = osises[last_i].enclosed_indices[1];
          }
          for (n = 0, len1 = osises.length; n < len1; n++) {
            osis = osises[n];
            if (osis.osis.length > 0) {
              strings.push(osis.osis);
            }
          }
          out.push({
            osis: strings.join(","),
            indices: entity.absolute_indices,
            translations: translations,
            entity_id: entity_id,
            entities: osises
          });
        }
      }
      return out;
    };

    bcv_parser.prototype.to_osis = function(start, end, translation) {
      var osis, out;
      if ((end.c == null) && (end.v == null) && start.b === end.b && (start.c == null) && (start.v == null) && this.options.book_alone_strategy === "first_chapter") {
        end.c = 1;
      }
      osis = {
        start: "",
        end: ""
      };
      if (start.c == null) {
        start.c = 1;
      }
      if (start.v == null) {
        start.v = 1;
      }
      if (end.c == null) {
        if (this.options.passage_existence_strategy.indexOf("c") >= 0 || ((this.passage.translations[translation].chapters[end.b] != null) && this.passage.translations[translation].chapters[end.b].length === 1)) {
          end.c = this.passage.translations[translation].chapters[end.b].length;
        } else {
          end.c = 999;
        }
      }
      if (end.v == null) {
        if ((this.passage.translations[translation].chapters[end.b][end.c - 1] != null) && this.options.passage_existence_strategy.indexOf("v") >= 0) {
          end.v = this.passage.translations[translation].chapters[end.b][end.c - 1];
        } else {
          end.v = 999;
        }
      }
      if (this.options.include_apocrypha && this.options.ps151_strategy === "b" && ((start.c === 151 && start.b === "Ps") || (end.c === 151 && end.b === "Ps"))) {
        this.fix_ps151(start, end, translation);
      }
      if (this.options.osis_compaction_strategy === "b" && start.c === 1 && start.v === 1 && ((end.c === 999 && end.v === 999) || (end.c === this.passage.translations[translation].chapters[end.b].length && this.options.passage_existence_strategy.indexOf("c") >= 0 && (end.v === 999 || (end.v === this.passage.translations[translation].chapters[end.b][end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0))))) {
        osis.start = start.b;
        osis.end = end.b;
      } else if (this.options.osis_compaction_strategy.length <= 2 && start.v === 1 && (end.v === 999 || (end.v === this.passage.translations[translation].chapters[end.b][end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0))) {
        osis.start = start.b + "." + start.c.toString();
        osis.end = end.b + "." + end.c.toString();
      } else {
        osis.start = start.b + "." + start.c.toString() + "." + start.v.toString();
        osis.end = end.b + "." + end.c.toString() + "." + end.v.toString();
      }
      if (osis.start === osis.end) {
        out = osis.start;
      } else {
        out = osis.start + "-" + osis.end;
      }
      if (start.extra != null) {
        out = start.extra + "," + out;
      }
      if (end.extra != null) {
        out += "," + end.extra;
      }
      return out;
    };

    bcv_parser.prototype.fix_ps151 = function(start, end, translation) {
      var ref;
      if (translation !== "default" && (((ref = this.translations[translation]) != null ? ref.chapters["Ps151"] : void 0) == null)) {
        this.passage.promote_book_to_translation("Ps151", translation);
      }
      if (start.c === 151 && start.b === "Ps") {
        if (end.c === 151 && end.b === "Ps") {
          start.b = "Ps151";
          start.c = 1;
          end.b = "Ps151";
          return end.c = 1;
        } else {
          start.extra = this.to_osis({
            b: "Ps151",
            c: 1,
            v: start.v
          }, {
            b: "Ps151",
            c: 1,
            v: this.passage.translations[translation].chapters["Ps151"][0]
          }, translation);
          start.b = "Prov";
          start.c = 1;
          return start.v = 1;
        }
      } else {
        end.extra = this.to_osis({
          b: "Ps151",
          c: 1,
          v: 1
        }, {
          b: "Ps151",
          c: 1,
          v: end.v
        }, translation);
        end.c = 150;
        return end.v = this.passage.translations[translation].chapters["Ps"][149];
      }
    };

    bcv_parser.prototype.combine_consecutive_passages = function(osises, translation) {
      var enclosed_sequence_start, has_enclosed, i, is_enclosed_last, k, last_i, osis, out, prev, prev_i, ref;
      out = [];
      prev = {};
      last_i = osises.length - 1;
      enclosed_sequence_start = -1;
      has_enclosed = false;
      for (i = k = 0, ref = last_i; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        osis = osises[i];
        if (osis.osis.length > 0) {
          prev_i = out.length - 1;
          is_enclosed_last = false;
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
          prev = {
            b: osis.end.b,
            c: osis.end.c,
            v: osis.end.v
          };
        } else {
          out.push(osis);
          prev = {};
        }
      }
      if (has_enclosed) {
        this.snap_enclosed_indices(out);
      }
      return out;
    };

    bcv_parser.prototype.snap_enclosed_indices = function(osises) {
      var k, len, osis;
      for (k = 0, len = osises.length; k < len; k++) {
        osis = osises[k];
        if (osis.is_enclosed_last != null) {
          if (osis.enclosed_indices[0] < 0 && osis.is_enclosed_last) {
            osis.indices[1] = osis.enclosed_indices[1];
          }
          delete osis.is_enclosed_last;
        }
      }
      return osises;
    };

    bcv_parser.prototype.is_verse_consecutive = function(prev, check, translation) {
      var translation_order;
      if (prev.b == null) {
        return false;
      }
      translation_order = this.passage.translations[translation].order != null ? this.passage.translations[translation].order : this.passage.translations["default"].order;
      if (prev.b === check.b) {
        if (prev.c === check.c) {
          if (prev.v === check.v - 1) {
            return true;
          }
        } else if (check.v === 1 && prev.c === check.c - 1) {
          if (prev.v === this.passage.translations[translation].chapters[prev.b][prev.c - 1]) {
            return true;
          }
        }
      } else if (check.c === 1 && check.v === 1 && translation_order[prev.b] === translation_order[check.b] - 1) {
        if (prev.c === this.passage.translations[translation].chapters[prev.b].length && prev.v === this.passage.translations[translation].chapters[prev.b][prev.c - 1]) {
          return true;
        }
      }
      return false;
    };

    bcv_parser.prototype.snap_range = function(entity, passage_i) {
      var entity_i, key, pluck, ref, source_entity, target_entity, temp, type;
      if (entity.type === "b_range_start" || (entity.type === "sequence" && entity.passages[passage_i].type === "b_range_start")) {
        entity_i = 1;
        source_entity = "end";
        type = "b_range_start";
      } else {
        entity_i = 0;
        source_entity = "start";
        type = "range_end_b";
      }
      target_entity = source_entity === "end" ? "start" : "end";
      ref = entity.passages[passage_i][target_entity];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        entity.passages[passage_i][target_entity][key] = entity.passages[passage_i][source_entity][key];
      }
      if (entity.type === "sequence") {
        if (passage_i >= entity.value.length) {
          passage_i = entity.value.length - 1;
        }
        pluck = this.passage.pluck(type, entity.value[passage_i]);
        if (pluck != null) {
          temp = this.snap_range(pluck, 0);
          if (passage_i === 0) {
            entity.absolute_indices[0] = temp.absolute_indices[0];
          } else {
            entity.absolute_indices[1] = temp.absolute_indices[1];
          }
        }
      } else {
        entity.original_type = entity.type;
        entity.type = entity.value[entity_i].type;
        entity.absolute_indices = [entity.value[entity_i].absolute_indices[0], entity.value[entity_i].absolute_indices[1]];
      }
      return entity;
    };

    bcv_parser.prototype.snap_sequence = function(type, entity, osises, i, length) {
      var passage;
      passage = entity.passages[i];
      if (passage.absolute_indices[0] === entity.absolute_indices[0] && i < length - 1 && this.get_snap_sequence_i(entity.passages, i, length) !== i) {
        entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0];
        this.remove_absolute_indices(entity.passages, i + 1);
      } else if (passage.absolute_indices[1] === entity.absolute_indices[1] && i > 0) {
        entity.absolute_indices[1] = osises.length > 0 ? osises[osises.length - 1].indices[1] : entity.passages[i - 1].absolute_indices[1];
      } else if (type === "book" && i < length - 1 && !this.starts_with_book(entity.passages[i + 1])) {
        entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0];
      }
      return entity;
    };

    bcv_parser.prototype.get_snap_sequence_i = function(passages, i, length) {
      var j, k, ref, ref1;
      for (j = k = ref = i + 1, ref1 = length; ref <= ref1 ? k < ref1 : k > ref1; j = ref <= ref1 ? ++k : --k) {
        if (this.starts_with_book(passages[j])) {
          return j;
        }
        if (passages[j].valid.valid) {
          return i;
        }
      }
      return i;
    };

    bcv_parser.prototype.starts_with_book = function(passage) {
      if (passage.type.substr(0, 1) === "b") {
        return true;
      }
      if ((passage.type === "range" || passage.type === "ff") && passage.start.type.substr(0, 1) === "b") {
        return true;
      }
      return false;
    };

    bcv_parser.prototype.remove_absolute_indices = function(passages, i) {
      var end, k, len, passage, ref, ref1, start;
      if (passages[i].enclosed_absolute_indices[0] < 0) {
        return false;
      }
      ref = passages[i].enclosed_absolute_indices, start = ref[0], end = ref[1];
      ref1 = passages.slice(i);
      for (k = 0, len = ref1.length; k < len; k++) {
        passage = ref1[k];
        if (passage.enclosed_absolute_indices[0] === start && passage.enclosed_absolute_indices[1] === end) {
          passage.enclosed_absolute_indices = [-1, -1];
        } else {
          break;
        }
      }
      return true;
    };

    return bcv_parser;

  })();

  root.bcv_parser = bcv_parser;

  bcv_passage = (function() {
    function bcv_passage() {}

    bcv_passage.prototype.books = [];

    bcv_passage.prototype.indices = {};

    bcv_passage.prototype.options = {};

    bcv_passage.prototype.translations = {};

    bcv_passage.prototype.handle_array = function(passages, accum, context) {
      var k, len, passage, ref;
      if (accum == null) {
        accum = [];
      }
      if (context == null) {
        context = {};
      }
      for (k = 0, len = passages.length; k < len; k++) {
        passage = passages[k];
        if (passage == null) {
          continue;
        }
        if (passage.type === "stop") {
          break;
        }
        ref = this.handle_obj(passage, accum, context), accum = ref[0], context = ref[1];
      }
      return [accum, context];
    };

    bcv_passage.prototype.handle_obj = function(passage, accum, context) {
      if ((passage.type != null) && (this[passage.type] != null)) {
        return this[passage.type](passage, accum, context);
      } else {
        return [accum, context];
      }
    };

    bcv_passage.prototype.b = function(passage, accum, context) {
      var alternates, b, k, len, obj, ref, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      alternates = [];
      ref = this.books[passage.value].parsed;
      for (k = 0, len = ref.length; k < len; k++) {
        b = ref[k];
        valid = this.validate_ref(passage.start_context.translations, {
          b: b
        });
        obj = {
          start: {
            b: b
          },
          end: {
            b: b
          },
          valid: valid
        };
        if (passage.passages.length === 0 && valid.valid) {
          passage.passages.push(obj);
        } else {
          alternates.push(obj);
        }
      }
      if (passage.passages.length === 0) {
        passage.passages.push(alternates.shift());
      }
      if (alternates.length > 0) {
        passage.passages[0].alternates = alternates;
      }
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      context = {
        b: passage.passages[0].start.b
      };
      if (passage.start_context.translations != null) {
        context.translations = passage.start_context.translations;
      }
      return [accum, context];
    };

    bcv_passage.prototype.b_range = function(passage, accum, context) {
      return this.range(passage, accum, context);
    };

    bcv_passage.prototype.b_range_pre = function(passage, accum, context) {
      var book, end, ref, ref1, start_obj;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      book = this.pluck("b", passage.value);
      ref = this.b(book, [], context), (ref1 = ref[0], end = ref1[0]), context = ref[1];
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      start_obj = {
        b: passage.value[0].value + end.passages[0].start.b.substr(1),
        type: "b"
      };
      passage.passages = [
        {
          start: start_obj,
          end: end.passages[0].end,
          valid: end.passages[0].valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.b_range_start = function(passage, accum, context) {
      return this.range(passage, accum, context);
    };

    bcv_passage.prototype.base = function(passage, accum, context) {
      this.indices = this.calculate_indices(passage.match, passage.start_index);
      return this.handle_array(passage.value, accum, context);
    };

    bcv_passage.prototype.bc = function(passage, accum, context) {
      var alternates, b, c, context_key, k, len, obj, ref, ref1, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      this.reset_context(context, ["b", "c", "v"]);
      c = this.pluck("c", passage.value).value;
      alternates = [];
      ref = this.books[this.pluck("b", passage.value).value].parsed;
      for (k = 0, len = ref.length; k < len; k++) {
        b = ref[k];
        context_key = "c";
        valid = this.validate_ref(passage.start_context.translations, {
          b: b,
          c: c
        });
        obj = {
          start: {
            b: b
          },
          end: {
            b: b
          },
          valid: valid
        };
        if (valid.messages.start_chapter_not_exist_in_single_chapter_book || valid.messages.start_chapter_1) {
          obj.valid = this.validate_ref(passage.start_context.translations, {
            b: b,
            v: c
          });
          if (valid.messages.start_chapter_not_exist_in_single_chapter_book) {
            obj.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1;
          }
          obj.start.c = 1;
          obj.end.c = 1;
          context_key = "v";
        }
        obj.start[context_key] = c;
        ref1 = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v), obj.start.c = ref1[0], obj.start.v = ref1[1];
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
      if (passage.passages.length === 0) {
        passage.passages.push(alternates.shift());
      }
      if (alternates.length > 0) {
        passage.passages[0].alternates = alternates;
      }
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.bc_title = function(passage, accum, context) {
      var bc, i, k, ref, ref1, ref2, title;
      passage.start_context = bcv_utils.shallow_clone(context);
      ref = this.bc(this.pluck("bc", passage.value), [], context), (ref1 = ref[0], bc = ref1[0]), context = ref[1];
      if (bc.passages[0].start.b.substr(0, 2) !== "Ps" && (bc.passages[0].alternates != null)) {
        for (i = k = 0, ref2 = bc.passages[0].alternates.length; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
          if (bc.passages[0].alternates[i].start.b.substr(0, 2) !== "Ps") {
            continue;
          }
          bc.passages[0] = bc.passages[0].alternates[i];
          break;
        }
      }
      if (bc.passages[0].start.b.substr(0, 2) !== "Ps") {
        accum.push(bc);
        return [accum, context];
      }
      this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
      title = this.pluck("title", passage.value);
      if (title == null) {
        title = this.pluck("v", passage.value);
      }
      passage.value[1] = {
        type: "v",
        value: [
          {
            type: "integer",
            value: 1,
            indices: title.indices
          }
        ],
        indices: title.indices
      };
      passage.type = "bcv";
      return this.bcv(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.bcv = function(passage, accum, context) {
      var alternates, b, bc, c, k, len, obj, ref, ref1, v, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      this.reset_context(context, ["b", "c", "v"]);
      bc = this.pluck("bc", passage.value);
      c = this.pluck("c", bc.value).value;
      v = this.pluck("v", passage.value).value;
      alternates = [];
      ref = this.books[this.pluck("b", bc.value).value].parsed;
      for (k = 0, len = ref.length; k < len; k++) {
        b = ref[k];
        valid = this.validate_ref(passage.start_context.translations, {
          b: b,
          c: c,
          v: v
        });
        ref1 = this.fix_start_zeroes(valid, c, v), c = ref1[0], v = ref1[1];
        obj = {
          start: {
            b: b,
            c: c,
            v: v
          },
          end: {
            b: b,
            c: c,
            v: v
          },
          valid: valid
        };
        if (passage.passages.length === 0 && valid.valid) {
          passage.passages.push(obj);
        } else {
          alternates.push(obj);
        }
      }
      if (passage.passages.length === 0) {
        passage.passages.push(alternates.shift());
      }
      if (alternates.length > 0) {
        passage.passages[0].alternates = alternates;
      }
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.bv = function(passage, accum, context) {
      var b, bcv, ref, ref1, ref2, v;
      passage.start_context = bcv_utils.shallow_clone(context);
      ref = passage.value, b = ref[0], v = ref[1];
      bcv = {
        indices: passage.indices,
        value: [
          {
            type: "bc",
            value: [
              b, {
                type: "c",
                value: [
                  {
                    type: "integer",
                    value: 1
                  }
                ]
              }
            ]
          }, v
        ]
      };
      ref1 = this.bcv(bcv, [], context), (ref2 = ref1[0], bcv = ref2[0]), context = ref1[1];
      passage.passages = bcv.passages;
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.c = function(passage, accum, context) {
      var c, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      c = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c
      });
      if (!valid.valid && valid.messages.start_chapter_not_exist_in_single_chapter_book) {
        return this.v(passage, accum, context);
      }
      c = this.fix_start_zeroes(valid, c)[0];
      passage.passages = [
        {
          start: {
            b: context.b,
            c: c
          },
          end: {
            b: context.b,
            c: c
          },
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      context.c = c;
      this.reset_context(context, ["v"]);
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };

    bcv_passage.prototype.c_psalm = function(passage, accum, context) {
      var c;
      passage.type = "bc";
      c = parseInt(this.books[passage.value].value.match(/^\d+/)[0], 10);
      passage.value = [
        {
          type: "b",
          value: passage.value,
          indices: passage.indices
        }, {
          type: "c",
          value: [
            {
              type: "integer",
              value: c,
              indices: passage.indices
            }
          ],
          indices: passage.indices
        }
      ];
      return this.bc(passage, accum, context);
    };

    bcv_passage.prototype.c_title = function(passage, accum, context) {
      var title;
      passage.start_context = bcv_utils.shallow_clone(context);
      if (context.b !== "Ps") {
        return this.c(passage.value[0], accum, context);
      }
      title = this.pluck("title", passage.value);
      passage.value[1] = {
        type: "v",
        value: [
          {
            type: "integer",
            value: 1,
            indices: title.indices
          }
        ],
        indices: title.indices
      };
      passage.type = "cv";
      return this.cv(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.cv = function(passage, accum, context) {
      var c, ref, v, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      c = this.pluck("c", passage.value).value;
      v = this.pluck("v", passage.value).value;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c,
        v: v
      });
      ref = this.fix_start_zeroes(valid, c, v), c = ref[0], v = ref[1];
      passage.passages = [
        {
          start: {
            b: context.b,
            c: c,
            v: v
          },
          end: {
            b: context.b,
            c: c,
            v: v
          },
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      context.c = c;
      context.v = v;
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };

    bcv_passage.prototype.cb_range = function(passage, accum, context) {
      var b, end_c, ref, start_c;
      passage.type = "range";
      ref = passage.value, b = ref[0], start_c = ref[1], end_c = ref[2];
      passage.value = [
        {
          type: "bc",
          value: [b, start_c],
          indices: passage.indices
        }, end_c
      ];
      end_c.indices[1] = passage.indices[1];
      return this.range(passage, accum, context);
    };

    bcv_passage.prototype.context = function(passage, accum, context) {
      var key, ref;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      ref = this.books[passage.value].context;
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        context[key] = this.books[passage.value].context[key];
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.cv_psalm = function(passage, accum, context) {
      var bc, c_psalm, ref, v;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.type = "bcv";
      ref = passage.value, c_psalm = ref[0], v = ref[1];
      bc = this.c_psalm(c_psalm, [], passage.start_context)[0][0];
      passage.value = [bc, v];
      return this.bcv(passage, accum, context);
    };

    bcv_passage.prototype.ff = function(passage, accum, context) {
      var ref, ref1;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.value.push({
        type: "integer",
        indices: passage.indices,
        value: 999
      });
      ref = this.range(passage, [], passage.start_context), (ref1 = ref[0], passage = ref1[0]), context = ref[1];
      passage.value[0].indices = passage.value[1].indices;
      passage.value[0].absolute_indices = passage.value[1].absolute_indices;
      passage.value.pop();
      if (passage.passages[0].valid.messages.end_verse_not_exist != null) {
        delete passage.passages[0].valid.messages.end_verse_not_exist;
      }
      if (passage.passages[0].valid.messages.end_chapter_not_exist != null) {
        delete passage.passages[0].valid.messages.end_chapter_not_exist;
      }
      if (passage.passages[0].end.original_c != null) {
        delete passage.passages[0].end.original_c;
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.integer_title = function(passage, accum, context) {
      passage.start_context = bcv_utils.shallow_clone(context);
      if (context.b !== "Ps") {
        return this.integer(passage.value[0], accum, context);
      }
      passage.value[0] = {
        type: "c",
        value: [passage.value[0]],
        indices: [passage.value[0].indices[0], passage.value[0].indices[1]]
      };
      passage.value[1].type = "v";
      passage.value[1].original_type = "title";
      passage.value[1].value = [
        {
          type: "integer",
          value: 1,
          indices: passage.value[1].value.indices
        }
      ];
      passage.type = "cv";
      return this.cv(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.integer = function(passage, accum, context) {
      if (context.v != null) {
        return this.v(passage, accum, context);
      }
      return this.c(passage, accum, context);
    };

    bcv_passage.prototype.next_v = function(passage, accum, context) {
      var prev_integer, psg, ref, ref1, ref2, ref3;
      passage.start_context = bcv_utils.shallow_clone(context);
      prev_integer = this.pluck_last_recursively("integer", passage.value);
      if (prev_integer == null) {
        prev_integer = {
          value: 1
        };
      }
      passage.value.push({
        type: "integer",
        indices: passage.indices,
        value: prev_integer.value + 1
      });
      ref = this.range(passage, [], passage.start_context), (ref1 = ref[0], psg = ref1[0]), context = ref[1];
      if ((psg.passages[0].valid.messages.end_verse_not_exist != null) && (psg.passages[0].valid.messages.start_verse_not_exist == null) && (psg.passages[0].valid.messages.start_chapter_not_exist == null) && (context.c != null)) {
        passage.value.pop();
        passage.value.push({
          type: "cv",
          indices: passage.indices,
          value: [
            {
              type: "c",
              value: [
                {
                  type: "integer",
                  value: context.c + 1,
                  indices: passage.indices
                }
              ],
              indices: passage.indices
            }, {
              type: "v",
              value: [
                {
                  type: "integer",
                  value: 1,
                  indices: passage.indices
                }
              ],
              indices: passage.indices
            }
          ]
        });
        ref2 = this.range(passage, [], passage.start_context), (ref3 = ref2[0], psg = ref3[0]), context = ref2[1];
      }
      psg.value[0].indices = psg.value[1].indices;
      psg.value[0].absolute_indices = psg.value[1].absolute_indices;
      psg.value.pop();
      if (psg.passages[0].valid.messages.end_verse_not_exist != null) {
        delete psg.passages[0].valid.messages.end_verse_not_exist;
      }
      if (psg.passages[0].valid.messages.end_chapter_not_exist != null) {
        delete psg.passages[0].valid.messages.end_chapter_not_exist;
      }
      if (psg.passages[0].end.original_c != null) {
        delete psg.passages[0].end.original_c;
      }
      accum.push(psg);
      return [accum, context];
    };

    bcv_passage.prototype.sequence = function(passage, accum, context) {
      var k, l, len, len1, obj, psg, ref, ref1, ref2, ref3, sub_psg;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      ref = passage.value;
      for (k = 0, len = ref.length; k < len; k++) {
        obj = ref[k];
        ref1 = this.handle_array(obj, [], context), (ref2 = ref1[0], psg = ref2[0]), context = ref1[1];
        ref3 = psg.passages;
        for (l = 0, len1 = ref3.length; l < len1; l++) {
          sub_psg = ref3[l];
          if (sub_psg.type == null) {
            sub_psg.type = psg.type;
          }
          if (sub_psg.absolute_indices == null) {
            sub_psg.absolute_indices = psg.absolute_indices;
          }
          if (psg.start_context.translations != null) {
            sub_psg.translations = psg.start_context.translations;
          }
          sub_psg.enclosed_absolute_indices = psg.type === "sequence_post_enclosed" ? psg.absolute_indices : [-1, -1];
          passage.passages.push(sub_psg);
        }
      }
      if (passage.absolute_indices == null) {
        if (passage.passages.length > 0 && passage.type === "sequence") {
          passage.absolute_indices = [passage.passages[0].absolute_indices[0], passage.passages[passage.passages.length - 1].absolute_indices[1]];
        } else {
          passage.absolute_indices = this.get_absolute_indices(passage.indices);
        }
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.sequence_post_enclosed = function(passage, accum, context) {
      return this.sequence(passage, accum, context);
    };

    bcv_passage.prototype.v = function(passage, accum, context) {
      var c, no_c, ref, v, valid;
      v = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
      passage.start_context = bcv_utils.shallow_clone(context);
      c = context.c != null ? context.c : 1;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c,
        v: v
      });
      ref = this.fix_start_zeroes(valid, 0, v), no_c = ref[0], v = ref[1];
      passage.passages = [
        {
          start: {
            b: context.b,
            c: c,
            v: v
          },
          end: {
            b: context.b,
            c: c,
            v: v
          },
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      context.v = v;
      return [accum, context];
    };

    bcv_passage.prototype.range = function(passage, accum, context) {
      var end, end_obj, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, return_now, return_value, start, start_obj, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      ref = passage.value, start = ref[0], end = ref[1];
      ref1 = this.handle_obj(start, [], context), (ref2 = ref1[0], start = ref2[0]), context = ref1[1];
      if (end.type === "v" && ((start.type === "bc" && !((ref3 = start.passages) != null ? (ref4 = ref3[0]) != null ? (ref5 = ref4.valid) != null ? (ref6 = ref5.messages) != null ? ref6.start_chapter_not_exist_in_single_chapter_book : void 0 : void 0 : void 0 : void 0)) || start.type === "c") && this.options.end_range_digits_strategy === "verse") {
        passage.value[0] = start;
        return this.range_change_integer_end(passage, accum);
      }
      ref7 = this.handle_obj(end, [], context), (ref8 = ref7[0], end = ref8[0]), context = ref7[1];
      passage.value = [start, end];
      passage.indices = [start.indices[0], end.indices[1]];
      delete passage.absolute_indices;
      start_obj = {
        b: start.passages[0].start.b,
        c: start.passages[0].start.c,
        v: start.passages[0].start.v,
        type: start.type
      };
      end_obj = {
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
      valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
      if (valid.valid) {
        ref9 = this.range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum), return_now = ref9[0], return_value = ref9[1];
        if (return_now) {
          return return_value;
        }
      } else {
        return this.range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum);
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      passage.passages = [
        {
          start: start_obj,
          end: end_obj,
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (start_obj.type === "b") {
        if (end_obj.type === "b") {
          passage.type = "b_range";
        } else {
          passage.type = "b_range_start";
        }
      } else if (end_obj.type === "b") {
        passage.type = "range_end_b";
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.range_change_end = function(passage, accum, new_end) {
      var end, new_obj, ref, start;
      ref = passage.value, start = ref[0], end = ref[1];
      if (end.type === "integer") {
        end.original_value = end.value;
        end.value = new_end;
      } else if (end.type === "v") {
        new_obj = this.pluck("integer", end.value);
        new_obj.original_value = new_obj.value;
        new_obj.value = new_end;
      } else if (end.type === "cv") {
        new_obj = this.pluck("c", end.value);
        new_obj.original_value = new_obj.value;
        new_obj.value = new_end;
      }
      return this.handle_obj(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.range_change_integer_end = function(passage, accum) {
      var end, ref, start;
      ref = passage.value, start = ref[0], end = ref[1];
      if (passage.original_type == null) {
        passage.original_type = passage.type;
      }
      if (passage.original_value == null) {
        passage.original_value = [start, end];
      }
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
    };

    bcv_passage.prototype.range_check_new_end = function(translations, start_obj, end_obj, valid) {
      var new_end, new_valid, obj_to_validate, type;
      new_end = 0;
      type = null;
      if (valid.messages.end_chapter_before_start) {
        type = "c";
      } else if (valid.messages.end_verse_before_start) {
        type = "v";
      }
      if (type != null) {
        new_end = this.range_get_new_end_value(start_obj, end_obj, valid, type);
      }
      if (new_end > 0) {
        obj_to_validate = {
          b: end_obj.b,
          c: end_obj.c,
          v: end_obj.v
        };
        obj_to_validate[type] = new_end;
        new_valid = this.validate_ref(translations, obj_to_validate);
        if (!new_valid.valid) {
          new_end = 0;
        }
      }
      return new_end;
    };

    bcv_passage.prototype.range_end_b = function(passage, accum, context) {
      return this.range(passage, accum, context);
    };

    bcv_passage.prototype.range_get_new_end_value = function(start_obj, end_obj, valid, key) {
      var new_end;
      new_end = 0;
      if ((key === "c" && valid.messages.end_chapter_is_zero) || (key === "v" && valid.messages.end_verse_is_zero)) {
        return new_end;
      }
      if (start_obj[key] >= 10 && end_obj[key] < 10 && start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]) {
        new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10);
      } else if (start_obj[key] >= 100 && end_obj[key] < 100 && start_obj[key] - 100 < end_obj[key]) {
        new_end = end_obj[key] + 100;
      }
      return new_end;
    };

    bcv_passage.prototype.range_handle_invalid = function(valid, passage, start, start_obj, end, end_obj, accum) {
      var new_end, ref, temp_valid, temp_value;
      if (valid.valid === false && (valid.messages.end_chapter_before_start || valid.messages.end_verse_before_start) && (end.type === "integer" || end.type === "v") || (valid.valid === false && valid.messages.end_chapter_before_start && end.type === "cv")) {
        new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
        if (new_end > 0) {
          return this.range_change_end(passage, accum, new_end);
        }
      }
      if (this.options.end_range_digits_strategy === "verse" && (start_obj.v == null) && (end.type === "integer" || end.type === "v")) {
        temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
        temp_valid = this.validate_ref(passage.start_context.translations, {
          b: start_obj.b,
          c: start_obj.c,
          v: temp_value
        });
        if (temp_valid.valid) {
          return this.range_change_integer_end(passage, accum);
        }
      }
      if (passage.original_type == null) {
        passage.original_type = passage.type;
      }
      passage.type = "sequence";
      ref = [[start, end], [[start], [end]]], passage.original_value = ref[0], passage.value = ref[1];
      return this.sequence(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.range_handle_valid = function(valid, passage, start, start_obj, end, end_obj, accum) {
      var temp_valid, temp_value;
      if (valid.messages.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && (start_obj.v == null) && (end.type === "integer" || end.type === "v") && this.options.passage_existence_strategy.indexOf("v") >= 0) {
        temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
        temp_valid = this.validate_ref(passage.start_context.translations, {
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
    };

    bcv_passage.prototype.range_validate = function(valid, start_obj, end_obj, passage) {
      var ref;
      if (valid.messages.end_chapter_not_exist || valid.messages.end_chapter_not_exist_in_single_chapter_book) {
        end_obj.original_c = end_obj.c;
        end_obj.c = valid.messages.end_chapter_not_exist ? valid.messages.end_chapter_not_exist : valid.messages.end_chapter_not_exist_in_single_chapter_book;
        if (end_obj.v != null) {
          end_obj.v = this.validate_ref(passage.start_context.translations, {
            b: end_obj.b,
            c: end_obj.c,
            v: 999
          }).messages.end_verse_not_exist;
          delete valid.messages.end_verse_is_zero;
        }
      } else if (valid.messages.end_verse_not_exist) {
        end_obj.original_v = end_obj.v;
        end_obj.v = valid.messages.end_verse_not_exist;
      }
      if (valid.messages.end_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
        end_obj.v = valid.messages.end_verse_is_zero;
      }
      if (valid.messages.end_chapter_is_zero) {
        end_obj.c = valid.messages.end_chapter_is_zero;
      }
      ref = this.fix_start_zeroes(valid, start_obj.c, start_obj.v), start_obj.c = ref[0], start_obj.v = ref[1];
      return true;
    };

    bcv_passage.prototype.translation_sequence = function(passage, accum, context) {
      var k, l, len, len1, ref, translation, translations, val;
      passage.start_context = bcv_utils.shallow_clone(context);
      translations = [];
      translations.push({
        translation: this.books[passage.value[0].value].parsed
      });
      ref = passage.value[1];
      for (k = 0, len = ref.length; k < len; k++) {
        val = ref[k];
        val = this.books[this.pluck("translation", val).value].parsed;
        if (val != null) {
          translations.push({
            translation: val
          });
        }
      }
      for (l = 0, len1 = translations.length; l < len1; l++) {
        translation = translations[l];
        if (this.translations.aliases[translation.translation] != null) {
          translation.alias = this.translations.aliases[translation.translation].alias;
          translation.osis = this.translations.aliases[translation.translation].osis || translation.translation.toUpperCase();
        } else {
          translation.alias = "default";
          translation.osis = translation.translation.toUpperCase();
        }
      }
      if (accum.length > 0) {
        context = this.translation_sequence_apply(accum, translations);
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      this.reset_context(context, ["translations"]);
      return [accum, context];
    };

    bcv_passage.prototype.translation_sequence_apply = function(accum, translations) {
      var context, i, k, new_accum, ref, ref1, use_i;
      use_i = 0;
      for (i = k = ref = accum.length - 1; ref <= 0 ? k <= 0 : k >= 0; i = ref <= 0 ? ++k : --k) {
        if (accum[i].original_type != null) {
          accum[i].type = accum[i].original_type;
        }
        if (accum[i].original_value != null) {
          accum[i].value = accum[i].original_value;
        }
        if (accum[i].type !== "translation_sequence") {
          continue;
        }
        use_i = i + 1;
        break;
      }
      if (use_i < accum.length) {
        accum[use_i].start_context.translations = translations;
        ref1 = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context), new_accum = ref1[0], context = ref1[1];
      } else {
        context = bcv_utils.shallow_clone(accum[accum.length - 1].start_context);
      }
      return context;
    };

    bcv_passage.prototype.pluck = function(type, passages) {
      var k, len, passage;
      for (k = 0, len = passages.length; k < len; k++) {
        passage = passages[k];
        if (!((passage != null) && (passage.type != null) && passage.type === type)) {
          continue;
        }
        if (type === "c" || type === "v") {
          return this.pluck("integer", passage.value);
        }
        return passage;
      }
      return null;
    };

    bcv_passage.prototype.pluck_last_recursively = function(type, passages) {
      var k, passage, value;
      for (k = passages.length - 1; k >= 0; k += -1) {
        passage = passages[k];
        if (!((passage != null) && (passage.type != null))) {
          continue;
        }
        if (passage.type === type) {
          return this.pluck(type, [passage]);
        }
        value = this.pluck_last_recursively(type, passage.value);
        if (value != null) {
          return value;
        }
      }
      return null;
    };

    bcv_passage.prototype.set_context_from_object = function(context, keys, obj) {
      var k, len, results, type;
      results = [];
      for (k = 0, len = keys.length; k < len; k++) {
        type = keys[k];
        if (obj[type] == null) {
          continue;
        }
        results.push(context[type] = obj[type]);
      }
      return results;
    };

    bcv_passage.prototype.reset_context = function(context, keys) {
      var k, len, results, type;
      results = [];
      for (k = 0, len = keys.length; k < len; k++) {
        type = keys[k];
        results.push(delete context[type]);
      }
      return results;
    };

    bcv_passage.prototype.fix_start_zeroes = function(valid, c, v) {
      if (valid.messages.start_chapter_is_zero && this.options.zero_chapter_strategy === "upgrade") {
        c = valid.messages.start_chapter_is_zero;
      }
      if (valid.messages.start_verse_is_zero && this.options.zero_verse_strategy === "upgrade") {
        v = valid.messages.start_verse_is_zero;
      }
      return [c, v];
    };

    bcv_passage.prototype.calculate_indices = function(match, adjust) {
      var character, end_index, indices, k, l, len, len1, len2, m, match_index, part, part_length, parts, ref, switch_type, temp;
      switch_type = "book";
      indices = [];
      match_index = 0;
      adjust = parseInt(adjust, 10);
      parts = [match];
      ref = ["\x1e", "\x1f"];
      for (k = 0, len = ref.length; k < len; k++) {
        character = ref[k];
        temp = [];
        for (l = 0, len1 = parts.length; l < len1; l++) {
          part = parts[l];
          temp = temp.concat(part.split(character));
        }
        parts = temp;
      }
      for (m = 0, len2 = parts.length; m < len2; m++) {
        part = parts[m];
        switch_type = switch_type === "book" ? "rest" : "book";
        part_length = part.length;
        if (part_length === 0) {
          continue;
        }
        if (switch_type === "book") {
          part = part.replace(/\/\d+$/, "");
          end_index = match_index + part_length;
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
          adjust = this.books[part].start_index + this.books[part].value.length - match_index;
          indices.push({
            start: end_index + 1,
            end: end_index + 1,
            index: adjust
          });
        } else {
          end_index = match_index + part_length - 1;
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
    };

    bcv_passage.prototype.get_absolute_indices = function(arg1) {
      var end, end_out, index, k, len, ref, start, start_out;
      start = arg1[0], end = arg1[1];
      start_out = null;
      end_out = null;
      ref = this.indices;
      for (k = 0, len = ref.length; k < len; k++) {
        index = ref[k];
        if (start_out === null && (index.start <= start && start <= index.end)) {
          start_out = start + index.index;
        }
        if ((index.start <= end && end <= index.end)) {
          end_out = end + index.index + 1;
          break;
        }
      }
      return [start_out, end_out];
    };

    bcv_passage.prototype.validate_ref = function(translations, start, end) {
      var k, len, messages, temp_valid, translation, valid;
      if (!((translations != null) && translations.length > 0)) {
        translations = [
          {
            translation: "default",
            osis: "",
            alias: "default"
          }
        ];
      }
      valid = false;
      messages = {};
      for (k = 0, len = translations.length; k < len; k++) {
        translation = translations[k];
        if (translation.alias == null) {
          translation.alias = "default";
        }
        if (translation.alias == null) {
          if (messages.translation_invalid == null) {
            messages.translation_invalid = [];
          }
          messages.translation_invalid.push(translation);
          continue;
        }
        if (this.translations.aliases[translation.alias] == null) {
          translation.alias = "default";
          if (messages.translation_unknown == null) {
            messages.translation_unknown = [];
          }
          messages.translation_unknown.push(translation);
        }
        temp_valid = this.validate_start_ref(translation.alias, start, messages)[0];
        if (end) {
          temp_valid = this.validate_end_ref(translation.alias, start, end, temp_valid, messages)[0];
        }
        if (temp_valid === true) {
          valid = true;
        }
      }
      return {
        valid: valid,
        messages: messages
      };
    };

    bcv_passage.prototype.validate_start_ref = function(translation, start, messages) {
      var ref, ref1, translation_order, valid;
      valid = true;
      if (translation !== "default" && (((ref = this.translations[translation]) != null ? ref.chapters[start.b] : void 0) == null)) {
        this.promote_book_to_translation(start.b, translation);
      }
      translation_order = ((ref1 = this.translations[translation]) != null ? ref1.order : void 0) != null ? translation : "default";
      if (start.v != null) {
        start.v = parseInt(start.v, 10);
      }
      if (this.translations[translation_order].order[start.b] != null) {
        if (start.c == null) {
          start.c = 1;
        }
        start.c = parseInt(start.c, 10);
        if (isNaN(start.c)) {
          valid = false;
          messages.start_chapter_not_numeric = true;
          return [valid, messages];
        }
        if (start.c === 0) {
          messages.start_chapter_is_zero = 1;
          if (this.options.zero_chapter_strategy === "error") {
            valid = false;
          } else {
            start.c = 1;
          }
        }
        if ((start.v != null) && start.v === 0) {
          messages.start_verse_is_zero = 1;
          if (this.options.zero_verse_strategy === "error") {
            valid = false;
          } else if (this.options.zero_verse_strategy === "upgrade") {
            start.v = 1;
          }
        }
        if (start.c > 0 && (this.translations[translation].chapters[start.b][start.c - 1] != null)) {
          if (start.v != null) {
            if (isNaN(start.v)) {
              valid = false;
              messages.start_verse_not_numeric = true;
            } else if (start.v > this.translations[translation].chapters[start.b][start.c - 1]) {
              if (this.options.passage_existence_strategy.indexOf("v") >= 0) {
                valid = false;
                messages.start_verse_not_exist = this.translations[translation].chapters[start.b][start.c - 1];
              }
            }
          } else if (start.c === 1 && this.options.single_chapter_1_strategy === "verse" && this.translations[translation].chapters[start.b].length === 1) {
            messages.start_chapter_1 = 1;
          }
        } else {
          if (start.c !== 1 && this.translations[translation].chapters[start.b].length === 1) {
            valid = false;
            messages.start_chapter_not_exist_in_single_chapter_book = 1;
          } else if (start.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
            valid = false;
            messages.start_chapter_not_exist = this.translations[translation].chapters[start.b].length;
          }
        }
      } else if (start.b == null) {
        valid = false;
        messages.start_book_not_defined = true;
      } else {
        if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
          valid = false;
        }
        messages.start_book_not_exist = true;
      }
      return [valid, messages];
    };

    bcv_passage.prototype.validate_end_ref = function(translation, start, end, valid, messages) {
      var ref, translation_order;
      translation_order = ((ref = this.translations[translation]) != null ? ref.order : void 0) != null ? translation : "default";
      if (end.c != null) {
        end.c = parseInt(end.c, 10);
        if (isNaN(end.c)) {
          valid = false;
          messages.end_chapter_not_numeric = true;
        } else if (end.c === 0) {
          messages.end_chapter_is_zero = 1;
          if (this.options.zero_chapter_strategy === "error") {
            valid = false;
          } else {
            end.c = 1;
          }
        }
      }
      if (end.v != null) {
        end.v = parseInt(end.v, 10);
        if (isNaN(end.v)) {
          valid = false;
          messages.end_verse_not_numeric = true;
        } else if (end.v === 0) {
          messages.end_verse_is_zero = 1;
          if (this.options.zero_verse_strategy === "error") {
            valid = false;
          } else if (this.options.zero_verse_strategy === "upgrade") {
            end.v = 1;
          }
        }
      }
      if (this.translations[translation_order].order[end.b] != null) {
        if ((end.c == null) && this.translations[translation].chapters[end.b].length === 1) {
          end.c = 1;
        }
        if ((this.translations[translation_order].order[start.b] != null) && this.translations[translation_order].order[start.b] > this.translations[translation_order].order[end.b]) {
          if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
            valid = false;
          }
          messages.end_book_before_start = true;
        }
        if (start.b === end.b && (end.c != null) && !isNaN(end.c)) {
          if (start.c == null) {
            start.c = 1;
          }
          if (!isNaN(parseInt(start.c, 10)) && start.c > end.c) {
            valid = false;
            messages.end_chapter_before_start = true;
          } else if (start.c === end.c && (end.v != null) && !isNaN(end.v)) {
            if (start.v == null) {
              start.v = 1;
            }
            if (!isNaN(parseInt(start.v, 10)) && start.v > end.v) {
              valid = false;
              messages.end_verse_before_start = true;
            }
          }
        }
        if ((end.c != null) && !isNaN(end.c)) {
          if (this.translations[translation].chapters[end.b][end.c - 1] == null) {
            if (this.translations[translation].chapters[end.b].length === 1) {
              messages.end_chapter_not_exist_in_single_chapter_book = 1;
            } else if (end.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
              messages.end_chapter_not_exist = this.translations[translation].chapters[end.b].length;
            }
          }
        }
        if ((end.v != null) && !isNaN(end.v)) {
          if (end.c == null) {
            end.c = this.translations[translation].chapters[end.b].length;
          }
          if (end.v > this.translations[translation].chapters[end.b][end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
            messages.end_verse_not_exist = this.translations[translation].chapters[end.b][end.c - 1];
          }
        }
      } else {
        valid = false;
        messages.end_book_not_exist = true;
      }
      return [valid, messages];
    };

    bcv_passage.prototype.promote_book_to_translation = function(book, translation) {
      var base, base1;
      if ((base = this.translations)[translation] == null) {
        base[translation] = {};
      }
      if ((base1 = this.translations[translation]).chapters == null) {
        base1.chapters = {};
      }
      if (this.translations[translation].chapters[book] == null) {
        return this.translations[translation].chapters[book] = bcv_utils.shallow_clone_array(this.translations["default"].chapters[book]);
      }
    };

    return bcv_passage;

  })();

  bcv_utils = {
    shallow_clone: function(obj) {
      var key, out, val;
      if (obj == null) {
        return obj;
      }
      out = {};
      for (key in obj) {
        if (!hasProp.call(obj, key)) continue;
        val = obj[key];
        out[key] = val;
      }
      return out;
    },
    shallow_clone_array: function(arr) {
      var i, k, out, ref;
      if (arr == null) {
        return arr;
      }
      out = [];
      for (i = k = 0, ref = arr.length; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        if (typeof arr[i] !== "undefined") {
          out[i] = arr[i];
        }
      }
      return out;
    }
  };

  bcv_parser.prototype.regexps.translations = /(?:(?:(?:E[RS]|AS|TNI|RS|KJ)V|LXX|MSG|CE[BV]|AMP|HCSB|N(?:(?:KJ|RS)V|LT|IR?V|A(?:B(?:RE)?|SB?))))\b/gi;

  bcv_parser.prototype.translations = {
    aliases: {
      ceb: {
        alias: "ceb"
      },
      kjv: {
        alias: "kjv"
      },
      lxx: {
        alias: "nab"
      },
      nab: {
        alias: "nab"
      },
      nabre: {
        alias: "nab"
      },
      nas: {
        osis: "NASB",
        alias: "default"
      },
      nirv: {
        alias: "kjv"
      },
      niv: {
        alias: "kjv"
      },
      nkjv: {
        alias: "nkjv"
      },
      nlt: {
        alias: "nlt"
      },
      nrsv: {
        alias: "nrsv"
      },
      tniv: {
        alias: "kjv"
      },
      "default": {
        osis: "",
        alias: "default"
      }
    },
    alternates: {},
    "default": {
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
        "1Esd": [55, 26, 24, 63, 71, 33, 15, 92, 55]
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
    }
  };

  bcv_parser.prototype.languages = ["ar", "bg", "ceb", "cs", "cy", "da", "de", "el", "en", "es", "fi", "fr", "he", "hi", "hr", "ht", "hu", "is", "it", "ja", "jv", "ko", "la", "mk", "mr", "ne", "nl", "no", "or", "pa", "pl", "pt", "ro", "ru", "sk", "so", "sq", "sr", "sv", "sw", "ta", "th", "tl", "uk", "ur", "vi", "wal", "zh"];

  bcv_parser.prototype.regexps.space = "[\\s\\xa0]";

  bcv_parser.prototype.regexps.escaped_passage = RegExp("(?:^|[^\\x1f\\x1e\\dA-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:[\\u2013\\u2014\\-]|through|thru|to)\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:\\d+(?:th|nd|st)\\s*ch(?:apter|a?pt\\.?|a?p?\\.?)?\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*))?\\x1f(\\d+)(?:/\\d+)?\\x1f(?:/\\d+\\x1f|[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014]|title(?![a-z])|see" + bcv_parser.prototype.regexps.space + "+also|ff(?![a-z0-9])|f(?![a-z0-9])|chapters|chapter|through|compare|chapts|verses|chpts|chapt|chaps|verse|chap|thru|also|chp|chs|cha|and|see|ver|vss|ch|to|cf|vs|vv|v|[a-e](?!\\w)|$)+)", "gi");

  bcv_parser.prototype.regexps.match_end_split = /\d\W*title|\d\W*(?:ff(?![a-z0-9])|f(?![a-z0-9]))(?:[\s\xa0*]*\.)?|\d[\s\xa0*]*[a-e](?!\w)|\x1e(?:[\s\xa0*]*[)\]\uff09])?|[\d\x1f]/gi;

  bcv_parser.prototype.regexps.control = /[\x1e\x1f]/g;

  bcv_parser.prototype.regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ]";

  bcv_parser.prototype.regexps.first = "(?:1st|1|I|First)\\.?" + bcv_parser.prototype.regexps.space + "*";

  bcv_parser.prototype.regexps.second = "(?:2nd|2|II|Second)\\.?" + bcv_parser.prototype.regexps.space + "*";

  bcv_parser.prototype.regexps.third = "(?:3rd|3|III|Third)\\.?" + bcv_parser.prototype.regexps.space + "*";

  bcv_parser.prototype.regexps.range_and = "(?:[&\u2013\u2014-]|(?:and|compare|cf|see" + bcv_parser.prototype.regexps.space + "+also|also|see)|(?:through|thru|to))";

  bcv_parser.prototype.regexps.range_only = "(?:[\u2013\u2014-]|(?:through|thru|to))";

  bcv_parser.prototype.regexps.get_books = function(include_apocrypha, case_sensitive) {
    var book, books, k, len, out;
    books = [
      {
        osis: ["Ps"],
        apocrypha: true,
        extra: "2",
        regexp: /(\b)(Ps151)(?=\.1)/g
      }, {
        osis: ["Gen"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:[1I][\s\xa0]*Mojzeszowa)|(?:(?:1(?:\.[\s\xa0]*Mo(?:oseksen[\s\xa0]*kirj|jzisov)|[\s\xa0]*Mo(?:oseksen[\s\xa0]*kirj|jzisov))|I[\s\xa0]*Mojzisov|Zanafill|I\.[\s\xa0]*Mojzisov)a|[1I][\s\xa0]*Mojz|[1I]\.[\s\xa0]*Mojzeszowa|Pierwsz[aey][\s\xa0]*Mojzeszowa)|(?:G(?:ene(?:s(?:[ai]|es)|za)|n)|M(?:ozes[\s\xa0]*I|wanzo)|Beresjiet|Atiyakamam|I[\s\xa0]*Moj|(?:liv[\s\xa0]*Konmansman[\s\xa0]*|Z)an|Forsta[\s\xa0]*Moseboken|1(?:[\s\xa0]*M(?:osebo(?:ken|g)|oj|z)|\.[\s\xa0]*Mosebo(?:ken|g))|(?:Fyrsta|I\.?)[\s\xa0]*Mosebok|utpattiko[\s\xa0]*pustak|(?:Bilowgi|Utpaat)i|(?:Jene|Ro?d|I\.[\s\xa0]*Moj|1\.[\s\xa0]*Moj)z|P(?:urwaning[\s\xa0]*Dumadi|ostanak|ierwsz[aey][\s\xa0]*Mojz)|K(?:s(?:ieg[ai]|\.)?[\s\xa0]*Rodzaj|[\s\xa0]*povod|\.[\s\xa0]*povod|niha[\s\xa0]*povod)u|(?:Gen(?:n(?:e(?:is[eiu]|s[eiu]|es[eiu])|i(?:[ei]s[eiu]|s[eiu]))|e(?:is[eiu]|su|zi)|is[eiu]|(?:i[ei]|ee)s[eiu]|n?si)|Henesi|Liber[\s\xa0]*Genesi|1[\s\xa0]*Mo(?:ze|o))s|(?:I\.?[\s\xa0]*Moz|Teremt|1\.[\s\xa0]*Moz)es|1e[\s\xa0]*Mozes|1e\.[\s\xa0]*Mozes|(?:Pierwsz[aey][\s\xa0]*Ks(?:ieg[ai]|\.)?|(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Moyzeszowe|Fyrsta[\s\xa0]*bok[\s\xa0]*Mose|1\.?[\s\xa0]*Buch[\s\xa0]*Mose|Ge(?:n(?:eis|ese|neis)?)?|Jen|Mwa|Ter|utpat(?:ti)?|I\.?[\s\xa0]*Mos|Forsta[\s\xa0]*Mosebok|1(?:[\s\xa0]*Mo(?:s(?:e(?:bok)?)?|z)?|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|Post|(?:Doomettaaba|Facere|1[\s\xa0]*k[\s\xa0]*Mojzisov|1[\s\xa0]*k\.[\s\xa0]*Mojzisov|1[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:I\.?|1\.)[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszow|P(?:rv(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?|ni[\s\xa0]*(?:kniha[\s\xa0]*)?)Mojzisov|ierwsz[aey][\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszow)|K(?:n(?:iha[\s\xa0]*stvoreni|jiga[\s\xa0]*Postank)|\.?[\s\xa0]*stvoreni|itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Mus))a|Buttja|I\.?[\s\xa0]*Mooseksen[\s\xa0]*kirja|E(?:(?:erste|lso)[\s\xa0]*Mozes|rste[\s\xa0]*(?:Buch[\s\xa0]*)?Mose|nsimmainen[\s\xa0]*Mooseksen[\s\xa0]*kirja))|(?:utpattiko|Genesis|Konmansman|[1I][\s\xa0]*Mooseksen|[1I]\.[\s\xa0]*Mooseksen|Ensimmainen[\s\xa0]*Mooseksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Exod"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*Mo(?:j(?:z(?:eszow|isov)a|z)?|oseksen[\s\xa0]*kirja)|\.[\s\xa0]*Mo(?:jz(?:(?:eszow|isov)a)?|oseksen[\s\xa0]*kirja))|(?:(?:Drug[ai]|II\.)[\s\xa0]*Mojzeszow|II\.[\s\xa0]*Mojzisov|II[\s\xa0]*Mojz(?:eszow|isov))a|Nirgaman|II[\s\xa0]*Mojz|Dalja)|(?:E(?:x(?:od[eos]|d)|sodo|ksod[io])|Vyhid|Wy?j|Sjemot|Baxniintii|nirgam|Yattirakamam|Mozes[\s\xa0]*II|Anden[\s\xa0]*Mosebog|(?:liv[\s\xa0]*delivrans[\s\xa0]*l|Pangentas)an|Andra[\s\xa0]*Moseboken|Zweite[\s\xa0]*Mose|Onnur[\s\xa0]*bok[\s\xa0]*Mose|Zweite[\s\xa0]*Buch[\s\xa0]*Mose|2(?:[\s\xa0]*(?:M(?:osebo(?:ken|g)|z)|Buch[\s\xa0]*Mose)|\.[\s\xa0]*(?:Mosebo(?:ken|g)|Buch[\s\xa0]*Mose))|(?:Annen|Onnur)[\s\xa0]*Mosebok|Andre[\s\xa0]*Mosebok|I(?:I(?:[\s\xa0]*Mo(?:sebok|j)|\.[\s\xa0]*Mosebok)|zlazak)|Exodul|II\.[\s\xa0]*Mojz|D(?:rug[ai][\s\xa0]*Mojz|al)|(?:E(?:gzodu|xodi|csodu)|Liber[\s\xa0]*Exodu|2[\s\xa0]*Mo(?:ze|o)|(?:II\.?|2\.)[\s\xa0]*Moze|2e[\s\xa0]*Moze|(?:Masodik|2e\.)[\s\xa0]*Moze|Tweede[\s\xa0]*Moze)s|E(?:x(?:od?)?|ks|gz(?:od)?|cs)|Bax|Anden[\s\xa0]*Mos|Andra[\s\xa0]*Mosebok|2(?:[\s\xa0]*Mo(?:s(?:e(?:bok)?)?|z)?|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|Andre[\s\xa0]*Mos|I(?:I\.?[\s\xa0]*Mos|zl)|(?:I(?:I\.?[\s\xa0]*Mooseksen[\s\xa0]*kirj|esire)|Toinen[\s\xa0]*Mooseksen[\s\xa0]*kirj|2[\s\xa0]*k[\s\xa0]*Mojzisov|2[\s\xa0]*k\.[\s\xa0]*Mojzisov|2[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:II\.?|2\.)[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:II\.?|2\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszow|Dru(?:h(?:y[\s\xa0]*(?:kniha[\s\xa0]*|list[\s\xa0]*)?|a[\s\xa0]*(?:kniha[\s\xa0]*)?)Mojzisov|g[ai][\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszow))a|K(?:(?:s(?:ieg[ai]|\.)?[\s\xa0]*Wyjsci|essaaba|utok|njiga[\s\xa0]*Izlask)a|ess|ut|i(?:tabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Musa|v(?:onulas)?)))|(?:(?:Delivran|Exodu)s|(?:II|2)[\s\xa0]*Mooseksen|(?:II|2)\.[\s\xa0]*Mooseksen|Toinen[\s\xa0]*Mooseksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Bel"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:B(?:el(?:[\\s\\xa0]*(?:e(?:[\\s\\xa0]*(?:il[\\s\\xa0]*Drag|o[\\s\\xa0]*Draga)o|s[\\s\\xa0]*a[\\s\\xa0]*sarkany|n[\\s\\xa0]*de[\\s\\xa0]*draak)|(?:y[\\s\\xa0]*el[\\s\\xa0]*Serpient|ja[\\s\\xa0]*lohikaarm)e|et[\\s\\xa0]*le[\\s\\xa0]*Serpent|&[\\s\\xa0]*(?:the[\\s\\xa0]*S(?:erpent|nake)|S(?:erpent|nake))|a(?:nd[\\s\\xa0]*(?:the[\\s\\xa0]*S(?:erpent|nake)|S(?:erpent|nake))|['’]r[\\s\\xa0]*Ddraig|[\\s\\xa0]*drak)|und[\\s\\xa0]*Vom[\\s\\xa0]*Drachen|(?:(?:et[\\s\\xa0]*le|y[\\s\\xa0]*el)[\\s\\xa0]*|&[\\s\\xa0]*(?:the[\\s\\xa0]*)?|and[\\s\\xa0]*(?:the[\\s\\xa0]*)?)Dragon|o(?:g[\\s\\xa0]*dr(?:a(?:gen[\\s\\xa0]*i[\\s\\xa0]*Babylo|ke)|ekin)|ch[\\s\\xa0]*Ormgude)n)|a[\\s\\xa0]*i[\\s\\xa0]*weza)|aal[\\s\\xa0]*es[\\s\\xa0]*a[\\s\\xa0]*sarkany)|Si[\\s\\xa0]*Bel[\\s\\xa0]*at[\\s\\xa0]*ang[\\s\\xa0]*Dragon|Bel[\\s\\xa0]*et[\\s\\xa0]*draconis|Histoia[\\s\\xa0]*Beli[\\s\\xa0]*et[\\s\\xa0]*draconis|Opowiadaniem[\\s\\xa0]*o[\\s\\xa0]*Belu[\\s\\xa0]*i[\\s\\xa0]*wezu|Danieli[\\s\\xa0]*na[\\s\\xa0]*Makuhani[\\s\\xa0]*wa[\\s\\xa0]*Beli|Bel[\\s\\xa0]*si[\\s\\xa0]*dragonul|Istoria[\\s\\xa0]*(?:omorarii[\\s\\xa0]*balaurului[\\s\\xa0]*si[\\s\\xa0]*a[\\s\\xa0]*sfaramarii[\\s\\xa0]*lui[\\s\\xa0]*Bel|Balaurului))|(?:Bel(?:[\\s\\xa0]*(?:e(?:t[\\s\\xa0]*le[\\s\\xa0]*(?:serpent|dragon)|[\\s\\xa0]*o[\\s\\xa0]*dragao)|(?:at[\\s\\xa0]*ang[\\s\\xa0]*Drago|og[\\s\\xa0]*Drage)n))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phlm"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Fil(?:emo(?:n(?:breve|i)t|m)|m)|Kirje[\\s\\xa0]*Filemonille|Lettera[\\s\\xa0]*a[\\s\\xa0]*Filemone|List[\\s\\xa0]*Filemonovi|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Filemoni|B(?:ref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Filemons|arua[\\s\\xa0]*kwa[\\s\\xa0]*Filemoni)|Fl?mn|Filemonhoz|Filimon|Brevet[\\s\\xa0]*til[\\s\\xa0]*Filemon|(?:Brevet[\\s\\xa0]*till|Ka(?:ng|y))[\\s\\xa0]*Filemon|Epistulam?[\\s\\xa0]*ad[\\s\\xa0]*Philemonem|F(?:i(?:l[ei]m)?|l?m)|List[\\s\\xa0]*do[\\s\\xa0]*Filemona|P(?:a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Filemon|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Filemonu)|h(?:ilemonhoz|l?mn|l[ei]mon)|il(?:emonukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupa)?m|h(?:ile(?:m(?:on)?)?|l?m)|ilimoona|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*Fylymona))|(?:P(?:ilemonukku|hilemonem|oslanica[\\s\\xa0]*Filemonu|aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*Filemon)|Filemon(?:[aeu]|ovi|ille)|ad[\\s\\xa0]*Philemonem|Filemoni?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lev"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:3(?:\.?[\s\xa0]*Mojz(?:eszow|isov)a|\.?[\s\xa0]*Moseboken)|III[\s\xa0]*Mojz(?:eszow|isov)a)|(?:3[\s\xa0]*Mojz)|(?:le(?:viharuko[\s\xa0]*pustak|wiy)|Levitique)|(?:L(?:e(?:v(?:i(?:ti(?:c(?:os|ul)|k(?:et|us))|yarakamam)|yt)|biti[ck]o)|v|eviticusi|a(?:awiyiintii|w))|Mambo[\s\xa0]*ya[\s\xa0]*Walawi|Mozes[\s\xa0]*III|Wal|3(?:[\s\xa0]*M(?:osebo[gk]|oj|z)|\.[\s\xa0]*Mo(?:sebo[gk]|jz))|(?:L(?:e(?:v(?:et[ei]?|ite?)c|bitik|fitic)|i(?:ber[\s\xa0]*Leviti|v[ei]t[ei]|v[ei]t)c)u|3[\s\xa0]*Moze)s|(?:Harmadik|Derde|3(?:e\.?|\.))[\s\xa0]*Mozes|Levit(?:ski[\s\xa0]*zakoni|a)k|III(?:[\s\xa0]*Mo(?:zes|jz|sebok)|\.[\s\xa0]*Mo(?:sebok|zes))|Ka?pl|Kaimaman|3e\.?[\s\xa0]*Moseboken|(?:W(?:ogaaba|ajikr)|Vajikr|Laaivyavyavasth|3[\s\xa0]*Mooseksen[\s\xa0]*kirj|(?:III\.?|3\.)[\s\xa0]*Mooseksen[\s\xa0]*kirj|K(?:itabu[\s\xa0]*cha[\s\xa0]*Tatu[\s\xa0]*cha[\s\xa0]*Mus|olmas[\s\xa0]*Mooseksen[\s\xa0]*kirj)|III\.[\s\xa0]*Mojzisov|3[\s\xa0]*k[\s\xa0]*Mojzisov|3[\s\xa0]*k\.[\s\xa0]*Mojzisov|3[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:III\.?|3\.)[\s\xa0]*kniha[\s\xa0]*Mojzisov)a|III\.[\s\xa0]*Mojzeszowa|(?:III\.?|3\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszowa|Tr(?:e(?:ti(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|[\s\xa0]*(?:kniha[\s\xa0]*)?)Mojzisova|dje[\s\xa0]*Mosebo(?:ken|g))|zeci(?:a[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*)?|[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*)?)Mojzeszowa)|L(?:e(?:v(?:i(?:ti(?:co?|ku?))?)?|b|f)?|aaw)|Wog|3(?:[\s\xa0]*Mo(?:os|z|se?)?|\.[\s\xa0]*Mo(?:se?)?)|III(?:\.[\s\xa0]*Mo(?:jz|s)|[\s\xa0]*Mo[js])|3e\.?[\s\xa0]*Mosebok|Tr(?:edje[\s\xa0]*Mos(?:ebok)?|zecia?[\s\xa0]*Mojz)|(?:Dritte[\s\xa0]*(?:Buch[\s\xa0]*)?|3\.?[\s\xa0]*Buch[\s\xa0]*)Mose|liv[\s\xa0]*Prensip[\s\xa0]*lavi[\s\xa0]*nan[\s\xa0]*Bondye)|(?:Leviticus|Walawi|leviharuko|(?:III|3)[\s\xa0]*Mooseksen|(?:III|3)\.[\s\xa0]*Mooseksen|Kolmas[\s\xa0]*Mooseksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2[\s\xa0]*Tessalonikerbrevet)|(?:2(?:[\s\xa0]*T(?:es(?:alonik(?:yen|a)|szalonikaiakhoz)|h(?:esszalonikaiakhoz|sss?))|e\.?[\s\xa0]*Tessalonicenzen|\.[\s\xa0]*T(?:es(?:alonik(?:yen|a)|szalonikaiakhoz)|h(?:esszalonikaiakhoz|sss?)))|Andre[\s\xa0]*(?:tessalonikerbrev|Tessalonikerne)|II\.?[\s\xa0]*Thsss|II\.?[\s\xa0]*Thss)|(?:2(?:[\s\xa0]*Th?|\.[\s\xa0]*Th)esszalonika)|(?:2(?:(?:\.?[\s\xa0]*Tesalonican|\.?[\s\xa0]*Soluncan)om|\.?[\s\xa0]*Tesalonica|\.?[\s\xa0]*Tesalonickym|\.?[\s\xa0]*Solunskym|\.?[\s\xa0]*Tessalonicenskym)|II[\s\xa0]*(?:Tes(?:alonic(?:ano|ky)|salonicensky)|Solun(?:cano|sky))m|II\.[\s\xa0]*(?:Tes(?:alonic(?:ano|ky)|salonicensky)|Solun(?:cano|sky))m|Druh[ay][\s\xa0]*(?:Tes(?:alonic(?:ano|ky)|salonicensky)|Solun(?:cano|sky))m)|(?:2(?:[\s\xa0]*(?:T(?:e(?:calonikkiyarukku|ssz)|a?s)|tessalonikerbrev|Th(?:ess(?:alonicher|[sz])|s)|Tesalonik|Thessalonikerbrevet)|\.[\s\xa0]*(?:T(?:h(?:ess(?:alonicher|[sz])|s|essalonikerbrevet)|es(?:salonikerbrevet|alonik))|tessalonikerbrev))|(?:Zweite[\s\xa0]*Thessalonich|Andre[\s\xa0]*Tessalonik)er|Ande[nt][\s\xa0]*Thessalonikerbrev|Andra[\s\xa0]*Th?essalonikerbrevet|2\.?[\s\xa0]*Tesaloniceni|Masodik[\s\xa0]*Th?esszalonikaiakhoz|I(?:I(?:\.[\s\xa0]*T(?:es(?:aloni(?:c(?:eni|a)|ka)|szalonikaiakhoz)|h(?:esszalonikaiakhoz|(?:ess)?s))|[\s\xa0]*T(?:es(?:aloni(?:c(?:eni|a)|ka)|szalonikaiakhoz)|h(?:esszalonikaiakhoz|(?:ess)?s)))|kalawang[\s\xa0]*Tesalonica)|Epistula[\s\xa0]*ad[\s\xa0]*Thessalonicenses[\s\xa0]*II|Wa(?:raka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wathesalonik[ei]|thesalonike[\s\xa0]*II)|2nd\.?[\s\xa0]*Thesss|(?:II\.?[\s\xa0]*Tessalonic|2\.?[\s\xa0]*Tessalonic)esi|Second(?:a[\s\xa0]*(?:lettera[\s\xa0]*ai[\s\xa0]*)?Tessalonicesi|o[\s\xa0]*Tessalonicesi|[\s\xa0]*Thesss)|(?:II(?:\.[\s\xa0]*T(?:esalonicense|hess?alonian)|[\s\xa0]*T(?:esalonicense|hess?alonian))|2(?:\.?[\s\xa0]*Thesalonian|e\.?[\s\xa0]*Tes|\.?[\s\xa0]*Thessalonian|\.?[\s\xa0]*Tesalonicense)|(?:II\.?|2\.?)[\s\xa0]*Tesalonisense|2\.o\.?[\s\xa0]*Tesaloni[cs]ense|2o[\s\xa0]*Tesaloni[cs]ense|2o\.[\s\xa0]*Tesaloni[cs]ense|(?:II\.?|2\.?)[\s\xa0]*Thessolonian|(?:II\.?|2\.?)[\s\xa0]*Thesolonian|(?:II(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|2(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?))elonian|(?:(?:II\.?|2\.?)[\s\xa0]*Thessalonai|(?:II\.?|2\.?)[\s\xa0]*Thessalonio)n|2nd\.?[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|Se(?:cond[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|gundo[\s\xa0]*Tesaloni[cs]ense))s|Pili[\s\xa0]*Thes|(?:(?:2(?:\.?[\s\xa0]*Thessalonice|\.?[\s\xa0]*Tessalonice)|II(?:\.[\s\xa0]*Th?|[\s\xa0]*Th?)essalonice)nse|2(?:[\s\xa0]*Thess?alonin|Thes|\.[\s\xa0]*Thess?alonin)|II(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alonin|2o\.?[\s\xa0]*Tessalonicense|Epistula[\s\xa0]*II[\s\xa0]*ad[\s\xa0]*Thessalonicense|2a[\s\xa0]*Tessalonicense|2a\.[\s\xa0]*Tessalonicense|(?:II\.?|2\.?)[\s\xa0]*Thessolonin|(?:II\.?|2\.?)[\s\xa0]*Thessalonan|2nd\.?[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)n|Se(?:cond[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)n|gund[ao][\s\xa0]*Tessalonicense))s|(?:2(?:\.[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|\.?[\s\xa0]*Thesalonica|\.?[\s\xa0]*Thessaloniaa)|II(?:\.[\s\xa0]*Thes(?:saloni(?:aa|e|ca)|aloni(?:ca|o))|[\s\xa0]*Thes(?:saloni(?:aa|e|ca)|aloni(?:ca|o)))|(?:II(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|2(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?))elonai|(?:II(?:\.[\s\xa0]*Thes(?:alonii|salone)|[\s\xa0]*Thes(?:alonii|salone))|2(?:\.[\s\xa0]*Thes(?:alonii|salone)|[\s\xa0]*Thes(?:alonii|salone))|(?:II(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|2(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?))alloni)a|(?:II\.?|2\.?)[\s\xa0]*Thessalonoi?a|(?:II\.?|2\.?)[\s\xa0]*Thessaloniio|(?:(?:II\.?|2\.?)[\s\xa0]*Thessalonai|(?:II\.?|2\.?)[\s\xa0]*Thessalonio)a|(?:II\.?|2\.?)[\s\xa0]*Thessalonici[ae]|2nd\.?[\s\xa0]*Thes(?:s(?:al(?:on(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|(?:oi?|e|ai)a)|lonia)|elonai)|al(?:oni[ci]|loni)a|alonio|elonai)|Second[\s\xa0]*Thes(?:s(?:al(?:on(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|(?:oi?|e|ai)a)|lonia)|elonai)|al(?:oni[ci]|loni)a|alonio|elonai))ns|(?:2(?:e\.?[\s\xa0]*Thessalonic|\.?[\s\xa0]*Thesalonic)|II\.?[\s\xa0]*Thesalonic)iens|(?:(?:II\.?|2\.?)[\s\xa0]*|2nd\.?[\s\xa0]*|Second[\s\xa0]*)Thessalonciens|2e\.?[\s\xa0]*Thesaloniciens|2(?:de?|eme)[\s\xa0]*Thess?aloniciens|2(?:de?|eme)\.[\s\xa0]*Thess?aloniciens|(?:II\.?[\s\xa0]*Tesalonice|2\.?[\s\xa0]*Tesalonice)nsow|(?:I(?:kalawang[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])|Tesalonik)|I(?:\.?[\s\xa0]*Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])|\.?[\s\xa0]*Tesaloniik))|2(?:(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?)|[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?))Tesaloni[ck]|(?:\.[\s\xa0]*Tes(?:szalon|aloni)|[\s\xa0]*Tesaloni)ik|\.?[\s\xa0]*Mga[\s\xa0]*Taga\-?Tesaloni[ck])|Pavlova[\s\xa0]*druga[\s\xa0]*poslanica[\s\xa0]*Solunjanim)a|(?:II\.?[\s\xa0]*So|2\.?[\s\xa0]*So)lunjanima[\s\xa0]*Poslanica|D(?:ru(?:g(?:a[\s\xa0]*(?:Solunjanima[\s\xa0]*Poslanica|Tesalonicensow)|i[\s\xa0]*Tesalonicensow)|h[ay][\s\xa0]*Sol)|euxieme(?:s[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloniciens)|(?:Dru(?:g(?:a[\s\xa0]*(?:List[\s\xa0]*do[\s\xa0]*)?|i[\s\xa0]*(?:List[\s\xa0]*do[\s\xa0]*)?)Tesalonicz|he[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*solunj)a|(?:(?:II\.?|2\.?)[\s\xa0]*List[\s\xa0]*do|II\.?|2\.?)[\s\xa0]*Tesalonicza|2\.?[\s\xa0]*Thaissaluneekiyo)n|(?:II(?:\.[\s\xa0]*T(?:es(?:salonicenz|aloniky)|hessalonicenz)|[\s\xa0]*T(?:es(?:salonicenz|aloniky)|hessalonicenz))|2(?:\.?[\s\xa0]*Thessalonice|\.?[\s\xa0]*Tessalonice)nz|Dezyem[\s\xa0]*Tesaloniky)en|2e\.?[\s\xa0]*Thessalonicenzen|(?:2(?:[\s\xa0]*(?:T(?:essalonikern|hesalonikasv)|[ei]\.?[\s\xa0]*Thesalonikasv|[ei]\.?[\s\xa0]*Selanikasv|Selanikasv)|\.[\s\xa0]*(?:T(?:essalonikern|hesalonikasv)|Selanikasv))|Naa77antto[\s\xa0]*Tasalonqq|2\.?[\s\xa0]*Mga[\s\xa0]*Tesaloni[cs]ens|I(?:kalawang[\s\xa0]*(?:Mga[\s\xa0]*Tesaloni[cs]|Tesaloni[cs])|I\.?[\s\xa0]*Mga[\s\xa0]*Tesaloni[cs])ens|(?:Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa|II\.?|2\.?)[\s\xa0]*Wathesalonik|Anden[\s\xa0]*Tessalonikern|P(?:aulus(?:’[\s\xa0]*(?:Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th|andre[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*t)|\'[\s\xa0]*Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th)essalonikern|ili[\s\xa0]*Wathesalonik)|Druh[ay][\s\xa0]*T|2\.?[\s\xa0]*Tessalonikalaiskirj|II\.?[\s\xa0]*Tessalonikalaiskirj)e|(?:II\.?[\s\xa0]*Tessalonika|2\.?[\s\xa0]*Tessalonika)laisille|(?:II\.?|2\.?)[\s\xa0]*Kirje[\s\xa0]*tessalonikalaisille|(?:2(?:\.?[\s\xa0]*Thessalonia|\.?[\s\xa0]*Thesalonia)|II(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alonia)id|II(?:\.[\s\xa0]*T(?:esalonicense|hess?alonian)|[\s\xa0]*T(?:esalonicense|hess?alonian))|2(?:\.?[\s\xa0]*Thesalonian|e\.?[\s\xa0]*Tes|\.?[\s\xa0]*Thessalonian|\.?[\s\xa0]*Tesalonicense)|(?:II\.?|2\.?)[\s\xa0]*Tesalonisense|2\.o\.?[\s\xa0]*Tesaloni[cs]ense|2o[\s\xa0]*Tesaloni[cs]ense|2o\.[\s\xa0]*Tesaloni[cs]ense|(?:II\.?|2\.?)[\s\xa0]*Thessolonian|(?:II\.?|2\.?)[\s\xa0]*Thesolonian|(?:II(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|2(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?))elonian|(?:(?:II\.?|2\.?)[\s\xa0]*Thessalonai|(?:II\.?|2\.?)[\s\xa0]*Thessalonio)n|2nd\.?[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|Se(?:cond[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|gundo[\s\xa0]*Tesaloni[cs]ense)|2(?:[\s\xa0]*Te(?:s(?:s(?:aloniker)?)?)?|e\.?[\s\xa0]*Thess|[\s\xa0]*Th(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|\.[\s\xa0]*T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|e(?:s(?:s(?:aloniker|z)?)?)?))|And(?:en[\s\xa0]*Th|re[\s\xa0]*T)ess|Masodik[\s\xa0]*Th?essz(?:alonika)?|2\.?[\s\xa0]*Sol|II(?:\.[\s\xa0]*(?:T(?:e(?:s(?:s(?:z(?:alonika)?)?|alonik)?)?|h(?:essz(?:alonika)?|e(?:ss?)?)?)|Sol)|[\s\xa0]*(?:T(?:e(?:s(?:s(?:z(?:alonika)?)?|alonik)?)?|h(?:essz(?:alonika)?|e(?:ss?)?)?)|Sol))|2nd\.?[\s\xa0]*Th(?:ess?|s)?|Second[\s\xa0]*Th(?:ess?|s)?|Pili[\s\xa0]*The?|Dezyem[\s\xa0]*Tesalonik|(?:Druh(?:a[\s\xa0]*(?:kniha[\s\xa0]*(?:Tesalonic(?:ano|ky)|Solun(?:cano|sky))|list[\s\xa0]*(?:Tesalonic|Soluns)ky)|y[\s\xa0]*list[\s\xa0]*(?:Tesalonic(?:ano|ky)|Solun(?:cano|sky)))|2[\s\xa0]*k[\s\xa0]*(?:Tesalonic(?:ano|ky)|Solun(?:cano|sky))|(?:II\.?|2\.?)[\s\xa0]*list[\s\xa0]*(?:Tesalonic|Soluns)ky|2[\s\xa0]*k\.[\s\xa0]*(?:Tesalonic(?:ano|ky)|Solun(?:cano|sky)))m|T(?:oinen[\s\xa0]*(?:Tessalonikalais(?:kirj|ill)|Kirje[\s\xa0]*tessalonikalaisill)e|weede[\s\xa0]*Th?essalonicenzen|weede[\s\xa0]*T(?:ess?|hess)|e(?:calonikkiyarukku[\s\xa0]*Elutiya[\s\xa0]*Irantavatu[\s\xa0]*Nirupam|soloniika[\s\xa0]*Labaad)))|(?:(?:ad[\s\xa0]*)?Thessalonicenses[\s\xa0]*II|(?:II|2)[\s\xa0]*Solunjanima|(?:II|2)\.[\s\xa0]*Solunjanima|Druga[\s\xa0]*(?:poslanica[\s\xa0]*)?Solunjanima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*Tessalonikerbrevet)|(?:1(?:[\s\xa0]*Tesalonik(?:yen|a)|st\.?[\s\xa0]*Thsss|[\s\xa0]*Tesalonisenses|st\.?[\s\xa0]*Thss|[\s\xa0]*Tesszalonikaiakhoz|[\s\xa0]*Thesszalonikaiakhoz|\.[\s\xa0]*T(?:es(?:szalonikaiakhoz|alonisenses)|hesszalonikaiakhoz))|(?:First[\s\xa0]*Ths|I\.?[\s\xa0]*Ths)ss|I\.?[\s\xa0]*Tesalonik(?:yen|a)|I\.?[\s\xa0]*Tesalonisenses|(?:First[\s\xa0]*Ths|I\.?[\s\xa0]*Ths)s|I\.?[\s\xa0]*Tesszalonikaiakhoz|I\.?[\s\xa0]*Thesszalonikaiakhoz)|(?:(?:I(?:\.?[\s\xa0]*Th|\.?[\s\xa0]*T)|1(?:[\s\xa0]*Th?|\.[\s\xa0]*Th))esszalonika)|(?:(?:1(?:\.[\s\xa0]*(?:Tesaloni|Solun)|[\s\xa0]*(?:Tesaloni|Solun))|I(?:\.?[\s\xa0]*Tesaloni|\.?[\s\xa0]*Solun))canom|(?:I\.?[\s\xa0]*|1[\s\xa0]*)Tesalonica|(?:1\.?[\s\xa0]*|I\.?[\s\xa0]*)Tesalonickym|(?:1\.?[\s\xa0]*|I\.?[\s\xa0]*)Solunskym|(?:1\.?[\s\xa0]*|I\.?[\s\xa0]*)Tessalonicenskym|Prvni[\s\xa0]*(?:Tes(?:salonicens|alonic)|Soluns)kym)|(?:(?:(?:1(?:st(?:\.[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)elonai|(?:\.[\s\xa0]*Thes(?:aloni[ci]|salone)|[\s\xa0]*Thes(?:aloni[ci]|salone)|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alloni)a|\.?[\s\xa0]*Thessalonoi?a|(?:\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)a|\.?[\s\xa0]*Thessaloniio|\.?[\s\xa0]*Thessalonici[ae])|[\s\xa0]*Thes(?:s(?:al(?:on(?:i(?:c(?:i[ae]|a)|oa|e|io|aa)|(?:oi?|e|ai)a)|lonia)|elonai)|aloni(?:ca|o)|elonai|al(?:lon|oni)ia)|\.[\s\xa0]*Thes(?:s(?:al(?:on(?:i(?:c(?:i[ae]|a)|oa|e|io|aa)|(?:oi?|e|ai)a)|lonia)|elonai)|aloni(?:ca|o)|elonai|al(?:lon|oni)ia))|I(?:\.[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio))|First[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|I\.?[\s\xa0]*Thesalonica|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|First[\s\xa0]*Thess?)elonai|(?:I(?:\.[\s\xa0]*Thes(?:alonii|salone)|[\s\xa0]*Thes(?:alonii|salone))|First[\s\xa0]*Thes(?:aloni[ci]|salone)|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|First[\s\xa0]*Thess?)alloni)a|(?:First|I\.?)[\s\xa0]*Thessalonoi?a|(?:First[\s\xa0]*Thessaloni[ao]|I\.?[\s\xa0]*Thessalonio|(?:First|I\.?)[\s\xa0]*Thessalonai)a|(?:First|I\.?)[\s\xa0]*Thessaloniio|I\.?[\s\xa0]*Thessaloniaa|(?:First|I\.?)[\s\xa0]*Thessalonici[ae])n|1(?:st(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alonin|Thes|st\.?[\s\xa0]*Thessolonin|st\.?[\s\xa0]*Thessalonan|[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)n|\.[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)n)|(?:(?:(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|First[\s\xa0]*Thess?)a|(?:First|I\.?)[\s\xa0]*Thesso)loni|(?:First|I\.?)[\s\xa0]*Thessalona)n|(?:1\.?[\s\xa0]*Thesalonic|I\.?[\s\xa0]*Thesalonic)ien|(?:1(?:st\.?|\.)?|First|I\.?)[\s\xa0]*Thessaloncien|1(?:ere?|re)[\s\xa0]*Thess?alonicien|1(?:ere?|re)\.[\s\xa0]*Thess?alonicien)s|1(?:[\s\xa0]*T(?:e(?:calonikkiyarukku|s(?:alonik|sz))|a?s)|st(?:\.[\s\xa0]*Th(?:ess)?|[\s\xa0]*Th(?:ess)?)s|[\s\xa0]*tessalonikerbrev|[\s\xa0]*Thess[sz]|[\s\xa0]*Tesaloniceni|[\s\xa0]*Thessalonikerbrevet|\.[\s\xa0]*(?:T(?:es(?:aloni(?:c(?:eni|a)|ka)|salonikerbrevet)|hess(?:alonikerbrevet|[sz]))|tessalonikerbrev))|I(?:\.[\s\xa0]*T(?:h(?:ess[sz]|s)|essz)|[\s\xa0]*T(?:h(?:ess[sz]|s)|essz))|Una(?:ng)?[\s\xa0]*Tesalonica|First[\s\xa0]*Th(?:ess)?s|I\.?[\s\xa0]*Tesalonik|I\.?[\s\xa0]*Tesaloniceni|Forsta[\s\xa0]*Th?essalonikerbrevet|Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wathesalonik[ei]|1\.?[\s\xa0]*Thessalonicher|Wathesalonike[\s\xa0]*I|E(?:lso[\s\xa0]*Th?esszalonikaiakhoz|rste[\s\xa0]*Thessalonicher|pistula[\s\xa0]*ad[\s\xa0]*Thessalonicenses[\s\xa0]*I)|(?:1\.?[\s\xa0]*Tesa|I\.?[\s\xa0]*Tesa)lonicensow|(?:1(?:st(?:(?:\.?[\s\xa0]*Thesso|\.?[\s\xa0]*Thesa|\.?[\s\xa0]*Theso|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e)lonia|\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)n|[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|[\s\xa0]*Tesalonicense|\.[\s\xa0]*T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|esalonicense))|(?:(?:First|I\.?)[\s\xa0]*Thesso|First[\s\xa0]*Thesa)lonian|I\.?[\s\xa0]*Thesalonian|Kwanza[\s\xa0]*The|(?:First|I\.?)[\s\xa0]*Thesolonian|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|First[\s\xa0]*Thess?)elonian|(?:First[\s\xa0]*Thessaloni[ao]|I\.?[\s\xa0]*Thessalonio|(?:First|I\.?)[\s\xa0]*Thessalonai)n|I\.?[\s\xa0]*Thessalonian|I\.?[\s\xa0]*Tesalonicense)s|1o\.?[\s\xa0]*Tesaloni[cs]enses|1\.o[\s\xa0]*Tesaloni[cs]enses|1\.o\.[\s\xa0]*Tesaloni[cs]enses|(?:I(?:\.?[\s\xa0]*Thessalonice|\.?[\s\xa0]*Tessalonice)|1(?:\.[\s\xa0]*Th?|[\s\xa0]*Th?)essalonice)nses|1o\.?[\s\xa0]*Tessalonicenses|Epistula[\s\xa0]*I[\s\xa0]*ad[\s\xa0]*Thessalonicenses|1a[\s\xa0]*Tessalonicenses|1a\.[\s\xa0]*Tessalonicenses|(?:1\.?[\s\xa0]*Tessalonic|I\.?[\s\xa0]*Tessalonic)esi|(?:1(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:\-?(?:[\s\xa0]*Tesaloni[ck]|Tesaloni[ck])|[\s\xa0]*Tesaloni[ck])|T(?:es(?:szalon|aloni)ik|aga\-?Tesaloni[ck]))|[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:\-?(?:[\s\xa0]*Tesaloni[ck]|Tesaloni[ck])|[\s\xa0]*Tesaloni[ck])|T(?:aga\-?Tesaloni[ck]|esaloniik)))|(?:I(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)|Una(?:ng)?[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Tesaloni[ck]|(?:Una(?:ng)?[\s\xa0]*Tesalon|I\.?[\s\xa0]*Tesaloni)ik|(?:1\.?[\s\xa0]*So|I\.?[\s\xa0]*So)lunjanima[\s\xa0]*Poslanic)a|(?:1(?:[\s\xa0]*(?:Tes(?:salonikern|alonisens)|Mga[\s\xa0]*Tesaloni[cs]ens|Thesalonikasv|[ei]\.?[\s\xa0]*Thesalonikasv|[ei]\.?[\s\xa0]*Selanikasv|Selanikasv)|\.[\s\xa0]*(?:Tes(?:salonikern|alonisens)|Mga[\s\xa0]*Tesaloni[cs]ens|Thesalonikasv|Selanikasv))|Una(?:ng)?[\s\xa0]*Tesalonicens|Koiro[\s\xa0]*Tasalonqq|(?:Una(?:ng)?[\s\xa0]*Tesa|I\.?[\s\xa0]*Tesa)lonisens|(?:Una(?:ng)?[\s\xa0]*M|I\.?[\s\xa0]*M)ga[\s\xa0]*Tesaloni[cs]ens|(?:Kwanza|I\.?|1\.?)[\s\xa0]*Wathesalonik|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wathesalonik|1\.?[\s\xa0]*Tessalonikalaiskirj|I\.?[\s\xa0]*Tessalonikalaiskirj|(?:1\.?[\s\xa0]*Tessalonika|I\.?[\s\xa0]*Tessalonika)laisill|(?:1\.?|I\.?)[\s\xa0]*Kirje[\s\xa0]*tessalonikalaisill|Ensimmainen[\s\xa0]*(?:Tessalonikalais(?:kirj|ill)|Kirje[\s\xa0]*tessalonikalaisill))e|(?:(?:1(?:\.[\s\xa0]*T(?:es(?:salonicenz|aloniky)|hessalonicenz)|[\s\xa0]*Th?essalonicenz)|I(?:\.?[\s\xa0]*Thessalonice|\.?[\s\xa0]*Tessalonice)nz|1e[\s\xa0]*Th?essalonicenz|1e\.[\s\xa0]*Th?essalonicenz|Eerste[\s\xa0]*Th?essalonicenz)e|1\.?[\s\xa0]*Thaissaluneekiyo)n|(?:(?:1\.?|I\.?)[\s\xa0]*List[\s\xa0]*do[\s\xa0]*Tesa|1\.?[\s\xa0]*Tesa|I\.?[\s\xa0]*Tesa)loniczan|P(?:r(?:im(?:e(?:r(?:o[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])|ir[ao][\s\xa0]*Tessalonic)enses|o[\s\xa0]*Tessalonicesi|a[\s\xa0]*(?:lettera[\s\xa0]*ai[\s\xa0]*)?Tessalonicesi)|emier(?:e(?:s[\s\xa0]*Thess?|[\s\xa0]*Thess?)|s[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloniciens|vni[\s\xa0]*Sol)|ierwsz[aey][\s\xa0]*Tesalonicensow|rva[\s\xa0]*Solunjanima[\s\xa0]*Poslanica|rvni[\s\xa0]*Te|a(?:ulus['’][\s\xa0]*1\.?[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Thessalonikerne|vlova[\s\xa0]*prva[\s\xa0]*poslanica[\s\xa0]*Solunjanima)|remye[\s\xa0]*Tesalonikyen|ierwsz[aey][\s\xa0]*(?:List[\s\xa0]*do[\s\xa0]*)?Tesaloniczan|erse[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*solunjan)|(?:I(?:\.?[\s\xa0]*Thessalonia|\.?[\s\xa0]*Thesalonia)|1(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alonia)id|1(?:st(?:(?:\.?[\s\xa0]*Thesso|\.?[\s\xa0]*Thesa|\.?[\s\xa0]*Theso|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e)lonia|\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)n|[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|[\s\xa0]*Tesalonicense|\.[\s\xa0]*T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|esalonicense))|(?:(?:First|I\.?)[\s\xa0]*Thesso|First[\s\xa0]*Thesa)lonian|I\.?[\s\xa0]*Thesalonian|Kwanza[\s\xa0]*The|(?:First|I\.?)[\s\xa0]*Thesolonian|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|First[\s\xa0]*Thess?)elonian|(?:First[\s\xa0]*Thessaloni[ao]|I\.?[\s\xa0]*Thessalonio|(?:First|I\.?)[\s\xa0]*Thessalonai)n|I\.?[\s\xa0]*Thessalonian|I\.?[\s\xa0]*Tesalonicense|1(?:st(?:\.[\s\xa0]*Th(?:ess?)?|[\s\xa0]*Th(?:ess?)?)|[\s\xa0]*Te(?:s(?:s(?:aloniker)?)?)?|[\s\xa0]*Th(?:e(?:s(?:s(?:alonikerbrev)?)?)?|s)?|[\s\xa0]*Sol|\.[\s\xa0]*(?:T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?|s)?|e(?:s(?:s(?:aloniker|z)?|alonik)?)?)|Sol))|I(?:\.[\s\xa0]*T(?:h(?:e(?:ss?)?)?|e(?:ss?)?)|[\s\xa0]*T(?:h(?:e(?:ss?)?)?|e(?:ss?)?))|Kwanza[\s\xa0]*Th|First[\s\xa0]*Th(?:ess?)?|I\.?[\s\xa0]*Sol|1e[\s\xa0]*T(?:ess?|hess)|1e\.[\s\xa0]*T(?:ess?|hess)|E(?:lso[\s\xa0]*T(?:hessz(?:alonika)?|essz(?:alonika)?)|erste[\s\xa0]*T(?:ess?|hess))|1o\.?[\s\xa0]*Tesaloni[cs]ense|1\.o[\s\xa0]*Tesaloni[cs]ense|1\.o\.[\s\xa0]*Tesaloni[cs]ense|Pr(?:imer(?:o[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])ense|emye[\s\xa0]*Tesalonik)|(?:Prv(?:(?:ni[\s\xa0]*list[\s\xa0]*(?:Tesalonic|Soluns)|y[\s\xa0]*Soluns|y[\s\xa0]*list[\s\xa0]*Soluns|y[\s\xa0]*(?:list[\s\xa0]*)?Tesalonic)ky|y[\s\xa0]*(?:list[\s\xa0]*)?Tesalonicano|y[\s\xa0]*(?:list[\s\xa0]*)?Soluncano|a[\s\xa0]*(?:(?:(?:kniha[\s\xa0]*)?Tesalonic|kniha[\s\xa0]*Soluns)ky|(?:kniha[\s\xa0]*)?Tesalonicano|kniha[\s\xa0]*Soluncano|Solun(?:cano|sky)))|(?:(?:1\.?|I\.?)[\s\xa0]*list[\s\xa0]*(?:Tesalonic|Soluns)|1[\s\xa0]*k[\s\xa0]*Soluns|1[\s\xa0]*k\.[\s\xa0]*Soluns|1[\s\xa0]*k\.?[\s\xa0]*Tesalonic)ky|1[\s\xa0]*k\.?[\s\xa0]*Tesalonicano|1[\s\xa0]*k\.?[\s\xa0]*Soluncano)m|Te(?:calonikkiyarukku[\s\xa0]*Elutiya[\s\xa0]*Mutalavatu[\s\xa0]*Nirupam|soloniika[\s\xa0]*Kowaad))|(?:Thes(?:(?:s(?:al(?:on(?:i(?:[ao]a|io|[ao]|c(?:i[ae]|a))?|(?:oi?|e)a|cie|aia|ai?)|lonia)|[eo]lonia|oloni|elonai)|al(?:oni[ci]|loni)a|alonio|elonai|[aeo]lonia|aloni)ns|salonicenses[\s\xa0]*I)|ad[\s\xa0]*Thessalonicenses[\s\xa0]*I|Thes(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|[1I][\s\xa0]*Solunjanima|[1I]\.[\s\xa0]*Solunjanima|Prva[\s\xa0]*(?:poslanica[\s\xa0]*)?Solunjanima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:II[\s\xa0]*K(?:i(?:ralyok|s)|oningen)|2[\s\xa0]*Reg(?:um|i)|(?:2[\s\xa0]*R(?:ey?|y)e|II[\s\xa0]*Ki?g)s|II[\s\xa0]*Ki?ng?s|2nd[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)s|2nd\.[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)s|Second[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)s)|(?:(?:2nd(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)|Second[\s\xa0]*Ki?)ng)|(?:(?:II(?:[\s\xa0]*Kr(?:alov|olew)|\.[\s\xa0]*Kralov)|2\.?[\s\xa0]*Kralov)ska)|(?:(?:II(?:[\s\xa0]*K(?:uninkaiden[\s\xa0]*kirj|raljevim)|\.[\s\xa0]*Kraljevim)|2(?:[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|\.?[\s\xa0]*Kraljevim|[\s\xa0]*Raj))a|(?:II\.?|2\.?)[\s\xa0]*Kralov|II[\s\xa0]*Kr(?:al)?|2[\s\xa0]*Kral|(?:II(?:[\s\xa0]*Ks(?:ieg[ai]|\.)?|\.)|2\.?)[\s\xa0]*Krolewska|(?:II\.?|2\.?)[\s\xa0]*kniha[\s\xa0]*kralovska|Druh(?:a[\s\xa0]*(?:kniha[\s\xa0]*k|K)|y[\s\xa0]*K)ralovska)|(?:2(?:nd(?:\.[\s\xa0]*K(?:i[gns]|[gns])|[\s\xa0]*K(?:i[gns]|[gns]))|[\s\xa0]*(?:R(?:e(?:[egs]|y[es])|y[es]|s)|Krl)|[\s\xa0]*Kongebo[gk]|\.[\s\xa0]*Kongebo[gk])|Second[\s\xa0]*K(?:i[gns]|[gns])|4\.?[\s\xa0]*Regi|(?:Liber[\s\xa0]*II[\s\xa0]*Reg|4\.?[\s\xa0]*Regnor)um|2\.[\s\xa0]*Reg(?:um|i)|(?:(?:(?:2\.?[\s\xa0]*M|4\.?[\s\xa0]*M)ga|2\.?)[\s\xa0]*Har|2[\s\xa0]*Imparat|2\.[\s\xa0]*Imparat)i|2[\s\xa0]*Boqorradii|Boqorradii[\s\xa0]*Labaad|2[\s\xa0]*Breninoedd|2[\s\xa0]*Brenhinoedd|2\.[\s\xa0]*B(?:renh?inoedd|oqorradii)|(?:(?:2(?:[\s\xa0]*(?:Irajakk|F)|\.[\s\xa0]*F)|Pili[\s\xa0]*F)a|2[\s\xa0]*Kro)l|2\.[\s\xa0]*Kral|2\.?[\s\xa0]*Kgs|2\.?[\s\xa0]*Kng?s|Andre[\s\xa0]*Kongebok|Masodik[\s\xa0]*Kiralyok|2\.?[\s\xa0]*Ki(?:(?:ng?|g)?s|ralyok)|I(?:I(?:\.[\s\xa0]*(?:(?:(?:Mga[\s\xa0]*)?Har|Imparat)i|Reg(?:um|i)|B(?:renh?inoedd|oqorradii)|Fal|K(?:i(?:(?:ng?|g)?s|ralyok)|ral|gs|ng?s))|[\s\xa0]*(?:K(?:i(?:[gr]|ng)|on|g|ng)|Regi|(?:(?:Mga[\s\xa0]*)?Har|Imparat)i|B(?:renh?inoedd|oqorradii)|Fal))|(?:(?:ka(?:lawang|apat)|V\.?)[\s\xa0]*Mga|kalawang)[\s\xa0]*Hari|V(?:\.?[\s\xa0]*Regnorum|\.?[\s\xa0]*Regi))|(?:2(?:\.[\s\xa0]*K(?:on)?|[\s\xa0]*K(?:on)?)u|Andra[\s\xa0]*K(?:on)?u)ngaboken|2\.?[\s\xa0]*Koningen|II\.[\s\xa0]*Koningen|2e\.?[\s\xa0]*Koningen|Tweede[\s\xa0]*Koningen|Anden[\s\xa0]*Kongebog|4\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|Fjerde[\s\xa0]*Kongerigernes[\s\xa0]*Bog|II[\s\xa0]*a[\s\xa0]*Imparatilor|Cartea[\s\xa0]*(?:a[\s\xa0]*patra|IV)[\s\xa0]*a[\s\xa0]*Regilor|(?:2(?:o\.?[\s\xa0]*Rei|Kg|[\s\xa0]*Rei|\.[\s\xa0]*Rei)|Segundo[\s\xa0]*Rei|(?:Quart[ao]|4[ao]\.?)[\s\xa0]*Reino|4\.?[\s\xa0]*Reino|(?:2(?:\.(?:o\.?)?|o\.?)|Segundo)[\s\xa0]*Reye|I(?:I(?:\.[\s\xa0]*Re(?:ye|i)|[\s\xa0]*Re(?:ye|i))|V\.?[\s\xa0]*Reino)|(?:IV\.?|4\.?)[\s\xa0]*Kingdom|4th[\s\xa0]*Kingdom|4th\.[\s\xa0]*Kingdom|Fourth[\s\xa0]*Kingdom)s|(?:2(?:a\.?[\s\xa0]*Re|[\s\xa0]*Ro|\.[\s\xa0]*Ro)|Segunda[\s\xa0]*Re|II\.?[\s\xa0]*Ro)is|2e\.?[\s\xa0]*Rois|2(?:de?|eme)[\s\xa0]*Rois|2(?:de?|eme)\.[\s\xa0]*Rois|(?:II\.?[\s\xa0]*C|2\.?[\s\xa0]*C)ariv|(?:IV\.?|4\.?)[\s\xa0]*Kralov|Stvrta[\s\xa0]*Kralov|[24][\s\xa0]*k[\s\xa0]*Kralov|(?:Stvrta[\s\xa0]*kniha|[24][\s\xa0]*k\.)[\s\xa0]*Kralov|(?:II[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolo|2[\s\xa0]*Ka)w|(?:2\.?|II\.)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolow|D(?:ru(?:g(?:a[\s\xa0]*Ks(?:ieg[ai]|\.)?|i[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Krolow|h(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?)Kralov)|e(?:zyem[\s\xa0]*liv[\s\xa0]*Wa[\s\xa0]*yo|uxiemes?[\s\xa0]*Rois))|(?:Wafalme|Regum)[\s\xa0]*II|(?:4[\s\xa0]*[ei]\.?[\s\xa0]*Mbreterv|Second[ao][\s\xa0]*R|4\.?[\s\xa0]*Mbreterv|Zweite[\s\xa0]*Konig|Zweite[\s\xa0]*Koenig|2(?:[\s\xa0]*(?:(?:[ei]\.?[\s\xa0]*Mb|Mb)reterv|Koe?nig)|\.[\s\xa0]*(?:Mbreterv|Koe?nig)))e|(?:II\.?[\s\xa0]*W|2\.?[\s\xa0]*W)afalme|Pili[\s\xa0]*Wafalme|2(?:[\s\xa0]*(?:R(?:ey|y)?|Ha|Mb|Bren|K(?:ung?|r))|nd(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)|[\s\xa0]*Kong?|\.[\s\xa0]*Kong?)|And(?:en|re)[\s\xa0]*Kong|Second[\s\xa0]*Ki?|2\.[\s\xa0]*Reg|2\.?[\s\xa0]*Wa|2[\s\xa0]*Imp|2\.[\s\xa0]*Imp|2[\s\xa0]*Boq|2\.[\s\xa0]*Boq|2\.[\s\xa0]*Kr|2\.?[\s\xa0]*Kg|2\.?[\s\xa0]*Kng?|Masodik[\s\xa0]*Kir|2\.?[\s\xa0]*Ki(?:ng?|g|r)?|II(?:\.[\s\xa0]*(?:K(?:i(?:ng?|g|r)?|[gr]|ng?)|Reg?|Wa|Imp|Boq)|[\s\xa0]*(?:K(?:in?|n|o)?|Reg?|Wa|Imp|Boq))|II\.[\s\xa0]*Kon?|2e\.?[\s\xa0]*Kon?|Tweede[\s\xa0]*Kon?|Druh(?:a[\s\xa0]*Kr(?:al)?|y[\s\xa0]*Kr(?:al)?)|(?:(?:2(?:\.?[\s\xa0]*Para|\.)|II\.?[\s\xa0]*Para)[\s\xa0]*Raj|(?:II\.?[\s\xa0]*V|2\.?[\s\xa0]*V)u|2\.[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|II\.[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|Toinen[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|(?:(?:IV\.?|4\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?|Czwarta[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Krolewsk|(?:2\.?|II\.)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolewsk|D(?:ru(?:g(?:a[\s\xa0]*(?:K(?:(?:s(?:ieg[ai]|\.)?[\s\xa0]*K)?rolewsk|raljevim)|knjiga[\s\xa0]*o[\s\xa0]*Kraljevim)|i[\s\xa0]*K(?:s(?:ieg[ai]|\.)?[\s\xa0]*K)?rolewsk)|hy[\s\xa0]*kniha[\s\xa0]*kralovsk)|ezyem[\s\xa0]*W))a|K(?:i(?:tabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Wafalme|ralyok[\s\xa0]*II)|awotu[\s\xa0]*Maxaafaa[\s\xa0]*Naa77anttuwaa))|(?:II[\s\xa0]*(?:Kuninkaiden|Regum)|2[\s\xa0]*Kuninkaiden|(?:II|2)\.[\s\xa0]*Kuninkaiden|Toinen[\s\xa0]*Kuninkaiden))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:(?:st(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)g|[\s\xa0]*R(?:ey?|y)e)s|[\s\xa0]*Reg(?:um|i)|st(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)ng?s|[\s\xa0]*Ki(?:(?:ng?|g)s|ralyok)|\.[\s\xa0]*Ki(?:(?:ng?|g)s|ralyok))|(?:First[\s\xa0]*Ki?|I[\s\xa0]*K)gs|I[\s\xa0]*Koningen|(?:First[\s\xa0]*Ki?|I[\s\xa0]*K)ng?s|I[\s\xa0]*Ki(?:(?:ng?|g)s|ralyok))|(?:(?:1(?:st[\s\xa0]*Ki?|\.?[\s\xa0]*Ki|st\.[\s\xa0]*Ki?)|First[\s\xa0]*Ki?)ng)|(?:(?:(?:I(?:[\s\xa0]*K(?:s(?:ieg[ai]|\.)?[\s\xa0]*K)?|\.[\s\xa0]*K)rolew|(?:(?:Prvni|I\.)[\s\xa0]*K|I\.?[\s\xa0]*kniha[\s\xa0]*k)ralov)sk|I\.[\s\xa0]*Kraljevim|I[\s\xa0]*Kral(?:jevim|ovsk))a|I[\s\xa0]*Kr(?:al(?:ov)?)?|I[\s\xa0]*Kuninkaiden[\s\xa0]*kirja|1(?:[\s\xa0]*(?:K(?:r(?:(?:al(?:jevim|ovsk)|olewsk)a|al(?:ov)?)|uninkaiden[\s\xa0]*kirja)|(?:kniha[\s\xa0]*kralovsk|Raj)a)|\.[\s\xa0]*(?:(?:(?:kniha[\s\xa0]*k|K)ralov|Krolew)sk|Kraljevim)a))|(?:1(?:st(?:\.[\s\xa0]*K(?:[gns]|i[gn])|[\s\xa0]*K(?:[gns]|i[gn]))|[\s\xa0]*(?:R(?:e(?:[egs]|y[es])|y[es]|s)|Krl)|[\s\xa0]*Ki[gnr]|[\s\xa0]*Kongebo[gk]|\.[\s\xa0]*K(?:ongebo[gk]|i[gnr]))|First[\s\xa0]*K(?:[gns]|i[gn])|1\.[\s\xa0]*Regi|Boqorradii[\s\xa0]*Kowaad|1[\s\xa0]*Breninoedd|1[\s\xa0]*Brenhinoedd|1\.[\s\xa0]*Brenh?inoedd|1\.?[\s\xa0]*Kgs|1\.?[\s\xa0]*Kng?s|1\.[\s\xa0]*Regum|Liber[\s\xa0]*I[\s\xa0]*Regum|3\.?[\s\xa0]*Reg(?:norum|i)|1(?:[\s\xa0]*(?:Imparat|Har)|\.[\s\xa0]*Imparat|[\s\xa0]*Boqorradi|\.[\s\xa0]*Boqorradi)i|(?:Una(?:ng)?|1\.)[\s\xa0]*Hari|(?:1\.?[\s\xa0]*M|3\.?[\s\xa0]*M)ga[\s\xa0]*Hari|Una(?:ng)?[\s\xa0]*Mga[\s\xa0]*Hari|I(?:[\s\xa0]*(?:K(?:i(?:[gr]|ng)|on|g|ng)|Regi|Brenh?inoedd)|\.[\s\xa0]*(?:K(?:i(?:ng?|g)|ng?|g)s|Brenh?inoedd|Regi)|\.[\s\xa0]*Regum|(?:\.[\s\xa0]*(?:Boqorradi|Imparat)|[\s\xa0]*(?:Boqorradi|Imparat))i|\.?[\s\xa0]*Hari|(?:katlong|\.)?[\s\xa0]*Mga[\s\xa0]*Hari|II(?:\.[\s\xa0]*(?:Reg(?:norum|i)|Mga[\s\xa0]*Hari)|[\s\xa0]*(?:Reg(?:norum|i)|Mga[\s\xa0]*Hari)))|3\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|Tredje[\s\xa0]*Kongerigernes[\s\xa0]*Bog|I[\s\xa0]*a[\s\xa0]*Imparatilor|Cartea[\s\xa0]*(?:a[\s\xa0]*treia|III)[\s\xa0]*a[\s\xa0]*Regilor|(?:1(?:o\.?[\s\xa0]*Rei|Kg|[\s\xa0]*Rei|\.[\s\xa0]*Rei)|I\.?[\s\xa0]*Rei|(?:III\.?|3\.?)[\s\xa0]*Kingdom|3rd[\s\xa0]*Kingdom|3rd\.[\s\xa0]*Kingdom|(?:III\.?[\s\xa0]*R|3\.?[\s\xa0]*R)eino|3[ao][\s\xa0]*Reino|3[ao]\.[\s\xa0]*Reino|T(?:erceir[ao][\s\xa0]*Reino|hird[\s\xa0]*Kingdom)|(?:1(?:o\.?|\.)|I\.?)[\s\xa0]*Reye|1\.o[\s\xa0]*Reye|1\.o\.[\s\xa0]*Reye)s|(?:(?:1\.?|I\.?)[\s\xa0]*Ro|1a[\s\xa0]*Re|1a\.[\s\xa0]*Re)is|1(?:ere?|re)[\s\xa0]*Rois|1(?:ere?|re)\.[\s\xa0]*Rois|(?:I(?:\.[\s\xa0]*(?:Kralo|Cari)|[\s\xa0]*Cari)|1(?:\.[\s\xa0]*Kralo|\.?[\s\xa0]*Cari))v|(?:III\.?|3\.?)[\s\xa0]*Kralov|Tretia[\s\xa0]*Kralov|(?:[13][\s\xa0]*k|Treti)[\s\xa0]*Kralov|[13][\s\xa0]*k\.[\s\xa0]*Kralov|Tretia[\s\xa0]*kniha[\s\xa0]*Kralov|(?:I[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolo|1[\s\xa0]*Ka)w|(?:1\.?|I\.)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolow|P(?:r(?:em(?:ier(?:es?|s)?[\s\xa0]*Rois|ye[\s\xa0]*liv[\s\xa0]*Wa[\s\xa0]*yo)|ime(?:ir[ao][\s\xa0]*Rei|ro?[\s\xa0]*Reye)s|v(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?)Kralov)|ierwsz[aey][\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolow)|(?:Prvni[\s\xa0]*Kra|1[\s\xa0]*Kro)l|(?:1(?:[\s\xa0]*(?:Irajakk|F)|\.[\s\xa0]*F)|I\.?[\s\xa0]*F)al|(?:Wafalme|Regum)[\s\xa0]*I|K(?:iralyok[\s\xa0]*I|wanza[\s\xa0]*Fal)|(?:1(?:[\s\xa0]*(?:(?:[ei]\.?[\s\xa0]*Mb|Mb)reterv|Konig)|\.[\s\xa0]*(?:Mbreterv|Konig))|3(?:[\s\xa0]*[ei]\.?[\s\xa0]*Mb|\.?[\s\xa0]*Mb)reterv|Prim[ao][\s\xa0]*R|(?:1\.?[\s\xa0]*W|I\.?[\s\xa0]*W)afalm|K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*ch|wanz)a[\s\xa0]*Wafalm)e|1\.?[\s\xa0]*Koenige|Fyrri[\s\xa0]*Konungabok|I\.[\s\xa0]*Kiralyok|(?:1(?:\.[\s\xa0]*K(?:on)?|[\s\xa0]*K(?:on)?)u|Forsta[\s\xa0]*K(?:on)?u)ngaboken|1\.?[\s\xa0]*Koningen|I\.[\s\xa0]*Koningen|1e[\s\xa0]*Koningen|1e\.[\s\xa0]*Koningen|1(?:[\s\xa0]*(?:R(?:ey|y)?|Ha|Mb|Bren|K(?:ung?|r))|st(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)|[\s\xa0]*Ki|[\s\xa0]*Kong?|\.[\s\xa0]*K(?:ong?|i))|First[\s\xa0]*Ki?|1\.[\s\xa0]*Reg|1\.?[\s\xa0]*Wa|1[\s\xa0]*Imp|1\.[\s\xa0]*Imp|1[\s\xa0]*Boq|1\.[\s\xa0]*Boq|1\.[\s\xa0]*Kr(?:al)?|1\.?[\s\xa0]*Kg|1\.?[\s\xa0]*Kng?|I(?:\.[\s\xa0]*(?:K(?:r(?:al)?|g|ng?|i(?:ng?|g))|Reg?|Wa|Imp|Boq)|[\s\xa0]*(?:K(?:n|o|in)?|Reg?|Wa|Imp|Boq))|Prvni[\s\xa0]*Kr|I\.[\s\xa0]*Kir|I\.[\s\xa0]*Kon?|1e[\s\xa0]*Kon?|1e\.[\s\xa0]*Kon?|(?:(?:Trzeci(?:a[\s\xa0]*Ks(?:ieg[ai]|\.)?|[\s\xa0]*Ks(?:ieg[ai]|\.)?)|(?:III\.?|3\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Krolewsk|Fyrri[\s\xa0]*bok[\s\xa0]*konungann|1\.?[\s\xa0]*Vu|I\.?[\s\xa0]*Vu|(?:1\.?|I\.)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Krolewsk|P(?:r(?:va[\s\xa0]*(?:knjiga[\s\xa0]*o[\s\xa0]*)?Kraljevim|emye[\s\xa0]*W|vni[\s\xa0]*kniha[\s\xa0]*kralovsk)|ierwsz[aey][\s\xa0]*K(?:s(?:ieg[ai]|\.)?[\s\xa0]*K)?rolewsk)|Kawotu[\s\xa0]*Maxaafaa[\s\xa0]*Koiruwa)a|(?:1(?:\.?[\s\xa0]*Para|\.)|I\.?[\s\xa0]*Para)[\s\xa0]*Raja|1\.[\s\xa0]*Kuninkaiden[\s\xa0]*kirja|I\.[\s\xa0]*Kuninkaiden[\s\xa0]*kirja|E(?:rste[\s\xa0]*Koe?nige|lso[\s\xa0]*Kiralyok|erste[\s\xa0]*Koningen|erste[\s\xa0]*Kon?|lso[\s\xa0]*Kir|nsimmainen[\s\xa0]*Kuninkaiden[\s\xa0]*kirja))|(?:K(?:in|n)?gs|I[\s\xa0]*Regum|Kin|I[\s\xa0]*Kuninkaiden|1[\s\xa0]*Kuninkaiden|[1I]\.[\s\xa0]*Kuninkaiden|Ensimmainen[\s\xa0]*Kuninkaiden))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["EpJer"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jeremi(?:jino[\\s\\xa0]*pismo|asov[\\s\\xa0]*list|as(?:['’][\\s\\xa0]*B|[\\s\\xa0]*b)rev)|List[\\s\\xa0]*Jeremjasuv|Jer[\\s\\xa0]*?br|(?:(?:Cart|Br)[\\s\\xa0]*J|Or\\.?[\\s\\xa0]*I|BJ|Cart\\.[\\s\\xa0]*J|L(?:i(?:[\\s\\xa0]*ni|h)[\\s\\xa0]*J|et\\-?g))er|(?:Jeremia(?:s[\\s\\xa0]*level|n[\\s\\xa0]*kirj)|Oratio[\\s\\xa0]*Ieremia)e|Ep(?:i(?:stle[\\s\\xa0]*of[\\s\\xa0]*Jeremy|tre[\\s\\xa0]*de[\\s\\xa0]*Jeremie)|\\.?[\\s\\xa0]*Jeremie|Jer)|Carta[\\s\\xa0]*Jeremias|La[\\s\\xa0]*Carta[\\s\\xa0]*de[\\s\\xa0]*Jeremias|Ang[\\s\\xa0]*Liham[\\s\\xa0]*ni[\\s\\xa0]*Jeremias|(?:(?:B(?:r(?:ief[\\s\\xa0]*(?:des|van)|ef)[\\s\\xa0]*J|arua[\\s\\xa0]*ya[\\s\\xa0]*Y)|Lettera[\\s\\xa0]*di[\\s\\xa0]*G)eremi|L(?:lythyr[\\s\\xa0]*Jeremei|ist[\\s\\xa0]*Jeremiasz)|Epistola[\\s\\xa0]*lui[\\s\\xa0]*Ieremi)a|Pismo[\\s\\xa0]*Jeremije[\\s\\xa0]*proroka|(?:Carta|Ep\\.?)[\\s\\xa0]*Jer|The[\\s\\xa0]*(?:Ep(?:istle|\\.)?|Let(?:ter|\\.)?)[\\s\\xa0]*of[\\s\\xa0]*Jeremiah)|(?:(?:Carta[\\s\\xa0]*de|Liham[\\s\\xa0]*ni)[\\s\\xa0]*Jeremias|Let[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|Let(?:ter|\\.)[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|Ep(?:istle|\\.)?[\\s\\xa0]*of[\\s\\xa0]*Jeremiah))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lam"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Siralmak|Hlj|Omb|yarmiyako[\\s\\xa0]*vilap|Tuz|ErmZ|Jeremiasov[\\s\\xa0]*Plac|(?:V(?:a(?:litusvirr|jtim)|ilapage)e|wilapgi)t|K(?:idung[\\s\\xa0]*Pasambat|niha[\\s\\xa0]*narku)|(?:Zalospev|Narek)y|Aklat[\\s\\xa0]*ng[\\s\\xa0]*Pa(?:nan|gt)aghoy|Mga[\\s\\xa0]*Panaghoy|(?:Mga[\\s\\xa0]*Pagbangota|Klaagliedere)n|Mga[\\s\\xa0]*Lamentasyon|(?:Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Lamentacj|Jeremias[\\s\\xa0]*siralma)i|(?:Jeremijine[\\s\\xa0]*tuzaljk|Klagesangen)e|Klagelieder[\\s\\xa0]*Jeremias|L(?:am(?:enta(?:c(?:oes[\\s\\xa0]*de[\\s\\xa0]*Jeremias|i(?:ones|je))|tions[\\s\\xa0]*de[\\s\\xa0]*Jeremie|zioni|tiones)|intations|antasyon|intaciones)|m)|Kidung[\\s\\xa0]*Pangadhuh|Galarnad[\\s\\xa0]*Jeremiah|Baroorashadii[\\s\\xa0]*Yeremyaah|Klgl|K(?:niha|\\.)?[\\s\\xa0]*narekov|(?:Ermmaasa[\\s\\xa0]*Zilaassa|Ai[\\s\\xa0]*C|Klagovisorn|Treny[\\s\\xa0]*Jeremiasz|Lamentacje[\\s\\xa0]*Jeremiasz)a|Maombolezo[\\s\\xa0]*ya[\\s\\xa0]*Yeremia|P(?:la(?:c[\\s\\xa0]*Jerem(?:i(?:as[ou]v|i)|jasuv)|ngerile[\\s\\xa0]*(?:profetu)?lui[\\s\\xa0]*Ieremia)|ulampal|anag)|Siralm?|Nar|Zalosp|Va(?:lit|j)|Tr|Galar|Jeremias[\\s\\xa0]*sir|Kl(?:a(?:g(?:es)?|agl))?|Mao|Lam(?:enta(?:cione|tion)|intacione|intation)?|Baroor|Pl(?:ang(?:eri)?)?|Chante[\\s\\xa0]*pou[\\s\\xa0]*plenn[\\s\\xa0]*So[\\s\\xa0]*lavil[\\s\\xa0]*Jerizalem)|(?:P(?:a(?:gbangotan|naghoy)|l(?:enn|ac))|Maombolezo|Galarnad|Treny|Klagelieder|Tuzaljke|Lamenta(?:c(?:oes|je)|tions)|Baroorashadii))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Num"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:4(?:[\s\xa0]*Mo(?:j(?:z(?:eszow|isov)a|z)?|oseksen[\s\xa0]*kirja)|\.[\s\xa0]*Mo(?:jz(?:(?:eszow|isov)a)?|oseksen[\s\xa0]*kirja))|IV(?:(?:\.[\s\xa0]*Mojz(?:eszow|isov)|[\s\xa0]*Mojz(?:eszow|isov))a|[\s\xa0]*Mojz))|(?:B(?:[ae]midbar|il)|Hesabu|Qod|Ennakamam|Blg|M(?:ga[\s\xa0]*(?:Numeros|Bilang)|ozes[\s\xa0]*IV)|Lb|Fjerde[\s\xa0]*Mosebo[gk]|(?:liv[\s\xa0]*Resansman[\s\xa0]*|Wilang)an|Fjarde[\s\xa0]*Moseboken|Ginatee|Vierte[\s\xa0]*Mose|Vierte[\s\xa0]*Buch[\s\xa0]*Mose|4(?:[\s\xa0]*(?:M(?:osebo(?:ken|g)|z)|Buch[\s\xa0]*Mose)|\.[\s\xa0]*(?:Mosebo(?:ken|g)|Buch[\s\xa0]*Mose))|IV(?:\.[\s\xa0]*Mojz|[\s\xa0]*Moj)|(?:gantiko[\s\xa0]*pusta|IV\.?[\s\xa0]*Mosebo)k|Szamok|(?:Liber[\s\xa0]*Numer|Brojev)i|Tirintii|4[\s\xa0]*Mo(?:ze|o)s|(?:Vierde[\s\xa0]*Moz|R|4\.[\s\xa0]*Moz|IV\.?[\s\xa0]*Moz)es|N(?:um(?:erii|rat|ber[is])|[bm]|ombres)|Nonb|Ks(?:ieg[ai]|\.)?[\s\xa0]*Liczb|4(?:[\s\xa0]*Mo(?:s(?:e(?:bok)?)?|z)?|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|Mga[\s\xa0]*Numero|Tir|Fjerde[\s\xa0]*Mos|Fjarde[\s\xa0]*Mosebok|IV\.?[\s\xa0]*Mos|Szam|N(?:u(?:m(?:b(?:er)?)?)?|o(?:mb?)?)|(?:IV\.?[\s\xa0]*Mooseksen[\s\xa0]*kirj|Qoodaaba|ganan|Neljas[\s\xa0]*Mooseksen[\s\xa0]*kirj|Kitabu[\s\xa0]*cha[\s\xa0]*Nne[\s\xa0]*cha[\s\xa0]*Mus|Knjiga[\s\xa0]*Brojev|4[\s\xa0]*k[\s\xa0]*Mojzisov|4[\s\xa0]*k\.[\s\xa0]*Mojzisov|4[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:IV\.?|4\.)[\s\xa0]*kniha[\s\xa0]*Mojzisov|Stvrta[\s\xa0]*(?:kniha[\s\xa0]*)?Mojzisov)a|(?:IV\.?|4\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszowa|C(?:zwarta[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*Mojzeszowa|Mojz(?:eszowa)?)|(?:tvrta[\s\xa0]*(?:kniha[\s\xa0]*)?Mojzisov|ysl)a))|(?:gantiko|Liczb|Resansman|(?:IV|4)[\s\xa0]*Mooseksen|(?:IV|4)\.[\s\xa0]*Mooseksen|N(?:eljas[\s\xa0]*Mooseksen|umer(?:os|i|o))))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Sus"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:S(?:u(?:s(?:ann(?:a(?:[\\s\\xa0]*(?:i(?:[\\s\\xa0]*badet|m[\\s\\xa0]*Bade)|ja[\\s\\xa0]*vanhimmat)|h|[\\s\\xa0]*und[\\s\\xa0]*die[\\s\\xa0]*Alten)|e[\\s\\xa0]*(?:et[\\s\\xa0]*les[\\s\\xa0]*(?:deux[\\s\\xa0]*)?vieillards|au[\\s\\xa0]*bain)))?|zanne[\\s\\xa0]*(?:et[\\s\\xa0]*les[\\s\\xa0]*(?:deux[\\s\\xa0]*)?vieillards|au[\\s\\xa0]*bain)|zana|z)?|(?:(?:i[\\s\\xa0]*Sus|hosh)a|wsan|toria[\\s\\xa0]*di[\\s\\xa0]*Susan)na)|Z(?:suzsanna[\\s\\xa0]*es[\\s\\xa0]*a[\\s\\xa0]*venek|uzan[ae])|Istoria[\\s\\xa0]*Susanei|Zuzanna|Historia[\\s\\xa0]*de[\\s\\xa0]*Susana|Fortellingen[\\s\\xa0]*om[\\s\\xa0]*Susanna|(?:Opowiadaniem[\\s\\xa0]*o[\\s\\xa0]*Zuzanni|Historia[\\s\\xa0]*Susanna)e|Z(?:suzs?|uz))|(?:Su(?:san(?:ei|a|na?e)|zanne|sanna)|Zsuzsanna))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Sir"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:E(?:k(?:l(?:es[iy]astiko|ezjastyka|i)|kles[iy]astiko)|c(?:c(?:lesiastic(?:ul|o)|s)|lesiastico))|YbS|Ekkleziastik|Ecclesiastique|S(?:ira(?:k(?:s(?:[\\s\\xa0]*(?:Bog|bok)|bok)|id[ae]s)|cidas)|yrak|irak[\\s\\xa0]*bolcsessege|apienza[\\s\\xa0]*di[\\s\\xa0]*Sirac(?:ide|h))|Jesus[\\s\\xa0]*Syraks[\\s\\xa0]*vishet|(?:Ek(?:kles[iy]|les[iy])astiku|Siracide)s|(?:Liber[\\s\\xa0]*Eccle|Ecclu)siasticus|(?:Madrosc[\\s\\xa0]*Syrach|Sirak[\\s\\xa0]*fi|Sirakin[\\s\\xa0]*kirj|Jee?sus[\\s\\xa0]*Siirakin[\\s\\xa0]*kirj|Yoshua[\\s\\xa0]*bin[\\s\\xa0]*Sir|La[\\s\\xa0]*Sagesse[\\s\\xa0]*de[\\s\\xa0]*Ben[\\s\\xa0]*Sir)a|K(?:\\.[\\s\\xa0]*(?:Sirachov(?:c(?:ov)?|ho[\\s\\xa0]*syn)a|Ekleziastikus)|[\\s\\xa0]*(?:Sirachov(?:c(?:ov)?|ho[\\s\\xa0]*syn)a|Ekleziastikus)|n(?:iha[\\s\\xa0]*(?:Sirachov(?:c(?:ov)?|ho[\\s\\xa0]*syn)a|Ekleziastikus)|jiga[\\s\\xa0]*Sirahova))|(?:Ecleziasti|Sirachove)c|Karunungan[\\s\\xa0]*ng[\\s\\xa0]*Anak[\\s\\xa0]*ni[\\s\\xa0]*Sirac|Ang[\\s\\xa0]*Karunungan[\\s\\xa0]*ni[\\s\\xa0]*Jesus,?[\\s\\xa0]*Anak[\\s\\xa0]*ni[\\s\\xa0]*Sirac|S(?:i(?:r(?:a(?:kid[ae]|cida))?)?|yr)|E(?:klezjastyk|cclus)|(?:(?:Wijsheid[\\s\\xa0]*van[\\s\\xa0]*Jezus|Oratio[\\s\\xa0]*Iesu[\\s\\xa0]*filii|Wijsheid[\\s\\xa0]*van[\\s\\xa0]*(?:Jozua[\\s\\xa0]*)?Ben)[\\s\\xa0]*Sirac|Kitab[\\s\\xa0]*Yesus[\\s\\xa0]*bin[\\s\\xa0]*Sirak|Jesus[\\s\\xa0]*Sirac|The[\\s\\xa0]*Wisdom[\\s\\xa0]*of[\\s\\xa0]*Jesus(?:[\\s\\xa0]*(?:Son[\\s\\xa0]*of|ben)|,[\\s\\xa0]*Son[\\s\\xa0]*of)[\\s\\xa0]*Sirac)h|Cartea[\\s\\xa0]*intelepciunii[\\s\\xa0]*lui[\\s\\xa0]*Isus,[\\s\\xa0]*fiul[\\s\\xa0]*lui[\\s\\xa0]*Sirah)|(?:S(?:(?:i(?:irakin[\\s\\xa0]*kirj|rachovcov)|yrach)a|ira(?:k(?:in|h)|cide)|agesse[\\s\\xa0]*de[\\s\\xa0]*Ben[\\s\\xa0]*Sira)|Ecclesiasticus|Ben[\\s\\xa0]*Sira|Si(?:ra(?:ch?|k)?|irakin)|Jezus[\\s\\xa0]*Sirach|Wisdom[\\s\\xa0]*of[\\s\\xa0]*Jesus(?:[\\s\\xa0]*(?:Son[\\s\\xa0]*of|ben)|,[\\s\\xa0]*Son[\\s\\xa0]*of)[\\s\\xa0]*Sirach))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrMan"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:The[\\s\\xa0]*Pr(?:ayer(?:s[\\s\\xa0]*(?:of[\\s\\xa0]*)?|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)Manasseh|Gebet[\\s\\xa0]*Manasses|Man[\\s\\xa0]*ru|Prece[\\s\\xa0]*de[\\s\\xa0]*Manasses|La[\\s\\xa0]*Oracion[\\s\\xa0]*de[\\s\\xa0]*Manases|Dasal[\\s\\xa0]*ni[\\s\\xa0]*Manases|Dalangin[\\s\\xa0]*ni[\\s\\xa0]*Manases|Ang[\\s\\xa0]*Panalangin[\\s\\xa0]*ni[\\s\\xa0]*Manases|(?:Manasse(?:(?:s’?[\\s\\xa0]*b|[\\s\\xa0]*b)o|n[\\s\\xa0]*rukoukse)|BM)n|PrMan|Geb[\\s\\xa0]*Man|(?:(?:(?:Gebet[\\s\\xa0]*des|Modlitbu|Gweddi|Preghiera[\\s\\xa0]*di)[\\s\\xa0]*Mana|Pr\\.?[\\s\\xa0]*Mana|La[\\s\\xa0]*Priere[\\s\\xa0]*de[\\s\\xa0]*Mana)s|Rugaciunea[\\s\\xa0]*(?:rege)?lui[\\s\\xa0]*Mana)se|Gebet[\\s\\xa0]*Manasse|Pr\\.?[\\s\\xa0]*Man|M(?:anas(?:s(?:e[\\s\\xa0]*imadsag|ze[\\s\\xa0]*imaj)|esova[\\s\\xa0]*modlitb)|odlitwa[\\s\\xa0]*Manasses)a|Or(?:a(?:zione[\\s\\xa0]*di[\\s\\xa0]*Manasse[\\s\\xa0]*Re[\\s\\xa0]*di[\\s\\xa0]*Giuda|tio[\\s\\xa0]*(?:regis[\\s\\xa0]*)?Manassae)|\\.?[\\s\\xa0]*Man))|(?:P(?:r(?:ayer(?:s[\\s\\xa0]*(?:of[\\s\\xa0]*)?|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)Manasseh|[\\s\\xa0]*(?:of[\\s\\xa0]*)?Manasseh|iere[\\s\\xa0]*de[\\s\\xa0]*Manasse)|analangin[\\s\\xa0]*ni[\\s\\xa0]*Manases)|(?:Orazione[\\s\\xa0]*di[\\s\\xa0]*Manass|Manass?)e|Man|Oracion[\\s\\xa0]*de[\\s\\xa0]*Manases))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Acts"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Fa(?:p(?:te(?:le)?[\\s\\xa0]*Apostolilor|t)?|l(?:imaha[\\s\\xa0]*Rasuullada)?))|(?:A(?:p(?:ost(?:lenes[\\s\\xa0]*(?:gj|G)erninger|olien[\\s\\xa0]*teot)|\\.(?:[Gt]|[\\s\\xa0]*t)|[Gt]|[\\s\\xa0]*t)|ct(?:us[\\s\\xa0]*Apostolorum|sss)|kdezapot|(?:tti[\\s\\xa0]*degli[\\s\\xa0]*Apostol|ppostalar[\\s\\xa0]*Pan)i|z[\\s\\xa0]*apostolok[\\s\\xa0]*cselekedetei)|Cselekedetek|F\\.?A|Osu|Skutky[\\s\\xa0]*apostolu|Gw|(?:Praeriton[\\s\\xa0]*Ke[\\s\\xa0]*K|preritharuka[\\s\\xa0]*k)am|F\\.?[\\s\\xa0]*Ap|Skutky[\\s\\xa0]*apostolov|D(?:z(?:iejach[\\s\\xa0]*Apostolskich|[\\s\\xa0]*Ap)|ijannja[\\s\\xa0]*svjatyh[\\s\\xa0]*apostoliv)|A(?:p\\.?[\\s\\xa0]*C|z[\\s\\xa0]*ApC)sel|Lelakone[\\s\\xa0]*Para[\\s\\xa0]*Rasul|He?ch|(?:Apostlagarningarn|Djela[\\s\\xa0]*apostolsk)a|Yesuusi[\\s\\xa0]*Kiittidoogeetu[\\s\\xa0]*Oosuwaa|(?:A(?:ctau['’]r[\\s\\xa0]*Apostolio|ng[\\s\\xa0]*Mga[\\s\\xa0]*Binuhata)|Postulasaga|Bi|Handelingen[\\s\\xa0]*(?:van[\\s\\xa0]*de|der)[\\s\\xa0]*apostele)n|Hnd|(?:A(?:tos[\\s\\xa0]*dos[\\s\\xa0]*Apostolo|ctes[\\s\\xa0]*des[\\s\\xa0]*Apotre)|The[\\s\\xa0]*Acts[\\s\\xa0]*of[\\s\\xa0]*the[\\s\\xa0]*Apostle|(?:Buhat[\\s\\xa0]*sa[\\s\\xa0]*mga|Gawa[\\s\\xa0]*ng)[\\s\\xa0]*Apostole|Los[\\s\\xa0]*Hechos[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Apostole)s|(?:Apost(?:elg(?:jerningen|eschicht)|lenes\\-?gjerning)|Veprat[\\s\\xa0]*e[\\s\\xa0]*Apostujv|Skutky[\\s\\xa0]*apostolsk|Dzieje[\\s\\xa0]*Apostolski)e|A(?:c(?:t(?:ss|a)?)?|t)|Vep|Sk|D(?:zieje[\\s\\xa0]*Apost|j)|H(?:and|e?c)|(?:Aksyon|Travay)[\\s\\xa0]*apot[\\s\\xa0]*yo|Ebanghelyo[\\s\\xa0]*ng[\\s\\xa0]*Espiritu[\\s\\xa0]*Santo|M(?:a(?:buting[\\s\\xa0]*Balita[\\s\\xa0]*(?:ayon[\\s\\xa0]*sa|ng)[\\s\\xa0]*Espiritu[\\s\\xa0]*Santo|tendo[\\s\\xa0]*ya[\\s\\xa0]*Mitume)|ga[\\s\\xa0]*Gawa(?:[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*A(?:postoles|lagad)|in|[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*Apostol)|do))|(?:Acts[\\s\\xa0]*of[\\s\\xa0]*the[\\s\\xa0]*Apostles)|(?:T(?:ravay|eot)|Skutky|M(?:ga[\\s\\xa0]*Gawa|atendo)|(?:Faptel|Dziej)e|Veprat[\\s\\xa0]*e[\\s\\xa0]*apostujve|Gerninger|(?:Gawa[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*Aposto|Para[\\s\\xa0]*Rasu)l|A(?:p(?:ostolok[\\s\\xa0]*cselekedetei|Csel|g)|ct(?:au|s)|tti)|Binuhatan|Fapte|Dz|(?:A(?:ct[eu]|to)|Los[\\s\\xa0]*Hecho)s|H(?:echos[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Apostoles|andelingen))|(?:Hechos|Gawa|Veprat|Apostolok))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Johannesapokalypsen|Muujintii)|(?:R(?:ev(?:[ao]|e)?lations|v)|Datguddiad|Muuj|Ufunuo[\\s\\xa0]*wa[\\s\\xa0]*Yohan[ae]|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Apokalipsy|itab[\\s\\xa0]*Wahyu)|Rivelazione|J(?:ohannes[\\s\\xa0]*Uppenbarelse|elenesek)|Zjv|Velippatuttina[\\s\\xa0]*Vicetankal|Gipadayag|Joh(?:annes['’][\\s\\xa0]*(?:Ab|ap)|s\\.?[\\s\\xa0]*Ab)enbaring|O(?:p(?:inberun(?:arbok)?[\\s\\xa0]*Johannesar|b)|ff(?:enbarung|b))|(?:Johanne(?:ksen[\\s\\xa0]*ilmesty|s[\\s\\xa0]*apokalyp)|Openbaring[\\s\\xa0]*van[\\s\\xa0]*Johanne)s|El[\\s\\xa0]*Apocalipsis|(?:Prakashaitavaky|Ilmestyskirj|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Objawieni|Zbules|Ob['’]javlennja[\\s\\xa0]*Ivana[\\s\\xa0]*Bohoslov)a|(?:Ufunua[\\s\\xa0]*wa[\\s\\xa0]*Yoh|Zjavenie[\\s\\xa0]*J|Objawienie[\\s\\xa0]*J)ana|Objawienie[\\s\\xa0]*sw[\\s\\xa0]*Jana|(?:Zjavenie[\\s\\xa0]*Apostola|Objawienie[\\s\\xa0]*sw\\.)[\\s\\xa0]*Jana|Zj(?:avenie|eveni)[\\s\\xa0]*svateho[\\s\\xa0]*Jana|(?:Otkrivenje[\\s\\xa0]*Iv|Zjeveni[\\s\\xa0]*J)anovo|(?:Op(?:inberunarboki|enbaringe)|Re[bv]elasyo|Uppenbarelseboke)n|(?:(?:prakatik|Pamed)ar|Pahayag[\\s\\xa0]*kay[\\s\\xa0]*Ju)an|R(?:ev(?:elation|el|lation|[ao]lation)?|iv)|Dat(?:gudd)?|Ilm|Pah|U(?:fu?|pp)|Jel|Z(?:j(?:av)?|bu?)|O(?:p(?:enb)?|tk|bj)|(?:Janos[\\s\\xa0]*jelenese|Kniha[\\s\\xa0]*Zjeven)i|A(?:p(?:o(?:c(?:al(?:i(?:ps(?:(?:a[\\s\\xa0]*lui[\\s\\xa0]*Io|is[\\s\\xa0]*ni[\\s\\xa0]*Ju)an|e[\\s\\xa0]*de[\\s\\xa0]*(?:Sao[\\s\\xa0]*)?Joao)|sse[\\s\\xa0]*di[\\s\\xa0]*Giovanni)|yps(?:is[\\s\\xa0]*Ioannis[\\s\\xa0]*Apostoli|e[\\s\\xa0]*de[\\s\\xa0]*Jean)?))?|kal(?:ips(?:a[\\s\\xa0]*(?:Swietego|sw\\.?)[\\s\\xa0]*Jana|zis)|ypsa|ypsen|ipsis[\\s\\xa0]*ni[\\s\\xa0]*Juan)|k(?:alips)?)?|enbaring(?:sbok)?en|[ck])?|(?:benbaringsbo|abenbarin|benbarin)gen|j(?:juutaa|u)))|(?:Ufunuo|Wahyu|Zjeveni|Velippatuttina|Pahayag|Openbaring|(?:O(?:bjawieni|tkrivenj)|Zjaveni)e|Ilmestys|Ap(?:o(?:cal(?:yps(?:is(?:[\\s\\xa0]*Ioannis)?|e)|i(?:ps[ae]|sse|psis))|kalips(?:is|a))|enbaring)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrAzar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Or(?:atio[\\s\\xa0]*Azariae|[\\s\\xa0]*Azar)|Sal[\\s\\xa0]*Azar|Or\\.[\\s\\xa0]*Azar|Pr(?:[\\s\\xa0]*Aza|Aza?|\\.[\\s\\xa0]*Aza)r|La[\\s\\xa0]*Priere[\\s\\xa0]*d['’]Azaria[hs]|The[\\s\\xa0]*Pr(?:ayers?)?[\\s\\xa0]*of[\\s\\xa0]*Azariah|(?:Gebe(?:d[\\s\\xa0]*van[\\s\\xa0]*Az|t[\\s\\xa0]*des[\\s\\xa0]*As)arj|Modlitwa[\\s\\xa0]*Azariasz|Piesn[\\s\\xa0]*Azariasz|Preghiera[\\s\\xa0]*di[\\s\\xa0]*Azari|Rugaciunea[\\s\\xa0]*lui[\\s\\xa0]*Azari)a|The[\\s\\xa0]*Pr(?:ayers?)?[\\s\\xa0]*of[\\s\\xa0]*Azaria|Or[\\s\\xa0]*Az|Geb[\\s\\xa0]*As|Gweddi[\\s\\xa0]*Asarias|(?:Oracion|Salmo|Cantico)[\\s\\xa0]*de[\\s\\xa0]*Azarias|A(?:zar(?:ias[\\s\\xa0]*ima(?:dsag|j)|jasova[\\s\\xa0]*modlitb)a|sar(?:ias’?[\\s\\xa0]*bon|[\\s\\xa0]*ru|jas’?[\\s\\xa0]*bon)|sarjan[\\s\\xa0]*rukous|ng[\\s\\xa0]*Panalangin[\\s\\xa0]*ni[\\s\\xa0]*Azarias))|(?:P(?:r(?:iere[\\s\\xa0]*d['’]Azaria[hs]|[\\s\\xa0]*of[\\s\\xa0]*Azariah|ayers?[\\s\\xa0]*of[\\s\\xa0]*Azariah|(?:ayers?)?[\\s\\xa0]*of[\\s\\xa0]*Azaria)|analangin[\\s\\xa0]*ni[\\s\\xa0]*Azarias)|Azaria[hs]?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["SgThree"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:S(?:\.[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))))|Wimbo[\s\xa0]*wa[\s\xa0]*Vijana[\s\xa0]*Watatu|Hymnus[\s\xa0]*trium[\s\xa0]*puerorum|Aw(?:it[\s\xa0]*ng[\s\xa0]*Tatlong[\s\xa0]*Kabataang[\s\xa0]*Banal|[\s\xa0]*ng[\s\xa0]*3[\s\xa0]*Kab)|(?:El[\s\xa0]*(?:Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi)|3[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi)|3[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi)))o|The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew))|Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew)))s|(?:(?:Pi(?:esen[\s\xa0]*mladencov[\s\xa0]*v[\s\xa0]*ohnivej|sen[\s\xa0]*mladencu[\s\xa0]*v[\s\xa0]*horici)|Tr(?:aja[\s\xa0]*mladenci[\s\xa0]*v[\s\xa0]*rozpalenej|i[\s\xa0]*muzi[\s\xa0]*v[\s\xa0]*rozpalene))[\s\xa0]*pec|3[\s\xa0]*tiner)i|(?:Harom[\s\xa0]*fiatalember[\s\xa0]*enek|S(?:g[\s\xa0]*?|ng[\s\xa0]*|ong[\s\xa0]*)Thre)e|C(?:an(?:t(?:i(?:co[\s\xa0]*d(?:ei[\s\xa0]*tre[\s\xa0]*(?:giovani[\s\xa0]*nella[\s\xa0]*fornace|fanciulli)|os[\s\xa0]*(?:Tres|3)[\s\xa0]*Jovens)|que[\s\xa0]*des[\s\xa0]*(?:Trois|3)[\s\xa0]*Enfants)|area[\s\xa0]*celor[\s\xa0]*trei[\s\xa0]*(?:tiner|evre)i)|[\s\xa0]*y[\s\xa0]*Tri[\s\xa0]*Ll?anc)|t[\s\xa0]*3[\s\xa0]*(?:Jo|E))|De[\s\xa0]*tre[\s\xa0]*m(?:annens[\s\xa0]*lov|enns[\s\xa0]*)sang|C3J|Gezang[\s\xa0]*der[\s\xa0]*drie[\s\xa0]*mannen[\s\xa0]*in[\s\xa0]*het[\s\xa0]*vuur|Awit[\s\xa0]*ng[\s\xa0]*(?:Tatlong[\s\xa0]*Banal[\s\xa0]*na|3)[\s\xa0]*Kabataan|The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))|Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))en|Der[\s\xa0]*Gesang[\s\xa0]*der[\s\xa0]*Drei[\s\xa0]*Manner[\s\xa0]*im[\s\xa0]*feurigen[\s\xa0]*Ofen|L(?:obgesang[\s\xa0]*der[\s\xa0]*(?:drei[\s\xa0]*jungen[\s\xa0]*Manner[\s\xa0]*im[\s\xa0]*Feuerofen|3[\s\xa0]*jungen[\s\xa0]*Manner)|ied[\s\xa0]*van[\s\xa0]*de[\s\xa0]*drie[\s\xa0]*jongemannen|3J)|Awit[\s\xa0]*ng[\s\xa0]*Tatlong[\s\xa0]*Kabataan|Sg[\s\xa0]*Thr|Awit[\s\xa0]*ng[\s\xa0]*Tatlong[\s\xa0]*Binata|Kolmen[\s\xa0]*(?:nuoren[\s\xa0]*miehen[\s\xa0]*ollessa[\s\xa0]*tulisessa[\s\xa0]*patsi|miehen[\s\xa0]*kiitosvirsi[\s\xa0]*tule)ssa)|(?:Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Tres[\s\xa0]*Jovenes[\s\xa0]*Judios)|(?:Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))|Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))en|(?:Der[\s\xa0]*Gesang[\s\xa0]*der[\s\xa0]*Dre|Trei[\s\xa0]*tiner|Kolmen[\s\xa0]*miehen[\s\xa0]*kiitosvirs)i|Tatlong[\s\xa0]*Kabataan|Kolmen[\s\xa0]*nuoren[\s\xa0]*miehen|Lobgesang[\s\xa0]*der[\s\xa0]*drei[\s\xa0]*jungen[\s\xa0]*Manner|(?:Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew))|Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Tres[\s\xa0]*Jovene)s|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*3[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi)os|Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi)|3[\s\xa0]*Jovenes[\s\xa0]*(?:Hebre|Judi))os)|(?:Gesang[\s\xa0]*der[\s\xa0]*Drei|Kolmen[\s\xa0]*miehen|(?:Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*)?3[\s\xa0]*Jovenes|Tres[\s\xa0]*Jovenes|Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres|3)[\s\xa0]*Jovenes))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*P(?:et(?:r(?:u(?:sbrevet|v)|i)|ersbrev)|tr|edro|iotra|etrova[\s\xa0]*Poslanica)|\.[\s\xa0]*P(?:ie(?:tarin[\s\xa0]*kirj|rr)e|tr|ietro|iotra|e(?:trova[\s\xa0]*Poslanica|dro)))|II(?:\.[\s\xa0]*P(?:ete|t)|[\s\xa0]*P(?:ete|t))r|Andre[\s\xa0]*Petersbrev|II[\s\xa0]*Petru[sv]|II[\s\xa0]*Pie(?:tarin[\s\xa0]*kirj|rr)e|II[\s\xa0]*Pietro|II[\s\xa0]*Pedro|II\.?[\s\xa0]*Piotra|II[\s\xa0]*Petrova[\s\xa0]*Poslanica)|(?:2(?:[\s\xa0]*Pe(?:trov|dr)|\.[\s\xa0]*Petrov)|Andre[\s\xa0]*Peters)|(?:2[\s\xa0]*petracem)|(?:2(?:[\s\xa0]*P(?:e(?:t(?:uru|ro|rus|ers)|[dr])|[dt])|\.[\s\xa0]*P(?:e(?:tr(?:[io]|uv)|r)|t))|Epistula[\s\xa0]*II[\s\xa0]*Petri|2\.[\s\xa0]*Pie|(?:2(?:[\s\xa0]*(?:Pata|pat)|\.[\s\xa0]*Pata)ra|Zweite[\s\xa0]*Petru|2e\.?[\s\xa0]*Petru|Tweede[\s\xa0]*Petru)s|2\.?[\s\xa0]*Butros|(?:(?:Masodik|Andre)[\s\xa0]*Pete|2\.[\s\xa0]*Ped)r|2\.?[\s\xa0]*Piotr|II(?:[\s\xa0]*(?:P(?:e(?:t(?:r(?:ov|u)|e)|r)|ie|t)|Butros|Pedr|Piotr)|\.[\s\xa0]*(?:P(?:e(?:t(?:r(?:u[sv]|i)|e)|dro|r)|iotr|t)|Butros))|Butros[\s\xa0]*Labaad|2nd\.?[\s\xa0]*P(?:e(?:te?)?|t)r|Second[\s\xa0]*P(?:e(?:te?)?|t)r|(?:(?:Toinen|2)[\s\xa0]*Pietarin[\s\xa0]*kirj|2(?:[\s\xa0]*P[Hy]|\.[\s\xa0]*Py)|II(?:\.[\s\xa0]*P(?:ietarin[\s\xa0]*kirj|y)|[\s\xa0]*Py))e|(?:II\.|2)[\s\xa0]*Pierre|2e\.?[\s\xa0]*Pierre|2(?:de?|eme)[\s\xa0]*Pierre|2(?:de?|eme)\.[\s\xa0]*Pierre|(?:2(?:[\s\xa0]*(?:[ei]\.?[\s\xa0]*Pj|Pj)etri|Pe|\.[\s\xa0]*P(?:etrusbreve|jetri))|Andra[\s\xa0]*Petrusbreve)t|(?:Naa77antto[\s\xa0]*PHeexiroos|(?:II\.?[\s\xa0]*Ph|2\.?[\s\xa0]*Ph)i|II\.[\s\xa0]*Petrova[\s\xa0]*Poslanic)a|(?:p(?:atrusko[\s\xa0]*dostro|etracem[\s\xa0]*dusre)[\s\xa0]*pa|(?:II\.?|2\.?)[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?Pio)tra|D(?:ru(?:g(?:(?:a[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?|i[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?)Piotr|a[\s\xa0]*Petrova[\s\xa0]*Poslanic|[ai][\s\xa0]*Piotr)a|h(?:y[\s\xa0]*P(?:etrov(?:[\s\xa0]*list|a)|t)|a[\s\xa0]*P(?:etrova|t)|e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Petra))|e(?:uxiemes?[\s\xa0]*Pierr|zyem[\s\xa0]*P[iy])e)|(?:(?:(?:(?:II\.?|2\.?)[\s\xa0]*San|Ikalawang|2a\.|2a)[\s\xa0]*|2\.?o[\s\xa0]*(?:San[\s\xa0]*)?|2\.?o\.[\s\xa0]*(?:San[\s\xa0]*)?)Pedr|2(?:[\s\xa0]*(?:patrusk|Pietr)|\.[\s\xa0]*patrusk)|II\.[\s\xa0]*Pietr|(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*y)a[\s\xa0]*Petr|Se(?:cond(?:a[\s\xa0]*(?:lettera[\s\xa0]*di[\s\xa0]*)?|o[\s\xa0]*)Piet|gund(?:o[\s\xa0]*(?:San[\s\xa0]*)?|a[\s\xa0]*)Ped)r)o|Epistula[\s\xa0]*Petri[\s\xa0]*II|(?:Druh(?:a[\s\xa0]*(?:(?:list[\s\xa0]*)?Petru|kniha[\s\xa0]*Petro)|y[\s\xa0]*(?:list[\s\xa0]*Petr[ou]|Petru))|(?:II\.?|2\.?)[\s\xa0]*list[\s\xa0]*Petru|2[\s\xa0]*k[\s\xa0]*Petro|2[\s\xa0]*k\.[\s\xa0]*Petro)v|(?:Ande[nt][\s\xa0]*Peters|2\.[\s\xa0]*Peters)brev|2(?:[\s\xa0]*P(?:e(?:t(?:ru|r|er?)?)?|je?|i(?:et?)?)?|\.[\s\xa0]*P(?:e(?:t(?:e(?:rs?)?|r(?:us?)?)?)?)?)|And(?:en[\s\xa0]*Pet(?:er)?|re[\s\xa0]*Pet)|Masodik[\s\xa0]*Pet|2e\.?[\s\xa0]*Petr?|Tweede[\s\xa0]*Petr?|2\.?[\s\xa0]*But|II(?:\.[\s\xa0]*(?:P(?:e(?:t(?:r(?:ov?|u)?)?|dr)?|ie)?|But)|[\s\xa0]*(?:P(?:e(?:t(?:ro?)?)?)?|But))|2nd\.?[\s\xa0]*P(?:e(?:te?)?|t)?|Second[\s\xa0]*P(?:e(?:te?)?|t)?|Dru(?:h(?:a[\s\xa0]*P(?:etr(?:ov)?)?|y[\s\xa0]*P(?:etr)?)|g[ai][\s\xa0]*Piotr)|P(?:et(?:ers[\s\xa0]*(?:Andet[\s\xa0]*B|andre[\s\xa0]*b)rev|r(?:us[\s\xa0]*andra[\s\xa0]*brev|o[\s\xa0]*II)|uru[\s\xa0]*Elutiya[\s\xa0]*Irantavatu[\s\xa0]*Nirupam)|ili[\s\xa0]*Pet(?:ro)?))|(?:(?:II\.?|2\.?)[\s\xa0]*Pietarin|II[\s\xa0]*Petri|Petri[\s\xa0]*II|Toinen[\s\xa0]*Pietarin|(?:II\.?|2\.?)[\s\xa0]*Petrova|Dru(?:ga[\s\xa0]*Petrova(?:[\s\xa0]*poslanica)?|hy[\s\xa0]*Petrov)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:I(?:[\s\xa0]*P(?:ie(?:tarin[\s\xa0]*kirj|rr)e|etru[sv])|\.[\s\xa0]*Pie(?:tarin[\s\xa0]*kirj|rr)e|\.?[\s\xa0]*Pietro|\.?[\s\xa0]*Pedro|(?:\.[\s\xa0]*P(?:ete|t)|[\s\xa0]*P(?:ete|t))r|\.?[\s\xa0]*Piotra|[\s\xa0]*Petrova[\s\xa0]*Poslanica|\.[\s\xa0]*Petrova[\s\xa0]*Poslanica)|1(?:[\s\xa0]*P(?:e(?:t(?:r(?:u(?:sbrevet|v)|i)|ersbrev)|dro)|tr|iotra|etrova[\s\xa0]*Poslanica)|\.[\s\xa0]*P(?:etrova[\s\xa0]*Poslanica|iotra|tr)))|(?:1[\s\xa0]*Pe(?:trov|dr)|I\.?[\s\xa0]*Petrov)|(?:1[\s\xa0]*petracem)|(?:1(?:[\s\xa0]*P(?:e(?:t(?:uru|ro|rus|ers)|[dr])|[dt])|\.[\s\xa0]*P(?:e(?:tr(?:ov|i|uv)|dro|r)|t))|I(?:\.[\s\xa0]*P(?:e(?:t(?:r(?:u[sv]|[io])|e)|r)|ie|t)|[\s\xa0]*P(?:e(?:t(?:r[ou]|e)|r)|t|ie))|Butros[\s\xa0]*Kowaad|1st[\s\xa0]*P(?:e(?:te?)?|t)r|1st\.[\s\xa0]*P(?:e(?:te?)?|t)r|F(?:irst[\s\xa0]*P(?:e(?:te?)?|t)r|yrra[\s\xa0]*Petursbref)|(?:I(?:\.?[\s\xa0]*Piot|\.?[\s\xa0]*Ped)|1\.?[\s\xa0]*Piot)r|(?:1(?:[\s\xa0]*(?:Butro|patra|Patara)|\.[\s\xa0]*(?:Patara|Butro))|I\.?[\s\xa0]*Butro|Fyrra[\s\xa0]*almenna[\s\xa0]*bref[\s\xa0]*Petur)s|1e[\s\xa0]*Petrus|1e\.[\s\xa0]*Petrus|E(?:rste[\s\xa0]*Petrus|lso[\s\xa0]*Peter|erste[\s\xa0]*Petrus|pistula[\s\xa0]*I[\s\xa0]*Petri)|(?:1(?:[\s\xa0]*P[Hy]|\.[\s\xa0]*Py)|I\.?[\s\xa0]*Py|1\.?[\s\xa0]*Pietarin[\s\xa0]*kirj|Ensimmainen[\s\xa0]*Pietarin[\s\xa0]*kirj)e|1\.?[\s\xa0]*Pierre|1(?:ere?|re)[\s\xa0]*Pierre|1(?:ere?|re)\.[\s\xa0]*Pierre|(?:1(?:(?:[\s\xa0]*(?:[ei]\.?[\s\xa0]*Pj|Pj)|\.[\s\xa0]*Pj)etri|Pe|\.[\s\xa0]*Petrusbreve)|Forsta[\s\xa0]*Petrusbreve)t|(?:1(?:\.[\s\xa0]*(?:patrusk|Pietr)|[\s\xa0]*(?:patrusk|Pietr))|Kwanza[\s\xa0]*Petr)o|(?:(?:(?:Un|1)a|Unang|1a\.|(?:1\.?|I\.?)[\s\xa0]*San)[\s\xa0]*|1\.?o[\s\xa0]*(?:San[\s\xa0]*)?|1\.?o\.[\s\xa0]*(?:San[\s\xa0]*)?)Pedro|(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*y)a[\s\xa0]*Petro|(?:Koiro[\s\xa0]*PHeexiroos|I\.?[\s\xa0]*Phi|1\.?[\s\xa0]*Phi)a|(?:p(?:atrusko[\s\xa0]*pahilo|etracem[\s\xa0]*pahile)[\s\xa0]*pa|(?:1\.?|I\.?)[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?Pio)tra|Epistula[\s\xa0]*Petri[\s\xa0]*I|(?:(?:1\.?|I\.?)[\s\xa0]*list[\s\xa0]*Petru|1[\s\xa0]*k[\s\xa0]*Petro|1[\s\xa0]*k\.[\s\xa0]*Petro)v|1\.[\s\xa0]*Petersbrev|1(?:\.[\s\xa0]*(?:P(?:e(?:t(?:r(?:us?|o)?|e(?:rs?)?)?|dr)?|ie)?|But)|[\s\xa0]*(?:P(?:e(?:t(?:ru|r|er?)?)?|je?|i(?:et?)?)?|But))|I(?:\.[\s\xa0]*P(?:e(?:t(?:ru?)?)?)?|[\s\xa0]*P(?:e(?:tr?)?)?)|Kwanza[\s\xa0]*Pet|I\.?[\s\xa0]*But|1st[\s\xa0]*P(?:e(?:te?)?|t)?|1st\.[\s\xa0]*P(?:e(?:te?)?|t)?|First[\s\xa0]*P(?:e(?:te?)?|t)?|1e[\s\xa0]*Petr?|1e\.[\s\xa0]*Petr?|E(?:erste[\s\xa0]*Petr?|lso[\s\xa0]*Pet)|P(?:r(?:im(?:e(?:r(?:o[\s\xa0]*(?:San[\s\xa0]*)?|[\s\xa0]*(?:San[\s\xa0]*)?)|ir[ao][\s\xa0]*)Ped|o[\s\xa0]*Piet|a[\s\xa0]*(?:lettera[\s\xa0]*di[\s\xa0]*)?Piet)ro|em(?:ier(?:es?|s)?[\s\xa0]*Pierr|ye[\s\xa0]*P[iy])e|v(?:y[\s\xa0]*Petrov[\s\xa0]*lis|ni[\s\xa0]*P)t)|ierwsz[aey][\s\xa0]*Piotra|rv(?:a[\s\xa0]*Petrova[\s\xa0]*Poslanic|ni[\s\xa0]*Petrov)a|ierwsz[aey][\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?Piotra|rv(?:ni[\s\xa0]*(?:list[\s\xa0]*)?Petru|y[\s\xa0]*list[\s\xa0]*Petro|a[\s\xa0]*kniha[\s\xa0]*Petro)v|rv(?:ni[\s\xa0]*P(?:etr)?|a[\s\xa0]*Petrov)|ierwsz[aey][\s\xa0]*Piotr|e(?:t(?:r(?:us[\s\xa0]*forsta[\s\xa0]*brev|o[\s\xa0]*I)|ers[\s\xa0]*1\.?[\s\xa0]*Brev|uru[\s\xa0]*Elutiya[\s\xa0]*Mutalavatu[\s\xa0]*Nirupam)|rse[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Petra)))|(?:(?:1\.?|I\.?)[\s\xa0]*Pietarin|I[\s\xa0]*Petri|Ensimmainen[\s\xa0]*Pietarin|(?:1\.?|I\.?)[\s\xa0]*Petrova|P(?:rv(?:a[\s\xa0]*Petrova(?:[\s\xa0]*poslanica)?|y[\s\xa0]*Petrov)|et(?:ri[\s\xa0]*I|er))))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Rom"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Rom(?:iyo|as)n)|(?:R(?:o(?:m(?:a(?:iakhoz|ns)|s|arbrevet|e(?:inenbrief|rbrevet|n))|emer|s|ome)|hufeiniaid|mn?s)|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Warumi|Lettera[\\s\\xa0]*ai[\\s\\xa0]*Romani|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*Romano|R(?:o(?:ma(?:in|nd)|amn)|pman)s|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Romanos|(?:R(?:imsky|zy|u)|List[\\s\\xa0]*Riman[ou])m|Uromarukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|(?:Ro(?:omalaiskirj|makev)|Kirje[\\s\\xa0]*roomalaisill)e|(?:rom(?:iharulai|karams)[\\s\\xa0]*patr|Bref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Romverj)a|(?:(?:Mga[\\s\\xa0]*Taga(?:\\-?[\\s\\xa0]*|\\-?)|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*)R|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*War|Barua[\\s\\xa0]*kwa[\\s\\xa0]*War)oma|R(?:o(?:m(?:e(?:inen|r)|an)?|oma?)?|mn?|z|im|huf)?|List[\\s\\xa0]*do[\\s\\xa0]*Rzymian|P(?:a(?:vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Rimljanima|ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Romerne)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*rymljan))|(?:Uromarukku|ad[\\s\\xa0]*Romanos|Warumi|rom(?:iharulai|karams)|R(?:iman[ou]m|zymian|oman(?:os|i))|(?:Taga\\-?[\\s\\xa0]*R|War)oma|Rimljanima|Roma(?:no)?|Roomalaisille|Romerne|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*romerne|oslanica[\\s\\xa0]*Rimljanima)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Song"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ang[\\s\\xa0]*Awit[\\s\\xa0]*n(?:i[\\s\\xa0]*S[ao]lomon|g[\\s\\xa0]*mga[\\s\\xa0]*Awit)|Hoga[\\s\\xa0]*visan|Hoheslied[\\s\\xa0]*Salomos|Cant(?:i(?:cos?[\\s\\xa0]*dos[\\s\\xa0]*Cantico|que[\\s\\xa0]*des[\\s\\xa0]*Cantique)|are[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Cantare)s)|(?:S(?:o[Sln]|S|iq)|L(?:aul\\.?[\\s\\xa0]*|j)l|S[\\s\\xa0]*of[\\s\\xa0]*S|A(?:\\.?[\\s\\xa0]*ng[\\s\\xa0]*A|w[\\s\\xa0]*ni[\\s\\xa0]*S)|H(?:o(?:ga(?:[\\s\\xa0]*V|v)|oglied|hes[\\s\\xa0]*Lied)|ld)|P(?:isnja[\\s\\xa0]*nad[\\s\\xa0]*pisnjamy|NP)|Musthikaning[\\s\\xa0]*Kidung|K(?:anti(?:d[\\s\\xa0]*de[\\s\\xa0]*Kantik|ko)|idung[\\s\\xa0]*Agung)|(?:Wimbo[\\s\\xa0]*(?:Ulio[\\s\\xa0]*)?Bor|Siiquwaa[\\s\\xa0]*Saba|gitratn|P(?:jesma[\\s\\xa0]*nad[\\s\\xa0]*pjesmam|iesn[\\s\\xa0]*Salomon))a|Pisen[\\s\\xa0]*Salamounova|Piesen[\\s\\xa0]*Salamunova|V(?:elpiesen[\\s\\xa0]*Salamunova|lp)|(?:Awit[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*Awi|Reshthagee)t|(?:Laulujen[\\s\\xa0]*laul|Unnatappatt|Korkea[\\s\\xa0]*veis)u|Pi(?:es(?:n[\\s\\xa0]*nad[\\s\\xa0]*Piesniam|en[\\s\\xa0]*piesn)|sen[\\s\\xa0]*pisn)i|Kantikulo|Gabaygii[\\s\\xa0]*Sulaymaan|C(?:an(?:t(?:ic(?:o[\\s\\xa0]*dei[\\s\\xa0]*Cantici|um[\\s\\xa0]*Canticorum)|\\.?[\\s\\xa0]*Cantic|ico[\\s\\xa0]*Superlativo|ico[\\s\\xa0]*de[\\s\\xa0]*Salomao|ar(?:e(?:a[\\s\\xa0]*(?:lui[\\s\\xa0]*Solomon|Cantarilor)|s[\\s\\xa0]*de[\\s\\xa0]*Salomao)|i))|iad(?:[\\s\\xa0]*Solomon|au))|hante[\\s\\xa0]*Salomon|n?t)|Sn?gs|The[\\s\\xa0]*Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n))s|(?:Cantico[\\s\\xa0]*di[\\s\\xa0]*Salomon|Kantiku[\\s\\xa0]*i[\\s\\xa0]*Kantikev)e|Salamon[\\s\\xa0]*eneke|The[\\s\\xa0]*Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n))|H(?:oog)?l|Wim|So|Gab|P(?:ie?s|j)|Kant|Velp|Can|Sn?g|Ho(?:helied[\\s\\xa0]*Salomoni|j)s|E(?:l[\\s\\xa0]*Cantar[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Cantares|nekek[\\s\\xa0]*eneke))|(?:Cant(?:ar[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Cantar|ique[\\s\\xa0]*des[\\s\\xa0]*cantiqu)es)|(?:Cant(?:ic(?:o[\\s\\xa0]*dei[\\s\\xa0]*cantici|um[\\s\\xa0]*canticorum)|area[\\s\\xa0]*cantarilor))|(?:Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S[ao]lom[ao]ns?|[\\s\\xa0]*of[\\s\\xa0]*S[ao]lom[ao]ns)|Awit[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*Awit)|(?:Song(?:[\\s\\xa0]*of[\\s\\xa0]*S[ao]lom[ao]n|s[\\s\\xa0]*of[\\s\\xa0]*Songs)|Awit[\\s\\xa0]*ni[\\s\\xa0]*S[ao]lomon)|(?:Song(?:[\\s\\xa0]*of[\\s\\xa0]*Songs?|s[\\s\\xa0]*of[\\s\\xa0]*Song))|(?:Cant(?:i(?:que|co)|are)s|Hohes?lied|Gabaygii|Cantique|Velpiesen)|(?:C(?:antico|hante)|Hoga[\\s\\xa0]*v|Piesen)|(?:Cant|Song|Hoga|Pisen)|(?:Pnp))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Prov"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:Prislovi[\\s\\xa0]*Salomounov|Sananlaskujen[\\s\\xa0]*kirj)a)|(?:Prverb(?:ios?|s))|(?:Prislovia)|(?:S(?:prichworter|nl|ananlaskut)|Nitimolikal|Izr|Salomos[\\s\\xa0]*Ordsprog|O(?:rdsprogenes[\\s\\xa0]*Bog|kv)|L(?:i(?:ber[\\s\\xa0]*Proverbiorum|v[\\s\\xa0]*Pwoveb[\\s\\xa0]*yo)|e(?:emiso|m))|(?:Mudre[\\s\\xa0]*izrek|nitisutr|Sprue?ch|Ordspraken)e|(?:hitopadesko[\\s\\xa0]*pust|Salomos[\\s\\xa0]*Ordspr)ak|Oroverbs|(?:(?:Wulang[\\s\\xa0]*Bebas|Neetivach|Mga[\\s\\xa0]*Kawika)a|Spreuke|Ordspraksboke)n|(?:Mga[\\s\\xa0]*Panultih|Diarh?ebi)on|P(?:r(?:o(?:ve(?:rb(?:e(?:le[\\s\\xa0]*lui[\\s\\xa0]*Solomon|s)|i(?:os|a)|s)|b(?:io)?s)|bv?erb(?:io)?s)|v(?:erb|bs)|everbs|is|(?:everbi|vb)os|zypowiesci[\\s\\xa0]*Salomonowych)|oslovice|[vw]|eldabeszedek|or?verb(?:io)?s|ildele[\\s\\xa0]*lui[\\s\\xa0]*Solomon)|(?:M(?:aahmaahyadi|[ei]thal)|Prypovist)i|P(?:r(?:o(?:v(?:erb(?:io?|e)?)?)?|(?:everbi|vb)o|everb|vb?|z(?:yp?)?)?|eld)|M(?:ith?|eth|aah)|Diar|S(?:ananl|pr)|Ords(?:p(?:rogene)?)?|Fjalet[\\s\\xa0]*e[\\s\\xa0]*urta|K(?:[\\s\\xa0]*prislovi|aw|\\.[\\s\\xa0]*prislovi|niha[\\s\\xa0]*prislovi|s(?:ieg[ai]|\\.)?[\\s\\xa0]*Przypowiesci[\\s\\xa0]*Salomona))|(?:P(?:r(?:overbele|islovi)|woveb)|hitopadesko|(?:Panultiho|Kawikaa)n|Sananlaskujen))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Wis"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:S(?:a(?:l(?:omo(?:n[\\s\\xa0]*viisaus|s[\\s\\xa0]*Visdom)|amon[\\s\\xa0]*bolcsessege)|pien(?:za[\\s\\xa0]*di[\\s\\xa0]*Salomone|tia[\\s\\xa0]*Salomonis))|peki[\\s\\xa0]*Salomons|Sal|b)|Vis(?:dommens[\\s\\xa0]*(?:Bog|bok)|hetens[\\s\\xa0]*bok)|Bolcsesseg|Kar|Weisheit[\\s\\xa0]*Salomos|Liber[\\s\\xa0]*Sapientiae|Salomos[\\s\\xa0]*vishet|(?:Viisauden[\\s\\xa0]*kirj|Sabiduri)a|M(?:adrosc[\\s\\xa0]*Salomona|udrost|dr|oudrost[\\s\\xa0]*Salomounova)|K(?:n(?:iha[\\s\\xa0]*Mo|jiga[\\s\\xa0]*M)udrost|s(?:ieg[ai]|\\.)?[\\s\\xa0]*Madrosc)i|He(?:t[\\s\\xa0]*boek[\\s\\xa0]*der[\\s\\xa0]*wijsheid|kima[\\s\\xa0]*ya[\\s\\xa0]*Solomoni)|Sabedoria[\\s\\xa0]*de[\\s\\xa0]*Salomao|Kawicaksanan[\\s\\xa0]*Salomo|De[\\s\\xa0]*wijsheid[\\s\\xa0]*van[\\s\\xa0]*Salomo|Vi(?:s(?:d(?:ommen)?|h(?:eten)?)|is)|Bolcs|Weish|Sa(?:p(?:ient)?|b)|M(?:udr?|adr)|Hek|(?:Ang[\\s\\xa0]*Karunungan[\\s\\xa0]*ni[\\s\\xa0]*S[ao]|Sagesse[\\s\\xa0]*de[\\s\\xa0]*Sa)lomon|(?:The[\\s\\xa0]*Wis(?:d(?:om)?|om)?[\\s\\xa0]*of|Doethineb)[\\s\\xa0]*Solomon|Intelepciunea[\\s\\xa0]*lui[\\s\\xa0]*Solomon|Cartea[\\s\\xa0]*intelepciunii[\\s\\xa0]*lui[\\s\\xa0]*Solomon)|(?:Wis(?:d(?:om)?|om)?[\\s\\xa0]*of[\\s\\xa0]*Solomon)|(?:Sa(?:pienza|gesse|pientia|bedoria)|Hekima|Moudrost|W(?:i(?:jsheid[\\s\\xa0]*van[\\s\\xa0]*Salomo|sdom)|eisheit)|Cartea[\\s\\xa0]*Intelepciunii|Mudrosti|Wisd?|K(?:a(?:runungan[\\s\\xa0]*ni[\\s\\xa0]*S[ao]lomo|wicaksana)n|niha[\\s\\xa0]*moudrosti))|(?:S[ao]lomon|Wijsheid|Karunungan))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Joel"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:Gioele)|(?:(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*Joe|Liv[\s\xa0]*Jowel[\s\xa0]*|Yuu77ee)la|Yo(?:eli|ol)|J(?:oel(?:s[\s\xa0]*(?:Bog|bok)|in[\s\xa0]*kirja)|l)|[IJ]oil|Yo(?:o['’]e|[av])el|Joe(?:li?)?|Yoel?|(?:Y(?:ol|u7)|Gio)e|Pro(?:roctwo[\s\xa0]*Ioelowe|phetia[\s\xa0]*Ioel))|(?:Jo(?:el(?:in|a)|wel)|[Iy]oel))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Jonah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:ona(?:s(?:['’][\\s\\xa0]*Bog|[\\s\\xa0]*bok)|[\\s\\xa0]*bok|h)|n[hs])|Y(?:o(?:onis|na)|unus)|Ionas|(?:Yoonaas|Gion|Liv[\\s\\xa0]*Jonas[\\s\\xa0]*l|Joonan[\\s\\xa0]*kirj)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Jonasza|Iona|Gio|Yoo?n|Jo(?:ona|n)|Pro(?:roctwo[\\s\\xa0]*Ionaszow|phetia[\\s\\xa0]*Iona)e)|(?:Jo(?:na(?:s(?:za)?)?|onan)|yona))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Nah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:N(?:a(?:hum(?:s[\\s\\xa0]*(?:Bog|bok)|u)|ch)|h|ahumin[\\s\\xa0]*kirja|aahooma)|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Nahuma|Nawoun|Liv[\\s\\xa0]*Nawoum[\\s\\xa0]*lan|Na(?:ho[ou]|u)m|Na(?:xu|k)um|Na\\-?hum|Na(?:h(?:u(?:mi)?|o)?|[wx])|Pro(?:roctwo[\\s\\xa0]*Nahumowe|phetia[\\s\\xa0]*Nahum))|(?:Na(?:hum(?:in|a)?|woum)?|nahum))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:I(?:\.[\s\xa0]*J(?:an(?:o(?:va|s)|uv|a)|h[ho]?n)|[\s\xa0]*J(?:an(?:o(?:va|s)|uv|a)|h[ho]?n))|1\.?[\s\xa0]*Jh[ho]?n)|(?:1[\s\xa0]*yohanacem)|(?:1(?:[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|[hn]|oh[mn])|Yohan(?:es|a)|Gv|In)|\.[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|[hn]|oh[mn])|Yohan(?:es|a)|In))|I(?:[\s\xa0]*(?:J(?:oh(?:annes|[mn])|[hn])|In)|\.[\s\xa0]*J(?:oh(?:annes|[mn])|[hn]))|Kwanza[\s\xa0]*Yohan[ae]|I\.?[\s\xa0]*Yohan(?:es|a)|I\.[\s\xa0]*In|(?:1\.?|I\.?)[\s\xa0]*Jonh|1st[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|1st\.[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|F(?:yrsta[\s\xa0]*(?:bref[\s\xa0]*Johannesar|Johannesarbref)|irst[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n))|1e\.?[\s\xa0]*Johannes|(?:1\.?|I\.)[\s\xa0]*Ioannis|(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*y)a[\s\xa0]*Yohane|(?:1\.?|I\.?)[\s\xa0]*Johanneksen[\s\xa0]*kirje|E(?:(?:rste[\s\xa0]*Johanne|lso[\s\xa0]*Jano|erste[\s\xa0]*Johanne)s|lso[\s\xa0]*Jn|pistula[\s\xa0]*I[\s\xa0]*Ioannis|nsimmainen[\s\xa0]*Johanneksen[\s\xa0]*kirje)|(?:1(?:[\s\xa0]*(?:(?:[ei]\.?[\s\xa0]*Gj|Gj)oni|Johannesbreve)|\.[\s\xa0]*(?:Johannesbreve|Gjoni))|Forsta[\s\xa0]*Johannesbreve)t|(?:Johannes[\s\xa0]*forsta[\s\xa0]*bre|I\.?[\s\xa0]*Jano|Johannes['’][\s\xa0]*1[\s\xa0]*Bre|Johannes['’][\s\xa0]*1\.[\s\xa0]*Bre|1(?:\.[\s\xa0]*J(?:ohannes['’][\s\xa0]*Bre|anu)|[\s\xa0]*J(?:ohannes['’][\s\xa0]*Bre|anu))|(?:1\.?|I\.?)[\s\xa0]*list[\s\xa0]*Janu)v|1[\s\xa0]*k[\s\xa0]*Janov|1[\s\xa0]*k\.[\s\xa0]*Janov|(?:1(?:\.[\s\xa0]*(?:yuhannak|Joa)|[\s\xa0]*(?:yuhannak|Joa))|I\.?[\s\xa0]*Joa)o|1o\.?[\s\xa0]*Joao|1a[\s\xa0]*Joao|1a\.[\s\xa0]*Joao|(?:1(?:\.[\s\xa0]*(?:J(?:a[au]|oo)|Gioa)|[\s\xa0]*(?:J(?:a[au]|oo)|Gioa))|I(?:\.[\s\xa0]*J(?:a[au]|oo)|[\s\xa0]*J(?:a[au]|oo)|\.?[\s\xa0]*Gioa)|(?:1(?:[\s\xa0]*Jo?p|Jo|\.[\s\xa0]*Jo?p)|I(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)p)h|1st[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)|1st\.[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)|First[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)|(?:I(?:[\s\xa0]*(?:Io|Je)|\.[\s\xa0]*Je)|Una(?:ng)?[\s\xa0]*Ju|I\.?[\s\xa0]*Yokan|1(?:[\s\xa0]*(?:Yo(?:kan|v)|Je)|\.[\s\xa0]*(?:Yokan|Je)))a|1(?:ere?|re)[\s\xa0]*Jea|1(?:ere?|re)\.[\s\xa0]*Jea)n|(?:1(?:o(?:\.[\s\xa0]*J[au]|[\s\xa0]*J[au])|[\s\xa0]*Ju|\.[\s\xa0]*Ju)|I\.?[\s\xa0]*Ju)[au]n|(?:1(?:o\.?|\.)?|I\.?)[\s\xa0]*San[\s\xa0]*J[au][au]n|1\.o[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])n|1\.o\.[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])n|(?:1\.?[\s\xa0]*Gi|I\.?[\s\xa0]*Gi)ovanni|(?:y(?:ohanacem[\s\xa0]*pahile|uhannako[\s\xa0]*pahilo)[\s\xa0]*patr|Koiro[\s\xa0]*Yohaannis|I\.?[\s\xa0]*Yooxana|1\.?[\s\xa0]*Yooxana|1[\s\xa0]*Ivanova[\s\xa0]*Poslanic|(?:I\.?|1\.)[\s\xa0]*Ivanova[\s\xa0]*Poslanic)a|1\.?[\s\xa0]*Yoohanna|(?:1\.?|I\.?)[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?Jana|P(?:r(?:im(?:e(?:r(?:o[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])|[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au]))n|ir[ao][\s\xa0]*Joao)|o[\s\xa0]*Giovanni|a[\s\xa0]*(?:lettera[\s\xa0]*di[\s\xa0]*)?Giovanni)|v(?:ni[\s\xa0]*(?:list[\s\xa0]*)?Januv|y[\s\xa0]*Janov[\s\xa0]*list|y[\s\xa0]*list[\s\xa0]*Janov|a[\s\xa0]*(?:kniha[\s\xa0]*)?Janov)|em(?:ier(?:es?|s)?[\s\xa0]*Je|ye[\s\xa0]*J)an|v(?:a[\s\xa0]*Ivanova[\s\xa0]*Poslanic|ni[\s\xa0]*Janov)a)|ierwsz[aey][\s\xa0]*(?:List[\s\xa0]*(?:sw\.?[\s\xa0]*)?)?Jana|erse[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Ivana)|(?:Epistula[\s\xa0]*Ioanni|Jano)s[\s\xa0]*I|1(?:[\s\xa0]*(?:J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?)?|Yoh(?:ane)?|Gj|Iv|Yoox|Gi|Ioan)|\.[\s\xa0]*(?:J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?)?|Yo(?:h(?:ane)?|ox)|Gi|Ioan))|I(?:\.[\s\xa0]*J(?:oh?|an)?|[\s\xa0]*J(?:oh?|an)?)|Kwanza[\s\xa0]*Yoh|I\.?[\s\xa0]*Yoh(?:ane)?|I\.?[\s\xa0]*Yoox|I\.?[\s\xa0]*Gi|I\.[\s\xa0]*Ioan|1st[\s\xa0]*J(?:oh?|h)|1st\.[\s\xa0]*J(?:oh?|h)|First[\s\xa0]*J(?:oh?|h)|1e[\s\xa0]*Joh|1e\.[\s\xa0]*Joh|Eerste[\s\xa0]*Joh|Prvni[\s\xa0]*J(?:an)?|Yo(?:van[\s\xa0]*Elutiya[\s\xa0]*Mutalavatu[\s\xa0]*Nirupam|oxanaa[\s\xa0]*Kowaad|hane[\s\xa0]*I))|(?:I(?:[\s\xa0]*Ioannis|oannis[\s\xa0]*I)|1\.?[\s\xa0]*Johannes|(?:1\.?|I\.?)[\s\xa0]*Ivanova|Prv(?:a[\s\xa0]*Ivanova[\s\xa0]*poslanica|y[\s\xa0]*Janov)|Prva[\s\xa0]*Ivanova|1\.?[\s\xa0]*Johanneksen|I\.?[\s\xa0]*Johanneksen|Ensimmainen[\s\xa0]*Johanneksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:\.[\s\xa0]*Jan(?:uv|a|os)|[\s\xa0]*Jan(?:uv|a|os)|\.?[\s\xa0]*Jh[ho]?n|\.?[\s\xa0]*Janova)|II(?:\.[\s\xa0]*J(?:h[ho]?n|anova)|[\s\xa0]*J(?:h[ho]?n|anova)))|(?:2[\s\xa0]*yohanacem)|(?:II(?:\.[\s\xa0]*(?:J(?:an(?:o[sv]|a)|[hn]|oh(?:annes|[mn]))|Yohan(?:es|a)|In)|[\s\xa0]*(?:J(?:an(?:o[sv]|a)|[hn]|oh(?:annes|[mn]))|Yohan(?:es|a)|In))|2(?:[\s\xa0]*(?:J(?:oh[mn]|[hn])|Gv|In)|\.[\s\xa0]*J(?:oh[mn]|[hn]))|Pili[\s\xa0]*Yohan[ae]|Masodik[\s\xa0]*Jn|2\.?[\s\xa0]*Yohan(?:es|a)|2\.[\s\xa0]*In|(?:Epistula[\s\xa0]*II[\s\xa0]*Ioanni|Masodik[\s\xa0]*Jano|2[\s\xa0]*Ioanni|2\.[\s\xa0]*Ioanni|II\.[\s\xa0]*Ioanni)s|Zweite[\s\xa0]*Johannes|2e\.?[\s\xa0]*Johannes|Andre[\s\xa0]*Johannes|(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*y)a[\s\xa0]*Yohane|(?:II\.?|2\.?)[\s\xa0]*Johanneksen[\s\xa0]*kirje|T(?:oinen[\s\xa0]*Johanneksen[\s\xa0]*kirje|weede[\s\xa0]*Johannes)|(?:2(?:\.[\s\xa0]*(?:yuhannak|Joa)|[\s\xa0]*(?:yuhannak|Joa))|II\.?[\s\xa0]*Joa)o|2a\.?[\s\xa0]*Joao|2o[\s\xa0]*Joao|2o\.[\s\xa0]*Joao|(?:II\.?|2\.?)[\s\xa0]*Jonh|2nd\.?[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|(?:II\.?[\s\xa0]*Gi|2\.?[\s\xa0]*Gi)ovanni|Se(?:cond(?:[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|o[\s\xa0]*Giovanni|a[\s\xa0]*(?:lettera[\s\xa0]*di[\s\xa0]*)?Giovanni)|gund[ao][\s\xa0]*Joao)|(?:II(?:\.[\s\xa0]*(?:J(?:a[au]|oo)|Gioa)|[\s\xa0]*(?:J(?:a[au]|oo)|Gioa))|2(?:\.[\s\xa0]*J(?:a[au]|oo)|[\s\xa0]*J(?:a[au]|oo)|\.?[\s\xa0]*Gioa)|(?:II\.?|2\.?)[\s\xa0]*Ju[au]|2\.o\.?[\s\xa0]*J[au][au]|(?:2(?:\.(?:o\.?)?)?|II\.?)[\s\xa0]*San[\s\xa0]*J[au][au]|2o[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])|2o\.[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])|(?:2(?:[\s\xa0]*Jo?p|Jo|\.[\s\xa0]*Jo?p)|II(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)p)h|2nd\.?[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)|Se(?:gundo[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])|cond[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)))n|(?:I(?:I(?:[\s\xa0]*(?:Yokan|Io|Je)|\.[\s\xa0]*(?:Yokan|Je))|kalawang[\s\xa0]*Ju)|2(?:e\.?[\s\xa0]*Je|[\s\xa0]*Yov|[\s\xa0]*Je|\.[\s\xa0]*Je|\.?[\s\xa0]*Yokan))an|2(?:de?|eme)[\s\xa0]*Jean|2(?:de?|eme)\.[\s\xa0]*Jean|(?:2(?:[\s\xa0]*(?:(?:[ei]\.?[\s\xa0]*Gj|Gj)oni|Johannesbreve)|\.[\s\xa0]*(?:Johannesbreve|Gjoni))|Andra[\s\xa0]*Johannesbreve)t|(?:(?:(?:Johannes(?:’[\s\xa0]*andre|[\s\xa0]*andra)[\s\xa0]*|Ande[nt][\s\xa0]*Johannes)b|(?:Anden[\s\xa0]*Johannes['’]|Johannes['’][\s\xa0]*Andet)[\s\xa0]*B)re|2(?:\.[\s\xa0]*J(?:ohannes['’][\s\xa0]*Bre|ano)|[\s\xa0]*J(?:ohannes['’][\s\xa0]*Bre|ano))|II\.?[\s\xa0]*Janu|(?:II\.?|2\.?)[\s\xa0]*list[\s\xa0]*Janu)v|2[\s\xa0]*k[\s\xa0]*Janov|2[\s\xa0]*k\.[\s\xa0]*Janov|(?:Naa77antto[\s\xa0]*Yohaannis|2\.?[\s\xa0]*Yooxana|II\.?[\s\xa0]*Yooxana|y(?:uhannako[\s\xa0]*dostro|ohanacem[\s\xa0]*dusre)[\s\xa0]*patr|2[\s\xa0]*Ivanova[\s\xa0]*Poslanic|(?:II\.?|2\.)[\s\xa0]*Ivanova[\s\xa0]*Poslanic)a|2\.?[\s\xa0]*Yoohanna|(?:II\.?|2\.?)[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?Jana|D(?:ru(?:h(?:y[\s\xa0]*(?:(?:list[\s\xa0]*Jan[ou]|Janu)v|Janov(?:[\s\xa0]*list|a))|a[\s\xa0]*(?:(?:list[\s\xa0]*)?Januv|Janova|kniha[\s\xa0]*Janov)|e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Ivana)|g(?:(?:a[\s\xa0]*(?:List[\s\xa0]*(?:sw\.?[\s\xa0]*)?)?|i[\s\xa0]*(?:List[\s\xa0]*(?:sw\.?[\s\xa0]*)?)?)Jan|a[\s\xa0]*Ivanova[\s\xa0]*Poslanic)a)|e(?:uxiemes?[\s\xa0]*Je|zyem[\s\xa0]*J)an)|(?:Epistula[\s\xa0]*Ioanni|Jano)s[\s\xa0]*II|2(?:[\s\xa0]*(?:J(?:o(?:h(?:annesbrev)?)?|an)?|Gj|Iv)|\.[\s\xa0]*J(?:o(?:h(?:annesbrev)?)?|an)?)|(?:Anden[\s\xa0]*J|Pili[\s\xa0]*Y)oh|2\.?[\s\xa0]*Yoh(?:ane)?|2\.?[\s\xa0]*Yoox|2\.?[\s\xa0]*Gi|2[\s\xa0]*Ioan|2\.[\s\xa0]*Ioan|II(?:\.[\s\xa0]*(?:Yo(?:h(?:ane)?|ox)|Gi|J(?:oh?|an)?|Ioan)|[\s\xa0]*(?:Yo(?:h(?:ane)?|ox)|Gi|J(?:oh?|an)?))|2e\.?[\s\xa0]*Joh|Andre[\s\xa0]*Joh|T(?:oinen|weede)[\s\xa0]*Joh|2nd\.?[\s\xa0]*J(?:oh?|h)|Second[\s\xa0]*J(?:oh?|h)|Druh(?:a[\s\xa0]*J(?:an(?:ov)?)?|y[\s\xa0]*J(?:an)?)|Yo(?:van[\s\xa0]*Elutiya[\s\xa0]*Irantavatu[\s\xa0]*Nirupam|oxanaa[\s\xa0]*Labaad|hane[\s\xa0]*II))|(?:I(?:I[\s\xa0]*Ioannis|oannis[\s\xa0]*II)|(?:Anden|2\.?)[\s\xa0]*Johannes|2\.?[\s\xa0]*Johanneksen|II\.?[\s\xa0]*Johanneksen|Toinen[\s\xa0]*Johanneksen|(?:II\.?[\s\xa0]*I|2\.?[\s\xa0]*I)vanova|Dru(?:ga[\s\xa0]*Ivanova(?:[\s\xa0]*poslanica)?|hy[\s\xa0]*Janov)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:3(?:\.[\s\xa0]*J(?:an(?:o(?:va|s)|uv|a)|h[ho]?n|ohannesbrevet)|[\s\xa0]*J(?:an(?:o(?:va|s)|uv|a)|h[ho]?n|ohannesbrevet))|III\.?[\s\xa0]*Jh[ho]?n)|(?:3(?:[\s\xa0]*(?:yohanacem|Yooxanaa|Ivanova[\s\xa0]*Poslanica)|\.[\s\xa0]*Yooxanaa)|III\.?[\s\xa0]*Yooxanaa)|(?:3(?:[\s\xa0]*(?:J(?:oh[mn]|[hn])|I[nv]|Gv|Yoox)|\.[\s\xa0]*(?:J(?:oh[mn]|[hn])|Yoox))|Harmadik[\s\xa0]*Jn|3\.?[\s\xa0]*Yohan(?:es|a)|(?:D(?:ritt|erd)e[\s\xa0]*Johanne|Harmadik[\s\xa0]*Jano)s|Epistula[\s\xa0]*III[\s\xa0]*Ioannis|3[\s\xa0]*Ioannis|3\.[\s\xa0]*I(?:oannis|n)|III(?:\.[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|[hn]|oh(?:annes|[mn]))|Yo(?:han(?:es|a)|ox)|I(?:oannis|n))|[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|[hn]|oh(?:annes|[mn]))|Yo(?:han(?:es|a)|ox)|In))|(?:Waraka[\s\xa0]*wa[\s\xa0]*Tatu[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Tatu[\s\xa0]*y)a[\s\xa0]*Yohane|(?:III\.?|3\.?)[\s\xa0]*Johanneksen[\s\xa0]*kirje|Kolmas[\s\xa0]*Johanneksen[\s\xa0]*kirje|(?:Epistula[\s\xa0]*Ioanni|Jano)s[\s\xa0]*III|Yo(?:van[\s\xa0]*Elutiya[\s\xa0]*Munravatu[\s\xa0]*Nirupam|oxanaa[\s\xa0]*Saddexaad|hane[\s\xa0]*III)|(?:III\.?|3\.?)[\s\xa0]*Jonh|3rd[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|3rd\.[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|(?:3(?:\.[\s\xa0]*(?:yuhannak|Joa)|[\s\xa0]*(?:yuhannak|Joa))|III\.?[\s\xa0]*Joa)o|3o\.?[\s\xa0]*Joao|3a[\s\xa0]*Joao|3a\.[\s\xa0]*Joao|(?:III\.?[\s\xa0]*Gi|3\.?[\s\xa0]*Gi)ovanni|(?:III(?:\.[\s\xa0]*(?:J(?:a[au]|oo)|Gioa)|[\s\xa0]*(?:J(?:a[au]|oo)|Gioa))|3(?:\.[\s\xa0]*J(?:a[au]|oo)|[\s\xa0]*J(?:a[au]|oo)|\.?[\s\xa0]*Gioa)|(?:3(?:[\s\xa0]*Jo?p|Jo|\.[\s\xa0]*Jo?p)|III(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)p)h|3rd[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)|3rd\.[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph)|(?:3(?:o(?:\.[\s\xa0]*J[au]|[\s\xa0]*J[au])|[\s\xa0]*Ju|\.[\s\xa0]*Ju)|III\.?[\s\xa0]*Ju)[au]|(?:3(?:o\.?|\.)?|III\.?)[\s\xa0]*San[\s\xa0]*J[au][au]|3\.o[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])|3\.o\.[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au]))n|(?:I(?:II(?:[\s\xa0]*(?:Yokan|Io|Je)|\.[\s\xa0]*(?:Yokan|Je))|katlong[\s\xa0]*Ju)|3(?:e\.?[\s\xa0]*Je|[\s\xa0]*Yov|[\s\xa0]*Je|\.[\s\xa0]*Je|\.?[\s\xa0]*Yokan))an|3eme[\s\xa0]*Jean|3eme\.[\s\xa0]*Jean|3(?:e\.?[\s\xa0]*Johannesbreve|[\s\xa0]*Gjoni|[\s\xa0]*[ei]\.?[\s\xa0]*Gjoni|\.[\s\xa0]*Gjoni)t|(?:(?:Johannes[\s\xa0]*tredje[\s\xa0]*|3\.?[\s\xa0]*Johannes)bre|III\.?[\s\xa0]*Janu|3\.?[\s\xa0]*Jano|Johannes['’][\s\xa0]*3[\s\xa0]*Bre|(?:3(?:\.[\s\xa0]*Johannes['’]|[\s\xa0]*Johannes['’])|Johannes['’][\s\xa0]*(?:Tredje|3\.))[\s\xa0]*Bre|(?:III\.?|3\.?)[\s\xa0]*list[\s\xa0]*Janu)v|3[\s\xa0]*k[\s\xa0]*Janov|3[\s\xa0]*k\.[\s\xa0]*Janov|3(?:e(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|[\s\xa0]*Gj|[\s\xa0]*J(?:oh?|an)?|\.[\s\xa0]*J(?:oh?|an)?)|Derde[\s\xa0]*Joh|3\.?[\s\xa0]*Yoh(?:ane)?|3\.?[\s\xa0]*Gi|3[\s\xa0]*Ioan|3\.[\s\xa0]*Ioan|III(?:\.[\s\xa0]*(?:J(?:an(?:ov)?|oh?)?|Yoh(?:ane)?|Gi|Ioan)|[\s\xa0]*(?:J(?:an(?:ov)?|oh?)?|Yoh(?:ane)?|Gi))|3rd[\s\xa0]*J(?:oh?|h)|3rd\.[\s\xa0]*J(?:oh?|h)|(?:y(?:uhannako[\s\xa0]*testro|ohanacem[\s\xa0]*tisre)[\s\xa0]*patr|Hezzantto[\s\xa0]*Yohaannis|(?:III\.?|3\.)[\s\xa0]*Ivanova[\s\xa0]*Poslanic)a|3\.?[\s\xa0]*Yoohanna|(?:III\.?|3\.?)[\s\xa0]*List[\s\xa0]*(?:sw\.?[\s\xa0]*)?Jana|T(?:r(?:e(?:t(?:i(?:[\s\xa0]*(?:Janov(?:[\s\xa0]*list|a)|(?:list[\s\xa0]*)?Januv)|a[\s\xa0]*(?:kniha[\s\xa0]*)?Janov|[\s\xa0]*J(?:an)?)|je[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Ivana)|dje[\s\xa0]*Joh(?:annes(?:['’][\s\xa0]*Brev|brevet)|annesbrev)?|ca[\s\xa0]*Ivanova[\s\xa0]*Poslanica)|zeci(?:a[\s\xa0]*(?:List[\s\xa0]*(?:sw\.?[\s\xa0]*)?)?|[\s\xa0]*(?:List[\s\xa0]*(?:sw\.?[\s\xa0]*)?)?)Jana|oisiemes?[\s\xa0]*Jean)|(?:ercer(?:o[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au])|[\s\xa0]*(?:San[\s\xa0]*J[au][au]|J[au][au]))|hird[\s\xa0]*J(?:o(?:ph|o)|h[ho]|ph))n|er(?:z(?:a[\s\xa0]*(?:lettera[\s\xa0]*di[\s\xa0]*)?|o[\s\xa0]*)Giovanni|ceir[ao][\s\xa0]*Joao)|hird[\s\xa0]*J(?:o(?:h[mn]|nh)|h?n)|atu[\s\xa0]*Yohan[ae]|hird[\s\xa0]*J(?:oh?|h)|atu[\s\xa0]*Yoh))|(?:3\.?[\s\xa0]*Johannes|Ioannis[\s\xa0]*III|3\.?[\s\xa0]*Johanneksen|III\.?[\s\xa0]*Johanneksen|Kolmas[\s\xa0]*Johanneksen|Johannes’[\s\xa0]*tredje[\s\xa0]*brev|III[\s\xa0]*Ioannis|(?:III\.?[\s\xa0]*I|3\.?[\s\xa0]*I)vanova|Tre(?:ca[\s\xa0]*Ivanova(?:[\s\xa0]*poslanica)?|dje[\s\xa0]*Johannes|ti[\s\xa0]*Janov)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["John"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Gioan)|(?:y(?:uhannal|ohanan)e|G[giv]|Injili[\\s\\xa0]*ya[\\s\\xa0]*Yohan[ae]|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Gjonit|(?:Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Giovann|Yovan[\\s\\xa0]*Narceyt|Gjon)i|J(?:o(?:hanne(?:ksen[\\s\\xa0]*evankeliumi|sevangeliet)|ao)|anos)|Ioannes|Injil[\\s\\xa0]*Yohanes|Yo(?:haannis|oxana)a|Yuhanna|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*Ivana|J(?:ohannis|anovo)[\\s\\xa0]*evangelium|E(?:van(?:geli(?:um[\\s\\xa0]*(?:secundum[\\s\\xa0]*Ioannem|podle[\\s\\xa0]*Jana)|e(?:[\\s\\xa0]*volgens|t[\\s\\xa0]*etter)[\\s\\xa0]*Johannes)|jelium[\\s\\xa0]*Podla[\\s\\xa0]*Jana)|w(?:angelia[\\s\\xa0]*wg[\\s\\xa0]*sw|angelia|(?:angelia[\\s\\xa0]*wg[\\s\\xa0]*sw)?\\.)?[\\s\\xa0]*Jana)|Yo(?:ox|h)|Gjo|Ioan|Ew[\\s\\xa0]*Jan|(?:(?:Evankeliumi[\\s\\xa0]*Johanneksen[\\s\\xa0]*muka|Yokan|Iv)a|El[\\s\\xa0]*Evangelio[\\s\\xa0]*de[\\s\\xa0]*J[au][au]|Jea|(?:Ebanghelyo|Sulat)[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Jua|Ebanghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*)?Jua|Mabuting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*)?Jua)n|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))))|(?:J(?:ohannekse|h[ho])n)|(?:G(?:ospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)))|iovanni)|J(?:ohannes|ana)|Yohan(?:es|a)|Yohane|(?:(?:San[\\s\\xa0]*Ju|Yov)a|J(?:a[au]|uu))n)|(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h?n|h|uan|phn)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Josh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jos(?:vas[\\s\\xa0]*|ua)bok)|(?:J(?:o(?:s(?:va(?:bogen|s[\\s\\xa0]*Bog)|u(?:ah|e))|z(?:u(?:eu|a)|sue))|sh)|(?:Liber[\\s\\xa0]*I|Gi)osue|Iosua[\\s\\xa0]*Navi|Yaasu|Isus[\\s\\xa0]*Navyn|Yahoshoo|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Jozuego|(?:Y(?:ashuuc|osu)|Liv[\\s\\xa0]*Jozye[\\s\\xa0]*|Yoshu|Gsu|Yocuv|Jo(?:s(?:uov|hu)|ush?u|zuov|osuan[\\s\\xa0]*kirj))a|J(?:o(?:s(?:va(?:bog)?|ua|h)?|z(?:ue|s)?|os)|s)|Y(?:ash|os)|Ios|Gs|Yusak|yahos(?:uko[\\s\\xa0]*pustak|awa))|(?:Jo(?:svas|zye|osuan)|Iosu[ae]|Jozuego|yahosuko))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Judg"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Dommernes[\\s\\xa0]*bok)|(?:S(?:d[cz]|edz|oudcu)|Barnwyr|Iud|Amu|Richteren|(?:Waamuz|Suc)i|G(?:iudici|dc|jyqtaret)|Rechters|J(?:u(?:d(?:ecatorii|ges)|(?:iz|g|ec)es)|[cz]|ij|gs|dgs)|saste|Dommerne|Liv[\\s\\xa0]*Chef[\\s\\xa0]*yo|(?:Liber[\\s\\xa0]*Iudicu|Para[\\s\\xa0]*Haki)m|Mga[\\s\\xa0]*(?:Maghuh|H)ukom|(?:Dom(?:ar(?:aboki|boke)|merboge)|Qua)n|N(?:iyayatipatikal|yayiyon)|(?:Xaakinnad|Sudcovi|Da(?:annat|n)|Tuomarien[\\s\\xa0]*kirj)a|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Sedziow|\\.?[\\s\\xa0]*sudcov|n(?:jiga[\\s\\xa0]*o[\\s\\xa0]*Sucima|yha[\\s\\xa0]*Suddiv))|R(?:icht(?:ere?)?|echt)|Barn|Waam|Su?d|Gjy|Xaak|J(?:u(?:d(?:ecatori|g)|iz|g|ec|e)|d?g)|Dom(?:arabok|mer)?|Tuom|Huk|Birak|nyayakarttaharuko[\\s\\xa0]*pustak)|(?:S(?:edziow|udcov)|Tuomarien|Dommernes|Iudicum|Hukom|Maghuhukom|nyayakarttaharuko))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:3\.?[\s\xa0]*Esdrasbog|I[\s\xa0]*Esdras)|(?:I[\s\xa0]*Esdra)|(?:(?:(?:1\.?|I\.?)[\s\xa0]*Ezdrasov|(?:1\.?|I\.?)[\s\xa0]*Ezdrasz|1[\s\xa0]*k[\s\xa0]*Ezdrasov|1[\s\xa0]*k\.[\s\xa0]*Ezdrasov|Prv(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?)Ezdrasov)a)|(?:[1I]\.?[\s\xa0]*Ezdras)|(?:[1I]\.?[\s\xa0]*Ezdra)|(?:Liber[\s\xa0]*(?:Esdrae[\s\xa0]*I|I[\s\xa0]*Esdrae)|E(?:sdra[\s\xa0]*greco|zdras[\s\xa0]*I)|I(?:\.[\s\xa0]*Esdra[es]|[\s\xa0]*Esdr)|I\.?[\s\xa0]*Ezd|Tredje[\s\xa0]*Esdrasbog|1(?:[\s\xa0]*E(?:s(?:dra(?:sbog|e)|ra)|zd)|Esd|\.[\s\xa0]*E(?:s(?:dra(?:sbog|e)|ra)|zd))|3\.?[\s\xa0]*Esdras|III\.?[\s\xa0]*Esdras|(?:1st\.?|First)[\s\xa0]*Esdras|Elso[\s\xa0]*Ezdras|3e\.?[\s\xa0]*Esdras|(?:(?:Derde|Unang|Eerste|Una|1e\.?)[\s\xa0]*|1(?:[ao]|re|ere|er|\.o)[\s\xa0]*|1(?:[ao]|re|ere|er|\.o)\.[\s\xa0]*)Esdras|1[\s\xa0]*k[\s\xa0]*Ezdras|1[\s\xa0]*k\.[\s\xa0]*Ezdras|Pr(?:(?:ime(?:ir[ao]|ro|r)|emier(?:es?|s)?|im[ao])[\s\xa0]*Es|v(?:(?:y[\s\xa0]*list|ni|y)[\s\xa0]*|a[\s\xa0]*(?:kniha[\s\xa0]*)?)Ez)dras|1(?:[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?|st(?:\.[\s\xa0]*Esdr?|[\s\xa0]*Esdr?)|\.[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?)|I(?:\.[\s\xa0]*Esd(?:ra?)?|[\s\xa0]*Esd)|Elso[\s\xa0]*Ezd|First[\s\xa0]*Esdr?|3\.?[\s\xa0]*Esdra|III\.?[\s\xa0]*Esdra|Prim[ao][\s\xa0]*Esdra|(?:(?:(?:3(?:e\.?|\.)?|Tredje)[\s\xa0]*Es|3\.?[\s\xa0]*Ez|I(?:II\.?[\s\xa0]*Ez|[\s\xa0]*Es|\.[\s\xa0]*Es)|I\.?[\s\xa0]*Ez|1\.?[\s\xa0]*Ez)r|(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Ezdrasz|Pierwsz[aey][\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*)?Ezdrasz)a|(?:Terz[ao][\s\xa0]*Esd|3e\.?[\s\xa0]*Ez|Forsta[\s\xa0]*Es|E(?:nsimmainen|rste)[\s\xa0]*Es|3\.?[\s\xa0]*Ezd|III\.?[\s\xa0]*Ezd|Una[\s\xa0]*Ez|(?:Derde|Unang|Eerste)[\s\xa0]*Ez|1e\.?[\s\xa0]*Ez)ra|K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*ch|wanz)a[\s\xa0]*Ezra)|(?:I[\s\xa0]*Esdrae))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:4\.?[\s\xa0]*Esdrasbog)|(?:(?:(?:II\.?|2\.?)[\s\xa0]*Ezdrasov|(?:II\.?|2\.?)[\s\xa0]*Ezdrasz|2[\s\xa0]*k[\s\xa0]*Ezdrasov|2[\s\xa0]*k\.[\s\xa0]*Ezdrasov|Druh(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?)Ezdrasov)a)|(?:Liber[\s\xa0]*(?:Esdrae[\s\xa0]*II|II[\s\xa0]*Esdrae)|Ezdras[\s\xa0]*II|(?:Fjerde|Anden)[\s\xa0]*Esdrasbog|2(?:[\s\xa0]*Es(?:dra(?:sbog|e)|ra)|Esd|\.[\s\xa0]*Es(?:dra(?:sbog|e)|ra))|(?:Second[ao][\s\xa0]*Esd|4\.?[\s\xa0]*Esd)ras|2\.?[\s\xa0]*Ezdras|I(?:I(?:\.[\s\xa0]*E(?:sdra[es]|zdras)|[\s\xa0]*E[sz]dras)|V\.?[\s\xa0]*Esdras)|(?:Second|2nd\.?)[\s\xa0]*Esdras|Masodik[\s\xa0]*Ezdras|Andre[\s\xa0]*Esdras|(?:(?:(?:Twee|Vier)de|2e\.|2e|Ikalawang)[\s\xa0]*|2(?:[ao]|de|eme|d|\.o)[\s\xa0]*|(?:2(?:[ao]|de|eme|d|\.o)\.|Segund[ao])[\s\xa0]*)Esdras|2[\s\xa0]*k[\s\xa0]*Ezdras|2[\s\xa0]*k\.[\s\xa0]*Ezdras|D(?:ruh(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?)Ez|euxiemes?[\s\xa0]*Es)dras|2(?:[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?|nd(?:\.[\s\xa0]*Esdr?|[\s\xa0]*Esdr?)|\.[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?)|Second[\s\xa0]*Esdr?|Masodik[\s\xa0]*Ezd|(?:Second[ao][\s\xa0]*Esd|4\.?[\s\xa0]*Esd)ra|2\.?[\s\xa0]*Ezd(?:ra)?|I(?:I(?:[\s\xa0]*E(?:sd(?:ra|r)?|zd(?:ra)?)|\.[\s\xa0]*E(?:sd(?:ra?)?|zd(?:ra)?))|V\.?[\s\xa0]*Esdra)|(?:(?:(?:Andre|4\.?|Fjerde)[\s\xa0]*Es|4\.?[\s\xa0]*Ez|2\.?[\s\xa0]*Ez|I(?:I(?:\.[\s\xa0]*E[sz]|[\s\xa0]*E[sz])|V\.?[\s\xa0]*Ez))r|(?:II\.?|2\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Ezdrasz|Drug[ai][\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*)?Ezdrasz)a|(?:(?:Toinen|Andra)[\s\xa0]*Es|Quart[ao][\s\xa0]*Esd|Zweite[\s\xa0]*Es|Fjarde[\s\xa0]*Es|4\.?[\s\xa0]*Ezd|2e[\s\xa0]*Ez|(?:(?:Twee|Vier)de|2e\.)[\s\xa0]*Ez|I(?:kalawang[\s\xa0]*Ez|V\.?[\s\xa0]*Ezd))ra|Pili[\s\xa0]*Ezra|Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Ezra)|(?:II[\s\xa0]*Esdrae))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Isa"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Isai(?:i[ai]|s|i|a[ai])ha)|(?:(?:I(?:s(?:i(?:yaas|h)|a[jy])|zaij)|Jesa(?:jan[\\s\\xa0]*kirj|i))a)|(?:I(?:s(?:a(?:i(?:ih|e|as)|(?:ia?)?ha|a(?:[ai][ai]?)?ha)|i(?:[ai](?:[ai][ai]?)?ha|y))|a|sai(?:i[ai]|s|a[ai])h|ssah|shacyaah)|yashaayaah|Jesajabok(?:en|a)|Iza[ij]as|Jesajas[\\s\\xa0]*bok|E(?:sa(?:i(?:as['’][\\s\\xa0]*bok|e)|jas['’][\\s\\xa0]*Bog)|zsaias)|Liber[\\s\\xa0]*Isaiae|I(?:s(?:a(?:a(?:[ai][ai]?)?h|(?:ia?)?h|ia?)?|i[ai](?:[ai][ai]?)?h|h)?|z)|Jes(?:aja)?|E(?:sai?|zs)|(?:I\\-?sai\\-?|yasay|Yesay|I\\-?sa\\-?gi|E(?:cay|sei)|Liv[\\s\\xa0]*Ezayi[\\s\\xa0]*)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Izajasza)|(?:E(?:sa[ij]as|zayi)|Jesajan|I(?:zajasz|\\-?s)a))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:II(?:\.[\s\xa0]*S(?:amual[ls]|ma)|[\s\xa0]*S(?:amual[ls]|ma))|2(?:\.[\s\xa0]*S(?:amual[ls]|ma)|[\s\xa0]*S(?:amual[ls]|ma)))|(?:(?:2(?:\.[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw])|[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw]))|Druh[ay][\s\xa0]*Samuelov|II(?:\.[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw])|[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw])))a)|(?:2(?:[\s\xa0]*(?:[ei]\.?[\s\xa0]*Samuelit|samuelko)|Sam|[\s\xa0]*Regnorum|[\s\xa0]*S(?:amuel(?:i[st]|[el]|sbog)|m)|\.[\s\xa0]*(?:S(?:amuel(?:i[st]|[el]|sbog)|m)|Regnorum|samuelko))|II(?:\.[\s\xa0]*S(?:amuel(?:[els]|is)|m)|[\s\xa0]*S(?:amuel[eils]|m)|\.?[\s\xa0]*Regnorum)|(?:II\.?|2\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuela|Drug(?:a[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuela|knjiga[\s\xa0]*o[\s\xa0]*Samuelu)|i[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuela)|(?:II\.?[\s\xa0]*R|2\.?[\s\xa0]*R)egilor|Cartea[\s\xa0]*(?:a[\s\xa0]*doua|II)[\s\xa0]*a[\s\xa0]*Regilor|2\.?[\s\xa0]*Samuelsboken|2\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|And(?:en[\s\xa0]*(?:Kongerigernes[\s\xa0]*B|Samuelsb)og|r(?:a[\s\xa0]*Samuelsboken|e[\s\xa0]*Samuelsbok))|(?:Pili[\s\xa0]*Sam[uw]|II\.?[\s\xa0]*Samw|2\.?[\s\xa0]*Samw)eli|Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Samueli|(?:II(?:\.[\s\xa0]*Samu[ai]|[\s\xa0]*Samu[ai])|2(?:\.[\s\xa0]*Samu[ai]|[\s\xa0]*Samu[ai]))l|(?:2(?:[\s\xa0]*(?:S(?:am(?:uu['’]e|y)|hamooa)|Camuv|samuw)|\.[\s\xa0]*S(?:am(?:uu['’]e|y)|hamooa))|II(?:\.?[\s\xa0]*Samuu['’]e|\.?[\s\xa0]*Samy)|(?:Masodik|2e\.|2e|Tweede)[\s\xa0]*Samu|D(?:ruh[ay][\s\xa0]*Samu|ezyem[\s\xa0]*Samy))el|(?:2(?:(?:em|d)e|d|\.o)\.|Ikalawang|Zweite|Deuxiemes|2(?:(?:em|d)e|d|\.o)|Deuxieme|Cartea[\s\xa0]*II[\s\xa0]*a[\s\xa0]*lui)[\s\xa0]*Samuel|2[ao][\s\xa0]*Samuel|2[ao]\.[\s\xa0]*Samuel|(?:(?:II\.?[\s\xa0]*R|2\.?[\s\xa0]*R)eino|Liber[\s\xa0]*II[\s\xa0]*Samueli|2[ao][\s\xa0]*Reino|2[ao]\.[\s\xa0]*Reino)s|(?:II\.?|2\.?)[\s\xa0]*Kingdoms|2nd\.?[\s\xa0]*(?:S(?:amu[ae]l[ls]|ma)|Kingdoms)|2(?:\.[\s\xa0]*S(?:a(?:m(?:uel(?:s(?:bok)?|i)?)?)?)?|[\s\xa0]*S(?:a(?:m(?:uel(?:s(?:bok)?|i)?)?)?)?)|II(?:\.[\s\xa0]*S(?:a(?:m(?:ueli?)?)?)?|[\s\xa0]*S(?:a(?:m(?:uel)?)?)?)|Pili[\s\xa0]*Sam|(?:Masodik|2e\.|2e|Tweede)[\s\xa0]*Sam|Druh(?:a[\s\xa0]*S(?:am)?|y[\s\xa0]*S(?:am)?)|And(?:en[\s\xa0]*Sam(?:uel)?|re[\s\xa0]*Sam(?:uel)?)|2nd\.?[\s\xa0]*S(?:a(?:m(?:u[ae]l)?)?|m)|(?:D(?:ru(?:g(?:a[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuelow|Samuelo(?:va[\s\xa0]*knjig|w))|i[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*)?Samuelow)|h(?:y[\s\xa0]*(?:kniha|list)|a[\s\xa0]*kniha)[\s\xa0]*Samuelov)|ezyem[\s\xa0]*liv[\s\xa0]*Samyel[\s\xa0]*l)|Toinen[\s\xa0]*Samuelin[\s\xa0]*kirj|2[\s\xa0]*k[\s\xa0]*Samuelov|2[\s\xa0]*k\.[\s\xa0]*Samuelov|2[\s\xa0]*kniha[\s\xa0]*Samuelov|(?:II\.?|2\.)[\s\xa0]*kniha[\s\xa0]*Samuelov|(?:II\.?|2\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuelow)a|S(?:e(?:cond(?:[\s\xa0]*(?:S(?:amu[ae]l[ls]|ma)|Kingdoms)|[ao][\s\xa0]*Samuele)|gund(?:[ao][\s\xa0]*Reinos|[ao][\s\xa0]*Samuel)|cond[\s\xa0]*S(?:a(?:m(?:u[ae]l)?)?|m))|am(?:u(?:u['’]eel[\s\xa0]*Labaad|el(?:is?)?[\s\xa0]*II)|eela[\s\xa0]*Maxaafaa[\s\xa0]*Naa77anttuwaa)))|(?:II[\s\xa0]*Samueli[ns]|2[\s\xa0]*Samuelin|(?:II|2)\.[\s\xa0]*Samuelin|Toinen[\s\xa0]*Samuelin|Druga[\s\xa0]*Samuelova))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:I(?:\.?[\s\xa0]*Samual[ls]|\.?[\s\xa0]*Sma)|First[\s\xa0]*Samu[ae]l[ls])|(?:[1I]\.?[\s\xa0]*Samweli)|(?:1(?:[\s\xa0]*(?:[ei]\.?[\s\xa0]*Samuelit|samuelko)|Sam|[\s\xa0]*Regnorum|st\.?[\s\xa0]*Sma|st(?:\.[\s\xa0]*Samu[ae]|[\s\xa0]*Samu[ae])l[ls]|[\s\xa0]*S(?:amu(?:el(?:sbo(?:ken|g)|[el]|i[st])|al[ls])|ma)|[\s\xa0]*Kongerigernes[\s\xa0]*Bog|\.[\s\xa0]*(?:S(?:amu(?:el(?:sbo(?:ken|g)|[el]|i[st])|al[ls])|ma)|Regnorum|samuelko|Kongerigernes[\s\xa0]*Bog))|I(?:\.[\s\xa0]*S(?:amuel(?:[els]|is)|m)|[\s\xa0]*S(?:amuel[els]|m))|samuelko[\s\xa0]*pustak|Fyrri[\s\xa0]*Samuelsbok|I\.?[\s\xa0]*Regnorum|First[\s\xa0]*Sma|Forsta[\s\xa0]*Samuelsboken|(?:1\.?[\s\xa0]*R|I\.?[\s\xa0]*R)egilor|Cartea[\s\xa0]*(?:intai|I)[\s\xa0]*a[\s\xa0]*Regilor|Samu(?:u['’]eel[\s\xa0]*Kowaad|el(?:is?)?[\s\xa0]*I)|(?:(?:First|I\.?)[\s\xa0]*Kingdom|Liber[\s\xa0]*I[\s\xa0]*Samueli|1(?:st\.?[\s\xa0]*Ki|[\s\xa0]*Ki|\.[\s\xa0]*Ki)ngdom)s|(?:1\.?[\s\xa0]*R|I\.?[\s\xa0]*R)einos|1[ao][\s\xa0]*Reinos|1[ao]\.[\s\xa0]*Reinos|(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuela|P(?:r(?:im(?:eir[ao][\s\xa0]*Reinos|[ao][\s\xa0]*Samuele)|va[\s\xa0]*knjiga[\s\xa0]*o[\s\xa0]*Samuelu)|ierwsz[aey][\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuela)|(?:I(?:\.[\s\xa0]*Samu[ai]|[\s\xa0]*Samu[ai])|First[\s\xa0]*Samu[ae]|1\.?[\s\xa0]*Samui)l|(?:1(?:[\s\xa0]*(?:S(?:am(?:uu['’]e|y)|hamooa)|Camuv|samuw)|\.[\s\xa0]*S(?:am(?:uu['’]e|y)|hamooa))|I(?:\.?[\s\xa0]*Samuu['’]e|\.?[\s\xa0]*Samy)|Premye[\s\xa0]*Samy|(?:1(?:[ao]\.[\s\xa0]*|[ao][\s\xa0]*)|Primeir[ao][\s\xa0]*)Samu|(?:1(?:e?re|er|\.o)|Una|Pr(?:emiere?|imer))[\s\xa0]*Samu|(?:1(?:e?re|er|\.o)\.|Unang|Cartea[\s\xa0]*I[\s\xa0]*a[\s\xa0]*lui|Pr(?:emiere?s|imero))[\s\xa0]*Samu)el|1e[\s\xa0]*Samuel|1e\.[\s\xa0]*Samuel|(?:1(?:\.[\s\xa0]*Samuelo[vw]|[\s\xa0]*Samuelo[vw])|I\.?[\s\xa0]*Samuelo[vw]|Sameela[\s\xa0]*Maxaafaa[\s\xa0]*Koiruwa|1[\s\xa0]*k[\s\xa0]*Samuelov|1[\s\xa0]*k\.[\s\xa0]*Samuelov|(?:I\.?|1\.|1)[\s\xa0]*kniha[\s\xa0]*Samuelov|(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Samuelow|P(?:r(?:v(?:a[\s\xa0]*(?:Samuelova[\s\xa0]*knjig|kniha[\s\xa0]*Samuelov)|(?:y[\s\xa0]*list|ni|y|ni[\s\xa0]*kniha)[\s\xa0]*Samuelov)|emye[\s\xa0]*liv[\s\xa0]*Samyel[\s\xa0]*l)|ierwsz[aey][\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*)?Samuelow))a|(?:1\.?|I\.?)[\s\xa0]*Samuelin[\s\xa0]*kirja|E(?:(?:rste|lso|erste)[\s\xa0]*Samuel|nsimmainen[\s\xa0]*Samuelin[\s\xa0]*kirja)|1(?:st(?:(?:\.[\s\xa0]*Samu[ae]|[\s\xa0]*Samu[ae])l|\.[\s\xa0]*Sam?|[\s\xa0]*Sam?|\.?[\s\xa0]*Sm)|[\s\xa0]*S(?:a(?:m(?:u(?:el(?:s(?:bok)?|i)?|al))?)?|m)?|\.[\s\xa0]*S(?:a(?:m(?:u(?:el(?:s(?:bok)?|i)?|al))?)?|m)?)|I(?:\.[\s\xa0]*S(?:a(?:m(?:ueli?)?)?)?|[\s\xa0]*S(?:a(?:m(?:ueli?)?)?)?)|First[\s\xa0]*Sam?|First[\s\xa0]*Sm|Prvni[\s\xa0]*S(?:am(?:uel)?)?|1e[\s\xa0]*Sam|1e\.[\s\xa0]*Sam|E(?:erste|lso)[\s\xa0]*Sam|K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Samueli|wanza[\s\xa0]*Sam(?:[uw]eli)?))|(?:I[\s\xa0]*Samueli[ns]|Samu[ae]l[ls]|Prva[\s\xa0]*Samuelova|Samu[ae]l|1[\s\xa0]*Samuelin|[1I]\.[\s\xa0]*Samuelin|Ensimmainen[\s\xa0]*Samuelin))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*C(?:ron(?:icilor|ache)|hr(?:onik|n))|\.[\s\xa0]*Cronicilor|(?:[\s\xa0]*C(?:hronical|ronica)|\.[\s\xa0]*Cronica)s|(?:[\s\xa0]*C(?:hroni(?:cl|qu)|ronicl)|\.[\s\xa0]*Cronicl)es)|(?:2(?:[\s\xa0]*Ch?|\.[\s\xa0]*C)|II\.?[\s\xa0]*Ch)ronocles|2(?:[\s\xa0]*Cho|\.[\s\xa0]*Ch)ron[io]cles|2nd[\s\xa0]*C(?:hron[io]|ron[io])cles|2nd\.[\s\xa0]*C(?:hron[io]|ron[io])cles|Second[\s\xa0]*C(?:hron[io]|ron[io])cles)|(?:2[\s\xa0]*C(?:hron[io]|roni)cle)|(?:2[\s\xa0]*Chron)|(?:(?:2[\s\xa0]*(?:Ljetopis|Istw|Aikakirj)|(?:II\.?[\s\xa0]*K|2\.?[\s\xa0]*K)ronick|2\.?[\s\xa0]*Cronik|Masodik[\s\xa0]*Kronik)a)|(?:2\.?[\s\xa0]*Kronica)|(?:2(?:[\s\xa0]*(?:HanO|Ist|Ljet|Nalakamam|C(?:ronic[ail]|hro)|Krn|Kronikel)|\.[\s\xa0]*(?:C(?:ronic(?:[ai]|le)|hr(?:onik|n))|Kronikel)|nd\.?[\s\xa0]*Chrn)|Second[\s\xa0]*Chrn|(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Kronikak)[\s\xa0]*II|Paralipomenon[\s\xa0]*II|Taariikhdii[\s\xa0]*Labaad|2\.?[\s\xa0]*Babad|2[\s\xa0]*Hroniky|2\.[\s\xa0]*Hroniky|2Chr|(?:2(?:\.[\s\xa0]*Ch?|[\s\xa0]*C|nd\.?[\s\xa0]*Ch?)|Second[\s\xa0]*Ch?)oron[io]cles|2\.?[\s\xa0]*Paralipomen(?:on|a)|2\.?[\s\xa0]*Taariikhdii|(?:Pili|2\.?)[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|(?:2(?:(?:[\s\xa0]*(?:(?:e\.?|i\.?)[\s\xa0]*Kronika|Kronika)|\.[\s\xa0]*Kronika)v|\.[\s\xa0]*Chronicl|nd\.?[\s\xa0]*Chronicl)|Second[\s\xa0]*Chronicl|(?:Second[ao]|2\.)[\s\xa0]*Cronach)e|(?:2(?:[\s\xa0]*C(?:horon[io]|rono)|\.[\s\xa0]*Ch?rono|nd\.?[\s\xa0]*C(?:ron[io]|hrono))|Second[\s\xa0]*C(?:ron[io]|hrono))cle|2\.?[\s\xa0]*itihasko|I(?:I(?:\.[\s\xa0]*(?:C(?:ron(?:ic(?:(?:le|a)s|ilor)|ocles)|oron[io]cles|h(?:r(?:onicles|n)|oron[io]cles))|Hroniky|Babad|Paralipomen(?:on|a)|Kronika|Taariikhdii|Mambo[\s\xa0]*ya[\s\xa0]*Nyakati)|[\s\xa0]*(?:C(?:ron(?:ic(?:(?:le|a)s|ilor)|ocles)|oron[io]cles|h(?:r(?:onicles|n)|oron[io]cles))|Paralipomen[ao]|Babad|Hroniky|Kronika|Taariikhdii|Mambo[\s\xa0]*ya[\s\xa0]*Nyakati)|\.?[\s\xa0]*Kronikel|\.?[\s\xa0]*Cronache|\.?[\s\xa0]*Chronocle)|kalawang[\s\xa0]*(?:Kronik(?:el|a)|Chronicle|Paralipomeno))|(?:(?:2(?:(?:[ao]|\.o)[\s\xa0]*Cronic|\.?[\s\xa0]*Itih|(?:[ao]|\.o)\.[\s\xa0]*Cronic)|Segund[ao][\s\xa0]*Cronic)a|(?:2(?:nd\.?[\s\xa0]*|\.[\s\xa0]*)|Second[\s\xa0]*)Chronical|II\.?[\s\xa0]*Chronical)s|(?:II\.?|2\.)[\s\xa0]*Chroniques|2e\.?[\s\xa0]*Chroniques|2(?:de?|eme)[\s\xa0]*Chroniques|2(?:de?|eme)\.[\s\xa0]*Chroniques|2[\s\xa0]*Aikak|(?:II\.?|2\.?)[\s\xa0]*Kwonik|(?:(?:II\.?|2\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*K|Zweite[\s\xa0]*Ch)ronik|2[\s\xa0]*kniha[\s\xa0]*kronik|(?:II\.?|2\.)[\s\xa0]*kniha[\s\xa0]*kronik|(?:II\.?|2\.?)[\s\xa0]*Letopisu|(?:2(?:[\s\xa0]*Kroni(?:kebo|e)|e\.?[\s\xa0]*Kronie|\.[\s\xa0]*Kroni(?:kebo|e))|Andra[\s\xa0]*Kronikebo|Tweede[\s\xa0]*Kronie|II\.?[\s\xa0]*Kronie)ken|(?:Masodik|Anden)[\s\xa0]*Kron|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*|Liber[\s\xa0]*II[\s\xa0]*)Paralipomenon|2[\s\xa0]*k[\s\xa0]*(?:Paralipomenon|Kronik)|2[\s\xa0]*k\.[\s\xa0]*(?:Paralipomenon|Kronik)|D(?:ru(?:h(?:y[\s\xa0]*(?:kniha[\s\xa0]*kronik|Letopisu|Kronik|Paralipomenon|list[\s\xa0]*(?:Paralipomenon|Kronik))|a[\s\xa0]*(?:kniha[\s\xa0]*(?:Paralipomenon|Kronik)|Letopisu|Kronik|Paralipomenon))|g(?:(?:a[\s\xa0]*Ks(?:ieg[ai]|\.)?|i[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Kr|[ai][\s\xa0]*Kr)onik)|e(?:uxiemes?[\s\xa0]*Chroniques|zyem[\s\xa0]*Kwonik))|2(?:[\s\xa0]*(?:C(?:r(?:on?)?|hr?)|Aik)|e\.?[\s\xa0]*Kron|[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronika|[\s\xa0]*Kro(?:n(?:ika?)?)?|\.[\s\xa0]*(?:C(?:ron(?:icl)?|hr(?:on?)?)|Kro(?:n(?:ika?)?)?))|Tweede[\s\xa0]*Kron|2nd\.?[\s\xa0]*C(?:hr(?:on?)?|ron)|Second[\s\xa0]*C(?:hr(?:on?)?|ron)|2\.?[\s\xa0]*Taar|(?:2(?:\.[\s\xa0]*Ch?|[\s\xa0]*C|nd\.?[\s\xa0]*Ch?)|Second[\s\xa0]*Ch?)oron[io]cle|2\.?[\s\xa0]*Pa(?:r(?:alipomeno)?)?|II(?:\.[\s\xa0]*(?:C(?:ron(?:ic(?:le|a)|ic[il]|ocle)?|oron[io]cle|h(?:r(?:onicle|on?)?|oron[io]cle))|Taar|Pa(?:r(?:alipomeno)?)?|Kro(?:n(?:ik)?)?)|[\s\xa0]*(?:C(?:ron(?:ic(?:le|a)|ic[il]|ocle)?|oron[io]cle|h(?:r(?:onicle|on?)?|oron[io]cle))|Par?|Taar|Kro(?:n(?:ik)?)?))|Druh[ay][\s\xa0]*Pa|(?:2(?:[\s\xa0]*(?:Mga[\s\xa0]*[CK]roni[ck]|Ny)|\.[\s\xa0]*Mga[\s\xa0]*[CK]roni[ck])|(?:Pili|2\.)[\s\xa0]*Ny|(?:Toinen|2\.)[\s\xa0]*Aikakirj|I(?:I(?:\.[\s\xa0]*(?:Aikakirj|Ny)|[\s\xa0]*(?:Aikakirj|Ny)|\.?[\s\xa0]*Mga[\s\xa0]*Cronic)|kalawang[\s\xa0]*(?:Mga[\s\xa0]*)?Cronic)|2\.[\s\xa0]*Istw|II\.?[\s\xa0]*Istw|(?:II\.?|2\.)[\s\xa0]*Ljetopis|I(?:kalawang[\s\xa0]*Mg|I\.?[\s\xa0]*Mg)a[\s\xa0]*Kronik|2[\s\xa0]*k[\s\xa0]*Kronick|2[\s\xa0]*k\.[\s\xa0]*Kronick|D(?:ru(?:h(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?|y[\s\xa0]*(?:list[\s\xa0]*)?)Kronick|ga[\s\xa0]*(?:knjiga[\s\xa0]*)?Ljetopis)|ezyem[\s\xa0]*(?:liv[\s\xa0]*Kwonik[\s\xa0]*l|Istw))|Cartea[\s\xa0]*a[\s\xa0]*doua[\s\xa0]*Paralipomen)a|Hanidabaa[\s\xa0]*Odiya[\s\xa0]*Naa77antto[\s\xa0]*Maxaafaa)|(?:II[\s\xa0]*Paralipomenon|2[\s\xa0]*itihas|Druha[\s\xa0]*kniha[\s\xa0]*kronik))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*C(?:ron(?:icilor|ache)|hr(?:onik|n))|I\.?[\s\xa0]*Cronicilor|(?:1[\s\xa0]*C(?:hronical|ronica)|I\.?[\s\xa0]*Cronica)s|(?:1[\s\xa0]*C(?:hroni(?:cl|qu)|ronicl)|I\.?[\s\xa0]*Cronicl)es|(?:1(?:[\s\xa0]*C(?:ho?)?|\.[\s\xa0]*Ch?)|I\.?[\s\xa0]*C)ronocles|I\.?[\s\xa0]*Chron[io]cles|1st[\s\xa0]*C(?:hron[io]|ron[io])cles|1st\.[\s\xa0]*C(?:hron[io]|ron[io])cles|First[\s\xa0]*C(?:hron[io]|ron[io])cles)|(?:I\.?[\s\xa0]*Cronicle)|(?:(?:1[\s\xa0]*(?:Ljetopis|Istw|Aikakirj)|(?:1\.?[\s\xa0]*K|I\.?[\s\xa0]*K)ronick|1\.?[\s\xa0]*Cronik|Elso[\s\xa0]*Kronik)a)|(?:1\.?[\s\xa0]*Kronica)|(?:1(?:[\s\xa0]*(?:HanO|Ist|Ljet|Nalakamam|Cronic(?:[ai]|le)|Krn)|st\.?[\s\xa0]*Chrn|[\s\xa0]*Babad|[\s\xa0]*Hroniky|[\s\xa0]*itihasko|Chr|(?:st\.?)?[\s\xa0]*Coron[io]cles|st\.?[\s\xa0]*Choronocles|[\s\xa0]*Paralipomen(?:on|a)|[\s\xa0]*Kronikel|\.[\s\xa0]*(?:C(?:ronic(?:(?:le|a)s|ilor)|oron[io]cles|h(?:r(?:onicles|onik|n)|oronocles))|Hroniky|Babad|itihasko|Paralipomen(?:on|a)|Kronikel))|I(?:[\s\xa0]*(?:C(?:ronic[ail]|hrn)|Paralipomen[ao]|Kronikel)|\.[\s\xa0]*(?:C(?:ronic[ail]|hrn)|Kronikel))|Una(?:(?:ng)?[\s\xa0]*Kronikel|(?:ng)?[\s\xa0]*Kronika)|First[\s\xa0]*Chrn|Taariikhdii[\s\xa0]*Kowaad|I\.?[\s\xa0]*Babad|I\.?[\s\xa0]*Hroniky|Una(?:ng)?[\s\xa0]*Paralipomeno|(?:First|I\.?)[\s\xa0]*Coron[io]cles|(?:First|I\.?)[\s\xa0]*Choronocles|I\.[\s\xa0]*Paralipomen(?:on|a)|(?:1\.?[\s\xa0]*T|I\.?[\s\xa0]*T)aariikhdii|(?:1\.?|I\.?)[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Kwanza[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|(?:Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|Kronikak)[\s\xa0]*I|(?:(?:(?:First[\s\xa0]*Chronic|I\.?[\s\xa0]*Chronic)a|1(?:st\.?[\s\xa0]*Chronica|\.[\s\xa0]*Chronica))l|1\.?[\s\xa0]*Itiha|1(?:[ao]|\.o)[\s\xa0]*Cronica|1(?:[ao]|\.o)\.[\s\xa0]*Cronica)s|(?:1(?:st\.?[\s\xa0]*Cho|[\s\xa0]*Cho|\.[\s\xa0]*Cho)|(?:First|I\.?)[\s\xa0]*Cho)ronicles|(?:I\.?|1\.)[\s\xa0]*Chroniques|1(?:ere?|re)[\s\xa0]*Chroniques|1(?:ere?|re)\.[\s\xa0]*Chroniques|(?:1\.?[\s\xa0]*L|I\.?[\s\xa0]*L)etopisu|(?:Fyrri[\s\xa0]*Kronikubo|itihasko[\s\xa0]*pusta|1[\s\xa0]*Aika)k|(?:1\.?|I\.?)[\s\xa0]*Kwonik|(?:(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*K|Erste[\s\xa0]*Ch)ronik|1[\s\xa0]*kniha[\s\xa0]*kronik|(?:I\.?|1\.)[\s\xa0]*kniha[\s\xa0]*kronik|(?:1(?:\.[\s\xa0]*Kroni(?:kebo|e)|[\s\xa0]*Kroni(?:kebo|e))|Forsta[\s\xa0]*Kronikebo|I\.?[\s\xa0]*Kronie|1e[\s\xa0]*Kronie|1e\.[\s\xa0]*Kronie|Eerste[\s\xa0]*Kronie)ken|Elso[\s\xa0]*Kron|(?:1st\.?|First|Liber[\s\xa0]*I)[\s\xa0]*Paralipomenon|1[\s\xa0]*k[\s\xa0]*(?:Paralipomenon|Kronik)|1[\s\xa0]*k\.[\s\xa0]*(?:Paralipomenon|Kronik)|P(?:r(?:v(?:ni[\s\xa0]*(?:Letopisu|Kronik|kniha[\s\xa0]*kronik)|y[\s\xa0]*Kronik|ni[\s\xa0]*Paralipomenon|y[\s\xa0]*Paralipomenon|y[\s\xa0]*list[\s\xa0]*(?:Paralipomenon|Kronik)|a[\s\xa0]*(?:kniha[\s\xa0]*(?:Paralipomenon|Kronik)|Paralipomenon|Kronik))|(?:emier(?:es?|s)?[\s\xa0]*Chronique|ime(?:ir[ao]|ro?)[\s\xa0]*Cronica)s|emye[\s\xa0]*Kwonik)|ierwsz[aey][\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Kronik|ierwsz[aey][\s\xa0]*Kronik|aralipomenon[\s\xa0]*I)|(?:1(?:[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronikav|st\.?[\s\xa0]*Chronicl|[\s\xa0]*Kronikav|\.[\s\xa0]*Kronikav)|(?:First[\s\xa0]*Chronic|I\.?[\s\xa0]*Chronic)l|(?:I\.?|1\.)[\s\xa0]*Cronach|Prim[ao][\s\xa0]*Cronach)e|(?:1(?:[\s\xa0]*C(?:h(?:ron[io]|orono)|rono)|st(?:\.?[\s\xa0]*Cron[io]|\.?[\s\xa0]*Chrono)|\.[\s\xa0]*Ch?rono)|(?:I(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)|First[\s\xa0]*Ch)rono|First[\s\xa0]*Cron[io])cle|Una(?:ng)?[\s\xa0]*Chronicle|Choronicle|1(?:[\s\xa0]*(?:C(?:r(?:o(?:n(?:icl)?)?)?|h(?:r(?:on?)?)?)|Aik)|st(?:\.[\s\xa0]*Chr(?:on?)?|[\s\xa0]*Chr(?:on?)?|\.?[\s\xa0]*Cron)|[\s\xa0]*Taar|(?:st\.?)?[\s\xa0]*Coron[io]cle|st\.?[\s\xa0]*Choronocle|[\s\xa0]*Pa(?:r(?:alipomeno)?)?|[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronika|[\s\xa0]*Kro(?:n(?:ika?)?)?|\.[\s\xa0]*(?:C(?:ron(?:ic(?:le|a)|ic[il])?|oron[io]cle|h(?:r(?:onicle|on?)?|oronocle))|Taar|Pa(?:r(?:alipomeno)?)?|Kro(?:n(?:ika?)?)?))|I(?:[\s\xa0]*(?:C(?:hr(?:on?)?|ron)|Par?|Kro(?:n(?:ik)?)?)|\.[\s\xa0]*(?:C(?:hr(?:on?)?|ron)|Kro(?:n(?:ik)?)?))|First[\s\xa0]*Chr(?:on?)?|First[\s\xa0]*Cron|I\.?[\s\xa0]*Taar|(?:First|I\.?)[\s\xa0]*Coron[io]cle|(?:First|I\.?)[\s\xa0]*Choronocle|I\.[\s\xa0]*Pa(?:r(?:alipomeno)?)?|1e[\s\xa0]*Kron|1e\.[\s\xa0]*Kron|Eerste[\s\xa0]*Kron|Prvni[\s\xa0]*Pa|(?:(?:Una(?:(?:ng)?[\s\xa0]*Mga[\s\xa0]*Cr|(?:ng)?[\s\xa0]*Cr)|I\.?[\s\xa0]*Mga[\s\xa0]*Cr)onic|1(?:[\s\xa0]*(?:Mga[\s\xa0]*[CK]roni[ck]|Ny)|\.[\s\xa0]*Mga[\s\xa0]*[CK]roni[ck])|(?:I\.?|1\.)[\s\xa0]*Aikakirj|Ensimmainen[\s\xa0]*Aikakirj|(?:I\.?|1\.)[\s\xa0]*Ny|Kwanza[\s\xa0]*Ny|1\.[\s\xa0]*Istw|I\.?[\s\xa0]*Istw|(?:I\.?[\s\xa0]*L|1\.[\s\xa0]*L)jetopis|(?:Una(?:ng)?[\s\xa0]*Mg|I\.?[\s\xa0]*Mg)a[\s\xa0]*Kronik|1[\s\xa0]*k[\s\xa0]*Kronick|1[\s\xa0]*k\.[\s\xa0]*Kronick|Pr(?:v(?:a[\s\xa0]*(?:kn(?:jiga[\s\xa0]*Ljetopis|iha[\s\xa0]*Kronick)|Ljetopis|Kronick)|y[\s\xa0]*(?:list[\s\xa0]*)?Kronick)|emye[\s\xa0]*(?:liv[\s\xa0]*Kwonik[\s\xa0]*l|Istw))|Cartea[\s\xa0]*intai[\s\xa0]*Paralipomen)a|Hanidabaa[\s\xa0]*Odiyaa[\s\xa0]*Koiro[\s\xa0]*Maxaafaa)|(?:(?:C(?:h(?:ron(?:ic(?:al|le)|ocle)|oron[io]cle)|(?:oron[io]|ron[io])cle)|1[\s\xa0]*itiha)s|C(?:h(?:ron[io]|orono)|oron[io]|ron[io])cle|Paralipomenon|I(?:[\s\xa0]*(?:Paralipomenon|Kronika)|\.[\s\xa0]*Kronika)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Ezra"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:Cesra|edzr|Esran[\\s\\xa0]*kirj)a)|(?:E(?:s(?:ra(?:s[\\s\\xa0]*)?bok|dra)|z(?:ras[\\s\\xa0]*Bog|s?dras)|d)|Izira|Cesr|Liber[\\s\\xa0]*Esdrae|E(?:z(?:d(?:ra?)?|sd|ra?)|s(?:dr?|ra?))|Izir|Ces|(?:Liv[\\s\\xa0]*Esdras[\\s\\xa0]*l|Aejr)a|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Ezdrasz|njiga[\\s\\xa0]*Ezrin)a)|(?:E(?:s(?:dra[es]|ra[ns])|zdrasza)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ruth"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:R(?:u(?:t(?:s[\\s\\xa0]*bok|e|arbok|hs[\\s\\xa0]*Bog)|u(?:tin[\\s\\xa0]*kirja|d))|oot|th)|Liber[\\s\\xa0]*Ruth|Uruto|Liv[\\s\\xa0]*Rit[\\s\\xa0]*la|R(?:u(?:ta|ut)?|t)|Uru|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Ruthy|njiga[\\s\\xa0]*o[\\s\\xa0]*Ruti|s(?:ieg[ai]|\\.)?[\\s\\xa0]*Rut|itabu[\\s\\xa0]*cha[\\s\\xa0]*Ruth[iu]))|(?:R(?:u(?:t(?:h[iu]|s|h)?|utin)|it)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Neh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:N(?:e(?:hem(?:i(?:an[\\s\\xa0]*kir)?j|ei|y)|kemiy|emij)|ahimiya)a|nahemyahko[\\s\\xa0]*pustak)|(?:N(?:e(?:h(?:em(?:i(?:a(?:[ai]?h|bok|s’[\\s\\xa0]*Bog)|[eh]|ih|i[ai]h)|a(?:[ai][ai]|[ai])?h|jas[\\s\\xa0]*bok)|(?:im(?:(?:a[ai]|ii)[ai]|ia[ai])|im(?:a[ai]|ii)|imia?|amia|ima)h)|xemyaah|emias)|ah(?:emyah|i))|Li(?:ber[\\s\\xa0]*Nehemiae|v[\\s\\xa0]*Neyemi[\\s\\xa0]*an)|Ne(?:h(?:amia|imia|em[ij]a)?|em(?:ia?)?|x)?|nahemya|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Nehemiasz|njiga[\\s\\xa0]*Nehemijin)a)|(?:Ne(?:hem(?:ia(?:s(?:za)?|[en])|jas)|yemi)|nahemyahko))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["GkEsth"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Es(?:t(?:er(?:[\\s\\xa0]*(?:\\((?:Gr(?:i(?:e(?:chisch|go|ks)|yego)|eg[ao]|yego)|greco|Gr|versione[\\s\\xa0]*greca)\\)|Gr(?:eg[ao]|yego|iy?ego)|greco|recke[\\s\\xa0]*(?:dodatky|casti)|Gr|enligt[\\s\\xa0]*den[\\s\\xa0]*grekiska[\\s\\xa0]*texten)|arbok[\\s\\xa0]*hin[\\s\\xa0]*griska)|h(?:er[\\s\\xa0]*Grec|[\\s\\xa0]*Gr)|[\\s\\xa0]*Gr|g|her[\\s\\xa0]*graeca|(?:her[\\s\\xa0]*\\(Gre(?:ek|c)|[\\s\\xa0]*\\(Gr)\\)|her[\\s\\xa0]*Gr)|zter[\\s\\xa0]*konyvenek[\\s\\xa0]*kiegeszitese)|Den[\\s\\xa0]*greske[\\s\\xa0]*Ester\\-?boka|G(?:k[\\s\\xa0]*?|r[\\s\\xa0]*)Esth|GrEst|Kr\\.?[\\s\\xa0]*Est|Gr(?:e(?:cke[\\s\\xa0]*casti[\\s\\xa0]*knihy[\\s\\xa0]*Est|ek[\\s\\xa0]*Esth)|aeca[\\s\\xa0]*Esth)er|Kreikkalainen[\\s\\xa0]*Esterin[\\s\\xa0]*kirja|G(?:r(?:eek[\\s\\xa0]*Esth?|[\\s\\xa0]*Est)|k[\\s\\xa0]*Est)|Den[\\s\\xa0]*greske[\\s\\xa0]*Ester\\-?boken)|(?:Est(?:er[\\s\\xa0]*(?:\\((?:Grie(?:chisch|ks)|gr(?:iego|ega))\\)|gr(?:iego|ega))|h(?:er[\\s\\xa0]*grec|[\\s\\xa0]*gr)|[\\s\\xa0]*gr|(?:her[\\s\\xa0]*\\(grec|[\\s\\xa0]*\\(Gr)\\)|h?er[\\s\\xa0]*gr)|Kreikkalainen[\\s\\xa0]*Esterin))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Esth"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:Ester(?:ar|s[\\s\\xa0]*)bo|estarko[\\s\\xa0]*pusta)k)|(?:Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Estery|Asttiro|(?:Liber[\\s\\xa0]*Esthe|Aeste|asta)r|Ast|Liv[\\s\\xa0]*Este[\\s\\xa0]*a|E(?:s(?:t(?:e(?:r(?:s[\\s\\xa0]*Bog|ei|a|in[\\s\\xa0]*kirja)?|er)|[ah]r|[ah])?|zter|zt)?|t))|(?:Ester(?:[sy]|in))|(?:est(?:arko|er)|Est(?:her|e)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Job"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:G(?:iobbe|b)|Hiobi|Yob|Ayub|Iov|(?:Ayuu|Iyo)b|(?:Ayyo|Ij)ob|Liber[\\s\\xa0]*Iob|J(?:o(?:bs[\\s\\xa0]*Bog|v)|b)|Jobs[\\s\\xa0]*?bok|ayyubko[\\s\\xa0]*pustak|(?:Jobin[\\s\\xa0]*kirj|Liv[\\s\\xa0]*Job[\\s\\xa0]*l|Iyyoob)a|Hi(?:ob)?|Ayu|Jobi|Yopu|K(?:(?:s(?:\\.[\\s\\xa0]*(?:Ij|J|Hi)|[\\s\\xa0]*(?:Ij|J|Hi)|ieg[ai][\\s\\xa0]*(?:Ij|J|Hi))ob|[\\s\\xa0]*Jobov|\\.[\\s\\xa0]*Jobov|niha[\\s\\xa0]*Jobov)a|njiga[\\s\\xa0]*o[\\s\\xa0]*Jobu|itabu[\\s\\xa0]*cha[\\s\\xa0]*(?:Ayu|Yo)bu))|(?:Job(?:[as]|in)|(?:iy|I)ob|Yobu|Ayubu|Hioba|Job|ayyubko))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Malakee)|(?:M(?:a(?:l(?:a(?:c(?:hi(?:as|e)|i)|quias|akii|ki(?:as’[\\s\\xa0]*Bog|s[\\s\\xa0]*bok))|(?:ea[ck]?|ic)hi|ch)|\\-?la\\-?(?:ch|k)i)|l)|(?:M(?:al(?:a(?:kian[\\s\\xa0]*kir|hi)j|kiy)|ikiyaas)|Liv[\\s\\xa0]*Malachi[\\s\\xa0]*)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Malachiasza|Mal(?:a(?:c(?:h(?:ia)?)?|qu|kia?)?|c)?|Pro(?:roctwo[\\s\\xa0]*Malachyaszow|phetia[\\s\\xa0]*Malachia)e)|(?:Mala(?:chi(?:asza)?|kia[ns])|malaki))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i)))ew)|(?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:(?:Ew(?:angelia[\\s\\xa0]*(?:wg[\\s\\xa0]*sw\\.?[\\s\\xa0]*)?|\\.?[\\s\\xa0]*)Mateusz|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*Matvij)a|Evankeliumi[\\s\\xa0]*Matteuksen[\\s\\xa0]*mukaan|Evanjelium[\\s\\xa0]*Podla[\\s\\xa0]*Matusa|(?:Evangelie(?:[\\s\\xa0]*volgens|t[\\s\\xa0]*etter)[\\s\\xa0]*Matte|Injil[\\s\\xa0]*Mati)us|Evangelium[\\s\\xa0]*secundum[\\s\\xa0]*Matthaeum|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Mateut|Injili[\\s\\xa0]*ya[\\s\\xa0]*Mathayo|Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Matteo|E(?:banghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay|l[\\s\\xa0]*Evangelio[\\s\\xa0]*de)[\\s\\xa0]*Mateo|Sulat[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Mateo|Ebanghelyo[\\s\\xa0]*ni[\\s\\xa0]*(?:San[\\s\\xa0]*)?Mateo|M(?:a(?:t(?:t(?:e(?:u(?:ksen[\\s\\xa0]*evankeliumi|sevangeliet)|i[\\s\\xa0]*evangelium|e|yu[\\s\\xa0]*Narceyti)|h(?:eus|ieu|ae?us))|e(?:[ij]|usz)|h|ayos|us|ousovo[\\s\\xa0]*evangelium)|atiyoosa|buting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*)?Mateo)|t[ht])|(?:Evangelium[\\s\\xa0]*podle[\\s\\xa0]*Matous|matt(?:ayan|il)|Maty)e|Mat(?:e(?:us?)?|ayo|ous|th)|Ew[\\s\\xa0]*Mat|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))))|(?:(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i))|[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|aint[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i))|[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|aint[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|Matt(?:h[ht]i?|h?i|t(?:hi?|i))))e|Mat(?:(?:h[ht]?i|t[ht])e|h[ht]?e|h[ht][ht]i?e))w)|(?:(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))ew)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))|Mat(?:te(?:u(?:ksen|s)|yu|o)|ius|usa|eusza|hayo)|San[\\s\\xa0]*Mateo|Evangelio[\\s\\xa0]*de[\\s\\xa0]*Mateo)|(?:(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt)ew)|(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|Mateo)|(?:M(?:at(?:t(?:hwe|we)?)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ps"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Psmal(?:ms?|s))|(?:Ps(?:lal?m|ml)s)|(?:(?:Salmarni|Zalta)r)|(?:P(?:s(?:a(?:l(?:m(?:u[ls]|[sy]|[lm]s|e[nt]|a[su]|i(?:en[\\s\\xa0]*kirja|[it]))|taren|a?s|[al]ms)|m(?:l[as]|s|as)|a(?:ms|a)|(?:ml?m|ume|alm)s)|m(?:[lm]|al)|sm|l(?:m[ms]|am)|lmas)|(?:a(?:s(?:ml|s)|m[ls]|l[lm])|l(?:ama|m)|la(?:sm?|m)|asm|l(?:s(?:a?m|sss)|a(?:sm)?a)|a(?:ls|sl)m)s)|Sa(?:lm(?:e(?:rnes[\\s\\xa0]*Bog|nes[\\s\\xa0]*bok)|[is]|au)|buurradii)|Za(?:buri|lmy)|Mga[\\s\\xa0]*Awit|Thi|Zsoltarok|Slm|Salmos|Bhjan|stotrasamhita|K(?:niha[\\s\\xa0]*zalm(?:ov|u)|\\.?[\\s\\xa0]*zalmov|s(?:ieg[ai]|\\.)?[\\s\\xa0]*Psalmow)|Mga[\\s\\xa0]*Salmo|Mazamure|Li(?:bri[\\s\\xa0]*i[\\s\\xa0]*Psalmeve|v[\\s\\xa0]*Som[\\s\\xa0]*yo)|(?:Liber[\\s\\xa0]*Psalmoru|Pslal)m|P(?:s(?:a(?:l(?:m(?:[lm]|e|a|i)?|[al]m|a)?|ml?m|ume|alm|ml?|u)?|l[am]|ma?|s)?|l(?:s(?:a?m|sss)|a(?:sm)?a)|a(?:ls|sl)m|l(?:a(?:sm?|m)|s(?:ss?|a)))|Sa(?:l(?:m(?:e(?:rne|ne)?)?)?|buur)|Z(?:a(?:b(?:ur)?|lm)|solt)?|Maz|Sl|(?:Masm|Jab)ur|Ca(?:rtea[\\s\\xa0]*Psalmilor|nkitam))|(?:S(?:alm(?:enes|o)|om)|Psalmien|Awit))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eccl"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Predik(?:arens[\\s\\xa0]*bok|erens)|Eclesiastes)|(?:(?:E(?:klezyas[\\s\\xa0]*\\-?[\\s\\xa0]*Liv[\\s\\xa0]*Filozof[\\s\\xa0]*l|ranchcha)|Saarnaajan[\\s\\xa0]*kirj)a)|(?:Saarnaaja)|(?:Ec(?:cles(?:(?:(?:s[ai][ai]|aa)s|s[ai][ai]|aa|ais?)tes|i(?:a(?:ste|tes)|is?tes))|les(?:(?:(?:s[ai][ai]|a[ai]|ii)s|s[ai][ai]|a[ai]|ii|ia)tes|iaste))|Wacdiyaha|Qoheleth|Juru[\\s\\xa0]*Kotbah|Saarn|(?:M(?:agwawal|hubir)|Wacdiyahi)i|P(?:r(?:e(?:di(?:k(?:a(?:r(?:boke|in|e)n|tor)|eren|uesi)|ger)|gethwr)|ad)|iracanki)|(?:Pr(?:edikantens[\\s\\xa0]*bo|opovjedni)|Forkynnerens[\\s\\xa0]*bo)k|Sabhopadeshak|upadesakko[\\s\\xa0]*pustak|Ekklezijast|Coelet|Ecc?lesiasties|Ec(?:clesi(?:a(?:stic|at)|t)|lesiastic)es|Ec(?:cles(?:i(?:a[ai])?|a)|lesi)stes|Eccles(?:ia?|a)iastes|E(?:cl(?:es(?:iai|y)|is[iy])|kl(?:es[iy]|is[iy]))astes|Ek(?:kles|lez)iastes|Liber[\\s\\xa0]*(?:Ecclesiastes|Qoelet)|(?:Ec(?:le[sz]|cles)iastu|Ang[\\s\\xa0]*Mangangara)l|E(?:c(?:c(?:l(?:es(?:(?:(?:s[ai][ai]|aa)s|s[ai][ai]|aa|ais?)te|i(?:a(?:st|te)|is?te))?)?)?|les(?:(?:s[ai][ai]|a[ai]|ii)s|s[ai][ai]|a[ai]|ii|ia)te|l(?:e(?:ziast|s))?)?|kl)|Qo(?:h(?:elet)?)?|Mhu|Wac|Saar|Pr(?:e(?:d(?:iker)?|g)|op)|Fork(?:ynneren)?|upadesak|(?:Mang|Er)a|K(?:s(?:\\.[\\s\\xa0]*(?:K(?:aznodziei[\\s\\xa0]*Salomon|ohelet)|Eklezjastes)|[\\s\\xa0]*(?:K(?:aznodziei[\\s\\xa0]*Salomon|ohelet)|Eklezjastes)|ieg[ai][\\s\\xa0]*(?:K(?:aznodziei[\\s\\xa0]*Salomon|ohelet)|Eklezjastes))a|a(?:znodziei[\\s\\xa0]*Salomonowego|alam)|ohelet(?:[\\s\\xa0]*—[\\s\\xa0]*Kazatel|h)|azn?|oh|(?:niha|\\.)?[\\s\\xa0]*kazatelova))|(?:(?:Koh|Qo)elet|Filozof|upadesakko|Saarnaajan|Kazatel|Mangangaral|E(?:cclesiaste|klezya)s|Liv[\\s\\xa0]*Filozof[\\s\\xa0]*la))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ezek"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:E(?:z(?:e(?:[ei](?:qu|k)e|qu(?:i[ae]|e)|k(?:ia|e))|i(?:[ei](?:qu|k)|qu|k)e)|x[ei][ei]?ke)l|E(?:z(?:e(?:kiel(?:s’?[\\s\\xa0]*Bog|i)|chiele)|[kq])|sk)|Jezekiil['’]|(?:E(?:z(?:i(?:[ei](?:qu|k)|qu|k)|e(?:[ei](?:qu|k)|c))i|se(?:ci|ky)|cekkiy|x[ei][ei]?ki)|Y(?:ahejak|exesqe)|yahedzk)el|Yehe[sz]kiel|Iezechiel|Esekiels[\\s\\xa0]*bok|(?:Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Ezechie|Liv[\\s\\xa0]*Ezekyel[\\s\\xa0]*)la|H(?:e(?:sekiel(?:in[\\s\\xa0]*kirja|s[\\s\\xa0]*bok)|zechiel)|izqqeela)|E(?:ze(?:c(?:h(?:iel)?)?|qu?|k(?:iel)?)?|se(?:k(?:iel)?|c))|Yex|H(?:es(?:ekiel)?|iz)|Prophetia[\\s\\xa0]*Ezechielis)|(?:Eze(?:chiela|kyel)|Hesekielin))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hos"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:Hose(?:a(?:s(?:’[\s\xa0]*Bog|[\s\xa0]*bok))?|ias?)|hosey)|(?:(?:Hoos(?:e(?:an[\s\xa0]*kirj|7)|heec)|Osij)a)|(?:O(?:se(?:ia[hs]|a[hs])|zeas)|H(?:o(?:osh|sho|zeas)|s)|hose|Prophetia[\s\xa0]*Osee|O(?:s(?:ei?a)?|z)|Ho(?:os|s)?|(?:Liv[\s\xa0]*Oze[\s\xa0]*|Ociy)a|Ks(?:ieg[ai]|\.)?[\s\xa0]*Ozeasza)|(?:O(?:ze(?:asza)?|see)|Ho(?:osean|seas)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Obad"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:O(?:b(?:ad(?:ia(?:s['’][\\s\\xa0]*Bog|h)|hah|jas[\\s\\xa0]*bok)|edias|d|idah)|vdij)|Abd(?:diyyu|ias|ijas)|Cobadyaah|(?:O(?:ba(?:d(?:jan[\\s\\xa0]*kirj|ei|ij)|j)|patiy|vadi)|obadiy|Liv[\\s\\xa0]*Abdyas[\\s\\xa0]*l)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Abdiasza|Ab(?:d(?:ia?)?)?|Cob(?:ad)?|Ob(?:a(?:d(?:ja?|ia)?)?)?|Avdie|Pro(?:roctwo[\\s\\xa0]*Abdyaszow|phetia[\\s\\xa0]*Abdia)e)|(?:Obad(?:ja[ns]|ias)|Abd(?:iasza|yas)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hag"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:A(?:g(?:e(?:[jo]|us)|heu|ge[eo])|kay)|Xaggay|Ohij|haggay|Agg(?:ae?|e)us|H(?:ag(?:g(?:a(?:is[\\s\\xa0]*bok|js[\\s\\xa0]*Bog)|e(?:us|o)|ia[hi])|a[ij]|e[jo])|gg)|(?:Haggain[\\s\\xa0]*kirj|Liv[\\s\\xa0]*Aje[\\s\\xa0]*)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Aggeusza|(?:Ha(?:gga|\\-?g)|A\\-?g)ai|H(?:ag(?:g(?:a(?:i|j)?)?)?|g)|Ag(?:eu|g)?|Xagg?|Pro(?:roctwo[\\s\\xa0]*Aggieuszowe|phetia[\\s\\xa0]*Aggaei))|(?:A(?:ggeusza|je)|Haggain))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hab"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Habacuque)|(?:(?:I(?:rmbbaaqoom|mb)|Liv[\\s\\xa0]*Abakik[\\s\\xa0]*l|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Habakuk)a|A(?:b(?:akuka|k)|va[ck]um)|Xabaquuq|A(?:bako|pak)uk|Hab(?:a(?:k(?:k(?:uk(?:s[\\s\\xa0]*(?:Bog|bok)|k)|(?:ak|oo)k)|akk|uk(?:in[\\s\\xa0]*kirja|[ku]))|ckuk|quq)|bak(?:k[au]|[au])kk|[ck])|Hab(?:bac[au]|aca)c|(?:Habac|Aba)cuc|Hab(?:a(?:k(?:k[au]k|ak|uki?)?|c)|bak(?:k[au]|[au])k)?|Abak(?:uk)?|Xab|Pro(?:roctwo[\\s\\xa0]*Abakukowe|phetia[\\s\\xa0]*Habacuc))|(?:Haba(?:kuk(?:in|a)|cuc)|(?:habakk?u|Abaki)k))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mic"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Micheas)|(?:M(?:i(?:c(?:h(?:e[ae]|ah)|ah)|hej|(?:cha|que)as|(?:chae|quei)as|k(?:a(?:s[\\s\\xa0]*(?:Bog|bok)|h)|(?:ey?|ie)as)|ikaah)|yhej|q)|(?:M(?:i(?:hei|\\-?c|kh|lkkiyaas|ikan[\\s\\xa0]*kirj)|eek)|Liv[\\s\\xa0]*Miche[\\s\\xa0]*)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Micheasza|Mi(?:c(?:ha?|a)?|[hq]|k(?:ea|a)?|lk|ika?)|Prophetia[\\s\\xa0]*Michaeae)|(?:Mi(?:che(?:asza)?|ikan|kas)|mika))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zech"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ze(?:ch[ae]|ka)riah)|(?:Zaccharie)|(?:Z(?:a(?:c(?:h(?:ar(?:i(?:a[hs]|[eh])|ah)|er(?:ia?|a)h)|ch)|harij?a|karia(?:s['’][\\s\\xa0]*Bog|h))|ech[ae]ri[ah]|ch|ech[ae]rah|(?:ach(?:ar(?:a[ai]|ii)|er(?:a[ai]|ii))|ech(?:[ae]ra[ai]|[ae]rii))h)|Jakaryah|Zac(?:harj|ari)as|S(?:a(?:kar(?:ja(?:boken|s[\\s\\xa0]*bok)|ias)|carias)|ekaryaah)|(?:Xa\\-?cha\\-?ri\\-?|[Cj]akariy|Liv[\\s\\xa0]*Zakari[\\s\\xa0]*|Zakkaariyaas|Z(?:a(?:cc|kh)|ek)ari|S(?:a(?:karjan[\\s\\xa0]*ki|cha)rj|echarei))a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Zachariasza|Z(?:a(?:c(?:h(?:aria|eria)?|ar|c)?|h(?:arij)?|k(?:aria|k)?)?|e(?:ch?|k)|c)|S(?:a(?:k(?:ar[ij]a)?|ch)|e(?:ch|k))|Prophetia[\\s\\xa0]*Zachariae)|(?:Za(?:kari(?:as)?|chariasza)|Xa\\-?cha\\-?ri|Sakarjan|Xa))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zeph"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Sofonias)|(?:S(?:o(?:fon(?:i(?:j[ae]|[ae])|jas)|phoni(?:as|e))|z(?:efa|ofo)nias|f|apanyah|e(?:fan(?:ias['’][\\s\\xa0]*Bog|yaah|jas[\\s\\xa0]*bok)|p(?:anias|h)))|Z(?:e(?:phan(?:ia[hs]|aiah)|faniah)|(?:a(?:ph|f)ania|p)h)|Liv[\\s\\xa0]*Sofoni[\\s\\xa0]*an|Z(?:epa|ofo)nias|Zefanias’[\\s\\xa0]*Bog|(?:S(?:ef(?:an(?:jan[\\s\\xa0]*kir|i)j|fanei)|ofonaas)|Ze(?:fan[jy]|phanj)|Ceppaniy|Tefani)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Sofoniasza|Z(?:e(?:p(?:h(?:an(?:aia|ia)?)?)?|f(?:ania)?)|a(?:ph|f)ania|p)|Tef|S(?:e(?:f(?:an[ij]a|f)?|pania)|o(?:fo?|ph)|zof)|Pro(?:roctwo[\\s\\xa0]*Sofoniaszow|phetia[\\s\\xa0]*Sophonia)e)|(?:S(?:efan(?:ias|jan)|ofoni(?:asza)?)|Zefanias|sapanyah))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Luke"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Lu(?:kac|uko)s)|(?:L(?:u(?:kasevangeliet|c|kka[\\s\\xa0]*Narceyti|ukkaan[\\s\\xa0]*evankeliumi)|ik|c)|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*Luky|(?:Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Luc|Injili[\\s\\xa0]*ya[\\s\\xa0]*Luk|L(?:(?:lu|oo)k|u\\-?c))a|Luqaasa|luka[ln]e|Lukas(?:ovo)?[\\s\\xa0]*evangelium|Evan(?:gelium[\\s\\xa0]*(?:secundum[\\s\\xa0]*Lucam|podle[\\s\\xa0]*Lukase)|jelium[\\s\\xa0]*Podla[\\s\\xa0]*Lukasa|keliumi[\\s\\xa0]*Luukkaan[\\s\\xa0]*mukaan)|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:uke|k)|[\\s\\xa0]*L(?:uke|k))|aint[\\s\\xa0]*L(?:uke|k))|L(?:uke|k))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:uke|k)|[\\s\\xa0]*L(?:uke|k))|aint[\\s\\xa0]*L(?:uke|k))|L(?:uke|k)))|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Luk?|[\\s\\xa0]*Luk?)|aint[\\s\\xa0]*Luk?)|Luk?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Luk?|[\\s\\xa0]*Luk?)|aint[\\s\\xa0]*Luk?)|Luk?))|L(?:u(?:uk|q)|lu)?|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Lukes|(?:E(?:vangeliet[\\s\\xa0]*etter[\\s\\xa0]*Luk|l[\\s\\xa0]*Evangelio[\\s\\xa0]*de[\\s\\xa0]*Luc)|Sulat[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Luc|Injil[\\s\\xa0]*Luk)as|Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Lu[ck]as|Ebanghelyo[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Lu[ck]as|Ebanghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*Lu[ck]|Lu[ck])as|Mabuting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*Lu[ck]|Lu[ck])as)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k)))|L(?:u(?:k(?:ka|e|asa)|cas|ukkaan)|k)|San[\\s\\xa0]*Lucas|Evangelio[\\s\\xa0]*de[\\s\\xa0]*Lucas|Lu(?:k(?:as?)?|ca)?|St[\\s\\xa0]*L(?:u(?:ke?)?|k)|St\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|Saint[\\s\\xa0]*L(?:u(?:ke?)?|k)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jer"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:er(?:(?:im(?:i[ai]|a)|m[im]a|a(?:m[ai]i|ia)|ami?a|imi)h|amiha|em(?:i(?:as['’][\\s\\xa0]*Bog|ih|e|ha)|a(?:ia|i)?h))|r)|Li(?:ber[\\s\\xa0]*Ieremiae|v[\\s\\xa0]*Jeremi[\\s\\xa0]*an)|Ieremias|Gr|Y(?:eremya|irmay)ah|Jeremias[\\s\\xa0]*bok|yarmiyako[\\s\\xa0]*pustak|(?:H[ei]r[ei]m[iy]|Jeremj)as|Sulat[\\s\\xa0]*ni[\\s\\xa0]*Jeremias|(?:Jerem(?:i(?:an[\\s\\xa0]*kir)?j|ei)|Ermmaas|Yeremi|Geremi|Eremiy|yirmay)a|Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Jeremiasza|Je(?:r(?:e(?:m(?:i[ah])?)?|amia|amih)?)?|Ier(?:emia)?|Ger|Erm|Yer|Aklat[\\s\\xa0]*ni[\\s\\xa0]*Jeremia[hs])|(?:Jeremi(?:a(?:s(?:za)?|[hn]))?|yarmiyako))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:(?:2(?:[\s\xa0]*(?:Corint(?:h(?:i(?:e[nr]|na|on|ain)|ai?n)|i(?:er|on))|Korinto)|(?:e\.?[\s\xa0]*Korinth?|\.[\s\xa0]*Corinth?)ier|\.[\s\xa0]*Korinto)|II(?:(?:\.?[\s\xa0]*Korinthi|\.?[\s\xa0]*Korinti|\.?[\s\xa0]*Corinth?i)er|\.?[\s\xa0]*Korinto)|2[\s\xa0]*Corinth(?:ia|o|ai)an|2[\s\xa0]*Corinth[io]ian|(?:II\.?[\s\xa0]*C|2\.?[\s\xa0]*C)orthian)s|2(?:[\s\xa0]*(?:Korint(?:(?:asv|ern)e|anom|usi|ier(?:ne|s)|i?erbrevet|h(?:ier(?:brevet|s)|erbrevet))|Corint(?:h(?:i(?:[no]s|aid)|e)|ios))|\.[\s\xa0]*Korint(?:erbrevet|usi))|2[\s\xa0]*Corinthian[ao]?s|2nd[\s\xa0]*Cor(?:inthian[ao]?|thian)s|2nd\.[\s\xa0]*Cor(?:inthian[ao]?|thian)s|Second[\s\xa0]*Cor(?:inthian[ao]?|thian)s|2[\s\xa0]*Korinthusiakhoz|2\.[\s\xa0]*Korinthusiakhoz|Masodik[\s\xa0]*Korinthusiakhoz)|(?:(?:(?:2(?:[\s\xa0]*(?:Corinth|Korynt)|\.[\s\xa0]*(?:Korynt|Corth))|II(?:\.?[\s\xa0]*Korynt|\.?[\s\xa0]*Corth))ia|(?:II\.?|2\.?)[\s\xa0]*Korentye)n|2[\s\xa0]*Corth(?:ian)?|2nd[\s\xa0]*Corth(?:ian)?|2nd\.[\s\xa0]*Corth(?:ian)?|Second[\s\xa0]*Corth(?:ian)?)|(?:2(?:[\s\xa0]*(?:Korint(?:i(?:yarukku|o)|[ao])|Corinti?o)|e(?:\.[\s\xa0]*[CK]|[\s\xa0]*[CK])orinthe|[\s\xa0]*Korinth?erbrev|\.[\s\xa0]*Korint(?:i(?:ers|o)|erbrev|o|hiers))|And(?:e(?:[nt][\s\xa0]*Korinth|n[\s\xa0]*Korint)|re[\s\xa0]*korint)erbrev|2nd\.?[\s\xa0]*Corinthian|Second[\s\xa0]*Corinthian|(?:Second(?:a[\s\xa0]*(?:lettera[\s\xa0]*ai[\s\xa0]*)?|o[\s\xa0]*)Corinz|Masodik[\s\xa0]*Korintus|2[\s\xa0]*Corinz|2[\s\xa0]*Corinten)i|2[\s\xa0]*Corintie(?:ni|r)|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corinthins|2\.[\s\xa0]*Cor(?:in(?:t(?:h(?:i(?:a(?:id|ns)|[no]s|er)|e)|i(?:e(?:ni|r)|os)|eni|o)|zi)|th)|SECOND[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinto|I(?:I(?:\.[\s\xa0]*(?:Cor(?:in(?:t(?:h(?:i(?:a(?:id|ns)|[no]s|er)|e)|i(?:e(?:ni|r)|os)|eni|o)|zi)|th)|Korint(?:h(?:usiakhoz|e)|usi|o|io))|[\s\xa0]*(?:Cor(?:in(?:t(?:h(?:i(?:a(?:id|ns)|[no]s|er)|e)|i(?:e(?:ni|r)|os)|eni|o)|zi)|th)|Korint(?:h(?:usiakhoz|e)|usi|o|io)))|ka(?:[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*C|lawang[\s\xa0]*[CK]|\-?[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*C)orinto)|Epistula[\s\xa0]*ad[\s\xa0]*Corinthios[\s\xa0]*II|Wakorintho[\s\xa0]*II|2e\.?[\s\xa0]*Corinthiers|2e\.?[\s\xa0]*Corintiers|Tweede[\s\xa0]*(?:Corint(?:h(?:iers|e)|iers)|Korint(?:h(?:iers|e)|iers))|(?:2(?:e(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)|[\s\xa0]*[CK]orinth)i|Zweite[\s\xa0]*Korinth|Andre[\s\xa0]*Korint|2[\s\xa0]*Korinti|II(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)i)er|2(?:[CK]|[\s\xa0]*Q)or|(?:I(?:ka(?:lawang[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*Corint|[CK]orinti)|[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti|\-?[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti)|I\.?[\s\xa0]*Mga[\s\xa0]*Taga\-?[\s\xa0]*Corint)|2(?:(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?)|[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?))C|\.?[\s\xa0]*Mga[\s\xa0]*Taga\-?C)orint|SECOND[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wakorinth)o|(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa|II\.?|2\.?)[\s\xa0]*Wakorinth?o|(?:2(?:[\s\xa0]*(?:[ei](?:\.[\s\xa0]*Korin?|[\s\xa0]*Korin?)|Kori)tasv|\.[\s\xa0]*Kori(?:nt(?:asv|ern|iern)|tasv))|Anden[\s\xa0]*Korintern|(?:II\.?|2\.?)[\s\xa0]*Korinttolaiskirj|(?:II\.?|2\.?)[\s\xa0]*Korinttilaisill|(?:II\.?|2\.?)[\s\xa0]*Kirje[\s\xa0]*korinttilaisill|Toinen[\s\xa0]*K(?:orintt(?:olaiskirj|ilaisill)|irje[\s\xa0]*korinttilaisill))e|Andre[\s\xa0]*Korintierne|P(?:aulus(?:’[\s\xa0]*(?:Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth|andre[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*korint)|\'[\s\xa0]*Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth)erne|ili[\s\xa0]*(?:Wakorinth?o|Kor))|Korintos[\s\xa0]*Labaad|(?:Andra[\s\xa0]*Korint(?:hi?|i)?erb|2\.[\s\xa0]*Korint(?:hi?|i)erb)revet|(?:2(?:e\.?[\s\xa0]*Corinthien|[\s\xa0]*Korinth?u|\.[\s\xa0]*Korinth?u)|Masodik[\s\xa0]*Korinthu|Epistula[\s\xa0]*II[\s\xa0]*ad[\s\xa0]*Corinthio|2(?:[ao]|\.o)[\s\xa0]*Corintio|2(?:[ao]|\.o)\.[\s\xa0]*Corintio|Segund[ao][\s\xa0]*Corintio|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornthin|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corithin|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corinthina|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Chorinthin|(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corni|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corin)thai?n|(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornin|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cori)than|2[\s\xa0]*Corinith(?:ina|an)|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corinith(?:ina|an)|2\.[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)|n(?:ithai?|thi|intha)n)|horinthin)|II(?:\.[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)|n(?:ithai?|thi|intha)n)|horinthin)|[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)|n(?:ithai?|thi|intha)n)|horinthin)))s|(?:2(?:nd\.?[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao])|[\s\xa0]*Corintia)|Second[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao])|(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corrin?|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Chorin)thai|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornthai|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornthia|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corithia|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Chorinthia|(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corni|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corin)thaia|(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornin|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cori)thai|2[\s\xa0]*Corinith(?:ai|ia)|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corinith(?:ai|ia)|(?:(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corrin?th|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corinthi|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornin?th|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Cornthi)i|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Corith(?:ii|o)|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Chorithi|(?:2(?:nd\.?[\s\xa0]*Corin[an]|[\s\xa0]*Corin[an])|Second[\s\xa0]*Corin[an]|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Chorn|(?:(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Ch|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)C)oran)thi)a|(?:Second[\s\xa0]*|2nd\.?[\s\xa0]*)Corinthoi?a|(?:2(?:nd\.?[\s\xa0]*|[\s\xa0]*)|Second[\s\xa0]*)Coriinthii?a|2\.[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia)|(?:n(?:[an]th|thi)i|th(?:ii|o))a|nthoi?a|inthii?a)|(?:rin?tha|ntha)i|nthia|nithaia|ninthai|(?:(?:nin?|rin?)th|nthi|anth)ia)|hor(?:(?:a?n|i)thia|inth(?:ai|ia)))|II(?:\.[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia)|(?:n(?:[an]th|thi)i|th(?:ii|o))a|nthoi?a|inthii?a)|(?:rin?tha|ntha)i|nthia|nithaia|ninthai|(?:(?:nin?|rin?)th|nthi|anth)ia)|hor(?:(?:a?n|i)thia|inth(?:ai|ia)))|[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia)|(?:n(?:[an]th|thi)i|th(?:ii|o))a|nthoi?a|inthii?a)|(?:rin?tha|ntha)i|nthia|nithaia|ninthai|(?:(?:nin?|rin?)th|nthi|anth)ia)|hor(?:(?:a?n|i)thia|inth(?:ai|ia)))))ns|2(?:de?|eme)[\s\xa0]*Corinthiens|2(?:de?|eme)\.[\s\xa0]*Corinthiens|(?:II\.?[\s\xa0]*Kory|2\.?[\s\xa0]*Kory)ntow|(?:Pavlova[\s\xa0]*druga[\s\xa0]*poslanica[\s\xa0]*Korincanim|Naa77antto[\s\xa0]*Qoronttoos)a|(?:II\.?|2\.?)[\s\xa0]*Korincanima[\s\xa0]*Poslanica|(?:(?:(?:II\.?[\s\xa0]*l|2\.?[\s\xa0]*l)ist[\s\xa0]*Korint?|(?:II\.?|2\.?)[\s\xa0]*Korint)sky|Korintiyarukku[\s\xa0]*Elutiya[\s\xa0]*Irantavatu[\s\xa0]*Nirupa)m|(?:II\.?|2\.)[\s\xa0]*Korintanom|2[\s\xa0]*k[\s\xa0]*Korint(?:ano|sky)m|2[\s\xa0]*k\.[\s\xa0]*Korint(?:ano|sky)m|2(?:[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h|i)?|i)?)?)?|Kor(?:int(?:her?|er)?)?)|e\.?[\s\xa0]*Kor|\.[\s\xa0]*Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|er|a|ier)?)?)|(?:And(?:en|re)|Masodik)[\s\xa0]*Kor|2nd\.?[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?|Second[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?|2\.[\s\xa0]*Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?)?)?|II(?:\.[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?)?)?|Kor(?:int(?:us|a|hus)?)?)|[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?)?)?|Kor(?:int(?:us|a|hus)?)?))|2e\.?[\s\xa0]*Corinthier|2e\.?[\s\xa0]*Corintier|Tweede[\s\xa0]*(?:Kor(?:inth?ier)?|Corinth?ier)|2\.?[\s\xa0]*Kurinthiayon|(?:II\.?[\s\xa0]*l|2\.?[\s\xa0]*l)ist[\s\xa0]*do[\s\xa0]*Koryntian|D(?:ru(?:h(?:a(?:[\s\xa0]*(?:Korint(?:ano|sky)|list[\s\xa0]*Korint?sky|kniha[\s\xa0]*Korint(?:ano|sky))m|K)|y(?:[\s\xa0]*list[\s\xa0]*Korint(?:ano|sky)m|[\s\xa0]*list[\s\xa0]*Korinskym|K|[\s\xa0]*Korint(?:ano|sky)m)|[ay][\s\xa0]*K|e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*korynfjan)|g(?:(?:a[\s\xa0]*(?:list[\s\xa0]*do[\s\xa0]*)?|i[\s\xa0]*(?:list[\s\xa0]*do[\s\xa0]*)?)Koryntian|a[\s\xa0]*Kor(?:incanima[\s\xa0]*Poslanica|yntow)|i[\s\xa0]*Koryntow))|e(?:uxiemes?[\s\xa0]*Corinthiens|zyem[\s\xa0]*Korint|zyem[\s\xa0]*Korentyen)))|(?:2\.?[\s\xa0]*korinterbrev|Corinthios[\s\xa0]*II|ad[\s\xa0]*Corinthios[\s\xa0]*II|2\.?[\s\xa0]*Korincanima|II[\s\xa0]*Korincanima|II\.[\s\xa0]*Korincanima|Druga[\s\xa0]*(?:poslanica[\s\xa0]*)?Korincanima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:[\s\xa0]*(?:Cor(?:(?:int(?:h(?:i(?:a(?:n[ao]|in)|e[nr]|na|on)|(?:i[ai]|oi?)an|a(?:ia?)?n)|i(?:er|on))|thian)s|int(?:h(?:i(?:a(?:id|ns)|[no]s)|e)|ios))|Korint(?:(?:asv|ern)e|usi|os|anom|ier(?:ne|s)|i?erbrevet|h(?:erbrevet|usiakhoz|ier(?:brevet|s))))|(?:\.[\s\xa0]*(?:Corinth?ier|Korinto|Corinthian[ao])|(?:st\.?|\.)[\s\xa0]*Corthian|\.[\s\xa0]*Corinthian)s|\.[\s\xa0]*Korintusi|\.[\s\xa0]*Korinthusiakhoz|\.[\s\xa0]*Korinterbrevet)|(?:I(?:(?:(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)i|\.?[\s\xa0]*Corinth?i)er|\.?[\s\xa0]*Korinto|\.?[\s\xa0]*Corinthian[ao])|(?:First[\s\xa0]*C|I\.?[\s\xa0]*C)orthian|I\.?[\s\xa0]*Corinthian)s|I\.?[\s\xa0]*Korinthusiakhoz)|(?:[1I]\.?[\s\xa0]*Corthian)|(?:(?:1\.?|I\.?)[\s\xa0]*Korentyen|(?:1\.?|I\.?)[\s\xa0]*Corth|(?:1\.?|I\.?)[\s\xa0]*Koryntian|1[\s\xa0]*Corinthian|1st[\s\xa0]*Corthian|1st\.[\s\xa0]*Corthian|First[\s\xa0]*Corthian)|(?:(?:(?:(?:I(?:\.[\s\xa0]*Corint(?:hia|i)|[\s\xa0]*Corint(?:hia|i))|1(?:\.[\s\xa0]*Corint(?:hia|i)|[\s\xa0]*Corinti))a|(?:(?:1\.?|I\.?)[\s\xa0]*Corrin?|(?:1\.?|I\.?)[\s\xa0]*Chorin)thai|(?:1\.?|I\.?)[\s\xa0]*Cornthai|(?:1\.?|I\.?)[\s\xa0]*Cornthia|(?:1\.?|I\.?)[\s\xa0]*Corithia|(?:1\.?|I\.?)[\s\xa0]*Chorinthia|(?:(?:1\.?|I\.?)[\s\xa0]*Corni|(?:I\.?|1\.)[\s\xa0]*Corin)thaia|(?:(?:1\.?|I\.?)[\s\xa0]*Cornin|(?:1\.?|I\.?)[\s\xa0]*Cori)thai|1[\s\xa0]*Corinith(?:ai|ia)|(?:I\.?|1\.)[\s\xa0]*Corinith(?:ai|ia)|(?:(?:(?:1\.?|I\.?)[\s\xa0]*Corrin?th|(?:I\.?|1\.)[\s\xa0]*Corinthi|(?:1\.?|I\.?)[\s\xa0]*Cornin?th|(?:1\.?|I\.?)[\s\xa0]*Cornthi)i|(?:1\.?|I\.?)[\s\xa0]*Corith(?:ii|o)|(?:1\.?|I\.?)[\s\xa0]*Chorithi|(?:1(?:\.[\s\xa0]*Corin[an]|[\s\xa0]*Corin[an])|I(?:\.[\s\xa0]*Corin[an]|[\s\xa0]*Corin[an])|(?:1\.?|I\.?)[\s\xa0]*Chorn|(?:(?:1\.?|I\.?)[\s\xa0]*Ch|(?:1\.?|I\.?)[\s\xa0]*C)oran)thi)a|(?:I\.?|1\.)[\s\xa0]*Corinthoi?a|(?:1\.?|I\.?)[\s\xa0]*Coriinthii?a|1st[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:a[ai]|o)|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia)|(?:n(?:[an]th|thi)i|th(?:ii|o))a|nthoi?a|inthii?a)|(?:rin?tha|ntha)i|nthia|nithaia|ninthai|(?:(?:nin?|rin?)th|nthi|anth)ia)|hor(?:(?:a?n|i)thia|inth(?:ai|ia)))|1st\.[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:a[ai]|o)|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia)|(?:n(?:[an]th|thi)i|th(?:ii|o))a|nthoi?a|inthii?a)|(?:rin?tha|ntha)i|nthia|nithaia|ninthai|(?:(?:nin?|rin?)th|nthi|anth)ia)|hor(?:(?:a?n|i)thia|inth(?:ai|ia)))|First[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:a[ai]|o)|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia)|(?:n(?:[an]th|thi)i|th(?:ii|o))a|nthoi?a|inthii?a)|(?:rin?tha|ntha)i|nthia|nithaia|ninthai|(?:(?:nin?|rin?)th|nthi|anth)ia)|hor(?:(?:a?n|i)thia|inth(?:ai|ia))))n|I(?:\.[\s\xa0]*(?:Corint(?:hi(?:[eo]|ai)|io)n|Korinthu)|[\s\xa0]*(?:Corint(?:hi(?:[eo]|ai)|io)n|Korinthu))|1(?:\.[\s\xa0]*Corint(?:hi(?:[eo]|ai)|io)n|(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)u)|(?:1\.?|I\.?)[\s\xa0]*Cornthin|(?:1\.?|I\.?)[\s\xa0]*Corithin|(?:I\.?|1\.)[\s\xa0]*Corinthina|(?:1\.?|I\.?)[\s\xa0]*Chorinthin|(?:(?:1\.?|I\.?)[\s\xa0]*Corni|(?:I\.?|1\.)[\s\xa0]*Corin)thai?n|(?:(?:1\.?|I\.?)[\s\xa0]*Cornin|(?:1\.?|I\.?)[\s\xa0]*Cori)than|1[\s\xa0]*Corinith(?:ina|an)|(?:I\.?|1\.)[\s\xa0]*Corinith(?:ina|an)|1st[\s\xa0]*C(?:or(?:i(?:n(?:th(?:i(?:an[ao]|na)|ai?n)|ith(?:ina|an))|th[ai]n)|n(?:ithai?|thi|intha)n)|horinthin)|1st\.[\s\xa0]*C(?:or(?:i(?:n(?:th(?:i(?:an[ao]|na)|ai?n)|ith(?:ina|an))|th[ai]n)|n(?:ithai?|thi|intha)n)|horinthin)|First[\s\xa0]*C(?:or(?:i(?:n(?:th(?:i(?:an[ao]|na)|ai?n)|ith(?:ina|an))|th[ai]n)|n(?:ithai?|thi|intha)n)|horinthin)|1(?:ere?|re)[\s\xa0]*Corinthien|1(?:ere?|re)\.[\s\xa0]*Corinthien)s|1(?:[\s\xa0]*(?:Korint(?:i(?:yarukku|o)|[ao])|Corinti?o|Korinth?erbrev)|\.[\s\xa0]*Korint(?:i(?:ers|o)|erbrev|o|hiers)|[\s\xa0]*Corintier|\.[\s\xa0]*Corint(?:h(?:i(?:a(?:id|n)|er|os)|e)|i(?:er|os)|o))|Una(?:ng[\s\xa0]*[CK]|[\s\xa0]*[CK])orinto|(?:Una(?:ng)?|1\.)[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinto|I(?:\.[\s\xa0]*(?:Corint(?:h(?:i(?:a(?:id|n)|er|os)|e)|i(?:er|os)|o)|Korint(?:usi|o|io|he))|[\s\xa0]*(?:Corint(?:h(?:i(?:a(?:id|n)|er|os)|e)|i(?:er|os)|o)|Korint(?:usi|o|io|he))|\.?[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinto|ka\-?[\s\xa0]*1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinto)|(?:I\.?|1\.)[\s\xa0]*Corinthins|1st[\s\xa0]*Cor(?:inthia?ns|th)|1st\.[\s\xa0]*Cor(?:inthia?ns|th)|F(?:irst[\s\xa0]*Cor(?:inthia?ns|th)|yrra[\s\xa0]*Korintubref)|1e[\s\xa0]*(?:Corint(?:h(?:iers|e)|iers)|Korint(?:h(?:iers|e)|iers))|1e\.[\s\xa0]*(?:Corint(?:h(?:iers|e)|iers)|Korint(?:h(?:iers|e)|iers))|Wakorintho[\s\xa0]*I|E(?:erste[\s\xa0]*(?:Corint(?:h(?:iers|e)|iers)|Korint(?:h(?:iers|e)|iers))|lso[\s\xa0]*Korinthusiakhoz|pistula[\s\xa0]*ad[\s\xa0]*Corinthios[\s\xa0]*I)|(?:(?:(?:1[\s\xa0]*[CK]|I\.?[\s\xa0]*K)orinth|(?:I\.?|1)[\s\xa0]*Korint)i|Erste[\s\xa0]*Korinth)er|1(?:[\s\xa0]*Q|C)or|(?:(?:1(?:(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?)|[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?))C|\.?[\s\xa0]*Mga[\s\xa0]*Taga\-?C)|Una(?:ng)?[\s\xa0]*Mga[\s\xa0]*Taga\-?[\s\xa0]*C)orint|Una(?:ng[\s\xa0]*[CK]|[\s\xa0]*[CK])orinti|(?:Una(?:ng)?|1\.)[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti|I(?:(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Corint|\.?[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti|ka\-?[\s\xa0]*1[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti)|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wakorinth)o|(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kwa|1\.?|I\.?)[\s\xa0]*Wakorinth?o|K(?:wanza[\s\xa0]*(?:Wakorinth?o|Kor)|orintos[\s\xa0]*Kowaad)|(?:Forsta[\s\xa0]*Korint(?:hi?|i)?erb|1\.[\s\xa0]*Korint(?:h?ierb|herb))revet|Epistula[\s\xa0]*I[\s\xa0]*ad[\s\xa0]*Corinthios|1(?:[ao]|\.o)[\s\xa0]*Corintios|1(?:[ao]|\.o)\.[\s\xa0]*Corintios|(?:1(?:[\s\xa0]*Corin(?:ten|z|tien)|\.[\s\xa0]*Corin(?:ti?en|z))|I(?:\.[\s\xa0]*Corin(?:ti?en|z)|[\s\xa0]*Corin(?:ti?en|z))|Elso[\s\xa0]*Korintus)i|(?:(?:(?:1\.?[\s\xa0]*l|I\.?[\s\xa0]*l)ist[\s\xa0]*Korint?|(?:1\.?|I\.?)[\s\xa0]*Korint)sky|Korintiyarukku[\s\xa0]*Elutiya[\s\xa0]*Mutalavatu[\s\xa0]*Nirupa)m|(?:I\.?|1\.)[\s\xa0]*Korintanom|1[\s\xa0]*k\.?[\s\xa0]*Korint(?:ano|sky)m|(?:1\.?[\s\xa0]*Kory|I\.?[\s\xa0]*Kory)ntow|(?:1(?:[\s\xa0]*(?:[ei](?:\.[\s\xa0]*Korin?|[\s\xa0]*Korin?)|Kori)tasv|\.[\s\xa0]*Kori(?:nt(?:asv|ern|iern)|tasv))|(?:1\.?|I\.?)[\s\xa0]*Korinttolaiskirj|(?:1\.?|I\.?)[\s\xa0]*Korinttilaisill|(?:1\.?|I\.?)[\s\xa0]*Kirje[\s\xa0]*korinttilaisill|Ensimmainen[\s\xa0]*K(?:orintt(?:olaiskirj|ilaisill)|irje[\s\xa0]*korinttilaisill))e|(?:Fyrra[\s\xa0]*bref[\s\xa0]*Pals[\s\xa0]*til[\s\xa0]*Korintumann|Koiro[\s\xa0]*Qoronttoos|(?:1\.?|I\.?)[\s\xa0]*Korincanima[\s\xa0]*Poslanic)a|1(?:[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h|i)?|i)?)?)?|Kor(?:int(?:her?|er)?)?)|\.[\s\xa0]*Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|er|a|ier)?)?|\.[\s\xa0]*Co(?:r(?:in(?:t(?:io|h)?)?)?)?)|I(?:\.[\s\xa0]*(?:Co(?:r(?:in(?:t(?:io|h)?)?)?)?|Kor(?:int(?:us|a)?)?)|[\s\xa0]*(?:Co(?:r(?:in(?:t(?:io|h)?)?)?)?|Kor(?:int(?:us|a)?)?))|1st[\s\xa0]*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?)?)?|1st\.[\s\xa0]*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?)?)?|F(?:irst[\s\xa0]*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?)?)?|yrra[\s\xa0]*bref[\s\xa0]*Pals[\s\xa0]*til[\s\xa0]*Korin)|1e[\s\xa0]*(?:Kor(?:inth?ier)?|Corinth?ier)|1e\.[\s\xa0]*(?:Kor(?:inth?ier)?|Corinth?ier)|E(?:erste[\s\xa0]*(?:Kor(?:inth?ier)?|Corinth?ier)|lso[\s\xa0]*Kor(?:inthus)?)|1\.?[\s\xa0]*Kurinthiayon|(?:1\.?[\s\xa0]*l|I\.?[\s\xa0]*l)ist[\s\xa0]*do[\s\xa0]*Koryntian|P(?:r(?:v(?:ni(?:[\s\xa0]*(?:list[\s\xa0]*Korint?|Korint)skym|K)|y[\s\xa0]*(?:list[\s\xa0]*)?Korint(?:ano|sky)m|a[\s\xa0]*(?:kniha[\s\xa0]*Korint(?:ano|sky)|Korint(?:ano|sky))m)|im(?:e(?:ir[ao]|ro?)[\s\xa0]*Corintios|o[\s\xa0]*Corinzi|a[\s\xa0]*(?:lettera[\s\xa0]*ai[\s\xa0]*)?Corinzi)|em(?:ier(?:es?|s)?[\s\xa0]*Corinthiens|ye[\s\xa0]*Korint))|ierwsz[aey][\s\xa0]*Koryntow|rva[\s\xa0]*Korincanima[\s\xa0]*Poslanica|a(?:ulus['’][\s\xa0]*1\.?[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korintherne|vlova[\s\xa0]*prva[\s\xa0]*poslanica[\s\xa0]*Korincanima)|rvni[\s\xa0]*K(?:or)?|remye[\s\xa0]*Korentyen|ierwsz[aey][\s\xa0]*(?:list[\s\xa0]*do[\s\xa0]*)?Koryntian|erse[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*korynfjan))|(?:C(?:(?:or(?:i(?:n(?:th(?:i(?:an[ao]|na|on)|ai?n)|ith(?:ina|an))|th[ai]n|nthia?n|(?:n(?:t(?:h(?:ia[ai]|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia))n|(?:n(?:[an]th|thi)i|th(?:ii|o))an|nthoi?an|inthii?an)|(?:(?:rin?tha|ntha)i|nthia|ninthai|nithaia|n(?:intha|thi|ithai?)|(?:(?:nin?|rin?)th|nthi)ia)n)|hor(?:inth(?:ai|ia|i)|(?:a?n|i)thia)n)s|orinthios[\s\xa0]*I)|ad[\s\xa0]*Corinthios[\s\xa0]*I|1(?:[\s\xa0]*(?:Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o|korinterbrev)|\.[\s\xa0]*korinterbrev)|Corinthian|1\.?[\s\xa0]*Korincanima|I[\s\xa0]*Korincanima|I\.[\s\xa0]*Korincanima|Prva[\s\xa0]*(?:poslanica[\s\xa0]*)?Korincanima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Gal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:G(?:ala(?:t(?:e(?:n(?:brief|i)|s|rbref?vet)|i(?:on?s|ya|na?s|a(?:n?s|id))|a(?:laiskirj|khoz))|s(?:yano|ia))|l|al(?:at(?:i(?:a(?:n[ai]|in)|on[an]|nan)|o?n|(?:i[ao]|o)an|ii[ao]?n|a(?:i[ao]?|[ao])?n)|lati[ao]?n)s)|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Galatas|Gala(?:tiyo|sye)n|Ga\\-?la\\-?ti|L(?:ist[\\s\\xa0]*do[\\s\\xa0]*Gala(?:cjan|tow)|ettera[\\s\\xa0]*ai[\\s\\xa0]*Galati)|List[\\s\\xa0]*Galat(?:ano|sky)m|Kalattiyarukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|(?:Kirje[\\s\\xa0]*galatalaisill|Galatasv)e|Brevet[\\s\\xa0]*til[\\s\\xa0]*Galaterne|(?:galati(?:harulai|karams)[\\s\\xa0]*patr|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*Galasy|Galaatiya|(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*(?:taga[\\s\\xa0]*)?|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*?)Galaci|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Galati|B(?:ref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Galatamann|arua[\\s\\xa0]*kwa[\\s\\xa0]*Wagalati))a|Gal(?:a(?:t(?:e[nr]|ian|a)?|si)?)?|P(?:a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Galaterne|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Galacanima)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*halativ))|(?:Gala(?:c(?:anim|i)a|tas))|(?:Galat(?:alaisill|ern)e)|(?:Gala(?:t(?:ia|ow|skym|anom)|cjan)|ad[\\s\\xa0]*Galatas|galati(?:harulai|karams)|Kalattiyarukku|(?:Taga\\-?Galac|Wagalat|Taga\\-?[\\s\\xa0]*Galac|Mga[\\s\\xa0]*Taga[\\s\\xa0]*Galac)ia|Ga(?:lati)?|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*galaterne|oslanica[\\s\\xa0]*Galacanima)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eph"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Efezyen)|(?:E(?:p(?:h(?:es(?:ia(?:n[ds]|id)|er|ains|zosziakhoz)|i?sians)|istula[\\s\\xa0]*ad[\\s\\xa0]*Ephesios|hesi[eo]ns|e(?:ciyarukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|(?:he)?sians))|f(?:e(?:s(?:e(?:rbrevet|ni)|ierbrevet|os)|zow)|fesiaid|ezusiakhoz|e(?:zier|sio)s)|hp[ei]sians|sphesians|feskym)|(?:(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*E[fp]|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*E[fp])esi|(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*E[fp]|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*E[fp])es|Mga[\\s\\xa0]*Taga\\-?Efes|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Waefes|Barua[\\s\\xa0]*kwa[\\s\\xa0]*Waefes)o|Lettera[\\s\\xa0]*agli[\\s\\xa0]*Efesini|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Efesus|List[\\s\\xa0]*Efez(?:an[ou]|sky)m|(?:Efes(?:olaiskirj|ianev)|Kirje[\\s\\xa0]*efesolaisill)e|(?:Bref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Efesusman|Efisoo)na|E(?:p(?:h(?:e(?:s(?:ain|ian)?)?|i?sian|s)?)?|f(?:e(?:z(?:us)?|se?)?|is|f)?|hp)|Iafisiyon|List[\\s\\xa0]*do[\\s\\xa0]*Efezjan|P(?:a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Efeserne|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Efezanima)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*efesjan))|(?:Efesolaisille)|(?:E(?:fe(?:z(?:anom|jan|skym)|s(?:ini|us))|peciyarukku)|ad[\\s\\xa0]*Ephesios|Waefeso|Mga[\\s\\xa0]*E[fp]esi?o|Taga(?:\\-?(?:[\\s\\xa0]*E[fp]esi?|Efes)|[\\s\\xa0]*E[fp]esi?)o|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*efeserne|oslanica[\\s\\xa0]*Efezanima))|(?:E(?:fe(?:s(?:erne|i?o)|zanima)|p(?:hesios|eso|esio))))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Col"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:Kolos(?:senz|y)|Colossenz)en)|(?:(?:C(?:al(?:l(?:os(?:i[ao]|sia)|asi[ao])|(?:[ao]s|[ao])si[ao])|ol(?:os(?:s(?:i[eo]|a)|io)|(?:l[ao]s|ass?)i[ao]|osia))n|Mga[\\s\\xa0]*Taga(?:\\-?(?:[\\s\\xa0]*[CK]|C)|[\\s\\xa0]*[CK])olosa)s|C(?:olos(?:sia(?:id|ns)|iaid|eni)|l)|Colosenses|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Colossenses|Lettera[\\s\\xa0]*ai[\\s\\xa0]*Colossesi|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Wakolosai|B(?:ref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Kolossumanna|arua[\\s\\xa0]*kwa[\\s\\xa0]*Wakolosai)|List[\\s\\xa0]*Kolos(?:an[ou]|ky)m|Kolo(?:s(?:s(?:e(?:nser(?:brevet|n)|rbrevet|iakhoz)|ze(?:beliekhez|ieknek))|ensow|ay|s?enskym)|ceyarukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam)|(?:kalass(?:aikarams|iharulai)[\\s\\xa0]*patr|Qolasiyaas)a|(?:(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*[CK]olon?sen|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Kolo)s|K(?:olos(?:salaiskirj|ianev)|irje[\\s\\xa0]*kolossalaisill))e|Co(?:l(?:os(?:s(?:ian)?)?)?)?|Qol|Bref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Kolossumann|Ko(?:l(?:os(?:ser?)?)?)?|Kulussaiyon|List[\\s\\xa0]*do[\\s\\xa0]*Kolosan|P(?:a(?:ulus(?:’[\\s\\xa0]*(?:Brev[\\s\\xa0]*til[\\s\\xa0]*Kolossen|brev[\\s\\xa0]*til[\\s\\xa0]*kolos)|\\'[\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Kolossen)serne|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Kolosanima)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*kolosjan))|(?:Kolosanima)|(?:(?:Taga(?:\\-?[\\s\\xa0]*?|[\\s\\xa0]*)Colosa|ad[\\s\\xa0]*Colossense)s|Colossesi|Wakolosai|kalass(?:aikarams|iharulai)|Mga[\\s\\xa0]*[CK]olon?sense|Kolo(?:s(?:s(?:e(?:nse)?rn|alaisill)e|a(?:n[ou]m|s)|kym|e)|ceyarukku)|Kolosan|Poslanica[\\s\\xa0]*Kolosanima)|(?:Colos(?:sense|a)s))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*Timote(?:u(?:s(?:hoz|nak|kirje|brevet)|kselle|t)|yos|i|ovi|jovi)|\.[\s\xa0]*Timoteovi)|And(?:en|re)[\s\xa0]*Timoteusbrev)|(?:2[\s\xa0]*Timot(?:h(?:e(?:os(?:brevet|z)|u(?:sbrev|m)|e)|y)|eusbrev))|(?:(?:2(?:[\s\xa0]*T(?:imoteju[\s\xa0]*Poslanic|ymoteusz)|\.[\s\xa0]*Timoteju[\s\xa0]*Poslanic)|II\.?[\s\xa0]*Timoteju[\s\xa0]*Poslanic)a)|(?:2(?:\.[\s\xa0]*T(?:imot(?:h(?:e(?:os(?:brevet|z)|u(?:sbrev|m)|e)|y)|e(?:[io]|ut)|y|eusbrevet)|m)|[\s\xa0]*T(?:imot(?:eo|y|heo)|m)|e\.?[\s\xa0]*Timothee|[\s\xa0]*[ei]\.?[\s\xa0]*Timoteut)|And(?:ra[\s\xa0]*Timot(?:heo|eu)sbrevet|e[nt][\s\xa0]*Timotheusbrev)|(?:Masodik|2\.)[\s\xa0]*Timoteusnak|Masodik[\s\xa0]*Timotheosz|(?:Masodik|2\.)[\s\xa0]*Timoteushoz|II(?:\.[\s\xa0]*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|heosz|e(?:us(?:hoz|nak)|i))|m)|[\s\xa0]*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|heosz|e(?:us(?:hoz|nak)|i))|m))|(?:II\.?|2\.?)[\s\xa0]*Tomothy|(?:II\.?|2\.?)[\s\xa0]*Thimoth?y|2nd\.?[\s\xa0]*T(?:imoth?y|m|omothy|himoth?y)|Second[\s\xa0]*T(?:imoth?y|m|omothy|himoth?y)|(?:(?:2(?:\.(?:[\s\xa0]*Ka(?:ng|y)|o\.)|[\s\xa0]*Ka(?:ng|y)|[ao]\.)|I(?:kalawang|I\.?)[\s\xa0]*Kay)[\s\xa0]*|2(?:[ao]|\.o)[\s\xa0]*|Ikalawang[\s\xa0]*|Se(?:cond(?:a[\s\xa0]*(?:lettera[\s\xa0]*a[\s\xa0]*)?|o[\s\xa0]*)|gund[ao][\s\xa0]*))Timoteo|(?:Waraka[\s\xa0]*w|Barua[\s\xa0]*y)a[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Timotheo|2[\s\xa0]*Timotteyuvukku|P(?:avlova[\s\xa0]*druga[\s\xa0]*poslanica[\s\xa0]*Timoteju|ili[\s\xa0]*Timotheo)|Epistula[\s\xa0]*ad[\s\xa0]*Timotheum[\s\xa0]*II|(?:Epistula[\s\xa0]*II[\s\xa0]*ad[\s\xa0]*Timotheu|2(?:[\s\xa0]*(?:Ty|Xi)|Ti))m|Timot(?:teyuvukku[\s\xa0]*Elutiya[\s\xa0]*Irantavatu[\s\xa0]*Nirupam|eyos[\s\xa0]*Labaad|heo[\s\xa0]*II)|(?:(?:II\.?|2\.)[\s\xa0]*Timoteuksell|(?:II\.?|2\.)[\s\xa0]*Timoteuskirj|(?:II\.?|2\.?)[\s\xa0]*Kirje[\s\xa0]*Timoteuksell|Toinen[\s\xa0]*(?:Timoteu(?:ksell|skirj)|Kirje[\s\xa0]*Timoteuksell))e|2(?:de?|eme)[\s\xa0]*Timothee|2(?:de?|eme)\.[\s\xa0]*Timothee|(?:(?:2(?:e\.?[\s\xa0]*Timote|[\s\xa0]*Timoti|[\s\xa0]*Teemuathaiy|\.[\s\xa0]*T(?:eemuathaiy|imoti))|Anden[\s\xa0]*Timote|II\.?[\s\xa0]*Timoti)u|2(?:(?:e\.?[\s\xa0]*Timoth|[\s\xa0]*Timoth?)eu|\.[\s\xa0]*Timoteyo)|II\.?[\s\xa0]*Timoteyo|(?:Paulus(?:’[\s\xa0]*(?:Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth|andre[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*Timot)|\'[\s\xa0]*Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth)|Zweite[\s\xa0]*Timoth|Andre[\s\xa0]*Timot)eu|Tweede[\s\xa0]*Timoth?eu)s|II\.?[\s\xa0]*Timoteovi|(?:(?:II\.?|2\.?)[\s\xa0]*list[\s\xa0]*Time|(?:II\.?|2\.)[\s\xa0]*Timo)tejovi|(?:II\.?|2\.?)[\s\xa0]*list[\s\xa0]*Timotej?ovi|2[\s\xa0]*k[\s\xa0]*Timotej?ovi|2[\s\xa0]*k\.[\s\xa0]*Timotej?ovi|2(?:\.[\s\xa0]*Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:e(?:us|o))?))?)?|[\s\xa0]*Ti(?:m(?:ot[eh])?)?|e\.?[\s\xa0]*Tim)|Masodik[\s\xa0]*Tim(?:oteus)?|And(?:en|re)[\s\xa0]*Tim|II(?:\.[\s\xa0]*Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|[\s\xa0]*Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?)|2nd\.?[\s\xa0]*Ti(?:m(?:oth)?)?|Second[\s\xa0]*Ti(?:m(?:oth)?)?|Pili[\s\xa0]*Tim|Tweede[\s\xa0]*Tim|(?:Naa77antto[\s\xa0]*Ximootiyoos|(?:II\.?|2\.)[\s\xa0]*Tymoteusz|(?:II\.?|2\.?)[\s\xa0]*List[\s\xa0]*do[\s\xa0]*Tymoteusz)a|D(?:ru(?:h(?:a[\s\xa0]*(?:(?:list[\s\xa0]*Time|Timo)tejovi|T(?:imoteus|m|imoteovi)|list[\s\xa0]*Timotej?ovi|kniha[\s\xa0]*Timotej?ovi)|y[\s\xa0]*(?:(?:list[\s\xa0]*Time|Timo)tejovi|T(?:imoteus|m|imoteovi)|list[\s\xa0]*Timotej?ovi)|[ay][\s\xa0]*Tim|e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*Tymofija)|g(?:a[\s\xa0]*(?:T(?:imoteju[\s\xa0]*Poslanic|ymoteusz)|List[\s\xa0]*do[\s\xa0]*Tymoteusz)|i[\s\xa0]*(?:List[\s\xa0]*do[\s\xa0]*)?Tymoteusz)a)|e(?:uxiemes?[\s\xa0]*Timothe|zyem[\s\xa0]*Timot)e))|(?:(?:ad[\s\xa0]*)?Timotheum[\s\xa0]*II|(?:II|2)[\s\xa0]*Timoteju|(?:II|2)\.[\s\xa0]*Timoteju|Druga[\s\xa0]*(?:poslanica[\s\xa0]*)?Timoteju))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:I\.?[\s\xa0]*Timoteovi)|(?:(?:[1I](?:\.[\s\xa0]*T(?:imoteju[\s\xa0]*Poslanic|ymoteusz)|[\s\xa0]*T(?:imoteju[\s\xa0]*Poslanic|ymoteusz))|Pierwsz[aey][\s\xa0]*Tymoteusz)a)|(?:1[\s\xa0]*Timoth(?:e(?:os(?:brevet|z)|u(?:sbrev|m)|e)|y))|(?:1(?:\.[\s\xa0]*T(?:imot(?:h(?:e(?:u(?:sbrev|m)|e|osz)|y)|e(?:ut|i)|y)|m)|[\s\xa0]*T(?:imot(?:heo|y)|m|imote(?:ut|i)))|I(?:\.[\s\xa0]*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|e[io])|m)|[\s\xa0]*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|e[io])|m))|(?:1\.?|I\.?)[\s\xa0]*Tomothy|(?:1\.?|I\.?)[\s\xa0]*Thimoth?y|1st[\s\xa0]*T(?:imoth?y|m|omothy|himoth?y)|1st\.[\s\xa0]*T(?:imoth?y|m|omothy|himoth?y)|1(?:[\s\xa0]*(?:[ei]\.?[\s\xa0]*Timoteu|Timoteusbreve)|\.[\s\xa0]*Timoteusbreve)t|1\.[\s\xa0]*Timotheosbrevet|F(?:irst[\s\xa0]*T(?:imoth?y|m|omothy|himoth?y)|orsta[\s\xa0]*Timot(?:heo|eu)sbrevet|yrra[\s\xa0]*(?:bref[\s\xa0]*Pals[\s\xa0]*til[\s\xa0]*Timoteusar|Timoteusarbref))|(?:1\.?|I\.?)[\s\xa0]*Timoteusnak|I\.?[\s\xa0]*Timotheosz|(?:1\.?|I\.?)[\s\xa0]*Timoteushoz|Elso[\s\xa0]*Timot(?:eus(?:hoz|nak)|heosz)|Epistula[\s\xa0]*ad[\s\xa0]*Timotheum[\s\xa0]*I|Timot(?:eyos[\s\xa0]*Kowaad|heo[\s\xa0]*I)|(?:(?:1\.?|I\.?)[\s\xa0]*Timoteuksell|(?:1\.?|I\.?)[\s\xa0]*Timoteuskirj|(?:1\.?|I\.?)[\s\xa0]*Kirje[\s\xa0]*Timoteuksell|Ensimmainen[\s\xa0]*(?:Timoteu(?:ksell|skirj)|Kirje[\s\xa0]*Timoteuksell))e|1(?:ere?|re)[\s\xa0]*Timothee|1(?:ere?|re)\.[\s\xa0]*Timothee|1\.?[\s\xa0]*Timoteovi|(?:(?:1\.?|I\.?)[\s\xa0]*list[\s\xa0]*Timete|(?:1\.?|I\.?)[\s\xa0]*Timotej|(?:1\.?|I\.?)[\s\xa0]*list[\s\xa0]*Timotej?|1[\s\xa0]*k[\s\xa0]*Timotej?|1[\s\xa0]*k\.[\s\xa0]*Timotej?)ovi|(?:Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kw|Kwanz|Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kw)a[\s\xa0]*Timotheo|Una(?:ng)?[\s\xa0]*Timoteo|1(?:[ao]|\.o)[\s\xa0]*Timoteo|(?:1(?:\.(?:[\s\xa0]*Ka(?:ng|y)|o\.)|[\s\xa0]*Ka(?:ng|y)|[ao]\.)|(?:Una(?:ng)?[\s\xa0]*Ka|I\.?[\s\xa0]*Ka)y)[\s\xa0]*Timoteo|(?:1(?:[\s\xa0]*(?:Ty|Xi)|Ti|\.[\s\xa0]*Ty)|I\.?[\s\xa0]*Ty|Epistula[\s\xa0]*I[\s\xa0]*ad[\s\xa0]*Timotheu|Timotteyuvukku[\s\xa0]*Elutiya[\s\xa0]*Mutalavatu[\s\xa0]*Nirupa)m|(?:1(?:[\s\xa0]*Timot(?:eyo|heu)|\.[\s\xa0]*Timoteyo)|I\.?[\s\xa0]*Timoteyo)s|(?:1(?:\.[\s\xa0]*T(?:eemuathaiy|imoti)|[\s\xa0]*T(?:eemuathaiy|imoti))|I\.?[\s\xa0]*Timoti|1e[\s\xa0]*Timote|1e\.[\s\xa0]*Timote|Eerste[\s\xa0]*Timote)us|(?:Eerste|1e\.?)[\s\xa0]*Timotheus|Erste[\s\xa0]*Timotheus|1[\s\xa0]*Timotteyuvukku|1(?:\.[\s\xa0]*Ti(?:m(?:ot(?:e(?:us(?:brev)?|o)?|h(?:e(?:us|o))?))?)?|[\s\xa0]*Ti(?:mote(?:us(?:brev)?|o)?|m(?:oth)?)?)|I(?:\.[\s\xa0]*Ti(?:m(?:ot(?:e(?:us)?|h(?:eo)?))?)?|[\s\xa0]*Ti(?:m(?:ot(?:e(?:us)?|h(?:eo)?))?)?)|Kwanza[\s\xa0]*Tim|1st[\s\xa0]*Ti(?:m(?:oth)?)?|1st\.[\s\xa0]*Ti(?:m(?:oth)?)?|F(?:yrra[\s\xa0]*bref[\s\xa0]*Pals[\s\xa0]*til[\s\xa0]*Timot|irst[\s\xa0]*Ti(?:m(?:oth)?)?)|1e[\s\xa0]*Tim|1e\.[\s\xa0]*Tim|E(?:lso[\s\xa0]*Tim(?:oteus)?|erste[\s\xa0]*Tim)|(?:(?:1\.?|I\.?)[\s\xa0]*List[\s\xa0]*do[\s\xa0]*Tymoteusz|Koiro[\s\xa0]*Ximootiyoos)a|P(?:r(?:v(?:(?:ni[\s\xa0]*(?:list[\s\xa0]*Timete|Timotej|Timote|list[\s\xa0]*Timotej?)|y[\s\xa0]*Timotej?|y[\s\xa0]*list[\s\xa0]*Timotej?)ovi|ni[\s\xa0]*Tm|a[\s\xa0]*(?:kniha[\s\xa0]*Timotej?o|Timotej?o)vi)|em(?:ier(?:es?|s)?[\s\xa0]*Timothe|ye[\s\xa0]*Timot)e|im(?:(?:e(?:ir[ao]|ro)|o|er)[\s\xa0]*|a[\s\xa0]*(?:lettera[\s\xa0]*a[\s\xa0]*)?)Timoteo)|ierwsz[aey][\s\xa0]*Tym|rvni[\s\xa0]*Timoteus|a(?:ulus['’][\s\xa0]*1\.?[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timotheus|vlova[\s\xa0]*prva[\s\xa0]*poslanica[\s\xa0]*Timoteju)|rvni[\s\xa0]*Tim|(?:ierwsz[aey][\s\xa0]*List[\s\xa0]*do[\s\xa0]*Tymoteusz|rva[\s\xa0]*Timoteju[\s\xa0]*Poslanic)a|erse[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*Tymofija))|(?:Timoth(?:eum[\s\xa0]*I|y)|ad[\s\xa0]*Timotheum[\s\xa0]*I|Timoth|[1I][\s\xa0]*Timoteju|[1I]\.[\s\xa0]*Timoteju|Prva[\s\xa0]*(?:poslanica[\s\xa0]*)?Timoteju))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Deut"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:Femte[\s\xa0]*Moseboken)|(?:(?:(?:Piata|V\.)[\s\xa0]*Mojzisov|Dezyem[\s\xa0]*liv[\s\xa0]*Lalwa[\s\xa0]*|(?:Piata|V\.)[\s\xa0]*Mojzeszow|V[\s\xa0]*Mojz(?:eszow|isov)|5(?:\.[\s\xa0]*Mo(?:jz(?:eszow|isov)|oseksen[\s\xa0]*kirj)|[\s\xa0]*Mo(?:jz(?:eszow|isov)|oseksen[\s\xa0]*kirj)))a|5(?:[\s\xa0]*Mojz?|\.[\s\xa0]*Mojz)|V[\s\xa0]*Mojz|Sharciga[\s\xa0]*Kunoqoshadiisa)|(?:D(?:e(?:ut(?:eron(?:om(?:i(?:y[ao]|[ao]|um)|[ae]|ya|ul)|m(?:io|y))|(?:orono?|rono?)m(?:io|y))|et(?:[eo]rono?|rono?)my|yuteronomyo|(?:te[rw]ono|warie)m)|ueteronmy|tn|uetrono?my|uetorono?my|uut(?:[eo]rono?|rono?)my|i?yuteronomyo|ueteronom(?:io|y))|Upakamam|anuwad|ZarW|Femte[\s\xa0]*Mosebo[gk]|LiP|M(?:asodik[\s\xa0]*torvenykonyv|ozes[\s\xa0]*V|Torv)|(?:Mozes[\s\xa0]*otodik[\s\xa0]*konyv|Ligji[\s\xa0]*i[\s\xa0]*Perterir)e|Funfte[\s\xa0]*Mose|Fimmta[\s\xa0]*bok[\s\xa0]*Mose|Funfte[\s\xa0]*Buch[\s\xa0]*Mose|5(?:[\s\xa0]*(?:M(?:osebog|z)|Buch[\s\xa0]*Mose)|\.[\s\xa0]*(?:Buch[\s\xa0]*Mose|Mosebog))|Fimmta[\s\xa0]*Mosebok|5[\s\xa0]*Mo(?:ze|o)s|5\.[\s\xa0]*Mozes|V(?:[\s\xa0]*Mo(?:sebok|j)|\.[\s\xa0]*Mosebok|\.?[\s\xa0]*Mozes|ijfde[\s\xa0]*Mozes)|(?:Vyavasthaavivara|5\.?[\s\xa0]*Moseboke)n|Andharaning[\s\xa0]*Toret|V\.[\s\xa0]*Mojz|P(?:o(?:vtorennja[\s\xa0]*Zakonu|novljeni[\s\xa0]*zakon)|wt|angandharing[\s\xa0]*Toret|nz|iata[\s\xa0]*Mojz)|(?:Liber[\s\xa0]*Deuteronomi|Sharc)i|D(?:e(?:u(?:t(?:eronom(?:i|y)?)?)?|t)?|(?:ue)?t)|Femte[\s\xa0]*Mos|5(?:[\s\xa0]*M(?:os(?:e(?:bok)?)?|oz?)?|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|V\.?[\s\xa0]*Mos|(?:V(?:iides|\.)?[\s\xa0]*Mooseksen[\s\xa0]*kirj|Zaarettido[\s\xa0]*Woga|5[\s\xa0]*k[\s\xa0]*Mojzisov|5[\s\xa0]*k\.[\s\xa0]*Mojzisov|5[\s\xa0]*kniha[\s\xa0]*Mojzisov|(?:V\.?|5\.)[\s\xa0]*kniha[\s\xa0]*Mojzisov|P(?:ata[\s\xa0]*(?:kniha[\s\xa0]*)?|iata[\s\xa0]*kniha[\s\xa0]*)Mojzisov)a|(?:(?:5\.?|V\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?|Piata[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Mojzeszowa|K(?:s(?:\.[\s\xa0]*Powt(?:orzonego)?|[\s\xa0]*Powt(?:orzonego)?|ieg[ai][\s\xa0]*Powt(?:orzonego)?)[\s\xa0]*Prawa|(?:itabu[\s\xa0]*cha[\s\xa0]*Tano[\s\xa0]*cha[\s\xa0]*Mus|umbukumbu[\s\xa0]*la[\s\xa0]*Sheri)a|um(?:bukumbu[\s\xa0]*la[\s\xa0]*Torati|b)?))|(?:5[\s\xa0]*Mooseksen|Kumbukumbu|5\.[\s\xa0]*Mooseksen|V(?:iides|\.)?[\s\xa0]*Mooseksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Titus"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:tita(?:slai|la)[\\s\\xa0]*patra)|(?:Kirje[\\s\\xa0]*Titukselle|List[\\s\\xa0]*Titovi|Ka(?:ng|y)[\\s\\xa0]*Tito|Lettera[\\s\\xa0]*a[\\s\\xa0]*Tito|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Tito|B(?:ref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Titusar|arua[\\s\\xa0]*kwa[\\s\\xa0]*Tito)|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Titum|T(?:i(?:t(?:us(?:brevet|z?hoz|arbref)|it|e|tuvukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam)|itu)|y?t)|Tiitos|Teetus|Brevet[\\s\\xa0]*til[\\s\\xa0]*Titus|Brevet[\\s\\xa0]*till[\\s\\xa0]*Titus|Ti(?:t(?:usz|i)?|it)?|List[\\s\\xa0]*do[\\s\\xa0]*Tytusa|P(?:a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Titus|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Titu)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*Tyta))|(?:T(?:it(?:u(?:kselle|[ms])|ovi)|ytusa)|ad[\\s\\xa0]*Titum|titala|titaslai|Tittuvukku|Tit[ou]|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*Titus|oslanica[\\s\\xa0]*Titu)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Heb"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Zidom)|(?:H(?:e(?:b(?:r(?:e(?:u[sx]|s|ws|os|ohanon|e(?:rbrevet|en|s))|(?:r|w|o)?s|aee?r)|(?:o[eor]|e[eo]|er?|o)s)|[ew]brews)|(?:w[ew]|w)?brews)|(?:Mga[\\s\\xa0]*Hebrohan|Ibraaaniy)on|Mga[\\s\\xa0]*(?:He|E)breo|Hebreaid|Heber[\\s\\xa0]*level|Z(?:sidokhoz[\\s\\xa0]*irt[\\s\\xa0]*level|[iy]?d)|List[\\s\\xa0]*do[\\s\\xa0]*(?:Hebrajczyk|Zyd)ow|(?:He(?:prealaiskirj|brenjv)|Ibraaw|Kirje[\\s\\xa0]*he[bp]realaisill)e|Brevet[\\s\\xa0]*til[\\s\\xa0]*hebreerne|(?:Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Waebrani|Cibraaniyad|Barua[\\s\\xa0]*kwa[\\s\\xa0]*Waebrani|ibri[\\s\\xa0]*lokams[\\s\\xa0]*patr|hibruharuko[\\s\\xa0]*nimti[\\s\\xa0]*patr)a|P(?:avlova[\\s\\xa0]*poslanica[\\s\\xa0]*Hebrejima|oslannja[\\s\\xa0]*do[\\s\\xa0]*jevreiv)|L(?:ettera[\\s\\xa0]*agli[\\s\\xa0]*Ebre|ayang[\\s\\xa0]*Ibran)i|H(?:e(?:b(?:e(?:r[eorw]|w[erw])|w(?:er|re)|(?:o[eor]|e[eo])[eor]|r(?:r[eorw]|we|o[eor]|e(?:ww|r)))|[ew]breww)|(?:w[ew]|w)?breww)s|H(?:e(?:b(?:r(?:ew)?)?|pr)?|br)|Ibra|Cib|Zsid(?:ok)?|List[\\s\\xa0]*(?:Hebrej[ou]|Zidu)m|E(?:pi(?:reyarukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|stula[\\s\\xa0]*ad[\\s\\xa0]*Hebraeos)|vrei|bre|br?|vr))|(?:He(?:br(?:a(?:jczykow|eos)|e(?:j[ou]m|o)|eerne)|prealaisille)|Epireyarukku|Zsidokhoz|Zidum|ibri[\\s\\xa0]*lokams|ad[\\s\\xa0]*Hebraeos|Zydow|(?:Ibran|Ebre)i|hibruharuko[\\s\\xa0]*nimti|Waebrania|Hebrejima|Poslanica[\\s\\xa0]*Hebrejima))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Phillipians)|(?:Filip(?:p(?:aiyo|enze)|ye)n)|(?:P(?:h(?:il(?:(?:(?:l(?:ip(?:p(?:i[ei]|pi)|ii)|l(?:ipi|p|i?pp)i)|p(?:pii|e|ppi))a|l(?:ip(?:ia[ai]|pi?ai)|p(?:ie|a))|pai|lipaia|lipiea)ns|(?:(?:l(?:li)?p|pp?)ia|lip(?:ai?|pia)|lipp?ea|lppia)ns|(?:lipi|p)an|(?:lip(?:p[ai]|i)|pi|lipie)ns|ip(?:p(?:i(?:(?:a[ai]?|ia|e)?ns|beliekhez)|(?:pi|e)?ans|er|ains|aians)|(?:ai?|ia)ns|iaid|[ei]ns|(?:aia|ie|ea|iia)ns))|lipp?ians|(?:lp)?p)|il(?:ippiyarukku[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|p)|iliphphisiyuusa|a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Filipperne|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Filipljanima)|h(?:i(?:l(?:(?:(?:l(?:li)?p|pp?)ia|lip(?:ai?|pia)|lipp?ea|lppia)n|lip?|pp?|i(?:p(?:p(?:(?:pi|e)?an|ia?n)?|(?:ai?|ia)n)?)?)?)?|l(?:ipp?|p))|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*fylyp['’]jan)|F(?:ili(?:p(?:en(?:sow|i)|perbrevet)|boy)|l?p)|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*Pilipyano|Lettera[\\s\\xa0]*ai[\\s\\xa0]*Filippesi|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Filipi|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Wafilipi|B(?:ref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Filippimanna|arua[\\s\\xa0]*kwa[\\s\\xa0]*Wafilipi)|(?:Mga[\\s\\xa0]*Taga(?:\\-?(?:[\\s\\xa0]*[FP]|F)|[\\s\\xa0]*[FP])ilipo|Filipense|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Philippense)s|Filippiekhez|Flippiekhez|(?:List[\\s\\xa0]*Filip(?:ano|sky)|Filipensky)m|(?:Filip(?:pilaiskirj|ianev)|Kirje[\\s\\xa0]*filippilaisill|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*[FP]ilipens)e|Filippenserne|F(?:il(?:i(?:p(?:pi)?)?)?|l)|Bref[\\s\\xa0]*Pals[\\s\\xa0]*til[\\s\\xa0]*Filippimann|List[\\s\\xa0]*do[\\s\\xa0]*Filipian)|(?:(?:(?:Taga(?:\\-?(?:[\\s\\xa0]*[FP]|F)|[\\s\\xa0]*[FP])|F)ilipo|ad[\\s\\xa0]*Philippense)s|Filip(?:anom|ian|skym|pesi)|Mga[\\s\\xa0]*Pilipyano|Wafilipi|Filipljanima|Filipi|(?:Mga[\\s\\xa0]*[FP]ilipens|Filippilaisill)e|Filipperne|P(?:ilip(?:piyarukku|os)|hilippenses|oslanica[\\s\\xa0]*Filipljanima|aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*filipperne)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Dan"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:D(?:a(?:n(?:i(?:el(?:in[\\s\\xa0]*kirja|s[\\s\\xa0]*Bog|e)|al)|yil|e)|an(?:(?:iyy|ye)el|eela))|haniel|[ln])|(?:Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Danie|Liv[\\s\\xa0]*Danyel[\\s\\xa0]*)la|Taniyel|Daniels[\\s\\xa0]*bok|daniyalko[\\s\\xa0]*pustak|Da(?:n(?:ieli?)?|an)?|Prophetia[\\s\\xa0]*Danielis)|(?:Dan(?:iel(?:in|a)|yel)|dani(?:yalko|el)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jude"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Yihudaa)|(?:J(?:u(?:d(?:as(?:arbref|brevet|['’][\\s\\xa0]*Brev|[\\s\\xa0]*(?:epistel|brev))|ov(?:[\\s\\xa0]*List|a))|udaksen[\\s\\xa0]*kirje)|de|id)|Epistula[\\s\\xa0]*Iudae|List[\\s\\xa0]*Judy|Gd|List[\\s\\xa0]*Juduv|(?:(?:Layang[\\s\\xa0]*Y|San[\\s\\xa0]*J|H)u|J)das|Jwdas|Y(?:u(?:ta[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|udas|d)|ihu)|List[\\s\\xa0]*sw[\\s\\xa0]*Judy|List[\\s\\xa0]*sw\\.[\\s\\xa0]*Judy|J(?:u(?:da|ud)|wd)|Yuud|(?:yahuda(?:cem|ko)[\\s\\xa0]*patr|Judina[\\s\\xa0]*poslanic|(?:Lettera[\\s\\xa0]*di[\\s\\xa0]*Gi|Barua[\\s\\xa0]*ya[\\s\\xa0]*Y|I)ud|Yahood)a|Poslan(?:ica[\\s\\xa0]*Jude[\\s\\xa0]*apostola|nja[\\s\\xa0]*apostola[\\s\\xa0]*Judy))|(?:Ju(?:d(?:[ey]|ina|[ou]v|as(?:’[\\s\\xa0]*brev)?)|udaksen)|yahuda(?:cem|ko)|Iudae|Yudas|(?:Giud|Yut)a|Yuda))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*Ma(?:c(?:c(?:ab(?:e(?:(?:e[eo]|o)s|[is]|es)|be(?:e(?:[es]|os)|o?s))|cabbbe)|ab(?:e(?:[is]|us|aid)|bes|b?ees|(?:b?ee[eo]|b?eo)s))|k(?:kab(?:e(?:e(?:rbok|en)|usok)|aer)|abejcov))|\.[\s\xa0]*Ma(?:c(?:c(?:ab(?:e(?:(?:e[eo]|o)s|[is]|es)|be(?:e(?:[es]|os)|o?s))|cabbbe)|ab(?:e(?:[is]|us|aid)|bes|b?ees|(?:b?ee[eo]|b?eo)s))|kabejcov))|II(?:\.?[\s\xa0]*Macccabbbe|\.?[\s\xa0]*Maccabees|\.?[\s\xa0]*Maccabee[eo]s)|(?:2(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))b|II(?:\.?[\s\xa0]*Macabbb|\.?[\s\xa0]*Macccab))es|2(?:\.[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:b?ee[eo]|b?eo))|[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:b?ee[eo]|b?eo)))|II\.?[\s\xa0]*Maccabee[eo]|(?:(?:2(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))b|II(?:\.?[\s\xa0]*Macabbb|\.?[\s\xa0]*Macccab))e|(?:II\.?[\s\xa0]*Maccc|2\.?[\s\xa0]*Maccc)abb)e[es]|(?:II\.?|2\.?)[\s\xa0]*Maccabbbe[es]|2nd[\s\xa0]*Macc(?:abb(?:e(?:e[es]|s)|be[es])|cab(?:e(?:e[es]|s)|be[es]))|2nd\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]|s)|be[es])|cab(?:e(?:e[es]|s)|be[es]))|Second[\s\xa0]*Macc(?:abb(?:e(?:e[es]|s)|be[es])|cab(?:e(?:e[es]|s)|be[es])))|(?:(?:2(?:[\s\xa0]*Mac(?:c(?:ab(?:b[be]|e)|cab[be])|ab(?:bb?)?e)|\.[\s\xa0]*Mac(?:c(?:cab[be]|abb?e)|ab(?:bb?)?e))|II(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))be)e|II(?:\.[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o)|[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o))s|2nd[\s\xa0]*Maccabe(?:ee?)?s|2nd\.[\s\xa0]*Maccabe(?:ee?)?s|Second[\s\xa0]*Maccabe(?:ee?)?s)|(?:II(?:\.[\s\xa0]*Maccabbe(?:e[eos]|[os])|[\s\xa0]*Maccabbe(?:e[eos]|[os]))|2[\s\xa0]*Macccabe)|(?:II\.?[\s\xa0]*Maccabbee)|(?:(?:Druh[ay][\s\xa0]*M|2[\s\xa0]*M)akabejska|2[\s\xa0]*Makabe|2[\s\xa0]*makkabilaiskirja|2\.[\s\xa0]*(?:makkabilaiskirj|Makabejsk)a|II(?:\.[\s\xa0]*(?:makkabilaiskirj|Makabejsk)|[\s\xa0]*(?:makkabilaiskirj|Makabejsk))a)|(?:I(?:I(?:\.[\s\xa0]*(?:M(?:a(?:c(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe[eios]|abaeorum|habaeorum)|kkabeusok)|ga[\s\xa0]*Macabeo)|Wamakabayo)|[\s\xa0]*(?:M(?:a(?:c(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe[eios]|abaeorum|habaeorum)|kkabeusok)|ga[\s\xa0]*Macabeo)|Wamakabayo))|kalawang[\s\xa0]*Mga[\s\xa0]*Macabeo)|2(?:[\s\xa0]*M(?:a(?:ccc|kk)|c[bh])|Macc|[\s\xa0]*Macabe|\.[\s\xa0]*Ma(?:kkabaer|cc?abe))|Zweite[\s\xa0]*Makkabaer|(?:Pili|2\.?)[\s\xa0]*Wamakabayo|2\.?[\s\xa0]*Mga[\s\xa0]*Macabeo|(?:Anden[\s\xa0]*Mak|Pili[\s\xa0]*Ma)k|(?:Andre[\s\xa0]*Makkabeer|Onnur[\s\xa0]*Makkabea|2\.[\s\xa0]*Makkabeer)bok|(?:Masodik|2\.)[\s\xa0]*Makkabeusok|(?:Liber[\s\xa0]*II[\s\xa0]*Mac|2\.?[\s\xa0]*Ma)cabaeorum|2[\s\xa0]*Machabaeorum|2\.[\s\xa0]*Machabaeorum|2\.[\s\xa0]*Makkabeeen|(?:(?:Andra|2\.?)[\s\xa0]*Mackabeerbok|II\.?[\s\xa0]*Makkabee)en|2e\.?[\s\xa0]*Makkabeeen|Tweede[\s\xa0]*Makkabeeen|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*II|Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*II|(?:2\.[\s\xa0]*Ma(?:ccc|k)a|II\.?[\s\xa0]*Macabb)be|(?:II(?:\.[\s\xa0]*Macc(?:ab|ca)|[\s\xa0]*Macc(?:ab|ca))|2(?:(?:\.[\s\xa0]*Macc?|[\s\xa0]*Mac)ab|[\s\xa0]*Macca))bb?e|(?:2\.o\.?[\s\xa0]*Macab(?:bee?|ee?)|Ikalawang[\s\xa0]*Macabe|2\.o\.?[\s\xa0]*Maccab(?:bee?|ee?)|2o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|2o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))os|2nd\.?[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:ee?)?s)|e(?:ee?)?s)|c(?:ab(?:[be]e|bb)|cab(?:bb?|e))e)|Se(?:cond(?:[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:ee?)?s)|e(?:ee?)?s)|c(?:ab(?:[be]e|bb)|cab(?:bb?|e))e)|a[\s\xa0]*Maccabei|o[\s\xa0]*(?:libro[\s\xa0]*dei[\s\xa0]*)?Maccabei)|gundo[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os)|(?:II\.?|2a|2a\.|2o|2o\.|Segund[ao])[\s\xa0]*Macabeus|2e\.?[\s\xa0]*Maccabees|2(?:de?|eme)[\s\xa0]*Maccabees|2(?:de?|eme)\.[\s\xa0]*Maccabees|II\.?[\s\xa0]*Makabejcov|(?:II\.?|2\.?)[\s\xa0]*Machabejcov|2[\s\xa0]*k[\s\xa0]*Ma(?:ch|k)abejcov|2[\s\xa0]*k\.[\s\xa0]*Ma(?:ch|k)abejcov|II(?:\.[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abe|c)?)?|k(?:abe|k)?)|[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abe|c)?)?|k(?:abe|k)?))|2(?:[\s\xa0]*M(?:a(?:c(?:c|h|k)?|k)?|c)?|\.[\s\xa0]*Ma(?:c(?:cc?)?|kk?))|(?:Masodik[\s\xa0]*Ma|Andre[\s\xa0]*Mak)k|2e\.?[\s\xa0]*Mak|Tweede[\s\xa0]*Mak|(?:2\.o\.?[\s\xa0]*Macab(?:bee?|ee?)|Ikalawang[\s\xa0]*Macabe|2\.o\.?[\s\xa0]*Maccab(?:bee?|ee?)|2o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|2o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|2nd\.?[\s\xa0]*Mac(?:ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|c(?:ab[be]e|abe|c(?:abe)?)?)?|Se(?:cond[\s\xa0]*Mac(?:ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|c(?:ab[be]e|abe|c(?:abe)?)?)?|gundo[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o)|(?:(?:II\.?|2\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejsk|Toinen[\s\xa0]*makkabilaiskirj)a|D(?:ru(?:h(?:(?:a[\s\xa0]*(?:kniha[\s\xa0]*Ma(?:ch|k)|Ma(?:ch|k))|y[\s\xa0]*(?:list[\s\xa0]*Ma(?:ch|k)|Ma(?:ch|k)))abejcov|[ay][\s\xa0]*Mak)|g(?:a[\s\xa0]*(?:Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejsk|knjiga[\s\xa0]*o[\s\xa0]*Makabejcim)|i[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejsk)a)|euxiemes?[\s\xa0]*Maccabees))|(?:Wamakabayo[\s\xa0]*II|2[\s\xa0]*makk))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:3(?:[\s\xa0]*Ma(?:c(?:cab(?:be(?:e[es]|s)|e[is])|ab(?:e(?:[is]|aid)|bes))|kkab(?:e(?:e(?:rbok|en)|usok)|aer))|\.[\s\xa0]*Mac(?:cab(?:be(?:e[es]|s)|e[is])|ab(?:e(?:[is]|aid)|bes)))|(?:3(?:rd[\s\xa0]*Macc(?:ab|ca)|\.?[\s\xa0]*Macabb|rd\.[\s\xa0]*Macc(?:ab|ca))|Third[\s\xa0]*Macc(?:ab|ca))bes|3\.?[\s\xa0]*Macccab(?:bbe|es)|3(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))ees|(?:(?:3(?:rd[\s\xa0]*Macc(?:ab|ca)|\.?[\s\xa0]*Macabb|rd\.[\s\xa0]*Macc(?:ab|ca))|Third[\s\xa0]*Macc(?:ab|ca))be|3\.?[\s\xa0]*Macccab[be])e[es]|3\.?[\s\xa0]*Maccabbbe[es]|(?:3(?:\.[\s\xa0]*Mac(?:ab(?:e[ou]|beo)|cab(?:bee?|e)o)|[\s\xa0]*Mac(?:ab(?:e[ou]|beo)|cab(?:bee?|e)o)|rd[\s\xa0]*Mac(?:abb?|cab)eee|rd\.[\s\xa0]*Mac(?:abb?|cab)eee)|Third[\s\xa0]*Mac(?:abb?|cab)eee|3(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))ee[eo])s|III(?:\.[\s\xa0]*Mac(?:c(?:ab(?:b(?:be[es]|ee?os)|e(?:e[eo]|o|e)s)|cab(?:[be]e[es]|bbe|es))|ab(?:(?:be(?:e[eo]|o)|e(?:e[eo]|o))s|bbe(?:e[es]|s)))|[\s\xa0]*Mac(?:c(?:ab(?:b(?:be[es]|ee?os)|e(?:e[eo]|o|e)s)|cab(?:[be]e[es]|bbe|es))|ab(?:(?:be(?:e[eo]|o)|e(?:e[eo]|o))s|bbe(?:e[es]|s)))))|(?:3(?:[\s\xa0]*Mac(?:c(?:ab(?:b(?:ee?o|be)|e(?:e[eo]|o))|cab[be]e)|ab(?:b?e(?:e[eo]|o)|bbee))|\.[\s\xa0]*Mac(?:cabe(?:e[eo]|o)|abb?ee[eo]|(?:ccab[be]|abbbe)e))|III(?:\.[\s\xa0]*Maccabbe(?:e[eos]|[os])|[\s\xa0]*Maccabbe(?:e[eos]|[os])|(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))bee)|3rd[\s\xa0]*Macc(?:ab(?:e(?:e[es]|s)|bbe[es])|cabbe[es])|3rd\.[\s\xa0]*Macc(?:ab(?:e(?:e[es]|s)|bbe[es])|cabbe[es])|Third[\s\xa0]*Macc(?:ab(?:e(?:e[es]|s)|bbe[es])|cabbe[es]))|(?:3(?:[\s\xa0]*Mac(?:c(?:abe|cab)|abe)e|\.[\s\xa0]*Macab(?:be[eo]|e[eo])|[\s\xa0]*Macc?abbee|\.[\s\xa0]*Maccabee)|III\.?[\s\xa0]*Maccabbee)|(?:III(?:\.[\s\xa0]*(?:makkabilaiskirj|Makabejsk)|[\s\xa0]*(?:makkabilaiskirj|Makabejsk))a|(?:Treti[\s\xa0]*Makabej|3\.?[\s\xa0]*Makabej)ska|3\.?[\s\xa0]*Makabe|3\.?[\s\xa0]*makkabilaiskirja)|(?:III(?:\.[\s\xa0]*Mac(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe(?:[ios]|e[eo])|abaeorum|habaeorum)|[\s\xa0]*Mac(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe(?:[ios]|e[eo])|abaeorum|habaeorum))|3(?:\.[\s\xa0]*Ma(?:c(?:cab(?:bee?o|e)|abe)|kkabaer)|[\s\xa0]*M(?:a(?:ccc|kk)|c[bh])|Macc|[\s\xa0]*Macabe)|Dritte[\s\xa0]*Makkabaer|(?:Liber[\s\xa0]*III[\s\xa0]*Mac|3\.?[\s\xa0]*Ma)cabaeorum|3[\s\xa0]*Machabaeorum|3\.[\s\xa0]*Machabaeorum|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*III|Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*III|(?:I(?:katlong|II\.?)[\s\xa0]*Mg|3\.?[\s\xa0]*Mg)a[\s\xa0]*Macabeo|(?:III\.?|3\.?)[\s\xa0]*Wamakabayo|(?:III(?:\.[\s\xa0]*Ma(?:cabb|ka)|[\s\xa0]*Ma(?:cabb|ka))|3\.[\s\xa0]*Macc(?:abb|ca))be|(?:III(?:\.[\s\xa0]*Macc(?:ab|ca)|[\s\xa0]*Macc(?:ab|ca))|3(?:\.?[\s\xa0]*Macab|[\s\xa0]*Macca))bb?e|3rd[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:e[es]|s))|e(?:e[es]|s))|c(?:ab(?:b?e|bb)|cab(?:bb?|e))e)|3rd\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:e[es]|s))|e(?:e[es]|s))|c(?:ab(?:b?e|bb)|cab(?:bb?|e))e)|3o\.?[\s\xa0]*Macabeos|(?:Ikatlong[\s\xa0]*Macab|3o\.?[\s\xa0]*Macabe)eos|3o\.?[\s\xa0]*Macabbee?os|3o\.?[\s\xa0]*Maccab(?:bee?|ee?)os|3\.o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|3\.o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|(?:III\.?|3o\.?|3a|3a\.)[\s\xa0]*Macabeus|3e\.?[\s\xa0]*Maccabees|3eme[\s\xa0]*Maccabees|3eme\.[\s\xa0]*Maccabees|(?:Harmadik|3\.|III\.?)[\s\xa0]*Makkabeusok|3\.[\s\xa0]*Makkabeerbok|3\.[\s\xa0]*Makkabeeen|(?:Derde|3e\.?|III\.?)[\s\xa0]*Makkabeeen|3[\s\xa0]*Mackabeerboken|3(?:e\.?|\.)[\s\xa0]*Mackabeerboken|(?:III\.?|3\.?)[\s\xa0]*Machabejcov|3[\s\xa0]*k[\s\xa0]*Machabejcov|3[\s\xa0]*k\.[\s\xa0]*Machabejcov|III(?:\.[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abee?|c)?)?|kk?)|[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abee?|c)?)?|kk?))|3(?:[\s\xa0]*M(?:a(?:c(?:c|h|k)?|k)|c)?|e\.?[\s\xa0]*Mak|\.[\s\xa0]*Ma(?:c(?:c(?:abbee?|c)?)?|kk?))|(?:Harmadik|Derde)[\s\xa0]*Mak|3rd[\s\xa0]*Mac(?:ab(?:b(?:bee?|ee?)|ee?)|c(?:c(?:abe)?|abb?e)?)?|3rd\.[\s\xa0]*Mac(?:ab(?:b(?:bee?|ee?)|ee?)|c(?:c(?:abe)?|abb?e)?)?|3o\.?[\s\xa0]*Macabeo|(?:Ikatlong[\s\xa0]*Macab|3o\.?[\s\xa0]*Macabe)eo|3o\.?[\s\xa0]*Macabbee?o|3o\.?[\s\xa0]*Maccab(?:bee?|ee?)o|3\.o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|3\.o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|(?:(?:III\.?|3\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejsk|Kolmas[\s\xa0]*makkabilaiskirj)a|T(?:er(?:cer(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))os|z(?:o[\s\xa0]*(?:libro[\s\xa0]*dei[\s\xa0]*)?|a[\s\xa0]*)Maccabei)|hird[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:e[es]|s))|e(?:e[es]|s))|c(?:ab(?:b?e|bb)|cab(?:bb?|e))e)|atu[\s\xa0]*Wamakabayo|erceir[ao][\s\xa0]*Macabeus|atu[\s\xa0]*Mak|ercer(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|hird[\s\xa0]*Mac(?:ab(?:b(?:bee?|ee?)|ee?)|c(?:c(?:abe)?|abb?e)?)?|r(?:e(?:ti(?:a[\s\xa0]*(?:kniha[\s\xa0]*)?Machabejcov|[\s\xa0]*Ma(?:chabejcov|k))|dje[\s\xa0]*Ma(?:ckabeerboken|kkabeerbok)|dje[\s\xa0]*Makk|ca[\s\xa0]*knjiga[\s\xa0]*o[\s\xa0]*Makabejcima)|zeci(?:a[\s\xa0]*Ks(?:ieg[ai]|\.)?|[\s\xa0]*Ks(?:ieg[ai]|\.)?)[\s\xa0]*Machabejska|oisiemes?[\s\xa0]*Maccabees)))|(?:Wamakabayo[\s\xa0]*III|3[\s\xa0]*makk))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["4Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:(?:IV(?:\.[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o)|[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o)|\.?[\s\xa0]*Maccabee[eo])|4(?:\.[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:e[ou]|beo|b?ee[eo]))|[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:e[ou]|beo|b?ee[eo]))))s|4(?:[\s\xa0]*Ma(?:c(?:cab(?:be(?:e[es]|s)|e(?:[is]|es))|ab(?:e(?:[is]|aid)|bes|b?ees))|kkab(?:e(?:e(?:rbok|en)|usok)|aer))|\.[\s\xa0]*Mac(?:cab(?:be(?:e[es]|s)|e(?:[is]|es))|ab(?:e(?:[is]|aid)|bes|b?ees)))|IV\.?[\s\xa0]*Maccabees|4\.?[\s\xa0]*Macccabbbe|(?:(?:(?:IV\.?|4\.?)[\s\xa0]*Maccab|4\.?[\s\xa0]*Maccca)b|IV\.?[\s\xa0]*Macccab)be[es]|(?:IV\.?[\s\xa0]*Macccab|4\.?[\s\xa0]*Macccab)e(?:e[es]|s)|4\.?[\s\xa0]*Macabbbe(?:e[es]|s)|4th[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees))|4th\.[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees))|Fourth[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees)))|(?:4(?:[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|abb?e(?:e[eo]|o))|\.[\s\xa0]*Mac(?:cabe(?:e[eo]|o)|abb?ee[eo]))|IV(?:\.[\s\xa0]*Maccabbe(?:e[eos]|[os])|[\s\xa0]*Maccabbe(?:e[eos]|[os]))|4[\s\xa0]*Macc(?:cab[be]|abbb)e|4(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Macabb)bee|4th[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|4th\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|Fourth[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e)))|(?:4(?:\.[\s\xa0]*Mac(?:ab(?:be[eo]|e[eo])|cabee)|[\s\xa0]*Macc?abb?ee|th[\s\xa0]*Mac(?:c(?:abe|cab)|abb?e)e|th\.[\s\xa0]*Mac(?:c(?:abe|cab)|abb?e)e)|Fourth[\s\xa0]*Mac(?:c(?:abe|cab)|abb?e)e)|(?:4\.?[\s\xa0]*Makabejska)|(?:Cuarto[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|4\.?[\s\xa0]*Makabe|Ctvrta[\s\xa0]*Makabejska|4\.?[\s\xa0]*makkabilaiskirja|IV(?:\.[\s\xa0]*(?:makkabilaiskirj|Makabejsk)|[\s\xa0]*(?:makkabilaiskirj|Makabejsk))a)|(?:4(?:th(?:\.[\s\xa0]*Mac(?:c(?:abe|c)|abe)|[\s\xa0]*Mac(?:c(?:abe|c)|abe))|Macc|[\s\xa0]*M(?:c[bh]|akk)|[\s\xa0]*Macabe|\.[\s\xa0]*Ma(?:c(?:cab(?:bee?o|e)|abe)|kkabaer))|Fourth[\s\xa0]*Mac(?:c(?:abe|c)|abe)|Vierte[\s\xa0]*Makkabaer|4(?:\.o(?:\.[\s\xa0]*Mac(?:cabb?|abb?)|[\s\xa0]*Mac(?:cabb?|abb?))|o(?:\.?[\s\xa0]*Macabb|\.?[\s\xa0]*Macab|\.?[\s\xa0]*Maccabb?))eos|4(?:\.o(?:\.[\s\xa0]*Mac(?:cabb?|abb?)|[\s\xa0]*Mac(?:cabb?|abb?))|o(?:\.?[\s\xa0]*Macabb|\.?[\s\xa0]*Macab|\.?[\s\xa0]*Maccabb?))eeos|4\.[\s\xa0]*Makkabeeen|(?:Fjarde[\s\xa0]*Mackabeerbok|Vierde[\s\xa0]*Makkabee|4\.?[\s\xa0]*Mackabeerbok)en|4(?:\.[\s\xa0]*Maccabb|[\s\xa0]*Maccca)be|(?:4(?:th(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)ab|[\s\xa0]*Macca|[\s\xa0]*Macab|\.[\s\xa0]*Mac(?:cca|ab))|Fourth[\s\xa0]*Macc?ab)bb?e|(?:Liber[\s\xa0]*IV[\s\xa0]*Mac|4\.?[\s\xa0]*Ma)cabaeorum|4[\s\xa0]*Machabaeorum|4\.[\s\xa0]*Machabaeorum|I(?:V(?:\.[\s\xa0]*Ma(?:c(?:ab(?:b(?:e(?:e[eos]|[os])|be(?:e[es]|s))|e(?:[ios]|aid|e[eos]))|c(?:ab(?:e(?:[ios]|e[eo])|bee|bbe)|cab(?:bb?|e)e)|abaeorum|habaeorum)|k(?:kabeeen|abe))|[\s\xa0]*Ma(?:c(?:ab(?:b(?:e(?:e[eos]|[os])|be(?:e[es]|s))|e(?:[ios]|aid|e[eos]))|c(?:ab(?:e(?:[ios]|e[eo])|bee|bbe)|cab(?:bb?|e)e)|abaeorum|habaeorum)|k(?:kabeeen|abe)))|kaapat[\s\xa0]*Macabeos)|(?:IV\.?|4\.?)[\s\xa0]*Machabejcov|4[\s\xa0]*k[\s\xa0]*Machabejcov|4[\s\xa0]*k\.[\s\xa0]*Machabejcov|Stvrta[\s\xa0]*(?:kniha[\s\xa0]*)?Machabejcov|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*IV|Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*IV|(?:(?:4o\.?|IV\.?)[\s\xa0]*Macabeu|4e(?:me)?[\s\xa0]*Maccabee|4e(?:me)?\.[\s\xa0]*Maccabee)s|4a\.?[\s\xa0]*Macabeus|Qua(?:rt(?:o[\s\xa0]*(?:Mac(?:abeus|cabei)|libro[\s\xa0]*dei[\s\xa0]*Maccabei)|a[\s\xa0]*Mac(?:abeus|cabei))|triemes?[\s\xa0]*Maccabees)|(?:(?:Fjerde|4\.)[\s\xa0]*Makkabeerb|4\.[\s\xa0]*Makkabeus|IV\.?[\s\xa0]*Makkabeus)ok|Nne[\s\xa0]*Mak|(?:(?:I(?:kaapat|V\.?)[\s\xa0]*Mg|4\.?[\s\xa0]*Mg)a[\s\xa0]*Macabe|(?:IV\.?|4\.?)[\s\xa0]*Wamakabay|Nne[\s\xa0]*Wamakabay)o|4(?:[\s\xa0]*M(?:a(?:c(?:cc?|h|k)?|k)|c)?|th(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)|\.[\s\xa0]*Ma(?:c(?:c(?:abbee?|c)?)?|kk?))|(?:Fjerde[\s\xa0]*Mak|Vierde[\s\xa0]*Ma)k|Fourth[\s\xa0]*Macc?|4(?:\.o(?:\.[\s\xa0]*Mac(?:cabb?|abb?)|[\s\xa0]*Mac(?:cabb?|abb?))|o(?:\.?[\s\xa0]*Macabb|\.?[\s\xa0]*Macab|\.?[\s\xa0]*Maccabb?))eo|4(?:\.o(?:\.[\s\xa0]*Mac(?:cabb?|abb?)|[\s\xa0]*Mac(?:cabb?|abb?))|o(?:\.?[\s\xa0]*Macabb|\.?[\s\xa0]*Macab|\.?[\s\xa0]*Maccabb?))eeo|I(?:V(?:\.[\s\xa0]*Ma(?:c(?:c(?:abee?|abbe|c(?:abe)?)?|ab(?:b(?:bee?|ee?)|ee?))?|kk?)|[\s\xa0]*Ma(?:c(?:c(?:abee?|abbe|c(?:abe)?)?|ab(?:b(?:bee?|ee?)|ee?))?|kk?))|kaapat[\s\xa0]*Macabeo)|Neljas[\s\xa0]*makkabilaiskirja|(?:IV\.?|4\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejska|C(?:uarto[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|tvrta[\s\xa0]*Mak|zwarta[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejska))|(?:Wamakabayo[\s\xa0]*IV|4[\s\xa0]*makk))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:[\s\xa0]*Ma(?:c(?:cab(?:be(?:e[es]|s)|e(?:[is]|es))|ab(?:e(?:[is]|aid)|bes|b?ees))|kkab(?:e(?:e(?:rbok|en)|usok)|aer))|\.[\s\xa0]*Maccabees)|I\.?[\s\xa0]*Mac(?:cab(?:be(?:e[es]|s)|e(?:[is]|es))|ab(?:e(?:[is]|aid)|bes|b?ees))|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)ccabbbe|(?:1(?:\.[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o|cabee[eo])|[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:e[ou]|beo|b?ee[eo])))|I\.?[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:e[ou]|beo|b?ee[eo])))s|(?:(?:1\.?[\s\xa0]*Mac|I\.?[\s\xa0]*Mac)cab|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)cca|1\.[\s\xa0]*Maccca)bbe[es]|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac|1\.[\s\xa0]*Mac)ccabe(?:e[es]|s)|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)abbbe(?:e[es]|s)|1st[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees))|1st\.[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees))|First[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees)))|(?:I(?:(?:(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))e|\.[\s\xa0]*Maccabbee?|[\s\xa0]*Maccabbee?)o|(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))ee[eo])|1(?:[\s\xa0]*Mac(?:ab(?:bee[eo]|ee[eo])|cabe(?:e[eo]|o))|\.[\s\xa0]*Maccabbe(?:e[eos]|[os]))|I(?:\.?[\s\xa0]*Macccab[be]|\.?[\s\xa0]*Maccabbb)e|(?:1[\s\xa0]*Mac(?:abb|cca)|I\.?[\s\xa0]*Macabb)bee|1st[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|1st\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|First[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e)))|(?:(?:1st\.?[\s\xa0]*Macabe|I\.?[\s\xa0]*Macccab)e|1[\s\xa0]*Macab(?:be[eo]|e[eo])|1st\.?[\s\xa0]*Macabbee|1(?:st\.?)?[\s\xa0]*Maccabee|First[\s\xa0]*Maccabee)|(?:First[\s\xa0]*Macc(?:ab(?:bb?)?|cab)e)|(?:1(?:[\s\xa0]*(?:makkabilaiskirja|Makabe(?:jska)?)|\.[\s\xa0]*(?:makkabilaiskirj|Makabejsk)a)|(?:Prvni[\s\xa0]*|I\.?[\s\xa0]*)Makabejska|I\.?[\s\xa0]*Makabe|I\.?[\s\xa0]*makkabilaiskirja)|(?:1(?:[\s\xa0]*M(?:a(?:c(?:cab(?:bee?o|e)|abe)|kk)|c[bh])|st(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)abe|Macc|(?:st\.?[\s\xa0]*Maccca|[\s\xa0]*Maccabb)be|(?:st(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)ab|[\s\xa0]*Mac(?:cca|ab))bb?e|[\s\xa0]*Macabaeorum|[\s\xa0]*Machabaeorum|\.[\s\xa0]*Ma(?:c(?:ab(?:b(?:e(?:e[eos]|[os])|be(?:e[es]|s))|e(?:[ios]|aid|e[eos]))|c(?:ab(?:e(?:[ios]|e[eo])|bee|bbe)|cab(?:bb?|e)e)|abaeorum|habaeorum)|kabe))|(?:I(?:\.[\s\xa0]*Mac(?:cabb?|ab)|[\s\xa0]*Mac(?:cabb?|ab))|First[\s\xa0]*Macab|(?:First|I\.?)[\s\xa0]*Macabb)ee|(?:First|I\.?)[\s\xa0]*Maccc|(?:First|I\.?)[\s\xa0]*Macabbbe|(?:Liber[\s\xa0]*I[\s\xa0]*Mac|I\.?[\s\xa0]*Ma)cabaeorum|I\.?[\s\xa0]*Machabaeorum|(?:Una(?:ng)?|I\.?|1\.?)[\s\xa0]*Mga[\s\xa0]*Macabeo|(?:1\.?|I\.?)[\s\xa0]*Wamakabayo|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*I|K(?:itabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*I|wanza[\s\xa0]*Wamakabayo)|1(?:(?:ere?|re)[\s\xa0]*Maccabee|(?:o\.?|\.)[\s\xa0]*Macabeu|(?:ere?|re)\.[\s\xa0]*Maccabee)s|1a[\s\xa0]*Macabeus|1a\.[\s\xa0]*Macabeus|1o\.?[\s\xa0]*Macabeos|(?:Una(?:ng)?[\s\xa0]*Macab|1o\.?[\s\xa0]*Macabe)eos|1o\.?[\s\xa0]*Macabbee?os|1o\.?[\s\xa0]*Maccab(?:bee?|ee?)os|1\.o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|1\.o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|(?:1\.?[\s\xa0]*Mach|I\.?[\s\xa0]*Mach)abejcov|1[\s\xa0]*k[\s\xa0]*Machabejcov|1[\s\xa0]*k\.[\s\xa0]*Machabejcov|Pr(?:im(?:e(?:r(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|ir[ao][\s\xa0]*Macabeu)s|a[\s\xa0]*Maccabei|o[\s\xa0]*(?:libro[\s\xa0]*dei[\s\xa0]*)?Maccabei)|emier(?:es?|s)?[\s\xa0]*Maccabees|v(?:a[\s\xa0]*(?:Ma(?:ch|k)|kniha[\s\xa0]*Mach)|y[\s\xa0]*(?:list[\s\xa0]*)?Mach)abejcov)|1\.[\s\xa0]*Makkabaer|(?:Kwanza|Prvni)[\s\xa0]*Mak|(?:Fyrsta[\s\xa0]*Makkabea|1\.[\s\xa0]*Makkabeer)bok|(?:I\.?|1\.)[\s\xa0]*Makkabeusok|1\.[\s\xa0]*Makkabeeen|(?:Forsta[\s\xa0]*Mackabeerbok|I\.?[\s\xa0]*Makkabee|1\.?[\s\xa0]*Mackabeerbok)en|1e[\s\xa0]*Makkabeeen|1e\.[\s\xa0]*Makkabeeen|1(?:[\s\xa0]*M(?:a(?:c(?:c(?:abbee?|c)?|h|k)?|k)?|c)?|st(?:\.[\s\xa0]*Mac(?:cc?)?|[\s\xa0]*Mac(?:cc?)?)|\.[\s\xa0]*Ma(?:c(?:c(?:abee?|abbe|c(?:abe)?)?|ab(?:b(?:bee?|ee?)|ee?))?|kk?))|(?:I(?:\.[\s\xa0]*Mac(?:cabb?|ab)|[\s\xa0]*Mac(?:cabb?|ab))|First[\s\xa0]*Macab|(?:First|I\.?)[\s\xa0]*Macabb)e|I(?:\.[\s\xa0]*Ma(?:cc?|kk?)|[\s\xa0]*Ma(?:cc?|kk?))|First[\s\xa0]*Macc?|1o\.?[\s\xa0]*Macabeo|(?:Una(?:ng)?[\s\xa0]*Macab|1o\.?[\s\xa0]*Macabe)eo|1o\.?[\s\xa0]*Macabbee?o|1o\.?[\s\xa0]*Maccab(?:bee?|ee?)o|1\.o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|1\.o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|Primer(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|1e[\s\xa0]*Mak|1e\.[\s\xa0]*Mak|(?:P(?:ierwsz[aey][\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejsk|rva[\s\xa0]*knjiga[\s\xa0]*o[\s\xa0]*Makabejcim)|(?:1\.?|I\.?)[\s\xa0]*Ks(?:ieg[ai]|\.)?[\s\xa0]*Machabejsk)a|E(?:lso[\s\xa0]*Makkabeusok|rste[\s\xa0]*Makkabaer|erste[\s\xa0]*Makkabeeen|(?:erste|lso)[\s\xa0]*Mak|nsimmainen[\s\xa0]*makkabilaiskirja))|(?:Maccabees|1[\s\xa0]*makk|Wamakabayo[\s\xa0]*I))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Mark"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:ar|r)?|[\\s\\xa0]*M(?:ar|r)?)|aint[\\s\\xa0]*M(?:ar|r)?)|M(?:ar|r)?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:ar|r)?|[\\s\\xa0]*M(?:ar|r)?)|aint[\\s\\xa0]*M(?:ar|r)?)|M(?:ar|r)?))k|Injili[\\s\\xa0]*ya[\\s\\xa0]*Marko|mark(?:usl|an)e|Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Marco|Evankeliumi[\\s\\xa0]*Markuksen[\\s\\xa0]*mukaan|(?:E(?:w(?:angelia[\\s\\xa0]*wg[\\s\\xa0]*sw|angelia|(?:angelia[\\s\\xa0]*wg[\\s\\xa0]*sw)?\\.)?|van(?:gelium[\\s\\xa0]*podle|jelium[\\s\\xa0]*Podla))|Jevanhelije[\\s\\xa0]*vid)[\\s\\xa0]*Marka|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Markut|Evangelium[\\s\\xa0]*secundum[\\s\\xa0]*Marcum|(?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Ma?|[\\s\\xa0]*Ma?)|aint[\\s\\xa0]*Ma?)|Ma?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Ma?|[\\s\\xa0]*Ma?)|aint[\\s\\xa0]*Ma?)|Ma?))|Ew[\\s\\xa0]*Ma)r|(?:(?:Evangeliet[\\s\\xa0]*etter|Injil)[\\s\\xa0]*Mark|Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Mar[ck])us|(?:E(?:banghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay|l[\\s\\xa0]*Evangelio[\\s\\xa0]*de)|Sulat[\\s\\xa0]*ni[\\s\\xa0]*San)[\\s\\xa0]*Marcos|Ebanghelyo[\\s\\xa0]*ni[\\s\\xa0]*(?:San[\\s\\xa0]*Mar[ck]|Mar[ck])os|M(?:a(?:r(?:k(?:u(?:s(?:[\\s\\xa0]*evangelium|evangeliet)|[\\s\\xa0]*Narceyti|ksen[\\s\\xa0]*evankeliumi)|ovo[\\s\\xa0]*evangelium)|qqoosa|cu|ek|[cq]|akus)|buting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*Mar[ck]|Mar[ck])os)|rcos|r?c))|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?)))|M(?:ar(?:k(?:u(?:ksen|s)|os|a)|cos)|k)|(?:Marc|mark)us|San[\\s\\xa0]*Marcos|Evangelio[\\s\\xa0]*de[\\s\\xa0]*Marcos|Mar(?:k(?:o|u)?|co)?|Mrk?|St[\\s\\xa0]*M(?:rk?|k|ark?)|St\\.[\\s\\xa0]*M(?:rk?|k|ark?)|Saint[\\s\\xa0]*M(?:rk?|k|ark?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jas"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jako(?:vljeva[\\s\\xa0]*poslanica|bsbrevet)|yak(?:obacem|ubko)[\\s\\xa0]*patra)|(?:J(?:a(?:k(?:ob(?:usbrief|it|s[\\s\\xa0]*epistel)|ubov[\\s\\xa0]*List)|(?:me)?s|akobin[\\s\\xa0]*kirje)|ms|k)|Ia(?:co[bv]|go)|G[cm]|Tg|Stg|Epistula[\\s\\xa0]*Iacobi|Jac?ques|Jakobs[\\s\\xa0]*Brev|(?:(?:Sant|T)iag|Jacob|Barua[\\s\\xa0]*ya[\\s\\xa0]*Yakob|Waraka[\\s\\xa0]*wa[\\s\\xa0]*Yakob)o|L(?:ist[\\s\\xa0]*Jakub(?:uv|a)|ayang[\\s\\xa0]*Yakobus|ettera[\\s\\xa0]*di[\\s\\xa0]*Giacomo)|Jakab|Ya(?:k(?:kopu[\\s\\xa0]*Elutiya[\\s\\xa0]*Nirupam|oob)|cquub|q)|J(?:a(?:k(?:ob(?:us|i)?|ub)?|cq?|me?|ak)?|m)|S(?:ant?|t)|Ia[cg]|Ya(?:cq?|k)|(?:List[\\s\\xa0]*sw\\.?[\\s\\xa0]*Jaku|Yaaqoo)ba|Poslannja[\\s\\xa0]*apostola[\\s\\xa0]*Jakova)|(?:Ja(?:k(?:o(?:bs(?:[\\s\\xa0]*brev)?|vljeva)|ub(?:[ou]v|a))|akobin)|Yak(?:ob(?:us|o)|kopu)|Iacobi|Giacomo|yak(?:obacem|ubko)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Amos"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:A(?:m(?:o(?:s(?:['’][\\s\\xa0]*(?:Bog|bok)|[iz])|xa)|s|ox?)?|am(?:oksen[\\s\\xa0]*kirja)?)|(?:Ks(?:ieg[ai]|\\.)?[\\s\\xa0]*Amos|Liv[\\s\\xa0]*Amos[\\s\\xa0]*l)a|(?:Prophetia[\\s\\xa0]*Am|Caamo)os|Caam)|(?:A(?:amoksen|mosa?)|amos))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Tob"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:T(?:ob(?:i(?:olo|e|jas|ts[\\s\\xa0]*Bog|ts[\\s\\xa0]*?bok|as['’][\\s\\xa0]*bok)|t)|ho|b)|Liber[\\s\\xa0]*T(?:hobis|obiae)|Tobi(?:aa?|ti)n[\\s\\xa0]*kirja|Ks(?:\\.[\\s\\xa0]*Tobi(?:asz|t)|[\\s\\xa0]*Tobi(?:asz|t)|ieg[ai][\\s\\xa0]*Tobi(?:asz|t))a|Tob(?:i(?:ja|ti|a)?)?|Cartea[\\s\\xa0]*lui[\\s\\xa0]*Tobit)|(?:Tobi(?:a(?:[ens]|an)|t(?:in)?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jdt"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Juditin[\\s\\xa0]*kirja)|(?:J(?:ud(?:it(?:s[\\s\\xa0]*Bog|[eh]|s[\\s\\xa0]*bok|arbok)|th)|di?th)|Yud(?:ith?i|t)|Liber[\\s\\xa0]*Iudith|[GI]dt|J(?:ud(?:ita?|t)|di?t)|Yudith|(?:Giudit|Iudi)ta|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Judyty|itab[\\s\\xa0]*Yudit|[\\s\\xa0]*Juditina|\\.[\\s\\xa0]*Juditina|niha[\\s\\xa0]*Juditina))|(?:Jud(?:itin|yty)|Iudith|Yudit))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Bar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:B(?:aru(?:k(?:s(?:[\\s\\xa0]*(?:Bog|bok)|bok)|u)|[ch]|que)|r)|Liber[\\s\\xa0]*Baruch|Baa?rukin[\\s\\xa0]*kirja|K(?:s(?:ieg[ai]|\\.)?[\\s\\xa0]*Barucha|itab[\\s\\xa0]*Barukh|niha[\\s\\xa0]*Baru(?:ch|k)ova)|Ba(?:r(?:uk)?)?|Proroctvo[\\s\\xa0]*Baruchovo)|(?:Ba(?:ru(?:cha|kh|ch|kin)|arukin)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:\.[\s\xa0]*(?:Ks|Re)|[\s\xa0]*(?:Ks|Re))|I(?:\.[\s\xa0]*K[is]|[\s\xa0]*K[is])))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:\.?[\s\xa0]*Ks|\.?[\s\xa0]*Re)|II\.?[\s\xa0]*Ks))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Ezek", "Ezra"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ez))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hab", "Hag"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ha))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Heb", "Hab"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Hb))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jan))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John", "Jonah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Yn))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John", "Jonah", "Job", "Josh", "Joel"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jo))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jonah", "Joel"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Yoo))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jude", "Judg"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:ud?|d)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Judg"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Bir))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lam"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:La))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt", "Mark", "Mal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ma))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mic"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Mi))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil", "Phlm"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Phl?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Re))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Song"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Songs))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zeph", "Zech"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ze))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }
    ];
    if (include_apocrypha === true && case_sensitive === "none") {
      return books;
    }
    out = [];
    for (k = 0, len = books.length; k < len; k++) {
      book = books[k];
      if (include_apocrypha === false && (book.apocrypha != null) && book.apocrypha === true) {
        continue;
      }
      if (case_sensitive === "books") {
        book.regexp = new RegExp(book.regexp.source, "g");
      }
      out.push(book);
    }
    return out;
  };

  bcv_parser.prototype.regexps.books = bcv_parser.prototype.regexps.get_books(false, "none");
var grammar;
/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */
(function(root) {
  "use strict";

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
          },

          "class": function(expectation) {
            var escapedParts = "",
                i;

            for (i = 0; i < expectation.parts.length; i++) {
              escapedParts += expectation.parts[i] instanceof Array
                ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                : classEscape(expectation.parts[i]);
            }

            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
          },

          any: function(expectation) {
            return "any character";
          },

          end: function(expectation) {
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
      return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g,  '\\"')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function classEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/\]/g, '\\]')
        .replace(/\^/g, '\\^')
        .replace(/-/g,  '\\-')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }

    function describeExpected(expected) {
      var descriptions = new Array(expected.length),
          i, j;

      for (i = 0; i < expected.length; i++) {
        descriptions[i] = describeExpectation(expected[i]);
      }

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
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }

    function describeFound(found) {
      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }

    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };

  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};

    var peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = function(val_1, val_2) { val_2.unshift([val_1]); return {"type": "sequence", "value": val_2, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c1 = "(",
        peg$c2 = peg$literalExpectation("(", false),
        peg$c3 = ")",
        peg$c4 = peg$literalExpectation(")", false),
        peg$c5 = function(val_1, val_2) { if (typeof(val_2) === "undefined") val_2 = []; val_2.unshift([val_1]); return {"type": "sequence_post_enclosed", "value": val_2, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c6 = function(val_1, val_2) { if (val_1.length && val_1.length === 2) val_1 = val_1[0]; // for `b`, which returns [object, undefined]
              return {"type": "range", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c7 = "\x1F",
        peg$c8 = peg$literalExpectation("\x1F", false),
        peg$c9 = "/",
        peg$c10 = peg$literalExpectation("/", false),
        peg$c11 = /^[1-8]/,
        peg$c12 = peg$classExpectation([["1", "8"]], false, false),
        peg$c13 = function(val) { return {"type": "b", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c14 = function(val_1, val_2) { return {"type": "bc", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c15 = ",",
        peg$c16 = peg$literalExpectation(",", false),
        peg$c17 = function(val_1, val_2) { return {"type": "bc_title", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c18 = ".",
        peg$c19 = peg$literalExpectation(".", false),
        peg$c20 = function(val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c21 = "-",
        peg$c22 = peg$literalExpectation("-", false),
        peg$c23 = function(val_1, val_2, val_3, val_4) { return {"type": "range", "value": [{"type": "bcv", "value": [{"type": "bc", "value": [val_1, val_2], "indices": [val_1.indices[0], val_2.indices[1]]}, val_3], "indices": [val_1.indices[0], val_3.indices[1]]}, val_4], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c24 = function(val_1, val_2) { return {"type": "bv", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c25 = function(val_1, val_2) { return {"type": "bc", "value": [val_2, val_1], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c26 = function(val_1, val_2, val_3) { return {"type": "cb_range", "value": [val_3, val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c27 = "th",
        peg$c28 = peg$literalExpectation("th", false),
        peg$c29 = "nd",
        peg$c30 = peg$literalExpectation("nd", false),
        peg$c31 = "st",
        peg$c32 = peg$literalExpectation("st", false),
        peg$c33 = "/1\x1F",
        peg$c34 = peg$literalExpectation("/1\x1F", false),
        peg$c35 = function(val) { return {"type": "c_psalm", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c36 = function(val_1, val_2) { return {"type": "cv_psalm", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c37 = function(val_1, val_2) { return {"type": "c_title", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c38 = function(val_1, val_2) { return {"type": "cv", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c39 = function(val) { return {"type": "c", "value": [val], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c40 = "ff",
        peg$c41 = peg$literalExpectation("ff", false),
        peg$c42 = /^[a-z0-9]/,
        peg$c43 = peg$classExpectation([["a", "z"], ["0", "9"]], false, false),
        peg$c44 = "f",
        peg$c45 = peg$literalExpectation("f", false),
        peg$c46 = /^[a-z]/,
        peg$c47 = peg$classExpectation([["a", "z"]], false, false),
        peg$c48 = function(val_1) { return {"type": "ff", "value": [val_1], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c49 = function(val_1, val_2) { return {"type": "integer_title", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c50 = "/9\x1F",
        peg$c51 = peg$literalExpectation("/9\x1F", false),
        peg$c52 = function(val) { return {"type": "context", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c53 = "/2\x1F",
        peg$c54 = peg$literalExpectation("/2\x1F", false),
        peg$c55 = ".1",
        peg$c56 = peg$literalExpectation(".1", false),
        peg$c57 = /^[0-9]/,
        peg$c58 = peg$classExpectation([["0", "9"]], false, false),
        peg$c59 = function(val) { return {"type": "bc", "value": [val, {"type": "c", "value": [{"type": "integer", "value": 151, "indices": [peg$currPos - 2, peg$currPos - 1]}], "indices": [peg$currPos - 2, peg$currPos - 1]}], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c60 = function(val_1, val_2) { return {"type": "bcv", "value": [val_1, {"type": "v", "value": [val_2], "indices": [val_2.indices[0], val_2.indices[1]]}], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c61 = /^[a-e]/,
        peg$c62 = peg$classExpectation([["a", "e"]], false, false),
        peg$c63 = function(val) { return {"type": "v", "value": [val], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c64 = "ch",
        peg$c65 = peg$literalExpectation("ch", false),
        peg$c66 = "apters",
        peg$c67 = peg$literalExpectation("apters", false),
        peg$c68 = "apter",
        peg$c69 = peg$literalExpectation("apter", false),
        peg$c70 = "apts",
        peg$c71 = peg$literalExpectation("apts", false),
        peg$c72 = "pts",
        peg$c73 = peg$literalExpectation("pts", false),
        peg$c74 = "apt",
        peg$c75 = peg$literalExpectation("apt", false),
        peg$c76 = "aps",
        peg$c77 = peg$literalExpectation("aps", false),
        peg$c78 = "ap",
        peg$c79 = peg$literalExpectation("ap", false),
        peg$c80 = "p",
        peg$c81 = peg$literalExpectation("p", false),
        peg$c82 = "s",
        peg$c83 = peg$literalExpectation("s", false),
        peg$c84 = "a",
        peg$c85 = peg$literalExpectation("a", false),
        peg$c86 = function() { return {"type": "c_explicit"} },
        peg$c87 = "v",
        peg$c88 = peg$literalExpectation("v", false),
        peg$c89 = "erses",
        peg$c90 = peg$literalExpectation("erses", false),
        peg$c91 = "erse",
        peg$c92 = peg$literalExpectation("erse", false),
        peg$c93 = "er",
        peg$c94 = peg$literalExpectation("er", false),
        peg$c95 = "ss",
        peg$c96 = peg$literalExpectation("ss", false),
        peg$c97 = function() { return {"type": "v_explicit"} },
        peg$c98 = ":",
        peg$c99 = peg$literalExpectation(":", false),
        peg$c100 = /^["']/,
        peg$c101 = peg$classExpectation(["\"", "'"], false, false),
        peg$c102 = /^[,;\/:&\-\u2013\u2014~]/,
        peg$c103 = peg$classExpectation([",", ";", "/", ":", "&", "-", "\u2013", "\u2014", "~"], false, false),
        peg$c104 = "and",
        peg$c105 = peg$literalExpectation("and", false),
        peg$c106 = "compare",
        peg$c107 = peg$literalExpectation("compare", false),
        peg$c108 = "cf",
        peg$c109 = peg$literalExpectation("cf", false),
        peg$c110 = "see",
        peg$c111 = peg$literalExpectation("see", false),
        peg$c112 = "also",
        peg$c113 = peg$literalExpectation("also", false),
        peg$c114 = function() { return "" },
        peg$c115 = /^[\-\u2013\u2014]/,
        peg$c116 = peg$classExpectation(["-", "\u2013", "\u2014"], false, false),
        peg$c117 = "through",
        peg$c118 = peg$literalExpectation("through", false),
        peg$c119 = "thru",
        peg$c120 = peg$literalExpectation("thru", false),
        peg$c121 = "to",
        peg$c122 = peg$literalExpectation("to", false),
        peg$c123 = "title",
        peg$c124 = peg$literalExpectation("title", false),
        peg$c125 = function(val) { return {type:"title", value: [val], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c126 = "from",
        peg$c127 = peg$literalExpectation("from", false),
        peg$c128 = "of",
        peg$c129 = peg$literalExpectation("of", false),
        peg$c130 = "in",
        peg$c131 = peg$literalExpectation("in", false),
        peg$c132 = "the",
        peg$c133 = peg$literalExpectation("the", false),
        peg$c134 = "book",
        peg$c135 = peg$literalExpectation("book", false),
        peg$c136 = /^[([]/,
        peg$c137 = peg$classExpectation(["(", "["], false, false),
        peg$c138 = /^[)\]]/,
        peg$c139 = peg$classExpectation([")", "]"], false, false),
        peg$c140 = function(val) { return {"type": "translation_sequence", "value": val, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c141 = "\x1E",
        peg$c142 = peg$literalExpectation("\x1E", false),
        peg$c143 = function(val) { return {"type": "translation", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c144 = ",000",
        peg$c145 = peg$literalExpectation(",000", false),
        peg$c146 = function(val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c147 = /^[^\x1F\x1E([]/,
        peg$c148 = peg$classExpectation(["\x1F", "\x1E", "(", "["], true, false),
        peg$c149 = function(val) { return {"type": "word", "value": val.join(""), "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c150 = function(val) { return {"type": "stop", "value": val, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c151 = /^[\s\xa0*]/,
        peg$c152 = peg$classExpectation([" ", "\t", "\r", "\n", "\xA0", "*"], false, false),

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1 }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    if ("punctuation_strategy" in options && options.punctuation_strategy === "eu") {
        peg$parsecv_sep = peg$parseeu_cv_sep;
        peg$c102 = /^[;\/:&\-\u2013\u2014~]/;
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location
      );
    }

    function error(message, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

      throw peg$buildSimpleError(message, location);
    }

    function peg$literalExpectation(text, ignoreCase) {
      return { type: "literal", text: text, ignoreCase: ignoreCase };
    }

    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
    }

    function peg$anyExpectation() {
      return { type: "any" };
    }

    function peg$endExpectation() {
      return { type: "end" };
    }

    function peg$otherExpectation(description) {
      return { type: "other", description: description };
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos], p;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
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

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildSimpleError(message, location) {
      return new peg$SyntaxError(message, null, null, location);
    }

    function peg$buildStructuredError(expected, found, location) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected, found),
        expected,
        found,
        location
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
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesequence_post();
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
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parsesequence_sep();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesequence_post();
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
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s1, s2);
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

    function peg$parsesequence_post_enclosed() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c1;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsesp();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesequence_sep();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsesequence_post();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$currPos;
              s7 = peg$parsesequence_sep();
              if (s7 === peg$FAILED) {
                s7 = null;
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsesequence_post();
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
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsesequence_post();
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
              if (s5 !== peg$FAILED) {
                s6 = peg$parsesp();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c3;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c4); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c5(s4, s5);
                    s0 = s1;
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
            s1 = peg$c6(s1, s3);
            s0 = s1;
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
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 47) {
            s4 = peg$c9;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c10); }
          }
          if (s4 !== peg$FAILED) {
            if (peg$c11.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c12); }
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
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 31) {
              s4 = peg$c7;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c13(s2);
              s0 = s1;
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
            s1 = peg$c14(s1, s3);
            s0 = s1;
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
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c15;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c16); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsesp();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsec();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s1, s5);
                s0 = s1;
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
          s1 = peg$c17(s1, s2);
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
          s4 = peg$c18;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
          if (s4 !== peg$FAILED) {
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
          if (s4 !== peg$FAILED) {
            s5 = peg$parsev_explicit();
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
            s3 = peg$parsecv_sep();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsev_letter();
            if (s4 === peg$FAILED) {
              s4 = peg$parsev();
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c20(s1, s4);
              s0 = s1;
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
              s1 = peg$c20(s1, s3);
              s0 = s1;
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
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c15;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c16); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsesp();
            if (s4 !== peg$FAILED) {
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
                  s1 = peg$c20(s1, s5);
                  s0 = s1;
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

    function peg$parsebcv_hyphen_range() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseb();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s2 = peg$c21;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c22); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$parsespace();
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsec();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s4 = peg$c21;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c22); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsev();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 45) {
                  s6 = peg$c21;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c22); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsev();
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c23(s1, s3, s5, s7);
                    s0 = s1;
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
            s1 = peg$c24(s1, s3);
            s0 = s1;
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
          if (s3 !== peg$FAILED) {
            s4 = peg$parseb();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c25(s2, s4);
              s0 = s1;
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
              if (s5 !== peg$FAILED) {
                s6 = peg$parseb();
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c26(s2, s4, s6);
                  s0 = s1;
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

    function peg$parsecbv() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsecb();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsesequence_sep();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsev_explicit();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsev();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c20(s1, s4);
              s0 = s1;
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

    function peg$parsecb_ordinal() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsec();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c27) {
          s2 = peg$c27;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c29) {
            s2 = peg$c29;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c31) {
              s2 = peg$c31;
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c32); }
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
            if (s4 !== peg$FAILED) {
              s5 = peg$parseb();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c25(s1, s5);
                s0 = s1;
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

    function peg$parsecbv_ordinal() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsecb_ordinal();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsesequence_sep();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsev_explicit();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsev();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c20(s1, s4);
              s0 = s1;
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

    function peg$parsec_psalm() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 31) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c33) {
            s3 = peg$c33;
            peg$currPos += 3;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c34); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c35(s2);
            s0 = s1;
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
        if (s2 !== peg$FAILED) {
          s3 = peg$parsev_explicit();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsev();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c36(s1, s4);
              s0 = s1;
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
            s1 = peg$c37(s2, s3);
            s0 = s1;
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
      if (s1 !== peg$FAILED) {
        s2 = peg$parsec();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          s4 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 46) {
            s5 = peg$c18;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
            if (s5 !== peg$FAILED) {
              s6 = peg$parsev_explicit();
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
                s1 = peg$c38(s2, s5);
                s0 = s1;
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
              s1 = peg$c38(s1, s3);
              s0 = s1;
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
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c39(s2);
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
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c40) {
            s4 = peg$c40;
            peg$currPos += 2;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            if (peg$c42.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c43); }
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
              s4 = peg$c44;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c45); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              peg$silentFails++;
              if (peg$c42.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
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
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              peg$silentFails++;
              if (peg$c46.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c47); }
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
                s1 = peg$c48(s1);
                s0 = s1;
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

    function peg$parseinteger_title() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetitle();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c49(s1, s2);
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

    function peg$parsecontext() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 31) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c50) {
            s3 = peg$c50;
            peg$currPos += 3;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c51); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c52(s2);
            s0 = s1;
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
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c53) {
            s3 = peg$c53;
            peg$currPos += 3;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c54); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c13(s2);
            s0 = s1;
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
        if (input.substr(peg$currPos, 2) === peg$c55) {
          s2 = peg$c55;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c56); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          if (peg$c57.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c58); }
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
            s1 = peg$c59(s1);
            s0 = s1;
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
          s2 = peg$c18;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseinteger();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c60(s1, s3);
            s0 = s1;
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
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c40) {
              s6 = peg$c40;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c41); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$currPos;
              peg$silentFails++;
              if (peg$c42.test(input.charAt(peg$currPos))) {
                s8 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s8 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
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
                s6 = peg$c44;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c45); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$currPos;
                peg$silentFails++;
                if (peg$c42.test(input.charAt(peg$currPos))) {
                  s8 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c43); }
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
              if (peg$c61.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                peg$silentFails++;
                if (peg$c46.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c47); }
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
                  s1 = peg$c63(s2);
                  s0 = s1;
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

    function peg$parsev() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsev_explicit();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c63(s2);
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

    function peg$parsec_explicit() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c64) {
          s3 = peg$c64;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 6) === peg$c66) {
            s4 = peg$c66;
            peg$currPos += 6;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c67); }
          }
          if (s4 === peg$FAILED) {
            if (input.substr(peg$currPos, 5) === peg$c68) {
              s4 = peg$c68;
              peg$currPos += 5;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c69); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 4) === peg$c70) {
                s5 = peg$c70;
                peg$currPos += 4;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c71); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseabbrev();
                if (s6 === peg$FAILED) {
                  s6 = null;
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
              if (s4 === peg$FAILED) {
                s4 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c72) {
                  s5 = peg$c72;
                  peg$currPos += 3;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c73); }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseabbrev();
                  if (s6 === peg$FAILED) {
                    s6 = null;
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
                if (s4 === peg$FAILED) {
                  s4 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c74) {
                    s5 = peg$c74;
                    peg$currPos += 3;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c75); }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseabbrev();
                    if (s6 === peg$FAILED) {
                      s6 = null;
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
                  if (s4 === peg$FAILED) {
                    s4 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c76) {
                      s5 = peg$c76;
                      peg$currPos += 3;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c77); }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseabbrev();
                      if (s6 === peg$FAILED) {
                        s6 = null;
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
                    if (s4 === peg$FAILED) {
                      s4 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c78) {
                        s5 = peg$c78;
                        peg$currPos += 2;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c79); }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parseabbrev();
                        if (s6 === peg$FAILED) {
                          s6 = null;
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
                      if (s4 === peg$FAILED) {
                        s4 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 112) {
                          s5 = peg$c80;
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c81); }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parseabbrev();
                          if (s6 === peg$FAILED) {
                            s6 = null;
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
                        if (s4 === peg$FAILED) {
                          s4 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 115) {
                            s5 = peg$c82;
                            peg$currPos++;
                          } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c83); }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parseabbrev();
                            if (s6 === peg$FAILED) {
                              s6 = null;
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
                          if (s4 === peg$FAILED) {
                            s4 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 97) {
                              s5 = peg$c84;
                              peg$currPos++;
                            } else {
                              s5 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c85); }
                            }
                            if (s5 !== peg$FAILED) {
                              s6 = peg$parseabbrev();
                              if (s6 === peg$FAILED) {
                                s6 = null;
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
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c86();
            s0 = s1;
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

    function peg$parsev_explicit() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 118) {
          s3 = peg$c87;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c88); }
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 5) === peg$c89) {
            s4 = peg$c89;
            peg$currPos += 5;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c90); }
          }
          if (s4 === peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c91) {
              s4 = peg$c91;
              peg$currPos += 4;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c92); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c93) {
                s5 = peg$c93;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c94); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseabbrev();
                if (s6 === peg$FAILED) {
                  s6 = null;
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
              if (s4 === peg$FAILED) {
                s4 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c95) {
                  s5 = peg$c95;
                  peg$currPos += 2;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c96); }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseabbrev();
                  if (s6 === peg$FAILED) {
                    s6 = null;
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
                if (s4 === peg$FAILED) {
                  s4 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 115) {
                    s5 = peg$c82;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c83); }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseabbrev();
                    if (s6 === peg$FAILED) {
                      s6 = null;
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
                  if (s4 === peg$FAILED) {
                    s4 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 118) {
                      s5 = peg$c87;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c88); }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseabbrev();
                      if (s6 === peg$FAILED) {
                        s6 = null;
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
          if (peg$c46.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
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
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c97();
              s0 = s1;
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

    function peg$parsecv_sep() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 58) {
          s3 = peg$c98;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c99); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (input.charCodeAt(peg$currPos) === 58) {
              s3 = peg$c98;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c99); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 46) {
            s3 = peg$c18;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c19); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$currPos;
            s6 = peg$parsesp();
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s7 = peg$c18;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c19); }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsesp();
                if (s8 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s9 = peg$c18;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
      if (s1 !== peg$FAILED) {
        if (peg$c100.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c101); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
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
      if (peg$c102.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c103); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c18;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$currPos;
          s6 = peg$parsesp();
          if (s6 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s7 = peg$c18;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c19); }
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$parsesp();
              if (s8 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s9 = peg$c18;
                  peg$currPos++;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
          if (input.substr(peg$currPos, 3) === peg$c104) {
            s2 = peg$c104;
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c105); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 7) === peg$c106) {
              s2 = peg$c106;
              peg$currPos += 7;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c107); }
            }
            if (s2 === peg$FAILED) {
              s2 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c108) {
                s3 = peg$c108;
                peg$currPos += 2;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c109); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parseabbrev();
                if (s4 === peg$FAILED) {
                  s4 = null;
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
                s2 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c110) {
                  s3 = peg$c110;
                  peg$currPos += 3;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c111); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsespace();
                  if (s4 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c112) {
                      s5 = peg$c112;
                      peg$currPos += 4;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c113); }
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
                  if (input.substr(peg$currPos, 4) === peg$c112) {
                    s2 = peg$c112;
                    peg$currPos += 4;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c113); }
                  }
                  if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c110) {
                      s2 = peg$c110;
                      peg$currPos += 3;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c111); }
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
          if (peg$c102.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c103); }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s3 = peg$c18;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c19); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$currPos;
              s6 = peg$parsesp();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s7 = peg$c18;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c19); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsesp();
                  if (s8 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 46) {
                      s9 = peg$c18;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
              if (input.substr(peg$currPos, 3) === peg$c104) {
                s2 = peg$c104;
                peg$currPos += 3;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c105); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 7) === peg$c106) {
                  s2 = peg$c106;
                  peg$currPos += 7;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c107); }
                }
                if (s2 === peg$FAILED) {
                  s2 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c108) {
                    s3 = peg$c108;
                    peg$currPos += 2;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c109); }
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parseabbrev();
                    if (s4 === peg$FAILED) {
                      s4 = null;
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
                    s2 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c110) {
                      s3 = peg$c110;
                      peg$currPos += 3;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c111); }
                    }
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsespace();
                      if (s4 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c112) {
                          s5 = peg$c112;
                          peg$currPos += 4;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c113); }
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
                      if (input.substr(peg$currPos, 4) === peg$c112) {
                        s2 = peg$c112;
                        peg$currPos += 4;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c113); }
                      }
                      if (s2 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c110) {
                          s2 = peg$c110;
                          peg$currPos += 3;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c111); }
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
        s1 = peg$c114();
      }
      s0 = s1;

      return s0;
    }

    function peg$parserange_sep() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (peg$c115.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c116); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesp();
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
          if (input.substr(peg$currPos, 7) === peg$c117) {
            s4 = peg$c117;
            peg$currPos += 7;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c118); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsesp();
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
            if (input.substr(peg$currPos, 4) === peg$c119) {
              s4 = peg$c119;
              peg$currPos += 4;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c120); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesp();
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
              if (input.substr(peg$currPos, 2) === peg$c121) {
                s4 = peg$c121;
                peg$currPos += 2;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c122); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsesp();
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
          }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            if (peg$c115.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c116); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesp();
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
              if (input.substr(peg$currPos, 7) === peg$c117) {
                s4 = peg$c117;
                peg$currPos += 7;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c118); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsesp();
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
                if (input.substr(peg$currPos, 4) === peg$c119) {
                  s4 = peg$c119;
                  peg$currPos += 4;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c120); }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsesp();
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
                  if (input.substr(peg$currPos, 2) === peg$c121) {
                    s4 = peg$c121;
                    peg$currPos += 2;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c122); }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsesp();
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
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c123) {
          s2 = peg$c123;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c124); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c125(s2);
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

    function peg$parsein_book_of() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c126) {
          s2 = peg$c126;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c128) {
            s2 = peg$c128;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c129); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c130) {
              s2 = peg$c130;
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c131); }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c132) {
              s5 = peg$c132;
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c133); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsesp();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c134) {
                  s7 = peg$c134;
                  peg$currPos += 4;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c135); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsesp();
                  if (s8 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c128) {
                      s9 = peg$c128;
                      peg$currPos += 2;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c129); }
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsesp();
                      if (s10 !== peg$FAILED) {
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
            if (s4 !== peg$FAILED) {
              s1 = [s1, s2, s3, s4];
              s0 = s1;
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

    function peg$parseabbrev() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s2 = peg$c18;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          s4 = peg$currPos;
          s5 = peg$parsesp();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s6 = peg$c18;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c19); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parsesp();
              if (s7 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s8 = peg$c18;
                  peg$currPos++;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s2 = peg$c15;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c16); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
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
      if (s1 !== peg$FAILED) {
        if (peg$c136.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c137); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
          if (s3 !== peg$FAILED) {
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
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesp();
              if (s5 !== peg$FAILED) {
                if (peg$c138.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c139); }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c140(s4);
                  s0 = s1;
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

    function peg$parsetranslation_sequence() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s3 = peg$c15;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c16); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsesp();
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
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
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
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c140(s3);
            s0 = s1;
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

    function peg$parsetranslation() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 30) {
        s1 = peg$c141;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c142); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 30) {
            s3 = peg$c141;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c142); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c143(s2);
            s0 = s1;
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
      if (res = /^[0-9]{1,3}(?!\d|,000)/.exec(input.substr(peg$currPos))) {
      	peg$savedPos = peg$currPos;
        peg$currPos += res[0].length;
        return {"type": "integer", "value": parseInt(res[0], 10), "indices": [peg$savedPos, peg$currPos - 1]}
      } else {
        return peg$FAILED;
      }
    }

    function peg$parseany_integer() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c57.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c57.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c58); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c146(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseword() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c147.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c148); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c147.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c148); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c149(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseword_parenthesis() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c136.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c137); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c150(s1);
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
      if (res = /^[\s\xa0*]+/.exec(input.substr(peg$currPos))) {
        peg$currPos += res[0].length;
        return [];
      }
      return peg$FAILED;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }

      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  grammar = {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})(this);


}).call(this);

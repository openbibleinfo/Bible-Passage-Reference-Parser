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

  bcv_parser.prototype.regexps.translations = /(?:(?:NEG1979|BDS|LSG(?:21)?))\b/gi;

  bcv_parser.prototype.translations = {
    aliases: {
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

  bcv_parser.prototype.languages = ["fr"];

  bcv_parser.prototype.regexps.space = "[\\s\\xa0]";

  bcv_parser.prototype.regexps.escaped_passage = RegExp("(?:^|[^\\x1f\\x1e\\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:[\\u2013\\u2014\\-]|through|thru|to)\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:\\d+(?:th|nd|st)\\s*ch(?:apter|a?pt\\.?|a?p?\\.?)?\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*))?\\x1f(\\d+)(?:/\\d+)?\\x1f(?:/\\d+\\x1f|[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014]|titre(?![a-z])|et(?!" + bcv_parser.prototype.regexps.space + "+suivant)|et" + bcv_parser.prototype.regexps.space + "+suivant|chapitres|chapitre|comparer|versets|verset|chap|vers|chs|ver|ch|vv|á|v|[a-e](?!\\w)|$)+)", "gi");

  bcv_parser.prototype.regexps.match_end_split = RegExp("\\d\\W*titre|\\d\\W*et" + bcv_parser.prototype.regexps.space + "+suivant(?:[\\s\\xa0*]*\\.)?|\\d[\\s\\xa0*]*[a-e](?!\\w)|\\x1e(?:[\\s\\xa0*]*[)\\]\\uff09])?|[\\d\\x1f]", "gi");

  bcv_parser.prototype.regexps.control = /[\x1e\x1f]/g;

  bcv_parser.prototype.regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]";

  bcv_parser.prototype.regexps.first = "(?:Premi[èe]res?|Premiers?|1[èe]?re|1er|1|I)\\.?" + bcv_parser.prototype.regexps.space + "*";

  bcv_parser.prototype.regexps.second = "(?:Deuxi[èe]mes?|2[èe]me|2d?e?|II)\\.?" + bcv_parser.prototype.regexps.space + "*";

  bcv_parser.prototype.regexps.third = "(?:Troisi[èe]mes?|3[èe]me|3e?|III)\\.?" + bcv_parser.prototype.regexps.space + "*";

  bcv_parser.prototype.regexps.range_and = "(?:[&\u2013\u2014-]|(?:et(?!" + bcv_parser.prototype.regexps.space + "+suivant)|comparer)|á)";

  bcv_parser.prototype.regexps.range_only = "(?:[\u2013\u2014-]|á)";

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
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:G(?:e(?:n(?:[e\\xE8]se)?)?|n)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Exod"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ex(?:o(?:de?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Bel"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Bel(?:[\\s\\xa0]*et[\\s\\xa0]*le[\\s\\xa0]*(?:[Ss]erpent|[Dd]ragon))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:L(?:[e\\xE9](?:v(?:itique)?)?|v)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Num"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:N(?:o(?:m(?:b(?:res)?)?)?|[bm]|um)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Sir"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:Eccl[e\\xE9]siastiqu|Siracid)e|Sir?|Sagesse[\\s\\xa0]*de[\\s\\xa0]*Ben[\\s\\xa0]*Sira|La[\\s\\xa0]*Sagesse[\\s\\xa0]*de[\\s\\xa0]*Ben[\\s\\xa0]*Sira))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Wis"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:S(?:agesse(?:[\\s\\xa0]*de[\\s\\xa0]*Salomon)?|g)|Wis))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lam"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:L(?:a(?:m(?:entations(?:[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9]mie)?)?)?|m)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["EpJer"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ep(?:(?:\\.[\\s\\xa0]*J[e\\xE9]r[e\\xE9]|[\\s\\xa0]*J[e\\xE9]r[e\\xE9])mie|(?:\\.[\\s\\xa0]*J[e\\xE9]|[\\s\\xa0]*J[e\\xE9]|Je)r|[i\\xEE]tre[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9]mie)|\\xC9p(?:(?:\\.[\\s\\xa0]*J[e\\xE9]r[e\\xE9]|[\\s\\xa0]*J[e\\xE9]r[e\\xE9])mie|(?:\\.[\\s\\xa0]*J[e\\xE9]|[\\s\\xa0]*J[e\\xE9])r|[i\\xEE]tre[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9]mie)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ap(?:o(?:c(?:alypse(?:[\\s\\xa0]*de[\\s\\xa0]*Jean)?)?)?|c)?|Rev))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrMan"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Pr(?:\\.?[\\s\\xa0]*Manass[e\\xE9]|(?:\\.?[\\s\\xa0]*)?Man|i[e\\xE8]re[\\s\\xa0]*de[\\s\\xa0]*Manass[e\\xE9])|La[\\s\\xa0]*Pri[e\\xE8]re[\\s\\xa0]*de[\\s\\xa0]*Manass[e\\xE9]))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Deut"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:D(?:eu(?:t(?:[e\\xE9]ronome)?)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Josh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jos(?:u[e\\xE9]|h)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Judg"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:u(?:g(?:es)?|dg)|g)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ruth"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:R(?:u(?:th?)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1[\s\xa0]*Esdras)|(?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Esdras|1(?:[\s\xa0]*Esdr|Esd|[\s\xa0]*Esd?)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Esdras|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Esdras))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Esdras)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Esdras|2(?:[\s\xa0]*Esdr|Esd|[\s\xa0]*Esd?)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Esdras|Deuxi[e\xE8]mes?[\s\xa0]*Esdras))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Isa"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:[EI\\xC9]s(?:a(?:[i\\xEF]e)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Samuel)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Samuel|2(?:[\s\xa0]*?Sam|[\s\xa0]*Sa?)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Samuel|Deuxi[e\xE8]mes?[\s\xa0]*Samuel))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1[\s\xa0]*Samuel)|(?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Samuel|1(?:[\s\xa0]*?Sam|[\s\xa0]*Sa?)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Samuel|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Samuel))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Rois)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Rois|2(?:Kgs|[\s\xa0]*R)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Rois|Deuxi[e\xE8]mes?[\s\xa0]*Rois))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1(?:re\.)?[\s\xa0]*Rois)|(?:1re[\s\xa0]*Rois)|(?:(?:1(?:\xE8re|ere?)|I)[\s\xa0]*Rois|1(?:Kgs|[\s\xa0]*R)|(?:1(?:\xE8re|ere?)?|I)\.[\s\xa0]*Rois|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Rois))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Chroniques)|(?:2[\s\xa0]*Chron)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Chroniques|2(?:[\s\xa0]*Chro|Chr|[\s\xa0]*Chr?)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Chroniques|Deuxi[e\xE8]mes?[\s\xa0]*Chroniques))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1[\s\xa0]*Chroniques)|(?:1[\s\xa0]*Chron)|(?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Chroniques|1(?:[\s\xa0]*Chro|Chr|[\s\xa0]*Chr?)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Chroniques|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Chroniques))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Ezra"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:E(?:sd(?:r(?:as)?)?|zra)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Neh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:N[e\\xE9](?:h(?:[e\\xE9]mie)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["GkEsth"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Esth(?:er[\\s\\xa0]*(?:[Gg]rec|[Gg]r|\\([Gg]rec\\))|[\\s\\xa0]*[Gg]r)|GkEsth))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Esth"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Est(?:h(?:er)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Job"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jo?b))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ps"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ps(?:a(?:u(?:mes?)?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrAzar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Pr(?:i[e\\xE8]re[\\s\\xa0]*d['’]Azaria[hs]|(?:\\.[\\s\\xa0]*|[\\s\\xa0]*)?Azar)|La[\\s\\xa0]*Pri[e\\xE8]re[\\s\\xa0]*d['’]Azaria[hs]))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Prov"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Pr(?:o(?:v(?:erbes)?)?|v)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eccl"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ec(?:cl(?:[e\\xE9]s(?:iaste)?)?)?|Qoheleth?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["SgThree"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:C(?:antique[\s\xa0]*des[\s\xa0]*(?:Trois|3)[\s\xa0]*Enfants|t[\s\xa0]*3[\s\xa0]*E)|SgThree))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Song"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:C(?:a(?:ntique(?:[\\s\\xa0]*des[\\s\\xa0]*[Cc]antiques|s)?)?|n?t)|Song))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jer"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:[e\\xE9](?:r(?:[e\\xE9]m(?:ie)?)?)?|r)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ezek"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ez(?:e(?:ch(?:iel)?|k)?|\\xE9ch(?:iel)?|\\xE9)?|\\xC9z[e\\xE9]ch(?:iel)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Dan"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:D(?:a(?:n(?:iel)?)?|n)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hos"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Os(?:[e\\xE9]e)?|Hos))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Joel"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:o[e\\xEB]l?|l)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Amos"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Am(?:os?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Obad"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ab(?:d(?:ias)?)?|Obad))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jonah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jon(?:a[hs])?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mic"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Mi(?:c(?:h(?:[e\\xE9]e)?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Nah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Na(?:h(?:oum|um)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hab"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ha(?:b(?:a(?:kuk|quq|k|c(?:uc)?))?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zeph"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:So(?:ph(?:onie)?)?|Zeph))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hag"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ag(?:g(?:[e\\xE9]e)?)?|Hag))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zech"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Z(?:a(?:c(?:c(?:h(?:arie)?)?|h(?:arie)?)?|h)?|ech|c)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:M(?:al(?:ac(?:h(?:ie)?)?|ch|c)?|l)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:M(?:at(?:t(?:h(?:ieu)?)?)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mark"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:M(?:ar[ck]?|[cr])))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Luke"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:L(?:u(?:ke|c)?|c)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Jea|1(?:Joh|[\s\xa0]*J|[\s\xa0]*Jea)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Jea|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Jea)n))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Jea|2(?:Joh|[\s\xa0]*J|[\s\xa0]*Jea)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Jea|Deuxi[e\xE8]mes?[\s\xa0]*Jea)n))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:(?:3(?:e(?:me)?|\xE8me)|III)[\s\xa0]*Jea|3(?:Joh|[\s\xa0]*J|[\s\xa0]*Jea)|(?:3(?:e(?:me)?|\xE8me)?|III)\.[\s\xa0]*Jea|Troisi[e\xE8]mes?[\s\xa0]*Jea)n))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["John"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:ea|oh)?n))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Acts"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ac(?:t(?:es(?:[\\s\\xa0]*des[\\s\\xa0]*Ap[o\\xF4]tres)?|s)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rom"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:R(?:o(?:m(?:ains)?)?|m)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Corinthiens|2(?:[\s\xa0]*Corinthiens|[\s\xa0]*Cor?|Cor)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Corinthiens|Deuxi[e\xE8]mes?[\s\xa0]*Corinthiens))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Corinthiens|1(?:[\s\xa0]*Corinthiens|[\s\xa0]*Cor?|Cor)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Corinthiens|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Corinthiens))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Gal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:G(?:a(?:l(?:ates)?)?|l)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eph"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:[E\\xC9]p(?:h(?:[e\\xE9](?:s(?:iens)?)?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ph(?:il(?:ippiens)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Col"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Col(?:ossiens)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Thess?aloniciens)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Thess?aloniciens|2(?:[\s\xa0]*Th(?:ess|es)?|Thess)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Thess?aloniciens|Deuxi[e\xE8]me(?:s[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloniciens))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1[\s\xa0]*Thess?aloniciens)|(?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Thess?aloniciens|1(?:[\s\xa0]*Th(?:ess|es)?|Thess)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Thess?aloniciens|Premi(?:er(?:e(?:s[\s\xa0]*Thess?|[\s\xa0]*Thess?)|s[\s\xa0]*Thess?|[\s\xa0]*Thess?)|\xE8re(?:s[\s\xa0]*Thess?|[\s\xa0]*Thess?))aloniciens))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Timoth[e\xE9]e)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Timoth[e\xE9]e|2(?:(?:[\s\xa0]*Ti?|Ti)m|[\s\xa0]*Ti)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Timoth[e\xE9]e|Deuxi[e\xE8]me(?:s[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])e))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1[\s\xa0]*Timoth[e\xE9]e)|(?:Premi(?:er(?:e(?:s[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|s[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|\xE8re(?:s[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9]))e|(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Timoth[e\xE9]e|1(?:(?:[\s\xa0]*Ti?|Ti)m|[\s\xa0]*Ti)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Timoth[e\xE9]e))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Titus"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:T(?:it(?:us|e)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phlm"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ph(?:il[e\\xE9]mon|l?m)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Heb"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:H[e\\xE9](?:b(?:r(?:eux)?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jas"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:a(?:c(?:q(?:ues)?)?|ques|s)?|c)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2(?:[\s\xa0]*Pierre|Pet))|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Pierre|2[\s\xa0]*Pi?|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Pierre|Deuxi[e\xE8]mes?[\s\xa0]*Pierre))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1(?:[\s\xa0]*Pierre|Pet))|(?:(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Pierre|1[\s\xa0]*Pi?|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Pierre|Premi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Pierre))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Jude"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:ude?|d)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Tob"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:T(?:ob(?:ie)?|b)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jdt"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:J(?:udith|dt)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Bar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ba(?:r(?:uch)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Sus"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Su[sz](?:anne(?:[\\s\\xa0]*(?:et[\\s\\xa0]*les[\\s\\xa0]*(?:deux[\\s\\xa0]*)?vieillards|au[\\s\\xa0]*bain))?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2[\s\xa0]*Maccab[e\xE9]es)|(?:(?:2(?:\xE8me|de?|e(?:me)?)|II)[\s\xa0]*Maccab[e\xE9]es|2(?:[\s\xa0]*?Macc|[\s\xa0]*M)|(?:2(?:\xE8me|de|d|e(?:me)?)?|II)\.[\s\xa0]*Maccab[e\xE9]es|Deuxi[e\xE8]me(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])es))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:3[\s\xa0]*Maccab[e\xE9]es)|(?:(?:3(?:e(?:me)?|\xE8me)|III)[\s\xa0]*Maccab[e\xE9]es|3(?:[\s\xa0]*?Macc|[\s\xa0]*M)|(?:3(?:e(?:me)?|\xE8me)?|III)\.[\s\xa0]*Maccab[e\xE9]es|Troisi[e\xE8]me(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])es))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["4Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:4[\s\xa0]*Maccab[e\xE9]es)|(?:(?:4(?:e(?:me)?|\xE8me)|IV)[\s\xa0]*Maccab[e\xE9]es|4(?:[\s\xa0]*?Macc|[\s\xa0]*M)|(?:4(?:e(?:me)?|\xE8me)?|IV)\.[\s\xa0]*Maccab[e\xE9]es|Quatri[e\xE8]me(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])es))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1[\s\xa0]*Maccab[e\xE9]es)|(?:Premi(?:er(?:e(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])|s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])|\xE8re(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9]))es|(?:1(?:\xE8?re|ere?)|I)[\s\xa0]*Maccab[e\xE9]es|1(?:[\s\xa0]*?Macc|[\s\xa0]*M)|(?:1(?:\xE8?re|ere?)?|I)\.[\s\xa0]*Maccab[e\xE9]es))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Jonah", "Job", "Josh", "Joel"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jo))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Judg", "Jude"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ju))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil", "Phlm"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Phl?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
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
        peg$c40 = "et",
        peg$c41 = peg$literalExpectation("et", false),
        peg$c42 = "suivant",
        peg$c43 = peg$literalExpectation("suivant", false),
        peg$c44 = /^[a-z]/,
        peg$c45 = peg$classExpectation([["a", "z"]], false, false),
        peg$c46 = function(val_1) { return {"type": "ff", "value": [val_1], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c47 = function(val_1, val_2) { return {"type": "integer_title", "value": [val_1, val_2], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c48 = "/9\x1F",
        peg$c49 = peg$literalExpectation("/9\x1F", false),
        peg$c50 = function(val) { return {"type": "context", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c51 = "/2\x1F",
        peg$c52 = peg$literalExpectation("/2\x1F", false),
        peg$c53 = ".1",
        peg$c54 = peg$literalExpectation(".1", false),
        peg$c55 = /^[0-9]/,
        peg$c56 = peg$classExpectation([["0", "9"]], false, false),
        peg$c57 = function(val) { return {"type": "bc", "value": [val, {"type": "c", "value": [{"type": "integer", "value": 151, "indices": [peg$currPos - 2, peg$currPos - 1]}], "indices": [peg$currPos - 2, peg$currPos - 1]}], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c58 = function(val_1, val_2) { return {"type": "bcv", "value": [val_1, {"type": "v", "value": [val_2], "indices": [val_2.indices[0], val_2.indices[1]]}], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c59 = /^[a-e]/,
        peg$c60 = peg$classExpectation([["a", "e"]], false, false),
        peg$c61 = function(val) { return {"type": "v", "value": [val], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c62 = "ch",
        peg$c63 = peg$literalExpectation("ch", false),
        peg$c64 = "apitres",
        peg$c65 = peg$literalExpectation("apitres", false),
        peg$c66 = "apitre",
        peg$c67 = peg$literalExpectation("apitre", false),
        peg$c68 = "ap",
        peg$c69 = peg$literalExpectation("ap", false),
        peg$c70 = "s",
        peg$c71 = peg$literalExpectation("s", false),
        peg$c72 = function() { return {"type": "c_explicit"} },
        peg$c73 = "v",
        peg$c74 = peg$literalExpectation("v", false),
        peg$c75 = "ersets",
        peg$c76 = peg$literalExpectation("ersets", false),
        peg$c77 = "erset",
        peg$c78 = peg$literalExpectation("erset", false),
        peg$c79 = "ers",
        peg$c80 = peg$literalExpectation("ers", false),
        peg$c81 = "er",
        peg$c82 = peg$literalExpectation("er", false),
        peg$c83 = function() { return {"type": "v_explicit"} },
        peg$c84 = ":",
        peg$c85 = peg$literalExpectation(":", false),
        peg$c86 = /^["']/,
        peg$c87 = peg$classExpectation(["\"", "'"], false, false),
        peg$c88 = /^[,;\/:&\-\u2013\u2014~]/,
        peg$c89 = peg$classExpectation([",", ";", "/", ":", "&", "-", "\u2013", "\u2014", "~"], false, false),
        peg$c90 = "comparer",
        peg$c91 = peg$literalExpectation("comparer", false),
        peg$c92 = function() { return "" },
        peg$c93 = /^[\-\u2013\u2014]/,
        peg$c94 = peg$classExpectation(["-", "\u2013", "\u2014"], false, false),
        peg$c95 = "\xE1",
        peg$c96 = peg$literalExpectation("\xE1", true),
        peg$c97 = "titre",
        peg$c98 = peg$literalExpectation("titre", false),
        peg$c99 = function(val) { return {type:"title", value: [val], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c100 = "from",
        peg$c101 = peg$literalExpectation("from", false),
        peg$c102 = "of",
        peg$c103 = peg$literalExpectation("of", false),
        peg$c104 = "in",
        peg$c105 = peg$literalExpectation("in", false),
        peg$c106 = "the",
        peg$c107 = peg$literalExpectation("the", false),
        peg$c108 = "book",
        peg$c109 = peg$literalExpectation("book", false),
        peg$c110 = /^[([]/,
        peg$c111 = peg$classExpectation(["(", "["], false, false),
        peg$c112 = /^[)\]]/,
        peg$c113 = peg$classExpectation([")", "]"], false, false),
        peg$c114 = function(val) { return {"type": "translation_sequence", "value": val, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c115 = "\x1E",
        peg$c116 = peg$literalExpectation("\x1E", false),
        peg$c117 = function(val) { return {"type": "translation", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c118 = ",000",
        peg$c119 = peg$literalExpectation(",000", false),
        peg$c120 = function(val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c121 = /^[^\x1F\x1E([]/,
        peg$c122 = peg$classExpectation(["\x1F", "\x1E", "(", "["], true, false),
        peg$c123 = function(val) { return {"type": "word", "value": val.join(""), "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c124 = function(val) { return {"type": "stop", "value": val, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c125 = /^[\s\xa0*]/,
        peg$c126 = peg$classExpectation([" ", "\t", "\r", "\n", "\xA0", "*"], false, false),

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
        peg$c88 = /^[;\/:&\-\u2013\u2014~]/;
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
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

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
          if (input.substr(peg$currPos, 2) === peg$c40) {
            s3 = peg$c40;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsespace();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 7) === peg$c42) {
                s5 = peg$c42;
                peg$currPos += 7;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseabbrev();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$currPos;
                  peg$silentFails++;
                  if (peg$c44.test(input.charAt(peg$currPos))) {
                    s8 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c45); }
                  }
                  peg$silentFails--;
                  if (s8 === peg$FAILED) {
                    s7 = void 0;
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c46(s1);
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

    function peg$parseinteger_title() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetitle();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c47(s1, s2);
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
          if (input.substr(peg$currPos, 3) === peg$c48) {
            s3 = peg$c48;
            peg$currPos += 3;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c50(s2);
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
          if (input.substr(peg$currPos, 3) === peg$c51) {
            s3 = peg$c51;
            peg$currPos += 3;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c52); }
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
        if (input.substr(peg$currPos, 2) === peg$c53) {
          s2 = peg$c53;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          if (peg$c55.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
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
            s1 = peg$c57(s1);
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
            s1 = peg$c58(s1, s3);
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
              s7 = peg$parsespace();
              if (s7 !== peg$FAILED) {
                if (input.substr(peg$currPos, 7) === peg$c42) {
                  s8 = peg$c42;
                  peg$currPos += 7;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c43); }
                }
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
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              if (peg$c59.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                peg$silentFails++;
                if (peg$c44.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
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
                  s1 = peg$c61(s2);
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
          s1 = peg$c61(s2);
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
        if (input.substr(peg$currPos, 2) === peg$c62) {
          s3 = peg$c62;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c63); }
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c64) {
            s4 = peg$c64;
            peg$currPos += 7;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c65); }
          }
          if (s4 === peg$FAILED) {
            if (input.substr(peg$currPos, 6) === peg$c66) {
              s4 = peg$c66;
              peg$currPos += 6;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c67); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c68) {
                s5 = peg$c68;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c69); }
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
                  s5 = peg$c70;
                  peg$currPos++;
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
                  s4 = peg$parseabbrev();
                  if (s4 === peg$FAILED) {
                    s4 = null;
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
            s1 = peg$c72();
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
          s3 = peg$c73;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 6) === peg$c75) {
            s4 = peg$c75;
            peg$currPos += 6;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s4 === peg$FAILED) {
            if (input.substr(peg$currPos, 5) === peg$c77) {
              s4 = peg$c77;
              peg$currPos += 5;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c79) {
                s5 = peg$c79;
                peg$currPos += 3;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c80); }
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
                if (input.substr(peg$currPos, 2) === peg$c81) {
                  s5 = peg$c81;
                  peg$currPos += 2;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c82); }
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
                    s5 = peg$c73;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c74); }
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
          if (peg$c44.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
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
              s1 = peg$c83();
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
          s3 = peg$c84;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c85); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (input.charCodeAt(peg$currPos) === 58) {
              s3 = peg$c84;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c85); }
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
        if (peg$c86.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c87); }
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
      if (peg$c88.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c89); }
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
          s2 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c40) {
            s3 = peg$c40;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$currPos;
            s6 = peg$parsespace();
            if (s6 !== peg$FAILED) {
              if (input.substr(peg$currPos, 7) === peg$c42) {
                s7 = peg$c42;
                peg$currPos += 7;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
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
            if (input.substr(peg$currPos, 8) === peg$c90) {
              s2 = peg$c90;
              peg$currPos += 8;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c91); }
            }
            if (s2 === peg$FAILED) {
              s2 = peg$parsespace();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c88.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c89); }
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
              s2 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c40) {
                s3 = peg$c40;
                peg$currPos += 2;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c41); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$currPos;
                s6 = peg$parsespace();
                if (s6 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 7) === peg$c42) {
                    s7 = peg$c42;
                    peg$currPos += 7;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c43); }
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
                if (input.substr(peg$currPos, 8) === peg$c90) {
                  s2 = peg$c90;
                  peg$currPos += 8;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c91); }
                }
                if (s2 === peg$FAILED) {
                  s2 = peg$parsespace();
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
        s1 = peg$c92();
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
        if (peg$c93.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c94); }
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
          if (input.substr(peg$currPos, 1).toLowerCase() === peg$c95) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c96); }
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
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            if (peg$c93.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c94); }
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
              if (input.substr(peg$currPos, 1).toLowerCase() === peg$c95) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c96); }
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
        if (input.substr(peg$currPos, 5) === peg$c97) {
          s2 = peg$c97;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c98); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c99(s2);
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
        if (input.substr(peg$currPos, 4) === peg$c100) {
          s2 = peg$c100;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c101); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c102) {
            s2 = peg$c102;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c103); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c104) {
              s2 = peg$c104;
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c105); }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c106) {
              s5 = peg$c106;
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c107); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsesp();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c108) {
                  s7 = peg$c108;
                  peg$currPos += 4;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c109); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsesp();
                  if (s8 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c102) {
                      s9 = peg$c102;
                      peg$currPos += 2;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c103); }
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
        if (peg$c110.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c111); }
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
                if (peg$c112.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c113); }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c114(s4);
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
            s1 = peg$c114(s3);
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
        s1 = peg$c115;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c116); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 30) {
            s3 = peg$c115;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c116); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c117(s2);
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
      if (peg$c55.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c55.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c120(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseword() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c121.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c122); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c121.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c122); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c123(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseword_parenthesis() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c110.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c111); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c124(s1);
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

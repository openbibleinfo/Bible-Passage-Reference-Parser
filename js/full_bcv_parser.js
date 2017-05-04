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
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*(?:Moseb(?:o(?:ken|g)|\xF3k)|Мојсијева))|(?:(?:1(?:[\s\xa0]*Moj[zż]|\.[\s\xa0]*Mojż)|I[\s\xa0]*Moj[zż])eszowa)|(?:(?:1(?:\.[\s\xa0]*Mo(?:j(?:ž[i\xED][sš]|z[i\xED][sš])ov|oseksen[\s\xa0]*kirj)|[\s\xa0]*Mo(?:j(?:ž[i\xED]|z[i\xED])[sš]ov|oseksen[\s\xa0]*kirj))|I[\s\xa0]*Moj(?:ž[i\xED]|z[i\xED])[sš]ov|Zanafill|I\.[\s\xa0]*Mojz[i\xED][sš]ov)a|(?:1\.?|I)[\s\xa0]*Mojż|[1I][\s\xa0]*Mojz|[1I]\.[\s\xa0]*Mojzeszowa|I\.[\s\xa0]*Mojżeszowa|Pierwsz[aey][\s\xa0]*Moj[zż]eszowa)|(?:《(?:創(?:世[紀記])?|创(?:世记)?)》|تك|創世|창세기|ਉਤਪਤ|ﺗﻜﻮﻳﻦ|Буг|ปฐ(?:มกาล|ก)|בר(?:אשית|יאה)|پ(?:یدا[ئی]|يدائ|َیدای)ش|Γ(?:ένεσ(?:ις|η)|ενεσ(?:ις|η))|pīdāyiš|M(?:[o\xF3]zes[\s\xa0]*I|wanzo)|ଆଦିପୁସ୍ତକ|G(?:ene(?:s(?:[ai]|es)|za)|n)|Beresjiet|[AĀ]tiy[aā]kamam|ஆதியாகமம்|தொ(?:டக்க[\s\xa0]*நூல்|நூ)|سفر[\s\xa0]*التكوين|Начало|Буття|Книга[\s\xa0]*Бытия|S\xE1ng[\s\xa0]*thế[\s\xa0]*k\xFD|F\xF8rste[\s\xa0]*Mosebo[gk]|उत्प(?:त(?:्तिको[\s\xa0]*पुस्तक|ि)|ाति)|Б[иы]тие|Настанување|Постање|I(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj)|(?:Jen[e\xE8]|Ro?d)z|(?:liv[\s\xa0]*Konmansman[\s\xa0]*|Z)an|F[o\xF6]rsta[\s\xa0]*Moseboken|(?:Прва[\s\xa0]*М|I\.?[\s\xa0]*М)ојсијева|(?:П(?:ърв(?:а[\s\xa0]*(?:книга[\s\xa0]*)?|о[\s\xa0]*)Мои|рв[ао][\s\xa0]*книга[\s\xa0]*Мој)|I\.?[\s\xa0]*Мои|I\.?[\s\xa0]*книга[\s\xa0]*Мо[ийј])сеева|Перш[ае][\s\xa0]*книга[\s\xa0]*Мо[ий]сеева|1(?:\.[\s\xa0]*Mo(?:sebo(?:ken|g)|jz)|[\s\xa0]*(?:M(?:oj|z)|Мојс)|\.[\s\xa0]*Мојсијева|(?:\.[\s\xa0]*(?:книга[\s\xa0]*Мо[ийј]|Мои)|[\s\xa0]*(?:книга[\s\xa0]*Мо[ийј]|Мои))сеева|\-?(?:[ае](?:\.[\s\xa0]*книга[\s\xa0]*Мо[ий]|[\s\xa0]*книга[\s\xa0]*Мо[ий])|ше(?:\.[\s\xa0]*книга[\s\xa0]*Мо[ий]|[\s\xa0]*книга[\s\xa0]*Мо[ий]))сеева)|(?:1(?:\.[\s\xa0]*M(?:\xF3seb[o\xF3]|oseb\xF3)|[\s\xa0]*M(?:\xF3seb[o\xF3]|osebo))|Fyrsta[\s\xa0]*M[o\xF3]seb[o\xF3]|I\.?[\s\xa0]*Moseb[o\xF3]|I\.?[\s\xa0]*M\xF3seb[o\xF3])k|utpattiko[\s\xa0]*pustak|(?:Bilowgi|Utpaat)i|P(?:urwaning[\s\xa0]*Dumadi|ostanak|ierwsz[aey][\s\xa0]*Moj[zż])|K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*Rodzaj|[\s\xa0]*p[o\xF4]vod|\.[\s\xa0]*p[o\xF4]vod|niha[\s\xa0]*p[o\xF4]vod)u|(?:Gen(?:n(?:e(?:is[eiu]|s[eiu]|es[eiu])|i(?:[ei]s[eiu]|s[eiu]))|e(?:is[eiu]|su|zi)|is[eiu]|(?:i[ei]|ee)s[eiu])|Teremt[e\xE9]|Genn?si|G[\xE9\xEA]nesi|Henesi|Liber[\s\xa0]*Genesi|1(?:[\s\xa0]*M(?:o(?:ze|o)|\xF3ze)|M\xF3))s|(?:I(?:\.?[\s\xa0]*M\xF3|\.?[\s\xa0]*Mo)|1\.[\s\xa0]*M[o\xF3])zes|1e[\s\xa0]*Mozes|1e\.[\s\xa0]*Mozes|(?:Pierwsz[aey][\s\xa0]*Ks(?:\.[\s\xa0]*Moy[zż]|[\s\xa0]*Moy[zż]|i[eę]g[ai][\s\xa0]*Moy[zż])|(?:1\.?|I\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Moy[zż]|[\s\xa0]*Moy[zż]|i[eę]g[ai][\s\xa0]*Moy[zż]))eszowe|(?:Fyrsta[\s\xa0]*b[o\xF3]k[\s\xa0]*M[o\xF3]|Gen\xE8)se|1\.?[\s\xa0]*Buch[\s\xa0]*Mose|Б[иуы]т|창세?|Jen|Γ(?:εν?|έν)|Mwa|Ter|ஆதி|ଆଦି|G(?:e(?:n(?:eis|ese|neis)?)?|\xE9n?|\xEAn)|Нач|utpat(?:ti)?|F\xF8rste[\s\xa0]*Mos|उत्पत्ति|Пост|Прва[\s\xa0]*Мојс|I\.?[\s\xa0]*Мојс|I\.?[\s\xa0]*Mos|I\.?[\s\xa0]*M\xF3s|F[o\xF6]rsta[\s\xa0]*Mosebok|1(?:\.[\s\xa0]*(?:M(?:o(?:s(?:e(?:bok)?)?)?|\xF3s)|Мојс)|[\s\xa0]*(?:M(?:o(?:se?|z)?|\xF3z)|М|M\xF3s))|Post|(?:P(?:rv(?:(?:[y\xFD][\s\xa0]*list[\s\xa0]*Moj[zž]|[y\xFD][\s\xa0]*Moj[zž]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]|Moj[zž]))i[sš]|n[i\xED][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš]))ov|ierwsz[aey][\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszow)|1[\s\xa0]*k(?:\.[\s\xa0]*Moj[zž]|[\s\xa0]*Moj[zž])i[sš]ov|Doomettaaba|Facere|I\.[\s\xa0]*Mojž[i\xED][sš]ov|1[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]ov|(?:I\.?|1\.)[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]ov|(?:1\.?|I\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszow|K(?:n(?:iha[\s\xa0]*stvoreni|jiga[\s\xa0]*Postank)|\.?[\s\xa0]*stvoreni|itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Mus))a|Buttja|I\.?[\s\xa0]*Mooseksen[\s\xa0]*kirja|E(?:(?:ls[oő][\s\xa0]*M[o\xF3]|erste[\s\xa0]*Mo)zes|rste[\s\xa0]*(?:Buch[\s\xa0]*)?Mose|nsimm[a\xE4]inen[\s\xa0]*Mooseksen[\s\xa0]*kirja))|(?:创世记》)|(?:《(?:創世[紀記]|创世记)|创》|創(?:世[紀記])?》|Genesis|التكوين|S\xE1ng[\s\xa0]*Thế|utpattiko|उत्पत्तिको|《[创創]|Konmansman|[1I][\s\xa0]*Mooseksen|[1I]\.[\s\xa0]*Mooseksen|Ensimm[a\xE4]inen[\s\xa0]*Mooseksen)|(?:創世[紀記]|创世记|[创創]|S\xE1ng))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Exod"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2[\s\xa0]*(?:Moseb(?:o(?:ken|g)|\xF3k)|Мојсијева))|(?:2(?:\.[\s\xa0]*Mo(?:j(?:(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)a|[zż])|oseksen[\s\xa0]*kirja)|[\s\xa0]*Mo(?:j(?:(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)a|ż|z)?|oseksen[\s\xa0]*kirja))|(?:(?:Drug[ai][\s\xa0]*Moj[zż]|II\.[\s\xa0]*Moj[zż])eszow|II\.[\s\xa0]*Mojz[i\xED][sš]ov|II[\s\xa0]*Moj(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow))a|II[\s\xa0]*Moj[zż]|Nirgaman|Dalja)|(?:탈출기|Ἔξ|ਕੂਚ|kūč|Wj|출애굽기|อพยพ|שמות|Wyj|ḫurūj|[\xC9\xCA]x(?:odo|d)|出エ[シジ][フプ]ト記|《出(?:埃及[記记]?|谷紀)?》|Εξοδος|Έξοδος|Sjemot|निर्गमन|И(?:зл(?:азак|ез)|сх)|Vy[hȟ]id|E(?:x(?:od[eos]|d)|sodo|ksod[io]|gz\xF2d)|خروج|خُرُوج|سفر[\s\xa0]*الخروج|Baxniintii|יציא(?:ת[\s\xa0]*מצרים|ה)|nirgam|Y[aā]ttir[aā]kamam|ଯାତ୍ରା[\s\xa0]*?ପୁସ୍ତକ|M[o\xF3]zes[\s\xa0]*II|யாத்திராகமம்|வி(?:டுதலைப்[\s\xa0]*பயணம்|ப)|Anden[\s\xa0]*Mosebog|Xuất[\s\xa0]*(?:Ai\-?cập|H\xE0nh|Ai[\s\xa0]*Cập[\s\xa0]*K\xFD|\xCA\-?d\xEDp\-?t\xF4[\s\xa0]*k\xFD)|प्रस्थानको[\s\xa0]*पुस्तक|(?:Книга[\s\xa0]*Ис|Из)ход|Вихід|Егзодус|(?:liv[\s\xa0]*delivrans[\s\xa0]*l|Pangentas)an|Andra[\s\xa0]*Moseboken|[O\xD6]nnur[\s\xa0]*b[o\xF3]k[\s\xa0]*M[o\xF3]se|Zweite[\s\xa0]*Mose|Zweite[\s\xa0]*Buch[\s\xa0]*Mose|2(?:\.[\s\xa0]*(?:Mosebo(?:ken|g)|Buch[\s\xa0]*Mose)|[\s\xa0]*(?:Buch[\s\xa0]*Mose|Мојс|Mz))|(?:Друга|2\.)[\s\xa0]*Мојсијева|(?:Втор(?:а[\s\xa0]*(?:книга[\s\xa0]*Мо[иј]|Мои)|о[\s\xa0]*(?:книга[\s\xa0]*Мој|Мои))|Друга[\s\xa0]*книга[\s\xa0]*Мо[ий]|Друге[\s\xa0]*книга[\s\xa0]*Мо[ий]|2(?:\-?(?:[ае](?:\.[\s\xa0]*книга[\s\xa0]*Мо[ий]|[\s\xa0]*книга[\s\xa0]*Мо[ий])|ге(?:\.[\s\xa0]*книга[\s\xa0]*Мо[ий]|[\s\xa0]*книга[\s\xa0]*Мо[ий]))|[\s\xa0]*Мои)|2\.[\s\xa0]*Мои)сеева|2\.?[\s\xa0]*книга[\s\xa0]*Мо[ийј]сеева|(?:2(?:\.[\s\xa0]*Moseb\xF3|[\s\xa0]*Mosebo)|An(?:dre|nen)[\s\xa0]*Mosebo|prastʰ[aā]nko[\s\xa0]*pusta)k|[O\xD6]nnur[\s\xa0]*M[o\xF3]seb[o\xF3]k|2\.?[\s\xa0]*M\xF3seb[o\xF3]k|I(?:I(?:\.[\s\xa0]*(?:M(?:o(?:seb[o\xF3]k|j[zż])|\xF3seb[o\xF3]k)|(?:книга[\s\xa0]*Мо[ийј]се|Мо(?:јсиј|исе))ева)|[\s\xa0]*(?:Мојсијева|Moj|Моисеева|книга[\s\xa0]*Мо[ийј]сеева|M[o\xF3]seb[o\xF3]k))|zlazak)|Exodul|D(?:rug[ai][\s\xa0]*Moj[zż]|al)|(?:E(?:gzodu|xodi|csodu)|Liber[\s\xa0]*Exodu|2(?:[\s\xa0]*M(?:o(?:ze|o)|\xF3ze)|M\xF3)|(?:II(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])|2\.[\s\xa0]*M[o\xF3])ze|M[a\xE1]sodik[\s\xa0]*M[o\xF3]ze|2e[\s\xa0]*Moze|2e\.[\s\xa0]*Moze|Tweede[\s\xa0]*Moze)s|[\xC9\xCA]x(?:od?)?|อพย|탈?출|出エ[シジ][フプ]ト|خر|Εξ|निर्गम|Из[лх]|E(?:x(?:od?)?|ks|gz(?:od)?|cs)|Bax|யாத்|And(?:en|re)[\s\xa0]*Mos|प्रस्थान|Вих|Andra[\s\xa0]*Mosebok|2(?:[\s\xa0]*(?:M(?:o(?:se?|z)?|\xF3z)|М)|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|Друга[\s\xa0]*Мојс|2\.[\s\xa0]*Мојс|2\.?[\s\xa0]*M\xF3s|I(?:I(?:\.[\s\xa0]*(?:M[o\xF3]s|Мојс)|[\s\xa0]*(?:M[o\xF3]s|Мојс))|zl)|(?:I(?:I\.?[\s\xa0]*Mooseksen[\s\xa0]*kirj|e[sşș]ire)|Toinen[\s\xa0]*Mooseksen[\s\xa0]*kirj|2[\s\xa0]*k(?:\.[\s\xa0]*Moj[zž]|[\s\xa0]*Moj[zž])i[sš]ov|II\.[\s\xa0]*Mojž[i\xED][sš]ov|2[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]ov|(?:II\.?|2\.)[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]ov|(?:II\.?|2\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszow|Dru(?:h(?:[y\xFD][\s\xa0]*Moj[zž][i\xED][sš]|[y\xFD][\s\xa0]*list[\s\xa0]*Moj[zž]i[sš]|[y\xFD][\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš]))ov|g[ai][\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszow))a|K(?:(?:s(?:\.[\s\xa0]*Wyj[sś]|[\s\xa0]*Wyj[sś]|i[eę]g[ai][\s\xa0]*Wyj[sś])ci|essaaba|utok|njiga[\s\xa0]*Izlask)a|ess|ut|i(?:tabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Musa|v(?:onul[a\xE1]s)?)))|(?:出(?:埃及[記记]?|谷紀)?》|Xuất|Исход|《出(?:埃及[記记]|谷紀)|ଯାତ୍ରା|الخروج|Exodus|Delivrans|प्रस्थानको|prastʰ[aā]nko|出(?:埃及[記记]?|谷紀)?|《出(?:埃及)?|(?:II|2)[\s\xa0]*Mooseksen|(?:II|2)\.[\s\xa0]*Mooseksen|Toinen[\s\xa0]*Mooseksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Bel"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:B(?:el(?:[\\s\\xa0]*(?:e(?:[\\s\\xa0]*(?:o[\\s\\xa0]*Drag[a\\xE3]|il[\\s\\xa0]*Drag)o|s[\\s\\xa0]*a[\\s\\xa0]*s[a\\xE1]rk[a\\xE1]ny)|\\xE9s[\\s\\xa0]*a[\\s\\xa0]*s[a\\xE1]rk[a\\xE1]ny|en[\\s\\xa0]*de[\\s\\xa0]*draak|(?:ja[\\s\\xa0]*lohik[a\\xE4][a\\xE4]rm|y[\\s\\xa0]*el[\\s\\xa0]*Serpient)e|et[\\s\\xa0]*le[\\s\\xa0]*Serpent|&[\\s\\xa0]*(?:the[\\s\\xa0]*S(?:erpent|nake)|S(?:erpent|nake))|a(?:nd[\\s\\xa0]*(?:the[\\s\\xa0]*S(?:erpent|nake)|S(?:erpent|nake))|['’]r[\\s\\xa0]*Ddraig|[\\s\\xa0]*drak)|(?:y[\\s\\xa0]*el[\\s\\xa0]*Drag[o\\xF3]|und[\\s\\xa0]*Vom[\\s\\xa0]*Drache)n|(?:&[\\s\\xa0]*(?:the[\\s\\xa0]*)?|et[\\s\\xa0]*le[\\s\\xa0]*|and[\\s\\xa0]*(?:the[\\s\\xa0]*)?)Dragon|o(?:g[\\s\\xa0]*dr(?:a(?:gen[\\s\\xa0]*i[\\s\\xa0]*Babylo|ke)|ekin)|ch[\\s\\xa0]*Ormgude)n)|a[\\s\\xa0]*i[\\s\\xa0]*w[eę][zż]a)|(?:a[a\\xE1]l[\\s\\xa0]*[e\\xE9]|\\xE9l[\\s\\xa0]*[e\\xE9])s[\\s\\xa0]*a[\\s\\xa0]*s[a\\xE1]rk[a\\xE1]ny|\\xE9l[\\s\\xa0]*a[\\s\\xa0]*drak)|[ヘベ]ルと[竜龍]|벨과[\\s\\xa0]*[뱀용]|《Bel》|بل[\\s\\xa0]*والتنين|התנין[\\s\\xa0]*בבבל|בל[\\s\\xa0]*והדרקון|Бел(?:[\\s\\xa0]*(?:и[\\s\\xa0]*Д|і[\\s\\xa0]*д)ракон|е)|Вил(?:е[\\s\\xa0]*и[\\s\\xa0]*драконе|[\\s\\xa0]*и[\\s\\xa0]*змеят)|Β(?:ηλ[\\s\\xa0]*και[\\s\\xa0]*Δρ[άα]κων|ὴλ)|Si[\\s\\xa0]*Bel[\\s\\xa0]*at[\\s\\xa0]*ang[\\s\\xa0]*Dragon|Bel[\\s\\xa0]*et[\\s\\xa0]*draconis|Histoia[\\s\\xa0]*Beli[\\s\\xa0]*et[\\s\\xa0]*draconis|Opowiadaniem[\\s\\xa0]*o[\\s\\xa0]*Belu[\\s\\xa0]*i[\\s\\xa0]*w[eę][zż]u|பேல்[\\s\\xa0]*தெய்வமும்[\\s\\xa0]*அரக்கப்பாம்பும்[\\s\\xa0]*என்பவையாகும்|Danieli[\\s\\xa0]*na[\\s\\xa0]*Makuhani[\\s\\xa0]*wa[\\s\\xa0]*Beli|Bel[\\s\\xa0]*[sș]i[\\s\\xa0]*dragonul|Istoria[\\s\\xa0]*(?:omor[a\\xE2]rii[\\s\\xa0]*balaurului[\\s\\xa0]*[sş]i[\\s\\xa0]*a[\\s\\xa0]*sf[aă]r[a\\xE2]m[aă]rii[\\s\\xa0]*lui[\\s\\xa0]*Bel|Balaurului))|(?:B(?:el(?:[\\s\\xa0]*(?:e(?:[\\s\\xa0]*o[\\s\\xa0]*drag[a\\xE3]o|t[\\s\\xa0]*le[\\s\\xa0]*serpent)|og[\\s\\xa0]*Dragen|et[\\s\\xa0]*le[\\s\\xa0]*dragon|at[\\s\\xa0]*ang[\\s\\xa0]*Dragon)|》)|\\xE9l)|Βηλ|Бел|Вил|《Bel|Bel|பேல்(?:[\\s\\xa0]*தெய்வமும்[\\s\\xa0]*அரக்கப்பாம்பும்)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phlm"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:《(?:[門门]|肥利孟|費肋孟書|腓利(?:門書|门书))》|Ф(?:или|л)м|Φλμ|본|빌레몬서|ฟ(?:ีเลโมน|ม)|[ヒピ]レモン(?:への)?書|[ヒピ]レモンへの手紙|[ヒピ]レモンヘの手紙|フィレモン(?:への手紙|書)|필레몬(?:에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|Προς[\\s\\xa0]*Φιλ[ήη]μονα|F(?:il(?:emo(?:n(?:sbr[e\\xE9]fi\\xF0|(?:breve|i)t)|m)|m)|\\xEDl(?:emonsbr[e\\xE9]fi\\xF0|m))|ਫ਼?ਿਲੇਮੋਨ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|pʰilemon[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī|ଫିଲୀମୋନଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*פילימון|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*אל\\-?פילימון|filēmōn[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|फ(?:िलेमोना|ले)|फिलेमोनलाई[\\s\\xa0]*पत्र|फिलेमोनलाई[\\s\\xa0]*पावलको[\\s\\xa0]*पत्र|पौलाचे[\\s\\xa0]*फिलेमोनाला[\\s\\xa0]*पत्र|Br(?:\\xE9f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*F[i\\xED]|ef[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*F[i\\xED])lemons|Kirje[\\s\\xa0]*Filemonille|Fil\\xE8mone|(?:Warak|Baru)a[\\s\\xa0]*kwa[\\s\\xa0]*Filemoni|L(?:ist[\\s\\xa0]*Filem[o\\xF3]novi|ettera[\\s\\xa0]*a[\\s\\xa0]*Filemone)|பில(?:ேமோன(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:நிருப|கடித)ம)?|மோன(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*திருமுகம)?)்|الرسالة[\\s\\xa0]*إلى[\\s\\xa0]*فليمون|رسالة[\\s\\xa0]*بولس[\\s\\xa0]*الرسول[\\s\\xa0]*إلى[\\s\\xa0]*فليمون|ف(?:لیمون[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*(?:پولس[\\s\\xa0]*رسُول[\\s\\xa0]*)?کا[\\s\\xa0]*خط|ِلیمون[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*کا[\\s\\xa0]*خط|يل)|Fl?mn|Filemonhoz|(?:Kang[\\s\\xa0]*Filem[o\\xF3]|Filimo)n|Fil\\xE9mon|Brevet[\\s\\xa0]*til[\\s\\xa0]*Filemon|(?:Brevet[\\s\\xa0]*till|Kay)[\\s\\xa0]*Filemon|Epistulam?[\\s\\xa0]*ad[\\s\\xa0]*Philemonem|pʰilemon(?:[aā]l[aā]|l[aā][iī])[\\s\\xa0]*patra|List[\\s\\xa0]*(?:[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*)?do[\\s\\xa0]*Filemona|P(?:h(?:ilemonhoz|l?mn|i\\-?l\\xEA\\-?m\\xF4n|(?:il[\\xE9\\xEA]|l[ei])mon)|a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Filemon|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Filemonu)|il(?:[eē]m[oō][nṉ]ukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupa)?m|ilimoona|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*Fylymona)|[ヒピ]レモンへ|フィレモン|필레|Fi(?:l[ei]m)?|फिलेमोन|பிலே?|ف|Fl?m|Ph(?:ile(?:m(?:on)?)?|l?m)|П(?:ослан(?:и(?:е[\\s\\xa0]*к(?:ъм[\\s\\xa0]*Филимон|[\\s\\xa0]*Филимону)|ца[\\s\\xa0]*Филимону|е[\\s\\xa0]*на[\\s\\xa0]*св\\.?[\\s\\xa0]*ап[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Филимона|е[\\s\\xa0]*на[\\s\\xa0]*св\\.?[\\s\\xa0]*ап\\.[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Филимона)|ня[\\s\\xa0]*(?:апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Филимона|до[\\s\\xa0]*Фили(?:пі[ий]ців|мона)|св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Филимона))|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*Филемон))|(?:(?:[門门]|肥利孟|費肋孟書|腓利(?:門書|门书))》|《(?:[門门]|肥利孟|腓利门书|腓利門書|費肋孟書)|ف(?:ل[يی]|ِلی)مون|Фил(?:имон[ау]|емон)|Φιλ[ήη]μονα|אל[\\s\\xa0]*פילימון|ଫିଲୀମୋନଙ୍କ|К[\\s\\xa0]*Филимону|Filemon(?:[aeu]|ovi|ille)|До[\\s\\xa0]*Филимона|pʰilemon(?:[aā]l[aā]|l[aā][iī])|ਫ਼ਿਲੇਮੋਨ[\\s\\xa0]*ਨੂੰ|फिलेमोन(?:ाला[\\s\\xa0]*पत्र|लाई)|ad[\\s\\xa0]*Philemonem|[門门]|肥利孟|費肋孟書|腓利(?:門書|门书)|Филимон|Filemoni?|pʰilemon|फिलेमोनाला|Filem\\xF3n|P(?:hi(?:lemonem|\\-?l\\xEA)|il[eē]m[oō][nṉ]ukku|oslanica[\\s\\xa0]*Filemonu|aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*Filemon)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lev"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:3(?:[\s\xa0]*(?:Moseb(?:\xF3k|og)|Мојсијева|Moseboken)|\.[\s\xa0]*Moseboken|[\s\xa0]*Mojž[i\xED][sš]ova|[\s\xa0]*Mojżeszowa|[\s\xa0]*Mojz(?:[i\xED][sš]ov|eszow)a|\.[\s\xa0]*Moj(?:z(?:[i\xED][sš]ov|eszow)|żeszow)a)|III[\s\xa0]*Moj(?:z(?:[i\xED][sš]ov|eszow)|żeszow)a)|(?:le(?:v(?:ī(?:har[uū]ko[\s\xa0]*pustak|āṃ[\s\xa0]*dī[\s\xa0]*potʰī)|ihar[uū]ko[\s\xa0]*pustak)|w[iī]y)|L[e\xE9]vitique)|(?:《(?:利(?:未[記记]|末记)?|肋未紀)》|أح|لا|레위기|レ[ヒビ]記|ลนต|ויקרא|iḥbār|ﺍﻟﻼﻭﻳﻲ|ا(?:لأ)?حبار|เลวีนิติ|Wal|Λευ[ιϊ]τικ[οό]ν|லேவியர(?:ாகமம)?்|ספר[\s\xa0]*הלוויים|Книга[\s\xa0]*Левит|ଲେବୀୟ[\s\xa0]*ପୁସ୍ତକ|سفر[\s\xa0]*اللاويين|ਲੇਵੀਆਂ[\s\xa0]*ਦੀ[\s\xa0]*ਪੋਥੀ|M[o\xF3]zes[\s\xa0]*III|ल(?:ैव्य(?:व(?:्यव)?|्व्य्व)स्था|ेव(?:ी(?:हरूको[\s\xa0]*पुस्तक|य)|ि))|Mambo[\s\xa0]*ya[\s\xa0]*Walawi|L(?:e(?:v(?:i(?:ti(?:k(?:[e\xEB]t|us)|c(?:os|ul))|yar[aā]kamam)|\xEDticos|yt)|biti[ck]o)|\xEA\-?vi[\s\xa0]*k\xFD|\xE9?v|ēviyar[aā]kamam|(?:eviticus|\xEA[\s\xa0]*V)i|a(?:awiyiintii|w))|3(?:[\s\xa0]*(?:M(?:oj[zż]|z)|Мојс)|\.[\s\xa0]*Mo(?:sebo[gk]|j[zż]))|Левитска[\s\xa0]*книга|(?:Трећ(?:ом|а)[\s\xa0]*Мој|3\.[\s\xa0]*Мој)сијева|(?:Трет(?:а[\s\xa0]*(?:книга[\s\xa0]*Мо[иј]|Мои)|о[\s\xa0]*Мои)|3[\s\xa0]*Мои|3\.[\s\xa0]*Мои)сеева|(?:3(?:\-?(?:[ае]\.?|тє\.?)|\.)?|Трет[яє])[\s\xa0]*книга[\s\xa0]*Мо[ий]сеева|(?:L(?:e(?:v(?:et[ei]?|ite?)c|bitik|fitic)|i(?:ber[\s\xa0]*Leviti|v[ei]t[ei]|v[ei]t)c)u|3(?:[\s\xa0]*M[o\xF3]ze|M\xF3))s|(?:Harmadik[\s\xa0]*M[o\xF3]|Derde[\s\xa0]*Mo|3(?:e\.?|\.)[\s\xa0]*Mo|3\.[\s\xa0]*M\xF3)zes|(?:Levit(?:ski[\s\xa0]*zakoni|[a\xE1])|3(?:\.[\s\xa0]*Moseb\xF3|[\s\xa0]*Mosebo))k|\xDEri\xF0ja[\s\xa0]*M[o\xF3]seb[o\xF3]k|3\.?[\s\xa0]*M\xF3seb[o\xF3]k|III(?:\.[\s\xa0]*(?:M(?:\xF3(?:seb[o\xF3]k|zes)|o(?:seb[o\xF3]k|zes))|(?:Мо(?:јсиј|исе)|книга[\s\xa0]*Мо[ий]се)ева)|[\s\xa0]*(?:Мојсијева|Moj[zż]|Моисеева|книга[\s\xa0]*Мо[ий]сеева|M[o\xF3]zes|M[o\xF3]seb[o\xF3]k))|K(?:ap[lł]|p[lł])|Kaimaman|3e\.?[\s\xa0]*Moseboken|(?:K(?:s(?:\.[\s\xa0]*Kapła[nń]|[\s\xa0]*Kapła[nń]|i[eę]g[ai][\s\xa0]*Kapła[nń])sk|olmas[\s\xa0]*Mooseksen[\s\xa0]*kirj|itabu[\s\xa0]*cha[\s\xa0]*Tatu[\s\xa0]*cha[\s\xa0]*Mus)|W(?:ogaaba|ajikr)|Vajikr|Laaivyavyavasth|3[\s\xa0]*Mooseksen[\s\xa0]*kirj|(?:III\.?|3\.)[\s\xa0]*Mooseksen[\s\xa0]*kirj|(?:(?:III\.?|3\.)[\s\xa0]*Mojž[i\xED]|III\.[\s\xa0]*Mojz[i\xED]|3[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED]|(?:III\.?|3\.)[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED])[sš]ov|3[\s\xa0]*k[\s\xa0]*Moj[zž]i[sš]ov|3[\s\xa0]*k\.[\s\xa0]*Moj[zž]i[sš]ov)a|III\.[\s\xa0]*Moj[zż]eszowa|(?:III\.?|3\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|T(?:r(?:e(?:t(?:i(?:[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED]|Moj[zž][i\xED])[sš]|a[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Moj[zž]i[sš]))|\xED[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED]|Moj[zž][i\xED])[sš])ova|dje[\s\xa0]*Mosebo(?:ken|g))|zeci(?:a[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])e|Moj[zż]e)|[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])e|Moj[zż]e))szowa)|řet[i\xED][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED]|Moj[zž][i\xED])[sš]ova)|Λε(?:υ(?:[ιϊ]τ(?:ικ[οό])?)?)?|レ[ヒビ]|레위?|Wog|லேவி|Лев|ल(?:ैव्य(?:व्यवस्थ)?|ेवी)|L(?:e(?:v(?:i(?:ti(?:co?|ku?))?|\xEDtico)?|b|f)?|\xE9|aaw)|3(?:[\s\xa0]*(?:M(?:o(?:j|z|se?|os)?|\xF3z)|М)|\.[\s\xa0]*Mo(?:se?)?)|Трећ(?:ом|а)[\s\xa0]*Мојс|3\.[\s\xa0]*Мојс|3\.?[\s\xa0]*M\xF3s|III(?:\.[\s\xa0]*(?:M(?:o(?:jz|s)|\xF3s)|Мојс)|[\s\xa0]*(?:M[o\xF3]s|Мојс|Moj))|3e\.?[\s\xa0]*Mosebok|III\.[\s\xa0]*Mojż|Tr(?:zeci(?:a[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż])|edje[\s\xa0]*Mos(?:ebok)?)|(?:\xDEri\xF0ja[\s\xa0]*b[o\xF3]k[\s\xa0]*M[o\xF3]|Dritte[\s\xa0]*Mo|Dritte[\s\xa0]*Buch[\s\xa0]*Mo|3\.?[\s\xa0]*Buch[\s\xa0]*Mo)se|liv[\s\xa0]*Prensip[\s\xa0]*lavi[\s\xa0]*nan[\s\xa0]*Bondye)|(?:(?:利(?:未[記记]|末记)?|肋未紀)》|《(?:利(?:未[記记]|末记)|肋未紀)|ଲେବୀୟ|ਲੇਵੀਆਂ|Левитска|اللاويين|Walawi|L(?:eviticus|\xEA\-?vi)|लेवीहरूको|lev(?:ī(?:har[uū]ko|āṃ)|ihar[uū]ko)|利(?:未[記记]|末记)|肋未紀|《利|Левит|L\xEA|(?:III|3)[\s\xa0]*Mooseksen|(?:III|3)\.[\s\xa0]*Mooseksen|Kolmas[\s\xa0]*Mooseksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2[\s\xa0]*Tessalonikerbrevet)|(?:2(?:[\s\xa0]*T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)s|esaloni(?:k(?:yen|a)|canom|[cs]enses))|nd(?:(?:\.[\s\xa0]*Thes(?:[aeo]|s[eo])|[\s\xa0]*Thes(?:[aeo]|s[eo]))lonian|\.?[\s\xa0]*Thss|\.?[\s\xa0]*Thessalon(?:i[ao]|ai)n)s|\.[\s\xa0]*T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)s|esaloni(?:k(?:yen|a)|canom|[cs]enses)))|Andre[\s\xa0]*(?:tessalonikerbrev|Tessalonikerne)|(?:Second[\s\xa0]*Thss|Pili[\s\xa0]*The)s|Second[\s\xa0]*Thes(?:[aeo]|s[eo])lonians|Second[\s\xa0]*Thessalon(?:i[ao]|ai)ns|2\.?[\s\xa0]*Солунците|2\.?[\s\xa0]*Thesszalonikaiakhoz|2\.?[\s\xa0]*Tesszalonikaiakhoz|II(?:\.[\s\xa0]*(?:Thesszalonikaiakhoz|Солунците)|[\s\xa0]*(?:Thesszalonikaiakhoz|Солунците)))|(?:2(?:[\s\xa0]*T(?:h(?:esszalonika|ss)|esszalonika)|nd\.?[\s\xa0]*Thss|\.[\s\xa0]*T(?:h(?:esszalonika|ss)|esszalonika))|Second[\s\xa0]*Thss)|(?:2(?:\.[\s\xa0]*Tessalonikerbrevet|ธสะโลนิกา))|(?:2[\s\xa0]*(?:Tes(?:al(?:oni(?:c(?:en(?:s(?:[o\xF3]w|e)|i)|a)|ika|k)|\xF3ni[ck]a|oniczan|oničanom|onick[y\xFD]m|onisense)|s(?:aloni(?:ce(?:n(?:s(?:k[y\xFD]m|es)|zen)|si)|k(?:alais(?:kirj|ill)|ern)e)|z))|tessalonikerbrev))|(?:《(?:帖(?:撒(?:罗尼迦后书|羅尼迦後書)|[后後])|得撒洛尼後書|莎倫後)》|살후|Ⅱ[\s\xa0]*テサロニケ人へ|テサロニケ(?:人への(?:手紙[Ⅱ二]|後の書|第二の手紙)|[\s\xa0]*2|後書|の信徒への手紙二)|Β['ʹʹ΄’][\s\xa0]*Θεσσαλονικε[ίι]ς|ﺍﻟﺜﺎﻧﻴﺔ[\s\xa0]*ﺗﺴﺎﻟﻮﻧﻴﻜﻲ|데살로니가[2후]서|테살로니카(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*둘째[\s\xa0]*서간|2서)|Προς[\s\xa0]*Θεσσαλονικε[ίι]ς[\s\xa0]*Β['ʹʹ΄’]|ਥੱਸਲੁਨੀਕੀਆਂ[\s\xa0]*ਨੂੰ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੱਤ੍ਰੀ|ଥେସଲନୀକୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|האיגרת[\s\xa0]*השנייה[\s\xa0]*אל[\s\xa0]*התסלוניקים|אגרת[\s\xa0]*פולוס[\s\xa0]*השנייה[\s\xa0]*אל\-?התסלוניקים|Epistula[\s\xa0]*ad[\s\xa0]*Thessalonicenses[\s\xa0]*II|Wa(?:raka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wathesalonik[ei]|thesalonike[\s\xa0]*II)|tʰ(?:issalunīkiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|assalunīkīāṃ[\s\xa0]*nū̃[\s\xa0]*dūjī[\s\xa0]*pattrī)|पौलाचे[\s\xa0]*थेस्सलनीकाकरांस[\s\xa0]*दुसरे[\s\xa0]*पत्र|थिस्सलोनिकीहरूलाई[\s\xa0]*(?:पावलको[\s\xa0]*दोस|दोस्त)्रो[\s\xa0]*पत्र|S[i\xED]\xF0ara[\s\xa0]*\xDEessalon[i\xED]kubr[e\xE9]f|تھ(?:سلنیک(?:وں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پو[\s\xa0]*لس[\s\xa0]*رسول[\s\xa0]*کا|یوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*)|ِسّلُنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*)دوسرا[\s\xa0]*خط|Pili[\s\xa0]*The|الرسالة[\s\xa0]*الثانية[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*تسالونيكي|رسالة[\s\xa0]*(?:بولس[\s\xa0]*الرسول[\s\xa0]*الثانية[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*تسالونيكي|تسالونيكي[\s\xa0]*الثانية)|Second[\s\xa0]*Th(?:ess)?s|தெசலோனிக்க(?:ியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாவது[\s\xa0]*நிருப|ேயருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாம்[\s\xa0]*கடித|ருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டா(?:வது|ம்)[\s\xa0]*திருமுக)ம்|ଦ୍ୱିତୀୟ[\s\xa0]*ଥେସଲନୀକୀୟଙ|(?:دوم|۲)۔تھسلنیکیوں|(?:دوم|۲)\-?تھِسّلُنیکیوں|(?:دوم|۲)[\s\xa0]*تھ(?:س(?:ّلنیکی|لنیک)|ِسلُنیکی)وں|Anden[\s\xa0]*Thessalonikerbrev|Andet[\s\xa0]*Thessalonikerbrev|Second[\s\xa0]*Thessalon(?:i[ao]|ai)n|(?:Zweite[\s\xa0]*Thessalonich|Andre[\s\xa0]*Tessalonik)er|Andra[\s\xa0]*Th?essalonikerbrevet|2(?:[\s\xa0]*(?:தெசலோனிக்க(?:ேய)?ர்|تس|ธส|ਥੱਸਲੁਨੀਕੀਆਂ[\s\xa0]*ਨੂੰ|थेस्सलनीकाकरांस|tʰassalunīkīāṃ|T(?:ecal[oō][nṉ]ikkiyarukku|a?s))|nd(?:\.[\s\xa0]*Th(?:ess)?|[\s\xa0]*Th(?:ess)?)s|테살|[\s\xa0]*เธ[ซส]ะโลนิกา|[\s\xa0]*ଥେସଲନୀକୀୟଙ|۔تھسلنیکیوں|\-?تھِسّلُنیکیوں|[\s\xa0]*تھ(?:س(?:ّلنیکی|لنیک)|ِسلُنیکی)وں|[\s\xa0]*थिस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|[\s\xa0]*Фессалоники[ий]цам|(?:\-?(?:е\.?|я\.?)|[ея]\.?)[\s\xa0]*Фессалоники[ий]цам|(?:\-?(?:е\.?|я\.?)|[ея]\.?)?[\s\xa0]*к[\s\xa0]*Фессалоники[ий]цам|[\s\xa0]*tʰissalonik[iī]har[uū]l[aā][iī]|nd(?:\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)n|[\s\xa0]*Tessaloniker|[\s\xa0]*Th(?:es(?:s(?:alon(?:i(?:[ao]n|cher|kerbrevet)|ain)|[sz])|alonian)|s)|\.(?:[\s\xa0]*(?:تھ(?:س(?:ّلنیکی|لنیک)|ِسلُنیکی)وں|เธ[ซส]ะโลนิกา|ଥେସଲନୀକୀୟଙ|थिस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|Фессалоники[ий]цам|к[\s\xa0]*Фессалоники[ий]цам|t(?:ʰissalonik[iī]har[uū]l[aā][iī]|essalonikerbrev)|T(?:h(?:es(?:s(?:alon(?:i(?:[ao]n|cher|kerbrevet)|ain)|[sz])|alonian)|s)|es(?:aloni(?:c(?:en(?:se|i)|a)|k)|sz)))|(?:\-?تھِسّلُ|۔تھسل)نیکیوں))|(?:2\-?(?:а\.?[\s\xa0]*С|е\.?[\s\xa0]*С|ге\.?[\s\xa0]*С)|Друг[ае][\s\xa0]*С)олуньці|2\.?[\s\xa0]*Солун(?:ьці|яни)|(?:2(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloniai|Tesoloniika[\s\xa0]*Labaa)d|(?:Drug(?:a[\s\xa0]*Tesalonicens[o\xF3]|i[\s\xa0]*Tesalonicens[o\xF3])|2\.[\s\xa0]*Tesalonicens[o\xF3])w|(?:2(?:\xBA(?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])|o\.?[\s\xa0]*Tesaloni[cs]|\.[o\xBA](?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs]))|Segundo[\s\xa0]*Tesaloni[cs])enses|M[a\xE1]sodik[\s\xa0]*Th?esszalonikaiakhoz|(?:Second(?:a[\s\xa0]*lettera[\s\xa0]*ai|o|a)|2\xB0\.?)[\s\xa0]*Tessalonicesi|(?:(?:2(?:nd(?:\.[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|(?:\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)a)|[\s\xa0]*Thes(?:salon(?:i(?:oa|e|aa|ca)|aia)|alonio)|\.[\s\xa0]*Thes(?:salon(?:i(?:oa|e|aa|ca)|aia)|alonio))|Second[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio|salon(?:i[ao]|ai)a)|2\.?[\s\xa0]*Thesalonica|(?:2(?:nd(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e|[\s\xa0]*Thess?e|\.[\s\xa0]*Thess?e)|Second[\s\xa0]*Thess?e)lonai|(?:2(?:nd(?:\.[\s\xa0]*Thes(?:aloni[ci]|salone)|[\s\xa0]*Thes(?:aloni[ci]|salone))|[\s\xa0]*Thes(?:alonii|salone)|\.[\s\xa0]*Thes(?:alonii|salone))|Second[\s\xa0]*Thes(?:aloni[ci]|salone)|(?:2(?:nd(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|[\s\xa0]*Thess?|\.[\s\xa0]*Thess?)|Second[\s\xa0]*Thess?)alloni)a|(?:2(?:nd\.?|\.)?|Second)[\s\xa0]*Thessalonoi?a|2(?:e\.?[\s\xa0]*Thessalonic|\.?[\s\xa0]*Thesalonic)ie|(?:2(?:nd\.?[\s\xa0]*Thessalon|d[\s\xa0]*Thess?aloni|d\.[\s\xa0]*Thess?aloni|de(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloni|\xE8me(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloni|e(?:me(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|\.?[\s\xa0]*Thes)aloni|[\s\xa0]*Thessalon|\.[\s\xa0]*Thessalon)|Deuxi[e\xE8]me[\s\xa0]*Thess?aloni|Second[\s\xa0]*Thessalon|Deuxi[e\xE8]mes[\s\xa0]*Thess?aloni)cie|(?:2(?:nd\.?|\.)?|Second)[\s\xa0]*Thessaloniio)n|2(?:[\s\xa0]*tʰessalan[iī]k[aā]kar[aā][mṃ]|nd(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alonin|nd\.?[\s\xa0]*Thessolonin|nd\.?[\s\xa0]*Thessalonan|[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)n|\.[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)n)|Second[\s\xa0]*Thes(?:(?:s?a|so)loni|salona)n|2(?:[\s\xa0]*\xDE|Th|\.[\s\xa0]*\xDE)es|(?:2(?:nd\.?|\.)?|Second)[\s\xa0]*Thessalonici[ae]n|(?:(?:Epistula[\s\xa0]*II[\s\xa0]*ad[\s\xa0]*Th|Segundo[\s\xa0]*T|Segunda[\s\xa0]*T)ess|2(?:a\.?[\s\xa0]*Tess|o\.?[\s\xa0]*Tess))alonicense|2\.?[\s\xa0]*Thessalonicense)s|2\.[\s\xa0]*Tessalonice(?:nses|si)|(?:(?:Druh(?:(?:[y\xFD][\s\xa0]*list|[y\xFD]|[a\xE1])[\s\xa0]*Sol\xFA|[a\xE1][\s\xa0]*kniha[\s\xa0]*Sol[u\xFA])|2[\s\xa0]*k(?:\.[\s\xa0]*Sol[u\xFA]|[\s\xa0]*Sol[u\xFA]))nsky|Tecal[oō][nṉ]ikkiyarukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]vatu[\s\xa0]*Nirupa|(?:(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Tesa|[ay\xE1\xFD][\s\xa0]*Tesa|[a\xE1][\s\xa0]*kniha[\s\xa0]*Tesa)|2(?:[\s\xa0]*k\.?|\.)[\s\xa0]*Tesa)lonic|2\.[\s\xa0]*Tessalonicens)k[y\xFD]|(?:(?:Druh(?:(?:[y\xFD][\s\xa0]*list|[y\xFD])[\s\xa0]*Soluň|[y\xFD][\s\xa0]*Tessalonicen|[a\xE1][\s\xa0]*(?:Tessalonicen|Soluň))|(?:Druh[a\xE1]|2\.?)[\s\xa0]*list[\s\xa0]*Solu[nň])s|Druh(?:[y\xFD][\s\xa0]*list|[y\xFD]|[a\xE1])[\s\xa0]*Soluns|(?:Druh[a\xE1]|2\.?)[\s\xa0]*list[\s\xa0]*Tesalonic)k[y\xFD])m|(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Tesa|[ay\xE1\xFD][\s\xa0]*Tesa|[a\xE1][\s\xa0]*kniha[\s\xa0]*Tesa)|2[\s\xa0]*k\.?[\s\xa0]*Tesa)lonicanom|(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Solun[cč]|[y\xFD][\s\xa0]*Solun[cč]|[a\xE1][\s\xa0]*Solun[cč]|[ay\xE1\xFD][\s\xa0]*Tesalonič|[y\xFD][\s\xa0]*list[\s\xa0]*Tesalonič|[a\xE1][\s\xa0]*kniha[\s\xa0]*Tesalonič)|2(?:[\s\xa0]*k\.?|\.)[\s\xa0]*Tesalonič|(?:Druh(?:(?:[y\xFD][\s\xa0]*list|[y\xFD]|[a\xE1])[\s\xa0]*Sol\xFA|[a\xE1][\s\xa0]*kniha[\s\xa0]*Sol[u\xFA])|2[\s\xa0]*k(?:\.[\s\xa0]*Sol[u\xFA]|[\s\xa0]*Sol[u\xFA]))n[cč])anom|(?:tʰ(?:issalonik[iī]har[uū]l[aā][iī][\s\xa0]*dostro|essalan[iī]k[aā]kar[aā][mṃ]s[\s\xa0]*dusre)[\s\xa0]*patr|S[i\xED]\xF0ara[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*\xDEessalon[i\xED]kumann|Pavlova[\s\xa0]*druga[\s\xa0]*poslanica[\s\xa0]*Solunjanim|2(?:\.?[\s\xa0]*T\xE8salon|\.[\s\xa0]*Tesaloni)ik|2(?:\.[\s\xa0]*(?:T(?:aga\-?Tesal[o\xF3]|esal\xF3)|Mga[\s\xa0]*Taga\-?Tesal[o\xF3])|[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?Tesal[o\xF3]|Taga\-?Tesal[o\xF3]))ni[ck]|2(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Tesaloni[ck])a|2(?:\.?[\s\xa0]*Th\xEA|\.?[\s\xa0]*T\xEA)\-?sa\-?l\xF4\-?ni\-?ca|2\.?[\s\xa0]*Th\xEAxal\xF4nica|Druga[\s\xa0]*Solunjanima[\s\xa0]*Poslanica|2\.?[\s\xa0]*Sol(?:u(?:n(?:(?:sk[y\xFD]|[cč]ano)m|janima[\s\xa0]*Poslanica)|ňsk[y\xFD]m)|\xFAn(?:[cč]ano|sky)m)|(?:Paulus(?:’[\s\xa0]*(?:Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th|andre[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*t)|\'[\s\xa0]*Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th)essalonikern|Naa77antto[\s\xa0]*Tasalonqq|Anden[\s\xa0]*Tessalonikern|2(?:[\s\xa0]*(?:[ei]\.?[\s\xa0]*Thesalo|Thesalo|[ei]\.?[\s\xa0]*Sela|Sela)nikasv|\.[\s\xa0]*(?:T(?:essalonikern|hesalonikasv)|Selanikasv))|(?:Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa|Pili|2\.?)[\s\xa0]*Wathesalonik|2\.[\s\xa0]*Tessalonikalaiskirj|Toinen[\s\xa0]*Tessalonikalaiskirj|2\.[\s\xa0]*Tesalonisens|2\.?[\s\xa0]*Mga[\s\xa0]*Tesaloni[cs]ens)e|(?:Toinen|2\.)[\s\xa0]*Tessalonikalaisille|(?:Toinen|2\.?)[\s\xa0]*Kirje[\s\xa0]*tessalonikalaisille|(?:2(?:[\s\xa0]*Th(?:aissaluneekiyo|essolonia)|nd(?:\.?[\s\xa0]*Thesso|\.?[\s\xa0]*Thesa)lonia|\.[\s\xa0]*Th(?:aissaluneekiyo|essolonia))|Second[\s\xa0]*Thes(?:so|a)lonia|(?:Dezy[e\xE8]m[\s\xa0]*Tesaloniky|Tweede[\s\xa0]*Th?essalonicenz|2e(?:\.[\s\xa0]*Th?|[\s\xa0]*Th?)essalonicenz|2\.?[\s\xa0]*Thessalonicenz)e|2\.[\s\xa0]*Tessalonicenze)n|(?:2(?:(?:nd(?:(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e|\.?[\s\xa0]*Theso)|[\s\xa0]*Thes(?:[eo]|se))loni|\.[\s\xa0]*T(?:hes(?:[eo]|se)loni|esalonicz))|Dru(?:he[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*solunj|g[ai][\s\xa0]*Tesalonicz)|Second[\s\xa0]*Thesoloni|Second[\s\xa0]*Thess?eloni)an|(?:Drug[ai]|2\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|(?:Друга[\s\xa0]*С|2\.?[\s\xa0]*С)олуњанима|(?:2(?:\-?(?:а\.?|е\.?|ге\.?)|\.)?|Друг[ае])[\s\xa0]*фессалонікі[ий]ців|(?:2\-?(?:а\.?[\s\xa0]*п|е\.?[\s\xa0]*п|ге\.?[\s\xa0]*п)|Друге[\s\xa0]*п)ослання[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|Друга[\s\xa0]*послан(?:ня[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|ица[\s\xa0]*Солуњанима)|2\.?[\s\xa0]*послан(?:ня[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|ица[\s\xa0]*Солуњанима)|I(?:I(?:\.[\s\xa0]*(?:T(?:h(?:es(?:s(?:al(?:on(?:i(?:c(?:(?:i[ae]|a)n|ense)|(?:oa|e|io|aa)?n)|(?:(?:oi?|e)a|cie|aia|a)n)|lonian)|(?:elona|olon)in)|(?:aloni(?:ca|o)|elonai|al(?:lon|oni)ia|alonicie|aloni)n)s|(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)s|es(?:s(?:aloniaid|s)|aloniaid))|es(?:aloni(?:cen(?:s(?:[o\xF3]w|es)|i)|senses|ka)|s(?:alonice(?:nses|si)|zalonikaiakhoz)))|Солун(?:ьці|яни)|\xDEess|(?:list[\s\xa0]*(?:Solu[nň]s|Tesalonic)k[y\xFD]|Tes(?:salonicens|alonic)k[y\xFD])m|Tesalonicanom|Tesaloničanom|(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])|T(?:(?:hessz|\xE8s)alon|esaloni)ik)a|Th?\xEA\-?sa\-?l\xF4\-?ni\-?ca|Th\xEAxal\xF4nica|Sol(?:u(?:n(?:(?:sk[y\xFD]|[cč]ano)m|janima[\s\xa0]*Poslanica)|ňsk[y\xFD]m)|\xFAn(?:[cč]ano|sky)m)|(?:Tessalonikalaiskirj|Wathesalonik|Mga[\s\xa0]*Tesaloni[cs]ens)e|Tessalonikalaisille|Kirje[\s\xa0]*tessalonikalaisille|T(?:es(?:salonicenz|aloniky)|hessalonicenz)en|Tesaloniczan|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Солуњанима|фессалонікі[ий]ців|послан(?:ня[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|ица[\s\xa0]*Солуњанима))|[\s\xa0]*(?:T(?:h(?:es(?:s(?:al(?:on(?:i(?:c(?:(?:i[ae]|a)n|ense)|(?:oa|e|io|aa)?n)|(?:(?:oi?|e)a|cie|aia|a)n)|lonian)|(?:elona|olon)in)|(?:aloni(?:ca|o)|elonai|al(?:lon|oni)ia|alonicie|aloni)n)s|(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)s|es(?:s(?:aloniaid|s)|aloniaid))|es(?:aloni(?:cen(?:s(?:[o\xF3]w|es)|i)|senses|ka)|s(?:alonice(?:nses|si)|zalonikaiakhoz)))|Солун(?:ьці|яни)|\xDEess|(?:list[\s\xa0]*(?:Solu[nň]s|Tesalonic)k[y\xFD]|Tes(?:salonicens|alonic)k[y\xFD])m|Tesalonicanom|Tesaloničanom|(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])|T(?:(?:hessz|\xE8s)alon|esaloni)ik)a|Th?\xEA\-?sa\-?l\xF4\-?ni\-?ca|Th\xEAxal\xF4nica|Sol(?:u(?:n(?:(?:sk[y\xFD]|[cč]ano)m|janima[\s\xa0]*Poslanica)|ňsk[y\xFD]m)|\xFAn(?:[cč]ano|sky)m)|(?:Tessalonikalaiskirj|Wathesalonik|Mga[\s\xa0]*Tesaloni[cs]ens)e|Tessalonikalaisille|Kirje[\s\xa0]*tessalonikalaisille|T(?:es(?:salonicenz|aloniky)|hessalonicenz)en|Tesaloniczan|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|Солуњанима|фессалонікі[ий]ців|послан(?:ня[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|ица[\s\xa0]*Солуњанима)))|kalawang[\s\xa0]*(?:(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*Tesaloni[ck]|[\s\xa0]*Tesaloni[ck])|Tesalonik|Tesalonic)a|(?:Mga[\s\xa0]*Tesaloni[cs]|Tesaloni[cs])ense))|(?:II\.?[\s\xa0]*С|2\.?[\s\xa0]*С)олунци|(?:II\.?[\s\xa0]*С|2\.?[\s\xa0]*С)олунјани|2(?:e(?:\.[\s\xa0]*T(?:ess?|hess)|[\s\xa0]*T(?:ess?|hess))|nd(?:\.[\s\xa0]*Th(?:ess?)?|[\s\xa0]*Th(?:ess?)?)|[\s\xa0]*(?:தெச(?:லோ)?|Фес|Te(?:ss?)?)|[\s\xa0]*थिस्स(?:लोनिकी)?|[\s\xa0]*Th(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|\.[\s\xa0]*(?:T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|e(?:s(?:s(?:aloniker)?)?)?)|थिस्स(?:लोनिकी)?))|אגרת[\s\xa0]*פולוס[\s\xa0]*השנייה[\s\xa0]*אל\-?התסלונ|Β['ʹʹ΄’][\s\xa0]*Θεσ?|Anden[\s\xa0]*Thess|S[i\xED]\xF0ara[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*\xDEess|Pili[\s\xa0]*Th|D(?:ruh(?:[y\xFD][\s\xa0]*Sol|[y\xFD][\s\xa0]*Te|[a\xE1][\s\xa0]*(?:Sol|Te))|ezy[e\xE8]m[\s\xa0]*Tesalonik)|Second[\s\xa0]*Th(?:ess?)?|Tweede[\s\xa0]*Thess|Tweede[\s\xa0]*Tess?|Andre[\s\xa0]*Tess|2\.?[\s\xa0]*Сол(?:унян)?|(?:2(?:\xBA(?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])|o\.?[\s\xa0]*Tesaloni[cs]|\.[o\xBA](?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs]))|Segundo[\s\xa0]*Tesaloni[cs])ense|M[a\xE1]sodik[\s\xa0]*Th?essz(?:alonika)?|2\.?[\s\xa0]*Sol|II(?:\.[\s\xa0]*(?:T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss|e(?:s(?:sz?)?)?|s)?|e(?:s(?:aloni(?:c(?:ense|a)|sense|k)|s(?:z(?:alonika)?)?)?)?)|Сол(?:унян)?|Sol)|[\s\xa0]*(?:T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss|e(?:s(?:sz?)?)?|s)?|e(?:s(?:aloni(?:c(?:ense|a)|sense|k)|s(?:z(?:alonika)?)?)?)?)|Сол(?:унян)?|Sol))|(?:(?:2\-?(?:а\.?[\s\xa0]*п|е\.?[\s\xa0]*п|ге\.?[\s\xa0]*п)|Друге[\s\xa0]*п)ослання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|(?:2(?:\-?(?:а\.?|е\.?|ге\.?)|\.)?|Друг[ае])[\s\xa0]*до[\s\xa0]*с|2\-?(?:а\.?[\s\xa0]*С|е\.?[\s\xa0]*С|ге\.?[\s\xa0]*С)|Друг[ае][\s\xa0]*С|Друга[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|2\.?[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|II(?:\.[\s\xa0]*(?:послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?)?|[\s\xa0]*(?:послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?)?)до[\s\xa0]*с)олунян|(?:II\.?[\s\xa0]*п|2\.?[\s\xa0]*п)исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Солун|Втор(?:о[\s\xa0]*(?:послание[\s\xa0]*(?:на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Солуняни|към[\s\xa0]*солунците)|Солун(?:(?:ја|я)ни|ците)|Сол(?:унци)?|писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Солун)|а[\s\xa0]*(?:писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Солун|Сол(?:ун(?:(?:ја|я)ни|ците)|унци)?)))|(?:(?:帖(?:撒(?:罗尼迦后书|羅尼迦後書)|[后後])|得撒洛尼後書|莎倫後)》|《(?:帖(?:撒(?:罗尼迦后书|羅尼迦後書)|[后後])|得撒洛尼後書|莎倫後)|2\.?[\s\xa0]*T\xEA|II\.?[\s\xa0]*T\xEA|השנייה[\s\xa0]*אל[\s\xa0\-?]*התסלוניקים|Thessalonicenses[\s\xa0]*II|ad[\s\xa0]*Thessalonicenses[\s\xa0]*II|थेस्सलनीकाकरांस[\s\xa0]*दुसरे[\s\xa0]*पत्र|帖(?:撒(?:罗尼迦后书|羅尼迦後書)|[后後])|得撒洛尼後書|莎倫後|(?:II\.?|2\.?)[\s\xa0]*Solunjanima|Druga[\s\xa0]*(?:poslanica[\s\xa0]*)?Solunjanima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*Tessalonikerbrevet)|(?:1(?:[\s\xa0]*Tesaloni(?:k(?:yen|a)|canom)|st\.?[\s\xa0]*Thsss|[\s\xa0]*Солунците|[\s\xa0]*Tesszalonikaiakhoz|[\s\xa0]*Thesszalonikaiakhoz|\.[\s\xa0]*(?:Thesszalonikaiakhoz|Солунците))|I(?:\.?[\s\xa0]*Tesaloni(?:k(?:yen|a)|canom)|\.?[\s\xa0]*Солунците|\.?[\s\xa0]*Thesszalonikaiakhoz|\.?[\s\xa0]*Tesszalonikaiakhoz)|(?:(?:I\.?[\s\xa0]*Tesaloni[cs]ens|Kwanza[\s\xa0]*Th|1[\s\xa0]*Tesaloni[cs]ens)e|I\.?[\s\xa0]*Thss)s|I(?:\.[\s\xa0]*Thes(?:[aeo]|s[eo])|[\s\xa0]*Thes(?:[aeo]|s[eo]))lonians|I\.?[\s\xa0]*Thessalon(?:i[ao]|ai)ns|1st\.?[\s\xa0]*Thss|F(?:irst[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)s|\xF8rste[\s\xa0]*(?:tessalonikerbrev|Tessalonikerne)))|(?:I(?:\.[\s\xa0]*T(?:h(?:esszalonika|ss)|esszalonika)|[\s\xa0]*T(?:h(?:esszalonika|ss)|esszalonika))|1[\s\xa0]*Tesszalonika|First[\s\xa0]*Thss)|(?:《(?:帖(?:撒(?:罗尼迦前书|羅尼迦前書)|前)|得撒洛尼前書|莎倫前)》|살전|Ⅰ[\s\xa0]*テサロニケ人へ|テサロニケ(?:人への(?:手紙[Ⅰ一]|前の書|第一の手紙)|[\s\xa0]*1|前書|の信徒への手紙一)|ﺍﻻﻭﻝ[\s\xa0]*ﺗﺴﺎﻟﻮﻧﻴﻜﻲ|Α['ʹʹ΄’][\s\xa0]*Θεσσαλονικε[ίι]ς|데살로니가[1전]서|테살로니카(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*첫째[\s\xa0]*서간|1서)|Kwanza[\s\xa0]*The|Προς[\s\xa0]*Θεσσαλονικε[ίι]ς[\s\xa0]*Α['ʹʹ΄’]|Una(?:ng)?[\s\xa0]*Tesalonica|ਥ(?:ਸੱ|ੱਸ)ਲੁਨੀਕੀਆਂ[\s\xa0]*ਨੂੰ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੱਤ੍ਰੀ|ଥେସଲନୀକୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|האיגרת[\s\xa0]*הראשונה[\s\xa0]*אל[\s\xa0]*התסלוניקים|אגרת[\s\xa0]*פולוס[\s\xa0]*הראשונה[\s\xa0]*אל\-?התסלוניקים|Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kwa[\s\xa0]*Wathesalonik[ei]|पौलाचे[\s\xa0]*थेस्सलनीकाकरांस[\s\xa0]*पहिले[\s\xa0]*पत्र|थिस्सलोनिकीहरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?हिलो[\s\xa0]*पत्र|tʰ(?:issalunīkiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|assalunīkīāṃ[\s\xa0]*nū̃[\s\xa0]*pahilī[\s\xa0]*pattrī)|F(?:yrra[\s\xa0]*\xDEessalon[i\xED]kubr[e\xE9]f|irst[\s\xa0]*Th(?:ess)?s)|Wathesalonike[\s\xa0]*I|Epistula[\s\xa0]*ad[\s\xa0]*Thessalonicenses[\s\xa0]*I|تھ(?:س(?:ّلنیکیوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|لنیکیوں[\s\xa0]*کے[\s\xa0]*نام)|ِسّلُنیکیوں[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|الرسالة[\s\xa0]*الأولى[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*تسالونيكي|رسالة[\s\xa0]*(?:بولس[\s\xa0]*الرسول[\s\xa0]*الأولى[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*تسالونيكي|تسالونيكي[\s\xa0]*الأولى)|First[\s\xa0]*Thessalon(?:i[ao]|ai)n|I(?:\.[\s\xa0]*T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)n|[sz])|alonian)|s)|essz)|[\s\xa0]*T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)n|[sz])|alonian)|s)|essz))|தெசலோனிக்க(?:ேயருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதலாம்[\s\xa0]*கடித|ருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதல்[\s\xa0]*திருமுக|ியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதலாவது[\s\xa0]*நிருப)ம்|I\.?[\s\xa0]*Tesaloni(?:c(?:en(?:se|i)|a)|k)|ପ୍ରଥମ[\s\xa0]*ଥେସଲନୀକୀୟଙ|I\.?[\s\xa0]*Солуняни|(?:اوّل|۱)۔تھسلنیکیوں|(?:اوّل|۱)\-?تھِسّلُنیکیوں|(?:اوّل|۱)[\s\xa0]*تھ(?:ِسلُ|سّل)نیکیوں|F\xF8rste[\s\xa0]*Thessalonikerbrev|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloniai|Tesoloniika[\s\xa0]*Kowaa)d|(?:F\xF8rste[\s\xa0]*Tessalonik|Erste[\s\xa0]*Thessalonich)er|(?:Pierwsz[aey][\s\xa0]*Tesalonicens[o\xF3]|I\.?[\s\xa0]*Tesalonicens[o\xF3])w|Primer(?:o[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])enses|Els[oő][\s\xa0]*Th?esszalonikaiakhoz|Prim(?:a[\s\xa0]*lettera[\s\xa0]*ai|o|a)[\s\xa0]*Tessalonicesi|(?:(?:I(?:\.[\s\xa0]*Thes(?:salon(?:i(?:oa|e|aa|ca)|aia)|alonio)|[\s\xa0]*Thes(?:salon(?:i(?:oa|e|aa|ca)|aia)|alonio))|First[\s\xa0]*Thes(?:salon(?:i[ao]|ai)a|salonie|alonio)|First[\s\xa0]*Thessalonica|I\.?[\s\xa0]*Thesalonica|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e|First[\s\xa0]*Thess?e)lonai|(?:I(?:\.[\s\xa0]*Thes(?:alonii|salone)|[\s\xa0]*Thes(?:alonii|salone))|First[\s\xa0]*Thes(?:aloni[ci]|salone)|(?:I(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|First[\s\xa0]*Thess?)alloni)a|(?:First|I\.?)[\s\xa0]*Thessalonoi?a|I\.?[\s\xa0]*Thesalonicie|(?:Premi(?:\xE8re|ere?)[\s\xa0]*Thess?aloni|(?:First|I\.?)[\s\xa0]*Thessalon|Premi(?:\xE8re|ere?)s[\s\xa0]*Thess?aloni)cie|(?:First|I\.?)[\s\xa0]*Thessaloniio)n|(?:I(?:\.[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni)|[\s\xa0]*Thes(?:s(?:alon[ai]|oloni)|aloni))|First[\s\xa0]*Thes(?:(?:s?a|so)loni|salona))n|I\.?[\s\xa0]*\xDEes|(?:First|I\.?)[\s\xa0]*Thessalonici[ae]n|(?:Epistula[\s\xa0]*I[\s\xa0]*ad[\s\xa0]*Th|Primeir[ao][\s\xa0]*T)essalonicense|I\.?[\s\xa0]*Thessalonicense)s|I\.?[\s\xa0]*Tessalonice(?:nses|si)|F[o\xF6]rsta[\s\xa0]*Th?essalonikerbrevet|(?:Prv(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Sol[u\xFA]|[y\xE1\xFD][\s\xa0]*Sol[u\xFA]|a[\s\xa0]*Sol\xFA)nsky|Tecal[oō][nṉ]ikkiyarukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]vatu[\s\xa0]*Nirupa|Prva[\s\xa0]*Solunsky|(?:(?:Prv(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*T|[ay\xE1\xFD][\s\xa0]*T)esalo|I\.?[\s\xa0]*Tesalo)nic|I\.?[\s\xa0]*Tessalonicens)k[y\xFD]|(?:(?:Prvn(?:[i\xED][\s\xa0]*Tessalonicen|[i\xED][\s\xa0]*Solu[nň])|(?:Prvn[i\xED]|I\.?)[\s\xa0]*list[\s\xa0]*Solu[nň])s|(?:(?:Prvn[i\xED]|I\.?)[\s\xa0]*list[\s\xa0]*Tesa|Prvn[i\xED][\s\xa0]*Tesa)lonic)k[y\xFD])m|Prv(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*T|[ay\xE1\xFD][\s\xa0]*T)esalonicanom|(?:Prv(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Tesalonič|[ay\xE1\xFD][\s\xa0]*Tesalonič|a[\s\xa0]*Solun[cč])|I\.?[\s\xa0]*Tesalonič|Prv(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Sol[u\xFA]|[y\xE1\xFD][\s\xa0]*Sol[u\xFA]|a[\s\xa0]*Sol\xFA)n[cč])anom|(?:tʰ(?:issalonik[iī]har[uū]l[aā][iī][\s\xa0]*pahilo|essalan[iī]k[aā]kar[aā][mṃ]s[\s\xa0]*pahile)[\s\xa0]*patr|Una(?:ng)?[\s\xa0]*Tesalonik|Fyrra[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*\xDEessalon[i\xED]kumann|Pavlova[\s\xa0]*prva[\s\xa0]*poslanica[\s\xa0]*Solunjanim|I(?:\.?[\s\xa0]*T\xE8salon|\.?[\s\xa0]*Tesaloni)ik|(?:I(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)|Una(?:ng)?[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Tesaloni[ck])a|I(?:\.?[\s\xa0]*Th\xEA|\.?[\s\xa0]*T\xEA)\-?sa\-?l\xF4\-?ni\-?ca|I\.?[\s\xa0]*Th\xEAxal\xF4nica|Prva[\s\xa0]*Solunjanima[\s\xa0]*Poslanica|I\.?[\s\xa0]*Sol(?:u(?:n(?:(?:sk[y\xFD]|[cč]ano)m|janima[\s\xa0]*Poslanica)|ňsk[y\xFD]m)|\xFAn(?:[cč]ano|sky)m)|(?:Paulus(?:’[\s\xa0]*(?:f\xF8rste[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*t|1[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th|1\.[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th|F\xF8rste[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th)|\'[\s\xa0]*(?:F\xF8rste|1\.?)[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Th)essalonikern|Koiro[\s\xa0]*Tasalonqq|(?:(?:Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kw|Kwanz)a|I\.?)[\s\xa0]*Wathesalonik|(?:Ensimm[a\xE4]inen[\s\xa0]*Tessalonik|I\.?[\s\xa0]*Tessalonik)alaiskirj|Una(?:ng)?[\s\xa0]*Tesalonicens|(?:Una(?:ng)?[\s\xa0]*Tesalo|I\.?[\s\xa0]*Tesalo)nisens|(?:Una(?:ng)?[\s\xa0]*M|I\.?[\s\xa0]*M)ga[\s\xa0]*Tesaloni[cs]ens)e|(?:Ensimm[a\xE4]inen[\s\xa0]*Tessalonik|I\.?[\s\xa0]*Tessalonik)alaisille|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Kirje[\s\xa0]*tessalonikalaisille|(?:(?:Eerste[\s\xa0]*Th?essalonicenz|Premye[\s\xa0]*Tesaloniky|I\.?[\s\xa0]*Thessalonicenz)e|(?:First[\s\xa0]*Thes(?:so|a)|I\.?[\s\xa0]*Thesso)lonia|I\.?[\s\xa0]*Tessalonicenze)n|(?:P(?:er[sš]e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*solunj|ierwsz[aey][\s\xa0]*Tesalonicz)|First[\s\xa0]*Thesoloni|First[\s\xa0]*Thess?eloni|I(?:\.[\s\xa0]*Thes(?:[eo]|se)|[\s\xa0]*Thes(?:[eo]|se))loni|I\.?[\s\xa0]*Tesalonicz)an|(?:Pierwsz[aey]|I\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|1(?:[\s\xa0]*(?:T(?:e(?:s(?:aloni(?:c(?:en(?:se|i)|a)|k)|sz)|cal[oō][nṉ]ikkiyarukku)|a?s)|தெசலோனிக்க(?:ேய)?ர்|تس|ธส|ਥੱਸਲੁਨੀਕੀਆਂ[\s\xa0]*ਨੂੰ|थेस्सलनीकाकरांस|tʰassalunīkīāṃ)|st(?:\.[\s\xa0]*Th(?:ess)?|[\s\xa0]*Th(?:ess)?)s|테살|[\s\xa0]*เธ[ซส]ะโลนิกา|[\s\xa0]*ଥେସଲନୀକୀୟଙ|[\s\xa0]*Солуняни|۔تھسلنیکیوں|\-?تھِسّلُنیکیوں|[\s\xa0]*تھ(?:ِسلُ|سّل)نیکیوں|[\s\xa0]*थिस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|[\s\xa0]*Фессалоники[ий]цам|(?:\-?(?:е\.?|я\.?)|[ея]\.?)[\s\xa0]*Фессалоники[ий]цам|(?:\-?(?:е\.?|я\.?)|[ея]\.?)?[\s\xa0]*к[\s\xa0]*Фессалоники[ий]цам|[\s\xa0]*tessalonikerbrev|[\s\xa0]*tʰissalonik[iī]har[uū]l[aā][iī]|[\s\xa0]*Thes(?:s(?:aloni(?:cher|aid)|s)|aloniaid)|[\s\xa0]*Tesalonicens[o\xF3]w|(?:st(?:(?:\.?[\s\xa0]*Thesso|\.?[\s\xa0]*Thesa|\.?[\s\xa0]*Theso|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e)lonia|\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)n|[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|(?:\xBA(?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])|o\.?[\s\xa0]*Tesaloni[cs])ense)s|\xB0\.?[\s\xa0]*Tessalonicesi|(?:(?:st(?:\.[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|[\s\xa0]*Thes(?:saloni(?:ca|e)|alonio)|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)elonai|(?:\.[\s\xa0]*Thes(?:aloni[ci]|salone)|[\s\xa0]*Thes(?:aloni[ci]|salone)|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alloni)a|\.?[\s\xa0]*Thessalonoi?a)|(?:er(?:e(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)|\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloni|\xE8?re(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)aloni|st\.?[\s\xa0]*Thessalon)cie|st(?:\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)a|st\.?[\s\xa0]*Thessaloniio)n|[\s\xa0]*tʰessalan[iī]k[aā]kar[aā][mṃ]|st(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)alonin|(?:[\s\xa0]*\xDE|Th)es|st\.?[\s\xa0]*Thessolonin|st\.?[\s\xa0]*Thessalonan|st\.?[\s\xa0]*Thessalonici[ae]n|(?:a\.?[\s\xa0]*Tess|o\.?[\s\xa0]*Tess)alonicense|[\s\xa0]*Thes(?:s(?:al(?:on(?:i(?:c(?:(?:i[ae]|a)n|ense)|(?:oa|e|io|aa)?n)|(?:(?:oi?|e)a|cie|aia|a)n)|lonian)|(?:elona|olon)in)|(?:aloni(?:ca|o)|elonai|al(?:lon|oni)ia|alonicie|aloni)n))s|[\s\xa0]*Tessalonice(?:nses|si)|[\s\xa0]*Thessalonikerbrevet|[\s\xa0]*(?:(?:(?:k\.?[\s\xa0]*)?Tesalonic|Tessalonicens)k[y\xFD]|k(?:\.[\s\xa0]*Sol[u\xFA]|[\s\xa0]*Sol[u\xFA])nsky|list[\s\xa0]*(?:Solu[nň]s|Tesalonic)k[y\xFD])m|[\s\xa0]*k\.?[\s\xa0]*Tesalonicanom|[\s\xa0]*(?:k(?:\.[\s\xa0]*Sol[u\xFA]|[\s\xa0]*Sol[u\xFA])n[cč]|(?:k\.?[\s\xa0]*)?Tesalonič)anom|[\s\xa0]*(?:T(?:(?:aga\-?Tesal[o\xF3]|esal\xF3)ni[ck]|(?:\xE8salon|esaloni|hesszalon)ik)|Mga[\s\xa0]*Taga(?:\-?(?:Tesal[o\xF3]ni[ck]|[\s\xa0]*Tesaloni[ck])|[\s\xa0]*Tesaloni[ck]))a|[\s\xa0]*Th?\xEA\-?sa\-?l\xF4\-?ni\-?ca|[\s\xa0]*Th\xEAxal\xF4nica|[\s\xa0]*Sol(?:u(?:n(?:(?:sk[y\xFD]|[cč]ano)m|janima[\s\xa0]*Poslanica)|ňsk[y\xFD]m)|\xFAn(?:[cč]ano|sky)m)|[\s\xa0]*(?:Tessalonikern|Wathesalonik|Tessalonikalaiskirj|Tesalonisens|Mga[\s\xa0]*Tesaloni[cs]ens|Thesalonikasv|[ei]\.?[\s\xa0]*Thesalonikasv|[ei]\.?[\s\xa0]*Selanikasv|Selanikasv)e|[\s\xa0]*Tessalonikalaisille|[\s\xa0]*Kirje[\s\xa0]*tessalonikalaisille|(?:(?:e(?:\.[\s\xa0]*Th?|[\s\xa0]*Th?)|[\s\xa0]*Th)essalonicenze|[\s\xa0]*Thaissaluneekiyo|[\s\xa0]*Tessalonicenze)n|[\s\xa0]*Tesaloniczan|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan|\.(?:[\s\xa0]*(?:T(?:h(?:es(?:s(?:al(?:on(?:i(?:c(?:(?:i[ae]|a)n|ense)|(?:oa|e|io|aa)?n)|(?:(?:oi?|e)a|cie|aia|a)n)|lonian)|(?:elona|olon)in)|(?:aloni(?:ca|o)|elonai|al(?:lon|oni)ia|alonicie|aloni)n)s|(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)s|es(?:s(?:aloni(?:cher|aid)|s)|aloniaid)|essalonikerbrevet)|es(?:s(?:aloni(?:ce(?:nses|si)|kerbrevet)|zalonikaiakhoz)|aloni(?:cen(?:s(?:[o\xF3]w|es)|i)|senses|ka)))|เธ[ซส]ะโลนิกา|ଥେସଲନୀକୀୟଙ|Солуняни|تھ(?:ِسلُ|سّل)نیکیوں|थिस(?:्सल(?:ोनिकीहरूलाई|ुनीकियों)|लुनिकी)|Фессалоники[ий]цам|к[\s\xa0]*Фессалоники[ий]цам|t(?:ʰissalonik[iī]har[uū]l[aā][iī]|essalonikerbrev)|\xDEess|(?:list[\s\xa0]*(?:Solu[nň]s|Tesalonic)k[y\xFD]|Tes(?:salonicens|alonic)k[y\xFD])m|Tesalonicanom|Tesaloničanom|(?:T(?:(?:aga\-?Tesal[o\xF3]|esal\xF3)ni[ck]|(?:(?:hessz|\xE8s)alon|esaloni)ik)|Mga[\s\xa0]*Taga(?:\-?(?:Tesal[o\xF3]ni[ck]|[\s\xa0]*Tesaloni[ck])|[\s\xa0]*Tesaloni[ck]))a|Th?\xEA\-?sa\-?l\xF4\-?ni\-?ca|Th\xEAxal\xF4nica|Sol(?:u(?:n(?:(?:sk[y\xFD]|[cč]ano)m|janima[\s\xa0]*Poslanica)|ňsk[y\xFD]m)|\xFAn(?:[cč]ano|sky)m)|(?:Tessalonik(?:alaiskirj|ern)|Wathesalonik|Mga[\s\xa0]*Tesaloni[cs]ens|Thesalonikasv|Selanikasv)e|Tessalonikalaisille|Kirje[\s\xa0]*tessalonikalaisille|T(?:h(?:aissaluneekiyo|essalonicenze)|es(?:salonicenz|aloniky)e)n|Tesaloniczan|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tesaloniczan)|[o\xBA](?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])enses|(?:\-?تھِسّلُ|۔تھسل)نیکیوں))|(?:1\.?[\s\xa0]*С|I\.?[\s\xa0]*С)олуньці|1\-?е\.?[\s\xa0]*Солуньці|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*фессалонікі[ий]ців|(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)ослання[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|1\-?е\.?[\s\xa0]*послання[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|1\-?(?:ше|а)[\s\xa0]*(?:послання[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|фессалонікі[ий]ців|Солуньці)|1\-?(?:ше|а)\.[\s\xa0]*(?:послання[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|фессалонікі[ий]ців|Солуньці)|(?:1\.?[\s\xa0]*С|I\.?[\s\xa0]*С)олунци|(?:1\.?[\s\xa0]*С|I\.?[\s\xa0]*С)олунјани|(?:1\.?[\s\xa0]*С|I\.?[\s\xa0]*С)олуњанима|(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)осланица[\s\xa0]*Солуњанима|1(?:st(?:(?:\.?[\s\xa0]*Thesso|\.?[\s\xa0]*Thesa|\.?[\s\xa0]*Theso|(?:\.[\s\xa0]*Thess?|[\s\xa0]*Thess?)e)lonia|\.[\s\xa0]*Thessaloni[ao]|[\s\xa0]*Thessaloni[ao]|\.?[\s\xa0]*Thessalonai)n|[\s\xa0]*Th(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss)|(?:\xBA(?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])|o\.?[\s\xa0]*Tesaloni[cs])ense|e(?:\.[\s\xa0]*T(?:ess?|hess)|[\s\xa0]*T(?:ess?|hess))|st(?:\.[\s\xa0]*Th(?:ess?)?|[\s\xa0]*Th(?:ess?)?)|[\s\xa0]*(?:Te(?:s(?:s(?:aloniker)?)?)?|தெச(?:லோ)?|Фес)|[\s\xa0]*Сол(?:унян)?|[\s\xa0]*थिस्स(?:लोनिकी)?|[\s\xa0]*Th(?:e(?:s(?:s(?:alonikerbrev|z)?)?)?|s)?|[\s\xa0]*Sol|\.(?:[\s\xa0]*(?:T(?:h(?:es(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|ss|e(?:s(?:s(?:alonikerbrev|z)?)?)?|s)?|e(?:s(?:aloni(?:c(?:ense|a)|sense|k)|s(?:z(?:alonika)?|aloniker)?)?)?)|थिस्स(?:लोनिकी)?|Сол(?:унян)?|Sol)|[o\xBA](?:\.[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])ense))|F(?:yrra[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*\xDEessa|irst[\s\xa0]*Th(?:ess?)?|\xF8rste[\s\xa0]*Th?ess)|אגרת[\s\xa0]*פולוס[\s\xa0]*הראשונה[\s\xa0]*אל\-?התסלו|Α['ʹʹ΄’][\s\xa0]*Θεσ?|Kwanza[\s\xa0]*Th|Pr(?:vn[i\xED][\s\xa0]*(?:Sol|Te)|emye[\s\xa0]*Tesalonik)|I(?:\.[\s\xa0]*T(?:h(?:e(?:ss?)?)?|e(?:ss?)?)|[\s\xa0]*T(?:h(?:e(?:ss?)?)?|e(?:ss?)?))|Eerste[\s\xa0]*T(?:ess?|hess)|I\.?[\s\xa0]*Сол(?:унян)?|Primer(?:o[\s\xa0]*Tesaloni[cs]|[\s\xa0]*Tesaloni[cs])ense|Els[oő][\s\xa0]*Th?essz(?:alonika)?|I\.?[\s\xa0]*Sol|(?:(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)ослання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*до[\s\xa0]*с|1\-?е\.?[\s\xa0]*С|1\-?е\.?[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|1\-?(?:ше|а)[\s\xa0]*(?:послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|до[\s\xa0]*с|С)|1\-?(?:ше|а)\.[\s\xa0]*(?:послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|до[\s\xa0]*с|С))олунян|(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Солун|П(?:ерш[ае][\s\xa0]*(?:послання[\s\xa0]*до[\s\xa0]*(?:фессалонікі[ий]|салонікі[ий])ців|фессалонікі[ий]ців|Солуньці)|ърв(?:о[\s\xa0]*(?:послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*)?|а[\s\xa0]*)Солуняни|ърв[ао][\s\xa0]*Солунците|ърво[\s\xa0]*послание[\s\xa0]*към[\s\xa0]*солунците|ърв(?:а[\s\xa0]*Сол(?:унци)?|о[\s\xa0]*Сол(?:унци)?)|ерш[ае][\s\xa0]*(?:послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*|апостола[\s\xa0]*Павла[\s\xa0]*)?до[\s\xa0]*с|до[\s\xa0]*с|С)олунян|рв(?:а[\s\xa0]*(?:п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Солун|осланица[\s\xa0]*Солуњанима)|Солу(?:н(?:ците|јани)|њанима))|о[\s\xa0]*(?:писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Солун|Солун(?:ците|јани)))))|(?:Thes(?:s(?:al(?:on(?:i(?:[ao]a|io|[ao]|c(?:i[ae]|a))?|cie|ea|oi?a|aia|ai?)|lonia)|[eo]lonia|oloni|elonai)|al(?:oni[ci]|loni)a|alonio|elonai|[aeo]lonia|aloni)ns|(?:帖(?:撒(?:罗尼迦前书|羅尼迦前書)|前)|得撒洛尼前書|莎倫前)》|《(?:帖(?:撒(?:罗尼迦前书|羅尼迦前書)|前)|得撒洛尼前書|莎倫前)|[1I]\.?[\s\xa0]*T\xEA|הראשונה[\s\xa0]*אל[\s\xa0]*התסלוניקים|Thessalonicenses[\s\xa0]*I|ad[\s\xa0]*Thessalonicenses[\s\xa0]*I|थेस्सलनीकाकरांस[\s\xa0]*पहिले[\s\xa0]*पत्र|Thes(?:s(?:alon(?:i[ao]|ai)|[eo]lonia)|[aeo]lonia)n|帖(?:撒(?:罗尼迦前书|羅尼迦前書)|前)|得撒洛尼前書|莎倫前|[1I]\.?[\s\xa0]*Solunjanima|Prva[\s\xa0]*(?:poslanica[\s\xa0]*)?Solunjanima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:(?:2(?:nd(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)g|[\s\xa0]*R(?:ey?|y)e)|Second[\s\xa0]*Ki?g)s|2[\s\xa0]*Reg(?:um|i)|4[\s\xa0]*Цар(?:ів|е)|4[\s\xa0]*Царства|4\.[\s\xa0]*Царства|(?:2nd(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)|Second[\s\xa0]*Ki?)ng?s|2[\s\xa0]*Kraljevima|2[\s\xa0]*Kralovsk[a\xE1]|2[\s\xa0]*Kr\xE1lovsk[a\xE1]|2\.[\s\xa0]*Kr[a\xE1]lovsk[a\xE1]|I(?:I(?:[\s\xa0]*(?:K(?:i(?:(?:ng?|g)?s|r[a\xE1]lyok)|oningen|gs|ng?s|r(?:[o\xF3]lewska|\xE1ľov|a(?:ljevima|ľov))|ralovsk[a\xE1]|r\xE1lovsk[a\xE1])|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1])|\.[\s\xa0]*Kr[a\xE1]lovsk[a\xE1])|V\.?[\s\xa0]*Царства))|(?:(?:II[\s\xa0]*Kr[a\xE1]|2[\s\xa0]*Kr[a\xE1])lov|2nd[\s\xa0]*Ki?ng|2nd\.[\s\xa0]*Ki?ng|Second[\s\xa0]*Ki?ng)|(?:2[\s\xa0]*(?:இராஜாக|அரசர)்கள்)|(?:2(?:[\s\xa0]*(?:R(?:e(?:[egs]|y[es])|y[es]|s)|مل|அர|இராஜா|ਰਾਜਿਆਂ|الملوك|राजे|Ir[aā]j[aā]kka[lḷ]|r(?:ā(?:jiāṃ|ǳe)|aǳe)|Kr(?:[a\xE1]l|[lľ]))|\-?(?:е(?:\.[\s\xa0]*Царе[ий]|[\s\xa0]*Царе[ий])|я\.?[\s\xa0]*Царе[ий])|[ея]\.?[\s\xa0]*Царе[ий]|열왕|\-?سلاطِین|[\s\xa0۔]*سلاطین|[\s\xa0]*Царе[ий]|[\s\xa0]*ରାଜାବଳୀର|[\s\xa0]*राजा(?:हरूको|ओं)|[\s\xa0]*พ(?:งศ์กษัตริย์|กษ)|[\s\xa0]*Kongebo[gk]|\.(?:[\s\xa0]*(?:Царе[ий]|سلاطین|ରାଜାବଳୀର|राजा(?:हरूको|ओं)|พ(?:งศ์กษัตริย์|กษ)|Kongebo[gk])|(?:\-?سلاطِ|۔سلاط)ین))|列(?:王(?:記(?:[Ⅱ下]|第四巻)|紀略下|[\s\xa0]*2)|下)|열왕기(?:[\s\xa0]*하권|하)|Ⅱ列王|왕하|《(?:列王[紀纪记]|王)下》|מלכים[\s\xa0]*ב['’]|दुसरे[\s\xa0]*राजे|Β['ʹʹ΄’][\s\xa0]*Βασιλ[έε]ων|ﺍﻟﻤﻠﻮﻙ[\s\xa0]*ﺍﻟﺜﺎﻧﻲ|الممالك[\s\xa0]*الرابع|سفر[\s\xa0]*الملوك[\s\xa0]*الثاني|ਰਾਜਿਆਂ[\s\xa0]*ਦੀ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੋਥੀ|Βασιλει[ωώ]ν[\s\xa0]*Δ['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Βασιλ[έε]ων[\s\xa0]*Β['ʹʹ΄’]|rājiāṃ[\s\xa0]*dī[\s\xa0]*dūjī[\s\xa0]*potʰī|(?:دوم|۲)\-?سلاطِین|(?:دوم[\s\xa0۔]*|۲[\s\xa0۔]*)سلاطین|ଦ୍ୱିତୀୟ[\s\xa0]*ରାଜାବଳୀର|2nd\.?[\s\xa0]*K(?:i[gns]|[gns])|Second[\s\xa0]*K(?:i[gns]|[gns])|4\.[\s\xa0]*Царе|4\.?[\s\xa0]*Regi|(?:Pili|2\.?)[\s\xa0]*Fal|(?:Liber[\s\xa0]*II[\s\xa0]*Reg|4\.?[\s\xa0]*Regnor)um|2\.[\s\xa0]*Reg(?:um|i)|2\.?[\s\xa0]*Царев[аи]|(?:(?:(?:2\.?[\s\xa0]*M|4\.?[\s\xa0]*M)ga|2\.?)[\s\xa0]*Har|2[\s\xa0]*Imp[aă]ra[tţ]|2(?:\.[\s\xa0]*[I\xCE]|[\s\xa0]*\xCE)mp[aă]ra[tţ])i|2[\s\xa0]*Boqorradii|Boqorradii[\s\xa0]*Labaad|2[\s\xa0]*Breninoedd|2[\s\xa0]*Brenhinoedd|2\.[\s\xa0]*B(?:renh?inoedd|oqorradii)|2\.?[\s\xa0]*Kgs|2\.?[\s\xa0]*Kng?s|S[i\xED]\xF0ari[\s\xa0]*Konungab[o\xF3]k|Andre[\s\xa0]*Kongebok|M[a\xE1]sodik[\s\xa0]*Kir[a\xE1]lyok|2\.?[\s\xa0]*Ki(?:(?:ng?|g)?s|r[a\xE1]lyok)|I(?:I(?:\.[\s\xa0]*(?:(?:[I\xCE]mp[aă]ra[tţ]|(?:Mga[\s\xa0]*)?Har)i|Reg(?:um|i)|Fal|Царев[аи]|B(?:renh?inoedd|oqorradii)|K(?:i(?:(?:ng?|g)?s|r[a\xE1]lyok)|(?:ng?|g)s))|[\s\xa0]*(?:K(?:i(?:[gr]|ng)|on|g|ng)|Regi|Kr[a\xE1]l|Fal|Царев[аи]|(?:[I\xCE]mp[aă]ra[tţ]|(?:Mga[\s\xa0]*)?Har)i|B(?:renh?inoedd|oqorradii)))|(?:(?:ka(?:lawang|apat)|V\.?)[\s\xa0]*Mga|kalawang)[\s\xa0]*Hari|V(?:\.[\s\xa0]*(?:Regi|Царе)|[\s\xa0]*(?:Regi|Царе)|\.?[\s\xa0]*Regnorum))|ରାଜାବଳୀର[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପୁସ୍ତକ|Втор[ао][\s\xa0]*Цареви|(?:4(?:(?:\-?[ея](?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)|[ея](?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)|[\s\xa0]*|[\s\xa0]*Книга[\s\xa0]*|\.[\s\xa0]*Книга[\s\xa0]*)Царст|\.[\s\xa0]*Цар(?:ст|і))|IV(?:\.[\s\xa0]*Цар(?:ст|і)|[\s\xa0]*Цар(?:ст|і)))в|(?:2(?:\-?(?:а(?:\.[\s\xa0]*(?:книга[\s\xa0]*)?|[\s\xa0]*(?:книга[\s\xa0]*)?)|е(?:\.?[\s\xa0]*книга|\.)?[\s\xa0]*|ге(?:\.[\s\xa0]*(?:книга[\s\xa0]*)?|[\s\xa0]*(?:книга[\s\xa0]*)?))|[\s\xa0]*|\.[\s\xa0]*)|Друг(?:а[\s\xa0]*(?:книга[\s\xa0]*)?|е[\s\xa0]*(?:книга[\s\xa0]*)?)|2\.?[\s\xa0]*книга[\s\xa0]*|II(?:\.[\s\xa0]*(?:книга[\s\xa0]*)?|[\s\xa0]*(?:книга[\s\xa0]*)?))царів|(?:(?:Друга|2\.?|II\.?)[\s\xa0]*о[\s\xa0]*цар|(?:IV\.?|4\.?)[\s\xa0]*краљ)евима|(?:Друга[\s\xa0]*(?:краљ|Цар)|2\.?[\s\xa0]*краљ|II\.?[\s\xa0]*краљ)ева|(?:IV\.?|4\.?)[\s\xa0]*краљевства|(?:II\.?[\s\xa0]*к|2\.?[\s\xa0]*к|Втор[ао][\s\xa0]*к)нига[\s\xa0]*за[\s\xa0]*царевите|4\.?[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*царете|IV\.?[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*царете|Четв(?:ърт(?:а[\s\xa0]*(?:Цар(?:ства|е)|книга[\s\xa0]*Царства|Книга[\s\xa0]*на[\s\xa0]*царете)|о[\s\xa0]*(?:Книга[\s\xa0]*на[\s\xa0]*царете|Цар(?:ства|е)))|рта[\s\xa0]*краљевима|ерта[\s\xa0]*Царів|рта[\s\xa0]*краљевства)|2[\s\xa0]*salāṭīn|(?:2(?:\.[\s\xa0]*K(?:on)?|[\s\xa0]*K(?:on)?)u|Andra[\s\xa0]*K(?:on)?u)ngaboken|2\.?[\s\xa0]*Koningen|II\.[\s\xa0]*Koningen|2e\.?[\s\xa0]*Koningen|Tweede[\s\xa0]*Koningen|Anden[\s\xa0]*Kongebog|4\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|Fjerde[\s\xa0]*Kongerigernes[\s\xa0]*Bog|II[\s\xa0]*a[\s\xa0]*[I\xCE]mp[aă]ra[tţ]ilor|Cartea[\s\xa0]*(?:a[\s\xa0]*patra|IV)[\s\xa0]*a[\s\xa0]*Regilor|(?:2(?:[\s\xa0]*Rei|Kg|\.[\s\xa0]*Rei|o[\s\xa0]*Rei|o\.[\s\xa0]*Rei)|Segundo[\s\xa0]*Rei|(?:Quart[ao]|4[ao]\.?)[\s\xa0]*Reino|4\.?[\s\xa0]*Reino|(?:2(?:\.(?:[o\xBA]\.?)?|\xBA\.?|o|o\.)|Segundo)[\s\xa0]*Reye|I(?:I(?:\.[\s\xa0]*Re(?:ye|i)|[\s\xa0]*Re(?:ye|i))|V\.?[\s\xa0]*Reino)|(?:IV\.?|4\.?)[\s\xa0]*Kingdom|4th[\s\xa0]*Kingdom|4th\.[\s\xa0]*Kingdom|Fourth[\s\xa0]*Kingdom)s|(?:2(?:\.?[\s\xa0]*Ro|a[\s\xa0]*Re|a\.[\s\xa0]*Re)|Segunda[\s\xa0]*Re|II\.?[\s\xa0]*Ro)is|2e\.?[\s\xa0]*Rois|2(?:\xE8me|de?|eme)[\s\xa0]*Rois|2(?:\xE8me|de?|eme)\.[\s\xa0]*Rois|2(?:[\s\xa0]*r(?:āǳ[aā]|aǳ[aā])har[uū]|\.[\s\xa0]*r[aā]ǳ[aā]har[uū])ko|(?:(?:2\-?(?:а\.?[\s\xa0]*C|е\.?[\s\xa0]*C|ге\.?[\s\xa0]*C)|Друг[ае][\s\xa0]*C|2\.?[\s\xa0]*C)ari|2\.[\s\xa0]*Kr[a\xE1]lo|II(?:\.[\s\xa0]*(?:Kr[a\xE1]lo|Cari)|[\s\xa0]*Cari))v|(?:2(?:\.[\s\xa0]*Kr[a\xE1]|[\s\xa0]*Kr[a\xE1])|II\.[\s\xa0]*Kr[a\xE1])ľov|(?:IV\.?|4\.?)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:Štvrt[a\xE1][\s\xa0]*kniha|[24][\s\xa0]*k\.|Stvrt[a\xE1][\s\xa0]*kniha|Stvrt[a\xE1]|Štvrt[a\xE1]|[24][\s\xa0]*k)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:(?:II|2)\.|2)[\s\xa0]*kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]|2[\s\xa0]*Kaw|(?:II\.?|2\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w|D(?:ru(?:h(?:(?:[y\xFD][\s\xa0]*list[\s\xa0]*Kr[a\xE1][lľ]|[y\xFD][\s\xa0]*Kr[a\xE1]ľ)ov|[y\xFD][\s\xa0]*Kr[a\xE1]lovsk[a\xE1]|[y\xFD][\s\xa0]*kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*(?:kr[a\xE1]lovsk[a\xE1]|Kr[a\xE1][lľ]ov)|Kr(?:[a\xE1]lovsk[a\xE1]|[a\xE1]ľov)))|g(?:a[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])|i[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3]))w)|e(?:zy[e\xE8]m[\s\xa0]*liv[\s\xa0]*Wa[\s\xa0]*yo|uxi[e\xE8]mes?[\s\xa0]*Rois))|राजा(?:ओ[\s\xa0]*का[\s\xa0]*विर्तान्त[\s\xa0]*[2२]रा[\s\xa0]*भाग|हरूको[\s\xa0]*दोस्रो[\s\xa0]*पुस्तक)|(?:Wafalme|Regum)[\s\xa0]*II|(?:2(?:[\s\xa0]*(?:(?:[ei]\.?[\s\xa0]*Mbret[e\xEB]|Mbret[e\xEB])rv|K\xF6nig|Koe?nig)|\.[\s\xa0]*(?:K(?:\xF6|oe?)nig|Mbret[e\xEB]rv))|4(?:[\s\xa0]*[ei]\.?[\s\xa0]*Mbret[e\xEB]|\.?[\s\xa0]*Mbret[e\xEB])rv|Zweite[\s\xa0]*Konig|Zweite[\s\xa0]*K(?:\xF6|oe)nig|2\xB0[\s\xa0]*R|2\xB0\.[\s\xa0]*R|Second[ao][\s\xa0]*R)e|(?:II\.?[\s\xa0]*W|2\.?[\s\xa0]*W)afalme|Pili[\s\xa0]*Wafalme|(?:S[i\xED]\xF0ari[\s\xa0]*b[o\xF3]k[\s\xa0]*konungann|2\.?[\s\xa0]*Vu|2\.?[\s\xa0]*C\xE1c[\s\xa0]*Vu|II(?:\.[\s\xa0]*(?:C\xE1c[\s\xa0]*)?|[\s\xa0]*(?:C\xE1c[\s\xa0]*)?)Vu|(?:2(?:\.?[\s\xa0]*Para|\.)?|II\.?[\s\xa0]*Para)[\s\xa0]*Raj|2\.?[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|II\.?[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|Toinen[\s\xa0]*Kuninkaiden[\s\xa0]*kirj|(?:(?:(?:IV\.?|4\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|Czwarta[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?)[\s\xa0]*Kr[o\xF3]|II\.[\s\xa0]*Kr[o\xF3]|2\.[\s\xa0]*Kr[o\xF3]|2[\s\xa0]*Kr[o\xF3])lewsk|(?:II\.?|2\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])lewsk|(?:II|2)\.[\s\xa0]*Kraljevim|D(?:rug(?:a[\s\xa0]*(?:K(?:(?:s(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])le|r[o\xF3]le)wsk|raljevim)|knjiga[\s\xa0]*o[\s\xa0]*Kraljevim)|i[\s\xa0]*K(?:s(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])|r[o\xF3])lewsk)|ezy[e\xE8]m[\s\xa0]*W))a|K(?:i(?:tabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Wafalme|r[a\xE1]lyok[\s\xa0]*II)|awotu[\s\xa0]*Maxaafaa[\s\xa0]*Naa77anttuwaa)|2(?:[\s\xa0]*(?:R(?:ey|y)?|Ha|இரா|Mb|Bren|K(?:r(?:[o\xF3]l)?|ung?)|ରାଜାବଳୀ|राजा|K\xF6n|Kong?)|\.[\s\xa0]*(?:K(?:\xF6n|ong?)|ରାଜାବଳୀ|राजा))|Β['ʹʹ΄’][\s\xa0]*Βασ?|열왕기[\s\xa0]*하|And(?:en|re)[\s\xa0]*Kong|4[\s\xa0]*Ц(?:ар)?|ଦ୍ୱିତୀୟ[\s\xa0]*ରାଜାବଳୀ|2nd\.?[\s\xa0]*Ki?|Second[\s\xa0]*Ki?|4\.[\s\xa0]*Цар|2\.[\s\xa0]*Reg|2\.?[\s\xa0]*Wa|2[\s\xa0]*Imp|2(?:\.[\s\xa0]*[I\xCE]|[\s\xa0]*\xCE)mp|2[\s\xa0]*Boq|2\.[\s\xa0]*Boq|2\.?[\s\xa0]*Kg|2\.?[\s\xa0]*Kng?|M[a\xE1]sodik[\s\xa0]*Kir|2\.?[\s\xa0]*Ki(?:ng?|g|r)?|2\.[\s\xa0]*Kr(?:\xE1l|al)?|I(?:I(?:\.[\s\xa0]*(?:K(?:i(?:ng?|g|r)?|ng?|g|r(?:\xE1l|al)?)|[I\xCE]mp|Reg?|Wa|Boq)|[\s\xa0]*(?:K(?:o|r|n|in?)?|Reg?|Wa|[I\xCE]mp|Boq))|V\.?[\s\xa0]*Цар)|Четвърт(?:а[\s\xa0]*Цар(?:ств)?|о[\s\xa0]*Цар(?:ств)?)|II\.[\s\xa0]*Kon?|2e\.?[\s\xa0]*Kon?|Tweede[\s\xa0]*Kon?|Druh(?:[a\xE1][\s\xa0]*Kr(?:[a\xE1]l(?:ov)?)?|[y\xFD][\s\xa0]*Kr(?:[a\xE1]l(?:ov)?)?)|4[\s\xa0]*அரசுகள்|இராஜாக்களின்[\s\xa0]*இரண்டாம்[\s\xa0]*புத்தகம்)|(?:(?:列王[紀纪记]|王)下》|《(?:列王[紀纪记]|王)下|מלכים[\s\xa0]*ב|II[\s\xa0]*Regum|S\xED\xF0ari[\s\xa0]*konungab\xF3k|II[\s\xa0]*Kuninkaiden|2[\s\xa0]*Kuninkaiden|(?:II|2)\.[\s\xa0]*Kuninkaiden|Toinen[\s\xa0]*Kuninkaiden|(?:列王[紀纪记]|王)下|Четвърта[\s\xa0]*книга[\s\xa0]*на[\s\xa0]*царете))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*Reg(?:um|i)|3[\s\xa0]*Цар(?:ів|е)|3[\s\xa0]*Царства|Трет[ао][\s\xa0]*Царства|(?:1(?:st(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)g|[\s\xa0]*R(?:ey?|y)e)|First[\s\xa0]*Ki?g)s|(?:1st(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)|First[\s\xa0]*Ki?)ng?s|1\.?[\s\xa0]*Ki(?:r[a\xE1]lyok|(?:ng?|g)s)|1[\s\xa0]*Kr[a\xE1]lovsk[a\xE1]|I[\s\xa0]*(?:K(?:i(?:r[a\xE1]lyok|(?:ng?|g)s)|oningen|gs|ng?s|r[a\xE1]ľov|r[a\xE1]lovsk[a\xE1])|kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]))|(?:1(?:[\s\xa0]*Kr[a\xE1]lov|\.?[\s\xa0]*King|st[\s\xa0]*Ki?ng|st\.[\s\xa0]*Ki?ng)|First[\s\xa0]*Ki?ng)|(?:(?:I(?:[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])lewsk|\.?[\s\xa0]*Kr(?:[o\xF3]lewsk|aljevim)|[\s\xa0]*Kuninkaiden[\s\xa0]*kirj)|1(?:[\s\xa0]*(?:K(?:r(?:[o\xF3]lewsk|aljevim)|uninkaiden[\s\xa0]*kirj)|Raj)|\.[\s\xa0]*Kr(?:[o\xF3]lewsk|aljevim)))a)|(?:1(?:[\s\xa0]*(?:R(?:e(?:[egs]|y[es])|y[es]|s)|مل|ਰਾਜਿਆਂ|الملوك|राजे|Ir[aā]j[aā]kka[lḷ]|r(?:ā(?:jiāṃ|ǳe)|aǳe)|Kr(?:[a\xE1]l|[lľ]))|st(?:\.[\s\xa0]*K(?:[gns]|i[gn])|[\s\xa0]*K(?:[gns]|i[gn]))|열왕|[ея]\.?[\s\xa0]*Царе[ий]|\-?(?:е(?:\.[\s\xa0]*Царе[ий]|[\s\xa0]*Царе[ий])|я\.?[\s\xa0]*Царе[ий])|\-?سلاطِین|[\s\xa0۔]*سلاطین|[\s\xa0]*Царе[ий]|[\s\xa0]*ରାଜାବଳୀର|[\s\xa0]*राजा(?:हरूको|ओं)|[\s\xa0]*พ(?:งศ์กษัตริย์|กษ)|[\s\xa0]*Ki[gnr]|[\s\xa0]*Kongebo[gk]|\.(?:[\s\xa0]*(?:Царе[ий]|سلاطین|ରାଜାବଳୀର|राजा(?:हरूको|ओं)|พ(?:งศ์กษัตริย์|กษ)|K(?:ongebo[gk]|i[gnr]))|(?:\-?سلاطِ|۔سلاط)ین))|列(?:王(?:記(?:[Ⅰ上]|第三巻)|紀略上|[\s\xa0]*1)|上)|열왕기(?:[\s\xa0]*상권|상)|Ⅰ列王|왕상|《(?:列王[紀纪记]|王)上》|מלכים[\s\xa0]*א['’]|ﺍﻟﻤﻠﻮﻙ[\s\xa0]*ﺍﻷﻭ|पहिले[\s\xa0]*राजे|Α['ʹʹ΄’][\s\xa0]*Βασιλ[έε]ων|الممالك[\s\xa0]*الثالث|Βασιλει[ωώ]ν[\s\xa0]*Γ['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Βασιλ[έε]ων[\s\xa0]*Α['ʹʹ΄’]|ਰਾਜਿਆਂ[\s\xa0]*ਦੀ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੋਥੀ|First[\s\xa0]*K(?:[gns]|i[gn])|سفر[\s\xa0]*الملوك[\s\xa0]*الأول|(?:اوّل|۱)\-?سلاطِین|(?:اوّل[\s\xa0۔]*|۱[\s\xa0۔]*)سلاطین|ପ୍ରଥମ[\s\xa0]*ରାଜାବଳୀର|F\xF8rste[\s\xa0]*Kongebo[gk]|ରାଜାବଳୀର[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପୁସ୍ତକ|Трет[ао][\s\xa0]*Царе|1\.[\s\xa0]*Regi|Boqorradii[\s\xa0]*Kowaad|1[\s\xa0]*Breninoedd|1[\s\xa0]*Brenhinoedd|1\.[\s\xa0]*Brenh?inoedd|1\.?[\s\xa0]*Kgs|1\.?[\s\xa0]*Kng?s|3\.[\s\xa0]*Цар(?:ства|е)|1\.[\s\xa0]*Regum|Liber[\s\xa0]*I[\s\xa0]*Regum|3\.?[\s\xa0]*Reg(?:norum|i)|1(?:(?:\.[\s\xa0]*[I\xCE]|[\s\xa0]*\xCE)mp[aă]ra[tţ]|[\s\xa0]*(?:Imp[aă]ra[tţ]|Har)|[\s\xa0]*Boqorradi|\.[\s\xa0]*Boqorradi)i|(?:Una(?:ng)?|1\.)[\s\xa0]*Hari|(?:1\.?[\s\xa0]*M|3\.?[\s\xa0]*M)ga[\s\xa0]*Hari|Una(?:ng)?[\s\xa0]*Mga[\s\xa0]*Hari|I(?:[\s\xa0]*(?:K(?:i(?:[gr]|ng)|on|g|ng)|Regi|Brenh?inoedd)|\.[\s\xa0]*(?:K(?:i(?:ng?|g)|ng?|g)s|Brenh?inoedd|Regi)|\.[\s\xa0]*Regum|(?:\.[\s\xa0]*(?:[I\xCE]mp[aă]ra[tţ]|Boqorradi)|[\s\xa0]*(?:[I\xCE]mp[aă]ra[tţ]|Boqorradi))i|\.?[\s\xa0]*Hari|(?:katlong|\.)?[\s\xa0]*Mga[\s\xa0]*Hari|II(?:\.[\s\xa0]*(?:Reg(?:norum|i)|Цар(?:ства|е)|Mga[\s\xa0]*Hari)|[\s\xa0]*(?:Reg(?:norum|i)|Цар(?:ства|е)|Mga[\s\xa0]*Hari)))|(?:3(?:(?:\-?(?:я(?:\.?[\s\xa0]*Книга|\.)?|е\.?[\s\xa0]*Книга)|[ея]\.?[\s\xa0]*Книга|[ея]\.?|\-?е\.?|[\s\xa0]*Книга|\.[\s\xa0]*Книга)?[\s\xa0]*Царст|\-?е\.?[\s\xa0]*Царі)|Трет[ао][\s\xa0]*Царст|3\.[\s\xa0]*Царі|III\.?[\s\xa0]*Царі)в|(?:1(?:\-?е\.?|\.)?[\s\xa0]*ц|3\-?(?:тє|а)[\s\xa0]*Ц|3\-?(?:тє|а)\.[\s\xa0]*Ц|Трет[яє][\s\xa0]*Ц|1\.?[\s\xa0]*книга[\s\xa0]*ц|I(?:\.[\s\xa0]*(?:книга[\s\xa0]*)?|[\s\xa0]*(?:книга[\s\xa0]*)?)ц)арів|1\-?е\.?[\s\xa0]*книга[\s\xa0]*царів|1\-?(?:ше|а)[\s\xa0]*(?:книга[\s\xa0]*)?царів|1\-?(?:ше|а)\.[\s\xa0]*(?:книга[\s\xa0]*)?царів|1\.?[\s\xa0]*Царев[аи]|I\.?[\s\xa0]*Царев[аи]|(?:(?:Трећ(?:ом|а)|3\.?|III\.?)[\s\xa0]*краљ|(?:1\.?|I\.?)[\s\xa0]*о[\s\xa0]*цар)евима|(?:(?:Трећ(?:ом|а)|3\.?)[\s\xa0]*краљев|Трета[\s\xa0]*книга[\s\xa0]*Цар|III\.?[\s\xa0]*краљев)ства|(?:1\.?[\s\xa0]*к|I\.?[\s\xa0]*к)раљева|(?:Трет[ао][\s\xa0]*Книга[\s\xa0]*н|3\.?[\s\xa0]*Книга[\s\xa0]*н|III\.?[\s\xa0]*Книга[\s\xa0]*н)а[\s\xa0]*царете|(?:1\.?[\s\xa0]*к|I\.?[\s\xa0]*к)нига[\s\xa0]*за[\s\xa0]*царевите|П(?:рв(?:а[\s\xa0]*(?:к(?:нига[\s\xa0]*за[\s\xa0]*царевите|раљева)|о[\s\xa0]*царевима|Царев[аи])|о[\s\xa0]*(?:книга[\s\xa0]*за[\s\xa0]*царевите|Цареви))|ерш[ае][\s\xa0]*(?:книга[\s\xa0]*)?царів)|rājiāṃ[\s\xa0]*dī[\s\xa0]*pahilī[\s\xa0]*potʰī|3\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|Tredje[\s\xa0]*Kongerigernes[\s\xa0]*Bog|I[\s\xa0]*a[\s\xa0]*[I\xCE]mp[aă]ra[tţ]ilor|Cartea[\s\xa0]*(?:a[\s\xa0]*treia|III)[\s\xa0]*a[\s\xa0]*Regilor|(?:1(?:o\.?[\s\xa0]*Rei|Kg|[\s\xa0]*Rei|\.[\s\xa0]*Rei)|I\.?[\s\xa0]*Rei|(?:III\.?|3\.?)[\s\xa0]*Kingdom|3rd[\s\xa0]*Kingdom|3rd\.[\s\xa0]*Kingdom|(?:III\.?[\s\xa0]*R|3\.?[\s\xa0]*R)eino|3[ao][\s\xa0]*Reino|3[ao]\.[\s\xa0]*Reino|T(?:erceir[ao][\s\xa0]*Reino|hird[\s\xa0]*Kingdom)|(?:1(?:o\.?|\.)|I\.?)[\s\xa0]*Reye|1(?:\.[o\xBA]|\xBA)[\s\xa0]*Reye|1(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Reye)s|(?:(?:1\.?|I\.?)[\s\xa0]*Ro|1a[\s\xa0]*Re|1a\.[\s\xa0]*Re)is|1(?:\xE8?re|ere?)[\s\xa0]*Rois|1(?:\xE8?re|ere?)\.[\s\xa0]*Rois|1(?:[\s\xa0]*r(?:āǳ[aā]|aǳ[aā])har[uū]|\.[\s\xa0]*r[aā]ǳ[aā]har[uū])ko|(?:1\.[\s\xa0]*Kr[a\xE1]|I\.[\s\xa0]*Kr[a\xE1])lovsk[a\xE1]|1[\s\xa0]*kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]|[1I]\.[\s\xa0]*kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]|(?:(?:1\.?[\s\xa0]*C|I\.?[\s\xa0]*C)ari|I[\s\xa0]*Kr[a\xE1]lo|1\-?е\.?[\s\xa0]*Cari|1\-?(?:ше|а)[\s\xa0]*Cari|1\-?(?:ше|а)\.[\s\xa0]*Cari|Перш[ае][\s\xa0]*Cari)v|(?:1(?:\.[\s\xa0]*Kr[a\xE1]|[\s\xa0]*Kr[a\xE1])|I\.[\s\xa0]*Kr[a\xE1])ľov|(?:III\.?|3\.?)[\s\xa0]*Kr[a\xE1][lľ]ov|Tretia[\s\xa0]*Kr[a\xE1][lľ]ov|(?:[13][\s\xa0]*k|Treti)[\s\xa0]*Kr[a\xE1][lľ]ov|(?:Tret\xED|[13][\s\xa0]*k\.)[\s\xa0]*Kr[a\xE1][lľ]ov|Tretia[\s\xa0]*kniha[\s\xa0]*Kr[a\xE1][lľ]ov|(?:I[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])|1[\s\xa0]*Ka)w|(?:1\.?|I\.)[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w|P(?:r(?:v(?:n[i\xED][\s\xa0]*(?:kniha[\s\xa0]*kr[a\xE1]lovsk[a\xE1]|Kr[a\xE1]lovsk[a\xE1])|[y\xE1\xFD][\s\xa0]*Kr[a\xE1][lľ]ov|[y\xFD][\s\xa0]*list[\s\xa0]*Kr[a\xE1][lľ]ov|\xE1[\s\xa0]*kniha[\s\xa0]*Kr[a\xE1][lľ]ov|a[\s\xa0]*(?:Kr(?:\xE1[lľ]|a[lľ])|kniha[\s\xa0]*Kr[a\xE1][lľ])ov)|em(?:i(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*Rois|ye[\s\xa0]*liv[\s\xa0]*Wa[\s\xa0]*yo)|ime(?:ir[ao][\s\xa0]*Rei|ro?[\s\xa0]*Reye)s)|ierwsz[aey][\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]l[o\xF3]|[\s\xa0]*Kr[o\xF3]l[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3]l[o\xF3])w)|राजा(?:ओ[\s\xa0]*का[\s\xa0]*विर्तान्त[\s\xa0]*[1१]ला[\s\xa0]*भाग्|हरूक[\s\xa0]*पहिल[\s\xa0]*पुस्तक)|(?:1[\s\xa0]*(?:இராஜாக|அரசர)்|3[\s\xa0]*அரசு)கள்|இராஜாக்களின்[\s\xa0]*முதலாம்[\s\xa0]*புத்தகம்|1[\s\xa0]*Kr[o\xF3]l|(?:1\.?|I\.?)[\s\xa0]*Fal|(?:Wafalme|Regum)[\s\xa0]*I|K(?:ir[a\xE1]lyok[\s\xa0]*I|wanza[\s\xa0]*Fal)|(?:1(?:[\s\xa0]*(?:(?:[ei]\.?[\s\xa0]*Mbret[e\xEB]|Mbret[e\xEB])rv|Konig)|\.[\s\xa0]*(?:Mbret[e\xEB]rv|Konig))|3(?:[\s\xa0]*[ei]\.?[\s\xa0]*Mbret[e\xEB]|\.?[\s\xa0]*Mbret[e\xEB])rv|1\xB0[\s\xa0]*R|1\xB0\.[\s\xa0]*R|Prim[ao][\s\xa0]*R|(?:1\.?[\s\xa0]*W|I\.?[\s\xa0]*W)afalm|K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*ch|wanz)a[\s\xa0]*Wafalm)e|1\.?[\s\xa0]*K\xF6nige|1\.?[\s\xa0]*Koenige|(?:r(?:āǳ[aā]har[uū]|aǳ[aā]har[uū])ko[\s\xa0]*pusta|Fyrri[\s\xa0]*Konungab[o\xF3])k|I\.[\s\xa0]*Kir[a\xE1]lyok|1[\s\xa0]*salāṭīn|(?:1(?:\.[\s\xa0]*K(?:on)?|[\s\xa0]*K(?:on)?)u|F[o\xF6]rsta[\s\xa0]*K(?:on)?u)ngaboken|1\.?[\s\xa0]*Koningen|I\.[\s\xa0]*Koningen|1e[\s\xa0]*Koningen|1e\.[\s\xa0]*Koningen|1(?:[\s\xa0]*(?:R(?:ey|y)?|Ha|அர|Mb|இரா(?:ஜா)?|Bren|K(?:ung?|r))|st(?:\.[\s\xa0]*Ki?|[\s\xa0]*Ki?)|[\s\xa0]*ରାଜାବଳୀ|[\s\xa0]*राजा|[\s\xa0]*Ki|[\s\xa0]*K\xF6n|[\s\xa0]*Kong?|\.[\s\xa0]*(?:K(?:\xF6n|i|ong?)|ରାଜାବଳୀ|राजा))|Α['ʹʹ΄’][\s\xa0]*Βασ?|열왕기[\s\xa0]*상|3[\s\xa0]*Ц(?:ар)?|First[\s\xa0]*Ki?|ପ୍ରଥମ[\s\xa0]*ରାଜାବଳୀ|F\xF8rste[\s\xa0]*Kong|Трет[ао][\s\xa0]*Цар|1\.[\s\xa0]*Reg|1\.?[\s\xa0]*Wa|1[\s\xa0]*Imp|1(?:\.[\s\xa0]*[I\xCE]|[\s\xa0]*\xCE)mp|1[\s\xa0]*Boq|1\.[\s\xa0]*Boq|1\.?[\s\xa0]*Kg|1\.?[\s\xa0]*Kng?|1\.[\s\xa0]*Kr(?:[a\xE1]l(?:ov)?)?|3\.[\s\xa0]*Цар(?:ств)?|I(?:\.[\s\xa0]*(?:K(?:r(?:[a\xE1]l(?:ov)?)?|i(?:ng?|g)|ng?|g)|[I\xCE]mp|Reg?|Wa|Boq)|[\s\xa0]*(?:K(?:r(?:[a\xE1]l)?|n|o|in)?|Reg?|Wa|[I\xCE]mp|Boq)|II(?:\.[\s\xa0]*Цар(?:ств)?|[\s\xa0]*Цар(?:ств)?))|Prvn[i\xED][\s\xa0]*Kr(?:[a\xE1]l)?|I\.[\s\xa0]*Kir|I\.[\s\xa0]*Kon?|1e[\s\xa0]*Kon?|1e\.[\s\xa0]*Kon?|(?:(?:Trzeci(?:a[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?)|(?:III\.?|3\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?)[\s\xa0]*Kr[o\xF3]lewsk|Fyrri[\s\xa0]*b[o\xF3]k[\s\xa0]*konungann|1\.?[\s\xa0]*Vu|1\.?[\s\xa0]*C\xE1c[\s\xa0]*Vu|I(?:\.[\s\xa0]*(?:C\xE1c[\s\xa0]*)?|[\s\xa0]*(?:C\xE1c[\s\xa0]*)?)Vu|(?:1\.?|I\.)[\s\xa0]*Ks(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])lewsk|P(?:ierwsz[aey][\s\xa0]*K(?:s(?:\.[\s\xa0]*Kr[o\xF3]|[\s\xa0]*Kr[o\xF3]|i[eę]g[ai][\s\xa0]*Kr[o\xF3])le|r[o\xF3]le)wsk|r(?:va[\s\xa0]*(?:knjiga[\s\xa0]*o[\s\xa0]*)?Kraljevim|emye[\s\xa0]*W))|Kawotu[\s\xa0]*Maxaafaa[\s\xa0]*Koiruwa)a|(?:1(?:\.?[\s\xa0]*Para|\.)|I\.?[\s\xa0]*Para)[\s\xa0]*Raja|1\.[\s\xa0]*Kuninkaiden[\s\xa0]*kirja|I\.[\s\xa0]*Kuninkaiden[\s\xa0]*kirja|E(?:rste[\s\xa0]*K(?:\xF6|oe?)nige|ls[oő][\s\xa0]*Kir[a\xE1]lyok|erste[\s\xa0]*Koningen|erste[\s\xa0]*Kon?|ls[oő][\s\xa0]*Kir|nsimm[a\xE4]inen[\s\xa0]*Kuninkaiden[\s\xa0]*kirja))|(?:(?:列王[紀纪记]|王)上》|《(?:列王[紀纪记]|王)上|K(?:in|n)?gs|מלכים[\s\xa0]*א|الملوك[\s\xa0]*الأول|I[\s\xa0]*Regum|Fyrri[\s\xa0]*konungab\xF3k|Трета[\s\xa0]*книга[\s\xa0]*на[\s\xa0]*царете|(?:列王[紀纪记]|王)上|Kin|I[\s\xa0]*Kuninkaiden|1[\s\xa0]*Kuninkaiden|[1I]\.[\s\xa0]*Kuninkaiden|Ensimm[a\xE4]inen[\s\xa0]*Kuninkaiden))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["EpJer"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:エレミヤ(?:の(?:手紙|書翰)|・手)|《EpJer》|예레미야의[\\s\\xa0]*편지|イエレミヤの達書|رسالة[\\s\\xa0]*إرميا|איגרת[\\s\\xa0]*ירמיהו|Jeremi(?:(?:\\xE1[sš]|a[sš])ov[\\s\\xa0]*list|jino[\\s\\xa0]*pismo)|Επιστολ(?:η[\\s\\xa0]*Ιερεμ[ίι]ου|[ηὴ][\\s\\xa0]*᾿Ιερ|ή[\\s\\xa0]*Ιερεμ[ίι]ου)|Лист[\\s\\xa0]*Єремі[ії]|П(?:о(?:с(?:лан(?:и(?:е[\\s\\xa0]*(?:на[\\s\\xa0]*[ИЙ]еремия|Иеремии)|ца[\\s\\xa0]*Јеремијина)|ня[\\s\\xa0]*Єремі[ії])|(?:\\.[\\s\\xa0]*[ИЙ]|[\\s\\xa0]*[ИЙ])ер)|ел\\.?[\\s\\xa0]*Иер)|исма[\\s\\xa0]*Јеремије)|Jeremias(?:['’][\\s\\xa0]*B|[\\s\\xa0]*b)rev|Jer[\\s\\xa0]*?br|(?:(?:Cart|Br)[\\s\\xa0]*J|Or\\.?[\\s\\xa0]*I|BJ|Cart\\.[\\s\\xa0]*J)er|L(?:i(?:st[\\s\\xa0]*Jeremj[a\\xE1][sš][uů]v|(?:[\\s\\xa0]*ni|h)[\\s\\xa0]*Jer)|et\\-?ger)|(?:Jeremi(?:a(?:s[\\s\\xa0]*level|n[\\s\\xa0]*kirj)|\\xE1s[\\s\\xa0]*level)|Oratio[\\s\\xa0]*Ieremia)e|\\xC9p(?:\\.[\\s\\xa0]*J[e\\xE9]r[e\\xE9]|[\\s\\xa0]*J[e\\xE9]r[e\\xE9])mie|\\xC9p[i\\xEE]tre[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9]mie|Ep(?:(?:\\.[\\s\\xa0]*J[e\\xE9]r[e\\xE9]|[\\s\\xa0]*J[e\\xE9]r[e\\xE9]|\\xEEtre[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9])mie|i(?:tre[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9]mie|stle[\\s\\xa0]*of[\\s\\xa0]*Jeremy))|(?:La[\\s\\xa0]*Carta[\\s\\xa0]*de[\\s\\xa0]*Jerem[i\\xED]|Carta[\\s\\xa0]*Jerem[i\\xED])as|Ang[\\s\\xa0]*Liham[\\s\\xa0]*ni[\\s\\xa0]*Jeremias|(?:(?:B(?:rief[\\s\\xa0]*(?:des|van)[\\s\\xa0]*J|arua[\\s\\xa0]*ya[\\s\\xa0]*Y)|Lettera[\\s\\xa0]*di[\\s\\xa0]*G)eremi|Br[e\\xE9]f[\\s\\xa0]*Jerem[i\\xED]|List[\\s\\xa0]*Jeremiasz|Llythyr[\\s\\xa0]*Jeremei|Epistola[\\s\\xa0]*lui[\\s\\xa0]*Ieremi)a|Pismo[\\s\\xa0]*Jeremije[\\s\\xa0]*proroka|The[\\s\\xa0]*(?:Ep(?:istle|\\.)?|Let(?:ter|\\.)?)[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|(?:\\xC9p[\\s\\xa0]*J[e\\xE9]|Carta[\\s\\xa0]*Je|\\xC9p\\.[\\s\\xa0]*J[e\\xE9]|Ep(?:\\.[\\s\\xa0]*J[e\\xE9]|[\\s\\xa0]*J[e\\xE9]))r|எரேமியாவின்[\\s\\xa0]*கடிதம்|எரேமியாவின்[\\s\\xa0]*மடல்|அவை[\\s\\xa0]*இளைஞர்[\\s\\xa0]*மூவரின்[\\s\\xa0]*பாடல்)|(?:Carta[\\s\\xa0]*de[\\s\\xa0]*Jerem[i\\xED]as|《EpJer|Liham[\\s\\xa0]*ni[\\s\\xa0]*Jeremias|Let[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|Let(?:ter|\\.)[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|Ep(?:[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|Jer》?|\\.[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|istle[\\s\\xa0]*of[\\s\\xa0]*Jeremiah)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lam"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:พคค|애|Omb|איכה|nūḥ\\xE2|نَ?وحہ|קינות|ਵਿਰਲਾਪ|예레미(?:야[\\s\\xa0]*?|아)애가|哀歌|エレミヤの哀歌|《(?:連同哀歌|哀|耶利米哀歌)》|المراثي|विलापग[ीे]त|Siralmak|Hlj|เพลงคร่ำครวญ|บทเพลงคร่ำครวญ|यर्मियाको[\\s\\xa0]*विलाप|مرا|سفر[\\s\\xa0]*مراثي[\\s\\xa0]*إرميا|Θρ[ήη]νοι[\\s\\xa0]*Ιερεμ[ίι]ου|virlāp|yarmiy[aā]ko[\\s\\xa0]*vil[aā]p|ଯିରିମିୟଙ୍କ[\\s\\xa0]*ବିଳାପ|Tu[zž]|П(?:лач(?:[\\s\\xa0]*(?:Єремі[ії]|Иеремии|Еремиин|Јеремијин|на[\\s\\xa0]*Еремиин)|ът[\\s\\xa0]*на[\\s\\xa0]*(?:[ИЙ]е|Е)ремия|от[\\s\\xa0]*на[\\s\\xa0]*Еремија)|(?:\\.[\\s\\xa0]*[ИЙ]|[\\s\\xa0]*[ИЙ])ер)|ErmZ|Плач[\\s\\xa0]*Еремиев|Книга[\\s\\xa0]*Плач[\\s\\xa0]*Иеремиев|Jeremi[a\\xE1](?:šov[\\s\\xa0]*Pla[cč]|sov[\\s\\xa0]*Pla[cč])|புலம்|எரேமியாவின்[\\s\\xa0]*புலம்பல்|(?:V(?:a(?:litusvirr|jtim)|ilapage)e|wil[aā]pg[iī])t|K(?:niha[\\s\\xa0]*n[a\\xE1](?:řk[uů]|rk[uů])|idung[\\s\\xa0]*Pasambat)|(?:[ZŽ]alospev|N[a\\xE1]rek)y|Aklat[\\s\\xa0]*ng[\\s\\xa0]*Pa(?:nan|gt)aghoy|Mga[\\s\\xa0]*Panaghoy|(?:Harmlj[o\\xF3]\\xF0i|Klaagliedere|Mga[\\s\\xa0]*Pagbangota)n|Mga[\\s\\xa0]*Lamentasyon|(?:Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Lamentacj|Jeremi[a\\xE1]s[\\s\\xa0]*siralma)i|(?:Jeremijine[\\s\\xa0]*tu[zž]aljk|Klagesangen)e|Klagelieder[\\s\\xa0]*Jeremias|L(?:am(?:enta(?:tions[\\s\\xa0]*de[\\s\\xa0]*J[e\\xE9]r[e\\xE9]mie|zioni|tiones|\\xE7[o\\xF4\\xF5]es[\\s\\xa0]*de[\\s\\xa0]*Jeremias|c(?:[o\\xF4\\xF5]es[\\s\\xa0]*de[\\s\\xa0]*Jeremias|i(?:ones|je)))|intations|antasyon|intaciones)|m)|Kidung[\\s\\xa0]*Pangadhuh|Galarnad[\\s\\xa0]*Jeremiah|Baroorashadii[\\s\\xa0]*Yeremyaah|Klgl|K(?:\\.[\\s\\xa0]*n[a\\xE1]|[\\s\\xa0]*n[a\\xE1]|niha[\\s\\xa0]*n[a\\xE1])rekov|(?:Ermmaasa[\\s\\xa0]*Zilaassa|Ai[\\s\\xa0]*C|Klagovisorn|Treny[\\s\\xa0]*Jeremiasz|Lamentacje[\\s\\xa0]*Jeremiasz)a|Maombolezo[\\s\\xa0]*ya[\\s\\xa0]*Yeremia|P(?:l(?:a(?:[cč][\\s\\xa0]*Jerem(?:i(?:[a\\xE1][sš][ouů]v|[i\\xEF])|j[a\\xE1][sš][uů]v)|ngerile[\\s\\xa0]*(?:profetu)?lui[\\s\\xa0]*Ieremia)|\\xE2ngerile[\\s\\xa0]*(?:profetu)?lui[\\s\\xa0]*Ieremia|\\xE1[cč][\\s\\xa0]*Jerem[ij][a\\xE1][sš][uů]v)|ulampal)|Panag|N[a\\xE1]r|புல|Siralm?|[ZŽ]alosp|Va(?:lit|j)|Θρ|Tr|Плач[\\s\\xa0]*Иер|Galar|Jeremi[a\\xE1]s[\\s\\xa0]*sir|Kl(?:a(?:g(?:es)?|agl))?|Mao|Lam(?:enta(?:cione|tion)|intacione|intation)?|Baroor|Pl(?:\\xE2ng(?:eri)?|ang(?:eri)?)?|C(?:hante[\\s\\xa0]*pou[\\s\\xa0]*plenn[\\s\\xa0]*S[o\\xF2][\\s\\xa0]*lavil[\\s\\xa0]*Jerizal[e\\xE8]m|a[\\s\\xa0]*thương))|(?:《(?:連同哀歌|哀|耶利米哀歌)|विलाप|애가|哀》|連同哀歌》|耶利米哀歌》|Θρ[ήη]νοι|Galarnad|புலம்பல்|Maombolezo|Klagelieder|مراثي[\\s\\xa0]*إرميا|Treny|P(?:a(?:gbangotan|naghoy)|l(?:[a\\xE1][cč]|enn))|Tu[zž]aljke|Lamenta(?:(?:\\xE7[o\\xF5]|c[o\\xF5])es|cje|tions)|Плач[\\s\\xa0]*Иеремиев|連同哀歌|哀|耶利米哀歌|Плач|Baroorashadii))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Num"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:4[\s\xa0]*(?:Moseb(?:o(?:ken|g)|\xF3k)|Мојсијева))|(?:4(?:\.[\s\xa0]*Mo(?:j(?:(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)a|[zż])|oseksen[\s\xa0]*kirja)|[\s\xa0]*Mo(?:j(?:(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)a|ż|z)?|oseksen[\s\xa0]*kirja))|IV(?:(?:[\s\xa0]*Moj(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)|\.[\s\xa0]*Moj(?:z[i\xED][sš]ov|[zż]eszow))a|[\s\xa0]*Moj[zż]))|(?:《(?:民(?:数记|數記)?|戶籍紀)》|민수기|Ἀρ|民数記|ਗਿਣਤੀ|گِ?نتی|ספירה|מניין|במדבר|Hesabu|Број?еви|Αριθμο[ίι]|B(?:[ae]midbar|il)|எண்ண(?:ாகமம்|ிக்கை)|عد|سفر[\s\xa0]*العدد|Qod|E[nṇ][nṇ][aā]kamam|D\xE2n[\s\xa0]*số[\s\xa0]*k\xFD|ก(?:ันดารวิถี|ดว)|ଗଣନା[\s\xa0]*ପୁସ୍ତକ|Книга[\s\xa0]*Чисел|Blg|M(?:ga[\s\xa0]*(?:Numeros|Bilang)|[o\xF3]zes[\s\xa0]*IV)|Lb|ग(?:न्तीको[\s\xa0]*पुस्तक|िनती|णना)|g(?:a(?:ṇan[aā]|nan[aā])|i[nṇ]tī)|Fjerde[\s\xa0]*Mosebo[gk]|(?:liv[\s\xa0]*Resansman[\s\xa0]*|Wilang)an|Fj[a\xE4]rde[\s\xa0]*Moseboken|Ginatee|Fj[o\xF3]r\xF0a[\s\xa0]*b[o\xF3]k[\s\xa0]*M[o\xF3]se|Vierte[\s\xa0]*Mose|Vierte[\s\xa0]*Buch[\s\xa0]*Mose|4(?:\.[\s\xa0]*(?:Mosebo(?:ken|g)|Buch[\s\xa0]*Mose)|[\s\xa0]*(?:Buch[\s\xa0]*Mose|Мојс|Mz))|IV(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj)|(?:4(?:\.[\s\xa0]*Moseb\xF3|[\s\xa0]*Mosebo)|gant[iī]ko[\s\xa0]*pusta|Fj[o\xF3]r\xF0a[\s\xa0]*M[o\xF3]seb[o\xF3]|4\.?[\s\xa0]*M\xF3seb[o\xF3]|IV(?:\.[\s\xa0]*M(?:\xF3seb[o\xF3]|oseb[o\xF3])|[\s\xa0]*M[o\xF3]seb[o\xF3]))k|Sz[a\xE1]mok|(?:Liber[\s\xa0]*Numer|Brojev)i|Tirintii|4(?:[\s\xa0]*M(?:o(?:ze|o)|\xF3ze)|M\xF3)s|(?:Vierde[\s\xa0]*Moz|R|4\.[\s\xa0]*Moz|4\.[\s\xa0]*M\xF3z|IV(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])z)es|N(?:um(?:erii|rat|ber[is])|[bm]|\xFAmeros|ombres)|(?:IV\.?|4\.)[\s\xa0]*Мојсијева|(?:IV\.?|4\.?)[\s\xa0]*Моисеева|(?:IV\.?|4\.?)[\s\xa0]*книга[\s\xa0]*Мо[ий]сеева|Ч(?:етв(?:(?:ърт(?:а[\s\xa0]*(?:книга[\s\xa0]*)?|о[\s\xa0]*)Мои|рта[\s\xa0]*книга[\s\xa0]*Мој)се|рта[\s\xa0]*Мојсиј|ерта[\s\xa0]*книга[\s\xa0]*Мо[ий]се)ев|исл)а|Nonb|Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Liczb|Αρ(?:ιθ)?|민수?|民数|Бр|Tir|எண்|Mga[\s\xa0]*Numero|गन्ती|Fjerde[\s\xa0]*Mos|Fj[a\xE4]rde[\s\xa0]*Mosebok|4(?:[\s\xa0]*(?:M(?:o(?:se?|z)?|\xF3z)|М)|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|4\.?[\s\xa0]*M\xF3s|IV(?:\.[\s\xa0]*M[o\xF3]|[\s\xa0]*M[o\xF3])s|Sz[a\xE1]m|N(?:u(?:m(?:b(?:er)?)?)?|\xFAm?|o(?:mb?)?)|(?:IV\.?|4\.)[\s\xa0]*Мојс|Ч(?:етврта[\s\xa0]*Мојс|исл?)|(?:(?:Štvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]|Moj[zž])|4[\s\xa0]*k(?:\.[\s\xa0]*Moj[zž]|[\s\xa0]*Moj[zž])|Stvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]|Moj[zž]))i[sš]ov|IV\.?[\s\xa0]*Mooseksen[\s\xa0]*kirj|Qoodaaba|Nelj[a\xE4]s[\s\xa0]*Mooseksen[\s\xa0]*kirj|Kitabu[\s\xa0]*cha[\s\xa0]*Nne[\s\xa0]*cha[\s\xa0]*Mus|Čysl|Knjiga[\s\xa0]*Brojev|IV\.[\s\xa0]*Mojž[i\xED][sš]ov|4[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]ov|(?:IV\.?|4\.)[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED][sš]ov|Čtvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ov)a|(?:IV\.?|4\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|C(?:zwarta[\s\xa0]*(?:Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])eszowa|Moj(?:[zż]eszowa|[zż]))|(?:tvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED][sš]|Moj[zž][i\xED][sš])ov|ysl)a))|(?:(?:民(?:数记|數記)?|戶籍紀)》|《(?:民(?:数记|數記)|戶籍紀)|ଗଣନା|العدد|Liczb|D\xE2n[\s\xa0]*Số|gant[iī]ko|गन्तीको|民(?:数记|數記)?|戶籍紀|《民|D\xE2n|Resansman|(?:IV|4)[\s\xa0]*Mooseksen|(?:IV|4)\.[\s\xa0]*Mooseksen|N(?:elj[a\xE4]s[\s\xa0]*Mooseksen|umer(?:os|i|o))))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Sus"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:《Sus》|수산나|שושנה|ス[サザ]ンナ物語|சூசன்னா|Σ(?:ουσ[άα]|ωσ[άα])ννα|كتاب[\\s\\xa0]*سوزانا|Istoria[\\s\\xa0]*Susanei|Z(?:suzsanna[\\s\\xa0]*[e\\xE9]s[\\s\\xa0]*a[\\s\\xa0]*v[e\\xE9]nek|uzan[ae])|С(?:казанию[\\s\\xa0]*о[\\s\\xa0]*Сусанне[\\s\\xa0]*и[\\s\\xa0]*Данииле|усан(?:на[\\s\\xa0]*и[\\s\\xa0]*старцы|а))|Zuzanna|Hist[o\\xF3]ria[\\s\\xa0]*de[\\s\\xa0]*Susana|Fortellingen[\\s\\xa0]*om[\\s\\xa0]*Susanna|(?:Opowiadaniem[\\s\\xa0]*o[\\s\\xa0]*Zuzanni|Historia[\\s\\xa0]*Susanna)e|Z(?:suzs?|uz)|ス[サザ]ンナ|Σουσ|Сус|S(?:u(?:sann(?:a(?:[\\s\\xa0]*(?:i(?:[\\s\\xa0]*badet|m[\\s\\xa0]*Bade)|ja[\\s\\xa0]*vanhimmat)|h|[\\s\\xa0]*und[\\s\\xa0]*die[\\s\\xa0]*Alten)|e[\\s\\xa0]*(?:et[\\s\\xa0]*les[\\s\\xa0]*(?:deux[\\s\\xa0]*)?vieillards|au[\\s\\xa0]*bain))|zanne[\\s\\xa0]*(?:et[\\s\\xa0]*les[\\s\\xa0]*(?:deux[\\s\\xa0]*)?vieillards|au[\\s\\xa0]*bain)|zana|z)?|(?:(?:i[\\s\\xa0]*Sus|hosh)a|[w\\xFA]san|toria[\\s\\xa0]*di[\\s\\xa0]*Susan)na))|(?:Su(?:s(?:an(?:ei|a|na?e)|》)|zanne)|سوزانا|《Sus|Сусанна|Sus(?:anna)?|Zsuzsanna))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Sir"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:벤시(?:라(?:크의?|의)?|리크의)[\\s\\xa0]*지혜|ИсС|집회서|《德訓篇》|[ヘベ]ン・シラの(?:智慧|知恵)|บุตรสิรา|ספר[\\s\\xa0]*בן[\\s\\xa0]*סירא|משלי[\\s\\xa0]*בן[\\s\\xa0\\-?]*סירא|Σοφ[ίι]α[\\s\\xa0]*Σ(?:ειρ[άα]|ιρα)χ|シラ(?:フの子イイススの知恵書|書（集会の書）)|يشوع[\\s\\xa0]*بن[\\s\\xa0]*سيراخ|س(?:فر[\\s\\xa0]*ابن[\\s\\xa0]*سيراخ|ي)|Екле(?:зијастикус|сіаст)|E(?:k(?:l(?:es[iy]astiko|ezjastyka|i)|kles[iy]astiko)|c(?:c(?:lesiastic(?:ul|o)|s)|lesi[a\\xE1]stico))|YbS|சீ(?:ராக்(?:கின்[\\s\\xa0]*ஞான|[\\s\\xa0]*ஆகம)ம்|ஞா)|Ekkleziastik|Eccl[e\\xE9]siastique|S(?:ir(?:a(?:k(?:s(?:[\\s\\xa0]*(?:Bog|bok)|b[o\\xF3]k)|id[ae]s)|cidas)|\\xE1(?:[ck]id[ae]s|[ck]h))|(?:\\xEDraksb[o\\xF3]|yra)k|ir(?:\\xE1k[\\s\\xa0]*b[o\\xF6]lcsess[e\\xE9]|ak[\\s\\xa0]*b[o\\xF6]lcsess[e\\xE9])ge|ir\\xE0cide|apienza[\\s\\xa0]*di[\\s\\xa0]*Sirac(?:ide|h))|Jesu(?:[\\s\\xa0]*Siraks[\\s\\xa0]*s\\xF8nns[\\s\\xa0]*visdom|s[\\s\\xa0]*Syraks[\\s\\xa0]*vishet)|(?:Ek(?:kles[iy]|les[iy])astiku|Siracide)s|(?:Liber[\\s\\xa0]*Eccle|Ecclu)siasticus|(?:M[aą]dro[sś][cć][\\s\\xa0]*Syrach|Huấn[\\s\\xa0]*C|Sir[a\\xE1]k[\\s\\xa0]*fi|Yoshua[\\s\\xa0]*bin[\\s\\xa0]*Sir|La[\\s\\xa0]*Sagesse[\\s\\xa0]*de[\\s\\xa0]*Ben[\\s\\xa0]*Sir|Sirakin[\\s\\xa0]*kirj|Jee?sus[\\s\\xa0]*Siirakin[\\s\\xa0]*kirj)a|K(?:n(?:iha[\\s\\xa0]*(?:S(?:irachov(?:c(?:ov)?|ho[\\s\\xa0]*syn)|\\xEDrachovcov)a|Ekleziastikus)|jiga[\\s\\xa0]*Sirahova)|\\.?[\\s\\xa0]*Sirachov(?:c(?:ov)?|ho[\\s\\xa0]*syn)a|\\.?[\\s\\xa0]*Ekleziastikus)|(?:S[i\\xED]rachove|Ecleziasti)c|Karunungan[\\s\\xa0]*ng[\\s\\xa0]*Anak[\\s\\xa0]*ni[\\s\\xa0]*Sirac|Ang[\\s\\xa0]*Karunungan[\\s\\xa0]*ni[\\s\\xa0]*Jesus,?[\\s\\xa0]*Anak[\\s\\xa0]*ni[\\s\\xa0]*Sirac|(?:Премудр(?:ости[\\s\\xa0]*И(?:исуса,[\\s\\xa0]*сы|суса[\\s\\xa0]*си)|ість[\\s\\xa0]*Ісуса,[\\s\\xa0]*си)на[\\s\\xa0]*Сирахов|Сирин)а|(?:Премудрость|Бен)[\\s\\xa0]*Сираха|Премъдрост[\\s\\xa0]*на[\\s\\xa0]*Иисус,[\\s\\xa0]*син[\\s\\xa0]*Сирахов|Книга[\\s\\xa0]*(?:Премъдрост[\\s\\xa0]*на[\\s\\xa0]*Иисуса,[\\s\\xa0]*син[\\s\\xa0]*Сирахов|на[\\s\\xa0]*Сирах|Сираха)|S(?:i(?:r(?:\\xE1[ck]id[ae]|\\xE1c|a(?:kid[ae]|cida))?)?|[y\\xED]r)|E(?:klezjastyk|cclus)|Сир|집회|シラ|(?:(?:Wijsheid[\\s\\xa0]*van[\\s\\xa0]*Jezus|Oratio[\\s\\xa0]*Iesu[\\s\\xa0]*filii|Wijsheid[\\s\\xa0]*van[\\s\\xa0]*(?:Jozua[\\s\\xa0]*)?Ben)[\\s\\xa0]*Sirac|Kitab[\\s\\xa0]*Yesus[\\s\\xa0]*bin[\\s\\xa0]*Sirak|Jesus[\\s\\xa0]*Sirac|The[\\s\\xa0]*Wisdom[\\s\\xa0]*of[\\s\\xa0]*Jesus(?:[\\s\\xa0]*(?:Son[\\s\\xa0]*of|ben)|,[\\s\\xa0]*Son[\\s\\xa0]*of)[\\s\\xa0]*Sirac)h|Cartea[\\s\\xa0]*[i\\xEE]n[tţ]elepciunii[\\s\\xa0]*lui[\\s\\xa0]*Isus,[\\s\\xa0]*fiul[\\s\\xa0]*lui[\\s\\xa0]*Sirah)|(?:S(?:(?:i(?:irakin[\\s\\xa0]*kirj|rachovcov)|yrach)a|ir(?:a(?:k(?:in|h)|cide)|\\xE1k)|agesse[\\s\\xa0]*de[\\s\\xa0]*Ben[\\s\\xa0]*Sira)|德訓篇》|シラ書|集会の書|《德訓篇|سيراخ|Σειρ[άα]χ|Сирах(?:ов)?а|Ecclesiasticus|Ben[\\s\\xa0]*Sira|Si(?:ra(?:ch?|k)?|irakin)|Сирах(?:ов)?|德訓篇|Jezus[\\s\\xa0]*Sirach|Wisdom[\\s\\xa0]*of[\\s\\xa0]*Jesus(?:[\\s\\xa0]*(?:Son[\\s\\xa0]*of|ben)|,[\\s\\xa0]*Son[\\s\\xa0]*of)[\\s\\xa0]*Sirach))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrMan"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:マナセの(?:祈[り禱]|いのり)|므나쎄의[\\s\\xa0]*기도|《PrMan》|صلاة[\\s\\xa0]*منسى|תפילת[\\s\\xa0]*מנשה|Πρ(?:οσευχ[ήη][\\s\\xa0]*Μανασσ[ήη]|[\\s\\xa0]*Μαν)|Gebet[\\s\\xa0]*Manasses|Man[\\s\\xa0]*ru|М(?:олитва(?:[\\s\\xa0]*Манас(?:ијина|сии)|та[\\s\\xa0]*на[\\s\\xa0]*Манасия)|\\.?[\\s\\xa0]*Ман)|Pr\\.?[\\s\\xa0]*Manass[e\\xE9]|La[\\s\\xa0]*Pri[e\\xE8]re[\\s\\xa0]*de[\\s\\xa0]*Manass[e\\xE9]|The[\\s\\xa0]*Pr(?:ayer(?:s[\\s\\xa0]*(?:of[\\s\\xa0]*)?|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)Manasseh|(?:La[\\s\\xa0]*Oraci[o\\xF3]n[\\s\\xa0]*de[\\s\\xa0]*Manas[e\\xE9]|Prece[\\s\\xa0]*de[\\s\\xa0]*Manass[e\\xE9])s|Dasal[\\s\\xa0]*ni[\\s\\xa0]*Manases|Dalangin[\\s\\xa0]*ni[\\s\\xa0]*Manases|Ang[\\s\\xa0]*Panalangin[\\s\\xa0]*ni[\\s\\xa0]*Manases|(?:Manasse(?:s(?:[\\s\\xa0]*(?:b(?:[o\\xF6]|\\xF8n)|B\\xF8)|’[\\s\\xa0]*b[o\\xF6])|[\\s\\xa0]*b[o\\xF6]|n[\\s\\xa0]*rukoukse)|BM)n|Geb[\\s\\xa0]*Man|(?:(?:Gebet[\\s\\xa0]*des|B\\xE6n|Modlitbu|Gweddi|Preghiera[\\s\\xa0]*di)[\\s\\xa0]*Manas|Rug[aă]ciunea[\\s\\xa0]*(?:rege)?lui[\\s\\xa0]*Mana)se|Gebet[\\s\\xa0]*Manasse|Pr\\.?[\\s\\xa0]*Man|M(?:anas(?:s(?:\\xE9[\\s\\xa0]*im[a\\xE1]ds[a\\xE1]g|ze[\\s\\xa0]*im[a\\xE1]j|e[\\s\\xa0]*im[a\\xE1]ds[a\\xE1]g)|esova[\\s\\xa0]*modlitb)|odlitwa[\\s\\xa0]*Manasses)a|Or(?:a(?:zione[\\s\\xa0]*di[\\s\\xa0]*Manasse[\\s\\xa0]*Re[\\s\\xa0]*di[\\s\\xa0]*Giuda|tio[\\s\\xa0]*(?:regis[\\s\\xa0]*)?Manassae)|\\.?[\\s\\xa0]*Man))|(?:P(?:r(?:i[e\\xE8]re[\\s\\xa0]*de[\\s\\xa0]*Manass[e\\xE9]|Man》|[\\s\\xa0]*(?:of[\\s\\xa0]*)?Manasseh|ayer(?:s[\\s\\xa0]*(?:of[\\s\\xa0]*)?|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)Manasseh|Man)|analangin[\\s\\xa0]*ni[\\s\\xa0]*Manases)|Manase|《PrMan|Манасия|Manasse|Orazione[\\s\\xa0]*di[\\s\\xa0]*Manasse|Man|Oraci[o\\xF3]n[\\s\\xa0]*de[\\s\\xa0]*Manas[e\\xE9]s))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Acts"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Fa(?:p(?:te(?:le)?[\\s\\xa0]*Apostolilor|t)?|l(?:imaha[\\s\\xa0]*Rasuullada)?)|Дап)|(?:使徒(?:行[伝録]|書|言行録|の働き)|Osu|행|사도행전|F\\.?A|اع|《(?:宗徒(?:大事錄|行實)|使徒行[传傳]|徒)》|मसीह\\-?दूत|ﺍﻋﻤﺎﻝ[\\s\\xa0]*ﺍﻟﺮﺳﻞ|מעשי[\\s\\xa0]*השליחים|ਰਸੂਲਾਂ[\\s\\xa0]*ਦੇ[\\s\\xa0]*ਕਰਤੱਬ|سفر[\\s\\xa0]*أعمال[\\s\\xa0]*الرسل|اَعمال|یوحنا[\\s\\xa0]*کے[\\s\\xa0]*اعمال|رسُ?ولوں[\\s\\xa0]*کے[\\s\\xa0]*اعمال|Skutky[\\s\\xa0]*apo[sš]tol(?:sk[e\\xE9]|[u\\xFCů])|Gw|C(?:\\xF4ng[\\s\\xa0]*vụ[\\s\\xa0]*(?:c\\xE1c[\\s\\xa0]*Sứ|T\\xF4ng)[\\s\\xa0]*đồ|selekedetek)|ก(?:ิจการ(?:​ของ​|ของ)อัครทูต|จ)|திப|rasūlāṃ[\\s\\xa0]*de[\\s\\xa0]*kartabb|pre[sš]it[aā][mṃ]c[iī][mṃ][\\s\\xa0]*kr̥tye[mṃ]|प्र(?:े(?:रित(?:ों[\\s\\xa0]*के[\\s\\xa0]*कामों|हरूका[\\s\\xa0]*काम)|षितांचीं?[\\s\\xa0]*कृत्यें)|(?:\\.[\\s\\xa0]*?|[\\s\\xa0]*)?क)|Πρ(?:[άα]ξεις[\\s\\xa0]*των[\\s\\xa0]*Αποστ[οό]λων|ξ)|திருத்தூதர்[\\s\\xa0]*பணிகள்|அப்போஸ்தலர(?:ுடைய[\\s\\xa0]*நடபடிகள்|்[\\s\\xa0]*பணி)|(?:prerithar[uū]k[aā][\\s\\xa0]*k[aā]|Praeriton[\\s\\xa0]*Ke[\\s\\xa0]*Ka)m|A(?:p(?:ost(?:lenes[\\s\\xa0]*(?:gj|G)erninger|olien[\\s\\xa0]*teot)|\\.(?:[Gt]|[\\s\\xa0]*t)|[Gt]|[\\s\\xa0]*t)|ct(?:us[\\s\\xa0]*Apostolorum|sss)|kd[e\\xE8]zapot|(?:pp[oō]stalar[\\s\\xa0]*Pa[nṇ]|tti[\\s\\xa0]*degli[\\s\\xa0]*Apostol)i|z[\\s\\xa0]*apostolok[\\s\\xa0]*cselekedetei)|Д(?:е(?:яния(?:[\\s\\xa0]*на[\\s\\xa0]*(?:светите[\\s\\xa0]*Апостоли|апостолите)|та[\\s\\xa0]*на[\\s\\xa0]*апостолите)|ла[\\s\\xa0]*(?:на[\\s\\xa0]*апостолите|Апостолска|на[\\s\\xa0]*светите[\\s\\xa0]*апостоли))|і(?:[ії][\\s\\xa0]*(?:святих[\\s\\xa0]*а|А)|яння[\\s\\xa0]*Святих[\\s\\xa0]*А)постолів|\\.?[\\s\\xa0]*А)|F\\.?[\\s\\xa0]*Ap|Skutky[\\s\\xa0]*apo[sš]tolov|D(?:ijannja[\\s\\xa0]*svjaty[hȟ][\\s\\xa0]*apostoliv|z(?:iejach[\\s\\xa0]*Apostolskich|[\\s\\xa0]*Ap))|(?:A(?:p\\.?[\\s\\xa0]*C|z[\\s\\xa0]*ApC)se|rasūlōṅ[\\s\\xa0]*ke[\\s\\xa0]*aʿmā)l|Lelakone[\\s\\xa0]*Para[\\s\\xa0]*Rasul|ପ୍ରେରିତମାନଙ୍କ[\\s\\xa0]*କାର୍ଯ୍ୟର[\\s\\xa0]*ବିବରଣ|He?ch|(?:Apostlag[a\\xE4]rningarn|Djela[\\s\\xa0]*apostolsk)a|Yesuusi[\\s\\xa0]*Kiittidoogeetu[\\s\\xa0]*Oosuwaa|(?:A(?:ctau['’]r[\\s\\xa0]*Apostolio|ng[\\s\\xa0]*Mga[\\s\\xa0]*Binuhata)|Postulasaga|Bi|Handelingen[\\s\\xa0]*(?:van[\\s\\xa0]*de|der)[\\s\\xa0]*apostele)n|Hnd|(?:A(?:tos[\\s\\xa0]*dos[\\s\\xa0]*Ap[o\\xF3]stolo|ctes[\\s\\xa0]*des[\\s\\xa0]*Ap[o\\xF4]tre)|The[\\s\\xa0]*Acts[\\s\\xa0]*of[\\s\\xa0]*the[\\s\\xa0]*Apostle|(?:Buhat[\\s\\xa0]*sa[\\s\\xa0]*mga|Gawa[\\s\\xa0]*ng)[\\s\\xa0]*Apostole|Los[\\s\\xa0]*Hechos[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Ap[o\\xF3]stole)s|(?:Apost(?:elg(?:jerningen|eschicht)|lenes\\-?gjerning)|Veprat[\\s\\xa0]*e[\\s\\xa0]*Apostujv|Dzieje[\\s\\xa0]*Apostolski)e|प्रे(?:रित(?:ों[\\s\\xa0]*के[\\s\\xa0]*काम)?|षितांचीं[\\s\\xa0]*कृत्ये)|使徒|사도|Sk|Vep|Πρ[άα]ξ|அப்(?:போ)?|A(?:c(?:t(?:ss|a)?)?|t)|Д(?:е(?:ла[\\s\\xa0]*Ап|ян)|іян)|D(?:zieje[\\s\\xa0]*Apost|j)|ପ୍ରେରିତ|H(?:and|e?c)|(?:Aksyon[\\s\\xa0]*ap[o\\xF2]|Travay[\\s\\xa0]*ap[o\\xF2])t[\\s\\xa0]*yo|Ebanghelyo[\\s\\xa0]*ng[\\s\\xa0]*Espiritu[\\s\\xa0]*Santo|M(?:a(?:buting[\\s\\xa0]*Balita[\\s\\xa0]*(?:ayon[\\s\\xa0]*sa|ng)[\\s\\xa0]*Espiritu[\\s\\xa0]*Santo|tendo[\\s\\xa0]*ya[\\s\\xa0]*Mitume)|ga[\\s\\xa0]*Gawa(?:[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*A(?:postoles|lagad)|in|[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*Apostol)|do))|(?:Acts[\\s\\xa0]*of[\\s\\xa0]*the[\\s\\xa0]*Apostles)|(?:(?:宗徒(?:大事錄|行實)|使徒行[传傳]|徒)》|กิจการ|Teot|Д(?:і(?:[ії]|яння)|е(?:яния|ла))|رسولوں|Travay|S(?:kutky|ứ[\\s\\xa0]*đồ)|《(?:宗徒(?:大事錄|行實)|使徒行[传傳]|徒)|Πρ[άα]ξεις|C\\xF4ng[\\s\\xa0]*Vụ|M(?:ga[\\s\\xa0]*Gawa|atendo)|اعمال|أعمال[\\s\\xa0]*الرسل|அப்போஸ்தலர்|(?:Faptel|Dziej)e|Veprat[\\s\\xa0]*e[\\s\\xa0]*apostujve|Gerninger|(?:Gawa[\\s\\xa0]*ng[\\s\\xa0]*mga[\\s\\xa0]*Aposto|Para[\\s\\xa0]*Rasu)l|A(?:p(?:ostolok[\\s\\xa0]*cselekedetei|Csel|g)|ct(?:au|s)|tti)|Binuhatan|Fapte|Dz|(?:A(?:ct[eu]|to)|Los[\\s\\xa0]*Hecho)s|H(?:echos[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Ap[o\\xF3]stoles|andelingen))|(?:C\\xF4ng|Gawa|徒|使徒行[传傳]|宗徒(?:大事錄|行實)|Veprat|Hechos|Apostolok))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Johannesapokalypsen)|(?:요한(?:[\\s\\xa0]*[계묵]|[계묵])시록|묵시|계|᾿Απ|ว(?:ิวรณ์|ว)|黙示録|ヨハネの[默黙]示録|《(?:[启啟]|启示录|啟示錄|[啓默]示錄|若望默示錄)》|הה?תגלות|ﻳﻮﺣﻨﺎ[\\s\\xa0]*ﺭﺅﻳﺎ|الرؤيــا|رؤيا[\\s\\xa0]*يوحنا|חזון[\\s\\xa0]*יוחנן|Datguddiad|R(?:ev(?:[ao]|e)?lations|v)|Апок(?:а(?:л[i\\xEDиі]|́лі)|[a\\xE1]лі)псис|தி(?:ருவெளிப்பாடு|வெ)|प्र(?:काशित(?:[\\s\\xa0]*?वाक्|\\-?वाक्‍)य|\\.?[\\s\\xa0]*व)|Ufunuo[\\s\\xa0]*wa[\\s\\xa0]*Yohan[ae]|Αποκ(?:αλ(?:υψ(?:εις|η)|ύψεις|υψις[\\s\\xa0]*Ιω[άα]ννου)|άλυψ(?:ις[\\s\\xa0]*Ιω[άα]ννου|η))|K(?:s(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Apokalipsy|niha[\\s\\xa0]*Zjeven[i\\xED]|itab[\\s\\xa0]*Wahyu|hải[\\s\\xa0]*thị)|Rivelazione|J(?:ohannes[\\s\\xa0]*Uppenbarelse|elen[e\\xE9]sek)|Zjv|ਯੂਹੰਨਾ[\\s\\xa0]*ਦੇ[\\s\\xa0]*ਪਰਕਾਸ਼[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਪੋਥੀ|य(?:ोहानाला[\\s\\xa0]*झालेले[\\s\\xa0]*प्रकटीकरण|ूहन्नालाई[\\s\\xa0]*भएको[\\s\\xa0]*प्रकाश)|ی(?:ُو(?:[\\s\\xa0]*حنّا[\\s\\xa0]*عارِف[\\s\\xa0]*کا[\\s\\xa0]*مُ|حنا[\\s\\xa0]*عارف[\\s\\xa0]*کا[\\s\\xa0]*م)|و[\\s\\xa0]*حنا[\\s\\xa0]*عارف[\\s\\xa0]*کا[\\s\\xa0]*م)کاشفہ|Ve[lḷ]ippa[tṭ]utti[nṉ]a[\\s\\xa0]*Vic[eē][tṭ]a[nṅ]ka[lḷ]|ଯୋହନଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପ୍ରକାଶିତ[\\s\\xa0]*ବାକ୍ୟ|Gipadayag|Joh(?:annes['’][\\s\\xa0]*(?:[A\\xC5]b|[a\\xE5]p)|s(?:\\.[\\s\\xa0]*[A\\xC5]|[\\s\\xa0]*[A\\xC5])b)enbaring|O(?:p(?:inberun(?:arb[o\\xF3]k[\\s\\xa0]*J[o\\xF3]|[\\s\\xa0]*J[o\\xF3])hannesar|b)|ff(?:enbarung|b))|(?:Johanne(?:ksen[\\s\\xa0]*ilmesty|s[\\s\\xa0]*apokalyp)|Openbaring[\\s\\xa0]*van[\\s\\xa0]*Johanne)s|El[\\s\\xa0]*Apocalipsis|(?:Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Objawieni|Prakashaitavaky|Ilmestyskirj|Zbules|Ob['’]javlennja[\\s\\xa0]*Ivana[\\s\\xa0]*Bohoslov)a|Zjavenie[\\s\\xa0]*(?:sv[a\\xE4]t[e\\xE9]ho[\\s\\xa0]*J[a\\xE1]|J[a\\xE1]|Apo[sš]tola[\\s\\xa0]*J[a\\xE1])na|(?:Ufunua[\\s\\xa0]*wa[\\s\\xa0]*Yoh|Objawienie[\\s\\xa0]*J)ana|Objawienie[\\s\\xa0]*[sś]w[\\s\\xa0]*Jana|Objawienie[\\s\\xa0]*[sś]w\\.[\\s\\xa0]*Jana|Zjeveni[\\s\\xa0]*svat[e\\xE9]ho[\\s\\xa0]*Jana|(?:Zjeven[i\\xED][\\s\\xa0]*J|Otkrivenje[\\s\\xa0]*Iv)anovo|(?:Op(?:inberunarb[o\\xF3]ki|enbaringe)|Khải[\\s\\xa0]*Huyền[\\s\\xa0]*của[\\s\\xa0]*Joh|Re[bv]elasyo|\\xC5benbaringe|\\xC5benbaringsboge|Uppenbarelseboke|\\xC5penbaring(?:sbok)?e)n|Pa(?:hayag[\\s\\xa0]*kay[\\s\\xa0]*Ju|medar)an|(?:J[a\\xE1]nos[\\s\\xa0]*jelen[e\\xE9]se|Muujinti)i|A(?:p(?:o(?:cal(?:i(?:ps(?:e[\\s\\xa0]*de[\\s\\xa0]*(?:S[a\\xE3]o[\\s\\xa0]*Jo[a\\xE3]|Jo[a\\xE3])o|(?:a[\\s\\xa0]*lui[\\s\\xa0]*Io|is[\\s\\xa0]*ni[\\s\\xa0]*Ju)an)|sse[\\s\\xa0]*di[\\s\\xa0]*Giovanni)|yps(?:is[\\s\\xa0]*Ioannis[\\s\\xa0]*Apostoli|e[\\s\\xa0]*de[\\s\\xa0]*Jean))|kal(?:ips(?:a[\\s\\xa0]*(?:[SŚ]wi[eę]tego|[sś]w\\.|[sś]w)[\\s\\xa0]*Jana|zis)|ypsa|ypsen|ipsis[\\s\\xa0]*ni[\\s\\xa0]*Juan))|enbaring(?:sbok)?en|[ck])|(?:benbaringsbo|abenbarin|benbarin)gen|j(?:juutaa|u))|y(?:ū(?:h(?:ann[aā]l[aā][iī][\\s\\xa0]*bʰaeko[\\s\\xa0]*prak[aā][sš]|\\xE3nā[\\s\\xa0]*de[\\s\\xa0]*prakāš[\\s\\xa0]*dī[\\s\\xa0]*potʰī)|ḥannā[\\s\\xa0]*ʿārif[\\s\\xa0]*kā[\\s\\xa0]*mukāšaf\\xE2)|uhann[aā]l[aā][iī][\\s\\xa0]*bʰaeko[\\s\\xa0]*prak[aā][sš]|oh[aā]n[aā]l[aā][\\s\\xa0]*ǳʰ[aā]lele[\\s\\xa0]*praka[tṭ][iī]kara[nṇ])|வெளிப்படுத்தின[\\s\\xa0]*விசேடங்கள்|யோவானுக்கு[\\s\\xa0]*வெளிப்படுத்தின[\\s\\xa0]*விசேஷம்|R(?:ev(?:elation|el|lation|[ao]lation)?|iv)|Dat(?:gudd)?|Muuj|رؤ|Ilm|\\xC5[bp]|Pah|U(?:fu?|pp)|Απ(?:οκ)?|Jel|Z(?:j(?:av)?|bu?)|வெளி|O(?:p(?:enb)?|tk|bj)|Ap(?:o(?:c(?:alyps)?|k(?:alips)?)?)?|Відкриття[\\s\\xa0]*Івана|О(?:(?:б['’]явлення[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*)?|дкровення[\\s\\xa0]*)Івана[\\s\\xa0]*Богослова|дкриттє|б['’]явлення[\\s\\xa0]*св(?:\\.[\\s\\xa0]*[ИЙ]|[\\s\\xa0]*[ИЙ])оана[\\s\\xa0]*Богослова|тк(?:р(?:ове(?:ние(?:[\\s\\xa0]*на[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*Иоана[\\s\\xa0]*Богослова|[ИЙ]оан)|то[\\s\\xa0]*на[\\s\\xa0]*[ИЙ]оан)|ње[\\s\\xa0]*Јованово)|ивење[\\s\\xa0]*Јованово)?)?))|(?:(?:启示录|啟示錄)》)|(?:Wahyu|[启啟]》|[啓默]示錄》|若望默示錄》|Ufunuo|《(?:启示录|啟示錄|[啓默]示錄|若望默示錄)|مُ?کاشفہ|Zjeven[i\\xED]|प्रक(?:टीकरण|ाश)|Khải[\\s\\xa0]*Huyền|О(?:ткр(?:овени|ивењ)е|б['’]явлення)|praka[tṭ][iī]kara[nṇ]|ਪਰਕਾਸ਼[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਪੋਥੀ|Ve[lḷ]ippa[tṭ]utti[nṉ]a|yūh\\xE3nā[\\s\\xa0]*de[\\s\\xa0]*prakāš|Pahayag|[O\\xC5]penbaring|(?:O(?:bjawieni|tkrivenj)|Zjaveni)e|《[启啟]|Ilmestys|Ap(?:o(?:cal(?:i(?:ps[ae]|sse|psis)|yps(?:is[\\s\\xa0]*Ioannis|e))|kalips(?:is|a))|enbaring))|(?:启示录|Об|Khải|啟示錄|[啓默]示錄|若望默示錄|[启啟]|Apocalypsis))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrAzar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:ア[サザ]ルヤの祈り|அசரியா|《PrAzar》|صلاة[\\s\\xa0]*عزريا|Πρ(?:οσευχ[ήη][\\s\\xa0]*Αζαρ[ίι]ου|[\\s\\xa0]*Αζαρ)|Oratio[\\s\\xa0]*Azariae|М(?:олитва(?:[\\s\\xa0]*Азар(?:і[ії]|ия)|та[\\s\\xa0]*на[\\s\\xa0]*Азария)|\\.?[\\s\\xa0]*Аза)|Or[\\s\\xa0]*Azar|Sal[\\s\\xa0]*Azar|Or\\.[\\s\\xa0]*Azar|Pr(?:[\\s\\xa0]*Aza|Az|\\.[\\s\\xa0]*Aza)r|La[\\s\\xa0]*Pri[e\\xE8]re[\\s\\xa0]*d['’]Azaria[hs]|תפילת[\\s\\xa0]*עזריה[\\s\\xa0]*בתוך[\\s\\xa0]*הכבשן|The[\\s\\xa0]*Pr(?:ayers?)?[\\s\\xa0]*of[\\s\\xa0]*Azariah|(?:(?:Gebe(?:d[\\s\\xa0]*van[\\s\\xa0]*Az|t[\\s\\xa0]*des[\\s\\xa0]*As)|B\\xE6n[\\s\\xa0]*As)arj|Modlitw[aą][\\s\\xa0]*Azariasz|Pie[sś][nń][\\s\\xa0]*Azariasz|Preghiera[\\s\\xa0]*di[\\s\\xa0]*Azari|Rug[aă]ciunea[\\s\\xa0]*lui[\\s\\xa0]*Azari)a|The[\\s\\xa0]*Pr(?:ayers?)?[\\s\\xa0]*of[\\s\\xa0]*Azaria|Or[\\s\\xa0]*Az|Geb[\\s\\xa0]*As|(?:C[a\\xE1]ntico[\\s\\xa0]*de[\\s\\xa0]*Azar[i\\xED]|Oraci[o\\xF3]n[\\s\\xa0]*de[\\s\\xa0]*Azar[i\\xED])as|Gweddi[\\s\\xa0]*Asarias|Salmo[\\s\\xa0]*de[\\s\\xa0]*Azarias|A(?:z(?:ar(?:j(?:a(?:s(?:ova[\\s\\xa0]*modlitba|[\\s\\xa0]*B\\xF8n)|šova[\\s\\xa0]*modlitba)|\\xE1[sš]ova[\\s\\xa0]*modlitba)|i[a\\xE1]s[\\s\\xa0]*im[a\\xE1](?:ds[a\\xE1]g|j)a)|\\xE1ri[a\\xE1]s[\\s\\xa0]*im[a\\xE1](?:ds[a\\xE1]g|j)a)|sar(?:(?:jas(?:[\\s\\xa0]*b(?:[o\\xF6]|\\xF8n)|’[\\s\\xa0]*b[o\\xF6])|ias(?:’[\\s\\xa0]*b[o\\xF6]|[\\s\\xa0]*b[o\\xF6]))n|[\\s\\xa0]*ru)|sarjan[\\s\\xa0]*rukous|ng[\\s\\xa0]*Panalangin[\\s\\xa0]*ni[\\s\\xa0]*Azarias))|(?:P(?:r(?:i[e\\xE8]re[\\s\\xa0]*d['’]Azaria[hs]|Azar》|[\\s\\xa0]*of[\\s\\xa0]*Azariah|ayers?[\\s\\xa0]*of[\\s\\xa0]*Azariah|ayers?[\\s\\xa0]*of[\\s\\xa0]*Azaria|[\\s\\xa0]*of[\\s\\xa0]*Azaria|Azar)|analangin[\\s\\xa0]*ni[\\s\\xa0]*Azarias)|Azar(?:jas[\\s\\xa0]*b\\xF8n|ia[hs])|《PrAzar|תפילת[\\s\\xa0]*עזריה|Azaria|Azar\\xEDas))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["SgThree"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:S(?:\.[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))))|三(?:人の若者の賛|童兒の)歌|《SgThree》|இளைஞர்[\s\xa0]*மூவரின்[\s\xa0]*பாடல்|أنشودة[\s\xa0]*الأطفال[\s\xa0]*الثلاثة|[ΎΥ]μνος[\s\xa0]*των[\s\xa0]*Τρι[ωώ]ν[\s\xa0]*Πα[ίι]δων|Wimbo[\s\xa0]*wa[\s\xa0]*Vijana[\s\xa0]*Watatu|שירת[\s\xa0]*שלושת[\s\xa0]*הנערים[\s\xa0]*בכבשן|Hymnus[\s\xa0]*trium[\s\xa0]*puerorum|П(?:есента[\s\xa0]*на[\s\xa0]*тримата[\s\xa0]*младежи|\.?[\s\xa0]*Мл)|Пісня[\s\xa0]*трьох[\s\xa0]*отроків|(?:Молитва[\s\xa0]*святых[\s\xa0]*тре|Песнь[\s\xa0]*тр[её])х[\s\xa0]*отроков|Благодарственная[\s\xa0]*песнь[\s\xa0]*отроков|Pie(?:ś(?:n(?:i[aą][\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3]|[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3])|ń[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3])|s(?:n(?:i[aą][\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3]|[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3])|ń[\s\xa0]*trzech[\s\xa0]*młodzie[nń]c[o\xF3]))w|Aw(?:it[\s\xa0]*ng[\s\xa0]*Tatlong[\s\xa0]*Kabataang[\s\xa0]*Banal|[\s\xa0]*ng[\s\xa0]*3[\s\xa0]*Kab)|(?:El[\s\xa0]*(?:Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre)|3[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre)|3[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre)))o|The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew))|Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew)))s|(?:(?:P(?:\xEDse[nň][\s\xa0]*ml[a\xE1]denc[uů][\s\xa0]*v[\s\xa0]*ho[rř][i\xED]c[i\xED]|ise[nň][\s\xa0]*ml[a\xE1]denc[uů][\s\xa0]*v[\s\xa0]*ho[rř][i\xED]c[i\xED]|iese[nň][\s\xa0]*ml[a\xE1]dencov[\s\xa0]*v[\s\xa0]*ohnivej)|T(?:r(?:aja[\s\xa0]*ml[a\xE1]denci[\s\xa0]*v[\s\xa0]*rozp[a\xE1]lenej|i[\s\xa0]*mu[zž]i[\s\xa0]*v[\s\xa0]*rozp[a\xE1]len[e\xE9])|ři[\s\xa0]*mu[zž]i[\s\xa0]*v[\s\xa0]*rozp[a\xE1]len[e\xE9]))[\s\xa0]*pec|3[\s\xa0]*tiner)i|(?:H[a\xE1]rom[\s\xa0]*fiatalember[\s\xa0]*[e\xE9]nek|S(?:on|n)?g[\s\xa0]*Thre)e|C(?:an(?:t(?:i(?:co[\s\xa0]*d(?:ei[\s\xa0]*tre[\s\xa0]*(?:giovani[\s\xa0]*nella[\s\xa0]*fornace|fanciulli)|os[\s\xa0]*(?:Tr[e\xEA]s|3)[\s\xa0]*Jovens)|que[\s\xa0]*des[\s\xa0]*(?:Trois|3)[\s\xa0]*Enfants)|area[\s\xa0]*celor[\s\xa0]*trei[\s\xa0]*(?:tiner|evre)i)|[\s\xa0]*y[\s\xa0]*Tri[\s\xa0]*Ll?anc)|\xE2n[\s\xa0]*y[\s\xa0]*Tri[\s\xa0]*Ll?anc|t[\s\xa0]*3[\s\xa0]*(?:J[o\xF3]|E)|\xE2ntico[\s\xa0]*dos[\s\xa0]*(?:Tr[e\xEA]s|3)[\s\xa0]*Jovens|\xE2ntarea[\s\xa0]*celor[\s\xa0]*trei[\s\xa0]*(?:tiner|evre)i)|De[\s\xa0]*(?:tre[\s\xa0]*m(?:[a\xE4]nnens[\s\xa0]*lovs[a\xE5]|enns[\s\xa0]*sa)|Tre[\s\xa0]*M\xE6nds[\s\xa0]*Lovsa)ng|C3J|Gezang[\s\xa0]*der[\s\xa0]*drie[\s\xa0]*mannen[\s\xa0]*in[\s\xa0]*het[\s\xa0]*vuur|De[\s\xa0]*tre[\s\xa0]*mennenes[\s\xa0]*sang[\s\xa0]*f\xF8yer|Awit[\s\xa0]*ng[\s\xa0]*(?:Tatlong[\s\xa0]*Banal[\s\xa0]*na|3)[\s\xa0]*Kabataan|The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))|Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))en|Der[\s\xa0]*Gesang[\s\xa0]*der[\s\xa0]*Drei[\s\xa0]*M[a\xE4]nner[\s\xa0]*im[\s\xa0]*feurigen[\s\xa0]*Ofen|L(?:obgesang[\s\xa0]*der[\s\xa0]*(?:drei[\s\xa0]*jungen[\s\xa0]*M[a\xE4]nner[\s\xa0]*im[\s\xa0]*Feuerofen|3[\s\xa0]*jungen[\s\xa0]*M[a\xE4]nner)|ied[\s\xa0]*van[\s\xa0]*de[\s\xa0]*drie[\s\xa0]*jongemannen|3J)|(?:Lofs[o\xF6]ngur[\s\xa0]*ungmennanna[\s\xa0]*\xFEriggj|Awit[\s\xa0]*ng[\s\xa0]*Tatlong[\s\xa0]*Binat)a|Awit[\s\xa0]*ng[\s\xa0]*Tatlong[\s\xa0]*Kabataan|Sg[\s\xa0]*Thr|Kolmen[\s\xa0]*(?:nuoren[\s\xa0]*miehen[\s\xa0]*ollessa[\s\xa0]*tulisessa[\s\xa0]*p[a\xE4]tsiss[a\xE4]|miehen[\s\xa0]*kiitosvirsi[\s\xa0]*tulessa))|(?:Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Tres[\s\xa0]*J[o\xF3]venes[\s\xa0]*Jud[i\xED]os)|(?:S(?:ong[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))|Three[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M)|3[\s\xa0]*(?:Holy[\s\xa0]*Childr|Young[\s\xa0]*M))en|gThree》)|(?:Der[\s\xa0]*Gesang[\s\xa0]*der[\s\xa0]*Dre|Trei[\s\xa0]*tiner)i|De[\s\xa0]*tre[\s\xa0]*m\xE6nds[\s\xa0]*lovsang|《SgThree|Kolmen[\s\xa0]*miehen[\s\xa0]*kiitosvirsi|Tatlong[\s\xa0]*Kabataan|Kolmen[\s\xa0]*nuoren[\s\xa0]*miehen|Lobgesang[\s\xa0]*der[\s\xa0]*drei[\s\xa0]*jungen[\s\xa0]*M[a\xE4]nner|(?:Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew))|Three[\s\xa0]*(?:Youth|Jew)|3[\s\xa0]*(?:Youth|Jew))|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*Tres[\s\xa0]*J[o\xF3]vene)s|Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*3[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre)os|Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre)|3[\s\xa0]*J[o\xF3]venes[\s\xa0]*(?:Jud[i\xED]|Hebre))os)|(?:Kolmen[\s\xa0]*miehen|SgThree|Gesang[\s\xa0]*der[\s\xa0]*Drei|(?:Himno[\s\xa0]*de[\s\xa0]*los[\s\xa0]*)?3[\s\xa0]*J[o\xF3]venes|Tres[\s\xa0]*J[o\xF3]venes|Canto[\s\xa0]*de[\s\xa0]*los[\s\xa0]*(?:Tres[\s\xa0]*J[o\xF3]|3[\s\xa0]*J[o\xF3])venes))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2[\s\xa0]*(?:Pet(?:r(?:u(?:sbrevet|v)|ův|i)|ersbrev)|petr[aā]ce[mṃ])|Andre[\s\xa0]*Petersbrev|2[\s\xa0]*P\xE9trus|2[\s\xa0]*Pedro|(?:2(?:nd(?:\.[\s\xa0]*P(?:ete|t)|[\s\xa0]*P(?:ete|t))|[\s\xa0]*Pt)|Second[\s\xa0]*P(?:ete|t)|2[\s\xa0]*P\xE9te)r|(?:Druh[a\xE1][\s\xa0]*Petrov|2[\s\xa0]*Piotr)a|2[\s\xa0]*Petrova[\s\xa0]*Poslanica|II(?:[\s\xa0]*P(?:ie(?:tarin[\s\xa0]*kirj|rr)e|etru[sv]|\xE9trus|ietro|edro|(?:\xE9te|ete|t)r|iotra|etrova[\s\xa0]*Poslanica)|\.[\s\xa0]*P(?:ie(?:tarin[\s\xa0]*kirj|rr)e|\xE9trus|ietro|(?:\xE9te|t)r|iotra|e(?:t(?:rova[\s\xa0]*Poslanica|er)|dro))))|(?:II\.?[\s\xa0]*Petrov|2[\s\xa0]*Pedr|2[\s\xa0]*Petrus|Andre[\s\xa0]*Peters)|(?:2(?:\.[\s\xa0]*Пет(?:рус|ир)|[\s\xa0]*Пет(?:рус|ир))а)|(?:《(?:彼(?:[后後]|得后书)|撇特爾後|彼得後書|伯多祿後書)》|二[ヘペ]トロ|벧후|Ⅱ[\s\xa0]*[ヘペ]テロ|[ヘペ](?:テロの(?:後の書|手紙Ⅱ|第二の手紙)|トロ(?:の手紙二|[\s\xa0]*2|の第二の手紙))|Π[έε]τρου[\s\xa0]*Β['ʹʹ΄’]|Β['ʹʹ΄’][\s\xa0]*Π[έε]τρου|베드로(?:의[\s\xa0]*둘째[\s\xa0]*서간|[2후]서)|השנייה[\s\xa0]*פטרוס|Epistula[\s\xa0]*II[\s\xa0]*Petri|ਪਤਰਸ[\s\xa0]*ਦੀ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੱਤ੍ਰੀ|ପିତରଙ୍କ[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|प(?:(?:ेत्र|ौल)ाचें[\s\xa0]*दुसरे|त्रुसको[\s\xa0]*दोस्(?:त्)?रो)[\s\xa0]*पत्र|Butros[\s\xa0]*Labaad|pa(?:ṭras[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|tras[\s\xa0]*dī[\s\xa0]*dūjī[\s\xa0]*pattrī)|رسالة[\s\xa0]*(?:القديس[\s\xa0]*بطرس[\s\xa0]*الثانية|بطرس[\s\xa0]*(?:الثانية|2))|S[i\xED]\xF0ara[\s\xa0]*P[e\xE9]tursbr[e\xE9]f|א(?:גרתו[\s\xa0]*השנייה[\s\xa0]*של[\s\xa0]*פטרוס[\s\xa0]*השליח|יגרת[\s\xa0]*פטרוס[\s\xa0]*השנייה)|Druh(?:[y\xFD][\s\xa0]*P(?:etrova|t)|[a\xE1][\s\xa0]*Pt)|Epistula[\s\xa0]*Petri[\s\xa0]*II|P(?:et(?:uru[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]vatu[\s\xa0]*Nirupam|ro[\s\xa0]*II)|ēturu[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]vatu[\s\xa0]*Nirupam)|II(?:\.[\s\xa0]*P(?:e(?:t(?:r(?:u[sv]|[io])|e)|r)|i[e\xE8]|t)|[\s\xa0]*P(?:e(?:t(?:r[ou]|e)|r)|t|i[e\xE8]))|Друга[\s\xa0]*Петра|Second[\s\xa0]*P(?:e(?:t[er]|r)|t)|پطرس[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام[\s\xa0]*خط|பேதுரு[\s\xa0]*(?:எழுதிய[\s\xa0]*இரண்டா(?:ம்[\s\xa0]*(?:திருமுக|கடித)|வது[\s\xa0]*நிருப)|இரண்டாம்[\s\xa0]*திருமுக)ம்|ଦ୍ୱିତୀୟ[\s\xa0]*ପିତରଙ|(?:دوم|۲)[\s\xa0]*پطرس|Друга[\s\xa0]*Петров[ао]|II\.?[\s\xa0]*Петр(?:ов[ао]|а)|(?:Dezy[e\xE8]m[\s\xa0]*P[iy]|II\.?[\s\xa0]*Py)[e\xE8]|(?:(?:M[a\xE1]sodik[\s\xa0]*P[e\xE9]|Andre[\s\xa0]*Pe)te|II\.?[\s\xa0]*Ped|II\.?[\s\xa0]*Piot)r|(?:S[i\xED]\xF0ara[\s\xa0]*almenna[\s\xa0]*br[e\xE9]f[\s\xa0]*P[e\xE9]tur|Tweede[\s\xa0]*Petru|II\.?[\s\xa0]*Butro|Zweite[\s\xa0]*Petru)s|II\.?[\s\xa0]*Ph(?:i(?:\-?(?:e\-?)?|a\-?)rơ|\xEA(?:r\xF4|\-?rơ))|Drug[ai][\s\xa0]*Piotra|(?:(?:(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*y)a[\s\xa0]*P|Seconda[\s\xa0]*Pi|Second(?:a[\s\xa0]*lettera[\s\xa0]*di|o)[\s\xa0]*Pi|Pili[\s\xa0]*P)et|Segundo[\s\xa0]*Ped|(?:Ikalawang|Segunda)[\s\xa0]*Ped|(?:Segundo|II\.?)[\s\xa0]*San[\s\xa0]*Ped)ro|Deuxi(?:[e\xE8]mes[\s\xa0]*|[e\xE8]me[\s\xa0]*)Pierre|Toinen[\s\xa0]*Pietarin[\s\xa0]*kirje|(?:Druh(?:[y\xFD][\s\xa0]*(?:list[\s\xa0]*Petr[ouů]|Petr[uů])|[a\xE1][\s\xa0]*Petr[ouů])|II\.?[\s\xa0]*Petrů|Druh[a\xE1][\s\xa0]*kniha[\s\xa0]*Petro|(?:Druh[a\xE1]|II\.?)[\s\xa0]*list[\s\xa0]*Petr[uů]|(?:Pet(?:ers[\s\xa0]*(?:Andet[\s\xa0]*B|andre[\s\xa0]*b)|rus[\s\xa0]*andra[\s\xa0]*b)|Ande[nt][\s\xa0]*Petersb)re)v|(?:Druh[y\xFD][\s\xa0]*Petrov[\s\xa0]*lis|II\.?[\s\xa0]*P\xE9)t|Andra[\s\xa0]*Petrusbrevet|(?:(?:p(?:etr[aā]ce[mṃ][\s\xa0]*dusre|atrusko[\s\xa0]*dostro)[\s\xa0]*pa|Druhe[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pe)tr|Naa77antto[\s\xa0]*PHeexiroos|(?:Drug[ai]|II\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotr)a|Druga[\s\xa0]*Petrova[\s\xa0]*Poslanica|(?:Втор(?:о[\s\xa0]*(?:послание[\s\xa0]*на[\s\xa0]*Петъ|Пет[аъ])|а[\s\xa0]*Пет[аъ])|II\.?[\s\xa0]*Пет[аъ])р|Второ[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*апостол[\s\xa0]*Петар|(?:Втор[ао]|II\.?)[\s\xa0]*писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Петар|(?:Втора|II\.?)[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*апостол[\s\xa0]*Петар|(?:دوم|۲)[\s\xa0]*پطر[\s\xa0]*س|(?:دوم[\-?۔]|۲[\-?۔])پطرس|Втор[ао][\s\xa0]*Петрово|Β['ʹʹ΄’][\s\xa0]*Π[έε](?:τρ?)?|M[a\xE1]sodik[\s\xa0]*P[e\xE9]t|And(?:en[\s\xa0]*Pet(?:er)?|re[\s\xa0]*Pet)|Druh(?:[a\xE1][\s\xa0]*P(?:etr)?|[y\xFD][\s\xa0]*P(?:etr)?)|Pili[\s\xa0]*Pet|Втор(?:а[\s\xa0]*Петр?|о[\s\xa0]*Петр?)|II(?:\.[\s\xa0]*P(?:e(?:t(?:ru?)?)?)?|[\s\xa0]*P(?:e(?:tr?)?)?)|Second[\s\xa0]*P(?:et?)?|Tweede[\s\xa0]*Petr?|II\.?[\s\xa0]*But|II\.?[\s\xa0]*Петр?|Drug[ai][\s\xa0]*Piotr|(?:Друга|II\.?)[\s\xa0]*посланица[\s\xa0]*Петрова|(?:Друга|II\.?)[\s\xa0]*послання[\s\xa0]*Петра|Второ[\s\xa0]*съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св\.?[\s\xa0]*ап[\s\xa0]*Петра|Второ[\s\xa0]*съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св\.?[\s\xa0]*ап\.[\s\xa0]*Петра|(?:Друга|II\.?)[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Петра|(?:Друга|II\.?)[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра|Друге[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)|2(?:[\s\xa0]*(?:P(?:e(?:t(?:r(?:ov|u)|uru|ers)|[dr])|ēturu|[dt]|i\xE8)|بط|ปต|ਪਤਰਸ|பேதுரு|இராயப்பர்|पेत्राचें)|nd(?:\.[\s\xa0]*P(?:e(?:t[er]|r)|t)|[\s\xa0]*P(?:e(?:t[er]|r)|t))|베드|بط|[\s\xa0]*เปโตร|[\s\xa0]*ପିତରଙ|[\s\xa0]*پطرس|[\s\xa0]*Петр(?:ов[ао]|а)|[\s\xa0]*पत(?:्रुसको|रस)|[\s\xa0]*Py[e\xE8]|[\s\xa0]*Piotr|(?:e\.?[\s\xa0]*Petru|[\s\xa0]*patra|[\s\xa0]*Butro)s|[\s\xa0]*Pataras|[\s\xa0]*Ph(?:i(?:\-?(?:e\-?)?|a\-?)rơ|\xEA(?:r\xF4|\-?rơ))|(?:[\s\xa0]*(?:patrusk|Pietr)|\xB0\.?[\s\xa0]*Pietr|[o\xBA]\.?[\s\xa0]*Pedr|a[\s\xa0]*Pedr|a\.[\s\xa0]*Pedr|(?:[o\xBA]\.?)?[\s\xa0]*San[\s\xa0]*Pedr)o|(?:(?:d(?:e\.?|\.)?|\xE8me\.?|e(?:me\.?|\.)?)?[\s\xa0]*Pierr|[\s\xa0]*PH)e|[\s\xa0]*Pietarin[\s\xa0]*kirje|[\s\xa0]*(?:list[\s\xa0]*Petr[uů]|k\.?[\s\xa0]*Petro)v|[\s\xa0]*(?:P(?:jetri|\xE9)|[ei]\.?[\s\xa0]*Pjetri)t|Pet|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|[\s\xa0]*Пет[аъ]р|[\s\xa0]*п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Петар|\.(?:[\s\xa0]*(?:P(?:h(?:i(?:\-?(?:e\-?)?|a\-?)rơ|\xEA(?:r\xF4|\-?rơ))|y[e\xE8]|tr|\xE9ter|\xE9trus|ataras|i(?:e(?:t(?:arin[\s\xa0]*kirje|ro)|rre)|otra|\xE8)|jetrit|e(?:t(?:r(?:u(?:sbrevet|v)|ův|i|ova[\s\xa0]*Poslanica)|ersbrev)|dro|r))|Петр(?:ов[ао]|а)|ପିତରଙ|เปโตร|پطرس|पत(?:्रुसको|रस)|Butros|(?:San[\s\xa0]*Pedr|patrusk)o|list[\s\xa0]*Petr[uů]v|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Пет[аъ]р|п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Петар)|(?:[o\xBA]\.?[\s\xa0]*San[\s\xa0]*P|[o\xBA]\.?[\s\xa0]*P)edro)|\.?[\s\xa0]*پطر[\s\xa0]*س|(?:\.[\-?۔]|۔)پطرس|[ея]\.?[\s\xa0]*Петра|[\s\xa0]*(?:P(?:e(?:t(?:er?|ro?)?)?|je?|i(?:et?)?)?|पेत्र|பேது)|nd(?:\.[\s\xa0]*P(?:et?)?|[\s\xa0]*P(?:et?)?)|e(?:\.[\s\xa0]*Petr?|[\s\xa0]*Petr?)|[\s\xa0]*But|[\s\xa0]*Петр?|[\s\xa0]*पत(?:्रुस|र)|\.[\s\xa0]*(?:P(?:e(?:t(?:r(?:ov?|us?)?|e(?:rs?)?)?|dr)?|i(?:otr|e)|\xE9t|t)?|पत(?:्रुस|र)|Петр?|But)|(?:\.?[\s\xa0]*посланица[\s\xa0]*Петров|[ея]\.?[\s\xa0]*Петрус)а|[ея]\.?[\s\xa0]*Петира|(?:\.?[\s\xa0]*послание|\.?[\s\xa0]*послання)[\s\xa0]*Петра|[ея]\.?[\s\xa0]*послание[\s\xa0]*Петра|\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Петра|\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра|\-?(?:а(?:\.[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)|[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра))|я\.?[\s\xa0]*Петра|پطرس|е\.?[\s\xa0]*Петра|е\.?[\s\xa0]*Петрово|(?:е\.?[\s\xa0]*Петру|я\.?[\s\xa0]*Петру)са|(?:е\.?|я\.?)[\s\xa0]*Петира|е\.?[\s\xa0]*послання[\s\xa0]*Петра|(?:е\.?[\s\xa0]*послани|я\.?[\s\xa0]*послани)е[\s\xa0]*Петра|е\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Петра|е\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра|ге(?:\.[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)|[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)))))|(?:《(?:彼(?:[后後]|得后书)|撇特爾後|彼得後書|伯多祿後書)|(?:彼(?:[后後]|得后书)|撇特爾後)》|彼得後書》|伯多祿後書》|Petri[\s\xa0]*II|بطرس[\s\xa0]*الثانية|II[\s\xa0]*Petri|(?:II\.?|2\.?)[\s\xa0]*Pietarin|Toinen[\s\xa0]*Pietarin|彼(?:[后後]|得后书)|撇特爾後|彼得後書|伯多祿後書|(?:II(?:\.[\s\xa0]*P(?:etrov|hi)|[\s\xa0]*P(?:etrov|hi))|2(?:\.[\s\xa0]*P(?:etrov|hi)|[\s\xa0]*P(?:etrov|hi)))a|Dru(?:ga[\s\xa0]*Petrova(?:[\s\xa0]*poslanica)?|h[y\xFD][\s\xa0]*Petrov)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*(?:Pet(?:r(?:u(?:sbrevet|v)|ův|i)|ersbrev)|petr[aā]ce[mṃ])|F\xF8rste[\s\xa0]*Petersbrev|1[\s\xa0]*P\xE9trus|1[\s\xa0]*Pedro|(?:1(?:st(?:\.[\s\xa0]*P(?:ete|t)|[\s\xa0]*P(?:ete|t))|[\s\xa0]*Pt)|First[\s\xa0]*P(?:ete|t)|1[\s\xa0]*P\xE9te)r|1[\s\xa0]*Piotra|1[\s\xa0]*Petrova[\s\xa0]*Poslanica|I(?:[\s\xa0]*P(?:ie(?:tarin[\s\xa0]*kirj|rr)e|etru[sv]|\xE9trus|ietro|edro|(?:\xE9te|ete|t)r|iotra|etrova[\s\xa0]*Poslanica)|\.[\s\xa0]*P(?:ie(?:tarin[\s\xa0]*kirj|rr)e|\xE9trus|ietro|(?:\xE9te|t)r|iotra|e(?:t(?:rova[\s\xa0]*Poslanica|er)|dro))))|(?:I\.?[\s\xa0]*Petrov|1[\s\xa0]*Pedr|1[\s\xa0]*Petrus|F\xF8rste[\s\xa0]*Peters)|(?:1(?:\.[\s\xa0]*Пет(?:рус|ир)|[\s\xa0]*Пет(?:рус|ир))а)|(?:《(?:彼(?:得前[书書]|前)|撇特爾前|伯多祿前書)》|一[ヘペ]トロ|벧전|Ⅰ[\s\xa0]*[ヘペ]テロ|[ヘペ](?:テロの(?:前の書|手紙Ⅰ|第一の手紙)|トロ(?:の手紙一|[\s\xa0]*1|の第一の手紙))|Π[έε]τρου[\s\xa0]*Α['ʹʹ΄’]|Α['ʹʹ΄’][\s\xa0]*Π[έε]τρου|베드로(?:의[\s\xa0]*첫째[\s\xa0]*서간|[1전]서)|הראשונה[\s\xa0]*פטרוס|ପିତରଙ୍କ[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ਪਤਰਸ[\s\xa0]*ਦੀ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੱਤ੍ਰੀ|प(?:ेत्राचें?[\s\xa0]*पहिले|त्रुसको[\s\xa0]*पहिलो)[\s\xa0]*पत्र|pa(?:ṭras[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|tras[\s\xa0]*dī[\s\xa0]*pahilī[\s\xa0]*pattrī)|رسالة[\s\xa0]*(?:القديس[\s\xa0]*بطرس[\s\xa0]*الأولى|بطرس[\s\xa0]*(?:الأولى|1))|Butros[\s\xa0]*Kowaad|Fyrra[\s\xa0]*P[e\xE9]tursbr[e\xE9]f|Epistula[\s\xa0]*I[\s\xa0]*Petri|א(?:גרתו[\s\xa0]*הראשונה[\s\xa0]*של[\s\xa0]*פטרוס[\s\xa0]*השליח|יגרת[\s\xa0]*פטרוס[\s\xa0]*הראשונה)|Epistula[\s\xa0]*Petri[\s\xa0]*I|P(?:ēturu[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]vatu[\s\xa0]*Nirupam|rvn[i\xED][\s\xa0]*Pt|et(?:uru[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]vatu[\s\xa0]*Nirupam|ro[\s\xa0]*I))|I(?:\.[\s\xa0]*P(?:e(?:t(?:r(?:u[sv]|[io])|e)|r)|i[e\xE8]|t)|[\s\xa0]*P(?:e(?:t(?:r[ou]|e)|r)|t|i[e\xE8]))|First[\s\xa0]*P(?:e(?:t[er]|r)|t)|پطر(?:[\s\xa0]*س[\s\xa0]*کاپہلا[\s\xa0]*عا[\s\xa0]*|س[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عا)م[\s\xa0]*خط|பேதுரு[\s\xa0]*(?:எழுதிய[\s\xa0]*முதல(?:ா(?:வது[\s\xa0]*நிருப|ம்[\s\xa0]*கடித)|்[\s\xa0]*திருமுக)|முதல்[\s\xa0]*திருமுக)ம்|ପ୍ରଥମ[\s\xa0]*ପିତରଙ|(?:اوّل|۱)[\s\xa0]*پطرس|Прва[\s\xa0]*Петров[ао]|I\.?[\s\xa0]*Петр(?:ов[ао]|а)|(?:Premye[\s\xa0]*P[iy]|I\.?[\s\xa0]*Py)[e\xE8]|(?:(?:Els[oő][\s\xa0]*P[e\xE9]|F\xF8rste[\s\xa0]*Pe)te|I\.?[\s\xa0]*Ped|I\.?[\s\xa0]*Piot)r|(?:Fyrra[\s\xa0]*almenna[\s\xa0]*br[e\xE9]f[\s\xa0]*P[e\xE9]tur|Eerste[\s\xa0]*Petru|I\.?[\s\xa0]*Butro|Erste[\s\xa0]*Petru)s|I\.?[\s\xa0]*Ph(?:i(?:\-?(?:e\-?)?|a\-?)rơ|\xEA(?:r\xF4|\-?rơ))|Pierwsz[aey][\s\xa0]*Piotra|(?:(?:(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*y)a[\s\xa0]*P|Prima[\s\xa0]*Pi|Prim(?:a[\s\xa0]*lettera[\s\xa0]*di|o)[\s\xa0]*Pi|Kwanza[\s\xa0]*P)et|Primero?[\s\xa0]*Ped|Una[\s\xa0]*Ped|(?:Primeir[ao]|Unang)[\s\xa0]*Ped|(?:Primer|I\.?|Primero)[\s\xa0]*San[\s\xa0]*Ped)ro|Premi(?:(?:\xE8re|ere?)s[\s\xa0]*|(?:\xE8re|ere?)[\s\xa0]*)Pierre|Ensimm[a\xE4]inen[\s\xa0]*Pietarin[\s\xa0]*kirje|(?:Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Petro|Prvn[i\xED][\s\xa0]*Petr[uů]|I\.?[\s\xa0]*Petrů|Prv\xE1[\s\xa0]*Petro|(?:Prvn[i\xED]|I\.?)[\s\xa0]*list[\s\xa0]*Petr[uů]|Pet(?:ers[\s\xa0]*(?:F\xF8rste|1\.?)[\s\xa0]*B|rus[\s\xa0]*f[o\xF6]rsta[\s\xa0]*b)re)v|(?:Prv[y\xFD][\s\xa0]*Petrov[\s\xa0]*lis|I\.?[\s\xa0]*P\xE9)t|F[o\xF6]rsta[\s\xa0]*Petrusbrevet|(?:(?:p(?:etr[aā]ce[mṃ][\s\xa0]*pahile|atrusko[\s\xa0]*pahilo)[\s\xa0]*pa|Per[sš]e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pe)tr|Prvn[i\xED][\s\xa0]*Petrov|Koiro[\s\xa0]*PHeexiroos|(?:Pierwsz[aey]|I\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotr)a|Prva[\s\xa0]*Petrova[\s\xa0]*Poslanica|(?:П(?:ърв(?:о[\s\xa0]*(?:послание[\s\xa0]*на[\s\xa0]*)?|а[\s\xa0]*)Петъ|рв[ао][\s\xa0]*Пета)|I\.?[\s\xa0]*Пет[аъ])р|(?:Прв[ао]|I\.?)[\s\xa0]*писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Петар|(?:Прв[ао][\s\xa0]*послани|I\.?[\s\xa0]*послани)е[\s\xa0]*на[\s\xa0]*апостол[\s\xa0]*Петар|(?:اوّل|۱)[\s\xa0]*پطر[\s\xa0]*س|(?:اوّل[\-?۔]|۱[\-?۔])پطرس|П(?:ърв[ао]|рво)[\s\xa0]*Петрово|Α['ʹʹ΄’][\s\xa0]*Π[έε](?:τρ?)?|Kwanza[\s\xa0]*Pet|F\xF8rste[\s\xa0]*Pet|Els[oő][\s\xa0]*P[e\xE9]t|אגרתו[\s\xa0]*הראשונה[\s\xa0]*של[\s\xa0]*פטרוס[\s\xa0]*השלי|Prvn[i\xED][\s\xa0]*P(?:etr)?|I(?:\.[\s\xa0]*P(?:e(?:t(?:ru?)?)?)?|[\s\xa0]*P(?:e(?:tr?)?)?)|Първ(?:а[\s\xa0]*Петр?|о[\s\xa0]*Петр?)|First[\s\xa0]*P(?:et?)?|Eerste[\s\xa0]*Petr?|I\.?[\s\xa0]*But|I\.?[\s\xa0]*Петр?|Pierwsz[aey][\s\xa0]*Piotr|Prva[\s\xa0]*Petrov|(?:Прва[\s\xa0]*послани|I\.?[\s\xa0]*послани)ца[\s\xa0]*Петрова|I\.?[\s\xa0]*послання[\s\xa0]*Петра|Първо[\s\xa0]*съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св\.?[\s\xa0]*ап[\s\xa0]*Петра|Първо[\s\xa0]*съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св\.?[\s\xa0]*ап\.[\s\xa0]*Петра|I\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Петра|I\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра|Перш[ае][\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)|1(?:[\s\xa0]*(?:P(?:e(?:t(?:r(?:ov|u)|uru|ers)|[dr])|ēturu|[dt]|i\xE8)|بط|ปต|ਪਤਰਸ|பேதுரு|இராயப்பர்|पेत्राचें)|st(?:\.[\s\xa0]*P(?:e(?:t[er]|r)|t)|[\s\xa0]*P(?:e(?:t[er]|r)|t))|베드|بط|[\s\xa0]*เปโตร|[\s\xa0]*ପିତରଙ|[\s\xa0]*پطرس|[\s\xa0]*Петр(?:ов[ао]|а)|[\s\xa0]*पत(?:्रुसको|रस)|[\s\xa0]*Py[e\xE8]|[\s\xa0]*Piotr|(?:e\.?[\s\xa0]*Petru|[\s\xa0]*patra|[\s\xa0]*Butro)s|[\s\xa0]*Pataras|[\s\xa0]*Ph(?:i(?:\-?(?:e\-?)?|a\-?)rơ|\xEA(?:r\xF4|\-?rơ))|(?:[\s\xa0]*(?:patrusk|Pietr)|\xB0\.?[\s\xa0]*Pietr|[o\xBA]\.?[\s\xa0]*Pedr|a[\s\xa0]*Pedr|a\.[\s\xa0]*Pedr|(?:[o\xBA]\.?)?[\s\xa0]*San[\s\xa0]*Pedr)o|(?:(?:er(?:e\.?|\.)?|\xE8?re\.?)?[\s\xa0]*Pierr|[\s\xa0]*PH)e|[\s\xa0]*Pietarin[\s\xa0]*kirje|[\s\xa0]*(?:list[\s\xa0]*Petr[uů]|k\.?[\s\xa0]*Petro)v|[\s\xa0]*(?:P(?:jetri|\xE9)|[ei]\.?[\s\xa0]*Pjetri)t|Pet|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|[\s\xa0]*Пет[аъ]р|[\s\xa0]*п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Петар|\.(?:[\s\xa0]*(?:P(?:h(?:i(?:\-?(?:e\-?)?|a\-?)rơ|\xEA(?:r\xF4|\-?rơ))|y[e\xE8]|tr|\xE9ter|\xE9trus|ataras|i(?:e(?:t(?:arin[\s\xa0]*kirje|ro)|rre)|otra|\xE8)|jetrit|e(?:t(?:r(?:u(?:sbrevet|v)|ův|i|ova[\s\xa0]*Poslanica)|ersbrev)|dro|r))|Петр(?:ов[ао]|а)|ପିତରଙ|เปโตร|پطرس|पत(?:्रुसको|रस)|Butros|(?:San[\s\xa0]*Pedr|patrusk)o|list[\s\xa0]*Petr[uů]v|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Piotra|Пет[аъ]р|п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Петар)|(?:[o\xBA]\.?[\s\xa0]*San[\s\xa0]*P|[o\xBA]\.?[\s\xa0]*P)edro)|\.?[\s\xa0]*پطر[\s\xa0]*س|(?:\.[\-?۔]|۔)پطرس|[ея]\.?[\s\xa0]*Петра|[\s\xa0]*(?:P(?:e(?:t(?:er?|ro?)?)?|je?|i(?:et?)?)?|पेत्र|பேது)|st(?:\.[\s\xa0]*P(?:et?)?|[\s\xa0]*P(?:et?)?)|e(?:\.[\s\xa0]*Petr?|[\s\xa0]*Petr?)|[\s\xa0]*But|[\s\xa0]*Петр?|[\s\xa0]*पत(?:्रुस|र)|\.[\s\xa0]*(?:P(?:e(?:t(?:r(?:ov?|us?)?|e(?:rs?)?)?|dr)?|i(?:otr|e)|\xE9t|t)?|पत(?:्रुस|र)|Петр?|But)|(?:\.?[\s\xa0]*посланица[\s\xa0]*Петров|[ея]\.?[\s\xa0]*Петрус)а|[ея]\.?[\s\xa0]*Петира|(?:\.?[\s\xa0]*послание|\.?[\s\xa0]*послання)[\s\xa0]*Петра|[ея]\.?[\s\xa0]*послание[\s\xa0]*Петра|\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Петра|\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра|\-?(?:а(?:\.[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)|[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра))|я\.?[\s\xa0]*Петра|پطرس|е\.?[\s\xa0]*Петра|е\.?[\s\xa0]*Петрово|(?:е\.?[\s\xa0]*Петру|я\.?[\s\xa0]*Петру)са|(?:е\.?|я\.?)[\s\xa0]*Петира|е\.?[\s\xa0]*послання[\s\xa0]*Петра|(?:е\.?[\s\xa0]*послани|я\.?[\s\xa0]*послани)е[\s\xa0]*Петра|е\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Петра|е\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра|ше(?:\.[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)|[\s\xa0]*(?:послання[\s\xa0]*Петра|Петр(?:ово|а)|послання[\s\xa0]*апостола[\s\xa0]*Петра|соборне[\s\xa0]*послання[\s\xa0]*(?:св\.?[\s\xa0]*апостола[\s\xa0]*|апостола[\s\xa0]*)?Петра)))))|(?:《(?:彼(?:得前[书書]|前)|撇特爾前|伯多祿前書)|(?:彼(?:得前[书書]|前)|撇特爾前)》|伯多祿前書》|I[\s\xa0]*Petri|بطرس[\s\xa0]*الأولى|(?:1\.?|I\.?)[\s\xa0]*Pietarin|Ensimm[a\xE4]inen[\s\xa0]*Pietarin|彼(?:得前[书書]|前)|撇特爾前|伯多祿前書|(?:1(?:\.[\s\xa0]*P(?:etrov|hi)|[\s\xa0]*P(?:etrov|hi))|I(?:\.[\s\xa0]*P(?:etrov|hi)|[\s\xa0]*P(?:etrov|hi)))a|P(?:rv(?:a[\s\xa0]*Petrova(?:[\s\xa0]*poslanica)?|[y\xFD][\s\xa0]*Petrov)|et(?:ers[\s\xa0]*f\xF8rste[\s\xa0]*brev|ri[\s\xa0]*I|er))))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Rom"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:R(?:o(?:m(?:a(?:iakhoz|ns)|s|arbrevet|e(?:inenbrief|rbrevet|n)|verjabr[e\\xE9]fi\\xF0)|emer|s|ome)|hufeiniaid|mn?s|\\xF6mer|\\xF3maiakhoz|\\xF3mverjabr[e\\xE9]fi\\xF0)|《(?:羅(?:爾瑪書|馬書)?|罗(?:马书)?)》|῾Ρω|롬|รม|โรม|Ρωμ|ﺭﻭﻣﻴﺔ|Римл|ロ(?:ーマ(?:の信徒への手紙|人への手紙|書)|マ人への書)|Προς[\\s\\xa0]*Ρωμα[ίι]ους|로마(?:[\\s\\xa0]*신자들에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|ਰੋਮੀਆਂ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|ରୋମୀୟଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*Romano|R(?:o(?:ma(?:in|nd)|amn)|pman)s|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Romanos|r(?:ōmiyōṅ[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|omīāṃ[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī)|पौलाचे[\\s\\xa0]*रोमकरांस[\\s\\xa0]*पत्र|रोम(?:ीहरूलाई[\\s\\xa0]*प(?:ावलको[\\s\\xa0]*प)?त्र|कंरास|ियों)|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Warumi|L(?:ettera[\\s\\xa0]*ai[\\s\\xa0]*Romani|a\\-?m\\xE3)|(?:List[\\s\\xa0]*(?:R(?:\\xEDman[uů]|iman[ouů])|Ř[i\\xED]man[uů])|R(?:[i\\xED]msky|[u\\xF2]|zy)|Ř[i\\xED])m|Ur[oō]marukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*הרומאים|א(?:גרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל\\-?הרומיי|ל[\\s\\xa0]*הרומיי?)ם|உரோமையர்|உரோம(?:ையருக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*திருமுக|ருக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*நிருப)ம்|ரோம(?:ாபுரியாருக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*கடிதம|ர)்|الرسالة[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*رومية|ر(?:ومیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*(?:پولس[\\s\\xa0]*رسول[\\s\\xa0]*)?کا[\\s\\xa0]*خط|ُومِیوں|سالة[\\s\\xa0]*(?:بولس[\\s\\xa0]*الرسول[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*رومية|روما))|(?:Ro(?:omalaiskirj|mak[e\\xEB]v)|Kirje[\\s\\xa0]*roomalaisill)e|(?:rom(?:īhar[uū]l[aā][iī]|kar[aā][mṃ]s|ihar[uū]l[aā][iī])[\\s\\xa0]*patr|R\\xF4m|Br[e\\xE9]f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*R[o\\xF3]mverj)a|(?:(?:Barua[\\s\\xa0]*kwa[\\s\\xa0]*War|Mga[\\s\\xa0]*Taga\\-?R)o|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Waro|R\\xF4\\-?|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*Ro|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Ro)ma|Rom(?:iyo|as)n|List[\\s\\xa0]*(?:[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*)?do[\\s\\xa0]*Rzymian|P(?:a(?:vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Rimljanima|ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Romerne)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*rymljan)|Римјаните|R(?:o(?:m(?:e(?:inen|r)|an)?|oma?)?|mn?|z|\\xF6m|[i\\xED]m|huf|\\xF3ma?)?|ローマ(?:人へ)?|Римјани|Ř|रोम(?:ियो|ी)|உரோ|روم?|П(?:ослан(?:и(?:е[\\s\\xa0]*(?:на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Римляни|към[\\s\\xa0]*римляните)|ца[\\s\\xa0]*Римљанима)|ня[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*|апостола[\\s\\xa0]*Павла[\\s\\xa0]*)?до[\\s\\xa0]*римлян|ие[\\s\\xa0]*к[\\s\\xa0]*Римлянам)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*христијаните[\\s\\xa0]*во[\\s\\xa0]*Рим))|(?:羅(?:爾瑪書|馬書)?》|罗》|로마|罗马书》|《(?:羅(?:爾瑪|馬)書|罗马书)|Warumi|رومیوں|ରୋମୀୟଙ୍କ|Ρωμα[ίι]ους|римляните|Рим(?:љанима|ляни)|До[\\s\\xa0]*римлян|ਰੋਮੀਆਂ[\\s\\xa0]*ਨੂੰ|Римлянам|К[\\s\\xa0]*Римлянам|אל[\\s\\xa0]*הרומאים|Ur[oō]marukku|ad[\\s\\xa0]*Romanos|rom(?:īhar[uū]l[aā][iī]|kar[aā][mṃ]s|īāṃ|ihar[uū]l[aā][iī])|रोम(?:करांस[\\s\\xa0]*पत्र|ीहरूलाई)|Ř[i\\xED]man[uů]m|R(?:\\xEDman[uů]m|zymian|iman[ouů]m|oman(?:os|i))|(?:Taga\\-?[\\s\\xa0]*R|War)oma|Rimljanima|羅(?:爾瑪書|馬書)?|罗(?:马书)?|《[罗羅]|Рим(?:лян)?|ਰੋਮੀਆਂ|रोमकरांस|Roma(?:no)?|Roomalaisille|Romerne|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*romerne|oslanica[\\s\\xa0]*Rimljanima)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Song"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ang[\\s\\xa0]*Awit[\\s\\xa0]*n(?:i[\\s\\xa0]*S[ao]lom[o\\xF3]n|g[\\s\\xa0]*mga[\\s\\xa0]*Awit)|Ho(?:heslied[\\s\\xa0]*Salomos|ga[\\s\\xa0]*visan)|Пісня[\\s\\xa0]*над[\\s\\xa0]*піснями[\\s\\xa0]*Соломона)|(?:Ἆσ|아가|พซม|諸歌の歌|《雅?歌》|ପରମଗୀତ|श्रेष्ठ|गीतरत्न|ﻧﺸﻴﺪ[\\s\\xa0]*ﺍﻷﻧﺸﺎ|שיר(?:[\\s\\xa0]*השירים|י[\\s\\xa0]*שלמה)|เพลง(?:ซา|โซ)โลมอน|غزلُ?[\\s\\xa0]*الغزلات|Ασμα[\\s\\xa0]*Ασμ[άα]των|Άσμα[\\s\\xa0]*Ασμ[άα]των|ਸਲੇਮਾਨ[\\s\\xa0]*ਦਾ[\\s\\xa0]*ਗੀਤ|Црковни[\\s\\xa0]*химни|L(?:aul\\.?[\\s\\xa0]*|j)l|உன்னத[\\s\\xa0]*சங்கீதம்|இ(?:னிமைமிகு[\\s\\xa0]*பாடல்|பா)|نشيد[\\s\\xa0]*الأناشيد|سفر[\\s\\xa0]*نشيد[\\s\\xa0]*الأنشاد|S(?:o[Sln]|S|iq)|S[\\s\\xa0]*of[\\s\\xa0]*S|A(?:\\.?[\\s\\xa0]*ng[\\s\\xa0]*A|w[\\s\\xa0]*ni[\\s\\xa0]*S)|H(?:o(?:ga(?:[\\s\\xa0]*V|v)|oglied|hes[\\s\\xa0]*Lied)|\\xF6gav|ld)|P(?:i(?:s(?:e[nň][\\s\\xa0]*p[i\\xED]sn[i\\xED]|nja[\\s\\xa0]*nad[\\s\\xa0]*pisnjamy)|ese[nň][\\s\\xa0]*piesn[i\\xED])|\\xEDse[nň][\\s\\xa0]*p[i\\xED]sn[i\\xED]|NP|Š)|Salomo(?:s[\\s\\xa0]*(?:H\\xF8i|h\\xF8y)|ns[\\s\\xa0]*H\\xF8j)sang|Musthikaning[\\s\\xa0]*Kidung|K(?:anti(?:d[\\s\\xa0]*de[\\s\\xa0]*Kantik|ko)|idung[\\s\\xa0]*Agung)|स(?:ुलेमानको[\\s\\xa0]*श्रेष्ठ|्रेस्ट[\\s\\xa0]*)गीत|V[lľ]p|П(?:ес(?:н(?:а(?:та[\\s\\xa0]*на(?:д[\\s\\xa0]*песните|[\\s\\xa0]*Соломон)|[\\s\\xa0]*над[\\s\\xa0]*песните)|и[\\s\\xa0]*Песне[ий])|\\.?[\\s\\xa0]*на[\\s\\xa0]*песн)|існя[\\s\\xa0]*Пісне[ий]|[\\s\\xa0]*П|нп|\\.[\\s\\xa0]*П)|(?:P(?:i(?:e(?:ś[nń]|s[nń])[\\s\\xa0]*Salomon|[\\s\\xa0]*b\\xE8l[\\s\\xa0]*Chante[\\s\\xa0]*)|jesma[\\s\\xa0]*nad[\\s\\xa0]*pjesmam)|Wimbo[\\s\\xa0]*(?:Ulio[\\s\\xa0]*)?Bor|Siiquwaa[\\s\\xa0]*Saba|g[iī]tratn|P(?:\\xEDse[nň][\\s\\xa0]*[SŠ]|ise[nň][\\s\\xa0]*[SŠ])alamounov|Piese[nň][\\s\\xa0]*[SŠ]alam[u\\xFA]nov|Ve[lľ]piese[nň][\\s\\xa0]*[SŠ]alam[u\\xFA]nov)a|(?:Nh\\xE3|Diễm)[\\s\\xa0]*ca|Sn?gs|T(?:he[\\s\\xa0]*Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n))s|\\xECnh[\\s\\xa0]*ca)|(?:s(?:ulem[aā]nko[\\s\\xa0]*[sš]re[sṣ][tṭ]ʰag[iī]|alemān[\\s\\xa0]*dā[\\s\\xa0]*gī)|ġazalu[\\s\\xa0]*l\\-?ġazalā|Reshthagee|Awit[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*Awi)t|(?:U[nṉ][nṉ]atapp[aā][tṭ][tṭ]|Laulujen[\\s\\xa0]*laul|Korkea[\\s\\xa0]*veis)u|Pie(?:ś[nń][\\s\\xa0]*nad[\\s\\xa0]*Pie[sś]|s[nń][\\s\\xa0]*nad[\\s\\xa0]*Pie[sś])niami|Kantikulo|(?:Lj[o\\xF3]\\xF0alj[o\\xF3]\\xF0i|H\\xF8[jy]sange|H\\xF6ga[\\s\\xa0]*Visa|Gabaygii[\\s\\xa0]*Sulaymaa)n|C(?:an(?:t(?:ic(?:o[\\s\\xa0]*dei[\\s\\xa0]*Cantici|um[\\s\\xa0]*Canticorum)|\\.?[\\s\\xa0]*Cantic|ări|ico[\\s\\xa0]*Superlativo|ico[\\s\\xa0]*de[\\s\\xa0]*Salom[a\\xE3]o|ar(?:e(?:a[\\s\\xa0]*(?:C[a\\xE2]nt[aă]rilor|lui[\\s\\xa0]*Solomon)|s[\\s\\xa0]*de[\\s\\xa0]*Salom[a\\xE3]o)|i))|iad(?:[\\s\\xa0]*Solomon|au))|\\xE2ntari|n?t|\\xE2ntări|\\xE2ntico[\\s\\xa0]*Superlativo|\\xE2ntico[\\s\\xa0]*de[\\s\\xa0]*Salom[a\\xE3]o|hante[\\s\\xa0]*Salomon|\\xE2ntarea[\\s\\xa0]*(?:C[a\\xE2]nt[aă]rilor|lui[\\s\\xa0]*Solomon))|உன்னத[\\s\\xa0]*பாட்டு|சாலொமோனின்[\\s\\xa0]*உன்னதப்பாட்டு|(?:Kantiku[\\s\\xa0]*i[\\s\\xa0]*Kantik[e\\xEB]v|Cantico[\\s\\xa0]*di[\\s\\xa0]*Salomon)e|Salamon[\\s\\xa0]*[e\\xE9]neke|\\xC9nekek[\\s\\xa0]*[e\\xE9]neke|(?:C(?:\\xE2ntico(?:s[\\s\\xa0]*dos[\\s\\xa0]*C[a\\xE2]|[\\s\\xa0]*dos[\\s\\xa0]*C[a\\xE2])|antico(?:s[\\s\\xa0]*dos[\\s\\xa0]*C[a\\xE2]|[\\s\\xa0]*dos[\\s\\xa0]*C[a\\xE2]))ntico|Ho(?:helied[\\s\\xa0]*Salomoni|j))s|Cantique[\\s\\xa0]*des[\\s\\xa0]*Cantiques|Cantare[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Cantares|E(?:l[\\s\\xa0]*Cantar[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Cantares|nekek[\\s\\xa0]*[e\\xE9]neke)|H(?:\\xF8[jy]s|l|\\xF6ga[\\s\\xa0]*V|oogl)|Ασ|아|\\xC9n|نش|உன்ன|Wim|So|Gab|P(?:\\xEDs|j|ie?s)|Kant|Ve[lľ]p|Пісн|Sn?g|The[\\s\\xa0]*Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n))|C(?:\\xE2nt|an)|Песма[\\s\\xa0]*(?:над[\\s\\xa0]*песмам|Соломонов)а|Песнь[\\s\\xa0]*Суле[ий]мана|Песнь[\\s\\xa0]*Сула[ий]мона|Песнь[\\s\\xa0]*песне[ий][\\s\\xa0]*Соломона|Книга[\\s\\xa0]*П(?:есен[\\s\\xa0]*на[\\s\\xa0]*Песните,[\\s\\xa0]*от|існі[\\s\\xa0]*Пісень)[\\s\\xa0]*Соломона)|(?:《雅?歌|歌》|雅歌》|T\\xECnh|பாடல்|Pnp|Pise[nň]|P(?:\\xED|ie)se[nň]|Ve[lľ]piese[nň]|Ho(?:hes?lied|ga[\\s\\xa0]*v)|श्रेष्ठगीत|உன்னதப்பாட்டு|H\\xF6ga[\\s\\xa0]*visan|Awit[\\s\\xa0]*n(?:i[\\s\\xa0]*S[ao]lom[o\\xF3]n|g[\\s\\xa0]*mga[\\s\\xa0]*Awit)|П(?:існ(?:я[\\s\\xa0]*над[\\s\\xa0]*піснями|і[\\s\\xa0]*Пісень)|ес(?:ен[\\s\\xa0]*на[\\s\\xa0]*песните|нь))|Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n))s|Gabaygii|Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]n|ng)|alom[ao]n))?|H[o\\xF6]ga|雅歌|Песн?|C(?:ant(?:i(?:c(?:o(?:[\\s\\xa0]*dei[\\s\\xa0]*cantici|s)|um[\\s\\xa0]*canticorum|o)|que(?:[\\s\\xa0]*des[\\s\\xa0]*cantiques|s)?)|are(?:a[\\s\\xa0]*cantarilor|s)|ar[\\s\\xa0]*de[\\s\\xa0]*los[\\s\\xa0]*Cantares)?|\\xE2nticos|hante)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Prov"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:格言の書|잠언|《箴言?》|ﺃﻣﺜﺎﻝ|משלים|פתגמים|Изрек[еи]|箴言[\\s\\xa0]*知恵の泉|ส(?:ุภาษิต|ภษ)|ਕਹਾਉ(?:ਂਤਾ|ਤਾਂ)|ହିତୋପଦେଶ|kahāutāṃ|Π(?:αροιμ[ίι](?:αι|ες)|ρμ)|நீமொ|नीति(?:(?:[बव]|[\\s\\xa0]*व)चन|सूत्रें)|مثل|امثال|(?:اَ|أ)مثال|سفر[\\s\\xa0]*الأمثال|N[iī]timo[lḻ]ika[lḷ]|நீதிமொழிகள்|பழமொழி[\\s\\xa0]*ஆகமம்|При(?:пові(?:док|сті)|тчі[\\s\\xa0]*Соломона|че[\\s\\xa0]*Солом[оу]нове)|Мудрые[\\s\\xa0]*изречения|Okv|हितोपदेशको[\\s\\xa0]*पुस्तक|L(?:i(?:ber[\\s\\xa0]*Proverbiorum|v[\\s\\xa0]*Pwov[e\\xE8]b[\\s\\xa0]*yo)|e(?:emiso|m))|ams̱āl|(?:Or\\xF0skvi\\xF0irni|Iz)r|Ordsprogenes[\\s\\xa0]*Bog|S(?:a(?:lomos[\\s\\xa0]*Ordsprog|nanlaskut)|prichw[o\\xF6]rter|nl)|(?:n[iī]tis[uū]tr|Mudre[\\s\\xa0]*izrek|Ordspr[a\\xE5]ken|Spr(?:\\xFC|ue?)ch)e|(?:Salomos[\\s\\xa0]*Ordspr[a\\xE5]|hitopade[sš]ko[\\s\\xa0]*pusta)k|M(?:aahmaahyadi|[ei]thal)i|Oroverbs|(?:(?:Wulang[\\s\\xa0]*Bebas|Neetivach)a|Ch\\xE2m[\\s\\xa0]*ng\\xF4|Mga[\\s\\xa0]*Kawikaa|Ordspr[a\\xE5]ksboke|Spreuke)n|(?:Mga[\\s\\xa0]*Panultih|Diarh?ebi)on|P(?:r(?:o(?:v(?:e(?:rb(?:e(?:le[\\s\\xa0]*lui[\\s\\xa0]*Solomon|s)|i(?:os|a)|s)|b(?:io)?s)|\\xE9rbios)|bv?erb(?:io)?s)|ypovisti|vbs|verbs|everbs|[i\\xED]slovia|(?:v(?:erbi|b)|everbi)os|zypowie[sś]ci[\\s\\xa0]*Salomonowych)|[e\\xE9]ldabesz[e\\xE9]dek|oslovice|[vw]|or?verb(?:io)?s|ildele[\\s\\xa0]*lui[\\s\\xa0]*Solomon)|(?:P(?:r[i\\xED]slov(?:\\xED[\\s\\xa0]*[SŠ]|i[\\s\\xa0]*[SŠ])|ř[i\\xED]slov[i\\xED][\\s\\xa0]*[SŠ])alomounov|Sananlaskujen[\\s\\xa0]*kirj|Fjal[e\\xEB]t[\\s\\xa0]*e[\\s\\xa0]*urt)a|K(?:s(?:\\.[\\s\\xa0]*Przy(?:powie[sś]ci[\\s\\xa0]*Salomona|sł[o\\xF3]w)|[\\s\\xa0]*Przy(?:powie[sś]ci[\\s\\xa0]*Salomona|sł[o\\xF3]w)|i[eę]g[ai][\\s\\xa0]*Przy(?:powie[sś]ci[\\s\\xa0]*Salomona|sł[o\\xF3]w))|\\.[\\s\\xa0]*pr[i\\xED]slov[i\\xED]|[\\s\\xa0]*pr[i\\xED]slov[i\\xED]|niha[\\s\\xa0]*pr[i\\xED]slov[i\\xED]|aw)|П(?:ословиц|риказк)и|P(?:r(?:(?:v(?:erbi|b)|everbi)o|verb|vb?|everb|[i\\xED]s|o(?:v(?:erb(?:io?|e)?)?)?|z(?:yp?)?)?|ř(?:[i\\xED]s)?|[e\\xE9]ld)|[格잠]|משלי|ام|Diar|நீதி|नीतिसूत्रे|M(?:ith?|eth|aah)|Пр(?:итч?)?|Мудр|Ords(?:p(?:rogene)?)?|हितोपदेश|S(?:ananl|pr)|Книга[\\s\\xa0]*(?:При(?:казок[\\s\\xa0]*Соломонових|тчи[\\s\\xa0]*Соломонови|повісте[ий][\\s\\xa0]*Соломонових)|притче[ий][\\s\\xa0]*Соломоновых))|(?:P(?:r(?:[i\\xED]slov[i\\xED]|overbele)|ř[i\\xED]slov[i\\xED]|wov[e\\xE8]b)|箴言?》|《箴言|Ch\\xE2m|नीति|الأمثال|हितोपदेशको|hitopade[sš]ko|(?:Panultiho|Kawikaa)n|Sananlaskujen|箴言?|《箴|При(?:тч(?:и[\\s\\xa0]*Соломонови|і)|казок|тчи|повісте[ий](?:[\\s\\xa0]*соломонових)?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Wis"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:ソロモンの(?:知恵書|智慧)|《智慧篇》|지혜서|知恵の書|ปรีชาญาณ|חכמת[\\s\\xa0]*שלמה|سفر[\\s\\xa0]*الحكمة|حكمة[\\s\\xa0]*سليمان|ஞானாகமம்|சா(?:லமோனின்[\\s\\xa0]*ஞானம்|ஞா)|B[o\\xF6]lcsess[e\\xE9]g|Vis(?:dommens[\\s\\xa0]*(?:Bog|bok)|hetens[\\s\\xa0]*bok)|Σοφ[ίι]α[\\s\\xa0]*Σ(?:αλωμ[ωώ]|ολομ[ωώ])ντος|K(?:niha[\\s\\xa0]*moudrost\\xED|ar)|Weisheit[\\s\\xa0]*Salomos|Liber[\\s\\xa0]*Sapientiae|S(?:a(?:l(?:omo(?:s[\\s\\xa0]*(?:Visdom|vishet)|n[\\s\\xa0]*viisaus)|amon[\\s\\xa0]*b[o\\xF6]lcsess[e\\xE9]ge)|pien(?:za[\\s\\xa0]*di[\\s\\xa0]*Salomone|tia[\\s\\xa0]*Salomonis))|peki[\\s\\xa0]*Sal[o\\xF3]mons|Sal|b)|(?:Viisauden[\\s\\xa0]*kirj|Sabidur[i\\xED])a|M(?:\\xFAdros(?:ti|ť)|udros[tť]|dr|[aą]dro[sś][cć][\\s\\xa0]*Salomona|oudrost[\\s\\xa0]*[SŠ]alomounova)|Het[\\s\\xa0]*boek[\\s\\xa0]*der[\\s\\xa0]*wijsheid|Мудрости[\\s\\xa0]*Соломонове|Прем(?:ъдрост[\\s\\xa0]*на[\\s\\xa0]*Соломон|[\\s\\xa0]*Сол|удорсти[\\s\\xa0]*Соломонове)|Sabedoria[\\s\\xa0]*de[\\s\\xa0]*Salom[a\\xE3]o|Kawicaksanan[\\s\\xa0]*Salomo|De[\\s\\xa0]*wijsheid[\\s\\xa0]*van[\\s\\xa0]*Salomo|Премудр(?:ости|ість)[\\s\\xa0]*Соломона|Книга[\\s\\xa0]*(?:Прем(?:ъдрост[\\s\\xa0]*Соломонов|удрості[\\s\\xa0]*Соломон)а|на[\\s\\xa0]*мъдростта|Мудрости|Мудрост[\\s\\xa0]*Соломонова)|(?:K(?:s(?:\\.[\\s\\xa0]*M[aą]dro[sś]|[\\s\\xa0]*M[aą]dro[sś]|i[eę]g[ai][\\s\\xa0]*M[aą]dro[sś])c|n(?:iha[\\s\\xa0]*Mo|jiga[\\s\\xa0]*M)udrost)|Hekima[\\s\\xa0]*ya[\\s\\xa0]*Solomon)i|Vi(?:s(?:d(?:ommen)?|h(?:eten)?)|is)|B[o\\xF6]lcs|知恵?|지혜|حك|Σοφ(?:[ίι]α[\\s\\xa0]*Σολ)?|Weish|Муд|Sa(?:p(?:ient)?|b)|M(?:\\xFAd(?:rost)?|udr?|[aą]dr)|Hek|(?:Ang[\\s\\xa0]*Karunungan[\\s\\xa0]*ni[\\s\\xa0]*S[ao]lom[o\\xF3]|Kh\\xF4n[\\s\\xa0]*Ngoa)n|Sagesse[\\s\\xa0]*de[\\s\\xa0]*Salomon|(?:The[\\s\\xa0]*Wis(?:d(?:om)?|om)?[\\s\\xa0]*of|Doethineb)[\\s\\xa0]*Solomon|[I\\xCE]n[tț]elepciunea[\\s\\xa0]*lui[\\s\\xa0]*Solomon|Cartea[\\s\\xa0]*(?:[i\\xEE]n[tţ]elepciunii[\\s\\xa0]*lui[\\s\\xa0]*Solomon|[I\\xCE]nțelepciunii))|(?:Премъдрост[\\s\\xa0]*Соломонова)|(?:《智慧篇|智慧篇》|Σοφ[ίι]α|الحكمة|Мудрости|Hekima|Sa(?:pienza|gesse|pientia|bedoria)|Премъдрост|Moudrost|W(?:ijsheid[\\s\\xa0]*van[\\s\\xa0]*Salomo|eisheit)|Cartea[\\s\\xa0]*[I\\xCE]ntelepciunii|Mudrosti|Прем|Wis(?:d(?:om)?|om)?[\\s\\xa0]*of[\\s\\xa0]*Solomon|K(?:a(?:runungan[\\s\\xa0]*ni[\\s\\xa0]*S[ao]lom[o\\xF3]|wicaksana)n|niha[\\s\\xa0]*moudrosti))|(?:Wi(?:jsheid|sdom)|智慧篇|Wisd?|S[ao]lom[o\\xF3]n|Karunungan))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Joel"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:요엘서|욜|يوء|ヨエル書|[ਜਯ]ੋਏਲ|יואל|Йоил|Јо(?:и[лљ]|ел)|Ἰλ|Ι(?:ω[ήη])?λ|よえるしょ|《(?:约[珥饵]书|珥|約珥書|岳厄爾)》|ยอล|โยเอล|Йо[ії][лн]|Ио(?:[ії][лн]|иль)|யோவேல்|Gi\xF4\-?\xEAn|یُ?وایل|سفر[\s\xa0]*يوئيل|Yo(?:eli|ol)|(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Joe|Liv[\s\xa0]*Jow[e\xE8]l[\s\xa0]*|Yuu77ee)la|J(?:o(?:el(?:s[\s\xa0]*(?:Bog|bok)|in[\s\xa0]*kirja)|\xEBl)|l)|योएलको[\s\xa0]*पुस्तक|(?:Y(?:ōv[eē]|ov[eē])|yōʾī|Ioi|J(?:o[i\xE9\xEF]|\xF3[e\xE9]))l|Yo(?:o['’]e|a)el|(?:Y(?:ol|u7)|Gioel)e|Pro(?:roctwo[\s\xa0]*Ioelowe|phetia[\s\xa0]*Ioel)|Книга[\s\xa0]*(?:пророка[\s\xa0]*(?:Ио(?:иля|іла)|Йоіла)|[ИЙ]оіла|на[\s\xa0]*пророк[\s\xa0]*Иоиля)|ヨエル|요엘|யோவே|Gioe|Yoel?|Jo(?:e(?:li?)?|\xEB)|योएल|Книга[\s\xa0]*на[\s\xa0]*пророк[\s\xa0]*Иоил|ଯୋୟେଲ[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ)|(?:(?:岳厄爾|珥|約珥書|约[珥饵]书)》|《(?:约[珥饵]书|岳厄爾|珥|約珥書)|ଯୋୟେଲ|يوئيل|Йоіла|Ио(?:иля|іла)|[Iy]oel|岳厄爾|珥|約珥書|约[珥饵]书|Иоил|Jo(?:el(?:in|a)|w[e\xE8]l)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Jonah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ἰν|욘|요나서|ยนา|Ион|ヨナ(?:しょ|書)|யோனா|יונה|Юнус|Йона|《(?:約(?:拿書|納)|约拿书|拿)》|ਯੂਨਾਹ|Ι(?:ων[άα]ς|ν)|yūnāh|Ionas|โยนาห์|ی(?:ُوناہ|ونس)|Y(?:o(?:ṉ[aā]|n[aā])|ō[nṉ][aā])|يون|سفر[\\s\\xa0]*يونان|(?:Y(?:ooni|unu)|yūna)s|J(?:on(?:a(?:s(?:['’][\\s\\xa0]*Bog|[\\s\\xa0]*bok)|[\\s\\xa0]*bok|[hš])|\\xE1[hsš])|\\xF3n[a\\xE1]s|n[hs])|योनाको[\\s\\xa0]*पुस्तक|(?:Gi(?:\\xF4\\-?|o)n|Yoonaas|Liv[\\s\\xa0]*Jonas[\\s\\xa0]*l|Joonan[\\s\\xa0]*kirj)a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Jonasza|Pro(?:roctwo[\\s\\xa0]*Ionaszow|phetia[\\s\\xa0]*Iona)e|Јона|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*(?:Ион[иы]|Йони)|на[\\s\\xa0]*пророк[\\s\\xa0]*Иона)|J(?:o(?:n\\xE1?|ona)|\\xF3n)|ヨナ|요나|Йон|Iona|Gio|Yoo?n|योना|ଯୂନସ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:《(?:約(?:拿書|納)|约拿书|拿)|(?:約(?:拿書|納)|拿)》|约拿书》|ଯୂନସ|Йони|yon[aā]|Ион[аиы]|يونان|約(?:拿書|納)|拿|约拿书|Jo(?:na(?:s(?:za)?)?|onan)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Nah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:《(?:那(?:鴻[书書]|鸿书)|[鴻鸿]|納鴻)》|ਨਹੂਮ|나훔서|נחום|ナホム(?:しょ|書)|น(?:าฮู|ฮ)ม|Ναο[υύ]μ|நாகூம்|نحوم|نا[\\s\\xa0]*?حُوم|سفر[\\s\\xa0]*ناحوم|नहूमको[\\s\\xa0]*पुस्तक|N(?:a(?:h(?:um(?:s[\\s\\xa0]*(?:Bog|bok)|u)|\\xFAm)|ch)|h)|Nahumin[\\s\\xa0]*kirja|Naahooma|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Nahuma|Nawoun|Liv[\\s\\xa0]*Nawoum[\\s\\xa0]*lan|(?:N(?:a(?:\\-?h[u\\xE2]|k[uū]|u|ho[ou])|āk[uū]|\\xE1hu)|n(?:āḥ|ah)ū)m|Naxuum|Pro(?:roctwo[\\s\\xa0]*Nahumowe|phetia[\\s\\xa0]*Nahum)|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*пророк|пророка)[\\s\\xa0]*Наума|N(?:a(?:h(?:u(?:mi)?|\\xFA|o)?|[wx])|\\xE1h)|ナホム|나훔?|Να|நாகூ|نحو|नहूम|Книга[\\s\\xa0]*на[\\s\\xa0]*пророк[\\s\\xa0]*Наум|ନାହୂମ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:Nahum(?:in|a))|(?:《(?:那(?:鴻[书書]|鸿书)|[鴻鸿]|納鴻)|(?:[鴻鸿]|納鴻)》|那(?:鴻[书書]|鸿书)》|ନାହୂମ|ناحوم|Наума|Наум|نا|Na(?:woum|hum)?)|(?:那(?:鴻[书書]|鸿书)|[鴻鸿]|納鴻|nahum))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:I(?:\.[\s\xa0]*J(?:an(?:o(?:va|s)|[uů]v|a)|h[ho]?n)|[\s\xa0]*J(?:an(?:o(?:va|s)|[uů]v|a)|h[ho]?n)))|(?:1(?:[\s\xa0]*(?:Иоан|Іва)|\.[\s\xa0]*Иоан)на)|(?:《(?:约(?:翰[一壹]书|壹)|若望一書|約(?:翰[一壹]書|壹)|伊望第一)》|(?:Ⅰ[\s\xa0]*|一)ヨハネ|요(?:한(?:의[\s\xa0]*첫째[\s\xa0]*서간|[1일]서)|일)|ヨハネの(?:第一の(?:手紙|書)|手紙[Ⅰ一])|Α['ʹʹ΄’][\s\xa0]*(?:Ιω[άα]ννη|᾿Ιω)|ﻳﻮﺣﻨﺎ[\s\xa0]*ﺍﻻﻭﻝ|Ιω[άα]ννου[\s\xa0]*Α['ʹʹ΄’]|הראשונה[\s\xa0]*יוחנן|Kwanza[\s\xa0]*Yohan[ae]|ଯୋହନଙ୍କ[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|य(?:ूहन्नाको[\s\xa0]*पहिलो|ोहानाचें[\s\xa0]*पहिले)[\s\xa0]*पत्र|ਯੂਹੰਨਾ[\s\xa0]*ਦੀ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੱਤ੍ਰੀ|ی(?:وحنّ?|ُوحنّ)ا[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*عام[\s\xa0]*خط|yū(?:h\xE3nā[\s\xa0]*dī[\s\xa0]*pahilī[\s\xa0]*pattrī|ḥannā[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ)|رسالة[\s\xa0]*(?:القديس[\s\xa0]*يوحنا[\s\xa0]*الأولى|يوحنا[\s\xa0]*(?:الأولى|1))|א(?:גרתו[\s\xa0]*הראשונה[\s\xa0]*של[\s\xa0]*יוחנן[\s\xa0]*השליח|יגרת[\s\xa0]*יוחנן[\s\xa0]*הראשונה)|Els[oő][\s\xa0]*Jn|(?:Epistula[\s\xa0]*Ioanni|J[a\xE1]no)s[\s\xa0]*I|Y(?:o(?:va[nṉ][\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]vatu[\s\xa0]*Nirupam|oxanaa[\s\xa0]*Kowaad|hane[\s\xa0]*I)|ōva[nṉ][\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]vatu[\s\xa0]*Nirupam)|Fyrsta[\s\xa0]*J[o\xF3]hannesarbr[e\xE9]f|I(?:[\s\xa0]*(?:J(?:oh(?:annes|[mn])|[hn])|In)|\.[\s\xa0]*J(?:oh(?:annes|[mn])|[hn]))|First[\s\xa0]*J(?:oh[mn]|n)|ପ୍ରଥମ[\s\xa0]*ଯୋହନଙ|யோவ(?:ான்[\s\xa0]*(?:எழுதிய[\s\xa0]*முதல(?:்[\s\xa0]*திருமுக|ாம்[\s\xa0]*கடித)|முதல்[\s\xa0]*திருமுக)|ன்[\s\xa0]*எழுதிய[\s\xa0]*முதலாவது[\s\xa0]*நிருப)ம்|(?:Mutal[aā]vatu|முதலாவது)[\s\xa0]*யோவான்|I\.?[\s\xa0]*Yohan(?:es|a)|Prim(?:a[\s\xa0]*lettera[\s\xa0]*di|o|a)[\s\xa0]*Giovanni|I\.?[\s\xa0]*Gi(?:ovanni|ăng)|First[\s\xa0]*Jhn|I\.?[\s\xa0]*J\xE1no[sv]|(?:I(?:\.[\s\xa0]*J(?:\xF3|on)|[\s\xa0]*J(?:\xF3|on))|First[\s\xa0]*Jon)h|(?:I(?:\.[\s\xa0]*Jo[a\xE3]|[\s\xa0]*Jo[a\xE3])|Primeir[ao][\s\xa0]*Jo[a\xE3])o|(?:(?:(?:Primer|I\.?|Primero)[\s\xa0]*San[\s\xa0]*J[au]|Primero?[\s\xa0]*J[au]|I\.?[\s\xa0]*Ju)[au]|I(?:\.[\s\xa0]*J(?:a[au]|oo)|[\s\xa0]*J(?:a[au]|oo))|First[\s\xa0]*Joo|I\.?[\s\xa0]*Gioa|First[\s\xa0]*Jh[ho]|(?:Una(?:ng)?[\s\xa0]*Ju|Premye[\s\xa0]*J|I(?:[\s\xa0]*(?:Io|Je)|\.[\s\xa0]*Je)|Premi(?:\xE8re|ere?)[\s\xa0]*Je|Premi(?:\xE8re|ere?)s[\s\xa0]*Je|I\.?[\s\xa0]*Yokan)a)n|(?:I(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)|First[\s\xa0]*Jo?)phn|(?:F[o\xF6]rsta[\s\xa0]*Johannesbreve|Prv[y\xFD][\s\xa0]*J[a\xE1]nov[\s\xa0]*lis)t|(?:Prvn[i\xED][\s\xa0]*Jan[uů]|I\.?[\s\xa0]*Jano|Prv[a\xE1][\s\xa0]*J[a\xE1]no|Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*J[a\xE1]no|(?:Prvn[i\xED]|I\.?)[\s\xa0]*list[\s\xa0]*Jan[uů])v|(?:Johannes[\s\xa0]*f[o\xF6]rsta[\s\xa0]*|F\xF8rste[\s\xa0]*Johannes)brev|Johannes['’][\s\xa0]*1[\s\xa0]*Brev|(?:Johannes['’][\s\xa0]*(?:F\xF8rste|1\.)|F\xF8rste[\s\xa0]*Johannes['’])[\s\xa0]*Brev|(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*y)a[\s\xa0]*Yohane|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Johanneksen[\s\xa0]*kirje|E(?:ls[oő][\s\xa0]*J[a\xE1]no|rste[\s\xa0]*Johanne|erste[\s\xa0]*Johanne)s|Epistula[\s\xa0]*I[\s\xa0]*Ioannis|(?:y(?:oh[aā]n[aā]ce[mṃ][\s\xa0]*pahile|uhann[aā]ko[\s\xa0]*pahilo|ūhann[aā]ko[\s\xa0]*pahilo)[\s\xa0]*patr|Koiro[\s\xa0]*Yohaannis|Prvn[i\xED][\s\xa0]*Janov|I\.?[\s\xa0]*Yooxana|Fyrsta[\s\xa0]*br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar[\s\xa0]*hi\xF0[\s\xa0]*almenn|P(?:er[sš]e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Iv|ierwsz[aey][\s\xa0]*J)an|(?:Pierwsz[aey]|I\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan)a|(?:Prva|I)[\s\xa0]*Ivanova[\s\xa0]*Poslanica|I\.[\s\xa0]*I(?:vanova[\s\xa0]*Poslanica|oannis|n)|(?:اوّل|۱)۔یوحنا|(?:اوّل|۱)[\s\xa0]*یوحنّا|(?:اوّل|۱)[\s\xa0]*یُوحنّا|(?:اوّل|۱)\-?یُوحنّا|1(?:[\s\xa0]*(?:ਯੂਹੰਨਾ|يو|ยน|Ів|Йн|Ин|Јн|Y(?:ōva[nṉ]|ova[nṉ])|Gv|योहानाच|y(?:oh[aā]n[aā]ce[mṃ]|ūh\xE3nā)|In)|st(?:\.[\s\xa0]*J(?:oh[mn]|n)|[\s\xa0]*J(?:oh[mn]|n))|요한|[\s\xa0]*ยอห์น|[\s\xa0]*ଯୋହନଙ|[\s\xa0]*(?:அருளப்பர|யோவான)்|[\s\xa0]*Yohan(?:es|a)|\xB0\.?[\s\xa0]*Giovanni|[\s\xa0]*Gi(?:ovanni|ăng)|[\s\xa0]*युहत्रा|[\s\xa0]*यूहन्नाको|st\.?[\s\xa0]*Jhn|st\.?[\s\xa0]*Jonh|(?:o(?:\.[\s\xa0]*Jo[a\xE3]|[\s\xa0]*Jo[a\xE3])|a\.?[\s\xa0]*Jo[a\xE3]|[\s\xa0]*yūhann[aā]k|[\s\xa0]*yuhann[aā]k)o|(?:(?:o(?:\.[\s\xa0]*J[au]|[\s\xa0]*J[au])|\xBA\.?[\s\xa0]*J[au]|(?:\xBA\.?|o\.?)?[\s\xa0]*San[\s\xa0]*J[au])[au]|st\.?[\s\xa0]*Joo|[\s\xa0]*Gioa|st\.?[\s\xa0]*Jh[ho]|(?:(?:er(?:e\.?|\.)?|\xE8?re\.?)[\s\xa0]*Je|[\s\xa0]*Yokan)a)n|(?:st(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)p|Jo)hn|[\s\xa0]*(?:[ei]\.?[\s\xa0]*Gj|Gj)onit|[\s\xa0]*(?:k(?:\.[\s\xa0]*J[a\xE1]|[\s\xa0]*J[a\xE1])no|list[\s\xa0]*Jan[uů])v|[\s\xa0]*J(?:an(?:o(?:va|s)|a)|\xE1no[sv]|h?n|\xF3h|(?:h[ho]|u[au]|ea|a[au])n|phn|an[uů]v|o(?:h(?:anne(?:s(?:['’][\s\xa0]*Brev|brevet)|ksen[\s\xa0]*kirje)|[mn])|[a\xE3]o|nh|on|phn))|e\.?[\s\xa0]*Johannes|[\s\xa0]*Ioannis|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan|Yoo(?:hann|xana))a|[\s\xa0]*Ivanova[\s\xa0]*Poslanica|\.(?:[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|\xE1no[sv]|h?n|\xF3h|(?:h[ho]|u[au]|ea|a[au])n|phn|an[uů]v|o(?:h(?:anne(?:s(?:['’][\s\xa0]*Brev|brevet)|ksen[\s\xa0]*kirje)|[mn])|[a\xE3]o|nh|on|phn))|ଯୋହନଙ|ยอห์น|யோவான்|Yohan(?:es|a)|Gi(?:ovanni|ăng)|य(?:ूहन्नाको|ुहत्रा)|y[uū]hann[aā]ko|(?:San[\s\xa0]*J[au][au]|Gioa|Yokana)n|Gjonit|list[\s\xa0]*Jan[uů]v|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan|Yoo(?:hann|xana))a|I(?:vanova[\s\xa0]*Poslanica|oannis|n))|(?:[o\xBA]\.?[\s\xa0]*San[\s\xa0]*J[au]|[o\xBA]\.?[\s\xa0]*J[au])[au]n)|\.?۔یوحنا|\.?[\s\xa0]*یوحنّا|\.?[\s\xa0]*یُوحنّا|\.\-?یُوحنّا|\-?یُوحنّا)|1[\s\xa0]*Јованов[ао]|(?:I\.?|1\.)[\s\xa0]*Јованов[ао]|1\-?(?:е(?:\.?[\s\xa0]*И|\.?[\s\xa0]*Й)|(?:ше|а)[\s\xa0]*[ИЙ]|(?:ше|а)\.[\s\xa0]*[ИЙ])оаново|1\.?[\s\xa0]*Иоаново|1[\s\xa0]*Йоаново|(?:I(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|1\.[\s\xa0]*Й)оаново|(?:(?:1\.?|I\.?)[\s\xa0]*писмо[\s\xa0]*од|1\.?[\s\xa0]*послание[\s\xa0]*на|I\.?[\s\xa0]*послание[\s\xa0]*на)[\s\xa0]*апостол[\s\xa0]*Јован|1(?:[\s\xa0]*(?:யோ(?:வா)?|Gj|योहान|Iv)|st(?:\.[\s\xa0]*Joh?|[\s\xa0]*Joh?)|e\.?[\s\xa0]*Joh|[\s\xa0]*Yoh(?:ane)?|[\s\xa0]*Yoox|[\s\xa0]*Gi|[\s\xa0]*यूहन्ना|st\.?[\s\xa0]*Jh|[\s\xa0]*J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?|h)?|[\s\xa0]*Ioan|\.[\s\xa0]*(?:J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?|h)?|Yo(?:h(?:ane)?|ox)|Gi|यूहन्ना|Ioan))|אגרתו[\s\xa0]*הראשונה[\s\xa0]*של[\s\xa0]*יוחנן[\s\xa0]*השלי|Α['ʹʹ΄’][\s\xa0]*Ιω|Kwanza[\s\xa0]*Yoh|Prvn[i\xED][\s\xa0]*J(?:an)?|F\xF8rste[\s\xa0]*Joh|I(?:\.[\s\xa0]*J(?:oh?|an)?|[\s\xa0]*J(?:oh?|an)?)|First[\s\xa0]*Joh?|Eerste[\s\xa0]*Joh|I\.?[\s\xa0]*Yoh(?:ane)?|I\.?[\s\xa0]*Yoox|I\.?[\s\xa0]*Gi|First[\s\xa0]*Jh|I\.[\s\xa0]*Ioan|1[\s\xa0]*Јован|(?:I\.?|1\.)[\s\xa0]*Јован|1\.?[\s\xa0]*Иоан|1[\s\xa0]*Йоан|(?:I(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|1\.[\s\xa0]*Й)оан|(?:(?:1(?:\-?(?:е\.?|я\.?)|[ея]\.?|\.)?[\s\xa0]*Иох|(?:1(?:\-?е\.?|\.)|I\.?)[\s\xa0]*Ів|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*Послання[\s\xa0]*Ів|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Ів)а|1\-?е\.?[\s\xa0]*Иоан|1(?:[ея]\.?|\-?я\.?)[\s\xa0]*Иоан|(?:1(?:\-?е\.?|\.)|I\.?|1)[\s\xa0]*Іоан|1(?:\-?(?:е\.?[\s\xa0]*послани|я\.?[\s\xa0]*послани)|[ея]\.?[\s\xa0]*послани|\.?[\s\xa0]*послани)е[\s\xa0]*Иоан|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан|1\-?(?:ше|а)[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)|1\-?(?:ше|а)\.[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан))на|(?:1\.?[\s\xa0]*посланиц|I\.?[\s\xa0]*посланиц)а[\s\xa0]*Јованова|П(?:рв(?:а[\s\xa0]*п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)|о[\s\xa0]*п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од))[\s\xa0]*апостол[\s\xa0]*Јован|ерш[ае][\s\xa0]*[ИЙ]оаново|рва[\s\xa0]*Јованов[ао]|рво[\s\xa0]*Јованово|рв[ао][\s\xa0]*Јован|ерш[ае][\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)на|рва[\s\xa0]*посланица[\s\xa0]*Јованова|ърв(?:о[\s\xa0]*(?:съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Иоана[\s\xa0]*Богослова|послание[\s\xa0]*на[\s\xa0]*[ИЙ]оан|[ИЙ]оаново|[ИЙ]оан)|а[\s\xa0]*(?:[ИЙ]оаново|[ИЙ]оан))))|(?:《(?:约(?:翰[一壹]书|壹)|伊望第一|若望一書|約(?:翰[一壹]書|壹))|(?:约(?:翰[一壹]书|壹)|伊望第一)》|若望一書》|約(?:翰[一壹]書|壹)》|يوحنا[\s\xa0]*الأولى|1\.?[\s\xa0]*Johannes|Ioannis[\s\xa0]*I|Johannes’[\s\xa0]*f\xF8rste[\s\xa0]*brev|(?:1\.?[\s\xa0]*I|I\.?[\s\xa0]*I)vanova|Prv(?:a[\s\xa0]*Ivanova[\s\xa0]*poslanica|[y\xFD][\s\xa0]*J[a\xE1]nov)|I[\s\xa0]*Ioannis|F(?:yrsta[\s\xa0]*br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar|\xF8rste[\s\xa0]*Johannes)|约(?:翰[一壹]书|壹)|伊望第一|若望一書|約(?:翰[一壹]書|壹)|Prva[\s\xa0]*Ivanova|1\.?[\s\xa0]*Johanneksen|I\.?[\s\xa0]*Johanneksen|Ensimm[a\xE4]inen[\s\xa0]*Johanneksen))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:II(?:\.[\s\xa0]*J(?:an(?:[uů]v|a|os)|h[ho]?n)|[\s\xa0]*J(?:an(?:[uů]v|a|os)|h[ho]?n)|\.?[\s\xa0]*Janova)|Druh[a\xE1][\s\xa0]*Janova)|(?:2(?:[\s\xa0]*(?:Иоан|Іва)|\.[\s\xa0]*Иоан)на)|(?:《(?:约(?:翰[二贰]书|贰)|若望二書|約(?:翰[二貳]書|[貳贰])|伊望第二)》|(?:Ⅱ[\s\xa0]*|二)ヨハネ|요(?:한(?:의[\s\xa0]*둘째[\s\xa0]*서간|[2이]서)|이)|ヨハネの(?:第二の(?:手紙|書)|手紙[Ⅱ二])|Β['ʹʹ΄’][\s\xa0]*(?:Ιω[άα]ννη|᾿Ιω)|Ιω[άα]ννου[\s\xa0]*Β['ʹʹ΄’]|Pili[\s\xa0]*Yohan[ae]|השנייה[\s\xa0]*יוחנן|M[a\xE1]sodik[\s\xa0]*Jn|ଯୋହନଙ୍କ[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|ਯੂਹੰਨਾ[\s\xa0]*ਦੀ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੱਤ੍ਰੀ|Anna\xF0[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar|J[o\xF3]hannesarbr[e\xE9]f)|य(?:ूहन्नाको[\s\xa0]*दोस्(?:त्)?रो|ोहानाचें[\s\xa0]*दुसरे)[\s\xa0]*पत्र|ی(?:وحن(?:ا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام|ّا[\s\xa0]*کا[\s\xa0]*دوسرا)|ُوحنّا[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*عام)[\s\xa0]*خط|yū(?:ḥannā[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|h\xE3nā[\s\xa0]*dī[\s\xa0]*dūjī[\s\xa0]*pattrī)|رسالة[\s\xa0]*(?:القديس[\s\xa0]*يوحنا[\s\xa0]*الثانية|يوحنا[\s\xa0]*(?:الثانية|2))|א(?:גרתו[\s\xa0]*השנייה[\s\xa0]*של[\s\xa0]*יוחנן[\s\xa0]*השליח|יגרת[\s\xa0]*יוחנן[\s\xa0]*השנייה)|Druh[y\xFD][\s\xa0]*Janova|(?:Epistula[\s\xa0]*Ioanni|J[a\xE1]no)s[\s\xa0]*II|Y(?:o(?:va[nṉ][\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]vatu[\s\xa0]*Nirupam|oxanaa[\s\xa0]*Labaad|hane[\s\xa0]*II)|ōva[nṉ][\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]vatu[\s\xa0]*Nirupam)|II(?:[\s\xa0]*(?:J(?:oh(?:annes|[mn])|[hn])|In)|\.[\s\xa0]*J(?:oh(?:annes|[mn])|[hn]))|Second[\s\xa0]*J(?:oh[mn]|n)|யோவ(?:ான்[\s\xa0]*(?:எழுதிய[\s\xa0]*இரண்டாம்[\s\xa0]*(?:திருமுக|கடித)|இரண்டாம்[\s\xa0]*திருமுக)|ன்[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாவது[\s\xa0]*நிருப)ம்|ଦ୍ୱିତୀୟ[\s\xa0]*ଯୋହନଙ|II\.?[\s\xa0]*Јованов[ао]|II\.?[\s\xa0]*Yohan(?:es|a)|Second(?:a[\s\xa0]*lettera[\s\xa0]*di|o|a)[\s\xa0]*Giovanni|II\.?[\s\xa0]*Gi(?:ovanni|ăng)|Second[\s\xa0]*Jhn|II\.?[\s\xa0]*J\xE1no[sv]|(?:II(?:\.[\s\xa0]*J(?:\xF3|on)|[\s\xa0]*J(?:\xF3|on))|Second[\s\xa0]*Jon)h|(?:II(?:\.[\s\xa0]*Jo[a\xE3]|[\s\xa0]*Jo[a\xE3])|Segunda[\s\xa0]*Jo[a\xE3]|Segundo[\s\xa0]*Jo[a\xE3])o|(?:II(?:\.[\s\xa0]*J(?:a[au]|oo)|[\s\xa0]*J(?:a[au]|oo))|Second[\s\xa0]*Joo|II\.?[\s\xa0]*Gioa|(?:(?:Segundo|II\.?)[\s\xa0]*San[\s\xa0]*J[au]|Segundo[\s\xa0]*J[au]|II\.?[\s\xa0]*Ju)[au]|Second[\s\xa0]*Jh[ho]|(?:I(?:I(?:[\s\xa0]*(?:Io|Je)|\.[\s\xa0]*Je)|kalawang[\s\xa0]*Ju)|Dezy[e\xE8]m[\s\xa0]*J|Deuxi[e\xE8]me[\s\xa0]*Je|Deuxi[e\xE8]mes[\s\xa0]*Je|II\.?[\s\xa0]*Yokan)a)n|(?:II(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)|Second[\s\xa0]*Jo?)phn|(?:Druh[y\xFD][\s\xa0]*J[a\xE1]nov[\s\xa0]*lis|Andra[\s\xa0]*Johannesbreve)t|(?:Druh(?:[y\xFD][\s\xa0]*(?:list[\s\xa0]*Jan[ouů]|Jan[uů])|[a\xE1][\s\xa0]*Jan[ouů])|II\.?[\s\xa0]*Jano|Druh(?:[y\xFD][\s\xa0]*list|[a\xE1])[\s\xa0]*J\xE1no|Druh[a\xE1][\s\xa0]*kniha[\s\xa0]*J[a\xE1]no|(?:Druh[a\xE1]|II\.?)[\s\xa0]*list[\s\xa0]*Jan[uů])v|(?:Johannes(?:’[\s\xa0]*andre|[\s\xa0]*andra)[\s\xa0]*|Ande[nt][\s\xa0]*Johannes)brev|(?:Anden[\s\xa0]*Johannes['’]|Johannes['’][\s\xa0]*Andet)[\s\xa0]*Brev|(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*y)a[\s\xa0]*Yohane|(?:Toinen|II\.?)[\s\xa0]*Johanneksen[\s\xa0]*kirje|(?:M[a\xE1]sodik[\s\xa0]*J[a\xE1]no|Zweite[\s\xa0]*Johanne|(?:Tweed|Andr)e[\s\xa0]*Johanne)s|Epistula[\s\xa0]*II[\s\xa0]*Ioannis|(?:y(?:oh[aā]n[aā]ce[mṃ][\s\xa0]*dusre|uhann[aā]ko[\s\xa0]*dostro|ūhann[aā]ko[\s\xa0]*dostro)[\s\xa0]*patr|Naa77antto[\s\xa0]*Yohaannis|II\.?[\s\xa0]*Yooxana|Dru(?:he[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Iv|g[ai][\s\xa0]*J)an|(?:Drug[ai]|II\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan)a|(?:Druga|II)[\s\xa0]*Ivanova[\s\xa0]*Poslanica|II\.[\s\xa0]*I(?:vanova[\s\xa0]*Poslanica|oannis|n)|(?:دوم|۲)۔یوحنا|(?:دوم|۲)[\s\xa0]*یوحنّا|(?:دوم|۲)[\s\xa0]*یُوحنّا|(?:دوم|۲)\-?یُوحنّا|2(?:[\s\xa0]*(?:ਯੂਹੰਨਾ|يو|ยน|Ів|Йн|Ин|Јн|Y(?:ōva[nṉ]|ova[nṉ])|Gv|யோவான்|அருளப்பர்|योहानाच|y(?:oh[aā]n[aā]ce[mṃ]|ūh\xE3nā)|In)|nd(?:\.[\s\xa0]*J(?:oh[mn]|n)|[\s\xa0]*J(?:oh[mn]|n))|요한|[\s\xa0]*ยอห์น|[\s\xa0]*ଯୋହନଙ|[\s\xa0]*Јованов[ао]|[\s\xa0]*Yohan(?:es|a)|\xB0\.?[\s\xa0]*Giovanni|[\s\xa0]*Gi(?:ovanni|ăng)|[\s\xa0]*युहत्रा|[\s\xa0]*यूहन्नाको|nd\.?[\s\xa0]*Jhn|nd\.?[\s\xa0]*Jonh|(?:o(?:\.[\s\xa0]*Jo[a\xE3]|[\s\xa0]*Jo[a\xE3])|a\.?[\s\xa0]*Jo[a\xE3]|[\s\xa0]*yūhann[aā]k|[\s\xa0]*yuhann[aā]k)o|(?:(?:o(?:\.[\s\xa0]*J[au]|[\s\xa0]*J[au])|\xBA\.?[\s\xa0]*J[au]|(?:\xBA\.?|o\.?)?[\s\xa0]*San[\s\xa0]*J[au])[au]|nd\.?[\s\xa0]*Joo|[\s\xa0]*Gioa|nd\.?[\s\xa0]*Jh[ho]|(?:(?:d(?:e\.?|\.)?|\xE8me\.?|e(?:me\.?|\.)?)[\s\xa0]*Je|[\s\xa0]*Yokan)a)n|(?:nd(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)p|Jo)hn|[\s\xa0]*(?:[ei]\.?[\s\xa0]*Gj|Gj)onit|[\s\xa0]*(?:k(?:\.[\s\xa0]*J[a\xE1]|[\s\xa0]*J[a\xE1])no|list[\s\xa0]*Jan[uů])v|[\s\xa0]*J(?:an(?:o(?:va|s)|a)|\xE1no[sv]|h?n|\xF3h|(?:h[ho]|u[au]|ea|a[au])n|phn|an[uů]v|o(?:h(?:anne(?:s(?:['’][\s\xa0]*Brev|brevet)|ksen[\s\xa0]*kirje)|[mn])|[a\xE3]o|nh|on|phn))|e\.?[\s\xa0]*Johannes|[\s\xa0]*Ioannis|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan|Yoo(?:hann|xana))a|[\s\xa0]*Ivanova[\s\xa0]*Poslanica|\.(?:[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|\xE1no[sv]|h?n|\xF3h|(?:h[ho]|u[au]|ea|a[au])n|phn|an[uů]v|o(?:h(?:anne(?:s(?:['’][\s\xa0]*Brev|brevet)|ksen[\s\xa0]*kirje)|[mn])|[a\xE3]o|nh|on|phn))|Јованов[ао]|ଯୋହନଙ|ยอห์น|Yohan(?:es|a)|Gi(?:ovanni|ăng)|य(?:ूहन्नाको|ुहत्रा)|y[uū]hann[aā]ko|(?:San[\s\xa0]*J[au][au]|Gioa|Yokana)n|Gjonit|list[\s\xa0]*Jan[uů]v|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan|Yoo(?:hann|xana))a|I(?:vanova[\s\xa0]*Poslanica|oannis|n))|(?:[o\xBA]\.?[\s\xa0]*San[\s\xa0]*J[au]|[o\xBA]\.?[\s\xa0]*J[au])[au]n)|\.?۔یوحنا|\.?[\s\xa0]*یوحنّا|\.?[\s\xa0]*یُوحنّا|\.\-?یُوحنّا|\-?یُوحنّا)|(?:2\-?(?:а(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|е(?:\.?[\s\xa0]*И|\.?[\s\xa0]*Й)|ге(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ]))|Друг(?:а[\s\xa0]*[ИЙ]|е[\s\xa0]*[ИЙ]))оаново|2\.?[\s\xa0]*Иоаново|(?:II(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|2\.[\s\xa0]*Й|2[\s\xa0]*Й)оаново|(?:(?:II\.?[\s\xa0]*послание[\s\xa0]*н|2\.?[\s\xa0]*послание[\s\xa0]*н)а|(?:II\.?|2\.?)[\s\xa0]*писмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Јован|2(?:[\s\xa0]*(?:யோ(?:வா)?|Gj|योहान|Iv)|nd(?:\.[\s\xa0]*Joh?|[\s\xa0]*Joh?)|e\.?[\s\xa0]*Joh|[\s\xa0]*Јован|[\s\xa0]*Yoh(?:ane)?|[\s\xa0]*Yoox|[\s\xa0]*Gi|[\s\xa0]*यूहन्ना|nd\.?[\s\xa0]*Jh|[\s\xa0]*J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?|h)?|[\s\xa0]*Ioan|\.[\s\xa0]*(?:J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?|h)?|Yo(?:h(?:ane)?|ox)|Јован|Gi|यूहन्ना|Ioan))|Β['ʹʹ΄’][\s\xa0]*Ιω|Pili[\s\xa0]*Yoh|Anden[\s\xa0]*Joh|Toinen[\s\xa0]*Joh|Druh(?:[a\xE1][\s\xa0]*J(?:an)?|[y\xFD][\s\xa0]*J(?:an)?)|II(?:\.[\s\xa0]*J(?:oh?|an)?|[\s\xa0]*J(?:oh?|an)?)|Second[\s\xa0]*Joh?|(?:Tweed|Andr)e[\s\xa0]*Joh|II\.?[\s\xa0]*Јован|II\.?[\s\xa0]*Yoh(?:ane)?|II\.?[\s\xa0]*Yoox|II\.?[\s\xa0]*Gi|Second[\s\xa0]*Jh|II\.[\s\xa0]*Ioan|2\.?[\s\xa0]*Иоан|(?:II(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|2\.[\s\xa0]*Й|2[\s\xa0]*Й)оан|(?:2(?:\-?(?:а(?:\.[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)|[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан))|(?:(?:е\.?|я\.?)[\s\xa0]*Иох|е\.?[\s\xa0]*Ів|е\.?[\s\xa0]*Послання[\s\xa0]*Ів|е\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Ів)а|е\.?[\s\xa0]*Иоан|я\.?[\s\xa0]*Иоан|е\.?[\s\xa0]*Іоан|(?:е\.?[\s\xa0]*послани|я\.?[\s\xa0]*послани)е[\s\xa0]*Иоан|е\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан|ге(?:\.[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)|[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)))|(?:(?:[ея]\.?|\.)?[\s\xa0]*Иох|\.[\s\xa0]*Ів|\.?[\s\xa0]*Послання[\s\xa0]*Ів|\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Ів)а|[ея]\.?[\s\xa0]*Иоан|\.?[\s\xa0]*Іоан|(?:[ея]\.?[\s\xa0]*послани|\.?[\s\xa0]*послани)е[\s\xa0]*Иоан|\.?[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)н|(?:(?:Друга|II\.?)[\s\xa0]*Послання|Друга|II\.?|(?:Друга|II\.?)[\s\xa0]*послання[\s\xa0]*апостола)[\s\xa0]*Іван|Послання[\s\xa0]*до[\s\xa0]*Тит|(?:Друга|II\.?)[\s\xa0]*Іоанн|(?:Друга|II\.?)[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоанн|Друге[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)н)а|(?:(?:Друга|II\.?)[\s\xa0]*посланиц|Друг|2\.?[\s\xa0]*посланиц)а[\s\xa0]*Јованова|Втор(?:о[\s\xa0]*(?:п(?:ослание[\s\xa0]*на[\s\xa0]*(?:апостол[\s\xa0]*Јов|[ИЙ]о)|исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Јов)ан|(?:[ИЙ]о|Јов)аново|(?:[ИЙ]о|Јов)ан|съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Иоана[\s\xa0]*Богослова)|а[\s\xa0]*(?:п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Јован|(?:[ИЙ]о|Јов)аново|(?:[ИЙ]о|Јов)ан)))|(?:(?:约(?:翰[二贰]书|贰)|伊望第二|若望二書|約(?:翰[二貳]書|[貳贰]))》|《(?:約(?:翰[二貳]書|[貳贰])|伊望第二|若望二書|约(?:翰[二贰]书|贰))|يوحنا[\s\xa0]*الثانية|2\.?[\s\xa0]*Johannes|Anden[\s\xa0]*Johannes|I(?:I[\s\xa0]*Ioannis|oannis[\s\xa0]*II)|2\.?[\s\xa0]*Johanneksen|II\.?[\s\xa0]*Johanneksen|Toinen[\s\xa0]*Johanneksen|约(?:翰[二贰]书|贰)|伊望第二|若望二書|約(?:翰[二貳]書|[貳贰])|(?:II\.?[\s\xa0]*I|2\.?[\s\xa0]*I)vanova|Dru(?:ga[\s\xa0]*Ivanova(?:[\s\xa0]*poslanica)?|h[y\xFD][\s\xa0]*J[a\xE1]nov)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:III(?:\.[\s\xa0]*J(?:an(?:o(?:va|s)|[uů]v|a)|h[ho]?n)|[\s\xa0]*J(?:an(?:o(?:va|s)|[uů]v|a)|h[ho]?n))|Tredje[\s\xa0]*Johannesbrevet)|(?:3(?:[\s\xa0]*(?:Иоан|Іва)|\.[\s\xa0]*Иоан)на)|(?:《(?:约(?:翰[三叁]书|[三叁])|若望三書|約(?:翰[三參]書|[三叁])|伊望第三)》|(?:Ⅲ[\s\xa0]*|三)ヨハネ|요(?:한(?:의[\s\xa0]*셋째[\s\xa0]*서간|[3삼]서)|삼)|ヨハネの(?:第三の(?:手紙|書)|手紙[Ⅲ三])|Γ['ʹʹ΄’][\s\xa0]*(?:Ιω[άα]ννη|᾿Ιω)|Ιω[άα]ννου[\s\xa0]*Γ['ʹʹ΄’]|השלישית[\s\xa0]*יוחנן|ଯୋହନଙ୍କ[\s\xa0]*ତୃତୀୟ[\s\xa0]*ପତ୍ର|Harmadik[\s\xa0]*Jn|ਯੂਹੰਨਾ[\s\xa0]*ਦੀ[\s\xa0]*ਤੀਜੀ[\s\xa0]*ਪੱਤ੍ਰੀ|\xDEri\xF0ja[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*J[o\xF3]hannesar|J[o\xF3]hannesarbr[e\xE9]f)|य(?:ूहन्नाको[\s\xa0]*तेस्(?:त्)?रो|ोहानाचें[\s\xa0]*तिसरे)[\s\xa0]*पत्र|ی(?:وحن(?:ّا[\s\xa0]*کا[\s\xa0]*(?:تیسرا|3\.|۳|3)|ا[\s\xa0]*کا[\s\xa0]*تیسرا[\s\xa0]*عام)|ُوحنّا[\s\xa0]*کا[\s\xa0]*تیسرا[\s\xa0]*عام)[\s\xa0]*خط|yū(?:ḥannā[\s\xa0]*kā[\s\xa0]*tīsrā[\s\xa0]*ʿām[\s\xa0]*ḫaṭ|h\xE3nā[\s\xa0]*dī[\s\xa0]*tījī[\s\xa0]*pattrī)|رسالة[\s\xa0]*(?:القديس[\s\xa0]*يوحنا[\s\xa0]*الثالثة|يوحنا[\s\xa0]*(?:الثالثة|3))|א(?:גרתו[\s\xa0]*השלישית[\s\xa0]*של[\s\xa0]*יוחנן[\s\xa0]*השליח|יגרת[\s\xa0]*יוחנן[\s\xa0]*השלישית)|(?:Epistula[\s\xa0]*Ioanni|J[a\xE1]no)s[\s\xa0]*III|Y(?:o(?:va[nṉ][\s\xa0]*E[lḻ]utiya[\s\xa0]*M[uū][nṉ][rṛ][aā]vatu[\s\xa0]*Nirupam|oxanaa[\s\xa0]*Saddexaad|hane[\s\xa0]*III)|ōva[nṉ][\s\xa0]*E[lḻ]utiya[\s\xa0]*M[uū][nṉ][rṛ][aā]vatu[\s\xa0]*Nirupam)|T(?:ret[i\xED][\s\xa0]*Janova|atu[\s\xa0]*Yohan[ae])|III(?:[\s\xa0]*(?:J(?:oh(?:annes|[mn])|[hn])|In)|\.[\s\xa0]*J(?:oh(?:annes|[mn])|[hn]))|Third[\s\xa0]*J(?:oh[mn]|n)|ତୃତୀୟ[\s\xa0]*ଯୋହନଙ|யோவ(?:ான்[\s\xa0]*(?:எழுதிய[\s\xa0]*ம(?:ுன்றாம்[\s\xa0]*திருமுக|ூன்றாம்[\s\xa0]*கடித)|மூன்றாம்[\s\xa0]*திருமுக)|ன்[\s\xa0]*எழுதிய[\s\xa0]*மூன்றாவது[\s\xa0]*நிருப)ம்|(?:M[uū][nṉ][rṛ][aā]vatu|ம(?:ூன்றாவது|ுன்றாம்))[\s\xa0]*யோவான்|III\.?[\s\xa0]*Јованов[ао]|III\.?[\s\xa0]*Yohan(?:es|a)|Terz(?:a[\s\xa0]*lettera[\s\xa0]*di|o|a)[\s\xa0]*Giovanni|III\.?[\s\xa0]*Gi(?:ovanni|ăng)|Third[\s\xa0]*Jhn|III\.?[\s\xa0]*J\xE1no[sv]|(?:III(?:\.[\s\xa0]*J(?:\xF3|on)|[\s\xa0]*J(?:\xF3|on))|Third[\s\xa0]*Jon)h|(?:III(?:\.[\s\xa0]*Jo[a\xE3]|[\s\xa0]*Jo[a\xE3])|Terceir[ao][\s\xa0]*Jo[a\xE3])o|(?:(?:(?:Tercer|III\.?|Tercero)[\s\xa0]*San[\s\xa0]*J[au]|Tercero?[\s\xa0]*J[au]|III\.?[\s\xa0]*Ju)[au]|III(?:\.[\s\xa0]*J(?:a[au]|oo)|[\s\xa0]*J(?:a[au]|oo))|Third[\s\xa0]*Joo|III\.?[\s\xa0]*Gioa|Third[\s\xa0]*Jh[ho]|(?:I(?:II(?:[\s\xa0]*(?:Io|Je)|\.[\s\xa0]*Je)|katlong[\s\xa0]*Ju)|Troisi[e\xE8]me[\s\xa0]*Je|Troisi[e\xE8]mes[\s\xa0]*Je|III\.?[\s\xa0]*Yokan)a)n|(?:III(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)|Third[\s\xa0]*Jo?)phn|Tret(?:\xED[\s\xa0]*J[a\xE1]|i[\s\xa0]*J[a\xE1])nov[\s\xa0]*list|(?:T(?:ret(?:\xED[\s\xa0]*Jan[uů]|i[\s\xa0]*Jan[uů])|řet[i\xED][\s\xa0]*Jan[uů])|III\.?[\s\xa0]*Jano|Tretia[\s\xa0]*J[a\xE1]no|Tretia[\s\xa0]*kniha[\s\xa0]*J[a\xE1]no|(?:T(?:řet[i\xED]|ret[i\xED])|III\.?)[\s\xa0]*list[\s\xa0]*Jan[uů])v|(?:Johannes[\s\xa0]*tredje[\s\xa0]*|Tredje[\s\xa0]*Johannes)brev|Johannes['’][\s\xa0]*3[\s\xa0]*Brev|(?:Johannes['’][\s\xa0]*(?:Tredje|3\.)|Tredje[\s\xa0]*Johannes['’])[\s\xa0]*Brev|(?:Waraka[\s\xa0]*wa[\s\xa0]*Tatu[\s\xa0]*w|Barua[\s\xa0]*ya[\s\xa0]*Tatu[\s\xa0]*y)a[\s\xa0]*Yohane|(?:Kolmas|III\.?)[\s\xa0]*Johanneksen[\s\xa0]*kirje|(?:D(?:ritt|erd)e[\s\xa0]*Johanne|Harmadik[\s\xa0]*J[a\xE1]no)s|Epistula[\s\xa0]*III[\s\xa0]*Ioannis|(?:y(?:oh[aā]n[aā]ce[mṃ][\s\xa0]*tisre|uhann[aā]ko[\s\xa0]*testro|ūhann[aā]ko[\s\xa0]*testro)[\s\xa0]*patr|Hezzantto[\s\xa0]*Yohaannis|Třet[i\xED][\s\xa0]*Janov|III\.?[\s\xa0]*Yooxana|Tr(?:etje[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Iv|zecia?[\s\xa0]*J)an|(?:Trzecia?|III\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan)a|(?:Tre[c\xE6ć]a|III)[\s\xa0]*Ivanova[\s\xa0]*Poslanica|III\.[\s\xa0]*I(?:vanova[\s\xa0]*Poslanica|oannis|n)|(?:تیسرا|۳)۔یوحنا|(?:تیسرا|۳)[\s\xa0]*یوحنّا|(?:تیسرا|۳)[\s\xa0]*یُوحنّا|(?:تیسرا|۳)\-?یُوحنّا|3(?:[\s\xa0]*(?:ਯੂਹੰਨਾ|يو|ยน|Ів|Йн|Ин|Јн|Y(?:ōva[nṉ]|ova[nṉ])|Gv|योहानाच|y(?:oh[aā]n[aā]ce[mṃ]|ūh\xE3nā)|In)|rd(?:\.[\s\xa0]*J(?:oh[mn]|n)|[\s\xa0]*J(?:oh[mn]|n))|요한|[\s\xa0]*ยอห์น|[\s\xa0]*ଯୋହନଙ|[\s\xa0]*(?:அருளப்பர|யோவான)்|[\s\xa0]*Јованов[ао]|[\s\xa0]*Yohan(?:es|a)|\xB0\.?[\s\xa0]*Giovanni|[\s\xa0]*Gi(?:ovanni|ăng)|[\s\xa0]*युहत्रा|[\s\xa0]*यूहन्नाको|rd\.?[\s\xa0]*Jhn|rd\.?[\s\xa0]*Jonh|(?:o(?:\.[\s\xa0]*Jo[a\xE3]|[\s\xa0]*Jo[a\xE3])|a\.?[\s\xa0]*Jo[a\xE3]|[\s\xa0]*yūhann[aā]k|[\s\xa0]*yuhann[aā]k)o|(?:(?:o(?:\.[\s\xa0]*J[au]|[\s\xa0]*J[au])|\xBA\.?[\s\xa0]*J[au]|(?:\xBA\.?|o\.?)?[\s\xa0]*San[\s\xa0]*J[au])[au]|rd\.?[\s\xa0]*Joo|[\s\xa0]*Gioa|rd\.?[\s\xa0]*Jh[ho]|(?:(?:e(?:me\.?|\.)?|\xE8me\.?)[\s\xa0]*Je|[\s\xa0]*Yokan)a)n|(?:rd(?:\.[\s\xa0]*Jo?|[\s\xa0]*Jo?)p|Jo)hn|(?:e\.?[\s\xa0]*Johannesbreve|[\s\xa0]*Gjoni|[\s\xa0]*[ei]\.?[\s\xa0]*Gjoni)t|[\s\xa0]*(?:k(?:\.[\s\xa0]*J[a\xE1]|[\s\xa0]*J[a\xE1])no|list[\s\xa0]*Jan[uů])v|[\s\xa0]*J(?:an(?:o(?:va|s)|a)|\xE1no[sv]|h?n|\xF3h|(?:h[ho]|u[au]|ea|a[au])n|phn|an[uů]v|o(?:h(?:anne(?:s(?:['’][\s\xa0]*Brev|brevet)|ksen[\s\xa0]*kirje)|[mn])|[a\xE3]o|nh|on|phn))|[\s\xa0]*Ioannis|[\s\xa0]*(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan|Yoo(?:hann|xana))a|[\s\xa0]*Ivanova[\s\xa0]*Poslanica|\.(?:[\s\xa0]*(?:J(?:an(?:o(?:va|s)|a)|\xE1no[sv]|h?n|\xF3h|(?:h[ho]|u[au]|ea|a[au])n|phn|an[uů]v|o(?:h(?:anne(?:s(?:['’][\s\xa0]*Brev|brevet)|ksen[\s\xa0]*kirje)|[mn])|[a\xE3]o|nh|on|phn))|ଯୋହନଙ|ยอห์น|யோவான்|Јованов[ао]|Yohan(?:es|a)|Gi(?:ovanni|ăng)|य(?:ूहन्नाको|ुहत्रा)|y[uū]hann[aā]ko|(?:San[\s\xa0]*J[au][au]|Gioa|Yokana)n|Gjonit|list[\s\xa0]*Jan[uů]v|(?:List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*)?Jan|Yoo(?:hann|xana))a|I(?:vanova[\s\xa0]*Poslanica|oannis|n))|(?:[o\xBA]\.?[\s\xa0]*San[\s\xa0]*J[au]|[o\xBA]\.?[\s\xa0]*J[au])[au]n)|\.?۔یوحنا|\.?[\s\xa0]*یوحنّا|\.?[\s\xa0]*یُوحنّا|\.\-?یُوحنّا|\-?یُوحنّا)|3\-?(?:е(?:\.?[\s\xa0]*И|\.?[\s\xa0]*Й)|(?:тє|а)[\s\xa0]*[ИЙ]|(?:тє|а)\.[\s\xa0]*[ИЙ])оаново|3\.?[\s\xa0]*Иоаново|(?:III(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|3\.[\s\xa0]*Й|3[\s\xa0]*Й)оаново|(?:(?:III\.?[\s\xa0]*послание[\s\xa0]*н|3\.?[\s\xa0]*послание[\s\xa0]*н)а|(?:III\.?|3\.?)[\s\xa0]*писмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Јован|3(?:e(?:\.[\s\xa0]*Joh(?:annes)?|[\s\xa0]*Joh(?:annes)?)|rd(?:\.[\s\xa0]*Joh?|[\s\xa0]*Joh?)|[\s\xa0]*(?:யோ(?:வா)?|Gj|योहान|Iv)|[\s\xa0]*Јован|[\s\xa0]*Yoh(?:ane)?|[\s\xa0]*Yoox|[\s\xa0]*Gi|[\s\xa0]*यूहन्ना|rd\.?[\s\xa0]*Jh|[\s\xa0]*J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?|h)?|[\s\xa0]*Ioan|\.[\s\xa0]*(?:J(?:o(?:h(?:annesbrev)?)?|an(?:ov)?|h)?|Yo(?:h(?:ane)?|ox)|Јован|Gi|यूहन्ना|Ioan))|T(?:re(?:t(?:\xED[\s\xa0]*J(?:an)?|i[\s\xa0]*J(?:an)?)|dje[\s\xa0]*Joh)|řet[i\xED][\s\xa0]*J(?:an)?|atu[\s\xa0]*Yoh)|אגרתו[\s\xa0]*השלישית[\s\xa0]*של[\s\xa0]*יוחנן[\s\xa0]*השלי|Γ['ʹʹ΄’][\s\xa0]*Ιω|Derde[\s\xa0]*Joh|III(?:\.[\s\xa0]*J(?:oh?|an)?|[\s\xa0]*J(?:oh?|an)?)|Third[\s\xa0]*Joh?|III\.?[\s\xa0]*Јован|III\.?[\s\xa0]*Yoh(?:ane)?|III\.?[\s\xa0]*Yoox|III\.?[\s\xa0]*Gi|Third[\s\xa0]*Jh|III\.[\s\xa0]*Ioan|3\.?[\s\xa0]*Иоан|(?:III(?:\.[\s\xa0]*[ИЙ]|[\s\xa0]*[ИЙ])|3\.[\s\xa0]*Й|3[\s\xa0]*Й)оан|(?:(?:3(?:\-?(?:е\.?|я\.?)|[ея]\.?|\.)?[\s\xa0]*Иох|(?:3(?:\-?е\.?|\.)|III\.?)[\s\xa0]*Ів|(?:3(?:\-?е\.?|\.)?|III\.?)[\s\xa0]*Послання[\s\xa0]*Ів|(?:3(?:\-?е\.?|\.)?|III\.?)[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Ів)а|3\-?е\.?[\s\xa0]*Иоан|3(?:[ея]\.?|\-?я\.?)[\s\xa0]*Иоан|(?:3(?:\-?е\.?|\.)|III\.?|3)[\s\xa0]*Іоан|3(?:\-?(?:е\.?[\s\xa0]*послани|я\.?[\s\xa0]*послани)|[ея]\.?[\s\xa0]*послани|\.?[\s\xa0]*послани)е[\s\xa0]*Иоан|(?:3(?:\-?е\.?|\.)?|III\.?)[\s\xa0]*соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан|3\-?(?:тє|а)[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)|3\-?(?:тє|а)\.[\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан))на|(?:III\.?|3\.?)[\s\xa0]*посланица[\s\xa0]*Јованова|Тре(?:т(?:(?:[яє][\s\xa0]*[ИЙ]оано|а[\s\xa0]*[ИЙ]оано|а[\s\xa0]*Јовано)во|а[\s\xa0]*п(?:ослание[\s\xa0]*на|исмо[\s\xa0]*од)[\s\xa0]*апостол[\s\xa0]*Јован|а[\s\xa0]*(?:[ИЙ]о|Јов)ан|[яє][\s\xa0]*(?:(?:послання[\s\xa0]*апостола[\s\xa0]*|Послання[\s\xa0]*)?Іва|Іоан|соборне[\s\xa0]*послання[\s\xa0]*св\.?[\s\xa0]*апостола[\s\xa0]*Іоан)на|о[\s\xa0]*(?:п(?:ослание[\s\xa0]*на[\s\xa0]*(?:апостол[\s\xa0]*Јов|[ИЙ]о)|исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Јов)ан|(?:[ИЙ]о|Јов)аново|(?:[ИЙ]о|Јов)ан|съборно[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Иоана[\s\xa0]*Богослова))|ћ(?:ом[\s\xa0]*(?:посланица[\s\xa0]*)?|а[\s\xa0]*(?:посланица[\s\xa0]*)?)Јованова))|(?:《(?:约(?:翰[三叁]书|[三叁])|約[三叁]|伊望第三|約翰[三參]書|若望三書)|(?:約[三叁]|伊望第三|約翰[三參]書|若望三書)》|约(?:翰[三叁]书|[三叁])》|يوحنا[\s\xa0]*الثالثة|3\.?[\s\xa0]*Johannes|Ioannis[\s\xa0]*III|3\.?[\s\xa0]*Johanneksen|III\.?[\s\xa0]*Johanneksen|Kolmas[\s\xa0]*Johanneksen|Johannes’[\s\xa0]*tredje[\s\xa0]*brev|III[\s\xa0]*Ioannis|約[三叁]|伊望第三|約翰[三參]書|若望三書|约(?:翰[三叁]书|[三叁])|(?:III\.?[\s\xa0]*I|3\.?[\s\xa0]*I)vanova|Tre(?:[c\xE6ć]a[\s\xa0]*Ivanova(?:[\s\xa0]*poslanica)?|t[i\xED][\s\xa0]*J[a\xE1]nov|dje[\s\xa0]*Johannes)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["John"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:y(?:oh[aā]n[aā]ne[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā]n|uhannale[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]r)|Gioan)|(?:І[вн]|يو|Ἰω|ย[นฮ]|Ин|G(?:[gv]|iăng)|요한[\\s\\xa0]*?복음서|《(?:[約约](?:翰福音)?|若望福音|伊望)》|Ιω[άα]ννης|ヨハネ(?:[の傳]福音書|福音書|伝|による福音書)|إنجيل[\\s\\xa0]*يوحنا|Κατ[άα][\\s\\xa0]*Ιω[άα]ννην|ਯੂਹ(?:ੰਨਾ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਇੰਜੀਲ|ਾਂਨਾ)|ی(?:ُوحنّ|وحن)ا[\\s\\xa0]*کی[\\s\\xa0]*انجیل|Injili[\\s\\xa0]*ya[\\s\\xa0]*Yohan[ae]|הבשורה[\\s\\xa0]*על[\\s\\xa0\\-?]*פי[\\s\\xa0]*יוחנן|ยอห์น|พระวรสารนักบุญจอห์น|Јн|ଯୋହନ[\\s\\xa0]*ଲିଖିତ[\\s\\xa0]*ସୁସମାଗ୍ଭର|அருளப்பர்[\\s\\xa0]*நற்செய்தி|யோவான்[\\s\\xa0]*(?:எழுதிய[\\s\\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Gjonit|(?:Y(?:ōv[aā][nṉ][\\s\\xa0]*Na[rṛ]|ov[aā][nṉ][\\s\\xa0]*Na[rṛ])ceyt|Gjon|Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Giovann)i|J(?:o(?:hanne(?:ksen[\\s\\xa0]*evankeliumi|sevangeliet)|[a\\xE3]o)|anos)|От[\\s\\xa0]*Иоана[\\s\\xa0]*свето[\\s\\xa0]*Евангелие|Јеванђеље[\\s\\xa0]*по[\\s\\xa0]*Јовану|Євангелі(?:є[\\s\\xa0]*від[\\s\\xa0]*(?:св(?:\\.[\\s\\xa0]*[ИЙ]|[\\s\\xa0]*[ИЙ])о|Ів)|я[\\s\\xa0]*від[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*)?Ів)ана|Йн|Иохан|Еван(?:гелие(?:[\\s\\xa0]*(?:от[\\s\\xa0]*(?:Иоанна|Йоан)|според[\\s\\xa0]*Јован)|то[\\s\\xa0]*според[\\s\\xa0]*Јован)|ђеље[\\s\\xa0]*по[\\s\\xa0]*Јовану)|J[o\\xF3]hannesargu\\xF0spjall|y(?:ū(?:hann[aā]le[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]r|(?:ḥannā[\\s\\xa0]*kī[\\s\\xa0]*in|h\\xE3nā[\\s\\xa0]*dī[\\s\\xa0]*ĩ)jīl)|uhannāle[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]r)|य(?:ूह(?:न(?:्ना(?:ले[\\s\\xa0]*लेखे)?को[\\s\\xa0]*सुसमाचार|ा)|ान्ना)|(?:ुह(?:त्र|न्न)|हून्न)ा|ोहानाने[\\s\\xa0]*लिहिलेले[\\s\\xa0]*शुभवर्तमान)|Jevanđelje[\\s\\xa0]*po[\\s\\xa0]*Ivanu|J\\xE1nos|Ioannes|Injil[\\s\\xa0]*Yohanes|Yo(?:haannis|oxana)a|Yuhanna|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*Ivana|J(?:ohannis|anovo)[\\s\\xa0]*evangelium|E(?:van(?:geli(?:um[\\s\\xa0]*(?:secundum[\\s\\xa0]*Ioannem|podle[\\s\\xa0]*Jana)|e(?:[\\s\\xa0]*volgens|t[\\s\\xa0]*etter)[\\s\\xa0]*Johannes)|jelium[\\s\\xa0]*Pod[lľ]a[\\s\\xa0]*J[a\\xE1]na|[\\xF0đ]elje[\\s\\xa0]*po[\\s\\xa0]*Ivanu)|w(?:angelia[\\s\\xa0]*w(?:edług[\\s\\xa0]*[sś]|g[\\s\\xa0]*[sś])w[\\s\\xa0]*|(?:angelia)?[\\s\\xa0]*|(?:angelia[\\s\\xa0]*w(?:edług[\\s\\xa0]*[sś]|g[\\s\\xa0]*[sś])w)?\\.[\\s\\xa0]*)Jana)|요(?:한[\\s\\xa0]*?복음)?|G(?:jo|i)|Ιω(?:[άα]ν)?|ヨハネ|Yo(?:ox|h)|Ioan|யோவா|J(?:\\xE1n|\\xF3h)|Евангелие[\\s\\xa0]*от[\\s\\xa0]*Иоан|य(?:ूहन्ना|ोहान)|Ew[\\s\\xa0]*Jan|(?:(?:Evankeliumi[\\s\\xa0]*Johanneksen[\\s\\xa0]*muka|Yokan|Iv)a|El[\\s\\xa0]*Evangelio[\\s\\xa0]*de[\\s\\xa0]*J[au][au]|Jea|(?:Ebanghelyo|Sulat)[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Jua|Ebanghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*)?Jua|Mabuting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*)?Jua)n|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))))|(?:Иоанн?а)|(?:yohanane)|(?:G(?:ospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)))|iovanni)|ଯୋହନ|요한|Йоана|Иоан|Јован|《(?:[約约]翰福音|若望福音|伊望)|יוחנן|伊望》|若望福音》|[約约](?:翰福音)?》|ਯੂਹੰਨਾ|யோவான்|يوحنا|ی(?:ُوحنّ|وحن)ا|Y(?:o(?:han(?:es|a)|v[aā][nṉ])|ōv[aā][nṉ])|Від[\\s\\xa0]*Івана|От[\\s\\xa0]*Иоанн?а|y(?:oh(?:ān[aā]|anā)ne|ūh\\xE3nā|ūhann[aā]le|uhann[aā]le)|य(?:ूहन्नाल|ोहानान)े|J(?:[a\\xE1]na|ohannes)|《[約约]|Йоан|Yohane|(?:J(?:ohannekse|a[au]|uu)|San[\\s\\xa0]*Jua)n)|(?:Jh[ho]n)|(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|[約约]翰福音|伊望|若望福音|Івана|约|Juan)|(?:J(?:o(?:h[mn]|nh|h|on|phn)|h?n|h|phn)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Josh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ἰη|수|يش|Єг|ยชว|여호수아기|ヨシュア記|יהושע|《(?:[书書]|若蘇厄書|约书亚记|約書亞記)》|โยชูวา|ਯਹੋਸ਼ੁਆ|G(?:i(?:\\xF4(?:\\-?su[a\\xEA]|s)|osu[e\\xE8\\xE9])|su[a\\xEA])|یشوع|یشُوع|سفر[\\s\\xa0]*يشوع|Yaasu|И(?:[\\s\\xa0[\\s\\xa0]]*|\\.[\\s\\xa0]?)Н|Iosua[\\s\\xa0]*Navi|Liber[\\s\\xa0]*Iosue|Isus[\\s\\xa0]*Navyn|(?:Y(?:ashuuc|osu)|Liv[\\s\\xa0]*Jozye[\\s\\xa0]*|Yoshu)a|J(?:o(?:s(?:va(?:bogen|s[\\s\\xa0]*Bog)|u(?:[e\\xE9]|ah))|z(?:u(?:eu|a)|su[e\\xE9])|šua|(?:[zš]uov|ush?u|s(?:uov|hu))a|osuan[\\s\\xa0]*kirja)|\\xF3zsu[e\\xE9]|\\xF3zua|sh|š|\\xF3zuova)|यहोश(?:ूको[\\s\\xa0]*पुस्तक|वा|ु)|Yahoshoo|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Jozuego|Ιησ(?:ο[υύ]ς[\\s\\xa0]*του[\\s\\xa0]*Ναυ[ήη]|[\\s\\xa0]*Ναυ[ήη])|Y[oō]cuv[aā]|J(?:os(?:\\xFAab[o\\xF3]|uab[o\\xF3]|vas[\\s\\xa0]*bo)|\\xF3s[u\\xFA]ab[o\\xF3])k|Yusak|ya(?:ho(?:ŝaw[aā]|šuā|šuko[\\s\\xa0]*pustak|šūko[\\s\\xa0]*pustak|s(?:[uū]ko[\\s\\xa0]*pustak|aw[aā]))|šūʿ)|ଯିହୋଶୂୟଙ୍କର[\\s\\xa0]*ପୁସ୍ତକ|யோசுவாவின்[\\s\\xa0]*புத்தகம்|(?:Ј[ео]|Ие)шуа|[ІИ]сус[\\s\\xa0]*Навин|J(?:o(?:s(?:va(?:bog)?|ua|h)?|z(?:ue|s)?|os)|(?:\\xF3z|\\xF3)?s)|여호(?:수아)?|ヨシュア|Gs|Y(?:ash|os)|Иеш|Ios|यहोशू|Ιη(?:σ[\\s\\xa0]*Ναυ)?|யோசு(?:வா)?|(?:И(?:и?с\\.[\\s\\xa0]*|и?с[\\s\\xa0]*)?|І\\.?[\\s\\xa0]*)Нав|Книга[\\s\\xa0]*(?:Ісуса[\\s\\xa0]*Навина|Єгошу[ії]|Иисуса[\\s\\xa0]*Навина|Иисус[\\s\\xa0]*Навин|на[\\s\\xa0]*Исус[\\s\\xa0]*Н(?:авиев|евин)))|(?:《(?:[书書]|約書亞記|约书亚记|若蘇厄書)|Gi\\xF4|書》|يشوع|Iosu[ae]|(?:約書亞記|书|约书亚记)》|若蘇厄書》|Єгошу[ії]|यहोशूको|Jo(?:svas|zye|osuan)|Jozuego|yaho[sš][uū]ko|ଯିହୋଶୂୟଙ୍କର|Навин|約書亞記|书|约书亚记|Нав|若蘇厄書|Ісуса[\\s\\xa0]*Навина|И(?:исус(?:а[\\s\\xa0]*Навина|[\\s\\xa0]*Навин)|сус[\\s\\xa0]*Навиев)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*Ездрина|I[\s\xa0]*Esdras|3\.?[\s\xa0]*Esdrasbog)|(?:I[\s\xa0]*Esdra)|(?:[1I](?:\.[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|[\s\xa0]*Ezdr(?:\xE1[sš]|aš))ova)|(?:1(?:\.[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|[\s\xa0]*Ezdr(?:\xE1[sš]|aš))|I\.?[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|(?:1\.?|I\.?)[\s\xa0]*Ezdrasza|(?:1\.?|I\.?)[\s\xa0]*Ezdrasova|1[\s\xa0]*k[\s\xa0]*Ezdr[a\xE1][sš]ova|1[\s\xa0]*k\.[\s\xa0]*Ezdr[a\xE1][sš]ova|Prv(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ezdr[a\xE1][sš]|[y\xFD][\s\xa0]*Ezdr[a\xE1][sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ezdr[a\xE1][sš]|Ezdr[a\xE1][sš]))ova)|(?:[1I]\.?[\s\xa0]*Ezdras)|(?:[1I]\.?[\s\xa0]*Ezdra)|(?:エ[スズ](?:[トド]ラ第一巻|ラ第一書)|에스드라[\s\xa0]*1서|《1Esd》|חזון[\s\xa0]*עזרא|Α['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρας|[ΈΕ]σδρας[\s\xa0]*Α['ʹʹ΄’]|2(?:[ея]\.?|\.|\-?[ея]\.?)?[\s\xa0]*Ездры|إسدراس[\s\xa0]*الأول|Liber[\s\xa0]*I[\s\xa0]*Esdrae|Liber[\s\xa0]*Esdrae[\s\xa0]*I|E(?:zdr[a\xE1]s[\s\xa0]*I|sdra[\s\xa0]*greco)|I(?:\.[\s\xa0]*Esdra[es]|[\s\xa0]*Esdr)|I\.?[\s\xa0]*Ездра|I\.?[\s\xa0]*Ezd|Tredje[\s\xa0]*Esdrasbog|F\xF8rste[\s\xa0]*Esdrasbog|1(?:[\s\xa0]*(?:E(?:s(?:dra(?:sbog|e)|ra)|zd)|எஸ்திராஸ்|Ездр[аи])|\.[\s\xa0]*(?:E(?:s(?:dra(?:sbog|e)|ra)|zd)|Ездра))|1\-?(?:[ае]|ше)[\s\xa0]*Ездр[аи]|1\-?(?:[ае]|ше)\.[\s\xa0]*Ездр[аи]|(?:I\.?[\s\xa0]*Е|1\.[\s\xa0]*Е|1[\s\xa0]*Је|(?:I\.?|1\.)[\s\xa0]*Је)здрина|П(?:рва[\s\xa0]*(?:Је|Е)здрина|ерш[ае][\s\xa0]*Ездр[аи]|ърв(?:а[\s\xa0]*(?:книга[\s\xa0]*на[\s\xa0]*)?|о[\s\xa0]*)Ездра)|3\.?[\s\xa0]*Esdras|III\.?[\s\xa0]*Esdras|1\xB0[\s\xa0]*Esdras|1\xB0\.[\s\xa0]*Esdras|(?:Els[oő][\s\xa0]*Ezdr[a\xE1]|First[\s\xa0]*Esdra|1st\.?[\s\xa0]*Esdra)s|3e\.?[\s\xa0]*Esdras|(?:Derde|Unang|Eerste|Una|1e\.?)[\s\xa0]*Esdras|(?:1\.?|I\.?|1\xB0|1\xB0\.)[\s\xa0]*\xC9sdras|1(?:[ao\xBA]|re|\xE8re|ere|er|\.[o\xBA])[\s\xa0]*Esdras|1(?:[ao\xBA]|re|\xE8re|ere|er|\.[o\xBA])\.[\s\xa0]*Esdras|1[\s\xa0]*k[\s\xa0]*Ezdr[a\xE1][sš]|1[\s\xa0]*k\.[\s\xa0]*Ezdr[a\xE1][sš]|Pr(?:v(?:(?:[y\xFD][\s\xa0]*list|n[i\xED])[\s\xa0]*Ezdr[a\xE1][sš]|[y\xFD][\s\xa0]*Ezdr[a\xE1][sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ezdr[a\xE1][sš]|Ezdr[a\xE1][sš]))|(?:im(?:[ao][\s\xa0]*\xC9|[ao][\s\xa0]*E|er[\s\xa0]*E|e(?:ir[ao]|ro)[\s\xa0]*E)|emi(?:er(?:es?|s)?|\xE8res?)[\s\xa0]*E)sdras)|1(?:st(?:\.[\s\xa0]*Esdr?|[\s\xa0]*Esdr?)|[\s\xa0]*(?:Ездр|Јез)|[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?|\.[\s\xa0]*(?:Es(?:d(?:r(?:as?)?)?|r)?|Ездри))|Α['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρ?|2[\s\xa0]*Езд|Els[oő][\s\xa0]*Ezd|I(?:\.[\s\xa0]*Esd(?:ra?)?|[\s\xa0]*Esd)|First[\s\xa0]*Esdr?|I\.?[\s\xa0]*Ездри|F\xF8rste[\s\xa0]*Esdras|3\.?[\s\xa0]*Esdra|III\.?[\s\xa0]*Esdra|1\xB0[\s\xa0]*Esdra|1\xB0\.[\s\xa0]*Esdra|Prim[ao][\s\xa0]*Esdra|(?:(?:(?:3(?:e\.?|\.)?|Tredje|F\xF8rste)[\s\xa0]*Es|3\.?[\s\xa0]*Ez|I(?:II\.?[\s\xa0]*Ez|[\s\xa0]*Es|\.[\s\xa0]*Es)|I\.?[\s\xa0]*Ez|1\.?[\s\xa0]*Ez)r|(?:1\.?|I\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ezdrasz|Pierwsz[aey][\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasz)a|(?:3(?:\xB0[\s\xa0]*Esd|e\.?[\s\xa0]*Ez|\xB0\.[\s\xa0]*Esd)|Terz[ao][\s\xa0]*Esd|F[o\xF6]rsta[\s\xa0]*Es|E(?:nsimm[a\xE4]inen|rste)[\s\xa0]*Es|3\.?[\s\xa0]*Ezd|III\.?[\s\xa0]*Ezd|Una[\s\xa0]*Ez|(?:Derde|Unang|Eerste)[\s\xa0]*Ez|1e\.?[\s\xa0]*Ez)ra|K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*ch|wanz)a[\s\xa0]*Ezra)|(?:1Esd》|《1Esd|1Esd|I[\s\xa0]*Esdrae))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:4\.?[\s\xa0]*Esdrasbog|2[\s\xa0]*Ездрина)|(?:(?:II(?:\.[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|[\s\xa0]*Ezdr(?:\xE1[sš]|aš))|2(?:\.[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|[\s\xa0]*Ezdr(?:\xE1[sš]|aš)))ova)|(?:2(?:\.[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|[\s\xa0]*Ezdr(?:\xE1[sš]|aš))|II\.?[\s\xa0]*Ezdr(?:\xE1[sš]|aš)|(?:II\.?|2\.?)[\s\xa0]*Ezdrasza|(?:II\.?|2\.?)[\s\xa0]*Ezdrasova|2[\s\xa0]*k[\s\xa0]*Ezdr[a\xE1][sš]ova|2[\s\xa0]*k\.[\s\xa0]*Ezdr[a\xE1][sš]ova|Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ezdr[a\xE1][sš]|[y\xFD][\s\xa0]*Ezdr[a\xE1][sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ezdr[a\xE1][sš]|Ezdr[a\xE1][sš]))ova)|(?:エ[スズ](?:[トド]ラ第二巻|ラ第二書)|에스드라[\s\xa0]*2서|《2Esd》|Β['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρας|[ΈΕ]σδρας[\s\xa0]*Β['ʹʹ΄’]|3(?:\.[\s\xa0]*Ездр[аы]|[\s\xa0]*Ездр[аы]|[ея]\.?[\s\xa0]*Ездры|\-?[ея]\.?[\s\xa0]*Ездры)|עזרא[\s\xa0]*החיצוני|إسدراس[\s\xa0]*الثاني|Ezdr[a\xE1]s[\s\xa0]*II|Liber[\s\xa0]*(?:Esdrae[\s\xa0]*II|II[\s\xa0]*Esdrae)|Друге[\s\xa0]*Ездр[аи]|(?:Fjerde|Anden)[\s\xa0]*Esdrasbog|2(?:\-?(?:[ае](?:\.[\s\xa0]*Ездр[аи]|[\s\xa0]*Ездр[аи])|ге(?:\.[\s\xa0]*Ездр[аи]|[\s\xa0]*Ездр[аи]))|[\s\xa0]*(?:எஸ்திராஸ்|Ездр[аи])|[\s\xa0]*Es(?:dra(?:sbog|e)|ra)|\.[\s\xa0]*Es(?:dra(?:sbog|e)|ra))|(?:(?:Second[ao]|2\xB0\.?)[\s\xa0]*Esd|4\.?[\s\xa0]*Esd)ras|2\.?[\s\xa0]*Ezdras|(?:Друга|2\.)[\s\xa0]*Ездра|(?:2(?:\-?(?:[ае]\.?|ге\.?)|\.)?|Друг[ае])[\s\xa0]*книга[\s\xa0]*Ездри|I(?:I(?:\.[\s\xa0]*(?:E(?:sdra[es]|zdras)|Ездра|книга[\s\xa0]*Ездри)|[\s\xa0]*(?:E[sz]dras|Ездра|книга[\s\xa0]*Ездри))|V\.?[\s\xa0]*Esdras)|(?:(?:Друга|2\.)[\s\xa0]*Е|2[\s\xa0]*Је|(?:Друга|2\.)[\s\xa0]*Је|II(?:\.[\s\xa0]*(?:Је|Е)|[\s\xa0]*(?:Је|Е)))здрина|III[\s\xa0]*Ездра|(?:Трет[ао]|III\.)[\s\xa0]*Ездра|Втор(?:а[\s\xa0]*(?:книга[\s\xa0]*на[\s\xa0]*)?|о[\s\xa0]*)Ездра|(?:M[a\xE1]sodik[\s\xa0]*Ezdr[a\xE1]|Second[\s\xa0]*Esdra|2nd\.?[\s\xa0]*Esdra)s|Andre[\s\xa0]*Esdras|(?:(?:Twee|Vier)de|2e\.|2e|Ikalawang)[\s\xa0]*Esdras|(?:2(?:\xB0\.?|\.)?|Second[ao]|II\.?)[\s\xa0]*\xC9sdras|2(?:[ao\xBA]|de|\xE8me|eme|d|\.[o\xBA])[\s\xa0]*Esdras|(?:2(?:[ao\xBA]|de|\xE8me|eme|d|\.[o\xBA])\.|Segund[ao])[\s\xa0]*Esdras|2[\s\xa0]*k[\s\xa0]*Ezdr[a\xE1][sš]|2[\s\xa0]*k\.[\s\xa0]*Ezdr[a\xE1][sš]|D(?:ruh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ezdr[a\xE1][sš]|[y\xFD][\s\xa0]*Ezdr[a\xE1][sš]|[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Ezdr[a\xE1][sš]|Ezdr[a\xE1][sš]))|euxi[e\xE8]mes?[\s\xa0]*Esdras)|2(?:nd(?:\.[\s\xa0]*Esdr?|[\s\xa0]*Esdr?)|[\s\xa0]*(?:Ездр|Јез)|[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?|\.[\s\xa0]*Es(?:d(?:r(?:as?)?)?|r)?)|Β['ʹʹ΄’][\s\xa0]*[ΈΕ]σδρ?|3[\s\xa0]*Ездр?|M[a\xE1]sodik[\s\xa0]*Ezd|Second[\s\xa0]*Esdr?|(?:(?:Second[ao]|2\xB0\.?)[\s\xa0]*Esd|4\.?[\s\xa0]*Esd)ra|2\.?[\s\xa0]*Ezd(?:ra)?|(?:Друга|2\.)[\s\xa0]*Ездри|I(?:I(?:[\s\xa0]*(?:E(?:sd(?:ra|r)?|zd(?:ra)?)|Ездри)|\.[\s\xa0]*(?:E(?:sd(?:ra?)?|zd(?:ra)?)|Ездри))|V\.?[\s\xa0]*Esdra)|(?:(?:(?:Andre|4\.?|Fjerde)[\s\xa0]*Es|4\.?[\s\xa0]*Ez|2\.?[\s\xa0]*Ez|I(?:I(?:\.[\s\xa0]*E[sz]|[\s\xa0]*E[sz])|V\.?[\s\xa0]*Ez))r|(?:II\.?|2\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ezdrasz|Drug[ai][\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Ezdrasz)a|(?:(?:Quart[ao]|4\xB0\.?)[\s\xa0]*Esd|(?:Toinen|Andra)[\s\xa0]*Es|Zweite[\s\xa0]*Es|Fj[a\xE4]rde[\s\xa0]*Es|4\.?[\s\xa0]*Ezd|2e[\s\xa0]*Ez|(?:(?:Twee|Vier)de|2e\.)[\s\xa0]*Ez|I(?:kalawang[\s\xa0]*Ez|V\.?[\s\xa0]*Ezd))ra|Pili[\s\xa0]*Ezra|Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Ezra)|(?:2Esd》|《2Esd|2Esd|II[\s\xa0]*Esdrae))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Isa"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Isai(?:i[ai]|s|i|a[ai])ha)|(?:《(?:以(?:賽(?:亚书|亞書)|赛亚书)|[賽赛]|依撒意亞)》|Ἠσ|사|اش|이사야서|イ[サザ]ヤ書|எசாயா|\\xCA\\-?sai|ی(?:سع|عس)یاہ|ישע(?:יהו|ה)|Иса(?:ја|я|ија)|อ(?:ิสยาห์|สย)|ਯਾ?ਸਾਯਾਹ|Η(?:ΣΑ(?:[ΊΙ]|Ϊ́)ΑΣ|σαΐας)|\\xC9saie|إشعيا|I(?:s(?:a(?:i(?:ih|e|as)|\\xEDa[hs]|(?:ia?)?ha|a(?:[ai][ai]?)?ha)|i[ai](?:[ai][ai]?)?ha)|za(?:i[a\\xE1][sš]|j[a\\xE1][sš])|a)|ﺃﺷﻌﻴﺎء|إشَعْياء|سفر[\\s\\xa0]*إشعياء|\\xC9(?:zsai[a\\xE1]|sai[a\\xE1])s|E(?:sa(?:i(?:\\xE1s|e)|jas['’][\\s\\xa0]*Bog)|zsai[a\\xE1]s)|[EI\\xC9]sa\\xEFe|Liber[\\s\\xa0]*Isaiae|Jesajabok(?:en|a)|य(?:श(?:ैयाको[\\s\\xa0]*पुस्तक|ायाह|या)|ेशैया)|(?:I(?:s(?:i(?:yaas|h)|a[jy])|\\-?sai\\-?|zaij)|Y[e\\xE9]say|I\\-?sa\\-?gi|Esei|Liv[\\s\\xa0]*Ezayi[\\s\\xa0]*|Jesa(?:jan[\\s\\xa0]*kirj|i))a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Izajasza|Ec[aā]y[aā]|Isai(?:i[ai]|s|a[ai])h|Issah|Ishacyaah|(?:Esaias['’]|Jesajas)[\\s\\xa0]*bok|ya(?:s(?:(?:aʿ|ā)yāh|ay[aā]|haayaah|əiy[aā]ko[\\s\\xa0]*pustak)|šəiy[aā]ko[\\s\\xa0]*pustak|ŝay[aā])|Ісая|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*(?:Іса[ії]|Исаии)|Іса[ий][ії]|на[\\s\\xa0]*пророк[\\s\\xa0]*Исаия)|ஏசாயா[\\s\\xa0]*தீர்க்கதரிசியின்[\\s\\xa0]*புத்தகம்|ୟିଶାୟ|ୟଶାଇୟ|I(?:s(?:a(?:(?:ia?)?h|\\xEDa|ia?|a(?:[ai][ai]?)?h)?|i[ai](?:[ai][ai]?)?h|iy|h)?|z)|イ[サザ]ヤ|이사야?|Іс|எசா|ישעיה|Ис(?:аи)?|ਯਸਾ|Ησ|\\xC9sa?|\\xC9zs|E(?:sai?|zs)|Jes(?:aja)?|यश(?:ा(?:या?)?|ैया)|ஏசா|ଯ(?:ିଶାଇୟ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କର[\\s\\xa0]*ପୁସ୍ତକ|[ାୀ]ଶାଇୟ))|(?:《(?:以(?:賽(?:亚书|亞書)|赛亚书)|[賽赛]|依撒意亞)|Іса[ії]|ஏசாயா|(?:[賽赛]|依撒意亞)》|以(?:賽(?:亚书|亞書)|赛亚书)》|Исаи[ия]|ଯିଶାଇୟ|E(?:sa[ij]as|zayi)|Ησαιας|यशैयाको|Jesajan|I(?:zajasz|\\-?s)a|以(?:賽(?:亚书|亞書)|赛亚书)|[賽赛]|依撒意亞|ya[sš]əiy[aā]ko))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*(?:S(?:amual[ls]|ma)|Царе|Царства|Саму(?:ил(?:ов)?|[ії]лов)а)|\.[\s\xa0]*S(?:amual[ls]|ma))|II(?:\.?[\s\xa0]*S\xE1muel|\.?[\s\xa0]*Sma|\.?[\s\xa0]*Samual[ls]))|(?:(?:2(?:\.[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw])|[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw]))|Druh[ay\xE1\xFD][\s\xa0]*Samuelov|II(?:\.[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw])|[\s\xa0]*Samuel(?:in[\s\xa0]*kirj|o[vw])))a)|(?:2\.?[\s\xa0]*S\xE1muel)|(?:2(?:[\s\xa0]*(?:Саму[иії]л|ਸਮੂਏਲ|[ei]\.?[\s\xa0]*Samuelit)|사무|[\s\xa0]*ซ(?:ามูเอล|มอ)|[\s\xa0]*शमुवेल|[\s\xa0]*शामुएल|[\s\xa0]*शमूएलको|[\s\xa0]*ଶାମୁୟେଲଙ|[\s\xa0]*samūelko|[\s\xa0]*samuelko|[\s\xa0]*šam[uū]elko|(?:[\s\xa0]*Regnoru|Sa)m|[\s\xa0]*S(?:amuel(?:i[st]|[el]|sbog)|\xE1?m)|[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*царете|\.[\s\xa0]*(?:श(?:मूएलको|ामुएल)|ซ(?:ามูเอล|มอ)|Цар(?:ства|е)|ଶାମୁୟେଲଙ|[sš]am[uū]elko|Самуила|Regnorum|S(?:amuel(?:i[st]|[el]|sbog)|\xE1?m)|Книга[\s\xa0]*на[\s\xa0]*царете)|[\s\xa0]*صموئيل|\.?۔سموایل|(?:\.[\s\xa0\-?]*|[\s\xa0]*)سموئیل|[\s\xa0]*Царств|(?:\.?[\s\xa0]*Книга|[ея]\.?)[\s\xa0]*Царств|[ея]\.?[\s\xa0]*Книга[\s\xa0]*Царств|(?:[ея]\.?[\s\xa0]*Самуил|\.?[\s\xa0]*краљевим)а|\.[\s\xa0]*Саму[иії]лова|\.?[\s\xa0]*книга[\s\xa0]*Самоилова|\.?[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|\-?(?:е(?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)Царств|я\.?[\s\xa0]*Царств|سموئیل|я\.?[\s\xa0]*Книга[\s\xa0]*Царств|(?:е\.?[\s\xa0]*Самуи|я\.?[\s\xa0]*Самуи)ла|е(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії])лова|е\.?[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|а(?:\.[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло)|[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло))ва|ге(?:\.[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло)|[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло))ва))|サムエル(?:記[Ⅱ下]|下|後書|[\s\xa0]*2)|列王記第二巻|Ⅱサムエル|삼하|사무엘(?:기(?:[\s\xa0]*하권|하)|[\s\xa0]*?하)|《撒(?:母耳[記记]|慕爾紀)?下》|שמואל[\s\xa0]*ב['’]|Β['ʹʹ΄’][\s\xa0]*Σαμου[ήη]λ|صموئيل[\s\xa0]*الثّاني|الممالك[\s\xa0]*الثاني|سفر[\s\xa0]*صموئيل[\s\xa0]*الثاني|ਸਮੂਏਲ[\s\xa0]*ਦੀ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੋਥੀ|Βασιλει[ωώ]ν[\s\xa0]*Β['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Σαμου[ήη]λ[\s\xa0]*Β['ʹʹ΄’]|samūel[\s\xa0]*dī[\s\xa0]*dūjī[\s\xa0]*potʰī|II(?:\.[\s\xa0]*S(?:amuel(?:[els]|is)|m)|[\s\xa0]*S(?:amuel[eils]|m))|शम(?:ुऐयल[\s\xa0]*की[\s\xa0]*[2२]री|ूएलको[\s\xa0]*दोस्रो)[\s\xa0]*पुस्तक|Втор(?:а[\s\xa0]*(?:книга[\s\xa0]*на[\s\xa0]*)?|о[\s\xa0]*)Самуил|दुसरे[\s\xa0]*शमुवेल|(?:Втор[ао]|II\.?)[\s\xa0]*Цар(?:ства|е)|ଦ୍ୱିତୀୟ[\s\xa0]*ଶାମୁୟେଲଙ|II(?:\.?[\s\xa0]*Regnoru|\.?[\s\xa0]*S\xE1)m|(?:Втор[ао][\s\xa0]*К|II\.?[\s\xa0]*К)нига[\s\xa0]*на[\s\xa0]*царете|(?:دوم|۲)۔سموایل|(?:دوم[\s\xa0\-?]*|۲[\s\xa0\-?]*)سموئیل|(?:Друга[\s\xa0]*к|II\.?[\s\xa0]*к)раљевима|(?:(?:II(?:\.[\s\xa0]*Саму[иії]|[\s\xa0]*Саму[иії])|Друга[\s\xa0]*Саму[ії])ло|Втора[\s\xa0]*книга[\s\xa0]*Царст)ва|(?:Втор[ао][\s\xa0]*книга[\s\xa0]*Само|Друга[\s\xa0]*Саму|II\.?[\s\xa0]*книга[\s\xa0]*Само)илова|II\.?[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|Друга[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|Друге[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло)ва|(?:II\.?|2\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuela|Drug(?:a[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuela|knjiga[\s\xa0]*o[\s\xa0]*Samuelu)|i[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuela)|(?:II\.?[\s\xa0]*R|2\.?[\s\xa0]*R)egilor|Cartea[\s\xa0]*(?:a[\s\xa0]*doua|II)[\s\xa0]*a[\s\xa0]*Regilor|(?:2(?:\.[\s\xa0]*Sa(?:muelsboke|\-?mu\-?\xEA)|[\s\xa0]*Sa(?:muelsboke|\-?mu\-?\xEA))|II\.?[\s\xa0]*Sa\-?mu\-?\xEA)n|2\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|And(?:en[\s\xa0]*(?:Kongerigernes[\s\xa0]*B|Samuelsb)og|ra[\s\xa0]*Samuelsboken)|ଶାମୁୟେଲଙ୍କ[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପୁସ୍ତକ|(?:Pili[\s\xa0]*Sam[uw]|II\.?[\s\xa0]*Samw|2\.?[\s\xa0]*Samw)eli|Kitabu[\s\xa0]*cha[\s\xa0]*Pili[\s\xa0]*cha[\s\xa0]*Samueli|2[\s\xa0]*(?:சாமுவேல|அரசுகள)்|சாமுவேலின்[\s\xa0]*இரண்டாம்[\s\xa0]*புத்தகம்|(?:2(?:e(?:\.[\s\xa0]*Samu[e\xEB]|[\s\xa0]*Samu[e\xEB])|[\s\xa0]*(?:C[aā]muv[eē]|samūʾī)|[\s\xa0]*Samu[ai\xEB\xEF]|\.[\s\xa0]*Samu[ai\xEB\xEF]|\-?(?:а(?:\.[\s\xa0]*Samu[i\xEF]|[\s\xa0]*Samu[i\xEF])|е\.?[\s\xa0]*Samu[i\xEF]|ге(?:\.[\s\xa0]*Samu[i\xEF]|[\s\xa0]*Samu[i\xEF])))|II(?:\.[\s\xa0]*Samu[ai\xEB\xEF]|[\s\xa0]*Samu[ai\xEB\xEF])|Tweede[\s\xa0]*Samu[e\xEB]|Друга[\s\xa0]*Samu[i\xEF]|Друге[\s\xa0]*Samu[i\xEF]|(?:II\.?|2\.?)[\s\xa0]*Samy[e\xE8]|Dezy[e\xE8]m[\s\xa0]*Samy[e\xE8])l|(?:2(?:[\s\xa0]*(?:S(?:amuu['’]e|hamooa)|[sŝ]amuw)|\.[\s\xa0]*S(?:amuu['’]e|hamooa))|II\.?[\s\xa0]*Samuu['’]e|M[a\xE1]sodik[\s\xa0]*S[a\xE1]mu|Druh[ay\xE1\xFD][\s\xa0]*Samu)el|(?:2(?:\xBA|de|\xE8me|eme|d|\.[o\xBA])\.|Ikalawang|Zweite|Deuxi[e\xE8]mes|2(?:\xBA|de|\xE8me|eme|d|\.[o\xBA])|Deuxi[e\xE8]me|Cartea[\s\xa0]*II[\s\xa0]*a[\s\xa0]*lui)[\s\xa0]*Samuel|2[ao][\s\xa0]*Samuel|2[ao]\.[\s\xa0]*Samuel|2\xB0[\s\xa0]*Samuele|2\xB0\.[\s\xa0]*Samuele|(?:(?:II\.?[\s\xa0]*R|2\.?[\s\xa0]*R)eino|Liber[\s\xa0]*II[\s\xa0]*Samueli|2[ao][\s\xa0]*Reino|2[ao]\.[\s\xa0]*Reino)s|(?:II\.?|2\.?)[\s\xa0]*Kingdoms|2nd\.?[\s\xa0]*(?:S(?:amu[ae]l[ls]|ma)|Kingdoms)|Andre[\s\xa0]*Samuelsbok|2(?:[\s\xa0]*(?:Ц(?:ар)?|صم|Сам|சாமு|samūel)|e\.?[\s\xa0]*Sam|[\s\xa0]*शमू(?:एल)?|[\s\xa0]*ଶାମୁୟେଲ|[\s\xa0]*S(?:am(?:uel(?:s(?:bok)?|i)?)?)?|\.[\s\xa0]*(?:Цар(?:ств)?|शमू(?:एल)?|ଶାମୁୟେଲ|Самуил|S(?:am(?:uel(?:s(?:bok)?|i)?)?)?)|\.[\s\xa0]*Саму[ії]л|\-?(?:а(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії])|е(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії])|ге(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії]))л)|II(?:\.[\s\xa0]*S(?:am(?:ueli?)?)?|[\s\xa0]*S(?:am(?:uel)?)?)|Β['ʹʹ΄’][\s\xa0]*Σαμ|Pili[\s\xa0]*Sam|Tweede[\s\xa0]*Sam|(?:Втор[ао]|II\.?)[\s\xa0]*Цар(?:ств)?|ଦ୍ୱିତୀୟ[\s\xa0]*ଶାମୁୟେଲ|(?:II(?:\.[\s\xa0]*Саму[иії]|[\s\xa0]*Саму[иії])|Друга[\s\xa0]*Саму[ії])л|Друге[\s\xa0]*Саму[ії]л|M[a\xE1]sodik[\s\xa0]*S[a\xE1]m|Druh(?:[a\xE1][\s\xa0]*S(?:am)?|[y\xFD][\s\xa0]*S(?:am)?)|And(?:en[\s\xa0]*Sam(?:uel)?|re[\s\xa0]*Sam(?:uel)?)|2nd\.?[\s\xa0]*S(?:a(?:m(?:u[ae]l)?)?|m)|(?:D(?:ru(?:g(?:a[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuelow|Samuelo(?:va[\s\xa0]*knjig|w))|i[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Samuelow)|h(?:[y\xFD][\s\xa0]*kniha|[y\xFD][\s\xa0]*list|[a\xE1][\s\xa0]*kniha)[\s\xa0]*Samuelov)|ezy[e\xE8]m[\s\xa0]*liv[\s\xa0]*Samy[e\xE8]l[\s\xa0]*l)|Toinen[\s\xa0]*Samuelin[\s\xa0]*kirj|2[\s\xa0]*k[\s\xa0]*Samuelov|2[\s\xa0]*k\.[\s\xa0]*Samuelov|2[\s\xa0]*kniha[\s\xa0]*Samuelov|(?:II\.?|2\.)[\s\xa0]*kniha[\s\xa0]*Samuelov|(?:II\.?|2\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuelow)a|S(?:e(?:cond(?:[\s\xa0]*(?:S(?:amu[ae]l[ls]|ma)|Kingdoms)|[ao][\s\xa0]*Samuele)|gund(?:[ao][\s\xa0]*Reinos|[ao][\s\xa0]*Samuel))|[i\xED]\xF0ari[\s\xa0]*Sam[u\xFA]elsb[o\xF3]k|\xE1muel[\s\xa0]*II|econd[\s\xa0]*S(?:a(?:m(?:u[ae]l)?)?|m)|am(?:u(?:u['’]eel[\s\xa0]*Labaad|el(?:is?)?[\s\xa0]*II)|eela[\s\xa0]*Maxaafaa[\s\xa0]*Naa77anttuwaa)))|(?:(?:2\.?|II\.)[\s\xa0]*Samuelin)|(?:《撒(?:母耳[記记]|慕爾紀)?下|撒(?:母耳[記记]|慕爾紀)?下》|שמואל[\s\xa0]*ב|II[\s\xa0]*Samueli[ns]|صموئيل[\s\xa0]*الثاني|(?:2\.?|II\.)[\s\xa0]*Sa|Druga[\s\xa0]*Samuelova|II[\s\xa0]*Sa|Toinen[\s\xa0]*Samuelin)|(?:撒(?:母耳[記记]|慕爾紀)?下))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:[\s\xa0]*(?:Саму(?:ил(?:ов)?|[ії]лов)а|S\xE1muel|Царе|Царства)|\.[\s\xa0]*S\xE1muel|\.?[\s\xa0]*Sma|\.?[\s\xa0]*Samual[ls]|st(?:\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|[\s\xa0]*S(?:amu[ae]l[ls]|ma)))|I(?:\.?[\s\xa0]*S\xE1muel|\.?[\s\xa0]*Sma|\.?[\s\xa0]*Samual[ls]))|(?:[1I]\.?[\s\xa0]*Samweli)|(?:1(?:[\s\xa0]*(?:Саму[иії]л|ਸਮੂਏਲ|[ei]\.?[\s\xa0]*Samuelit)|st\.?[\s\xa0]*Sm|사무|[\s\xa0]*ซ(?:ามูเอล|มอ)|[\s\xa0]*शमुवेल|[\s\xa0]*शामुएल|[\s\xa0]*शमूएलको|[\s\xa0]*ଶାମୁୟେଲଙ|[\s\xa0]*samūelko|[\s\xa0]*samuelko|[\s\xa0]*šam[uū]elko|(?:[\s\xa0]*Regnoru|Sa)m|[\s\xa0]*S(?:amuel(?:[el]|sbog|i[st])|\xE1?m)|[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*царете|\.[\s\xa0]*(?:श(?:मूएलको|ामुएल)|ซ(?:ามูเอล|มอ)|Цар(?:ства|е)|ଶାମୁୟେଲଙ|[sš]am[uū]elko|Самуила|Regnorum|S(?:amuel(?:[el]|sbog|i[st])|\xE1?m)|Книга[\s\xa0]*на[\s\xa0]*царете)|(?:[\s\xa0]*(?:سموئ[يی]|صموئي)|\.[\s\xa0]*سموئ[يی])ل|\.?۔سموایل|\.\-?سموئیل|[\s\xa0]*Царств|(?:\.?[\s\xa0]*Книга|[ея]\.?)[\s\xa0]*Царств|[ея]\.?[\s\xa0]*Книга[\s\xa0]*Царств|(?:[ея]\.?[\s\xa0]*Самуил|\.?[\s\xa0]*краљевим)а|\.[\s\xa0]*Саму[иії]лова|\.?[\s\xa0]*книга[\s\xa0]*Самоилова|\.?[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|\-?(?:е(?:\.[\s\xa0]*(?:Книга[\s\xa0]*)?|[\s\xa0]*(?:Книга[\s\xa0]*)?)Царств|я\.?[\s\xa0]*Царств|سموئیل|я\.?[\s\xa0]*Книга[\s\xa0]*Царств|(?:е\.?[\s\xa0]*Самуи|я\.?[\s\xa0]*Самуи)ла|е(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії])лова|е\.?[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|а(?:\.[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло)|[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло))ва|ше(?:\.[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло)|[\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло))ва))|サムエル(?:記[Ⅰ上]|上|前書|[\s\xa0]*1)|列王記第一巻|Ⅰサムエル|삼상|사무엘(?:기(?:[\s\xa0]*상권|상)|[\s\xa0]*?상)|《撒(?:母耳[記记]|慕爾紀)?上》|שמואל[\s\xa0]*א['’]|Α['ʹʹ΄’][\s\xa0]*Σαμου[ήη]λ|ﺻﻤﻮﺋﻴﻞ[\s\xa0]*ﺍﻷﻭﻝ|Βασιλει[ωώ]ν[\s\xa0]*Α['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Σαμου[ήη]λ[\s\xa0]*Α['ʹʹ΄’]|ਸਮੂਏਲ[\s\xa0]*ਦੀ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੋਥੀ|I(?:\.[\s\xa0]*S(?:amuel(?:[els]|is)|m)|[\s\xa0]*S(?:amuel[els]|m))|शम(?:ुऐल[\s\xa0]*की[\s\xa0]*[1१]ली|ूएलको[\s\xa0]*पहिलो)[\s\xa0]*पुस्तक|П(?:ърв(?:а[\s\xa0]*(?:книга[\s\xa0]*на[\s\xa0]*)?|о[\s\xa0]*)|рво[\s\xa0]*)Самуил|पहिले[\s\xa0]*शमुवेल|(?:Първ[ао]|I\.?)[\s\xa0]*Цар(?:ства|е)|ପ୍ରଥମ[\s\xa0]*ଶାମୁୟେଲଙ|I(?:\.?[\s\xa0]*Regnoru|\.?[\s\xa0]*S\xE1)m|(?:Първ[ао][\s\xa0]*К|I\.?[\s\xa0]*К)нига[\s\xa0]*на[\s\xa0]*царете|(?:(?:سفر[\s\xa0]*صموئيل|الممالك)[\s\xa0]*الأو|(?:اوّل|۱)[\s\xa0]*سموئ[يی])ل|(?:اوّل|۱)۔سموایل|(?:اوّل|۱)\-?سموئیل|(?:Прва[\s\xa0]*к|I\.?[\s\xa0]*к)раљевима|(?:(?:I(?:\.[\s\xa0]*Саму[иії]|[\s\xa0]*Саму[иії])|Прва[\s\xa0]*Самуи)ло|Първа[\s\xa0]*книга[\s\xa0]*Царст)ва|(?:Прв[ао][\s\xa0]*книга[\s\xa0]*Само|I\.?[\s\xa0]*книга[\s\xa0]*Само)илова|I\.?[\s\xa0]*книга[\s\xa0]*Саму[ії]лова|Перш[ае][\s\xa0]*(?:книга[\s\xa0]*Саму[ії]ло|Саму[ії]ло)ва|samūel[\s\xa0]*dī[\s\xa0]*pahilī[\s\xa0]*potʰī|(?:1\.?[\s\xa0]*R|I\.?[\s\xa0]*R)egilor|Cartea[\s\xa0]*(?:[i\xEE]nt[a\xE2]i|I)[\s\xa0]*a[\s\xa0]*Regilor|ଶାମୁୟେଲଙ୍କ[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପୁସ୍ତକ|(?:šam[uū]|sam[uū])elko[\s\xa0]*pustak|(?:1(?:\.[\s\xa0]*Sa(?:muelsboke|\-?mu\-?\xEA)|[\s\xa0]*Sa(?:muelsboke|\-?mu\-?\xEA))|I\.?[\s\xa0]*Sa\-?mu\-?\xEA)n|1\.?[\s\xa0]*Kongerigernes[\s\xa0]*Bog|F(?:irst[\s\xa0]*S(?:amu[ae]l[ls]|ma)|yrri[\s\xa0]*Sam[u\xFA]elsb[o\xF3]k|[o\xF6]rsta[\s\xa0]*Samuelsboken|\xF8rste[\s\xa0]*(?:Kongerigernes[\s\xa0]*Bog|Samuelsbo[gk]))|S(?:amu(?:u['’]eel[\s\xa0]*Kowaad|el(?:is?)?[\s\xa0]*I)|\xE1muel[\s\xa0]*I)|1\xB0[\s\xa0]*Samuele|1\xB0\.[\s\xa0]*Samuele|(?:(?:1\.?|I\.?)[\s\xa0]*Kingdom|Liber[\s\xa0]*I[\s\xa0]*Samueli|1st\.?[\s\xa0]*Kingdom|First[\s\xa0]*Kingdom)s|(?:1\.?[\s\xa0]*R|I\.?[\s\xa0]*R)einos|1[ao][\s\xa0]*Reinos|1[ao]\.[\s\xa0]*Reinos|(?:1\.?|I\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuela|P(?:r(?:im(?:eir[ao][\s\xa0]*Reinos|[ao][\s\xa0]*Samuele)|va[\s\xa0]*knjiga[\s\xa0]*o[\s\xa0]*Samuelu)|ierwsz[aey][\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuela)|(?:1(?:st(?:\.[\s\xa0]*Samu[ae]|[\s\xa0]*Samu[ae])|[\s\xa0]*(?:C[aā]muv[eē]|samūʾī)|[\s\xa0]*Samu[ai\xEB\xEF]|\.[\s\xa0]*Samu[ai\xEB\xEF]|\-?(?:а(?:\.[\s\xa0]*Samu[i\xEF]|[\s\xa0]*Samu[i\xEF])|е\.?[\s\xa0]*Samu[i\xEF]|ше(?:\.[\s\xa0]*Samu[i\xEF]|[\s\xa0]*Samu[i\xEF])))|I(?:\.[\s\xa0]*Samu[ai\xEB\xEF]|[\s\xa0]*Samu[ai\xEB\xEF])|Перш[ае][\s\xa0]*Samu[i\xEF]|(?:1\.?|I\.?)[\s\xa0]*Samy[e\xE8]|Premye[\s\xa0]*Samy[e\xE8]|(?:1(?:[\s\xa0]*(?:S(?:amuu['’]e|hamooa)|[sŝ]amuw)|\.[\s\xa0]*S(?:amuu['’]e|hamooa))|I\.?[\s\xa0]*Samuu['’]e)e|(?:1(?:[ao]\.[\s\xa0]*|[ao][\s\xa0]*)|Primeir[ao][\s\xa0]*)Samue|(?:1(?:\xBA|re|\xE8re|ere|er|\.[o\xBA])|Una|Pr(?:emi(?:\xE8re|ere?)|imer))[\s\xa0]*Samue|(?:1(?:\xBA|re|\xE8re|ere|er|\.[o\xBA])\.|Unang|Cartea[\s\xa0]*I[\s\xa0]*a[\s\xa0]*lui|Pr(?:emi(?:\xE8re|ere?)s|imero))[\s\xa0]*Samue)l|1e[\s\xa0]*Samu[e\xEB]l|1e\.[\s\xa0]*Samu[e\xEB]l|(?:P(?:r(?:v(?:(?:[y\xE1\xFD][\s\xa0]*Samuelo|n[i\xED][\s\xa0]*Samuelo|[y\xFD][\s\xa0]*list[\s\xa0]*Samuelo|(?:n[i\xED]|\xE1)[\s\xa0]*kniha[\s\xa0]*Samuelo)v|a[\s\xa0]*(?:Samuelova[\s\xa0]*knjig|kniha[\s\xa0]*Samuelov))|emye[\s\xa0]*liv[\s\xa0]*Samy[e\xE8]l[\s\xa0]*l)|ierwsz[aey][\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*)?Samuelow)|1(?:\.[\s\xa0]*Samuelo[vw]|[\s\xa0]*Samuelo[vw])|I\.?[\s\xa0]*Samuelo[vw]|Sameela[\s\xa0]*Maxaafaa[\s\xa0]*Koiruwa|1[\s\xa0]*k[\s\xa0]*Samuelov|1[\s\xa0]*k\.[\s\xa0]*Samuelov|(?:I\.?|1\.|1)[\s\xa0]*kniha[\s\xa0]*Samuelov|(?:1\.?|I\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Samuelow)a|(?:1\.?|I\.?)[\s\xa0]*Samuelin[\s\xa0]*kirja|E(?:(?:(?:ls[oő][\s\xa0]*S[a\xE1]mu|rste[\s\xa0]*Samu)e|erste[\s\xa0]*Samu[e\xEB])l|nsimm[a\xE4]inen[\s\xa0]*Samuelin[\s\xa0]*kirja)|1[\s\xa0]*(?:சாமுவேல|அரசுகள)்|சாமுவேலின்[\s\xa0]*முதலாம்[\s\xa0]*புத்தகம்|1(?:[\s\xa0]*(?:Ц(?:ар)?|صم|Сам|சாமு|samūel)|st(?:\.[\s\xa0]*Sam?|[\s\xa0]*Sam?)|[\s\xa0]*शमू(?:एल)?|[\s\xa0]*ଶାମୁୟେଲ|[\s\xa0]*S(?:am(?:uel(?:s(?:bok)?|i)?)?)?|\.[\s\xa0]*(?:Цар(?:ств)?|शमू(?:एल)?|ଶାମୁୟେଲ|Самуил|S(?:am(?:uel(?:s(?:bok)?|i)?)?)?)|\.[\s\xa0]*Саму[ії]л|\-?(?:а(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії])|е(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії])|ше(?:\.[\s\xa0]*Саму[ії]|[\s\xa0]*Саму[ії]))л)|I(?:\.[\s\xa0]*S(?:am(?:ueli?)?)?|[\s\xa0]*S(?:am(?:ueli?)?)?)|Α['ʹʹ΄’][\s\xa0]*Σαμ|(?:Първ[ао]|I\.?)[\s\xa0]*Цар(?:ств)?|ପ୍ରଥମ[\s\xa0]*ଶାମୁୟେଲ|(?:I(?:\.[\s\xa0]*Саму[иії]|[\s\xa0]*Саму[иії])|Прва[\s\xa0]*Самуи)л|Перш[ае][\s\xa0]*Саму[ії]л|F(?:irst[\s\xa0]*S(?:a(?:m(?:u[ae]l)?)?|m)|\xF8rste[\s\xa0]*Sam(?:uels?)?)|Prvn[i\xED][\s\xa0]*S(?:am(?:uel)?)?|1e[\s\xa0]*Sam|1e\.[\s\xa0]*Sam|E(?:ls[oő][\s\xa0]*S[a\xE1]|erste[\s\xa0]*Sa)m|K(?:itabu[\s\xa0]*cha[\s\xa0]*Kwanza[\s\xa0]*cha[\s\xa0]*Samueli|wanza[\s\xa0]*Sam(?:[uw]eli)?))|(?:(?:1\.?|I\.)[\s\xa0]*Samuelin)|(?:《撒(?:母耳[記记]|慕爾紀)?上|撒(?:母耳[記记]|慕爾紀)?上》|שמואל[\s\xa0]*א|Samu[ae]l[ls]|I[\s\xa0]*Samueli[ns]|صموئيل[\s\xa0]*الأول|(?:1\.?|I\.)[\s\xa0]*Sa|Prva[\s\xa0]*Samuelova|Samu[ae]l|I[\s\xa0]*Sa|Ensimm[a\xE4]inen[\s\xa0]*Samuelin)|(?:撒(?:母耳[記记]|慕爾紀)?上))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2[\s\xa0]*(?:C(?:ron(?:icilor|ache)|hr(?:onik|n))|Хроніка|хроніки|Паралипоменону)|II\.?[\s\xa0]*Cronicilor|(?:2[\s\xa0]*C(?:hronical|ronica)|II\.?[\s\xa0]*Cronica)s|(?:2[\s\xa0]*C(?:hroni(?:cl|qu)|ronicl)|II\.?[\s\xa0]*Cronicl)es|(?:2(?:[\s\xa0]*Ch?|\.[\s\xa0]*Ch)|II\.?[\s\xa0]*C)ronocles|(?:II\.?[\s\xa0]*Ch|2[\s\xa0]*Cho)ron[io]cles|2nd[\s\xa0]*C(?:hron[io]|ron[io])cles|2nd\.[\s\xa0]*C(?:hron[io]|ron[io])cles|Second[\s\xa0]*C(?:hron[io]|ron[io])cles)|(?:2[\s\xa0]*хроника)|(?:II\.?[\s\xa0]*Cronicle|2[\s\xa0]*Хрон[иі]к)|(?:(?:2(?:\.[\s\xa0]*(?:Kr\xF3|Cro)|[\s\xa0]*(?:Kr\xF3|Cro))|II\.?[\s\xa0]*Kr\xF3)nika|2[\s\xa0]*(?:(?:Ljetopis|Istw|Aikakirj)a|хрон)|M[a\xE1]sodik[\s\xa0]*Kr[o\xF3]nika)|(?:2(?:[\s\xa0]*(?:ਇਤਹਾਸ|Хр|tavārīḫ|HanO|Ist|Ljet|N[aā][lḷ][aā]kamam|குறிப்பேடு|Cronic(?:[ai]|le)|Krn)|nd\.?[\s\xa0]*Chrn|역대|[\s\xa0]*Babad|[\s\xa0]*พ(?:งศาวดาร|ศด)|[\s\xa0]*ବଂଶାବଳୀର|[\s\xa0]*इतिहासको|[\s\xa0]*Дневника|[\s\xa0]*Летопис[иь]|[\s\xa0]*itihāsko|[\s\xa0]*itihasko|[\s\xa0]*Lịch[\s\xa0]*sử|Chr|(?:nd(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)|[\s\xa0]*C)oron[io]cles|[\s\xa0]*[\s\xa0]*Sử[\s\xa0]*K\xFD|[\s\xa0]*Sử[\s\xa0]*k\xFD|[\s\xa0]*Paralipomen(?:on|a)|[\s\xa0]*Kr\xF8nikebo[gk]|(?:(?:[\s\xa0]*C(?:h(?:oron[io]|ron[io])|rono)|nd(?:\.?[\s\xa0]*Cron[io]|\.?[\s\xa0]*Chrono))cl|\xB0\.?[\s\xa0]*Cronach|nd\.?[\s\xa0]*Chronicl)e|[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronikave|[\s\xa0]*Kroni(?:k(?:ave|el)|ca)|[\s\xa0]*Taariikhdii|[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|\.[\s\xa0]*(?:C(?:ron(?:ic(?:(?:le|a)s|ilor)|ocles)|oron[io]cles|h(?:r(?:onicles|onik|n)|oron[io]cles))|พ(?:งศาวดาร|ศด)|Babad|ବଂଶାବଳୀର|इतिहासको|хроника|дневника|Летопис[иь]|itih[aā]sko|Lịch[\s\xa0]*sử|[\s\xa0]*Sử[\s\xa0]*K\xFD|Sử[\s\xa0]*k\xFD|Paralipomen(?:on|a)|C(?:hronocl|ronach)e|Kr(?:oni(?:k(?:ave|el)|ca)|\xF8nikebo[gk])|Паралипоменону|Taariikhdii|Mambo[\s\xa0]*ya[\s\xa0]*Nyakati)|[\s\xa0]*أخ|(?:\.(?:[\s\xa0]*تو[\s\xa0]*|۔تو)|[\s\xa0]*تو[\s\xa0]*|۔تو)اریخ|\.\-?[\s\xa0]*توارِیخ|[ея]\.?[\s\xa0]*Хроник|\.[\s\xa0]*Хрон(?:іка|ик)|[\s\xa0]*Hroniky|(?:\.[\s\xa0]*[HȞ]|[\s\xa0]*Ȟ)roniky|\.?[\s\xa0]*Літопису|[ея]\.?[\s\xa0]*Летопись|\.?[\s\xa0]*книга[\s\xa0]*хроніки|\-?(?:(?:ге(?:\.[\s\xa0]*[HȞ]|[\s\xa0]*[HȞ])|а(?:\.[\s\xa0]*[HȞ]|[\s\xa0]*[HȞ]))roniky|(?:ге\.?|а\.?)[\s\xa0]*Хроніка|я\.?[\s\xa0]*Хроник|[\s\xa0]*توارِیخ|(?:ге\.?|а\.?)[\s\xa0]*Літопису|я\.?[\s\xa0]*Летопись|(?:ге\.?|а\.?)[\s\xa0]*книга[\s\xa0]*хроніки|е(?:\.[\s\xa0]*(?:Хрон(?:іка|ик)|[HȞ]roniky|Л(?:етопись|ітопису)|книга[\s\xa0]*хроніки)|[\s\xa0]*(?:Хрон(?:іка|ик)|[HȞ]roniky|Л(?:етопись|ітопису)|книга[\s\xa0]*хроніки))))|歴(?:代(?:誌[Ⅱ下]|史下|志略?下)|下)|Ⅱ歴代|대하|역대(?:기[\s\xa0]*하권|지?하)|《(?:編年紀|代|歷|歷代志|历代志)下》|歴代誌[\s\xa0]*2|الأخبار[\s\xa0]*2|Β['ʹʹ΄’][\s\xa0]*(?:Χρονικ[ωώ]ν|Παρ)|दुसरे[\s\xa0]*इतिहास|דברי[\s\xa0]*הימים[\s\xa0]*ב['’]|ﺃﺧﺒﺎﺭ[\s\xa0]*ﺍﻷﻳﺎﻡ[\s\xa0]*ﺍﻟﺜﺎﻥ|ਇਤਹਾਸ[\s\xa0]*ਦੀ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੋਥੀ|Anden[\s\xa0]*Kr\xF8nikebog|Παραλειπομ[έε]νων[\s\xa0]*Β['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Χρονικ[ωώ]ν[\s\xa0]*Β['ʹʹ΄’]|itahās[\s\xa0]*dī[\s\xa0]*dūjī[\s\xa0]*potʰī|(?:Kr[o\xF3]nik[a\xE1]k|Mambo[\s\xa0]*ya[\s\xa0]*Nyakati)[\s\xa0]*II|Paralipomenon[\s\xa0]*II|इतिहास(?:को[\s\xa0]*दोस्रो[\s\xa0]*पुस्तक|[\s\xa0]*[2२]रा[\s\xa0]*भाग)|ବଂଶାବଳୀର[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପୁସ୍ତକ|سفر[\s\xa0]*أخبار[\s\xa0]*الأيام[\s\xa0]*الثاني|I(?:I(?:[\s\xa0]*(?:C(?:ronic[ail]|hrn)|Paralipomen[ao]|Kronik(?:el|a))|\.[\s\xa0]*(?:C(?:ronic[ail]|hrn)|Kronik(?:el|a)))|kalawang[\s\xa0]*Kronik(?:el|a))|Second[\s\xa0]*Chrn|Taariikhdii[\s\xa0]*Labaad|II\.?[\s\xa0]*Babad|ଦ୍ୱିତୀୟ[\s\xa0]*ବଂଶାବଳୀର|(?:Друга|II\.?)[\s\xa0]*хроника|(?:Друга|II\.?)[\s\xa0]*дневника|Ikalawang[\s\xa0]*Paralipomeno|II\.?[\s\xa0]*Lịch[\s\xa0]*sử|(?:II(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)|Second[\s\xa0]*Ch?)oron[io]cles|II\.?[\s\xa0]*[\s\xa0]*Sử[\s\xa0]*K\xFD|II\.?[\s\xa0]*Sử[\s\xa0]*k\xFD|II\.[\s\xa0]*Paralipomen(?:on|a)|(?:(?:I(?:I(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)rono|kalawang[\s\xa0]*Chroni)|Second[\s\xa0]*Chrono|Second[\s\xa0]*Cron[io])cl|(?:Second[\s\xa0]*Chronic|II\.?[\s\xa0]*Chronic)l|(?:Second[ao]|II\.?)[\s\xa0]*Cronach)e|II\.?[\s\xa0]*Taariikhdii|(?:II\.?|Pili)[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|(?:(?:دوم|۲)[\s\xa0]*تو[\s\xa0]*|(?:دوم|۲)۔تو)اریخ|(?:دوم|۲)\-?[\s\xa0]*توارِیخ|(?:Друга|II\.?|Друге)[\s\xa0]*Хроніка|(?:II(?:\.[\s\xa0]*[HȞ]|[\s\xa0]*[HȞ])|Друга[\s\xa0]*[HȞ]|Друге[\s\xa0]*[HȞ])roniky|(?:Друга|II\.?)[\s\xa0]*Паралипоменону|(?:Друга|II\.?|Друге)[\s\xa0]*Літопису|II\.?[\s\xa0]*книга[\s\xa0]*хроніки|Друг[ае][\s\xa0]*книга[\s\xa0]*хроніки|(?:2(?:\-?(?:ге\.?|а\.?|е\.?)|\.)|Друга|II\.?|Друге)[\s\xa0]*хроніки|II\.?[\s\xa0]*Летописи|(?:II\.?[\s\xa0]*к|2\.?[\s\xa0]*к)нига[\s\xa0]*летописи|2\.?[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*летописите|II\.?[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*летописите|Втор[ао][\s\xa0]*(?:Летописи|Парал|книга[\s\xa0]*летописи|Книга[\s\xa0]*на[\s\xa0]*летописите)|(?:2(?:(?:o(?:\.[\s\xa0]*Cr[o\xF3\xF4]|[\s\xa0]*Cr[o\xF3\xF4])|a(?:\.[\s\xa0]*Cr[o\xF4]|[\s\xa0]*Cr[o\xF4])|\xBA(?:\.[\s\xa0]*Cr[o\xF3]|[\s\xa0]*Cr[o\xF3]))nica|[\s\xa0]*(?:Cr[\xF3\xF4]nica|Itiha|itahā)|nd\.?[\s\xa0]*Chronical|\.(?:[\s\xa0]*(?:C(?:r[\xF3\xF4]nica|hronical)|Itiha)|[o\xBA](?:\.[\s\xa0]*Cr[o\xF3]|[\s\xa0]*Cr[o\xF3])nica))|(?:II(?:\.[\s\xa0]*Cr[\xF3\xF4]|[\s\xa0]*Cr[\xF3\xF4])|Segundo[\s\xa0]*Cr[o\xF3\xF4]|Segunda[\s\xa0]*Cr[o\xF4])nica|(?:Second[\s\xa0]*Chronic|II\.?[\s\xa0]*Chronic)al)s|(?:II\.?|2\.)[\s\xa0]*Chroniques|2e\.?[\s\xa0]*Chroniques|2(?:\xE8me|de?|eme)[\s\xa0]*Chroniques|2(?:\xE8me|de?|eme)\.[\s\xa0]*Chroniques|(?:II\.?[\s\xa0]*L|2\.?[\s\xa0]*L)etopis[uů]|(?:S[i\xED]\xF0ari[\s\xa0]*Kron[i\xED]kub[o\xF3]|Andre[\s\xa0]*Kr\xF8nikebo|II\.?[\s\xa0]*Kron\xED|2(?:[\s\xa0]*(?:Kron\xED|Aika)|\.[\s\xa0]*Kron\xED)|(?:II\.?|2\.?)[\s\xa0]*Kwoni|(?:(?:II\.?|2\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*K|Zweite[\s\xa0]*Ch)roni|2[\s\xa0]*kniha[\s\xa0]*kroni|(?:II\.?|2\.)[\s\xa0]*kniha[\s\xa0]*kroni)k|2\.?[\s\xa0]*Kronick[a\xE1]|II\.?[\s\xa0]*Kronick[a\xE1]|(?:2(?:[\s\xa0]*(?:Sử[\s\xa0]*bi\xEAn[\s\xa0]*ni\xEA|Kr\xF3)|e\.?[\s\xa0]*Kronieke|[\s\xa0]*Kr\xF6nikeboke|[\s\xa0]*Kroni(?:kebo|e)ke|\.[\s\xa0]*(?:Kr(?:\xF6nikeboke|\xF3|oni(?:kebo|e)ke)|Sử[\s\xa0]*bi\xEAn[\s\xa0]*ni\xEA))|M(?:\xE1sodik[\s\xa0]*Kr[o\xF3]|asodik[\s\xa0]*Kr[o\xF3])|Anden[\s\xa0]*Kro|II\.?[\s\xa0]*Kr\xF3|II\.?[\s\xa0]*Sử[\s\xa0]*bi\xEAn[\s\xa0]*ni\xEA|(?:Tweede|II\.?)[\s\xa0]*Kronieke|Andra[\s\xa0]*Kr[o\xF6]nikeboke)n|(?:Liber[\s\xa0]*II|Second|2nd\.?)[\s\xa0]*Paralipomenon|2[\s\xa0]*k[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|2[\s\xa0]*k\.[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|D(?:ru(?:h(?:[y\xFD][\s\xa0]*kniha[\s\xa0]*kronik|[y\xFD][\s\xa0]*Letopis[uů]|[y\xFD][\s\xa0]*Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|[y\xFD][\s\xa0]*Paralipomenon|[y\xFD][\s\xa0]*list[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)|[a\xE1][\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Letopis[uů]|Paralipomenon|kniha[\s\xa0]*(?:Kron(?:i(?:ck[a\xE1]|k)|\xEDk)|Paralipomenon)))|g(?:(?:a[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|i[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?)[\s\xa0]*Kr|[ai][\s\xa0]*Kr)onik)|e(?:uxi[e\xE8]mes?[\s\xa0]*Chroniques|zy[e\xE8]m[\s\xa0]*Kwonik))|2[\s\xa0]*Паралипоменон|2(?:\.?[\s\xa0]*Книга|[ея]\.?|\-?(?:е\.?|я\.?))[\s\xa0]*Паралипоменон|2(?:\-?(?:е\.?|я\.?)|[ея]\.?)[\s\xa0]*Книга[\s\xa0]*Паралипоменон|или[\s\xa0]*Втора[\s\xa0]*книга[\s\xa0]*Паралипоменон|2[\s\xa0]*நாளாகமம்|நாளாகமத்தின்[\s\xa0]*இரண்டாம்[\s\xa0]*புத்தகம்|2(?:[\s\xa0]*(?:C(?:r(?:o(?:n(?:icl)?)?|[\xF3\xF4]n?)?|h(?:r(?:on?)?)?)|நாளா|Aik|Дн|குறி|itihās|Пар(?:ал)?|Kr\xF6n)|nd(?:\.[\s\xa0]*Chr(?:on?)?|[\s\xa0]*Chr(?:on?)?)|e\.?[\s\xa0]*Kron|nd\.?[\s\xa0]*Cron|[\s\xa0]*ବଂଶାବଳୀ|[\s\xa0]*इति(?:हास)?|[\s\xa0]*Лет|[\s\xa0]*Taar|(?:nd(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)|[\s\xa0]*C)oron[io]cle|[\s\xa0]*Pa(?:r(?:alipomeno)?)?|[\s\xa0]*Kr\xF8n?|[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronika|[\s\xa0]*Kro(?:n(?:ika?)?)?|\.[\s\xa0]*(?:C(?:ron(?:ic(?:le|a)|ic[il]|ocle)?|oron[io]cle|h(?:r(?:onicle|on?)?|oron[io]cle))|इति(?:हास)?|ବଂଶାବଳୀ|Лет|Taar|Pa(?:r(?:alipomeno)?)?|Kr(?:o(?:n(?:ika?)?)?|\xF8n?)|Парал(?:ипоменон)?)|\.[\s\xa0]*Хронік|\.?[\s\xa0]*книга[\s\xa0]*хронік|\-?(?:(?:ге\.?|а\.?)[\s\xa0]*книга[\s\xa0]*х|(?:ге\.?|а\.?)[\s\xa0]*Х|е(?:\.[\s\xa0]*(?:книга[\s\xa0]*х|Х)|[\s\xa0]*(?:книга[\s\xa0]*х|Х)))ронік)|II(?:[\s\xa0]*(?:C(?:hr(?:on?)?|ron)|Par?|Kro(?:n(?:ik)?)?|Парал)|\.[\s\xa0]*(?:C(?:hr(?:on?)?|ron)|Kro(?:n(?:ik)?)?|Парал))|Β['ʹʹ΄’][\s\xa0]*(?:Χρ(?:ον)?|Πα)|역대기[\s\xa0]*하|And(?:re[\s\xa0]*Kr\xF8n?|en[\s\xa0]*Kr\xF8n)|Tweede[\s\xa0]*Kron|Second[\s\xa0]*Chr(?:on?)?|Second[\s\xa0]*Cron|ଦ୍ୱିତୀୟ[\s\xa0]*ବଂଶାବଳୀ|II\.?[\s\xa0]*Taar|(?:II(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)|Second[\s\xa0]*Ch?)oron[io]cle|II\.[\s\xa0]*Pa(?:r(?:alipomeno)?)?|(?:Друга|II\.?|Друге)[\s\xa0]*Хронік|II\.?[\s\xa0]*книга[\s\xa0]*хронік|Друг[ае][\s\xa0]*книга[\s\xa0]*хронік|II\.?[\s\xa0]*Лет|Втор[ао][\s\xa0]*Лет|Druh[ay\xE1\xFD][\s\xa0]*Pa|(?:I(?:I(?:\.[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik)|[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik))|kalawang[\s\xa0]*(?:Mga[\s\xa0]*(?:Cronic|Kronik)|Cronic))|(?:II\.?|Pili)[\s\xa0]*Ny|(?:Toinen|II\.?)[\s\xa0]*Aikakirj|2(?:\.[\s\xa0]*(?:Mga[\s\xa0]*[CK]roni[ck]|Aikakirj|Ny)|[\s\xa0]*(?:Mga[\s\xa0]*[CK]roni[ck]|Ny))|2\.[\s\xa0]*Istw|II\.?[\s\xa0]*Istw|(?:II\.?[\s\xa0]*L|2\.[\s\xa0]*L)jetopis|D(?:ezy[e\xE8]m[\s\xa0]*(?:liv[\s\xa0]*Kwonik[\s\xa0]*l|Istw)|ruga[\s\xa0]*(?:knjiga[\s\xa0]*)?Ljetopis)|Cartea[\s\xa0]*a[\s\xa0]*doua[\s\xa0]*Paralipomen)a|Hanidabaa[\s\xa0]*Odiya[\s\xa0]*Naa77antto[\s\xa0]*Maxaafaa)|(?:(?:編年紀|代|历代志|歷(?:代志)?)下》|《(?:編年紀|代|历代志|歷(?:代志)?)下|2[\s\xa0]*(?:дневника|itihas)|Χρονικ[ωώ]ν[\s\xa0]*Β['ʹʹ΄’]|דברי[\s\xa0]*הימים[\s\xa0]*ב|2\.?[\s\xa0]*Sử|II(?:[\s\xa0]*(?:Paralipomenon|Sử)|\.[\s\xa0]*Sử)|S\xED\xF0ari[\s\xa0]*kron\xEDkub\xF3k|Druh[a\xE1][\s\xa0]*kniha[\s\xa0]*kronik|أخبار[\s\xa0]*الأيام[\s\xa0]*الثاني|(?:編年紀|代|历代志|歷(?:代志)?)下|Втора[\s\xa0]*книга[\s\xa0]*(?:Паралипоменон|на[\s\xa0]*летописите)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:[\s\xa0]*(?:C(?:h(?:r(?:oni(?:cl|qu)es|onicals|onik|n|onocles)|oronocles)|ron(?:icilor|ache|icas|icles|ocles))|Хроніка|хроніки|Паралипоменону)|(?:st(?:\.[\s\xa0]*C(?:hron[io]|ron[io])|[\s\xa0]*C(?:hron[io]|ron[io]))|\.[\s\xa0]*Crono|\.[\s\xa0]*Chrono)cles)|(?:First[\s\xa0]*C(?:hron[io]|ron[io])|I(?:\.?[\s\xa0]*Chron[io]|\.?[\s\xa0]*Crono))cles|I(?:\.?[\s\xa0]*Cronicilor|\.?[\s\xa0]*Cronicas|\.?[\s\xa0]*Cronicles))|(?:1[\s\xa0]*хроника)|(?:I\.?[\s\xa0]*Cronicle)|(?:(?:1(?:\.[\s\xa0]*(?:Kr\xF3|Cro)|[\s\xa0]*(?:Kr\xF3|Cro))|I\.?[\s\xa0]*Kr\xF3)nika|1(?:[\s\xa0]*(?:Ljetopis|Istw|Aikakirj)a|\.[\s\xa0]*хроника)|Els[oő][\s\xa0]*Kr[o\xF3]nika)|(?:歴(?:代(?:誌[Ⅰ上]|史上|志略?上)|上)|Ⅰ歴代|대상|역대(?:기[\s\xa0]*상권|지?상)|《(?:編年紀|代|歷|歷代志|历代志)上》|Α['ʹʹ΄’][\s\xa0]*(?:Χρονικ[ωώ]ν|Παρ)|पहिले[\s\xa0]*इतिहास|歴代誌[\s\xa0]*1|الأخبار[\s\xa0]*1|דברי[\s\xa0]*הימים[\s\xa0]*א['’]|ﺃﺧﺒﺎﺭ[\s\xa0]*ﺍﻷﻳﺎﻡ[\s\xa0]*ﺍﻷ|Una(?:ng)?[\s\xa0]*Kronika|ਇਤਹਾਸ[\s\xa0]*ਦੀ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੋਥੀ|Παραλειπομ[έε]νων[\s\xa0]*Α['ʹʹ΄’]|δυτικ[οό]ς[\s\xa0]*Χρονικ[ωώ]ν[\s\xa0]*Α['ʹʹ΄’]|ବଂଶାବଳୀର[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପୁସ୍ତକ|इतिहास(?:को[\s\xa0]*पहिलो[\s\xa0]*पुस्तक|[\s\xa0]*[1१]ला[\s\xa0]*भाग)|سفر[\s\xa0]*أخبار[\s\xa0]*الأيام[\s\xa0]*الأول|itahās[\s\xa0]*dī[\s\xa0]*pahilī[\s\xa0]*potʰī|Una(?:ng)?[\s\xa0]*Kronikel|I(?:[\s\xa0]*(?:C(?:ronic[ail]|hrn)|Paralipomen[ao]|Kronikel)|\.[\s\xa0]*(?:C(?:ronic[ail]|hrn)|Kronikel))|(?:Kr[o\xF3]nik[a\xE1]k|Mambo[\s\xa0]*ya[\s\xa0]*Nyakati)[\s\xa0]*I|Paralipomenon[\s\xa0]*I|First[\s\xa0]*Chrn|Prv[ay\xE1\xFD][\s\xa0]*Kronik|Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Kronik|Taariikhdii[\s\xa0]*Kowaad|I\.?[\s\xa0]*Babad|ପ୍ରଥମ[\s\xa0]*ବଂଶାବଳୀର|Una(?:ng)?[\s\xa0]*Paralipomeno|Prvn[i\xED][\s\xa0]*Letopis[uů]|I\.?[\s\xa0]*L(?:etopis[uů]|ịch[\s\xa0]*sử)|(?:First|I\.?)[\s\xa0]*Coron[io]cles|(?:(?:I(?:\.[\s\xa0]*Cr[\xF3\xF4]|[\s\xa0]*Cr[\xF3\xF4])|Primeir[ao][\s\xa0]*Cr[o\xF4]|Primer[\s\xa0]*Cr[o\xF3]|Primero[\s\xa0]*Cr[o\xF3])nica|(?:First[\s\xa0]*Chronic|I\.?[\s\xa0]*Chronic)al)s|(?:Premi(?:\xE8re|ere?)[\s\xa0]*|I\.?[\s\xa0]*|Premi(?:\xE8re|ere?)s[\s\xa0]*)Chroniques|(?:First|I\.?)[\s\xa0]*Choron[io]cles|I\.?[\s\xa0]*Sử[\s\xa0]*K\xFD|I\.[\s\xa0]*Paralipomen(?:on|a)|F\xF8rste[\s\xa0]*Kr\xF8nikebo[gk]|(?:Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Kronic|Prv[ay\xE1\xFD][\s\xa0]*Kronic|I\.?[\s\xa0]*Kronic)k[a\xE1]|(?:Els[oő][\s\xa0]*Kr[o\xF3]|F\xF8rste[\s\xa0]*Kro|I\.?[\s\xa0]*Kr\xF3|Prvn[i\xED][\s\xa0]*Paralipomeno|(?:Prv[ay\xE1\xFD]|Liber[\s\xa0]*I|First)[\s\xa0]*Paralipomeno|Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Paralipomeno|I\.?[\s\xa0]*Sử[\s\xa0]*bi\xEAn[\s\xa0]*ni\xEA)n|(?:Eerste|I\.?)[\s\xa0]*Kronieken|F[o\xF6]rsta[\s\xa0]*Kr[o\xF6]nikeboken|(?:Fyrri[\s\xa0]*Kron[i\xED]kub[o\xF3]|itih[aā]sko[\s\xa0]*pusta|I\.?[\s\xa0]*Kron\xED|Prv[ay\xE1\xFD][\s\xa0]*Kron\xED|Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*Kron\xED)k|(?:P(?:ierwsz[aey][\s\xa0]*Kr|remye[\s\xa0]*Kw)|I\.?[\s\xa0]*Kw)onik|(?:(?:Prvn[i\xED]|I\.?)[\s\xa0]*kniha[\s\xa0]*k|Prvn[i\xED][\s\xa0]*K|Erste[\s\xa0]*Ch)ronik|(?:Pierwsz[aey]|I\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Kronik|I\.?[\s\xa0]*Taariikhdii|(?:Kwanza|I\.?)[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|(?:اوّل[\s\xa0۔]*|۱[\s\xa0۔]*)تواریخ|(?:اوّل|۱)\-?توارِیخ|1(?:[\s\xa0]*(?:tavārīḫ|ਇਤਹਾਸ|HanO|Ist|Ljet|N[aā][lḷ][aā]kamam|குறிப்பேடு|Cronic(?:[ai]|le)|Krn|k\.?[\s\xa0]*Kronik)|st\.?[\s\xa0]*Chrn|역대|[\s\xa0]*Babad|[\s\xa0]*พ(?:งศาวดาร|ศด)|[\s\xa0]*ବଂଶାବଳୀର|[\s\xa0]*इतिहासको|[\s\xa0]*Летопис[иь]|[\s\xa0]*itihāsko|[\s\xa0]*itihasko|[\s\xa0]*Lịch[\s\xa0]*sử|[\s\xa0]*Letopis[uů]|Chr|(?:st\.?)?[\s\xa0]*Coron[io]cles|(?:(?:o(?:\.[\s\xa0]*Cr[o\xF3\xF4]|[\s\xa0]*Cr[o\xF3\xF4])|a(?:\.[\s\xa0]*Cr[o\xF4]|[\s\xa0]*Cr[o\xF4])|\xBA(?:\.[\s\xa0]*Cr[o\xF3]|[\s\xa0]*Cr[o\xF3]))nica|[\s\xa0]*(?:Cr[\xF3\xF4]nica|Itiha|itahā)|st\.?[\s\xa0]*Chronical)s|(?:er(?:e\.?|\.)?|\xE8?re\.?)[\s\xa0]*Chroniques|[\s\xa0]*Choronicles|st\.?[\s\xa0]*Choron[io]cles|[\s\xa0]*Sử[\s\xa0]*K\xFD|[\s\xa0]*Paralipomen(?:on|a)|[\s\xa0]*Kr\xF8nikebo[gk]|[\s\xa0]*k\.?[\s\xa0]*Kronick[a\xE1]|(?:[\s\xa0]*(?:k\.?[\s\xa0]*Paralipomeno|Kr\xF3)|st\.?[\s\xa0]*Paralipomeno|[\s\xa0]*Sử[\s\xa0]*bi\xEAn[\s\xa0]*ni\xEA)n|e\.?[\s\xa0]*Kronieken|[\s\xa0]*Kr\xF6nikeboken|[\s\xa0]*Kroni(?:c(?:k[a\xE1]|a)|eken|ke(?:boken|l))|[\s\xa0]*(?:k\.?[\s\xa0]*Kron\xED|Aika|Kron\xED)k|[\s\xa0]*Kwonik|[\s\xa0]*kniha[\s\xa0]*kronik|[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Kronik|[\s\xa0]*Taariikhdii|[\s\xa0]*Mambo[\s\xa0]*ya[\s\xa0]*Nyakati|\.(?:[\s\xa0]*(?:C(?:h(?:r(?:onicles|onik|n|onicals|oniques)|oron[io]cles)|ronic(?:(?:le|a)s|ilor)|oron[io]cles|r[\xF3\xF4]nicas)|พ(?:งศาวดาร|ศด)|Babad|ବଂଶାବଳୀର|इतिहासको|Летопис[иь]|itih[aā]sko|L(?:etopis[uů]|ịch[\s\xa0]*sử)|Itihas|Sử[\s\xa0]*K\xFD|Paralipomen(?:on|a)|Sử[\s\xa0]*bi\xEAn[\s\xa0]*ni\xEAn|kniha[\s\xa0]*kronik|K(?:r(?:oni(?:c(?:k[a\xE1]|a)|eken|ke(?:boken|l))|\xF8nikebo[gk]|\xF3n|\xF6nikeboken|on\xEDk)|wonik|s(?:i[eę]g[ai]|\.)?[\s\xa0]*Kronik)|Паралипоменону|Taariikhdii|Mambo[\s\xa0]*ya[\s\xa0]*Nyakati)|[o\xBA](?:\.[\s\xa0]*Cr[o\xF3]|[\s\xa0]*Cr[o\xF3])nicas)|[\s\xa0]*أخ|(?:\.[\s\xa0۔]*|[\s\xa0۔]*)تواریخ|\.\-?توارِیخ|(?:[ея]\.?[\s\xa0]*Хрони|[\s\xa0]*Хрон[иі])к|\.[\s\xa0]*Хроник|[ея]\.?[\s\xa0]*Летопись|\-?(?:е(?:\.[\s\xa0]*(?:Летопись|Хроник)|[\s\xa0]*(?:Летопись|Хроник))|я\.?[\s\xa0]*Хроник|توارِیخ|я\.?[\s\xa0]*Летопись))|I\.?[\s\xa0]*хроника|1[\s\xa0]*Дневника|(?:I\.?|1\.)[\s\xa0]*дневника|1(?:\-?е\.?|\.)[\s\xa0]*Хроніка|I\.?[\s\xa0]*Хроніка|1[\s\xa0]*Hroniky|(?:1(?:\-?е(?:\.[\s\xa0]*[HȞ]|[\s\xa0]*[HȞ])|\.[\s\xa0]*[HȞ]|[\s\xa0]*Ȟ)|I(?:\.[\s\xa0]*[HȞ]|[\s\xa0]*[HȞ]))roniky|I\.?[\s\xa0]*Паралипоменону|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*Літопису|(?:1\.?[\s\xa0]*к|I\.?[\s\xa0]*к)нига[\s\xa0]*хроніки|1\-?е\.?[\s\xa0]*книга[\s\xa0]*хроніки|1\-?(?:ше|а)[\s\xa0]*(?:[HȞ]roniky|Хроніка|Літопису|книга[\s\xa0]*хроніки)|1\-?(?:ше|а)\.[\s\xa0]*(?:[HȞ]roniky|Хроніка|Літопису|книга[\s\xa0]*хроніки)|(?:1(?:\-?е\.?|\.)[\s\xa0]*хроні|I\.?[\s\xa0]*хроні|1\-?(?:ше|а)[\s\xa0]*хроні|1\-?(?:ше|а)\.[\s\xa0]*хроні)ки|(?:1\.?[\s\xa0]*к|I\.?[\s\xa0]*к)нига[\s\xa0]*летописи|I\.?[\s\xa0]*Летописи|1\.?[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*летописите|I\.?[\s\xa0]*Книга[\s\xa0]*на[\s\xa0]*летописите|П(?:ерш[ае][\s\xa0]*(?:[HȞ]roniky|Хроніка|Літопису|книга[\s\xa0]*хроніки)|рва[\s\xa0]*(?:(?:днев|хро)ника|Паралипоменону)|ерш[ае][\s\xa0]*хроніки|рв(?:а[\s\xa0]*(?:книга[\s\xa0]*л|Л)|о[\s\xa0]*(?:книга[\s\xa0]*л|Л))етописи|ърв[ао][\s\xa0]*(?:Книга[\s\xa0]*на[\s\xa0]*летописите|Летописи|Парал))|(?:1(?:\xB0\.?[\s\xa0]*Cronach|st\.?[\s\xa0]*Chronicl|[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronikav|[\s\xa0]*Kronikav|\.[\s\xa0]*(?:Kronikav|Cronach))|(?:First[\s\xa0]*Chronic|I\.?[\s\xa0]*Chronic)l|(?:Prim[ao]|I\.?)[\s\xa0]*Cronach)e|(?:1(?:[\s\xa0]*C(?:h(?:ron[io]|orono)|rono)|st(?:\.?[\s\xa0]*Cron[io]|\.?[\s\xa0]*Chrono)|\.[\s\xa0]*Ch?rono)|(?:I(?:\.[\s\xa0]*Ch?|[\s\xa0]*Ch?)|First[\s\xa0]*Ch)rono|First[\s\xa0]*Cron[io])cle|Una(?:ng)?[\s\xa0]*Chronicle|Choronicle|1[\s\xa0]*நாளாகமம்|நாளாகமத்தின்[\s\xa0]*முதலாம்[\s\xa0]*புத்தகம்|1[\s\xa0]*хрон|1[\s\xa0]*Паралипоменон|1(?:\.?[\s\xa0]*Книга|[ея]\.?|\-?(?:е\.?|я\.?))[\s\xa0]*Паралипоменон|1(?:\-?(?:е\.?|я\.?)|[ея]\.?)[\s\xa0]*Книга[\s\xa0]*Паралипоменон|или[\s\xa0]*Първа[\s\xa0]*книга[\s\xa0]*Паралипоменон|1(?:[\s\xa0]*(?:C(?:r(?:o(?:n(?:icl)?)?|[\xF3\xF4]n?)?|h(?:r(?:on?)?)?)|Aik|Хр|நாளா|Дн|குறி|itihās|Пар(?:ал)?|Kr\xF6n)|st(?:\.[\s\xa0]*Chr(?:on?)?|[\s\xa0]*Chr(?:on?)?)|e\.?[\s\xa0]*Kron|st\.?[\s\xa0]*Cron|[\s\xa0]*ବଂଶାବଳୀ|[\s\xa0]*इति(?:हास)?|[\s\xa0]*Лет|[\s\xa0]*Taar|(?:st\.?)?[\s\xa0]*Coron[io]cle|st\.?[\s\xa0]*Choronocle|[\s\xa0]*Pa(?:r(?:alipomeno)?)?|[\s\xa0]*Kr\xF8n?|[\s\xa0]*(?:e\.?|i\.?)[\s\xa0]*Kronika|[\s\xa0]*Kro(?:n(?:ika?)?)?|\.[\s\xa0]*(?:C(?:ron(?:ic(?:le|a)|ic[il])?|oron[io]cle|h(?:r(?:onicle|on?)?|oronocle))|इति(?:हास)?|ବଂଶାବଳୀ|Лет|Taar|Pa(?:r(?:alipomeno)?)?|Kr(?:o(?:n(?:ika?)?)?|\xF8n?)|Парал(?:ипоменон)?))|I(?:[\s\xa0]*(?:C(?:hr(?:on?)?|ron)|Par?|Kro(?:n(?:ik)?)?|Парал)|\.[\s\xa0]*(?:C(?:hr(?:on?)?|ron)|Kro(?:n(?:ik)?)?|Парал))|Α['ʹʹ΄’][\s\xa0]*(?:Χρ(?:ον)?|Πα)|역대기[\s\xa0]*상|Prvn[i\xED][\s\xa0]*Pa|Eerste[\s\xa0]*Kron|First[\s\xa0]*Chr(?:on?)?|First[\s\xa0]*Cron|ପ୍ରଥମ[\s\xa0]*ବଂଶାବଳୀ|I\.?[\s\xa0]*Taar|(?:First|I\.?)[\s\xa0]*Coron[io]cle|(?:First|I\.?)[\s\xa0]*Choronocle|I\.[\s\xa0]*Pa(?:r(?:alipomeno)?)?|F\xF8rste[\s\xa0]*Kr\xF8n?|1(?:\-?е\.?|\.)[\s\xa0]*Хронік|I\.?[\s\xa0]*Хронік|(?:1\.?[\s\xa0]*к|I\.?[\s\xa0]*к)нига[\s\xa0]*хронік|1\-?е\.?[\s\xa0]*книга[\s\xa0]*хронік|1\-?(?:ше|а)[\s\xa0]*(?:книга[\s\xa0]*х|Х)ронік|1\-?(?:ше|а)\.[\s\xa0]*(?:книга[\s\xa0]*х|Х)ронік|I\.?[\s\xa0]*Лет|П(?:ерш[ае][\s\xa0]*(?:книга[\s\xa0]*х|Х)ронік|ърв[ао][\s\xa0]*Лет)|(?:I(?:\.[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik)|[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik))|Una(?:(?:ng)?[\s\xa0]*Mga[\s\xa0]*(?:Cronic|Kronik)|(?:ng)?[\s\xa0]*Cronic)|Premye[\s\xa0]*liv[\s\xa0]*Kwonik[\s\xa0]*l|(?:Kwanza|I\.?)[\s\xa0]*Ny|(?:Premye[\s\xa0]*I|I\.?[\s\xa0]*I)stw|Prva[\s\xa0]*(?:knjiga[\s\xa0]*)?Ljetopis|I\.?[\s\xa0]*Ljetopis|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Aikakirj|1(?:\.[\s\xa0]*(?:Ljetopis|Istw|Ny|Aikakirj|Mga[\s\xa0]*[CK]roni[ck])|[\s\xa0]*(?:Mga[\s\xa0]*[CK]roni[ck]|Ny))|Cartea[\s\xa0]*[i\xEE]nt[a\xE2]i[\s\xa0]*Paralipomen)a|Hanidabaa[\s\xa0]*Odiyaa[\s\xa0]*Koiro[\s\xa0]*Maxaafaa)|(?:(?:編年紀|代|历代志|歷(?:代志)?)上》|《(?:历代志|代|歷代志|歷|編年紀)上|1[\s\xa0]*дневника|1[\s\xa0]*itihas|C(?:h(?:ron(?:[io]cle|ical)|oron[io]cle)|(?:oron[io]|ron[io])cle)s|Χρονικ[ωώ]ν[\s\xa0]*Α['ʹʹ΄’]|דברי[\s\xa0]*הימים[\s\xa0]*א|1\.?[\s\xa0]*Sử[\s\xa0]*k\xFD|Paralipomenon|I(?:[\s\xa0]*(?:Kronika|Sử[\s\xa0]*k\xFD|Paralipomenon)|\.[\s\xa0]*(?:Kronika|Sử[\s\xa0]*k\xFD))|Fyrri[\s\xa0]*kron\xEDkub\xF3k|أخبار[\s\xa0]*الأيام[\s\xa0]*الأول|C(?:h(?:ron[io]|orono)|oron[io]|ron[io])cle|(?:編年紀|代|历代志|歷(?:代志)?)上|1\.?[\s\xa0]*Sử|I\.?[\s\xa0]*Sử|Първа[\s\xa0]*книга[\s\xa0]*(?:Паралипоменон|на[\s\xa0]*летописите)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Ezra"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:Ἔσ|스|อสร|에[스즈]라기|エ[スズ]ラ[書記]|עזרא|เอสรา|ଏଜ୍ରା|ਅਜ਼ਰਾ|عـز|Уза[ий]р|Єздри|azrā|ʿizrā|1[\s\xa0]*Езд|Езра|Εσδρας|Έσδρας|eǳr[aā]ko|《(?:以斯拉[記记]|拉|厄斯德拉上)》|عز[\s\xa0]*را|سفر[\s\xa0]*عزرا|edzr[aā]|(?:\xCAx|Izi)ra|E(?:z(?:dr(?:\xE1[sš]|a[sš])|sdr[a\xE1]s|ras[\s\xa0]*Bog)|d|s(?:r(?:a(?:b[o\xF3]|s[\s\xa0]*bo)k|ā)|ṛ[aā]|dra))|Первая[\s\xa0]*Ездры|Liber[\s\xa0]*Esdrae|एज्राको[\s\xa0]*पुस्तक|Езрина|Јездра|Книга[\s\xa0]*(?:Ездр[иы]|на[\s\xa0]*Ездра)|(?:(?:\xC9t|Aej)r|Cesra|\xCA\-?xơ\-?r|E(?:sran[\s\xa0]*kirj|\-?xơ\-?r)|Liv[\s\xa0]*Esdras[\s\xa0]*l)a|K(?:s(?:i[eę]g[ai]|\.)?[\s\xa0]*Ezdrasz|njiga[\s\xa0]*Ezrin)a|에(?:즈라?|스라)|エ[スズ]ラ|Єзд|Езр|Εσ|eǳr[aā]|Cesr?|(?:\xCAx|Izi)r|E(?:z(?:d(?:ra?)?|sd|ra?)|s(?:dr?|ra?))|एज्रा|எஸ்(?:றா(?:வின்[\s\xa0]*புத்தகம்)?|ரா))|(?:《(?:以斯拉[記记]|拉|厄斯德拉上)|Ездр[аиы]|عزرا|拉》|以斯拉[記记]》|厄斯德拉上》|एज्राको|以斯拉[記记]|Езд|厄斯德拉上|E(?:s(?:dra[es]|ra[ns])|zdrasza)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Ruth"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:rūtʰ(?:ko[\\s\\xa0]*pustak)?)|(?:ルツ記|룻기|ਰੂਥ|רות|ر(?:وت|ا|ُوت)|Ру(?:та|фь)|῾Ρθ|Ρουθ|《(?:路得[記记]|得|盧德傳)》|Uruto|น(?:างรู|ร)ธ|سفر[\\s\\xa0]*راعوث|Книга[\\s\\xa0]*Ру(?:фи|т)|Liber[\\s\\xa0]*Ruth|र(?:ू(?:थको[\\s\\xa0]*पुस्तक|त)|ुत)|Liv[\\s\\xa0]*Rit[\\s\\xa0]*la|R(?:u(?:t(?:hs[\\s\\xa0]*Bog|e)|\\-?tơ|u(?:tin[\\s\\xa0]*kirja|d))|[\\xFAū]t|th|oot)|Rut(?:arb[o\\xF3]|s[\\s\\xa0]*bo)k|rutʰko[\\s\\xa0]*pustak|ଋତର[\\s\\xa0]*ବିବରଣ[\\s\\xa0]*ପୁସ୍ତକ|K(?:s(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Ruthy|njiga[\\s\\xa0]*o[\\s\\xa0]*Ruti|itabu[\\s\\xa0]*cha[\\s\\xa0]*Ruth[iu])|R(?:u(?:ta|ut)|t)|ルツ|룻|Руф|Uru|रूथ|rutʰ|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Rut|ரூத்(?:த(?:ின்[\\s\\xa0]*சரித்திரம்|ு))?)|(?:rutʰko)|(?:《(?:路得[記记]|盧德傳|得)|Рут|(?:盧德傳|得)》|路得[記记]》|रूथको|راعوث|R(?:u(?:t(?:h[iu]|s)|utin)|it)|Ru(?:th?)?|rūt(?:ʰko)?)|(?:路得[記记]|盧德傳|得))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Neh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:nahemyahko[\\s\\xa0]*pustak)|(?:Ne(?:h(?:em(?:i(?:a(?:s’[\\s\\xa0]*Bog|[hš])|\\xE1[sš]|[eh]|ih)|\\xEDa[hs]|ah|jaš|j\\xE1[sš]|a[ai]h)|(?:im(?:a[ai]|ii)|imia?|amia|ima)h)|k[eē]miy[aā]|emias)|느헤미(?:야기|아)|นหม|נחמיה|ネヘミヤ[\\s\\xa0]*?記|ਨਹਮਯਾਹ|نحمیاہ|《(?:尼(?:希米[記记])?|厄斯德拉下)》|Νεεμ[ίι]ας|เนหะมีย์|Не(?:хе|е)?мија|سفر[\\s\\xa0]*نحميا|N(?:\\xE9h[e\\xE9]|eh\\xE9)mie|Li(?:ber[\\s\\xa0]*Nehemiae|v[\\s\\xa0]*Neyemi[\\s\\xa0]*an)|Неємі[ії]|Неемія|Книга[\\s\\xa0]*(?:Неем(?:і[ії]|ии)|на[\\s\\xa0]*Неемия)|न(?:हेम(?:्याहको[\\s\\xa0]*पुस्तक|ायाह)|्हेम्याह)|N(?:e(?:h(?:em(?:i(?:a[ai]|i[ai])|a[ai][ai])|im(?:(?:a[ai]|ii)[ai]|ia[ai]))|xemyaa)|ahemya)h|Nehem(?:\\xEDab[o\\xF3]|jas[\\s\\xa0]*bo|iab[o\\xF3])k|n(?:ah(?:emy(?:āhko[\\s\\xa0]*pustak|a)|amyāh)|iḥimyāh)|N(?:e(?:hem(?:i(?:an[\\s\\xa0]*kir)?j|ei|y)|emij)|\\xEA\\-?h\\xEA\\-?mi\\-?|ahimiya|ơkhemi)a|K(?:s(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Nehemiasz|njiga[\\s\\xa0]*Nehemijin)a|ନିହିମିୟାଙ୍କର[\\s\\xa0]*ପୁସ୍ତକ|N(?:e(?:h(?:amia|imia|em[ij]a)?|em(?:ia?)?|x)?|\\xE9h?|ahi)|느(?:헤(?:미야)?)?|نح|Νε|Не(?:е|є)?м|नहेम(?:्याह?|ा)|nahemyā|நெகே(?:மியா(?:வின்[\\s\\xa0]*புத்தகம்)?)?)|(?:نحميا|ネヘミヤ|尼》|尼希米[記记]》|厄斯德拉下》|Неем(?:и[ия]|і[ії])|《(?:尼希米[記记]|厄斯德拉下)|नहेम्याहको|nahemy[aā]hko|N(?:e(?:hem(?:ia(?:[en]|sza)|jas)|yemi)|\\xEA\\-?h\\xEA\\-?mi)|尼(?:希米[記记])?|厄斯德拉下|《尼|N(?:ehemias|\\xEA)|ନିହିମିୟାଙ୍କର))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["GkEsth"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:エステル(?:書殘篇|記補遺)|에스[겔텔][\\s\\xa0]*추가본|《GkEsth》|Ест\\.?[\\s\\xa0]*Септ|תוספות[\\s\\xa0]*למגילת[\\s\\xa0]*אסתר|Εσθ[ήη]ρ[\\s\\xa0]*στα[\\s\\xa0]*ελληνικ[άα]|எஸ்தர்[\\s\\xa0]*\\(கி\\)|Дополнения[\\s\\xa0]*к[\\s\\xa0]*Есфири|Den[\\s\\xa0]*greske[\\s\\xa0]*Ester\\-?boka|G[kr][\\s\\xa0]*Esth|GrEst|Kr\\.?[\\s\\xa0]*Est|Gr(?:\\xE9cke[\\s\\xa0]*[cč]asti[\\s\\xa0]*knihy[\\s\\xa0]*Est|aeca[\\s\\xa0]*Esth|e(?:cke[\\s\\xa0]*[cč]asti[\\s\\xa0]*knihy[\\s\\xa0]*Est|ek[\\s\\xa0]*Esth))er|Kreikkalainen[\\s\\xa0]*Esterin[\\s\\xa0]*kirja|(?:Книга[\\s\\xa0]*Естир[\\s\\xa0]*\\(според[\\s\\xa0]*Септуагинта|எஸ்(?:தர்[\\s\\xa0]*\\(கிரேக்கம்|[\\s\\xa0]*\\(கி))\\)|G(?:r(?:eek[\\s\\xa0]*Esth?|[\\s\\xa0]*Est)|k[\\s\\xa0]*Est)|Den[\\s\\xa0]*greske[\\s\\xa0]*Ester\\-?boken|Es(?:t(?:er(?:[\\s\\xa0]*(?:\\((?:Gr(?:i(?:e(?:chisch|go|ks)|yego)|eg[ao]|yego)|greco|řeck\\xE9[\\s\\xa0]*(?:č\\xE1sti|dodatky)|Gr|versione[\\s\\xa0]*greca)\\)|[rř]eck[e\\xE9][\\s\\xa0]*(?:[cč][a\\xE1]sti|dodatky)|Gr(?:eg[ao]|yego|iy?ego)|greco|Gr|enligt[\\s\\xa0]*den[\\s\\xa0]*grekiska[\\s\\xa0]*texten)|arb[o\\xF3]k[\\s\\xa0]*hin[\\s\\xa0]*gr[i\\xED]ska)|h(?:er[\\s\\xa0]*Grec|[\\s\\xa0]*Gr)|[\\s\\xa0]*Gr|g|her[\\s\\xa0]*graeca|(?:her[\\s\\xa0]*\\(Gre(?:ek|c)|[\\s\\xa0]*\\(Gr)\\)|her[\\s\\xa0]*Gr)|zter[\\s\\xa0]*k[o\\xF6]nyv[e\\xE9]nek[\\s\\xa0]*kieg[e\\xE9]sz[i\\xED]t[e\\xE9]se))|(?:Est(?:h(?:er[\\s\\xa0]*grec|[\\s\\xa0]*gr)|[\\s\\xa0]*gr|er[\\s\\xa0]*gr(?:iego|ega))|GkEsth》|《GkEsth|Kreikkalainen[\\s\\xa0]*Esterin|Esth?er[\\s\\xa0]*gr|GkEsth|(?:Est(?:er[\\s\\xa0]*\\((?:Grie(?:chisch|ks)|gr(?:iego|ega))|her[\\s\\xa0]*\\(grec|[\\s\\xa0]*\\(Gr)|எஸ்(?:தர்)?[\\s\\xa0]*\\(கி)\\)|Естир[\\s\\xa0]*\\(според[\\s\\xa0]*Септуагинта\\)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Esth"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:estarko[\\s\\xa0]*pustak)|(?:에스(?:더기|텔|테르기)|อสธ|أس|ਅਸਤਰ|Εσθ[ήη]ρ|エステル(?:[書記]|[\\s\\xa0]*記)|Есфирь|《(?:以斯帖[記记]|斯|艾斯德爾傳)》|Естира|Јестира|\\xCA\\-?xơ\\-?t\\xEA|Asttiro|เอสเธอร์|(?:ای|آ)ستر|سفر[\\s\\xa0]*أستير|ଏଷ୍ଟର[\\s\\xa0]*ବିବରଣ|Книга[\\s\\xa0]*Ес(?:ф(?:ири|ір)|т[еи]р)|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Estery|(?:[aā]sta|Aeste|Liber[\\s\\xa0]*Esthe)r|Liv[\\s\\xa0]*Est[e\\xE8][\\s\\xa0]*a|E(?:s(?:t(?:e(?:r(?:s[\\s\\xa0]*Bog|ei|s[\\s\\xa0]*bok|arb[o\\xF3]k|in[\\s\\xa0]*kirja)|er)|[ah]r)|zter)|t)|ऐस्तेर|एस्त(?:रको[\\s\\xa0]*पुस्तक|ेर)|எஸ்தர(?:ின்[\\s\\xa0]*சரித்திரம)?்|에(?:스더?)?|Εσθ|Есф|Ест|Јест|Ast|Es(?:t(?:[ah]|era?)?|zt)?|एस्तर|எஸ்|אסתר,[\\s\\xa0]*כולל[\\s\\xa0]*פרקים[\\s\\xa0]*גנוזים)|(?:Ес(?:т[еи]|фі)р|אסתר|エステル|أستير|《(?:以斯帖[記记]|斯|艾斯德爾傳)|(?:以斯帖[記记]|斯)》|艾斯德爾傳》|Est(?:er(?:[sy]|in)|\\xE8)|Esther|est(?:arko|er)|以斯帖[記记]|斯|艾斯德爾傳|Este|एस्तरको))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Job"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:أي|욥기|โยบ|Аюб|Ἰβ|Ι[ωώ]?β|ヨ[フブ][\\s\\xa0]*?記|איוב|Yob|《(?:約伯[傳記]|约伯记|伯)》|ਅੱ?ਯੂਬ|Hiobi|G(?:i(?:\\xF3p|obbe)|b)|Ayub|Iov|ایوب|ایُ?ّوب|سفر[\\s\\xa0]*أيوب|(?:Ayuu|Iyo)b|(?:Ayyo|īy|Ij)ob|Liber[\\s\\xa0]*Iob|ଆୟୁବ[\\s\\xa0]*ପୁସ୍ତକ|J(?:o(?:bs[\\s\\xa0]*Bog|v)|\\xF3?b)|Јов|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*(?:Иова|Йов)|[ІИЙ]ова)|Jobs(?:b[o\\xF3]|[\\s\\xa0]*bo)k|ayy[uū]bko[\\s\\xa0]*pustak|[इई]योब|अय(?:्यूबको[\\s\\xa0]*पुस्तक|युब)|(?:Liv[\\s\\xa0]*J[o\\xF2]b[\\s\\xa0]*l|Jobin[\\s\\xa0]*kirj|Iyyoob)a|Y[oō]pu|K(?:(?:s(?:\\.[\\s\\xa0]*(?:Ij|J|Hi)|[\\s\\xa0]*(?:Ij|J|Hi)|i[eę]g[ai][\\s\\xa0]*(?:Ij|J|Hi))ob|[\\s\\xa0]*J[o\\xF3]bov|\\.[\\s\\xa0]*J[o\\xF3]bov|niha[\\s\\xa0]*J[o\\xF3]bov)a|njiga[\\s\\xa0]*o[\\s\\xa0]*Jobu|itabu[\\s\\xa0]*cha[\\s\\xa0]*(?:Ayu|Yo)bu)|Hi(?:ob)?|욥|Ayu|J(?:\\xF3|obi)|Книга[\\s\\xa0]*на[\\s\\xa0]*Иов|ayyūb|अय्यूब|யோபு(?:டைய[\\s\\xa0]*சரித்திரம்)?)|(?:ヨ[フブ]|伯》|Іова|[ИЙ]ова|ଆୟୁବ|أيوب|约伯记》|約伯[傳記]》|《(?:約伯[傳記]|伯|约伯记)|(?:iy|I)ob|J(?:ob(?:[as]|in)|\\xF2b)|Hioba|Yobu|Ayubu|ayy[uū]bko|[ИЙ]ов|约伯记|約伯[傳記]|Job|अय्यूबको))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:말라[기키]서|ﻣﻼﺥ|マラキ書|ਮਲਾਕੀ|ملاکی|מלאכי|《(?:瑪(?:拉基[亞書])?|玛(?:拉基书?)?)》|ม(?:าลาคี|ลค)|மல(?:ாக்கி|்கியா)|mal(?:āk(?:ʰ[iī]|[iī])|ak(?:ʰ[iī]|ī))|எபிரேயம்|Малахија|Μαλαχ[ίι]ας|سفر[\\s\\xa0]*ملاخي|मल(?:ा(?:कीको[\\s\\xa0]*पुस्तक|खी)|की)|M(?:a(?:l(?:a(?:c(?:hi(?:\\xE1[sš]|e|a[sš])|i)|akii|qu[i\\xED]as|k(?:i(?:s[\\s\\xa0]*bok|\\xE1s|as’[\\s\\xa0]*Bog)|\\xED))|(?:ea[ck]?|ic)hi|kiy[aā]|ch)|\\-?la\\-?(?:ch|k)i)|l)|(?:M(?:ala(?:kian[\\s\\xa0]*kir|[hȟ]i)j|ikiyaas)|Liv[\\s\\xa0]*Malachi[\\s\\xa0]*)a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Malachiasza|Малахія|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*Малах(?:і[ії]|ии)|Малахі[ії]|на[\\s\\xa0]*пророк[\\s\\xa0]*Малахия)|Malakee|Pro(?:roctwo[\\s\\xa0]*Malachyaszow|phetia[\\s\\xa0]*Malachia)e|말(?:라기?)?|マラキ?|ملا?|மல(?:்கி|ா)|Мал|Μαλ?|मलाकी|Mal(?:a(?:c(?:h(?:ia)?)?|qu|kia?)?|c)?|ମଲାଖି[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:Malakia[ns])|(?:玛(?:拉基)?》|ମଲାଖି|ملاخي|玛拉基书》|瑪(?:拉基[亞書])?》|《(?:瑪拉基[亞書]|玛拉基书)|malaki|Малах(?:и[ия]|і[ії])|《(?:玛(?:拉基)?|瑪)|Malachi(?:asza)?)|(?:玛(?:拉基书|拉基)?|瑪(?:拉基[亞書])?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i)))ew)|(?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:《(?:瑪(?:竇福音|特斐)|[馬马]太福音|太)》|มธ|М(?:ат(?:еја|то)|[тф])|마태(?:오[\\s\\xa0]*)?복음서|Μ(?:ατθα[ίι]ος|θ)|マタイ(?:[伝書]|福音書|[の傳]福音書|による福音書)|إنجيل[\\s\\xa0]*متى|ਮੱਤੀ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਇੰਜੀਲ|متّ?ی[\\s\\xa0]*کی[\\s\\xa0]*انجیل|Κατ[άα][\\s\\xa0]*Ματθα[ίι]ον|มัทธิว|พระวรสารนักบุญแม็ทธิว|ମାଥିଉ[\\s\\xa0]*ଲିଖିତ[\\s\\xa0]*ସୁସମାଗ୍ଭର|הבשורה[\\s\\xa0]*(?:הקדושה[\\s\\xa0]*על\\-?|על[\\s\\xa0\\-?]*|ל)פי[\\s\\xa0]*מתי|மத்தேயு[\\s\\xa0]*(?:எழுதிய[\\s\\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|От[\\s\\xa0]*Матея[\\s\\xa0]*свето[\\s\\xa0]*Евангелие|Јеванђеље[\\s\\xa0]*по[\\s\\xa0]*Матеју|Мата[ий]|Еван(?:гелие(?:[\\s\\xa0]*(?:според[\\s\\xa0]*Матеј|от[\\s\\xa0]*Мате[ий])|то[\\s\\xa0]*според[\\s\\xa0]*Матеј)|ђеље[\\s\\xa0]*по[\\s\\xa0]*Матеју)|Евангелие[\\s\\xa0]*от[\\s\\xa0]*Матфея|Євангелі(?:є[\\s\\xa0]*від[\\s\\xa0]*(?:Мат(?:ві|е)|св\\.?[\\s\\xa0]*Матві)|я[\\s\\xa0]*від[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*)?Матві)я|मत्त(?:ी(?:ले[\\s\\xa0]*लेखे)?को[\\s\\xa0]*सुसमाचार|ि|याने[\\s\\xa0]*लिहिलेले[\\s\\xa0]*शुभवर्तमान)|Evankeliumi[\\s\\xa0]*Matteuksen[\\s\\xa0]*mukaan|matt(?:(?:īle[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]|ile[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā])r|ay[aā]ne[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā]n)|(?:E(?:w(?:angelia[\\s\\xa0]*(?:w(?:edług[\\s\\xa0]*[sś]w\\.?|g[\\s\\xa0]*[sś]w\\.?)[\\s\\xa0]*)?|\\.?[\\s\\xa0]*)Mateusz|vanjelium[\\s\\xa0]*Pod[lľ]a[\\s\\xa0]*Mat[u\\xFA][sš])|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*Matvij)a|(?:Evan[\\xF0đ]|Jevanđ)elje[\\s\\xa0]*po[\\s\\xa0]*Mateju|Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Matte[u\\xFC]s|(?:Evangeliet[\\s\\xa0]*etter[\\s\\xa0]*Matte|Injil[\\s\\xa0]*Mati)us|Evangelium[\\s\\xa0]*secundum[\\s\\xa0]*Matthaeum|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Mateut|mattī[\\s\\xa0]*(?:kī[\\s\\xa0]*in|dī[\\s\\xa0]*ĩ)jīl|Injili[\\s\\xa0]*ya[\\s\\xa0]*Mathayo|Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Matteo|E(?:banghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay|l[\\s\\xa0]*Evangelio[\\s\\xa0]*de)[\\s\\xa0]*Mateo|Sulat[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Mateo|Ebanghelyo[\\s\\xa0]*ni[\\s\\xa0]*(?:San[\\s\\xa0]*)?Mateo|M(?:a(?:t(?:t(?:e(?:u(?:s(?:argu\\xF0spjall|evangeliet)|ksen[\\s\\xa0]*evankeliumi)|i[\\s\\xa0]*evangelium|e|yu[\\s\\xa0]*Na[rṛ]ceyti)|h(?:[e\\xE9][u\\xFC]s|ieu|\\xE4us|ae?us)|h?\\xE6usevangeliet|ēyu[\\s\\xa0]*Na[rṛ]ceyti)|e(?:[ij]|usz)|[u\\xFA][sš]|h|ayos|\\xE9us|ou[sš]ovo[\\s\\xa0]*evangelium)|atiyoosa|\\-?thi\\-?ơ|buting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*)?Mateo)|\\xE1t[e\\xE9]|t[ht]|\\xE1tth\\xEAu)|(?:Evangelium[\\s\\xa0]*podle[\\s\\xa0]*Matou[sš]|Maty)e|마(?:태(?:오[\\s\\xa0]*복음|복음)?)?|Мат|Ματθ|マタイ|مت|மத்|मत्त[यी]|Ew[\\s\\xa0]*Mat|Mat(?:e(?:us?)?|\\xE9|ayo|ou[sš]|th(?:\\xE6us)?)|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))))|(?:(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i))|[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|aint[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i))|[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|aint[\\s\\xa0]*Matt(?:h[ht]i?|h?i|t(?:hi?|i)))|Matt(?:h[ht]i?|h?i|t(?:hi?|i))))e|Mat(?:(?:h[ht]?i|t[ht])e|h[ht]?e|h[ht][ht]i?e))w)|(?:(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))ew)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))|《(?:瑪特斐|太|瑪竇福音|[馬马]太福音)|مت(?:[ىی]|ّی)|ਮੱਤੀ|מתי|ମାଥିଉ|(?:瑪特斐|太)》|瑪竇福音》|[馬马]太福音》|Мате[ийј]|மத்தேயு|मत्त(?:यान|ील)े|От[\\s\\xa0]*Матф?ея|Від[\\s\\xa0]*Матвія|Mat(?:t(?:e(?:u(?:ksen|s)|\\xFCs|yu|o)|ēyu)|(?:[u\\xFA][sš]|eusz)a|ius)|Mathayo|San[\\s\\xa0]*Mateo|Evangelio[\\s\\xa0]*de[\\s\\xa0]*Mateo|matt(?:ay[aā]n|[iī]l)e|mattī)|(?:(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt)ew)|(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|瑪(?:竇福音|特斐)|[馬马]太福音|Mateo|Мат(?:ві|фе)я)|(?:M(?:at(?:t(?:hwe|we)?)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ps"],
        extra: "1",
        regexp: RegExp("(\\b)((?:(?:(?:1[02-5]|[2-9])?(?:1" + bcv_parser.prototype.regexps.space + "*st|2" + bcv_parser.prototype.regexps.space + "*nd|3" + bcv_parser.prototype.regexps.space + "*rd))|1?1[123]" + bcv_parser.prototype.regexps.space + "*th|(?:150|1[0-4][04-9]|[1-9][04-9]|[4-9])" + bcv_parser.prototype.regexps.space + "*th)" + bcv_parser.prototype.regexps.space + "*Psalm)\\b", "gi")
      }, {
        osis: ["Ps"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Psmal(?:ms?|s)|Žalmy)|(?:Ps(?:lal?m|ml)s)|(?:(?:[ZŽ]alt[a\\xE1]|zabū|Salmarni)r)|(?:《(?:[詩诗]篇|[詩诗]|聖詠集)》|詩(?:篇\\/聖詠|編)|시편|สดด|ਜ਼?ਬੂਰ|زبُور|תהילים|מזמורים|สดุดี|เพลงสดุดี|Za(?:buri|lmy)|Mga[\\s\\xa0]*Awit|ଗ(?:ୀତି?|ାତ)ସଂହିତା|भजनसं?ग्रह|(?:الم(?:َزمُ|زم)|مزم|زب)ور|سفر[\\s\\xa0]*المزامير|Книга[\\s\\xa0]*Псалмів|stotrasa[mṃ]hit[aā]|Th\\xE1nh[\\s\\xa0]*vịnh|bʰaǳansa[mṃ]grah|Th\\xE1nh[\\s\\xa0]*Thi|Zsolt[a\\xE1]rok|Sa(?:lm(?:e(?:rnes[\\s\\xa0]*Bog|nes[\\s\\xa0]*bok)|[is]|au)|buurradii)|திபா|Slm|Salmos|(?:Thi[\\s\\xa0]*Thi\\xEA|Bhja)n|P(?:s(?:a(?:l(?:m(?:u[ls]|[sy]|[lm]s|e[nt]|a[su]|i(?:en[\\s\\xa0]*kirja|[it]))|taren|a?s|[al]ms)|m(?:l[as]|s|as)|a(?:ms|a)|(?:ml?m|ume|alm)s)|m(?:[lm]|al)|sm|l(?:m[ms]|am)|lmas)|(?:a(?:s(?:ml|s)|m[ls]|l[lm])|l(?:ama|m)|la(?:sm?|m)|asm|l(?:s(?:a?m|sss)|a(?:sm)?a)|a(?:ls|sl)m)s)|K(?:s(?:\\.[\\s\\xa0]*Psalm[o\\xF3]|[\\s\\xa0]*Psalm[o\\xF3]|i[eę]g[ai][\\s\\xa0]*Psalm[o\\xF3])w|niha[\\s\\xa0]*[zž]alm(?:[uů]|ov)|(?:\\.[\\s\\xa0]*[zž]|[\\s\\xa0]*[zž])almov)|திருப்பாடல்கள்|சங(?:்கீத(?:[\\s\\xa0]*புத்தகம|ங்கள|ம)|கீதம)்|भजन\\-?सहिन्ता|भजन[\\s\\xa0]*संहिता|स्त(?:्र)?ोत्रसंहिता|Забур|Псал(?:м(?:и[\\s\\xa0]*Давидови|ы)|ти(?:́р|рь)|[ао]м)|Ψαλμ(?:ο(?:[ίι][\\s\\xa0]*του[\\s\\xa0]*Δαυ[ίι]δ|ς)|ός)|Mga[\\s\\xa0]*Salmo|Mazamure|Li(?:bri[\\s\\xa0]*i[\\s\\xa0]*Psalmeve|v[\\s\\xa0]*S[o\\xF2]m[\\s\\xa0]*yo)|(?:Liber[\\s\\xa0]*Psalmoru|(?:Psl|Ž)al)m|P(?:s(?:a(?:l(?:m(?:[lm]|e|a|i)?|[al]m|a)?|ml?m|ume|alm|ml?|u)?|l[am]|ma?|s)?|l(?:s(?:a?m|sss)|a(?:sm)?a)|a(?:ls|sl)m|l(?:a(?:sm?|m)|s(?:ss?|a)))|Z(?:a(?:b(?:ur)?|lm)|solt)?|[Ž시]|مز|زبُو|Заб|Maz|Sa(?:l(?:m(?:e(?:rne|ne)?)?)?|buur)|திருப்பாடல்|Sl|சங்(?:கீ)?|स्तोत्र|Пс(?:ал(?:тир)?)?|Ψα|(?:(?:Masm|Jab)u|S\\xE1lmarni)r|Ca(?:rtea[\\s\\xa0]*Psalmilor|[nṅ]k[iī]tam))|(?:[詩诗]》|Thi|भजन|Awit|[詩诗]篇》|聖詠集》|《(?:[詩诗]篇|聖詠集)|Ψαλμο[ίι]|Псалм(?:ів|и)|S(?:alm(?:enes|o)|[o\\xF2]m)|Psalmien|[詩诗]篇|[詩诗]|聖詠集|《[詩诗]|المزامير))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eccl"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Predik(?:arens[\\s\\xa0]*bok|erens))|(?:Проповідника)|(?:جا|Ἐκ|코헬렛|전도서|קהלת|vāʿẓ|傳道之書|伝道者?の書|《(?:傳道書|訓道篇|傳|传(?:道书)?)》|واعِ?ظ|ଉପଦେଶକ|המ(?:קהיל|רצה)|ਉਪਦੇਸ਼ਕ|コヘレトの(?:こと[はば]|言葉)|பிரசங்கி|Qoheleth|Giảng[\\s\\xa0]*Sư|ป(?:ัญญาจารย์|ญจ)|Wacdiyaha|سفر[\\s\\xa0]*الجامعة|Размышления|Проповедник|Екклезіяста|Juru[\\s\\xa0]*Kotbah|Εκκλησιαστ[ήη]ς|सभोपदेशक|उपदेशकको[\\s\\xa0]*पुस्तक|(?:M(?:agwawal|hubir)|Wacdiyahi)i|Gi\\xE1o[\\s\\xa0]*huấn|P(?:r(?:e(?:di(?:k(?:a(?:r(?:boke|in|e)n|tor)|\\xE1tor|uesi|eren)|ger)|gethwr)|\\xE6dikerens[\\s\\xa0]*Bog|ad|\\xE9dik[a\\xE1]tor|\\xE9dikarinn)|iraca[nṅ]ki)|(?:Pr(?:edikantens[\\s\\xa0]*bo|opovjedni)|Forkynnerens[\\s\\xa0]*bo)k|Sabhopadeshak|upade(?:[sš]akko[\\s\\xa0]*pust|ŝ)ak|ச(?:ங்கத்[\\s\\xa0]*திருவுரை[\\s\\xa0]*ஆகமம்|பை[\\s\\xa0]*உரையாளர்|உ)|Ang[\\s\\xa0]*Mangangaral|(?:Co[e\\xE9]|Qoh?\\xE8|Liber[\\s\\xa0]*Qoe)let|Liber[\\s\\xa0]*Ecclesiastes|E(?:c(?:cl(?:es(?:(?:(?:s[ai][ai]|aa)s|s[ai][ai]|aa|ais?)t[e\\xE9]s|i(?:a(?:st(?:\\xE9s|e|ul)|t[e\\xE9]s)|is?t[e\\xE9]s))|\\xE9siaste)|le(?:s(?:(?:(?:s[ai][ai]|a[ai]|ii)s|s[ai][ai]|a[ai]|ii|ia)t[e\\xE9]|iast[e\\xE9])s|[sz]iastul)|(?:clesiasti[e\\xE9]|lesiasti[e\\xE9]|c?lesiastic[e\\xE9]|lesyast[e\\xE9])s|clesi(?:aa)?tes|(?:cles(?:i(?:a[ai])?|a)|lesi)stes|cles(?:ia?|a)iastes|l(?:is[iy]|esiai)astes)|k(?:l(?:e(?:s[iy]ast[e\\xE9]|ziaste)|is[iy]aste)s|kle(?:siastes|zijast)))|Truyền[\\s\\xa0]*đạo|(?:E(?:klezyas[\\s\\xa0]*\\-?[\\s\\xa0]*Liv[\\s\\xa0]*Filoz[o\\xF2]f[\\s\\xa0]*l|ranchcha)|Saarnaajan[\\s\\xa0]*kirj|Mang)a|K(?:s(?:\\.[\\s\\xa0]*(?:K(?:aznodziei[\\s\\xa0]*Salomon|ohelet)|Eklezjastes)|[\\s\\xa0]*(?:K(?:aznodziei[\\s\\xa0]*Salomon|ohelet)|Eklezjastes)|i[eę]g[ai][\\s\\xa0]*(?:K(?:aznodziei[\\s\\xa0]*Salomon|ohelet)|Eklezjastes))a|a(?:znodziei[\\s\\xa0]*Salomonowego|alam)|ohelet(?:[\\s\\xa0]*—[\\s\\xa0]*Kazate[lľ]|h)|(?:\\.[\\s\\xa0]*kazate[lľ]|[\\s\\xa0]*kazate[lľ]|niha[\\s\\xa0]*kazate[lľ])ova)|Ек(?:л[еи]с|клес)иаст|E(?:c(?:c(?:l(?:es(?:(?:(?:s[ai][ai]|aa)s|s[ai][ai]|aa|ais?)t[e\\xE9]|i(?:a(?:t[e\\xE9]|st\\xE9?)|is?t[e\\xE9]))?|\\xE9s)?)?|les(?:(?:(?:s[ai][ai]|a[ai]|ii)s|s[ai][ai]|a[ai]|ii|ia)t[e\\xE9]|iast[e\\xE9])|l(?:e(?:ziast|s))?)?|ra|kl)|伝道者の|코헬|전|コヘレト|பிரச|सभो|Qo(?:h(?:elet)?)?|Mhu|Wac|Разм|Проп|Ек(?:к(?:л(?:езіяст)?)?|л)|Εκ|उपदेशक|Saar(?:n(?:aaja)?)?|Pr(?:\\xE6d(?:ikeren)?|\\xE9d|op|e(?:d(?:iker)?|g))|Fork(?:ynneren)?|upade[sš]ak|K(?:azn?|oh)|К(?:нига[\\s\\xa0]*(?:Ек(?:кле(?:зіястов|сиаст)|лезіястов)|на[\\s\\xa0]*Еклисиаста[\\s\\xa0]*или[\\s\\xa0]*Проповедник)а|оге́лет))|(?:傳道書》)|(?:《(?:传道书|訓道篇|傳道書)|(?:訓道篇|傳)》|传(?:道书)?》|الجامعة|Qoelet|K(?:azate[lľ]|ohelet)|उपदेशकको|Saarnaajan|Gi\\xE1o|upade[sš]akko|Mangangaral|E(?:cclesiaste|klezya)s|Проповедника|Ек(?:л(?:езіястов|исиаст)|клезіястов)а|《[传傳]|Liv[\\s\\xa0]*Filoz[o\\xF2]f[\\s\\xa0]*la)|(?:傳道書|訓道篇|传道书|[传傳]|Filoz[o\\xF2]f))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ezek"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:에(?:제키엘|스겔)서|᾿Ιζ|겔|อสค|エ[セゼ]キエル書|《(?:以西(?:結[书書]|结书)|[結结]|厄則克耳)》|יחזקאל|Езекил|Језекиљ|ਹਿਜ਼ਕੀਏਲ|यहेज्?केल|Єзекі[ії]л[аь]|Ιεζ(?:εκι[ήη]λ|κ)|เอเสเคียล|Иезекииль|Jezeki[i\\xEF]l['’]|ح(?:زقی[\\s\\xa0‌]*|ِزقی[\\s\\xa0]*)ایل|سفر[\\s\\xa0]*حزقيال|\\xCA\\-?x\\xEA\\-?(?:chi\\-?|ki\\-?)\\xEAn|E(?:z(?:e(?:kiel(?:s’?[\\s\\xa0]*Bog|i)|chiele)|[kq])|sk)|इजकिएलको[\\s\\xa0]*पुस्तक|(?:E(?:z(?:e(?:[ei](?:qu|k)e|qu(?:i[ae]|e)|chi\\xEB|k(?:ia|e))|i(?:[ei](?:qu|k)|qu|k)e)|c[eē]kkiy[eē]|x[ei][ei]?ke)|Y(?:eh(?:\\xE8zki[e\\xE8]|ezki[e\\xE8])|\\xE9h[e\\xE8]zki[e\\xE8])|ḥiziqīʾī)l|(?:E(?:z(?:i[ei](?:qu|k)|\\xE9ch|ik|iqu|e(?:[ei](?:qu|k)|c))i|se(?:k[y\\xED]|ci)|x[ei][ei]?ki)|yahe(?:dz|ǳ)k|hizkī|Y(?:ahejak|exesqe)|\\xC9z[e\\xE9]chi)el|(?:Ez\\xE9|Yehes)kiel|Iezechiel|iǳakielko[\\s\\xa0]*pustak|Esekiels[\\s\\xa0]*bok|(?:Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Ezechie|Liv[\\s\\xa0]*Ezeky[e\\xE8]l[\\s\\xa0]*)la|H(?:e(?:sekiel(?:in[\\s\\xa0]*kirja|s[\\s\\xa0]*bok)|zechiel)|izqqeela)|Prophetia[\\s\\xa0]*Ezechielis|Езекиел|Йезекиил|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*пророк[\\s\\xa0]*(?:Иезекииля|Езекиил)|пророка[\\s\\xa0]*(?:Єзекі[ії]|Иезекии)ля)|ଯିହିଜିକଲ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ|에(?:제(?:키엘)?|스겔)|エ[セゼ]キエル|Езек|Јез|यहेज|Йез|Єз|Ιεζ(?:εκ)?|حز|Иез(?:екиил)?|Yex|\\xC9z[e\\xE9]ch|E(?:z(?:e(?:c(?:h(?:iel)?)?|qu?|k(?:iel)?)?|\\xE9(?:ch)?)|se(?:k(?:iel)?|c))|इजकिएल|H(?:es(?:ekiel)?|iz)|எசே(?:க்கியேல்[\\s\\xa0]*தீர்க்கதரிசியின்[\\s\\xa0]*புத்தகம்)?)|(?:(?:[結结]|厄則克耳)》|\\xCA\\-?x\\xEA|以西(?:結[书書]|结书)》|《(?:以西(?:結[书書]|结书)|[結结]|厄則克耳)|حزقيال|Езекиил|ଯିହିଜିକଲ|इजकिएलको|Eze(?:ky[e\\xE8]l|chiela)|iǳakielko|Єзекі[ії]ля|Иезекииля|Hesekielin|以西(?:結[书書]|结书)|[結结]|厄則克耳|எசேக்கியேல்))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hos"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:Hose(?:as(?:’[\s\xa0]*Bog|[\s\xa0]*bok)|ias))|(?:هو|Ὠσ|ฮชย|호세아서|הושע|Ωση[έε]|\xD4\-?s\xEA|ホセア(?:しょ|書)|ஓச[ிே]யா|ஒசேயா|Хошеа|Осија|h(?:o(?:ŝey|šeā|sey)|ūsīʿ)|《(?:何(?:西阿[书書])?|歐瑟亞)》|ਹੋਸ਼ੇਆ|Ōciy[aā]|O(?:s(?:e(?:ia[hs]|a[hs])|\xE9e)|ciy[aā])|โฮเชยาห์|ہو(?:[\s\xa0]*سیعاہ|سیعَِ)|سفر[\s\xa0]*هوشع|होशे(?:को[\s\xa0]*पुस्तक|य)|Oze[a\xE1][sš]|Os\xE9ias|H(?:o(?:s(?:e(?:\xE1s|a)|ho)|ze[a\xE1][sš])|(?:\xF3se\xE1|\xF3sea)?s)|Prophetia[\s\xa0]*Osee|(?:H(?:o(?:os(?:e(?:an[\s\xa0]*kirj|7)|heec)|sei|še)|\xF4\-?s\xEA\-?)|Liv[\s\xa0]*Oze[\s\xa0]*|Osij)a|Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Ozeasza|Осія|Книга[\s\xa0]*(?:пророка[\s\xa0]*Ос(?:і[ії]|ии)|на[\s\xa0]*пророк[\s\xa0]*Осия)|호(?:세아?)?|Ωσ|ホセア|ஓச[ிே]|Ос|ho[sš]e|O(?:s(?:ei?a)?|z)|โฮเชยา|ہوسیع|होशे|H(?:o(?:osh?|š|s)?|\xF3s(?:ea)?)|ହୋଶ(?:େୟ[\s\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\s\xa0]*ପୁସ୍ତକ|ହେ))|(?:Ос(?:и[ия]|і[ії])|هوشع|《(?:何西阿[书書]|歐瑟亞)|ହୋଶେୟ|歐瑟亞》|何(?:西阿[书書])?》|Ho(?:osean|seas)|何(?:西阿[书書])?|歐瑟亞|《何|O(?:ze(?:asza)?|see)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Obad"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Abdia[sš])|(?:オ[ハバ][テデ](?:ヤ(?:しょ|書)|ア書)|오바(?:댜서|디야|드야서)|Ἀβδ|옵|อบด|ஒபதியா|ਓਬਦਯਾਹ|ع(?:بدیاہ|و)|עו?בדיה|Авдиј[ае]|Οβδ[ίι]ας|Αβδιο[υύ]|《(?:俄(?:巴底(?:亚书|亞書))?|亞北底亞)》|Овадија|โอบาดี[ยห]์|Abd(?:\\xEDas|ia|diyyu)|سفر[\\s\\xa0]*عوبديا|obadʰ[aā]|obadiy[aā]|(?:ʿabadi|obad)yāh|Cobadyaah|Abdi(?:j[a\\xE1]|\\xE1)[sš]|O(?:b(?:ad(?:i(?:a(?:s['’][\\s\\xa0]*Bog|[hš])|\\xE1[sš])|hah|j(?:a(?:s[\\s\\xa0]*bok|š)|\\xE1[sš]))|edi[a\\xE1][sš]|idah|d)|patiy[aā]|vdij)|ओब(?:द(?:ियाको[\\s\\xa0]*पुस्तक|्[दय]ाह)|े?धाह)|(?:O(?:ba(?:d(?:\\xED|ei|ij|jan[\\s\\xa0]*kirj)|j)|vadi)|\\xD3bad[i\\xED]|\\xD4\\-?ba\\-?đi\\-?|\\xC1p\\-?đi|Liv[\\s\\xa0]*Abdyas[\\s\\xa0]*l)a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Abdiasza|Avdie|Pro(?:roctwo[\\s\\xa0]*Abdyaszow|phetia[\\s\\xa0]*Abdia)e|Овді[ий]|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*(?:Авд[иі]|Овді)я|на[\\s\\xa0]*пророк[\\s\\xa0]*Авди[ий])|オ[ハバ](?:[テデ]ヤ)?|오바댜?|ஒப(?:தி)?|Авд(?:иј)?|Αβδ|\\xD3b|Овд?|Ab(?:di?)?|Cob(?:ad)?|Ob(?:a(?:d(?:j(?:\\xE1|a)?|ia)?)?)?|ओब(?:द[ि्]या|धा)?|ଓବଦିଅ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:Авд(?:и[ийя]|ія)|Овдія|\\xC1p|ଓବଦିଅ|《(?:俄巴底(?:亚书|亞書)|亞北底亞)|亞北底亞》|俄(?:巴底(?:亚书|亞書))?》|عوبديا|Obadja[ns]|Obadias|俄(?:巴底(?:亚书|亞書))?|亞北底亞|《俄|Abd(?:iasza|yas)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hag"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:하(?:까이서|깨)|학개서|Ἀγ|חגי|ਹੱਜਈ|Ohij|ハ[カガ]イ(?:しょ|書)|《(?:哈(?:該[书書]|该书|蓋)|[該该])》|ஆகாய்|حج(?:َّ[يی]|يّ|ی)|Хагај|Агеј|ฮ(?:ักกัย|กก)|hajjaī|حجاي|سفر[\\s\\xa0]*حجي|Αγγα[ίι]ος|(?:h[aā]|Xa)ggay|Āk[aā]y|A(?:g(?:e(?:[jo]|us)|heu|ge[eo])|\\-?gh\\xEA|k[aā]y)|Agg(?:[e\\xE4]|ae?)us|H(?:ag(?:g(?:a(?:[\\xED\\xEF]|js[\\s\\xa0]*Bog|is[\\s\\xa0]*bok)|e(?:us|o)|ia[hi])|a[ij]|e[jo])|gg)|हाग्ग(?:ैको[\\s\\xa0]*पुस्तक|[ये])|(?:Haggain[\\s\\xa0]*kirj|Liv[\\s\\xa0]*Aje[\\s\\xa0]*)a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Aggeusza|(?:Агге|Огі)[ий]|Книга[\\s\\xa0]*(?:(?:пророка[\\s\\xa0]*(?:Агге|Огі)|Огі)я|на[\\s\\xa0]*пророк[\\s\\xa0]*Аге[ий])|(?:h[aā]ggə|A\\-?ga|ḥajja|Ha(?:gga|\\-?g)a)i|Agg\\xE9e|Pro(?:roctwo[\\s\\xa0]*Aggieuszowe|phetia[\\s\\xa0]*Aggaei)|학개?|하까|Ог|ハ[カガ]イ|ஆகா|حج|Агг?|Xagg?|Αγ|Ag(?:eu|g)?|H(?:ag(?:g(?:a(?:i|j)?)?)?|g)|हाग्गै|ହାଗୟ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:哈(?:該[书書]|该书|蓋)》|[該该]》|حجي|《(?:哈(?:該[书書]|该书|蓋)|[該该])|ହାଗୟ|Огія|Аг(?:е[ий]|гея)|Haggain|哈(?:該[书書]|该书|蓋)|[該该]|A(?:ggeusza|je)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hab"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:하(?:바(?:쿡서|꾹)|박국서)|Ἀβ|합|חבקוק|ハ[ハバ]クク(?:しょ|書)|《哈(?:巴谷[书書]?)?》|ஆபகூக்|ਹਬ(?:ਕੱ?|ੱਕ)ੂਕ|ฮ(?:าบากุ|บ)ก|Ха[бв]акук|Ав(?:вакум|а?к)|A(?:b(?:akuka|k)|va[ck]um)|Α(?:ββακο[υύ]|μβακο[υύ])μ|حبقُ?ّوق|سفر[\\s\\xa0]*حبقوق|அபக்கூக்கு|हबक(?:ूकको[\\s\\xa0]*पुस्त|्कू)क|ḥabaqqūq|Xabaquuq|(?:Apak[uū]|Āpak[uū]|habakk?ū|Abakou)k|(?:I(?:rmbbaaqoom|mb)|Liv[\\s\\xa0]*Abakik[\\s\\xa0]*l|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Habakuk)a|Hab(?:a(?:k(?:k(?:uk(?:s[\\s\\xa0]*(?:Bog|bok)|k)|(?:ak|oo)k)|akk|uk(?:in[\\s\\xa0]*kirja|[ku]))|ckuk|quq)|bak(?:k[au]|[au])kk|[ck])|Ha(?:b(?:bac[au]|aca)|\\-?ba\\-?c\\xFA)c|(?:Habac|Aba)cuc|Habacuque|Pro(?:roctwo[\\s\\xa0]*Abakukowe|phetia[\\s\\xa0]*Habacuc)|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*пророк[\\s\\xa0]*Ав|пророка[\\s\\xa0]*Авв?)акума|하(?:박국|바)|ハ[ハバ]クク|ஆப|حب|Авв?|Abak(?:uk)?|Αβ|Xab|அப|हबक(?:्कू|ूक)?|Hab(?:a(?:k(?:k[au]k|ak|uki?)?|c)|bak(?:k[au]|[au])k)?|Книга[\\s\\xa0]*на[\\s\\xa0]*пророк[\\s\\xa0]*Авакум|ହବ(?:‌କ୍‌କୂକ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ|କ[ୁୂ]କ୍))|(?:Habakuk(?:in|a))|(?:哈(?:巴谷[书書]?)?》|《哈巴谷[书書]|حبقوق|Habacuc|Abakik|habakk?uk|Авв?акума|《哈(?:巴谷)?|Авакум|ହବ‌କ୍‌କୂକ)|(?:哈(?:巴谷[书書]?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mic"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:mīkāh)|(?:M(?:i(?:c(?:h(?:e(?:\\xE1[sš]|a[sš]|e)|a(?:[a\\xE1][sš]|h))|ah)|\\-?c(?:h\\xEA|a)|hej|queas|(?:ch(?:\\xE4|ae)|qu[e\\xE9]i)as|k(?:e(?:[a\\xE1]|ya)s|ieas|ā|a(?:s[\\s\\xa0]*(?:Bog|bok)|h))|ikaah)|īk[aā]|q|\\xEDka|y[hȟ]ej)|《(?:彌迦書|米該亞|彌|弥(?:迦书)?)》|ミカ(?:しょ|書)|미[가카]서|מיכה|ਮੀਕਾਹ|М(?:их(?:еј|а)|іх)|ม(?:ีคาห์|คา)|மீக(?:்க)?ா|م(?:یکاہ|ي|ِیکاہ)|سفر[\\s\\xa0]*ميخا|Μ(?:ΙΧΑ(?:[ΊΙ]|Ϊ́)ΑΣ|ιχαΐας|χ)|m[iī]kʰ[aā]|म(?:ी(?:काको[\\s\\xa0]*पुस्तक|खा)|िका)|(?:M(?:i(?:lkkiyaas|hei|kh|ikan[\\s\\xa0]*kirj)|eek)|Liv[\\s\\xa0]*Miche[\\s\\xa0]*)a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Micheasza|Mich\\xE9e|Prophetia[\\s\\xa0]*Michaeae|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*пророк[\\s\\xa0]*Михе[ий]|пророка[\\s\\xa0]*М[иі]хея)|M(?:i(?:c(?:h(?:ea|a)?|a)?|[hq]|k(?:ea|a)?|lk|ika?)|\\xEDk)|미[가카]?|ミカ|Мих|மீக்|मीका|ମ(?:ୀଖା[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ|ିଖା))|(?:Mikas)|(?:(?:弥迦书|彌迦書)》|[弥彌]》|ମୀଖା|米該亞》|《(?:彌迦書|米該亞|弥迦书)|m[iī]k[aā]|ميخا|М(?:ихе[ийя]|іхея)|Μιχα[ίι]ας|《[弥彌]|Mi(?:che(?:asza)?|ikan))|(?:彌迦書|米該亞|彌|弥(?:迦书)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zech"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ze(?:ch[ae]|ka)riah)|(?:즈(?:카르야서|가리야)|ศคย|슥|스가랴서|זכריה|[セゼ]カリヤ(?:しょ|書)|《(?:撒(?:迦利(?:亚书|亞書|亞)|加利亞書)|[亚亞]|匝加利亞)》|ਜ(?:਼ਕਰ[ਜਯ]|ਕਰਯ)ਾਹ|Захар(?:і[ий]|ија)|Ζ(?:αχαρ[ίι]ας|χ)|jakʰary[aā]|jakariy[aā]|Cakariy[aā]|ச(?:ெக்)?கரியா|سفر[\\s\\xa0]*زكريا|ز(?:َكَرِيّا|کریاہ|ك)|เศคาริยาห์|Z(?:a(?:ch(?:ar(?:i(?:\\xE1[sš]|[eh]|a[hsš])|j[a\\xE1][sš]|ah)|er(?:ia?|a)h)|harij?a|ȟarij|karia(?:s['’][\\s\\xa0]*Bog|h))|ech[ae]ri[ah]|ch|ech[ae]rah)|(?:Z(?:ach(?:ar(?:a[ai]|ii)|er(?:a[ai]|ii))|ech(?:[ae]ra[ai]|[ae]rii))|zakari?yā)h|Jakaryah|Zakari\\xE1s|Zacar[i\\xED]as|S(?:a(?:kar(?:ja(?:boken|s[\\s\\xa0]*bok)|ias)|car[i\\xED]as)|ekaryaah)|ज(?:क(?:र(?:ियाको[\\s\\xa0]*पुस्तक|्याह)|यार्ह)|ख[रऱ]्या)|(?:X(?:\\xEA\\-?c|a\\-?ch)a\\-?ri\\-?|Liv[\\s\\xa0]*Zakari[\\s\\xa0]*|Zakkaariyaas|Z(?:a(?:cc|kh)|ek)ari|S(?:a(?:kar(?:jan[\\s\\xa0]*kirj|\\xED)|charj)|echarei))a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Zachariasza|Zaccharie|Prophetia[\\s\\xa0]*Zachariae|Закария|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*Захарии|Захарі[ії]|пророка[\\s\\xa0]*Захарія|на[\\s\\xa0]*пророк[\\s\\xa0]*Захария)|Z(?:a(?:c(?:h(?:aria|eria)?|ar|ch?)?|h(?:arij)?|k(?:aria|k)?)?|e(?:ch?|k)|c)|[セゼ]カリヤ|스가랴|즈카|За[кх]|Ζαχ?|ச(?:கரி|ெக்)|زکریا|S(?:a(?:k(?:ar[ij]a)?|ch)|e(?:ch|k))|जकरिया|ଯିଖରିୟ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:撒(?:迦利(?:亞書?|亚书)|加利亞書)》|(?:[亚亞]|匝加利亞)》|زكريا|ଯିଖରିୟ|《(?:撒(?:迦利(?:亚书|亞書)|加利亞書)|[亚亞]|匝加利亞)|Захар(?:і[яії]|и[ия])|Sakarjan|Xa\\-?cha\\-?ri|撒(?:迦利(?:亞書?|亚书)|加利亞書)|[亚亞]|匝加利亞|《撒迦利亞|Xa|Za(?:kari(?:as)?|chariasza)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zeph"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:스바(?:니야|냐)서|ศฟย|습|צפניה|《(?:西番雅[书書]|番|索福尼亞)》|صفنیاہ|[セゼ](?:ファニ(?:ヤ(?:しょ|書)|ア書)|[ハパ]ニヤ書)|ਸਫ਼ਨਯਾਹ|С(?:офони(?:ј[ае]|й)|ефанија)|Σ(?:οφον[ίι]ας|φν)|เศฟันยาห์|செப்பனியா|سفر[\\s\\xa0]*صفنيا|sapʰany[aā]|Ceppa[nṉ]iy[aā]|X\\xF4\\-?ph\\xF4\\-?ni|Z(?:e(?:phan(?:ia[hs]|aiah)|faniah)|(?:a(?:ph|f)ania|p)h)|Liv[\\s\\xa0]*Sofoni[\\s\\xa0]*an|Zof[o\\xF3]ni[a\\xE1]s|Zepanias|(?:sa[fp]an|ṣafani)yāh|Zefanias’[\\s\\xa0]*Bog|S(?:o(?:fon(?:i(?:\\xE1[sš]|e|j[ae]|a[sš])|j[a\\xE1][sš]|\\xEDas)|phoni(?:as|e))|z(?:efani[a\\xE1]|ofoni[a\\xE1])s|f|apanyah|e(?:fan(?:ias['’][\\s\\xa0]*Bog|yaah|jas[\\s\\xa0]*bok)|p(?:anias|h)))|स(?:पन्याहको[\\s\\xa0]*पुस्तक|फन्या)|(?:S(?:ef(?:an(?:jan[\\s\\xa0]*kirj|\\xED|ij)|fanei)|\\xF4\\-?ph\\xF4\\-?ni\\-?|ofonaas)|Ze(?:fan[jy]|phanj)|X\\xEA\\-?pha\\-?ni\\-?|[TŢȚ]efani)a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Sofoniasza|Pro(?:roctwo[\\s\\xa0]*Sofoniaszow|phetia[\\s\\xa0]*Sophonia)e|Софонія|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*Софон(?:і[ії]|ии)|на[\\s\\xa0]*пророк[\\s\\xa0]*Софония)|Z(?:e(?:p(?:h(?:an(?:aia|ia)?)?)?|f(?:ania)?)|a(?:ph|f)ania|p)|[セゼ](?:ファ(?:ニア)?|[ハパ]ニヤ)|스바(?:니야|냐)?|صف|[TŢȚ]ef|Соф|செப்|S(?:o(?:f(?:o(?:nia)?)?|ph)|zof|e(?:f(?:an[ij]a|f)?|pania))|सपन(?:्याह)?|ସିଫନିୟ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:(?:西番雅[书書]|番)》|صفنيا|X\\xF4|索福尼亞》|《(?:西番雅[书書]|索福尼亞|番)|ସିଫନିୟ|Софон(?:и[ия]|і[ії])|sapanyah|Zefanias|西番雅[书書]|番|索福尼亞|S(?:efan(?:ias|jan)|\\xF4\\-?ph\\xF4\\-?ni|ofoni(?:asza)?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Luke"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:누가복음서)|(?:Lu(?:k[a\\xE1]c|uko)s)|(?:ล(?:ูกา|ก)|누가복음|눅|Л(?:ук[aо]|к)|루카[\\s\\xa0]*복음서|《(?:路(?:加福音)?|魯喀)》|Λ(?:ουκ[άα]ς|κ)|Ł(?:ukasz|k)|ルカ(?:[伝書]|福音書|[の傳]福音書|による福音書)|إنجيل[\\s\\xa0]*لوقا|Κατ[άα][\\s\\xa0]*Λουκ[άα]ν|ਲੂਕਾ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਇੰਜੀਲ|لُ?وقا[\\s\\xa0]*کی[\\s\\xa0]*انجیل|พระวรสารนักบุญลูค|הבשורה[\\s\\xa0]*על(?:\\-?פי[\\s\\xa0]*לוקא?|[\\s\\xa0]*פי[\\s\\xa0]*לוק)ס|ଲୂକ[\\s\\xa0]*ଲିଖିତ[\\s\\xa0]*ସୁସମାଗ୍ଭର|L(?:u(?:kasevangeliet|c)|ik|c)|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*Luky|லூக்கா[\\s\\xa0]*(?:எழுதிய[\\s\\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|От[\\s\\xa0]*Лука[\\s\\xa0]*свето[\\s\\xa0]*Евангелие|Євангеліє[\\s\\xa0]*від[\\s\\xa0]*Луки|Євангеліє[\\s\\xa0]*від[\\s\\xa0]*Лу[\\s\\xa0]*ки|Євангелія[\\s\\xa0]*від[\\s\\xa0]*Луки|Євангелі[яє][\\s\\xa0]*від[\\s\\xa0]*св[\\s\\xa0]*Луки|Євангелі[яє][\\s\\xa0]*від[\\s\\xa0]*св\\.[\\s\\xa0]*Луки|Јеванђеље[\\s\\xa0]*по[\\s\\xa0]*Луки|Еван(?:гелие(?:[\\s\\xa0]*(?:според[\\s\\xa0]*Лука|от[\\s\\xa0]*Лук[аи])|то[\\s\\xa0]*според[\\s\\xa0]*Лука)|ђеље[\\s\\xa0]*по[\\s\\xa0]*Луки)|ल(?:ूका(?:(?:ले[\\s\\xa0]*लेखे)?को[\\s\\xa0]*सुसमाचार|ने[\\s\\xa0]*लिहिलेले[\\s\\xa0]*शुभवर्तमान)|ुका)|L[u\\xFA]kasargu\\xF0spjall|l(?:ū(?:kāle[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]r|(?:qā[\\s\\xa0]*kī[\\s\\xa0]*in|kā[\\s\\xa0]*dī[\\s\\xa0]*ĩ)jīl|kale[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]r)|uk[aā]le[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]r)|L(?:u(?:kk[aā][\\s\\xa0]*Na[rṛ]ceyt|ukkaan[\\s\\xa0]*evankelium)|ūkk[aā][\\s\\xa0]*Na[rṛ]ceyt)i|Jevanđelje[\\s\\xa0]*po[\\s\\xa0]*Luki|Luk(?:a(?:s(?:ovo)?|šovo)|\\xE1[sš]ovo)[\\s\\xa0]*evangelium|l(?:ūk(?:āne[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā]|ane[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā])|uk[aā]ne[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā])n|(?:Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Luc|Injili[\\s\\xa0]*ya[\\s\\xa0]*Luk|L(?:u(?:qaas|\\-?c)|(?:lu|oo)k))a|E(?:van(?:gelium[\\s\\xa0]*(?:podle[\\s\\xa0]*Luk[a\\xE1][sš]e|secundum[\\s\\xa0]*Lucam)|[\\xF0đ]elje[\\s\\xa0]*po[\\s\\xa0]*Luki|keliumi[\\s\\xa0]*Luukkaan[\\s\\xa0]*mukaan|jelium[\\s\\xa0]*Pod[lľ]a[\\s\\xa0]*Luk[a\\xE1][sš]a)|w(?:angelia[\\s\\xa0]*(?:w(?:edług[\\s\\xa0]*[sś]w\\.?|g[\\s\\xa0]*[sś]w\\.?)[\\s\\xa0]*)?|\\.?[\\s\\xa0]*)Łukasza)|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:uke|k)|[\\s\\xa0]*L(?:uke|k))|aint[\\s\\xa0]*L(?:uke|k))|L(?:uke|k))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:uke|k)|[\\s\\xa0]*L(?:uke|k))|aint[\\s\\xa0]*L(?:uke|k))|L(?:uke|k)))|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Luk?|[\\s\\xa0]*Luk?)|aint[\\s\\xa0]*Luk?)|Luk?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Luk?|[\\s\\xa0]*Luk?)|aint[\\s\\xa0]*Luk?)|Luk?))|L(?:u(?:k(?:\\xE1[sš]|aš)|q|uk)|\\xFAk|lu)?|Лук|누가|루카[\\s\\xa0]*복음|Λουκ|ルカ|لو|லூ(?:க்)?|लूका?|Ew[\\s\\xa0]*Łuk|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Luk[e\\xEB]s|(?:E(?:vangeliet[\\s\\xa0]*etter[\\s\\xa0]*Luk|l[\\s\\xa0]*Evangelio[\\s\\xa0]*de[\\s\\xa0]*Luc)|Sulat[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Luc|Injil[\\s\\xa0]*Luk)as|Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Lu[ck]as|Ebanghelyo[\\s\\xa0]*ni[\\s\\xa0]*San[\\s\\xa0]*Lu[ck]as|Ebanghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*Lu[ck]|Lu[ck])as|Mabuting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*Lu[ck]|Lu[ck])as)|(?:ଲୂକ|루카|ਲੂਕਾ|לוקס|لُ?وقا|《(?:路加福音|魯喀)|魯喀》|路(?:加福音)?》|लूका[नल]े|லூக்கா|l(?:ūk(?:ā[ln]|a[ln])|uk[aā][ln])e|Лук[аи]|От[\\s\\xa0]*Лук[аи]|Від[\\s\\xa0]*Луки|Łukasza|L(?:u(?:k(?:\\xE1[sš]a|k[aā]|e|a[sš]a)|cas|ukkaan)|ūkk[aā]|k)|San[\\s\\xa0]*Lucas|Evangelio[\\s\\xa0]*de[\\s\\xa0]*Lucas|路(?:加福音)?|《路|魯喀|lūkā|Łuk|Lu(?:k(?:as?)?|ca)?|St[\\s\\xa0]*L(?:u(?:ke?)?|k)|St\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|Saint[\\s\\xa0]*L(?:u(?:ke?)?|k)|Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k)))))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jer"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ieremias|Jeramiah)|(?:Ἰε|렘|ار|ยรม|[ИЙ]ер|예레미(?:야서|아)|ヱレミヤ記|エレミヤ書|ﺃﺭﻣﻴﺎء|《耶(?:利米[书書]|肋米亞)?》|ירמיהו|ஏரேமியா|یرمِ?یاہ|ਯਿਰਮਿਯਾਹ|Еремија|Јеремија|Ιερεμ[ίι]ας|Er[eē]miy[aā]|أرميا|سفر[\\s\\xa0]*إرميا|เยเรมีย(?:าห)?์|Gr|Liv[\\s\\xa0]*Jeremi[\\s\\xa0]*an|Liber[\\s\\xa0]*Ieremiae|J(?:er(?:em(?:i(?:a(?:s['’][\\s\\xa0]*Bog|š)|\\xE1[sš]|e|ha)|j[a\\xE1][sš]|\\xEDas|ai?h)|\\xE9mie|imih|am(?:ah|ia)|amiha)|\\xE9r[e\\xE9]mie|r)|य(?:र्मियाको[\\s\\xa0]*पुस्तक|िर्मयाह)|(?:Jer(?:im(?:i[ai]|a)|m[im]a|a(?:m[ai]i|ia)|em(?:aia|ii))|Y(?:eremya|irmay)a)h|Jeremias[\\s\\xa0]*bok|y(?:irm(?:ay(?:āh|a)|iyāh)|armiy[aā]ko[\\s\\xa0]*pustak)|H[ei]r[ei]m[iy]as|Sulat[\\s\\xa0]*ni[\\s\\xa0]*Jeremias|(?:(?:Y(?:\\xE9r[e\\xE9]|er\\xE9)|Iere|Gere)mi|Ermmaas|Yeremi|Gi\\xEA\\-?r\\xEA\\-?mi\\-?|Jerem(?:i(?:an[\\s\\xa0]*kir)?j|ei))a|Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Jeremiasza|Aklat[\\s\\xa0]*ni[\\s\\xa0]*Jeremia[hs]|Єремія|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*(?:Єремі[ії]|Иеремии)|на[\\s\\xa0]*пророк[\\s\\xa0]*(?:[ИЙ]е|Е)ремия)|எரேமியா[\\s\\xa0]*தீர்க்கதரிசியின்[\\s\\xa0]*புத்தகம்|J(?:e(?:r(?:e(?:m(?:i[ah]|\\xEDa)?)?|\\xE9m|amih)?)?|\\xE9(?:r[e\\xE9]m|r)?)|예레(?:미야)?|エレミヤ|ירמיה|Єр|ஏரே|Ер|Јер|Ιε|Erm|Yer|Ier|Ger|य(?:िर्म(?:या)?|र्मिया)|yirmayā|எரே|ଯିରିମିୟ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:《耶(?:利米[书書]|肋米亞)|إرميا|耶(?:利米[书書]|肋米亞)?》|Єремі[ії]|ଯିରିମିୟ|Иереми[ия]|Еремия|Йеремия|எரேமியா|यर्मियाको|Gi\\xEA\\-?r\\xEA\\-?mi|yarmiy[aā]ko|耶(?:利米[书書]|肋米亞)?|《耶|Gi\\xEA|Jeremi(?:a(?:s(?:za)?|[hn]))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:(?:2(?:[\s\xa0]*(?:Corint(?:h(?:i(?:e[nr]|na|on|ain)|ai?n)|ion|(?:i[e\xEB]|hi\xEB)r)|Korint(?:i\xEBr|o|hi\xEBr))|(?:\.[\s\xa0]*(?:Corint(?:hi[e\xEB]|i[e\xEB])|Korinth?i\xEB)|e\.?[\s\xa0]*Korint(?:hi[e\xEB]|i[e\xEB]))r|\.[\s\xa0]*Korinto)|(?:Tweede[\s\xa0]*Korint(?:hi[e\xEB]|i[e\xEB])|II\.?[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB]))r|2[\s\xa0]*Corinth(?:ia|o|ai)an|2[\s\xa0]*Corinth[io]ian|(?:II\.?[\s\xa0]*C|2\.?[\s\xa0]*C)orthian)s|2(?:[\s\xa0]*(?:Korint(?:(?:asv|ern)e|anom|usi|ier(?:ne|s)|i?erbrevet|h(?:ier(?:brevet|s)|erbrevet))|Corint(?:h(?:i(?:[no]s|aid)|e)|ios))|\.[\s\xa0]*Korint(?:erbrevet|usi))|2[\s\xa0]*Corinthian[ao]?s|2nd[\s\xa0]*Cor(?:inthian[ao]?|thian)s|2nd\.[\s\xa0]*Cor(?:inthian[ao]?|thian)s|Second[\s\xa0]*Cor(?:inthian[ao]?|thian)s|2\.?[\s\xa0]*Korinthusiakhoz|M[a\xE1]sodik[\s\xa0]*Korinthusiakhoz)|(?:(?:2(?:(?:nd)?[\s\xa0]*|nd\.[\s\xa0]*)|Second[\s\xa0]*)Corthian)|(?:2(?:\.?[\s\xa0]*Коринтяните|\.?[\s\xa0]*Коринтяни|\-?(?:[ае]\.?|ге\.?)[\s\xa0]*Коринтяни)|II(?:\.?[\s\xa0]*Коринтяните|\.?[\s\xa0]*Коринтяни)|Друг[ае][\s\xa0]*Коринтяни)|(?:《(?:林[后後]|适凌爾福後|[格歌]林多後書|哥林多(?:后书|後書))》|고후|Ⅱ[\s\xa0]*コリント人へ|コリント(?:人への(?:手紙[Ⅱ二]|後の書|第二の手紙)|[\s\xa0]*2|後書|の信徒への手紙二)|Β['ʹʹ΄’][\s\xa0]*Κορινθ[ίι]ους|كورنثوس[\s\xa0]*الثانية|고린도[2후]서|코린토(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*둘째[\s\xa0]*서간|2서)|Προς[\s\xa0]*Κορινθ[ίι]ους[\s\xa0]*Β['ʹʹ΄’]|ਕੁਰਿੰਥੀਆਂ[\s\xa0]*ਨੂੰ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੱਤ੍ਰੀ|ה(?:איגרת[\s\xa0]*השנייה[\s\xa0]*אל[\s\xa0]*הקורי|שנייה[\s\xa0]*אל[\s\xa0]*הקור)נתים|אגרת[\s\xa0]*פולוס[\s\xa0]*השנייה[\s\xa0]*אל\-?הקור(?:נתים|ינ)|Epistula[\s\xa0]*ad[\s\xa0]*Corinthios[\s\xa0]*II|Wakorintho[\s\xa0]*II|Tweede[\s\xa0]*Corinthe|କରିନ୍ଥୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|kur(?:intʰiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|ĩtʰīāṃ[\s\xa0]*nū̃[\s\xa0]*dūjī[\s\xa0]*pattrī)|पौलाचे[\s\xa0]*करिंथकरांस[\s\xa0]*दूसरे[\s\xa0]*पत्र|क(?:ोरिन्थीहरूलाई[\s\xa0]*(?:पावलको[\s\xa0]*दोस|दोस्त)्रो|रिंथकरांस[\s\xa0]*दुसरे)[\s\xa0]*पत्र|S[i\xED]\xF0ara[\s\xa0]*K[o\xF3]rintubr[e\xE9]f|ک(?:رنتھ(?:ِیُوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|یوں[\s\xa0]*کے[\s\xa0]*نام)|ُرِنتھِیوں[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|الرسالة[\s\xa0]*الثانية[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*كورنثوس|رسالة[\s\xa0]*بولس[\s\xa0]*الرسول[\s\xa0]*الثانية[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*كورنثوس|Korintos[\s\xa0]*Labaad|Druh[ay\xE1\xFD]K|Tweede[\s\xa0]*Korinthe|Second[\s\xa0]*Corinthian|கொரிந்தியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டா(?:வது[\s\xa0]*(?:திருமுக|நிருப)|ம்[\s\xa0]*(?:திருமுக|கடித))ம்|Second[\s\xa0]*Corth|(?:(?:دوم|۲)\-?کُرِنتھِ|(?:دوم|۲)۔کرنتھ)یوں|(?:دوم|۲)[\s\xa0]*ک(?:رنتھ(?:ِیُ|ی)|ُرنتھِی)وں|ଦ୍ୱିତୀୟ[\s\xa0]*କରିନ୍ଥୀୟଙ୍କ|And(?:e(?:[nt][\s\xa0]*Korinth|n[\s\xa0]*Korint)|re[\s\xa0]*korint)erbrev|Dezy[e\xE8]m[\s\xa0]*Korint|Andra[\s\xa0]*Korint(?:hi?|i)?erbrevet|2(?:[\s\xa0]*(?:கொரிந்தியர்|ค[ธร]|قور|ਕੁਰਿੰਥੀਆਂ[\s\xa0]*ਨੂੰ|Cor(?:inti?o|th)|करिंथकरांस|kurĩtʰīāṃ|Korint(?:i(?:yarukku|o)|[ao]))|e(?:\.[\s\xa0]*[CK]|[\s\xa0]*[CK])orinthe|كو|코린|nd\.?[\s\xa0]*Corinthian|nd\.?[\s\xa0]*Corth|[\s\xa0]*โครินธ์|(?:\-?کُرِنتھِ|۔کرنتھ)یوں|[\s\xa0]*ک(?:رنتھ(?:ِیُ|ی)|ُرنتھِی)وں|[\s\xa0]*କରିନ୍ଥୀୟଙ୍କ|(?:\-?е\.?[\s\xa0]*Коринф|[\s\xa0]*Коринф)янам|(?:[ея]\.?|\-?я\.?)[\s\xa0]*Коринфянам|(?:[ея]\.?|\-?я\.?)[\s\xa0]*к[\s\xa0]*Коринфянам|(?:\-?е\.?)?[\s\xa0]*к[\s\xa0]*Коринфянам|[\s\xa0]*कुर(?:िन्(?:यि़|थि)|न्थि)यों|[\s\xa0]*कोरिन्(?:थीहरूलाई|‍थी)|[\s\xa0]*korintʰ[iī]har[uū]l[aā][iī]|[\s\xa0]*Korinth?erbrev|\.(?:[\s\xa0]*(?:ک(?:رنتھ(?:ِیُ|ی)|ُرنتھِی)وں|โครินธ์|କରିନ୍ଥୀୟଙ୍କ|Коринфянам|к[\s\xa0]*Коринфянам|क(?:ुर(?:िन्(?:यि़|थि)|न्थि)यों|ोरिन्(?:थीहरूलाई|‍थी))|korintʰ[iī]har[uū]l[aā][iī]|Korint(?:h(?:ier(?:brevet|s)|erbrevet)|i(?:ers|o)|erbrev|o|ierbrevet))|(?:\-?کُرِنتھِ|۔کرنتھ)یوں))|SECOND[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinto|(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa|Pili|2\.?)[\s\xa0]*Wakorinto|2[\s\xa0]*C\xF4(?:\-?rinh\-?|rin)t\xF4|(?:M[a\xE1]sodik[\s\xa0]*Korintus|Seconda[\s\xa0]*Corinz|Second(?:a[\s\xa0]*lettera[\s\xa0]*ai|o)[\s\xa0]*Corinz|2(?:\xB0\.?)?[\s\xa0]*Corinz|2[\s\xa0]*Corinten)i|2[\s\xa0]*Corintie(?:ni|r)|(?:2(?:[\s\xa0]*(?:Corint(?:hi[e\xEB]|i\xEB)|Qo|Korint(?:hi[e\xEB]|i[e\xEB]))|e(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)i[e\xEB]|[CK]o|\.[\s\xa0]*Korinth?i\xEB)|(?:Zweite[\s\xa0]*Korinth|Andre[\s\xa0]*Korint)e|Pili[\s\xa0]*Ko|Tweede[\s\xa0]*Korinth?i[e\xEB])r|(?:Second|2nd\.?)[\s\xa0]*Corinthins|(?:2(?:[\s\xa0]*(?:kari[mṃ]tʰkar[aā][mṃ]|Korinth?u)|e\.?[\s\xa0]*Corinthien|\.[\s\xa0]*Korinth?u)|M[a\xE1]sodik[\s\xa0]*Korinthu|Epistula[\s\xa0]*II[\s\xa0]*ad[\s\xa0]*Corinthio|(?:2(?:[ao](?:\.[\s\xa0]*Cor[i\xED]|[\s\xa0]*Cor[i\xED])|[\s\xa0]*Cor\xED|\xBA\.?[\s\xa0]*Cori|\.[o\xBA]\.?[\s\xa0]*Cori)|Segund[ao][\s\xa0]*Cor[i\xED])ntio|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornthin|(?:2(?:nd\.?)?|Second)[\s\xa0]*Corithin|(?:Second|2nd\.?)[\s\xa0]*Corinthina|(?:2(?:nd\.?)?|Second)[\s\xa0]*Chorinthin|(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Corni|(?:Second|2nd\.?)[\s\xa0]*Corin)thai?n|(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornin|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cori)than|2[\s\xa0]*Corinith(?:ina|an)|(?:Second|2nd\.?)[\s\xa0]*Corinith(?:ina|an))s|(?:2(?:nd(?:\.[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao])|[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao]))|(?:d(?:e\.?|\.)?|\xE8me\.?|eme\.?)[\s\xa0]*Corinthie|[\s\xa0]*Corintia)|Deuxi(?:[e\xE8]mes[\s\xa0]*|[e\xE8]me[\s\xa0]*)Corinthie|Second[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao])|(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Corrin?|(?:2(?:nd\.?)?|Second)[\s\xa0]*Chorin)thai|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornthai|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornthia|(?:2(?:nd\.?)?|Second)[\s\xa0]*Corithia|(?:2(?:nd\.?)?|Second)[\s\xa0]*Chorinthia|(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Corni|(?:Second|2nd\.?)[\s\xa0]*Corin)thaia|(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornin|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cori)thai|2[\s\xa0]*Corinith(?:ai|ia)|(?:Second|2nd\.?)[\s\xa0]*Corinith(?:ai|ia))ns|(?:(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Corrin?th|(?:Second|2nd\.?)[\s\xa0]*Corinthi|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornin?th|(?:2(?:nd\.?)?|Second)[\s\xa0]*Cornthi)i|(?:2(?:nd\.?)?|Second)[\s\xa0]*Corith(?:ii|o)|(?:2(?:nd\.?)?|Second)[\s\xa0]*Chorithi|(?:2(?:nd(?:\.[\s\xa0]*Corin[an]|[\s\xa0]*Corin[an])|[\s\xa0]*Corin[an])|Second[\s\xa0]*Corin[an]|(?:2(?:nd\.?)?|Second)[\s\xa0]*Chorn|(?:(?:2(?:nd\.?)?|Second)[\s\xa0]*Ch|(?:2(?:nd\.?)?|Second)[\s\xa0]*C)oran)thi)ans|(?:Second|2nd\.?)[\s\xa0]*Corinthoi?ans|(?:2(?:nd\.?)?|Second)[\s\xa0]*Coriinthii?ans|2\.[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:\xEBr|os|ns|er|a(?:id|ns))|e)|i(?:e(?:ni|r)|os)|eni|o|i\xEBr)|zi)|(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)s|(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:(?:rin?tha|ntha)i|nthia|nithaia|ninthai)n|\xEDntio|nthin|nithai?n|ninthan|(?:(?:nin?|rin?)th|nthi|anth)ian)s)|\xF4(?:\-?rinh\-?|rin)t\xF4|horinthins|horinth(?:ai|ia)ns|hor(?:a?n|i)thians)|(?:Barua[\s\xa0]*ya[\s\xa0]*Pili[\s\xa0]*kwa[\s\xa0]*Wakorinth|SECOND[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti|(?:Waraka[\s\xa0]*wa[\s\xa0]*Pili[\s\xa0]*kwa|Pili|2\.?)[\s\xa0]*Wakorinth)o|2\.?[\s\xa0]*Mga[\s\xa0]*Taga\-?Corinto|2(?:\.[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?)|[\s\xa0]*(?:Mga[\s\xa0]*Taga\-?[\s\xa0]*|Taga\-?))Corinto|(?:Drug[ai]|2\.?)[\s\xa0]*Korynt[o\xF3]w|(?:(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Korint|[y\xFD][\s\xa0]*list[\s\xa0]*Korin|[ay\xE1\xFD][\s\xa0]*Korint|[a\xE1][\s\xa0]*kniha[\s\xa0]*Korint)|2(?:[\s\xa0]*(?:k\.?[\s\xa0]*)?|\.[\s\xa0]*)Korint|Druh[a\xE1][\s\xa0]*list[\s\xa0]*Korint?|2\.?[\s\xa0]*list[\s\xa0]*Korint?)sk[y\xFD]|Korintiyarukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]vatu[\s\xa0]*Nirupa)m|(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Korint|[ay\xE1\xFD][\s\xa0]*Korint|[a\xE1][\s\xa0]*kniha[\s\xa0]*Korint)|2[\s\xa0]*k\.?[\s\xa0]*Korint|2\.[\s\xa0]*Korint|(?:Druh(?:[y\xFD][\s\xa0]*list[\s\xa0]*Ko|[ay\xE1\xFD][\s\xa0]*Ko|[a\xE1][\s\xa0]*kniha[\s\xa0]*Ko)|2(?:[\s\xa0]*(?:k\.?[\s\xa0]*)?|\.[\s\xa0]*)Ko)rinť)anom|2e\.?[\s\xa0]*Corinthiers|2e\.?[\s\xa0]*Corinthi\xEBrs|(?:Tweede[\s\xa0]*Corinth?|2e\.?[\s\xa0]*Corint)i[e\xEB]rs|(?:k(?:orintʰ[iī]har[uū]l[aā][iī][\s\xa0]*dostro|ari[mṃ]tʰkar[aā][mṃ]s[\s\xa0]*dusre)[\s\xa0]*patr|Naa77antto[\s\xa0]*Qoronttoos|S[i\xED]\xF0ara[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Korintumann|Pavlova[\s\xa0]*druga[\s\xa0]*poslanica[\s\xa0]*Korin[cć]anim|Druga[\s\xa0]*poslanica[\s\xa0]*Korin\xE6anim)a|(?:2(?:\.[\s\xa0]*Korin[cć]|[\s\xa0]*Korin[cć])|Druga[\s\xa0]*Korin[cć])anima[\s\xa0]*Poslanica|(?:(?:Paulus(?:’[\s\xa0]*(?:Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth|andre[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*korint)|\'[\s\xa0]*Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth)|And(?:re[\s\xa0]*Korinti|en[\s\xa0]*Korint))ern|2(?:[\s\xa0]*(?:[ei](?:\.[\s\xa0]*Korin?|[\s\xa0]*Korin?)|Kori)tasv|\.[\s\xa0]*Kori(?:nt(?:asv|ern|iern)|tasv))|(?:Toinen|2\.?)[\s\xa0]*Korinttolaiskirj)e|(?:Toinen|2\.?)[\s\xa0]*Korinttilaisille|(?:Toinen|2\.?)[\s\xa0]*Kirje[\s\xa0]*korinttilaisille|(?:2(?:[\s\xa0]*(?:Kurinthiayo|Corinthia)|\.[\s\xa0]*Kurinthiayo)|(?:Dezy[e\xE8]m|2\.?)[\s\xa0]*Korentye)n|(?:Druhe[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*korynfj|2\.[\s\xa0]*Corthi|(?:Drug[ai]|2\.?)[\s\xa0]*Korynti)an|2\.?[\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|Drug[ai][\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|(?:Drug[ai]|2\.?)[\s\xa0]*List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|(?:Друга|2\.?)[\s\xa0]*Коринћанима|(?:(?:(?:2(?:\-?(?:а\.?|е\.?|ге\.?)|\.)?|Друг[ае])[\s\xa0]*до|2\-?(?:ге\.?|а\.?)|Друг[ае])[\s\xa0]*коринт|2(?:\-?е\.?|\.)?[\s\xa0]*коринт|Друга[\s\xa0]*Коринф|(?:2(?:\-?(?:а\.?|е\.?|ге\.?)|\.)?|Друг[ае])[\s\xa0]*Послання[\s\xa0]*до[\s\xa0]*Коринт)ян|(?:2\-?(?:ге\.?|а\.?)|Друге)[\s\xa0]*Коринфян|(?:2\-?(?:а\.?[\s\xa0]*п|е\.?[\s\xa0]*п|ге\.?[\s\xa0]*п)|Друге[\s\xa0]*п)ослання[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|Друга[\s\xa0]*послан(?:ня[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|ица[\s\xa0]*Коринћанима)|2\.?[\s\xa0]*послан(?:ня[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|ица[\s\xa0]*Коринћанима)|I(?:I(?:\.[\s\xa0]*(?:C(?:or(?:i(?:n(?:t(?:h(?:i(?:\xEBr|os|ns|er|a(?:id|ns))|e)|i(?:e(?:ni|r)|os)|eni|o|i\xEBr)|zi)|(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)s|(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:(?:rin?tha|ntha)i|nthia|nithaia|ninthai)n|\xEDntio|nthin|nithai?n|ninthan|(?:(?:nin?|rin?)th|nthi|anth)ian)s)|\xF4(?:\-?rinh\-?|rin)t\xF4|horinthins|horinth(?:ai|ia)ns|hor(?:a?n|i)thians)|Wakorinto|Wakorintho|Mga[\s\xa0]*Taga\-?[\s\xa0]*Corinto|list[\s\xa0]*Korint?sk[y\xFD]m|K(?:or(?:in(?:t(?:sk[y\xFD]m|usi|io|anom|os|i[e\xEB]rs|h(?:i[e\xEB]rs|e|usiakhoz))|ťanom|[cć]anima[\s\xa0]*Poslanica)|ynt[o\xF3]w|inttolaiskirje|inttilaisille)|irje[\s\xa0]*korinttilaisille)|Korentyen|(?:Korynt|Corth)ian|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|Коринћанима|(?:(?:до[\s\xa0]*)?коринт|Коринф|Послання[\s\xa0]*до[\s\xa0]*Коринт)ян|послан(?:ня[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|ица[\s\xa0]*Коринћанима))|[\s\xa0]*(?:C(?:or(?:i(?:n(?:t(?:h(?:i(?:\xEBr|os|ns|er|a(?:id|ns))|e)|i(?:e(?:ni|r)|os)|eni|o|i\xEBr)|zi)|(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)s|(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:(?:rin?tha|ntha)i|nthia|nithaia|ninthai)n|\xEDntio|nthin|nithai?n|ninthan|(?:(?:nin?|rin?)th|nthi|anth)ian)s)|\xF4(?:\-?rinh\-?|rin)t\xF4|horinthins|horinth(?:ai|ia)ns|hor(?:a?n|i)thians)|Wakorinto|Wakorintho|Mga[\s\xa0]*Taga\-?[\s\xa0]*Corinto|list[\s\xa0]*Korint?sk[y\xFD]m|K(?:or(?:in(?:t(?:sk[y\xFD]m|usi|io|anom|os|i[e\xEB]rs|h(?:i[e\xEB]rs|e|usiakhoz))|ťanom|[cć]anima[\s\xa0]*Poslanica)|ynt[o\xF3]w|inttolaiskirje|inttilaisille)|irje[\s\xa0]*korinttilaisille)|Korentyen|(?:Korynt|Corth)ian|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|Коринћанима|(?:(?:до[\s\xa0]*)?коринт|Коринф|Послання[\s\xa0]*до[\s\xa0]*Коринт)ян|послан(?:ня[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|ица[\s\xa0]*Коринћанима)))|ka(?:(?:[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*C|lawang[\s\xa0]*[CK]|\-?[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*C)orinti|(?:[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*C|lawang[\s\xa0]*[CK]|\-?[\s\xa0]*2[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*C)orint|lawang[\s\xa0]*Mga[\s\xa0]*Taga\-?[\s\xa0]*Corint)o)|(?:II\.?[\s\xa0]*Коринт|2\.?[\s\xa0]*Коринт)јани|(?:II(?:\.[\s\xa0]*Корин[кќ]|[\s\xa0]*Корин[кќ])|2(?:\.[\s\xa0]*Корин[кќ]|[\s\xa0]*Корин[кќ]))аните|2(?:[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h|i)?|i)?)?)?|கொ(?:ரி)?|Kor(?:int(?:her?|er)?)?)|nd(?:\.[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?|[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?)|e\.?[\s\xa0]*Kor|[\s\xa0]*କରିନ୍ଥୀୟ|\-?е\.?[\s\xa0]*Коринфян|[\s\xa0]*Кор(?:инфян)?|[\s\xa0]*कुरिन्थ(?:ियो)?|[\s\xa0]*कोरिन्थी|\.[\s\xa0]*(?:Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|er|a|ier)?)?|क(?:ुरिन्थ(?:ियो)?|ोरिन्थी)|Кор(?:инфян)?|କରିନ୍ଥୀୟ))|M[a\xE1]sodik[\s\xa0]*Kor|Β['ʹʹ΄’][\s\xa0]*Κορ?|And(?:en|re)[\s\xa0]*Kor|S[i\xED]\xF0ara[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Kori|Druh[ay\xE1\xFD][\s\xa0]*K|Tweede[\s\xa0]*Kor|Second[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?|ଦ୍ୱିତୀୟ[\s\xa0]*କରିନ୍ଥୀୟ|2\.[\s\xa0]*Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?|th)?)?|2e\.?[\s\xa0]*Corinthier|2e\.?[\s\xa0]*Corinthi\xEBr|(?:Tweede[\s\xa0]*Corinth?|2e\.?[\s\xa0]*Corint)i[e\xEB]r|II(?:\.[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]r|us)|i[e\xEB]r|us|a|o)?)?|Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?|th)?)?|Кор)|[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]r|us)|i[e\xEB]r|us|a|o)?)?|Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?|th)?)?|Кор))|(?:II\.?[\s\xa0]*п|2\.?[\s\xa0]*п)исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Коринт|Втор(?:о[\s\xa0]*(?:послание[\s\xa0]*(?:на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Коринтяни|към[\s\xa0]*коринтяните)|Корин(?:т(?:яните|јани)|[кќ]аните)|Кор(?:интяни)?|писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Коринт)|а[\s\xa0]*(?:писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Коринт|Кор(?:ин(?:т(?:яните|јани)|[кќ]аните)|интяни)?)))|(?:《(?:林[后後]|适凌爾福後|[格歌]林多後書|哥林多(?:后书|後書))|(?:林[后後]|适凌爾福後)》|[格歌]林多後書》|哥林多(?:后书|後書)》|2(?:[\s\xa0]*(?:korinterbrev|ਕੁਰਿੰਥੀਆਂ)|\.[\s\xa0]*korinterbrev)|2\.?[\s\xa0]*C\xF4\-?rinh|II\.?[\s\xa0]*C\xF4\-?rinh|Corinthios[\s\xa0]*II|ad[\s\xa0]*Corinthios[\s\xa0]*II|השנייה[\s\xa0]*אל[\s\xa0]*הקורינתים|林[后後]|适凌爾福後|[格歌]林多後書|哥林多(?:后书|後書)|2\.?[\s\xa0]*C\xF4|II\.?[\s\xa0]*C\xF4|(?:II\.?|2\.?)[\s\xa0]*Korin[cć]anima|Druga[\s\xa0]*(?:poslanica[\s\xa0]*Korin[cć]|Korin[cć])anima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:(?:1(?:[\s\xa0]*(?:Cor(?:int(?:h(?:i(?:a(?:n[ao]|in)|e[nr]|na|on)|(?:i[ai]|oi?)an|a(?:ia?)?n)|ion)|thian)|Korinto)|(?:st\.?|\.)[\s\xa0]*Corthian|st\.?[\s\xa0]*Corinthian[ao])|First[\s\xa0]*Corinthian[ao]|I\.?[\s\xa0]*Korinto|(?:First[\s\xa0]*C|I\.?[\s\xa0]*C)orthian)s|1(?:[\s\xa0]*(?:Korint(?:(?:asv|ern)e|anom|usi|ier(?:ne|s)|i?erbrevet|h(?:ier(?:brevet|s)|erbrevet))|Corint(?:h(?:i(?:a(?:id|ns)|[no]s)|e)|ios))|\.[\s\xa0]*Korinterbrevet|st\.?[\s\xa0]*Corinthians)|First[\s\xa0]*Corinthians|I\.?[\s\xa0]*Korintusi|1[\s\xa0]*(?:Corint(?:i[e\xEB]|hi\xEB)|Korinth?i\xEB)rs|I(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)i[e\xEB]rs|(?:I\.?[\s\xa0]*C|1\.[\s\xa0]*C)orint(?:hi[e\xEB]|i[e\xEB])rs|1e[\s\xa0]*Korint(?:hi[e\xEB]|i[e\xEB])rs|1e\.[\s\xa0]*Korint(?:hi[e\xEB]|i[e\xEB])rs|(?:I\.?|1)[\s\xa0]*Korinthusiakhoz|E(?:erste[\s\xa0]*Korint(?:hi[e\xEB]|i[e\xEB])rs|ls[oő][\s\xa0]*Korinthusiakhoz))|(?:F(?:\xF8rste[\s\xa0]*Korinter(?:brev|ne)|irst[\s\xa0]*Corthian)|1(?:(?:st)?[\s\xa0]*|st\.[\s\xa0]*)Corthian)|(?:1(?:\.?[\s\xa0]*Коринтяните|\.?[\s\xa0]*Коринтяни|\-?(?:[ае]\.?|ше\.?)[\s\xa0]*Коринтяни)|I(?:\.?[\s\xa0]*Коринтяните|\.?[\s\xa0]*Коринтяни)|Перш[ае][\s\xa0]*Коринтяни)|(?:《(?:(?:适凌爾福|林)前|[格歌]林多前書|哥林多前[书書])》|고전|Ⅰ[\s\xa0]*コリント人へ|ﻛﻮﺭﻧﺜﻮﺱ[\s\xa0]*ﺍﻻﻭﻝ|コリント(?:人への(?:手紙[Ⅰ一]|前の書|第一の手紙)|[\s\xa0]*1|前書|の信徒への手紙一)|Α['ʹʹ΄’][\s\xa0]*Κορινθ[ίι]ους|كورنثوس[\s\xa0]*الأولى|고린도[1전]서|코린토(?:[\s\xa0]*신자들에게[\s\xa0]*보낸[\s\xa0]*첫째[\s\xa0]*서간|1서)|Προς[\s\xa0]*Κορινθ[ίι]ους[\s\xa0]*Α['ʹʹ΄’]|ਕੁਰਿੰਥੀਆਂ[\s\xa0]*ਨੂੰ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੱਤ੍ਰੀ|କରିନ୍ଥୀୟଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ה(?:איגרת[\s\xa0]*הראשונה[\s\xa0]*אל[\s\xa0]*הקורי|ראשונה[\s\xa0]*אל[\s\xa0]*הקור)נתים|אגרת[\s\xa0]*פולוס[\s\xa0]*הראשונה[\s\xa0]*אל\-?הקור(?:נתים|י)|kur(?:intʰiyōṅ[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|ĩtʰīāṃ[\s\xa0]*nū̃[\s\xa0]*pahilī[\s\xa0]*pattrī)|पौलाचे[\s\xa0]*करिंथकरांस[\s\xa0]*पहिले[\s\xa0]*पत्र|कोरिन्थीहरूलाई[\s\xa0]*प(?:ावलको[\s\xa0]*प)?हिलो[\s\xa0]*पत्र|Fyrra[\s\xa0]*Korintubr[e\xE9]f|Wakorintho[\s\xa0]*I|Epistula[\s\xa0]*ad[\s\xa0]*Corinthios[\s\xa0]*I|ک(?:رنتھ(?:ِیُوں[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|یوں[\s\xa0]*کے[\s\xa0]*نام)|ُرِنتھِیوں[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|الرسالة[\s\xa0]*الأولى[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*كورنثوس|رسالة[\s\xa0]*بولس[\s\xa0]*الرسول[\s\xa0]*الأولى[\s\xa0]*إلى[\s\xa0]*أهل[\s\xa0]*كورنثوس|Korintos[\s\xa0]*Kowaad|Prvn[i\xED]K|I(?:\.[\s\xa0]*Korint(?:i?o|he)|[\s\xa0]*Korint(?:i?o|he))|Eerste[\s\xa0]*[CK]orinthe|First[\s\xa0]*Corinthian|கொரிந்தியருக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதல(?:ா(?:வது[\s\xa0]*(?:திருமுக|நிருப))?|்[\s\xa0]*திருமுக)ம்|First[\s\xa0]*Corth|(?:(?:اوّل|۱)\-?کُرِنتھِ|(?:اوّل|۱)۔کرنتھ)یوں|(?:اوّل|۱)[\s\xa0]*ک(?:رنتھِیُ|ُرنتھِی)وں|(?:(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kw|Kwanz)a|I\.?)[\s\xa0]*Wakorinto|ପ୍ରଥମ[\s\xa0]*କରିନ୍ଥୀୟଙ୍କ|(?:Els[oő][\s\xa0]*Korintus|Prima[\s\xa0]*Corinz|Prim(?:a[\s\xa0]*lettera[\s\xa0]*ai|o)[\s\xa0]*Corinz)i|(?:I(?:\.[\s\xa0]*Korinti[e\xEB]|[\s\xa0]*Korinti[e\xEB])|(?:F\xF8rste[\s\xa0]*Korint|Erste[\s\xa0]*Korinth)e|Kwanza[\s\xa0]*Ko|(?:Eerste[\s\xa0]*Korinth?|I\.?[\s\xa0]*Korinth)i[e\xEB])r|First[\s\xa0]*Corinthins|(?:(?:I(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)|Els[oő][\s\xa0]*Korinth)u|Epistula[\s\xa0]*I[\s\xa0]*ad[\s\xa0]*Corinthio|Prime(?:ir[ao][\s\xa0]*Cor[i\xED]|r[\s\xa0]*Cori|ro[\s\xa0]*Cori)ntio|First[\s\xa0]*Cornthin|First[\s\xa0]*Corithin|First[\s\xa0]*Corinthina|First[\s\xa0]*Chorinthin|First[\s\xa0]*Cor(?:in|ni)thai?n|First[\s\xa0]*Cor(?:nin|i)than|First[\s\xa0]*Corinith(?:ina|an))s|(?:Premi(?:(?:\xE8re|ere?)s[\s\xa0]*|(?:\xE8re|ere?)[\s\xa0]*)Corinthie|First[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao])|First[\s\xa0]*C(?:orrin?|horin)thai|First[\s\xa0]*Cornthai|First[\s\xa0]*Cornthia|First[\s\xa0]*Corithia|First[\s\xa0]*Chorinthia|First[\s\xa0]*Cor(?:in|ni)thaia|First[\s\xa0]*Cor(?:nin|i)thai|First[\s\xa0]*Corinith(?:ai|ia))ns|First[\s\xa0]*C(?:or(?:(?:rin?th|inthi|nin?th|nthi)i|ith(?:ii|o))|horithi|(?:orin[an]|horn|h?oran)thi)ans|First[\s\xa0]*Corinthoi?ans|First[\s\xa0]*Coriinthii?ans|I\.?[\s\xa0]*C(?:or(?:i(?:n(?:t(?:h(?:i(?:\xEBr|os|ns|er|a(?:id|ns))|e)|i(?:e(?:ni|r)|os)|eni|o|i\xEBr)|zi)|(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)s|(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:(?:rin?tha|ntha)i|nthia|nithaia|ninthai)n|\xEDntio|nthin|nithai?n|ninthan|(?:(?:nin?|rin?)th|nthi|anth)ian)s)|\xF4(?:\-?rinh\-?|rin)t\xF4|horinthins|horinth(?:ai|ia)ns|hor(?:a?n|i)thians)|(?:(?:(?:Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kw|Kwanz)a|I\.?|Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kwa)[\s\xa0]*Wakorinth|(?:I(?:\.[\s\xa0]*Mga[\s\xa0]*Taga\-?|[\s\xa0]*Mga[\s\xa0]*Taga\-?)|Una(?:ng)?[\s\xa0]*Mga[\s\xa0]*Taga\-?)[\s\xa0]*Corint)o|Una(?:ng[\s\xa0]*[CK]|[\s\xa0]*[CK])orinti?o|(?:I(?:ka\-?[\s\xa0]*1|\.)?|Una(?:ng)?)[\s\xa0]*Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o|(?:Pierwsz[aey]|I\.?)[\s\xa0]*Korynt[o\xF3]w|(?:(?:(?:Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*K|(?:Prva|I\.?)[\s\xa0]*K|Prv[y\xE1\xFD][\s\xa0]*K)orint|Prvn[i\xED][\s\xa0]*Korint|Prvn[i\xED][\s\xa0]*list[\s\xa0]*Korint?|I\.?[\s\xa0]*list[\s\xa0]*Korint?)sk[y\xFD]|Korintiyarukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]vatu[\s\xa0]*Nirupa)m|(?:(?:Prv(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*K|(?:Prva|I\.?)[\s\xa0]*K|Prv[y\xE1\xFD][\s\xa0]*K)orinť|(?:Prv(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*K|[y\xE1\xFD][\s\xa0]*K|a[\s\xa0]*K)|I\.?[\s\xa0]*K)orint)anom|F\xF8rste[\s\xa0]*Korintherbrev|Eerste[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB])rs|Premye[\s\xa0]*Korint|F[o\xF6]rsta[\s\xa0]*Korint(?:hi?|i)?erbrevet|(?:k(?:orintʰ[iī]har[uū]l[aā][iī][\s\xa0]*pahilo|ari[mṃ]tʰkar[aā][mṃ]s[\s\xa0]*pahile)[\s\xa0]*patr|Fyrra[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Korintumann|Koiro[\s\xa0]*Qoronttoos|P(?:avlova[\s\xa0]*prva[\s\xa0]*poslanica[\s\xa0]*Korin[cć]|rva[\s\xa0]*poslanica[\s\xa0]*Korin\xE6)anim)a|(?:I(?:\.[\s\xa0]*Korin[cć]|[\s\xa0]*Korin[cć])|Prva[\s\xa0]*Korin[cć])anima[\s\xa0]*Poslanica|(?:(?:Paulus(?:’[\s\xa0]*(?:f\xF8rste[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*korint|1[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth|1\.[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth|F\xF8rste[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth)|\'[\s\xa0]*(?:F\xF8rste|1\.?)[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Korinth)|F\xF8rste[\s\xa0]*Korinti)ern|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Korinttolaiskirj)e|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Korinttilaisille|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Kirje[\s\xa0]*korinttilaisille|(?:Premye|I\.?)[\s\xa0]*Korentyen|(?:Per[sš]e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*korynfj|I\.?[\s\xa0]*Corthi|(?:Pierwsz[aey]|I\.?)[\s\xa0]*Korynti)an|I\.?[\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|Pierwsz[aey][\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|(?:Pierwsz[aey]|I\.?)[\s\xa0]*List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|1(?:[\s\xa0]*(?:கொரிந்தியர்|ค[ธร]|قور|ਕੁਰਿੰਥੀਆਂ[\s\xa0]*ਨੂੰ|Cor(?:inti?o|th)|करिंथकरांस|kurĩtʰīāṃ|Korint(?:i(?:yarukku|o)|[ao]))|e(?:\.[\s\xa0]*[CK]|[\s\xa0]*[CK])orinthe|كو|코린|st\.?[\s\xa0]*Corinthian|st\.?[\s\xa0]*Corth|[\s\xa0]*โครินธ์|(?:\-?کُرِنتھِ|۔کرنتھ)یوں|[\s\xa0]*ک(?:رنتھِیُ|ُرنتھِی)وں|[\s\xa0]*Wakorinto|[\s\xa0]*କରିନ୍ଥୀୟଙ୍କ|(?:\-?е\.?[\s\xa0]*Коринф|[\s\xa0]*Коринф)янам|(?:[ея]\.?|\-?я\.?)[\s\xa0]*Коринфянам|(?:[ея]\.?|\-?я\.?)[\s\xa0]*к[\s\xa0]*Коринфянам|(?:\-?е\.?)?[\s\xa0]*к[\s\xa0]*Коринфянам|[\s\xa0]*C\xF4(?:\-?rinh\-?|rin)t\xF4|(?:(?:\xB0\.?)?[\s\xa0]*Corinz|[\s\xa0]*Corinten)i|[\s\xa0]*Corintie(?:ni|r)|(?:[\s\xa0]*(?:Corint(?:hi[e\xEB]|i\xEB)|Qo|Korint(?:hi[e\xEB]|i[e\xEB]))|e(?:\.[\s\xa0]*Korinth?|[\s\xa0]*Korinth?)i[e\xEB]|Co)r|st\.?[\s\xa0]*Corinthins|(?:(?:[ao](?:\.[\s\xa0]*Cor[i\xED]|[\s\xa0]*Cor[i\xED])|[\s\xa0]*Cor\xED|\xBA\.?[\s\xa0]*Cori)ntio|[\s\xa0]*(?:kari[mṃ]tʰkar[aā][mṃ]|Korinth?u)|(?:st\.?)?[\s\xa0]*Cornthin|(?:st\.?)?[\s\xa0]*Corithin|st\.?[\s\xa0]*Corinthina|(?:st\.?)?[\s\xa0]*Chorinthin|(?:(?:st\.?)?[\s\xa0]*Corni|st\.?[\s\xa0]*Corin)thai?n|(?:(?:st\.?)?[\s\xa0]*Cornin|(?:st\.?)?[\s\xa0]*Cori)than|[\s\xa0]*Corinith(?:ina|an)|st\.?[\s\xa0]*Corinith(?:ina|an))s|(?:st(?:\.[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao])|[\s\xa0]*Corint(?:hi(?:a[ai]|o)|i[ao]))|(?:er(?:e\.?|\.)?|\xE8?re\.?)[\s\xa0]*Corinthie|[\s\xa0]*Corintia|(?:(?:st\.?)?[\s\xa0]*Corrin?|(?:st\.?)?[\s\xa0]*Chorin)thai|(?:st\.?)?[\s\xa0]*Cornthai|(?:st\.?)?[\s\xa0]*Cornthia|(?:st\.?)?[\s\xa0]*Corithia|(?:st\.?)?[\s\xa0]*Chorinthia|(?:(?:st\.?)?[\s\xa0]*Corni|st\.?[\s\xa0]*Corin)thaia|(?:(?:st\.?)?[\s\xa0]*Cornin|(?:st\.?)?[\s\xa0]*Cori)thai|[\s\xa0]*Corinith(?:ai|ia)|st\.?[\s\xa0]*Corinith(?:ai|ia))ns|(?:(?:(?:st\.?)?[\s\xa0]*Corrin?th|st\.?[\s\xa0]*Corinthi|(?:st\.?)?[\s\xa0]*Cornin?th|(?:st\.?)?[\s\xa0]*Cornthi)i|(?:st\.?)?[\s\xa0]*Corith(?:ii|o)|(?:st\.?)?[\s\xa0]*Chorithi|(?:st(?:\.[\s\xa0]*Corin[an]|[\s\xa0]*Corin[an])|[\s\xa0]*Corin[an]|(?:st\.?)?[\s\xa0]*Chorn|(?:(?:st\.?)?[\s\xa0]*Ch|(?:st\.?)?[\s\xa0]*C)oran)thi)ans|st\.?[\s\xa0]*Corinthoi?ans|(?:st\.?)?[\s\xa0]*Coriinthii?ans|[\s\xa0]*कुर(?:िन्(?:यि़|थि)|न्थि)यों|[\s\xa0]*कोरिन्(?:थीहरूलाई|‍थी)|[\s\xa0]*korintʰ[iī]har[uū]l[aā][iī]|[\s\xa0]*(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*?|[\s\xa0]*)Corint|Taga\-?Corint|Wakorinth)o|[\s\xa0]*Korynt[o\xF3]w|[\s\xa0]*(?:(?:k\.?[\s\xa0]*)?Korint|list[\s\xa0]*Korint?)sk[y\xFD]m|[\s\xa0]*(?:(?:k\.?[\s\xa0]*)?Korinťa|k\.?[\s\xa0]*Korinta)nom|[\s\xa0]*Korinth?erbrev|e(?:\.[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB])|[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB]))rs|[\s\xa0]*Korin[cć]anima[\s\xa0]*Poslanica|[\s\xa0]*(?:(?:[ei](?:\.[\s\xa0]*Korin?|[\s\xa0]*Korin?)|Kori)tasv|Korinttolaiskirj)e|[\s\xa0]*Korinttilaisille|[\s\xa0]*Kirje[\s\xa0]*korinttilaisille|[\s\xa0]*(?:Kurinthiayo|Corinthia|Korentye)n|[\s\xa0]*Koryntian|[\s\xa0]*list[\s\xa0]*do[\s\xa0]*Koryntian|[\s\xa0]*List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian|\.(?:[\s\xa0]*(?:C(?:or(?:i(?:n(?:t(?:h(?:i(?:\xEBr|os|ns|er|a(?:id|ns))|e)|i(?:e(?:ni|r)|os)|eni|o|i\xEBr)|zi)|(?:n(?:t(?:h(?:i(?:a(?:n[ao]|in)|na|on|en)|ai?n)|ion)|ith(?:ina|an))|th[ai]n)s|(?:n(?:t(?:h(?:ai|ia)|i)a|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:(?:rin?tha|ntha)i|nthia|nithaia|ninthai)n|\xEDntio|nthin|nithai?n|ninthan|(?:(?:nin?|rin?)th|nthi|anth)ian)s)|\xF4(?:\-?rinh\-?|rin)t\xF4|horinthins|horinth(?:ai|ia)ns|hor(?:a?n|i)thians)|ک(?:رنتھِیُ|ُرنتھِی)وں|โครินธ์|Wakorinto|କରିନ୍ଥୀୟଙ୍କ|Коринфянам|к[\s\xa0]*Коринфянам|क(?:ुर(?:िन्(?:यि़|थि)|न्थि)यों|ोरिन्(?:थीहरूलाई|‍थी))|korintʰ[iī]har[uū]l[aā][iī]|(?:Mga[\s\xa0]*Taga(?:\-?[\s\xa0]*?|[\s\xa0]*)Corint|Taga\-?Corint|Wakorinth)o|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o|list[\s\xa0]*Korint?sk[y\xFD]m|K(?:or(?:in(?:t(?:sk[y\xFD]m|usi|anom|erbrev|i(?:ers|o)|os|i\xEBrs|ierbrevet|h(?:i(?:er(?:brevet|s)|\xEBrs)|erbrevet|usiakhoz))|ťanom|[cć]anima[\s\xa0]*Poslanica)|ynt[o\xF3]w|i(?:nt(?:asv|ern|iern|tolaiskirj)|tasv)e|inttilaisille)|irje[\s\xa0]*korinttilaisille)|K(?:urinthiayo|orentye)n|(?:Korynt|Corth)ian|list[\s\xa0]*do[\s\xa0]*Koryntian|List[\s\xa0]*[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*do[\s\xa0]*Koryntian)|(?:\-?کُرِنتھِ|۔کرنتھ)یوں|[o\xBA]\.?[\s\xa0]*Corintios))|(?:(?:(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*до|I\.?)[\s\xa0]*коринт|1(?:\-?е\.?|\.)?[\s\xa0]*коринт|I\.?[\s\xa0]*Коринф|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*Послання[\s\xa0]*до[\s\xa0]*Коринт)ян|(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)ослання[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|1\-?е\.?[\s\xa0]*послання[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринфян|1\-?(?:ше|а)[\s\xa0]*(?:(?:Послання[\s\xa0]*до[\s\xa0]*К|(?:до[\s\xa0]*)?к)оринт|Коринф|послання[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринф)ян|1\-?(?:ше|а)\.[\s\xa0]*(?:(?:Послання[\s\xa0]*до[\s\xa0]*К|(?:до[\s\xa0]*)?к)оринт|Коринф|послання[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринф)ян|(?:1\.?|I\.?)[\s\xa0]*Коринтјани|(?:1(?:\.[\s\xa0]*Корин[кќ]|[\s\xa0]*Корин[кќ])|I(?:\.[\s\xa0]*Корин[кќ]|[\s\xa0]*Корин[кќ]))аните|(?:1\.?|I\.?)[\s\xa0]*Коринћанима|(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)осланица[\s\xa0]*Коринћанима|1(?:[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h|i)?|i)?)?)?|கொ(?:ரி)?|Kor(?:int(?:her?|er)?)?)|st(?:\.[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?|[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?)|e\.?[\s\xa0]*Kor|[\s\xa0]*କରିନ୍ଥୀୟ|\-?е\.?[\s\xa0]*Коринфян|[\s\xa0]*Кор(?:инфян)?|[\s\xa0]*कुरिन्थ(?:ियो)?|[\s\xa0]*कोरिन्थी|e(?:\.[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB])|[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB]))r|\.[\s\xa0]*(?:Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?|th)?)?|Кор(?:инфян)?|କରିନ୍ଥୀୟ|क(?:ुरिन्थ(?:ियो)?|ोरिन्थी)|Kor(?:int(?:h(?:e(?:r(?:brev)?)?|us|i[e\xEB]r)|us|a|er|ier|o|i\xEBr)?)?))|F(?:yrra[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*Korin|\xF8rste[\s\xa0]*Kor)|Α['ʹʹ΄’][\s\xa0]*Κορ?|Els[oő][\s\xa0]*Kor|Prvn[i\xED][\s\xa0]*K(?:or)?|I(?:\.[\s\xa0]*(?:Kor(?:inta?)?|Кор)|[\s\xa0]*(?:Kor(?:inta?)?|Кор))|Eerste[\s\xa0]*Kor|First[\s\xa0]*Co(?:r(?:in(?:th?)?)?)?|ପ୍ରଥମ[\s\xa0]*କରିନ୍ଥୀୟ|I\.?[\s\xa0]*Co(?:r(?:in(?:t(?:h(?:ian)?|io)?)?|th)?)?|Eerste[\s\xa0]*Corint(?:hi[e\xEB]|i[e\xEB])r|(?:1\.?[\s\xa0]*п|I\.?[\s\xa0]*п)исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Коринт|П(?:ерш[ае][\s\xa0]*(?:(?:Послання[\s\xa0]*до[\s\xa0]*К|(?:до[\s\xa0]*)?к)оринт|Коринф|послання[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*коринф)ян|ърво[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Коринтяни|ърв[ао][\s\xa0]*Коринтяните|ърво[\s\xa0]*послание[\s\xa0]*към[\s\xa0]*коринтяните|ърв(?:а[\s\xa0]*Кор(?:интяни)?|о[\s\xa0]*Кор(?:интяни)?)|рв(?:а[\s\xa0]*(?:п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Коринт|осланица[\s\xa0]*Коринћанима)|Корин(?:[кќ]аните|тјани|ћанима))|о[\s\xa0]*(?:писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*христијаните[\s\xa0]*во[\s\xa0]*Коринт|Корин(?:[кќ]аните|тјани)))))|(?:C(?:or(?:i(?:n(?:th(?:i(?:an[ao]|na|on)|ai?n)|ith(?:ina|an))|th[ai]n|nthia?n|(?:n(?:t(?:h(?:ia[ai]|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia))n|(?:n(?:[an]th|thi)i|th(?:ii|o))an|nthoi?an|inthii?an)|(?:(?:rin?tha|ntha)i|nthia|ninthai|nithaia|n(?:intha|thi|ithai?)|(?:(?:nin?|rin?)th|nthi)ia)n)|hor(?:inth(?:ai|ia|i)|(?:a?n|i)thia)n)s|《(?:(?:适凌爾福|林)前|[格歌]林多前書|哥林多前[书書])|(?:[格歌]林多前書|林前|适凌爾福前)》|哥林多前[书書]》|ਕੁਰਿੰਥੀਆਂ[\s\xa0]*ਨੂੰ|Corinthios[\s\xa0]*I|ad[\s\xa0]*Corinthios[\s\xa0]*I|הראשונה[\s\xa0]*אל[\s\xa0]*הקורינתים|करिंथकरांस[\s\xa0]*पहिले[\s\xa0]*पत्र|I\.?[\s\xa0]*C\xF4\-?rinh|F\xF8rste[\s\xa0]*korinterbrev|1(?:[\s\xa0]*(?:C\xF4\-?rinh|ਕੁਰਿੰਥੀਆਂ|korinterbrev|Sulat[\s\xa0]*sa[\s\xa0]*mga[\s\xa0]*Corinti?o)|\.[\s\xa0]*(?:korinterbrev|C\xF4\-?rinh))|[格歌]林多前書|林前|适凌爾福前|哥林多前[书書]|Corinthian|I\.?[\s\xa0]*C\xF4|1\.?[\s\xa0]*C\xF4|(?:1\.?|I\.?)[\s\xa0]*Korin[cć]anima|Prva[\s\xa0]*(?:poslanica[\s\xa0]*Korin[cć]|Korin[cć])anima))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Gal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:G(?:al(?:a(?:t(?:e(?:n(?:brief|i)|s|rbref?vet)|i(?:on?s|ya|na?s|a(?:n?s|id))|\\xE1khoz|a(?:br[e\\xE9]fi\\xF0|khoz|laiskirj))|s(?:yano|ia))|\\xE1t)|l)|《(?:加(?:拉太[书書])?|戛拉提亞|迦拉達書)》|ﻏﻼﻃﻲ|غل|ก(?:าลาเทีย|ท)|[カガ]ラテヤ(?:(?:人への)?書|人への手紙|の信徒への手紙)|Γαλ[άα]τες|Προς[\\s\\xa0]*Γαλ[άα]τας|갈라(?:티아[\\s\\xa0]*신자들에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|디아서)|ਗਲਾਤੀਆਂ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|G(?:al(?:at(?:i(?:a(?:n[ai]|in)|on[an]|nan)|o?n|(?:i[ao]|o)an|ii[ao]?n|a(?:i[ao]?|[ao])?n)|lati[ao]?n)|\\xE1lata)s|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Galatas|ଗାଲାତୀୟଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|पौलाचे[\\s\\xa0]*गलतीकरांस[\\s\\xa0]*पत्र|गल(?:ात(?:ीहरूलाई[\\s\\xa0]*प(?:ावलको[\\s\\xa0]*प)?त्र|ियों)|तियों)|gal(?:atiyōṅ[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|ātīāṃ[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī)|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*הגלטים|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל\\-?הגלטים|Ga\\-?la\\-?ti|G\\xE0lati|Gala(?:tiyo|sye)n|L(?:ist[\\s\\xa0]*(?:[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*do[\\s\\xa0]*Galacjan|do[\\s\\xa0]*Gala(?:t[o\\xF3]w|cjan))|ettera[\\s\\xa0]*ai[\\s\\xa0]*Galati)|گلت(?:یوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*(?:پولُس[\\s\\xa0]*رسول[\\s\\xa0]*)?|ِیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*)کا[\\s\\xa0]*خط|List[\\s\\xa0]*Gala(?:t(?:sk[y\\xFD]|ano)|ťano)m|Kal[aā]ttiyarukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|கலாத்தியர(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:நிருப|கடித|திருமுக)ம)?்|الرسالة[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*غلاطية|رسالة[\\s\\xa0]*(?:بولس[\\s\\xa0]*الرسول[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*)?غلاطية|(?:Kirje[\\s\\xa0]*galatalaisill|Galatasv)e|Brevet[\\s\\xa0]*til[\\s\\xa0]*Galaterne|(?:gal(?:at(?:ī(?:har[uū]l[aā][iī]|kar[aā][mṃ]s)|i(?:har[uū]l[aā][iī]|kar[aā][mṃ]s))|āt[iī]har[uū]l[aā][iī])[\\s\\xa0]*patr|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*Galasy|Galaatiya|Br(?:\\xE9f[\\s\\xa0]*P[a\\xE1]|ef[\\s\\xa0]*P[a\\xE1])ls[\\s\\xa0]*til[\\s\\xa0]*Galatamann|(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*(?:taga[\\s\\xa0]*)?|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*?)Galaci|Barua[\\s\\xa0]*kwa[\\s\\xa0]*Wagalati|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Galati)a|P(?:a(?:vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Gala[cć]anima|ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Galaterne)|oslan(?:nja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*halativ|ica[\\s\\xa0]*Gala\\xE6anima))|Галатите|Галатјани|G(?:al(?:a(?:t(?:e[nr]|ian|a)?|si)?)?|\\xE1(?:l(?:at)?)?)|[カガ]ラテヤ(?:人へ)?|Γαλ?|Гал|갈라?|गलात[िी]|கலா(?:த்)?|П(?:о(?:слан(?:ие[\\s\\xa0]*(?:на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Галатяни|к(?:ъм[\\s\\xa0]*галатяните|[\\s\\xa0]*Галатам))|ня[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*|апостола[\\s\\xa0]*Павла[\\s\\xa0]*)?до[\\s\\xa0]*галатів)|[\\s\\xa0]*слання[\\s\\xa0]*до[\\s\\xa0]*Галатів|сланица[\\s\\xa0]*Гала(?:ћан|т)има)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*христијаните[\\s\\xa0]*во[\\s\\xa0]*Галатија))|(?:Paulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*galaterne)|(?:Poslanica[\\s\\xa0]*Gala[cć]anima)|(?:Mga[\\s\\xa0]*Taga[\\s\\xa0]*Galacia)|(?:Galatalaisille|गलतीकरांस[\\s\\xa0]*पत्र|Kal[aā]ttiyarukku)|(?:gal(?:at(?:[iī]har[uū]l[aā][iī]|[iī]kar[aā][mṃ]s)|āt[iī]har[uū]l[aā][iī])|Taga(?:\\-?[\\s\\xa0]*?|[\\s\\xa0]*)Galacia)|(?:Гала(?:тяните|ћанима)|До[\\s\\xa0]*галатів|ଗାଲାତୀୟଙ୍କ|ad[\\s\\xa0]*Galatas|Gala[cć]anima|गलातीहरूलाई|ਗਲਾਤੀਆਂ[\\s\\xa0]*ਨੂੰ)|(?:Галат(?:има|яни)|galātīāṃ|К[\\s\\xa0]*Галатам|गलतीकरांस|Wagalatia|Gala(?:terne|cjan|tsk[y\\xFD]m|tanom|ťanom)|אל[\\s\\xa0]*הגלטים)|(?:Gala(?:t(?:[o\\xF3]w|ia|i|as)|cia)|Галат(?:ам|ів)|گلتِ?یوں)|(?:《(?:戛拉提亞|迦拉達書|加拉太[书書])|(?:戛拉提亞|迦拉達書)》?|加拉太[书書]》?)|(?:Ga|加》|《加)|(?:加))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eph"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:\\xC9ph[e\\xE9]sie|Ephsia)ns)|(?:\\xC9ph[e\\xE9]s)|(?:อฟ|엡|أف|Єф|Εφ|᾿Εφ|ﺃﻓﺴﺲ|\\xC9ph[e\\xE9]|《(?:耶斐斯|弗|厄弗所書|以弗所[书書])》|เอเฟซัส|इफिस(?:ियों|ी)|\\xCA(?:\\-?ph\\xEA\\-?|ph\\xEA)s\\xF4|エ(?:[ヘペ]ソ(?:人への)?書|[ヘペ]ソ人への手紙|フェソ(?:の信徒への手紙|人への手紙|書))|Προς[\\s\\xa0]*Εφεσ[ίι]ους|에(?:페소(?:[\\s\\xa0]*신자들에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|베소서)|ਅਫ਼ਸੀਆਂ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|afasīāṃ[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*E[fp]eso|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*E[fp]eso|ଏଫିସୀୟଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|ifisiyōṅ[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|पौलाचे[\\s\\xa0]*इफिसकरांस[\\s\\xa0]*पत्र|एफिसीहरूलाई[\\s\\xa0]*प(?:ावलको[\\s\\xa0]*प)?त्र|(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*E[fp]|Mga[\\s\\xa0]*Taga\\-?[\\s\\xa0]*E[fp])esio|Mga[\\s\\xa0]*Taga\\-?[E\\xC9]feso|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Waefeso|Barua[\\s\\xa0]*kwa[\\s\\xa0]*Waefeso|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*האפסים|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל(?:[\\s\\xa0]*האפסי|\\-?האפס)ים|E(?:f(?:es(?:usbr[e\\xE9]fi\\xF0|erbrevet|ierbrevet|os)|\\xE9se|fesiaid|\\xE8z|ezusiakhoz|\\xE9zusiakhoz)|ph(?:es(?:ia(?:n[ds]|id)|er|ains|zosziakhoz)|isians))|எபேசியர(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:நிருப|கடித|திருமுக)ம)?்|رسالة[\\s\\xa0]*أفسس|رسالة[\\s\\xa0]*بولس[\\s\\xa0]*الرسول[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*أفسس|ا(?:لرسالة[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*أفسس|ِفسِ?یوں|ِفِسِیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*کا[\\s\\xa0]*خط|فسیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*(?:پو[\\s\\xa0]*لس[\\s\\xa0]*رسول[\\s\\xa0]*)?کا[\\s\\xa0]*خط)|(?:Efes(?:ian[e\\xEB]v|olaiskirj)|Kirje[\\s\\xa0]*efesolaisill)e|(?:(?:epʰis[iī]har[uū]l[aā][iī]|ipʰiskar[aā][mṃ]s)[\\s\\xa0]*patr|Br[e\\xE9]f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*Efesusmann|Efisoon)a|Pa(?:vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Efe[zž]anima|ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Efeserne)|Efeseni|E(?:p(?:h(?:esi[eo]|\\xE9sie)n|istula[\\s\\xa0]*ad[\\s\\xa0]*Ephesio|e(?:he)?sian)|f(?:e(?:zi[e\\xEB]r|sio)|\\xE9sio)|hp[ei]sian|sphesian)s|E(?:p(?:ēciyarukku[\\s\\xa0]*E[lḻ]|eciyarukku[\\s\\xa0]*E[lḻ])utiya[\\s\\xa0]*Nirupa|fesk[y\\xFD])m|(?:Iafisiyo|Efezye)n|Ephsian|Poslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*efesjan|L(?:ist[\\s\\xa0]*(?:Ef(?:ez(?:sk[y\\xFD]|an[ouů])|\\xE9zsk[y\\xFD])m|do[\\s\\xa0]*Efezjan|[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*do[\\s\\xa0]*Efezjan|[SŚ]wi[eę]tego[\\s\\xa0]*Pawła[\\s\\xa0]*Apostoła[\\s\\xa0]*do[\\s\\xa0]*Efez[o\\xF3]w)|ayang[\\s\\xa0]*Paulus[\\s\\xa0]*Efesus|ettera[\\s\\xa0]*agli[\\s\\xa0]*Efesini)|Эфесянам|Ефешаните|Ефесјани|E(?:p(?:h(?:e(?:s(?:ain|ian)?)?|\\xE9s?|s|isian)?)?|f(?:e(?:z(?:us)?|se?)?|is|f)?|hp)|\\xC9ph?|इफिसि|Эф|\\xCAph|Еф|エ(?:[ヘペ]ソ人へ|フェソ)|에페|एफिसी|எபே(?:சி)?|П(?:о(?:слан(?:и(?:е[\\s\\xa0]*(?:на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Ефесяни|к(?:ъм[\\s\\xa0]*ефесяните|[\\s\\xa0]*Ефесянам))|ца[\\s\\xa0]*Ефесцима)|ня[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*|апостола[\\s\\xa0]*Павла[\\s\\xa0]*)?до[\\s\\xa0]*ефесян)|[\\s\\xa0]*слан[\\s\\xa0]*ня[\\s\\xa0]*до[\\s\\xa0]*Єфесян)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*христијаните[\\s\\xa0]*во[\\s\\xa0]*Ефес))|(?:Efesolaisille)|(?:(?:耶斐斯|弗|厄弗所書|以弗所[书書])》|《(?:耶斐斯|弗|厄弗所書|以弗所[书書])|افسیوں|Εφεσ[ίι]ους|Ефес(?:яните|цима)|ଏଫିସୀୟଙ୍କ|До[\\s\\xa0]*ефесян|К[\\s\\xa0]*Ефесянам|एफिसीहरूलाई|ਅਫ਼ਸੀਆਂ[\\s\\xa0]*ਨੂੰ|afasīāṃ|Waefeso|Mga[\\s\\xa0]*E[fp]esi?o|Taga(?:\\-?(?:[\\s\\xa0]*E[fp]esi?|[E\\xC9]fes)|[\\s\\xa0]*E[fp]esi?)o|(?:ipʰiskar[aā][mṃ]|ad[\\s\\xa0]*Ephesio)s|E(?:fe(?:z(?:[o\\xF3]w|jan|anom|sk[y\\xFD]m)|s(?:ini|us))|p[eē]ciyarukku)|epʰis[iī]har[uū]l[aā][iī]|इफिसकरांस[\\s\\xa0]*पत्र|אל[\\s\\xa0]*האפסים|השליח[\\s\\xa0]*אל[\\s\\xa0]*האפסיים|Ефесяни|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*efeserne|oslanica[\\s\\xa0]*Efe[zž]anima))|(?:E(?:fe(?:s(?:erne|i?o)|[zž]anima)|p(?:hesios|eso|esio))|耶斐斯|弗|厄弗所書|以弗所[书書]|Ефесянам|\\xC9feso|Ефесян|इफिसकरांस))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Col"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:كو|คส|قول|Κο?λ|골로새서|ﻛﻮﻟﻮﺳﻲ|《(?:适羅斯|西|歌罗西书|歌羅西書|哥羅森書)》|โคโลสี|コロサイ(?:(?:人への)?書|人への手紙|の信徒への手紙)|C(?:olos(?:sia(?:id|ns)|iaid|eni)|\\xF4l\\xF4x\\xEA|l)|콜로새(?:[\\s\\xa0]*신자들에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|Προς[\\s\\xa0]*Κολοσσαε[ίι]ς|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*הקולוסים|କଲସୀୟଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|ਕੁਲੁੱਸੀਆਂ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|पौलाचे[\\s\\xa0]*कलस्सैकरांस[\\s\\xa0]*पत्र|क(?:लस(?:्सीहरूलाई[\\s\\xa0]*प(?:ावलको[\\s\\xa0]*प)?त्र|ैकरांस)|ुलुस्(?:सियों|‍सी))|kuluss(?:iyōṅ[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|īāṃ[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī)|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Kolos[e\\xE9]|Lettera[\\s\\xa0]*ai[\\s\\xa0]*Colossesi|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Wakolosai|B(?:r[e\\xE9]f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*K[o\\xF3]lossumanna|arua[\\s\\xa0]*kwa[\\s\\xa0]*Wakolosai)|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל\\-?הקולוסים|(?:C(?:al(?:l(?:os(?:i[ao]|sia)|asi[ao])|(?:[ao]s|[ao])si[ao])|ol(?:os(?:s(?:i[eo]|a)|io)|(?:l[ao]s|ass?)i[ao]|osia))n|Mga[\\s\\xa0]*Taga(?:\\-?(?:[\\s\\xa0]*[CK]|C)|[\\s\\xa0]*[CK])olosa|Colosense|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Colossense)s|List[\\s\\xa0]*Kolos(?:an[ouů]|k[y\\xFD])m|K(?:ol(?:o(?:s(?:s(?:ubr[e\\xE9]fi\\xF0|zeieknek|z[e\\xE9]beliekhez|\\xE9iakhoz|e(?:nser(?:brevet|n)|rbrevet|iakhoz))|ens[o\\xF3]w|ay|(?:sensk[y\\xFD]|ensk[y\\xFD])m)|ceyarukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam)|ōceyarukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|ussubr[e\\xE9]fi\\xF0|\\xF2s)|\\xF3l[ou]ssubr[e\\xE9]fi\\xF0)|கொலோச(?:ெயர(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:நிருப|கடித)ம)?|ையர(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*திருமுகம)?)்|الرسالة[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*كولوسي|رسالة[\\s\\xa0]*(?:بولس[\\s\\xa0]*الرسول[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*)?كولوسي|ک(?:ُل(?:ِسّیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*پولُس[\\s\\xa0]*رسُول[\\s\\xa0]*کا[\\s\\xa0]*خط|ُسِّیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*کا[\\s\\xa0]*خط|س[ِّ]یوں)|لسیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*کا[\\s\\xa0]*خط)|(?:kalass(?:[iī]har[uū]l[aā][iī]|aikar[aā][mṃ]s)[\\s\\xa0]*patr|Qolasiyaas)a|(?:K(?:olos(?:ian[e\\xEB]v|salaiskirj)|irje[\\s\\xa0]*kolossalaisill)|(?:Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*[CK]olon?sen|C\\xF4\\-?l\\xF4\\-?)s)e|(?:K(?:olos(?:senz|y)e|ulussaiyo)|Colossenze)n|List[\\s\\xa0]*(?:[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*)?do[\\s\\xa0]*Kolosan|P(?:a(?:ulus(?:’[\\s\\xa0]*(?:Brev[\\s\\xa0]*til[\\s\\xa0]*Kolossen|brev[\\s\\xa0]*til[\\s\\xa0]*kolos)|\\'[\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Kolossen)serne|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Kolo[sš]anima)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*kolosjan)|Колошаните|Колосјани|До[\\s\\xa0]*колоссян|C(?:o(?:l(?:os(?:s(?:ian)?)?)?)?|\\xF4l)|コロサイ(?:人へ)?|Кол|골|Qol|콜로|क(?:ुलुस्सि|लस्सी)|Br[e\\xE9]f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*K[o\\xF3]lossumann|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל\\-?הקולוסי|K(?:o(?:l(?:os(?:s(?:\\xE9|er?))?)?)?|\\xF3l)|கொலோ|П(?:ослан(?:и(?:е[\\s\\xa0]*(?:на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Колосяни|к(?:ъм[\\s\\xa0]*колосяните|[\\s\\xa0]*Колоссянам))|ца[\\s\\xa0]*Колошанима)|ня[\\s\\xa0]*(?:апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*к|до[\\s\\xa0]*К|св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*к)олосян)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*христијаните[\\s\\xa0]*во[\\s\\xa0]*Колос))|(?:Poslanica[\\s\\xa0]*Kolo[sš]anima)|(?:कलस्सैकरांस[\\s\\xa0]*पत्र)|(?:kalass(?:[iī]har[uū]l[aā][iī]|aikar[aā][mṃ]s)|ad[\\s\\xa0]*Colossenses|Mga[\\s\\xa0]*[CK]olonsense|Kolossalaisille)|(?:К[\\s\\xa0]*Колоссянам|कलस्सीहरूलाई|Taga(?:\\-?[\\s\\xa0]*?|[\\s\\xa0]*)Colosas|Kol[oō]ceyarukku|Kolossenserne|Mga[\\s\\xa0]*[CK]olosense|ਕੁਲੁੱਸੀਆਂ[\\s\\xa0]*ਨੂੰ)|(?:Коло(?:с(?:сянам|яните)|шанима)|Κολοσσαε[ίι]ς|Kolo(?:s(?:anima|serne)|šanima)|कलस्सैकरांस|אל[\\s\\xa0]*הקולוסים|Colossenses)|(?:Колос(?:сян|яни)|କଲସୀୟଙ୍କ|Wakolosai|Colossesi|کُلِسّیوں|Kolos(?:an[ouů]|k[y\\xFD])m|kulussīāṃ)|(?:Колосян|کلسیوں|Colosas|Kolos(?:[e\\xE9]|a[ns]))|(?:(?:歌罗西书|适羅斯|歌羅西書|哥羅森書)》|歌(?:罗西书|羅西書)|哥羅森書|《(?:歌(?:罗西书|羅西書)|哥羅森書|适羅斯))|(?:《西|西》|适羅斯)|(?:西))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2[\s\xa0]*Tim(?:ot(?:e(?:u(?:s(?:hoz|nak|kirje|brevet)|kselle|t)|\xFCs|i|yos|ovi|j(?:u[\s\xa0]*Poslanica|ovi))|h(?:e(?:u(?:sbrev|m)|e|osz)|y|e\xFCs|\xE9e|eosbrevet))|\xF3teus(?:hoz|nak))|(?:M[a\xE1]sodik[\s\xa0]*Tim[o\xF3]|II\.?[\s\xa0]*Tim\xF3)teusnak|And(?:en|re)[\s\xa0]*Timoteusbrev|II\.?[\s\xa0]*Тимотеју|(?:M[a\xE1]sodik[\s\xa0]*Tim[o\xF3]|II\.?[\s\xa0]*Tim\xF3)teushoz|II\.?[\s\xa0]*Timoteovi)|(?:2[\s\xa0]*Timoteusbrev)|(?:《(?:提(?:摩(?:太后书|斐後)|[后後]|摩太後書)|弟茂德後書)》|二テモテ|딤후|Ⅱ[\s\xa0]*テモテへ|テモテ(?:への(?:手紙[Ⅱ二]|後の書)|[\s\xa0]*2|後書|ヘの第二の手紙)|Β['ʹʹ΄’][\s\xa0]*Τιμ[οό]θεο|디모데[2후]서|티모테오(?:에게[\s\xa0]*보낸[\s\xa0]*둘째[\s\xa0]*서간|2서)|ﺍﻟﺜﺎﻧﻴﺔ[\s\xa0]*ﺗﻴﻤﻮﺛﺎﻭﺱ|Προς[\s\xa0]*Τιμ[οό]θεον[\s\xa0]*Β['ʹʹ΄’]|ਤਿਮੋਥਿਉਸ[\s\xa0]*ਨੂੰ[\s\xa0]*ਦੂਜੀ[\s\xa0]*ਪੱਤ੍ਰੀ|ତୀମଥିଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ଦ୍ୱିତୀୟ[\s\xa0]*ପତ୍ର|पौलाचे[\s\xa0]*तीमथ्थाला[\s\xa0]*दुसरे[\s\xa0]*पत्र|तिमोथीलाई[\s\xa0]*(?:पावलको[\s\xa0]*दोस|दोस्त)्रो[\s\xa0]*पत्र|ה(?:איגרת[\s\xa0]*השנייה[\s\xa0]*אל[\s\xa0]*טימותי|שנייה[\s\xa0]*אל[\s\xa0]*טימותיא)וס|אגרת[\s\xa0]*פולוס[\s\xa0]*השנייה[\s\xa0]*אל\-?טימותיוס|t(?:īmutʰiyus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*dūsrā[\s\xa0]*ḫaṭ|imotʰius[\s\xa0]*nū̃[\s\xa0]*dūjī[\s\xa0]*pattrī)|S[i\xED]\xF0ara[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]m[o\xF3]teusar|T[i\xED]m[o\xF3]teusarbr[e\xE9]f)|ت(?:ی(?:ِمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*پولس[\s\xa0]*رسول|متھیس[\s\xa0]*کے[\s\xa0]*نام)[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|ِیمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*دوسرا[\s\xa0]*خط|يموثاوس[\s\xa0]*الثانية)|Epistula[\s\xa0]*ad[\s\xa0]*Timotheum[\s\xa0]*II|Timot(?:eyos[\s\xa0]*Labaad|heo[\s\xa0]*II)|த(?:ீமோத்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டா(?:வது[\s\xa0]*நிருப|ம்[\s\xa0]*கடித)|ிம[ொோ]த்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*இரண்டாம்[\s\xa0]*திருமுக)ம்|Druh[ay\xE1\xFD][\s\xa0]*Tm|Втор[ао][\s\xa0]*Тимоте[ийј]|II(?:\.[\s\xa0]*(?:T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|e[io])|m)|Тимоте[ийј])|[\s\xa0]*(?:T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|e[io])|m)|Тимоте[ийј]))|Друга[\s\xa0]*Тимоте[ий]|Second[\s\xa0]*T(?:imoth?y|m)|II\.?[\s\xa0]*Tim\xF3teo|Pavlova[\s\xa0]*druga[\s\xa0]*poslanica[\s\xa0]*Timoteju|ଦ୍ୱିତୀୟ[\s\xa0]*ତୀମଥିଙ୍କ|(?:T(?:im(?:ōtt[eē]yuvukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā]|ott[eē]yuvukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā])|īm[oō]tt[eē]yuvukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Ira[nṇ][tṭ][aā])vatu[\s\xa0]*Nirupa|Epistula[\s\xa0]*II[\s\xa0]*ad[\s\xa0]*Timotheu|II\.?[\s\xa0]*T\xED)m|(?:Second|II\.?)[\s\xa0]*Tomothy|(?:Second|II\.?)[\s\xa0]*Thimoth?y|II(?:\.?[\s\xa0]*Ti\-?m\xF4\-?|\.?[\s\xa0]*Tim\xF4)th\xEA|Ande[nt][\s\xa0]*Timotheusbrev|(?:(?:(?:Paulus(?:’[\s\xa0]*(?:Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth|andre[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*Timot)|\'[\s\xa0]*Andet[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth)|(?:M[a\xE1]sodik[\s\xa0]*Tim[o\xF3]|Anden[\s\xa0]*Timo|Andre[\s\xa0]*Timo)t|Zweite[\s\xa0]*Timoth)e|II\.?[\s\xa0]*Timoti)u|II(?:\.[\s\xa0]*Timoth?|[\s\xa0]*Timoth?)e\xFC|Druh[ay\xE1\xFD][\s\xa0]*Timoteu|Tweede[\s\xa0]*Timoth?e[u\xFC]|II\.?[\s\xa0]*Tim\xF3teu)s|II\.?[\s\xa0]*Timoteyos|II\.?[\s\xa0]*Timoteusnak|(?:M[a\xE1]sodik[\s\xa0]*Tim[o\xF3]|II\.?[\s\xa0]*Tim\xF3|II\.?[\s\xa0]*Timo)theosz|II\.?[\s\xa0]*Timoteushoz|Andra[\s\xa0]*Timot(?:heo|eu)sbrevet|(?:Druh(?:(?:[a\xE1][\s\xa0]*kniha|[ay\xE1\xFD])[\s\xa0]*Timotej|(?:[a\xE1][\s\xa0]*kniha|[ay\xE1\xFD])[\s\xa0]*Timote)|(?:Druh[ay\xE1\xFD]|II\.?)[\s\xa0]*list[\s\xa0]*Tim(?:otej?|etej))ovi|II\.?[\s\xa0]*Timotejovi|(?:(?:Waraka[\s\xa0]*w|Barua[\s\xa0]*y)a[\s\xa0]*Pili[\s\xa0]*kwa|Pili)[\s\xa0]*Timotheo|Segund[ao][\s\xa0]*Tim[o\xF3]teo|(?:Ikalawang|Seconda)[\s\xa0]*Timoteo|(?:Second(?:a[\s\xa0]*lettera[\s\xa0]*a|o)|I(?:kalawang|I\.?)[\s\xa0]*Kay)[\s\xa0]*Timoteo|(?:Dezy[e\xE8]m[\s\xa0]*Timot|II\.?[\s\xa0]*Timoth\xE9|Deuxi[e\xE8]me[\s\xa0]*Timoth[e\xE9]|Deuxi[e\xE8]mes[\s\xa0]*Timoth[e\xE9]|(?:Toinen|II\.?)[\s\xa0]*Timoteuskirj)e|(?:Toinen|II\.?)[\s\xa0]*Timoteukselle|(?:Toinen|II\.?)[\s\xa0]*Kirje[\s\xa0]*Timoteukselle|(?:t(?:im(?:otʰ(?:īl[aā][iī]|il[aā][iī])[\s\xa0]*dostro|atʰtʰ[aā]l[aā][\s\xa0]*dusre)|īmatʰtʰ[aā]l[aā][\s\xa0]*dusre)[\s\xa0]*patr|Naa77antto[\s\xa0]*Ximootiyoos|Druhe[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*Tymofij|Druga[\s\xa0]*Timoteju[\s\xa0]*Poslanic|II\.?[\s\xa0]*Timoteju[\s\xa0]*Poslanic)a|(?:Druga|II\.?)[\s\xa0]*Tymoteusza|Drugi[\s\xa0]*Tymoteusza|(?:Drug[ai]|II\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|Втор[ао][\s\xa0]*писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|Друга[\s\xa0]*Тимотеју|Друга[\s\xa0]*посланица[\s\xa0]*Тимотеју|II\.?[\s\xa0]*п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|осланица[\s\xa0]*Тимотеју)|(?:(?:رسالة[\s\xa0]*بولس[\s\xa0]*الرسول|الرسالة)[\s\xa0]*الثانية[\s\xa0]*إلى[\s\xa0]*تيموثاو|(?:دوم|۲)۔تیمتھی|(?:دوم|۲)[\s\xa0]*تیمِتھُی)س|(?:دوم|۲)[\s\xa0]*تیِمُتھِیُس|(?:دوم|۲)[\s\xa0]*تِیمُتھِیُس|(?:دوم|۲)\-?تِیمُتھِیُس|Второ[\s\xa0]*послание[\s\xa0]*към[\s\xa0]*Тимоте[ий]|(?:Друга|II\.?)[\s\xa0]*Тимофію|M[a\xE1]sodik[\s\xa0]*Tim|Β['ʹʹ΄’][\s\xa0]*Τιμ?|And(?:en|re)[\s\xa0]*Tim|אגרת[\s\xa0]*פולוס[\s\xa0]*השנייה[\s\xa0]*אל\-?טימותי|S[i\xED]\xF0ara[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]m[o\xF3]|Pili[\s\xa0]*Tim|Tweede[\s\xa0]*Tim|Втор[ао][\s\xa0]*Тим|Druh[ay\xE1\xFD][\s\xa0]*Tim|II(?:\.[\s\xa0]*(?:Tim(?:ot(?:e(?:us)?|h(?:eo)?))?|Тим)|[\s\xa0]*(?:Tim(?:ot(?:e(?:us)?|h(?:eo)?))?|Тим))|Second[\s\xa0]*Ti(?:m(?:oth)?)?|Второ[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимотея|(?:Друга|II\.?)[\s\xa0]*Ти\xADмофія|(?:Друга[\s\xa0]*п|II\.?[\s\xa0]*п)ослання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Друге[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))|2(?:[\s\xa0]*(?:t(?:īmatʰtʰ[aā]l[aā]|imatʰtʰ[aā]l[aā])|த(?:ிமொ|ீமோ)த்தேயு|طيم|ทธ|तीमथ्थाला|ਤਿਮੋਥਿਉਸ[\s\xa0]*ਨੂੰ|T(?:im(?:ot(?:t[eē]yuvukku|eo|y|heo)|ōtt[eē]yuvukku|\xF3teo)|īm[oō]tt[eē]yuvukku|m))|nd(?:\.[\s\xa0]*T(?:imoth?y|m)|[\s\xa0]*T(?:imoth?y|m))|티모|e\.?[\s\xa0]*Timothee|[\s\xa0]*ทิโมธี|[\s\xa0]*ତୀମଥିଙ୍କ|[\s\xa0]*Тимоте(?:[ий]|ју)|[\s\xa0]*तिमोथीलाई|[\s\xa0]*तिमुथियुस|[\s\xa0]*तीमु(?:ाथै|थि)युस|[\s\xa0]*timotʰil[aā][iī]|[\s\xa0]*timotʰīl[aā][iī]|(?:[\s\xa0]*(?:T\xED|Xi)|Ti)m|(?:nd\.?)?[\s\xa0]*Tomothy|(?:nd\.?)?[\s\xa0]*Thimoth?y|[\s\xa0]*Ti(?:\-?m\xF4\-?|m\xF4)th\xEA|(?:e(?:\.[\s\xa0]*Timot(?:he[u\xFC]|e[u\xFC])|[\s\xa0]*Timot(?:he[u\xFC]|e[u\xFC]))|[\s\xa0]*(?:Tim(?:\xF3t|oth?)e|timotʰi)u|[\s\xa0]*T(?:eemuathaiy|imoti)u)s|[\s\xa0]*Tim\xF3theosz|[\s\xa0]*[ei]\.?[\s\xa0]*Timoteut|[\s\xa0]*(?:k(?:\.?[\s\xa0]*Timotej|\.?[\s\xa0]*Timote)|list[\s\xa0]*Tim(?:otej?|etej))ovi|[ao](?:\.[\s\xa0]*Tim[o\xF3]|[\s\xa0]*Tim[o\xF3])teo|[\xB0\xBA][\s\xa0]*Timoteo|[\xB0\xBA]\.[\s\xa0]*Timoteo|(?:d(?:e(?:\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|\xE8me(?:\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|e(?:me(?:\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|\.?[\s\xa0]*Timoth\xE9))e|[\s\xa0]*K(?:irje[\s\xa0]*Timoteukselle|a(?:ng|y)[\s\xa0]*Timoteo)|[\s\xa0]*Tymoteusza|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|[\s\xa0]*п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|осланица[\s\xa0]*Тимотеју)|\.(?:[\s\xa0]*(?:T(?:i(?:m(?:ot(?:h(?:e(?:u(?:sbrev|m)|e|osz)|y)|y|(?:he\xFC|iu)s|heosbrevet|e(?:u(?:s(?:hoz|nak|brevet)|t)|\xFCs|i|yos|ovi|jovi))|\xF4th\xEA|\xF3teo|\xF3teusnak|\xF3theosz|\xF3teushoz)|\-?m\xF4\-?th\xEA)|omothy|\xED?m|himoth?y|eemuathaiyus)|त(?:िम(?:ुथियुस|ोथीलाई)|ीमु(?:ाथै|थि)युस)|Тимоте(?:[ий]|ју)|ତୀମଥିଙ୍କ|ทิโมธี|timotʰ[iī]l[aā][iī]|list[\s\xa0]*Tim(?:otej?|etej)ovi|Timot(?:euskirj|h\xE9)e|Timoteukselle|K(?:irje[\s\xa0]*Timoteukselle|a(?:ng|y)[\s\xa0]*Timoteo)|Timoteju[\s\xa0]*Poslanica|Tymoteusza|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|осланица[\s\xa0]*Тимотеју))|(?:[o\xBA]\.|[o\xBA])[\s\xa0]*Timoteo)|(?:\.(?:[\s\xa0]*تیمِتھُ|۔تیمتھ)|[\s\xa0]*تیمِتھُ|۔تیمتھ)یس|\.?[\s\xa0]*تیِمُتھِیُس|\.?[\s\xa0]*تِیمُتھِیُس|\.\-?تِیمُتھِیُس|(?:(?:[ея]\.?|\.)?[\s\xa0]*Тимете|\.?[\s\xa0]*Тимоф[еі]|[ея]\.?[\s\xa0]*Тимофе|(?:[ея]\.?|\.)?[\s\xa0]*к[\s\xa0]*Тимофе)ю|nd(?:\.[\s\xa0]*Ti(?:m(?:oth)?)?|[\s\xa0]*Ti(?:m(?:oth)?)?)|e\.?[\s\xa0]*Tim|[\s\xa0]*(?:T(?:im(?:ot[eh])?|ym)|த(?:ீமோத்|ிமொ)|तीम)|[\s\xa0]*Тим(?:отеј)?|[\s\xa0]*तिमोथी|\.[\s\xa0]*(?:Tim(?:ot(?:e(?:us(?:brev)?|o)?|h(?:e(?:us|o))?)|\xF3teus)?|त(?:िमोथी|ीम)|Тим(?:отеј)?)|\.?[\s\xa0]*Ти\xADмофія|\.?[\s\xa0]*послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|\-?(?:а(?:\.[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))|[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія)))|(?:е(?:\.[\s\xa0]*(?:Тим(?:оф[еі]|ете)|к[\s\xa0]*Тимофе)|[\s\xa0]*(?:Тим(?:оф[еі]|ете)|к[\s\xa0]*Тимофе))|я(?:\.?[\s\xa0]*Тимет|\.?[\s\xa0]*Тимоф|\.?[\s\xa0]*к[\s\xa0]*Тимоф)е)ю|е\.?[\s\xa0]*Тимоте[ий]|تِیمُتھِیُس|е\.?[\s\xa0]*Ти\xADмофія|е\.?[\s\xa0]*послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|ге(?:\.[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))|[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))))))|(?:(?:II\.?|2\.?)[\s\xa0]*Timoteju)|(?:(?:提(?:摩(?:太(?:后书|後書)|斐後)|[后後])|弟茂德後書)》|2\.?[\s\xa0]*Ti|II\.?[\s\xa0]*Ti|《(?:提(?:摩(?:太后书|斐後)|[后後]|摩太後書)|弟茂德後書)|ad[\s\xa0]*Timotheum[\s\xa0]*II|השנייה[\s\xa0]*אל[\s\xa0]*טימותיוס|तीमथ्थाला[\s\xa0]*दुसरे[\s\xa0]*पत्र|Druga[\s\xa0]*(?:poslanica[\s\xa0]*)?Timoteju)|(?:提(?:摩(?:太后书|斐後)|[后後]|摩太後書)|弟茂德後書|Timotheum[\s\xa0]*II))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1[\s\xa0]*Tim(?:ot(?:e(?:u(?:s(?:hoz|nak|kirje|brevet)|kselle|t)|\xFCs|i|yos|ovi|j(?:u[\s\xa0]*Poslanica|ovi))|h(?:e(?:u(?:sbrev|m)|e|osz)|y|e\xFCs|\xE9e|eosbrevet))|\xF3teus(?:hoz|nak))|(?:Els[oő][\s\xa0]*Tim[o\xF3]|I\.?[\s\xa0]*Tim\xF3)teusnak|F\xF8rste[\s\xa0]*Timoteusbrev|I\.?[\s\xa0]*Тимотеју|(?:Els[oő][\s\xa0]*Tim[o\xF3]|I\.?[\s\xa0]*Tim\xF3)teushoz|I\.?[\s\xa0]*Timoteovi)|(?:1[\s\xa0]*Timoteusbrev)|(?:《(?:提(?:摩(?:太前[书書]|斐前)|前)|弟茂德前書)》|一テモテ|딤전|Ⅰ[\s\xa0]*テモテへ|テモテ(?:への(?:手紙[Ⅰ一]|前の書)|[\s\xa0]*1|前書|ヘの第一の手紙)|Α['ʹʹ΄’][\s\xa0]*Τιμ[οό]θεο|ﺍﻻﻭﻝ[\s\xa0]*ﺗﻴﻤﻮﺛﺎﻭﺱ|디모데[1전]서|티모테오(?:에게[\s\xa0]*보낸[\s\xa0]*첫째[\s\xa0]*서간|1서)|Προς[\s\xa0]*Τιμ[οό]θεον[\s\xa0]*Α['ʹʹ΄’]|ତୀମଥିଙ୍କ[\s\xa0]*ପ୍ରତି[\s\xa0]*ପ୍ରଥମ[\s\xa0]*ପତ୍ର|ਤਿਮੋਥਿਉਸ[\s\xa0]*ਨੂੰ[\s\xa0]*ਪਹਿਲੀ[\s\xa0]*ਪੱਤ੍ਰੀ|पौलाचे[\s\xa0]*तीमथ्याला[\s\xa0]*पहिले[\s\xa0]*पत्र|त(?:िमोथीलाई(?:र्[\s\xa0]*पावलको)?[\s\xa0]*पहिलो|ीमथ्थाला[\s\xa0]*पहिले)[\s\xa0]*पत्र|ה(?:איגרת[\s\xa0]*הראשונה[\s\xa0]*אל[\s\xa0]*טימותי|ראשונה[\s\xa0]*אל[\s\xa0]*טימותיא)וס|אגרת[\s\xa0]*פולוס[\s\xa0]*הראשונה[\s\xa0]*אל\-?טימותיוס|t(?:īmutʰiyus[\s\xa0]*ke[\s\xa0]*nām[\s\xa0]*kā[\s\xa0]*pahlā[\s\xa0]*ḫaṭ|imotʰius[\s\xa0]*nū̃[\s\xa0]*pahilī[\s\xa0]*pattrī)|Fyrra[\s\xa0]*(?:br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]m[o\xF3]teusar|T[i\xED]m[o\xF3]teusarbr[e\xE9]f)|த(?:ீமோத்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதலா(?:வது[\s\xa0]*நிருப|ம்[\s\xa0]*கடித)|ிம[ொோ]த்தேயுவுக்கு[\s\xa0]*எழுதிய[\s\xa0]*முதல்[\s\xa0]*திருமுக)ம்|ت(?:ِیمُتھِیُس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*(?:پولُس[\s\xa0]*رسول[\s\xa0]*)?کا[\s\xa0]*پہلا[\s\xa0]*خط|یمتھیس[\s\xa0]*کے[\s\xa0]*نام[\s\xa0]*کا[\s\xa0]*پہلا[\s\xa0]*خط|يموثاوس[\s\xa0]*الأولى)|Epistula[\s\xa0]*ad[\s\xa0]*Timotheum[\s\xa0]*I|Timot(?:eyos[\s\xa0]*Kowaad|heo[\s\xa0]*I)|Prvn[i\xED][\s\xa0]*Tm|I(?:\.[\s\xa0]*(?:T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|e[io])|m)|Тимоте[ийј])|[\s\xa0]*(?:T(?:imot(?:h(?:e(?:u[ms]|e)|y)|y|e[io])|m)|Тимоте[ийј]))|First[\s\xa0]*T(?:imoth?y|m)|I\.?[\s\xa0]*Tim\xF3teo|Pavlova[\s\xa0]*prva[\s\xa0]*poslanica[\s\xa0]*Timoteju|ପ୍ରଥମ[\s\xa0]*ତୀମଥିଙ୍କ|Прва[\s\xa0]*Тимотеју|(?:T(?:im(?:ōtt[eē]yuvukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā]|ott[eē]yuvukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā])|īm[oō]tt[eē]yuvukku[\s\xa0]*E[lḻ]utiya[\s\xa0]*Mutal[aā])vatu[\s\xa0]*Nirupa|Epistula[\s\xa0]*I[\s\xa0]*ad[\s\xa0]*Timotheu|I\.?[\s\xa0]*T\xED)m|(?:First|I\.?)[\s\xa0]*Tomothy|(?:First|I\.?)[\s\xa0]*Thimoth?y|I(?:\.?[\s\xa0]*Ti\-?m\xF4\-?|\.?[\s\xa0]*Tim\xF4)th\xEA|F\xF8rste[\s\xa0]*Timotheusbrev|(?:(?:(?:Paulus(?:’[\s\xa0]*(?:f\xF8rste[\s\xa0]*brev[\s\xa0]*til[\s\xa0]*Timot|1[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth|1\.[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth|F\xF8rste[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth)|\'[\s\xa0]*(?:F\xF8rste|1\.?)[\s\xa0]*Brev[\s\xa0]*til[\s\xa0]*Timoth)|(?:Els[oő][\s\xa0]*Tim[o\xF3]|F\xF8rste[\s\xa0]*Timo)t|Erste[\s\xa0]*Timoth)e|I\.?[\s\xa0]*Timoti)u|I(?:\.[\s\xa0]*Timoth?|[\s\xa0]*Timoth?)e\xFC|Prvn[i\xED][\s\xa0]*Timoteu|Eerste[\s\xa0]*Timot(?:he[u\xFC]|e[u\xFC])|I\.?[\s\xa0]*Tim\xF3teu)s|I\.?[\s\xa0]*Timoteyos|I\.?[\s\xa0]*Timoteusnak|(?:Els[oő][\s\xa0]*Tim[o\xF3]|I\.?[\s\xa0]*Tim\xF3|I\.?[\s\xa0]*Timo)theosz|I\.?[\s\xa0]*Timoteushoz|F[o\xF6]rsta[\s\xa0]*Timot(?:heo|eu)sbrevet|(?:Prv(?:(?:(?:[y\xFD][\s\xa0]*list|\xE1[\s\xa0]*kniha|a[\s\xa0]*kniha)[\s\xa0]*T|[y\xE1\xFD][\s\xa0]*T)imotej?|(?:n[i\xED]|a)[\s\xa0]*Timote|n[i\xED][\s\xa0]*Timotej)|(?:Prvn[i\xED]|I\.?)[\s\xa0]*list[\s\xa0]*Tim(?:otej?|ete))ovi|(?:Prva|I\.?)[\s\xa0]*Timotejovi|(?:Barua[\s\xa0]*ya[\s\xa0]*Kwanza[\s\xa0]*kw|Kwanz|Waraka[\s\xa0]*wa[\s\xa0]*Kwanza[\s\xa0]*kw)a[\s\xa0]*Timotheo|Primeir[ao][\s\xa0]*Tim[o\xF3]teo|(?:Una(?:ng)?|Prima)[\s\xa0]*Timoteo|Primer[\s\xa0]*Timoteo|(?:Prim(?:a[\s\xa0]*lettera[\s\xa0]*a|(?:er)?o)|Una(?:ng)?[\s\xa0]*Kay|I\.?[\s\xa0]*Kay)[\s\xa0]*Timoteo|(?:Premi(?:\xE8re|ere?)[\s\xa0]*Timoth[e\xE9]|I\.?[\s\xa0]*Timoth\xE9|Premye[\s\xa0]*Timot|Premi(?:\xE8re|ere?)s[\s\xa0]*Timoth[e\xE9]|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Timoteuskirj)e|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Timoteukselle|(?:Ensimm[a\xE4]inen|I\.?)[\s\xa0]*Kirje[\s\xa0]*Timoteukselle|(?:t(?:im(?:otʰ(?:īl[aā][iī]|il[aā][iī])[\s\xa0]*pahilo|atʰtʰ[aā]l[aā][\s\xa0]*pahile)|īmatʰtʰ[aā]l[aā][\s\xa0]*pahile)[\s\xa0]*patr|Koiro[\s\xa0]*Ximootiyoos|Per[sš]e[\s\xa0]*poslannja[\s\xa0]*apostola[\s\xa0]*Pavla[\s\xa0]*do[\s\xa0]*Tymofij|(?:Prva|I\.?)[\s\xa0]*Timoteju[\s\xa0]*Poslanic)a|(?:Pierwsz[aey]|I\.?)[\s\xa0]*Tymoteusza|(?:Pierwsz[aey]|I\.?)[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|Прво[\s\xa0]*Тимотеј|Прв[ао][\s\xa0]*писмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|Прва[\s\xa0]*посланица[\s\xa0]*Тимотеју|I\.?[\s\xa0]*п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|осланица[\s\xa0]*Тимотеју)|(?:(?:رسالة[\s\xa0]*بولس[\s\xa0]*الرسول|الرسالة)[\s\xa0]*الأولى[\s\xa0]*إلى[\s\xa0]*تيموثاو|(?:اوّل|۱)۔تیمتھی|(?:اوّل|۱)[\s\xa0]*تیمِتھُی)س|(?:اوّل|۱)[\s\xa0]*تِیمُتھِیُس|(?:اوّل|۱)\-?تِیمُتھِیُس|Първ(?:о[\s\xa0]*(?:послание[\s\xa0]*към[\s\xa0]*)?|а[\s\xa0]*)Тимоте[ий]|I\.?[\s\xa0]*Тимофію|F(?:yrra[\s\xa0]*br[e\xE9]f[\s\xa0]*P[a\xE1]ls[\s\xa0]*til[\s\xa0]*T[i\xED]m[o\xF3]t|\xF8rste[\s\xa0]*Tim)|אגרת[\s\xa0]*פולוס[\s\xa0]*הראשונה[\s\xa0]*אל\-?טימות|Α['ʹʹ΄’][\s\xa0]*Τιμ?|Kwanza[\s\xa0]*Tim|Els[oő][\s\xa0]*Tim|Prvn[i\xED][\s\xa0]*Tim|I(?:\.[\s\xa0]*(?:Tim(?:ot(?:e(?:us)?|h(?:eo)?))?|Тим)|[\s\xa0]*(?:Tim(?:ot(?:e(?:us)?|h(?:eo)?))?|Тим))|Първ[ао][\s\xa0]*Тим|First[\s\xa0]*Ti(?:m(?:oth)?)?|Eerste[\s\xa0]*Tim|Прва[\s\xa0]*Тимотеј|(?:Pierwsz[aey]|I\.?)[\s\xa0]*Tym|Първо[\s\xa0]*послание[\s\xa0]*на[\s\xa0]*св(?:\.[\s\xa0]*ап\.?|[\s\xa0]*ап\.?)[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимотея|I\.?[\s\xa0]*Ти\xADмофія|I\.?[\s\xa0]*послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Перш[ае][\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))|1(?:[\s\xa0]*(?:த(?:ிமொ|ீமோ)த்தேயு|طيم|ทธ|तीमथ्[थय]ाला|t(?:īmatʰtʰ[aā]l[aā]|imatʰtʰ[aā]l[aā])|ਤਿਮੋਥਿਉਸ[\s\xa0]*ਨੂੰ|T(?:im(?:ot(?:t[eē]yuvukku|eo|y|heo)|ōtt[eē]yuvukku|\xF3teo)|īm[oō]tt[eē]yuvukku|m))|st(?:\.[\s\xa0]*T(?:imoth?y|m)|[\s\xa0]*T(?:imoth?y|m))|티모|[\s\xa0]*ทิโมธี|[\s\xa0]*ତୀମଥିଙ୍କ|[\s\xa0]*Тимоте(?:[ий]|ју)|[\s\xa0]*तिमोथीलाई|[\s\xa0]*तिमुथियुस|[\s\xa0]*तीमु(?:ाथै|थि)युस|[\s\xa0]*timotʰil[aā][iī]|[\s\xa0]*timotʰīl[aā][iī]|(?:[\s\xa0]*(?:T\xED|Xi)|Ti)m|(?:st\.?)?[\s\xa0]*Tomothy|(?:st\.?)?[\s\xa0]*Thimoth?y|[\s\xa0]*Ti(?:\-?m\xF4\-?|m\xF4)th\xEA|(?:e(?:\.[\s\xa0]*Timot(?:he[u\xFC]|e[u\xFC])|[\s\xa0]*Timot(?:he[u\xFC]|e[u\xFC]))|[\s\xa0]*(?:Tim(?:\xF3t|oth?)e|timotʰi)u|[\s\xa0]*T(?:eemuathaiy|imoti)u)s|[\s\xa0]*Tim\xF3theosz|[\s\xa0]*[ei]\.?[\s\xa0]*Timoteut|[\s\xa0]*(?:list[\s\xa0]*Tim(?:otej?|ete)|k\.?[\s\xa0]*Timotej?)ovi|[ao](?:\.[\s\xa0]*Tim[o\xF3]|[\s\xa0]*Tim[o\xF3])teo|[\xB0\xBA][\s\xa0]*Timoteo|[\xB0\xBA]\.[\s\xa0]*Timoteo|(?:er(?:e(?:\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9])|\xE8?re(?:\.[\s\xa0]*Timoth[e\xE9]|[\s\xa0]*Timoth[e\xE9]))e|[\s\xa0]*K(?:irje[\s\xa0]*Timoteukselle|a(?:ng|y)[\s\xa0]*Timoteo)|[\s\xa0]*Tymoteusza|[\s\xa0]*List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|[\s\xa0]*п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|осланица[\s\xa0]*Тимотеју)|\.(?:[\s\xa0]*(?:T(?:i(?:m(?:ot(?:h(?:e(?:u(?:sbrev|m)|e|osz)|y)|y|(?:he\xFC|iu)s|heosbrevet|e(?:u(?:s(?:hoz|nak|brevet)|t)|\xFCs|i|yos|ovi|jovi))|\xF4th\xEA|\xF3teo|\xF3teusnak|\xF3theosz|\xF3teushoz)|\-?m\xF4\-?th\xEA)|omothy|\xED?m|himoth?y|eemuathaiyus)|त(?:िम(?:ुथियुस|ोथीलाई)|ीमु(?:ाथै|थि)युस)|Тимоте(?:[ий]|ју)|ତୀମଥିଙ୍କ|ทิโมธี|timotʰ[iī]l[aā][iī]|list[\s\xa0]*Tim(?:otej?|ete)ovi|Timot(?:euskirj|h\xE9)e|Timoteukselle|K(?:irje[\s\xa0]*Timoteukselle|a(?:ng|y)[\s\xa0]*Timoteo)|Timoteju[\s\xa0]*Poslanica|Tymoteusza|List[\s\xa0]*(?:[sś]w\.?[\s\xa0]*Pawła[\s\xa0]*)?do[\s\xa0]*Tymoteusza|п(?:исмо[\s\xa0]*од[\s\xa0]*апостол[\s\xa0]*Павле[\s\xa0]*до[\s\xa0]*Тимотеј|осланица[\s\xa0]*Тимотеју))|(?:[o\xBA]\.|[o\xBA])[\s\xa0]*Timoteo)|(?:\.(?:[\s\xa0]*تیمِتھُ|۔تیمتھ)|[\s\xa0]*تیمِتھُ|۔تیمتھ)یس|\.?[\s\xa0]*تِیمُتھِیُس|\.\-?تِیمُتھِیُس|(?:(?:[ея]\.?|\.)?[\s\xa0]*Тимете|\.?[\s\xa0]*Тимоф[еі]|[ея]\.?[\s\xa0]*Тимофе|(?:[ея]\.?|\.)?[\s\xa0]*к[\s\xa0]*Тимофе)ю|st(?:\.[\s\xa0]*Ti(?:m(?:oth)?)?|[\s\xa0]*Ti(?:m(?:oth)?)?)|e\.?[\s\xa0]*Tim|[\s\xa0]*(?:த(?:ீமோத்|ிமொ)|तीम|Tim(?:ot[eh])?)|[\s\xa0]*Тим(?:отеј)?|[\s\xa0]*तिमोथी|[\s\xa0]*Tym|\.[\s\xa0]*(?:T(?:im(?:ot(?:e(?:us(?:brev)?|o)?|h(?:e(?:us|o))?)|\xF3teus)?|ym)|त(?:िमोथी|ीम)|Тим(?:отеј)?)|\.?[\s\xa0]*Ти\xADмофія|\.?[\s\xa0]*послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|\-?(?:а(?:\.[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))|[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія)))|(?:е(?:\.[\s\xa0]*(?:Тим(?:оф[еі]|ете)|к[\s\xa0]*Тимофе)|[\s\xa0]*(?:Тим(?:оф[еі]|ете)|к[\s\xa0]*Тимофе))|я(?:\.?[\s\xa0]*Тимет|\.?[\s\xa0]*Тимоф|\.?[\s\xa0]*к[\s\xa0]*Тимоф)е)ю|е\.?[\s\xa0]*Тимоте[ий]|تِیمُتھِیُس|е\.?[\s\xa0]*Ти\xADмофія|е\.?[\s\xa0]*послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|ше(?:\.[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))|[\s\xa0]*(?:послання[\s\xa0]*(?:до[\s\xa0]*Тимотея|Тимофію|до[\s\xa0]*Тимофія|апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Тимофія|св\.?[\s\xa0]*апостола[\s\xa0]*Павла[\s\xa0]*до[\s\xa0]*Ти\xADмофія)|Ти(?:мо(?:те[ий]|фію)|\xADмофія))))))|(?:Timotheum[\s\xa0]*I)|(?:[1I]\.?[\s\xa0]*Timoteju)|(?:提(?:摩(?:太前[书書]|斐前)|前)》|[1I]\.?[\s\xa0]*Ti|弟茂德前書》|《(?:提(?:摩(?:太前[书書]|斐前)|前)|弟茂德前書)|Timothy|ad[\s\xa0]*Timotheum[\s\xa0]*I|הראשונה[\s\xa0]*אל[\s\xa0]*טימותיוס|Timoth|Prva[\s\xa0]*(?:poslanica[\s\xa0]*)?Timoteju)|(?:提(?:摩(?:太前[书書]|斐前)|前)|弟茂德前書))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Deut"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:5[\s\xa0]*(?:M(?:oseb(?:\xF3k|og)|\xF3seb[o\xF3]k)|Мојсијева|Moseboken)|Femte[\s\xa0]*Moseboken)|(?:(?:(?:V\.[\s\xa0]*Mojz[i\xED]|Piata[\s\xa0]*Mojzi)[sš]ov|Dezy[e\xE8]m[\s\xa0]*liv[\s\xa0]*Lalwa[\s\xa0]*|(?:Pi(?:ąta[\s\xa0]*Moj[zż]|ata[\s\xa0]*Moj[zż])|V\.[\s\xa0]*Moj[zż])eszow|V[\s\xa0]*Moj(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)|5(?:\.[\s\xa0]*Mo(?:j(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)|oseksen[\s\xa0]*kirj)|[\s\xa0]*Mo(?:j(?:z(?:[i\xED][sš]ov|eszow)|ž[i\xED][sš]ov|żeszow)|oseksen[\s\xa0]*kirj)))a|5(?:[\s\xa0]*Moj(?:ż|z)?|\.[\s\xa0]*Moj[zż])|V[\s\xa0]*Moj[zż]|Sharciga[\s\xa0]*Kunoqoshadiisa)|(?:D(?:e(?:ut(?:eron(?:om(?:i(?:y[ao]|[ao]|um)|[ae]|ya|ul)|m(?:io|y)|\xF4mio|\xF3mio|\xF3mium)|(?:orono?|rono?)mio|(?:orono?|rono?)my)|et(?:[eo]rono?|rono?)my|yuteronomyo|(?:te[rw]on[o\xF2]|warie)m)|ueteronmy|tn|uetrono?my|uetorono?my|uut(?:[eo]rono?|rono?)my|ueteronomy|(?:i?yuteronomy|ueteronomi)o)|《申(?:命[紀記记])?》|신명기|申命|ฉธบ|דברים|ବିବରଣି|अनुवाद|anuw[aā]d|ا(?:ِستِثنا|ستثناء)|istis̱nā|משנה[\s\xa0]*תורה|ਬਿਵਸਥਾ[\s\xa0]*ਸਾਰ|உபாகமம்|இ(?:ணைச்[\s\xa0]*சட்டம்|ச)|Второзакон(?:ие|ня)|bivastʰā[\s\xa0]*sār|Δευτερον[οό]μιον|Up[aā]kamam|ଦ୍ୱିତୀୟ[\s\xa0]*ବିବରଣୀ|سفر[\s\xa0]*التثنية|ت(?:ثنية[\s\xa0]*الإشتراع|َثنِيَة)|ZarW|Femte[\s\xa0]*Mosebo[gk]|เฉลย(?:​ธรรม​|ธรรม)บัญญัติ|व्य(?:वस्था(?:को[\s\xa0]*पुस्तक|[\s\xa0]*?विवरण)|्वस्थाविवरन|ावस्था)|Li(?:gji[\s\xa0]*i[\s\xa0]*P[e\xEB]rt[e\xEB]rir[e\xEB]|P)|По(?:вт(?:орен(?:ня[\s\xa0]*Закону|и[\s\xa0]*закони)|\.?[\s\xa0]*Закону)|н(?:овљени[\s\xa0]*закони|з))|M(?:[a\xE1]sodik[\s\xa0]*t[o\xF6]rv[e\xE9]nyk[o\xF6]nyv|[o\xF3]zes[\s\xa0]*V|T[o\xF6]rv)|(?:M[o\xF3]zes[\s\xa0]*[o\xF6]t[o\xF6]dik[\s\xa0]*k[o\xF6]nyv|Deut\xE9ronom)e|Fimmta[\s\xa0]*b[o\xF3]k[\s\xa0]*M[o\xF3]se|F[u\xFC]nfte[\s\xa0]*Mose|F[u\xFC]nfte[\s\xa0]*Buch[\s\xa0]*Mose|5(?:[\s\xa0]*(?:M(?:\xF3s|z)|Мојс|Buch[\s\xa0]*Mose)|\.[\s\xa0]*(?:Buch[\s\xa0]*Mose|Mosebog))|(?:П(?:ет(?:та[\s\xa0]*книга[\s\xa0]*Мој|а[\s\xa0]*книга[\s\xa0]*Мои)|['’]ята[\s\xa0]*книга[\s\xa0]*Мо[ий])|5[\s\xa0]*Мои)сеева|(?:Пета|5\.)[\s\xa0]*Мојсијева|(?:5(?:\.[\s\xa0]*Moseb\xF3|[\s\xa0]*Mosebo)|vyavastʰ[aā]ko[\s\xa0]*pusta)k|Fimmta[\s\xa0]*M[o\xF3]seb[o\xF3]k|5\.[\s\xa0]*M\xF3seb[o\xF3]k|5(?:[\s\xa0]*M(?:o(?:ze|o)|\xF3ze)|M\xF3)s|5\.[\s\xa0]*Mozes|V(?:\.[\s\xa0]*(?:M(?:o(?:seb[o\xF3]k|j[zż])|\xF3seb[o\xF3]k)|Мојсијева)|[\s\xa0]*(?:M[o\xF3]seb[o\xF3]k|Мојсијева|Moj)|\.?[\s\xa0]*Mozes|ijfde[\s\xa0]*Mozes)|(?:Vyavasthaavivara|5\.[\s\xa0]*Moseboke)n|(?:Andharaning[\s\xa0]*Tor[e\xE8]|Đệ[\s\xa0]*nhị[\s\xa0]*luậ)t|P(?:o(?:vtorennja[\s\xa0]*Zakonu|novljeni[\s\xa0]*zakon)|nz|wt|angandharing[\s\xa0]*Toret|hục[\s\xa0]*truyền[\s\xa0]*luật[\s\xa0]*lệ[\s\xa0]*k\xFD|i(?:ąta[\s\xa0]*Moj[zż]|ata[\s\xa0]*Moj[zż]))|(?:Liber[\s\xa0]*Deuteronomi|Sharc)i|Вт(?:ор(?:озак)?)?|உபா|신명?|استثنا|Δε(?:υτ(?:ερ(?:ον[οό]μιο)?)?)?|D(?:e(?:u(?:t(?:eronom(?:i|y)?)?)?|t)?|(?:ue)?t)|ଦ୍ୱିତୀୟ[\s\xa0]*ବିବରଣ|تث|Femte[\s\xa0]*Mos|5(?:[\s\xa0]*(?:M(?:o(?:se?|z)?|\xF3z)?|М)|\.[\s\xa0]*Mo(?:s(?:e(?:bok)?)?)?)|(?:Пета|5\.)[\s\xa0]*Мојс|5\.[\s\xa0]*M\xF3s|V(?:\.[\s\xa0]*(?:M[o\xF3]s|Мојс)|[\s\xa0]*(?:M[o\xF3]s|Мојс))|(?:(?:5[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED]|V\.[\s\xa0]*Mojž[i\xED]|(?:V\.?|5\.)[\s\xa0]*kniha[\s\xa0]*Moj[zž][i\xED])[sš]ov|V(?:iides|\.)?[\s\xa0]*Mooseksen[\s\xa0]*kirj|Zaarettido[\s\xa0]*Woga|5[\s\xa0]*k[\s\xa0]*Moj[zž]i[sš]ov|5[\s\xa0]*k\.[\s\xa0]*Moj[zž]i[sš]ov|P(?:(?:\xE1t[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED]|Moj[zž][i\xED])|at[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*Moj[zž][i\xED]|Moj[zž][i\xED]))[sš]|iata[\s\xa0]*(?:kniha[\s\xa0]*Moj[zž]i[sš]|Mojži[sš]))ov)a|(?:Pi(?:ąta[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż])|ata[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż]))|(?:5\.?|V\.?)[\s\xa0]*Ks(?:\.[\s\xa0]*Moj[zż]|[\s\xa0]*Moj[zż]|i[eę]g[ai][\s\xa0]*Moj[zż]))eszowa|K(?:s(?:\.[\s\xa0]*Powt(?:[o\xF3]rzonego)?|[\s\xa0]*Powt(?:[o\xF3]rzonego)?|i[eę]g[ai][\s\xa0]*Powt(?:[o\xF3]rzonego)?)[\s\xa0]*Prawa|(?:itabu[\s\xa0]*cha[\s\xa0]*Tano[\s\xa0]*cha[\s\xa0]*Mus|umbukumbu[\s\xa0]*la[\s\xa0]*Sheri)a|um(?:bukumbu[\s\xa0]*la[\s\xa0]*Torati|b)?))|(?:《申命[紀記记]|Повт|申(?:命[紀記记])?》|ਬਿਵਸਥਾ|التثنية|Kumbukumbu|व्यवस्थाको|vyavastʰ[aā]ko|5[\s\xa0]*Mooseksen|5\.[\s\xa0]*Mooseksen|V(?:iides|\.)?[\s\xa0]*Mooseksen|Ligji[\s\xa0]*i[\s\xa0]*p\xEBrt\xEBrir\xEB|申(?:命[紀記记])?|《申|व्यवस्था|Phục(?:[\s\xa0]*Truyền(?:[\s\xa0]*Luật[\s\xa0]*Lệ)?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Titus"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Τ(?:[ίι]το|τ)|تي|딛|디도서|ﺗﻴﻄﺲ|《(?:提多[书書]|多|提特書|弟鐸書)》|ท(?:ิตัส|ต)|テ(?:トス(?:への(?:て[かが]み|手紙|書)|ヘの手紙|書)|ィトに達する書)|티토(?:에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|Προς[\\s\\xa0]*Τ[ίι]τον|ਤੀਤੁਸ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|tītus[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī|Kirje[\\s\\xa0]*Titukselle|ତୀତସଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|ṭiṭus[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|पौलाचे[\\s\\xa0]*तीताला[\\s\\xa0]*पत्र|तीत(?:सलाई[\\s\\xa0]*प(?:ावलको[\\s\\xa0]*प)?त्र|ुस)|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*טיטוס|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*אל\\-?טיטוס|Br(?:\\xE9f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*T[i\\xED]|ef[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*T[i\\xED])tusar|Ka(?:ng|y)[\\s\\xa0]*Tito|(?:Warak|Baru)a[\\s\\xa0]*kwa[\\s\\xa0]*Tito|L(?:ist[\\s\\xa0]*T[i\\xED]tovi|ettera[\\s\\xa0]*a[\\s\\xa0]*Tito)|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Titum|T(?:i(?:t(?:us(?:arbr[e\\xE9]fi\\xF0|brevet|z?hoz)|[e\\xF4]|it|tuvukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam)|itu)|\\xEDtusarbr[e\\xE9]fi\\xF0|\\xEDch|t|yt|īttuvukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam)|தீத்து(?:வுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:நிருப|கடித|திருமுக)|க்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*திருமுக)ம்|(?:رسالة[\\s\\xa0]*بولس[\\s\\xa0]*الرسول|الرسالة)[\\s\\xa0]*إلى[\\s\\xa0]*تيطس|ط(?:ِطُس[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*(?:پولس[\\s\\xa0]*رسُول[\\s\\xa0]*)?کا[\\s\\xa0]*خط|طس[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*کا[\\s\\xa0]*خط|يطس)|Tiitos|Teetus|Brevet[\\s\\xa0]*til[\\s\\xa0]*Titus|Brevet[\\s\\xa0]*till[\\s\\xa0]*Titus|(?:t(?:īt(?:a(?:sl[aā][iī]|l[aā])|āl[aā])|it(?:a(?:sl[aā][iī]|l[aā])|āl[aā]))[\\s\\xa0]*patr|List[\\s\\xa0]*(?:[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*)?do[\\s\\xa0]*Tytus)a|P(?:a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Titus|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Titu)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*Tyta)|T(?:i(?:t(?:us(?:arbr[e\\xE9]f|z)|i)?|it)?|\\xEDt(?:usarbr[e\\xE9]f)?)|Τ[ίι]τ|テトスへ?|티토|तीतस|தீத்(?:து)?|طي|П(?:ослан(?:и(?:е[\\s\\xa0]*к(?:ъм[\\s\\xa0]*Тит|[\\s\\xa0]*Титу)|ца[\\s\\xa0]*Титу)|[\\s\\xa0]*ня[\\s\\xa0]*до[\\s\\xa0]*Тита|ие[\\s\\xa0]*на[\\s\\xa0]*св\\.?[\\s\\xa0]*ап[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Тита|ие[\\s\\xa0]*на[\\s\\xa0]*св\\.?[\\s\\xa0]*ап\\.[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Тита|ня[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*)?апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Тита)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*Тит))|(?:(?:弟鐸書|多)》|Тит[ау]|提(?:多[书書]|特書)》|《(?:提多[书書]|多|提特書|弟鐸書)|ط(?:ِطُ|ط)س|К[\\s\\xa0]*Титу|ତୀତସଙ୍କ|До[\\s\\xa0]*Тита|ad[\\s\\xa0]*Titum|אל[\\s\\xa0]*טיטוס|t(?:īt(?:a(?:sl[aā][iī]|l[aā])|āl[aā])|it(?:a(?:sl[aā][iī]|l[aā])|āl[aā]))|ਤੀਤੁਸ[\\s\\xa0]*ਨੂੰ|T(?:it(?:u(?:kselle|[ms])|ovi)|\\xEDtovi|ytusa)|तीत(?:ाला[\\s\\xa0]*पत्र|सलाई)|T[iī]ttuvukku|提(?:多[书書]|特書)|弟鐸書|多|Тит|ਤੀਤੁਸ|Tit[ou]|तीताला|tītus|P(?:aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*Titus|oslanica[\\s\\xa0]*Titu)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Heb"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:ฮ(?:ีบรู|บ)|Εβρ|Ἑβ|ଏବ୍ରୀ|Евреи|Євре[ії]|Žd|《(?:希伯(?:來[书書]|来书)|[來来]|耶烏雷爾)》|へ[フブ]ル人への手紙|ヘ[フブ](?:ル(?:(?:人への)?書|人への手紙)|ライ(?:人への手紙|書))|히브리(?:인들에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|Προς[\\s\\xa0]*Εβρα[ίι]ους|Mga[\\s\\xa0]*(?:He|E)breo|(?:Mga[\\s\\xa0]*Hebrohan|Ibraaaniy)on|H(?:e(?:b(?:r(?:e(?:abr[e\\xE9]fi\\xF0|u[sx]|s|ws|os|ohanon|e(?:[e\\xEB]n|s|rbrevet))|(?:r|w|o)?s|\\xE4er|aee?r|[\\xE6\\xE9]erbrevet)|(?:o[eor]|e[eo]|er?|o)s)|[ew]brews)|\\xEA\\-?bơ\\-?rơ|\\xE9breux|brews|wbrews|w[ew]brews)|הא(?:יגרת[\\s\\xa0]*אל[\\s\\xa0\\-?]*|גרת[\\s\\xa0]*אל\\-?)העברים|इब्रान(?:ियों|ी)|ਇਬਰਾਨੀਆਂ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|ibrānīāṃ[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī|(?:Hebreai|Ży)d|Heber[\\s\\xa0]*lev[e\\xE9]l|H\\xE9ber[\\s\\xa0]*lev[e\\xE9]l|Z(?:sid[o\\xF3]khoz[\\s\\xa0]*[i\\xED]rt[\\s\\xa0]*lev[e\\xE9]l|y?d)|List[\\s\\xa0]*do[\\s\\xa0]*(?:Hebrajczyk[o\\xF3]|[ZŻ]yd[o\\xF3])w|(?:He(?:prealaiskirj|brenjv)|Ibraaw|Kirje[\\s\\xa0]*he[bp]realaisill)e|Brevet[\\s\\xa0]*til[\\s\\xa0]*(?:Hebr\\xE6|hebre)erne|الرسالة[\\s\\xa0]*إلى[\\s\\xa0]*العبرانيين|इब्री[\\s\\xa0]*लोकांस[\\s\\xa0]*पत्र|हिब्रूहरूको[\\s\\xa0]*निम्ति[\\s\\xa0]*पत्र|ʿibrāniyōṅ[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|(?:B(?:r[e\\xE9]fi\\xF0[\\s\\xa0]*til[\\s\\xa0]*Hebre|arua[\\s\\xa0]*kwa[\\s\\xa0]*Waebrani)|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Waebrani|Cibraaniyad|ibr[iī][\\s\\xa0]*lok[aā][mṃ]s[\\s\\xa0]*patr|hibr[uū]har[uū]ko[\\s\\xa0]*nimti[\\s\\xa0]*patr)a|P(?:avlova[\\s\\xa0]*poslanica[\\s\\xa0]*Hebrejima|oslannja[\\s\\xa0]*do[\\s\\xa0]*jevre[i\\xEF]v)|(?:L(?:ettera[\\s\\xa0]*agli[\\s\\xa0]*Ebre|ayang[\\s\\xa0]*Ibran)|Do[\\s\\xa0]*Th\\xE1)i|H(?:e(?:b(?:e(?:r[eorw]|w[erw])|w(?:er|re)|(?:o[eor]|e[eo])[eor]|r(?:r[eorw]|we|o[eor]|e(?:ww|r)))|[ew]breww)|(?:w[ew]|w)?breww)s|(?:List[\\s\\xa0]*(?:Hebrej[ouů]|[ZŽ]id[uů])|[ZŽ]ido)m|E(?:pi(?:reyarukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|stula[\\s\\xa0]*ad[\\s\\xa0]*Hebraeos)|vrei|bre)|எபிர(?:ேயர(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:திருமுக|கடித)ம)?|ெயருக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*நிருபம)்|ع(?:برانیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*(?:پولس[\\s\\xa0]*رسول[\\s\\xa0]*)?|ِبرانیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*)کا[\\s\\xa0]*خط|Јев|H(?:e(?:b(?:r(?:ew)?)?|pr)?|\\xE9(?:br?)?|br)|ヘ[フブ](?:ル人へ|ライ)|Евр|Εβ|Євр|Ibra|Cib|히브?|इब्रानि|Žid|Z(?:sid(?:[o\\xF3]k)?|id)|हिब्रू|E(?:br?|vr)|எபி(?:ரே)?|عب|П(?:ослан(?:и(?:е[\\s\\xa0]*(?:на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Евреите|к(?:ъм[\\s\\xa0]*евреите|[\\s\\xa0]*Евреям))|ца[\\s\\xa0]*Јеврејима)|(?:[\\s\\xa0]*ня[\\s\\xa0]*до[\\s\\xa0]*Євре[ії]|ня[\\s\\xa0]*до[\\s\\xa0]*євре[ії])в)|исмо[\\s\\xa0]*до[\\s\\xa0]*Евреите))|(?:(?:希伯(?:來[书書]|来书)|[來来]|耶烏雷爾)》|《(?:希伯(?:來[书書]|来书)|[來来]|耶烏雷爾)|Евреите|Евреям|К[\\s\\xa0]*Евреям|Εβρα[ίι]ους|Євре[ії]в|До[\\s\\xa0]*євре[ії]в|אל[\\s\\xa0]*העברים|عِ?برانیوں|Јеврејима|Zsid[o\\xF3]khoz|العبرانيين|ibrānīāṃ|Epireyarukku|ਇਬਰਾਨੀਆਂ[\\s\\xa0]*ਨੂੰ|इब्री[\\s\\xa0]*लोकांस|(?:Zid[uů]|Žid[uů])m|ibr[iī][\\s\\xa0]*lok[aā][mṃ]s|ad[\\s\\xa0]*Hebraeos|[ZŻ]yd[o\\xF3]w|H(?:e(?:br(?:a(?:jczyk[o\\xF3]w|eos)|e(?:j[ouů]m|o)|[e\\xE6]erne)|prealaisille)|\\xEA)|(?:Ibran|Ebre)i|hibr[uū]har[uū]ko[\\s\\xa0]*nimti|हिब्रूहरूको[\\s\\xa0]*निम्ति|希伯(?:來[书書]|来书)|[來来]|耶烏雷爾|इब्री|Waebrania|Hebrejima|Poslanica[\\s\\xa0]*Hebrejima))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Phillipians)|(?:Филип['’]яни)|(?:《(?:腓立比[书書]|肥利批|腓|斐理伯書)》|빌립보서|Φι|ﻓﻴﻠﻴﺒﻲ|ฟ(?:ีลิปปี|ป)|[ヒピ]リ[ヒピ](?:人への)?書|[ヒピ]リ[ヒピ]人への手紙|フィリ[ヒピ](?:の信徒への手紙|人への手紙|書)|Флп|필리피(?:[\\s\\xa0]*신자들에게[\\s\\xa0]*보낸[\\s\\xa0]*서간|서)|F(?:ili(?:p(?:p(?:\\xEDbr[e\\xE9]fi\\xF0|erbrevet|ibr[e\\xE9]fi\\xF0)|en(?:s[o\\xF3]w|i))|boy)|l?p)|Προς[\\s\\xa0]*Φιλιππησ[ίι]ους|ਫ਼ਿਲਿੱਪੀਆਂ[\\s\\xa0]*ਨੂੰ[\\s\\xa0]*ਪੱਤ੍ਰੀ|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*Pilipyano|filipp(?:iyōṅ[\\s\\xa0]*ke[\\s\\xa0]*nām[\\s\\xa0]*kā[\\s\\xa0]*ḫaṭ|īāṃ[\\s\\xa0]*nū̃[\\s\\xa0]*pattrī)|ଫିଲି‌ପ୍‌ପୀୟଙ୍କ[\\s\\xa0]*ପ୍ରତି[\\s\\xa0]*ପତ୍ର|पौलाचे[\\s\\xa0]*फिलिप्पैकरांस[\\s\\xa0]*पत्र|फिलिप्(?:प(?:ीहरूलाई[\\s\\xa0]*प(?:ावलको[\\s\\xa0]*प)?त्र|ियों)|‍पी)|Lettera[\\s\\xa0]*ai[\\s\\xa0]*Filippesi|Layang[\\s\\xa0]*Paulus[\\s\\xa0]*Filipi|Waraka[\\s\\xa0]*kwa[\\s\\xa0]*Wafilipi|B(?:r[e\\xE9]f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*Filipp[i\\xED]manna|arua[\\s\\xa0]*kwa[\\s\\xa0]*Wafilipi)|האיגרת[\\s\\xa0]*אל[\\s\\xa0]*הפיליפים|א(?:גרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל\\-?|ל[\\s\\xa0]*)הפיליפיים|الرسالة[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*فيلبي|رسالة[\\s\\xa0]*(?:بولس[\\s\\xa0]*الرسول[\\s\\xa0]*إلى[\\s\\xa0]*أهل[\\s\\xa0]*)?فيلبي|பிலிப்பியர(?:ுக்கு[\\s\\xa0]*எழுதிய[\\s\\xa0]*(?:நிருப|கடித|திருமுக)ம)?்|ف(?:ِل(?:ِپ(?:ّیُوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*پو[\\s\\xa0]*لس[\\s\\xa0]*رسُول|ِّیوں[\\s\\xa0]*کے[\\s\\xa0]*نام)[\\s\\xa0]*کا[\\s\\xa0]*خط|پّیوں)|لپیوں[\\s\\xa0]*کے[\\s\\xa0]*نام[\\s\\xa0]*کا[\\s\\xa0]*خط|ي)|(?:Mga[\\s\\xa0]*Taga(?:\\-?(?:[\\s\\xa0]*[FP]|F)|[\\s\\xa0]*[FP])ilipo|Filipense|Epistula[\\s\\xa0]*ad[\\s\\xa0]*Philippense)s|Filippiekhez|Flippiekhez|(?:List[\\s\\xa0]*Filip(?:sk[y\\xFD]|ano)|Filipensk[y\\xFD])m|(?:Filip(?:pil[a\\xE4]iskirj|ian[e\\xEB]v)|Kirje[\\s\\xa0]*filippil[a\\xE4]isill|Sulat[\\s\\xa0]*sa[\\s\\xa0]*mga[\\s\\xa0]*[FP]ilipens)e|Filippenserne|pʰilipp(?:[iī]har[uū]l[aā][iī]|aikar[aā][mṃ]s)[\\s\\xa0]*patra|Filip(?:p(?:aiyo|enze)|ye)n|List[\\s\\xa0]*(?:[sś]w\\.?[\\s\\xa0]*Pawła[\\s\\xa0]*)?do[\\s\\xa0]*Filipian|P(?:h(?:i(?:l(?:(?:(?:l(?:ip(?:p(?:i[ei]|pi)|ii)|l(?:ipi|p|i?pp)i)|p(?:pii|e|ppi))a|l(?:ip(?:ia[ai]|pi?ai)|p(?:ie|a))|pai|lipaia|lipiea)ns|(?:(?:l(?:li)?p|pp?)ia|lip(?:ai?|pia)|lipp?ea|lppia)ns|\\xEDpph\\xEA|pan|lipian|(?:lip(?:p[ai]|i)|pi|lipie)ns|ip(?:p(?:i(?:(?:a[ai]?|ia|e)?ns|beliekhez)|(?:pi|e)?ans|er|ains|aians)|(?:ai?|ia)ns|iaid|[ei]ns|(?:aia|ie|ea|iia)ns))|\\-?l\\xEDp)|lipp?ians|(?:lp)?p)|il(?:ippiyarukku[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|p)|iliphphisiyuusa|a(?:ulus['’][\\s\\xa0]*Brev[\\s\\xa0]*til[\\s\\xa0]*Filipperne|vlova[\\s\\xa0]*poslanica[\\s\\xa0]*Filipljanima)|oslannja[\\s\\xa0]*apostola[\\s\\xa0]*Pavla[\\s\\xa0]*do[\\s\\xa0]*fylyp['’]jan)|Филипјаните|[ヒピ]リ[ヒピ]人へ|빌|フィリ[ヒピ]|Фил(?:ипјани)?|필리|F(?:ili(?:p(?:pi)?)?|l)|फिलिप्प[िी]|Br[e\\xE9]f[\\s\\xa0]*P[a\\xE1]ls[\\s\\xa0]*til[\\s\\xa0]*Filipp[i\\xED]mann|אגרת[\\s\\xa0]*פולוס[\\s\\xa0]*השליח[\\s\\xa0]*אל\\-?הפיליפי|பிலி(?:ப்)?|فل|Ph(?:il(?:(?:(?:l(?:li)?p|pp?)ia|lip(?:ai?|pia)|lipp?ea|lppia)n|lip?|pp?|i(?:p(?:p(?:(?:pi|e)?an|ia?n)?|(?:ai?|ia)n)?)?)?|l(?:ipp?|p))|П(?:ослан(?:ня[\\s\\xa0]*(?:св(?:\\.[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*филип['’]|[\\s\\xa0]*апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*филип['’])|апостола[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*филип['’]|до[\\s\\xa0]*(?:Філіп['’]|филип['’]))ян|и(?:е[\\s\\xa0]*к(?:[\\s\\xa0]*Филиппи[ий]цам|ъм[\\s\\xa0]*филипяните)|ца[\\s\\xa0]*Филипљанима)|ие[\\s\\xa0]*на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Павла[\\s\\xa0]*до[\\s\\xa0]*Филипяни)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Павле[\\s\\xa0]*до[\\s\\xa0]*христијаните[\\s\\xa0]*во[\\s\\xa0]*Филипи))|(?:(?:腓(?:立比[书書])?|斐理伯書|肥利批)》|《(?:斐理伯書|肥利批|腓立比[书書])|filippīāṃ|ف(?:ِلِپّیُ|لپی)وں|До[\\s\\xa0]*филип['’]ян|Филип(?:['’]ян|яните|љанима)|אל[\\s\\xa0]*הפיליפים|Φιλιππησ[ίι]ους|Филиппи[ий]цам|К[\\s\\xa0]*Филиппи[ий]цам|Mga[\\s\\xa0]*Pilipyano|ਫ਼ਿਲਿੱਪੀਆਂ[\\s\\xa0]*ਨੂੰ|ଫିଲି‌ପ୍‌ପୀୟଙ୍କ|Wafilipi|Filip(?:sk[y\\xFD]m|ian|anom|pesi)|pʰilipp[iī]har[uū]l[aā][iī]|फिलिप्प(?:ैकरांस[\\s\\xa0]*पत्र|ीहरूलाई)|(?:(?:Taga(?:\\-?(?:[\\s\\xa0]*[FP]|F)|[\\s\\xa0]*[FP])|F)ilipo|pʰilippaikar[aā][mṃ]|ad[\\s\\xa0]*Philippense)s|Filipljanima|腓(?:立比[书書])?|斐理伯書|肥利批|《腓|Филипяни|Filipi|फिलिप्पैकरांस|(?:Filippil[a\\xE4]isill|Mga[\\s\\xa0]*[FP]ilipens)e|Filipperne|P(?:ilip(?:piyarukku|os)|hilippenses|oslanica[\\s\\xa0]*Filipljanima|hi|aulus’[\\s\\xa0]*brev[\\s\\xa0]*til[\\s\\xa0]*filipperne)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Dan"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:《(?:但(?:以理[书書])?|達尼爾)》|[タダ]ニエル書|다니엘서|단|דניאל|ਦਾਨੀਏਲ|Д(?:ан(?:и(?:[еяії]л|ло)|аил)|они[её]л)|Δ(?:ανι[ήη]λ|ν)|ด(?:าเนีย|น)ล|Đa(?:\\-?ni\\xEA|nie)n|Đa\\-?ni\\-?\\xEAn|\\xD0a\\-?ni\\-?\\xEAn|دانی(?:[\\s\\xa0‌]*ای|ا)ل|سفر[\\s\\xa0]*دانيال|(?:Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Danie|Liv[\\s\\xa0]*Dany[e\\xE8]l[\\s\\xa0]*)la|D(?:a(?:n(?:iel(?:in[\\s\\xa0]*kirja|s[\\s\\xa0]*Bog|e)|e)|aneela)|[ln])|दान(?:िय(?:लको[\\s\\xa0]*पुस्तक|्ये?ल)|ीएल्र)|(?:Dan(?:i[a\\xE8\\xEB]|y[i\\xEF])|T[aā][nṉ]iy[eē])l|D(?:a(?:an(?:iyy|ye)|n\\xED)|(?:\\xE1|ha)ni)el|Daniels[\\s\\xa0]*bok|d(?:ān(?:(?:ī(?:ʾī|e)|ie)l|iyalko[\\s\\xa0]*pustak)|an(?:iyalko[\\s\\xa0]*pustak|īel))|ଦାନିୟେଲଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ|Prophetia[\\s\\xa0]*Danielis|தானியேல(?:ின்[\\s\\xa0]*புத்தகம)?்|Д(?:ан(?:ил)?|он)|[タダ]ニエル|다니엘?|Δαν?|دا|D(?:a(?:n(?:ieli?)?|an)?|\\xE1n)|दान(?:ि(?:यल)?|ीएल)|ଦାନିୟେଲଙ|தானி|Книга[\\s\\xa0]*(?:пророка[\\s\\xa0]*Дани[иії]ла|на[\\s\\xa0]*пророк[\\s\\xa0]*Даниила?))|(?:但(?:以理[书書])?》|達尼爾》|Đa|《(?:但以理[书書]|達尼爾)|دانيال|Дани[иії]ла|Daniel(?:in|a)|दानियलको|Dany[e\\xE8]l|但(?:以理[书書])?|達尼爾|《但|Даниил|d(?:ani(?:yalko|el)|āniyalko)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jude"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Yihudaa)|(?:يهو|᾿Ιδ|Юд|[ІИ]уд|ย(?:ูดา|ด)|유다(?:[\\s\\xa0]*서간|서)|《(?:猶[大達]書|犹大书|[犹猶]|伊屋達)》|Ιο[υύ]δα|Gd|ユ[タダ](?:の(?:手紙|書)|からの手紙)|Ј(?:аковљевог|уде|д)|אי?גרת[\\s\\xa0]*יהודה|यहूदा(?:चें|को)[\\s\\xa0]*पत्र|ଯିହୂଦାଙ୍କ[\\s\\xa0]*ପତ୍ର|ਯਹੂਦਾਹ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਪੱਤ੍ਰੀ|(?:Epistula[\\s\\xa0]*Iuda|Giu\\-?đ)e|J(?:u(?:d(?:as(?:arbr[e\\xE9]fi\\xF0|brevet|[\\s\\xa0]*epistel)|ov(?:[\\s\\xa0]*List|a))|udaksen[\\s\\xa0]*kirje)|\\xFAdasarbr[e\\xE9]fi\\xF0|\\xFAdov[\\s\\xa0]*List|de|id)|یہُ?وداہ[\\s\\xa0]*کا[\\s\\xa0]*عام[\\s\\xa0]*خط|رسال(?:ى[\\s\\xa0]*القديس|ة)[\\s\\xa0]*يهوذا|yahūdāh[\\s\\xa0]*(?:kā[\\s\\xa0]*ʿām[\\s\\xa0]*ḫaṭ|dī[\\s\\xa0]*pattrī)|யூதா[\\s\\xa0]*(?:எழுதிய[\\s\\xa0]*(?:நிருப|கடித)|திருமுக)ம்|Y(?:u(?:t[aā][\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|d)|ūt[aā][\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|ihu)|Послание[\\s\\xa0]*Иуды|Hi\\xF0[\\s\\xa0]*almenna[\\s\\xa0]*br[e\\xE9]f[\\s\\xa0]*J[u\\xFA]dasar|Посланица[\\s\\xa0]*Јудина|Послание[\\s\\xa0]*на[\\s\\xa0]*Юда|П(?:ослание[\\s\\xa0]*на|исмо[\\s\\xa0]*од)[\\s\\xa0]*апостол[\\s\\xa0]*Јуда|Послання[\\s\\xa0]*Іуди|Послання[\\s\\xa0]*апостола[\\s\\xa0]*Юди|С(?:ъборно[\\s\\xa0]*послание[\\s\\xa0]*на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Иуда|оборне[\\s\\xa0]*послання[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*)?Юди)|(?:J(?:\\xFAd\\xE1|da|ud\\xE1|wda)|Yuuda)s|Hudas|San[\\s\\xa0]*Judas|Judas(?:['’][\\s\\xa0]*B|[\\s\\xa0]*b)rev|Poslannja[\\s\\xa0]*apostola[\\s\\xa0]*Judy|J(?:u(?:da(?:sarbr[e\\xE9]f)?|ud)|\\xFAd(?:asarbr[e\\xE9]f|as)?)|ユ[タダ]|يه|유|यहूदा|Jwd|Yuud|(?:yah(?:ūd(?:ā(?:ce[mṃ]|ko)|a(?:ce[mṃ]|ko))|ud(?:[aā]ce[mṃ]|[aā]ko))[\\s\\xa0]*patr|Judina[\\s\\xa0]*poslanic|Giuđ|Poslanica[\\s\\xa0]*Jude[\\s\\xa0]*apostol|Yahood|(?:Barua[\\s\\xa0]*ya[\\s\\xa0]*Y|I)ud)a|L(?:ist[\\s\\xa0]*(?:powszechny[\\s\\xa0]*[SŚ]wi[eę]tego[\\s\\xa0]*Iudasa[\\s\\xa0]*Apostoła|Jud(?:[uů]v|y)|[sś]w\\.?[\\s\\xa0]*Judy)|ettera[\\s\\xa0]*di[\\s\\xa0]*Giuda|ayang[\\s\\xa0]*Yudas))|(?:(?:伊屋達|犹大书)》|犹》|유다|猶(?:[大達]書)?》|《(?:伊屋達|犹大书|猶[大達]書)|யூதா|Иуд[аы]|Y(?:u(?:t[aā]|das)|ūt[aā])|Iudae|يهوذا|יהודה|ਯਹੂਦਾਹ|Юда|Јуд(?:ин)?а|یہُ?وداہ|यहूदा(?:चें|को)|ଯିହୂଦାଙ୍କ|yah(?:ūd(?:ā(?:ce[mṃ]|ko|h)|a(?:ce[mṃ]|ko))|ud[aā](?:ce[mṃ]|ko))|Giuda|J(?:u(?:d(?:[ey]|ina|[ouů]v|as’[\\s\\xa0]*brev)|udaksen)|\\xFAdov)|猶(?:[大達]書)?|伊屋達|犹大书|犹|《[犹猶]|Yuda|Judas|Послання[\\s\\xa0]*Юди))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:[\s\xa0]*Ma(?:c(?:c(?:ab(?:e(?:[is]|es)|\xE9es|e(?:e[eo]|o)s|be(?:e(?:[es]|os)|o?s))|cabbbe)|ab(?:e(?:[is]|aid)|bes|eus|b?ees|(?:b?ee[eo]|b?eo)s))|k(?:kab(?:e(?:e(?:[e\xEB]n|rbok)|usok)|[a\xE4]er|\xE6erbog)|abej(?:sk[a\xE1]|cov)))|\.[\s\xa0]*Ma(?:c(?:c(?:ab(?:e(?:[is]|es)|\xE9es|e(?:e[eo]|o)s|be(?:e(?:[es]|os)|o?s))|cabbbe)|ab(?:e(?:[is]|aid)|bes|eus|b?ees|(?:b?ee[eo]|b?eo)s))|kabej(?:sk[a\xE1]|cov)))|II(?:\.?[\s\xa0]*Macccabbbe|\.?[\s\xa0]*Maccabees|\.?[\s\xa0]*Maccabee[eo]s)|(?:2(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))b|II(?:\.?[\s\xa0]*Macabbb|\.?[\s\xa0]*Macccab))es|2(?:\.[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:b?ee[eo]|b?eo))|[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:b?ee[eo]|b?eo)))|II\.?[\s\xa0]*Maccabee[eo]|(?:(?:2(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))b|II(?:\.?[\s\xa0]*Macabbb|\.?[\s\xa0]*Macccab))e|(?:II\.?[\s\xa0]*Maccc|2\.?[\s\xa0]*Maccc)abb)e[es]|(?:II\.?|2\.?)[\s\xa0]*Maccabbbe[es]|2nd[\s\xa0]*Macc(?:abb(?:e(?:e[es]|s)|be[es])|cab(?:e(?:e[es]|s)|be[es]))|2nd\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]|s)|be[es])|cab(?:e(?:e[es]|s)|be[es]))|Second[\s\xa0]*Macc(?:abb(?:e(?:e[es]|s)|be[es])|cab(?:e(?:e[es]|s)|be[es])))|(?:(?:2(?:[\s\xa0]*Mac(?:c(?:ab(?:b[be]|e)|cab[be])|ab(?:bb?)?e)|\.[\s\xa0]*Mac(?:c(?:cab[be]|abb?e)|ab(?:bb?)?e))|II(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))be)e|II(?:\.[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o)|[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o))s|2nd[\s\xa0]*Maccabe(?:ee?)?s|2nd\.[\s\xa0]*Maccabe(?:ee?)?s|Second[\s\xa0]*Maccabe(?:ee?)?s)|(?:II(?:\.[\s\xa0]*Maccabbe(?:e[eos]|[os])|[\s\xa0]*Maccabbe(?:e[eos]|[os]))|2[\s\xa0]*Macccabe)|(?:II\.?[\s\xa0]*Maccabbee)|(?:(?:II\.?|2\.?)[\s\xa0]*makkabilaiskirja)|(?:マカ(?:[ハバ]イ(?:記[2下]|下|[\s\xa0]*2)|[ヒビ]ー第二書)|《瑪加伯下》|마카베오(?:기[\s\xa0]*하권|하)|חשמונאים[\s\xa0]*ב['’]|ספר[\s\xa0]*מקבים[\s\xa0]*ב['’]|Μακκαβα[ίι]ων[\s\xa0]*Β['ʹʹ΄’]|Β['ʹʹ΄’][\s\xa0]*Μακκαβα[ίι]ων|سفر[\s\xa0]*المكابين[\s\xa0]*الثاني|Zweite[\s\xa0]*Makkab[a\xE4]er|Anden[\s\xa0]*Makkab\xE6erbog|2(?:[\s\xa0]*(?:மக்கபேயர்|مك|المكابيين|Мк|M(?:a(?:ccc|kk)|c[bh]))|Macc|마카|[\s\xa0]*มัคคาบี|[\s\xa0]*Macabe|\.[\s\xa0]*(?:Ma(?:kkab(?:[a\xE4]er|\xE6erbog)|cc?abe)|มัคคาบี))|Друга[\s\xa0]*Макавеја|2\.?[\s\xa0]*Макаве(?:ја|и)|(?:Pili|2\.?)[\s\xa0]*Wamakabayo|2\.?[\s\xa0]*Mga[\s\xa0]*Macabeo|(?:[O\xD6]nnur[\s\xa0]*Makkabeab[o\xF3]|Pili[\s\xa0]*Ma)k|(?:Andre|2\.)[\s\xa0]*Makkabeerbok|(?:M[a\xE1]sodik|2\.)[\s\xa0]*Makkabeusok|(?:Liber[\s\xa0]*II[\s\xa0]*Mac|2\.?[\s\xa0]*Ma)cabaeorum|2[\s\xa0]*Machabaeorum|2\.[\s\xa0]*Machabaeorum|(?:2(?:\-?(?:е\.?|я\.?)|[ея]\.?|\.)?[\s\xa0]*Маккавее|Друга[\s\xa0]*Макаве[ії]|2\.?[\s\xa0]*Макаве[ії])в|2\-?е\.?[\s\xa0]*Макаве[ії]в|(?:2\-?(?:ге\.?|а\.?)|Друге)[\s\xa0]*Макаве[ії]в|(?:2(?:\-?(?:а\.?|е\.?|ге\.?)|\.)?|Друг[ае])[\s\xa0]*книга[\s\xa0]*Макаве[ії]в|I(?:I(?:\.[\s\xa0]*(?:M(?:a(?:c(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe[eios]|abaeorum|habaeorum)|kkabeusok)|ga[\s\xa0]*Macabeo)|Макаве(?:ја|и)|Wamakabayo|Макаве[ії]в|книга[\s\xa0]*Макаве[ії]в)|[\s\xa0]*(?:M(?:a(?:c(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe[eios]|abaeorum|habaeorum)|kkabeusok)|ga[\s\xa0]*Macabeo)|Макаве(?:ја|и)|Wamakabayo|Макаве[ії]в|книга[\s\xa0]*Макаве[ії]в))|kalawang[\s\xa0]*Mga[\s\xa0]*Macabeo)|(?:2(?:\.[\s\xa0]*Ma(?:ckab[e\xE9]erboke|kkabee[e\xEB])|[\s\xa0]*Mackab[e\xE9]erboke)|Andra[\s\xa0]*Mackab[e\xE9]erboke)n|II\.?[\s\xa0]*Makkabee[e\xEB]n|2e\.?[\s\xa0]*Makkabee[e\xEB]n|Tweede[\s\xa0]*Makkabee[e\xEB]n|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*II|Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*II|(?:Друга[\s\xa0]*Мака|2\.?[\s\xa0]*Мака|II\.?[\s\xa0]*Мака)бејаца|(?:Друга[\s\xa0]*Мака|2\.?[\s\xa0]*Мака|II\.?[\s\xa0]*Мака)вејска|Втор(?:а(?:[\s\xa0]*(?:книга[\s\xa0]*(?:Макаве[ий]ска|на[\s\xa0]*Макавеите)|Макавеи)|я[\s\xa0]*книга[\s\xa0]*Маккаве[ий]ская)|о[\s\xa0]*Макавеи)|(?:2(?:\.[\s\xa0]*Ma(?:ccc|k)|[\s\xa0]*Mak)a|II\.?[\s\xa0]*Macabb)be|(?:II(?:\.[\s\xa0]*Macc(?:ab|ca)|[\s\xa0]*Macc(?:ab|ca))|2(?:(?:\.[\s\xa0]*Macc?|[\s\xa0]*Mac)ab|[\s\xa0]*Macca))bb?e|(?:2(?:\.[o\xBA]\.?|\xBA\.?)[\s\xa0]*Macab(?:bee?|ee?)|Ikalawang[\s\xa0]*Macabe|2(?:\.[o\xBA]\.?|\xBA\.?)[\s\xa0]*Maccab(?:bee?|ee?)|2o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|2o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))os|2nd\.?[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:ee?)?s)|e(?:ee?)?s)|c(?:ab(?:[be]e|bb)|cab(?:bb?|e))e)|2\xB0[\s\xa0]*Maccabei|2\xB0\.[\s\xa0]*Maccabei|Se(?:cond(?:[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:ee?)?s)|e(?:ee?)?s)|c(?:ab(?:[be]e|bb)|cab(?:bb?|e))e)|a[\s\xa0]*Maccabei|o[\s\xa0]*(?:libro[\s\xa0]*dei[\s\xa0]*)?Maccabei)|gundo[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os)|(?:II\.?|2a|2a\.|2o|2o\.|Segund[ao])[\s\xa0]*Macabeus|II\.?[\s\xa0]*Maccab\xE9es|2e\.?[\s\xa0]*Maccab[e\xE9]es|2(?:\xE8me|de?|eme)[\s\xa0]*Maccab[e\xE9]es|2(?:\xE8me|de?|eme)\.[\s\xa0]*Maccab[e\xE9]es|II\.?[\s\xa0]*Makabejsk[a\xE1]|II\.?[\s\xa0]*Makabejcov|(?:II\.?|2\.?)[\s\xa0]*Machabejcov|2[\s\xa0]*k[\s\xa0]*Ma(?:ch|k)abejcov|2[\s\xa0]*k\.[\s\xa0]*Ma(?:ch|k)abejcov|2(?:[\s\xa0]*(?:M(?:a(?:c(?:c|h|k)?|k)?|c)?|Макк?|மக்)|\.[\s\xa0]*Ma(?:c(?:cc?)?|kk?))|M[a\xE1]sodik[\s\xa0]*Mak|Β['ʹʹ΄’][\s\xa0]*Μακκ|And(?:en|re)[\s\xa0]*Makk|II(?:\.[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abe|c)?)?|k(?:abe|k)?)|[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abe|c)?)?|k(?:abe|k)?))|2e\.?[\s\xa0]*Mak|Tweede[\s\xa0]*Mak|(?:2(?:\.[o\xBA]\.?|\xBA\.?)[\s\xa0]*Macab(?:bee?|ee?)|Ikalawang[\s\xa0]*Macabe|2(?:\.[o\xBA]\.?|\xBA\.?)[\s\xa0]*Maccab(?:bee?|ee?)|2o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|2o\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|2nd\.?[\s\xa0]*Mac(?:ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|c(?:ab[be]e|abe|c(?:abe)?)?)?|Se(?:cond[\s\xa0]*Mac(?:ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|c(?:ab[be]e|abe|c(?:abe)?)?)?|gundo[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o)|(?:(?:II\.?|2\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejsk|Toinen[\s\xa0]*makkabilaiskirj)a|D(?:ru(?:h(?:[y\xFD][\s\xa0]*Makabejsk[a\xE1]|[y\xFD][\s\xa0]*Makabejcov|[y\xFD][\s\xa0]*Machabejcov|[y\xFD][\s\xa0]*list[\s\xa0]*Ma(?:ch|k)abejcov|[a\xE1][\s\xa0]*(?:Ma(?:kabej(?:sk[a\xE1]|cov)|chabejcov)|kniha[\s\xa0]*Ma(?:ch|k)abejcov)|[ay\xE1\xFD][\s\xa0]*Mak)|g(?:a[\s\xa0]*(?:Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejsk|knjiga[\s\xa0]*o[\s\xa0]*Makabejcim)|i[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejsk)a)|euxi[e\xE8]me(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])es))|(?:《瑪加伯下|瑪加伯下》|2[\s\xa0]*makk|מקבים[\s\xa0]*ב|Wamakabayo[\s\xa0]*II|瑪加伯下|المكابين[\s\xa0]*الثاني))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:3(?:[\s\xa0]*Ma(?:k(?:kab(?:e(?:e(?:[e\xEB]n|rbok)|usok)|[a\xE4]er|\xE6erbog)|abejsk[a\xE1])|c(?:cab(?:be(?:e[es]|s)|e[is])|ab(?:e(?:[is]|aid)|bes)))|\.[\s\xa0]*Ma(?:c(?:cab(?:be(?:e[es]|s)|e[is])|ab(?:e(?:[is]|aid)|bes))|kabejsk[a\xE1]))|(?:3(?:rd[\s\xa0]*Macc(?:ab|ca)|\.?[\s\xa0]*Macabb|rd\.[\s\xa0]*Macc(?:ab|ca))|Third[\s\xa0]*Macc(?:ab|ca))bes|3\.?[\s\xa0]*Macccab(?:bbe|es)|3(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))ees|(?:(?:3(?:rd[\s\xa0]*Macc(?:ab|ca)|\.?[\s\xa0]*Macabb|rd\.[\s\xa0]*Macc(?:ab|ca))|Third[\s\xa0]*Macc(?:ab|ca))be|3\.?[\s\xa0]*Macccab[be])e[es]|3\.?[\s\xa0]*Maccabbbe[es]|(?:3(?:\.[\s\xa0]*Mac(?:ab(?:e[ou]|beo)|cab(?:bee?|e)o)|[\s\xa0]*Mac(?:ab(?:e[ou]|beo)|cab(?:bee?|e)o)|\.?[\s\xa0]*Maccab\xE9e|rd[\s\xa0]*Mac(?:abb?|cab)eee|rd\.[\s\xa0]*Mac(?:abb?|cab)eee)|Third[\s\xa0]*Mac(?:abb?|cab)eee|3(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))ee[eo])s|III(?:\.[\s\xa0]*Mac(?:c(?:ab(?:b(?:be[es]|ee?os)|e(?:e[eo]|o|e)s)|cab(?:[be]e[es]|bbe|es))|ab(?:(?:be(?:e[eo]|o)|e(?:e[eo]|o))s|bbe(?:e[es]|s)))|[\s\xa0]*Mac(?:c(?:ab(?:b(?:be[es]|ee?os)|e(?:e[eo]|o|e)s)|cab(?:[be]e[es]|bbe|es))|ab(?:(?:be(?:e[eo]|o)|e(?:e[eo]|o))s|bbe(?:e[es]|s)))))|(?:3(?:[\s\xa0]*Mac(?:c(?:ab(?:b(?:ee?o|be)|e(?:e[eo]|o))|cab[be]e)|ab(?:b?e(?:e[eo]|o)|bbee))|\.[\s\xa0]*Mac(?:cabe(?:e[eo]|o)|abb?ee[eo]|(?:ccab[be]|abbbe)e))|III(?:\.[\s\xa0]*Maccabbe(?:e[eos]|[os])|[\s\xa0]*Maccabbe(?:e[eos]|[os])|(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Mac(?:abb|cca))bee)|3rd[\s\xa0]*Macc(?:ab(?:e(?:e[es]|s)|bbe[es])|cabbe[es])|3rd\.[\s\xa0]*Macc(?:ab(?:e(?:e[es]|s)|bbe[es])|cabbe[es])|Third[\s\xa0]*Macc(?:ab(?:e(?:e[es]|s)|bbe[es])|cabbe[es]))|(?:3(?:[\s\xa0]*Mac(?:c(?:abe|cab)|abe)e|\.[\s\xa0]*Macab(?:be[eo]|e[eo])|[\s\xa0]*Macc?abbee|\.[\s\xa0]*Maccabee)|III\.?[\s\xa0]*Maccabbee)|(?:(?:III\.?|3\.?)[\s\xa0]*makkabilaiskirja)|(?:マカ(?:[ハバ]イ[\s\xa0記]*3|[ヒビ]ー第三書)|마카베오[\s\xa0]*3서|《3Macc》|חשמונאים[\s\xa0]*ג['’]|ספר[\s\xa0]*מקבים[\s\xa0]*ג['’]|Μακκαβα[ίι]ων[\s\xa0]*Γ['ʹʹ΄’]|Γ['ʹʹ΄’][\s\xa0]*Μακκαβα[ίι]ων|المكابين[\s\xa0]*الثالث|Dritte[\s\xa0]*Makkab[a\xE4]er|3(?:[\s\xa0]*(?:M(?:a(?:ccc|kk)|c[bh])|மக்கபேயர்|Мк)|마카|[\s\xa0]*มัคคาบี|[\s\xa0]*Macabe|\.[\s\xa0]*(?:Ma(?:c(?:cab(?:bee?o|e)|abe)|kkab[a\xE4]er)|มัคคาบี))|3\.?[\s\xa0]*Макавеи|(?:Liber[\s\xa0]*III[\s\xa0]*Mac|3\.?[\s\xa0]*Ma)cabaeorum|3[\s\xa0]*Machabaeorum|3\.[\s\xa0]*Machabaeorum|III(?:\.[\s\xa0]*(?:Mac(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe(?:[ios]|e[eo])|abaeorum|habaeorum)|Макавеи)|[\s\xa0]*(?:Mac(?:ab(?:e(?:[ios]|aid|e[eos])|be(?:e[eos]|[os]))|cabe(?:[ios]|e[eo])|abaeorum|habaeorum)|Макавеи))|(?:III\.?[\s\xa0]*Мака|3\.?[\s\xa0]*Мака)веја|(?:3(?:(?:\-?(?:е\.?|я\.?)|[ея]\.?|\.)?[\s\xa0]*Маккавее|\.?[\s\xa0]*Макаве[ії])|III(?:\.[\s\xa0]*Макаве[ії]|[\s\xa0]*Макаве[ії]))в|3\-?е\.?[\s\xa0]*Макаве[ії]в|(?:3(?:\-?е\.?|\.)?|III\.?)[\s\xa0]*книга[\s\xa0]*Макаве[ії]в|3\-?(?:тє|а)[\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|3\-?(?:тє|а)\.[\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|(?:III\.?[\s\xa0]*Мака|3\.?[\s\xa0]*Мака)бејаца|(?:III\.?[\s\xa0]*Мака|3\.?[\s\xa0]*Мака)вејска|Тре(?:т(?:[яє][\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|а[\s\xa0]*книга[\s\xa0]*Макаве[ий]ска|а[\s\xa0]*Макавеи|о[\s\xa0]*(?:книга[\s\xa0]*на[\s\xa0]*Макавеите|Макавеи)|ья[\s\xa0]*книга[\s\xa0]*Маккаве[ий]ская)|ћ(?:(?:ом|а)[\s\xa0]*Макабејац|(?:ом|а)[\s\xa0]*Макавеј|(?:ом|а)[\s\xa0]*Макавејск)а)|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*III|Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*III|(?:I(?:katlong|II\.?)[\s\xa0]*Mg|3\.?[\s\xa0]*Mg)a[\s\xa0]*Macabeo|(?:III\.?|3\.?)[\s\xa0]*Wamakabayo|(?:3(?:\.[\s\xa0]*Ma(?:cc(?:abb|ca)|ka)|[\s\xa0]*Maka)|III\.?[\s\xa0]*Macabb)be|(?:III(?:\.[\s\xa0]*Macc(?:ab|ca)|[\s\xa0]*Macc(?:ab|ca))|3(?:\.?[\s\xa0]*Macab|[\s\xa0]*Macca))bb?e|3rd[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:e[es]|s))|e(?:e[es]|s))|c(?:ab(?:b?e|bb)|cab(?:bb?|e))e)|3rd\.[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:e[es]|s))|e(?:e[es]|s))|c(?:ab(?:b?e|bb)|cab(?:bb?|e))e)|3o\.?[\s\xa0]*Macabeos|(?:Ikatlong[\s\xa0]*Macab|3o\.?[\s\xa0]*Macabe)eos|3o\.?[\s\xa0]*Macabbee?os|3o\.?[\s\xa0]*Maccab(?:bee?|ee?)os|3(?:\.[o\xBA]|\xBA)[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|3(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|3\xB0[\s\xa0]*Maccabei|3\xB0\.[\s\xa0]*Maccabei|(?:III\.?|3o\.?|3a|3a\.)[\s\xa0]*Macabeus|III\.?[\s\xa0]*Maccab\xE9es|3e\.?[\s\xa0]*Maccab[e\xE9]es|3[e\xE8]me[\s\xa0]*Maccab[e\xE9]es|3[e\xE8]me\.[\s\xa0]*Maccab[e\xE9]es|3\.[\s\xa0]*Makkab\xE6erbog|\xDEri\xF0ja[\s\xa0]*Makkabeab[o\xF3]k|(?:Harmadik|3\.|III\.?)[\s\xa0]*Makkabeusok|3\.[\s\xa0]*Makkabeerbok|(?:(?:Derde|3e\.?)[\s\xa0]*Makkabee[e\xEB]|3\.[\s\xa0]*Makkabee[e\xEB]|III(?:\.[\s\xa0]*Makkabee[e\xEB]|[\s\xa0]*Makkabee[e\xEB]))n|3[\s\xa0]*Mackab[e\xE9]erboken|3(?:e\.?|\.)[\s\xa0]*Mackab[e\xE9]erboken|III\.?[\s\xa0]*Makabejsk[a\xE1]|(?:III\.?|3\.?)[\s\xa0]*Machabejcov|3[\s\xa0]*k[\s\xa0]*Machabejcov|3[\s\xa0]*k\.[\s\xa0]*Machabejcov|3(?:[\s\xa0]*(?:M(?:a(?:c(?:c|h|k)?|k)|c)?|Макк?|மக்)|e\.?[\s\xa0]*Mak|\.[\s\xa0]*Ma(?:c(?:c(?:abbee?|c)?)?|kk?))|Γ['ʹʹ΄’][\s\xa0]*Μακκ|Harmadik[\s\xa0]*Mak|Derde[\s\xa0]*Mak|III(?:\.[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abee?|c)?)?|k(?:abe|k)?)|[\s\xa0]*Ma(?:c(?:ab(?:bee?|ee?)|c(?:abee?|c)?)?|k(?:abe|k)?))|3rd[\s\xa0]*Mac(?:ab(?:b(?:bee?|ee?)|ee?)|c(?:c(?:abe)?|abb?e)?)?|3rd\.[\s\xa0]*Mac(?:ab(?:b(?:bee?|ee?)|ee?)|c(?:c(?:abe)?|abb?e)?)?|3o\.?[\s\xa0]*Macabeo|(?:Ikatlong[\s\xa0]*Macab|3o\.?[\s\xa0]*Macabe)eo|3o\.?[\s\xa0]*Macabbee?o|3o\.?[\s\xa0]*Maccab(?:bee?|ee?)o|3(?:\.[o\xBA]|\xBA)[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|3(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|(?:(?:III\.?|3\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejsk|Kolmas[\s\xa0]*makkabilaiskirj)a|T(?:er(?:cer(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))os|z(?:o[\s\xa0]*(?:libro[\s\xa0]*dei[\s\xa0]*)?|a[\s\xa0]*)Maccabei)|hird[\s\xa0]*Mac(?:ab(?:b(?:be(?:e[es]|s)|e(?:e[es]|s))|e(?:e[es]|s))|c(?:ab(?:b?e|bb)|cab(?:bb?|e))e)|atu[\s\xa0]*Wamakabayo|erceir[ao][\s\xa0]*Macabeus|atu[\s\xa0]*Mak|řet[i\xED][\s\xa0]*Makabejsk[a\xE1]|ercer(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|hird[\s\xa0]*Mac(?:ab(?:b(?:bee?|ee?)|ee?)|c(?:c(?:abe)?|abb?e)?)?|řet[i\xED][\s\xa0]*Mak|r(?:e(?:t(?:i(?:[\s\xa0]*Ma(?:kabejsk[a\xE1]|chabejcov)|a[\s\xa0]*(?:kniha[\s\xa0]*)?Machabejcov)|\xED[\s\xa0]*Ma(?:kabejsk[a\xE1]|chabejcov))|dje[\s\xa0]*Ma(?:kkab(?:\xE6erbog|eerbok)|ckab[e\xE9]erboken)|(?:t[i\xED][\s\xa0]*Ma|dje[\s\xa0]*Mak)k|[cć]a[\s\xa0]*knjiga[\s\xa0]*o[\s\xa0]*Makabejcima)|zeci(?:a[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?|[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?)[\s\xa0]*Machabejska|oisi[e\xE8]me(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])es)))|(?:3(?:[\s\xa0]*makk|Macc》)|《3Macc|מקבים[\s\xa0]*ג|3Macc|Wamakabayo[\s\xa0]*III))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["4Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:4(?:\.[\s\xa0]*Mac(?:c(?:ab(?:(?:e(?:e[eo]|o)|\xE9e)s|e(?:[is]|es)|b(?:e(?:e(?:[es]|os)|o?s)|be[es]))|cab(?:[be]e[es]|bbe|es))|ab(?:e(?:[is]|aid)|bes|bbes|b?ees|bbee[es]|(?:e[ou]|beo|b?ee[eo])s))|th(?:(?:(?:\.?[\s\xa0]*Macabbb|\.?[\s\xa0]*Maccabb)e|\.?[\s\xa0]*Macccab[be])e[es]|(?:\.?[\s\xa0]*Macabbb|\.?[\s\xa0]*Maccabb)es|\.?[\s\xa0]*Macccab(?:bbe|es)|\.?[\s\xa0]*Maccabbbe[es]|(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))eees)|\.[\s\xa0]*Makabejsk[a\xE1]|[\s\xa0]*(?:Ma(?:c(?:c(?:ab(?:(?:e(?:e[eo]|o)|\xE9e)s|e(?:[is]|es)|b(?:e(?:e(?:[es]|os)|o?s)|be[es]))|cab(?:[be]e[es]|bbe|es))|ab(?:e(?:[is]|aid)|bes|bbes|b?ees|bbee[es]|(?:e[ou]|beo|b?ee[eo])s))|k(?:kab(?:e(?:e(?:[e\xEB]n|rbok)|usok)|[a\xE4]er|\xE6erbog)|abejsk[a\xE1]))|makkabilaiskirja))|(?:Fourth[\s\xa0]*Maccabb|IV\.?[\s\xa0]*Macccab|Fourth[\s\xa0]*Macabbb)es|Fourth[\s\xa0]*Macccab(?:bbe|es)|IV\.?[\s\xa0]*Maccabees|(?:(?:Fourth[\s\xa0]*Maccabb|IV\.?[\s\xa0]*Macccab|Fourth[\s\xa0]*Macabbb)e|Fourth[\s\xa0]*Macccab[be])e[es]|(?:IV(?:\.?[\s\xa0]*Maccabb|\.?[\s\xa0]*Macccab)|Fourth[\s\xa0]*Maccabb)be[es]|(?:IV(?:\.[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o)|[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o))|Fourth[\s\xa0]*Mac(?:abb?|cab)eee|IV\.?[\s\xa0]*Maccabee[eo])s)|(?:4(?:[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|abb?e(?:e[eo]|o))|\.[\s\xa0]*Mac(?:cabe(?:e[eo]|o)|abb?ee[eo]))|IV(?:\.[\s\xa0]*Maccabbe(?:e[eos]|[os])|[\s\xa0]*Maccabbe(?:e[eos]|[os]))|4[\s\xa0]*Macc(?:cab[be]|abbb)e|4(?:\.[\s\xa0]*Mac(?:abb|cca)|[\s\xa0]*Macabb)bee|4th[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|4th\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|Fourth[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e)))|(?:4(?:\.[\s\xa0]*Mac(?:ab(?:be[eo]|e[eo])|cabee)|[\s\xa0]*Macc?abb?ee|th[\s\xa0]*Mac(?:c(?:abe|cab)|abb?e)e|th\.[\s\xa0]*Mac(?:c(?:abe|cab)|abb?e)e)|Fourth[\s\xa0]*Mac(?:c(?:abe|cab)|abb?e)e)|(?:マカ(?:[ハバ]イ[\s\xa0記]*4|[ヒビ]ー第四書)|마카베오[\s\xa0]*4서|《4Macc》|חשמונאים[\s\xa0]*ד['’]|ספר[\s\xa0]*מקבים[\s\xa0]*ד['’]|Μακκαβα[ίι]ων[\s\xa0]*Δ['ʹʹ΄’]|Δ['ʹʹ΄’][\s\xa0]*Μακκαβα[ίι]ων|المكابين[\s\xa0]*الرابع|Fourth[\s\xa0]*Mac(?:c(?:abe|c)|abe)|Vierte[\s\xa0]*Makkab[a\xE4]er|Fjerde[\s\xa0]*Makkab\xE6erbog|4(?:th(?:\.[\s\xa0]*Mac(?:c(?:abe|c)|abe)|[\s\xa0]*Mac(?:c(?:abe|c)|abe))|마카|[\s\xa0]*(?:M(?:c[bh]|akk)|மக்கபேயர்|Мк)|[\s\xa0]*มัคคาบี|[\s\xa0]*Macabe|\.[\s\xa0]*(?:Ma(?:kkab(?:[a\xE4]er|\xE6erbog)|c(?:cab(?:bee?o|e)|abe))|มัคคาบี))|4\.?[\s\xa0]*Макавеи|(?:4(?:\.[\s\xa0]*Ma(?:ckab[e\xE9]erboke|kkabee[e\xEB])|[\s\xa0]*Mackab[e\xE9]erboke)|Fj[a\xE4]rde[\s\xa0]*Mackab[e\xE9]erboke)n|Vierde[\s\xa0]*Makkabee[e\xEB]n|4(?:\.[\s\xa0]*Ma(?:ccabb|ka)|[\s\xa0]*Ma(?:ccc|k)a)be|(?:4(?:th(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)ab|[\s\xa0]*Macca|[\s\xa0]*Macab|\.[\s\xa0]*Mac(?:cca|ab))|Fourth[\s\xa0]*Macc?ab)bb?e|(?:Liber[\s\xa0]*IV[\s\xa0]*Mac|4\.?[\s\xa0]*Ma)cabaeorum|4[\s\xa0]*Machabaeorum|4\.[\s\xa0]*Machabaeorum|IV(?:\.[\s\xa0]*(?:Ma(?:c(?:ab(?:b(?:e(?:e[eos]|[os])|be(?:e[es]|s))|e(?:[ios]|aid|e[eos]))|c(?:ab(?:e(?:[ios]|e[eo])|bee|bbe)|cab(?:bb?|e)e)|abaeorum|habaeorum)|kkabee[e\xEB]n)|Макавеи)|[\s\xa0]*(?:Ma(?:c(?:ab(?:b(?:e(?:e[eos]|[os])|be(?:e[es]|s))|e(?:[ios]|aid|e[eos]))|c(?:ab(?:e(?:[ios]|e[eo])|bee|bbe)|cab(?:bb?|e)e)|abaeorum|habaeorum)|kkabee[e\xEB]n)|Макавеи))|(?:Fj[o\xF3]r\xF0a[\s\xa0]*Makkabeab[o\xF3]|(?:Fjerde|4\.)[\s\xa0]*Makkabeerbo|4\.[\s\xa0]*Makkabeuso|IV\.?[\s\xa0]*Makkabeuso)k|(?:I(?:kaapat|V\.?)[\s\xa0]*Mg|4\.?[\s\xa0]*Mg)a[\s\xa0]*Macabeo|(?:IV\.?|4\.?)[\s\xa0]*Wamakabayo|Nne[\s\xa0]*(?:Wamakabayo|Mak)|(?:IV\.?|4\.?)[\s\xa0]*Machabejcov|4[\s\xa0]*k[\s\xa0]*Machabejcov|4[\s\xa0]*k\.[\s\xa0]*Machabejcov|[SŠ]tvrt[a\xE1][\s\xa0]*(?:kniha[\s\xa0]*)?Machabejcov|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*IV|Kitabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*IV|(?:(?:4o\.?|IV\.?)[\s\xa0]*Macabeu|IV\.?[\s\xa0]*Maccab\xE9e|4(?:e(?:me)?|\xE8me)[\s\xa0]*Maccab[e\xE9]e|4(?:e(?:me)?|\xE8me)\.[\s\xa0]*Maccab[e\xE9]e)s|4a\.?[\s\xa0]*Macabeus|4\xB0[\s\xa0]*Maccabei|4\xB0\.[\s\xa0]*Maccabei|Qua(?:rt(?:o[\s\xa0]*(?:Mac(?:abeus|cabei)|libro[\s\xa0]*dei[\s\xa0]*Maccabei)|a[\s\xa0]*Mac(?:abeus|cabei))|tri[e\xE8]me(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])es)|IV\.?[\s\xa0]*Makabejsk[a\xE1]|Čtvrt[a\xE1][\s\xa0]*Makabejsk[a\xE1]|4o\.?[\s\xa0]*Macabeos|(?:Ikaapat[\s\xa0]*Macab|4o\.?[\s\xa0]*Macabe)eos|4o\.?[\s\xa0]*Macabbee?os|4o\.?[\s\xa0]*Maccab(?:bee?|ee?)os|4(?:\.[o\xBA]|\xBA)[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|4(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|(?:Nelj[a\xE4]s|IV\.?|4\.)[\s\xa0]*makkabilaiskirja|(?:IV\.?|4\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska|C(?:uarto[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|tvrt[a\xE1][\s\xa0]*Makabejsk[a\xE1]|zwarta[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejska)|(?:IV\.?[\s\xa0]*Мака|4\.?[\s\xa0]*Мака)веја|(?:IV\.?[\s\xa0]*Мака|4\.?[\s\xa0]*Мака)вејска|(?:IV\.?[\s\xa0]*Мака|4\.?[\s\xa0]*Мака)бејаца|(?:4(?:(?:\-?[ея]\.?|[ея]\.?|\.)?[\s\xa0]*Маккавее|\.?[\s\xa0]*Макаве[ії])|IV(?:\.[\s\xa0]*Макаве[ії]|[\s\xa0]*Макаве[ії]))в|(?:IV\.?|4\.?)[\s\xa0]*книга[\s\xa0]*Макаве[ії]в|IV(?:\.[\s\xa0]*Ma(?:c(?:c(?:abee?|abbe|c(?:abe)?)?|ab(?:b(?:bee?|ee?)|ee?))?|k(?:abe|k)?)|[\s\xa0]*Ma(?:c(?:c(?:abee?|abbe|c(?:abe)?)?|ab(?:b(?:bee?|ee?)|ee?))?|k(?:abe|k)?))|4(?:[\s\xa0]*(?:M(?:a(?:c(?:cc?|h|k)?|k)|c)?|Макк?|மக்)|th(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)|\.[\s\xa0]*Ma(?:c(?:c(?:abbee?|c)?)?|kk?))|Δ['ʹʹ΄’][\s\xa0]*Μακκ|Vierde[\s\xa0]*Mak|Fjerde[\s\xa0]*Makk|Fourth[\s\xa0]*Macc?|Čtvrt[a\xE1][\s\xa0]*Mak|4o\.?[\s\xa0]*Macabeo|(?:Ikaapat[\s\xa0]*Macab|4o\.?[\s\xa0]*Macabe)eo|4o\.?[\s\xa0]*Macabbee?o|4o\.?[\s\xa0]*Maccab(?:bee?|ee?)o|4(?:\.[o\xBA]|\xBA)[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|4(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|C(?:uarto[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|tvrt[a\xE1][\s\xa0]*Mak)|Четв(?:ерта[\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|рта[\s\xa0]*Мака(?:веј(?:ск)?|бејац)а|ърт(?:а[\s\xa0]*(?:книга[\s\xa0]*на[\s\xa0]*Макавеите|Макавеи)|о[\s\xa0]*Макавеи)))|(?:4(?:[\s\xa0]*makk|Macc》)|《4Macc|מקבים[\s\xa0]*ד|4Macc|Wamakabayo[\s\xa0]*IV))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:[\s\xa0]*Ma(?:k(?:kab(?:e(?:e(?:[e\xEB]n|rbok)|usok)|[a\xE4]er|\xE6erbog)|abejsk[a\xE1])|c(?:cab(?:be(?:e[es]|s)|e(?:[is]|es))|ab(?:e(?:[is]|aid)|bes|b?ees)))|\.[\s\xa0]*Maccabees)|I(?:\.?[\s\xa0]*Mac(?:cab(?:be(?:e[es]|s)|e(?:[is]|es))|ab(?:e(?:[is]|aid)|bes|b?ees))|\.?[\s\xa0]*Makabejsk[a\xE1])|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)ccabbbe|(?:1(?:\.[\s\xa0]*Mac(?:ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|cab(?:bee?|e)o|cabee[eo])|[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:e[ou]|beo|b?ee[eo])))|I\.?[\s\xa0]*Mac(?:cab(?:e(?:e[eo]|o)|bee?o)|ab(?:e[ou]|beo|b?ee[eo])))s|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)cab\xE9es|(?:(?:1\.?[\s\xa0]*Mac|I\.?[\s\xa0]*Mac)cab|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)cca|1\.[\s\xa0]*Maccca)bbe[es]|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac|1\.[\s\xa0]*Mac)ccabe(?:e[es]|s)|(?:I\.?[\s\xa0]*Mac|1[\s\xa0]*Mac)abbbe(?:e[es]|s)|1st[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees))|1st\.[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees))|First[\s\xa0]*Mac(?:c(?:(?:ab|ca)bbe[es]|abeees|cabbbe|(?:ab|ca)be(?:e[es]|s))|ab(?:b(?:be(?:e[es]|s)|eees)|eees)))|(?:I(?:(?:(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))e|\.[\s\xa0]*Maccabbee?|[\s\xa0]*Maccabbee?)o|(?:\.[\s\xa0]*Mac(?:abb?|cab)|[\s\xa0]*Mac(?:abb?|cab))ee[eo])|1(?:[\s\xa0]*Mac(?:ab(?:bee[eo]|ee[eo])|cabe(?:e[eo]|o))|\.[\s\xa0]*Maccabbe(?:e[eos]|[os]))|I(?:\.?[\s\xa0]*Macccab[be]|\.?[\s\xa0]*Maccabbb)e|(?:1[\s\xa0]*Mac(?:abb|cca)|I\.?[\s\xa0]*Macabb)bee|1st[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|1st\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e))|First[\s\xa0]*Mac(?:ab(?:b(?:e(?:e[es]|s)|bee)|e(?:e[es]|s))|c(?:ab(?:e(?:e[es]|s)|bee)|cab[be]e)))|(?:1[\s\xa0]*Macab(?:be[eo]|e[eo])|I\.?[\s\xa0]*Macccabe|1[\s\xa0]*Maccabee|I(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)abb?ee|1st[\s\xa0]*Mac(?:abb?|cab)ee|1st\.[\s\xa0]*Mac(?:abb?|cab)ee|First[\s\xa0]*Mac(?:abb?|cab)ee)|(?:[1I]\.?[\s\xa0]*makkabilaiskirja)|(?:1(?:[\s\xa0]*(?:M(?:a(?:c(?:cab(?:bee?o|e)|abe)|kk)|c[bh])|மக்கபேயர்|مك|المكابيين|Мк)|st(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)abe|Macc|마카|[\s\xa0]*มัคคาบี|[\s\xa0]*Макавеи|(?:[\s\xa0]*Ma(?:ccabb|ka)|st\.?[\s\xa0]*Maccca)be|(?:st(?:\.[\s\xa0]*Macc?|[\s\xa0]*Macc?)ab|[\s\xa0]*Mac(?:cca|ab))bb?e|[\s\xa0]*Macabaeorum|[\s\xa0]*Machabaeorum|\.[\s\xa0]*(?:Ma(?:c(?:ab(?:b(?:e(?:e[eos]|[os])|be(?:e[es]|s))|e(?:[ios]|aid|e[eos]))|c(?:ab(?:e(?:[ios]|e[eo])|bee|bbe)|cab(?:bb?|e)e)|abaeorum|habaeorum)|kkab\xE6erbog)|Макавеи|มัคคาบี))|マカ(?:[ハバ]イ(?:記[1上]|上|[\s\xa0]*1)|[ヒビ]ー第一書)|《瑪加伯上》|마카베오(?:기[\s\xa0]*상권|상)|חשמונאים[\s\xa0]*א['’]|ספר[\s\xa0]*מקבים[\s\xa0]*א['’]|Μακκαβα[ίι]ων[\s\xa0]*Α['ʹʹ΄’]|Α['ʹʹ΄’][\s\xa0]*Μακκαβα[ίι]ων|سفر[\s\xa0]*المكابين[\s\xa0]*الأول|I\.?[\s\xa0]*Maccc|First[\s\xa0]*Macc?abe|I\.?[\s\xa0]*Macabe|I\.?[\s\xa0]*Макавеи|F\xF8rste[\s\xa0]*Makkab\xE6erbog|(?:First[\s\xa0]*Maccc|I\.?[\s\xa0]*Mak)abe|(?:First[\s\xa0]*Macc?ab|I\.?[\s\xa0]*Macca|I\.?[\s\xa0]*Macab)bb?e|(?:Liber[\s\xa0]*I[\s\xa0]*Macca|I\.?[\s\xa0]*Maca)baeorum|I\.?[\s\xa0]*Machabaeorum|(?:Una(?:ng)?|I\.?|1\.?)[\s\xa0]*Mga[\s\xa0]*Macabeo|(?:1\.?|I\.?)[\s\xa0]*Wamakabayo|(?:Ma(?:chabaeorum|kkabeusok)|Liber[\s\xa0]*Maccabaeorum)[\s\xa0]*I|K(?:itabu[\s\xa0]*cha[\s\xa0]*Wamakabayo[\s\xa0]*I|wanza[\s\xa0]*Wamakabayo)|(?:1\.?[\s\xa0]*Мака|I\.?[\s\xa0]*Мака)веја|(?:1\.?[\s\xa0]*Мака|I\.?[\s\xa0]*Мака)бејаца|(?:1\.?[\s\xa0]*Мака|I\.?[\s\xa0]*Мака)вејска|(?:1(?:(?:\-?(?:е\.?|я\.?)|[ея]\.?)?[\s\xa0]*Маккавее|[\s\xa0]*Макаве[ії]|\.[\s\xa0]*Мак(?:аве[ії]|кавее))|I\.?[\s\xa0]*Макаве[ії])в|1\-?е\.?[\s\xa0]*Макаве[ії]в|(?:1(?:\-?е\.?|\.)?|I\.?)[\s\xa0]*книга[\s\xa0]*Макаве[ії]в|1\-?(?:ше|а)[\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|1\-?(?:ше|а)\.[\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|П(?:ърв(?:а[\s\xa0]*(?:книга[\s\xa0]*(?:Макаве[ий]ска|на[\s\xa0]*Макавеите)|Макавеи)|о[\s\xa0]*Макавеи)|рва[\s\xa0]*Мака(?:бејац|веј|вејск)а|ер(?:ш[ае][\s\xa0]*(?:книга[\s\xa0]*Макаве[ії]|Макаве[ії])в|вая[\s\xa0]*книга[\s\xa0]*Маккаве[ий]ская))|1(?:(?:o\.?|\.)[\s\xa0]*Macabeu|\.[\s\xa0]*Maccab\xE9e|(?:\xE8?re|ere?)[\s\xa0]*Maccab[e\xE9]e|(?:\xE8?re|ere?)\.[\s\xa0]*Maccab[e\xE9]e)s|1a[\s\xa0]*Macabeus|1a\.[\s\xa0]*Macabeus|1o\.?[\s\xa0]*Macabeos|(?:Una(?:ng)?[\s\xa0]*Macab|1o\.?[\s\xa0]*Macabe)eos|1o\.?[\s\xa0]*Macabbee?os|1o\.?[\s\xa0]*Maccab(?:bee?|ee?)os|1(?:\.[o\xBA]|\xBA)[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|1(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))os|1\xB0[\s\xa0]*Maccabei|1\xB0\.[\s\xa0]*Maccabei|1\.[\s\xa0]*Makabejsk[a\xE1]|(?:1\.?[\s\xa0]*Mach|I\.?[\s\xa0]*Mach)abejcov|1[\s\xa0]*k[\s\xa0]*Machabejcov|1[\s\xa0]*k\.[\s\xa0]*Machabejcov|Pr(?:im(?:e(?:r(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|ir[ao][\s\xa0]*Macabeu)s|a[\s\xa0]*Maccabei|o[\s\xa0]*(?:libro[\s\xa0]*dei[\s\xa0]*)?Maccabei)|emi(?:er(?:e(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])|s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9])|\xE8re(?:s[\s\xa0]*Maccab[e\xE9]|[\s\xa0]*Maccab[e\xE9]))es|v(?:n[i\xED][\s\xa0]*Makabejsk[a\xE1]|\xE1[\s\xa0]*Makabejcov|\xE1[\s\xa0]*Machabejcov|[y\xFD][\s\xa0]*Machabejcov|[y\xFD][\s\xa0]*list[\s\xa0]*Machabejcov|\xE1[\s\xa0]*kniha[\s\xa0]*Machabejcov|a[\s\xa0]*(?:Ma(?:ch|k)|kniha[\s\xa0]*Mach)abejcov))|1\.[\s\xa0]*Makkab[a\xE4]er|(?:Fyrsta[\s\xa0]*Makkabeab[o\xF3]|Kwanza[\s\xa0]*Ma)k|(?:F\xF8rste|1\.)[\s\xa0]*Makkabeerbok|(?:I\.?|1\.)[\s\xa0]*Makkabeusok|(?:1(?:\.[\s\xa0]*Ma(?:ckab[e\xE9]erboke|kkabee[e\xEB])|[\s\xa0]*Mackab[e\xE9]erboke)|F[o\xF6]rsta[\s\xa0]*Mackab[e\xE9]erboke)n|I\.?[\s\xa0]*Makkabee[e\xEB]n|1e[\s\xa0]*Makkabee[e\xEB]n|1e\.[\s\xa0]*Makkabee[e\xEB]n|1(?:[\s\xa0]*(?:M(?:a(?:c(?:c(?:abbee?|c)?|h|k)?|k)?|c)?|Макк?|மக்)|st(?:\.[\s\xa0]*Mac(?:cc?)?|[\s\xa0]*Mac(?:cc?)?)|\.[\s\xa0]*Ma(?:c(?:c(?:abee?|abbe|c(?:abe)?)?|ab(?:b(?:bee?|ee?)|ee?))?|k(?:abe|k)?))|I(?:\.[\s\xa0]*Ma(?:cc?|kk?)|[\s\xa0]*Ma(?:cc?|kk?))|Α['ʹʹ΄’][\s\xa0]*Μακκ|F\xF8rste[\s\xa0]*Makk|First[\s\xa0]*Mac(?:cc?)?|1o\.?[\s\xa0]*Macabeo|(?:Una(?:ng)?[\s\xa0]*Macab|1o\.?[\s\xa0]*Macabe)eo|1o\.?[\s\xa0]*Macabbee?o|1o\.?[\s\xa0]*Maccab(?:bee?|ee?)o|1(?:\.[o\xBA]|\xBA)[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|1(?:\.[o\xBA]|\xBA)\.[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))o|Pr(?:imer(?:o[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?))|[\s\xa0]*Mac(?:cab(?:bee?|ee?)|ab(?:bee?|ee?)))o|vn[i\xED][\s\xa0]*Mak)|1e[\s\xa0]*Mak|1e\.[\s\xa0]*Mak|(?:P(?:ierwsz[aey][\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejsk|rva[\s\xa0]*knjiga[\s\xa0]*o[\s\xa0]*Makabejcim)|(?:1\.?|I\.?)[\s\xa0]*Ks(?:i[eę]g[ai]|\.)?[\s\xa0]*Machabejsk)a|E(?:rste[\s\xa0]*Makkab[a\xE4]er|ls[oő][\s\xa0]*Makkabeusok|erste[\s\xa0]*Makkabee[e\xEB]n|(?:ls[oő]|erste)[\s\xa0]*Mak|nsimm[a\xE4]inen[\s\xa0]*makkabilaiskirja))|(?:《瑪加伯上|瑪加伯上》|1[\s\xa0]*makk|מקבים[\s\xa0]*א|Maccabees|Wamakabayo[\s\xa0]*I|瑪加伯上|المكابين[\s\xa0]*الأول))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Judg"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:士師|삿|판관기|사사기|วนฉ|Iud|Amu|《(?:士(?:师记|師記)?|民長紀)》|ق(?:ضا[ةہۃ]|ُضاۃ)|[sŝ][aā]ste|शास्ते|שופטים|С(?:удиј[ае]|ъд)|Κριτ(?:[έε]ς|α[ίι])|Barnwyr|S(?:[eę]dz|d[cz]|oudc[uů])|Richteren|Gdc|سفر[\\s\\xa0]*القضاة|ผู้วินิจฉัย|Rechters|(?:Waamuz|Suc|Giudic)i|J(?:u(?:d(?:ec(?:atori|ător)i|ges)|(?:[i\\xED]z|g|ec)es)|[cz]|ij|gs|dgs)|Gjyqtar[e\\xEB]t|qużāh|C\\xE1c[\\s\\xa0]*(?:Thủ[\\s\\xa0]*l\\xE3nh|quan[\\s\\xa0]*x\\xE9t)|Liv[\\s\\xa0]*Ch[e\\xE8]f[\\s\\xa0]*yo|(?:Liber[\\s\\xa0]*Iudicu|Para[\\s\\xa0]*Haki)m|Mga[\\s\\xa0]*(?:Maghuh|H)ukom|ਨਿਆਂ?ਈਆਂ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਪੋਥੀ|(?:D(?:om(?:ar(?:ab[o\\xF3]ki|boke)|merboge)|\\xF3marab[o\\xF3]ki)|Quan[\\s\\xa0]*\\xE1|Thẩm[\\s\\xa0]*ph\\xE1)n|N(?:iy[aā]y[aā]tipatika[lḷ]|yayiyon)|(?:Xaakinnad|Sudcovi|Da(?:annat|n)|Tuomarien[\\s\\xa0]*kirj)a|K(?:s(?:\\.[\\s\\xa0]*S[eę]dzi[o\\xF3]|[\\s\\xa0]*S[eę]dzi[o\\xF3]|i[eę]g[ai][\\s\\xa0]*S[eę]dzi[o\\xF3])w|\\.?[\\s\\xa0]*sudcov|n(?:jiga[\\s\\xa0]*o[\\s\\xa0]*Sucima|yha[\\s\\xa0]*Suddiv))|न्याय(?:कर्त(?:्त)?ाहरूको[\\s\\xa0]*पुस्तक|िय(?:[\\s\\xa0]*का[\\s\\xa0]*विर्तान्त|ों))|Судьи|Книга[\\s\\xa0]*(?:С(?:уд(?:е[ий][\\s\\xa0]*Израилевых|дів)|ъдии[\\s\\xa0]*Израилеви)|на[\\s\\xa0]*(?:израелеви[\\s\\xa0]*судии|съдиите))|(?:B(?:\\xEDr[a\\xE1]|ir[a\\xE1])|Hu|Dommernes[\\s\\xa0]*bo)k|n(?:y[aā]yakartt[aā]har[uū]ko[\\s\\xa0]*pustak|iāīāṃ[\\s\\xa0]*dī[\\s\\xa0]*potʰī)|ந(?:ியாயாதிபதிகள(?:ின்[\\s\\xa0]*புத்தக|்[\\s\\xa0]*ஆகம)ம|ீதி(?:த்[\\s\\xa0]*தலைவர்|பதி)கள)்|Κρ(?:ιτ)?|قض|판관|Суд|Waam|B(?:\\xEDr|arn)|Su?d|R(?:icht(?:ere?)?|echt)|Gjy|Xaak|J(?:u(?:[i\\xED]z|g|ec|e|d(?:ecatori|g))|d?g)|D(?:om(?:arab[o\\xF3]k|mer(?:ne)?)?|\\xF3m(?:arab[o\\xF3]k)?)|Tuom|न्यायकर्ता|ந(?:ியா|ீத)|ବିଗ୍ଭରକର୍ତ୍ତାମାନଙ୍କ[\\s\\xa0]*ବିବରଣ)|(?:《(?:士(?:师记|師記)|民長紀)|民長紀》|士(?:师记|師記)?》|القضاة|S(?:[eę]dzi[o\\xF3]w|udcov)|Dommernes|Quan|T(?:hủ[\\s\\xa0]*l\\xE3nh|uomarien)|Iudicum|Hukom|Maghuhukom|நியாயாதிபதிகள்|Книга[\\s\\xa0]*Суде[ий]|С(?:уд(?:е[ий]|дів|ии)|ъдии[\\s\\xa0]*Израилеви)|न्यायकर्त्ताहरूको|士(?:师记|師記)?|民長紀|《士|Thủ|Съдии|n(?:y[aā]yakartt[aā]har[uū]ko|iāīāṃ)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mark"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Mrcos)|(?:М(?:[кр]|аркo)|막|ม(?:าระโ)?ก|र्मकस|Μ(?:[άα]ρκος|ρ)|마(?:르코[\\s\\xa0]*|가)복음서|《(?:馬(?:爾谷|可)福音|瑪爾克|可|马可福音)》|マルコ(?:[伝書]|福音書|[の傳]福音書|による福音書)|إنجيل[\\s\\xa0]*مرقس|Κατ[άα][\\s\\xa0]*Μ[άα]ρκον|ਮਰਕੁਸ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਇੰਜੀਲ|مرقُ?س[\\s\\xa0]*کی[\\s\\xa0]*انجیل|הבשורה[\\s\\xa0]*על[\\s\\xa0\\-?]*פי[\\s\\xa0]*מרקוס|พระวรสารนักบุญมาร์ค|Injili[\\s\\xa0]*ya[\\s\\xa0]*Marko|Vangelo[\\s\\xa0]*di[\\s\\xa0]*(?:San[\\s\\xa0]*)?Marco|ମାର୍କ[\\s\\xa0]*ଲିଖିତ[\\s\\xa0]*ସୁସମାଗ୍ଭର|மாற்கு[\\s\\xa0]*(?:எழுதிய[\\s\\xa0]*(?:சுவிசேஷம்|நற்செய்தி)|நற்செய்தி)|Євангелі[яє][\\s\\xa0]*від[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*)?Марка|От[\\s\\xa0]*Марка[\\s\\xa0]*свето[\\s\\xa0]*Евангелие|Јеванђеље[\\s\\xa0]*по[\\s\\xa0]*Марку|Еван(?:гелие(?:[\\s\\xa0]*(?:според[\\s\\xa0]*Марко|от[\\s\\xa0]*Марк[ао])|то[\\s\\xa0]*според[\\s\\xa0]*Марко)|ђеље[\\s\\xa0]*по[\\s\\xa0]*Марку)|र्मकूस|म(?:र(?:्क(?:ू(?:स(?:ले[\\s\\xa0]*लेखे)?को[\\s\\xa0]*सुसमाचार|श)|ुस)|कुस)|ार्काने[\\s\\xa0]*लिहिलेले[\\s\\xa0]*शुभवर्तमान)|Jevanđelje[\\s\\xa0]*po[\\s\\xa0]*Marku|Evan[\\xF0đ]elje[\\s\\xa0]*po[\\s\\xa0]*Marku|Evankeliumi[\\s\\xa0]*Markuksen[\\s\\xa0]*mukaan|m(?:ark(?:(?:ūsle[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā]|usle[\\s\\xa0]*lekʰeko[\\s\\xa0]*susm[aā]c[aā])r|[aā]ne[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā]n)|ārk[aā]ne[\\s\\xa0]*lihilele[\\s\\xa0]*[sŝ]ubʰavartam[aā]n)|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:ar|r)?|[\\s\\xa0]*M(?:ar|r)?)|aint[\\s\\xa0]*M(?:ar|r)?)|M(?:ar|r)?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:ar|r)?|[\\s\\xa0]*M(?:ar|r)?)|aint[\\s\\xa0]*M(?:ar|r)?)|M(?:ar|r)?))k|(?:E(?:w(?:angelia[\\s\\xa0]*w(?:edług[\\s\\xa0]*[sś]|g[\\s\\xa0]*[sś])w[\\s\\xa0]*|(?:angelia)?[\\s\\xa0]*|(?:angelia[\\s\\xa0]*w(?:edług[\\s\\xa0]*[sś]|g[\\s\\xa0]*[sś])w)?\\.[\\s\\xa0]*)|van(?:jelium[\\s\\xa0]*Pod[lľ]a|gelium[\\s\\xa0]*podle)[\\s\\xa0]*)|Jevanhelije[\\s\\xa0]*vid[\\s\\xa0]*)Marka|Ungjilli[\\s\\xa0]*i[\\s\\xa0]*Markut|mar(?:qus[\\s\\xa0]*kī[\\s\\xa0]*in|kus[\\s\\xa0]*dī[\\s\\xa0]*ĩ)jīl|Evangelium[\\s\\xa0]*secundum[\\s\\xa0]*Marcum|The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Ma?|[\\s\\xa0]*Ma?)|aint[\\s\\xa0]*Ma?)|Ma?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Ma?|[\\s\\xa0]*Ma?)|aint[\\s\\xa0]*Ma?)|Ma?))r|마(?:르(?:코[\\s\\xa0]*복음)?|가(?:복음)?)|Μ[άα]ρκ|Марк|マルコ|مر|மாற்|म(?:र्कूस|ार्क)|Ew[\\s\\xa0]*Mar|(?:(?:Evangeliet[\\s\\xa0]*etter|Injil)[\\s\\xa0]*Mark|Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Mar[ck])us|(?:E(?:banghelyo[\\s\\xa0]*ayon[\\s\\xa0]*kay|l[\\s\\xa0]*Evangelio[\\s\\xa0]*de)|Sulat[\\s\\xa0]*ni[\\s\\xa0]*San)[\\s\\xa0]*Marcos|Ebanghelyo[\\s\\xa0]*ni[\\s\\xa0]*(?:San[\\s\\xa0]*Mar[ck]|Mar[ck])os|M(?:a(?:r(?:k(?:u(?:s(?:argu\\xF0spjall|evangeliet|[\\s\\xa0]*evangelium)|[\\s\\xa0]*Na[rṛ]ceyti|ksen[\\s\\xa0]*evankeliumi)|\\xFAsargu\\xF0spjall|ovo[\\s\\xa0]*evangelium)|qqoosa|cu|ek)|ṛku[\\s\\xa0]*Na[rṛ]ceyti|r[cq]|rakus|buting[\\s\\xa0]*Balita[\\s\\xa0]*ayon[\\s\\xa0]*kay[\\s\\xa0]*(?:San[\\s\\xa0]*Mar[ck]|Mar[ck])os)|ā[rṛ]ku[\\s\\xa0]*Na[rṛ]ceyti|\\xE1cc\\xF4|r?c|\\xE1rk|\\xE1c))|(?:מרקוס|مرقس|ମାର୍କ|Марк[ао]|ਮਰਕੁਸ|《(?:馬(?:爾谷|可)福音|瑪爾克|可|马可福音)|(?:瑪爾克|可)》|马可福音》|馬(?:爾谷|可)福音》|மாற்கு|म(?:र्कूसल|ार्कान)े|m(?:ark(?:[aā]n|ūsl|usl)|ārk[aā]n)e|M(?:a(?:r(?:k(?:u(?:ksen|s)|os|a)|cos)|ṛku)|ā[rṛ]ku|k)|От[\\s\\xa0]*Марка|Від[\\s\\xa0]*Марка|Marcus|San[\\s\\xa0]*Marcos|Evangelio[\\s\\xa0]*de[\\s\\xa0]*Marcos|馬(?:爾谷|可)福音|瑪爾克|可|马可福音|markus|Mar(?:k(?:o|u)?|co)?|Mrk?|St[\\s\\xa0]*M(?:rk?|k|ark?)|St\\.[\\s\\xa0]*M(?:rk?|k|ark?)|Saint[\\s\\xa0]*M(?:rk?|k|ark?)|Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?)))))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jas"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:(?:yak(?:ob[aā]ce[mṃ]|[uū]bko)[\\s\\xa0]*patr|Jakovljeva[\\s\\xa0]*poslanic)a)|(?:يع|약|᾿Ια|Иак|Якуб|ย(?:[กบ]|ากอบ)|Tg|Ia(?:co[bv]|go)|야고보(?:[\\s\\xa0]*서간|서)|《(?:雅(?:各(?:[书書]|伯書))?|亞适烏)》|Ιακ[ωώ]βου|G(?:ia(?:c\\xF4b\\xEA|\\-?cơ)|[cm])|ヤコ[フブ](?:の?書|の手紙|からの手紙)|Stg|אי?גרת[\\s\\xa0]*יעקב|ଯାକୁବଙ୍କ[\\s\\xa0]*ପତ୍ର|याक(?:ोबाचें|ूबको)[\\s\\xa0]*पत्र|J(?:a(?:k(?:ob(?:s(?:br(?:e(?:fi\\xF0|vet)|\\xE9fi\\xF0)|[\\s\\xa0]*epistel)|usbrief|it)|ubov[\\s\\xa0]*List)|(?:me)?s|akobin[\\s\\xa0]*kirje)|ms|k)|ਯਾਕੂਬ[\\s\\xa0]*ਦੀ[\\s\\xa0]*ਪੱਤ੍ਰੀ|Epistula[\\s\\xa0]*Iacobi|یعق(?:وب[\\s\\xa0]*کا[\\s\\xa0]*عا[\\s\\xa0]*?|ُوب[\\s\\xa0]*کا[\\s\\xa0]*عا)م[\\s\\xa0]*خط|y(?:aʿqūb[\\s\\xa0]*kā[\\s\\xa0]*ʿām[\\s\\xa0]*ḫaṭ|ākūb[\\s\\xa0]*dī[\\s\\xa0]*pattrī)|رسالة[\\s\\xa0]*(?:القديس[\\s\\xa0]*)?يعقوب|Jakab|Y(?:a(?:k(?:k[oō]pu[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam|oob)|cquub|q)|ākk[oō]pu[\\s\\xa0]*E[lḻ]utiya[\\s\\xa0]*Nirupam)|யாக(?:்கோபு[\\s\\xa0]*(?:எழுதிய[\\s\\xa0]*(?:நிருப|கடித|திருமுக)|திருமுக)|ப்பர்[\\s\\xa0]*திருமுக)ம்|П(?:ослание[\\s\\xa0]*на[\\s\\xa0]*(?:апостол[\\s\\xa0]*Ја|Я)|исмо[\\s\\xa0]*од[\\s\\xa0]*апостол[\\s\\xa0]*Ја)ков|Посланица[\\s\\xa0]*Јаковљева|Јаковова|Послание[\\s\\xa0]*Иакова|Послання[\\s\\xa0]*апостола[\\s\\xa0]*Якова|С(?:ъборно[\\s\\xa0]*послание[\\s\\xa0]*на[\\s\\xa0]*св(?:\\.[\\s\\xa0]*ап\\.?|[\\s\\xa0]*ап\\.?)[\\s\\xa0]*Иа|оборне[\\s\\xa0]*послання[\\s\\xa0]*(?:св\\.?[\\s\\xa0]*апостола[\\s\\xa0]*)?Я)кова|(?:Hi\\xF0[\\s\\xa0]*almenna[\\s\\xa0]*br[e\\xE9]f[\\s\\xa0]*Jakob|Jac?que)s|(?:(?:Sant|T)iag|Jacob|Barua[\\s\\xa0]*ya[\\s\\xa0]*Yakob|Waraka[\\s\\xa0]*wa[\\s\\xa0]*Yakob)o|Jakobs[\\s\\xa0]*Brev|Ia[cg]|Як|야고|ヤコ[フブ]|Јак|S(?:ant?|t)|याक[ूो]ब|J(?:a(?:k(?:ob(?:us|i)?|ub)?|cq?|me?|ak)?|m)|Ya(?:cq?|k)|யாக்|(?:yāk(?:ob[aā]ce[mṃ]|[uū]bko)[\\s\\xa0]*patr|Poslannja[\\s\\xa0]*apostola[\\s\\xa0]*Jakov|Yaaqoob)a|L(?:ist[\\s\\xa0]*(?:powszechny[\\s\\xa0]*[SŚ]wi[eę]tego[\\s\\xa0]*Iakuba[\\s\\xa0]*Apostoła|Jakub(?:[uů]v|a)|[sś]w\\.?[\\s\\xa0]*Jakuba)|ettera[\\s\\xa0]*di[\\s\\xa0]*Giacomo|ayang[\\s\\xa0]*Yakobus))|(?:Якова)|(?:Јаковљева)|(?:雅(?:各(?:[书書]|伯書))?》|יעקב|亞适烏》|《(?:雅各(?:[书書]|伯書)|亞适烏)|ਯਾਕੂਬ|Яков|Јаков|Iacobi|يعقوب|یعقُ?وب|Y(?:ak(?:ob(?:us|o)|k[oō]pu)|ākk[oō]pu)|யாக்கோபு|ଯାକୁବଙ୍କ|याक(?:ोबाचें|ूबको)|Giacomo|y(?:āk(?:ob[aā]ce[mṃ]|[uū]bko)|ak(?:ob[aā]ce[mṃ]|[uū]bko))|Ja(?:k(?:o(?:bs[\\s\\xa0]*brev|vljeva)|ub(?:[ouů]v|a))|akobin)|yākūb|《雅|Иакова|Послання[\\s\\xa0]*Якова)|(?:雅各(?:[书書]|伯書)|亞适烏|雅|Jakobs))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Amos"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ἀμ|암|Ам|아모스서|ਆਮੋਸ|अमोस|עמוס|Αμ[ωώ]ς|アモス(?:しょ|書)|อ(?:าโ)?มส|ஆமோஸ்|\\xC1mosz|《(?:阿摩司[书書]|亞毛斯|摩)》|عامُوس|سفر[\\s\\xa0]*عاموس|आमोसको[\\s\\xa0]*पुस्तक|(?:Ām[oō]|ʿāmō|\\xC1m\\xF3|Caamoo|Prophetia[\\s\\xa0]*Amo)s|(?:Ks(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Amos|Liv[\\s\\xa0]*Am[o\\xF2]s[\\s\\xa0]*l)a|A(?:m(?:o(?:s(?:['’][\\s\\xa0]*(?:Bog|bok)|[iz])|xa)|(?:\\xF3|ō)?s)|\\-?mốt|amoksen[\\s\\xa0]*kirja)|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*пророк|пророка)[\\s\\xa0]*Амоса|아모스?|Αμ|アモス|ஆமோ|\\xC1m(?:os)?|عا|Caam|आमोस|A(?:m(?:\\xF3|ox?)?|am)|Книга[\\s\\xa0]*на[\\s\\xa0]*пророк[\\s\\xa0]*Амос|ଆମୋଷ[\\s\\xa0]*ଭବିଷ୍ୟ‌ଦ୍‌ବକ୍ତାଙ୍କ[\\s\\xa0]*ପୁସ୍ତକ)|(?:Amosa)|(?:《(?:阿摩司[书書]|亞毛斯|摩)|Амоса|ଆମୋଷ|عاموس|(?:亞毛斯|摩)》|阿摩司[书書]》|[aā]mos|Амос|A(?:amoksen|m\\xF2s))|(?:亞毛斯|摩|Amos|阿摩司[书書]))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Tob"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:T(?:ob(?:i(?:j(?:\\xE1[sš]|a[sš])|\\xE1[sš]|olo|e|ts[\\s\\xa0]*Bog|tsb[o\\xF3]k|ts[\\s\\xa0]*bok|a(?:s['’][\\s\\xa0]*bok|š))|\\xEDtsb[o\\xF3]k|\\xEDas|t)|\\xF3bi[a\\xE1]s|b|ho|\\xF3bij[a\\xE1][sš]|\\xF3b[i\\xED]tsb[o\\xF3]k)|토(?:비트|빗기)|طو|ト[ヒビ]ト[書記]|โทบิต|טוביה|Τωβ[ίι]τ|《多俾亞傳》|Тов|سفر[\\s\\xa0]*طوبيا|Liber[\\s\\xa0]*Tobiae|Liber[\\s\\xa0]*Thobis|த(?:ொபியாசு[\\s\\xa0]*ஆகமம்|ோபித்து)|Тобија|К(?:нига[\\s\\xa0]*(?:за[\\s\\xa0]*Тобия|Товита|на[\\s\\xa0]*Товита)|њига[\\s\\xa0]*Товијина)|Tobi(?:aa?|ti)n[\\s\\xa0]*kirja|Ks(?:\\.[\\s\\xa0]*Tobi(?:asz|t)|[\\s\\xa0]*Tobi(?:asz|t)|i[eę]g[ai][\\s\\xa0]*Tobi(?:asz|t))a|T(?:ob(?:i(?:ja|ti|a)?|\\xEDa)?|\\xF3b(?:it)?)|ト[ヒビ]ト|토빗|Τωβ|தோபி|Книга[\\s\\xa0]*на[\\s\\xa0]*Товит|Cartea[\\s\\xa0]*lui[\\s\\xa0]*Tobit)|(?:طوبيا|《多俾亞傳|多俾亞傳》|То(?:вита|бия)|Товит|多俾亞傳|Tobi(?:a(?:[ens]|an)|t(?:in)?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jdt"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Juditin[\\s\\xa0]*kirja)|(?:ユ[テデ](?:ィト記|ト書)|يـه|유딧기|ยูดิธ|Юди(?:фь|т)|《友弟德傳》|יהודית|Ι(?:ουδ[ίι]|δ)θ|Yud(?:ith?i|t)|யூதித்து|سفر[\\s\\xa0]*يهوديت|J(?:ud(?:it(?:s[\\s\\xa0]*Bog|[eh]|s[\\s\\xa0]*bok|arb[o\\xF3]k)|\\xEDtarb[o\\xF3]k|th)|\\xFAd[i\\xED]tarb[o\\xF3]k|\\xFAdt|di?th)|Liber[\\s\\xa0]*Iudith|Јудита|К(?:нига[\\s\\xa0]*(?:Иудит|Юдити|за[\\s\\xa0]*Юдита)|њига[\\s\\xa0]*о[\\s\\xa0]*Јудити)|[GI]dt|J(?:(?:\\xFAdi|di?)t|ud(?:ita?|t))|ユ[テデ]ィト|유딧|Юди|Јуд|Yudith|யூதி|(?:Giudit|Iudi)ta|K(?:s(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Judyty|itab[\\s\\xa0]*Yudit|[\\s\\xa0]*Juditina|\\.[\\s\\xa0]*Juditina|niha[\\s\\xa0]*Juditina))|(?:《友弟德傳|友弟德傳》|Юдити|Иудит|Yudit|Iudith|يهوديت|友弟德傳|Jud(?:itin|yty)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Bar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:[ハバ]ルク書|바룩서|《巴路克》|باروك|Β(?:αρο[υύ]χ|ρ)|ワルフの預言書|பாரூக்கு|ספר[\\s\\xa0]*ברוך|سفر[\\s\\xa0]*باروخ|บารุค|พระธรรมบารุค|B(?:ar(?:u(?:k(?:s(?:[\\s\\xa0]*(?:Bog|bok)|b[o\\xF3]k)|u)|[ch]|que)|\\xFAksb[o\\xF3]k)|\\xE1ruk|r)|(?:Liber[\\s\\xa0]*Ba|B\\xE1)ruch|Baa?rukin[\\s\\xa0]*kirja|K(?:s(?:i[eę]g[ai]|\\.)?[\\s\\xa0]*Barucha|itab[\\s\\xa0]*Barukh|niha[\\s\\xa0]*B[a\\xE1]ru(?:ch|k)ova)|Proroctvo[\\s\\xa0]*Baruchovo|Варух|[ハバ]ルク|바룩|با|Вар|Βαρ|பாரூ|B(?:a(?:r(?:uk)?)?|\\xE1r)|Бару́ха|Книга[\\s\\xa0]*(?:на[\\s\\xa0]*(?:пророк[\\s\\xa0]*Варуха|Барух)|(?:пророка[\\s\\xa0]*Вару́|Вару)ха))|(?:Ba(?:ru(?:cha|kh|ch|kin)|arukin)|《巴路克|巴路克》|ברוך|Барух|Варуха|巴路克))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:1(?:\.[\s\xa0]*(?:Ks|Re)|[\s\xa0]*(?:Ks|Re))|I(?:\.[\s\xa0]*K[is]|[\s\xa0]*K[is])))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ̀-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײؐ-ؚؠ-ٟٮ-ۓە-ۜ۟-۪ۨ-ۯۺ-ۼۿݐ-ݿࢠࢢ-ࢬࣤ-ࣾऀ-ंऄ-ऺ़-ऽु-ै्ॐ-ॣॱ-ॷॹ-ॿਁ-ਂਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ਼ੁ-ੂੇ-ੈੋ-੍ੑਖ਼-ੜਫ਼ੰ-ੵଁଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ଼-ଽିୁ-ୄ୍ୖଡ଼-ଢ଼ୟ-ୣୱஂ-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹீ்ௐก-ฺเ-๎᷀-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⃐-⃿Ⱡ-Ɀⷠ-ⷿ々-〆〪-〭〱-〵〻-〼㐀-䶵一-鿌Ꙁ-꙯ꙴ-꙽ꙿ-ꚗꚟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ꣠-ꣷꣻ가-힯豈-舘並-龎ﭐ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼ])((?:2(?:\.?[\s\xa0]*Ks|\.?[\s\xa0]*Re)|II\.?[\s\xa0]*Ks))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Acts"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Апостол))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ezek", "Ezra"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ez|Ез))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ezra"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:拉))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hab", "Hag"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ha))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Heb", "Hab"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Hb))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Job"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:伯))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jan|約))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John", "Jonah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Yn))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John", "Jonah", "Job", "Josh", "Joel"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Jo))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["John", "Josh", "Joel", "Jonah"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:யோ))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jonah", "Joel"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Yoo))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Josh"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:書))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
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
        osis: ["Lev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:利))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:太))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt", "Mark", "Mal"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Ma))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mic"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Mi))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil", "Phlm"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Phl?|Fil))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rev"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Re))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Song"],
        regexp: RegExp("(^|" + bcv_parser.prototype.regexps.pre_book + ")((?:Songs|歌))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
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

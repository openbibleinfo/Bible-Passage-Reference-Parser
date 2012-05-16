(function() {
  var bcv_parser, bcv_passage, root;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = this;
  bcv_parser = (function() {
    bcv_parser.prototype.s = "";
    bcv_parser.prototype.entities = [];
    bcv_parser.prototype.passage = null;
    bcv_parser.prototype.regexps = {};
    bcv_parser.prototype.default_options = {};
    bcv_parser.prototype.options = {
      consecutive_combination_strategy: "combine",
      osis_compaction_strategy: "b",
      book_sequence_strategy: "ignore",
      invalid_sequence_strategy: "ignore",
      sequence_combination_strategy: "combine",
      invalid_passage_strategy: "ignore",
      zero_chapter_strategy: "error",
      zero_verse_strategy: "error",
      book_alone_strategy: "ignore",
      captive_end_digits_strategy: "delete",
      end_range_digits_strategy: "verse"
    };
    function bcv_parser() {
      var key, val, _ref;
      this.options = {};
      _ref = bcv_parser.prototype.options;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        val = _ref[key];
        this.options[key] = val;
      }
    }
    bcv_parser.prototype.parse = function(s) {
      var accum, entities, entity, _i, _len, _ref;
      this.reset();
      this.s = s;
      s = this.replace_control_characters(s);
      _ref = this.match_books(s), s = _ref[0], this.passage.books = _ref[1];
      entities = this.match_passages(s);
      this.entities = [];
      for (_i = 0, _len = entities.length; _i < _len; _i++) {
        entity = entities[_i];
        accum = this.passage.handle_array([entity])[0];
        this.entities = this.entities.concat(accum);
      }
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
      var key, val, _results;
      _results = [];
      for (key in options) {
        if (!__hasProp.call(options, key)) continue;
        val = options[key];
        _results.push(this.options[key] = val);
      }
      return _results;
    };
    bcv_parser.prototype.include_apocrypha = function(arg) {
      var book, key, val, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
      if (arg == null) {
        return this;
      }
      if (arg === true) {
        _ref = this.translations.apocrypha.order;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          this.translations["default"].order[key] = val;
        }
        this.translations["default"].chapters.Ps[150] = this.translations["default"].chapters.Ps151[0];
        if (!((this.regexps.books[0].apocrypha != null) && this.regexps.books[0].apocrypha === true)) {
          _ref2 = this.regexps.apocrypha;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            book = _ref2[_i];
            this.regexps.books.unshift(book);
          }
        }
      } else if (arg === false) {
        _ref3 = this.translations.apocrypha.order;
        for (key in _ref3) {
          if (!__hasProp.call(_ref3, key)) continue;
          val = _ref3[key];
          if (this.translations["default"].order[key] != null) {
            delete this.translations["default"].order[key];
          }
        }
        if ((this.regexps.books[0].apocrypha != null) && this.regexps.books[0].apocrypha === true) {
          _ref4 = this.regexps.books;
          for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
            book = _ref4[_j];
            if (typeof book.apocrypha === "function" ? book.apocrypha(book.apocrypha === true) : void 0) {
              this.regexps.books.shift();
            } else {
              break;
            }
          }
        }
        if (this.translations["default"].chapters.Ps.length === 151) {
          this.translations["default"].chapters.Ps.pop();
        }
      }
      return this;
    };
    bcv_parser.prototype.replace_control_characters = function(s) {
      return s.replace(this.regexps.control, " ");
    };
    bcv_parser.prototype.match_books = function(s) {
      var book, books, _i, _len, _ref;
      books = [];
      _ref = this.regexps.books;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        book = _ref[_i];
        s = s.replace(book.regexp, function(full, prev, bk) {
          var extra;
          books.push({
            value: bk,
            parsed: book.osis
          });
          extra = book.extra != null ? "/" + book.extra : "";
          return "" + prev + "\x1f" + (books.length - 1) + extra + "\x1f";
        });
      }
      s = s.replace(this.regexps.translations, function(match) {
        books.push({
          value: match,
          parsed: match.toLowerCase()
        });
        return "\x1e" + (books.length - 1) + "\x1e";
      });
      return [s, this.get_book_indices(books, s)];
    };
    bcv_parser.prototype.get_book_indices = function(books, s) {
      var add_index, match, re;
      add_index = 0;
      re = /([\x1f\x1e])(\d+)(?:\/[a-z])?\1/g;
      while (match = re.exec(s)) {
        books[match[2]].start_index = match.index + add_index;
        add_index += books[match[2]].value.length - match[0].length;
      }
      return books;
    };
    bcv_parser.prototype.match_passages = function(s) {
      var book_id, full, match, next_char, part, passage, passages, re, start_index_adjust;
      passages = [];
      while (match = this.regexps.escaped_passage.exec(s)) {
        full = match[0], part = match[1], book_id = match[2];
        match.index += full.length - part.length;
        if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
          re = /\s+\d+\s*$/;
          part = part.replace(re, "");
        }
        if (!/[\d\x1f\x1e]$/.test(part)) {
          part = this.replace_match_end(part);
        }
        if (this.options.captive_end_digits_strategy === "delete") {
          next_char = match.index + part.length;
          if (s.length > next_char && /^\w/.test(s.substr(next_char, 1))) {
            part = part.replace(/[\s*]+\d+$/, "");
          }
          part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
        }
        part = part.replace(/[A-Z]+/, function(capitals) {
          return capitals.toLowerCase();
        });
        start_index_adjust = part.substr(0, 1 === "\x1f") ? 0 : part.split("\x1f")[0].length;
        passage = {
          value: grammar.parse(part),
          type: "base",
          start_index: this.passage.books[book_id].start_index - start_index_adjust,
          match: part
        };
        if (this.options.book_alone_strategy === "full" && passage.value.length === 1 && passage.value[0].type === "b" && start_index_adjust === 0 && this.passage.books[book_id].parsed.length === 1 && /^[234]/.test(this.passage.books[book_id].parsed[0])) {
          this.create_book_range(s, passage, book_id);
        }
        passages.push(passage);
      }
      return passages;
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
      var cases, i, limit, prev, range_regexp;
      cases = [bcv_parser.prototype.regexps.first, bcv_parser.prototype.regexps.second, bcv_parser.prototype.regexps.third];
      limit = parseInt(this.passage.books[book_id].parsed[0].substr(0, 1), 10);
      for (i = 1; 1 <= limit ? i < limit : i > limit; 1 <= limit ? i++ : i--) {
        range_regexp = i === limit - 1 ? bcv_parser.prototype.regexps.range_and : bcv_parser.prototype.regexps.range_only;
        prev = s.match(RegExp("\\b(" + cases[i - 1] + "\\s*" + range_regexp + "\\s*)\\x1f" + book_id + "\\x1f", "i"));
        if (prev != null) {
          return this.add_book_range_object(passage, prev, i);
        }
      }
      return false;
    };
    bcv_parser.prototype.add_book_range_object = function(passage, prev, start_book_number) {
      var length;
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
      return passage.match = prev[1] + passage.match;
    };
    bcv_parser.prototype.osis = function() {
      var osis, out, _i, _len, _ref;
      out = [];
      _ref = this.parsed_entities();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        osis = _ref[_i];
        if (osis.osis.length > 0) {
          out.push(osis.osis);
        }
      }
      return out.join(",");
    };
    bcv_parser.prototype.osis_and_translations = function() {
      var osis, out, _i, _len, _ref;
      out = [];
      _ref = this.parsed_entities();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        osis = _ref[_i];
        if (osis.osis.length > 0) {
          out.push([osis.osis, osis.translations.join(",")]);
        }
      }
      return out;
    };
    bcv_parser.prototype.osis_and_indices = function() {
      var osis, out, _i, _len, _ref;
      out = [];
      _ref = this.parsed_entities();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        osis = _ref[_i];
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
      var entity, entity_id, i, length, osis, osises, out, passage, strings, translation, translation_alias, translation_osis, translations, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      out = [];
      for (entity_id = 0, _ref = this.entities.length; 0 <= _ref ? entity_id < _ref : entity_id > _ref; 0 <= _ref ? entity_id++ : entity_id--) {
        entity = this.entities[entity_id];
        if (entity.type && entity.type === "translation_sequence" && out.length > 0 && entity_id === out[out.length - 1].entity_id + 1) {
          out[out.length - 1].indices[1] = entity.absolute_indices[1];
        }
        if (entity.passages == null) {
          continue;
        }
        if ((entity.type === "b" || entity.type === "b_range") && this.options.book_alone_strategy === "ignore") {
          continue;
        }
        translations = [];
        translation_alias = null;
        if (entity.passages[0].translations != null) {
          _ref2 = entity.passages[0].translations;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            translation = _ref2[_i];
            translation_osis = ((_ref3 = translation.osis) != null ? _ref3.length : void 0) > 0 ? translation.osis : "";
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
        for (i = 0; 0 <= length ? i < length : i > length; 0 <= length ? i++ : i--) {
          passage = entity.passages[i];
          if ((_ref4 = passage.type) == null) {
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
          if ((_ref5 = passage.absolute_indices) == null) {
            passage.absolute_indices = entity.absolute_indices;
          }
          osises.push({
            osis: passage.valid.valid ? this.to_osis(passage.start, passage.end, translation_alias) : "",
            type: passage.type,
            indices: passage.absolute_indices,
            translations: translations,
            start: passage.start,
            end: passage.end,
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
          for (_j = 0, _len2 = osises.length; _j < _len2; _j++) {
            osis = osises[_j];
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
      var osis, _ref, _ref2, _ref3, _ref4;
      if (!(end.c != null) && !(end.v != null) && start.b === end.b && !(start.c != null) && !(start.v != null) && this.options.book_alone_strategy === "first_chapter") {
        end.c = 1;
      }
      osis = {
        start: "",
        end: ""
      };
      if ((_ref = start.c) == null) {
        start.c = 1;
      }
      if ((_ref2 = start.v) == null) {
        start.v = 1;
      }
      if ((_ref3 = end.c) == null) {
        end.c = this.passage.translations[translation].chapters[end.b].length;
      }
      if ((_ref4 = end.v) == null) {
        end.v = this.passage.translations[translation].chapters[end.b][end.c - 1];
      }
      if (this.options.osis_compaction_strategy === "b" && start.c === 1 && start.v === 1 && end.c === this.passage.translations[translation].chapters[end.b].length && end.v === this.passage.translations[translation].chapters[end.b][end.c - 1]) {
        osis.start = start.b;
        osis.end = end.b;
      } else if (this.options.osis_compaction_strategy.length <= 2 && start.v === 1 && end.v === this.passage.translations[translation].chapters[end.b][end.c - 1]) {
        osis.start = start.b + "." + start.c.toString();
        osis.end = end.b + "." + end.c.toString();
      } else {
        osis.start = start.b + "." + start.c.toString() + "." + start.v.toString();
        osis.end = end.b + "." + end.c.toString() + "." + end.v.toString();
      }
      if (osis.start === osis.end) {
        return osis.start;
      }
      return osis.start + "-" + osis.end;
    };
    bcv_parser.prototype.combine_consecutive_passages = function(osises, translation) {
      var osis, out, prev, prev_i, _i, _len;
      out = [];
      prev = {};
      for (_i = 0, _len = osises.length; _i < _len; _i++) {
        osis = osises[_i];
        if (osis.osis.length > 0) {
          if (this.is_verse_consecutive(prev, osis.start, translation)) {
            prev_i = out.length - 1;
            out[prev_i].end = osis.end;
            out[prev_i].indices[1] = osis.indices[1];
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
      return out;
    };
    bcv_parser.prototype.is_verse_consecutive = function(prev, check, translation) {
      if (prev.b == null) {
        return false;
      }
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
      } else if (check.c === 1 && check.v === 1 && this.passage.translations[translation].order[prev.b] === this.passage.translations[translation].order[check.b] - 1) {
        if (prev.c === this.passage.translations[translation].chapters[prev.b].length && prev.v === this.passage.translations[translation].chapters[prev.b][prev.c - 1]) {
          return true;
        }
      }
      return false;
    };
    bcv_parser.prototype.snap_sequence = function(type, entity, osises, i, length) {
      var passage;
      passage = entity.passages[i];
      if (passage.absolute_indices[0] === entity.absolute_indices[0] && i < length - 1 && this.get_snap_sequence_i(entity.passages, i, length) !== i) {
        entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0];
      } else if (passage.absolute_indices[1] === entity.absolute_indices[1] && i > 0) {
        entity.absolute_indices[1] = osises.length > 0 ? osises[osises.length - 1].indices[1] : entity.passages[i - 1].absolute_indices[1];
      } else if (type === "book" && i < length - 1 && !this.starts_with_book(entity.passages[i + 1])) {
        entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0];
      }
      return entity;
    };
    bcv_parser.prototype.get_snap_sequence_i = function(passages, i, length) {
      var j, _ref;
      for (j = _ref = i + 1; _ref <= length ? j < length : j > length; _ref <= length ? j++ : j--) {
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
      var passage, _i, _len, _ref;
      if (accum == null) {
        accum = [];
      }
      if (context == null) {
        context = {};
      }
      for (_i = 0, _len = passages.length; _i < _len; _i++) {
        passage = passages[_i];
        _ref = this.handle_obj(passage, accum, context), accum = _ref[0], context = _ref[1];
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
      var alternates, b, obj, valid, _i, _len, _ref, _ref2;
      passage.start_context = this.shallow_clone(context);
      passage.passages = [];
      alternates = [];
      _ref = this.books[passage.value].parsed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
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
      if ((_ref2 = passage.absolute_indices) == null) {
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
      var alternates, book, end, start_obj, _ref, _ref2;
      passage.start_context = this.shallow_clone(context);
      passage.passages = [];
      alternates = [];
      book = this.pluck("b", passage.value);
      _ref = this.b(book, [], context), end = _ref[0][0], context = _ref[1];
      if ((_ref2 = passage.absolute_indices) == null) {
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
    bcv_passage.prototype.base = function(passage, accum, context) {
      this.indices = this.calculate_indices(passage.match, passage.start_index);
      return this.handle_array(passage.value, accum, context);
    };
    bcv_passage.prototype.bc = function(passage, accum, context) {
      var alternates, b, c, context_key, obj, type, valid, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _ref5;
      passage.start_context = this.shallow_clone(context);
      passage.passages = [];
      _ref = ["b", "c", "v"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        delete context[type];
      }
      c = this.pluck("c", passage.value).value;
      alternates = [];
      _ref2 = this.books[this.pluck("b", passage.value).value].parsed;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        b = _ref2[_j];
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
        if (valid.messages.start_chapter_not_exist_in_single_chapter_book) {
          obj.valid = this.validate_ref(passage.start_context.translations, {
            b: b,
            v: c
          });
          obj.start.c = 1;
          obj.end.c = 1;
          context_key = "v";
        }
        obj.start[context_key] = c;
        _ref3 = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v), obj.start.c = _ref3[0], obj.start.v = _ref3[1];
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
      if ((_ref4 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      _ref5 = ["b", "c", "v"];
      for (_k = 0, _len3 = _ref5.length; _k < _len3; _k++) {
        type = _ref5[_k];
        if (passage.passages[0].start[type] != null) {
          context[type] = passage.passages[0].start[type];
        }
      }
      accum.push(passage);
      return [accum, context];
    };
    bcv_passage.prototype.bc_title = function(passage, accum, context) {
      var bc, i, title, _ref, _ref2;
      passage.start_context = this.shallow_clone(context);
      _ref = this.bc(this.pluck("bc", passage.value), [], context), bc = _ref[0][0], context = _ref[1];
      if (bc.passages[0].start.b !== "Ps" && (bc.passages[0].alternates != null)) {
        for (i = 0, _ref2 = bc.passages[0].alternates.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
          if (bc.passages[0].alternates[i].start.b !== "Ps") {
            continue;
          }
          bc.passages[0] = bc.passages[0].alternates[i];
          break;
        }
      }
      if (bc.passages[0].start.b !== "Ps") {
        accum.push(bc);
        return [accum, context];
      }
      this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
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
      passage.original_type = "bc_title";
      passage.type = "bcv";
      return this.bcv(passage, accum, passage.start_context);
    };
    bcv_passage.prototype.bcv = function(passage, accum, context) {
      var alternates, b, bc, c, obj, type, v, valid, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _ref5;
      passage.start_context = this.shallow_clone(context);
      passage.passages = [];
      _ref = ["b", "c", "v"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        delete context[type];
      }
      bc = this.pluck("bc", passage.value);
      c = this.pluck("c", bc.value).value;
      v = this.pluck("v", passage.value).value;
      alternates = [];
      _ref2 = this.books[this.pluck("b", bc.value).value].parsed;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        b = _ref2[_j];
        valid = this.validate_ref(passage.start_context.translations, {
          b: b,
          c: c,
          v: v
        });
        _ref3 = this.fix_start_zeroes(valid, c, v), c = _ref3[0], v = _ref3[1];
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
      if ((_ref4 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      _ref5 = ["b", "c", "v"];
      for (_k = 0, _len3 = _ref5.length; _k < _len3; _k++) {
        type = _ref5[_k];
        if (passage.passages[0].start[type] != null) {
          context[type] = passage.passages[0].start[type];
        }
      }
      accum.push(passage);
      return [accum, context];
    };
    bcv_passage.prototype.bv = function(passage, accum, context) {
      var b, bcv, v, _ref, _ref2, _ref3;
      passage.start_context = this.shallow_clone(context);
      _ref = passage.value, b = _ref[0], v = _ref[1];
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
      _ref2 = this.bcv(bcv, [], context), bcv = _ref2[0][0], context = _ref2[1];
      passage.passages = bcv.passages;
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if ((_ref3 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      return [accum, context];
    };
    bcv_passage.prototype.c = function(passage, accum, context) {
      var c, valid, _ref;
      passage.start_context = this.shallow_clone(context);
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
      delete context.v;
      if ((_ref = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };
    bcv_passage.prototype.c_psalm = function(passage, accum, context) {
      var c;
      passage.original_type = passage.type;
      passage.original_value = passage.value;
      passage.type = "bc";
      c = this.books[passage.value].value.match(/^\d+/)[0];
      passage.value = [
        {
          type: "b",
          value: passage.original_value,
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
      passage.start_context = this.shallow_clone(context);
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
      passage.original_type = "c_title";
      passage.type = "cv";
      return this.cv(passage, accum, passage.start_context);
    };
    bcv_passage.prototype.cv = function(passage, accum, context) {
      var c, v, valid, _ref, _ref2;
      passage.start_context = this.shallow_clone(context);
      c = this.pluck("c", passage.value).value;
      v = this.pluck("v", passage.value).value;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c,
        v: v
      });
      _ref = this.fix_start_zeroes(valid, c, v), c = _ref[0], v = _ref[1];
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
      if ((_ref2 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };
    bcv_passage.prototype.cb_range = function(passage, accum, context) {
      var b, end_c, start_c, _ref;
      passage.original_type = passage.type;
      passage.type = "range";
      _ref = passage.value, b = _ref[0], start_c = _ref[1], end_c = _ref[2];
      passage.original_value = [b, start_c, end_c];
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
    bcv_passage.prototype.cv_psalm = function(passage, accum, context) {
      var bc, c_psalm, v, _ref;
      passage.start_context = this.shallow_clone(context);
      passage.original_type = passage.type;
      passage.original_value = passage.value;
      _ref = passage.value, c_psalm = _ref[0], v = _ref[1];
      passage.type = "bcv";
      bc = this.c_psalm(c_psalm, [], passage.start_context)[0][0];
      passage.value = [bc, v];
      return this.bcv(passage, accum, context);
    };
    bcv_passage.prototype.ff = function(passage, accum, context) {
      var _ref, _ref2;
      passage.start_context = this.shallow_clone(context);
      passage.value.push({
        type: "integer",
        indices: passage.indices,
        value: 999
      });
      _ref = this.range(passage, [], passage.start_context), passage = _ref[0][0], context = _ref[1];
      passage.value.pop();
      if (passage.passages[0].valid.end_verse_not_exist != null) {
        delete passage.passages[0].valid.end_verse_not_exist;
      }
      if (passage.passages[0].valid.end_chapter_not_exist != null) {
        delete passage.passages[0].valid.end_chapter_not_exist;
      }
      if (passage.passages[0].end.original_c != null) {
        delete passage.passages[0].end.original_c;
      }
      accum.push(passage);
      if ((_ref2 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };
    bcv_passage.prototype.integer_title = function(passage, accum, context) {
      var v_indices;
      passage.start_context = this.shallow_clone(context);
      if (context.b !== "Ps") {
        return this.integer(passage.value[0], accum, context);
      }
      passage.value[0] = {
        type: "c",
        value: [passage.value[0]],
        indices: [passage.value[0].indices[0], passage.value[0].indices[1]]
      };
      v_indices = [passage.indices[1] - 5, passage.indices[1]];
      passage.value[1] = {
        type: "v",
        value: [
          {
            type: "integer",
            value: 1,
            indices: v_indices
          }
        ],
        indices: v_indices
      };
      passage.original_type = "integer_title";
      passage.type = "cv";
      return this.cv(passage, accum, passage.start_context);
    };
    bcv_passage.prototype.integer = function(passage, accum, context) {
      if (context.v != null) {
        return this.v(passage, accum, context);
      }
      return this.c(passage, accum, context);
    };
    bcv_passage.prototype.sequence = function(passage, accum, context) {
      var obj, psg, sub_psg, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      passage.start_context = this.shallow_clone(context);
      passage.passages = [];
      _ref = passage.value;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        _ref2 = this.handle_array(obj, [], context), psg = _ref2[0][0], context = _ref2[1];
        _ref3 = psg.passages;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          sub_psg = _ref3[_j];
          if ((_ref4 = sub_psg.type) == null) {
            sub_psg.type = psg.type;
          }
          if ((_ref5 = sub_psg.absolute_indices) == null) {
            sub_psg.absolute_indices = psg.absolute_indices;
          }
          if (psg.start_context.translations != null) {
            sub_psg.translations = psg.start_context.translations;
          }
          passage.passages.push(sub_psg);
        }
      }
      if (passage.absolute_indices == null) {
        if (passage.passages.length > 0) {
          passage.absolute_indices = [passage.passages[0].absolute_indices[0], passage.passages[passage.passages.length - 1].absolute_indices[1]];
        } else {
          passage.absolute_indices = this.get_absolute_indices(passage.indices);
        }
      }
      accum.push(passage);
      return [accum, context];
    };
    bcv_passage.prototype.v = function(passage, accum, context) {
      var c, no_c, v, valid, _ref, _ref2;
      v = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
      passage.start_context = this.shallow_clone(context);
      c = context.c != null ? context.c : 1;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c,
        v: v
      });
      _ref = this.fix_start_zeroes(valid, 0, v), no_c = _ref[0], v = _ref[1];
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
      if ((_ref2 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      context.v = v;
      return [accum, context];
    };
    bcv_passage.prototype.range = function(passage, accum, context) {
      var end, end_obj, new_end, start, start_obj, temp_valid, temp_value, valid, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      passage.start_context = this.shallow_clone(context);
      _ref = passage.value, start = _ref[0], end = _ref[1];
      if (end.type === "v" && (start.type === "bc" || start.type === "c") && this.options.end_range_digits_strategy === "verse") {
        return this.range_change_integer_end(passage, accum);
      }
      _ref2 = this.handle_obj(start, [], context), start = _ref2[0][0], context = _ref2[1];
      _ref3 = this.handle_obj(end, [], context), end = _ref3[0][0], context = _ref3[1];
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
        if (valid.messages.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && !(start_obj.v != null) && (end.type === "integer" || end.type === "v")) {
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
        if (valid.messages.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && (start_obj.v != null) && end.type === "cv") {
          temp_valid = this.validate_ref(passage.start_context.translations, {
            b: end_obj.b,
            c: start_obj.c,
            v: end_obj.c
          });
          if (temp_valid.valid) {
            temp_valid = this.validate_ref(passage.start_context.translations, {
              b: end_obj.b,
              c: start_obj.c,
              v: end_obj.v
            });
          }
          if (temp_valid.valid) {
            return this.range_change_cv_end(passage, accum);
          }
        }
        this.range_validate(valid, start_obj, end_obj, passage);
      } else {
        if ((valid.messages.end_chapter_before_start || valid.messages.end_verse_before_start) && (end.type === "integer" || end.type === "v") || (valid.messages.end_chapter_before_start && end.type === "cv")) {
          new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
          if (new_end > 0) {
            return this.range_change_end(passage, accum, new_end);
          }
        }
        if (this.options.end_range_digits_strategy === "verse" && start_obj.v === void 0 && (end.type === "integer" || end.type === "v")) {
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
        _ref4 = [passage.type, "sequence"], passage.original_type = _ref4[0], passage.type = _ref4[1];
        _ref5 = [[start, end], [[start], [end]]], passage.original_value = _ref5[0], passage.value = _ref5[1];
        return this.handle_obj(passage, accum, passage.start_context);
      }
      if ((_ref6 = passage.absolute_indices) == null) {
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
      accum.push(passage);
      return [accum, context];
    };
    bcv_passage.prototype.range_change_end = function(passage, accum, new_end) {
      var end, new_obj, start, _ref;
      _ref = passage.value, start = _ref[0], end = _ref[1];
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
      var end, start, _ref;
      _ref = passage.value, start = _ref[0], end = _ref[1];
      passage.original_type = passage.type;
      passage.original_value = [start, end];
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
    bcv_passage.prototype.range_change_cv_end = function(passage, accum) {
      var end, new_range_end, new_sequence_end, start, _ref, _ref2;
      _ref = passage.value, start = _ref[0], end = _ref[1];
      passage.original_type = passage.type;
      passage.original_value = [start, end];
      passage.type = "sequence";
      _ref2 = end.value, new_range_end = _ref2[0], new_sequence_end = _ref2[1];
      new_range_end = this.shallow_clone(new_range_end);
      new_range_end.original_type = new_range_end.type;
      new_range_end.type = "v";
      passage.value = [
        [
          {
            type: "range",
            value: [start, new_range_end],
            indices: [start.indices[0], new_range_end.indices[1]]
          }
        ], [new_sequence_end]
      ];
      return this.sequence(passage, accum, passage.start_context);
    };
    bcv_passage.prototype.range_validate = function(valid, start_obj, end_obj, passage) {
      var _ref;
      if (valid.messages.end_chapter_not_exist) {
        end_obj.original_c = end_obj.c;
        end_obj.c = valid.messages.end_chapter_not_exist;
        if (end_obj.v != null) {
          end_obj.v = this.validate_ref(passage.start_context.translations, {
            b: end_obj.b,
            c: end_obj.c,
            v: 999
          }).messages.end_verse_not_exist;
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
      _ref = this.fix_start_zeroes(valid, start_obj.c, start_obj.v), start_obj.c = _ref[0], start_obj.v = _ref[1];
      return true;
    };
    bcv_passage.prototype.fix_start_zeroes = function(valid, c, v) {
      if (valid.valid) {
        if (valid.messages.start_chapter_is_zero) {
          c = valid.messages.start_chapter_is_zero;
        }
        if (valid.messages.start_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
          v = valid.messages.start_verse_is_zero;
        }
      }
      return [c, v];
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
    bcv_passage.prototype.translation_sequence = function(passage, accum, context) {
      var alias, i, new_accum, translation, translations, use_i, val, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
      translations = [];
      translations.push({
        translation: this.books[passage.value[0].value].parsed
      });
      _ref = passage.value[1];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        val = this.books[this.pluck("translation", val).value].parsed;
        translations.push({
          translation: val != null ? val : void 0
        });
      }
      for (_j = 0, _len2 = translations.length; _j < _len2; _j++) {
        translation = translations[_j];
        alias = this.translations.aliases[translation.translation] != null ? translation.translation : "default";
        translation.osis = this.translations.aliases[alias].osis;
        translation.alias = this.translations.aliases[alias].alias;
      }
      if (accum.length > 0) {
        use_i = 0;
        for (i = _ref2 = accum.length - 1; _ref2 <= 0 ? i <= 0 : i >= 0; _ref2 <= 0 ? i++ : i--) {
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
          _ref3 = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context), new_accum = _ref3[0], context = _ref3[1];
        }
      }
      if ((_ref4 = passage.absolute_indices) == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      delete context.translations;
      return [accum, context];
    };
    bcv_passage.prototype.pluck = function(type, passages) {
      var passage, _i, _len;
      for (_i = 0, _len = passages.length; _i < _len; _i++) {
        passage = passages[_i];
        if (!((passage.type != null) && passage.type === type)) {
          continue;
        }
        if (type === "c" || type === "v") {
          return this.pluck("integer", passage.value);
        }
        return passage;
      }
      return null;
    };
    bcv_passage.prototype.shallow_clone = function(obj) {
      var key, out, val;
      out = {};
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        out[key] = val;
      }
      return out;
    };
    bcv_passage.prototype.calculate_indices = function(match, adjust) {
      var character, end_index, indices, match_index, part, part_length, parts, switch_type, temp, _i, _j, _k, _len, _len2, _len3, _ref;
      switch_type = "book";
      indices = [];
      match_index = 0;
      adjust = parseInt(adjust, 10);
      parts = [match];
      _ref = ["\x1e", "\x1f"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        temp = [];
        for (_j = 0, _len2 = parts.length; _j < _len2; _j++) {
          part = parts[_j];
          temp = temp.concat(part.split(character));
        }
        parts = temp;
      }
      for (_k = 0, _len3 = parts.length; _k < _len3; _k++) {
        part = parts[_k];
        switch_type = switch_type === "book" ? "rest" : "book";
        part_length = part.length;
        if (part_length === 0) {
          continue;
        }
        if (switch_type === "book") {
          part = part.replace(/\/[a-z]$/, "");
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
    bcv_passage.prototype.get_absolute_indices = function(_arg) {
      var end, end_out, index, start, start_out, _i, _len, _ref;
      start = _arg[0], end = _arg[1];
      start_out = null;
      end_out = null;
      _ref = this.indices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        index = _ref[_i];
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
      var messages, translation, valid, _ref, _ref2, _ref3;
      translations || (translations = [
        {
          translation: "default",
          osis: "",
          alias: "default"
        }
      ]);
      translation = translations[0];
      if (translation == null) {
        return {
          valid: false,
          messages: {
            translation_invalid: true
          }
        };
      }
      valid = true;
      messages = {};
      if ((_ref = translation.alias) == null) {
        translation.alias = "default";
      }
      if (translation.alias == null) {
        return {
          valid: false,
          messages: {
            translation_invalid: true
          }
        };
      }
      if (this.translations[translation.alias] == null) {
        translation.alias = "default";
        messages.translation_unknown = true;
      }
      _ref2 = this.validate_start_ref(translation.alias, start, valid, messages), valid = _ref2[0], messages = _ref2[1];
      if (end) {
        _ref3 = this.validate_end_ref(translation.alias, start, end, valid, messages), valid = _ref3[0], messages = _ref3[1];
      }
      return {
        valid: valid,
        messages: messages
      };
    };
    bcv_passage.prototype.validate_start_ref = function(translation, start, valid, messages) {
      var _ref;
      if (this.translations[translation].order[start.b] != null) {
        if ((_ref = start.c) == null) {
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
        if (start.c > 0 && (this.translations[translation].chapters[start.b][start.c - 1] != null)) {
          if (start.v != null) {
            start.v = parseInt(start.v, 10);
            if (isNaN(start.v)) {
              valid = false;
              messages.start_verse_not_numeric = true;
            } else if (start.v === 0) {
              messages.start_verse_is_zero = 1;
              if (this.options.zero_verse_strategy === "error") {
                valid = false;
              } else if (this.options.zero_verse_strategy === "upgrade") {
                start.v = 1;
              }
            } else if (start.v > this.translations[translation].chapters[start.b][start.c - 1]) {
              valid = false;
              messages.start_verse_not_exist = this.translations[translation].chapters[start.b][start.c - 1];
            }
          }
        } else {
          valid = false;
          if (start.c !== 1 && this.translations[translation].chapters[start.b].length === 1) {
            messages.start_chapter_not_exist_in_single_chapter_book = 1;
          } else if (start.c > 0) {
            messages.start_chapter_not_exist = this.translations[translation].chapters[start.b].length;
          }
        }
      } else {
        valid = false;
        messages.start_book_not_exist = true;
      }
      return [valid, messages];
    };
    bcv_passage.prototype.validate_end_ref = function(translation, start, end, valid, messages) {
      var _ref, _ref2, _ref3;
      if (end.c != null) {
        end.c = parseInt(end.c, 10);
      }
      if (end.v != null) {
        end.v = parseInt(end.v, 10);
      }
      if ((end.c != null) && !(isNaN(end.c)) && end.c === 0) {
        messages.end_chapter_is_zero = 1;
        if (this.options.zero_chapter_strategy === "error") {
          valid = false;
        } else {
          end.c = 1;
        }
      }
      if (this.translations[translation].order[end.b] != null) {
        if ((this.translations[translation].order[start.b] != null) && this.translations[translation].order[start.b] > this.translations[translation].order[end.b]) {
          valid = false;
          messages.end_book_before_start = true;
        }
        if (start.b === end.b && (end.c != null) && !isNaN(end.c)) {
          if ((_ref = start.c) == null) {
            start.c = 1;
          }
          if (!isNaN(parseInt(start.c, 10)) && start.c > end.c) {
            valid = false;
            messages.end_chapter_before_start = true;
          } else if (start.c === end.c && (end.v != null) && !isNaN(end.v)) {
            if ((_ref2 = start.v) == null) {
              start.v = 1;
            }
            if (!isNaN(parseInt(start.v, 10)) && start.v > end.v) {
              valid = false;
              messages.end_verse_before_start = true;
            }
          }
        }
        if ((end.c != null) && !isNaN(end.c)) {
          if (!(this.translations[translation].chapters[end.b][end.c - 1] != null)) {
            if (this.translations[translation].chapters[end.b].length === 1) {
              messages.end_chapter_not_exist_in_single_chapter_book = 1;
            } else if (end.c > 0) {
              messages.end_chapter_not_exist = this.translations[translation].chapters[end.b].length;
            }
          }
        }
        if ((end.v != null) && !isNaN(end.v)) {
          if ((_ref3 = end.c) == null) {
            end.c = this.translations[translation].chapters[end.b].length;
          }
          if (end.v > this.translations[translation].chapters[end.b][end.c - 1]) {
            messages.end_verse_not_exist = this.translations[translation].chapters[end.b][end.c - 1];
          } else if (end.v === 0) {
            messages.end_verse_is_zero = 1;
            if (this.options.zero_verse_strategy === "error") {
              valid = false;
            } else if (this.options.zero_verse_strategy === "upgrade") {
              end.v = 1;
            }
          }
        }
      } else {
        valid = false;
        messages.end_book_not_exist = true;
      }
      if ((end.c != null) && isNaN(end.c)) {
        valid = false;
        messages.end_chapter_not_numeric = true;
      }
      if ((end.v != null) && isNaN(end.v)) {
        valid = false;
        messages.end_verse_not_numeric = true;
      }
      return [valid, messages];
    };
    return bcv_passage;
  })();
  bcv_parser.prototype.regexps.translations = /(?:ESV|HCSB|N?KJV|MSG|NASB?|T?NIV|NLT|NRSV)\b/gi;
  bcv_parser.prototype.translations = {
    aliases: {
      esv: {
        osis: "ESV",
        alias: "default"
      },
      hcsb: {
        osis: "HCSB",
        alias: "default"
      },
      kjv: {
        osis: "KJV",
        alias: "default"
      },
      msg: {
        osis: "MSG",
        alias: "default"
      },
      nas: {
        osis: "NASB",
        alias: "default"
      },
      nasb: {
        osis: "NASB",
        alias: "default"
      },
      niv: {
        osis: "NIV",
        alias: "default"
      },
      nkjv: {
        osis: "NKJV",
        alias: "default"
      },
      nlt: {
        osis: "NLT",
        alias: "default"
      },
      nrsv: {
        osis: "NRSV",
        alias: "default"
      },
      tniv: {
        osis: "TNIV",
        alias: "default"
      },
      "default": {
        osis: "",
        alias: "default"
      }
    },
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
        "Rev": 66
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
        "Tob": [22, 14, 17, 21, 22, 18, 17, 21, 6, 14, 18, 22, 18, 15],
        "Jdt": [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25],
        "GkEsth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 13, 12, 6, 18, 19, 16, 24],
        "Wis": [16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31, 19, 29, 21, 25, 22],
        "Sir": [30, 17, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 34, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
        "Bar": [22, 35, 38, 37, 9, 72],
        "PrAzar": [68],
        "Sus": [64],
        "Bel": [42],
        "SgThree": [39],
        "EpJer": [72],
        "1Macc": [63, 70, 59, 61, 68, 63, 50, 32, 73, 89, 74, 53, 53, 49, 41, 24],
        "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 39],
        "3Macc": [29, 33, 30, 21, 51, 41, 23],
        "4Macc": [35, 24, 21, 26, 38, 35, 23, 29, 32, 21, 27, 19, 27, 20, 32, 25, 24, 24],
        "1Esd": [58, 30, 24, 63, 73, 34, 15, 96, 55],
        "2Esd": [40, 48, 36, 52, 56, 59, 70, 63, 47, 59, 46, 51, 58, 48, 63, 78],
        "PrMan": [15],
        "Ps151": [7]
      }
    },
    apocrypha: {
      order: {
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
      }
    }
  };
  bcv_parser.prototype.regexps.escaped_passage = /(?:^|[^\w\x1f\x1e])((?:(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:[\u2013\u2014\-]|through|thru|to)\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:\d+(?:th|nd|st)\s*ch(?:apter|a?pt\.?|a?p?\.?)?\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*))?\x1f(\d+)(?:\/[a-z])?\x1f(?:c(?:f|ompare|h(?:apters?|a?pts?|a?p?s?))|a(?:nd|lso)|\/p\x1f|[\d.:,;\x1e\x1f&\(\)\[\]\/"'\*=~\-\u2013\u2014\s\u00a0]|[a-e](?!\w)|ff?\b|see|title(?![a-z])|thr(?:ough|u)|to|v(?:erses?|er|ss?|v)?|$)+)/gi;
  bcv_parser.prototype.regexps.match_end_split = /\d+\W*title|\d+\W*ff?(?:[\s\u00a0*]*\.)?|\d+[\s\u00a0*]*[a-e](?!\w)|\x1e(?:[\s\u00a0*]*[)\]])?|[\d\x1f]+/gi;
  bcv_parser.prototype.regexps.space = "[\\s\\u00a0]";
  bcv_parser.prototype.regexps.control = /[\x1e\x1f]/g;
  bcv_parser.prototype.regexps.first = "(?:1st|1|I|First)\\.?" + bcv_parser.prototype.regexps.space + "*";
  bcv_parser.prototype.regexps.second = "(?:2nd|2|II|Second)\\.?" + bcv_parser.prototype.regexps.space + "*";
  bcv_parser.prototype.regexps.third = "(?:3rd|3|III|Third)\\.?" + bcv_parser.prototype.regexps.space + "*";
  bcv_parser.prototype.regexps.gospel = "(?:(?:The[.\\s\\u00a0-]*)?Gospel[.\\s\\u00a0-]?(?:of[.\\s\\u00a0-]*|according[\\s\\u00a0-]*?to[.\\s\\u00a0-]*)(?:[.\\s\\u00a0-]*?(?:Saint|St)[.\\s\\u00a0-]*)?|(?:(?:Saint|St)[.\\s\\u00a0-]*))?";
  bcv_parser.prototype.regexps.range_and = "(?:[&\u2013\u2014-]|and|through|to)";
  bcv_parser.prototype.regexps.range_only = "(?:[\u2013\u2014-]|through|to)";
  bcv_parser.prototype.regexps.books = [
    {
      osis: ["Gen"],
      regexp: /(\d|\b)(Ge(?:nn?[ei][ei]?s[eiu]s|nn?[es]is|nes[ei]|n)|G[en])(?:\b|(?=\d))/gi
    }, {
      osis: ["Exod"],
      regexp: /(\d|\b)(Ex(?:od[ui]s|od[se]|od|[do]?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Lev"],
      regexp: /(\d|\b)(L(?:[ei]v[ei]t[ei]?cus|evi|ev|[ev]))(?:\b|(?=\d))/gi
    }, {
      osis: ["Num"],
      regexp: /(\d|\b)(N(?:umbers?|umb?|[um]))(?:\b|(?=\d))/gi
    }, {
      osis: ["Deut"],
      regexp: /(\d|\b)(D(?:eut[eo]?rono?my|ueteronomy|eut?|uet|t))(?:\b|(?=\d))/gi
    }, {
      osis: ["Josh"],
      regexp: /(\d|\b)(J(?:ou?sh?ua|o?sh|os))(?:\b|(?=\d))/gi
    }, {
      osis: ["Judg"],
      regexp: /(\d|\b)(J(?:udges|udg|d?gs?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Ruth"],
      regexp: /(\d|\b)(R(?:uth?|th|u))(?:\b|(?=\d))/gi
    }, {
      osis: ["Isa"],
      regexp: /(\d|\b)(I(?:saiah|sais?ha?|s[ai]{2,}ha?|s[is]ah|sa[hi]?|sa?|a))(?:\b|(?=\d))/gi
    }, {
      osis: ["2Sam"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "(?:Samu[ae]l[ls]?|Sam|Sma|S[am]?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Sam"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?Samu[ae]l[ls]?|" + bcv_parser.prototype.regexps.first + "(?:Sam|Sma|S[am]?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["2Kgs"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "Ki?n?g?s?)(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Kgs"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?K(?:i?ngs|in|gs)|" + bcv_parser.prototype.regexps.first + "Ki?n?g?s?)(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["2Chr"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "C(?:h?o?ron[io]cles?|hronicals|hro?n?|ron)|2" + bcv_parser.prototype.regexps.space + "*Ch)(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Chr"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?C(?:h?o?ron[io]cles?|hronicals)|" + bcv_parser.prototype.regexps.first + "C(?:hro?n?|ron)|1" + bcv_parser.prototype.regexps.space + "*Ch)(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Ezra"],
      regexp: /(\d|\b)(E(?:zra?|sra))(?:\b|(?=\d))/gi
    }, {
      osis: ["Neh"],
      regexp: /(\d|\b)(N(?:eh[ei]m[ai]{1,3}h|eh?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Esth"],
      regexp: /(\d|\b)(E(?:sth?er|sth?|s))(?:\b|(?=\d))/gi
    }, {
      osis: ["Job"],
      regexp: /(\d|\b)(Jo?b)(?:\b|(?=\d))/gi
    }, {
      osis: ["Ps"],
      extra: "p",
      regexp: RegExp("(\\b)((?:(?:(?:1[02-5]|[2-9])?(?:1" + bcv_parser.prototype.regexps.space + "*st|2" + bcv_parser.prototype.regexps.space + "*nd|3" + bcv_parser.prototype.regexps.space + "*rd))|1?1[123]" + bcv_parser.prototype.regexps.space + "*th|(?:150|1[0-4][04-9]|[1-9][04-9]|[4-9])" + bcv_parser.prototype.regexps.space + "*th)" + bcv_parser.prototype.regexps.space + "*Psalm)\\b", "gi")
    }, {
      osis: ["Ps"],
      regexp: /(\d|\b)(P(?:s[alm]{2,4}s?|a[slm]{3,4}s?|l[sam]{2,4}s?|s[as]?m?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Prov"],
      regexp: /(\d|\b)(P(?:r[eo]?verbs?|robv?erbs|or?verbs|rovebs|ro?v?|rvbs?|v)|Oroverbs)(?:\b|(?=\d))/gi
    }, {
      osis: ["Eccl"],
      regexp: /(\d|\b)(E(?:cc?less?[ia]{1,4}s?tes?|cclesiastic?es|ccles|ccl?|cl?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Song"],
      regexp: RegExp("(\\d|\\b)((?:The" + bcv_parser.prototype.regexps.space + "*)?Songs?" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*(?:S[ao]lom[ao]ns?|Songs?)|(?:S(?:n?gs?|ongs?|" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*S|o?S|o[ln]?)))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Jer"],
      regexp: /(\d|\b)(Jer(?:emaiah|[ae]maih|[ae]miha|[aei]mi[ai]h|[ei]mi?ah|[ai]mih|[ae]mia|[am][im]ah|emi[he]?|e?)|J[er])(?:\b|(?=\d))/gi
    }, {
      osis: ["Lam"],
      regexp: /(\d|\b)(L(?:am[ei]ntations?|am?|m))(?:\b|(?=\d))/gi
    }, {
      osis: ["Ezek"],
      regexp: /(\d|\b)(E(?:[zx][ei]{1,2}ki?el|zekial|zek|z[ek]))(?:\b|(?=\d))/gi
    }, {
      osis: ["Dan"],
      regexp: /(\d|\b)(D(?:aniel|a?n|[al]))(?:\b|(?=\d))/gi
    }, {
      osis: ["Hos"],
      regexp: /(\d|\b)(H(?:osea|o?s|os?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Joel"],
      regexp: /(\d|\b)(J(?:oel?|l))(?:\b|(?=\d))/gi
    }, {
      osis: ["Amos"],
      regexp: /(\d|\b)(Amo?s?)(?:\b|(?=\d))/gi
    }, {
      osis: ["Obad"],
      regexp: /(\d|\b)(O(?:badiah?|bidah|ba?d?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Jonah"],
      regexp: /(\d|\b)(J(?:onah|on|nh))(?:\b|(?=\d))/gi
    }, {
      osis: ["Mic"],
      regexp: /(\d|\b)(M(?:ich?ah?|ic?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Nah"],
      regexp: /(\d|\b)(N(?:ahum?|ah?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Hab"],
      regexp: /(\d|\b)(H(?:abb?akk?[au]kk?|abk?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Zeph"],
      regexp: /(\d|\b)(Z(?:ephana?iah?|e?ph?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Hag"],
      regexp: /(\d|\b)(H(?:agg?ai|aggia[ih]|a?gg?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Zech"],
      regexp: /(\d|\b)(Z(?:[ae]ch[ae]r[ai]{1,2}h|ach?|e?ch?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Mal"],
      regexp: /(\d|\b)(M(?:alachi?|alichi|alaci|al))(?:\b|(?=\d))/gi
    }, {
      osis: ["Matt"],
      regexp: RegExp("(\\d|\\b)(" + bcv_parser.prototype.regexps.gospel + "M(?:at[th]{1,3}i?ew|atthwe|a?tt?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Mark"],
      regexp: RegExp("(\\d|\\b)(" + bcv_parser.prototype.regexps.gospel + "M(?:a?rk?|k))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Luke"],
      regexp: RegExp("(\\d|\\b)(" + bcv_parser.prototype.regexps.gospel + "L(?:uke?|[uk]))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1John"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.first + "J(?:o?phn|[ho][ho]n|onh|ohm|hn|o[hn]?|[hn]))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["2John"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "J(?:o?phn|[ho][ho]n|onh|ohm|hn|o[hn]?|[hn]))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["3John"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.third + "J(?:o?phn|[ho][ho]n|onh|ohm|hn|o[hn]?|[hn]))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["John"],
      regexp: RegExp("([04-9]|\\b)(" + bcv_parser.prototype.regexps.gospel + "J(?:o?phn|[ho][ho]n|onh|ohm|hn|oh|[hn]))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Acts"],
      regexp: RegExp("(\\d|\\b)(A(?:cts" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*the" + bcv_parser.prototype.regexps.space + "*Apostles|cts*|ct?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Rom"],
      regexp: /(\d|\b)(R(?:omans?|pmans|oamns|omands|omasn|om?s?|ms?))(?:\b|(?=\d))/gi
    }, {
      osis: ["2Cor"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "C(?:h?orr?[in]{1,3}th[aio]{1,3}ns|orin[ai]?th[ai]{1,3}n[aio]{0,3}s|orinti[ao]ns|orinthian|orthians?|orint?h?|orth|or?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Cor"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?C(?:h?orr?[in]{1,3}th[aio]{1,3}ns|orin[ai]?th[ai]{1,3}n[aio]{0,3}s|orinti[ao]ns)|" + bcv_parser.prototype.regexps.first + "C(?:orinthian|orthians?|orint?h?|orth|or?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Gal"],
      regexp: /(\d|\b)(G(?:alatians?|all?at[aino]{1,4}s|alat?|al?|l))(?:\b|(?=\d))/gi
    }, {
      osis: ["Eph"],
      regexp: /(\d|\b)(E(?:phesians?|phi?sians?|phesains?|sphesians|pehesians|h?pesians|phesiand|phesions|alat?|phe?s?|ph?|hp))(?:\b|(?=\d))/gi
    }, {
      osis: ["Phil"],
      regexp: /(\d|\b)(P(?:hil{1,}i?p{1,}[aei]{1,3}ns?|hi?li?p{0,2}|hil?|hp))(?:\b|(?=\d))/gi
    }, {
      osis: ["Col"],
      regexp: /(\d|\b)(C(?:[ao]ll?[ao]ss?i[ao]ns|olossi?ans?|ol?))(?:\b|(?=\d))/gi
    }, {
      osis: ["2Thess"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "T(?:hess?[aeo]lon[ieaoc]{1,4}ns?|he?s{1,3}|h))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Thess"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?Thess?[aeo]lon[ieaoc]{1,4}ns?|" + bcv_parser.prototype.regexps.first + "T(?:he?s{1,3}|h))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["2Tim"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "T(?:imothy?|himoth?y|omothy|imoty|im?|m))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Tim"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?Timothy?|" + bcv_parser.prototype.regexps.first + "T(?:himoth?y|omothy|imoty|im?|m))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Titus"],
      regexp: /(\d|\b)(T(?:itus|it?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Phlm"],
      regexp: /(\d|\b)(Ph(?:ilemon|l?mn?|ilem?))(?:\b|(?=\d))/gi
    }, {
      osis: ["Heb"],
      regexp: /(\d|\b)(H(?:eb[rew]{1,3}s|[ew]{0,2}brew{1,2}s|ebrew|eb))(?:\b|(?=\d))/gi
    }, {
      osis: ["Jas"],
      regexp: /(\d|\b)(J(?:ames?|a[ms]?|ms?))(?:\b|(?=\d))/gi
    }, {
      osis: ["2Pet"],
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "P(?:eter?|e?t?r?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["1Pet"],
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?Peter|" + bcv_parser.prototype.regexps.first + "P(?:eter?|e?t?r?))(?:\\b|(?=\\d))", "gi")
    }, {
      osis: ["Jude"],
      regexp: /(\d|\b)(Ju?de)(?:\b|(?=\d))/gi
    }, {
      osis: ["Rev"],
      regexp: /(\d|\b)(R(?:ev[aeo]?lations?|evel|e?v|e))(?:\b|(?=\d))/gi
    }, {
      osis: ["Ezek", "Ezra"],
      regexp: /(\d|\b)(Ez)(?:\b|(?=\d))/gi
    }, {
      osis: ["Hab", "Hag"],
      regexp: /(\d|\b)(Ha)(?:\b|(?=\d))/gi
    }, {
      osis: ["Heb", "Hab"],
      regexp: /(\d|\b)(Hb)(?:\b|(?=\d))/gi
    }, {
      osis: ["John", "Jonah", "Job", "Joel"],
      regexp: /(\d|\b)(Jo)(?:\b|(?=\d))/gi
    }, {
      osis: ["Jude", "Judg"],
      regexp: /(\d|\b)(Jd)(?:\b|(?=\d))/gi
    }, {
      osis: ["Jude", "Judg"],
      regexp: /(\d|\b)(Jud)(?:\b|(?=\d))/gi
    }, {
      osis: ["Jude", "Judg"],
      regexp: /(\d|\b)(Ju)(?:\b|(?=\d))/gi
    }, {
      osis: ["Matt", "Mark", "Mal"],
      regexp: /(\d|\b)(Ma)(?:\b|(?=\d))/gi
    }, {
      osis: ["Phil", "Phlm"],
      regexp: /(\d|\b)(Ph)(?:\b|(?=\d))/gi
    }, {
      osis: ["Zeph", "Zech"],
      regexp: /(\d|\b)(Ze)(?:\b|(?=\d))/gi
    }
  ];
  bcv_parser.prototype.regexps.apocrypha = [
    {
      osis: ["Tob"],
      apocrypha: true,
      regexp: /(\d|\b)(Tobi?t?)(?:\b|(?=d))/gi
    }, {
      osis: ["Jdt"],
      apocrypha: true,
      regexp: /(\d|\b)(Ju?di?th?)(?:\b|(?=d))/gi
    }, {
      osis: ["GkEsth"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)(Greek" + bcv_parser.prototype.regexps.space + "*Esther|Esther" + bcv_parser.prototype.regexps.space + "*\\(Greek\\)|G(?:ree)?k" + bcv_parser.prototype.regexps.space + "*Esth?)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["Wis"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)((?:The" + bcv_parser.prototype.regexps.space + "*)Wisd?(?:om)?" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*Solomon|Wisdom|Wisd?)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["Sir"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)(Sirach|Sir|Eccl[eu]siasticus|Ecclus|Eccs|(?:The" + bcv_parser.prototype.regexps.space + "*)Wisdom" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*Jesus" + bcv_parser.prototype.regexps.space + "*(?:Son" + bcv_parser.prototype.regexps.space + "*of|ben)" + bcv_parser.prototype.regexps.space + "*Sirach)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["Bar"],
      apocrypha: true,
      regexp: /(\d|\b)(Baruch|Bar)(?:\b|(?=d))/gi
    }, {
      osis: ["PrAzar"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)((?:The" + bcv_parser.prototype.regexps.space + "*)?Pr(?:ayers?)?" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*Azariah?|Azariah?|PrAza?r)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["Sus"],
      apocrypha: true,
      regexp: /(\d|\b)(Susannah?|Shoshana|Sus)(?:\b|(?=d))/gi
    }, {
      osis: ["Bel"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)(Bel" + bcv_parser.prototype.regexps.space + "*(?:and|&)" + bcv_parser.prototype.regexps.space + "*(?:the" + bcv_parser.prototype.regexps.space + "*)?(?:Dragon|Serpent|Snake)|Bel)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["SgThree"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)((?:The" + bcv_parser.prototype.regexps.space + "*)?Song" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*(?:the" + bcv_parser.prototype.regexps.space + "*)?(?:3|Three)" + bcv_parser.prototype.regexps.space + "*(?:Holy" + bcv_parser.prototype.regexps.space + "*Children|Young" + bcv_parser.prototype.regexps.space + "*Men|Youths|Jews)|S\\.?" + bcv_parser.prototype.regexps.space + "*(?:of)?" + bcv_parser.prototype.regexps.space + "*(?:Three|Th|3)\\.?" + bcv_parser.prototype.regexps.space + "*(?:Ch|Y)|So?n?gThree)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["EpJer"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)((?:The" + bcv_parser.prototype.regexps.space + "*)?(?:Ep(?:istle)?|Let(?:ter))\\.?" + bcv_parser.prototype.regexps.space + "*of" + bcv_parser.prototype.regexps.space + "*Jeremiah|EpJer)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["1Macc"],
      apocrypha: true,
      regexp: RegExp("(\\b)((?:" + bcv_parser.prototype.regexps.first + ")?Mac{1,3}ab{1,3}e{1,3}s?|" + bcv_parser.prototype.regexps.first + "Mac{1,3}|1" + bcv_parser.prototype.regexps.space + "*Mc)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["2Macc"],
      apocrypha: true,
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "Mac{1,3}(?:ab{1,3}e{1,3}s?)?|2" + bcv_parser.prototype.regexps.space + "*Mc)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["3Macc"],
      apocrypha: true,
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.third + "Mac{1,3}(?:ab{1,3}e{1,3}s?)?|3" + bcv_parser.prototype.regexps.space + "*Mc)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["4Macc"],
      apocrypha: true,
      regexp: RegExp("(\\b)((?:4th|4|IV|Fourth)\\.?" + bcv_parser.prototype.regexps.space + "*Mac{1,3}(?:ab{1,3}e{1,3}s?)?|4" + bcv_parser.prototype.regexps.space + "*Mc)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["1Esd"],
      apocrypha: true,
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.first + "Esdras|1" + bcv_parser.prototype.regexps.space + "*Esdr?)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["2Esd"],
      apocrypha: true,
      regexp: RegExp("(\\b)(" + bcv_parser.prototype.regexps.second + "Esdras|2" + bcv_parser.prototype.regexps.space + "*Esdr?)(?:\\b|(?=d))", "gi")
    }, {
      osis: ["PrMan"],
      apocrypha: true,
      regexp: RegExp("(\\d|\\b)((?:(?:The" + bcv_parser.prototype.regexps.space + "*)Pr(?:ayers?)?" + bcv_parser.prototype.regexps.space + "*(?:of" + bcv_parser.prototype.regexps.space + "*)?M[ae]n{1,2}[ae]s{1,2}[ae]h)|PrMan)(?:\\b|(?=d))", "gi")
    }
  ];
var grammar = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "abbrev": parse_abbrev,
        "any_integer": parse_any_integer,
        "b": parse_b,
        "b_range": parse_b_range,
        "bc": parse_bc,
        "bc_comma": parse_bc_comma,
        "bc_title": parse_bc_title,
        "bcv": parse_bcv,
        "bcv_comma": parse_bcv_comma,
        "bcv_hyphen_range": parse_bcv_hyphen_range,
        "bcv_weak": parse_bcv_weak,
        "bv": parse_bv,
        "c": parse_c,
        "c_explicit": parse_c_explicit,
        "c_psalm": parse_c_psalm,
        "c_title": parse_c_title,
        "cb": parse_cb,
        "cb_ordinal": parse_cb_ordinal,
        "cb_range": parse_cb_range,
        "cbv": parse_cbv,
        "cbv_ordinal": parse_cbv_ordinal,
        "cv": parse_cv,
        "cv_psalm": parse_cv_psalm,
        "cv_sep": parse_cv_sep,
        "cv_sep_weak": parse_cv_sep_weak,
        "cv_weak": parse_cv_weak,
        "ff": parse_ff,
        "in_book_of": parse_in_book_of,
        "integer": parse_integer,
        "integer_title": parse_integer_title,
        "range": parse_range,
        "range_sep": parse_range_sep,
        "sequence": parse_sequence,
        "sequence_sep": parse_sequence_sep,
        "sp": parse_sp,
        "space": parse_space,
        "start": parse_start,
        "title": parse_title,
        "translation": parse_translation,
        "translation_sequence": parse_translation_sequence,
        "translation_sequence_enclosed": parse_translation_sequence_enclosed,
        "v": parse_v,
        "v_explicit": parse_v_explicit,
        "v_letter": parse_v_letter,
        "word": parse_word
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var cacheKey = 'start@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result32 = parse_bcv_hyphen_range();
        if (result32 !== null) {
          var result1 = result32;
        } else {
          var result31 = parse_sequence();
          if (result31 !== null) {
            var result1 = result31;
          } else {
            var result30 = parse_cb_range();
            if (result30 !== null) {
              var result1 = result30;
            } else {
              var result29 = parse_range();
              if (result29 !== null) {
                var result1 = result29;
              } else {
                var result28 = parse_ff();
                if (result28 !== null) {
                  var result1 = result28;
                } else {
                  var result27 = parse_bcv_comma();
                  if (result27 !== null) {
                    var result1 = result27;
                  } else {
                    var result26 = parse_bc_title();
                    if (result26 !== null) {
                      var result1 = result26;
                    } else {
                      var result25 = parse_bcv();
                      if (result25 !== null) {
                        var result1 = result25;
                      } else {
                        var result24 = parse_bcv_weak();
                        if (result24 !== null) {
                          var result1 = result24;
                        } else {
                          var result23 = parse_bc();
                          if (result23 !== null) {
                            var result1 = result23;
                          } else {
                            var result22 = parse_cv_psalm();
                            if (result22 !== null) {
                              var result1 = result22;
                            } else {
                              var result21 = parse_bv();
                              if (result21 !== null) {
                                var result1 = result21;
                              } else {
                                var result20 = parse_b_range();
                                if (result20 !== null) {
                                  var result1 = result20;
                                } else {
                                  var result19 = parse_c_psalm();
                                  if (result19 !== null) {
                                    var result1 = result19;
                                  } else {
                                    var result18 = parse_b();
                                    if (result18 !== null) {
                                      var result1 = result18;
                                    } else {
                                      var result17 = parse_cbv();
                                      if (result17 !== null) {
                                        var result1 = result17;
                                      } else {
                                        var result16 = parse_cbv_ordinal();
                                        if (result16 !== null) {
                                          var result1 = result16;
                                        } else {
                                          var result15 = parse_cb();
                                          if (result15 !== null) {
                                            var result1 = result15;
                                          } else {
                                            var result14 = parse_cb_ordinal();
                                            if (result14 !== null) {
                                              var result1 = result14;
                                            } else {
                                              var result13 = parse_translation_sequence_enclosed();
                                              if (result13 !== null) {
                                                var result1 = result13;
                                              } else {
                                                var result12 = parse_translation_sequence();
                                                if (result12 !== null) {
                                                  var result1 = result12;
                                                } else {
                                                  var result11 = parse_sequence_sep();
                                                  if (result11 !== null) {
                                                    var result1 = result11;
                                                  } else {
                                                    var result10 = parse_c_title();
                                                    if (result10 !== null) {
                                                      var result1 = result10;
                                                    } else {
                                                      var result9 = parse_integer_title();
                                                      if (result9 !== null) {
                                                        var result1 = result9;
                                                      } else {
                                                        var result8 = parse_cv();
                                                        if (result8 !== null) {
                                                          var result1 = result8;
                                                        } else {
                                                          var result7 = parse_cv_weak();
                                                          if (result7 !== null) {
                                                            var result1 = result7;
                                                          } else {
                                                            var result6 = parse_v_letter();
                                                            if (result6 !== null) {
                                                              var result1 = result6;
                                                            } else {
                                                              var result5 = parse_integer();
                                                              if (result5 !== null) {
                                                                var result1 = result5;
                                                              } else {
                                                                var result4 = parse_c();
                                                                if (result4 !== null) {
                                                                  var result1 = result4;
                                                                } else {
                                                                  var result3 = parse_v();
                                                                  if (result3 !== null) {
                                                                    var result1 = result3;
                                                                  } else {
                                                                    var result2 = parse_word();
                                                                    if (result2 !== null) {
                                                                      var result1 = result2;
                                                                    } else {
                                                                      var result1 = null;;
                                                                    };
                                                                  };
                                                                };
                                                              };
                                                            };
                                                          };
                                                        };
                                                      };
                                                    };
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }
        if (result1 !== null) {
          var result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            var result32 = parse_bcv_hyphen_range();
            if (result32 !== null) {
              var result1 = result32;
            } else {
              var result31 = parse_sequence();
              if (result31 !== null) {
                var result1 = result31;
              } else {
                var result30 = parse_cb_range();
                if (result30 !== null) {
                  var result1 = result30;
                } else {
                  var result29 = parse_range();
                  if (result29 !== null) {
                    var result1 = result29;
                  } else {
                    var result28 = parse_ff();
                    if (result28 !== null) {
                      var result1 = result28;
                    } else {
                      var result27 = parse_bcv_comma();
                      if (result27 !== null) {
                        var result1 = result27;
                      } else {
                        var result26 = parse_bc_title();
                        if (result26 !== null) {
                          var result1 = result26;
                        } else {
                          var result25 = parse_bcv();
                          if (result25 !== null) {
                            var result1 = result25;
                          } else {
                            var result24 = parse_bcv_weak();
                            if (result24 !== null) {
                              var result1 = result24;
                            } else {
                              var result23 = parse_bc();
                              if (result23 !== null) {
                                var result1 = result23;
                              } else {
                                var result22 = parse_cv_psalm();
                                if (result22 !== null) {
                                  var result1 = result22;
                                } else {
                                  var result21 = parse_bv();
                                  if (result21 !== null) {
                                    var result1 = result21;
                                  } else {
                                    var result20 = parse_b_range();
                                    if (result20 !== null) {
                                      var result1 = result20;
                                    } else {
                                      var result19 = parse_c_psalm();
                                      if (result19 !== null) {
                                        var result1 = result19;
                                      } else {
                                        var result18 = parse_b();
                                        if (result18 !== null) {
                                          var result1 = result18;
                                        } else {
                                          var result17 = parse_cbv();
                                          if (result17 !== null) {
                                            var result1 = result17;
                                          } else {
                                            var result16 = parse_cbv_ordinal();
                                            if (result16 !== null) {
                                              var result1 = result16;
                                            } else {
                                              var result15 = parse_cb();
                                              if (result15 !== null) {
                                                var result1 = result15;
                                              } else {
                                                var result14 = parse_cb_ordinal();
                                                if (result14 !== null) {
                                                  var result1 = result14;
                                                } else {
                                                  var result13 = parse_translation_sequence_enclosed();
                                                  if (result13 !== null) {
                                                    var result1 = result13;
                                                  } else {
                                                    var result12 = parse_translation_sequence();
                                                    if (result12 !== null) {
                                                      var result1 = result12;
                                                    } else {
                                                      var result11 = parse_sequence_sep();
                                                      if (result11 !== null) {
                                                        var result1 = result11;
                                                      } else {
                                                        var result10 = parse_c_title();
                                                        if (result10 !== null) {
                                                          var result1 = result10;
                                                        } else {
                                                          var result9 = parse_integer_title();
                                                          if (result9 !== null) {
                                                            var result1 = result9;
                                                          } else {
                                                            var result8 = parse_cv();
                                                            if (result8 !== null) {
                                                              var result1 = result8;
                                                            } else {
                                                              var result7 = parse_cv_weak();
                                                              if (result7 !== null) {
                                                                var result1 = result7;
                                                              } else {
                                                                var result6 = parse_v_letter();
                                                                if (result6 !== null) {
                                                                  var result1 = result6;
                                                                } else {
                                                                  var result5 = parse_integer();
                                                                  if (result5 !== null) {
                                                                    var result1 = result5;
                                                                  } else {
                                                                    var result4 = parse_c();
                                                                    if (result4 !== null) {
                                                                      var result1 = result4;
                                                                    } else {
                                                                      var result3 = parse_v();
                                                                      if (result3 !== null) {
                                                                        var result1 = result3;
                                                                      } else {
                                                                        var result2 = parse_word();
                                                                        if (result2 !== null) {
                                                                          var result1 = result2;
                                                                        } else {
                                                                          var result1 = null;;
                                                                        };
                                                                      };
                                                                    };
                                                                  };
                                                                };
                                                              };
                                                            };
                                                          };
                                                        };
                                                      };
                                                    };
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            }
          }
        } else {
          var result0 = null;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_sequence() {
        var cacheKey = 'sequence@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["sequence"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result54 = parse_cb_range();
          if (result54 !== null) {
            var result4 = result54;
          } else {
            var result53 = parse_bcv_hyphen_range();
            if (result53 !== null) {
              var result4 = result53;
            } else {
              var result52 = parse_range();
              if (result52 !== null) {
                var result4 = result52;
              } else {
                var result51 = parse_ff();
                if (result51 !== null) {
                  var result4 = result51;
                } else {
                  var result50 = parse_bcv_comma();
                  if (result50 !== null) {
                    var result4 = result50;
                  } else {
                    var result49 = parse_bc_title();
                    if (result49 !== null) {
                      var result4 = result49;
                    } else {
                      var result48 = parse_bcv();
                      if (result48 !== null) {
                        var result4 = result48;
                      } else {
                        var result47 = parse_bcv_weak();
                        if (result47 !== null) {
                          var result4 = result47;
                        } else {
                          var result46 = parse_bc();
                          if (result46 !== null) {
                            var result4 = result46;
                          } else {
                            var result45 = parse_cv_psalm();
                            if (result45 !== null) {
                              var result4 = result45;
                            } else {
                              var result44 = parse_bv();
                              if (result44 !== null) {
                                var result4 = result44;
                              } else {
                                var result43 = parse_b_range();
                                if (result43 !== null) {
                                  var result4 = result43;
                                } else {
                                  var result42 = parse_c_psalm();
                                  if (result42 !== null) {
                                    var result4 = result42;
                                  } else {
                                    var result41 = parse_b();
                                    if (result41 !== null) {
                                      var result4 = result41;
                                    } else {
                                      var result40 = parse_cbv();
                                      if (result40 !== null) {
                                        var result4 = result40;
                                      } else {
                                        var result39 = parse_cbv_ordinal();
                                        if (result39 !== null) {
                                          var result4 = result39;
                                        } else {
                                          var result38 = parse_cb();
                                          if (result38 !== null) {
                                            var result4 = result38;
                                          } else {
                                            var result37 = parse_cb_ordinal();
                                            if (result37 !== null) {
                                              var result4 = result37;
                                            } else {
                                              var result4 = null;;
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          }
          if (result4 !== null) {
            var savedPos2 = pos;
            var result36 = parse_sequence_sep();
            if (result36 !== null) {
              var result7 = result36;
            } else {
              if (input.substr(pos, 0) === "") {
                var result35 = "";
                pos += 0;
              } else {
                var result35 = null;
                if (reportMatchFailures) {
                  matchFailed("\"\"");
                }
              }
              if (result35 !== null) {
                var result7 = result35;
              } else {
                var result7 = null;;
              };
            }
            if (result7 !== null) {
              var result34 = parse_cb_range();
              if (result34 !== null) {
                var result8 = result34;
              } else {
                var result33 = parse_bcv_hyphen_range();
                if (result33 !== null) {
                  var result8 = result33;
                } else {
                  var result32 = parse_range();
                  if (result32 !== null) {
                    var result8 = result32;
                  } else {
                    var result31 = parse_ff();
                    if (result31 !== null) {
                      var result8 = result31;
                    } else {
                      var result30 = parse_bcv_comma();
                      if (result30 !== null) {
                        var result8 = result30;
                      } else {
                        var result29 = parse_bc_title();
                        if (result29 !== null) {
                          var result8 = result29;
                        } else {
                          var result28 = parse_bcv();
                          if (result28 !== null) {
                            var result8 = result28;
                          } else {
                            var result27 = parse_bcv_weak();
                            if (result27 !== null) {
                              var result8 = result27;
                            } else {
                              var result26 = parse_bc();
                              if (result26 !== null) {
                                var result8 = result26;
                              } else {
                                var result25 = parse_cv_psalm();
                                if (result25 !== null) {
                                  var result8 = result25;
                                } else {
                                  var result24 = parse_bv();
                                  if (result24 !== null) {
                                    var result8 = result24;
                                  } else {
                                    var result23 = parse_b_range();
                                    if (result23 !== null) {
                                      var result8 = result23;
                                    } else {
                                      var result22 = parse_c_psalm();
                                      if (result22 !== null) {
                                        var result8 = result22;
                                      } else {
                                        var result21 = parse_b();
                                        if (result21 !== null) {
                                          var result8 = result21;
                                        } else {
                                          var result20 = parse_cbv();
                                          if (result20 !== null) {
                                            var result8 = result20;
                                          } else {
                                            var result19 = parse_cbv_ordinal();
                                            if (result19 !== null) {
                                              var result8 = result19;
                                            } else {
                                              var result18 = parse_cb();
                                              if (result18 !== null) {
                                                var result8 = result18;
                                              } else {
                                                var result17 = parse_cb_ordinal();
                                                if (result17 !== null) {
                                                  var result8 = result17;
                                                } else {
                                                  var result16 = parse_c_title();
                                                  if (result16 !== null) {
                                                    var result8 = result16;
                                                  } else {
                                                    var result15 = parse_integer_title();
                                                    if (result15 !== null) {
                                                      var result8 = result15;
                                                    } else {
                                                      var result14 = parse_cv();
                                                      if (result14 !== null) {
                                                        var result8 = result14;
                                                      } else {
                                                        var result13 = parse_cv_weak();
                                                        if (result13 !== null) {
                                                          var result8 = result13;
                                                        } else {
                                                          var result12 = parse_v_letter();
                                                          if (result12 !== null) {
                                                            var result8 = result12;
                                                          } else {
                                                            var result11 = parse_integer();
                                                            if (result11 !== null) {
                                                              var result8 = result11;
                                                            } else {
                                                              var result10 = parse_c();
                                                              if (result10 !== null) {
                                                                var result8 = result10;
                                                              } else {
                                                                var result9 = parse_v();
                                                                if (result9 !== null) {
                                                                  var result8 = result9;
                                                                } else {
                                                                  var result8 = null;;
                                                                };
                                                              };
                                                            };
                                                          };
                                                        };
                                                      };
                                                    };
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              }
              if (result8 !== null) {
                var result6 = [result7, result8];
              } else {
                var result6 = null;
                pos = savedPos2;
              }
            } else {
              var result6 = null;
              pos = savedPos2;
            }
            if (result6 !== null) {
              var result5 = [];
              while (result6 !== null) {
                result5.push(result6);
                var savedPos2 = pos;
                var result36 = parse_sequence_sep();
                if (result36 !== null) {
                  var result7 = result36;
                } else {
                  if (input.substr(pos, 0) === "") {
                    var result35 = "";
                    pos += 0;
                  } else {
                    var result35 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"\"");
                    }
                  }
                  if (result35 !== null) {
                    var result7 = result35;
                  } else {
                    var result7 = null;;
                  };
                }
                if (result7 !== null) {
                  var result34 = parse_cb_range();
                  if (result34 !== null) {
                    var result8 = result34;
                  } else {
                    var result33 = parse_bcv_hyphen_range();
                    if (result33 !== null) {
                      var result8 = result33;
                    } else {
                      var result32 = parse_range();
                      if (result32 !== null) {
                        var result8 = result32;
                      } else {
                        var result31 = parse_ff();
                        if (result31 !== null) {
                          var result8 = result31;
                        } else {
                          var result30 = parse_bcv_comma();
                          if (result30 !== null) {
                            var result8 = result30;
                          } else {
                            var result29 = parse_bc_title();
                            if (result29 !== null) {
                              var result8 = result29;
                            } else {
                              var result28 = parse_bcv();
                              if (result28 !== null) {
                                var result8 = result28;
                              } else {
                                var result27 = parse_bcv_weak();
                                if (result27 !== null) {
                                  var result8 = result27;
                                } else {
                                  var result26 = parse_bc();
                                  if (result26 !== null) {
                                    var result8 = result26;
                                  } else {
                                    var result25 = parse_cv_psalm();
                                    if (result25 !== null) {
                                      var result8 = result25;
                                    } else {
                                      var result24 = parse_bv();
                                      if (result24 !== null) {
                                        var result8 = result24;
                                      } else {
                                        var result23 = parse_b_range();
                                        if (result23 !== null) {
                                          var result8 = result23;
                                        } else {
                                          var result22 = parse_c_psalm();
                                          if (result22 !== null) {
                                            var result8 = result22;
                                          } else {
                                            var result21 = parse_b();
                                            if (result21 !== null) {
                                              var result8 = result21;
                                            } else {
                                              var result20 = parse_cbv();
                                              if (result20 !== null) {
                                                var result8 = result20;
                                              } else {
                                                var result19 = parse_cbv_ordinal();
                                                if (result19 !== null) {
                                                  var result8 = result19;
                                                } else {
                                                  var result18 = parse_cb();
                                                  if (result18 !== null) {
                                                    var result8 = result18;
                                                  } else {
                                                    var result17 = parse_cb_ordinal();
                                                    if (result17 !== null) {
                                                      var result8 = result17;
                                                    } else {
                                                      var result16 = parse_c_title();
                                                      if (result16 !== null) {
                                                        var result8 = result16;
                                                      } else {
                                                        var result15 = parse_integer_title();
                                                        if (result15 !== null) {
                                                          var result8 = result15;
                                                        } else {
                                                          var result14 = parse_cv();
                                                          if (result14 !== null) {
                                                            var result8 = result14;
                                                          } else {
                                                            var result13 = parse_cv_weak();
                                                            if (result13 !== null) {
                                                              var result8 = result13;
                                                            } else {
                                                              var result12 = parse_v_letter();
                                                              if (result12 !== null) {
                                                                var result8 = result12;
                                                              } else {
                                                                var result11 = parse_integer();
                                                                if (result11 !== null) {
                                                                  var result8 = result11;
                                                                } else {
                                                                  var result10 = parse_c();
                                                                  if (result10 !== null) {
                                                                    var result8 = result10;
                                                                  } else {
                                                                    var result9 = parse_v();
                                                                    if (result9 !== null) {
                                                                      var result8 = result9;
                                                                    } else {
                                                                      var result8 = null;;
                                                                    };
                                                                  };
                                                                };
                                                              };
                                                            };
                                                          };
                                                        };
                                                      };
                                                    };
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  }
                  if (result8 !== null) {
                    var result6 = [result7, result8];
                  } else {
                    var result6 = null;
                    pos = savedPos2;
                  }
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
              }
            } else {
              var result5 = null;
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { val_2.unshift([val_1]); return {"type": "sequence", "value": val_2, "indices": [indices["sequence"], pos - 1]} })(result1[1], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_range() {
        var cacheKey = 'range@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["range"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result48 = parse_ff();
          if (result48 !== null) {
            var result4 = result48;
          } else {
            var result47 = parse_bcv_comma();
            if (result47 !== null) {
              var result4 = result47;
            } else {
              var result46 = parse_bc_title();
              if (result46 !== null) {
                var result4 = result46;
              } else {
                var result45 = parse_bcv();
                if (result45 !== null) {
                  var result4 = result45;
                } else {
                  var result44 = parse_bcv_weak();
                  if (result44 !== null) {
                    var result4 = result44;
                  } else {
                    var result43 = parse_bc();
                    if (result43 !== null) {
                      var result4 = result43;
                    } else {
                      var result42 = parse_cv_psalm();
                      if (result42 !== null) {
                        var result4 = result42;
                      } else {
                        var result41 = parse_bv();
                        if (result41 !== null) {
                          var result4 = result41;
                        } else {
                          var result40 = parse_cbv();
                          if (result40 !== null) {
                            var result4 = result40;
                          } else {
                            var result39 = parse_cbv_ordinal();
                            if (result39 !== null) {
                              var result4 = result39;
                            } else {
                              var result38 = parse_c_psalm();
                              if (result38 !== null) {
                                var result4 = result38;
                              } else {
                                var result37 = parse_cb();
                                if (result37 !== null) {
                                  var result4 = result37;
                                } else {
                                  var result36 = parse_cb_ordinal();
                                  if (result36 !== null) {
                                    var result4 = result36;
                                  } else {
                                    var result35 = parse_c_title();
                                    if (result35 !== null) {
                                      var result4 = result35;
                                    } else {
                                      var result34 = parse_integer_title();
                                      if (result34 !== null) {
                                        var result4 = result34;
                                      } else {
                                        var result33 = parse_cv();
                                        if (result33 !== null) {
                                          var result4 = result33;
                                        } else {
                                          var result32 = parse_cv_weak();
                                          if (result32 !== null) {
                                            var result4 = result32;
                                          } else {
                                            var result31 = parse_v_letter();
                                            if (result31 !== null) {
                                              var result4 = result31;
                                            } else {
                                              var result30 = parse_integer();
                                              if (result30 !== null) {
                                                var result4 = result30;
                                              } else {
                                                var result29 = parse_c();
                                                if (result29 !== null) {
                                                  var result4 = result29;
                                                } else {
                                                  var result28 = parse_v();
                                                  if (result28 !== null) {
                                                    var result4 = result28;
                                                  } else {
                                                    var result4 = null;;
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          }
          if (result4 !== null) {
            var result5 = parse_range_sep();
            if (result5 !== null) {
              var result27 = parse_ff();
              if (result27 !== null) {
                var result6 = result27;
              } else {
                var result26 = parse_bcv_comma();
                if (result26 !== null) {
                  var result6 = result26;
                } else {
                  var result25 = parse_bc_title();
                  if (result25 !== null) {
                    var result6 = result25;
                  } else {
                    var result24 = parse_bcv();
                    if (result24 !== null) {
                      var result6 = result24;
                    } else {
                      var result23 = parse_bcv_weak();
                      if (result23 !== null) {
                        var result6 = result23;
                      } else {
                        var result22 = parse_bc();
                        if (result22 !== null) {
                          var result6 = result22;
                        } else {
                          var result21 = parse_cv_psalm();
                          if (result21 !== null) {
                            var result6 = result21;
                          } else {
                            var result20 = parse_bv();
                            if (result20 !== null) {
                              var result6 = result20;
                            } else {
                              var result19 = parse_cbv();
                              if (result19 !== null) {
                                var result6 = result19;
                              } else {
                                var result18 = parse_cbv_ordinal();
                                if (result18 !== null) {
                                  var result6 = result18;
                                } else {
                                  var result17 = parse_c_psalm();
                                  if (result17 !== null) {
                                    var result6 = result17;
                                  } else {
                                    var result16 = parse_cb();
                                    if (result16 !== null) {
                                      var result6 = result16;
                                    } else {
                                      var result15 = parse_cb_ordinal();
                                      if (result15 !== null) {
                                        var result6 = result15;
                                      } else {
                                        var result14 = parse_c_title();
                                        if (result14 !== null) {
                                          var result6 = result14;
                                        } else {
                                          var result13 = parse_integer_title();
                                          if (result13 !== null) {
                                            var result6 = result13;
                                          } else {
                                            var result12 = parse_cv();
                                            if (result12 !== null) {
                                              var result6 = result12;
                                            } else {
                                              var result11 = parse_v_letter();
                                              if (result11 !== null) {
                                                var result6 = result11;
                                              } else {
                                                var result10 = parse_integer();
                                                if (result10 !== null) {
                                                  var result6 = result10;
                                                } else {
                                                  var result9 = parse_cv_weak();
                                                  if (result9 !== null) {
                                                    var result6 = result9;
                                                  } else {
                                                    var result8 = parse_c();
                                                    if (result8 !== null) {
                                                      var result6 = result8;
                                                    } else {
                                                      var result7 = parse_v();
                                                      if (result7 !== null) {
                                                        var result6 = result7;
                                                      } else {
                                                        var result6 = null;;
                                                      };
                                                    };
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "range", "value": [val_1, val_2], "indices": [indices["range"], pos - 1]} })(result1[1], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_b_range() {
        var cacheKey = 'b_range@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["b_range"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_b();
          if (result4 !== null) {
            var result5 = parse_range_sep();
            if (result5 !== null) {
              var savedPos2 = pos;
              var savedReportMatchFailuresVar0 = reportMatchFailures;
              reportMatchFailures = false;
              var result14 = parse_range();
              if (result14 !== null) {
                var result8 = result14;
              } else {
                var result13 = parse_ff();
                if (result13 !== null) {
                  var result8 = result13;
                } else {
                  var result12 = parse_bcv();
                  if (result12 !== null) {
                    var result8 = result12;
                  } else {
                    var result11 = parse_bcv_weak();
                    if (result11 !== null) {
                      var result8 = result11;
                    } else {
                      var result10 = parse_bc();
                      if (result10 !== null) {
                        var result8 = result10;
                      } else {
                        var result9 = parse_bv();
                        if (result9 !== null) {
                          var result8 = result9;
                        } else {
                          var result8 = null;;
                        };
                      };
                    };
                  };
                };
              }
              reportMatchFailures = savedReportMatchFailuresVar0;
              if (result8 === null) {
                var result6 = '';
              } else {
                var result6 = null;
                pos = savedPos2;
              }
              if (result6 !== null) {
                var result7 = parse_b();
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "b_range", "value": [val_1, val_2], "indices": [indices["b_range"], pos - 1]} })(result1[1], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bcv_hyphen_range() {
        var cacheKey = 'bcv_hyphen_range@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bcv_hyphen_range"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_b();
          if (result4 !== null) {
            if (input.substr(pos, 1) === "-") {
              var result13 = "-";
              pos += 1;
            } else {
              var result13 = null;
              if (reportMatchFailures) {
                matchFailed("\"-\"");
              }
            }
            if (result13 !== null) {
              var result11 = result13;
            } else {
              var result12 = parse_space();
              if (result12 !== null) {
                var result11 = result12;
              } else {
                var result11 = null;;
              };
            }
            var result5 = result11 !== null ? result11 : '';
            if (result5 !== null) {
              var result6 = parse_c();
              if (result6 !== null) {
                if (input.substr(pos, 1) === "-") {
                  var result7 = "-";
                  pos += 1;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"-\"");
                  }
                }
                if (result7 !== null) {
                  var result8 = parse_v();
                  if (result8 !== null) {
                    if (input.substr(pos, 1) === "-") {
                      var result9 = "-";
                      pos += 1;
                    } else {
                      var result9 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"-\"");
                      }
                    }
                    if (result9 !== null) {
                      var result10 = parse_v();
                      if (result10 !== null) {
                        var result1 = [result3, result4, result5, result6, result7, result8, result9, result10];
                      } else {
                        var result1 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2, val_3, val_4) { return {"type": "range", "value": [{"type": "bcv", "value": [{"type": "bc", "value": [val_1, val_2], "indices": [val_1.indices[0], val_2.indices[1]]}, val_3], "indices": [val_1.indices[0], val_3.indices[1]]}, val_4], "indices": [indices["bcv_hyphen_range"], pos - 1]} })(result1[1], result1[3], result1[5], result1[7])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_b() {
        var cacheKey = 'b@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["b"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          if (input.substr(pos, 1) === "") {
            var result4 = "";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          if (result4 !== null) {
            var result5 = parse_any_integer();
            if (result5 !== null) {
              var savedPos2 = pos;
              if (input.substr(pos, 1) === "/") {
                var result9 = "/";
                pos += 1;
              } else {
                var result9 = null;
                if (reportMatchFailures) {
                  matchFailed("\"/\"");
                }
              }
              if (result9 !== null) {
                if (input.substr(pos).match(/^[a-z]/) !== null) {
                  var result10 = input.charAt(pos);
                  pos++;
                } else {
                  var result10 = null;
                  if (reportMatchFailures) {
                    matchFailed("[a-z]");
                  }
                }
                if (result10 !== null) {
                  var result8 = [result9, result10];
                } else {
                  var result8 = null;
                  pos = savedPos2;
                }
              } else {
                var result8 = null;
                pos = savedPos2;
              }
              var result6 = result8 !== null ? result8 : '';
              if (result6 !== null) {
                if (input.substr(pos, 1) === "") {
                  var result7 = "";
                  pos += 1;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"\"");
                  }
                }
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "b", "value": val.value, "indices": [indices["b"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bc() {
        var cacheKey = 'bc@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bc"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_b();
          if (result4 !== null) {
            var savedPos2 = pos;
            var result15 = parse_v_explicit();
            if (result15 !== null) {
              var savedPos3 = pos;
              var savedReportMatchFailuresVar0 = reportMatchFailures;
              reportMatchFailures = false;
              var savedPos4 = pos;
              var result18 = parse_c();
              if (result18 !== null) {
                var result19 = parse_cv_sep();
                if (result19 !== null) {
                  var result20 = parse_v();
                  if (result20 !== null) {
                    var result17 = [result18, result19, result20];
                  } else {
                    var result17 = null;
                    pos = savedPos4;
                  }
                } else {
                  var result17 = null;
                  pos = savedPos4;
                }
              } else {
                var result17 = null;
                pos = savedPos4;
              }
              reportMatchFailures = savedReportMatchFailuresVar0;
              if (result17 !== null) {
                var result16 = '';
                pos = savedPos3;
              } else {
                var result16 = null;
              }
              if (result16 !== null) {
                var result14 = [result15, result16];
              } else {
                var result14 = null;
                pos = savedPos2;
              }
            } else {
              var result14 = null;
              pos = savedPos2;
            }
            if (result14 !== null) {
              var result5 = result14;
            } else {
              var result13 = parse_cv_sep();
              if (result13 !== null) {
                var result12 = [];
                while (result13 !== null) {
                  result12.push(result13);
                  var result13 = parse_cv_sep();
                }
              } else {
                var result12 = null;
              }
              if (result12 !== null) {
                var result5 = result12;
              } else {
                var result11 = parse_cv_sep_weak();
                if (result11 !== null) {
                  var result10 = [];
                  while (result11 !== null) {
                    result10.push(result11);
                    var result11 = parse_cv_sep_weak();
                  }
                } else {
                  var result10 = null;
                }
                if (result10 !== null) {
                  var result5 = result10;
                } else {
                  var result9 = parse_range_sep();
                  if (result9 !== null) {
                    var result8 = [];
                    while (result9 !== null) {
                      result8.push(result9);
                      var result9 = parse_range_sep();
                    }
                  } else {
                    var result8 = null;
                  }
                  if (result8 !== null) {
                    var result5 = result8;
                  } else {
                    var result7 = parse_sp();
                    if (result7 !== null) {
                      var result5 = result7;
                    } else {
                      var result5 = null;;
                    };
                  };
                };
              };
            }
            if (result5 !== null) {
              var result6 = parse_c();
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bc", "value": [val_1, val_2], "indices": [indices["bc"], pos - 1]} })(result1[1], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bc_comma() {
        var cacheKey = 'bc_comma@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bc_comma"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_b();
          if (result4 !== null) {
            var result5 = parse_sp();
            if (result5 !== null) {
              if (input.substr(pos, 1) === ",") {
                var result6 = ",";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\",\"");
                }
              }
              if (result6 !== null) {
                var result7 = parse_sp();
                if (result7 !== null) {
                  var result8 = parse_c();
                  if (result8 !== null) {
                    var result1 = [result3, result4, result5, result6, result7, result8];
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bc", "value": [val_1, val_2], "indices": [indices["bc_comma"], pos - 1]} })(result1[1], result1[5])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bc_title() {
        var cacheKey = 'bc_title@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bc_title"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_bc();
          if (result4 !== null) {
            var result5 = parse_title();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bc_title", "value": [val_1, val_2], "indices": [indices["bc_title"], pos - 1]} })(result1[1], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bcv() {
        var cacheKey = 'bcv@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bcv"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_bc();
          if (result4 !== null) {
            var savedPos3 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            var savedPos4 = pos;
            if (input.substr(pos, 1) === ".") {
              var result18 = ".";
              pos += 1;
            } else {
              var result18 = null;
              if (reportMatchFailures) {
                matchFailed("\".\"");
              }
            }
            if (result18 !== null) {
              var result19 = parse_v_explicit();
              if (result19 !== null) {
                var result20 = parse_v();
                if (result20 !== null) {
                  var result17 = [result18, result19, result20];
                } else {
                  var result17 = null;
                  pos = savedPos4;
                }
              } else {
                var result17 = null;
                pos = savedPos4;
              }
            } else {
              var result17 = null;
              pos = savedPos4;
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result17 === null) {
              var result5 = '';
            } else {
              var result5 = null;
              pos = savedPos3;
            }
            if (result5 !== null) {
              var savedPos2 = pos;
              var result16 = parse_cv_sep();
              if (result16 !== null) {
                var result14 = result16;
              } else {
                var result15 = parse_sequence_sep();
                if (result15 !== null) {
                  var result14 = result15;
                } else {
                  var result14 = null;;
                };
              }
              var result12 = result14 !== null ? result14 : '';
              if (result12 !== null) {
                var result13 = parse_v_explicit();
                if (result13 !== null) {
                  var result11 = [result12, result13];
                } else {
                  var result11 = null;
                  pos = savedPos2;
                }
              } else {
                var result11 = null;
                pos = savedPos2;
              }
              if (result11 !== null) {
                var result6 = result11;
              } else {
                var result10 = parse_cv_sep();
                if (result10 !== null) {
                  var result6 = result10;
                } else {
                  var result6 = null;;
                };
              }
              if (result6 !== null) {
                var result9 = parse_v_letter();
                if (result9 !== null) {
                  var result7 = result9;
                } else {
                  var result8 = parse_v();
                  if (result8 !== null) {
                    var result7 = result8;
                  } else {
                    var result7 = null;;
                  };
                }
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["bcv"], pos - 1]} })(result1[1], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bcv_weak() {
        var cacheKey = 'bcv_weak@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bcv_weak"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_bc();
          if (result4 !== null) {
            var result5 = parse_cv_sep_weak();
            if (result5 !== null) {
              var result12 = parse_v_letter();
              if (result12 !== null) {
                var result6 = result12;
              } else {
                var result11 = parse_v();
                if (result11 !== null) {
                  var result6 = result11;
                } else {
                  var result6 = null;;
                };
              }
              if (result6 !== null) {
                var savedPos2 = pos;
                var savedReportMatchFailuresVar0 = reportMatchFailures;
                reportMatchFailures = false;
                var savedPos3 = pos;
                var result9 = parse_cv_sep();
                if (result9 !== null) {
                  var result10 = parse_v();
                  if (result10 !== null) {
                    var result8 = [result9, result10];
                  } else {
                    var result8 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result8 = null;
                  pos = savedPos3;
                }
                reportMatchFailures = savedReportMatchFailuresVar0;
                if (result8 === null) {
                  var result7 = '';
                } else {
                  var result7 = null;
                  pos = savedPos2;
                }
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["bcv_weak"], pos - 1]} })(result1[1], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bcv_comma() {
        var cacheKey = 'bcv_comma@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bcv_comma"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_bc_comma();
          if (result4 !== null) {
            var result5 = parse_sp();
            if (result5 !== null) {
              if (input.substr(pos, 1) === ",") {
                var result6 = ",";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\",\"");
                }
              }
              if (result6 !== null) {
                var result7 = parse_sp();
                if (result7 !== null) {
                  var result14 = parse_v_letter();
                  if (result14 !== null) {
                    var result8 = result14;
                  } else {
                    var result13 = parse_v();
                    if (result13 !== null) {
                      var result8 = result13;
                    } else {
                      var result8 = null;;
                    };
                  }
                  if (result8 !== null) {
                    var savedPos2 = pos;
                    var savedReportMatchFailuresVar0 = reportMatchFailures;
                    reportMatchFailures = false;
                    var savedPos3 = pos;
                    var result11 = parse_cv_sep();
                    if (result11 !== null) {
                      var result12 = parse_v();
                      if (result12 !== null) {
                        var result10 = [result11, result12];
                      } else {
                        var result10 = null;
                        pos = savedPos3;
                      }
                    } else {
                      var result10 = null;
                      pos = savedPos3;
                    }
                    reportMatchFailures = savedReportMatchFailuresVar0;
                    if (result10 === null) {
                      var result9 = '';
                    } else {
                      var result9 = null;
                      pos = savedPos2;
                    }
                    if (result9 !== null) {
                      var result1 = [result3, result4, result5, result6, result7, result8, result9];
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["bcv_comma"], pos - 1]} })(result1[1], result1[5])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bv() {
        var cacheKey = 'bv@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["bv"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_b();
          if (result4 !== null) {
            var result20 = parse_cv_sep();
            if (result20 !== null) {
              var result19 = [];
              while (result20 !== null) {
                result19.push(result20);
                var result20 = parse_cv_sep();
              }
            } else {
              var result19 = null;
            }
            if (result19 !== null) {
              var result5 = result19;
            } else {
              var result18 = parse_cv_sep_weak();
              if (result18 !== null) {
                var result17 = [];
                while (result18 !== null) {
                  result17.push(result18);
                  var result18 = parse_cv_sep_weak();
                }
              } else {
                var result17 = null;
              }
              if (result17 !== null) {
                var result5 = result17;
              } else {
                var result16 = parse_range_sep();
                if (result16 !== null) {
                  var result15 = [];
                  while (result16 !== null) {
                    result15.push(result16);
                    var result16 = parse_range_sep();
                  }
                } else {
                  var result15 = null;
                }
                if (result15 !== null) {
                  var result5 = result15;
                } else {
                  var savedPos2 = pos;
                  var result14 = parse_sequence_sep();
                  if (result14 !== null) {
                    var result11 = [];
                    while (result14 !== null) {
                      result11.push(result14);
                      var result14 = parse_sequence_sep();
                    }
                  } else {
                    var result11 = null;
                  }
                  if (result11 !== null) {
                    var savedPos3 = pos;
                    var savedReportMatchFailuresVar0 = reportMatchFailures;
                    reportMatchFailures = false;
                    var result13 = parse_v_explicit();
                    reportMatchFailures = savedReportMatchFailuresVar0;
                    if (result13 !== null) {
                      var result12 = '';
                      pos = savedPos3;
                    } else {
                      var result12 = null;
                    }
                    if (result12 !== null) {
                      var result10 = [result11, result12];
                    } else {
                      var result10 = null;
                      pos = savedPos2;
                    }
                  } else {
                    var result10 = null;
                    pos = savedPos2;
                  }
                  if (result10 !== null) {
                    var result5 = result10;
                  } else {
                    var result9 = parse_sp();
                    if (result9 !== null) {
                      var result5 = result9;
                    } else {
                      var result5 = null;;
                    };
                  };
                };
              };
            }
            if (result5 !== null) {
              var result8 = parse_v_letter();
              if (result8 !== null) {
                var result6 = result8;
              } else {
                var result7 = parse_v();
                if (result7 !== null) {
                  var result6 = result7;
                } else {
                  var result6 = null;;
                };
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bv", "value": [val_1, val_2], "indices": [indices["bv"], pos - 1]} })(result1[1], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cb() {
        var cacheKey = 'cb@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cb"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c_explicit();
          if (result4 !== null) {
            var result5 = parse_c();
            if (result5 !== null) {
              var result8 = parse_in_book_of();
              var result6 = result8 !== null ? result8 : '';
              if (result6 !== null) {
                var result7 = parse_b();
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bc", "value": [val_2, val_1], "indices": [indices["cb"], pos - 1]} })(result1[2], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cb_range() {
        var cacheKey = 'cb_range@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cb_range"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c_explicit();
          if (result4 !== null) {
            var result5 = parse_c();
            if (result5 !== null) {
              var result6 = parse_range_sep();
              if (result6 !== null) {
                var result7 = parse_c();
                if (result7 !== null) {
                  var result10 = parse_in_book_of();
                  var result8 = result10 !== null ? result10 : '';
                  if (result8 !== null) {
                    var result9 = parse_b();
                    if (result9 !== null) {
                      var result1 = [result3, result4, result5, result6, result7, result8, result9];
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2, val_3) { return {"type": "cb_range", "value": [val_3, val_1, val_2], "indices": [indices["cb_range"], pos - 1]} })(result1[2], result1[4], result1[6])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cbv() {
        var cacheKey = 'cbv@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cbv"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_cb();
          if (result4 !== null) {
            var result8 = parse_sequence_sep();
            var result5 = result8 !== null ? result8 : '';
            if (result5 !== null) {
              var result6 = parse_v_explicit();
              if (result6 !== null) {
                var result7 = parse_v();
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["cbv"], pos - 1]} })(result1[1], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cb_ordinal() {
        var cacheKey = 'cb_ordinal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cb_ordinal"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c();
          if (result4 !== null) {
            if (input.substr(pos, 2) === "th") {
              var result12 = "th";
              pos += 2;
            } else {
              var result12 = null;
              if (reportMatchFailures) {
                matchFailed("\"th\"");
              }
            }
            if (result12 !== null) {
              var result5 = result12;
            } else {
              if (input.substr(pos, 2) === "nd") {
                var result11 = "nd";
                pos += 2;
              } else {
                var result11 = null;
                if (reportMatchFailures) {
                  matchFailed("\"nd\"");
                }
              }
              if (result11 !== null) {
                var result5 = result11;
              } else {
                if (input.substr(pos, 2) === "st") {
                  var result10 = "st";
                  pos += 2;
                } else {
                  var result10 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"st\"");
                  }
                }
                if (result10 !== null) {
                  var result5 = result10;
                } else {
                  var result5 = null;;
                };
              };
            }
            if (result5 !== null) {
              var result6 = parse_c_explicit();
              if (result6 !== null) {
                var result9 = parse_in_book_of();
                var result7 = result9 !== null ? result9 : '';
                if (result7 !== null) {
                  var result8 = parse_b();
                  if (result8 !== null) {
                    var result1 = [result3, result4, result5, result6, result7, result8];
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bc", "value": [val_2, val_1], "indices": [indices["cb_ordinal"], pos - 1]} })(result1[1], result1[5])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cbv_ordinal() {
        var cacheKey = 'cbv_ordinal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cbv_ordinal"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_cb_ordinal();
          if (result4 !== null) {
            var result8 = parse_sequence_sep();
            var result5 = result8 !== null ? result8 : '';
            if (result5 !== null) {
              var result6 = parse_v_explicit();
              if (result6 !== null) {
                var result7 = parse_v();
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["cbv_ordinal"], pos - 1]} })(result1[1], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_c_psalm() {
        var cacheKey = 'c_psalm@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["c_psalm"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          if (input.substr(pos, 1) === "") {
            var result4 = "";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          if (result4 !== null) {
            var result5 = parse_integer();
            if (result5 !== null) {
              if (input.substr(pos, 3) === "/p") {
                var result6 = "/p";
                pos += 3;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"/p\"");
                }
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "c_psalm", "value": val.value, "indices": [indices["c_psalm"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cv_psalm() {
        var cacheKey = 'cv_psalm@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cv_psalm"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c_psalm();
          if (result4 !== null) {
            var result8 = parse_sequence_sep();
            var result5 = result8 !== null ? result8 : '';
            if (result5 !== null) {
              var result6 = parse_v_explicit();
              if (result6 !== null) {
                var result7 = parse_v();
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "cv_psalm", "value": [val_1, val_2], "indices": [indices["cv_psalm"], pos - 1]} })(result1[1], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_c_title() {
        var cacheKey = 'c_title@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["c_title"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c_explicit();
          if (result4 !== null) {
            var result5 = parse_c();
            if (result5 !== null) {
              var result6 = parse_title();
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "c_title", "value": [val_1, val_2], "indices": [indices["c_title"], pos - 1]} })(result1[2], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cv() {
        var cacheKey = 'cv@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cv"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c();
          if (result4 !== null) {
            var savedPos3 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            var savedPos4 = pos;
            if (input.substr(pos, 1) === ".") {
              var result16 = ".";
              pos += 1;
            } else {
              var result16 = null;
              if (reportMatchFailures) {
                matchFailed("\".\"");
              }
            }
            if (result16 !== null) {
              var result17 = parse_v_explicit();
              if (result17 !== null) {
                var result18 = parse_v();
                if (result18 !== null) {
                  var result15 = [result16, result17, result18];
                } else {
                  var result15 = null;
                  pos = savedPos4;
                }
              } else {
                var result15 = null;
                pos = savedPos4;
              }
            } else {
              var result15 = null;
              pos = savedPos4;
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result15 === null) {
              var result5 = '';
            } else {
              var result5 = null;
              pos = savedPos3;
            }
            if (result5 !== null) {
              var savedPos2 = pos;
              var result14 = parse_cv_sep();
              var result12 = result14 !== null ? result14 : '';
              if (result12 !== null) {
                var result13 = parse_v_explicit();
                if (result13 !== null) {
                  var result11 = [result12, result13];
                } else {
                  var result11 = null;
                  pos = savedPos2;
                }
              } else {
                var result11 = null;
                pos = savedPos2;
              }
              if (result11 !== null) {
                var result6 = result11;
              } else {
                var result10 = parse_cv_sep();
                if (result10 !== null) {
                  var result6 = result10;
                } else {
                  var result6 = null;;
                };
              }
              if (result6 !== null) {
                var result9 = parse_v_letter();
                if (result9 !== null) {
                  var result7 = result9;
                } else {
                  var result8 = parse_v();
                  if (result8 !== null) {
                    var result7 = result8;
                  } else {
                    var result7 = null;;
                  };
                }
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "cv", "value": [val_1, val_2], "indices": [indices["cv"], pos - 1]} })(result1[1], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cv_weak() {
        var cacheKey = 'cv_weak@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["cv_weak"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_c();
          if (result4 !== null) {
            var result5 = parse_cv_sep_weak();
            if (result5 !== null) {
              var result12 = parse_v_letter();
              if (result12 !== null) {
                var result6 = result12;
              } else {
                var result11 = parse_v();
                if (result11 !== null) {
                  var result6 = result11;
                } else {
                  var result6 = null;;
                };
              }
              if (result6 !== null) {
                var savedPos2 = pos;
                var savedReportMatchFailuresVar0 = reportMatchFailures;
                reportMatchFailures = false;
                var savedPos3 = pos;
                var result9 = parse_cv_sep();
                if (result9 !== null) {
                  var result10 = parse_v();
                  if (result10 !== null) {
                    var result8 = [result9, result10];
                  } else {
                    var result8 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result8 = null;
                  pos = savedPos3;
                }
                reportMatchFailures = savedReportMatchFailuresVar0;
                if (result8 === null) {
                  var result7 = '';
                } else {
                  var result7 = null;
                  pos = savedPos2;
                }
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1, val_2) { return {"type": "cv", "value": [val_1, val_2], "indices": [indices["cv_weak"], pos - 1]} })(result1[1], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_c() {
        var cacheKey = 'c@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["c"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result6 = parse_c_explicit();
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            var result5 = parse_integer();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "c", "value": [val], "indices": [indices["c"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_integer_title() {
        var cacheKey = 'integer_title@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["integer_title"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_integer();
          if (result4 !== null) {
            var result9 = parse_cv_sep();
            if (result9 !== null) {
              var result7 = result9;
            } else {
              var result8 = parse_sequence_sep();
              if (result8 !== null) {
                var result7 = result8;
              } else {
                var result7 = null;;
              };
            }
            var result5 = result7 !== null ? result7 : '';
            if (result5 !== null) {
              if (input.substr(pos, 5) === "title") {
                var result6 = "title";
                pos += 5;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"title\"");
                }
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1) { return {"type": "integer_title", "value": [val_1], "indices": [indices["integer_title"], pos - 1]} })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_v_letter() {
        var cacheKey = 'v_letter@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["v_letter"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result10 = parse_v_explicit();
          var result4 = result10 !== null ? result10 : '';
          if (result4 !== null) {
            var result5 = parse_integer();
            if (result5 !== null) {
              var result6 = parse_sp();
              if (result6 !== null) {
                if (input.substr(pos).match(/^[a-e]/) !== null) {
                  var result7 = input.charAt(pos);
                  pos++;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("[a-e]");
                  }
                }
                if (result7 !== null) {
                  var savedPos2 = pos;
                  var savedReportMatchFailuresVar0 = reportMatchFailures;
                  reportMatchFailures = false;
                  if (input.substr(pos).match(/^[a-z]/) !== null) {
                    var result9 = input.charAt(pos);
                    pos++;
                  } else {
                    var result9 = null;
                    if (reportMatchFailures) {
                      matchFailed("[a-z]");
                    }
                  }
                  reportMatchFailures = savedReportMatchFailuresVar0;
                  if (result9 === null) {
                    var result8 = '';
                  } else {
                    var result8 = null;
                    pos = savedPos2;
                  }
                  if (result8 !== null) {
                    var result1 = [result3, result4, result5, result6, result7, result8];
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "v", "value": [val], "indices": [indices["v_letter"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_v() {
        var cacheKey = 'v@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["v"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result6 = parse_v_explicit();
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            var result5 = parse_integer();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "v", "value": [val], "indices": [indices["v"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ff() {
        var cacheKey = 'ff@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["ff"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result20 = parse_bcv();
          if (result20 !== null) {
            var result4 = result20;
          } else {
            var result19 = parse_bcv_weak();
            if (result19 !== null) {
              var result4 = result19;
            } else {
              var result18 = parse_bc();
              if (result18 !== null) {
                var result4 = result18;
              } else {
                var result17 = parse_cv();
                if (result17 !== null) {
                  var result4 = result17;
                } else {
                  var result16 = parse_cv_weak();
                  if (result16 !== null) {
                    var result4 = result16;
                  } else {
                    var result15 = parse_integer();
                    if (result15 !== null) {
                      var result4 = result15;
                    } else {
                      var result14 = parse_c();
                      if (result14 !== null) {
                        var result4 = result14;
                      } else {
                        var result13 = parse_v();
                        if (result13 !== null) {
                          var result4 = result13;
                        } else {
                          var result4 = null;;
                        };
                      };
                    };
                  };
                };
              };
            };
          }
          if (result4 !== null) {
            var result5 = parse_sp();
            if (result5 !== null) {
              if (input.substr(pos, 1) === "f") {
                var result6 = "f";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"f\"");
                }
              }
              if (result6 !== null) {
                if (input.substr(pos, 1) === "f") {
                  var result12 = "f";
                  pos += 1;
                } else {
                  var result12 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"f\"");
                  }
                }
                var result7 = result12 !== null ? result12 : '';
                if (result7 !== null) {
                  var result11 = parse_abbrev();
                  var result8 = result11 !== null ? result11 : '';
                  if (result8 !== null) {
                    var savedPos2 = pos;
                    var savedReportMatchFailuresVar0 = reportMatchFailures;
                    reportMatchFailures = false;
                    if (input.substr(pos).match(/^[A-Za-z]/) !== null) {
                      var result10 = input.charAt(pos);
                      pos++;
                    } else {
                      var result10 = null;
                      if (reportMatchFailures) {
                        matchFailed("[A-Za-z]");
                      }
                    }
                    reportMatchFailures = savedReportMatchFailuresVar0;
                    if (result10 === null) {
                      var result9 = '';
                    } else {
                      var result9 = null;
                      pos = savedPos2;
                    }
                    if (result9 !== null) {
                      var result1 = [result3, result4, result5, result6, result7, result8, result9];
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val_1) { return {"type": "ff", "value": [val_1], "indices": [indices["ff"], pos - 1]} })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_c_explicit() {
        var cacheKey = 'c_explicit@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_sp();
        if (result3 !== null) {
          var savedPos4 = pos;
          if (input.substr(pos, 7) === "chapter") {
            var result26 = "chapter";
            pos += 7;
          } else {
            var result26 = null;
            if (reportMatchFailures) {
              matchFailed("\"chapter\"");
            }
          }
          if (result26 !== null) {
            if (input.substr(pos, 1) === "s") {
              var result28 = "s";
              pos += 1;
            } else {
              var result28 = null;
              if (reportMatchFailures) {
                matchFailed("\"s\"");
              }
            }
            var result27 = result28 !== null ? result28 : '';
            if (result27 !== null) {
              var result25 = [result26, result27];
            } else {
              var result25 = null;
              pos = savedPos4;
            }
          } else {
            var result25 = null;
            pos = savedPos4;
          }
          if (result25 !== null) {
            var result4 = result25;
          } else {
            var savedPos3 = pos;
            if (input.substr(pos, 2) === "ch") {
              var result17 = "ch";
              pos += 2;
            } else {
              var result17 = null;
              if (reportMatchFailures) {
                matchFailed("\"ch\"");
              }
            }
            if (result17 !== null) {
              if (input.substr(pos, 1) === "a") {
                var result24 = "a";
                pos += 1;
              } else {
                var result24 = null;
                if (reportMatchFailures) {
                  matchFailed("\"a\"");
                }
              }
              var result18 = result24 !== null ? result24 : '';
              if (result18 !== null) {
                if (input.substr(pos, 2) === "pt") {
                  var result19 = "pt";
                  pos += 2;
                } else {
                  var result19 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"pt\"");
                  }
                }
                if (result19 !== null) {
                  if (input.substr(pos, 1) === "s") {
                    var result23 = "s";
                    pos += 1;
                  } else {
                    var result23 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"s\"");
                    }
                  }
                  var result20 = result23 !== null ? result23 : '';
                  if (result20 !== null) {
                    var result22 = parse_abbrev();
                    var result21 = result22 !== null ? result22 : '';
                    if (result21 !== null) {
                      var result16 = [result17, result18, result19, result20, result21];
                    } else {
                      var result16 = null;
                      pos = savedPos3;
                    }
                  } else {
                    var result16 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result16 = null;
                  pos = savedPos3;
                }
              } else {
                var result16 = null;
                pos = savedPos3;
              }
            } else {
              var result16 = null;
              pos = savedPos3;
            }
            if (result16 !== null) {
              var result4 = result16;
            } else {
              var savedPos2 = pos;
              if (input.substr(pos, 2) === "ch") {
                var result7 = "ch";
                pos += 2;
              } else {
                var result7 = null;
                if (reportMatchFailures) {
                  matchFailed("\"ch\"");
                }
              }
              if (result7 !== null) {
                if (input.substr(pos, 1) === "a") {
                  var result15 = "a";
                  pos += 1;
                } else {
                  var result15 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"a\"");
                  }
                }
                var result8 = result15 !== null ? result15 : '';
                if (result8 !== null) {
                  if (input.substr(pos, 1) === "p") {
                    var result14 = "p";
                    pos += 1;
                  } else {
                    var result14 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"p\"");
                    }
                  }
                  var result9 = result14 !== null ? result14 : '';
                  if (result9 !== null) {
                    if (input.substr(pos, 1) === "s") {
                      var result13 = "s";
                      pos += 1;
                    } else {
                      var result13 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"s\"");
                      }
                    }
                    var result10 = result13 !== null ? result13 : '';
                    if (result10 !== null) {
                      var result12 = parse_abbrev();
                      var result11 = result12 !== null ? result12 : '';
                      if (result11 !== null) {
                        var result6 = [result7, result8, result9, result10, result11];
                      } else {
                        var result6 = null;
                        pos = savedPos2;
                      }
                    } else {
                      var result6 = null;
                      pos = savedPos2;
                    }
                  } else {
                    var result6 = null;
                    pos = savedPos2;
                  }
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
              } else {
                var result6 = null;
                pos = savedPos2;
              }
              if (result6 !== null) {
                var result4 = result6;
              } else {
                var result4 = null;;
              };
            };
          }
          if (result4 !== null) {
            var result5 = parse_sp();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() { return {"type": "c_explicit"} })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_v_explicit() {
        var cacheKey = 'v_explicit@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_sp();
        if (result3 !== null) {
          var savedPos5 = pos;
          if (input.substr(pos, 5) === "verse") {
            var result23 = "verse";
            pos += 5;
          } else {
            var result23 = null;
            if (reportMatchFailures) {
              matchFailed("\"verse\"");
            }
          }
          if (result23 !== null) {
            if (input.substr(pos, 1) === "s") {
              var result25 = "s";
              pos += 1;
            } else {
              var result25 = null;
              if (reportMatchFailures) {
                matchFailed("\"s\"");
              }
            }
            var result24 = result25 !== null ? result25 : '';
            if (result24 !== null) {
              var result22 = [result23, result24];
            } else {
              var result22 = null;
              pos = savedPos5;
            }
          } else {
            var result22 = null;
            pos = savedPos5;
          }
          if (result22 !== null) {
            var result4 = result22;
          } else {
            var savedPos4 = pos;
            if (input.substr(pos, 2) === "vv") {
              var result19 = "vv";
              pos += 2;
            } else {
              var result19 = null;
              if (reportMatchFailures) {
                matchFailed("\"vv\"");
              }
            }
            if (result19 !== null) {
              var result21 = parse_abbrev();
              var result20 = result21 !== null ? result21 : '';
              if (result20 !== null) {
                var result18 = [result19, result20];
              } else {
                var result18 = null;
                pos = savedPos4;
              }
            } else {
              var result18 = null;
              pos = savedPos4;
            }
            if (result18 !== null) {
              var result4 = result18;
            } else {
              var savedPos3 = pos;
              if (input.substr(pos, 3) === "ver") {
                var result15 = "ver";
                pos += 3;
              } else {
                var result15 = null;
                if (reportMatchFailures) {
                  matchFailed("\"ver\"");
                }
              }
              if (result15 !== null) {
                var result17 = parse_abbrev();
                var result16 = result17 !== null ? result17 : '';
                if (result16 !== null) {
                  var result14 = [result15, result16];
                } else {
                  var result14 = null;
                  pos = savedPos3;
                }
              } else {
                var result14 = null;
                pos = savedPos3;
              }
              if (result14 !== null) {
                var result4 = result14;
              } else {
                var savedPos2 = pos;
                if (input.substr(pos, 1) === "v") {
                  var result7 = "v";
                  pos += 1;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"v\"");
                  }
                }
                if (result7 !== null) {
                  if (input.substr(pos, 1) === "s") {
                    var result13 = "s";
                    pos += 1;
                  } else {
                    var result13 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"s\"");
                    }
                  }
                  var result8 = result13 !== null ? result13 : '';
                  if (result8 !== null) {
                    if (input.substr(pos, 1) === "s") {
                      var result12 = "s";
                      pos += 1;
                    } else {
                      var result12 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"s\"");
                      }
                    }
                    var result9 = result12 !== null ? result12 : '';
                    if (result9 !== null) {
                      var result11 = parse_abbrev();
                      var result10 = result11 !== null ? result11 : '';
                      if (result10 !== null) {
                        var result6 = [result7, result8, result9, result10];
                      } else {
                        var result6 = null;
                        pos = savedPos2;
                      }
                    } else {
                      var result6 = null;
                      pos = savedPos2;
                    }
                  } else {
                    var result6 = null;
                    pos = savedPos2;
                  }
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
                if (result6 !== null) {
                  var result4 = result6;
                } else {
                  var result4 = null;;
                };
              };
            };
          }
          if (result4 !== null) {
            var result5 = parse_sp();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() { return {"type": "v_explicit"} })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cv_sep() {
        var cacheKey = 'cv_sep@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = parse_sp();
        if (result1 !== null) {
          if (input.substr(pos, 1) === ":") {
            var result13 = ":";
            pos += 1;
          } else {
            var result13 = null;
            if (reportMatchFailures) {
              matchFailed("\":\"");
            }
          }
          if (result13 !== null) {
            var result12 = [];
            while (result13 !== null) {
              result12.push(result13);
              if (input.substr(pos, 1) === ":") {
                var result13 = ":";
                pos += 1;
              } else {
                var result13 = null;
                if (reportMatchFailures) {
                  matchFailed("\":\"");
                }
              }
            }
          } else {
            var result12 = null;
          }
          if (result12 !== null) {
            var result2 = result12;
          } else {
            var savedPos1 = pos;
            if (input.substr(pos, 1) === ".") {
              var result5 = ".";
              pos += 1;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\".\"");
              }
            }
            if (result5 !== null) {
              var savedPos2 = pos;
              var savedReportMatchFailuresVar0 = reportMatchFailures;
              reportMatchFailures = false;
              var savedPos3 = pos;
              var result8 = parse_sp();
              if (result8 !== null) {
                if (input.substr(pos, 1) === ".") {
                  var result9 = ".";
                  pos += 1;
                } else {
                  var result9 = null;
                  if (reportMatchFailures) {
                    matchFailed("\".\"");
                  }
                }
                if (result9 !== null) {
                  var result10 = parse_sp();
                  if (result10 !== null) {
                    if (input.substr(pos, 1) === ".") {
                      var result11 = ".";
                      pos += 1;
                    } else {
                      var result11 = null;
                      if (reportMatchFailures) {
                        matchFailed("\".\"");
                      }
                    }
                    if (result11 !== null) {
                      var result7 = [result8, result9, result10, result11];
                    } else {
                      var result7 = null;
                      pos = savedPos3;
                    }
                  } else {
                    var result7 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result7 = null;
                  pos = savedPos3;
                }
              } else {
                var result7 = null;
                pos = savedPos3;
              }
              reportMatchFailures = savedReportMatchFailuresVar0;
              if (result7 === null) {
                var result6 = '';
              } else {
                var result6 = null;
                pos = savedPos2;
              }
              if (result6 !== null) {
                var result4 = [result5, result6];
              } else {
                var result4 = null;
                pos = savedPos1;
              }
            } else {
              var result4 = null;
              pos = savedPos1;
            }
            if (result4 !== null) {
              var result2 = result4;
            } else {
              var result2 = null;;
            };
          }
          if (result2 !== null) {
            var result3 = parse_sp();
            if (result3 !== null) {
              var result0 = [result1, result2, result3];
            } else {
              var result0 = null;
              pos = savedPos0;
            }
          } else {
            var result0 = null;
            pos = savedPos0;
          }
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_cv_sep_weak() {
        var cacheKey = 'cv_sep_weak@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result3 = parse_sp();
        if (result3 !== null) {
          if (input.substr(pos).match(/^["']/) !== null) {
            var result4 = input.charAt(pos);
            pos++;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("[\"']");
            }
          }
          if (result4 !== null) {
            var result5 = parse_sp();
            if (result5 !== null) {
              var result2 = [result3, result4, result5];
            } else {
              var result2 = null;
              pos = savedPos0;
            }
          } else {
            var result2 = null;
            pos = savedPos0;
          }
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_space();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_sequence_sep() {
        var cacheKey = 'sequence_sep@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        if (input.substr(pos).match(/^[,;\/:\-\u2013\u2014~]/) !== null) {
          var result22 = input.charAt(pos);
          pos++;
        } else {
          var result22 = null;
          if (reportMatchFailures) {
            matchFailed("[,;\\/:\\-\\u2013\\u2014~]");
          }
        }
        if (result22 !== null) {
          var result3 = result22;
        } else {
          var savedPos2 = pos;
          if (input.substr(pos, 1) === ".") {
            var result15 = ".";
            pos += 1;
          } else {
            var result15 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result15 !== null) {
            var savedPos3 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            var savedPos4 = pos;
            var result18 = parse_sp();
            if (result18 !== null) {
              if (input.substr(pos, 1) === ".") {
                var result19 = ".";
                pos += 1;
              } else {
                var result19 = null;
                if (reportMatchFailures) {
                  matchFailed("\".\"");
                }
              }
              if (result19 !== null) {
                var result20 = parse_sp();
                if (result20 !== null) {
                  if (input.substr(pos, 1) === ".") {
                    var result21 = ".";
                    pos += 1;
                  } else {
                    var result21 = null;
                    if (reportMatchFailures) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result21 !== null) {
                    var result17 = [result18, result19, result20, result21];
                  } else {
                    var result17 = null;
                    pos = savedPos4;
                  }
                } else {
                  var result17 = null;
                  pos = savedPos4;
                }
              } else {
                var result17 = null;
                pos = savedPos4;
              }
            } else {
              var result17 = null;
              pos = savedPos4;
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result17 === null) {
              var result16 = '';
            } else {
              var result16 = null;
              pos = savedPos3;
            }
            if (result16 !== null) {
              var result14 = [result15, result16];
            } else {
              var result14 = null;
              pos = savedPos2;
            }
          } else {
            var result14 = null;
            pos = savedPos2;
          }
          if (result14 !== null) {
            var result3 = result14;
          } else {
            if (input.substr(pos, 3) === "see") {
              var result13 = "see";
              pos += 3;
            } else {
              var result13 = null;
              if (reportMatchFailures) {
                matchFailed("\"see\"");
              }
            }
            if (result13 !== null) {
              var result3 = result13;
            } else {
              if (input.substr(pos, 7) === "compare") {
                var result12 = "compare";
                pos += 7;
              } else {
                var result12 = null;
                if (reportMatchFailures) {
                  matchFailed("\"compare\"");
                }
              }
              if (result12 !== null) {
                var result3 = result12;
              } else {
                var savedPos1 = pos;
                if (input.substr(pos, 2) === "cf") {
                  var result9 = "cf";
                  pos += 2;
                } else {
                  var result9 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"cf\"");
                  }
                }
                if (result9 !== null) {
                  var result11 = parse_abbrev();
                  var result10 = result11 !== null ? result11 : '';
                  if (result10 !== null) {
                    var result8 = [result9, result10];
                  } else {
                    var result8 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result8 = null;
                  pos = savedPos1;
                }
                if (result8 !== null) {
                  var result3 = result8;
                } else {
                  if (input.substr(pos, 3) === "and") {
                    var result7 = "and";
                    pos += 3;
                  } else {
                    var result7 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"and\"");
                    }
                  }
                  if (result7 !== null) {
                    var result3 = result7;
                  } else {
                    if (input.substr(pos, 4) === "also") {
                      var result6 = "also";
                      pos += 4;
                    } else {
                      var result6 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"also\"");
                      }
                    }
                    if (result6 !== null) {
                      var result3 = result6;
                    } else {
                      if (input.substr(pos, 1) === "&") {
                        var result5 = "&";
                        pos += 1;
                      } else {
                        var result5 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"&\"");
                        }
                      }
                      if (result5 !== null) {
                        var result3 = result5;
                      } else {
                        var result4 = parse_space();
                        if (result4 !== null) {
                          var result3 = result4;
                        } else {
                          var result3 = null;;
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }
        if (result3 !== null) {
          var result1 = [];
          while (result3 !== null) {
            result1.push(result3);
            if (input.substr(pos).match(/^[,;\/:\-\u2013\u2014~]/) !== null) {
              var result22 = input.charAt(pos);
              pos++;
            } else {
              var result22 = null;
              if (reportMatchFailures) {
                matchFailed("[,;\\/:\\-\\u2013\\u2014~]");
              }
            }
            if (result22 !== null) {
              var result3 = result22;
            } else {
              var savedPos2 = pos;
              if (input.substr(pos, 1) === ".") {
                var result15 = ".";
                pos += 1;
              } else {
                var result15 = null;
                if (reportMatchFailures) {
                  matchFailed("\".\"");
                }
              }
              if (result15 !== null) {
                var savedPos3 = pos;
                var savedReportMatchFailuresVar0 = reportMatchFailures;
                reportMatchFailures = false;
                var savedPos4 = pos;
                var result18 = parse_sp();
                if (result18 !== null) {
                  if (input.substr(pos, 1) === ".") {
                    var result19 = ".";
                    pos += 1;
                  } else {
                    var result19 = null;
                    if (reportMatchFailures) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result19 !== null) {
                    var result20 = parse_sp();
                    if (result20 !== null) {
                      if (input.substr(pos, 1) === ".") {
                        var result21 = ".";
                        pos += 1;
                      } else {
                        var result21 = null;
                        if (reportMatchFailures) {
                          matchFailed("\".\"");
                        }
                      }
                      if (result21 !== null) {
                        var result17 = [result18, result19, result20, result21];
                      } else {
                        var result17 = null;
                        pos = savedPos4;
                      }
                    } else {
                      var result17 = null;
                      pos = savedPos4;
                    }
                  } else {
                    var result17 = null;
                    pos = savedPos4;
                  }
                } else {
                  var result17 = null;
                  pos = savedPos4;
                }
                reportMatchFailures = savedReportMatchFailuresVar0;
                if (result17 === null) {
                  var result16 = '';
                } else {
                  var result16 = null;
                  pos = savedPos3;
                }
                if (result16 !== null) {
                  var result14 = [result15, result16];
                } else {
                  var result14 = null;
                  pos = savedPos2;
                }
              } else {
                var result14 = null;
                pos = savedPos2;
              }
              if (result14 !== null) {
                var result3 = result14;
              } else {
                if (input.substr(pos, 3) === "see") {
                  var result13 = "see";
                  pos += 3;
                } else {
                  var result13 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"see\"");
                  }
                }
                if (result13 !== null) {
                  var result3 = result13;
                } else {
                  if (input.substr(pos, 7) === "compare") {
                    var result12 = "compare";
                    pos += 7;
                  } else {
                    var result12 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"compare\"");
                    }
                  }
                  if (result12 !== null) {
                    var result3 = result12;
                  } else {
                    var savedPos1 = pos;
                    if (input.substr(pos, 2) === "cf") {
                      var result9 = "cf";
                      pos += 2;
                    } else {
                      var result9 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"cf\"");
                      }
                    }
                    if (result9 !== null) {
                      var result11 = parse_abbrev();
                      var result10 = result11 !== null ? result11 : '';
                      if (result10 !== null) {
                        var result8 = [result9, result10];
                      } else {
                        var result8 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result8 = null;
                      pos = savedPos1;
                    }
                    if (result8 !== null) {
                      var result3 = result8;
                    } else {
                      if (input.substr(pos, 3) === "and") {
                        var result7 = "and";
                        pos += 3;
                      } else {
                        var result7 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"and\"");
                        }
                      }
                      if (result7 !== null) {
                        var result3 = result7;
                      } else {
                        if (input.substr(pos, 4) === "also") {
                          var result6 = "also";
                          pos += 4;
                        } else {
                          var result6 = null;
                          if (reportMatchFailures) {
                            matchFailed("\"also\"");
                          }
                        }
                        if (result6 !== null) {
                          var result3 = result6;
                        } else {
                          if (input.substr(pos, 1) === "&") {
                            var result5 = "&";
                            pos += 1;
                          } else {
                            var result5 = null;
                            if (reportMatchFailures) {
                              matchFailed("\"&\"");
                            }
                          }
                          if (result5 !== null) {
                            var result3 = result5;
                          } else {
                            var result4 = parse_space();
                            if (result4 !== null) {
                              var result3 = result4;
                            } else {
                              var result3 = null;;
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            }
          }
        } else {
          var result1 = null;
        }
        var result2 = result1 !== null
          ? (function() { return "" })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_range_sep() {
        var cacheKey = 'range_sep@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = parse_sp();
        if (result1 !== null) {
          var savedPos4 = pos;
          if (input.substr(pos).match(/^[\-\u2013\u2014]/) !== null) {
            var result14 = input.charAt(pos);
            pos++;
          } else {
            var result14 = null;
            if (reportMatchFailures) {
              matchFailed("[\\-\\u2013\\u2014]");
            }
          }
          if (result14 !== null) {
            var result15 = parse_sp();
            if (result15 !== null) {
              var result13 = [result14, result15];
            } else {
              var result13 = null;
              pos = savedPos4;
            }
          } else {
            var result13 = null;
            pos = savedPos4;
          }
          if (result13 !== null) {
            var result3 = result13;
          } else {
            var savedPos3 = pos;
            if (input.substr(pos, 7) === "through") {
              var result11 = "through";
              pos += 7;
            } else {
              var result11 = null;
              if (reportMatchFailures) {
                matchFailed("\"through\"");
              }
            }
            if (result11 !== null) {
              var result12 = parse_sp();
              if (result12 !== null) {
                var result10 = [result11, result12];
              } else {
                var result10 = null;
                pos = savedPos3;
              }
            } else {
              var result10 = null;
              pos = savedPos3;
            }
            if (result10 !== null) {
              var result3 = result10;
            } else {
              var savedPos2 = pos;
              if (input.substr(pos, 4) === "thru") {
                var result8 = "thru";
                pos += 4;
              } else {
                var result8 = null;
                if (reportMatchFailures) {
                  matchFailed("\"thru\"");
                }
              }
              if (result8 !== null) {
                var result9 = parse_sp();
                if (result9 !== null) {
                  var result7 = [result8, result9];
                } else {
                  var result7 = null;
                  pos = savedPos2;
                }
              } else {
                var result7 = null;
                pos = savedPos2;
              }
              if (result7 !== null) {
                var result3 = result7;
              } else {
                var savedPos1 = pos;
                if (input.substr(pos, 2) === "to") {
                  var result5 = "to";
                  pos += 2;
                } else {
                  var result5 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"to\"");
                  }
                }
                if (result5 !== null) {
                  var result6 = parse_sp();
                  if (result6 !== null) {
                    var result4 = [result5, result6];
                  } else {
                    var result4 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result4 = null;
                  pos = savedPos1;
                }
                if (result4 !== null) {
                  var result3 = result4;
                } else {
                  var result3 = null;;
                };
              };
            };
          }
          if (result3 !== null) {
            var result2 = [];
            while (result3 !== null) {
              result2.push(result3);
              var savedPos4 = pos;
              if (input.substr(pos).match(/^[\-\u2013\u2014]/) !== null) {
                var result14 = input.charAt(pos);
                pos++;
              } else {
                var result14 = null;
                if (reportMatchFailures) {
                  matchFailed("[\\-\\u2013\\u2014]");
                }
              }
              if (result14 !== null) {
                var result15 = parse_sp();
                if (result15 !== null) {
                  var result13 = [result14, result15];
                } else {
                  var result13 = null;
                  pos = savedPos4;
                }
              } else {
                var result13 = null;
                pos = savedPos4;
              }
              if (result13 !== null) {
                var result3 = result13;
              } else {
                var savedPos3 = pos;
                if (input.substr(pos, 7) === "through") {
                  var result11 = "through";
                  pos += 7;
                } else {
                  var result11 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"through\"");
                  }
                }
                if (result11 !== null) {
                  var result12 = parse_sp();
                  if (result12 !== null) {
                    var result10 = [result11, result12];
                  } else {
                    var result10 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result10 = null;
                  pos = savedPos3;
                }
                if (result10 !== null) {
                  var result3 = result10;
                } else {
                  var savedPos2 = pos;
                  if (input.substr(pos, 4) === "thru") {
                    var result8 = "thru";
                    pos += 4;
                  } else {
                    var result8 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"thru\"");
                    }
                  }
                  if (result8 !== null) {
                    var result9 = parse_sp();
                    if (result9 !== null) {
                      var result7 = [result8, result9];
                    } else {
                      var result7 = null;
                      pos = savedPos2;
                    }
                  } else {
                    var result7 = null;
                    pos = savedPos2;
                  }
                  if (result7 !== null) {
                    var result3 = result7;
                  } else {
                    var savedPos1 = pos;
                    if (input.substr(pos, 2) === "to") {
                      var result5 = "to";
                      pos += 2;
                    } else {
                      var result5 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"to\"");
                      }
                    }
                    if (result5 !== null) {
                      var result6 = parse_sp();
                      if (result6 !== null) {
                        var result4 = [result5, result6];
                      } else {
                        var result4 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result4 = null;
                      pos = savedPos1;
                    }
                    if (result4 !== null) {
                      var result3 = result4;
                    } else {
                      var result3 = null;;
                    };
                  };
                };
              }
            }
          } else {
            var result2 = null;
          }
          if (result2 !== null) {
            var result0 = [result1, result2];
          } else {
            var result0 = null;
            pos = savedPos0;
          }
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_title() {
        var cacheKey = 'title@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["title"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result8 = parse_cv_sep();
          if (result8 !== null) {
            var result6 = result8;
          } else {
            var result7 = parse_sequence_sep();
            if (result7 !== null) {
              var result6 = result7;
            } else {
              var result6 = null;;
            };
          }
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            if (input.substr(pos, 5) === "title") {
              var result5 = "title";
              pos += 5;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\"title\"");
              }
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {type:"title", value: [val], "indices": [indices["title"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_in_book_of() {
        var cacheKey = 'in_book_of@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = parse_sp();
        if (result1 !== null) {
          if (input.substr(pos, 4) === "from") {
            var result14 = "from";
            pos += 4;
          } else {
            var result14 = null;
            if (reportMatchFailures) {
              matchFailed("\"from\"");
            }
          }
          if (result14 !== null) {
            var result2 = result14;
          } else {
            if (input.substr(pos, 2) === "of") {
              var result13 = "of";
              pos += 2;
            } else {
              var result13 = null;
              if (reportMatchFailures) {
                matchFailed("\"of\"");
              }
            }
            if (result13 !== null) {
              var result2 = result13;
            } else {
              if (input.substr(pos, 2) === "in") {
                var result12 = "in";
                pos += 2;
              } else {
                var result12 = null;
                if (reportMatchFailures) {
                  matchFailed("\"in\"");
                }
              }
              if (result12 !== null) {
                var result2 = result12;
              } else {
                var result2 = null;;
              };
            };
          }
          if (result2 !== null) {
            var result3 = parse_sp();
            if (result3 !== null) {
              var savedPos1 = pos;
              if (input.substr(pos, 3) === "the") {
                var result6 = "the";
                pos += 3;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"the\"");
                }
              }
              if (result6 !== null) {
                var result7 = parse_sp();
                if (result7 !== null) {
                  if (input.substr(pos, 4) === "book") {
                    var result8 = "book";
                    pos += 4;
                  } else {
                    var result8 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"book\"");
                    }
                  }
                  if (result8 !== null) {
                    var result9 = parse_sp();
                    if (result9 !== null) {
                      if (input.substr(pos, 2) === "of") {
                        var result10 = "of";
                        pos += 2;
                      } else {
                        var result10 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"of\"");
                        }
                      }
                      if (result10 !== null) {
                        var result11 = parse_sp();
                        if (result11 !== null) {
                          var result5 = [result6, result7, result8, result9, result10, result11];
                        } else {
                          var result5 = null;
                          pos = savedPos1;
                        }
                      } else {
                        var result5 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result5 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result5 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result5 = null;
                  pos = savedPos1;
                }
              } else {
                var result5 = null;
                pos = savedPos1;
              }
              var result4 = result5 !== null ? result5 : '';
              if (result4 !== null) {
                var result0 = [result1, result2, result3, result4];
              } else {
                var result0 = null;
                pos = savedPos0;
              }
            } else {
              var result0 = null;
              pos = savedPos0;
            }
          } else {
            var result0 = null;
            pos = savedPos0;
          }
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_abbrev() {
        var cacheKey = 'abbrev@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = parse_sp();
        if (result1 !== null) {
          if (input.substr(pos, 1) === ".") {
            var result2 = ".";
            pos += 1;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result2 !== null) {
            var savedPos1 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            var savedPos2 = pos;
            var result5 = parse_sp();
            if (result5 !== null) {
              if (input.substr(pos, 1) === ".") {
                var result6 = ".";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\".\"");
                }
              }
              if (result6 !== null) {
                var result7 = parse_sp();
                if (result7 !== null) {
                  if (input.substr(pos, 1) === ".") {
                    var result8 = ".";
                    pos += 1;
                  } else {
                    var result8 = null;
                    if (reportMatchFailures) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result8 !== null) {
                    var result4 = [result5, result6, result7, result8];
                  } else {
                    var result4 = null;
                    pos = savedPos2;
                  }
                } else {
                  var result4 = null;
                  pos = savedPos2;
                }
              } else {
                var result4 = null;
                pos = savedPos2;
              }
            } else {
              var result4 = null;
              pos = savedPos2;
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result4 === null) {
              var result3 = '';
            } else {
              var result3 = null;
              pos = savedPos1;
            }
            if (result3 !== null) {
              var result0 = [result1, result2, result3];
            } else {
              var result0 = null;
              pos = savedPos0;
            }
          } else {
            var result0 = null;
            pos = savedPos0;
          }
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_translation_sequence_enclosed() {
        var cacheKey = 'translation_sequence_enclosed@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["translation_sequence_enclosed"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_sp();
          if (result4 !== null) {
            if (input.substr(pos).match(/^[([]/) !== null) {
              var result5 = input.charAt(pos);
              pos++;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("[([]");
              }
            }
            if (result5 !== null) {
              var result6 = parse_sp();
              if (result6 !== null) {
                var savedPos2 = pos;
                var result10 = parse_translation();
                if (result10 !== null) {
                  var result11 = [];
                  var savedPos3 = pos;
                  var result13 = parse_sequence_sep();
                  if (result13 !== null) {
                    var result14 = parse_translation();
                    if (result14 !== null) {
                      var result12 = [result13, result14];
                    } else {
                      var result12 = null;
                      pos = savedPos3;
                    }
                  } else {
                    var result12 = null;
                    pos = savedPos3;
                  }
                  while (result12 !== null) {
                    result11.push(result12);
                    var savedPos3 = pos;
                    var result13 = parse_sequence_sep();
                    if (result13 !== null) {
                      var result14 = parse_translation();
                      if (result14 !== null) {
                        var result12 = [result13, result14];
                      } else {
                        var result12 = null;
                        pos = savedPos3;
                      }
                    } else {
                      var result12 = null;
                      pos = savedPos3;
                    }
                  }
                  if (result11 !== null) {
                    var result7 = [result10, result11];
                  } else {
                    var result7 = null;
                    pos = savedPos2;
                  }
                } else {
                  var result7 = null;
                  pos = savedPos2;
                }
                if (result7 !== null) {
                  var result8 = parse_sp();
                  if (result8 !== null) {
                    if (input.substr(pos).match(/^[)\]]/) !== null) {
                      var result9 = input.charAt(pos);
                      pos++;
                    } else {
                      var result9 = null;
                      if (reportMatchFailures) {
                        matchFailed("[)\\]]");
                      }
                    }
                    if (result9 !== null) {
                      var result1 = [result3, result4, result5, result6, result7, result8, result9];
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "translation_sequence", "value": val, "indices": [indices["translation_sequence_enclosed"], pos - 1]} })(result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_translation_sequence() {
        var cacheKey = 'translation_sequence@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["translation_sequence"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var result4 = parse_sp();
          if (result4 !== null) {
            var savedPos4 = pos;
            if (input.substr(pos, 1) === ",") {
              var result13 = ",";
              pos += 1;
            } else {
              var result13 = null;
              if (reportMatchFailures) {
                matchFailed("\",\"");
              }
            }
            if (result13 !== null) {
              var result14 = parse_sp();
              if (result14 !== null) {
                var result12 = [result13, result14];
              } else {
                var result12 = null;
                pos = savedPos4;
              }
            } else {
              var result12 = null;
              pos = savedPos4;
            }
            var result5 = result12 !== null ? result12 : '';
            if (result5 !== null) {
              var savedPos2 = pos;
              var result7 = parse_translation();
              if (result7 !== null) {
                var result8 = [];
                var savedPos3 = pos;
                var result10 = parse_sequence_sep();
                if (result10 !== null) {
                  var result11 = parse_translation();
                  if (result11 !== null) {
                    var result9 = [result10, result11];
                  } else {
                    var result9 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result9 = null;
                  pos = savedPos3;
                }
                while (result9 !== null) {
                  result8.push(result9);
                  var savedPos3 = pos;
                  var result10 = parse_sequence_sep();
                  if (result10 !== null) {
                    var result11 = parse_translation();
                    if (result11 !== null) {
                      var result9 = [result10, result11];
                    } else {
                      var result9 = null;
                      pos = savedPos3;
                    }
                  } else {
                    var result9 = null;
                    pos = savedPos3;
                  }
                }
                if (result8 !== null) {
                  var result6 = [result7, result8];
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
              } else {
                var result6 = null;
                pos = savedPos2;
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "translation_sequence", "value": val, "indices": [indices["translation_sequence"], pos - 1]} })(result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_translation() {
        var cacheKey = 'translation@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["translation"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          if (input.substr(pos, 1) === "") {
            var result4 = "";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          if (result4 !== null) {
            var result5 = parse_any_integer();
            if (result5 !== null) {
              if (input.substr(pos, 1) === "") {
                var result6 = "";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"\"");
                }
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "translation", "value": val.value, "indices": [indices["translation"], pos - 1]} })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_integer() {
        var cacheKey = 'integer@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["integer"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          var savedPos3 = pos;
          if (input.substr(pos).match(/^[0-9]/) !== null) {
            var result9 = input.charAt(pos);
            pos++;
          } else {
            var result9 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9]");
            }
          }
          if (result9 !== null) {
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result13 = input.charAt(pos);
              pos++;
            } else {
              var result13 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
            var result10 = result13 !== null ? result13 : '';
            if (result10 !== null) {
              if (input.substr(pos).match(/^[0-9]/) !== null) {
                var result12 = input.charAt(pos);
                pos++;
              } else {
                var result12 = null;
                if (reportMatchFailures) {
                  matchFailed("[0-9]");
                }
              }
              var result11 = result12 !== null ? result12 : '';
              if (result11 !== null) {
                var result4 = [result9, result10, result11];
              } else {
                var result4 = null;
                pos = savedPos3;
              }
            } else {
              var result4 = null;
              pos = savedPos3;
            }
          } else {
            var result4 = null;
            pos = savedPos3;
          }
          if (result4 !== null) {
            var savedPos2 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result8 = input.charAt(pos);
              pos++;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
            if (result8 !== null) {
              var result6 = result8;
            } else {
              if (input.substr(pos, 4) === ",000") {
                var result7 = ",000";
                pos += 4;
              } else {
                var result7 = null;
                if (reportMatchFailures) {
                  matchFailed("\",000\"");
                }
              }
              if (result7 !== null) {
                var result6 = result7;
              } else {
                var result6 = null;;
              };
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result6 === null) {
              var result5 = '';
            } else {
              var result5 = null;
              pos = savedPos2;
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [indices["integer"], pos - 1]} })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_any_integer() {
        var cacheKey = 'any_integer@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["any_integer"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          if (input.substr(pos).match(/^[0-9]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9]");
            }
          }
          if (result5 !== null) {
            var result4 = [];
            while (result5 !== null) {
              result4.push(result5);
              if (input.substr(pos).match(/^[0-9]/) !== null) {
                var result5 = input.charAt(pos);
                pos++;
              } else {
                var result5 = null;
                if (reportMatchFailures) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            var result4 = null;
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [indices["any_integer"], pos - 1]} })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_word() {
        var cacheKey = 'word@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = (function() {indices["word"] = pos; return true})() ? '' : null;
        if (result3 !== null) {
          if (input.substr(pos).match(/^[^]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[^]");
            }
          }
          if (result5 !== null) {
            var result4 = [];
            while (result5 !== null) {
              result4.push(result5);
              if (input.substr(pos).match(/^[^]/) !== null) {
                var result5 = input.charAt(pos);
                pos++;
              } else {
                var result5 = null;
                if (reportMatchFailures) {
                  matchFailed("[^]");
                }
              }
            }
          } else {
            var result4 = null;
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(val) { return {"type": "word", "value": val.join(""), "indices": [indices["word"], pos - 1]} })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_sp() {
        var cacheKey = 'sp@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result1 = parse_space();
        var result0 = result1 !== null ? result1 : '';
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_space() {
        var cacheKey = 'space@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos).match(/^[\s\u00a0*]/) !== null) {
          var result1 = input.charAt(pos);
          pos++;
        } else {
          var result1 = null;
          if (reportMatchFailures) {
            matchFailed("[\\s\\u00a0*]");
          }
        }
        if (result1 !== null) {
          var result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (input.substr(pos).match(/^[\s\u00a0*]/) !== null) {
              var result1 = input.charAt(pos);
              pos++;
            } else {
              var result1 = null;
              if (reportMatchFailures) {
                matchFailed("[\\s\\u00a0*]");
              }
            }
          }
        } else {
          var result0 = null;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      var indices = {}
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

}).call(this);

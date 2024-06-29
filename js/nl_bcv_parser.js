(function() {
  // This class takes a string and identifies Bible passage references in that string. It's designed to handle how people actually type Bible passages and tries fairly hard to make sense of dubious possibilities.

  // The aggressiveness is tunable, to a certain extent, using the below `options`. It's probably too aggressive for general text parsing (the "is 2" in "There is 2 much" becomes "Isa.2", for example).

  // Export to whatever the current context is.
  var bcv_parser, bcv_passage, bcv_utils, root,
    hasProp = {}.hasOwnProperty;

  root = this;

  bcv_parser = (function() {
    class bcv_parser {
      // Remember default options for later use.
      constructor() {
        var key, ref, val;
        this.options = {};
        ref = bcv_parser.prototype.options;
        for (key in ref) {
          if (!hasProp.call(ref, key)) continue;
          val = ref[key];
          this.options[key] = val;
        }
        // If we've changed the versification system, make sure previous object invocations don't leak.
        this.versification_system(this.options.versification_system);
      }

      // ## Parse-Related Functions
      // Parse a string and prepare the object for further interrogation, depending on what's needed.
      parse(s) {
        this.reset();
        this.s = s;
        // Replace any control characters already in the string.
        s = this.replace_control_characters(s);
        // Get a string representation suitable for passing to the parser.
        [s, this.passage.books] = this.match_books(s);
        // Replace potential BCVs one at a time to reduce processing time on long strings.
        [this.entities] = this.match_passages(s);
        return this;
      }

      // Parse a string and prepare the object for further interrogation, depending on what's needed. The second argument is a string that serves as the context for the first argument. If there's a valid partial match at the beginning of the first argument, then it will parse it using the supplied `context`. For example, `parse_string_with_context("verse 2", "Genesis 3").osis()` = `Gen.3.2`. You'd use this when you have some text that looks like it's a partial reference, and you already know the context.
      parse_with_context(s, context) {
        var entities;
        this.reset();
        [context, this.passage.books] = this.match_books(this.replace_control_characters(context));
        [entities, context] = this.match_passages(context);
        this.reset();
        this.s = s;
        // Replace any control characters already in the string.
        s = this.replace_control_characters(s);
        // Get a string representation suitable for passing to the parser.
        [s, this.passage.books] = this.match_books(s);
        this.passage.books.push({
          value: "",
          parsed: [],
          start_index: 0,
          type: "context",
          context: context
        });
        // Reconstruct the string, adding in the context. Because we've already called `match_books`, the resulting offsets will reflect the original string and not the new string.
        s = "\x1f" + (this.passage.books.length - 1) + "/9\x1f" + s;
        // Replace potential BCVs one at a time to reduce processing time on long strings.
        [this.entities] = this.match_passages(s);
        return this;
      }

      // If we have a new string to parse, reset any values from previous parses.
      reset() {
        this.s = "";
        this.entities = [];
        if (this.passage) {
          this.passage.books = [];
          return this.passage.indices = {};
        } else {
          this.passage = new bcv_passage();
          this.passage.options = this.options;
          return this.passage.translations = this.translations;
        }
      }

      // ## Options-Related Functions
      // Override default options.
      set_options(options) {
        var key, val;
        for (key in options) {
          if (!hasProp.call(options, key)) continue;
          val = options[key];
          // The drawback with this approach is that calling `include_apocrypha`, `versification_system`, and `case_sensitive` could regenerate `@regexps.books` three times.
          if (key === "include_apocrypha" || key === "versification_system" || key === "case_sensitive") {
            this[key](val);
          } else {
            this.options[key] = val;
          }
        }
        return this;
      }

      // Whether to use books and abbreviations from the Apocrypha. Takes a boolean argument: `true` to include the Apocrypha and `false` to not. Defaults to `false`. Returns the `bcv_parser` object.
      include_apocrypha(arg) {
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
          // If the `Ps` array in the `chapters` object doesn't exist, create it so that we can add Ps 151 to the end of it.
          if ((base = this.translations[translation]).chapters == null) {
            base.chapters = {};
          }
          if ((base1 = this.translations[translation].chapters)["Ps"] == null) {
            base1["Ps"] = bcv_utils.shallow_clone_array(this.translations["default"].chapters["Ps"]);
          }
          // Add Ps 151 to the end of Psalms. The assumption here is that Ps151 always only is one chapter long.
          if (arg === true) {
            if (this.translations[translation].chapters["Ps151"] != null) {
              verse_count = this.translations[translation].chapters["Ps151"][0];
            } else {
              verse_count = this.translations["default"].chapters["Ps151"][0];
            }
            this.translations[translation].chapters["Ps"][150] = verse_count;
          } else {
            if (this.translations[translation].chapters["Ps"].length === 151) {
              // Remove Ps 151 from the end of Psalms.
              this.translations[translation].chapters["Ps"].pop();
            }
          }
        }
        return this;
      }

      // Use an alternate versification system. Takes a string argument; the built-in options are: `default` to use KJV-style versification and `vulgate` to use the Vulgate (Greek) Psalm numbering. English offers several other versification systems; see the Readme for details.
      versification_system(system) {
        var base, base1, base2, book, chapter_list, ref, ref1;
        if (!((system != null) && (this.translations[system] != null))) {
          return this;
        }
        // If we've already changed the `versification_system` once, we need to do some cleanup before we change it to something else.
        if (this.translations.alternates.default != null) {
          // If we're changing to the default from something else, make sure we reset it to the correct values.
          if (system === "default") {
            if (this.translations.alternates.default.order != null) {
              this.translations.default.order = bcv_utils.shallow_clone(this.translations.alternates.default.order);
            }
            ref = this.translations.alternates.default.chapters;
            for (book in ref) {
              if (!hasProp.call(ref, book)) continue;
              chapter_list = ref[book];
              this.translations.default.chapters[book] = bcv_utils.shallow_clone_array(chapter_list);
            }
          } else {
            // Make sure the `versification_system` is reset to the default before applying any changes--alternate systems only include differences from the default.
            this.versification_system("default");
          }
        }
        if ((base = this.translations.alternates).default == null) {
          base.default = {
            order: null,
            chapters: {}
          };
        }
        // If we're updating the book order (e.g., to mix the Apocrypha into the Old Testament)...
        if (system !== "default" && (this.translations[system].order != null)) {
          // Save the existing default order so we can get it back later if necessary. We want to do everything nondestructively.
          if ((base1 = this.translations.alternates.default).order == null) {
            base1.order = bcv_utils.shallow_clone(this.translations.default.order);
          }
          // The `order` key should always contain the full order; too many things can go wrong if we try to merge the old order and the new one.
          this.translations.default.order = bcv_utils.shallow_clone(this.translations[system].order);
        }
        // If we're updating the number of chapters in a book or the number of verses in a chapter...
        if (system !== "default" && (this.translations[system].chapters != null)) {
          ref1 = this.translations[system].chapters;
          for (book in ref1) {
            if (!hasProp.call(ref1, book)) continue;
            chapter_list = ref1[book];
            // Save the existing default order so we can get it back later. Only set it the first time.
            if ((base2 = this.translations.alternates.default.chapters)[book] == null) {
              base2[book] = bcv_utils.shallow_clone_array(this.translations.default.chapters[book]);
            }
            this.translations.default.chapters[book] = bcv_utils.shallow_clone_array(chapter_list);
          }
        }
        // Depending on the order of operations, the cloned list could be inconsistent with the current state. For example, if we called `versification_system`, we've cached 150 Psalms. If we then call `include_apocrypha(true)`, we now have 151 Psalms. If we then call `versification_system` again, we're back, incorrectly, to 150 Psalms because that's what was cached.
        this.options.versification_system = system;
        this.include_apocrypha(this.options.include_apocrypha);
        return this;
      }

      // Whether to treat books as case-sensitive. Valid values are `none` and `books`.
      case_sensitive(arg) {
        if (!((arg != null) && (arg === "none" || arg === "books"))) {
          return this;
        }
        if (arg === this.options.case_sensitive) {
          // If nothing is changing, don't bother continuing
          return this;
        }
        this.options.case_sensitive = arg;
        this.regexps.books = this.regexps.get_books(this.options.include_apocrypha, arg);
        return this;
      }

      // ## Administrative Functions
      // Return translation information so that we don't have to reach into semi-private objects to grab the data we need.
      translation_info(new_translation = "default") {
        var book, chapter_list, id, old_translation, out, ref, ref1, ref2;
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
          order: bcv_utils.shallow_clone(this.translations.default.order)
        };
        ref1 = this.translations.default.chapters;
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
      }

      // ## Parsing-Related Functions
      // Replace control characters and spaces since we replace books with a specific character pattern. The string changes, but the length stays the same so that indices remain valid. If we want to use Latin numbers rather than non-Latin ones, replace them here.
      replace_control_characters(s) {
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
      }

      // Find and replace instances of Bible books.
      match_books(s) {
        var book, books, has_replacement, k, len, ref;
        books = [];
        ref = this.regexps.books;
        // Replace all book strings.
        for (k = 0, len = ref.length; k < len; k++) {
          book = ref[k];
          has_replacement = false;
          // Using array concatenation instead of replacing text directly didn't offer performance improvements in tests of the approach.
          s = s.replace(book.regexp, function(full, prev, bk) {
            var extra;
            has_replacement = true;
            // `value` contains the raw string; `book.osis` is the osis value for the book.
            books.push({
              value: bk,
              parsed: book.osis,
              type: "book"
            });
            extra = book.extra != null ? `/${book.extra}` : "";
            return `${prev}\x1f${books.length - 1}${extra}\x1f`;
          });
          // If we've already replaced all possible books in the string, we don't need to check any further.
          if (has_replacement === true && /^[\s\x1f\d:.,;\-\u2013\u2014]+$/.test(s)) {
            break;
          }
        }
        // Replace translations.
        s = s.replace(this.regexps.translations, function(match) {
          books.push({
            value: match,
            parsed: match.toLowerCase(),
            type: "translation"
          });
          return `\x1e${books.length - 1}\x1e`;
        });
        return [s, this.get_book_indices(books, s)];
      }

      // Get the string index for all the books / translations, adding the start index as a new key.
      get_book_indices(books, s) {
        var add_index, match, re;
        add_index = 0;
        re = /([\x1f\x1e])(\d+)(?:\/\d+)?\1/g; // opening book or translation
        // the number
        // optional extra identifier
        // closing delimeter
        while (match = re.exec(s)) {
          // Keep track of the actual start index.
          books[match[2]].start_index = match.index + add_index;
          // Add the difference between the real length of the book and what we replaced it with (`match[0]` is the replacement).
          add_index += books[match[2]].value.length - match[0].length;
        }
        return books;
      }

      // Create an array of all the potential bcv matches in the string.
      match_passages(s) {
        var accum, book_id, entities, full, match, next_char, original_part_length, part, passage, post_context, regexp_index_adjust, start_index_adjust;
        entities = [];
        post_context = {};
        while (match = this.regexps.escaped_passage.exec(s)) {
          // * `match[0]` includes the preceding character (if any) for bounding.
          // * `match[1]` is the full match minus the character preceding the match used for bounding.
          // * `match[2]` is the book id.
          [full, part, book_id] = match;
          // Adjust the `index` to use the `part` offset rather than the `full` offset. We use it below for `captive_end_digits`.
          original_part_length = part.length;
          match.index += full.length - original_part_length;
          // Remove most three+-character digits at the end; they won't match.
          if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
            part = part.replace(/\s+\d+\s*$/, "");
          }
          // Clean up the end of the match to avoid irrelevant context.
          if (!/[\d\x1f\x1e)]$/.test(part)) {
            // Remove superfluous characters from the end of the match.
            part = this.replace_match_end(part);
          }
          if (this.options.captive_end_digits_strategy === "delete") {
            // If the match ends with a space+digit and is immediately followed by a word character, ignore the space+digit: `Matt 1, 2Text`.
            next_char = match.index + part.length;
            if (s.length > next_char && /^\w/.test(s.substr(next_char, 1))) {
              part = part.replace(/[\s*]+\d+$/, "");
            }
            // If the match ends with a translation indicator, remove any numbers afterward. This situation generally occurs in cases like, "Ps 1:1 ESV 1 Blessed is...", where the final `1` is a verse number that's part of the text.
            part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
          }
          // Though PEG.js doesn't have to be case-sensitive, using the case-insensitive feature involves some repeated processing. By lower-casing here, we only pay the cost once. The grammar for words like "also" is case-sensitive; we can safely lowercase ascii letters without changing indices. We don't just call .toLowerCase() because it could affect the length of the string if it contains certain characters; maintaining the indices is the most important thing.
          part = part.replace(/[A-Z]+/g, function(capitals) {
            return capitals.toLowerCase();
          });
          // If we're in a chapter-book situation, the first character won't be a book control character, which would throw off the `start_index`.
          start_index_adjust = part.substr(0, 1) === "\x1f" ? 0 : part.split("\x1f")[0].length;
          // * `match` is important for the length and whether it contains control characters, neither of which we've changed inconsistently with the original string. The `part` may be shorter than originally matched, but that's only to remove unneeded characters at the end.
          // * `grammar` is the external PEG parser. The `@options.punctuation_strategy` determines which punctuation is used for sequences and `cv` separators.
          passage = {
            value: grammar.parse(part, {
              punctuation_strategy: this.options.punctuation_strategy
            }),
            type: "base",
            start_index: this.passage.books[book_id].start_index - start_index_adjust,
            match: part
          };
          // Are we looking at a single book on its own that could be part of a range like "1-2 Sam"?
          // Either it's on its own or a translation sequence follows it, making it effectively on its own.
          if (this.options.book_alone_strategy === "full" && this.options.book_range_strategy === "include" && passage.value[0].type === "b" && (passage.value.length === 1 || (passage.value.length > 1 && passage.value[1].type === "translation_sequence")) && start_index_adjust === 0 && (this.passage.books[book_id].parsed.length === 1 || (this.passage.books[book_id].parsed.length > 1 && this.passage.books[book_id].parsed[1].type === "translation")) && /^[234]/.test(this.passage.books[book_id].parsed[0])) {
            this.create_book_range(s, passage, book_id);
          }
          // Handle each passage individually to prevent context leakage (e.g., translations back-propagating through unrelated entities).
          [accum, post_context] = this.passage.handle_obj(passage);
          entities = entities.concat(accum);
          // Move the next RegExp iteration to start earlier if we didn't use everything we thought we were going to.
          regexp_index_adjust = this.adjust_regexp_end(accum, original_part_length, part.length);
          if (regexp_index_adjust > 0) {
            this.regexps.escaped_passage.lastIndex -= regexp_index_adjust;
          }
        }
        return [entities, post_context];
      }

      // Handle the objects returned from the grammar to produce entities for further processing. We may need to adjust the `RegExp.lastIndex` if we discarded characters from the end of the match or if, after parsing, we're ignoring some of them--especially with ending parenthetical statements like "Luke 8:1-3; 24:10 (and Matthew 14:1-12 and Luke 23:7-12 for background)".
      adjust_regexp_end(accum, old_length, new_length) {
        var regexp_index_adjust;
        regexp_index_adjust = 0;
        if (accum.length > 0) {
          // `accum` uses an off-by-one end index compared to the RegExp object. "and Psa3" means `lastIndex` = 8, `old_length` and `new_length` are both 4 (omitting "and " and leaving "Psa3"), and the `accum` end index is 3. We end up with 4 - 3 - 1 = 0, or no adjustment. Compare "and Psa3 and", where the last " and" is originally considered part of the regexp. In this case, `regexp_index_adjust` is 4: 8 ("Psa3 and") - 3 ("Psa3") - 1.
          regexp_index_adjust = old_length - accum[accum.length - 1].indices[1] - 1;
        } else if (old_length !== new_length) {
          regexp_index_adjust = old_length - new_length;
        }
        return regexp_index_adjust;
      }

      // Remove unnecessary characters from the end of the match.
      replace_match_end(part) {
        var match, remove;
        // Split the string on valid ending characters. Remove whatever's leftover at the end of the string. It would be easier to do `part.split(@regexps.match_end_split).pop()`, but IE doesn't handle empty strings at the end.
        remove = part.length;
        while (match = this.regexps.match_end_split.exec(part)) {
          remove = match.index + match[0].length;
        }
        if (remove < part.length) {
          part = part.substr(0, remove);
        }
        return part;
      }

      // If a book is on its own, check whether it's preceded by something that indicates it's a book range like "1-2 Samuel".
      create_book_range(s, passage, book_id) {
        var cases, i, k, limit, prev, range_regexp, ref;
        cases = [bcv_parser.prototype.regexps.first, bcv_parser.prototype.regexps.second, bcv_parser.prototype.regexps.third];
        limit = parseInt(this.passage.books[book_id].parsed[0].substr(0, 1), 10);
        for (i = k = 1, ref = limit; (1 <= ref ? k < ref : k > ref); i = 1 <= ref ? ++k : --k) {
          range_regexp = i === limit - 1 ? bcv_parser.prototype.regexps.range_and : bcv_parser.prototype.regexps.range_only;
          prev = s.match(RegExp(`(?:^|\\W)(${cases[i - 1]}\\s*${range_regexp}\\s*)\\x1f${book_id}\\x1f`, "i"));
          if (prev != null) {
            return this.add_book_range_object(passage, prev, i);
          }
        }
        return false;
      }

      // Create a fake object that can be parsed to show the correct result.
      add_book_range_object(passage, prev, start_book_number) {
        var i, k, length, ref, ref1, results;
        length = prev[1].length;
        passage.value[0] = {
          type: "b_range_pre",
          value: [
            {
              type: "b_pre",
              value: start_book_number.toString(),
              indices: [prev.index,
            prev.index + length]
            },
            passage.value[0]
          ],
          indices: [0, passage.value[0].indices[1] + length]
        };
        // Adjust the indices of the original result so they reflect the new content.
        passage.value[0].value[1].indices[0] += length;
        passage.value[0].value[1].indices[1] += length;
        // These two are the most important ones; the `absolute_indices` function uses them.
        passage.start_index -= length;
        passage.match = prev[1] + passage.match;
        if (passage.value.length === 1) {
          return;
        }
// If there are subsequent objects, also adjust their offsets.
        results = [];
        for (i = k = 1, ref = passage.value.length; (1 <= ref ? k < ref : k > ref); i = 1 <= ref ? ++k : --k) {
          if (passage.value[i].value == null) {
            continue;
          }
          // If it's an `integer` type, `passage.value[i].value` is a scalar rather than an object, so we only need to adjust the indices for the top-level object.
          if (((ref1 = passage.value[i].value[0]) != null ? ref1.indices : void 0) != null) {
            passage.value[i].value[0].indices[0] += length;
            passage.value[i].value[0].indices[1] += length;
          }
          passage.value[i].indices[0] += length;
          results.push(passage.value[i].indices[1] += length);
        }
        return results;
      }

      // ## Output-Related Functions
      // Return a single OSIS string (comma-separated) for all the references in the whole input string.
      osis() {
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
      }

      // Return an array of `[OSIS, TRANSLATIONS]` for each reference (combined according to `options`).
      osis_and_translations() {
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
      }

      // Return an array of `{osis: OSIS, indices:[START, END], translations: [TRANSLATIONS]}` objects for each reference (combined according to `options`).
      osis_and_indices() {
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
      }

      // Return all objects, probably for additional processing.
      parsed_entities() {
        var entity, entity_id, i, k, l, last_i, len, len1, length, m, n, osis, osises, out, passage, ref, ref1, ref2, ref3, strings, translation, translation_alias, translation_osis, translations;
        out = [];
        for (entity_id = k = 0, ref = this.entities.length; (0 <= ref ? k < ref : k > ref); entity_id = 0 <= ref ? ++k : --k) {
          entity = this.entities[entity_id];
          // Be sure to include any translation identifiers in the indices we report back, but only if the translation immediately follows the previous entity.
          if (entity.type && entity.type === "translation_sequence" && out.length > 0 && entity_id === out[out.length - 1].entity_id + 1) {
            out[out.length - 1].indices[1] = entity.absolute_indices[1];
          }
          if (entity.passages == null) {
            continue;
          }
          if ((entity.type === "b" && this.options.book_alone_strategy === "ignore") || (entity.type === "b_range" && this.options.book_range_strategy === "ignore") || entity.type === "context") {
            continue;
          }
          // A given entity, even if part of a sequence, always only has one set of translations associated with it.
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
          for (i = m = 0, ref3 = length; (0 <= ref3 ? m < ref3 : m > ref3); i = 0 <= ref3 ? ++m : --m) {
            passage = entity.passages[i];
            // The `type` is usually only set in a sequence.
            if (passage.type == null) {
              passage.type = entity.type;
            }
            if (passage.valid.valid === false) {
              if (this.options.invalid_sequence_strategy === "ignore" && entity.type === "sequence") {
                this.snap_sequence("ignore", entity, osises, i, length);
              }
              if (this.options.invalid_passage_strategy === "ignore") {
                // Stop here if we're ignoring invalid passages.
                continue;
              }
            }
            // If indicated in `@options`, exclude stray start/end books, resetting the parent indices as needed.
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
            // Don't return an empty object.
            continue;
          }
          if (osises.length > 1 && this.options.consecutive_combination_strategy === "combine") {
            osises = this.combine_consecutive_passages(osises, translation_alias);
          }
          // Add the osises array to the existing array.
          if (this.options.sequence_combination_strategy === "separate") {
            out = out.concat(osises);
          } else {
            // Add the OSIS string and some data to the array.
            strings = [];
            last_i = osises.length - 1;
            if ((osises[last_i].enclosed_indices != null) && osises[last_i].enclosed_indices[1] >= 0) {
              // Adjust the end index to match a closing parenthesis when presented with `enclosed` entities. These entities always start mid-sequence (unless there's a book we're ignoring), so we don't need to worry about the start index.
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
      }

      to_osis(start, end, translation) {
        var osis, out;
        if ((end.c == null) && (end.v == null) && start.b === end.b && (start.c == null) && (start.v == null) && this.options.book_alone_strategy === "first_chapter") {
          // If it's just a book on its own, how we deal with it depends on whether we want to return just the first chapter or the complete book.
          end.c = 1;
        }
        osis = {
          start: "",
          end: ""
        };
        // If no start chapter or verse, assume the first possible.
        if (start.c == null) {
          start.c = 1;
        }
        if (start.v == null) {
          start.v = 1;
        }
        // If no end chapter or verse, assume the last possible. If it's a single-chapter book, always use the first chapter for consistency with other `passage_existence_strategy` results (which do respect the single-chapter length).
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
        // If it's a complete book or range of complete books and we want the shortest possible OSIS, return just the book names. The `end.c` and `end.v` equaling 999 is for when the `passage_existence_strategy` sets them to 999, indicating that we should treat it as a complete book or chapter.
        if (this.options.osis_compaction_strategy === "b" && start.c === 1 && start.v === 1 && ((end.c === 999 && end.v === 999) || (end.c === this.passage.translations[translation].chapters[end.b].length && this.options.passage_existence_strategy.indexOf("c") >= 0 && (end.v === 999 || (end.v === this.passage.translations[translation].chapters[end.b][end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0))))) {
          osis.start = start.b;
          osis.end = end.b;
        // If it's a complete chapter or range of complete chapters and we want a short OSIS, return just the books and chapters. We only care when `osis_compaction_strategy` isn't `bcv` (i.e., length 3) because `bcv` is always fully specified.
        } else if (this.options.osis_compaction_strategy.length <= 2 && start.v === 1 && (end.v === 999 || (end.v === this.passage.translations[translation].chapters[end.b][end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0))) {
          osis.start = start.b + "." + start.c.toString();
          osis.end = end.b + "." + end.c.toString();
        } else {
          // Otherwise, return the full BCV reference for both.
          osis.start = start.b + "." + start.c.toString() + "." + start.v.toString();
          osis.end = end.b + "." + end.c.toString() + "." + end.v.toString();
        }
        // If it's the same verse ("Gen.1.1-Gen.1.1"), chapter ("Gen.1-Gen.1") or book ("Gen-Gen"), return just the start so we don't end up with an empty range.
        if (osis.start === osis.end) {
          out = osis.start;
        } else {
          // Otherwise return the range.
          out = osis.start + "-" + osis.end;
        }
        if (start.extra != null) {
          out = start.extra + "," + out;
        }
        if (end.extra != null) {
          out += "," + end.extra;
        }
        return out;
      }

      // If we want to treat Ps151 as a book rather than a chapter, we have to do some gymnastics to make sure it returns properly.
      fix_ps151(start, end, translation) {
        var ref;
        // Ps151 doesn't necessarily get promoted into the translation chapter list because during the string parsing, we treat it as `Ps` rather than `Ps151`.
        if (translation !== "default" && (((ref = this.translations[translation]) != null ? ref.chapters["Ps151"] : void 0) == null)) {
          this.passage.promote_book_to_translation("Ps151", translation);
        }
        if (start.c === 151 && start.b === "Ps") {
          // If the whole range is in Ps151, we can just reset both sets of books and chapters; we don't have to worry about odd ranges.
          if (end.c === 151 && end.b === "Ps") {
            start.b = "Ps151";
            start.c = 1;
            end.b = "Ps151";
            return end.c = 1;
          } else {
            // This is the string we're going to prepend to our final output.
            // Otherwise, we generate the OSIS for Ps151 and then set the beginning of the range to the next book. We assume that the next book is Prov, which isn't necessarily the case. I'm not aware of a canon that doesn't place Prov after Ps, however.
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
          // This is the string we're going to append to the final output.
          // We know that end is in Ps151 and start is beforehand.
          end.extra = this.to_osis({
            b: "Ps151",
            c: 1,
            v: 1
          }, {
            b: "Ps151",
            c: 1,
            v: end.v
          }, translation);
          // Set the end of the range to be the end of Ps.150, which immediately precedes Ps151.
          end.c = 150;
          return end.v = this.passage.translations[translation].chapters["Ps"][149];
        }
      }

      // If we have the correct `option` set (checked before calling this function), merge passages that refer to sequential verses: Gen 1, 2 -> Gen 1-2. It works for any combination of books, chapters, and verses.
      combine_consecutive_passages(osises, translation) {
        var enclosed_sequence_start, has_enclosed, i, is_enclosed_last, k, last_i, osis, out, prev, prev_i, ref;
        out = [];
        prev = {};
        last_i = osises.length - 1;
        enclosed_sequence_start = -1;
        has_enclosed = false;
        for (i = k = 0, ref = last_i; (0 <= ref ? k <= ref : k >= ref); i = 0 <= ref ? ++k : --k) {
          osis = osises[i];
          if (osis.osis.length > 0) {
            prev_i = out.length - 1;
            is_enclosed_last = false;
            // Record the start index of the enclosed sequence for use in future iterations.
            if (osis.enclosed_indices[0] !== enclosed_sequence_start) {
              enclosed_sequence_start = osis.enclosed_indices[0];
            }
            // If we're in an enclosed sequence and it's either the last item in the sequence or the next item in the sequence isn't part of the same enclosed sequence, then we've reached the end of the enclosed sequence.
            if (enclosed_sequence_start >= 0 && (i === last_i || osises[i + 1].enclosed_indices[0] !== osis.enclosed_indices[0])) {
              is_enclosed_last = true;
              // We may need to adjust the indices later.
              has_enclosed = true;
            }
            // Pretend like the previous `end` and existing `start` don't exist.
            if (this.is_verse_consecutive(prev, osis.start, translation)) {
              out[prev_i].end = osis.end;
              // Set the enclosed indices if it's last or at the end of a sequence of enclosed indices. Otherwise only extend the indices to the actual indices--e.g., `Ps 117 (118, 120)`, should only extend to after `118`.
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
      }

      // If there's an enclosed reference--e.g., Ps 1 (2)--and we've combined consecutive passages in such a way that the enclosed reference is fully inside the sequence (i.e., if it starts before the enclosed sequence), then make sure the end index for the passage includes the necessary closing punctuation.
      snap_enclosed_indices(osises) {
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
      }

      // Given two fully specified objects (complete bcvs), find whether they're sequential.
      is_verse_consecutive(prev, check, translation) {
        var translation_order;
        if (prev.b == null) {
          return false;
        }
        // A translation doesn't always have an `order` set. If it doesn't, then use the default order.
        translation_order = this.passage.translations[translation].order != null ? this.passage.translations[translation].order : this.passage.translations.default.order;
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
      }

      // Snap the start/end index of the range when it includes a book on its own and `@options.book_range_strategy` is `ignore`.
      snap_range(entity, passage_i) {
        var entity_i, key, pluck, ref, source_entity, target_entity, temp, type;
        // If the book is at the start of the range, we want to ignore the first part of the range.
        if (entity.type === "b_range_start" || (entity.type === "sequence" && entity.passages[passage_i].type === "b_range_start")) {
          entity_i = 1;
          source_entity = "end";
          type = "b_range_start";
        } else {
          // If the book is at the end of the range, we want to ignore the end of the range.
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
            // This can be too long if a range is converted into a sequence where it ends with an open book range (`Matt 10-Rev`) that we want to ignore. At this point, the `passages` and `value` keys can get out-of-sync.
            passage_i = entity.value.length - 1;
          }
          pluck = this.passage.pluck(type, entity.value[passage_i]);
          // The `pluck` can be null if we've already overwritten its `type` in a previous recursion. This process is unusual, but can happen in "Proverbs 31:2. Vs 10 to dan".
          if (pluck != null) {
            temp = this.snap_range(pluck, 0);
            // Move the indices to exclude what we've omitted. We want to move it even if it isn't the last one in case there are multiple books at the end--this way it'll use the correct indices.
            if (passage_i === 0) {
              entity.absolute_indices[0] = temp.absolute_indices[0];
            } else {
              entity.absolute_indices[1] = temp.absolute_indices[1];
            }
          }
        } else {
          // If it's not a sequence, change the `type` and `absolute_indices` to exclude the book we're omitting.
          entity.original_type = entity.type;
          entity.type = entity.value[entity_i].type;
          entity.absolute_indices = [entity.value[entity_i].absolute_indices[0], entity.value[entity_i].absolute_indices[1]];
        }
        return entity;
      }

      // Snap the start/end index of the entity or surrounding passages when there's a lone book or invalid item in a sequence.
      snap_sequence(type, entity, osises, i, length) {
        var passage;
        passage = entity.passages[i];
        // If the passage is the first thing in the sequence and something is after it, snap the start index of the whole entity to the start index of the next item.

        // But we only want to do this if it's followed by a book (if it's "Matt, 5", we want to be sure to include "Matt" as part of the indices and bypass this step). We can tell if that's the case if the `type` of what follows starts with `b` or if it's a `range` starting in a different book. The tricky part occurs when we have several invalid references at the start (Matt 29, 30, Acts 1)--we need to find the first value that's a book. If there's a valid item before the next book, abort.
        if (passage.absolute_indices[0] === entity.absolute_indices[0] && i < length - 1 && this.get_snap_sequence_i(entity.passages, i, length) !== i) {
          entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0];
          this.remove_absolute_indices(entity.passages, i + 1);
        // If the passage is the last thing in a sequence (but not the only one), snap the entity end index to the end index of the previous valid item. To handle multiple items at the end, snap back to the last known good item if available.
        } else if (passage.absolute_indices[1] === entity.absolute_indices[1] && i > 0) {
          entity.absolute_indices[1] = osises.length > 0 ? osises[osises.length - 1].indices[1] : entity.passages[i - 1].absolute_indices[1];
        // Otherwise, if the next item doesn't start with a book, link the start index of the current passage to the next one because we're including the current passage as part of the next one. In "Eph. 4. Gen, Matt, 6", the `Matt, ` should be part of the `6`, but "Eph. 4. Gen, Matt, 1cor6" should exclude `Matt`.
        } else if (type === "book" && i < length - 1 && !this.starts_with_book(entity.passages[i + 1])) {
          entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0];
        }
        // Return something only for unit testing.
        return entity;
      }

      // Identify whether there are any valid items between the current item and the next book.
      get_snap_sequence_i(passages, i, length) {
        var j, k, ref, ref1;
        for (j = k = ref = i + 1, ref1 = length; (ref <= ref1 ? k < ref1 : k > ref1); j = ref <= ref1 ? ++k : --k) {
          if (this.starts_with_book(passages[j])) {
            return j;
          }
          if (passages[j].valid.valid) {
            return i;
          }
        }
        return i;
      }

      // Given a passage, does it start with a book? It never takes a sequence as an argument.
      starts_with_book(passage) {
        if (passage.type.substr(0, 1) === "b") {
          return true;
        }
        if ((passage.type === "range" || passage.type === "ff") && passage.start.type.substr(0, 1) === "b") {
          return true;
        }
        return false;
      }

      // Remove absolute indices from the given passage to the end of the sequence. We do this when we don't want to include the end of a sequence in the sequence (most likely because it's invalid or a book on its own).
      remove_absolute_indices(passages, i) {
        var end, k, len, passage, ref, start;
        if (passages[i].enclosed_absolute_indices[0] < 0) {
          return false;
        }
        [start, end] = passages[i].enclosed_absolute_indices;
        ref = passages.slice(i);
        for (k = 0, len = ref.length; k < len; k++) {
          passage = ref[k];
          if (passage.enclosed_absolute_indices[0] === start && passage.enclosed_absolute_indices[1] === end) {
            passage.enclosed_absolute_indices = [-1, -1];
          } else {
            break;
          }
        }
        return true;
      }

    };

    bcv_parser.prototype.s = "";

    bcv_parser.prototype.entities = [];

    bcv_parser.prototype.passage = null;

    bcv_parser.prototype.regexps = {};

    // ## Main Options
    bcv_parser.prototype.options = {
      // ### OSIS Output
      // * `combine`:  "Matt 5, 6, 7" -> "Matt.5-Matt.7".
      // * `separate`: "Matt 5, 6, 7" -> "Matt.5,Matt.6,Matt.7".
      consecutive_combination_strategy: "combine",
      // * `b`: OSIS refs get reduced to the shortest possible. "Gen.1.1-Gen.50.26" and "Gen.1-Gen.50" -> "Gen", while "Gen.1.1-Gen.2.25" -> "Gen.1-Gen.2".
      // * `bc`: OSIS refs get reduced to complete chapters if possible, but not whole books. "Gen.1.1-Gen.50.26" -> "Gen.1-Gen.50".
      // * `bcv`: OSIS refs always include the full book, chapter, and verse. "Gen.1" -> "Gen.1.1-Gen.1.31".
      osis_compaction_strategy: "b",
      // ### Sequence
      // * `ignore`: ignore any books on their own in sequences ("Gen Is 1" -> "Isa.1").
      // * `include`: any books that appear on their own get parsed according to `book_alone_strategy` ("Gen Is 1" means "Gen.1-Gen.50,Isa.1" if `book_alone_strategy` is `full` or `ignore`, or "Gen.1,Isa.1" if it's `first_chapter`).
      book_sequence_strategy: "ignore",
      // * `ignore`: "Matt 99, Gen 1" sequence index starts at the valid `Gen 1`.
      // * `include`: "Matt 99, Gen 1" sequence index starts at the invalid `Matt 99`.
      invalid_sequence_strategy: "ignore",
      // * `combine`: sequential references in the text are combined into a single comma-separated OSIS string: "Gen 1, 3" → `"Gen.1,Gen.3"`.
      // * `separate`: sequential references in the text are separated into an array of their component parts: "Gen 1, 3" → `["Gen.1", "Gen.3"]`.
      sequence_combination_strategy: "combine",
      // * `us`: commas separate sequences, periods separate chapters and verses. "Matt 1, 2. 4" → "Matt.1,Matt.2.4".
      // * `eu`: periods separate sequences, commas separate chapters and verses. "Matt 1, 2. 4" → "Matt.1.2,Matt.1.4".
      punctuation_strategy: "us",
      // ### Potentially Invalid Input
      // * `ignore`: Include only valid passages in `parsed_entities()`.
      // * `include`: Include invalid passages in `parsed_entities()` (they still don't have OSIS values).
      invalid_passage_strategy: "ignore",
      // * `ignore`: treat non-Latin digits the same as any other character.
      // * `replace`: replace non-Latin (0-9) numeric digits with Latin digits. This replacement occurs before any book substitution.
      non_latin_digits_strategy: "ignore",
      // * Include `b` in the string to validate book order ("Revelation to Genesis" is invalid).
      // * Include `c` in the string to validate chapter existence. If omitted, strings like "Genesis 51" (which doesn't exist) return as valid. Omitting `c` means that looking up full books will return `999` as the end chapter: "Genesis to Exodus" → "Gen.1-Exod.999".
      // * Include `v` in the string to validate verse existence. If omitted, strings like `Genesis 1:100` (which doesn't exist) return as valid. Omitting `v` means that looking up full chapters will return `999` as the end verse: "Genesis 1:2 to chapter 3" → "Gen.1.2-Gen.3.999".
      // * Tested values are `b`, `bc`, `bcv`, `bv`, `c`, `cv`, `v`, and `none`. In all cases, single-chapter books still respond as single-chapter books to allow treating strings like `Obadiah 2` as `Obad.1.2`.
      passage_existence_strategy: "bcv",
      // * `error`: zero chapters ("Matthew 0") are invalid.
      // * `upgrade`: zero chapters are upgraded to 1: "Matthew 0" -> "Matt.1".
      // Unlike `zero_verse_strategy`, chapter 0 isn't allowed.
      zero_chapter_strategy: "error",
      // * `error`: zero verses ("Matthew 5:0") are invalid.
      // * `upgrade`: zero verses are upgraded to 1: "Matthew 5:0" -> "Matt.5.1".
      // * `allow`: zero verses are kept as-is: "Matthew 5:0" -> "Matt.5.0". Some traditions use 0 for Psalm titles.
      zero_verse_strategy: "error",
      // * `chapter`: treat "Jude 1" as referring to the complete book of Jude: `Jude.1`. People almost always want this output when they enter this text in a search box.
      // * `verse`: treat "Jude 1" as referring to the first verse in Jude: `Jude.1.1`. If you're parsing specialized text that follows a style guide, you may want to set this option.
      single_chapter_1_strategy: "chapter",
      // ### Context
      // * `ignore`: any books that appear on their own don't get parsed as books ("Gen saw" doesn't trigger a match, but "Gen 1" does).
      // * `full`: any books that appear on their own get parsed as the complete book ("Gen" means "Gen.1-Gen.50").
      // * `first_chapter`: any books that appear on their own get parsed as the first chapter ("Gen" means "Gen.1").
      book_alone_strategy: "ignore",
      // * `ignore`: any books that appear on their own in a range are ignored ("Matt-Mark 2" means "Mark.2").
      // * `include`: any books that appear on their own in a range are included as part of the range ("Matt-Mark 2" means "Matt.1-Mark.2", while "Matt 2-Mark" means "Matt.2-Mark.16").
      book_range_strategy: "ignore",
      // * `delete`: remove any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5". This is better for text extraction.
      // * `include`: keep any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5.1". This is better for query parsing.
      captive_end_digits_strategy: "delete",
      // * `verse`: treat "Jer 33-11" as "Jer.33.11" (end before start) and "Heb 13-15" as "Heb.13.15" (end range too high).
      // * `sequence`: treat them as sequences.
      end_range_digits_strategy: "verse",
      // ### Apocrypha
      // Don't set this value directly; use the `include_apocrypha` or `set_options` functions.
      include_apocrypha: false,
      // `c`: treat references to Psalm 151 (if using the Apocrypha) as a chapter: "Psalm 151:1" -> "Ps.151.1"
      // `b`: treat references to Psalm 151 (if using the Apocrypha) as a book: "Psalm 151:1" -> "Ps151.1.1". Be aware that for ranges starting or ending in Psalm 151, you'll get two OSISes, regardless of the `sequence_combination_strategy`: "Psalms 149-151" -> "Ps.149-Ps.150,Ps151.1" Setting this option to `b` is the only way to correctly parse OSISes that treat `Ps151` as a book.
      ps151_strategy: "c",
      // ### Versification System
      // Don't set this value directly; use the `versification_system` or `set_options` functions.
      // * `default`: the default ESV-style versification. Also used in AMP and NASB.
      // * `ceb`: use CEB versification, which varies mostly in the Apocrypha.
      // * `kjv`: use KJV versification, with one fewer verse in 3John. Also used in NIV and NKJV.
      // `nab`: use NAB versification, which generally follows the Septuagint.
      // * `nlt`: use NLT versification, with one extra verse in Rev. Also used in NCV.
      // * `nrsv`: use NRSV versification.
      // * `vulgate`: use Vulgate (Greek) numbering for the Psalms.
      versification_system: "default",
      // ### Case Sensitivity
      // Don't use this value directly; use the `set_options` function. Changing this option repeatedly will slow down execution.
      // * `none`: All matches are case-insensitive.
      // * `books`: Book names are case-sensitive. Everything else is still case-insensitive.
      case_sensitive: "none"
    };

    return bcv_parser;

  }).call(this);

  root.bcv_parser = bcv_parser;

  bcv_passage = (function() {
    // This class takes the output from the grammar and turns it into simpler objects for additional processing or for output.
    class bcv_passage {
      // ## Public
      // Loop through the parsed passages.
      handle_array(passages, accum = [], context = {}) {
        var k, len, passage;
// `passages` is an array of passage objects.
        for (k = 0, len = passages.length; k < len; k++) {
          passage = passages[k];
          if (passage == null) {
            // The grammar can sometimes emit `null`.
            continue;
          }
          if (passage.type === "stop") {
            // Each `passage` consists of passage objects and, possibly, strings.
            break;
          }
          [accum, context] = this.handle_obj(passage, accum, context);
        }
        return [accum, context];
      }

      // Handle a typical passage object with an `index`, `type`, and array in `value`.
      handle_obj(passage, accum, context) {
        if ((passage.type != null) && (this[passage.type] != null)) {
          return this[passage.type](passage, accum, context);
        } else {
          return [accum, context];
        }
      }

      // ## Types Returned from the PEG.js Grammar
      // These functions correspond to `type` attributes returned from the grammar. They're designed to be called multiple times if necessary.

      // Handle a book on its own ("Gen").
      b(passage, accum, context) {
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
          // Use the first valid book.
          if (passage.passages.length === 0 && valid.valid) {
            passage.passages.push(obj);
          } else {
            alternates.push(obj);
          }
        }
        if (passage.passages.length === 0) {
          // If none are valid, use the first one.
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
      }

      // Handle book-only ranges ("Gen-Exod").
      b_range(passage, accum, context) {
        return this.range(passage, accum, context);
      }

      // Handle book-only ranges like "1-2 Samuel". It doesn't support multiple ambiguous ranges (like "1-2C"), which it probably shouldn't, anyway.
      b_range_pre(passage, accum, context) {
        var book, end, start_obj;
        passage.start_context = bcv_utils.shallow_clone(context);
        passage.passages = [];
        book = this.pluck("b", passage.value);
        [[end], context] = this.b(book, [], context);
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
        var alternates, b, c, context_key, k, len, obj, ref, valid;
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
          // Is it really a `bv` object?
          if (valid.messages.start_chapter_not_exist_in_single_chapter_book || valid.messages.start_chapter_1) {
            obj.valid = this.validate_ref(passage.start_context.translations, {
              b: b,
              v: c
            });
            // If it's `Jude 2`, then note that the chapter doesn't exist.
            if (valid.messages.start_chapter_not_exist_in_single_chapter_book) {
              obj.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1;
            }
            obj.start.c = 1;
            obj.end.c = 1;
            context_key = "v";
          }
          obj.start[context_key] = c;
          // If it's zero, fix it before assigning the end.
          [obj.start.c, obj.start.v] = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v);
          if (obj.start.v == null) {
            // Don't want an undefined key hanging around the object.
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
      }

      // Handle "Ps 3 title"
      bc_title(passage, accum, context) {
        var bc, i, k, ref, title;
        passage.start_context = bcv_utils.shallow_clone(context);
        // First, check to see whether we're dealing with Psalms. If not, treat it as a straight `bc`.
        [[bc], context] = this.bc(this.pluck("bc", passage.value), [], context);
        // We check the first two characters to handle both `Ps` and `Ps151`.
        if (bc.passages[0].start.b.substr(0, 2) !== "Ps" && (bc.passages[0].alternates != null)) {
          for (i = k = 0, ref = bc.passages[0].alternates.length; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
            if (bc.passages[0].alternates[i].start.b.substr(0, 2) !== "Ps") {
              continue;
            }
            // If Psalms is one of the alternates, promote it to the primary passage and discard the others--we know it's right.
            bc.passages[0] = bc.passages[0].alternates[i];
            break;
          }
        }
        if (bc.passages[0].start.b.substr(0, 2) !== "Ps") {
          accum.push(bc);
          return [accum, context];
        }
        // Overwrite all the other book possibilities; the presence of "title" indicates a Psalm. If the previous possibilities were `["Song", "Ps"]`, they're now just `["Ps"]`. Even if it's really `Ps151`, we want `Ps` here because other functions expect it.
        this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
        // Set the `indices` of the new `v` object to the indices of the `title`. We won't actually use these indices anywhere.
        title = this.pluck("title", passage.value);
        // The `title` will be null if it's being reparsed from a future translation because we rewrite it as a `bcv` while discarding the original `title` object.
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
        // We don't need to preserve the original `type` for reparsing; if it gets here, it'll always be a `bcv`.
        passage.type = "bcv";
        // Treat it as a standard `bcv`.
        return this.bcv(passage, accum, passage.start_context);
      }

      // Handle book chapter:verse ("Gen 1:1").
      bcv(passage, accum, context) {
        var alternates, b, bc, c, k, len, obj, ref, v, valid;
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
          [c, v] = this.fix_start_zeroes(valid, c, v);
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
          // Use the first valid option.
          if (passage.passages.length === 0 && valid.valid) {
            passage.passages.push(obj);
          } else {
            alternates.push(obj);
          }
        }
        if (passage.passages.length === 0) {
          // If there are no valid options, use the first one.
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
      }

      // Handle "Philemon verse 6." This is unusual.
      bv(passage, accum, context) {
        var b, bcv, v;
        passage.start_context = bcv_utils.shallow_clone(context);
        [b, v] = passage.value;
        // Construct a virtual BCV object with a chapter of 1.
        bcv = {
          indices: passage.indices,
          value: [
            {
              type: "bc",
              value: [
                b,
                {
                  type: "c",
                  value: [
                    {
                      type: "integer",
                      value: 1
                    }
                  ]
                }
              ]
            },
            v
          ]
        };
        [[bcv], context] = this.bcv(bcv, [], context);
        passage.passages = bcv.passages;
        if (passage.absolute_indices == null) {
          passage.absolute_indices = this.get_absolute_indices(passage.indices);
        }
        accum.push(passage);
        return [accum, context];
      }

      // Handle a chapter.
      c(passage, accum, context) {
        var c, valid;
        // This can happen in places like `chapt. 11-1040 of II Kings`, where the invalid range separates the `b` and the `c`.
        passage.start_context = bcv_utils.shallow_clone(context);
        // If it's an actual chapter object, the value we want is in the integer object inside it.
        c = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
        valid = this.validate_ref(passage.start_context.translations, {
          b: context.b,
          c: c
        });
        // If it's a single-chapter book, then treat it as a verse even if it looks like a chapter (unless its value is `1`).
        if (!valid.valid && valid.messages.start_chapter_not_exist_in_single_chapter_book) {
          return this.v(passage, accum, context);
        }
        [c] = this.fix_start_zeroes(valid, c);
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
      }

      // Handle "23rd Psalm" by recasting it as a `bc`.
      c_psalm(passage, accum, context) {
        var c;
        // We don't need to preserve the original `type` for reparsing.
        passage.type = "bc";
        // This string always starts with the chapter number, followed by other letters.
        c = parseInt(this.books[passage.value].value.match(/^\d+/)[0], 10);
        passage.value = [
          {
            type: "b",
            value: passage.value,
            indices: passage.indices
          },
          {
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
      }

      // Handle "Ps 3, ch 4:title"
      c_title(passage, accum, context) {
        var title;
        passage.start_context = bcv_utils.shallow_clone(context);
        // If it's not a Psalm, treat it as a regular chapter.
        if (context.b !== "Ps") {
          // Don't change the `type` here because we're not updating the structure to match the `c` expectation if reparsing later.
          return this.c(passage.value[0], accum, context);
        }
        // Add a `v` object and treat it as a regular `cv`.
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
        // Change the type to match the new parsing strategy.
        passage.type = "cv";
        return this.cv(passage, accum, passage.start_context);
      }

      // Handle a chapter:verse.
      cv(passage, accum, context) {
        var c, v, valid;
        passage.start_context = bcv_utils.shallow_clone(context);
        c = this.pluck("c", passage.value).value;
        v = this.pluck("v", passage.value).value;
        valid = this.validate_ref(passage.start_context.translations, {
          b: context.b,
          c: c,
          v: v
        });
        [c, v] = this.fix_start_zeroes(valid, c, v);
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
      }

      // Handle "Chapters 1-2 from Daniel".
      cb_range(passage, accum, context) {
        var b, end_c, start_c;
        // We don't need to preserve the original `type` for reparsing.
        passage.type = "range";
        [b, start_c, end_c] = passage.value;
        passage.value = [
          {
            type: "bc",
            value: [b,
          start_c],
            indices: passage.indices
          },
          end_c
        ];
        end_c.indices[1] = passage.indices[1];
        return this.range(passage, accum, context);
      }

      // Use an object to establish context for later objects but don't otherwise use it.
      context(passage, accum, context) {
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
      }

      // Handle "23rd Psalm verse 1" by recasting it as a `bcv`.
      cv_psalm(passage, accum, context) {
        var bc, c_psalm, v;
        passage.start_context = bcv_utils.shallow_clone(context);
        // We don't need to preserve the original `type` for reparsing.
        passage.type = "bcv";
        [c_psalm, v] = passage.value;
        [[bc]] = this.c_psalm(c_psalm, [], passage.start_context);
        passage.value = [bc, v];
        return this.bcv(passage, accum, context);
      }

      // Handle "and following" (e.g., "Matt 1:1ff") by assuming it means to continue to the end of the current context (end of chapter if a verse is given, end of book if a chapter is given).
      ff(passage, accum, context) {
        passage.start_context = bcv_utils.shallow_clone(context);
        // Create a virtual end to pass to `@range`.
        passage.value.push({
          type: "integer",
          indices: passage.indices,
          value: 999
        });
        [[passage], context] = this.range(passage, [], passage.start_context);
        // Set the indices to include the end of the range (the "ff").
        passage.value[0].indices = passage.value[1].indices;
        passage.value[0].absolute_indices = passage.value[1].absolute_indices;
        // And then get rid of the virtual end so it doesn't stick around if we need to reparse it later.
        passage.value.pop();
        if (passage.passages[0].valid.messages.end_verse_not_exist != null) {
          // Ignore any warnings that the end chapter / verse doesn't exist.
          delete passage.passages[0].valid.messages.end_verse_not_exist;
        }
        if (passage.passages[0].valid.messages.end_chapter_not_exist != null) {
          delete passage.passages[0].valid.messages.end_chapter_not_exist;
        }
        if (passage.passages[0].end.original_c != null) {
          delete passage.passages[0].end.original_c;
        }
        // `translations` and `absolute_indices` are handled in `@range`.
        accum.push(passage);
        return [accum, context];
      }

      // Handle "Ps 3-4:title" or "Acts 2:22-27. Title"
      integer_title(passage, accum, context) {
        passage.start_context = bcv_utils.shallow_clone(context);
        // If it's not Psalms, treat it as a straight integer, ignoring the "title".
        if (context.b !== "Ps") {
          return this.integer(passage.value[0], accum, context);
        }
        // Change the `integer` to a `c` object for later passing to `@cv`.
        passage.value[0] = {
          type: "c",
          value: [passage.value[0]],
          indices: [passage.value[0].indices[0], passage.value[0].indices[1]]
        };
        // Change the `title` object to a `v` object.
        passage.value[1].type = "v";
        passage.value[1].original_type = "title";
        passage.value[1].value = [
          {
            type: "integer",
            value: 1,
            indices: passage.value[1].value.indices
          }
        ];
        // We don't need to preserve the original `type` for reparsing.
        passage.type = "cv";
        return this.cv(passage, accum, passage.start_context);
      }

      // Pass the integer off to whichever handler is relevant.
      integer(passage, accum, context) {
        if (context.v != null) {
          return this.v(passage, accum, context);
        }
        return this.c(passage, accum, context);
      }

      // Handle "next verse" (e.g., in Polish, "Matt 1:1n" should be treated as "Matt 1:1-2"). It crosses chapter boundaries but not book boundaries. When given a whole chapter, it assumes the next chapter (again, not crossing book boundaries). The logic here is similar to that of `@ff`.
      next_v(passage, accum, context) {
        var prev_integer, psg;
        passage.start_context = bcv_utils.shallow_clone(context);
        // Create a virtual end to pass to `@range`. Start out by just incrementing the last integer in the `passage`.
        prev_integer = this.pluck_last_recursively("integer", passage.value);
        // The grammar should always produce at least one object in `passage` with an integer, so this shouldn't be necessary.
        if (prev_integer == null) {
          prev_integer = {
            value: 1
          };
        }
        // Add a temporary object to serve as the next verse or chapter. We set it to an integer so that we don't have to worry about whether to create a `c` or a `v`.
        passage.value.push({
          type: "integer",
          indices: passage.indices,
          value: prev_integer.value + 1
        });
        // We don't overwrite the `passage` object here the way we do in `@ff` because the next `if` statement needs access to the original `passage`.
        [[psg], context] = this.range(passage, [], passage.start_context);
        // If it's at the end of the chapter, try the first verse of the next chapter (unless at the end of a book). Only try if the start verse is valid.
        if ((psg.passages[0].valid.messages.end_verse_not_exist != null) && (psg.passages[0].valid.messages.start_verse_not_exist == null) && (psg.passages[0].valid.messages.start_chapter_not_exist == null) && (context.c != null)) {
          // Get rid of the previous attempt to find the next verse.
          passage.value.pop();
          // Construct a `cv` object that points to the first verse of the next chapter. The `context.c` always indicates the current chapter. The indices don't matter because we discard this entire object once we're done with it.
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
              },
              {
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
          // And then try again, forcing `@range` to use the first verse of the next chapter.
          [[psg], context] = this.range(passage, [], passage.start_context);
        }
        // Set the indices to include the end of the range (the "n" in Polish).
        psg.value[0].indices = psg.value[1].indices;
        psg.value[0].absolute_indices = psg.value[1].absolute_indices;
        // And then get rid of the virtual end so it doesn't stick around if we need to reparse it later.
        psg.value.pop();
        if (psg.passages[0].valid.messages.end_verse_not_exist != null) {
          // Ignore any warnings that the end chapter / verse doesn't exist.
          delete psg.passages[0].valid.messages.end_verse_not_exist;
        }
        if (psg.passages[0].valid.messages.end_chapter_not_exist != null) {
          delete psg.passages[0].valid.messages.end_chapter_not_exist;
        }
        if (psg.passages[0].end.original_c != null) {
          delete psg.passages[0].end.original_c;
        }
        // `translations` and `absolute_indices` are handled in `@range`.
        accum.push(psg);
        return [accum, context];
      }

      // Handle a sequence of references. This is the only function that can return more than one object in the `passage.passages` array.
      sequence(passage, accum, context) {
        var k, l, len, len1, obj, psg, ref, ref1, sub_psg;
        passage.start_context = bcv_utils.shallow_clone(context);
        passage.passages = [];
        ref = passage.value;
        for (k = 0, len = ref.length; k < len; k++) {
          obj = ref[k];
          [[psg], context] = this.handle_array(obj, [], context);
          ref1 = psg.passages;
          // There's only more than one `sub_psg` if there was a range error.
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            sub_psg = ref1[l];
            if (sub_psg.type == null) {
              sub_psg.type = psg.type;
            }
            // Add the indices so we can possibly retrieve them later, depending on our `sequence_combination_strategy`.
            if (sub_psg.absolute_indices == null) {
              sub_psg.absolute_indices = psg.absolute_indices;
            }
            if (psg.start_context.translations != null) {
              sub_psg.translations = psg.start_context.translations;
            }
            // Save the index of any closing punctuation if the sequence ends with a `sequence_post_enclosed`.
            sub_psg.enclosed_absolute_indices = psg.type === "sequence_post_enclosed" ? psg.absolute_indices : [-1, -1];
            passage.passages.push(sub_psg);
          }
        }
        if (passage.absolute_indices == null) {
          // If it's `sequence_post_enclosed`, don't snap the end index; include the closing punctuation.
          if (passage.passages.length > 0 && passage.type === "sequence") {
            passage.absolute_indices = [passage.passages[0].absolute_indices[0], passage.passages[passage.passages.length - 1].absolute_indices[1]];
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
        var c, no_c, v, valid;
        v = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
        passage.start_context = bcv_utils.shallow_clone(context);
        // The chapter context might not be set if it follows a book in a sequence.
        c = context.c != null ? context.c : 1;
        valid = this.validate_ref(passage.start_context.translations, {
          b: context.b,
          c: c,
          v: v
        });
        [no_c, v] = this.fix_start_zeroes(valid, 0, v);
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
      }

      // ## Ranges
      // Handle any type of start and end range. It doesn't directly return multiple passages, but if there's an error parsing the range, we may convert it into a sequence.
      range(passage, accum, context) {
        var end, end_obj, ref, ref1, ref2, ref3, return_now, return_value, start, start_obj, valid;
        passage.start_context = bcv_utils.shallow_clone(context);
        [start, end] = passage.value;
        // `@handle_obj` always returns exactly one object that we're interested in.
        [[start], context] = this.handle_obj(start, [], context);
        // Matt 5-verse 6 = Matt.5.6
        if (end.type === "v" && ((start.type === "bc" && !((ref = start.passages) != null ? (ref1 = ref[0]) != null ? (ref2 = ref1.valid) != null ? (ref3 = ref2.messages) != null ? ref3.start_chapter_not_exist_in_single_chapter_book : void 0 : void 0 : void 0 : void 0)) || start.type === "c") && this.options.end_range_digits_strategy === "verse") {
          // If we had to change the `type`, reflect that here.
          passage.value[0] = start;
          return this.range_change_integer_end(passage, accum);
        }
        [[end], context] = this.handle_obj(end, [], context);
        // If we had to change the start or end `type`s, make sure that's reflected in the `value`.
        passage.value = [start, end];
        // Similarly, if we had to adjust the indices, make sure they're reflected in the indices for the range.
        passage.indices = [start.indices[0], end.indices[1]];
        // We'll also need to recalculate these if they exist.
        delete passage.absolute_indices;
        // Create the prospective start and end objects that will end up in `passage.passages`.
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
          // Make sure references like `Ps 20:1-0:4` don't change to `Ps 20:1-1:4`. In other words, don't upgrade zero end ranges.
          end_obj.c = 0;
        }
        if (end.passages[0].valid.messages.start_verse_is_zero) {
          end_obj.v = 0;
        }
        valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
        // If it's valid, sometimes we want to return the value from `@range_handle_valid_end`, and sometimes not; it depends on what kinds of corrections we need to make.
        if (valid.valid) {
          [return_now, return_value] = this.range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum);
          if (return_now) {
            return return_value;
          }
        } else {
          // If it's invalid, always return the value.
          return this.range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum);
        }
        // We've already reset the indices to match the indices of the contained objects.
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
        // We may need to filter out books on their own depending on the `book_alone_strategy` or the `book_range_strategy`.
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
      }

      // For Ps 122-23, treat the 23 as 123.
      range_change_end(passage, accum, new_end) {
        var end, new_obj, start;
        [start, end] = passage.value;
        if (end.type === "integer") {
          end.original_value = end.value;
          end.value = new_end;
        } else if (end.type === "v") {
          new_obj = this.pluck("integer", end.value);
          new_obj.original_value = new_obj.value;
          new_obj.value = new_end;
        } else if (end.type === "cv") {
          // Get the chapter object and assign it (in place) the new value.
          new_obj = this.pluck("c", end.value);
          new_obj.original_value = new_obj.value;
          new_obj.value = new_end;
        }
        return this.handle_obj(passage, accum, passage.start_context);
      }

      // For "Jer 33-11", treat the "11" as a verse.
      range_change_integer_end(passage, accum) {
        var end, start;
        [start, end] = passage.value;
        // We want to retain the originals beacuse a future reparsing may lead to a different outcome.
        if (passage.original_type == null) {
          passage.original_type = passage.type;
        }
        if (passage.original_value == null) {
          passage.original_value = [start, end];
        }
        // The start.type is only bc, c, or integer; we're just adding a v for the first two.
        passage.type = start.type === "integer" ? "cv" : start.type + "v";
        if (start.type === "integer") {
          // Create the object in the expected format if it's not already a verse.
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
        var new_end, new_valid, obj_to_validate, type;
        new_end = 0;
        type = null;
        // See whether a digit might be omitted (e.g., Gen 22-4 = Gen 22-24).
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
      }

      // Handle ranges with a book as the end of the range ("Gen 2-Exod"). It's not `b_range_end` because only objects that start with an explicit book name should start with `b`.
      range_end_b(passage, accum, context) {
        return this.range(passage, accum, context);
      }

      // If a sequence has an end chapter/verse that's before the the start, check to see whether it can be salvaged: Gen 28-9 = Gen 28-29; Ps 101-24 = Ps 101-124. The `key` parameter is either `c` (for chapter) or `v` (for verse).
      range_get_new_end_value(start_obj, end_obj, valid, key) {
        var new_end;
        // Return 0 unless it's salvageable.
        new_end = 0;
        if ((key === "c" && valid.messages.end_chapter_is_zero) || (key === "v" && valid.messages.end_verse_is_zero)) {
          return new_end;
        }
        // 54-5, not 54-43, 54-3, or 54-4.
        if (start_obj[key] >= 10 && end_obj[key] < 10 && start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]) {
          // Add the start tens digit to the original end value: 54-5 = 54 through 50 + 5.
          new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10);
        // 123-40, not 123-22 or 123-23; 123-4 is taken care of in the first case.
        } else if (start_obj[key] >= 100 && end_obj[key] < 100 && start_obj[key] - 100 < end_obj[key]) {
          // Add 100 to the original end value: 100-12 = 100 through 100 + 12.
          new_end = end_obj[key] + 100;
        }
        return new_end;
      }

      // The range doesn't look valid, but maybe we can fix it. If not, convert it to a sequence.
      range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum) {
        var new_end, temp_valid, temp_value;
        // Is it not valid because the end is before the start and the `end` is an `integer` (Matt 15-6) or a `cv` (Matt 15-6:2) (since anything else resets our expectations)?

        // Only go with a `cv` if it's the chapter that's too low (to avoid doing weird things with 31:30-31:1).
        if (valid.valid === false && (valid.messages.end_chapter_before_start || valid.messages.end_verse_before_start) && (end.type === "integer" || end.type === "v") || (valid.valid === false && valid.messages.end_chapter_before_start && end.type === "cv")) {
          new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
          if (new_end > 0) {
            // If that's the case, then reparse the current passage object after correcting the end value, which is an integer.
            return this.range_change_end(passage, accum, new_end);
          }
        }
        // If someone enters "Jer 33-11", they probably mean "Jer.33.11"; as in `@range_handle_valid`, this may be too clever for its own good.
        if (this.options.end_range_digits_strategy === "verse" && (start_obj.v == null) && (end.type === "integer" || end.type === "v")) {
          // I don't know that `end.type` can ever be `v` here. Such a `c-v` pattern is parsed as `cv`.
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
        // Otherwise, if we couldn't fix the range, then treat the range as a sequence. We want to retain the original `type` and `value` in case we need to reparse it differently later.
        if (passage.original_type == null) {
          passage.original_type = passage.type;
        }
        passage.type = "sequence";
        // Construct the sequence value in the format expected.
        [passage.original_value, passage.value] = [[start, end], [[start], [end]]];
        // Don't use the `context` object because we changed it in `@range`.
        return this.sequence(passage, accum, passage.start_context);
      }

      // The range looks valid, but we should check for some special cases.
      range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum) {
        var temp_valid, temp_value;
        // If Heb 13-15, treat it as Heb 13:15. This may be too clever for its own good. We check the `passage_existence_strategy` because otherwise `Gen 49-76` becomes `Gen.49.76`.
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
        // Otherwise, snap start/end chapters/verses if they're too high or low.
        this.range_validate(valid, start_obj, end_obj, passage);
        return [false, null];
      }

      // If the end object goes past the end of the book or chapter, snap it back to a verse that exists.
      range_validate(valid, start_obj, end_obj, passage) {
        // If it's valid but the end range goes too high, snap it back to the appropriate chapter or verse.
        if (valid.messages.end_chapter_not_exist || valid.messages.end_chapter_not_exist_in_single_chapter_book) {
          // `end_chapter_not_exist` gives the highest chapter for the book.
          end_obj.original_c = end_obj.c;
          end_obj.c = valid.messages.end_chapter_not_exist ? valid.messages.end_chapter_not_exist : valid.messages.end_chapter_not_exist_in_single_chapter_book;
          // If we've snapped it back to the last chapter and there's a verse, also snap to the end of that chapter. If we've already overshot the chapter, there's no reason to think we've gotten the verse right; Gen 50:1-51:1 = Gen 50:1-26 = Gen 50. If there's no verse, we don't need to worry about it.
          if (end_obj.v != null) {
            // `end_verse_not_exist` gives the maximum verse for the chapter.
            end_obj.v = this.validate_ref(passage.start_context.translations, {
              b: end_obj.b,
              c: end_obj.c,
              v: 999
            }).messages.end_verse_not_exist;
            // If the range ended at Exodus 41:0, make sure we're not going to change it to Exodus 40:1.
            delete valid.messages.end_verse_is_zero;
          }
        // If the end verse is too high, snap back to the maximum verse.
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
        [start_obj.c, start_obj.v] = this.fix_start_zeroes(valid, start_obj.c, start_obj.v);
        return true;
      }

      // ## Translations
      // Even a single translation ("NIV") appears as part of a translation sequence. Here we handle the sequence and apply the translations to any previous passages lacking an explicit translation: in "Matt 1, 5 ESV," both `Matt 1` and `5` get applied, but in "Matt 1 NIV, 5 ESV," NIV only applies to Matt 1, and ESV only applies to Matt 5.
      translation_sequence(passage, accum, context) {
        var k, l, len, len1, ref, translation, translations, val;
        passage.start_context = bcv_utils.shallow_clone(context);
        translations = [];
        // First get all the translations in the sequence; the first one is separate from the others (which may not exist).
        translations.push({
          translation: this.books[passage.value[0].value].parsed
        });
        ref = passage.value[1];
        for (k = 0, len = ref.length; k < len; k++) {
          val = ref[k];
          // `val` at this point is an array.
          val = this.books[this.pluck("translation", val).value].parsed;
          if (val != null) {
            // And now `val` is the literal, lower-cased match.
            translations.push({
              translation: val
            });
          }
        }
// We need some metadata to do this right.
        for (l = 0, len1 = translations.length; l < len1; l++) {
          translation = translations[l];
          // Do we know anything about this translation? If so, use that. If not, use the default.
          if (this.translations.aliases[translation.translation] != null) {
            // `alias` is what we use internally to get bcv data for the translation.
            translation.alias = this.translations.aliases[translation.translation].alias;
            // `osis` is what we'll eventually use in output.
            translation.osis = this.translations.aliases[translation.translation].osis || translation.translation.toUpperCase();
          } else {
            translation.alias = "default";
            // If we don't know what the correct abbreviation should be, then just upper-case what we have.
            translation.osis = translation.translation.toUpperCase();
          }
        }
        if (accum.length > 0) {
          // Apply the new translations to the existing objects.
          context = this.translation_sequence_apply(accum, translations);
        }
        // We may need these indices later, depending on how we want to output the data.
        if (passage.absolute_indices == null) {
          passage.absolute_indices = this.get_absolute_indices(passage.indices);
        }
        // Include the `translation_sequence` object in `accum` so that we can handle any later `translation_sequence` objects without overlapping this one.
        accum.push(passage);
        // Don't carry over the translations into any later references; translations only apply backwards.
        this.reset_context(context, ["translations"]);
        return [accum, context];
      }

      // Go back and find the earliest already-parsed passage without a translation. We start with 0 because the below loop will never yield a 0.
      translation_sequence_apply(accum, translations) {
        var context, i, k, new_accum, ref, use_i;
        use_i = 0;
// Start with the most recent and go backward--we don't want to overlap another `translation_sequence`.
        for (i = k = ref = accum.length - 1; (ref <= 0 ? k <= 0 : k >= 0); i = ref <= 0 ? ++k : --k) {
          if (accum[i].original_type != null) {
            // With a new translation comes the possibility that a previously invalid reference will become valid, so reset it to its original type. For example, a multi-book range may be correct in a different translation because the books are in a different order.
            accum[i].type = accum[i].original_type;
          }
          if (accum[i].original_value != null) {
            accum[i].value = accum[i].original_value;
          }
          if (accum[i].type !== "translation_sequence") {
            continue;
          }
          // If we made it here, then we hit a translation sequence, and we know that the item following it is the first one we care about.
          use_i = i + 1;
          break;
        }
        // Include the translations in the start context.

        // `use_i` == `accum.length` if there are two translations sequences in a row separated by, e.g., numbers ("Matt 1 ESV 2-3 NIV"). This is unusual.
        if (use_i < accum.length) {
          accum[use_i].start_context.translations = translations;
          // The objects in accum are replaced in-place, so we don't need to try to merge them back. We re-parse them because the translation may cause previously valid (or invalid) references to flip the other way--if the new translation includes (or doesn't) the Deuterocanonicals, for example. We ignore the `new_accum`, but we definitely care about the new `context`.
          [new_accum, context] = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context);
        } else {
          // Use the start context from the last translation_sequence if that's all that's available.
          context = bcv_utils.shallow_clone(accum[accum.length - 1].start_context);
        }
        // We modify `accum` in-place but return the new `context` to the calling function.
        return context;
      }

      // ## Utilities
      // Pluck the object or value matching a type from an array.
      pluck(type, passages) {
        var k, len, passage;
        for (k = 0, len = passages.length; k < len; k++) {
          passage = passages[k];
          if (!((passage != null) && (passage.type != null) && passage.type === type)) {
            // `passage` can be null if a range needed to be adjusted into a sequence.
            continue;
          }
          if (type === "c" || type === "v") {
            return this.pluck("integer", passage.value);
          }
          return passage;
        }
        return null;
      }

      // Pluck the last object or value matching a type, descending as needed into objects.
      pluck_last_recursively(type, passages) {
        var k, passage, value;
// The `-1` means: walk backwards through the array.
        for (k = passages.length - 1; k >= 0; k += -1) {
          passage = passages[k];
          if (!((passage != null) && (passage.type != null))) {
            // Skip null values.
            continue;
          }
          if (passage.type === type) {
            // Rely on `@pluck` if we've found a match. It expects an array.
            return this.pluck(type, [passage]);
          }
          // If `passage.type` exists, we know that `passage.value` exists.
          value = this.pluck_last_recursively(type, passage.value);
          if (value != null) {
            return value;
          }
        }
        return null;
      }

      // Set all the available context keys.
      set_context_from_object(context, keys, obj) {
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
      }

      // Delete all the existing context keys if, for example, starting with a new book.
      reset_context(context, keys) {
        var k, len, results, type;
        results = [];
        for (k = 0, len = keys.length; k < len; k++) {
          type = keys[k];
          results.push(delete context[type]);
        }
        return results;
      }

      // If the start chapter or verse is 0 and the appropriate option is set to `upgrade`, convert it to a 1.
      fix_start_zeroes(valid, c, v) {
        if (valid.messages.start_chapter_is_zero && this.options.zero_chapter_strategy === "upgrade") {
          c = valid.messages.start_chapter_is_zero;
        }
        if (valid.messages.start_verse_is_zero && this.options.zero_verse_strategy === "upgrade") {
          v = valid.messages.start_verse_is_zero;
        }
        return [c, v];
      }

      // Given a string and initial index, calculate indices for parts of the string. For example, a string that starts at index 10 might have a book that pushes it to index 12 starting at its third character.
      calculate_indices(match, adjust) {
        var character, end_index, indices, k, l, len, len1, len2, m, match_index, part, part_length, parts, ref, switch_type, temp;
        // This gets switched out the first time in the loop; the first item is never a book even if a book is the first part of the string--there's an empty string before it.
        switch_type = "book";
        indices = [];
        match_index = 0;
        adjust = parseInt(adjust, 10);
        // It would be easier to do `for part in match.split /[\x1e\x1f]/`, but IE doesn't return empty matches when using `split`, throwing off the rest of the logic.
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
          // Start off assuming it's not a book.
          switch_type = switch_type === "book" ? "rest" : "book";
          // Empty strings don't move the index. This could happen with consecutive books.
          part_length = part.length;
          if (part_length === 0) {
            continue;
          }
          // If it's a book, then get the start index of the actual book, add the length of the actual string, then subtract the length of the integer id and the two surrounding characters.
          if (switch_type === "book") {
            // Remove any stray extra indicators.
            part = part.replace(/\/\d+$/, "");
            // Get the length of the id + the surrounding characters. We want the `end` to be the position, not the length. If the part starts at position 0 and is one character (i.e., three characters total, or `\x1f0\x1f`), `end` should be 1, since it occupies positions 0, 1, and 2, and we want the last character to be part of the next index so that we keep track of the end. For example, with "Genesis" at start index 0, the index starting at position 6 ("s") should be 4. Keep the adjust as-is, but set it next.
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
            // If the part is one character (three characters total) starting at `match_index` 0, we want the next `match_index` to be 3; it occupies positions 0, 1, and 2. Similarly, if it's two characters, it should be four characters total.
            match_index += part_length + 2;
            // Use the known `start_index` from the book, subtracting the current index in the match, to get the new. So if the previous `match_index` == 5 and the book's id is 0, the book's `start_index` == 10, and the book's length == 7, we want the next adjust to be 10 + 7 - 8 = 9 (the 8 is the `match_index` where the new `adjust` starts): 4(+5) = 9, 5(+5) = 10, 6(+5) = 11, 7(+5) = 12, 8(+9) = 17.
            adjust = this.books[part].start_index + this.books[part].value.length - match_index;
            indices.push({
              start: end_index + 1,
              end: end_index + 1,
              index: adjust
            });
          } else {
            // The `- 1` is because we want the `end` to be the position of the last character. If the part starts at position 0 and is three characters long, the `end` should be two, since it occupies positions 0, 1, and 2.
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
      }

      // Find the absolute string indices of start and end points.
      get_absolute_indices([start, end]) {
        var end_out, index, k, len, ref, start_out;
        start_out = null;
        end_out = null;
        ref = this.indices;
        // `@indices` contains the absolute indices for each range of indices in the string.
        for (k = 0, len = ref.length; k < len; k++) {
          index = ref[k];
          // If we haven't found the absolute start index yet, set it.
          if (start_out === null && (index.start <= start && start <= index.end)) {
            start_out = start + index.index;
          }
          // This may be in the same loop iteration as `start`. The `+ 1` matches Twitter's implementation of indices, where start is the character index and end is the character after the index. So `Gen` is `[0, 3]`.
          if ((index.start <= end && end <= index.end)) {
            end_out = end + index.index + 1;
            break;
          }
        }
        return [start_out, end_out];
      }

      // ## Validators
      // Given a start and optional end bcv object, validate that the verse exists and is valid. It returns a `true` value for `valid` if any of the translations is valid.
      validate_ref(translations, start, end) {
        var k, len, messages, temp_valid, translation, valid;
        if (!((translations != null) && translations.length > 0)) {
          // The `translation` key is optional; if it doesn't exist, assume the default translation.
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
// `translation` is a translation object, but all we care about is the string.
        for (k = 0, len = translations.length; k < len; k++) {
          translation = translations[k];
          if (translation.alias == null) {
            translation.alias = "default";
          }
          // Only true if `translation` isn't the right type.
          if (translation.alias == null) {
            if (messages.translation_invalid == null) {
              messages.translation_invalid = [];
            }
            messages.translation_invalid.push(translation);
            continue;
          }
          // Not a fatal error because we assume that translations match the default unless we know differently. But we still record it because we may want to know about it later. Translations in `alternates` get generated on-demand.
          if (this.translations.aliases[translation.alias] == null) {
            translation.alias = "default";
            if (messages.translation_unknown == null) {
              messages.translation_unknown = [];
            }
            messages.translation_unknown.push(translation);
          }
          [temp_valid] = this.validate_start_ref(translation.alias, start, messages);
          if (end) {
            [temp_valid] = this.validate_end_ref(translation.alias, start, end, temp_valid, messages);
          }
          if (temp_valid === true) {
            valid = true;
          }
        }
        return {
          valid: valid,
          messages: messages
        };
      }

      // Make sure that the start ref exists in the given translation.
      validate_start_ref(translation, start, messages) {
        var ref, ref1, translation_order, valid;
        valid = true;
        if (translation !== "default" && (((ref = this.translations[translation]) != null ? ref.chapters[start.b] : void 0) == null)) {
          this.promote_book_to_translation(start.b, translation);
        }
        translation_order = ((ref1 = this.translations[translation]) != null ? ref1.order : void 0) != null ? translation : "default";
        if (start.v != null) {
          start.v = parseInt(start.v, 10);
        }
        // Matt
        if (this.translations[translation_order].order[start.b] != null) {
          if (start.c == null) {
            start.c = 1;
          }
          start.c = parseInt(start.c, 10);
          // Matt five
          if (isNaN(start.c)) {
            valid = false;
            messages.start_chapter_not_numeric = true;
            return [valid, messages];
          }
          // Matt 0
          if (start.c === 0) {
            messages.start_chapter_is_zero = 1;
            if (this.options.zero_chapter_strategy === "error") {
              valid = false;
            } else {
              start.c = 1;
            }
          }
          // Matt 5:0
          if ((start.v != null) && start.v === 0) {
            messages.start_verse_is_zero = 1;
            if (this.options.zero_verse_strategy === "error") {
              valid = false;
            // Can't just have `else` because `allow` is a valid `zero_verse_strategy`.
            } else if (this.options.zero_verse_strategy === "upgrade") {
              start.v = 1;
            }
          }
          // Matt 5
          if (start.c > 0 && (this.translations[translation].chapters[start.b][start.c - 1] != null)) {
            // Matt 5:10
            if (start.v != null) {
              // Matt 5:ten
              if (isNaN(start.v)) {
                valid = false;
                messages.start_verse_not_numeric = true;
              // Matt 5:100
              } else if (start.v > this.translations[translation].chapters[start.b][start.c - 1]) {
                // Not part of the same `if` statement in case we ever add a new `else` condition.
                if (this.options.passage_existence_strategy.indexOf("v") >= 0) {
                  valid = false;
                  messages.start_verse_not_exist = this.translations[translation].chapters[start.b][start.c - 1];
                }
              }
            // Jude 1 when wanting to treat the `1` as a verse rather than a chapter.
            } else if (start.c === 1 && this.options.single_chapter_1_strategy === "verse" && this.translations[translation].chapters[start.b].length === 1) {
              messages.start_chapter_1 = 1;
            }
          } else {
            // Matt 50
            if (start.c !== 1 && this.translations[translation].chapters[start.b].length === 1) {
              valid = false;
              messages.start_chapter_not_exist_in_single_chapter_book = 1;
            } else if (start.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
              valid = false;
              messages.start_chapter_not_exist = this.translations[translation].chapters[start.b].length;
            }
          }
        // An unusual situation in which there's no defined start book. This only happens when a `c` becomes dissociated from its `b`.
        } else if (start.b == null) {
          valid = false;
          messages.start_book_not_defined = true;
        } else {
          if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
            // None 2:1
            valid = false;
          }
          messages.start_book_not_exist = true;
        }
        // We return an array to make unit testing easier; we only use `valid`.
        return [valid, messages];
      }

      // The end ref pretty much just has to be after the start ref; beyond the book, we don't	require the chapter or verse to exist. This approach is useful when people get end verses wrong.
      validate_end_ref(translation, start, end, valid, messages) {
        var ref, translation_order;
        // It's not necessary to check for whether the book exists in a non-default translation here because we've already validated that it works as a `start_ref`, which created the book if it didn't exist. So we don't call `@promote_book_to_translation`.
        translation_order = ((ref = this.translations[translation]) != null ? ref.order : void 0) != null ? translation : "default";
        // Matt 0
        if (end.c != null) {
          end.c = parseInt(end.c, 10);
          // Matt 2-four
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
        // Matt 5:0
        if (end.v != null) {
          end.v = parseInt(end.v, 10);
          // Matt 5:7-eight
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
        // Matt-Mark
        if (this.translations[translation_order].order[end.b] != null) {
          if ((end.c == null) && this.translations[translation].chapters[end.b].length === 1) {
            // Even if the `passage_existence_strategy` doesn't include `c`, make sure to treat single-chapter books as single-chapter books.
            end.c = 1;
          }
          // Mark 4-Matt 5, None 4-Matt 5
          if ((this.translations[translation_order].order[start.b] != null) && this.translations[translation_order].order[start.b] > this.translations[translation_order].order[end.b]) {
            if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
              valid = false;
            }
            messages.end_book_before_start = true;
          }
          // Matt 5-6
          if (start.b === end.b && (end.c != null) && !isNaN(end.c)) {
            // Matt-Matt 4
            if (start.c == null) {
              start.c = 1;
            }
            // Matt 5-4
            if (!isNaN(parseInt(start.c, 10)) && start.c > end.c) {
              valid = false;
              messages.end_chapter_before_start = true;
            // Matt 5:7-5:8
            } else if (start.c === end.c && (end.v != null) && !isNaN(end.v)) {
              // Matt 5-5:8
              if (start.v == null) {
                start.v = 1;
              }
              // Matt 5:8-7
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
          // Matt 5:1-None 6
          valid = false;
          messages.end_book_not_exist = true;
        }
        // We return an array to make unit testing easier; we only use `valid`.
        return [valid, messages];
      }

      // Gradually add books to translations as they're needed.
      promote_book_to_translation(book, translation) {
        var base, base1;
        if ((base = this.translations)[translation] == null) {
          base[translation] = {};
        }
        if ((base1 = this.translations[translation]).chapters == null) {
          base1.chapters = {};
        }
        // If the translation specifically overrides the default, use that. Otherwise stick with the default.
        if (this.translations[translation].chapters[book] == null) {
          return this.translations[translation].chapters[book] = bcv_utils.shallow_clone_array(this.translations.default.chapters[book]);
        }
      }

    };

    bcv_passage.prototype.books = [];

    bcv_passage.prototype.indices = {};

    // `bcv_parser` sets these two.
    bcv_passage.prototype.options = {};

    bcv_passage.prototype.translations = {};

    return bcv_passage;

  }).call(this);

  bcv_utils = {
    // Make a shallow clone of an object. Nested objects are referenced, not cloned.
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
    // Make a shallow clone of an array. Nested objects are referenced, not cloned.
    shallow_clone_array: function(arr) {
      var i, k, out, ref;
      if (arr == null) {
        return arr;
      }
      out = [];
      for (i = k = 0, ref = arr.length; (0 <= ref ? k <= ref : k >= ref); i = 0 <= ref ? ++k : --k) {
        if (typeof arr[i] !== "undefined") {
          out[i] = arr[i];
        }
      }
      return out;
    }
  };

  // When adding a new translation, add it both here and bcv_parser::translations.aliases
  bcv_parser.prototype.regexps.translations = /(?:(?:NB(?:G51|V)|GNB96|WV95|SV77|SV|NB))\b/gi;

  bcv_parser.prototype.translations = {
    aliases: {
      default: {
        osis: "",
        alias: "default"
      }
    },
    alternates: {},
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
        "Ps151": [7] //Never actually a book--we add this to Psalms if needed.
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

  bcv_parser.prototype.languages = ["nl"];

  bcv_parser.prototype.regexps.space = "[\\s\\xa0]";

  bcv_parser.prototype.regexps.escaped_passage = RegExp(`(?:^|[^\\x1f\\x1e\\dA-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:[\\u2013\\u2014\\-]|through|thru|to)\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:\\d+(?:th|nd|st)\\s*ch(?:apter|a?pt\\.?|a?p?\\.?)?\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*))?\\x1f(\\d+)(?:/\\d+)?\\x1f(?:/\\d+\\x1f|[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014]|opschrift(?![a-z])|en${bcv_parser.prototype.regexps.space // Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
  // Start inverted book/chapter (cb)
  //no plurals here since it's a single chapter
  // End inverted book/chapter (cb)
  //book
  //special Psalm chapters
  //could be followed by a number
  //a-e allows 1:1a
  //or the end of the string
}+volgende${bcv_parser.prototype.regexps.space}+verzen|zie${bcv_parser.prototype.regexps.space}+ook|hoofdstukken|hoofdstuk|verzen|vers|vgl|en|vs|-|v|[a-e](?!\\w)|$)+)`, "gi");

  // These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff.
  bcv_parser.prototype.regexps.match_end_split = RegExp(`\\d\\W*opschrift|\\d\\W*en${bcv_parser.prototype.regexps.space //ff09 is a full-width closing parenthesis
}+volgende${bcv_parser.prototype.regexps.space}+verzen(?:[\\s\\xa0*]*\\.)?|\\d[\\s\\xa0*]*[a-e](?!\\w)|\\x1e(?:[\\s\\xa0*]*[)\\]\\uff09])?|[\\d\\x1f]`, "gi");

  bcv_parser.prototype.regexps.control = /[\x1e\x1f]/g;

  bcv_parser.prototype.regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]";

  bcv_parser.prototype.regexps.first = `(?:Eerste|1e|I|1)\\.?${bcv_parser.prototype.regexps.space}*`;

  bcv_parser.prototype.regexps.second = `(?:Tweede|2e|II|2)\\.?${bcv_parser.prototype.regexps.space}*`;

  bcv_parser.prototype.regexps.third = `(?:Derde|3e|III|3)\\.?${bcv_parser.prototype.regexps.space}*`;

  bcv_parser.prototype.regexps.range_and = `(?:[&\u2013\u2014-]|(?:en|vgl|zie${bcv_parser.prototype.regexps.space}+ook)|-)`;

  bcv_parser.prototype.regexps.range_only = "(?:[\u2013\u2014-]|-)";

  // Each book regexp should return two parenthesized objects: an optional preliminary character and the book itself.
  bcv_parser.prototype.regexps.get_books = function(include_apocrypha, case_sensitive) {
    var book, books, k, len, out;
    books = [
      {
        osis: ["Ps"],
        apocrypha: true,
        extra: "2",
        regexp: /(\b)(Ps151)(?=\.1)/g // Don't match a preceding \d like usual because we only want to match a valid OSIS, which will never have a preceding digit. // Case-sensitive because we only want to match a valid OSIS.
      // Always follwed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
      },
      {
        osis: ["Gen"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Mozes|Beresjiet|(?:1e?|I)\.[\s\xa0]*Mozes|(?:1e?|I)[\s\xa0]*Mozes|Genesis|Gen|Gn))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Exod"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Mozes|(?:II|2e?)\.[\s\xa0]*Mozes|(?:II|2e?)[\s\xa0]*Mozes|Sjemot|Exodus|Ex(?:od)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Bel"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Bel(?:[\\s\\xa0]*en[\\s\\xa0]*de[\\s\\xa0]*draak)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Lev"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Derde[\s\xa0]*Mozes|(?:III|3e?)\.[\s\xa0]*Mozes|Leviticus|(?:III|3e?)[\s\xa0]*Mozes|[VW]ajikra|Lev|Lv))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Num"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Vierde[\s\xa0]*Mozes|(?:IV|4)\.[\s\xa0]*Mozes|B[ae]midbar|(?:IV|4)[\s\xa0]*Mozes|Numb?eri|Num?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Sir"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Wijsheid[\\s\\xa0]*van[\\s\\xa0]*(?:J(?:ozua[\\s\\xa0]*Ben|ezus)|Ben)[\\s\\xa0]*Sirach|Ecclesiasticus|Jezus[\\s\\xa0]*Sirach|Sirach|Sir))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Wis"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:De[\\s\\xa0]*wijsheid[\\s\\xa0]*van[\\s\\xa0]*Salomo|Het[\\s\\xa0]*boek[\\s\\xa0]*der[\\s\\xa0]*wijsheid|Wijsheid[\\s\\xa0]*van[\\s\\xa0]*Salomo|Wijsheid|Wis))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Lam"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Kl(?:aagl(?:iederen)?)?|Lam))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["EpJer"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Brief[\\s\\xa0]*van[\\s\\xa0]*Jeremia|EpJer))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Rev"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Op(?:enb(?:aring(?:[\\s\\xa0]*van[\\s\\xa0]*Johannes|en)?)?)?|Apocalyps|Rev|Ap[ck]))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["PrMan"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Man(?:asse)?|PrMan))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Deut"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:D(?:e(?:ut(?:eronomium)?|wariem)|t)|(?:V(?:ijfde|\.)?|5\.?)[\s\xa0]*Mozes))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Josh"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Jo(?:z(?:ua)?|sh)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Judg"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:R(?:i(?:cht(?:eren?)?)?|e(?:chters|cht)?)|Judg))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Ruth"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:R(?:uth|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["1Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*E(?:sdras|zra)|Derde[\s\xa0]*E(?:sdras|zra)|(?:I(?:II)?|[13]e|[13])\.[\s\xa0]*E(?:sdras|zra)|(?:I(?:II)?|[13]e|[13])[\s\xa0]*E(?:sdras|zra)|1Esd))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Vierde[\s\xa0]*E(?:sdras|zra)|Tweede[\s\xa0]*E(?:sdras|zra)|(?:I[IV]|2e?|4)\.[\s\xa0]*E(?:sdras|zra)|(?:I[IV]|2e?|4)[\s\xa0]*E(?:sdras|zra)|2Esd))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Isa"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:J(?:es(?:aja)?|s)|Isa))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["2Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Sam(?:u[e\xEB]l)?|(?:II|2e?)\.[\s\xa0]*Sam(?:u[e\xEB]l)?|Samuel[\s\xa0]*II|(?:II|2e)[\s\xa0]*Sam(?:u[e\xEB]l)?|2[\s\xa0]*Sam(?:u[e\xEB]l)?|2Sam|2[\s\xa0]*S))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Sam(?:u[e\xEB]l)?|(?:1e?|I)\.[\s\xa0]*Sam(?:u[e\xEB]l)?|(?:1e|I)[\s\xa0]*Sam(?:u[e\xEB]l)?|Samuel[\s\xa0]*I|1[\s\xa0]*Sam(?:u[e\xEB]l)?|1Sam|1[\s\xa0]*S))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Ko(?:n(?:ingen)?)?|(?:II|2e?)\.[\s\xa0]*Ko(?:n(?:ingen)?)?|(?:II|2e?)[\s\xa0]*Ko(?:n(?:ingen)?)?|2Kgs))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Ko(?:n(?:ingen)?)?|(?:1e?|I)\.[\s\xa0]*Ko(?:n(?:ingen)?)?|(?:1e?|I)[\s\xa0]*Ko(?:n(?:ingen)?)?|1Kgs))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Kron(?:ieken)?|(?:II|2e?)\.[\s\xa0]*Kron(?:ieken)?|(?:II|2e)[\s\xa0]*Kron(?:ieken)?|2(?:[\s\xa0]*Kron(?:ieken)?|(?:[\s\xa0]*K|Ch)r)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Kron(?:ieken)?|(?:1e?|I)\.[\s\xa0]*Kron(?:ieken)?|(?:1e|I)[\s\xa0]*Kron(?:ieken)?|1(?:[\s\xa0]*Kron(?:ieken)?|(?:[\s\xa0]*K|Ch)r)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Ezra"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Ezra?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Neh"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Neh(?:emia)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["GkEsth"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Est(?:er[\\s\\xa0]*\\(Gr(?:ieks|\\.)?\\)|[\\s\\xa0]*gr)|GkEsth))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Esth"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Est(?:h(?:er)?|er)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Job"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Job))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Ps"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Ps(?:alm(?:en)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["PrAzar"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Gebed[\\s\\xa0]*van[\\s\\xa0]*Azarja|PrAzar))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Prov"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Spr(?:euken)?|Prov))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Eccl"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Prediker|[KQ]oheleth?|Pr(?:ed)?|Eccl))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["SgThree"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Gezang[\\s\\xa0]*der[\\s\\xa0]*drie[\\s\\xa0]*mannen[\\s\\xa0]*in[\\s\\xa0]*het[\\s\\xa0]*vuur|Lied[\\s\\xa0]*van[\\s\\xa0]*de[\\s\\xa0]*drie[\\s\\xa0]*jongemannen|SgThree))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Song"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Canticum[\\s\\xa0]*canticorum|H(?:ooglied|l)|Hoogl|Song))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Jer"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:J(?:er(?:emia)?|r)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Ezek"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Eze(?:ch(?:i[e\\xEB]l)?|k)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Dan"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Da(?:n(?:i[e\\xEB]l)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Hos"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Hos(?:ea)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Joel"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:J(?:o[e\\xEB])?l))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Amos"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Am(?:os)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Obad"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Ob(?:ad(?:ja)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Jonah"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Jon(?:ah?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Mic"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Mi(?:c(?:ha|a)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Nah"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Nah(?:um)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Hab"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Hab(?:akuk)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Zeph"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Ze(?:f(?:anja)?|ph)|Sef(?:anja)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Hag"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Hag(?:g(?:a[i\\xEF])?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Zech"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Z(?:ach(?:aria)?|ech)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Mal"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Mal(?:eachi)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Matt"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Matte[u\\xFC]s|M(?:att(?:h[e\\xE9]|e)[u\\xFC]s|at(?:th?)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Mark"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Mar[ck]us|M(?:ar[ck]us|ar[ck]|[ckr])))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Luke"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Lu[ck]as|L(?:u[ck]as|uke|u[ck]|[ck])))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["1John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:1John)|(?:Eerste[\s\xa0]*Joh(?:annes)?|(?:1e?|I)\.[\s\xa0]*Joh(?:annes)?|(?:1e?|I)[\s\xa0]*Joh(?:annes)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:2John)|(?:Tweede[\s\xa0]*Joh(?:annes)?|(?:II|2e?)\.[\s\xa0]*Joh(?:annes)?|(?:II|2e?)[\s\xa0]*Joh(?:annes)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["3John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:3John)|(?:Derde[\s\xa0]*Joh(?:annes)?|(?:III|3e?)\.[\s\xa0]*Joh(?:annes)?|(?:III|3e?)[\s\xa0]*Joh(?:annes)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["John"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Evangelie[\\s\\xa0]*volgens[\\s\\xa0]*Johannes|Joh(?:annes|n)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Acts"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:H(?:and(?:elingen(?:[\\s\\xa0]*(?:van[\\s\\xa0]*de|der)[\\s\\xa0]*apostelen)?)?|nd)|Acts))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Rom"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Rom(?:einen(?:brief)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["2Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))?|Corint(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))|(?:II|2e?)\.[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))?|Corint(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))|(?:II|2e?)[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))?|Corint(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))|2Cor))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))?|Corint(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))|(?:1e?|I)\.[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))?|Corint(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))|(?:1e?|I)[\s\xa0]*(?:Kor(?:int(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))?|Corint(?:h(?:i[e\xEB]rs?|e)|i[e\xEB]rs?))|1Cor))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Gal"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Gal(?:aten(?:brief)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Eph"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:E(?:f(?:ez(?:i[e\\xEB]rs)?)?|ph)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Phil"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Fil(?:ip(?:penzen)?)?|Phil))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Col"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:[CK]ol(?:ossenzen)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["2Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|(?:II|2e?)\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|(?:II|2e)[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|2(?:[\s\xa0]*Th?ess(?:alonicenzen)?|(?:[\s\xa0]*Th?e|Thes)s)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|(?:1e?|I)\.[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|(?:1e|I)[\s\xa0]*T(?:hess(?:alonicenzen)?|es(?:s(?:alonicenzen)?)?)|1(?:[\s\xa0]*Th?ess(?:alonicenzen)?|(?:[\s\xa0]*Th?e|Thes)s)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Tim(?:ot(?:he[u\xFC]|e[u\xFC])s)?|(?:II|2e?)\.[\s\xa0]*Tim(?:ot(?:he[u\xFC]|e[u\xFC])s)?|(?:II|2e?)[\s\xa0]*Tim(?:ot(?:he[u\xFC]|e[u\xFC])s)?|2Tim))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Tim(?:ot(?:he[u\xFC]|e[u\xFC])s)?|(?:1e?|I)\.[\s\xa0]*Tim(?:ot(?:he[u\xFC]|e[u\xFC])s)?|(?:1e?|I)[\s\xa0]*Tim(?:ot(?:he[u\xFC]|e[u\xFC])s)?|1Tim))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Titus"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Tit(?:us)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Phlm"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Fil(?:\\xE9mon|em(?:on)?|m)|Phlm))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Heb"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Heb(?:r(?:ee[e\\xEB]n)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Jas"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Ja(?:kobus|cobus|[ks])))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["2Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Pet(?:r(?:us)?)?|(?:II|2e?)\.[\s\xa0]*Pet(?:r(?:us)?)?|(?:II|2e)[\s\xa0]*Pet(?:r(?:us)?)?|2(?:[\s\xa0]*Pet(?:r(?:us)?)?|[\s\xa0]*Pe|Pet)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Pet(?:r(?:us)?)?|(?:1e?|I)\.[\s\xa0]*Pet(?:r(?:us)?)?|(?:1e|I)[\s\xa0]*Pet(?:r(?:us)?)?|1(?:[\s\xa0]*Pet(?:r(?:us)?)?|[\s\xa0]*Pe|Pet)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Jude"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Jud(?:as|e)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Tob"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Tob(?:\\xEDas?|i(?:as?|t))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Jdt"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:J(?:udith?|dt)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Bar"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Bar(?:uch)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["Sus"],
        apocrypha: true,
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Sus(?:anna)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      },
      {
        osis: ["2Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Tweede[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:II|2e?)\.[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:II|2e?)[\s\xa0]*Mak(?:kabee[e\xEB]n)?|2Macc))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["3Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Derde[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:III|3e?)\.[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:III|3e?)[\s\xa0]*Mak(?:kabee[e\xEB]n)?|3Macc))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["4Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Vierde[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:IV|4)\.[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:IV|4)[\s\xa0]*Mak(?:kabee[e\xEB]n)?|4Macc))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])((?:Eerste[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:1e?|I)\.[\s\xa0]*Mak(?:kabee[e\xEB]n)?|(?:1e?|I)[\s\xa0]*Mak(?:kabee[e\xEB]n)?|1Macc))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["Ezek",
      "Ezra"],
        regexp: RegExp(`(^|${bcv_parser.prototype.regexps.pre_book})((?:Ez))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/"'\\*=~\\-\\u2013\\u2014])|$)`,
      "gi")
      }
    ];
    if (include_apocrypha === true && case_sensitive === "none") {
      // Short-circuit the look if we know we want all the books.
      return books;
    }
    // Filter out books in the Apocrypha if we don't want them. `Array.map` isn't supported below IE9.
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

  // Default to not using the Apocrypha
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
        peg$c40 = "en",
        peg$c41 = peg$literalExpectation("en", false),
        peg$c42 = "volgende",
        peg$c43 = peg$literalExpectation("volgende", false),
        peg$c44 = "verzen",
        peg$c45 = peg$literalExpectation("verzen", false),
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
        peg$c64 = "hoofdstuk",
        peg$c65 = peg$literalExpectation("hoofdstuk", false),
        peg$c66 = "ken",
        peg$c67 = peg$literalExpectation("ken", false),
        peg$c68 = "",
        peg$c69 = function() { return {"type": "c_explicit"} },
        peg$c70 = "v",
        peg$c71 = peg$literalExpectation("v", false),
        peg$c72 = "erzen",
        peg$c73 = peg$literalExpectation("erzen", false),
        peg$c74 = "ers",
        peg$c75 = peg$literalExpectation("ers", false),
        peg$c76 = "s",
        peg$c77 = peg$literalExpectation("s", false),
        peg$c78 = function() { return {"type": "v_explicit"} },
        peg$c79 = ":",
        peg$c80 = peg$literalExpectation(":", false),
        peg$c81 = /^["']/,
        peg$c82 = peg$classExpectation(["\"", "'"], false, false),
        peg$c83 = /^[,;\/:&\-\u2013\u2014~]/,
        peg$c84 = peg$classExpectation([",", ";", "/", ":", "&", "-", "\u2013", "\u2014", "~"], false, false),
        peg$c85 = "vgl",
        peg$c86 = peg$literalExpectation("vgl", false),
        peg$c87 = "zie",
        peg$c88 = peg$literalExpectation("zie", false),
        peg$c89 = "ook",
        peg$c90 = peg$literalExpectation("ook", false),
        peg$c91 = function() { return "" },
        peg$c92 = /^[\-\u2013\u2014]/,
        peg$c93 = peg$classExpectation(["-", "\u2013", "\u2014"], false, false),
        peg$c94 = "opschrift",
        peg$c95 = peg$literalExpectation("opschrift", false),
        peg$c96 = function(val) { return {type:"title", value: [val], "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c97 = "from",
        peg$c98 = peg$literalExpectation("from", false),
        peg$c99 = "of",
        peg$c100 = peg$literalExpectation("of", false),
        peg$c101 = "in",
        peg$c102 = peg$literalExpectation("in", false),
        peg$c103 = "the",
        peg$c104 = peg$literalExpectation("the", false),
        peg$c105 = "book",
        peg$c106 = peg$literalExpectation("book", false),
        peg$c107 = /^[([]/,
        peg$c108 = peg$classExpectation(["(", "["], false, false),
        peg$c109 = /^[)\]]/,
        peg$c110 = peg$classExpectation([")", "]"], false, false),
        peg$c111 = function(val) { return {"type": "translation_sequence", "value": val, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c112 = "\x1E",
        peg$c113 = peg$literalExpectation("\x1E", false),
        peg$c114 = function(val) { return {"type": "translation", "value": val.value, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c115 = ",000",
        peg$c116 = peg$literalExpectation(",000", false),
        peg$c117 = function(val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c118 = /^[^\x1F\x1E([]/,
        peg$c119 = peg$classExpectation(["\x1F", "\x1E", "(", "["], true, false),
        peg$c120 = function(val) { return {"type": "word", "value": val.join(""), "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c121 = function(val) { return {"type": "stop", "value": val, "indices": [peg$savedPos, peg$currPos - 1]} },
        peg$c122 = /^[\s\xa0*]/,
        peg$c123 = peg$classExpectation([" ", "\t", "\r", "\n", "\xA0", "*"], false, false),

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
        peg$c83 = /^[;\/:&\-\u2013\u2014~]/;
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
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

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
              if (input.substr(peg$currPos, 8) === peg$c42) {
                s5 = peg$c42;
                peg$currPos += 8;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsespace();
                if (s6 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 6) === peg$c44) {
                    s7 = peg$c44;
                    peg$currPos += 6;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c45); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseabbrev();
                    if (s8 === peg$FAILED) {
                      s8 = null;
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$currPos;
                      peg$silentFails++;
                      if (peg$c46.test(input.charAt(peg$currPos))) {
                        s10 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s10 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c47); }
                      }
                      peg$silentFails--;
                      if (s10 === peg$FAILED) {
                        s9 = void 0;
                      } else {
                        peg$currPos = s9;
                        s9 = peg$FAILED;
                      }
                      if (s9 !== peg$FAILED) {
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
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
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
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

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
                if (input.substr(peg$currPos, 8) === peg$c42) {
                  s8 = peg$c42;
                  peg$currPos += 8;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c43); }
                }
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsespace();
                  if (s9 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 6) === peg$c44) {
                      s10 = peg$c44;
                      peg$currPos += 6;
                    } else {
                      s10 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c45); }
                    }
                    if (s10 !== peg$FAILED) {
                      s6 = [s6, s7, s8, s9, s10];
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
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsesp();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c64) {
          s3 = peg$c64;
          peg$currPos += 9;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c66) {
            s4 = peg$c66;
            peg$currPos += 3;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c67); }
          }
          if (s4 === peg$FAILED) {
            s4 = peg$c68;
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
            s1 = peg$c69();
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
          s3 = peg$c70;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c71); }
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 5) === peg$c72) {
            s4 = peg$c72;
            peg$currPos += 5;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c73); }
          }
          if (s4 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c74) {
              s4 = peg$c74;
              peg$currPos += 3;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c75); }
            }
            if (s4 === peg$FAILED) {
              s4 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 115) {
                s5 = peg$c76;
                peg$currPos++;
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
                s4 = peg$parseabbrev();
                if (s4 === peg$FAILED) {
                  s4 = null;
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
              s1 = peg$c78();
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
          s3 = peg$c79;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c80); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (input.charCodeAt(peg$currPos) === 58) {
              s3 = peg$c79;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c80); }
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
        if (peg$c81.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c82); }
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
      if (peg$c83.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c84); }
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
          if (input.substr(peg$currPos, 2) === peg$c40) {
            s2 = peg$c40;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c85) {
              s2 = peg$c85;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c86); }
            }
            if (s2 === peg$FAILED) {
              s2 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c87) {
                s3 = peg$c87;
                peg$currPos += 3;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c88); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsespace();
                if (s4 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 3) === peg$c89) {
                    s5 = peg$c89;
                    peg$currPos += 3;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c90); }
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
                s2 = peg$parsespace();
              }
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c83.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
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
              if (input.substr(peg$currPos, 2) === peg$c40) {
                s2 = peg$c40;
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c41); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c85) {
                  s2 = peg$c85;
                  peg$currPos += 3;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c86); }
                }
                if (s2 === peg$FAILED) {
                  s2 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c87) {
                    s3 = peg$c87;
                    peg$currPos += 3;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c88); }
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsespace();
                    if (s4 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c89) {
                        s5 = peg$c89;
                        peg$currPos += 3;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c90); }
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
                    s2 = peg$parsespace();
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
        s1 = peg$c91();
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
        if (peg$c92.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c93); }
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
          if (input.charCodeAt(peg$currPos) === 45) {
            s4 = peg$c21;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c22); }
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
            if (peg$c92.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c93); }
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
              if (input.charCodeAt(peg$currPos) === 45) {
                s4 = peg$c21;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c22); }
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
        if (input.substr(peg$currPos, 9) === peg$c94) {
          s2 = peg$c94;
          peg$currPos += 9;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c95); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c96(s2);
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
        if (input.substr(peg$currPos, 4) === peg$c97) {
          s2 = peg$c97;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c98); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c99) {
            s2 = peg$c99;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c100); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c101) {
              s2 = peg$c101;
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c102); }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesp();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c103) {
              s5 = peg$c103;
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c104); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsesp();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c105) {
                  s7 = peg$c105;
                  peg$currPos += 4;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c106); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsesp();
                  if (s8 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c99) {
                      s9 = peg$c99;
                      peg$currPos += 2;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c100); }
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
        if (peg$c107.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c108); }
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
                if (peg$c109.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c110); }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c111(s4);
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
            s1 = peg$c111(s3);
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
        s1 = peg$c112;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c113); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseany_integer();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 30) {
            s3 = peg$c112;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c113); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c114(s2);
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
        s1 = peg$c117(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseword() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c118.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c118.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c119); }
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

    function peg$parseword_parenthesis() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c107.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c108); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c121(s1);
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

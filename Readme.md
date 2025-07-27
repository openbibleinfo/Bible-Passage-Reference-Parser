# Bible Passage Reference Parser

This project is a Typescript implementation of a Bible-passage reference parser (seeing `John 3:16`, for example, and both understanding that it's a Bible reference and converting it into a form that computers can process). It parses Bible **B**ooks, **C**hapters, and **V**erses—thus the file names involving "BCV Parser."

Its primary use is to interpret query strings for use in a Bible application. As such, it is designed to handle typos and ambiguous references. It can extract BCVs from text but may be too aggressive for some uses. (See [Caveats](#caveats).)

It should be fairly speedy for most applications, taking under a millisecond to parse a short string and able to parse about 175KB of reference-heavy text per second on a single core.

The code for a single language occupies about 147KB minified and 30KB gzipped.

This project also provides extensively commented code and 4.7 million real-world strings that you can use as a starting point to build your own BCV parser.

Try a [demo of the Bible passage reference parser](https://www.openbible.info/labs/reference-parser/).

## Upgrade Guide from v2 to v3

First, you don't need to update any of your code. The `/js` folder contains a copy of the v2.0.1 code. It hasn't changed at all and works exactly the same.

But if you do want access to new features, I recommend using the code in `/esm` version of the code, which uses `import`-style modules and takes an argument to indicate the language you want to support.

CommonJS files (`require`-style) are available in the `/cjs` folder.

Note that the files in `/esm` and `/cjs` require ESM2022, which means they'll work in Node 16 and later and browsers released after mid-2021.

## Setup

### In a Browser (`<script>` module)
```html
<script type="module">
  import { bcv_parser } from "esm/bcv_parser.js";
  import * as lang from "esm/lang/en.js";
  const bcv = new bcv_parser(lang);
  console.log( bcv.parse("John 1").osis() ); // John.1
</script>
 ```

Note that no variables are accessible from outside the `<script>` tag. If that presents a problem for you, you could potentially do something like:

```html
<script type="module">
  import { bcv_parser } from "esm/bcv_parser.js";
  import * as lang from "esm/lang/en.js";
  window.bcv = new bcv_parser(lang);
  window.dispatchEvent(new Event("bcv_loaded"));
</script>
<script>
  // Once the module is loaded, it's accessible as the global `bcv` object.
  window.addEventListener("bcv_loaded", () => {
    console.log(window.bcv.parse("John 15").osis());
  });
</script>
```

### In a Browser (regular `<script>` tag)

```html
<script src="/path/cjs/en_bcv_parser.js" charset="utf-8"></script>
<script>
  const bcv = new bcv_parser();
  console.log( bcv.parse("John 1").osis() ); // John.1
</script>
```

### Node.js (npm)

To install from the command line:

```shell
npm i bible-passage-reference-parser
```

### Node Usage (v16 and Later)

To run using ES modules (newer style). This style requires using a language object when you create a `new` instance of the parser object.

```javascript
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
const bcv = new bcv_parser(lang);
console.log( bcv.parse("John 1").osis() ); // John.1
```

### Node Usage (Before v16)

To run using CommonJS:

```javascript
const bcv_parser = require("bible-passage-reference-parser/cjs/en_bcv_parser").bcv_parser;
const bcv = new bcv_parser();
console.log( bcv.parse("John 1").osis() ); // John.1
```

### Node.js (Manual, v16 and Later)

This example uses English. After downloading the parser and the language file you want (assuming you put the language file in a `lang` subfolder):

```javascript
import { bcv_parser } from "./bcv_parser.js"; // Adjust paths as needed
import * as lang from "./lang/en.js";
const bcv = new bcv_parser(lang);
console.log( bcv.parse("John 1").osis() ); // John.1
```

## Parsing

Assuming you have an object named `bcv`:

### `.parse("[string to parse]")`

This function does the parsing. It returns the `bcv` object and is suitable for chaining.

```javascript
bcv.parse("John 3:16"); // Returns the `bcv` object.
```

### `.parse_with_context("[string to parse]", "[string context]")`

This function parses a string with a string context as the second argument. As with `.parse()`, it returns the `bcv` object and is suitable for chaining. Use this function if you have a string that starts with what you suspect is a reference and you already know the context. For example, maybe you're parsing a footnote that refers to "verse 16," and you know that the footnote is attached to John 3:

```javascript
bcv.parse_with_context("verse 16", "John 3"); // Returns the `bcv` object.
bcv.osis(); // "John.3.16"
```

It only matches relevant content at the beginning of the first argument; parsing `chapter 2` will work with context (assuming chapter 2 exists: `bcv.parse_with_context("chapter 2", "Hebrews")`), but not `my favorite chapter is chapter 2`. (In fact, if you `.parse_with_context()` that last string, you'd find that the parser read `is chapter 2` as `Isa.2` because `Is 2` is text that someone could use to refer to Isaiah 2.)

Without this function, you could manually prepend the context to the string, but it could get messy: with the context `John 3:16`, the string `verse 17` would become `John 3:16,verse 17`. Depending on your settings, this string might parse as `John.3.16-John.3.17`, which isn't what you want. `.parse_with_context()` lets you avoid such messiness.

Passing a translation as part of the context—`bcv.parse_with_context("verse 16", "John 3 NIV")`—doesn't apply the translation to the first argument. Translations always propagate backward, not forward (`Matt 5:6 (NIV)` rather than `NIV: Matt 5:6`). You can set the `versification_system` option to change the default translation.

### `.osis()`

This function returns a single OSIS for the entire input, providing no information about any translations included in the input.

```javascript
bcv.parse("John 3:16 NIV").osis();
// "John.3.16"
bcv.parse("John 3:16-17").osis();
// "John.3.16-John.3.17"
bcv.parse("John 3:16,18").osis();
// "John.3.16,John.3.18"
bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis();
// "John.3.16,John.3.18,Matt.1"
```

### `.osis_and_translations()`

This function returns an array. Each element in the array is an `[OSIS, Translation]` tuple (both are strings).

```javascript
bcv.parse("John 3:16 NIV").osis_and_translations();
// [["John.3.16", "NIV"]]
bcv.parse("John 3:16-17").osis_and_translations();
// [["John.3.16-John.3.17", ""]]
bcv.parse("John 3:16,18").osis_and_translations();
// [["John.3.16,John.3.18", ""]]
bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis_and_translations();
// [["John.3.16,John.3.18", ""], ["Matt.1", "NIV,ESV"]]
```

### `.osis_and_indices()`

This function returns an array. Each element in the array is an object with `osis` (a string), `translations` (an array of translation identifiers—an empty string unless a translation is specified), and `indices` (the start and end position in the string). The `indices` key is designed to be consistent with Twitter's implementation (the first character in a string has indices `[0, 1]`). If you're looking to tag references in text, this function is probably the one you want.

```javascript
bcv.parse("John 3:16 NIV").osis_and_indices();
// [{"osis": "John.3.16", "translations": ["NIV"], "indices": [0, 13]}]
bcv.parse("John 3:16-17").osis_and_indices();
// [{"osis": "John.3.16-John.3.17", "translations": [""], "indices": [0, 12]}]
bcv.parse("John 3:16,18").osis_and_indices();
// [{"osis": "John.3.16,John.3.18", "translations": [""], "indices": [0, 12]}]
bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis_and_indices();
// [{"osis": "John.3.16,John.3.18", "translations": [""], "indices":[0, 12]}, {"osis": "Matt.1", "translations": ["NIV","ESV"], "indices": [18, 38]}]
```

### `.parsed_entities()`

If you want to know a lot about how the parser handled the input string, use this function. It can include messages if it adjusted the input or had trouble parsing it (e.g., if given an invalid reference).

You probably do not need to use this function.

This function returns an array with a fairly complicated structure. The `entities` key can contain nested entities if you're parsing a sequence of references.

```javascript
bcv.set_options({"invalid_passage_strategy": "include", "invalid_sequence_strategy": "include"});
bcv.parse("John 3, 99").parsed_entities();
```

Returns:

```javascript
[{ "osis": "John.3",
  "indices": [0, 10],
  "translations": [""],
  "entity_id": 0,
  "entities": [{
    "osis": "John.3",
    "type": "bc",
    "indices": [0, 6],
    "translations": [""],
    "start": { "b": "John", "c": 3, "v": 1 },
    "end": { "b": "John", "c": 3, "v": 36 },
    "enclosed_indices": [-1, -1],
    "entity_id": 0,
    "entities": [{
      "start": { "b": "John", "c": 3, "v": 1 },
      "end": { "b": "John", "c": 3, "v": 36 },
      "valid": { "valid": true, "messages": {} },
      "type": "bc",
      "absolute_indices": [0, 6],
      "enclosed_absolute_indices": [-1, -1]
      }]
    },
    { "osis": "",
      "type": "integer",
      "indices": [8, 10],
      "translations": [""],
      "start": { "b": "John", "c": 99 },
      "end": { "b": "John", "c": 99 },
      "enclosed_indices": [-1, -1],
      "entity_id": 0,
      "entities": [{
        "start": { "b": "John", "c": 99 },
        "end": { "b": "John", "c": 99 },
        "valid": { "valid": false, "messages": { "start_chapter_not_exist": 21 } },
        "type": "integer",
        "absolute_indices": [8, 10],
        "enclosed_absolute_indices": [-1, -1]
      }]
    }
  ]
}]
```

You may also see an `alternates` object if you provide an ambiguous book abbreviation (`Ph 2` could mean "Phil.2" or "Phlm.1.2"; "Phil.2" appears as the main entity, while "Phlm.1.2" appears in `[0].entities[0].entities[0].alternates` in this case).

### `.include_apocrypha([Boolean])`

This function takes a single Boolean value (`true` or `false`). If `true`, it tries to find the following books in the Apocrypha (or Deuterocanonicals): Tob, Jdt, GkEsth, Wis, Sir, Bar, PrAzar, Sus, Bel, SgThree, EpJer, 1Macc, 2Macc, 3Macc, 4Macc, 1Esd, 2Esd, PrMan, Ps151. Your canon may vary in the number of books, their order, or the number of verses in each chapter. If you set the value to `false` (the default behavior), it ignores books in the Apocrypha.

```javascript
bcv.parse("Tobit 1").osis(); // ""
bcv.include_apocrypha(true);
bcv.parse("Tobit 1").osis(); // "Tob.1"
```

You shouldn't call `include_apocrypha()` between calling `parse()` and one of the output functions—the output reflects the value of `include_apocrypha()` that was active during the call to `parse()`. You probably also don't want to call it every time you call `parse()`—it will slow down execution.

You might find it easier to use the `testaments` option to specify which testaments (Old, New, and Apocrypha) you want to identify.

### `.set_options({})`

This function takes an object that sets parsing and output options. See [Options](#options) for available keys and values. This function doesn't enforce valid values, but using values other than the ones described in [Options](#options) will lead to unexpected behavior.

```javascript
bcv.set_options({"osis_compaction_strategy": "bcv"});
bcv.parse("Genesis 1").osis(); // "Gen.1.1-Gen.1.31"
```

## Administrative Functions

This function is separate from the parsing sequence and provides data that may be useful for other applications.

### `.translation_info("[translation]")`

This function returns an object of data about the requested translation. You can use this data to determine, for example, the previous and next chapters for a given chapter, even when the given chapter is at the beginning or end of a book.

It takes an optional string argument that identifies the translation—if the translation is unknown, it returns data about the default translation. For English, abbreviations that will change the output are: `default`, `vulgate`, `ceb`, `kjv`, `nab` (or `nabre`), `nlt`, `nrsv`, and `nrsvue`. Sending this function the lower-cased translation output from `osis_and_translations()` or `osis_and_indices()` will return the correct translation information.

The returned object has the following structure:

```javascript
{
  "alias": "default",
  "books": ["Gen", "Exod", "Lev", ...],
  "chapters": {"Gen": [31, 25, ...], "Exod": [22, 25, ...], ...},
  "order": {"Gen": 1, "Exod": 2, ...}
  "system": "default"
}
```

The `system` key identifies which versification is used. For example, `.translation_info("niv")` returns `kjv` for this key because the NIV uses KJV versification. Objects with identical `system` values are identical. `system` is a synonym for `alias`; these two keys are always identical; `alias` is an older way to refer to versification systems.

The `order` key returns the order in which the books appear in the translation, starting at 1.

The `books` key lists the books in order, which you can use to find surrounding books. For example, if you know from `order` that `"Exod": 2`, you know that you can find it at `books[1]` (because the array is zero-based). Similarly, the book before `Exod` is at `books[0]`, and the book after it is at `books[2]`.

The `chapters` key lists the number of verses in each chapter: `chapters["Gen"][0]` tells you how many verses are in Genesis 1. Further, the `length` of each book's array tells you how many chapters are in each book: `chapters["Gen"].length` tells you how many chapters are in Genesis.

## Options

### OSIS Output

* `consecutive_combination_strategy: "combine"`
	* `combine`: "Matt 5, 6, 7" → "Matt.5-Matt.7".
	* `separate`: "Matt 5, 6, 7" → "Matt.5,Matt.6,Matt.7".
* `osis_compaction_strategy: "b"`
	* `b`: OSIS refs get reduced to the shortest possible. "Gen.1.1-Gen.50.26" and "Gen.1-Gen.50" → "Gen", while "Gen.1.1-Gen.2.25" → "Gen.1-Gen.2".
	* `bc`: OSIS refs get reduced to complete chapters if possible, but not whole books. "Gen.1.1-Gen.50.26" → "Gen.1-Gen.50".
	* `bcv`: OSIS refs always include the full book, chapter, and verse. "Gen.1" → "Gen.1.1-Gen.1.31".
  * `bcvp`: OSIS refs include partial verse references: "Gen 1:1a" → "Gen.1.1!a". The "partial" indicator is returned exactly as it appears in the text, so non-Latin languages may have non-Latin characters. When no partial verse reference appears in the next, no OSIS indicator appears: "Gen 1:1" → "Gen.1.1".

### Sequence

* `book_sequence_strategy: "ignore"`
	* `ignore`: ignore any books on their own in sequences ("Gen Is 1" → "Isa.1").
	* `include`: any books that appear on their own get parsed according to `book_alone_strategy` ("Gen Is 1" → "Gen.1-Gen.50,Isa.1" if `book_alone_strategy` is `full` or `ignore`, or "Gen.1,Isa.1" if it's `first_chapter`).
* `invalid_sequence_strategy: "ignore"`
	* `ignore`: "Matt 99, Gen 1" sequence index starts at the valid `Gen 1`.
	* `include`: "Matt 99, Gen 1" sequence index starts at the invalid `Matt 99`.
* `sequence_combination_strategy: "combine"`
	* `combine`: sequential references in the text are combined into a single comma-separated OSIS string: "Gen 1, 3" → `"Gen.1,Gen.3"`.
	* `separate`: sequential references in the text are separated into an array of their component parts: "Gen 1, 3" → `["Gen.1", "Gen.3"]`.
* `punctuation_strategy: "us"`
	* `us`: commas separate sequences, periods separate chapters and verses. "Matt 1, 2. 4" → "Matt.1,Matt.2.4".
	* `eu`: periods separate sequences, commas separate chapters and verses. "Matt 1, 2. 4" → "Matt.1.2,Matt.1.4".

### Potentially Invalid Input

* `invalid_passage_strategy: "ignore"`
	* `ignore`: Include only valid passages in `parsed_entities()`.
	* `include`: Include invalid passages in `parsed_entities()` (they still don't have OSIS values).
* `non_latin_digits_strategy: "ignore"`
	* `ignore`: treat non-Latin digits the same as any other character.
	* `replace`: replace non-Latin (0-9) numeric digits with Latin digits. This replacement occurs before any book substitution.
* `passage_existence_strategy: "bcv"`
	* Include `b` in the string to validate book order ("Revelation to Genesis" is invalid).
	* Include `c` in the string to validate chapter existence. If omitted, strings like "Genesis 51" (which doesn't exist) return as valid. Omitting `c` means that looking up full books will return `999` as the end chapter: "Genesis to Exodus" → "Gen.1-Exod.999".
	* Include `v` in the string to validate verse existence. If omitted, strings like `Genesis 1:100` (which doesn't exist) return as valid. Omitting `v` means that looking up full chapters will return `999` as the end verse: "Genesis 1:2 to chapter 3" → "Gen.1.2-Gen.3.999".
	* Tested values are `b`, `bc`, `bcv`, `bv`, `c`, `cv`, `v`, and `none`. In all cases, single-chapter books still respond as single-chapter books to allow treating strings like `Obadiah 2` as `Obad.1.2`.
* `zero_chapter_strategy: "error"`
	* `error`: zero chapters ("Matthew 0") are invalid.
	* `upgrade`: zero chapters are upgraded to 1: "Matthew 0" → "Matt.1".
	* Unlike `zero_verse_strategy`, chapter 0 isn't allowed.
* `zero_verse_strategy: "error"`
	* `error`: zero verses ("Matthew 5:0") are invalid.
	* `upgrade`: zero verses are upgraded to 1: "Matthew 5:0" → "Matt.5.1".
	* `allow`: zero verses are kept as-is: "Matthew 5:0" → "Matt.5.0". Some traditions use 0 for Psalm titles.
* `single_chapter_1_strategy: "chapter"`
	* `chapter`: treat "Jude 1" as referring to the complete book of Jude: `Jude.1`. People almost always want this output when they enter this text in a search box.
	* `verse`: treat "Jude 1" as referring to the first verse in Jude: `Jude.1.1`. If you're parsing specialized text that follows a style guide, you may want to set this option.

### Context

* `book_alone_strategy: "ignore"`
	* `ignore`: any books that appear on their own don't get parsed as books ("Gen saw" doesn't trigger a match, but "Gen 1" does).
	* `full`: any books that appear on their own get parsed as the complete book ("Gen" → "Gen.1-Gen.50").
	* `first_chapter`: any books that appear on their own get parsed as the first chapter ("Gen" → "Gen.1").
* `book_range_strategy: "ignore"`
	* `ignore`: any books that appear on their own in a range are ignored ("Matt-Mark 2" → "Mark.2").
	* `include`: any books that appear on their own in a range are included as part of the range ("Matt-Mark 2" → "Matt.1-Mark.2", while "Matt 2-Mark" → "Matt.2-Mark.16").
* `captive_end_digits_strategy: "delete"`
	* `delete`: remove any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" → "Matt.5". This is better for text extraction.
	* `include`: keep any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" → "Matt.5.1". This is better for query parsing.
* `end_range_digits_strategy: "verse"`
	* `verse`: treat "Jer 33-11" as "Jer.33.11" (end before start) and "Heb 13-15" as "Heb.13.15" (end range too high).
	* `sequence`: treat them as sequences ("Jer 33-11" → "Jer.33,Jer.11", "Heb 13-15" → "Heb.13").

### Testaments
* `testaments: "on"`
	* `o`: include `o` in the value to look for Old Testament books (Genesis to Malachi in the Protestant canon).
	* `n`: include `n` in the value to look for New Testament books (Matthew to Revelation in the Protestant canon).
	* `a`: include `a` in the value to look for books in the Apocrypha. Calling `include_apocrypha(true)` simply adds an `a` to this value, while calling `include_apocrypha(false)` removes it. The next values are all combinations of these three primitives.
	* `on` includes the Old and New Testaments.
	* `ona` includes the Old and New Testaments and the Apocrypha.
	* `oa` includes the Old Testament and the Apocrypha.
	* `na` includes the New Testament and the Apocrypha.
* `ps151_strategy: "c"`
	* `c`: treat references to Psalm 151 (if using the Apocrypha) as a chapter: "Psalm 151:1" → "Ps.151.1"
	* `b`: treat references to Psalm 151 (if using the Apocrypha) as a book: "Psalm 151:1" → "Ps151.1.1". Be aware that for ranges starting or ending in Psalm 151, you'll get two OSISes, regardless of the `sequence_combination_strategy`: "Psalms 149-151" → "Ps.149-Ps.150,Ps151.1". Setting this option to `b` is the only way to correctly parse OSISes that treat `Ps151` as a book.

### Versification
* `versification_system: "default"`
	* `default`: the default ESV-style versification. Also used in AMP and NASB.
	* `ceb`: use CEB versification, which varies mostly in the Apocrypha.
	* `csb`: use CSB versification, which differs in two New Testament books.
	* `kjv`: use KJV versification, with one fewer verse in 3John. Also used in NIV and NKJV.
	* `nab`: use NABRE versification, which generally follows the Septuagint.
	* `nlt`: use NLT versification, with one extra verse in Rev. Also used in NCV.
	* `nrsv`: use NRSV versification.
	* `nrsvue`: use NRSVUE versification.
	* `vulgate`: use Vulgate numbering for the Psalms.

### Case Sensitivity
* `case_sensitive: "none"`
	* `none`: All matches are case-insensitive.
	* `books`: Book names are case-sensitive. Everything else is still case-insensitive.
  * `translations`: Translation identifiers (such as "KJV") are case-sensitive. Everything else is still case-insensitive.
  * `books,translations`: Books and translation identifiers are case-sensitive. Everything else (such as the word "verse" if it occurs in the text) is still matched case-insensitively.

### Warnings
* `warning_level: "none"`
	* `none`: Don't use `console.warn`.
	* `warn`: Send `console.warn` messages when setting an unknown `versification_system` or `punctuation_strategy`, getting unknown `translation_info()`, or redefining an existing translation in `add_translations()`.

### Grammar
You can set `grammar` with the below keys.

This object controls runtime behavior of the grammar so that you can override certain patterns with a custom regular expression. For example, maybe you never want to use `.` as a chapter-verse separator because your style requires a `:` instead. Here's how you'd do that:

```javascript
bcv.parse("John 3.16").osis(); // "John.3.16"
bcv.set_options({
  "grammar": {
    "cv_sep_us": /^:/
  }
});
bcv.parse("John 3.16").osis(); // "John.3,John.16"
```

Here the "16" gets parsed as a chapter because `.` is a valid sequence separator. To fully get what you're (probably) looking for, try this:

```javascript
bcv.parse("John 3.16").osis(); // "John.3.16"
bcv.set_options({
  "grammar": {
    "cv_sep_us": /^:/,
    "sequence_us": /^(?:[,;]|\s*and\s*)+/
  }
});
bcv.parse("John 3.16").osis(); // "John.3,John.16"
```

Here are the valid keys for this object:

1. `ab`: Partial verses (the "a" in "John 3:16a").
2. `and`: The last item in a sequence ("John 3:16 and 17").
3. `c_explicit`: An explicit chapter reference (the "chapters" in "John 3:2, chapters 1 and 2").
4. `c_sep_eu`: A separator to indicate that what follows is a new chapter when the `eu` punctuation strategy is active, even if it otherwise looks like a verse (if set appropriately, the "; " in "John 3:1; 5").
5. `c_sep_us`: The same as `c_sep_eu` but when the `us` `punctuation_strategy` is active.
6. `cv_sep_weak`: A chapter-verse separator that can be overridden based on context (the space in "John 3 1").
7. `cv_sep_eu`: The chapter-verse separator to use when the `eu` `punctuation_strategy` is active (the "," in "John 3, 16").
8. `cv_sep_us`: The chapter-verse separator to use when the `us` `punctuation_strategy` is active (the ":" in "John 3:16").
9. `ff`: Short for "and following," used to indicate a range through the end of the current chapter or book, depending on context (the "ff" in "John 3:16ff").
10. `in_book_of`: Used in contexts like "the 3rd chapter from the book of John". This has to be set up for the language at compile time and won't do anything for you.
11. `next`: Appears in some languages to indicate the immediate next verse or chapter. Not used in English, but conceptually similar to `ff`.
12. `ordinal`: Used with `in_book_of`. It also has to be set up for the language at compile time and won't do anything for you.
13. `range`: A range of verses or chapters (the "-" in "John 3:16-17").
14. `sequence_eu`: The sequence separator to use when the `eu` `punctuation_strategy` is active (the "." in ("John 3,16. 17")).
15. `sequence_us`: The sequence separator to use when the `us` `punctuation_strategy` is active (the "," in ("John 3.16, 17")).
16. `space`: Characters to use as a space. Includes an asterisk by default because people in practice sometimes use asterisks for spaces.
17. `title`: A psalm title (the "title" in "Psalm 3, title").
18. `v_explicit`: An explicit verse reference (the "verse" in "John 3 verse 16").

The RegExp you provide must always start with a `^` to match the beginning of a string. If you have multiple alternates, each one should be anchored with a `^` (or, better, do something like `/^(?:pattern1|pattern2)/`. You can use any valid regular expression, though it's possible to significantly degrade performance with complex ones.

If you use a pattern that includes a character that wasn't included at compile time, it probably won't match your pattern. This limitation is a known issue for version 3.1.0; it may change in the future.

You're overriding the existing patterns entirely. For example, if you set `sequence_us` to `/^,/`, and someone enters "John 3:16 and 17", the "and 17" won't match.

If you set overlapping patterns (e.g., changing `ab` so that it includes "f", which is also used for `ff`), the precendence won't necessarily be predictable and may not produce the output you want.

You can use this pattern to guarantee that something will never match: `/^\x1f\x1f\x1f/`.

## Messages

If you're calling `parsed_entities()` directly, the following keys can appear in `messages`; they don't always indicate an invalid reference; they may just indicate the chosen parsing strategy.

### Start Objects

* `start_book_not_defined`: `true` if a `c` or similar non-book object is lacking a book context. This message only occurs when the object becomes dissociated from the related book, as in `Chapters 11-1040 of II Kings`. It's highly unusual.
* `start_book_not_exist`: `true` if the given book doesn't exist in the translation. A book has to be omitted from the translation's definition to generate this message.
* `start_chapter_is_zero`: `1` if the requested start chapter is 0.
* `start_chapter_not_exist`: The value is the last valid chapter in the book.
* `start_chapter_not_exist_in_single_chapter_book`: `1` if wanting, say, `Philemon 2`. It is reparsed as a verse (`Philemon 1:2`).
* `start_verse_is_zero`: `1` if the requested start verse is 0.
* `start_verse_not_exist`: The value is the last valid verse in the chapter.

### End Objects

* `end_book_before_start`: `true` if the end book is before the start book (the order depends on the translation being used). E.g., `Exodus-Genesis`.
* `end_book_not_exist`: `true` if the given book doesn't exist in the translation. A book has to be omitted from the translation's definition to generate this message.
* `end_chapter_before_start`: `true` if the end chapter is before the start chapter in the same book.
* `end_chapter_is_zero`: `1` if the requested end chapter is `0`. The `1` indicates the first valid chapter.
* `end_chapter_not_exist`: The value is the last valid chapter in the book.
* `end_chapter_not_exist_in_single_chapter_book`: `1` if wanting, say, `Philemon 2-3`. It is reparsed as a verse (`Philemon 1:2-3`).
* `end_verse_before_start`: `true` if the end verse is before the start verse in the same book and chapter.
* `end_verse_is_zero`: `1` if the requested end verse is `0`. The `1` indicates the first valid verse.
* `end_verse_not_exist`: The value is the last valid verse in the chapter.

### Translation Objects

* `translation_invalid`: `[]` if an invalid translation sequence appears. Each item in the array is a `translation` object.
* `translation_unknown`: `[]` if the translation is unknown. If you see this message, a translation exists in `bcv_parser.regexps.translations` but not in `bcv_parser.translations`. Each item in the array is a `translation` object.

## Adding New Book Patterns

The `.add_books()` function lets you add new patterns to find books in text. Here's an example; let's say you want to allow "Marco" and "Mrc" to be parsed by the English parser:

```javascript
const bcv = new bcv_parser(lang);
bcv.parse("Marco 1").osis(); // No result.
bcv.add_books({books: [{ // `books` is always an array of objects.
  osis: ["Mark"], // An array of OSIS book names that you want the pattern to match.
  regexp: /Marco|Mrc/ // The regular expression. You don't need to provide bounding characters.
}]});
bcv.parse("Marco 1").osis(); // Mark.1
bcv.parse("Mrc 1").osis(); // Mark.1
```

Unlike most other functions, this one will throw an error if anything's not quite right with the input.

You probably want to [NFC-normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) any patterns before adding them so that they're consistent with built-in patterns.

The books that the parser will find are governed by the `testaments` setting. If you have it set to `o` (so you only find books in the Old Testament) but create pattern for a New Testament book, your pattern won't match until you set `testaments` to contain an `n`.

Here are the keys you can set in each object in the array:

* `osis`: This is an array of OSIS book names that you want your pattern to match. Typically you only want to match one, but some abbreviations, like "Ma" in English, can match multiple books. The parser will prefer the first valid one. If you try to parse `Ma 28` with the `osis: ["Mal", "Matt"]`, it will pick `Matt` because `Mal` doesn't have 28 chapters (assuming you have a `bc` or `bcv` `passage_existence_strategy`).
* `regexp`: This is the RegExp that will be used to match. Any flags you set are ignored; ultimately, it'll end up with `giu` flags set. It's possible to write non-performant regular expressions; it's up to you to ensure they meet your needs.
* `insert_at`: A string to indicate the order you want your pattern parsed in compared to other books.
  * It defaults to `start`, meaning that your patterns will be parsed before any others.
  * You can also set it to `end` (to parse it after everything else). For example, maybe you want to be sure that your new `/Corinthians/` pattern is always parsed after 1 and 2 Corinthians so that it doesn't eat up valid longer patterns.
  * You can also provide it an OSIS string, like `Matt`. That will ensure that your pattern is inserted just before the first pattern that matches Matthew. Note that the order of the regular expressions isn't necessarily predictable: generally patterns for `2Cor` are parsed before `1Cor`, for example. You can also specify a pattern that matches multiple books by comma-separating them: `Matt,Mal` will match only a pattern that matches both books. In practice, you probably don't want to do that.
* `pre_regexp`: Normally, the book patterns you provide are bounded by other RegExps to ensure that we don't lift out potential book matches from the middle of words. You can use this key to assign your own RegExp. Importantly, it shouldn't use any capturing groups (`(...)`). It also should only consist of zero-width assertions (like negative lookbehinds, `\b`, or `^` anchors). If your pattern gobbles text, it will throw off the parser.
* `post_regexp`. Similarly, you can provide a pattern for after the book. Here it's also important not to gobble any characters, so you should only use zero-width assertions. If you set either `pre_regexp` or `post_regexp`, you probably want to test extensively. Because the RegExps have the `u` flag, you can use `\p` classes for bounding. For example, `(?=[^\p{L}])` asserts that the next character isn't a letter.

## Adding New Translations

The `.add_translations()` function lets you define new translations. Let's say you want to define an "NIV1984" translation for the parser to find in the text you provide. The NIV1984 uses the same versification system as the NIV (2011), which is "kjv" (since the KJV and the NIV have the same number of chapters and verses in each book):

```javascript
// Here the parser identifies Mark 1 but not the translation.
bcv.parse("Mark 1 (NIV1984)").osis_and_translations(); // ["Mark.1", ""]
bcv.add_translations({
  translations: [{ text: "NIV1984", system: "kjv" }]
});
bcv.parse("Mark 1 (NIV1984)").osis_and_translations(); // [["Mark.1", "NIV1984"]]
// This verse exists in the default versification but not in the NIV1984 or the KJV.
bcv.parse("3 John 15 (NIV1984)").osis_and_translations();  // []
```

It's also possible to define a custom versification system. The following defines the first and only book in the system to be `Matt` (but note that any undefined books are added to the end), and it defines `Matt` to have only one chapter with 10 verses. The value in `system` should match a key in `systems` if you're defining a custom one. The `osis` key lets you define what gets reported back out to you.

```javascript
bcv.add_translations({
  translations: [{ text: "ONLYMATT", osis: "MATTHEWTRANSLATION", system: "custom1" }],
  systems: {
    custom1: {
      books: ["Matt"],
      chapters: {
        "Matt": [10]
      }
    }
  }
});
bcv.parse("Matt 1:2 ONLYMATT").osis_and_translations(); // [["Matt.1.2", "MATTHEWTRANSLATION"]]
```

As with `add_books()`, you can define `pre_regexp` and `post_regexp` at the top level of the object (not for individual translations). As in `add_books()`, the patterns you use should not consume any characters.

This function will throw an error if something isn't right in the data you've sent.

## Unicode

If you're dealing with non-ASCII characters, you probably want to [NFC-normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) your input before sending it to the parser. All the built-in patterns are normalized with the NFC algorithm. The parser doesn't perform this normalization for you because it can affect the length of your input, which in turn would affect the offsets. If you need to, you can always perform NFD normalization after you're done parsing.

## Caveats

The parser is quite aggressive in identifying text as Bible references; if you just hand it raw text, you will probably encounter false positives, where the parser identifies text as Bible references even when it isn't. For example, in the string `she is 2 cool`, the `is 2` is parsed as `Isa.2`.

The parser spends most of its time doing regular expressions and manipulating strings. If you give it a very long string full of Bible references, it could block your main event loop. Depending on your performance requirements, parsing large numbers of even short strings could saturate your CPU and lead to problems in the rest of your app.

In addition, a number of the tests in the "real-world" section of [`test/realworld.spec.js`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/blob/master/test/realworld.spec.js) have comments describing limitations of the parser. Unfortunately, it's hard to solve them without incorrectly parsing other cases—one person intends `Matt 1, 3` to mean `Matt.1,Matt.3`, while another intends it to mean `Matt.1.3`.

## Tests

One of the hardest parts of building a BCV parser is finding data to test it on to tease out corner cases. The [`test`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/blob/master/test) folder has over 3,700 tests that illustrate the range of input that this parser can handle.

Separate from this repository are four data files that you can use to test your own parser. Derived from Twitter and Facebook mentions of Bible references, the dataset reflects how people really type references in English. It includes 4.7 million unique strings across 180 million total mentions. (For example, the most-popular string, "Philippians 4:13", is mentioned over 1.3 million times.)

1. [10+ mentions in the dataset](https://a.openbible.info/data/bcv-parser/10plus.zip). 465,000 unique strings, 4 MB. If you're just beginning to develop your own parser and are looking for raw data, start with this file.
2. [3-9 mentions in the dataset](https://a.openbible.info/data/bcv-parser/3-9.zip). 818,000 unique strings, 7 MB.
3. [2 mentions in the dataset](https://a.openbible.info/data/bcv-parser/2.zip). 743,000 unique strings, 7 MB.
4. [1 mention in the dataset](https://a.openbible.info/data/bcv-parser/1.zip). 2.7 million unique strings, 25 MB. This file contains strings that only appear once in the corpus.

The tests are arranged in three columns:

1. `Popularity` is the number of times the text appears in the corpus. You can use this column as a way to prioritize how to handle corner cases.
2. `Text` is the raw text of the reference. Tabs and newline characters (`[\t\r\n]`) are converted to spaces; otherwise they appear unaltered from their source.
3. `OSIS` is the OSIS value of the text as parsed by this BCV Parser. If one or more translations appears, it precedes a colon at the start of the string. For example: `Matt 5, 7, NIV, ESV` has an OSIS value of `NIV,ESV:Matt.5,Matt.7`. Otherwise, the OSIS consists only of OSIS references separated by commas. You may choose to interpret certain cases differently to suit your needs, but this column gives you a reasonable starting point from which to validate your parser.

This dataset has a few limitations:

1. It's self-selecting in that it only includes content that this BCV parser understands.
2. It doesn't include as many misspellings as you'd expect because the queries used to retrieve the data only use correct spellings. Misspellings that do occur are incidental—they're part of content that otherwise includes a non-misspelled book name.
3. Its coverage of Deuterocanonical books is very limited; as with misspellings, the queries used to retrieve the data don't include books from the Apocrypha.
4. It doesn't include context that could change the interpretation of the string.
5. Sequences interrupted by translation identifiers are separated: the parsing of `Matt 1 NIV Matt 2 KJV` appears in two separate lines.
6. It's only in English.

## OSIS

[OSIS](https://crosswire.org/osis/) is a system for marking up Bibles in XML. The BCV parser only borrows the OSIS system for [book abbreviations](http://www.crosswire.org/wiki/OSIS_Book_Abbreviations) and references. You can control the OSIS specificity using the `osis_compaction_strategy` option. I like OSIS references because, programmatically, they're easy to handle.

The parser emits `GkEsth` for Greek Esther rather than just `Esth`. It can include `Ps151` as part of the Psalms (`Ps.151.1`)—the default—or as its own book (`Ps151.1.1`), depending on the `ps151_strategy` option.

<table>
	<tr><th>Input</th><th>OSIS</th></tr>
	<tr><td><code>John</code></td><td><code>John</code> or <code>John.1-John.21</code> or <code>John.1.1-John.21.25</code></td></tr>
	<tr><td><code>John-Acts</code></td><td><code>John-Acts</code> or <code>John.1-Acts.28</code> or <code>John.1.1-Acts.28.31</code></td></tr>
	<tr><td><code>John 3</code></td><td><code>John.3</code> or <code>John.3.1-John.3.36</code></td></tr>
	<tr><td><code>John 3:16</code></td><td><code>John.3.16</code></td></tr>
	<tr><td><code>John 3:16-17</code></td><td><code>John.3.16-John.3.17</code></td></tr>
	<tr><td><code>John 3:16-4:1 and 4:2-5a</code></td><td><code>John.3.16-John.4.1,John.4.2-John.4.5</code></td></tr>
</table>

## Program Flow

This section describes the parsing of a typical string:

```javascript
const bcv = new bcv_parser(lang); // Declare the object
bcv.parse("John 3:16"); // Do the parsing
console.log(bcv.osis()); // "John.3.16"
```

### Matching Potential Passages

The `bcv.parse()` function accepts a string. It first replaces any reserved characters that we're going to need later in the program without affecting any of the character indices.

Then it runs through all the regexps for Bible books (`match_books()`). In this case, it matches the `John` part of the string and replaces it with the characters `\x1f0\x1f`. The two `\x1f` characters provide boundaries for the match, and the `0` matches an index in the `books` array we're using to keep track of the original string and some metadata. (If there were more books, they would be `\x1f1\x1f`, `\x1f2\x1f`, etc.) These books aren't necessarily replaced in the order they appear in the string, but rather in the precedence order specified in `regexps.books`—we want to parse `1 John` before `John` so that program doesn't interpret the `John` in `1 John` as being a separate book. In other words, match longer books first.

Once it has matched all the possible books in the string, we call `match_passages()` to identify complete passages—we want to be sure to treat strings like `John 3:16, 17` as a single sequence. The `regexps.escaped_passage` used for these matches is fairly complicated. It looks for some unusual cases (`chapter 23 of Matthew`) first, but it pivots around the escaped book sequence from `match_books()`: it tries to find numbers and other characters that can comprise a valid sequence after a book (including other books). We know that we'll probably have to trim some of what it finds later; at this point, we want to be as comprehensive as possible.

For each match, we trim some unnecessary parts from the end of it and then run it through the grammar file that identifies the components of the string (in this case, `John 3:16` fits the pattern of a `bcv`, or book-chapter-verse). The grammar uses [Peggy](https://peggyjs.org/), a [parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) with a DSL that compiles to Javascript. A PEG provides predictable performance, especially for shorter strings like Bible references. The grammar identifies components in the match and, importantly, records the indices of where each component starts and ends in the string. Peggy's built-in extension mechanism provides an easy way to output the necessary data. The tradeoff of using a PEG arrives in the form of increased code size: around half the code in the minified file comes from the auto-generated grammar.

We also look here for a corner case of the format `1-2 Samuel`, where the book range precedes the book name. If it exists, we construct an object to use later.

After the regexp has found all the matches in the string (and the grammar has taken a pass at them), we return to `parse`, which loops through the results, sending each one in turn to the `bcv_passage` object.

### Interpreting Grammar Results

The `bcv_passage` object is responsible for the bulk of the heavy lifting in interpreting the output of the grammar. Most of its functions correspond to types (such as `bcv`) returned from the grammar. These functions accept three arguments: a `passage` that reflects the output from the grammar, an `accum` that reflects the processing results thus far, and a `context` that reflects the current processing state—if a function sees a `16` and knows that the context is `John.3`, it can interpret the `16` as a verse number rather than, say, `John.16`. These functions don't alter global state and are safe to run any number of times over the content, a situation that can happen if the initial parsing strategy doesn't work out.

In the case of a `bcv`, the `passage` object consists of two values: a `bc` (the book-chapter combination) and a `v` (the verse number). Since a new book renders any existing context unnecessary, we first get rid of the existing context. We then loop through the possible book values—usually there's only one, but an ambiguous book abbreviation like `Ph` (`Phil` or `Phlm`) can have more than one—to find valid references. For example, given `Ph 20`, we know that only Philemon fits the bill (`Phlm.1.20`) since there's no chapter 20 in Philippians. Much of the logic in functions dealing with books revolves around this process of identifying valid passages.

Once we've identified a viable book, we record the position of the match in the original string, set the `context` for any future processing, and move on. In the case of `John 3:16`, we're done and head back up to `parse`.

### Ranges

The `bcv` function is fairly straightforward—the logic doesn't get too convoluted. Much of the processing complexity in the parser arises from dealing with ranges that have errors in them or are ambiguous. The basic principle is that end ranges that go beyond the valid end of a book or a chapter are OK—people are often imprecise when it comes to remembering how many chapters are in a book or verses are in a chapter. Four tricky cases arise fairly often, however.

The first tricky case comes from people who like to use hyphens in ways that don't just indicate ranges. For example, the string `Hebrews 13-15` (Hebrews has thirteen chapters) most likely means `Hebrews 13:15`. In some cases, we can guess that that's the case and correct our interpretation. The algorithm the program uses asks whether the end chapter is too high—and if it is, whether the end chapter could be a valid start verse. If so, it proceeds as though that's the case.

The second tricky case arises from strings like `John 10:22-42 vs 27`. In this case, the grammar has indicated that `42 vs 27` is a `cv`, or chapter-verse (in other words, `John.10.22-John.42.27`). However, when the purported end chapter doesn't exist, it makes more sense to treat it as a sequence: `John.10.22-John.10.42,John.10.27`.

The third tricky case stems from strings like `Psalm 123-24`. The grammar output suggests that we should interpret this range as invalid: `Ps.123-Ps.24`. Instead, we choose to interpret it as `Ps.123-Ps.124`. This approach can be aggressive at times: does `Psalm 15-6` really mean `Ps.15-Ps.16`?

The fourth tricky case resembles the first one: `Jeremiah 33-11` isn't the invalid range `Jer.33-Jer.11` but rather the `bcv` `Jer.33.11`.

If we still couldn't make sense of the range, then we treat is as a sequence of verses instead of a range: `Psalm 120-119` becomes `Ps.120,Ps.119`.

### Translations

Translations are complicated because they propagate backward, whereas passage context propagates forward: `Matt 2 (KJV), Eph 6 (NIV)` means that the KJV should apply to Matthew 2, while the NIV should apply to Ephesians 6.

In theory, some translations could have different books or chapter/verse counts, so if we've made assumptions up to this point that, say, certain chapters have a specific number of verses, we may need to revisit those assumptions. Therefore, we reprocess everything we've already seen.

### Generating Output

With the `bcv_passage` processing complete, we exit the `parse()` function; you can now ask for the results in the format that's convenient for you.

All the output functions call `parsed_entities()`. This function loops through the results from `bcv_passage`, constructing an array of objects that other functions can draw from. This function ignores entities you're not interested in and adjusts indices to exclude some entities. For example, you may not want the `Ex` in `Hab 2 Ex`. (You can control this behavior using the options.) Most of the logic involves getting the indices right in corner cases.

This function also creates OSIS strings and can combine consecutive references into a single range (e.g., `John.1,John.2` becomes `John.1-John.2`).

You're probably not calling this function directly but instead are using `osis()` or `osis_and_indices()`, detailed above.

## Performance

Performance degrades with the number of passages found in a string. You can generally expect to parse over 100 KB per second.

## Alternate Versification Systems

The BCV parser supports several versification systems (described above). The appropriate versification system kicks in if the parsed text explicitly mentions a translation with an alternate versification system, or you can use `set_options({"versification_system":"..."})`. You can extend the relevant `translation_additions.js` to add additional ones (though the build process overwrites this file; you may be better off adding them in the `data.txt` for your language of interest.

You can also add new versification systems and translations at runtime using `.add_translations()`.

## Non-English Support

Each file in `esm/lang` provides support for additional languages.

### Supported Languages

Most of these languages are in [Google Translate](https://translate.google.com/). 

<table>
	<tr><th>Prefix</th><th>Language</th>
	<tr><td>ar</td><td>Arabic</td></tr>
	<tr><td>bg</td><td>Bulgarian</td></tr>
	<tr><td>ceb</td><td>Cebuano</td></tr>
	<tr><td>cs</td><td>Czech</td></tr>
	<tr><td>cy</td><td>Welsh</td></tr>
	<tr><td>da</td><td>Danish</td></tr>
	<tr><td>de</td><td>German</td></tr>
	<tr><td>el</td><td>Greek (mostly ancient)</td></tr>
	<tr><td>en</td><td>English</td></tr>
	<tr><td>es</td><td>Spanish</td></tr>
	<tr><td>fa</td><td>Farsi</td></tr>
	<tr><td>fi</td><td>Finnish</td></tr>
	<tr><td>fr</td><td>French</td></tr>
	<tr><td>he</td><td>Hebrew</td></tr>
	<tr><td>hi</td><td>Hindi</td></tr>
	<tr><td>hr</td><td>Croatian</td></tr>
	<tr><td>ht</td><td>Haitian Creole</td></tr>
	<tr><td>hu</td><td>Hungarian</td></tr>
	<tr><td>id</td><td>Indonesian</td></tr>
	<tr><td>is</td><td>Icelandic</td></tr>
	<tr><td>it</td><td>Italian</td></tr>
	<tr><td>ja</td><td>Japanese</td></tr>
	<tr><td>jv</td><td>Javanese</td></tr>
	<tr><td>ko</td><td>Korean</td></tr>
	<tr><td>la</td><td>Latin</td></tr>
	<tr><td>mk</td><td>Macedonian</td></tr>
	<tr><td>mr</td><td>Marathi</td></tr>
	<tr><td>ne</td><td>Nepali</td></tr>
	<tr><td>nl</td><td>Dutch</td></tr>
	<tr><td>no</td><td>Norwegian</td></tr>
	<tr><td>or</td><td>Oriya</td></tr>
	<tr><td>pa</td><td>Punjabi</td></tr>
	<tr><td>pl</td><td>Polish</td></tr>
	<tr><td>pt</td><td>Portuguese</td></tr>
	<tr><td>ro</td><td>Romanian</td></tr>
	<tr><td>ru</td><td>Russian</td></tr>
	<tr><td>sk</td><td>Slovak</td></tr>
	<tr><td>so</td><td>Somali</td></tr>
	<tr><td>sq</td><td>Albanian</td></tr>
	<tr><td>sr</td><td>Serbian</td></tr>
	<tr><td>sv</td><td>Swedish</td></tr>
	<tr><td>sw</td><td>Swahili</td></tr>
	<tr><td>ta</td><td>Tamil</td></tr>
	<tr><td>th</td><td>Thai</td></tr>
	<tr><td>tl</td><td>Tagalog</td></tr>
	<tr><td>tr</td><td>Turkish</td></tr>
	<tr><td>uk</td><td>Ukrainian</td></tr>
	<tr><td>ur</td><td>Urdu</td></tr>
	<tr><td>vi</td><td>Vietnamese</td></tr>
	<tr><td>zh</td><td>Chinese (both traditional and simplified)</td></tr>
</table>

When parsing a language that doesn't use Latin-based numbers (0-9), you probably want to set the `non_latin_digits_strategy` option to `replace`.

When using `<script>`s on the web, be sure to serve them with the `utf-8` character set—all files contain raw UTF-8 characters. The safest way to ensure the right character set is to include the `charset` attribute on the `<script>` tag:

```html
<script src="bcv_parser.js" charset="utf-8"></script>
```

### Cross-Language Support

Two files in `esm/lang` provide support for identifying translations in multiple languages at one time (e.g., "Matthew 2, Juan 1"). You can use this support if you don't know ahead of time what language someone might be using.

The files are:

1. `ascii.js`. Only supports characters in the set `[\x00-\x7f\u2000-\u206F]` (ASCII characters and certain punctuation marks like em-dashes). It runs about 12% slower than `en.js`, parsing around 140KB per second in the fuzz tester.
2. `full.js`. Parse book names across all languages. It runs about 30% slower than `en.js`, parsing around 110KB per second in the fuzz tester.

Some features, such as psalm titles, are still English-only, even in these cross-language files.

Executing `bin/add_cross_lang.pl full` or `bin/add_cross_lang.pl ascii` will recompile the needed source files. You can then compile the files as usual using the [build instructions](#building).

## Compatibility

These files work in any environment that supports ES2022; any browsers released since mid-2021 should support ES2022:

* Chrome 74+
* Safari 14.1+ (14.5+ on iOS)
* Edge 79+
* Firefox 90+
* Node 16+

The `js` folder contains an older version of this code (2.0.1) and supports much older browsers, back to IE8, Firefox 12, Chrome 19, and Node 0.10. The code in this folder is no longer maintained.

## Building

The BCV Parser uses the following projects (none of them is necessary unless you want to edit the source files or run tests) as dev dependencies:

* [esbuild](https://esbuild.github.io/) to package the files.
* [Jasmine 5.5.0](https://jasmine.github.io/) for the testing framework.
* [Peggy](https://github.com/peggyjs/peggy) for the parsing grammar.
* [Grex](https://github.com/pemistahl/grex) for optimizing generated regular expressions.

### Adding a Language

#### Create a Folder
In `src`, create a folder named after the [ISO 639 code](https://www.loc.gov/standards/iso639-2/php/code_list.php) of the desired language. For example: `fr`.

#### Create Data Files

Create a data.txt file inside that folder. I recommend copying the existing `data.txt` from `src/template`. The `research.xlsx` file in that folder can help you organize your work; you can copy/paste from that spreadsheet into the `data.txt` file.

Points to know:

1. Lines that start with `#` are comments.
2. Lines that start with `$` are variables.
	1. `$FIRST`, `$SECOND`, `$THIRD`, and `$FOURTH` are helpful for reducing redundancy in book names. For example, if you define `1` and `I` as values for `$FIRST`, then you can just write `$FIRST Samuel` and `$FIRST Corinthians` instead of repeating yourself for each book.
	2. $GOSPEL is helpful to reduce verbosity for names like "The Gospel according to Matthew".
	3. `$AB` is used by the parser to determine partial verses (like "Genesis 1:1a"). You probably want to avoid overlap with `$FF`. It's required.
	4. `$AND` is used by the parser for sequences. For example, in English, you'd define `and` here, while in Spanish, you'd define `y`. It's also useful for common expressions like `see also`. If you don't have a value for this, you can just use `&`. It's required.
	5. `$CHAPTER` is used by the parser to explicitly indicate chapters: `Genesis 1:1, 5` vs. `Genesis 1:1, chapter 5`. If you don't have a value for this, I'd just use the English `chapter`. It's required.
	6. `$FF` is used by the parser to indicate "and following", which it interprets as "to the end of the chapter" or "to the end of the book," depending on context. An exclamation mark (`!`) negates the following character or character class. `f![a-z]`) means an "f" not followed by the characters `a-z`. This syntax is passed onto the Peggy parser. If you don't have a value for this, I'd use the English `ff`. It's required.
	7. `$NEXT` is used in languages where one pattern indicates the immediate next verse (or chapter). In Polish, for example the `n![n]` pattern indicates a single `n`, not followed by another `n`; the `nn` is used for `$FF` to indicate an unknown number of following verses. It's optional.
	8. `$TITLE` is used by the parser for psalm titles (like `Psalm 3 title`). It's required.
	9. `$TRANS` defines custom translation names for your language. Each value has up to three components, separated by commas. Let's break down the (fictional) definition `NAS,NASB,kjv`. The `NAS` means to track `NAS` in what you're parsing, and to treat it as a known translation. The `NASB` means that when you get the value back to your script from the parser, you'll receive `NASB` instead of `NAS`. The `kjv` means to use the KJV versification system for this translation rather than the default. Often you'll omit parts: `NAS,,kjv` and `NAS,NASB` (this last one is the actual definition) both work. You should specify at least one translation for your language.
	10. `$TO` is used by the parser to identify ranges. Typically you want to use words here, but you can also use characters. If you don't have a value, I recommend using `-` (which treats the hyphen as a range). It's required.
	11. `$VERSE` is used by the parser to identify the words for `verse`. For example, `Philemon verse 2`. It's required.
	12. `$COLLAPSE_COMBINING_CHARACTERS` is used by the language generator to determine whether to unbundle accents. For example, `á` gets separated out into `[áa]`. If you don't want this behavior for your language, set this value to `false`. You can also handle this scenario on a case-by-case basis using backticks, as described below.
	13. `$PRE_BOOK_ALLOWED_CHARACTERS` is used by the language generator to identify allowed characters before books. See `zh` for an example (`[^\x1f]`, which means anything except another book character). In general, you don't need to set this variable.
	14. `$UNICODE_BLOCK` is used by the language generator to identify appropriate boundary characters. It's required. If you're not sure, I recommend setting it to `Latin`.
3. Lines that start with an OSIS book name are a tab-separated series of regular expression subsets.
	1. A backtick (`\``) following an accented character means not to allow the unaccented version of that character.
	2. A `?` makes the preceding character optional.
	3. A character class works like a simple RegExp character class: `[az]` means the characters `a` and `z` are allowed. Character ranges probably don't work.
	2. You can use the variables you defined earlier in the file in definitions. If you'd like the build process to create tests for book ranges like `1-3 John`, then be sure to define `$FIRST`, `$SECOND`, and `$THIRD` as variables in at least one definition for `1John`, `2John`, and `3John`.
4. Lines that start with `=` are the order in which to check the regular expressions for books (check for `3 John` before `John`, for example, so that the string `3 John 2` doesn't get parsed as `John 2`).
5. Lines that start with `*` are the preferred long and short names for each OSIS (not used here, but potentially used in a Bible application). The third column represents a still-shorter form, and the fourth column represents the form to use when a single Psalm is being looked at. In English, we'd say "Psalms 1-2" but "Psalm 1."

You can also create three other files:

1. `translation_additions.js` (see `en` for an example). This file lets you define translations with different book orders or numbers of verses in each chapter. The top-level keys are the versification system (the third component of your `$TRANS` definition). Each object can have an `order` object, a `chapters` object, or both. `order` is a fully specified canon. It must include all 84 books that this parser understands, or else the parser could break. If your canon doesn't include all 84 books, you can put the unused ones at the end. `chapters` is an object where each key is the OSIS book identifier, and the value is an array of numbers that represent the number of verses in each chapter. For example, `"Gen": [31, 25, ...]` indicates that Genesis 1 has 31 verses, and Genesis 2 has 25 verses. You must specify values for all chapters in a book, though the number of chapters can vary depending on the translation. For `Ps151`, use a `Ps151` key; don't create a `Ps` array with 151 items; the parser will eat the last item.
2. `spec_additions.js` (see `he` for an example). This file consists of Jasmine tests that you'd like to run for your language in addition to the standard parsing tests.
3. `psalm_cb.js` (see `en` for an example). This file lets you specify how to handle inverted Psalm queries, like `23rd Psalm`. If you use the English file as a model, I'd only edit the `regexp` key; the other keys should remain as they are.

#### Building the Language

Run either `npm run build-language fr` (where `fr` is the ISO code of your language, matching the folder name in `src`) or `sh bin/build_lang.sh fr`. It also run tests for that language.

To build a language, you'll need Perl with the JSON package and the dev dependencies. It uses `npx` to execute some functions.

#### Running Tests

If you have dev dependencies installed, the easiest way to run all tests is to use `npm run test`, which takes about a minute. You can also use `npx jasmine test/*.spec.* test/lang/*.spec.js`.

To run tests just for your language: `npx jasmine test/lang/de.spec.js` (replacing `de` with your language, unless your language is German, in which case `de` will work just fine for you).

There are also html files in `test/html` for browser testing. Because they use ES Modules, they won't run locally. ESBuild's [Serve functionality](https://esbuild.github.io/api/#serve) is your friend here.

## Purpose

This is the fourth complete Bible reference parser that I've written. It's how I try out new programming languages: the first one was in PHP (2002), which [saw production usage](https://web.archive.org/web/20100616201608/http://www.gnpcb.org/esv/share/about/) on the ESV Bible website from 2002-2011; the second in Perl (2007), which saw production usage on openbible.info starting in 2007; and the third in Ruby (2009), which never saw production usage because it was way too slow. This parser (at least on Node) is faster than the Perl one and 100 times faster than the Ruby one.

I originally chose Coffeescript out of curiosity—does it make Javascript that much more pleasant to work with? From a programming perspective, the easy loops and array comprehensions alone practically justify its use. From a readability perspective, the code is easier to follow (and come back to months later) than the equivalent Javascript—the tests, in particular, are much easier to read without all the Javascript punctuation.

However, the world has moved on since the original version of this parser in 2011, and Typescript is now standard in many workflows. Javascript has also adopted the easier loops, array comprehensions, and coalescing operators that made Coffeescript attractive. I used ChatGPT to take a first pass at rewriting each Coffeescript function into Typescript.

## License

The code in this project is licensed under the standard MIT License.

## Backlog Items

Here are improvements I have in mind for this parser.

1. Change the build process to be less finicky. The Perl is brittle and hard to debug. I'd like to remove nearly all the compile-time logic. Target release: 4.0.0 (January 2026).
2. Move language-definition files to a new repo to decouple the core parser logic from the language data, now that (as of 3.0.0) each language no longer requires its own grammar. This change will also allow adding significantly more languages but will require using ES Modules to take advantage of them. Existing language support will remain in the current repo so that there are no new dependencies for existing languages, but all the raw language data will likely move elsewhere. Target release: 4.0.0.
3. Improve type usage. This is my first experience with Typescript, and I'm confident a lot can be improved.

## Changelog

July 27, 2025 (3.1.0-alpha). Added `bcvp` as an `osis_compaction_strategy` to allow parsing output for "John 3:17a" to be structured as "John.3.17!a", following the OSIS spec. (Thanks to [hennessyevan](https://github.com/hennessyevan) for the suggestion.) Added a runtime `grammar` key in `options` to override language-specific parsing features. (Thanks to [renehamburger](https://github.com/renehamburger) for the suggestion.) Added `translations`and `books,translations` as values for `case_sensitive`. Updated dev dependencies to their latest versions.

January 11, 2025 (3.0.0). Full release here and on npm.

January 9, 2025 (3.0.0-beta2).

* Renamed `/es` to `/esm` to avoid confusion with "es" language.
* Renamed `.cjs` files in `/cjs` to `.js` and added package.json in relevant subfolders to default to treating them as CommonJS files.
* Changed the logic for `non_latin_digits_strategy: "replace"`. It now runs after book parsing instead of before. This change reduces the number of book names created in certain languages, avoids unexpected behavior while reading strings, and makes upcoming changes to the build process easier to implement. Because it's technically a backwards-incompatible change (although in reality there probably aren't practical implications to it), I wanted to get it in as part of the 3.0 release.

January 5, 2025 (3.0-beta). Renamed `add_passage_patterns()` to `add_books()` to better reflect what it does and to match `add_translations()`. The function signature also changed: it's a breaking change from 3.0-alpha. Added `add_translations()` to allow adding new translations at runtime.

January 1, 2025 (3.0-alpha). This release represents a major refactoring from Coffeescript into Typescript, so I want it to settle a bit before publishing it to npm.

The existing `js` folder wasn't touched, and the public API (as described above) hasn't changed in any backwards-incompatible way for CommonJS files. ES modules require a language argument to be passed to the constructor (see [usage](#usage) above).

* Replaced Coffeescript with Typescript. Notably, ES2022 (Node 16 and circa-2021 web browsers) is now the minimum supported version for new files (though the `js` folder still contains files generated for 2.0.1). It should be possible to use `esbuild --target=es2018` if you need something older, but this target isn't explicitly supported. Any older targets won't work. Backwards compatibility for older targets isn't a design goal for this release.
* Added an `es` folder (changed to `esm` in 3.0.0-beta2) to support `import`-style modules usage rather than CommonJS `require` modules. This change also separates the language data from the core parser; you now send language data to the parser object when you construct it.
* Added a `cjs` folder with `.cjs` files (changed to `.js` in 3.0.0-beta2) to support browsers and legacy `require` usage.
* Added an `add_passage_patterns()` (renamed to `add_books()` in 3.0-beta) function to let you add new book patterns at run time instead of at compile time.
* Added the `testaments` option.
* Added a `warn_level` option to show warnings in some cases.
* Added support for newer English translations like CSB and NRSVUE. Thanks to [dwo0](https://github.com/dwo0) for one correction here.
* Added support for Farsi (thanks to [ralaska](https://github.com/ralaska)) and Indonesian.
* Fixed a crashing bug when calling `.parsed_entities()` multiple times consecutively in specific cases.
* Switched from PEG.js to [Peggy](https://github.com/peggyjs/peggy) and from regexgen to [grex](https://github.com/pemistahl/grex) since both are maintained.
* Updated Jasmine to the latest version (5.5.0).
* Added [esbuild](https://esbuild.github.io/) to build different module styles.

May 4, 2017 (2.0.1). Fixed a bug in calculating positions for non-English Psalm titles. Switched to regexgen from frak for more deterministic regular expressions to reduce diff sizes. Added support for Turkish (thanks to [alerque](https://github.com/alerque)).

May 1, 2016 (2.0.0). Added additional Vulgate versification beyond Psalms. Because these changes are technically backwards-incompatible, the major version number is incrementing, but in practice the changes are minor.

November 1, 2015 (1.0.0). Added `punctuation_strategy` option to replace the "eu"-style files that were previously necessary for this functionality. Added `single_chapter_1_strategy` option to allow parsing of "Jude 1" as `Jude.1.1` rather than `Jude.1`. Fixed crashing bug related to dissociated chapter/book ranges. Upgraded to the latest versions of pegjs and Coffeescript. Added npm compatibility. Added support for a "next verse" syntax, which is used in Polish ("n" for next verse, compared to "nn" for "and following"). The parsing grammar includes this support only when the $NEXT variable is set in the language's data.txt file (only Polish for now). Thanks to [nirski](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/issues/16) for identifying this limitation.

May 4, 2015 (0.10.0). Hand-tuned some of the PEG.js output to improve overall performance by around 50% in most languages.

March 16, 2015 (0.9.0). Added [`parse_with_context()`](#parse_with_context) to let you supply a context for a given string. Added Welsh. Fixed some Somali book names. Added missing punctuation from abbreviations in some languages. Reduced size of "eu" files by omitting needless duplicate code. Improved testing code coverage and added a [fuzz tester](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/blob/master/bin/fuzz/fuzz_lang.coffee), which uncovered several crashing bugs.

November 3, 2014 (0.8.0). Fixed two bugs related to range rewriting. Updated frak to the latest development version. Added quite a few more languages, bringing the total to 46.

May 2, 2014 (0.7.0). Added the `passage_existence_strategy` option to relax how much validation the parser should do when given a possibly invalid reference. The extensive tests written for this feature uncovered a few other bugs. Added the `book_range_strategy` option to specify how to handle books when they appear in a range. Added [`translation_info()`](#translation_info). Fixed bug when changing versification systems several times and improved support for changing versification systems that rely on a different book order from the default. Updated PEG.js to 0.8.0. Added support for Arabic, Bulgarian, Russian, Thai, and Vietnamese.

November 8, 2013 (0.6.0). Recast English as just another language that uses the same build process as all the other languages. Fixed bug with parentheses in sequences. Made specs runnable using [jasmine-node](https://github.com/mhevery/jasmine-node). Optimized generated regular expressions for speed using [Frak](https://github.com/noprompt/frak). Added support for German, Greek, Italian, and Latin.

May 1, 2013 (0.5.0). Added option to allow case-sensitive book-name matching. Supported parsing `Ps151` as a book rather than a chapter for more-complete OSIS coverage. Added Japanese, Korean, and Chinese book names. Added an additional 90,000 real-world strings, sharing actual counts rather than orders of magnitude.

December 30, 2012 (0.4.0). Per request, added compile tools and Hebrew support.

November 20, 2012 (0.3.0). Improved support for parentheses. Added some alternate versification systems. Added French support. Removed `docs` folder because it was getting unwieldy; the source itself remains commented. Increased the number of real-world strings from 200,000 to 370,000.

May 16, 2012 (0.2.0). Added basic Spanish support. Fixed multiple capital-letter sequences. Upgraded PEG.js and Coffeescript to the latest versions. Deprecated support for IE6 and 7.

November 18, 2011 (0.1.0). First commit.

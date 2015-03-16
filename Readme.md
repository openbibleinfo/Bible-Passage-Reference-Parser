# Bible Passage Reference Parser

Try a [demo of the Bible passage reference parser](http://www.openbible.info/labs/reference-parser/).

This project is a Coffeescript implementation of a Bible-passage reference parser (e.g., seeing `John 3:16` and both understanding that it's a Bible reference and converting it into a form that computers can process). It parses Bible **B**ooks, **C**hapters, and **V**erses—thus the file names involving "BCV Parser."

Its primary use is to interpret query strings for use in a Bible application. It can extract BCVs from text but may be too aggressive for some uses. (See [Caveats](#caveats).)

It should be fairly speedy, taking under a millisecond to parse a short string of around 100 bytes.

The code occupies about 135KB minified and 24KB gzipped.

This project also provides extensively commented code and 465,000 real-world strings that you can use as a starting point to build your own BCV parser.

## Usage

For English, include `js/en_bcv_parser.min.js` in your project. For other languages, include the relevant `js/*_bcv_parser.js`.

These usage examples are in Javascript. You can also use Coffeescript, of course.

### Setup: In a Browser

```html
<script src="/path/js/en_bcv_parser.min.js" charset="UTF-8"></script>
<script>
	var bcv = new bcv_parser;
</script>
```

### Setup: Node.js

```javascript
var bcv_parser = require("/path/js/en_bcv_parser.min.js").bcv_parser;
var bcv = new bcv_parser;
```

### Parsing

Assuming you have an object named `bcv`:

#### `.parse("")`

This function does the parsing. It returns the `bcv` object and is suitable for chaining.

```javascript
bcv.parse("John 3:16"); // Returns the `bcv` object.
```

#### `.parse_with_context("", "")`

This function parses a string with a string context as the second argument. As with `.parse()`, it returns the `bcv` object and is suitable for chaining. Use this function if you have a string that starts with what you suspect is a reference and you already know the context. For example, maybe you're parsing a footnote that refers to "verse 16," and you know that the footnote is attached to John 3:

```javascript
bcv.parse("verse 16", "John 3"); // Returns the `bcv` object.
bcv.osis(); // "John.3.16"
```

It only matches relevant content at the beginning of the first argument; parsing `chapter 2` will work with context (assuming chapter 2 exists), but not `my favorite chapter is chapter 2`.

Without this function, you could manually prepend the context to the string, but it could get messy: with the context `John 3:16`, the string `verse 17` would become `John 3:16,verse 17`. Depending on your settings, this string might parse as `John.3.16-John.3.17`, which isn't what you want. `.parse_with_context()` lets you avoid such messiness.

Passing a translation as part of the context (`John 3:16 NIV`) doesn't apply the translation to the first argument. Translations always propagate backward, not forward (`Matt 5:6 (NIV)` rather than `NIV: Matt 5:6`). You can set the `versification_system` option to change the default translation.

#### `.osis()`

This function returns a single OSIS for the entire input, ignoring translations.

```javascript
bcv.parse("John 3:16 NIV").osis(); // "John.3.16"
bcv.parse("John 3:16-17").osis(); // "John.3.16-John.3.17"
bcv.parse("John 3:16,18").osis(); // "John.3.16,John.3.18"
bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis(); // "John.3.16,John.3.18,Matt.1"
```

#### `.osis_and_translations()`

This function returns an array. Each element in the array is an `[OSIS, Translation]` pair (both are strings).

```javascript
bcv.parse("John 3:16 NIV").osis_and_translations(); // [["John.3.16", "NIV"]]
bcv.parse("John 3:16-17").osis_and_translations(); // [["John.3.16-John.3.17", ""]]
bcv.parse("John 3:16,18").osis_and_translations(); // [["John.3.16,John.3.18", ""]]
bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis_and_translations(); // [["John.3.16,John.3.18", ""], ["Matt.1", "NIV,ESV"]]
```

#### `.osis_and_indices()`

This function returns an array. Each element in the array is an object with `osis` (a string), `translations` (an array of translation identifiers—an empty string unless a translation is specified), and `indices` (the start and end position in the string). The `indices` key is designed to be consistent with Twitter's implementation (the first character in a string has indices `[0, 1]`).

```javascript
bcv.parse("John 3:16 NIV").osis_and_indices(); // [{"osis": "John.3.16", "translations": ["NIV"], "indices": [0, 13]}]
bcv.parse("John 3:16-17").osis_and_indices(); // [{"osis": "John.3.16-John.3.17", "translations": [""], "indices": [0, 12]}]
bcv.parse("John 3:16,18").osis_and_indices(); // [{"osis": "John.3.16,John.3.18", "translations": [""], "indices": [0, 12]}]
bcv.parse("John 3:16,18. ### Matthew 1 (NIV, ESV)").osis_and_indices(); // [{"osis": "John.3.16,John.3.18", "translations": [""], "indices":[0, 12]}, {"osis": "Matt.1", "translations": ["NIV","ESV"], "indices": [18, 38]}]
```

#### `.parsed_entities()`

If you want to know a lot about how the BCV parser handled the input string, use this function. It can include messages if it adjusted the input or had trouble parsing it (e.g., if given an invalid reference).

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
   "entities": [
   		{ "osis": "John.3",
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

You may also see an `alternates` object if you provide an ambiguous book abbreviation (`Ph 2` could mean "Phil.2" or "Phlm.1.2").

#### `.include_apocrypha()`

This function takes a single Boolean value (`true` or `false`). If `true`, it tries to find the following books in the Apocrypha (or Deuterocanonicals): Tob, Jdt, GkEsth, Wis, Sir, Bar, PrAzar, Sus, Bel, SgThree, EpJer, 1Macc, 2Macc, 3Macc, 4Macc, 1Esd, 2Esd, PrMan, Ps151. Your canon may vary in the number of books, their order, or the number of verses in each chapter. If you set the value to `false` (the default behavior), it ignores books in the Apocrypha.

```javascript
bcv.parse("Tobit 1").osis(); // ""
bcv.include_apocrypha(true);
bcv.parse("Tobit 1").osis(); // "Tob.1"
```

You shouldn't call `include_apocrypha()` between calling `parse()` and one of the output functions—the output reflects the value of `include_apocrypha()` that was active during the call to `parse()`. You probably also don't want to call it every time you call `parse()`—it will slow down execution.

#### `.set_options({})`

This function takes an object that sets parsing and output options. See "Options" below for available keys and values. This function doesn't enforce valid values, but using values other than the ones described in "Options" will lead to unexpected behavior.

```javascript
bcv.set_options({"osis_compaction_strategy": "bcv"});
bcv.parse("Genesis 1").osis(); // "Gen.1.1-Gen.1.31"
```

### Administrative Functions

This function is separate from the parsing sequence and provides data that may be useful for other applications.

#### `.translation_info("")`

This function returns an object of data about the requested translation. You can use this data to determine, for example, the previous and next chapters for a given chapter, even when the given chapter is at the beginning or end of a book.

It takes an optional string argument that identifies the translation--if the translation is unknown, it returns data about the default translation. For English, abbreviations that will change the output are: `default`, `vulgate`, `ceb`, `kjv`, `nab` (or `nabre`), `nlt`, and `nrsv`. Sending this function the lower-cased translation output from `osis_and_translations()` or `osis_and_indices()` will return the correct translation information.

The returned object has three keys:

```javascript
{
	"order": {"Gen": 1, "Exod": 2, ...},
	"books": ["Gen", "Exod", "Lev", ...],
	"chapters": {"Gen": [31, 25, ...], "Exod": [22, 25, ...], ...}
}
```

The `order` key returns the order in which the books appear in the translation, starting at 1.

The `books` key lists the books in order, which you can use to find surrounding books. For example, if you know from `order` that `"Exod": 2`, you know that you can find it at `books[1]` (because the array is zero-based). Similarly, the book before `Exod` is at `books[0]`, and the book after it is at `books[2]`.

The `chapters` key lists the number of verses in each chapter: `chapters["Gen"][0]` tells you how many verses are in Genesis 1. Further, the `length` of each book's array tells you how many chapters are in each book: `chapters["Gen"].length` tells you how many chapters are in Genesis.

### Options

#### OSIS Output

* `consecutive_combination_strategy: "combine"`
	* `combine`: "Matt 5, 6, 7" → "Matt.5-Matt.7".
	* `separate`: "Matt 5, 6, 7" → "Matt.5,Matt.6,Matt.7".
* `osis_compaction_strategy: "b"`
	* `b`: OSIS refs get reduced to the shortest possible. "Gen.1.1-Gen.50.26" and "Gen.1-Gen.50" → "Gen", while "Gen.1.1-Gen.2.25" → "Gen.1-Gen.2".
	* `bc`: OSIS refs get reduced to complete chapters if possible, but not whole books. "Gen.1.1-Gen.50.26" → "Gen.1-Gen.50".
	* `bcv`: OSIS refs always include the full book, chapter, and verse. "Gen.1" → "Gen.1.1-Gen.1.31".

#### Sequence

* `book_sequence_strategy: "ignore"`
	* `ignore`: ignore any books on their own in sequences ("Gen Is 1" → "Isa.1").
	* `include`: any books that appear on their own get parsed according to `book_alone_strategy` ("Gen Is 1" → "Gen.1-Gen.50,Isa.1" if `book_alone_strategy` is `full` or `ignore`, or "Gen.1,Isa.1" if it's `first_chapter`).
* `invalid_sequence_strategy: "ignore"`
	* `ignore`: "Matt 99, Gen 1" sequence index starts at the valid `Gen 1`.
	* `include`: "Matt 99, Gen 1" sequence index starts at the invalid `Matt 99`.
* `sequence_combination_strategy: "combine"`
	* `combine`: sequential references in the text are combined into a single OSIS list: "Gen 1, 3" → "Gen.1,Gen.3".
	* `separate`: sequential references in the text are separated into their component parts: "Gen 1, 3" → "Gen.1" and "Gen.3".

#### Potentially Invalid Input

* `invalid_passage_strategy: "ignore"`
	* `ignore`: Don't include invalid passages in `@parsed_entities()`.
	* `include`: Include invalid passages in `@parsed_entities()` (they still don't have OSIS values).
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

#### Context

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

#### Apocrypha
* `ps151_strategy: "c"`
	* `c`: treat references to Psalm 151 (if using the Apocrypha) as a chapter: "Psalm 151:1" → "Ps.151.1"
	* `b`: treat references to Psalm 151 (if using the Apocrypha) as a book: "Psalm 151:1" → "Ps151.1.1". Be aware that for ranges starting or ending in Psalm 151, you'll get two OSISes, regardless of the `sequence_combination_strategy`: "Psalms 149-151" → "Ps.149-Ps.150,Ps151.1". Setting this option to `b` is the only way to correctly parse OSISes that treat `Ps151` as a book.

#### Versification
* `versification_system: "default"`
	* `default`: the default ESV-style versification. Also used in AMP and NASB.
	* `ceb`: use CEB versification, which varies mostly in the Apocrypha.
	* `kjv`: use KJV versification, with one fewer verse in 3John. Also used in NIV and NKJV.
	* `nab`: use NAB versification, which generally follows the Septuagint.
	* `nlt`: use NLT versification, with one extra verse in Rev. Also used in NCV.
	* `nrsv`: use NRSV versification.
	* `vulgate`: use Vulgate numbering for the Psalms.

#### Case Sensitivity
* `case_sensitive: "none"`
	* `none`: All matches are case-insensitive.
	* `books`: Book names are case-sensitive. Everything else is still case-insensitive.

### Messages

If you're calling `parsed_entities()` directly, the following keys can appear in `messages`; they don't always indicate an invalid reference; they may just indicate the chosen parsing strategy.

#### Start Objects

* `start_book_not_exist`: `true` if the given book doesn't exist in the translation. A book has to have an entry in the language's `regexps.coffee` file for this message to appear.
* `start_chapter_is_zero`: `1` if the requested start chapter is 0.
* `start_chapter_not_exist`: The value is the last valid chapter in the book.
* `start_chapter_not_exist_in_single_chapter_book`: `1` if wanting, say, `Philemon 2`. It is reparsed as a verse (`Philemon 1:2`).
* `start_chapter_not_numeric`: `true` if the start chapter isn't a number. You should never see this message.
* `start_verse_is_zero`: `1` if the requested start verse is 0.
* `start_verse_not_exist`: The value is the last valid verse in the chapter.
* `start_verse_not_numeric`: `true` if the start verse isn't a number. You should never see this message.

#### End Objects

* `end_book_before_start`: `true` if the end book is before the start book (the order is controlled in the language's `translations.coffee`). E.g., `Exodus-Genesis`.
* `end_book_not_exist`: `true` if the given book doesn't exist in the translation. A book has to have an entry in the language's `regexps.coffee` for this message to appear.
* `end_chapter_before_start`: `true` if the end chapter is before the start chapter in the same book.
* `end_chapter_is_zero`: `1` if the requested end chapter is `0`. The `1` indicates the first valid chapter.
* `end_chapter_not_exist`: The value is the last valid chapter in the book.
* `end_chapter_not_exist_in_single_chapter_book`: `1` if wanting, say, `Philemon 2-3`. It is reparsed as a verse (`Philemon 1:2-3`).
* `end_chapter_not_numeric`: `true` if the end chapter isn't a number. You should never see this message.
* `end_verse_before_start`: `true` if the end verse is before the start verse in the same book and chapter.
* `end_verse_is_zero`: `1` if the requested end verse is `0`. The `1` indicates the first valid verse.
* `end_verse_not_exist`: The value is the last valid verse in the chapter.
* `end_verse_not_numeric`: `true` if the end verse isn't a number. You should never see this message.

#### Translation Objects

* `translation_invalid`: `[]` if an invalid translation sequence appears. Each item in the array is a `translation` object.
* `translation_unknown`: `[]` if the translation is unknown. If you see this message, a translation exists in `bcv_parser::regexps.translations` but not in `bcv_parser::translations`. Each item in the array is a `translation` object.

## Caveats

The parser is quite aggressive in identifying text as Bible references; if you just hand it raw text, you will probably encounter false positives, where the parser identifies text as Bible references even when it isn't. For example, in the string `she is 2 cool`, the `is 2` becomes `Isa.2`.

The parser spends most of its time doing regular expressions and manipulating strings. If you give it a very long string full of Bible references, it could block your main event loop. Depending on your performance requirements, parsing large numbers of even short strings could saturate your CPU and lead to problems in the rest of your app.

In addition, a number of the tests in the "real-world" section of [`src/core/spec.coffee`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/blob/master/src/core/spec.coffee) have comments describing limitations of the parser. Unfortunately, it's hard to solve them without incorrectly parsing other cases—one person intends `Matt 1, 3` to mean `Matt.1,Matt.3`, while another intends it to mean `Matt.1.3`.

## Tests

One of the hardest parts of building a BCV parser is finding data to test it on to tease out corner cases. The file [`src/core/spec.coffee`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/blob/master/src/core/spec.coffee) has over 3,700 tests that illustrate the range of input that this parser can handle.

Separate from this repository (I used to bundle it until the file size became too large) are four data files that you can use to test your own parser. Derived from Twitter and Facebook mentions of Bible references, the dataset reflects how people really type references. It includes 4.7 million unique strings across 180 million total mentions. (For example, the most-popular string, "Philippians 4:13", is mentioned over 1.3 million times.)

1. [10+ mentions in the dataset](http://a.openbible.info/data/bcv-parser/10plus.zip). 465,000 unique strings, 4 MB. If you're just beginning to develop your own parser and are looking for raw data, start with this file.
2. [3-9 mentions in the dataset](http://a.openbible.info/data/bcv-parser/3-9.zip). 818,000 unique strings, 7 MB.
3. [2 mentions in the dataset](http://a.openbible.info/data/bcv-parser/2.zip). 743,000 unique strings, 7 MB.
4. [1 mention in the dataset](http://a.openbible.info/data/bcv-parser/1.zip). 2.7 million unique strings, 25 MB. This file contains strings that only appear once in the corpus.

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

## OSIS

[OSIS](http://www.bibletechnologies.net/) is a system for marking up Bibles in XML. The BCV parser only borrows the OSIS system for [book abbreviations](http://www.crosswire.org/wiki/OSIS_Book_Abbreviations) and references. You can control the OSIS specificity using the `osis_compaction_strategy` option.

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
bcv = new bcv_parser; // Declare the object
bcv.parse("John 3:16"); // Do the parsing
console.log(bcv.osis()); // "John.3.16"
```

### Matching Potential Passages

The `bcv.parse()` function accepts a string. It first replaces any reserved characters that we're going to need later in the program without affecting any of the character indices.

Then it runs through all the regexps for Bible books (`@match_books()`). In this case, it matches the `John` part of the string and replaces it with the characters `\x1f0\x1f`. The two `\x1f` characters provide boundaries for the match, and the `0` matches an index in the `@books` array we're using to keep track of the original string and some metadata. (If there were more books, they would be `\x1f1\x1f`, `\x1f2\x1f`, etc.) These books aren't necessarily replaced in the order they appear in the string, but rather in the precedence order specified in `@regexps.books`—we want to parse `1 John` before `John` so that program doesn't interpret the `John` in `1 John` as being a separate book. In other words, match longer books first.

Once it has matched all the possible books in the string, we call `@match_passages()` to identify complete passages—we want to be sure to treat strings like `John 3:16, 17` as a single sequence. The `@regexps.escaped_passage` used for these matches is fairly complicated. It looks for some unusual cases (`chapter 23 of Matthew`) first, but it pivots around the escaped book sequence from `@match_books()`: it tries to find numbers and other characters that can comprise a valid sequence after a book (including other books). We know that we'll probably have to trim some of what it finds later; at this point, we want to be as comprehensive as possible.

For each match, we trim some unnecessary parts from the end of it and then run it through the grammar file that identifies the components of the string (in this case, `John 3:16` fits the pattern of a `bcv`, or book-chapter-verse). The grammar uses [PEG.js](http://pegjs.majda.cz/), a [parsing expression grammar](http://en.wikipedia.org/wiki/Parsing_expression_grammar) with a DSL that compiles to Javascript. A PEG provides predictable performance, especially for shorter strings like Bible references. The grammar identifies components in the match and, importantly, records the indices of where each component starts and ends in the string. PEG.js's built-in extension mechanism provides an easy way to output the necessary data. The tradeoff of using a PEG arrives in the form of increased code size: more than half the code in the minified file comes from the auto-generated grammar.

We also look here for a corner case of the format `1-2 Samuel`, where the book range precedes the book name. If it exists, we construct an object to use later.

After the regexp has found all the matches in the string (and the grammar has taken a pass at them), we return to `@parse`, which loops through the results, sending each one in turn to the `bcv_passage` object.

### Interpreting Grammar Results

The `bcv_passage` object is responsible for the bulk of the heavy lifting in interpreting the output of the grammar. Most of its functions correspond to types (such as `bcv`) returned from the grammar. These functions accept three arguments: a `passage` that reflects the output from the grammar, an `accum` that reflects the processing results thus far, and a `context` that reflects the current processing state—if a function sees a `16` and knows that the context is `John.3`, it can interpret the `16` as a verse number rather than, say, `John.16`. These functions don't alter global state and are safe to run any number of times over the content, a situation that can happen if the initial parsing strategy doesn't work out.

In the case of a `bcv`, the `passage` object consists of two values: a `bc` (the book-chapter combination) and a `v` (the verse number). Since a new book renders any existing context unnecessary, we first get rid of the existing context. We then loop through the possible book values—usually there's only one, but an ambiguous book abbreviation like `Ph` (`Phil` or `Phlm`) can have more than one—to find valid references. For example, given `Ph 20`, we know that only Philemon fits the bill (`Phlm.1.20`) since there's no chapter 20 in Philippians. Much of the logic in functions dealing with books revolves around this process of identifying valid passages.

Once we've identified a viable book, we record the position of the match in the original string, set the `context` for any future processing, and move on. In the case of `John 3:16`, we're done and head back up to `@parse`.

### Ranges

The `bcv` function is fairly straightforward—the logic doesn't get too convoluted. Much of the processing complexity in the parser arises from dealing with ranges that have errors in them or are ambiguous. The basic principle is that end ranges that go beyond the valid end of a book or a chapter are OK—people are often imprecise when it comes to remembering how many chapters are in a book or verses are in a chapter. Four tricky cases arise fairly often, however.

The first tricky case comes from people who like to use hyphens in ways that don't just indicate ranges. For example, the string `Hebrews 13-15` (Hebrews has thirteen chapters) most likely means `Hebrews 13:15`. In some cases, we can guess that that's the case and correct our interpretation. The algorithm the program uses asks whether the end chapter is too high—and if it is, whether the end chapter could be a valid start verse. If so, it proceeds as though that's the case.

The second tricky case arises from strings like `John 10:22-42 vs 27`. In this case, the grammar has indicated that `42 vs 27` is a `cv`, or chapter-verse (in other words, `John.10.22-John.42.27`). However, when the purported end chapter doesn't exist, it makes more sense to treat it as a sequence: `John.10.22-John.10.42,John.10.27`.

The third tricky case stems from strings like `Psalm 123-24`. The grammar output suggests that we should interpret this range as invalid: `Ps.123-Ps.24`. Instead, we choose to interpret it as `Ps.123-Ps.124`. This approach can be aggressive at times: does `Psalm 15-6` really mean `Ps.15-Ps.16`?

The fourth tricky case resembles the first one: `Jeremiah 33-11` isn't the invalid range `Jer.33-Jer.11` but rather the `bcv` `Jer.33.11`.

If we still couldn't make sense of the range, then we treat is as a sequence of verses instead of a range: `Psalm 120-119` becomes `Ps.120,Ps.119`.

### Translations

Translations are complicated because they propagate backward, whereas passage context propagates forward: `Matt 2 (KJV), Eph 6 (NIV)` means that the KJV should apply to Matthew 2, while the NIV should apply to Ephesians 6.

In theory, some translations could have different books or chapter/verse counts, so if we've made assumptions up to this point that, say, the Apocrypha doesn't exist, we may need to revisit those assumptions. Therefore, we reprocess everything we've already seen.

### Generating Output

With the `bcv_passage` processing complete, we exit the `@parse()` function; you can now ask for the results in the format that's convenient for you.

All the output functions call `@parsed_entities()`. This function loops through the results from `bcv_passage`, constructing an array of objects that other functions can draw from. This function ignores entities you're not interested in and adjusts indices to exclude some entities. For example, you may not want the `Ex` in `Hab 2 Ex`. (You can control this behavior using the options.) Most of the logic involves getting the indices right in corner cases.

This function also creates OSIS strings and can combine consecutive references into a single range (e.g., `John.1,John.2` becomes `John.1-John.2`).

You're probably not calling this function directly but instead are using one of the `osis*()` functions detailed above.

## Performance

Performance degrades linearly with the number of passages found in a string. Using Node.js 0.10.33, it processes 1,300 tweets per second on a single 2.5 GHz core of an EC2 C4 Large instance.

In the worst case, given a string consisting of almost nothing but Bible passage references, it processes about 50-60 KB of text per second. In more realistic applications, it parses around 300 KB of text per second.

## Alternate Versification Systems

The BCV parser supports several versification systems (described above). The appropriate versification system kicks in if the parsed text explicitly mentions a translation with an alternate versification system, or you can use `@set_options({"versification_system":"..."})`. You can extend the relevant `translations.coffee` to add additional ones.

## Non-English Support

The Javascript files that don't start with `en` provide support for other languages. The [`js/eu/`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/tree/master/js/eu) files provide support for alternate punctuation: commas rather than colons to separate chapters and verses; periods rather than commas to separate sequences.

Using the files in [`src/template`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/tree/master/src/template) as a base, you can add support for additional languages; just use the appropriate ISO 639 language prefix. I'm happy to accept pull requests for new languages.

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
	<tr><td>fi</td><td>Finnish</td></tr>
	<tr><td>fr</td><td>French</td></tr>
	<tr><td>he</td><td>Hebrew</td></tr>
	<tr><td>hi</td><td>Hindi</td></tr>
	<tr><td>hr</td><td>Croatian</td></tr>
	<tr><td>ht</td><td>Haitian Creole</td></tr>
	<tr><td>hu</td><td>Hungarian</td></tr>
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
	<tr><td>uk</td><td>Ukrainian</td></tr>
	<tr><td>ur</td><td>Urdu</td></tr>
	<tr><td>vi</td><td>Vietnamese</td></tr>
	<tr><td>zh</td><td>Chinese (both traditional and simplified)</td></tr>
</table>

When parsing a language that doesn't use Latin-based numbers (0-9), you probably want to set the `non_latin_digits_strategy` option to `replace`.

When using `<script>`s on the web, be sure to serve them with the `utf-8` character set--many of the files contain raw UTF-8 characters. The safest way to ensure the right character set is to include the `charset` attribute on the `<script>` tag:

```html
<script src="en_bcv_parser.min.js" charset="UTF-8"></script>
```

### Cross-Language Support

Two files in [`/js`](https://github.com/openbibleinfo/Bible-Passage-Reference-Parser/tree/master/js) provide support for identifying translations in multiple languages at one time (e.g., "Matthew 2, Juan 1"). You can use this support if you don't know ahead of time what language someone might be using.

The files are:

1. `ascii_bcv_parser.js`. Only supports characters in the set `[\x00-\x7f\u2000-\u206F]` (ASCII characters and certain punctuation marks like em-dashes). It runs about 13% slower than just the `en` file: around 1,150 tweets per second on an EC2 C4 Large.
1. `full_bcv_parser.js`. Parse book names across all languages. It runs about 25% slower than the `ascii` file, or 34% slower than the `en` file: around 900 tweets per second on an EC2 C4 Large.

Some features, such as psalm titles, are still English-only, even in these cross-language titles.

Executing `bin/add_cross_lang.pl full` or `bin/add_cross_lang.pl ascii` will recompile the needed source files. You can then compile the files as usual using the below build instructions.

## Compatibility

I've specifically tested the following browsers, but it should work in any modern browser. If not, please feel free to open an issue.

* Internet Explorer 8+. Internet Explorer 6 and 7 may work; PEG.js doesn't officially support these browsers.
* Firefox 12+.
* Chrome 19+ and Node 0.10+.

## Building

The BCV Parser uses the following projects (none of them is necessary unless you want to edit the source files or run tests):

* [Closure](http://code.google.com/closure/) for minifying.
* [Coffeescript 1.9.1](http://coffeescript.org/) for compiling into Javascript.
* [Frak](https://github.com/noprompt/frak) for optimizing generated regular expressions.
* [Jasmine 2.2.0](http://jasmine.github.io/) for the testing framework. To run tests, install it in the project's `/lib` folder.
* [PEG.js 0.8.0](http://pegjs.majda.cz/) for the parsing grammar.

The language's grammar file is wrapped into the relevant `*_bcv_parser.js` file. The `space` rule is changed to use the `\s` character class instead of enumerating different space characters. The current version of PEG.js doesn't support the `\s` character class, so we post-process the output to include it.

### Build Instructions

1. In `src`, create a folder named after the [ISO 639 code](http://www.loc.gov/standards/iso639-2/php/code_list.php) of the desired language. For example: `fr`.
2. Create a data.txt file inside that folder. Lines that start with `#` are comments. Lines that start with `$` are variables. Lines that start with an OSIS book name are a tab-separated series of regular expressions (a backtick following an accented character means not to allow the unaccented version of that character). Lines that start with `=` are the order in which to check the regular expressions (check for "3 John" before "John," for example). Lines that start with `*` are the preferred long and short names for each OSIS (not used here, but potentially used in a Bible application).
3. In `bin`, run `01.add_lang.pl [ISO code]` to create the `src` files. This file expects `node` to be available in your `$PATH`.For example, `01.add_lang.pl fr`.
4. In `bin`, run `02.compile.pl [ISO code]` to create the output Javascript files and tests. This file expects `pegjs` and `coffee` to be available in your `$PATH`. For example: `02.compile.pl fr`.
5. In `bin`, run `03.run_tests.sh` to run tests on all the available languages in `test/js`. It requires [jasmine-node](https://github.com/mhevery/jasmine-node). Alternately, visit the relevant `test/[ISO code].html` file in a browser (which expects [Jasmine](https://github.com/pivotal/jasmine) to be in `lib/jasmine`).

## Purpose

This is the fourth complete Bible reference parser that I've written. It's how I try out new programming languages: the first one was in PHP (2002), which [saw production usage](http://about.esvbible.org/uncategorized/technical-introduction-to-the-esv-online-edition/) on a Bible search website from 2002-2011; the second in Perl (2007), which saw production usage on a Bible-related site starting in 2007; and the third in Ruby (2009), which never saw production usage because it was way too slow. This Coffeescript parser (at least on V8) is faster than the Perl one and 100 times faster than the Ruby one.

I chose Coffeescript out of curiosity—does it make Javascript that much more pleasant to work with? From a programming perspective, the easy loops and array comprehensions alone practically justify its use. From a readability perspective, the code is easier to follow (and come back to months later) than the equivalent Javascript—the tests, in particular, are much easier to follow without all the Javascript punctuation.

This code is in production use on a site that indexes [Bible verses on Twitter and Facebook](http://www.openbible.info/realtime/).

## License

The code in this project is licensed under the included MIT License except for the bundled, Javscript-compiled version of Frak (`bin/js/frak.min.js`), which is licensed under the [Eclipse Public License](http://www.eclipse.org/legal/epl-v10.html). Frak is a dependency only if you're compiling a new language--it's not necessary to run the parser in your project. If you're only parsing content, that usage falls entirely under the MIT License.

## Changelog

March 16, 2015. Added `parse_with_context()` to let you supply a context for a given string. Added Welsh. Fixed some Somali book names. Added missing punctuation from abbreviations in some languages. Reduced size of "eu" files by omitting needless duplicate code. Improved testing code coverage and added a fuzz tester in `bin/fuzz`, which uncovered several crashing bugs.

November 3, 2014. Fixed two bugs related to range rewriting. Updated frak to the latest development version. Added quite a few more languages, bringing the total to 46.

May 2, 2014. Added the `passage_existence_strategy` option to relax how much validation the parser should do when given a possibly invalid reference. The extensive tests written for this feature uncovered a few other bugs. Added the `book_range_strategy` option to specify how to handle books when they appear in a range. Added `translation_info()`. Fixed bug when changing versification systems several times and improved support for changing versification systems that rely on a different book order from the default. Updated PEG.js to 0.8.0. Added support for Arabic, Bulgarian, Russian, Thai, and Vietnamese.

November 8, 2013. Recast English as just another language that uses the same build process as all the other languages. Fixed bug with parentheses in sequences. Made specs runnable using [jasmine-node](https://github.com/mhevery/jasmine-node). Optimized generated regular expressions for speed using [Frak](https://github.com/noprompt/frak). Added support for German, Greek, Italian, and Latin.

May 1, 2013. Added option to allow case-sensitive book-name matching. Supported parsing `Ps151` as a book rather than a chapter for more-complete OSIS coverage. Added Japanese, Korean, and Chinese book names. Added an additional 90,000 real-world strings, sharing actual counts rather than orders of magnitude.

December 30, 2012. Per request, added compile tools and Hebrew support.

November 20, 2012. Improved support for parentheses. Added some alternate versification systems. Added French support. Removed `docs` folder because it was getting unwieldy; the source itself remains commented. Increased the number of real-world strings from 200,000 to 370,000.

May 16, 2012. Added basic Spanish support. Fixed multiple capital-letter sequences. Upgraded PEG.js and Coffeescript to the latest versions. Deprecated support for IE6 and 7.

November 18, 2011. First commit.
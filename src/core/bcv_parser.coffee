# This class takes a string and identifies Bible passage references in that string. It's designed to handle how people actually type Bible passages and tries fairly hard to make sense of dubious possibilities.
# 
# The aggressiveness is tunable, to a certain extent, using the below `options`. It's probably too aggressive for general text parsing (the "is 2" in "There is 2 much" becomes "Isa.2", for example).

# Export to whatever the current context is.
root = this

class bcv_parser
	s: ""
	entities: []
	passage: null
	regexps: {}
	# ## Main Options
	options:
		# ### OSIS Output
		# * `combine`:  "Matt 5, 6, 7" -> "Matt.5-Matt.7".
		# * `separate`: "Matt 5, 6, 7" -> "Matt.5,Matt.6,Matt.7".
		consecutive_combination_strategy: "combine"
		# * `b`: OSIS refs get reduced to the shortest possible. "Gen.1.1-Gen.50.26" and "Gen.1-Gen.50" -> "Gen", while "Gen.1.1-Gen.2.25" -> "Gen.1-Gen.2".
		# * `bc`: OSIS refs get reduced to complete chapters if possible, but not whole books. "Gen.1.1-Gen.50.26" -> "Gen.1-Gen.50".
		# * `bcv`: OSIS refs always include the full book, chapter, and verse. "Gen.1" -> "Gen.1.1-Gen.1.31".
		osis_compaction_strategy: "b"

		# ### Sequence
		# * `ignore`: ignore any books on their own in sequences ("Gen Is 1" -> "Isa.1").
		# * `include`: any books that appear on their own get parsed according to `book_alone_strategy` ("Gen Is 1" means "Gen.1-Gen.50,Isa.1" if `book_alone_strategy` is `full` or `ignore`, or "Gen.1,Isa.1" if it's `first_chapter`).
		book_sequence_strategy: "ignore"
		# * `ignore`: "Matt 99, Gen 1" sequence index starts at the valid `Gen 1`.
		# * `include`: "Matt 99, Gen 1" sequence index starts at the invalid `Matt 99`.
		invalid_sequence_strategy: "ignore"
		# * `combine`: sequential references in the text are combined into a single OSIS list: "Gen 1, 3" -> "Gen.1,Gen.3".
		# * `separate`: sequential references in the text are separated into their component parts: "Gen 1, 3" -> "Gen.1" and "Gen.3".
		sequence_combination_strategy: "combine"

		# ### Potentially Invalid Input
		# * `ignore`: Don't include invalid passages in `@parsed_entities()`.
		# * `include`: Include invalid passages in `@parsed_entities()` (they still don't have OSIS values).
		invalid_passage_strategy: "ignore"
		# * `ignore`: treat non-Latin digits the same as any other character.
		# * `replace`: replace non-Latin (0-9) numeric digits with Latin digits. This replacement occurs before any book substitution.
		non_latin_digits_strategy: "ignore"
		# * Include `b` in the string to validate book order ("Revelation to Genesis" is invalid).
		# * Include `c` in the string to validate chapter existence. If omitted, strings like "Genesis 51" (which doesn't exist) return as valid. Omitting `c` means that looking up full books will return `999` as the end chapter: "Genesis to Exodus" → "Gen.1-Exod.999".
		# * Include `v` in the string to validate verse existence. If omitted, strings like `Genesis 1:100` (which doesn't exist) return as valid. Omitting `v` means that looking up full chapters will return `999` as the end verse: "Genesis 1:2 to chapter 3" → "Gen.1.2-Gen.3.999".
		# * Tested values are `b`, `bc`, `bcv`, `bv`, `c`, `cv`, `v`, and `none`. In all cases, single-chapter books still respond as single-chapter books to allow treating strings like `Obadiah 2` as `Obad.1.2`.
		passage_existence_strategy: "bcv"
		# * `error`: zero chapters ("Matthew 0") are invalid.
		# * `upgrade`: zero chapters are upgraded to 1: "Matthew 0" -> "Matt.1".
		# Unlike `zero_verse_strategy`, chapter 0 isn't allowed.
		zero_chapter_strategy: "error"
		# * `error`: zero verses ("Matthew 5:0") are invalid.
		# * `upgrade`: zero verses are upgraded to 1: "Matthew 5:0" -> "Matt.5.1".
		# * `allow`: zero verses are kept as-is: "Matthew 5:0" -> "Matt.5.0". Some traditions use 0 for Psalm titles.
		zero_verse_strategy: "error"

		# ### Context
		# * `ignore`: any books that appear on their own don't get parsed as books ("Gen saw" doesn't trigger a match, but "Gen 1" does).
		# * `full`: any books that appear on their own get parsed as the complete book ("Gen" means "Gen.1-Gen.50").
		# * `first_chapter`: any books that appear on their own get parsed as the first chapter ("Gen" means "Gen.1").
		book_alone_strategy: "ignore"
		# * `ignore`: any books that appear on their own in a range are ignored ("Matt-Mark 2" means "Mark.2").
		# * `include`: any books that appear on their own in a range are included as part of the range ("Matt-Mark 2" means "Matt.1-Mark.2", while "Matt 2-Mark" means "Matt.2-Mark.16").
		book_range_strategy: "ignore"
		# * `delete`: remove any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5". This is better for text extraction.
		# * `include`: keep any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5.1". This is better for query parsing.
		captive_end_digits_strategy: "delete"
		# * `verse`: treat "Jer 33-11" as "Jer.33.11" (end before start) and "Heb 13-15" as "Heb.13.15" (end range too high).
		# * `sequence`: treat them as sequences.
		end_range_digits_strategy: "verse"

		# ### Apocrypha
		# Don't set this value directly; use the `include_apocrypha` or `set_options` functions.
		include_apocrypha: false
		# `c`: treat references to Psalm 151 (if using the Apocrypha) as a chapter: "Psalm 151:1" -> "Ps.151.1"
		# `b`: treat references to Psalm 151 (if using the Apocrypha) as a book: "Psalm 151:1" -> "Ps151.1.1". Be aware that for ranges starting or ending in Psalm 151, you'll get two OSISes, regardless of the `sequence_combination_strategy`: "Psalms 149-151" -> "Ps.149-Ps.150,Ps151.1" Setting this option to `b` is the only way to correctly parse OSISes that treat `Ps151` as a book.
		ps151_strategy: "c"

		# ### Versification System
		# Don't set this value directly; use the `versification_system` or `set_options` functions.
		# * `default`: the default ESV-style versification. Also used in AMP and NASB.
		# * `ceb`: use CEB versification, which varies mostly in the Apocrypha.
		# * `kjv`: use KJV versification, with one fewer verse in 3John. Also used in NIV and NKJV.
		# `nab`: use NAB versification, which generally follows the Septuagint.
		# * `nlt`: use NLT versification, with one extra verse in Rev. Also used in NCV.
		# * `nrsv`: use NRSV versification.
		# * `vulgate`: use Vulgate (Greek) numbering for the Psalms.
		versification_system: "default"

		# ### Case Sensitivity
		# Don't use this value directly; use the `set_options` function. Changing this option repeatedly will slow down execution.
		# * `none`: All matches are case-insensitive.
		# * `books`: Book names are case-sensitive. Everything else is still case-insensitive.
		case_sensitive: "none"

	# Remember default options for later use.
	constructor: ->
		@options = {}
		for own key, val of bcv_parser::options
			@options[key] = val
		# If we've changed the versification system, make sure previous object invocations don't leak.
		@versification_system @options.versification_system

	# ## Parse-Related Functions
	# Parse a string and prepare the object for further interrogation, depending on what's needed.
	parse: (s) ->
		@reset()
		@s = s
		# Replace any control characters already in the string.
		s = @replace_control_characters s
		# Get a string representation suitable for passing to the parser.
		[s, @passage.books] = @match_books s
		# Replace potential BCVs one at a time to reduce processing time on long strings.
		[@entities] = @match_passages s
		# Allow chaining.
		this

	# Parse a string and prepare the object for further interrogation, depending on what's needed. The second argument is a string that serves as the context for the first argument. If there's a valid partial match at the beginning of the first argument, then it will parse it using the supplied `context`. For example, `parse_string_with_context("verse 2", "Genesis 3").osis()` = `Gen.3.2`. You'd use this when you have some text that looks like it's a partial reference, and you already know the context.
	parse_with_context: (s, context) ->
		@reset()
		[context, @passage.books] = @match_books @replace_control_characters(context)
		[entities, context] = @match_passages context
		@reset()
		@s = s
		# Replace any control characters already in the string.
		s = @replace_control_characters s
		# Get a string representation suitable for passing to the parser.
		[s, @passage.books] = @match_books s
		@passage.books.push
			value: "",
			parsed: [],
			start_index: 0,
			type: "context",
			context: context
		# Reconstruct the string, adding in the context. Because we've already called `match_books`, the resulting offsets will reflect the original string and not the new string.
		s = "\x1f" + (@passage.books.length - 1) + "/9\x1f" + s
		# Replace potential BCVs one at a time to reduce processing time on long strings.
		[@entities] = @match_passages s
		# Allow chaining.
		this

	# If we have a new string to parse, reset any values from previous parses.
	reset: ->
		@s = ""
		@entities = []
		if @passage
			@passage.books = []
			@passage.indices = {}
		else
			@passage = new bcv_passage
			@passage.options = @options
			@passage.translations = @translations

	# ## Options-Related Functions
	# Override default options.
	set_options: (options) ->
		for own key, val of options
			# The drawback with this approach is that calling `include_apocrypha`, `versification_system`, and `case_sensitive` could regenerate `@regexps.books` three times.
			if key is "include_apocrypha" or key is "versification_system" or key is "case_sensitive"
				@[key] val
			else
				@options[key] = val
		this

	# Whether to use books and abbreviations from the Apocrypha. Takes a boolean argument: `true` to include the Apocrypha and `false` to not. Defaults to `false`. Returns the `bcv_parser` object.
	include_apocrypha: (arg) ->
		return this unless arg? and (arg is true or arg is false)
		@options.include_apocrypha = arg
		@regexps.books = @regexps.get_books arg, @options.case_sensitive
		for own translation of @translations
			continue if translation is "aliases" or translation is "alternates"
			# If the `Ps` array in the `chapters` object doesn't exist, create it so that we can add Ps 151 to the end of it.
			@translations[translation].chapters ?= {}
			@translations[translation].chapters["Ps"] ?= bcv_utils.shallow_clone_array @translations["default"].chapters["Ps"]
			# Add Ps 151 to the end of Psalms. The assumption here is that Ps151 always only is one chapter long.
			if arg is true
				if @translations[translation].chapters["Ps151"]?
					verse_count = @translations[translation].chapters["Ps151"][0]
				else
					verse_count = @translations["default"].chapters["Ps151"][0]
				@translations[translation].chapters["Ps"][150] = verse_count
			# Remove Ps 151 from the end of Psalms.
			else
				@translations[translation].chapters["Ps"].pop() if @translations[translation].chapters["Ps"].length == 151
		this

	# Use an alternate versification system. Takes a string argument; the built-in options are: `default` to use KJV-style versification and `vulgate` to use the Vulgate (Greek) Psalm numbering. English offers several other versification systems; see the Readme for details.
	versification_system: (system) ->
		return this unless system? and @translations[system]?
		# If we've already changed the `versification_system` once, we need to do some cleanup before we change it to something else.
		if @translations.alternates.default?
			# If we're changing to the default from something else, make sure we reset it to the correct values.
			if system is "default"
				if @translations.alternates.default.order?
					@translations.default.order = bcv_utils.shallow_clone @translations.alternates.default.order
				for own book, chapter_list of @translations.alternates.default.chapters
					@translations.default.chapters[book] = bcv_utils.shallow_clone_array chapter_list
			# Make sure the `versification_system` is reset to the default before applying any changes--alternate systems only include differences from the default.
			else
				@versification_system "default"
		@translations.alternates.default ?= order: null, chapters: {}
		# If we're updating the book order (e.g., to mix the Apocrypha into the Old Testament)...
		if system isnt "default" and @translations[system].order?
			# Save the existing default order so we can get it back later if necessary. We want to do everything nondestructively.
			@translations.alternates.default.order ?= bcv_utils.shallow_clone @translations.default.order
			# The `order` key should always contain the full order; too many things can go wrong if we try to merge the old order and the new one.
			@translations.default.order = bcv_utils.shallow_clone @translations[system].order
		# If we're updating the number of chapters in a book or the number of verses in a chapter...
		if system isnt "default" and @translations[system].chapters?
			# Loop through only the books that are changing.
			for own book, chapter_list of @translations[system].chapters
				# Save the existing default order so we can get it back later. Only set it the first time.
				@translations.alternates.default.chapters[book] ?= bcv_utils.shallow_clone_array @translations.default.chapters[book]
				@translations.default.chapters[book] = bcv_utils.shallow_clone_array chapter_list
		# Depending on the order of operations, the cloned list could be inconsistent with the current state. For example, if we called `versification_system`, we've cached 150 Psalms. If we then call `include_apocrypha(true)`, we now have 151 Psalms. If we then call `versification_system` again, we're back, incorrectly, to 150 Psalms because that's what was cached.
		@options.versification_system = system
		@include_apocrypha @options.include_apocrypha
		this

	# Whether to treat books as case-sensitive. Valid values are `none` and `books`.
	case_sensitive: (arg) ->
		return this unless arg? and (arg is "none" or arg is "books")
		# If nothing is changing, don't bother continuing
		return this if (arg is @options.case_sensitive)
		@options.case_sensitive = arg
		@regexps.books = @regexps.get_books @options.include_apocrypha, arg
		this

	# ## Administrative Functions
	# Return translation information so that we don't have to reach into semi-private objects to grab the data we need.
	translation_info: (new_translation="default") ->
		if new_translation? and @translations.aliases[new_translation]?.alias?
			new_translation = @translations.aliases[new_translation].alias
		new_translation = "default" unless new_translation? and @translations[new_translation]?
		old_translation = @options.versification_system
		@versification_system(new_translation) if new_translation isnt old_translation
		out =
			order: bcv_utils.shallow_clone @translations.default.order
			books: []
			chapters: {}
		for own book, chapter_list of @translations.default.chapters
			out.chapters[book] = bcv_utils.shallow_clone_array chapter_list
		for own book, id of out.order
			out.books[id-1] = book
		@versification_system(old_translation) if new_translation isnt old_translation
		out

	# ## Parsing-Related Functions
	# Replace control characters and spaces since we replace books with a specific character pattern. The string changes, but the length stays the same so that indices remain valid. If we want to use Latin numbers rather than non-Latin ones, replace them here.
	replace_control_characters: (s) ->
		s = s.replace @regexps.control, " "
		if @options.non_latin_digits_strategy is "replace"
			s = s.replace /[٠۰߀०০੦૦୦0౦೦൦๐໐༠၀႐០᠐᥆᧐᪀᪐᭐᮰᱀᱐꘠꣐꤀꧐꩐꯰０]/g, "0"
			s = s.replace /[١۱߁१১੧૧୧௧౧೧൧๑໑༡၁႑១᠑᥇᧑᪁᪑᭑᮱᱁᱑꘡꣑꤁꧑꩑꯱１]/g, "1"
			s = s.replace /[٢۲߂२২੨૨୨௨౨೨൨๒໒༢၂႒២᠒᥈᧒᪂᪒᭒᮲᱂᱒꘢꣒꤂꧒꩒꯲２]/g, "2"
			s = s.replace /[٣۳߃३৩੩૩୩௩౩೩൩๓໓༣၃႓៣᠓᥉᧓᪃᪓᭓᮳᱃᱓꘣꣓꤃꧓꩓꯳３]/g, "3"
			s = s.replace /[٤۴߄४৪੪૪୪௪౪೪൪๔໔༤၄႔៤᠔᥊᧔᪄᪔᭔᮴᱄᱔꘤꣔꤄꧔꩔꯴４]/g, "4"
			s = s.replace /[٥۵߅५৫੫૫୫௫౫೫൫๕໕༥၅႕៥᠕᥋᧕᪅᪕᭕᮵᱅᱕꘥꣕꤅꧕꩕꯵５]/g, "5"
			s = s.replace /[٦۶߆६৬੬૬୬௬౬೬൬๖໖༦၆႖៦᠖᥌᧖᪆᪖᭖᮶᱆᱖꘦꣖꤆꧖꩖꯶６]/g, "6"
			s = s.replace /[٧۷߇७৭੭૭୭௭౭೭൭๗໗༧၇႗៧᠗᥍᧗᪇᪗᭗᮷᱇᱗꘧꣗꤇꧗꩗꯷７]/g, "7"
			s = s.replace /[٨۸߈८৮੮૮୮௮౮೮൮๘໘༨၈႘៨᠘᥎᧘᪈᪘᭘᮸᱈᱘꘨꣘꤈꧘꩘꯸８]/g, "8"
			s = s.replace /[٩۹߉९৯੯૯୯௯౯೯൯๙໙༩၉႙៩᠙᥏᧙᪉᪙᭙᮹᱉᱙꘩꣙꤉꧙꩙꯹９]/g, "9"
		s

	# Find and replace instances of Bible books.
	match_books: (s) ->
		books = []
		# Replace all book strings.
		for book in @regexps.books
			# Using array concatenation instead of replacing text directly didn't offer performance improvements in tests of the approach.
			s = s.replace book.regexp, (full, prev, bk) ->
				# `value` contains the raw string; `book.osis` is the osis value for the book.
				books.push value: bk, parsed: book.osis, type: "book"
				extra = if book.extra? then "/" + book.extra else ""
				"#{prev}\x1f#{books.length - 1}#{extra}\x1f"
		# Replace translations.
		s = s.replace @regexps.translations, (match) ->
			books.push value: match, parsed: match.toLowerCase(), type: "translation"
			"\x1e#{books.length - 1}\x1e";
		[s, @get_book_indices(books, s)]

	# Get the string index for all the books / translations, adding the start index as a new key.
	get_book_indices: (books, s) ->
		add_index = 0
		re = ///
			([\x1f\x1e])	# opening book or translation
			(\d+)			# the number
			(?:/\d+)?		# optional extra identifier
			\1				# closing delimeter
			///g
		while match = re.exec s
			# Keep track of the actual start index.
			books[match[2]].start_index = match.index + add_index
			# Add the difference between the real length of the book and what we replaced it with (match[0] is the replacement).
			add_index += books[match[2]].value.length - match[0].length
		books

	# Create an array of all the potential bcv matches in the string.
	match_passages: (s) ->
		entities = []
		post_context = {}
		while match = @regexps.escaped_passage.exec s
			# * `match[0]` includes the preceding character (if any) for bounding.
			# * `match[1]` is the full match minus the character preceding the match used for bounding.
			# * `match[2]` is the book id.
			[full, part, book_id] = match
			# Adjust the `index` to use the `part` offset rather than the `full` offset. We use it below for `captive_end_digits`.
			original_part_length = part.length
			match.index += full.length - original_part_length
			# Remove most three+-character digits at the end; they won't match.
			if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/).test part
				re = /\s+\d+\s*$/
				part = part.replace re, ""
			# Clean up the end of the match to avoid irrelevant context.
			unless /[\d\x1f\x1e)]$/.test part
				# Remove superfluous characters from the end of the match.
				part = @replace_match_end part
			if @options.captive_end_digits_strategy is "delete"
				# If the match ends with a space+digit and is immediately followed by a word character, ignore the space+digit: `Matt 1, 2Text`.
				next_char = match.index + part.length
				part = part.replace /[\s*]+\d+$/, "" if s.length > next_char and /^\w/.test s.substr(next_char, 1)
				# If the match ends with a translation indicator, remove any numbers afterward. This situation generally occurs in cases like, "Ps 1:1 ESV 1 Blessed is...", where the final `1` is a verse number that's part of the text.
				part = part.replace /(\x1e[)\]]?)[\s*]*\d+$/, "$1"
			# Though PEG.js doesn't have to be case-sensitive, using the case-insensitive feature involves some repeated processing. By lower-casing here, we only pay the cost once. The grammar for words like "also" is case-sensitive; we can safely lowercase ascii letters without changing indices. We don't just call .toLowerCase() because it could affect the length of the string if it contains certain characters; maintaining the indices is the most important thing.
			part = part.replace(/[A-Z]+/g, (capitals) -> capitals.toLowerCase())
			# If we're in a chapter-book situation, the first character won't be a book control character, which would throw off the `start_index`.
			start_index_adjust = if part.substr(0, 1) is "\x1f" then 0 else part.split("\x1f")[0].length
			# * `match` is important for the length and whether it contains control characters, neither of which we've changed inconsistently with the original string. The `part` may be shorter than originally matched, but that's only to remove unneeded characters at the end.
			# * `grammar` is the external PEG parser.
			passage = value: grammar.parse(part), type: "base", start_index: @passage.books[book_id].start_index - start_index_adjust, match: part
			# Are we looking at a single book on its own that could be part of a range like "1-2 Sam"?
			if @options.book_alone_strategy is "full" and
			@options.book_range_strategy is "include" and
			passage.value[0].type is "b" and
			# Either it's on its own or a translation sequence follows it, making it effectively on its own.
			(passage.value.length == 1 or (passage.value.length > 1 and passage.value[1].type is "translation_sequence")) and
			start_index_adjust == 0 and
			(@passage.books[book_id].parsed.length == 1 or (@passage.books[book_id].parsed.length > 1 and 
			@passage.books[book_id].parsed[1].type is "translation")) and
			/^[234]/.test @passage.books[book_id].parsed[0]
				@create_book_range s, passage, book_id
			# Handle each passage individually to prevent context leakage (e.g., translations back-propagating through unrelated entities).
			[accum, post_context] = @passage.handle_obj passage
			entities = entities.concat accum
			# Move the next RegExp iteration to start earlier if we didn't use everything we thought we were going to.
			regexp_index_adjust = @adjust_regexp_end accum,original_part_length, part.length
			@regexps.escaped_passage.lastIndex -= regexp_index_adjust if (regexp_index_adjust > 0)
		[entities, post_context]

	# Handle the objects returned from the grammar to produce entities for further processing. We may need to adjust the `RegExp.lastIndex` if we discarded characters from the end of the match or if, after parsing, we're ignoring some of them--especially with ending parenthetical statements like "Luke 8:1-3; 24:10 (and Matthew 14:1-12 and Luke 23:7-12 for background)".
	adjust_regexp_end: (accum, old_length, new_length) ->
		regexp_index_adjust = 0
		if accum.length > 0
			# `accum` uses an off-by-one end index compared to the RegExp object. "and Psa3" means `lastIndex` = 8, `old_length` and `new_length` are both 4 (omitting "and " and leaving "Psa3"), and the `accum` end index is 3. We end up with 4 - 3 - 1 = 0, or no adjustment. Compare "and Psa3 and", where the last " and" is originally considered part of the regexp. In this case, `regexp_index_adjust` is 4: 8 ("Psa3 and") - 3 ("Psa3") - 1.
			regexp_index_adjust = old_length - accum[accum.length-1].indices[1] - 1
		else if old_length != new_length
			regexp_index_adjust = old_length - new_length
		regexp_index_adjust

	# Remove unnecessary characters from the end of the match.
	replace_match_end: (part) ->
		# Split the string on valid ending characters. Remove whatever's leftover at the end of the string. It would be easier to do `part.split(@regexps.match_end_split).pop()`, but IE doesn't handle empty strings at the end.
		remove = part.length
		while match = @regexps.match_end_split.exec part
			remove = match.index + match[0].length
		if remove < part.length
			part = part.substr 0, remove
		part

	# If a book is on its own, check whether it's preceded by something that indicates it's a book range like "1-2 Samuel".
	create_book_range: (s, passage, book_id) ->
		cases = [bcv_parser::regexps.first, bcv_parser::regexps.second, bcv_parser::regexps.third]
		limit = parseInt @passage.books[book_id].parsed[0].substr(0, 1), 10
		for i in [1 ... limit]
			range_regexp = if i == limit - 1 then bcv_parser::regexps.range_and else bcv_parser::regexps.range_only
			prev = s.match ///(?:^|\W)( #{cases[i-1]} \s* #{range_regexp} \s* ) \x1f #{book_id} \x1f///i
			return @add_book_range_object(passage, prev, i) if prev?
		false

	# Create a fake object that can be parsed to show the correct result.
	add_book_range_object: (passage, prev, start_book_number) ->
		length = prev[1].length
		passage.value[0] =
			type: "b_range_pre"
			value: [{type: "b_pre", value: start_book_number.toString(), indices: [prev.index, prev.index + length]}, passage.value[0]]
			indices: [0, passage.value[0].indices[1] + length]
		# Adjust the indices of the original result so they reflect the new content.
		passage.value[0].value[1].indices[0] += length
		passage.value[0].value[1].indices[1] += length
		# These two are the most important ones; the `absolute_indices` function uses them.
		passage.start_index -= length
		passage.match = prev[1] + passage.match
		return if passage.value.length == 1
		# If there are subsequent objects, also adjust their offsets.
		for i in [1 ... passage.value.length]
			continue unless passage.value[i].value?
			# If it's an `integer` type, `passage.value[i].value` is a scalar rather than an object, so we only need to adjust the indices for the top-level object.
			if passage.value[i].value[0]?.indices?
				passage.value[i].value[0].indices[0] += length
				passage.value[i].value[0].indices[1] += length
			passage.value[i].indices[0] += length
			passage.value[i].indices[1] += length

	# ## Output-Related Functions
	# Return a single OSIS string (comma-separated) for all the references in the whole input string.
	osis: ->
		out = []
		for osis in @parsed_entities()
			out.push osis.osis if osis.osis.length > 0
		out.join(",")

	# Return an array of `[OSIS, TRANSLATIONS]` for each reference (combined according to `options`).
	osis_and_translations: ->
		out = []
		for osis in @parsed_entities()
			out.push [osis.osis, osis.translations.join(",")] if osis.osis.length > 0
		out

	# Return an array of `{osis: OSIS, indices:[START, END], translations: [TRANSLATIONS]}` objects for each reference (combined according to `options`).
	osis_and_indices: ->
		out = []
		for osis in @parsed_entities()
			out.push {osis: osis.osis, translations: osis.translations, indices: osis.indices} if osis.osis.length > 0
		out

	# Return all objects, probably for additional processing.
	parsed_entities: ->
		out = []
		for entity_id in [0 ... @entities.length]
			entity = @entities[entity_id]
			# Be sure to include any translation identifiers in the indices we report back, but only if the translation immediately follows the previous entity.
			if entity.type and entity.type is "translation_sequence" and out.length > 0 and entity_id == out[out.length-1].entity_id + 1
				out[out.length-1].indices[1] = entity.absolute_indices[1]
			continue unless entity.passages?
			continue if (entity.type is "b" and @options.book_alone_strategy is "ignore") or (entity.type is "b_range" and @options.book_range_strategy is "ignore") or entity.type is "context"
			# A given entity, even if part of a sequence, always only has one set of translations associated with it.
			translations = []
			translation_alias = null
			if entity.passages[0].translations?
				for translation in entity.passages[0].translations
					translation_osis = if translation.osis?.length > 0 then translation.osis else ""
					translation_alias ?= translation.alias
					translations.push translation_osis
			else
				translations = [""]
				translation_alias = "default"
			osises = []
			length = entity.passages.length
			for i in [0 ... length]
				passage = entity.passages[i]
				# The `type` is usually only set in a sequence.
				passage.type ?= entity.type
				if passage.valid.valid is false
					if @options.invalid_sequence_strategy is "ignore" and entity.type is "sequence"
						@snap_sequence "ignore", entity, osises, i, length
					# Stop here if we're ignoring invalid passages.
					continue if @options.invalid_passage_strategy is "ignore"
				# If indicated in `@options`, exclude stray start/end books, resetting the parent indices as needed.
				if (passage.type is "b" or passage.type is "b_range") and @options.book_sequence_strategy is "ignore" and entity.type is "sequence"
					@snap_sequence "book", entity, osises, i, length
					continue
				if (passage.type is "b_range_start" or passage.type is "range_end_b") and @options.book_range_strategy is "ignore"
						@snap_range entity, i
				passage.absolute_indices ?= entity.absolute_indices
				osises.push
					osis: if passage.valid.valid then @to_osis(passage.start, passage.end, translation_alias) else ""
					type: passage.type
					indices: passage.absolute_indices
					translations: translations
					start: passage.start
					end: passage.end
					enclosed_indices: passage.enclosed_absolute_indices
					entity_id: entity_id
					entities: [passage]
			# Don't return an empty object.
			continue if osises.length == 0
			osises = @combine_consecutive_passages osises, translation_alias if osises.length > 1 and @options.consecutive_combination_strategy is "combine"
			# Add the osises array to the existing array.
			if @options.sequence_combination_strategy is "separate"
				out = out.concat osises
			# Add the OSIS string and some data to the array.
			else
				strings = []
				last_i = osises.length - 1
				# Adjust the end index to match a closing parenthesis when presented with `enclosed` entities. These entities always start mid-sequence (unless there's a book we're ignoring), so we don't need to worry about the start index.
				entity.absolute_indices[1] = osises[last_i].enclosed_indices[1] if osises[last_i].enclosed_indices? and osises[last_i].enclosed_indices[1] >= 0
				for osis in osises
					strings.push osis.osis if osis.osis.length > 0
				out.push osis: strings.join(","), indices: entity.absolute_indices, translations: translations, entity_id: entity_id, entities: osises
		out

	to_osis: (start, end, translation) ->
		# If it's just a book on its own, how we deal with it depends on whether we want to return just the first chapter or the complete book.
		end.c = 1 if not end.c? and not end.v? and start.b == end.b and not start.c? and not start.v? and @options.book_alone_strategy is "first_chapter"
		osis = start: "", end: ""
		# If no start chapter or verse, assume the first possible.
		start.c ?= 1
		start.v ?= 1
		# If no end chapter or verse, assume the last possible. If it's a single-chapter book, always use the first chapter for consistency with other `passage_existence_strategy` results (which do respect the single-chapter length).
		unless end.c?
			if @options.passage_existence_strategy.indexOf("c") >= 0 or (@passage.translations[translation].chapters[end.b]? and @passage.translations[translation].chapters[end.b].length == 1)
				end.c = @passage.translations[translation].chapters[end.b].length
			else
				end.c = 999
		unless end.v?
			if @passage.translations[translation].chapters[end.b][end.c - 1]? and @options.passage_existence_strategy.indexOf("v") >= 0
				end.v = @passage.translations[translation].chapters[end.b][end.c - 1]
			else
				end.v = 999
		if @options.include_apocrypha and @options.ps151_strategy is "b" and ((start.c == 151 and start.b is "Ps") or (end.c == 151 and end.b is "Ps"))
			@fix_ps151 start, end, translation
		# If it's a complete book or range of complete books and we want the shortest possible OSIS, return just the book names.
		if @options.osis_compaction_strategy is "b" and start.c == 1 and start.v == 1 and end.c == @passage.translations[translation].chapters[end.b].length and end.v == @passage.translations[translation].chapters[end.b][end.c - 1]
			osis.start = start.b
			osis.end = end.b
		# If it's a complete chapter or range of complete chapters and we want a short OSIS, return just the books and chapters.
		else if @options.osis_compaction_strategy.length <= 2 and start.v == 1 and (end.v == 999 or end.v == @passage.translations[translation].chapters[end.b][end.c - 1])
			osis.start = start.b + "." + start.c.toString()
			osis.end = end.b + "." + end.c.toString()
		# Otherwise, return the full BCV reference for both.
		else
			osis.start = start.b + "." + start.c.toString() + "." + start.v.toString()
			osis.end = end.b + "." + end.c.toString() + "." + end.v.toString()
		# If it's the same verse ("Gen.1.1-Gen.1.1"), chapter ("Gen.1-Gen.1") or book ("Gen-Gen"), return just the start so we don't end up with an empty range.
		if osis.start == osis.end
			out = osis.start
		# Otherwise return the range.
		else
			out = osis.start + "-" + osis.end
		out = start.extra + "," + out if start.extra?
		out += "," + end.extra if end.extra?
		out

	# If we want to treat Ps151 as a book rather than a chapter, we have to do some gymnastics to make sure it returns properly.
	fix_ps151: (start, end, translation) ->
		# Ps151 doesn't necessarily get promoted into the translation chapter list because during the string parsing, we treat it as `Ps` rather than `Ps151`.
		if translation isnt "default" and !@translations[translation]?.chapters["Ps151"]?
			@passage.promote_book_to_translation "Ps151", translation
		if start.c == 151 and start.b is "Ps"
			# If the whole range is in Ps151, we can just reset both sets of books and chapters; we don't have to worry about odd ranges.
			if end.c == 151 and end.b is "Ps"
				start.b = "Ps151"
				start.c = 1
				end.b = "Ps151"
				end.c = 1
			# Otherwise, we generate the OSIS for Ps151 and then set the beginning of the range to the next book. We assume that the next book is Prov, which isn't necessarily the case. I'm not aware of a canon that doesn't place Prov after Ps, however.
			else
				# This is the string we're going to prepend to our final output.
				start.extra = @to_osis {b: "Ps151", c: 1, v: start.v}, {b: "Ps151", c: 1, v: @passage.translations[translation].chapters["Ps151"][0]}, translation
				start.b = "Prov"
				start.c = 1
				start.v = 1
		# We know that end is in Ps151 and start is beforehand.
		else
			# This is the string we're going to append to the final output.
			end.extra = @to_osis {b: "Ps151", c: 1, v: 1}, {b: "Ps151", c: 1, v: end.v}, translation
			# Set the end of the range to be the end of Ps.150, which immediately precedes Ps151.
			end.c = 150
			end.v = @passage.translations[translation].chapters["Ps"][149]

	# If we have the correct `option` set (checked before calling this function), merge passages that refer to sequential verses: Gen 1, 2 -> Gen 1-2. It works for any combination of books, chapters, and verses.
	combine_consecutive_passages: (osises, translation) ->
		out = []
		prev = {}
		last_i = osises.length - 1
		enclosed_sequence_start = -1
		has_enclosed = false
		for i in [0 .. last_i]
			osis = osises[i]
			if osis.osis.length > 0
				prev_i = out.length - 1
				is_enclosed_last = false
				# Record the start index of the enclosed sequence for use in future iterations.
				if osis.enclosed_indices[0] != enclosed_sequence_start
					enclosed_sequence_start = osis.enclosed_indices[0]
				# If we're in an enclosed sequence and it's either the last item in the sequence or the next item in the sequence isn't part of the same enclosed sequence, then we've reached the end of the enclosed sequence.
				if enclosed_sequence_start >= 0 and (i == last_i or osises[i+1].enclosed_indices[0] != osis.enclosed_indices[0])
					is_enclosed_last = true
					# We may need to adjust the indices later.
					has_enclosed = true
				# Pretend like the previous `end` and existing `start` don't exist.
				if @is_verse_consecutive prev, osis.start, translation
					out[prev_i].end = osis.end
					# Set the enclosed indices if it's last or at the end of a sequence of enclosed indices. Otherwise only extend the indices to the actual indices--e.g., `Ps 117 (118, 120)`, should only extend to after `118`.
					out[prev_i].is_enclosed_last = is_enclosed_last
					out[prev_i].indices[1] = osis.indices[1]
					out[prev_i].enclosed_indices[1] = osis.enclosed_indices[1]
					out[prev_i].osis = @to_osis out[prev_i].start, osis.end, translation
				else
					out.push osis
				prev = b: osis.end.b, c: osis.end.c, v: osis.end.v
			else
				out.push osis
				prev = {}
		@snap_enclosed_indices(out) if has_enclosed
		out

	# If there's an enclosed reference--e.g., Ps 1 (2)--and we've combined consecutive passages in such a way that the enclosed reference is fully inside the sequence (i.e., if it starts before the enclosed sequence), then make sure the end index for the passage includes the necessary closing punctuation.
	snap_enclosed_indices: (osises) ->
		for osis in osises
			if osis.is_enclosed_last?
				if osis.enclosed_indices[0] < 0 and osis.is_enclosed_last
					osis.indices[1] = osis.enclosed_indices[1]
				delete osis.is_enclosed_last
		osises

	# Given two fully specified objects (complete bcvs), find whether they're sequential.
	is_verse_consecutive: (prev, check, translation) ->
		return false unless prev.b?
		# A translation doesn't always have an `order` set. If it doesn't, then use the default order.
		translation_order = if @passage.translations[translation].order? then @passage.translations[translation].order else @passage.translations.default.order
		if prev.b == check.b
			if prev.c == check.c
				return true if prev.v == check.v - 1
			else if check.v == 1 and prev.c == check.c - 1
				return true if prev.v == @passage.translations[translation].chapters[prev.b][prev.c - 1]
		else if check.c == 1 and check.v == 1 and translation_order[prev.b] == translation_order[check.b] - 1
			return true if prev.c == @passage.translations[translation].chapters[prev.b].length and prev.v == @passage.translations[translation].chapters[prev.b][prev.c - 1]
		false

	# Snap the start/end index of the range when it includes a book on its own and `@options.book_range_strategy` is `ignore`.
	snap_range: (entity, passage_i) ->
		# If the book is at the start of the range, we want to ignore the first part of the range.
		if entity.type is "b_range_start" or (entity.type is "sequence" and entity.passages[passage_i].type is "b_range_start")
			entity_i = 1
			source_entity = "end"
			type = "b_range_start"
		# If the book is at the end of the range, we want to ignore the end of the range.
		else
			entity_i = 0
			source_entity = "start"
			type = "range_end_b"
		target_entity = if source_entity is "end" then "start" else "end"
		# Rewrite either the start or the end of the range to match the opposite. In effect, we're changing it from a range to a single point.
		for own key of entity.passages[passage_i][target_entity]
			entity.passages[passage_i][target_entity][key] = entity.passages[passage_i][source_entity][key]
		if entity.type is "sequence"
			# This can be too long if a range is converted into a sequence where it ends with an open book range (`Matt 10-Rev`) that we want to ignore. At this point, the `passages` and `value` keys can get out-of-sync.
			passage_i = entity.value.length - 1 if passage_i >= entity.value.length
			pluck = @passage.pluck(type, entity.value[passage_i])
			# The `pluck` can be null if we've already overwritten its `type` in a previous recursion. This process is unusual, but can happen in "Proverbs 31:2. Vs 10 to dan".
			if pluck?
				temp = @snap_range pluck, 0
				# Move the indices to exclude what we've omitted. We want to move it even if it isn't the last one in case there are multiple books at the end--this way it'll use the correct indices.
				if passage_i == 0
					entity.absolute_indices[0] = temp.absolute_indices[0]
				else
					entity.absolute_indices[1] = temp.absolute_indices[1]
		# If it's not a sequence, change the `type` and `absolute_indices` to exclude the book we're omitting.
		else
			entity.original_type = entity.type
			entity.type = entity.value[entity_i].type
			entity.absolute_indices = [entity.value[entity_i].absolute_indices[0], entity.value[entity_i].absolute_indices[1]]
		entity

	# Snap the start/end index of the entity or surrounding passages when there's a lone book or invalid item in a sequence.
	snap_sequence: (type, entity, osises, i, length) ->
		passage = entity.passages[i]
		# If the passage is the first thing in the sequence and something is after it, snap the start index of the whole entity to the start index of the next item.
		#
		# But we only want to do this if it's followed by a book (if it's "Matt, 5", we want to be sure to include "Matt" as part of the indices and bypass this step). We can tell if that's the case if the `type` of what follows starts with `b` or if it's a `range` starting in a different book. The tricky part occurs when we have several invalid references at the start (Matt 29, 30, Acts 1)--we need to find the first value that's a book. If there's a valid item before the next book, abort.
		if passage.absolute_indices[0] == entity.absolute_indices[0] and i < length - 1 and @get_snap_sequence_i(entity.passages, i, length) != i
			entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0]
			@remove_absolute_indices entity.passages, i + 1
		# If the passage is the last thing in a sequence (but not the only one), snap the entity end index to the end index of the previous valid item. To handle multiple items at the end, snap back to the last known good item if available.
		else if passage.absolute_indices[1] == entity.absolute_indices[1] and i > 0
			entity.absolute_indices[1] = if osises.length > 0 then osises[osises.length - 1].indices[1] else entity.passages[i - 1].absolute_indices[1]
		# Otherwise, if the next item doesn't start with a book, link the start index of the current passage to the next one because we're including the current passage as part of the next one. In "Eph. 4. Gen, Matt, 6", the `Matt, ` should be part of the `6`, but "Eph. 4. Gen, Matt, 1cor6" should exclude `Matt`.
		else if type is "book" and i < length - 1 and not @starts_with_book entity.passages[i + 1]
			entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0]
		# Return something only for unit testing.
		entity

	# Identify whether there are any valid items between the current item and the next book.
	get_snap_sequence_i: (passages, i, length) ->
		for j in [(i + 1) ... length]
			return j if @starts_with_book passages[j]
			return i if passages[j].valid.valid
		i

	# Given a passage, does it start with a book? It never takes a sequence as an argument.
	starts_with_book: (passage) ->
		return true if passage.type.substr(0, 1) is "b"
		return true if (passage.type is "range" or passage.type is "ff") and passage.start.type.substr(0, 1) is "b"
		false

	# Remove absolute indices from the given passage to the end of the sequence. We do this when we don't want to include the end of a sequence in the sequence (most likely because it's invalid or a book on its own).
	remove_absolute_indices: (passages, i) ->
		return false if passages[i].enclosed_absolute_indices[0] < 0
		[start, end] = passages[i].enclosed_absolute_indices
		for passage in passages[i ..]
			if passage.enclosed_absolute_indices[0] == start and passage.enclosed_absolute_indices[1] == end
				passage.enclosed_absolute_indices = [-1, -1]
			else
				break
		true

root.bcv_parser = bcv_parser

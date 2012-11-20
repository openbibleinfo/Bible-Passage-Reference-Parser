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
	default_options: {}
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
		# * `ignore`: "Matt 99, Gen 1" sequence index starts at `Gen 1`.
		# * `include`: "Matt 99, Gen 1" sequence index starts at `Matt 99`.
		invalid_sequence_strategy: "ignore"
		# * `combine`: consecutive references are combined into a single OSIS list: Gen 1, 2 -> "Gen.1,Gen.2".
		# * `separate`: consecutive references are separated into their component parts: Gen 1, 2 -> "Gen.1" and "Gen.2".
		sequence_combination_strategy: "combine"
		# ### Potentially Invalid Input
		# * `ignore`: Don't include invalid passages in `@parsed_entities()`.
		# * `include`: Include invalid passages in `@parsed_entities()` (they still don't have OSIS values).
		invalid_passage_strategy: "ignore"
		# * `error`: zero chapters ("Matt 0") are invalid.
		# * `upgrade`: zero chapters are upgraded to 1: "Matt 0" -> "Matt 1".
		# Unlike `zero_verse_strategy`, chapter 0 isn't allowed.
		zero_chapter_strategy: "error"
		# * `error`: zero verses ("Matt 5:0") are invalid.
		# * `upgrade`: zero verses are upgraded to 1: "Matt 5:0" -> "Matt 5:1".
		# * `allow`: zero verses are kept as-is: "Matt 5:0" -> "Matt 5:0". Some traditions use 0 for Psalm titles.
		zero_verse_strategy: "error"
		# * `ignore`: treat non-Latin digits the same as any other character.
		# * `replace`: replace non-Latin (0-9) numeric digits with Latin digits. This replacement occurs before any book substitution.
		non_latin_digits_strategy: "ignore"
		# ### Context
		# * `ignore`: any books that appear on their own don't get parsed as books ("Gen saw" doesn't trigger a match, but "Gen 1" does).
		# * `full`: any books that appear on their own get parsed as the complete book ("Gen" means "Gen.1-Gen.50").
		# * `first_chapter`: any books that appear on their own get parsed as the first chapter ("Gen" means "Gen.1").
		book_alone_strategy: "ignore"
		# * `delete`: remove any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5". This is better for text extraction.
		# * `include`: keep any digits at the end of a sequence that are preceded by spaces and immediately followed by a `\w`: "Matt 5 1Hi" -> "Matt.5.1". This is better for query parsing.
		captive_end_digits_strategy: "delete"
		# * `verse`: treat "Jer 33-11" as "Jer 33:11" (end before start) and "Heb 13-15" as "Heb.13.15" (end range too high).
		# * `sequence`: treat them as sequences.
		end_range_digits_strategy: "verse"
		# ### Apocrypha
		# Don't set this value directly; use the `include_apocrypha` or `set_options` functions.
		include_apocrypha: false
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

	# Remember default options for later use.
	constructor: ->
		@options = {}
		for own key, val of bcv_parser::options
			@options[key] = val
		# If we've changed the versification system, make sure previous object invocations don't leak.
		@versification_system @options.versification_system

	# ## Parse-related Functions
	# Parse a string and prepare the object for further interrogation, depending on what's needed.
	parse: (s) ->
		@reset()
		@s = s
		# Replace any control characters already in the string.
		s = @replace_control_characters s
		# Get a string representation suitable for passing to the parser.
		[s, @passage.books] = @match_books s
		# Replace potential BCVs one at a time to reduce processing time on long strings.
		entities = @match_passages s
		@entities = []
		# Loop through them rather than handle them all at once to prevent context leakage (e.g., translations back-propagating through unrelated entities).
		for entity in entities
			[accum] = @passage.handle_array [entity]
			@entities = @entities.concat accum
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

	# Override default options.
	set_options: (options) ->
		for own key, val of options
			if key is "include_apocrypha" or key is "versification_system"
				@[key] val
			else
				@options[key] = val

	# Whether to use books and abbreviations from the Apocrypha. Takes a boolean argument: `true` to include the Apocrypha and `false` to not. Defaults to `false`. Returns the `bcv_parser` object.
	include_apocrypha: (arg) ->
		return this unless arg? and (arg is true or arg is false)
		@options.include_apocrypha = arg
		@regexps.books = @regexps.get_books arg
		if arg is true
			# Add Ps 151 to the end of Psalms.
			@translations.default.chapters.Ps[150] = @translations.default.chapters.Ps151[0]
		else if arg is false
			# Remove Ps 151 from the end of Psalms.
			@translations.default.chapters.Ps.pop() if @translations.default.chapters.Ps.length == 151
		this

	# Use an alternate versification system. Takes a string argument; the built-in options are: `default` to use KJV-style versification and `vulgate` to use the Vulgate (Greek) Psalm numbering.
	versification_system: (system) ->
		return this unless system? and @translations.alternates[system]?
		@options.versification_system = system
		@translations.alternates.default ?= order: null, chapters: {}
		# If we're updating the book order (e.g., to mix the Apocrypha into the Old Testament)...
		if @translations.alternates[system].order?
			# Save the existing default order so we can get it back later if necessary. We want to do everything nondestructively.
			@translations.alternates.default.order = bcv_utils.shallow_clone @translations.default.order unless @translations.alternates.default.order?
			# The `order` key should always contain the full order; too many things can go wrong if we try to merge the old order and the new one.
			@translations.default.order = bcv_utils.shallow_clone @translations.alternates[system].order
		# If we're updating the number of chapters in a book or the number of verses in a chapter...
		if @translations.alternates[system].chapters?
			# Loop through only the books that are changing.
			for own book, chapter_list of @translations.alternates[system].chapters
				# Save the existing default order so we can get it back later. Only set it the first time.
				@translations.alternates.default.chapters[book] = bcv_utils.shallow_clone_array @translations.default.chapters[book] unless @translations.alternates.default.chapters[book]?
				@translations.default.chapters[book] = bcv_utils.shallow_clone_array chapter_list
		# Depending on the order of operations, the cloned list could be inconsistent with the current state. For example, if we called `versification_system`, we've cached 150 Psalms. If we then call `include_apocrypha(true)`, we now have 151 Psalms. If we then call `versification_system` again, we're back, incorrectly, to 150 Psalms because that's what was cached.
		@include_apocrypha @options.include_apocrypha
		this

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
			# I explored using the following code, using array concatenation instead of replacing text directly, but found that it didn't offer performance improvements.
			#
			#	`parts = []`
			#	`prev_index = 0`
			#	`while match = book.regexp.exec s`
			#	`	books.push value: match[0], parsed: book.osis`
			#	`	if match.index != prev_index`
			#	`		parts.push s.substr(prev_index, match.index - prev_index)`
			#	`	extra = if book.extra? then "/" + book.extra else ""`
			#	`	parts.push "\x1f#{books.length - 1}#{extra}\x1f"`
			#	`	prev_index = match.index + match[0].length`
			#	`if parts.length > 0`
			#	`	parts.push s.substr(prev_index)`
			#	`	s = parts.join ""`
			s = s.replace book.regexp, (full, prev, bk) ->
				# `value` contains the raw string; `book.osis` is the osis value for the book.
				books.push value: bk, parsed: book.osis
				extra = if book.extra? then "/" + book.extra else ""
				"#{prev}\x1f#{books.length - 1}#{extra}\x1f"
		# Replace translations.
		s = s.replace @regexps.translations, (match) ->
			books.push value: match, parsed: match.toLowerCase()
			"\x1e#{books.length - 1}\x1e";
		[s, @get_book_indices(books, s)]

	# Get the string index for all the books / translations, adding the start index as a new key.
	get_book_indices: (books, s) ->
		add_index = 0
		re = ///
			([\x1f\x1e])	# opening book or translation
			(\d+)			# the number
			(?:/[a-z])?		# optional extra identifier
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
		passages = []
		while match = @regexps.escaped_passage.exec s
			# * `match[0]` includes the preceding character (if any) for bounding.
			# * `match[1]` is the full match minus the character preceding the match used for bounding.
			# * match[2]` is the book id.
			[full, part, book_id] = match
			# Adjust the `index` to use the `part` offset rather than the `full` offset. We use it below for `captive_end_digits`.
			match.index += full.length - part.length
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
			# If we're in a cb situation, the first character won't be a book control character, which would throw off the `start_index`.
			start_index_adjust = if part.substr 0, 1 is "\x1f" then 0 else part.split("\x1f")[0].length
			# * `match` is important for the length and whether it contains control characters, neither of which we've changed inconsistently with the original string. The `part` may be shorter than originally matched, but that's only to remove unneeded characters at the end.
			# * `grammar` is the external PEG parser.
			passage = value: grammar.parse(part), type: "base", start_index: @passage.books[book_id].start_index - start_index_adjust, match: part
			# Are we looking at a single book on its own that could be part of a range like "1-2 Sam"?
			if @options.book_alone_strategy is "full" and passage.value.length == 1 and passage.value[0].type is "b" and start_index_adjust == 0 and @passage.books[book_id].parsed.length == 1 and /^[234]/.test @passage.books[book_id].parsed[0]
				@create_book_range s, passage, book_id
			passages.push passage
		passages

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
		for i in [1...limit]
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
		for entity_id in [0...@entities.length]
			entity = @entities[entity_id]
			# Be sure to include any translation identifiers in the indices we report back, but only if the translation immediately follows the previous entity.
			if entity.type and entity.type is "translation_sequence" and out.length > 0 and entity_id == out[out.length-1].entity_id + 1
				out[out.length-1].indices[1] = entity.absolute_indices[1]
			continue unless entity.passages?
			continue if (entity.type is "b" or entity.type is "b_range") and @options.book_alone_strategy is "ignore"
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
			for i in [0...length]
				passage = entity.passages[i]
				# The `type` is usually only set in a sequence.
				passage.type ?= entity.type
				if passage.valid.valid is false
					if @options.invalid_sequence_strategy is "ignore" and entity.type is "sequence"
						@snap_sequence "ignore", entity, osises, i, length
					# Stop here if we're ignoring invalid passages.
					continue if @options.invalid_passage_strategy is "ignore"
				# If indicated in options, exclude stray start/end books, resetting the parent indices as needed.
				if (passage.type is "b" or passage.type is "b_range") and @options.book_sequence_strategy is "ignore" and entity.type is "sequence"
					@snap_sequence "book", entity, osises, i, length
					continue
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
		end.c = 1 if not end.c? and not end.v? and start.b == end.b and not start.c? and not start.v? and @options.book_alone_strategy == "first_chapter"
		osis = start: "", end: ""
		# If no start chapter or verse, assume the first possible.
		start.c ?= 1
		start.v ?= 1
		# If no end chapter or verse, assume the last possible.
		end.c ?= @passage.translations[translation].chapters[end.b].length
		end.v ?= @passage.translations[translation].chapters[end.b][end.c - 1]
		# If it's a complete book or range of complete books and we want the shortest possible OSIS, return just the book names.
		if @options.osis_compaction_strategy == "b" and start.c == 1 and start.v == 1 and end.c == @passage.translations[translation].chapters[end.b].length and end.v == @passage.translations[translation].chapters[end.b][end.c - 1]
			osis.start = start.b
			osis.end = end.b
		# If it's a complete chapter or range of complete chapters and we want a short OSIS, return just the books and chapters.
		else if @options.osis_compaction_strategy.length <= 2 and start.v == 1 and end.v == @passage.translations[translation].chapters[end.b][end.c - 1]
			osis.start = start.b + "." + start.c.toString()
			osis.end = end.b + "." + end.c.toString()
		# Otherwise, return the full BCV reference for both.
		else
			osis.start = start.b + "." + start.c.toString() + "." + start.v.toString()
			osis.end = end.b + "." + end.c.toString() + "." + end.v.toString()
		# If it's the same verse ("Gen.1.1-Gen.1.1"), chapter ("Gen.1-Gen.1") or book ("Gen-Gen"), return just the start so we don't end up with an empty range.
		return osis.start if osis.start == osis.end
		# Otherwise return the range.
		osis.start + "-" + osis.end

	# If we have the correct `option` set (checked before calling this function), merge passages that refer to sequential verses: Gen 1, 2 -> Gen 1-2. It works for any combination of books, chapters, and verses.
	combine_consecutive_passages: (osises, translation) ->
		out = []
		prev = {}
		last_i = osises.length - 1
		enclosed_sequence_start = -1
		for i in [0 .. last_i]
			osis = osises[i]
			if osis.osis.length > 0
				prev_i = out.length - 1
				osis.is_enclosed_first = false
				osis.is_enclosed_last = false
				if osis.enclosed_indices[0] != enclosed_sequence_start
					enclosed_sequence_start = osis.enclosed_indices[0]
					osis.is_enclosed_first = true if enclosed_sequence_start >= 0
				if enclosed_sequence_start >= 0 and (i == last_i or osises[i+1].enclosed_indices[0] != osis.enclosed_indices[0])
					osis.is_enclosed_last = true
				# Pretend like the previous `end` and existing `start` don't exist.
				if @is_verse_consecutive prev, osis.start, translation
					out[prev_i].end = osis.end
					# Set the enclosed indices if it's last or at the end of a sequence of enclosed indices. Otherwise only extend the indices to the actual indices--e.g., `Ps 117 (118, 120)`, should only extend to after `118`.
					out[prev_i].is_enclosed_last = osis.is_enclosed_last
					out[prev_i].indices[1] = osis.indices[1]
					out[prev_i].enclosed_indices[1] = osis.enclosed_indices[1]
					out[prev_i].osis = @to_osis out[prev_i].start, osis.end, translation
				else
					out.push osis
				prev = b: osis.end.b, c: osis.end.c, v: osis.end.v
			else
				out.push osis
				prev = {}
		@snap_enclosed_indices(out)

	# If there's an enclosed reference--e.g., Ps 1 (2)--and we've combined consecutive passages in such a way that the enclosed reference is fully inside the sequence (i.e., if it starts before the enclosed sequence), then make sure the end index for the passage includes the necessary closing punctuation.
	snap_enclosed_indices: (osises) ->
		for osis in osises
			if osis.enclosed_indices[0] < 0 and osis.is_enclosed_last
				osis.indices[1] = osis.enclosed_indices[1]
			delete osis.is_enclosed_first
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
		for j in [(i + 1)...length]
			return j if @starts_with_book passages[j]
			return i if passages[j].valid.valid
		i

	# Given a passage, does it start with a book? It never takes a sequence as an argument.
	starts_with_book: (passage) ->
		return true if passage.type.substr(0, 1) is "b"
		return true if (passage.type is "range" or passage.type is "ff") and passage.start.type.substr(0, 1) is "b"
		false

	remove_absolute_indices: (passages, i) ->
		return false if passages[i].enclosed_absolute_indices[0] < 0
		[start, end] = passages[i].enclosed_absolute_indices
		for passage in passages[i..]
			if passage.enclosed_absolute_indices[0] == start and passage.enclosed_absolute_indices[1] == end
				passage.enclosed_absolute_indices = [-1, -1]
			else
				break
		true

root.bcv_parser = bcv_parser

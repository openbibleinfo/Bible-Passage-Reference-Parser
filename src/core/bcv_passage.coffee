# This class takes the output from the grammar and turns it into simpler objects for additional processing or for output.

class bcv_passage
	books: []
	indices: {}
	# `bcv_parser` sets these two.
	options: {}
	translations: {}

	# ## Public
	# Loop through the parsed passages.
	handle_array: (passages, accum=[], context={}) ->
		# `passages` is an array of passage objects.
		for passage in passages
			# The grammar can sometimes emit `null`.
			continue unless passage?
			# Each `passage` consists of passage objects and, possibly, strings.
			break if passage.type is "stop"
			[accum, context] = @handle_obj passage, accum, context
		[accum, context]

	# Handle a typical passage object with an `index`, `type`, and array in `value`.
	handle_obj: (passage, accum, context) ->
		if passage.type? and @[passage.type]?
			@[passage.type] passage, accum, context
		else [accum, context]

	# ## Types Returned from the PEG.js Grammar
	# These functions correspond to `type` attributes returned from the grammar. They're designed to be called multiple times if necessary.
	#
	# Handle a book on its own ("Gen").
	b: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		passage.passages = []
		alternates = []
		for b in @books[passage.value].parsed
			valid = @validate_ref passage.start_context.translations, {b: b}
			obj = start: {b: b}, end: {b: b}, valid: valid
			# Use the first valid book.
			if passage.passages.length == 0 and valid.valid
				passage.passages.push obj
			else
				alternates.push obj
		# If none are valid, use the first one.
		passage.passages.push alternates.shift() if passage.passages.length == 0
		passage.passages[0].alternates = alternates if alternates.length > 0
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		accum.push passage
		context = b: passage.passages[0].start.b
		context.translations = passage.start_context.translations if passage.start_context.translations?
		[accum, context]

	# Handle book-only ranges ("Gen-Exod").
	b_range: (passage, accum, context) ->
		@range passage, accum, context

	# Handle book-only ranges like "1-2 Samuel". It doesn't support multiple ambiguous ranges (like "1-2C"), which it probably shouldn't, anyway.
	b_range_pre: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		passage.passages = []
		alternates = []
		book = @pluck "b", passage.value
		[[end], context] = @b book, [], context
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		start_obj = b: passage.value[0].value + end.passages[0].start.b.substr(1), type: "b"
		passage.passages = [start: start_obj, end: end.passages[0].end, valid: end.passages[0].valid]
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		accum.push passage
		[accum, context]

	# Handle ranges with a book as the start of the range ("Gen-Exod 2").
	b_range_start: (passage, accum, context) ->
		@range passage, accum, context

	# The base (root) object in the grammar controls the base indices.
	base: (passage, accum, context) ->
		@indices = @calculate_indices passage.match, passage.start_index
		@handle_array passage.value, accum, context

	# Handle book-chapter ("Gen 1").
	bc: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		passage.passages = []
		@reset_context context, ["b", "c", "v"]
		c = @pluck("c", passage.value).value
		alternates = []
		for b in @books[@pluck("b", passage.value).value].parsed
			context_key = "c"
			valid = @validate_ref passage.start_context.translations, {b: b, c: c}
			obj = start: {b: b}, end: {b: b}, valid: valid
			# Is it really a `bv` object?
			if valid.messages.start_chapter_not_exist_in_single_chapter_book
				obj.valid = @validate_ref passage.start_context.translations, {b: b, v: c}
				obj.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1
				obj.start.c = 1
				obj.end.c = 1
				context_key = "v"
			obj.start[context_key] = c
			# If it's zero, fix it before assigning the end.
			[obj.start.c, obj.start.v] = @fix_start_zeroes obj.valid, obj.start.c, obj.start.v
			# Don't want an undefined key hanging around the object.
			delete obj.start.v unless obj.start.v?
			obj.end[context_key] = obj.start[context_key]
			if passage.passages.length == 0 and obj.valid.valid
				passage.passages.push obj
			else
				alternates.push obj
		passage.passages.push alternates.shift() if passage.passages.length == 0
		passage.passages[0].alternates = alternates if alternates.length > 0
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		@set_context_from_object context, ["b", "c", "v"], passage.passages[0].start
		accum.push passage
		[accum, context]

	# Handle "Ps 3 title"
	bc_title: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		# First, check to see whether we're dealing with Psalms. If not, treat it as a straight `bc`.
		[[bc], context] = @bc @pluck("bc", passage.value), [], context
		# We check the first two characters to handle both `Ps` and `Ps151`.
		if bc.passages[0].start.b.substr(0, 2) isnt "Ps" and bc.passages[0].alternates?
			for i in [0 ... bc.passages[0].alternates.length]
				continue unless bc.passages[0].alternates[i].start.b.substr(0, 2) is "Ps"
				# If Psalms is one of the alternates, promote it to the primary passage and discard the others--we know it's right.
				bc.passages[0] = bc.passages[0].alternates[i]
				break
		if bc.passages[0].start.b.substr(0, 2) isnt "Ps"
			accum.push bc
			return [accum, context]
		# Overwrite all the other book possibilities; the presence of "title" indicates a Psalm. If the previous possibilities were `["Song", "Ps"]`, they're now just `["Ps"]`. Even if it's really `Ps151`, we want `Ps` here because other functions expect it.
		@books[@pluck("b", bc.value).value].parsed = ["Ps"]
		# Set the `indices` of the new `v` object to the indices of the `title`. We won't actually use these indices anywhere.
		title = @pluck "title", passage.value
		# The `title` will be null if it's being reparsed from a future translation because we rewrite it as a `bcv` while discarding the original `title` object.
		title ?= @pluck "v", passage.value
		passage.value[1] = {type: "v", value: [{type: "integer", value: 1, indices: title.indices}], indices: title.indices}
		# We don't need to preserve the original `type` for reparsing; if it gets here, it'll always be a `bcv`.
		passage.type = "bcv"
		# Treat it as a standard `bcv`.
		@bcv passage, accum, passage.start_context

	# Handle book chapter:verse ("Gen 1:1").
	bcv: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		passage.passages = []
		@reset_context context, ["b", "c", "v"]
		bc = @pluck "bc", passage.value
		c = @pluck("c", bc.value).value
		v = @pluck("v", passage.value).value
		alternates = []
		for b in @books[@pluck("b", bc.value).value].parsed
			valid = @validate_ref passage.start_context.translations, {b: b, c: c, v: v}
			[c, v] = @fix_start_zeroes valid, c, v
			obj = start: {b: b, c: c, v: v}, end: {b: b, c: c, v: v}, valid: valid
			# Use the first valid option.
			if passage.passages.length == 0 and valid.valid
				passage.passages.push obj
			else
				alternates.push obj
		# If there are no valid options, use the first one.
		passage.passages.push alternates.shift() if passage.passages.length == 0
		passage.passages[0].alternates = alternates if alternates.length > 0
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		@set_context_from_object context, ["b", "c", "v"], passage.passages[0].start
		accum.push passage
		[accum, context]

	# Handle "Philemon verse 6." This is unusual.
	bv: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		[b, v] = passage.value
		# Construct a virtual BCV object with a chapter of 1.
		bcv =
			indices: passage.indices
			value: [
				{type: "bc", value: [b, {type: "c", value: [{type: "integer", value: 1}]}]}
				v
			]
		[[bcv], context] = @bcv bcv, [], context
		passage.passages = bcv.passages
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		accum.push passage
		[accum, context]

	# Handle a chapter.
	c: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		# If it's an actual chapter object, the value we want is in the integer object inside it.
		c = if passage.type is "integer" then passage.value else @pluck("integer", passage.value).value
		valid = @validate_ref passage.start_context.translations, {b: context.b, c: c}
		# If it's a single-chapter book, then treat it as a verse even if it looks like a chapter (unless its value is `1`).
		if not valid.valid and valid.messages.start_chapter_not_exist_in_single_chapter_book
			return @v passage, accum, context
		[c] = @fix_start_zeroes valid, c
		passage.passages = [start: {b: context.b, c: c}, end: {b: context.b, c: c}, valid: valid]
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		accum.push passage
		context.c = c
		@reset_context context, ["v"]
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		[accum, context]

	# Handle "23rd Psalm" by recasting it as a `bc`.
	c_psalm: (passage, accum, context) ->
		# We don't need to preserve the original `type` for reparsing.
		passage.type = "bc"
		# This string always starts with the chapter number, followed by other letters.
		c = parseInt @books[passage.value].value.match(/^\d+/)[0], 10
		passage.value = [
			{type: "b", value: passage.value, indices: passage.indices}
			{type: "c", value: [{type: "integer", value: c, indices: passage.indices}], indices: passage.indices}
		]
		@bc passage, accum, context

	# Handle "Ps 3, ch 4:title"
	c_title: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		# If it's not a Psalm, treat it as a regular chapter.
		if context.b isnt "Ps"
			# Don't change the `type` here because we're not updating the structure to match the `c` expectation if reparsing later.
			return @c passage.value[0], accum, context
		# Add a `v` object and treat it as a refular `cv`.
		title = @pluck "title", passage.value
		passage.value[1] = {type: "v", value: [{type: "integer", value: 1, indices: title.indices}], indices: title.indices}
		# Change the type to match the new parsing strategy.
		passage.type = "cv"
		@cv passage, accum, passage.start_context

	# Handle a chapter:verse.
	cv: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		c = @pluck("c", passage.value).value
		v = @pluck("v", passage.value).value
		valid = @validate_ref passage.start_context.translations, {b: context.b, c: c, v: v}
		[c, v] = @fix_start_zeroes valid, c, v
		passage.passages = [start: {b: context.b, c: c, v: v}, end: {b: context.b, c: c, v: v}, valid: valid]
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		accum.push passage
		context.c = c
		context.v = v
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		[accum, context]

	# Handle "Chapters 1-2 from Daniel".
	cb_range: (passage, accum, context) ->
		# We don't need to preserve the original `type` for reparsing.
		passage.type = "range"
		[b, start_c, end_c] = passage.value
		passage.value = [{type: "bc", value:[b, start_c], indices: passage.indices}, end_c]
		end_c.indices[1] = passage.indices[1]
		@range passage, accum, context

	# Use an object to establish context for later objects but don't otherwise use it.
	context: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		passage.passages = []
		for own key of @books[passage.value].context
			context[key] = @books[passage.value].context[key]
		accum.push passage
		[accum, context]

	# Handle "23rd Psalm verse 1" by recasting it as a `bcv`.
	cv_psalm: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		# We don't need to preserve the original `type` for reparsing.
		passage.type = "bcv"
		[c_psalm, v] = passage.value
		[[bc]] = @c_psalm c_psalm, [], passage.start_context
		passage.value = [bc, v]
		@bcv passage, accum, context

	# Handle "and following" (e.g., "Matt 1:1ff") by assuming it means to continue to the end of the current context (end of chapter if a verse is given, end of book if a chapter is given).
	ff: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		# Create a virtual end to pass to `@range`.
		passage.value.push type: "integer", indices: passage.indices, value: 999
		[[passage], context] = @range passage, [], passage.start_context
		# Set the indices to include the end of the range (the "ff").
		passage.value[0].indices = passage.value[1].indices
		passage.value[0].absolute_indices = passage.value[1].absolute_indices
		# And then get rid of the virtual end so it doesn't stick around if we need to reparse it later.
		passage.value.pop()
		# Ignore any warnings that the end chapter / verse doesn't exist.
		delete passage.passages[0].valid.messages.end_verse_not_exist if passage.passages[0].valid.messages.end_verse_not_exist?
		delete passage.passages[0].valid.messages.end_chapter_not_exist if passage.passages[0].valid.messages.end_chapter_not_exist?
		delete passage.passages[0].end.original_c if passage.passages[0].end.original_c?
		# `translations` and `absolute_indices` are handled in `@range`.
		accum.push passage
		[accum, context]

	# Handle "Ps 3-4:title" or "Acts 2:22-27. Title"
	integer_title: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		# If it's not Psalms, treat it as a straight integer, ignoring the "title".
		if context.b isnt "Ps"
			return @integer passage.value[0], accum, context
		passage.value[0] = type: "c", value: [passage.value[0]], indices: [passage.value[0].indices[0], passage.value[0].indices[1]]
		# Add a `v` object.
		v_indices = [passage.indices[1] - 5, passage.indices[1]]
		passage.value[1] = {type: "v", value: [{type: "integer", value: 1, indices: v_indices}], indices: v_indices}
		# We don't need to preserve the original `type` for reparsing.
		passage.type = "cv"
		@cv passage, accum, passage.start_context

	# Pass the integer off to whichever handler is relevant.
	integer: (passage, accum, context) ->
		return @v passage, accum, context if context.v?
		return @c passage, accum, context

	# Handle a sequence of references. This is the only function that can return more than one object in the `passage.passages` array.
	sequence: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		passage.passages = []
		for obj in passage.value
			[[psg], context] = @handle_array obj, [], context
			# There's only more than one `sub_psg` if there was a range error.
			for sub_psg in psg.passages
				sub_psg.type ?= psg.type
				# Add the indices so we can possibly retrieve them later, depending on our `sequence_combination_strategy`.
				sub_psg.absolute_indices ?= psg.absolute_indices
				sub_psg.translations = psg.start_context.translations if psg.start_context.translations?
				# Save the index of any closing punctuation if the sequence ends with a `sequence_post_enclosed`.
				sub_psg.enclosed_absolute_indices = if psg.type is "sequence_post_enclosed" then psg.absolute_indices else [-1, -1]
				passage.passages.push sub_psg
		unless passage.absolute_indices?
			# If it's `sequence_post_enclosed`, don't snap the end index; include the closing punctuation.
			if passage.passages.length > 0 and passage.type is "sequence"
				passage.absolute_indices = [passage.passages[0].absolute_indices[0], passage.passages[passage.passages.length - 1].absolute_indices[1]]
			else
				passage.absolute_indices = @get_absolute_indices passage.indices
		accum.push passage
		[accum, context]

	# Handle a sequence like "Ps 119 (118)," with parentheses. We want to include the closing parenthesis in the indices if `sequence_combination_strategy` is `combine` or if there's a consecutive.
	sequence_post_enclosed: (passage, accum, context) ->
		@sequence passage, accum, context

	# Handle a verse, either as part of a sequence or because someone explicitly wrote "verse".
	v: (passage, accum, context) ->
		v = if passage.type is "integer" then passage.value else @pluck("integer", passage.value).value
		passage.start_context = bcv_utils.shallow_clone context
		# The chapter context might not be set if it follows a book in a sequence.
		c = if context.c? then context.c else 1
		valid = @validate_ref passage.start_context.translations, {b: context.b, c: c, v: v}
		[no_c, v] = @fix_start_zeroes valid, 0, v
		passage.passages = [start: {b: context.b, c: c, v: v}, end: {b: context.b, c: c, v: v}, valid: valid]
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		accum.push passage
		context.v = v
		[accum, context]

	# ## Ranges
	# Handle any type of start and end range. It doesn't directly return multiple passages, but if there's an error parsing the range, we may convert it into a sequence.
	range: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		[start, end] = passage.value
		# `@handle_obj` always returns exactly one object that we're interested in.
		[[start], context] = @handle_obj start, [], context
		# Matt 5-verse 6 = Matt.5.6
		if end.type is "v" and ((start.type is "bc" and not start.passages?[0]?.valid?.messages?.start_chapter_not_exist_in_single_chapter_book)or start.type is "c") and @options.end_range_digits_strategy is "verse"
			# If we had to change the `type`, reflect that here.
			passage.value[0] = start
			return @range_change_integer_end passage, accum
		[[end], context] = @handle_obj end, [], context
		# If we had to change the start or end `type`s, make sure that's reflected in the `value`.
		passage.value = [start, end]
		# Similarly, if we had to adjust the indices, make sure they're reflected in the indices for the range.
		passage.indices = [start.indices[0], end.indices[1]]
		# We'll also need to recalculate these if they exist.
		delete passage.absolute_indices
		# Create the prospective start and end objects that will end up in `passage.passages`.
		start_obj = b: start.passages[0].start.b, c: start.passages[0].start.c, v: start.passages[0].start.v, type: start.type
		end_obj = b: end.passages[0].end.b, c: end.passages[0].end.c, v: end.passages[0].end.v, type: end.type
		# Make sure references like `Ps 20:1-0:4` don't change to `Ps 20:1-1:4`. In other words, don't upgrade zero end ranges.
		end_obj.c = 0 if end.passages[0].valid.messages.start_chapter_is_zero
		end_obj.v = 0 if end.passages[0].valid.messages.start_verse_is_zero
		valid = @validate_ref passage.start_context.translations, start_obj, end_obj
		# If it's valid, sometimes we want to return the value from `@range_handle_valid_end`, and sometimes not; it depends on what kinds of corrections we need to make.
		if valid.valid
			[return_now, return_value] = @range_handle_valid valid, passage, start, start_obj, end, end_obj, accum
			return return_value if return_now
		# If it's invalid, always return the value.
		else
			return @range_handle_invalid valid, passage, start, start_obj, end, end_obj, accum
		# We've already reset the indices to match the indices of the contained objects.
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		passage.passages = [start: start_obj, end: end_obj, valid: valid]
		passage.passages[0].translations = passage.start_context.translations if passage.start_context.translations?
		# We may need to filter out books on their own depending on the `book_alone_strategy` or the `book_range_strategy`.
		if start_obj.type is "b"
			if end_obj.type is "b" then passage.type = "b_range" else passage.type = "b_range_start"
		else if end_obj.type is "b"
			passage.type = "range_end_b"
		accum.push passage
		[accum, context]

	# For Ps 122-23, treat the 23 as 123.
	range_change_end: (passage, accum, new_end) ->
		[start, end] = passage.value
		if end.type is "integer"
			end.original_value = end.value
			end.value = new_end
		else if end.type is "v"
			new_obj = @pluck "integer", end.value
			new_obj.original_value = new_obj.value
			new_obj.value = new_end
		else if end.type is "cv"
			# Get the chapter object and assign it (in place) the new value.
			new_obj = @pluck "c", end.value
			new_obj.original_value = new_obj.value
			new_obj.value = new_end
		@handle_obj passage, accum, passage.start_context

	# For "Jer 33-11", treat the "11" as a verse.
	range_change_integer_end: (passage, accum) ->
		[start, end] = passage.value
		# We want to retain the originals beacuse a future reparsing may lead to a different outcome.
		passage.original_type ?= passage.type
		passage.original_value ?= [start, end]
		# The start.type is only bc, c, or integer; we're just adding a v for the first two.
		passage.type = if start.type is "integer" then "cv" else start.type + "v"
		# Create the object in the expected format if it's not already a verse.
		passage.value[0] = {type: "c", value: [start], indices: start.indices} if start.type is "integer"
		passage.value[1] = {type: "v", value: [end], indices: end.indices} if end.type is "integer"
		@handle_obj passage, accum, passage.start_context

	# If a new end chapter/verse in a range may be necessary, calculate it.
	range_check_new_end: (translations, start_obj, end_obj, valid) ->
		new_end = 0
		type = null
		# See whether a digit might be omitted (e.g., Gen 22-4 = Gen 22-24).
		if valid.messages.end_chapter_before_start then type = "c"
		else if valid.messages.end_verse_before_start then type = "v"
		new_end = @range_get_new_end_value(start_obj, end_obj, valid, type) if type?
		if new_end > 0
			obj_to_validate = b: end_obj.b, c: end_obj.c, v: end_obj.v
			obj_to_validate[type] = new_end
			new_valid = @validate_ref translations, obj_to_validate
			new_end = 0 unless new_valid.valid
		new_end

	# Handle ranges with a book as the end of the range ("Gen 2-Exod"). It's not `b_range_end` because only objects that start with an explicit book name should start with `b`.
	range_end_b: (passage, accum, context) ->
		@range passage, accum, context

	# If a sequence has an end chapter/verse that's before the the start, check to see whether it can be salvaged: Gen 28-9 = Gen 28-29; Ps 101-24 = Ps 101-124. The `key` parameter is either `c` (for chapter) or `v` (for verse).
	range_get_new_end_value: (start_obj, end_obj, valid, key) ->
		# Return 0 unless it's salvageable.
		new_end = 0
		return new_end if ((key is "c" and valid.messages.end_chapter_is_zero) or (key is "v" and valid.messages.end_verse_is_zero))
		# 54-5, not 54-43, 54-3, or 54-4.
		if start_obj[key] >= 10 and end_obj[key] < 10 and start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]
			# Add the start tens digit to the original end value: 54-5 = 54 through 50 + 5.
			new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10)
		# 123-40, not 123-22 or 123-23; 123-4 is taken care of in the first case.
		else if start_obj[key] >= 100 and end_obj[key] < 100 and start_obj[key] - 100 < end_obj[key]
			# Add 100 to the original end value: 100-12 = 100 through 100 + 12.
			new_end = end_obj[key] + 100
		new_end

	# The range doesn't look valid, but maybe we can fix it. If not, convert it to a sequence.
	range_handle_invalid: (valid, passage, start, start_obj, end, end_obj, accum) ->
		# Is it not valid because the end is before the start and the `end` is an `integer` (Matt 15-6) or a `cv` (Matt 15-6:2) (since anything else resets our expectations)?
		#
		# Only go with a `cv` if it's the chapter that's too low (to avoid doing weird things with 31:30-31:1).
		if (valid.valid is false and (valid.messages.end_chapter_before_start or valid.messages.end_verse_before_start) and (end.type is "integer" or end.type is "v") or (valid.valid is false and valid.messages.end_chapter_before_start and end.type is "cv"))
			new_end = @range_check_new_end passage.start_context.translations, start_obj, end_obj, valid
			# If that's the case, then reparse the current passage object after correcting the end value, which is an integer.
			return @range_change_end passage, accum, new_end if new_end > 0
		# If someone enters "Jer 33-11", they probably mean "Jer.33.11"; as in `@range_handle_valid`, this may be too clever for its own good.
		if @options.end_range_digits_strategy is "verse" and not start_obj.v? and (end.type is "integer" or end.type is "v")
			# I don't know that `end.type` can ever be `v` here. Such a `c-v` pattern is parsed as `cv`.
			temp_value = if end.type is "v" then @pluck "integer", end.value else end.value
			temp_valid = @validate_ref passage.start_context.translations, {b: start_obj.b, c: start_obj.c, v: temp_value}
			return @range_change_integer_end passage, accum if temp_valid.valid
		# Otherwise, if we couldn't fix the range, then treat the range as a sequence. We want to retain the original `type` and `value` in case we need to reparse it differently later.
		passage.original_type ?= passage.type
		passage.type = "sequence"
		# Construct the sequence value in the format expected.
		[passage.original_value, passage.value] = [[start, end], [[start], [end]]]
		# Don't use the `context` object because we changed it in `@range`.
		return @sequence passage, accum, passage.start_context

	# The range looks valid, but we should check for some special cases.
	range_handle_valid: (valid, passage, start, start_obj, end, end_obj, accum) ->
		# If Heb 13-15, treat it as Heb 13:15. This may be too clever for its own good. We check the `passage_existence_strategy` because otherwise `Gen 49-76` becomes `Gen.49.76`.
		if valid.messages.end_chapter_not_exist and @options.end_range_digits_strategy is "verse" and not start_obj.v? and (end.type is "integer" or end.type is "v") and @options.passage_existence_strategy.indexOf("v") >= 0
			temp_value = if end.type is "v" then @pluck "integer", end.value else end.value
			temp_valid = @validate_ref passage.start_context.translations, {b: start_obj.b, c: start_obj.c, v: temp_value}
			return [true, @range_change_integer_end(passage, accum)] if temp_valid.valid
		# Otherwise, snap start/end chapters/verses if they're too high or low.
		@range_validate valid, start_obj, end_obj, passage
		[false, null]

	# If the end object goes past the end of the book or chapter, snap it back to a verse that exists.
	range_validate: (valid, start_obj, end_obj, passage) ->
		# If it's valid but the end range goes too high, snap it back to the appropriate chapter or verse.
		if valid.messages.end_chapter_not_exist or valid.messages.end_chapter_not_exist_in_single_chapter_book
			# `end_chapter_not_exist` gives the highest chapter for the book.
			end_obj.original_c = end_obj.c
			end_obj.c = if valid.messages.end_chapter_not_exist then valid.messages.end_chapter_not_exist else valid.messages.end_chapter_not_exist_in_single_chapter_book
			# If we've snapped it back to the last chapter and there's a verse, also snap to the end of that chapter. If we've already overshot the chapter, there's no reason to think we've gotten the verse right; Gen 50:1-51:1 = Gen 50:1-26 = Gen 50. If there's no verse, we don't need to worry about it.
			if end_obj.v?
				# `end_verse_not_exist` gives the maximum verse for the chapter.
				end_obj.v = @validate_ref(passage.start_context.translations, {b: end_obj.b, c: end_obj.c, v: 999}).messages.end_verse_not_exist
				# If the range ended at Exodus 41:0, make sure we're not going to change it to Exodus 40:1.
				delete valid.messages.end_verse_is_zero
		# If the end verse is too high, snap back to the maximum verse.
		else if valid.messages.end_verse_not_exist
			end_obj.original_v = end_obj.v
			end_obj.v = valid.messages.end_verse_not_exist
		end_obj.v = valid.messages.end_verse_is_zero if valid.messages.end_verse_is_zero and @options.zero_verse_strategy isnt "allow"
		end_obj.c = valid.messages.end_chapter_is_zero if valid.messages.end_chapter_is_zero
		[start_obj.c, start_obj.v] = @fix_start_zeroes valid, start_obj.c, start_obj.v
		true

	# ## Translations
	# Even a single translation ("NIV") appears as part of a translation sequence. Here we handle the sequence and apply the translations to any previous passages lacking an explicit translation: in "Matt 1, 5 ESV," both `Matt 1` and `5` get applied, but in "Matt 1 NIV, 5 ESV," NIV only applies to Matt 1, and ESV only applies to Matt 5.
	translation_sequence: (passage, accum, context) ->
		passage.start_context = bcv_utils.shallow_clone context
		translations = []
		# First get all the translations in the sequence; the first one is separate from the others (which may not exist).
		translations.push translation: @books[passage.value[0].value].parsed
		for val in passage.value[1]
			# `val` at this point is an array.
			val = @books[@pluck("translation", val).value].parsed
			# And now `val` is the literal, lower-cased match.
			translations.push translation: val if val?
		# We need some metadata to do this right.
		for translation in translations
			# Do we know anything about this translation? If so, use that. If not, use the default.
			if @translations.aliases[translation.translation]?
				# `alias` is what we use internally to get bcv data for the translation.
				translation.alias = @translations.aliases[translation.translation].alias
				# `osis` is what we'll eventually use in output.
				translation.osis = @translations.aliases[translation.translation].osis or ""
			else
				translation.alias = "default"
				# If we don't know what the correct abbreviation should be, then just upper-case what we have.
				translation.osis = translation.translation.toUpperCase()
		# Apply the new translations to the existing objects.
		context = @translation_sequence_apply(accum, translations) if accum.length > 0
		# We may need these indices later, depending on how we want to output the data.
		passage.absolute_indices ?= @get_absolute_indices passage.indices
		# Include the `translation_sequence` object in `accum` so that we can handle any later `translation_sequence` objects without overlapping this one.
		accum.push passage
		# Don't carry over the translations into any later references; translations only apply backwards.
		@reset_context context, ["translations"]
		[accum, context]

	# Go back and find the earliest already-parsed passage without a translation. We start with 0 because the below loop will never yield a 0.
	translation_sequence_apply: (accum, translations) ->
		use_i = 0
		# Start with the most recent and go backward--we don't want to overlap another `translation_sequence`.
		for i in [accum.length - 1 .. 0]
			# With a new translation comes the possibility that a previously invalid reference will become valid, so reset it to its original type. For example, a multi-book range may be correct in a different translation because the books are in a different order.
			accum[i].type = accum[i].original_type if accum[i].original_type?
			accum[i].value = accum[i].original_value if accum[i].original_value?
			continue unless accum[i].type is "translation_sequence"
			# If we made it here, then we hit a translation sequence, and we know that the item following it is the first one we care about.
			use_i = i + 1
			break
		# Include the translations in the start context.
		#
		# `use_i` == `accum.length` if there are two translations sequences in a row separated by, e.g., numbers ("Matt 1 ESV 2-3 NIV"). This is unusual.
		if use_i < accum.length
			accum[use_i].start_context.translations = translations
			# The objects in accum are replaced in-place, so we don't need to try to merge them back. We re-parse them because the translation may cause previously valid (or invalid) references to flip the other way--if the new translation includes (or doesn't) the Deuterocanonicals, for example. We ignore the `new_accum`, but we definitely care about the new `context`.
			[new_accum, context] = @handle_array accum.slice(use_i), [], accum[use_i].start_context
		# Use the start context from the last translation_sequence if that's all that's available.
		else
			context = bcv_utils.shallow_clone accum[accum.length - 1].start_context
		# We modify `accum` in-place but return the new `context` to the calling function.
		context

	# ## Utilities
	# Pluck the object or value matching a type from an array.
	pluck: (type, passages) ->
		for passage in passages
			# `passage` can be null if a range needed to be adjusted into a sequence.
			continue unless passage? and passage.type? and passage.type is type
			return @pluck("integer", passage.value) if type is "c" or type is "v"
			return passage
		null

	# Set all the available context keys.
	set_context_from_object: (context, keys, obj) ->
		for type in keys
			continue unless obj[type]?
			context[type] = obj[type]

	# Delete all the existing context keys if, for example, starting with a new book.
	reset_context: (context, keys) ->
		for type in keys
			delete context[type]

	# If the start chapter or verse is 0 and the appropriate option is set to `upgrade`, convert it to a 1.
	fix_start_zeroes: (valid, c, v) ->
		c = valid.messages.start_chapter_is_zero if valid.messages.start_chapter_is_zero and @options.zero_chapter_strategy is "upgrade"
		v = valid.messages.start_verse_is_zero if valid.messages.start_verse_is_zero and @options.zero_verse_strategy is "upgrade"
		[c, v]

	# Given a string and initial index, calculate indices for parts of the string. For example, a string that starts at index 10 might have a book that pushes it to index 12 starting at its third character.
	calculate_indices: (match, adjust) ->
		# This gets switched out the first time in the loop; the first item is never a book even if a book is the first part of the string--there's an empty string before it.
		switch_type = "book"
		indices = []
		match_index = 0
		adjust = parseInt adjust, 10
		# It would be easier to do `for part in match.split /[\x1e\x1f]/`, but IE doesn't return empty matches when using `split`, throwing off the rest of the logic.
		parts = [match]
		for character in ["\x1e", "\x1f"]
			temp = []
			for part in parts
				temp = temp.concat part.split(character)
			parts = temp

		for part in parts
			# Start off assuming it's not a book.
			switch_type = if switch_type is "book" then "rest" else "book"
			# Empty strings don't move the index. This could happen with consecutive books.
			part_length = part.length
			continue if part_length == 0
			# If it's a book, then get the start index of the actual book, add the length of the actual string, then subtract the length of the integer id and the two surrounding characters.
			if switch_type is "book"
				# Remove any stray extra indicators.
				part = part.replace /\/\d+$/, ""
				# Get the length of the id + the surrounding characters. We want the `end` to be the position, not the length. If the part starts at position 0 and is one character (i.e., three characters total, or `\x1f0\x1f`), `end` should be 1, since it occupies positions 0, 1, and 2, and we want the last character to be part of the next index so that we keep track of the end. For example, with "Genesis" at start index 0, the index starting at position 6 ("s") should be 4. Keep the adjust as-is, but set it next.
				end_index = match_index + part_length
				if indices.length > 0 and indices[indices.length - 1].index == adjust
					indices[indices.length - 1].end = end_index
				else
					indices.push start: match_index, end: end_index, index: adjust
				# If the part is one character (three characters total) starting at `match_index` 0, we want the next `match_index` to be 3; it occupies positions 0, 1, and 2. Similarly, if it's two characters, it should be four characters total.
				match_index += part_length + 2
				# Use the known `start_index` from the book, subtracting the current index in the match, to get the new. So if the previous `match_index` == 5 and the book's id is 0, the book's `start_index` == 10, and the book's length == 7, we want the next adjust to be 10 + 7 - 8 = 9 (the 8 is the `match_index` where the new `adjust` starts): 4(+5) = 9, 5(+5) = 10, 6(+5) = 11, 7(+5) = 12, 8(+9) = 17.
				adjust = @books[part].start_index + @books[part].value.length - match_index
				indices.push start: end_index + 1, end: end_index + 1, index: adjust
			else
				# The `- 1` is because we want the `end` to be the position of the last character. If the part starts at position 0 and is three characters long, the `end` should be two, since it occupies positions 0, 1, and 2.
				end_index = match_index + part_length - 1
				if indices.length > 0 and indices[indices.length - 1].index == adjust
					indices[indices.length - 1].end = end_index
				else
					indices.push start: match_index, end: end_index, index: adjust
				match_index += part_length
		indices

	# Find the absolute string indices of start and end points.
	get_absolute_indices: ([start, end]) ->
		start_out = null
		end_out = null
		# `@indices` contains the absolute indices for each range of indices in the string.
		for index in @indices
			# If we haven't found the absolute start index yet, set it.
			if start_out is null and index.start <= start <= index.end
				start_out = start + index.index
			# This may be in the same loop iteration as `start`. The `+ 1` matches Twitter's implementation of indices, where start is the character index and end is the character after the index. So `Gen` is `[0, 3]`.
			if index.start <= end <= index.end
				end_out = end + index.index + 1
				break
		[start_out, end_out]

	# ## Validators
	# Given a start and optional end bcv object, validate that the verse exists and is valid. It returns a `true` value for `valid` if any of the translations is valid.
	validate_ref: (translations, start, end) ->
		# The `translation` key is optional; if it doesn't exist, assume the default translation.
		translations = [{translation: "default", osis: "", alias: "default"}] unless translations? and translations.length > 0
		valid = false
		messages = {}
		# `translation` is a translation object, but all we care about is the string.
		for translation in translations
			translation.alias ?= "default"
			# Only true if `translation` isn't the right type.
			unless translation.alias?
				messages.translation_invalid ?= []
				messages.translation_invalid.push translation
				continue
			# Not a fatal error because we assume that translations match the default unless we know differently. But we still record it because we may want to know about it later. Translations in `alternates` get generated on-demand.
			unless @translations.aliases[translation.alias]?
				translation.alias = "default"
				messages.translation_unknown ?= []
				messages.translation_unknown.push translation
			[temp_valid] = @validate_start_ref translation.alias, start, messages
			[temp_valid] = @validate_end_ref translation.alias, start, end, temp_valid, messages if end
			valid = true if temp_valid is true
		valid: valid, messages: messages

	# Make sure that the start ref exists in the given translation.
	validate_start_ref: (translation, start, messages) ->
		valid = true
		if translation isnt "default" and !@translations[translation]?.chapters[start.b]?
			@promote_book_to_translation start.b, translation
		translation_order = if @translations[translation]?.order? then translation else "default"
		start.v = parseInt start.v, 10 if start.v?
		# Matt
		if @translations[translation_order].order[start.b]?
			start.c ?= 1
			start.c = parseInt start.c, 10
			# Matt five
			if isNaN start.c
				valid = false
				messages.start_chapter_not_numeric = true
				return [valid, messages]
			# Matt 0
			if start.c == 0
				messages.start_chapter_is_zero = 1
				if @options.zero_chapter_strategy is "error" then valid = false
				else start.c = 1
			# Matt 5:0
			if start.v? and start.v == 0
				messages.start_verse_is_zero = 1
				if @options.zero_verse_strategy is "error" then valid = false
				# Can't just have `else` because `allow` is a valid `zero_verse_strategy`.
				else if @options.zero_verse_strategy is "upgrade" then start.v = 1
			# Matt 5
			if start.c > 0 and @translations[translation].chapters[start.b][start.c - 1]?
				# Matt 5:10
				if start.v?
					# Matt 5:ten
					if isNaN start.v
						valid = false
						messages.start_verse_not_numeric = true
					# Matt 5:100
					else if start.v > @translations[translation].chapters[start.b][start.c - 1]
						# Not part of the same `if` statement in case we ever add a new `else` condition.
						if @options.passage_existence_strategy.indexOf("v") >= 0
							valid = false
							messages.start_verse_not_exist = @translations[translation].chapters[start.b][start.c - 1]
			# Matt 50
			else
				if start.c != 1 and @translations[translation].chapters[start.b].length == 1
					valid = false
					messages.start_chapter_not_exist_in_single_chapter_book = 1
				else if start.c > 0 and @options.passage_existence_strategy.indexOf("c") >= 0
					valid = false
					messages.start_chapter_not_exist = @translations[translation].chapters[start.b].length

		# None 2:1
		else
			valid = false if @options.passage_existence_strategy.indexOf("b") >= 0
			messages.start_book_not_exist = true
		# We return an array to make unit testing easier; we only use `valid`.
		[valid, messages]

	# The end ref pretty much just has to be after the start ref; beyond the book, we don't	require the chapter or verse to exist. This approach is useful when people get end verses wrong.
	validate_end_ref: (translation, start, end, valid, messages) ->
		# It's not necessary to check for whether the book exists in a non-default translation here because we've already validated that it works as a `start_ref`, which created the book if it didn't exist. So we don't call `@promote_book_to_translation`.
		translation_order = if @translations[translation]?.order? then translation else "default"
		# Matt 0
		if end.c?
			end.c = parseInt end.c, 10
			# Matt 2-four
			if isNaN end.c
				valid = false
				messages.end_chapter_not_numeric = true
			else if end.c == 0
				messages.end_chapter_is_zero = 1
				if @options.zero_chapter_strategy is "error" then valid = false
				else end.c = 1
		# Matt 5:0
		if end.v?
			end.v = parseInt end.v, 10
			# Matt 5:7-eight
			if isNaN end.v
				valid = false
				messages.end_verse_not_numeric = true
			else if end.v == 0
				messages.end_verse_is_zero = 1
				if @options.zero_verse_strategy is "error" then valid = false
				else if @options.zero_verse_strategy is "upgrade" then end.v = 1

		# Matt-Mark
		if @translations[translation_order].order[end.b]?
			# Even if the `passage_existence_strategy` doesn't include `c`, make sure to treat single-chapter books as single-chapter books.
			end.c = 1 if (!end.c? and @translations[translation].chapters[end.b].length == 1)
			# Mark 4-Matt 5, None 4-Matt 5
			if @translations[translation_order].order[start.b]? and @translations[translation_order].order[start.b] > @translations[translation_order].order[end.b]
				valid = false if @options.passage_existence_strategy.indexOf("b") >= 0
				messages.end_book_before_start = true
			# Matt 5-6
			if start.b is end.b and end.c? and not isNaN end.c
				# Matt-Matt 4
				start.c ?= 1
				# Matt 5-4
				if not isNaN(parseInt start.c, 10) and start.c > end.c
					valid = false
					messages.end_chapter_before_start = true
				# Matt 5:7-5:8
				else if start.c == end.c and end.v? and not isNaN end.v
					# Matt 5-5:8
					start.v ?= 1
					# Matt 5:8-7
					if not isNaN(parseInt start.v, 10) and start.v > end.v
						valid = false
						messages.end_verse_before_start = true
			if end.c? and not isNaN end.c
				if not @translations[translation].chapters[end.b][end.c - 1]?
					if @translations[translation].chapters[end.b].length == 1
						messages.end_chapter_not_exist_in_single_chapter_book = 1
					else if end.c > 0 and @options.passage_existence_strategy.indexOf("c") >= 0
						messages.end_chapter_not_exist = @translations[translation].chapters[end.b].length
			if end.v? and not isNaN end.v
				end.c ?= @translations[translation].chapters[end.b].length
				if end.v > @translations[translation].chapters[end.b][end.c - 1] and @options.passage_existence_strategy.indexOf("v") >= 0
					messages.end_verse_not_exist = @translations[translation].chapters[end.b][end.c - 1]
			# Matt 5:1-None 6
		else
			valid = false
			messages.end_book_not_exist = true
		# We return an array to make unit testing easier; we only use `valid`.
		[valid, messages]

	# Gradually add books to translations as they're needed.
	promote_book_to_translation: (book, translation) ->
		@translations[translation] ?= {}
		@translations[translation].chapters ?= {}
		# If the translation specifically overrides the default, use that. Otherwise stick with the default.
		unless @translations[translation].chapters[book]?
			@translations[translation].chapters[book] = bcv_utils.shallow_clone_array @translations.default.chapters[book]

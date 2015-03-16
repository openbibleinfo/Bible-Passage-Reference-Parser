fs = require "fs"

lang = "en"
max_length = 100

get_abbrevs = (lang) ->
	lines = fs.readFileSync("../../src/#{lang}/book_names.txt").toString().split "\n"
	out = []
	for line in lines
		[osis, abbrev] = line.split "\t"
		out.push abbrev if abbrev?
	out

get_translations = (lang) ->
	["AMP", "ASV", "CEB", "CEV", "ERV", "ESV", "HCSB", "KJV", "MSG", "NAB", "NABRE", "NAS", "NASB", "NIRV", "NIV", "NKJV", "NLT", "NRSV", "RSV", "TNIV"]

get_options = ->
	lines = fs.readFileSync("../../Readme.md").toString().split "\n"
	out = {}
	option = ""
	go = false
	for line in lines
		break if go and line.match /^### /
		go = true if line.match /^### Options/
		continue unless go
		if result = line.match /^\* `(\w+):/
			option = result[1]
			out[option] = []
		else if result = line.match /^\t\* `(\w+)`/
			out[option].push result[1]
	out.passage_existence_strategy = ["b", "bc", "bcv", "bv", "c", "cv", "v", "none"]
	out.include_apocrypha = [true, false]
	out

create_options = (keys) ->
	out = {}
	for option in keys
		out[option] = get_random_item_from_array options[option]
	out

get_random_item_from_array = (items) ->
	items[Math.floor(Math.random() * items.length)]

build_text = (keys) ->
	out = []
	rand = Math.random()
	length = Math.ceil(rand * max_length)
	for i in [1 .. length]
		token = make_token get_random_item_from_array(keys)
		rand = Math.random()
		token += get_random_item_from_array(possibles.space) if rand >= 0.5
		out.push token
	out.join ""

make_token = (type) ->
	rand = Math.random()
	possible = possibles[type]
	if typeof possible is "string"
		token = build_nested_string possible
	else if type.substr(0, 5) is "char_"
		token = String.fromCharCode get_random_item_from_array(possible)
	else
		token = get_random_item_from_array possible
	if rand >= 0.5 and type.match(/^translation/)
		token = "(#{token})"
	token

build_nested_string = (text) ->
	text = text.replace(/\$(\w+)/g, (matches, type) ->
		match = make_token type
		rand = Math.random()
		match += get_random_item_from_array(possibles.space) if rand >= 0.5
		match
		)
	text

bcv_parser = require("../../js/#{lang}_bcv_parser").bcv_parser
bcv = new bcv_parser

possibles =
	book: get_abbrevs lang
	translation: get_translations lang
	number: [0 .. 1100]
	chapter: [0 .. 152]
	verse: [0 .. 177]
	cv_sep: [":", ".", "\"", "'", " "]
	range_sep: ["-", "\u2013", "\u2014", "through", "thru", "to"]
	sequence_sep: [",", ";", "/", ":", "&", "-", "\u2013", "\u2014", "~", "and", "compare", "cf", "cf.", "see also", "also", "see", " "]
	title: ["title"]
	in_book_of: ["from the book of", "of the book of", "in the book of"]
	c_explicit: ["chapters", "chapter", "chapts", "chapts.", "chpts", "chpts.", "chapt", "chapt.", "chaps", "chaps.", "chap", "chap.", "chp", "chp.", "chs", "chs.", "cha", "cha.", "ch", "ch."]
	v_explicit: ["verses", "verse", "ver", "ver.", "vss", "vss.", "vs", "vs.", "vv", "vv.", "v", "v."]
	v_letter: ["a", "b", "c", "d", "e"],
	ff: ["ff", "ff."]
	ordinal: ["th", "nd", "st"]
	space: [" ", "\t", "\n", "\u00a0"]
	punctuation: [",", ".", "!", "?", "-", "'", "\"", "\u2019"]
	parentheses: ["(", ")", "[", "]", "{", "}"]
	letter: ["f", "g", "h", "i"]
	char_ascii: [0 .. 127]
	char_unicode: [128 .. 65535]
	bcv: "$book$chapter$cv_sep$verse"
	b_range: "$book$range_sep$book"
	translation_sequence: "$translation$sequence_sep$translation"
	bc: "$book$chapter"
	bc_range: "$book$chapter$range_sep$book"
	cb: "$c_explicit$chapter$in_book_of$book"
	c_psalm: "$chapter$ordinal$book"
	cv_psalm: "$chapter$ordinal$book$v_explicit$verse"

options = get_options()
possible_keys = Object.keys possibles
option_keys = Object.keys options

total_length = 0
start_time = new Date()
for i in [1 .. 10000000]
	my_options = create_options(option_keys)
	bcv.set_options my_options
	text = build_text(possible_keys)
	total_length += text.length
	if (i % 1000 == 0)
		elapsed_time = (new Date() - start_time) / 1000
		bytes_per_second = Math.round(total_length / elapsed_time)
		console.log i, elapsed_time, (total_length / 1000000), bytes_per_second
	#console.log i, text, "====="
	try
		osis = bcv.parse(text).osis()
		#console.log osis, text, "======" if osis
	catch e
		console.log e
		console.log my_options
		console.log text
		process.exit()


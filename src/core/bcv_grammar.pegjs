start
  = (bcv_hyphen_range / sequence / cb_range / range / next_v / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / translation_sequence_enclosed / translation_sequence / sequence_sep / c_title / integer_title / cv / cv_weak / integer / c / v / word / word_parenthesis / context)+

/* Multiples */
sequence
  = val_1:(cb_range / bcv_hyphen_range / range / next_v / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / context) val_2:(c_sep (cb_range / range / cv_psalm / c_psalm / cbv / cbv_ordinal / cb / cb_ordinal / c_title / cv / c) / sequence_sep? sequence_post)+
    { val_2.unshift([val_1]); var r = range(); return {type: "sequence", value: val_2, indices: [r.start, r.end - 1]} }

sequence_post_enclosed
  = "(" sp sequence_sep? val_1:(sequence_post) val_2:(sequence_sep? sequence_post)* sp ")"
    { if (typeof(val_2) === "undefined") val_2 = []; val_2.unshift([val_1]); var r = range(); return {type: "sequence_post_enclosed", value: val_2, indices: [r.start, r.end - 1]} }

sequence_post
  = sequence_post_enclosed / cb_range / bcv_hyphen_range / range / next_v / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / c_title / integer_title / cv / cv_weak / integer / c / v

// `cv_weak` is after `integer` in `val_2` to avoid cases like "Mark 16:1-6 10". `b` is a special case to avoid oddities like "Ezekiel - 25:16".
range
  = val_1:(bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / b &(range_sep (bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / bv / b)) / cbv / cbv_ordinal / c_psalm / cb / cb_ordinal / c_title / integer_title / cv / cv_weak / integer / c / v) range_sep val_2:(next_v / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / b / cbv / cbv_ordinal / c_psalm / cb / cb_ordinal / c_title / integer_title / cv / integer / cv_weak / c / v)
    { if (val_1.length && val_1.length === 2) val_1 = val_1[0]; // for `b`, which returns [object, undefined]
      var r = range(); return {type: "range", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

/* Singles */
b
  = "\x1f" val:any_integer ("/" [1-8])? "\x1f"
    { var r = range(); return {type: "b", value: val.value, indices: [r.start, r.end - 1]} }

// `v_explicit` is OK only if we're sure it's a cv--otherwise, treat it as a bv. We allow letters here for the `c` in case it turns out to be a single-chapter book that ultimately is treated as a `bv`.
bc
  = val_1:b (v_explicit &cv / cv_sep / cv_sep_weak / range_sep / sp) val_2:c
    { var r = range(); return {type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// Used only in bcv_comma.
bc_comma
  = val_1:b sp "," sp val_2:c
    { var r = range(); return {type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
bc_title
  = val_1:(ps151_bc / bc) &{ return val_1.value[1].value[0].partial == null; } val_2:title
    { var r = range(); return {type: "bc_title", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

bcv
  = val_1:(ps151_bc / bc) !("." v_explicit v / sequence_sep? v_explicit cv) ((cv_sep / sequence_sep)? v_explicit / cv_sep) val_2:v
    { var r = range(); return {type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
bcv_weak
  = val_1:(ps151_bc / bc) &{ return val_1.value[1].value[0].partial == null; } cv_sep_weak val_2:v !(cv_sep v)
    { var r = range(); return {type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// A special case that happens with surprising frequency ("Matt, 5, 6" = "Matt 5:6"). The &{} disallows letters in chapters.
bcv_comma
  = val_1:bc_comma &{ return val_1.value[1].value[0].partial == null; } sp "," sp val_2:v !(cv_sep v)
    { var r = range(); return {type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// A special case ("Matt 5-6-7") of a range that might otherwise get interpreted in a different way. The &{} disallows letters in chapters.
bcv_hyphen_range
  = val_1:b ("-" / space)? val_2:c &{ return val_2.value[0].partial == null; } "-" val_3:v "-" val_4:v
    { var r = range(); return {type: "range", value: [{type: "bcv", value: [{type: "bc", value: [val_1, val_2], indices: [val_1.indices[0], val_2.indices[1]]}, val_3], indices: [val_1.indices[0], val_3.indices[1]]}, val_4], indices: [r.start, r.end - 1]} }

// A sequence_sep is only OK if followed by an explicit verse indicator.
bv
  = val_1:b (cv_sep / cv_sep_weak / range_sep / sequence_sep &v_explicit / sp) val_2:v
    { var r = range(); return {type: "bv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

c
  = c_explicit? val:integer
    { var r = range(); return {type: "c", value: [val], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
cb
  = c_explicit val_1:c &{ return val_1.value[0].partial == null; } in_book_of? val_2:b
    { var r = range(); return {type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
cb_range
  = c_explicit val_1:c &{ return val_1.value[0].partial == null; } range_sep val_2:c in_book_of? val_3:b
    { var r = range(); return {type: "cb_range", value: [val_3, val_1, val_2], indices: [r.start, r.end - 1]} }

cbv
  = val_1:cb sequence_sep? v_explicit val_2:v
    { var r = range(); return {type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

cb_ordinal
  = val_1:c ordinal c_explicit in_book_of? val_2:b
    { var r = range(); return {type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1]} }

ordinal
  = "$ordinal"

cbv_ordinal
  = val_1:cb_ordinal sequence_sep? v_explicit val_2:v
    { var r = range(); return {type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

c_psalm
  = "\x1f" val:any_integer "/1\x1f"
    { var r = range(); return {type: "c_psalm", value: val.value, indices: [r.start, r.end - 1]} }

cv_psalm
  = val_1:c_psalm sequence_sep? v_explicit val_2:v
    { var r = range(); return {type: "cv_psalm", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
c_title
  = c_explicit val_1:c &{ return val_1.value[0].partial == null; } val_2:title
    { var r = range(); return {type: "c_title", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
cv
  = v_explicit? val_1:c &{ return val_1.value[0].partial == null; } !("." v_explicit v) (cv_sep? v_explicit / cv_sep) val_2:v
    { var r = range(); return {type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// The &{} disallows letters in chapters.
cv_weak
  = val_1:c &{ return val_1.value[0].partial == null; } cv_sep_weak val_2:v !(cv_sep v)
    { var r = range(); return {type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

// No `b` or `ps151`.
ff
  = val_1:(bcv / bcv_weak / bc / bv / cv / cv_weak / integer / c / v) sp ff_value
    { var r = range(); return {type: "ff", value: [val_1], indices: [r.start, r.end - 1]} }

ff_value
  = "$ff_value"

next_v
  = val_1:(bcv / bcv_weak / bc / bv / cv / cv_weak / integer / c / v) sp next_value
    { var r = range(); return {type: "next_v", value: [val_1], indices: [r.start, r.end - 1]} }

next_value
  = "$next_value"

integer_title
  = val_1:integer val_2:title
    { var r = range(); return {type: "integer_title", value: [val_1, val_2], indices: [r.start, r.end - 1]} }

context
  = "\x1f" val:any_integer "/9\x1f"
    { var r = range(); return {type: "context", value: val.value, indices: [r.start, r.end - 1]} }

// The `ps151` rules should round-trip `Ps151.1` and `Ps151.1.\d+` OSIS references. Without these rules, `Ps151` gets interpreted as a `bc`, throwing off future verses.
ps151_b
  = "\x1f" val:any_integer "/2\x1f"
    { var r = range(); return {type: "b", value: val.value, indices: [r.start, r.end - 1]} }

// The `- 2` here accounts for the ".1".
ps151_bc
  = val:ps151_b ".1" ![0-9]
    { var r = range(); return {type: "bc", value: [val, {type: "c", value: [{type: "integer", value: 151, indices: [r.end - 2, r.end - 1]}], indices: [r.end - 2, r.end - 1]}], indices: [r.start, r.end - 1]} }

ps151_bcv
  = val_1:ps151_bc "." val_2:integer
    { var r = range(); return {type: "bcv", value: [val_1, {type: "v", value: [val_2], indices: [val_2.indices[0], val_2.indices[1]]}], indices: [r.start, r.end - 1]} }

ab
  = "$ab"

v
  = v_explicit? val:integer
    { var r = range(); return {type: "v", value: [val], indices: [r.start, r.end - 1]} }

/* BCV helpers */
c_explicit
  = c_explicit_value
    { return {type: "c_explicit"} }

c_explicit_value
  = "$c_explicit_value"

c_sep
  = "$c_sep"

v_explicit
  = v_explicit_value
    { return {type: "v_explicit"} }

v_explicit_value
  = "$v_explicit_value"

cv_sep
  = "$cv_sep"

cv_sep_weak
  = "$cv_sep_weak"

sequence_sep
  = ( sequence_sep_value )
    { return "" }

sequence_sep_value
  = "$sequence_sep_value"

range_sep
  = "$range_sep"

title
  = (cv_sep / sequence_sep)? val:title_value
    { var r = range(); return {type:"title", value: [val], indices: [r.start, r.end - 1]} }

title_value
  = "$title_value"

in_book_of
  = "$in_book_of"

/* Translations */
// Prevents a reference entirely enclosed in parentheses from incorrectly grabbing the closing parenthesis of the reference rather than just the closing parenthesis of the translation.
translation_sequence_enclosed
  = sp [\(\[] sp val:(translation (sequence_sep translation)*) sp [\)\]]
    { var r = range(); return {type: "translation_sequence", value: val, indices: [r.start, r.end - 1]} }

translation_sequence
  = sp ("," sp)? val:(translation (sequence_sep translation)*)
    { var r = range(); return {type: "translation_sequence", value: val, indices: [r.start, r.end - 1]} }

translation
  = "\x1e" val:any_integer "\x1e"
    { var r = range(); return {type: "translation", value: val.value, indices: [r.start, r.end - 1]} }

/* Base nodes */
integer
  = val_1:integer_value val_2:( sp ab )?
    { var r = range(); return {type: "integer", value: parseInt(val_1.join(""), 10), partial: (val_2 != null) ? val_2[1].join("") : null, indices: [r.start, r.end - 1]} }

integer_value
  = "$integer_value"

any_integer
  = val:([0-9]+)
    { var r = range(); return {type: "integer", value: parseInt(val.join(""), 10), indices: [r.start, r.end - 1]} }

word
  = val:( [^\x1f\x1e\(\[]+ )
    { var r = range(); return {type: "word", value: val.join(""), indices: [r.start, r.end - 1]} }

// Don't gobble up opening parenthesis in an enclosed translation sequence--stop parsing when reaching an unmatched parenthesis.
word_parenthesis
  = val:[\(\[]
    { var r = range(); return {type: "stop", value: val, indices: [r.start, r.end - 1]} }

// Optional space.
sp
  = space?

space
  = "$space"
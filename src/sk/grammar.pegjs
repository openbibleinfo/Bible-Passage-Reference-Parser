start
  = (bcv_hyphen_range / sequence / cb_range / range / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / translation_sequence_enclosed / translation_sequence / sequence_sep / c_title / integer_title / cv / cv_weak / v_letter / integer / c / v / word / word_parenthesis / context)+

/* Multiples */
sequence
  = val_1:(cb_range / bcv_hyphen_range / range / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / context) val_2:(sequence_sep? sequence_post)+
    { val_2.unshift([val_1]); return {"type": "sequence", "value": val_2, "indices": [offset(), peg$currPos - 1]} }

sequence_post_enclosed
  = "(" sp sequence_sep? val_1:(sequence_post) val_2:(sequence_sep? sequence_post)* sp ")"
    { if (typeof(val_2) === "undefined") val_2 = []; val_2.unshift([val_1]); return {"type": "sequence_post_enclosed", "value": val_2, "indices": [offset(), peg$currPos - 1]} }

sequence_post
  = sequence_post_enclosed / cb_range / bcv_hyphen_range / range / ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / c_title / integer_title / cv / cv_weak / v_letter / integer / c / v

// `cv_weak` is after `integer` in `val_2` to avoid cases like "Mark 16:1-6 10". `b` is a special case to avoid oddities like "Ezekiel - 25:16"
range
  = val_1:(bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / b &(range_sep (bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / bv / b)) / cbv / cbv_ordinal / c_psalm / cb / cb_ordinal / c_title / integer_title / cv / cv_weak / v_letter / integer / c / v) range_sep val_2:(ff / bcv_comma / bc_title / ps151_bcv / bcv / bcv_weak / ps151_bc / bc / cv_psalm / bv / b / cbv / cbv_ordinal / c_psalm / cb / cb_ordinal / c_title / integer_title / cv / v_letter / integer / cv_weak / c / v)
    { if (val_1.length && val_1.length === 2) val_1 = val_1[0]; // for `b`, which returns [object, undefined]
      return {"type": "range", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

/* Singles */
b
  = "\x1f" val:any_integer ("/" [1-8])? "\x1f"
    { return {"type": "b", "value": val.value, "indices": [offset(), peg$currPos - 1]} }

// `v_explicit` is OK only if we're sure it's a cv--otherwise, treat it as a bv.
bc
  = val_1:b (v_explicit &(c cv_sep v) / cv_sep+ / cv_sep_weak+ / range_sep+ / sp) val_2:c
    { return {"type": "bc", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

// Used only in bcv_comma.
bc_comma
  = val_1:b sp "," sp val_2:c
    { return {"type": "bc", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

bc_title
  = val_1:(ps151_bc / bc) val_2:title
    { return {"type": "bc_title", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

bcv
  = val_1:(ps151_bc / bc) !("." v_explicit v / sequence_sep? v_explicit cv) ((cv_sep / sequence_sep)? v_explicit / cv_sep) val_2:(v_letter / v)
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

bcv_weak
  = val_1:(ps151_bc / bc) cv_sep_weak val_2:(v_letter / v) !(cv_sep v)
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

// A special case that happens with surprising frequency ("Matt, 5, 6" = "Matt 5:6").
bcv_comma
  = val_1:bc_comma sp "," sp val_2:(v_letter / v) !(cv_sep v)
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

// A special case ("Matt 5-6-7") of a range that might otherwise get interpreted in a different way.
bcv_hyphen_range
  = val_1:b ("-" / space)? val_2:c "-" val_3:v "-" val_4:v
    { return {"type": "range", "value": [{"type": "bcv", "value": [{"type": "bc", "value": [val_1, val_2], "indices": [val_1.indices[0], val_2.indices[1]]}, val_3], "indices": [val_1.indices[0], val_3.indices[1]]}, val_4], "indices": [offset(), peg$currPos - 1]} }

// A sequence_sep is only OK if followed by an explicit verse indicator.
bv
  = val_1:b (cv_sep+ / cv_sep_weak+ / range_sep+ / sequence_sep+ &v_explicit / sp) val_2:(v_letter / v)
    { return {"type": "bv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

cb
  = c_explicit val_1:c in_book_of? val_2:b
    { return {"type": "bc", "value": [val_2, val_1], "indices": [offset(), peg$currPos - 1]} }

cb_range
  = c_explicit val_1:c range_sep val_2:c in_book_of? val_3:b
    { return {"type": "cb_range", "value": [val_3, val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

cbv
  = val_1:cb sequence_sep? v_explicit val_2:v
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

cb_ordinal
  = val_1:c ("th" / "nd" / "st") c_explicit in_book_of? val_2:b
    { return {"type": "bc", "value": [val_2, val_1], "indices": [offset(), peg$currPos - 1]} }

cbv_ordinal
  = val_1:cb_ordinal sequence_sep? v_explicit val_2:v
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

c_psalm
  = "\x1f" val:any_integer "/1\x1f"
    { return {"type": "c_psalm", "value": val.value, "indices": [offset(), peg$currPos - 1]} }

cv_psalm
  = val_1:c_psalm sequence_sep? v_explicit val_2:v
    { return {"type": "cv_psalm", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

c_title
  = c_explicit val_1:c val_2:title
    { return {"type": "c_title", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

cv
  = v_explicit? val_1:c !("." v_explicit v) (cv_sep? v_explicit / cv_sep) val_2:(v_letter / v)
    { return {"type": "cv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

cv_weak
  = val_1:c cv_sep_weak val_2:(v_letter / v) !(cv_sep v)
    { return {"type": "cv", "value": [val_1, val_2], "indices": [offset(), peg$currPos - 1]} }

c
  = c_explicit? val:integer
    { return {"type": "c", "value": [val], "indices": [offset(), peg$currPos - 1]} }

// No `b` or `ps151`.
ff
  = val_1:(bcv / bcv_weak / bc / bv / cv / cv_weak / integer / c / v) sp "ff" abbrev? ![a-z]
    { return {"type": "ff", "value": [val_1], "indices": [offset(), peg$currPos - 1]} }

integer_title
  = val_1:integer (cv_sep / sequence_sep)? "title"
    { return {"type": "integer_title", "value": [val_1], "indices": [offset(), peg$currPos - 1]} }

context
  = "\x1f" val:any_integer "/9\x1f"
    { return {"type": "context", "value": val.value, "indices": [offset(), peg$currPos - 1]} }

// The `ps151` rules should round-trip `Ps151.1` and `Ps151.1.\d+` OSIS references. Without these rules, `Ps151` gets interpreted as a `bc`, throwing off future verses.
ps151_b
  = "\x1f" val:any_integer "/2\x1f"
    { return {"type": "b", "value": val.value, "indices": [offset(), peg$currPos - 1]} }

ps151_bc
  = val:ps151_b ".1" ![0-9]
    { return {"type": "bc", "value": [val, {"type": "c", "value": [{"type": "integer", "value": 151, "indices": [peg$currPos - 2, peg$currPos - 1]}], "indices": [peg$currPos - 2, peg$currPos - 1]}], "indices": [offset(), peg$currPos - 1]} }

ps151_bcv
  = val_1:ps151_bc "." val_2:integer
    { return {"type": "bcv", "value": [val_1, {"type": "v", "value": [val_2], "indices": [val_2.indices[0], val_2.indices[1]]}], "indices": [offset(), peg$currPos - 1]} }

v_letter
  = v_explicit? val:integer sp !( "ff" ) [b-e] ![a-z]
    { return {"type": "v", "value": [val], "indices": [offset(), peg$currPos - 1]} }

v
  = v_explicit? val:integer
    { return {"type": "v", "value": [val], "indices": [offset(), peg$currPos - 1]} }

/* BCV helpers */
c_explicit
  = sp ( "kapitoly" / "kapitole" / "kapitolu" / "kapitol" / "hlavy" / "kap" abbrev? ) sp
    { return {"type": "c_explicit"} }

v_explicit
  = sp ( "ver" [šs]i "ov" ) ![a-z] sp
    { return {"type": "v_explicit"} }

cv_sep
  = sp (":"+ / "." !(sp "." sp ".") ) sp

cv_sep_weak
  = sp ["'] sp / space

sequence_sep
  = ([,;/:&\-\u2013\u2014~] / "." !(sp "." sp ".") / "porov" / "pozri" / "alebo" / "a" / space)+
    { return "" }

range_sep
  = sp ([\-\u2013\u2014] sp / "a" [žz]i sp / "-" sp )+

title
  = (cv_sep / sequence_sep)? val:"title"
    { return {type:"title", value: [val], "indices": [offset(), peg$currPos - 1]} }

in_book_of
  = sp ("from" / "of" / "in") sp ("the" sp "book" sp "of" sp)?

abbrev
  = sp "." !(sp "." sp ".")

/* Translations */
// Prevents a reference entirely enclosed in parentheses from incorrectly grabbing the closing parenthesis of the reference rather than just the closing parenthesis of the translation
translation_sequence_enclosed
  = sp [\(\[] sp val:(translation (sequence_sep translation)*) sp [\)\]]
    { return {"type": "translation_sequence", "value": val, "indices": [offset(), peg$currPos - 1]} }

translation_sequence
  = sp ("," sp)? val:(translation (sequence_sep translation)*)
    { return {"type": "translation_sequence", "value": val, "indices": [offset(), peg$currPos - 1]} }

translation
  = "\x1e" val:any_integer "\x1e"
    { return {"type": "translation", "value": val.value, "indices": [offset(), peg$currPos - 1]} }

/* Base nodes */
// Integer is never four or more digits long or followed by, e.g., ",000"
integer
  = val:([0-9] [0-9]? [0-9]?) !([0-9] / ",000")
    { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [offset(), peg$currPos - 1]} }

any_integer
  = val:([0-9]+)
    { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [offset(), peg$currPos - 1]} }

word
  = val:( [^\x1f\x1e\(\[]+ )
    { return {"type": "word", "value": val.join(""), "indices": [offset(), peg$currPos - 1]} }

// Don't gobble up opening parenthesis in an enclosed translation sequence--stop parsing when reaching an unmatched parenthesis
word_parenthesis
  = val:[\(\[]
    { return {"type": "stop", "value": val, "indices": [offset(), peg$currPos - 1]} }

sp
  = space?

// Older IE doesn't consider `\xa0` part of the `\s` class
space
  = [ \t\r\n\xa0\*]+
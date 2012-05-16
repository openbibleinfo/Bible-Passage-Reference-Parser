// In keeping with certain locales, this grammar uses , instead of [.:] as a cv separator and . instead of , as a sequence separator.
{var indices = {}}
start
  = (bcv_hyphen_range / sequence / cb_range / range / ff / bcv_comma / bc_title / bcv / bcv_weak / bc / cv_psalm / bv / b_range / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / translation_sequence_enclosed / translation_sequence / sequence_sep / c_title / integer_title / cv / cv_weak / v_letter / integer / c / v / word)+

sequence
  = &{indices["sequence"] = pos; return true} val_1:(cb_range / bcv_hyphen_range / range / ff / bcv_comma / bc_title / bcv / bcv_weak / bc / cv_psalm / bv / b_range / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal) val_2:((sequence_sep / "") (cb_range / bcv_hyphen_range / range / ff / bcv_comma / bc_title / bcv / bcv_weak / bc / cv_psalm / bv / b_range / c_psalm / b / cbv / cbv_ordinal / cb / cb_ordinal / c_title / integer_title / cv / cv_weak / v_letter / integer / c / v))+
    { val_2.unshift([val_1]); return {"type": "sequence", "value": val_2, "indices": [indices["sequence"], pos - 1]} }

//cv_weak is after integer in val_2 to avoid cases like "Mark 16:1-6 10"
range
  = &{indices["range"] = pos; return true} val_1:(ff / bcv_comma / bc_title / bcv / bcv_weak / bc / cv_psalm / bv / cbv / cbv_ordinal / c_psalm / cb / cb_ordinal / c_title / integer_title / cv / cv_weak / v_letter / integer / c / v) range_sep val_2:(ff / bcv_comma / bc_title / bcv / bcv_weak / bc / cv_psalm / bv / cbv / cbv_ordinal / c_psalm / cb / cb_ordinal / c_title / integer_title / cv / v_letter / integer / cv_weak / c / v)
    { return {"type": "range", "value": [val_1, val_2], "indices": [indices["range"], pos - 1]} }

b_range
  = &{indices["b_range"] = pos; return true} val_1:(b) range_sep !(range / ff / bcv / bcv_weak / bc / bv) val_2:(b)
    { return {"type": "b_range", "value": [val_1, val_2], "indices": [indices["b_range"], pos - 1]} }

//a special case ("Matt 5-6-7") of a range that might otherwise get interpreted in a different way
bcv_hyphen_range
  = &{indices["bcv_hyphen_range"] = pos; return true} val_1:b ("-" / space)? val_2:c "-" val_3:v "-" val_4:v
    { return {"type": "range", "value": [{"type": "bcv", "value": [{"type": "bc", "value": [val_1, val_2], "indices": [val_1.indices[0], val_2.indices[1]]}, val_3], "indices": [val_1.indices[0], val_3.indices[1]]}, val_4], "indices": [indices["bcv_hyphen_range"], pos - 1]} }

b
  = &{indices["b"] = pos; return true} "\x1f" val:any_integer ("/" [a-z])? "\x1f"
    { return {"type": "b", "value": val.value, "indices": [indices["b"], pos - 1]} }

//v_explicit is OK only if we're sure it's a cv--otherwise, treat it as a bv
bc
  = &{indices["bc"] = pos; return true} val_1:b (v_explicit &(c cv_sep v) / cv_sep+ / cv_sep_weak+ / range_sep+ / sp) val_2:c
    { return {"type": "bc", "value": [val_1, val_2], "indices": [indices["bc"], pos - 1]} }

//used only in bcv_comma
bc_comma
  = &{indices["bc_comma"] = pos; return true} val_1:b sp "," sp val_2:c
    { return {"type": "bc", "value": [val_1, val_2], "indices": [indices["bc_comma"], pos - 1]} }

bc_title
  = &{indices["bc_title"] = pos; return true} val_1:bc val_2:title
    { return {"type": "bc_title", "value": [val_1, val_2], "indices": [indices["bc_title"], pos - 1]} }

bcv
  = &{indices["bcv"] = pos; return true} val_1:bc !("." v_explicit v) ((cv_sep / sequence_sep)? v_explicit / cv_sep) val_2:(v_letter / v)
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["bcv"], pos - 1]} }

bcv_weak
  = &{indices["bcv_weak"] = pos; return true} val_1:bc cv_sep_weak val_2:(v_letter / v) !(cv_sep v)
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["bcv_weak"], pos - 1]} }

//a special case that happens with surprising frequency ("Matt, 5, 6" = "Matt 5:6")
bcv_comma
  = &{indices["bcv_comma"] = pos; return true} val_1:bc_comma sp "," sp val_2:(v_letter / v) !(cv_sep v)
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["bcv_comma"], pos - 1]} }

//a sequence_sep is only OK if followed by an explicit verse indicator
bv
  = &{indices["bv"] = pos; return true} val_1:b (cv_sep+ / cv_sep_weak+ / range_sep+ / sequence_sep+ &v_explicit / sp) val_2:(v_letter / v)
    { return {"type": "bv", "value": [val_1, val_2], "indices": [indices["bv"], pos - 1]} }

cb
  = &{indices["cb"] = pos; return true} c_explicit val_1:c in_book_of? val_2:b
    { return {"type": "bc", "value": [val_2, val_1], "indices": [indices["cb"], pos - 1]} }

cb_range
  = &{indices["cb_range"] = pos; return true} c_explicit val_1:c range_sep val_2:c in_book_of? val_3:b
    { return {"type": "cb_range", "value": [val_3, val_1, val_2], "indices": [indices["cb_range"], pos - 1]} }

cbv
  = &{indices["cbv"] = pos; return true} val_1:cb sequence_sep? v_explicit val_2:v
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["cbv"], pos - 1]} }

cb_ordinal
  = &{indices["cb_ordinal"] = pos; return true} val_1:c ("th" / "nd" / "st") c_explicit in_book_of? val_2:b
    { return {"type": "bc", "value": [val_2, val_1], "indices": [indices["cb_ordinal"], pos - 1]} }

cbv_ordinal
  = &{indices["cbv_ordinal"] = pos; return true} val_1:cb_ordinal sequence_sep? v_explicit val_2:v
    { return {"type": "bcv", "value": [val_1, val_2], "indices": [indices["cbv_ordinal"], pos - 1]} }

c_psalm
  = &{indices["c_psalm"] = pos; return true} "\x1f" val:integer "/p\x1f"
    { return {"type": "c_psalm", "value": val.value, "indices": [indices["c_psalm"], pos - 1]} }

cv_psalm
  = &{indices["cv_psalm"] = pos; return true} val_1:c_psalm sequence_sep? v_explicit val_2:v
    { return {"type": "cv_psalm", "value": [val_1, val_2], "indices": [indices["cv_psalm"], pos - 1]} }

c_title
  = &{indices["c_title"] = pos; return true} c_explicit val_1:c val_2:title
    { return {"type": "c_title", "value": [val_1, val_2], "indices": [indices["c_title"], pos - 1]} }

cv
  = &{indices["cv"] = pos; return true} val_1:c !("." v_explicit v) (cv_sep? v_explicit / cv_sep) val_2:(v_letter / v)
    { return {"type": "cv", "value": [val_1, val_2], "indices": [indices["cv"], pos - 1]} }

cv_weak
  = &{indices["cv_weak"] = pos; return true} val_1:c cv_sep_weak val_2:(v_letter / v) !(cv_sep v)
    { return {"type": "cv", "value": [val_1, val_2], "indices": [indices["cv_weak"], pos - 1]} }

c
  = &{indices["c"] = pos; return true} c_explicit? val:integer
    { return {"type": "c", "value": [val], "indices": [indices["c"], pos - 1]} }

integer_title
  = &{indices["integer_title"] = pos; return true} val_1:integer (cv_sep / sequence_sep)? "tít"i "ulo"?
    { return {"type": "integer_title", "value": [val_1], "indices": [indices["integer_title"], pos - 1]} }

v_letter
  = &{indices["v_letter"] = pos; return true} v_explicit? val:integer sp [a-e] ![a-z]
    { return {"type": "v", "value": [val], "indices": [indices["v_letter"], pos - 1]} }

v
  = &{indices["v"] = pos; return true} v_explicit? val:integer
    { return {"type": "v", "value": [val], "indices": [indices["v"], pos - 1]} }

// No "b"
ff
  = &{indices["ff"] = pos; return true} val_1:(bcv / bcv_weak / bc / cv / cv_weak / integer / c / v) sp "f" "f"? abbrev? ![a-z]
    { return {"type": "ff", "value": [val_1], "indices": [indices["ff"], pos - 1]} }

/* BCV helpers */
c_explicit
  = sp ( "cap" [íi]i "tulo" "s"? / "c" "a"? "p" "s"? abbrev? ) sp
    { return {"type": "c_explicit"} }

v_explicit
  = sp ("vers" [íi]i "culo" "s"? / "vv" abbrev? / "ver" abbrev? / "v" "s"? "s"? abbrev?) sp
    { return {"type": "v_explicit"} }

cv_sep
  = sp "," sp

cv_sep_weak
  = sp ["'] sp / space

sequence_sep
  = ([;/:\-\u2013\u2014~] / "." !(sp "." sp ".") / "y" / "&" / space)+
    { return "" }

range_sep
  = sp ([\-\u2013\u2014] sp / "to" sp / "á"i sp)+

title
  = &{indices["title"] = pos; return true} (cv_sep / sequence_sep)? val:( "tít"i "ulo"? )
    { return {type:"title", value: [val], "indices": [indices["title"], pos - 1]} }

in_book_of
  = sp ("en" / "de") sp ("el" sp "libro" sp "de" sp)?

abbrev
  = sp "." !(sp "." sp ".")

/* Translations */
// Prevents a reference entirely enclosed in parentheses from incorrectly grabbing the closing parenthesis of the reference rather than just the closing parenthesis of the translation
translation_sequence_enclosed
  = &{indices["translation_sequence_enclosed"] = pos; return true} sp [\(\[] sp val:(translation (sequence_sep translation)*) sp [\)\]]
    { return {"type": "translation_sequence", "value": val, "indices": [indices["translation_sequence_enclosed"], pos - 1]} }

translation_sequence
  = &{indices["translation_sequence"] = pos; return true} sp ("," sp)? val:(translation (sequence_sep translation)*)
    { return {"type": "translation_sequence", "value": val, "indices": [indices["translation_sequence"], pos - 1]} }

translation
  = &{indices["translation"] = pos; return true} "\x1e" val:any_integer "\x1e"
    { return {"type": "translation", "value": val.value, "indices": [indices["translation"], pos - 1]} }

/* Base nodes */
// Integer is never four or more digits long or followed by, e.g., ",000"
integer
  = &{indices["integer"] = pos; return true} val:([0-9] [0-9]? [0-9]?) !([0-9] / ",000")
    { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [indices["integer"], pos - 1]} }

any_integer
  = &{indices["any_integer"] = pos; return true} val:([0-9]+)
    { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [indices["any_integer"], pos - 1]} }

word
  = &{indices["word"] = pos; return true} val:([^\x1f\x1e]+)
    { return {"type": "word", "value": val.join(""), "indices": [indices["word"], pos - 1]} }

sp
  = space?

// Older IE doesn't consider `\u00a0` part of the `\s` class
space
  = [ \t\r\n\u00a0\*]+
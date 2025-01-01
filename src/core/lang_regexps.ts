import { BCVParserOptions, BCVRegExpsInterface, BookRegExpInterface } from "./types";

export default class bcv_regexps implements BCVRegExpsInterface {
books: BookRegExpInterface[] = [];
languages = "$LANG_ISOS";
translations = [/$TRANS_REGEXP\b/gi];
// Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`.
// Start with an inverted book/chapter (cb). The last one doesn't allow plural since it's a single chapter.
// Then move onto a book, which is the anchor for everything.
// The `/\d+\x1f` is for special Psalm chapters.
// The `$TITLE` has `[a-z]` instead of `\w` because it could be followed by a number.
// $AB allows `1:1a`.
escaped_passage = new RegExp(String.raw`
	(?:^|$PRE_PASSAGE_ALLOWED_CHARACTERS)
		(
			(?:
				  (?: ch (?: apters? | a?pts?\.? | a?p?s?\.? )? \s*
					\d+ \s* (?: [\u2013\u2014\-] | through | thru | to) \s* \d+ \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )?\s* )
				| (?: ch (?: apters? | a?pts?\.? | a?p?s?\.? )? \s*
					\d+ \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )?\s* )
				| (?: \d+ (?: th | nd | st ) \s*
					ch (?: apter | a?pt\.? | a?p?\.? )? \s*
					(?: from | of | in ) (?: \s+ the \s+ book \s+ of )? \s* )
			)?
			\x1f(\d+)(?:/\d+)?\x1f
				(?:
				    /\d+\x1f
				  | $VALID_CHARACTERS
				  | $TITLE (?![a-z])
				  | $PASSAGE_COMPONENTS
				  | $AB(?!\w)
				  | $
				 )+
		)
	`.replace(/\s+/g, ""), "giu");
// These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff. \uff09 is a full-width closing parenthesis.
match_end_split = new RegExp(String.raw`
	  \d \W* $TITLE
	| \d \W* $NEXT (?:[\s*]*\.)?
	| \d \W* $FF (?:[\s*]*\.)?
	| \d [\s*]* $AB (?!\w)
	| \x1e (?:[\s*]*[)\]\uff09])?
	| [\d\x1f]
	`.replace(/\s+/g, ""), "gi");
control = /[\x1e\x1f]/g;

// These are needed for ranges outside of this class.
first = String.raw`$FIRST\.?\s*`;
second = String.raw`$SECOND\.?\s*`;
third = String.raw`$THIRD\.?\s*`;
range_and = String.raw`(?:[&\u2013\u2014-]|$AND|$TO)`;
range_only = String.raw`(?:[\u2013\u2014-]|$TO)`;

pre_book = /$FULL_PRE_BOOK_ALLOWED_CHARACTERS/gu;
pre_number_book = /$FULL_PRE_NUMBER_BOOK_ALLOWED_CHARACTERS/gu;
post_book = /$FULL_POST_BOOK_ALLOWED_CHARACTERS/gu;

// Each book regexp should return one parenthesized object: the book string.
all_books: BookRegExpInterface[] = [
	{
		osis: ["Ps"],
		testament: "a",
		extra: "2",
		// We only want to match a valid OSIS, so we can use a regular `\b` condition. It's always followed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
		regexp: /\b(Ps151)(?=\.1\b)/g // It's case-sensitive because we only want to match a valid OSIS. No `u` flag is necessary because we're not doing anything that requires it.
	},
//$BOOK_REGEXPS
]

}

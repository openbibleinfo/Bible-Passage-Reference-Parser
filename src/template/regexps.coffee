bcv_parser::regexps.space = "[\\s\\xa0]"
bcv_parser::regexps.escaped_passage = ///
	(?:^ | $PRE_PASSAGE_ALLOWED_CHARACTERS )	#beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`
		(
			\x1f(\d+)(?:/[a-z])?\x1f		#book
				(?:
				  | /p\x1f					#special Psalm chapter
				  | $VALID_CHARACTERS
				  | $PASSAGE_COMPONENTS
				  | $TITLE (?! [a-z] )		#could be followed by a number
				  | $AB (?! \w )			#a-e allows 1:1a
				  | $						#or the end of the string
				 )+
		)
	///gi
# These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**.
bcv_parser::regexps.match_end_split = ///
	  \d+ \W* $TITLE
	| \d+ \W* $FF (?: [\s\xa0*]* \.)?
	| \d+ [\s\xa0*]* $AB (?! \w )
	| \x1e (?: [\s\xa0*]* [)\]\uff09] )? #ff09 is a full-width closing parenthesis
	| [\d\x1f]+
	///gi
bcv_parser::regexps.control = /[\x1e\x1f]/g
bcv_parser::regexps.pre_book = "$PRE_BOOK_ALLOWED_CHARACTERS"

bcv_parser::regexps.first = "$FIRST\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.second = "$SECOND\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.third = "$THIRD\\.?#{bcv_parser::regexps.space}*"
bcv_parser::regexps.range_and = "(?:[&\u2013\u2014-]|$AND|$TO)"
bcv_parser::regexps.range_only = "(?:[\u2013\u2014-]|$TO)"
# Each book regexp should return two parenthesized objects: an optional preliminary character and the book itself.
bcv_parser::regexps.get_books = (include_apocrypha) ->
	books = [
$BOOK_REGEXPS
	]
	# Short-circuit the loop if we know we want all the books.
	return books if include_apocrypha is true
	# Filter out books in the Apocrypha if we don't want them. `Array.map` isn't supported below IE9.
	out = []
	for book in books
		continue if book.apocrypha? and book.apocrypha is true
		out.push book
	out

# Default to not using the Apocrypha
bcv_parser::regexps.books = bcv_parser::regexps.get_books false
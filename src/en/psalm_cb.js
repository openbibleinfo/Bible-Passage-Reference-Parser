	{
		osis: ["Ps"],
		testament: "oa",
		testament_books: { "Ps": "oa" },
		extra: "1",
		// Allow Psalm 151 here and remove it later if it's irrelevant. That avoids cases like `151st Psalm verse 2` turning into `Ps.1.2`.
		regexp: new RegExp(String.raw`\b((?:
			  (?: (?: 1 [02-5] | [2-9] )? (?: 1 \s* st | 2 \s* nd | 3 \s* rd ) )
			| 1? 1 [123] \s* th
			| (?: 150 | 1 [0-4] [04-9] | [1-9] [04-9] | [4-9] )  \s* th
			)
			\s* Psalm
			)\b`.replace(/\s+/g, ""), "gi") // no need for `u`
	}
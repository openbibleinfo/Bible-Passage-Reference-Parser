use strict;
use warnings;
use Data::Dumper;
use Unicode::Normalize;
use JSON;
use MIME::Base64;

my ($lang) = @ARGV;
die "The first argument should be a language iso code (e.g., \"fr\")" unless ($lang && $lang =~ /^\w+$/);
my $dir = '../src';
my $test_dir = '../test';
my $regexp_space = "[\\s\x{a0}]";
my $valid_characters = "[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\x{ff08}\x{ff09}\\[\\]/\"'\\*=~\\-\\u2013\\u2014]";
my $letters = '';
my %valid_osises = make_valid_osises(qw(Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev Tob Jdt GkEsth Wis Sir Bar PrAzar Sus Bel SgThree EpJer 1Macc 2Macc 3Macc 4Macc 1Esd 2Esd PrMan AddEsth AddDan));

my %raw_abbrevs;
my %vars = get_vars();
my %abbrevs = get_abbrevs();
my @order = get_order();
my %all_abbrevs = make_tests();
make_regexps();
make_grammar();
my $default_alternates_file = "$dir/en/translation_alternates.coffee";
make_translations();

sub make_translations
{
	my $out = get_file_contents("$dir/template/translations.coffee");
	my (@regexps, @aliases);
	foreach my $translation (@{$vars{'$TRANS'}})
	{
		my ($trans, $osis, $alias) = split /,/, $translation;
		push @regexps, $trans;
		next unless ($osis || $alias);
		$osis = $trans unless ($osis);
		$alias = 'default' unless ($alias);
		my $lc = lc $trans;
		$lc = '"' . $lc . '"' if ($lc =~ /\W/);
		push @aliases, "$lc:\x0a\t\t\tosis: \"$osis\"\x0a\t\t\talias: \"$alias\""
	}
	my $regexp = make_book_regexp('translations', \@regexps, 1);
	my $alias = join "\x0a\t\t", @aliases;
	if (-f "$dir/$lang/translation_aliases.coffee")
	{
		$alias = get_file_contents("$dir/$lang/translation_aliases.coffee");
		$out =~ s/\t+(\$TRANS_ALIAS)/$1/g;
	}
	my $alternate = get_file_contents($default_alternates_file);
	$alternate = get_file_contents("$dir/$lang/translation_alternates.coffee") if (-f "$dir/$lang/translation_alternates.coffee");
	$out =~ s/\$TRANS_REGEXP/$regexp/g;
	$out =~ s/\$TRANS_ALIAS/$alias/g;
	$out =~ s/\s*\$TRANS_ALTERNATE/\n$alternate/g;
	open OUT, ">:utf8", "$dir/$lang/translations.coffee";
	print OUT $out;
	close OUT;
	if ($out =~ /(\$[A-Z_]+)/)
	{
		die "$1\nTranslations: Capital variable";
	}
}

sub make_grammar
{
	my $out = get_file_contents("$dir/template/grammar.pegjs");
	foreach my $key (sort keys %vars)
	{
		my $safe_key = $key;
		$safe_key =~ s/^\$/\\\$/;
		$out =~ s/$safe_key(?!\w)/format_var('pegjs', $key)/ge;
	}

	open OUT, ">:utf8", "$dir/$lang/grammar.pegjs";
	print OUT $out;
	close OUT;
	if ($out =~ /(\$[A-Z_]+)/)
	{
		die "$1\nGrammar: Capital variable";
	}
	my $prev = $out;
	$out =~ s@cv_sep\n  =[^\n]+\n@cv_sep\n  = sp "," sp@;
	die "No cv_sep change" if ($prev eq $out);
	$prev = $out;
	$out =~ s@(sequence_sep\n  = \(\[),@$1@;
	die "No sequence_sep change" if ($prev eq $out);
	open OUT, ">:utf8", "$dir/$lang/eu_grammar.pegjs";
	print OUT $out;
	close OUT;
}

sub make_regexps
{
	my $out = get_file_contents("$dir/template/regexps.coffee");
	my @osises = @order;
	foreach my $osis (sort keys %raw_abbrevs)
	{
		next unless ($osis =~ /,/);
		my $temp = $osis;
		$temp =~ s/,+$//;
		my $apocrypha = (exists $valid_osises{$temp} && $valid_osises{$temp} eq 'apocrypha') ? 1 : 0;
		push @osises, {osis => $osis, apocrypha => $apocrypha};
	}
	my $book_regexps = make_regexp_set(@osises);
	$out =~ s/\$BOOK_REGEXPS/$book_regexps/;
	$out =~ s/\$VALID_CHARACTERS/$valid_characters/;
	$out =~ s/\$PRE_PASSAGE_ALLOWED_CHARACTERS/join('|', @{$vars{'$PRE_PASSAGE_ALLOWED_CHARACTERS'}})/e;
	my $pre = join '|', map { format_value('quote', $_)} @{$vars{'$PRE_BOOK_ALLOWED_CHARACTERS'}};
	$out =~ s/\$PRE_BOOK_ALLOWED_CHARACTERS/$pre/;
	my @passage_components;
	foreach my $var ('$CHAPTER', '$FF', '$TO', '$AND', '$VERSE')
	{
		push @passage_components, map { format_value('regexp', $_) } @{$vars{$var}} if (exists $vars{$var});
	}
	@passage_components = sort { length $b <=> length $a } @passage_components;
	$out =~ s/\$PASSAGE_COMPONENTS/join(' | ', @passage_components)/e;
	foreach my $key (sort keys %vars)
	{
		my $safe_key = $key;
		$safe_key =~ s/^\$/\\\$/;
		$out =~ s/$safe_key(?!\w)/format_var('regexp', $key)/ge;
	}

	open OUT, ">:utf8", "$dir/$lang/regexps.coffee";
	print OUT $out;
	close OUT;
	if ($out =~ /(\$[A-Z_]+)/)
	{
		die "$1\nRegexps: Capital variable";
	}
}

sub make_regexp_set
{
	my @out;
	my $has_psalm_cb = 0;
	foreach my $ref (@_)
	{
		my $osis = $ref->{osis};
		my $apocrypha = $ref->{apocrypha};
		if ($osis eq 'Ps' && !$has_psalm_cb && -f "$dir/$lang/psalm_cb.coffee")
		{
			push @out, get_file_contents("$dir/$lang/psalm_cb.coffee");
			$has_psalm_cb = 1;
		}
		my %safes;
		foreach my $abbrev (keys %{$raw_abbrevs{$osis}})
		{
			my $safe = $abbrev;
			$safe =~ s/[\[\]\?]//g;
			$safes{$abbrev} = length $safe;
		}
		push @out, make_regexp($osis, $apocrypha, sort { $safes{$b} <=> $safes{$a} } keys %safes);
	}
	return join("\x0a\t,\x0a", @out);
}

sub make_regexp
{
	my $osis = shift;
	my $apocrypha = shift;
	my (@out, @abbrevs);

	foreach my $abbrev (@_)
	{
		$abbrev =~ s/ /$regexp_space*/g;
		$abbrev =~ s/[\x{200b}]/my $temp = $regexp_space; $temp =~ s!\]$!\x{200b}]!; "$temp*"/ge;
		$abbrev = handle_accents($abbrev);
		$abbrev =~ s/(\$[A-Z]+)(?!\w)/format_var('regexp', $1) . "\\.?"/ge;
		push @abbrevs, $abbrev;
	}
	my $book_regexp = make_book_regexp($osis, $all_abbrevs{$osis}, 1);
	$osis =~ s/,+$//;
	$osis =~ s/,/", "/g;
	push @out, "\t\tosis: [\"$osis\"]\x0a\t\t";
	push @out, "apocrypha: true\x0a\t\t" if ($apocrypha);
	my $pre = '#{bcv_parser::regexps.pre_book}';
	if ($osis =~ /^[0-9]/ || join('|', @abbrevs) =~ /[0-9]/)
	{
		$pre = join '|', map { format_value('quote', $_)} @{$vars{'$PRE_BOOK_ALLOWED_CHARACTERS'}};
		$pre = '\b' if ($pre eq "\\\\d|\\\\b");
		$pre =~ s/\\+d\|?//;
		$pre =~ s/^\|+//;
		$pre =~ s/^\||\|\||\|$//; #remove leftover |
		$pre =~ s/^\[\^/[^0-9/; #if it's a negated class, add \d
	}
	my $post = join '|', @{$vars{'$POST_BOOK_ALLOWED_CHARACTERS'}};
	push @out, "regexp: ///(^|$pre)(\x0a\t\t";
	push @out, $book_regexp;
	$out[-1] =~ s/-(?!\?)/-?/g;
	push @out, "\x0a\t\t\t)(?:(?=$post)|\$)///gi";
	return join("", @out);
}

sub make_book_regexp
{
	my ($osis, $abbrevs, $recurse_level) = @_;
	#print "  Regexping $osis..\n";
	#return 'aaaa' unless ($osis eq 'Rom');
	map { s/\\//g; } @{$abbrevs};
	my @subsets = get_book_subsets($abbrevs);
	my @out;
	#print Dumper(\@subsets); exit;
	my $i = 1;
	foreach my $subset (@subsets)
	{
		#print "Sub $i\n";
		$i++;
		#print Dumper($subset);
		my $json = JSON->new->ascii(1)->encode($subset);
		#print "$json\n";
		my $base64 = encode_base64($json, "");
		print "$osis " . length($base64) . "\n";
		my $use_file = 0;
		if (length $base64 > 128_000) #Ubuntu limitation
		{
			$use_file = 1;
			open TEMP, '>./temp.txt';
			print TEMP $json;
			close TEMP;
			$base64 = '<';
		}
		my $regexp = `node ./make_regexps.js "$base64"`;
		#print Dumper($regexp) if ($osis eq 'Acts');
		unlink './temp.txt' if ($use_file);
		$regexp = decode_json($regexp);
		die "No regexp json object" unless (defined $regexp->{patterns});
		my @patterns;
		foreach my $pattern (@{$regexp->{patterns}})
		{
			$pattern = format_node_regexp_pattern($pattern);
			push @patterns, $pattern;
		}
		my $pattern = join('|', @patterns);
		$pattern = validate_node_regexp($osis, $pattern, $subset, $recurse_level);
		push @out, $pattern;
	}
	validate_full_node_regexp($osis, join('|', @out), $abbrevs);
	return join('|', @out);
}

sub validate_full_node_regexp
{
	my ($osis, $pattern, $abbrevs) = @_;
	foreach my $abbrev (@{$abbrevs})
	{
		my $compare = "$abbrev 1";
		$compare =~ s/^(?:$pattern) //;
		print Dumper("  Not parsable ($abbrev): $compare") unless ($compare eq '1');
	}
}

sub get_book_subsets
{
	my @abbrevs = @{$_[0]};
	return ([@abbrevs]) unless (scalar @abbrevs > 20);
	my @groups = ([]);
	my %subs;
	@abbrevs = sort { length $b <=> length $a } @abbrevs;
	while (@abbrevs)
	{
		my $long = shift @abbrevs;
		next if (exists $subs{$long});
		for my $i (0 .. $#abbrevs)
		{
			my $short = quotemeta $abbrevs[$i];
			next unless ($long =~ /(?:^|[\s\p{InPunctuation}\p{Punct}])$short(?:[\s\p{InPunctuation}\p{Punct}]|$)/i);
			$subs{$abbrevs[$i]}++;
		}
		push @{$groups[0]}, $long;
	}
	$groups[1] = [sort { length $b <=> length $a } keys %subs] if (%subs);
	return @groups;
}

sub consolidate_abbrevs
{
	my @out;
	my $merge_i = -1;
	while (@_)
	{
		my $ref = shift;
		if (scalar(keys(%{$ref})) == 2)
		{
			if ($merge_i == -1)
			{
				$merge_i = scalar @out;
				push @out, [keys %{$ref}];
			}
			else
			{
				foreach my $abbrev (keys %{$ref})
				{
					push @{$out[$merge_i]}, $abbrev;
				}
				$merge_i = -1 if (scalar @{$out[$merge_i]} > 6);
			}
		}
		else
		{
			push @out, [keys %{$ref}];
		}
	}
	return @out;
}

sub validate_node_regexp
{
	my ($osis, $pattern, $abbrevs, $recurse_level, $note) = @_;
	my ($oks, $not_oks) = check_regexp_pattern($osis, $pattern, $abbrevs);
	my @oks = @{$oks};
	my @not_oks = @{$not_oks};
	return $pattern unless (@not_oks);
	#print scalar(@not_oks) . " not oks\n";
	if ($recurse_level > 10)
	{
		print "Splitting $osis by length...\n";
		if ($note && $note eq 'lengths')
		{
			die "'Lengths' didn't work: $osis";
		}
		my %lengths = split_by_length(@{$abbrevs});
		my @patterns;
		foreach my $length (sort { $b <=> $a } keys %lengths)
		{
			push @patterns, make_book_regexp($osis, $lengths{$length}, 1);
		}
		return validate_node_regexp($osis, join('|', @patterns), $abbrevs, $recurse_level + 1, 'lengths');

	}
	print "  Recurse ($osis): $recurse_level\n";# if ($recurse_level > 3);
	#if ($note && $note eq 'final')
	#{
	#	print Dumper(\@oks);
	#	print Dumper(\@not_oks);
	#	exit;
	#}
	#print Dumper($abbrevs);
	#print Dumper(\@oks);
	#print Dumper(\@not_oks);
	my $ok_pattern = make_book_regexp($osis, \@oks, $recurse_level + 1);
	my $not_ok_pattern = make_book_regexp($osis, \@not_oks, $recurse_level + 1);
	#print "Nop: $not_ok_pattern\n";
	my ($shortest_ok) = sort { length $a <=> length $b } @oks;
	my ($shortest_not_ok) = sort { length $a <=> length $b } @not_oks;
	my $new_pattern = (length $shortest_ok > length $shortest_not_ok && $recurse_level < 10) ? "$ok_pattern|$not_ok_pattern" : "$not_ok_pattern|$ok_pattern";
	$new_pattern = validate_node_regexp($osis, $new_pattern, $abbrevs, $recurse_level + 1, 'final');
	#print Dumper($new_pattern);
	return $new_pattern;
}

sub split_by_length
{
	my %lengths;
	foreach my $abbrev (@_)
	{
		my $length = int(length($abbrev) / 2);
		push @{$lengths{$length}}, $abbrev;
	}
	return %lengths;
}

sub check_regexp_pattern
{
	my ($osis, $pattern, $abbrevs) = @_;
	my (@oks, @not_oks);
	foreach my $abbrev (@{$abbrevs})
	{
		my $compare = "$abbrev 1";
		$compare =~ s/^(?:$pattern)//i;
		if ($compare ne ' 1')
		{
			push @not_oks, $abbrev;
		}
		else
		{
			push @oks, $abbrev;
		}
	}
	#print Dumper(\@oks);
	#print Dumper($pattern);
	#print Dumper(\@not_oks);
	return (\@oks, \@not_oks);
}

sub format_node_regexp_pattern
{
	my ($pattern) = @_;
	die "Unexpected regexp pattern: $pattern" unless ($pattern =~ /^\/\^/ && $pattern =~ /\$\/$/);
	$pattern =~ s/^\/\^//;
	$pattern =~ s/\$\/$//;
	if ($pattern =~ /\[/)
	{
		my @parts = split /\[/, $pattern;
		my @out = (shift(@parts));
		while (@parts)
		{
			my $part = shift @parts;
			if ($out[-1] =~ /\\$/)
			{
				push @out, $part;
				next;
			}
			if ($part !~ /[\- ]/)
			{
				push @out, $part;
				next;
			}
			my $has_space = 0;
			my @chars = split //, $part;
			my @out_chars;
			while (@chars)
			{
				my $char = shift @chars;
				if ($char eq "\\")
				{
					push @out_chars, $char;
					push @out_chars, shift(@chars);
					next;
				}
				elsif ($char eq '-')
				{
					push @out_chars, "\\-";
				}
				elsif ($char eq ']')
				{
					push @out_chars, $char;
					push @out_chars, '*' if ($has_space && (!@chars || $chars[0] !~ /^[\*\+]/));
					push @out_chars, @chars;
					last;
				}
				elsif ($char eq ' ')
				{
					push @out_chars, "::OPTIONAL_SPACE::";
					$has_space = 1;
				}
				else
				{
					push @out_chars, $char;
				}
			}
			$part = join '', @out_chars;
			push @out, $part;
		}
		$pattern = join '[', @out;
	}
	$pattern =~ s/ /[\\s\\xa0]*/g;
	$pattern =~ s/::OPTIONAL_SPACE::/\\s\\xa0/g;
	return $pattern;
}

sub format_value
{
	my ($type, $value) = @_;
	$vars{'$TEMP_VALUE'} = [$value];
	return format_var($type, '$TEMP_VALUE');
}

sub format_var
{
	my ($type, $var_name) = @_;
	my @values = @{$vars{$var_name}};
	if ($type eq 'regexp' || $type eq 'quote')
	{
		map {
			s/\.$//;
			s/!(.+)$/(?!$1)/;
			s/\\/\\\\/g if ($type eq 'quote');
			s/"/\\"/g if ($type eq 'quote');
			} @values;
		my $out = join('|', @values);
		$out = handle_accents($out);
		$out =~ s/ +/#{bcv_parser::regexps.space}+/g;
		return (scalar @values > 1) ? '(?:' . $out . ')' : $out;
	}
	elsif ($type eq 'pegjs')
	{
		map {
			s/\./" abbrev? "/;
			s/([A-Z])/lc $1/ge;
			$_ = handle_accents($_);
			s/\[/" [/g;
			s/\]/\] "/g;
			$_ = "\"$_\"";
			s/\s*!\[/" ![/;
			s/\s*!([^\[])/" !"$1/;
			s/"{2,}//g;
			s/^\s+|\s+$//g;
			$_ .= ' ';
			my @out;
			my @parts = split /"/;
			my $is_outside_quote = 1;
			while (@parts)
			{
				my $part = shift @parts;
				if ($is_outside_quote == 0)
				{
					$part =~ s/^ /$out[-1] .= 'space '; ''/e;
					$part =~ s/ /" space "/g;
					$part =~ s!((?:^|")[^"]+?")( space )!
						my ($quote, $space) = ($1, $2);
						$quote .= 'i' if ($quote =~ /[\x80-\x{ffff}]/);
						"$quote$space";
						!ge;
					push @out, $part;
					$parts[0] = 'i' . $parts[0] if ($part =~ /[\x80-\x{ffff}]/);
					$is_outside_quote = 1;
				}
				else
				{
					push @out, $part;
					$is_outside_quote = 0;
				}
			}
			$_ = join '"', @out;
			s/\[([^\]]*?[\x80-\x{ffff}][^\]]*?)\]/[$1]i/g;
			s/!(space ".+)/!($1)/;
			s/\s+$//;
			$_ .= ' sp' if ($var_name eq '$TO')
			} @values;
		my $out = join(' / ', @values);
		if (($var_name eq '$TITLE' || $var_name eq '$FF') && scalar @values > 1)
		{
			$out = "( $out )";
		}
		return $out;
	}
	else
	{
		die "Unknown var type: $type / $var_name";
	}
}

sub make_tests
{
	my @out;
	my @osises = @order;
	my %all_abbrevs;
	foreach my $osis (sort keys %abbrevs)
	{
		next unless ($osis =~ /,/);
		push @osises, {osis => $osis, apocrypha => 0};
	}
	foreach my $ref (@osises)
	{
		my $osis = $ref->{osis};
		my @tests;
		my ($first) = split /,/, $osis;
		my $match = "$first\.1\.1";
		foreach my $abbrev (sort_abbrevs_by_length(keys %{$abbrevs{$osis}}))
		{
			foreach my $expanded (expand_abbrev_vars($abbrev))
			{
				add_abbrev_to_all_abbrevs($osis, $expanded, \%all_abbrevs);
				push @tests, "\t\texpect(p.parse(\"$expanded 1:1\").osis()).toEqual(\"$match\")";
			}
			foreach my $alt_osis (@osises)
			{
				next if ($osis eq $alt_osis);
				foreach my $alt_abbrev (keys %{$abbrevs{$alt_osis}})
				{
					next unless (length $alt_abbrev >= length $abbrev);
					my $q_abbrev = quotemeta $abbrev;
					if ($alt_abbrev =~ /\b$q_abbrev\b/)
					{
						foreach my $check (@osises)
						{
							last if ($alt_osis eq $check); # if $alt_osis comes first, that's what we want
							next unless ($osis eq $check); # we only care about $osis
							print Dumper("$alt_osis should be before $osis in parsing order\n  $alt_abbrev matches $abbrev");
						}
					}
				}
			}
		}
		push @out, "describe \"Localized book $osis ($lang)\", ->";
		push @out, "\tp = {}";
		push @out, "\tbeforeEach ->";
		push @out, "\t\tp = new bcv_parser";
		push @out, "\t\tp.set_options book_alone_strategy: \"ignore\",book_sequence_strategy: \"ignore\",osis_compaction_strategy: \"bc\",captive_end_digits_strategy: \"delete\"";
		push @out, "\t\tp.include_apocrypha true";
		push @out, "\tit \"should handle book: $osis ($lang)\", ->";
		# Drop into js rather than coffeescript to minimize compile times on the coffee side.
		push @out, "\t\t`";
		push @out, @tests;
		push @out, add_non_latin_digit_tests($osis, @tests);

		# Don't check for an empty string because books like EpJer will lead to Jer in language-specific ways.
		if ($valid_osises{$first} ne 'apocrypha')
		{
			push @out, "		p.include_apocrypha(false)";
			foreach my $abbrev (sort_abbrevs_by_length(keys %{$abbrevs{$osis}}))
			{
				foreach my $expanded (expand_abbrev_vars($abbrev))
				{
					$expanded = uc_normalize($expanded);
					push @out, "\t\texpect(p.parse(\"$expanded 1:1\").osis()).toEqual(\"$match\")";
				}
			}
		}
		push @out, "\t\t`";
		# In keeping with coffeescript, always return something (which, since we just exited a js block, won't otherwise happen).
		push @out, "\t\ttrue";
	}
	open OUT, '>:utf8', "$dir/$lang/book_names.txt";
	foreach my $osis (sort keys %all_abbrevs)
	{
		my @osis_abbrevs = sort_abbrevs_by_length(keys %{$all_abbrevs{$osis}});
		my $use_osis = $osis;
		$use_osis =~ s/,+$//;
		foreach my $abbrev (@osis_abbrevs)
		{
			print OUT "$use_osis\t$abbrev\n";
		}
		$all_abbrevs{$osis} = \@osis_abbrevs;
	}
	close OUT;
	my @misc_tests;
	push @misc_tests, add_range_tests();
	push @misc_tests, add_chapter_tests();
	push @misc_tests, add_verse_tests();
	push @misc_tests, add_sequence_tests();
	push @misc_tests, add_title_tests();
	push @misc_tests, add_ff_tests();
	push @misc_tests, add_trans_tests();
	push @misc_tests, add_book_range_tests();
	push @misc_tests, add_boundary_tests();
	my $out = get_file_contents("$dir/template/spec.coffee");
	$out =~ s/\$LANG/$lang/g;
	$out =~ s/\$BOOK_TESTS/join("\x0a", @out)/e;
	$out =~ s/\$MISC_TESTS/join("\x0a", @misc_tests)/e;
	open OUT, ">:utf8", "$dir/$lang/spec.coffee";
	print OUT $out;
	close OUT;
	if ($out =~ /(\$[A-Z]+)/)
	{
		die "$1\nTests: Capital variable";
	}

	$out = get_file_contents("$dir/template/SpecRunner.html");
	$out =~ s/\$LANG/$lang/g;
	open OUT, ">:utf8", "$test_dir/$lang.html";
	print OUT $out;
	close OUT;
	if ($out =~ /(\$[A-Z])/)
	{
		die "$1\nTests: Capital variable";
	}
	return %all_abbrevs;
}

sub sort_abbrevs_by_length
{
	my (%lengths, @out);
	foreach my $abbrev (@_)
	{
		my $length = length $abbrev;
		push @{$lengths{$length}}, $abbrev;
	}
	foreach my $length (sort { $b <=> $a } keys %lengths)
	{
		my @abbrevs = sort @{$lengths{$length}};
		push @out, @abbrevs;
	}
	return @out;
}

sub add_abbrev_to_all_abbrevs
{
	my ($osis, $abbrev, $all_abbrevs) = @_;
	if ($abbrev =~ /\./)
	{
		my @news = split /\./, $abbrev;
		my @olds = (shift(@news));
		foreach my $new (@news)
		{
			my @temp;
			foreach my $old (@olds)
			{
				push @temp, "$old.$new";
				push @temp, "$old$new";
			}
			@olds = @temp;
		}
		foreach my $abbrev (@olds)
		{
			$all_abbrevs->{$osis}->{$abbrev} = 1;
		}
	}
	else
	{
		$all_abbrevs->{$osis}->{$abbrev} = 1;
	}
}

sub add_non_latin_digit_tests
{
	my $osis = shift;
	my @out;
	my $temp = join "\n", @_;
	return @out unless ($temp =~ /[\x{0660}-\x{0669}\x{06f0}-\x{06f9}\x{07c0}-\x{07c9}\x{0966}-\x{096f}\x{09e6}-\x{09ef}\x{0a66}-\x{0a6f}\x{0ae6}-\x{0aef}\x{0b66}-\x{0b6f}\x{0be6}-\x{0bef}\x{0c66}-\x{0c6f}\x{0ce6}-\x{0cef}\x{0d66}-\x{0d6f}\x{0e50}-\x{0e59}\x{0ed0}-\x{0ed9}\x{0f20}-\x{0f29}\x{1040}-\x{1049}\x{1090}-\x{1099}\x{17e0}-\x{17e9}\x{1810}-\x{1819}\x{1946}-\x{194f}\x{19d0}-\x{19d9}\x{1a80}-\x{1a89}\x{1a90}-\x{1a99}\x{1b50}-\x{1b59}\x{1bb0}-\x{1bb9}\x{1c40}-\x{1c49}\x{1c50}-\x{1c59}\x{a620}-\x{a629}\x{a8d0}-\x{a8d9}\x{a900}-\x{a909}\x{a9d0}-\x{a9d9}\x{aa50}-\x{aa59}\x{abf0}-\x{abf9}\x{ff10}-\x{ff19}]/);
	push @out, "\t\t`";
	push @out, "\t\ttrue";
	push @out, "	it \"should handle non-Latin digits in book: $osis ($lang)\", ->";
	push @out, "		p.set_options non_latin_digits_strategy: \"replace\"";
	push @out, "\t\t`";
	return (@out, @_);
}

sub add_range_tests
{
	my @out;
	push @out, "	it \"should handle ranges ($lang)\", ->";
	foreach my $abbrev (@{$vars{'$TO'}})
	{
		foreach my $to (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			push @out, "		expect(p.parse(\"Titus 1:1 $to 2\").osis()).toEqual \"Titus.1.1-Titus.1.2\"";
			push @out, "		expect(p.parse(\"Matt 1${to}2\").osis()).toEqual \"Matt.1-Matt.2\"";
			push @out, "		expect(p.parse(\"Phlm 2 " . uc_normalize($to) . " 3\").osis()).toEqual \"Phlm.1.2-Phlm.1.3\"";
		}
	}
	return @out;
}

sub add_chapter_tests
{
	my @out;
	push @out, "	it \"should handle chapters ($lang)\", ->";
	foreach my $abbrev (@{$vars{'$CHAPTER'}})
	{
		foreach my $chapter (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			push @out, "		expect(p.parse(\"Titus 1:1, $chapter 2\").osis()).toEqual \"Titus.1.1,Titus.2\"";
			push @out, "		expect(p.parse(\"Matt 3:4 " . uc_normalize($chapter) . " 6\").osis()).toEqual \"Matt.3.4,Matt.6\"";
		}
	}
	return @out;
}

sub add_verse_tests
{
	my @out;
	push @out, "	it \"should handle verses ($lang)\", ->";
	foreach my $abbrev (@{$vars{'$VERSE'}})
	{
		foreach my $verse (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			push @out, "		expect(p.parse(\"Exod 1:1 $verse 3\").osis()).toEqual \"Exod.1.1,Exod.1.3\"";
			push @out, "		expect(p.parse(\"Phlm " . uc_normalize($verse) . " 6\").osis()).toEqual \"Phlm.1.6\"";
		}
	}
	return @out;
}

sub add_sequence_tests
{
	my @out;
	push @out, "	it \"should handle 'and' ($lang)\", ->";
	foreach my $abbrev (@{$vars{'$AND'}})
	{
		foreach my $and (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			push @out, "		expect(p.parse(\"Exod 1:1 $and 3\").osis()).toEqual \"Exod.1.1,Exod.1.3\"";
			push @out, "		expect(p.parse(\"Phlm 2 " . uc_normalize($and) . " 6\").osis()).toEqual \"Phlm.1.2,Phlm.1.6\"";
		}
	}
	return @out;
}

sub add_title_tests
{
	my @out;
	push @out, "	it \"should handle titles ($lang)\", ->";
	foreach my $abbrev (@{$vars{'$TITLE'}})
	{
		foreach my $title (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			push @out, "		expect(p.parse(\"Ps 3 $title, 4:2, 5:$title\").osis()).toEqual \"Ps.3.1,Ps.4.2,Ps.5.1\"";
			push @out, "		expect(p.parse(\"" . uc_normalize("Ps 3 $title, 4:2, 5:$title") . "\").osis()).toEqual \"Ps.3.1,Ps.4.2,Ps.5.1\"";
		}
	}
	return @out;
}

sub add_ff_tests
{
	my @out;
	push @out, "	it \"should handle 'ff' ($lang)\", ->";
	push @out, "\t\tp.set_options {case_sensitive: \"books\"}" if ($lang eq 'it');
	foreach my $abbrev (@{$vars{'$FF'}})
	{
		foreach my $ff (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			push @out, "		expect(p.parse(\"Rev 3$ff, 4:2$ff\").osis()).toEqual \"Rev.3-Rev.22,Rev.4.2-Rev.4.11\"";
			push @out, "		expect(p.parse(\"" . uc_normalize("Rev 3 $ff, 4:2 $ff") . "\").osis()).toEqual \"Rev.3-Rev.22,Rev.4.2-Rev.4.11\"" unless ($lang eq 'it');
		}
	}
	push @out, "\t\tp.set_options {case_sensitive: \"none\"}" if ($lang eq 'it');
	return @out;
}

sub add_trans_tests
{
	my @out;
	push @out, "	it \"should handle translations ($lang)\", ->";
	foreach my $abbrev (@{$vars{'$TRANS'}})
	{
		foreach my $translation (expand_abbrev(remove_exclamations(handle_accents($abbrev))))
		{
			my ($trans, $osis) = split /,/, $translation;
			$osis = $trans unless ($osis);
			push @out, "		expect(p.parse(\"Lev 1 ($trans)\").osis_and_translations()).toEqual [[\"Lev.1\", \"$osis\"]]";
			push @out, "		expect(p.parse(\"" . lc("Lev 1 $trans") . "\").osis_and_translations()).toEqual [[\"Lev.1\", \"$osis\"]]";
		}
	}
	return @out;
}

sub add_book_range_tests
{
	my ($first) = expand_abbrev(handle_accents($vars{'$FIRST'}->[0]));
	my ($third) = expand_abbrev(handle_accents($vars{'$THIRD'}->[0]));
	#my ($and) = sort { length $b <=> length $a } keys %{$vars{'$AND'}};
	#my ($to) = sort { length $b <=> length $a } keys %{$vars{'$TO'}};
	my $john = '';
	foreach my $key (%{$raw_abbrevs{'1John'}})
	{
		next unless ($key =~ /^\$FIRST/);
		$key =~ s/^\$FIRST(?!\w)//;
		$john = $key;
		last;
	}
	unless ($john)
	{
		print "Warning: no available John abbreviation for testing book ranges\n";
		return;
	}
	my @out;
	my @johns = expand_abbrev(handle_accents($john));
	push @out, "	it \"should handle book ranges ($lang)\", ->";
	push @out, "		p.set_options {book_alone_strategy: \"full\", book_range_strategy: \"include\"}";
	my %alreadys;
	foreach my $abbrev (@johns)
	{
		foreach my $to_regex (@{$vars{'$TO'}})
		{
			foreach my $to (expand_abbrev(remove_exclamations(handle_accents($to_regex))))
			{
				next if (exists $alreadys{"$first $to $third $abbrev"});
				push @out, "		expect(p.parse(\"$first $to $third $abbrev\").osis()).toEqual \"1John.1-3John.1\"";
				$alreadys{"$first $to $third $abbrev"} = 1;
			}
		}
	}
	return @out;
}

sub add_boundary_tests
{
	my @out;
	push @out, "\tit \"should handle boundaries ($lang)\", ->";
	push @out, "		p.set_options {book_alone_strategy: \"full\"}";
	push @out, "		expect(p.parse(\"\\u2014Matt\\u2014\").osis()).toEqual \"Matt.1-Matt.28\"";
	push @out, "		expect(p.parse(\"\\u201cMatt 1:1\\u201d\").osis()).toEqual \"Matt.1.1\"";
	return @out;
}

sub get_abbrevs
{
	my %out;
	open CORRECTIONS, ">:utf8", "temp.corrections.txt";
	my $has_corrections = 0;
	open FILE, "<:utf8", "$dir/$lang/data.txt";
	while (<FILE>)
	{
		print "Tab followed by space: $_\n" if (/\t\s/ && /^[^\*]/);
		print "Space followed by tab/newline: $_\n" if (/\ [\t\n]/);
		next unless (/^[\w\*]/);
		print "Regex character in preferred: $_\n" if (/^\*/ && /[\[\?!]/);
		next unless (/\t/);
		chomp;
		my $prev = $_;
		$_ = NFC(NFD($_));
		if ($_ ne $prev)
		{
			print "Non-normalized text\n";
			$has_corrections = 1;
			print CORRECTIONS "$_\n";
		}
		my $is_literal = (/^\*/) ? 1 : 0;
		s/([\x80-\x{ffff}])/$1`/g if ($is_literal);
		my ($osis, @abbrevs) = split /\t/;
		$osis =~ s/^\*//;
		is_valid_osis($osis);
		$out{$osis}->{$osis} = 1 unless ($osis =~ /,/ || (exists $vars{'$FORCE_OSIS_ABBREV'} && $vars{'$FORCE_OSIS_ABBREV'}->[0] eq 'false'));
		foreach my $abbrev (@abbrevs)
		{
			next unless (length $abbrev);
			unless ($is_literal)
			{
				$abbrev = $vars{'$PRE_BOOK'}->[0] . $abbrev if (exists $vars{'$PRE_BOOK'});
				$abbrev .= $vars{'$POST_BOOK'}->[0] if (exists $vars{'$POST_BOOK'});
				$raw_abbrevs{$osis}->{$abbrev} = 1;
			}
			$abbrev = handle_accents($abbrev);
			my @alts = expand_abbrev_vars($abbrev);
			if (Dumper(\@alts) =~ /.\$/)
			{
				die "Alts:" . Dumper(\@alts);
			}
			foreach my $alt (@alts)
			{
				if ($alt =~ /[\[\?]/)
				{
					#print Dumper("$osis / $abbrev");
					foreach my $expanded (expand_abbrev($alt))
					{
						$out{$osis}->{$expanded} = 1;
					}
				}
				else
				{
					#print " $osis abbrev already exists: " . Dumper($abbrev) if (exists $out{$osis}->{$abbrev} && !$is_literal && $abbrev ne $osis && $abbrev !~ /\$/);
					$out{$osis}->{$alt} = 1;
				}
			}
		}
	}
	close FILE;
	close CORRECTIONS;
	unlink "temp.corrections.txt" unless ($has_corrections);
	return %out;
}

sub expand_abbrev_vars
{
	my ($abbrev) = @_;
	$abbrev =~ s/\\(?![\(\)\[\]\|])//g;
	return ($abbrev) unless ($abbrev =~ /\$[A-Z]+/);
	my ($var) = $abbrev =~ /(\$[A-Z]+)(?!\w)/;
	my @out;
	my $recurse = 0;
	foreach my $value (@{$vars{$var}})
	{
		foreach my $val (expand_abbrev($value))
		{
			$val = handle_accents($val);
			my $temp = $abbrev;
			$temp =~ s/\$[A-Z]+(?!\w)/$val/;
			$recurse = 1 if ($temp =~ /\$/);
			push @out, $temp;
			if ($var =~ /^\$(?:FIRST|SECOND|THIRD|FOURTH|FIFTH)$/ && $val =~ /^\d|^[IV]+$/)
			{
				my $temp2 = $abbrev;
				my $safe = quotemeta $var;
				$temp2 =~ s/$safe([^.]|$)/$val.$1/;
				push @out, $temp2;
			}
		}
	}
	if ($recurse)
	{
		my @temps;
		foreach my $abbrev (@out)
		{
			my @adds = expand_abbrev_vars($abbrev);
			push @temps, @adds;
		}
		@out = @temps;
	}
	return @out;
}

sub get_order
{
	my @out;
	open FILE, '<:utf8', "$dir/$lang/data.txt";
	while (<FILE>)
	{
		next unless (/^=/);
		chomp;
		$_ = NFC(NFD($_));
		s/^=//;
		is_valid_osis($_);
		my $apocrypha = ($valid_osises{$_} eq 'apocrypha') ? 1 : 0;
		push @out, {osis => $_, apocrypha => $apocrypha};
		$abbrevs{$_}->{$_} = 1;
		$raw_abbrevs{$_}->{$_} = 1;
	}
	close FILE;
	return @out;
}

sub get_vars
{
	my %out;
	open FILE, '<:utf8', "$dir/$lang/data.txt";
	while (<FILE>)
	{
		next unless (/^\$/);
		chomp;
		$_ = NFC(NFD($_));
		my ($key, @values) = split /\t/;
		die "No values for $key" unless (@values);
		$out{$key} = [@values];
	}
	close FILE;
	
	foreach my $char (@{$out{'$ALLOWED_CHARACTERS'}})
	{
		my $check = quotemeta $char;
		$valid_characters =~ s/\]$/$char]/ unless ($valid_characters =~ /$check/);
	}
	$letters = get_pre_book_characters($out{'$UNICODE_BLOCK'}, '');
	$out{'$PRE_BOOK_ALLOWED_CHARACTERS'} = [$letters] unless (exists $out{'$PRE_BOOK_ALLOWED_CHARACTERS'});
	$out{'$POST_BOOK_ALLOWED_CHARACTERS'} = [$valid_characters] unless (exists $out{'$POST_BOOK_ALLOWED_CHARACTERS'});
	$out{'$PRE_PASSAGE_ALLOWED_CHARACTERS'} = [get_pre_passage_characters($out{'$PRE_BOOK_ALLOWED_CHARACTERS'})] unless (exists $out{'$PRE_PASSAGE_ALLOWED_CHARACTERS'});
	return %out;
}

sub get_pre_passage_characters
{
	my $pattern = join '|', @{$_[0]};
	if ($pattern =~ /^\[\^[^\]]+?\]$/)
	{
		$pattern =~ s/`//g;
		$pattern =~ s/\\x1[ef]|0-9|\\d|A-Z|a-z//g;
		$pattern =~ s/\[\^/[^\\x1f\\x1e\\dA-Za-z/;
	}
	elsif ($pattern eq '\d|\b')
	{
		$pattern = '[^\w\x1f\x1e]';
	}
	else
	{
		die "Unknown pre_passage pattern: $pattern";
	}
	return $pattern;
}

sub get_pre_book_characters
{
	my ($unicodes_ref) = @_;
	die "No \$UNICODE_BLOCK is set" unless (ref $unicodes_ref);
	my @blocks = get_unicode_blocks($unicodes_ref);
	my @letters = get_letters(@blocks);
	my @out;
	foreach my $ref (@letters)
	{
		my ($start, $end) = @{$ref};
		push @out, ($end eq $start) ? "$start" : 
		"$start-$end";
	}
	my $out = join '', @out;
	$out =~ s/([\x80-\x{ffff}])/$1`/g;
	return "[^$out]";
}

sub get_letters
{
	my %out;
	open FILE, 'letters/letters.txt';
	while (<FILE>)
	{
		next unless (/^\\u/);
		chomp;
		s/\\u//g;
		s/\s*#.+$//;
		s/\s+//g;
		my ($start, $end) = split /-/;
		$end = $start unless ($end);
		($start, $end) = (hex($start), hex($end));
		foreach my $ref (@_)
		{
			my ($start_range, $end_range) = @{$ref};
			if ($end >= $start_range && $start <= $end_range)
			{
				for my $i ($start..$end)
				{
					next unless ($i >= $start_range && $i <= $end_range);
					$out{"$i"} = 1;
				}
			}
		}
	}
	close FILE;
	my $prev = -2;
	my @out;
	foreach my $pos (sort { $a <=> $b } keys %out)
	{
		if ($pos == $prev + 1)
		{
			$out[-1]->[1] = chr $pos;
		}
		else
		{
			push @out, [chr $pos, chr $pos];
		}
		$prev = $pos;
	}
	return @out;
}

sub get_unicode_blocks
{
	my ($unicodes_ref) = @_;
	my $unicode = join '|', @{$unicodes_ref};
	$unicode .= '|Basic_Latin' unless ($unicode =~ /Basic_Latin/);
	my @out;
	open FILE, 'letters/blocks.txt';
	while (<FILE>)
	{
		next unless (/^\w/);
		chomp;
		my ($block, $range) = split /\t/;
		next unless ($block =~ /$unicode/);
		$range =~ s/\\u//g;
		my ($start, $end) = split /-/, $range;
		push @out, [hex $start, hex $end];
	}
	close FILE;
	return @out;
}

sub expand_abbrev
{
	my ($abbrev) = @_;
	return ($abbrev) unless ($abbrev =~ /[\[\(?\|\\]/);
	$abbrev =~ s/(<!\\)\./\\./g;
	my @chars = split //, $abbrev;
	my @outs = ('');
	while (@chars)
	{
		my $char = shift @chars;
		my $is_optional = 0;
		my @nexts;
		if ($char eq '[')
		{
			my @nexts;
			while (@chars)
			{
				my $next = shift @chars;
				if ($next eq ']')
				{
					last;
				}
				else
				{
					push @nexts, $next unless ($next eq '\\');
				}
			}
			($is_optional, @chars) = is_next_char_optional(@chars);
			push @nexts, '' if ($is_optional);
			my @temps;
			foreach my $out (@outs)
			{
				my %alreadys;
				foreach my $next (@nexts)
				{
					next if (exists $alreadys{$next});
					push @temps, "$out$next";
					$alreadys{$next} = 1;
				}
			}
			@outs = @temps;
		}
		elsif ($char eq '(')
		{
			my @nexts;
			while (@chars)
			{
				my $next = shift @chars;
				if (!@nexts && $next eq '?' && $chars[0] eq ':')
				{
					die "'(?:' in parentheses; replace with just '('";
					shift @chars;
					next;
				}
				if ($next eq ')')
				{
					last;
				}
				elsif ($next eq '\\')
				{
					push @nexts, $next;
					push @nexts, shift(@chars);
				}
				else
				{
					push @nexts, $next;
				}
			}
			@nexts = expand_abbrev(join('', @nexts));
			($is_optional, @chars) = is_next_char_optional(@chars);
			push @nexts, '' if ($is_optional);
			my @temps;
			foreach my $out (@outs)
			{
				foreach my $next (@nexts)
				{
					push @temps, "$out$next";
				}
			}
			@outs = @temps;
		}
		elsif ($char eq '|')
		{
			push @outs, expand_abbrev(join('', @chars));
			print Dumper(\@outs);
			return @outs;
		}
		else
		{
			my @temps;
			# Just use the next character
			if ($char eq '\\')
			{
				$char = shift(@chars);
			}
			($is_optional, @chars) = is_next_char_optional(@chars);
			foreach my $out (@outs)
			{
				push @temps, "$out$char";
				push @temps, $out if ($is_optional);
			}
			@outs = @temps;
		}
	}
	if (join('', @outs) =~ /[\[\]]/)
	{
		print "Unexpected char: ";
		print Dumper(\@outs);
		exit;
	}
	return @outs;
}

sub is_next_char_optional
{
	my @chars = @_;
	return (0, @chars) unless (@chars);
	my $is_optional = 0;
	if ($chars[0] eq '?')
	{
		shift @chars;
		$is_optional = 1;
	}
	return ($is_optional, @chars);
}

sub handle_accents
{
	my ($text) = @_;
	$text =~ s/([\x80-\x{ffff}])(?!`)/handle_accent($1)/ge;
	$text =~ s/'/[\x{2019}']/g;
	$text =~ s/\x{2c8}(?!`)/[\x{2c8}']/g unless (exists $vars{'$COLLAPSE_COMBINING_CHARACTERS'} && $vars{'$COLLAPSE_COMBINING_CHARACTERS'}->[0] eq 'false');
	$text =~ s/([\x80-\x{ffff}])`/$1/g;
	$text =~ s/[\x{2b9}\x{374}]/['\x{2019}\x{384}\x{374}\x{2b9}]/g;
	$text =~ s/([\x{300}\x{370}]-)\['\x{2019}\x{384}\x{374}\x{2b9}\](\x{376})/$1\x{374}$2/;
	#$text =~ s/\.$//;
	$text =~ s/\./\\.?/g;
	return $text;
}

sub remove_exclamations
{
	my ($text) = @_;
	($text) = split /!/, $text if ($text =~ /!/);
	return $text;
}

sub handle_accent
{
	my ($char) = @_;
	my $alt = NFD($char);
	$alt =~ s/\pM//g unless (exists $vars{'$COLLAPSE_COMBINING_CHARACTERS'} && $vars{'$COLLAPSE_COMBINING_CHARACTERS'}->[0] eq 'false'); # remove combining characters
	$alt = NFC($alt);
	if ($char ne $alt && length $alt > 0 && $alt =~ /[^\s\d]/)
	{
		return "[$char$alt]";
	}
	$char =~ s/[\x{0660}\x{06f0}\x{07c0}\x{0966}\x{09e6}\x{0a66}\x{0ae6}\x{0b66}\x{0be6}\x{0c66}\x{0ce6}\x{0d66}\x{0e50}\x{0ed0}\x{0f20}\x{1040}\x{1090}\x{17e0}\x{1810}\x{1946}\x{19d0}\x{1a80}\x{1a90}\x{1b50}\x{1bb0}\x{1c40}\x{1c50}\x{a620}\x{a8d0}\x{a900}\x{a9d0}\x{aa50}\x{abf0}\x{ff10}]/[${char}0]/g;
	$char =~ s/[\x{0661}\x{06f1}\x{07c1}\x{0967}\x{09e7}\x{0a67}\x{0ae7}\x{0b67}\x{0be7}\x{0c67}\x{0ce7}\x{0d67}\x{0e51}\x{0ed1}\x{0f21}\x{1041}\x{1091}\x{17e1}\x{1811}\x{1947}\x{19d1}\x{1a81}\x{1a91}\x{1b51}\x{1bb1}\x{1c41}\x{1c51}\x{a621}\x{a8d1}\x{a901}\x{a9d1}\x{aa51}\x{abf1}\x{ff11}]/[${char}1]/g;
	$char =~ s/[\x{0662}\x{06f2}\x{07c2}\x{0968}\x{09e8}\x{0a68}\x{0ae8}\x{0b68}\x{0be8}\x{0c68}\x{0ce8}\x{0d68}\x{0e52}\x{0ed2}\x{0f22}\x{1042}\x{1092}\x{17e2}\x{1812}\x{1948}\x{19d2}\x{1a82}\x{1a92}\x{1b52}\x{1bb2}\x{1c42}\x{1c52}\x{a622}\x{a8d2}\x{a902}\x{a9d2}\x{aa52}\x{abf2}\x{ff12}]/[${char}2]/g;
	$char =~ s/[\x{0663}\x{06f3}\x{07c3}\x{0969}\x{09e9}\x{0a69}\x{0ae9}\x{0b69}\x{0be9}\x{0c69}\x{0ce9}\x{0d69}\x{0e53}\x{0ed3}\x{0f23}\x{1043}\x{1093}\x{17e3}\x{1813}\x{1949}\x{19d3}\x{1a83}\x{1a93}\x{1b53}\x{1bb3}\x{1c43}\x{1c53}\x{a623}\x{a8d3}\x{a903}\x{a9d3}\x{aa53}\x{abf3}\x{ff13}]/[${char}3]/g;
	$char =~ s/[\x{0664}\x{06f4}\x{07c4}\x{096a}\x{09ea}\x{0a6a}\x{0aea}\x{0b6a}\x{0bea}\x{0c6a}\x{0cea}\x{0d6a}\x{0e54}\x{0ed4}\x{0f24}\x{1044}\x{1094}\x{17e4}\x{1814}\x{194a}\x{19d4}\x{1a84}\x{1a94}\x{1b54}\x{1bb4}\x{1c44}\x{1c54}\x{a624}\x{a8d4}\x{a904}\x{a9d4}\x{aa54}\x{abf4}\x{ff14}]/[${char}4]/g;
	$char =~ s/[\x{0665}\x{06f5}\x{07c5}\x{096b}\x{09eb}\x{0a6b}\x{0aeb}\x{0b6b}\x{0beb}\x{0c6b}\x{0ceb}\x{0d6b}\x{0e55}\x{0ed5}\x{0f25}\x{1045}\x{1095}\x{17e5}\x{1815}\x{194b}\x{19d5}\x{1a85}\x{1a95}\x{1b55}\x{1bb5}\x{1c45}\x{1c55}\x{a625}\x{a8d5}\x{a905}\x{a9d5}\x{aa55}\x{abf5}\x{ff15}]/[${char}5]/g;
	$char =~ s/[\x{0666}\x{06f6}\x{07c6}\x{096c}\x{09ec}\x{0a6c}\x{0aec}\x{0b6c}\x{0bec}\x{0c6c}\x{0cec}\x{0d6c}\x{0e56}\x{0ed6}\x{0f26}\x{1046}\x{1096}\x{17e6}\x{1816}\x{194c}\x{19d6}\x{1a86}\x{1a96}\x{1b56}\x{1bb6}\x{1c46}\x{1c56}\x{a626}\x{a8d6}\x{a906}\x{a9d6}\x{aa56}\x{abf6}\x{ff16}]/[${char}6]/g;
	$char =~ s/[\x{0667}\x{06f7}\x{07c7}\x{096d}\x{09ed}\x{0a6d}\x{0aed}\x{0b6d}\x{0bed}\x{0c6d}\x{0ced}\x{0d6d}\x{0e57}\x{0ed7}\x{0f27}\x{1047}\x{1097}\x{17e7}\x{1817}\x{194d}\x{19d7}\x{1a87}\x{1a97}\x{1b57}\x{1bb7}\x{1c47}\x{1c57}\x{a627}\x{a8d7}\x{a907}\x{a9d7}\x{aa57}\x{abf7}\x{ff17}]/[${char}7]/g;
	$char =~ s/[\x{0668}\x{06f8}\x{07c8}\x{096e}\x{09ee}\x{0a6e}\x{0aee}\x{0b6e}\x{0bee}\x{0c6e}\x{0cee}\x{0d6e}\x{0e58}\x{0ed8}\x{0f28}\x{1048}\x{1098}\x{17e8}\x{1818}\x{194e}\x{19d8}\x{1a88}\x{1a98}\x{1b58}\x{1bb8}\x{1c48}\x{1c58}\x{a628}\x{a8d8}\x{a908}\x{a9d8}\x{aa58}\x{abf8}\x{ff18}]/[${char}8]/g;
	$char =~ s/[\x{0669}\x{06f9}\x{07c9}\x{096f}\x{09ef}\x{0a6f}\x{0aef}\x{0b6f}\x{0bef}\x{0c6f}\x{0cef}\x{0d6f}\x{0e59}\x{0ed9}\x{0f29}\x{1049}\x{1099}\x{17e9}\x{1819}\x{194f}\x{19d9}\x{1a89}\x{1a99}\x{1b59}\x{1bb9}\x{1c49}\x{1c59}\x{a629}\x{a8d9}\x{a909}\x{a9d9}\x{aa59}\x{abf9}\x{ff19}]/[${char}9]/g;
	return $char;
}

sub is_valid_osis
{
	my ($osis) = @_;
	foreach my $part (split /,/, $osis)
	{
		die "Invalid OSIS: $osis ($part)" unless (exists $valid_osises{$part});
	}
}

sub make_valid_osises
{
	my %out;
	my $type = 'ot_nt';
	foreach my $osis (@_)
	{
		$type = 'apocrypha' if ($osis eq 'Tob');
		$out{$osis} = $type;
	}
	return %out;
}

sub uc_normalize
{
	my ($text) = @_;
	return NFC(uc(NFD($text)));
}

sub get_file_contents
{
	open FILE, "<:utf8", $_[0] or die "Couldn't open $_[0]: $!";
	my $out = join '', <FILE>;
	close FILE;
	return $out;
}
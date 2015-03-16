use strict;
use warnings;
use Unicode::Normalize;
use Data::Dumper;

my $src_dir = '../src';
my %ranges = (
	full => {
		chars => '.',
		data => 'en',
		order => [qw(Gen Exod Bel Phlm Lev 2Thess 1Thess 2Kgs 1Kgs EpJer Lam Num Sus Sir PrMan Acts Rev PrAzar SgThree 2Pet 1Pet Rom Song Prov Wis Joel Jonah Nah 1John 2John 3John John Josh Judg 1Esd 2Esd Isa 2Sam 1Sam 2Chr 1Chr Ezra Ruth Neh GkEsth Esth Job Mal Matt Ps Eccl Ezek Hos Obad Hag Hab Mic Zech Zeph Luke Jer 2Cor 1Cor Gal Eph Col 2Tim 1Tim Deut Titus Heb Phil Dan Jude 2Macc 3Macc 4Macc 1Macc Mark Jas Amos Tob Jdt Bar)],
		exclude_langs => [qw(amf awa bba bqc bus chr dop dug fue fuh hil hwc leb mkl mqb mvc mwv nds pck ppl qu soy tmz twi udu wa wol yom zap)],
		exclude_abbrevs => [
			'1 K', '1. K', '1.K', '1K', 'I. K', 'I.K', 'IK',
			'2 K', '2. K', '2.K', '2K', 'II. K', 'II.K', 'IIK',
			'Ri', #Judg
			'Ca', 'En', 'Pi bel Chante a', #Song
			'Ai', #Lam
			'Ad', #Obad
			'J', 'Iv', 'In', #John
			'Nas', #Acts
			],
		post_abbrevs => {
			Lev => ["\x{5229}"],
			Josh => ["\x{66f8}"],
			'1Kgs' => ['1 Ks', '1. Ks', 'I Ks', 'I. Ks', '1 Re', '1. Re'],
			'2Kgs' => ['2 Ks', '2. Ks', 'II Ks', 'II. Ks', '2 Re', '2. Re'],
			Ezra => ["\x{62c9}"],
			Job => ["\x{4f2f}"],
			Song => ['Songs', "\x{6b4c}"],
			Lam => ['La'],
			Mic => ['Mi'],
			Matt => ["\x{592a}"],
			John => ['Jan', "\x{7d04}"],
			Acts => ["\x{410}\x{43F}\x{43E}\x{441}\x{442}\x{43E}\x{43B}"],
			Rev => ['Re'],
			},
		include_extra_abbrevs => 0,
		},
	ascii => {
		chars => "[\x00-\x7f\x{2000}-\x{206F}]",
		data => 'en',
		order => [qw(Gen Exod Bel Phlm Lev 2Thess 1Thess 2Kgs 1Kgs EpJer Lam Num Sus Sir PrMan Acts Rev PrAzar SgThree 2Pet 1Pet Rom Song Prov Wis Joel Jonah Nah 1John 2John 3John John Josh Judg 1Esd 2Esd Isa 2Sam 1Sam 2Chr 1Chr Ezra Ruth Neh GkEsth Esth Job Mal Matt Ps Eccl Ezek Hos Obad Hag Hab Mic Zech Zeph Luke Jer 2Cor 1Cor Gal Eph Col 2Tim 1Tim Deut Titus Heb Phil Dan Jude 2Macc 3Macc 4Macc 1Macc Mark Jas Amos Tob Jdt Bar)],
		exclude_langs => [qw(amf awa bba bqc bus chr dop dug fue fuh hil hwc leb mkl mqb mvc mwv nds pck ppl qu soy tmz twi udu wa wol yom zap)],
		exclude_abbrevs => [
			'1 K', '1. K', '1.K', '1K', 'I. K', 'I.K', 'IK',
			'2 K', '2. K', '2.K', '2K', 'II. K', 'II.K', 'IIK',
			'Ri', #Judg
			'Ca', 'En', 'Pi bel Chante a', #Song
			'Ai', #Lam
			'Ad', #Obad
			'J', 'Iv', 'In', #John
			'Nas', #Acts
			],
		post_abbrevs => {
			'1Kgs' => ['1 Ks', '1. Ks', 'I Ks', 'I. Ks', '1 Re', '1. Re'],
			'2Kgs' => ['2 Ks', '2. Ks', 'II Ks', 'II. Ks', '2 Re', '2. Re'],
			Song => ['Songs'],
			Lam => ['La'],
			Mic => ['Mi'],
			John => ['Jan'],
			Rev => ['Re'],
			},
		include_extra_abbrevs => 0,
		},
	asciibg => {
		chars => "[\x00-\x7f\x{2000}-\x{206F}]",
		data => 'en',
		order => [qw(Gen Exod Bel Phlm Lev 2Thess 1Thess 2Kgs 1Kgs EpJer Lam Num Sus Sir PrMan Acts Rev PrAzar SgThree 2Pet 1Pet Rom Song Prov Wis Joel Jonah Nah 1John 2John 3John John Josh Judg 1Esd 2Esd Isa 2Sam 1Sam 2Chr 1Chr Ezra Ruth Neh GkEsth Esth Job Mal Matt Ps Eccl Ezek Hos Obad Hag Hab Mic Zech Zeph Luke Jer 2Cor 1Cor Gal Eph Col 2Tim 1Tim Deut Titus Heb Phil Dan Jude 2Macc 3Macc 4Macc 1Macc Mark Jas Amos Tob Jdt Bar)],
		exclude_langs => [],
		exclude_abbrevs => [
			'1 K', '1. K', '1.K', '1K', 'I. K', 'I.K', 'IK',
			'2 K', '2. K', '2.K', '2K', 'II. K', 'II.K', 'IIK',
			'Ri', #Judg
			'Ca', 'En', 'Pi bel Chante a', #Song
			'Ai', #Lam
			'Ad', #Obad
			'J', 'Iv', 'In', #John
			'Nas', #Acts
			'Su', #Sus
			'Mak', #Eccl
			],
		post_abbrevs => {
			'1Kgs' => ['1 Ks', '1. Ks', 'I Ks', 'I. Ks', '1 Re', '1. Re'],
			'2Kgs' => ['2 Ks', '2. Ks', 'II Ks', 'II. Ks', '2 Re', '2. Re'],
			Song => ['Songs'],
			Lam => ['La'],
			Mic => ['Mi'],
			John => ['Jan'],
			Rev => ['Re'],
			Sus => ['Su'],
			Eccl => ['Mak'],
			},
		include_extra_abbrevs => 1,
		},
	fullbg => {
		chars => '.',
		data => 'en',
		order => [qw(Gen Exod Bel Phlm Lev 2Thess 1Thess 2Kgs 1Kgs EpJer Lam Num Sus Sir PrMan Acts Rev PrAzar SgThree 2Pet 1Pet Rom Song Prov Wis Joel Jonah Nah 1John 2John 3John John Josh Judg 1Esd 2Esd Isa 2Sam 1Sam 2Chr 1Chr Ezra Ruth Neh GkEsth Esth Job Mal Matt Ps Eccl Ezek Hos Obad Hag Hab Mic Zech Zeph Luke Jer 2Cor 1Cor Gal Eph Col 2Tim 1Tim Deut Titus Heb Phil Dan Jude 2Macc 3Macc 4Macc 1Macc Mark Jas Amos Tob Jdt Bar)],
		exclude_langs => [],
		exclude_abbrevs => [
			'1 K', '1. K', '1.K', '1K', 'I. K', 'I.K', 'IK',
			'2 K', '2. K', '2.K', '2K', 'II. K', 'II.K', 'IIK',
			'Ri', #Judg
			'Ca', 'En', 'Pi bel Chante a', #Song
			'Ai', #Lam
			'Ad', #Obad
			'J', 'Iv', 'In', #John
			'Nas', #Acts
			],
		post_abbrevs => {
			Lev => ["\x{5229}"],
			Josh => ["\x{66f8}"],
			'1Kgs' => ['1 Ks', '1. Ks', 'I Ks', 'I. Ks', '1 Re', '1. Re'],
			'2Kgs' => ['2 Ks', '2. Ks', 'II Ks', 'II. Ks', '2 Re', '2. Re'],
			Ezra => ["\x{62c9}"],
			Job => ["\x{4f2f}"],
			Song => ['Songs', "\x{6b4c}"],
			Lam => ['La'],
			Mic => ['Mi'],
			Matt => ["\x{592a}"],
			John => ['Jan', "\x{7d04}"],
			Acts => ["\x{410}\x{43F}\x{43E}\x{441}\x{442}\x{43E}\x{43B}"],
			Rev => ['Re'],
			},
		include_extra_abbrevs => 1,
		},
	);
my @lang_priorities = qw(en es de pt pl zh ru it hu cs uk tl hr sv sk amf);

unless ($ARGV[0] && exists $ranges{$ARGV[0]})
{
	die "Need name as first argument: " . join(', ', sort keys %ranges);
}
my $name = $ARGV[0];

my $range = $ranges{$name};
my %abbrevs = get_abbrevs($range);
my ($langs, %abbrev_osis) = arrange_abbrevs_by_osis();

mkdir "$src_dir/$name" unless (-d "$src_dir/$name");
my %excludes = make_excludes($range);
my $order = make_order($range->{order});
my ($data, $used_langs) = make_valid_abbrevs($name, $range->{data}, $range->{chars}, $range->{post_abbrevs}, $excludes{exclude_langs}, $excludes{exclude_abbrevs}, $order);
$data .= $order;
$data =~ s/(\$UNICODE_BLOCK\t)[^\n]+\n/$1 . make_lang_blocks($used_langs) . "\n"/e;
$data = NFC(NFD($data));
open OUT, '>:utf8', "$src_dir/$name/data.txt";
print OUT $data;
close OUT;

sub make_excludes
{
	my ($range) = @_;
	my %out = (exclude_langs => {}, exclude_abbrevs => {},);
	foreach my $key (keys %out)
	{
		if (exists $range->{$key} && ref $range->{$key})
		{
			foreach my $value (@{$range->{$key}})
			{
				$out{$key}->{$value} = 1;
			}
		}
	}
	if (exists $range->{post_abbrevs})
	{
		foreach my $osis (keys %{$range->{post_abbrevs}})
		{
			foreach my $abbrev (@{$range->{post_abbrevs}->{$osis}})
			{
				$out{exclude_abbrevs}->{$abbrev} = 1;
			}
		}
	}
	return %out;
}

sub make_lang_blocks
{
	my ($used_langs) = @_;
	my %blocks;
	foreach my $lang (keys %{$used_langs})
	{
		next unless (-f "$src_dir/$lang/data.txt");
		open FILE, '<:utf8', "$src_dir/$lang/data.txt";
		while (<FILE>)
		{
			if (/^\$UNICODE_BLOCK\t/)
			{
				chomp;
				my ($key, @blocks) = split /\t/;
				foreach my $block (@blocks)
				{
					$blocks{$block} += $used_langs->{$lang};
				}
				last;
			}
		}
		close FILE;
	}
	my @out = sort { $blocks{$b} <=> $blocks{$a} } keys %blocks;
	return join("\t", @out);
}

sub make_order
{
	my ($lang) = @_;
	if (ref $lang)
	{
		return '=' . join("\n=", @{$lang}) . "\n";
	}
	my $out;
	open FILE, '<:utf8', "$src_dir/$lang/data.txt" or die "$!";
	while (<FILE>)
	{
		next unless (/^=/);
		$out .= $_;
	}
	close FILE;
	return $out;
}

sub make_valid_abbrevs
{
	my ($name, $lang, $pattern, $post_abbrevs, $exclude_langs, $exclude_abbrevs, $order) = @_;
	my (%data, %alreadys, @out);
	$order = expand_order($order);
	my $data_key = 'pre';
	my %used_langs;
	open FILE, '<:utf8', "$src_dir/$lang/data.txt" or die "$!";
	while (<FILE>)
	{
		if (/^\w/)
		{
			$data_key = 'post';
			my ($osis) = /^([\w,]+)\t/;
			next unless (exists $abbrev_osis{$osis});
			push @out, join("\t", $osis, get_matches($pattern, $abbrev_osis{$osis}, $exclude_langs, $exclude_abbrevs, \%used_langs));
			$alreadys{$osis} = 1;
		}
		elsif (/^[#=]/)
		{
			# Handle sort order later.
		}
		elsif (/^\*/)
		{
			foreach my $abbrev (keys %{$exclude_abbrevs})
			{
				my $safe = quotemeta $abbrev;
				s/\t$safe(?=[\t\n])//g;
			}
			s/\t+$//;
			$data{$data_key} .= $_;
		}
		else
		{
			$data{$data_key} .= $_;
		}
	}
	close FILE;
	# Get stragglers like "Ezek,Ezra"
	foreach my $osis (sort keys %abbrev_osis)
	{
		next if (exists $alreadys{$osis});
		push @out, join("\t", $osis, get_matches($pattern, $abbrev_osis{$osis}, $exclude_langs, $exclude_abbrevs, \%used_langs));
	}
	if (%{$post_abbrevs})
	{
		foreach my $osis (sort keys %{$post_abbrevs})
		{
			push @out, join("\t", "$osis,", @{$post_abbrevs->{$osis}}); #the comma after $osis ensures that it gets treated as a different book
		}
	}

	check_abbrevs($name, $order, @out);
	# combining characters are already taken care of in each language's book_names.txt
	my $out = $data{pre} . "\$COLLAPSE_COMBINING_CHARACTERS\tfalse\n\$FORCE_OSIS_ABBREV\tfalse\n\$LANG_ISOS\t" . join("\t", sort keys %used_langs) . "\n" . join("\n", @out) . "\n" . $data{post};
	$out =~ s/\n{2,}/\n/g;
	return ($out, \%used_langs);
}

sub expand_order
{
	my ($order) = @_;
	$order =~ s/=//g;
	$order =~ s/^\s+|\s+$//g;
	my @out = split /\n+/, $order;
	return \@out;
}

sub check_abbrevs
{
	my $name = shift;
	my $order = shift;
	my (%abbrevs, %all_abbrevs, %order);
	my @order = @{$order};
	foreach my $osis (@order)
	{
		$order{$osis} = 1;
	}
	open OUT, '>:utf8', "$src_dir/$name/conflicts.txt";
	foreach my $line (@_)
	{
		my ($osis, @abbrevs) = split /\t/, $line;
		push @order, $osis unless (exists $order{$osis});
		foreach my $abbrev (@abbrevs)
		{
			print "Duplicate: $abbrev / $all_abbrevs{$abbrev} / $osis\n" if (exists $all_abbrevs{$abbrev});
			push @{$abbrevs{$osis}}, $abbrev;
			$all_abbrevs{$abbrev} = $osis;
		}
	}
	foreach my $osis (keys %abbrevs)
	{
		$abbrevs{$osis} = [sort { length $b <=> length $a } @{$abbrevs{$osis}}];
		map { lc $_ } @{$abbrevs{$osis}};
	}
	my $i = 1;
	while (scalar @order > 1)
	{
		my $osis = shift @order;
		print "$i. $osis\n";
		#print "$i / $count\n" if ($i % 1000 == 0);
		$i++;
		foreach my $abbrev (@{$abbrevs{$osis}})
		{
			my $safe_abbrev = quotemeta $abbrev;
			foreach my $compare_osis (@order)
			{
				foreach my $compare (@{$abbrevs{$compare_osis}})
				{
					last if (length $compare <= length $abbrev); #sorted by length, so there will never be a shorter one
					next unless ($compare =~ /(?:^|\b|[\s\-])$safe_abbrev(?:[\s\-]|\b|$)/);
					#next unless ($compare =~ /Plac/);
					print OUT "$osis\t$abbrev\n$compare_osis\t$compare\n\n" ;
					print Dumper("Conflict: $osis:\t$abbrev\n         $compare_osis:\t$compare");
				}
			}
		}
	}
	close OUT;
}

sub get_matches
{
	my ($pattern, $abbrevs, $exclude_langs, $exclude_abbrevs, $used_langs) = @_;
	my @out;
	ABBREV: foreach my $abbrev (@{$abbrevs})
	{
		#print Dumper($abbrev) if ($abbrev =~ /^$pattern+$/);
		next unless ($abbrev =~ /^$pattern+$/);
		next if (exists $exclude_abbrevs->{$abbrev});
		my $ok = 0;
		foreach my $lang (@{$langs->{$abbrev}})
		{
			next if (exists $exclude_langs->{$lang});
			$used_langs->{$lang}++;
			$ok = 1;
		}
		push @out, $abbrev if ($ok);
	}
	#die Dumper("No matches: $pattern") unless (@out);
	@out = sort { length $b <=> length $a } @out;
	print Dumper(\@out) if (Dumper(\@out) =~ /Mak/ && Dumper(\@out) =~ /Eccl/);
	return @out;
}

sub arrange_abbrevs_by_osis
{
	my (%out, %langs);
	foreach my $abbrev (keys %abbrevs)
	{
		my ($osis) = keys %{$abbrevs{$abbrev}};
		if (scalar(keys(%{$abbrevs{$abbrev}})) > 1)
		{
			$osis = prioritize_lang($abbrev, $abbrevs{$abbrev});
		}
		push @{$out{$osis}}, $abbrev;
		foreach my $lang (keys %{$abbrevs{$abbrev}->{$osis}})
		{
			if ($lang =~ /[^a-z]/)
			{
				print Dumper($lang);
				print Dumper($abbrev);
				print Dumper($abbrevs{$abbrev});
				exit;
			}
			push @{$langs{$abbrev}}, $lang;
		}
	}
	return (\%langs, %out);
}

sub prioritize_lang
{
	my ($abbrev, $ref) = @_;
	foreach my $lang (@lang_priorities)
	{
		foreach my $osis (keys %{$ref})
		{
			return $osis if (exists $ref->{$osis}->{$lang});
		}
	}
	print Dumper("No lang priority for: $abbrev") . Dumper($ref);
	return '';
}

sub get_abbrevs
{
	my ($range) = @_;
	my %out;
	opendir SRC, $src_dir;
	while (my $lang = readdir SRC)
	{
		next if (length($lang) > 3);
		next unless ($lang =~ /^\w+$/);
		next unless (-f "$src_dir/$lang/book_names.txt");
		get_abbrevs_from_file("$src_dir/$lang/book_names.txt", \%out, $lang);
	}
	closedir SRC;
	get_abbrevs_from_file("$src_dir/extra/book_names.txt", \%out) if (-f "$src_dir/extra/book_names.txt" && $range->{include_extra_abbrevs});
	return %out;
}

sub get_abbrevs_from_file
{
	my ($file, $abbrevs, $lang) = @_;
	open FILE, '<:utf8', $file or die "$file: $!";
	while (<FILE>)
	{
		next if (/^#/);
		chomp;
		my ($osis, $abbrev, @langs) = split /\t/;
		next unless ($osis);
		if (@langs)
		{
			foreach my $l (@langs)
			{
				$abbrevs->{$abbrev}->{$osis}->{$l}++;
			}
		}
		else
		{
			$abbrevs->{$abbrev}->{$osis}->{$lang}++;
		}
	}
	close FILE;
}
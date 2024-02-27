#!/usr/bin/perl
use strict;
use warnings;

my ($lang) = @ARGV;

die "Please specify a language identifier as the first argument" unless ($lang);
`pegjs --format globals --export-var grammar -o "../temp_${lang}_grammar.js" "../src/$lang/grammar.pegjs"`;
add_pegjs_global("../temp_${lang}_grammar.js");
print "Joining...\n";
`cat "../src/core/bcv_parser.coffee" "../src/core/bcv_passage.coffee" "../src/core/bcv_utils.coffee" "../src/$lang/translations.coffee" "../src/$lang/regexps.coffee" | coffee --no-header --compile --stdio > "../js/${lang}_bcv_parser.js"`;
add_peg('');
print "Compiling spec...\n";
`coffee --no-header -c "../src/$lang/spec.coffee"`;
`mv "../src/$lang/spec.js" "../test/js/${lang}.spec.js"`;
#compile_closure();
unlink "../temp_${lang}_grammar.js";

sub add_peg
{
	my ($prefix) = @_;
	open FILE, "<:utf8", "../temp_$prefix${lang}_grammar.js";
	my $peg = join '', <FILE>;
	close FILE;

	# Ideally, it would `return res[0].split("");`, but this is faster, and PEG.js doesn't care.
	my $new_parsespace = 'function peg$parsespace() {
      var res;
      if (res = /^[\s\xa0*]+/.exec(input.substr(peg$currPos))) {
        peg$currPos += res[0].length;
        return [];
      }
      return peg$FAILED;
    }';
    my $new_parseinteger = 'function peg$parseinteger() {
      var res;
      if (res = /^[0-9]{1,3}(?!\d|,000)/.exec(input.substr(peg$currPos))) {
      	peg$savedPos = peg$currPos;
        peg$currPos += res[0].length;
        return {"type": "integer", "value": parseInt(res[0], 10), "indices": [peg$savedPos, peg$currPos - 1]}
      } else {
        return peg$FAILED;
      }
    }';
    my $new_parseany_integer = 'function peg$parseany_integer() {
      var res;
      if (res = /^[0-9]+/.exec(input.substr(peg$currPos))) {
      	peg$savedPos = peg$currPos;
        peg$currPos += res[0].length;
        return {"type": "integer", "value": parseInt(res[0], 10), "indices": [peg$savedPos, peg$currPos - 1]}
      } else {
        return peg$FAILED;
      }
    }';
    my ($sequence_regex_var) = $peg =~ /function peg\$parsesequence_sep\(\) \{\s+var s.+;\s+s0 =.+\s+s1 =.+\s+if \((peg\$c\d+)\.test/;
    die "No sequence var" unless ($sequence_regex_var);
    my $escaped_regex = quotemeta $sequence_regex_var;
    my ($sequence_regex_value) = $peg =~ /$escaped_regex = \/\^\[,([^\]]+?\]\/)/;
    die "No sequence value" unless ($sequence_regex_value);
    $sequence_regex_value = "/^[" . $sequence_regex_value;
    my $new_options_check = 'if ("punctuation_strategy" in options && options.punctuation_strategy === "eu") {
        peg$parsecv_sep = peg$parseeu_cv_sep;
        ' . $sequence_regex_var . ' = ' . $sequence_regex_value . ';
    }';

	$peg =~ s@function peg\$parsespace\(\) \{(?:(?:.|\n)(?!return s0))*?.return s0;\s*\}@$new_parsespace@;
	$peg =~ s@function peg\$parseinteger\(\) \{(?:(?:.|\n)(?!return s0))*?.return s0;\s*\}@$new_parseinteger@;
	#$peg =~ s@function peg\$parseany_integer\(\) \{(?:(?:.|\n)(?!return s0))*?.return s0;\s*\}@$new_parseany_integer@;
	$peg =~ s@(function text\(\) \{)@$new_options_check\n\n    $1@;
	$peg =~ s! \\t\\r\\n\\xa0!\\s\\xa0!gi;
	$peg =~ s! \\\\t\\\\r\\\\n\\\\xa0!\\\\s\\\\xa0!gi;
	#die "Unreplaced PEG space: $peg" if ($peg =~ /parse(?:space|integer|any_integer)\(\) \{\s+var s/i);
	die "Unreplaced options" unless ($peg =~ /"punctuation_strategy"/);
	merge_file("../js/#PREFIX${lang}_bcv_parser.js", $peg, $prefix);
}

sub merge_file
{
	my ($file, $peg, $prefix) = @_;
	$prefix .= "/" if ($prefix);
	my $src_file = $file;
	$src_file =~ s/#PREFIX//;
	open FILE, "<:utf8", $src_file;
	my $joined = join '', <FILE>;
	close FILE;
	my $prev = $joined;
	$joined =~ s/(\s*\}\)\.call\(this\);\s*)$/\n$peg$1/;
	die "PEG not successfully added" if ($prev eq $joined);
	my $dest_file = $file;
	$dest_file =~ s/#PREFIX/$prefix/;
	open OUT, ">:utf8", $dest_file;
	print OUT $joined;
	close OUT;
}

sub compile_closure
{
	print "Minifying...\n";
	#print `node template_closure.js $lang`;
}

sub add_pegjs_global
{
	my ($file) = @_;
	open FILE, '<:utf8', $file;
	$_ = join '', <FILE>;
	close FILE;
	$_ = "var grammar;\n$_";
	s!\broot\.grammar!grammar!;
	open OUT, '>:utf8', $file;
	print OUT;
	close OUT;
}
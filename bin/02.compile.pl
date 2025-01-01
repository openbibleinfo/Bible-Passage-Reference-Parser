use strict;
use warnings;

my ($lang) = @ARGV;

die "Please specify a language identifier as the first argument" unless ($lang);
`npx peggy --format es -o "./build/temp_${lang}_grammar.js" "../src/$lang/grammar.pegjs"`;
my $peg_content = add_peg('');
open OUT, '>:utf8', "../src/$lang/grammar.js";
print OUT $peg_content;
close OUT;
unlink "./build/temp_${lang}_grammar.js";
`mv "../src/$lang/spec.js" "../test/lang/${lang}.spec.js"`;

sub add_peg
{
	my ($prefix) = @_;
	open FILE, "<:utf8", "./build/temp_$prefix${lang}_grammar.js";
	my $peg = join '', <FILE>;
	close FILE;

	# Ideally, it would `return res[0].split("");`, but this is faster, and Peggy doesn't care.
	my $new_parsespace = 'function peg$parsespace() {
      var res;
      if (res = /^[\s*]+/.exec(input.substring(peg$currPos))) {
        peg$currPos += res[0].length;
        return [];
      }
      return peg$FAILED;
    }';
    my $new_parseinteger = 'function peg$parseinteger() {
      var res;
      if (res = /^[0-9]{1,3}(?!\d|,000)/.exec(input.substring(peg$currPos))) {
      	peg$savedPos = peg$currPos;
        peg$currPos += res[0].length;
        var r = range();
        return {"type": "integer", "value": parseInt(res[0], 10), "indices": [r.start, r.end - 1]}
      } else {
        return peg$FAILED;
      }
    }';
    my ($sequence_regex_var) = $peg =~ /function peg\$parsesequence_sep\(\) \{\s+var s.+;\s+s0 =.+\s+s1 =.+\s+s2 =.+\s+if \((peg\$r\d+)\.test/;
    die "No sequence var" unless ($sequence_regex_var);
    my $escaped_regex = quotemeta $sequence_regex_var;
    # Omit the comma for `eu`.
    my ($sequence_regex_value) = $peg =~ /$escaped_regex = \/\^\[([^\]]+?\]\/)/;
    die "No sequence value" unless ($sequence_regex_value);
    $sequence_regex_value =~ s/,-?//g;
    $sequence_regex_value = "/^[" . $sequence_regex_value;
    my $new_options_check = 'if ("punctuation_strategy" in options && options.punctuation_strategy === "eu") {
        peg$parsecv_sep = peg$parseeu_cv_sep;
        ' . $sequence_regex_var . ' = ' . $sequence_regex_value . ';
    }';

  my $prev = $peg;
	$peg =~ s@function peg\$parsespace\(\) \{(?:(?:.|\n)(?!return s0))*?.return s0;\s*\}@$new_parsespace@;
  die "No change from parsespace" if ($prev eq $peg);
  $prev = $peg;
	$peg =~ s@function peg\$parseinteger\(\) \{(?:(?:.|\n)(?!return s0))*?.return s0;\s*\}@$new_parseinteger@;
  die "No change from parseinteger" if ($prev eq $peg);
  $prev = $peg;
	$peg =~ s@(function text\(\) \{)@$new_options_check\n\n    $1@;
  die "No change from text" if ($prev eq $peg);
  $prev = $peg;
	$peg =~ s! \\t\\r\\n\\xa0!\\s!gi;
	$peg =~ s! \\\\t\\\\r\\\\n\\\\xa0!\\\\s!gi;
  die "No change from whitespace" if ($prev eq $peg);
	return $peg;
}

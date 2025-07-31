#!/usr/bin/bash
if [ -z "$1" ]; then
  echo "Please specify an ISO language code to continue, such as: sh build_lang.sh \"fr\""
  exit 1
fi

# Prepare the language files.
perl 01.add_lang.pl $1

# Copy the main files.
cp ../src/core/bcv_matcher.ts ./build/
cp ../src/core/bcv_options.ts ./build/
cp ../src/core/bcv_parser.ts ./build/
cp ../src/core/bcv_passage.ts ./build/
cp ../src/core/bcv_regexps_manager.ts ./build/
cp ../src/core/bcv_translations_manager.ts ./build/
cp ../src/core/lang_bundle.ts ./build/
cp ../src/core/types.d.ts ./build/

# Generate the language-independent grammar file.
npx peggy --format es --plugin "../src/core/peg_plugin.js" -o "./build/bcv_grammar.js" "../src/core/bcv_grammar.pegjs"

# The perl script generated these language files.
mv ../src/$1/regexps.ts ./build/bcv_regexps.ts
mv ../src/$1/translations.ts ./build/bcv_translations.ts
mv ../src/$1/grammar_options.ts ./build/bcv_grammar_options.ts
mv ../src/$1/spec.js ../test/lang/$1.spec.js

# Create the ES build files.
npx esbuild ./build/bcv_parser.ts --bundle --target=es2022 --charset=utf8 --format=esm --outfile=../esm/bcv_parser.js
npx esbuild ./build/lang_bundle.ts --bundle --target=es2022 --charset=utf8 --format=esm --outfile=../esm/lang/$1.js
# Also create the typescript definitions, which are the same for every language.
cp ../src/core/lang.d.ts ../esm/lang/$1.d.ts

# Now onto commonjs...

# Remove these exports so that we don't export them from inside the module. `export default` is removed later.
sed '/^export {$/,$d' ./build/bcv_grammar.js > ./build/temp_grammar.js
sed 's/^export default/const grammar_options =/' ./build/bcv_grammar_options.ts > ./build/temp_grammar_options.ts

# Concatenate all the non-imported files together.
cat ./build/bcv_regexps.ts ./build/bcv_translations.ts ./build/temp_grammar.js ./build/bcv_parser.ts ./build/temp_grammar_options.ts > ./build/temp_cjs_bundle.ts
# Remove the unnecessary exported classes from the `ts` modules.
sed "s/export default //g" ./build/temp_cjs_bundle.ts > ./build/cjs_bundle.ts
# Make sure the grammar object is available inside the module.
echo "var grammar = { parse: peg\$parse };" >> ./build/cjs_bundle.ts
# Now build the cjs module. It also works as a browser module thanks to the banner line.
npx esbuild ./build/cjs_bundle.ts --bundle --target=es2022 --charset=utf8 --format=cjs --banner:js='if (typeof module === "undefined") { var module = {}; }' --outfile=../cjs/$1_bcv_parser.js

if [ "$1" = "en" ]; then
  # Create a minified file for historical compatibility with pre-v3.
  npx esbuild ./build/cjs_bundle.ts --bundle --minify --target=es2022 --charset=utf8 --format=cjs --banner:js='if (typeof module === "undefined") { var module = {}; }' --outfile=../cjs/$1_bcv_parser.min.js
fi

# Uncomment this line to build a minified file in `esm`.
#npx esbuild ./build/bcv_parser.ts --bundle --minify --target=es2022 --charset=utf8 --format=esm --outfile=../esm/$1_bcv_parser.min.js

# Clean up build files.
rm ./build/*

# Run tests.
npx jasmine ../test/lang/$1.spec.js --random=false

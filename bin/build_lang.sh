#!/usr/bin/bash
if [ -z "$1" ]; then
  echo "Please specify an ISO language code to continue, such as: sh build_lang.sh \"fr\""
  exit 1
fi

# Prepare the language files.
perl 01.add_lang.pl $1
perl 02.compile.pl $1

# Copy the main files.
cp ../src/core/bcv_matcher.ts ./build/
cp ../src/core/bcv_options.ts ./build/
cp ../src/core/bcv_parser.ts ./build/
cp ../src/core/bcv_passage.ts ./build/
cp ../src/core/bcv_regexps_manager.ts ./build/
cp ../src/core/lang_bundle.ts ./build/
cp ../src/core/types.d.ts ./build/

# The perl scripts generated these language files.
mv ../src/$1/regexps.ts ./build/bcv_regexps.ts
mv ../src/$1/translations.ts ./build/bcv_translations.ts
mv ../src/$1/grammar.js ./build/bcv_grammar.js

# Create the ES build files.
npx esbuild ./build/bcv_parser.ts --bundle --target=es2022 --charset=utf8 --format=esm --outfile=../es/bcv_parser.js
npx esbuild ./build/lang_bundle.ts --bundle --target=es2022 --charset=utf8 --format=esm --outfile=../es/lang/$1.js

# Now onto commonjs...

# Remove grammar export so that we don't export it from inside the module.
sed '/^export {$/,$d' ./build/bcv_grammar.js > ./build/temp_grammar.js

# Concatenate all the non-imported files together.
cat ./build/bcv_regexps.ts ./build/bcv_translations.ts ./build/temp_grammar.js ./build/bcv_parser.ts > ./build/temp_cjs_bundle.ts
# Remove the unnecessary exported classes from the `ts` modules.
sed "s/export default //g" ./build/temp_cjs_bundle.ts > ./build/cjs_bundle.ts
# Make sure the grammar object is available inside the module.
echo "var grammar = { parse: peg\$parse };" >> ./build/cjs_bundle.ts
# Now build the cjs module. It also works as a browser module thanks to the banner line.
npx esbuild ./build/cjs_bundle.ts --bundle --target=es2022 --charset=utf8 --format=cjs --banner:js='if (typeof module === "undefined") { var module = {}; }' --outfile=../cjs/$1_bcv_parser.cjs

if [ "$1" = "en" ]; then
  # Create a minified file for historical compatibility with pre-v3.
  npx esbuild ./build/cjs_bundle.ts --bundle --minify --target=es2022 --charset=utf8 --format=cjs --banner:js='if (typeof module === "undefined") { var module = {}; }' --outfile=../cjs/$1_bcv_parser.min.cjs
fi

# Uncomment this line to build a minified file in `es`.
#npx esbuild ./build/bcv_parser.ts --bundle --minify --target=es2022 --charset=utf8 --format=esm --outfile=../es/$1_bcv_parser.min.js

# Clean up build files.
rm ./build/*

# Run tests.
npx jasmine ../test/lang/$1.spec.js

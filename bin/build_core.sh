#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

# The build directory is transient and untracked, so it doesn't exist in a fresh clone.
mkdir -p "$BUILD_DIR"
rm -f "$BUILD_DIR"/*
cp "$ROOT_DIR/src/bcv_matcher.ts" "$BUILD_DIR/"
cp "$ROOT_DIR/src/bcv_options.ts" "$BUILD_DIR/"
cp "$ROOT_DIR/src/bcv_parser.ts" "$BUILD_DIR/"
cp "$ROOT_DIR/src/bcv_passage.ts" "$BUILD_DIR/"
cp "$ROOT_DIR/src/bcv_validators.ts" "$BUILD_DIR/"
cp "$ROOT_DIR/src/bcv_regexps_manager.ts" "$BUILD_DIR/"
cp "$ROOT_DIR/src/bcv_translations_manager.ts" "$BUILD_DIR/"
npx peggy --format es --plugin "$ROOT_DIR/src/peg_plugin.js" -o "$BUILD_DIR/bcv_grammar.js" "$ROOT_DIR/src/bcv_grammar.pegjs"

npx esbuild "$BUILD_DIR/bcv_parser.ts" --bundle --target=es2022 --charset=utf8 --format=esm --outfile="$ROOT_DIR/esm/bcv_parser.js"
sh "$SCRIPT_DIR/build_types.sh"

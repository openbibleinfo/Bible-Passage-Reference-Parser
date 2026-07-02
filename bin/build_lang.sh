#!/usr/bin/env sh
set -eu

if [ -z "${1:-}" ]; then
  echo "Usage: sh build_lang.sh <repo_lang_code> [external_repo_path] [external_lang_code]"
  echo "Example (rename eng -> en): sh build_lang.sh en /path/to/language-repo eng"
  exit 1
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

TARGET_CODE="$1"
EXTERNAL_REPO_PATH="${2:-${BCV_LANG_REPO:-}}"
EXTERNAL_CODE="${3:-$TARGET_CODE}"

copy_external_language() {
  repo_path="$1"
  source_code="$2"
  source_file=""
  for candidate in \
    "$repo_path/esm/lang/$source_code.js" \
    "$repo_path/lang/$source_code.js" \
    "$repo_path/$source_code.js"
  do
    if [ -f "$candidate" ]; then
      source_file="$candidate"
      break
    fi
  done
  if [ -z "$source_file" ]; then
    echo "Could not find $source_code.js in external repo: $repo_path"
    echo "Checked:"
    printf '  %s\n' \
      "$repo_path/esm/lang/$source_code.js" \
      "$repo_path/lang/$source_code.js" \
      "$repo_path/$source_code.js"
    exit 1
  fi
  target_file="$ROOT_DIR/esm/lang/$TARGET_CODE.js"
  if [ "$(realpath "$source_file")" = "$(realpath "$target_file" 2>/dev/null || true)" ]; then
    echo "Language file already in place: esm/lang/$TARGET_CODE.js"
  else
    cp "$source_file" "$target_file"
    echo "Copied language file: $source_file -> esm/lang/$TARGET_CODE.js"
  fi
}

if [ -n "$EXTERNAL_REPO_PATH" ]; then
  copy_external_language "$EXTERNAL_REPO_PATH" "$EXTERNAL_CODE"
elif [ ! -f "$ROOT_DIR/esm/lang/$TARGET_CODE.js" ]; then
  echo "Missing esm/lang/$TARGET_CODE.js."
  echo "Provide external repo path/code: sh build_lang.sh $TARGET_CODE <external_repo_path> <external_lang_code>"
  exit 1
fi

# Build core parser if it's not available yet.
if [ ! -f "$ROOT_DIR/esm/bcv_parser.js" ]; then
  sh "$SCRIPT_DIR/build_core.sh"
fi
sh "$SCRIPT_DIR/build_types.sh"

ENTRY_FILE="$BUILD_DIR/cjs_entry_${TARGET_CODE}.ts"
cat > "$ENTRY_FILE" <<EOF
import { bcv_parser as base_bcv_parser } from "../../esm/bcv_parser.js";
import * as lang from "../../esm/lang/${TARGET_CODE}.js";

class bcv_parser extends base_bcv_parser {
  constructor() {
    super(lang);
  }
}

export { bcv_parser };
EOF

# The footer exposes the language-bound class as a browser global for plain `<script>` usage. Without it, the global `bcv_parser` resolves to the bundled base class (esbuild renames the subclass to avoid the collision), which throws when constructed without a language object. Keying on `self` rather than `window` also covers web workers; `self` is undefined in Node, so `require()` stays unaffected.
BANNER='if (typeof module === "undefined") { var module = {}; }'
FOOTER='if (typeof self !== "undefined") { self.bcv_parser = module.exports.bcv_parser; }'

npx esbuild "$ENTRY_FILE" --bundle --target=es2022 --charset=utf8 --format=cjs --banner:js="$BANNER" --footer:js="$FOOTER" --outfile="$ROOT_DIR/cjs/$TARGET_CODE"_bcv_parser.js

if [ "$TARGET_CODE" = "en" ]; then
  npx esbuild "$ENTRY_FILE" --bundle --minify --target=es2022 --charset=utf8 --format=cjs --banner:js="$BANNER" --footer:js="$FOOTER" --outfile="$ROOT_DIR/cjs/$TARGET_CODE"_bcv_parser.min.js
fi

rm -f "$ENTRY_FILE"

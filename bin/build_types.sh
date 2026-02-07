#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

mkdir -p "$ROOT_DIR/types"
cp "$ROOT_DIR/src/bcv_parser.d.ts" "$ROOT_DIR/types/bcv_parser.d.ts"
cp "$ROOT_DIR/src/lang.d.ts" "$ROOT_DIR/types/lang.d.ts"
cp "$ROOT_DIR/src/types.d.ts" "$ROOT_DIR/types/types.d.ts"

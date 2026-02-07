#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LANG_REPO="${1:-${BCV_LANG_REPO:-}}"

if [ -z "$LANG_REPO" ]; then
  echo "Usage: sh build_all.sh <external_language_repo_path>"
  echo "Or set BCV_LANG_REPO=/path/to/language-repo"
  exit 1
fi

# Keep this order aligned with historical build order.
LANG_CODES=(
  en amf ar awa bba bg bqc bus ceb chr ckb cs cy da de dop el es fa fi fr fue fuh
  he hi hil hne hr ht hu hwc id is it ja jv kn ko la leb lg mk mkl mr mvc nds ne nl
  no ny or pa pck pl ppl pt ro ru sk so soy sq sr sv sw ta te th tl tmz tr twi udu uk
  ur vi wal yo yom zh ascii full
)

# Only map codes that differ between this repo and the language repo.
declare -A EXTERNAL_CODE_MAP=(
  [en]=eng
  [ar]=ara
  [cs]=ces
  [da]=dan
  [de]=deu
  [el]=grc
  [es]=spa
  [fa]=fas
  [fi]=fin
  [fr]=fra
  [he]=heb
  [hi]=hin
  [hr]=hrv
  [ht]=hat
  [hu]=hun
  [id]=ind
  [is]=isl
  [it]=ita
  [ja]=jpn
  [jv]=jav
  [kn]=kan
  [ko]=kor
  [la]=lat
  [mk]=mkd
  [mr]=mar
  [ne]=nep
  [nl]=nld
  [no]=nor
  [or]=ori
  [pa]=pan
  [pl]=pol
  [pt]=por
  [ro]=ron
  [ru]=rus
  [sk]=slk
  [so]=som
  [sq]=sqi
  [sr]=srp
  [sv]=swe
  [sw]=swa
  [ta]=tam
  [te]=tel
  [th]=tha
  [tl]=tgl
  [tr]=tur
  [uk]=ukr
  [ur]=urd
  [vi]=vie
  [yo]=yor
  [zh]=zho
)

TOTAL="${#LANG_CODES[@]}"
I=1

for code in "${LANG_CODES[@]}"; do
  echo "$I / $TOTAL. $code..."
  external_code="${EXTERNAL_CODE_MAP[$code]:-$code}"
  sh "$SCRIPT_DIR/build_lang.sh" "$code" "$LANG_REPO" "$external_code"
  if [ "$code" = "en" ]; then
    (
      cd "$ROOT_DIR"
      npx jasmine test/*.spec.*
    )
  fi
  I=$((I + 1))
done

echo "Rerunning tests..."
(
  cd "$ROOT_DIR"
  npx jasmine test/*.spec.*
)

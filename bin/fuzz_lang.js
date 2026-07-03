#!/usr/bin/env node
// Fuzz tester for the bcv parser. Generates reference-like strings (grammar
// shapes, corpus mutations, noise, pathological regexp shapes), runs them
// through the parser under randomized option sets, and checks invariants
// beyond "does not throw". Run with --help for the CLI options.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bcv_parser } from "../esm/bcv_parser.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// ## CLI

function parseArgs(argv) {
  const out = {
    lang: "en",
    count: 10000,
    seed: Date.now() >>> 0,
    minLength: 8,
    maxLength: 120,
    optionsMode: "mix",
    inputFile: null,
    failureFile: "fuzz-failures.jsonl",
    replayFile: null,
    maxMsPerInput: 250,
    shrink: true,
    verbose: false
  };

  const takesValue = {
    "--lang": "lang",
    "--count": "count",
    "--seed": "seed",
    "--min-length": "minLength",
    "--max-length": "maxLength",
    "--options-mode": "optionsMode",
    "--input-file": "inputFile",
    "--failure-file": "failureFile",
    "--replay": "replayFile",
    "--max-ms-per-input": "maxMsPerInput"
  };
  const numeric = new Set(["count", "seed", "minLength", "maxLength", "maxMsPerInput"]);

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--verbose" || arg === "-v") {
      out.verbose = true;
      continue;
    }
    if (arg === "--no-shrink") {
      out.shrink = false;
      continue;
    }
    if (arg === "--profile") {
      out.profile = true;
      continue;
    }
    const eq = arg.indexOf("=");
    const flag = eq >= 0 ? arg.slice(0, eq) : arg;
    if (takesValue[flag] != null) {
      const raw = eq >= 0 ? arg.slice(eq + 1) : argv[++i];
      const key = takesValue[flag];
      out[key] = numeric.has(key) ? Number.parseInt(raw, 10) : raw;
      continue;
    }
    positional.push(arg);
  }

  if (positional[0] != null) {
    out.lang = positional[0];
  }
  if (positional[1] != null) {
    out.count = Number.parseInt(positional[1], 10);
  }
  if (positional[2] != null) {
    out.seed = Number.parseInt(positional[2], 10);
  }
  out.seed = out.seed >>> 0;

  if (!Number.isInteger(out.count) || out.count <= 0) {
    throw new Error("count must be a positive integer");
  }
  if (!Number.isInteger(out.minLength) || !Number.isInteger(out.maxLength) || out.minLength <= 0 || out.maxLength < out.minLength) {
    throw new Error("min-length and max-length must be positive integers with max >= min");
  }
  if (!["default", "random", "mix"].includes(out.optionsMode)) {
    throw new Error("options-mode must be one of: default, random, mix");
  }

  return out;
}

function usage() {
  return [
    "Usage:",
    "  node bin/fuzz_lang.js [lang] [count] [seed]",
    "  node bin/fuzz_lang.js --lang en --count 50000 --seed 42",
    "  node bin/fuzz_lang.js --replay fuzz-failures.jsonl",
    "",
    "Options:",
    "  --lang <code>            Language code in esm/lang (default: en)",
    "  --count <n>              Number of random strings to parse (default: 10000)",
    "  --seed <n>               Deterministic PRNG seed (default: current time)",
    "  --min-length <n>         Minimum length for noise-style strings (default: 8)",
    "  --max-length <n>         Maximum length for noise-style strings (default: 120)",
    "  --options-mode <mode>    default | random | mix (default: mix)",
    "  --input-file <path>      Newline-delimited inputs; run directly and add to the mutation corpus",
    "  --failure-file <path>    Where to write JSONL failure records (default: fuzz-failures.jsonl)",
    "  --replay <path>          Replay a JSONL failure file instead of fuzzing",
    "  --max-ms-per-input <n>   Latency threshold for reporting slow inputs (default: 250)",
    "  --no-shrink              Skip shrinking failing inputs",
    "  --profile                Throughput mode: parse + osis() + osis_and_indices() only,",
    "                           default options, no invariant checks; reports KB/s",
    "  --verbose, -v            Print progress and generator/option coverage",
    "  --help, -h               Show this help"
  ].join("\n");
}

// ## PRNG helpers

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ t >>> 15, 1 | t);
    x ^= x + Math.imul(x ^ x >>> 7, 61 | x);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}

function randInt(rand, min, maxInclusive) {
  return min + Math.floor(rand() * (maxInclusive - min + 1));
}

function pick(rand, arr, fallback = "") {
  if (!Array.isArray(arr) || arr.length === 0) {
    return fallback;
  }
  return arr[randInt(rand, 0, arr.length - 1)];
}

function chance(rand, p) {
  return rand() < p;
}

// ## Options

// `grammar_next` is a fuzzer pseudo-option, not a parser option: "on"
// redefines the `next` grammar token through the public `grammar` option
// (`set_options({ grammar: { next: /^f(?![a-z0-9])/ } })`) so a single "f"
// means Polish-style next-verse and the otherwise-unreachable-in-English
// `next_v` handler gets fuzzed; "ff" still means "and following". "off"
// restores the language's default (a never-matching placeholder in English).
const NEXT_ON_REGEXP = /^f(?![a-z0-9])/;
let default_next_regexp = null; // captured from the pristine parser in main()

const DEFAULT_OPTIONS = {
  grammar_next: "off",
  consecutive_combination_strategy: "combine",
  osis_compaction_strategy: "b",
  book_sequence_strategy: "ignore",
  invalid_sequence_strategy: "ignore",
  sequence_combination_strategy: "combine",
  punctuation_strategy: "us",
  invalid_passage_strategy: "ignore",
  non_latin_digits_strategy: "ignore",
  passage_existence_strategy: "bcv",
  book_alone_strategy: "ignore",
  book_range_strategy: "ignore",
  captive_end_digits_strategy: "delete",
  testaments: "on",
  ps151_strategy: "c",
  versification_system: "default",
  case_sensitive: "none",
  zero_chapter_strategy: "error",
  zero_verse_strategy: "error",
  single_chapter_1_strategy: "chapter",
  end_range_digits_strategy: "verse"
};

function buildOptionValues(parser) {
  const systems = Object.keys(parser.translations.systems).filter((s) => s !== "current");
  return {
    grammar_next: ["off", "on"],
    consecutive_combination_strategy: ["combine", "separate"],
    osis_compaction_strategy: ["b", "bp", "bc", "bcp", "bcv", "bcvp"],
    book_sequence_strategy: ["ignore", "include"],
    invalid_sequence_strategy: ["ignore", "include"],
    sequence_combination_strategy: ["combine", "separate"],
    punctuation_strategy: ["us", "eu"],
    invalid_passage_strategy: ["ignore", "include"],
    non_latin_digits_strategy: ["ignore", "replace"],
    passage_existence_strategy: ["b", "bc", "bcv", "bv", "c", "cv", "v", "none"],
    book_alone_strategy: ["ignore", "full", "first_chapter"],
    book_range_strategy: ["ignore", "include"],
    captive_end_digits_strategy: ["delete", "include"],
    testaments: ["on", "ona", "oa", "o", "na", "n", "a"],
    ps151_strategy: ["c", "b"],
    versification_system: systems.length > 0 ? systems : ["default"],
    case_sensitive: ["none", "books", "translations", "books,translations"],
    zero_chapter_strategy: ["error", "upgrade"],
    zero_verse_strategy: ["error", "upgrade", "allow"],
    single_chapter_1_strategy: ["chapter", "verse"],
    end_range_digits_strategy: ["verse", "sequence"]
  };
}

function randomOptionSet(rand, optionValues) {
  const out = { ...DEFAULT_OPTIONS };
  const keys = Object.keys(optionValues);
  if (chance(rand, 0.1)) {
    // Occasionally randomize everything at once.
    for (const key of keys) {
      out[key] = pick(rand, optionValues[key]);
    }
    return out;
  }
  const flips = randInt(rand, 1, 5);
  for (let i = 0; i < flips; i++) {
    const key = pick(rand, keys);
    out[key] = pick(rand, optionValues[key]);
  }
  // The `grammar_next` pseudo-option only affects "f"-suffixed inputs, so the
  // 1-in-42 flip chance above would leave `next_v` nearly unfuzzed; give it an
  // independent boost.
  if (chance(rand, 0.25)) {
    out.grammar_next = "on";
  }
  return out;
}

function optionsDiff(options) {
  const out = {};
  for (const [key, value] of Object.entries(options)) {
    if (DEFAULT_OPTIONS[key] !== value) {
      out[key] = value;
    }
  }
  return out;
}

function isDefaultOptions(options) {
  return Object.keys(optionsDiff(options)).length === 0;
}

// Only set keys that differ from the parser's current state; the expensive
// setters (`testaments`, `case_sensitive`, `versification_system`) rebuild
// regexp state even though they no-op on equal values.
function applyOptions(parser, options) {
  const diff = {};
  for (const [key, value] of Object.entries(options)) {
    if (key === "grammar_next") {
      const next = value === "on" ? NEXT_ON_REGEXP : default_next_regexp;
      if (next != null && parser.options.grammar.next.source !== next.source) {
        parser.set_options({ grammar: { next } });
      }
      continue;
    }
    if (parser.options[key] !== value) {
      diff[key] = value;
    }
  }
  if (Object.keys(diff).length > 0) {
    parser.set_options(diff);
  }
}

// ## Parser-derived data

function buildKnownBooks(parser) {
  const books = new Set();
  for (const entry of parser.regexps.all_books) {
    if (!entry || !Array.isArray(entry.osis)) {
      continue;
    }
    for (const osis of entry.osis) {
      if (typeof osis === "string" && osis.length > 0) {
        books.add(osis);
      }
    }
  }
  books.add("Ps151");
  return [...books];
}

function buildKnownTranslations(parser) {
  const aliases = Object.keys(parser.translations.aliases || {});
  return aliases.filter((a) => typeof a === "string" && a.length > 0);
}

function buildChapterData(parser, books) {
  const chapters = {};
  const singleChapterBooks = [];
  const families = {};
  for (const book of books) {
    const data = parser.translations.systems.default?.chapters?.[book];
    if (Array.isArray(data) && data.length > 0) {
      chapters[book] = data;
      if (data.length === 1) {
        singleChapterBooks.push(book);
      }
    }
    const match = /^([1-4])([A-Za-z]+)$/.exec(book);
    if (match) {
      families[match[2]] = families[match[2]] || [];
      families[match[2]].push(Number(match[1]));
    }
  }
  const numberedFamilies = Object.entries(families)
    .filter(([, nums]) => nums.length >= 2)
    .map(([base, nums]) => ({ base, max: Math.max(...nums) }));
  return { chapters, singleChapterBooks, numberedFamilies };
}

// ## Corpus

function extractParseStrings(text) {
  const out = [];
  const regexp = /\.parse(?:_with_context)?\(\s*"((?:[^"\\\n]|\\.)*)"/g;
  let match;
  while ((match = regexp.exec(text)) !== null) {
    try {
      out.push(JSON.parse(`"${match[1]}"`));
    } catch {
      // Skip strings with escapes JSON can't handle.
    }
  }
  return out;
}

function loadCorpus(inputFile) {
  const entries = new Set();
  for (const file of ["test/realworld.spec.js", "README.md"]) {
    try {
      for (const s of extractParseStrings(fs.readFileSync(path.join(root, file), "utf8"))) {
        if (s.length > 0) {
          entries.add(s);
        }
      }
    } catch {
      // A missing source file just means a smaller corpus.
    }
  }
  if (inputFile != null) {
    for (const line of fs.readFileSync(inputFile, "utf8").split("\n")) {
      if (line.length > 0) {
        entries.add(line);
      }
    }
  }
  return [...entries];
}

// ## Generators

function renderBook(rand, book) {
  const roll = rand();
  if (roll < 0.65) {
    return book;
  }
  if (roll < 0.8) {
    return book.toLowerCase();
  }
  if (roll < 0.9) {
    return book.toUpperCase();
  }
  return [...book].map((ch) => (chance(rand, 0.5) ? ch.toLowerCase() : ch.toUpperCase())).join("");
}

function maxChapter(env, book) {
  const data = env.chapters[book];
  return Array.isArray(data) ? data.length : 25;
}

function maxVerse(env, book, chapter) {
  const data = env.chapters[book];
  if (Array.isArray(data) && data[chapter - 1] > 0) {
    return data[chapter - 1];
  }
  return 30;
}

function cvSep(rand) {
  return pick(rand, [":", ":", ":", ".", ","]);
}

function rangeSep(rand) {
  return pick(rand, ["-", "-", "-", "–", "—", " - ", " to ", " through "]);
}

// English-specific explicit-word tokens, matching the hardcoded English
// elsewhere in the generators ("chapter", " to ", "title", "ff").
function vExplicit(rand) {
  return pick(rand, ["verse", "verses", "ver.", "ver", "v.", "vv.", "vss."]);
}

function cExplicit(rand) {
  return pick(rand, ["chapter", "chapters", "chap.", "ch.", "ch"]);
}

function ordinal(n) {
  const suffix = (n % 100 >= 11 && n % 100 <= 13) ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}

function renderTranslation(rand, t) {
  const roll = rand();
  if (roll < 0.7) {
    return t.toUpperCase();
  }
  if (roll < 0.85) {
    return t.toLowerCase();
  }
  return [...t].map((ch) => (chance(rand, 0.5) ? ch.toLowerCase() : ch.toUpperCase())).join("");
}

function maybeTranslation(rand, env, s) {
  if (env.translations.length > 0 && chance(rand, 0.25)) {
    let t = renderTranslation(rand, pick(rand, env.translations));
    // Translation sequences ("NIV, KJV") are their own grammar path.
    if (chance(rand, 0.15)) {
      t += `, ${renderTranslation(rand, pick(rand, env.translations))}`;
    }
    return chance(rand, 0.3) ? `${s} (${t})` : `${s} ${t}`;
  }
  return s;
}

// Shapes built around explicit "verse"/"chapter" words, ordinals, titles, and
// enclosed sequences -- grammar paths (v_explicit range ends, bv, c_psalm,
// cv_psalm, cb_range, cb_ordinal, bcv_hyphen_range, c_title, integer_title,
// sequence_post_enclosed, explicit_context) that digit-only shapes never reach.
function genExplicitReference(rand, env) {
  const book = renderBook(rand, pick(rand, env.books, "Gen"));
  const rawBook = pick(rand, env.books, "Gen");
  const cMax = maxChapter(env, rawBook);
  const c = randInt(rand, 1, cMax);
  const vMax = maxVerse(env, rawBook, c);
  const v = randInt(rand, 1, vMax);
  const shape = rand();

  // Explicit-verse range ends: "Matt 5-verse 6", including end-before-start,
  // zero, and past-the-end values.
  if (shape < 0.14) {
    const end = pick(rand, [v + 1, Math.max(1, v - randInt(rand, 1, 20)), 0, 999, vMax + randInt(rand, 1, 10)]);
    return `${book} ${c}${rangeSep(rand)}${vExplicit(rand)} ${end}`;
  }
  if (shape < 0.26) {
    const end = pick(rand, [v + 1, Math.max(1, v - randInt(rand, 1, 20)), 999]);
    return `${book} ${c}${cvSep(rand)}${v}${rangeSep(rand)}${vExplicit(rand)} ${end}`;
  }
  // Digit-salvage shape with an explicit-verse end ("Matt 5:22, 24-verse 5").
  if (shape < 0.34) {
    return `${book} ${c}${cvSep(rand)}${v}, ${v + 2}${rangeSep(rand)}${vExplicit(rand)} ${randInt(rand, 1, 9)}`;
  }
  // "Phlm verse 6" (bv), with both single- and multi-chapter books.
  if (shape < 0.44) {
    const b = chance(rand, 0.5) && env.singleChapterBooks.length > 0 ? renderBook(rand, pick(rand, env.singleChapterBooks)) : book;
    return `${b} ${vExplicit(rand)} ${v}`;
  }
  // Ordinal Psalms: "23rd Psalm" (c_psalm), "23rd Psalm verse 1" (cv_psalm),
  // sometimes past Ps 150.
  if (shape < 0.54) {
    const n = randInt(rand, 1, chance(rand, 0.8) ? 150 : 175);
    const base = `${ordinal(n)} ${pick(rand, ["Psalm", "psalm", "Ps."])}`;
    return chance(rand, 0.5) ? base : `${base} ${vExplicit(rand)} ${v}`;
  }
  // "chapters 1-2 of Daniel" (cb_range).
  if (shape < 0.62) {
    return `${pick(rand, ["chapters", "chap."])} ${c}${rangeSep(rand)}${randInt(rand, c, cMax)} ${pick(rand, ["of", "from", "in"])} ${book}`;
  }
  // "1st chapter of Matt" (cb_ordinal).
  if (shape < 0.7) {
    return `${ordinal(c)} ${pick(rand, ["chapter", "ch."])} of ${book}`;
  }
  // Explicit chapter/verse context switches inside a sequence:
  // "Matt 5:1, chapter 6" (explicit_context).
  if (shape < 0.78) {
    const word = chance(rand, 0.5) ? cExplicit(rand) : vExplicit(rand);
    return `${book} ${c}${cvSep(rand)}${v}, ${word} ${randInt(rand, 1, 30)}`;
  }
  // "Matt 5-6-7" (bcv_hyphen_range).
  if (shape < 0.82) {
    return `${book} ${c}-${v}-${v + randInt(rand, 1, 5)}`;
  }
  // Book-only and book-anchored ranges: "Gen-Exod" (b_range), "Gen-Exod 2"
  // (b_range_start), "Gen 2-Exod" (range_end_b).
  if (shape < 0.88) {
    const book2 = renderBook(rand, pick(rand, env.books, "Rev"));
    return pick(rand, [
      `${book}${rangeSep(rand)}${book2}`,
      `${book}${rangeSep(rand)}${book2} ${randInt(rand, 1, 25)}`,
      `${book} ${c}${rangeSep(rand)}${book2}`
    ]);
  }
  // Titles: "Ps 3:title", "Ps 3-4:title" (integer_title), "Ps 3, ch 4:title"
  // (c_title), "Acts 2:22-27. Title".
  if (shape < 0.94) {
    const ps = renderBook(rand, "Ps");
    const c2 = randInt(rand, 1, 150);
    return pick(rand, [
      `${ps} ${c2}:title`,
      `${ps} ${c2}-${c2 + 1}:title`,
      `${ps} ${c2}, ch ${c2 + 1}:title`,
      `${book} ${c}:${v}-${v + 2}. Title`
    ]);
  }
  // Enclosed sequences: "Ps 119 (118)" (sequence_post_enclosed).
  return chance(rand, 0.5)
    ? `${renderBook(rand, "Ps")} ${randInt(rand, 1, 150)} (${randInt(rand, 1, 150)})`
    : `${book} ${c}${cvSep(rand)}${v} (${v + randInt(rand, 1, 5)})`;
}

// A single reference in one of the parser's grammar shapes, with a mix of
// valid and deliberately invalid chapter/verse numbers.
function genReference(rand, env) {
  if (chance(rand, 0.3)) {
    return genExplicitReference(rand, env);
  }
  const book = renderBook(rand, pick(rand, env.books, "Gen"));
  const rawBook = pick(rand, env.books, "Gen");
  const cMax = maxChapter(env, rawBook);
  const c = randInt(rand, 1, cMax);
  const v = randInt(rand, 1, maxVerse(env, rawBook, c));
  const sep = cvSep(rand);
  const shape = rand();

  // Invalid-number variants: zero, just past max, huge.
  if (shape < 0.12) {
    const invalid = pick(rand, [
      `${book} 0`,
      `${book} ${c}${sep}0`,
      `${book} ${cMax + randInt(rand, 1, 10)}`,
      `${book} ${c}${sep}${maxVerse(env, rawBook, c) + randInt(rand, 1, 10)}`,
      `${book} ${randInt(rand, 900, 100000)}`,
      `${book} ${c}${sep}${randInt(rand, 900, 100000)}`,
      `${book} ${c + 3}-${Math.max(1, c - 3)}`,
      `${book} ${c}${sep}${v + 5}-${Math.max(1, v - 5)}`
    ]);
    return invalid;
  }
  if (shape < 0.2) {
    return book;
  }
  if (shape < 0.28) {
    return `${book} ${c}`;
  }
  if (shape < 0.34 && env.singleChapterBooks.length > 0) {
    return `${renderBook(rand, pick(rand, env.singleChapterBooks))} ${v}`;
  }
  if (shape < 0.46) {
    return `${book} ${c}${sep}${v}`;
  }
  if (shape < 0.52) {
    return `${book} ${c}${rangeSep(rand)}${randInt(rand, c, cMax)}`;
  }
  if (shape < 0.58) {
    return `${book} ${c}${sep}${v}${rangeSep(rand)}${v + randInt(rand, 1, 10)}`;
  }
  if (shape < 0.64) {
    const c2 = randInt(rand, c, cMax);
    return `${book} ${c}${sep}${v}${rangeSep(rand)}${c2}${sep}${randInt(rand, 1, maxVerse(env, rawBook, c2))}`;
  }
  if (shape < 0.7) {
    const book2 = renderBook(rand, pick(rand, env.books, "Rev"));
    return `${book} ${c}${sep}${v}${rangeSep(rand)}${book2} ${randInt(rand, 1, 20)}`;
  }
  if (shape < 0.74) {
    // Chapter-level "Matt 3f" exercises next-chapter handling when the
    // `grammar_next` pseudo-option is on. Biasing toward the last verse or
    // chapter reaches the cross-chapter retry and end-of-book paths in
    // `next_v` (and the boundary paths in `ff`).
    if (chance(rand, 0.3)) {
      const cEnd = chance(rand, 0.25) ? maxChapter(env, rawBook) : c;
      return `${book} ${cEnd}${pick(rand, ["f", "ff"])}`;
    }
    const vEnd = chance(rand, 0.3) ? maxVerse(env, rawBook, c) : v;
    return `${book} ${c}${sep}${vEnd}${pick(rand, ["ff", "f", " ff", "ff.", "f."])}`;
  }
  if (shape < 0.78) {
    const letter = pick(rand, ["a", "b", "c", "d", "e"]);
    return chance(rand, 0.5)
      ? `${book} ${c}${sep}${v}${letter}`
      : `${book} ${c}${sep}${v}${letter}-${c}${sep}${v + 1}${pick(rand, ["a", "b"])}`;
  }
  if (shape < 0.82) {
    return `${renderBook(rand, "Ps")} ${randInt(rand, 1, 150)} title`;
  }
  if (shape < 0.86 && env.numberedFamilies.length > 0) {
    const family = pick(rand, env.numberedFamilies);
    const start = randInt(rand, 1, family.max - 1);
    return `${start}${rangeSep(rand)}${randInt(rand, start + 1, family.max)} ${renderBook(rand, family.base)}`;
  }
  if (shape < 0.9) {
    const t = env.translations.length > 0 ? pick(rand, env.translations).toUpperCase() : "NIV";
    return `${book}${c}${sep}${v}${t}`;
  }
  if (shape < 0.94) {
    return `${book} ${c} (${chance(rand, 0.5) ? "cf. " : "see also "}${randInt(rand, 1, cMax)}${sep}${randInt(rand, 1, 30)})`;
  }
  return `chapter ${c} of ${book}`;
}

function genStructured(rand, env) {
  const parts = [genReference(rand, env)];
  const extra = randInt(rand, 0, 3);
  for (let i = 0; i < extra; i++) {
    parts.push(genReference(rand, env));
  }
  let out = parts.map((p) => maybeTranslation(rand, env, p)).join(pick(rand, [", ", "; ", " and ", " & ", ", cf. ", " see also ", "—"]));
  if (chance(rand, 0.1)) {
    out = `(${out})`;
  }
  return out;
}

function randomNoise(rand, targetLength) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.;:!?()-_/[]{}\\\"'\t";
  let out = "";
  for (let i = 0; i < targetLength; i++) {
    out += chars[randInt(rand, 0, chars.length - 1)];
  }
  return out;
}

function genFragments(rand, env, minLength, maxLength) {
  const target = randInt(rand, minLength, maxLength);
  let out = "";
  while (out.length < target) {
    if (chance(rand, 0.55)) {
      out += genReference(rand, env);
    } else {
      out += randomNoise(rand, randInt(rand, 3, 24));
    }
    if (out.length < target) {
      out += pick(rand, [" ", " ", ", ", "; ", " - ", " / "]);
    }
  }
  return out.slice(0, target);
}

// Shapes chosen to stress regexp matching: long digit runs, repeated
// separators, almost-matching book prefixes, nested parentheses.
function genPathological(rand, env) {
  const book = pick(rand, env.books, "Gen");
  const roll = rand();
  if (roll < 0.15) {
    return `${book} ${"1,".repeat(randInt(rand, 50, 300))}`;
  }
  if (roll < 0.3) {
    return `${book} ${"9".repeat(randInt(rand, 100, 400))}`;
  }
  if (roll < 0.45) {
    return `${book} 1:${"1-".repeat(randInt(rand, 50, 200))}`;
  }
  if (roll < 0.6) {
    return `${book} 1${";".repeat(randInt(rand, 50, 200))}2`;
  }
  if (roll < 0.7) {
    return `${`${randInt(rand, 1, 3)} `.repeat(randInt(rand, 30, 100))}${book} 2`;
  }
  if (roll < 0.8) {
    const open = randInt(rand, 10, 60);
    return `${"(".repeat(open)}${book} 1:2${")".repeat(randInt(rand, 0, open + 10))}`;
  }
  if (roll < 0.9) {
    return `${" - ".repeat(randInt(rand, 30, 120))}${book} 3`;
  }
  return `${", ".repeat(randInt(rand, 50, 200))}${book} 4:5`;
}

// ## Mutations (Unicode, punctuation, structure)

const MUTATIONS = [
  function punctuationSwap(rand, s) {
    return s.replace(/[,;:.]/, () => pick(rand, [",", ";", ":", ".", "", " "]));
  },
  function whitespaceSwap(rand, s) {
    return s.replace(/ /, () => pick(rand, [" ", " ", "　", "\t", "", "  "]));
  },
  function dashSwap(rand, s) {
    return s.replace(/-/, () => pick(rand, ["–", "—", " - ", "--"]));
  },
  function smartQuotes(rand, s) {
    const i = randInt(rand, 0, s.length);
    return s.slice(0, i) + pick(rand, ["“", "”", "‘", "’", "\""]) + s.slice(i);
  },
  function wrapParens(rand, s) {
    const start = randInt(rand, 0, Math.max(0, s.length - 1));
    const end = randInt(rand, start, s.length);
    const [open, close] = pick(rand, [["(", ")"], ["[", "]"], ["(", ""], ["", ")"]]);
    return s.slice(0, start) + open + s.slice(start, end) + close + s.slice(end);
  },
  function nonLatinDigits(rand, s) {
    const offset = chance(rand, 0.5) ? 0x0660 : 0xff10; // Arabic-Indic or fullwidth
    const all = chance(rand, 0.5);
    let replaced = false;
    return s.replace(/\d/g, (d) => {
      if (!all && replaced) {
        return d;
      }
      replaced = true;
      return String.fromCharCode(offset + Number(d));
    });
  },
  function truncate(rand, s) {
    return s.slice(0, randInt(rand, 1, Math.max(1, s.length - 1)));
  },
  function duplicate(rand, s) {
    return s + pick(rand, ["", " ", ", ", "; "]) + s;
  },
  function insertControl(rand, s) {
    const i = randInt(rand, 0, s.length);
    return s.slice(0, i) + pick(rand, ["\x1e", "\x1f"]) + s.slice(i);
  },
  function insertRtl(rand, s) {
    const i = randInt(rand, 0, s.length);
    return s.slice(0, i) + pick(rand, ["‏", "‎", "‮", "‬"]) + s.slice(i);
  },
  function insertCombining(rand, s) {
    const i = randInt(rand, 0, s.length);
    return s.slice(0, i) + pick(rand, ["́", "̂", "ّ"]) + s.slice(i);
  },
  function insertAstral(rand, s) {
    const i = randInt(rand, 0, s.length);
    return s.slice(0, i) + pick(rand, ["\u{1f600}", "\u{1f4d6}", "\u{271d}\u{fe0f}", "\ud800", "\udfff"]) + s.slice(i);
  },
  function caseFlip(rand, s) {
    const start = randInt(rand, 0, Math.max(0, s.length - 1));
    const end = Math.min(s.length, start + randInt(rand, 1, 10));
    const mid = [...s.slice(start, end)].map((ch) => (chance(rand, 0.5) ? ch.toLowerCase() : ch.toUpperCase())).join("");
    return s.slice(0, start) + mid + s.slice(end);
  }
];

function applyMutations(rand, s, maxMutations) {
  const n = randInt(rand, 1, maxMutations);
  for (let i = 0; i < n; i++) {
    s = pick(rand, MUTATIONS)(rand, s);
    if (s.length === 0) {
      s = " ";
    }
  }
  return s;
}

function genCorpusMutation(rand, env) {
  let s = pick(rand, env.corpus, "Genesis 1:1");
  if (chance(rand, 0.2)) {
    s = s + pick(rand, [" ", ", ", "; "]) + pick(rand, env.corpus, "John 3:16");
  }
  return applyMutations(rand, s, 4);
}

// ## Test-case generation

const GENERATORS = [
  { name: "structured", weight: 0.35, gen: (rand, env, opts) => genStructured(rand, env) },
  { name: "fragments", weight: 0.18, gen: (rand, env, opts) => genFragments(rand, env, opts.minLength, opts.maxLength) },
  { name: "corpus", weight: 0.24, gen: (rand, env) => genCorpusMutation(rand, env) },
  { name: "pathological", weight: 0.05, gen: (rand, env) => genPathological(rand, env) },
  { name: "unicode", weight: 0.1, gen: (rand, env, opts) => applyMutations(rand, chance(rand, 0.5) ? genStructured(rand, env) : genFragments(rand, env, opts.minLength, opts.maxLength), 5) },
  // Book-less inputs, mostly paired with a `parse_with_context` context (see
  // CONTEXT_CHANCE): the context supplies (or withholds) the book.
  { name: "contextual", weight: 0.08, gen: (rand, env) => (chance(rand, 0.4) ? genContextualRef(rand, env) : `${genReference(rand, env)}${pick(rand, [", ", "; ", " and "])}${genContextualRef(rand, env)}`) }
];

function pickGenerator(rand) {
  let roll = rand();
  for (const g of GENERATORS) {
    roll -= g.weight;
    if (roll < 0) {
      return g;
    }
  }
  return GENERATORS[0];
}

const CONTEXT_INPUTS = ["verse 2", "v. 2", "vv. 2-3", "verses 5 and 7", "2:4", "chapter 5", "5:2", "and 8", "8ff", "3, 6", "1-2"];

// Book-less reference fragments ("5-verse 2", "chapter 3"). On their own they
// match nothing; after a book in a sequence or as a `parse_with_context`
// context they exercise the context-dependent paths, including the book-less
// contexts that are the only real route into some range-repair branches.
function genContextualRef(rand, env) {
  const c = randInt(rand, 1, 25);
  const v = randInt(rand, 1, 30);
  const roll = rand();
  if (roll < 0.35) {
    return pick(rand, CONTEXT_INPUTS);
  }
  if (roll < 0.5) {
    return `${v}${rangeSep(rand)}${vExplicit(rand)} ${pick(rand, [v + 1, Math.max(1, v - 5), 999])}`;
  }
  if (roll < 0.62) {
    return `${vExplicit(rand)} ${v}`;
  }
  if (roll < 0.74) {
    return `${cExplicit(rand)} ${c}`;
  }
  if (roll < 0.86) {
    return `${c}${cvSep(rand)}${v}`;
  }
  return `${c}${rangeSep(rand)}${randInt(rand, 1, 30)}`;
}

function genContext(rand, env) {
  const roll = rand();
  if (roll < 0.45) {
    return genReference(rand, env);
  }
  if (roll < 0.6) {
    return maybeTranslation(rand, env, genReference(rand, env));
  }
  // Book-less contexts ("chapter 5") leave the context book undefined, which
  // is its own family of paths.
  if (roll < 0.85) {
    return genContextualRef(rand, env);
  }
  // Invalid or garbage context.
  return pick(rand, ["", "not a reference", "999", randomNoise(rand, 12)]);
}

// ## Invariant checks

function buildOsisChecker(books) {
  const escaped = [...books].sort((a, b) => b.length - a.length).map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Partial-verse letters are returned as-is, so uppercase is legal output.
  const ref = `(?:${escaped.join("|")})(?:\\.\\d+(?:\\.\\d+(?:![a-eA-E])?)?)?`;
  const segment = new RegExp(`^${ref}(?:-${ref})?$`);
  return function checkOsis(osis) {
    if (osis === "") {
      return null;
    }
    if (/[\x00-\x1f]/.test(osis)) {
      return "osis_contains_control_characters";
    }
    for (const seg of osis.split(",")) {
      if (!segment.test(seg)) {
        return `osis_segment_malformed: ${JSON.stringify(seg)}`;
      }
    }
    return null;
  };
}

// Run parse + all output calls (each twice, since `parsed_entities()` mutates
// state and repeat calls have crashed historically). Returns outputs and any
// crash/consistency failures.
function runCalls(parser, input, context) {
  const failures = [];
  try {
    if (context == null) {
      parser.parse(input);
    } else {
      parser.parse_with_context(input, context);
    }
  } catch (error) {
    failures.push({ kind: "crash", call: context == null ? "parse" : "parse_with_context", error });
    return { outputs: null, failures };
  }
  const outputs = {};
  for (const round of [1, 2]) {
    const target = round === 1 ? outputs : {};
    for (const call of ["osis", "osis_and_translations", "osis_and_indices"]) {
      try {
        target[call] = parser[call]();
      } catch (error) {
        failures.push({ kind: "crash", call: round === 1 ? call : `repeat:${call}`, error });
        return { outputs: round === 1 ? null : outputs, failures };
      }
    }
    if (round === 2 && JSON.stringify(outputs) !== JSON.stringify(target)) {
      failures.push({ kind: "invariant", invariant: "repeated_call_consistency", detail: { first: outputs, second: target } });
    }
  }
  return { outputs, failures };
}

function checkOutputInvariants(input, outputs, checkOsis) {
  const failures = [];
  const oai = outputs.osis_and_indices;
  let prevEnd = -1;
  for (const entry of oai) {
    const [start, end] = entry.indices;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > input.length) {
      failures.push({ kind: "invariant", invariant: "indices_out_of_bounds", detail: { entry } });
    } else if (end <= start) {
      failures.push({ kind: "invariant", invariant: "empty_index_range", detail: { entry } });
    } else if (start < prevEnd) {
      failures.push({ kind: "invariant", invariant: "indices_overlap_or_unordered", detail: { entry, prevEnd } });
    }
    prevEnd = Math.max(prevEnd, end);
    if (typeof entry.osis !== "string" || entry.osis.length === 0) {
      failures.push({ kind: "invariant", invariant: "empty_osis_entry", detail: { entry } });
    }
  }
  const problem = checkOsis(outputs.osis);
  if (problem != null) {
    failures.push({ kind: "invariant", invariant: "malformed_osis", detail: { osis: outputs.osis, problem } });
  }
  return failures;
}

// ## Running one test case

// Runs a test case on the given parser and returns all failures. `env`
// carries the shared checkers plus dedicated parsers for round-trip and
// equivalence checks.
function runCase(env, parser, testCase) {
  const { input, context, options, checks = {} } = testCase;
  applyOptions(parser, options);
  const { outputs, failures } = runCalls(parser, input, context);
  if (outputs == null) {
    return { failures, outputs };
  }
  failures.push(...checkOutputInvariants(input, outputs, env.checkOsis));

  // Round-trip convergence: reparsing `osis()` output must reach a fixed
  // point within one normalization step. Strict equality is too strong —
  // separate matches in the source text legitimately merge when reparsed as
  // one sequence. Skipped when a translation is present, because
  // translation-specific versification (e.g. Dan 14 in NAB) doesn't survive a
  // reparse without the translation.
  const hasTranslations = outputs.osis_and_translations.some((pair) => pair[1].length > 0);
  if (checks.roundTrip && context == null && isDefaultOptions(options) && outputs.osis.length > 0 && !hasTranslations) {
    try {
      const once = env.roundTripParser.parse(outputs.osis).osis();
      const twice = once === outputs.osis ? once : env.roundTripParser.parse(once).osis();
      if (twice !== once) {
        failures.push({ kind: "invariant", invariant: "osis_round_trip_divergence", detail: { osis: outputs.osis, once, twice } });
      }
    } catch (error) {
      failures.push({ kind: "crash", call: "round_trip_parse", error });
    }
  }

  if (checks.determinism) {
    const again = runCalls(parser, input, context);
    if (again.outputs != null && JSON.stringify(again.outputs) !== JSON.stringify(outputs)) {
      failures.push({ kind: "invariant", invariant: "determinism", detail: { first: outputs, second: again.outputs } });
    }
    failures.push(...again.failures.filter((f) => f.kind === "crash").map((f) => ({ ...f, call: `reparse:${f.call}` })));
  }

  if (checks.freshEquivalence) {
    const fresh = new env.ParserClass(env.lang);
    applyOptions(fresh, options);
    const freshRun = runCalls(fresh, input, context);
    if (freshRun.outputs == null || JSON.stringify(freshRun.outputs) !== JSON.stringify(outputs)) {
      failures.push({ kind: "invariant", invariant: "parser_reuse_equivalence", detail: { reused: outputs, fresh: freshRun.outputs } });
    }
  }

  return { failures, outputs };
}

// ## Failure records, shrinking, replay

function failureSignature(failure) {
  if (failure.kind === "crash") {
    return `crash:${failure.call}:${failure.error?.name ?? ""}`;
  }
  return `invariant:${failure.invariant}`;
}

function serializeFailure(base, failure) {
  const record = { ...base, kind: failure.kind };
  if (failure.kind === "crash") {
    record.call = failure.call;
    record.error = {
      name: failure.error?.name ?? "Error",
      message: failure.error?.message ?? String(failure.error),
      stack: typeof failure.error?.stack === "string" ? failure.error.stack.split("\n").slice(0, 4).join("\n") : undefined
    };
  } else {
    record.invariant = failure.invariant;
    record.detail = failure.detail;
  }
  return record;
}

// Stateful invariants (determinism, reuse equivalence) can't be reproduced on
// an isolated fresh parser, so only crashes and per-parse invariants shrink.
const SHRINKABLE = /^(?:crash:|invariant:(?:repeated_call_consistency|indices_out_of_bounds|empty_index_range|indices_overlap_or_unordered|empty_osis_entry|malformed_osis|osis_round_trip_divergence))/;

function shrinkInput(env, testCase, signature, maxAttempts = 400) {
  let attempts = 0;
  const reproduces = (candidate) => {
    attempts++;
    const parser = new env.ParserClass(env.lang);
    const { failures } = runCase(env, parser, { ...testCase, input: candidate, checks: { roundTrip: true } });
    return failures.some((f) => failureSignature(f) === signature);
  };
  let best = testCase.input;
  for (let chunk = Math.floor(best.length / 2); chunk >= 1 && attempts < maxAttempts; chunk = Math.floor(chunk / 2)) {
    let i = 0;
    while (i < best.length && attempts < maxAttempts) {
      const candidate = best.slice(0, i) + best.slice(i + chunk);
      if (candidate.length > 0 && reproduces(candidate)) {
        best = candidate;
      } else {
        i += chunk;
      }
    }
  }
  const normalized = best.replace(/\s+/g, " ").trim();
  if (normalized.length > 0 && normalized !== best && attempts < maxAttempts && reproduces(normalized)) {
    best = normalized;
  }
  return best;
}

// Throughput measurement: same generated inputs as fuzzing, but only parse and
// the two common output calls — no invariant checks, option randomization, or
// repeated calls. Generation time is excluded from the measurement.
function profileRun(env, parser, opts, rand) {
  let totalChars = 0;
  let totalNs = 0n;
  let errors = 0;
  for (let i = 0; i < opts.count; i++) {
    const input = pickGenerator(rand).gen(rand, env, opts);
    totalChars += input.length;
    const start = process.hrtime.bigint();
    try {
      parser.parse(input);
      parser.osis();
      parser.osis_and_indices();
    } catch {
      errors++;
    }
    totalNs += process.hrtime.bigint() - start;
  }
  const seconds = Number(totalNs) / 1e9;
  console.log("---");
  console.log(`Total strings: ${opts.count}`);
  console.log(`Total chars: ${totalChars}`);
  console.log(`Errors: ${errors}`);
  console.log(`Elapsed: ${seconds.toFixed(3)}s (parse + osis + osis_and_indices only)`);
  console.log(`Parses/sec: ${(opts.count / Math.max(seconds, 1e-9)).toFixed(2)}`);
  console.log(`KB/sec: ${(totalChars / 1024 / Math.max(seconds, 1e-9)).toFixed(1)}`);
  if (errors > 0) {
    process.exitCode = 1;
  }
}

function replay(env, file) {
  const lines = fs.readFileSync(file, "utf8").split("\n").filter((line) => line.trim().length > 0);
  let failed = 0;
  for (const [i, line] of lines.entries()) {
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      console.log(`  [${i}] skipping unparseable line`);
      continue;
    }
    const options = { ...DEFAULT_OPTIONS, ...(record.options || {}) };
    const parser = new env.ParserClass(env.lang);
    const { failures } = runCase(env, parser, {
      input: record.input,
      context: record.context ?? null,
      options,
      checks: { roundTrip: true, determinism: true, freshEquivalence: true }
    });
    const status = failures.length > 0 ? "STILL FAILING" : "passes";
    if (failures.length > 0) {
      failed++;
    }
    console.log(`  [${i}] ${status}: ${failures.map(failureSignature).join(", ") || "-"} ${JSON.stringify(record.input)}`);
  }
  console.log(`Replayed ${lines.length} records; ${failed} still failing.`);
  process.exitCode = failed > 0 ? 1 : 0;
}

// ## Main

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(usage());
    return;
  }

  const langPath = `../esm/lang/${opts.lang}.js`;
  let lang;
  try {
    lang = await import(langPath);
  } catch (error) {
    throw new Error(`Could not import language module at ${langPath}: ${error.message}`);
  }

  const parser = new bcv_parser(lang);
  default_next_regexp = parser.options.grammar.next;
  const books = buildKnownBooks(parser);
  const translations = buildKnownTranslations(parser);
  const optionValues = buildOptionValues(parser);
  const roundTripParser = new bcv_parser(lang);
  roundTripParser.set_options({ book_alone_strategy: "full", book_range_strategy: "include", book_sequence_strategy: "include" });

  const env = {
    lang,
    ParserClass: bcv_parser,
    books,
    translations,
    ...buildChapterData(parser, books),
    corpus: loadCorpus(opts.inputFile),
    checkOsis: buildOsisChecker(books),
    roundTripParser
  };

  if (opts.replayFile != null) {
    console.log(`Replaying ${opts.replayFile} (lang=${opts.lang})`);
    replay(env, opts.replayFile);
    return;
  }

  if (opts.profile) {
    console.log(`Profiling language=${opts.lang} count=${opts.count} seed=${opts.seed} corpus=${env.corpus.length}`);
    profileRun(env, parser, opts, mulberry32(opts.seed));
    return;
  }

  const rand = mulberry32(opts.seed);
  const failureRecords = [];
  const slowest = [];
  const generatorCounts = {};
  const optionKeyCounts = {};
  let failureCount = 0;
  let slowCount = 0;
  let totalChars = 0;
  let totalNs = 0n;
  let defaultOptionRuns = 0;

  // Direct, unmutated runs of any user-supplied inputs first.
  const directInputs = opts.inputFile != null
    ? fs.readFileSync(opts.inputFile, "utf8").split("\n").filter((line) => line.length > 0)
    : [];

  console.log(`Fuzzing language=${opts.lang} count=${opts.count} seed=${opts.seed} options-mode=${opts.optionsMode} corpus=${env.corpus.length}`);

  const iterations = directInputs.length + opts.count;
  for (let i = 0; i < iterations; i++) {
    let input;
    let generatorName;
    if (i < directInputs.length) {
      input = directInputs[i];
      generatorName = "input-file";
    } else {
      const generator = pickGenerator(rand);
      generatorName = generator.name;
      input = generator.gen(rand, env, opts);
    }
    generatorCounts[generatorName] = (generatorCounts[generatorName] || 0) + 1;

    const useRandomOptions = opts.optionsMode === "random" || (opts.optionsMode === "mix" && chance(rand, 0.5));
    const options = useRandomOptions ? randomOptionSet(rand, optionValues) : { ...DEFAULT_OPTIONS };
    if (!useRandomOptions) {
      defaultOptionRuns++;
    }
    for (const key of Object.keys(optionsDiff(options))) {
      optionKeyCounts[key] = (optionKeyCounts[key] || 0) + 1;
    }
    // Book-less inputs are mostly meaningless without a context, so the
    // contextual generator gets one far more often.
    const context = chance(rand, generatorName === "contextual" ? 0.7 : 0.12) ? genContext(rand, env) : null;
    const testCase = {
      input,
      context,
      options,
      checks: {
        roundTrip: true,
        determinism: i % 10 === 7,
        freshEquivalence: i % 10 === 3
      }
    };

    totalChars += input.length;
    const start = process.hrtime.bigint();
    const { failures } = runCase(env, parser, testCase);
    const elapsed = process.hrtime.bigint() - start;
    totalNs += elapsed;

    const ms = Number(elapsed) / 1e6;
    if (ms > opts.maxMsPerInput) {
      slowCount++;
    }
    if (slowest.length < 10 || ms > slowest[slowest.length - 1].ms) {
      slowest.push({ ms, iteration: i, length: input.length, input: input.slice(0, 80) });
      slowest.sort((a, b) => b.ms - a.ms);
      if (slowest.length > 10) {
        slowest.pop();
      }
    }

    for (const failure of failures) {
      failureCount++;
      const signature = failureSignature(failure);
      const base = {
        seed: opts.seed,
        iteration: i,
        lang: opts.lang,
        generator: generatorName,
        options: optionsDiff(options),
        context,
        input,
        signature
      };
      if (opts.shrink && SHRINKABLE.test(signature)) {
        base.shrunk = shrinkInput(env, testCase, signature);
      }
      failureRecords.push(serializeFailure(base, failure));
    }

    if (opts.verbose && i > 0 && i % 1000 === 0) {
      console.log(`  progress ${i}/${iterations} failures=${failureCount}`);
    }
  }

  const seconds = Number(totalNs) / 1e9;
  console.log("---");
  console.log(`Total strings: ${iterations}`);
  console.log(`Failures: ${failureCount}`);
  console.log(`Slow inputs (>${opts.maxMsPerInput}ms): ${slowCount}`);
  console.log(`Elapsed: ${seconds.toFixed(3)}s`);
  console.log(`Parses/sec: ${(iterations / Math.max(seconds, 1e-9)).toFixed(2)}`);
  console.log(`Chars/sec: ${(totalChars / Math.max(seconds, 1e-9)).toFixed(2)}`);

  if (opts.verbose) {
    console.log(`Generators: ${Object.entries(generatorCounts).map(([k, v]) => `${k}=${v}`).join(" ")}`);
    console.log(`Option sets: default=${defaultOptionRuns} random=${iterations - defaultOptionRuns}`);
    const coverage = Object.entries(optionKeyCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(" ");
    console.log(`Non-default option coverage: ${coverage || "none"}`);
  }

  if (slowest.length > 0 && slowest[0].ms > opts.maxMsPerInput) {
    console.log("Slowest inputs:");
    for (const s of slowest.filter((entry) => entry.ms > opts.maxMsPerInput)) {
      console.log(`  ${s.ms.toFixed(1)}ms [${s.iteration}] len=${s.length} ${JSON.stringify(s.input)}`);
    }
  }

  if (failureCount > 0) {
    fs.mkdirSync(path.dirname(path.resolve(opts.failureFile)), { recursive: true });
    fs.writeFileSync(opts.failureFile, failureRecords.map((r) => JSON.stringify(r)).join("\n") + "\n");
    console.log(`Wrote ${failureRecords.length} failure records to ${opts.failureFile}`);
    console.log("Failure samples:");
    for (const record of failureRecords.slice(0, 10)) {
      console.log(`  [${record.iteration}] ${record.signature}`);
      console.log(`    ${JSON.stringify(record.shrunk ?? record.input)}`);
    }
    console.log(`Replay with: node bin/fuzz_lang.js --lang ${opts.lang} --replay ${opts.failureFile}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

#!/usr/bin/env node
import { bcv_parser } from "../esm/bcv_parser.js";

function parseArgs(argv) {
  const out = {
    lang: "en",
    count: 10000,
    seed: Date.now() >>> 0,
    minLength: 8,
    maxLength: 120,
    verbose: false
  };

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
    if (arg.startsWith("--lang=")) {
      out.lang = arg.slice("--lang=".length);
      continue;
    }
    if (arg === "--lang") {
      out.lang = argv[++i];
      continue;
    }
    if (arg.startsWith("--count=")) {
      out.count = Number.parseInt(arg.slice("--count=".length), 10);
      continue;
    }
    if (arg === "--count") {
      out.count = Number.parseInt(argv[++i], 10);
      continue;
    }
    if (arg.startsWith("--seed=")) {
      out.seed = Number.parseInt(arg.slice("--seed=".length), 10) >>> 0;
      continue;
    }
    if (arg === "--seed") {
      out.seed = Number.parseInt(argv[++i], 10) >>> 0;
      continue;
    }
    if (arg.startsWith("--min-length=")) {
      out.minLength = Number.parseInt(arg.slice("--min-length=".length), 10);
      continue;
    }
    if (arg === "--min-length") {
      out.minLength = Number.parseInt(argv[++i], 10);
      continue;
    }
    if (arg.startsWith("--max-length=")) {
      out.maxLength = Number.parseInt(arg.slice("--max-length=".length), 10);
      continue;
    }
    if (arg === "--max-length") {
      out.maxLength = Number.parseInt(argv[++i], 10);
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
    out.seed = Number.parseInt(positional[2], 10) >>> 0;
  }

  if (!Number.isInteger(out.count) || out.count <= 0) {
    throw new Error("count must be a positive integer");
  }
  if (!Number.isInteger(out.minLength) || !Number.isInteger(out.maxLength) || out.minLength <= 0 || out.maxLength < out.minLength) {
    throw new Error("min-length and max-length must be positive integers with max >= min");
  }

  return out;
}

function usage() {
  return [
    "Usage:",
    "  node bin/fuzz_lang.js [lang] [count] [seed]",
    "  node bin/fuzz_lang.js --lang en --count 50000 --seed 42",
    "",
    "Options:",
    "  --lang <code>         Language code in esm/lang (default: en)",
    "  --count <n>           Number of random strings to parse (default: 10000)",
    "  --seed <n>            Deterministic PRNG seed (default: current time)",
    "  --min-length <n>      Minimum generated string length (default: 8)",
    "  --max-length <n>      Maximum generated string length (default: 120)",
    "  --verbose, -v         Print occasional sample strings",
    "  --help, -h            Show this help"
  ].join("\n");
}

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

function randomNoise(rand, targetLength) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.;:!?()-_/[]{}\\\"'\t";
  let out = "";
  for (let i = 0; i < targetLength; i++) {
    out += chars[randInt(rand, 0, chars.length - 1)];
  }
  return out;
}

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
  return [...books];
}

function buildKnownTranslations(parser) {
  const aliases = Object.keys(parser.translations.aliases || {});
  return aliases.filter((a) => typeof a === "string" && a.length > 0);
}

function referenceFragment(rand, parser, books, translations) {
  const book = pick(rand, books, "Gen");
  const chapters = parser.translations.systems.current?.chapters?.[book];
  const maxChapter = Array.isArray(chapters) && chapters.length > 0 ? chapters.length : 150;
  const c1 = randInt(rand, 1, Math.max(1, Math.min(maxChapter, 150)));
  const maxVerse = Array.isArray(chapters) && chapters[c1 - 1] ? chapters[c1 - 1] : 176;
  const v1 = randInt(rand, 1, Math.max(1, Math.min(maxVerse, 200)));
  const c2 = randInt(rand, c1, Math.max(c1, Math.min(maxChapter, c1 + 5)));
  const maxVerse2 = Array.isArray(chapters) && chapters[c2 - 1] ? chapters[c2 - 1] : 176;
  const v2 = randInt(rand, 1, Math.max(1, Math.min(maxVerse2, 200)));
  const t = pick(rand, translations, "");

  const forms = [
    `${book} ${c1}`,
    `${book} ${c1}:${v1}`,
    `${book} ${c1}-${c2}`,
    `${book} ${c1}:${v1}-${c2}:${v2}`,
    `${book} ${c1}:${v1}, ${v2}`
  ];
  const base = pick(rand, forms, `${book} ${c1}`);
  if (t.length > 0 && rand() < 0.35) {
    return `${base} ${t.toUpperCase()}`;
  }
  return base;
}

function fuzzString(rand, parser, books, translations, minLength, maxLength) {
  const target = randInt(rand, minLength, maxLength);
  let out = "";
  while (out.length < target) {
    if (rand() < 0.55) {
      out += referenceFragment(rand, parser, books, translations);
    } else {
      out += randomNoise(rand, randInt(rand, 3, 24));
    }
    if (out.length < target) {
      out += pick(rand, [" ", " ", ", ", "; ", " - ", " / "]);
    }
  }
  return out.slice(0, target);
}

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
  const books = buildKnownBooks(parser);
  const translations = buildKnownTranslations(parser);
  const rand = mulberry32(opts.seed);

  let failures = 0;
  let totalChars = 0;
  let totalNs = 0n;
  const failureSamples = [];

  console.log(`Fuzzing language=${opts.lang} count=${opts.count} seed=${opts.seed} min_length=${opts.minLength} max_length=${opts.maxLength}`);
  for (let i = 0; i < opts.count; i++) {
    const input = fuzzString(rand, parser, books, translations, opts.minLength, opts.maxLength);
    totalChars += input.length;

    const start = process.hrtime.bigint();
    try {
      parser.parse(input);
      parser.osis();
      parser.osis_and_indices();
    } catch (error) {
      failures++;
      if (failureSamples.length < 10) {
        failureSamples.push({
          index: i,
          input,
          error: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
        });
      }
    }
    totalNs += process.hrtime.bigint() - start;

    if (opts.verbose && i > 0 && i % 1000 === 0) {
      console.log(`  progress ${i}/${opts.count}`);
    }
  }

  const seconds = Number(totalNs) / 1e9;
  const perSecond = opts.count / Math.max(seconds, 1e-9);
  const charsPerSecond = totalChars / Math.max(seconds, 1e-9);

  console.log("---");
  console.log(`Total strings: ${opts.count}`);
  console.log(`Failures: ${failures}`);
  console.log(`Elapsed: ${seconds.toFixed(3)}s`);
  console.log(`Parses/sec: ${perSecond.toFixed(2)}`);
  console.log(`Chars/sec: ${charsPerSecond.toFixed(2)}`);

  if (failures > 0) {
    console.log("Failure samples:");
    for (const sample of failureSamples) {
      console.log(`  [${sample.index}] ${sample.error}`);
      console.log(`    ${JSON.stringify(sample.input)}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

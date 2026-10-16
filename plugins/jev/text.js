// Offsets use the parser's UTF-16, half-open character indices.
export function tokenize(text, offset = 0) {
  // Separate unspaced East Asian characters so phrase boundaries are selectable.
  // Preserve other word runs, every source character, and UTF-16 offsets.
  const pieces = [...text.matchAll(/[\p{L}\p{M}\p{N}]+(?:[’'][\p{L}\p{M}\p{N}]+)*|[^\s]/gu)]
    .flatMap(m => [...m[0].matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]\p{M}*|[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu)]
      .map(piece => ({ text: piece[0], start: offset + m.index + piece.index,
        end: offset + m.index + piece.index + piece[0].length })));
  return pieces.map((piece, id) => ({ id, ...piece }));
}

// Sentence starts are cut points for window packing. Unicode sentence
// boundaries cover every script's terminators and closing punctuation; the
// locale is the supplied parser's language. BCV spans are protected and
// neighboring windows supply context, so a split at an abbreviation is harmless.
export function sentences(text, protectedSpans = [], locale = 'en') {
  const starts = [...new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(text)]
    .map(s => s.index).filter(index => !protectedSpans.some(([start, end]) => start < index && index < end));
  return starts.map((start, index) => {
    const end = starts[index + 1] ?? text.length;
    return { text: text.slice(start, end), start, end, tokens: tokenize(text.slice(start, end), start) };
  });
}

// Up to 128 tokens of a neighboring window as source text, from its 'end' or
// 'start', so punctuation and spacing read as written rather than token-joined.
export function neighborText(window, side, limit = 128) {
  if (!window?.tokens.length) return '';
  const tokens = side === 'end' ? window.tokens.slice(-limit) : window.tokens.slice(0, limit);
  return side === 'end' ? window.text.slice(tokens[0].start - window.start)
    : window.text.slice(0, tokens.at(-1).end - window.start);
}

export function overlaps(a, b) {
  return a[0] < b[1] && b[0] < a[1];
}

// 'auto' packs whole sentences and paragraphs toward the token target;
// 'document' keeps the entire input as one window.
export function proseWindows(text, strategy = 'auto', protectedSpans = [], window_tokens = 1000, locale = 'en') {
  if (strategy === 'auto') {
    if (!Number.isSafeInteger(window_tokens) || window_tokens < 1) throw new Error('window_tokens must be a positive integer');
    if (!text) return [];
    // Pack complete sentences/paragraphs toward a soft target. Never cut a
    // known BCV proposal, or discard a unit merely because it is long.
    const boundaries = [...new Set([0, text.length,
      ...sentences(text, protectedSpans, locale).map(s => s.start),
      ...[...text.matchAll(/\r?\n[\t ]*\r?\n/g)].map(m => m.index + m[0].length)])]
      .filter(index => !protectedSpans.some(([start, end]) => start < index && index < end))
      .sort((a, b) => a - b);
    const tokens = tokenize(text), windows = [];
    let start = 0, tokenStart = 0, tokenEnd = 0, end = 0;
    const emit = () => {
      // A region with no tokens (whitespace between breaks) joins a neighbor
      // rather than becoming a window of its own.
      if (tokenEnd === tokenStart) {
        if (windows.length) Object.assign(windows.at(-1), { end, text: text.slice(windows.at(-1).start, end) });
        else return;
      } else {
        windows.push({ text: text.slice(start, end), start, end,
          tokens: tokens.slice(tokenStart, tokenEnd).map((token, id) => ({ ...token, id })) });
      }
      start = end; tokenStart = tokenEnd;
    };
    for (const boundary of boundaries.slice(1)) {
      let nextTokenEnd = tokenEnd;
      while (nextTokenEnd < tokens.length && tokens[nextTokenEnd].start < boundary) nextTokenEnd++;
      if (nextTokenEnd - tokenStart > window_tokens && end > start) emit();
      end = boundary; tokenEnd = nextTokenEnd;
      if (tokenEnd - tokenStart >= window_tokens) emit();
    }
    if (end > start) emit();
    return windows;
  }
  if (strategy === 'document') return text ? [{ text, start: 0, end: text.length, tokens: tokenize(text) }] : [];
  throw new Error('Unknown window strategy');
}

// Exclude enclosing parentheses from citation offsets without changing source text.
export function citationIndices(text, indices) {
  let [start, end] = indices;
  const pairs = { '(': ')', '（': '）' };
  while (pairs[text[start]] && pairs[text[start]] === text[end - 1]) {
    const open = text[start], close = pairs[open];
    let depth = 0, enclosesAll = true;
    for (let i = start; i < end; i++) {
      if (text[i] === open) depth++;
      else if (text[i] === close) depth--;
      if (depth === 0 && i < end - 1) { enclosesAll = false; break; }
    }
    if (!enclosesAll || depth !== 0) break;
    let innerStart = start + 1, innerEnd = end - 1;
    while (innerStart < innerEnd && /\s/u.test(text[innerStart])) innerStart++;
    while (innerStart < innerEnd && /\s/u.test(text[innerEnd - 1])) innerEnd--;
    if (innerStart === innerEnd) break;
    start = innerStart; end = innerEnd;
  }
  return [start, end];
}

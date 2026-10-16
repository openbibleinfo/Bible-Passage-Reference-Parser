const pointPattern = /^([1-4]?[A-Za-z]+)(?:\.(\d+))?(?:\.(\d+)(?:!([^\s.,!-]+))?)?$/;

// Recognition tables already reflect the supplied parser's language, custom
// books and testament filter. Versification tables alone do not filter books.
export function parserChapters(parser, system = parser.options?.versification_system ?? 'default') {
  const chapters = parser.translation_info(system).chapters;
  const patterns = parser.regexps?.books;
  const enabled = Array.isArray(patterns) ? new Set(patterns.flatMap(book => book.osis)) : new Set(Object.keys(chapters));
  const filtered = Object.fromEntries(Object.entries(chapters).filter(([book]) => enabled.has(book)));
  const testaments = parser.options?.testaments;
  // Psalms 1–150 and Psalm 151 follow the testaments option; a zero entry marks
  // a disabled chapter so that it stays rejected under any existence strategy.
  if (filtered.Ps && typeof testaments === 'string') {
    const psalm151 = parser.translation_info(system).chapters.Ps[150] ?? parser.translation_info(system).chapters.Ps151?.[0] ?? 7;
    filtered.Ps = [...filtered.Ps.slice(0, 150), testaments.includes('a') ? psalm151 : 0]
      .map((verses, i) => i < 150 && !testaments.includes('o') ? 0 : verses);
  }
  return filtered;
}

// Structural validity: an enabled book, positive numbers, enabled chapters and
// ordered endpoints. Chapter and verse EXISTENCE is not checked here: during
// resolution and in discourse state an address is not tied to a versification.
// Pass the parser's passage_existence_strategy to check existence as it does,
// which happens once, when a citation's resolution is complete.
export function parseReference(osis, chapters, existence = '') {
  if (typeof osis !== 'string') return null;
  const parts = osis.split('-');
  if (parts.length > 2) return null;
  const checkChapter = existence.includes('c'), checkVerse = existence.includes('v');
  const points = parts.map(part => {
    const match = pointPattern.exec(part);
    if (!match) return null;
    const [, book, c, v, versePart] = match;
    const table = chapters[book];
    const chapter = c ? Number(c) : null, verse = v ? Number(v) : null;
    if (!table || (chapter === null && table.some(n => n === 0)) || (verse !== null && chapter === null) || (chapter !== null && chapter < 1) || (verse !== null && verse < 1)) return null;
    // A zero entry marks a chapter disabled by the testaments option, not a missing chapter.
    if (chapter !== null && chapter <= table.length && !table[chapter - 1]) return null;
    if (checkChapter && chapter !== null && chapter > table.length) return null;
    if (checkVerse && verse !== null && chapter <= table.length && verse > table[chapter - 1]) return null;
    return { book, chapter, verse, ...(versePart ? { versePart } : {}) };
  });
  if (points.some(p => !p)) return null;
  const start = points[0], end = points.at(-1);
  if (start.book !== end.book || (start.chapter ?? 0) > (end.chapter ?? 0) ||
      (start.chapter === end.chapter && (start.verse ?? 0) > (end.verse ?? 0))) return null;
  if (start.chapter && end.chapter && chapters[start.book].slice(start.chapter - 1, end.chapter).some(n => n === 0)) return null;
  return { start, end, isRange: parts.length === 2 };
}

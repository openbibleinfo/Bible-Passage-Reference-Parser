import { choice } from './decisions.js';

// Display names are Bible metadata, not phrase-matching rules.
const names = 'Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation'.split('|');
const ids = 'Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');
export const BOOKS = Object.fromEntries(ids.map((id, i) => [id, names[i]]));
const APOCRYPHA = { Tob: 'Tobit', Jdt: 'Judith', GkEsth: 'Greek Esther', Wis: 'Wisdom of Solomon', Sir: 'Sirach (Ecclesiasticus)', Bar: 'Baruch', PrAzar: 'Prayer of Azariah', Sus: 'Susanna', Bel: 'Bel and the Dragon', SgThree: 'Song of the Three Young Men', EpJer: 'Letter of Jeremiah', '1Macc': '1 Maccabees', '2Macc': '2 Maccabees', '3Macc': '3 Maccabees', '4Macc': '4 Maccabees', '1Esd': '1 Esdras', '2Esd': '2 Esdras', PrMan: 'Prayer of Manasseh', Ps151: 'Psalm 151', AddEsth: 'Additions to Esther', AddDan: 'Additions to Daniel' };
// JEV sees readable references; candidate IDs and canonical values stay in JS.
export function referenceText(reference) {
  if (typeof reference !== 'string' || !reference) return reference;
  return reference.split(',').map(part => part.split('-').map(endpoint => {
    const [book, chapter, verse] = endpoint.split('.');
    return `${BOOKS[book] ?? APOCRYPHA[book] ?? book}${chapter ? ` ${chapter}` : ''}${verse ? `:${verse.replace('!', '')}` : ''}`;
  }).join('–')).join(', ');
}

const NONE = 'UNRESOLVED';

export function branches(answer, width, minimum) {
  const sorted = Object.entries(answer.probabilities).filter(([id]) => id !== NONE)
    .sort((a, b) => b[1] - a[1]);
  return sorted.filter(([id, p], i) => (i === 0 && answer.choice !== NONE) || p >= minimum)
    .slice(0, width);
}

export function hierarchyQuestions(chapters) {
  const books = Object.fromEntries(Object.keys(chapters).map(id => [id, BOOKS[id] ?? APOCRYPHA[id] ?? id]));
  return {
    scope: choice('What kind of target does the selected expression identify? Choose its target shape, without translating the wording into a predefined relative operation. Choose book or chapter only when the expression targets the ENTIRE book or chapter. A region within a chapter is approximate unless exact endpoints are justified; mentioning a chapter does not request all of it. A contiguous range of entire chapters is chapter_range; a specified count of consecutive verses is range; a specified offset can target one verse. A part of one verse has verse shape and is subdivided later. Do not invent precision. Read surrounding prose for the meaning.', {
      book: 'An entire Bible book', chapter: 'An entire chapter', verse: 'One verse',
      chapter_range: 'A contiguous range of entire chapters, with no verse endpoints',
      range: 'A contiguous passage with verse-level endpoints, potentially spanning chapters',
      approximate: 'A passage or region with approximate rather than exact boundaries',
      semantic: 'A passage identified by its described content, requiring semantic matching rather than citation or relative arithmetic',
      multiple: 'Several separate references, not one contiguous range',
      UNRESOLVED: 'Insufficient context to identify a target'
    }),
    book: choice('Which Bible book contains the target of the selected expression? If span names a book, use that written book even if it is a rejected alternative or contrast; do not replace it with the section topic. For a missing book, use the governing prose/background context. A local topic switch can override older discourse or window_reference; a rejected alternative is not a topic switch. That background need not contain a numeric citation or an accepted BCV match. Only books enabled by the supplied parser are offered. If the written or inferred book is not offered, or the prose does not justify a book, choose UNRESOLVED; do not substitute another book.', {
      ...books, UNRESOLVED: 'The target book is not established, or this reference cannot be resolved'
    }),
    subdivision: choice('Does span EXPLICITLY request only a subdivision of a target verse, such as its first half, ending words, or an unspecified part? Choose whole unless span actually requests less than the complete target verse. A verse is not a subdivision here just because it belongs to a chapter; a chapter, verse range, or list of complete verses is a whole target. Ignore merely reading, loving, or discussing verses; those verbs do not request subdivisions.', {
      whole: 'Complete target; default unless a verse subdivision is explicitly requested', first_part: 'First half or beginning part', second_part: 'Second half or ending part',
      unspecified_part: 'An explicitly requested part of a verse whose exact subdivision is not specified'
    })
  };
}

export async function chooseInterpretation({ evidence, entry, candidates, scope, ask,
  min_interpretation_probability = 0, subdivisionAnswer, alongside }) {
  const decision = async (stage, state, question) => {
    const answer = await ask(stage, state, question);
    entry.decisions[stage] = answer;
    return answer;
  };
  // Direct comparison supplies a distribution over complete interpretations.
  // Path products above are search scores, not calibrated posterior probabilities.
  const finalists = Object.fromEntries([...candidates.keys()].map((reference, i) => [`candidate_${i}`, reference]));
  // Work that only needs the likely target can join this request instead of
  // waiting for the verified one. The caller discards it if the choice differs.
  alongside?.([...candidates.entries()].reduce((best, pair) => pair[1] > best[1] ? pair : best)[0]);
  const final = await decision('interpretation', { ...evidence, target_shape: scope, candidates: Object.fromEntries(Object.entries(finalists).map(([id, ref]) => [id, referenceText(ref)])) }, choice((entry.endpoint_status === 'unresolved' ? 'The passage endpoint is unresolved. These candidates identify ONLY its beginning verse, not the entire passage. Verify the explicitly identified beginning and inherited book/chapter; an unspecified ending does not invalidate a justified beginning. ' : '') + 'Which complete target reference best matches span and its supporting context? Each candidate is a proposed TARGET, not an antecedent. For a numbered citation, compare its written chapter/verse values (Arabic or Roman) with the candidate, using preceding_context and the governing prose for inherited parts. Older discourse values are defaults, not authority over a local book/chapter switch. Reject a candidate that matches stale state but contradicts the current context. An inherited book or chapter is justified when that context supplies it; do not reject solely because span omits it or uses different numeral notation. Background prose explicitly naming the section’s Bible book is sufficient book evidence for an unqualified chapter/verse citation when there is no conflicting context. It need not appear in accepted references or selected_antecedent. Evaluate the complete candidate against the actual supplied evidence, including that background, and preserve uncertainty when the evidence genuinely conflicts or omits a required part. For a disjoint list, verify every member in written order, preserving gaps: separate verses are not the range between them. Choose UNRESOLVED if the list is missing a member or includes an unstated target. For relative references use selected_antecedent when supplied and verify the requested direction and extent. Choose UNRESOLVED if candidates miss the target or the evidence cannot justify choosing one. The candidate set may be incomplete.', {
    ...Object.fromEntries(Object.entries(finalists).map(([id, ref]) => [id, referenceText(ref)])), UNRESOLVED: 'None of these target references is sufficiently justified, or missing target/ambiguous context'
  }));
  const interpretations = Object.entries(finalists).map(([id, reference]) => ({ reference, probability: final.probabilities[id] }))
    .sort((a, b) => b.probability - a.probability);
  const result = { interpretations, unresolved_probability: final.probabilities.UNRESOLVED };
  if (final.choice === NONE) return { ...result, status: 'unresolved' };
  if (final.probabilities[final.choice] < min_interpretation_probability) return { ...result, status: 'ambiguous',
    reason: 'Top interpretation does not meet the experimental acceptance threshold' };
  const reference = finalists[final.choice];
  if (scope !== 'verse') return { ...result, status: 'resolved', canonical: reference };
  if (!subdivisionAnswer) throw new Error('Missing subdivision decision for a verse target');
  const subdivision = subdivisionAnswer;
  entry.decisions.subdivision = subdivision;
  return { ...result, status: 'resolved', canonical: reference,
    ...(subdivision.choice !== 'whole' ? { subdivision: subdivision.choice } : {}) };
}

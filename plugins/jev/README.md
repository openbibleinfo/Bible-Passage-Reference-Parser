# Jev Bible Passage Reference plugin

AI wrote this readme.

This Node.js ESM plugin adds contextual numeric Bible references to the existing Bible Passage Reference Parser (the BCV Parser). It handles expressions such as disconnected `(7)`, `Romans viii, 28`, and `verses four and six`. The BCV Parser finds mechanical references first; Jev reviews them, discovers other references, and resolves their targets using the input and optional caller context.

It also identifies translation abbreviations attached to AI-discovered citations and returns them in the BCV Parser's existing `translations` array. The supplied BCV Parser language module determines which abbreviations are recognized, including custom translations. Associated translations supply the versification system used to validate the reference.

The plugin uses focused choice questions batched in HTTP requests. Independent questions share a request or are sent concurrently; only questions whose evidence depends on an earlier answer wait for it. A typical single citation in a short input takes four sequential rounds (a verse in a one-chapter book such as Jude needs no chapter question); inputs with more than about 48 searchable tokens in a window take five, because asking every token's citation end in advance is only affordable in short windows. For long input, the plugin divides the text into smaller sections called windows.

All windows are searched for citations concurrently, then resolved in reading order, passing established reference context from each window to the next. For example, if one window discusses John chapter 3, a later window can use that context to interpret “verse 17” as John 3:17. Semantic passage descriptions and relative expressions requiring further resolution, such as “the next two verses,” are returned as diagnostics for you to handle how you like (possibly by escalating to a more-powerful, but slower, LLM).

Expected throughput is approximately 500 bytes per second (0.5 KB/s), based on two Jev 1.14 paragraph tests including API round trips. Throughput varies with citation complexity; large-document throughput has not been measured.

## Usage

The plugin is included in the BCV Parser's GitHub repository under `plugins/jev/` and requires Node.js 22.7 or newer. Supply a BCV Parser instance and a Jev client.

Set `OPENROUTER_API_KEY` in your environment for the default OpenRouter endpoint. This example assumes your script is in the repository root:

```js
import { bcv_parser } from "./esm/bcv_parser.js";
import * as en from "./esm/lang/en.js";
import { FuzzyReferenceParser, JevClient } from "./plugins/jev/index.js";

const bcv = new bcv_parser(en);
bcv.set_options({
  osis_compaction_strategy: "bc",
  sequence_combination_strategy: "separate"
});

const parser = new FuzzyReferenceParser({
  parser: bcv,
  decisions: new JevClient()
});

const text = "John 3:16 is a popular verse, but you should keep reading through 17.";
const result = await parser.parse(text);
console.log(result.osis_and_indices());
```

Jev should return exactly this array:

```json
[
  {
    "osis": "John.3.16",
    "translations": [""],
    "indices": [0, 9]
  },
  {
    "osis": "John.3.17",
    "translations": [""],
    "indices": [66, 68],
    "parser": "ai",
    "citation_confidence": 0.98,
    "target_confidence": 0.99
  }
]
```

The first object is the mechanical match for `John 3:16`. The second is Jev's interpretation of `17`, using the earlier citation as context. `text.slice(0, 9)` is `John 3:16`; `text.slice(66, 68)` is `17`. `translations: [""]` means no translation was specified. The two confidence fields only exist on AI interpretations.

## Context

Pass background information when the input needs context:

```js
const result = await parser.parse("Compare verse 6.", {
  context: "This section is about 1 John chapter 3."
});
```

Use a prose string when that is all you have, or a `DiscourseState` object when you already know the passage being discussed:

```js
const result = await parser.parse("Compare verse 6.", {
  context: {
    current_reference: "1John.3.5",
    recent_references: ["1John.3.5", "1John.3.4"],
    active_book: "1John",
    active_chapter: "1John.3",
    active_passage: "1John.3.1-1John.3.10"
  }
});
```

This supplies 1 John chapter 3 as context for interpreting “verse 6.” All fields are optional; you do not need to construct the complete object above. For example, `context: { active_chapter: "1John.3" }` supplies just a chapter.

All reference fields below use OSIS strings; `recent_references` is an array of those strings.

| Field | Format and meaning |
| --- | --- |
| `current_reference` | An OSIS string for the most recently established citation, such as `1John.3.5`. |
| `recent_references` | An array of earlier OSIS references, most recent first. These are possible antecedents, not references to return. |
| `active_book` | The book currently being discussed, as an OSIS book identifier such as `1John`. |
| `active_chapter` | The chapter currently being discussed, such as `1John.3`. |
| `active_passage` | The broader passage under discussion, as an OSIS reference or range such as `1John.3.1-1John.3.10`. It provides context rather than restricting the allowed targets. |

Invalid structured references are rejected before model calls. Omit unknown fields, or use `null` for the singular reference fields and `[]` for `recent_references`. The plugin derives the active book and chapter from `current_reference`, or from `active_passage` when no current reference is supplied; keep supplied fields consistent.

A book mentioned as background can supply context for a later verse even when the mention itself is not a citation. An unresolved citation does not become an established antecedent.

The plugin updates this context as it reads. To continue with another piece of text, pass the returned state: `await parser.parse(nextText, { context: result.state })` (where `result` is the result of the previous call). Returned state contains structured reference fields; it does not retain background prose. State and caller context are checked for structure and enabled books only, never against chapter or verse counts, since an address in discourse is not tied to one versification. A citation that exists only under its attached translation, such as `Rev.12.18` in the NLT, is stored as is and accepted when passed back. Chapter and verse existence is checked once per citation, after its translation is settled, against that translation's versification or the parser's default, following the parser's `passage_existence_strategy`. Candidate menus are drawn from the configured versification tables.

The API also accepts a `text` property on the context object. Internally, a prose `context` string is wrapped as `{ text: context }`, then that text is separated from the structured state and passed to Jev as background context. You do not need this property when supplying structured reference context.

## Output

`result.osis_and_indices()` returns an array preserving the BCV Parser's required `osis`, `translations`, and `indices` fields. `result.references` exposes the same compact data; `result.osis()` joins the primary targets. AI interpretations add `parser: ai`, `citation_confidence`, `target_confidence`, and positive-probability `alternates` when available. Accepted mechanical references omit these additions.

For example, an ambiguous reference can retain two interpretations:

```js
{
  osis: "John.3.6",
  translations: [""],
  indices: [10, 17],
  parser: "ai",
  citation_confidence: 0.95,
  target_confidence: 0.6,
  alternates: [{ osis: "Num.3.6", target_confidence: 0.4 }]
}
```

`citation_confidence` is the classification probability assigned to BIBLE_REFERENCE. `target_confidence` is the final address-selection probability. They remain separate: confidence in an address does not establish that the expression is a Bible citation. Alternatives use `target_confidence` and share the primary citation confidence. Detailed AI records retain `citation_confidence` even when no target is returned. No combined confidence is calculated, and the context eligibility threshold applies to target confidence.

Treat `citation_confidence` below 0.80 cautiously: this empirical caution threshold comes from development tests where lower scores frequently identified non-citations. The plugin still returns usable targets below this threshold.

The most likely usable interpretation is returned even if confidence is low. Alternatives share its offsets and translations. Probabilities are conditional on the offered candidates and are not calibrated correctness guarantees. References with no usable target, rejected non-references, and deferred expressions appear in `parsed_entities()` rather than the compact reference array.

The primary `target_confidence` and its alternates do not necessarily sum to 1. The compact output omits the model's `UNRESOLVED` option without renormalizing: a reference with probability 0.98 and no alternates can have the remaining 0.02 assigned to `UNRESOLVED`. When an interpretation decision is available, `parsed_entities()[i].ai.decisions.interpretation.probabilities` preserves that score. `UNRESOLVED` means none of the offered targets is sufficiently justified, which can reflect insufficient context or a missing candidate rather than a non-reference.

`text.slice(...reference.indices)` retrieves the citation. Input is treated as raw text, including HTML attributes and references spanning tags, such as `John<br>21`. Your application decides whether a returned span is suitable for markup. The plugin does not parse or sanitize HTML.

### Diagnostics

`result.parsed_entities()` returns an independent diagnostic array using existing BCV Parser fields where available. It preserves mechanical syntax and nested entities, adding plugin information under `ai`; it does not change the supplied parser's own method. AI results add `parser: ai` and expose alternatives. Unresolved diagnostic records use `osis: ""`. `ai` includes resolution/review status, keyed `decisions`, source `origin`, associated versification `system`, translation association, boundary information, and escalation details. Probability maps omit zero-value entries; meaningful zeros in offsets and other fields remain.

`ai.origin` identifies which supplied string contains the record's citation. It tells you which string to use with `indices`:

| `ai.origin` | Source of the citation and its offsets |
| --- | --- |
| `input` | The text passed as the first argument to `parse()`, also available as `result.text`. |
| `context` | The background prose passed through the `context` option: either the context string itself or the context object's `text` property. |

For example, with `parser.parse("Compare verse 17.", { context: "John 3:16" })`, a diagnostic record for `John 3:16` has `ai.origin: context` and indices `[0, 9]` into `John 3:16`. The discovered `verse 17` record has `ai.origin: input` and indices `[8, 16]` into `Compare verse 17.`. The background citation supplies interpretation context; only the input citation can appear in `osis_and_indices()`. That compact array always uses input offsets and therefore does not need an origin field.

Both mechanical and AI-discovered input records have `ai.origin: input`. The separate `parser: ai` field identifies an AI-discovered record. Structured context fields such as `active_chapter` do not create citation records or offsets by themselves.

For further inspection, the result exposes `bcv_matches`, `context_bcv_matches`, `explicit`, `state`, and `judgments`.

The overall `result.status` describes whether the pipeline finished processing the input:

| `result.status` | Meaning |
| --- | --- |
| `complete` | Processing finished. Individual expressions can still be ambiguous, unresolved, or deferred. |
| `incomplete` | Some windows or candidates were left unprocessed. `result.issues` explains why; usable references can still be returned. |

Each AI-discovered record returned by `result.parsed_entities()` has a status in its `ai.status` field. Identify these records by `parser: ai`; the array also includes mechanical and context records:

| Expression status | Meaning | Compact reference output |
| --- | --- | --- |
| `resolved` | An interpretation was accepted as established reference context. | Includes its target. |
| `ambiguous` | An interpretation is available but was not accepted as established context. | Includes the most likely usable target and any alternatives, when available. |
| `unresolved` | The pipeline could not establish a usable interpretation. | Omitted; the detailed record uses `osis: ""`. |
| `not_a_bible_reference` | The discovered expression was classified as a non-reference. | Omitted; the detailed record uses `osis: ""`. |
| `needs_search` | Resolution was deferred, for example for a semantic description, relative expression, or list exceeding the supported size. | Omitted; the detailed record uses `osis: ""`. No search or escalation is performed automatically. |

These records retain `indices` into the original input, decision probabilities under `ai.decisions`, and any resolution reasons or escalation details under `ai`. They describe discovered expressions, not every token considered during detection.

Mechanical proposals also appear in `parsed_entities()`, including rejected ones. Their review outcome is `ai.review.choice`: `ACCEPT` keeps the proposal, `REOPEN` sends its text for reinterpretation, and `REJECT` excludes it as a non-reference. A proposal that could not be reviewed has `ai.review_status: unreviewed`. A rejected mechanical record retains its proposed `osis` for inspection; its presence in this detailed array does not mean it was accepted into `osis_and_indices()`.

`unreviewed` occurs when a proposal's review window exceeds a caller-configured `max_tokens_per_window` limit. The plugin skips that review, retains the proposal in diagnostics, and excludes it from `osis_and_indices()`. The overall result is `incomplete`, with an explanation in `issues`. The default limit is 64,000 tokens, Jev's documented request limit, so ordinary input never reaches it. Setting `review_bcv_matches: false` accepts mechanical proposals directly rather than marking them unreviewed.

### Escalations

When a passage has a known beginning but an unresolved endpoint, the compact output returns the beginning verse. For example, "John 18:1 says one thing. But compare verses 5 and following" can return `John.18.5`. Its diagnostic record has `ai.endpoint_status: unresolved`, and an escalation preserves the full expression for further resolution. The returned verse identifies the beginning, not the full extent of the passage.

`result.escalations` is an array of expressions that the plugin identified as references but deferred because they need semantic or relative resolution. It packages the expression and its supporting context so your application can pass them to another resolver, ask a stronger model, or present them for human review. The plugin does not perform any of those follow-up actions.

| `type` | Work left to do | Example |
| --- | --- | --- |
| `semantic_resolution` | Identify a passage from its content or establish an imprecise extent. | “the passage about the wedding at Cana” or “the next few verses” |
| `relative_resolution` | Resolve a displacement or pointer using the surrounding reference context. | “the next two verses” after a named citation |

Each entry contains:

| Field | Meaning |
| --- | --- |
| `type` | One of the resolution categories above. |
| `expression` | The referring phrase found in the input. |
| `indices` | The phrase's start and end positions in `result.text`; `result.text.slice(...indices)` retrieves it. |
| `context` | Evidence for the follow-up resolver: the current `window_text`, caller's `background_context`, neighboring `preceding_context` and `following_context`, any `selected_antecedent`, `accepted_references`, and established `discourse` state. References in this evidence are formatted for readability. |

For example, given `John 3:16 is quoted here. Compare the next two verses.`, a relative escalation would package `the next two verses` together with the surrounding citation. Your application could use that evidence to resolve the phrase to John 3:17–18. Until further resolution, the phrase has no target in `osis_and_indices()`; its diagnostic record has `ai.status: needs_search` and includes the same escalation under `ai.escalation`.

Only expressions with an escalation record enter this array. Other unresolved cases, such as a missing book or a list exceeding the supported size, remain in `parsed_entities()` and may require your application's handling as well. An empty `escalations` array therefore means no semantic or relative work was packaged, not that every reference was resolved.

## Translations

Translation labels are returned in the existing `translations` array. Supported abbreviations follow the supplied BCV Parser's language module, including custom `add_translations()` registrations.

```js
const result = await parser.parse(
  "Revelation 12:17 (ESV) contains part of verse 18 (NLT)."
);
console.log(result.osis_and_indices());
```

One observed response was:

```json
[
  {
    "osis": "Rev.12.17",
    "translations": ["ESV"],
    "indices": [0, 22]
  },
  {
    "osis": "Rev.12.18",
    "translations": ["NLT"],
    "indices": [40, 48],
    "parser": "ai",
    "citation_confidence": 0.97,
    "target_confidence": 0.91
  }
]
```

The associated translation's chapter and verse limits are used to validate the address; otherwise, the BCV Parser's configured system is used. Here NLT permits Revelation 12:18. Citation offsets can exclude the translation label.

A translation label can precede or follow its citation when the surrounding prose explicitly connects them. Labels attached to other citations or mentioned only in background prose are not inherited.

When no translation can be confidently associated, `translations` is `[""]`. Uncertain associations are described in `parsed_entities()` under `ai.translation_association`.

## Partial verses

For partial verses, set the BCV Parser option `osis_compaction_strategy: bcp`. AI subdivisions can then produce targets such as `John.3.6!a` and `John.3.6!b`. These letters identify subdivisions without guaranteeing equal halves. With whole-verse compaction, the compact target remains the whole verse; rich diagnostics retain subdivision information.

## Configuration

`new JevClient({ api_key, endpoint, model, fetch, timeout_ms })` accepts:

| Option | Default | Purpose |
| --- | --- | --- |
| `api_key` | Provider environment variable | Optional explicit credential override. |
| `endpoint` | `https://openrouter.ai/api/alpha/decisions` | Complete URL for a compatible Decisions API. |
| `model` | Depends on endpoint | Defaults to `jev-latest` for `api.typesafe.ai`, otherwise `~typesafe/jev-latest`. An explicit model overrides the default. |
| `fetch` | Global `fetch` | Optional custom HTTP transport. |
| `timeout_ms` | `60000` | Timeout for each HTTP request. |

The OpenRouter default uses its [`~typesafe/jev-latest` alias](https://openrouter.ai/~typesafe/jev-latest), including the leading `~`. Aliases can change the model and its probabilities without a code update. For reproducible evaluations, pass `model: "typesafe/jev-1.14"` or `model: "typesafe/jev-1.13"` explicitly. The direct TypeSafe alias has its own release schedule; check the response model rather than assuming the aliases serve the same version.

With no `api_key` option, the client reads `OPENROUTER_API_KEY` for an `openrouter.ai` endpoint, and `TYPESAFE_API_KEY` for other endpoints. An explicit `api_key` takes precedence. The client fails at construction if no usable key is available; it never substitutes one provider's key for another's. These names follow the [OpenRouter quickstart](https://openrouter.ai/docs/quickstart) and [TypeSafe JavaScript SDK](https://docs.typesafe.ai/sdk/javascript). Environment variables are read directly; `.env` files must be loaded by the application or Node's `--env-file` option.

For the direct TypeSafe API, set `TYPESAFE_API_KEY` and the endpoint. The model defaults to `jev-latest`; optionally specify a pinned model such as `jev-1.13.0`, as listed in the [TypeSafe model documentation](https://docs.typesafe.ai/models):

```js
const decisions = new JevClient({
  endpoint: "https://api.typesafe.ai/v1/systemone"
});
```

The adapter sends `Authorization: Bearer <api_key>`. A custom provider must accept the state/questions protocol and return choice distributions; a chat-completions endpoint cannot substitute for it. Set the key and model for the selected provider. Transport failures and malformed responses reject the parse, with no automatic retry. Some requests are sent concurrently, so a custom `fetch` must accept overlapping calls, and when one request fails another may still complete and be billed before the rejection reaches you.

`new FuzzyReferenceParser({ parser, decisions, ...options })` supports:

The supplied BCV Parser's `testaments` setting applies to mechanical matches and AI targets. To include apocrypha, configure that instance with `parser.set_options({ testaments: "ona" })`; the default `on` excludes them, including Psalm 151. AI candidates and chapter/verse validation use the same enabled books, including when an attached translation selects another versification system.

AI-discovered references may not respect every option configured on the supplied BCV Parser. Only the option interactions documented here are supported.

| Option | Default | Purpose |
| --- | --- | --- |
| `window_strategy` | `auto` | Packs intact sentences and paragraphs toward `window_tokens` while protecting BCV Parser spans. `document` keeps the entire input as one window. |
| `window_tokens` | `1000` | Target window size in the plugin's text tokens, not provider billing tokens. Automatic packing can exceed it for an intact long sentence. |
| `max_tokens_per_window` | `64000` | Hard processing limit, set to Jev's documented 64,000-token request limit. Oversized windows are skipped and reported as incomplete; proposals that cannot be reviewed are not accepted. A window this large would exceed the limit in model tokens before the plugin's count reached it, so the cap is a backstop, not a measured maximum. |
| `max_spans_per_window` | `64` | Discovery limit; truncation is reported as incomplete. |
| `review_bcv_matches` | `true` | Reviews mechanical proposals before accepting, reopening, or rejecting them. |
| `min_start_probability` | `0.08` | Retrieval floor: a token whose START probability is at least this value becomes a citation-start candidate even when the model's choice was NOT_START, so weak starts are not lost before boundary and interpretation questions. A second, fixed threshold of 0.2 governs conflicts between candidates: a candidate with START below 0.2 that encloses a start the model chose (its answer was START) yields to that start and is dropped. Candidates at or above 0.2 keep their spans. |
| `min_interpretation_probability` | `0.85` | Eligibility for an AI target to become established context. Does not directly filter primary targets from compact output. |
| `min_translation_probability` | `0.5` | Minimum probability for an AI-selected translation label, set independently when tuning translation association. |

The retrieval/context thresholds (0.08, 0.2, 0.85) and the 1,000-token window target were chosen empirically from live benchmark and review runs against Jev, not derived from the model's documentation. The 0.5 translation cutoff was similarly chosen empirically. These settings reflect Jev's observed probability distributions on those test cases and may need re-tuning for another model or corpus. The 64,000-token cap is the one documented provider limit.

Boundary review and batched scheduling are always enabled. Detection for every window is in flight at once, so a long document briefly opens one HTTP request per window. `document` keeps the entire input in one window; the automatic default handles longer input without requiring callers to split it. Window sizes use the plugin's text tokenizer and do not predict the provider's billed token count.

The 1,000-token target is a conservative default to retain useful context while keeping request size and latency manageable; we have not validated larger windows. Follow-ups usually resend the current window as context, and instructions and answer choices add overhead: recent testing saw requests around 2,000–8,000 model tokens. [Jev's direct API limits](https://docs.typesafe.ai/models) are 64,000 model tokens for state plus all questions, and 32,000 for state plus the longest individual question. The window target is not a model-token limit or a cap on document length.

Concurrent plugin parses can share a configured BCV Parser instance: the plugin copies mechanical results before awaiting Jev. Keep that parser's options and translation registrations unchanged while parses are in progress; use separate instances when calls need different configurations. The plugin uses the supplied parser internally, so its own last-parse state may change. A `JevClient` can also be shared. Billing accounting and logging are left to the application.

## Known limitations

- A book name that begins a sentence as its subject, such as “Ezra mentions in ii:65”, can be retrieved as the start of the citation, so the returned span may include the subject and verb. The target is still correct.
- A translation label is associated with a citation only when it is written within 48 characters of it. A label further away, or one that belongs to a different clause, is not asked about.
- Candidate chapters and verses are drawn from the configured versification tables. A chapter that exists only in another system, such as Daniel 13 in the Vulgate, is offered only when a recognized translation label selects that system.
- An AI-selected translation label must reach `min_translation_probability` before its versification is used; a lower score leaves a translation-only verse unresolved.

## Offline tests

From the repository root, run:

```sh
npm --prefix plugins/jev test
```

These tests use the repository's English parser. They require no API keys or network access and check API behavior, reference validation, offsets, and batching with scripted responses; they do not measure model accuracy.

## Demo

`demo.js` runs the John 3:16 example above and prints its compact references.

From the repository root, run:

```sh
export OPENROUTER_API_KEY=your-provider-key
node plugins/jev/demo.js
```

The demo uses the repository's English parser and makes live, billable API calls. Set `JEV_ENDPOINT` and optionally `JEV_MODEL` to use a different endpoint.

import type { BCVParserOptions, GrammarMatchInterface } from "./types";

// The Peggy plugin returns regexp matches as string arrays. Most are consumed inside grammar rules, but a standalone sequence separator can reach the top-level result and is intentionally ignored by `bcv_passage`.
export type GrammarParseResult = Array<GrammarMatchInterface | string[]>;

export function parse(input: string, options: BCVParserOptions["grammar"]): GrammarParseResult;

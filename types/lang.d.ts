import type { BCVParserOptions, BCVRegExpsInterface, BCVTranslationsInterface } from "./types";

export type GrammarOptions = BCVParserOptions["grammar"];

export interface LanguageModule {
	grammar_options: GrammarOptions;
	regexps: new () => BCVRegExpsInterface;
	translations: new () => BCVTranslationsInterface;
}

export const grammar_options: GrammarOptions;
export const regexps: new () => BCVRegExpsInterface;
export const translations: new () => BCVTranslationsInterface;

import bcv_regexps from "./bcv_regexps";
import bcv_translations from "./bcv_translations";
import * as bcv_grammar from "./bcv_grammar";

export const regexps = bcv_regexps;
export const translations = bcv_translations;
export const grammar = { parse: bcv_grammar.parse };

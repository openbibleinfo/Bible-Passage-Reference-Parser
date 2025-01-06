export declare class bcv_parser {
	constructor(lang: BCVParserConstructor);
	parse(s: string);
	parse_with_context(s: string, context: string);
	set_options(options: {});
	include_apocrypha(boolean);
	translation_info(translation);
	osis(): string;
	osis_and_translations(): string[][];
	osis_and_indices(): OsisAndIndicesInterface[];
	parsed_entities(): unknown[];
	add_books(unknown): void;
	add_translations(unknown): void;
}

interface BCVParserConstructor {
	grammar: unknown;
	regexps: BCVRegExpsInterface;
	translations: BCVTranslationsInterface;
}

interface OsisAndIndicesInterface {
	osis: string;
	indices: number[];
	translations: string[]
}
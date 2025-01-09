export declare class bcv_parser {
	constructor(lang: BCVParserConstructor);
	parse(string_to_parse: string);
	parse_with_context(string_to_parse: string, context: string);
	set_options(options: unknown);
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
	regexps: unknown;
	translations: unknown;
}

interface OsisAndIndicesInterface {
	osis: string;
	indices: number[];
	translations: string[]
}
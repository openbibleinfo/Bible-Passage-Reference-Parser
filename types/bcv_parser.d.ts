import type { AddBooksInterface, AddTranslationsInterface, BCVParserConstructor, OsisAndIndicesInterface, OsisEntityInterface, PartialOptions, PublicTranslationInterface } from "./types";

export declare class bcv_parser {
	constructor(lang?: BCVParserConstructor | null);
	parse(string_to_parse: string);
	parse_with_context(string_to_parse: string, context: string);
	set_options(options: PartialOptions): this;
	include_apocrypha(include_apocrypha: boolean): this;
	translation_info(translation?: string): PublicTranslationInterface;
	osis(): string;
	osis_and_translations(): [string, string][];
	osis_and_indices(): OsisAndIndicesInterface[];
	parsed_entities(): OsisEntityInterface[];
	add_books(books: AddBooksInterface): void;
	add_translations(translations: AddTranslationsInterface): void;
}

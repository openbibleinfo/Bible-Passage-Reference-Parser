import globals from "globals";
import tseslint from "typescript-eslint";

const formattingRules = {
	"array-bracket-spacing": ["error", "never"],
	"block-spacing": ["error", "always"],
	"brace-style": ["error", "1tbs", { "allowSingleLine": true }],
	"comma-spacing": ["error", { "before": false, "after": true }],
	"eol-last": ["error", "always"],
	"keyword-spacing": ["error", { "before": true, "after": true }],
	"no-mixed-spaces-and-tabs": "error",
	"no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
	"no-trailing-spaces": "error",
	"object-curly-spacing": ["error", "always"],
	"quotes": ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": true }],
	"semi": ["error", "always"],
	"space-before-blocks": ["error", "always"],
	"space-before-function-paren": ["error", "never"],
	"space-in-parens": ["error", "never"]
};

const commonFormattingRules = {
	...formattingRules,
	"object-curly-spacing": "off"
};

const lowRiskCorrectnessRules = {
	"no-constant-condition": "error",
	"no-dupe-else-if": "error",
	"no-duplicate-case": "error",
	"no-empty": ["error", { "allowEmptyCatch": true }],
	"no-extra-boolean-cast": "error",
	"no-fallthrough": "error",
	"no-irregular-whitespace": "error",
	"no-loss-of-precision": "error",
	"no-sparse-arrays": "error",
	"no-unreachable": "error",
	"use-isnan": "error",
	"valid-typeof": "error"
};

const reviewedCorrectnessRules = {
	"eqeqeq": ["error", "always", { "null": "ignore" }],
	"no-self-compare": "error",
	"no-template-curly-in-string": "error",
	"no-useless-concat": "error",
	"no-useless-rename": "error",
	"no-useless-return": "error"
};

const typescriptRules = {
	"@typescript-eslint/no-empty-object-type": "error",
	"@typescript-eslint/no-wrapper-object-types": "error",
	"@typescript-eslint/prefer-as-const": "error"
};

export default [
	{
		ignores: [
			"node_modules/**",
			"esm/**",
			"cjs/**",
			"js/**",
			"types/**",
			"lib/**",
			"bg/**",
			".coverage-v8/**"
		]
	},
	{
		files: ["src/**/*.ts"],
		plugins: {
			"@typescript-eslint": tseslint.plugin
		},
		languageOptions: {
			ecmaVersion: 2020,
			parser: tseslint.parser,
			sourceType: "module",
			globals: globals.node
		},
		rules: {
			...formattingRules,
			...lowRiskCorrectnessRules,
			...reviewedCorrectnessRules,
			...typescriptRules,
			"brace-style": "off",
			"indent": "off"
		}
	},
	{
		files: ["src/**/*.js", "test/**/*.js", "test/**/*.cjs"],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.jasmine,
				...globals.node
			}
		},
		rules: {
			...commonFormattingRules,
			...lowRiskCorrectnessRules,
			...reviewedCorrectnessRules,
			"indent": ["error", "tab", { "SwitchCase": 1 }]
		}
	},
	{
		files: ["bin/**/*.js"],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: "module",
			globals: globals.node
		},
		rules: {
			...commonFormattingRules,
			...lowRiskCorrectnessRules,
			...reviewedCorrectnessRules,
			"indent": ["error", 2, { "SwitchCase": 1 }]
		}
	},
	{
		files: ["test/**/*.cjs"],
		languageOptions: {
			sourceType: "commonjs"
		}
	}
];

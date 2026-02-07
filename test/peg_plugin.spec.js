"use strict";
import { use } from "../src/peg_plugin.js";

describe("peg_plugin auto coverage", () => {
	function makeConfig() {
		return { passes: { generate: [] } };
	}

	function runPlugin(ast) {
		const config = makeConfig();
		use(config, {});
		expect(config.passes.generate.length).toBe(1);
		config.passes.generate[0](ast);
	}

	it("rewrites option-backed parser functions", () => {
		const ast = {
			code: {
				children: [
					{
						name: "ab",
						children: [
							"  function peg$parseab() {\n",
							"    return peg$FAILED;\n",
							"  }\n"
						]
					}
				]
			}
		};

		runPlugin(ast);
		const body = ast.code.children[0].children.join("");
		expect(body).toContain("if (res = options.ab.exec(input.substring(peg$currPos)))");
		expect(body).toContain("return peg$FAILED;");
	});

	it("rewrites fixed-regexp parser functions", () => {
		const ast = {
			code: {
				children: [
						{
							name: "integer_value",
							children: [
								"  function peg$parseinteger_value() {\n",
								"    return peg$FAILED;\n",
								"  }\n"
							]
						}
					]
				}
			};

		runPlugin(ast);
		const body = ast.code.children[0].children.join("");
		expect(body).toContain("/^[0-9]{1,3}(?![0-9]|,000)/.exec(input.substring(peg$currPos))");
		expect(body).not.toContain("options.integer_value.exec");
	});

	it("handles multiple rewrite targets and leaves non-targets untouched", () => {
		const ast = {
			code: {
				children: [
					{
						name: "not_matched",
						children: [
							"  function peg$parsenot_matched() {\n",
							"    return 123;\n",
							"  }\n"
						]
					},
					{
						name: "space",
						children: [
							"  function peg$parsespace() {\n",
							"    return peg$FAILED;\n",
							"  }\n"
						]
					},
					{
						name: "ordinal",
						children: [
							"  function peg$parseordinal() {\n",
							"    return peg$FAILED;\n",
							"  }\n"
						]
					}
				]
			}
		};

		runPlugin(ast);

		const untouched = ast.code.children[0].children.join("");
		expect(untouched).toContain("return 123;");

		const spaceBody = ast.code.children[1].children.join("");
		expect(spaceBody).toContain("options.space.exec");

		const ordinalBody = ast.code.children[2].children.join("");
		expect(ordinalBody).toContain("options.ordinal.exec");
	});
});

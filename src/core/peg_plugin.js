// This plugin overwrites certain Peggy.js functions we care about so that we can specify regexps at runtime instead of compile time. This approach can break some of the performance guarantees that PEGs provide, but the runtime flexibility to support many languages is worth it.

// The key is the Peggy function name. The value is the relevant option name or a RegExp to use and never be overridden.
const function_matches = {
	"ab": "ab",
	"c_explicit_value": "c_explicit",
	"c_sep_value": "c_sep",
	"cv_sep": "cv_sep",
	"cv_sep_weak": "cv_sep_weak",
	"ff_value": "ff",
	"in_book_of": "in_book_of",
	"integer_value": /^[0-9]{1,3}(?![0-9]|,000)/,
	"next_value": "next",
	"ordinal": "ordinal",
	"range_sep": "range",
	"sequence_sep": "sequence",
	"space": "space",
	"title_value": "title",
	"v_explicit_value": "v_explicit",
};

// This function recursively identifies the functions we're looking for and creates a list of offsets that can be applied in the correct order (last ones first) to rewrite the functions to use the specified RegExps.
function set_generate_options(accum, node, level=0, current_node="") {
	// If it's `-1`, we know we're not interested in it.
	let start_splice = -1;
	// The index `i` is the main thing we're interested in.
	for (const [i, child] of node.children.entries()) {
		let match;
		if (typeof child === "string") {
			// If the function is ending, then save the offsets.
			if (level === 1 && current_node && child === "  }\n") {
				const end_splice = i;
				accum.unshift({
					parent: node.children,
					start: start_splice,
					end: end_splice,
					name: current_node,
				});
				start_splice = -1;
				current_node = "";
			// If we're only one level deep (which is where all the functions live) and we haven't started keeping track of the offsets, start now. This is the first line inside the function we're replacing.
			} else if (
				level === 1 &&
				current_node &&
				start_splice === -1) {
					start_splice = i;
			} else {
				// nothing
			}
		// If it's an object, then we want to recurse into it.
		} else {
			// Grab the `child.name` if it matches one we're interested in. We'll further process it in a future loop iteration.
			if (function_matches[child.name] != null) {
				current_node = child.name;
			}
			// Do the recursion.
			current_node = set_generate_options(accum, child, level + 1, current_node);
		}
	}
	return current_node;
}

// Replace the existing code with new RegExp-based code.
function apply_accum(accum) {
	for (const { parent, start, end, name } of accum) {
		let regexp_code = function_matches[name];
		// If it's a string, we wnat to use the value in `options`.
		if (typeof regexp_code === "string") {
			regexp_code = "options." + regexp_code;
		} else if (regexp_code == null) {
			parent.splice(start, end - start, []);
			continue;
		// If it's a RegExp, it's not configurable, and we want to use it directly.
		} else {
			regexp_code = regexp_code.toString();
		}
		const code = [
			"    let res;\n",
			`    if (res = ${regexp_code}.exec(input.substring(peg$currPos))) {\n`,
			"      peg$savedPos = peg$currPos;\n",
			"      peg$currPos += res[0].length;\n",
			`      return [res[0]];\n`,
			"    } else {\n",
			"      return peg$FAILED;\n",
			"    }\n"
		];
		parent.splice(start, end - start, ...code);
	}
}

// This is what Peggy uses to apply the overrides.
export function use(config, options) {
	config.passes.generate.push((ast) => {
		const accum = [];
		set_generate_options(accum, ast.code);
		apply_accum(accum);
	});
}

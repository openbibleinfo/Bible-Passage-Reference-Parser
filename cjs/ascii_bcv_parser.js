if (typeof module === "undefined") { var module = {}; }
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// build/cjs_bundle.ts
var cjs_bundle_exports = {};
__export(cjs_bundle_exports, {
  bcv_parser: () => bcv_parser
});
module.exports = __toCommonJS(cjs_bundle_exports);

// build/bcv_grammar.js
var peg$SyntaxError = class extends SyntaxError {
  constructor(message, expected, found, location) {
    super(message);
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
  }
  format(sources) {
    let str = "Error: " + this.message;
    if (this.location) {
      let src = null;
      const st = sources.find((s2) => s2.source === this.location.source);
      if (st) {
        src = st.text.split(/\r\n|\n|\r/g);
      }
      const s = this.location.start;
      const offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
      const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
      if (src) {
        const e = this.location.end;
        const filler = "".padEnd(offset_s.line.toString().length, " ");
        const line = src[s.line - 1];
        const last = s.line === e.line ? e.column : line.length + 1;
        const hatLen = last - s.column || 1;
        str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
      } else {
        str += "\n at " + loc;
      }
    }
    return str;
  }
  static buildMessage(expected, found) {
    function hex(ch) {
      return ch.codePointAt(0).toString(16).toUpperCase();
    }
    const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
    function unicodeEscape(s) {
      if (nonPrintable) {
        return s.replace(nonPrintable, (ch) => "\\u{" + hex(ch) + "}");
      }
      return s;
    }
    function literalEscape(s) {
      return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    function classEscape(s) {
      return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    const DESCRIBE_EXPECTATION_FNS = {
      literal(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      class(expectation) {
        const escapedParts = expectation.parts.map(
          (part) => Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part)
        );
        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
      },
      any() {
        return "any character";
      },
      end() {
        return "end of input";
      },
      other(expectation) {
        return expectation.description;
      }
    };
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      const descriptions = expected2.map(describeExpectation);
      descriptions.sort();
      if (descriptions.length > 0) {
        let j = 1;
        for (let i = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  }
};
function peg$parse(input, options) {
  options = options !== void 0 ? options : {};
  const peg$FAILED = {};
  const peg$source = options.grammarSource;
  const peg$startRuleFunctions = {
    start: peg$parsestart
  };
  let peg$startRuleFunction = peg$parsestart;
  const peg$c0 = "(";
  const peg$c1 = ")";
  const peg$c2 = "";
  const peg$c3 = "/";
  const peg$c4 = ",";
  const peg$c5 = ".";
  const peg$c6 = "-";
  const peg$c7 = "$ordinal";
  const peg$c8 = "/1";
  const peg$c9 = "$ff_value";
  const peg$c10 = "$next_value";
  const peg$c11 = "/9";
  const peg$c12 = "/2";
  const peg$c13 = ".1";
  const peg$c14 = "$ab";
  const peg$c15 = "$c_explicit_value";
  const peg$c16 = "$c_sep_value";
  const peg$c17 = "$v_explicit_value";
  const peg$c18 = "$cv_sep";
  const peg$c19 = "$cv_sep_weak";
  const peg$c20 = "$sequence_sep_value";
  const peg$c21 = "$range_sep";
  const peg$c22 = "$title_value";
  const peg$c23 = "$in_book_of";
  const peg$c24 = "";
  const peg$c25 = "$integer_value";
  const peg$c26 = "$space";
  const peg$r0 = /^[1-8]/;
  const peg$r1 = /^[0-9]/;
  const peg$r2 = /^[([]/;
  const peg$r3 = /^[)\]]/;
  const peg$r4 = /^[^\x1F\x1E([]/;
  const peg$e0 = peg$literalExpectation("(", false);
  const peg$e1 = peg$literalExpectation(")", false);
  const peg$e2 = peg$literalExpectation("", false);
  const peg$e3 = peg$literalExpectation("/", false);
  const peg$e4 = peg$classExpectation([["1", "8"]], false, false, false);
  const peg$e5 = peg$literalExpectation(",", false);
  const peg$e6 = peg$literalExpectation(".", false);
  const peg$e7 = peg$literalExpectation("-", false);
  const peg$e8 = peg$literalExpectation("$ordinal", false);
  const peg$e9 = peg$literalExpectation("/1", false);
  const peg$e10 = peg$literalExpectation("$ff_value", false);
  const peg$e11 = peg$literalExpectation("$next_value", false);
  const peg$e12 = peg$literalExpectation("/9", false);
  const peg$e13 = peg$literalExpectation("/2", false);
  const peg$e14 = peg$literalExpectation(".1", false);
  const peg$e15 = peg$classExpectation([["0", "9"]], false, false, false);
  const peg$e16 = peg$literalExpectation("$ab", false);
  const peg$e17 = peg$literalExpectation("$c_explicit_value", false);
  const peg$e18 = peg$literalExpectation("$c_sep_value", false);
  const peg$e19 = peg$literalExpectation("$v_explicit_value", false);
  const peg$e20 = peg$literalExpectation("$cv_sep", false);
  const peg$e21 = peg$literalExpectation("$cv_sep_weak", false);
  const peg$e22 = peg$literalExpectation("$sequence_sep_value", false);
  const peg$e23 = peg$literalExpectation("$range_sep", false);
  const peg$e24 = peg$literalExpectation("$title_value", false);
  const peg$e25 = peg$literalExpectation("$in_book_of", false);
  const peg$e26 = peg$classExpectation(["(", "["], false, false, false);
  const peg$e27 = peg$classExpectation([")", "]"], false, false, false);
  const peg$e28 = peg$literalExpectation("", false);
  const peg$e29 = peg$literalExpectation("$integer_value", false);
  const peg$e30 = peg$classExpectation(["", "", "(", "["], true, false, false);
  const peg$e31 = peg$literalExpectation("$space", false);
  function peg$f0(val_1, sep_val, seq_post) {
    if (sep_val && sep_val.type && sep_val.type === "c_explicit") seq_post.explicit_context = "c";
    return [seq_post];
  }
  function peg$f1(val_1, val_2) {
    val_2.unshift([val_1]);
    const r = range();
    return { type: "sequence", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f2(sep_val_1, val_1, sep_val, seq_post) {
    if (sep_val && sep_val.type && sep_val.type === "c_explicit") seq_post.explicit_context = "c";
    return [seq_post];
  }
  function peg$f3(sep_val_1, val_1, val_2) {
    if (typeof val_2 === "undefined") val_2 = [];
    if (sep_val_1 && sep_val_1.type && sep_val_1.type === "c_explicit") val_1.explicit_context = "c";
    val_2.unshift([val_1]);
    const r = range();
    return { type: "sequence_post_enclosed", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f4(val_1, val_2) {
    if (val_1.length && val_1.length === 2) val_1 = val_1[0];
    const r = range();
    return { type: "range", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f5(val) {
    const r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f6(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f7(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f8(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f9(val_1, val_2) {
    const r = range();
    return { type: "bc_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f10(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f11(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f12(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f13(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f14(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f15(val_1, val_2) {
    return val_2.value[0].partial == null;
  }
  function peg$f16(val_1, val_2, val_3, val_4) {
    const r = range();
    return { type: "range", value: [{ type: "bcv", value: [{ type: "bc", value: [val_1, val_2], indices: [val_1.indices[0], val_2.indices[1]] }, val_3], indices: [val_1.indices[0], val_3.indices[1]] }, val_4], indices: [r.start, r.end - 1] };
  }
  function peg$f17(val_1, val_2) {
    const r = range();
    return { type: "bv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f18(val) {
    const r = range();
    return { type: "c", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f19(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f20(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f21(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f22(val_1, val_2, val_3) {
    const r = range();
    return { type: "cb_range", value: [val_3, val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f23(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f24(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f25(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f26(val) {
    const r = range();
    return { type: "c_psalm", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f27(val_1, val_2) {
    const r = range();
    return { type: "cv_psalm", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f28(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f29(val_1, val_2) {
    const r = range();
    return { type: "c_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f30(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f31(val_1, val_2) {
    const r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f32(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f33(val_1, val_2) {
    const r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f34(val_1) {
    const r = range();
    return { type: "ff", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f35(val_1) {
    const r = range();
    return { type: "next_v", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f36(val_1, val_2) {
    const r = range();
    return { type: "integer_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f37(val) {
    const r = range();
    return { type: "context", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f38(val) {
    const r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f39(val) {
    const r = range();
    return { type: "bc", value: [val, { type: "c", value: [{ type: "integer", value: 151, indices: [r.end - 2, r.end - 1] }], indices: [r.end - 2, r.end - 1] }], indices: [r.start, r.end - 1] };
  }
  function peg$f40(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, { type: "v", value: [val_2], indices: [val_2.indices[0], val_2.indices[1]] }], indices: [r.start, r.end - 1] };
  }
  function peg$f41(val) {
    const r = range();
    return { type: "v", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f42() {
    return { type: "c_explicit" };
  }
  function peg$f43() {
    return { type: "c_explicit" };
  }
  function peg$f44() {
    return { type: "v_explicit" };
  }
  function peg$f45() {
    return "";
  }
  function peg$f46(val) {
    const r = range();
    return { type: "title", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f47(val) {
    const r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f48(val) {
    const r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f49(val) {
    const r = range();
    return { type: "translation", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f50(val_1, val_2) {
    const r = range();
    return { type: "integer", value: parseInt(val_1.join(""), 10), partial: val_2 != null ? val_2[1].join("") : null, indices: [r.start, r.end - 1] };
  }
  function peg$f51(val) {
    const r = range();
    return { type: "integer", value: parseInt(val.join(""), 10), indices: [r.start, r.end - 1] };
  }
  function peg$f52(val) {
    const r = range();
    return { type: "word", value: val.join(""), indices: [r.start, r.end - 1] };
  }
  function peg$f53(val) {
    const r = range();
    return { type: "stop", value: val, indices: [r.start, r.end - 1] };
  }
  let peg$currPos = options.peg$currPos | 0;
  let peg$savedPos = peg$currPos;
  const peg$posDetailsCache = [{ line: 1, column: 1 }];
  let peg$maxFailPos = peg$currPos;
  let peg$maxFailExpected = options.peg$maxFailExpected || [];
  let peg$silentFails = options.peg$silentFails | 0;
  let peg$result;
  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function offset() {
    return peg$savedPos;
  }
  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function expected(description, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location2
    );
  }
  function error(message, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message, location2);
  }
  function peg$getUnicode(pos = peg$currPos) {
    const cp = input.codePointAt(pos);
    if (cp === void 0) {
      return "";
    }
    return String.fromCodePoint(cp);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
    return { type: "class", parts, inverted, ignoreCase, unicode };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    let details = peg$posDetailsCache[pos];
    let p;
    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {
        }
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset2) {
    const startPosDetails = peg$computePosDetails(startPos);
    const endPosDetails = peg$computePosDetails(endPos);
    const res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset2 && peg$source && typeof peg$source.offset === "function") {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }
  function peg$fail(expected2) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected2);
  }
  function peg$buildSimpleError(message, location2) {
    return new peg$SyntaxError(message, null, null, location2);
  }
  function peg$buildStructuredError(expected2, found, location2) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected2, found),
      expected2,
      found,
      location2
    );
  }
  function peg$parsestart() {
    let s0, s1;
    s0 = [];
    s1 = peg$parsebcv_hyphen_range();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesequence();
      if (s1 === peg$FAILED) {
        s1 = peg$parsecb_range();
        if (s1 === peg$FAILED) {
          s1 = peg$parserange();
          if (s1 === peg$FAILED) {
            s1 = peg$parsenext_v();
            if (s1 === peg$FAILED) {
              s1 = peg$parseff();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebcv_comma();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsebc_title();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseps151_bcv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebcv();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsebcv_weak();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parseps151_bc();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsebc();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsecv_psalm();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsebv();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsec_psalm();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parseb();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecbv();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecbv_ordinal();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecb();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecb_ordinal();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsetranslation_sequence_enclosed();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsetranslation_sequence();
                                                if (s1 === peg$FAILED) {
                                                  s1 = peg$parsesequence_sep();
                                                  if (s1 === peg$FAILED) {
                                                    s1 = peg$parsec_title();
                                                    if (s1 === peg$FAILED) {
                                                      s1 = peg$parseinteger_title();
                                                      if (s1 === peg$FAILED) {
                                                        s1 = peg$parsecv();
                                                        if (s1 === peg$FAILED) {
                                                          s1 = peg$parsecv_weak();
                                                          if (s1 === peg$FAILED) {
                                                            s1 = peg$parseinteger();
                                                            if (s1 === peg$FAILED) {
                                                              s1 = peg$parsec();
                                                              if (s1 === peg$FAILED) {
                                                                s1 = peg$parsev();
                                                                if (s1 === peg$FAILED) {
                                                                  s1 = peg$parseword();
                                                                  if (s1 === peg$FAILED) {
                                                                    s1 = peg$parseword_parenthesis();
                                                                    if (s1 === peg$FAILED) {
                                                                      s1 = peg$parsecontext();
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsebcv_hyphen_range();
        if (s1 === peg$FAILED) {
          s1 = peg$parsesequence();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecb_range();
            if (s1 === peg$FAILED) {
              s1 = peg$parserange();
              if (s1 === peg$FAILED) {
                s1 = peg$parsenext_v();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseff();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebcv_comma();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebc_title();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseps151_bcv();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsebcv();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsebcv_weak();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parseps151_bc();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsebc();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsecv_psalm();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsebv();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsec_psalm();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parseb();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecbv();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecbv_ordinal();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsecb();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsecb_ordinal();
                                                if (s1 === peg$FAILED) {
                                                  s1 = peg$parsetranslation_sequence_enclosed();
                                                  if (s1 === peg$FAILED) {
                                                    s1 = peg$parsetranslation_sequence();
                                                    if (s1 === peg$FAILED) {
                                                      s1 = peg$parsesequence_sep();
                                                      if (s1 === peg$FAILED) {
                                                        s1 = peg$parsec_title();
                                                        if (s1 === peg$FAILED) {
                                                          s1 = peg$parseinteger_title();
                                                          if (s1 === peg$FAILED) {
                                                            s1 = peg$parsecv();
                                                            if (s1 === peg$FAILED) {
                                                              s1 = peg$parsecv_weak();
                                                              if (s1 === peg$FAILED) {
                                                                s1 = peg$parseinteger();
                                                                if (s1 === peg$FAILED) {
                                                                  s1 = peg$parsec();
                                                                  if (s1 === peg$FAILED) {
                                                                    s1 = peg$parsev();
                                                                    if (s1 === peg$FAILED) {
                                                                      s1 = peg$parseword();
                                                                      if (s1 === peg$FAILED) {
                                                                        s1 = peg$parseword_parenthesis();
                                                                        if (s1 === peg$FAILED) {
                                                                          s1 = peg$parsecontext();
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecb_range();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_hyphen_range();
      if (s1 === peg$FAILED) {
        s1 = peg$parserange();
        if (s1 === peg$FAILED) {
          s1 = peg$parsenext_v();
          if (s1 === peg$FAILED) {
            s1 = peg$parseff();
            if (s1 === peg$FAILED) {
              s1 = peg$parsebcv_comma();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebc_title();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseps151_bcv();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebcv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebcv_weak();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseps151_bc();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsebc();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsecv_psalm();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsebv();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsec_psalm();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parseb();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsecbv();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecbv_ordinal();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecb();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecb_ordinal();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecontext();
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsec_sep();
      if (s4 === peg$FAILED) {
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesequence_post();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f0(s1, s4, s5);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsec_sep();
          if (s4 === peg$FAILED) {
            s4 = peg$parsesequence_sep();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsesequence_post();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f0(s1, s4, s5);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f1(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence_post_enclosed() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parsec_sep();
      if (s3 === peg$FAILED) {
        s3 = peg$parsesequence_sep();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesequence_post();
        if (s4 !== peg$FAILED) {
          s5 = [];
          s6 = peg$currPos;
          s7 = peg$parsec_sep();
          if (s7 === peg$FAILED) {
            s7 = peg$parsesequence_sep();
            if (s7 === peg$FAILED) {
              s7 = null;
            }
          }
          if (s7 !== peg$FAILED) {
            s8 = peg$parsesequence_post();
            if (s8 !== peg$FAILED) {
              peg$savedPos = s6;
              s6 = peg$f2(s3, s4, s7, s8);
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            s6 = peg$currPos;
            s7 = peg$parsec_sep();
            if (s7 === peg$FAILED) {
              s7 = peg$parsesequence_sep();
              if (s7 === peg$FAILED) {
                s7 = null;
              }
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$parsesequence_post();
              if (s8 !== peg$FAILED) {
                peg$savedPos = s6;
                s6 = peg$f2(s3, s4, s7, s8);
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          }
          s6 = peg$parsesp();
          if (input.charCodeAt(peg$currPos) === 41) {
            s7 = peg$c1;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f3(s3, s4, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence_post() {
    let s0;
    s0 = peg$parsesequence_post_enclosed();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecb_range();
      if (s0 === peg$FAILED) {
        s0 = peg$parsebcv_hyphen_range();
        if (s0 === peg$FAILED) {
          s0 = peg$parserange();
          if (s0 === peg$FAILED) {
            s0 = peg$parsenext_v();
            if (s0 === peg$FAILED) {
              s0 = peg$parseff();
              if (s0 === peg$FAILED) {
                s0 = peg$parsebcv_comma();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsebc_title();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseps151_bcv();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsebcv();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parsebcv_weak();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseps151_bc();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parsebc();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parsecv_psalm();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parsebv();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parsec_psalm();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parseb();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parsecbv();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsecbv_ordinal();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parsecb();
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$parsecb_ordinal();
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$parsec_title();
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$parseinteger_title();
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$parsecv();
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$parsecv_weak();
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$parseinteger();
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$parsec();
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$parsev();
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parserange() {
    let s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsebcv_comma();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc_title();
      if (s1 === peg$FAILED) {
        s1 = peg$parseps151_bcv();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebcv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsebcv_weak();
            if (s1 === peg$FAILED) {
              s1 = peg$parseps151_bc();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebc();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsecv_psalm();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$currPos;
                      s2 = peg$parseb();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$currPos;
                        peg$silentFails++;
                        s4 = peg$currPos;
                        s5 = peg$parserange_sep();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsebcv_comma();
                          if (s6 === peg$FAILED) {
                            s6 = peg$parsebc_title();
                            if (s6 === peg$FAILED) {
                              s6 = peg$parseps151_bcv();
                              if (s6 === peg$FAILED) {
                                s6 = peg$parsebcv();
                                if (s6 === peg$FAILED) {
                                  s6 = peg$parsebcv_weak();
                                  if (s6 === peg$FAILED) {
                                    s6 = peg$parseps151_bc();
                                    if (s6 === peg$FAILED) {
                                      s6 = peg$parsebc();
                                      if (s6 === peg$FAILED) {
                                        s6 = peg$parsebv();
                                        if (s6 === peg$FAILED) {
                                          s6 = peg$parseb();
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                          if (s6 !== peg$FAILED) {
                            s5 = [s5, s6];
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                        peg$silentFails--;
                        if (s4 !== peg$FAILED) {
                          peg$currPos = s3;
                          s3 = void 0;
                        } else {
                          s3 = peg$FAILED;
                        }
                        if (s3 !== peg$FAILED) {
                          s2 = [s2, s3];
                          s1 = s2;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsecbv();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsecbv_ordinal();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsec_psalm();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsecb();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsecb_ordinal();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsec_title();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parseinteger_title();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecv();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecv_weak();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parseinteger();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsec();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsev();
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parserange_sep();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenext_v();
        if (s3 === peg$FAILED) {
          s3 = peg$parseff();
          if (s3 === peg$FAILED) {
            s3 = peg$parsebcv_comma();
            if (s3 === peg$FAILED) {
              s3 = peg$parsebc_title();
              if (s3 === peg$FAILED) {
                s3 = peg$parseps151_bcv();
                if (s3 === peg$FAILED) {
                  s3 = peg$parsebcv();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parsebcv_weak();
                    if (s3 === peg$FAILED) {
                      s3 = peg$parseps151_bc();
                      if (s3 === peg$FAILED) {
                        s3 = peg$parsebc();
                        if (s3 === peg$FAILED) {
                          s3 = peg$parsecv_psalm();
                          if (s3 === peg$FAILED) {
                            s3 = peg$parsebv();
                            if (s3 === peg$FAILED) {
                              s3 = peg$parseb();
                              if (s3 === peg$FAILED) {
                                s3 = peg$parsecbv();
                                if (s3 === peg$FAILED) {
                                  s3 = peg$parsecbv_ordinal();
                                  if (s3 === peg$FAILED) {
                                    s3 = peg$parsec_psalm();
                                    if (s3 === peg$FAILED) {
                                      s3 = peg$parsecb();
                                      if (s3 === peg$FAILED) {
                                        s3 = peg$parsecb_ordinal();
                                        if (s3 === peg$FAILED) {
                                          s3 = peg$parsec_title();
                                          if (s3 === peg$FAILED) {
                                            s3 = peg$parseinteger_title();
                                            if (s3 === peg$FAILED) {
                                              s3 = peg$parsecv();
                                              if (s3 === peg$FAILED) {
                                                s3 = peg$parseinteger();
                                                if (s3 === peg$FAILED) {
                                                  s3 = peg$parsecv_weak();
                                                  if (s3 === peg$FAILED) {
                                                    s3 = peg$parsec();
                                                    if (s3 === peg$FAILED) {
                                                      s3 = peg$parsev();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f4(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseb() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 47) {
          s4 = peg$c3;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e3);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = input.charAt(peg$currPos);
          if (peg$r0.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e4);
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (input.charCodeAt(peg$currPos) === 31) {
          s4 = peg$c2;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e2);
          }
        }
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f5(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parsecv();
        peg$silentFails--;
        if (s5 !== peg$FAILED) {
          peg$currPos = s4;
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parsecv_sep();
        if (s2 === peg$FAILED) {
          s2 = peg$parsecv_sep_weak();
          if (s2 === peg$FAILED) {
            s2 = peg$parserange_sep();
            if (s2 === peg$FAILED) {
              s2 = peg$parsesp();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsec();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f6(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc_comma() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      if (input.charCodeAt(peg$currPos) === 44) {
        s3 = peg$c4;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e5);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesp();
        s5 = peg$parsec();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f7(s1, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc_title() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f8(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetitle();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f9(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv() {
    let s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s4 = peg$c5;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsev();
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecv();
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parsecv_sep();
        if (s4 === peg$FAILED) {
          s4 = peg$parsesequence_sep();
        }
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parsecv_sep();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f10(s1, s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_weak() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f11(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecv_sep_weak();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            s6 = peg$currPos;
            s7 = peg$parsecv_sep();
            if (s7 !== peg$FAILED) {
              s8 = peg$parsev();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            peg$silentFails--;
            if (s6 === peg$FAILED) {
              s5 = void 0;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f12(s1, s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_comma() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    s0 = peg$currPos;
    s1 = peg$parsebc_comma();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f13(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsesp();
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c4;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e5);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesp();
          s6 = peg$parsev();
          if (s6 !== peg$FAILED) {
            s7 = peg$currPos;
            peg$silentFails++;
            s8 = peg$currPos;
            s9 = peg$parsecv_sep();
            if (s9 !== peg$FAILED) {
              s10 = peg$parsev();
              if (s10 !== peg$FAILED) {
                s9 = [s9, s10];
                s8 = s9;
              } else {
                peg$currPos = s8;
                s8 = peg$FAILED;
              }
            } else {
              peg$currPos = s8;
              s8 = peg$FAILED;
            }
            peg$silentFails--;
            if (s8 === peg$FAILED) {
              s7 = void 0;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
            if (s7 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f14(s1, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_hyphen_range() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c6;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parsespace();
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsec();
      if (s3 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s4 = peg$f15(s1, s3);
        if (s4) {
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 45) {
            s5 = peg$c6;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parsev();
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 45) {
                s7 = peg$c6;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e7);
                }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsev();
                if (s8 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f16(s1, s3, s6, s8);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebv() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecv_sep();
      if (s2 === peg$FAILED) {
        s2 = peg$parsecv_sep_weak();
        if (s2 === peg$FAILED) {
          s2 = peg$parserange_sep();
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parsesequence_sep();
            if (s3 !== peg$FAILED) {
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$parsev_explicit();
              peg$silentFails--;
              if (s5 !== peg$FAILED) {
                peg$currPos = s4;
                s4 = void 0;
              } else {
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
              s2 = peg$parsesp();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsev();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f17(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f18(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f19(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsein_book_of();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseb();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f20(s2, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb_range() {
    let s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f21(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parserange_sep();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsec();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsein_book_of();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              s7 = peg$parseb();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f22(s2, s5, s7);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecbv() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f23(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb_ordinal() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsec();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseordinal();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsec_explicit();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsein_book_of();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseb();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f24(s1, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseordinal() {
    let res;
    if (res = options.ordinal.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsecbv_ordinal() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecb_ordinal();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f25(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_psalm() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c8) {
          s3 = peg$c8;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e9);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f26(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_psalm() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_psalm();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f27(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_title() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f28(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsetitle();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f29(s2, s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parsec();
    if (s2 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s3 = peg$f30(s2);
      if (s3) {
        s3 = void 0;
      } else {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s6 = peg$c5;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parsev_explicit();
          if (s7 !== peg$FAILED) {
            s8 = peg$parsev();
            if (s8 !== peg$FAILED) {
              s6 = [s6, s7, s8];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$currPos;
          s6 = peg$parsecv_sep();
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          s7 = peg$parsev_explicit();
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 === peg$FAILED) {
            s5 = peg$parsecv_sep();
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parsev();
            if (s6 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f31(s2, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_weak() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsec();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f32(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecv_sep_weak();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            s6 = peg$currPos;
            s7 = peg$parsecv_sep();
            if (s7 !== peg$FAILED) {
              s8 = peg$parsev();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            peg$silentFails--;
            if (s6 === peg$FAILED) {
              s5 = void 0;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f33(s1, s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseff() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsebcv();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_weak();
      if (s1 === peg$FAILED) {
        s1 = peg$parsebc();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecv();
            if (s1 === peg$FAILED) {
              s1 = peg$parsecv_weak();
              if (s1 === peg$FAILED) {
                s1 = peg$parseinteger();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsec();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsev();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parseff_value();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f34(s1);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseff_value() {
    let res;
    if (res = options.ff.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsenext_v() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsebcv();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_weak();
      if (s1 === peg$FAILED) {
        s1 = peg$parsebc();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecv();
            if (s1 === peg$FAILED) {
              s1 = peg$parsecv_weak();
              if (s1 === peg$FAILED) {
                s1 = peg$parseinteger();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsec();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsev();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parsenext_value();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f35(s1);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsenext_value() {
    let res;
    if (res = options.next.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parseinteger_title() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseinteger();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsetitle();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f36(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecontext() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c11) {
          s3 = peg$c11;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e12);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f37(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_b() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c12) {
          s3 = peg$c12;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e13);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f38(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_bc() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parseps151_b();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c13) {
        s2 = peg$c13;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e14);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = input.charAt(peg$currPos);
        if (peg$r1.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e15);
          }
        }
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f39(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_bcv() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c5;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseinteger();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f40(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseab() {
    let res;
    if (res = options.ab.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsev() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f41(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_explicit() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit_value();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f42();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsec_explicit_value() {
    let res;
    if (res = options.c_explicit.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsec_sep() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsec_sep_value();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f43();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsec_sep_value() {
    let res;
    if (res = options.c_sep.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsev_explicit() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit_value();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f44();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsev_explicit_value() {
    let res;
    if (res = options.v_explicit.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsecv_sep() {
    let res;
    if (res = options.cv_sep.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsecv_sep_weak() {
    let res;
    if (res = options.cv_sep_weak.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsesequence_sep() {
    let res;
    if (res = options.sequence.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsesequence_sep_value() {
    let s0;
    if (input.substr(peg$currPos, 19) === peg$c20) {
      s0 = peg$c20;
      peg$currPos += 19;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e22);
      }
    }
    return s0;
  }
  function peg$parserange_sep() {
    let res;
    if (res = options.range.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsetitle() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsecv_sep();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesequence_sep();
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parsetitle_value();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f46(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetitle_value() {
    let res;
    if (res = options.title.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsein_book_of() {
    let res;
    if (res = options.in_book_of.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsetranslation_sequence_enclosed() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = input.charAt(peg$currPos);
    if (peg$r2.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e26);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s4 = peg$currPos;
      s5 = peg$parsetranslation();
      if (s5 !== peg$FAILED) {
        s6 = [];
        s7 = peg$currPos;
        s8 = peg$parsesequence_sep();
        if (s8 !== peg$FAILED) {
          s9 = peg$parsetranslation();
          if (s9 !== peg$FAILED) {
            s8 = [s8, s9];
            s7 = s8;
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
        } else {
          peg$currPos = s7;
          s7 = peg$FAILED;
        }
        while (s7 !== peg$FAILED) {
          s6.push(s7);
          s7 = peg$currPos;
          s8 = peg$parsesequence_sep();
          if (s8 !== peg$FAILED) {
            s9 = peg$parsetranslation();
            if (s9 !== peg$FAILED) {
              s8 = [s8, s9];
              s7 = s8;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
        }
        s5 = [s5, s6];
        s4 = s5;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesp();
        s6 = input.charAt(peg$currPos);
        if (peg$r3.test(s6)) {
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e27);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f47(s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation_sequence() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 44) {
      s3 = peg$c4;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e5);
      }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parsesp();
      s3 = [s3, s4];
      s2 = s3;
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = peg$currPos;
    s4 = peg$parsetranslation();
    if (s4 !== peg$FAILED) {
      s5 = [];
      s6 = peg$currPos;
      s7 = peg$parsesequence_sep();
      if (s7 !== peg$FAILED) {
        s8 = peg$parsetranslation();
        if (s8 !== peg$FAILED) {
          s7 = [s7, s8];
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      } else {
        peg$currPos = s6;
        s6 = peg$FAILED;
      }
      while (s6 !== peg$FAILED) {
        s5.push(s6);
        s6 = peg$currPos;
        s7 = peg$parsesequence_sep();
        if (s7 !== peg$FAILED) {
          s8 = peg$parsetranslation();
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      }
      s4 = [s4, s5];
      s3 = s4;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f48(s3);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 30) {
      s1 = peg$c24;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e28);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 30) {
          s3 = peg$c24;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f49(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseinteger() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parseinteger_value();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parsesp();
      s4 = peg$parseab();
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f50(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseinteger_value() {
    let res;
    if (res = /^[0-9]{1,3}(?![0-9]|,000)/.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parseany_integer() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r1.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e15);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r1.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e15);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f51(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseword() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r4.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e30);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r4.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e30);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f52(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseword_parenthesis() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r2.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e26);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f53(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsesp() {
    let s0;
    s0 = peg$parsespace();
    if (s0 === peg$FAILED) {
      s0 = null;
    }
    return s0;
  }
  function peg$parsespace() {
    let res;
    if (res = options.space.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  peg$result = peg$startRuleFunction();
  const peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
  function peg$throw() {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
      peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
  if (options.peg$library) {
    return (
      /** @type {any} */
      {
        peg$result,
        peg$currPos,
        peg$FAILED,
        peg$maxFailExpected,
        peg$maxFailPos,
        peg$success,
        peg$throw: peg$success ? void 0 : peg$throw
      }
    );
  }
  if (peg$success) {
    return peg$result;
  } else {
    peg$throw();
  }
}

// build/bcv_matcher.ts
var bcv_matcher = class {
  constructor(parent, grammar_options2) {
    this.parent = parent;
    this.parent.options.grammar = structuredClone(grammar_options2);
  }
  // ## Parsing-Related Functions
  // Replace control characters and spaces since we replace books with a specific character pattern. The string changes, but the length stays the same so that indices remain valid. If we want to use Latin numbers rather than non-Latin ones, replace them here.
  replace_control_characters(s) {
    return s.replace(this.parent.regexps.control, " ");
  }
  // Replace any /[^0-9]/ digits if requested so that the parser can find chapter and verse references. This replacement happens after removing books.
  replace_non_ascii_numbers(s) {
    if (this.parent.options.non_latin_digits_strategy === "replace") {
      s = s.replace(/[٠۰߀०০੦૦୦0౦೦൦๐໐༠၀႐០᠐᥆᧐᪀᪐᭐᮰᱀᱐꘠꣐꤀꧐꩐꯰０]/g, "0");
      s = s.replace(/[١۱߁१১੧૧୧௧౧೧൧๑໑༡၁႑១᠑᥇᧑᪁᪑᭑᮱᱁᱑꘡꣑꤁꧑꩑꯱１]/g, "1");
      s = s.replace(/[٢۲߂२২੨૨୨௨౨೨൨๒໒༢၂႒២᠒᥈᧒᪂᪒᭒᮲᱂᱒꘢꣒꤂꧒꩒꯲２]/g, "2");
      s = s.replace(/[٣۳߃३৩੩૩୩௩౩೩൩๓໓༣၃႓៣᠓᥉᧓᪃᪓᭓᮳᱃᱓꘣꣓꤃꧓꩓꯳３]/g, "3");
      s = s.replace(/[٤۴߄४৪੪૪୪௪౪೪൪๔໔༤၄႔៤᠔᥊᧔᪄᪔᭔᮴᱄᱔꘤꣔꤄꧔꩔꯴４]/g, "4");
      s = s.replace(/[٥۵߅५৫੫૫୫௫౫೫൫๕໕༥၅႕៥᠕᥋᧕᪅᪕᭕᮵᱅᱕꘥꣕꤅꧕꩕꯵５]/g, "5");
      s = s.replace(/[٦۶߆६৬੬૬୬௬౬೬൬๖໖༦၆႖៦᠖᥌᧖᪆᪖᭖᮶᱆᱖꘦꣖꤆꧖꩖꯶６]/g, "6");
      s = s.replace(/[٧۷߇७৭੭૭୭௭౭೭൭๗໗༧၇႗៧᠗᥍᧗᪇᪗᭗᮷᱇᱗꘧꣗꤇꧗꩗꯷７]/g, "7");
      s = s.replace(/[٨۸߈८৮੮૮୮௮౮೮൮๘໘༨၈႘៨᠘᥎᧘᪈᪘᭘᮸᱈᱘꘨꣘꤈꧘꩘꯸８]/g, "8");
      s = s.replace(/[٩۹߉९৯੯૯୯௯౯೯൯๙໙༩၉႙៩᠙᥏᧙᪉᪙᭙᮹᱉᱙꘩꣙꤉꧙꩙꯹９]/g, "9");
    }
    return s;
  }
  // Find and replace instances of Bible books.
  match_books(s) {
    const books = [];
    for (const book of this.parent.regexps.books) {
      let has_replacement = false;
      s = s.replace(book.regexp, function(_full, bk) {
        has_replacement = true;
        books.push({
          value: bk,
          parsed: book.osis,
          type: "book"
        });
        const extra = book.extra ? `/${book.extra}` : "";
        return `${books.length - 1}${extra}`;
      });
      if (has_replacement && /^[\s\x1f\d:.,;\-\u2013\u2014]+$/.test(s)) {
        break;
      }
    }
    for (const translation_regexp of this.parent.regexps.translations) {
      s = s.replace(translation_regexp, function(match) {
        books.push({
          value: match,
          parsed: match.toLowerCase(),
          type: "translation"
        });
        return `${books.length - 1}`;
      });
    }
    return [s, this.get_book_indices(books, s)];
  }
  // Get the string index for all the books / translations, adding the start index as a new key.
  get_book_indices(books, s) {
    let add_index = 0;
    for (const match of s.matchAll(/([\x1f\x1e])(\d+)(?:\/\d+)?\1/g)) {
      const bookIndex = parseInt(match[2], 10);
      books[bookIndex].start_index = match.index + add_index;
      add_index += books[bookIndex].value.length - match[0].length;
    }
    return books;
  }
  // Create an array of all the potential passage references in the string.
  match_passages(s) {
    let entities = [];
    let post_context = {};
    for (const match of s.matchAll(this.parent.regexps.escaped_passage)) {
      let [full, part, book_id] = match;
      const book_id_number = parseInt(book_id, 10);
      const original_part_length = part.length;
      match.index += full.length - original_part_length;
      part = this.clean_end_match(s, match, part);
      const start_index_adjust = part.startsWith("") ? 0 : part.split("")[0].length;
      const passage = {
        value: peg$parse(part, this.parent.options.grammar),
        type: "base",
        // The `start_index` in `this.parent.passage` always exists after being set in `match_books`.
        start_index: this.parent.passage.books[book_id_number].start_index - start_index_adjust,
        match: part
      };
      const book_parsed = this.parent.passage.books[book_id_number].parsed;
      if (start_index_adjust === 0 && this.parent.options.book_alone_strategy === "full" && this.parent.options.book_range_strategy === "include" && passage.value[0].type === "b" && Array.isArray(passage.value) && (passage.value.length === 1 || passage.value.length > 1 && passage.value[1].type === "translation_sequence") && /^[234]/.test(book_parsed)) {
        this.create_book_range(s, passage, book_id_number);
      }
      let accum = [];
      [accum, post_context] = this.parent.passage.handle_obj(passage, [], {});
      entities = entities.concat(accum);
      const regexp_index_adjust = this.adjust_regexp_end(accum, original_part_length, part.length);
      if (regexp_index_adjust > 0) {
        this.parent.regexps.escaped_passage.lastIndex -= regexp_index_adjust;
      }
    }
    return [entities, post_context];
  }
  // Clean up the end of a match by removing unnecessary characters.
  clean_end_match(s, match, part) {
    if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
      part = part.replace(/\s+\d+\s*$/, "");
    }
    if (!/[\d\x1f\x1e)]$/.test(part)) {
      const sub_parts = part.split(this.parent.regexps.match_end_split);
      const remove = sub_parts.pop();
      if (sub_parts.length > 0 && remove != null && remove.length > 0) {
        part = part.substring(0, part.length - remove.length);
      }
    }
    if (this.parent.options.captive_end_digits_strategy === "delete") {
      const next_char_index = match.index + part.length;
      if (s.length > next_char_index && /^\w/.test(s.charAt(next_char_index))) {
        part = part.replace(/[\s*]+\d+$/, "");
      }
      part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
    }
    return part;
  }
  // Handle the objects returned from the grammar to produce entities for further processing. We may need to adjust the `RegExp.lastIndex` if we discarded characters from the end of the match or if, after parsing, we're ignoring some of them--especially with ending parenthetical statements like "Luke 8:1-3; 24:10 (and Matthew 14:1-12 and Luke 23:7-12 for background)".
  adjust_regexp_end(accum, old_length, new_length) {
    if (accum.length > 0) {
      return old_length - accum[accum.length - 1].indices[1] - 1;
    } else if (old_length !== new_length) {
      return old_length - new_length;
    }
    return 0;
  }
  // If a book is on its own, check whether it's preceded by something that indicates it's a book range like "1-2 Samuel".
  create_book_range(s, passage, book_id) {
    const cases = [
      this.parent.regexps.first,
      this.parent.regexps.second,
      this.parent.regexps.third
    ];
    const limit = parseInt(this.parent.passage.books[book_id].parsed[0].substring(0, 1), 10);
    for (let i = 1; i < limit; i++) {
      const range_regexp = i === limit - 1 ? this.parent.regexps.range_and : this.parent.regexps.range_only;
      const match_regexp = new RegExp(String.raw`${this.parent.regexps.pre_number_book.source}(${cases[i - 1].source}\s*${range_regexp.source}\s*)\x1f${book_id}\x1f`, "iu");
      const prev = s.match(match_regexp);
      if (prev) {
        return this.add_book_range_object(passage, prev, i);
      }
    }
    return false;
  }
  // Create a synthetic object that can be parsed to show the correct result.
  add_book_range_object(passage, prev, start_book_number) {
    const length = prev[1].length;
    passage.value[0] = {
      type: "b_range_pre",
      value: [
        {
          type: "b_pre",
          value: start_book_number.toString(),
          indices: [prev.index, prev.index + length]
        },
        passage.value[0]
      ],
      indices: [0, passage.value[0].indices[1] + length]
    };
    this.add_offset_to_indices(passage.value[0].value[1].indices, length);
    passage.start_index -= length;
    passage.match = prev[1] + passage.match;
    if (!Array.isArray(passage.value)) {
      return passage;
    }
    for (let i = 1; i < passage.value.length; i++) {
      if (!passage.value[i].value) {
        continue;
      }
      if (passage.value[i].value[0]?.indices) {
        this.add_offset_to_indices(passage.value[i].value[0].indices, length);
      }
      this.add_offset_to_indices(passage.value[i].indices, length);
    }
    return passage;
  }
  add_offset_to_indices(indices, value_to_add) {
    indices[0] += value_to_add;
    indices[1] += value_to_add;
  }
};

// build/bcv_options.ts
var bcv_options = class {
  constructor(parent) {
    this.consecutive_combination_strategy = "combine";
    this.osis_compaction_strategy = "b";
    this.book_sequence_strategy = "ignore";
    this.invalid_sequence_strategy = "ignore";
    this.sequence_combination_strategy = "combine";
    this.invalid_passage_strategy = "ignore";
    this.non_latin_digits_strategy = "ignore";
    // This one is shared between `this` and `bcv_passage`.
    this.passage_existence_strategy = "bcv";
    this.book_alone_strategy = "ignore";
    this.book_range_strategy = "ignore";
    this.captive_end_digits_strategy = "delete";
    this.ps151_strategy = "c";
    this.zero_chapter_strategy = "error";
    this.zero_verse_strategy = "error";
    this.single_chapter_1_strategy = "chapter";
    this.end_range_digits_strategy = "verse";
    this.warn_level = "none";
    this.#testaments = "on";
    this.#case_sensitive = "none";
    this.#grammar = {
      // No leading space. This content is returned as-is with an `osis_compaction_strategy` that includes a `p`.
      ab: /^[a-e](?!\p{L})/iu,
      and: /^&/,
      c_explicit: /^[\s*]*(?:chapters?|cha?pts?\.?|chaps?\.?|ch[aps]?\.?)[\s*]*/i,
      c_sep_eu: /^\x1f\x1f\x1f/,
      c_sep_us: /^\x1f\x1f\x1f/,
      cv_sep_weak: /^(?:[\s*]*["'][\s*]*|[\s*])+/,
      cv_sep_eu: /^[\s*]*,+[\s*]*/,
      cv_sep_us: /^[\s*]*(?::+|\.(?!\s*\.\s*\.))[\s*]*/i,
      ff: /^\x1f\x1f\x1f/,
      in_book_of: /^\x1f\x1f\x1f/,
      next: /^\x1f\x1f\x1f/,
      ordinal: /^\x1f\x1f\x1f/,
      range: /^[\s*]*[\-\u2013\u2014][\s*]*/,
      sequence_eu: /^(?:[;/:&\-\u2013\u2014~\s*]|\.(?!\s*\.\s*\.))+/,
      sequence_us: /^(?:[,;/:&\-\u2013\u2014~\s*]|\.(?!\s*\.\s*\.))+/,
      space: /^[\s*]+/,
      title: /^[\s*]*title[\s*]*/i,
      v_explicit: /^[\s*]*(?:verses?|ver\.?|vss?\.?|vv?\.?)[\s*]*(?!\p{L})/iu,
      // Don't set these directly; we overwrite them with the `us` or `eu` equivalents based on the `punctuation_strategy` option.
      c_sep: /^\x1f\x1f\x1f/,
      cv_sep: /^\x1f\x1f\x1f/,
      sequence: /^\x1f\x1f\x1f/
    };
    this.#punctuation_strategy = "us";
    this.parent = parent;
    this.#grammar.cv_sep = this.#grammar.cv_sep_us;
    this.#grammar.sequence = this.#grammar.sequence_us;
  }
  #testaments;
  get testaments() {
    return this.#testaments;
  }
  set testaments(filter) {
    if (filter === this.#testaments || filter.length === 0) {
      return;
    }
    const filters = filter.split("");
    let out = "";
    if (filters[0] === "o") {
      filters.shift();
      out += "o";
    }
    if (filters.length > 0 && filters[0] === "n") {
      filters.shift();
      out += "n";
    }
    if (filters.length > 0 && filters[0] === "a") {
      out += "a";
    }
    if (out.length > 0 && out !== this.#testaments) {
      const new_apocrypha = out.indexOf("a") >= 0;
      const old_apocrypha = this.#testaments.indexOf("a") >= 0;
      this.#testaments = out;
      if (new_apocrypha !== old_apocrypha) {
        this.set_apocrypha(new_apocrypha);
      } else {
        this.parent.regexps_manager.filter_books(this.#testaments, this.case_sensitive);
      }
    }
  }
  // Whether to use books and abbreviations from the Apocrypha. This function makes sure books from the Apocrypha are available as options and adjusts the Psalms to include Psalm 151. It takes a boolean argument: `true` to include the Apocrypha and `false` to not. Defaults to `false`.
  set_apocrypha(include_apocrypha) {
    this.parent.regexps_manager.filter_books(this.#testaments, this.case_sensitive);
    for (const translation of Object.keys(this.parent.translations.systems)) {
      this.parent.translations.systems[translation].chapters ??= {};
      this.parent.translations.systems[translation].chapters["Ps"] ??= [...this.parent.translations.systems.current.chapters["Ps"]];
      if (include_apocrypha === true) {
        this.parent.translations.systems[translation].chapters["Ps"][150] = this.parent.translations.systems[translation].chapters["Ps151"]?.[0] ?? this.parent.translations.systems.current.chapters["Ps151"][0];
      } else if (this.parent.translations.systems[translation].chapters?.["Ps"].length === 151) {
        this.parent.translations.systems[translation].chapters["Ps"].pop();
      }
    }
  }
  get versification_system() {
    return this.parent.translations.current_system;
  }
  // Use an alternate versification system. Takes a string argument; the built-in options are: `default` to use ESV-style versification and `vulgate` to use the Vulgate (Greek) Psalm numbering. English offers several other versification systems; see the Readme for details.
  set versification_system(system) {
    if (this.parent.translations.aliases[system]?.system) {
      system = this.parent.translations.aliases[system].system;
    }
    if (!this.parent.translations.systems[system]) {
      if (this.warn_level === "warn") {
        console.warn(`Unknown versification system ("${system}"). Using default instead.`);
      }
      system = "default";
    }
    if (!system || system === this.parent.translations.current_system) {
      return;
    }
    if (this.parent.translations.current_system !== "default") {
      this.parent.translations.systems.current = structuredClone(this.parent.translations.systems.default);
    }
    this.parent.translations.current_system = system;
    if (system === "default") {
      return;
    }
    if (this.parent.translations.systems[system].order) {
      this.parent.translations.systems.current.order = { ...this.parent.translations.systems[system].order };
    }
    if (this.parent.translations.systems[system].chapters) {
      this.parent.translations.systems.current.chapters = { ...structuredClone(this.parent.translations.systems.default.chapters), ...structuredClone(this.parent.translations.systems[system].chapters) };
    }
  }
  #case_sensitive;
  get case_sensitive() {
    return this.#case_sensitive;
  }
  // Whether to treat books as case-sensitive. Valid values are `none` and `books`.
  set case_sensitive(arg) {
    if (arg === this.#case_sensitive || arg !== "none" && arg !== "books" && arg !== "translations" && arg !== "books,translations") {
      return;
    }
    this.#case_sensitive = arg;
    this.parent.regexps_manager.filter_books(this.testaments, arg);
    this.parent.translations_manager.apply_case_sensitive(arg);
  }
  #grammar;
  get grammar() {
    return this.#grammar;
  }
  // Merges existing grammar options with new ones.
  set grammar(arg) {
    this.#grammar = { ...this.#grammar, ...arg };
    this.punctuation_strategy = this.punctuation_strategy;
  }
  #punctuation_strategy;
  get punctuation_strategy() {
    return this.#punctuation_strategy;
  }
  set punctuation_strategy(arg) {
    if (arg !== "us" && arg !== "eu") {
      if (this.warn_level === "warn") {
        console.warn(`punctuation_strategy should be set to "us" or "eu", not: ${arg}`);
      }
      return;
    }
    this.#punctuation_strategy = arg;
    this.#grammar.c_sep = this.#grammar[`c_sep_${arg}`];
    this.#grammar.cv_sep = this.#grammar[`cv_sep_${arg}`];
    this.#grammar.sequence = this.#grammar[`sequence_${arg}`];
  }
};

// build/bcv_passage.ts
var bcv_passage = class {
  constructor(options, translations) {
    this.books = [];
    this.indices = [];
    this.options = options;
    this.translations = translations;
  }
  // ## Public
  // Loop through the parsed passages.
  handle_array(passages, accum = [], context = {}) {
    for (const passage of passages) {
      if (passage == null) {
        continue;
      }
      [accum, context] = this.handle_obj(passage, accum, context);
    }
    return [accum, context];
  }
  handle_obj(passage, accum, context) {
    if (passage.type && typeof this[passage.type] === "function") {
      return this[passage.type](passage, accum, context);
    }
    return [accum, context];
  }
  // ## Types Returned from the Peggy Grammar
  // These functions correspond to `type` attributes returned from the grammar. They're designed to be called multiple times if necessary.
  // Handle a book on its own ("Gen").
  b(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    const alternates = [];
    for (const b of this.books[passage.value].parsed) {
      const valid = this.validate_ref(passage.start_context.translations, { b });
      const obj = {
        start: { b },
        end: { b },
        valid
      };
      if (passage.passages.length === 0 && valid.valid) {
        passage.passages.push(obj);
      } else {
        alternates.push(obj);
      }
    }
    this.normalize_passage_and_alternates(passage, alternates);
    accum.push(passage);
    context = { b: passage.passages[0].start.b };
    if (passage.start_context.translations) {
      context.translations = structuredClone(passage.start_context.translations);
    }
    return [accum, context];
  }
  // This is never called. It exists to make Typescript happy.
  b_pre(passage, accum, context) {
    return [accum, context];
  }
  // Handle book-only ranges ("Gen-Exod").
  b_range(passage, accum, context) {
    return this.range(passage, accum, context);
  }
  // Handle book-only ranges like "1-2 Samuel". It doesn't support multiple ambiguous ranges (like "1-2C"), which it probably shouldn't, anyway.
  b_range_pre(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    const book = this.pluck("b", passage.value);
    let end;
    [[end], context] = this.b(book, [], context);
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    passage.passages = [{
      start: {
        b: passage.value[0].value + end.passages[0].start.b.substring(1),
        type: "b"
      },
      end: end.passages[0].end,
      valid: end.passages[0].valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = structuredClone(passage.start_context.translations);
    }
    accum.push(passage);
    return [accum, context];
  }
  // Handle ranges with a book as the start of the range ("Gen-Exod 2").
  b_range_start(passage, accum, context) {
    return this.range(passage, accum, context);
  }
  // The base (root) object in the grammar controls the base indices.
  base(passage, accum, context) {
    this.indices = this.calculate_indices(passage.match, passage.start_index);
    return this.handle_array(passage.value, accum, context);
  }
  // Handle book-chapter ("Gen 1").
  bc(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    this.reset_context(context, ["b", "c", "v"]);
    const chapter_integer = this.pluck_integer("c", passage.value);
    const c = chapter_integer.value;
    const partial = this.get_partial_verse(chapter_integer);
    let adjust_end_index_by = 0;
    const alternates = [];
    for (const b of this.books[this.pluck("b", passage.value).value].parsed) {
      let context_key = "c";
      const valid = this.validate_ref(passage.start_context.translations, { b, c });
      const obj = {
        start: { b },
        end: { b },
        valid
      };
      if (valid.messages?.start_chapter_not_exist_in_single_chapter_book || valid.messages?.start_verse_1 || partial != null && valid.messages?.start_chapter_1) {
        obj.valid = this.validate_ref(passage.start_context.translations, { b, v: c });
        if (valid.messages?.start_chapter_not_exist_in_single_chapter_book) {
          obj.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1;
        }
        obj.start.c = 1;
        obj.end.c = 1;
        context_key = "v";
      }
      obj.start[context_key] = c;
      [obj.start.c, obj.start.v] = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v);
      if (obj.start.v == null) {
        delete obj.start.v;
      }
      obj.end[context_key] = obj.start[context_key];
      if (partial != null) {
        const key = context_key === "v" ? "p" : "p_if_verse";
        obj.start[key] = partial;
        obj.end[key] = partial;
      }
      if (passage.passages.length === 0 && obj.valid.valid) {
        if (context_key === "c" && partial != null) {
          adjust_end_index_by = partial.length * -1;
        }
        passage.passages.push(obj);
      } else {
        alternates.push(obj);
      }
    }
    this.normalize_passage_and_alternates(passage, alternates, adjust_end_index_by);
    this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
    accum.push(passage);
    return [accum, context];
  }
  // Handle "Ps 3 title".
  bc_title(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const bc_pluck = this.pluck("bc", passage.value);
    let bc;
    [[bc], context] = this.bc(bc_pluck, [], context);
    if (bc.passages[0].start.b.substring(0, 2) !== "Ps" && bc.passages[0].alternates) {
      for (const alternate of bc.passages[0].alternates) {
        if (alternate.start.b.substring(0, 2) === "Ps") {
          bc.passages[0] = structuredClone(alternate);
          break;
        }
      }
    }
    if (bc.passages[0].start.b.substring(0, 2) !== "Ps") {
      accum.push(bc);
      return [accum, context];
    }
    this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
    let title = this.pluck("title", passage.value);
    if (!title) {
      title = this.pluck_integer("v", passage.value);
    }
    passage.value[1] = {
      type: "v",
      // Let us discover later that this was originally a `title`.
      original_type: "title",
      value: [{ type: "integer", value: 1, indices: title.indices }],
      indices: title.indices
    };
    passage.type = "bcv";
    return this.bcv(passage, accum, passage.start_context);
  }
  // Handle book chapter:verse ("Gen 1:1").
  bcv(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    this.reset_context(context, ["b", "c", "v"]);
    const bc = this.pluck("bc", passage.value);
    let c = this.pluck_integer("c", bc.value).value;
    const verse_integer = this.pluck_integer("v", passage.value);
    let v = verse_integer.value;
    const partial = this.get_partial_verse(verse_integer);
    const alternates = [];
    for (const b of this.books[this.pluck("b", bc.value).value].parsed) {
      const valid = this.validate_ref(passage.start_context.translations, { b, c, v });
      [c, v] = this.fix_start_zeroes(valid, c, v);
      const obj = {
        start: { b, c, v },
        end: { b, c, v },
        valid
      };
      if (partial != null) {
        obj.start.p = partial;
        obj.end.p = partial;
      }
      if (passage.passages.length === 0 && valid.valid) {
        passage.passages.push(obj);
      } else {
        alternates.push(obj);
      }
    }
    this.normalize_passage_and_alternates(passage, alternates);
    this.set_context_from_object(context, ["b", "c", "v"], passage.passages[0].start);
    accum.push(passage);
    return [accum, context];
  }
  // Handle "Philemon verse 6." This is unusual.
  bv(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const [b, v] = passage.value;
    let bcv = {
      indices: passage.indices,
      value: [
        {
          type: "bc",
          value: [b, { type: "c", value: [{ type: "integer", value: 1 }] }]
        },
        v
      ]
    };
    [[bcv], context] = this.bcv(bcv, [], context);
    passage.passages = bcv.passages;
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    accum.push(passage);
    return [accum, context];
  }
  // Handle a chapter.
  c(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const chapter_integer = passage.type === "integer" ? passage : this.pluck("integer", passage.value);
    let c = chapter_integer.value;
    const partial = this.get_partial_verse(chapter_integer);
    const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c });
    if (!valid.valid && valid.messages?.start_chapter_not_exist_in_single_chapter_book) {
      return this.v(passage, accum, context);
    }
    [c] = this.fix_start_zeroes(valid, c);
    passage.passages = [{
      start: { b: context.b, c },
      end: { b: context.b, c },
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = passage.start_context.translations;
    }
    if (partial != null) {
      passage.passages[0].start.p_if_verse = partial;
      passage.passages[0].end.p_if_verse = partial;
    }
    accum.push(passage);
    context.c = c;
    this.reset_context(context, ["v"]);
    if (passage.absolute_indices == null) {
      passage.absolute_indices = this.get_absolute_indices(passage.indices);
    }
    return [accum, context];
  }
  // Handle "23rd Psalm" by recasting it as a `bc`.
  c_psalm(passage, accum, context) {
    passage.type = "bc";
    const c = parseInt(this.books[passage.value].value.match(/^\d+/)[0], 10);
    passage.value = [
      {
        type: "b",
        value: passage.value,
        indices: passage.indices
      },
      {
        type: "c",
        value: [{ type: "integer", value: c, indices: passage.indices }],
        indices: passage.indices
      }
    ];
    return this.bc(passage, accum, context);
  }
  // Handle "Ps 3, ch 4:title"
  c_title(passage, accum, context) {
    passage.start_context = structuredClone(context);
    if (context.b !== "Ps") {
      return this.c(passage.value[0], accum, context);
    }
    const title = this.pluck("title", passage.value);
    passage.value[1] = {
      type: "v",
      // Preserve the title type in case we want it later.
      original_type: "title",
      value: [{ type: "integer", value: 1, indices: title.indices }],
      indices: title.indices
    };
    passage.type = "cv";
    return this.cv(passage, accum, passage.start_context);
  }
  // Handle "Chapters 1-2 from Daniel".
  cb_range(passage, accum, context) {
    passage.type = "range";
    const [b, start_c, end_c] = passage.value;
    passage.value = [{ type: "bc", value: [b, start_c], indices: passage.indices }, end_c];
    end_c.indices[1] = passage.indices[1];
    return this.range(passage, accum, context);
  }
  // Use an object to establish context for later objects but don't otherwise use it.
  context(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    context = Object.assign(context, this.books[passage.value].context);
    accum.push(passage);
    return [accum, context];
  }
  // Handle a chapter:verse.
  cv(passage, accum, context) {
    passage.start_context = structuredClone(context);
    let c = this.pluck_integer("c", passage.value).value;
    const verse_integer = this.pluck_integer("v", passage.value);
    let v = verse_integer.value;
    const partial = this.get_partial_verse(verse_integer);
    const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c, v });
    [c, v] = this.fix_start_zeroes(valid, c, v);
    passage.passages = [{
      start: { b: context.b, c, v },
      end: { b: context.b, c, v },
      valid
    }];
    if (partial != null) {
      passage.passages[0].start.p = partial;
      passage.passages[0].end.p = partial;
    }
    if (passage.start_context.translations) {
      passage.passages[0].translations = passage.start_context.translations;
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    context.c = c;
    context.v = v;
    accum.push(passage);
    return [accum, context];
  }
  // Handle "23rd Psalm verse 1" by recasting it as a `bcv`.
  cv_psalm(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.type = "bcv";
    const [c_psalm, v] = passage.value;
    const [[bc]] = this.c_psalm(c_psalm, [], passage.start_context);
    passage.value = [bc, v];
    return this.bcv(passage, accum, context);
  }
  // Handle "and following" (e.g., "Matt 1:1ff") by assuming it means to continue to the end of the current context (end of chapter if a verse is given, end of book if a chapter is given).
  ff(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.value.push({
      type: "integer",
      indices: structuredClone(passage.indices),
      value: 999
    });
    [[passage], context] = this.range(passage, [], passage.start_context);
    passage.value[0].indices = passage.value[1].indices;
    passage.value[0].absolute_indices = passage.value[1].absolute_indices;
    passage.value.pop();
    for (const key of ["end_verse_not_exist", "end_chapter_not_exist"]) {
      delete passage.passages[0].valid.messages[key];
    }
    accum.push(passage);
    return [accum, context];
  }
  // Pass the integer off to whichever handler is relevant.
  integer(passage, accum, context) {
    if (context.v == null) {
      return this.c(passage, accum, context);
    }
    return this.v(passage, accum, context);
  }
  // Handle "Ps 3-4:title" or "Acts 2:22-27. Title"
  integer_title(passage, accum, context) {
    passage.start_context = structuredClone(context);
    if (context.b !== "Ps") {
      return this.integer(passage.value[0], accum, context);
    }
    passage.value[0] = {
      type: "c",
      value: [passage.value[0]],
      indices: structuredClone(passage.value[0].indices)
    };
    passage.value[1].type = "v";
    passage.value[1].original_type = "title";
    passage.value[1].value = [{
      type: "integer",
      value: 1,
      indices: structuredClone(passage.value[1].value.indices)
    }];
    passage.type = "cv";
    return this.cv(passage, accum, passage.start_context);
  }
  // Handle "next verse" (e.g., in Polish, "Matt 1:1n" should be treated as "Matt 1:1-2"). It crosses chapter boundaries but not book boundaries. When given a whole chapter, it assumes the next chapter (again, not crossing book boundaries). The logic here is similar to that of `this.ff`.
  next_v(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const prev_integer = this.pluck_last_recursively("integer", passage.value) ?? { value: 1 };
    passage.value.push({
      type: "integer",
      indices: passage.indices,
      value: prev_integer.value + 1
    });
    let psg;
    [[psg], context] = this.range(passage, [], passage.start_context);
    if (psg.passages[0].valid.messages.end_verse_not_exist && !psg.passages[0].valid.messages.start_verse_not_exist && !psg.passages[0].valid.messages.start_chapter_not_exist && context.c != null) {
      passage.value.pop();
      passage.value.push({
        type: "cv",
        indices: passage.indices,
        value: [
          {
            type: "c",
            value: [{
              type: "integer",
              value: context.c + 1,
              indices: passage.indices
            }],
            indices: passage.indices
          },
          {
            type: "v",
            value: [{
              type: "integer",
              value: 1,
              indices: passage.indices
            }],
            indices: passage.indices
          }
        ]
      });
      [[psg], context] = this.range(passage, [], passage.start_context);
    }
    psg.value[0].indices = psg.value[1].indices;
    psg.value[0].absolute_indices = psg.value[1].absolute_indices;
    psg.value.pop();
    for (const key of ["end_verse_not_exist", "end_chapter_not_exist"]) {
      delete passage.passages[0].valid.messages[key];
    }
    accum.push(psg);
    return [accum, context];
  }
  // Handle a sequence of references. This is the only function that can return more than one object in the `passage.passages` array.
  sequence(passage, accum, context) {
    passage.start_context = structuredClone(context);
    passage.passages = [];
    for (const obj of passage.value) {
      let psg;
      if (typeof obj[0].explicit_context === "string" && obj[0].explicit_context === "c") {
        delete context.v;
      }
      [[psg], context] = this.handle_array(obj, [], context);
      for (const sub_psg of psg.passages) {
        sub_psg.type ??= psg.type;
        sub_psg.absolute_indices ??= psg.absolute_indices;
        if (psg.start_context.translations) {
          sub_psg.translations = psg.start_context.translations;
        }
        sub_psg.enclosed_absolute_indices = psg.type === "sequence_post_enclosed" ? [...psg.absolute_indices] : [-1, -1];
        passage.passages.push(sub_psg);
      }
    }
    if (!passage.absolute_indices) {
      if (passage.passages.length > 0 && passage.type === "sequence") {
        passage.absolute_indices = [
          passage.passages[0].absolute_indices[0],
          passage.passages[passage.passages.length - 1].absolute_indices[1]
        ];
      } else {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
    }
    accum.push(passage);
    return [accum, context];
  }
  // Handle a sequence like "Ps 119 (118)," with parentheses. We want to include the closing parenthesis in the indices if `sequence_combination_strategy` is `combine` or if there's a consecutive.
  sequence_post_enclosed(passage, accum, context) {
    return this.sequence(passage, accum, context);
  }
  // Handle a verse, either as part of a sequence or because someone explicitly wrote "verse".
  v(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const verse_integer = passage.type === "integer" ? passage : this.pluck("integer", passage.value);
    let v = verse_integer.value;
    const partial = this.get_partial_verse(verse_integer);
    const c = context.c != null ? context.c : 1;
    const valid = this.validate_ref(passage.start_context.translations, { b: context.b, c, v });
    const [, fixed_v] = this.fix_start_zeroes(valid, 0, v);
    passage.passages = [{
      start: { b: context.b, c, v: fixed_v },
      end: { b: context.b, c, v: fixed_v },
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = structuredClone(passage.start_context.translations);
    }
    if (partial != null) {
      passage.passages[0].start.p = partial;
      passage.passages[0].end.p = partial;
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    accum.push(passage);
    context.v = fixed_v;
    return [accum, context];
  }
  // ## Ranges
  // Handle any type of start and end range. It doesn't directly return multiple passages, but if there's an error parsing the range, we may convert it into a sequence.
  range(passage, accum, context) {
    passage.start_context = structuredClone(context);
    let [start, end] = passage.value;
    [[start], context] = this.handle_obj(start, [], context);
    if (end.type === "v" && this.options.end_range_digits_strategy === "verse" && (start.type === "bc" && !start.passages?.[0]?.valid?.messages?.start_chapter_not_exist_in_single_chapter_book || start.type === "c")) {
      passage.value[0] = start;
      return this.range_change_integer_end(passage, accum);
    }
    [[end], context] = this.handle_obj(end, [], context);
    passage.value = [start, end];
    passage.indices = [start.indices[0], end.indices[1]];
    delete passage.absolute_indices;
    const start_obj = {
      b: start.passages[0].start.b,
      c: start.passages[0].start.c,
      v: start.passages[0].start.v,
      type: start.type
    };
    if (start.passages[0].start.p != null) {
      start_obj.p = start.passages[0].start.p;
    }
    if (start.passages[0].start.p_if_verse != null) {
      start_obj.p_if_verse = start.passages[0].start.p_if_verse;
    }
    const end_obj = {
      b: end.passages[0].end.b,
      c: end.passages[0].end.c,
      v: end.passages[0].end.v,
      type: end.type
    };
    if (end.passages[0].end.p != null) {
      end_obj.p = end.passages[0].end.p;
    }
    if (end.passages[0].end.p_if_verse != null) {
      end_obj.p = end.passages[0].end.p_if_verse;
    }
    if (start.passages[0].start.p_if_verse != null) {
      start_obj.p_if_verse = start.passages[0].start.p_if_verse;
    }
    if (end.passages[0].valid.messages.start_chapter_is_zero) {
      end_obj.c = 0;
    }
    if (end.passages[0].valid.messages.start_verse_is_zero) {
      end_obj.v = 0;
    }
    const valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
    if (valid.valid) {
      const [return_now, return_value] = this.range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum);
      if (return_now) {
        return return_value;
      }
    } else {
      return this.range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum);
    }
    passage.absolute_indices ??= this.get_absolute_indices(passage.indices);
    passage.passages = [{
      start: start_obj,
      end: end_obj,
      valid
    }];
    if (passage.start_context.translations) {
      passage.passages[0].translations = structuredClone(passage.start_context.translations);
    }
    if (start_obj.type === "b") {
      passage.type = end_obj.type === "b" ? "b_range" : "b_range_start";
    } else if (end_obj.type === "b") {
      passage.type = "range_end_b";
    }
    accum.push(passage);
    return [accum, context];
  }
  // For Ps 122-23, treat the 23 as 123.
  range_change_end(passage, accum, new_end) {
    const [start, end] = passage.value;
    if (end.type === "integer") {
      end.original_value = end.value;
      end.value = new_end;
    } else if (end.type === "v") {
      const new_obj = this.pluck("integer", end.value);
      new_obj.original_value = new_obj.value;
      new_obj.value = new_end;
    } else if (end.type === "cv") {
      const new_obj = this.pluck_integer("c", end.value);
      new_obj.original_value = new_obj.value;
      new_obj.value = new_end;
    }
    return this.handle_obj(passage, accum, passage.start_context);
  }
  // For "Jer 33-11", treat the "11" as a verse.
  range_change_integer_end(passage, accum) {
    const [start, end] = passage.value;
    passage.original_type ??= passage.type;
    passage.original_value ??= [start, end];
    passage.type = start.type === "integer" ? "cv" : start.type + "v";
    if (start.type === "integer") {
      passage.value[0] = {
        type: "c",
        value: [start],
        indices: start.indices
      };
    }
    if (end.type === "integer") {
      passage.value[1] = {
        type: "v",
        value: [end],
        indices: end.indices
      };
    }
    return this.handle_obj(passage, accum, passage.start_context);
  }
  // If a new end chapter/verse in a range may be necessary, calculate it.
  range_check_new_end(translations, start_obj, end_obj, valid) {
    let new_end = 0;
    let type;
    if (valid.messages?.end_chapter_before_start) {
      type = "c";
    } else if (valid.messages?.end_verse_before_start) {
      type = "v";
    } else {
      return new_end;
    }
    new_end = this.range_get_new_end_value(start_obj, end_obj, valid, type);
    if (new_end > 0) {
      const obj_to_validate = {
        b: end_obj.b,
        c: end_obj.c,
        v: end_obj.v
      };
      obj_to_validate[type] = new_end;
      if (!this.validate_ref(translations, obj_to_validate).valid) {
        new_end = 0;
      }
    }
    return new_end;
  }
  // Handle ranges with a book as the end of the range ("Gen 2-Exod"). It's not `b_range_end` because only objects that start with an explicit book name should start with `b`.
  range_end_b(passage, accum, context) {
    return this.range(passage, accum, context);
  }
  // If a sequence has an end chapter/verse that's before the the start, check to see whether it can be salvaged: Gen 28-9 = Gen 28-29; Ps 101-24 = Ps 101-124. The `key` parameter is either `c` (for chapter) or `v` (for verse).
  range_get_new_end_value(start_obj, end_obj, valid, key) {
    let new_end = 0;
    if (key === "c" && valid.messages?.end_chapter_is_zero || key === "v" && valid.messages?.end_verse_is_zero) {
      return new_end;
    }
    if (start_obj[key] >= 10 && end_obj[key] < 10 && start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]) {
      new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10);
    } else if (start_obj[key] >= 100 && end_obj[key] < 100 && start_obj[key] - 100 < end_obj[key]) {
      new_end = end_obj[key] + 100;
    }
    return new_end;
  }
  // The range doesn't look valid, but maybe we can fix it. If not, convert it to a sequence.
  range_handle_invalid(valid, passage, start, start_obj, end, end_obj, accum) {
    if (valid.valid === false && (valid.messages?.end_chapter_before_start || valid.messages?.end_verse_before_start) && (end.type === "integer" || end.type === "v") || valid.valid === false && valid.messages?.end_chapter_before_start && end.type === "cv") {
      const new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
      if (new_end > 0) {
        return this.range_change_end(passage, accum, new_end);
      }
    }
    if (this.options.end_range_digits_strategy === "verse" && start_obj.v == null && (end.type === "integer" || end.type === "v")) {
      const temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
      const temp_valid = this.validate_ref(passage.start_context.translations, {
        b: start_obj.b,
        c: start_obj.c,
        v: temp_value
      });
      if (temp_valid.valid) {
        return this.range_change_integer_end(passage, accum);
      }
    }
    passage.original_type ??= passage.type;
    passage.type = "sequence";
    [passage.original_value, passage.value] = [[start, end], [[start], [end]]];
    return this.sequence(passage, accum, structuredClone(passage.start_context));
  }
  // The range looks valid, but we should check for some special cases.
  range_handle_valid(valid, passage, start, start_obj, end, end_obj, accum) {
    if (valid.messages?.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && !start_obj.v && (end.type === "integer" || end.type === "v") && this.options.passage_existence_strategy.indexOf("v") >= 0) {
      const temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
      const temp_valid = this.validate_ref(passage.start_context.translations, {
        b: start_obj.b,
        c: start_obj.c,
        v: temp_value
      });
      if (temp_valid.valid) {
        return [true, this.range_change_integer_end(passage, accum)];
      }
    }
    this.range_validate(valid, start_obj, end_obj, passage);
    return [false, null];
  }
  // If the end object goes past the end of the book or chapter, snap it back to a verse that exists.
  range_validate(valid, start_obj, end_obj, passage) {
    if (valid.messages?.end_chapter_not_exist || valid.messages?.end_chapter_not_exist_in_single_chapter_book) {
      end_obj.c = valid.messages.end_chapter_not_exist ?? valid.messages.end_chapter_not_exist_in_single_chapter_book;
      if (end_obj.v != null) {
        end_obj.v = this.validate_ref(passage.start_context.translations, {
          b: end_obj.b,
          c: end_obj.c,
          v: 999
        }).messages.end_verse_not_exist;
        delete valid.messages.end_verse_is_zero;
      }
    } else if (valid.messages?.end_verse_not_exist) {
      end_obj.v = valid.messages.end_verse_not_exist;
      delete end_obj.p;
    }
    if (valid.messages?.end_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
      end_obj.v = valid.messages.end_verse_is_zero;
    }
    if (valid.messages?.end_chapter_is_zero) {
      end_obj.c = valid.messages.end_chapter_is_zero;
    }
    [start_obj.c, start_obj.v] = this.fix_start_zeroes(valid, start_obj.c, start_obj.v);
  }
  // ## Stop Token
  // Include it in `accum` so that it can stop backpropagation for translations. No context goes forward or backward past a `stop` token.
  stop(passage, accum, context) {
    passage.start_context = {};
    accum.push(passage);
    return [accum, {}];
  }
  // ## Translations
  // Even a single translation ("NIV") appears as part of a translation sequence. Here we handle the sequence and apply the translations to any previous passages lacking an explicit translation: in "Matt 1, 5 ESV," both `Matt 1` and `5` get applied, but in "Matt 1 NIV, 5 ESV," NIV only applies to Matt 1, and ESV only applies to Matt 5.
  translation_sequence(passage, accum, context) {
    passage.start_context = structuredClone(context);
    const translations = [];
    translations.push({
      translation: this.books[passage.value[0].value].parsed,
      system: "default",
      osis: ""
    });
    for (const val of passage.value[1]) {
      const translation = this.books[this.pluck("translation", val).value].parsed;
      if (translation) {
        translations.push({
          translation,
          system: "default",
          osis: ""
        });
      }
    }
    for (const translation of translations) {
      if (this.translations.aliases[translation.translation]) {
        translation.system = this.translations.aliases[translation.translation].system;
        translation.osis = this.translations.aliases[translation.translation].osis || translation.translation.toUpperCase();
      } else {
        translation.osis = translation.translation.toUpperCase();
      }
    }
    if (accum.length > 0) {
      context = this.translation_sequence_apply(accum, translations);
    }
    passage.absolute_indices = this.get_absolute_indices(passage.indices);
    accum.push(passage);
    this.reset_context(context, ["translations"]);
    return [accum, context];
  }
  // Go back and find the earliest already-parsed passage without a translation. We start with 0 because the below loop will never yield a 0.
  translation_sequence_apply(accum, translations) {
    let use_i = 0;
    for (let i = accum.length - 1; i >= 0; i--) {
      if (accum[i].original_type) {
        accum[i].type = accum[i].original_type;
      }
      if (accum[i].original_value) {
        accum[i].value = accum[i].original_value;
      }
      if (accum[i].type === "translation_sequence" || accum[i].type === "stop") {
        use_i = i + 1;
        break;
      }
    }
    let context;
    if (use_i < accum.length) {
      accum[use_i].start_context.translations = translations;
      [, context] = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context);
    } else {
      context = structuredClone(accum[accum.length - 1].start_context);
    }
    return context;
  }
  // ## Word
  // It doesn't need to be preserved in `accum` since it has no effect on parsing and we don't do anything with it.
  word(passage, accum, context) {
    return [accum, context];
  }
  // ## Utilities
  // Pluck the object or value matching a type from an array.
  pluck(type, passages) {
    for (const passage of passages) {
      if (passage && passage.type && passage.type === type) {
        return passage;
      }
    }
    return null;
  }
  pluck_integer(type, passages) {
    return this.pluck("integer", this.pluck(type, passages).value);
  }
  // Pluck the last object or value matching a type, descending as needed into objects.
  pluck_last_recursively(type, passages) {
    for (let i = passages.length - 1; i >= 0; i--) {
      const passage = passages[i];
      if (!passage || !passage.type) {
        continue;
      }
      if (passage.type === type) {
        return this.pluck(type, [passage]);
      }
      const value = this.pluck_last_recursively(type, passage.value);
      if (value != null) {
        return value;
      }
    }
    return null;
  }
  // Set available context keys.
  set_context_from_object(context, keys, obj) {
    for (const key of keys) {
      if (obj[key] == null) {
        continue;
      }
      context[key] = obj[key];
    }
  }
  // Delete existing context keys if, for example, starting with a new book. Which keys are deleted depends on the caller.
  reset_context(context, keys) {
    for (const key of keys) {
      delete context[key];
    }
  }
  get_partial_verse(object_with_partial) {
    if (object_with_partial.type !== "integer") {
      object_with_partial = this.pluck("integer", object_with_partial.value);
    }
    if (typeof object_with_partial.partial === "string") {
      return object_with_partial.partial;
    }
    return null;
  }
  // If the start chapter or verse is 0 and the appropriate option is set to `upgrade`, convert it to a 1.
  fix_start_zeroes(valid, c, v = void 0) {
    if (valid.messages?.start_chapter_is_zero && this.options.zero_chapter_strategy === "upgrade") {
      c = valid.messages.start_chapter_is_zero;
    }
    if (valid.messages?.start_verse_is_zero && this.options.zero_verse_strategy === "upgrade") {
      v = valid.messages.start_verse_is_zero;
    }
    return [c, v];
  }
  // Given a string and initial index, calculate indices for parts of the string. For example, a string that starts at index 10 might have a book that pushes it to index 12 starting at its third character.
  calculate_indices(match, adjust) {
    let switch_type = "book";
    const indices = [];
    let match_index = 0;
    if (typeof adjust !== "number") {
      adjust = parseInt(adjust, 10);
    }
    for (let part of match.split(/[\x1e\x1f]/)) {
      switch_type = switch_type === "book" ? "rest" : "book";
      const part_length = part.length;
      if (part_length === 0) {
        continue;
      }
      if (switch_type === "book") {
        const part_i = parseInt(part.replace(/\/\d+$/, ""), 10);
        const end_index = match_index + part_length;
        if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
          indices[indices.length - 1].end = end_index;
        } else {
          indices.push({
            start: match_index,
            end: end_index,
            index: adjust
          });
        }
        match_index += part_length + 2;
        adjust = this.books[part_i].start_index + this.books[part_i].value.length - match_index;
        indices.push({
          start: end_index + 1,
          end: end_index + 1,
          index: adjust
        });
      } else {
        const end_index = match_index + part_length - 1;
        if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
          indices[indices.length - 1].end = end_index;
        } else {
          indices.push({
            start: match_index,
            end: end_index,
            index: adjust
          });
        }
        match_index += part_length;
      }
    }
    return indices;
  }
  // Find the absolute string indices of start and end points.
  get_absolute_indices([start, end]) {
    let start_out = null;
    let end_out = null;
    for (const index of this.indices) {
      if (start_out === null && index.start <= start && start <= index.end) {
        start_out = start + index.index;
      }
      if (index.start <= end && end <= index.end) {
        end_out = end + index.index + 1;
        break;
      }
    }
    return [start_out, end_out];
  }
  // Apply common transformations at the end of handling a passage object with a book.
  normalize_passage_and_alternates(passage, alternates, adjust_end_index_by = 0) {
    if (passage.passages.length === 0) {
      passage.passages.push(alternates.shift());
    }
    if (alternates.length > 0) {
      passage.passages[0].alternates = alternates;
    }
    if (passage.start_context.translations) {
      passage.passages[0].translations = passage.start_context.translations;
    }
    if (passage.absolute_indices == null || adjust_end_index_by !== 0) {
      passage.absolute_indices = this.get_absolute_indices(passage.indices);
      if (adjust_end_index_by !== 0) {
        passage.absolute_indices[1] += adjust_end_index_by;
      }
    }
  }
  // ## Validators
  // Given a start and optional end bcv object, validate that the verse exists and is valid. It returns a `true` value for `valid` if any of the translations is valid.
  validate_ref(translations, start, end = null) {
    if (!translations || translations.length === 0 || !Array.isArray(translations)) {
      translations = [{
        osis: "",
        translation: "current",
        system: "current"
      }];
    }
    let valid = false;
    const messages = {};
    for (const translation of translations) {
      if (!translation.system) {
        messages.translation_invalid ??= [];
        messages.translation_invalid.push(translation);
        continue;
      }
      if (!this.translations.aliases[translation.system]) {
        translation.system = "current";
        messages.translation_unknown ??= [];
        messages.translation_unknown.push(translation);
      }
      let [temp_valid] = this.validate_start_ref(translation.system, start, messages);
      if (end) {
        [temp_valid] = this.validate_end_ref(translation.system, start, end, temp_valid, messages);
      }
      if (temp_valid === true) {
        valid = true;
      }
    }
    return { valid, messages };
  }
  // The end ref pretty much just has to be after the start ref; beyond the book, we don't require the chapter or verse to exist. This approach is useful when people get end verses wrong.
  validate_end_ref(system, start, end, valid, messages) {
    const order_system = this.translations.systems[system]?.order ? system : "current";
    if (end.c === 0) {
      messages.end_chapter_is_zero = 1;
      if (this.options.zero_chapter_strategy === "error") {
        valid = false;
      } else {
        end.c = 1;
      }
    }
    if (end.v === 0) {
      messages.end_verse_is_zero = 1;
      if (this.options.zero_verse_strategy === "error") {
        valid = false;
      } else if (this.options.zero_verse_strategy === "upgrade") {
        end.v = 1;
      }
    }
    if (end.b && this.translations.systems[order_system].order[end.b]) {
      valid = this.validate_known_end_book(system, order_system, start, end, valid, messages);
    } else {
      valid = false;
      messages.end_book_not_exist = true;
    }
    return [valid, messages];
  }
  // Validate when the end book is known to exist. This function makes `validate_end_ref` easier to follow.
  validate_known_end_book(system, order_system, start, end, valid, messages) {
    const chapter_array = this.translations.systems[system]?.chapters?.[end.b] || this.translations.systems.current.chapters[end.b];
    if (end.c == null && chapter_array.length === 1) {
      end.c = 1;
    }
    if (this.translations.systems[order_system].order[start.b] != null && this.translations.systems[order_system].order[start.b] > this.translations.systems[order_system].order[end.b]) {
      if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
        valid = false;
      }
      messages.end_book_before_start = true;
    }
    if (start.b === end.b && end.c != null) {
      start.c ??= 1;
      if (start.c > end.c) {
        valid = false;
        messages.end_chapter_before_start = true;
      } else if (start.c === end.c && end.v != null) {
        start.v ??= 1;
        if (start.v > end.v) {
          valid = false;
          messages.end_verse_before_start = true;
        }
      }
    }
    if (end.c != null && chapter_array[end.c - 1] == null) {
      if (chapter_array.length === 1) {
        messages.end_chapter_not_exist_in_single_chapter_book = 1;
      } else if (end.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
        messages.end_chapter_not_exist = chapter_array.length;
      }
    }
    if (end.v != null) {
      end.c ??= chapter_array.length;
      if (end.v > chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
        messages.end_verse_not_exist = chapter_array[end.c - 1];
      }
    }
    return valid;
  }
  // Validate and apply options when we know the start book is valid. This function makes `validate_start_ref` easier to follow.
  validate_known_start_book(system, start, messages) {
    let valid = true;
    start.c ??= 1;
    const chapter_array = this.translations.systems[system]?.chapters?.[start.b] || this.translations.systems.current.chapters[start.b];
    if (start.c === 0) {
      messages.start_chapter_is_zero = 1;
      if (this.options.zero_chapter_strategy === "error") {
        valid = false;
      } else {
        start.c = 1;
      }
    }
    if (start.v === 0) {
      messages.start_verse_is_zero = 1;
      if (this.options.zero_verse_strategy === "error") {
        valid = false;
      } else if (this.options.zero_verse_strategy === "upgrade") {
        start.v = 1;
      }
    }
    if (start.c > 0 && chapter_array[start.c - 1] != null) {
      if (start.v != null) {
        if (start.v > chapter_array[start.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
          valid = false;
          messages.start_verse_not_exist = chapter_array[start.c - 1];
        }
      } else if (start.c === 1 && chapter_array.length === 1) {
        if (this.options.single_chapter_1_strategy === "verse") {
          messages.start_verse_1 = 1;
        } else {
          messages.start_chapter_1 = 1;
        }
      }
    } else {
      const chapter_array_length = chapter_array.length;
      if (start.c !== 1 && chapter_array_length === 1) {
        valid = false;
        messages.start_chapter_not_exist_in_single_chapter_book = 1;
      } else if (start.c > 0 && this.options.passage_existence_strategy.indexOf("c") >= 0) {
        valid = false;
        messages.start_chapter_not_exist = chapter_array_length;
      }
    }
    return valid;
  }
  // Make sure that the start ref exists in the given translation.
  validate_start_ref(system, start, messages) {
    let valid = true;
    const order_system = this.translations.systems[system]?.order ? system : "current";
    if (!start.b) {
      valid = false;
      messages.start_book_not_defined = true;
    } else if (this.translations.systems[order_system].order[start.b]) {
      valid = this.validate_known_start_book(system, start, messages);
    } else {
      if (this.options.passage_existence_strategy.indexOf("b") >= 0) {
        valid = false;
      }
      messages.start_book_not_exist = true;
    }
    return [valid, messages];
  }
};

// build/bcv_regexps_manager.ts
var bcv_regexps_manager = class {
  constructor(parent) {
    this.filtered_books_flags = "";
    this.parent = parent;
    this.filter_books("on", "none");
  }
  filter_books(testaments, case_sensitive) {
    const filtered_books_flags = testaments + "/" + case_sensitive;
    if (filtered_books_flags === this.filtered_books_flags) {
      return;
    }
    this.filtered_books_flags = filtered_books_flags;
    if (testaments === "ona" && case_sensitive === "none") {
      this.parent.regexps.books = this.parent.regexps.all_books;
    }
    this.parent.regexps.books = this.parent.regexps.all_books.reduce((accum, book) => {
      let cloned_book;
      if (testaments !== "ona" && testaments.indexOf(book.testament) === -1) {
        if (book.testament.length === 1 || book.testament_books == null) {
          return accum;
        } else if (!this.has_testament_overlap(testaments, book.testament)) {
          return accum;
        } else {
          const new_osis = this.get_testament_overlap(testaments, book);
          if (new_osis.length > 0) {
            cloned_book = structuredClone(book);
            cloned_book.osis = new_osis;
          } else {
            return accum;
          }
        }
      }
      if (case_sensitive.includes("books")) {
        cloned_book ??= structuredClone(book);
        const flags = cloned_book.regexp.flags.replace("i", "");
        cloned_book.regexp = new RegExp(book.regexp.source, flags);
      }
      accum.push(cloned_book ?? book);
      return accum;
    }, []);
  }
  has_testament_overlap(testaments, book_testament) {
    const components = new Set((testaments + book_testament).split(""));
    if (components.size < testaments.length + book_testament.length) {
      return true;
    }
    return false;
  }
  // Filter the `osis` array on the `book` object to include only the books that are in the relevant testaments.
  get_testament_overlap(testaments, book) {
    const new_osis = book.osis.filter((osis) => {
      return this.has_testament_overlap(testaments, book.testament_books[osis]);
    });
    return new_osis;
  }
  // Runtime pattern changes to allow adding books without regenerating the whole module.
  add_books(books) {
    if (books == null || !Array.isArray(books.books)) {
      throw new Error("add_books: The argument to `add_books` should be an object with an array in `books`");
    }
    const starts = [];
    const ends = [];
    for (const pattern of books.books) {
      if (pattern == null || !(pattern.regexp instanceof RegExp)) {
        throw new Error("add_books: The `regexp` property of each pattern should be a RegExp");
      }
      const book_data = this.get_book_testaments(pattern);
      const regexps = this.get_book_pattern_regexps(pattern, book_data);
      const regexp = new RegExp(regexps.pre_regexp.source + regexps.regexp.source + regexps.post_regexp.source, "giu");
      const position = typeof pattern.insert_at === "string" ? pattern.insert_at : "start";
      const insert_object = {
        osis: pattern.osis,
        testament: book_data.testament,
        regexp
      };
      if (book_data.testament.length > 1) {
        insert_object.testament_books = book_data.testament_books;
      }
      if (position === "start") {
        starts.push(insert_object);
      } else if (position === "end") {
        ends.push(insert_object);
      } else {
        let has_inserted = false;
        for (const [i, book] of this.parent.regexps.all_books.entries()) {
          if (book.osis.join(",") === position) {
            this.parent.regexps.all_books.splice(i, 0, insert_object);
            has_inserted = true;
            break;
          }
        }
        if (has_inserted === false) {
          ends.push(insert_object);
        }
      }
    }
    if (starts.length > 0 || ends.length > 0) {
      this.parent.regexps.all_books = [...starts, ...this.parent.regexps.all_books, ...ends];
    }
    this.filtered_books_flags = "";
    this.filter_books(this.parent.options.testaments, this.parent.options.case_sensitive);
  }
  // Make the regexps that will be fed back to the pattern. Ultimately we want to know what will go before and after the provided pattern.
  get_book_pattern_regexps(pattern, book_data) {
    let regexps = {
      pre_regexp: new RegExp(""),
      regexp: pattern.regexp,
      post_regexp: new RegExp("")
    };
    for (const regexp_type of ["pre_regexp", "post_regexp"]) {
      if (pattern[regexp_type] == null) {
        let regexp_key = regexp_type === "pre_regexp" ? "pre_book" : "post_book";
        if (book_data.has_number_book && regexp_key === "pre_book") {
          regexp_key = "pre_number_book";
        }
        regexps[regexp_type] = this.parent.regexps[regexp_key];
      } else {
        if (pattern[regexp_type] instanceof RegExp) {
          regexps[regexp_type] = pattern[regexp_type];
        } else {
          throw new Error("add_books: The `" + regexp_type + "` property of each pattern should be a RegExp");
        }
      }
    }
    return regexps;
  }
  // Get data about the testaments the books are in to create RegExps for them.
  get_book_testaments(pattern) {
    const books = pattern.osis;
    if (!Array.isArray(books)) {
      throw new Error("add_books: The `osis` property of each pattern should be an array");
    }
    const out = {
      testament_books: {},
      has_number_book: false,
      testament: ""
    };
    const testaments = /* @__PURE__ */ new Set();
    for (const book of books) {
      if (typeof book !== "string" || this.parent.translations.systems.default.order[book] == null) {
        throw new Error("add_books: Unknown book in pattern: " + book);
      }
      if (book in out.testament_books) {
        throw new Error("add_books: Every provided book should be unique. Duplicate: " + book);
      }
      let testament = "o";
      if (book === "Ps") {
        out.testament_books[book] = "oa";
        testaments.add("o");
        testaments.add("a");
      } else {
        const canonical_order = this.parent.translations.systems.default.order[book];
        if (canonical_order >= 40) {
          testament = canonical_order <= 66 ? "n" : "a";
        }
        if (/^\d/.test(book) && /\d/.test(pattern.regexp.source)) {
          out.has_number_book = true;
        }
        out.testament_books[book] = testament;
        testaments.add(testament);
      }
    }
    if (testaments.size === 1) {
      out.testament = testaments.values().next().value;
    } else {
      for (const key of ["o", "n", "a"]) {
        if (testaments.has(key)) {
          out.testament += key;
        }
      }
    }
    return out;
  }
};

// build/bcv_translations_manager.ts
var bcv_translations_manager = class {
  constructor(parent) {
    this.parent = parent;
  }
  translation_info(system = "default") {
    if (typeof system !== "string" || !system) {
      system = "default";
    }
    if (this.parent.translations.aliases[system]?.system) {
      system = this.parent.translations.aliases[system].system;
    }
    if (this.parent.translations.systems[system] == null) {
      if (this.parent.options.warn_level === "warn") {
        console.warn("Unknown translation `" + new_translation + "` in translation_info(). Using default instead.");
      }
      system = "default";
    }
    const old_system = this.parent.options.versification_system;
    this.parent.options.versification_system = system;
    const out = {
      alias: system,
      books: [],
      chapters: structuredClone(this.parent.translations.systems.current.chapters),
      order: structuredClone(this.parent.translations.systems.current.order),
      system
    };
    for (const [book, id] of Object.entries(out.order)) {
      out.books[id - 1] = book;
    }
    if (system !== old_system) {
      this.parent.options.versification_system = old_system;
    }
    return out;
  }
  add_translations(new_translations) {
    if (new_translations?.translations == null || !Array.isArray(new_translations.translations) || new_translations.translations.length === 0) {
      throw new Error("add_translations: A `translations array in the `translations` key should have at least one object");
    }
    const normalized_translations = {};
    const texts_for_regexp = [];
    for (const translation of new_translations.translations) {
      const normalized_translation = this.normalize_sent_translation_data(translation);
      const insert_key = translation.text.toLowerCase();
      if (insert_key === "default" || insert_key === "current") {
        throw new Error("add_translations: Can't redefine `" + insert_key + "` as a translation. This built-in translation can't be redefined");
      }
      const system = normalized_translation.system;
      if (system !== "default" && this.parent.translations.systems[normalized_translation.system] == null) {
        if (new_translations.systems != null && new_translations.systems[system] != null) {
          this.add_system(normalized_translation.system, new_translations.systems[system]);
        } else {
          let valid_systems = Object.keys(this.parent.translations.systems);
          valid_systems = valid_systems.filter((system2) => system2 !== "current");
          throw new Error("add_translations: Unknown translation `system`: `" + system + "`. Valid `system`s are: `" + Object.keys(valid_systems).join("`, `") + "`. You may want to check that you included this system in `systems`");
        }
      } else if (system === "current") {
        throw new Error("add_translations: Can't use `" + system + "` as a versification system for a new translation");
      }
      if (normalized_translations[insert_key] != null || this.parent.translations.aliases[insert_key] != null) {
        if (this.parent.options.warn_level === "warn") {
          console.warn("add_translations: `" + translation.text + "` already exists. You probably only want to do this if the old definition was wrong");
        }
      } else {
        texts_for_regexp.push(translation.text);
      }
      normalized_translations[insert_key] = normalized_translation;
    }
    if (texts_for_regexp.length > 0) {
      this.add_new_translations_regexp(texts_for_regexp, new_translations);
    }
    this.parent.translations.aliases = { ...normalized_translations, ...this.parent.translations.aliases };
  }
  apply_case_sensitive(case_sensitive) {
    const flags = case_sensitive.includes("translations") ? "g" : "gi";
    for (const [i, translation] of this.parent.regexps.translations.entries()) {
      this.parent.regexps.translations[i] = new RegExp(translation.source, flags);
    }
  }
  // Normalizes the translation data and ensures it's valid.
  normalize_sent_translation_data(translation) {
    const text = translation.text;
    if (text == null || typeof text !== "string" || text.length === 0) {
      throw new Error('add_translations: Each translation object should contain a string `text` key with a value like "KJV"');
    }
    if (text.match(/^\p{N}+$/u)) {
      throw new Error("add_translations: A translation.text (`" + text + "`) can't be all numbers because then it would conflict with chapter and verse references.");
    }
    const osis = typeof translation.osis === "string" && translation.osis !== "" ? translation.osis : translation.text.toUpperCase();
    const system = typeof translation.system === "string" && translation.system.length > 0 ? translation.system : "default";
    return {
      osis,
      system
    };
  }
  // Create the new translation definition.
  add_system(system, new_system) {
    if (system === "default" || system === "current") {
      throw new Error("add_translations: Can't use `" + system + "` as a versification system. This built-in system can't be redefined");
    }
    if (new_system == null || new_system.books == null && new_system.chapters == null) {
      throw new Error("add_translations: The system object should contain `books` key, a `chapters` key or both");
    }
    if (this.parent.translations.systems[system] != null) {
      return;
    }
    const out = {};
    if (new_system.books != null) {
      if (!Array.isArray(new_system.books) || new_system.books.length === 0) {
        throw new Error("add_translations: The `books` key in each `system` object should be an array with at least one string in it");
      }
      out.books = this.make_system_books(new_system.books);
    }
    if (new_system.chapters != null) {
      if (typeof new_system.chapters !== "object" || Object.keys(new_system.chapters).length === 0) {
        throw new Error("add_translations: The `chapters` key in the each `system` object should be an object with at least one key");
      }
      this.validate_system_chapters(new_system.chapters);
      out.chapters = structuredClone(new_system.chapters);
    }
    this.parent.translations.systems[system] = out;
  }
  make_system_books(books) {
    const all_books = structuredClone(this.parent.translations.systems.default.order);
    const new_books = {};
    let book_i = 1;
    for (const book of books) {
      if (typeof book !== "string" || all_books[book] == null) {
        throw new Error("add_translations: Got an unexpected OSIS value in `books` (also check for any duplicates): " + book);
      }
      delete all_books[book];
      new_books[book] = book_i;
      book_i++;
    }
    const remaining_books = Object.keys(all_books).sort((a, b) => all_books[a] - all_books[b]);
    for (const book of remaining_books) {
      new_books[book] = book_i;
      book_i++;
    }
    return new_books;
  }
  validate_system_chapters(chapters) {
    const all_books = this.parent.translations.systems.default.order;
    for (const [book, chapter_lengths] of Object.entries(chapters)) {
      if (all_books[book] == null) {
        throw new Error("add_translations: Unexpected book: " + book);
      }
      if (!Array.isArray(chapter_lengths) || chapter_lengths.length == 0) {
        throw new Error("add_translations: Each value in `chapters` should be an array with at least one entry containing the number of verses in each chapter. Check `" + book + "`");
      }
      for (const verse_count of chapter_lengths) {
        if (!(typeof verse_count === "number" && verse_count >= 1 && verse_count <= 200)) {
          throw new Error("add_translations: Unexpected value in `chapters`: " + verse_count + "`. It should be a number between 1 and 200");
        }
      }
    }
  }
  add_new_translations_regexp(texts_for_regexp, new_translations) {
    if (texts_for_regexp.length > 1) {
      texts_for_regexp = texts_for_regexp.sort((a, b) => b.length - a.length);
    }
    const insert_at = new_translations.insert_at === "end" ? "end" : "start";
    const pre_regexp = new_translations?.pre_regexp instanceof RegExp ? new_translations?.pre_regexp : { source: "" };
    const post_regexp = new_translations?.post_regexp instanceof RegExp ? new_translations?.post_regexp : /(?![\p{L}\p{N}])/u;
    const flags = this.parent.options.case_sensitive.includes("translations") ? "g" : "gi";
    const regexp = new RegExp(pre_regexp.source + "(" + texts_for_regexp.map((translation) => translation.replace(/([$\\.*+?()\[\]{}|^])/g, "\\$1")).join("|") + ")" + post_regexp.source, flags);
    if (insert_at === "start") {
      this.parent.regexps.translations.unshift(regexp);
    } else {
      this.parent.regexps.translations.push(regexp);
    }
  }
};

// build/cjs_bundle.ts
var bcv_regexps = class {
  constructor() {
    this.books = [];
    this.languages = ["ar", "bg", "ceb", "cs", "cy", "da", "de", "el", "en", "es", "fa", "fi", "fr", "he", "hi", "hr", "ht", "hu", "id", "is", "it", "ja", "jv", "ko", "la", "mk", "mr", "ne", "nl", "no", "or", "pa", "pl", "pt", "ro", "ru", "sk", "so", "sq", "sr", "sv", "sw", "ta", "th", "tl", "uk", "ur", "vi", "wal", "zh"];
    this.translations = [/(?:N(?:RSVUE|ABRE|ASB|IV|[EL]T)|N(?:RSV|A[BS])|HCSB|(?:N(?:IR|KJ)|AS|E[RS]|KJ|RS)V|TNIV|AMP|CE[BV]|LXX|MSG|CSB)\b/gi];
    // Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`.
    // Start with an inverted book/chapter (cb). The last one doesn't allow plural since it's a single chapter.
    // Then move onto a book, which is the anchor for everything.
    // The `/\d+\x1f` is for special Psalm chapters.
    // The `title` has `[a-z]` instead of `\w` because it could be followed by a number.
    // [a-e] allows `1:1a`.
    this.escaped_passage = /(?:^|[^\x1e\x1f\p{L}\p{N}])((?:(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:[\u2013\u2014\-]|through|thru|to)\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:\d+(?:th|nd|st)\s*ch(?:apter|a?pt\.?|a?p?\.?)?\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*))?\x1f(\d+)(?:\/\d+)?\x1f(?:\/\d+\x1f|[\d\s.:,;\x1e\x1f&\(\)（）\[\]\\/"'\*=~\-–—]|title(?![a-z])|ff(?![a-z0-9])|f(?![a-z0-9])|see\s+also|chapters|chapter|through|compare|chapts|verses|chpts|chapt|chaps|verse|chap|thru|also|chp|chs|cha|and|see|ver|vss|ch|to|cf|vs|vv|v|[a-e](?!\w)|$)+)/giu;
    // These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff. \uff09 is a full-width closing parenthesis.
    this.match_end_split = /\d\W*title|\d\W*(?:ff(?![a-z0-9])|f(?![a-z0-9]))(?:[\s*]*\.)?|\d[\s*]*[a-e](?!\w)|\x1e(?:[\s*]*[)\]\uff09])?|[\d\x1f]/gi;
    this.control = /[\x1e\x1f]/g;
    // These are needed for ranges outside of this class.
    this.first = /(?:1st|1|I|First)\.?\s*/;
    this.second = /(?:2nd|2|II|Second)\.?\s*/;
    this.third = /(?:3rd|3|III|Third)\.?\s*/;
    this.range_and = /(?:[&\u2013\u2014-]|(?:and|compare|cf|see\s+also|also|see)|(?:through|thru|to))/;
    this.range_only = /(?:[\u2013\u2014-]|(?:through|thru|to))/;
    this.pre_book = /(?:^|(?<=[^\p{L}]))/gu;
    this.pre_number_book = /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))/gu;
    this.post_book = /(?:(?=[\d\s\.?:,;\x1e\x1f&\(\)（）\[\]\/"’'\*=~\-–—])|$)/gu;
    // Each book regexp should return one parenthesized object: the book string.
    this.all_books = [
      {
        osis: ["Ps"],
        testament: "a",
        extra: "2",
        // We only want to match a valid OSIS, so we can use a regular `\b` condition. It's always followed by ".1"; the regular Psalms parser can handle `Ps151` on its own.
        regexp: /\b(Ps151)(?=\.1\b)/g
        // It's case-sensitive because we only want to match a valid OSIS. No `u` flag is necessary because we're not doing anything that requires it.
      },
      {
        osis: ["Gen"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Ensimmainen\s*Mooseksen\s*kirj|K(?:itabu\s*cha\s*Kwanza\s*cha\s*Mus|n(?:iha\s*stvoreni|jiga\s*Postank)|\.?\s*stvoreni)|(?:Pierwsz[aey]\s*K|1\.?\s*K)s(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|(?:Prv(?:ni|a)\s*k|1\.\s*k)niha\s*Mojzisov|I(?:\.\s*(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|kniha\s*Mojzisov|Mojzeszow|Mojzisov)|\s*(?:(?:(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|Mojzeszow)|Mojzisov)|kniha\s*Mojzisov))|(?:Pierwsz[aey]\s*Mojze|1\.\s*Mojze|1\s*Mojze)szow|(?:Prvy\s*list|1\s*k\.)\s*Mojzisov|(?:1\.\s*Moo|I\.?\s*Moo)seksen\s*kirj|1\s*kniha\s*Mojzisov|1\s*Mooseksen\s*kirj|Prv(?:ni|[ay])\s*Mojzisov|1\s*k\s*Mojzisov|1\.?\s*Mojzisov|Zanafill|Facere|Buttj)a|(?:(?:Pierwsz[aey]\s*K|1\.?\s*K)s(?:ieg[ai]\s*Moyzeszow|\.?\s*Moyzeszow)|I(?:\.\s*Ks(?:ieg[ai]\s*Moyzeszow|\.?\s*Moyzeszow)|\s*Ks(?:ieg[ai]\s*Moyzeszow|\.?\s*Moyzeszow))|P(?:edai|idaa)yish)e|Ensimmainen\s*Mooseksen|liv\s*Konmansman\s*an|(?:utpattiko\s*pust|Postan)ak|(?:Purwaning\s*Dumad|Bilowgi)i|Erste(?:[nrs]\s*(?:Buch\s*)?Mose|\s*(?:Buch\s*)?Mose)|(?:Forsta\s*Mosebok|1\.?\s*Mosebok)en|Fyrsta\s*bok\s*Mose|Forsta\s*Mosebok|K(?:s(?:ieg[ai]\s*Rodzaj|\.?\s*Rodzaj)u|niha\s*povodu|\.\s*povodu|\s*povodu|ejd)|Fyrsta\s*Mosebok|P(?:ierwsz[aey]\s*Mojz|edaiyesh|ost)|Liber\s*Genesis|(?:1\.\s*Moo|I\.?\s*Moo)seksen|1\.?\s*Buch\s*Mose|Doomettaabaa|(?:E(?:erste|lso)\s*Moze|Gen(?:n(?:e(?:(?:is[eiu]|s[eiu])|es[eiu])|i(?:[ei]s[eiu]|s[eiu]))|e(?:(?:is[eiu]|(?:su|zi))|es[eiu])|i(?:[ei]s[eiu]|s[eiu]))|1e\.\s*Moze|(?:Teremt|1\.\s*Moz|I\.?\s*Moz)e|1e\s*Moze|1\s*Moze)s|1\s*Mooseksen|1\.?\s*Mosebok|1(?:\.\s*Mosebog|\s*M(?:osebog|z))|P(?:(?:edai(?:yesh|s)|ed(?:aa)?yes)h|ida(?:(?:(?:iy[ei]|ye)|i)|aye)sh)|I\.?\s*Mosebok|K(?:onmansm|ejadi)an|utpat(?:ti(?:ko)?)?|Beresjiet|Ge(?:n(?:neis|es[ei]|eis)?)?|1(?:\.\s*Mo(?:se?)?|\s*Mo(?:(?:os|z)?|se?))|1\.\s*Mojz|I(?:\.\s*Mo(?:jz|s)|\s*Mo(?:jz|[js]))|G(?:ene(?:s(?:[ei]s|a)|za)|n)|M(?:ozes\s*I|wanzo)|Utpaati|Genn?sis|Henesis|1\s*Mojz|1\s*Moj|Jenez|Ro?dz|Hen|Jen|Kej|Mwa|Ter|Zan))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Exod"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:K(?:itabu\s*cha\s*Pili\s*cha\s*Mus|s(?:ieg[ai]\s*Wyjsci|\.?\s*Wyjsci)|njiga\s*Izlask|essaaba|utok)|(?:Drug[ai]\s*K|II\.?\s*K)s(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|(?:Druh[ay]\s*k|II\.?\s*k)niha\s*Mojzisov|Druhy\s*list\s*Mojzisov|2(?:\.\s*(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|kniha\s*Mojzisov|Mojzeszow|Mojzisov)|\s*(?:(?:(?:(?:(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|Mojzeszow)|Mojzisov)|k\s*Mojzisov)|k\.\s*Mojzisov)|kniha\s*Mojzisov))|(?:Drug[ai]\s*Mojze|II\.\s*Mojze|II\s*Mojze)szow|Druh[ay]\s*Mojzisov|II\.?\s*Mojzisov|Iesire|Dalj)a|T(?:oinen\s*Mooseksen\s*kirja|weede\s*Mozes)|(?:II\.?\s*Moo|2\.\s*Moo)seksen\s*kirja|2\s*Mooseksen\s*kirja|(?:Zweite(?:[nrs])?\s*Buch|2\.?\s*Buch)\s*Mose|liv\s*delivrans\s*lan|Toinen\s*Mooseksen|(?:Andra\s*Mosebok|2\.?\s*Mosebok)en|Onnur\s*(?:bok\s*Mose|Mosebok)|And(?:r(?:a\s*Mosebok|e\s*Mos)|en\s*Mos)|(?:II\.?\s*Moo|2\.\s*Moo)seksen|Anden\s*Mosebog|(?:Masodik|2e\.)\s*Mozes|(?:Andre\s*Mos|II\.?\s*Mos)ebok|Annen\s*Mosebok|(?:Liber\s*Exodu|Delivran|Kivonula|E(?:gzodu|xodi)|2\s*Moze|Ecsodu)s|Zweite(?:[nrs])?\s*Mose|2\s*Mooseksen|(?:Pangentas|Keluar|Nirgam)an|D(?:rug[ai]\s*Mojz|al)|2\.?\s*Mosebok|Baxniintii|2(?:\.\s*Mosebog|\s*M(?:osebog|z))|(?:II\.?\s*Moz|2\.\s*Moz)es|II\.\s*Mojz|K(?:horo(?:j(?:eh|y)|oj)|elr)|(?:Kh(?:or(?:oo)?u|aroo|r(?:aw|o[ou]))|Wy)j|Mozes\s*II|2e\s*Mozes|K(?:horoje?|e(?:ss|l)|iv|ut)|II\s*Mojz|2(?:\.\s*Mo(?:se?|jz)?|\s*Mo(?:(?:(?:os|j|z)?|se?)|jz))|II\.?\s*Mos|Izlazak|II\s*Moj|E(?:x(?:od(?:u[ls]|[eos])|d)|ksod[io]|sodo)|khor(?:ro|oj|j)|Sjemot|nirgam|E(?:gz(?:od)?|x(?:od?)?|kso?|cs)|khorr|Vyhid|Bax|Izl|Wj))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bel"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Istoria\s*(?:omorarii\s*balaurului\s*si\s*a\s*sfaramarii\s*lui\s*Bel|Balaurului)|Danieli\s*na\s*Makuhani\s*wa\s*Beli|Opowiadaniem\s*o\s*Belu\s*i\s*wezu|Histoia\s*Beli\s*et\s*draconis|Dewa\s*Bel\s*dan\s*Naga\s*Babel|Bel\s*og\s*dragen\s*i\s*Babylon|Si\s*Bel\s*(?:at|ug)\s*ang\s*Dragon|B(?:el(?:(?:\s*(?:(?:(?:and|&)\s*(?:the\s*)?Serpent|(?:y\s*el\s*Serpient|(?:and|&)\s*(?:the\s*)?Snak|ja\s*lohikaarm)e|und\s*der?\s*Drache|e(?:t\s*le\s*[Ss]erpent|n\s*de\s*draak|\s*(?:il\s*Drago|o\s*[Dd]ragao))|a(?:['’]r\s*Ddraig|\s*drak))|dan\s*Naga)|a\s*i\s*weza)|\s*es\s*a\s*sarkany)|aal\s*es\s*a\s*sarkany)|Bel\s*(?:und\s*Vom\s*Drache|o(?:ch\s*Ormgud|g\s*(?:Drag|drak))e|og\s*drekin)n|Bel\s*(?:(?:and|&)\s*(?:the\s*)?D|et\s*le\s*[Dd]|y\s*el\s*D)ragon|Bel\s*at\s*ang\s*Dragon|Bel\s*si\s*dragonul|Bel\s*et\s*draconis|(?:Dewa\s*)?Bel))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Poslannja\s*apostola\s*Pavla\s*do\s*Fylymona|P(?:avlova\s*poslanica\s*Filemonu|oslanica\s*Filemonu|h(?:ilemon(?:hoz|[ain])|l?mn)|ilm)|(?:Paulus(?:'\s*Brev\s*ti|’\s*[Bb]rev\s*ti)l|Ka(?:ng|y)|Till)\s*Filemon|Epistulam?\s*ad\s*Philemonem|Bre(?:f\s*Pals\s*til\s*Filemons|vet\s*till?\s*Filemon)|Waraka\s*kwa\s*Filemoni|L(?:ettera\s*a\s*Filemone|ist\s*do\s*Filemona)|Barua\s*kwa\s*Filemoni|(?:Kirje\s*)?Filemonille|(?:List\s*Filemonov|Fil(?:emonov|iman))i|Fil(?:emo(?:n(?:brevet|it|[aeu])|m)|imo(?:unt|n[ain])|m)|ad\s*Philemonem|Filemonhoz|Philemonem|F(?:ilimoon|lm|m)n|Pilimoona|(?:Ph(?:il(?:em(?:o[ou]|aa)|mo?u)|lmou)|Filimu)n|Filimaani|F(?:i(?:l(?:em(?:oni?)?|im(?:ou?n)?))?|(?:ilimoon|lm|m))|Ph(?:ile(?:m(?:on)?)?|l?m)|P(?:h(?:ili|l[ei])|ile)mon))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lev"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:liv\s*Prensip\s*lavi\s*nan\s*Bondy|Levitiqu)e|Tr(?:zeci(?:a\s*(?:Ks(?:ieg[ai]\s*Mojzeszowa|\.?\s*Mojzeszowa)|Mojzeszowa)|\s*(?:Ks(?:ieg[ai]\s*Mojzeszowa|\.?\s*Mojzeszowa)|Mojzeszowa))|eti(?:a\s*(?:kniha\s*)?Mojzisov|\s*(?:kniha\s*)?Mojzisov)a|edje\s*Mosebo(?:ken|g))|(?:Kitabu\s*cha\s*Tatu\s*cha\s*Mus|(?:Kolmas\s*Moo|III\.?\s*Moo)seksen\s*kirj|(?:III\.?\s*k|3\.\s*k)niha\s*Mojzisov|3\.?\s*Mooseksen\s*kirj|3\s*kniha\s*Mojzisov|Laaivyavyavasth|(?:III\.?\s*Mojzi|3\.?\s*Mojzi)sov|3\s*k\.\s*Mojzisov|3\s*k\s*Mojzisov|La[vw]iyan-?ha|Wogaaba|Wajikr|Vajikr)a|(?:III\.?\s*K|3\.?\s*K)s(?:ieg[ai]\s*Mojzeszowa|\.?\s*Mojzeszowa)|l(?:e(?:vi(?:haruko\s*pustak|y)|wiy)|awiy)|(?:Imamat\s*Orang\s*Le|Wala)wi|Dritte(?:[nrs]\s*(?:Buch\s*)?Mose|\s*(?:Buch\s*)?Mose)|(?:Kolmas\s*Moo|III\.?\s*Moo)seksen|(?:Levit(?:ski\s*zakoni|a)|III\.?\s*Mosebo)k|M(?:ambo\s*ya\s*Walawi|ozes\s*III)|(?:III\.?\s*Mojze|3\.?\s*Mojze)szowa|(?:L(?:i(?:ber\s*Levitic|(?:v[ei]t[ei]c|v[ei]tc))u|(?:(?:(?:ebitik|ev[ei]tc)|ev(?:ite|et[ei])c)|efitic)u)|3\s*Moze)s|Tr(?:edje\s*Mos(?:ebok)?|zecia?\s*Mojz)|Harmadik\s*Mozes|3e\.?\s*Moseboken|3(?:\.\s*Mo(?:oseksen|se?|jz)?|\s*Mo(?:oseksen|(?:(?:(?:os|j|z)?|se?)|jz)))|Laawiyiintii|3\.?\s*Mosebo(?:ken|g)|3\.?\s*Buch\s*Mose|3e\.?\s*Mosebok|Derde\s*Mozes|l(?:eviharuko|awi?)|3\.?\s*Mosebok|L(?:e(?:v(?:iti(?:c(?:u(?:si|l)|os)|kus)|(?:itike|y)t)|biti[ck]o)|v)|(?:III\.?\s*Moz|3(?:e\.?\s*Moz|\.\s*Moz))es|L(?:e(?:v(?:i(?:ti(?:c(?:(?:us)?|o)|ku?))?)?|b|f)?|a(?:w(?:iyan)?|aw|v[iy]))|III\.\s*Mojz|I(?:II\.?\s*Mos|mamat)|III\s*Mojz|(?:La(?:awiy?a|wia|v[iy]a)|(?:La(?:v(?:vy?i|yy)|wya)|Kaimam)a|La(?:w[ae]|va)ya|laviya)n|III\s*Moj|Ka?pl|3\s*Mz|W(?:al|og)|Imt))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:D(?:ru(?:he\s*poslannja\s*apostola\s*Pavla\s*do\s*solunj|g(?:a\s*(?:List\s*do\s*)?Tesalonicz|i\s*(?:List\s*do\s*)?Tesalonicz))a|o(?:(?:(?:vom(?:\s*Tessaloni[ck]y|Tessaloni[ck]y)|vom\s*Thesaloniki|vom(?:Th?|\s*T)esaloniki|\s*Th?esaloniki|Th?esaloniki)|(?:(?:vom\s*?Ts|Ts)|\s*Ts)aloniki)a|(?:vom\s*?t|\s*t|t)essalonik[iy]a))|(?:(?:II\.?\s*L|2\.?\s*L)ist\s*do\s*Tesalonicz|II\.?\s*Tesalonicz|2(?:\s*T(?:(?:es(?:saloni[ck]y|aloniki)|hesaloniki)|esalonicz)|\.\s*Tesalonicz)|2Tessaloni[ck]y|2Th?esaloniki)a|2(?:(?:\.?\s*Thaissaluneekiyo|\s*Tsalonikia)|Tsalonikia))n|(?:Paulus(?:'\s*Andet\s*Brev\s*til\s*The|’\s*(?:Andet\s*Brev\s*til\s*Th|andre\s*brev\s*til\s*t)e)ssalonikern|Toinen\s*(?:Kirje\s*tessalonikalaisill|Tessalonikalais(?:kirj|ill))|(?:II\.?\s*K|2\.?\s*K)irje\s*tessalonikalaisill|I(?:kalawang\s*(?:Mga\s*Tesaloni[cs]ens|Tesaloni[cs]ens)|I\.?\s*Mga\s*Tesaloni[cs]ens)|II\.?\s*Tessalonikalaiskirj|2\.\s*Tessalonikalaiskirj|(?:II\.?\s*Tessalonik|2\.?\s*Tessalonik)alaisill|2\s*Tessalonikalaiskirj|Naa77antto\s*Tasalonqq|2\.?\s*Mga\s*Tesaloni[cs]ens|And(?:re|en)\s*Tessalonikern|2(?:\s*[ei]\.?\s*Thesalonikasv|\.\s*(?:T(?:essalonikern|hesalonikasv)|Selanikasv)|\s*T(?:essalonikern|hesalonikasv)|\s*[ei]\.?\s*Selanikasv|\s*Selanikasv)|Do(?:(?:vom\s*?Ts|Ts)|\s*Ts)alonike|2\s*Tsalonike|2Tsalonike)e|Pavlova\s*druga\s*poslanica\s*Solunjanima|Se(?:cond(?:(?:a\s*lettera\s*ai|o)\s*Tessalonicesi|a\s*Tessalonicesi|\s*Thesss)|gundo\s*Tesaloni[cs]enses|cond\s*Th(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)s)|Waraka\s*wa\s*Pili\s*kwa\s*Wathesalonik[ei]|Barua\s*ya\s*Pili\s*kwa\s*Wathesalonike|Epistula\s*(?:II\s*ad\s*Thessalonicenses|ad\s*Thessalonicenses\s*II)|(?:I(?:kalawang\s*(?:Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|Tesalonik)|I\.?\s*Mga\s*Taga(?:-?\s*Tesaloni[ck]|\s*Tesaloni[ck])|I\.?\s*Tesaloniik)|(?:II\.?\s*Solunj|2\.?\s*Solunj)anima\s*Poslanic|2(?:\.\s*(?:Mga\s*Taga-?\s*|Taga-?)|\s*(?:Mga\s*Taga-?\s*|Taga-?))Tesaloni[ck]|2\.?\s*Mga\s*Taga-?Tesaloni[ck]|2\.?\s*Tesaloniik)a|D(?:ru(?:g(?:a\s*(?:(?:Solunjanima\s*Poslanic|poslanica\s*Solunjanim)a|Tesalonicensow)|i\s*Tesalonicensow)|h(?:a\s*kniha\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|y\s*(?:list\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|(?:(?:Tessalonice|Solu)nsky|Soluncano)m|Tesalonic(?:ano|ky)m)|(?:(?:a\s*(?:list\s*(?:Tesalonic|Soluns)|Tessalonicens)|a\s*Soluns)ky|a\s*Soluncano)m|a\s*Tesalonic(?:ano|ky)m))|o(?:vom\s*Thessalonikan|vom\s*?Tessalonikee|vom\s*?Tessalonikan|vomThessalonikan|vom\s*?Tessalonici|\s*T(?:hessalonikan|essalonik(?:ee|an))|T(?:hessalonikan|essalonik(?:ee|an))))|Masodik\s*Th?esszalonikaiakhoz|And(?:r(?:a\s*Th?essalonikerbrevet|e\s*tessalonikerbrev)|e[nt]\s*Thessalonikerbrev)|(?:(?:(?:Deuxieme(?:s\s*Thess?alonic|\s*Thess?alonic)|2(?:eme\.|de?\.)\s*Thess?alonic|2(?:eme\s*|de?\s*)Thess?alonic|II\.?\s*Thessalonc|2e\.?\s*Thesalonic|2\.?\s*Thessalonc)ie|Do(?:vom\s*Thessaloni(?:ci)?a|vom\s*?Tessalonikea|vomThessaloni(?:ci)?a|vom\s*?Tessalonia|\s*T(?:hessaloni(?:ci)?a|essaloni(?:ke)?a)|T(?:hessaloni(?:ci)?a|essaloni(?:ke)?a))|(?:Do(?:vom(?:\s*Thessalonik[ei]|Thessalonik[ei])|\s*Thessalonik[ei]|Thessalonik[ei])|(?:II\.?\s*Thessalono|2\.?\s*Thessalono)i|2(?:\s*Thes(?:salon(?:iki|e)|alonii)|\.\s*Thes(?:salone|alonii))|II(?:\.\s*Thes(?:salone|alonii)|\s*Thes(?:salone|alonii))|2Thessalonik[ei])a|(?:II\.?\s*Thessalonici|2\.\s*Thessalonici)[ae]|(?:2e\.?\s*Thessalonici|II\.?\s*Thesalonici|2\.?\s*Thesalonici)e|II(?:\.\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o))|\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o)))|(?:II\.?\s*Thessalonio|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)i|2\.?\s*Thessalonio)a|(?:II\.?\s*Thessalonii|2\.?\s*Thessalonii)o|(?:Do(?:(?:vom\s*?Ts|Ts)|\s*Ts)alonic|2\s*?Tsalonic)ia|(?:II(?:\.\s*Thess?all|\s*Thess?all)|2(?:\.\s*Thess?all|\s*Thess?all))onia|2(?:\s*T(?:hes(?:saloni(?:c(?:i[ae]|a)|kea|e)|alonio)|essaloni(?:ke)?a)|\.\s*Thes(?:saloni(?:ca|e)|alonio))|2\.?\s*Thessaloniaa|(?:II\.?\s*Thessalono|2\.?\s*Thessalono)a|2\.?\s*Thesalonica|2Thessaloni(?:ci)?a|2Tessalonikea|2Tessalonia)n|Second\s*Thes(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|s?elonain|s(?:alon[ai]n|olonin)|alonin)|2nd\.?\s*Thes(?:(?:salon(?:i(?:c(?:i[ae]|a)|[ao]a|io|e)|aia|cie|oa)|salon(?:oi|e)a|sallonia|al(?:oni[ci]a|lonia|onio))n|s?elonain|s(?:alon[ai]n|olonin)|alonin)|II(?:\.\s*T(?:essalonicense|hess?alonin)|\s*T(?:essalonicense|hess?alonin))|2(?:\.\s*Tessalonicense|(?:\s*Tessalonicense|(?:\.\s*Thess?alonin|\s*Thess?alonin)))|(?:II(?:\.\s*Thess?e|\s*Thess?e)|2(?:\.\s*Thess?e|\s*Thess?e))lonain|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)n|(?:II\.?\s*Thesso|2\.?\s*Thesso)lonin|dovvomt)s|T(?:weede\s*Th?essalonicenzen|esoloniika\s*Labaad)|(?:II(?:\.\s*Th?essz|\s*Th?essz)|2(?:\.\s*Th?essz|\s*Th?essz))alonikaiakhoz|(?:Segundo|2o\.?)\s*Tessalonicenses|(?:Segunda|2a\.?)\s*Tessalonicenses|2\.?\s*Thessalonikerbrevet|Zweite(?:[nrs])?\s*Thessalonicher|ad\s*Thessalonicenses\s*II|Se(?:gundo\s*Tesaloni[cs]ense|cond\s*Th(?:(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)|(?:ess?|s)?))|Masodik\s*T(?:hessz(?:alonika)?|essz(?:alonika)?)|(?:(?:(?:II\.?\s*l|2\.?\s*l)ist\s*Tesalonic|(?:II\.?\s*l|2\.?\s*l)ist\s*Soluns|II\.?\s*Soluns|2\.?\s*Soluns)k|II(?:\.\s*Tes(?:salonicens|alonic)k|\s*Tes(?:salonicens|alonic)k)|(?:(?:2\.?\s*Tessalonicens|2\s*Tesalonic)|2\.\s*Tesalonic)k)ym|2\.?\s*Tessalonikerbrevet|2(?:(?:(?:\.\s*T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|e(?:s(?:s(?:aloniker)?)?)?)|\s*Thessalonikerbrev|\s*T(?:h(?:e(?:s(?:s(?:alonici)?)?)?)?|e(?:s(?:s(?:alonika)?|alonik)?)?|s)|\s*Tessaloniker|e\.?\s*Thess|ts)|\s*Tesalonica)|\.\s*Tesaloni(?:ca|k))|I(?:kalawang\s*Tesalonica|I(?:\.\s*T(?:esaloni(?:ceni|ka)|hesss)|\s*T(?:esaloni(?:ceni|ka)|hesss)))|(?:(?:Do(?:vom\s*?Tessaloniki|\s*Tessaloniki|Tessaloniki)|(?:II(?:\.\s*Thess?e|\s*Thess?e)|2(?:\.\s*Thess?e|\s*Thess?e))loni|2\s*?Tessaloniki)an|II(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|2nd\.?\s*Th(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)|2\.?\s*Tesalonicense|(?:II\.?\s*Thessalonio|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)i|2\.?\s*Thessalonio)n|(?:II\.?\s*Thesso|2\.?\s*Thesso)lonian|2\.?\s*Thessalonian|(?:II\.?\s*Theso|2\.?\s*Theso)lonian|2\.?\s*Thesalonian|Pili\s*The|(?:II\.?\s*Ths|2\.?\s*Ths)s)s|(?:II(?:\.\s*T(?:hessalonicenz|es(?:salonicenz|aloniky))|\s*T(?:hessalonicenz|es(?:salonicenz|aloniky)))|2\.?\s*Thessalonicenz|Dezyem\s*Tesaloniky|2(?:(?:\.\s*Tessalonicenz|\s*Tes(?:salonicenz|aloniky))|\.\s*Tesaloniky))en|2e\.?\s*Thessalonicenzen|(?:II\.?\s*Thessalonicens|2\.?\s*Thessalonicens)es|(?:Do(?:vom\s*?Tessaloniki|\s*Tessaloniki|Tessaloniki)|(?:II(?:\.\s*Thess?e|\s*Thess?e)|2(?:\.\s*Thess?e|\s*Thess?e))loni|2\s*?Tessaloniki)an|2\.o\.?\s*Tesaloni[cs]enses|2\.?\s*tessalonikerbrev|2e\.?\s*Tessalonicenzen|Thessalonicenses\s*II|D(?:o(?:vom\s*Thessaloni(?:ci|ka)|vom\s*?Tessalonika|vomThessaloni(?:ci|ka)|vom\s*?Tsaloniki|\s*T(?:hessaloni(?:ci|ka)|essalonika|saloniki)|T(?:hessaloni(?:ci|ka)|essalonika|saloniki)|vomThess)|ru(?:ga\s*Solunjanima|h(?:a\s*(?:Sol|Te)|y\s*(?:Sol|Te)))|ezyem\s*Tesalonik)|2\.o\.?\s*Tesaloni[cs]ense|And(?:re\s*Tess(?:aloniker)?|en\s*Thess)|2\s*k\.\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|(?:II\.?\s*Tesalonicenso|2\.?\s*Tesalonicenso)w|(?:II\.?\s*Tesalonis|2\.?\s*Tesalonis)enses|2o\.\s*Tesaloni[cs]enses|(?:Pili\s*W|II\.?\s*W|2\.?\s*W)athesalonike|II(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|2nd\.?\s*Th(?:es(?:salon(?:ain|i[ao]n)|(?:so|a)lonian|s?elonian|olonian)|ss)|(?:II\.?\s*Tesalonis|2\.?\s*Tesalonis)ense|2o\.\s*Tesaloni[cs]ense|(?:II(?:\.\s*Th?essz|\s*Th?essz)|2(?:\.\s*Th?essz|\s*Th?essz))(?:alonika)?|(?:II\.?\s*Tesalonican|2\.?\s*Tesalonican)om|2\s*k\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|(?:II\.?\s*Tessalonices|2\.?\s*Tessalonices|Do\s*?Tessalonic)i|2o\s*Tesaloni[cs]enses|(?:II(?:\.\s*Thess?aloniai|\s*Thess?aloniai)|(?:2\.?\s*Thessalonia|2\.?\s*Thesalonia)i)d|2\.?\s*Thessalonicher|2\.?\s*Tesalonicense|(?:II\.?\s*Thessalonio|(?:II\.?\s*Thessalona|2\.?\s*Thessalona)i|2\.?\s*Thessalonio)n|(?:II\.?\s*Thesso|2\.?\s*Thesso)lonian|2o\s*Tesaloni[cs]ense|Wathesalonike\s*II|(?:II\.?\s*Solunj|2\.?\s*Solunj)anima|2\.?\s*Thessalonian|(?:II\.?\s*Theso|2\.?\s*Theso)lonian|2(?:\.\s*Tesaloni(?:ceni|ka)|(?:(?:\s*T(?:es(?:saloni(?:k(?:an|ee)|ci)|alonika|l)|hesss|as)|\.\s*Thesss)|\s*Tesaloniceni))|2(?:(?:\s*Thessalonika|tsl)|Tessalonika)n|II(?:\.\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?)|Sol)|\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?)|Sol))|2(?:(?:\s*Thessalonika|tsl)|Tessalonika)|2\.?\s*Thesalonian|(?:II\.?\s*Solunc|2\.?\s*Solunc)anom|2Thessalonikan|2Thessaloni(?:ci|ka)|2Tessalonikee|Tweede\s*T(?:hess|ess?)|2Tessalonici|2\s*Tsaloniki|2nd\.?\s*Thesss|2Tsaloniki|2nd\.?\s*Th(?:ess?|s)?|Pili\s*The|(?:II\.?\s*Ths|2\.?\s*Ths)s|2e\.?\s*Tess|Pili\s*Th|II\.?\s*Ths|2e\.?\s*Tes|2\.?\s*Sol|2Thess|2\.?\s*Ths))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:P(?:erse\s*poslannja\s*apostola\s*Pavla\s*do\s*solunj|ierwsz[aey]\s*(?:List\s*do\s*)?Tesalonicz)|(?:1\.?\s*L|I\.?\s*L)ist\s*do\s*Tesalonicz|Avval(?:\s*Tessaloni[ck]y|Tessaloni[ck]y)|Avval\s*Thesaloniki|(?:Avval(?:Th?|\s*T)esa|1Th?esa)loniki|1(?:\s*T(?:(?:es(?:saloni[ck]y|aloniki)|hesaloniki)|esalonicz)|\.\s*Tesalonicz)|I\.?\s*Tesalonicz|1Tessaloni[ck]y)an|(?:Ensimmainen\s*(?:Kirje\s*tessalonikalaisill|Tessalonikalais(?:kirj|ill))|Paulus['’]\s*1\.?\s*Brev\s*til\s*Thessalonikern|(?:1\.?\s*K|I\.?\s*K)irje\s*tessalonikalaisill|1\.\s*Tessalonikalaiskirj|I\.?\s*Tessalonikalaiskirj|Una(?:ng\s*(?:Mga\s*Tesaloni[cs]ens|Tesaloni[cs]ens)|\s*(?:Mga\s*Tesaloni[cs]ens|Tesaloni[cs]ens))|1\s*Tessalonikalaiskirj|(?:1\.?\s*Tessalonik|I\.?\s*Tessalonik)alaisill|1\.?\s*Mga\s*Tesaloni[cs]ens|I\.?\s*Mga\s*Tesaloni[cs]ens|1(?:\s*[ei]\.?\s*Thesalonikasv|\.\s*(?:T(?:essalonikern|hesalonikasv)|Selanikasv)|\s*T(?:essalonikern|hesalonikasv)|\s*[ei]\.?\s*Selanikasv|\s*Selanikasv)|Koiro\s*Tasalonqq|(?:Avval\s*?Ts|1Ts)alonike|Yek\s*?Tsalonike|1\s*Tsalonike)e|(?:P(?:avlova\s*prva\s*poslanica\s*Solunjanim|rva\s*(?:Solunjanima\s*Poslanic|poslanica\s*Solunjanim))|(?:1\.?\s*Solu|I\.?\s*Solu)njanima\s*Poslanic|1\.?\s*Tesaloniik|I\.?\s*Tesaloniik)a|Wa(?:raka\s*wa\s*Kwanza\s*kwa\s*Wathesalonik[ei]|thesalonike\s*I)|Barua\s*ya\s*Kwanza\s*kwa\s*Wathesalonike|(?:Prim(?:(?:a\s*lettera\s*ai|o)|a)\s*Tessalonices|1\.?\s*Tessalonices|I\.?\s*Tessalonices)i|(?:Epistula\s*I\s*ad\s*Thessalonicense|(?:Primeir[ao]\s*T|1a\.?\s*T)essalonicense|(?:1\.?\s*Thessalonicens|I\.?\s*Thessalonicens)e|1o\.?\s*Tessalonicense|1(?:\.\s*Tessalonicense|(?:\s*Tessalonicense|(?:\.\s*Thess?alonin|\s*Thess?alonin)))|I(?:\.\s*T(?:essalonicense|hess?alonin)|\s*T(?:essalonicense|hess?alonin))|First\s*Thessalonin|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)n|(?:First\s*Thesso|1st\.\s*Thesso|1st\s*Thesso|1\.?\s*Thesso|I\.?\s*Thesso)lonin|1st\.\s*Thessalonin|(?:First|1st\.?)\s*Thesalonin|1st\s*Thessalonin|Thes(?:s(?:alon[ai]n|olonin)|alonin)|avvalt)s|(?:(?:Epistula\s*)?ad\s*)?Thessalonicenses\s*I|F(?:orsta\s*Th?essalonikerbrevet|irst\s*Thesss)|Una(?:ng\s*(?:Mga\s*Taga(?:-?\s*Tesaloni[ck]a|\s*Tesaloni[ck]a)|Tesaloni[ck]a)|\s*(?:Mga\s*Taga(?:-?\s*Tesaloni[ck]a|\s*Tesaloni[ck]a)|Tesaloni[ck]a))|(?:(?:Premier(?:e?s\s*Thess?alonic|e?\s*Thess?alonic)|1(?:ere?|re)\.\s*Thess?alonic|First\s*Thessalonc|1(?:ere?|re)\s*Thess?alonic|1st\.\s*Thessalonc|1st\s*Thessalonc|1\.?\s*Thessalonc|I\.?\s*Thessalonc)ie|(?:First\s*Thessalonici|1st\.\s*Thessalonici|1st\s*Thessalonici|1\.\s*Thessalonici|I\.?\s*Thessalonici)[ae]|First\s*Thessaloni(?:ca|e)|(?:First\s*Thessaloni[ao]|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)i|1st\.\s*Thessaloni[ao]|1st\s*Thessaloni[ao]|1\.?\s*Thessalonio|I\.?\s*Thessalonio)a|(?:First\s*Thessalonii|1st\.\s*Thessalonii|1st\s*Thessalonii|1\.?\s*Thessalonii|I\.?\s*Thessalonii)o|(?:Avval\s*?Tessalonike|1Tessalonike)a|(?:(?:First\s*Thessalono|1st\.\s*Thessalono|1st\s*Thessalono|1\.?\s*Thessalono|I\.?\s*Thessalono)i|(?:(?:First\s*Thessall|1st\.\s*Thessall|(?:First|1st\.?)\s*Thesall|1st\s*Thessall|1(?:\.\s*Thess?all|\s*Thess?all)|I(?:\.\s*Thess?all|\s*Thess?all))on|Thess?allon)i|First\s*Thessalone|(?:First|1st\.?)\s*Thesaloni[ci]|1st\.\s*Thessalone|(?:Avval\s*?Ts|1Ts)alonici|1(?:\s*Thes(?:salon(?:iki|e)|alonii)|\.\s*Thes(?:salone|alonii))|1st\s*Thessalone|I(?:\.\s*Thes(?:salone|alonii)|\s*Thes(?:salone|alonii))|Thes(?:salon(?:oi|e)|aloni[ci])|1\s*Tsalonici)a|1st\.\s*Thessaloni(?:ca|e)|(?:First\s*Thessalono|1st\.\s*Thessalono|1st\s*Thessalono|1\.?\s*Thessalono|I\.?\s*Thessalono)a|(?:First\s*Thess?e|1st\.\s*Thess?e|1st\s*Thess?e|1(?:\.\s*Thess?e|\s*Thess?e)|I(?:\.\s*Thess?e|\s*Thess?e))lonai|1st\s*Thessaloni(?:ca|e)|Avval\s*?Tessalonia|(?:First|1st\.?)\s*Thesalonio|1(?:\s*T(?:hes(?:saloni(?:c(?:i[ae]|a)|kea|e)|alonio)|essaloni(?:ke)?a)|\.\s*Thes(?:saloni(?:ca|e)|alonio))|1\.?\s*Thessaloniaa|I(?:\.\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o))|\s*Thes(?:saloni(?:aa|ca|e)|aloni(?:ca|o)))|(?:1\.?\s*Thesalonici|I\.?\s*Thesalonici)e|1\.?\s*Thesalonica|Thes(?:s(?:alon(?:i(?:c(?:i[ae]|a)|[ao]a|io)|aia|cie|oa)|elonai)|alonio|elonai)|1Tessalonia)ns|P(?:rv(?:a\s*kniha\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|(?:(?:ni\s*(?:list\s*(?:Tesalonic|Soluns)|(?:Tessalonice|Solu)ns|Tesalonic)|a\s*Soluns)ky|a\s*Soluncano)m|y\s*(?:list\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|a\s*Tesalonic(?:ano|ky)m)|ierwsz[aey]\s*Tesalonicensow)|E(?:lso\s*Th?esszalonikaiakhoz|rste(?:[nrs])?\s*Thessalonicher)|(?:Eerste\s*Th?essalonicenze|1\.?\s*Thaissaluneekiyo|1e\.\s*Th?essalonicenze|(?:1\.?\s*Thessalonicenz|I(?:\.\s*T(?:hessalonicenz|es(?:salonicenz|aloniky))|\s*T(?:hessalonicenz|es(?:salonicenz|aloniky)))|Premye\s*Tesaloniky|1(?:(?:\.\s*Tessalonicenz|\s*Tes(?:salonicenz|aloniky))|\.\s*Tesaloniky))e|1e\s*Th?essalonicenze|(?:Avval\s*?Ts|1Ts)alonikia|1\s*Tsalonikia)n|1(?:\.\s*(?:Mga\s*Taga-?\s*|Taga-?)|\s*(?:Mga\s*Taga-?\s*|Taga-?))Tesaloni[ck]a|I\.?\s*Mga\s*Taga(?:-?\s*Tesaloni[ck]a|\s*Tesaloni[ck]a)|1\.?\s*Thessalonikerbrevet|(?:1(?:\.\s*Th?essz|\s*Th?essz)|I(?:\.\s*Th?essz|\s*Th?essz))alonikaiakhoz|(?:Primer(?:o\s*Tesaloni[cs]ense|\s*Tesaloni[cs]ense)|1\.o\.\s*Tesaloni[cs]ense|(?:First\s*Thessaloni[ao]|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)i|1st\.\s*Thessaloni[ao]|1st\s*Thessaloni[ao]|1\.?\s*Thessalonio|I\.?\s*Thessalonio)n|1o\.?\s*Tesaloni[cs]ense|1\.o\s*Tesaloni[cs]ense|1\.?\s*Tesalonicense|I(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|(?:1\.?\s*Tesalonis|I\.?\s*Tesalonis)ense|1\.?\s*Thessalonian|1\.?\s*Thesalonian|Thessalon(?:ain|i[ao]n)|First\s*Thss|Kwanza\s*The|1st\.\s*Thss|1st\s*Thss|(?:1\.?\s*Ths|I\.?\s*Ths)s)s|1\.?\s*Mga\s*Taga-?Tesaloni[ck]a|Primer(?:o\s*Tesaloni[cs]ense|\s*Tesaloni[cs]ense)|1\.?\s*Tessalonikerbrevet|Avval\s*Thessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|1(?:(?:(?:\.\s*T(?:h(?:e(?:s(?:s(?:alonikerbrev)?)?)?)?|e(?:s(?:s(?:aloniker)?)?)?)|\s*Thessalonikerbrev|\s*T(?:h(?:e(?:s(?:s(?:alonici)?)?)?)?|e(?:s(?:s(?:alonika)?|alonik)?)?|s)|\s*Tessaloniker|ts)|\s*Tesalonica)|\.\s*Tesaloni(?:ca|k))|(?:(?:(?:1\.?\s*l|I\.?\s*l)ist\s*(?:Tesalonic|Soluns)|(?:1\.?\s*Solu|I\.?\s*Solu)ns)k|(?:(?:1\.?\s*Tessalonicens|1\s*Tesalonic)|1\.\s*Tesalonic)k|I(?:\.\s*Tes(?:salonicens|alonic)k|\s*Tes(?:salonicens|alonic)k))ym|(?:Avval\s*?Tessaloniki|(?:First\s*Thess?e|1st\.\s*Thess?e|1st\s*Thess?e|1(?:\.\s*Thess?e|\s*Thess?e)|I(?:\.\s*Thess?e|\s*Thess?e))loni|(?:First\s*Theso|1st\.\s*Theso|1st\s*Theso|1\.?\s*Theso|I\.?\s*Theso)loni|1\s*?Tessaloniki|Thes(?:se|[eo])loni)ans|(?:Avval|1)Thessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|(?:Kwanza\s*W|1\.?\s*W|I\.?\s*W)athesalonike|(?:Avval\s*?Tessaloniki|(?:First\s*Thess?e|1st\.\s*Thess?e|1st\s*Thess?e|1(?:\.\s*Thess?e|\s*Thess?e)|I(?:\.\s*Thess?e|\s*Thess?e))loni|(?:First\s*Theso|1st\.\s*Theso|1st\s*Theso|1\.?\s*Theso|I\.?\s*Theso)loni|1\s*?Tessaloniki|Thes(?:se|[eo])loni)an|1(?:(?:(?:\.\s*(?:tessalonikerbrev|Thesss)|\s*(?:tessalonikerbrev|T(?:es(?:saloni(?:k(?:an|ee)|ci)|alonika|l)|hesss|as)))|\s*Tesaloniceni)|\.\s*Tesaloni(?:ceni|ka))|(?:(?:(?:First\s*Thesso|1st\.\s*Thesso|1st\s*Thesso|1\.?\s*Thesso|I\.?\s*Thesso)|(?:First|1st\.?)\s*Thesa)lonia|Thes(?:so|a)lonia)ns|Avval\s*?tessalonik[iy]an|Yek(?:\s*T(?:hessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|essaloni(?:(?:k(?:ians|ee)|ci)|kan)|(?:essaloni(?:ke)?a|salonicia)ns)|T(?:hessaloni(?:(?:(?:ci)?a|k[ei]a)ns|kan)|essaloni(?:(?:k(?:ians|ee)|ci)|kan)|(?:essaloni(?:ke)?a|salonicia)ns)|(?:\s*Th?esaloniki|Th?esaloniki)an|\s*?tessalonik[iy]an|\s*?Tsalonikian)|E(?:lso\s*T(?:hessz(?:alonika)?|essz(?:alonika)?)|erste\s*T(?:hess|ess?))|1\.o\.\s*Tesaloni[cs]ense|(?:First\s*Thessaloni[ao]|(?:First\s*Thessalona|1st\.\s*Thessalona|1st\s*Thessalona|1\.?\s*Thessalona|I\.?\s*Thessalona)i|1st\.\s*Thessaloni[ao]|1st\s*Thessaloni[ao]|1\.?\s*Thessalonio|I\.?\s*Thessalonio)n|(?:(?:(?:First\s*Thesso|1st\.\s*Thesso|1st\s*Thesso|1\.?\s*Thesso|I\.?\s*Thesso)|(?:First|1st\.?)\s*Thesa)lonia|Thes(?:so|a)lonia)n|Avval\s*Thessaloni(?:ci|ka)|1\s*k\.\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|Tesoloniika\s*Kowaad|(?:Avval\s*?Tessalonike|1Tessalonike)e|(?:Avval\s*?Tessalonika|1(?:(?:\s*Thessalonika|tsl)|Tessalonika))n|1o\.?\s*Tesaloni[cs]ense|1\.o\s*Tesaloni[cs]ense|Avval\s*?Tessalonika|(?:Avval|1)Thessaloni(?:ci|ka)|Yek(?:\s*T(?:essalonikian|hessaloni(?:ci|ka)|essalonika|saloniki)|T(?:essalonikian|hessaloni(?:ci|ka)|essalonika|saloniki))|1\s*k\s*(?:Tesalonic(?:ano|ky)m|Solun(?:cano|sky)m)|(?:1\.?\s*Tesalonicenso|I\.?\s*Tesalonicenso)w|Avval\s*?Tessalonici|1\.?\s*Thessalonicher|Pr(?:v(?:a\s*Solunjanima|ni\s*(?:Sol|Te))|emye\s*Tesalonik)|(?:1(?:\.\s*Th?essz|\s*Th?essz)|I(?:\.\s*Th?essz|\s*Th?essz))(?:alonika)?|1\.?\s*Tesalonicense|I(?:\.\s*T(?:esalonicense|hess?alonian)|\s*T(?:esalonicense|hess?alonian))|(?:1\.?\s*Tesalonis|I\.?\s*Tesalonis)ense|(?:1\.?\s*Tesalonican|I\.?\s*Tesalonican)om|(?:(?:1\.?\s*Thessalonia|1\.?\s*Thesalonia)i|I(?:\.\s*Thess?aloniai|\s*Thess?aloniai))d|(?:Avval\s*?Ts|1Ts)aloniki|1\.?\s*Thessalonian|I(?:\.\s*T(?:esaloni(?:ceni|ka)|hesss)|\s*T(?:esaloni(?:ceni|ka)|hesss))|(?:1\.?\s*Solu|I\.?\s*Solu)njanima|1\.?\s*Thesalonian|1(?:(?:\s*Thessalonika|tsl)|Tessalonika)|I(?:\.\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?)|Sol)|\s*(?:T(?:e(?:s(?:aloni(?:ca|k)|s)?)?|h(?:e(?:ss?)?)?)|Sol))|(?:1\.?\s*Solu|I\.?\s*Solu)ncanom|Thessalon(?:ain|i[ao]n)|1Tessalonici|First\s*Th(?:ess?|s)?|1\s*Tsaloniki|1st\.\s*Thesss|1st\.\s*Th(?:ess?|s)?|AvvalThess|First\s*Thss|Kwanza\s*The|1st\s*Thesss|1st\s*Th(?:ess?|s)?|Kwanza\s*Th|1e\.\s*T(?:hess|ess?)|1st\.\s*Thss|1e\s*T(?:hess|ess?)|1st\s*Thss|(?:1\.?\s*Ths|I\.?\s*Ths)s|1\.?\s*Sol|1\.?\s*Ths|I\.?\s*Ths|1Thess))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Kawotu\s*Maxaafaa\s*Naa77anttuwa|D(?:ruga\s*(?:knjiga\s*o\s*)?Kraljevim|ezyem\s*W)|Toinen\s*Kuninkaiden\s*kirj|II\.?\s*Kuninkaiden\s*kirj|Raja-?raja\s*Yang\s*Kedu|2\.?\s*Kuninkaiden\s*kirj|(?:II\.?\s*Kralj|2\.?\s*Kralj)evim|(?:II\.?\s*Para\s*Ra|(?:(?:2\.?\s*Raja-?r|2\s*Para\s*R)|2\.\s*Para\s*R)a)j|(?:II\.?\s*V|2\.?\s*V)u)a|(?:Kitabu\s*cha\s*Pili\s*cha\s*Wafalm|2\s*[ei]\.?\s*Mbreterv|4(?:(?:\s*[ei]\.?\s*Mb|\s*Mb)|\.\s*Mb)reterv|2\.\s*Mbreterv|Pili\s*Wafalm|2(?:\s*Mbreterv|\.?\s*Konig)|(?:II\.?\s*Waf|2\.?\s*Waf)alm|Second[ao]\s*R)e|F(?:jerde\s*Kongerigernes\s*Bog|ourth\s*Kingdoms)|C(?:artea\s*(?:a\s*patra|IV)\s*a\s*Regilor|zwarta\s*Ks(?:ieg[ai]\s*Krolewska|\.?\s*Krolewska))|(?:Drug(?:a\s*Ks(?:ieg[ai]\s*Krole|\.?\s*Krole)|i\s*Ks(?:ieg[ai]\s*Krole|\.?\s*Krole))|(?:II\.?\s*Ks|2\.?\s*Ks)(?:ieg[ai]\s*Krole|\.?\s*Krole)|2\s*Krole)wska|(?:Druh[ay]\s*kniha\s*kralov|(?:(?:II\.?\s*k|2\.\s*k)|2\s*k)niha\s*kralov)ska|4\.?\s*Kongerigernes\s*Bog|(?:IV\.?\s*Ks|4\.?\s*Ks)(?:ieg[ai]\s*Krolewska|\.?\s*Krolewska)|D(?:rug(?:a\s*Ks(?:ieg[ai]\s*Krolow|\.?\s*Krolow)|i\s*Ks(?:ieg[ai]\s*Krolow|\.?\s*Krolow))|ezyem\s*liv\s*Wa\s*yo)|S(?:tvrta\s*(?:kniha\s*)?Kralov|econd\s*K(?:i?ng?s|(?:i?g|i?)s))|T(?:oinen\s*Kuninkaiden|weede\s*Kon?)|(?:I(?:ka(?:lawang|apat)\s*Mg|(?:I\.?\s*M|V\.?\s*M)g)|2\s*Mg)a\s*Hari|Druha\s*kniha\s*Kralov|Andra\s*K(?:on)?ungaboken|(?:II\.?\s*Ks|2\.?\s*Ks)(?:ieg[ai]\s*Krolow|\.?\s*Krolow)|(?:Druhy\s*list|[24]\s*k\.)\s*Kralov|(?:Do(?:(?:vom(?:\s*[Pp]|[Pp])|p)ad(?:eshahna|eshah[ao]|ishaha|shah[ao])|\s*pad(?:eshahna|eshah[ao]|ishaha|shah[ao]))|2(?:\s*Pad(?:eshahna|eshah[ao]|ishaha|shah[ao])|Pad(?:eshahna|eshah[ao]|ishaha|shah[ao])))n|Boqorradii\s*Labaad|Masodik\s*Kiralyok|II\s*a\s*Imparatilor|II\.?\s*Kuninkaiden|(?:Tweede\s*Konin|(?:(?:II\.?\s*Konin|2\.?\s*Konin)|2e\.?\s*Konin))gen|2\.?\s*Konungaboken|Zweite(?:[nrs]\s*Koe?nige|\s*Koe?nige)|(?:II(?:\.\s*Brenh?inoed|\s*Brenh?inoed)|2\.\s*Brenh?inoed|2\s*Brenh?inoed)d|(?:Druh[ay]\s*Kralovs|(?:II\.?\s*Kralo|2\.?\s*Kralo)vs)ka|(?:Druga\s*Kro|II\.?\s*Kro|2\.\s*Kro)lewska|Drugi\s*Krolewska|2\.?\s*Kuninkaiden|(?:II(?:\.\s*(?:Boqorradi|Imparat)|\s*(?:Boqorradi|Imparat))|2(?:\.\s*Boqorradi|\s*(?:Boqorradi|Har))|2\.?\s*Imparat)i|(?:I(?:kalawang\s*H|I\.?\s*H)|2\.\s*H)ari|Andre\s*Kongebok|Liber\s*II\s*Regum|(?:(?:Deuxiemes?\s*Ro|2(?:eme\.|de?\.)\s*Ro|2(?:eme\s*|de?\s*)Ro|II\.?\s*Ro|2e\.?\s*Ro|2\.?\s*Ro)i|Segund(?:o\s*Re(?:ye|i)|a\s*Rei)|Quart[ao]\s*Reino|(?:2\.(?:o\.?\s*Rey|\s*Rey)|II\.?\s*Rey)e|(?:IV\.?\s*Rei|4\.?\s*Rei)no|4[ao]\.\s*Reino|2o\.\s*Re(?:ye|i)|4[ao]\s*Reino|II\.?\s*Rei|DovomKg|2a\.\s*Rei|2o\s*Re(?:ye|i)|2\.?\s*Rei|2a\s*Rei|2Kg)s|Anden\s*Kongebog|2\.\s*Kungaboken|4th\.\s*Kingdoms|Druh(?:a\s*Kr(?:al(?:ov)?)?|y\s*Kr(?:al(?:ov)?)?)|2\s*Kungaboken|(?:II\.?\s*Kir|2\.?\s*Kir)alyok|(?:IV\.?\s*Regnor|4\.?\s*Regnor)um|(?:IV\.?\s*Ki|4\.?\s*Ki)ngdoms|4th\s*Kingdoms|Second\s*K(?:i?ng?|i?g|i)?|Masodik\s*Kir|2(?:(?:\.\s*Kongebo[gk]|\s*Kongebo[gk]|\s*(?:R(?:ey?s|y?s)|Krl)|Rj)|Raj)|2\.\s*Mga\s*Hari|4(?:\.\s*(?:Mga\s*Har|Reg)i|\s*(?:Mga\s*Har|Reg)i)|Kiralyok\s*II|(?:II\.?\s*Kralo|2\.?\s*Kralo)v|And(?:en|re)\s*Kong|2nd\.?\s*K(?:i?ng?s|(?:i?g|i?)s)|(?:IV\.?\s*Kr|4\.?\s*Kr)alov|[24]\s*k\s*Kralov|(?:Wafalme|Regum)\s*II|2\.?\s*Koenige|2nd\.?\s*K(?:i?ng?|i?g|i)?|(?:II(?:\.\s*Ki?n|\s*Ki?n)|2\.?\s*Kin|2\.?\s*Kn)g?s|(?:II\.?\s*Cari|2\.?\s*Cari)v|(?:II\.?\s*Regu|2\.?\s*Regu)m|II(?:\.\s*(?:K(?:r(?:al)?|i)|Reg?|Boq|Imp|Wa)|\s*(?:(?:(?:(?:K(?:r(?:al)?|i?)|Reg?)|Wa)|Boq)|Imp))|(?:II(?:\.\s*Ki?n|\s*Ki?n)|2\.?\s*Kin|2\.?\s*Kn)g?|II(?:\.\s*(?:Regi|Kis)|\s*(?:Regi|(?:Raj|Kis)))|IV\.?\s*Regi|Pili\s*Fal|(?:II(?:\.\s*Ki?g|\s*Ki?g)|2(?:\s*(?:R(?:ey?e|ye)|Kg)|\.\s*Kg)|2\.?\s*Kig)s|2(?:(?:(?:(?:(?:\.\s*(?:Ko(?:en?|ng?)?|Raja)|\s*(?:(?:(?:K(?:r(?:ol)?|ung?)|Bren|R(?:aj|ey|y)?|Ha|Mb)|Ko(?:en?|ng?)?)|Raja))|\.?\s*Ki)|\s*Kral)|\.\s*Kr(?:al)?)|\.?\s*Reg)|II(?:\.\s*Ki?g|\s*Ki?g)|II\.?\s*Kon?|2e\.?\s*Kon?|II\.?\s*Kir|2\.?\s*Regi|(?:II\.?\s*F|2\.?\s*F)al|2\.\s*Boq|2\.?\s*Imp|2(?:\s*(?:R(?:ey?e|ye)|Kg)|\.\s*Kg)|2\.?\s*Kig|2\.?\s*Kir|2\.?\s*Kis|2\.?\s*Wa|2\s*Boq|2\s*Kaw))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:K(?:itabu\s*cha\s*Kwanza\s*ch|wanz)a\s*Wafalm|1\s*[ei]\.?\s*Mbreterv|3(?:(?:\s*[ei]\.?\s*Mb|\s*Mb)|\.\s*Mb)reterv|Erste(?:[nrs]\s*Koe?nig|\s*Koe?nig)|1\.\s*Mbreterv|1\s*Mbreterv|(?:1\.?\s*Waf|I\.?\s*Waf)alm|1\.?\s*Koenig|1\.?\s*Konig)e|(?:Ensimmainen\s*Kuninkaiden\s*kirj|Kawotu\s*Maxaafaa\s*Koiruwa|Pr(?:va\s*(?:knjiga\s*o\s*)?Kraljevim|emye\s*W)|Raja-?raja\s*Yang\s*Pertam|Fyrri\s*bok\s*konungann|1\.?\s*Kuninkaiden\s*kirj|I\.?\s*Kuninkaiden\s*kirj|(?:1\.?\s*Kralj|I\.?\s*Kralj)evim|(?:(?:(?:1\.?\s*Raja-?r|1\s*Para\s*R)|1\.\s*Para\s*R)a|I\.?\s*Para\s*Ra)j|1\.?\s*Vu|I\.?\s*Vu)a|(?:Pierwsz[aey]\s*Ks(?:ieg[ai]\s*Krole|\.?\s*Krole)|(?:1\.?\s*Ks|I\.?\s*Ks)(?:ieg[ai]\s*Krole|\.?\s*Krole)|1\s*Krole)wska|T(?:r(?:e(?:dje\s*Kongerigernes\s*Bog|ti(?:a\s*(?:kniha\s*)?Kralov|\s*Kralov))|zeci(?:a\s*Ks(?:ieg[ai]\s*Krolewska|\.?\s*Krolewska)|\s*Ks(?:ieg[ai]\s*Krolewska|\.?\s*Krolewska)))|erceir[ao]\s*Reinos|hird\s*Kingdoms)|Cartea\s*(?:a\s*treia|III)\s*a\s*Regilor|E(?:nsimmainen\s*Kuninkaiden|erste\s*Kon?|lso\s*Kir)|P(?:ierwsz[aey]\s*Ks(?:ieg[ai]\s*Krolow|\.?\s*Krolow)|r(?:emye\s*liv\s*Wa\s*yo|im[ao]\s*Re))|(?:Prvni\s*(?:kniha\s*k|K)ralov|(?:(?:1\.\s*k|I\.?\s*k)|1\s*k)niha\s*kralov)ska|(?:III\.?\s*Ks|3\.?\s*Ks)(?:ieg[ai]\s*Krolewska|\.?\s*Krolewska)|3\.?\s*Kongerigernes\s*Bog|(?:(?:(?:(?:(?:(?:Forsta\s*K(?:on)?ungabok|(?:1\.?\s*Konu|1\.?\s*Ku)ngabok)|1\.?\s*Koning)|I\.?\s*Koning)|1e\s*Koning)|1e\.\s*Koning)|Eerste\s*Koning)en|Pierwsz[aey]\s*Krolewska|I(?:katlong\s*M|II\.?\s*M|\.?\s*M)ga\s*Hari|Prva\s*kniha\s*Kralov|(?:Avval(?:\s*[Pp]|[Pp])|1P)ad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n|Boqorradii\s*Kowaad|Fyrri\s*Konungabok|(?:1\.?\s*Ks|I\.?\s*Ks)(?:ieg[ai]\s*Krolow|\.?\s*Krolow)|(?:Prvy\s*list|[13]\s*k\.)\s*Kralov|Yek(?:\s*pad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n|pad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n)|I\s*a\s*Imparatilor|1\.?\s*Kuninkaiden|I\.?\s*Kuninkaiden|Una(?:ng\s*(?:Mga\s*)?Hari|\s*(?:Mga\s*)?Hari)|(?:Pr(?:emier(?:e?s|e?)\s*Roi|imero?\s*Reye|imeir[ao]\s*Rei)|(?:III\.?\s*Ki|3\.?\s*Ki)ngdom|3rd\.\s*Kingdom|3rd\s*Kingdom|1\.o\.\s*Reye|1(?:ere?|re)\.\s*Roi|(?:1(?:o\.?\s*Rey|\.\s*Rey)|I\.?\s*Rey)e|1\.o\s*Reye|1(?:ere?|re)\s*Roi|1(?:o\.?\s*Rei|\.?\s*Rei)|AvvalKg|(?:1a\.\s*Re|1\.?\s*Ro|I\.?\s*Ro|1a\s*Re)i|I\.?\s*Rei|K(?:in)?g|(?:1K|Kn)g)s|(?:1\.\s*Brenh?inoed|I(?:\.\s*Brenh?inoed|\s*Brenh?inoed)|1\s*Brenh?inoed)d|Elso\s*Kiralyok|(?:1(?:\.\s*Boqorradi|\s*(?:Boqorradi|Har))|I(?:\.\s*(?:Boqorradi|Imparat)|\s*(?:Boqorradi|Imparat))|1\.?\s*Imparat)i|1\s*Pad(?:(?:eshahna|(?:eshah[ao]|shah[ao]))|ishaha)n|(?:III\.?\s*Regnor|3\.?\s*Regnor)um|Liber\s*I\s*Regum|(?:1\.?\s*Kralovs|I\.?\s*Kralovs)ka|(?:1\.\s*Kro|I\.?\s*Kro)lewska|1(?:(?:\.\s*Kongebo[gk]|\s*Kongebo[gk]|\s*(?:R(?:ey?s|y?s)|Krl)|Rj)|Raj)|First\s*K(?:i?ng?s|(?:i?g)?s)|(?:1\.?\s*Kir|I\.?\s*Kir)alyok|(?:1\.?\s*Mg|3\.?\s*Mg)a\s*Hari|(?:Prva\s*Kralo|1\.?\s*Cari|I\.?\s*Cari)v|(?:III\.?\s*Kr|3\.?\s*Kr)alov|Prvy\s*Kralov|(?:III\.?\s*Rei|3\.?\s*Rei)nos|First\s*K(?:i?ng?|i?g|i)?|Prvni\s*Kr(?:al)?|Kwanza\s*Fal|1st\.\s*K(?:i?ng?s|(?:i?g)?s)|(?:Kiralyok|Regum)\s*I|[13]\s*k\s*Kralov|3[ao]\.\s*Reinos|1(?:(?:\.\s*Kr(?:al(?:ov)?)?|(?:\s*Kral(?:ov)?|(?:\.\s*(?:K(?:o(?:en?|ng?)?|i)|Raja)|\s*(?:(?:(?:(?:K(?:r(?:ol)?|ung?)|Bren|R(?:aj|ey|y)?|Ha|Mb)|Ki)|Ko(?:en?|ng?)?)|Raja))))|\.?\s*Reg)|I(?:\.\s*(?:Kr(?:al(?:ov)?)?|Reg?|Boq|Imp|Wa)|\s*(?:(?:(?:(?:K(?:r(?:al(?:ov)?)?)?|Reg?)|Wa)|Boq)|Imp))|1st\.\s*K(?:i?ng?|i?g|i)?|III\.?\s*Regi|1st\s*K(?:i?ng?s|(?:i?g)?s)|Wafalme\s*I|3[ao]\s*Reinos|1st\s*K(?:i?ng?|i?g|i)?|(?:1(?:\.\s*Ki?n|\s*Ki?n)|I(?:\.\s*Ki?n|\s*Ki?n))g?s|(?:1\.?\s*Regu|I\.?\s*Regu)m|(?:1(?:\.\s*Ki?n|\s*Ki?n)|I(?:\.\s*Ki?n|\s*Ki?n))g?|1e\.\s*Kon?|1\.?\s*Regi|I(?:\.\s*Regi|\s*R(?:egi|aj))|3\.?\s*Regi|(?:1(?:\s*(?:(?:R(?:ey?e|ye)|Kg)|Kig)|\.\s*Ki?g)|I(?:\.\s*Ki?g|\s*Ki?g))s|(?:1\.\s*H|I\.?\s*H)ari|1\.\s*Boq|1\.?\s*Imp|1(?:\s*(?:(?:R(?:ey?e|ye)|Kg)|Kig)|\.\s*Ki?g)|I(?:\.\s*Ki?g|\s*Ki?g)|1\.?\s*Kir|I\.?\s*Kir|I\.?\s*Kon?|1e\s*Kon?|(?:1\.?\s*F|I\.?\s*F)al|1\.?\s*Wa|1\s*Boq|1\s*Kaw|Kin))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["EpJer"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*(?:(?:Ep(?:istle|\.)|Ep)\s*of\s*Jeremiah|Let(?:ter|\.?)\s*of\s*Jeremiah)|Pismo\s*Jeremije\s*proroka|Ang\s*Liham\s*ni\s*Jeremias|(?:La\s*)?Carta\s*de\s*Jeremias|(?:(?:Epistola\s*lui\s*I|Br(?:ief\s*(?:des|van)\s*J|ef\s*J)|Barua\s*ya\s*Y|Surat\s*Y)eremi|L(?:ettera\s*di\s*Geremi|lythyr\s*Jeremei|ist\s*Jeremiasz))a|Epistle\s*of\s*Jeremiah|Let(?:ter)?\s*of\s*Jeremiah|Epistle\s*of\s*Jeremy|(?:Ep(?:itre\s*de|\.?)\s*Jeremi|Jeremia(?:s\s*level|n\s*kirj))e|Liham\s*ni\s*Jeremias|Jeremi(?:jino\s*pismo|asov\s*list)|Let\.\s*of\s*Jeremiah|Oratio\s*Ieremiae|List\s*Jeremjasuv|Ep\.?\s*of\s*Jeremiah|Jeremias(?:['’]\s*B|\s*b)rev|Carta\s*Jeremias|Carta\s*Jer|(?:Li\s*ni|Sul)\s*Jer|Cart\.?\s*Jer|Ep\.?\s*Jer|(?:Or\.?\s*I|Sur\s*?Y|Let-?g|(?:Ep|B)J)er|(?:Lih|Br)\s*Jer|Jer\s*?br))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Marathi\s*(?:Er(?:yaha?|miaa?)|Irmiaa?)|(?:Chante\s*pou\s*plenn\s*So\s*lavil\s*Jerizalem|(?:(?:Plangerile\s*(?:profetu)?lui\s*I|Maombolezo\s*ya\s*Y)eremi|Lamentacje\s*Jeremiasz|Ermmaasa\s*Zilaassa|Treny\s*Jeremiasz|Marathi(?:\s*(?:Er(?:yiah|mei)|Irmei)|y['’]|['’]y)|Marathi\s*Eryei|Klagovisorn|Nudub\s*Yermi|Nooha-?h|Ai\s*C)a|L(?:am(?:enta(?:(?:coes\s*de\s*Jeremia|tione)s|ciones)|inta(?:cione|tion)s)|m)|Baroorashadii\s*Yeremyaah|(?:Lamenta(?:tions\s*de\s*Jeremi|cij)|Klagesangen|So(?:ug(?:-?n|na)ame-?e|gh-?nam)|Nouh)e|K(?:lagelieder\s*Jeremias|niha\s*narku)|(?:Aklat\s*ng\s*Pa(?:nan|gt)agho|Mga\s*Panagho|Panagho|Narek)y|Jeremi(?:jine\s*tuzaljke|as(?:\s*siralmai|ov\s*Plac))|Galarnad\s*Jeremiah|(?:Ks(?:ieg[ai]\s*Lamentacj|\.?\s*Lamentacj)|Lamentazion)i|Marathi(?:\s*(?:(?:Eryaiya|Eryi?aa)h|Erm[ei]yah|Irm[ei]yah)|(?:(?:ey)?a|y(?:ya|e))h|(?:ya|e)h|['’]i)|(?:Kidung\s*Pangadhu|Marathi(?:\s*(?:Erm['’]yaa|Irm['’]yaa)|yaa)|Sogh-?naame)h|Ma(?:rathi(?:\s*(?:Er(?:y(?:aiya|(?:i?aa|a))|m(?:[ei]|['’])ya)|Irm(?:[ei]|['’])ya)|(?:ey)?a|y(?:ya|e)|ey|y(?:a|y)?|e)?|o(?:mbolezo)?)|P(?:lac\s*Jerem(?:ias[ou]v|jasuv|ii)|ulampal)|(?:Mga\s*(?:Pagbangota|Lamentasyo)|Klaagliedere|Pagbangota|Lamantasyo|Plen)n|(?:Kidung\s*Pasamba|V(?:a(?:litusvirr|jtim)|ilapage)e)t|yarmiyako\s*vilap|S(?:o(?:ug(?:-?name(?:h-?(?:haa|y)|-?y|e)|-?na(?:me(?:ha)?-?h|ameh)a|naameh(?:-?(?:ha|y)|a))|ghnama)|iralmak)|S(?:oug(?:-?na(?:me(?:h(?:-?ha|a)?)?|ame)|naameh)|iralm?)|Baroor(?:ashadii)?|K(?:niha|\.?)\s*narekov|Lam(?:enta(?:tions?|coes)|entacione|inta(?:cione|tion))?|Jeremias\s*sir|Kl(?:a(?:g(?:e(?:lieder|s))?|agl))?|Lamentacje|Marath['’]iya|Marath['’]iy|Zalospevy|P(?:l(?:a(?:ng(?:eri)?|c))?|a(?:na)?g)|Galar(?:nad)?|wilapgit|Tuzaljke|Ratapan|Zalosp|T(?:r(?:eny)?|uz)|Rat(?:ap)?|Va(?:lit|j)|Nooha|Klgl|ErmZ|Nar|Hlj|Omb))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Num"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:Czwarta\s*K|4\.?\s*K)s(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|(?:Neljas|4\.)\s*Mooseksen\s*kirj|(?:(?:(?:(?:Stvrta|4\.)|Ctvrta)\s*kniha|(?:4\s*kniha|(?:(?:(?:[CS]tvrta|4\.?)|4\s*k)|4\s*k\.)))\s*Mojziso|IV(?:\.\s*(?:kniha\s*)?Mojziso|\s*(?:kniha\s*)?Mojziso))v|IV(?:\.\s*(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|Mo(?:oseksen\s*kirj|jzeszow))|\s*(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|Mo(?:oseksen\s*kirj|jzeszow)))|(?:(?:Czwarta|4)|4\.)\s*Mojzeszow|4\s*Mooseksen\s*kirj|Qoodaaba|ganan|Cysl)a|K(?:itabu\s*cha\s*Nne\s*cha\s*Musa|njiga\s*Brojeva|s(?:ieg[ai]\s*Liczb|\.?\s*Liczb))|Vier(?:te(?:[ns]\s*(?:Buch\s*)?Mose|\s*(?:Buch\s*)?Mose)|de\s*Mozes)|(?:Neljas|4\.)\s*Mooseksen|(?:Fjarde\s*Moseboke|4\.?\s*Moseboke|Bilanga)n|liv\s*Resansman\s*an|Fj(?:arde\s*Mosebok|erde\s*Mos)|gantiko\s*pustak|Fjerde\s*Mosebo[gk]|IV(?:\.\s*Mo(?:oseksen|jz|s)|\s*Mo(?:oseksen|(?:jz|[js])))|Czwarta\s*Mojz|(?:Liber\s*Numer|Brojev)i|4\.?\s*Buch\s*Mose|4\s*Mooseksen|(?:IV\.?\s*Mosebo|Szamo)k|M(?:ga\s*(?:Numeros|Bilang)|ozes\s*IV)|Mga\s*Numero|4\.?\s*Mosebok|4(?:\.\s*Mosebog|\s*M(?:osebog|z))|(?:IV\.?\s*Moz|4\.\s*Moz|Nombr)es|(?:Resansm|Wilang)an|B[ae]midbar|Tirintii|4(?:\.\s*Mo(?:se?)?|\s*Mo(?:(?:os|z)?|se?))|4\.\s*Mojz|gantiko|N(?:um(?:ber[is]|rat)|[bm])|Numerii|A['’]edaad|E(?:['’]e?daad|adad)|Numeros|Ginatee|4\s*Mozes|N(?:u(?:m(?:b(?:er)?)?)?|o(?:mb?)?)|Bil(?:ang)?|Numeri|4\s*Mojz|Numero|A(?:edad[ad]|['’]dad)|A(?:e|['’])daad|Hesabu|4\s*Moj|adadi|Liczb|Szam|adad|Adad|Nonb|Res|Tir|Qod|Blg|Lb))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sus"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Su(?:san(?:ne\s*(?:et\s*les\s*(?:deux\s*)?vieillards|au\s*bain)|(?:na(?:\s*(?:ja\s*vanhimma|i\s*bade)t|[eh])|a))|zan(?:ne\s*(?:et\s*les\s*(?:deux\s*)?vieillards|au\s*bain)|a))|Fortellingen\s*om\s*Susanna|Opowiadaniem\s*o\s*Zuzannie|Z(?:suzsanna\s*es\s*a\s*venek|uzan[ae])|(?:Historia\s*de\s*Sus|S(?:i\s*Sus|hosh))ana|Storia\s*di\s*Susanna|Historia\s*Susannae|Istoria\s*Susanei|Z(?:suz(?:s(?:anna)?)?|uz)|Su(?:s(?:anna)?|sanne|z(?:anne)?)?|Susanei|Zuzanna|Swsanna))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sir"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Cartea\s*intelepciunii\s*lui\s*Isus,\s*fiul\s*lui\s*Sirah|Ang\s*Karunungan\s*ni\s*Jesus,?\s*Anak\s*ni\s*Sirac|(?:The\s*Wisdom\s*of\s*Jesus(?:,\s*Son\s*of|\s*(?:Son\s*of|ben))\s*Sirac|Wisdom\s*of\s*Jesus(?:,\s*Son\s*of|\s*(?:Son\s*of|ben))\s*Sirac|(?:Wijsheid\s*van\s*(?:Jozua\s*)?Ben|(?:Wijsheid\s*van\s*)?Jezus|Oratio\s*Iesu\s*filii)\s*Sirac|Kitab\s*Yesus\s*bin\s*Sirak|Jesus\s*Sirac)h|Karunungan\s*ng\s*Anak\s*ni\s*Sirac|L(?:a\s*Sagesse\s*de\s*Ben\s*Sira|iber\s*Ecclesiasticus)|(?:Jee?sus\s*Siirakin\s*kirj|K(?:n(?:iha\s*Sirachov(?:ho\s*syn|cov)|jiga\s*Sirahov)|\.\s*Sirachov(?:ho\s*syn|cov)|\s*Sirachov(?:ho\s*syn|cov))|Madrosc\s*Syrach|Sii?rakin\s*kirj|Sirachovcov|Sirak\s*fi|Syrach)a|S(?:apienza\s*di\s*Siracid|irak\s*bolcsesseg)e|Jesus\s*Syraks\s*vishet|K(?:niha|\.?)\s*Ekleziastikus|Sagesse\s*de\s*Ben\s*Sira|S(?:apienza\s*di\s*Sirach|ira(?:k(?:s\s*Bog|id[ae]s|h)|cid[ae]s)|yrak)|K(?:niha|\.?)\s*Sirachovca|Yoshua\s*bin\s*Sira|E(?:c(?:c(?:lesiasti(?:c(?:u[ls]|o)|que)|s)|lesiastico)|k(?:kle(?:s[iy]astiko|ziastik)|l(?:(?:ezjastyka|i)|es[iy]astiko)))|Ek(?:kles[iy]astiku|les[iy]astiku)s|Ecclusiasticus|E(?:klezjastyk|cclus)|(?:Ecleziasti|Sirachove)c|Siraks\s*?bok|S(?:i(?:r(?:a(?:cid[ae]|k(?:id[ae])?|ch?)?)?|irakin|rakin)?|yr)|Ben\s*Sira|YbS))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrMan"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))(Man\s*ru|(?:Orazione\s*di\s*Manasse\s*Re\s*di\s*Giuda|Rugaciunea\s*(?:rege)?lui\s*Manase|Ang\s*Panalangin\s*ni\s*Manases|The\s*Pr(?:ayer(?:s\s*(?:of\s*)?Manasseh|\s*(?:of\s*)?Manasseh)|\s*(?:of\s*)?Manasseh)|(?:Oratio\s*(?:regis\s*)?Manassa|(?:Doa\s*)?Manasy)e|(?:(?:(?:(?:Das\s*Gebet\s*des|Preghiera\s*di|G(?:ebet\s*des|weddi)|Modlitbu)|Pr\.)|Priere\s*de)|La\s*Priere\s*de)\s*Manasse|(?:La\s*)?Oracion\s*de\s*Manases|Panalangin\s*ni\s*Manases|Orazione\s*di\s*Manasse|M(?:anas(?:esova\s*modlitb|s(?:e\s*imadsag|ze\s*imaj))|odlitwa\s*Manasses)a|Prayer(?:s\s*(?:of\s*)?Manasseh|\s*(?:of\s*)?Manasseh)|Dalangin\s*ni\s*Manases|(?:Manasse(?:n\s*rukoukse|s’?\s*bo|\s*bo)|BM)n|(?:Das\s*Gebet|Prece\s*de)\s*Manasses|Dasal\s*ni\s*Manases|Geb(?:et\s*Manasses|\s*Man)|Pr\s*of\s*Manasseh|Gebet\s*Manasse|Pr\s*Manasseh|Pr(?:\s*Man(?:asse)?|\.\s*Man)|Man(?:ass?e)?|Doa\s*Man|Or\.?\s*Man|(?:Doa|Pr)Man))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Acts"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:M(?:ga\s*Gawa\s*ng\s*mga\s*Alagad|atendo\s*ya\s*Mitume)|Dz\s*Ap)|(?:Mabuting\s*Balita\s*ayon\s*sa\s*Espiritu\s*Santo|Mabuting\s*Balita\s*ng\s*Espiritu\s*Santo|Yesuusi\s*Kiittidoogeetu\s*Oosuwaa|(?:Handelingen\s*(?:van\s*de|der)\s*apostele|A(?:ctau['’]r\s*Apostolio|maal(?:\s*(?:e\s*)?|-?e-?)Rusula|['’]mal(?:\s*e\s*|-?e-?)Rusula|mal\s*e\s*Rusula|mal-?e-?Rusula)|A(?:ma(?:(?:al(?:\s*(?:e\s*)?|-?e-?)Rusule|l\s*e\s*Rusule)|l-?e-?Rusule)|['’]mal(?:\s*e\s*|-?e-?)Rusule)e|Karhaye\s*R(?:asoo|usu)la|Mga\s*Gawai)n|Ebanghelyo\s*ng\s*Espiritu\s*Santo|Los\s*Hechos\s*de\s*los\s*Apostoles|Dijannja\s*svjatyh\s*apostoliv|A(?:z\s*apostolok\s*cselekedetei|postolok\s*cselekedetei|tti\s*degli\s*Apostoli|ctsss|ma(?:ale|l[ei])|['’]male|p(?:\.(?:\s*t|[Gt])|\s*t|[Ggt]))|(?:Mga\s*Gawa\s*ng\s*mga\s*Apostole|Atos\s*dos\s*Apostolo)s|(?:The\s*)?Acts\s*of\s*the\s*Apostles|Mga\s*Gawa(?:\s*ng\s*mga\s*Apostol)?|Hechos\s*de\s*los\s*Apostoles|Buhat\s*sa\s*mga\s*Apostoles|Dziejach\s*Apostolskich|Apostlenes\s*(?:gj|G)erninger|(?:Apost(?:lenes-?gjerning|elg(?:jerningen|eschicht))|Dzieje\s*Apostolski|Skutky\s*apostolsk)e|Fapte(?:le)?\s*Apostolilor|(?:Gawa\s*ng\s*mga\s*Aposto|Karha(?:(?:\s*e\s*Raso|y\s*R[au]so)|-?e-?Raso)o|A(?:z\s*ApC|p(?:\.\s*|\s*?)C)se)l|(?:Lelakone|Kis(?:ah)?)\s*Para\s*Rasul|(?:Falimaha\s*Rasuullad|Apostlagarningarn|Karhay(?:e\s*Ras(?:ulan|ool)h|\s*R(?:asulan|usul)h)|Djela\s*apostolsk)a|Veprat\s*e\s*[Aa]postujve|Karhay\s*Rasulan-?haa|Actes\s*des\s*Apotres|Gawa\s*ng\s*Apostoles|Kisah\s*Rasul-?rasul|(?:(?:Ang\s*Mga\s*)?Binuhat|Karha(?:(?:y(?:\s*e\s*R(?:as(?:oo|u)|usu)|-?e-?R(?:as(?:oo|u)|usu))|\s*e\s*Rasu)|-?e-?Rasu)l)an|(?:Actus\s*Apostoloru|a['’])m|Skutky\s*apostol(?:ov|u)|Praeriton\s*Ke\s*Kam|preritharuka\s*kam|K(?:arhay(?:e\s*R(?:asul(?:an)?|usul)|\s*R(?:asulan|usul))|is(?:ah)?)|A(?:postolien\s*te|kdezap)ot|A['’]maal(?:\s*e\s*|-?e-?)Rusul|(?:Aksyon\s*apot\s*y|Travay\s*apot\s*y|M(?:aten)?d)o|A(?:['’]ma(?:l(?:\s*e\s*Rusul|-?e-?Rusul)?|al)|mal\s*e\s*Rusul|mal-?e-?Rusul|postolok|c(?:t(?:au?|ss?|es|us)?)?|maa?l|t(?:os|ti))|D(?:z(?:ieje(?:\s*Apost)?)?|j)|P(?:ostulasagan|ara\s*Rasul)|Cselekedetek|H(?:and(?:elingen)?|ech?|c)|Los\s*Hechos|G(?:erninger|w)|Mga\s*Buhat|Fa(?:p(?:t(?:e(?:le)?)?)?|l)|Sk(?:utky)?|Vep(?:rat)?|Travay|Hechos|F(?:\.?\s*Ap|\.?A)|Gawa|KisR|Teot|B(?:in|uh)|H(?:ch|nd)|Osu))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rev"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Apo(?:(?:cal(?:ipsa\s*lui\s*Io|ypse\s*de\s*Je)|calipsis\s*ni\s*Ju)|kalipsis\s*ni\s*Ju)an|(?:(?:Apocalypsis\s*Ioannis\s*Apostol|Janos\s*jelenese|M(?:akasheph|uujinti)|m[au]kashaaf)i|(?:Ob['’]javlennja\s*Ivana\s*Bohoslov|Apokalipsa\s*Swietego\s*Jan|Z(?:j(?:(?:avenie\s*(?:Apostola\s*)?|avenie\s*svateho\s*)|eveni\s*svateho\s*)Jan|bules)|(?:Apokalipsa|Objawienie)\s*sw\.\s*Jan|(?:Apokalipsa|Objawienie)\s*sw\s*Jan|(?:Ufunua\s*wa\s*Yoh|Objawienie\s*J)an|Prakashaitavaky|Ilmestyskirj|m(?:aka(?:shfeh|ashef)|uka(?:shfeh|ashef))|Ajjuuta)a|O(?:p(?:inberun(?:arbok)?\s*Johannesar|b)|ffb)|(?:Openbaring\s*van\s*Johanne|Johanne(?:ksen\s*ilmesty|s\s*apokalyp)|Apo[ck]alipsi)s|(?:Apocalipse\s*de\s*(?:Sao\s*)?Joa|Otkrivenje\s*Ivanov|Zjeveni\s*Janov)o|Apocalisse\s*di\s*Giovanni|(?:Johannes\s*Uppenbarels|Rivelazion)e|(?:Joh(?:annes['’]\s*(?:Ab|ap)enbarin|s\.?\s*Abenbarin)|Offenbarun)g|Ap(?:o(?:c(?:al(?:yps(?:is(?:\s*Ioannis)?)?|i[ps]se))?|k(?:alipsa?)?)?|enbaring)?|(?:Johannesapokalypse|(?:Uppenbarelsebok|A(?:(?:benbaringsbo|abenbarin)g|penbaringsbok))e|Op(?:inberunarboki|enbaringe)|A(?:p(?:enbaring|okalyps)e|benbaringe)|Re[bv]elasyo)n|K(?:s(?:ieg[ai]\s*(?:Apokalipsy|Objawienia)|\.\s*(?:Apokalipsy|Objawienia)|\s*(?:Apokalipsy|Objawienia))|niha\s*Zjeveni|itab\s*Wahyu)|Ufunuo\s*wa\s*Yohan[ae]|Pahayag\s*kay\s*Juan|El\s*Apocalipsis|prakatikaran|Apokalipszis|R(?:ev(?:e?|[ao])lations|v)|m(?:ak(?:(?:(?:(?:ashefi(?:ah|[ei])|(?:(?:(?:a(?:(?:aa|h)s|sh)h|hsa)fe|ash(?:fe[ai]|af[io]|e(?:ef|f[eo]))|shaafe)|ashefah))|aashf(?:e(?:hi|vo|a)|a))|ashafeh)|shaf(?:ah|e))|uk(?:a(?:(?:sh(?:ef(?:i(?:ah|[ei])|ah|e)|fea|afo)|ashf(?:e(?:hi|vo|a)|a))|shafeh)|shaf(?:ah|e)))|O(?:p(?:enb(?:aring)?)?|bj(?:awienie)?|tk(?:rivenje)?)|R(?:ev(?:elation|[ao]lation|lation|el)?|iv)|m(?:aka(?:sh(?:efia?|(?:efa|fe))|ashfeh)|uka(?:sh(?:ef(?:ia?|a)|fe)|ashfeh))|A(?:p(?:o(?:cal(?:ypse|ipsa)|kalypsa)|[ck])|ju)|Datguddiad|Maka(?:ashfa[ah]|ashf[ei]y|shef(?:a[ah]|e[hiy]|iy|y))|M(?:aka(?:ashf(?:a?|[ei])|shef(?:a|e|i)?)|uuj)|Jelenesek|Gipadayag|M(?:ikashe|ekaash)fe|Pamedaran|Z(?:j(?:av(?:enie)?|eveni)?|bu?)|Ilm(?:estys)?|Dat(?:gudd)?|Pah(?:ayag)?|U(?:f(?:u(?:nuo)?)?|pp)|Wahyu|Wahy?|Gipa|Jel|Zjv|Why))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrAzar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:Ang\s*)?Panalangin\s*ni\s*Azarias|The\s*Pr(?:ayers?\s*of\s*Azariah|\s*of\s*Azariah)|The\s*Pr(?:ayers?\s*of\s*Azaria|\s*of\s*Azaria)|Rugaciunea\s*lui\s*Azaria|(?:Das\s*Gebet\s*des\s*Asarj|Azar(?:jasova\s*modlitb|ias\s*ima(?:dsag|j)|y)|Modlitwa\s*Azariasz|Gebe(?:t\s*des\s*As|d\s*van\s*Az)arj|Piesn\s*Azariasz|Doa\s*Azary)a|La\s*Priere\s*d['’]Azaria[hs]|Preghiera\s*di\s*Azaria|Prayers?\s*of\s*Azariah|Oracion\s*de\s*Azarias|Cantico\s*de\s*Azarias|Prayers?\s*of\s*Azaria|(?:Das\s*)?Gebet\s*Asarjas|Salmo\s*de\s*Azarias|Priere\s*d['’]Azaria[hs]|Oratio\s*Azariae|(?:Asarjan\s*rukou|Geb\s*A)s|Gweddi\s*Asarias|Pr\s*of\s*Azariah|Pr\s*of\s*Azaria|A(?:sar(?:ias’?\s*bon|jas’?\s*bon|\s*ru)|zariah)|Doa\s*Az(?:ar)?|[OP]r\.\s*Azar|Sal\s*Azar|Azarias?|(?:Or\s*|Pr)Azar|Pr\s*Azar|Or\s*Az|DoaAz|PrAzr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["SgThree"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(Gesang\s*der\s*drei\s*Mae?nner\s*im\s*Feuerofen|(?:Kolmen\s*(?:nuoren\s*miehen\s*ollessa\s*tulisessa\s*patsi|miehen\s*kiitosvirsi\s*tule)ssa|(?:Cantico\s*dei\s*tre\s*giovani\s*nella\s*fornac|S(?:ong\s*|(?:(?:ng\s*|g)|g\s*))Thre)e|El\s*(?:Canto\s*de\s*los\s*(?:Tres\s*Jovenes\s*(?:Hebre|Judi)os|3\s*Jovenes\s*(?:Hebre|Judi)os)|Himno\s*de\s*los\s*(?:Tres\s*Jovenes\s*(?:Hebre|Judi)os|3\s*Jovenes\s*(?:Hebre|Judi)os))|(?:The\s*Song\s*of\s*(?:the\s*(?:Three\s*(?:Holy\s*Childr|Young\s*M)|3\s*(?:Holy\s*Childr|Young\s*M))|Three\s*(?:Holy\s*Childr|Young\s*M)|3\s*(?:Holy\s*Childr|Young\s*M))|Song\s*of\s*(?:the\s*(?:Three\s*(?:Holy\s*Childr|Young\s*M)|3\s*(?:Holy\s*Childr|Young\s*M))|Three\s*(?:Holy\s*Childr|Young\s*M)|3\s*(?:Holy\s*Childr|Young\s*M))|Lied\s*van\s*de\s*drie\s*jongemann)en|Ge(?:zang\s*der\s*drie\s*mannen\s*in\s*het\s*vuur|sang\s*der\s*drei\s*im\s*Feuerofen|sang\s*der\s*drei\s*Mae?nner)|(?:Awit\s*ng\s*(?:Tatlong\s*Banal\s*na|3)|Tatlong)\s*Kabataan|(?:Canto\s*de\s*los\s*(?:Tres|3)|Himno\s*de\s*los\s*3)\s*Jovenes\s*(?:Hebre|Judi)os|(?:Awit\s*sa\s*Tulo\s*ka\s*Batan-?ong\s*Lalak|(?:Cantarea\s*celor\s*trei|3)\s*tiner|Cantico\s*dei\s*tre\s*fanciull|Cantarea\s*celor\s*trei\s*evre|Gesang\s*der\s*Dre|Trei\s*tiner)i|Traja\s*mladenci\s*v\s*rozpalenej\s*peci|Himno\s*de\s*los\s*Tres\s*Jovenes\s*Judios|Aw(?:it\s*(?:ng\s*Tatlong\s*Kabataang\s*Banal|sa\s*3)|\s*ng\s*3\s*Kab)|Pi(?:esen\s*mladencov\s*v\s*ohnivej|sen\s*mladencu\s*v\s*horici)\s*peci|(?:T(?:he\s*Song\s*of\s*(?:the\s*(?:Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|res\s*Jovene)|Canti(?:que\s*des\s*(?:Trois|3)\s*Enfant|co\s*dos\s*(?:Tres|3)\s*Joven)|Song\s*of\s*(?:the\s*(?:Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|Three\s*(?:Youth|Jew)|3\s*(?:Youth|Jew))|3\s*Jovene)s|Kolmen\s*(?:miehen(?:\s*kiitosvirsi)?|nuoren\s*miehen)|Canto\s*de\s*los\s*(?:Tres|3)\s*Jovenes|Himno\s*de\s*los\s*(?:Tres|3)\s*Jovenes|(?:Lagu\s*Pujian\s*Ketiga\s*Pemud|Awit\s*ng\s*Tatlong\s*Binat|Lagu\s*3\s*Pemud|Lagu\s*Pemud|Tiga\s*Pemud|3\s*Pemud)a|Tri\s*muzi\s*v\s*rozpalene\s*peci|Awit\s*ng\s*Tatlong\s*Kabataan|H(?:arom\s*fiatalember\s*eneke|ymnus\s*trium\s*puerorum)|De\s*tre\s*m(?:annens\s*lov|enns\s*)sang|Wimbo\s*wa\s*Vijana\s*Watatu|Gesang\s*der\s*drei|C(?:(?:an\s*y\s*Tri\s*Ll?anc|t\s*3\s*(?:Jo|E))|3J)|S(?:\.\s*(?:of\s*(?:Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|\s*(?:of\s*(?:Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y)))|Th(?:ree(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|\.\s*(?:Ch|Y)|\s*(?:Ch|Y))|3(?:\.\s*(?:Ch|Y)|\s*(?:Ch|Y))))|Sg\s*Thr|L(?:agPuj|3J)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:Dru(?:he\s*poslannja\s*apostola\s*Pe|g(?:a\s*List\s*(?:sw\.?\s*Pio|Pio)|i\s*List\s*(?:sw\.?\s*Pio|Pio)))|(?:II\.?\s*L|2\.?\s*L)ist\s*(?:sw\.?\s*Pio|Pio))tr|Druga\s*Petrova\s*[Pp]oslanic|(?:II\.?\s*Petrova\s*P|2\.?\s*Petrova\s*P)oslanic|p(?:atrusko\s*dostro|etracem\s*dusre)\s*patr|II\.?\s*Phi|2\.?\s*Phi)a|Second(?:(?:a\s*lettera\s*di|o)|a)\s*Pietro|Waraka\s*wa\s*Pili\s*wa\s*Petro|Naa77antto\s*PHeexiroosa|Barua\s*ya\s*Pili\s*ya\s*Petro|Toinen\s*Pietarin\s*kirje|(?:Druh(?:a\s*(?:kniha\s*Petro|(?:list\s*)?Petru)|y\s*(?:list\s*Petr[ou]|Petru))|(?:II\.?\s*l|2\.?\s*l)ist\s*Petru|2\s*k\.\s*Petro|2\s*k\s*Petro)v|And(?:r(?:a\s*Petrusbrevet|e\s*Petersbrev)|e[nt]\s*Petersbrev)|(?:II\.?\s*Pieta|2\.?\s*Pieta)rin\s*kirje|(?:Peters\s*Andet\s*B|Pet(?:rus\s*andra|ers\s*andre)\s*b)rev|(?:Druhy\s*Petrov\s*lis|2(?:(?:\s*[ei]\.?\s*Pj|\s*Pj)|\.\s*Pj)etri|dovvomp)t|Epistula\s*(?:II\s*Petri|Petri\s*II)|(?:Segund(?:o\s*(?:San\s*)?Ped|a\s*Ped)|(?:(?:(?:Ikalawang|2a\.)|2a)|(?:II\.?\s*S|2\.?\s*S)an)\s*Ped|2\.?o\.\s*(?:San\s*)?Ped|2\.?o\s*(?:San\s*)?Ped)ro|(?:De(?:uxiemes?\s*Pierr|zyem\s*P[iy])|2(?:eme\.|de?\.)\s*Pierr|2(?:eme\s*|de?\s*)Pierr|(?:II\.?\s*Pier|2\.?\s*Pier)r|2e\.?\s*Pierr|II\.?\s*Py|2(?:\.\s*Py|\s*P[Hy]))e|T(?:oinen\s*Pietarin|weede\s*Petr?)|2\.?\s*Petrusbrevet|D(?:o(?:vom(?:\s*[Pp](?:atrissi|eters)|P(?:atrissi|eters)|p(?:atrissi|eters))|\s*?p(?:atrissi|eters)|Peters)|o(?:vom(?:\s*[Pp]atras|[Pp]atras)|\s*?patras)a|ru(?:h(?:(?:y\s*P(?:etrova|t)|a\s*Pt)|a\s*Petrova)|g[ai]\s*Piotra))|Zweite(?:[nrs])?\s*Petrus|D(?:o(?:(?:vom(?:\s*[Pp](?:atriss?|eter)|P(?:atriss?|et(?:er)?)|p(?:atriss?|eter))|\s*?p(?:atriss?|eter)|Pet(?:er)?)|(?:vom(?:\s*[Pp]atras|[Pp]atras)|\s*?patras))|ru(?:g(?:a\s*P(?:etrova|iotr)|i\s*Piotr)|h(?:(?:y\s*P(?:etr(?:ov)?)?|a\s*P(?:etr)?)|a\s*Petrov)))|2\.?\s*Petersbrev|Masodik\s*Peter|Butros\s*Labaad|(?:Do(?:vom(?:\s*[Pp]at(?:ari|ru)|P(?:atari|(?:etr[aou]|atr[ou]))|pat(?:ari|ru))|\s*?pat(?:ari|ru)|P(?:atr[ao]|etr[aou]))|Tweede\s*Petru|SecondPetro|2(?:(?:(?:\.\s*Patara|\s*(?:Patar[ai]|patra))|\s*Patru)|Pat(?:ari|ru))|(?:II\.?\s*Butr|2\.?\s*Butr)o|2(?:e\.?\s*Pe|p)tru|2ndPetro|DoPtru)s|dovvom\s*petrus|And(?:re\s*Pet(?:ers?)?|en\s*Pet(?:er)?)|(?:II\.?\s*Pieta|2\.?\s*Pieta)rin|Second\s*P(?:(?:ete|t)r|et?r)|II(?:\.\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|ie)?|But)|\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|ie)?|But))|Second\s*P(?:ete|et?|t)?|Masodik\s*Pet|(?:SecondPete|DovomPt|2ndPete)r|(?:2(?:(?:\.\s*patrusk|\s*(?:patrusk|Pietr))|\.\s*Pietr)|II\.?\s*Pietr|Pili\s*Petr)o|2\.?\s*Petro(?:va?)?|2(?:(?:(?:\s*(?:(?:petracem|P(?:er|d))|Petr(?:uv|i))|\.\s*Pe(?:tr(?:uv|i)|r))|\s*Pedro)|\.\s*Pedro)|II(?:\.\s*Pe(?:tr(?:u[sv]|i)|dro|r)|\s*Pe(?:tr(?:u[sv]|i)|dro|r))|2\s*Patrissi|(?:II\.?\s*Pio|2\.?\s*Pio)tra|2nd\.?\s*P(?:(?:ete|t)r|et?r)|2(?:\.\s*P(?:e(?:t(?:r(?:us?)?|e)?)?)?|\s*P(?:et(?:r(?:us?)?|e)?|(?:i(?:et?)?|ed?|je?)?)|Pet)|2\s*Patriss?|(?:II\.?\s*Pio|2\.?\s*Pio)tr|2nd\.?\s*P(?:ete|et?|t)?|2\.?\s*Peters?|2Patrissi|2\s*?Patrasa|(?:II(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|2\.?\s*Pt)r|2Patriss?|2\s*?Patras|Pili\s*Pet|II(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|2(?:e\.?\s*Pe|p)tr?|Petr[io]\s*II|2\.\s*Pedr|2Peters|2\s*Pedr|2\.\s*Pie|2\.?\s*But|2Peter|2\.?\s*Pt|DoPtr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:P(?:erse\s*poslannja\s*apostola\s*Pe|ierwsz[aey]\s*List\s*(?:sw\.?\s*Pio|Pio))|(?:1\.?\s*L|I\.?\s*L)ist\s*(?:sw\.?\s*Pio|Pio))tra|E(?:nsimmainen\s*Pietarin\s*kirje|pistula\s*(?:I\s*Petri|Petri\s*I)|erste\s*Petrus|rste(?:[nrs])?\s*Petrus|lso\s*Peter)|(?:Fyrra\s*almenna\s*bref\s*Petur|Avval(?:\s*[Pp]at(?:ari|ru)|P(?:atari|(?:etru|atr[ou]))|pat(?:ari|ru))|Yek\s*?pat(?:ari|ru)|1(?:(?:\.\s*Patara|\s*(?:Patar[ai]|patra))|stPetro)|1e\.\s*Petru|1\.?\s*Butro|I\.?\s*Butro|YekPetr[ou]|1e\s*Petru|1\s*Patru|1Pat(?:ari|ru)|1ptru)s|Waraka\s*wa\s*Kwanza\s*wa\s*Petro|Barua\s*ya\s*Kwanza\s*ya\s*Petro|Prim(?:(?:a\s*lettera\s*di|o)|a)\s*Pietro|(?:Prv(?:a\s*Petrova\s*[Pp]oslanic|ni\s*Petrov)|(?:1\.?\s*Petrova\s*P|I\.?\s*Petrova\s*P)oslanic|Koiro\s*PHeexiroos|1\.?\s*Phi|I\.?\s*Phi)a|p(?:atrusko\s*pahilo|etracem\s*pahile)\s*patra|E(?:nsimmainen\s*Pietarin|erste\s*Petr?|lso\s*Pet)|(?:Forsta\s*Petrusbreve|Prvy\s*Petrov\s*lis|1\.?\s*Petrusbreve|1(?:(?:\s*[ei]\.?\s*Pj|\s*Pj)|\.\s*Pj)etri)t|P(?:et(?:rus\s*forsta\s*b|ers\s*1\.?\s*B)rev|rv(?:ni\s*(?:list\s*)?Petruv|a\s*kniha\s*Petrov|y\s*list\s*Petrov|ni\s*Pt))|(?:1\.?\s*Pieta|I\.?\s*Pieta)rin\s*kirje|(?:(?:(?:Prime(?:ro?\s*San|ir[ao])|1\.?o\.\s*San|1\.?o\s*San|(?:1\.?\s*S|I\.?\s*S)an|1a\.)\s*P|(?:(?:Primero?\s*P|(?:1\.?o\.\s*|1\.?o\s*)P)|1a\s*P))ed|Una(?:ng)?\s*Ped)ro|F(?:yrra\s*Petursbref|irst\s*P(?:(?:ete|t)r|et?r))|(?:Prem(?:ier(?:e?s|e?)\s*Pierr|ye\s*P[iy])|1(?:ere?|re)\.\s*Pierr|1(?:ere?|re)\s*Pierr|(?:1\.?\s*Pier|I\.?\s*Pier)r|1(?:\.\s*Py|\s*P[Hy])|I\.?\s*Py)e|(?:Pierwsz[aey]\s*Piotr|(?:1\.?\s*Pio|I\.?\s*Pio)tr)a|Pierwsz[aey]\s*Piotr|(?:(?:1\.?\s*l|I\.?\s*l)ist\s*Petru|1\.?\s*Petersbre)v|Avval(?:\s*[Pp](?:atr(?:issi|asa)|eters)|Patrissi|p(?:atr(?:issi|asa)|eters)|P(?:atrasa|eters)|Petr[ao]si)|Avval(?:\s*[Pp](?:atr(?:iss?|as)|eter)|P(?:atriss?|(?:(?:atras|et(?:er)?)|etr[ao]s))|p(?:atr(?:iss?|as)|eter))|Butros\s*Kowaad|P(?:rv(?:a\s*Petrova?|y\s*Petrov|ni\s*P(?:etr)?)|eter)|Yek\s*?p(?:atr(?:issi|asa)|eters)|avval\s*petrus|(?:Kwanza\s*Petr|1(?:(?:\.\s*patrusk|\s*(?:patrusk|Pietr))|\.\s*Pietr)|I\.?\s*Pietr)o|Yek\s*?p(?:atr(?:iss?|as)|eter)|(?:1\.?\s*Pieta|I\.?\s*Pieta)rin|1\s*k\.\s*Petrov|1\.?\s*Petro(?:va?)?|I(?:\.\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|ie)?|But)|\s*(?:P(?:e(?:t(?:r(?:o(?:va?)?|u)?)?|dr)?|ie)?|But))|First\s*P(?:ete|et?|t)?|Kwanza\s*Pet|1(?:(?:(?:\s*(?:(?:petracem|P(?:er|d))|Petr(?:uv|i))|\.\s*Pe(?:tr(?:uv|i)|r))|\s*Pedro)|\.\s*Pedro)|1\s*k\s*Petrov|1st\.\s*P(?:(?:ete|t)r|et?r)|YekPetrasi|1\s*Patr(?:issi|asa)|1(?:\.\s*P(?:e(?:t(?:e(?:rs?)?|r(?:us?)?)?)?)?|\s*P(?:et(?:e(?:rs?)?|r(?:us?)?)?|(?:i(?:et?)?|ed?|je?)?)|Pet)|1st\.\s*P(?:ete|et?|t)?|YekPetras|1\s*Patr(?:iss?|as)|I(?:\.\s*Pe(?:tr(?:u[sv]|i)|dro|r)|\s*Pe(?:tr(?:u[sv]|i)|dro|r))|1st\s*P(?:(?:ete|t)r|et?r)|(?:Yek|1)Peters|1Patr(?:issi|asa)|1st\s*P(?:ete|et?|t)?|(?:Yek|1)Peter|(?:1\.?\s*Pio|I\.?\s*Pio)tr|1Patr(?:iss?|as)|1e\.\s*Petr?|(?:I(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|1\.?\s*Pt)r|(?:1stPete|AvvalPt|YekPt)r|1\.\s*Pedr|I(?:\.\s*P(?:ete|t)|\s*P(?:ete|t))|1e\s*Petr?|avvalpt|Petr[io]\s*I|1\s*Pedr|1\.\s*Pie|1\.?\s*But|YekPet|1\.?\s*Pt|1ptr?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rom"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*rymljan|ica\s*Rimljanima)|a(?:vlova\s*poslanica\s*Rimljanima|ulus(?:'\s*Brev\s*til\s*Romerne|’\s*(?:Brev\s*til\s*R|brev\s*til\s*r)omerne)))|(?:Bref\s*Pals\s*til\s*Romverj|rom(?:iharulai|karams)\s*patr)a|Epistula\s*ad\s*Romanos|Sulat\s*sa\s*mga\s*Romano|(?:Kirje\s*roomalaisill|Ro(?:(?:omalaiskirj|m(?:akev|ern))|omalaisill))e|(?:(?:(?:Layang\s*Paulus|Taga-?)\s*R|Mga\s*Taga(?:-?\s*?R|\s*R))o|War(?:aka\s*kwa\s*War)?o|Barua\s*kwa\s*Waro)ma|War(?:aka\s*kwa\s*War)?umi|L(?:ettera\s*ai\s*Romani|ist\s*Riman[ou]m)|(?:List\s*do\s*Rzymi|R(?:oomiy|zymi|umiy|omy))an|R(?:(?:(?:o(?:m(?:e(?:inenbrief|rbrevet|n)|arbrevet|a(?:iakhoz|n(?:os|[is]))|s)|emer|s)|hufeiniaid|mn?s)|imskym)|iman[ou]m)|rom(?:iharulai|karams)|ad\s*Romanos|Rimljanima|R(?:o(?:m(?:e(?:inen|r)|a(?:no?)?)?|om(?:a|e)?|em)?|z(?:ym)?|huf|mn?|im|um)|R(?:o(?:ma(?:nd|in)|amn)|pman)s|R(?:o(?:(?:m(?:i(?:yo|[au])|as)|omea)|omi[au])|umi[au])n))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Song"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Kid\s*Ag|(?:E(?:l\s*Cantar\s*de\s*los\s*Cantares|nekek\s*eneke)|Cantare?\s*de\s*los\s*Cantares|Cantique\s*des\s*[Cc]antiques|(?:(?:Syirul-?asyar\s*Sulaim|Hoga\s*vis)|Gabaygii\s*Sulayma)an|(?:Canticos?\s*dos\s*Cantico|Ho(?:hes?lied\s*Salomoni|j))s|The\s*Song(?:s\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns)|\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns))|The\s*Song(?:s\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n))|C(?:an(?:tarea\s*lui|iad)\s*So|hante\s*Sa)lomon|(?:Ghaz(?:al(?:(?:\s*Ghazal-?Ha-?|Ghazal)Ha|_Ghazal(?:_ha|-?h)|(?:(?:\s*Ghazal-?|-?Ghazal)|(?:\s*Ghazal[\s*’]|-?Ghazal[-’]|Ghazal[\s*-_]))h)|l_Ghazal(?:_ha|-?h)|l(?:\s*Ghazal-?|-?Ghazal-?|Ghazal_)h|l(?:Ghazal-?[Hh]|-?Ghazalh))|Velpiesen\s*Salamunov|Pjesma\s*nad\s*pjesmam|Pisen\s*Salamounov|Piesen\s*Salamunov|Wimbo\s*(?:Ulio\s*)?Bor|Siiquwaa\s*Saba)a|(?:A(?:ng\s*Awit\s*ng|wit\s*(?:sa|ng))\s*mga\s*Awi|Cn)t|C(?:ant(?:ar(?:ea\s*[Cc]antarilor|i)|i(?:cum\s*[Cc]anticorum|ques)|\.\s*Cantic|\s*Cantic)|t)|Cantico\s*dei\s*[Cc]antici|P(?:i(?:s(?:nja\s*nad\s*pisnjamy|en\s*pisni)|es(?:n\s*nad\s*Piesniam|en\s*piesn)i)|NP)|Cant(?:ares\s*de\s*Saloma|ico\s*(?:Superlativ|de\s*Saloma))o|A(?:ng\s*Awit\s*ni\s*S[ao]lomon|wit\s*ni\s*S[ao]lomon|\.?\s*ng\s*A|w\s*ni\s*S)|(?:Cantico\s*di\s*Salomon|Kantiku\s*i\s*Kantikev)e|Musthikaning\s*Kidung|H(?:o(?:he(?:s(?:lied\s*Salomos|\s*Lied)|lied\s*Salomos)|oglied|ga(?:\s*V|v))|ld)|Ghaz(?:al(?:(?:\s*Ghazalha|(?:\s*Ghazal_|Ghazal)h)|_Ghazalh)aa|(?:(?:l\s*Ghazalha|l(?:\s*Ghazal_|Ghazal)h)|l_Ghazalh)aa)|Songs\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns)|G(?:haz(?:al(?:\s*Ghazalhaa?|(?:\s*Ghazal_|Ghazal)ha|_Ghazalha)|l\s*Ghazalhaa?|l(?:\s*Ghazal_|Ghazal)ha|l_Ghazalha)|ab(?:aygii)?)|Songs\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|K(?:anti(?:d\s*de\s*Kantik|k(?:ul)?o)|idA)|Song\s*of\s*S(?:o(?:lom[ao]ns|ngs)|alom[ao]ns)|Song\s*of\s*S(?:o(?:lom[ao]n|ng)|alom[ao]n)|L(?:aul(?:ujen\s*laulu|\.?\s*l)|jl)|Piesn\s*Salomona|Salamon\s*eneke|(?:Korkea\s*veis|Caniada)u|Kidung\s*Agung|Reshthageet|H(?:o(?:hes?lied|ga(?:\s*v)?|ogl)|l)|Velp(?:iesen)?|C(?:an(?:t(?:ares|i(?:cos?|que))?)?|hante)|gitratna|P(?:i(?:es(?:en)?|s(?:en)?)|j)|K(?:id(?:ung)?|ant)|S\s*of\s*S|So(?:ng?)?|Sn?gs|Wim|Sn?g|S(?:o?S|iq)|Pnp|Vlp))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Prov"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:Ks(?:ieg[ai]\s*Przypowiesci\s*Salomon|\.?\s*Przypowiesci\s*Salomon)|Prislovi\s*Salomounov|Sananlaskujen\s*kirj|Am(?:thal(?:[ae]-?ha|-?h)|sale-?ha)|hikmata-?h)a|Przypowiesci\s*Salomonowych|(?:(?:P(?:(?:roverb|ild)ele\s*lui\s*Solom|anultih)|Mga\s*Panultih)o|(?:Ordspraksbo|Spreu)ke|Diarh?ebio)n|(?:Surat\s*Amsal\s*Sulaim|(?:Mga\s*)?Kawika|Neetivach)an|L(?:i(?:ber\s*Proverbiorum|v\s*Pwoveb\s*yo)|e(?:emiso|m))|hitopadesko\s*pustak|Ordsprogenes\s*Bog|S(?:a(?:lomos\s*Ordsprog|nanlaskut)|prichwoe?rter)|(?:Salomos\s*Ordspra|Peldabeszede)k|(?:K(?:niha|\.?)\s*prislov|Prypovist)i|Wulang\s*Bebasan|S(?:ananl(?:askujen)?|pr)|M(?:(?:aahmaahyadi|ithal)|ethal)i|Fjalet\s*e\s*urta|(?:Mudre\s*izrek|Ordspraken|Poslovic|Sprue?ch)e|Ord(?:s(?:p(?:rogene)?)?)?|hi(?:topadesko|km)|P(?:(?:robver|ro(?:ber|ve))bio|or?verbio)s|P(?:r(?:o(?:v(?:erb(?:e(?:le)?|i)?)?)?|(?:overbi|vb)o|everb(?:io)?|is(?:lovi)?|verb(?:io)?|z(?:yp?)?|vb?)?|eld|an|w)|P(?:r(?:(?:overbi|vb)os|everb(?:io)?s|overb(?:e?s|ia)|islovia|verb(?:io)?s|vbs)|robverbs|roberbs|or?verbs|rovebs|woveb|v)|nitisutre|O(?:roverbs|kv)|Am(?:\s*(?:thal[es]|sale)|th(?:al(?:eh|ah|[ls])|(?:a[ae]|e)l)|saal)|Hikmatah|Am(?:\s*(?:th|s)al|thale?|sal)|M(?:aah|ith|eth|it)|Diar|Kaw|Izr|Snl))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Wis"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Cartea\s*intelepciunii\s*lui\s*Solomon|(?:Ang\s*Karunungan\s*ni\s*S[ao]|Karunungan\s*ni\s*S[ao]|S(?:agesse\s*de\s*Sa|o))lomon|Intelepciunea\s*lui\s*Solomon|De\s*wijsheid\s*van\s*Salomo|Het\s*boek\s*der\s*wijsheid|(?:The\s*Wis(?:d?om|d?)\s*of|Doethineb|Wis(?:d(?:om)?\s*|\s*)of|Wisom\s*of)\s*Solomon|(?:M(?:oudrost\s*Salomounov|adrosc\s*Salomon)|Sabiduri)a|Sa(?:pienza\s*di\s*Salomon|lamon\s*bolcsesseg)e|Sabedoria\s*de\s*Salomao|K(?:ebij(?:aksanaan)?\s*|awicaksanan\s*)Salomo|Cartea\s*Intelepciunii|S(?:a(?:pientia\s*Salomoni|lomon\s*viisau)|peki\s*Salomon)s|Wijsheid\s*van\s*Salomo|(?:Hekima\s*ya\s*Solomon|K(?:s(?:ieg[ai]\s*Madrosc|\.?\s*Madrosc)|n(?:iha\s*[Mm]o|jiga\s*M)udrost))i|Kaalam\s*ni\s*Solomon|Weisheit\s*Salomos|Liber\s*Sapientiae|Vi(?:isauden\s*kirja|s(?:domm|het)ens\s*bok)|S(?:alomos\s*(?:Visdom|vishet)|b)|Visdommens\s*Bog|K(?:eb(?:ijaksanaan)?|a(?:wicaksanan|r(?:unungan)?))|Hikmat\s*Salomo|Bolcsesseg|Sa(?:b(?:edoria)?|p(?:ien(?:t(?:ia)?|za))?|gesse|lomon)|Vi(?:s(?:d(?:ommen)?|h(?:eten)?)|is)|M(?:oudrost|ud(?:r(?:ost)?)?|adr)|W(?:i(?:jsheid|s(?:d(?:om)?)?)|eish(?:eit)?)|M(?:udrosti|dr)|Klm\s*Sol|Hek(?:ima)?|Bolcs|SSal))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Joel"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Pro(?:roctwo\s*Ioelowe|phetia\s*Ioel)|Joelin\s*kirja|(?:Ks(?:ieg[ai]\s*Joe|\.?\s*Joe)|Yuu77ee)la|Liv\s*Jowel\s*la|J(?:oel(?:s\s*(?:Bog|bok)|a)|l)|(?:Y(?:o(?:o(?:['’]e[ei]|e[ai]|i)|ei)|uoi)|Yoo['’]i[ei]|Jo(?:e[ai]|i)|Io[ei])l|Joe(?:l(?:in?)?)?|Y(?:o(?:o(?:['’]e|e?)l|eli)|l)|(?:Yoo?a|Jo['aw’])el|(?:Gioel|Y(?:ol|u7))e|Yoel?|Gioe|yoel))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Pro(?:roctwo\s*Ionaszow|phetia\s*Iona)e|(?:Ks(?:ieg[ai]\s*Jonasz|\.?\s*Jonasz)|Jo(?:onan\s*kirj|nasz)|Yoonaas|Gion|yon)a|Liv\s*Jonas\s*la|J(?:o(?:na(?:(?:(?:s(?:['’]\s*Bog|s(?:eh|i)|[ei])|s?\s*bok)|sah)|sse-?[iy])|on(?:as(?:s(?:e-?[iy]|ah)|e)|is)|unasi)|n[hs])|Y(?:o(?:un(?:asse|us[is])|onus[is]|n(?:ass|isi)|nus[is])|un(?:ass|us[eis])|n)|Y(?:o(?:(?:onu|na)|una)s-?|unus-?)[iy]|(?:Jouniss|Y[ou]nes)e|Y(?:o(?:un(?:ass?|us)|on(?:us)?|nus|na?)|un[au]s)|Jo(?:n(?:a(?:s(?:se?)?)?)?|ona(?:ss?|n)?|un[ai]s)|Y[ou]nasah|Yoonoss|Y(?:o(?:oni|un[ei])|uni)si|(?:Yoon[ae]s|Jon(?:ah|is))s|Y(?:o(?:oni|un[ei])|uni)s|Yoon[ae]s|Jon(?:ah|is)|Ionas|Iona|Gio))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Nah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Na(?:h-?o?um|-?hum)|(?:Pro(?:roctwo\s*Nahumowe|phetia\s*Nahum)|Liv\s*Nawoum\s*lan|N(?:(?:ahumin\s*kirja|(?:a(?:h(?:um(?:s\s*(?:Bog|bok)|[au])|om)|wou[mn]|ahom|ch)|h))|aahooma)|Ks(?:ieg[ai]\s*Nahuma|\.?\s*Nahuma)|Na(?:h(?:u(?:m(?:in?)?)?|o)?|w|x)?|Na(?:aho?u|h(?:o[ou]|uu)|u)m|Nahumme|Naxuum|nahum))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:P(?:erse\s*poslannja\s*apostola\s*Ivan|rv(?:a\s*Ivanova\s*[Pp]oslanic|ni\s*Janov)|ierwsz[aey]\s*(?:List\s*(?:sw\.?\s*J|J)|J)an)|(?:1\.?\s*Ivanova\s*P|I\.?\s*Ivanova\s*P)oslanic|(?:1\.?\s*L|I\.?\s*L)ist\s*(?:sw\.?\s*J|J)an|Koiro\s*Yohaannis|Avval\s*?Yoohann|Yek\s*Yoohann|1\.?\s*Yooxana|I\.?\s*Yooxana|1\.\s*Yoohann|YekYoohann|1\s*Yoohann|1Yoohann|1\s*Yahy)a|(?:Ensimmainen\s*Johannek|(?:1\.?\s*Johannek|I\.?\s*Johannek))sen\s*kirje|Waraka\s*wa\s*Kwanza\s*wa\s*Yohane|Pr(?:im(?:(?:a\s*lettera\s*di|o)\s*Giovanni|a\s*Giovanni|eir[ao]\s*Joao)|v(?:(?:(?:ni\s*(?:list\s*)?Janu|a\s*Jano)|a\s*kniha\s*Jano)|y\s*list\s*Jano)v)|Barua\s*ya\s*Kwanza\s*ya\s*Yohane|E(?:nsimmainen\s*Johanneksen|erste\s*Joh)|F(?:yrsta\s*(?:bref\s*Johannesar|Johannesarbref)|orsta\s*Johannesbrevet|irst\s*J(?:oh[mn]|h?n))|y(?:ohanacem\s*pahile|uhannako\s*pahilo)\s*patra|(?:Johannes(?:\s*forsta\s*b|['’]\s*1\.?\s*B)re|1(?:\.\s*Johannes['’]|\s*Johannes['’])\s*Bre|(?:1\.?\s*l|I\.?\s*l)ist\s*Janu|1\.?\s*Janu|I\.?\s*Janu)v|E(?:pistula\s*I\s*Ioannis|(?:erste\s*Johanne|rste(?:[nrs])?\s*Johanne|lso\s*Jano)s|lso\s*Jn)|(?:(?:Epistula\s*)?Ioanni|Jano)s\s*I|(?:1(?:\.\s*(?:Johannesbreve|Gjoni)|\s*(?:Johannesbreve|Gjoni)|\s*[ei]\.?\s*Gjoni)|Prvy\s*Janov\s*lis)t|(?:Primer(?:o\s*(?:San\s*J[au][au]|J[au][au])|\s*(?:San\s*J[au][au]|J[au][au]))|(?:Prem(?:ier(?:e?s|e?)\s*Je|ye\s*J)|1\.?\s*Yokan|I(?:\.\s*(?:Yokan|Je)|\s*(?:Yokan|Je))|1(?:ere?|re)\.\s*Je|1(?:ere?|re)\s*Je|1\.?\s*Je)a|1\.o\.\s*(?:San\s*J[au][au]|J[au][au])|(?:1(?:o\.?\s*S|\.?\s*S)|I\.?\s*S)an\s*J[au][au]|1\.o\s*(?:San\s*J[au][au]|J[au][au])|First\s*J(?:h[ho]|oo)|Una(?:ng)?\s*Jua|1st\.\s*J(?:h[ho]|oo)|1\.?\s*Gioa|I(?:\.\s*(?:Gioa|J(?:oo|a[au]))|\s*(?:Gioa|J(?:oo|a[au])))|(?:1(?:o(?:\.\s*J[au]|\s*J[au])|\.?\s*Ju)|I\.?\s*Ju)[au]|1st\s*J(?:h[ho]|oo)|1(?:\.\s*Joo|\s*(?:Joo|Yh))|1\.?\s*Ja[au]|(?:1\.?\s*Jh|I\.?\s*Jh)[ho])n|1(?:\.\s*J(?:o(?:h(?:annes(?:brev)?)?)?)?|\s*J(?:o(?:h(?:annes(?:brev)?)?)?)?|\s*(?:Yoh|Gj|Iv)|yoh?|Yoh)|Yo(?:oxanaa\s*Kowaad|hane\s*I)|Avval(?:\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|John)|(?:1\.?\s*Johannek|I\.?\s*Johannek)sen|Avval(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|Yek\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Kwanza\s*Yohan[ae]|Prv(?:a\s*Ivanova|y\s*Janov|ni\s*J(?:an)?)|1e\.?\s*Johannes|(?:1(?:\.\s*(?:yuhannak|Joa)|\s*(?:yuhannak|Joa))|I\.?\s*Joa|avvly)o|YekY(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Yek\s*Y(?:o(?:ohana|hann?a)|uhann?a)|1(?:\s*(?:yohanacem|Gv|In)|\.\s*J(?:oh[mn]|n)|\s*J(?:oh[mn]|n)|yohn)|I(?:\.\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|n)|Yohan(?:es|a)|In)|\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|n)|Yohan(?:es|a)|In))|(?:1\.?\s*Giov|I\.?\s*Giov)anni|(?:First\s*Jo?p|1st\.\s*Jo?p|1st\s*Jo?p|1(?:\.\s*Jo?p|\s*Jo?p)|I(?:\.\s*Jo?p|\s*Jo?p))hn|(?:1\s*Yoo?|1Yoo)hanaah|1\.\s*I(?:vanova|oan)|I(?:\.\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Gi)|\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Gi))|YekY(?:o(?:ohana|hann?a)|uhann?a)|Kwanza\s*Yoh|1\.\s*Yohan(?:es|a)|(?:1\.?\s*Ioann|I\.?\s*Ioann)is|1\s*k\.\s*Janov|(?:First\s*Jon|1st\.\s*Jon|1st\s*Jon|1\.?\s*Jon|I\.?\s*Jon)h|1\s*Yohannah|1\s*?Yuhan[an]ah|1\s*Ivanova|1\.\s*Yoh(?:ane)?|First\s*J(?:oh?|h)|(?:1\s*Yoo?|1Yoo)hana|1\s*Yohanna|1\s*?Yuhann?a|1\.?\s*Jan(?:o(?:va|s)|a)|1\s*Yohanes|1\s*k\s*Janov|1st\.\s*J(?:oh[mn]|h?n)|1Yohan[an]ah|1\.?\s*Jan(?:ov)?|1\s*Yohane|1st\.\s*J(?:oh?|h)|1Yohann?a|1o\.?\s*Joao|1a\.\s*Joao|1st\s*J(?:oh[mn]|h?n)|1\.?\s*Yoox|1e\.\s*Joh|1st\s*J(?:oh?|h)|1a\s*Joao|1\s*Ioan|1e\s*Joh|(?:1\.?\s*Jh|I\.?\s*Jh)n|1\.?\s*Gi|1\.?\s*Jh|I\.?\s*Jh|1\.\s*In|1John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:D(?:ru(?:he\s*poslannja\s*apostola\s*Ivan|g(?:a\s*(?:(?:Ivanova\s*[Pp]oslanic|Jan)|List\s*(?:sw\.?\s*Jan|Jan))|i\s*(?:List\s*(?:sw\.?\s*Jan|Jan)|Jan)))|o(?:vom\s*?Yoohann|\s*?Yoohann))|(?:II\.?\s*Ivanova\s*P|2\.?\s*Ivanova\s*P)oslanic|Naa77antto\s*Yohaannis|(?:II\.?\s*L|2\.?\s*L)ist\s*(?:sw\.?\s*Jan|Jan)|II\.?\s*Yooxana|2\.?\s*Yooxana|2\.\s*Yoohann|2\s*Yoohann|2Yoohann|2\s*Yahy)a|Se(?:cond(?:(?:a\s*lettera\s*di|o)\s*Giovanni|a\s*Giovanni|\s*J(?:o(?:h[mn]|nh)|h?n))|gund(?:o\s*(?:San\s*J[au][au]n|Joao|J[au][au]n)|a\s*Joao)|cond\s*J(?:o?ph|h[ho]|oo)n)|(?:Toinen\s*Johannek|(?:II\.?\s*Johannek|2\.?\s*Johannek))sen\s*kirje|Waraka\s*wa\s*Pili\s*wa\s*Yohane|Barua\s*ya\s*Pili\s*ya\s*Yohane|y(?:uhannako\s*dostro|ohanacem\s*dusre)\s*patra|(?:Johannes['’]\s*Andet|2(?:\.\s*Johannes['’]|\s*Johannes['’]))\s*Brev|Johannes(?:’\s*andre|\s*andra)\s*brev|And(?:e(?:n\s*Johannes(?:['’]\s*B|b)|t\s*Johannesb)rev|ra\s*Johannesbrevet)|Epistula\s*I(?:I\s*Ioannis|oannis\s*II)|T(?:oinen\s*Joh(?:anneksen)?|weede\s*Joh)|(?:Druh(?:a\s*(?:kniha\s*Jano|(?:list\s*)?Janu)|y\s*(?:list\s*Jan[ou]|Janu))|(?:II\.?\s*l|2\.?\s*l)ist\s*Janu|2\s*k\.\s*Jano|II\.?\s*Janu|2\s*k\s*Jano|2\.?\s*Janu)v|(?:2(?:\.\s*(?:Johannesbreve|Gjoni)|\s*(?:Johannesbreve|Gjoni)|\s*[ei]\.?\s*Gjoni)|Druhy\s*Janov\s*lis)t|(?:Zweite(?:[nrs])?\s*Johanne|(?:Tweede\s*Jo|(?:Andre\s*Jo|2e\.?\s*Jo))hanne|Masodik\s*Jano)s|2(?:\.\s*J(?:o(?:h(?:annes(?:brev)?)?)?)?|\s*J(?:o(?:h(?:annes(?:brev)?)?)?)?|\s*(?:Yoh|Gj|Iv)|yoh?|Yoh)|(?:II\.?\s*Johannek|2\.?\s*Johannek)sen|(?:Do(?:vom(?:\s*Y(?:oo?|u)hanaa|Y(?:oo?|u)hanaa)|\s*Y(?:oo?|u)hanaa|Y(?:oo?|u)hanaa)|(?:2\s*Yoo?|2Yoo)hanaa|2\s*?Yuhanaa|2Yohanaa|II\.?\s*Jon|2\.?\s*Jon)h|Yooxanaa\s*Labaad|Anden\s*Joh(?:annes)?|D(?:o(?:vom(?:\s*Y[ou]hannah|Y[ou]hannah)|\s*Y[ou]hannah|Y[ou]hannah)|ruh[ay]\s*Janova)|(?:(?:I(?:kalawang\s*Ju|I(?:\.\s*(?:Yokan|Je)|\s*(?:Yokan|Je)))|2\.?\s*Yokan|2(?:e\.?\s*Je|\.?\s*Je))a|De(?:uxiemes?\s*Jea|zyem\s*Ja)|2(?:eme\.|de?\.)\s*Jea|2nd\.?\s*J(?:o?ph|h[ho]|oo)|II(?:\.\s*(?:Gioa|J(?:oo|a[au]))|\s*(?:Gioa|J(?:oo|a[au])))|2(?:eme\s*|de?\s*)Jea|(?:II(?:\.\s*Jo?p|\s*Jo?p)|DovomJo|2(?:\.\s*Jo?p|\s*Jo?p)|2Jo)h|2\.?\s*Gioa|(?:II\.?\s*Jh|2\.?\s*Jh)[ho]|2(?:\.\s*Joo|\s*(?:Joo|Yh))|2\.?\s*Ja[au])n|D(?:ru(?:ga\s*Ivanova|h(?:a\s*J(?:an(?:ov)?)?|y\s*J(?:an(?:ov)?)?))|o(?:vom(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a)))|(?:2(?:\.(?:o\.?\s*S|\s*S)|\s*S)|II\.?\s*S)an\s*J[au][au]n|II(?:\.\s*(?:J(?:oh(?:annes|[mn])|an(?:os|a)|n)|Yohan(?:es|a)|In)|\s*(?:J(?:oh(?:annes|[mn])|an(?:os|a)|n)|Yohan(?:es|a)|In))|(?:II\.?\s*Giov|2\.?\s*Giov)anni|(?:2(?:\.\s*(?:yuhannak|Joa)|\s*(?:yuhannak|Joa))|II\.?\s*Joa|dovvomy)o|2o\.\s*(?:San\s*J[au][au]n|Joao|J[au][au]n)|II(?:\.\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:oh?|an)?|Gi)|\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:oh?|an)?|Gi))|2(?:\s*(?:yohanacem|Gv|In)|\.\s*J(?:oh[mn]|n)|\s*J(?:oh[mn]|n)|yohn)|Pili\s*Yohan[ae]|2o\s*(?:San\s*J[au][au]n|Joao|J[au][au]n)|(?:II\.?\s*Ioann|2\.?\s*Ioann)is|2\.\s*I(?:vanova|oan)|Second\s*J(?:oh?|h)|2\.\s*Yohan(?:es|a)|(?:II\.?\s*Janov|2\.?\s*Janov)a|2\s*Yohannah|2\s*?Yuhannah|Masodik\s*Jn|Ioannis\s*II|2\s*Ivanova|2\.\s*Yoh(?:ane)?|II\.?\s*Janov|(?:2\s*Yoo?|2Yoo)hana|2\s*Yohanna|2\s*?Yuhann?a|Andre\s*Joh|2\s*Yohanes|2Yohannah|2nd\.?\s*J(?:o(?:h[mn]|nh)|h?n)|2\.o\.?\s*J[au][au]n|Yohane\s*II|2\s*Yohane|2\.?\s*Janov|2Yohann?a|Pili\s*Yoh|2nd\.?\s*J(?:oh?|h)|2\.?\s*Jan(?:os|a)|2a\.?\s*Joao|(?:II\.?\s*Ju|2\.?\s*Ju)[au]n|Janos\s*II|2\.?\s*Yoox|2e\.?\s*Joh|(?:II\.?\s*Jh|2\.?\s*Jh)n|2\.?\s*Jan|2\s*Ioan|II\.?\s*Jh|2\.?\s*Gi|2\.?\s*Jh|2\.\s*In))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Tr(?:e(?:tje\s*poslannja\s*apostola\s*Ivan|ca\s*Ivanova\s*[Pp]oslanic)|zeci(?:a\s*(?:List\s*(?:sw\.?\s*Jan|Jan)|Jan)|\s*(?:List\s*(?:sw\.?\s*Jan|Jan)|Jan)))|(?:III\.?\s*Ivanova\s*P|3\.?\s*Ivanova\s*P)oslanic|Hezzantto\s*Yohaannis|(?:III\.?\s*L|3\.?\s*L)ist\s*(?:sw\.?\s*Jan|Jan)|Se(?:vom\s*?Yoohann|h\s*?Yoohann|\s*?Yoohann)|III\.?\s*Yooxana|3\.?\s*Yooxana|3\.\s*Yoohann|3\s*Yoohann|3Yoohann|3\s*Yahy)a|T(?:er(?:z(?:(?:a\s*lettera\s*di|o)|a)\s*Giovanni|cer(?:o\s*(?:San\s*J[au][au]n|J[au][au]n)|\s*(?:San\s*J[au][au]n|J[au][au]n)))|re(?:dje\s*Johannesbrevet|ti\s*Janov(?:\s*list|a))|(?:roisiemes?\s*Jea|hird\s*J(?:o?ph|h[ho]|oo))n|atu\s*Yohan[ae]|hird\s*J(?:oh[mn]|h?n))|(?:Kolmas\s*Johannek|(?:III\.?\s*Johannek|3\.?\s*Johannek))sen\s*kirje|Waraka\s*wa\s*Tatu\s*wa\s*Yohane|Barua\s*ya\s*Tatu\s*ya\s*Yohane|y(?:uhannako\s*testro|ohanacem\s*tisre)\s*patra|(?:Tredje\s*Johannes['’]|3\.?\s*Johannes['’])\s*Brev|Johannes(?:(?:(?:(?:'\s*Tredje|'\s*3\.?)\s*B|’\s*(?:Tredje|3\.?)\s*B)|’\s*tredje\s*b)|\s*tredje\s*b)rev|Epistula\s*I(?:II\s*Ioannis|oannis\s*III)|T(?:re(?:dje\s*Joh(?:annes(?:brev)?)?|ca\s*Ivanova|ti\s*J(?:an(?:ov)?)?)|hird\s*J(?:oh?|h)|atu\s*Yoh)|Kolmas\s*Johanneksen|3(?:e\.?\s*Johannesbreve|(?:(?:\s*[ei]\.?\s*Gj|\s*Gj)|\.\s*Gj)oni)t|(?:Treti(?:a\s*(?:kniha\s*)?Jano|\s*(?:list\s*)?Janu)|(?:III\.?\s*l|3\.?\s*l)ist\s*Janu|III\.?\s*Janu|3\s*k\.\s*Jano|3\s*k\s*Jano|3\.?\s*Janu)v|Yooxanaa\s*Saddexaad|3\.?\s*Johannesbrevet|(?:III\.?\s*Johannek|3\.?\s*Johannek)sen|(?:D(?:ritte(?:[nrs])?\s*Johanne|erde\s*Johanne)|Harmadik\s*Jano)s|3\.?\s*Johannes(?:brev)?|Se(?:vom(?:\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|h(?:\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|\s*Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah)|Y(?:o(?:ohanaah|han[an]ah)|uhan[an]ah))|Se(?:vom(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|h(?:\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|\s*Y(?:o(?:ohana|hann?a)|uhann?a)|Y(?:o(?:ohana|hann?a)|uhann?a))|III(?:\.\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|n)|Yohan(?:es|a)|In)|\s*(?:J(?:oh(?:annes|[mn])|an(?:o(?:va|s)|a)|n)|Yohan(?:es|a)|In))|(?:(?:I(?:katlong\s*Ju|II(?:\.\s*(?:Yokan|Je)|\s*(?:Yokan|Je)))|3\.?\s*Yokan|3(?:e\.?\s*Je|\.?\s*Je))a|III(?:\.\s*(?:Gioa|J(?:oo|a[au]))|\s*(?:Gioa|J(?:oo|a[au])))|3eme\.\s*Jea|(?:III(?:\.\s*Jo?p|\s*Jo?p)|3(?:\.\s*Jo?p|\s*Jo?p|Jo))h|3rd\.\s*J(?:o?ph|h[ho]|oo)|3eme\s*Jea|(?:III\.?\s*Jh|3\.?\s*Jh)[ho]|3rd\s*J(?:o?ph|h[ho]|oo)|3\.?\s*Gioa|3(?:\.\s*Joo|\s*(?:Joo|Yh))|3\.?\s*Ja[au])n|(?:III\.?\s*S|3(?:o\.?\s*S|\.?\s*S))an\s*J[au][au]n|3\.o\.\s*(?:San\s*J[au][au]n|J[au][au]n)|(?:III\.?\s*Giov|3\.?\s*Giov)anni|(?:Terceir[ao]\s*Joa|3(?:\.\s*(?:yuhannak|Joa)|\s*(?:yuhannak|Joa))|III\.?\s*Joa|3o\.?\s*Joa|3a\.\s*Joa|3a\s*Joa)o|3(?:e(?:\.\s*Joh(?:annes)?|\s*Joh(?:annes)?)|\.\s*J(?:oh?)?|\s*(?:Yoh|Gj|Iv)|\s*J(?:oh?)?|yoh?|Yoh)|III(?:\.\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Gi)|\s*(?:I(?:vanova|oan)|Yo(?:h(?:ane)?|ox)|J(?:an(?:ov)?|oh?)?|Gi))|3\.o\s*(?:San\s*J[au][au]n|J[au][au]n)|(?:III\.?\s*Ioann|3\.?\s*Ioann)is|3(?:\s*(?:yohanacem|Gv|In)|\.\s*J(?:oh[mn]|n)|\s*J(?:oh[mn]|n)|yohn)|(?:3\s*Yoo?|3Yoo)hanaah|Harmadik\s*Jn|Ioannis\s*III|3\.\s*I(?:vanova|oan)|3\.\s*Yohan(?:es|a)|(?:Third\s*Jon|III\.?\s*Jon|3rd\.\s*Jon|3rd\s*Jon|3\.?\s*Jon)h|3\s*Yohannah|3\s*?Yuhan[an]ah|Yohane\s*III|3\s*Ivanova|3\.\s*Yoh(?:ane)?|(?:3\s*Yoo?|3Yoo)hana|3\s*Yohanna|3\s*?Yuhann?a|Derde\s*Joh|3\.?\s*Jan(?:o(?:va|s)|a)|3\s*Yohanes|3rd\.\s*J(?:oh[mn]|h?n)|(?:III\.?\s*Ju|3(?:o(?:\.\s*J[au]|\s*J[au])|\.?\s*Ju))[au]n|3Yohan[an]ah|Janos\s*III|3\.?\s*Jan(?:ov)?|3\s*Yohane|3rd\.\s*J(?:oh?|h)|3Yohann?a|(?:III\.?\s*Jh|3\.?\s*Jh)n|3rd\s*J(?:oh[mn]|h?n)|sevvomyo|3\.?\s*Yoox|III\.?\s*Jh|3rd\s*J(?:oh?|h)|3\s*Ioan|3\.?\s*Gi|3\.?\s*Jh|3\.\s*In))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo))|of\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo))|of\s*(?:S(?:aint\s*J(?:o?ph|h[ho]|oo)|t(?:\.\s*J(?:o?ph|h[ho]|oo)|\s*J(?:o?ph|h[ho]|oo)))|J(?:o?ph|h[ho]|oo)))|El\s*Evangelio\s*de\s*J[au][au]|Saint\s*J(?:o?ph|h[ho]|oo)|St\.\s*J(?:o?ph|h[ho]|oo)|St\s*J(?:o?ph|h[ho]|oo)|Gioa|Jo?ph|J(?:oo|a[au]|ea)|Ju[au]|Jh[ho])n|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n))|of\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n)))|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h)|of\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h))|Mabuting\s*Balita\s*ayon\s*kay\s*(?:San\s*)?Juan|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n))|of\s*(?:S(?:aint\s*J(?:o(?:h[mn]|nh)|h?n)|t(?:\.\s*J(?:o(?:h[mn]|nh)|h?n)|\s*J(?:o(?:h[mn]|nh)|h?n)))|J(?:o(?:h[mn]|nh)|h?n)))|(?:Evankeliumi\s*Johanneksen\s*muka|Yokan|Iv)an|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h)|of\s*(?:S(?:aint\s*Jo?h|t(?:\.\s*Jo?h|\s*Jo?h))|Jo?h))|Das\s*Evangelium\s*nach\s*Johannes|Ebanghelyo\s*ayon\s*kay\s*(?:San\s*)?Juan|E(?:van(?:gelium\s*(?:secundum\s*Ioannem|podle\s*Jana)|jelium\s*Podla\s*Jana)|(?:w(?:angelia\s*wg\s*sw)?\.|(?:wangelia\s*wg\s*sw|w(?:angelia)?))\s*Jana)|Evangelie(?:\s*volgens|t\s*etter)\s*Johannes|Evangelium\s*nach\s*Johannes|(?:Johanneksen\s*evankelium|Gjon)i|Vangelo\s*di\s*(?:San\s*)?Giovanni|(?:Ebanghelyo|Sulat)\s*ni\s*San\s*Juan|Jevanhelije\s*vid\s*Ivana|J(?:ohann(?:is\s*|es)|anovo\s*)evangelium|Johannesevangeliet|Ungjilli\s*i\s*Gjonit|Injili\s*ya\s*Yohan[ae]|Injil\s*Yohanes|Joh(?:anne(?:ksen|s))?|Y(?:o(?:haannis|o(?:xana|hann))|ahy)a|Saint\s*J(?:o(?:h[mn]|nh)|h?n)|Saint\s*Jo?h|y(?:uhannal|ohanan)e|(?:Y(?:oo?hana|uhana)a|Jon)h|Y(?:oh(?:annah|(?:ane)?s)|uhannah)|St\.\s*J(?:o(?:h[mn]|nh)|h?n)|Giovanni|San\s*Juan|Y(?:o(?:(?:o?hana|(?:h(?:ane)?|ox))|hanna)|uhann?a)|St\.\s*Jo?h|St\s*J(?:o(?:h[mn]|nh)|h?n)|Ioannes|Ew\s*Jan|St\s*Jo?h|J(?:an(?:os|a)|o(?:h[mn]|ao)|n)|Ioan|G(?:jo|i)|Jhn|Jh|G[gv]))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Josh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:yahosuko\s*pustak|Ks(?:ieg[ai]\s*Jozuego|\.?\s*Jozuego)|(?:Jo(?:osuan\s*kirj|s(?:uov|hu)|zuov|usu)|Y(?:ashuuc|o(?:s(?:hu['’]|u)|sh['’]u|wshu)|ushu)|yahosaw|Joushu|Gsu)a|Li(?:ber\s*Iosue|v\s*Jozye\s*a)|Jo(?:(?:s(?:vas\s*Bog|u(?:ah|e))|zu(?:eu|a))|svabogen)|I(?:osu(?:a\s*Navi|e)|sus\s*Navyn)|(?:Jos(?:vas\s*|ua)bo|Yusa)k|Jo(?:s(?:va(?:bog|s)?|ua|h)?|os(?:uan)?|z(?:ue|s)?)|yahosuko|(?:Yahosho|Jozueg)o|Y(?:osh(?:uah|a)|aasu|usha)|Y(?:os(?:hua)?|ash)|Joz(?:su|y)e|Giosue|Ios(?:ua)?|Jsh|Gs|Js))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Judg"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:nyayakarttaharuko(?:\s*pustak)?|(?:Tuomarien\s*kirj|Xaakinnad|Sudcovi|Da(?:annat|n))a|K(?:n(?:jiga\s*o\s*Sucima|yha\s*Suddiv)|s(?:ieg[ai]\s*Sedziow|\.?\s*Sedziow)|\.?\s*sudcov)|(?:M(?:ga\s*(?:Maghuh|H)uko|aghuhuko)|Hakim-?haki|Para\s*Haki|H(?:uko|k))m|Li(?:ber\s*Iudicum|v\s*Chef\s*yo)|Dommernes\s*bok|J(?:udecatorii|dgs|gs|ij|[cz])|(?:D(?:om(?:merboge|ar(?:aboki|boke))|avarana)|Da(?:v(?:oo)?r|w(?:oo|a)r)a|Qua)n|J(?:u(?:decatori|ec|dg|iz|e|g)|d?g)|D(?:om(?:mer(?:nes?)?|arabok)?|avaran)|Tuom(?:arien)?|G(?:jyqtaret|dc)|R(?:ichteren|echters)|R(?:ich(?:t(?:ere?)?)?|echt)|Davarane|Nyayiyon|(?:Hak\.?-?h|Bir)ak|Barnwyr|(?:Giudi|Su)ci|Waamuzi|Sedziow|Iudicum|S(?:ud(?:cov)?|edz|d)|Soudcu|Ju(?:(?:ec|dg|g)|iz)es|saste|Barn|Waam|Xaak|Gjy|H[au]k|Iud|Mag|Sd[cz]|Amu))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:K(?:itabu\s*cha\s*Kwanza\s*ch|wanz)a\s*Ez|Ensimmainen\s*Es|Erste(?:[nrs])?\s*Esd|Forsta\s*Es|Eerste\s*Ez|(?:III\.?\s*Ez|3\.?\s*Ez)d|(?:Unang|1e\.)\s*Ez|Derde\s*Ez|3e\.?\s*Ez|(?:Una|1e)\s*Ez)r|P(?:ierwsz[aey]\s*(?:Ks(?:ieg[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|Ezdrasz)|rv(?:a\s*(?:kniha\s*)?Ezdrasov|y\s*(?:list\s*)?Ezdrasov))|(?:1\.?\s*K|I\.?\s*K)s(?:ieg[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|1\s*k\.\s*Ezdrasov|1\s*k\s*Ezdrasov|(?:1\.?\s*Ezdraso|I\.?\s*Ezdraso)v|1\.?\s*Ez(?:drasz|r)|I(?:\.\s*E(?:z(?:drasz|r)|sr)|\s*E(?:z(?:drasz|r)|sr))|Erste(?:[nrs])?\s*Esr|(?:III\.?\s*Ez|3\.?\s*Ez)r|3(?:e\.?\s*Esr|\.?\s*Esr))a|Pr(?:v(?:a\s*(?:kniha\s*)?Ezdras|y\s*(?:list\s*)?Ezdras)|im[ao]\s*Esdra)|Pr(?:emier(?:e?s|e?)\s*Esdras|ime(?:ir[ao]|ro)\s*Esdras|imer\s*Esdras|im[ao]\s*Esdras|vni\s*Ezdras)|T(?:redje\s*Es(?:drasbog|ra)|erz[ao]\s*Esdra)|Liber\s*(?:Esdrae\s*I|I\s*Esdrae)|E(?:sdra(?:s\s*Yunani|\s*greco)|zra\s*Yunani)|(?:(?:Eerste|(?:(?:Unang|1e\.)|(?:Una|1e)))|Derde)\s*Esdras|(?:First|1st\.?)\s*Esdras|1(?:(?:(?:ere|\.o|[ao])|er)|re)\.\s*Esdras|(?:1\.?\s*Esdrasb|3\.?\s*Esdrasb)og|1\s*k\.\s*Ezdras|III\.?\s*Esdras|Elso\s*Ezdras|1(?:(?:(?:ere|\.o|[ao])|er)|re)\s*Esdras|First\s*Esdr?|III\.?\s*Esdra|1\s*k\s*Ezdras|3e\.?\s*Esdras|1\.?\s*Ezd(?:ras?)?|I(?:\.\s*E(?:zd(?:ras?)?|sd(?:ra?)?)|\s*E(?:zd(?:ras?)?|sd(?:ra?)?))|1\.?\s*Esdras|3(?:\.\s*Esdras?|\s*Esdras?)|1st\.\s*Esdr?|1(?:\.\s*Es(?:drae|ra)|\s*Es(?:drae|ra)|Esd)|I(?:\.\s*Esdra[es]|\s*Esdra[es])|1(?:\.\s*Es(?:d(?:ra?)?|r)?|\s*Es(?:d(?:ra?)?|r)?)|Elso\s*Ezd|1st\s*Esdr?|Ezdras\s*I))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Kitabu\s*cha\s*Pili\s*cha\s*Ezra|(?:Dru(?:h(?:a\s*(?:kniha\s*)?Ezdrasov|y\s*(?:list\s*)?Ezdrasov)|g[ai]\s*(?:Ks(?:ieg[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|Ezdrasz))|(?:II\.?\s*K|2\.?\s*K)s(?:ieg[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|2\s*k\.\s*Ezdrasov|(?:II\.?\s*Ezdraso|2\.?\s*Ezdraso)v|2\s*k\s*Ezdrasov|II(?:\.\s*E(?:z(?:drasz|r)|sr)|\s*E(?:z(?:drasz|r)|sr))|Zweite(?:[nrs])?\s*Esr|2\.?\s*Ez(?:drasz|r)|Fjerde\s*Esr|Andre\s*Esr|(?:IV\.?\s*Ez|4\.?\s*Ez)r|4\.?\s*Esr)a|Druh(?:a\s*(?:kniha\s*)?Ezdras|y\s*(?:list\s*)?Ezdras)|Fjerde\s*Esdrasbog|(?:(?:(?:(?:Ikalawang|2e\.)|2e)|Tweede)|Vierde)\s*Esdras|Deuxiemes?\s*Esdras|Anden\s*Esdrasbog|Liber\s*(?:Esdrae\s*II|II\s*Esdrae)|Second[ao]\s*Esdras|Masodik\s*Ezdras|(?:Segund[ao]|2(?:(?:eme|\.o|de|[ao])|d)\.)\s*Esdras|(?:(?:Ikalawang|2e\.)\s*Ez|Zweite(?:[nrs])?\s*Esd|Quart[ao]\s*Esd|(?:(?:Fjarde|Andra)|Toinen)\s*Es|Tweede\s*Ez|Vierde\s*Ez|(?:IV\.?\s*Ez|4\.?\s*Ez)d|2e\s*Ez)ra|Second(?:[ao]\s*Esdra|\s*Esdr?)|(?:Second\s*|2nd\.?\s*)Esdras|E(?:sdras|zra)\s*Latin|(?:2\.?\s*Esdrasb|4\.?\s*Esdrasb)og|Andre\s*Esdras|Masodik\s*Ezd|2\s*k\.\s*Ezdras|2(?:(?:eme|\.o|de|[ao])|d)\s*Esdras|II(?:\.\s*E(?:zd(?:ras?)?|sd(?:ra?)?)|\s*E(?:zd(?:ras?)?|sd(?:ra?)?))|2\s*k\s*Ezdras|II(?:\.\s*Esdra[es]|\s*Esdra[es])|IV\.?\s*Esdras|2(?:\.?\s*Esdras|(?:\.\s*Es(?:d(?:ra?)?|r)?|\s*Es(?:d(?:ra?)?|r)?))|4(?:\.\s*Esdras?|\s*Esdras?)|2\.?\s*Ezd(?:ras?)?|2nd\.?\s*Esdr?|IV\.?\s*Esdra|2(?:\.\s*Es(?:drae|ra)|\s*Es(?:drae|ra)|Esd)|Ezdras\s*II|Pili\s*Ezra))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Isa"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:Ks(?:ieg[ai]\s*Izajasz|\.?\s*Izajasz)|Jesa(?:jan\s*kirj|i)|E(?:ysheya['’]|s(?:heya['’]|ei))|(?:E(?:ysh(?:a(?:['’]i|a)|['’])|sh(?:a(?:['’]i|a)|['’]))|I(?:ysha['’]|sha['’])|Ay?shai|Yesa)y|I(?:(?:s(?:i(?:yaas|h)|a[jy])|za(?:jasz|ij)|-?sai-?)|-?sa-?gi)|Ay?shay|yasay|esh['’])a|Li(?:ber\s*Isaiae|v\s*Ezayi\s*a)|E(?:sa(?:jas['’]\s*Bog|ie)|ysh(?:a(?:[iy]yah|['’]yaa|yaa)|eyaa)|sh(?:a(?:[iy]yah|['’]yaa|yaa)|eyaa)|z(?:saias|ayi))|Esaias['’]\s*bok|Jesaja(?:bok(?:en|a)|s\s*bok)|yashaayaah|I(?:yshaiy|s(?:haiy|s))ah|Ishacyaah|E(?:ysha(?:(?:[iy])?|['’])ya|sha(?:(?:[iy])?|['’])ya|sa(?:i(?:as)?|jas)?|zs)|Is(?:ai(?:a[ai]|s)h|aii(?:[ai])?h|aa(?:[ai](?:[ai])?h|h)|i[ai](?:[ai](?:[ai])?h|h)|a(?:ia?h|h))a|Iy?shayaa|Is(?:ai(?:a[ai]|s)h|aii(?:[ai])?h|aa(?:[ai](?:[ai])?h|h)|i[ai](?:[ai](?:[ai])?h|h)|a(?:ia?h|h))|Iy?shaya|Jes(?:ajan?)?|I(?:z(?:ajas)?|s(?:a(?:ia?)?|iy|h)?|-?sa)|I(?:sai(?:as|e)|a)|Izaias|Yes|Ys))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:S(?:ameela\s*Maxaafaa\s*Naa77anttuwa|emuel\s*Yang\s*Kedu)|D(?:ru(?:g(?:a\s*(?:Samuelo(?:va\s*knjig|w)|Ks(?:ieg[ai]\s*Samuelow|\.?\s*Samuelow))|i\s*(?:Ks(?:ieg[ai]\s*Samuelow|\.?\s*Samuelow)|Samuelow))|h(?:a\s*(?:kniha\s*)?Samuelov|y\s*(?:kniha\s*|(?:list\s*)?)Samuelov))|ezyem\s*liv\s*Samyel\s*l)|(?:II\.?\s*Ks|2\.?\s*Ks)(?:ieg[ai]\s*Samuelow|\.?\s*Samuelow)|(?:II\.?\s*k|2\.\s*k)niha\s*Samuelov|2\s*kniha\s*Samuelov|2\s*k\.\s*Samuelov|II(?:\.\s*Samuelo[vw]|\s*Samuelo[vw])|2\s*k\s*Samuelov|2\.?\s*Samuelo[vw])a|Kitabu\s*cha\s*Pili\s*cha\s*Samueli|And(?:en\s*(?:Kongerigernes\s*B|Samuelsb)og|r(?:a\s*Samuelsboken|e\s*Samuelsbok))|Cartea\s*(?:a\s*doua\s*a\s*Regilor|II\s*a\s*(?:lui\s*Samuel|Regilor))|Drug(?:a\s*(?:knjiga\s*o\s*Samuelu|Ks(?:ieg[ai]\s*Samuela|\.?\s*Samuela))|i\s*Ks(?:ieg[ai]\s*Samuela|\.?\s*Samuela))|Toinen\s*Samuelin\s*kirja|2\.?\s*Kongerigernes\s*Bog|(?:II\.?\s*Ks|2\.?\s*Ks)(?:ieg[ai]\s*Samuela|\.?\s*Samuela)|(?:II\.?\s*Samuelin|2\.?\s*Samuelin)\s*kirja|Liber\s*II\s*Samuelis|S(?:amu(?:u['’]eel\s*Labaad|el(?:is?\s*II|\s*II))|econd(?:[ao]\s*Samuele|\s*S(?:amu[ae]l[ls]|ma)))|(?:Ikalawang|Deuxiemes|Zweite[nrs]|2(?:(?:eme|\.o)\.|de?\.))\s*Samuel|D(?:ru(?:ga\s*Samuelova|h(?:a\s*S(?:am(?:uel)?)?|y\s*S(?:am(?:uel)?)?))|ovomSam)|Toinen\s*Samuelin|2\.?\s*Samuelsboken|(?:Se(?:cond\s*Kingdom|gund[ao]\s*Reino)|(?:2nd\.?\s*Kingd|(?:(?:II\.?\s*Ki|2\.?\s*Ki)ngd|dovv))om|(?:II\.?\s*Rei|2\.?\s*Rei)no|2[ao]\.\s*Reino|2[ao]\s*Reino)s|(?:Deuxieme\s*|Zweite\s*|2(?:(?:eme|\.o)\s*|de?\s*))Samuel|(?:Do(?:(?:vom(?:\s*[Ss]|s)|s)am(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei])|vomSam(?:ow(?:ey|i)|u[ei])|vomSam(?:u['w’]|oe)i|vomSamw[ei]i|\s*sam(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei]))|II\.?\s*Samui|2\s*?Samow(?:ey|i)|2(?:\s*Sam(?:we|u)i|\.\s*Samui)|(?:2(?:\s*Sam(?:u['w’]|wi)|Samu['w’])|2\s*?Samoe)i|2Samw[ei]i|2Samu[ei])l|(?:Masodik\s*Samu|II(?:\.\s*Sam(?:uu['’]e|y)|\s*Sam(?:uu['’]e|y))|D(?:o(?:(?:(?:vom(?:\s*[Ss]|s)|s)|vomS)|\s*s)amou|ezyem\s*Samy)|(?:Tweede|2e\.)\s*Samu|2(?:\.\s*S(?:hamooa|amy)|\s*(?:Shamooa|(?:samuw|Samy)))|2\.?\s*Samuu['’]e|2\s*?Samou|2e\s*Samu)el|(?:Segund[ao]\s*S|(?:2[ao]\.\s*|2[ao]\s*)S)amuel|2(?:\.\s*S(?:a(?:m(?:uel(?:s(?:bok)?|i)?)?)?)?|\s*Samuel(?:s(?:bok)?|i)?|\s*S(?:am?)?|Sa|sm)|Second\s*S(?:a(?:m(?:u[ae]l)?)?|m)|2(?:\s*[ei]\.?\s*Samuelit|\.\s*(?:Samuel(?:sbog|i[st]|[el])|samuelko)|\s*Samuel(?:sbog|i[st]|[el])|\s*samuelko|smu)|And(?:en\s*Sam(?:uel)?|re\s*Sam(?:uel)?)|II\.?\s*Samuelin|II(?:\.\s*(?:Samuel(?:is|[els])|Regnorum)|\s*(?:Samuel(?:is|[els])|Regnorum))|2nd\.?\s*S(?:amu[ae]l[ls]|ma)|(?:Pili\s*Sam[uw]|II\.?\s*Samw|2\.\s*Samw)eli|II(?:\.\s*S(?:a(?:m(?:ueli?)?)?)?|\s*S(?:a(?:m(?:ueli?)?)?)?)|2nd\.?\s*S(?:a(?:m(?:u[ae]l)?)?|m)|2\.?\s*Samuelin|Masodik\s*Sam|2\.?\s*Regnorum|(?:II\.?\s*Samua|2\.?\s*Samua)l[ls]|(?:II\.?\s*Regi|2\.?\s*Regi)lor|(?:II\.?\s*Samua|2\.?\s*Samua)l|(?:Tweede|2e\.)\s*Sam|2\s*Samweli|Pili\s*Sam|(?:II\.?\s*Sm|2\.?\s*Sm)a|II\.?\s*Sm|2e\s*Sam|2\.?\s*Sm|2Sam))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:K(?:itabu\s*cha\s*Kwanza\s*cha\s*Samu|wanza\s*Sam[uw])eli|Ensimmainen\s*Samuelin\s*kirja|(?:S(?:ameela\s*Maxaafaa\s*Koiruwa|emuel\s*Yang\s*Pertam)|P(?:ierwsz[aey]\s*(?:Ks(?:ieg[ai]\s*Samuelow|\.?\s*Samuelow)|Samuelow)|r(?:v(?:a\s*Samuelova\s*knjig|(?:ni|a)\s*kniha\s*Samuelov|y\s*(?:list\s*)?Samuelov|ni\s*Samuelov)|emye\s*liv\s*Samyel\s*l))|(?:1\.?\s*Ks|I\.?\s*Ks)(?:ieg[ai]\s*Samuelow|\.?\s*Samuelow)|(?:(?:(?:1\.\s*k|I\.?\s*k)|1\s*k)niha|1\s*k\.)\s*Samuelov|1\s*k\s*Samuelov|1\.?\s*Samuelo[vw]|I(?:\.\s*Samuelo[vw]|\s*Samuelo[vw]))a|P(?:ierwsz[aey]\s*Ks(?:ieg[ai]\s*Samuela|\.?\s*Samuela)|r(?:va\s*knjiga\s*o\s*Samuelu|im[ao]\s*Samuele))|Cartea\s*(?:intai\s*a\s*Regilor|I\s*a\s*(?:lui\s*Samuel|Regilor))|E(?:nsimmainen\s*Samuelin|(?:erste|lso)\s*Sam)|1(?:\.\s*(?:Kongerigernes\s*Bog|Samuel(?:sbog|i[st]|[el])|samuelko)|\s*Kongerigernes\s*Bog|\s*[ei]\.?\s*Samuelit|\s*Samuel(?:sbog|i[st]|[el])|\s*samuelko|smu)|F(?:orsta\s*Samuelsboken|irst\s*S(?:amu[ae]l[ls]|ma))|(?:1\.?\s*Ks|I\.?\s*Ks)(?:ieg[ai]\s*Samuela|\.?\s*Samuela)|(?:1\.?\s*Samuelin|I\.?\s*Samuelin)\s*kirja|Samu(?:u['’]eel\s*Kowaad|el(?:is?\s*I|\s*I|[ls]))|Fyrri\s*Samuelsbok|Liber\s*I\s*Samuelis|(?:Pr(?:emiere?s|imero)|Erste[nrs]|1(?:(?:(?:ere|\.o)|er)|re)\.|Unang)\s*Samuel|1\.?\s*Samuelsboken|samuelko\s*pustak|(?:Primeir[ao]\s*Reino|First\s*Kingdom|1st\.\s*Kingdom|1st\s*Kingdom|(?:1\.?\s*Ki|I\.?\s*Ki)ngdom|1[ao]\.\s*Reino|(?:1\.?\s*Rei|I\.?\s*Rei)no|1[ao]\s*Reino|avval)s|(?:Primeir[ao]\s*S|(?:1[ao]\.\s*|1[ao]\s*)S)amuel|(?:Pr(?:emiere?\s*|imer\s*)|Erste\s*|1(?:(?:(?:ere|\.o)|er)|re)\s*|Una\s*)Samuel|Prv(?:a\s*Samuelova|ni\s*S(?:am(?:uel)?)?)|(?:Avval(?:\s*[Ss]|s)am(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei])|(?:Avval|1\s*?)Samow(?:ey|i)|(?:(?:Avval|1)Samu['w’]|(?:Avval|1\s*?)Samoe|1\s*Sam(?:u['w’]|wi))i|(?:Avval|1)Samw[ei]i|Yek(?:\s*sam(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei])|sam(?:ow(?:ey|i)|(?:u['w’]|oe)i|w[ei]i|u[ei]))|(?:Avval|1)Samu[ei]|1(?:\s*Sam(?:we|u)i|\.\s*Samui)|I\.?\s*Samui)l|1(?:\.\s*S(?:a(?:m(?:uel(?:s(?:bok)?|i)?)?)?)?|\s*Samuel(?:s(?:bok)?|i)?|\s*S(?:am?)?|Sa|sm)|(?:Premye\s*Samy|E(?:erste|lso)\s*Samu|Avval(?:\s*[Ss]|s)amou|1(?:\.\s*S(?:hamooa|amy)|\s*(?:Shamooa|(?:samuw|Samy)))|1\.?\s*Samuu['’]e|I(?:\.\s*Sam(?:uu['’]e|y)|\s*Sam(?:uu['’]e|y))|(?:Avval|1\s*?)Samou|Yek\s*?samou|1e\.\s*Samu|1e\s*Samu)el|First\s*S(?:a(?:m(?:u[ae]l)?)?|m)|1st\.\s*S(?:amu[ae]l[ls]|ma)|1\.?\s*Samuelin|I\.?\s*Samuelin|1st\.\s*S(?:a(?:m(?:u[ae]l)?)?|m)|1\.?\s*Regnorum|I(?:\.\s*(?:Samuel(?:is|[els])|Regnorum)|\s*(?:Samuel(?:is|[els])|Regnorum))|1st\s*S(?:amu[ae]l[ls]|ma)|I(?:\.\s*S(?:a(?:m(?:ueli?)?)?)?|\s*S(?:a(?:m(?:ueli?)?)?)?)|1st\s*S(?:a(?:m(?:u[ae]l)?)?|m)|Kwanza\s*Sam|(?:1\.?\s*Samua|I\.?\s*Samua|Samua)l[ls]|(?:1\.\s*Samw|I\.?\s*Samw)eli|(?:1\.?\s*Regi|I\.?\s*Regi)lor|(?:1\.?\s*Samua|I\.?\s*Samua|Samua)l|1\s*Samweli|AvvalSam|1e\.\s*Sam|Samuel|1e\s*Sam|(?:1\.?\s*Sm|I\.?\s*Sm)a|1\.?\s*Sm|I\.?\s*Sm|1Sam))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Hanidabaa\s*Odiya\s*Naa77antto\s*Maxaafaa|(?:Cartea\s*a\s*doua\s*Paralipomen|D(?:ruga\s*(?:knjiga\s*)?Ljetopis|ezyem\s*(?:liv\s*Kwonik\s*l|Istw))|I(?:kalawang\s*(?:Mga\s*)?Cronic|I\.?\s*Mga\s*Cronic)|(?:I(?:kalawang\s*Mga\s*Kroni|I\.?\s*Mga\s*Kroni|I\.?\s*Kronic)|Druh(?:a\s*(?:kniha\s*)?Kronic|y\s*(?:list\s*)?Kronic)|2\s*k\.\s*Kronic|2\s*k\s*Kronic)k|T(?:awarikh\s*Yang\s*Kedu|oinen\s*Aikakirj)|Masodik\s*Kronik|2(?:\.\s*(?:Mga\s*[CK]roni[ck]|(?:Kronic|Croni)k)|\s*(?:Mga\s*[CK]roni[ck]|(?:Kronick|(?:Cronik|Istw))))|(?:II\.?\s*Lj|2\.\s*Lj)etopis|(?:II\.?\s*A|2\.\s*A)ikakirj|2\s*Ljetopis|2\s*Aikakirj|II\.?\s*Istw|2\.\s*Istw|Pili\s*Ny|(?:II\.?\s*N|2\.?\s*N)y)a|(?:Druh(?:a\s*kniha|y\s*list)\s*P|Second\s*P|2\s*k\.?\s*P|2nd\.?\s*P)aralipomenon|I(?:kalawang\s*(?:Paralipomeno|Kronik(?:el|a))|I(?:\.\s*(?:Paralipomen(?:on|a)|Kronika|Hroniky|Chrn)|\s*(?:(?:(?:(?:Paralipomen(?:on|a)|Taw)|Chrn)|Kronika)|Hroniky))|I\.?\s*Kronikel)|Liber\s*II\s*Paralipomenon|Pili\s*Mambo\s*ya\s*Nyakati|(?:II\.?\s*Ma|2\.?\s*Ma)mbo\s*ya\s*Nyakati|(?:Deuxiemes?\s*Chronique|(?:2(?:eme\.|de?\.)\s*Chroniq|(?:2(?:eme\s*|de?\s*)Chroniq|(?:(?:II\.?\s*Chroniq|2\.?\s*Chroniq)|2e\.?\s*Chroniq)))ue|2nd\.?\s*Chronical|(?:II\.?\s*Chronic|2\.?\s*Chronic)al)s|(?:Ikalawang\s*Chronicl|2(?:(?:\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\s*Kronika)|\.\s*Kronika)v)e|Mambo\s*ya\s*Nyakati\s*II|(?:Dru(?:g(?:a\s*Ks(?:ieg[ai]\s*K|\.?\s*K)|i\s*Ks(?:ieg[ai]\s*K|\.?\s*K))|h[ay]\s*kniha\s*k)|(?:II\.?\s*Ks|2\.?\s*Ks)(?:ieg[ai]\s*K|\.?\s*K)|(?:(?:II\.?\s*k|2\.\s*k)|2\s*k)niha\s*k)ronik|Druh[ay]\s*Paralipomenon|D(?:ruh(?:a\s*(?:kniha\s*Kronik|(?:Letopisu|Kronik))|y\s*(?:list\s*Kronik|Letopisu|Kronik))|o(?:(?:vom(?:\s*[Tt]|T)|T)(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|\s*t(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|vomChr))|Se(?:cond(?:(?:\s*C(?:h?oron[io]cles|hr(?:onicles|n)|(?:hrono|ron[io])cles)|[ao]\s*Cronache)|\s*Chronicals)|gund[ao]\s*Cronicas)|Taariikhdii\s*Labaad|(?:(?:(?:Andra\s*Kronikebo|2\.?\s*Kronikebo|II\.?\s*Kronie|2\.?\s*Kronie)|2e\.?\s*Kronie)|Tweede\s*Kronie)ken|Second\s*C(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)|II(?:\.\s*(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?)|Kro(?:n(?:ik)?)?|Taar)|\s*(?:(?:(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?))|Kro(?:n(?:ik)?)?)|Taar))|2\.?\s*Paralipomen(?:on|a)|2nd\.?\s*C(?:h?oron[io]cles|hr(?:onicles|n)|(?:hrono|ron[io])cles)|(?:Paralipomenon|Kronikak)\s*II|2\.?\s*Pa(?:r(?:alipomeno)?)?|2nd\.?\s*C(?:h?oron[io]cle|hronicle|(?:hrono|ron[io])cle|hr(?:on?)?|ron)|(?:II\.?\s*Taariikhdi|2\.?\s*Taariikhdi)i|(?:II(?:\.\s*Ch?o|\s*Ch?o)|2(?:\.\s*Ch?o|\s*Ch?o))ron[io]cles|Zweite(?:[nrs])?\s*Chronik|(?:II(?:\.\s*Ch?o|\s*Ch?o)|2(?:\.\s*Ch?o|\s*Ch?o))ron[io]cle|(?:II\.?\s*Cronicilo|2\.?\s*Cronicilo)r|(?:II\.?\s*Chronic|2\.?\s*Chronic)les|(?:II(?:\.\s*Ch?rono|\s*Ch?rono)|2(?:\.\s*Ch?rono|\s*Ch?rono))cles|(?:II\.?\s*Chronic|2\.?\s*Chronic)le|(?:II(?:\.\s*Ch?rono|\s*Ch?rono)|2(?:\.\s*Ch?rono|\s*Ch?rono))cle|(?:II(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a))|2\.?\s*Cronic(?:le|a))s|2(?:\.o|[ao])\.\s*Cronicas|(?:D(?:ezyem\s*Kw|rug[ai]\s*Kr)|II\.?\s*Kw|2\.?\s*Kw)onik|2(?:\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\.\s*(?:Kro(?:n(?:ika?)?)?|C(?:hr(?:on?)?|ron))|\s*Kro(?:n(?:ika?)?)?|\s*(?:itihas|Aik(?:ak)?|Ljet|C(?:ro?|h)|Ist|Taw)|\s*Chr(?:on?)?|\s*Cron|Taw)|II(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a))|Masodik\s*Kron|(?:II\.?\s*Le|2\.?\s*Le)topisu|(?:II\.?\s*Crona|2\.?\s*Crona)che|2(?:\.o|[ao])\s*Cronicas|2\.?\s*Cronic(?:le|a)|Tweede\s*Kron|2(?:\.\s*(?:Kroni(?:kel|ca)|Chr(?:onik|n))|\s*Kroni(?:kel|ca)|\s*Chr(?:onik|n)|\s*(?:Tawh|HanO|Krn)|tow)|2\.?\s*itihasko|2\.\s*Tawarikh|2\s*k\.\s*Kronik|2\.?\s*Cronic[il]|Druh(?:a\s*(?:Kron|Pa)|y\s*(?:Kron|Pa))|2\.\s*Hroniky|2\s*?Towar[iy]kh|(?:2\s*?Tawa|2\s*?Toa)rikh|2\s*k\s*Kronik|Anden\s*Kron|2\s*Hroniky|2\s*?Towrikh|2\.?\s*Itihas|(?:II\.?\s*Bab|2\.?\s*Bab)ad|2e\.?\s*Kron|2\.?\s*Taar|dovvomt|2Chr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Hanidabaa\s*Odiyaa\s*Koiro\s*Maxaafaa|(?:Cartea\s*intai\s*Paralipomen|Pr(?:va\s*(?:knjiga\s*)?Ljetopis|emye\s*(?:liv\s*Kwonik\s*l|Istw))|Ensimmainen\s*Aikakirj|Tawarikh\s*Yang\s*Pertam|(?:Prv(?:a\s*(?:kniha\s*)?Kronic|y\s*(?:list\s*)?Kronic)|1\s*k\.\s*Kronic|1\s*k\s*Kronic|Elso\s*Kroni|I\.?\s*Kronic)k|Una(?:ng\s*(?:Mga\s*(?:Cronic|Kronik)|Cronic)|\s*(?:Mga\s*(?:Cronic|Kronik)|Cronic))|1(?:\.\s*(?:Mga\s*[CK]roni[ck]|(?:Kronic|Croni)k)|\s*(?:Mga\s*[CK]roni[ck]|(?:Kronick|(?:Cronik|Istw))))|I\.?\s*Mga\s*(?:Cronic|Kronik)|(?:1\.\s*Lj|I\.?\s*Lj)etopis|(?:1\.\s*A|I\.?\s*A)ikakirj|1\s*Ljetopis|1\s*Aikakirj|Kwanza\s*Ny|1\.\s*Istw|I\.?\s*Istw|(?:1\.?\s*N|I\.?\s*N)y)a|(?:Prv(?:a\s*(?:kniha\s*)?P|y\s*(?:list\s*)?P)|First\s*P|1\s*k\.?\s*P|1st\.\s*P|1st\s*P)aralipomenon|Kwanza\s*Mambo\s*ya\s*Nyakati|(?:(?:(?:P(?:ierwsz[aey]\s*Ks(?:ieg[ai]\s*K|\.?\s*K)|rvni\s*kniha\s*k)|(?:1\.?\s*Ks|I\.?\s*Ks)(?:ieg[ai]\s*K|\.?\s*K)|(?:(?:1\.\s*k|I\.?\s*k)|1\s*k)niha\s*k)r|(?:(?:P(?:ierwsz[aey]\s*Kr|remye\s*Kw)|1\.?\s*Kw|I\.?\s*Kw)|Prvni\s*Kr))oni|Fyrri\s*Kronikubo|Erste(?:[nrs])?\s*Chroni)k|Liber\s*I\s*Paralipomenon|(?:Premier(?:e?s|e?)\s*Chroniqu|(?:1(?:ere?|re)\.\s*Chroniq|(?:1(?:ere?|re)\s*Chroniq|(?:1\.?\s*Chroniq|I\.?\s*Chroniq)))u)es|(?:1\.?\s*Ma|I\.?\s*Ma)mbo\s*ya\s*Nyakati|(?:Forsta\s*Kronikebo|(?:(?:Eerste\s*Kronie|1e\.\s*Kronie|1\.?\s*Kronie|I\.?\s*Kronie|1e\s*Kronie)|1\.?\s*Kronikebo))ken|Prvni\s*Paralipomenon|Una(?:ng\s*(?:Paralipomeno|Chronicle|Kronik(?:el|a))|\s*(?:Paralipomeno|Chronicle|Kronik(?:el|a)))|Mambo\s*ya\s*Nyakati\s*I|Taariikhdii\s*Kowaad|Prv(?:a\s*kniha\s*Kronik|y\s*(?:list\s*)?Kronik|ni\s*Letopisu|a\s*Kronik)|(?:Prime(?:ir[ao]\s*Cronica|ro?\s*Cronica)|(?:1(?:\.o|[ao])\.\s*Cronic|(?:1(?:\.o|[ao])\s*Cronic|1\.?\s*Itih))a|(?:1\.?\s*Chronic|I\.?\s*Chronic)al|Chronical)s|First\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|First\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|1\.?\s*Paralipomen(?:on|a)|I(?:\.\s*(?:Paralipomen(?:on|a)|Kronika|Hroniky|Chrn)|\s*(?:(?:(?:(?:Paralipomen(?:on|a)|Taw)|Chrn)|Kronika)|Hroniky))|1st\.\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|1\.?\s*Pa(?:r(?:alipomeno)?)?|I(?:\.\s*(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?)|Kro(?:n(?:ik)?)?|Taar)|\s*(?:(?:(?:Pa(?:r(?:alipomeno)?)?|C(?:ron(?:ic[il])?|hr(?:on?)?))|Kro(?:n(?:ik)?)?)|Taar))|1st\.\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|1st\s*C(?:h(?:(?:oronicles|r(?:onicals|n))|ronicles)|(?:ho?rono|ron[io])cles|oron[io]cles)|itihasko\s*pustak|Paralipomenon\s*I|1st\s*C(?:(?:ho?rono|ron[io])cle|hronicle|oron[io]cle|hr(?:on?)?|ron)|(?:1\.?\s*Cho|I\.?\s*Cho)ronicles|(?:(?:1\.?\s*Cho|I\.?\s*Cho)rono|1(?:\.\s*Ch?rono|\s*Ch?rono)|I(?:\.\s*Ch?rono|\s*Ch?rono)|Chrono)cles|(?:1\.?\s*Taariikhdi|I\.?\s*Taariikhdi)i|Avval(?:\s*[Tt]|[Tt])(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|(?:1(?:(?:\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\s*Kronika)|\.\s*Kronika)v|Prim[ao]\s*Cronach|(?:1\.?\s*Crona|I\.?\s*Crona)ch)e|P(?:aralipomenon|rvni\s*(?:Kron|Pa))|(?:(?:1\.?\s*Cho|I\.?\s*Cho)rono|1(?:\.\s*Ch?rono|\s*Ch?rono)|I(?:\.\s*Ch?rono|\s*Ch?rono)|Chrono)cle|(?:1\.?\s*Cronicilo|I\.?\s*Cronicilo)r|(?:(?:1\.?\s*Chronic|I\.?\s*Chronic)|Chronic)les|(?:1\.?\s*Co|I\.?\s*Co|Ch?o)ron[io]cles|1(?:\s*(?:i\.?\s*Kronika|e\.?\s*Kronika)|\.\s*(?:Kro(?:n(?:ika?)?)?|C(?:hr(?:on?)?|ron))|\s*Kro(?:n(?:ika?)?)?|\s*(?:itihas|Aik(?:ak)?|Ljet|C(?:ro?|h)|Ist|Taw)|\s*Chr(?:on?)?|\s*Cron|Taw)|(?:(?:1\.?\s*Chronic|I\.?\s*Chronic)|Chronic)le|(?:1\.?\s*Co|I\.?\s*Co|Ch?o)ron[io]cle|(?:1\.?\s*Cronic(?:le|a)|I(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a)))s|Yek(?:\s*t(?:(?:(?:owar[iy]|owri)|oari)|awari)kh|t(?:(?:(?:owar[iy]|owri)|oari)|awari)kh)|E(?:erste|lso)\s*Kron|1\.?\s*Cronic(?:le|a)|I(?:\.\s*Cronic(?:le|a)|\s*Cronic(?:le|a))|1(?:\.\s*(?:Kroni(?:kel|ca)|Chr(?:onik|n))|\s*Kroni(?:kel|ca)|\s*Chr(?:onik|n)|\s*(?:Tawh|HanO|Krn)|tow)|(?:1\.?\s*Le|I\.?\s*Le)topisu|1\s*k\.\s*Kronik|1\.\s*Tawarikh|I\.?\s*Kronikel|1\.?\s*itihasko|1\.?\s*Cronic[il]|1\.\s*Hroniky|1\s*k\s*Kronik|1\s*?Towar[iy]kh|(?:1\s*?Tawa|1\s*?Toa)rikh|Kronikak\s*I|1\s*Hroniky|Cron[io]cles|1\s*?Towrikh|1e\.\s*Kron|Cron[io]cle|AvvalChr|(?:1\.?\s*Bab|I\.?\s*Bab)ad|1\.?\s*Taar|1e\s*Kron|avvalt|1Chr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ezra\s*[ah]|(?:(?:K(?:s(?:ieg[ai]\s*Ezdrasz|\.?\s*Ezdrasz)|njiga\s*Ezrin)|E(?:sran\s*kirj|zdrasz)|Cesra|edzr|Aejr)a|Li(?:v\s*Esdras\s*la|ber\s*Esdrae)|E(?:s(?:ra(?:s\s*)?bok|dra[es])|z(?:ra(?:s\s*Bog|[ah])|sdras)|d)|E(?:z(?:d(?:r(?:as?)?)?|ra?|sd)|s(?:d(?:ra?)?|r(?:a(?:n|s)?)?))|Iz(?:ra(?:\s*[ah]|[ah])|ira)|Cesr?|Iz(?:ir|ra)|ezr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ruth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:K(?:itabu\s*cha\s*Ruth[iu]|njiga\s*o\s*Ruti|s(?:ieg[ai]\s*Ruthy|\.?\s*Ruthy))|Ruutin\s*kirja|Ks(?:ieg[ai]\s*Rut|\.?\s*Rut)|Li(?:ber\s*Ruth|v\s*Rit\s*la)|R(?:u(?:t(?:h(?:s\s*Bog|[iu])|arbok|s\s*bok|[ei])|ud)|oot[eh]|th|it)|R(?:u(?:ut(?:in)?|t(?:a|h|s)?)?|oot|t)|Uruto|Uru))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Neh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:nahemyahko\s*pustak|K(?:s(?:ieg[ai]\s*Nehemiasz|\.?\s*Nehemiasz)|njiga\s*Nehemijin)a|N(?:e(?:h(?:e(?:mi(?:a(?:n\s*kirj|h?-?y|sz)|j)|em[iy])|imy|my)|emij)|ahimiya|ehemei|ihemi)a|Li(?:ber\s*Nehemiae|v\s*Neyemi\s*an)|N(?:e(?:h(?:em(?:i(?:a(?:s’\s*Bog|e)|[eh])|yah)|amiah|em(?:ii|a[ai])h|im(?:(?:a[ai]|a)h|i(?:a?|i)h)|emah)|emias|yemi)|eh(?:emia[ai]|em(?:ii|a[ai])[ai]|im(?:a[ai][ai]|i(?:a[ai]|i[ai])))h|exemyaah|ehem-?yah|ahemyah)|Nehem(?:jas\s*|ia)bok|nahemya(?:hko)?|N(?:e(?:h(?:em(?:ia(?:h|n|s)?|jas?|ya)|amia|imia|m)?|em(?:ia?)?|x)?|ahi)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["GkEsth"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Est(?:er\s*enligt\s*den\s*grekiska\s*texte|Yu)n|Es(?:zter\s*konyvenek\s*kiegeszitese|t(?:er\s*(?:\((?:versione\s*greca|(?:(?:(?:Gr(?:(?:ie(?:chisch|ks)|eg[ao])|iego)|Gri?yego|gr(?:ieg|ec)o)|Gr)|grega))\)|recke\s*dodatky|Gri?yego|Gr(?:iego|(?:eg[ao]|ik))|gr(?:ieg|ec)o)|er\s*recke\s*casti|(?:her\s*\((?:Gre(?:ek|c)|grec)|\s*\(Gr)\)|er\s*Yunani|her\s*[Gg]rec|\.\s*Yunani|\s*Yunani|g))|Kr(?:eikkalainen\s*Esterin\s*kirja|\.?\s*Est)|G(?:r(?:(?:e(?:cke\s*casti\s*knihy\s*Est|ek\s*Esth)|aeca\s*Esth)er|\s*Esth)|k\s*?Esth)|Den\s*greske\s*Ester-?bok(?:en|a)|Kreikkalainen\s*Esterin|Est(?:er(?:arbok\s*hin\s*grisk|\s*greg)|her\s*graec)a|G(?:r(?:eek\s*Esth?|\s*Est)|k\s*Est)|Est(?:her\s*[Gg]r|er\s*[Gg]r|\s*Yun)|Est(?:h\s*[Gg]|\s*[Gg])r|GrEst))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Esth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:est(?:arko\s*pustak|erh)|Ks(?:ieg[ai]\s*Estery|\.?\s*Estery)|Esterin\s*kirja|Li(?:ber\s*Esther|v\s*Este\s*a)|E(?:st(?:er(?:s\s*Bog|ei|y)|a?r|hr)|t)|Ester(?:ar|s\s*)bok|Es(?:t(?:e(?:r(?:in|a|s)?)?|a|h)?|zt)?|est(?:arko|er)|Asttiro|(?:Es(?:t(?:e[eh]|he)|zte)|asta)r|Aester|Ast|ast))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Job"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:K(?:itabu\s*cha\s*(?:Ayu|Yo)bu|njiga\s*o\s*Jobu)|ayyubko\s*pustak|(?:K(?:s(?:ieg[ai]\s*(?:(?:Hi|J)|Ij)ob|\.\s*(?:(?:Hi|J)|Ij)ob|\s*(?:(?:Hi|J)|Ij)ob)|niha\s*Jobov|\.\s*Jobov|\s*Jobov)|Jobin\s*kirj|Iyyoob)a|Li(?:v\s*Job\s*la|ber\s*Iob)|J(?:o(?:b(?:s\s*Bog|a)|v)|b)|Jobs\s*?bok|ayyubko|G(?:iobbe|b)|(?:A(?:y(?:y(?:o[ou]|u)|[ou]u)|iu)|Iyou|Aiou|E(?:yy?|io)u)b|(?:Aiyo|Eiyo|Ij|iy)ob|Job(?:in?|s)?|Ay(?:obe|b)|Hiob[ai]|Ayubu|Hi(?:ob)?|Ayub|I(?:yob|o[bv])|Yobu|Ayu?|Yob))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mal"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Mal'aaki|(?:Pro(?:roctwo\s*Malachyaszow|phetia\s*Malachia)e|Ks(?:ieg[ai]\s*Malachiasza|\.?\s*Malachiasza)|(?:M(?:ala(?:kian\s*kirj|chiasz|hij)|ikiyaas)|Liv\s*Malachi\s*|mal['’])a|M(?:a(?:l(?:(?:a(?:k(?:i(?:as’\s*Bog|s\s*bok|[ei])|e[ey])|quias|c(?:hie|i))|eaki|ch)|aaki[ei])|alaki[ei])|l)|Ma(?:l(?:(?:a(?:c(?:h(?:i(?:as?)?)?)?|ki(?:a(?:n|s)?)?|qu)?|c)?|aaki)|alaki)|Ma(?:-?la-?(?:ch|k)|leak?h|l(?:ea|i)ch)i|M(?:(?:al’a|el)|il)aki|malaki))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t))|of\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t))|of\s*(?:S(?:aint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|t(?:\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)))|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?)|of\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?))|(?:(?:(?:Mabuting\s*Balita\s*ayon\s*kay\s*S|S(?:ulat\s*ni\s*S)?)an|Mabuting\s*Balita\s*ayon\s*kay)\s*Ma|E(?:(?:(?:banghelyo\s*(?:ayon\s*kay|ni\s*San)|banghelyo\s*ni)|vangelio\s*de)|l\s*Evangelio\s*de)\s*Ma)teo|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?)|of\s*(?:S(?:aint\s*Matt?|t(?:\.\s*Matt?|\s*Matt?))|Matt?))|Evan(?:gelium\s*secundum\s*Matthaeum|keliumi\s*Matteuksen\s*mukaan)|Das\s*Evangelium\s*nach\s*Matthae?us|(?:E(?:w(?:angelia\s*(?:wg\s*sw\.?\s*Mateusz|Mateusz)|\.?\s*Mateusz)|vanjelium\s*Podla\s*Matus)|Ma(?:atiyoos|t['’]thiy))a|(?:Evangelie(?:\s*volgens|t\s*etter)\s*Matte|Injil\s*Mati|Mati)us|Evangelium\s*nach\s*Matthae?us|(?:Evangelium\s*podle\s*Matous|matt(?:ayan|il)|M(?:at(?:th?w|['’]te|y)|etti))e|Jevanhelije\s*vid\s*Matvija|M(?:a(?:t(?:teuksen\s*evankelium|['’]y)i|t(?:t(?:h(?:ie[uw]|e(?:ei|[aiw])|y)|i(?:ew|i)|e[eowy]|y)|eusza|a(?:yos|i)|usa|['’]t[iy]|e[ijo]|hy)|at(?:ha|t)i)|aattey|itt(?:hy|i)|etty|t[ht])|Vangelo\s*di\s*(?:San\s*)?Matteo|Mat(?:ousovo\s*e|(?:thae?use|tei\s*e))vangelium|Matteusevangeliet|Ungjilli\s*i\s*Mateut|(?:Injili\s*ya\s*)?Mathayo|Saint\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|St\.\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|St\s*M(?:at(?:t(?:h[ht]|th)i?ew|h(?:[ht](?:[ht]i?ew|i?ew)|i?ew)|t(?:h?|t)iew|th?we|t(?:h?|t)ew)|t)|M(?:at(?:t(?:eu(?:ksen|s)|h(?:ae?us|ee|i)?|ie?)?|eusz|['’]thi|e(?:us?)?|ayo|ous|hi?|us)?|t)|Saint\s*Matt?|Matt(?:h[ht]|th)i?ew|Math[ht](?:[ht]i?ew|i?ew)|St\.\s*Matt?|Matttiew|Mattheus|St\s*Matt?|Mat(?:hi?e|tte)w|Ew\s*Mat))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ps"],
        testament: "oa",
        testament_books: { "Ps": "oa" },
        regexp: /(?:^|(?<=[^\p{L}]))((?:Li(?:b(?:ri\s*i\s*Psalmeve|er\s*Psalmorum)|v\s*Som\s*yo)|Cartea\s*Psalmilor|K(?:s(?:ieg[ai]\s*Psalmow|\.?\s*Psalmow)|niha\s*zalm(?:ov|u)|\.?\s*zalmov)|Psalmien\s*kirja|S(?:alm(?:e(?:rnes\s*Bog|nes\s*bok)|os|au|[is])|lm)|stotrasamhita|Sabuurradii|M(?:azamoorah|izam(?:oora|ire)h|(?:az(?:m(?:oor[ae]|ura)|am(?:ir[ae]|ura))|ezmoora|ezamire)h|az(?:am[ou]re|\s*mor|more|mure))|Zsoltarok|Psaltaren|Mga\s*Salmo|Maza?moure|(?:Salmarni|M(?:azamoo’|iz(?:am(?:oo’|i[h’]|u)|mu)|az(?:\s*moo|am(?:i['h’]|u['hou’])|mu['hou’])|ez(?:m(?:oo’|u)|amu)|ezami[h’])|Zalta|Masmu|Jabu)r|P(?:s(?:a(?:l(?:m(?:i(?:en)?|a|e)?)?|ml?|u)?|ala|m(?:al?)?|l[am])?|l(?:a(?:sm?|m)|s(?:ss?|a)))|S(?:a(?:l(?:m(?:e(?:nes?|rne)?|o)?)?|buur)|l)|M(?:az(?:amoor|(?:moor|am(?:[io]|u)r|mor|mur)?)|izamoor)|(?:Mga\s*)?Awit|(?:(?:M[ei]z\s*m|Mizm)|zab)oor|P(?:s(?:a(?:(?:l(?:m(?:a[su]|e[nt]|i[it]|u[ls]|[sy])|s)|m(?:l[as]|s)|aa)|las)|m(?:als|m)|lm[ms])|la(?:sm?s|ms)|(?:s(?:a(?:ma|am)|lma)|l(?:ama|m))s|a(?:s(?:(?:ml|s)|m)s|(?:l[lm]|m[ls])s))|P(?:s(?:a(?:(?:lm[lm]|ml?m|ume)|lam)|m(?:alm|l)|lam)|l(?:a(?:sm)?a|s(?:sss|a?m))|s(?:a[al]l|lal)m|a(?:ls|sl)m)s|P(?:s(?:a(?:(?:lm[lm]|ml?m|ume)|lam)|m(?:alm|l)|lam)|l(?:a(?:sm)?a|s(?:sss|a?m))|s(?:a[al]l|lal)m|a(?:ls|sl)m)|Z(?:a(?:buri|lmy)|l)|Z(?:a(?:b(?:ur)?|lm)|solt)?|Bhjan|Pssm|(?:maz|So|Mz)m|Pss|Thi))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eccl"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:K(?:s(?:ieg[ai]\s*(?:K(?:aznodziei\s*Salomon|ohelet)|Eklezjastes)|\.\s*(?:K(?:aznodziei\s*Salomon|ohelet)|Eklezjastes)|\s*(?:K(?:aznodziei\s*Salomon|ohelet)|Eklezjastes))|niha\s*kazatelov|\.\s*kazatelov|\s*kazatelov)|Saarnaajan\s*kirj|Eranchcha)a|Eklezyas\s*-?\s*Liv\s*Filozof\s*la|K(?:a(?:znodziei\s*Salomonowego|alam)|oheleth)|Li(?:ber\s*(?:Ecclesiastes|Qoelet)|v\s*Filozof\s*la)|(?:K(?:ohelet\s*—\s*K)?azate|Ec(?:clesiastu|le[sz]iastu))l|upadesakko\s*pustak|(?:Pr(?:(?:edikantens\s*bo|opovjedni)|edikarens\s*bo)|Forkynnerens\s*bo)k|A(?:ng\s*Mangangaral|lkhatib)|Ec(?:clesi(?:astic|(?:aa)?t)|lesiastic)es|Eccles(?:ia?ia|aia)stes|Ec(?:cless[ai][ai]s?te|(?:(?:clesiast|cles(?:ait|i[ai]t))|cles[ai]ist)e|clesaas?te|les(?:s[ai][ai]s?te|ias?te|iis?te|a[ai]s?te))s|P(?:r(?:e(?:dik(?:ar(?:boke|in)n|erens)|di(?:kato|ge)r|gethwr)|ad)|khb)|Sabhopadeshak|Ecc?lesiasties|Ec(?:cles(?:i(?:a[ai]s|s)|as)|lesis)tes|E(?:cl(?:es(?:iai|y)|is[iy])|kl(?:e(?:zi|s[iy])|is[iy]))astes|Ec(?:cless[ai][ai]s?te|(?:(?:clesiast|cles(?:ait|i[ai]t))|cles[ai]ist)e|clesaas?te|les(?:s[ai][ai]s?te|ias?te|iis?te|a[ai]s?te))|Ekklesiastes|Fork(?:ynneren)?|Pengkhotbah|J(?:uru\s*Kotbah|am(?:(?:(?:\s*ae|[3a]a)h|(?:a['’]|['’])a[ht])|aih))|Mangangaral|Ekklezijast|E(?:c(?:c(?:l(?:es(?:iast)?)?)?|l(?:e(?:ziast|s))?)?|kl(?:ezyas)?|ra)|P(?:r(?:e(?:d(?:iker(?:en)?)?|g)|op)|engkh|kh)|Predikaren|Saar(?:n(?:aajan?)?)?|upadesak(?:ko)?|(?:Predikues|M(?:agwawal|hubir))i|Wacdiyah(?:ii|a)|Qoheleth|K(?:oh(?:elet)?|azn?)|Qohelet|Filozof|Jam(?:\s*ae|(?:a['’]|['’])a|[3a]a)|Qoelet|Coelet|M(?:anga|hu)|Pkhth|Qoh?|Wac))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Prophetia\s*Ezechielis|Hesekielin\s*kirja|(?:Ks(?:ieg[ai]\s*Ezechie|\.?\s*Ezechie)|Hizqqee)la|Liv\s*Ezekyel\s*la|E(?:(?:z(?:e(?:kiel(?:s’?\s*Bog|i)|chiel[ae])|[kq])|sk)|sekiels\s*bok)|H(?:esekiels\s*bok|iz(?:(?:kiya[ei]|kiya)lh|q(?:iy(?:a(?:(?:lha|[aei]lh)|hl)|['’]al)|eyal)))|H(?:es(?:ek(?:iel(?:in)?)?)?|iz(?:kiya[ei]l|qiya(?:lh?|[aei]l)|kiyal)?)|(?:Hizq(?:iy(?:a(?:ha|['’])|['’]aa)|eya[ei])|E(?:ze(?:qu(?:i[ae]|e)|k(?:ia|e))|z(?:e[ei]qu|i(?:(?:[ei])?qu|(?:[ei])?k)|e[ei]k)e|x[ei](?:[ei])?ke))l|Jezekiil['’]|(?:E(?:z(?:e[ei]qu|i(?:(?:[ei])?qu|(?:[ei])?k)|e[ei]k)i|x[ei](?:[ei])?ki|se(?:ci|ky)|ze(?:ci|ky))|Yexesqe|Yehe[sz]ki|Hezechi|Iezechi)el|Yahejakel|yahedzkel|E(?:ze(?:c(?:h(?:iel)?)?|k(?:iel)?|qu?)?|se(?:k(?:iel)?|c))|hazq|Ye[hx]|Yez))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(Hosha-?i-?ya|(?:Ks(?:ieg[ai]\s*Ozeasza|\.?\s*Ozeasza)|Prophetia\s*Osee|(?:H(?:oosean\s*kirj|(?:o(?:ziyah-?h|os(?:heec|e7)|seya-?h|s’iya)|os(?:ha-?y|ee)-?y|u(?:sha-?[iy]-?y|zi)|os(?:ia-?|a)y))|Liv\s*Oze\s*|hushaiy|O(?:zeasz|sij))a|H(?:(?:o(?:s(?:eas(?:’\s*Bog|\s*bok)|h(?:a-?i|ia|[ou]))|z(?:ia(?:(?:h-?ha)?|-?y)a|eas))|o(?:shae|zai)ah|o(?:shiy|zai?y)ah|u(?:s(?:h(?:i(?:a-?y|yah)|a’y|(?:ae|ea)h)|aiyah)|zayah)|o(?:s(?:[eh]|i)a’|zia’)y|osheah|osiyah|s)|oseia[hs])|H(?:(?:o(?:(?:(?:(?:zi(?:a(?:h-?ha|-?y|h)?|yah?)|os(?:ean|h)?|s(?:eas?|hae?)?|seya)?|she)|shea)|siya)|ush(?:a(?:-?i)?|i(?:ya|a)?|ae|ea|e))|oseia)|h(?:os(?:h['’]ai|ey)|u(?:shaia|z(?:aiy|ia[ah])))|h(?:os(?:h(?:['’]a)?|e)|uz(?:ai|ia))|Ose(?:ia[hs]|a[hs]|e)|O(?:s(?:ei?a)?|z(?:e(?:as)?)?)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Obad"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Pro(?:roctwo\s*Abdyaszow|phetia\s*Abdia)e|(?:Ks(?:ieg[ai]\s*Abdiasz|\.?\s*Abdiasz)|O(?:ba(?:d(?:(?:jan\s*kir|i)j|ei)|j)|uba-?dy|obad[iy])|obad-?(?:ya-?h|iy)|Abdiasz|Obad-?iy|O(?:ube|va)di|Ubedi)a|Liv\s*Abdyas\s*la|O(?:b(?:ad(?:ia(?:s['’]\s*Bog|h)|jas\s*bok|iyah|yah)|edias|d)|uba-?dia|vdij)|ob(?:ad-?ya-?ye|d)|O(?:uba(?:-?di|d)y|bad-?y)ah|U(?:bad(?:(?:-?iy(?:a-?i|eh)|i(?:yeh|a))|iyah)|bad-?diyah|ubadiyah|bad-?yah)|obad-?ya(?:-?y)?|O(?:uba(?:-?di|d)y|bad-?y)a|U(?:(?:bad-?diy|(?:bad-?iy|bad-?y))|ubadiy)a|Obadi?ya’i|(?:Cobadyaa|O(?:ubadi|bade)ye|Obadiye|Ob(?:adh|id)a)h|O(?:ubadi|bade)yah|O(?:ubadi|bade)ya|Abd(?:diyyu|(?:ij|y)as)|obadiyah|O(?:b(?:a(?:d(?:j(?:a(?:n|s)?)?|ias?|iya|ya)?)?|edia)?|uba-?di)|obadiya|Ab(?:d(?:i(?:as?)?)?)?|Cob(?:ad)?|Avdie))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hag"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Haggi-?i|(?:Pro(?:roctwo\s*Aggieuszowe|phetia\s*Aggaei)|Ks(?:ieg[ai]\s*Aggeusza|\.?\s*Aggeusza)|(?:Ha(?:g(?:g(?:ai(?:n\s*kirj|y)|iy)|(?:gay-?|’)y)|g(?:gai)?-?y|jjay-?y)|Liv\s*Aje\s*|Aggeusz)a|H(?:a(?:g(?:g(?:a(?:i(?:s\s*bok|i)|js\s*Bog)|ia[hi]|e(?:us|o)|y)|ya|a[ijy]|e[jo]|i)|g(?:gai)?-?i|j(?:ja(?:y-?)?i|iya[hy]))|gg)|(?:Ha(?:ggai’|jji)|Xagga)y|H(?:a(?:g(?:g(?:a(?:in?|j|y)?|i)?|y)?|jjay)|g)|Ag(?:gaeus|(?:ge[eo]|e(?:us|[jo])|heu))|(?:Ha(?:(?:gga|j)|-?g)a|A-?ga)i|Ag(?:g(?:eus)?|eu)?|haggay|Xagg?|Ohij|Aje))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hab"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Pro(?:roctwo\s*Abakukowe|phetia\s*Habacuc)|(?:Habakukin\s*kirj|Ks(?:ieg[ai]\s*Habakuk|\.?\s*Habakuk)|I(?:rmbbaaqoom|mb))a|Hab(?:a(?:k(?:ku(?:k(?:s\s*Bog|k)|c)|u(?:k[aku]|c))|cuc)|bak(?:k(?:akk|u(?:kk|c))|akk|u(?:kk|c))|akk?akk|[ck])|(?:H(?:ab(?:a(?:k(?:k(?:uks\s*b|o)|o)|co)o|ba[ck]oo)|b)|Abaki)k|Liv\s*Abakik\s*la|Hab(?:a(?:k(?:uk(?:in?)?|kuk)?|c)|bak(?:k[au]k|[au]k)|akk?ak)?|Habacuque|Xabaquuq|(?:Haback|Abako)uk|haba(?:kk?uk|q)|Hab(?:bac[au]|aca)c|(?:Habac|Aba)cuc|A(?:b(?:akuka|k)|va[ck]um)|Habaquq|Abak(?:uk)?|Xab))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mic"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Prophetia\s*Michaeae|Ks(?:ieg[ai]\s*Micheasza|\.?\s*Micheasza)|(?:M(?:i(?:ikan\s*kirj|lkkiyaas|cheasz|hei|kh|-?c)|eek)|Liv\s*Miche\s*|mik)a|M(?:i(?:k(?:as\s*(?:Bog|bok)|eas)|(?:chae|k(?:ey|ie))as|quei?as|chaas|c(?:h(?:ah|ee)|as)|hej)|(?:i(?:kah|ika)a|k)h|ikaaha|icaha|y(?:kaha|cah|hej)|q)|M(?:i(?:(?:(?:c(?:h(?:e(?:as?)?|a)?|a)?|ik(?:an?)?|k(?:a(?:h|s)?|ea)?|lk|h|q)|cah)|kaah)|ykah)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zech"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Prophetia\s*Zachariae|Ks(?:ieg[ai]\s*Zachariasza|\.?\s*Zachariasza)|(?:S(?:a(?:karjan\s*ki|cha)rj|echarei)|Z(?:a(?:(?:k(?:kaariyaas|ariyy)|chariasz)|khariy)|ekariy)|Liv\s*Zakari\s*|Xa-?cha-?ri-?|Zakaraiy|Zaccari|jakariy)a|Z(?:a(?:(?:(?:kari(?:a(?:s['’]\s*Bog|h)|ya)|chari(?:ah|[eh])|harij?a)|charah)|cher[ai]h)|(?:akaraya|acheria|c)h|akhariah|e(?:ch[ae]riah|ch[ae]r[ai]h|kariah))|Sa(?:kar(?:ja(?:boken|s\s*bok)|ias)|carias)|Xa(?:-?cha-?ri)?|Z(?:a(?:c(?:h(?:arias?)?|ch?|ar)?|k(?:ari(?:as?)?|k)?|h(?:arij)?)?|akaraya|acheria|akharia|e(?:c(?:h[ae]ria|h?)|k(?:aria)?)|c)|Zac(?:harj|ari)as|Z(?:ach(?:ar(?:ii|a[ai])|er(?:a[ai]|ii))|ech[ae]r(?:a[ai]|ii))h|(?:Zekhari|Sekarya)ah|Zaccharie|S(?:a(?:k(?:ar(?:jan?|ia))?|ch)|e(?:ch|k))|Jakaryah))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zeph"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Pro(?:roctwo\s*Sofoniaszow|phetia\s*Sophonia)e|Ks(?:ieg[ai]\s*Sofoniasza|\.?\s*Sofoniasza)|(?:S(?:efan(?:jan\s*kir|i)j|ofon(?:iasz|aas))|Ze(?:phan(?:ay|j)|f(?:an(?:ay|[jy])|iny))|Seffanei|Dhof(?:-?ni|eny|in[iy])|(?:Z[eo]f-?|Tefa)ni|Z[eo]feny|Zofin[iy])a|Sefanias['’]\s*Bog|Z(?:e(?:(?:fania(?:s’\s*Bog|h)|phania[hs])|panias)|ofonias)|Liv\s*Sofoni\s*an|S(?:e(?:fanjas\s*bok|p(?:anias|h))|o(?:foni(?:j[ae]|e)|phonie)|f)|Z(?:ephanai|a(?:ph|f)ani)ah|Dhof(?:eniyah|ania)|(?:Dhofaniy|Sefanya|Zefaniy|Zofaniy)ah|Z(?:ephanai|a(?:ph|f)ani)a|Dhofeniya|Sophonias|Sz(?:ofo|efa)nias|Z[eo]feniyah|S(?:e(?:f(?:an(?:ias?|jan?)|f)?|pania)|o(?:f(?:o(?:ni(?:as?)?)?)?|ph)|zof)|Ze(?:f(?:anias?)?|p(?:h(?:an(?:ia)?)?)?)|Z[eo]feniya|Sofonjas|Sapanyah|sapanyah|Zofania|Tef|zof|Zph|Zp))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Luke"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k))|of\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k)))|Mabuting\s*Balita\s*ayon\s*kay\s*(?:San\s*Lu[ck]as|Lu[ck]as)|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?)|of\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k))|of\s*(?:S(?:aint\s*L(?:uke|k)|t(?:\.\s*L(?:uke|k)|\s*L(?:uke|k)))|L(?:uke|k)))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?)|of\s*(?:S(?:aint\s*Luk?|t(?:\.\s*Luk?|\s*Luk?))|Luk?))|Ebanghelyo\s*ayon\s*kay\s*(?:San\s*Lu[ck]as|Lu[ck]as)|Evan(?:keliumi\s*Luukkaan\s*mukaan|gelium\s*(?:secundum\s*Lucam|podle\s*Lukase)|jelium\s*Podla\s*Lukasa)|(?:Das\s*Evangelium\s*nach\s*Luk|Evangeliet\s*etter\s*Luk|E(?:l\s*E)?vangelio\s*de\s*Luc|Evangelium\s*nach\s*Luk|S(?:ulat\s*ni\s*S)?an\s*Luc|Injil\s*Luk)as|Evangelie\s*volgens\s*Lu[ck]as|Ebanghelyo\s*ni\s*San\s*Lu[ck]as|L(?:u(?:ukkaan\s*evankeliumi|k(?:a(?:s(?:evangeliet|a)|ah)|e)|qa(?:at|h)|cas)|o(?:oqa(?:at|h)|[kq]aa[ht])|ik|[ck])|Jevanhelije\s*vid\s*Luky|Lukas(?:ovo\s*|\s*?)evangelium|(?:Vangelo\s*di\s*(?:San\s*)?Luc|Injili\s*ya\s*Luk|L(?:uqaas|luk|ook)|Lu-?c)a|(?:Ungjilli\s*i\s*Luke|Lu(?:kac|uko))s|Saint\s*L(?:uke|k)|Saint\s*Luk?|L(?:u(?:uk(?:kaan)?|k(?:as?)?|q(?:aa?)?|ca?)?|o(?:oqaa?|[kq]a)|lu)?|St\.\s*L(?:uke|k)|St\.\s*Luk?|St\s*L(?:uke|k)|St\s*Luk?|luka[ln]e))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jer"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:A(?:klat\s*ni\s*Jeremia[hs]|[ae]rmii[ay]ah|rm(?:iiyah|eya[ah]))|Ks(?:ieg[ai]\s*Jeremiasza|\.?\s*Jeremiasza)|Sulat\s*ni\s*Jeremias|y(?:armiyako\s*pustak|irmiiyaah)|(?:Irmeiyaah-?ha-?h|(?:Yirmei|yirmiy)aah-?ha-?h|Jeremi(?:a(?:n\s*kirj|sz)|j)|A(?:rmi(?:aah-?ha-?h|ya)|[ae]rmiya)|(?:Ermeyiah-?|Irm['’]yaa)h|(?:Jereme|Gerem)i|Ermmaas|Yere?mi|yirmay)a|Li(?:ber\s*Ieremiae|v\s*Jeremi\s*an)|J(?:er(?:em(?:i(?:a(?:s['’]\s*Bog|h)|e)|ah)|amah|imih)|r)|Irmeiyaah(?:-?ha)?|(?:Yirmei|yirmiy)aah(?:-?ha)?|Jeremias\s*bok|Armiaah(?:-?ha)?|y(?:irmi(?:iyaa?|y)|armiyako)|Erm(?:e(?:yiah|i)a|ii?yah)|(?:Yrm['’]yaah|Erm['’]yaah|Jer[ae]mih)a|(?:Yrmi(?:iya|y)a|Jeramia|Ermiyaa|Ermeya[ah]|Yrmeya[ah]|Irm(?:eya[ah]|iaa)|[EY]rmiaa)h|(?:Jer(?:emaia|(?:emii|am[ai]i|im(?:i[ai]|a)))|Erm(?:iiy|eyi)aa|Irmi(?:yaa|a['’])|[EY]rmia['’])h|(?:Yeremya|Yrmeiy|Erm(?:eiy|['’]i)|Yirmay|Jer(?:ai|m[im])|Yrm['’]i|Irm['’]i)ah|Je(?:r(?:e(?:m(?:i(?:a(?:n|s)?)?)?)?)?)?|Yrm['’]yaah|Erm['’]yaah|Yrmi(?:iya|y)a|Yrmiiyah|Jeremaih|I(?:eremias|rm(?:ei(?:yah|a)|i(?:aha|yah)))|Irmiiya[ah]|(?:Jeremj|H[ei]r[ei]m[iy])as|Yrm['’]yaa?|Erm(?:['’]yaa?|iya)?|Jer[ae]mih|I(?:er(?:emia)?|rm(?:i(?:ah?|ya)|eya|['’]ya))|Jeramia|Ermiyaa|Ermeya[ah]|Yrmeya[ah]|Irm(?:eya[ah]|iaa)|[EY]rmiaha|[EY]rmiah?|Ermeya|Yrmeya|[EY]rmiaa|Yrmeia|Ger|Ye?r|Gr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:D(?:(?:(?:ru(?:he\s*poslannja\s*apostola\s*Pavla\s*do\s*korynfj|g[ai]\s*Korynti)|rug[ai]\s*list\s*do\s*Korynti)a|o(?:(?:(?:vom)?\s*|(?:vom)?)Qorint(?:h(?:iy?a|yu)|iy?a|yu)|(?:(?:vom)?\s*|(?:vom)?)Korinth?ia))n|ru(?:h(?:a\s*(?:kniha\s*)?Korint(?:ano|sky)m|a\s*list\s*Korint?skym|y(?:\s*(?:list\s*Korin(?:t(?:ano|sky)m|skym)|Korint(?:ano|sky)m)|K)|aK)|g[ai]\s*Koryntow)|ezyem\s*Korentyen)|(?:Pavlova\s*druga\s*poslanica\s*Korincanim|(?:Druga\s*Korinc|(?:II\.?\s*Korinc|2\.?\s*Korinc))anima\s*Poslanic|Druga\s*poslanica\s*Korincanim)a|(?:Paulus(?:'\s*Andet\s*Brev\s*til\s*Korinth|’\s*(?:Andet\s*Brev\s*til\s*Korinth|andre\s*brev\s*til\s*korint))ern|(?:II\.?\s*Korintt|2\.?\s*Korintt)olaiskirj|And(?:re\s*Korinti|en\s*Korint)ern|2(?:\s*(?:[ei](?:\.\s*Korin?t|\s*Korin?t)|Korit)asv|\.\s*Kori(?:nt(?:i?ern|asv)|tasv)|\s*Korinti?ern|\s*Korintasv))e|T(?:oinen\s*K(?:irje\s*korinttilaisill|orintt(?:olaiskirj|ilaisill))e|weede\s*(?:Korint(?:h?iers|he)|Corint(?:h?iers|he)))|(?:Waraka\s*wa\s*Pili\s*kwa\s*Wakorinth|Ika-?\s*2\s*Sulat\s*sa\s*mga\s*Corinti|SECOND\s*Sulat\s*sa\s*mga\s*Corinti|I(?:kalawang\s*Mga\s*Taga-?\s*Corint|I\.?\s*Mga\s*Taga-?\s*Corint)|(?:2(?:\.\s*(?:Mga\s*Taga-?\s*|Taga-?)|\s*(?:Mga\s*Taga-?\s*|Taga-?))C|2\.?\s*Mga\s*Taga-?C)orint|Ikalawang\s*[CK]orinti|(?:Pili\s*W|II\.?\s*W|2\.?\s*W)akorinth)o|Waraka\s*wa\s*Pili\s*kwa\s*Wakorinto|Barua\s*ya\s*Pili\s*kwa\s*Wakorintho|Ika-?\s*2\s*Sulat\s*sa\s*mga\s*Corinto|S(?:ECOND\s*Sulat\s*sa\s*mga\s*Corinto|econd\s*Corinthia?ns)|(?:II\.?\s*Ki|2\.?\s*Ki)rje\s*korinttilaisille|(?:Second(?:(?:a\s*lettera\s*ai|o)|a)\s*Corinz|II(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:ti?en|z))|2(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:(?:tien|z)|ten)))i|Epistula\s*(?:II\s*ad\s*Corinthios|ad\s*Corinthios\s*II)|Masodik\s*Korint(?:husiakhoz|usi)|And(?:r(?:a\s*Korint(?:h?i|h?)erbrevet|e\s*korinterbrev)|(?:e[nt]\s*Korinth|en\s*Korint)erbrev)|Naa77antto\s*Qoronttoosa|(?:(?:(?:(?:II\.?\s*list\s*d|2\.?\s*list\s*d)o\s*Kory|(?:II\.?\s*Kory|2\.?\s*Kory))nti|2Korinth?i)a|2(?:\.\s*Kurinthiayo|\s*K(?:urinthiayo|orinth?ia))|2\s*Qorint(?:h(?:iy?a|yu)|iy?a|yu)|2Qorint(?:h(?:iy?a|yu)|iy?a|yu))n|(?:(?:Deuxiemes?\s*Corinthie|2(?:eme\.|de?\.)\s*Corinthie|II(?:\.\s*Corint(?:hia|i)a|\s*Corint(?:hia|i)a)|2(?:eme\s*|de?\s*)Corinthie|(?:II\.?\s*Corini|2\.\s*Corini)thia|(?:II\.?\s*Corii|2\.?\s*Corii)nthia|(?:(?:(?:II\.?\s*Corini|2\.\s*Corini)|2\s*Corini)t|(?:II\.?\s*Corit|2\.?\s*Corit))hai|(?:II\.?\s*Corn|2\.?\s*Corn)(?:inthai|thia)|(?:(?:II\.?\s*Corintha|2\.?\s*Corintha)|(?:II\.?\s*Corn|2\.?\s*Corn)itha)ia|(?:(?:II\.?\s*Corr|2\.?\s*Corr)in?tha|(?:II\.?\s*Corn|2\.?\s*Corn)tha)i|2\.\s*Corint(?:hia|i)a|(?:II\.?\s*Corintho|2\.?\s*Corintho)a|2\s*Corint(?:hia|i)a|2\s*Corinithia|(?:II\.?\s*Corit|2\.?\s*Corit)hia)n|Second\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)an|or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)n|orin[an]thian|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)n|or(?:in|ni)thain|oranthian)|2nd\.?\s*C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)an|or(?:i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|(?:or(?:i(?:(?:n(?:(?:t(?:hi(?:a[ai]|o)|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i)n|orin[an]thian|hor(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)n|or(?:in|ni)thain|oranthian)|(?:(?:II\.?\s*Corii|2\.?\s*Corii)nthii|II\.?\s*Corinthii|Do(?:(?:vom)?\s*|(?:vom)?)Corinti|(?:II\.?\s*Corintho|2\.?\s*Corintho)i|(?:II\.?\s*Corn|2\.?\s*Corn)(?:in?thi|thii)|(?:II\.?\s*Corr|2\.?\s*Corr)in?thi|2\.?\s*Corinthii|(?:II\.?\s*Corit|2\.?\s*Corit)hii|(?:II\.?\s*Corit|2\.?\s*Corit)ho|2Corinti)an|II(?:\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|\s*Corint(?:hi(?:(?:ai|e)|o)n|ion))|(?:II\.?\s*Corinthian|2\.?\s*Corinthian)[ao]|(?:II\.?\s*Corini|2\.\s*Corini)thina|(?:II(?:\.\s*Corin[an]|\s*Corin[an])|2(?:\.\s*Corin[an]|\s*Corin[an]))thian|(?:II\.?\s*Ch|2\.?\s*Ch)or(?:(?:(?:(?:inth(?:ia|ai)|inthi)|ithia)|nthia)|anthia)n|2e\.?\s*Corinthien|2\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|(?:II\.?\s*Corinthin|2\.?\s*Corinthin)a|(?:(?:(?:II\.?\s*Corini|2\.\s*Corini)|2\s*Corini)t|(?:II\.?\s*Corit|2\.?\s*Corit))han|(?:II\.?\s*Corn|2\.?\s*Corn)(?:in?than|thin)|(?:(?:II\.?\s*Corintha|2\.?\s*Corintha)|(?:II\.?\s*Corn|2\.?\s*Corn)itha)in|(?:II\.?\s*Cora|2\.?\s*Cora)nthian|2\s*Corinthi(?:(?:ai|e)|o)n|2\s*Corinithina|(?:II\.?\s*Corintha|2\.?\s*Corintha)n|(?:II\.?\s*Corit|2\.?\s*Corit)hin|2\s*Corintion)s|(?:II\.?\s*Korintt|2\.?\s*Korintt)ilaisille|(?:(?:II\.?\s*list\s*K|2\.?\s*list\s*K)orint?s|II\.?\s*Korints|2\.?\s*Korints)kym|2(?:\.\s*Korinth?ierb|\s*Korinth?ierb)revet|(?:II\.?\s*Korinthu|2\.?\s*Korinthu)siakhoz|(?:2(?:\.\s*Korinth?erbreve|\s*Korinth?erbreve)|Dezyem\s*Korin)t|D(?:ru(?:ga\s*Korincanima|h[ay]\s*K)|ovomCor)|Second\s*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?|th)?)?|Tweede\s*(?:Kor(?:inth?ier)?|Corinth?ier)|Masodik\s*Kor(?:inthus)?|Ikalawang\s*[CK]orinto|(?:(?:Do(?:(?:vom)?\s*|(?:vom)?)Corinth|2Corinth)ian|Second\s*Corthian|2e\.?\s*Corinthier|II(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|2\.\s*Corinth?ier|2nd\.?\s*Corthian|2\s*Corinthier|(?:II\.?\s*Cort|2\.?\s*Cort)hian|2\s*Corintier|2\.?\s*Korinto)s|Zweite(?:[nrs])?\s*Korinther|(?:Segund[ao]\s*Corint|(?:2(?:\.o|[ao])\.\s*|2(?:\.o|[ao])\s*)Corint)ios|2(?:(?:(?:(?:\.\s*Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|erbrev|ier|er|a)?)?|\s*Korinthe(?:r(?:brev)?)?|\s*Korinterbrev|\s*Korinthier|\s*Korintier|\s*Korinter|\s*(?:Co(?:r(?:in(?:ti?|i)?)?)?|Kor(?:int)?|Qor)|\s*Korinta|qrn?|Kor)|\s*Corinth)|\s*Corintio)|\.\s*Co(?:r(?:in(?:t(?:io|h)?)?)?)?)|(?:Do(?:(?:vom)?\s*|(?:vom)?)Corinth|2Corinth)ian|2(?:(?:(?:(?:\s*(?:Korinti(?:yarukku|o)|Corinto)|\.\s*Korint(?:hiers|i(?:ers|o))|\s*Korinthiers|\s*Korintiers|e\.?\s*Corinthe|qrnt)|\s*Corinth(?:i(?:aid|os)|e))|\s*Corintios)|\.\s*Corint(?:h(?:i(?:aid|os)|e)|ios|o))|2nd\.?\s*Corinthia?ns|ad\s*Corinthios\s*II|(?:II\.?\s*Korinc|2\.?\s*Korinc)anima|2nd\.?\s*Co(?:r(?:in(?:t(?:h(?:ian)?)?)?|th)?)?|Second\s*Corthian|II(?:\.\s*(?:Corint(?:h(?:i(?:aid|os)|e)|ios|o)|Korint(?:usi|he|io))|\s*(?:Corint(?:h(?:i(?:aid|os)|e)|ios|o)|Korint(?:usi|he|io)))|2\s*k\.?\s*Korint(?:ano|sky)m|2\.\s*korinterbrev|(?:II\.?\s*Corinthian|2\.?\s*Corinthian)s|(?:II\.?\s*Korinthi|2e\.?\s*Corinti)ers|2e\.?\s*Korint(?:h?iers|he)|Korintos\s*Labaad|II\.?\s*Corinthian|2e\.?\s*Corinthier|II(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|(?:II\.?\s*Korinthi|2e\.?\s*Corinti)er|2e\.?\s*Korinth?ier|(?:II\.?\s*Korintan|2\.?\s*Korintan)om|2\s*korinterbrev|(?:II\.?\s*Corinthin|2\.?\s*Corinthin)s|II\.?\s*Korintiers|(?:Pili\s*W|II\.?\s*W|2\.?\s*W)akorinto|(?:Andre\s*Korinte|Pili\s*Ko)r|2\.?\s*Corinthian|Do(?:(?:vom)?\s*|(?:vom)?)Corinth|2\.\s*Corinth?ier|2nd\.?\s*Corthian|II\.?\s*Korintier|(?:II\.?\s*Korinthu|2\.?\s*Korinthu)s|(?:II\.?\s*Kore|2\.?\s*Kore)ntyen|Wakorintho\s*II|Corinthios\s*II|II(?:\.\s*(?:Co(?:r(?:in(?:t(?:io|h)?)?)?)?|Kor(?:int(?:us|a)?)?)|\s*(?:Co(?:r(?:in(?:t(?:io|h)?)?)?)?|Kor(?:int(?:us|a)?)?))|2\s*Corinthier|(?:II\.?\s*Cort|2\.?\s*Cort)hian|2\.?\s*Korintusi|(?:II\.?\s*Kory|2\.?\s*Kory)ntow|2\.?\s*Korintus|2\s*Corintier|2\.?\s*Korinto|And(?:en|re)\s*Kor|(?:II\.?\s*Cort|2\.?\s*Cort)h|2Corinth|2e\.?\s*Kor|2Cor))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:(?:P(?:erse\s*poslannja\s*apostola\s*Pavla\s*do\s*korynfj|ierwsz[aey]\s*Korynti)|(?:Pierwsz[aey]\s*list\s*do\s*Korynt|(?:1\.?\s*list\s*d|I\.?\s*list\s*d)o\s*Korynt)i|Avval\s*?Korinth?i|(?:1\.?\s*Kory|I\.?\s*Kory)nti|1Korinth?i)a|Premye\s*Korentye|1(?:\.\s*Kurinthiayo|\s*K(?:urinthiayo|orinth?ia))|(?:1\.?\s*Kore|I\.?\s*Kore)ntye)n|E(?:nsimmainen\s*K(?:irje\s*korinttilaisill|orintt(?:olaiskirj|ilaisill))e|lso\s*Korint(?:husiakhoz|usi)|erste\s*[CK]orinthe)|(?:P(?:avlova\s*prva\s*poslanica\s*Korincanim|rva\s*(?:Korincanima\s*Poslanic|poslanica\s*Korincanim))|Fyrra\s*bref\s*Pals\s*til\s*Korintumann|(?:1\.?\s*Korinc|I\.?\s*Korinc)anima\s*Poslanic)a|(?:Paulus['’]\s*1\.?\s*Brev\s*til\s*Korinthern|(?:1\.?\s*Korintt|I\.?\s*Korintt)olaiskirj|1(?:\s*(?:[ei](?:\.\s*Korin?t|\s*Korin?t)|Korit)asv|\.\s*Kori(?:nt(?:i?ern|asv)|tasv)|\s*Korinti?ern|\s*Korintasv))e|(?:Waraka\s*wa\s*Kwanza\s*kwa\s*Wakorinth|(?:I(?:ka-?\s*1\s*S|\.?\s*S)|1\.?\s*S)ulat\s*sa\s*mga\s*Corinti|Una(?:ng\s*(?:Sulat\s*sa\s*mga\s*Corinti|Mga\s*Taga-?\s*Corint|[CK]orinti)|\s*(?:Sulat\s*sa\s*mga\s*Corinti|Mga\s*Taga-?\s*Corint|[CK]orinti))|(?:1(?:\.\s*(?:Mga\s*Taga-?\s*|Taga-?)|\s*(?:Mga\s*Taga-?\s*|Taga-?))C|1\.?\s*Mga\s*Taga-?C)orint|I\.?\s*Mga\s*Taga-?\s*Corint|(?:Kwanza\s*W|1\.?\s*W|I\.?\s*W)akorinth)o|Waraka\s*wa\s*Kwanza\s*kwa\s*Wakorinto|Barua\s*ya\s*Kwanza\s*kwa\s*Wakorintho|(?:I(?:ka-?\s*1\s*S|\.?\s*S)|1\.?\s*S)ulat\s*sa\s*mga\s*Corinto|Una(?:ng\s*(?:Sulat\s*sa\s*mga\s*C|[CK])orinto|\s*(?:Sulat\s*sa\s*mga\s*C|[CK])orinto)|F(?:yrra\s*bref\s*Pals\s*til\s*Korin|irst\s*Co(?:r(?:in(?:th?)?)?)?)|(?:1\.?\s*Ki|I\.?\s*Ki)rje\s*korinttilaisille|(?:Prim(?:(?:a\s*lettera\s*ai|o)|a)\s*Corinz|1(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:(?:tien|z)|ten))|I(?:\.\s*Corin(?:ti?en|z)|\s*Corin(?:ti?en|z)))i|(?:Epistula\s*I\s*ad\s*Corinthio|(?:Prime(?:ir[ao]\s*Corint|ro?\s*Corint)|(?:1(?:\.o|[ao])\.\s*|1(?:\.o|[ao])\s*)Corint)io|(?:First|1st\.?)\s*Corinthian[ao]|(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)thina|(?:First\s*Corinthin|1st\.\s*Corinthin|1st\s*Corinthin|1\.?\s*Corinthin|I\.?\s*Corinthin)a|(?:(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)t|(?:(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)|1\s*Corinit))han|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)(?:in?than|thin)|(?:(?:First\s*Corintha|1st\.\s*Corintha|1st\s*Corintha|1\.?\s*Corintha|I\.?\s*Corintha)|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)itha)in|(?:First\s*Ch|1st\.\s*Ch|1st\s*Ch|1\.?\s*Ch|I\.?\s*Ch)orinthin|(?:First\s*Corintha|1st\.\s*Corintha|1st\s*Corintha|1\.?\s*Corintha|I\.?\s*Corintha)n|1(?:\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|\s*Corint(?:hi(?:(?:ai|e)|o)n|ion))|I(?:\.\s*Corint(?:hi(?:(?:ai|e)|o)n|ion)|\s*Corint(?:hi(?:(?:ai|e)|o)n|ion))|(?:1\.?\s*Corinthian|I\.?\s*Corinthian)[ao]|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)hin|1\s*Corinithina|C(?:or(?:i(?:(?:n(?:thi(?:an[ao]|na|on)|ithina)|thin)|nthan)|i(?:ni)?than|n(?:in?than|thin))|or(?:in|ni)thain|horinthin))s|(?:Epistula\s*)?ad\s*Corinthios\s*I|F(?:orsta\s*Korint(?:h?i|h?)erbrevet|yrra\s*Korintubref)|P(?:rv(?:ni\s*(?:list\s*Korint?s|Korints)kym|a\s*kniha\s*Korint(?:ano|sky)m|y\s*(?:list\s*Korint(?:ano|sky)m|Korint(?:ano|sky)m)|a\s*Korint(?:ano|sky)m|niK)|ierwsz[aey]\s*Koryntow)|(?:Premier(?:e?s|e?)\s*Corinthie|(?:First|1st\.?)\s*Corinthia[ai]|(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)thia|(?:First\s*Corii|1st\.\s*Corii|1st\s*Corii|1\.?\s*Corii|I\.?\s*Corii)nthia|(?:(?:First\s*Corini|1st\.\s*Corini|1st\s*Corini|1\.\s*Corini|I\.?\s*Corini)t|(?:(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)|1\s*Corinit))hai|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)(?:inthai|thia)|(?:(?:First\s*Corintha|1st\.\s*Corintha|1st\s*Corintha|1\.?\s*Corintha|I\.?\s*Corintha)|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)itha)ia|(?:(?:First\s*Corr|1st\.\s*Corr|1st\s*Corr|1\.?\s*Corr|I\.?\s*Corr)in?tha|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)tha)i|(?:First\s*Ch|1st\.\s*Ch|1st\s*Ch|1\.?\s*Ch|I\.?\s*Ch)orinth(?:ia|ai)|1(?:ere?|re)\.\s*Corinthie|First\s*Corinthio|(?:First\s*Corintho|1st\.\s*Corintho|1st\s*Corintho|1\.?\s*Corintho|I\.?\s*Corintho)a|1(?:ere?|re)\s*Corinthie|1st\.\s*Corinthio|(?:First|1st\.?)\s*Corinti[ao]|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)hia|1\.\s*Corint(?:hia|i)a|I(?:\.\s*Corint(?:hia|i)a|\s*Corint(?:hia|i)a)|1st\s*Corinthio|1\s*Corint(?:hia|i)a|1\s*Corinithia|C(?:or(?:i(?:(?:n(?:(?:t(?:hia[ai]|i[ao])|ithia)|thoa)|inthia)|thia)|i(?:ni)?thai|n(?:inthai|thia))|or(?:in|ni)thaia|or(?:rin?tha|ntha)i|horinth(?:ia|ai)))ns|(?:1\.?\s*Korintt|I\.?\s*Korintt)ilaisille|1(?:\.\s*Korinth?ierb|\s*Korinth?ierb)revet|(?:(?:First\s*Corii|1st\.\s*Corii|1st\s*Corii|1\.?\s*Corii|I\.?\s*Corii)nthii|First\s*Corinthii|(?:First\s*Corintho|1st\.\s*Corintho|1st\s*Corintho|1\.?\s*Corintho|I\.?\s*Corintho)i|(?:First\s*Corn|1st\.\s*Corn|1st\s*Corn|1\.?\s*Corn|I\.?\s*Corn)(?:in?thi|thii)|(?:First\s*Corr|1st\.\s*Corr|1st\s*Corr|1\.?\s*Corr|I\.?\s*Corr)in?thi|(?:First\s*Corin[an]|1st\.\s*Corin[an]|1st\s*Corin[an]|1(?:\.\s*Corin[an]|\s*Corin[an])|I(?:\.\s*Corin[an]|\s*Corin[an]))thi|(?:First\s*Ch|1st\.\s*Ch|1st\s*Ch|1\.?\s*Ch|I\.?\s*Ch)or(?:an|[in])thi|1st\.\s*Corinthii|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)hii|(?:First\s*Cora|1st\.\s*Cora|1st\s*Cora|1\.?\s*Cora|I\.?\s*Cora)nthi|1st\s*Corinthii|(?:First\s*Corit|1st\.\s*Corit|1st\s*Corit|1\.?\s*Corit|I\.?\s*Corit)ho|1\.?\s*Corinthii|I\.?\s*Corinthii|C(?:or(?:i(?:(?:inthii|nthii|nthoi|tho)|thii)|n(?:in?thi|thii)|rin?thi)|orin[an]thi|hor(?:an|[in])thi))ans|(?:(?:1\.?\s*list\s*K|I\.?\s*list\s*K)orint?s|1\.?\s*Korints|I\.?\s*Korints)kym|(?:1\.?\s*Korinthu|I\.?\s*Korinthu)siakhoz|(?:1(?:\.\s*Korinth?erbreve|\s*Korinth?erbreve)|Premye\s*Korin)t|(?:Eerste\s*(?:Korinth?ier|Corinth?ier)|1e\.\s*(?:Korinth?ier|Corinth?ier)|1(?:\.\s*Corinth?ier|(?:(?:\s*Corinthier|\.?\s*Korinto)|\s*Corintier))|I(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|I\.?\s*Korinthier|1e\s*(?:Korinth?ier|Corinth?ier)|I\.?\s*Korintier)s|Eerste\s*(?:Korinth?ier|Corinth?ier)|(?:First|1st\.?)\s*Corinthians|K(?:o(?:iro\s*Qoronttoosa|rintos\s*Kowaad)|wanza\s*Kor)|Avval\s*Corinth?ians|(?:Avval\s*|(?:Avval|1))Qorint(?:h(?:iy?a|yu)n|(?:iy?a|yu)n)|1(?:(?:(?:(?:\.\s*Kor(?:int(?:h(?:e(?:r(?:brev)?)?|ier)|erbrev|ier|er|a)?)?|\s*Korinthe(?:r(?:brev)?)?|\s*Korinterbrev|\s*Korinthier|\s*Korintier|\s*Korinter|\s*(?:Co(?:r(?:in(?:ti?|i)?)?)?|Kor(?:int)?|Qor)|\s*Korinta|qrn?|Kor)|\s*Corinth)|\s*Corintio)|\.\s*Co(?:r(?:in(?:t(?:io|h)?)?)?)?)|Prv(?:a\s*Korincanima|ni\s*K(?:or)?)|(?:First|1st\.?)\s*Corinthian|Avval\s*Corinth(?:ian)?|1(?:(?:(?:(?:\s*(?:Korinti(?:yarukku|o)|Corinto)|\.\s*(?:korinterbrev|Korint(?:hiers|i(?:ers|o)))|\s*korinterbrev|\s*Korinthiers|\s*Korintiers|qrnt)|\s*Corinth(?:i(?:aid|os)|e))|\s*Corintios)|\.\s*Corint(?:h(?:i(?:aid|os)|e)|ios|o))|(?:First\s*Corinthin|1st\.\s*Corinthin|1st\s*Corinthin|1\.?\s*Corinthin|I\.?\s*Corinthin)s|Erste(?:[nrs])?\s*Korinther|(?:Avval|1)Corinth?ians|(?:Kwanza\s*W|1\.?\s*W|I\.?\s*W)akorinto|(?:Avval|1)Corinth(?:ian)?|1\s*k\.\s*Korint(?:ano|sky)m|(?:First\s*Cort|(?:1st\.\s*Cort|(?:1st\s*Cort|(?:1\.?\s*Cort|I\.?\s*Cort))))hians|Yek(?:\s*Corinth?ians|\s*?Qorint(?:h(?:iy?a|yu)n|(?:iy?a|yu)n)|Corinth?ians|\s*?Korinth?ian)|(?:1\.?\s*Korinc|I\.?\s*Korinc)anima|E(?:lso\s*Kor(?:inthus)?|erste\s*Kor)|1e\.\s*(?:Korinth?ier|Corinth?ier)|(?:First\s*Cort|(?:1st\.\s*Cort|(?:1st\s*Cort|(?:1\.?\s*Cort|I\.?\s*Cort))))h(?:ian)?|Yek(?:\s*Corinth(?:ian)?|Corinth(?:ian)?)|I(?:\.\s*(?:Corint(?:h(?:i(?:aid|os)|e)|ios|o)|Korint(?:usi|he|io))|\s*(?:Corint(?:h(?:i(?:aid|os)|e)|ios|o)|Korint(?:usi|he|io)))|1\s*k\s*Korint(?:ano|sky)m|(?:1\.?\s*Corinthian|I\.?\s*Corinthian)s|1\.?\s*Corinthian|I\.?\s*Corinthian|1(?:\.\s*Corinth?ier|(?:(?:\s*Corinthier|\.?\s*Korinto)|\s*Corintier))|I(?:\.\s*(?:Corinth?ier|Korinto)|\s*(?:Corinth?ier|Korinto))|I\.?\s*Korinthier|1e\s*(?:Korinth?ier|Corinth?ier)|(?:1\.?\s*Korintan|I\.?\s*Korintan)om|1\s*Qorint(?:h(?:iy?a|yu)n|(?:iy?a|yu)n)|(?:1\.?\s*Korinthu|I\.?\s*Korinthu)s|1st\.\s*Co(?:r(?:in(?:th?)?)?)?|I\.?\s*Korintier|1\.?\s*Korintusi|1e\.\s*[CK]orinthe|(?:Corinthios|Wakorintho)\s*I|1\.?\s*Korintus|I(?:\.\s*(?:Co(?:r(?:in(?:t(?:io|h)?)?)?)?|Kor(?:int(?:us|a)?)?)|\s*(?:Co(?:r(?:in(?:t(?:io|h)?)?)?)?|Kor(?:int(?:us|a)?)?))|1st\s*Co(?:r(?:in(?:th?)?)?)?|(?:1\.?\s*Kory|I\.?\s*Kory)ntow|1e\s*[CK]orinthe|Corinthia?ns|Corinthian|AvvalCor|1e\.\s*Kor|1e\s*Kor|1Cor))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Gal"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ga-?la-?ti|(?:P(?:oslannja\s*apostola\s*Pavla\s*do\s*halativ|aulus(?:'\s*Brev\s*til\s*Galaterne|’\s*(?:Brev\s*til\s*G|brev\s*til\s*g)alaterne))|(?:P(?:avlova\s*p)?oslanica\s*Galacanim|Bref\s*Pals\s*til\s*Galatamann|galati(?:harulai|karams)\s*patr|Mga\s*Taga-?\s*Galasy|Gala(?:atiya|ci)|Galacanim)a|Sulat\s*sa\s*mga\s*(?:taga\s*)?Galacia|(?:Layang\s*Paulus\s*Galat|Barua\s*kwa\s*Wagalat|Mga\s*Taga-?\s*Galac|Wagalat)ia|(?:Kirje\s*galatalaisill|Galat(?:alaisill|(?:asv|ern)))e|Brevet\s*til\s*Galaterne|Epistula\s*ad\s*Galatas|L(?:ettera\s*ai\s*Galati|ist\s*(?:do\s*Gala(?:cjan|tow)|Galat(?:ano|sky)m))|(?:Mga\s*)?Taga-?Galacia|G(?:(?:(?:ala(?:t(?:a(?:laiskirj|khoz|ns)|e(?:rbref?vet|n(?:brief|i)|s)|i(?:a(?:ni?s|id|s)|yans|na?s|on?s)|ow)|s(?:yano|ia))|alatianians|halatians|l)|alatanom)|alatskym)|galati(?:harulai|karams)|Gal(?:at(?:i(?:y[au]nia|[ao]a)|a[ao]|oa)n|at(?:i(?:a(?:na|in)|nan|on[an])|on|n)|at[ai]i(?:[ao])?n|lati(?:[ao])?n)s|Taga-?\s*Galacia|G(?:a(?:latianian|(?:l(?:a(?:t(?:i(?:y(?:an?|un)|an?)?|as?|e[nr])?|si)?)?)?)|halatian)|G(?:ala(?:(?:ti(?:(?:an)?u|yo)|sye)|ty[ao])|halat(?:i(?:y[au]|u)|y[ao]))n|ad\s*Galatas|Galacjan))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eph"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*efesjan|ica\s*Efezanima)|a(?:vlova\s*poslanica\s*Efezanima|ulus(?:'\s*Brev\s*til\s*Efeserne|’\s*(?:Brev\s*til\s*E|brev\s*til\s*e)feserne)))|(?:Bref\s*Pals\s*til\s*Efesusman|Efisoo)na|(?:E(?:pistula\s*ad\s*Ephesio|(?:p(?:hesion|esu)|fe(?:zier|su)))|Afis(?:i(?:siya|yu)|siyu)nian|ad\s*Ephesio|E(?:(?:pehe|hp[ei])|sphe)sian|Ep(?:hesie|esia)n)s|L(?:ayang\s*Paulus\s*Efesus|ettera\s*agli\s*Efesini|ist\s*Efez(?:an[ou]|sky)m)|Sulat\s*sa\s*mga\s*E[fp]esi?o|(?:Kirje\s*efesolaisill|Efes(?:(?:olaiskirj|ianev|ern)|olaisill))e|(?:(?:Waraka\s*kwa\s*Wae|(?:(?:Mga\s*)?Taga-?E|Wae))|Barua\s*kwa\s*Wae)feso|(?:Mga\s*)?Taga-?\s*E[fp]esi?o|E(?:p(?:h(?:es(?:(?:zosziakhoz|i(?:a(?:n[ds]|id)|os)|er)|ains)|isians|sians)|esi?o)|f(?:(?:(?:(?:e(?:s(?:ierbrevet|erbrevet|os)|zow)|s)|fesiaid)|ezusiakhoz)|esios))|List\s*do\s*Efezjan|(?:Af(?:es(?:i(?:y(?:ani|y)|siy)|sisi|y)|ssiy)|Efezj)an|Af(?:esisyani|isiyani|so)|Afis(?:is)?yani|Mga\s*E[fp]esi?o|(?:Af(?:is(?:i(?:s(?:i(?:yu|a)|yu)|yyu|a)|siy?a)|es(?:i(?:syu|yu|a)|siy[aou])|siya)|Af(?:e?si|is)yoo|Iafisiyo|Efezye)n|Af(?:esis?yan|is(?:siyu|iy[au])n)|Efezanima|E(?:p(?:h(?:e(?:s(?:ian)?)?|esain|isian|sian|s)?)?|f(?:(?:e(?:z(?:us)?|s(?:e|o)?)?|is|f)?|esio)|hp)|Efezanom|Efezskym|Efeskym|Efes[ei]ni|afso|afs))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Col"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*kolosjan|ica\s*Kolosanima)|avlova\s*poslanica\s*Kolosanima)|(?:Paulus(?:’\s*(?:Brev\s*til\s*Kolossen|brev\s*til\s*kolos)|'\s*Brev\s*til\s*Kolossen)sern|K(?:irje\s*kolossalaisill|olos(?:(?:s(?:alaiskirj|ern)|ianev)|salaisill)))e|B(?:ref\s*Pals\s*til\s*Kolossumanna|arua\s*kwa\s*Wakolosai)|Bref\s*Pals\s*til\s*Kolossumann|Sulat\s*sa\s*mga\s*[CK]olon?sense|Epistula\s*ad\s*Colossenses|(?:Lettera\s*ai\s*)?Colossesi|Waraka\s*kwa\s*Wakolosai|(?:kalass(?:aikarams|iharulai)\s*patr|Qolasiyaas)a|Layang\s*Paulus\s*Kolose|K(?:ol(?:os(?:s(?:e(?:nser(?:brevet|ne)|rbrevet)|ze(?:beliekhez|ieknek)|eiakhoz|iy)|ensow|a[sy])|usiy?ans)|ulusiy)|(?:Mga\s*Taga(?:-?(?:\s*[CK]olosa|Colosa)|\s*[CK]olosa)|Kolus(?:iy[au]ni|y)an|Taga(?:-?\s*?C|\s*C)olosa|C(?:olos(?:s(?:i(?:ya|[eo])|a)|io)|(?:olass?|oll[ao]s)i[ao]|al(?:(?:[ao]s|[ao])si[ao]|l(?:asi[ao]|osi[ao])))n|Callossian|Colos(?:ian|a))s|(?:List\s*do\s*Kolos|K(?:ol(?:os(?:iy|si)ani|ussiy)|alossiy)|Colusiy)an|kalass(?:aikarams|iharulai)|List\s*Kolos(?:an[ou]m|kym)|Mga\s*[CK]olon?sense|ad\s*Colossenses|Ko(?:l(?:os(?:se(?:nsern|r)?|i(?:y(?:an)?|an?)|an|e)?|usi(?:y[au]n|an))?)?|(?:Kolos(?:sens|(?:ens)?)ky|Kolosan[ou])m|(?:Col(?:ossenze|(?:ossiyu|usia))|K(?:ol(?:(?:os(?:iy(?:an)?u|(?:senz|y)e)|usiyanu)|osiyoo)|ulussaiyo))n|Coloss?enses|C(?:(?:olos(?:siaid|iaid|eni)|l)|olossians)|Kolosanima|Co(?:lossian|(?:l(?:oss?)?)?)|Wakolosai|Qol))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Dru(?:he\s*poslannja\s*apostola\s*Pavla\s*do\s*Tymofij|g(?:a\s*(?:T(?:imoteju\s*Poslanic|ymoteusz)|List\s*do\s*Tymoteusz)|i\s*(?:List\s*do\s*)?Tymoteusz))|(?:II\.?\s*Timoteju|2\.?\s*Timoteju)\s*Poslanic|(?:II\.?\s*L|2\.?\s*L)ist\s*do\s*Tymoteusz|(?:II\.?\s*Ty|2\.\s*Ty)moteusz|2\s*Tymoteusz)a|Pavlova\s*druga\s*poslanica\s*Timoteju|Paulus['’]\s*Andet\s*Brev\s*til\s*Timotheus|(?:Paulus’\s*andre\s*brev\s*til\s*Timot|Tweede\s*Timoth)eus|Waraka\s*wa\s*Pili\s*kwa\s*Timotheo|T(?:oinen\s*(?:Kirje\s*Timoteuksell|Timoteu(?:skirj|ksell))e|imoteyos\s*Labaad)|Barua\s*ya\s*Pili\s*kwa\s*Timotheo|(?:Se(?:(?:cond(?:a\s*lettera\s*a|o)|conda)\s*Timot|gund[ao]\s*Timot)|(?:(?:I(?:kalawang\s*Ka|I\.?\s*Ka)y|2(?:\.\s*Ka(?:ng|y)|\s*Ka(?:ng|y)|(?:\.o|[ao])\.))\s*|(?:Ikalawang\s*|2(?:\.o|[ao])\s*))Timot)eo|Druga\s*poslanica\s*Timoteju|Epistula\s*(?:II\s*ad\s*Timotheum|ad\s*Timotheum\s*II)|(?:II\.?\s*Ki|2\.?\s*Ki)rje\s*Timoteukselle|Naa77antto\s*Ximootiyoosa|D(?:ruh(?:a\s*(?:kniha\s*)?Timotejovi|a\s*(?:kniha\s*)?Timoteovi|a\s*list\s*Tim(?:otej?|etej)ovi|y\s*(?:list\s*Tim(?:otej?|etej)ovi|T(?:imotejovi|(?:imoteovi|m)))|a\s*Tm)|o(?:v(?:omTimot(?:eos|hy)|vomTimothy)|Timothy))|And(?:r(?:a\s*Timot(?:heo|eu)sbrevet|e\s*Timoteusbrev)|(?:e[nt]\s*Timotheusb|en\s*Timoteusb)rev)|(?:II\.?\s*l|2\.?\s*l)ist\s*Tim(?:otej?|etej)ovi|Masodik\s*Timot(?:eus(?:nak|hoz)|heosz)|2\.?\s*Timotheosbrevet|(?:De(?:uxiemes?\s*Timothe|zyem\s*Timot)|(?:II\.?\s*Timoteusk|2\.?\s*Timoteusk)irj|(?:2(?:eme\.|de?\.)\s*|2(?:eme\s*|de?\s*))Timothe)e|2(?:\.\s*Timoteusbreve|\s*(?:Timoteusbreve|[ei]\.?\s*Timoteu))t|(?:II\.?\s*Timoteuk|2\.?\s*Timoteuk)selle|Zweite(?:[nrs])?\s*Timotheus|Masodik\s*Tim(?:oteus)?|2\.?\s*Timotheusbrev|(?:2(?:\.\s*T(?:eemuathaiy|imoti)|\s*Teemuathaiy|e\.?\s*Timote|Timothe|\s*Timoti)|Do(?:vomTimothae|Timotha?e)|Tweede\s*Timote|II\.?\s*Timoti|2Timothae)us|2(?:(?:\.\s*Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:eo)?))?)?|\s*Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:eo)?))?)?|e\.?\s*Tim|(?:\s*Ty|Ti)m)|\.?\s*Timoteo)|2\s*k\.?\s*Timotejovi|Second\s*T(?:himothy|imoth?y|himoty|omothy|m)|(?:II\.?\s*Timoteusn|2\.?\s*Timoteusn)ak|(?:(?:II\.?\s*Timoteush|2\.?\s*Timoteush)o|II\.?\s*Timotheos)z|(?:D(?:o(?:v(?:(?:omTimoth?aio|vomTimotheo|omTimot(?:eo?u|hao|ao))|omTimothe[ou])|Timot(?:hao|e[ou]))|ruh[ay]\s*Timoteu)|2(?:(?:(?:e\.?\s*Timotheu|Timoteo?u)|Timothao)|Timotao)|(?:II\.?\s*Timotey|2\.?\s*Timotey|2Timothai|2Timotai)o)s|ad\s*Timotheum\s*II|D(?:ru(?:ga\s*Timoteju|h[ay]\s*Tim)|ovomTim(?:oteo)?)|And(?:en\s*Tim(?:oteus)?|re\s*Tim(?:oteus)?)|(?:II\.?\s*Timotejo|2\s*k\.?\s*Timoteo|2\.?\s*Timotejo)vi|Second\s*Ti(?:m(?:oth)?)?|2(?:\.\s*T(?:imot(?:h(?:e(?:osz|um|e)|y)|e(?:ut|i)|y)|m)|\s*Timot(?:h(?:e(?:osz|um|e)|y)|e(?:ut|i)|y)|e\.?\s*Timothee|Timothy|\s*Tm)|II(?:\.\s*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|m)|\s*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|m))|(?:II\.?\s*Timoteov|2\.?\s*Timoteov)i|2nd\.?\s*T(?:himothy|imoth?y|himoty|omothy|m)|Pili\s*Timotheo|II(?:\.\s*Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|\s*Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?)|II\.?\s*Timoteju|2\.?\s*Timotheus|(?:II\.?\s*Th|2\.?\s*Th)imothy|Timotheum\s*II|2\.?\s*Timoteju|2nd\.?\s*Ti(?:m(?:oth)?)?|(?:II\.?\s*Th|2\.?\s*Th)imoty|(?:II\.?\s*To|2(?:\.?\s*To|ndTi))mothy|Timotheo\s*II|Tweede\s*Tim|2Timoteos|2Timoteo|Pili\s*Tim|2\s*Xim))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:P(?:erse\s*poslannja\s*apostola\s*Pavla\s*do\s*Tymofij|ierwsz[aey]\s*(?:List\s*do\s*)?Tymoteusz|rva\s*Timoteju\s*Poslanic)|(?:1\.?\s*Timotej|I\.?\s*Timotej)u\s*Poslanic|(?:1\.?\s*L|I\.?\s*L)ist\s*do\s*Tymoteusz|(?:1\.?\s*Ty|I\.?\s*Ty)moteusz)a|(?:Ensimmainen\s*(?:Kirje\s*Timoteuksell|Timoteu(?:skirj|ksell))|(?:1\.?\s*Ki|I\.?\s*Ki)rje\s*Timoteuksell|(?:1\.?\s*Timoteusk|I\.?\s*Timoteusk)irj|(?:1\.?\s*Timoteuk|I\.?\s*Timoteuk)sell)e|P(?:a(?:vlova\s*prva\s*poslanica\s*Timoteju|ulus['’]\s*1\.?\s*Brev\s*til\s*Timotheus)|r(?:va\s*poslanica\s*Timoteju|(?:(?:v(?:ni\s*list\s*Timotej?ovi|a\s*kniha\s*Timotej?ovi|ni\s*(?:list\s*Timete|Timotej)ovi|y\s*(?:list\s*Timotej?ovi|Timotej?ovi)|(?:ni\s*Timoteo|a\s*Timotej?o)vi|ni\s*Tm)|em(?:ier(?:e?s|e?)\s*Timothee|ye\s*Timote))|vni\s*Timoteus)))|F(?:yrra\s*(?:bref\s*Pals\s*til\s*Timoteusar|Timoteusarbref)|orsta\s*Timot(?:heo|eu)sbrevet|irst\s*T(?:himothy|imoth?y|himoty|omothy|m))|Waraka\s*wa\s*Kwanza\s*kwa\s*Timotheo|Barua\s*ya\s*Kwanza\s*kwa\s*Timotheo|F(?:yrra\s*bref\s*Pals\s*til\s*Timot|irst\s*Ti(?:m(?:oth)?)?)|E(?:pistula\s*I\s*ad\s*Timotheum|lso\s*Timot(?:eus(?:nak|hoz)|heosz))|(?:Epistula\s*)?ad\s*Timotheum\s*I|(?:(?:(?:(?:Prim(?:a\s*lettera\s*a|e(?:ir[ao]|ro)|o)|1(?:\.\s*Ka(?:ng|y)|\s*Ka(?:ng|y)|(?:\.o|[ao])\.))\s*|(?:(?:Primer\s*|1(?:\.o|[ao])\s*)|Prima\s*))|I\.?\s*Kay\s*)Timot|Una(?:ng\s*(?:Kay\s*)?Timot|\s*(?:Kay\s*)?Timot))eo|1\.?\s*Timotheosbrevet|(?:1\.?\s*l|I\.?\s*l)ist\s*Timotej?ovi|Koiro\s*Ximootiyoosa|1(?:\.\s*Timoteusbreve|\s*(?:Timoteusbreve|[ei]\.?\s*Timoteu))t|(?:1\.?\s*l|I\.?\s*l)ist\s*Timeteovi|1(?:\.\s*T(?:imot(?:h(?:e(?:u(?:sbrev|m)|osz|e)|y)|e(?:ut|i)|y)|m)|\s*T(?:imot(?:h(?:e(?:u(?:sbrev|m)|osz|e)|y)|e(?:ut|i)|y)|m)|Timothy)|Timot(?:eyos\s*Kowaad|h(?:e[ou]s|y))|(?:1(?:\.\s*T(?:eemuathaiy|imoti)|\s*T(?:eemuathaiy|imoti)|Timothe)|AvvalTimothae|Eerste\s*Timote|YekTimothae|1e\.\s*Timote|I\.?\s*Timoti|1Timothae|1e\s*Timote|Timoteo)us|(?:Eerste|1e\.?)\s*Timotheus|Erste[nrs]\s*Timotheus|1(?:(?:\.\s*Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:e(?:us|o))?))?)?|\s*Ti(?:m(?:ot(?:e(?:us(?:brev)?)?|h(?:e(?:us|o))?))?)?|Tim)|\.?\s*Timoteo)|1\s*k\.\s*Timotej?ovi|(?:AvvalTimot(?:haio|eo?u|h(?:ao|e[ou])|ai?o)|YekTimot(?:hao|eo?u)|YekTimothe[ou]|(?:1\.?\s*Timotey|I\.?\s*Timotey|YekTimota|1Timothai)o|1Timoteo?u|1Timothao|1Timotai?o)s|Erste\s*Timotheus|Kwanza\s*Timotheo|(?:1\.?\s*Timoteusn|I\.?\s*Timoteusn)ak|(?:(?:1\.?\s*Timoteush|I\.?\s*Timoteush)o|I\.?\s*Timotheos)z|(?:AvvalstTi|1\.?\s*To|I\.?\s*To|1stTi)mothy|1\s*k\s*Timotej?ovi|1(?:ere?|re)\.\s*Timothee|E(?:lso\s*Tim(?:oteus)?|erste\s*Tim)|P(?:rv(?:a\s*Timoteju|ni\s*Tim)|ierwsz[aey]\s*Tym)|AvvalTimot(?:eos|hy)|1st\.\s*T(?:himothy|imoth?y|himoty|omothy|m)|(?:1\.?\s*Timotej|I\.?\s*Timotej)ovi|1(?:ere?|re)\s*Timothee|AvvalTim(?:oteo)?|I(?:\.\s*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|m)|\s*T(?:imot(?:h(?:e(?:u[ms]|e)|y)|ei|y)|m))|1st\s*T(?:himothy|imoth?y|himoty|omothy|m)|(?:1\.?\s*Timoteov|I\.?\s*Timoteov)i|I(?:\.\s*Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?|\s*Ti(?:m(?:ot(?:e(?:us|o)?|h(?:eo)?))?)?)|1st\.\s*Ti(?:m(?:oth)?)?|(?:1\.?\s*Timotej|I\.?\s*Timotej)u|YekTimot(?:eos|hy)|(?:1\.?\s*Th|I\.?\s*Th)imothy|Timotheum\s*I|1st\s*Ti(?:m(?:oth)?)?|Kwanza\s*Tim|(?:1\.?\s*Th|I\.?\s*Th)imoty|Timotheo\s*I|1Timoteos|1Timoteo|1e\.\s*Tim|Timoth|YekTim|1e\s*Tim|(?:1\.?\s*Ty|I\.?\s*Ty)m|1\s*Xim))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Deut"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))(Deut-?ieh|(?:(?:Ks(?:ieg[ai]\s*Powt(?:orzonego)?\s*Pra|\.\s*Powt(?:orzonego)?\s*Pra|\s*Powt(?:orzonego)?\s*Pra)w|(?:Piata\s*K|5\.?\s*K)s(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|V(?:iides\s*Mooseksen\s*kirj|\.\s*(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|kniha\s*Mojzisov|Mojzeszow|Mojzisov)|\s*(?:(?:(?:Ks(?:ieg[ai]\s*Mojzeszow|\.?\s*Mojzeszow)|Mojzeszow)|Mojzisov)|kniha\s*Mojzisov)|\.?\s*Mooseksen\s*kirj)|(?:Pi?ata\s*k|5\.\s*k)niha\s*Mojzisov|Kumbukumbu\s*la\s*Sheri|Dezyem\s*liv\s*Lalwa\s*|5\.\s*Mooseksen\s*kirj|5\s*kniha\s*Mojzisov|5\s*Mooseksen\s*kirj|Zaarettido\s*Woga|(?:(?:Piata|5\.)|5)\s*Mojzeszow|(?:(?:Piata|5\.)|5)\s*Mojzisov|Pata\s*Mojzisov|5\s*k\.\s*Mojzisov|5\s*k\s*Mojzisov|Te?sn-?h)a|Kitabu\s*cha\s*Tano\s*cha\s*Musa|Sharciga\s*Kunoqoshadiisa|Kumbukumbu\s*la\s*Torati|M(?:asodik\s*torvenykonyv|ozes\s*V|Torv)|(?:Mozes\s*otodik\s*konyv|Ligji\s*i\s*Perterir|Tesn-?i|Dt-?i)e|Pangandharing\s*Toret|Li(?:ber\s*Deuteronomii|P)|P(?:ovtorennja\s*Zakonu|nz)|(?:Vyavasthaavivara|Ponovljeni\s*zako|Ulanga)n|F(?:unftes\s*Buch\s*Mose|emte\s*Mosebo(?:ken|g)|immta\s*(?:bok\s*Mose|Mosebok)|unftes\s*Mose)|Andharaning\s*Toret|V(?:iides\s*Mooseksen|\.?\s*Mooseksen|\.\s*Mo(?:jz|s)|\s*Mo(?:jz|[js]))|Femte\s*Mos(?:ebok)?|D(?:e(?:uteronom(?:i(?:y[ao]|[ao])|ya|ul|[ae])|(?:uteronomiu|te[rw]ono)m|wariem)|e?yuteronomyo|iyuteronomyo|(?:(?:euto?ronom|eut(?:e?|o)ronm)|ueteronom)io|euto?ronomy|eet(?:[eo]rono?my|rono?my)|u(?:eterono?my|etorono?my|ut(?:[eo]rono?my|rono?my)|etrono?my)|eut(?:e?|o)ronmy|trnmy|tn)|5\.\s*Mooseksen|V(?:ijfde|\.?)\s*Mozes|5\.?\s*Mosebo(?:ken|g)|5\.?\s*Buch\s*Mose|D(?:e(?:u(?:t(?:eronom(?:i|y)?)?)?|t)?|uet|t)|5\s*Mooseksen|Kum(?:b(?:ukumbu)?)?|(?:Piata|5\.)\s*Mojz|5\.?\s*Mosebok|V\.?\s*Mosebok|T(?:(?:es(?:sniy|ni?y)|sn-?i)eh|essnie|es(?:n(?:i[ae]|a)|s(?:ny|i[ey]))h|asnieh)|5\.\s*Mozes|5(?:\.\s*Mo(?:se?)?|\s*M(?:(?:o(?:os|z)?)?|ose?))|tsniyeh|5\s*Mozes|5\s*Mojz|Sharci|anuwad|T(?:es(?:sn?|n)|sn)|5\s*Moj|5\s*Mz|ZarW|tsn?|Pwt|Ul))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Titus"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:oslan(?:nja\s*apostola\s*Pavla\s*do\s*Tyta|ica\s*Titu)|a(?:ulus(?:'\s*Brev\s*til\s*Titus|’\s*[Bb]rev\s*til\s*Titus)|vlova\s*poslanica\s*Titu))|Bref\s*Pals\s*til\s*Titusar|Brevet\s*till\s*Titus|Epistula\s*ad\s*Titum|Kirje\s*Titukselle|Brevet\s*til\s*Titus|Waraka\s*kwa\s*Tito|(?:tita(?:slai|la)\s*patr|List\s*do\s*Tytus)a|Lettera\s*a\s*Tito|Barua\s*kwa\s*Tito|T(?:(?:i(?:t(?:u(?:s(?:arbref|brevet|z?hoz|ian)|m)|it|e)|itu)|ytusa|t)|itukselle)|List\s*Titovi|Ka(?:ng|y)\s*Tito|tita(?:slai|la)|ad\s*Titum|T(?:a[iy]t(?:o[ou]|u)|i(?:to|it)o)s|T(?:i(?:t(?:u(?:sz?)?|i|o)?|it)|yt(?:us)?)|Titovi|Tytous|Teetus))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Heb"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:P(?:avlova\s*poslanica\s*Hebrejima|oslan(?:nja\s*do\s*jevreiv|ica\s*Hebrejima))|(?:hibruharuko\s*nimti\s*patr|Waraka\s*kwa\s*Waebrani|Barua\s*kwa\s*Waebrani|ibri\s*lokams\s*patr|Cibraaniyad|Waebrani)a|L(?:ist\s*(?:do\s*(?:Hebrajczyk|Zyd)ow|Hebrej[ou]m|Zidum)|ettera\s*agli\s*Ebrei|ayang\s*Ibrani)|(?:Epistula\s*)?ad\s*Hebraeos|(?:Brevet\s*til\s*hebreern|He(?:prealaiskirj|bre(?:ern|njv))|Ibraaw)e|Kirje\s*he[bp]realaisille|Z(?:sidokhoz\s*irt\s*level|d)|hibruharuko\s*nimti|Mga\s*(?:Hebr(?:ohanon|eo)|Ebreo)|Heprealaisille|H(?:eb(?:r(?:e(?:e(?:rbrevet|s)|aid|(?:o?|w)s|u[sx])|aee?r|rs|ws|s)|er?s|(?:ro|e[eo])s|o(?:[eor])?s)|e[ew]brews|w(?:[ew])?brews|brews)|E(?:pireyarukku|br(?:a(?:anians|niyan)|ei))|Hebrajczykow|ibri\s*lokams|Heber\s*level|(?:Ibra(?:aniya|ni)a|(?:Ebr(?:(?:a(?:an(?:iya|y)|n(?:i(?:yy|e)|ee))|eeani)|iani)|Hebra(?:niy|ani)|Ibraany)a|Abraan(?:(?:iya|y)a|i[ao])|Ebra(?:ni(?:y(?:aa|[ou])|[ou])|ani(?:yu|[eo]))|Hebr(?:ania|eee)|Ebraniaa)n|Ibraaaniyon|Hebreohanon|Ibr(?:aaniya)?n|(?:Ibraanian|H(?:e[ew]breww|w(?:[ew])?breww|eb(?:r(?:e(?:ww|r)|aeo|r[eorw]|we)|e(?:r[eorw]|w[erw])|(?:ro|e[eo])[eor]|o[eor][eor]|w(?:er|re))|breww))s|E(?:b(?:r(?:a(?:an(?:ian)?|n(?:iya)?)|e(?:ean)?)?)?|vr)|Z(?:sid(?:ok(?:hoz)?)?|[iy]d)|Hebrejima|Ebranian|(?:Hebrej[ou]|Zid[ou])m|H(?:e(?:b(?:r(?:e[ow])?)?|pr)?|br)|Ibr(?:a(?:ni)?)?|Zydow|Evrei|ebri|Cib|ebr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Poslannja\s*apostola\s*Pavla\s*do\s*fylyp['’]jan|P(?:avlova\s*poslanica\s*Filipljanima|oslanica\s*Filipljanima|h(?:il(?:ip(?:p(?:ibeliekhez|er)|iaid|es)|(?:ipppi|(?:ippe|pi))ans|l(?:(?:ip(?:pian|ai?n|ian)|(?:ipp?ea|pp?ia)n)|lipian)s|ip(?:pian|(?:(?:ian|p[ai]n)|ai?n))s|ppians|pan)|lpp|p)|iliphphisiyuusa|il(?:ip(?:piyarukku|i)|p))|(?:Paulus(?:'\s*Brev\s*til\s*Filippern|’\s*(?:Brev\s*til\s*F|brev\s*til\s*f)ilippern)|Kirje\s*filippilaisill|Filip(?:(?:p(?:ilaiskirj|ern)|ianev)|pensern)|Filippilaisill)e|B(?:ref\s*Pals\s*til\s*Filippimanna|arua\s*kwa\s*Wafilipi)|Bref\s*Pals\s*til\s*Filippimann|Epistula\s*ad\s*Philippenses|Sulat\s*sa\s*mga\s*(?:Filipense|Pilip(?:ense|yano))|(?:Lettera\s*ai\s*)?Filippesi|(?:Layang\s*Paulus\s*F|Waf)ilipi|Waraka\s*kwa\s*Wafilipi|(?:Mga\s*Taga(?:-?(?:\s*[FP]ilipo|Filipo)|\s*[FP]ilipo)|Filip(?:iya|yu)nian|P(?:h(?:il(?:l(?:ip(?:pi?ai|aia|i(?:a[ai]|ea))|p(?:ie|a))|ippia[ai]|ippaia|ip(?:p?ie|ea)|ipaia|pai)n|il(?:l(?:ip(?:(?:pi[ei]|ii)|ppi)|l(?:ip[ip]i|pp?i))|ipp?ii|ppii|pppi|pe)an|il(?:ippain|lip(?:ie?n|p[ai]n)|ip[ei]n|pin)|lipp?ian)|ilipo)|Taga(?:-?(?:\s*[FP]ilipo|Filipo)|\s*[FP]ilipo)|Filip(?:(?:ense|o)|yan))s|List\s*(?:do\s*Filipian|Filip(?:ano|sky)m)|ad\s*Philippenses|F(?:(?:(?:(?:ili(?:p(?:perbrevet|en(?:sow|i)|ians)|boy)|l?p)|ilippiekhez)|lippiekhez)|ilipljanima)|Mga\s*Filipense|Mga\s*Pilip(?:ense|yano)|Philippenses|Ph(?:i(?:l(?:(?:ipppi|(?:ippe|pi))an|l(?:i(?:p(?:pian|ai?n|ian)|p?)|(?:ipp?ea|pp?ia)n|lipian)|ip(?:pian|(?:(?:ian|p[ai]n)|ai?n))|ppian|i(?:p(?:i|p)?)?|pp?)?)?|l(?:ipp?|p))|Filipenskym|(?:Filip(?:p(?:enze|aiyo|ia)|iy[ou]|y[eo])|Philipiu)n|F(?:ilip(?:iya|yu)n|(?:ili(?:p(?:i(?:an)?|pi)?)?|l))|Filipanom|Filipskym))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Dan"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Prophetia\s*Danielis|dani(?:yalko\s*pustak|el)|Danielin\s*kirja|(?:Ks(?:ieg[ai]\s*Danie|\.?\s*Danie)|Daanee)la|Liv\s*Danyel\s*la|D(?:an(?:iel(?:s\s*Bog|[ae])|iya(?:[ei]lh|l)|ya(?:[ei]lh|l)|e)|[ln])|Daniels\s*bok|daniyalko|D(?:aan(?:iyy|ye)e|an(?:i(?:yah|(?:ye|a))|y(?:ah|[ei]))|hanie)l|Da(?:n(?:iel(?:in?)?|iya[ei]l|ya[ei]l)?|an)?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Poslan(?:ica\s*Jude\s*apostola|nja\s*apostola\s*Judy)|(?:Judina\s*poslanic|(?:Lettera\s*di\s*)?Giud|yahuda(?:cem|ko)\s*patr|Barua\s*ya\s*Yud|Yehoozd|Yihuda)a|(?:Juudaksen\s*kirj|Yahoodaa-?y)e|Epistula\s*Iudae|J(?:ud(?:as(?:\s*epistel|arbref)|asbrevet|ov(?:\s*List|a)|[ey])|de|id)|List\s*sw\.\s*Judy|(?:Layang\s*Y|H)udas|List\s*sw\s*Judy|Jud(?:as(?:(?:'\s*B|\s*b)re|’\s*[Bb]re)|u)v|List\s*Jud(?:uv|y)|J(?:u(?:ud(?:aksen)?|d(?:ina|as?|ov))|wd)|yahuda(?:cem|ko)|San\s*Judas|Y(?:ah(?:oodaa?|uda)|a(?:huda|ahud)a|eh(?:udaa?|ooda)|u(?:da?|ud)|ihu)|Y(?:ah(?:oodah|uda[hi])|a(?:huda|ahud)ah|eh(?:udaa?h|ood(?:a[ahi]|eh))|udas)|(?:Y(?:uuda|d)|Jw?da)s|Iudae|Iuda|Gd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Se(?:cond(?:o\s*(?:libro\s*dei\s*)?Maccabei|\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|a\s*Maccabei)|gund(?:o\s*Mac(?:(?:cab(?:bee?os|ee?os)|abbee?os|abee?os)|abeus)|a\s*Macabeus)|cond\s*Mac(?:cabeee|abb?eee)s)|(?:Dru(?:g(?:a\s*(?:knjiga\s*o\s*Makabejcim|Ks(?:ieg[ai]\s*Machabejsk|\.?\s*Machabejsk))|i\s*Ks(?:ieg[ai]\s*Machabejsk|\.?\s*Machabejsk))|h[ay]\s*Makabejsk)|(?:II\.?\s*K|2\.?\s*K)s(?:ieg[ai]\s*Machabejsk|\.?\s*Machabejsk)|(?:II\.?\s*Makabej|2\.?\s*Makabej)sk)a|Kitabu\s*cha\s*Wamakabayo\s*II|Druh(?:a\s*kniha\s*Ma(?:ch|k)abejcov|y\s*(?:list\s*Ma(?:ch|k)abejcov|Ma(?:ch|k)abejcov)|a\s*Ma(?:ch|k)abejcov)|T(?:oinen\s*makkabilaiskirja|weede\s*Makkabeeen)|(?:I(?:kalawang\s*Mg|I\.?\s*Mg)a\s*Macabe|2\.?\s*Mga\s*Macabe)o|Liber\s*II\s*Maccabaeorum|(?:Liber\s*Maccabaeorum|Ma(?:chabaeorum|kkabeusok))\s*II|(?:Andra\s*Mackabeerbok|2\.\s*Mackabeerbok|2\s*Mackabeerbok|II\.?\s*Makkabee)en|(?:II\.?\s*m|2\.\s*m)akkabilaiskirja|(?:Deuxiemes?\s*Maccabee|2(?:eme\.|de?\.)\s*Maccabee|2(?:eme\s*|de?\s*)Maccabee|2e\.?\s*Maccabee|II\.?\s*Macabeu|2o\.\s*Macabeu|2\.?\s*Macabeu|2o\s*Macabeu)s|(?:Masodik\s*Makkabeu|(?:II\.?\s*Makkabeu|2\.?\s*Makkabeu))sok|Se(?:gundo\s*Mac(?:cab(?:bee?o|ee?o)|abbee?o|abee?o)|cond\s*Mac(?:(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|(?:cabeee|abb?eee)))|Ikalawang\s*Macabeos|2\s*makkabilaiskirja|Zweite(?:[nrs]\s*Makkabaee?r|\s*Makkabaee?r)|(?:Andre\s*Makkabeer|2\.?\s*Makkabeer)bok|Ikalawang\s*Macabeo|Onnur\s*Makkabeabok|2\s*k\.\s*Ma(?:ch|k)abejcov|2\.o\.?\s*Maccab(?:bee?os|ee?os)|(?:II(?:\.\s*Mach?aba|\s*Mach?aba)|(?:2\.\s*Macha|(?:2\.?\s*Maca|2\s*Macha))ba)eorum|2\.o\.?\s*Maccab(?:bee?o|ee?o)|Pili\s*Wamakabayo|(?:II\.?\s*Machabe|2\.?\s*Machabe)jcov|2\s*k\s*Ma(?:ch|k)abejcov|2nd\.?\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|(?:II(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|2nd\.?\s*Mac(?:cabeee|abb?eee)|2\.?\s*Maccab(?:bee?o|eo)|2\.?\s*Maccabee[eo]|2\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))s|2\.o\.?\s*Macab(?:bee?os|ee?os)|2o\.\s*Mac(?:cab(?:bee?os|ee?os)|abbee?os|abee?os)|2nd\.?\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|II(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|2nd\.?\s*Mac(?:cabeee|abb?eee)|2\.o\.?\s*Macab(?:bee?o|ee?o)|2o\.\s*Mac(?:cab(?:bee?o|ee?o)|abbee?o|abee?o)|II(?:\.\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s)))|(?:II\.?\s*W|2\.?\s*W)amakabayo|(?:II\.?\s*Makabej|2\.?\s*Makabej)cov|(?:II\.?\s*Maccc|2\.?\s*Maccc)abbbe|(?:(?:II\.?\s*Maccc|2\.?\s*Maccc)abb|(?:II\.?\s*Maccabbb|2\.?\s*Maccabbb))e[es]|(?:II\.?\s*Maccc|2\.?\s*Maccc)abe(?:e[es]|s)|(?:II\.?\s*Macabbb|2\.?\s*Macabbb)e(?:e[es]|s)|2o\s*Mac(?:cab(?:bee?os|ee?os)|abbee?os|abee?os)|2e\.?\s*Makkabeeen|II(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|(?:(?:II\.?\s*Maccc|2\.?\s*Maccc)abb|(?:II\.?\s*Maccabbb|2\.?\s*Maccabbb))e|(?:II\.?\s*Maccc|2\.?\s*Maccc)abee?|(?:II\.?\s*Macabbb|2\.?\s*Macabbb)ee?|2\.?\s*Maccab(?:bee?o|eo)|2o\s*Mac(?:cab(?:bee?o|ee?o)|abbee?o|abee?o)|2\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|2\.?\s*Makkabeeen|2\.?\s*Makkabaee?r|Wamakabayo\s*II|2\.?\s*Macc(?:ab(?:bee?|e))?|2\.?\s*Maccabee[eo]|2\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|2\.?\s*Maccabees|2\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|2a\.\s*Macabeus|2\.?\s*Maccabee|2\.?\s*Macab(?:bee?|ee?)|Masodik\s*Mak|2a\s*Macabeus|Andre\s*Makk|Tweede\s*Mak|(?:Anden\s*Mak|Pili\s*Ma)k|2\.?\s*Makabe|Druh[ay]\s*Mak|II\.?\s*Maccc|2\.?\s*Maccc|2(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:a(?:c(?:h|k)?)?|c)?|makk)|Makk?))|2e\.?\s*Mak|2(?:\s*Mc[bh]|Macc)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Tr(?:e(?:ca\s*knjiga\s*o\s*Makabejcim|ti\s*Makabejsk)|zeci(?:a\s*Ks(?:ieg[ai]\s*Machabejsk|\.?\s*Machabejsk)|\s*Ks(?:ieg[ai]\s*Machabejsk|\.?\s*Machabejsk)))|(?:III\.?\s*K|3\.?\s*K)s(?:ieg[ai]\s*Machabejsk|\.?\s*Machabejsk)|(?:III\.?\s*Makabej|3\.?\s*Makabej)sk)a|K(?:itabu\s*cha\s*Wamakabayo\s*III|olmas\s*makkabilaiskirja)|T(?:reti(?:a\s*(?:kniha\s*)?Machabejcov|\s*Machabejcov)|er(?:z(?:o\s*(?:libro\s*dei\s*)?Maccabei|a\s*Maccabei)|ce(?:r(?:o\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os))|\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os)))|ir[ao]\s*Macabeus))|roisiemes?\s*Maccabees|hird\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|hird\s*Mac(?:cabeee|abb?eee)s|atu\s*Wamakabayo)|Liber\s*III\s*Maccabaeorum|(?:Liber\s*Maccabaeorum|Ma(?:chabaeorum|kkabeusok))\s*III|(?:Tredje\s*Mackabeerbok|3(?:e\.?\s*Mack|\.\s*Mack)abeerbok|3\s*Mackabeerbok|III\.?\s*Makkabee)en|(?:III\.?\s*m|3\.\s*m)akkabilaiskirja|(?:I(?:katlong\s*Mg|II\.?\s*Mg)a\s*Macabe|3\.?\s*Mga\s*Macabe)o|Harmadik\s*Makkabeusok|(?:Tredje\s*Makkabeer|3\.?\s*Makkabeer)bok|T(?:ercer(?:o\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o)))|hird\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|hird\s*Mac(?:cabeee|abb?eee)|re(?:dje\s*Mak|ti\s*Ma)k)|D(?:ritte(?:[nrs]\s*Makkabaee?r|\s*Makkabaee?r)|erde\s*Makkabeeen)|3\s*makkabilaiskirja|(?:Ikatlong\s*Macabe|3o\.?\s*Macabee)os|(?:III(?:\.\s*Mach?aba|\s*Mach?aba)|(?:3\.\s*Macha|(?:3\.?\s*Maca|3\s*Macha))ba)eorum|(?:Ikatlong\s*Macabe|3o\.?\s*Macabee)o|(?:III\.?\s*Machabe|3\.?\s*Machabe)jcov|3\s*k\.\s*Machabejcov|(?:III(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|3rd\.\s*Mac(?:cabeee|abb?eee)|3\.?\s*Maccab(?:bee?o|eo)|3rd\s*Mac(?:cabeee|abb?eee)|3\.?\s*Maccabee[eo]|3\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|3o\.?\s*Macabeo)s|3\.o\.\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os))|(?:III\.?\s*Makkabeu|3\.?\s*Makkabeu)sok|III(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|3\.o\.\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|III(?:\.\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s)))|(?:III\.?\s*W|3\.?\s*W)amakabayo|(?:III\.?\s*Maccc|3\.?\s*Maccc)abbbe|(?:(?:III\.?\s*Maccc|3\.?\s*Maccc)abb|(?:III\.?\s*Maccabbb|3\.?\s*Maccabbb))e[es]|(?:III\.?\s*Maccc|3\.?\s*Maccc)abe(?:e[es]|s)|(?:III\.?\s*Macabbb|3\.?\s*Macabbb)e(?:e[es]|s)|3rd\.\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|3\s*k\s*Machabejcov|3o\.?\s*Maccab(?:bee?os|ee?os)|3\.o\s*Mac(?:cab(?:bee?os|ee?os)|ab(?:bee?os|ee?os))|(?:3eme\.\s*Maccabee|3eme\s*Maccabee|III\.?\s*Macabeu|3e\.?\s*Maccabee|3o\.?\s*Macabeu|3\.?\s*Macabeu)s|III(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|(?:(?:III\.?\s*Maccc|3\.?\s*Maccc)abb|(?:III\.?\s*Maccabbb|3\.?\s*Maccabbb))e|(?:III\.?\s*Maccc|3\.?\s*Maccc)abee?|(?:III\.?\s*Macabbb|3\.?\s*Macabbb)ee?|3rd\.\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|3rd\.\s*Mac(?:cabeee|abb?eee)|3o\.?\s*Maccab(?:bee?o|ee?o)|3\.o\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|3rd\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|3o\.?\s*Macabbee?os|3e\.?\s*Makkabeeen|Wamakabayo\s*III|3rd\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|3\.?\s*Maccab(?:bee?o|eo)|3rd\s*Mac(?:cabeee|abb?eee)|3o\.?\s*Macabbee?o|3\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|3\.?\s*Makkabeeen|3\.?\s*Makkabaee?r|3\.?\s*Macc(?:ab(?:bee?|e))?|3\.?\s*Maccabee[eo]|3\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|Harmadik\s*Mak|3\.?\s*Maccabees|3\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|3a\.\s*Macabeus|3\.?\s*Maccabee|3\.?\s*Macab(?:bee?|ee?)|3o\.?\s*Macabeo|3a\s*Macabeus|III\.?\s*Maccc|3\.?\s*Makabe|Derde\s*Mak|3\.?\s*Maccc|Tatu\s*Mak|3(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:ac(?:h|k)?|c)?|makk)|Makk?))|3e\.?\s*Mak|3(?:\s*Mc[bh]|Macc)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["4Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:C(?:zwarta\s*Ks(?:ieg[ai]\s*Machabejska|\.?\s*Machabejska)|tvrta\s*Makabejska)|Qua(?:rt(?:o\s*(?:libro\s*dei\s*)?Maccabei|a\s*Maccabei)|triemes?\s*Maccabees|rt[ao]\s*Macabeus)|Stvrta\s*(?:kniha\s*)?Machabejcov|Kitabu\s*cha\s*Wamakabayo\s*IV|(?:Neljas\s*m|(?:(?:IV\.?\s*m|4\.\s*m)|4\s*m))akkabilaiskirja|(?:IV\.?\s*K|4\.?\s*K)s(?:ieg[ai]\s*Machabejska|\.?\s*Machabejska)|(?:Fjarde\s*Mackabeerbok|4\.\s*Mackabeerbok|4\s*Mackabeerbok|IV\.?\s*Makkabee)en|Liber\s*IV\s*Maccabaeorum|(?:Liber\s*Maccabaeorum|Ma(?:chabaeorum|kkabeusok))\s*IV|(?:I(?:kaapat\s*Mg|V\.?\s*Mg)a\s*Macabe|4\.?\s*Mga\s*Macabe)o|F(?:jerde\s*Makkabeerbok|ourth\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s))))|(?:Cuarto\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|(?:Ikaapat\s*Macabe|4o\.?\s*Macabee)o|4\.o\.\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|IV(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|4o\.?\s*Maccab(?:bee?o|ee?o)|4\.o\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|4\.?\s*Maccab(?:bee?o|eo)|4o\.?\s*Macabbee?o|4\.?\s*Maccabee[eo]|4\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|4o\.?\s*Macabeo)s|Vier(?:te(?:[ns]\s*Makkabaee?r|\s*Makkabaee?r)|de\s*Makkabeeen)|Cuarto\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|F(?:ourth\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|jerde\s*Makk)|4\s*k\.\s*Machabejcov|(?:IV(?:\.\s*Mach?aba|\s*Mach?aba)|(?:4\.\s*Macha|(?:4\.?\s*Maca|4\s*Macha))ba)eorum|(?:Ikaapat\s*Macabe|4o\.?\s*Macabee)o|4\.o\.\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|4th\.\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|(?:IV\.?\s*Makkabeus|4\.?\s*Makkabeus)ok|4\.?\s*Makkabeerbok|4e(?:me)?\.\s*Maccabees|(?:IV\.?\s*Machabe|4\.?\s*Machabe)jcov|4\s*k\s*Machabejcov|IV(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|4o\.?\s*Maccab(?:bee?o|ee?o)|4\.o\s*Mac(?:cab(?:bee?o|ee?o)|ab(?:bee?o|ee?o))|4th\.\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|IV(?:\.\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s)))|(?:IV\.?\s*W|4\.?\s*W)amakabayo|Nne\s*Wamakabayo|(?:IV\.?\s*Makabej|4\.?\s*Makabej)ska|(?:IV\.?\s*Maccc|4\.?\s*Maccc)abbbe|(?:(?:IV\.?\s*Maccc|4\.?\s*Maccc)abb|(?:IV\.?\s*Maccabbb|4\.?\s*Maccabbb))e[es]|(?:IV\.?\s*Maccc|4\.?\s*Maccc)abe(?:e[es]|s)|(?:IV\.?\s*Macabbb|4\.?\s*Macabbb)e(?:e[es]|s)|4th\s*Mac(?:c(?:cabbbe|abe(?:ee?s|s))|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:e(?:ee?s|s)|be(?:e[es]|s))|e(?:ee?s|s)))|4e(?:me)?\s*Maccabees|IV(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|4\.?\s*Maccab(?:bee?o|eo)|4o\.?\s*Macabbee?o|(?:(?:IV\.?\s*Maccc|4\.?\s*Maccc)abb|(?:IV\.?\s*Maccabbb|4\.?\s*Maccabbb))e|(?:IV\.?\s*Maccc|4\.?\s*Maccc)abee?|(?:IV\.?\s*Macabbb|4\.?\s*Macabbb)ee?|4th\s*Mac(?:cabe(?:ee?)?|c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:e(?:ee?)?|bee?)|e(?:ee?)?)|cc?)?|4\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|4\.?\s*Makkabeeen|4\.?\s*Makkabaee?r|Wamakabayo\s*IV|4\.?\s*Macc(?:ab(?:bee?|e))?|4\.?\s*Maccabee[eo]|4\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|4\.?\s*Maccabees|4\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|(?:4o\.?\s*Macabeu|IV\.?\s*Macabeu|4a\.?\s*Macabeu|4\.?\s*Macabeu)s|4\.?\s*Maccabee|4\.?\s*Macab(?:bee?|ee?)|4o\.?\s*Macabeo|Ctvrta\s*Mak|Vierde\s*Mak|4\.?\s*Makabe|IV\.?\s*Maccc|4\.?\s*Maccc|4(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:ac(?:h|k)?|c)?|makk)|Makk?))|Nne\s*Mak|4(?:\s*Mc[bh]|Macc)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:(?:Ensimmainen\s*m|(?:(?:1\.\s*m|I\.?\s*m)|1\s*m))akkabilaiskirja|P(?:ierwsz[aey]\s*Ks(?:ieg[ai]\s*Machabejska|\.?\s*Machabejska)|r(?:(?:va\s*knjiga\s*o\s*Makabejcima|(?:im(?:o\s*(?:libro\s*dei\s*)?Maccabei|a\s*Maccabei)|v(?:(?:a\s*kniha\s*Mach|a\s*Ma(?:ch|k))abejcov|y\s*(?:list\s*)?Machabejcov)|emier(?:e?s|e?)\s*Maccabees|imeir[ao]\s*Macabeus))|vni\s*Makabejska))|(?:(?:Kitabu\s*cha\s*)?Wamakabayo|Makkabeusok)\s*I|F(?:orsta\s*Mackabeerboken|irst\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s)))|(?:1\.?\s*K|I\.?\s*K)s(?:ieg[ai]\s*Machabejska|\.?\s*Machabejska)|Liber\s*(?:I\s*Maccabaeorum|Maccabaeorum\s*I)|(?:Primer(?:o\s*Mac(?:cabb?ee|abb?ee)|\s*Mac(?:cabb?ee|abb?ee))|1\.o\.\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Maccabb?ee|1\.o\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Macabbee|1o\.?\s*Macabee)os|(?:Primer(?:o\s*Mac(?:cabb?ee|abb?ee)|\s*Mac(?:cabb?ee|abb?ee))|1\.o\.\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Maccabb?ee|1\.o\s*Mac(?:cabb?ee|abb?ee)|1o\.?\s*Macabbee|1o\.?\s*Macabee)o|(?:Fyrsta\s*Makkabeab|(?:(?:Elso\s*Makkabeu|(?:1\.?\s*Makkabeu|I\.?\s*Makkabeu))s|1\.?\s*Makkabeerb))ok|(?:Primer(?:o\s*Mac(?:cabb?eo|abb?eo)|\s*Mac(?:cabb?eo|abb?eo))|First\s*Mac(?:cabeee|abb?eee)|1st\.\s*Mac(?:cabeee|abb?eee)|1\.o\.\s*Mac(?:cabb?eo|abb?eo)|1\.?\s*Maccab(?:bee?o|eo)|I(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|1st\s*Mac(?:cabeee|abb?eee)|1o\.?\s*Maccabb?eo|1\.o\s*Mac(?:cabb?eo|abb?eo)|1\.?\s*Maccabee[eo]|1\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|1o\.?\s*Macabbeo|1o\.?\s*Macabeo)s|Primer(?:o\s*Mac(?:cabb?eo|abb?eo)|\s*Mac(?:cabb?eo|abb?eo))|Erste(?:[nrs]\s*Makkabaee?r|\s*Makkabaee?r)|(?:Eerste\s*Makkabee|1e\.\s*Makkabee|I\.?\s*Makkabee|1e\s*Makkabee)en|1\.\s*Mackabeerboken|(?:Kwanza\s*W|(?:1\.?\s*W|I\.?\s*W))amakabayo|Una(?:ng\s*M(?:ga\s*Macabeo|acabeos)|\s*M(?:ga\s*Macabeo|acabeos))|1\s*Mackabeerboken|1\s*k\.\s*Machabejcov|First\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|First\s*Mac(?:cabeee|abb?eee)|1st\.\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|1\s*k\s*Machabejcov|1(?:ere?|re)\.\s*Maccabees|(?:(?:1\.\s*Macha|(?:1\.?\s*Maca|1\s*Macha))ba|I(?:\.\s*Mach?aba|\s*Mach?aba))eorum|1st\.\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|1st\.\s*Mac(?:cabeee|abb?eee)|1\.o\.\s*Mac(?:cabb?eo|abb?eo)|1st\s*Mac(?:c(?:cabbbe|abee?s)|c(?:ca|ab)bbe[es]|c(?:ca|ab)be(?:e[es]|s)|ab(?:b(?:be(?:e[es]|s)|ee?s)|ee?s))|(?:1\.?\s*Machabe|I\.?\s*Machabe)jcov|1(?:ere?|re)\s*Maccabees|(?:1\.?\s*Mg|I\.?\s*Mg)a\s*Macabeo|Machabaeorum\s*I|1st\s*Mac(?:c(?:ca|ab)bbe|c(?:ca|ab)bee?|ab(?:b(?:bee?|ee?)|ee?)|cabee?|cc?)?|1\.?\s*Maccab(?:bee?o|eo)|I(?:\.\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o)))|\s*Mac(?:cab(?:(?:bee?o|eo)|ee[eo])|ab(?:be(?:e[eo]|o)|e(?:e[eo]|o))))|1st\s*Mac(?:cabeee|abb?eee)|1o\.?\s*Maccabb?eo|1\.o\s*Mac(?:cabb?eo|abb?eo)|Una(?:ng)?\s*Macabeo|1\.?\s*Maccab(?:be(?:e[es]|s)|e[is])|I(?:\.\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s))|\s*Mac(?:cab(?:(?:be(?:e[es]|s)|e[is])|ees)|ab(?:e(?:(?:aid|[is])|es)|bee?s)))|1\.?\s*Makkabaee?r|(?:1\.?\s*Maccc|I\.?\s*Maccc)abbbe|(?:(?:1\.?\s*Maccc|I\.?\s*Maccc)abb|(?:1\.?\s*Maccabbb|I\.?\s*Maccabbb))e[es]|(?:1\.?\s*Maccc|I\.?\s*Maccc)abe(?:e[es]|s)|(?:1\.?\s*Macabbb|I\.?\s*Macabbb)e(?:e[es]|s)|1\.?\s*Makkabeeen|(?:1\.?\s*Makabej|I\.?\s*Makabej)ska|1\.?\s*Macc(?:ab(?:bee?|e))?|I(?:\.\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?)|\s*Ma(?:c(?:c(?:ab(?:bee?|e))?|cabee|ab(?:bee?|ee?))?|k(?:abe|k)?))|(?:(?:1\.?\s*Maccc|I\.?\s*Maccc)abb|(?:1\.?\s*Maccabbb|I\.?\s*Maccabbb))e|(?:1\.?\s*Maccc|I\.?\s*Maccc)abee?|(?:1\.?\s*Macabbb|I\.?\s*Macabbb)ee?|1\.?\s*Maccabee[eo]|1\.?\s*Macab(?:be(?:e[eo]|o)|e(?:e[eo]|o))|1o\.?\s*Macabbeo|1\.?\s*Maccabees|1\.?\s*Macab(?:e(?:(?:aid|[is])|es)|bee?s)|(?:1o\.?\s*Macabeu|1a\.\s*Macabeu|1\.?\s*Macabeu|I\.?\s*Macabeu|1a\s*Macabeu)s|1\.?\s*Maccabee|1\.?\s*Macab(?:bee?|ee?)|1o\.?\s*Macabeo|E(?:erste|lso)\s*Mak|Kwanza\s*Mak|1\.?\s*Makabe|Prvni\s*Mak|Maccabees|1\.?\s*Maccc|I\.?\s*Maccc|1(?:\.\s*Ma(?:kk?|c)|\s*(?:(?:M(?:a(?:c(?:h|k)?)?|c)?|makk)|Makk?))|1e\.\s*Mak|1e\s*Mak|1(?:\s*Mc[bh]|Macc)))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mark"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:Mabuting\s*Balita\s*ayon\s*kay\s*(?:San\s*Mar[ck]|Mar[ck])o|E(?:(?:(?:banghelyo\s*ayon\s*kay\s*Marc|banghelyo\s*ni\s*(?:San\s*Mar[ck]|Mar[ck]))|vangelio\s*de\s*Marc)|l\s*Evangelio\s*de\s*Marc)o|S(?:ulat\s*ni\s*S)?an\s*Marco|M(?:ar(?:cou|koo|q(?:ou|uo))|rco))s|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k)|of\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k))|The\s*Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r)|of\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k)|of\s*(?:S(?:aint\s*M(?:ar|r?)k|t(?:\.\s*M(?:ar|r?)k|\s*M(?:ar|r?)k))|M(?:ar|r?)k))|Gospel\s*(?:according\s*to\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r)|of\s*(?:S(?:aint\s*Ma?r|t(?:\.\s*Ma?r|\s*Ma?r))|Ma?r))|Evan(?:keliumi\s*Markuksen\s*mukaan|gelium\s*secundum\s*Marcum)|Das\s*Evangelium\s*nach\s*Markus|Evangelie\s*volgens\s*Mar[ck]us|Evangeliet\s*etter\s*Markus|E(?:w(?:angelia\s*wg\s*sw)?\.|van(?:gelium\s*podle|jelium\s*Podla))\s*Marka|Evangelium\s*nach\s*Markus|M(?:(?:ar(?:k(?:u(?:ksen\s*evankeliumi|ss)|os|a)|c(?:oose|us)e|q(?:ose|uss)|cos|ek)|rk|[ck])|arkusevangelium)|Ewangelia\s*wg\s*sw\s*Marka|Jevanhelije\s*vid\s*Marka|Vangelo\s*di\s*(?:San\s*)?Marco|Mark(?:ovo|us)\s*evangelium|Ungjilli\s*i\s*Markut|Markusevangeliet|Injili\s*ya\s*Marko|Ewangelia\s*Marka|Injil\s*Markus|Saint\s*M(?:ar|r?)k|M(?:ar(?:k(?:u(?:ksen|s)?|o)?|c(?:oose|us)|c(?:o(?:os)?|u)?|q(?:oo?s|us)?)?|rc?)|Saint\s*Ma?r|Marqoosee|(?:Marqqoos|Ew\s*Mark)a|mark(?:usl|an)e|St\.\s*M(?:ar|r?)k|St\.\s*Ma?r|St\s*M(?:ar|r?)k|Marakus|Ew\s*Mar|markus|St\s*Ma?r))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jas"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Poslannja\s*apostola\s*Jakova|(?:Jakovljeva\s*poslanic|yak(?:obacem|ubko)\s*patr|List\s*sw\.?\s*Jakub)a|(?:Lettera\s*di\s*Giacom|(?:Sant|T)iag|Giacom)o|Waraka\s*wa\s*Yakobo|Epistula\s*Iacobi|Barua\s*ya\s*Yakobo|J(?:a(?:k(?:ob(?:(?:s\s*epistel|usbrief|it)|sbrevet)|ub(?:ov\s*List|a))|akobin\s*kirje|s)|(?:ame|m)s|k)|L(?:ayang\s*Yakobus|ist\s*Jakub(?:uv|a))|Jak(?:obs\s*[Bb]re|ubu)v|J(?:a(?:k(?:o(?:vljeva|b(?:us|i|s)?)|ub(?:ov)?)?|ak(?:obin)?|cq?|m)?|ame|m)|yak(?:obacem|ubko)|Y(?:a(?:aqoob(?:ey|[ai])|q(?:o(?:ob(?:e[ehy]|i)|ub)|ub(?:e[eh]|i))|(?:cquu|k(?:oo|u))b|kobo)|k)|Ya(?:aqoob|q(?:oob|ub)?|cq?|k)|Yaaqubi|(?:Ja(?:c?que|cobu)|Yakobu)s|Yaaqub|Jacobo|Ia(?:co(?:bi|v)|go)|Ia(?:c(?:ob)?|g)|Jakab|S(?:ant?|t)|Stg|G[cm]|Tg))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Amos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:(?:Aamoksen\s*kirj|Ks(?:ieg[ai]\s*Amos|\.?\s*Amos))a|Prophetia\s*Amos|Liv\s*Amos\s*la|A(?:m(?:(?:o(?:s(?:['’]\s*(?:Bog|bok)|[aeiz])|xa)|s)|oose)|amo(?:oo?se|use|s[es]))|A(?:am(?:o(?:ksen|oo?s|s))?|m(?:o(?:s|x)?)?)|Caamoos|A(?:mo(?:oo|u)|amoe)s|Caam|amos))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Tob"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Cartea\s*lui\s*Tobit|Ks(?:ieg[ai]\s*Tobi(?:asz|t)a|\.\s*Tobi(?:asz|t)a|\s*Tobi(?:asz|t)a)|Tobi(?:aa?n|tin)\s*kirja|Liber\s*T(?:hobis|obiae)|T(?:ob(?:i(?:as['’]\s*bok|ts(?:\s*(?:Bog|bok)|bok)|jas|olo|a?e)|t)|ho|b)|Tob(?:i(?:aa?n|t(?:in?)?|as?|ja)?)?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jdt"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:K(?:niha\s*Juditina|s(?:ieg[ai]\s*Judyty|\.?\s*Judyty)|itab\s*Yudit|\.\s*Juditina|\s*Juditina)|(?:Juditin\s*kirj|Giuditt)a|Liber\s*Iudith|J(?:ud(?:it(?:arbok|s\s*(?:Bog|bok)|[eh])|th)|di?th)|J(?:ud(?:it(?:in|a)?|t)|di?t)|Yud(?:ith?i|t)|Yudith?|Iudit[ah]|Judyty|(?:[GI]|Y)dt))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Proroctvo\s*Baruchovo|K(?:niha\s*Baru(?:ch|k)ova|s(?:ieg[ai]\s*Baruch|\.?\s*Baruch)a)|Baa?rukin\s*kirja|Kitab\s*Barukh|Liber\s*Baruch|B(?:aru(?:k(?:s(?:\s*(?:Bog|bok)|bok)|[hu])|cha|que|h)|r)|Ba(?:arukin|rukin|r(?:u(?:ch?|k))?)?))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:1(?:\.\s*(?:Ks|Re)|\s*(?:Ks|Re))|I(?:\.\s*K[is]|\s*K[is])))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:II\.?\s*Ks|2\.?\s*Re|2\.?\s*Ks))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Acts"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(At)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek", "Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ez)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hab", "Hag"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ha)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Heb", "Hab"],
        testament: "on",
        testament_books: { "Hab": "o", "Heb": "n" },
        regexp: /(?:^|(?<=[^\p{L}]))(Hb)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Jan|yo))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John", "Jonah", "Job", "Josh", "Joel"],
        testament: "on",
        testament_books: { "Job": "o", "Joel": "o", "John": "n", "Jonah": "o", "Josh": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(Jo)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Yun)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah", "Joel"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Yoo)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude", "Judg"],
        testament: "on",
        testament_books: { "Jude": "n", "Judg": "o" },
        regexp: /(?:^|(?<=[^\p{L}]))(J(?:ud?|d))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Judg"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Bir)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(La)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lev"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Im)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt", "Mark", "Mal"],
        testament: "on",
        testament_books: { "Mal": "o", "Mark": "n", "Matt": "n" },
        regexp: /(?:^|(?<=[^\p{L}]))(Ma)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mic"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Mi)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil", "Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Phl?|Fil))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rev"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Re)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rom"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(R)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Song"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:So(?:ngs|l)|歌))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Titus"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))(Ti)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zeph", "Zech"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))(Ze)(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      }
    ];
  }
};
var bcv_translations = class {
  constructor() {
    this.aliases = {
      asv: { system: "kjv" },
      ceb: { system: "ceb" },
      csb: { system: "csb" },
      hcsb: { system: "csb" },
      kjv: { system: "kjv" },
      lxx: { system: "nab" },
      nab: { system: "nab" },
      nabre: { system: "nab" },
      nas: { system: "default", osis: "NASB" },
      net: { system: "csb" },
      nirv: { system: "kjv" },
      niv: { system: "kjv" },
      nkjv: { system: "kjv" },
      nlt: { system: "nlt" },
      nrsv: { system: "nrsv" },
      nrsvue: { system: "nrsvue" },
      tniv: { system: "kjv" },
      // `current` reflects whatever versification system is active. By default, it matches `default`. It's always fully specified.
      current: { system: "current", osis: "" },
      // `default` is the fully specified default versification system (matching ESV).
      default: { system: "default", osis: "" }
    };
    this.current_system = "default";
    this.systems = {
      current: {},
      default: {
        order: {
          "Gen": 1,
          "Exod": 2,
          "Lev": 3,
          "Num": 4,
          "Deut": 5,
          "Josh": 6,
          "Judg": 7,
          "Ruth": 8,
          "1Sam": 9,
          "2Sam": 10,
          "1Kgs": 11,
          "2Kgs": 12,
          "1Chr": 13,
          "2Chr": 14,
          "Ezra": 15,
          "Neh": 16,
          "Esth": 17,
          "Job": 18,
          "Ps": 19,
          "Prov": 20,
          "Eccl": 21,
          "Song": 22,
          "Isa": 23,
          "Jer": 24,
          "Lam": 25,
          "Ezek": 26,
          "Dan": 27,
          "Hos": 28,
          "Joel": 29,
          "Amos": 30,
          "Obad": 31,
          "Jonah": 32,
          "Mic": 33,
          "Nah": 34,
          "Hab": 35,
          "Zeph": 36,
          "Hag": 37,
          "Zech": 38,
          "Mal": 39,
          "Matt": 40,
          "Mark": 41,
          "Luke": 42,
          "John": 43,
          "Acts": 44,
          "Rom": 45,
          "1Cor": 46,
          "2Cor": 47,
          "Gal": 48,
          "Eph": 49,
          "Phil": 50,
          "Col": 51,
          "1Thess": 52,
          "2Thess": 53,
          "1Tim": 54,
          "2Tim": 55,
          "Titus": 56,
          "Phlm": 57,
          "Heb": 58,
          "Jas": 59,
          "1Pet": 60,
          "2Pet": 61,
          "1John": 62,
          "2John": 63,
          "3John": 64,
          "Jude": 65,
          "Rev": 66,
          "Tob": 67,
          "Jdt": 68,
          "GkEsth": 69,
          "Wis": 70,
          "Sir": 71,
          "Bar": 72,
          "PrAzar": 73,
          "Sus": 74,
          "Bel": 75,
          "SgThree": 76,
          "EpJer": 77,
          "1Macc": 78,
          "2Macc": 79,
          "3Macc": 80,
          "4Macc": 81,
          "1Esd": 82,
          "2Esd": 83,
          "PrMan": 84
        },
        chapters: {
          "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
          "Exod": [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
          "Lev": [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
          "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
          "Deut": [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
          "Josh": [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
          "Judg": [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
          "Ruth": [22, 23, 18, 22],
          "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
          "2Sam": [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
          "1Kgs": [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
          "2Kgs": [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
          "1Chr": [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
          "2Chr": [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
          "Ezra": [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
          "Neh": [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
          "Esth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
          "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
          "Ps": [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
          "Prov": [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
          "Eccl": [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
          "Song": [17, 17, 11, 16, 16, 13, 13, 14],
          "Isa": [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
          "Jer": [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
          "Lam": [22, 22, 66, 22, 22],
          "Ezek": [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
          "Dan": [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
          "Hos": [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
          "Joel": [20, 32, 21],
          "Amos": [15, 16, 15, 13, 27, 14, 17, 14, 15],
          "Obad": [21],
          "Jonah": [17, 10, 10, 11],
          "Mic": [16, 13, 12, 13, 15, 16, 20],
          "Nah": [15, 13, 19],
          "Hab": [17, 20, 19],
          "Zeph": [18, 15, 20],
          "Hag": [15, 23],
          "Zech": [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
          "Mal": [14, 17, 18, 6],
          "Matt": [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
          "Mark": [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
          "Luke": [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
          "John": [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
          "Acts": [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
          "Rom": [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
          "1Cor": [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
          "Gal": [24, 21, 29, 31, 26, 18],
          "Eph": [23, 22, 21, 32, 33, 24],
          "Phil": [30, 30, 21, 23],
          "Col": [29, 23, 25, 18],
          "1Thess": [10, 20, 13, 18, 28],
          "2Thess": [12, 17, 18],
          "1Tim": [20, 15, 16, 16, 25, 21],
          "2Tim": [18, 26, 17, 22],
          "Titus": [16, 15, 15],
          "Phlm": [25],
          "Heb": [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
          "Jas": [27, 26, 18, 17, 20],
          "1Pet": [25, 25, 22, 19, 14],
          "2Pet": [21, 22, 18],
          "1John": [10, 29, 24, 21, 21],
          "2John": [13],
          "3John": [15],
          "Jude": [25],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 17, 15],
          "Jdt": [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25],
          "GkEsth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 13, 12, 6, 18, 19, 16, 24],
          "Wis": [16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31, 19, 29, 21, 25, 22],
          "Sir": [30, 18, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 34, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
          "Bar": [22, 35, 37, 37, 9],
          "PrAzar": [68],
          "Sus": [64],
          "Bel": [42],
          "SgThree": [39],
          "EpJer": [73],
          "1Macc": [64, 70, 60, 61, 68, 63, 50, 32, 73, 89, 74, 53, 53, 49, 41, 24],
          "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 45, 26, 46, 39],
          "3Macc": [29, 33, 30, 21, 51, 41, 23],
          "4Macc": [35, 24, 21, 26, 38, 35, 23, 29, 32, 21, 27, 19, 27, 20, 32, 25, 24, 24],
          "1Esd": [58, 30, 24, 63, 73, 34, 15, 96, 55],
          "2Esd": [40, 48, 36, 52, 56, 59, 70, 63, 47, 59, 46, 51, 58, 48, 63, 78],
          "PrMan": [15],
          "Ps151": [7]
          // Never actually a book; we add this to Psalms if needed.
        }
      },
      vulgate: {
        chapters: {
          "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 32, 25],
          "Exod": [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 36],
          "Lev": [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 45, 34],
          "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 34, 15, 34, 45, 41, 50, 13, 32, 22, 30, 35, 41, 30, 25, 18, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
          "Josh": [18, 24, 17, 25, 16, 27, 26, 35, 27, 44, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 43, 34, 16, 33],
          "Judg": [36, 23, 31, 24, 32, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 24],
          "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 43, 15, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
          "1Kgs": [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
          "1Chr": [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 46, 40, 14, 17, 29, 43, 27, 17, 19, 7, 30, 19, 32, 31, 31, 32, 34, 21, 30],
          "Neh": [11, 20, 31, 23, 19, 19, 73, 18, 38, 39, 36, 46, 31],
          "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 23, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 35, 28, 25, 16],
          "Ps": [6, 13, 9, 10, 13, 11, 18, 10, 39, 8, 9, 6, 7, 5, 10, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 26, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 13, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 26, 9, 10, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 11, 9, 14, 9, 6],
          "Eccl": [18, 26, 22, 17, 19, 11, 30, 17, 18, 20, 10, 14],
          "Song": [16, 17, 11, 16, 17, 12, 13, 14],
          "Jer": [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 20, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
          "Ezek": [28, 9, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
          "Dan": [21, 49, 100, 34, 31, 28, 28, 27, 27, 21, 45, 13, 65, 42],
          "Hos": [11, 24, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 15, 10],
          "Amos": [15, 16, 15, 13, 27, 15, 17, 14, 14],
          "Jonah": [16, 11, 10, 11],
          "Mic": [16, 13, 12, 13, 14, 16, 20],
          "Hag": [14, 24],
          "Matt": [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 26, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
          "Mark": [45, 28, 35, 40, 43, 56, 37, 39, 49, 52, 33, 44, 37, 72, 47, 20],
          "John": [51, 25, 36, 54, 47, 72, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
          "Acts": [26, 47, 26, 37, 42, 15, 59, 40, 43, 48, 30, 25, 52, 27, 41, 40, 34, 28, 40, 38, 40, 30, 35, 27, 27, 32, 44, 31],
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [25, 23, 25, 23, 28, 22, 20, 24, 12, 13, 21, 22, 23, 17],
          "Jdt": [12, 18, 15, 17, 29, 21, 25, 34, 19, 20, 21, 20, 31, 18, 15, 31],
          "Wis": [16, 25, 19, 20, 24, 27, 30, 21, 19, 21, 27, 27, 19, 31, 19, 29, 20, 25, 20],
          "Sir": [40, 23, 34, 36, 18, 37, 40, 22, 25, 34, 36, 19, 32, 27, 22, 31, 31, 33, 28, 33, 31, 33, 38, 47, 36, 28, 33, 30, 35, 27, 42, 28, 33, 31, 26, 28, 34, 39, 41, 32, 28, 26, 37, 27, 31, 23, 31, 28, 19, 31, 38, 13],
          "Bar": [22, 35, 38, 37, 9, 72],
          "1Macc": [67, 70, 60, 61, 68, 63, 50, 32, 73, 89, 74, 54, 54, 49, 41, 24],
          "2Macc": [36, 33, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 40]
        }
      },
      ceb: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 18, 15],
          "PrAzar": [67],
          "EpJer": [72],
          "1Esd": [55, 26, 24, 63, 71, 33, 15, 92, 55],
          "2Esd": [40, 48, 36, 52, 56, 59, 140, 63, 47, 60, 46, 51, 58, 48, 63, 78]
        }
      },
      csb: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
        }
      },
      kjv: {
        chapters: {
          "3John": [14]
        }
      },
      nab: {
        order: {
          "Gen": 1,
          "Exod": 2,
          "Lev": 3,
          "Num": 4,
          "Deut": 5,
          "Josh": 6,
          "Judg": 7,
          "Ruth": 8,
          "1Sam": 9,
          "2Sam": 10,
          "1Kgs": 11,
          "2Kgs": 12,
          "1Chr": 13,
          "2Chr": 14,
          "PrMan": 15,
          "Ezra": 16,
          "Neh": 17,
          "1Esd": 18,
          "2Esd": 19,
          "Tob": 20,
          "Jdt": 21,
          "Esth": 22,
          "GkEsth": 23,
          "1Macc": 24,
          "2Macc": 25,
          "3Macc": 26,
          "4Macc": 27,
          "Job": 28,
          "Ps": 29,
          "Prov": 30,
          "Eccl": 31,
          "Song": 32,
          "Wis": 33,
          "Sir": 34,
          "Isa": 35,
          "Jer": 36,
          "Lam": 37,
          "Bar": 38,
          "EpJer": 39,
          "Ezek": 40,
          "Dan": 41,
          "PrAzar": 42,
          "Sus": 43,
          "Bel": 44,
          "SgThree": 45,
          "Hos": 46,
          "Joel": 47,
          "Amos": 48,
          "Obad": 49,
          "Jonah": 50,
          "Mic": 51,
          "Nah": 52,
          "Hab": 53,
          "Zeph": 54,
          "Hag": 55,
          "Zech": 56,
          "Mal": 57,
          "Matt": 58,
          "Mark": 59,
          "Luke": 60,
          "John": 61,
          "Acts": 62,
          "Rom": 63,
          "1Cor": 64,
          "2Cor": 65,
          "Gal": 66,
          "Eph": 67,
          "Phil": 68,
          "Col": 69,
          "1Thess": 70,
          "2Thess": 71,
          "1Tim": 72,
          "2Tim": 73,
          "Titus": 74,
          "Phlm": 75,
          "Heb": 76,
          "Jas": 77,
          "1Pet": 78,
          "2Pet": 79,
          "1John": 80,
          "2John": 81,
          "3John": 82,
          "Jude": 83,
          "Rev": 84
        },
        chapters: {
          "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 54, 33, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
          "Exod": [22, 25, 22, 31, 23, 30, 29, 28, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 37, 30, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
          "Lev": [17, 16, 17, 35, 26, 23, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
          "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 35, 28, 32, 22, 29, 35, 41, 30, 25, 19, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
          "Deut": [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 31, 19, 29, 23, 22, 20, 22, 21, 20, 23, 29, 26, 22, 19, 19, 26, 69, 28, 20, 30, 52, 29, 12],
          "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
          "2Sam": [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
          "1Kgs": [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
          "2Kgs": [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
          "1Chr": [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
          "2Chr": [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
          "Neh": [11, 20, 38, 17, 19, 19, 72, 18, 37, 40, 36, 47, 31],
          "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 32, 26, 17],
          "Ps": [6, 11, 9, 9, 13, 11, 18, 10, 21, 18, 7, 9, 6, 7, 5, 11, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 27, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 14, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 20, 14, 9, 6],
          "Eccl": [18, 26, 22, 17, 19, 12, 29, 17, 18, 20, 10, 14],
          "Song": [17, 17, 11, 16, 16, 12, 14, 14],
          "Isa": [31, 22, 26, 6, 30, 13, 25, 23, 20, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 11, 25, 24],
          "Jer": [19, 37, 25, 31, 31, 30, 34, 23, 25, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
          "Ezek": [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 44, 37, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
          "Dan": [21, 49, 100, 34, 30, 29, 28, 27, 27, 21, 45, 13, 64, 42],
          "Hos": [9, 25, 5, 19, 15, 11, 16, 14, 17, 15, 11, 15, 15, 10],
          "Joel": [20, 27, 5, 21],
          "Jonah": [16, 11, 10, 11],
          "Mic": [16, 13, 12, 14, 14, 16, 20],
          "Nah": [14, 14, 19],
          "Zech": [17, 17, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
          "Mal": [14, 17, 24],
          "Acts": [26, 47, 26, 37, 42, 15, 60, 40, 43, 49, 30, 25, 52, 28, 41, 40, 34, 28, 40, 38, 40, 30, 35, 27, 27, 32, 44, 31],
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 17, 21, 6, 13, 18, 22, 18, 15],
          "Sir": [30, 18, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 33, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
          "Bar": [22, 35, 38, 37, 9, 72],
          "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 39]
        }
      },
      nlt: {
        chapters: {
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
        }
      },
      nrsv: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
        }
      },
      nrsvue: {
        chapters: {
          "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
          "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
          "Tob": [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 18, 15],
          "Bar": [22, 35, 38, 37, 9],
          "PrAzar": [67],
          "EpJer": [72],
          "1Esd": [55, 25, 23, 63, 70, 33, 15, 92, 55]
        }
      }
    };
    this.systems.current = structuredClone(this.systems.default);
  }
};
var peg$SyntaxError2 = class extends SyntaxError {
  constructor(message, expected, found, location) {
    super(message);
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
  }
  format(sources) {
    let str = "Error: " + this.message;
    if (this.location) {
      let src = null;
      const st = sources.find((s2) => s2.source === this.location.source);
      if (st) {
        src = st.text.split(/\r\n|\n|\r/g);
      }
      const s = this.location.start;
      const offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
      const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
      if (src) {
        const e = this.location.end;
        const filler = "".padEnd(offset_s.line.toString().length, " ");
        const line = src[s.line - 1];
        const last = s.line === e.line ? e.column : line.length + 1;
        const hatLen = last - s.column || 1;
        str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
      } else {
        str += "\n at " + loc;
      }
    }
    return str;
  }
  static buildMessage(expected, found) {
    function hex(ch) {
      return ch.codePointAt(0).toString(16).toUpperCase();
    }
    const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
    function unicodeEscape(s) {
      if (nonPrintable) {
        return s.replace(nonPrintable, (ch) => "\\u{" + hex(ch) + "}");
      }
      return s;
    }
    function literalEscape(s) {
      return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    function classEscape(s) {
      return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    const DESCRIBE_EXPECTATION_FNS = {
      literal(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      class(expectation) {
        const escapedParts = expectation.parts.map(
          (part) => Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part)
        );
        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
      },
      any() {
        return "any character";
      },
      end() {
        return "end of input";
      },
      other(expectation) {
        return expectation.description;
      }
    };
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      const descriptions = expected2.map(describeExpectation);
      descriptions.sort();
      if (descriptions.length > 0) {
        let j = 1;
        for (let i = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  }
};
function peg$parse2(input, options) {
  options = options !== void 0 ? options : {};
  const peg$FAILED = {};
  const peg$source = options.grammarSource;
  const peg$startRuleFunctions = {
    start: peg$parsestart
  };
  let peg$startRuleFunction = peg$parsestart;
  const peg$c0 = "(";
  const peg$c1 = ")";
  const peg$c2 = "";
  const peg$c3 = "/";
  const peg$c4 = ",";
  const peg$c5 = ".";
  const peg$c6 = "-";
  const peg$c7 = "$ordinal";
  const peg$c8 = "/1";
  const peg$c9 = "$ff_value";
  const peg$c10 = "$next_value";
  const peg$c11 = "/9";
  const peg$c12 = "/2";
  const peg$c13 = ".1";
  const peg$c14 = "$ab";
  const peg$c15 = "$c_explicit_value";
  const peg$c16 = "$c_sep_value";
  const peg$c17 = "$v_explicit_value";
  const peg$c18 = "$cv_sep";
  const peg$c19 = "$cv_sep_weak";
  const peg$c20 = "$sequence_sep_value";
  const peg$c21 = "$range_sep";
  const peg$c22 = "$title_value";
  const peg$c23 = "$in_book_of";
  const peg$c24 = "";
  const peg$c25 = "$integer_value";
  const peg$c26 = "$space";
  const peg$r0 = /^[1-8]/;
  const peg$r1 = /^[0-9]/;
  const peg$r2 = /^[([]/;
  const peg$r3 = /^[)\]]/;
  const peg$r4 = /^[^\x1F\x1E([]/;
  const peg$e0 = peg$literalExpectation("(", false);
  const peg$e1 = peg$literalExpectation(")", false);
  const peg$e2 = peg$literalExpectation("", false);
  const peg$e3 = peg$literalExpectation("/", false);
  const peg$e4 = peg$classExpectation([["1", "8"]], false, false, false);
  const peg$e5 = peg$literalExpectation(",", false);
  const peg$e6 = peg$literalExpectation(".", false);
  const peg$e7 = peg$literalExpectation("-", false);
  const peg$e8 = peg$literalExpectation("$ordinal", false);
  const peg$e9 = peg$literalExpectation("/1", false);
  const peg$e10 = peg$literalExpectation("$ff_value", false);
  const peg$e11 = peg$literalExpectation("$next_value", false);
  const peg$e12 = peg$literalExpectation("/9", false);
  const peg$e13 = peg$literalExpectation("/2", false);
  const peg$e14 = peg$literalExpectation(".1", false);
  const peg$e15 = peg$classExpectation([["0", "9"]], false, false, false);
  const peg$e16 = peg$literalExpectation("$ab", false);
  const peg$e17 = peg$literalExpectation("$c_explicit_value", false);
  const peg$e18 = peg$literalExpectation("$c_sep_value", false);
  const peg$e19 = peg$literalExpectation("$v_explicit_value", false);
  const peg$e20 = peg$literalExpectation("$cv_sep", false);
  const peg$e21 = peg$literalExpectation("$cv_sep_weak", false);
  const peg$e22 = peg$literalExpectation("$sequence_sep_value", false);
  const peg$e23 = peg$literalExpectation("$range_sep", false);
  const peg$e24 = peg$literalExpectation("$title_value", false);
  const peg$e25 = peg$literalExpectation("$in_book_of", false);
  const peg$e26 = peg$classExpectation(["(", "["], false, false, false);
  const peg$e27 = peg$classExpectation([")", "]"], false, false, false);
  const peg$e28 = peg$literalExpectation("", false);
  const peg$e29 = peg$literalExpectation("$integer_value", false);
  const peg$e30 = peg$classExpectation(["", "", "(", "["], true, false, false);
  const peg$e31 = peg$literalExpectation("$space", false);
  function peg$f0(val_1, sep_val, seq_post) {
    if (sep_val && sep_val.type && sep_val.type === "c_explicit") seq_post.explicit_context = "c";
    return [seq_post];
  }
  function peg$f1(val_1, val_2) {
    val_2.unshift([val_1]);
    const r = range();
    return { type: "sequence", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f2(sep_val_1, val_1, sep_val, seq_post) {
    if (sep_val && sep_val.type && sep_val.type === "c_explicit") seq_post.explicit_context = "c";
    return [seq_post];
  }
  function peg$f3(sep_val_1, val_1, val_2) {
    if (typeof val_2 === "undefined") val_2 = [];
    if (sep_val_1 && sep_val_1.type && sep_val_1.type === "c_explicit") val_1.explicit_context = "c";
    val_2.unshift([val_1]);
    const r = range();
    return { type: "sequence_post_enclosed", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f4(val_1, val_2) {
    if (val_1.length && val_1.length === 2) val_1 = val_1[0];
    const r = range();
    return { type: "range", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f5(val) {
    const r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f6(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f7(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f8(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f9(val_1, val_2) {
    const r = range();
    return { type: "bc_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f10(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f11(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f12(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f13(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f14(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f15(val_1, val_2) {
    return val_2.value[0].partial == null;
  }
  function peg$f16(val_1, val_2, val_3, val_4) {
    const r = range();
    return { type: "range", value: [{ type: "bcv", value: [{ type: "bc", value: [val_1, val_2], indices: [val_1.indices[0], val_2.indices[1]] }, val_3], indices: [val_1.indices[0], val_3.indices[1]] }, val_4], indices: [r.start, r.end - 1] };
  }
  function peg$f17(val_1, val_2) {
    const r = range();
    return { type: "bv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f18(val) {
    const r = range();
    return { type: "c", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f19(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f20(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f21(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f22(val_1, val_2, val_3) {
    const r = range();
    return { type: "cb_range", value: [val_3, val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f23(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f24(val_1, val_2) {
    const r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f25(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f26(val) {
    const r = range();
    return { type: "c_psalm", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f27(val_1, val_2) {
    const r = range();
    return { type: "cv_psalm", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f28(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f29(val_1, val_2) {
    const r = range();
    return { type: "c_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f30(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f31(val_1, val_2) {
    const r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f32(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f33(val_1, val_2) {
    const r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f34(val_1) {
    const r = range();
    return { type: "ff", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f35(val_1) {
    const r = range();
    return { type: "next_v", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f36(val_1, val_2) {
    const r = range();
    return { type: "integer_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f37(val) {
    const r = range();
    return { type: "context", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f38(val) {
    const r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f39(val) {
    const r = range();
    return { type: "bc", value: [val, { type: "c", value: [{ type: "integer", value: 151, indices: [r.end - 2, r.end - 1] }], indices: [r.end - 2, r.end - 1] }], indices: [r.start, r.end - 1] };
  }
  function peg$f40(val_1, val_2) {
    const r = range();
    return { type: "bcv", value: [val_1, { type: "v", value: [val_2], indices: [val_2.indices[0], val_2.indices[1]] }], indices: [r.start, r.end - 1] };
  }
  function peg$f41(val) {
    const r = range();
    return { type: "v", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f42() {
    return { type: "c_explicit" };
  }
  function peg$f43() {
    return { type: "c_explicit" };
  }
  function peg$f44() {
    return { type: "v_explicit" };
  }
  function peg$f45() {
    return "";
  }
  function peg$f46(val) {
    const r = range();
    return { type: "title", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f47(val) {
    const r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f48(val) {
    const r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f49(val) {
    const r = range();
    return { type: "translation", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f50(val_1, val_2) {
    const r = range();
    return { type: "integer", value: parseInt(val_1.join(""), 10), partial: val_2 != null ? val_2[1].join("") : null, indices: [r.start, r.end - 1] };
  }
  function peg$f51(val) {
    const r = range();
    return { type: "integer", value: parseInt(val.join(""), 10), indices: [r.start, r.end - 1] };
  }
  function peg$f52(val) {
    const r = range();
    return { type: "word", value: val.join(""), indices: [r.start, r.end - 1] };
  }
  function peg$f53(val) {
    const r = range();
    return { type: "stop", value: val, indices: [r.start, r.end - 1] };
  }
  let peg$currPos = options.peg$currPos | 0;
  let peg$savedPos = peg$currPos;
  const peg$posDetailsCache = [{ line: 1, column: 1 }];
  let peg$maxFailPos = peg$currPos;
  let peg$maxFailExpected = options.peg$maxFailExpected || [];
  let peg$silentFails = options.peg$silentFails | 0;
  let peg$result;
  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function offset() {
    return peg$savedPos;
  }
  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function expected(description, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location2
    );
  }
  function error(message, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message, location2);
  }
  function peg$getUnicode(pos = peg$currPos) {
    const cp = input.codePointAt(pos);
    if (cp === void 0) {
      return "";
    }
    return String.fromCodePoint(cp);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
    return { type: "class", parts, inverted, ignoreCase, unicode };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    let details = peg$posDetailsCache[pos];
    let p;
    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {
        }
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset2) {
    const startPosDetails = peg$computePosDetails(startPos);
    const endPosDetails = peg$computePosDetails(endPos);
    const res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset2 && peg$source && typeof peg$source.offset === "function") {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }
  function peg$fail(expected2) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected2);
  }
  function peg$buildSimpleError(message, location2) {
    return new peg$SyntaxError2(message, null, null, location2);
  }
  function peg$buildStructuredError(expected2, found, location2) {
    return new peg$SyntaxError2(
      peg$SyntaxError2.buildMessage(expected2, found),
      expected2,
      found,
      location2
    );
  }
  function peg$parsestart() {
    let s0, s1;
    s0 = [];
    s1 = peg$parsebcv_hyphen_range();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesequence();
      if (s1 === peg$FAILED) {
        s1 = peg$parsecb_range();
        if (s1 === peg$FAILED) {
          s1 = peg$parserange();
          if (s1 === peg$FAILED) {
            s1 = peg$parsenext_v();
            if (s1 === peg$FAILED) {
              s1 = peg$parseff();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebcv_comma();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsebc_title();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseps151_bcv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebcv();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsebcv_weak();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parseps151_bc();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsebc();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsecv_psalm();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsebv();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsec_psalm();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parseb();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecbv();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecbv_ordinal();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecb();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecb_ordinal();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsetranslation_sequence_enclosed();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsetranslation_sequence();
                                                if (s1 === peg$FAILED) {
                                                  s1 = peg$parsesequence_sep();
                                                  if (s1 === peg$FAILED) {
                                                    s1 = peg$parsec_title();
                                                    if (s1 === peg$FAILED) {
                                                      s1 = peg$parseinteger_title();
                                                      if (s1 === peg$FAILED) {
                                                        s1 = peg$parsecv();
                                                        if (s1 === peg$FAILED) {
                                                          s1 = peg$parsecv_weak();
                                                          if (s1 === peg$FAILED) {
                                                            s1 = peg$parseinteger();
                                                            if (s1 === peg$FAILED) {
                                                              s1 = peg$parsec();
                                                              if (s1 === peg$FAILED) {
                                                                s1 = peg$parsev();
                                                                if (s1 === peg$FAILED) {
                                                                  s1 = peg$parseword();
                                                                  if (s1 === peg$FAILED) {
                                                                    s1 = peg$parseword_parenthesis();
                                                                    if (s1 === peg$FAILED) {
                                                                      s1 = peg$parsecontext();
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsebcv_hyphen_range();
        if (s1 === peg$FAILED) {
          s1 = peg$parsesequence();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecb_range();
            if (s1 === peg$FAILED) {
              s1 = peg$parserange();
              if (s1 === peg$FAILED) {
                s1 = peg$parsenext_v();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseff();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebcv_comma();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebc_title();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseps151_bcv();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsebcv();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsebcv_weak();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parseps151_bc();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsebc();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsecv_psalm();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsebv();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsec_psalm();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parseb();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecbv();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecbv_ordinal();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsecb();
                                              if (s1 === peg$FAILED) {
                                                s1 = peg$parsecb_ordinal();
                                                if (s1 === peg$FAILED) {
                                                  s1 = peg$parsetranslation_sequence_enclosed();
                                                  if (s1 === peg$FAILED) {
                                                    s1 = peg$parsetranslation_sequence();
                                                    if (s1 === peg$FAILED) {
                                                      s1 = peg$parsesequence_sep();
                                                      if (s1 === peg$FAILED) {
                                                        s1 = peg$parsec_title();
                                                        if (s1 === peg$FAILED) {
                                                          s1 = peg$parseinteger_title();
                                                          if (s1 === peg$FAILED) {
                                                            s1 = peg$parsecv();
                                                            if (s1 === peg$FAILED) {
                                                              s1 = peg$parsecv_weak();
                                                              if (s1 === peg$FAILED) {
                                                                s1 = peg$parseinteger();
                                                                if (s1 === peg$FAILED) {
                                                                  s1 = peg$parsec();
                                                                  if (s1 === peg$FAILED) {
                                                                    s1 = peg$parsev();
                                                                    if (s1 === peg$FAILED) {
                                                                      s1 = peg$parseword();
                                                                      if (s1 === peg$FAILED) {
                                                                        s1 = peg$parseword_parenthesis();
                                                                        if (s1 === peg$FAILED) {
                                                                          s1 = peg$parsecontext();
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecb_range();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_hyphen_range();
      if (s1 === peg$FAILED) {
        s1 = peg$parserange();
        if (s1 === peg$FAILED) {
          s1 = peg$parsenext_v();
          if (s1 === peg$FAILED) {
            s1 = peg$parseff();
            if (s1 === peg$FAILED) {
              s1 = peg$parsebcv_comma();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebc_title();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseps151_bcv();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebcv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsebcv_weak();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseps151_bc();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsebc();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsecv_psalm();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsebv();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsec_psalm();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parseb();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parsecbv();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecbv_ordinal();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecb();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parsecb_ordinal();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsecontext();
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsec_sep();
      if (s4 === peg$FAILED) {
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesequence_post();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f0(s1, s4, s5);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsec_sep();
          if (s4 === peg$FAILED) {
            s4 = peg$parsesequence_sep();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsesequence_post();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f0(s1, s4, s5);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f1(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence_post_enclosed() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parsec_sep();
      if (s3 === peg$FAILED) {
        s3 = peg$parsesequence_sep();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesequence_post();
        if (s4 !== peg$FAILED) {
          s5 = [];
          s6 = peg$currPos;
          s7 = peg$parsec_sep();
          if (s7 === peg$FAILED) {
            s7 = peg$parsesequence_sep();
            if (s7 === peg$FAILED) {
              s7 = null;
            }
          }
          if (s7 !== peg$FAILED) {
            s8 = peg$parsesequence_post();
            if (s8 !== peg$FAILED) {
              peg$savedPos = s6;
              s6 = peg$f2(s3, s4, s7, s8);
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            s6 = peg$currPos;
            s7 = peg$parsec_sep();
            if (s7 === peg$FAILED) {
              s7 = peg$parsesequence_sep();
              if (s7 === peg$FAILED) {
                s7 = null;
              }
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$parsesequence_post();
              if (s8 !== peg$FAILED) {
                peg$savedPos = s6;
                s6 = peg$f2(s3, s4, s7, s8);
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          }
          s6 = peg$parsesp();
          if (input.charCodeAt(peg$currPos) === 41) {
            s7 = peg$c1;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f3(s3, s4, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence_post() {
    let s0;
    s0 = peg$parsesequence_post_enclosed();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecb_range();
      if (s0 === peg$FAILED) {
        s0 = peg$parsebcv_hyphen_range();
        if (s0 === peg$FAILED) {
          s0 = peg$parserange();
          if (s0 === peg$FAILED) {
            s0 = peg$parsenext_v();
            if (s0 === peg$FAILED) {
              s0 = peg$parseff();
              if (s0 === peg$FAILED) {
                s0 = peg$parsebcv_comma();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsebc_title();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseps151_bcv();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsebcv();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parsebcv_weak();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseps151_bc();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parsebc();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parsecv_psalm();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parsebv();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parsec_psalm();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parseb();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parsecbv();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsecbv_ordinal();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parsecb();
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$parsecb_ordinal();
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$parsec_title();
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$parseinteger_title();
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$parsecv();
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$parsecv_weak();
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$parseinteger();
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$parsec();
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$parsev();
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parserange() {
    let s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parsebcv_comma();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc_title();
      if (s1 === peg$FAILED) {
        s1 = peg$parseps151_bcv();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebcv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsebcv_weak();
            if (s1 === peg$FAILED) {
              s1 = peg$parseps151_bc();
              if (s1 === peg$FAILED) {
                s1 = peg$parsebc();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsecv_psalm();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsebv();
                    if (s1 === peg$FAILED) {
                      s1 = peg$currPos;
                      s2 = peg$parseb();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$currPos;
                        peg$silentFails++;
                        s4 = peg$currPos;
                        s5 = peg$parserange_sep();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsebcv_comma();
                          if (s6 === peg$FAILED) {
                            s6 = peg$parsebc_title();
                            if (s6 === peg$FAILED) {
                              s6 = peg$parseps151_bcv();
                              if (s6 === peg$FAILED) {
                                s6 = peg$parsebcv();
                                if (s6 === peg$FAILED) {
                                  s6 = peg$parsebcv_weak();
                                  if (s6 === peg$FAILED) {
                                    s6 = peg$parseps151_bc();
                                    if (s6 === peg$FAILED) {
                                      s6 = peg$parsebc();
                                      if (s6 === peg$FAILED) {
                                        s6 = peg$parsebv();
                                        if (s6 === peg$FAILED) {
                                          s6 = peg$parseb();
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                          if (s6 !== peg$FAILED) {
                            s5 = [s5, s6];
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                        peg$silentFails--;
                        if (s4 !== peg$FAILED) {
                          peg$currPos = s3;
                          s3 = void 0;
                        } else {
                          s3 = peg$FAILED;
                        }
                        if (s3 !== peg$FAILED) {
                          s2 = [s2, s3];
                          s1 = s2;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsecbv();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsecbv_ordinal();
                          if (s1 === peg$FAILED) {
                            s1 = peg$parsec_psalm();
                            if (s1 === peg$FAILED) {
                              s1 = peg$parsecb();
                              if (s1 === peg$FAILED) {
                                s1 = peg$parsecb_ordinal();
                                if (s1 === peg$FAILED) {
                                  s1 = peg$parsec_title();
                                  if (s1 === peg$FAILED) {
                                    s1 = peg$parseinteger_title();
                                    if (s1 === peg$FAILED) {
                                      s1 = peg$parsecv();
                                      if (s1 === peg$FAILED) {
                                        s1 = peg$parsecv_weak();
                                        if (s1 === peg$FAILED) {
                                          s1 = peg$parseinteger();
                                          if (s1 === peg$FAILED) {
                                            s1 = peg$parsec();
                                            if (s1 === peg$FAILED) {
                                              s1 = peg$parsev();
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parserange_sep();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenext_v();
        if (s3 === peg$FAILED) {
          s3 = peg$parseff();
          if (s3 === peg$FAILED) {
            s3 = peg$parsebcv_comma();
            if (s3 === peg$FAILED) {
              s3 = peg$parsebc_title();
              if (s3 === peg$FAILED) {
                s3 = peg$parseps151_bcv();
                if (s3 === peg$FAILED) {
                  s3 = peg$parsebcv();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parsebcv_weak();
                    if (s3 === peg$FAILED) {
                      s3 = peg$parseps151_bc();
                      if (s3 === peg$FAILED) {
                        s3 = peg$parsebc();
                        if (s3 === peg$FAILED) {
                          s3 = peg$parsecv_psalm();
                          if (s3 === peg$FAILED) {
                            s3 = peg$parsebv();
                            if (s3 === peg$FAILED) {
                              s3 = peg$parseb();
                              if (s3 === peg$FAILED) {
                                s3 = peg$parsecbv();
                                if (s3 === peg$FAILED) {
                                  s3 = peg$parsecbv_ordinal();
                                  if (s3 === peg$FAILED) {
                                    s3 = peg$parsec_psalm();
                                    if (s3 === peg$FAILED) {
                                      s3 = peg$parsecb();
                                      if (s3 === peg$FAILED) {
                                        s3 = peg$parsecb_ordinal();
                                        if (s3 === peg$FAILED) {
                                          s3 = peg$parsec_title();
                                          if (s3 === peg$FAILED) {
                                            s3 = peg$parseinteger_title();
                                            if (s3 === peg$FAILED) {
                                              s3 = peg$parsecv();
                                              if (s3 === peg$FAILED) {
                                                s3 = peg$parseinteger();
                                                if (s3 === peg$FAILED) {
                                                  s3 = peg$parsecv_weak();
                                                  if (s3 === peg$FAILED) {
                                                    s3 = peg$parsec();
                                                    if (s3 === peg$FAILED) {
                                                      s3 = peg$parsev();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f4(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseb() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 47) {
          s4 = peg$c3;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e3);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = input.charAt(peg$currPos);
          if (peg$r0.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e4);
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (input.charCodeAt(peg$currPos) === 31) {
          s4 = peg$c2;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e2);
          }
        }
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f5(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parsecv();
        peg$silentFails--;
        if (s5 !== peg$FAILED) {
          peg$currPos = s4;
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parsecv_sep();
        if (s2 === peg$FAILED) {
          s2 = peg$parsecv_sep_weak();
          if (s2 === peg$FAILED) {
            s2 = peg$parserange_sep();
            if (s2 === peg$FAILED) {
              s2 = peg$parsesp();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsec();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f6(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc_comma() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      if (input.charCodeAt(peg$currPos) === 44) {
        s3 = peg$c4;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e5);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsesp();
        s5 = peg$parsec();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f7(s1, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebc_title() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f8(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetitle();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f9(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv() {
    let s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s4 = peg$c5;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsev();
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecv();
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parsecv_sep();
        if (s4 === peg$FAILED) {
          s4 = peg$parsesequence_sep();
        }
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsev_explicit();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parsecv_sep();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f10(s1, s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_weak() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebc();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f11(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecv_sep_weak();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            s6 = peg$currPos;
            s7 = peg$parsecv_sep();
            if (s7 !== peg$FAILED) {
              s8 = peg$parsev();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            peg$silentFails--;
            if (s6 === peg$FAILED) {
              s5 = void 0;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f12(s1, s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_comma() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    s0 = peg$currPos;
    s1 = peg$parsebc_comma();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f13(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsesp();
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c4;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e5);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesp();
          s6 = peg$parsev();
          if (s6 !== peg$FAILED) {
            s7 = peg$currPos;
            peg$silentFails++;
            s8 = peg$currPos;
            s9 = peg$parsecv_sep();
            if (s9 !== peg$FAILED) {
              s10 = peg$parsev();
              if (s10 !== peg$FAILED) {
                s9 = [s9, s10];
                s8 = s9;
              } else {
                peg$currPos = s8;
                s8 = peg$FAILED;
              }
            } else {
              peg$currPos = s8;
              s8 = peg$FAILED;
            }
            peg$silentFails--;
            if (s8 === peg$FAILED) {
              s7 = void 0;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
            if (s7 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f14(s1, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebcv_hyphen_range() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c6;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parsespace();
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsec();
      if (s3 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s4 = peg$f15(s1, s3);
        if (s4) {
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 45) {
            s5 = peg$c6;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parsev();
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 45) {
                s7 = peg$c6;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e7);
                }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsev();
                if (s8 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f16(s1, s3, s6, s8);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebv() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecv_sep();
      if (s2 === peg$FAILED) {
        s2 = peg$parsecv_sep_weak();
        if (s2 === peg$FAILED) {
          s2 = peg$parserange_sep();
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parsesequence_sep();
            if (s3 !== peg$FAILED) {
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$parsev_explicit();
              peg$silentFails--;
              if (s5 !== peg$FAILED) {
                peg$currPos = s4;
                s4 = void 0;
              } else {
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
              s2 = peg$parsesp();
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsev();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f17(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f18(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f19(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsein_book_of();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseb();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f20(s2, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb_range() {
    let s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f21(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parserange_sep();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsec();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsein_book_of();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              s7 = peg$parseb();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f22(s2, s5, s7);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecbv() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecb();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f23(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecb_ordinal() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsec();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseordinal();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsec_explicit();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsein_book_of();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseb();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f24(s1, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseordinal() {
    let res;
    if (res = options.ordinal.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsecbv_ordinal() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecb_ordinal();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f25(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_psalm() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c8) {
          s3 = peg$c8;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e9);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f26(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_psalm() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_psalm();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesequence_sep();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsev_explicit();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsev();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f27(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_title() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f28(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsetitle();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f29(s2, s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parsec();
    if (s2 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s3 = peg$f30(s2);
      if (s3) {
        s3 = void 0;
      } else {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s6 = peg$c5;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parsev_explicit();
          if (s7 !== peg$FAILED) {
            s8 = peg$parsev();
            if (s8 !== peg$FAILED) {
              s6 = [s6, s7, s8];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$currPos;
          s6 = peg$parsecv_sep();
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          s7 = peg$parsev_explicit();
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 === peg$FAILED) {
            s5 = peg$parsecv_sep();
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parsev();
            if (s6 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f31(s2, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecv_weak() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsec();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$f32(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecv_sep_weak();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsev();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            s6 = peg$currPos;
            s7 = peg$parsecv_sep();
            if (s7 !== peg$FAILED) {
              s8 = peg$parsev();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            peg$silentFails--;
            if (s6 === peg$FAILED) {
              s5 = void 0;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f33(s1, s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseff() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsebcv();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_weak();
      if (s1 === peg$FAILED) {
        s1 = peg$parsebc();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecv();
            if (s1 === peg$FAILED) {
              s1 = peg$parsecv_weak();
              if (s1 === peg$FAILED) {
                s1 = peg$parseinteger();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsec();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsev();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parseff_value();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f34(s1);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseff_value() {
    let res;
    if (res = options.ff.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsenext_v() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsebcv();
    if (s1 === peg$FAILED) {
      s1 = peg$parsebcv_weak();
      if (s1 === peg$FAILED) {
        s1 = peg$parsebc();
        if (s1 === peg$FAILED) {
          s1 = peg$parsebv();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecv();
            if (s1 === peg$FAILED) {
              s1 = peg$parsecv_weak();
              if (s1 === peg$FAILED) {
                s1 = peg$parseinteger();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsec();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsev();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesp();
      s3 = peg$parsenext_value();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f35(s1);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsenext_value() {
    let res;
    if (res = options.next.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parseinteger_title() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseinteger();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsetitle();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f36(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecontext() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c11) {
          s3 = peg$c11;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e12);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f37(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_b() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 31) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c12) {
          s3 = peg$c12;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e13);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f38(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_bc() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parseps151_b();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c13) {
        s2 = peg$c13;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e14);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = input.charAt(peg$currPos);
        if (peg$r1.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e15);
          }
        }
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f39(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseps151_bcv() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parseps151_bc();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c5;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseinteger();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f40(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseab() {
    let res;
    if (res = options.ab.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsev() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parseinteger();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f41(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsec_explicit() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit_value();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f42();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsec_explicit_value() {
    let res;
    if (res = options.c_explicit.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsec_sep() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsec_sep_value();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f43();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsec_sep_value() {
    let res;
    if (res = options.c_sep.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsev_explicit() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsev_explicit_value();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f44();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsev_explicit_value() {
    let res;
    if (res = options.v_explicit.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsecv_sep() {
    let res;
    if (res = options.cv_sep.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsecv_sep_weak() {
    let res;
    if (res = options.cv_sep_weak.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsesequence_sep() {
    let res;
    if (res = options.sequence.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsesequence_sep_value() {
    let s0;
    if (input.substr(peg$currPos, 19) === peg$c20) {
      s0 = peg$c20;
      peg$currPos += 19;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e22);
      }
    }
    return s0;
  }
  function peg$parserange_sep() {
    let res;
    if (res = options.range.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsetitle() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsecv_sep();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesequence_sep();
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parsetitle_value();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f46(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetitle_value() {
    let res;
    if (res = options.title.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsein_book_of() {
    let res;
    if (res = options.in_book_of.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parsetranslation_sequence_enclosed() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = input.charAt(peg$currPos);
    if (peg$r2.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e26);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesp();
      s4 = peg$currPos;
      s5 = peg$parsetranslation();
      if (s5 !== peg$FAILED) {
        s6 = [];
        s7 = peg$currPos;
        s8 = peg$parsesequence_sep();
        if (s8 !== peg$FAILED) {
          s9 = peg$parsetranslation();
          if (s9 !== peg$FAILED) {
            s8 = [s8, s9];
            s7 = s8;
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
        } else {
          peg$currPos = s7;
          s7 = peg$FAILED;
        }
        while (s7 !== peg$FAILED) {
          s6.push(s7);
          s7 = peg$currPos;
          s8 = peg$parsesequence_sep();
          if (s8 !== peg$FAILED) {
            s9 = peg$parsetranslation();
            if (s9 !== peg$FAILED) {
              s8 = [s8, s9];
              s7 = s8;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
        }
        s5 = [s5, s6];
        s4 = s5;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesp();
        s6 = input.charAt(peg$currPos);
        if (peg$r3.test(s6)) {
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e27);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f47(s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation_sequence() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parsesp();
    s2 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 44) {
      s3 = peg$c4;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e5);
      }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parsesp();
      s3 = [s3, s4];
      s2 = s3;
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = peg$currPos;
    s4 = peg$parsetranslation();
    if (s4 !== peg$FAILED) {
      s5 = [];
      s6 = peg$currPos;
      s7 = peg$parsesequence_sep();
      if (s7 !== peg$FAILED) {
        s8 = peg$parsetranslation();
        if (s8 !== peg$FAILED) {
          s7 = [s7, s8];
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      } else {
        peg$currPos = s6;
        s6 = peg$FAILED;
      }
      while (s6 !== peg$FAILED) {
        s5.push(s6);
        s6 = peg$currPos;
        s7 = peg$parsesequence_sep();
        if (s7 !== peg$FAILED) {
          s8 = peg$parsetranslation();
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      }
      s4 = [s4, s5];
      s3 = s4;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f48(s3);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslation() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 30) {
      s1 = peg$c24;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e28);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseany_integer();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 30) {
          s3 = peg$c24;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f49(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseinteger() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parseinteger_value();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parsesp();
      s4 = peg$parseab();
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f50(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseinteger_value() {
    let res;
    if (res = /^[0-9]{1,3}(?![0-9]|,000)/.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  function peg$parseany_integer() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r1.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e15);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r1.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e15);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f51(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseword() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r4.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e30);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r4.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e30);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f52(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseword_parenthesis() {
    let s0, s1;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r2.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e26);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f53(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsesp() {
    let s0;
    s0 = peg$parsespace();
    if (s0 === peg$FAILED) {
      s0 = null;
    }
    return s0;
  }
  function peg$parsespace() {
    let res;
    if (res = options.space.exec(input.substring(peg$currPos))) {
      peg$savedPos = peg$currPos;
      peg$currPos += res[0].length;
      return [res[0]];
    } else {
      return peg$FAILED;
    }
  }
  peg$result = peg$startRuleFunction();
  const peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
  function peg$throw() {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
      peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
  if (options.peg$library) {
    return (
      /** @type {any} */
      {
        peg$result,
        peg$currPos,
        peg$FAILED,
        peg$maxFailExpected,
        peg$maxFailPos,
        peg$success,
        peg$throw: peg$success ? void 0 : peg$throw
      }
    );
  }
  if (peg$success) {
    return peg$result;
  } else {
    peg$throw();
  }
}
var bcv_parser = class {
  constructor(lang = null) {
    this.passage = new bcv_passage();
    this.entities = [];
    this.options = new bcv_options(this);
    if (lang == null) {
      if (typeof grammar === "undefined") {
        throw `When creating a new bcv_parser object using ES Modules, please provide a language object. For example, here's how to provide English:
import * as lang from "es/lang/en.js";
const bcv = new bcv_parser(lang);`;
      }
      this.translations = new bcv_translations();
      this.matcher = new bcv_matcher(this, grammar_options);
      this.regexps = new bcv_regexps();
      this.translations = new bcv_translations();
    } else {
      this.matcher = new bcv_matcher(this, lang.grammar_options);
      this.regexps = new lang.regexps();
      this.translations = new lang.translations();
    }
    this.passage = new bcv_passage(this.options, this.translations);
    this.regexps_manager = new bcv_regexps_manager(this);
    this.translations_manager = new bcv_translations_manager(this);
  }
  // ## Parse-Related Functions
  // Parse a string and prepare the object for further interrogation, depending on what's needed.
  parse(string_to_parse) {
    this.reset();
    string_to_parse = this.matcher.replace_control_characters(string_to_parse);
    [string_to_parse, this.passage.books] = this.matcher.match_books(string_to_parse);
    string_to_parse = this.matcher.replace_non_ascii_numbers(string_to_parse);
    [this.entities] = this.matcher.match_passages(string_to_parse);
    return this;
  }
  // Parse a string and prepare the object for further interrogation, depending on what's needed. The second argument is a string that serves as the context for the first argument. If there's a valid partial match at the beginning of the first argument, then it will parse it using the supplied `context`. For example, `parse_string_with_context("verse 2", "Genesis 3").osis()` = `Gen.3.2`. You'd use this when you have some text that looks like it's a partial reference, and you already know the context.
  parse_with_context(string_to_parse, context_string) {
    this.reset();
    [context_string, this.passage.books] = this.matcher.match_books(this.matcher.replace_control_characters(context_string));
    context_string = this.matcher.replace_non_ascii_numbers(context_string);
    let [entities, context] = this.matcher.match_passages(context_string);
    this.reset();
    string_to_parse = this.matcher.replace_control_characters(string_to_parse);
    [string_to_parse, this.passage.books] = this.matcher.match_books(string_to_parse);
    this.passage.books.push({
      value: "",
      parsed: "",
      start_index: 0,
      type: "context",
      context
    });
    string_to_parse = "" + (this.passage.books.length - 1) + "/9" + string_to_parse;
    [this.entities] = this.matcher.match_passages(string_to_parse);
    return this;
  }
  reset() {
    this.entities = [];
    this.passage.books = [];
    this.passage.indices = {};
  }
  // ## Options-Related Functions
  // Override default options.
  set_options(options) {
    if (options.include_apocrypha != null) {
      this.include_apocrypha(options.include_apocrypha);
      delete options.include_apocrypha;
    }
    for (const [key, value] of Object.entries(options)) {
      if (key in this.options) {
        this.options[key] = value;
      }
    }
    return this;
  }
  // Legacy way to indicate that the Apocrypha should be included in the list of books.
  include_apocrypha(arg) {
    const old_value = this.options.testaments;
    let new_value = old_value;
    if (arg === true && old_value.indexOf("a") === -1) {
      new_value = new_value + "a";
    } else if (arg === false && old_value.indexOf("a") >= 1) {
      new_value = new_value.slice(0, -1);
    }
    if (new_value !== old_value) {
      this.options.testaments = new_value;
    }
    return this;
  }
  // ## Administrative Functions
  // Return translation information so that we don't have to reach into semi-private objects to grab the data we need.
  translation_info(translation = "default") {
    return this.translations_manager.translation_info(translation);
  }
  // ## Output-Related Functions
  // Return a single OSIS string (comma-separated) for all the references in the whole input string.
  osis() {
    const out = [];
    for (const osis of this.parsed_entities()) {
      if (osis.osis.length > 0) {
        out.push(osis.osis);
      }
    }
    return out.join(",");
  }
  // Return an array of `[OSIS, TRANSLATIONS]` for each reference (combined according to various options).
  osis_and_translations() {
    const out = [];
    for (const osis of this.parsed_entities()) {
      if (osis.osis.length > 0) {
        out.push([osis.osis, osis.translations.join(",")]);
      }
    }
    return out;
  }
  // Return an array of `{osis: OSIS, indices:[START, END], translations: [TRANSLATIONS]}` objects for each reference (combined according to `options`).
  osis_and_indices() {
    const out = [];
    for (const osis of this.parsed_entities()) {
      if (osis.osis.length > 0) {
        out.push({
          osis: osis.osis,
          translations: osis.translations,
          indices: osis.indices
        });
      }
    }
    return out;
  }
  // Return all objects, probably for additional processing.
  parsed_entities() {
    let out = [];
    this.entities.forEach((entity, entity_id) => {
      if (entity.type && entity.type === "translation_sequence" && out.length > 0 && entity_id === out[out.length - 1].entity_id + 1) {
        out[out.length - 1].indices[1] = entity.absolute_indices[1];
      }
      if (entity.passages == null) {
        return;
      }
      if (entity.type === "b" && this.options.book_alone_strategy === "ignore" || entity.type === "b_range" && this.options.book_range_strategy === "ignore" || entity.type === "context") {
        return;
      }
      let translations = [];
      let system = "";
      if (entity.passages[0].translations) {
        for (const translation of entity.passages[0].translations) {
          const translation_osis = translation.osis && translation.osis.length > 0 ? translation.osis : "";
          if (system === "") {
            system = translation.system;
          }
          translations.push(translation_osis);
        }
      } else {
        translations = [""];
        system = "current";
      }
      let osises = this.parse_entity_passages(entity, entity_id, translations, system);
      if (osises.length === 0) {
        return;
      }
      if (osises.length > 1 && this.options.consecutive_combination_strategy === "combine") {
        osises = this.combine_consecutive_passages(osises, system);
      }
      if (this.options.sequence_combination_strategy === "separate") {
        out = out.concat(osises);
      } else {
        const strings = [];
        const last_i = osises.length - 1;
        if (osises[last_i].enclosed_indices && osises[last_i].enclosed_indices[1] >= 0) {
          entity.absolute_indices[1] = osises[last_i].enclosed_indices[1];
        }
        for (const osis of osises) {
          if (osis.osis.length > 0) {
            strings.push(osis.osis);
          }
        }
        out.push({
          osis: strings.join(","),
          indices: entity.absolute_indices,
          translations,
          entity_id,
          entities: osises
        });
      }
    });
    return out;
  }
  parse_entity_passages(entity, entity_id, translations, system) {
    const osises = [];
    const length = entity.passages.length;
    const include_old_testament = this.options.testaments.indexOf("o") >= 0;
    entity.passages.forEach((passage, i) => {
      if (!passage.type) {
        passage.type = entity.type;
      }
      if (passage.valid.valid === false) {
        if (this.options.invalid_sequence_strategy === "ignore" && entity.type === "sequence") {
          this.snap_sequence("ignore", entity, osises, i, length);
        }
        if (this.options.invalid_passage_strategy === "ignore") {
          return;
        }
      }
      if ((passage.type === "b" || passage.type === "b_range") && this.options.book_sequence_strategy === "ignore" && entity.type === "sequence") {
        this.snap_sequence("book", entity, osises, i, length);
        return;
      }
      if (include_old_testament === false && (passage.start.b === "Ps" && (passage.start.c != null && passage.start.c < 151) && passage.end.b === "Ps" && (passage.end.c != null && passage.end.c < 151))) {
        return;
      }
      if ((passage.type === "b_range_start" || passage.type === "range_end_b") && this.options.book_range_strategy === "ignore") {
        this.snap_range(entity, i);
      }
      if (!passage.absolute_indices) {
        passage.absolute_indices = [...entity.absolute_indices];
      }
      osises.push({
        osis: passage.valid.valid ? this.to_osis(passage.start, passage.end, system) : "",
        type: passage.type,
        indices: passage.absolute_indices,
        translations,
        start: passage.start,
        end: passage.end,
        enclosed_indices: passage.enclosed_absolute_indices,
        entity_id,
        entities: [passage]
      });
    });
    return osises;
  }
  // Takes OSIS objects and converts them to OSIS strings based on compaction preferences. It maniplates the original `start` and `end` objects.
  to_osis(start, end, translation) {
    if (end.c == null && end.v == null && start.c == null && start.v == null && start.b === end.b && this.options.book_alone_strategy === "first_chapter") {
      end.c = 1;
    }
    const osis = { start: "", end: "" };
    if (start.c == null) {
      start.c = 1;
    }
    if (start.v == null) {
      start.v = 1;
    }
    if (this.options.versification_system.includes("a") && this.options.ps151_strategy === "b" && (start.c === 151 && start.b === "Ps" || end.c === 151 && end.b === "Ps")) {
      this.fix_ps151(start, end, translation);
    }
    const chapter_array = this.passage.translations.systems[translation]?.chapters[end.b] || this.passage.translations.systems.current.chapters[end.b];
    const compaction_strategy = this.options.osis_compaction_strategy;
    const existence_strategy = this.options.passage_existence_strategy;
    if (end.c == null) {
      if (existence_strategy.includes("c") || chapter_array && chapter_array.length === 1) {
        end.c = chapter_array.length;
      } else {
        end.c = 999;
      }
    }
    if (end.v == null) {
      if (chapter_array && chapter_array[end.c - 1] && existence_strategy.includes("v")) {
        end.v = chapter_array[end.c - 1];
      } else {
        end.v = 999;
      }
    }
    const get_partial = compaction_strategy.includes("p") && (start.p != null || end.p != null);
    if ((compaction_strategy === "b" || compaction_strategy === "bp") && start.c === 1 && start.v === 1 && get_partial === false && (end.c === 999 && end.v === 999 || end.c === chapter_array.length && existence_strategy.includes("c") && (end.v === 999 || end.v === chapter_array[end.c - 1] && existence_strategy.includes("v")))) {
      osis.start = start.b;
      osis.end = end.b;
    } else if (start.v === 1 && get_partial === false && compaction_strategy.includes("v") === false && (end.v === 999 || end.v === chapter_array[end.c - 1] && existence_strategy.includes("v"))) {
      osis.start = start.b + "." + start.c;
      osis.end = end.b + "." + end.c;
    } else {
      osis.start = start.b + "." + start.c + "." + start.v;
      osis.end = end.b + "." + end.c + "." + end.v;
      if (get_partial) {
        if (start.p != null) {
          osis.start += "!" + start.p;
        }
        if (end.p != null) {
          osis.end += "!" + end.p;
        }
      }
    }
    let out = "";
    if (osis.start === osis.end) {
      out = osis.start;
    } else {
      out = osis.start + "-" + osis.end;
    }
    if (start.extra) {
      out = start.extra + "," + out;
    }
    if (end.extra) {
      out += "," + end.extra;
    }
    return out;
  }
  // If we want to treat Ps151 as a book rather than a chapter, we have to do some gymnastics to make sure it returns properly.
  fix_ps151(start, end, translation) {
    const old_system = this.options.versification_system;
    this.options.versification_system = translation;
    const new_system = this.options.versification_system;
    if (start.c === 151 && start.b === "Ps") {
      if (end.c === 151 && end.b === "Ps") {
        start.b = "Ps151";
        start.c = 1;
        end.b = "Ps151";
        end.c = 1;
      } else {
        start.extra = this.to_osis(
          { b: "Ps151", c: 1, v: start.v },
          { b: "Ps151", c: 1, v: this.translations.systems.current.chapters["Ps151"][0] },
          translation
        );
        start.b = "Prov";
        start.c = 1;
        start.v = 1;
      }
    } else {
      end.extra = this.to_osis(
        { b: "Ps151", c: 1, v: 1 },
        { b: "Ps151", c: 1, v: end.v },
        translation
      );
      end.c = 150;
      end.v = this.translations.systems.current.chapters["Ps"][149];
    }
    if (old_system !== new_system) {
      this.options.versification_system = old_system;
    }
  }
  // If we have the correct `option` set (checked before calling this function), merge passages that refer to sequential verses: Gen 1, 2 -> Gen 1-2. It works for any combination of books, chapters, and verses.
  combine_consecutive_passages(osises, translation) {
    const out = [];
    let prev = {};
    const last_i = osises.length - 1;
    let enclosed_sequence_start = -1;
    let has_enclosed = false;
    osises.forEach((osis, i) => {
      if (osis.osis.length > 0) {
        const prev_i = out.length - 1;
        let is_enclosed_last = false;
        if (osis.enclosed_indices[0] !== enclosed_sequence_start) {
          enclosed_sequence_start = osis.enclosed_indices[0];
        }
        if (enclosed_sequence_start >= 0 && (i === last_i || osises[i + 1].enclosed_indices[0] !== osis.enclosed_indices[0])) {
          is_enclosed_last = true;
          has_enclosed = true;
        }
        if (this.is_verse_consecutive(prev, osis.start, translation)) {
          out[prev_i].end = osis.end;
          out[prev_i].is_enclosed_last = is_enclosed_last;
          out[prev_i].indices[1] = osis.indices[1];
          out[prev_i].enclosed_indices[1] = osis.enclosed_indices[1];
          out[prev_i].osis = this.to_osis(out[prev_i].start, osis.end, translation);
        } else {
          out.push(osis);
        }
        prev = { b: osis.end.b, c: osis.end.c, v: osis.end.v };
      } else {
        out.push(osis);
        prev = {};
      }
    });
    if (has_enclosed) {
      this.snap_enclosed_indices(out);
    }
    return out;
  }
  // If there's an enclosed reference--e.g., Ps 1 (2)--and we've combined consecutive passages in such a way that the enclosed reference is fully inside the sequence (i.e., if it starts before the enclosed sequence), then make sure the end index for the passage includes the necessary closing punctuation.
  snap_enclosed_indices(osises) {
    for (const osis of osises) {
      if (osis.is_enclosed_last != null) {
        if (osis.enclosed_indices[0] < 0 && osis.is_enclosed_last) {
          osis.indices[1] = osis.enclosed_indices[1];
        }
        delete osis.is_enclosed_last;
      }
    }
    return osises;
  }
  /* Given two fully specified objects (complete bcvs), find whether they're sequential.
  * Same book, same chapter, and next verse (e.g., Gen.1.1 followed by Gen.1.2)
  * Same book, next chapter, and first verse if the previous chapter ended properly (e.g., Gen.1.31 followed by Gen.2.1)
  * Next book, first chapter, and first verse if the previous book ended properly (e.g., Mal.4.6 followed by Matt.1.1)
  */
  is_verse_consecutive(prev, check, translation) {
    if (!prev.b) {
      return false;
    }
    const translation_order = this.passage.translations.systems[translation]?.order || this.passage.translations.systems.current.order;
    const chapter_array = this.passage.translations.systems[translation]?.chapters?.[prev.b] || this.passage.translations.systems.current.chapters[prev.b];
    if (prev.b === check.b) {
      if (prev.c === check.c) {
        return prev.v === check.v - 1;
      } else if (check.v === 1 && prev.c === check.c - 1) {
        const prev_chapter_verse_count = chapter_array[prev.c - 1];
        return prev.v === prev_chapter_verse_count;
      }
    } else if (check.c === 1 && check.v === 1 && translation_order[prev.b] === translation_order[check.b] - 1) {
      return prev.c === chapter_array.length && prev.v === chapter_array[prev.c - 1];
    }
    return false;
  }
  // Snap the start/end index of the range when it includes a book on its own and `this.options.book_range_strategy` is `ignore`.
  snap_range(entity, passage_i) {
    let entity_i = 0;
    let source_entity = "start";
    let type = "range_end_b";
    if (entity.original_type === "b_range_start") {
      entity.type = entity.original_type;
      delete entity.original_type;
    }
    if (entity.type === "b_range_start" || entity.type === "sequence" && entity.passages[passage_i].type === "b_range_start") {
      entity_i = 1;
      source_entity = "end";
      type = "b_range_start";
    }
    const target_entity = source_entity === "end" ? "start" : "end";
    for (const obj_type of [source_entity, target_entity]) {
      if (entity.passages[passage_i][obj_type].original_object != null) {
        entity.passages[passage_i][obj_type] = entity.passages[passage_i][obj_type].original_object;
      }
    }
    const original_target = structuredClone(entity.passages[passage_i][target_entity]);
    entity.passages[passage_i][target_entity] = structuredClone(entity.passages[passage_i][source_entity]);
    entity.passages[passage_i][target_entity].original_object = original_target;
    entity.passages[passage_i][source_entity].original_object = structuredClone(entity.passages[passage_i][source_entity]);
    if (entity.type === "sequence") {
      if (passage_i >= entity.value.length) {
        passage_i = entity.value.length - 1;
      }
      const pluck = this.passage.pluck(type, entity.value[passage_i]);
      if (pluck != null) {
        const temp = this.snap_range(pluck, 0);
        if (passage_i === 0) {
          entity.absolute_indices[0] = temp.absolute_indices[0];
        } else {
          entity.absolute_indices[1] = temp.absolute_indices[1];
        }
      }
    } else {
      entity.original_type = entity.type;
      entity.type = entity.value[entity_i].type;
      entity.absolute_indices = [
        entity.value[entity_i].absolute_indices[0],
        entity.value[entity_i].absolute_indices[1]
      ];
    }
    return entity;
  }
  // Snap the start/end index of the entity or surrounding passages when there's a lone book or invalid item in a sequence.
  snap_sequence(type, entity, osises, i, length) {
    const passage = entity.passages[i];
    if (passage.absolute_indices[0] === entity.absolute_indices[0] && i < length - 1 && this.get_snap_sequence_i(entity.passages, i, length) !== i) {
      entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0];
      this.remove_absolute_indices(entity.passages, i + 1);
    } else if (passage.absolute_indices[1] === entity.absolute_indices[1] && i > 0) {
      entity.absolute_indices[1] = osises.length > 0 ? osises[osises.length - 1].indices[1] : entity.passages[i - 1].absolute_indices[1];
    } else if (type === "book" && i < length - 1 && !this.starts_with_book(entity.passages[i + 1])) {
      entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0];
    }
  }
  // Identify whether there are any valid items between the current item and the next book.
  get_snap_sequence_i(passages, passage_i, length) {
    for (let i = passage_i + 1; i < length; i++) {
      if (this.starts_with_book(passages[i])) {
        return i;
      }
      if (passages[i].valid.valid) {
        return passage_i;
      }
    }
    return passage_i;
  }
  // Given a passage, does it start with a book? It never takes a sequence as an argument.
  starts_with_book(passage) {
    if (passage.type.substring(0, 1) === "b") {
      return true;
    }
    if ((passage.type === "range" || passage.type === "ff") && passage.start && passage.start.type && passage.start.type.substring(0, 1) === "b") {
      return true;
    }
    return false;
  }
  // Remove absolute indices from the given passage to the end of the sequence. We do this when we don't want to include the end of a sequence in the sequence (most likely because it's invalid or a book on its own).
  remove_absolute_indices(passages, passage_i) {
    if (passages[passage_i].enclosed_absolute_indices[0] < 0) {
      return;
    }
    const [start, end] = passages[passage_i].enclosed_absolute_indices;
    const passages_length = passages.length;
    for (const passage of passages.slice(passage_i)) {
      if (passage.enclosed_absolute_indices[0] === start && passage.enclosed_absolute_indices[1] === end) {
        passage.enclosed_absolute_indices = [-1, -1];
      } else {
        break;
      }
    }
  }
  add_books(books) {
    return this.regexps_manager.add_books(books);
  }
  add_translations(translations) {
    return this.translations_manager.add_translations(translations);
  }
};
var grammar_options = {
  ab: /^(?:[a-e])(?!\p{L})/iu,
  and: /^(?:and|compare|cf\.?|see\s+also|also|see|&)/i,
  c_explicit: /^[\s*]*(?:chapters|chapter|chapts\.?|chpts\.?|chapt\.?|chaps\.?|chap\.?|chp\.?|chs\.?|cha\.?|ch\.?)[\s*]*/i,
  c_sep_eu: /^\x1f\x1f\x1f/i,
  c_sep_us: /^\x1f\x1f\x1f/i,
  cv_sep_weak: /^(?:[\s*]*["'][\s*]*|[\s*])+/i,
  cv_sep_eu: /^[\s*]*,+[\s*]*/i,
  cv_sep_us: /^[\s*]*(?::+|\.(?!\s*\.\s*\.))[\s*]*/i,
  ff: /^[\s*]*(?:ff(?![a-z0-9])|f(?![a-z0-9]))(?![\p{L}\p{N}])(?:\.(?!\s*\.))?/iu,
  in_book_of: /^[\s*]*(?:from|of|in)[\s*]*(?:the[\s*]*book[\s*]*of[\s*]*)?/i,
  next: /^(?:\x1f\x1f\x1f)/i,
  ordinal: /^(?:th|st|nd|rd)/i,
  range: /^[\s*]*(?:[\-–—]|through|thru|to)+[\s*]*/i,
  sequence_eu: /^(?:[;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|and|compare|cf\.?|see\s+also|also|see)+/i,
  sequence_us: /^(?:[,;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|and|compare|cf\.?|see\s+also|also|see)+/i,
  space: /^[\s*]+/,
  title: /^[\s*]*(?:title)(?!\p{L})[\s*]*/iu,
  v_explicit: /^[\s*]*(?:verses|verse|ver\.?|vss\.?|vs\.?|vv\.?|v\.?)[\s*]*(?!\p{L})/iu
};
var grammar = { parse: peg$parse2 };

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
  const peg$c16 = "$c_sep";
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
  const peg$e18 = peg$literalExpectation("$c_sep", false);
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
  function peg$f0(val_1, val_2) {
    val_2.unshift([val_1]);
    var r = range();
    return { type: "sequence", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f1(val_1, val_2) {
    if (typeof val_2 === "undefined") val_2 = [];
    val_2.unshift([val_1]);
    var r = range();
    return { type: "sequence_post_enclosed", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f2(val_1, val_2) {
    if (val_1.length && val_1.length === 2) val_1 = val_1[0];
    var r = range();
    return { type: "range", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f3(val) {
    var r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f4(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f5(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f6(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f7(val_1, val_2) {
    var r = range();
    return { type: "bc_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f8(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f9(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f10(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f11(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f12(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f13(val_1, val_2) {
    return val_2.value[0].partial == null;
  }
  function peg$f14(val_1, val_2, val_3, val_4) {
    var r = range();
    return { type: "range", value: [{ type: "bcv", value: [{ type: "bc", value: [val_1, val_2], indices: [val_1.indices[0], val_2.indices[1]] }, val_3], indices: [val_1.indices[0], val_3.indices[1]] }, val_4], indices: [r.start, r.end - 1] };
  }
  function peg$f15(val_1, val_2) {
    var r = range();
    return { type: "bv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f16(val) {
    var r = range();
    return { type: "c", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f17(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f18(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f19(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f20(val_1, val_2, val_3) {
    var r = range();
    return { type: "cb_range", value: [val_3, val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f21(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f22(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f23(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f24(val) {
    var r = range();
    return { type: "c_psalm", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f25(val_1, val_2) {
    var r = range();
    return { type: "cv_psalm", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f26(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f27(val_1, val_2) {
    var r = range();
    return { type: "c_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f28(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f29(val_1, val_2) {
    var r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f30(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f31(val_1, val_2) {
    var r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f32(val_1) {
    var r = range();
    return { type: "ff", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f33(val_1) {
    var r = range();
    return { type: "next_v", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f34(val_1, val_2) {
    var r = range();
    return { type: "integer_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f35(val) {
    var r = range();
    return { type: "context", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f36(val) {
    var r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f37(val) {
    var r = range();
    return { type: "bc", value: [val, { type: "c", value: [{ type: "integer", value: 151, indices: [r.end - 2, r.end - 1] }], indices: [r.end - 2, r.end - 1] }], indices: [r.start, r.end - 1] };
  }
  function peg$f38(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, { type: "v", value: [val_2], indices: [val_2.indices[0], val_2.indices[1]] }], indices: [r.start, r.end - 1] };
  }
  function peg$f39(val) {
    var r = range();
    return { type: "v", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f40() {
    return { type: "c_explicit" };
  }
  function peg$f41() {
    return { type: "v_explicit" };
  }
  function peg$f42() {
    return "";
  }
  function peg$f43(val) {
    var r = range();
    return { type: "title", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f44(val) {
    var r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f45(val) {
    var r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f46(val) {
    var r = range();
    return { type: "translation", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f47(val_1, val_2) {
    var r = range();
    return { type: "integer", value: parseInt(val_1.join(""), 10), partial: val_2 != null ? val_2[1].join("") : null, indices: [r.start, r.end - 1] };
  }
  function peg$f48(val) {
    var r = range();
    return { type: "integer", value: parseInt(val.join(""), 10), indices: [r.start, r.end - 1] };
  }
  function peg$f49(val) {
    var r = range();
    return { type: "word", value: val.join(""), indices: [r.start, r.end - 1] };
  }
  function peg$f50(val) {
    var r = range();
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
      if (s4 !== peg$FAILED) {
        s5 = peg$parsecb_range();
        if (s5 === peg$FAILED) {
          s5 = peg$parserange();
          if (s5 === peg$FAILED) {
            s5 = peg$parsecv_psalm();
            if (s5 === peg$FAILED) {
              s5 = peg$parsec_psalm();
              if (s5 === peg$FAILED) {
                s5 = peg$parsecbv();
                if (s5 === peg$FAILED) {
                  s5 = peg$parsecbv_ordinal();
                  if (s5 === peg$FAILED) {
                    s5 = peg$parsecb();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parsecb_ordinal();
                      if (s5 === peg$FAILED) {
                        s5 = peg$parsec_title();
                        if (s5 === peg$FAILED) {
                          s5 = peg$parsecv();
                          if (s5 === peg$FAILED) {
                            s5 = peg$parsec();
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
        s3 = peg$currPos;
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsesequence_post();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsec_sep();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecb_range();
            if (s5 === peg$FAILED) {
              s5 = peg$parserange();
              if (s5 === peg$FAILED) {
                s5 = peg$parsecv_psalm();
                if (s5 === peg$FAILED) {
                  s5 = peg$parsec_psalm();
                  if (s5 === peg$FAILED) {
                    s5 = peg$parsecbv();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parsecbv_ordinal();
                      if (s5 === peg$FAILED) {
                        s5 = peg$parsecb();
                        if (s5 === peg$FAILED) {
                          s5 = peg$parsecb_ordinal();
                          if (s5 === peg$FAILED) {
                            s5 = peg$parsec_title();
                            if (s5 === peg$FAILED) {
                              s5 = peg$parsecv();
                              if (s5 === peg$FAILED) {
                                s5 = peg$parsec();
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
            s3 = peg$currPos;
            s4 = peg$parsesequence_sep();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            s5 = peg$parsesequence_post();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f0(s1, s2);
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
      s3 = peg$parsesequence_sep();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      s4 = peg$parsesequence_post();
      if (s4 !== peg$FAILED) {
        s5 = [];
        s6 = peg$currPos;
        s7 = peg$parsesequence_sep();
        if (s7 === peg$FAILED) {
          s7 = null;
        }
        s8 = peg$parsesequence_post();
        if (s8 !== peg$FAILED) {
          s7 = [s7, s8];
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          s6 = peg$currPos;
          s7 = peg$parsesequence_sep();
          if (s7 === peg$FAILED) {
            s7 = null;
          }
          s8 = peg$parsesequence_post();
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
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
          s0 = peg$f1(s4, s5);
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
          s0 = peg$f2(s1, s3);
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
          s0 = peg$f3(s2);
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
          s0 = peg$f5(s1, s5);
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
      s2 = peg$f6(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetitle();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f7(s1, s3);
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
            s0 = peg$f8(s1, s4);
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
      s2 = peg$f9(s1);
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
      s2 = peg$f11(s1);
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
              s0 = peg$f12(s1, s6);
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
        s4 = peg$f13(s1, s3);
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
                  s0 = peg$f14(s1, s3, s6, s8);
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
          s0 = peg$f15(s1, s3);
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
      s0 = peg$f16(s2);
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
        s3 = peg$f17(s2);
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
            s0 = peg$f18(s2, s5);
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
        s3 = peg$f19(s2);
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
                s0 = peg$f20(s2, s5, s7);
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
          s0 = peg$f21(s1, s4);
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
            s0 = peg$f22(s1, s5);
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
          s0 = peg$f24(s2);
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
  function peg$parsec_title() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f26(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsetitle();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f27(s2, s4);
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
      s3 = peg$f28(s2);
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
              s0 = peg$f29(s2, s6);
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
      s2 = peg$f30(s1);
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
              s0 = peg$f31(s1, s4);
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
        s0 = peg$f32(s1);
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
        s0 = peg$f33(s1);
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
        s0 = peg$f34(s1, s2);
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
          s0 = peg$f35(s2);
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
          s0 = peg$f36(s2);
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
          s0 = peg$f37(s1);
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
          s0 = peg$f38(s1, s3);
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
      s0 = peg$f39(s2);
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
      s1 = peg$f40();
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
      s1 = peg$f41();
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
      s0 = peg$f43(s2);
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
          s0 = peg$f44(s4);
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
      s0 = peg$f45(s3);
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
          s0 = peg$f46(s2);
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
      s0 = peg$f47(s1, s2);
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
      s1 = peg$f48(s1);
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
      s1 = peg$f49(s1);
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
      s1 = peg$f50(s1);
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
      // No leading space. This content is returned as-is with a `bcvp` `osis_compaction_strategy`.
      ab: /^[a-e](?!\p{L})/iu,
      and: /^&/,
      c_explicit: /^[\s*]*(?:chapters?|cha?pts?\.?|chaps?\.?|ch[aps]?\.?)[\s*]*/i,
      c_sep: /^\x1f\x1f\x1f/,
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
    const regexp = new RegExp(pre_regexp.source + "(" + texts_for_regexp.map((translation) => translation.replace(/([$\\.*+?()\[\]{}|^])/g, "\\$1")).join("|") + ")" + post_regexp.source, "gi");
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
    this.languages = ["el"];
    this.translations = [/SEPT(?:UAGINT)?\b/gi];
    // Beginning of string or not in the middle of a word or immediately following another book. Only count a book if it's part of a sequence: `Matt5John3` is OK, but not `1Matt5John3`.
    // Start with an inverted book/chapter (cb). The last one doesn't allow plural since it's a single chapter.
    // Then move onto a book, which is the anchor for everything.
    // The `/\d+\x1f` is for special Psalm chapters.
    // The `(?:ο\s+τ[ίι]τλος|ο\s+τ[ίι]τλοσ|τ[ίι]τλος|τ[ίι]τλοσ)` has `[a-z]` instead of `\w` because it could be followed by a number.
    // [α-ε] allows `1:1a`.
    this.escaped_passage = /(?:^|[^\x1e\x1f\p{L}\p{N}])((?:(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:[\u2013\u2014\-]|through|thru|to)\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:ch(?:apters?|a?pts?\.?|a?p?s?\.?)?\s*\d+\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*)|(?:\d+(?:th|nd|st)\s*ch(?:apter|a?pt\.?|a?p?\.?)?\s*(?:from|of|in)(?:\s+the\s+book\s+of)?\s*))?\x1f(\d+)(?:\/\d+)?\x1f(?:\/\d+\x1f|[\d\s.:,;\x1e\x1f&\(\)（）\[\]\\/"'\*=~\-–—]|(?:ο\s+τ[ίι]τλος|ο\s+τ[ίι]τλοσ|τ[ίι]τλος|τ[ίι]τλοσ)(?![a-z])|και\s+μετ[άα]|κεφ[άα]λαιον|κεφ[άα]λαια|κεφ[άα]λαιο|στ[ίι]χος|στ[ίι]χοι|στ[ίι]χοσ|κεφ|και|-|[α-ε](?!\w)|$)+)/giu;
    // These are the only valid ways to end a potential passage match. The closing parenthesis allows for fully capturing parentheses surrounding translations (ESV**)**. The last one, `[\d\x1f]` needs not to be +; otherwise `Gen5ff` becomes `\x1f0\x1f5ff`, and `adjust_regexp_end` matches the `\x1f5` and incorrectly dangles the ff. \uff09 is a full-width closing parenthesis.
    this.match_end_split = /\d\W*(?:ο\s+τ[ίι]τλος|ο\s+τ[ίι]τλοσ|τ[ίι]τλος|τ[ίι]τλοσ)|\d\W*και\s+μετ[άα](?:[\s*]*\.)?|\d[\s*]*[α-ε](?!\w)|\x1e(?:[\s*]*[)\]\uff09])?|[\d\x1f]/gi;
    this.control = /[\x1e\x1f]/g;
    // These are needed for ranges outside of this class.
    this.first = /Α['’΄ʹʹ]\.?\s*/;
    this.second = /Β['’΄ʹʹ]\.?\s*/;
    this.third = /Γ['’΄ʹʹ]\.?\s*/;
    this.range_and = /(?:[&\u2013\u2014-]|και|-)/;
    this.range_only = /(?:[\u2013\u2014-]|-)/;
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
        regexp: /(?:^|(?<=[^\p{L}]))((?:Γ(?:ε(?:ν(?:εσ(?:ις|η))?)?|έν(?:εσ(?:ις|η))?)|Gen))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Exod"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Εξοδος|Έξοδος|Exod|Εξ|Ἔξ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bel"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Β(?:ηλ(?:\s*και\s*Δρ[άα]κων)?|ὴλ)|Bel))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lev"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Λε(?:υ(?:[ιϊ]τ(?:ικ[οό]ν?)?)?)?|Lev))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Num"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Αριθμο[ίι]|Αρ(?:ιθ)?|Num|Ἀρ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sir"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Σ(?:οφ[ίι]α\s*Σ(?:ειρ[άα]χ|ιραχ)|ειρ[άα]χ)|Sir))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Wis"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Σοφ(?:[ίι]α(?:\s*Σ(?:ολ(?:ομ[ωώ]ντος)?|αλωμ[ωώ]ντος))?)?|Wis))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Lam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Θρ(?:[ήη]νοι(?:\s*Ιερεμ[ίι]ου)?)?|Lam))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["EpJer"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Επιστολ(?:η\s*Ιερεμ[ίι]ου|ή\s*Ιερεμ[ίι]ου|[ηὴ]\s*᾿Ιερ)|EpJer))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rev"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Αποκ(?:άλυψ(?:ις\s*Ιω[άα]ννου|η)|αλ(?:υψ(?:(?:ις\s*Ιω[άα]ννου|η)|εις)|ύψεις))|Απ(?:οκ)?|Rev|᾿Απ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrMan"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Πρ(?:οσευχ[ήη]\s*Μανασσ[ήη]|\s*Μαν)|PrMan))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Deut"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Δε(?:υτ(?:ερ(?:ον[οό]μιον?)?)?)?|Deut))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Josh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ιησ(?:ο[υύ]ς\s*του\s*Ναυ[ήη]|\s*Ναυ[ήη])|Ιη(?:σ\s*Ναυ)?|Josh|Ἰη))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Judg"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Κρ(?:ιτ(?:α[ίι]|[έε]ς)?)?|Judg))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ruth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ruth|Ρουθ|῾Ρθ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Α['ʹʹ΄’]\s*[ΈΕ]σδρας|[ΈΕ]σδρας\s*Α['ʹʹ΄’]|Α['ʹʹ΄’]\s*[ΈΕ]σδρ?|1Esd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Esd"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Β['ʹʹ΄’]\s*[ΈΕ]σδρας|[ΈΕ]σδρας\s*Β['ʹʹ΄’]|Β['ʹʹ΄’]\s*[ΈΕ]σδρ?|2Esd))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Isa"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Η(?:ΣΑ(?:(?:(?:Ί|Ί)|Ι)|Ϊ́)ΑΣ|σα[ΐι]ας)|Isa|Ησ|Ἠσ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:δυτικ[οό]ς\s*Σαμου[ήη]λ\s*Β['ʹʹ΄’]|Βασιλει[ωώ]ν\s*Β['ʹʹ΄’]|Β['ʹʹ΄’]\s*Σαμου[ήη]λ|Β['ʹʹ΄’]\s*Σαμ|2Sam))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Sam"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:δυτικ[οό]ς\s*Σαμου[ήη]λ\s*Α['ʹʹ΄’]|Βασιλει[ωώ]ν\s*Α['ʹʹ΄’]|Α['ʹʹ΄’]\s*Σαμου[ήη]λ|Α['ʹʹ΄’]\s*Σαμ|1Sam))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:δυτικ[οό]ς\s*Βασιλ[έε]ων\s*Β['ʹʹ΄’]|Βασιλει[ωώ]ν\s*Δ['ʹʹ΄’]|Β['ʹʹ΄’]\s*Βασιλ[έε]ων|Β['ʹʹ΄’]\s*Βασ?|2Kgs))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Kgs"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:δυτικ[οό]ς\s*Βασιλ[έε]ων\s*Α['ʹʹ΄’]|Βασιλει[ωώ]ν\s*Γ['ʹʹ΄’]|Α['ʹʹ΄’]\s*Βασιλ[έε]ων|Α['ʹʹ΄’]\s*Βασ?|1Kgs))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:δυτικ[οό]ς\s*Χρονικ[ωώ]ν\s*Β['ʹʹ΄’]|Παραλειπομ[έε]νων\s*Β['ʹʹ΄’]|Β['ʹʹ΄’]\s*(?:Χρονικ[ωώ]ν|Παρ)|Χρονικ[ωώ]ν\s*Β['ʹʹ΄’]|Β['ʹʹ΄’]\s*(?:Χρ(?:ον)?|Πα)|2Chr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Chr"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:δυτικ[οό]ς\s*Χρονικ[ωώ]ν\s*Α['ʹʹ΄’]|Παραλειπομ[έε]νων\s*Α['ʹʹ΄’]|Α['ʹʹ΄’]\s*(?:Χρονικ[ωώ]ν|Παρ)|Χρονικ[ωώ]ν\s*Α['ʹʹ΄’]|Α['ʹʹ΄’]\s*(?:Χρ(?:ον)?|Πα)|1Chr))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezra"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Εσδρας|Έσδρας|Ezra|Εσ|Ἔσ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Neh"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Νε(?:εμ[ίι]ας)?|Neh))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["GkEsth"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Εσθ[ήη]ρ\s*στα\s*ελληνικ[άα]|GkEsth))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Esth"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Εσθ(?:[ήη]ρ)?|Esth))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Job"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Job|(?:Ι[ωώ]|Ἰ)β|Ιβ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ps"],
        testament: "oa",
        testament_books: { "Ps": "oa" },
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ψα(?:λμ(?:ο(?:(?:[ίι]\s*του\s*Δαυ[ίι]δ|ς)|[ίι])|ός))?|Ps))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["PrAzar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Πρ(?:οσευχ[ήη]\s*Αζαρ[ίι]ου|\s*Αζαρ)|PrAzar))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Prov"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Π(?:αροιμ[ίι](?:αι|ες)|ρμ)|Prov))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eccl"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Εκκλησιαστ[ήη]ς|Eccl|Εκ|Ἐκ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["SgThree"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:[ΎΥ]μνος\s*των\s*Τρι[ωώ]ν\s*Πα[ίι]δων|SgThree))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mic"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Μ(?:ΙΧΑ(?:(?:(?:Ί|Ί)|Ι)|Ϊ́)ΑΣ|ιχα[ΐίι]ας|χ)|Mic))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Song"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ασμα\s*Ασμ[άα]των|Άσμα\s*Ασμ[άα]των|Song|Ασ|Ἆσ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jer"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ιερεμ[ίι]ας|Jer|Ιε|Ἰε))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Ezek"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ιεζ(?:εκι[ήη]λ|κ)|Ιεζ(?:εκ)?|Ezek|᾿Ιζ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Dan"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Δ(?:ανι[ήη]λ|αν?|ν)|Dan))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ωση[έε]|Hos|Ωσ|Ὠσ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Joel"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Joel|(?:Ιω[ήη]|Ἰ)λ|Ιλ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Amos"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Amos|Αμ[ωώ]ς|Αμ|Ἀμ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Obad"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Αβδιο[υύ]|Οβδ[ίι]ας|Obad|Αβδ|Ἀβδ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jonah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ι(?:ων[άα]ς|ν)|Jonah|Ἰν))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Nah"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Να(?:ο[υύ]μ)?|Nah))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hab"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Α(?:ββακο[υύ]μ|μβακο[υύ]μ)|Hab|Αβ|Ἀβ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zeph"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Σ(?:οφον[ίι]ας|φν)|Zeph))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Hag"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Αγγα[ίι]ος|Hag|Αγ|Ἀγ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Zech"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ζ(?:αχαρ[ίι]ας|αχ?|χ)|Zech))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mal"],
        testament: "o",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Μα(?:λ(?:αχ[ίι]ας)?)?|Mal))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Matt"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ευαγγελιον\s*Κατα\s*Μαθθαιον|Κατ[άα]\s*Μα[θτ]θα[ίι]ον|Μ(?:α(?:τθα[ίι]ος|θθα[ίι]ος)|θ)|Ματθ|Matt))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Mark"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Κατ[άα]\s*Μ[άα]ρκον|Μ(?:[άα]ρκος|ρ)|Μ[άα]ρκ|Mark))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Luke"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Κατ[άα]\s*Λουκ[άα]ν|Λ(?:ουκ[άα]ς|κ)|Λουκ|Luke))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Ιω(?:αννου\s*(?:(?:Επιστολη\s*Α|Α['ʹʹ΄’])|Α)|άννου\s*Α['ʹʹ΄’])|Α['ʹʹ΄’]\s*(?:Ιω[άα]ννη|᾿Ιω)|Α['ʹʹ΄’]\s*Ιω|1John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Ιω(?:αννου\s*(?:(?:Επιστολη\s*Β|Β['ʹʹ΄’])|Β)|άννου\s*Β['ʹʹ΄’])|Β['ʹʹ΄’]\s*(?:Ιω[άα]ννη|᾿Ιω)|Β['ʹʹ΄’]\s*Ιω|2John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Ιω(?:αννου\s*(?:(?:Επιστολη\s*Γ|Γ['ʹʹ΄’])|Γ)|άννου\s*Γ['ʹʹ΄’])|Γ['ʹʹ΄’]\s*(?:Ιω[άα]ννη|᾿Ιω)|Γ['ʹʹ΄’]\s*Ιω|3John))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["John"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Κατ[άα]\s*Ιω[άα]ννην|Ιω[άα]ννης|Ιω(?:[άα]ν)?|John|Ἰω))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Acts"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Πρ(?:άξεις\s*των\s*Αποστ[οό]λων|αξ(?:εις(?:\s*(?:των\s*Αποστ[οό]λων|Αποστολων))?)?|άξ(?:εις)?|ξ)|Acts))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Rom"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Ρωμα[ίι]ους|Ρωμα[ίι]ους|Ρωμ|Rom|῾Ρω))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Προς\s*Κορινθ(?:ιους\s*Β(?:['ʹʹ΄’])?|ίους\s*Β['ʹʹ΄’])|Β['ʹʹ΄’]\s*Κορινθ[ίι]ους|Β['ʹʹ΄’]\s*Κορ?|2Cor))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Cor"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Προς\s*Κορινθ(?:ιους\s*Α(?:['ʹʹ΄’])?|ίους\s*Α['ʹʹ΄’])|Α['ʹʹ΄’]\s*Κορινθ[ίι]ους|Α['ʹʹ΄’]\s*Κορ?|1Cor))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Gal"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Γαλ[άα]τας|Γαλ[άα]τες|Γαλ?|Gal))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Eph"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Εφεσ[ίι]ους|Εφεσ[ίι]ους|Eph|᾿Εφ|Εφ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phil"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Φιλιππησ[ίι]ους|Φιλιππησ[ίι]ους|Phil|Φι))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Col"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Κολ(?:ασσαεις|οσσαε[ίι]ς)|Κολοσσαε[ίι]ς|Κολ|Col|Κλ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Προς\s*Θεσσαλονικε(?:ις\s*Β(?:['ʹʹ΄’])?|ίς\s*Β['ʹʹ΄’])|Β['ʹʹ΄’]\s*Θεσσαλονικε[ίι]ς|Β['ʹʹ΄’]\s*Θεσ?|2Thess))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Thess"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Προς\s*Θεσσαλονικε(?:ις\s*Α(?:['ʹʹ΄’])?|ίς\s*Α['ʹʹ΄’])|Α['ʹʹ΄’]\s*Θεσσαλονικε[ίι]ς|Α['ʹʹ΄’]\s*Θεσ?|1Thess))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Προς\s*Τιμ(?:οθεον\s*Β(?:['ʹʹ΄’])?|όθεον\s*Β['ʹʹ΄’])|Β['ʹʹ΄’]\s*Τιμ[οό]θεο|Β['ʹʹ΄’]\s*Τιμ?|2Tim))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Tim"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Προς\s*Τιμ(?:οθεον\s*Α(?:['ʹʹ΄’])?|όθεον\s*Α['ʹʹ΄’])|Α['ʹʹ΄’]\s*Τιμ[οό]θεο|Α['ʹʹ΄’]\s*Τιμ?|1Tim))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Titus"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Τ[ίι]τον|Titus|Τ(?:[ίι]το|τ)|Τ[ίι]τ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Phlm"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Φιλ[ήη]μονα|Φιλ[ήη]μονα|Phlm|Φλμ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Heb"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Προς\s*Εβρα[ίι]ους|Εβρα[ίι]ους|Εβρ?|Heb|Ἑβ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jas"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ιακ(?:ωβου(?:\s*Επιστολη)?|ώβου)|Jas|᾿Ια))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Π(?:ετρου\s*(?:(?:Επιστολη\s*Β|Β['ʹʹ΄’])|Β)|έτρου\s*Β['ʹʹ΄’])|Β['ʹʹ΄’]\s*Π[έε]τρου|Β['ʹʹ΄’]\s*Π[έε](?:τρ?)?|2Pet))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Pet"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Π(?:ετρου\s*(?:(?:Επιστολη\s*Α|Α['ʹʹ΄’])|Α)|έτρου\s*Α['ʹʹ΄’])|Α['ʹʹ΄’]\s*Π[έε]τρου|Α['ʹʹ΄’]\s*Π[έε](?:τρ?)?|1Pet))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jude"],
        testament: "n",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ιο(?:υδα(?:\s*Επιστολη)?|ύδα)|Jude|᾿Ιδ))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Tob"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Τωβ(?:[ίι]τ)?|Tob))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Jdt"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Ι(?:ουδ[ίι]θ|δθ)|Jdt))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Bar"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Β(?:αρ(?:ο[υύ]χ)?|ρ)|Bar))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["Sus"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}]))((?:Σ(?:ουσ[άα]ννα|ωσ[άα]ννα|ουσ)|Sus))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["2Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Β['ʹʹ΄’]\s*Μακκαβα[ίι]ων|Μακκαβα[ίι]ων\s*Β['ʹʹ΄’]|Β['ʹʹ΄’]\s*Μακκ|2Macc))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["3Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Γ['ʹʹ΄’]\s*Μακκαβα[ίι]ων|Μακκαβα[ίι]ων\s*Γ['ʹʹ΄’]|Γ['ʹʹ΄’]\s*Μακκ|3Macc))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["4Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Δ['ʹʹ΄’]\s*Μακκαβα[ίι]ων|Μακκαβα[ίι]ων\s*Δ['ʹʹ΄’]|Δ['ʹʹ΄’]\s*Μακκ|4Macc))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      },
      {
        osis: ["1Macc"],
        testament: "a",
        regexp: /(?:^|(?<=[^\p{L}\p{N}])(?<!\d:(?=\d)))((?:Α['ʹʹ΄’]\s*Μακκαβα[ίι]ων|Μακκαβα[ίι]ων\s*Α['ʹʹ΄’]|Α['ʹʹ΄’]\s*Μακκ|1Macc))(?:(?=[\d\s.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-–—])|$)/giu
      }
    ];
  }
};
var bcv_translations = class {
  constructor() {
    this.aliases = {
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
  const peg$c16 = "$c_sep";
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
  const peg$e18 = peg$literalExpectation("$c_sep", false);
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
  function peg$f0(val_1, val_2) {
    val_2.unshift([val_1]);
    var r = range();
    return { type: "sequence", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f1(val_1, val_2) {
    if (typeof val_2 === "undefined") val_2 = [];
    val_2.unshift([val_1]);
    var r = range();
    return { type: "sequence_post_enclosed", value: val_2, indices: [r.start, r.end - 1] };
  }
  function peg$f2(val_1, val_2) {
    if (val_1.length && val_1.length === 2) val_1 = val_1[0];
    var r = range();
    return { type: "range", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f3(val) {
    var r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f4(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f5(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f6(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f7(val_1, val_2) {
    var r = range();
    return { type: "bc_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f8(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f9(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f10(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f11(val_1) {
    return val_1.value[1].value[0].partial == null;
  }
  function peg$f12(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f13(val_1, val_2) {
    return val_2.value[0].partial == null;
  }
  function peg$f14(val_1, val_2, val_3, val_4) {
    var r = range();
    return { type: "range", value: [{ type: "bcv", value: [{ type: "bc", value: [val_1, val_2], indices: [val_1.indices[0], val_2.indices[1]] }, val_3], indices: [val_1.indices[0], val_3.indices[1]] }, val_4], indices: [r.start, r.end - 1] };
  }
  function peg$f15(val_1, val_2) {
    var r = range();
    return { type: "bv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f16(val) {
    var r = range();
    return { type: "c", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f17(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f18(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f19(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f20(val_1, val_2, val_3) {
    var r = range();
    return { type: "cb_range", value: [val_3, val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f21(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f22(val_1, val_2) {
    var r = range();
    return { type: "bc", value: [val_2, val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f23(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f24(val) {
    var r = range();
    return { type: "c_psalm", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f25(val_1, val_2) {
    var r = range();
    return { type: "cv_psalm", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f26(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f27(val_1, val_2) {
    var r = range();
    return { type: "c_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f28(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f29(val_1, val_2) {
    var r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f30(val_1) {
    return val_1.value[0].partial == null;
  }
  function peg$f31(val_1, val_2) {
    var r = range();
    return { type: "cv", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f32(val_1) {
    var r = range();
    return { type: "ff", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f33(val_1) {
    var r = range();
    return { type: "next_v", value: [val_1], indices: [r.start, r.end - 1] };
  }
  function peg$f34(val_1, val_2) {
    var r = range();
    return { type: "integer_title", value: [val_1, val_2], indices: [r.start, r.end - 1] };
  }
  function peg$f35(val) {
    var r = range();
    return { type: "context", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f36(val) {
    var r = range();
    return { type: "b", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f37(val) {
    var r = range();
    return { type: "bc", value: [val, { type: "c", value: [{ type: "integer", value: 151, indices: [r.end - 2, r.end - 1] }], indices: [r.end - 2, r.end - 1] }], indices: [r.start, r.end - 1] };
  }
  function peg$f38(val_1, val_2) {
    var r = range();
    return { type: "bcv", value: [val_1, { type: "v", value: [val_2], indices: [val_2.indices[0], val_2.indices[1]] }], indices: [r.start, r.end - 1] };
  }
  function peg$f39(val) {
    var r = range();
    return { type: "v", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f40() {
    return { type: "c_explicit" };
  }
  function peg$f41() {
    return { type: "v_explicit" };
  }
  function peg$f42() {
    return "";
  }
  function peg$f43(val) {
    var r = range();
    return { type: "title", value: [val], indices: [r.start, r.end - 1] };
  }
  function peg$f44(val) {
    var r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f45(val) {
    var r = range();
    return { type: "translation_sequence", value: val, indices: [r.start, r.end - 1] };
  }
  function peg$f46(val) {
    var r = range();
    return { type: "translation", value: val.value, indices: [r.start, r.end - 1] };
  }
  function peg$f47(val_1, val_2) {
    var r = range();
    return { type: "integer", value: parseInt(val_1.join(""), 10), partial: val_2 != null ? val_2[1].join("") : null, indices: [r.start, r.end - 1] };
  }
  function peg$f48(val) {
    var r = range();
    return { type: "integer", value: parseInt(val.join(""), 10), indices: [r.start, r.end - 1] };
  }
  function peg$f49(val) {
    var r = range();
    return { type: "word", value: val.join(""), indices: [r.start, r.end - 1] };
  }
  function peg$f50(val) {
    var r = range();
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
      if (s4 !== peg$FAILED) {
        s5 = peg$parsecb_range();
        if (s5 === peg$FAILED) {
          s5 = peg$parserange();
          if (s5 === peg$FAILED) {
            s5 = peg$parsecv_psalm();
            if (s5 === peg$FAILED) {
              s5 = peg$parsec_psalm();
              if (s5 === peg$FAILED) {
                s5 = peg$parsecbv();
                if (s5 === peg$FAILED) {
                  s5 = peg$parsecbv_ordinal();
                  if (s5 === peg$FAILED) {
                    s5 = peg$parsecb();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parsecb_ordinal();
                      if (s5 === peg$FAILED) {
                        s5 = peg$parsec_title();
                        if (s5 === peg$FAILED) {
                          s5 = peg$parsecv();
                          if (s5 === peg$FAILED) {
                            s5 = peg$parsec();
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
        s3 = peg$currPos;
        s4 = peg$parsesequence_sep();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parsesequence_post();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsec_sep();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecb_range();
            if (s5 === peg$FAILED) {
              s5 = peg$parserange();
              if (s5 === peg$FAILED) {
                s5 = peg$parsecv_psalm();
                if (s5 === peg$FAILED) {
                  s5 = peg$parsec_psalm();
                  if (s5 === peg$FAILED) {
                    s5 = peg$parsecbv();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parsecbv_ordinal();
                      if (s5 === peg$FAILED) {
                        s5 = peg$parsecb();
                        if (s5 === peg$FAILED) {
                          s5 = peg$parsecb_ordinal();
                          if (s5 === peg$FAILED) {
                            s5 = peg$parsec_title();
                            if (s5 === peg$FAILED) {
                              s5 = peg$parsecv();
                              if (s5 === peg$FAILED) {
                                s5 = peg$parsec();
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
            s3 = peg$currPos;
            s4 = peg$parsesequence_sep();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            s5 = peg$parsesequence_post();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f0(s1, s2);
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
      s3 = peg$parsesequence_sep();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      s4 = peg$parsesequence_post();
      if (s4 !== peg$FAILED) {
        s5 = [];
        s6 = peg$currPos;
        s7 = peg$parsesequence_sep();
        if (s7 === peg$FAILED) {
          s7 = null;
        }
        s8 = peg$parsesequence_post();
        if (s8 !== peg$FAILED) {
          s7 = [s7, s8];
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          s6 = peg$currPos;
          s7 = peg$parsesequence_sep();
          if (s7 === peg$FAILED) {
            s7 = null;
          }
          s8 = peg$parsesequence_post();
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
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
          s0 = peg$f1(s4, s5);
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
          s0 = peg$f2(s1, s3);
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
          s0 = peg$f3(s2);
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
          s0 = peg$f5(s1, s5);
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
      s2 = peg$f6(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetitle();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f7(s1, s3);
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
            s0 = peg$f8(s1, s4);
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
      s2 = peg$f9(s1);
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
      s2 = peg$f11(s1);
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
              s0 = peg$f12(s1, s6);
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
        s4 = peg$f13(s1, s3);
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
                  s0 = peg$f14(s1, s3, s6, s8);
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
          s0 = peg$f15(s1, s3);
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
      s0 = peg$f16(s2);
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
        s3 = peg$f17(s2);
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
            s0 = peg$f18(s2, s5);
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
        s3 = peg$f19(s2);
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
                s0 = peg$f20(s2, s5, s7);
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
          s0 = peg$f21(s1, s4);
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
            s0 = peg$f22(s1, s5);
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
          s0 = peg$f24(s2);
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
  function peg$parsec_title() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsec_explicit();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsec();
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$f26(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsetitle();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f27(s2, s4);
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
      s3 = peg$f28(s2);
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
              s0 = peg$f29(s2, s6);
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
      s2 = peg$f30(s1);
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
              s0 = peg$f31(s1, s4);
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
        s0 = peg$f32(s1);
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
        s0 = peg$f33(s1);
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
        s0 = peg$f34(s1, s2);
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
          s0 = peg$f35(s2);
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
          s0 = peg$f36(s2);
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
          s0 = peg$f37(s1);
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
          s0 = peg$f38(s1, s3);
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
      s0 = peg$f39(s2);
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
      s1 = peg$f40();
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
      s1 = peg$f41();
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
      s0 = peg$f43(s2);
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
          s0 = peg$f44(s4);
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
      s0 = peg$f45(s3);
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
          s0 = peg$f46(s2);
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
      s0 = peg$f47(s1, s2);
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
      s1 = peg$f48(s1);
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
      s1 = peg$f49(s1);
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
      s1 = peg$f50(s1);
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
  // Takes OSIS objects and converts them to OSIS strings based on compaction preferences.
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
    if (this.options.versification_system.indexOf("a") >= 0 && this.options.ps151_strategy === "b" && (start.c === 151 && start.b === "Ps" || end.c === 151 && end.b === "Ps")) {
      this.fix_ps151(start, end, translation);
    }
    const chapter_array = this.passage.translations.systems[translation]?.chapters[end.b] || this.passage.translations.systems.current.chapters[end.b];
    if (end.c == null) {
      if (this.options.passage_existence_strategy.indexOf("c") >= 0 || chapter_array && chapter_array.length === 1) {
        end.c = chapter_array.length;
      } else {
        end.c = 999;
      }
    }
    if (end.v == null) {
      if (chapter_array && chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0) {
        end.v = chapter_array[end.c - 1];
      } else {
        end.v = 999;
      }
    }
    if (this.options.osis_compaction_strategy === "b" && start.c === 1 && start.v === 1 && (end.c === 999 && end.v === 999 || end.c === chapter_array.length && this.options.passage_existence_strategy.indexOf("c") >= 0 && (end.v === 999 || end.v === chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0))) {
      osis.start = start.b;
      osis.end = end.b;
    } else if (this.options.osis_compaction_strategy.length <= 2 && start.v === 1 && (end.v === 999 || end.v === chapter_array[end.c - 1] && this.options.passage_existence_strategy.indexOf("v") >= 0)) {
      osis.start = start.b + "." + start.c;
      osis.end = end.b + "." + end.c;
    } else {
      osis.start = start.b + "." + start.c + "." + start.v;
      osis.end = end.b + "." + end.c + "." + end.v;
      if (this.options.osis_compaction_strategy === "bcvp") {
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
  ab: /^[α-ε](?!\p{L})/iu,
  and: /^(?:και|&)/i,
  c_explicit: /^[\s*]*(?:κεφ[άα]λαια|κεφ[άα]λαιον|κεφ[άα]λαιο|κεφ\.?)[\s*]*/i,
  c_sep_eu: /^\x1f\x1f\x1f/i,
  c_sep_us: /^\x1f\x1f\x1f/i,
  cv_sep_weak: /^(?:[\s*]*["'][\s*]*|[\s*])+/i,
  cv_sep_eu: /^[\s*]*,+[\s*]*/i,
  cv_sep_us: /^[\s*]*(?::+|\.(?!\s*\.\s*\.))[\s*]*/i,
  ff: /^[\s*]*και\s+μετ[άα](?![\p{L}\p{N}])(?:\.(?!\s*\.))?/iu,
  in_book_of: /^[\s*]*(?:from|of|in)[\s*]*(?:the[\s*]*book[\s*]*of[\s*]*)?/i,
  next: /^\x1f\x1f\x1f/i,
  ordinal: /^(?:th|st|nd|rd)/i,
  range: /^[\s*]*(?:[\-–—]|-)+[\s*]*/i,
  sequence_eu: /^(?:[;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|και)+/i,
  sequence_us: /^(?:[,;/:&\-–—~\s*]|\.(?!\s*\.\s*\.)|και)+/i,
  space: /^[\s*]+/,
  title: /^[\s*]*(?:ο\s+τ[ίι]τλος|ο\s+τ[ίι]τλοσ|τ[ίι]τλος|τ[ίι]τλοσ)(?!\p{L})[\s*]*/iu,
  v_explicit: /^[\s*]*(?:στ[ίι]χος|στ[ίι]χοι|στ[ίι]χοσ)[\s*]*(?!\p{L})/iu
};
var grammar = { parse: peg$parse2 };

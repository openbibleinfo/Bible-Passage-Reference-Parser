var fs = require('fs'),
    closure = require('../lib/closure');

var lang = process.argv[2];
var code_to_compile = fs.readFileSync("../js/" + lang + "_bcv_parser.js");

closure.compile(code_to_compile, function(err, code) {
  if (err) throw err;
  fs.writeFile("../js/" + lang + "_bcv_parser.min.js", code)

  var smaller = Math.round((1 - (code.length / code_to_compile.length)) * 100);
  console.log('Closure compiled (%d% smaller)', smaller);
});
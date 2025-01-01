import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { RegExpBuilder } = require("@pemistahl/grex");
const fs = require("fs");

//console.log(process.argv);
let arg;
if (process.argv[2] === "<") {
	// Not base64-encoded when written to a file
	arg = fs.readFileSync("./temp.txt").toString('utf8');
}
else {
	arg = Buffer.from(process.argv[2], 'base64').toString('utf8');
}
let strings = JSON.parse(arg)
//console.log(strings)

let loop_count = 1;
const out = [];
const pattern = RegExpBuilder.from(strings).withMinimumSubstringLength(3).build();
out.push(pattern)

const re = new RegExp(pattern)
let ok_count = 0
const redos = []
let max_length = 0
for (let i = 0, max = strings.length; i < max; i++) {
	const ok = re.test(strings[i])
	//console.log(ok + "\t", strings[i]);
	if (ok === true) {
		if (strings[i].length > max_length) {
			max_length = strings[i].length
		}
		ok_count++
	}
	else {
		redos.push(strings[i]);
		throw("No pattern match for " + strings[i]);
	}
}

console.log(JSON.stringify({"patterns": out}).replace(/\\\\u/g, "\\u"))

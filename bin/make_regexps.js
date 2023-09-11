const regexgen = require("regexgen")
const fs = require("fs")

//console.log(process.argv);
let arg;
if (process.argv[2] === "<") {
	// Not base64-encoded when written to a file
	arg = fs.readFileSync("./temp.txt").toString('utf8')
}
else {
	arg = Buffer.from(process.argv[2], 'base64').toString('utf8'
		)
}
let strings = JSON.parse(arg)
//console.log(strings)

let loop_count = 1;
const out = [];
while (strings.length > 0) {
	const pattern = regexgen(strings)
	let pattern_string = pattern.toString()
	pattern_string = "/^(?:" + pattern_string.substr(1)
	pattern_string = pattern_string.substr(0, pattern_string.length - 1) + ")$/"
	pattern_string = pattern_string.replace(/([\x80-\uffff])/g, function(matches, $1) { return "\\u" + ("0000" + $1.charCodeAt(0).toString(16)).substr(-4); })
	out.push(pattern_string)

	const re = new RegExp(pattern)
	let ok_count = 0
	redos = []
	let max_length = 0
	for (i = 0, max = strings.length; i < max; i++) {
		const ok = re.test(strings[i])
		//console.log(ok + "\t", strings[i]);
		if (ok === true) {
			if (strings[i].length > max_length) {
				max_length = strings[i].length
			}
			ok_count++
		}
		else {
			redos.push(strings[i])
		}
	}
	//console.log(loop_count, ok_count, "/", max, max_length)
	loop_count++
	strings = redos
}

console.log(JSON.stringify({"patterns": out}).replace(/\\\\u/g, "\\u"))

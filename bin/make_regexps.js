var frak = require("./js/frak.min.js");
var fs = require("fs");

//console.log(process.argv);
var arg;
if (process.argv[2] === "<") {
	// Not base64-encoded when written to a file
	arg = fs.readFileSync("./temp.txt").toString('utf8');
}
else {
	arg = new Buffer(process.argv[2], 'base64').toString('utf8'
		);
}
var strings = JSON.parse(arg);

var loop_count = 1;
var out = [];
while (strings.length > 0) {
	var pattern = frak.frak.pattern(strings, {"exact?": true})
	out.push(pattern.toString());

	var re = new RegExp(pattern);
	var ok_count = 0;
	redos = [];
	var max_length = 0;
	for (i = 0, max = strings.length; i < max; i++) {
		var ok = re.test(strings[i]);
		//console.log(ok + "\t", strings[i]);
		if (ok === true) {
			if (strings[i].length > max_length) {
				max_length = strings[i].length;
			}
			ok_count++;
		}
		else {
			redos.push(strings[i]);
		}
	}
	//console.log(loop_count, ok_count, "/", max, max_length);
	loop_count++;
	strings = redos;
}

console.log(JSON.stringify({"patterns": out}).replace(/([\x80-\uffff])/g, function(matches, $1) { return "\\u" + ("0000" + $1.charCodeAt(0).toString(16)).substr(-4); }));

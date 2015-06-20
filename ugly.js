// Start listening on stdin
function main () {
	readlines (handleLine);
}

// Listen on stdin and call callback_ on each line
function readlines (callback_) {
	console.assert (typeof (callback_) === "function");

	var unhandledText = "";

	process.stdin.setEncoding ('utf8');
	process.stdin.on ('readable', function () {
		var chunk = process.stdin.read ();

		if (chunk === null)
			return;

		unhandledText += chunk;

		var lineBreak = unhandledText.indexOf ('\n');

		while (lineBreak >= 0) {
			callback_ (unhandledText.substring (0, lineBreak));

			unhandledText = unhandledText.slice (lineBreak + 1);
			lineBreak = unhandledText.indexOf ('\n');
		}
	});
}

function handleLine (line_) {
	console.assert (typeof (line_) === "string");

	// TODO: Handle the line
}

// GO!
main ();

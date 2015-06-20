// Constants ===================================================================
var SOCKET_PORT = 4444;
var SOCKET_SERVER = 'ws://localhost:' + SOCKET_PORT;

// Globals =====================================================================
var ugly = {
	currentChunk: undefined,
	queuedCommands: [],
};

// Main code ===================================================================
function initConnection () {
	console.log ('Attempting to connect to websocket server ' + SOCKET_SERVER);
	var socket = new WebSocket (SOCKET_SERVER);

	socket.onmessage = function (message_) {
		handleLine (message_.data);
	};

	socket.onclose = function () {
		console.log ('Socket closed, attempting to reconnect in 5 seconds...');
		setTimeout (initConnection, 5 * 1000);
	};
}

// Command parsing =============================================================
// Parsing on the client side is in many ways the same as parsing on the server
// side. The exception is that since we've already gone through the server, we
// can assume that anything we get is valid according to the protocol.

// Returns true iff string_ begins with prefix_
function startsWith (prefix_, string_) {
	console.assert (typeof (prefix_) === 'string');
	console.assert (typeof (string_) === 'string');

	return string_.indexOf (prefix_) === 0;
}

// Separates a line into a command and arguments
function toArgList (line_) {
	console.assert (typeof (line_) === 'string');

	return line_.match (/\S+/g);
}

// Command handlers -----------------------------------------------------------
// Sets the letterbox color as specified
function letterboxColor (command_) {
	var argList = toArgList (command_);

	document.body.style.background = argList[1];
}

// Executes all the commands in the queue
function processQueuedCommands () {
	for (var i = 0; i < ugly.queuedCommands.length; i++) {
		var command = ugly.queuedCommands[i];
		console.log (command);

		if (startsWith ('letterbox_color', command)) {
			letterboxColor (command);
		} else {
			// Since we've already validated server-side, this should be
			// unreachable code
			console.assert (false);
		}
	}

	// Empty the queue
	ugly.queuedCommands = [];
}

// Takes a line as input and processes it appropriately. If this line is a
// command, it is pushed onto the queue of commands to be executed. If this
// line terminates a chunk, then all the commands for the chunk are executed.
function handleLine (line_) {
	console.assert (typeof (line_) === 'string');

	if (line_.length === 0)
		return;

	if (! startsWith ('$', line_))
		ugly.queuedCommands.push (line_);
	else if (startsWith ('$END_', line_)) {
		processQueuedCommands ();
	}
}

// Entry point =================================================================
(function () {
	initConnection ();
}) ();

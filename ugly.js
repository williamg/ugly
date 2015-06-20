// Requires ====================================================================
var pkg = require ('./package.json');
var fs = require ('fs');
var express = require ('express');
var WebSocketServer = require ('ws').Server;


// Constants ===================================================================
var VERSION         = pkg.version;
var LOG_FILE        = 'ugly.log';
var VIEWER_PORT     = 3333;
var VIEWER_ADDR     = 'localhost:' + VIEWER_PORT;
var SOCKET_PORT     = 4444;
var SOCKET_ADDR     = 'ws://localhost:' + SOCKET_PORT;

// Globals = ===================================================================
var server = new WebSocketServer ({ port: SOCKET_PORT});
var socket;
var currentChunk;
var lineHandler;

// Logging =====================================================================
function initLog () {
	// Clear the log
	fs.writeFileSync (LOG_FILE, "");

	// Write header data
	writeToFile ('Created with ugly v' + VERSION);
	writeToFile ('Start date: ' + (new Date ().toString ()));
	writeToFile ('===========================================================');
}

function writeToFile (msg_) {
	fs.appendFileSync (LOG_FILE, msg_ + '\n');
}

function info (msg_) {
	var time = new Date ().getTime ();

	msg_ = '[' + time + '] INFO: ' + msg_;

	console.log (msg_);
	writeToFile (msg_);
}

function error (msg_) {
	var time = new Date ().getTime ();

	msg_ = '[' + time + '] ERROR: ' + msg_;

	console.error (msg_);
	writeToFile (msg_);
	process.exit (1);
}


// Main code ==================================================================

// Start listening on stdin
function main () {
	initLog ();
	info ("Initializing...");

	serveViewer ();

	connectToViewer (function () {
		readlines (handleLine);
	});
}

function serveViewer () {
	var app = express ();

	app.use (express.static (__dirname + '/viewer'));
	app.listen (VIEWER_PORT);

	info ('Serving viewer at ' + VIEWER_ADDR);
}

function connectToViewer (callback_) {
	server.on ('connection', function (socket_) {
		info ('Viewer connected');

		socket = socket_;
		callback_ ();
	});
}

// Listen on stdin and call callback_ on each line
function readlines (callback_) {
	console.assert (typeof (callback_) === 'function');

	info ("Listening on stdin");

	var unhandledText = '';

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

// Command parsing =============================================================
function startsWith (prefix_, string_) {
	console.assert (typeof (prefix_) === 'string');
	console.assert (typeof (string_) === 'string');

	return string_.indexOf (prefix_) === 0;
}

function sendData (data_) {
	console.assert (typeof (data_) === 'string');

	socket.send (data_, function (err_) {
		if (err_)
			error (err_);
	});
}

// Config validation functions -------------------------------------------------
function validateLetterboxColor (line_) {
	console.assert (typeof (line_) === 'string');
	console.assert (startsWith ('letterbox_color', line_));

	var commandArr = line_.match (/\S+/g);

	if (commandArr.length !== 2)
		error ('Invalid syntax. letterbox_color expects 1 parameter.');

	var color = commandArr[1];

	if (! color.match (/#[a-fA-F0-9]{6}/))
		error ('Invalid syntax. letterbox_color expectx a parameter of ' +
		       'the form #XXXXXX where XXXXXX is the hexadecimal ' +
		       'representation of the desired color.');
}

function parseConfigCommand (line_) {
	console.assert (typeof (line_) === 'string');

	if (startsWith ('letterbox_color', line_)) {
		validateLetterboxColor (line_);
		return;
	} else {
		error ('Unrecognized config command "' + line_ + '"');
	}
}

// Frame validation functions --------------------------------------------------
function parseFrameCommand (line_) {
	console.assert (typeof (line_) === 'string');

	error ('Unrecognized frame command "' + line_ + '"');

}

function handleLine (line_) {
	console.assert (typeof (line_) === 'string');

	if (line_.length === 0)
		return;

	// TODO: This should be moved to a global so I don't recreate it each time
	var chunkHandlers = {
		'CONFIG': parseConfigCommand,
		'FRAME': parseFrameCommand,
	};

	for (var chunkName in chunkHandlers) {
		// Chunk declaration
		if (startsWith ('$' + chunkName, line_)) {
			if (currentChunk !== undefined)
				error ('Found ' + chunkName + ' declaration before the ' +
				       'previous chunk was terminated.');

			currentChunk = chunkName;
			lineHandler = chunkHandlers[chunkName];
			break;
		// Chunk termination
		} else if (startsWith ('$END_' + chunkName, line_)) {
			if (currentChunk !== chunkName)
				error ('Found ' + chunkName + ' terminator in non-' +
				       chunkName + ' chunk.');

			lineHandler = undefined;
			currentChunk = undefined;
			break;
		}
	}

	// Only handle commands, not declarations or terminations
	if (! startsWith ('$', line_))
			lineHandler (line_);

	// We send everything, though
	sendData (line_);
}

// Entry point =================================================================
main ();

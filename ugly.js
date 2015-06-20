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
var socket = undefined;

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

function handleLine (line_) {
	console.assert (typeof (line_) === 'string');

	socket.send (line_, function (err_) {
		if (err_)
			error (err_);
	});
}

// GO!
main ();

// Requires ====================================================================
var pkg = require ('./package.json');
var log = require ('./logging.js');
var express = require ('express');
var WebSocketServer = require ('ws').Server;


// Constants ===================================================================
var VERSION         = pkg.version;
var LOG_FILE        = 'ugly.log';
var VIEWER_PORT     = 3333;
var VIEWER_ADDR     = 'localhost:' + VIEWER_PORT;
var SOCKET_PORT     = 4444;
var CHUNK_HANDLERS = {
	'CONFIG': parseConfigCommand,
	'FRAME': parseFrameCommand,
	};

// Globals =====================================================================
var ugly = {
	server: new WebSocketServer ({ port: SOCKET_PORT}),
	socket: undefined,
	currentChunk: undefined,
	lineHandler: undefined,
};


// Main code ==================================================================

// Start listening on stdin
function main () {
	log.initLog (LOG_FILE, VERSION);
	log.info ("Initializing...");

	serveViewer ();

	connectToViewer (function () {
		readlines (handleLine);
	});
}

// Serve the static viewer
function serveViewer () {
	var app = express ();

	app.use (express.static (__dirname + '/viewer'));
	app.listen (VIEWER_PORT);

	log.info ('Serving viewer at ' + VIEWER_ADDR);
}

// Attempt to establish a WebSocket connection the the viewer
function connectToViewer (callback_) {
	ugly.server.on ('connection', function (socket_) {
		log.info ('Viewer connected');

		ugly.socket = socket_;
		callback_ ();
	});
}

// Listen on stdin and call callback_ on each line
function readlines (callback_) {
	console.assert (typeof (callback_) === 'function');

	log.info ("Listening on stdin");

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

// Returns true iff string_ starts with prefix_
function startsWith (prefix_, string_) {
	console.assert (typeof (prefix_) === 'string');
	console.assert (typeof (string_) === 'string');

	return string_.indexOf (prefix_) === 0;
}

// Write data_ to the client via websockets
function sendData (data_) {
	console.assert (typeof (data_) === 'string');

	ugly.socket.send (data_, function (err_) {
		if (err_)
			log.error (err_);
	});
}

// Config validation functions -------------------------------------------------

// Parse commands in a CONFIG chunk
function parseConfigCommand (line_) {
	console.assert (typeof (line_) === 'string');

	if (startsWith ('letterbox_color', line_)) {
		validateLetterboxColor (line_);
		return;
	} else if (startsWith ('canvas_size', line_)) {
		validateCanvasSize (line_);
		return;
	} else {
		log.error ('Unrecognized config command "' + line_ + '"');
	}
}
// Validate a letterbox_color command according to the protocol
function validateLetterboxColor (line_) {
	console.assert (typeof (line_) === 'string');
	console.assert (startsWith ('letterbox_color', line_));

	var commandArr = line_.match (/\S+/g);

	if (commandArr.length !== 2)
		log.error ('Invalid syntax. letterbox_color expects 1 parameter.');

	var color = commandArr[1];

	if (! color.match (/#[a-fA-F0-9]{6}/))
		log.error ('Invalid syntax. letterbox_color expects a parameter of ' +
		       'the form #XXXXXX where XXXXXX is the hexadecimal ' +
		       'representation of the desired color.');
}

// Validate a canvas_size command according to the protocol
function validateCanvasSize (line_) {
	console.assert (typeof (line_) === 'string');
	console.assert (startsWith ('canvas_size', line_));

	var commandArr = line_.match (/\S+/g);

	if (commandArr.length !== 3)
		log.error ('Invalid syntax. canvas_size expects 2 parameter.');

	var width = commandArr[1];
	var height = commandArr[2];

	if (! width.match (/[0-9]+/))
		log.error ('Invalid syntax. canvas_size expects a integral ' +
		       'width parameter');

	if (! height.match (/[0-9]+/))
		log.error ('Invalid syntax. canvas_size expects a integral ' +
		       'height parameter');
}


// Frame validation functions --------------------------------------------------

// Parse commands in a FRAME chunk
function parseFrameCommand (line_) {
	console.assert (typeof (line_) === 'string');

	if (startsWith ('fill_style_color', line_)) {
		validateFillStyleColor (line_);
	} else if (startsWith ('fill_rect', line_)) {
		validateFillRect (line_);
	} else {
		log.error ('Unrecognized frame command "' + line_ + '"');
	}
}

function validateFillStyleColor (line_) {
	console.assert (typeof (line_) === 'string');

	var commandArr = line_.match (/\S+/g);

	if (commandArr.length !== 5)
		log.error ('Invalid syntax. fill_style_color expects 4 parameters.');

	var red = parseInt (commandArr[1]);
	var green = parseInt (commandArr[2]);
	var blue = parseInt (commandArr[3]);
	var alpha = parseFloat (commandArr[4]);

	if (isNaN (red) || red < 0 || red > 255)
		log.error ('Invalid "red" parameter. Must be an integer between ' +
		       '0 and 255. (given: ' + commandArr[1] + ')');

	if (isNaN (green) || green < 0 || green > 255)
		log.error ('Invalid "green" parameter. Must be an integer between ' +
		       '0 and 255. (given: ' + commandArr[2] + ')');

	if (isNaN (blue) || blue < 0 || blue > 255)
		log.error ('Invalid "blue" parameter. Must be an integer between ' +
		       '0 and 255. (given: ' + commandArr[3] + ')');

	if (isNaN (alpha) || alpha < 0 || alpha > 1)
		log.error ('Invalid "alpha" parameter. Must be a decimal between ' +
		       '0 and 1. (given: ' + commandArr[4] + ')');
}

function validateFillRect (line_) {
	console.assert (typeof (line_) === 'string');

	var commandArr = line_.match (/\S+/g);

	if (commandArr.length !== 5)
			log.error ('Invalid syntax. fill_rect expects 4 parameters.');

	var x = parseInt (commandArr[1]);
	var y = parseInt (commandArr[2]);
	var width = parseInt (commandArr[3]);
	var height = parseInt (commandArr[4]);

	if (isNaN (x))
		log.error ('Invalid "x" parameter. Must be an integer');

	if (isNaN (y))
		log.error ('Invalid "y" parameter. Must be an integer');

	if (isNaN (width))
		log.error ('Invalid "width" parameter. Must be an integer');

	if (isNaN (height))
		log.error ('Invalid "height" parameter. Must be an integer');
}

// Handle receving a line as input
function handleLine (line_) {
	console.assert (typeof (line_) === 'string');

	if (line_.length === 0)
		return;

	for (var chunkName in CHUNK_HANDLERS) {
		// Chunk declaration
		if (startsWith ('$' + chunkName, line_)) {
			if (ugly.currentChunk !== undefined)
				log.error ('Found ' + chunkName + ' declaration before the ' +
				           'previous chunk was terminated.');

			ugly.currentChunk = chunkName;
			ugly.lineHandler = CHUNK_HANDLERS[chunkName];
			break;
		// Chunk termination
		} else if (startsWith ('$END_' + chunkName, line_)) {
			if (ugly.currentChunk !== chunkName)
				log.error ('Found ' + chunkName + ' terminator in non-' +
				           chunkName + ' chunk.');

			ugly.lineHandler = undefined;
			ugly.currentChunk = undefined;
			break;
		}
	}

	// Only handle commands, not declarations or terminations
	if (! startsWith ('$', line_))
			ugly.lineHandler (line_);

	// We send everything, though
	sendData (line_);
}

// Entry point =================================================================
main ();

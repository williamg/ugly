// Requires ====================================================================
var pkg = require ('./package.json');
var log = require ('./logging.js');
var commands = require ('./commands.js');
var express = require ('express');
var WebSocketServer = require ('ws').Server;


// Constants ===================================================================
var VERSION         = pkg.version;
var LOG_FILE        = 'ugly.log';
var VIEWER_PORT     = 3333;
var VIEWER_ADDR     = 'localhost:' + VIEWER_PORT;
var SOCKET_PORT     = 4444;
var CHUNK_HANDLERS = {
	'CONFIG': function (line_) {
		validateCommand (line_, 'CONFIG', commands.configCommands);
	},
	'FRAME': function (line_) {
		validateCommand (line_, 'FRAME', commands.frameCommands);
	}
};

// Globals =====================================================================
var ugly = {
	server: new WebSocketServer ({ port: SOCKET_PORT}),
	socket: undefined,
	currentChunk: undefined,
	lineHandler: undefined,
	configChunk: []
};


// Main code ==================================================================

// Start listening on stdin
function main () {
	log.initLog (LOG_FILE, VERSION);
	log.info ("Initializing...");

	readlines (handleLine);
	serveViewer ();
	
	// Once a viewer connects, we need to send the most recent config chunk if
	// there is one
	connectToViewer (function () {
		for (var i = 0; i < ugly.configChunk.length; i++) {
			sendData (ugly.configChunk[i]);
		}
	});
}

// Serve the static viewer
function serveViewer () {
	var app = express ();

	app.use (express.static (__dirname + '/viewer'));
	app.listen (VIEWER_PORT);

	log.info ('Serving viewer at ' + VIEWER_ADDR);
}

// Attempt to establish a WebSocket connection with the viewer
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
	process.stdin.on ('data', function (chunk) {
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

// Returns true iff string_ starts with prefix_
function startsWith (prefix_, string_) {
	console.assert (typeof (prefix_) === 'string');
	console.assert (typeof (string_) === 'string');

	return string_.indexOf (prefix_) === 0;
}

// Write data_ to the client via websockets
function sendData (data_) {
	console.assert (typeof (data_) === 'string');

	if (ugly.socket === undefined)
		return;

	ugly.socket.send (data_, function (err_) {
		if (err_)
			log.error (err_);
	});
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

			if (ugly.currentChunk === 'CONFIG')
				ugly.configChunk.push (line_);

			ugly.lineHandler = undefined;
			ugly.currentChunk = undefined;
			break;
		}
	}

	// Only handle commands, not declarations or terminations
	if (! startsWith ('$', line_))
			ugly.lineHandler (line_);

	if (ugly.currentChunk === 'CONFIG')
		ugly.configChunk.push (line_);

	// We send everything, though
	sendData (line_);
}

// Takes the given line and validates that it matches one of the commands in
// chunkCommands_
function validateCommand (line_, chunkName_, chunkCommands_) {
	var argList = line_.match (/\S+/g);

	var command = chunkCommands_[argList[0]];

	if (command === undefined)
		log.error ('Unknown ' + chunkName_ + ' command "' + argList[0] + '"');

	var paramList = argList.slice (1);

	for (var paramName in command.params) {
		var paramType = command.params[paramName];
		var result = paramType.validate (paramList);

		if (typeof (result) === 'string') {
			log.error ('Error processing param "' + paramName + '" in '+
			           'command "' + argList[0] + '": ' + result);
		} else {
			console.assert (result.constructor === Array);
			paramList = result;
		}
	}

	if (paramList.length !== 0)
		log.error ('Extraneous parameters: ' + line_);
}


// Entry point =================================================================
main ();

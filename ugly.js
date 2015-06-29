#!/usr/bin/env node

// Requires ====================================================================
var pkg = require ('./package.json');
var log = require ('./lib/logging.js');
var commands = require ('./lib/commands.js');
var express = require ('express');
var program = require ('commander');
var WebSocketServer = require ('ws').Server;


// Constants ===================================================================
var VERSION         = pkg.version;
var VIEWER_PREFIX   = 'localhost:';
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
	viewerPort: 3333,
	logFile: 'ugly.log',
	rate: undefined,
	server: new WebSocketServer ({ port: SOCKET_PORT}),
	socket: undefined,
	currentChunk: undefined,
	lineHandler: undefined,
	configChunk: [],
	unhandledLines: []
};


// Main code ==================================================================

// Start listening on stdin
function main (config_) {
	ugly.viewerPort = config_.viewerPort || ugly.viewerPort;
	ugly.logFile = config_.logFile || ugly.logFile;
	ugly.rate = config_.rate;

	log.initLog (ugly.logFile, VERSION);
	log.info ("Initializing...");

	if (ugly.rate && ugly.rate >= 0) {
		readlines (function (line_) {
			ugly.unhandledLines.push (line_);
		});

		setInterval (function () {
			handleLine (ugly.unhandledLines.shift ());
		}, 1000 / ugly.rate);

	} else {
		readlines (handleLine);
	}

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

	// Need to do better than this
	app.use (express.static (__dirname));
	app.listen (ugly.viewerPort);

	log.info ('Serving viewer at ' + VIEWER_PREFIX + ugly.viewerPort);
}

// Attempt to establish a WebSocket connection with the viewer
function connectToViewer (callback_) {
	ugly.server.on ('connection', function (socket_) {
		log.info ('Viewer connected');

		ugly.socket = socket_;

		ugly.socket.on ('close', function () {
			log.info ('Viewer disconnected');
			ugly.socket = undefined;
		});

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

	var commandName = argList.shift ();
	var command = chunkCommands_[commandName];

	if (command === undefined)
		log.error ('Unknown ' + chunkName_ + ' command "' + commandName + '"');

	for (var i = 0; i < command.params.length; i++) {
		var paramName = command.params[i].name;
		var paramType = command.params[i].type;
		var error = paramType.validate (argList);

		if (error) {
			log.error ('Error processing param "' + paramName + '" in '+
			           'command "' + commandName + '": ' + error + '\n' +
			           'Command: ' + line_);
		}
	}

	if (argList.length !== 0)
		log.error ('Extraneous parameters: ' + line_);
}


// Parse options ===============================================================
// TODO: The following command line options need to be implemented:
// - Verbosity
// - Configurable web socket port

program
	.version (VERSION)
	.description ('Launch the ugly server and serve the viewer')
	.option ('-r, --rate <n>', 'The max frame-rate', parseInt)
	.option ('-p, --viewer-port <n>', 'The port on which to serve the viewer', parseInt)
	.option ('-l, --log-file <path>', 'The location to write log files')
	.parse (process.argv);

main (program);

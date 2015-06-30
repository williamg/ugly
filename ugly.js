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
var SOCKET_PORT     = 4444;
var CHUNK_HANDLERS = {
	CONFIG: handleConfigLine,
	FRAME: handleFrameLine,
};

// Globals =====================================================================
var ugly = {
	accumulator: 0,
	currentChunk: undefined,
	configChunk: undefined,
	frameChunks: [],
	lastFrame: Date.now (),
	lineHandler: undefined,
	logFile: 'ugly.log',
	rate: 120,
	server: new WebSocketServer ({ port: SOCKET_PORT}),
	socket: undefined,
	started: false,
	viewerPort: 3333,
};


// Main code ==================================================================

// Entry point. Starts the application
function main (config_) {
	// Set options
	ugly.viewerPort = config_.viewerPort || ugly.viewerPort;
	ugly.logFile = config_.logFile || ugly.logFile;
	ugly.rate = config_.rate || ugly.rate;

	log.initLog (ugly.logFile, VERSION);
	log.info ("Initializing...");

	// Serve the static viewer webpage
	serveViewer ();

	// Once a viewer connects, we need to send the most recent config chunk if
	// there is one
	connectToViewer (function () {
		sendChunk (ugly.configChunk);
	});

	readlines (handleLine);
}

// Serve the static viewer
function serveViewer () {
	var app = express ();
	// Need to do better than this
	app.use (express.static (__dirname));
	app.listen (ugly.viewerPort);

	log.info ('Serving viewer at localhost:' + ugly.viewerPort);
}

// Attempt to establish a WebSocket connection with the viewer
function connectToViewer (callback_) {
	console.assert (typeof (callback_) === 'function');

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

// This function makes sure that we send frames as close to the specified rate
// as possible.
//
// Suppose the user specifies a rate of 10. So we should be sending
// a frame every 100ms. Unfortunately, Javascript can't guarantee that this
// function will be called in exactly 100ms. Suppose it's called in 102ms.
// So 102ms has elapsed, but we're supposed to send a frame every 100ms. Well,
// we see that enough time has elapsed for us to send 1 frame, so we do. That
// leaves 2ms unaccounted for, though, so those are added to an accumulator.
// Now suppose on the next go round the function is called in 98ms. Normally,
// that's not enough time to send a new frame, but we have those 2ms left over
// so we add those in to get 100ms and we can send a new frame. Our accumulator
// is then set back to 0.
function sendFrame () {
	var time = Date.now ();
	var diff = time - ugly.lastFrame;

	// This is the total amount of time that hasn't been accounted for
	var total = diff + ugly.accumulator;

	var freq = 1000 / ugly.rate;
	var rem = (diff + ugly.accumulator) % freq;
	var frames = (total - rem) / freq;
	frames = Math.min (frames, ugly.frameChunks.length);

	// Timer to send the next frame
	setTimeout (sendFrame, freq);

	// Not enough time elapsed to send a new frame
	if (frames === 0)
		return;

	ugly.accumulator = rem;
	ugly.lastFrame = time;

	// Don't try to send if the client hasn't connected
	if (ugly.socket === undefined)
		return;

	var frameToSend;
	for (var i = 0; i < frames; ++i)
		frameToSend = ugly.frameChunks.shift ();

	sendChunk (frameToSend);
}

function sendChunk (chunk_) {
	console.assert (ugly.socket !== undefined);

	for (var l in chunk_) {
		ugly.socket.send (chunk_[l], log.error);
	}
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

			ugly.currentChunk = undefined;
			break;
		}
	}

	ugly.lineHandler (line_);
}

function handleConfigLine (line_) {
	if (startsWith ('$CONFIG', line_)) {
		if (ugly.configChunk !== undefined) {
			log.error ('Unexpected CONFIG chunk. At most 1 CONFIG chunk ' +
			          'is allowed and it must be the first chunk.');
		}

		ugly.configChunk = [];
	}

	validateCommand (line_, 'CONFIG', commands.configCommands);
	ugly.configChunk.push (line_);

	if (startsWith ('$END_CONFIG', line_) && ugly.socket !== undefined)
		sendChunk (ugly.configChunk);
}

function handleFrameLine (line_) {
	if (startsWith ('$FRAME', line_)) {
		ugly.frameChunks.push ([]);
	}

	var index = ugly.frameChunks.length - 1;

	validateCommand (line_, 'FRAME', commands.frameCommands);
	ugly.frameChunks[index].push (line_);

	if (startsWith ('$END_FRAME', line_) && ! ugly.started) {
		ugly.started = true;
		sendFrame ();
	}
}

// Takes the given line and validates that it matches one of the commands in
// chunkCommands_
function validateCommand (line_, chunkName_, chunkCommands_) {
	if (startsWith ('$' + chunkName_, line_) ||
	    startsWith ('$END_' + chunkName_, line_))
		return;

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
// - Accept input from file rather than stdin

program
	.version (VERSION)
	.description ('Launch the ugly server and serve the viewer')
	.option ('-r, --rate <n>',
	         'The max frame-rate. (10-120 for best results, default 120)',
	         parseInt)
	.option ('-p, --viewer-port <n>',
	         'The port on which to serve the viewer (default 3333)', parseInt)
	.option ('-l, --log-file <path>',
	         'The location to write log files (default "ugly.js"')
	.parse (process.argv);

main (program);

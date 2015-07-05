var log = require ('./logging.js');
var ChunkSender = require ('./chunkSender.js');
var Validator = require ('./validator.js');

var express = require ('express');
var WebSocketServer = require ('ws').Server;


// =============================================================================
// UGLY SERVER
// This class listens for incoming commands on stdin, validates them, and
// forwards them to the client viewer
// =============================================================================

// Constants ===================================================================
var DEFAULT_LOG_FILE    = 'ugly.log';
var DEFAULT_VIEWER_PORT = 3333;
var DEFAULT_SOCKET_PORT = 4444;

// Class =======================================================================
function UglyServer (config_) {
	this._logFile = config_.logFile || DEFAULT_LOG_FILE;
	this._viewerPort = config_.viewerPort || DEFAULT_VIEWER_PORT;
	this._socketPort = config_.socketPort || DEFAULT_SOCKET_PORT;

	log = log.init (this._logFile, config_.verbosity);
	log.info ("Initializing...");

	this._chunkSender = new ChunkSender (config_.rate);
	this._validator = new Validator (
		this._chunkSender.handleConfigChunk.bind (this._chunkSender),
		this._chunkSender.handleFrameChunk.bind (this._chunkSender));

	this._init ();
}

// Private functions ===========================================================
// Start the server
UglyServer.prototype._init = function () {
	console.assert (this instanceof UglyServer);

	this._serveViewer ();
	this._connectToViewer ();
	this._readlines (this._validator.validateLine.bind (this._validator));
};

// Serve the static viewer
UglyServer.prototype._serveViewer = function () {
	console.assert (this instanceof UglyServer);

	var app = express ();
	var uglyServer = this;

	// Need to do better than this
	app.use (express.static (__dirname + '/../'));
	app.listen (this._viewerPort);

	app.get ('/port', function (req, res) {
		res.json ({port: uglyServer._socketPort});
	});

	log.info ('Serving viewer at localhost:' + this._viewerPort);
};

// Attempt to establish a WebSocket connection with the viewer
UglyServer.prototype._connectToViewer = function () {
	console.assert (this instanceof UglyServer);

	var server = new WebSocketServer ({ port: this._socketPort});
	var uglyServer = this;

	server.on ('connection', function (socket_) {
		log.info ('Viewer connected');

		uglyServer._chunkSender.setSocket (socket_);
	
		socket_.on ('close', function () {
			log.info ('Viewer disconnected');
			uglyServer._chunkSender.setSocket (undefined);
		});
	});
};

// Listen on stdin and call callback_ on each line
UglyServer.prototype._readlines = function (callback_) {
	console.assert (this instanceof UglyServer);

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
};

// Temporary hack
module.exports = UglyServer;

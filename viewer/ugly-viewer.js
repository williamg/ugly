// Constants ===================================================================
var SOCKET_PORT = 4444;
var SOCKET_SERVER = 'ws://127.0.0.1:' + SOCKET_PORT;

// Globals =====================================================================
var ugly = {
	canvas: undefined,
	context: undefined,
	currentChunk: undefined,
	queuedCommands: [],
	defaultConfig: [
		'letterbox_color 0 0 0',
		'canvas_size 640 480',
	],
};

// Main code ===================================================================
function initCanvas () {
	ugly.canvas = document.getElementById ('canvas');
	ugly.context = ugly.canvas.getContext ('2d');

	ugly.queuedCommands = ugly.defaultConfig;
	processQueuedCommands ();
}

function initConnection () {
	console.log ('Attempting to connect to websocket server ' + SOCKET_SERVER);
	var socket = new WebSocket (SOCKET_SERVER);

	socket.onerror = function (err_) {
		console.log (err_);
	};

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

	var red = argList[1];
	var green = argList[2];
	var blue = argList[3];

	document.body.style.background = 'rgb(' + red + ',' + green + ',' +
	                                 blue + ')';
}

function canvasSize (command_) {
	var argList = toArgList (command_);

	var width = parseInt (argList[1]);
	var height = parseInt (argList[2]);

	ugly.canvas.width = width;
	ugly.canvas.height = height;
	ugly.canvas.style.width = width;
	ugly.canvas.style.height = height;
}

function fillStyleColor (command_) {
	var argList = toArgList (command_);

	var red = parseInt (argList[1]);
	var green = parseInt (argList[2]);
	var blue = parseInt (argList[3]);
	var alpha = parseFloat (argList[4]);

	ugly.context.fillStyle = 'rgba(' + red + ',' + green + ',' +
	                          blue + ',' + alpha + ')';
}

function fillRect (command_) {
	var argList = toArgList (command_);

	var x = parseInt (argList[1]);
	var y = parseInt (argList[2]);
	var width = parseInt (argList[3]);
	var height = parseInt (argList[4]);

	ugly.context.fillRect (x, y, width, height);
}

function strokeStyleColor (command_) {
	var argList = toArgList (command_);

	var red = parseInt (argList[1]);
	var green = parseInt (argList[2]);
	var blue = parseInt (argList[3]);
	var alpha = parseFloat (argList[4]);

	ugly.context.strokeStyle = 'rgba(' + red + ',' + green + ',' +
	                           blue + ',' + alpha + ')';
}

function shadowColor (command_) {
	var argList = toArgList (command_);

	var red = parseInt (argList[1]);
	var green = parseInt (argList[2]);
	var blue = parseInt (argList[3]);
	var alpha = parseFloat (argList[4]);

	ugly.context.shadowColor = 'rgba(' + red + ',' + green + ',' +
	                           blue + ',' + alpha + ')';
}

function shadowBlur (command_) {
	var argList = toArgList (command_);

	ugly.context.shadowBlur = parseInt (argList[1]);
}

function shadowOffsetX (command_) {
	var argList = toArgList (command_);

	ugly.context.shadowOffsetX = parseInt (argList[1]);
}

function shadowOffsetY (command_) {
	var argList = toArgList (command_);

	ugly.context.shadowOffsetY = parseInt (argList[1]);
}

// Executes all the commands in the queue
function processQueuedCommands () {
	for (var i = 0; i < ugly.queuedCommands.length; i++) {
		var command = ugly.queuedCommands[i];

		if (startsWith ('letterbox_color', command)) {
			letterboxColor (command);
		} else if (startsWith ('canvas_size', command)) {
			canvasSize (command);
		} else if (startsWith ('fill_style_color', command)) {
			fillStyleColor (command);
		} else if (startsWith ('fill_rect', command)) {
			fillRect (command);
		} else if (startsWith ('shadow_color', command)) {
			shadowColor (command);
		} else if (startsWith ('shadow_blur', command)) {
			shadowBlur (command);
		} else if (startsWith ('shadow_offset_x', command)) {
			shadowOffsetX (command);
		} else if (startsWith ('shadow_offset_y', command)) {
			shadowOffsetY (command);
		} else if (startsWith ('stroke_style_color', command)) {
			strokeStyleColor (command);
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
	initCanvas ();
	initConnection ();
}) ();

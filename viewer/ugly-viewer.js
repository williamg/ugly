// Constants ===================================================================
var SOCKET_PORT = 4444;
var SOCKET_SERVER = 'ws://localhost:' + SOCKET_PORT;

// Main code ===================================================================
function initConnection () {
	console.log ('Attempting to connect to websocket server ' + SOCKET_SERVER);
	var socket = new WebSocket (SOCKET_SERVER);

	socket.onmessage = function (message_) {
		console.log (message_.data);
	};

	socket.onclose = function () {
		console.log ('Socket closed, attempting to reconnect in 5 seconds...');
		setTimeout (initConnection, 5 * 1000);
	};
}

(function () {
	initConnection ();
}) ();

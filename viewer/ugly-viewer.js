function initConnection () {
	var socket = new WebSocket ('ws://localhost:4444');

	socket.onmessage = function (message_) {
		console.log (message_.data);
	};
}

(function () {
	initConnection ();
}) ();

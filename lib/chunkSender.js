var log = require ('./logging.js');

// =============================================================================
// CHUNK SENDER
// This module is responsible for sending chunks to the user.
// =============================================================================

// Constants ==================================================================
var DEFAULT_RATE = 120;

// Class =======================================================================
function ChunkSender (frameRate_) {
	log = log.logger;

	this._socket = undefined;               // Connection to client

	this._configChunk = undefined;          // Most recent config chunk
	this._frameQueue = [];                  // Unhandled frame chunks
	this._latestFrame = undefined;          // Most recent frame

	frameRate_ = frameRate_ || DEFAULT_RATE;

	this._started = false;                  // Whether or not we've started
	this._interval = 1000 / frameRate_;     // How frequently to send frames
	this._lastFrame = undefined;            // When we send the last frame
	this._accumulator = 0;                  // 'Extra' time
}

// Private functions ===========================================================
// If a client is connected, send a chunk
ChunkSender.prototype._sendChunk = function (chunk_) {
	console.assert (this instanceof ChunkSender);
	console.assert (chunk_ !== undefined);

	if (this._socket === undefined)
		return;

	function throwError (msg) {
		if (msg)
			throw new Error (msg);
	}

	for (var i in chunk_) {
		this._socket.send (chunk_[i], throwError);
	}
};

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
ChunkSender.prototype._sendFrame = function () {
	console.assert (this instanceof ChunkSender);

	var time = Date.now ();
	var diff = this._interval || time - this._lastFrame;

	// This is the total amount of time that hasn't been accounted for
	var total = diff + this._accumulator;
	var rem = total % this._interval;
	var frames = Math.min ((total - rem) / this._interval, this._frameQueue.length);

	// Enough time has elapsed that we should send a frame
	if (frames !== 0) {
		this._accumulator = rem;
		this._lastFrame = time;

		// If we should send n frames, we're only going to send the nth one
		// so we can forget about the first n-1 unsent frames
		this._frameQueue.splice (0, frames-1);

		this._sendChunk (this._frameQueue.shift ());
	}

	// Timer to send the next frame
	setTimeout (this._sendFrame.bind (this), this._interval);
};

// Public functions ============================================================
ChunkSender.prototype.setSocket = function (socket_) {
	console.assert (this instanceof ChunkSender);

	this._socket = socket_;

	if (this._configChunk !== undefined)
		this._sendChunk (this._configChunk);

	if (this._latestFrame !== undefined)
		this._sendChunk (this._latestFrame);
};

ChunkSender.prototype.handleConfigChunk = function (configChunk_) {
	console.assert (this instanceof ChunkSender);

	this._configChunk = configChunk_;
	this._sendChunk (this._configChunk);
};

ChunkSender.prototype.handleFrameChunk = function (frameChunk_) {
	console.assert (this instanceof ChunkSender);

	this._frameQueue.push (frameChunk_);
	this._latestFrame = frameChunk_;

	if (!this._started) {
		this._started = true;
		this._sendFrame ();
	}
};

module.exports = ChunkSender;


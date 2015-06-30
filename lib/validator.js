var log = require ('./logging.js');
var commands = require ('./commands.js');

// =============================================================================
// VALIDATOR
// This module is responsible for validating input to the ugly server.
// It takes in two callbacks on construction to handle complete, valid CONFIG
// and FRAME  chunks respectively.
// =============================================================================

// Constants ===================================================================
var CHUNK_COMMANDS = {
	'CONFIG': commands.configCommands,
	'FRAME': commands.frameCommands
};

// Class =======================================================================
function Validator (configCallback_, frameCallback_) {
	this.callbacks = {
		CONFIG: configCallback_,
		FRAME: frameCallback_
	};

	this.parsedConfigChunk = false;
	this.parsedFrameChunk = false;

	this.currentChunk = undefined;
	this.chunkData = [];
}

// Private functions ===========================================================
Validator.prototype._handleCompleteChunk = function () {
	console.assert (this instanceof Validator);
	console.assert (this.chunkData.length >= 2);
	console.assert (typeof (this.callbacks[this.currentChunk]) === 'function');

	var chunkCopy = this.chunkData.splice (0);
    var callback = this.callbacks[this.currentChunk];

	this.chunkData = [];
    this.currentChunk = undefined;

	return callback (chunkCopy);
};

// Takes the given line and validates that it matches one of the commands in
// commands_
Validator.prototype._validateCommand = function (line_, commands_) {
	console.assert (this instanceof Validator);

	var argList = line_.match (/\S+/g);

	var commandName = argList.shift ();
	var command = commands_[commandName];

	if (command === undefined)
		log.error ('Unknown ' + this.currentChunk + ' command "' + commandName + '"');

	for (var i = 0; i < command.params.length; i++) {
		var paramName = command.params[i].name;
		var paramType = command.params[i].type;
		var error = paramType.validate (argList);

		if (error !== undefined) {
			log.error ('Error processing param "' + paramName + '" in '+
			           'command "' + commandName + '": ' + error + '\n' +
			           'Command: ' + line_);
		}
	}

	if (argList.length !== 0)
		return log.error ('Extraneous parameters: ' + line_);

	this.chunkData.push (line_);
};


// Public functions ============================================================
Validator.prototype.validateLine = function (line_) {
	console.assert (this instanceof Validator);

	if (line_.length === 0)
		return;

	var line = line_.trim ();

	if (this.currentChunk !== undefined) {
		// Found a terminator
		if (line === '$END_' + this.currentChunk) {
			this.chunkData.push (line);
			return this._handleCompleteChunk ();
		}

		// Must be a command
		return this._validateCommand (line, CHUNK_COMMANDS[this.currentChunk]);
	}

	// Since we're expecting a chunk declaration, we shouldn't have any data
	console.assert (this.chunkData.length === 0);

	if (line === '$CONFIG') {
		if (this.parsedConfig)
			return log.error ('There may only be one CONFIG chunk.');

		if (this.parsedFrame)
			return log.error ('The CONFIG chunk must be the first chunk.');

		this.parsedConfig = true;
		this.currentChunk = 'CONFIG';
		this.chunkData = [line];
		return;
	}

	if (line === '$FRAME') {
		this.parsedFrame = true;
		this.currentChunk = 'FRAME';
		this.chunkData = [line];
		return;
	}

	log.error ('Expected chunk declaration, found "' + line + '" instead.');
};

module.exports = Validator;

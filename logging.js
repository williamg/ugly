var fs = require ('fs');

var logger = {
	_logFile: undefined,
	initLog: function (logfile_, version_) {
		logger._logFile = logfile_;

		// Clear the log
		fs.writeFileSync (logger._logFile, "");

		// Write header data
		fs.appendFileSync (logger._logFile,
		                   'Created with ugly v' + version_);
		fs.appendFileSync (logger._logFile,
		                   'Start date: ' + (new Date ().toString ()));
		fs.appendFileSync (logger._logFile,
		                   '=================================================');
	},
	// Print an info (non-fatal) message to the console and the log file
	info: function (msg_) {
		var time = new Date ().getTime ();

		msg_ = '[' + time + '] INFO: ' + msg_;

		console.log (msg_);
		fs.appendFileSync (logger._logFile, msg_);
	},
	// Print an error (fatal) message to the consol and the log file and then
	// kill the program
	error: function (msg_) {
		var time = new Date ().getTime ();

		msg_ = '[' + time + '] ERROR: ' + msg_;

		console.error (msg_);
		fs.appendFileSync (logger._logFile, msg_);
		process.exit (1);
	}
};

module.exports = logger;



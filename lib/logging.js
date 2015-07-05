var pkg = require ('../package.json');
var winston = require ('winston');

// Cosntants ===================================================================
var DEFAULT_VERBOSITY = 2;

var LEVELS = {
	file: 0,
	info: 1,
	error: 2,
	_silent: 3
};

var COLORS = {
	file: 'green',
	info: 'white',
	error: 'red',
	_silent: 'black',
};

var VERBOSITY_LEVELS = [
	{ console: '_silent', file: '_silent' },
	{ console: '_silent', file: 'file' },
	{ console: 'error', file: 'file' },
	{ console: 'info', file: 'file' }
];

// Logger ======================================================================
var wrap = module.exports = {
	init: function (filename_, verbosity_) {
		var verbosity = verbosity_ || DEFAULT_VERBOSITY;

		// Clip verbosity from 0-VERBOSITY_LEVELS.length-1
		verbosity = Math.min (VERBOSITY_LEVELS.length-1,
		                      Math.max (0, verbosity));

		wrap.logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console) ({
					colorize: true,
					level: VERBOSITY_LEVELS[verbosity].console,
					showLevel: true,
					handleExceptions: true,
					humanReadableUnhandledException: true,
				}),
				new (winston.transports.File) ({
					level: VERBOSITY_LEVELS[verbosity].file,
					timestamp: true,
					filename: filename_,
					showLevel: true,
					json: false,
					handleExceptions: true,
					humanReadableUnhandledException: true,
				}),
			],
			levels: LEVELS,
		});

		winston.addColors (COLORS);

		wrap.logger.file ('Created with ugly.' + pkg.version);
		wrap.logger.file ('Start date: ' + (new Date ().toString ()));
		wrap.logger.file ('=======================================================');
		wrap.logger.info ('Verbosity: ' + verbosity);

		return wrap.logger;
	},
	logger: undefined,
};



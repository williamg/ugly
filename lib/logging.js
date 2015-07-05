var pkg = require ('../package.json');
var winston = require ('winston');

var wrap = module.exports = {
	init: function (filename_) {
		wrap.logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console) ({
					colorize: true,
					level: 'info',
					showLevel: true,
					handleExceptions: true,
					humanReadableUnhandledException: true,
				}),
				new (winston.transports.File) ({
					level: 'file',
					timestamp: true,
					filename: filename_,
					showLevel: true,
					json: false,
					handleExceptions: true,
					humanReadableUnhandledException: true,
				}),
			],
			levels: {
				file: 0,
				info: 1,
				error: 2,
			},
		});

		winston.addColors ({
			info: 'white',
			error: 'red',
			file: 'green',
		});

		wrap.logger.file ('Created with ugly.' + pkg.version);
		wrap.logger.file ('Start date: ' + (new Date ().toString ()));
		wrap.logger.file ('=======================================================');

		return wrap.logger;
	},
	logger: undefined,
};



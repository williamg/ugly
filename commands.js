var log = require ('./logging.js');

// Parameter validation ========================================================
var paramTypes = {
	INT: {
		name: 'int',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No int parameter given.';

			var val = argList_[0];

			if (! isNaN (parseInt (val)))
				return argList_.splice (1);

			return 'Int parameter invalid: ' + val;
		},
	},
	FLOAT: {
		name: 'float',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No float parameter given.';

			var val = argList_[0];

			if (! isNaN (parseFloat (val)))
				return argList_.splice (1);

			return 'Float parameter invalid: ' + val;
		},
	},
	RGB_COLOR: {
		name: 'rgb color',
		validate: function (colorList_) {
			if (colorList_.length < 3)
				return 'All 3 color components must be provided.';

			var red = parseInt (colorList_[0]);
			var green = parseInt (colorList_[1]);
			var blue = parseInt (colorList_[2]);

			if (isNaN (red) || red < 0 || red > 255)
				return 'Invalid red parameter: ' + colorList_[0];

			if (isNaN (green) || green < 0 || green > 255)
				return 'Invalid green parameter: ' + colorList_[1];

			if (isNaN (blue) || blue < 0 || blue > 255)
				return 'Invalid blue parameter: ' + colorList_[2];

			return colorList_.splice (3);
		},
	},
	RGBA_COLOR: {
		name: 'rgba color',
		validate: function (colorList_) {
			if (colorList_.length < 4)
				return 'All 4 color components must be provided.';

			var red = parseInt (colorList_[0]);
			var green = parseInt (colorList_[1]);
			var blue = parseInt (colorList_[2]);
			var alpha = parseFloat (colorList_[3]);

			if (isNaN (red) || red < 0 || red > 255)
				return 'Invalid red parameter: ' + colorList_[0];

			if (isNaN (green) || green < 0 || green > 255)
				return 'Invalid green parameter: ' + colorList_[1];

			if (isNaN (blue) || blue < 0 || blue > 255)
				return 'Invalid blue parameter: ' + colorList_[2];

			if (isNaN (alpha) || alpha < 0 || alpha > 1)
				return 'Invalid alpha parameter: ' + colorList_[3];

			return colorList_.splice (4);
		},
	},
};


// Command definitions =========================================================
var configCommands = {
	letterbox_color: {
		params: {
			color: paramTypes.RGB_COLOR,
		}
	},
	canvas_size: {
		name: 'canvas_size',
		params: {
			width: paramTypes.INT,
			height: paramTypes.INT,
		}
	},
};

var  frameCommands = {
	fill_style_color: {
		params: {
			color: paramTypes.RGBA_COLOR,
		}
	},
	fill_rect: {
		params: {
			x: paramTypes.INT,
			y: paramTypes.INT,
			width: paramTypes.INT,
			height: paramTypes.INT,
		}
	},
};


// Command validation ==========================================================
function validateCommand (line_, chunkName_, chunkCommands_) {
	var argList = line_.match (/\S+/g);

	var command = chunkCommands_[argList[0]];

	if (command === undefined)
		log.error ('Unknown ' + chunkName_ + ' command "' + argList[0] + '"');

	var paramList = argList.slice (1);

	for (var paramName in command.params) {
		var paramType = command.params[paramName];
		var result = paramType.validate (paramList);

		if (typeof (result) === 'string') {
			log.error ('Error processing param "' + paramName + '" in '+
			           'command "' + argList[0] + '": ' + result);
		} else {
			console.assert (result.constructor === Array);
			paramList = result;
		}
	}

	if (paramList.length !== 0)
		log.error ('Extraneous parameters: ' + line_);
}

module.exports = {
	validateConfigCommand: function (line_) {
		validateCommand (line_, 'CONFIG', configCommands);
	},
	validateFrameCommand: function (line_) {
		validateCommand (line_, 'FRAME', frameCommands);
	}
};

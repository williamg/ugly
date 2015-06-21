// Parameter validation ========================================================
var paramTypes = {
	UNSIGNED: {
		name: 'unsigned',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No int parameter given.';

			var val = parseInt (argList_[0]);

			if (! isNaN (val) && val >= 0)
				return argList_.splice (1);

			return 'Unsigned parameter invalid: ' + val;
		},
	},
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
	shadow_blur: {
		params: {
			blur: paramTypes.UNSIGNED
		}
	},
	shadow_color: {
		params: {
			colors: paramTypes.RGBA_COLOR,
		}
	},
	shadow_offset_x: {
		params: {
			xOffset: paramTypes.INT
		}
	},
	shadow_offset_y: {
		params: {
			yOffset: paramTypes.INT
		},
	},
	stroke_style_color: {
		params: {
			color: paramTypes.RGBA_COLOR,
		}
	},
};

module.exports = {
	configCommands: configCommands,
	frameCommands: frameCommands,
};

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
		value: function (argList_) {
			return {
				value: parseInt (argList_[0]),
				remaining: argList_.splice (1)
			};
		}
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
		value: function (argList_) {
			return {
				value: parseInt (argList_[0]),
				remaining: argList_.splice (1)
			};
		}
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
		value: function (argList_) {
			return {
				value: parseFloat (argList_[0]),
				remaining: argList_.splice (1)
			};
		}
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
		value: function (colorList_) {
			var red = parseInt (colorList_[0]);
			var green = parseInt (colorList_[1]);
			var blue = parseInt (colorList_[2]);

			return {
				value: 'rgb(' + red + ',' + green + ',' + blue + ')',
				reminaing: colorList_.splice(3)
			};
		}
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
		value: function (colorList_) {
			var red = parseInt (colorList_[0]);
			var green = parseInt (colorList_[1]);
			var blue = parseInt (colorList_[2]);
			var alpha = parseFloat (colorList_[3]);

			return {
				value: 'rgba(' + red + ',' + green + ',' + blue + ',' +
				       alpha + ')',
				reminaing: colorList_.splice(4)
			};
		}
	},
};

// Command definitions =========================================================
var commandTypes = {
	PROPERTY: 'property',
	METHOD: 'method',
};

function param (name_, type_) {
	return {name: name_, type: type_};
}

var configCommands = {
	letterbox_color: {
		params: [
			param ('color', paramTypes.RGB_COLOR)
		]
	},
	canvas_size: {
		params: [
			param ('width', paramTypes.INT),
			param ('height', paramTypes.INT)
		]
	},
};

var  frameCommands = {
	fill_style_color: {
		name: 'fillStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('color', paramTypes.RGBA_COLOR)
		]
	},
	fill_rect: {
		name: 'fillRect',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.INT),
			param ('y', paramTypes.INT),
			param ('width', paramTypes.INT),
			param ('height', paramTypes.INT)
		]
	},
	shadow_blur: {
		name: 'shadowBlur',
		type: commandTypes.PROPERTY,
		params: [
			param ('blur', paramTypes.UNSIGNED)
		]
	},
	shadow_color: {
		name: 'shadowColor',
		type: commandTypes.PROPERTY,
		params: [
			param ('color', paramTypes.RGBA_COLOR)
		]
	},
	shadow_offset_x: {
		name: 'shadowOffsetX',
		type: commandTypes.PROPERTY,
		params: [
			param ('xOffset', paramTypes.INT)
		]
	},
	shadow_offset_y: {
		name: 'shadowOffsetY',
		type: commandTypes.PROPERTY,
		params: [
			param ('yOffset', paramTypes.INT)
		]
	},
	stroke_style_color: {
		name: 'strokeStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('color', paramTypes.RGBA_COLOR)
		]
	},
};

var commands = {
	configCommands: configCommands,
	frameCommands: frameCommands
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = commands;
} else {
	window.commands = commands;
}

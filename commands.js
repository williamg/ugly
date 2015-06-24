/* global ugly */

// Parameter validation ========================================================
// Every parameter type comes with a name, a validate function, and a value
// function. The name doesn't really matter. The validate function consumes
// arguments from the provided argument list and returns an error string if
// the parameter is invalid. Otherwise, undefined is returned.
// The value function assumes the parameter is valid and returns the
// appropriate javascript type represented by the parameter

var paramTypes = {
	// Dynamic types
	BOUNDED_INT: function (min_, max_) {
		return {
			name: 'bounded int',
			validate: function (argList_) {
				if (argList_.length < 1)
					return 'No int parameter given.';

				var val = argList_.shift ();
				var num = parseInt (val);

				if (! isNaN (num) && num >= min_ && num <= max_)
					return undefined;

				return 'Invalid int parameter: ' + val;
			},
			value: function (argList_) {
				return parseInt (argList_.shift ());
			}
		};
	},
	BOUNDED_FLOAT: function (min_, max_) {
		return {
			name: 'bounded int',
			validate: function (argList_) {
				if (argList_.length < 1)
					return 'No int parameter given.';

				var val = argList_.shift ();
				var num = parseFloat (val);

				if (! isNaN (num) && num >= min_ && num <= max_)
					return undefined;

				return 'Invalid float parameter: ' + val;
			},
			value: function (argList_) {
				return parseFloat (argList_.shift ());
			}
		};
	},
	STRING_ENUM: function (options_) {
		return {
			name: 'string enum',
			validate: function (argList_) {
				if (argList_.length < 1)
					return 'Option must be provided.';

				var val = argList_.shift ();

				if (options_.indexOf (val) === -1)
					return 'Invalid option "' + val + '"';

				return undefined;
			},
			value: function(argList_) {
				return argList_.shift ();
			}
		};
	},

	// Explicit types
	UNSIGNED: {
		name: 'unsigned',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No int parameter given.';

			var val = parseInt (argList_.shift ());

			if (! isNaN (val) && val >= 0)
				return undefined;

			return 'Unsigned parameter invalid: ' + val;
		},
		value: function (argList_) {
			return parseInt (argList_.shift ());
		}
	},
	INT: {
		name: 'int',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No int parameter given.';

			var val = argList_.shift ();

			if (! isNaN (parseInt (val)))
				return undefined;

			return 'Int parameter invalid: ' + val;
		},
		value: function (argList_) {
			return parseInt (argList_.shift ());
		}
	},
	FLOAT: {
		name: 'float',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No float parameter given.';

			var val = argList_.shift ();

			if (! isNaN (parseFloat (val)))
				return undefined;

			return 'Float parameter invalid: ' + val;
		},
		value: function (argList_) {
			return parseFloat (argList_.shift ());
		}
	},
	RGB_COLOR: {
		name: 'rgb color',
		validate: function (argList_) {
			if (argList_.length < 3)
				return 'All 3 color components must be provided.';

			var COLOR_VAL = paramTypes.BOUNDED_INT (0, 255);
			var res = COLOR_VAL.validate (argList_) ||
			          COLOR_VAL.validate (argList_) ||
			          COLOR_VAL.validate (argList_);

			if (res)
				return res;

			return undefined;
		},
		value: function (argList_) {
			var red = parseInt (argList_.shift ());
			var green = parseInt (argList_.shift ());
			var blue = parseInt (argList_.shift ());

			return 'rgb(' + red + ',' + green + ',' + blue + ')';
		}
	},
	RGBA_COLOR: {
		name: 'rgba color',
		validate: function (argList_) {
			if (argList_.length < 4)
				return 'All 4 color components must be provided.';

			var ALPHA_VAL = paramTypes.BOUNDED_FLOAT (0, 1);
			var res = paramTypes.RGB_COLOR.validate (argList_) ||
			          ALPHA_VAL.validate (argList_);

			if (res !== undefined)
				return res;

			return undefined;
		},
		value: function (argList_) {
			var red = parseInt (argList_.shift ());
			var green = parseInt (argList_.shift ());
			var blue = parseInt (argList_.shift ());
			var alpha = parseFloat (argList_.shift ());

			return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
		}
	},
	LINEAR_GRADIENT: {
		name: 'linear gradient',
		validate: function (argList_) {
			if (argList_.length < 4)
				return 'x, y, width, and height components must be provided.';

			var res = paramTypes.INT.validate (argList_) ||
					  paramTypes.INT.validate (argList_) ||
					  paramTypes.UNSIGNED.validate (argList_) ||
					  paramTypes.UNSIGNED.validate (argList_);

			if (res)
				return res;

			// Validate color stops
			while (argList_.length >= 2) {
				var res2 = paramTypes.FLOAT.validate (argList_) ||
						   paramTypes.RGBA_COLOR.validate (argList_);

				if (res2)
					return res2;
			}

			return undefined;
		},
		value: function (argList_) {
			var x = paramTypes.INT.value (argList_);
			var y = paramTypes.INT.value (argList_);
			var width = paramTypes.UNSIGNED.value (argList_);
			var height = paramTypes.UNSIGNED.value (argList_);

			// Ugh this is gross
			if (ugly.context === undefined)
				return undefined;

			var gradient =
				ugly.context.createLinearGradient (x, y, width, height);

			while (argList_.length >= 2) {
				var position = paramTypes.FLOAT.value (argList_);
				var color = paramTypes.RGBA_COLOR.value (argList_);

				gradient.addColorStop (position, color);
			}

			return gradient;
		}
	},
	RADIAL_GRADIENT: {
		name: 'radial gradient',
		validate: function (argList_) {
			if (argList_.length < 6)
				return 'x0, y0, r0, x1, y1, and r1 components must ' +
				       'be provided.';

			var res = paramTypes.INT.validate (argList_) ||
			          paramTypes.INT.validate (argList_) ||
			          paramTypes.UNSIGNED.validate (argList_) ||
			          paramTypes.INT.validate (argList_) ||
			          paramTypes.INT.validate (argList_) ||
			          paramTypes.UNSIGNED.validate (argList_);

			if (res)
				return res;

			// Validate color stops
			while (argList_.length >= 2) {
				var res2 = paramTypes.FLOAT.validate (argList_) ||
						   paramTypes.RGBA_COLOR.validate (argList_);

				if (res2)
					return res2;
			}

			return undefined;
		},
		value: function (argList_) {
			var x0 = paramTypes.INT.value (argList_);
			var y0 = paramTypes.INT.value (argList_);
			var r0 = paramTypes.UNSIGNED.value (argList_);
			var x1 = paramTypes.INT.value (argList_);
			var y1 = paramTypes.INT.value (argList_);
			var r1 = paramTypes.UNSIGNED.value (argList_);

			// Ugh this is gross
			if (ugly.context === undefined)
				return undefined;

			var gradient =
				ugly.context.createRadialGradient (x0, y0, r0, x1, y1, r1);

			while (argList_.length >= 2) {
				var position = paramTypes.FLOAT.value (argList_);
				var color = paramTypes.RGBA_COLOR.value (argList_);

				gradient.addColorStop (position, color);
			}

			return gradient;
		}
	}

};

// Command definitions =========================================================
// There are two types of commands, properties and methods. Properties set
// properties of the canvas context. They should take exactly one parameter and
// the name property should be the javascript name of the property to set.
// Methods call functions on the canvas context. They can have any number of
// parameters, but the parameters must be in the SAME order as the actual
// javascript function call would be. Like properties, the name should be the
// javascript name of the function.
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
	fill_style_linear_gradient: {
		name: 'fillStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('gradient', paramTypes.LINEAR_GRADIENT)
		]
	},
	fill_style_radial_gradient: {
		name: 'fillStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('gradient', paramTypes.RADIAL_GRADIENT)
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
	line_cap: {
		name: 'lineCap',
		type: commandTypes.PROPERTY,
		params: [
			param ('cap type',
			       paramTypes.STRING_ENUM (['butt', 'round', 'square']))
		]
	},
	line_join: {
		name: 'lineJoin',
		type: commandTypes.PROPERTY,
		params: [
			param ('join type',
			       paramTypes.STRING_ENUM (['bevel', 'round', 'miter']))
		]
	},
	line_width: {
		name: 'lineWidth',
		type: commandTypes.PROPERTY,
		params: [
			param ('line width', paramTypes.UNSIGNED)
		]
	},
	miter_limit: {
		name: 'miterLimit',
		type: commandTypes.PROPERTY,
		params: [
			param ('miter limit', paramTypes.UNSIGNED)
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
	stroke_style_linear_gradient: {
		name: 'strokeStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('gradient', paramTypes.LINEAR_GRADIENT)
		]
	},
	stroke_style_radial_gradient: {
		name: 'strokeStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('gradient', paramTypes.RADIAL_GRADIENT)
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

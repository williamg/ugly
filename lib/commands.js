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
				var regex = /^-?\d+$/;
				var num = parseInt (val);

				if (regex.test (val) && min_ <= num && num <= max_)
					return;

				return 'Invalid int parameter: ' + val;
			},
			value: function (argList_) { return parseInt (argList_.shift ());
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
				var regex = /(?=.*\d+)(^-?\d*\.?\d*$)/;
				var num = parseFloat (val);

				if (regex.test (val) && min_ <= num && num <= max_)
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

			var val = argList_.shift ();
			var regex = /^\d+$/;

			if (regex.test (val))
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
			var regex = /^-?\d+$/;

			if (regex.test (val))
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
			var regex = /(?=.*\d+)(^-?\d*\.?\d*$)/;

			if (regex.test (val))
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
	},
	FONT: {
		name: 'font',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'Font must be provided.';

			// Assume we consume everything
			for (var i = 0; i < argList_.length; i++)
				argList_.shift ();

			return true;
		},
		value: function (argList_) {
			var fontString =  argList_.join (' ');

			// Assume we consume everything
			for (var i = 0; i < argList_.length; i++)
				argList_.shift ();

			return fontString;
		}
	},
	TEXT: {
		name: 'text',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'Text must be provided.';

			var regex = /^"([^\\"]|\\.)*"$/;
			var string = argList_.shift ();

			while (! regex.test (string)) {
				if (argList_.length === 0)
					return 'Invalid text string!';

				string += ' ' + argList_.shift ();
			}

			return undefined;
		},
		value: function (argList_) {
			var regex = /^"([^\\"]|\\.)*"$/;
			var string = argList_.shift ();

			while (! regex.test (string)) {
				if (argList_.length === 0)
					return '';

				string += ' ' + argList_.shift ();
			}

			var esc =  string.replace (/\\"/g, '"');
			esc = esc.replace (/\\\\/g, '\\');
			return esc.substring (1, esc.length-1);
		},
	},
	IMAGE: {
		name: 'image',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'Image name must be provided.';

			argList_.shift ();
			return undefined;
		},
		value: function (argList_) {
			if (ugly.images === undefined)
				return undefined;

			var name = paramTypes.TEXT.value (argList_);

			return ugly.images[name];
		}
	},
	IMAGE_PATTERN: {
		name: 'image pattern',
		validate: function (argList_) {
			if (argList_.length < 2)
				return 'Image and repeat type must be specified';

			var repeatTypes = paramTypes.STRING_ENUM (['repeat', 'repeat-x',
			                                           'repeat-y', 'repeat']);

			var res = paramTypes.IMAGE.validate (argList_) ||
			          repeatTypes.validate (argList_);

			if (res)
				return res;

			return undefined;
		},
		value: function (argList_) {
			var repeatTypes = paramTypes.STRING_ENUM (['repeat', 'repeat-x',
			                                           'repeat-y', 'repeat']);

			var image = paramTypes.IMAGE.value (argList_);
			var repeatType = repeatTypes.value (argList_);

			// Ugh this is gross
			if (ugly.context === undefined)
				return undefined;

			return ugly.context.createPattern (image, repeatType);
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
	load_image: {
		params: [
			param ('name', paramTypes.TEXT),
			param ('source', paramTypes.TEXT)
		]
	},
	fullscreen: {
		params: [
			param ('fullscreen', paramTypes.STRING_ENUM (['true', 'false']))
		]
	}
};

var  frameCommands = {
	arc: {
		name: 'arc',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
			param ('r', paramTypes.FLOAT),
			param ('sAngle', paramTypes.FLOAT),
			param ('eAngle', paramTypes.FLOAT)
		]
	},
	arc_to: {
		name: 'arcTo',
		type: commandTypes.METHOD,
		params: [
			param ('x1', paramTypes.FLOAT),
			param ('y1', paramTypes.FLOAT),
			param ('x2', paramTypes.FLOAT),
			param ('y2', paramTypes.FLOAT),
			param ('r', paramTypes.FLOAT)
		]
	},
	begin_path: {
		name: 'beginPath',
		type: commandTypes.METHOD,
		params: []
	},
	bezier_curve_to: {
		name: 'bezierCurveTo',
		type: commandTypes.METHOD,
		params: [
			param ('cp1x', paramTypes.FLOAT),
			param ('cp1y', paramTypes.FLOAT),
			param ('cp2x', paramTypes.FLOAT),
			param ('cp2y', paramTypes.FLOAT),
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT)
		]
	},
	clear_rect: {
		name: 'clearRect',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
			param ('width', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
			param ('height', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
		]
	},
	clip: {
		name: 'clip',
		type: commandTypes.METHOD,
		params: []
	},
	close_path: {
		name: 'closePath',
		type: commandTypes.METHOD,
		params: []
	},
	draw_image: {
		name: 'drawImage',
		type: commandTypes.METHOD,
		params: [
			param ('image', paramTypes.IMAGE),
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT)
		]
	},
	fill: {
		name: 'fill',
		type: commandTypes.METHOD,
		params: []
	},
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
	fill_style_image_pattern: {
		name: 'fillStyle',
		type: commandTypes.METHOD,
		params: [
			param ('image pattern', paramTypes.IMAGE_PATTERN),
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
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
			param ('width', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
			param ('height', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
		]
	},
	fill_text: {
		name: 'fillText',
		type: commandTypes.METHOD,
		params: [
			param ('text', paramTypes.TEXT),
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
		]
	},
	font: {
		name: 'font',
		type: commandTypes.PROPERTY,
		params: [
			param ('font', paramTypes.FONT)
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
	line_to: {
		name: 'lineTo',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT)
		]
	},
	line_width: {
		name: 'lineWidth',
		type: commandTypes.PROPERTY,
		params: [
			param ('line width', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE))
		]
	},
	miter_limit: {
		name: 'miterLimit',
		type: commandTypes.PROPERTY,
		params: [
			param ('miter limit',
			       paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE))
		]
	},
	move_to: {
		name: 'moveTo',
		type: commandTypes.PROPERTY,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT)
		]
	},
	rect: {
		name: 'rect',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
			param ('width', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
			param ('height', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE))
		]
	},
	restore: {
		name: 'restore',
		type: commandTypes.METHOD,
		params: []
	},
	rotate: {
		name: 'rotate',
		type: commandTypes.METHOD,
		params: [
			param ('angle', paramTypes.FLOAT)
		]
	},
	save: {
		name: 'save',
		type: commandTypes.METHOD,
		params: []
	},
	scale: {
		name: 'scale',
		type: commandTypes.METHOD,
		params: [
			param ('scaleWidth',
			       paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
			param ('scaleHeight',
			       paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE))
		]
	},
	set_transform: {
		name: 'setTransform',
		type: commandTypes.METHOD,
		params: [
			param ('a', paramTypes.FLOAT),
			param ('b', paramTypes.FLOAT),
			param ('c', paramTypes.FLOAT),
			param ('d', paramTypes.FLOAT),
			param ('e', paramTypes.FLOAT),
			param ('f', paramTypes.FLOAT)
		]
	},
	shadow_blur: {
		name: 'shadowBlur',
		type: commandTypes.PROPERTY,
		params: [
			param ('blur', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE))
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
			param ('xOffset', paramTypes.FLOAT)
		]
	},
	shadow_offset_y: {
		name: 'shadowOffsetY',
		type: commandTypes.PROPERTY,
		params: [
			param ('yOffset', paramTypes.FLOAT)
		]
	},
	stroke: {
		name: 'stroke',
		type: commandTypes.METHOD,
		params: []
	},
	stroke_rect: {
		name: 'strokeRect',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
			param ('width', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE)),
			param ('height', paramTypes.BOUNDED_FLOAT (0, Number.MAX_VALUE))
		]
	},
	stroke_style_color: {
		name: 'strokeStyle',
		type: commandTypes.PROPERTY,
		params: [
			param ('color', paramTypes.RGBA_COLOR)
		]
	},
	stroke_style_image_pattern: {
		name: 'strokStyleStyle',
		type: commandTypes.METHOD,
		params: [
			param ('image pattern', paramTypes.IMAGE_PATTERN),
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
	stroke_text: {
		name: 'strokeText',
		type: commandTypes.METHOD,
		params: [
			param ('text', paramTypes.TEXT),
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT),
		]
	},
	text_align: {
		name: 'textAlign',
		type: commandTypes.PROPERTY,
		params: [
			param ('align', paramTypes.STRING_ENUM (['start', 'end', 'center',
			                                         'left', 'right']))
		]
	},
	text_baseline: {
		name: 'testBaseline',
		type: commandTypes.PROPERTY,
		params: [
			param ('baseline', paramTypes.STRING_ENUM (['alphabetic', 'top',
			                                            'hanging', 'middle',
			                                            'ideographic',
			                                            'bottom']))
		]
	},
	transform: {
		name: 'transform',
		type: commandTypes.METHOD,
		params: [
			param ('a', paramTypes.FLOAT),
			param ('b', paramTypes.FLOAT),
			param ('c', paramTypes.FLOAT),
			param ('d', paramTypes.FLOAT),
			param ('e', paramTypes.FLOAT),
			param ('f', paramTypes.FLOAT)
		]
	},
	translate: {
		name: 'translate',
		type: commandTypes.METHOD,
		params: [
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT)
		]
	},
	quadratic_curve_to: {
		name: 'quadraticCurveTo',
		type: commandTypes.METHOD,
		params: [
			param ('cpx', paramTypes.FLOAT),
			param ('cpy', paramTypes.FLOAT),
			param ('x', paramTypes.FLOAT),
			param ('y', paramTypes.FLOAT)
		]
	}
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

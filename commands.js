// Parameter validation ========================================================
// Every parameter type comes with a name, a validate function, and a value
// function. The name doesn't really matter. The validate function consumes
// arguments from the provided argument list and returns an error string if
// the parameter is invalid. Otherwise, PARAM_VALID is returned which is
// undefined at the moment. The value function assumes the parameter is valid
// and returns the apporpriate javascript type represented by the parameter
var PARAM_VALID;

var paramTypes = {
	UNSIGNED: {
		name: 'unsigned',
		validate: function (argList_) {
			if (argList_.length < 1)
				return 'No int parameter given.';

			var val = parseInt (argList_.shift ());

			if (! isNaN (val) && val >= 0)
				return PARAM_VALID;

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
				return PARAM_VALID;

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
				return PARAM_VALID;

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

			var first = argList_.shift ();
			var second = argList_.shift ();
			var third = argList_.shift ();

			var red = parseInt (first);
			var green = parseInt (second);
			var blue = parseInt (third);

			if (isNaN (red) || red < 0 || red > 255)
				return 'Invalid red parameter: ' + first;

			if (isNaN (green) || green < 0 || green > 255)
				return 'Invalid green parameter: ' + second;

			if (isNaN (blue) || blue < 0 || blue > 255)
				return 'Invalid blue parameter: ' + third;

			return PARAM_VALID;
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

			var res = paramTypes.RGB_COLOR.validate (argList_);

			if (res !== PARAM_VALID)
				return res;

			var fourth = argList_.shift ();
			var alpha = parseFloat (fourth);

			if (isNaN (alpha) || alpha < 0 || alpha > 1)
				return 'Invalid alpha parameter: ' + fourth;

			return PARAM_VALID;
		},
		value: function (argList_) {
			var red = parseInt (argList_.shift ());
			var green = parseInt (argList_.shift ());
			var blue = parseInt (argList_.shift ());
			var alpha = parseFloat (argList_.shift ());

			return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
		}
	},
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

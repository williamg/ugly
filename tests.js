var sandbox = require ('nodeunit').utils.sandbox;
var globals = {
	module: {exports: exports},
	require: require,
	console: console
};

var commands = sandbox ('commands.js', globals);
var paramTypes = commands.paramTypes;

// Parameter validation ========================================================
function paramTest (testData) {
	console.assert (testData.paramType);
	console.assert (testData.validInputs);
	console.assert (testData.invalidInputs);

	var testFunction = function (test) {
		for (var validIdx in testData.validInputs) {
			var validInput = testData.validInputs[validIdx];

			var validMsg = "Testing valid input: " + validInput;

			test.strictEqual (
				testData.paramType.validate (validInput), undefined, validMsg);
		}

		for (var invalidIdx in testData.invalidInputs) {
			var invalidInput = testData.invalidInputs[invalidIdx];

			var invalidMsg = "Testing invalid input: " + invalidInput;

			test.notStrictEqual (
				testData.paramType.validate (invalidInput), undefined,
				invalidMsg);
		}

		test.done ();
	};

	return testFunction;
}


exports.paramTypeValidation = {
	boundedInt: paramTest ({
		paramType: paramTypes.BOUNDED_INT (-10, 10),
		validInputs: [
			['0'], ['5'], ['10'], ['-10']
		],
		invalidInputs: [
			['0.0'], ['-1.0'], ['12'], ['5.0'], ['5 text'], [' '],
			['']
		]
	}),
	boundedFloat: paramTest({
		paramType: paramTypes.BOUNDED_FLOAT (-1.0, 1.0),
		validInputs: [
			['0.0'], ['-0.12'], ['1.0'], ['1.0000'], ['0'], ['1'], ['-.02'],
			['-1']
		],
		invalidInputs: [
			['0 is a number'], ['0.0.0'], ['.'], ['2'],
			[' '], ['']
		]
	}),
	stringEnum: paramTest({
		paramType: paramTypes.STRING_ENUM (['true', 'false']),
		validInputs: [
			['true'], ['false']
		],
		invalidInputs: [
			['true false'], ['true0'], ['0'], [' '], ['']
		]
	}),
	unsigned: paramTest ({
		paramType: paramTypes.UNSIGNED,
		validInputs: [
			['0'], ['5'], ['2345670']
		], 
		invalidInputs: [
			['4.0'], ['-0.0'], ['-234'], ['4f'], [' '], ['']
		]
	}),
	integer: paramTest ({
		paramType: paramTypes.INT,
		validInputs: [
			['1'], ['-20'], ['400'], ['0']
		],
		invalidInputs: [
			['1.0'], ['7eleven'], ['me'], ['-40.0'], [' '], ['']
		],
	}),
	floating: paramTest ({
		paramType: paramTypes.FLOAT,
		validInputs: [
			['1.0'], ['1'], ['-3'], ['-48.0'], ['100000']
		],
		invalidInputs: [
			['1.0.0'], ['4.0float'], ['4.0f'], [' '], ['']
		]
	}),
	text: paramTest ({
		paramType: paramTypes.TEXT,
		validInputs: [
			['"Hello"'],
			'"Hello world!"'.match (/\S+/g),
			'"Hello\\"World"'.match (/\S+/g),
			'"Hello this is a long string \\"With a quote in it!\\""'.match (/\S+/g),
			'"This has \'other\' quotes in it! How \\"exciting\\""'.match (/\S+/g),
			['""']
		],
		invalidInputs: [
			['Hello'],
			['"'],
			'"Hello world'.match(/\S+/g),
			'"Hello worl"d"'.match(/\S+/g),
		]
	})
};

exports.paramEvaluation = {

};

exports.commandValidation = {

};

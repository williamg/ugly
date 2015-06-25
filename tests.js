var sandbox = require ('nodeunit').utils.sandbox;
var globals = {
	module: {exports: exports},
	require: require,
	console: console
};

var commands = sandbox ('commands.js', globals);
var paramTypes = commands.paramTypes;

// Parameter validation ========================================================
function testValid (res, test) {
	test.strictEqual (res, undefined);
}

function testInvalid (res, test) {
	test.strictEqual (typeof (res), 'string');
}

exports.paramTypeValidation = {
	boundedInt: function (test) {
		var TEST = paramTypes.BOUNDED_INT (0, 10);

		var argList = ['2'];
		test.strictEqual (TEST.validate (argList), undefined);
		test.deepEqual (argList, []);

		var argList = ['0', '1', '2'];
		test.strictEqual (TEST.validate (argList), undefined);
		test.deepEqual (argList, ['1', '2']);

		var argList = ['10'];
		test.strictEqual (TEST.validate (argList), undefined);
		test.deepEqual (argList, []);

		var argList = ['-1'];
		test.strictEqual (typeof (TEST.validate (argList)), 'string');
		test.deepEqual (argList, []);

		var argList = ['12'];
		test.strictEqual (typeof (TEST.validate (argList)), 'string');
		test.deepEqual (argList, []);

		test.done ();
	}
};

exports.paramEvaluation = {

};

exports.commandValidation = {

};

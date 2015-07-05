#!/usr/bin/env node

// Requires ====================================================================
var pkg = require ('../package.json');
var UglyServer = require ('../lib/ugly.js');
var program = require ('commander');

// Parse options ===============================================================
// TODO: The following command line options need to be implemented:
// - Verbosity
// - Configurable web socket port
// - Accept input from file rather than stdin? Not sure about this one anymore,
//   because you could always just `tail -f file.txt | ugly`

program
	.version (pkg.version)
	.description ('Launch the ugly server and serve the viewer')
	.option ('-r, --rate <n>',
	         'The max frame-rate. (10-120 for best results, default 120)',
	         parseInt)
	.option ('-p, --viewer-port <n>',
	         'The port on which to serve the viewer (default 3333)',
	         parseInt)
	.option ('-l, --log-file <path>',
	         'The location to write log files (default "ugly.js")')
	.option ('-v, --verbosity <n>',
	         'The verbosity level (0-3)',
	         parseInt)
	.parse (process.argv);

new UglyServer (program);

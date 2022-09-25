const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { normalize } = require('path');
const { compact } = require('lodash');

const { transpile } = require('./generator/transpiler');
const { readCommandLine } = require('./generator/commandline');

const commandLine = readCommandLine();

const result = transpile(commandLine);
if (result.errors && result.errors.length) {
	result.errors.forEach(({sourceName, line, message}) => {
		console.error(compact([
			sourceName && `${sourceName}.choice`,
			line && `Error at line ${line}`,
			message
		]).join(': '));
	});
	process.exit(-1);
}

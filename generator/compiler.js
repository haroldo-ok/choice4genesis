'use strict';

const { existsSync } = require('fs');
const { normalize } = require('path');

const compile = commandLine => {
	console.log('Calling the compiler!', commandLine);
	
	const makeFile = normalize(`${commandLine.sgdkDir}/makefile.gen`);
	if (!existsSync(makeFile)) {
		return { errors: [{ message: `Could not find "${makeFile}"; please check your SGDK installation.` }] };
	}
	
	return {};
};

module.exports = { compile };
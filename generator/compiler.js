'use strict';

const { existsSync } = require('fs');
const { normalize } = require('path');
const { spawnSync } = require('child_process');

const compile = commandLine => {
	console.log('Calling the compiler!', commandLine);
	
	const projectFolder = normalize(`${commandLine.projectDir}/${commandLine.project}/`);
	if (!existsSync(projectFolder)) {
		return { errors: [{ message: 'Directory does not exist: ' + projectFolder }] };
	}

	const makeFile = normalize(`${commandLine.sgdkDir}/makefile.gen`);
	if (!existsSync(makeFile)) {
		return { errors: [{ message: `Could not find "${makeFile}"; please check your SGDK installation.` }] };
	}
	
	spawnSync(`${commandLine.sgdkDir}/bin/make`, [ makeFile ], {
		cwd: projectFolder
	});
	
	return {};
};

module.exports = { compile };
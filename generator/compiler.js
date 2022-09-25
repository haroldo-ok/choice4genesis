'use strict';

const { existsSync } = require('fs');
const { normalize } = require('path');

const { execute } = require('./executor');

const compile = async commandLine =>
	new Promise((resolve, reject) => {
		const projectFolder = normalize(`${commandLine.projectDir}/${commandLine.project}/`);
		if (!existsSync(projectFolder)) {
			resolve({ errors: [{ message: 'Directory does not exist: ' + projectFolder }] });
		}

		const makeFile = normalize(`${commandLine.sgdkDir}/makefile.gen`);
		if (!existsSync(makeFile)) {
			resolve({ errors: [{ message: `Could not find "${makeFile}"; please check your SGDK installation.` }] });
		}
		
		execute(`${commandLine.sgdkDir}/bin/make`, [ '-f', makeFile ], { appName: 'SGDK compiler', cwd: projectFolder })
			.then(resolve).catch(reject);
	});

module.exports = { compile };
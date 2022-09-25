'use strict';

const { existsSync } = require('fs');
const { normalize } = require('path');
const { spawn } = require('child_process');

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
		
		const proc = spawn(`${commandLine.sgdkDir}/bin/make`, [ '-f', makeFile ], {
			cwd: projectFolder
		});
		proc.stdout.on('data', data => console.log(`${data}`.trimRight()))
		proc.stderr.on('data', data => console.error(`${data}`.trimRight()))
		proc.on('error', data => console.error(`${data}`.trimRight()))
		proc.on('close', code => {
			if (!code) {
				resolve({});
			}
			
			console.error(`SGDK exited with code ${code}`);
			resolve({ errors: [{ message: 'SGDK compiler returned an error.' }] });
		});		
	});

module.exports = { compile };
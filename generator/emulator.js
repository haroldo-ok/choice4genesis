'use strict';

const { existsSync } = require('fs');
const { normalize } = require('path');

const { execute } = require('./executor');

const emulate = async commandLine =>
	new Promise((resolve, reject) => {
		const projectFolder = normalize(`${commandLine.projectDir}/${commandLine.project}/`);
		if (!existsSync(projectFolder)) {
			resolve({ errors: [{ message: 'Directory does not exist: ' + projectFolder }] });
		}

		const romFile = normalize(`${projectFolder}/out/rom.bin`);
		if (!existsSync(romFile)) {
			resolve({ errors: [{ message: 'ROM file does not exist: ' + romFile }] });
		}

		const emulatorExe = normalize(commandLine.emulatorExe);
		if (!existsSync(emulatorExe)) {
			resolve({ errors: [{ message: `Could not find "${emulatorExe}"; please check emulator configuration.` }] });
		}
		
		execute(emulatorExe, [ romFile ], { appName: 'Emulator', cwd: projectFolder })
			.then(resolve).catch(reject);
	});
	
module.exports = { emulate };
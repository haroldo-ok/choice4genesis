'uses strict';

const { spawn } = require('child_process');

const execute = async (execName, parameters, { appName, cwd }) =>
	new Promise((resolve, reject) => {
		const proc = spawn(execName, parameters, { cwd });
		proc.stdout.on('data', data => console.log(`${data}`.trimRight()))
		proc.stderr.on('data', data => console.error(`${data}`.trimRight()))
		proc.on('error', data => console.error(`${data}`.trimRight()))
		proc.on('close', code => {
			if (!code) {
				resolve({});
				return;
			}
			
			console.error(`${appName} exited with code ${code}`);
			resolve({ errors: [{ message: `${appName} returned an error.` }] });
		});		
	});

module.exports = { execute };
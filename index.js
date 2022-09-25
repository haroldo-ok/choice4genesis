const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { normalize } = require('path');
const { compact } = require('lodash');

const { transpile } = require('./generator/transpiler');
const { compile } = require('./generator/compiler');
const { emulate } = require('./generator/emulator');
const { readCommandLine } = require('./generator/commandline');
const { watchProject } = require('./generator/watcher');


const commandLine = readCommandLine();

const handleErrors = result => {
	if (!result.errors || !result.errors.length) {
		return 0;
	}
	
	result.errors.forEach(({sourceName, line, message}) => {
		console.error(compact([
			sourceName && `${sourceName}.choice`,
			line && `Error at line ${line}`,
			message
		]).join(': '));
	});
	
	return -1;
}


const COMMANDS = { transpile, compile, emulate };

const executeCommands = async () => {
	const commandsToExecute = compact(commandLine._.map(command => COMMANDS[command]));

	for (execute of commandsToExecute) {
		const result = await execute(commandLine);
		const exitCode = handleErrors(result);
		if (exitCode) {
			return { exitCode };
		}
	}
}

if (commandLine.watch) {
	console.warn('The "watch" option is a bit unstable, right now.');
	watchProject(commandLine, executeCommands);
} else {
	executeCommands().then(finalResult => {
		if (finalResult && finalResult.exitCode) {
			process.exit(-1);
		}
	});
}
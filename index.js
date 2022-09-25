const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { normalize } = require('path');
const { compact } = require('lodash');

const { transpile } = require('./generator/transpiler');
const { compile } = require('./generator/compiler');
const { emulate } = require('./generator/emulator');
const { readCommandLine } = require('./generator/commandline');


const commandLine = readCommandLine();

const handleErrors = result => {
	if (!result.errors || !result.errors.length) {
		return;
	}
	
	result.errors.forEach(({sourceName, line, message}) => {
		console.error(compact([
			sourceName && `${sourceName}.choice`,
			line && `Error at line ${line}`,
			message
		]).join(': '));
	});
	process.exit(-1);
}


const COMMANDS = { transpile, compile, emulate };
const commandsToExecute = compact(commandLine._.map(command => COMMANDS[command]));

const executeCommands = async () => {
	for (execute of commandsToExecute) {
		const result = await execute(commandLine);
		handleErrors(result);
	}
}

executeCommands().then(() => {});


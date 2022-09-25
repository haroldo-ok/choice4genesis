const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { normalize } = require('path');
const { compact } = require('lodash');
const chalk = require('chalk');

const { transpile } = require('./generator/transpiler');
const { compile } = require('./generator/compiler');
const { emulate } = require('./generator/emulator');
const { readCommandLine } = require('./generator/commandline');
const { watchProject } = require('./generator/watcher');
const { showMenu } = require('./generator/ui')


const commandLine = readCommandLine();

const handleErrors = result => {
	if (!result.errors || !result.errors.length) {
		return 0;
	}
	
	result.errors.forEach(({sourceName, line, message}) => {
		console.error(chalk.red(compact([
			sourceName && `${sourceName}.choice`,
			line && `Error at line ${line}`,
			message
		]).join(': ')));
	});
	
	return -1;
}


const COMMANDS = { transpile, compile, emulate };

const executeCommands = async () => {
	const commandNames = commandLine._.filter(command => command !== 'menu');
	const commandsToExecute = compact((commandNames.length ? commandNames : ['transpile', 'compile', 'emulate'])
		.map(command => COMMANDS[command]));

	for (execute of commandsToExecute) {
		const result = await execute(commandLine);
		const exitCode = handleErrors(result);
		if (exitCode) {
			return { exitCode };
		}
	}
}

if (commandLine._.includes('menu')) {
	showMenu(commandLine, executeCommands);
} else if (commandLine.watch) {
	console.warn('The "watch" option is a bit unstable, right now.');
	watchProject(commandLine, executeCommands);
} else {
	executeCommands().then(finalResult => {
		if (finalResult && finalResult.exitCode) {
			process.exit(-1);
		}
	});
}
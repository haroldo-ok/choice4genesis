const { existsSync, mkdirSync, readFileSync, watch, writeFileSync } = require('fs');
const { normalize } = require('path');
const { compact, debounce } = require('lodash');

const { transpile } = require('./generator/transpiler');
const { compile } = require('./generator/compiler');
const { emulate } = require('./generator/emulator');
const { readCommandLine } = require('./generator/commandline');


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
	let inProgress = false;
	const filesChanged = new Set();
	const executeChangedFiles = debounce(() => {
		if (inProgress) {
			console.log('Already in progress.');
			return;
		}

		const checkNeedsReexecution = () => {
			console.log('Checking if needs reexecution.');
			if (inProgress) {
				console.log('Already in progress (2).');
			}
			
			if (!filesChanged.length) {
				console.log('No files changed.')
				return;
			}
			
			console.log('Changed files: ' + filesChanged);
			console.log('Reexecuting actions: ' + commandLine._);
			filesChanged.clear();
			return executeChangedFiles().then(checkNeedsReexecution).catch(checkNeedsReexecution);
		}
		
		inProgress = true;
		console.log('Executing....');
		executeCommands()
			.then(() => {
				inProgress = false;
				console.log('1');
				checkNeedsReexecution();
			})
			.catch(() => {
				inProgress = false;
				console.log('2');
				checkNeedsReexecution();
			});
	}, 300);
	
	const projectFolder = normalize(`${commandLine.projectDir}/${commandLine.project}/project/`);
	if (!existsSync(projectFolder)) {
		return { errors: [{ message: 'Directory does not exist: ' + projectFolder }] };
	}

	console.log('First execution....');
	executeChangedFiles();
		
	watch(projectFolder, {}, (eventType, fileName) => {
		console.log('File changed: ' + fileName);
		filesChanged.add(fileName);
		executeChangedFiles();
	});
} else {
	executeCommands().then(finalResult => {
		if (finalResult && finalResult.exitCode) {
			process.exit(-1);
		}
	});
}
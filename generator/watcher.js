'use strict';

const { existsSync, watch } = require('fs');
const { normalize } = require('path');
const { debounce } = require('lodash');

const watchProject = (commandLine, executeCommands) => {
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
}

module.exports = { watchProject };
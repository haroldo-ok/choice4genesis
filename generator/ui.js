'use strict';

const { existsSync, lstatSync, readdir } = require('fs');
const { normalize } = require('path');

const menu = require('node-menu');


// TODO: Use async file access
const showMenu = (commandLine, executeCommands) => {
	const projectsFolder = normalize(commandLine.projectDir);
	if (!existsSync(projectsFolder)) {
		return { errors: [{ message: 'Directory does not exist: ' + projectsFolder }] };
	}
	
	readdir(projectsFolder, (err, files) => {
		if (err) {
			console.error('Error while listing projects: ' + err);
			return;
		}
		
		menu.disableDefaultHeader()
			.addDelimiter('-', 40, 'Which project do you want to compile?');
			
		files
			.filter(fileName => lstatSync(`${projectsFolder}/${fileName}`).isDirectory())
			.forEach(projectName => menu.addItem(projectName, () => {
				commandLine.project = projectName;
				return executeCommands();
			}));
			
		menu.start();
	});
};

module.exports = { showMenu }; 
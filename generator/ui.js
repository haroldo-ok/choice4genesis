'use strict';

const { existsSync, lstatSync, readdir } = require('fs');
const { normalize } = require('path');
const { textSync } = require('figlet');
const chalk = require('chalk');

const menu = require('node-menu');

const pjson = require('./../package.json');
const { getProjectsFolder, isProjectsFolderPresent, listProjectNames } = require('./project');

// TODO: Use async file access
const showMenu = async (commandLine, executeCommands) => {
	
	if (!await isProjectsFolderPresent(commandLine)) {
		return { errors: [{ message: 'Directory does not exist: ' + projectsFolder }] };
	}
	
	const projectNames = await listProjectNames(commandLine);
	
	menu.customHeader(function() {
		console.log(chalk.blue(textSync(pjson.name, { font: 'Rectangles' })));
		console.log(`v${pjson.version}`);
		console.log('');
	})
	.addDelimiter('-', 40, 'Which project do you want to compile?');
		
		
	projectNames.forEach(projectName => menu.addItem(projectName, () => {
		commandLine.project = projectName;
		return executeCommands()
			.then(data => {
				console.log(chalk.green('<< Press ENTER to return to menu >>'));
				return data;
			})
			.catch(e => {
				console.error(`Error while compiling ${projectName}`, e);
				console.error(chalk.red('<< Press ENTER to return to menu >>'));
			});
	}));
			
	menu.start();
};

module.exports = { showMenu }; 
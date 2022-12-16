'use strict';

const { exists, lstat, readdir } = require('fs-extra');
const { normalize } = require('path');

const getProjectsFolder = commandLine => normalize(commandLine.projectDir);

const isProjectsFolderPresent = async commandLine => exists(getProjectsFolder(commandLine));

const listProjectNames = async commandLine => {
	const projectsFolder = getProjectsFolder(commandLine);
	const fileNames = await readdir(getProjectsFolder(commandLine));
	const fileNamesStat = await Promise.all(fileNames.map(async fileName => ({
		fileName, 
		isDirectory: (await lstat(`${projectsFolder}/${fileName}`)).isDirectory()
	})));
	return fileNamesStat.filter(({ isDirectory }) => isDirectory).map(({ fileName }) => fileName);
};

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames };
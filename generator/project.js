'use strict';

const { exists, lstat, readdir } = require('fs-extra');
const { normalize } = require('path');

const getProjectsFolder = commandLine => normalize(commandLine.projectDir);

const isProjectsFolderPresent = async commandLine => exists(getProjectsFolder(commandLine));

const listProjectFiles = async (commandLine, { directory, filter } = {}) => {
	directory ||= '/';
	filter ||= file => true;
	
	const projectsFolder = getProjectsFolder(commandLine);
	const baseDir = normalize(`${projectsFolder}/${directory}`);
	
	const fileNames = await readdir(baseDir);
	const fileNamesStat = await Promise.all(fileNames.map(async fileName => {
		const stat = await lstat(normalize(`${baseDir}/${fileName}`));
		return {
			directory,
			fileName, 
			isDirectory: stat.isDirectory(),
			size: stat.size,
			createdAt: new Date(stat.birthtimeMs),
			modifiedAt: new Date(stat.mtimeMs)
		}
	}));
	
	return fileNamesStat.filter(filter);
};

const listProjectNames = async commandLine => {
	const projectFiles = await listProjectFiles(commandLine, { filter: ({ isDirectory }) => isDirectory });
	return projectFiles.map(({ fileName }) => fileName);
};

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames };
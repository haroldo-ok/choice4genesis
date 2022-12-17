'use strict';

const { exists, lstat, readdir } = require('fs-extra');
const { normalize } = require('path');

const validateRequiredParams = params => {
	const missingParams = Object.entries(params).filter(([name, value]) => !value).map(([name, value]) => name);
	if (missingParams.length) {
		throw new Error(`Those params are missing: ${missingParams}`, { missingParams });
	}
};

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

const listProjectSources = async (commandLine, projectName, options = {}) => {
	console.log({ commandLine, projectName });
	validateRequiredParams({ commandLine, projectName });
	return listProjectFiles(commandLine, { directory: `/${projectName}/project`, ...options });
};

const listProjectNames = async commandLine => {
	const projectFiles = await listProjectFiles(commandLine, { filter: ({ isDirectory }) => isDirectory });
	return projectFiles.map(({ fileName }) => fileName);
};

const listProjectScenes = async (commandLine, projectName) => {
	return listProjectSources(commandLine, projectName);
};

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames, listProjectScenes };
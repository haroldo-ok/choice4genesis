'use strict';

const { exists, lstat, readdir } = require('fs-extra');
const { normalize } = require('path');

const getProjectsFolder = commandLine => normalize(commandLine.projectDir);

const isProjectsFolderPresent = async commandLine => exists(getProjectsFolder(commandLine));

const listProjectFiles = async (commandLine, { directory, filter } = {}) => {
	directory ||= '/';
	filter ||= file => true;
	console.log({ directory, filter });
	
	//const projectsFolder = getProjectsFolder(commandLine);
	const projectsFolder = getProjectsFolder(commandLine);
	const baseDir = normalize(`${projectsFolder}/${directory}`);
	
	const fileNames = await readdir(baseDir);
	console.log({ fileNames, baseDir });
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
	console.log({ fileNames, fileNamesStat });
	
	return fileNamesStat.filter(filter);
};

const listProjectNames = async commandLine => {
	/*
	await listProjectFiles(commandLine);
	return;
	*/
	
	const projectsFolder = getProjectsFolder(commandLine);
	const fileNames = await readdir(getProjectsFolder(commandLine));
	const fileNamesStat = await Promise.all(fileNames.map(async fileName => ({
		fileName, 
		isDirectory: (await lstat(`${projectsFolder}/${fileName}`)).isDirectory()
	})));
	return fileNamesStat.filter(({ isDirectory }) => isDirectory).map(({ fileName }) => fileName);
};

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames };
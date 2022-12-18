'use strict';

const { exists, lstat, readdir, readFile } = require('fs-extra');
const { normalize } = require('path');

const validateRequiredParams = params => {
	const missingParams = Object.entries(params).filter(([name, value]) => !value).map(([name, value]) => name);
	if (missingParams.length) {
		throw new Error(`Those params are missing: ${missingParams}`, { missingParams });
	}
};

const getProjectsFolder = commandLine => normalize(commandLine.projectDir);

const isProjectsFolderPresent = async commandLine => exists(getProjectsFolder(commandLine));

const listProjectFiles = async (commandLine, { directory, filter, map, isRecursive } = {}) => {
	directory ||= '/';
	filter ||= file => true;
	map ||= file => file;
	
	const projectsFolder = getProjectsFolder(commandLine);
	const baseDir = normalize(`${projectsFolder}/${directory}`);
	
	const fileNames = await readdir(baseDir);
	const fileNamesStat = await Promise.all(fileNames.map(async fileName => {
		const stat = await lstat(normalize(`${baseDir}/${fileName}`));
		const file = {
			directory,
			fileName, 
			isDirectory: stat.isDirectory(),
			size: stat.size,
			createdAt: new Date(stat.birthtimeMs),
			modifiedAt: new Date(stat.mtimeMs)
		};
		
		if (isRecursive && file.isDirectory) {
			return {
				...file,
				children: await listProjectFiles(commandLine, { directory: `${directory}/${fileName}`, filter, map, isRecursive })
			};
		}
		
		return file;
	}));
	
	const filterFunction = file => {
		if (isRecursive && file.isDirectory) {
			return file.children && file.children.length;
		}
		return filter(file);
	};
	
	return fileNamesStat.filter(filterFunction).map(map);
};

const listProjectSources = async (commandLine, projectName, options = {}) => {
	validateRequiredParams({ commandLine, projectName });
	return listProjectFiles(commandLine, {
		directory: `/${projectName}/project`,
		map: ({ directory, ...rest }) => ({ 
			directory: directory.replace(/^\/[^\/]+\/project/g, '') || '/', 
			...rest
		}),
		...options
	});
};

const listProjectNames = async commandLine => {
	const projectFiles = await listProjectFiles(commandLine, { filter: ({ isDirectory }) => isDirectory });
	return projectFiles.map(({ fileName }) => fileName);
};

const listProjectScenes = async (commandLine, projectName) => {
	return listProjectSources(commandLine, projectName, { filter: ({ fileName }) => /.*\.choice$/ig.test(fileName) });
};

const readProjectScene = async (commandLine, projectName, sceneName) => {
	const projectsFolder = getProjectsFolder(commandLine);
	const fileName = normalize(`${projectsFolder}/${projectName}/project/${sceneName}.choice`);
	const source = await readFile(fileName, {encoding:'utf8', flag:'r'});
	return source;	
};

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames, listProjectScenes, readProjectScene };
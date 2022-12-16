'use strict';

const { exists, lstatSync, readdir } = require('fs-extra');
const { normalize } = require('path');

const getProjectsFolder = commandLine => normalize(commandLine.projectDir);

const isProjectsFolderPresent = async commandLine => exists(getProjectsFolder(commandLine));

const listProjectNames = async commandLine => {
	const fileNames = await readdir(getProjectsFolder(commandLine));
};

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames };
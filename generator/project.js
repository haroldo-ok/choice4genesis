'use strict';

const { existsSync, lstatSync, readdir } = require('fs');
const { normalize } = require('path');

const getProjectsFolder = commandLine => normalize(commandLine.projectDir);

const isProjectsFolderPresent = commandLine => existsSync(getProjectsFolder(commandLine));

const listProjectNames = async commandLine => new Promise((resolve, reject) => {
});

module.exports = { getProjectsFolder, isProjectsFolderPresent, listProjectNames };
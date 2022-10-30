const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { copySync } = require('fs-extra');
const { normalize } = require('path');

const { generate } = require('./generator');

const transpile = commandLine => {

	const projectFolder = normalize(`${commandLine.projectDir}/${commandLine.project}/`);
	if (!existsSync(projectFolder)) {
		return { errors: [{ message: 'Directory does not exist: ' + projectFolder }] };
	}
	
	const baseFolder = normalize(`${__dirname}/../base/`);
	if (!existsSync(baseFolder)) {
		return { errors: [{ message: 'Directory does not exist: ' + baseFolder }] };
	}

	// TODO: Refactor generator to support asynchronous file reading
	const fileSystem = {
		readSource: name => {
			const fileName = name + '.choice';
			const source = readFileSync(projectFolder + 'project/' + fileName, {encoding:'utf8', flag:'r'});
			return source;
		},
		
		fileExistsInProjectDir: fileName => {
			return existsSync(projectFolder + 'project/' + fileName);
		},
		
		copyBase: (sourceFileName, destFileName) => {
		}			
	};

	const result = generate(fileSystem);

	if (result.errors && result.errors.length) {
		return result;
	}
	
	// Ensures the existance of the target dirs
	['src/boot/', 'res/'].forEach(dirName => 
		mkdirSync(projectFolder + dirName, { recursive: true }));

	// Copy base source files
	['src/', 'res'].forEach(dirName =>
		copySync(baseFolder + dirName, projectFolder + dirName));

	// TODO: Refactor support asynchronous file writing
	Object.entries(result.sources).forEach(([fileName, content]) => {
		writeFileSync(projectFolder + 'src/' + fileName, content, {encoding: 'utf8'});
	});

	// TODO: Refactor support asynchronous file writing
	Object.entries(result.resources).forEach(([fileName, content]) => {
		const directory = projectFolder + 'res/';
		mkdirSync(directory, { recursive: true });
		writeFileSync(directory + fileName, content, {encoding: 'utf8'});
	});
	
	return result;
}

module.exports = { transpile };
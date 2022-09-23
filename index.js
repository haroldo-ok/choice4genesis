const { mkdirSync, readFileSync, writeFileSync } = require('fs');

const { generate } = require('./generator/generator');

// TODO: Allow to choose project folder
const projectFolder = './examples/test/';

// TODO: Refactor generator to support asynchronous file reading
const fileSystem = {
	readSource: name => {
		const fileName = name + '.choice';
		const source = readFileSync(projectFolder + 'project/' + fileName, {encoding:'utf8', flag:'r'});
		return source;
	}
};

const result = generate(fileSystem);

if (result.errors && result.errors.length) {
	result.errors.forEach(({sourceName, line, message}) => console.error(`${sourceName}.choice: Error at line ${line}: ${message}`));
	return;
}

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
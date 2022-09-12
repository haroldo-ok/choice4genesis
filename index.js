const { readFileSync } = require('fs');

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

if (result.errors) {
	result.errors.forEach(({line, message}) => console.error(`Line ${line}: ${message}`));
	return;
}

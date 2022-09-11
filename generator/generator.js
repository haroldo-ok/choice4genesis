const { parse } = require('../parser/syntax-full');

const generate = fileSystem => {
	const source = fileSystem.readSource('startup');
	const ast = parse(source);
	if (ast.errors) {
		return { errors: ast.errors };
	}
	
	return {};
};

module.exports = { generate };
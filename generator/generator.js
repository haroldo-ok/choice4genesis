const { parse } = require('../parser/syntax-full');

const generateFromSource = (sourceName, fileSystem) => {
	const source = fileSystem.readSource(sourceName);
	const ast = parse(source);
	if (ast.errors) {
		return { errors: ast.errors };
	}

	const generated = ast.body.filter(({ type }) => type === 'text').map(({ text }) => `	VN_text("${text}");`).join('\n');
	const functionName = `VS_${sourceName}`;
	
	const generatedFunction = [
		`void *${functionName}() {`,
		generated,
		`	VN_flushText();`,
		`	return ${functionName};`,
		'}'
	].join('\n');
	
	return {
		sources: {
			'generated_scripts.c': '#include "vn_engine.h"\n' + generatedFunction
		}
	}
};

const generate = fileSystem => {
	return generateFromSource('startup', fileSystem);
};

module.exports = { generate };
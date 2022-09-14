'use strict'

const { compact } = require('lodash');
const { parse } = require('../parser/syntax-full');

const generateFromSource = (sourceName, context) => {
	const source = context.fileSystem.readSource(sourceName);
	const ast = parse(source);
	if (ast.errors) {
		return { errors: ast.errors };
	}

	const generated = compact(ast.body.map(entity => {
		if (entity.type === 'text') {
			return `	VN_text("${entity.text}");`
		}
		if (entity.type === 'command') {
			if (entity.command === 'background') {
				return `	VN_background("${entity.text}");`;
			}
		}
	})).join('\n');
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
	const context = { fileSystem, generatedScripts: [] };
	return generateFromSource('startup', context);
};

module.exports = { generate };
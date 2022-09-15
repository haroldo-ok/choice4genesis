'use strict'

const { compact } = require('lodash');
const { parse } = require('../parser/syntax-full');

const buildEntityError = ({ line }, message) => ({ line, message });

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
				const fileName = entity.params.positional.fileName;
				if (fileName[0] !== 'StringConstant') {
					context.errors.push(buildEntityError(entity, 'Image filename must be a string constant.'));
				}
				const imageFileName = fileName[1];
				const imageVariable = 'img_' + imageFileName.trim().replace(/\.png$/, '').replace(/\W+/g, '_');
				context.res.gfx.push(`IMAGE ${imageVariable} "../project/${imageFileName}" APLIB`);
				return `	VN_background(&${imageVariable});`;
			}
			
			if (entity.command === 'image') {
				const fileName = entity.params.positional.fileName;
				if (fileName[0] !== 'StringConstant') {
					context.errors.push(buildEntityError(entity, 'Image filename must be a string constant.'));
				}
												
				const imageFileName = fileName[1];
				const imageVariable = 'img_' + imageFileName.trim().replace(/\.png$/, '').replace(/\W+/g, '_');				
				context.res.gfx.push(`IMAGE ${imageVariable} "../project/${imageFileName}" APLIB`);
				
				const position = entity.params.named && entity.params.named.at;
				const positionSrc = position ? `	VN_imageAt(${position.x[1]}, ${position.y[1]});` + '\n' : '';
				
				return positionSrc + `	VN_image(&${imageVariable});`;
			}
		}
	})).join('\n');
	
	if (context.errors && context.errors.length) {
		return { errors: context.errors };
	}
	
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
		},
		
		resources: {
			'gfx.res': context.res.gfx.join('\n')
		}
	}
};

const generate = fileSystem => {
	const context = { fileSystem, generatedScripts: [],  errors: [], res: { gfx: [] } };
	return generateFromSource('startup', context);
};

module.exports = { generate };
'use strict'

const { compact } = require('lodash');
const { parse } = require('../parser/syntax-full');

const buildEntityError = ({ line }, message) => ({ line, message });

const getStringConstant = (entity, parameter, context, name) => {
	if (parameter[0] !== 'StringConstant') {
		context.errors.push(buildEntityError(entity, name + ' must be a string constant.'));
	}
	return parameter[1];
}

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
				const imageFileName = getStringConstant(entity, entity.params.positional.fileName, context, 'Image filename');
				const imageVariable = 'img_' + imageFileName.trim().replace(/\.png$/, '').replace(/\W+/g, '_');
				context.res.gfx.push(`IMAGE ${imageVariable} "../project/${imageFileName}" APLIB`);
				return `	VN_background(&${imageVariable});`;
			}
			
			if (entity.command === 'image') {
				const imageFileName = getStringConstant(entity, entity.params.positional.fileName, context, 'Image filename');
				const imageVariable = 'img_' + imageFileName.trim().replace(/\.png$/, '').replace(/\W+/g, '_');				
				context.res.gfx.push(`IMAGE ${imageVariable} "../project/${imageFileName}" APLIB`);
				
				const position = entity.params.named && entity.params.named.at;
				const positionSrc = position ? `	VN_imageAt(${position.x[1]}, ${position.y[1]});` + '\n' : '';
				
				return positionSrc + `	VN_image(&${imageVariable});`;
			}
			
			if (entity.command === 'music') {
				const musicFileName = getStringConstant(entity, entity.params.positional.fileName, context, 'Music filename');
				const musicVariable = 'xgm_' + musicFileName.trim().replace(/\..gm$/, '').replace(/\W+/g, '_');
				context.res.music.push(`XGM ${musicVariable} "../project/${musicFileName}" APLIB`);
				return `	VN_music(${musicVariable});`;
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
			'gfx.res': context.res.gfx.join('\n'),
			'music.res': context.res.music.join('\n')
		}
	}
};

const generate = fileSystem => {
	const context = { fileSystem, generatedScripts: [],  errors: [], res: { gfx: [], music: [] } };
	return generateFromSource('startup', context);
};

module.exports = { generate };
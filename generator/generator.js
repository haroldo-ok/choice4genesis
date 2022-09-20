'use strict'

const { compact } = require('lodash');
const { parse } = require('../parser/syntax-full');


const buildEntityError = ({ line }, message) => ({ line, message });

const getStringConstant = (entity, parameter, context, name) => {
	if (!parameter) {
		context.errors.push(buildEntityError(entity, name + ' was not informed.'));
		return null;
	}
	if (parameter[0] !== 'StringConstant') {
		context.errors.push(buildEntityError(entity, name + ' must be a string constant.'));
	}
	return parameter[1];
}

const getNumber = (entity, parameter, context, name) => {
	if (!parameter) {
		context.errors.push(buildEntityError(entity, name + ' was not informed.'));
		return null;
	}
	if (parameter[0] !== 'NumberConstant') {
		context.errors.push(buildEntityError(entity, name + ' must be a number.'));
	}
	return parameter[1];
}

const indent = (...params) =>
	params
	.map(o => 
		!o ? '' : 
		o.split ? o.split('\n') : 
		o.flat ? o.flat() : 
		`// Unknown value of type ${typeof o}: ${o}`)
	.flat()
	.map(s => '\t' + s)
	.join('\n');
	
const addResource = (map, fileName, generator) => {
	// Does it already exist on the resources?
	if (map[fileName]) return map[fileName].variable;
	
	// No; add to the map
	const variable = fileName.trim().replace(/\W+/g, '_');
	map[fileName] = {
		variable,
		content: generator(variable)
	};
	
	return variable;
};

const generateResource = map => Object.values(map).map(({ content }) => content).join('\n');
	
const generateImageCommand = (functionName, entity, context, mapOption = 'ALL') => {
	const imageFileName = getStringConstant(entity, entity.params.positional.fileName, context, 'Image filename');
	/*
	const imageVariable = 'img_' + imageFileName.trim().replace(/\.png$/, '').replace(/\W+/g, '_');				
	context.res.gfx.push(`IMAGE ${imageVariable} "../project/${imageFileName}" APLIB ${mapOption}`);
	*/
	const imageVariable = addResource(context.res.gfx, imageFileName, imageVariable => 
		`IMAGE ${imageVariable} "../project/${imageFileName}" APLIB ${mapOption}`);
	
	const position = entity.params.named && entity.params.named.at;
	const positionSrc = position ? `VN_imageAt(${position.x[1]}, ${position.y[1]});` + '\n' : '';
	
	return positionSrc + `${functionName}(&${imageVariable});`;
};

let generateFromBody;


const COMMAND_GENERATORS = {
	'background': (entity, context) => generateImageCommand('VN_background', entity, context),
	'image': (entity, context) => generateImageCommand('VN_image', entity, context),
	'font': (entity, context) => generateImageCommand('VN_font', entity, context, 'NONE'),
	
	'music': (entity, context) => {
		const musicFileName = getStringConstant(entity, entity.params.positional.fileName, context, 'Music filename');
		const musicVariable = addResource(context.res.music, musicFileName, musicVariable => 
			`XGM ${musicVariable} "../project/${musicFileName}" APLIB`);

		return `VN_music(${musicVariable});`;
	},
	
	'wait': (entity, context) => {
		const duration = getNumber(entity, entity.params.positional.duration, context, 'Wait duration');
		return `VN_wait(${duration});`;
	},
	
	'choice': (entity, context) => {
		context.choices.push([]);
		const generated = generateFromBody(entity.body, context);
		const optionsContent = context.choices.pop();
		
		return [
			'{',
			indent(
				'VN_flushText();',
				generated,
				'switch (VN_choice()) {',
				optionsContent.map((content, index) => [
					`case ${index + 1}:`,
					indent(content),
					'\tbreak;'
				]),
				'}',
				'VN_flushText();'
			),
			'}'
		].join('\n');
	}
};


generateFromBody = (body, context) => 
	compact((body || []).map(entity => {
		if (entity.type === 'text') {
			return `VN_text("${entity.text}");`
		}
		if (entity.type === 'option') {
			const len = context.choices.length;
			let optionNumber = -1;
			if (len) {
				context.choices[len - 1].push(generateFromBody(entity.body, context));
				optionNumber = context.choices[len - 1].length;
			} else {
				context.errors.push(buildEntityError(entity, 'Can\'t declare an option outside the body of a "choice" command.'));
			}			
			
			return `VN_option(${optionNumber}, "${entity.text}");`
		}
		if (entity.type === 'command') {
			const generator = COMMAND_GENERATORS[entity.command];
			return generator && generator(entity, context);
		}
	})).join('\n');

const generateFromSource = (sourceName, context) => {
	const source = context.fileSystem.readSource(sourceName);
	const ast = parse(source);
	if (ast.errors) {
		return { errors: ast.errors };
	}

	const generated = generateFromBody(ast.body, context);
	
	if (context.errors && context.errors.length) {
		return { errors: context.errors };
	}
	
	const functionName = `VS_${sourceName}`;
			
	const generatedFunction = [
		`void *${functionName}() {`,
		indent(
			generated,
			'VN_flushText();',
			`return ${functionName};`
		),
		'}'
	].join('\n');
	
	return {
		sources: {
			'generated_scripts.c': '#include "vn_engine.h"\n' + generatedFunction
		},
		
		resources: Object.fromEntries(Object.entries(context.res).map(([name, resource]) => 
			[ `${name}.res`,  generateResource(resource)]))
	}
};

const generate = fileSystem => {
	const context = { fileSystem, generatedScripts: [],  errors: [], res: { gfx: {}, music: {} }, choices: [] };
	return generateFromSource('startup', context);
};

module.exports = { generate };
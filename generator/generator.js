'use strict'

const { compact } = require('lodash');
const { parse } = require('../parser/syntax-full');
const { createNamespace } = require('./namespace');
const { generateExpression } = require('./expression');
const { generateRomHeader } = require('./romheader');


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

const getFileNameConstant = (entity, parameter, context, name) => {
	const fileName = getStringConstant(entity, parameter, context, name);
	if (!fileName) {
		// Assumes `getStringConstant()` already generated the error message
		return null;
	}
	
	if (!context.fileSystem.fileExistsInProjectDir(fileName)) {
		context.errors.push(buildEntityError(entity, `${name} points to a missing file: "${fileName}".`));
	}	
	return fileName;
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

const getIdentifier = (entity, parameter, context, name) => {
	if (!parameter) {
		context.errors.push(buildEntityError(entity, name + ' was not informed.'));
		return null;
	}
	if (parameter[0] !== 'Identifier') {
		context.errors.push(buildEntityError(entity, name + ' must be an identifier.'));
	}
	return parameter[1];
}

const getConstant = (entity, parameter, context, name) => {
	if (!parameter) {
		context.errors.push(buildEntityError(entity, name + ' was not informed.'));
		return null;
	}
	
	const type = parameter[0] == 'NumberConstant' ? 'int':
		parameter[0] == 'BoolConstant' ? 'bool' : 
		null;
		
	if (!type) {
		context.errors.push(buildEntityError(entity, name + ' must be an integer or boolean constant.'));
	}
	
	const value = parameter[1];
	const code = type === 'bool' ? 
		value.toString().toUpperCase() : 
		value.toString();
	
	return { type, value, code };
}

const getExpression = (entity, parameter, context, name) => {
	if (!parameter) {
		context.errors.push(buildEntityError(entity, name + ' was not informed.'));
		return null;
	}

	return generateExpression(entity, parameter, context);
}

const indent = (...params) =>
	params
	.map(o => 
		!o ? '' : 
		o.split ? o.split('\n') : 
		o.flat ? o.flat() : 
		`// Unknown value of type ${typeof o}: ${o}`)
	.flat()
	.map(o => o.split ? o.split('\n') : o)
	.flat()
	.map(s => '\t' + s)
	.join('\n');
	
const addResource = (map, fileName, generator) => {
	// Does it already exist on the resources?
	if (map[fileName]) return map[fileName].variable;
	
	// No; add to the map
	
	const suffix = fileName.trim().replace(/\W+/g, '_');
	const variableCandidate = /^[^A-Za-z_]/.test(suffix) ? '_' + suffix : suffix;
	
	// Check if the variable name is duplicated
	// TODO: Cache the existing variables to speed up the verification
	let variable = variableCandidate;
	let variableSuffix = 1;
	const existingVariables = Object.values(map).map(o => o.variable);
	while (existingVariables.includes(variable)) {
		variable = variableCandidate + '_' + variableSuffix++;
	}
	
	map[fileName] = {
		variable,
		content: generator(variable)
	};
	
	return variable;
};

const generateResource = map => Object.values(map).map(({ content }) => content).join('\n');
	
const generateImageCommand = (functionName, entity, context, mapOption = 'ALL', generatedFlags='') => {
	const imageFileName = getFileNameConstant(entity, entity.params.positional.fileName, context, 'Image filename');
	
	const imageVariable = addResource(context.res.gfx, imageFileName, imageVariable => 
		`IMAGE ${imageVariable} "${imageVariable}.png" APLIB ${mapOption}`);
		
	const targetFileName = `${imageVariable}.png`;
		
	if (!context.images[imageFileName]) {
		context.images[imageFileName] = { entity, imageFileName, targetFileName };
	}
	
	const position = entity.params.named && entity.params.named.at;
	const positionSrc = position ? `VN_imageAt(${position.x[1]}, ${position.y[1]});` + '\n' : '';
	
	return positionSrc + `${functionName}(&${imageVariable}${generatedFlags && ', ' + generatedFlags});`;
};

const generateFlags = (entity, prefix) => Object.entries(entity.params.flags || {})
	.filter(([k, v]) => v)
	.map(([k, v]) => `${prefix}_${k.toUpperCase()}`)
	.join('|');

const generateVariableDeclarations = namespace =>
	namespace.list().map(({ value }) => value.code).join('\n');

let generateFromBody;


const COMMAND_GENERATORS = {
	'background': (entity, context) => generateImageCommand('VN_background', entity, context),
	'image': (entity, context) => generateImageCommand('VN_image', entity, context, 'ALL', generateFlags(entity, 'LAYER') || 'LAYER_BACKGROUND'),
	'font': (entity, context) => generateImageCommand('VN_font', entity, context, 'NONE'),
	
	'music': (entity, context) => {
		const musicFileName = getFileNameConstant(entity, entity.params.positional.fileName, context, 'Music filename');
		const flags = entity.params.flags || {};
		const isAdpcm = Object.entries(flags).filter(([k, v]) => v).find(([name, v]) => name.toUpperCase() === 'ADPCM');
		
		const resType = isAdpcm ? 'WAV' : 'XGM';
		const driver = isAdpcm ? '2ADPCM' : 'APLIB';
		const driverFlag = isAdpcm ? 'SOUND_ADPCM' : 'SOUND_XGM';

		const musicVariable = addResource(context.res.music, musicFileName, musicVariable => 
			`${resType} ${musicVariable} "../project/${musicFileName}" ${driver}`);

		return `VN_music(${musicVariable}, sizeof(${musicVariable}), ${driverFlag});`;
	},
	
	'sound': (entity, context) => {
		const soundFileName = getFileNameConstant(entity, entity.params.positional.fileName, context, 'Sound filename');
		const flags = entity.params.flags || {};
		const isAdpcm = Object.entries(flags).filter(([k, v]) => v).find(([name, v]) => name.toUpperCase() === 'ADPCM');

		const driver = isAdpcm ? '2ADPCM' : 'XGM';
		const driverFlag = isAdpcm ? 'SOUND_ADPCM' : 'SOUND_XGM';

		const soundVariable = addResource(context.res.music, soundFileName, soundVariable => 
			`WAV ${soundVariable} "../project/${soundFileName}" ${driver}`);

		return `VN_sound(${soundVariable}, sizeof(${soundVariable}), ${driverFlag});`;
	},
	
	'stop': (entity, context) => {
		const flags = entity.params.flags || {};
		const flagExpression = Object.entries(flags).filter(([k, v]) => v).map(([name, v]) => 
			`STOP_${name.toUpperCase()}`).join('|');
		return `VN_stop(${flagExpression || 0});`;			
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
					'\tVN_flushText();',
					'\tbreak;'
				]),
				'}',
				'VN_flushText();'
			),
			'}'
		].join('\n');
	},
	
	'create': (entity, context) => {
		const varName = getIdentifier(entity, entity.params.positional.variable, context, 'Variable name');
		const initialValue = getConstant(entity, entity.params.positional.initialValue, context, 'Initial value') || {};
		
		const existingValue = context.globals.get(varName);
		if (existingValue) {
			context.errors.push(buildEntityError(entity, 
				`There's already a variable named "${varName}" on line ${existingValue.value.line}.`));
			return null;
		}
		
		const internalVar = 'VG_' + varName;
		context.globals.put(varName, {
			line: entity.line, 
			type: initialValue.type,
			internalVar,
			code: `${initialValue.type} ${internalVar} = ${initialValue.code};` 
		});
		return null;
	},
	
	'temp': (entity, context) => {
		const varName = getIdentifier(entity, entity.params.positional.variable, context, 'Variable name');
		const initialValue = getConstant(entity, entity.params.positional.initialValue, context, 'Initial value') || {};
		
		const existingValue = context.locals.get(varName);
		if (existingValue) {
			context.errors.push(buildEntityError(entity, 
				`There's already a variable named "${varName}" on line ${existingValue.value.line}.`));
			return null;
		}
		
		const internalVar = 'VL_' + varName;
		context.locals.put(varName, {
			line: entity.line, 
			internalVar,
			code: `${initialValue.type} ${internalVar} = ${initialValue.code};` 
		});
		return null;
	},
	
	'set': (entity, context) => {
		const varName = getIdentifier(entity, entity.params.positional.variable, context, 'Variable name');
		const newValue = getExpression(entity, entity.params.positional.newValue, context, 'New value') || {};
		
		const existingVar = context.locals.get(varName) || context.globals.get(varName);
		if (!existingVar) {
			context.errors.push(buildEntityError(entity, `Couldn't find a variable named "${varName}".`));
			return null;
		}
		
		return `${existingVar.value.internalVar} = ${newValue.code};`;
	},
	
	'if': (entity, context) => {		
		const condition = getExpression(entity, entity.params.positional.condition, context, 'Condition') || {};
		const generatedBody = generateFromBody(entity.body, context);

		return [
			`if (${condition.code}) {`,
			indent(generatedBody),
			'}'
		].join('\n');
	},	
	
	'elseif': (entity, context) => {		
		const condition = getExpression(entity, entity.params.positional.condition, context, 'Condition') || {};
		const generatedBody = generateFromBody(entity.body, context);

		return [
			`else if (${condition.code}) {`,
			indent(generatedBody),
			'}'
		].join('\n');
	},
	
	'else': (entity, context) => {		
		const generatedBody = generateFromBody(entity.body, context);

		return [
			'else {',
			indent(generatedBody),
			'}'
		].join('\n');
	},
	
	'while': (entity, context) => {		
		const condition = getExpression(entity, entity.params.positional.condition, context, 'Condition') || {};
		const generatedBody = generateFromBody(entity.body, context);

		return [
			`while (${condition.code}) {`,
			indent(generatedBody),
			'}'
		].join('\n');
	},

	'goto_scene': (entity, context) => {
		const sceneName = getIdentifier(entity, entity.params.positional.target, context, 'Target scene name');
		context.scenesToProcess.push(sceneName);
		return 'VN_flushText();\n' + 
			`return VS_${sceneName};`;
	},
	
	'window': (entity, context) => {
		const generated = ['VN_flushText();'];
		
		const flags = entity.params.flags || {};
		if (flags.default) {
			generated.push('VN_windowDefault();');
		}
		
		const named = entity.params.named || {};
		
		if (named.from) {
			const x = getExpression(entity, named.from.x, context, 'Window X origin') || {};
			const y = getExpression(entity, named.from.y, context, 'Window Y origin') || {};
			generated.push(`VN_windowFrom(${x.code}, ${y.code});`);
		}
		
		if (named.to) {
			const x = getExpression(entity, named.to.x, context, 'Window X destination') || {};
			const y = getExpression(entity, named.to.y, context, 'Window Y destination') || {};
			generated.push(`VN_windowTo(${x.code}, ${y.code});`);
		}
		
		if (named.size) {
			const w = getExpression(entity, named.size.w, context, 'Window width') || {};
			const h = getExpression(entity, named.size.h, context, 'Window height') || {};
			generated.push(`VN_windowSize(${w.code}, ${h.code});`);
		}

		return generated.join('\n');
	},
	
	'cursor': (entity, context) => {
		const imageFileName = getFileNameConstant(entity, entity.params.positional.fileName, context, 'Image filename');
		const width = getNumber(entity, entity.params.positional.width, context, 'Sprite width in tiles');
		const height = getNumber(entity, entity.params.positional.height, context, 'Sprite height in tiles');
		const frameDelay = getNumber(entity, entity.params.positional.frameDelay, context, 'Sprite animation delay');		
		
		const imageVariable = addResource(context.res.sprite, imageFileName, imageVariable => 
			`SPRITE ${imageVariable} "../project/${imageFileName}" ${width} ${height} NONE ${frameDelay}`);
			
		return `VN_cursor(&${imageVariable});`;
	},
		
	'flush': (entity, context) => {
		const generatedFlags = generateFlags(entity, 'FLUSH');
		return `VN_flush(${generatedFlags || 0});`;
	},
	
	'clear': (entity, context) => {
		const generatedFlags = generateFlags(entity, 'LAYER');
		return `VN_clear(${generatedFlags || 'LAYER_BACKGROUND|LAYER_FOREGROUND'});`;
	},
	
	'title': (entity, context) => {
		const name = getStringConstant(entity, entity.params.positional.name, context, 'Story name');
		context.header.title = name;
		return null;
	},
	
	'author': (entity, context) => {
		const name = getStringConstant(entity, entity.params.positional.name, context, 'Author name');
		context.header.author = name;
		return null;
	},
	
	'import': (entity, context) => {
		const fileName = getStringConstant(entity, entity.params.positional.fileName, context, 'File name');
		context.imports.push(fileName);
		return null;
	},
	
	'native': (entity, context) => {
		const functionName = getIdentifier(entity, entity.params.positional.functionName, context, 'Function name');
		
		let assignment = '';
		const named = entity.params.named || {};		
		if (named.into) {
			const varName = getIdentifier(entity, named.into.variable, context, 'Variable name');
			const existingVar = context.locals.get(varName) || context.globals.get(varName);
			if (existingVar) {
				assignment = `${existingVar.value.internalVar} = `;
			} else {
				context.errors.push(buildEntityError(entity, `Couldn't find a variable named "${varName}".`));
			}
		}

		const parameters = (entity.params.variadic || []).map((param, index) => 
			getExpression(entity, param, context, `Parameter ${index + 1}`) || {});

		return `${assignment}${functionName}(${parameters.map(expression => expression.code).join(', ')});`;
	}
};


generateFromBody = (body, context) => 
	compact((body || []).map(entity => {
		if (entity.type === 'text') {
			if (entity.expressions) {
				return [
					'VN_textStart();',
					...entity.expressions.map(o => {
						if (o.params && o.params.positional && o.params.positional.expression) {
							const expr = getExpression(entity, o.params.positional.expression, context, 'Expression');
							return `VN_textInt(${expr.code});`;
						}
						return `VN_textString("${o}");`;
					})
				].join('\n');
			}
			
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
	
const generateScene = (sourceName, context) => {
	const source = context.fileSystem.readSource(sourceName);
	const ast = parse(source);
	if (ast.errors) {
		return { errors: ast.errors };
	}
	
	context.locals = createNamespace();

	const generated = generateFromBody(ast.body, context);
	
	if (context.errors && context.errors.length) {
		return { errors: context.errors };
	}
	
	const functionName = `VS_${sourceName}`;
			
	const generatedFunction = [
		`void *${functionName}() {`,
		indent(
			generateVariableDeclarations(context.locals),
			generated,
			'VN_flushText();',
			`return ${functionName};`
		),
		'}'
	].join('\n');
	
	return generatedFunction;
}

const generateFromSource = (mainSourceName, context) => {
	context.scenesToProcess.push(mainSourceName);
	
	const processedScenes = {};
	while (context.scenesToProcess.length) {
		const sourceName = context.scenesToProcess.shift();
		if (!processedScenes[sourceName]) {
			const generatedFunction = generateScene(sourceName, context);		
			const errors = [
				...context.errors, 
				...(generatedFunction && generatedFunction.errors ? generatedFunction.errors : [])
			];
			
			context.errors = [];
			processedScenes[sourceName] = { sourceName, generatedFunction, errors };
		}
	}
	
	
	const generatedForwards = Object.keys(processedScenes).map(sceneName => `void *VS_${sceneName}();`);
	const generatedFunctions = Object.values(processedScenes).map(scene => scene.generatedFunction);

	const errors = Object.values(processedScenes).map(({ sourceName, errors }) => 
		errors.map(error => ({ sourceName, ...error }))).flat();
	if (errors.length) {
		return { errors };
	}
	
	return {
		sources: {
			'generated_scripts.c': [
				['vn_engine.h', ...context.imports].map(fileName => `#include "${fileName}"`).join('\n'),
				generateVariableDeclarations(context.globals),
				generatedForwards.join('\n'),
				...generatedFunctions
			].join('\n\n\n'),
			
			'boot/rom_head.c': generateRomHeader(context)
		},
		
		resources: Object.fromEntries(Object.entries(context.res).map(([name, resource]) => 
			[ `${name}.res`,  generateResource(resource)])),
			
		images: context.images
	}
};

const generate = fileSystem => {
	const context = {
		fileSystem,
		scenesToProcess: [],
		generatedScripts: [], 
		errors: [],
		res: { gfx: {}, sprite: {}, music: {}, sound: {} },
		choices: [],
		globals: createNamespace(),
		locals: null,
		imports: [],
		header: {
			author: 'Unnamed Author',
			title: 'Unnamed Story'
		},
		images: {}
	};
	return generateFromSource('startup', context);
};

module.exports = { generate };
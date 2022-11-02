'use strict'

const { parse: basicParse } = require('./syntax-base');
const { createExpressionParser } = require('./expression');
const { groupBy } = require('lodash');

const COMMANDS = {
	'create': { positional: ['variable', 'initialValue'] },
	'temp': { positional: ['variable', 'initialValue'] },
	'set': { positional: ['variable', 'newValue'] },
	
	'if': { positional: ['condition'], siblings: [ ['elseif'], ['else'] ] },
	'elseif': { positional: ['condition'], onlyAfter: ['if', 'elseif'] },
	'else': { onlyAfter: ['if', 'elseif'] },
	'while': { positional: ['condition'] },
	
	'wait': { positional: ['duration'] },

	'label': { positional: ['name'] },
	'goto': { positional: ['target'] },
	'goto_scene': { positional: ['target'] },
	
	'title': { positional: ['name'] },
	'author': { positional: ['name'] },

	'background': { positional: ['fileName'] },
	'image': { positional: ['fileName'], named: { 'at': ['x', 'y'] }, flags: ['foreground', 'background'] },
	'font': { positional: ['fileName'] },

	'music': { positional: ['fileName'] },
	'sound': { positional: ['fileName'] },
	'stop': { flags: ['music', 'sound'] },

	'window': { named: { 'from': ['x', 'y'], 'to': ['x', 'y'], 'size': ['w', 'h'] }, flags: ['borderless', 'withborder', 'default'] },
	'cursor': { positional: ['fileName', 'width', 'height', 'frameDelay'] },
	'clear': { flags: ['background', 'foreground', 'window'] },
	'flush': { flags: ['nowait'] },

	'video': { positional: ['fileName', 'frameRate'] },
	
	'choice': { },
	'scene_list': { },
	'finish': { },
	
	'native': { positional: ['functionName'], named: { into: ['variable'] } }
};

const COMMAND_PARSERS = Object.fromEntries(Object.entries(COMMANDS).map(([command, config]) => [command, createExpressionParser(config)]));

const stringInterpolationParser = createExpressionParser({ positional: ['expression'] });


const checkOnlyAfter = (body, errors) => 
	body.map((element, index) => {
		if (element.type === 'text') {
			const interpRegex = /\$\{(.*?)\}/g;
			const parts = element.text.replace(interpRegex, a => '\n' + a + '\n').split('\n');
			if (parts.length > 1 || interpRegex.test(parts[0] || '')) {
				const expressions = parts.map(part => interpRegex.test(part) ? 
					stringInterpolationParser(part.replace(interpRegex, '$1')) : 
					part);
				return { ...element, expressions };
			}
			return element;
		}
		
		if (element.type !== 'command') {
			return element;
		}
		
		const info = COMMANDS[element.command.toLowerCase()];
		if (!info || !info.onlyAfter) {
			return element;
		}
		
		const previous = body[index - 1];
		if (!previous || previous.type !== 'command' || !info.onlyAfter.includes(previous.command.toLowerCase())) {
			errors.push({ 
				line: element.line,
				message: `The command "${element.command}" can only be used after ${info.onlyAfter.map(s => `"${s}"`).join(' or ')}.` 
			});
		}				
		
		return element;
	});
	
	
const checkSiblings = (body, errors) =>
	body.map((element, index) => {
		if (element.type !== 'command') {
			return element;
		}
		
		const info = COMMANDS[element.command.toLowerCase()];
		if (!info || !info.siblings) {
			return element;
		}
		
		const typesOfSiblings = info.siblings.flat();
		
		
		const siblingsList = [];
		for (let i = index + 1; i < body.length; i++) {
			const sibling = body[i];
			if (!sibling || sibling.type !== 'command' || !typesOfSiblings.includes(sibling.command.toLowerCase())) {
				break;
			}
			siblingsList.push(sibling);
		}
		
		const siblings = groupBy(siblingsList, ({command}) => command.toLowerCase());
		
		return { ...element, siblings };
	});
	
	
const checkSiblingCommands = (body, errors) => checkSiblings(checkOnlyAfter(body, errors), errors);


const completeCommands = (body, errors) => {
	const completedCommands = body.map(element => {
		if (element.type !== 'command') {
			return element;
		}
		
		const { type, line, command, param, ...rest } = element;
		
		const commandParser = COMMAND_PARSERS[command.toLowerCase()];
		if (!commandParser) {
			errors.push({ line, message: `Unknown command: "${command}"` })
		}
		
		const expressions = commandParser && commandParser(param);
		const params = expressions && expressions.params;
		
		expressions && (expressions.errors || []).forEach(message => errors.push({ line, message }));
		
		return { type, line, command, params, ...rest };
	});
	
	const siblingCommands = checkSiblingCommands(completedCommands, errors);
	return siblingCommands.map(element => {
		if (!element.body) {
			return element;
		}		
		return { 
			...element, 
			body: completeCommands(element.body, errors)
		};
	});
};

const parse = source => {
	let { type, body, errors } = basicParse(source);	
	
	const completedErrors = [...(errors || [])];
	const completedBody = completeCommands(body, completedErrors);
	debugger;
	
	return { 
		type,
		body: completedBody, 
		errors: completedErrors.length ? completedErrors : undefined 
	};
};


module.exports = { parse };
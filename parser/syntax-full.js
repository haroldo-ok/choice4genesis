'use strict'

const { parse: basicParse } = require('./syntax-base');
const { createExpressionParser } = require('./expression');

const COMMANDS = {
	'create': { positional: ['variable', 'initialValue'] },
	'temp': { positional: ['variable', 'initialValue'] },
	'set': { positional: ['variable', 'newValue'] },
	
	'if': { positional: ['condition'] },
	'elseif': { positional: ['condition'], onlyAfter: ['if', 'elseif'] },
	'else': { onlyAfter: ['if', 'elseif'] },
	
	'label': { positional: ['name'] },
	'goto': { positional: ['target'] },
	'goto_scene': { positional: ['target'] },
	
	'title': { positional: ['name'] },
	'author': { positional: ['name'] },

	'background': { positional: ['fileName'] },
	'music': { positional: ['fileName'] },
	'sound': { positional: ['fileName'] },
	'window': { named: { 'from': ['x', 'y'], 'to': ['x', 'y'] }, flags: ['borderless', 'withborder'] },

	'choice': { },
	'scene_list': { },
	'finish': { }	
};

const COMMAND_PARSERS = Object.fromEntries(Object.entries(COMMANDS).map(([command, config]) => [command, createExpressionParser(config)]));


const checkSiblingCommands = (body, errors) => 
	body.map((element, index) => {
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
	
	return checkSiblingCommands(completedCommands, errors);
};

const parse = source => {
	let { type, body, errors } = basicParse(source);	
	
	const completedErrors = [...(errors || [])];
	const completedBody = completeCommands(body, completedErrors);
	
	return { 
		type,
		body: completedBody, 
		errors: completedErrors.length ? completedErrors : undefined 
	};
};


module.exports = { parse };
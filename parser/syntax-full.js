'use strict'

const { parse: basicParse } = require('./syntax-base');
const { createExpressionParser } = require('./expression');


const completeCommands = (body, errors) => 
	body.map(element => {
		if (element.type !== 'command') {
			return element;
		}
		
		const { type, line, command, param, ...rest } = element;
		
		const expressions = param ? createExpressionParser({ positional: ['condition'] })(param) : undefined;
		const params = expressions && expressions.params;
		
		expressions && (expressions.errors || []).forEach(message => errors.push({ line, message }));
		
		return { type, line, command, params, ...rest };
	});
	

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
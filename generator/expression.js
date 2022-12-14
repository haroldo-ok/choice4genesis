'use strict';

const buildEntityError = ({ line }, message) => ({ line, message });

let generateExpression;


const PREFIX_CONVERTERS = Object.fromEntries(Object.entries({ Negate: "-", Not: "!" }).map(([ key, op ]) => { 
	const converter = (entity, [nodeType, next], context, name) => {
		const converted = generateExpression(entity, next, context, name);
		if (!converted) {
			return null;
		}

		return { type: converted.type, value: nodeType, code: `(${op} ${converted.code})`, isConstant: converted.isConstant };		
	};
	return [key, converter];
}));


const INFIX_OPERATIONS = {
  Multiply: "*", Divide: "/",
  Add: "+", Subtract: "-",
  Equal: "==", NotEqual: "!=", GreaterThan: ">", LessThan: "<", GreaterEqual: ">=", LessEqual: "<=",
  And: '&&', Or: '||'
};

const INFIX_CONVERTERS = Object.fromEntries(Object.entries(INFIX_OPERATIONS).map(([ key, op ]) => { 
	const converter = (entity, [nodeType, param1, param2], context, name) => {
		const converted1 = generateExpression(entity, param1, context, name);
		const converted2 = generateExpression(entity, param2, context, name);
		if (!converted1 || !converted2) {
			return null;
		}
		
		return { 
			type: converted1.type,
			value: nodeType,
			code: `(${converted1.code} ${op} ${converted2.code})`,
			isConstant: converted1.isConstant && converted2.isConstant
		};
	};
	return [key, converter];
}));


const TERMINAL_CONVERTERS = { 
	'NumberConstant': (entity, [nodeType, value], context, name) => 
		({ type: 'int', value, code: `${value}`, isConstant: true }),
	'BoolConstant': (entity, [nodeType, value], context, name) => 
		({ type: 'bool', value, code: `${value}`.toUpperCase(), isConstant: true }),
	'StringConstant': (entity, [nodeType, value], context, name) => 
		({ type: 'string', value, code: `"${value}"`, isConstant: true }),
		
	'Identifier': (entity, [nodeType, varName], context, name) =>  {
		const existingVar = context.locals.get(varName) || context.globals.get(varName);
		if (!existingVar) {
			context.errors.push(buildEntityError(entity, `Couldn't find a variable named "${varName}".`));
			return null;
		}
		
		const { value: { type, internalVar } } = existingVar;		
		return { type, value: varName, code: internalVar, isConstant: false };
	}
};


const CONVERTERS = { ...TERMINAL_CONVERTERS, ...PREFIX_CONVERTERS, ...INFIX_CONVERTERS };


generateExpression = (entity, node, context, name) => {
	const nodeType = node[0];
	const converter = CONVERTERS[nodeType];
	if (!converter) {
		context.errors.push(buildEntityError(entity, `Internal error: ${name} contains an unknown node type: "${nodeType}"`));
		return null;
	}
	
	return converter(entity, node, context, name);
}

module.exports = { generateExpression };
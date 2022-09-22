'use strict';

const buildEntityError = ({ line }, message) => ({ line, message });

const CONVERTERS = { 
	'NumberConstant': (entity, [nodeType, value], context, name) => 
		({ type: 'int', value, code: `${value}`, isConstant: true }),
	'BoolConstant': (entity, [nodeType, value], context, name) => 
		({ type: 'bool', value, code: `${value}`.toUpperCase(), isConstant: true }),
	'StringConstant': (entity, [nodeType, value], context, name) => 
		({ type: 'string', value, code: `"${value}"`, isConstant: true })
};

const generateExpression = (entity, node, context, name) => {
	const nodeType = node[0];
	const converter = CONVERTERS[nodeType];
	if (!converter) {
		context.errors.push(buildEntityError(entity, `Internal error: ${name} contains an unknown node type: "${nodeType}"`));
		return null;
	}
	
	return converter(entity, node, context, name);
}

module.exports = { generateExpression };
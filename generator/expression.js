'use strict';

const buildEntityError = ({ line }, message) => ({ line, message });

const CONVERTERS = { 
	'NumberConstant': (entity, [nodeType, value], context, name) => ({ type: 'int', value, code: `${value}` })
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
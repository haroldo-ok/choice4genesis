const { createExpressionParser } = require('./expression');


test('should reject an incorrect value', () => {
	const result = createExpressionParser({})('?}{/~');
	expect(result.errors.length).toBeTruthy();
});

test('should perform simple addition', () => {
	const result = createExpressionParser({})('1 + 3');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: [
			[ 'Add', [ 'NumberConstant', 1 ], [ 'NumberConstant', 3 ] ]
		]			
	});
});

test('should parse a list of two expressions', () => {
	const result = createExpressionParser({})('(1), (2)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: [ [ 'NumberConstant', 1 ], [ 'NumberConstant', 2 ] ] });
});

test('should parse string constants', () => {
	const result = createExpressionParser({})('"First string", "Second\nstring"');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({
		params: [ 
			[ 'StringConstant', "First string" ], 
			[ 'StringConstant', "Second\nstring" ] 
		]
	});
});
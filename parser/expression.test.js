const { createExpressionParser } = require('./expression');


test('should reject a completely incorrect expression', () => {
	const result = createExpressionParser({})('?}{/~');
	expect(result.errors.length).toBeTruthy();
});


test('should parse simple addition', () => {
	const result = createExpressionParser({ positional: ['a']  })('1 + 3');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: {
			positional: {
				a: [ 'Add', [ 'NumberConstant', 1 ], [ 'NumberConstant', 3 ] ]
			}
		}			
	});
});


test('should parse a list of two expressions', () => {
	const result = createExpressionParser({ positional: ['x', 'y'] })('(1), (2)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: { 
			positional: {
				x: [ 'NumberConstant', 1 ], 
				y: [ 'NumberConstant', 2 ] 
			}
		} 
	});
});


test('should parse string constants', () => {
	const result = createExpressionParser({ positional: ['name', 'observation'] })('"First string", "Second\nstring"');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({
		params: {
			positional: {
				name: [ 'StringConstant', "First string" ], 
				observation: [ 'StringConstant', "Second\nstring" ] 
			}
		}
	});
});


test('should parse identifier', () => {
	const result = createExpressionParser({ positional: ['z', 'w'] })('oneIndentifier, someVariable');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: { 
			positional: { 
				z: [ 'Identifier', 'oneIndentifier' ], 
				w: [ 'Identifier', 'someVariable' ] 
			} 
		} 
	});
});


/*
test('should parse flag', () => {
	const result = createExpressionParser({ flags: ['someFlag'] })('oneIndentifier, someFlag');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: [ [ 'Identifier', 'oneIndentifier' ], [ 'Flag', 'someFlag' ] ] });
});


test('should parse single named parameter', () => {
	const result = createExpressionParser({ namedParams: { 'from': ['x', 'y'] } })('from( 123, 456)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: [ [ 
		'NamedParam', 'from', [ [ 'NumberConstant', 123 ], [ 'NumberConstant', 456 ] ] 
	] ] });
});


test('should parse multiple named parameters', () => {
	const result = createExpressionParser({ namedParams: { 'from': ['x', 'y'] } })('from( 123, 456), to(789)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: [ 
		[ 'NamedParam', 'from', [ [ 'NumberConstant', 123 ], [ 'NumberConstant', 456 ] ] ],
		[ 'NamedParam', 'to', [ [ 'NumberConstant', 789 ] ] ] 
	] });
});
*/
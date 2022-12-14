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


test('should give priority to multiplication over addition', () => {
	const result = createExpressionParser({ positional: ['a']  })('1 * 2 + 3 * 4');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: {
			positional: {
				a: [ 'Add', 
					['Multiply', [ 'NumberConstant', 1 ], [ 'NumberConstant', 2 ] ],
					['Multiply', [ 'NumberConstant', 3 ], [ 'NumberConstant', 4 ] ]
				]
			}
		}			
	});
});


test('should parse simple inequality', () => {
	const result = createExpressionParser({ positional: ['a']  })('1 < 3');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: {
			positional: {
				a: [ 'LessThan', [ 'NumberConstant', 1 ], [ 'NumberConstant', 3 ] ]
			}
		}			
	});
});


test('should give priority to and over or', () => {
	const result = createExpressionParser({ positional: ['a']  })('true aNd false or true And false');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: {
			positional: {
				a: [ 'Or', 
					['And', [ 'BoolConstant', true ], [ 'BoolConstant', false ] ],
					['And', [ 'BoolConstant', true ], [ 'BoolConstant', false ] ]
				]
			}
		}			
	});
});


test('should parse logical and', () => {
	const result = createExpressionParser({ positional: ['a']  })('1 > 3 and a < b');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: {
			positional: {
				a: ['And', 
					[ 'GreaterThan', [ 'NumberConstant', 1 ], [ 'NumberConstant', 3 ] ],
					[ 'LessThan', [ 'Identifier', 'a' ], [ 'Identifier', 'b' ] ]
				]
			}
		}			
	});
});


test('should parse logical not', () => {
	const result = createExpressionParser({ positional: ['a']  })('!(1 > 3)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ 
		params: {
			positional: {
				a: ['Not', 
					[ 'GreaterThan', [ 'NumberConstant', 1 ], [ 'NumberConstant', 3 ] ]
				]
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


test('should validate if there are too few parameters', () => {
	const result = createExpressionParser({ positional: ['z', 'w'] })('oneIndentifier');
	expect(result.errors).toMatchObject([ 'Missing argument: "w".' ]);
});


test('should validate if there are too many parameters', () => {
	const result = createExpressionParser({ positional: ['z', 'w'] })(
		'oneIndentifier, anotherIdentifier, excessIdentifier, moreExcessIdentifier');
	expect(result.errors).toMatchObject([ 'Too many arguments.' ]);
});


test('should validate if there is no flag placed on the positional parameters', () => {
	const result = createExpressionParser({ positional: ['z', 'w'], flags: ['someFlag'] })(
		'oneIndentifier, someFlag');
	expect(result.errors).toMatchObject([ 'Argument "w" shouldn\'t be a flag.' ]);
});


test('should validate if there is no named parameter placed where there should be positional parameters', () => {
	const result = createExpressionParser({ positional: ['z', 'w'], named: { 'from': ['x', 'y'] } })(
		'oneIndentifier, from(123,  456)');
	expect(result.errors).toMatchObject([ 'Argument "w" shouldn\'t be a named parameter.' ]);
});


test('should parse flag', () => {
	const result = createExpressionParser({ positional: ['a'], flags: ['someFlag'] })('oneIndentifier, someFlag');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: {
		positional: { a: [ 'Identifier', 'oneIndentifier' ] },
		flags: { someFlag: true }
	} });
});


test('should parse single named parameter', () => {
	const result = createExpressionParser({ named: { 'from': ['x', 'y'] } })('from( 123, 456)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: {  
		named: {
			from: { 
				x: [ 'NumberConstant', 123 ], 
				y: [ 'NumberConstant', 456 ]
			}
		}
	} });
});


test('should parse multiple named parameters', () => {
	const result = createExpressionParser({ named: { 'from': ['x', 'y'], to: ['z'] } })('from( 123, 456), to(789)');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ params: {
		named: {
			from: { 
				x: [ 'NumberConstant', 123 ], 
				y: [ 'NumberConstant', 456 ]
			},
			to: {
				z: [ 'NumberConstant', 789 ]
			}
		}
	} });
});


test('should parse empty expression', () => {
	const result = createExpressionParser({})(null);
	expect(result.errors).toBeFalsy();
});


test('should reject too few named parameters.', () => {
	const result = createExpressionParser({ named: { 'from': ['x', 'y'] } })('from(123)');
	expect(result.errors).toMatchObject([ 'Missing argument: "from.y".' ]);
});

test('should reject too many named parameters.', () => {
	const result = createExpressionParser({ named: { 'from': ['x', 'y'] } })('from(123, 456, 789)');
	expect(result.errors).toMatchObject([ 'Too many arguments for named parameter "from".' ]);
});

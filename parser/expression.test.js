const { createExpressionParser } = require('./expression');


test('should reject an incorrect value', () => {
	const result = createExpressionParser({})('?}{/~');
	expect(result.errors.length).toBeTruthy();
});

test('should perform simple addition', () => {
	const result = createExpressionParser({})('1 + 3');
	expect(result.errors).toBeFalsy();
	expect(result).toMatchObject({ value: [ 'Add', [ 'Number', 1 ], [ 'Number', 3 ] ] });
});
const { createExpressionParser } = require('./expression');


test('should reject an incorrect value', () => {
	const result = createExpressionParser({}).parse('?}{/~');
	expect(result).toMatchObject({ status: false });
});

test('should perform simple addition', () => {
	const result = createExpressionParser({}).parse('1 + 3');
	console.log(result);
	expect(result).not.toMatchObject({ status: false });
	expect(result).toEqual({ status: true, value: [ 'Add', [ 'Number', 1 ], [ 'Number', 3 ] ] });
});
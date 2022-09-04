const { parseExpression } = require('./expression');

test('should not crash right away', () => {
	expect(parseExpression('example', {}));
});
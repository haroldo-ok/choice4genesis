const { parse } = require('./syntax-full');


test('should parse create command', () => {
	
const SOURCE = '* create example, 1';

	expect(parse(SOURCE)).toMatchObject({ body: [
		{
			command: 'create',
			params: {
				positional: {
					variable: [ 'Identifier', 'example' ],
					initialValue: [ 'NumberConstant', 1 ]
				}
			}
		}
	] });
});

test('should check syntax of expression', () => {
	
const SOURCE = '*if true = false, 123';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'Too many arguments.' }
	]);

});
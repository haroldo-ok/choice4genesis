const { parse } = require('./syntax-full');


test('should parse create command', () => {
	
	const SOURCE = '* create example, 1';

	const ast = parse(SOURCE);
	
	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
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


test('should parse choice command', () => {
	
	const SOURCE = '* choice';
	
	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'choice'
		}
	] });
});


test('should check syntax of expression', () => {
	
	const SOURCE = '*if true = false, 123';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'Too many arguments.' }
	]);

});


test('should reject unknown command', () => {
	
	const SOURCE = '* nonexistent';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'Unknown command: "nonexistent"' }
	]);

});

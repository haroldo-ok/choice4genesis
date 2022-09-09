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


test('should parse set command', () => {
	
	const SOURCE = '* set example, 1';

	const ast = parse(SOURCE);
	
	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'set',
			params: {
				positional: {
					variable: [ 'Identifier', 'example' ],
					newValue: [ 'NumberConstant', 1 ]
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


test('should parse if command', () => {
	
	const SOURCE = '*if true = false';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'if',
			params: {
				positional: {
					condition: [
						'Equal',
						[ 'BoolConstant', true ],
						[ 'BoolConstant', false ]
					]
				}
			}
		}
	] });

});


test('should parse elseif command', () => {
	
	const SOURCE = '*elseif true = false';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'elseif',
			params: {
				positional: {
					condition: [
						'Equal',
						[ 'BoolConstant', true ],
						[ 'BoolConstant', false ]
					]
				}
			}
		}
	] });

});


test('should parse else command', () => {
	
	const SOURCE = '* else';
	
	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'else'
		}
	] });
});


test('should parse finish command', () => {
	
	const SOURCE = '* finish';
	
	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'finish'
		}
	] });
});


test('should parse label command', () => {
	
	const SOURCE = '*label somewhere';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'label',
			params: {
				positional: {
					name: [ 'Identifier', 'somewhere' ]
				}
			}
		}
	] });

});


test('should parse goto command', () => {
	
	const SOURCE = '*goto somewhere';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'goto',
			params: {
				positional: {
					target: [ 'Identifier', 'somewhere' ]
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


test('should reject unknown command', () => {
	
	const SOURCE = '* nonexistent';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'Unknown command: "nonexistent"' }
	]);

});

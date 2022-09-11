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


test('should parse temp command', () => {
	
	const SOURCE = '* temp example, 1';

	const ast = parse(SOURCE);
	
	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'temp',
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
	
const SOURCE = `
*if a < b
	One line
	Another line
*elseif true = false
	Something else
`;

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'if',
			params: {
				positional: {
					condition: [
						'LessThan',
						[ 'Identifier', 'a' ],
						[ 'Identifier', 'b' ]
					]
				}
			}
		},
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
	
const SOURCE = `
* if 1 = 2
	Something
* else
	Something else
`;
	
	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{ command: 'if' },
		{ command: 'else' }
	] });
});


test('should find siblings of an if command', () => {
	
const SOURCE = `
* if 1 = 2
	Something
* elseif 2 > 3
	Something more
* else
	Something else
`;
	
	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{ 
			command: 'if',
			siblings: {
				'elseif': [ { command: 'elseif' } ],
				'else': [ { command: 'else' } ]
			}
		},
		{ command: 'elseif' },
		{ command: 'else' }
	] });
});



test('should parse scene_list command', () => {
	
	const SOURCE = '* scene_list';
	
	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'scene_list'
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


test('should parse goto_scene command', () => {
	
	const SOURCE = '*goto_scene somewhere';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'goto_scene',
			params: {
				positional: {
					target: [ 'Identifier', 'somewhere' ]
				}
			}
		}
	] });

});


test('should parse title command', () => {
	
	const SOURCE = '*title "Name of the game"';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'title',
			params: {
				positional: {
					name: [ 'StringConstant', 'Name of the game' ]
				}
			}
		}
	] });

});


test('should parse author command', () => {
	
	const SOURCE = '*author "Your Name Here"';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'author',
			params: {
				positional: {
					name: [ 'StringConstant', 'Your Name Here' ]
				}
			}
		}
	] });

});


test('should parse background command', () => {
	
	const SOURCE = '*background "example.png"';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'background',
			params: {
				positional: {
					fileName: [ 'StringConstant', 'example.png' ]
				}
			}
		}
	] });

});


test('should parse music command', () => {
	
	const SOURCE = '*music "example.xgm"';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'music',
			params: {
				positional: {
					fileName: [ 'StringConstant', 'example.xgm' ]
				}
			}
		}
	] });

});


test('should parse sound command', () => {
	
	const SOURCE = '*sound "example.wav"';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'sound',
			params: {
				positional: {
					fileName: [ 'StringConstant', 'example.wav' ]
				}
			}
		}
	] });

});


test('should parse window command', () => {
	
	const SOURCE = '*window from(123, 456), to(321, 654), borderless';

	const ast = parse(SOURCE);

	expect(ast.errors).toBeFalsy();
	expect(ast).toMatchObject({ body: [
		{
			command: 'window',
			params: {
				named: {
					from: { 
						x: [ 'NumberConstant', 123 ], 
						y: [ 'NumberConstant', 456 ]
					},
					to: {
						x: [ 'NumberConstant', 321 ],
						y: [ 'NumberConstant', 654 ]
					}
				},
				
				flags: { borderless: true }
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


test('should reject elseif without if', () => {
	
	const SOURCE = '*elseif true = false';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'The command "elseif" can only be used after "if" or "elseif".' }
	]);

});


test('should reject else without if', () => {
	
	const SOURCE = '*else';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'The command "else" can only be used after "if" or "elseif".' }
	]);

});

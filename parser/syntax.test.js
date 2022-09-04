const { parse } = require('./syntax');


test('parse simple lines', () => {
	
const SOURCE = `
Line 1
Line 2   
		
Line 3
`

	expect(parse(SOURCE)).toEqual({
		type: 'script',
		body: [
			{ type: 'text', line: 2, text: 'Line 1' },
			{ type: 'text', line: 3, text: 'Line 2' },
			{ type: 'blank', line: 4 },
			{ type: 'text', line: 5, text: 'Line 3' }
		]
	});
});

test('parse simple commands', () => {
	
const SOURCE = `
* example
*another
`

	expect(parse(SOURCE)).toEqual({
		type: 'script',
		body: [
			{ type: 'command', line: 2, command: 'example' },
			{ type: 'command', line: 3, command: 'another' }
		]
	});
});


test('parse simple options', () => {
	
const SOURCE = `
# I will choose this
#I will choose that
`

	expect(parse(SOURCE)).toEqual({
		type: 'script',
		body: [
			{ type: 'option', line: 2, text: 'I will choose this' },
			{ type: 'option', line: 3, text: 'I will choose that' }
		]
	});
});


test('parse nested command', () => {
	
const SOURCE = `
* example
	One line
	Another line
`

	expect(parse(SOURCE)).toEqual({
		type: 'script',
		body: [
			{ 
				type: 'command', 
				line: 2, 
				command: 'example',
				body: [
					{ type: 'text', line: 3, text: 'One line' },
					{ type: 'text', line: 4, text: 'Another line' },
				]
			},
		]
	});
});


test('parse multiple nested commands', () => {
	
const SOURCE = `
* example
	One line
	Another line
* another
	One more line
	Yet another line
`

	expect(parse(SOURCE)).toEqual({
		type: 'script',
		body: [
			{ 
				type: 'command', 
				line: 2, 
				command: 'example',
				body: [
					{ type: 'text', line: 3, text: 'One line' },
					{ type: 'text', line: 4, text: 'Another line' },
				]
			},
			{ 
				type: 'command', 
				line: 5, 
				command: 'another',
				body: [
					{ type: 'text', line: 6, text: 'One more line' },
					{ type: 'text', line: 7, text: 'Yet another line' },
				]
			},
		]
	});
});


test('parse deeply nested commands', () => {
	
const SOURCE = `
* level_1
	* level_1_1
		* level_1_1_1
		* level_1_1_2
	* level_1_2
	Another line
* another
	One more line
	Yet another line
`

	expect(parse(SOURCE)).toEqual({
		type: 'script',
		body: [
			{ 
				type: 'command', 
				line: 2, 
				command: 'level_1',
				body: [
					{ 
						type: 'command', 
						line: 3, 
						command: 'level_1_1',
						body: [
							{ type: 'command', line: 4, command: 'level_1_1_1' },
							{ type: 'command', line: 5, command: 'level_1_1_2' },
						]
					},
					{ type: 'command', line: 6, command: 'level_1_2' },
					{ type: 'text', line: 7, text: 'Another line' },
				]
			},
			{ 
				type: 'command', 
				line: 8, 
				command: 'another',
				body: [
					{ type: 'text', line: 9, text: 'One more line' },
					{ type: 'text', line: 10, text: 'Yet another line' },
				]
			},
		]
	});
});


test('check tab/space inconsinstency', () => {

const SOURCE = '*example\n\tWith tab\n With space';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 3, message: 'Inconsistent indentation, this line uses spaces, while line 2 uses tabs.' }
	]);

});


test('check space/tab inconsinstency', () => {

const SOURCE = '*example\n With space\n\tWith tabs';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 3, message: 'Inconsistent indentation, this line uses tabs, while line 2 uses spaces.' }
	]);

});


test('check tab/space inconsinstency on the same line', () => {

const SOURCE = '*example\n\t  With mixed indentation on the same line';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 2, message: 'Inconsistent indentation, this line uses both spaces and tabs.' }
	]);

});


test('check unexpected indent at the start of the file', () => {

const SOURCE = '\tIndent at the start of the file';

	expect(parse(SOURCE).errors).toEqual([
		{ line: 1, message: 'Unexpected indentation at the start of the file.' }
	]);

});

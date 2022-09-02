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
			{ type: 'blank', line: 1 },
			{ type: 'text', line: 2, text: 'Line 1' },
			{ type: 'text', line: 3, text: 'Line 2' },
			{ type: 'blank', line: 4 },
			{ type: 'text', line: 5, text: 'Line 3' },
			{ type: 'blank', line: 6 }
		]
	});
});
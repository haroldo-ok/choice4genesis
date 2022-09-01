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
			{ type: 'text', line: 1, content: '' },
			{ type: 'text', line: 2, content: 'Line 1' },
			{ type: 'text', line: 3, content: 'Line 2' },
			{ type: 'text', line: 4, content: 'Line 3' },
			{ type: 'text', line: 5, content: '' }
		]
	});
});
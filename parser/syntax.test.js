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
			{ type: 'text', content: '' },
			{ type: 'text', content: 'Line 1' },
			{ type: 'text', content: 'Line 2' },
			{ type: 'text', content: 'Line 3' },
			{ type: 'text', content: '' }
		]
	});
});
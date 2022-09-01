const { parse } = require('./syntax');

test('parse something', () => {
  expect(parse('')).toBe('');
});
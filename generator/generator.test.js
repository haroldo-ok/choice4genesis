const { generate } = require('./generator');


const createFakeFileSystem = sources => ({
	readSource: name => {
		const fileName = name + '.choice';
		const source = sources[fileName];
		if (source === undefined) {
			throw new Error(`File not found: "${fileName}"`);
		}
		return source;
	}
});


test('should generate code for a simple script', () => {
	const fileSystem = createFakeFileSystem({ 'startup.choice': 'This is a test' });
	const result = generate(fileSystem);
	
	expect(result.errors).toBeFalsy();
});
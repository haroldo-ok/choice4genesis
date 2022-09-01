const parse = source => {
	const lines = source.split(/\r?\n/g);
	
	return {
		type: 'script',
		body: lines.map((line, number) => ({
			type: 'text',
			line: number + 1,
			content: line
		}))
	};
};

module.exports = { parse };
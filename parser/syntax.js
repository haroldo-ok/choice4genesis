const parse = source => {
	const lines = source.split(/\r?\n/g);
	
	return {
		type: 'script',
		body: lines.map(line => ({
			type: 'text',
			content: line
		}))
	};
};

module.exports = { parse };
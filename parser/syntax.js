const parse = source => {
	const lines = source.split(/\r?\n/g).map((text, index) => ({
		text: text.trimEnd(),
		line: index + 1
	}));
	
	return {
		type: 'script',
		body: lines.map(({ text, line}) => (text ? {
			type: 'text',
			line,
			text
		} : {
			type: 'blank',
			line
		}))
	};
};

module.exports = { parse };
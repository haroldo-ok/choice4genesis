const trimBlanks = lines => {
	let start = 0;
	let end = lines.length - 1;

	while (start <= end && lines[start].type === 'blank') {
		start++;
	}
	
	while (end >= start && lines[end].type === 'blank') {
		end--;
	}
	
	if (start > end) {
		return [];
	}
	return lines.slice(start, end + 1);
};

const parse = source => {
	const lines = source.split(/\r?\n/g).map((text, index) => ({
		text: text.trimEnd(),
		line: index + 1
	}));
	
	const body = lines.map(({ text, line}) => {
		if (!text) {
			return { type: 'blank', line };
		}
		
		if (text[0] === '*') {
			return { type: 'command', line, command: text.substring(1).trim() };
		}
		
		if (text[0] === '#') {
			return { type: 'option', line, text: text.substring(1).trim() };
		}

		return { type: 'text', line, text };
	});
	
	return {
		type: 'script',
		body: trimBlanks(body)
	};
};

module.exports = { parse };
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

const parseLine = ({ text, line}) => {
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
};

const parseBody = (lines, initialIndex, baseIndent) => {
	let currentIndex = initialIndex;
	
	const body = [];
	while (currentIndex < lines.length && 
			(lines[currentIndex].indent >= baseIndent || !lines[currentIndex].text)) {
		const line = lines[currentIndex];
		if (line.indent === baseIndent || !line.text) {
			body.push(parseLine(line));
			currentIndex++;
		} else {
			const lastBody = body[body.length - 1];
			const parsedChild = parseBody(lines, currentIndex, line.indent);
			lastBody.body = parsedChild.body;
			currentIndex = parsedChild.currentIndex + 1;
		}
	}
	
	return {
		currentIndex,
		body: trimBlanks(body)
	}
}

const parse = source => {
	const lines = source.split(/\r?\n/g).map((text, index) => ({
		text: text.trim(),
		line: index + 1,
		indent: /^\s*/.exec(text)[0].length
	}));
		
	return {
		type: 'script',
		body: parseBody(lines, 0, 0).body
	};
};

module.exports = { parse };
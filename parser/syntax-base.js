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
		const commandLine = text.substring(1).trim();
		const command = commandLine.split(/\s+/g, 1)[0];
		const param = commandLine.substring(command.length).trim();
		const result = { type: 'command', line, command  };
		if (param) {
			result.param = param;
		}
		return result;
	}
	
	if (text[0] === '#') {
		return { type: 'option', line, text: text.substring(1).trim() };
	}

	return { type: 'text', line, text };
};

const parseBody = (lines, initialIndex, baseIndent, context) => {
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
			if (lastBody) {
				const parsedChild = parseBody(lines, currentIndex, line.indent, context);
				lastBody.body = parsedChild.body;
				currentIndex = parsedChild.currentIndex;
			} else {
				context.errors.push({
					line: line.line, 
					message: 'Unexpected indentation at the start of the file.'
				});
				currentIndex = lines.length;
			}				
		}
	}
	
	return {
		currentIndex,
		body: trimBlanks(body)
	}
}

const splitLines = (source, context) => source.split(/\r?\n/g).map((text, index) => {
	const describeIndentChar = character => character === '\t' ? 'tabs' : 'spaces';

	const lineNumber = index + 1;
	const indentString = /^\s*/.exec(text)[0];
	
	if (indentString.length) {
		const indentChar = indentString[0];
		
		if (indentString.length && !!indentString.split('').find(ch => ch !== indentChar)) {
			context.errors.push({
				line: lineNumber, 
				message: 'Inconsistent indentation, this line uses both spaces and tabs.'
			});
		} else if (!context.indent) {
			context.indent = {
				firstIndentLine: lineNumber,
				indentChar
			};
		} else if (indentChar != context.indent.indentChar) {
			context.errors.push({
				line: lineNumber, 
				message: 
					`Inconsistent indentation, this line uses ${describeIndentChar(indentChar)}, ` +
					`while line 2 uses ${describeIndentChar(context.indent.indentChar)}.`
			});
		}
	}
	
	return {
		text: text.trim(),
		line: lineNumber,
		indent: indentString.length
	};
});

const parse = source => {
	const context = { errors: [] };
	
	const lines = splitLines(source, context);

	const result = {
		type: 'script',
		body: parseBody(lines, 0, 0, context).body
	};

	if (context.errors.length) {
		return { ...result, errors: context.errors };
	}
	return result;
};

module.exports = { parse };
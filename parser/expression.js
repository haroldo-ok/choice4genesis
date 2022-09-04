'use strict';

const P = require('parsimmon');

// Begin: Utility functions from "math.js", from Parsimmon's demos; see those for full comments

let _ = P.optWhitespace;

const operators = ops => {
	let keys = Object.keys(ops).sort();
	let ps = keys.map(k =>
		P.string(ops[k])
		.trim(_)
		.result(k)
	);
	return P.alt.apply(null, ps);
}

const PREFIX = (operatorsParser, nextParser) => {
	let parser = P.lazy(() => {
		return P.seq(operatorsParser, parser).or(nextParser);
	});
	return parser;
};

const POSTFIX = (operatorsParser, nextParser) => {
	return P.seqMap(nextParser, operatorsParser.many(), (x, suffixes) =>
		suffixes.reduce((acc, x) => [x, acc], x)
	);
};

const BINARY_LEFT = (operatorsParser, nextParser) => {
	return P.seqMap(
		nextParser,
		P.seq(operatorsParser, nextParser).many(),
		(first, rest) => {
			return rest.reduce((acc, ch) => {
				let [op, another] = ch;
				return [op, acc, another];
			}, first);
		}
	);
}


// A simple integer
const Num = P.regexp(/[0-9]+/)
	.map(str => ["Number", +str])
	.desc("number");
	
let Expression;

// A basic value is any parenthesized expression or a number.
const Basic = P.lazy(() =>
	P.string("(")
		.then(Expression)
		.skip(P.string(")"))
		.or(Num)
);

// End: Utility functions from "math.js", from Parsimmon's demos



const table = [
  { type: PREFIX, ops: operators({ Negate: "-" }) },
  { type: BINARY_LEFT, ops: operators({ Multiply: "*", Divide: "/" }) },
  { type: BINARY_LEFT, ops: operators({ Add: "+", Subtract: "-" }) }
];

const TableParser = table.reduce(
	(acc, level) => level.type(level.ops, acc),
	Basic
);

Expression = TableParser.trim(_);

const ExpressionList = Expression.sepBy(P.string(","));



const formatExpected = expected => {
	if (expected.length === 1) {
		return "Expected: " + expected[0];
	}
	return "Expected one of the following: " + expected.join(", ");
}


const createExpressionParser = config => {
	return (source, lineNumber) => {
		const result = ExpressionList.parse(source);
		if (!result.status) {
			const errorMessage = `Error on the expression on column ${result.index.column}: ${ formatExpected(result.expected) }`;
			return { line: lineNumber, errors: [ errorMessage ] };
		}
		return { line: lineNumber, params: result.value };
	}
};

module.exports = { createExpressionParser };
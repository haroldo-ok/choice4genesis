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

// Turn escaped characters into real ones (e.g. "\\n" becomes "\n").
// Taken from the "json.js?" example.
function interpretEscapes(str) {
  let escapes = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    let type = escape.charAt(0);
    let hex = escape.slice(1);
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (escapes.hasOwnProperty(type)) {
      return escapes[type];
    }
    return type;
  });
}


// A simple integer
const NumberConstant = P.regexp(/[0-9]+/)
	.map(str => ["NumberConstant", +str])
	.desc("number");

// End: Utility functions from "math.js", from Parsimmon's demos


// A simple string
const StringConstant = P.regexp(/"((\\"|[^"])+)"/, 1)
	.map(str => ["StringConstant", interpretEscapes(str)])
	.desc("string");
	
// A simple identifier
const Identifier = P.regexp(/[a-z_][\w_]*/i)
	.map(str => ["Identifier", str])
	.desc("identifier");
	
// A few separators
const comma = P.string(",");
const colon = P.string(":");


const table = [
  { type: PREFIX, ops: operators({ Negate: "-" }) },
  { type: BINARY_LEFT, ops: operators({ Multiply: "*", Divide: "/" }) },
  { type: BINARY_LEFT, ops: operators({ Add: "+", Subtract: "-" }) }
];

const createExpressionParserObject = config => {
	let Expression;
	
	const Flag = config.flags && config.flags.length && P.regexp(new RegExp(config.flags.join('|')))
		.map(str => ["Flag", str])
		.desc("identifier");

	const NamedParam = config.namedParams && P.lazy(() => P.alt(...Object.entries(config.namedParams).map(([k, v]) => {
		const paramList = v.map((paramName, index) => {
			const NamedParamParam = Expression.desc(k + ':' + paramName);
			console.log({ NamedParamParam, index, Expression });
			return index ? colon.trim(_).then(NamedParamParam) : NamedParamParam;
		});
		console.log(paramList);
		const NamedParamParamList = P.seq(...paramList);
		
		return P.string(k + ':')
			.then(NamedParamParamList)
			.map(str => ['NamedParam', k])
			.desc(k + ':')
	})));
	
	// A basic value is any parenthesized expression or a number.
	const Basic = P.lazy(() =>
		P.string("(")
			.then(Expression)
			.skip(P.string(")"))
			.or(NumberConstant)
			.or(StringConstant)
			.or(Identifier)
	);
	
	const TableParser = table.reduce(
		(acc, level) => level.type(level.ops, acc),
		Basic
	);

	Expression = TableParser.trim(_);	
	
	let Parameter = Expression;
	if (NamedParam) {
		Parameter = NamedParam.trim(_).or(Parameter)
	}
	if (Flag) {
		Parameter = Flag.trim(_).or(Parameter);
	}

	const ParameterList = Parameter.sepBy(comma);
	
	return ParameterList;
};



const formatExpected = expected => {
	if (expected.length === 1) {
		return "Expected: " + expected[0];
	}
	return "Expected one of the following: " + expected.join(", ");
}


const createExpressionParser = config => {
	const parser = createExpressionParserObject(config);
	
	return (source, lineNumber) => {
		const result = parser.parse(source);
		if (!result.status) {
			const errorMessage = `Error on the expression on column ${result.index.column}: ${ formatExpected(result.expected) }`;
			return { line: lineNumber, errors: [ errorMessage ] };
		}
		return { line: lineNumber, params: result.value };
	}
};


module.exports = { createExpressionParser };
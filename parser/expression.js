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
const IDENTIFIER_REGEX = /[a-z_][\w_]*/i;
const Identifier = P.regexp(IDENTIFIER_REGEX)
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
	
	const ExpressionList = P.lazy(() => Expression.trim(_).sepBy(comma));
	
	const Flag = config.flags && config.flags.length && P.regexp(new RegExp(config.flags.join('|')))
		.map(str => ["Flag", str])
		.desc("flag");

	const NamedParam = P.seq(
			P.regexp(IDENTIFIER_REGEX).trim(_),
			P.string("("),
			ExpressionList,
			P.string(")")
		)
		.map(([name, op, params, cp]) => ["NamedParam", name, params])
		.desc("named param");

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
	
	let Parameter = NamedParam.trim(_).or(Expression);
	if (Flag) {
		Parameter = Flag.trim(_).or(Parameter);
	}

	const ParameterList = Parameter.sepBy(comma);
	
	return ParameterList;
};


const isFlagArgument = argument => argument && argument[0] === 'Flag';
const isNamedArgument = argument => argument && argument[0] === 'NamedParam';

const collectPositionalArguments = (paramValues, paramNames, errors) =>
	(paramNames || []).map((paramName, index) => {
		const argument = paramValues[index];
		if (!argument) {
			errors.push(`Missing argument for "${paramName}" at position ${index + 1}.`);
		} else if (isFlagArgument(argument)) {
			errors.push(`Argument "${paramName}" at position ${index + 1} shouldn't be a flag.`);
		} else if (isNamedArgument(argument)) {
			errors.push(`Argument "${paramName}" at position ${index + 1} shouldn't be a named parameter.`);
		}
		return [ paramName, argument ]
	});
	
const validateTooManyArguments = (result, config, errors) => {
	const positionalLength = (config.positional || []).length;
	const hasTooManyArguments = !!result.value.find((argument, index) => 
		index >= positionalLength && !isFlagArgument(argument) && !isNamedArgument(argument));
	if (hasTooManyArguments) {
		errors.push('Too many arguments.');
	}
};
	
const collectFlags = (result, config, errors) => 
	result.value.filter(isFlagArgument).map(([type, flagName]) => flagName);


const buildResultObject = (result, lineNumber, config) => {
	const errors = [];
	const params = {};

	const positional = collectPositionalArguments(result.value, config.positional, errors);	
	validateTooManyArguments(result, config, errors);
	if (positional.length) {
		params.positional = Object.fromEntries(positional);
	}

	const flags = collectFlags(result, config, errors);
	if (flags.length) {
		params.flags = Object.fromEntries(flags.map(name => [name, true]));
	}

	// Collect named params
	const lowerCaseParams = Object.fromEntries(Object.keys(config.named || {}).map(k => [k.toLowerCase(), k]));
	const named = result.value.filter(isNamedArgument).map(([type, paramName, paramArgs]) => {
		const realParamName = lowerCaseParams[paramName.toLowerCase()];
		const paramArgNames = config.named && config.named[realParamName];
		if (!realParamName) {
			errors.push(`Unknown named parameter: "${paramName}"`);
		}
		const args = collectPositionalArguments(paramArgs, paramArgNames.map(argName => realParamName + '.' + argName), errors)
			.map(([k, v]) => [k.split('.')[1], v]);
		return [ realParamName, Object.fromEntries(args) ];
	});
	if (named.length) {
		params.named = Object.fromEntries(named);
	}

	const returnValue = { line: lineNumber, params };
	if (errors.length) {
		returnValue.errors = errors;
	}		
	return returnValue;
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
		return buildResultObject(result, lineNumber, config);
	}
};


module.exports = { createExpressionParser };
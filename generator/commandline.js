'use strict';

const yargs = require('yargs');

const readCommandLine = () => yargs
	.command('transpile <project>', 'generates ".c" and ".res" files from the scripts', (yargs) => {
		yargs.positional('project', {
			describe: 'name of the project to be transpiled',
			type: 'string'
		})
	})
	.demandCommand(1, 'You need at least one command before moving on')
	.strict()
	.help()
	.alias('transpile', 't')
	.argv;

module.exports = { readCommandLine };
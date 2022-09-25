'use strict';

const yargs = require('yargs');
const { normalize } = require('path');

const readCommandLine = () => yargs
	.command('transpile <project>', 'generates ".c" and ".res" files from the scripts', (yargs) => {
		yargs.positional('project', {
			describe: 'name of the project to be transpiled',
			type: 'string'
		})
	})
	.command('compile <project>', 'transpiles the project first, then compiles it using SGDK', (yargs) => {
		yargs.positional('project', {
			describe: 'name of the project to be transpiled',
			type: 'string'
		})
	})
	.options({
		'project-dir': {
			alias: 'pd',
			default: normalize(__dirname + '/../examples'),
			normalize: true,
			describe: 'Directory where the projects are located',
			type: 'string'
		},
		'sgdk-dir': {
			alias: 'sd',
			default: normalize(__dirname + '/../../sgdk170'),
			normalize: true,
			describe: 'Directory where SGDK is located',
			type: 'string'
		}
	})
	.demandCommand(1, 'You need to inform at least one command before moving on')
	.strict()
	.help()
	.alias('transpile', 't')
	.argv;

module.exports = { readCommandLine };
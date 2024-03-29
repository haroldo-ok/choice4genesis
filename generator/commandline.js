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
	.command('compile <project>', 'compiles the transpiled project using SGDK', (yargs) => {
		yargs.positional('project', {
			describe: 'name of the project to be transpiled',
			type: 'string'
		})
	})
	.command('emulate <project>', 'runs the compiled ROM on the emulator', (yargs) => {
		yargs.positional('project', {
			describe: 'name of the project to be transpiled',
			type: 'string'
		})
	})
	.command('menu', 'show an interactive menu')
	.command('edit', 'calls the code editor')
	.options({
		'project-dir': {
			alias: 'pd',
			default: normalize(__dirname + '/../examples'),
			normalize: true,
			describe: 'Directory where the projects are located',
			type: 'string'
		},
		'imagemagick-dir': {
			alias: 'kd',
			default: normalize(__dirname + '/../../ImageMagick-7.0.10-53-portable-Q16-x86'),
			normalize: true,
			describe: 'Directory where ImageMagick is located',
			type: 'string'
		},
		'sgdk-dir': {
			alias: 'sd',
			default: normalize(__dirname + '/../../sgdk170'),
			normalize: true,
			describe: 'Directory where SGDK is located',
			type: 'string'
		},
		'emulator-exe': {
			alias: 'ee',
			default: normalize(__dirname + '/../../Gens_KMod_v0.7.3/gens.exe'),
			normalize: true,
			describe: 'Executable of the emulator',
			type: 'string'
		},
		'watch': {
			alias: 'w',
			default: false,
			boolean: true,
			describe: 'Watch project for changes, and recompile if changed.'
		},
		'hot-reload-frontend': {
			alias: 'hf',
			default: false,
			boolean: true,
			describe: 'Says if the frontend for the editor should use be generated dinamically by parcel, instead of serving a static build.'
		},
		'open-browser': {
			alias: 'ob',
			default: true,
			boolean: true,
			describe: 'Says if the editor should be immediately opened in the browser.'
		}
	})
	.demandCommand(1, 'You need to inform at least one command before moving on')
	.example([
		['$0 transpile test', 'Transpiles the project called "test"'],
		['$0 compile test', 'Compiles, without transpiling, the project called "test"'],
		['$0 emulate test', 'Executes the existing ROM of the project called "test"'],
		['$0 menu', 'Calls the interactive menu'],
		['$0 transpile test -- compile', 'Transpiles and compiles the project called "test"'],
		['$0 transpile test -- compile emulate', 'Transpiles, compiles and runs the project called "test"']
	])
	.strict()
	.help()
	.alias('transpile', 't')
	.alias('compile', 'c')
	.alias('emulate', 'e')
	.argv;

module.exports = { readCommandLine };
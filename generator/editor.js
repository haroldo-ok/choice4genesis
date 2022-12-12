'use strict';

const { Parcel } = require('@parcel/core');

const showEditor = async (commandLine, executeCommands) => {
	let bundler = new Parcel({
		entries: 'editor/index.html',
		defaultConfig: '@parcel/config-default',
		serveOptions: {
			port: 1234
		},
		hmrOptions: {
			port: 1234
		}
	});

	await bundler.watch();

	console.log('OK', Parcel);
};

module.exports = { showEditor };
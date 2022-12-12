'use strict';

const { Parcel } = require('@parcel/core');
const { openInBrowser } = require('@parcel/utils');

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
	
	openInBrowser('http://localhost:1234/');

	console.log('OK', Parcel);
};

module.exports = { showEditor };
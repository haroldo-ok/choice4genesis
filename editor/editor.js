'use strict';


const { Parcel } = require('@parcel/core');
const { openInBrowser } = require('@parcel/utils');
const { normalize } = require('path');

const { startBackend } = require('./back/backend');

const PARCEL_PORT = 1234;
const API_PORT = 1235;

const showEditor = async (commandLine, executeCommands) => {
	startBackend(commandLine, API_PORT);
	
	let bundler = new Parcel({
		entries: normalize(__dirname + '/front/index.html'),
		defaultConfig: '@parcel/config-default',
		shouldAutoInstall: true,
		serveOptions: {
			port: PARCEL_PORT
		},
		hmrOptions: {
			port: PARCEL_PORT
		}
	});

	await bundler.watch();	
	console.log(`Frontend running on port ${PARCEL_PORT}`);

	// FIXME: Only for testing
	return;
	
	openInBrowser(`http://localhost:${PARCEL_PORT}/`);
};

module.exports = { showEditor };
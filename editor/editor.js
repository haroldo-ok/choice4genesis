'use strict';

const PARCEL_PORT = 1234;
const API_PORT = 1235;

const showEditor = async (commandLine, executeCommands) => {
	const { normalize } = require('path');
	const { openInBrowser } = require('@parcel/utils');
	
	const express = require('express');
	const url = require('url');
	const proxy = require('express-http-proxy');
	
	const { startBackend } = require('./back/backend');
	
	startBackend(commandLine, API_PORT);	
	
	const app = express();
	app.use(express.static(normalize(__dirname + '/front/dist')));
	
	const apiProxy = proxy('http://localhost:' + API_PORT + '/', {
		proxyReqPathResolver: req => url.parse(req.baseUrl).path
	});	
	app.use('/api/*', apiProxy);
	
	app.listen(PARCEL_PORT);

	
	/*
	const { Parcel } = require('@parcel/core');
	const { openInBrowser } = require('@parcel/utils');
	const { normalize } = require('path');

	const { startBackend } = require('./back/backend');

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
	*/
	console.log(`Frontend running on port ${PARCEL_PORT}`);

	if (commandLine.openBrowser) {
		openInBrowser(`http://localhost:${PARCEL_PORT}/`);
	}
};

module.exports = { showEditor };
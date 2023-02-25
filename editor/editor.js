'use strict';

const PARCEL_PORT = 1234;
const API_PORT = 1235;

const showEditor = async (commandLine, executeCommands) => {
	const { normalize } = require('path');
	const { openInBrowser } = require('@parcel/utils');
	
	const express = require('express');
	const url = require('url');
	const { createProxyMiddleware  } = require('http-proxy-middleware');
	
	const { startBackend } = require('./back/backend');
	
	startBackend(commandLine, API_PORT);	
	
	const app = express();
	
	app.use('/api', createProxyMiddleware({
		target: 'http://localhost:' + API_PORT,
		changeOrigin: true,
		pathRewrite: {
			'^/api' : '/'
		}
	}));

	app.use(express.static(normalize(__dirname + '/front/dist')));
	
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
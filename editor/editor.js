'use strict';


const { Parcel } = require('@parcel/core');
const { openInBrowser } = require('@parcel/utils');
const { normalize } = require('path');

const app = require('express')();

const PARCEL_PORT = 1234;
const API_PORT = 1235;

const showEditor = async (commandLine, executeCommands) => {
	let bundler = new Parcel({
		entries: normalize(__dirname + '/front/index.html'),
		defaultConfig: '@parcel/config-default',
		serveOptions: {
			port: PARCEL_PORT
		},
		hmrOptions: {
			port: PARCEL_PORT
		}
	});

	await bundler.watch();	
	
	/*
	const bundler = new Bundler('editor/index.html', {});
	await bundler.watch();
	*/

	app.get('/', (req, res) => {
	  res.send('OK!')
	});
	app.listen(API_PORT);
	
	openInBrowser(`http://localhost:${PARCEL_PORT}/`);

	console.log('OK');
};

module.exports = { showEditor };
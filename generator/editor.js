'use strict';

const Bundler = require('parcel-bundler');
const app = require('express')();
const { openInBrowser } = require('@parcel/utils');

const showEditor = async (commandLine, executeCommands) => {
	const bundler = new Bundler('editor/index.html', {});
	await bundler.watch();

	app.get('/api', (req, res) => {
	  res.send('OK!')
	});
	app.use(bundler.middleware());	
	
	app.listen(1234);
	
	openInBrowser('http://localhost:1234/');

	console.log('OK');
};

module.exports = { showEditor };
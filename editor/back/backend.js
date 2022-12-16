'use strict';

const express = require('express');

const startBackend = port => {
	const app = express();

	app.get('/', (req, res) => {
	  res.send('OK!')
	});
	app.listen(port);

	console.log(`Backend running on port ${port}`);
};

module.exports = { startBackend };
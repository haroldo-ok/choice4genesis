'use strict';

const express = require('express');

const startBackend = port => {
	const api = express.Router();
	api.get('/projects', (req, res) => {
		res.send('OK!')
	});

	const app = express();
		
	app.use('/v0', api);
	app.listen(port);

	console.log(`Backend running on port ${port}`);
};

module.exports = { startBackend };
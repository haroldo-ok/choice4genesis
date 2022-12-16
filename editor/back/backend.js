'use strict';

const express = require('express');

const { listProjectNames } = require('../../generator/project');

const startBackend = (commandLine, port) => {
	const api = express.Router();
	api.get('/projects', async (req, res) => {
		res.send(await listProjectNames(commandLine))
	});

	const app = express();
		
	app.use('/v0', api);
	app.listen(port);

	console.log(`Backend running on port ${port}`);
};

module.exports = { startBackend };
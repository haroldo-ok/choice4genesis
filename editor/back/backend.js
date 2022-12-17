'use strict';

const express = require('express');

const { listProjectNames, listProjectScenes } = require('../../generator/project');

const startBackend = (commandLine, port) => {
	const api = express.Router();
	api.get('/projects', async (req, res) => {
		res.send(await listProjectNames(commandLine))
	});

	api.get('/projects/:project/scenes', async (req, res) => {
		console.log({ req });
		res.send(await listProjectScenes(commandLine, req.params.project))
	});

	const app = express();
		
	app.use('/v0', api);
	app.listen(port);	

	console.log(`Backend running on port ${port}`);
};

module.exports = { startBackend };
'use strict';

const express = require('express');

const { listProjectNames, listProjectScenes, readProjectScene } = require('../../generator/project');

const startBackend = (commandLine, port) => {
	const api = express.Router();
	api.get('/projects', async (req, res) => {
		res.send(await listProjectNames(commandLine))
	});

	api.get('/projects/:project/scenes', async (req, res) => {
		res.send(await listProjectScenes(commandLine, req.params.project))
	});

	api.get('/projects/:project/scenes/:scene', async (req, res) => {
		res.type('txt');
		res.send(await readProjectScene(commandLine, req.params.project, req.params.scene));
	});
	
	api.use((err, req, res, next) => {
		console.error(err);
	});

	const app = express();
		
	app.use('/v0', api);
	app.listen(port);	

	console.log(`Backend running on port ${port}`);
};

module.exports = { startBackend };
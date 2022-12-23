'use strict';

const express = require('express');
const { fork } = require('child_process');

const { listProjectNames, listProjectScenes, openProjectOnExplorer, readProjectScene, writeProjectScene } = require('../../generator/project');

const startBackend = (commandLine, port) => {
	const errorHandler = (err, req, res, next) => {
		const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;;
		console.error(`Error ${err} at URL ${fullUrl}`, err);
		res.status(500).send({ url: fullUrl, error: err });
	}	
	
	const api = express.Router();
	api.get('/projects', async (req, res) => {
		try {
			res.send(await listProjectNames(commandLine))
		} catch (e) {
			errorHandler(e, req, res);
		}
	});

	api.get('/projects/:project/scenes', async (req, res) => {
		try {
			res.send(await listProjectScenes(commandLine, req.params.project))
		} catch (e) {
			errorHandler(e, req, res);
		}
	});

	api.get('/projects/:project/scenes/:scene', async (req, res) => {
		try {
			res.type('txt');
			res.send(await readProjectScene(commandLine, req.params.project, req.params.scene));
		} catch (e) {
			errorHandler(e, req, res);
		}
	});
	
	api.put('/projects/:project/scenes/:scene', express.text(), async (req, res) => {
		try {
			await writeProjectScene(commandLine, req.params.project, req.params.scene, req.body)
			res.send({ message: 'File saved.' });
		} catch (e) {
			errorHandler(e, req, res);
		}
	});

	api.post('/projects/:project/run', async (req, res) => {
		try {
			const child = fork('.', ['transpile', req.params.project, '--', 'compile', 'emulate']);
			child.on('exit', () => {
				console.log('Execution OK');
				res.send({ message: 'Execution OK' });
			});
		} catch (e) {
			errorHandler(e, req, res);
		}
	});

	api.post('/projects/:project/explore', async (req, res) => {
		try {
			openProjectOnExplorer(commandLine, req.params.project);
			res.send({ message: 'Execution OK' });
		} catch (e) {
			errorHandler(e, req, res);
		}
	});

	const app = express();
		
	app.use('/v0', api);
	app.listen(port);	

	console.log(`Backend running on port ${port}`);
};

module.exports = { startBackend };
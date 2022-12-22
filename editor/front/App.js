import React, { useEffect, useState } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

import '@picocss/pico/css/pico.min.css'
import 'font-awesome/css/font-awesome.min.css'
import './App.css'

import { prepareSyntax } from './syntax'
import { ProjectList } from './ProjectList'
import { SceneList } from './SceneList'
import { Scene } from './Scene'
import { RunButton } from './RunButton'
import { SaveAllButton } from './SaveAllButton'

import { callSaveSceneApi } from './hooks/api'

export function App() {
	prepareSyntax();

	const [projectName, setProjectName] = useState("");
	const [sceneName, setSceneName] = useState("");
	const [scenes, setScenes] = useState({});
	
	const handleSceneDataChange = ({ data, isModified }) => {
		const newScenes = { ...scenes };
		newScenes[sceneName] = { data, isModified };
		setScenes(newScenes);
	}
	
	const isModifiedScene = sceneName => (scenes[sceneName] || {}).isModified;
	
	const saveScene = async sceneName => {
		const data = scenes[sceneName].data;
		await callSaveSceneApi(projectName, sceneName, data);
		handleSceneDataChange({ data, isModified: false });
	};
	
	const saveAll = async () => {
		const promises = Object.entries(scenes)
		.filter(([sceneName, { isModified }]) => isModified)
		.map(([sceneName]) => saveScene(sceneName));
		
		await Promise.all(promises);
	};
	
	if (!projectName) {
		return (
			<main className="container">
				<nav>
					<article>
						<header>Select a project to edit...</header>
						<ProjectList value={projectName} onChange={setProjectName} />
					</article>
				</nav>
			</main>
		);
	}

	return (
		<div>
			<nav>
				<ul>
					<li><SaveAllButton projectName={projectName} onClick={saveAll} /></li>					
				</ul>
				<ul>
					<li><strong>choice4genesis editor</strong></li>
				</ul>			
				<ul>
					<li><RunButton projectName={projectName} /></li>
				</ul>
			</nav>
			<div className="editContainer">
				<nav>
					<article>
						<header>Scenes</header>
						<SceneList projectName={projectName} value={sceneName} onChange={setSceneName} onSaveScene={saveScene} isModified={isModifiedScene} />
					</article>
				</nav>
				<div>
					<Scene projectName={projectName} sceneName={sceneName} onChange={handleSceneDataChange} />
				</div>
			</div>
		</div>
	);
}

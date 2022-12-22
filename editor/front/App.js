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
					<li><a href="#" role="button" className="secondary">Save</a></li>
					<li><a href="#" role="button" className="secondary">Save all</a></li>
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
						<SceneList projectName={projectName} value={sceneName} onChange={setSceneName} isModified={isModifiedScene} />
					</article>
				</nav>
				<div>
					<Scene projectName={projectName} sceneName={sceneName} onChange={handleSceneDataChange} />
				</div>
			</div>
		</div>
	);
}

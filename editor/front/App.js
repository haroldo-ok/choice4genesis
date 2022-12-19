import React, { useEffect, useState } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

import '@picocss/pico/css/pico.min.css'
import './App.css'

import { prepareSyntax } from './syntax'
import { ProjectList } from './ProjectList'
import { SceneList } from './SceneList'
import { Scene } from './Scene'

export function App() {
	prepareSyntax();

	const [projectName, setProjectName] = useState("test");
	const [sceneName, setSceneName] = useState("");

	return <div>
		<ProjectList value={projectName} onChange={setProjectName} />
		<div className="editContainer">
			<nav>
				<article>
					<header>Scenes</header>
					<SceneList projectName={projectName} value={sceneName} onChange={setSceneName} />
				</article>
			</nav>
			<div>
				<Scene projectName={projectName} sceneName={sceneName} />
			</div>
		</div>
	</div>
}

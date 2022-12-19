import React, { useEffect, useState } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

import { ProjectList } from './ProjectList'
import { SceneList } from './SceneList'
import { Scene } from './Scene'
import '@picocss/pico/css/pico.min.css'

export function App() {
	const monaco = useMonaco();
	useEffect(() => {
		if (!monaco) return;		
		console.log("here is the monaco instance:", monaco);
		
		monaco.languages.register({ id: 'choicescript' });
		monaco.languages.setMonarchTokensProvider('choicescript', {
			tokenizer: {
				root: [
					[/^[ \t]*\*[ \t]*\w+/, 'keyword'],
					[/^[ \t]*\#/, 'keyword'],
					[/"((\\"|[^"])+)"/, 'string'],
					[/[\(\),]/, 'delimiter'],
					[/\d+/, 'number']
				]
			}
		});
	}, [monaco]);

	const [projectName, setProjectName] = useState("test");
	const [sceneName, setSceneName] = useState("");

	return <div>
		<ProjectList value={projectName} onChange={setProjectName} />
		<article>
			<SceneList projectName={projectName} value={sceneName} onChange={setSceneName} />
		</article>
		<Scene projectName={projectName} sceneName={sceneName} />
	</div>
}

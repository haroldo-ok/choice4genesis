import React, {useState} from 'react';
import { ProjectList } from './ProjectList'
import { SceneList } from './SceneList'
import { Editor } from './Editor'
import '@picocss/pico/css/pico.min.css'

export function App() {
	const [projectName, setProjectName] = useState("test");
	const [sceneName, setSceneName] = useState("");

	return <div>
		<ProjectList value={projectName} onChange={setProjectName} />
		<article>
			<SceneList projectName={projectName} value={sceneName} onChange={setSceneName} />
		</article>
		<Editor projectName={projectName} sceneName={sceneName} />
	</div>
}

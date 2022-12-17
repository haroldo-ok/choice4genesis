import React, {useState} from 'react';
import { ProjectList } from './ProjectList'
import '@picocss/pico/css/pico.min.css'

export function App() {
	const [projectName, setProjectName] = useState("test");
	const handleProjectNameChange = projectName => {
		setProjectName(projectName);
	}

	return <div>
		<h1>Hello world!</h1>				
		<ProjectList value={projectName} onChange={handleProjectNameChange} />
	</div>;
}

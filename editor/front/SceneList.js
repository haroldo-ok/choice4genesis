import React, {useState} from 'react';
import { useFetch } from 'usehooks-ts'

export function SceneList(props) {
	if (!props.projectName) return `<h1>Please, select a project...</h1>`
	
	const { data, error } = useFetch(`/api/v0/projects/${props.projectName}/scenes`);
	
	if (error) return <h1>Error while listing projects: ${error}</h1>;
	if (!data) return <h1>Loading project list...</h1>;
	
	const selectedValue = props.value && data.find(projectName => projectName === props.value) ? props.value : '';
	
	const handleProjectNameChange = e => {
		props.onChange && props.onChange(e.target.value);
	};
	
	return (
		<select value={selectedValue} onChange={handleProjectNameChange}>
			{['', ...data].map(({ fileName }) => 
				<option key={fileName} value={fileName}>{fileName || '-- Select project --'}</option>
			)};
		</select>
	);
}
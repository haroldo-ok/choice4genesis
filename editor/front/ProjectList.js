import React, {useState} from 'react';
import { useFetch } from 'usehooks-ts'

export function ProjectList() {
	const { data, error } = useFetch('/api/v0/projects');
	
	if (error) return <h1>Error while listing projects: ${error}</h1>;
	if (!data) return <h1>Loading project list...</h1>;

	return (
		<select>
			{data.map(projectName => 
				<option key={projectName} value={projectName}>{projectName}</option>
			)};
		</select>
	);
}
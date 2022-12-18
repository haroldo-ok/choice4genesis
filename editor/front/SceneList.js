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

	const preprocessData = data => data.map(o => ({
		name: o.fileName.replace(/\.choice$/ig, ''),
		...o
	}));
	
	return (
		<aside>
			<nav>
				<ul>
					{preprocessData(data).map(({ name }) =>
						<li key={name}>
							<a href="#" className="secondary">{name}</a>
						</li>
					)}
				</ul>
			</nav>
		</aside>
	);
}
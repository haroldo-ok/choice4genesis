'use strict';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

import { useSceneListApi } from './hooks';

export function RunButton(props) {
	if (!props.projectName) return <a href="#" role="button" disabled={true}><FontAwesomeIcon icon={faPlay} /> Run?</a>;
	
	const { data, error } = useSceneListApi(props.projectName);
	
	if (error) {
		console.error('Error while listing scenes', error);
		return <h1>Error while listing scenes</h1>;
	}
	if (!data) return <h1>Loading scene list...</h1>;
	
	const selectedValue = props.value && data.find(projectName => projectName === props.value) ? props.value : '';
	
	const handleSceneChange = name => {
		props.onChange && props.onChange(name);
	};

	const preprocessData = data => data.map(o => ({
		name: o.fileName.replace(/\.choice$/ig, ''),
		...o
	}));
	
	return <a href="#" role="button"><FontAwesomeIcon icon={faPlay} /> Run!</a>;
}
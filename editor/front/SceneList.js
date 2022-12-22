import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

import { useSceneListApi } from './hooks/api';

export function SceneList(props) {
	if (!props.projectName) return <h1>Please, select a project...</h1>;
	
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
	
	const handleSaveButtonClick = (e, sceneName) => {
		e.preventDefault();
		props.onSaveScene && props.onSaveScene(sceneName);
	}

	const preprocessData = data => data.map(o => ({
		name: o.fileName.replace(/\.choice$/ig, ''),
		...o
	}));
	
	const isModified = name => props.isModified && props.isModified(name);
	
	return (
		<aside>
			<nav>
				<ul>
					{preprocessData(data).map(({ name }) =>
						<li key={name}>
							<a href="#" className={name === props.value ? '' : 'secondary'} onClick={() => handleSceneChange(name)}>
								{ isModified(name) && <span><FontAwesomeIcon icon={faFloppyDisk} onClick={e => handleSaveButtonClick(e, name)} />&nbsp;</span> }
								{name}
							</a>
						</li>
					)}
				</ul>
			</nav>
		</aside>
	);
}
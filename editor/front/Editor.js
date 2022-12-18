import { useSceneApi } from './hooks';

export function Editor(props) {
	if (!props.projectName) return <h1>Please, select a project...</h1>;
	if (!props.sceneName) return <h1>Please, select a scene...</h1>;
	
	const { data, error } = useSceneApi(props.projectName, props.scene);
	
	if (error) return <h1>Error while loading scene ${props.sceneName}: ${error}</h1>;
	if (!data) return <h1>Loading scene "${props.sceneName}"...</h1>;
	
	
	return (
		OK
	);
};
import { useSceneApi } from './hooks';

export function Editor(props) {
	if (!props.projectName) return <h1>Please, select a project...</h1>;
	if (!props.sceneName) return <h1>Please, select a scene...</h1>;
	
	console.log('Here 1', { sceneName: props.sceneName });
	
	const { data, error } = useSceneApi(props.projectName, props.sceneName);
	
	if (error) {
		console.error(`Error while loading scene ${props.sceneName}`, error);
		return <h1>Error while loading scene {props.sceneName}</h1>;
	}
	if (!data) return <h1>Loading scene "{props.sceneName}"...</h1>;
	
	return (
		<h1>OK</h1>
	);
};
'use strict';

import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { useSceneApi } from './hooks/api';

export function Scene(props) {
	if (!props.projectName) return <h1>Please, select a project...</h1>;
	if (!props.sceneName) return <h1>Please, select a scene...</h1>;
	
	const { data, error } = useSceneApi(props.projectName, props.sceneName);
	
	if (error) {
		console.error(`Error while loading scene ${props.sceneName}`, error);
		return <h1>Error while loading scene {props.sceneName}</h1>;
	}
	if (!data) return <h1>Loading scene "{props.sceneName}"...</h1>;
	
	return (
	   <Editor
		 height="90vh"
		 defaultLanguage="choicescript"
		 path={`${props.projectName}/project/${props.sceneName}`}
		 defaultValue={data}
	   />
   );
};
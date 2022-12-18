import { useFetch } from 'usehooks-ts';

const BASE_URL = '/api/v0';

export function useProjectListApi() {
	return useFetch(`${BASE_URL}/projects`);
}

export function useSceneListApi(projectName) {
	return useFetch(`${BASE_URL}/projects/${projectName}/scenes`);
}

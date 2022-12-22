'use strict';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = '/api/v0';

// Based on https://dev.to/techcheck/custom-react-hook-usefetch-eid
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      setLoading('loading...')
      setData(null);
      setError(null);
      const source = axios.CancelToken.source();
	  
	  const promise = options.isPost ?
		axios.post(url, null, { cancelToken: source.token }) :
		axios.get(url, { cancelToken: source.token });
      
	  promise
      .then(res => {
          setLoading(false);
          //checking for multiple responses for more flexibility 
          //with the url we send in.
          res.data && setData(res.data);
          res.content && setData(res.content);
      })
      .catch(err => {
          setLoading(false)
          setError('An error occurred. Awkward..')
      })
      return () => {
          source.cancel();
      }
  }, [url]);

  return { data, loading, error };
}

export function useProjectListApi() {
	return useFetch(`${BASE_URL}/projects`);
}

export function useSceneListApi(projectName) {
	return useFetch(`${BASE_URL}/projects/${projectName}/scenes`);
}

export function useSceneApi(projectName, sceneName) {
	return useFetch(`${BASE_URL}/projects/${projectName}/scenes/${sceneName}`);
}

export async function callSaveSceneApi(projectName, sceneName, text) {
	return axios.put(`${BASE_URL}/projects/${projectName}/scenes/${sceneName}`, text, {
		headers: {
			'Content-Length': 0,
			'Content-Type': 'text/plain'
		}
    });
}

export async function callRunApi(projectName) {
	return axios.post(`${BASE_URL}/projects/${projectName}/run`);
}

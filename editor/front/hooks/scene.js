'use strict';

import React, { useEffect, useState } from 'react';

const [scenes, setScenes] = useState({});

export function useScene(sceneName, data) {
	const [modifiedData, setModifiedData] = useState(null);
	const [isModified, setModified] = useState(false);
	
	const setData = modifiedData => {
		setModifiedData(modifiedData);
		setModified(data == modifiedData);
	};

	return { data, modifiedData, isModified, setData };
}
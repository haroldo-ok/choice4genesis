'use strict';

import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

import { callRunApi } from './hooks';

export function RunButton(props) {
	if (!props.projectName) return <a href="#" role="button" disabled={true}><FontAwesomeIcon icon={faPlay} /> Run</a>;
	
	const [processing, setProcessing] = useState(false);
	
	const handleButtonClick = async e => {
		setProcessing(true);
		try {
			await callRunApi(props.projectName);
		} catch (e) {
			console.error('Error while executing', e);
		} finally {
			setProcessing(false);
		}
	};
	
	return <a href="#" role="button" disabled={processing} onClick={handleButtonClick}><FontAwesomeIcon icon={faPlay} /> Run{processing ? '*' : ''}</a>;
}
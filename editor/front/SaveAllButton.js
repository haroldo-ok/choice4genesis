'use strict';

import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

export function SaveAllButton(props) {
	const [processing, setProcessing] = useState(false);
	
	const handleButtonClick = async e => {
		setProcessing(true);
		try {
			await props.onClick(e);
		} catch (e) {
			console.error('Error while executing', e);
		} finally {
			setProcessing(false);
		}
	};
	
	return (
		<a href="#" role="button" disabled={processing} onClick={handleButtonClick} className="secondary">
			<FontAwesomeIcon icon={processing ? faCircleNotch : faFloppyDisk} className={processing ? 'fa-spin' : ''} /> Save all
		</a>
	);
}
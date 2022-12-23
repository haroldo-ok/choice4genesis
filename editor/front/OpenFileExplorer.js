'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'

import { callOpenExplorerApi } from './hooks/api';

export function OpenFileExplorer(props) {
	const handleButtonClick = async e => {
		try {
			await callOpenExplorerApi(props.projectName);
		} catch (e) {
			console.error('Error while opening explorer', e);
		}
	};
	
	return (
		<a href="#" role="button" onClick={handleButtonClick} className="secondary">
			<FontAwesomeIcon icon={faFolderOpen} /> View Files
		</a>
	);
}
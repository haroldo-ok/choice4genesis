import { useProjectListApi } from './hooks';

export function ProjectList(props) {
	const { data, error } = useProjectListApi();
	
	if (error) {
		console.error('Error while listing projects', error);
		return <h1>Error while listing projects</h1>;
	}
	if (!data) return <h1>Loading project list...</h1>;
	
	const selectedValue = props.value && data.find(projectName => projectName === props.value) ? props.value : '';
	
	const handleProjectNameChange = projectName => {
		props.onChange && props.onChange(projectName);
	};
	
	return (
		<aside>
			<nav>
				<ul>
					{data.map(projectName =>
						<li key={projectName}>
							<a href="#" className={projectName === selectedValue ? '' : 'secondary'} onClick={() => handleProjectNameChange(projectName)}>
								{projectName}
							</a>
						</li>
					)}
				</ul>
			</nav>
		</aside>
	);
}
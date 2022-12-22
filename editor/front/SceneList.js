import { useSceneListApi } from './hooks/api';

export function SceneList(props) {
	if (!props.projectName) return <h1>Please, select a project...</h1>;
	
	const { data, error } = useSceneListApi(props.projectName);
	
	if (error) {
		console.error('Error while listing scenes', error);
		return <h1>Error while listing scenes</h1>;
	}
	if (!data) return <h1>Loading scene list...</h1>;
	
	const selectedValue = props.value && data.find(projectName => projectName === props.value) ? props.value : '';
	
	const handleSceneChange = name => {
		props.onChange && props.onChange(name);
	};

	const preprocessData = data => data.map(o => ({
		name: o.fileName.replace(/\.choice$/ig, ''),
		...o
	}));
	
	return (
		<aside>
			<nav>
				<ul>
					{preprocessData(data).map(({ name }) =>
						<li key={name}>
							<a href="#" className={name === props.value ? '' : 'secondary'} onClick={() => handleSceneChange(name)}>
								{name}
							</a>
						</li>
					)}
				</ul>
			</nav>
		</aside>
	);
}
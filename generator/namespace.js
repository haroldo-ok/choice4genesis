'use strict';

const createNamespace = () => {
	const toKey = name => name.toLowerCase();
	const data = {};	
	return {
		get: name => data[toKey(name)],
		put: (name, value) => data[toKey(name)] = { name, value },
		list: () => Object.values(data)
	}
};

module.exports = { createNamespace };
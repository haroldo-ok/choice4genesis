const { identify } = require('imagemagick');
const { normalize } = require('path');

const convertImages = async (result, projectFolder) => {
	const imagemagickDir = normalize(__dirname + '/../../ImageMagick-7.0.10-53-portable-Q16-x86');

	identify.path = normalize(imagemagickDir + '/identify.exe');
	identify(normalize(projectFolder + '/project/' + Object.entries(result.images)[0][0]), (err, metadata) => console.log(err, metadata));
	
	return result;
};

module.exports = { convertImages };
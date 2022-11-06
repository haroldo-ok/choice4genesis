const { identify } = require('imagemagick');
const { normalize } = require('path');
const { existsSync } = require('fs');

const convertImages = async (result, projectFolder) => {
	const imagemagickDir = normalize(__dirname + '/../../ImageMagick-7.0.10-53-portable-Q16-x86');
	if (!existsSync(imagemagickDir)) {
		return { errors: [{ message: 'Imagemagick directory does not exist at: ' + projectFolder }] };
	}

	identify.path = normalize(imagemagickDir + '/identify.exe');
	if (!existsSync(identify.path)) {
		return { errors: [{ message: 'Imagemagick "identify" tool not found at: ' + identify.path }] };
	}
	
	identify(normalize(projectFolder + '/project/' + Object.entries(result.images)[0][0]), (err, metadata) => console.log(err, metadata));
	
	return result;
};

module.exports = { convertImages };
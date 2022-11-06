const { identify } = require('imagemagick');
const { normalize } = require('path');
const { existsSync } = require('fs');

const getMetadata = async imageFile => new Promise((resolve, reject) => {
	identify(imageFile, (err, {format, type, colors, width, height}) => {
		if (err) {
			reject(err);
			return;
		}
		resolve({format, type, colors: parseInt(colors), width, height});
	});
});

const convertImages = async (result, projectFolder) => {
	const imagemagickDir = normalize(__dirname + '/../../ImageMagick-7.0.10-53-portable-Q16-x86');
	if (!existsSync(imagemagickDir)) {
		return { errors: [{ message: 'Imagemagick directory does not exist at: ' + projectFolder }] };
	}

	identify.path = normalize(imagemagickDir + '/identify.exe');
	if (!existsSync(identify.path)) {
		return { errors: [{ message: 'Imagemagick "identify" tool not found at: ' + identify.path }] };
	}
	
	console.log(await getMetadata(normalize(projectFolder + '/project/' + Object.entries(result.images)[1][0])));
	
	return result;
};

module.exports = { convertImages };
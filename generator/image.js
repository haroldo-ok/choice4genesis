const { identify } = require('imagemagick');
const { normalize } = require('path');
const { existsSync } = require('fs');
const { copy } = require('fs-extra');

const getMetadata = async imageFile => new Promise((resolve, reject) => {
	identify(imageFile, (err, metadata) => {
		if (err) {
			reject(err);
			return;
		}
		const {format, type, colors, width, height} = metadata;
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
	
	const errors = [];
	await Promise.all(Object.entries(result.images).map(async ([imageFile, { entity }]) => {
		try {
			const sourceFile = normalize(`${projectFolder}/project/${imageFile}`);
			const destFile = normalize(`${projectFolder}/res/${imageFile}`);
			
			const {format, type, colors, width, height} = await getMetadata(sourceFile);
			
			const isCorrectFormat = format == 'PNG';
			const isCorrectPalette = type === 'Palette' && colors <= 16;
			const isCorrectSize = entity.command !== 'background' || width === 320 && height === 224;
			
			if (isCorrectFormat && isCorrectPalette && isCorrectSize) {
				console.log(`Copying "${imageFile}"...`);
				await copy(sourceFile, destFile);
			} else {
				console.log(`Converting "${imageFile}"...`);	
				errors.push({ message: `The image "${imageFile}" requires conversion.` });
			}
		} catch (e) {
			const message = `Error processing image "${imageFile}": ${e}`;
			console.error(message, e);
			errors.push({ message });
		}
	}));
	
	if (errors.length) {
		return { errors };
	}
	
	return result;
};

module.exports = { convertImages };
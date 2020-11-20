const { existsSync } = require("fs");
const anilistAuth = require("./anilistAuth");
const malAuth = require("./malAuth");

const checkAuth = async () => {
	const tokenDir = `${process.cwd()}/tokens`;
	const malToken = `${tokenDir}/mal.json`;
	const anilistToken = `${tokenDir}/anilist.json`;

	if (!existsSync(malToken)) {
		try {
			await malAuth.generateToken();
			console.log("MAL token has been generated.");
		} catch (e) {
			console.log("Failed to generate a MAL token.", e);
			return false;
		}
	}

	if (!existsSync(anilistToken)) {
		try {
			await anilistAuth.generateToken();
			console.log("Anilist token has been generated.");
		} catch (e) {
			console.log("Failed to generate an Anilist token.", e);
			return false;
		}
	}

	return true;
};

module.exports = {
	checkAuth,
};

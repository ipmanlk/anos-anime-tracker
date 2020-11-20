const anilistApi = require("./anilistApi");
const malApi = require("./malApi");

const updateProgress = async (mediaId, malId, episodes, progress) => {
	await anilistApi.updateProgress(mediaId, episodes, progress);
	await malApi.updateProgress(malId, episodes, progress);
};

module.exports = {
	getAnimeList: anilistApi.getAnimeList,
	updateProgress: updateProgress,
};

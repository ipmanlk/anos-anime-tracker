const anilistApi = require("./anilistApi");
const malApi = require("./malApi");

const updateProgress = async (mediaId, malId, episodes, progress) => {
	await anilistApi.updateProgress(mediaId, episodes, progress);
	await malApi.updateProgress(malId, episodes, progress);
};

const updateStatus = async (mediaId, malId, status) => {
	await anilistApi.updateStatus(mediaId, status);
	await malApi.updateStatus(malId, status);
};

module.exports = {
	getAnimeList: anilistApi.getAnimeList,
	updateProgress: updateProgress,
	updateStatus: updateStatus,
};

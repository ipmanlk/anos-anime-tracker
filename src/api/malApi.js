const fetch = require("node-fetch");
const malAuth = require("../auth/malAuth");
const querystring = require("querystring");

const updateProgress = async (animeId, episodes, progress) => {
	let token = require("../../tokens/mal.json");

	const body = {
		num_watched_episodes: progress,
	};

	if (episodes == progress) {
		body["status"] = "completed";
	}

	const res = await fetch(
		`https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token.access_token}`,
				"content-type": "application/x-www-form-urlencoded",
			},
			body: querystring.stringify(body),
		}
	);

	if (res.status == 401) {
		await malAuth.refreshToken();
		await updateProgress();
	}

	return true;
};

module.exports = {
	updateProgress,
};

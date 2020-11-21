const fetch = require("node-fetch");
const malAuth = require("../auth/malAuth");
const querystring = require("querystring");

const updateStatus = async (animeId, status) => {
	const token = getToken();

	const malStatuses = {
		REPEATING: "watching",
		CURRENT: "watching",
		PLANNING: "plan_to_watch",
		COMPLETED: "completed",
		DROPPED: "dropped",
		PAUSED: "on_hold",
	};

	const res = await fetch(
		`https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token.access_token}`,
				"content-type": "application/x-www-form-urlencoded",
			},
			body: querystring.stringify({
				status: malStatuses[status],
			}),
		}
	);

	if (res.status == 401) {
		await malAuth.refreshToken();
		await updateStatus(animeId, status);
	}

	const data = await res.json();

	return data;
};

const updateProgress = async (animeId, episodes, progress) => {
	const token = getToken();

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
		await updateProgress(animeId, episodes, progress);
	}

	const data = await res.json();

	return data;
};

const getToken = () => require("../../tokens/mal.json");

module.exports = {
	updateStatus,
	updateProgress,
};

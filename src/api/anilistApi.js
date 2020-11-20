const fs = require("fs");
const fetch = require("node-fetch");
const cacheFile = `${__dirname}/cache/animeList.json`;

const getRequestOptions = () => {
	const token = require("../../tokens/anilist.json");
	return {
		method: "post",
		headers: {
			Authorization: "Bearer " + token.access_token,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	};
};

const getAnimeList = async (bypassCache = false) => {
	const token = require("../../tokens/anilist.json");

	if (bypassCache && fs.existsSync(cacheFile)) {
		fs.unlinkSync(cacheFile);
	}

	if (fs.existsSync(cacheFile)) {
		return JSON.parse(fs.readFileSync(cacheFile));
	}

	const statues = [
		"CURRENT",
		"PLANNING",
		"COMPLETED",
		"DROPPED",
		"PAUSED",
		"REPEATING",
	];

	const lists = {
		CURRENT: [],
		PLANNING: [],
		COMPLETED: [],
		DROPPED: [],
		PAUSED: [],
		REPEATING: [],
	};

	for (let status of statues) {
		let currentPage = 0;
		let lastPage = null;

		while (currentPage != lastPage) {
			const query = `
			query { 
				Page (page: ${currentPage}, perPage: 50) {
					pageInfo {
						total
						currentPage
						lastPage
						hasNextPage
						perPage
				}
				
					mediaList (userName: "${token.username}", type:ANIME, status: ${status}) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
						id
						progress
						status
						media {
							id
							episodes
							title {
								english
								romaji
							}
							coverImage {
								medium
							}
							idMal
					}
				}
			}
		}`;

			const res = await fetch("https://graphql.anilist.co", {
				...getRequestOptions(),
				body: JSON.stringify({ query }),
			});
			const parsedResponse = await res.json();
			const data = parsedResponse.data;

			lists[status] = [...lists[status], ...data.Page.mediaList];

			currentPage++;
			lastPage = data.Page.pageInfo.lastPage;
		}
	}

	fs.writeFileSync(cacheFile, JSON.stringify(lists));

	return lists;
};

const updateProgress = async (mediaId, episodes, progress) => {
	const query = `
	mutation {
    SaveMediaListEntry (mediaId: ${mediaId}, progress: ${progress} ${
		episodes == progress ? ", status:COMPLETED" : ""
	}) {
        id
        progress
    }
}`;
	const res = await fetch("https://graphql.anilist.co", {
		...getRequestOptions(),
		body: JSON.stringify({ query: query }),
	});

	const parsedResponse = await res.json();
	const data = parsedResponse.data;

	if (data == null) throw new Error("No data found in anilist response!");

	return data;
};

module.exports = {
	getAnimeList,
	updateProgress,
};

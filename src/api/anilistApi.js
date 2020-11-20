const fs = require("fs");
const fetch = require("node-fetch");
const token = require("../../tokens/anilist.json");
const cacheFile = `${__dirname}/cache/animeList.json`;

const getAnimeList = async (bypassCache = false) => {
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
			const options = {
				method: "post",
				body: JSON.stringify({
					query: `
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
              }
            }
          }
        }`,
				}),
				headers: {
					Authorization: "Bearer " + token.access_token,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			};
			const res = await fetch("https://graphql.anilist.co", options);
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

module.exports = {
	getAnimeList,
};

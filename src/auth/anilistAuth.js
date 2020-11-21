const { writeFileSync } = require("fs");
const config = require(`${process.cwd()}/config/config.json`);

// client info
const clientId = config.anilist.clientId;
// const clientSecret = config.anilist.clientSecret;

const getTokenLink = () => {
	return `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
};

const saveToken = async (username, token) => {
	if (token.length < 300) {
		throw new Error(token);
	}

	writeFileSync(
		`${process.cwd()}/tokens/anilist.json`,
		JSON.stringify({
			username,
			access_token: token,
		})
	);
};

module.exports = {
	saveToken,
	getTokenLink,
};

const readline = require("readline");
const { writeFileSync } = require("fs");
const config = require(`${process.cwd()}/config/config.json`);

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// client info
const clientId = config.anilist.clientId;
// const clientSecret = config.anilist.clientSecret;

const requestToken = () => {
	return new Promise((resolve, reject) => {
		rl.question("Please enter your Anilist username:", (username) => {
			const url = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
			console.log(`\nAuthorize your application by clicking here: ${url}\n\n`);

			rl.question("Copy & paste the Token:", (token) => {
				resolve({ username, token });
			});
		});
	});
};

const generateToken = async () => {
	const { username, token } = await requestToken();

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
	generateToken,
};

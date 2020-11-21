const fetch = require("node-fetch");
const pkceChallenge = require("pkce-challenge");
const { writeFileSync } = require("fs");
const querystring = require("querystring");
const config = require("../../config/config.json");

// client info from https://myanimelist.net/apiconfig
const clientId = config.mal.clientId;
const clientSecret = config.mal.clientSecret;

// store ongoing authentication process
const currentAuthenticator = {};

// Generate a new Code Verifier / Code Challenge.
const getNewCodeVerifier = () => {
	const challenge = pkceChallenge(128);
	return challenge.code_verifier;
};

// Request new application authorization code using a url
const getAuthenticationUrl = () => {
	const codeVerifier = getNewCodeVerifier();
	const codeChallenge = codeVerifier;

	currentAuthenticator["authenticator"] = {
		codeVerifier,
		codeChallenge,
	};
	return `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&code_challenge=${codeChallenge}`;
};

/* 
Once you've authorized your application, you will be redirected to the webpage you've
specified in the API panel. The URL will contain a parameter named "code" (the Authorization
Code). You need to feed that code to the application. 
This example assumes your "App Redirect URL" is "http://localhost:3000/oauth" and display 
your authorization code there using Express.js. If you get 404 error that means your redirect 
url is different.
*/
const generateAndSaveToken = async (authorizationCode) => {
	const url = "https://myanimelist.net/v1/oauth2/token";

	const options = {
		method: "POST",
		headers: {
			"content-type": "application/x-www-form-urlencoded",
		},
		body: querystring.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code: authorizationCode,
			code_verifier: currentAuthenticator["authenticator"].codeVerifier,
			grant_type: "authorization_code",
		}),
	};

	const res = await fetch(url, options);
	const data = await res.json();

	if (!data.access_token || data.access_token.length < 300) {
		throw new Error(data);
	}

	writeFileSync(`${process.cwd()}/tokens/mal.json`, JSON.stringify(data));

	return true;
};

const refreshToken = async () => {
	const url = "https://myanimelist.net/v1/oauth2/token";
	const token = require("../../tokens/mal.json");

	const options = {
		method: "POST",
		headers: {
			"content-type": "application/x-www-form-urlencoded",
		},
		body: querystring.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code: authorizationCode,
			grant_type: "refresh_token",
			refresh_token: token.refresh_token,
		}),
	};

	const res = await fetch(url, options);
	const data = await res.json();

	if (!data.access_token || data.access_token.length < 300) {
		throw new Error(token);
	}

	writeFileSync(`${process.cwd()}/tokens/mal.json`, JSON.stringify(data));
};

module.exports = {
	getAuthenticationUrl,
	generateAndSaveToken,
	refreshToken,
};

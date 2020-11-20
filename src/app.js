const express = require("express");
const { checkAuth } = require("./auth");
const { getAnimeList } = require("./api");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
	const animeList = await getAnimeList();
	res.render(`${__dirname}/public/index`, {
		animeList: animeList,
	});
});

// route for displaying Authorization Code
app.get("/oauth", (req, res) => {
	res.send(
		`<h3>Your Authorization Code: </h3>
		<input type="text" value="${req.query.code}" style="font-size:20px; width: 80%; height: 40%"/>`
	);
});

const init = async () => {
	const success = await checkAuth();
	if (!success) throw new Error("Authentication failed!");
};

app.listen(port, init);

const express = require("express");
const bodyParser = require("body-parser");
const { checkAuth } = require("./auth");
const api = require("./api");

const app = express();
const port = 3000;

app.use(express.json());
app.set("view engine", "ejs");

app.use("/", express.static(`${__dirname}/public`));

app.get("/", async (req, res) => {
	const animeList = await api.getAnimeList();
	res.render(`${__dirname}/public/index`, {
		animeList: animeList,
	});
});

app.post("/update_progress", (req, res) => {
	api
		.updateProgress(
			req.body.mediaId,
			req.body.malId,
			req.body.episodes,
			req.body.progress
		)
		.then((data) => {
			res.json({ status: true, data: data });
		})
		.catch((e) => {
			console.log(e);
			res.json({ status: false, msg: "Error updating progress." });
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

	console.log(`Server is running at ${port}!`);
};

app.listen(port, init);

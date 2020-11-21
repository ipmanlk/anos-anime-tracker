const express = require("express");
const bodyParser = require("body-parser");
const { malAuth, anilistAuth } = require("./auth");
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

app.get("/mal_auth_link", (req, res) => {
	res.json({ status: true, data: malAuth.getAuthenticationUrl() });
});

app.get("/anilist_auth_link", (req, res) => {
	res.json({ status: true, data: anilistAuth.getTokenLink() });
});

app.post("/auth", async (req, res) => {
	try {
		await malAuth.generateAndSaveToken(req.body.mal.authenticationCode);
		await anilistAuth.saveToken(
			req.body.anilist.username,
			req.body.anilist.token
		);
		res.send({ status: true });
	} catch (e) {
		res.send({ status: false, error: e.toString() });
	}
});

app.get("/update_anime_list", (req, res) => {
	api
		.getAnimeList(true)
		.then((r) => {
			res.json({ status: true });
		})
		.catch((e) => res.json({ status: false, error: e.toString() }));
});

app.put("/update_progress", (req, res) => {
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
	// const success = await checkAuth();
	// if (!success) throw new Error("Authentication failed!");

	console.log(`Server is running at ${port}!`);
};

app.listen(port, init);

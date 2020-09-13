const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const path = require("path");
const winston = require("winston");

const PORT = process.env.PORT || 3000;

const logger = winston.createLogger({
	transports: [new winston.transports.Console()],
});

const app = express();

// Static assets.
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger.
app.use(
	morgan(":method :url :status :response-time ms", {
		stream: {
			write: (message) => logger.info(message.trim()),
		},
	})
);

// Configure templating engine.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");
nunjucks.configure(app.get("views"), {
	autoescape: true,
	express: app,
});

app.get("/", (request, response) => {
	let data = fs.readFileSync("data.json", "utf8");
	const options = JSON.parse(data);
	console.log(options);
	return response.render("home", options);
});

app.post("/", (req, res) => {
	let data = fs.readFileSync("data.json", "utf8");
	data = JSON.parse(data);
	const persRes = {
		name: req.body.name,
		response: req.body.responseField,
	};
	data.resArr.push(persRes);
	data = JSON.stringify(data);
	fs.writeFileSync("data.json", data);
	data = fs.readFileSync("data.json", "utf8");
	const options = JSON.parse(data);
	console.log(options);
	return res.render("home", options);
});

app.listen(PORT, () => {
	logger.log({ level: "info", message: `listening on ${PORT}` });
});

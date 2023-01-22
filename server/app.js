// import path from "path";
// import React from "react";
// import { createReactAppExpress } from "@cra-express/core";

// let App = require("../src/App").default;
// const clientBuildPath = path.resolve(__dirname, "../client");

// const app = createReactAppExpress({
// 	clientBuildPath,
// 	universalRender: (req, res) => <App />,
// });

// if (module.hot) {
// 	module.hot.accept("../src/App", () => {
// 		App = require("../src/App").default;
// 		console.log("✅ Server hot reloaded App");
// 	});
// }

// export default app;

import path from "path";
import fs from "fs";
import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Helmet } from "react-helmet";
import App from "../src/App";
import { Provider } from "react-redux";
import ReduxStore from "../src/Middlewares/ReduxStore/ReduxStore";
const PORT = 8080;
const app = express();

// app.use('/build', express.static('build'));
app.use(express.static("server-build"));

app.use((req, res, next) => {
	console.log(req.url, "**");
	if (/\.js|\.css|\.png|\.webp|\.woff/.test(req.path)) {
		res.redirect("./build" + req.path);
	} else {
		next();
	}
});

app.get("*", (req, res) => {
	console.log(req.url, "==");
	const renderHtml = ReactDOMServer.renderToString(
		<React.StrictMode>
			<StaticRouter context={{}} location={req.url}>
				<Provider store={ReduxStore}>
					<App />
				</Provider>
			</StaticRouter>
		</React.StrictMode>
	);
	const helmet = Helmet.renderStatic();
	fs.readFile(path.resolve("../public/index.html"), "utf8", (err, data) => {
		if (err) {
			return res.status(500).send("Error occurred. Didnt find index.html");
		}
		data = data.replace(
			"<headertags></headertags>",
			helmet.title.toString(),
			helmet.meta.toString()
		);
		data = data.replace(
			'<div id="root"></div>',
			`<div id="root">${renderHtml}</div>`
		);
		return res.send(data);
	});
});

app.listen(PORT, () => {
	console.log(`SSR running on port ${PORT}`);
});

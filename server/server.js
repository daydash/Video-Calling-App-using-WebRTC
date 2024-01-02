// Imports
const express = require("express");
const http = require("http");
const cors = require("cors");
const { startSocket } = require("./socket");
require("dotenv").config();
const app = express();

/* `const httpServer = http.createServer(app);` is creating an HTTP server using the `http` module in
Node.js. It takes the `app` object, which is an instance of Express, as an argument. This allows the
Express application to handle HTTP requests and responses. The `httpServer` object can then be used
to listen for incoming requests on a specific port. */
const httpServer = http.createServer(app);
const PORT = process.env?.PORT || 5000;

/* `app.use(cors());` is enabling Cross-Origin Resource Sharing (CORS) for the Express application.
CORS is a mechanism that allows resources (e.g., fonts, JavaScript, etc.) on a web page to be
requested from another domain outside the domain from which the resource originated. */
app.use(
	cors({
		origin: "*",
	})
);

/* `app.use(express.json());` is a middleware function that is used to parse incoming requests with
JSON payloads. It allows the Express application to handle JSON data sent in the request body. */
app.use(express.json());

/* The `startSocket(httpServer)` function is likely responsible for starting a WebSocket server using
the provided `httpServer` object. It allows for real-time, bidirectional communication between
the client and the server. */
startSocket(httpServer);

/* The code `app.get("/", (req, res) => { ... })` is defining a route handler for the root URL ("/") of
the Express application. When a GET request is made to the root URL, the callback function `(req,
res) => { ... }` will be executed. */
app.get("/", (req, res) => {
	res.send(`Server is successfully started at port: ${PORT}`);
});

/* `httpServer.listen(PORT, () => { ... });` is starting
the HTTP server and listening for incoming requests on the specified port. */
httpServer.listen(PORT, () => {
	console.log(`Server started at port: ${PORT}`);
});

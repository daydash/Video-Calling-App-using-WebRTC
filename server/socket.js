// Imports
const { Server } = require("socket.io");

/**
 * The function `startSocket` initializes a socket.io server and handles various socket events such as
 * joining a room, sending and receiving messages, initializing, checking out, disconnecting, handling
 * clicks, and handling views.
 * @param httpServer - The `httpServer` parameter is the HTTP server object that the socket.io server
 * will attach to. It is typically created using the `http` module in Node.js.
 */
const startSocket = (httpServer) => {
	try {
		const io = new Server(httpServer, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		const emailToSocketIdMap = new Map();
		const SocketIdToEmailMap = new Map();

		io.on("connection", (socket) => {
			console.log(`socket connected`, socket.id);
			socket.on("room:join", (data) => {
				const { email, room } = data;
				emailToSocketIdMap.set(email, socket.id);
				SocketIdToEmailMap.set(socket.id, email);
				io.to(room).emit("user:joined", { email, id: socket.id });
				socket.join(room);
				io.to(socket.id).emit("room:join", data);
			});

			socket.on("user:call", ({ to, offer }) => {
				io.to(to).emit("incomming:call", { from: socket.id, offer });
			});

			socket.on("call:accepted", ({ to, ans }) => {
				io.to(to).emit("call:accepted:second", { from: socket.id, ans });
			});

			socket.on("peer:nego:needed", ({ to, offer }) => {
				io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
			});

			socket.on("peer:nego:done", ({ to, ans }) => {
				io.to(to).emit("peer:nego:final", { from: socket.id, ans });
			});
		});
	} catch (error) {
		console.log(error);
	}
};

// Exports
module.exports = { startSocket };

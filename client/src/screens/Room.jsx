import React, { useState, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";

const RoomPage = () => {
	const socket = useSocket();
	const [remoteSocketId, setRemoteSocketId] = useState(null);
	const [myStream, setMyStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);

	const handleUserJoined = useCallback(({ email, id }) => {
		console.log(`Email: ${email}, ID: ${id}`);
		setRemoteSocketId(id);
	}, []);

	const handleCallUser = useCallback(async () => {
		// const stream = await navigator.mediaDevices.getDisplayMedia(); // set to display media!
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true,
		});

		const offer = await peer.getOffer();
		socket.emit("user:call", { to: remoteSocketId, offer });
		setMyStream(stream);
	}, [remoteSocketId, socket]);

	const handleIncommingCall = useCallback(
		async ({ from, offer }) => {
			setRemoteSocketId(from);

			// const stream = await navigator.mediaDevices.getDisplayMedia(); // set to display media!
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: true,
			});

			setMyStream(stream);
			console.log(`Incoming Call`, from, offer);

			const ans = await peer.getAnswer(offer);
			socket.emit("call:accepted", { to: from, ans });
		},
		[socket]
	);

	const sendStreams = useCallback(() => {
		for (const track of myStream.getTracks()) {
			peer.peer.addTrack(track, myStream);
		}
	}, [myStream]);

	const handleCallAcceptedSecond = useCallback(
		({ from, ans }) => {
			peer.setLocalDescription(ans);
			console.log(`Called Accepted`);
			sendStreams();
		},
		[sendStreams]
	);

	const handleNegoNeeded = useCallback(
		async (e) => {
			const offer = await peer.getOffer();
			socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
		},
		[socket, remoteSocketId]
	);

	const handleNegoNeedIncomming = useCallback(
		async ({ from, offer }) => {
			const ans = await peer.getAnswer(offer);
			socket.emit("peer:nego:done", { to: from, ans });
		},
		[socket]
	);

	const handleNegoNeedFinal = useCallback(async ({ ans }) => {
		await peer.setLocalDescription(ans);
	}, []);

	useEffect(() => {
		peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
		return () => {
			peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
		};
	}, [handleNegoNeeded]);

	useEffect(() => {
		peer.peer.addEventListener("track", async (e) => {
			const remoteStream = e.streams;
			console.log("---------- GOT TRACKS -----------");
			setRemoteStream(remoteStream[0]);
		});
		// return () => {
		// 	peer.peer.removeEventListener("track", async (e) => {
		// 		const remoteStream = e.streams;
		// 		setRemoteStream(remoteStream);
		// 	});
		// };
	}, []);

	useEffect(() => {
		socket.on("user:joined", handleUserJoined);
		socket.on("incomming:call", handleIncommingCall);
		socket.on("call:accepted:second", handleCallAcceptedSecond);
		socket.on("peer:nego:needed", handleNegoNeedIncomming);
		socket.on("peer:nego:final", handleNegoNeedFinal);

		return () => {
			socket.off("user:joined", handleUserJoined);
			socket.off("incomming:call", handleIncommingCall);
			socket.off("call:accepted:second", handleCallAcceptedSecond);
			socket.off("peer:nego:needed", handleNegoNeedIncomming);
			socket.off("peer:nego:final", handleNegoNeedFinal);
		};
	}, [
		socket,
		handleUserJoined,
		handleIncommingCall,
		handleCallAcceptedSecond,
		handleNegoNeedIncomming,
		handleNegoNeedFinal,
	]);

	return (
		<div>
			<h1>Room Page</h1>
			<h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
			{myStream && <button onClick={sendStreams}>Send Stream</button>}
			{remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
			<div style={{ display: "flex" }}>
				{myStream && (
					<>
						<h1>My Stream</h1>
						<ReactPlayer
							playing
							muted
							height="300px"
							width="1000px"
							url={myStream}
						/>
					</>
				)}
				{remoteStream && (
					<>
						<h1>Remote Stream</h1>
						<ReactPlayer
							playing
							muted
							height="300px"
							width="1000px"
							url={remoteStream}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default RoomPage;

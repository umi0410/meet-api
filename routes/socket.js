const Message = require("../models/Message");
const User = require("../models/User");
const request = require("request");
const FCM = require("fcm-node");
const debug = require("debug")("meet-api:socket");
const serverKey = require("../fcmPrivateKey.json"); //put the generated private key path here

let fcm = new FCM(serverKey);

function filterSocketNames(property, value) {
	try {
		let socketNames = Object.keys(io.sockets.sockets);
		let filteredSocketNames = socketNames.filter(socketName => {
			if (io.sockets.sockets[socketName]["store"][property] == value) {
				return true;
			}
		});
		return filteredSocketNames;
	} catch (e) {
		console.error(e);
	}
}

function emitToSocketBySocketNames(socketNames, eventName, data) {
	try {
		if (socketNames.length > 0) {
			for (let name of socketNames) {
				console.log(io.sockets.sockets[name]["store"]);
				io.sockets.sockets[name].emit(eventName, data);
			}
		} else {
			console.log("socket 없음.");
		}
	} catch (e) {
		console.error(e);
	}
}

io = require("socket.io")();
io.use(function auth(socket, next) {
	// console.log(socket.handshake.query);
	if (!socket["store"]) {
		socket["store"] = {};
	}
	socket["store"]._id = socket.handshake.query.id;
	next();
});
io.on("connection", function(socket) {
	debug("a user connected");

	socket.on("disconnect", function() {
		debug("user disconnected");
	});

	socket.on("sendMessage", async function(data) {
		debug("sentMessage");
		//chatRoom이 곧 match임
		let message = new Message({
			match: data.chatRoom._id,
			sender: data.sender._id,
			data: data.message
		});
		await message.save();
		message = await message.populate("sender").execPopulate();
		socket.emit("sentMessage", message);
		debug("Sent");
		debug(message);
		let socketNames = filterSocketNames("_id", data.recipient._id);
		//연결된 소켓이 없으면 push
		if (socketNames.length == 0) {
			let user = await User.findById(data.recipient._id);
			debug(user.nickname + "에게 푸시알림 시도");
			debug("pushToken", user.pushToken);
			// console.log(message.data);
			// console.log(process.env.FIREBASE_URL);
			let m = {
				//this may vary according to the message type (single recipient, multicast, topic, et cetera)
				to: user.pushToken,
				// collapse_key: "your_collapse_key",
				notification: {
					title: message.sender.nickname + "  sent a message",
					body: message.data,
					image: "https://img.icons8.com/cotton/2x/like.png",
					icon: "https://img.icons8.com/cotton/2x/like.png",
					imageUrl: "https://img.icons8.com/cotton/2x/like.png"
				}
				// data: {
				//     //you can send only notification or only data(or include both)
				//     my_key: "my value",
				//     my_another_key: "my another value"
				// }
			};

			fcm.send(m, function(err, response) {
				if (err) {
					console.error(err);
					console.log("Something has gone wrong!");
				} else {
					console.log("Successfully sent with response: ", response);
				}
			});

			// request.post(
			// 	{
			// 		url: process.env.FIREBASE_URL,
			// 		body: JSON.stringify({
			// 			to: user.pushToken,
			// 			notification: {
			// 				title: "진솔한 메시지 도착",
			// 				body: message.data
			// 			}
			// 		}),
			// 		headers: {
			// 			"Content-Type": "application/json",
			// 			Authorization:
			// 				"key=" + process.env.FIREBASE_AUTHORIZATION
			// 		}
			// 	},
			// 	(err, res, body) => {
			// 		if (err) console.error(err);
			// 		console.log(body);
			// 	}
			// );
		}
		emitToSocketBySocketNames(socketNames, "receiveMessage", message);
	});
});

module.exports = io;

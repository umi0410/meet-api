const path = require("path");
if (process.env.MEET_NODE_ENV === "production") {
	require("dotenv").config({ path: path.join(__dirname, ".env.production") });
} else {
	require("dotenv").config();
}
const createError = require("http-errors");
const express = require("express");

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const meetingsRouter = require("./routes/meetings");
const matchesRouter = require("./routes/matches");
const chatRouter = require("./routes/messages");
const questionsRouter = require("./routes/questions");
const tagsRouter = require("./routes/tags");
const universitiesRouter = require("./routes/universities");
// const webPushRouter = require("./routes/webPush");
const pushesRouter = require("./routes/pushes");
const PushSubscription = require("./models/PushSubscription");
const Message = require("./models/Message");
const User = require("./models/User");
const { createPushNotification } = require("./middlewares/push");
const request = require("request");
console.log(process.env.MONGO_HOST);

const app = express();
const cors = require("cors");

app.use(cors());
var db = mongoose.connection;
db.on("error", console.error);
db.once("open", function() {
	// CONNECTED TO MONGODB SERVER
	console.log("Connected to mongod server");
});

mongoose.connect(process.env.MONGO_HOST);

// view engine setup
app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");
app.set("view engine", "ejs");
app.set("jwt-secret", process.env.JWT_SECRET);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// web-push 작업

app.post("/debugger", (req, res) => {
	console.log(req.body);
	res.json({ status: "ok" });
});
/*** Socket.IO 추가 ***/

function filterSocketNames(property, value) {
	try {
		let socketNames = Object.keys(app.io.sockets.sockets);
		let filteredSocketNames = socketNames.filter(socketName => {
			if (
				app.io.sockets.sockets[socketName]["store"][property] == value
			) {
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
				console.log(app.io.sockets.sockets[name]["store"]);
				app.io.sockets.sockets[name].emit(eventName, data);
			}
		} else {
			console.log("socket 없음.");
		}
	} catch (e) {
		console.error(e);
	}
}

app.io = require("socket.io")();
app.io.use(function auth(socket, next) {
	// console.log(socket.handshake.query);
	if (!socket["store"]) {
		socket["store"] = {};
	}
	socket["store"]._id = socket.handshake.query.id;
	next();
});
app.io.on("connection", function(socket) {
	console.log("a user connected");

	socket.on("disconnect", function() {
		console.log("user disconnected");
	});

	socket.on("sendMessage", async function(data) {
		console.log("sentMessage");
		//chatRoom이 곧 match임
		let message = new Message({
			match: data.chatRoom._id,
			sender: data.sender._id,
			data: data.message
		});
		await message.save();
		message = await message.populate("sender").execPopulate();
		socket.emit("sentMessage", message);
		let socketNames = filterSocketNames("_id", data.recipient._id);
		//연결된 소켓이 없으면 push
		if (socketNames.length == 0) {
			let user = await User.findById(data.recipient._id);
			console.log(user.nickname + "에게 푸시알림 시도");
			console.log("pushToken", user.pushToken);
			console.log(process.env.FIREBASE_URL);
			request.post(
				{
					url: process.env.FIREBASE_URL,
					body: JSON.stringify({
						to: user.pushToken,
						notification: {
							title: "진솔한 메시지 도착",
							body: message.data
						}
					}),
					headers: {
						"Content-Type": "application/json",
						Authorization:
							"key=" + process.env.FIREBASE_AUTHORIZATION
					}
				},
				(err, res, body) => {
					if (err) console.error(err);
					console.log(body);
				}
			);
		}
		emitToSocketBySocketNames(socketNames, "receiveMessage", message);
	});
});

// setInterval(() => {
// 	let socketNames = filterSocketNames("id", "5e3248cd23cc972ec573e74a");
// 	emitToSocketBySocketNames(socketNames, "test", { status: "Good" });
// }, 1000);
app.use("/", indexRouter);
app.use("/users", usersRouter);
const authenticationMiddleware = require("./middlewares/authentication");
// router.use();
app.use("/meetings", meetingsRouter);
app.use("/matches", matchesRouter);
app.use("/chats", chatRouter);
app.use("/questions", questionsRouter);
app.use("/tags", tagsRouter);
app.use("/universities", universitiesRouter);
app.use("/pushes", pushesRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error.ejs", { err });
});

module.exports = app;

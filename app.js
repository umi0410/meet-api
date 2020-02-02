const createError = require("http-errors");
const express = require("express");
const path = require("path");
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

if (process.env.MEET_NODE_ENV === "production") {
	require("dotenv").config({ path: path.join(__dirname, ".env.production") });
} else {
	require("dotenv").config();
}
console.log(process.env.MONGO_HOST);

const webpush = require("web-push");
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
webpush.setVapidDetails(
	process.env.WEB_PUSH_CONTACT,
	process.env.PUBLIC_VAPID_KEY,
	process.env.PRIVATE_VAPID_KEY
);
let globalSubscriptions = [];
app.post("/notifications/subscribe", (req, res) => {
	const subscription = req.body;
	globalSubscriptions.push(subscription);
	console.log(subscription);

	const payload = JSON.stringify({
		title: "Hello!",
		body: "It works."
	});

	webpush
		.sendNotification(subscription, payload)
		.then(result => console.log(result))
		.catch(e => console.log(e.stack));
	res.status(200).json({ success: true });
});
app.get("/notification/send", (req, res) => {
	const payload = JSON.stringify({
		title: "Hello!",
		body: "It works."
	});
	for (let subscription of globalSubscriptions) {
		console.log(subscription.data.email);
		webpush
			.sendNotification(subscription, payload)
			.then(result => null)
			.catch(e => console.log(e.stack));
	}

	res.status(200).json({ success: true });
});
app.post("/debugger", (req, res) => {
	console.log(req.body);
	res.json({ status: "ok" });
});
const Message = require("./models/Message");
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

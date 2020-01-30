require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const meetingsRouter = require("./routes/meetings");
const matchsRouter = require("./routes/matches");
const chatRouter = require("./routes/chats");
const app = express();
const cors = require("cors");
app.use(cors());
var db = mongoose.connection;
db.on("error", console.error);
db.once("open", function() {
	// CONNECTED TO MONGODB SERVER
	console.log("Connected to mongod server");
});
mongoose.connect("mongodb://localhost/meet");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.set("jwt-secret", process.env.JWT_SECRET);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

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
		}
	} catch (e) {
		console.error(e);
	}
}

app.io = require("socket.io")();
app.io.use(function auth(socket, next) {
	console.log(socket.handshake.query);
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

	socket.on("sendMessage", function(data) {
		socket.emit("sentMessage", data);
		let socketNames = filterSocketNames("_id", data.recipient._id);
		emitToSocketBySocketNames(socketNames, "receiveMessage", data);
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
app.use("/matches", matchsRouter);
app.use("/chats", chatRouter);
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
	res.render("error");
});

module.exports = app;

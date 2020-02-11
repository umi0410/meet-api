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
const pushesRouter = require("./routes/pushes");
const debuggerRouter = require("./routes/debugger");
const Message = require("./models/Message");
const User = require("./models/User");
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

/*** Socket.IO 추가 ***/

app.io = require("./routes/socket");
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
app.use("/debugger", debuggerRouter);
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

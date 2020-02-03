const jwt = require("jsonwebtoken");
const Match = require("../models/Match");
const User = require("../models/User");
async function isUserReadable(req, res, next) {
	//res.locals.auth 에 user 정보가 있다고 가정.
	let requestUser = await User.findById(res.locals.auth._id);
	if (!requestUser)
		return res.status(401).json({ message: "Unauthenticated user" });

	let userId = req.params.userId;
	let user = await User.findById(userId);
	if (!user)
		return res.status(403).json({ message: "Failed to read the user" });
	let match = await Match.findOne({
		participants: { $all: [requestUser, user] }
	});
	if (!match)
		return res
			.status(401)
			.json({ message: "Unauthorized for reading user data" });
	res.locals.match = match;
	res.locals.user = user;
	next();
}

async function isMatchDeletable(req, res, next) {
	//res.locals.auth 에 user 정보가 있다고 가정.
	let requestUser = await User.findById(res.locals.auth._id);
	if (!requestUser)
		return res.status(401).json({ message: "Unauthenticated user" });
	let match = await Match.findOne({
		participants: requestUser
	});
	if (!match)
		return res
			.status(401)
			.json({ message: "Unauthorized for reading user data" });
	res.locals.match = match;
	res.locals.user = requestUser;
	next();
}

module.exports = {
	isUserReadable,
	isMatchDeletable
};

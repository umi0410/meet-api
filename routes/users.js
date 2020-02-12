const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
let router = express.Router();
const User = require("../models/User");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
/* GET users listing. */
//Authentication, Authorization 추가되어야함
router.get(
	"/:userId",
	authentication.authenticate,
	authorization.isUserReadable,
	async function(req, res) {
		let user = res.locals.user;
		// await delete user.nickname;
		// user.nickname = undefined;
		user.likePartners = undefined;
		user.excludeCandidates = undefined;
		user.password = undefined;
		return res.json({ user: user, status: "success" });
		// setTimeout(() => {

		// }, 5000);
	}
);

router.post("/register", function(req, res) {
	let user = new User({
		email: req.body.email,
		nickname: req.body.nickname,
		password: req.body.password,
		emailKey: crypto
			.createHash("sha512")
			.update(req.body.email + req.app.get("jwt-secret"))
			.digest("hex")
	});

	user.save();
	console.log(req.body);
	res.json({ result: "success" });
});
router.post("/login", async function(req, res) {
	let user = await User.findOneAndUpdate(
		{
			email: req.body.email,
			password: req.body.password
		},
		{ loggedin: Date.now() }
	);
	console.log(req.body);
	if (!user) {
		res.status(403).send("No user found" + JSON.stringify(req.body));
	} else {
		const payload = {
			email: user.email,
			nickname: user.nickname,
			isEmailVerified: user.isEmailVerified,
			_id: user._id
		};
		const token = jwt.sign(payload, req.app.get("jwt-secret"));
		console.log(token);
		res.send({ token });
	}
});

router.put("/:userId", authentication.authenticate, async (req, res) => {
	if (req.params.userId != res.locals.auth._id) {
		debug("user 정보 변경에서 auth 오류");
		debug(req.params.userId);
		debug(res.locals.auth._id);
		return res
			.status(403)
			.send({ message: "user 정보 변경에서 auth 오류" });
	}
	let likes = [],
		hates = [],
		questions = [];
	for (let tag of req.body.tags) {
		if (tag.status == 1) {
			likes.push(tag.tag);
		} else if (tag.status == 2) {
			hates.push(tag.tag);
		}
	}
	for (let question of req.body.questions) {
		if (question.answer != "") {
			questions.push({ title: question.title, answer: question.answer });
		}
	}
	let user = await User.findByIdAndUpdate(res.locals.auth._id, {
		profileMessage: req.body.profileMessage,
		likes,
		hates,
		questions
	});
	if (!user) res.status(404).json({ message: "no user found" });
	console.log(req.body);
	return res.json({ user });
});

module.exports = router;

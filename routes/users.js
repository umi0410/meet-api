const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();
let User = require("../models/User");
let authentication = require("../middlewares/authentication");
/* GET users listing. */
//Authentication, Authorization 추가되어야함
router.get("/:userId", async function(req, res) {
	let user = await User.findById(req.params.userId).select("-password");
	if (!user) return res.status(403).json({ message: "no such user" });
	console.log(user);
	return res.json(user);
});
router.post("/register", function(req, res) {
	let user = new User({
		email: req.body.email,
		nickname: req.body.nickname,
		password: req.body.password
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

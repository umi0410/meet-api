const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();
let User = require("../models/User");
/* GET users listing. */
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

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();

const authenticationMiddleware = require("../middlewares/authentication");
router.use(authenticationMiddleware.authenticate);
let User = require("../models/User");
let Match = require("../models/Match");
let Message = require("../models/Message");
/* GET meeting information */
router.get("/", async function(req, res) {
	//요청자의 id를 포함한 모든 매치를 전달하기.
	let matches = await Match.find({
		participants: res.locals.auth._id
	}).populate("participants", "nickname profileMessage univeristy id");

	return res.json(matches);
});
router.get("/:matchId", async function(req, res) {
	let match = await Match.findById(req.params.matchId);
	let messages = await Message.find({
		match: match
	}).populate("sender", "nickname id");
	console.log(messages);
	return res.json({ match, messages });
});

module.exports = router;

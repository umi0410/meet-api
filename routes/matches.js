const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();

const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
router.use(authentication.authenticate);
let User = require("../models/User");
let Match = require("../models/Match");
let Message = require("../models/Message");
/* GET meeting information */
router.get("/", async function(req, res) {
	//요청자의 id를 포함한 모든 매치를 전달하기.
	let matches = await Match.find({
		participants: res.locals.auth._id
	}).populate("participants", "nickname profileMessage univeristy id");
	let resultMatches = [];
	for (let _m of matches) {
		let match = _m.toObject();
		let lastMessage = await Message.findOne({ match: _m._id }).sort({
			_id: -1
		});
		match.lastMessage = lastMessage;
		resultMatches.push(match);
	}
	// console.log(matches);
	return res.json(resultMatches);
});
router.get("/:matchId", async function(req, res) {
	if (req.query.after) {
		let after = await Message.find({ _id: { $lt: req.query.after } });
		return res.json(after);
	}
	let limit = req.query.limit ? req.query.limit : 6;
	let match = await Match.findById(req.params.matchId);
	let messages = await Message.find({
		match: match
	})
		.sort({ _id: -1 })
		.limit(limit)
		.populate("sender", "nickname id");
	messages = messages.reverse();
	return res.json({ match, messages });
});

router.delete(
	"/:matchId",
	authentication.authenticate,
	authorization.isMatchDeletable,
	async function(req, res) {
		let match = res.locals.match;
		await match.delete();
		return res.json(match);
	}
);

module.exports = router;

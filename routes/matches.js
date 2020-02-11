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

	return res.json(matches);
});
router.get("/:matchId", async function(req, res) {
	let page = req.query.page ? req.query.page : 0;
	let limit = req.query.limit ? req.query.limit : 6;
	let match = await Match.findById(req.params.matchId);
	let messages = await Message.find(
		{
			match: match
		},
		{},
		{ skip: page, limit }
	).populate("sender", "nickname id");
	// console.log(messages);
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

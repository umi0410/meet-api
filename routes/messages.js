const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();
let Message = require("../models/Message");
let User = require("../models/User");
/* GET users listing. */
router.get("/", async function(req, res) {
	if (!req.query.match) {
		return res.status(404).send("Please input match");
	}
	const LIMIT = 6;
	let limit = req.query.limit ? req.query.limit : LIMIT;
	//끝에서부터 세므로 뒤에서부터 세고, 리버스
	if (req.query.after) {
		let messages = await Message.find({
			_id: { $lt: req.query.after },
			match: req.query.match
		})
			.sort({ _id: -1 })
			.limit(limit)
			.populate("sender", "nickname id");
		console.log(messages);
		messages = messages.reverse();
		return res.json({ messages });
	} else {
	}

	let messages = await Message.find({ match: req.query.match })
		.sort({ _id: -1 })
		.limit(limit)
		.populate("sender", "nickname id");
	messages = messages.reverse();
	return res.json({ messages });
});
module.exports = router;

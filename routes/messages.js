const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();
let Message = require("../models/Message");
let User = require("../models/User");
/* GET users listing. */
router.get("/", async function(req, res) {
	let page = req.query.page ? req.query.page : 0;
	let limit = req.query.limit ? req.query.limit : 3;
	//끝에서부터 세므로 뒤에서부터 세고, 리버스
	if (req.query.after) {
		let messages = await Message.find({ _id: { $lt: req.query.after } })
			.sort({ _id: -1 })
			.limit(limit)
			.populate("sender", "nickname id");
		messages = messages.reverse();
		return res.json(messages);
	} else {
	}

	let messages = await Message.find({})
		.sort({ _id: -1 })
		.limit(limit)
		.populate("sender", "nickname id");
	messages = messages.reverse();
	return res.json({ messages });
});
module.exports = router;

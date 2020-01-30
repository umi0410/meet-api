const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();

const authenticationMiddleware = require("../middlewares/authentication");
router.use(authenticationMiddleware.authenticate);
let User = require("../models/User");
let Match = require("../models/Match");
/* GET meeting information */
router.get("/", async function(req, res) {
	//요청자의 id를 포함한 모든 매치를 전달하기.
	let matches = await Match.find({
		participants: res.locals.auth.id
	}).populate("participants", "nickname profileMessage univeristy id");

	return res.json(matches);
});

module.exports = router;

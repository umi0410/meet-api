const express = require("express");
let router = express.Router();
const Question = require("../models/Question");
/* GET meeting information */
router.get("/", async function(req, res) {
	//요청자의 id를 포함한 모든 매치를 전달하기.
	const questions = Question.questions;
	return res.json(questions);
});
module.exports = router;

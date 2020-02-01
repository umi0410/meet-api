const express = require("express");
let router = express.Router();
const Tag = require("../models/Tag");
/* GET meeting information */
router.get("/", async function(req, res) {
	//요청자의 id를 포함한 모든 매치를 전달하기.
	const tags = Tag.tags;
	return res.json(tags);
});
module.exports = router;

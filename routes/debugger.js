const express = require("express");
let router = express.Router();
const User = require("../models/User");
router.get("/", (req, res) => {
	console.log("Accessed debugger");
	console.log(User.MINIMUM_TAGS);
	return res.status(200).send("ok");
});
router.post("/onscreen", (req, res) => {
	console.log(req.body);
	res.json({ status: "ok" });
});

router.post("/offscreen", (req, res) => {
	console.log(req.body);
	res.json({ status: "ok" });
});
router.post("/errors", (req, res) => {
	console.log(req.body);
	res.json({ status: "ok" });
});

module.exports = router;

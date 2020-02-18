const express = require("express");
let router = express.Router();
const User = require("../models/User");
const debug = require("debug")("meet-api:dev");
router.get("/", (req, res) => {
	debug("Access to debugger");
	// console.log("Accessed debugger");
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

const express = require("express");
let router = express.Router();

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

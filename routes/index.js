var express = require("express");
var router = express.Router();
const debug = require("debug")("meet-api:dev");
const logger = require("../logger");

/* GET home page. */
router.get("/", function(req, res, next) {
	logger.debug("logger");
	debug("debug");
	res.render("index.ejs", { title: "Jinsol - API server" });
});

module.exports = router;

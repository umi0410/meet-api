const express = require("express");
let router = express.Router();
const University = require("../models/University");
/* GET meeting information */
router.get("/", async function(req, res) {
	const universities = University.universities;
	return res.json(universities);
});
module.exports = router;

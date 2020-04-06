const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
let router = express.Router();
const User = require("../models/User");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const debug = require("debug")("meet-api:validations");
const { createHash } = require("../middlewares/hashEncrypt");
const logger = require("../logger");
//unique
//email
router.get("/email", async (req, res) => {
    if (req.query["type"]) {
        if (req.query["type"] == "unique" && req.query.email) {
            debug("req.query.email")
            debug(req.query.email)

            let user = await User.findOne({ email: req.query.email })
            if (!user) {
                return res.json({ result: true })
            }
            else {
                return res.json({ result: false })
            }
        }
    }
    else {
        return res.send("please input valid queries")
    }
})

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let router = express.Router();
let User = require("../models/User");
/* GET users listing. */
let app = require("../app");
console.log(app.io);

module.exports = router;

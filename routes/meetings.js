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
	let { excludeCandidates } = await User.findById(res.locals.auth._id);

	let candidates = await User.find({
		_id: {
			$nin: [...excludeCandidates, res.locals.auth._id]
		}
	}).select("id");
	let randomIndex = Math.floor(Math.random() * candidates.length);
	let meetingInformation = await User.findOne({
		_id: {
			$nin: [...excludeCandidates, res.locals.auth._id]
		}
	})
		.skip(randomIndex)
		.select("id university nickname likes hates profileMessage questions");
	console.log(meetingInformation);
	return res.json(meetingInformation);
});
router.post("/", async function(req, res) {
	// console.log(req.query);
	if (!["like", "hate"].includes(req.query.action)) {
		return res.status(403).json({ message: "No action defined" });
	}
	// console.log(req.headers["x-access-token"]);
	if (!req.headers["x-access-token"]) {
		return res.status(403).json({ message: "no token included" });
	}
	console.log(req.query);
	let partner = await User.findById(req.query.id);
	if (!partner) {
		res.status(403).json({
			message: "No partner found" + JSON.stringify(req.body)
		});
	} else {
		let user = await User.findById(res.locals.auth._id);
		console.log(user);
		console.log("상대방이 좋아한 사람");
		console.log(partner.likePartners);
		if (!user.likePartners.includes(partner._id)) {
			//동시성에 대한 논란이....
			console.log("추가함");
			user.likePartners.push(partner.id);
		}
		if (partner.likePartners.includes(res.locals.auth._id)) {
			console.log("매치 성공");
			let match = await new Match({
				participants: [partner._id, res.locals.auth._id]
			});
			match = await match
				.populate(
					"participants",
					"nickname profileMessage univeristy id"
				)
				.execPopulate();
			//왜 await 만 쓰면 안 되는 거니..?
			console.log(match);
			await match.save();
			return res.json({ message: "new match created", match });
		}
		await user.save();
		return res.send({ ok: "ok" });
	}
});

module.exports = router;

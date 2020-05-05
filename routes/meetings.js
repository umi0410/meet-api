const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const debug = require("debug")("meet-api:meeting");
const logger = require("../logger");
// const debug = require("debug")("meet-a")
let router = express.Router();

const authenticationMiddleware = require("../middlewares/authentication");
router.use(authenticationMiddleware.authenticate);
let User = require("../models/User");
let Match = require("../models/Match");
/* GET meeting information */
router.get("/", async function (req, res) {
	let result = {};
	let { id, sex, excludeCandidates } = await User.findById(res.locals.auth._id);
	let matchedPartners = []
	let matches = await Match.find({
		participants:
		{
			$in: id
		}
	})
	for (let m of matches) {
		let u1 = await User.findById(m.participants[0]._id)
		let u2 = await User.findById(m.participants[1]._id)
		if (String(u1._id) != id) matchedPartners.push(String(u1._id))
		if (String(u2._id) != id) matchedPartners.push(String(u2._id))
	}
	// console.log(matches.length)
	// console.log(matchedPartners)
	//개수세고, 비었는지, 랜덤인덱스의 최댓값은 몇일지 판별
	let candidates = await User.find({
		_id: {
			$nin: [...excludeCandidates, res.locals.auth._id, ...matchedPartners]
		}, sex: {
			$ne: sex
		}
	}).select("id nickname");
	console.log(candidates)
	if (candidates.length == 0) {
		debug(res.locals.auth);
		logger.info(res.locals.auth.email + "의 매치후보가 없음.");
		result.status = "noCandidate";
		return res.json(result);
	}
	let randomIndex = Math.floor(Math.random() * candidates.length);
	let partner = await User.findOne({
		_id: {
			$nin: [...excludeCandidates, res.locals.auth._id]
		}, sex: {
			$ne: sex
		}
	})
		.skip(randomIndex)
		.select("id university nickname likes hates profileMessage questions heightType sex");

	if (partner) {
		result.status = "success";
		result.partner = partner;
	} else {
		logger.info(partner);
		result.status = "failed";
	}
	return res.json(result);
});
router.post("/", async function (req, res) {
	// debug(req.query);
	if (!["like", "hate"].includes(req.query.action)) {
		return res.status(403).json({ message: "No action defined" });
	}
	// debug(req.headers["x-access-token"]);
	if (!req.headers["x-access-token"]) {
		return res.status(403).json({ message: "no token included" });
	}
	let partner = await User.findById(req.query.id);
	if (!partner) {
		res.status(403).json({
			message: "No partner found" + JSON.stringify(req.body)
		});
	} else {
		let user = await User.findById(res.locals.auth._id);
		debug(user);
		debug("상대방이 좋아한 사람");
		debug(partner.likePartners);
		if (!user.likePartners.includes(partner._id)) {
			//동시성에 대한 논란이....
			debug("추가함");
			user.likePartners.push(partner.id);
		}
		if (partner.likePartners.includes(res.locals.auth._id)) {
			debug("매치 성공");
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
			debug(match);
			await match.save();
			debug("내 id" + res.locals.auth._id);
			partner.likePartners = partner.likePartners.filter(likeUser => {
				//likeUser는 partner가 like한 유저
				//나는 partner의 likeUsers에서 빼고 match로 넘어감.
				debug("내 id" + likeUser._id);
				if (likeUser._id != res.locals.auth._id) {
					return true;
				} else return false;
			});
			await partner.save();
			return res.json({ message: "new match created", match });
		}
		await user.save();
		return res.send({ ok: "ok" });
	}
});

module.exports = router;

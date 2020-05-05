const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
let router = express.Router();
const User = require("../models/User");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const debug = require("debug")("meet-api:users");
const { createHash } = require("../middlewares/hashEncrypt");
const logger = require("../logger");
const fs = require("fs")
router.get("/test", (req, res) => { res.send("HOOD") })
router.get(
	"/:userId",
	authentication.authenticate,
	authorization.isUserReadable,
	async function (req, res) {
		// let user = res.locals.user;
		let user = await User.findById(req.params.userId)
		user.likePartners = undefined;
		user.excludeCandidates = undefined;
		user.password = undefined;
		return res.json({ user: user, status: "success" });
	}
);

//굳이 register라는 url을 줄 필요는 없었을 것 같은데..
router.post("/register", async function (req, res) {
	debug("req.body")
	debug(req.body)
	let user = new User({
		email: req.body.email,
		nickname: req.body.nickname,
		password: createHash(req.body.passwordConfirm),
		university: req.body.university.universityName,
		campus: req.body.campus,
		heightType: req.body.heightType,
		sex: req.body.sex,
		birthYear: Number(req.body.birthYear),
		profileMessage: req.body.profileMessage,
		emailKey: createHash(req.body.email + String(Date.now()))
	});
	debug(req.body.profileImage)
	fs.writeFileSync("test.png", req.body.profileImage)
	await user.save();
	let token = await authentication.publishToken(
		user,
		req.app.get("jwt-secret")
	);
	debug("account token")
	debug(token);
	res.json({ token });
});
router.post("/login", async function (req, res) {
	// token 로그인은 token verify 후 _id로 로그인,
	// default 로그인은 이메일, 패스워드로 로그인
	let mode = req.body.mode == "token" ? "token" : "default";
	let user;
	if (mode == "token") {
		let decodedToken = await authentication.decodeJWT(
			req.headers["x-access-token"],
			req.app.get("jwt-secret")
		);
		user = await User.findByIdAndUpdate(decodedToken._id, {
			loggedin: Date.now()
		});
	} else {
		user = await User.findOneAndUpdate(
			{
				email: req.body.email,
				password: createHash(req.body.password)
			},
			{ loggedin: Date.now() }
		);
	}
	if (!user) {
		logger.info("[LOGIN] failed", req.body.email, req.body.password);
		res.status(403).send("No user found" + JSON.stringify(req.body));
	} else {
		logger.info("[LOGIN] success", mode, user.email);
		const token = await authentication.publishToken(
			user,
			req.app.get("jwt-secret")
		);
		return res.send({ token, user });
	}
});

function isTagQualified(user) {
	if (user.likes.length + user.hates.length >= User.MINIMUM_TAGS) {
		return true;
	}
	return false;
}
function isQuestionQualified(user) {
	if (user.questions.length >= User.MINIMUM_QUESTIONS) {
		return true;
	}
	return false;
}

//유저의 소개팅 정보에 대한 수정이나 개인정보 수정은 이 라우터에서 처리
router.put("/:userId", authentication.authenticate, async (req, res) => {
	if (req.params.userId != res.locals.auth._id) {
		debug("user 정보 변경에서 auth 오류");
		debug(req.params.userId);
		debug(res.locals.auth._id);
		return res
			.status(403)
			.send({ message: "user 정보 변경에서 auth 오류" });
	}
	const TAG_STATUS_LIKE = 1,
		TAG_STATUS_HATE = 2;
	let likes = [],
		hates = [],
		questions = [];
	for (let tag of req.body.tags) {
		if (tag.status == TAG_STATUS_LIKE) {
			likes.push(tag.tag);
		} else if (tag.status == TAG_STATUS_HATE) {
			hates.push(tag.tag);
		}
	}
	for (let question of req.body.questions) {
		if (question.answer != "") {
			questions.push({ title: question.title, answer: question.answer });
		}
	}

	let user = await User.findByIdAndUpdate(
		res.locals.auth._id,
		{
			profileMessage: req.body.profileMessage,
			likes,
			hates,
			questions
		},
		{ new: true }
	);
	//new 를 해줘야만 아래에서 업데이트한 내용을 이용할 수 있다.
	if (!user) res.status(404).json({ message: "no user found" });
	//비효율적이긴하지만 이게 더 알아보기는 쉬울 듯..
	//한 번 더 쿼리해서 이번엔 meetingStatus를 업데이트
	console.log(
		user.isEmailVerified,
		isTagQualified(user),
		isQuestionQualified(user)
	);
	user = await User.findByIdAndUpdate(res.locals.auth._id, {
		meetingStatus:
			user.isEmailVerified &&
				isTagQualified(user) &&
				isQuestionQualified(user)
				? "WAITING"
				: "UNQUALIFIED"
	});
	//우선은 ONGOING말고 WAITING만.
	// console.log(req.body);
	return res.json({ user });
});

router.delete("/:userId", async (req, res) => {
	let user = await User.findOne()
	// User Schema에서 pre remove 설정하기
	//https://stackoverflow.com/questions/14348516/cascade-style-delete-in-mongoose
	await user.remove()
})
module.exports = router;

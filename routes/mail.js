const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../models/User");
let router = express.Router();
/* GET meeting information */

function sendRegisterMail(transporter, user) {
	let mailOptions = {
		from: "bo314@naver.com", // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
		// to: req.body.email, // 수신 메일 주소
		to: "bo314@naver.com",
		subject: `진솔한 만남. ${user.nickname}님 진솔의 가입을 위해 인증해주세요.`, // 제목
		html: `
		<div>
		<h2>진솔에 가입해주셔서 감사합니다.<h2>
		<p>아래의 버튼을 통해 이메일과 대학교를 인증해주세요.</p>
		<a href='${process.env.API_HOST +
			"/mail/authenticate/" +
			user.emailKey}'>이메일과 학교 인증하기</a>
		</div>
		` // 내용
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
}
router.get("/", async function(req, res) {
	sendRegisterMail(req.app.get("mailTransporter"), await User.findOne());
	return res.json({ message: "sent a mail" });
});

router.get("/authenticate/:emailKey", async (req, res) => {
	let user = await User.findOneAndUpdate(
		{ emailKey: req.params.emailKey },
		{ isEmailVerified: true }
	).select("nickname university email");
	console.log(user);
	if (!user) return res.status(403).json({ message: "no user found" });
	return res.send(`
	환영합니다. ${user.nickname}님!\n
	회원님의 ${user.email} 이메일이 인증되었습니다.
	`);
});
module.exports = router;

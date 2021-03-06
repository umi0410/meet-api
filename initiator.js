const express = require("express");
const nodemailer = require("nodemailer");
const User = require("./models/User");
let router = express.Router();

function initiate(app) {
	setMailConfiguration(app);
}

function setMailConfiguration(app) {
	let transporter = nodemailer.createTransport({
		service: process.env.EMAIL_PROVIDER,
		auth: {
			user: process.env.EMAIL_USER, // gmail 계정 아이디를 입력
			pass: process.env.EMAIL_PASSWORD // gmail 계정의 비밀번호를 입력
		}
	});

	app.set("mailTransporter", transporter);
	// let mailOptions = {
	// 	from: "bo314@naver.com", // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
	// 	// to: req.body.email, // 수신 메일 주소
	// 	to: "bo314@naver.com",
	// 	subject: "진솔한 만남. 진솔의 가입을 위해 인증해주세요.", // 제목
	// 	html: `
	//     <div>
	//     <h2>진솔에 가입해주셔서 감사합니다.<h2>
	//     <p>아래의 버튼을 통해 이메일과 대학교를 인증해주세요.</p>
	//     <a href='${process.env.API_HOST +
	// 		"/mail/authenticate/" +
	// 		req.query.emailKey}'>이메일과 학교 인증하기</a>
	//     </div>
	//     ` // 내용
	// };
	// transporter.sendMail(mailOptions, function(error, info) {
	//     if (error) {
	//         console.log(error);
	//     } else {
	//         console.log("Email sent: " + info.response);
	//     }
	// });
}

module.exports = { initiate };

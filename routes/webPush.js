const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const webpush = require("web-push");
const { createPushNotification } = require("../middlewares/push");
let router = express.Router();

const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
router.use(authentication.authenticate);
let User = require("../models/User");
let Match = require("../models/Match");
let Message = require("../models/Message");
const PushSubscription = require("../models/PushSubscription");

/* GET meeting information */
webpush.setVapidDetails(
	process.env.WEB_PUSH_CONTACT,
	process.env.PUBLIC_VAPID_KEY,
	process.env.PRIVATE_VAPID_KEY
);

router.post(
	"/notifications/subscribe",
	authentication.authenticate,
	async (req, res) => {
		// console.log(req.headers);
		const user = await User.findById(res.locals.auth._id);
		if (!user) {
			return res.status(401).json({ message: "No such user" });
		}
		const isPushExist = await PushSubscription.findOne({
			endpoint: req.body.endpoint,
			user: res.locals.auth._id
		});
		console.log(req.body);
		console.log(!isPushExist);
		if (!isPushExist) {
			let subscription = await new PushSubscription({
				user: user,
				...req.body
			});
			await subscription.save();
		}

		const payload = JSON.stringify({
			title: "New Subscriber!",
			body: "Hello, world."
		});
		let allSubscriptions = await PushSubscription.find();

		res.status(200).json({ success: true });
	}
);
// router.post(
// 	"/send",
// 	authentication.authenticate,
// 	async (req, res) => {
// 		// console.log(req.headers);
// 		// console.log(req.body);
// 		console.log(!subscription);
// 		if (!subscription) {
// 			// console.log(no push)
// 			return res.status(404).json({ message: "no subscription" });
// 		}
// 		const sender = await User.findById(req.locals.auth._id);
// 		const subscription = await PushSubscription.findOne({
// 			user: recipientId
// 		}).populate("user", "nickname email id");
// 		// console.log(req.body);
//         console.log(!subscription);
//         await message = new Message({
//             sender:req.locals.auth._id,
//             recipient:
//         })
// 		if (subscription) {
// 			// console.log(no push)
// 			createPushNotification(subscription, {
//                 title: sender.nickname + "님으로부터 메시지 도착",
//                 body: subscription.user.nickname + "님, 안녕하세요."
//             });

// 		}

// 		return res.status(200).json({ success: true });
// 	}
// );
router.get("/notification/send", async (req, res) => {
	const payload = JSON.stringify({
		title: "Hello!",
		body: "It works."
	});
	allSubscriptions.forEach(subscription => {
		try {
			webpush
				.sendNotification(subscription, payload)
				.then(result => {})
				.catch(e => console.log(e.stack));
		} catch (err) {
			console.error(err);
		}
	});
	res.status(200).json({ success: true });
});

module.exports = router;
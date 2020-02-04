const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const webpush = require("web-push");
const authentication = require("./authentication");
const authorization = require("./authorization");

let User = require("../models/User");
let Match = require("../models/Match");
let Message = require("../models/Message");
const PushSubscription = require("../models/PushSubscription");

createPushNotification = (subscription, payload) => {
	try {
		webpush
			.sendNotification(subscription, JSON.stringify(payload))
			.then(result => {})
			.catch(e => console.log(e.stack));
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	createPushNotification
};

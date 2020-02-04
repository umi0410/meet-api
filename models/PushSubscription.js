const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
let PushSubscriptionSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	endpoint: String,
	keys: Object,
	data: Object
});

module.exports = mongoose.model("PushSubscription", PushSubscriptionSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Message는 간단하니까
let MessageSchema = new Schema({
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	match: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Match"
	},
	data: String
});

module.exports = mongoose.model("Message", MessageSchema);

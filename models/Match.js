const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let MatchSchema = new Schema({
	participants: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
});

module.exports = mongoose.model("Match", MatchSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
	email: String,
	nickname: String,
	university: {
		type: String,
		default: "경희대학교"
	},
	profileMessage: {
		type: String,
		default: "안녕, hello, world"
	},
	likes: {
		type: [String],
		default: ["맥주, 영화보기"]
	},
	hates: {
		type: [String],
		default: ["소주", "싸움"]
	},
	excludeCandidates: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	likePartners: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],

	//후보에서 제외시킬 사람 ex block, matched

	loggedin: { type: Date, default: Date.now },
	password: String
});

module.exports = mongoose.model("User", UserSchema);

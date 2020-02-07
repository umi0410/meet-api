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
		default: [
			"sell",
			"garden",
			"thus",
			"combination",
			"wise",
			"lonely",
			"repeat"
		]
	},
	hates: {
		type: [String],
		default: [
			"adventure",
			"path",
			"raise",
			"inch",
			"stock",
			"generally",
			"south"
		]
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
	questions: {
		type: Array,
		default: [
			{
				title: "가장 좋아하는 데이트 스타일은 어떤 건가요?",
				answer: "나도 몰라요 그냥 끌리는 대로 하는 거지 뭐;;\n별거 있나"
			},
			{
				title: "본인의 장점이 무엇이라고 생각하시나요??",
				answer: "나도 몰라요"
			}
		]
	},
	pushToken: {
		type: String
	},

	//후보에서 제외시킬 사람 ex block, matched

	loggedin: { type: Date, default: Date.now },
	password: String
});

module.exports = mongoose.model("User", UserSchema);

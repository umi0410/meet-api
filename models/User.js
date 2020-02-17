const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MINIMUM_TAGS = 10;
const MINIMUM_QUESTIONS = 3;
let UserSchema = new Schema({
	email: String,
	emailKey: String,
	isEmailVerified: {
		type: Boolean,
		default: false
	},
	meetingStatus: {
		type: String,
		enum: ["UNQUALIFIED", "WAITING", "ONGOING"],
		default: "UNQUALIFIED"
	},

	nickname: String,
	university: {
		type: String,
		default: "학교미인증"
	},
	campus: {
		type: String,
		default: undefined
	},
	height: Number,
	weight: Number,
	birthYear: Number,
	profileMessage: {
		type: String,
		default: "프로필메시지를 입력하지 않았습니다."
	},
	likes: {
		type: [String]
	},
	hates: {
		type: [String]
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
const model = mongoose.model("User", UserSchema);
model.MINIMUM_TAGS = MINIMUM_TAGS;
model.MINIMUM_QUESTIONS = MINIMUM_QUESTIONS;
module.exports = model;

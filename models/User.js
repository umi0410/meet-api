const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MINIMUM_TAGS = 10;
const MINIMUM_QUESTIONS = 3;
let UserSchema = new Schema({
	email: String,
	emailKey: String, //email 인증 시에 사용
	isEmailVerified: {
		type: Boolean,
		default: false
	},
	meetingStatus: {
		type: String,
		//WAITING은 QUALIFIED지만, 서비스 오픈을 대기 중일 때
		enum: ["UNQUALIFIED", "WAITING", "ONGOING"],
		default: "UNQUALIFIED"
	},

	nickname: String,
	university: {
		type: String,
		default: "학교미인증"
	},
	campus: {
		//캠퍼스가 존재하는 학교의 경우에만 사용
		type: String,
		default: undefined
	},
	major: {
		type: String,
		default: "전공미선택"
	},
	sex: {
		type: String,
		enum: ["FEMALE", "MALE"],
		default: "FEMALE"
	},
	heightType: {
		type: String,
		enum: [
			"많이 작은 편",
			"조금 작은 편", "보통", "조금 큰 편", "많이 큰 편"
		],
		default: "보통"
	},
	// height: Number,
	// weight: Number,
	birthYear: Number,
	profileImage: {
		type: String,
		default: "female-profile.png"
	},
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
	//소개팅 질문지
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
	isValidMeetingInfo: {
		type: Boolean,
		default: false
	},

	//미팅후보에서 제외될 User
	excludeCandidates: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	//자신이 Like를 보낸 User
	likePartners: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],

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

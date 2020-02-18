const winston = require("winston"); // winston lib
require("winston-daily-rotate-file");

const { splat, combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ timestamp, level, message, label }) => {
	return `${timestamp} [${label}] ${level}: ${message}`; // log 출력 포맷 정의
});

const options = {
	// log파일
	// file: {
	// 	level: "info",
	// 	filename: `./logs/winston-test.log`, // 로그파일을 남길 경로
	// 	handleExceptions: true,
	// 	json: false,
	// 	maxsize: 5242880, // 5MB
	// 	maxFiles: 5,
	// 	colorize: false,
	// 	format: combine(
	// 		label({ label: "meet-api" }),
	// 		timestamp(),
	// 		myFormat // log 출력 포맷
	// 	)
	// },
	// 개발 시 console에 출력
	console: {
		level: "debug",
		handleExceptions: true,
		json: false, // 로그형태를 json으로도 뽑을 수 있다.
		colorize: true,
		format: combine(label({ label: "meet-api" }), timestamp(), myFormat),
		eol: ""
	}
};
let fileTransport = new winston.transports.DailyRotateFile({
	dirname: process.env.LOG_DIR || "logs",
	filename: "meet-api-%DATE%.log",
	datePattern: "YYYY-MM-DD-HH",
	json: true,
	level: "debug",
	format: combine(
		label({ label: "meet-api" }),
		timestamp(),
		// splat(),
		myFormat // log 출력 포맷
	)
});

let logger = new winston.createLogger({
	exitOnError: false
});
// 개발 시 console, production은 file로 출력
if (process.env.MEET_NODE_ENV == "production") {
	logger.add(fileTransport);
} else if (process.env.MEET_NODE_ENV == "development") {
	logger.add(new winston.transports.Console(options.console));
}

//morgan이 이용할 stream
logger.stream = {
	write: function(message, encoding) {
		logger.info(message); // 단순히 message를 default 포맷으로 출력
	}
};
module.exports = logger;

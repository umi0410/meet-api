const jwt = require("jsonwebtoken");

async function decodeJWT(token, secretKey) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secretKey, (err, decoded) => {
			//err 있을 때 작업 수정해야함
			// console.error(err);
			if (err) return reject("wrong token");
			else {
				resolve(decoded);
			}
		});
	});
}
async function authenticate(req, res, next) {
	// console.log(req.headers);;
	let decodedToken = await decodeJWT(
		req.headers["x-access-token"],
		req.app.get("jwt-secret")
	);
	res.locals.auth = decodedToken;
	next();
}

async function publishToken(user, secretKey) {
	const payload = {
		email: user.email,
		nickname: user.nickname,
		_id: user._id
	};
	const token = await jwt.sign(payload, secretKey);
	return token;
}
module.exports = {
	authenticate,
	decodeJWT,
	publishToken
};

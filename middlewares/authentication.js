const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
	console.log(req.headers);
	let authentication = jwt.verify(
		req.headers["x-access-token"],
		req.app.get("jwt-secret"),
		(err, decoded) => {
			//err 있을 때 작업 수정해야함
			if (err) return res.status(403).json("wrong token");
			else {
				res.locals.auth = decoded;
				next();
			}
		}
	);
}

module.exports = {
	authenticate
};

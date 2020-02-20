const crypto = require("crypto");
function createHash(text) {
	return crypto
		.createHash("sha512")
		.update(text)
		.digest("hex");
}

module.exports = {
	createHash
};

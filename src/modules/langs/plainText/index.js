let codeIntel = require("./codeIntel");
let parse = require("./parse");

module.exports = async function() {
	return {
		code: "plainText",
		name: "Plain text",
		codeIntel,
		parse: parse(),
		
		getSupportLevel(code, path) {
			return null;
		},
	};
}

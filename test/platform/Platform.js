let path = require("path-browserify");
let minimatch = require("minimatch-browser");
let defaultPrefs = require("modules/defaultPrefs");
let fs = require("platforms/common/modules/fs");

class Platform {
	constructor() {
		this.systemInfo = {
			newline: "\n",
		};
		
		this.fs = fs({
			fs: {
				
			},
			
			path,
			minimatch,
			
			cwd() {
				return "/";
			},
		});
		
		this.prefs = defaultPrefs(this.systemInfo);
	}
	
	async init(options) {
		
	}
	
	loadTreeSitterLanguage(name) {
		return TreeSitter.Language.load("./vendor/tree-sitter/langs/tree-sitter-" + name + ".wasm");
	}
}

module.exports = Platform;

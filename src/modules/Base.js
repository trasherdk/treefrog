let bluebird = require("bluebird");

let getIndentationDetails = require("modules/utils/getIndentationDetails");
let guessIndent = require("modules/utils/guessIndent");
let checkNewlines = require("modules/utils/checkNewlines");

let javascript = require("modules/langs/javascript");
let html = require("modules/langs/html");
let css = require("modules/langs/css");
//let svelte = require("modules/langs/svelte");
let plainText = require("modules/langs/plainText");
let langs = require("modules/langs");

/*
top-level object for general, global things like langs, as well as any
initialisation that needs to be done before any other clientside code runs --
e.g. initialising langs.  this initialisation can be async and is done by
the init() method.

the reason for having a global singleton like this, as opposed to just having
everything in separate modules and the code that uses them require() them
individually, is 1) it is dynamic -- not as quick-changing as the UI, but changes
when e.g. a lang is added -- and 2) some of the init is async, so wouldn't be
immediately available from a require()d module -- having a big init() method
means that code that runs subsequently (which includes the entire UI, so basically
the whole app) can get stuff from the global base object without having to
await it.

this can be shared between multiple instances of the UI, e.g. with multiple
instances embedded in a web page, so doesn't know anything about the state of the
UI.
*/

class Base {
	constructor(components) {
		this.langs = langs;
		this.components = components;
	}
	
	async init() {
		await TreeSitter.init();
		
		this.treeSitterLanguages = {};
		
		await bluebird.map(["javascript", "html", "css"], async (code) => {
			this.treeSitterLanguages[code] = await platform.loadTreeSitterLanguage(code);
		});
		
		let langs = [
			javascript,
			//svelte,
			html,
			css,
			plainText,
		];
		
		for (let lang of langs) {
			this.langs.add(lang);
		}
		
		for (let lang of this.langs.all) {
			lang.injections = (lang.injections || []).map((injection) => {
				return {
					...injection,
					query: this.treeSitterLanguages[lang.code].query(injection.pattern),
				};
			});
		}
	}
	
	/*
	There are 3 support levels: general and specific, and alternate.
	
	general means the lang supports the file, and should be used unless there is
	a lang with specific support.
	
	specific means the file can be handled by a general lang, but this lang has
	more specific support, e.g. Node vs JavaScript.  Languages should only return
	"specific" if there is a specific reason to, and specific langs that can also
	handle the general lang should return "alternate" for those files.  Node
	should return "specific" for .js files that are identifiable as Node files
	(e.g. they have a Node hashbang line); alternate for .js files that aren't
	identifiable as Node files; and null for anything else.
	
	alternate means the lang supports the file but wouldn't usually be used,
	e.g. JavaScript supports JSON files and SCSS supports CSS files.
	
	plainText is a special case and is hard-coded as the fallback if no supporting
	langs are found, so it should just return null.
	*/
	
	guessLang(code, path) {
		if (path) {
			for (let [langCode, patterns] of Object.entries(platform.prefs.fileAssociations)) {
				for (let pattern of patterns) {
					if (platform.fs(path).matchName(pattern)) {
						return this.langs.get(langCode);
					}
				}
			}
		}
		
		let general = null;
		let alternate = null;
		let fallback = this.langs.get("plainText");
		
		for (let lang of this.langs.all) {
			let supportLevel = lang.getSupportLevel(code, path);
			
			if (supportLevel === "specific") {
				return lang;
			} else if (supportLevel === "general" && !general) {
				general = lang;
			} else if (supportLevel === "alternate" && !alternate) {
				alternate = lang;
			}
		}
		
		return general || alternate || fallback;
	}
	
	getFileDetails(code, path) {
		let {
			defaultIndent,
			tabWidth,
			defaultNewline,
		} = platform.prefs;
		
		let indent = guessIndent(code) || defaultIndent;
		let lang = this.guessLang(code, path);
		
		let {
			mixed: hasMixedNewlines,
			mostCommon: newline,
		} = checkNewlines(code);
		
		if (!newline) {
			newline = defaultNewline;
		}
		
		let indentation = getIndentationDetails(indent, tabWidth);
		
		return {
			indentation,
			tabWidth,
			lang,
			newline,
			hasMixedNewlines,
		};
	}
	
	getDefaultFileDetails() {
		let {
			defaultIndent,
			tabWidth,
			defaultNewline,
			defaultLang,
		} = platform.prefs;
		
		let lang = this.langs.get(defaultLang);
		let indentation = getIndentationDetails(defaultIndent, tabWidth);
		
		return {
			indentation,
			tabWidth,
			lang,
			newline: defaultNewline,
			hasMixedNewlines: false,
		};
	}
	
	getTreeSitterLanguage(code) {
		return this.treeSitterLanguages[code];
	}
}

module.exports = Base;

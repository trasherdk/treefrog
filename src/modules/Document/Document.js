let throttle = require("utils/throttle");
let AstSelection = require("modules/utils/AstSelection");
let Selection = require("modules/utils/Selection");
let Cursor = require("modules/utils/Cursor");
let protocol = require("modules/protocol");
let findAndReplace = require("modules/findAndReplace");
let Base = require("./Base");
let Source = require("./Source");

let {s} = Selection;
let {c} = Cursor;

class Document extends Base {
	constructor(code, url=null, options={}) {
		super();
		
		this.historyIndexAtSave = 0;
		
		this.options = {
			fileDetails: null,
			noParse: false,
			...options,
		};
		
		this.url = url;
		this.source = new Source(code, this.options.noParse);
		
		if (this.options.fileDetails) {
			this.fileDetails = this.options.fileDetails;
		} else {
			this.fileDetails = base.getFileDetails(this.string, this.url);
		}
		
		this.source.init(this.fileDetails);
		
		this.throttledBackup = throttle(() => {
			platform.backup(this);
		}, 15000);
	}
	
	updateFileDetails() {
		this.fileDetails = base.getFileDetails(this.string, this.url);
		
		this.source.init(this.fileDetails);
	}
	
	setLang(lang) {
		this.fileDetails.lang = lang;
		
		this.source.init(this.fileDetails);
	}
	
	get path() {
		return this.url?.path;
	}
	
	get protocol() {
		return this.url?.protocol;
	}
	
	get isSaved() {
		return this.protocol && this.protocol !== "new";
	}
	
	async save() {
		await protocol(this.url).write(this.toString());
		
		this.modified = false;
		this.historyIndexAtSave = this.historyIndex;
		
		this.fire("save");
	}
	
	saveAs(url) {
		this.url = url;
		
		this.updateFileDetails();
		
		return this.save();
	}
	
	*find(options) {
		let results = findAndReplace.find({
			code: this.string,
			...options,
		});
		
		for (let result of results) {
			yield this.createFindResult(result);
		}
	}
	
	findAll(options) {
		return [...this.find(options)];
	}
	
	replaceAll(options) {
		let document = new Document(this.string, null, {
			noParse: true,
		});
		
		let results = [];
		let edits = [];
		
		for (let result of document.find(options)) {
			edits.push(result.replace(options.replaceWith));
			
			results.push({
				...result,
				document: this,
				replacedLine: this.lines[result.selection.start.lineIndex],
			});
		}
		
		return {
			edits,
			results,
		};
	}
	
	createFindResult(result) {
		let {index, match, groups, replace} = result;
		let cursor = this.cursorFromIndex(index);
		let selection = s(cursor, this.cursorFromIndex(index + match.length));
		
		return {
			document: this,
			index,
			cursor,
			selection,
			match,
			groups,
			
			replace: (str) => {
				str = replace(str);
				
				let {edit} = this.replaceSelection(selection, str);
				
				this.apply(edit);
				
				return edit;
			},
		};
	}
	
	langFromLineIndex(lineIndex) {
		let line = this.lines[lineIndex];
		
		return this.langFromCursor(c(lineIndex, line.indentOffset));
	}
	
	langFromAstSelection(astSelection) {
		let {startLineIndex} = astSelection;
		let line = this.lines[startLineIndex];
		
		return this.langFromCursor(c(startLineIndex, line.indentOffset));
	}
	
	langFromCursor(cursor) {
		return this.source.langFromCursor(cursor);
	}
	
	getDecoratedLines(startLineIndex, endLineIndex) {
		return this.source.getDecoratedLines(startLineIndex, endLineIndex);
	}
	
	findFirstNodeToRender(lineIndex) {
		return this.source.findFirstNodeToRender(lineIndex);
	}
	
	getNodesOnLine(lineIndex) {
		return this.source.getNodesOnLine(lineIndex);
	}
	
	getNodesOnLineWithLang(lineIndex) {
		return this.source.getNodesOnLineWithLang(lineIndex);
	}
	
	generateNodesOnLine(lineIndex) {
		return this.source.generateNodesOnLine(lineIndex);
	}
	
	generateNodesOnLineWithLang(lineIndex) {
		return this.source.generateNodesOnLineWithLang(lineIndex);
	}
	
	getHeadersOnLine(lineIndex) {
		return this.source.getHeadersOnLine(lineIndex);
	}
	
	getFootersOnLine(lineIndex) {
		return this.source.getFootersOnLine(lineIndex);
	}
}

module.exports = Document;

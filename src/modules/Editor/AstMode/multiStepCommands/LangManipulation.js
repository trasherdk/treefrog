let AstSelection = require("modules/utils/AstSelection");
let Command = require("./Command");

let {s} = AstSelection;

class LangManipulation extends Command {
	constructor(editor, manipulation) {
		super(editor);
		
		this.manipulation = manipulation;
	}
	
	start() {
		let {editor} = this;
		let {document, view, astSelection} = editor;
		let {startLineIndex, endLineIndex} = astSelection;
		
		let transformedLines = this.manipulation.apply(document, astSelection);
		
		let {
			replacedLines,
			positions,
		} = editor.createSnippetPositionsForLines(transformedLines, startLineIndex);
		
		let edit = document.lineEdit(startLineIndex, endLineIndex - startLineIndex, replacedLines);
		let newSelection = s(startLineIndex, startLineIndex + replacedLines.length);
		
		let snippetSession = null;
		
		let normalSelection;
		
		if (positions.length > 0) {
			if (!this.peekingAstMode) {
				this.selectionOnReturnToAstMode = newSelection;
			}
			
			newSelection = undefined;
			normalSelection = positions[0].selection;
			
			editor.switchToNormalMode();
			
			snippetSession = {
				index: 0,
				positions,
			};
		}
		
		editor.applyAndAddHistoryEntry({
			edits: [edit],
			astSelection: newSelection,
			normalSelection,
			snippetSession,
		});
	}
}

module.exports = LangManipulation;

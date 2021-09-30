let AstSelection = require("modules/utils/AstSelection");
let parsePlaceholdersInLines = require("modules/utils/parsePlaceholdersInLines");
let astCommon = require("modules/langs/common/astMode");

module.exports = {
	setSelection(selection) {
		this.view.setAstSelection(selection);
		this.view.redraw();
	},
	
	setSelectionHilite(selection) {
		this.view.astSelectionHilite = selection;
		
		this.view.showPickOptionsFor(selection);
		
		this.view.redraw();
	},
	
	setInsertionHilite(selection) {
		this.view.astInsertionHilite = selection;
	},
	
	drop(
		fromSelection,
		toSelection,
		lines,
		move,
		option,
		target,
	) {
		if (
			fromSelection
			&& toSelection
			&& !AstSelection.isFull(toSelection)
			&& AstSelection.isAdjacent(fromSelection, toSelection)
		) {
			this.astMouse.invalidDrop();
			
			return;
		}
		
		this.view.clearDropTargets();
		this.astMouse.setInsertionHilite(null);
		
		let {document} = this;
		let {astMode} = document.langFromAstSelection(fromSelection || toSelection);
		
		let {
			edits,
			snippetEdit,
			newSelection,
		} = astCommon.drop(
			astMode,
			document,
			fromSelection,
			toSelection,
			lines,
			move,
			option,
			target,
		);
		
		let normalSelection;
		let snippetSession = null;
		
		if (snippetEdit) {
			let {
				insertIndex,
				removeLines,
				insertLines,
			} = snippetEdit;
			
			let {
				replacedLines,
				placeholders,
			} = parsePlaceholdersInLines(insertLines, insertIndex);
			
			edits = [...edits, document.lineEdit(insertIndex, removeLines, replacedLines)];
			
			this.astSelectionAfterSnippet = newSelection;
			
			newSelection = undefined;
			normalSelection = placeholders[0].selection;
			
			this.switchToNormalMode();
			
			if (placeholders.length > 1) {
				snippetSession = {
					index: 0,
					placeholders,
				};
			}
		}
		
		if (edits.length > 0) {
			this.applyAndAddHistoryEntry({
				edits,
				astSelection: newSelection,
				normalSelection,
				snippetSession,
			});
		}
	},
	
	invalidDrop() {
		this.view.clearDropTargets();
		this.astMouse.setInsertionHilite(null);
		this.view.redraw();
	},
};

let {on, off} = require("../../utils/dom/domEvents");
let rowColFromScreenCoords = require("../../modules/utils/rowColFromScreenCoords");
let rowColFromCursor = require("../../modules/utils/rowColFromCursor");
let cursorFromRowCol = require("../../modules/utils/cursorFromRowCol");
let AstSelection = require("../../modules/utils/AstSelection");
let Selection = require("../../modules/utils/Selection");
let autoScroll = require("./utils/autoScroll");

module.exports = function(editor) {
	let drawingSelection = false;
	
	function getHilite(e) {
		let {
			canvas,
			measurements,
			document,
			selection,
			isPeekingAstMode: isPeeking,
			normalSelection,
			scrollPosition,
		} = editor;
		
		let {
			x: left,
			y: top,
		} = canvas.getBoundingClientRect();
		
		let x = e.clientX - left;
		let y = e.clientY - top;
		
		let [row, col] = rowColFromScreenCoords(
			document.lines,
			x,
			y,
			scrollPosition,
			measurements,
		);
		
		if (row < document.countRows()) {
			let [lineIndex] = cursorFromRowCol(document.lines, row, col);
			
			let hilite = document.lang.codeIntel.astSelection.hiliteFromLineIndex(document.lines, lineIndex);
			
			if (
				isPeeking
				&& hilite
				&& AstSelection.isWithin(hilite, selection)
				&& Selection.isFull(normalSelection)
			) {
				hilite = selection;
			}
			
			return hilite;
		}
		
		return null;
	}
	
	function hilite(e) {
		let {
			setSelectionHilite,
			redraw,
		} = editor;
		
		setSelectionHilite(getHilite(e));
		
		redraw();
	}
	
	function mousedown(e, enableDrag) {
		let {
			canvas,
			measurements,
			document,
			hasHorizontalScrollbar,
			scrollBy,
			setSelection,
			redraw,
		} = editor;
		
		autoScroll(
			canvas,
			measurements,
			document,
			hasHorizontalScrollbar,
			scrollBy,
		);
		
		if (e.shiftKey) {
			drawingSelection = true;
			
			on(window, "mousemove", drawSelection);
			on(window, "mouseup", finishSelection);
		} else {
			let hilite = getHilite(e);
			
			if (!hilite) {
				return;
			}
			
			enableDrag();
			
			on(window, "dragend", dragend);
		}
	}
	
	function drawSelection(e) {
		
	}
	
	function finishSelection(e) {
		
	}
	
	function mousemove(e) {
		if (drawingSelection) {
			return;
		}
		
		requestAnimationFrame(function() {
			hilite(e);
		});
	}
	
	function mouseup() {
		editor.mouseup();
		
		off(window, "mousemove", drawSelection);
		off(window, "mouseup", finishSelection);
		off(window, "dragend", dragend);
	}
	
	function dragend() {
		mouseup();
	}

	return {
		mousedown,
		mousemove,
		hilite,
	};
}

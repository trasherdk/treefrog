let AstSelection = require("../../utils/AstSelection");
let getLineStartingRow = require("../utils/getLineStartingRow");
let screenCoordsFromRowCol = require("../utils/screenCoordsFromRowCol");
let getLineRangeTotalHeight = require("../utils/getLineRangeTotalHeight");

module.exports = function(
	context,
	lines,
	hilite,
	selection,
	isPeeking,
	scrollPosition,
	fileDetails,
	measurements,
) {
	if (!hilite) {
		return;
	}
	
	if (!isPeeking && AstSelection.equals(hilite, selection)) {
		return;
	}
	
	context.fillStyle = app.prefs.astSelectionHiliteBackground;
	
	let {colWidth, rowHeight} = measurements;
	let [startLineIndex, endLineIndex] = hilite;
	let startLine = lines[startLineIndex];
	let startRow = getLineStartingRow(lines, startLineIndex);
	let height = (getLineRangeTotalHeight(lines, startLineIndex, endLineIndex - 1)) * rowHeight;
	
	let [x, y] = screenCoordsFromRowCol(
		lines,
		startRow,
		startLine.indentLevel * fileDetails.indentation.colsPerIndent,
		scrollPosition,
		measurements,
	);
	
	if (height === 0) {
		context.fillRect(x, y, context.canvas.width, 2);
	} else {
		context.fillRect(x, y, context.canvas.width, height);
	}
}
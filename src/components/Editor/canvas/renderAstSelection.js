module.exports = function(layers, view, isPeeking) {
	let {
		wrappedLines,
		astSelection,
		sizes: {
			width,
		},
		measurements: {
			rowHeight,
		},
	} = view;
	
	let context = layers.hilites;
	
	let {
		fileDetails,
	} = view.document;
	
	context.fillStyle = platform.prefs.astSelectionBackground;
	
	let {startLineIndex, endLineIndex} = astSelection;
	let startLine = wrappedLines[startLineIndex].line;
	let startRow = view.getLineStartingRow(startLineIndex);
	let height = (view.getLineRangeTotalHeight(startLineIndex, endLineIndex - 1)) * rowHeight;
	
	let [x, y] = view.screenCoordsFromRowCol(startRow, startLine.indentLevel * fileDetails.indentation.colsPerIndent);
	
	if (height === 0) {
		context.fillRect(x, y, width, 2);
	} else {
		context.fillRect(x, y, width, height);
	}
}

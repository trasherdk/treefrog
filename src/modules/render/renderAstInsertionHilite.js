let getLineStartingRow = require("../utils/getLineStartingRow");
let screenCoordsFromRowCol = require("../utils/screenCoordsFromRowCol");
let getLineRangeTotalHeight = require("../utils/getLineRangeTotalHeight");
let AstSelection = require("../utils/AstSelection");

let images = {
	insert: "./img/insert.png",
	expand: "./img/expand.png",
};

for (let [name, src] of Object.entries(images)) {
	images[name] = new Image();
	images[name].src = src;
}

let lineWidth = 2;
let lineLength = 35;

module.exports = function(
	context,
	lines,
	hilite,
	selection,
	isPeeking,
	scrollPosition,
	prefs,
	fileDetails,
	measurements,
) {
	if (!hilite) {
		return;
	}
	
	context.fillStyle = prefs.astInsertionHiliteBackground;
	
	let {colWidth, rowHeight} = measurements;
	let [startLineIndex, endLineIndex] = hilite;
	
	if (startLineIndex === lines.length) {
		let startRow = getLineStartingRow(lines, startLineIndex - 1) + 1;
		
		let [x, y] = screenCoordsFromRowCol(
			lines,
			startRow,
			0,
			scrollPosition,
			measurements,
		);
		
		context.fillRect(x, y, lineLength, lineWidth);
		
		return;
	}
	
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
		context.fillRect(x, y, lineLength, lineWidth);
	} else {
		let middle = y + Math.round(height / 2) - Math.round(lineWidth / 2);
		
		
		
		context.fillRect(x, middle, lineLength, lineWidth);
		
		context.save();
		
		context.fillStyle = prefs.astInsertionHiliteBackground;
		
		context.translate(x + lineLength / 2, y + lineWidth / 2);
		context.rotate(45 * Math.PI / 180);
		
		context.fillRect(1, 2, 9, 9);
		
		context.restore();
	}
}

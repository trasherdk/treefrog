module.exports = function(layers, view, rows) {
	let {
		font,
		marginBackground,
		lineNumberColor,
	} = platform.prefs;
	
	let {
		sizes,
		measurements,
	} = view;
	
	let {
		colWidth,
		rowHeight,
	} = measurements;
	
	let {
		height,
		marginWidth,
		topMargin,
		marginStyle,
	} = sizes;
	
	let context = layers.margin;
	
	context.font = font;
	
	context.fillStyle = marginBackground;
	context.fillRect(0, 0, marginWidth, height);
	
	let y = rowHeight + topMargin; // not 0 -- we're using textBaseline="bottom"
	
	for (let {lineIndex, rowIndex} of rows) {
		if (rowIndex === 0) {
			let lineNumber = String(lineIndex + 1);
			let x = marginWidth - marginStyle.paddingRight - lineNumber.length * colWidth;
			
			context.fillStyle = lineNumberColor;
			context.fillText(lineNumber, x, y);
		}
		
		y += rowHeight;
	}
}
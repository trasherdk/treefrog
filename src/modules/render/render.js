let renderMarginBackground = require("./renderMarginBackground");
//let renderCurrentLineHilite = require("./renderCurrentLineHilite");
//let renderSelection = require("./renderSelection");
//let renderWordHilites = require("./renderWordHilites");
let renderCodeAndMargin = require("./renderCodeAndMargin");
let renderCursor = require("./renderCursor");

module.exports = function(
	context,
	lines,
	selection,
	hiliteWord,
	scrollPosition,
	lang,
	prefs,
	colors,
	measurements,
	cursorBlinkOn,
) {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
	renderMarginBackground(
		context,
		lines,
		prefs,
		measurements,
	);
	
	//renderCurrentLineHilite(
	//	context,
	//	lines,
	//	selection,
	//	scrollPosition,
	//	colors,
	//	measurements,
	//);
	
	//renderSelection(
	//	context,
	//	lines,
	//	selection,
	//	scrollPosition,
	//	colors,
	//	measurements,
	//);
	
	//renderWordHilites(
	//	context,
	//	lines,
	//	selection,
	//	scrollPosition,
	//	colors,
	//	measurements,
	//);
	
	renderCodeAndMargin(
		context,
		lines,
		selection,
		scrollPosition,
		lang,
		prefs,
		colors,
		measurements,
	);
	
	renderCursor(
		context,
		lines,
		selection,
		scrollPosition,
		measurements,
		cursorBlinkOn,
	);
}
module.exports = function(layers, view, windowHasFocus) {
	let {
		normalSelection,
		insertCursor,
		measurements,
		cursorBlinkOn,
	} = view;
	
	if (!cursorBlinkOn || !windowHasFocus || insertCursor) {
		return;
	}
	
	let [x, y] = view.screenCoordsFromCursor(normalSelection.end);
	
	if (x < view.sizes.marginWidth) {
		return;
	}
	
	let context = layers.code;
	
	context.fillStyle = "black";
	context.fillRect(x, y, 1, measurements.rowHeight);
}

let Cursor = require("modules/utils/Cursor");
let findFirstNodeOnOrAfterCursor = require("./findFirstNodeOnOrAfterCursor");
let next = require("./next");

let {c} = Cursor;

module.exports = function*(tree, lineIndex, startOffset) {
	let node = findFirstNodeOnOrAfterCursor(tree, c(lineIndex, startOffset));
	
	while (node && node.startPosition.row === lineIndex) {
		yield node;
		
		node = next(node);
	}
}

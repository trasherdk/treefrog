/*
generate a set of rendering commands based on the line string, tabs (which
have to be handled specially because they're variable width -- hence
variableWidthParts), and any hints provided by the language.

Hints are e.g. "nodes", indicating that a particular range of text contains
a discrete syntax node that can be rendered as a unit (these won't be broken by
wrapping); or "colour" hints, indicating that following text should be rendered
a particular colour (e.g. "comment").

Ranges of text that aren't covered by hints are rendered in whatever colour
was last used, which will be set by the previous "node" or "colour" command.

("Hint" is probably too soft a word as the combination of hints and non-hint
ranges are the fundamental components of the line as far as rendering is
concerned.)
*/

module.exports = function*(line) {
	let stringStartOffset = 0;
	let offset = 0;
	let hintIndex = 0;
	
	for (let part of line.variableWidthParts) {
		if (part.type === "string") {
			let {string} = part;
			
			while (true) {
				/*
				1. render any misc text between the current offset
				and either the next hint or the end of the string
				*/
				
				let nextHint = line.renderHints[hintIndex];
				
				if (nextHint && nextHint.offset >= stringStartOffset + string.length) {
					// next hint is not within the current string part, so ignore
					
					nextHint = null;
				}
				
				if (!nextHint && offset - stringStartOffset < string.length) {
					let str = string.substr(offset - stringStartOffset);
					
					yield {
						type: "string",
						string: str,
					};
					
					offset += str.length;
				}
				
				if (nextHint && nextHint.offset > offset) {
					let str = string.substring(offset - stringStartOffset, nextHint.offset - stringStartOffset);
					
					yield {
						type: "string",
						string: str,
					};
					
					offset += str.length;
				}
				
				/*
				2. render the next hint
				*/
				
				while (nextHint && nextHint.offset === offset) {
					if (nextHint.type === "node") {
						let {node} = nextHint;
						
						yield nextHint;
						
						offset = node.startPosition.column + node.text.length;
					} else if (nextHint.type === "colour") {
						yield nextHint;
					} else if (nextHint.type === "parseError") {
						yield nextHint;
					}
					
					hintIndex++;
					nextHint = line.renderHints[hintIndex];
				}
				
				if (offset === stringStartOffset + string.length) {
					break;
				}
			}
			
			stringStartOffset += string.length;
		} else if (part.type === "tab") {
			yield {
				type: "tab",
				width: part.width,
			};
			
			offset++;
			stringStartOffset++;
		}
	}
}
module.exports = function(lang) {
	return {
		shouldIndentOnNewline(document, line, cursor) {
			return line.string.substr(0, cursor.offset).match(/[\[{(]$/);
		},
		
		indentAdjustmentAfterInsertion(document, line, cursor) {
			let nodes = document.getNodesOnLineWithLang(cursor.lineIndex);
			
			for (let {lang: l, node} of nodes) {
				if (l !== lang) {
					continue;
				}
				
				let header = lang.getHeader(node);
				
				if (header) {
					let {indentLevel} = document.lines[header.startPosition.row];
					
					if (indentLevel !== line.indentLevel) {
						return indentLevel - line.indentLevel;
					}
				}
			}
			
			return 0;
		},
		
		async isProjectRoot(dir) {
			return (await platform.fs(dir).readdir()).includes("package.json");
		},
	};
}

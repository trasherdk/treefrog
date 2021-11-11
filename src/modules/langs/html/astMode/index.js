let pickOptions = require("./pickOptions");
let dropTargets = require("./dropTargets");
let astManipulations = require("./astManipulations");
let generatePickOptions = require("./generatePickOptions");
let generateDropTargets = require("./generateDropTargets");

module.exports = {
	pickOptions,
	dropTargets,
	astManipulations,
	generatePickOptions,
	generateDropTargets,
	
	adjustSpaces(document, fromSelection, toSelection, selectionLines, insertLines) {
		console.log(document);
		console.log(fromSelection);
		console.log(toSelection);
		console.log(selectionLines);
		console.log(insertLines);
		
		return {
			above: 0,
			below: 0,
		};
	},
};

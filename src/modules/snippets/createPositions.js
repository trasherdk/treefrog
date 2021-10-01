let Selection = require("modules/utils/Selection");
let Cursor = require("modules/utils/Cursor");
let Document = require("modules/Document");
let parseJavaScript = require("./parseJavaScript");
let createExpressionFunction = require("./createExpressionFunction");
let Tabstop = require("./Tabstop");
let Expression = require("./Expression");
let AtLiteral = require("./AtLiteral");

let {s} = Selection;
let {c} = Cursor;

function getPlaceholders(string) {
	let placeholders = [];
	
	let i = 0;
	let ch;
	
	let encounteredTabstops = {};
	
	while (i < string.length) {
		let ch = string[i];
		let next = string[i + 1];
		
		if (ch === "@" && next) {
			if (next === "{") {
				let nameWithDefault = string.substr(i + "@{".length).match(/^([$\w]+)(?=:)/);
				
				if (nameWithDefault) {
					// @{name:defaultExpression}
					
					let [, name] = nameWithDefault;
					let start = i;
					let expressionStart = start + "@{".length + name.length + ":".length;
					let {index: expressionEnd, dollarVariables} = parseJavaScript(string, expressionStart);
					let expression = string.substring(expressionStart, expressionEnd);
					let fn = createExpressionFunction(expression, dollarVariables);
					let end = Math.min(string.length, expressionEnd + "}".length);
					
					placeholders.push(new Tabstop(start, end, name, fn));
					
					i = end;
				} else {
					// @{expression}
					
					let start = i;
					let expressionStart = start + "@{".length;
					let {index: expressionEnd, dollarVariables} = parseJavaScript(string, expressionStart);
					let expression = string.substring(expressionStart, expressionEnd);
					let fn = createExpressionFunction(expression, dollarVariables);
					let end = Math.min(string.length, expressionEnd + "}".length);
					
					placeholders.push(new Expression(start, end, fn));
					
					i = end;
				}
			} else if (next.match(/[$\w]/)) {
				// @name
				
				let [, name] = string.substr(i + "@".length).match(/^([$\w]+)/);
				let start = i;
				let end = start + "@".length + name.length;
				
				if (encounteredTabstops[name]) {
					// convert subsequent @name tabstops to expressions
					
					let fn = createExpressionFunction("$" + name, [0]);
					
					placeholders.push(new Expression(start, end, fn));
				} else {
					placeholders.push(new Tabstop(start, end, name, null));
					
					encounteredTabstops[name] = true;
				}
				
				i = end;
			} else if (next === "@") {
				let start = i;
				let end = i + 2;
				
				placeholders.push(new AtLiteral(start, end));
				
				i = end;
			} else {
				i += 2;
				
				continue;
			}
		} else {
			i++;
		}
	}
	
	return placeholders;
}

function getReplacedString(string, placeholders) {
	let replacedString = "";
	let prevPlaceholderEnd = 0;
	
	for (let placeholder of placeholders) {
		replacedString += string.substring(prevPlaceholderEnd, placeholder.start);
		
		prevPlaceholderEnd = placeholder.end;
	}
	
	replacedString += string.substr(prevPlaceholderEnd);
	
	return replacedString;
}

module.exports = function(string, baseLineIndex=0, baseOffset=0) {
	let placeholders = getPlaceholders(string);
	let replacedString = getReplacedString(string, placeholders);
	
	let indexOffset = 0;
	let document = new Document(replacedString);
	
	let positions = placeholders.map(function(placeholder) {
		let indexInReplacedString = placeholder.start - indexOffset;
		
		indexOffset += placeholder.end - placeholder.start;
		
		let {lineIndex, offset} = document.cursorFromIndex(indexInReplacedString);
		
		let cursor = c(
			baseLineIndex + lineIndex,
			lineIndex === 0 ? baseOffset + offset : offset,
		);
		
		return {
			placeholder,
			selection: s(cursor),
		};
	});
	
	return {
		replacedString,
		positions,
	};
}

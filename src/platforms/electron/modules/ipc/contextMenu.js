let {ipcRenderer} = require("electron");
let lid = require("utils/lid");

let clickHandlers = {};

ipcRenderer.on("contextMenu/click", function(e, id, itemId) {
	clickHandlers[id][itemId]();
});

ipcRenderer.on("contextMenu/close", function(e, id) {
	delete clickHandlers[id];
});

module.exports = function(items) {
	let id = lid();
	
	clickHandlers[id] = {};
	
	for (let item of items.filter(item => item.onClick)) {
		clickHandlers[id][item.id] = item.onClick;
	}
	
	ipcRenderer.invoke("contextMenu/show", id, items.map(function(item) {
		return {
			...item,
			onClick: undefined,
		};
	}));
}

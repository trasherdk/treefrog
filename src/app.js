// HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
require("electron").ipcRenderer.addListener("fix-event-79558e00-29ef-5c7f-84bd-0bcd9a0c5cf3", () => {});

import App from "./App.svelte";

let app = new App({
	target: document.body,
});

window.app = app;

// prevent default ctrl+w behaviour

window.addEventListener("keydown", function(e) {
	if (e.ctrlKey && e.key === "w") {
		e.preventDefault();
	}
});

export default app;

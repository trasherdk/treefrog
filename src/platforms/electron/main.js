import getKeyCombo from "utils/getKeyCombo";
import Base from "modules/Base";
import App from "modules/App";
import AppComponent from "components/App/App.svelte";
import Platform from "./Platform";

window.platform = new Platform();
window.base = new Base();

(async function() {
	await base.init();
	
	let app = new App();
	
	new AppComponent({
		target: document.body,
		
		props: {
			app,
		},
	});
	
	window.app = app;
	
	//app.openFile("test/repos/test.js");
	//app.openFile("src/components/App/App.svelte");
	app.openFile("test/repos/test.html");
	//app.openFile("src/modules/Editor/normalKeyboard.js");
	//app.openFile("test/repos/test.css");
})();

// misc shims etc:

let preventDefaultCombos = [
	"Ctrl+W",
	"Ctrl+-",
	"Ctrl++",
	"Ctrl+0",
];

window.addEventListener("keydown", function(e) {
	if (preventDefaultCombos.includes(getKeyCombo(e).keyCombo)) {
		e.preventDefault();
	}
});

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
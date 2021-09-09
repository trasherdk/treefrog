import App from "modules/App";
import components from "components";
import init from "./init";

init(async function() {
	let app = new App();
	
	await app.init();
	
	new components.App({
		target: document.body,
		
		props: {
			app,
		},
	});
	
	// DEV:
	
	window.app = app;
});

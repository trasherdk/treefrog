let bluebird = require("bluebird");
let Evented = require("utils/Evented");

module.exports = class extends Evented {
	constructor(app) {
		super();
		
		this.app = app;
		this.dir = platform.systemInfo.homeDir;
	}
	
	async init() {
		let options = await platform.jsonStores.fileTree.load();
		
		if (options) {
			this.dir = options.rootDir;
		}
		
		this.rootEntry = await this.getRootEntry();
	}
	
	async setRootDir(dir) {
		this.dir = dir;
		this.rootEntry = await this.getRootEntry();
		
		platform.jsonStores.fileTree.save({
			rootDir: dir,
		});
		
		this.fire("updateRootDir");
	}
	
	async up() {
		await this.setRootDir(this.rootEntry.node.parent.path);
	}
	
	getRootEntry() {
		return base.DirEntries.createEntry(this.dir);
	}
}

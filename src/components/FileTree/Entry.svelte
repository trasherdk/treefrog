<script>
import {getContext, onMount, createEventDispatcher} from "svelte";
import inlineStyle from "utils/dom/inlineStyle";

export let entry;
export let isRoot = false;
export let selectedEntry;
export let level = -1;

let fire = createEventDispatcher();

let app = getContext("app");

let {fileTree} = app;

let {node, isDir} = entry;
let {name} = node;
let showEntry = !isRoot;
let expanded = isRoot ? true : false; // TODO get from store
let entries = [];
let loaded = false;
let showHiddenFiles = base.getPref("showHiddenFiles");

$: dirs = entries.filter(e => e.isDir);
$: files = entries.filter(e => !e.isDir);

$: filteredEntries = [...dirs, ...files].filter(function(entry) {
	return showHiddenFiles || !entry.node.name.startsWith(".");
});

async function update() {
	entries = await base.DirEntries.ls(entry.path);
	
	loaded = true;
}

function toggle() {
	if (!isDir) {
		return;
	}
	
	expanded = !expanded;
	
	if (!loaded) {
		update();
	}
}

function dblclick() {
	if (isDir) {
		fire("makeRoot", entry);
	} else {
		fire("open", entry);
	}
}

function contextmenu(e) {
	fire("contextmenu", {
		e,
		entry,
	})
}

function select() {
	fire("select", entry);
}

if (expanded) {
	update();
}

function onPrefsUpdated() {
	showHiddenFiles = base.getPref("showHiddenFiles");
	
	update();
}

function onFsChange() {
	update();
}

let entryStyle = {
	paddingLeft: "calc(3px + 1.2em * " + level + ")",
};

let buttonStyle = {
	visibility: isDir ? "visible" : "hidden",
};

onMount(function() {
	let teardown = [
		isDir && platform.on("prefsUpdated", onPrefsUpdated),
		isDir && platform.fs(entry.path).watch(onFsChange),
	];
	
	return function() {
		for (let fn of teardown.filter(Boolean)) {
			fn();
		}
	}
});
</script>

<style type="text/scss">
@import "mixins/ellipsis";

#main {
	
}

#entry {
	display: flex;
	align-items: center;
	gap: 2px;
	padding: 2px 0;
	padding-right: 5px;
}

.selected {
	background: var(--listItemSelectedBackgroundColor);
}

#icon {
	flex-shrink: 0;
	width: 12px;
	height: 12px;
	border-radius: 3px;
}

.dirIcon {
	background: var(--dirEntryFolderBackgroundColor);
}

.fileIcon {
	background: var(--dirEntryFileBackgroundColor);
}

#name {
	@include ellipsis;
}

#entries {
	
}

.button {
	font-size: .9em;
	line-height: 9px;
	text-align: center;
	width: 15px;
	height: 15px;
	border: 1px solid var(--listItemExpandContractBorder);
	border-radius: 1px;
	padding: 1px 3px;
	background: var(--listItemExpandContractBackgroundColor);
}
</style>

<div id="main">
	{#if showEntry}
		<div
			id="entry"
			class:selected={entry === selectedEntry}
			on:mousedown={select}
			on:dblclick={dblclick}
			on:contextmenu={contextmenu}
			style={inlineStyle(entryStyle)}
		>
			<div id="actions">
				<div
					class="button"
					style={inlineStyle(buttonStyle)}
					on:click={toggle}
					on:dblclick={e => e.stopPropagation()}
				>
					{expanded ? "-" : "+"}
				</div>
			</div>
			<div
				id="icon"
				class:dirIcon={isDir}
				class:fileIcon={!isDir}
			></div>
			<div id="name">
				{name}
			</div>
		</div>
	{/if}
	{#if expanded}
		<div id="entries">
			{#each filteredEntries as entry (entry.path)}
				<svelte:self
					{entry}
					on:select
					on:open
					on:contextmenu
					on:makeRoot
					{selectedEntry}
					level={level + 1}
				/>
			{/each}
		</div>
	{/if}
</div>

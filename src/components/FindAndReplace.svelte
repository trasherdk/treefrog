<script>
import {onMount, tick, createEventDispatcher} from "svelte";
import Accel from "components/utils/Accel.svelte";
import Checkbox from "components/utils/Checkbox.svelte";

export let options;
export let findAndReplace;

let fire = createEventDispatcher();

let main;

let {
	replace,
	searchIn,
	find,
	replaceWith,
	regex,
	caseMode,
	word,
	multiline,
	paths,
	searchInSubDirs,
	includePatterns,
	excludePatterns,
} = options;

let smartCase = caseMode === "smart";
let matchCase = caseMode === "caseSensitive";

$: options = {
	replace,
	searchIn,
	find,
	replaceWith,
	regex,
	caseMode: smartCase ? "smart" : matchCase ? "caseSensitive" : "caseInsensitive",
	word,
	multiline,
	paths,
	searchInSubDirs,
	includePatterns,
	excludePatterns,
};

//let confirm = false;

let functions = {
	async findAll() {
		console.log(await findAndReplace.findAll(options));
	},
	
	replaceAll(options) {
		return platform.callParentWindow("findAndReplace", "replaceAll", options);
	},
	
	findNext(options) {
		return platform.callParentWindow("findAndReplace", "findNext", options);
	},
	
	findPrevious(options) {
		return platform.callParentWindow("findAndReplace", "findPrevious", options);
	},
	
	replace(options) {
		return platform.callParentWindow("findAndReplace", "replace", options);
	},
};

async function onSetOptions() {
	await tick();
	
	resize();
}

$: onSetOptions(options);

function resize() {
	fire("resize", main.offsetHeight);
}

onMount(function() {
	resize();
});
</script>

<style type="text/scss">
#main {
	display: grid;
	grid-template-columns: 1fr 90px;
	gap: 1em;
	padding: 8px 12px;
}

.inputs {
	display: grid;
	grid-template-columns: auto 1fr;
	grid-auto-rows: min-content;
	align-items: center;
	column-gap: 1em;
	row-gap: 7px;
	
	> label {
		white-space: nowrap;
		grid-column: 1 / 2;
	}
	
	input, select {
		width: 100%;
	}
}

.input {
	grid-column: 2 / 3;
}

.checkboxes {
	display: flex;
	gap: 1em;
}

.spacer {
	grid-column: 1 / 3;
	height: 1em;
}

.actions {
	display: grid;
	grid-auto-rows: min-content;
	gap: .3em;
}

button {
	white-space: nowrap;
}
</style>

<div bind:this={main} id="main">
	<div class="inputs">
		<label for="find">
			<Accel label="Fi%nd"/>
		</label>
		<div class="input">
			<input bind:value={find} id="find" accesskey="n" autofocus>
		</div>
		<label for="replaceWith">
			<Accel label="Rep%lace with"/>
		</label>
		<div class="input">
			<input bind:value={replaceWith} id="replaceWith" accesskey="l">
		</div>
		<div class="input checkboxes">
			<Checkbox bind:checked={regex} label="Rege%x"/>
			<Checkbox bind:checked={smartCase} label="%Smart case"/>
			{#if !smartCase}
				<Checkbox bind:checked={matchCase} label="Match %case"/>
			{/if}
			<Checkbox bind:checked={word} label="%Word"/>
			<!--<Checkbox bind:checked={multiline} label="Mul%tiline"/>-->
			<Checkbox bind:checked={replace} label="%Replace"/>
		</div>
		<div class="spacer"></div>
		<label for="searchIn">
			<Accel label="Search %in"/>
		</label>
		<div class="input">
			<select bind:value={searchIn} id="searchIn" accesskey="i">
				<option value="currentDocument">Current document</option>
				<option value="selectedText">Selected text</option>
				<option value="openFiles">Open files</option>
				<option value="files">Files</option>
			</select>
		</div>
		{#if searchIn === "files"}
			<label for="paths">
				<Accel label="%Paths"/>
			</label>
			<div class="input">
				<input bind:value={paths} id="paths" accesskey="p">
			</div>
			<div class="input checkboxes">
				<Checkbox bind:checked={searchInSubDirs} label="Search in su%b directories"/>
			</div>
			<label for="include">
				<Accel label="Incl%ude"/>
			</label>
			<div class="input">
				<input bind:value={includePatterns} id="include" accesskey="u">
			</div>
			<label for="exclude">
				<Accel label="%Exclude"/>
			</label>
			<div class="input">
				<input bind:value={excludePatterns} id="exclude" accesskey="e">
			</div>
		{/if}
	</div>
	<div class="actions">
		{#if searchIn === "files"}
			{#if replace}
				<button on:click={functions.replaceAll}>
					<Accel label="Replace %all"/>
				</button>
				<!--<Checkbox bind:value={confirm} label="Confir%m"/>-->
			{:else}
				<button on:click={functions.findAll}>
					<Accel label="Find %all"/>
				</button>
			{/if}
		{:else}
			{#if replace}
				<button on:click={functions.findNext}>
					<Accel label="%Find next"/>
				</button>
				<button on:click={functions.replace}>
					<Accel label="%Replace"/>
				</button>
				<button on:click={functions.replaceAll}>
					<Accel label="Replace %all"/>
				</button>
			{:else}
				<button on:click={functions.findPrevious}>
					<Accel label="Find pre%vious"/>
				</button>
				<button on:click={functions.findNext}>
					<Accel label="%Find next"/>
				</button>
				<button on:click={functions.findAll}>
					<Accel label="Find %all"/>
				</button>
			{/if}
		{/if}
	</div>
</div>
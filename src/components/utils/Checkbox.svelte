<script>
import getAccessKey from "utils/dom/getAccessKey";
import Accel from "components/utils/Accel.svelte";

export let checked;
export let label;
</script>

<style type="text/scss">
label {
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
	gap: .3em;
}
</style>

<label>
	<input
		bind:checked
		type="checkbox"
		on:change
		accesskey={getAccessKey(label)}
	>
	<Accel {label}/>
</label>

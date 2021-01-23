<svelte:options immutable={true}/>

<script lang="ts">

let width;
let height;

$: console.log(`BG PATTERN ${width} ${height}`)

</script>

<style>

div {
  width: 100%;
  height: 100%;
}

</style>

<div bind:clientWidth={width} bind:clientHeight={height}>
</div>

<svelte:options immutable={true} />

<script lang="ts">
	import Section from '../content/Section.svelte';
</script>

<Section>
	<span slot="title">404</span>
	<span slot="content">
		Uh oh.. looks like something has gone missing.<br />
		Please check the URL and try again.
	</span>
</Section>

<style>
</style>

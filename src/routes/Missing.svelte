<svelte:options immutable={true}/>

<script lang="ts">
	import Layout from '../Layout.svelte';
	import Section from '../content/Section.svelte';
</script>

<style>
</style>

<Layout>

	<Section>
    <span slot="title">404</span>
		<span slot="content">
      Uh oh.. looks like something has gone missing.<br/>
      Please check the URL and try again.
		</span>
	</Section>

</Layout>
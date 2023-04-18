<svelte:options immutable={true} />

<script lang="ts">
	import { onMount } from 'svelte';
	import Background from '../background/Background.svelte';

	let documentWidth: number | undefined;
	let documentHeight: number | undefined;

	let mainElement: HTMLElement | undefined;

	let contentWidth: number | undefined;
	let contentHeight: number | undefined;
	let contentTop: number;
	let contentLeft: number;

	function onResize() {
		if (mainElement) {
			contentTop = mainElement.offsetTop;
			contentLeft = mainElement.offsetLeft;
		}
	}

	onMount(onResize);
</script>

<svelte:window on:resize={onResize} />

<div class="document-wrapper" bind:clientWidth={documentWidth} bind:clientHeight={documentHeight}>
	<Background
		{documentWidth}
		{documentHeight}
		{contentWidth}
		{contentHeight}
		{contentTop}
		{contentLeft}
	/>

	<div class="content-wrapper">
		<main bind:clientWidth={contentWidth} bind:clientHeight={contentHeight} bind:this={mainElement}>
			<slot />
		</main>

		<div class="view-source">
			<a href="https://github.com/maximilianhurl/maxhurl-site"> View Source </a>
		</div>
	</div>
</div>

<style>
	.document-wrapper {
		min-height: 100vh;
	}

	.content-wrapper {
		padding: 140px 0 20px 180px;
		max-width: 600px;
	}

	@media print {
		.content-wrapper {
			padding: 0;
			max-width: none;
		}
	}

	main {
		padding: 0 20px;
	}

	.view-source {
		display: block;
		margin-top: 120px;
		text-align: center;
		position: relative;
		width: 100%;
		z-index: 100;
	}

	.view-source a {
		color: #9c9fa0;
		font-size: 12px;
	}

	.view-source a:hover {
		color: #555656;
	}

	@media only screen and (max-width: 1000px) {
		.content-wrapper {
			padding: 140px 20px 20px 20px;
		}
	}
</style>

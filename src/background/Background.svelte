<svelte:options immutable={true} />

<script lang="ts">
	import BackgroundTile from './BackgroundTile.svelte';

	// vars for storing page and content size

	export let documentWidth: number | undefined = 0;
	export let documentHeight: number | undefined = 0;

	export let contentWidth = 0;
	export let contentHeight = 0;
	export let contentLeft = 0;
	export let contentTop = 0;

	// calculate number of tiles needed to cover page

	const tileWidth = 895;
	const tileHeight = 530;

	let tileRowCount = 0;
	let tileColumnCount = 0;

	$: if (documentWidth && documentHeight) {
		tileColumnCount = Math.ceil(documentWidth / tileHeight);
		tileRowCount = Math.ceil(documentHeight / tileHeight);
	}

	// funcs for calculating tile offsets

	function calculateXOffset(columnIndex: number): number {
		return columnIndex * tileWidth;
	}

	function calculateYOffset(rowIndex: number): number {
		return rowIndex * tileHeight;
	}

	// compute bounding box of content - with a bit of padding added on
	$: contentPos = {
		topLeftX: contentLeft - 10,
		topLeftY: contentTop - 20,
		bottomRightX: contentLeft + contentWidth - 15,
		bottomRightY: contentTop + contentHeight
	};
</script>

<svg xmlns="http://www.w3.org/2000/svg">
	{#each Array(tileRowCount) as _, rowIndex}
		{#each Array(tileColumnCount) as _, columnIndex}
			<BackgroundTile
				xPosOffset={calculateXOffset(columnIndex)}
				yPosOffset={calculateYOffset(rowIndex)}
				{contentPos}
				{documentWidth}
				{documentHeight}
			/>
		{/each}
	{/each}
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>

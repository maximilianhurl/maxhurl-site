<svelte:options immutable={true} />

<h2>
	<slot name="title" />
</h2>

<slot name="content" />

<style>
	h2 {
		font-size: 22px;
		line-height: 20px;
		margin: 46px 0 0 0;
	}

	@media print {
		h2 {
			margin: 23px 0 0 0;
		}
	}

	h2::after {
		background-color: #8ceaa6;
		content: ' ';
		display: block;
		height: 4px;
		margin: 18px 0 20px 0;
		width: 100%;
	}
</style>

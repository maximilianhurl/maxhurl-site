<svelte:options immutable={true} />

<div>
	<h4>
		<slot name="title" />
	</h4>
	<p>
		<slot name="date" />
	</p>
</div>

<style>
	div {
		display: flex;
		justify-content: space-between;
	}

	h4 {
		margin: 0;
	}

	p {
		font-style: italic;
		margin: 0;
	}

	@media only screen and (max-width: 700px) {
		div {
			flex-direction: column;
		}
	}
</style>

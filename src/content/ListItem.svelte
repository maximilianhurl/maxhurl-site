<svelte:options immutable={true} />

<li>
	<slot />
</li>

<style>
	li {
		list-style: none;
		padding-left: 20px;
	}

	li::before {
		content: '+';
		color: #8ceaa6;
		display: inline-block;
		font-family: 'poppinsbold', sans-serif;
		font-weight: bold;
		margin-left: -20px;
		width: 20px;
	}
</style>

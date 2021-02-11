<svelte:options immutable={true}/>

<style>
	li {
		list-style: none;
	}

	li:before {
		content: "+";
		color: #8CEAA6;
		display: inline-block;
		font-family: 'poppinsbold', sans-serif;
		font-weight: bold;
		width: 20px;
	}
</style>

<li>
  <slot></slot>
</li>

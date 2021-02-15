<svelte:options immutable={true}/>

<style>
	li {
		list-style: none;
		padding-left: 20px;
	}

	li:before {
		content: "+";
		color: #8CEAA6;
		display: inline-block;
		font-family: 'poppinsbold', sans-serif;
		font-weight: bold;
		margin-left: -20px;
		width: 20px;
	}
</style>

<li>
  <slot></slot>
</li>

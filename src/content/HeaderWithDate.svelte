<svelte:options immutable={true}/>

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
</style>

<div>
  <h4>
    <slot name="title"></slot>
  </h4>
  <p>
    <slot name="date"></slot>
  </p>
</div>

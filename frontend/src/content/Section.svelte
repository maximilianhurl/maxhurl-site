<svelte:options immutable={true}/>

<style>
  h2 {
    font-size: 22px;
    line-height: 20px;
    margin: 46px 0 0 0;
  }

  h2::after {
    background-color: #8CEAA6;
    content: " ";
    display: block;
    height: 4px;
    margin:18px 0 20px 0;
    width: 100%;
  }
</style>

<h2>
  <slot name="title"></slot>
</h2>

<p>
  <slot name="content"></slot>
</p>

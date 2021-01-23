<svelte:options immutable={true}/>

<script lang="ts">

import BackgroundPattern from './BackgroundPattern.svelte';

let windowScrollY;

$: console.log(windowScrollY);

</script>

<style>
  .wrapper {
    display: flex;
  }

  .wrapper div {
    background: green;
    min-width: 300px;
  }

  .wrapper div:last-child {
    flex-grow: 10;
  }

  .content-vertical-padding {
    height: 60px;
  }

  main {
    background-color: red;
    display: block;
    margin: 0 auto;
    height: 2000px;
		width: 300px;
  }
</style>

<svelte:window
  bind:scrollY={windowScrollY}
/>

<div class="wrapper">
  <div>
    <BackgroundPattern />
  </div>

  <div>
    <div class="content-vertical-padding">
      <BackgroundPattern />
    </div>

    <main>
      <slot></slot>
    </main>

    <div class="content-vertical-padding">
      <BackgroundPattern />
    </div>
  </div>

  <div>
    <BackgroundPattern />
  </div>
</div>

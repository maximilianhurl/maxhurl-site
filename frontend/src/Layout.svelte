<svelte:options immutable={true}/>

<script lang="ts">
  import BackgroundPattern from './background/BackgroundPattern.svelte';

  let windowScrollY;

  $: console.log(windowScrollY);
</script>

<style>
  .wrapper {
    display: flex;
  }

  .wrapper div:first-child {
    min-width: 200px;
  }

  .wrapper div:last-child {
    flex-grow: 10;
  }

  .content-vertical-padding {
    height: 140px;
  }

  main {
    display: block;
    margin: 0 auto;
		max-width: 600px;
  }

  .view-source {
    bottom: 20px;
    color: #9C9FA0;
    cursor: pointer;
    font-size: 12px;
    position: absolute;
    text-align: center;
    width: 100%;
    z-index: 100;
  }

  .view-source:hover {
    color: #555656;
  }

  @media only screen and (max-width: 1000px) {
    .wrapper div:first-child {
      min-width: 40px;
    }

     .wrapper div:last-child {
      min-width: 40px;
    }
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
      <BackgroundPattern>
        <a class="view-source" href="https://github.com/maximilianhurl/maxhurl-site">
        View Source
        </a>
      </BackgroundPattern>
    </div>
  </div>

  <div>
    <BackgroundPattern />
  </div>
</div>

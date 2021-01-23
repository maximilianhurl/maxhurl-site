<svelte:options immutable={true}/>

<script lang="ts">
  import { isEven } from './utils';

  export let rowIndex: number;
  export let triangleRow: string[];

  const fillColors = isEven(rowIndex)
    ? ["#304349", "#587680", "#E3E8EE", "#F7F0F7"]
    : ["#E3E8EE", "#F7F0F7", "#304349", "#587680"]

  function getColor(index: number) {
    if (index > 20 && index <  60) {
      return "white";
    }
    return fillColors[index % 4]
  }
</script>

<style>

</style>

{#each triangleRow as trianglePoint, index}
  <polygon points={trianglePoint} style="fill:{getColor(index)}" />
{/each}
<svelte:options immutable={true}/>

<script lang="ts">
  import { ColorScheme } from './types';

  export let fill: ColorScheme = ColorScheme.blue;
  export let width = 9;
  export let xPos = 0;
  export let yPos = 0;
</script>

<g transform="translate({xPos},{yPos})">
  <circle cx={width/2} cy={width/2} r={width/2} fill={fill}/>
</g>

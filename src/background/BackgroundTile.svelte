<svelte:options immutable={true}/>

<script lang="ts">
  import { shapesConfig } from './shapeConfig';

  interface ContentPos {
    topLeftX: number
    topLeftY: number
    bottomRightX: number
    bottomRightY: number
  }

  export let xPosOffset = 0;
  export let yPosOffset = 0;

  export let documentWidth: number;
  export let documentHeight: number;

  export let contentPos: ContentPos;

  $: filteredShapes = shapesConfig.map((shape) => {
    // update shape positions to account for tile offsets
    return {
      ...shape,
      xPos: shape.xPos + xPosOffset,
      yPos: shape.yPos + yPosOffset
    }
  }).filter((shape) => {
    // ensure no shapes overlap content
    if (
      (
        shape.xPos > contentPos.topLeftX &&
        shape.yPos > contentPos.topLeftY &&
        shape.xPos < contentPos.bottomRightX &&
        shape.yPos < contentPos.bottomRightY
      )
      || shape.yPos > documentHeight
      || shape.xPos > documentWidth
    ) {
      return false
    }
    return true
  })
</script>

{#each filteredShapes as shape (shape)}
	<svelte:component
    this={shape.component}
    xPos={shape.xPos}
    yPos={shape.yPos}
    fill={shape.fill}
    width={shape.width}
    rotation={shape.rotation}
  />
{/each}
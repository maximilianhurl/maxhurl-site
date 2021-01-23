<svelte:options immutable={true}/>

<script lang="ts">

  import TriangleRow from './TriangleRow.svelte';
  import { isEven } from './utils';

  /* ============================================================================================
  Ideas:

  - Use store to animate the colors?
    - use https://svelte.dev/docs#tweened with custom interploation when valuee in store changes
    - need to figure out how to do animations on the store
      - maybe using easing to apply them?
  - Use groups in the svg to animate colors?

  */

  export let size = 40; // size of triangles - width and height are the same

  let windowWidth = 0;
  let windowHeight = 0;
  let windowScrollY = 0;

  // calculate number of triangles in each row (row length) and number of rows
  // use half size as
  // add half size to width as we want the first & last triangles to only show half on screen
  // first triangle is accounted for when generating triangle points
  $: rowLength = Math.ceil((windowWidth + (size / 2)) / (size / 2));
  $: numberOfRows = Math.ceil(windowHeight / size);

  // $: triangleCount = rowLength * numberOfRows;

  // $: trianglePoints = Array(triangleCount || 1).fill('').map((_, index) => {
  //   const rowNumber = Math.floor(index / rowLength);
  //   const rowIndex = index % rowLength;

  //   let isFacingDown = isEven(rowNumber)
  //     ? isEven(rowIndex)
  //     : !isEven(rowIndex);


  //   // start with upper left point
  //   const baseX = rowIndex * (size / 2) - (size / 2);
  //   const baseY = rowNumber * size;

  //   if (isFacingDown) {
  //     const point1 = `${baseX},${baseY}`;
  //     const point2 = `${baseX + size},${baseY}`;
  //     const point3 = `${baseX + (size / 2)},${baseY + size}`;

  //     return `${point1} ${point2} ${point3}`;
  //   } else {
  //     const point1 = `${baseX},${baseY + size}`;
  //     const point2 = `${baseX + (size / 2)},${baseY}`;
  //     const point3 = `${baseX + size},${baseY + size}`;

  //     return `${point1} ${point2} ${point3}`;
  //   }
  // });

  $: triangleRows = Array(numberOfRows || 1).fill('').map((_, rowNumber) => {
    return Array(rowLength || 1).fill('').map((_, rowIndex) => {
      let isFacingDown = isEven(rowNumber)
        ? isEven(rowIndex)
        : !isEven(rowIndex);

      // start with upper left point
      const baseX = rowIndex * (size / 2) - (size / 2);
      const baseY = rowNumber * size;

      if (isFacingDown) {
        const point1 = `${baseX},${baseY}`;
        const point2 = `${baseX + size},${baseY}`;
        const point3 = `${baseX + (size / 2)},${baseY + size}`;

        return `${point1} ${point2} ${point3}`;
      } else {
        const point1 = `${baseX},${baseY + size}`;
        const point2 = `${baseX + (size / 2)},${baseY}`;
        const point3 = `${baseX + size},${baseY + size}`;

        return `${point1} ${point2} ${point3}`;
      }
    });
  });
</script>

<style>
  svg {
    display: block;
		width: 100%;
    height: 100%;
  }
</style>

<svelte:window
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  bind:scrollY={windowScrollY}
/>

<svg>
  {#each triangleRows as triangleRow, index}
		<TriangleRow triangleRow={triangleRow} rowIndex={index} />
	{/each}
</svg>

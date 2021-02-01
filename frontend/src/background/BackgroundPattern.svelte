<svelte:options immutable={true}/>

<script lang="ts">
  import Circle from './shapes/Circle.svelte';
  import Cross from './shapes/Cross.svelte';
  import CircleWithHole from './shapes/CircleWithHole.svelte';
  import DoubleCircle from './shapes/DoubleCircle.svelte';
  import HalfCircle from './shapes/HalfCircle.svelte';
  import Snake from './shapes/Snake.svelte';
  import Triangle from './shapes/Triangle.svelte';
  import Zigzag from './shapes/Zigzag.svelte';

  import { ColorScheme } from './shapes/types';

  let width;
  let height;
</script>

<style>

  div {
    width: 100%;
    height: 100%;
  }

  svg {
    position: absolute;
  }

</style>

<div bind:clientWidth={width} bind:clientHeight={height}>
  <slot></slot>
  <svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
    <Circle xPos={12} yPos={20} fill={ColorScheme.blue}/>
    <Circle xPos={22} yPos={60} width={14} fill={ColorScheme.yellow}/>
    <Cross xPos={0} yPos={200} fill={ColorScheme.blue}/>
    <CircleWithHole xPos={11} yPos={128} fill={ColorScheme.orange} />
    <Circle xPos={15} yPos={285} width={14} fill={ColorScheme.lightGrey}/>
    <Circle xPos={22} yPos={382} width={10} fill={ColorScheme.pink}/>
    <Cross xPos={9} yPos={439} rotation="45" fill={ColorScheme.pink}/>
    <Circle xPos={34} yPos={506} fill={ColorScheme.blue}/>
    <Cross xPos={78} yPos={30} rotation="45" fill={ColorScheme.darkGrey}/>
    <Circle xPos={63} yPos={225} fill={ColorScheme.pink}/>
    <Snake xPos={53} yPos={270} rotation="right" fill={ColorScheme.blue}/>
    <Triangle xPos={83} yPos={400} rotation="left" fill={ColorScheme.green}/>
    <Circle xPos={120} yPos={498} width={14} fill={ColorScheme.lightGrey}/>
    <Circle xPos={135} yPos={17} width={8} fill={ColorScheme.pink}/>
    <Circle xPos={126} yPos={78} width={8} fill={ColorScheme.lightGrey}/>
    <HalfCircle xPos={89} yPos={127} rotation="bottomRight" fill={ColorScheme.blue}/>
    <Zigzag xPos={112} yPos={214} rotation="left" fill={ColorScheme.darkGrey}/>
    <DoubleCircle xPos={123} yPos={317} fill={ColorScheme.yellow}/>
    <Circle xPos={156} yPos={431} width={8} fill={ColorScheme.green}/>
    <Circle xPos={120} yPos={498} width={14} fill={ColorScheme.lightGrey}/>
    <Circle xPos={199} yPos={12} width={14} fill={ColorScheme.lightGrey}/>
    <Snake xPos={175} yPos={51} rotation="left" fill={ColorScheme.orange}/>
    <Cross xPos={185} yPos={139} fill={ColorScheme.darkGrey}/>
    <Circle xPos={163} yPos={188} width={8} fill={ColorScheme.green}/>
    <Circle xPos={188} yPos={277} width={8} fill={ColorScheme.pink}/>
    <HalfCircle xPos={184} yPos={372} rotation="bottomLeft" fill={ColorScheme.orange}/>
    <Zigzag xPos={193} yPos={473} rotation="left" fill={ColorScheme.lightGrey}/>
    <Circle xPos={252} yPos={0} width={8} fill={ColorScheme.green}/>
    <HalfCircle xPos={270} yPos={29} rotation="bottomLeft" fill={ColorScheme.green}/>
    <Circle xPos={213} yPos={213} width={14} fill={ColorScheme.lightGrey}/>
    <DoubleCircle xPos={249} yPos={129} fill={ColorScheme.pink}/>
    <HalfCircle xPos={271} yPos={213} rotation="topRight" fill={ColorScheme.orange}/>
    <Cross xPos={232} yPos={313} fill={ColorScheme.green}/>
    <Circle xPos={257} yPos={427} width={8} fill={ColorScheme.pink}/>
    <Circle xPos={311} yPos={282} width={8} fill={ColorScheme.blue}/>
    <Circle xPos={287} yPos={337} width={14} fill={ColorScheme.lightGrey}/>
    <Cross xPos={311} yPos={397} fill={ColorScheme.darkGrey}/>
    <Snake xPos={306} yPos={460} rotation="right" fill={ColorScheme.green}/>
    <Circle xPos={352} yPos={37} width={8} fill={ColorScheme.blue}/>
    <Circle xPos={330} yPos={102} width={8} fill={ColorScheme.pink}/>
    <Cross xPos={324} yPos={182} rotation="45" fill={ColorScheme.darkGrey}/>
    <DoubleCircle xPos={346} yPos={302} rotation="topRight" fill={ColorScheme.green}/>
    <Snake xPos={375} yPos={391} rotation="left" fill={ColorScheme.blue}/>
    <Cross xPos={401} yPos={480} fill={ColorScheme.orange}/>
    <DoubleCircle xPos={400} yPos={1} rotation="topRight" fill={ColorScheme.yellow}/>
    <Cross xPos={404} yPos={79} fill={ColorScheme.blue}/>
    <Triangle xPos={379} yPos={141} rotation="right" fill={ColorScheme.lightGrey}/>
    <Circle xPos={379} yPos={239} width={14} fill={ColorScheme.lightGrey}/>
    <Cross xPos={492} yPos={26} fill={ColorScheme.orange}/>
    <Snake xPos={471} yPos={80} rotation="left" fill={ColorScheme.blue}/>
    <Circle xPos={458} yPos={166} width={8} fill={ColorScheme.green}/>
    <Zigzag xPos={420} yPos={243} rotation="right" fill={ColorScheme.lightGrey}/>
    <Circle xPos={450} yPos={333} width={14} fill={ColorScheme.lightGrey}/>
    <Circle xPos={420} yPos={372} width={8} fill={ColorScheme.green}/>
    <Cross xPos={479} yPos={395} fill={ColorScheme.blue}/>
    <Circle xPos={455} yPos={451} width={8} fill={ColorScheme.pink}/>
    <DoubleCircle xPos={492} yPos={484} rotation="bottomLeft" fill={ColorScheme.pink}/>
    <Snake xPos={560} yPos={15} rotation="right" fill={ColorScheme.green}/>
    <Cross xPos={574} yPos={111} fill={ColorScheme.darkGrey}/>
    <DoubleCircle xPos={520} yPos={197} rotation="bottomLeft" fill={ColorScheme.yellow}/>
    <HalfCircle xPos={503} yPos={308} rotation="bottomRight" fill={ColorScheme.orange}/>
    <Circle xPos={600} yPos={167} width={14} fill={ColorScheme.lightGrey}/>
    <HalfCircle xPos={594} yPos={266} rotation="topLeft" fill={ColorScheme.darkGrey}/>
    <Cross xPos={615} yPos={356} rotation="45" fill={ColorScheme.lightGrey}/>
    <DoubleCircle xPos={550} yPos={388} fill={ColorScheme.yellow}/>
    <Circle xPos={559} yPos={464} width={8} fill={ColorScheme.blue}/>
    <DoubleCircle xPos={618} yPos={465} rotation="bottomRight"  fill={ColorScheme.orange}/>
    <Zigzag xPos={651} yPos={13} rotation="left" fill={ColorScheme.darkGrey}/>
    <Circle xPos={634} yPos={78} width={8} fill={ColorScheme.pink}/>
    <HalfCircle xPos={681} yPos={107} rotation="bottomRight" fill={ColorScheme.orange}/>
    <Cross xPos={664} yPos={191} fill={ColorScheme.green}/>
    <Circle xPos={703} yPos={238} width={8} fill={ColorScheme.pink}/>
    <Circle xPos={677} yPos={286} width={14} fill={ColorScheme.blue}/>
    <Cross xPos={700} yPos={370} fill={ColorScheme.darkGrey}/>
    <Snake xPos={680} yPos={420} rotation="left" fill={ColorScheme.darkGrey}/>
    <Circle xPos={699} yPos={507} width={14} fill={ColorScheme.lightGrey}/>
    <Circle xPos={766} yPos={28} width={8} fill={ColorScheme.blue}/>
    <Cross xPos={762} yPos={109} fill={ColorScheme.blue}/>
    <DoubleCircle xPos={740} yPos={180} rotation="bottomRight"  fill={ColorScheme.pink}/>
    <Zigzag xPos={743} yPos={281} rotation="left" fill={ColorScheme.lightGrey}/>
    <Circle xPos={728} yPos={327} width={8} fill={ColorScheme.green}/>
    <HalfCircle xPos={786} yPos={372} rotation="bottomLeft" fill={ColorScheme.orange}/>
    <Circle xPos={796} yPos={448} width={8} fill={ColorScheme.lightGrey}/>
    <Circle xPos={769} yPos={502} width={8} fill={ColorScheme.pink}/>
    <HalfCircle xPos={846} yPos={3} rotation="topRight" fill={ColorScheme.orange}/>
    <DoubleCircle xPos={817} yPos={72} rotation="topRight" fill={ColorScheme.yellow}/>
    <Cross xPos={858} yPos={150} rotation="45" fill={ColorScheme.lightGrey}/>
    <Snake xPos={808} yPos={195} rotation="right" fill={ColorScheme.orange}/>
    <Cross xPos={871} yPos={272} fill={ColorScheme.darkGrey}/>
    <Circle xPos={828} yPos={290} width={8} fill={ColorScheme.pink}/>
    <DoubleCircle xPos={857} yPos={341} rotation="bottomLeft" fill={ColorScheme.green}/>
    <Circle xPos={866} yPos={430} width={14} fill={ColorScheme.yellow}/>
    <Cross xPos={830} yPos={486} rotation="45" fill={ColorScheme.darkGrey}/>
  </svg>
</div>

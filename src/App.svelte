<script>
  import { Router, Route } from "svelte-routing";
  import Home from "./routes/Home.svelte";
	import Missing from "./routes/Missing.svelte";
  import Cv from "./routes/Cv.svelte";

  export let url = "";
</script>

<Router url="{url}">
	<Route path="cv" component="{Cv}" />
	<Route path="CV" component="{Cv}" />
	<Route path="/">
		<Home />
	</Route>
	<Route path="" component="{Missing}" />
</Router>
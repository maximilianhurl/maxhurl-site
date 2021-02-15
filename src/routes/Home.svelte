<svelte:options immutable={true}/>

<script lang="ts">
	import Layout from '../Layout.svelte';
	import List from '../content/List.svelte';
	import ListItem from '../content/ListItem.svelte';
	import Title from '../content/Title.svelte';
	import Section from '../content/Section.svelte';
</script>

<Layout>
	<Title />

	<Section>
		<span slot="title">About</span>
		<span slot="content">
			<p>
				I’m a full-stack web developer based in Brighton, with 10 years experience
				taking projects from initial requirements through to finished product.
				I enjoy leading other developers and fostering collaboration across the
				team. I’m a firm believer in agile development and always excited to
				learn new technologies
			</p>
		</span>
	</Section>

	<Section>
		<span slot="title">Key technologies</span>
		<span slot="content">
			<List>
				<ListItem>Python - Django</ListItem>
				<ListItem>Javascript - React, Typescript</ListItem>
				<ListItem>Relational and noSQL databases</ListItem>
				<ListItem>Hybrid mobile apps</ListItem>
				<ListItem>Golang</ListItem>
			</List>
		</span>
	</Section>

	<Section>
		<span slot="title">Contact</span>
		<span slot="content">
			<List>
				<ListItem>
					<a href="mailto:max@maxhurl.co.uk">max@maxhurl.co.uk</a>
				</ListItem>
				<ListItem>
					<a href="https://github.com/maximilianhurl">github.com/maximilianhurl</a>
				</ListItem>
				<ListItem>
					<a href="https://www.linkedin.com/in/maxhurl/">linkedin.com/in/maxhurl</a>
				</ListItem>
			</List>
		</span>
	</Section>

</Layout>
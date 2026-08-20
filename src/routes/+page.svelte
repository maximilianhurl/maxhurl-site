<svelte:options immutable={true} />

<script lang="ts">
	import List from '../content/List.svelte';
	import ListItem from '../content/ListItem.svelte';
	import Title from '../content/Title.svelte';
	import Section from '../content/Section.svelte';
</script>

<Title />

<Section>
	<span slot="title">About</span>
	<span slot="content">
		<p>
			Full-stack developer based in Brighton with 10+ years of experience across the full product lifecycle; from initial requirements through to production and beyond. I care about building things well and work best in collaborative, technically driven teams. I'm comfortable mentoring developers and facilitating good decisions. I work extensively with AI driven development workflows as a core part of how I build.
		</p>
	</span>
</Section>

<Section>
	<span slot="title">Key technologies</span>
	<span slot="content">
		<List>
			<ListItem>Javascript - React & Typescript</ListItem>
			<ListItem>Golang</ListItem>
			<ListItem>Python</ListItem>
			<ListItem>APIs - REST, gRPC, GraphQL</ListItem>
			<ListItem>AI driven code workflows</ListItem>
			<ListItem>SQL DBs - Postgres, ClickHouse</ListItem>
			<ListItem>NoSQL DBs - Redis, Dynamo</ListItem>
			<ListItem>AWS Experience</ListItem>
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

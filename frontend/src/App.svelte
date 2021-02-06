<svelte:options immutable={true}/>

<script lang="ts">
	import Layout from './Layout.svelte';
	import Title from './content/Title.svelte';
	import Section from './content/Section.svelte';
</script>

<style>
  ul {
		padding: 0;
	}

	li {
		list-style: none;
	}

	li:before {
		content: "+";
		color: #8CEAA6;
		display: inline-block;
		font-family: 'poppinsbold', sans-serif;
		font-weight: bold;
		width: 20px;
	}
</style>

<Layout>
	<Title />

	<Section>
		<span slot="title">About</span>
		<span slot="content">
			I’m a full-stack web developer based in Brighton, with 10 years experience
			taking projects from initial requirements through to finished product.<br/>
			I enjoy leading other developers and fostering collaboration across the
			team. I’m a firm believer in agile development and always excited to
			learn new technologies
		</span>
	</Section>

	<Section>
		<span slot="title">Key technologies</span>
		<span slot="content">
			<ul>
				<li>Python - Django</li>
				<li>Javascript - React, Typescript</li>
				<li>Relational and noSQL databases</li>
				<li>Hybrid mobile apps</li>
				<li>Golang</li>
			</ul>
		</span>
	</Section>

	<Section>
		<span slot="title">Contact</span>
		<span slot="content">
			<ul>
				<li><a href="mailto:max@maxhurl.co.uk">max@maxhurl.co.uk</a></li>
				<li><a href="https://github.com/maximilianhurl">github.com/maximilianhurl</a></li>
				<li><a href="https://www.linkedin.com/in/maxhurl/">linkedin.com/in/maxhurl</a></li>
			</ul>
		</span>
	</Section>

</Layout>
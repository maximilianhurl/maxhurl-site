<svelte:options immutable={true} />

<script lang="ts">
	import HeaderWithDate from '../../content/HeaderWithDate.svelte';
	import List from '../../content/List.svelte';
	import ListItem from '../../content/ListItem.svelte';
	import Title from '../../content/Title.svelte';
	import Section from '../../content/Section.svelte';
</script>

<Title />

<Section>
	<span slot="title">About</span>
	<span slot="content">
		<p>
			Full-stack developer based in Brighton with 10+ years of experience across the full product
			lifecycle; from initial requirements through to production and beyond. I care about building
			things well and work best in collaborative, technically driven teams. I'm comfortable
			mentoring developers and facilitating good decisions. I work extensively with AI driven
			development workflows as a core part of how I build.
		</p>
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

<Section>
	<span slot="title">Key technologies</span>
	<span slot="content">
		<div class="side-by-side-list">
			<List>
				<ListItem>Javascript - React & Typescript</ListItem>
				<ListItem>Golang</ListItem>
				<ListItem>Python</ListItem>
				<ListItem>APIs - REST, gRPC, GraphQL</ListItem>
			</List>
			<List>
				<ListItem>AI driven code workflows</ListItem>
				<ListItem>SQL DBs - Postgres, ClickHouse</ListItem>
				<ListItem>NoSQL DBs - Redis, Dynamo</ListItem>
				<ListItem>AWS Experience</ListItem>
			</List>
		</div>
	</span>
</Section>

<Section>
	<span slot="title">Experience</span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Crash Override - Senior Developer</span>
			<span slot="date">December 2023 - Present</span>
		</HeaderWithDate>
		<p>
			Built the data ingestion service for a code observability platform. Aggregating data from
			multiple sources including chalk reports, SCM data and cloud platform scanning, transforming
			them into insights served via a TypeScript web platform. Later migrated the data layer from
			PostgreSQL to ClickHouse to improve scalability.
		</p>
	</span>
</Section>

<Section>
	<span slot="title"></span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Simpplr - Lead Software Engineer</span>
			<span slot="date">September 2021 - December 2023</span>
		</HeaderWithDate>
		<p>
			Joined as Senior Engineer to build a drag-and-drop email newsletter builder with analytics as
			a paid add-on to the core intranet platform. Promoted to Team Lead (April 2022) and led a team
			of 6 engineers through full product launch, reaching $1m ARR.
		</p>
	</span>
</Section>

<Section>
	<span slot="title"></span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Futrli - Engineering Team Lead</span>
			<span slot="date">December 2018 - September 2021</span>
		</HeaderWithDate>
		<p>
			I led the team building the platform's flagship feature, a real-time cash flow forecasting
			tool, contributing a large chunk of the MVP myself while owning sprint planning and technical
			direction. Futrli was subsequently acquired by Sage.
		</p>
	</span>
</Section>

<Section>
	<span slot="title"></span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Airfinity - Senior Product Engineer</span>
			<span slot="date">January 2018 - December 2018</span>
		</HeaderWithDate>
		<p>
			As a full-stack engineer I contributed to all levels of the tech stack. From the ETL layer
			through to the data warehouse, internal API layer and down to the frontend web application.
		</p>
	</span>
</Section>

<Section>
	<span slot="title"></span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">DabApps - Engineer</span>
			<span slot="date">July 2012 - January 2018</span>
		</HeaderWithDate>
		<p>
			Joined straight from university as a junior developer at a digital agency, growing over 5
			years into a senior role leading long running client projects across web and mobile. Worked
			across the full project lifecycle; from initial client discussions through architecture,
			deployment and large scale refactoring years later.
		</p>
	</span>
</Section>

<Section>
	<span slot="title"></span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Freelance development</span>
			<span slot="date">2010 - 2017</span>
		</HeaderWithDate>
		<p>
			Moonlighting on a range of projects mostly small scale CMS driven sites using Python and
			Wordpress.
		</p>
	</span>
</Section>

<Section>
	<span slot="title">Education</span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Brighton University</span>
			<span slot="date">Sept 2009 - Jun 2012</span>
		</HeaderWithDate>
		<p>BSc Digital Media Development - 1st</p>
	</span>
</Section>

<Section>
	<span slot="title">Interests</span>
	<span slot="content">
		<p>
			Outside of my work I’m a semi-keen runner, an avid film fan and always enjoy a good <a
				href="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif">cat GIF</a
			>.
		</p>
	</span>
</Section>

<style>
	a {
		margin-top: 10px;
	}

	.side-by-side-list {
		display: flex;
		column-gap: 50px;
	}
</style>

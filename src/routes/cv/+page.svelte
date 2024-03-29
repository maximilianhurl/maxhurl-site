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
			I’m a full-stack web developer based in Brighton, with 10 years experience taking projects
			from initial requirements through to finished product. I enjoy leading other developers and
			fostering collaboration. I’m a firm believer in agile development and always excited to learn
			new technologies and methodologies.
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
				<ListItem>Python - Django</ListItem>
				<ListItem>Javascript - React & Typescript</ListItem>
				<ListItem>Golang</ListItem>
				<ListItem>Creating & integrating with APIs</ListItem>
			</List>
			<List>
				<ListItem>Unit, integration and E2E testing</ListItem>
				<ListItem>Relational and noSQL DBs</ListItem>
				<ListItem>Cloud Infrastructure</ListItem>
				<ListItem>Microservices</ListItem>
			</List>
		</div>
	</span>
</Section>

<Section>
	<span slot="title">Experience</span>
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Simpplr - Lead Software Engineer</span>
			<span slot="date">Dec 2018 - Present</span>
		</HeaderWithDate>
		<p>
			I started at Simpplr as a Senior engineer working on a paid add-on to the core platform. I
			helped prepare it for beta by setting up infrastructure, CI, improving scalability, among
			other things. I then took over as team lead in April 2022 and led a successful full product
			launch (and multiple new feature releases since).
		</p>
	</span>
</Section>

<Section>
	<span slot="title" />
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Futrli - Engineering Team Lead</span>
			<span slot="date">Dec 2018 - Sept 2021</span>
		</HeaderWithDate>
		<p>
			I led a team building the key selling point of the new platform, a real time cash flow
			forecasting tool. As part of my role I built a large portion of the initial MVP, led planning,
			facilitated discussions and helped set technical direction for the team.
		</p>
	</span>
</Section>

<Section>
	<span slot="title" />
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">Airfinity - Senior Product Engineer</span>
			<span slot="date">Jan 2018 - Dec 2018</span>
		</HeaderWithDate>
		<p>
			As a full-stack engineer I contributed to all levels of the tech stack. From the ETL layer
			through to the data warehouse, internal API layer and down to the frontend web application. I
			also championed and implemented a gradual move to a React driven SPA while helping upskill my
			colleagues along the way.
		</p>
	</span>
</Section>

<Section>
	<span slot="title" />
	<span slot="content">
		<HeaderWithDate>
			<span slot="title">DabApps - Engineer</span>
			<span slot="date">Jul 2012 - Jan 2018</span>
		</HeaderWithDate>
		<p>
			During my time at DabApps I was involved with projects at every step of the development
			process; from initial discussions with clients through to architecture planning, deployment
			and large scale refactoring multiple years later.
		</p>
	</span>
</Section>

<Section>
	<span slot="title" />
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

<!DOCTYPE html>
<html>
<head>
	<title>eBirdsearch.org</title>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
	<link href="resources/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/theme.bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/styles.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/mobile.css" rel="stylesheet" type="text/css" />
	<script src="resources/js/html5shiv.js"></script>
	<script src="resources/js/moment.min.js"></script>
	<script src="resources/js/jquery.min.js"></script>
	<script src="resources/js/jquery.tablesorter.min.js"></script>
	<script src="resources/js/jquery.tablesorter.widgets.js"></script>
	<script src="resources/js/jquery.simplemodal.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places"></script>
	<script src="resources/js/manager.js"></script>
	<script src="resources/js/map.js"></script>
</head>

<body data-serverdatetime="<?php echo date('U'); ?>">

	<header id="topBar">
		<h1>eBird<span>search</span>.org</h1>
		<ul>
			<li><a href="#" id="aboutLink">About</a></li>
			<li><a href="#" id="contactLink">Contact</a></li>
			<li><a href="http://ebird.org">eBird.org</a></li>
		</ul>
	</header>

	<section id="sidebar">
		<div id="searchOptions" class="sidebarSection">
			<input type="text" id="searchTextField" />
			<!--
			<label for="resultType">Result type:</label>
			<select id="resultType">
				<option value="all">All reported sightings</option>
				<option value="notable">Notable species</option>
			</select>
			-->

			<div id="specificSpeciesSection"></div>

			<label for="observationRecency">Show observations made within last:</label>
			<select id="observationRecency">
				<option value="1">1 day</option>
				<option value="2">2 days</option>
				<option value="3">3 days</option>
				<option value="4">4 days</option>
				<option value="5">5 days</option>
				<option value="6">6 days</option>
				<option value="7" selected="selected">7 days</option>
				<option value="10">10 days</option>
				<option value="15">15 days</option>
				<option value="20">20 days</option>
				<option value="25">25 days</option>
				<option value="30">30 days</option>
			</select>
			<span id="loadingSpinner"></span>
		</div>
		<div id="messageBar"></div>
		<div id="searchResults" class="sidebarSection hidden"></div>
	</section>

	<section id="mainPanel">
		<ul id="panelTabs">
			<li id="mapTab" class="selected">Map</li>
			<li id="locationsTab" class="hidden disabled">Locations</li>
			<li id="birdSpeciesTab" class="disabled">Bird Species</li>
		</ul>
		<div id="panelContent">
			<div id="mapTabContent"></div>
			<div id="birdSpeciesTabContent" class="hidden">
				<div id="birdSpeciesTable"></div>
			</div>
		</div>
	</section>

	<footer>
		<span><a href="https://github.com/benkeen/eBirdAdvancedSearch">v1.0.1</a></span>
		This site is not affiliated with <a href="http://ebird.org" target="_blank">eBird</a>.
	</footer>

	<div class="hidden">
		<div id="about">
			<h2>About eBirdsearch.org</h2>
			<p>
				I created eBirdsearch.org to fill what I regard as a rather conspicuous gap in the functionality of the amazing 
				<a href="http://ebird.org" target="_blank">eBird.org</a> site.
			</p>
			<p>
				If you haven't discovered eBird yet, do so now. It's an incredible resource and tool for birders, ornithologists, educators - 
				anyone interested in birds. Birders around the world submit millions of observations a year to eBird, providing a wealth of
				information for viewing and analysis. The more people use it, the better it becomes.
			</p>
			<p>
				The problem is, the search functionality currently available through eBird is fairly limited. As a birder, I wanted a clear 
				and high-level overview of a region: where are the popular hotspots? What locations yield the most birds? Which are most 
				common? This site attempts to help plug that gap.
			</p>
			<p>
				All the code for this site is open source and <a href="https://github.com/benkeen/eBirdAdvancedSearch" target="_blank">free for 
				anyone to download and play with</a>. I've endeavoured to keep the number of data requests to eBird's site to a minimum
				so it doesn't put too much of a stress on their servers, but if it does, they're entirely within their rights to ask me to 
				take the site down. Hopefully it won't come to that. I very much hope that one day this sort of functionality will be available 
				directly through eBird, but in the meantime I'll try to keep the site up and running.
			</p>
			<p>
				Have fun! 
			</p>
			<p>
				- <a href="http://www.benjaminkeen.com" target="_blank">Ben Keen</a>, March 2013
			</p>
		</div>

		<div id="contact">
			<h2>Contact</h2>

			<p>
				Found a bug? Got an idea on how to improve this site? I'd love to hear from you.
			</p>
			<p>
				Make a comment on <a href="http://www.benjaminkeen.com/ebirdsearch-org/">this post</a>, or email me at 
				<a href="mailto:ben.keen@gmail.com">ben.keen@gmail.com</a>.
			</p>
			<p>
				Thanks!
			</p>
		</div>
	</div>

	<?php @include_once("tracking.php"); ?>

</body>
</html>
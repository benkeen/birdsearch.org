<!DOCTYPE html>
<html>
<head>
	<title>eBird Advanced Search</title>
	<link href="resources/styles.css" rel="stylesheet" type="text/css" />
	<script src="resources/jquery.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places"></script>
	<script src="resources/manager.js"></script>
	<script src="resources/search.js"></script>
	<script src="resources/map.js"></script>
</head>
<body>
	<header id="topBar">
		<input type="text" id="searchTextField" />
		<div id="observationRecencyGroup">
			<label>Show observations made within last:</label>
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
		</div>
		<span id="loadingSpinner"></span>
	</header>

	<section id="sidebar">
		<div class="sidebarSection">
			<div id="numHotspotsFound"><span>0</span> hotspots found</div>
		</div>
		<div class="sidebarSection hidden" id="searchResults"></div>
	</section>

	<section id="mainPanel">
		<ul id="panelTabs">
			<li class="selected">Map</li>
			<li class="disabled">Hotspot Data</li>
			<li id="birdSpeciesTab" class="disabled">Bird Species</li>
		</ul>
		<div id="panelContent">
			<div id="mapCanvas"></div>
			<div id="dataTable" class="hidden"></div>
		</div>
	</section>
</body>
</html>
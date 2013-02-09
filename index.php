<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<style type="text/css">
	html { 
		height: 100%;
		font-family: "lucida grande";
	}
	body {
		height: 100%;
		margin: 0px;
		padding: 0px;
		font-size: 9pt;
		line-height: 20px;
	}
	#mapCanvas {
		position: absolute;
		top: 40px;
		left: 270px;
	}
	#sidebar {
		position: absolute;
		top: 40px;
		left: 0px;
		width: 270px;
		background-color: #f2f2f2;
	}
	.sidebarSection {
		padding: 10px;
		border-bottom: 1px solid #cccccc;
	}
	#topBar {
		background-color: #333333;
		position: absolute;
		top: 0px;
		width: 100%;
	}
	#searchTextField {
		width: 500px;
		font-size: 16pt;
		margin: 3px;
	}
	#numHotspotsFound {
		color: #999999;
		font-style: italic;
	}
	</style>
	<script src="resources/jquery.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places"></script>
	<script src="resources/search.js"></script>
	<script src="resources/map.js"></script>
</head>
<body>
	<header id="topBar">
		<input type="text" id="searchTextField" />
	</header>

	<section id="sidebar">
		<div class="sidebarSection">
			<label>Show locations with observations reported within last</label>
			<select id="observationRecency">
				<option value="1">1 day</option>
				<option value="2">2 days</option>
				<option value="3">3 days</option>
				<option value="4">4 days</option>
				<option value="5">5 days</option>
				<option value="6">6 days</option>
				<option value="7 days" selected="selected">7 days</option>
				<option value="10">10 days</option>
				<option value="15">15 days</option>
				<option value="20">20 days</option>
				<option value="25">25 days</option>
				<option value="30">30 days</option>
			</select>
		</div>
		<div class="sidebarSection">
			<div id="numHotspotsFound"><span>0</span> hotspots found</div>
		</div>

	</section>
	<section id="mapCanvas"></section>
</body>
</html>
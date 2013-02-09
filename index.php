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
	}
	#mapCanvas { 
		height: 100%;
		width: 100%;
	}
	#topBar {
		background-color: #333333;
		padding: 10px;
		position: absolute;
		top: 0px;
		width: 100%;
		z-index: 10;
	}
	</style>
	<script src="resources/jquery.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places"></script>
	<script src="resources/map.js"></script>
</head>
<body>
	<div id="topBar">
		<input type="text" id="searchTextField" style="width:500px; font-size: 16pt" />
	</div>
	<div id="mapCanvas"></div>
</body>
</html>
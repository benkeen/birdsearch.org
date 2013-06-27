<?php

if (!isset($_POST["lat"]) || empty($_POST["lat"]) ||
	!isset($_POST["lng"]) || empty($_POST["lng"])) {
	exit;
}


$lat = $_POST["lat"];
$lng = $_POST["lng"];

echo getHotspots($lat, $lng);


function getHotspots($lat, $lng) {
	$url = "http://ebird.org/ws1.1/data/obs/geo/recent?lat=$lat&lng=$lng&dist=50&fmt=json";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec($ch);
	curl_close($ch);

	return $response;
}
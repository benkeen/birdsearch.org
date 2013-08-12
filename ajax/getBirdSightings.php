<?php

if (!isset($_POST["lat"]) || empty($_POST["lat"]) ||
	!isset($_POST["lng"]) || empty($_POST["lng"])) {
	exit;
}

$lat = $_POST["lat"];
$lng = $_POST["lng"];
$observationRecency = $_POST["observationRecency"];

echo getBirdObservations($lat, $lng, $observationRecency);


function getBirdObservations($lat, $lng, $recency) {
	$url = "http://ebird.org/ws1.1/data/obs/geo/recent?lat=$lat&lng=$lng&fmt=json&back=$recency&dist=50&hotspot=false";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$json = curl_exec($ch);
	curl_close($ch);

	return $json;
}
<?php

if (!isset($_POST["lat"]) || empty($_POST["lat"]) ||
	!isset($_POST["lng"]) || empty($_POST["lng"])) {
	exit;
}


$lat = $_POST["lat"];
$lng = $_POST["lng"];

echo getHotspotLocations($lat, $lng);


function getHotspotLocations($lat, $lng) {
	$url = "http://ebird.org/ws1.1/ref/hotspot/geo?lat=$lat&lng=$lng&dist=50&fmt=xml";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec($ch);
	curl_close($ch);

	$json = "";
	try {
		$xml = new SimpleXMLElement($response);
		$hotspots = array();
		foreach ($xml->result[0]->location as $hotspotInfo) {
			$hotspots[] = array(
				"i"  => (string) $hotspotInfo->{"loc-id"},
				"n"  => (string) $hotspotInfo->{"loc-name"},
				"la" => (float) $hotspotInfo->lat,
				"lg" => (float) $hotspotInfo->lng
			);
		}
		$json = json_encode($hotspots);
	} catch (Exception $e) {
		$json = "[]";
	}

	return $json;
}
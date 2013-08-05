<?php

if (!isset($_POST["lat"]) || empty($_POST["lat"]) ||
	!isset($_POST["lng"]) || empty($_POST["lng"])) {
	exit;
}


$lat = $_POST["lat"];
$lng = $_POST["lng"];
$limitByObservationRecency = $_POST["limitByObservationRecency"];
$observationRecency = $_POST["observationRecency"];

echo getHotspotLocations($lat, $lng, $limitByObservationRecency, $observationRecency);


function getHotspotLocations($lat, $lng, $limitByObservationRecency, $observationRecency) {
	$url = "http://ebird.org/ws1.1/ref/hotspot/geo?lat=$lat&lng=$lng&dist=50&fmt=xml";

	// optionally filter the results by those hotspots that have had recent observations
	if ($limitByObservationRecency == "true") {
		$url .= "&back=$observationRecency";
	}

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
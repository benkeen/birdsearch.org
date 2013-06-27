<?php

if (!isset($_POST["regionType"]) || empty($_POST["regionType"]) ||
	!isset($_POST["region"]) || empty($_POST["region"])) {
	exit;
}


$regionType = $_POST["regionType"];
$region     = $_POST["region"];
$recency    = $_POST["recency"];

echo getHotspots($regionType, $region, $recency);


function getHotspots($regionType, $region, $recency) {
	$url = "http://ebird.org/ws1.1/ref/hotspot/region?rtype=$regionType&r=$region&fmt=xml&back=$recency";




	// http://ebird.org/ws1.1/data/obs/geo/recent


	// http://ebird.org/ws1.1/ref/hotspot/geo -> be nice...! 50KM radius


	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec($ch);
	curl_close($ch);      

	// no error checking yet...! 
	$xml = new SimpleXMLElement($response);

	$hotspots = array();
	foreach ($xml->result[0]->location as $hotspotInfo) {
		$hotspots[] = array(
			"i"  => (string) $hotspotInfo->{"loc-id"},
			"lt" => (float) $hotspotInfo->lat,
			"lg" => (float) $hotspotInfo->lng,
			"n"  => (string) $hotspotInfo->{"loc-name"}
		);
	}
	return json_encode($hotspots);
}
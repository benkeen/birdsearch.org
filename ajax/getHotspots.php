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
				"lt" => (float) $hotspotInfo->lat,
				"lg" => (float) $hotspotInfo->lng,
				"n"  => (string) $hotspotInfo->{"loc-name"}
			);
		}
		$json = json_encode($hotspots);
	} catch (Exception $e) {
		$json = "[]";
	}

	return $json;
}
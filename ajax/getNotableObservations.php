<?php

if (!isset($_POST["regionType"]) || empty($_POST["regionType"]) ||
	!isset($_POST["region"]) || empty($_POST["region"])) {
	exit;
}

$regionType = $_POST["regionType"];
$region     = $_POST["region"];
$recency    = $_POST["recency"];

echo getNotableObservations($regionType, $region, $recency);

function getNotableObservations($regionType, $region, $recency) {

    $url = "http://ebird.org/ws1.1/data/notable/region/recent?rtype=$regionType&r=$region&fmt=xml&back=$recency";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec($ch);
	curl_close($ch);      

	$json = "";
	try {
		$xml = new SimpleXMLElement($response);
		$sightings = array();
		foreach ($xml->result[0]->sighting as $sightingInfo) {
			$sightings[] = array(
				"i"  => (string) $sightingInfo->{"loc-id"},
				"lt" => (float) $sightingInfo->lat,
				"lg" => (float) $sightingInfo->lng,
				"n"  => (string) $sightingInfo->{"loc-name"},
				"cn"  => (string) $sightingInfo->{"com-name"},
				"sn"  => (string) $sightingInfo->{"sci-name"},
				"or"  => (string) $sightingInfo->{"obs-reviewed"},
				"ov"  => (string) $sightingInfo->{"obs-valid"},
				"od"  => (string) $sightingInfo->{"obs-dt"}
			);
		}
		$json = json_encode($sightings);
	} catch (Exception $e) {
		$json = "[]";
	}

	return $json;
}
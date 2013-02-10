<?php

if (!isset($_POST["locationID"])) {
	exit;
}

// 
echo getHotspotObservations($_POST["locationID"]);


function getHotspotObservations($locationID) {
	$url = "http://ebird.org/ws1.1/data/obs/hotspot/recent?r=$locationID&fmt=xml&back=7";


	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec($ch);
	curl_close($ch);      

	// no error checking yet...! 
	$xml = new SimpleXMLElement($response);

	$observations = array();
	foreach ($xml->result[0]->sighting as $observationInfo) {
		$observations[] = array(
			"od"  => (string) $observationInfo->{"obs-dt"},
			"hm" => (float) $observationInfo->{"how-many"},
			"cm" => (float) $observationInfo->{"com-name"},
			"sn"  => (string) $observationInfo->{"sci-name"}
		);
	}
	return json_encode($observations);
}
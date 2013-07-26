<?php

header('Content-Type: application/json');

if (!isset($_POST["locationID"])) {
	exit;
}

$locationID = $_POST["locationID"];
$recency    = $_POST["recency"];

echo getHotspotObservations($locationID, $recency);


function getHotspotObservations($locationID, $recency) {
	$url = "http://ebird.org/ws1.1/data/obs/loc/recent?r=$locationID&fmt=json&back=$recency";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response = curl_exec($ch);
	curl_close($ch);      

	// wow! What amazing error checking. I stun myself.

	return $response;
}

/*
[
   {
      "comName":"Rock Pigeon",
      "howMany":12,
      "lat":49.1716971,
      "lng":-122.947197,
      "locID":"L1140384",
      "locName":"Annacis Island",
      "locationPrivate":false,
      "obsDt":"2013-02-07",
      "obsReviewed":false,
      "obsValid":true,
      "sciName":"Columba livia"
   },
   {
      "comName":"Glaucous-winged Gull",
      "howMany":1,
      "lat":49.1716971,
      "lng":-122.947197,
      "locID":"L1140384",
      "locName":"Annacis Island",
      "locationPrivate":false,
      "obsDt":"2013-02-05",
      "obsReviewed":false,
      "obsValid":true,
      "sciName":"Larus glaucescens"
   }
]*/

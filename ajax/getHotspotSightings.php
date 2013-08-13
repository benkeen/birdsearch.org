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

	return $response;
}
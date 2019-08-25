const request = require('request');

const ebirdApiToken = '30a4ftm0lcfo';


/**
 * This file contains all code for calling eBird for the actual data.
 */

const getHotspotLocations = ({ lat, lng, observationRecency }, res) => {

	// TODO surely this is better? https://ebird.org/ws2.0/data/obs/geo/recent?lat={{lat}}&lng={{lng}}

	const endpoint = 'https://ebird.org/ws2.0/ref/hotspot/geo';
	const url = `${endpoint}?lat=${lat}&lng=${lng}&dist=50&fmt=json&back=${observationRecency}`;

	request.get({ url, headers: { 'X-eBirdApiToken': ebirdApiToken }}, (error, response, body) => {
		const json = JSON.parse(body);
		const resp = json.map((row) => ({
			i: row.locId,
			n: row.locName,
			la: row.lat,
			lg: row.lng
		}));
		res.send(resp);
	}).end();
};


const getHotspotSightingsPacket = ({ locationIDs, recency }, res) => {
	const ids = locationIDs.split(',');
	const url = `https://ebird.org/ws2.0/data/obs/${ids[0]}/recent?r=${locationIDs}&back=${recency}`;
	request.get({ url, headers: { 'X-eBirdApiToken': ebirdApiToken }}, (error, response, body) => {
		const json = JSON.parse(body);
		res.send(json);
	}).end();
};


const getNotableSightings = ({ lat, lng, observationRecency }, res) => {
	const endpoint = 'https://api.ebird.org/v2/data/obs/geo/recent/notable';
	const url = `${endpoint}?lat=${lat}&lng=${lng}&back=${observationRecency}&dist=50&hotspot=false&detail=full`;

	request.get({url, headers: { 'X-eBirdApiToken': ebirdApiToken }}, (error, response, body) => {
		res.send(body);
	});
};


module.exports = {
	getHotspotLocations,
	getHotspotSightingsPacket,
	getNotableSightings
};

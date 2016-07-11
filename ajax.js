const request = require('request');
const xml2js = require('xml2js');
const _ = require('underscore');


/**
 * This file contains all code for calling eBird for the actual data.
 */


function getHotspotLocations ({ lat, lng, limitByObservationRecency, observationRecency }, expressRequest) {
  let url = `http://ebird.org/ws1.1/ref/hotspot/geo?lat=${lat}&lng=${lng}&dist=50&fmt=xml`;
  if (limitByObservationRecency == 'true') {
    url += `&back=${observationRecency}`;
  }
  request.get(url, function (error, response, body) {
    let json = [];
    xml2js.parseString(body, (parseErr, data) => {
      if (parseErr) {
        return '';
      }
      _.each(data.response.result[0].location, function (row) {
        json.push({
          i: row['loc-id'][0],
          n: row['loc-name'][0],
          la: row.lat[0],
          lg: row.lng[0]
        });
      });
      expressRequest.send(json);
    });

  }).end();
}

// function getHotspotObservations($locationID, $recency) {
//   $url = "http://ebird.org/ws1.1/data/obs/loc/recent?r=$locationID&fmt=json&back=$recency";
//
//   $ch = curl_init();
//   curl_setopt($ch, CURLOPT_URL, $url);
//   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//   $response = curl_exec($ch);
//   curl_close($ch);
//
//   return $response;
// }

function getHotspotSightings ({ locationID, recency }, res) {
  const url = `http://ebird.org/ws1.1/data/obs/loc/recent?r=${locationID}&fmt=json&back=${recency}`;
  request.get(url, function (error, response, body) {
    res.send(body);
  });
}


module.exports = {
  getHotspotLocations,
  getHotspotSightings
};

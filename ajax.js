const request = require('request');
const xml2js = require('xml2js');
const _ = require('underscore');


/**
 * Does the work of pinging eBird for the data, converting the result to JSON and sending it back to the client.
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


module.exports = {
  getHotspotLocations: getHotspotLocations
};

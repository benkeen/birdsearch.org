const request = require('request');
const xml2js = require('xml2js');
const _ = require('underscore');


/**
 * This file contains all code for calling eBird for the actual data.
 */

const getHotspotLocations = ({ lat, lng, observationRecency }, res) => {
  const endpoint = 'http://ebird.org/ws1.1/ref/hotspot/geo';
  const url = `${endpoint}?lat=${lat}&lng=${lng}&dist=50&fmt=xml&back=${observationRecency}`;
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
      res.send(json);
    });

  }).end();
};


const getHotspotSightingsPacket = ({ locationIDs, recency }, res) => {
  const locationArray = locationIDs.split(',').map((locationID) => { return 'r=' + locationID; });
  const locations = locationArray.join('&');

  const url = `http://ebird.org/ws1.1/data/obs/loc/recent?${locations}&fmt=json&back=${recency}&detail=full`;
  request.get(url, function (error, response, body) {
    res.send(body);
  });
};


const getNotableSightings = ({ lat, lng, observationRecency }, res) => {
  const endpoint = 'http://ebird.org/ws1.1/data/notable/geo/recent';
  const url = `${endpoint}?lat=${lat}&lng=${lng}&fmt=json&back=${observationRecency}&dist=250&hotspot=false&detail=full`;
  request.get(url, function (error, response, body) {
    res.send(body);
  });
};


module.exports = {
  getHotspotLocations,
  getHotspotSightingsPacket,
  getNotableSightings
};

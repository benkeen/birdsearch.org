const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const url = require('url');
const ajax = require('./ajax');
const app = express();

// serve static assets normally
app.use(express.static(__dirname + '/dist'));

app.get('/api/getHotspotLocations', (req, res) => {
  const urlParts = url.parse(req.url, true);
  const queryParams = urlParts.query;
  ajax.getHotspotLocations(queryParams, res);
});

app.get('/api/getHotspotSightingsPacket', function (req, res) {
  const urlParts = url.parse(req.url, true);
  const queryParams = urlParts.query;
  ajax.getHotspotSightingsPacket(queryParams, res);
});

app.get('/api/getNotableSightings', function (req, res) {
  const urlParts = url.parse(req.url, true);
  const queryParams = urlParts.query;
  ajax.getNotableSightings(queryParams, res);
});

// redirect everything else to index.html
app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'src', 'index.html'));
});

app.listen(port);
console.log('server started on port ' + port);

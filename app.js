const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const url = require('url');

const ajax = require('./ajax');
const app = express();

// serve static assets normally
app.use(express.static(__dirname + '/dist'));

app.get('/api/getHotspotLocations', (req, res) => {
  const url_parts = url.parse(req.url, true);
  const queryParams = url_parts.query;
  ajax.getHotspotLocations(queryParams, res);
});

app.get('/api/getHotspotSightings', function (request, response) {
  //ajax.getHotspotLocations(request);
});


app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '', 'index.html'));
});

app.listen(port);
console.log("server started on port " + port);

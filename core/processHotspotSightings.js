onmessage = function (e) {
  var locationID = e.data.locationID;
  var sightings  = e.data.sightings;
  var maxSearchDays = e.data.maxSearchDays;
  var ONE_DAY_IN_SECONDS = 24 * 60 * 60;

  var data = [];
  for (var i=0; i<maxSearchDays; i++) {
    data.push({ obs: [], numSpecies: 0, numSpeciesRunningTotal: 0 });
  }

  var now = Math.floor(Date.now() / 1000);

  var numSightings = sightings.length;
  for (var i=0; i<numSightings; i++) {

    // no timezone information is returned in the API for this field. They appear to be all local to the timezone in which
    // they were made. Bah!

    // date is of the form: 'YYYY-MM-DD HH:mm'
    var parts = sightings[i].obsDt.split(' ');
    var dateInfo = parts[0].split('-');

    // sometimes observations just have a date, not a time
    var timeInfo = [0, 0];
    if (parts.length > 1) {
      timeInfo = parts[1].split(':');
    }

    // God I miss moment. And es6.
    var obsDate = new Date(dateInfo[0], parseInt(dateInfo[1], 10) - 1, dateInfo[2], timeInfo[0], timeInfo[1], 0);
    var observationTime = Math.floor(obsDate.getTime() / 1000);

    var difference = now - observationTime;

    // ensures that all sightings are boxed into one of the last 30 days. For some reasons, some sightings end up
    // with daysAgo = 0 or 31. I think it's due to the timezone info being absent from the above
    var daysAgo = Math.ceil(difference / ONE_DAY_IN_SECONDS);
    daysAgo = (daysAgo < 1) ? 1 : daysAgo;
    daysAgo = (daysAgo > 30) ? 30 : daysAgo;

    data[daysAgo-1].obs.push(sightings[i]);
  }

  // we've added all the observation data, set the numSpecies counts
  var uniqueSpecies = {};
  var numUniqueSpecies = 0;
  for (var i=0; i<maxSearchDays; i++) {
    var currDaySightings = data[i].obs;

    // the number of species seen on the current day
    data[i].numSpecies = currDaySightings.length;

    for (var j=0; j<currDaySightings.length; j++) {
      if (currDaySightings[j].sciName in uniqueSpecies) {
        continue;
      }
      uniqueSpecies[currDaySightings[j].sciName] = null;
      numUniqueSpecies++;
    }
    //var currDaySpeciesRunningTotal = numUniqueSpecies;

    // now set the numSpeciesRunningTotal property. This is the running total seen in that time
    // range: e.g. 3 days would include the total species seen on days 1-3, 4 days would have 1-4 etc.
    data[i].numSpeciesRunningTotal = numUniqueSpecies;
  }

  postMessage({ locationID: locationID, sightings: data });
};

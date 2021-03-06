onmessage = function (e) {
	var locationIDs = e.data.locationIDs;
	var sightings = e.data.sightings;
	var maxSearchDays = e.data.maxSearchDays;
	var ONE_DAY_IN_SECONDS = 24 * 60 * 60;
	var now = Math.floor(Date.now() / 1000);

	// stores the processed data for all locations. The location ID is the top level prop
	var data = {};
	locationIDs.forEach((locationID) => {
		var template = [];
		for (var i = 0; i < maxSearchDays; i++) {
			template.push({ obs: [], numSpecies: 0, runningTotal: 0 });
		}

		data[locationID] = template;
	});


	// the sightings array contains sightings for ALL locations in the list
	var numSightings = sightings.length;
	for (var i = 0; i < numSightings; i++) {
		var locationID = sightings[i].locId;

		// no timezone information is returned in the API for this field. They appear to be all local to the timezone in which
		// they were made

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

		data[locationID][daysAgo - 1].obs.push(sightings[i]);
	}


	// we've added all the observation data, set the numSpecies counts
	locationIDs.forEach((locationID) => {
		var uniqueSpecies = {};
		var numUniqueSpecies = 0;
		for (var i = 0; i < maxSearchDays; i++) {
			var currDaySightings = data[locationID][i].obs;

			// the number of species seen on the current day
			data[locationID][i].numSpecies = currDaySightings.length;

			for (var j = 0; j < currDaySightings.length; j++) {
				if (currDaySightings[j].sciName in uniqueSpecies) {
					continue;
				}
				uniqueSpecies[currDaySightings[j].sciName] = null;
				numUniqueSpecies++;
			}

			// now set the runningTotal property. This is the running total seen in that time range: e.g. 3 days would
			// include the total species seen on days 1-3, 4 days would have 1-4 etc.
			data[locationID][i].runningTotal = numUniqueSpecies;
		}

		postMessage({ locationID: locationID, sightings: data[locationID] });
	});
};

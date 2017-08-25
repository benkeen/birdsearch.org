import { createSelector } from 'reselect';

// top-level selectors
export const env = createSelector((state) => state.env);
export const locale = createSelector((state) => state.user.locale);
export const locations = createSelector((state) => state.locations);
export const sightings = createSelector((state) => state.sightings);
export const obsRecency = createSelector((state) => state.searchSettings.observationRecency);

export const visibleLocations = createSelector((state) => state.results.visibleLocations);
export const visibleLocationSightings = createSelector((state) => state.results.locationSightings);

//locationSightings,


export const sortedLocations = createSelector(
  locations,
  visibleLocationSightings,
  obsRecency,
  (locations, locationSightings, observationRecency) => locations
);


//    this.sortedFilteredLocations = helpers.sortLocations(locations, locationSightings, searchSettings.observationRecency,
//      sort, sortDir, filter);


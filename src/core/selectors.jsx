import { createSelector } from 'reselect';

// top-level selectors
export const env = createSelector((state) => state.env);
export const locale = createSelector((state) => state.user.locale);
export const locations = createSelector((state) => state.locations);
export const sightings = createSelector((state) => state.sightings);
export const visibleLocations = createSelector((state) => state.locations);

export const sortedLocations = createSelector(
  locations,
  (locations) => locations
);


const EVENTS = {
  SELECT_TAB: "select-tab",

  ABOUT_LINK_CLICK: "aboutDialog-link-click",

  WINDOW_RESIZE: "window-resize",
  TRIGGER_WINDOW_RESIZE: "trigger-window-resize",
  SEARCH_TYPE_CHANGED: 'search-type-changed',
  SEARCH: "search",
  INIT_SEARCH: "init-search",
  BIRD_SIGHTINGS_LOADED: "bird-sightings-loaded",

  MAP: {
    BIRD_MARKERS_ADDED: 'map-bird-markers-added',
    NOTABLE_MARKERS_ADDED: 'map-notable-markers-added',
    HOTSPOT_MARKERS_ADDED: 'map-hotspot-markers-added',
    VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION: 'view-notable-sighting-single-location',
    VIEW_SIGHTINGS_SINGLE_LOCATION: 'view-sightings-single-location'
  },

  LOCATION_MOUSEOVER: 'location-mouseover',
  LOCATION_MOUSEOUT: 'location-mouseout',
  LOCATION_CLICK: 'location-click'
};

export default EVENTS;

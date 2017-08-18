// the container components for the locations panel.
import { connect } from 'react-redux';
import { Map } from './map';
import { injectIntl } from 'react-intl';


const mapStateToProps = (state) => ({
  visible: state.sightingsPanel.visible,
  updateCounter: state.sightingsPanel.updateCounter,
  locations: state.results.visibleLocations,
  sightings: state.results.locationSightings,
  selectedLocation: state.locationsPanel.selectedLocation,
  searchSettings: state.searchSettings,
  speciesFilter: state.sightingsPanel.filter,
  showScientificName: state.showScientificName,
  env: state.env,
  results: state.results,
  sort: state.sightingsPanel.sort,
  sortDir: state.sightingsPanel.sortDir
});

const mapDispatchToProps = {
//  createItem: actions.createItem,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Map));



//dispatch={dispatch}
//env={env}
//lat={mapSettings.lat}
//lng={mapSettings.lng}
//searchUpdateCounter={mapSettings.searchUpdateCounter}
//resetSearchCounter={mapSettings.resetSearchCounter}
//mapTypeId={mapSettings.mapTypeId}
//bounds={mapSettings.bounds}
//searchSettings={searchSettings}
//results={results}
//intl={intl}
//locationFilter={locationsPanel.filter}
//mapStyle={mapStyle}
//locale={user.locale}

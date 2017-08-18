// the container components for the locations panel.
import { connect } from 'react-redux';
import { SightingsPanel } from './sightings';
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SightingsPanel));

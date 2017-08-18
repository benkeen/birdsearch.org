// the container components for the locations panel.
import { connect } from 'react-redux';
import { LocationsPanel } from './locations';
import { intlShape, injectIntl } from 'react-intl';


// all of this will be derived

const mapStateToProps = (state) => ({
  visible: state.locationsPanel.visible,
  updateCounter: state.locationsPanel.updateCounter,
  sort: state.locationsPanel.sort,
  sortDir: state.locationsPanel.sortDir,
  filter: state.locationsPanel.filter,
  locations: state.results.visibleLocations,
  locationSightings: state.results.locationSightings,
  locationDataRefreshCounter: state.results.locationDataRefreshCounter, // TOTALLY remove this sucker!!!!!!
  selectedLocation: state.locationsPanel.selectedLocation,
  searchSettings: state.searchSettings,
  env: state.env
});

const mapDispatchToProps = {
//  createItem: actions.createItem,
};


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LocationsPanel));

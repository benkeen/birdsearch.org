// the container components for the locations panel.
import { connect } from 'react-redux';
import { LocationsPanel } from './locations';
import { injectIntl } from 'react-intl';
import { sortedFilteredLocations } from '../../core/selectors';

const mapStateToProps = (state) => ({
  visible: state.locationsPanel.visible,
  sort: state.locationsPanel.sort,
  sortDir: state.locationsPanel.sortDir,
  filter: state.locationsPanel.filter,
  locations: state.results.visibleLocations,
  locationSightings: state.results.locationSightings,
  sortedFilteredLocations: sortedFilteredLocations,
  selectedLocation: state.locationsPanel.selectedLocation,
  searchSettings: state.searchSettings,
  env: state.env
});

const mapDispatchToProps = {
//  createItem: actions.createItem,
};


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LocationsPanel));

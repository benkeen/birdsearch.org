import { connect } from 'react-redux';
import Map from './map';
import { injectIntl } from 'react-intl';


const mapStateToProps = (state) => ({
  env: state.env,

  // combine
  lat: state.mapSettings.lat,
  lng: state.mapSettings.lng,

//  searchUpdateCounter: state.mapSettings.searchUpdateCounter,
//  resetSearchCounter: state.mapSettings.resetSearchCounter,

  mapTypeId: state.mapSettings.mapTypeId,
  bounds: state.mapSettings.bounds,

  searchSettings: state.searchSettings,
  results: state.results,
  locationFilter: state.locationsPanel.filter,
  mapStyle: state.mapStyle,
  locale: state.user.locale
});

const mapDispatchToProps = {
//  createItem: actions.createItem,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Map));
